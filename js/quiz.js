const QZ_NATO={A:'Alpha',B:'Bravo',C:'Charlie',D:'Delta',E:'Echo',F:'Foxtrot',G:'Golf',H:'Hotel',I:'India',J:'Juliet',K:'Kilo',L:'Lima',M:'Mike',N:'November',O:'Oscar',P:'Papa',Q:'Quebec',R:'Romeo',S:'Sierra',T:'Tango',U:'Uniform',V:'Victor',W:'Whiskey',X:'X-Ray',Y:'Yankee',Z:'Zulu'};
const QZ_AMER={A:'Adam',B:'Boy',C:'Charles',D:'David',E:'Edward',F:'Frank',G:'George',H:'Henry',I:'Ida',J:'John',K:'King',L:'Lincoln',M:'Mary',N:'Nora',O:'Ocean',P:'Paul',Q:'Queen',R:'Robert',S:'Sam',T:'Tom',U:'Union',V:'Victor',W:'William',X:'X-Ray',Y:'Young',Z:'Zebra'};

let _qzMode='nato',_qzQueue=[],_qzIdx=0,_qzCorrect=0,_qzStreak=0,_qzResults={},_qzAnswered=false;

function _qzAlpha(){return _qzMode==='nato'?QZ_NATO:QZ_AMER;}

function qzSetMode(mode,el){
  _qzMode=mode;
  document.querySelectorAll('.qz-mode-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  qzStart();
}

function qzStart(){
  _qzQueue=Object.keys(_qzAlpha()).sort(()=>Math.random()-.5);
  _qzIdx=0;_qzCorrect=0;_qzStreak=0;_qzResults={};_qzAnswered=false;
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
  if(_qzAnswered){_qzAdvance();return;}
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
    _qzCorrect++;_qzStreak++;
  }else{
    card.className='qz-card qz-incorrect';
    fb.innerHTML=`<i class="fa-solid fa-circle-xmark"></i> Incorrect — <strong>${escapeHtml(letter)}</strong> is <strong>${escapeHtml(correct)}</strong>`;
    fb.className='qz-feedback qz-fb-err';
    _qzStreak=0;
  }
  _qzResults[letter]=ok;
  document.getElementById('qz-submit').textContent='Next →';
  _qzUpdateStats();
  _qzRenderProgress();
}

function _qzAdvance(){
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

function _qzShowResult(){
  const total=_qzQueue.length;
  const pct=Math.round(_qzCorrect/total*100);
  const label=pct===100?'Perfect!':pct>=80?'Nice work!':pct>=60?'Getting there!':'Keep practising!';
  const correct=Object.entries(_qzResults).filter(([,v])=>v).map(([k])=>k).sort();
  const wrong=Object.entries(_qzResults).filter(([,v])=>!v).map(([k])=>`${k} = ${_qzAlpha()[k]}`).sort();
  document.getElementById('qz-game').style.display='none';
  const res=document.getElementById('qz-result');
  res.style.display='';
  res.innerHTML=`
    <div class="qz-res-pct">${pct}%</div>
    <div class="qz-res-label">${escapeHtml(label)}</div>
    <div class="qz-res-sub">${_qzCorrect} of ${total} correct</div>
    ${wrong.length?`<div class="qz-res-missed"><div class="qz-res-missed-title">Missed</div>${wrong.map(w=>`<span class="qz-missed-pill">${escapeHtml(w)}</span>`).join('')}</div>`:''}
    <button class="qz-restart-btn" onclick="qzStart()"><i class="fa-solid fa-rotate-right"></i> Try Again</button>`;
}

window.__pageInits=window.__pageInits||{};
window.__pageInits.quiz=function(){qzStart();};
window.addEventListener('load',()=>{
  document.getElementById('qz-input')?.addEventListener('keydown',e=>{
    if(e.key==='Enter'){e.preventDefault();qzSubmit();}
  });
  qzStart();
});
