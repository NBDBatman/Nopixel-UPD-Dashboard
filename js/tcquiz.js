// Requires CODES array from codes.js
let _tcMode='code',_tcQueue=[],_tcIdx=0,_tcCorrect=0,_tcStreak=0,_tcResults=[],_tcAnswered=false;
const _TC_ROUND=20;

function tcSetMode(mode,el){
  _tcMode=mode;
  document.querySelectorAll('.tc-mode-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  tcStart();
}

function tcStart(){
  _tcQueue=[...CODES].sort(()=>Math.random()-.5).slice(0,Math.min(_TC_ROUND,CODES.length));
  _tcIdx=0;_tcCorrect=0;_tcStreak=0;_tcResults=[];_tcAnswered=false;
  document.getElementById('tc-game').style.display='';
  document.getElementById('tc-result').style.display='none';
  document.getElementById('tc-next').style.display='none';
  _tcShowQuestion();_tcUpdateStats();_tcRenderProgress();
}

function _tcShowQuestion(){
  const q=_tcQueue[_tcIdx];
  const qEl=document.getElementById('tc-question');
  const optsEl=document.getElementById('tc-options');
  const wrong=CODES.filter(c=>c.code!==q.code).sort(()=>Math.random()-.5).slice(0,3);
  const opts=[q,...wrong].sort(()=>Math.random()-.5);
  if(_tcMode==='code'){
    qEl.textContent=q.code;
    qEl.className='tc-question tc-q-code';
    optsEl.innerHTML=opts.map(o=>`<button class="tc-opt" data-code="${escapeHtml(o.code)}" onclick="tcSelect('${escapeHtml(o.code)}')">${escapeHtml(o.desc)}</button>`).join('');
  }else{
    qEl.textContent=q.desc;
    qEl.className='tc-question tc-q-desc';
    optsEl.innerHTML=opts.map(o=>`<button class="tc-opt" data-code="${escapeHtml(o.code)}" onclick="tcSelect('${escapeHtml(o.code)}')">${escapeHtml(o.code)}</button>`).join('');
  }
  document.getElementById('tc-card').className='tc-card';
  document.getElementById('tc-feedback').innerHTML='';
  document.getElementById('tc-feedback').className='tc-feedback';
  _tcAnswered=false;
  _tcRenderProgress();
}

function tcSelect(selected){
  if(_tcAnswered)return;
  _tcAnswered=true;
  const q=_tcQueue[_tcIdx];
  const ok=selected===q.code;
  document.querySelectorAll('.tc-opt').forEach(btn=>{
    const bc=btn.dataset.code;
    if(bc===q.code)btn.className='tc-opt tc-opt-correct';
    else if(bc===selected&&!ok)btn.className='tc-opt tc-opt-wrong';
    else btn.className='tc-opt tc-opt-dim';
  });
  const card=document.getElementById('tc-card');
  const fb=document.getElementById('tc-feedback');
  if(ok){
    card.className='tc-card tc-card-correct';
    fb.innerHTML='<i class="fa-solid fa-circle-check"></i> Correct!';
    fb.className='tc-feedback tc-fb-ok';
    _tcCorrect++;_tcStreak++;
  }else{
    card.className='tc-card tc-card-wrong';
    const ans=_tcMode==='code'?q.desc:q.code;
    fb.innerHTML=`<i class="fa-solid fa-circle-xmark"></i> Incorrect — <strong>${escapeHtml(ans)}</strong>`;
    fb.className='tc-feedback tc-fb-err';
    _tcStreak=0;
  }
  _tcResults.push({code:q.code,desc:q.desc,ok});
  _tcUpdateStats();_tcRenderProgress();
  if(ok)setTimeout(_tcAdvance,850);
  else document.getElementById('tc-next').style.display='';
}

function _tcAdvance(){
  document.getElementById('tc-next').style.display='none';
  _tcIdx++;
  if(_tcIdx>=_tcQueue.length){_tcShowResult();return;}
  _tcShowQuestion();
}

function _tcUpdateStats(){
  document.getElementById('tc-score').textContent=_tcCorrect+' / '+_tcQueue.length;
  document.getElementById('tc-streak').textContent='Streak: '+_tcStreak;
}

function _tcRenderProgress(){
  const el=document.getElementById('tc-progress');
  el.innerHTML=_tcQueue.map((_,i)=>{
    const r=_tcResults[i];
    let cls='qz-dot';
    if(r===undefined&&i===_tcIdx)cls+=' qz-dot-cur';
    else if(r?.ok)cls+=' qz-dot-ok';
    else if(r&&!r.ok)cls+=' qz-dot-err';
    return`<div class="${cls}"></div>`;
  }).join('');
}

function _tcShowResult(){
  const pct=Math.round(_tcCorrect/_tcQueue.length*100);
  const label=pct===100?'Perfect!':pct>=80?'Nice work!':pct>=60?'Getting there!':'Keep practising!';
  const wrong=_tcResults.filter(r=>!r.ok);
  document.getElementById('tc-game').style.display='none';
  const res=document.getElementById('tc-result');
  res.style.display='';
  res.innerHTML=`
    <div class="qz-res-pct">${pct}%</div>
    <div class="qz-res-label">${escapeHtml(label)}</div>
    <div class="qz-res-sub">${_tcCorrect} of ${_tcQueue.length} correct</div>
    ${wrong.length?`<div class="tc-missed">
      <div class="tc-missed-title">Missed</div>
      ${wrong.map(r=>`<div class="tc-missed-row"><span class="tc-missed-code">${escapeHtml(r.code)}</span><span class="tc-missed-desc">${escapeHtml(r.desc)}</span></div>`).join('')}
    </div>`:''}
    <button class="qz-restart-btn" onclick="tcStart()"><i class="fa-solid fa-rotate-right"></i> Try Again</button>`;
}

window.__pageInits=window.__pageInits||{};
window.__pageInits.tcquiz=function(){tcStart();};
window.addEventListener('load',tcStart);
