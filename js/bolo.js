const BOLO_KEY='upd-bolo-board';
let _bolos=[],_boloFilter='active',_boloEditId=null;
const _PRIO_ORDER={high:0,medium:1,low:2};

function _boloLoad(){
  try{_bolos=JSON.parse(localStorage.getItem(BOLO_KEY))||[];}
  catch(e){_bolos=[];}
}

function _boloSave(){localStorage.setItem(BOLO_KEY,JSON.stringify(_bolos));}

function _boloTimestamp(){
  const n=new Date();
  const t=n.toLocaleTimeString('en-AU',{hour:'2-digit',minute:'2-digit',hour12:false});
  const d=n.toLocaleDateString('en-AU',{day:'2-digit',month:'short',year:'2-digit'});
  return`${t} · ${d}`;
}

// ── Modal ────────────────────────────────────────────────────────────────────

function _boloModal(msg,onConfirm){
  const existing=document.getElementById('bolo-modal');
  if(existing)existing.remove();
  const el=document.createElement('div');
  el.id='bolo-modal';
  el.className='bolo-modal-overlay';
  el.innerHTML=`<div class="bolo-modal">
    <div class="bolo-modal-msg">${escapeHtml(msg)}</div>
    <div class="bolo-modal-btns">
      <button class="bolo-modal-cancel" onclick="document.getElementById('bolo-modal').remove()">Cancel</button>
      <button class="bolo-modal-confirm" id="bolo-modal-ok">Confirm</button>
    </div>
  </div>`;
  document.body.appendChild(el);
  document.getElementById('bolo-modal-ok').onclick=()=>{el.remove();onConfirm();};
  el.addEventListener('click',e=>{if(e.target===el)el.remove();});
}

// ── Add ──────────────────────────────────────────────────────────────────────

function boloAdd(){
  const get=id=>(document.getElementById(id)?.value||'').trim();
  const vehicle=get('bolo-vehicle'),plate=get('bolo-plate');
  const suspect=get('bolo-suspect'),reason=get('bolo-reason');
  const priority=get('bolo-priority')||'high';
  if(!vehicle&&!suspect&&!reason){
    const form=document.getElementById('bolo-form');
    form?.classList.add('bolo-shake');
    setTimeout(()=>form?.classList.remove('bolo-shake'),400);
    return;
  }
  _bolos.unshift({id:Date.now(),ts:_boloTimestamp(),vehicle,plate,suspect,reason,priority,resolved:false});
  _boloSave();
  ['bolo-vehicle','bolo-plate','bolo-suspect','bolo-reason'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.value='';
  });
  document.getElementById('bolo-priority').value='high';
  if(_boloFilter==='resolved')boloSetFilter('active',document.querySelector('.bolo-tab'));
  else boloRender();
  document.getElementById('bolo-vehicle')?.focus();
}

// ── Inline edit ──────────────────────────────────────────────────────────────

function boloEdit(id){
  _boloEditId=id;
  boloRender();
  setTimeout(()=>document.getElementById('bolo-ie-vehicle')?.focus(),30);
}

function boloCancelInline(){
  _boloEditId=null;
  boloRender();
}

function boloSaveInline(){
  if(_boloEditId===null)return;
  const get=id=>(document.getElementById(id)?.value||'').trim();
  const b=_bolos.find(e=>e.id===_boloEditId);
  if(b){
    Object.assign(b,{
      vehicle:get('bolo-ie-vehicle'),plate:get('bolo-ie-plate'),
      suspect:get('bolo-ie-suspect'),reason:get('bolo-ie-reason'),
      priority:get('bolo-ie-priority')||'high'
    });
  }
  _boloEditId=null;
  _boloSave();boloRender();
}

// ── Copy for 311 ─────────────────────────────────────────────────────────────

function boloCopy311(id){
  const b=_bolos.find(e=>e.id===id);
  if(!b)return;
  const parts=['311 BOLO'];
  if(b.vehicle)parts.push('Vehicle: '+b.vehicle+(b.plate?' · '+b.plate:''));
  else if(b.plate)parts.push('Plate: '+b.plate);
  if(b.suspect)parts.push('Suspect: '+b.suspect);
  if(b.reason)parts.push(b.reason);
  navigator.clipboard.writeText(parts.join(' | ')).then(()=>{
    const btn=document.querySelector(`.bolo-copy-btn[data-id="${id}"]`);
    if(btn){
      const orig=btn.innerHTML;
      btn.innerHTML='<i class="fa-solid fa-check"></i> Copied';
      setTimeout(()=>{btn.innerHTML=orig;},1800);
    }
  });
}

// ── Actions ──────────────────────────────────────────────────────────────────

function boloResolve(id){
  const b=_bolos.find(e=>e.id===id);
  if(b){b.resolved=!b.resolved;_boloSave();boloRender();}
}

function boloDelete(id){
  _boloModal('Delete this BOLO? This cannot be undone.',()=>{
    _bolos=_bolos.filter(e=>e.id!==id);
    if(_boloEditId===id)_boloEditId=null;
    _boloSave();boloRender();
  });
}

function boloClearResolved(){
  _boloModal('Remove all resolved BOLOs? This cannot be undone.',()=>{
    _bolos=_bolos.filter(e=>!e.resolved);
    _boloSave();boloRender();
  });
}

function boloSetFilter(f,el){
  _boloFilter=f;
  document.querySelectorAll('.bolo-tab').forEach(t=>t.classList.remove('active'));
  (el||document.querySelector(`.bolo-tab[data-f="${f}"]`))?.classList.add('active');
  boloRender();
}

// ── Render ───────────────────────────────────────────────────────────────────

function _boloCardNormal(b){
  const prio=b.priority||'medium';
  const prioLabel=prio==='high'?'HIGH':prio==='medium'?'MED':'LOW';
  const vehicleHtml=b.vehicle?`<div class="bolo-field"><span class="bolo-lbl">Vehicle</span><span class="bolo-val">${escapeHtml(b.vehicle)}${b.plate?` &nbsp;<span class="bolo-plate">${escapeHtml(b.plate)}</span>`:''}</span></div>`:'';
  const suspectHtml=b.suspect?`<div class="bolo-field"><span class="bolo-lbl">Suspect</span><span class="bolo-val">${escapeHtml(b.suspect)}</span></div>`:'';
  const reasonHtml=b.reason?`<div class="bolo-reason">${escapeHtml(b.reason)}</div>`:'';
  return`<div class="bolo-card bolo-prio-${prio}${b.resolved?' bolo-resolved':''}">
    <div class="bolo-card-head">
      <span class="bolo-prio-pill bolo-pp-${prio}">${prioLabel}</span>
      <span class="bolo-ts">${escapeHtml(b.ts)}</span>
      ${b.resolved?'<span class="bolo-res-badge">Resolved</span>':''}
    </div>
    <div class="bolo-card-body">${vehicleHtml}${suspectHtml}${reasonHtml}</div>
    <div class="bolo-card-foot">
      <button class="bolo-btn bolo-btn-res" onclick="boloResolve(${b.id})">${b.resolved?'<i class="fa-solid fa-rotate-left"></i> Reopen':'<i class="fa-solid fa-check"></i> Resolve'}</button>
      <button class="bolo-btn bolo-btn-edit" onclick="boloEdit(${b.id})"><i class="fa-solid fa-pen"></i> Edit</button>
      <button class="bolo-copy-btn bolo-btn" data-id="${b.id}" onclick="boloCopy311(${b.id})"><i class="fa-solid fa-copy"></i> 311</button>
      <button class="bolo-btn bolo-btn-del" onclick="boloDelete(${b.id})"><i class="fa-solid fa-trash"></i></button>
    </div>
  </div>`;
}

function _boloCardEdit(b){
  const prio=b.priority||'medium';
  const prioLabel=prio==='high'?'HIGH':prio==='medium'?'MED':'LOW';
  const opt=v=>`<option value="${v}"${b.priority===v?' selected':''}>${v==='high'?'High Priority':v==='medium'?'Medium Priority':'Low Priority'}</option>`;
  return`<div class="bolo-card bolo-prio-${prio} bolo-inline-edit">
    <div class="bolo-card-head">
      <span class="bolo-prio-pill bolo-pp-${prio}">${prioLabel}</span>
      <span class="bolo-ts">${escapeHtml(b.ts)}</span>
      <span class="bolo-edit-badge">Editing</span>
    </div>
    <div class="bolo-ie-grid">
      <input id="bolo-ie-vehicle" class="bolo-input" value="${escapeHtml(b.vehicle||'')}" placeholder="Vehicle (colour, make, model)">
      <input id="bolo-ie-plate" class="bolo-input" value="${escapeHtml(b.plate||'')}" placeholder="Plate">
      <input id="bolo-ie-suspect" class="bolo-input" value="${escapeHtml(b.suspect||'')}" placeholder="Suspect description">
      <select id="bolo-ie-priority" class="bolo-input bolo-select">${opt('high')}${opt('medium')}${opt('low')}</select>
    </div>
    <input id="bolo-ie-reason" class="bolo-input bolo-ie-reason-input" value="${escapeHtml(b.reason||'')}" placeholder="Reason / offence">
    <div class="bolo-ie-btns">
      <button class="bolo-btn bolo-btn-save" onclick="boloSaveInline()"><i class="fa-solid fa-floppy-disk"></i> Save</button>
      <button class="bolo-btn bolo-btn-cancel-ie" onclick="boloCancelInline()">Cancel</button>
    </div>
  </div>`;
}

function boloRender(){
  const list=document.getElementById('bolo-list');
  const countEl=document.getElementById('bolo-count');
  const clearBtn=document.getElementById('bolo-clear-btn');
  if(!list)return;
  const activeCount=_bolos.filter(b=>!b.resolved).length;
  const resolvedCount=_bolos.filter(b=>b.resolved).length;
  if(countEl)countEl.textContent=activeCount+' active · '+resolvedCount+' resolved';
  if(clearBtn)clearBtn.style.display=resolvedCount?'':'none';
  const filtered=_bolos.filter(b=>{
    if(_boloFilter==='active')return!b.resolved;
    if(_boloFilter==='resolved')return b.resolved;
    return true;
  });
  if(!filtered.length){
    const msg=_boloFilter==='active'?'No active BOLOs on the board.':_boloFilter==='resolved'?'No resolved BOLOs.':'No BOLOs yet — add one above.';
    list.innerHTML=`<div class="bolo-empty"><i class="fa-solid fa-binoculars"></i><span>${msg}</span></div>`;
    return;
  }
  const sorted=[...filtered].sort((a,b)=>(_PRIO_ORDER[a.priority]??1)-(_PRIO_ORDER[b.priority]??1));
  list.innerHTML=sorted.map(b=>b.id===_boloEditId?_boloCardEdit(b):_boloCardNormal(b)).join('');

  document.getElementById('bolo-ie-reason')?.addEventListener('keydown',e=>{
    if(e.key==='Enter'){e.preventDefault();boloSaveInline();}
  });
}

window.__pageInits=window.__pageInits||{};
window.__pageInits.bolo=function(){_boloLoad();_boloEditId=null;boloRender();};
window.addEventListener('load',()=>{
  _boloLoad();boloRender();
  document.getElementById('bolo-reason')?.addEventListener('keydown',e=>{
    if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();boloAdd();}
  });
});
