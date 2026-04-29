const UNIT_CAPS=[
  {scenario:'Foot Pursuit',              cap:'2 per suspect'},
  {scenario:'Vehicle Pursuit / Boosts', cap:'4 units + 2 per interference'},
  {scenario:'Street Races / 99D',       cap:'4 units per car + Air 1'},
  {scenario:'24/7 / Laundromat',        cap:'4 units'},
  {scenario:'Cash Exchange / Jewelry / Fleeca', cap:'6 units'},
  {scenario:'Paleto / Ammo Crate / 37A', cap:'6 units + Air 1'},
  {scenario:'Security Truck',           cap:'14 units + Air 1'},
  {scenario:'Maze Bank / Art Asylum',   cap:'8–12 units + Air 1'},
  {scenario:'Powerplant Disruption',    cap:'10 units + Air 1'},
];

let _ucQueue=[],_ucIdx=0,_ucCorrect=0,_ucStreak=0,_ucResults=[],_ucAnswered=false;

function ucStart(){
  _ucQueue=[...UNIT_CAPS].sort(()=>Math.random()-.5);
  _ucIdx=0;_ucCorrect=0;_ucStreak=0;_ucResults=[];_ucAnswered=false;
  document.getElementById('uc-game').style.display='';
  document.getElementById('uc-result').style.display='none';
  document.getElementById('uc-next').style.display='none';
  _ucShowQuestion();_ucUpdateStats();_ucRenderProgress();
}

function _ucShowQuestion(){
  const q=_ucQueue[_ucIdx];
  document.getElementById('uc-question').textContent=q.scenario;
  const wrong=UNIT_CAPS.filter(c=>c.cap!==q.cap).sort(()=>Math.random()-.5).slice(0,3);
  const opts=[q,...wrong].sort(()=>Math.random()-.5);
  document.getElementById('uc-options').innerHTML=opts.map(o=>
    `<button class="tc-opt" data-cap="${escapeHtml(o.cap)}" onclick="ucSelect('${escapeHtml(o.cap)}')">${escapeHtml(o.cap)}</button>`
  ).join('');
  document.getElementById('uc-card').className='tc-card';
  document.getElementById('uc-feedback').innerHTML='';
  document.getElementById('uc-feedback').className='tc-feedback';
  _ucAnswered=false;
  _ucRenderProgress();
}

function ucSelect(selected){
  if(_ucAnswered)return;
  _ucAnswered=true;
  const q=_ucQueue[_ucIdx];
  const ok=selected===q.cap;
  document.querySelectorAll('#uc-options .tc-opt').forEach(btn=>{
    const bc=btn.dataset.cap;
    if(bc===q.cap)btn.className='tc-opt tc-opt-correct';
    else if(bc===selected&&!ok)btn.className='tc-opt tc-opt-wrong';
    else btn.className='tc-opt tc-opt-dim';
  });
  const fb=document.getElementById('uc-feedback');
  if(ok){
    document.getElementById('uc-card').className='tc-card tc-card-correct';
    fb.innerHTML='<i class="fa-solid fa-circle-check"></i> Correct!';
    fb.className='tc-feedback tc-fb-ok';
    _ucCorrect++;_ucStreak++;
  }else{
    document.getElementById('uc-card').className='tc-card tc-card-wrong';
    fb.innerHTML=`<i class="fa-solid fa-circle-xmark"></i> Incorrect — <strong>${escapeHtml(q.cap)}</strong>`;
    fb.className='tc-feedback tc-fb-err';
    _ucStreak=0;
  }
  _ucResults.push({scenario:q.scenario,cap:q.cap,ok});
  _ucUpdateStats();_ucRenderProgress();
  if(ok)setTimeout(_ucAdvance,850);
  else document.getElementById('uc-next').style.display='';
}

function _ucAdvance(){
  document.getElementById('uc-next').style.display='none';
  _ucIdx++;
  if(_ucIdx>=_ucQueue.length){_ucShowResult();return;}
  _ucShowQuestion();
}

function _ucUpdateStats(){
  document.getElementById('uc-score').textContent=_ucCorrect+' / '+_ucQueue.length;
  document.getElementById('uc-streak').textContent='Streak: '+_ucStreak;
}

function _ucRenderProgress(){
  document.getElementById('uc-progress').innerHTML=_ucQueue.map((_,i)=>{
    const r=_ucResults[i];
    let cls='qz-dot';
    if(r===undefined&&i===_ucIdx)cls+=' qz-dot-cur';
    else if(r?.ok)cls+=' qz-dot-ok';
    else if(r&&!r.ok)cls+=' qz-dot-err';
    return`<div class="${cls}"></div>`;
  }).join('');
}

function _ucShowResult(){
  const pct=Math.round(_ucCorrect/_ucQueue.length*100);
  const label=pct===100?'Perfect!':pct>=80?'Nice work!':pct>=60?'Getting there!':'Keep practising!';
  const wrong=_ucResults.filter(r=>!r.ok);
  document.getElementById('uc-game').style.display='none';
  const res=document.getElementById('uc-result');
  res.style.display='';
  res.innerHTML=`
    <div class="qz-res-pct">${pct}%</div>
    <div class="qz-res-label">${escapeHtml(label)}</div>
    <div class="qz-res-sub">${_ucCorrect} of ${_ucQueue.length} correct</div>
    ${wrong.length?`<div class="tc-missed">
      <div class="tc-missed-title">Missed</div>
      ${wrong.map(r=>`<div class="tc-missed-row"><span class="tc-missed-code">${escapeHtml(r.scenario)}</span><span class="tc-missed-desc">${escapeHtml(r.cap)}</span></div>`).join('')}
    </div>`:''}
    <button class="qz-restart-btn" onclick="ucStart()"><i class="fa-solid fa-rotate-right"></i> Try Again</button>`;
}

window.__pageInits=window.__pageInits||{};
window.__pageInits.ucquiz=function(){ucStart();};
window.addEventListener('load',ucStart);
