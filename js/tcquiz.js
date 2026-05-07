// Requires CODES array from codes.js
const TC_STORE='upd-tc-scores';
let _tcMode='code',_tcFilter='all',_tcQueue=[],_tcIdx=0,_tcCorrect=0,_tcStreak=0,_tcMaxStreak=0,_tcResults=[],_tcAnswered=false;
let _tcTimer=null,_tcTick=null;
const _TC_ROUND=20,_TC_DELAY=5;

function _tcStartTimer(){
  const next=document.getElementById('tc-next');
  next.innerHTML='Next → <span class="qz-timer-count" id="tc-timer-count">'+_TC_DELAY+'</span>';
  next.style.display='';
  const card=document.getElementById('tc-card');
  let bar=document.getElementById('tc-timer-bar');
  if(!bar){
    bar=document.createElement('div');
    bar.id='tc-timer-bar';
    bar.className='qz-timer';
    bar.innerHTML='<div class="qz-timer-fill" id="tc-timer-fill"></div>';
    card.appendChild(bar);
  }
  const fill=document.getElementById('tc-timer-fill');
  fill.style.transition='none';fill.style.width='100%';
  fill.offsetWidth;
  fill.style.transition=`width ${_TC_DELAY}s linear`;fill.style.width='0%';
  let t=_TC_DELAY;
  if(_tcTick)clearInterval(_tcTick);
  _tcTick=setInterval(()=>{t--;const el=document.getElementById('tc-timer-count');if(el)el.textContent=t;if(t<=0)clearInterval(_tcTick);},1000);
  if(_tcTimer)clearTimeout(_tcTimer);
  _tcTimer=setTimeout(_tcAdvance,_TC_DELAY*1000);
}

function tcSetMode(mode,el){
  _tcMode=mode;_tcFilter='all';
  document.querySelectorAll('.tc-mode-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.tc-filter-btn').forEach(b=>b.classList.remove('active'));
  const allBtn=document.querySelector('.tc-filter-btn');if(allBtn)allBtn.classList.add('active');
  tcStart();
}

function tcSetFilter(f,el){
  _tcFilter=f;
  document.querySelectorAll('.tc-filter-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  tcStart();
}

function tcStart(){
  if(_tcTimer){clearTimeout(_tcTimer);_tcTimer=null;}
  if(_tcTick){clearInterval(_tcTick);_tcTick=null;}
  const bar=document.getElementById('tc-timer-bar');if(bar)bar.remove();
  const _tcPool=_tcFilter==='all'?CODES:CODES.filter(c=>c.prio===_tcFilter);
  _tcQueue=[..._tcPool].sort(()=>Math.random()-.5).slice(0,Math.min(_TC_ROUND,_tcPool.length));
  _tcIdx=0;_tcCorrect=0;_tcStreak=0;_tcMaxStreak=0;_tcResults=[];_tcAnswered=false;
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
    _tcCorrect++;_tcStreak++;if(_tcStreak>_tcMaxStreak)_tcMaxStreak=_tcStreak;
  }else{
    card.className='tc-card tc-card-wrong';
    const ans=_tcMode==='code'?q.desc:q.code;
    fb.innerHTML=`<i class="fa-solid fa-circle-xmark"></i> Incorrect — <strong>${escapeHtml(ans)}</strong>`;
    fb.className='tc-feedback tc-fb-err';
    _tcStreak=0;
  }
  _tcResults.push({code:q.code,desc:q.desc,ok});
  _tcUpdateStats();_tcRenderProgress();
  _tcStartTimer();
}

function _tcAdvance(){
  if(_tcTimer){clearTimeout(_tcTimer);_tcTimer=null;}
  if(_tcTick){clearInterval(_tcTick);_tcTick=null;}
  document.getElementById('tc-next').style.display='none';
  const bar=document.getElementById('tc-timer-bar');if(bar)bar.remove();
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

function _tcSaveScore(pct){
  let s={};try{s=JSON.parse(localStorage.getItem(TC_STORE))||{};}catch(e){}
  const newBest=pct>(s.bestPct||0)||_tcMaxStreak>(s.bestStreak||0);
  s.bestPct=Math.max(pct,s.bestPct||0);
  s.bestStreak=Math.max(_tcMaxStreak,s.bestStreak||0);
  s.gamesPlayed=(s.gamesPlayed||0)+1;
  try{localStorage.setItem(TC_STORE,JSON.stringify(s));}catch(e){}
  return{s,newBest};
}

let _tcReviewList=[],_tcReviewIdx=0;
function _tcStartReview(){
  _tcReviewList=_tcResults.filter(r=>!r.ok);
  _tcReviewIdx=0;
  _tcRenderReview();
}
function _tcRenderReview(){
  const item=_tcReviewList[_tcReviewIdx];
  const res=document.getElementById('tc-result');
  const isLast=_tcReviewIdx>=_tcReviewList.length-1;
  res.innerHTML=`
    <div class="qz-review-hd">Review <span class="qz-review-prog">${_tcReviewIdx+1} / ${_tcReviewList.length}</span></div>
    <div class="qz-review-card">
      <div class="qz-review-q">${escapeHtml(item.code)}</div>
      <div class="qz-review-a">${escapeHtml(item.desc)}</div>
    </div>
    <button class="qz-restart-btn" onclick="${isLast?'tcStart()':'_tcReviewNext()'}">
      ${isLast?'<i class="fa-solid fa-rotate-right"></i> Try Again':'Next <i class="fa-solid fa-arrow-right"></i>'}
    </button>`;
}
function _tcReviewNext(){_tcReviewIdx++;_tcRenderReview();}

function _tcShowResult(){
  const pct=Math.round(_tcCorrect/_tcQueue.length*100);
  const label=pct===100?'Perfect!':pct>=80?'Nice work!':pct>=60?'Getting there!':'Keep practising!';
  const wrong=_tcResults.filter(r=>!r.ok);
  const {s,newBest}=_tcSaveScore(pct);
  document.getElementById('tc-game').style.display='none';
  const res=document.getElementById('tc-result');
  res.style.display='';
  res.innerHTML=`
    <div class="qz-res-pct">${pct}%</div>
    <div class="qz-res-label">${escapeHtml(label)}</div>
    <div class="qz-res-sub">${_tcCorrect} of ${_tcQueue.length} correct</div>
    <div class="qz-pb-row">${newBest?'<span class="qz-pb-badge"><i class="fa-solid fa-trophy"></i> Personal Best!</span>':''}<span class="qz-pb-stats">Best: ${s.bestPct}% · Streak: ${s.bestStreak} · Games: ${s.gamesPlayed}</span></div>
    ${wrong.length?`<div class="tc-missed">
      <div class="tc-missed-title">Missed</div>
      ${wrong.map(r=>`<div class="tc-missed-row"><span class="tc-missed-code">${escapeHtml(r.code)}</span><span class="tc-missed-desc">${escapeHtml(r.desc)}</span></div>`).join('')}
    </div>`:''}
    <div class="qz-result-btns">
      <button class="qz-restart-btn" onclick="tcStart()"><i class="fa-solid fa-rotate-right"></i> Try Again</button>
      ${wrong.length?`<button class="qz-review-btn" onclick="_tcStartReview()"><i class="fa-solid fa-eye"></i> Review Missed</button>`:''}
    </div>`;
}

document.addEventListener('keydown',e=>{
  if(e.key!=='Enter')return;
  const next=document.getElementById('tc-next');
  if(next&&next.style.display!=='none'){_tcAdvance();return;}
  const focused=document.activeElement;
  if(focused&&focused.classList.contains('tc-opt'))focused.click();
});

window.__pageInits=window.__pageInits||{};
window.__pageInits.tcquiz=function(){tcStart();};
window.addEventListener('load',tcStart);
