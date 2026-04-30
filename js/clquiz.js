// Requires LAWS array from laws.js
let _clMode='name',_clQueue=[],_clIdx=0,_clCorrect=0,_clStreak=0,_clResults=[],_clAnswered=false;
let _clTimer=null,_clTick=null;
const _CL_DELAY=5;

function _clStartTimer(){
  const next=document.getElementById('cl-next');
  next.innerHTML='Next → <span class="qz-timer-count" id="cl-timer-count">'+_CL_DELAY+'</span>';
  next.style.display='';
  const card=document.getElementById('cl-card');
  let bar=document.getElementById('cl-timer-bar');
  if(!bar){
    bar=document.createElement('div');
    bar.id='cl-timer-bar';
    bar.className='qz-timer';
    bar.innerHTML='<div class="qz-timer-fill" id="cl-timer-fill"></div>';
    card.appendChild(bar);
  }
  const fill=document.getElementById('cl-timer-fill');
  fill.style.transition='none';fill.style.width='100%';
  fill.offsetWidth;
  fill.style.transition=`width ${_CL_DELAY}s linear`;fill.style.width='0%';
  let t=_CL_DELAY;
  if(_clTick)clearInterval(_clTick);
  _clTick=setInterval(()=>{t--;const el=document.getElementById('cl-timer-count');if(el)el.textContent=t;if(t<=0)clearInterval(_clTick);},1000);
  if(_clTimer)clearTimeout(_clTimer);
  _clTimer=setTimeout(_clAdvance,_CL_DELAY*1000);
}

function clSetMode(mode,el){
  _clMode=mode;
  document.querySelectorAll('.tc-mode-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  clStart();
}

function clStart(){
  if(_clTimer){clearTimeout(_clTimer);_clTimer=null;}
  if(_clTick){clearInterval(_clTick);_clTick=null;}
  const bar=document.getElementById('cl-timer-bar');if(bar)bar.remove();
  _clQueue=[...LAWS].sort(()=>Math.random()-.5);
  _clIdx=0;_clCorrect=0;_clStreak=0;_clResults=[];_clAnswered=false;
  document.getElementById('cl-game').style.display='';
  document.getElementById('cl-result').style.display='none';
  document.getElementById('cl-next').style.display='none';
  _clShowQuestion();_clUpdateStats();_clRenderProgress();
}

function _clTrunc(str,n){
  if(str.length<=n)return str;
  return str.slice(0,n).replace(/\s+\S*$/,'')+'…';
}

function _clShowQuestion(){
  const q=_clQueue[_clIdx];
  const correctIdx=LAWS.indexOf(q);
  const wrong=LAWS.filter((_,i)=>i!==correctIdx).sort(()=>Math.random()-.5).slice(0,3);
  const opts=[q,...wrong].sort(()=>Math.random()-.5);
  const qEl=document.getElementById('cl-question');
  const optsEl=document.getElementById('cl-options');
  if(_clMode==='name'){
    qEl.innerHTML=`<span class="cl-q-cat">${escapeHtml(q.catLabel)}</span>${escapeHtml(q.title)}`;
    qEl.className='tc-question cl-q-name';
    optsEl.innerHTML=opts.map(o=>{
      const idx=LAWS.indexOf(o);
      return`<button class="tc-opt cl-opt-rule" data-idx="${idx}" onclick="clSelect(${idx})">${escapeHtml(_clTrunc(o.sections[0].text,115))}</button>`;
    }).join('');
  }else{
    qEl.textContent=_clTrunc(q.sections[0].text,220);
    qEl.className='tc-question tc-q-desc';
    optsEl.innerHTML=opts.map(o=>{
      const idx=LAWS.indexOf(o);
      return`<button class="tc-opt" data-idx="${idx}" onclick="clSelect(${idx})"><strong class="cl-opt-title">${escapeHtml(o.title)}</strong><small class="cl-opt-cat">${escapeHtml(o.catLabel)}</small></button>`;
    }).join('');
  }
  document.getElementById('cl-card').className='tc-card';
  document.getElementById('cl-feedback').innerHTML='';
  document.getElementById('cl-feedback').className='tc-feedback';
  _clAnswered=false;
  _clRenderProgress();
}

function clSelect(idx){
  if(_clAnswered)return;
  _clAnswered=true;
  const q=_clQueue[_clIdx];
  const correctIdx=LAWS.indexOf(q);
  const ok=idx===correctIdx;
  document.querySelectorAll('.tc-opt').forEach(btn=>{
    const bi=Number(btn.dataset.idx);
    if(bi===correctIdx)btn.className=btn.className.replace(/tc-opt(\s|$)/,'tc-opt tc-opt-correct ').trim();
    else if(bi===idx&&!ok)btn.className=btn.className.replace(/tc-opt(\s|$)/,'tc-opt tc-opt-wrong ').trim();
    else btn.className=btn.className.replace(/tc-opt(\s|$)/,'tc-opt tc-opt-dim ').trim();
  });
  const card=document.getElementById('cl-card');
  const fb=document.getElementById('cl-feedback');
  if(ok){
    card.className='tc-card tc-card-correct';
    fb.innerHTML='<i class="fa-solid fa-circle-check"></i> Correct!';
    fb.className='tc-feedback tc-fb-ok';
    _clCorrect++;_clStreak++;
  }else{
    card.className='tc-card tc-card-wrong';
    const ans=_clMode==='name'?_clTrunc(q.sections[0].text,90):q.title;
    fb.innerHTML=`<i class="fa-solid fa-circle-xmark"></i> Incorrect — <strong>${escapeHtml(ans)}</strong>`;
    fb.className='tc-feedback tc-fb-err';
    _clStreak=0;
  }
  _clResults.push({title:q.title,cat:q.catLabel,ok});
  _clUpdateStats();_clRenderProgress();
  _clStartTimer();
}

function _clAdvance(){
  if(_clTimer){clearTimeout(_clTimer);_clTimer=null;}
  if(_clTick){clearInterval(_clTick);_clTick=null;}
  document.getElementById('cl-next').style.display='none';
  const bar=document.getElementById('cl-timer-bar');if(bar)bar.remove();
  _clIdx++;
  if(_clIdx>=_clQueue.length){_clShowResult();return;}
  _clShowQuestion();
}

function _clUpdateStats(){
  document.getElementById('cl-score').textContent=_clCorrect+' / '+_clQueue.length;
  document.getElementById('cl-streak').textContent='Streak: '+_clStreak;
}

function _clRenderProgress(){
  const el=document.getElementById('cl-progress');
  el.innerHTML=_clQueue.map((_,i)=>{
    const r=_clResults[i];
    let cls='qz-dot';
    if(r===undefined&&i===_clIdx)cls+=' qz-dot-cur';
    else if(r?.ok)cls+=' qz-dot-ok';
    else if(r&&!r.ok)cls+=' qz-dot-err';
    return`<div class="${cls}"></div>`;
  }).join('');
}

function _clShowResult(){
  const pct=Math.round(_clCorrect/_clQueue.length*100);
  const label=pct===100?'Perfect!':pct>=80?'Nice work!':pct>=60?'Getting there!':'Keep practising!';
  const wrong=_clResults.filter(r=>!r.ok);
  document.getElementById('cl-game').style.display='none';
  const res=document.getElementById('cl-result');
  res.style.display='';
  res.innerHTML=`
    <div class="qz-res-pct">${pct}%</div>
    <div class="qz-res-label">${escapeHtml(label)}</div>
    <div class="qz-res-sub">${_clCorrect} of ${_clQueue.length} correct</div>
    ${wrong.length?`<div class="tc-missed cl-missed">
      <div class="tc-missed-title">Missed</div>
      ${wrong.map(r=>`<div class="tc-missed-row"><span class="tc-missed-code">${escapeHtml(r.title)}</span><span class="tc-missed-desc">${escapeHtml(r.cat)}</span></div>`).join('')}
    </div>`:''}
    <button class="qz-restart-btn" onclick="clStart()"><i class="fa-solid fa-rotate-right"></i> Try Again</button>`;
}

document.addEventListener('keydown',e=>{
  if(e.key!=='Enter')return;
  const next=document.getElementById('cl-next');
  if(next&&next.style.display!=='none'){_clAdvance();return;}
  const focused=document.activeElement;
  if(focused&&focused.classList.contains('tc-opt'))focused.click();
});

window.__pageInits=window.__pageInits||{};
window.__pageInits.clquiz=function(){clStart();};
window.addEventListener('load',clStart);
