const _LOGIN_SESSION_KEY='upd-session';
const _LOGIN_SESSION_MS=8*60*60*1000;

// If already logged in redirect straight to dashboard
(function(){
  try{
    const s=JSON.parse(localStorage.getItem(_LOGIN_SESSION_KEY));
    if(s&&s.expires&&Date.now()<s.expires)window.location.replace('./index.html');
  }catch(e){}
})();

async function doLogin(){
  const callsign=(document.getElementById('l-callsign').value||'').trim().toUpperCase();
  const name=(document.getElementById('l-name').value||'').trim();
  const code=(document.getElementById('l-code').value||'').trim();
  const errEl=document.getElementById('login-error');

  errEl.style.display='none';

  if(!callsign||!name){
    errEl.textContent='Please enter your callsign and name.';
    errEl.style.display='block';
    return;
  }

  const{data,error}=await _sb.from('config').select('value').eq('key','dept_code').single();
  if(error||!data){
    errEl.textContent='Could not verify access code — check your connection.';
    errEl.style.display='block';
    return;
  }

  if(code!==data.value){
    errEl.textContent='Incorrect department access code.';
    errEl.style.display='block';
    return;
  }

  const uid='u_'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
  const session={callsign,name,uid,expires:Date.now()+_LOGIN_SESSION_MS};
  localStorage.setItem(_LOGIN_SESSION_KEY,JSON.stringify(session));
  window.location.replace('./index.html');
}

document.addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});
