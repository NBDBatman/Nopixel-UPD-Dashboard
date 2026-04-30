let _bolos=[],_boloFilter='active',_boloEditId=null,_boloListenerActive=false;
const _PRIO_ORDER={high:0,medium:1,low:2};

// ── Helpers ───────────────────────────────────────────────────────────────────

function _boloTimestamp(){
  const n=new Date();
  const t=n.toLocaleTimeString('en-AU',{hour:'2-digit',minute:'2-digit',hour12:false});
  const d=n.toLocaleDateString('en-AU',{day:'2-digit',month:'short',year:'2-digit'});
  return`${t} · ${d}`;
}

function _mapBolo(row){
  return{
    id:row.id,vehicle:row.vehicle||'',plate:row.plate||'',
    owner:row.owner||'',suspect:row.suspect||'',
    reason:row.reason||'',priority:row.priority||'high',
    resolved:row.resolved||false,ts:row.ts||'',
    addedBy:row.added_by||''
  };
}

// ── Supabase ──────────────────────────────────────────────────────────────────

async function _boloFetch(){
  if(!window._sb)return;
  const{data,error}=await _sb.from('bolos').select('*').order('created_at',{ascending:false});
  if(!error&&data){_bolos=data.map(_mapBolo);boloRender();}
}

function _boloSetupListener(){
  if(_boloListenerActive||!window._sb)return;
  _boloListenerActive=true;
  _boloFetch();
  _sb.channel('bolos-changes')
    .on('postgres_changes',{event:'*',schema:'public',table:'bolos'},()=>{_boloFetch();})
    .subscribe();
}

// ── Audit Log ────────────────────────────────────────────────────────────────

async function _boloLog(action,summary){
  const session=_getSession();
  const{error}=await _sb.from('bolo_logs').insert({
    action,
    bolo_summary:summary||'',
    officer:session?session.callsign+' '+session.name:'Unknown'
  });
  if(error)console.error('bolo_logs insert failed:',error.message,error.code);
}

function _boloSummary(b){
  const parts=[];
  if(b.vehicle)parts.push(b.vehicle);
  if(b.plate)parts.push(b.plate);
  if(b.suspect)parts.push(b.suspect);
  return parts.join(' · ')||b.reason||'BOLO';
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function _boloModal(msg,onConfirm){
  const existing=document.getElementById('bolo-modal');
  if(existing)existing.remove();
  const el=document.createElement('div');
  el.id='bolo-modal';el.className='bolo-modal-overlay';
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

// ── Add ───────────────────────────────────────────────────────────────────────

async function boloAdd(){
  const get=id=>(document.getElementById(id)?.value||'').trim();
  const vehicle=get('bolo-vehicle'),plate=get('bolo-plate');
  const suspect=get('bolo-suspect'),reason=get('bolo-reason');
  const owner=get('bolo-owner'),priority=get('bolo-priority')||'high';
  if(!vehicle&&!plate&&!suspect&&!reason){
    const form=document.getElementById('bolo-form');
    form?.classList.add('bolo-shake');
    setTimeout(()=>form?.classList.remove('bolo-shake'),400);
    return;
  }
  const session=_getSession();
  await _sb.from('bolos').insert({
    vehicle,plate,owner,suspect,reason,priority,
    resolved:false,ts:_boloTimestamp(),
    added_by:session?session.callsign+' '+session.name:''
  });
  _boloLog('Added BOLO',[vehicle,plate,suspect].filter(Boolean).join(' · ')||reason);
  _boloFetch();
  ['bolo-vehicle','bolo-plate','bolo-owner','bolo-suspect','bolo-reason'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.value='';
  });
  document.getElementById('bolo-priority').value='high';
  if(_boloFilter==='resolved')boloSetFilter('active',document.querySelector('.bolo-tab'));
  document.getElementById('bolo-vehicle')?.focus();
}

// ── Inline edit ───────────────────────────────────────────────────────────────

function boloEdit(id){_boloEditId=id;boloRender();setTimeout(()=>document.getElementById('bolo-ie-vehicle')?.focus(),30);}
function boloCancelInline(){_boloEditId=null;boloRender();}

async function boloSaveInline(){
  if(_boloEditId===null)return;
  const get=id=>(document.getElementById(id)?.value||'').trim();
  const editedB=_bolos.find(e=>e.id===_boloEditId);
  await _sb.from('bolos').update({
    vehicle:get('bolo-ie-vehicle'),plate:get('bolo-ie-plate'),
    owner:get('bolo-ie-owner'),suspect:get('bolo-ie-suspect'),
    reason:get('bolo-ie-reason'),priority:get('bolo-ie-priority')||'high'
  }).eq('id',_boloEditId);
  if(editedB)_boloLog('Edited BOLO',_boloSummary(editedB));
  _boloEditId=null;
  _boloFetch();
}

// ── Copy for 311 ─────────────────────────────────────────────────────────────

function boloCopy311(id){
  const b=_bolos.find(e=>e.id===id);if(!b)return;
  const parts=['311 BOLO'];
  if(b.vehicle)parts.push('Vehicle: '+b.vehicle+(b.plate?' · '+b.plate:''));
  else if(b.plate)parts.push('Plate: '+b.plate);
  if(b.owner)parts.push('Owner: '+b.owner);
  if(b.suspect)parts.push('Suspect: '+b.suspect);
  if(b.reason)parts.push(b.reason);
  navigator.clipboard.writeText(parts.join(' | ')).then(()=>{
    const btn=document.querySelector(`.bolo-copy-btn[data-id="${id}"]`);
    if(btn){const orig=btn.innerHTML;btn.innerHTML='<i class="fa-solid fa-check"></i> Copied';setTimeout(()=>{btn.innerHTML=orig;},1800);}
  });
}

// ── Actions ───────────────────────────────────────────────────────────────────

async function boloResolve(id){
  const b=_bolos.find(e=>e.id===id);
  if(b){
    await _sb.from('bolos').update({resolved:!b.resolved}).eq('id',id);
    _boloLog((b.resolved?'Reopened':'Resolved')+' BOLO',_boloSummary(b));
    _boloFetch();
  }
}

function boloDelete(id){
  const delB=_bolos.find(e=>e.id===id);
  _boloModal('Delete this BOLO? This cannot be undone.',async()=>{
    if(_boloEditId===id)_boloEditId=null;
    await _sb.from('bolos').delete().eq('id',id);
    if(delB)_boloLog('Deleted BOLO',_boloSummary(delB));
    _boloFetch();
  });
}

function boloClearResolved(){
  _boloModal('Remove all resolved BOLOs? This cannot be undone.',async()=>{
    const ids=_bolos.filter(b=>b.resolved).map(b=>b.id);
    if(ids.length){
      await _sb.from('bolos').delete().in('id',ids);
      _boloLog('Cleared resolved BOLOs',ids.length+' removed');
      _boloFetch();
    }
  });
}

function boloSetFilter(f,el){
  _boloFilter=f;
  document.querySelectorAll('.bolo-tab').forEach(t=>t.classList.remove('active'));
  (el||document.querySelector(`.bolo-tab[data-f="${f}"]`))?.classList.add('active');
  boloRender();
}

// ── Import / Export ───────────────────────────────────────────────────────────

function boloExport(){
  if(!_bolos.length)return;
  const date=new Date().toISOString().slice(0,10);
  const blob=new Blob([JSON.stringify(_bolos,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=`UPD-BOLO-${date}.json`;a.click();
  URL.revokeObjectURL(url);
}

function boloImport(){
  const input=document.createElement('input');
  input.type='file';input.accept='.json';
  input.onchange=e=>{
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=async ev=>{
      try{
        const data=JSON.parse(ev.target.result);
        if(!Array.isArray(data))throw new Error();
        const count=data.length;
        _boloModal(`Import ${count} BOLO${count!==1?'s':''}? This will replace the shared board.`,async()=>{
          const{data:existing}=await _sb.from('bolos').select('id');
          if(existing?.length)await _sb.from('bolos').delete().in('id',existing.map(b=>b.id));
          if(count){
            const rows=data.map(({id,...rest})=>({
              vehicle:rest.vehicle||'',plate:rest.plate||'',owner:rest.owner||'',
              suspect:rest.suspect||'',reason:rest.reason||'',
              priority:rest.priority||'high',resolved:rest.resolved||false,
              ts:rest.ts||'',added_by:rest.addedBy||rest.added_by||''
            }));
            await _sb.from('bolos').insert(rows);
          }
        });
      }catch(err){alert('Invalid BOLO file — could not import.');}
    };
    reader.readAsText(file);
  };
  input.click();
}

// ── Render ────────────────────────────────────────────────────────────────────

function _boloCardNormal(b){
  const prio=b.priority||'medium';
  const prioLabel=prio==='high'?'HIGH':prio==='medium'?'MED':'LOW';
  let vehicleHtml='';
  if(b.vehicle&&b.plate)vehicleHtml=`<div class="bolo-field"><span class="bolo-lbl">Vehicle</span><span class="bolo-val">${escapeHtml(b.vehicle)} &nbsp;<span class="bolo-plate">${escapeHtml(b.plate)}</span></span></div>`;
  else if(b.vehicle)vehicleHtml=`<div class="bolo-field"><span class="bolo-lbl">Vehicle</span><span class="bolo-val">${escapeHtml(b.vehicle)}</span></div>`;
  else if(b.plate)vehicleHtml=`<div class="bolo-field"><span class="bolo-lbl">Plate</span><span class="bolo-val"><span class="bolo-plate">${escapeHtml(b.plate)}</span></span></div>`;
  const ownerHtml=b.owner?`<div class="bolo-field"><span class="bolo-lbl">Owner</span><span class="bolo-val">${escapeHtml(b.owner)}</span></div>`:'';
  const suspectHtml=b.suspect?`<div class="bolo-field"><span class="bolo-lbl">Suspect</span><span class="bolo-val">${escapeHtml(b.suspect)}</span></div>`:'';
  const reasonHtml=b.reason?`<div class="bolo-reason">${escapeHtml(b.reason)}</div>`:'';
  const addedByHtml=b.addedBy?`<span class="bolo-added-by">${escapeHtml(b.addedBy)}</span>`:'';
  return`<div class="bolo-card bolo-prio-${prio}${b.resolved?' bolo-resolved':''}">
    <div class="bolo-card-head">
      <span class="bolo-prio-pill bolo-pp-${prio}">${prioLabel}</span>
      <span class="bolo-ts">${escapeHtml(b.ts)}</span>
      ${b.resolved?'<span class="bolo-res-badge">Resolved</span>':''}
      ${addedByHtml}
    </div>
    <div class="bolo-card-body">${vehicleHtml}${ownerHtml}${suspectHtml}${reasonHtml}</div>
    <div class="bolo-card-foot">
      <button class="bolo-btn bolo-btn-res" onclick="boloResolve('${b.id}')">${b.resolved?'<i class="fa-solid fa-rotate-left"></i> Reopen':'<i class="fa-solid fa-check"></i> Resolve'}</button>
      <button class="bolo-btn bolo-btn-edit" onclick="boloEdit('${b.id}')"><i class="fa-solid fa-pen"></i> Edit</button>
      <button class="bolo-copy-btn bolo-btn" data-id="${b.id}" onclick="boloCopy311('${b.id}')"><i class="fa-solid fa-copy"></i> 311</button>
      <button class="bolo-btn bolo-btn-del" onclick="boloDelete('${b.id}')"><i class="fa-solid fa-trash"></i></button>
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
    <input id="bolo-ie-owner" class="bolo-input bolo-ie-owner-input" value="${escapeHtml(b.owner||'')}" placeholder="Registered owner">
    <input id="bolo-ie-reason" class="bolo-input bolo-ie-reason-input" value="${escapeHtml(b.reason||'')}" placeholder="Reason / offence" onkeydown="if(event.key==='Enter'){event.preventDefault();boloSaveInline();}">
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
}

window.__pageInits=window.__pageInits||{};
window.__pageInits.bolo=function(){_boloEditId=null;_boloSetupListener();_boloFetch();};
window.addEventListener('load',()=>{
  _boloSetupListener();
  document.getElementById('bolo-reason')?.addEventListener('keydown',e=>{
    if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();boloAdd();}
  });
});
