const NATO_WORDS={A:'Alpha',B:'Bravo',C:'Charlie',D:'Delta',E:'Echo',F:'Foxtrot',G:'Golf',H:'Hotel',I:'India',J:'Juliet',K:'Kilo',L:'Lima',M:'Mike',N:'November',O:'Oscar',P:'Papa',Q:'Quebec',R:'Romeo',S:'Sierra',T:'Tango',U:'Uniform',V:'Victor',W:'Whiskey',X:'X-Ray',Y:'Yankee',Z:'Zulu'};
const AMER_WORDS={A:'Adam',B:'Boy',C:'Charles',D:'David',E:'Edward',F:'Frank',G:'George',H:'Henry',I:'Ida',J:'John',K:'King',L:'Lincoln',M:'Mary',N:'Nora',O:'Ocean',P:'Paul',Q:'Queen',R:'Robert',S:'Sam',T:'Tom',U:'Union',V:'Victor',W:'William',X:'X-Ray',Y:'Young',Z:'Zebra'};
const NUM_WORDS={0:'Zero',1:'One',2:'Two',3:'Three',4:'Four',5:'Five',6:'Six',7:'Seven',8:'Eight',9:'Nine'};

let _pcMode='nato';

function _pcWord(ch){
  const u=ch.toUpperCase();
  if(/[A-Z]/.test(u))return(_pcMode==='nato'?NATO_WORDS:AMER_WORDS)[u]||null;
  if(/[0-9]/.test(ch))return NUM_WORDS[parseInt(ch)];
  return null;
}

function renderConverter(){
  const input=document.getElementById('pc-input');
  const output=document.getElementById('pc-output');
  const copyBtn=document.getElementById('pc-copy');
  if(!input||!output)return;
  const val=input.value.replace(/\s/g,'');
  if(!val){
    output.innerHTML='<span class="pc-placeholder">Output will appear here</span>';
    if(copyBtn)copyBtn.disabled=true;
    return;
  }
  const spoken=[];const chips=[];
  for(const ch of val){
    const word=_pcWord(ch);
    if(word){
      spoken.push(word);
      chips.push(`<div class="pc-chip"><span class="pc-char">${escapeHtml(ch.toUpperCase())}</span><span class="pc-word">${escapeHtml(word)}</span></div>`);
    }else if(ch==='-'){
      chips.push(`<div class="pc-sep">—</div>`);
    }
  }
  output.innerHTML=chips.length?chips.join(''):'<span class="pc-placeholder">No readable characters</span>';
  if(copyBtn){
    copyBtn.disabled=spoken.length===0;
    copyBtn.dataset.copy=spoken.join(' ');
  }
}

function pcSetAlpha(mode,el){
  _pcMode=mode;
  document.querySelectorAll('.pc-alpha-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  renderConverter();
}

function pcCopy(){
  const btn=document.getElementById('pc-copy');
  if(!btn||!btn.dataset.copy)return;
  navigator.clipboard.writeText(btn.dataset.copy).then(()=>{
    const orig=btn.innerHTML;
    btn.innerHTML='<i class="fa-solid fa-check"></i> Copied';
    setTimeout(()=>{btn.innerHTML=orig;},1800);
  });
}

window.__pageInits=window.__pageInits||{};
window.__pageInits.phonetics=function(){
  const input=document.getElementById('pc-input');
  if(input){input.value='';input.addEventListener('input',renderConverter);}
  renderConverter();
};
window.addEventListener('load',()=>{
  const input=document.getElementById('pc-input');
  if(input)input.addEventListener('input',renderConverter);
});
