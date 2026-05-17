const NP_KEY='upd-np-notes-v2',NP_TAGS_KEY='upd-np-tags',NP_PREFS_KEY='upd-np-prefs';
let _npNotes=[],_npTags=[];
let _npActiveId=null,_npMode='edit',_npSaveTimer=null;
// _npFindMatches now stores {index,length} objects for regex support
let _npFindMatches=[],_npFindIdx=0,_npRegexMode=false;
let _npSortBy='modified',_npSidebarView='notes',_npCompact=false;
let _npSidebarSearch='',_npTagFilter=null,_npDragId=null;
let _npSelectMode=false,_npSelectedIds=new Set();
// New feature state
let _npSplitView=false,_npScrollSync=true,_npTypewriter=false,_npSmartTypo=true;
let _npGlobalSearchActive=false,_npGlobalQ='';

// ── Data ──────────────────────────────────────────────────────────────────────

function _npLoad(){
  try{_npNotes=JSON.parse(localStorage.getItem(NP_KEY))||[];}catch(e){_npNotes=[];}
  try{_npTags=JSON.parse(localStorage.getItem(NP_TAGS_KEY))||[];}catch(e){_npTags=[];}
  try{
    const p=JSON.parse(localStorage.getItem(NP_PREFS_KEY))||{};
    _npSortBy=p.sortBy||'modified';
    _npCompact=!!p.compact;
    _npSidebarView=p.sidebarView||'notes';
    _npTagFilter=p.tagFilter??null;
    _npSplitView=!!p.splitView;
    _npScrollSync=p.scrollSync!==undefined?!!p.scrollSync:true;
    _npTypewriter=!!p.typewriter;
    _npSmartTypo=p.smartTypo!==undefined?!!p.smartTypo:true;
  }catch(e){}
}
function _npWrite(){localStorage.setItem(NP_KEY,JSON.stringify(_npNotes));}
function _npWriteTags(){localStorage.setItem(NP_TAGS_KEY,JSON.stringify(_npTags));}
function _npWritePrefs(){localStorage.setItem(NP_PREFS_KEY,JSON.stringify({sortBy:_npSortBy,compact:_npCompact,sidebarView:_npSidebarView,tagFilter:_npTagFilter,splitView:_npSplitView,scrollSync:_npScrollSync,typewriter:_npTypewriter,smartTypo:_npSmartTypo}));}
function _npActiveNote(){return _npNotes.find(n=>n.id===_npActiveId)||null;}
function _npNoteDefaults(p={}){return{id:Date.now(),name:'',content:'',modified:Date.now(),pinned:false,color:null,emoji:null,tags:[],archived:false,deleted:false,deletedAt:null,locked:false,...p};}

function _npMigrate(){
  if(localStorage.getItem(NP_KEY))return;
  const old=localStorage.getItem('upd-notepad');
  let saved=[];try{saved=JSON.parse(localStorage.getItem('upd-notepad-saved'))||[];}catch(e){}
  for(const n of [...saved].reverse())_npNotes.push(_npNoteDefaults({id:n.id||Date.now(),name:n.name,content:n.content,modified:n.id||Date.now()}));
  if(old)_npNotes.unshift(_npNoteDefaults({name:'Scratch Pad',content:old}));
  if(_npNotes.length)_npWrite();
}

function _npCleanTrash(){
  const cut=Date.now()-30*24*60*60*1000;
  const before=_npNotes.length;
  _npNotes=_npNotes.filter(n=>!n.deleted||(n.deletedAt&&n.deletedAt>cut));
  if(_npNotes.length!==before)_npWrite();
}

function _npWordCount(c){return c.trim()?c.trim().split(/\s+/).length:0;}

// ── Version History ───────────────────────────────────────────────────────────

const NP_VER_PREFIX='upd-np-ver-';
const NP_VER_MAX=20;

function _npSaveVersion(noteId,content){
  try{
    const key=NP_VER_PREFIX+noteId;
    let vers=[];try{vers=JSON.parse(localStorage.getItem(key))||[];}catch(e){}
    const now=Date.now();
    const last=vers[vers.length-1];
    const needSave=!last||(now-last.ts>60000)||(Math.abs(content.length-(last.content||'').length)>100);
    if(!needSave)return;
    vers.push({ts:now,content});
    if(vers.length>NP_VER_MAX)vers=vers.slice(vers.length-NP_VER_MAX);
    try{localStorage.setItem(key,JSON.stringify(vers));}catch(e){
      // quota exceeded: drop oldest entries until it fits
      while(vers.length>1){vers.shift();try{localStorage.setItem(key,JSON.stringify(vers));break;}catch(ex){}}
    }
  }catch(e){}
}

function npShowVersionHistory(){
  const note=_npActiveNote();if(!note){alert('No active note.');return;}
  const key=NP_VER_PREFIX+note.id;
  let vers=[];try{vers=JSON.parse(localStorage.getItem(key))||[];}catch(e){}
  const ex=document.getElementById('np-ver-modal');if(ex)ex.remove();
  const overlay=document.createElement('div');overlay.id='np-ver-modal';overlay.className='np-tag-mgr-overlay';
  const list=vers.length?[...vers].reverse().map((v,i)=>{
    const d=new Date(v.ts).toLocaleString('en-AU',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',hour12:false});
    const wc=_npWordCount(v.content||'');
    return`<div class="np-ver-item">
      <div class="np-ver-meta"><span>${d}</span><span>${wc} words</span></div>
      <button class="np-btn" onclick="_npRestoreVersion(${vers.length-1-i},'${note.id}')"><i class="fa-solid fa-rotate-left"></i> Restore</button>
    </div>`;
  }).join(''):'<div class="np-note-empty">No versions saved yet.</div>';
  overlay.innerHTML=`<div class="np-tag-mgr" style="width:380px">
    <div class="np-tag-mgr-hd"><span><i class="fa-solid fa-clock-rotate-left"></i> Version History</span><button onclick="document.getElementById('np-ver-modal').remove()"><i class="fa-solid fa-xmark"></i></button></div>
    <div class="np-ver-list">${list}</div>
    <div class="np-tag-create"><button class="np-btn np-btn-danger" onclick="_npClearVersionHistory('${note.id}')"><i class="fa-solid fa-trash"></i> Clear history</button></div>
  </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.remove();});
  overlay.addEventListener('keydown',e=>{if(e.key==='Escape')overlay.remove();});
}

function _npRestoreVersion(idx,noteIdStr){
  const noteId=+noteIdStr;
  const key=NP_VER_PREFIX+noteId;
  let vers=[];try{vers=JSON.parse(localStorage.getItem(key))||[];}catch(e){}
  const v=vers[idx];if(!v)return;
  const ta=document.getElementById('np-area');if(!ta)return;
  ta.value=v.content||'';_npInput();
  document.getElementById('np-ver-modal')?.remove();
}

function _npClearVersionHistory(noteIdStr){
  localStorage.removeItem(NP_VER_PREFIX+noteIdStr);
  document.getElementById('np-ver-modal')?.remove();
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function _npGetSidebarNotes(){
  let notes=_npNotes.filter(n=>{
    if(_npSidebarView==='archived')return n.archived&&!n.deleted;
    if(_npSidebarView==='trash')return n.deleted;
    return!n.archived&&!n.deleted;
  });
  if(_npSidebarSearch){
    const q=_npSidebarSearch;
    notes=notes.filter(n=>(n.name||'').toLowerCase().includes(q)||n.content.toLowerCase().includes(q));
  }
  if(_npTagFilter!==null)notes=notes.filter(n=>(n.tags||[]).includes(_npTagFilter));
  const s=[...notes];
  switch(_npSortBy){
    case'name':s.sort((a,b)=>(a.name||'').localeCompare(b.name||''));break;
    case'created':s.sort((a,b)=>b.id-a.id);break;
    case'words':s.sort((a,b)=>_npWordCount(b.content)-_npWordCount(a.content));break;
    case'manual':break;
    default:s.sort((a,b)=>b.modified-a.modified);
  }
  if(_npSidebarView==='notes'){
    return{pinned:s.filter(n=>n.pinned),unpinned:s.filter(n=>!n.pinned)};
  }
  return{pinned:[],unpinned:s};
}

function _npRenderSidebar(){
  // If global search is active, show search results instead
  if(_npGlobalSearchActive){_npRenderGlobalSearch();return;}
  const el=document.getElementById('np-note-list');if(!el)return;
  _npRenderTagFilter();
  const{pinned,unpinned}=_npGetSidebarNotes();
  const all=[...pinned,...unpinned];
  if(!all.length){
    const msg=_npSidebarView==='trash'?'Trash is empty':_npSidebarView==='archived'?'No archived notes':_npSidebarSearch?'No matching notes':'No notes yet';
    el.innerHTML=`<div class="np-note-empty">${msg}</div>`;return;
  }
  let html='';
  if(pinned.length&&_npSidebarView==='notes'){
    html+=pinned.map(n=>_npNoteItemHtml(n)).join('');
    if(unpinned.length)html+='<div class="np-pin-sep"><span>Other Notes</span></div>';
  }
  html+=unpinned.map(n=>_npNoteItemHtml(n)).join('');
  el.innerHTML=html;
  if(_npSidebarView==='notes')_npInitDrag();
}

function _npNoteItemHtml(n){
  const active=n.id===_npActiveId;
  const name=escapeHtml(n.name||'Untitled note');
  const ts=n.modified?new Date(n.modified).toLocaleDateString('en-AU',{day:'2-digit',month:'short'}):'';
  const words=_npWordCount(n.content);
  const preview=n.content.replace(/[#*`>~\[\]!]/g,'').split('\n').map(l=>l.trim()).find(l=>l)?.slice(0,55)||'';
  const colorStyle=n.color?`style="border-left-color:${n.color}"`:'';
  const tagPills=(n.tags||[]).map(tid=>{
    const tag=_npTags.find(t=>t.id===tid);if(!tag)return'';
    return`<span class="np-note-tag-pill" style="background:${tag.color}22;color:${tag.color};border-color:${tag.color}55">${escapeHtml(tag.name)}</span>`;
  }).join('');

  if(_npSidebarView==='trash'){
    const d=n.deletedAt?new Date(n.deletedAt).toLocaleDateString('en-AU',{day:'2-digit',month:'short'}):'';
    if(_npSelectMode){
      const sel=_npSelectedIds.has(n.id);
      return`<div class="np-note-item${sel?' np-selected':''}" data-id="${n.id}" onclick="_npToggleSelectNote(${n.id},event)">
        <div class="np-note-sel-check"><i class="${sel?'fa-solid fa-square-check':'fa-regular fa-square'}"></i></div>
        <div class="np-note-content-area">
          <div class="np-note-item-top"><span class="np-note-item-name">${name}</span></div>
          <div class="np-note-item-meta">Deleted ${d}</div>
        </div>
      </div>`;
    }
    return`<div class="np-note-item${active?' active':''}" data-id="${n.id}">
      <div class="np-note-content-area">
        <div class="np-note-item-top"><span class="np-note-item-name">${name}</span></div>
        <div class="np-note-item-meta">Deleted ${d}</div>
      </div>
      <div class="np-note-btns">
        <button class="np-note-action-btn" onclick="npRestoreNote(${n.id},event)" title="Restore"><i class="fa-solid fa-rotate-left"></i></button>
        <button class="np-note-action-btn np-btn-red" onclick="npPermanentDelete(${n.id},event)" title="Delete forever"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>`;
  }

  if(_npSidebarView==='archived'){
    if(_npSelectMode){
      const sel=_npSelectedIds.has(n.id);
      return`<div class="np-note-item${sel?' np-selected':''}" data-id="${n.id}" ${colorStyle} onclick="_npToggleSelectNote(${n.id},event)">
        <div class="np-note-sel-check"><i class="${sel?'fa-solid fa-square-check':'fa-regular fa-square'}"></i></div>
        <div class="np-note-content-area">
          <div class="np-note-item-top">${n.emoji?`<span class="np-note-emoji-icon">${n.emoji}</span>`:''}<span class="np-note-item-name">${name}</span></div>
          ${!_npCompact?`<div class="np-note-item-meta">${ts}${words?' · '+words+'w':''}</div>`:''}
        </div>
      </div>`;
    }
    return`<div class="np-note-item${active?' active':''}" data-id="${n.id}" ${colorStyle} onclick="npOpenNote(${n.id})">
      <div class="np-note-content-area">
        <div class="np-note-item-top">${n.emoji?`<span class="np-note-emoji-icon">${n.emoji}</span>`:''}<span class="np-note-item-name">${name}</span></div>
        ${!_npCompact?`<div class="np-note-item-meta">${ts}${words?' · '+words+'w':''}</div>${preview?`<div class="np-note-item-preview">${escapeHtml(preview)}</div>`:''}`:''}
      </div>
      <div class="np-note-btns">
        <button class="np-note-action-btn" onclick="npRestoreNote(${n.id},event)" title="Restore"><i class="fa-solid fa-rotate-left"></i></button>
      </div>
    </div>`;
  }

  if(_npSelectMode){
    const sel=_npSelectedIds.has(n.id);
    return`<div class="np-note-item${sel?' np-selected':''}" data-id="${n.id}" ${colorStyle} onclick="_npToggleSelectNote(${n.id},event)">
      <div class="np-note-sel-check"><i class="${sel?'fa-solid fa-square-check':'fa-regular fa-square'}"></i></div>
      <div class="np-note-content-area">
        <div class="np-note-item-top">${n.emoji?`<span class="np-note-emoji-icon">${n.emoji}</span>`:''}<span class="np-note-item-name">${name}</span></div>
        ${!_npCompact?`<div class="np-note-item-meta">${ts}${words?' · '+words+'w':''}</div>`:''}
      </div>
    </div>`;
  }

  return`<div class="np-note-item${active?' active':''}${n.pinned?' np-pinned':''}" data-id="${n.id}" ${colorStyle}
    draggable="true" ondragstart="_npDragStart(event,${n.id})" ondragover="_npDragOver(event)" ondrop="_npDrop(event,${n.id})" ondragleave="_npDragLeave(event)">
    <div class="np-note-content-area" onclick="npOpenNote(${n.id})">
      <div class="np-note-item-top">
        ${n.emoji?`<span class="np-note-emoji-icon">${n.emoji}</span>`:''}
        <span class="np-note-item-name">${name}</span>
      </div>
      ${tagPills?`<div class="np-note-tags-row">${tagPills}</div>`:''}
      ${!_npCompact?`<div class="np-note-item-meta">${ts}${words?' · '+words+'w':''}</div>${preview?`<div class="np-note-item-preview">${escapeHtml(preview)}</div>`:''}`:''}
    </div>
    <div class="np-note-btns">
      <button class="np-note-action-btn" onclick="npCopyNoteLink(${n.id},event)" title="Copy deep link"><i class="fa-solid fa-link"></i></button>
      <button class="np-note-pin-btn${n.pinned?' active':''}" onclick="npTogglePin(${n.id},event)" title="${n.pinned?'Unpin':'Pin'}"><i class="fa-solid fa-thumbtack"></i></button>
      <button class="np-note-action-btn" onclick="npShowNoteOpts(${n.id},event)" title="Options"><i class="fa-solid fa-ellipsis-vertical"></i></button>
    </div>
  </div>`;
}

// ── Global Search (Feature 14) ────────────────────────────────────────────────

function npGlobalSearch(){
  if(_npGlobalSearchActive){_npExitGlobalSearch();return;}
  _npGlobalSearchActive=true;
  const btn=document.getElementById('np-gs-btn');if(btn)btn.classList.add('active');
  // Show search input area at top of sidebar list
  const list=document.getElementById('np-note-list');if(!list)return;
  list.innerHTML=`<div class="np-gs-wrap" id="np-gs-wrap">
    <div class="np-gs-input-row">
      <input type="text" id="np-gs-input" class="np-gs-input" placeholder="Search all notes…" oninput="_npGlobalSearchUpdate(this.value)" autofocus>
      <button class="np-sidebar-icon-btn" onclick="_npExitGlobalSearch()" title="Exit search"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div id="np-gs-results" class="np-gs-results"></div>
  </div>`;
  document.getElementById('np-gs-input')?.focus();
  document.getElementById('np-gs-input')?.addEventListener('keydown',e=>{if(e.key==='Escape')_npExitGlobalSearch();});
}

function _npExitGlobalSearch(){
  _npGlobalSearchActive=false;_npGlobalQ='';
  const btn=document.getElementById('np-gs-btn');if(btn)btn.classList.remove('active');
  _npRenderSidebar();
}

// Also expose as npGlobalSearch-exit alias
function npGlobalSearch_exit(){_npExitGlobalSearch();}

function _npGlobalSearchUpdate(q){
  _npGlobalQ=q.toLowerCase().trim();
  const res=document.getElementById('np-gs-results');if(!res)return;
  if(!_npGlobalQ){res.innerHTML='';return;}
  const hits=_npNotes.filter(n=>!n.deleted&&!n.archived).map(n=>{
    const nameMatch=(n.name||'').toLowerCase().includes(_npGlobalQ);
    const contentLines=n.content.split('\n');
    const matchLine=contentLines.find(l=>l.toLowerCase().includes(_npGlobalQ));
    if(!nameMatch&&!matchLine)return null;
    const snippet=matchLine?matchLine.trim().slice(0,80):'';
    return{n,snippet,nameMatch};
  }).filter(Boolean);
  if(!hits.length){res.innerHTML='<div class="np-note-empty">No results</div>';return;}
  res.innerHTML=hits.map(({n,snippet,nameMatch})=>{
    const name=escapeHtml(n.name||'Untitled note');
    const hl=q=>escapeHtml(q).replace(new RegExp(_npGlobalQ.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi'),m=>`<mark class="np-gs-match">${escapeHtml(m)}</mark>`);
    return`<div class="np-note-item${n.id===_npActiveId?' active':''}" onclick="npOpenNote(${n.id});_npExitGlobalSearch()">
      <div class="np-note-content-area">
        <div class="np-note-item-top"><span class="np-note-item-name">${hl(n.name||'Untitled note')}</span></div>
        ${snippet?`<div class="np-note-item-preview">${hl(snippet)}</div>`:''}
      </div>
    </div>`;
  }).join('');
}

function _npRenderGlobalSearch(){
  // Re-run search results when sidebar re-renders in global search mode
  _npGlobalSearchUpdate(_npGlobalQ);
}

// ── Tag filter ────────────────────────────────────────────────────────────────

function _npRenderTagFilter(){
  const el=document.getElementById('np-tag-filter');if(!el)return;
  if(!_npTags.length){el.style.display='none';return;}
  el.style.display='flex';
  el.innerHTML=`<button class="np-tag-fp${_npTagFilter===null?' active':''}" onclick="npSetTagFilter(null)">All</button>`+
    _npTags.map(t=>`<button class="np-tag-fp${_npTagFilter===t.id?' active':''}" style="--tc:${t.color}" onclick="npSetTagFilter(${t.id})">${escapeHtml(t.name)}</button>`).join('');
}

function npSetTagFilter(id){_npTagFilter=id;_npWritePrefs();_npRenderSidebar();}

// ── Drag to reorder ───────────────────────────────────────────────────────────

function _npDragStart(e,id){
  _npDragId=id;e.dataTransfer.effectAllowed='move';
  setTimeout(()=>e.target.classList.add('np-dragging'),0);
}
function _npDragOver(e){e.preventDefault();e.currentTarget.classList.add('np-drag-over');}
function _npDragLeave(e){e.currentTarget.classList.remove('np-drag-over');}
function _npDrop(e,targetId){
  e.preventDefault();e.currentTarget.classList.remove('np-drag-over');
  if(_npDragId===targetId)return;
  const fi=_npNotes.findIndex(n=>n.id===_npDragId),ti=_npNotes.findIndex(n=>n.id===targetId);
  if(fi===-1||ti===-1)return;
  const[moved]=_npNotes.splice(fi,1);_npNotes.splice(ti,0,moved);
  _npSortBy='manual';
  _npWritePrefs();
  const sel=document.getElementById('np-sort-sel');if(sel)sel.value='manual';
  _npWrite();_npRenderSidebar();_npDragId=null;
}
function _npInitDrag(){
  document.querySelectorAll('.np-note-item[draggable]').forEach(el=>{
    el.addEventListener('dragend',()=>{
      el.classList.remove('np-dragging');
      document.querySelectorAll('.np-drag-over').forEach(e=>e.classList.remove('np-drag-over'));
    });
  });
}

// ── Multi-select ──────────────────────────────────────────────────────────────

function _npExitSelectMode(){
  _npSelectMode=false;_npSelectedIds.clear();
  const btn=document.getElementById('np-select-btn');const bar=document.getElementById('np-select-bar');
  if(btn)btn.classList.remove('active');if(bar)bar.style.display='none';
}

function _npUpdateSelectBarActions(){
  const el=document.getElementById('np-select-bar-btns');if(!el)return;
  if(_npSidebarView==='trash'){
    el.innerHTML=`
      <button class="np-btn" onclick="npRestoreSelected()"><i class="fa-solid fa-rotate-left"></i> Restore</button>
      <button class="np-btn np-btn-danger" onclick="npPermanentDeleteSelected()"><i class="fa-solid fa-trash"></i> Delete</button>`;
  }else if(_npSidebarView==='archived'){
    el.innerHTML=`
      <button class="np-btn" onclick="npRestoreSelected()"><i class="fa-solid fa-rotate-left"></i> Restore</button>
      <button class="np-btn np-btn-danger" onclick="npDeleteSelected()"><i class="fa-solid fa-trash"></i> Trash</button>`;
  }else{
    el.innerHTML=`
      <button class="np-btn" onclick="npArchiveSelected()"><i class="fa-solid fa-box-archive"></i> Archive</button>
      <button class="np-btn np-btn-danger" onclick="npDeleteSelected()"><i class="fa-solid fa-trash"></i> Delete</button>`;
  }
}

function npToggleSelectMode(){
  _npSelectMode=!_npSelectMode;
  _npSelectedIds.clear();
  const btn=document.getElementById('np-select-btn');
  const bar=document.getElementById('np-select-bar');
  if(btn)btn.classList.toggle('active',_npSelectMode);
  if(bar)bar.style.display=_npSelectMode?'flex':'none';
  if(_npSelectMode){_npUpdateSelectBarActions();document.getElementById('np-select-count').textContent='0 selected';}
  _npRenderSidebar();
}

function _npToggleSelectNote(id,e){
  e.stopPropagation();
  if(_npSelectedIds.has(id))_npSelectedIds.delete(id);
  else _npSelectedIds.add(id);
  const sel=_npSelectedIds.has(id);
  const countEl=document.getElementById('np-select-count');
  if(countEl)countEl.textContent=`${_npSelectedIds.size} selected`;
  const item=document.querySelector(`.np-note-item[data-id="${id}"]`);
  if(item){
    item.classList.toggle('np-selected',sel);
    const icon=item.querySelector('.np-note-sel-check i');
    if(icon)icon.className=sel?'fa-solid fa-square-check':'fa-regular fa-square';
  }
}

function npArchiveSelected(){
  if(!_npSelectedIds.size)return;
  const count=_npSelectedIds.size;
  _npModal(`Archive ${count} note${count!==1?'s':''}?`,()=>{
    _npNotes.forEach(n=>{if(_npSelectedIds.has(n.id)){n.archived=true;n.pinned=false;}});
    _npWrite();
    if(_npSelectedIds.has(_npActiveId)){_npActiveId=_npNotes.find(n=>!n.archived&&!n.deleted)?.id||null;if(!_npActiveId)npNewNote();else _npLoadActive();}
    _npExitSelectMode();_npRenderSidebar();
  });
}

function npDeleteSelected(){
  if(!_npSelectedIds.size)return;
  const count=_npSelectedIds.size;
  _npModal(`Move ${count} note${count!==1?'s':''} to trash?`,()=>{
    const now=Date.now();
    _npNotes.forEach(n=>{if(_npSelectedIds.has(n.id)){n.deleted=true;n.deletedAt=now;n.pinned=false;}});
    _npWrite();
    if(_npSelectedIds.has(_npActiveId)){_npActiveId=_npNotes.find(n=>!n.archived&&!n.deleted)?.id||null;if(!_npActiveId)npNewNote();else _npLoadActive();}
    _npExitSelectMode();_npRenderSidebar();
  });
}

function npRestoreSelected(){
  if(!_npSelectedIds.size)return;
  const count=_npSelectedIds.size;
  _npModal(`Restore ${count} note${count!==1?'s':''}?`,()=>{
    _npNotes.forEach(n=>{if(_npSelectedIds.has(n.id)){n.archived=false;n.deleted=false;n.deletedAt=null;}});
    _npWrite();_npExitSelectMode();_npRenderSidebar();
  });
}

function npPermanentDeleteSelected(){
  if(!_npSelectedIds.size)return;
  const count=_npSelectedIds.size;
  _npModal(`Permanently delete ${count} note${count!==1?'s':''}? This cannot be undone.`,()=>{
    _npNotes=_npNotes.filter(n=>!_npSelectedIds.has(n.id));
    _npWrite();_npExitSelectMode();_npRenderSidebar();
  });
}

// ── Note operations ───────────────────────────────────────────────────────────

function npNewNote(){
  _npFlushSave();
  const note=_npNoteDefaults();
  _npNotes.unshift(note);_npWrite();
  _npActiveId=note.id;_npSidebarView='notes';
  _npUpdateViewTabs();_npRenderSidebar();_npLoadActive();
  document.getElementById('np-note-title')?.focus();
}

function npOpenNote(id){
  if(id===_npActiveId)return;
  _npFlushSave();_npActiveId=id;_npRenderSidebar();_npLoadActive();
}

function npCopyNoteLink(id,e){
  e.stopPropagation();
  const url=location.href.split('?')[0]+'?note='+id;
  navigator.clipboard.writeText(url).then(()=>{
    const btn=e.target.closest('button');
    if(btn){const orig=btn.innerHTML;btn.innerHTML='<i class="fa-solid fa-check"></i>';setTimeout(()=>{btn.innerHTML=orig;},1800);}
  });
}

function _npLoadActive(){
  const note=_npActiveNote();
  const ta=document.getElementById('np-area');
  const t=document.getElementById('np-note-title');
  if(!ta)return;
  ta.value=note?note.content:'';
  if(t)t.value=note?(note.name||''):'';
  _npUpdateCount();
  _npApplyLockState();
  if(_npMode==='preview')_npRenderPreview();
  else if(_npSplitView){_npRenderPreview();}
  else ta.focus();
}

function npRenameActive(){
  const note=_npActiveNote();const t=document.getElementById('np-note-title');
  if(!note||!t)return;
  note.name=t.value;note.modified=Date.now();_npWrite();_npRenderSidebar();
}

function npTogglePin(id,e){
  e.stopPropagation();
  const note=_npNotes.find(n=>n.id===id);if(!note)return;
  note.pinned=!note.pinned;_npWrite();_npRenderSidebar();
}

function npSetNoteColor(id,color){
  const note=_npNotes.find(n=>n.id===id);if(!note)return;
  note.color=color||null;_npWrite();_npRenderSidebar();
}

function npSetNoteEmoji(id,val){
  const note=_npNotes.find(n=>n.id===id);if(!note)return;
  const m=val.match(/\p{Emoji}/u);
  note.emoji=m?m[0]:val.trim().slice(0,2)||null;
  _npWrite();_npRenderSidebar();
}

function npToggleNoteTag(noteId,tagId){
  const note=_npNotes.find(n=>n.id===noteId);if(!note)return;
  if(!note.tags)note.tags=[];
  const i=note.tags.indexOf(tagId);
  if(i===-1)note.tags.push(tagId);else note.tags.splice(i,1);
  _npWrite();_npRenderSidebar();
}

function npArchiveNote(id){
  const note=_npNotes.find(n=>n.id===id);if(!note)return;
  note.archived=true;note.pinned=false;_npWrite();
  if(_npActiveId===id){_npActiveId=_npNotes.find(n=>!n.archived&&!n.deleted)?.id||null;if(!_npActiveId){npNewNote();return;}_npLoadActive();}
  _npRenderSidebar();_npCloseOpts();
}

function npRestoreNote(id,e){
  if(e)e.stopPropagation();
  const note=_npNotes.find(n=>n.id===id);if(!note)return;
  note.archived=false;note.deleted=false;note.deletedAt=null;_npWrite();_npRenderSidebar();
}

function npDeleteNote(id,e){
  if(e)e.stopPropagation();
  const note=_npNotes.find(n=>n.id===id);if(!note)return;
  note.deleted=true;note.deletedAt=Date.now();note.pinned=false;_npWrite();
  if(_npActiveId===id){
    _npActiveId=_npNotes.find(n=>!n.archived&&!n.deleted&&n.id!==id)?.id||null;
    if(!_npActiveId){npNewNote();return;}_npLoadActive();
  }
  _npRenderSidebar();_npCloseOpts();
}

function npPermanentDelete(id,e){
  if(e)e.stopPropagation();
  const note=_npNotes.find(n=>n.id===id);if(!note)return;
  _npModal(`Permanently delete "${escapeHtml(note.name||'this note')}"? This cannot be undone.`,()=>{
    _npNotes=_npNotes.filter(n=>n.id!==id);_npWrite();_npRenderSidebar();
  });
}

function npEmptyTrash(){
  const count=_npNotes.filter(n=>n.deleted).length;if(!count)return;
  _npModal(`Permanently delete all ${count} note${count!==1?'s':''} in trash?`,()=>{
    _npNotes=_npNotes.filter(n=>!n.deleted);_npWrite();_npRenderSidebar();
  });
}

function npDuplicateNoteById(id){
  const note=_npNotes.find(n=>n.id===id);if(!note)return;
  const copy=_npNoteDefaults({name:(note.name||'Untitled')+' (copy)',content:note.content,tags:[...(note.tags||[])],color:note.color,emoji:note.emoji});
  _npNotes.splice(_npNotes.findIndex(n=>n.id===id)+1,0,copy);
  _npWrite();_npRenderSidebar();_npCloseOpts();
}

function npDuplicateNote(){
  if(_npActiveId)npDuplicateNoteById(_npActiveId);
}

function npMergeNote(){
  const active=_npActiveNote();if(!active)return;
  const others=_npNotes.filter(n=>n.id!==_npActiveId&&!n.archived&&!n.deleted);
  if(!others.length){alert('No other notes to merge with.');return;}
  _npModalHtml(
    `<div class="np-merge-label">Merge <strong>${escapeHtml(active.name||'this note')}</strong> with:</div>
     <select id="np-merge-sel" class="np-merge-sel">${others.map(n=>`<option value="${n.id}">${escapeHtml(n.name||'Untitled note')}</option>`).join('')}</select>
     <div class="np-merge-hint">The selected note's content will be appended below a divider, then moved to trash.</div>`,
    'Merge',()=>{
      const selId=+document.getElementById('np-merge-sel').value;
      const other=_npNotes.find(n=>n.id===selId);if(!other)return;
      const ta=document.getElementById('np-area');
      if(ta){ta.value=ta.value+'\n\n---\n\n'+other.content;_npInput();}
      other.deleted=true;other.deletedAt=Date.now();_npWrite();_npRenderSidebar();
    }
  );
}

// ── Lock Note (Feature 7) ─────────────────────────────────────────────────────

function npToggleLock(){
  const note=_npActiveNote();if(!note)return;
  note.locked=!note.locked;_npWrite();_npApplyLockState();
}

function _npApplyLockState(){
  const note=_npActiveNote();
  const ta=document.getElementById('np-area');
  const fmt=document.getElementById('np-format-bar');
  const titleInp=document.getElementById('np-note-title');
  const lockBtn=document.getElementById('np-lock-btn');
  const locked=!!(note&&note.locked);
  if(ta)ta.readOnly=locked;
  if(fmt){fmt.style.opacity=locked?'0.4':'';fmt.style.pointerEvents=locked?'none':'';}
  if(titleInp)titleInp.readOnly=locked;
  if(lockBtn){
    const icon=lockBtn.querySelector('i');
    if(icon)icon.className=locked?'fa-solid fa-lock':'fa-solid fa-lock-open';
    lockBtn.classList.toggle('active',locked);
  }
}

// ── Open in New Window (Feature 8) ───────────────────────────────────────────

function npOpenInNewWindow(){
  if(!_npActiveId)return;
  window.open(`notepad.html?note=${_npActiveId}`,'_blank');
}

// ── Tags ──────────────────────────────────────────────────────────────────────

const NP_TAG_COLORS=['#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899'];
let _npSelTagColor=NP_TAG_COLORS[0];

function npShowTagManager(){
  const ex=document.getElementById('np-tag-mgr');if(ex){ex.remove();return;}
  const overlay=document.createElement('div');
  overlay.id='np-tag-mgr';overlay.className='np-tag-mgr-overlay';
  overlay.innerHTML=`<div class="np-tag-mgr">
    <div class="np-tag-mgr-hd"><span><i class="fa-solid fa-tags"></i> Manage Tags</span><button onclick="document.getElementById('np-tag-mgr').remove()"><i class="fa-solid fa-xmark"></i></button></div>
    <div id="np-tag-mgr-list" class="np-tag-mgr-list"></div>
    <div class="np-tag-create">
      <input class="np-tag-name-inp" id="np-tag-name-inp" placeholder="New tag name…" maxlength="20">
      <div class="np-tag-color-row" id="np-tag-color-row">${NP_TAG_COLORS.map((c,i)=>`<button class="np-tag-color-sw${i===0?' active':''}" style="background:${c}" onclick="_npSelTagColor='${c}';document.querySelectorAll('.np-tag-color-sw').forEach(b=>b.classList.remove('active'));this.classList.add('active')"></button>`).join('')}</div>
      <button class="np-btn" onclick="_npCreateTag()"><i class="fa-solid fa-plus"></i> Create</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.remove();});
  document.getElementById('np-tag-name-inp')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();_npCreateTag();}});
  _npRenderTagMgrList();
}

function _npCreateTag(){
  const inp=document.getElementById('np-tag-name-inp');if(!inp)return;
  const name=inp.value.trim();if(!name){inp.focus();return;}
  _npTags.push({id:Date.now(),name,color:_npSelTagColor});
  _npWriteTags();inp.value='';_npRenderTagMgrList();_npRenderTagFilter();
}

function npDeleteTag(id){
  _npTags=_npTags.filter(t=>t.id!==id);
  _npNotes.forEach(n=>{n.tags=(n.tags||[]).filter(tid=>tid!==id);});
  _npWriteTags();_npWrite();_npRenderTagMgrList();_npRenderTagFilter();_npRenderSidebar();
  if(_npTagFilter===id){_npTagFilter=null;_npWritePrefs();}
}

function _npRenderTagMgrList(){
  const el=document.getElementById('np-tag-mgr-list');if(!el)return;
  if(!_npTags.length){el.innerHTML='<div class="np-note-empty">No tags yet</div>';return;}
  el.innerHTML=_npTags.map(t=>`<div class="np-tag-mgr-item">
    <span class="np-tag-mgr-dot" style="background:${t.color}"></span>
    <span class="np-tag-mgr-name">${escapeHtml(t.name)}</span>
    <button class="np-note-action-btn np-btn-red" onclick="npDeleteTag(${t.id})"><i class="fa-solid fa-trash"></i></button>
  </div>`).join('');
}

// ── Note options popup ────────────────────────────────────────────────────────

const NP_COLORS=['','#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899','#6b7280'];

function npShowNoteOpts(id,e){
  e.stopPropagation();_npCloseOpts();
  const note=_npNotes.find(n=>n.id===id);if(!note)return;
  const tagRows=_npTags.map(t=>{
    const has=(note.tags||[]).includes(t.id);
    return`<label class="np-opts-tag-lbl"><input type="checkbox"${has?' checked':''} onchange="npToggleNoteTag(${id},${t.id})"><span class="np-opts-tag-dot" style="background:${t.color}"></span>${escapeHtml(t.name)}</label>`;
  }).join('');
  const popup=document.createElement('div');
  popup.id='np-opts-popup';popup.className='np-opts-popup';
  popup.innerHTML=`
    <div class="np-opts-section">
      <div class="np-opts-lbl">Color</div>
      <div class="np-opts-color-row">
        <button class="np-opts-cpick-btn" onclick="npOpenColorPicker('note-${id}',this)">
          <span class="np-opts-cpick-swatch" style="background:${note.color||'transparent'};${note.color?'':'outline:1px dashed var(--border)'}"></span>
          <span class="np-opts-cpick-lbl">${note.color||'None'}</span>
          <i class="fa-solid fa-chevron-right" style="font-size:9px;opacity:.35;margin-left:auto;flex-shrink:0"></i>
        </button>
        ${note.color?`<button class="np-opts-cpick-clear" onclick="npSetNoteColor(${id},'');_npRefreshOptsColor(${id})" title="Clear colour"><i class="fa-solid fa-xmark"></i></button>`:''}
      </div>
    </div>
    <div class="np-opts-section">
      <div class="np-opts-lbl">Emoji</div>
      <input class="np-emoji-inp" type="text" placeholder="Paste emoji…" value="${escapeHtml(note.emoji||'')}" oninput="npSetNoteEmoji(${id},this.value)" maxlength="4">
    </div>
    ${_npTags.length?`<div class="np-opts-section"><div class="np-opts-lbl">Tags</div><div class="np-opts-tags">${tagRows}</div></div>`:''}
    <div class="np-opts-div"></div>
    <button class="np-opts-action" onclick="npDuplicateNoteById(${id})"><i class="fa-solid fa-copy"></i> Duplicate</button>
    <button class="np-opts-action" onclick="npArchiveNote(${id})"><i class="fa-solid fa-box-archive"></i> Archive</button>
    <button class="np-opts-action np-opts-red" onclick="npDeleteNote(${id},event)"><i class="fa-solid fa-trash"></i> Move to Trash</button>`;
  document.body.appendChild(popup);
  const btn=e.target.closest('button');const rect=btn.getBoundingClientRect();
  const pw=210;let left=rect.right-pw;if(left<4)left=4;
  popup.style.left=left+'px';popup.style.top=(rect.bottom+4)+'px';
  setTimeout(()=>document.addEventListener('click',function h(ev){
    if(document.getElementById('np-cpicker-panel')?.contains(ev.target))return;
    if(!popup.contains(ev.target)&&ev.target!==btn){popup.remove();document.removeEventListener('click',h,true);}
  },true),0);
}

function _npRefreshOptsColor(id){
  const note=_npNotes.find(n=>n.id===id);
  const popup=document.getElementById('np-opts-popup');if(!popup||!note)return;
  const swatch=popup.querySelector('.np-opts-cpick-swatch');
  const lbl=popup.querySelector('.np-opts-cpick-lbl');
  if(swatch){swatch.style.background=note.color||'transparent';swatch.style.outline=note.color?'':'1px dashed var(--border)';}
  if(lbl)lbl.textContent=note.color||'None';
  const row=popup.querySelector('.np-opts-color-row');
  let cb=popup.querySelector('.np-opts-cpick-clear');
  if(note.color&&!cb){cb=document.createElement('button');cb.className='np-opts-cpick-clear';cb.title='Clear colour';cb.innerHTML='<i class="fa-solid fa-xmark"></i>';cb.onclick=()=>{npSetNoteColor(id,'');_npRefreshOptsColor(id);};row?.appendChild(cb);}
  else if(!note.color&&cb)cb.remove();
}

function _npCloseOpts(){document.getElementById('np-opts-popup')?.remove();}

// ── Sort / View / Compact ─────────────────────────────────────────────────────

function npSetSort(s){_npSortBy=s;_npWritePrefs();_npRenderSidebar();}

function npSetSidebarView(v){
  _npSidebarView=v;_npWritePrefs();_npUpdateViewTabs();
  if(_npSelectMode){_npSelectedIds.clear();document.getElementById('np-select-count').textContent='0 selected';_npUpdateSelectBarActions();}
  _npRenderSidebar();
  const eb=document.getElementById('np-empty-trash-btn');
  if(eb)eb.style.display=v==='trash'?'':'none';
}

function _npUpdateViewTabs(){
  document.querySelectorAll('.np-view-tab').forEach(b=>b.classList.toggle('active',b.dataset.view===_npSidebarView));
}

function npToggleCompact(){
  _npCompact=!_npCompact;_npWritePrefs();
  document.getElementById('np-compact-btn')?.classList.toggle('active',_npCompact);
  _npRenderSidebar();
}

function npSidebarSearch(q){_npSidebarSearch=q.toLowerCase();_npRenderSidebar();}

// ── Auto-save ─────────────────────────────────────────────────────────────────

function _npInput(){
  _npUpdateCount();
  if(_npSaveTimer)clearTimeout(_npSaveTimer);
  _npSaveTimer=setTimeout(_npFlushSave,600);
  if(_npSplitView||_npMode==='preview')_npRenderPreview();
}

function _npFlushSave(){
  const note=_npActiveNote();if(!note)return;
  const ta=document.getElementById('np-area');if(!ta)return;
  note.content=ta.value;note.modified=Date.now();
  let _npNameChanged=false;
  if(!note.name){
    const first=ta.value.split('\n').map(l=>l.replace(/^#+\s*/,'')).find(l=>l.trim());
    if(first){const derived=first.trim().slice(0,40);if(derived!==note.name){note.name=derived;_npNameChanged=true;}const t=document.getElementById('np-note-title');if(t&&!t.value)t.placeholder=note.name;}
  }
  _npWrite();
  if(_npNameChanged)_npRenderSidebar();
  // Save version snapshot
  _npSaveVersion(note.id,note.content);
  const ind=document.getElementById('np-saved-indicator');
  if(ind){
    const t=new Date().toLocaleTimeString('en-AU',{hour:'2-digit',minute:'2-digit',hour12:false});
    ind.innerHTML=`<i class="fa-solid fa-check-circle"></i> Saved ${t}`;
    ind.classList.add('np-saved-visible');
    clearTimeout(ind._t);ind._t=setTimeout(()=>ind.classList.remove('np-saved-visible'),2500);
  }
}

// ── Mode ──────────────────────────────────────────────────────────────────────

function npSetMode(mode,el){
  // Exit split view when clicking Edit or Preview
  if(_npSplitView)npToggleSplitView();
  _npMode=mode;
  document.querySelectorAll('#np-mode-toggle .qz-mode-btn').forEach(b=>b.classList.remove('active'));
  if(el)el.classList.add('active');
  const ta=document.getElementById('np-area'),preview=document.getElementById('np-preview');
  const fmt=document.getElementById('np-format-bar'),imgRow=document.getElementById('np-img-row'),tblRow=document.getElementById('np-table-row');
  if(mode==='preview'){
    if(ta)ta.style.display='none';if(fmt)fmt.style.display='none';
    if(imgRow)imgRow.style.display='none';if(tblRow)tblRow.style.display='none';
    if(preview)preview.style.display='';_npRenderPreview();
  }else{
    if(ta){ta.style.display='';ta.focus();}if(fmt)fmt.style.display='';if(preview)preview.style.display='none';
  }
}

// ── Split View (Feature 1) ────────────────────────────────────────────────────

function npToggleSplitView(){
  _npSplitView=!_npSplitView;_npWritePrefs();
  const wrap=document.getElementById('np-editor-wrap')||document.querySelector('.np-editor-wrap');
  const ta=document.getElementById('np-area');
  const preview=document.getElementById('np-preview');
  const splitBtn=document.getElementById('np-split-btn');
  const syncBtn=document.getElementById('np-scrollsync-btn');
  const fmt=document.getElementById('np-format-bar');
  // Dim Edit/Preview buttons in split mode
  const modeToggle=document.getElementById('np-mode-toggle');
  if(_npSplitView){
    if(wrap)wrap.classList.add('np-split-active');
    if(ta){ta.style.display='';ta.style.flex='1';ta.style.minWidth='0';}
    if(preview){preview.style.display='';preview.style.flex='1';preview.style.minWidth='0';}
    if(fmt)fmt.style.display='';
    if(splitBtn)splitBtn.classList.add('active');
    if(syncBtn)syncBtn.style.display='';
    if(modeToggle)modeToggle.style.opacity='0.5';
    _npRenderPreview();
  }else{
    if(wrap)wrap.classList.remove('np-split-active');
    if(ta){ta.style.flex='';ta.style.minWidth='';}
    if(preview){preview.style.flex='';preview.style.minWidth='';}
    if(splitBtn)splitBtn.classList.remove('active');
    if(syncBtn)syncBtn.style.display='none';
    if(modeToggle)modeToggle.style.opacity='';
    // Restore mode-appropriate display
    if(_npMode==='preview'){if(ta)ta.style.display='none';if(fmt)fmt.style.display='none';if(preview)preview.style.display='';}
    else{if(ta)ta.style.display='';if(fmt)fmt.style.display='';if(preview)preview.style.display='none';}
  }
  // Update scroll sync button icon
  _npUpdateScrollSyncBtn();
}

// ── Scroll Sync (Feature 2) ───────────────────────────────────────────────────

function npToggleScrollSync(){
  _npScrollSync=!_npScrollSync;_npWritePrefs();_npUpdateScrollSyncBtn();
}

function _npUpdateScrollSyncBtn(){
  const btn=document.getElementById('np-scrollsync-btn');if(!btn)return;
  btn.classList.toggle('active',_npScrollSync);
  const icon=btn.querySelector('i');
  if(icon)icon.className=_npScrollSync?'fa-solid fa-link':'fa-solid fa-link-slash';
}

function _npHandleScrollSync(){
  if(!_npSplitView||!_npScrollSync)return;
  const ta=document.getElementById('np-area');
  const preview=document.getElementById('np-preview');
  if(!ta||!preview)return;
  const taMax=ta.scrollHeight-ta.clientHeight;
  if(taMax<=0)return;
  const ratio=ta.scrollTop/taMax;
  const pvMax=preview.scrollHeight-preview.clientHeight;
  preview.scrollTop=ratio*pvMax;
}

// ── Typewriter Mode (Feature 3) ───────────────────────────────────────────────

function npToggleTypewriter(){
  _npTypewriter=!_npTypewriter;_npWritePrefs();
  const btn=document.getElementById('np-typewriter-btn');
  if(btn)btn.classList.toggle('active',_npTypewriter);
}

function _npTypewriterScroll(){
  if(!_npTypewriter)return;
  const ta=document.getElementById('np-area');if(!ta)return;
  const lh=parseInt(getComputedStyle(ta).lineHeight)||20;
  const linesBefore=ta.value.substring(0,ta.selectionStart).split('\n').length-1;
  const lineTop=linesBefore*lh;
  ta.scrollTop=lineTop-ta.clientHeight/2+lh/2;
}

// ── Preview Rendering ─────────────────────────────────────────────────────────

function _npRenderPreview(){
  const ta=document.getElementById('np-area'),preview=document.getElementById('np-preview');
  if(!ta||!preview)return;
  if(typeof marked==='undefined'){preview.innerHTML='<em>Markdown renderer not loaded.</em>';return;}
  marked.use({gfm:true,breaks:true});
  let html=marked.parse(ta.value||'');
  // Remove disabled attr from checkboxes so they can be clicked
  html=html.replace(/<input\s+(?:[^>]*?\s+)?disabled(?:\s+[^>]*)?\s*>/g,m=>m.replace(' disabled','').replace(/\/>$/,'onclick="npToggleCheck(this)">'));
  // Feature 13: Strikethrough completed checklist items
  html=html.replace(/<li><input([^>]*?)checked([^>]*?)>/g,'<li class="np-done"><input$1checked$2>');
  // Subpoena case links [[sp:Name|ID]]
  html=html.replace(/\[\[sp:([^|]+)\|(\d+)\]\]/g,(match,name,id)=>{
    return`<a class="np-sp-link" onclick="npOpenSubpoenaCase(${id})"><i class="fa-solid fa-magnifying-glass-chart"></i> ${escapeHtml(name.trim())}</a>`;
  });
  // Note linking [[note name]]
  html=html.replace(/\[\[(?!sp:)([^\]]+)\]\]/g,(match,name)=>{
    const found=_npNotes.find(n=>!n.deleted&&(n.name||'').toLowerCase()===name.toLowerCase());
    if(found)return`<a class="np-note-link" onclick="npOpenNote(${found.id})">${escapeHtml(match)}</a>`;
    return`<span class="np-note-link np-note-link-missing">${escapeHtml(match)}</span>`;
  });
  preview.innerHTML=html;
}

function npToggleCheck(cb){
  const ta=document.getElementById('np-area'),preview=document.getElementById('np-preview');
  if(!ta||!preview)return;
  const idx=[...preview.querySelectorAll('input[type="checkbox"]')].indexOf(cb);if(idx===-1)return;
  const lines=ta.value.split('\n');let count=0;
  for(let i=0;i<lines.length;i++){
    if(/^\s*-\s+\[[ x]\]/i.test(lines[i])){
      if(count===idx){lines[i]=cb.checked?lines[i].replace(/\[ \]/,'[x]'):lines[i].replace(/\[x\]/i,'[ ]');break;}
      count++;
    }
  }
  ta.value=lines.join('\n');_npInput();
}

// ── Formatting ────────────────────────────────────────────────────────────────

function _npWrap(b,a,ph){
  const ta=document.getElementById('np-area');if(!ta)return;
  const s=ta.selectionStart,e=ta.selectionEnd,sel=ta.value.substring(s,e)||ph;
  ta.value=ta.value.substring(0,s)+b+sel+a+ta.value.substring(e);
  ta.selectionStart=s+b.length;ta.selectionEnd=s+b.length+sel.length;
  ta.focus();_npInput();
}
function _npLinePrefix(prefix){
  const ta=document.getElementById('np-area');if(!ta)return;
  const s=ta.selectionStart,ls=ta.value.lastIndexOf('\n',s-1)+1;
  const has=ta.value.substring(ls).startsWith(prefix);
  if(has){ta.value=ta.value.substring(0,ls)+ta.value.substring(ls+prefix.length);ta.selectionStart=ta.selectionEnd=Math.max(ls,s-prefix.length);}
  else{ta.value=ta.value.substring(0,ls)+prefix+ta.value.substring(ls);ta.selectionStart=ta.selectionEnd=s+prefix.length;}
  ta.focus();_npInput();
}
function npBold(){_npWrap('**','**','bold text');}
function npItalic(){_npWrap('*','*','italic text');}
function npStrike(){_npWrap('~~','~~','strikethrough');}
function npInlineCode(){_npWrap('`','`','code');}
function npHeading(n){_npLinePrefix('#'.repeat(n)+' ');}
function npUl(){_npLinePrefix('- ');}
function npOl(){_npLinePrefix('1. ');}
function npQuote(){_npLinePrefix('> ');}
function npChecklist(){_npLinePrefix('- [ ] ');}
function npCodeBlock(){
  const ta=document.getElementById('np-area');if(!ta)return;
  const s=ta.selectionStart,e=ta.selectionEnd,sel=ta.value.substring(s,e)||'code here',rep='```\n'+sel+'\n```';
  ta.value=ta.value.substring(0,s)+rep+ta.value.substring(e);
  ta.selectionStart=s+4;ta.selectionEnd=s+4+sel.length;ta.focus();_npInput();
}
function npHr(){
  const ta=document.getElementById('np-area');if(!ta)return;
  const s=ta.selectionStart,ins='\n---\n';
  ta.value=ta.value.substring(0,s)+ins+ta.value.substring(s);
  ta.selectionStart=ta.selectionEnd=s+ins.length;ta.focus();_npInput();
}
function npTimestamp(){
  const ts=new Date().toLocaleString('en-AU',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:false});
  _npWrap('**['+ts+']** ','','note');
}
function npUnderline(){_npWrap('<u>','</u>','underlined text');}
function npSup(){_npWrap('<sup>','</sup>','text');}
function npSub(){_npWrap('<sub>','</sub>','text');}
function npApplyColor(color){
  const sw=document.getElementById('np-color-swatch');if(sw)sw.style.background=color;
  _npWrap(`<span style="color:${color}">`,'</span>','text');
}
function npApplyHighlight(color){
  const sw=document.getElementById('np-hl-swatch');if(sw)sw.style.background=color;
  _npWrap(`<mark style="background-color:${color}">`,'</mark>','highlighted text');
}
function npIndent(){
  const ta=document.getElementById('np-area');if(!ta)return;
  const s=ta.selectionStart,ls=ta.value.lastIndexOf('\n',s-1)+1;
  ta.value=ta.value.substring(0,ls)+'  '+ta.value.substring(ls);
  ta.selectionStart=ta.selectionEnd=s+2;ta.focus();_npInput();
}
function npOutdent(){
  const ta=document.getElementById('np-area');if(!ta)return;
  const s=ta.selectionStart,ls=ta.value.lastIndexOf('\n',s-1)+1;
  const line=ta.value.substring(ls);
  if(line.startsWith('  ')){ta.value=ta.value.substring(0,ls)+line.substring(2);ta.selectionStart=ta.selectionEnd=Math.max(ls,s-2);}
  else if(line.startsWith('\t')){ta.value=ta.value.substring(0,ls)+line.substring(1);ta.selectionStart=ta.selectionEnd=Math.max(ls,s-1);}
  ta.focus();_npInput();
}
function npApplySize(size){if(size)_npWrap(`<span style="font-size:${size}">`,'</span>','text');}

// ── Colour picker ────────────────────────────────────────────────────────────

let _npTextColor='#3b82f6',_npHlColor='#eab308';
let _npPickerTarget=null,_npPickerSelS=0,_npPickerSelE=0;
let _npCpH=0,_npCpS=1,_npCpV=1,_npCpDrag=null;

const _NP_TEXT_PRESETS=['#ffffff','#e2e8f0','#94a3b8','#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899','#64748b'];
const _NP_HL_PRESETS= ['#eab30855','#f9731655','#ef444455','#22c55e55','#06b6d455','#3b82f655','#8b5cf655','#ec489955','#fde04799','#bbf7d099','#bfdbfe99','#fce7f399'];

function _hsvToRgb(h,s,v){const f=n=>{const k=(n+h/60)%6;return v-v*s*Math.max(0,Math.min(k,4-k,1));};return{r:Math.round(f(5)*255),g:Math.round(f(3)*255),b:Math.round(f(1)*255)};}
function _rgbToHsv(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=0;if(d){if(max===r)h=((g-b)/d)%6;else if(max===g)h=(b-r)/d+2;else h=(r-g)/d+4;h=h*60;if(h<0)h+=360;}return{h,s:max?d/max:0,v:max};}
function _rgbToHex(r,g,b){return'#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');}
function _hexToRgb(hex){if(!/^#[0-9a-fA-F]{6}$/.test(hex))return null;return{r:parseInt(hex.slice(1,3),16),g:parseInt(hex.slice(3,5),16),b:parseInt(hex.slice(5,7),16)};}
function _cpCurrentHex(){const{r,g,b}=_hsvToRgb(_npCpH,_npCpS,_npCpV);return _rgbToHex(r,g,b);}

function _cpDrawSV(){
  const cv=document.getElementById('np-cp-sv');if(!cv)return;
  const ctx=cv.getContext('2d'),w=cv.width,h=cv.height;
  const{r,g,b}=_hsvToRgb(_npCpH,1,1);
  ctx.fillStyle=`rgb(${r},${g},${b})`;ctx.fillRect(0,0,w,h);
  const wg=ctx.createLinearGradient(0,0,w,0);wg.addColorStop(0,'rgba(255,255,255,1)');wg.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=wg;ctx.fillRect(0,0,w,h);
  const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,'rgba(0,0,0,0)');bg.addColorStop(1,'rgba(0,0,0,1)');
  ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
  const cx=_npCpS*w,cy=(1-_npCpV)*h;
  ctx.beginPath();ctx.arc(cx,cy,7,0,2*Math.PI);ctx.strokeStyle='rgba(0,0,0,.5)';ctx.lineWidth=3;ctx.stroke();
  ctx.beginPath();ctx.arc(cx,cy,7,0,2*Math.PI);ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();
}

function _cpDrawHue(){
  const cv=document.getElementById('np-cp-hue');if(!cv)return;
  const ctx=cv.getContext('2d'),w=cv.width,h=cv.height;
  const g=ctx.createLinearGradient(0,0,w,0);
  for(let i=0;i<=12;i++)g.addColorStop(i/12,`hsl(${i*30},100%,50%)`);
  ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  const x=(_npCpH/360)*w;
  const tx=Math.max(0,Math.min(w-8,x-4));
  ctx.fillStyle='rgba(255,255,255,.9)';ctx.fillRect(tx,0,8,h);
  ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1;ctx.strokeRect(tx,0,8,h);
}

function _cpRedraw(){
  _cpDrawSV();_cpDrawHue();
  const hex=_cpCurrentHex();
  const prev=document.getElementById('np-cpicker-preview');
  const hexEl=document.getElementById('np-cpicker-hex');
  if(prev)prev.style.background=hex;
  if(hexEl&&document.activeElement!==hexEl)hexEl.value=hex;
}

function npOpenColorPicker(target,btn){
  const ex=document.getElementById('np-cpicker-panel');
  if(ex){if(_npPickerTarget===target){ex._cleanup?.();ex.remove();return;}ex._cleanup?.();ex.remove();}
  _npPickerTarget=target;
  const isNote=target.startsWith('note-');
  const ta=document.getElementById('np-area');
  if(ta&&!isNote){_npPickerSelS=ta.selectionStart;_npPickerSelE=ta.selectionEnd;}
  let cur;
  if(target==='highlight')cur=_npHlColor;
  else if(isNote){const nid=parseInt(target.slice(5));cur=_npNotes.find(n=>n.id===nid)?.color||'#3b82f6';}
  else cur=_npTextColor;
  const baseHex=(cur||'#3b82f6').length>7?cur.slice(0,7):cur;
  const rgb=_hexToRgb(baseHex);
  if(rgb){const hsv=_rgbToHsv(rgb.r,rgb.g,rgb.b);_npCpH=hsv.h;_npCpS=hsv.s;_npCpV=hsv.v;}
  const presets=target==='highlight'?_NP_HL_PRESETS:_NP_TEXT_PRESETS;
  const label=target==='highlight'?'Highlight colour':'Text colour';

  const panel=document.createElement('div');
  panel.id='np-cpicker-panel';panel.className='np-cpicker-panel';
  panel.innerHTML=`
    <div class="np-cpicker-label">${label}</div>
    <canvas id="np-cp-sv" class="np-cp-sv" width="182" height="130"></canvas>
    <canvas id="np-cp-hue" class="np-cp-hue" width="182" height="12"></canvas>
    <div class="np-cpicker-top">
      <div class="np-cpicker-preview-box" id="np-cpicker-preview" style="background:${baseHex}"></div>
      <input type="text" class="np-cpicker-hex" id="np-cpicker-hex" value="${baseHex}" maxlength="7" placeholder="#rrggbb" spellcheck="false">
    </div>
    <div class="np-cpicker-presets">${presets.map(c=>`<button class="np-cpicker-swatch" style="background:${c}" onclick="npPickerSetColor('${c}')"></button>`).join('')}</div>
    <div class="np-cpicker-actions">
      <button class="np-btn" style="flex:1;justify-content:center" onclick="npPickerApplyHex()"><i class="fa-solid fa-check"></i> Apply</button>
    </div>`;
  document.body.appendChild(panel);

  const rect=btn.getBoundingClientRect();
  const pw=202,ph=380;
  let left=rect.left,top=rect.bottom+4;
  if(left+pw>window.innerWidth-8)left=window.innerWidth-pw-8;
  if(top+ph>window.innerHeight-8)top=rect.top-ph-4;
  panel.style.top=Math.max(4,top)+'px';panel.style.left=Math.max(4,left)+'px';

  _cpRedraw();

  const svCv=document.getElementById('np-cp-sv');
  const hueCv=document.getElementById('np-cp-hue');

  function svPick(e){
    const r=svCv.getBoundingClientRect();
    _npCpS=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));
    _npCpV=Math.max(0,Math.min(1,1-(e.clientY-r.top)/r.height));
    _cpRedraw();
  }
  function huePick(e){
    const r=hueCv.getBoundingClientRect();
    _npCpH=Math.max(0,Math.min(359.9,((e.clientX-r.left)/r.width)*360));
    _cpRedraw();
  }
  svCv.addEventListener('mousedown',e=>{_npCpDrag='sv';svPick(e);e.preventDefault();});
  hueCv.addEventListener('mousedown',e=>{_npCpDrag='hue';huePick(e);e.preventDefault();});
  const onMove=e=>{if(_npCpDrag==='sv')svPick(e);else if(_npCpDrag==='hue')huePick(e);};
  const onUp=()=>{_npCpDrag=null;};
  document.addEventListener('mousemove',onMove);document.addEventListener('mouseup',onUp);

  const hexEl=document.getElementById('np-cpicker-hex');
  hexEl.addEventListener('input',()=>{
    const v=hexEl.value.trim();
    if(/^#[0-9a-fA-F]{6}$/.test(v)){
      const rgb=_hexToRgb(v);if(!rgb)return;
      const hsv=_rgbToHsv(rgb.r,rgb.g,rgb.b);_npCpH=hsv.h;_npCpS=hsv.s;_npCpV=hsv.v;
      _cpDrawSV();_cpDrawHue();
      document.getElementById('np-cpicker-preview').style.background=v;
    }
  });
  hexEl.addEventListener('keydown',e=>{
    if(e.key==='Enter'){e.preventDefault();npPickerApplyHex();}
    if(e.key==='Escape'){panel._cleanup?.();panel.remove();}
  });

  panel._cleanup=()=>{document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);};
  setTimeout(()=>document.addEventListener('click',function h(e){
    if(!panel.contains(e.target)&&!btn.contains(e.target)){panel._cleanup?.();panel.remove();document.removeEventListener('click',h,true);}
  },true),0);
}

function npPickerSetColor(color){
  const hex=color.length>7?color.slice(0,7):color;
  const rgb=_hexToRgb(hex);if(!rgb)return;
  const hsv=_rgbToHsv(rgb.r,rgb.g,rgb.b);
  _npCpH=hsv.h;_npCpS=hsv.s;_npCpV=hsv.v;
  _cpRedraw();
}

function npPickerApplyHex(){
  const v=(document.getElementById('np-cpicker-hex')?.value||'').trim();
  const color=/^#[0-9a-fA-F]{6}$/.test(v)?v:_cpCurrentHex();
  _npPickerCommit(color);
}

function _npPickerCommit(color){
  if(_npPickerTarget==='highlight'){
    _npHlColor=color;
    const sw=document.getElementById('np-hl-swatch');if(sw)sw.style.background=color;
    const ta=document.getElementById('np-area');if(ta){ta.selectionStart=_npPickerSelS;ta.selectionEnd=_npPickerSelE;}
    _npWrap(`<mark style="background-color:${color}">`,'</mark>','highlighted text');
  }else if(_npPickerTarget&&_npPickerTarget.startsWith('note-')){
    const noteId=parseInt(_npPickerTarget.slice(5));
    npSetNoteColor(noteId,color);
    _npRefreshOptsColor(noteId);
  }else{
    _npTextColor=color;
    const sw=document.getElementById('np-color-swatch');if(sw)sw.style.background=color;
    const ta=document.getElementById('np-area');if(ta){ta.selectionStart=_npPickerSelS;ta.selectionEnd=_npPickerSelE;}
    _npWrap(`<span style="color:${color}">`,'</span>','text');
  }
  const panel=document.getElementById('np-cpicker-panel');panel?._cleanup?.();panel?.remove();
}

// ── Table builder ─────────────────────────────────────────────────────────────

function npToggleTableBuilder(){
  const row=document.getElementById('np-table-row');if(!row)return;
  const open=row.style.display!=='none';
  row.style.display=open?'none':'flex';
  if(!open)document.getElementById('np-table-cols')?.focus();
}
function npInsertTable(){
  const rows=Math.min(20,Math.max(1,parseInt(document.getElementById('np-table-rows')?.value)||3));
  const cols=Math.min(10,Math.max(1,parseInt(document.getElementById('np-table-cols')?.value)||3));
  const ta=document.getElementById('np-area');if(!ta)return;
  const hdr='| '+Array.from({length:cols},(_,i)=>`Col ${i+1}  `).join(' | ')+' |';
  const sep='| '+Array(cols).fill('---').join(' | ')+' |';
  const row='| '+Array(cols).fill('       ').join(' | ')+' |';
  const tbl='\n'+[hdr,sep,...Array(rows).fill(row)].join('\n')+'\n';
  const s=ta.selectionStart;
  ta.value=ta.value.substring(0,s)+tbl+ta.value.substring(s);
  ta.selectionStart=ta.selectionEnd=s+tbl.length;ta.focus();_npInput();
  document.getElementById('np-table-row').style.display='none';
}

// ── Image ─────────────────────────────────────────────────────────────────────

function npToggleImgRow(){
  const row=document.getElementById('np-img-row');if(!row)return;
  const open=row.style.display!=='none';
  row.style.display=open?'none':'flex';
  if(!open){document.getElementById('np-img-url').value='';document.getElementById('np-img-alt').value='';document.getElementById('np-img-url').focus();}
}
function _npInsertImage(){
  const url=document.getElementById('np-img-url').value.trim();if(!url)return;
  const alt=document.getElementById('np-img-alt').value.trim()||'image';
  const ta=document.getElementById('np-area');
  const s=ta.selectionStart,ins=`![${alt}](${url})\n`;
  ta.value=ta.value.substring(0,s)+ins+ta.value.substring(s);
  ta.selectionStart=ta.selectionEnd=s+ins.length;ta.focus();_npInput();
  document.getElementById('np-img-row').style.display='none';
}

// ── Note link picker ─────────────────────────────────────────────────────────

function npToggleNoteLinkPicker(btn){
  const ex=document.getElementById('np-note-link-picker');
  if(ex){ex.remove();return;}
  const ta=document.getElementById('np-area');
  const s=ta?.selectionStart??0,e=ta?.selectionEnd??0;
  const picker=document.createElement('div');
  picker.id='np-note-link-picker';picker.className='np-note-link-picker';
  picker._s=s;picker._e=e;

  const renderItems=q=>{
    const list=picker.querySelector('.np-nlp-list');if(!list)return;
    const notes=_npNotes.filter(n=>!n.deleted&&!n.archived);
    const filtered=q?notes.filter(n=>(n.name||'').toLowerCase().includes(q)):notes;
    if(!filtered.length){list.innerHTML='<div class="np-nlp-empty">No notes found</div>';return;}
    list.innerHTML=filtered.map(n=>{
      const name=escapeHtml(n.name||'Untitled note');
      const raw=n.name||'Untitled note';
      return`<button class="np-nlp-item" onclick="_npInsertNoteLink('${raw.replace(/\\/g,'\\\\').replace(/'/g,"\\'")}')" tabindex="0">${n.emoji?`<span class="np-nlp-emoji">${n.emoji}</span>`:'<span class="np-nlp-emoji"></span>'}<span>${name}</span></button>`;
    }).join('');
  };

  picker.innerHTML=`<div class="np-nlp-search-wrap"><i class="fa-solid fa-magnifying-glass"></i><input type="text" id="np-nlp-inp" placeholder="Search notes…" autocomplete="off"></div><div class="np-nlp-list"></div>`;
  document.body.appendChild(picker);

  const rect=btn.getBoundingClientRect();
  const pw=240;
  let left=rect.left;if(left+pw>window.innerWidth-8)left=window.innerWidth-pw-8;
  picker.style.top=(rect.bottom+4)+'px';picker.style.left=Math.max(4,left)+'px';

  renderItems('');

  const inp=document.getElementById('np-nlp-inp');
  inp?.addEventListener('input',()=>renderItems(inp.value.trim().toLowerCase()));
  inp?.addEventListener('keydown',e=>{
    if(e.key==='Escape')picker.remove();
    if(e.key==='ArrowDown'){e.preventDefault();picker.querySelector('.np-nlp-item')?.focus();}
  });
  picker.querySelector('.np-nlp-list')?.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'){e.preventDefault();document.activeElement.nextElementSibling?.focus();}
    if(e.key==='ArrowUp'){e.preventDefault();const prev=document.activeElement.previousElementSibling;prev?prev.focus():inp?.focus();}
    if(e.key==='Escape')picker.remove();
  });
  setTimeout(()=>inp?.focus(),0);
  setTimeout(()=>document.addEventListener('click',function h(ev){
    if(!picker.contains(ev.target)&&!btn.contains(ev.target)){picker.remove();document.removeEventListener('click',h,true);}
  },true),0);
}

function _npInsertNoteLink(name){
  const picker=document.getElementById('np-note-link-picker');
  const s=picker?._s??0,e=picker?._e??0;
  picker?.remove();
  const ta=document.getElementById('np-area');if(!ta)return;
  const ins=`[[${name}]]`;
  ta.value=ta.value.substring(0,s)+ins+ta.value.substring(e);
  ta.selectionStart=ta.selectionEnd=s+ins.length;
  ta.focus();_npInput();
}

// ── Subpoena link picker ──────────────────────────────────────────────────────

function npToggleSubpoenaLinkPicker(btn){
  const ex=document.getElementById('np-sp-link-picker');
  if(ex){ex.remove();return;}
  let cases=[];
  try{cases=JSON.parse(localStorage.getItem('upd-sp-cases'))||[];}catch(e){}
  if(!cases.length){
    // Show a brief inline message instead of an alert
    const msg=document.createElement('div');
    msg.className='np-sp-no-cases';msg.textContent='No subpoena cases yet — create one in the Subpoena Analyser first.';
    const rect=btn.getBoundingClientRect();
    msg.style.cssText=`position:fixed;top:${rect.bottom+4}px;left:${Math.max(4,rect.left)}px;z-index:400;background:var(--s2);border:1px solid var(--border);border-radius:8px;padding:10px 14px;font-size:12px;color:var(--text2);box-shadow:0 6px 20px rgba(0,0,0,.4);white-space:nowrap`;
    document.body.appendChild(msg);
    setTimeout(()=>msg.remove(),3000);
    return;
  }
  const ta=document.getElementById('np-area');
  const s=ta?.selectionStart??0,e=ta?.selectionEnd??0;
  const picker=document.createElement('div');
  picker.id='np-sp-link-picker';picker.className='np-note-link-picker';
  picker._s=s;picker._e=e;

  const renderItems=q=>{
    const list=picker.querySelector('.np-nlp-list');if(!list)return;
    const filtered=q?cases.filter(c=>(c.name||'').toLowerCase().includes(q)):cases;
    if(!filtered.length){list.innerHTML='<div class="np-nlp-empty">No cases found</div>';return;}
    list.innerHTML=filtered.map(c=>{
      const phoneCount=(c.phone||[]).length,bankCount=(c.bank||[]).length;
      const name=c.name||'Unnamed';
      return`<button class="np-nlp-item" onclick="_npInsertSubpoenaLink(${c.id},'${name.replace(/\\/g,'\\\\').replace(/'/g,"\\'")}')">
        <i class="fa-solid fa-magnifying-glass-chart np-nlp-sp-icon"></i>
        <span class="np-nlp-sp-name">${escapeHtml(name)}</span>
        <span class="np-nlp-sp-counts">${phoneCount?`<i class="fa-solid fa-mobile-screen-button"></i>${phoneCount}`:''}${bankCount?` <i class="fa-solid fa-building-columns"></i>${bankCount}`:''}</span>
      </button>`;
    }).join('');
  };

  picker.innerHTML=`<div class="np-nlp-search-wrap"><i class="fa-solid fa-magnifying-glass"></i><input type="text" id="np-sp-inp" placeholder="Search cases…" autocomplete="off"></div><div class="np-nlp-list"></div>`;
  document.body.appendChild(picker);

  const rect=btn.getBoundingClientRect();
  const pw=260;
  let left=rect.left;if(left+pw>window.innerWidth-8)left=window.innerWidth-pw-8;
  picker.style.top=(rect.bottom+4)+'px';picker.style.left=Math.max(4,left)+'px';picker.style.width=pw+'px';

  renderItems('');

  const inp=document.getElementById('np-sp-inp');
  inp?.addEventListener('input',()=>renderItems(inp.value.trim().toLowerCase()));
  inp?.addEventListener('keydown',e=>{
    if(e.key==='Escape')picker.remove();
    if(e.key==='ArrowDown'){e.preventDefault();picker.querySelector('.np-nlp-item')?.focus();}
  });
  picker.querySelector('.np-nlp-list')?.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'){e.preventDefault();document.activeElement.nextElementSibling?.focus();}
    if(e.key==='ArrowUp'){e.preventDefault();const prev=document.activeElement.previousElementSibling;prev?prev.focus():inp?.focus();}
    if(e.key==='Escape')picker.remove();
  });
  setTimeout(()=>inp?.focus(),0);
  setTimeout(()=>document.addEventListener('click',function h(ev){
    if(!picker.contains(ev.target)&&!btn.contains(ev.target)){picker.remove();document.removeEventListener('click',h,true);}
  },true),0);
}

function _npInsertSubpoenaLink(caseId,caseName){
  const picker=document.getElementById('np-sp-link-picker');
  const s=picker?._s??0,e=picker?._e??0;
  picker?.remove();
  const ta=document.getElementById('np-area');if(!ta)return;
  const ins=`[[sp:${caseName}|${caseId}]]`;
  ta.value=ta.value.substring(0,s)+ins+ta.value.substring(e);
  ta.selectionStart=ta.selectionEnd=s+ins.length;
  ta.focus();_npInput();
}

function npOpenSubpoenaCase(caseId){
  sessionStorage.setItem('upd-sp-pending-case',String(caseId));
  document.querySelector('.nav-item[data-page="subpoena"]')?.click();
}

// ── Link ──────────────────────────────────────────────────────────────────────

function npToggleLinkRow(){
  const row=document.getElementById('np-link-row');if(!row)return;
  const open=row.style.display!=='none';
  row.style.display=open?'none':'flex';
  if(!open){
    const ta=document.getElementById('np-area');
    if(ta){const sel=ta.value.substring(ta.selectionStart,ta.selectionEnd);if(sel)document.getElementById('np-link-text').value=sel;}
    document.getElementById('np-link-url').value='';
    document.getElementById('np-link-url').focus();
  }
}
function _npInsertLink(){
  const text=(document.getElementById('np-link-text')?.value||'').trim();
  const url=(document.getElementById('np-link-url')?.value||'').trim();
  if(!url)return;
  const ta=document.getElementById('np-area');if(!ta)return;
  const s=ta.selectionStart,e=ta.selectionEnd;
  const ins=`[${text||url}](${url})`;
  ta.value=ta.value.substring(0,s)+ins+ta.value.substring(e);
  ta.selectionStart=ta.selectionEnd=s+ins.length;
  ta.focus();_npInput();
  document.getElementById('np-link-row').style.display='none';
}

// ── Find & Replace (refactored to {index,length} + regex) ────────────────────

function npToggleFind(){
  const bar=document.getElementById('np-find-bar');if(!bar)return;
  const open=bar.style.display!=='none';
  bar.style.display=open?'none':'flex';
  if(!open)document.getElementById('np-find-input')?.focus();
  else{_npFindMatches=[];_npFindIdx=0;}
}

function npToggleRegex(){
  _npRegexMode=!_npRegexMode;
  const btn=document.getElementById('np-regex-btn');
  if(btn)btn.classList.toggle('active',_npRegexMode);
  const inp=document.getElementById('np-find-input');
  if(inp)inp.classList.toggle('np-find-regex-active',_npRegexMode);
  npFindUpdate();
}

function _npBuildFindRegex(q){
  if(!q)return null;
  try{
    const pattern=_npRegexMode?q:q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    return new RegExp(pattern,'gi');
  }catch(e){return null;}
}

function npFindUpdate(){
  const q=document.getElementById('np-find-input')?.value||'';
  const ta=document.getElementById('np-area');const countEl=document.getElementById('np-find-count');
  const findInp=document.getElementById('np-find-input');
  if(!ta||!q){
    _npFindMatches=[];_npFindIdx=0;
    if(countEl)countEl.textContent='';
    if(findInp)findInp.classList.remove('np-find-err');
    return;
  }
  if(_npRegexMode){
    try{new RegExp(q);}catch(e){
      _npFindMatches=[];_npFindIdx=0;
      if(countEl)countEl.textContent='Invalid regex';
      if(findInp)findInp.classList.add('np-find-err');
      return;
    }
  }
  if(findInp)findInp.classList.remove('np-find-err');
  const regex=_npBuildFindRegex(q);if(!regex)return;
  _npFindMatches=[];let m;while((m=regex.exec(ta.value))!==null)_npFindMatches.push({index:m.index,length:m[0].length});
  _npFindIdx=0;
  if(countEl)countEl.textContent=_npFindMatches.length?`1/${_npFindMatches.length}`:'No matches';
  if(_npFindMatches.length)_npSelectMatch();
}

function _npSelectMatch(){
  const ta=document.getElementById('np-area');const countEl=document.getElementById('np-find-count');
  if(!ta||!_npFindMatches.length)return;
  const match=_npFindMatches[_npFindIdx];
  ta.setSelectionRange(match.index,match.index+match.length);ta.focus();
  const lh=parseInt(getComputedStyle(ta).lineHeight)||20;
  ta.scrollTop=(ta.value.substring(0,match.index).split('\n').length-1)*lh-ta.clientHeight/2;
  if(countEl)countEl.textContent=`${_npFindIdx+1}/${_npFindMatches.length}`;
}

function npFindNext(){if(!_npFindMatches.length)return;_npFindIdx=(_npFindIdx+1)%_npFindMatches.length;_npSelectMatch();}
function npFindPrev(){if(!_npFindMatches.length)return;_npFindIdx=(_npFindIdx-1+_npFindMatches.length)%_npFindMatches.length;_npSelectMatch();}

function npReplace(){
  const q=document.getElementById('np-find-input')?.value||'';const rep=document.getElementById('np-replace-input')?.value||'';
  const ta=document.getElementById('np-area');if(!ta||!q||!_npFindMatches.length)return;
  const match=_npFindMatches[_npFindIdx];
  if(ta.selectionStart===match.index&&ta.selectionEnd===match.index+match.length){
    ta.value=ta.value.substring(0,match.index)+rep+ta.value.substring(match.index+match.length);
    _npInput();npFindUpdate();
  }
}

function npReplaceAll(){
  const q=document.getElementById('np-find-input')?.value||'';const rep=document.getElementById('np-replace-input')?.value||'';
  const ta=document.getElementById('np-area');if(!ta||!q)return;
  if(_npRegexMode){
    try{ta.value=ta.value.replace(new RegExp(q,'g'),rep);}catch(e){return;}
  }else{
    ta.value=ta.value.replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'),rep);
  }
  _npInput();npFindUpdate();
}

// ── Stats Panel (Feature 12) ──────────────────────────────────────────────────

function _npCountSyllables(word){
  word=word.toLowerCase().replace(/[^a-z]/g,'');
  if(!word)return 0;
  if(word.length<=3)return 1;
  word=word.replace(/(?:[^aeiou]es|ed|[^aeiou]e)$/,'').replace(/^y/,'');
  const m=word.match(/[aeiouy]{1,2}/g);
  return m?m.length:1;
}

function npShowStats(){
  const ta=document.getElementById('np-area');if(!ta)return;
  const text=ta.value;
  const words=text.trim()?text.trim().split(/\s+/):[],wc=words.length;
  const chars=text.length,charsNoSp=text.replace(/\s/g,'').length;
  const sentences=text.split(/[.!?]+/).filter(s=>s.trim()).length||1;
  const paragraphs=text.split(/\n{2,}/).filter(p=>p.trim()).length||1;
  const headings=(text.match(/^#+\s/gm)||[]).length;
  const links=(text.match(/\[[^\]]+\]\([^)]+\)/g)||[]).length;
  const readTime=Math.max(1,Math.round(wc/200));
  const avgWps=wc&&sentences?+(wc/sentences).toFixed(1):0;
  const syllables=words.reduce((t,w)=>t+_npCountSyllables(w),0);
  let flesch=0;
  if(wc>0&&sentences>0){flesch=Math.round(206.835-1.015*(wc/sentences)-84.6*(syllables/wc));}
  flesch=Math.max(0,Math.min(100,flesch));
  const fleschLabel=flesch>=90?'Very Easy':flesch>=80?'Easy':flesch>=70?'Fairly Easy':flesch>=60?'Standard':flesch>=50?'Fairly Difficult':flesch>=30?'Difficult':'Very Difficult';

  // Top 5 words
  const stopWords=new Set(['the','and','for','that','this','with','are','from','have','not','but','was','they','you','will','been','were','their','what','when','which','there','than','can','also','more','its']);
  const freq={};
  words.forEach(w=>{const k=w.toLowerCase().replace(/[^a-z]/g,'');if(k.length>3&&!stopWords.has(k))freq[k]=(freq[k]||0)+1;});
  const top5=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,5);

  const ex=document.getElementById('np-stats-modal');if(ex)ex.remove();
  const overlay=document.createElement('div');overlay.id='np-stats-modal';overlay.className='np-tag-mgr-overlay';
  overlay.innerHTML=`<div class="np-tag-mgr np-stats-modal">
    <div class="np-tag-mgr-hd"><span><i class="fa-solid fa-chart-bar"></i> Note Stats</span><button onclick="document.getElementById('np-stats-modal').remove()"><i class="fa-solid fa-xmark"></i></button></div>
    <div class="np-stats-body">
      <div class="np-stats-grid">
        <div class="np-stats-cell"><div class="np-stats-val">${wc}</div><div class="np-stats-lbl">Words</div></div>
        <div class="np-stats-cell"><div class="np-stats-val">${chars}</div><div class="np-stats-lbl">Characters</div></div>
        <div class="np-stats-cell"><div class="np-stats-val">${charsNoSp}</div><div class="np-stats-lbl">Chars (no spaces)</div></div>
        <div class="np-stats-cell"><div class="np-stats-val">${sentences}</div><div class="np-stats-lbl">Sentences</div></div>
        <div class="np-stats-cell"><div class="np-stats-val">${paragraphs}</div><div class="np-stats-lbl">Paragraphs</div></div>
        <div class="np-stats-cell"><div class="np-stats-val">${headings}</div><div class="np-stats-lbl">Headings</div></div>
        <div class="np-stats-cell"><div class="np-stats-val">${links}</div><div class="np-stats-lbl">Links</div></div>
        <div class="np-stats-cell"><div class="np-stats-val">${readTime} min</div><div class="np-stats-lbl">Read time (200wpm)</div></div>
        <div class="np-stats-cell"><div class="np-stats-val">${avgWps}</div><div class="np-stats-lbl">Avg words/sentence</div></div>
        <div class="np-stats-cell"><div class="np-stats-val">${flesch} <small style="font-size:11px;color:var(--text3)">${fleschLabel}</small></div><div class="np-stats-lbl">Flesch Reading Ease</div></div>
      </div>
      ${top5.length?`<div class="np-stats-sect">Top words</div><div class="np-stats-words">${top5.map(([w,c])=>`<span class="np-stats-word">${escapeHtml(w)} <em>${c}</em></span>`).join('')}</div>`:''}
    </div>
  </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.remove();});
  overlay.addEventListener('keydown',e=>{if(e.key==='Escape')overlay.remove();});
}

// ── Keyboard Shortcuts (Feature 9) ───────────────────────────────────────────

function npShowShortcuts(){
  const ex=document.getElementById('np-shortcuts-modal');if(ex){ex.remove();return;}
  const shortcuts=[
    ['Ctrl+B','Bold'],['Ctrl+I','Italic'],['Ctrl+F','Find/Replace'],['Ctrl+S','Save'],
    ['Tab','Indent'],['Shift+Tab','Outdent'],['Enter','Continue list'],
    ['Esc','Close find bar'],
    ['B (toolbar)','Bold'],['I (toolbar)','Italic'],['U (toolbar)','Underline'],['S (toolbar)','Strikethrough'],
    ['Code (toolbar)','Inline code'],['H1–H6 (toolbar)','Heading'],['UL (toolbar)','Bullet list'],
    ['OL (toolbar)','Numbered list'],['[ ] (toolbar)','Checklist'],['> (toolbar)','Blockquote'],
    ['Clock (toolbar)','Insert timestamp'],['Link (toolbar)','Insert link'],['Table (toolbar)','Insert table'],
  ];
  const overlay=document.createElement('div');overlay.id='np-shortcuts-modal';overlay.className='np-tag-mgr-overlay';
  overlay.innerHTML=`<div class="np-tag-mgr" style="width:min(520px,calc(100vw - 32px))">
    <div class="np-tag-mgr-hd"><span><i class="fa-solid fa-keyboard"></i> Keyboard Shortcuts</span><button onclick="document.getElementById('np-shortcuts-modal').remove()"><i class="fa-solid fa-xmark"></i></button></div>
    <div style="padding:12px;overflow-y:auto;max-height:60vh">
      <table class="np-shortcuts-table">
        ${shortcuts.map(([k,d])=>`<tr class="np-shortcut-row"><td><kbd>${escapeHtml(k)}</kbd></td><td>${escapeHtml(d)}</td></tr>`).join('')}
      </table>
    </div>
  </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.remove();});
  overlay.addEventListener('keydown',e=>{if(e.key==='Escape')overlay.remove();});
}

// ── Import / Export ───────────────────────────────────────────────────────────

function npImport(){
  const inp=document.createElement('input');inp.type='file';inp.accept='.md,.txt,.html,.json';inp.multiple=true;
  inp.onchange=e=>{
    [...e.target.files].forEach(file=>{
      const reader=new FileReader();
      reader.onload=ev=>{
        let content=ev.target.result;const name=file.name.replace(/\.[^.]+$/,'');
        if(file.name.endsWith('.json')){
          try{const parsed=JSON.parse(content);const notes=Array.isArray(parsed)?parsed:[parsed];
            for(const n of notes)_npNotes.unshift(_npNoteDefaults({name:n.name||name,content:n.content||'',tags:[]}));
            _npWrite();_npRenderSidebar();return;}catch(err){}
        }
        _npNotes.unshift(_npNoteDefaults({name,content}));_npWrite();_npRenderSidebar();
      };reader.readAsText(file);
    });
  };inp.click();
}
function npExport(){
  const note=_npActiveNote();if(!note)return;
  const blob=new Blob([note.content],{type:'text/markdown'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download=(note.name||'note')+'.md';a.click();URL.revokeObjectURL(a.href);
}
function npExportAll(){
  const data=JSON.stringify(_npNotes.filter(n=>!n.deleted),null,2);
  const blob=new Blob([data],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download='upd-notes.json';a.click();URL.revokeObjectURL(a.href);
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function npCopy(){
  const ta=document.getElementById('np-area');if(!ta||!ta.value)return;
  navigator.clipboard.writeText(ta.value).then(()=>{
    const btn=document.getElementById('np-copy-btn');if(!btn)return;
    const orig=btn.innerHTML;btn.innerHTML='<i class="fa-solid fa-check"></i>';
    setTimeout(()=>{btn.innerHTML=orig;},1800);
  });
}

function _npUpdateCount(){
  const ta=document.getElementById('np-area');const el=document.getElementById('np-wordcount');if(!ta||!el)return;
  const chars=ta.value.length;const words=ta.value.trim()?ta.value.trim().split(/\s+/).length:0;
  const readTime=Math.max(1,Math.round(words/200));
  el.textContent=`${words} word${words!==1?'s':''} · ${chars} char${chars!==1?'s':''} · ${readTime} min read`;
}

function _npModal(msg,onConfirm){
  const ex=document.getElementById('np-modal');if(ex)ex.remove();
  const el=document.createElement('div');el.id='np-modal';el.className='bolo-modal-overlay';
  el.innerHTML=`<div class="bolo-modal"><div class="bolo-modal-msg">${msg}</div><div class="bolo-modal-btns">
    <button class="bolo-modal-cancel" onclick="document.getElementById('np-modal').remove()">Cancel</button>
    <button class="bolo-modal-confirm" id="np-modal-ok">Confirm</button></div></div>`;
  document.body.appendChild(el);
  document.getElementById('np-modal-ok').onclick=()=>{el.remove();onConfirm();};
  el.addEventListener('click',e=>{if(e.target===el)el.remove();});
}
function _npModalHtml(bodyHtml,confirmLabel,onConfirm){
  const ex=document.getElementById('np-modal');if(ex)ex.remove();
  const el=document.createElement('div');el.id='np-modal';el.className='bolo-modal-overlay';
  el.innerHTML=`<div class="bolo-modal np-modal-wide">${bodyHtml}<div class="bolo-modal-btns">
    <button class="bolo-modal-cancel" onclick="document.getElementById('np-modal').remove()">Cancel</button>
    <button class="bolo-modal-confirm" id="np-modal-ok">${confirmLabel}</button></div></div>`;
  document.body.appendChild(el);
  document.getElementById('np-modal-ok').onclick=()=>{el.remove();onConfirm();};
  el.addEventListener('click',e=>{if(e.target===el)el.remove();});
}

// ── Init ──────────────────────────────────────────────────────────────────────

function _npInit(){
  _npLoad();_npMigrate();_npCleanTrash();
  if(!_npNotes.filter(n=>!n.deleted&&!n.archived).length){_npNotes.unshift(_npNoteDefaults());_npWrite();}

  // Feature 8: Check URL param for note
  const urlParams=new URLSearchParams(window.location.search);
  const noteParam=urlParams.get('note');
  if(noteParam){
    const targetId=+noteParam;
    if(_npNotes.find(n=>n.id===targetId))_npActiveId=targetId;
    else _npActiveId=_npNotes.find(n=>!n.deleted&&!n.archived)?.id||_npNotes[0]?.id;
  }else{
    _npActiveId=_npNotes.find(n=>!n.deleted&&!n.archived)?.id||_npNotes[0]?.id;
  }

  const sortSel=document.getElementById('np-sort-sel');if(sortSel)sortSel.value=_npSortBy;
  document.getElementById('np-compact-btn')?.classList.toggle('active',_npCompact);
  document.getElementById('np-empty-trash-btn')?.style.setProperty('display','none');
  _npUpdateViewTabs();_npRenderSidebar();_npLoadActive();

  // Restore typewriter button state
  if(_npTypewriter)document.getElementById('np-typewriter-btn')?.classList.add('active');

  // Restore split view state
  if(_npSplitView){_npSplitView=false;npToggleSplitView();}
  _npUpdateScrollSyncBtn();

  const ta=document.getElementById('np-area');
  if(ta){
    ta.addEventListener('input',_npInput);
    ta.addEventListener('scroll',_npHandleScrollSync);
    ta.addEventListener('keydown',e=>{
      const note=_npActiveNote();
      const locked=!!(note&&note.locked);

      if((e.ctrlKey||e.metaKey)&&e.key==='b'){e.preventDefault();npBold();}
      if((e.ctrlKey||e.metaKey)&&e.key==='i'){e.preventDefault();npItalic();}
      if((e.ctrlKey||e.metaKey)&&e.key==='f'){e.preventDefault();npToggleFind();}
      if((e.ctrlKey||e.metaKey)&&e.key==='s'){e.preventDefault();_npFlushSave();}

      if(e.key==='Tab'){
        e.preventDefault();
        if(e.shiftKey){npOutdent();}
        else{
          const s=ta.selectionStart,end=ta.selectionEnd;
          ta.value=ta.value.substring(0,s)+'  '+ta.value.substring(end);
          ta.selectionStart=ta.selectionEnd=s+2;
          _npInput();
        }
      }

      // Feature 5: Auto-pair brackets — skip if locked
      if(!locked){
        const pairs={'(':')','[':']','{':'}','`':'`'};
        if(pairs[e.key]!==undefined){
          const s=ta.selectionStart,en=ta.selectionEnd;
          const close=pairs[e.key];
          e.preventDefault();
          if(s!==en){
            // Wrap selection
            const sel=ta.value.substring(s,en);
            ta.value=ta.value.substring(0,s)+e.key+sel+close+ta.value.substring(en);
            ta.selectionStart=s+1;ta.selectionEnd=en+1;
          }else{
            ta.value=ta.value.substring(0,s)+e.key+close+ta.value.substring(s);
            ta.selectionStart=ta.selectionEnd=s+1;
          }
          _npInput();return;
        }
        // Backspace: delete pair
        if(e.key==='Backspace'&&ta.selectionStart===ta.selectionEnd){
          const pos=ta.selectionStart;
          const before=ta.value[pos-1],after=ta.value[pos];
          const pairMap={'(':')','[':']','{':'}','`':'`'};
          if(before&&after&&pairMap[before]===after){
            e.preventDefault();
            ta.value=ta.value.substring(0,pos-1)+ta.value.substring(pos+1);
            ta.selectionStart=ta.selectionEnd=pos-1;
            _npInput();return;
          }
        }
      }

      // Feature 6: Smart typography — operates even before char lands; skip if locked
      if(!locked&&_npSmartTypo){
        if(e.key==='-'){
          const pos=ta.selectionStart;
          if(ta.value.substring(pos-2,pos)==='--'){
            e.preventDefault();
            ta.value=ta.value.substring(0,pos-2)+'—'+ta.value.substring(pos);
            ta.selectionStart=ta.selectionEnd=pos-1;
            _npInput();return;
          }
        }
        if(e.key==='.'){
          const pos=ta.selectionStart;
          if(ta.value.substring(pos-2,pos)==='..'){
            e.preventDefault();
            ta.value=ta.value.substring(0,pos-2)+'…'+ta.value.substring(pos);
            ta.selectionStart=ta.selectionEnd=pos-1;
            _npInput();return;
          }
        }
        if(e.key==='"'){
          e.preventDefault();
          const pos=ta.selectionStart;
          const before=ta.value[pos-1]||'';
          const quote=/\s|^/.test(before)?'“':'”';
          ta.value=ta.value.substring(0,pos)+quote+ta.value.substring(pos);
          ta.selectionStart=ta.selectionEnd=pos+1;
          _npInput();return;
        }
      }

      // Feature 4: Auto-continue lists — skip if locked
      if(!locked&&e.key==='Enter'&&!e.shiftKey&&!e.ctrlKey&&!e.metaKey){
        const pos=ta.selectionStart;
        const textBefore=ta.value.substring(0,pos);
        const lineStart=textBefore.lastIndexOf('\n')+1;
        const line=ta.value.substring(lineStart,pos);
        // Match various list prefixes (order matters — checklist before bullet)
        const checkDone=/^(\s*)-\s+\[x\]\s/.exec(line);
        const checkOpen=/^(\s*)-\s+\[ \]\s/.exec(line);
        const bullet=/^(\s*)([*\-+])\s/.exec(line);
        const ordered=/^(\s*)(\d+)\.\s/.exec(line);
        let prefix=null,empty=false;
        if(checkDone||checkOpen){
          const m=checkDone||checkOpen;
          prefix=m[1]+'- [ ] ';
          empty=line.trim()==='- [ ]'||line.trim()==='- [x]';
        }else if(ordered){
          prefix=ordered[1]+(+ordered[2]+1)+'. ';
          empty=line.trim()===ordered[2]+'.';
        }else if(bullet){
          prefix=bullet[1]+bullet[2]+' ';
          empty=line.trim()===bullet[2];
        }
        if(prefix!==null){
          e.preventDefault();
          if(empty){
            // Remove the marker, insert plain newline
            ta.value=ta.value.substring(0,lineStart)+'\n'+ta.value.substring(pos);
            ta.selectionStart=ta.selectionEnd=lineStart+1;
          }else{
            ta.value=ta.value.substring(0,pos)+'\n'+prefix+ta.value.substring(pos);
            ta.selectionStart=ta.selectionEnd=pos+1+prefix.length;
          }
          _npInput();return;
        }
      }

      // Typewriter scroll after any key
      if(_npTypewriter)setTimeout(_npTypewriterScroll,0);
    });
    // Also trigger typewriter on input (handles composition)
    ta.addEventListener('input',()=>{if(_npTypewriter)_npTypewriterScroll();});
  }

  document.getElementById('np-find-input')?.addEventListener('keydown',e=>{
    if(e.key==='Enter'){e.preventDefault();e.shiftKey?npFindPrev():npFindNext();}
    if(e.key==='Escape')npToggleFind();
  });
  document.getElementById('np-img-url')?.addEventListener('keydown',e=>{
    if(e.key==='Enter'){e.preventDefault();_npInsertImage();}
    if(e.key==='Escape')document.getElementById('np-img-row').style.display='none';
  });
  document.getElementById('np-link-url')?.addEventListener('keydown',e=>{
    if(e.key==='Enter'){e.preventDefault();_npInsertLink();}
    if(e.key==='Escape')document.getElementById('np-link-row').style.display='none';
  });
  const fi=document.getElementById('np-img-file');
  if(fi)fi.onchange=e=>{
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{document.getElementById('np-img-url').value=ev.target.result;document.getElementById('np-img-alt').value=file.name.replace(/\.[^.]+$/,'');document.getElementById('np-img-alt').focus();};
    reader.readAsDataURL(file);
  };

  // Feature 8: Storage sync across tabs
  window.addEventListener('storage',e=>{
    if(e.key===NP_KEY){
      try{_npNotes=JSON.parse(e.newValue)||[];}catch(err){_npNotes=[];}
      _npRenderSidebar();
      // If active note was updated in other tab, reload it
      const note=_npActiveNote();
      const ta=document.getElementById('np-area');
      if(note&&ta&&ta.value!==note.content){ta.value=note.content;_npUpdateCount();}
    }
  });
}

window.__pageInits=window.__pageInits||{};
window.__pageInits.notepad=_npInit;
window.addEventListener('load',_npInit);
