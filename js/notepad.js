const NOTEPAD_KEY='upd-notepad';
const SAVED_KEY='upd-notepad-saved';
let _npSaveTimer=null,_npMode='edit',_npSaved=[];

function npSetMode(mode,el){
  _npMode=mode;
  document.querySelectorAll('#np-mode-toggle .qz-mode-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  const area=document.getElementById('np-area');
  const preview=document.getElementById('np-preview');
  const fmt=document.getElementById('np-format-bar');
  const imgRow=document.getElementById('np-img-row');
  if(mode==='preview'){
    area.style.display='none';
    if(fmt)fmt.style.display='none';
    if(imgRow)imgRow.style.display='none';
    preview.style.display='';
    preview.innerHTML=typeof marked!=='undefined'?marked.parse(area.value||''):'<em>Markdown renderer not loaded.</em>';
  }else{
    area.style.display='';
    if(fmt)fmt.style.display='';
    preview.style.display='none';
    area.focus();
  }
}

// ── Formatting ───────────────────────────────────────────────────────────────

function _npWrap(before,after,placeholder){
  const ta=document.getElementById('np-area');
  if(!ta)return;
  const s=ta.selectionStart,e=ta.selectionEnd;
  const sel=ta.value.substring(s,e)||placeholder;
  ta.value=ta.value.substring(0,s)+before+sel+after+ta.value.substring(e);
  ta.selectionStart=s+before.length;
  ta.selectionEnd=s+before.length+sel.length;
  ta.focus();_npInput();
}

function _npLinePrefix(prefix){
  const ta=document.getElementById('np-area');
  if(!ta)return;
  const s=ta.selectionStart;
  const lineStart=ta.value.lastIndexOf('\n',s-1)+1;
  const has=ta.value.substring(lineStart).startsWith(prefix);
  if(has){
    ta.value=ta.value.substring(0,lineStart)+ta.value.substring(lineStart+prefix.length);
    ta.selectionStart=ta.selectionEnd=Math.max(lineStart,s-prefix.length);
  }else{
    ta.value=ta.value.substring(0,lineStart)+prefix+ta.value.substring(lineStart);
    ta.selectionStart=ta.selectionEnd=s+prefix.length;
  }
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

function npCodeBlock(){
  const ta=document.getElementById('np-area');
  if(!ta)return;
  const s=ta.selectionStart,e=ta.selectionEnd;
  const sel=ta.value.substring(s,e)||'code here';
  const rep='```\n'+sel+'\n```';
  ta.value=ta.value.substring(0,s)+rep+ta.value.substring(e);
  ta.selectionStart=s+4;ta.selectionEnd=s+4+sel.length;
  ta.focus();_npInput();
}

function npHr(){
  const ta=document.getElementById('np-area');
  if(!ta)return;
  const s=ta.selectionStart;
  const ins='\n---\n';
  ta.value=ta.value.substring(0,s)+ins+ta.value.substring(s);
  ta.selectionStart=ta.selectionEnd=s+ins.length;
  ta.focus();_npInput();
}

function npApplyColor(color){_npWrap(`<span style="color:${color}">`,'</span>','text');}
function npApplySize(size){if(size)_npWrap(`<span style="font-size:${size}">`,'</span>','text');}

function npToggleImgRow(){
  const row=document.getElementById('np-img-row');
  if(!row)return;
  const open=row.style.display!=='none';
  row.style.display=open?'none':'flex';
  if(!open){
    document.getElementById('np-img-url').value='';
    document.getElementById('np-img-alt').value='';
    document.getElementById('np-img-url').focus();
  }
}

function _npInsertImage(){
  const urlEl=document.getElementById('np-img-url');
  const altEl=document.getElementById('np-img-alt');
  const url=urlEl.value.trim();
  if(!url){urlEl.focus();return;}
  const alt=altEl.value.trim()||'image';
  const ta=document.getElementById('np-area');
  const s=ta.selectionStart;
  const ins=`![${alt}](${url})\n`;
  ta.value=ta.value.substring(0,s)+ins+ta.value.substring(s);
  ta.selectionStart=ta.selectionEnd=s+ins.length;
  ta.focus();_npInput();
  document.getElementById('np-img-row').style.display='none';
}

// ── Saved Notes ──────────────────────────────────────────────────────────────

function _npLoadSaved(){
  try{_npSaved=JSON.parse(localStorage.getItem(SAVED_KEY))||[];}
  catch(e){_npSaved=[];}
}

function _npWriteSaved(){localStorage.setItem(SAVED_KEY,JSON.stringify(_npSaved));}

function npShowSaveRow(){
  const row=document.getElementById('np-save-row');
  const input=document.getElementById('np-save-name');
  if(!row)return;
  row.style.display='flex';
  input.value='';
  input.focus();
}

function npHideSaveRow(){
  const row=document.getElementById('np-save-row');
  if(row)row.style.display='none';
}

function _npDoSave(){
  const ta=document.getElementById('np-area');
  const input=document.getElementById('np-save-name');
  if(!ta||!input)return;
  const name=input.value.trim();
  if(!name)return input.focus();
  const content=ta.value;
  const now=new Date();
  const ts=now.toLocaleDateString('en-AU',{day:'2-digit',month:'short',year:'2-digit'})+' · '+now.toLocaleTimeString('en-AU',{hour:'2-digit',minute:'2-digit',hour12:false});
  _npSaved.unshift({id:Date.now(),name,content,ts});
  _npWriteSaved();
  npHideSaveRow();
  _npRenderSaved();
}

function npLoadNote(id){
  const note=_npSaved.find(n=>n.id===id);
  if(!note)return;
  _npModal('Load "'+note.name+'"? This will replace your current scratch pad.',()=>{
    const ta=document.getElementById('np-area');
    if(ta){ta.value=note.content;_npInput();}
    if(_npMode==='preview'){
      const preview=document.getElementById('np-preview');
      if(preview)preview.innerHTML=typeof marked!=='undefined'?marked.parse(note.content):'';
    }
  });
}

function npDeleteNote(id){
  const note=_npSaved.find(n=>n.id===id);
  if(!note)return;
  _npModal('Delete "'+note.name+'"? This cannot be undone.',()=>{
    _npSaved=_npSaved.filter(n=>n.id!==id);
    _npWriteSaved();_npRenderSaved();
  });
}

function _npRenderSaved(){
  const panel=document.getElementById('np-saved-panel');
  if(!panel)return;
  if(!_npSaved.length){panel.innerHTML='';return;}
  const cards=_npSaved.map(n=>{
    const preview=n.content.replace(/[#*`>~\[\]]/g,'').split('\n').find(l=>l.trim())||'';
    return`<div class="np-saved-card">
      <div class="np-saved-info" onclick="npLoadNote(${n.id})" title="Click to load">
        <div class="np-saved-name">${escapeHtml(n.name)}</div>
        <div class="np-saved-meta">${escapeHtml(n.ts)}</div>
        ${preview?`<div class="np-saved-preview">${escapeHtml(preview.slice(0,80))}</div>`:''}
      </div>
      <div class="np-saved-actions">
        <button class="np-btn" onclick="npLoadNote(${n.id})"><i class="fa-solid fa-upload"></i> Load</button>
        <button class="np-btn np-btn-danger" onclick="npDeleteNote(${n.id})"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>`;
  }).join('');
  panel.innerHTML=`<div class="np-saved-header"><i class="fa-solid fa-folder-open"></i> Saved Notes (${_npSaved.length})</div><div class="np-saved-list">${cards}</div>`;
}

function _npModal(msg,onConfirm){
  const existing=document.getElementById('np-modal');
  if(existing)existing.remove();
  const el=document.createElement('div');
  el.id='np-modal';
  el.className='bolo-modal-overlay';
  el.innerHTML=`<div class="bolo-modal">
    <div class="bolo-modal-msg">${escapeHtml(msg)}</div>
    <div class="bolo-modal-btns">
      <button class="bolo-modal-cancel" onclick="document.getElementById('np-modal').remove()">Cancel</button>
      <button class="bolo-modal-confirm" id="np-modal-ok">Confirm</button>
    </div>
  </div>`;
  document.body.appendChild(el);
  document.getElementById('np-modal-ok').onclick=()=>{el.remove();onConfirm();};
  el.addEventListener('click',e=>{if(e.target===el)el.remove();});
}

function _npUpdateCount(){
  const ta=document.getElementById('np-area');
  const el=document.getElementById('np-wordcount');
  if(!ta||!el)return;
  const chars=ta.value.length;
  const words=ta.value.trim()?ta.value.trim().split(/\s+/).length:0;
  el.textContent=`${words} word${words!==1?'s':''} · ${chars} char${chars!==1?'s':''}`;
}

function npSave(){
  const ta=document.getElementById('np-area');
  if(!ta)return;
  localStorage.setItem(NOTEPAD_KEY,ta.value);
  _npUpdateCount();
  const el=document.getElementById('np-saved');
  if(el){
    const t=new Date().toLocaleTimeString('en-AU',{hour:'2-digit',minute:'2-digit',hour12:false});
    el.textContent='Saved '+t;
  }
}

function _npInput(){
  _npUpdateCount();
  if(_npSaveTimer)clearTimeout(_npSaveTimer);
  _npSaveTimer=setTimeout(npSave,400);
}

function npLoad(){
  const ta=document.getElementById('np-area');
  if(!ta)return;
  ta.value=localStorage.getItem(NOTEPAD_KEY)||'';
  _npUpdateCount();
  const el=document.getElementById('np-saved');
  if(el)el.textContent=ta.value?'Loaded':'';
}

function npClear(){
  const ta=document.getElementById('np-area');
  if(!ta||!ta.value)return;
  _npModal('Clear all notes? This cannot be undone.',()=>{
    ta.value='';
    localStorage.removeItem(NOTEPAD_KEY);
    _npUpdateCount();
    const el=document.getElementById('np-saved');
    if(el)el.textContent='Cleared';
    ta.focus();
  });
}

function npCopy(){
  const ta=document.getElementById('np-area');
  if(!ta||!ta.value)return;
  navigator.clipboard.writeText(ta.value).then(()=>{
    const btn=document.getElementById('np-copy-btn');
    if(btn){
      const orig=btn.innerHTML;
      btn.innerHTML='<i class="fa-solid fa-check"></i> Copied';
      setTimeout(()=>{btn.innerHTML=orig;},1800);
    }
  });
}

function _npInit(){
  _npMode='edit';
  const area=document.getElementById('np-area');
  const preview=document.getElementById('np-preview');
  const fmt=document.getElementById('np-format-bar');
  const saveRow=document.getElementById('np-save-row');
  const imgRow=document.getElementById('np-img-row');
  if(area)area.style.display='';
  if(preview)preview.style.display='none';
  if(fmt)fmt.style.display='';
  if(saveRow)saveRow.style.display='none';
  if(imgRow)imgRow.style.display='none';
  document.querySelectorAll('#np-mode-toggle .qz-mode-btn').forEach((b,i)=>{
    b.classList.toggle('active',i===0);
  });
  _npLoadSaved();
  _npRenderSaved();
  npLoad();
  if(area){
    area.addEventListener('input',_npInput);
    area.focus();
  }
  document.getElementById('np-save-name')?.addEventListener('keydown',e=>{
    if(e.key==='Enter'){e.preventDefault();_npDoSave();}
    if(e.key==='Escape')npHideSaveRow();
  });
  document.getElementById('np-img-url')?.addEventListener('keydown',e=>{
    if(e.key==='Enter'){e.preventDefault();_npInsertImage();}
    if(e.key==='Escape')document.getElementById('np-img-row').style.display='none';
  });
  const fileInput=document.getElementById('np-img-file');
  if(fileInput){
    fileInput.onchange=e=>{
      const file=e.target.files[0];
      if(!file)return;
      const reader=new FileReader();
      reader.onload=ev=>{
        document.getElementById('np-img-url').value=ev.target.result;
        document.getElementById('np-img-alt').value=file.name.replace(/\.[^.]+$/,'');
        document.getElementById('np-img-alt').focus();
      };
      reader.readAsDataURL(file);
    };
  }
}

window.__pageInits=window.__pageInits||{};
window.__pageInits.notepad=_npInit;
window.addEventListener('load',_npInit);
