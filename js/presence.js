function _esc(s){return(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

function _initPresence(){
  const session=_getSession();
  if(!session||!window._sb)return;

  _createOnlineBar(session);

  const channel=_sb.channel('online-presence',{config:{presence:{key:session.uid}}});

  channel
    .on('presence',{event:'sync'},()=>{
      const state=channel.presenceState();
      const users=Object.values(state).flat();
      _updateOnlineBar(users,session.uid);
    })
    .subscribe(async status=>{
      if(status==='SUBSCRIBED'){
        await channel.track({callsign:session.callsign,name:session.name,uid:session.uid});
      }
    });

  window._presChannel=channel;
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
  el.innerHTML=others.map(u=>`<span class="ob-pill"><span class="ob-u-dot"></span>${_esc(u.callsign)} · ${_esc(u.name)}</span>`).join('');
}

function _tickClock(){
  const el=document.getElementById('ob-time');
  if(el)el.textContent=new Date().toLocaleTimeString('en-AU',{hour:'2-digit',minute:'2-digit',hour12:false});
}

document.addEventListener('DOMContentLoaded',_initPresence);
