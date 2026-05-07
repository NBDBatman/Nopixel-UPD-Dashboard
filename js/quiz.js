const QZ_NATO={A:'Alpha',B:'Bravo',C:'Charlie',D:'Delta',E:'Echo',F:'Foxtrot',G:'Golf',H:'Hotel',I:'India',J:'Juliet',K:'Kilo',L:'Lima',M:'Mike',N:'November',O:'Oscar',P:'Papa',Q:'Quebec',R:'Romeo',S:'Sierra',T:'Tango',U:'Uniform',V:'Victor',W:'Whiskey',X:'X-Ray',Y:'Yankee',Z:'Zulu'};
const QZ_AMER={A:'Adam',B:'Boy',C:'Charles',D:'David',E:'Edward',F:'Frank',G:'George',H:'Henry',I:'Ida',J:'John',K:'King',L:'Lincoln',M:'Mary',N:'Nora',O:'Ocean',P:'Paul',Q:'Queen',R:'Robert',S:'Sam',T:'Tom',U:'Union',V:'Victor',W:'William',X:'X-Ray',Y:'Young',Z:'Zebra'};

const QZ_STORE='upd-qz-scores';
let _qzMode='nato',_qzQueue=[],_qzIdx=0,_qzCorrect=0,_qzStreak=0,_qzMaxStreak=0,_qzResults={},_qzAnswered=false;
let _qzTimer=null,_qzTick=null;
const _QZ_DELAY=5;

function _qzAlpha(){return _qzMode==='nato'?QZ_NATO:QZ_AMER;}

function _qzStartTimer(){
  const btn=document.getElementById('qz-submit');
  btn.innerHTML='Next → <span class="qz-timer-count" id="qz-timer-count">'+_QZ_DELAY+'</span>';
  const card=document.getElementById('qz-card');
  let bar=document.getElementById('qz-timer-bar');
  if(!bar){
    bar=document.createElement('div');
    bar.id='qz-timer-bar';
    bar.className='qz-timer qz-timer-deep';
    bar.innerHTML='<div class="qz-timer-fill" id="qz-timer-fill"></div>';
    card.appendChild(bar);
  }
  const fill=document.getElementById('qz-timer-fill');
  fill.style.transition='none';fill.style.width='100%';
  fill.offsetWidth;
  fill.style.transition=`width ${_QZ_DELAY}s linear`;fill.style.width='0%';
  let t=_QZ_DELAY;
  if(_qzTick)clearInterval(_qzTick);
  _qzTick=setInterval(()=>{t--;const el=document.getElementById('qz-timer-count');if(el)el.textContent=t;if(t<=0)clearInterval(_qzTick);},1000);
  if(_qzTimer)clearTimeout(_qzTimer);
  _qzTimer=setTimeout(_qzAdvance,_QZ_DELAY*1000);
}

function _qzClearTimer(){
  if(_qzTimer){clearTimeout(_qzTimer);_qzTimer=null;}
  if(_qzTick){clearInterval(_qzTick);_qzTick=null;}
  const bar=document.getElementById('qz-timer-bar');if(bar)bar.remove();
}

function qzSetMode(mode,el){
  _qzMode=mode;
  document.querySelectorAll('.qz-mode-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  qzStart();
}

function qzStart(){
  _qzClearTimer();
  _qzQueue=Object.keys(_qzAlpha()).sort(()=>Math.random()-.5);
  _qzIdx=0;_qzCorrect=0;_qzStreak=0;_qzMaxStreak=0;_qzResults={};_qzAnswered=false;
  document.getElementById('qz-game').style.display='';
  document.getElementById('qz-result').style.display='none';
  _qzShowQuestion();
  _qzUpdateStats();
  _qzRenderProgress();
}

function _qzShowQuestion(){
  const letter=_qzQueue[_qzIdx];
  document.getElementById('qz-letter').textContent=letter;
  const input=document.getElementById('qz-input');
  input.value='';input.disabled=false;
  const card=document.getElementById('qz-card');
  card.className='qz-card';
  const fb=document.getElementById('qz-feedback');
  fb.textContent='';fb.className='qz-feedback';
  document.getElementById('qz-submit').textContent='Check';
  _qzAnswered=false;
  _qzRenderProgress();
  setTimeout(()=>input.focus(),50);
}

function qzSubmit(){
  if(_qzAnswered){_qzClearTimer();_qzAdvance();return;}
  const input=document.getElementById('qz-input');
  const val=input.value.trim();
  if(!val)return;
  const letter=_qzQueue[_qzIdx];
  const correct=_qzAlpha()[letter];
  const ok=val.replace(/[^a-z]/gi,'').toLowerCase()===correct.replace(/[^a-z]/gi,'').toLowerCase();
  _qzAnswered=true;
  input.disabled=true;
  const card=document.getElementById('qz-card');
  const fb=document.getElementById('qz-feedback');
  if(ok){
    card.className='qz-card qz-correct';
    fb.innerHTML='<i class="fa-solid fa-circle-check"></i> Correct!';
    fb.className='qz-feedback qz-fb-ok';
    _qzCorrect++;_qzStreak++;if(_qzStreak>_qzMaxStreak)_qzMaxStreak=_qzStreak;
  }else{
    card.className='qz-card qz-incorrect';
    fb.innerHTML=`<i class="fa-solid fa-circle-xmark"></i> Incorrect — <strong>${escapeHtml(letter)}</strong> is <strong>${escapeHtml(correct)}</strong>`;
    fb.className='qz-feedback qz-fb-err';
    _qzStreak=0;
  }
  _qzResults[letter]=ok;
  _qzUpdateStats();
  _qzRenderProgress();
  _qzStartTimer();
}

function _qzAdvance(){
  _qzClearTimer();
  _qzIdx++;
  if(_qzIdx>=_qzQueue.length){_qzShowResult();return;}
  _qzShowQuestion();
}

function _qzUpdateStats(){
  document.getElementById('qz-score').textContent=_qzCorrect+' / '+_qzQueue.length;
  document.getElementById('qz-streak').textContent='Streak: '+_qzStreak;
}

function _qzRenderProgress(){
  const el=document.getElementById('qz-progress');
  const currentLetter=_qzQueue[_qzIdx];
  el.innerHTML='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l=>{
    let cls='qz-dot';
    if(_qzResults[l]===true)cls+=' qz-dot-ok';
    else if(_qzResults[l]===false)cls+=' qz-dot-err';
    else if(l===currentLetter&&!_qzAnswered)cls+=' qz-dot-cur';
    return`<div class="${cls}" title="${escapeHtml(l)}">${escapeHtml(l)}</div>`;
  }).join('');
}

function _qzSaveScore(pct){
  let s={};try{s=JSON.parse(localStorage.getItem(QZ_STORE))||{};}catch(e){}
  const newBest=pct>(s.bestPct||0)||_qzMaxStreak>(s.bestStreak||0);
  s.bestPct=Math.max(pct,s.bestPct||0);
  s.bestStreak=Math.max(_qzMaxStreak,s.bestStreak||0);
  s.gamesPlayed=(s.gamesPlayed||0)+1;
  try{localStorage.setItem(QZ_STORE,JSON.stringify(s));}catch(e){}
  return{s,newBest};
}

let _qzReviewList=[],_qzReviewIdx=0;
function _qzStartReview(){
  _qzReviewList=Object.entries(_qzResults).filter(([,v])=>!v).map(([k])=>k);
  _qzReviewIdx=0;
  _qzRenderReview();
}
function _qzRenderReview(){
  const letter=_qzReviewList[_qzReviewIdx];
  const res=document.getElementById('qz-result');
  const isLast=_qzReviewIdx>=_qzReviewList.length-1;
  res.innerHTML=`
    <div class="qz-review-hd">Review <span class="qz-review-prog">${_qzReviewIdx+1} / ${_qzReviewList.length}</span></div>
    <div class="qz-review-card">
      <div class="qz-review-q">${escapeHtml(letter)}</div>
      <div class="qz-review-a">${escapeHtml(_qzAlpha()[letter])}</div>
    </div>
    <button class="qz-restart-btn" onclick="${isLast?'qzStart()':'_qzReviewNext()'}">
      ${isLast?'<i class="fa-solid fa-rotate-right"></i> Try Again':'Next <i class="fa-solid fa-arrow-right"></i>'}
    </button>`;
}
function _qzReviewNext(){_qzReviewIdx++;_qzRenderReview();}

function _qzShowResult(){
  const total=_qzQueue.length;
  const pct=Math.round(_qzCorrect/total*100);
  const label=pct===100?'Perfect!':pct>=80?'Nice work!':pct>=60?'Getting there!':'Keep practising!';
  const wrongEntries=Object.entries(_qzResults).filter(([,v])=>!v);
  const wrong=wrongEntries.map(([k])=>`${k} = ${_qzAlpha()[k]}`).sort();
  const {s,newBest}=_qzSaveScore(pct);
  document.getElementById('qz-game').style.display='none';
  const res=document.getElementById('qz-result');
  res.style.display='';
  res.innerHTML=`
    <div class="qz-res-pct">${pct}%</div>
    <div class="qz-res-label">${escapeHtml(label)}</div>
    <div class="qz-res-sub">${_qzCorrect} of ${total} correct</div>
    <div class="qz-pb-row">${newBest?'<span class="qz-pb-badge"><i class="fa-solid fa-trophy"></i> Personal Best!</span>':''}<span class="qz-pb-stats">Best: ${s.bestPct}% · Streak: ${s.bestStreak} · Games: ${s.gamesPlayed}</span></div>
    ${wrong.length?`<div class="qz-res-missed"><div class="qz-res-missed-title">Missed</div>${wrong.map(w=>`<span class="qz-missed-pill">${escapeHtml(w)}</span>`).join('')}</div>`:''}
    <div class="qz-result-btns">
      <button class="qz-restart-btn" onclick="qzStart()"><i class="fa-solid fa-rotate-right"></i> Try Again</button>
      ${wrongEntries.length?`<button class="qz-review-btn" onclick="_qzStartReview()"><i class="fa-solid fa-eye"></i> Review Missed</button>`:''}
    </div>`;
}

document.addEventListener('keydown',e=>{
  if(e.key!=='Enter')return;
  if(_qzAnswered){_qzClearTimer();_qzAdvance();}
});

window.__pageInits=window.__pageInits||{};
window.__pageInits.quiz=function(){qzStart();};
window.addEventListener('load',()=>{
  document.getElementById('qz-input')?.addEventListener('keydown',e=>{
    if(e.key==='Enter'){e.preventDefault();e.stopPropagation();qzSubmit();}
  });
  qzStart();
});
