const NP_KEY='upd-np-notes-v2',NP_TAGS_KEY='upd-np-tags',NP_PREFS_KEY='upd-np-prefs';
let _npNotes=[],_npTags=[];
let _npActiveId=null,_npMode='edit',_npSaveTimer=null;
let _npFindMatches=[],_npFindIdx=0;
let _npSortBy='modified',_npSidebarView='notes',_npCompact=false;
let _npSidebarSearch='',_npTagFilter=null,_npDragId=null;
let _npSelectMode=false,_npSelectedIds=new Set();

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
  }catch(e){}
}
function _npWrite(){localStorage.setItem(NP_KEY,JSON.stringify(_npNotes));}
function _npWriteTags(){localStorage.setItem(NP_TAGS_KEY,JSON.stringify(_npTags));}
function _npWritePrefs(){localStorage.setItem(NP_PREFS_KEY,JSON.stringify({sortBy:_npSortBy,compact:_npCompact,sidebarView:_npSidebarView,tagFilter:_npTagFilter}));}
function _npActiveNote(){return _npNotes.find(n=>n.id===_npActiveId)||null;}
function _npNoteDefaults(p={}){return{id:Date.now(),name:'',content:'',modified:Date.now(),pinned:false,color:null,emoji:null,tags:[],archived:false,deleted:false,deletedAt:null,...p};}

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
    case'manual':break; // preserve array order
    default:s.sort((a,b)=>b.modified-a.modified);
  }
  if(_npSidebarView==='notes'){
    return{pinned:s.filter(n=>n.pinned),unpinned:s.filter(n=>!n.pinned)};
  }
  return{pinned:[],unpinned:s};
}

function _npRenderSidebar(){
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
      <button class="np-note-pin-btn${n.pinned?' active':''}" onclick="npTogglePin(${n.id},event)" title="${n.pinned?'Unpin':'Pin'}"><i class="fa-solid fa-thumbtack"></i></button>
      <button class="np-note-action-btn" onclick="npShowNoteOpts(${n.id},event)" title="Options"><i class="fa-solid fa-ellipsis-vertical"></i></button>
    </div>
  </div>`;
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
  // Switch to manual order so re-render doesn't re-sort
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

function npToggleSelectMode(){
  _npSelectMode=!_npSelectMode;
  _npSelectedIds.clear();
  const btn=document.getElementById('np-select-btn');
  const bar=document.getElementById('np-select-bar');
  if(btn)btn.classList.toggle('active',_npSelectMode);
  if(bar)bar.style.display=_npSelectMode?'flex':'none';
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
    _npNotes.forEach(n=>{
      if(_npSelectedIds.has(n.id)){n.archived=true;n.pinned=false;}
    });
    _npWrite();
    if(_npSelectedIds.has(_npActiveId)){
      _npActiveId=_npNotes.find(n=>!n.archived&&!n.deleted)?.id||null;
      if(!_npActiveId)npNewNote();else _npLoadActive();
    }
    _npSelectMode=false;_npSelectedIds.clear();
    const btn=document.getElementById('np-select-btn');const bar=document.getElementById('np-select-bar');
    if(btn)btn.classList.remove('active');if(bar)bar.style.display='none';
    _npRenderSidebar();
  });
}

function npDeleteSelected(){
  if(!_npSelectedIds.size)return;
  const count=_npSelectedIds.size;
  _npModal(`Move ${count} note${count!==1?'s':''} to trash?`,()=>{
    const now=Date.now();
    _npNotes.forEach(n=>{
      if(_npSelectedIds.has(n.id)){n.deleted=true;n.deletedAt=now;n.pinned=false;}
    });
    _npWrite();
    if(_npSelectedIds.has(_npActiveId)){
      _npActiveId=_npNotes.find(n=>!n.archived&&!n.deleted)?.id||null;
      if(!_npActiveId)npNewNote();else _npLoadActive();
    }
    _npSelectMode=false;_npSelectedIds.clear();
    const btn=document.getElementById('np-select-btn');const bar=document.getElementById('np-select-bar');
    if(btn)btn.classList.remove('active');if(bar)bar.style.display='none';
    _npRenderSidebar();
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

function _npLoadActive(){
  const note=_npActiveNote();
  const ta=document.getElementById('np-area');
  const t=document.getElementById('np-note-title');
  if(!ta)return;
  ta.value=note?note.content:'';
  if(t)t.value=note?(note.name||''):'';
  _npUpdateCount();
  if(_npMode==='preview')_npRenderPreview();else ta.focus();
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
      <div class="np-opts-colors">${NP_COLORS.map(c=>`<button class="np-color-sw${c===(note.color||'')?' active':''}" style="${c?'background:'+c:''}" onclick="npSetNoteColor(${id},'${c}')"></button>`).join('')}</div>
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
    if(!popup.contains(ev.target)&&ev.target!==btn){popup.remove();document.removeEventListener('click',h,true);}
  },true),0);
}

function _npCloseOpts(){document.getElementById('np-opts-popup')?.remove();}

// ── Sort / View / Compact ─────────────────────────────────────────────────────

function npSetSort(s){_npSortBy=s;_npWritePrefs();_npRenderSidebar();}

function npSetSidebarView(v){
  _npSidebarView=v;_npWritePrefs();_npUpdateViewTabs();_npRenderSidebar();
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
}

function _npFlushSave(){
  const note=_npActiveNote();if(!note)return;
  const ta=document.getElementById('np-area');if(!ta)return;
  note.content=ta.value;note.modified=Date.now();
  if(!note.name){
    const first=ta.value.split('\n').map(l=>l.replace(/^#+\s*/,'')).find(l=>l.trim());
    if(first){note.name=first.trim().slice(0,40);const t=document.getElementById('np-note-title');if(t&&!t.value)t.placeholder=note.name;}
  }
  _npWrite();_npRenderSidebar();
  const ind=document.getElementById('np-saved-indicator');
  if(ind){const t=new Date().toLocaleTimeString('en-AU',{hour:'2-digit',minute:'2-digit',hour12:false});ind.textContent='Saved '+t;}
}

// ── Mode ──────────────────────────────────────────────────────────────────────

function npSetMode(mode,el){
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

function _npRenderPreview(){
  const ta=document.getElementById('np-area'),preview=document.getElementById('np-preview');
  if(!ta||!preview)return;
  if(typeof marked==='undefined'){preview.innerHTML='<em>Markdown renderer not loaded.</em>';return;}
  marked.use({gfm:true,breaks:true});
  let html=marked.parse(ta.value||'');
  html=html.replace(/<input\s+(?:[^>]*?\s+)?disabled(?:\s+[^>]*)?\s*>/g,m=>m.replace(' disabled','').replace(/\/>$/,'onclick="npToggleCheck(this)">'));
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
function npHighlight(){_npWrap('<mark>','</mark>','highlighted text');}
function npSup(){_npWrap('<sup>','</sup>','text');}
function npSub(){_npWrap('<sub>','</sub>','text');}
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
function npApplyColor(color){_npWrap(`<span style="color:${color}">`,'</span>','text');}
function npApplySize(size){if(size)_npWrap(`<span style="font-size:${size}">`,'</span>','text');}

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

// ── Link ──────────────────────────────────────────────────────────────────────

function npToggleLinkRow(){
  const row=document.getElementById('np-link-row');if(!row)return;
  const open=row.style.display!=='none';
  row.style.display=open?'none':'flex';
  if(!open){
    // Pre-fill text with current selection
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

// ── Find & Replace ────────────────────────────────────────────────────────────

function npToggleFind(){
  const bar=document.getElementById('np-find-bar');if(!bar)return;
  const open=bar.style.display!=='none';
  bar.style.display=open?'none':'flex';
  if(!open)document.getElementById('np-find-input')?.focus();
  else{_npFindMatches=[];_npFindIdx=0;}
}
function npFindUpdate(){
  const q=document.getElementById('np-find-input')?.value||'';
  const ta=document.getElementById('np-area');const countEl=document.getElementById('np-find-count');
  if(!ta||!q){_npFindMatches=[];_npFindIdx=0;if(countEl)countEl.textContent='';return;}
  const regex=new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi');
  _npFindMatches=[];let m;while((m=regex.exec(ta.value))!==null)_npFindMatches.push(m.index);
  _npFindIdx=0;
  if(countEl)countEl.textContent=_npFindMatches.length?`1/${_npFindMatches.length}`:'No matches';
  if(_npFindMatches.length)_npSelectMatch();
}
function _npSelectMatch(){
  const q=document.getElementById('np-find-input')?.value||'';
  const ta=document.getElementById('np-area');const countEl=document.getElementById('np-find-count');
  if(!ta||!q||!_npFindMatches.length)return;
  const start=_npFindMatches[_npFindIdx];
  ta.setSelectionRange(start,start+q.length);ta.focus();
  const lh=parseInt(getComputedStyle(ta).lineHeight)||20;
  ta.scrollTop=(ta.value.substring(0,start).split('\n').length-1)*lh-ta.clientHeight/2;
  if(countEl)countEl.textContent=`${_npFindIdx+1}/${_npFindMatches.length}`;
}
function npFindNext(){if(!_npFindMatches.length)return;_npFindIdx=(_npFindIdx+1)%_npFindMatches.length;_npSelectMatch();}
function npFindPrev(){if(!_npFindMatches.length)return;_npFindIdx=(_npFindIdx-1+_npFindMatches.length)%_npFindMatches.length;_npSelectMatch();}
function npReplace(){
  const q=document.getElementById('np-find-input')?.value||'';const rep=document.getElementById('np-replace-input')?.value||'';
  const ta=document.getElementById('np-area');if(!ta||!q||!_npFindMatches.length)return;
  const start=_npFindMatches[_npFindIdx];
  if(ta.selectionStart===start&&ta.selectionEnd===start+q.length){ta.value=ta.value.substring(0,start)+rep+ta.value.substring(start+q.length);_npInput();npFindUpdate();}
}
function npReplaceAll(){
  const q=document.getElementById('np-find-input')?.value||'';const rep=document.getElementById('np-replace-input')?.value||'';
  const ta=document.getElementById('np-area');if(!ta||!q)return;
  ta.value=ta.value.replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'),rep);_npInput();npFindUpdate();
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
    const orig=btn.innerHTML;btn.innerHTML='<i class="fa-solid fa-check"></i> Copied';
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
  _npActiveId=_npNotes.find(n=>!n.deleted&&!n.archived)?.id||_npNotes[0]?.id;
  const sortSel=document.getElementById('np-sort-sel');if(sortSel)sortSel.value=_npSortBy;
  document.getElementById('np-compact-btn')?.classList.toggle('active',_npCompact);
  document.getElementById('np-empty-trash-btn')?.style.setProperty('display','none');
  _npUpdateViewTabs();_npRenderSidebar();_npLoadActive();
  const ta=document.getElementById('np-area');
  if(ta){
    ta.addEventListener('input',_npInput);
    ta.addEventListener('keydown',e=>{
      if((e.ctrlKey||e.metaKey)&&e.key==='b'){e.preventDefault();npBold();}
      if((e.ctrlKey||e.metaKey)&&e.key==='i'){e.preventDefault();npItalic();}
      if((e.ctrlKey||e.metaKey)&&e.key==='f'){e.preventDefault();npToggleFind();}
      if((e.ctrlKey||e.metaKey)&&e.key==='s'){e.preventDefault();_npFlushSave();}
    });
  }
  document.getElementById('np-find-input')?.addEventListener('keydown',e=>{
    if(e.key==='Enter'){e.preventDefault();e.shiftKey?npFindPrev():npFindNext();}
    if(e.key==='Escape')npToggleFind();
  });
  document.getElementById('np-img-url')?.addEventListener('keydown',e=>{
    if(e.key==='Enter'){e.preventDefault();_npInsertImage();}
    if(e.key==='Escape')document.getElementById('np-img-row').style.display='none';
  });
  const fi=document.getElementById('np-img-file');
  if(fi)fi.onchange=e=>{
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{document.getElementById('np-img-url').value=ev.target.result;document.getElementById('np-img-alt').value=file.name.replace(/\.[^.]+$/,'');document.getElementById('np-img-alt').focus();};
    reader.readAsDataURL(file);
  };
}

window.__pageInits=window.__pageInits||{};
window.__pageInits.notepad=_npInit;
window.addEventListener('load',_npInit);
