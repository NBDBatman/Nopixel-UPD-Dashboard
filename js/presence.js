function _esc(s){return(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

const _OB_PAGE_LABELS={
  index:'Home',codes:'10-Codes',phonetics:'Phonetics',laws:'Case Laws',
  constitution:'Constitution',jurisdiction:'Map',court:'Court',
  templates:'Templates',roster:'Roster',bolo:'BOLO',notepad:'Notepad',
  subpoena:'Subpoena',guesser:'Street Guesser',quiz:'Phonetics Quiz',
  tcquiz:'10-Codes Quiz',ucquiz:'Unit Caps Quiz',clquiz:'Case Law Quiz',
  changelog:'Changelog',credits:'Credits',quotes:'Quote Board'
};

let _lastPresPage='';

function _currentPage(){
  return document.querySelector('.nav-item.active[data-page]')?.dataset?.page||'';
}

function _trackPage(){
  const page=_currentPage();
  if(page===_lastPresPage)return;
  _lastPresPage=page;
  const session=_getSession();
  if(session&&window._presChannel)
    window._presChannel.track({callsign:session.callsign,name:session.name,uid:session.uid,page});
}

function _initPresence(){
  const session=_getSession();
  if(!session||!window._sb)return;

  _createOnlineBar(session);

  const channel=_sb.channel('online-presence',{config:{presence:{key:session.uid}}});

  const _presRefresh=()=>{
    const state=channel.presenceState();
    const all=Object.values(state).flat();
    const seen=new Map();
    for(const u of all)seen.set(u.uid,u);
    _updateOnlineBar([...seen.values()],session.uid);
  };

  channel
    .on('presence',{event:'sync'},_presRefresh)
    .on('presence',{event:'join'},_presRefresh)
    .on('presence',{event:'leave'},_presRefresh)
    .subscribe(async status=>{
      if(status==='SUBSCRIBED'){
        const page=_currentPage();
        _lastPresPage=page;
        await channel.track({callsign:session.callsign,name:session.name,uid:session.uid,page});
      }
    });

  window._presChannel=channel;

  // Watch nav for page changes and re-track immediately
  const nav=document.querySelector('.sb-nav');
  if(nav)new MutationObserver(_trackPage).observe(nav,{subtree:true,attributeFilter:['class']});

  _tickClock();
  setInterval(_tickClock,30000);
}

function _createOnlineBar(session){
  if(document.getElementById('online-bar'))return;
  const bar=document.createElement('div');
  bar.id='online-bar';
  bar.className='online-bar';
  bar.innerHTML=
    '<span class="ob-live"><span class="ob-dot"></span>ONLINE</span>'+
    '<div class="ob-users" id="ob-users"></div>'+
    '<div class="ob-right">'+
      '<span class="ob-me" id="ob-me"></span>'+
      '<span class="ob-sep">·</span>'+
      '<span class="ob-time" id="ob-time"></span>'+
      '<button class="ob-theme" id="th-toggle" onclick="toggleTheme()" title="Toggle theme"></button>'+
      '<button class="ob-logout" onclick="logout()" title="Sign out"><i class="fa-solid fa-right-from-bracket"></i></button>'+
    '</div>';
  document.body.appendChild(bar);
  const meEl=document.getElementById('ob-me');
  if(meEl)meEl.textContent=session.callsign+' · '+session.name;
  const main=document.getElementById('main');
  if(main)main.style.paddingBottom='36px';
  const sidebar=document.getElementById('sidebar');
  if(sidebar)sidebar.style.paddingBottom='36px';
}

function _updateOnlineBar(users,myUid){
  const el=document.getElementById('ob-users');
  if(!el)return;
  const others=users.filter(u=>u.uid!==myUid);
  if(!others.length){el.innerHTML='';return;}

  const pillHtml=u=>{
    const pageLabel=u.page?(_OB_PAGE_LABELS[u.page]||''):'';
    return`<span class="ob-pill"><span class="ob-u-dot"></span>${_esc(u.callsign)} · ${_esc(u.name)}${pageLabel?` <span class="ob-page-badge">${_esc(pageLabel)}</span>`:''}</span>`;
  };

  const pills=others.map(pillHtml).join('');
  el.innerHTML=`<div class="ob-users-inner" id="ob-users-inner">${pills}</div>`;

  // Enable marquee scroll if pills overflow the container
  requestAnimationFrame(()=>{
    const inner=document.getElementById('ob-users-inner');
    if(!inner)return;
    if(inner.scrollWidth>el.clientWidth+4){
      inner.innerHTML=pills+pills; // duplicate for seamless loop
      const dur=Math.max(8,(inner.scrollWidth/2)/35); // ~35px/s
      inner.style.animation=`ob-scroll ${dur}s linear infinite`;
    }
  });
}

function _tickClock(){
  const el=document.getElementById('ob-time');
  if(el)el.textContent=new Date().toLocaleTimeString('en-AU',{hour:'2-digit',minute:'2-digit',hour12:false});
}

document.addEventListener('DOMContentLoaded',_initPresence);
