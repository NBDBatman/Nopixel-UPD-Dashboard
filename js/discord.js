let _whUrl=null,_whFetched=false;

async function _getWebhook(){
  if(_whFetched)return _whUrl;
  _whFetched=true;
  if(!window._sb)return null;
  try{
    const{data}=await _sb.from('config').select('value').eq('key','discord_webhook').single();
    _whUrl=data?.value||null;
  }catch(e){_whUrl=null;}
  return _whUrl;
}

async function _discordLog(title,description,color,fields){
  const url=await _getWebhook();
  if(!url)return;
  const embed={
    title,description,color,
    fields:fields||[],
    timestamp:new Date().toISOString(),
    footer:{text:'UPD Dashboard'}
  };
  fetch(url,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({embeds:[embed]}),
    keepalive:true
  }).catch(e=>console.warn('Discord webhook failed:',e));
}

// Pre-fetch webhook URL so it is cached before any action fires
document.addEventListener('DOMContentLoaded',()=>_getWebhook());

// Colour palette
const _DC={
  green:3066993,grey:10066329,red:15158332,
  blue:3447003,orange:15105570,gold:16776960
};
