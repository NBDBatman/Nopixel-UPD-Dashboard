let _bolos=[],_boloFilter='active',_boloEditId=null,_boloListenerActive=false,_boloExpireTimer=null;
const _boloLoggedHidden=new Set();
const _PRIO_ORDER={high:0,medium:1,low:2};
const _BOLO_RESOLVE_MS=60*60*1000;
const _BOLO_DELETE_MS=2*60*60*1000;

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
    addedBy:row.added_by||'',
    createdAt:row.created_at?new Date(row.created_at).getTime():null
  };
}

// ── Supabase ──────────────────────────────────────────────────────────────────

async function _boloFetch(){
  if(!window._sb)return;
  const{data,error}=await _sb.from('bolos').select('*').order('created_at',{ascending:false});
  if(!error&&data){_bolos=data.map(_mapBolo);_boloAutoExpire();boloRender();_boloCheckDeepLink();}
}

async function _boloAutoExpire(){
  if(!window._sb||!_bolos.length)return;
  const now=Date.now();
  const toResolve=_bolos.filter(b=>!b.resolved&&b.createdAt&&(now-b.createdAt)>=_BOLO_RESOLVE_MS);
  const toHide=_bolos.filter(b=>b.resolved&&b.createdAt&&(now-b.createdAt)>=_BOLO_DELETE_MS&&!_boloLoggedHidden.has(b.id));
  if(toHide.length){
    for(const b of toHide){
      _boloLoggedHidden.add(b.id);
      _boloLog('BOLO hidden from board',_boloSummary(b));
    }
    const summaries=toHide.map(b=>'• '+_boloSummary(b)).join('\n');
    _discordLog(
      '👁️ '+(toHide.length===1?'BOLO':'BOLOs')+' Hidden from Board',
      summaries,
      _DC.grey,
      [{name:'Count',value:String(toHide.length),inline:true},{name:'Reason',value:'Resolved for 1 hour',inline:true}]
    );
  }
  if(!toResolve.length)return;
  await _sb.from('bolos').update({resolved:true}).in('id',toResolve.map(b=>b.id));
  for(const b of toResolve)_boloLog('Auto-resolved BOLO',_boloSummary(b));
  const summaries=toResolve.map(b=>'• '+_boloSummary(b)).join('\n');
  _discordLog(
    '⏱ '+(toResolve.length===1?'BOLO':'BOLOs')+' Auto-Resolved',
    summaries,
    _DC.grey,
    [{name:'Count',value:String(toResolve.length),inline:true},{name:'Reason',value:'Active for 1 hour',inline:true}]
  );
  _boloFetch();
}

function _boloSetupListener(){
  if(_boloListenerActive||!window._sb)return;
  _boloListenerActive=true;
  _boloFetch();
  _sb.channel('bolos-changes')
    .on('postgres_changes',{event:'*',schema:'public',table:'bolos'},()=>{_boloFetch();})
    .subscribe();
  if(_boloExpireTimer)clearInterval(_boloExpireTimer);
  _boloExpireTimer=setInterval(()=>{_boloAutoExpire();boloRender();},60000);
}

// ── Audit Log ────────────────────────────────────────────────────────────────

async function _boloLog(action,summary){
  const session=_getSession();
  const officer=session?session.callsign+' '+session.name:'Unknown';
  const{error}=await _sb.from('bolo_logs').insert({action,bolo_summary:summary||'',officer});
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
  const addFields=[];
  if(vehicle)addFields.push({name:'Vehicle',value:vehicle,inline:true});
  if(plate)addFields.push({name:'Plate',value:plate,inline:true});
  if(suspect)addFields.push({name:'Suspect',value:suspect,inline:true});
  if(owner)addFields.push({name:'Owner',value:owner,inline:true});
  if(reason)addFields.push({name:'Reason',value:reason,inline:false});
  addFields.push({name:'Priority',value:priority.charAt(0).toUpperCase()+priority.slice(1),inline:true});
  if(session)addFields.push({name:'Added by',value:session.callsign+' '+session.name,inline:true});
  _discordLog('🔍 New BOLO Added','',_DC.blue,addFields);
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
  const beforeB=_bolos.find(e=>e.id===_boloEditId);
  const afterVehicle=get('bolo-ie-vehicle'),afterPlate=get('bolo-ie-plate');
  const afterOwner=get('bolo-ie-owner'),afterSuspect=get('bolo-ie-suspect');
  const afterReason=get('bolo-ie-reason'),afterPriority=get('bolo-ie-priority')||'high';
  await _sb.from('bolos').update({
    vehicle:afterVehicle,plate:afterPlate,
    owner:afterOwner,suspect:afterSuspect,
    reason:afterReason,priority:afterPriority
  }).eq('id',_boloEditId);
  if(beforeB){
    _boloLog('Edited BOLO',_boloSummary(beforeB));
    const editFields=[];
    const diffs=[
      ['Vehicle',beforeB.vehicle,afterVehicle],
      ['Plate',beforeB.plate,afterPlate],
      ['Suspect',beforeB.suspect,afterSuspect],
      ['Owner',beforeB.owner,afterOwner],
      ['Reason',beforeB.reason,afterReason],
      ['Priority',beforeB.priority,afterPriority],
    ];
    for(const[label,bv,av]of diffs){
      if(bv!==av){
        editFields.push({name:label+' — Before',value:bv||'—',inline:true});
        editFields.push({name:label+' — After',value:av||'—',inline:true});
      }
    }
    _discordLog('✏️ BOLO Edited','**'+_boloSummary(beforeB)+'**',_DC.orange,editFields);
  }
  _boloEditId=null;
  _boloFetch();
}

// ── Deep Link ─────────────────────────────────────────────────────────────────

function boloCopyLink(id){
  const url=location.href.split('?')[0]+'?bolo='+id;
  navigator.clipboard.writeText(url).then(()=>{
    const btn=document.querySelector(`.bolo-btn-link[data-id="${id}"]`);
    if(btn){const orig=btn.innerHTML;btn.innerHTML='<i class="fa-solid fa-check"></i>';setTimeout(()=>{btn.innerHTML=orig;},1800);}
  });
}

function _boloCheckDeepLink(){
  const id=new URLSearchParams(location.search).get('bolo');
  if(!id)return;
  history.replaceState(null,'',location.pathname);
  const b=_bolos.find(e=>e.id===id);
  if(!b)return;
  if(b.resolved&&_boloFilter==='active'){boloSetFilter('resolved',null);}
  else if(!b.resolved&&_boloFilter==='resolved'){boloSetFilter('active',null);}
  requestAnimationFrame(()=>{
    const card=document.querySelector(`.bolo-card[data-bolo-id="${id}"]`);
    if(card){card.scrollIntoView({behavior:'smooth',block:'center'});card.classList.add('dl-highlight');setTimeout(()=>card.classList.remove('dl-highlight'),2500);}
  });
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
    const resFields=[];
    if(b.vehicle)resFields.push({name:'Vehicle',value:b.vehicle,inline:true});
    if(b.plate)resFields.push({name:'Plate',value:b.plate,inline:true});
    if(b.suspect)resFields.push({name:'Suspect',value:b.suspect,inline:true});
    _discordLog(b.resolved?'🔄 BOLO Reopened':'✅ BOLO Resolved','**'+_boloSummary(b)+'**',b.resolved?_DC.orange:_DC.green,resFields);
    _boloFetch();
  }
}

function boloDelete(id){
  const delB=_bolos.find(e=>e.id===id);
  _boloModal('Delete this BOLO? This cannot be undone.',async()=>{
    if(_boloEditId===id)_boloEditId=null;
    await _sb.from('bolos').delete().eq('id',id);
    if(delB){
      _boloLog('Deleted BOLO',_boloSummary(delB));
      const delFields=[];
      if(delB.vehicle)delFields.push({name:'Vehicle',value:delB.vehicle,inline:true});
      if(delB.plate)delFields.push({name:'Plate',value:delB.plate,inline:true});
      if(delB.suspect)delFields.push({name:'Suspect',value:delB.suspect,inline:true});
      if(delB.reason)delFields.push({name:'Reason',value:delB.reason,inline:false});
      _discordLog('🗑️ BOLO Deleted','**'+_boloSummary(delB)+'**',_DC.red,delFields);
    }
    _boloFetch();
  });
}

function boloClearResolved(){
  _boloModal('Remove all resolved BOLOs? This cannot be undone.',async()=>{
    const ids=_bolos.filter(b=>b.resolved).map(b=>b.id);
    if(ids.length){
      await _sb.from('bolos').delete().in('id',ids);
      _boloLog('Cleared resolved BOLOs',ids.length+' removed');
      _discordLog('🧹 Resolved BOLOs Cleared','**'+ids.length+' BOLO'+(ids.length!==1?'s':'')+' removed from the board**',_DC.grey,[{name:'Count',value:String(ids.length),inline:true}]);
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
  let expireHtml='';
  if(b.createdAt){
    const threshold=b.resolved?_BOLO_DELETE_MS:_BOLO_RESOLVE_MS;
    const expiresAt=b.createdAt+threshold;
    const remaining=expiresAt-Date.now();
    if(remaining>0){
      const mins=Math.ceil(remaining/60000);
      const label=mins>=60?Math.floor(mins/60)+'h '+(mins%60)+'m':mins+'m';
      const atTime=new Date(expiresAt).toLocaleTimeString('en-AU',{hour:'2-digit',minute:'2-digit',hour12:false});
      const tip=b.resolved?`Hidden from board at ${atTime}`:`Auto-resolves at ${atTime}`;
      expireHtml=`<span class="bolo-expire${mins<=15?' bolo-expire-soon':''}" data-tip="${tip}">⏱ ${label}</span>`;
    }
  }
  return`<div class="bolo-card bolo-prio-${prio}${b.resolved?' bolo-resolved':''}" data-bolo-id="${b.id}">
    <div class="bolo-card-head">
      <span class="bolo-prio-pill bolo-pp-${prio}">${prioLabel}</span>
      <span class="bolo-ts">${escapeHtml(b.ts)}</span>
      ${expireHtml}
      ${b.resolved?'<span class="bolo-res-badge">Resolved</span>':''}
      ${addedByHtml}
    </div>
    <div class="bolo-card-body">${vehicleHtml}${ownerHtml}${suspectHtml}${reasonHtml}</div>
    <div class="bolo-card-foot">
      <button class="bolo-btn bolo-btn-res" onclick="boloResolve('${b.id}')">${b.resolved?'<i class="fa-solid fa-rotate-left"></i> Reopen':'<i class="fa-solid fa-check"></i> Resolve'}</button>
      <button class="bolo-btn bolo-btn-edit" onclick="boloEdit('${b.id}')"><i class="fa-solid fa-pen"></i> Edit</button>
      <button class="bolo-copy-btn bolo-btn" data-id="${b.id}" onclick="boloCopy311('${b.id}')"><i class="fa-solid fa-copy"></i> 311</button>
      <button class="bolo-btn bolo-btn-link" data-id="${b.id}" onclick="boloCopyLink('${b.id}')" data-tip="Copy deep link"><i class="fa-solid fa-link"></i></button>
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
  const now=Date.now();
  const filtered=_bolos.filter(b=>{
    if(b.createdAt&&(now-b.createdAt)>=_BOLO_DELETE_MS)return false;
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
