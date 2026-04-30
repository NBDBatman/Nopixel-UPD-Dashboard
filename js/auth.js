const _SESSION_KEY='upd-session';

function _getSession(){
  try{
    const s=JSON.parse(localStorage.getItem(_SESSION_KEY));
    if(!s||!s.expires||Date.now()>s.expires)return null;
    return s;
  }catch(e){return null;}
}

function logout(){
  if(window._presChannel){
    window._presChannel.untrack().catch(()=>{});
    window._presChannel.unsubscribe();
  }
  localStorage.removeItem(_SESSION_KEY);
  window.location.replace('./login.html');
}
