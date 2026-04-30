const _SESSION_KEY='upd-session';

function _getSession(){
  try{
    const s=JSON.parse(localStorage.getItem(_SESSION_KEY));
    if(!s||!s.expires||Date.now()>s.expires)return null;
    return s;
  }catch(e){return null;}
}

async function logout(){
  const s=_getSession();
  try{
    if(window._presChannel){
      window._presChannel.untrack();
      window._presChannel.unsubscribe();
      window._presChannel=null;
    }
  }catch(e){console.warn('presence cleanup:',e);}
  try{
    if(s&&window._sb){
      const{error:_alErr}=await _sb.from('auth_logs').insert({action:'Signed out',callsign:s.callsign,name:s.name});
      if(_alErr)console.error('auth_logs insert failed:',_alErr);
      await _discordLog('🚪 Officer Signed Out','**'+s.callsign+' '+s.name+'** signed out',_DC.grey,[{name:'Callsign',value:s.callsign,inline:true},{name:'Name',value:s.name,inline:true}]);
    }
  }catch(e){console.warn('auth log:',e);}
  localStorage.removeItem(_SESSION_KEY);
  window.location.replace('./login.html');
}
