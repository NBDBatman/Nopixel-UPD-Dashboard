const _LOGIN_SESSION_KEY='upd-session';
const _LOGIN_SESSION_MS=8*60*60*1000;

// If already logged in redirect straight to dashboard
(function(){
  try{
    const s=JSON.parse(localStorage.getItem(_LOGIN_SESSION_KEY));
    if(s&&s.expires&&Date.now()<s.expires)window.location.replace('./index.html');
  }catch(e){}
})();

function _showErr(msg){
  const el=document.getElementById('login-error');
  if(!el)return;
  el.textContent=msg;
  el.style.display='block';
}

async function doLogin(){
  const callsign=(document.getElementById('l-callsign')?.value||'').trim().toUpperCase();
  const name=(document.getElementById('l-name')?.value||'').trim();
  const code=(document.getElementById('l-code')?.value||'').trim();

  document.getElementById('login-error').style.display='none';

  if(!callsign||!name){_showErr('Please enter your callsign and name.');return;}

  if(!window._sb){_showErr('Connection error — please refresh the page.');return;}

  let storedCode='';
  try{
    const{data,error}=await _sb.from('config').select('value').eq('key','dept_code').single();
    if(error){console.error('config fetch:',error);_showErr('Could not verify access code ('+error.message+').');return;}
    storedCode=data?.value||'';
  }catch(e){
    console.error('config fetch exception:',e);
    _showErr('Connection error — please try again.');
    return;
  }

  if(code!==storedCode){_showErr('Incorrect department access code.');return;}

  const uid='u_'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
  localStorage.setItem(_LOGIN_SESSION_KEY,JSON.stringify({callsign,name,uid,expires:Date.now()+_LOGIN_SESSION_MS}));
  const{error:_alErr}=await _sb.from('auth_logs').insert({action:'Signed in',callsign,name});
  if(_alErr)console.error('auth_logs insert failed:',_alErr);
  await _discordLog('🔐 Officer Signed In','**'+callsign+' '+name+'** just signed in',_DC.green,[{name:'Callsign',value:callsign,inline:true},{name:'Name',value:name,inline:true}]);
  window.location.replace('./index.html');
}

document.addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});
