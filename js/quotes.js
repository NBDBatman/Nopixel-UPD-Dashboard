let _qbQuotes=[],_qbSort='top',_qbSearchQ='',_qbListenerActive=false;
const _QB_VOTED_KEY='upd-qb-voted';

function _qbGetVoted(){try{return JSON.parse(localStorage.getItem(_QB_VOTED_KEY))||[];}catch(e){return[];}}
function _qbAddVote(id){const v=_qbGetVoted();if(!v.includes(id)){v.push(id);localStorage.setItem(_QB_VOTED_KEY,JSON.stringify(v));}}
function _qbHasVoted(id){return _qbGetVoted().includes(id);}

function _qbFmtDate(ts){
  if(!ts)return'';
  return new Date(ts).toLocaleDateString('en-AU',{day:'2-digit',month:'short',year:'2-digit'});
}

async function _qbFetch(){
  if(!window._sb)return;
  const{data,error}=await _sb.from('quotes').select('*');
  if(!error&&data){_qbQuotes=data;_qbRender();}
}

function _qbSetupListener(){
  if(_qbListenerActive||!window._sb)return;
  _qbListenerActive=true;
  _qbFetch();
  _sb.channel('quotes-changes')
    .on('postgres_changes',{event:'*',schema:'public',table:'quotes'},()=>{_qbFetch();})
    .subscribe();
}

function qbSetSort(s,el){
  _qbSort=s;
  document.querySelectorAll('.qb-tab').forEach(t=>t.classList.remove('active'));
  el?.classList.add('active');
  _qbRender();
}

function qbSearch(q){_qbSearchQ=q.toLowerCase();_qbRender();}

async function qbSubmit(){
  const text=(document.getElementById('qb-text')?.value||'').trim();
  const saidBy=(document.getElementById('qb-said-by')?.value||'').trim();
  const context=(document.getElementById('qb-context')?.value||'').trim();
  if(!text||!saidBy){
    const form=document.getElementById('qb-form');
    form?.classList.add('bolo-shake');
    setTimeout(()=>form?.classList.remove('bolo-shake'),400);
    return;
  }
  const session=_getSession();
  if(!session||!window._sb)return;
  const{error}=await _sb.from('quotes').insert({
    quote:text,said_by:saidBy,context:context||null,
    submitted_by:session.callsign+' '+session.name,
    submitted_uid:session.uid,upvotes:0
  });
  if(error){console.error('Quote insert failed:',error.message,error.code);alert('Failed to submit quote: '+error.message);return;}
  document.getElementById('qb-text').value='';
  document.getElementById('qb-said-by').value='';
  document.getElementById('qb-context').value='';
  _qbFetch();
}

async function qbUpvote(id){
  if(_qbHasVoted(id))return;
  const q=_qbQuotes.find(q=>q.id===id);
  if(!q||!window._sb)return;
  _qbAddVote(id);
  await _sb.from('quotes').update({upvotes:(q.upvotes||0)+1}).eq('id',id);
  _qbFetch();
}

function qbDelete(id){
  if(!confirm('Delete this quote? This cannot be undone.'))return;
  _sb.from('quotes').delete().eq('id',id).then(()=>_qbFetch());
}

function qbCopyLink(id){
  const url=location.href.split('?')[0]+'?quote='+id;
  navigator.clipboard.writeText(url).then(()=>{
    const btn=document.querySelector(`.qb-link-btn[data-id="${id}"]`);
    if(btn){const orig=btn.innerHTML;btn.innerHTML='<i class="fa-solid fa-check"></i>';setTimeout(()=>{btn.innerHTML=orig;},1800);}
  });
}

function _qbRender(){
  const list=document.getElementById('qb-list');
  if(!list)return;
  const session=_getSession();
  let quotes=[..._qbQuotes];
  if(_qbSearchQ){
    quotes=quotes.filter(q=>
      (q.quote||'').toLowerCase().includes(_qbSearchQ)||
      (q.said_by||'').toLowerCase().includes(_qbSearchQ)||
      (q.context||'').toLowerCase().includes(_qbSearchQ)||
      (q.submitted_by||'').toLowerCase().includes(_qbSearchQ)
    );
  }
  if(_qbSort==='top')quotes.sort((a,b)=>(b.upvotes||0)-(a.upvotes||0)||(new Date(b.created_at)-new Date(a.created_at)));
  else quotes.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
  if(!quotes.length){
    list.innerHTML=`<div class="qb-empty"><i class="fa-solid fa-quote-left"></i><span>${_qbSearchQ?'No quotes match your search.':'No quotes yet — be the first to submit one.'}</span></div>`;
    return;
  }
  const voted=_qbGetVoted();
  list.innerHTML=quotes.map(q=>{
    const hasVoted=voted.includes(q.id);
    const isOwn=session&&q.submitted_uid===session.uid;
    const ctx=q.context?`<div class="qb-context">${_esc(q.context)}</div>`:'';
    return`<div class="qb-card" data-qid="${q.id}">
      <div class="qb-quote-text">&ldquo;${_esc(q.quote)}&rdquo;</div>
      <div class="qb-said-by">&mdash; ${_esc(q.said_by)}</div>
      ${ctx}
      <div class="qb-card-foot">
        <button class="qb-upvote${hasVoted?' voted':''}" onclick="qbUpvote('${q.id}')" data-tip="${hasVoted?'Already voted':'Upvote'}">
          <i class="fa-solid fa-thumbs-up"></i><span class="qb-vote-count">${q.upvotes||0}</span>
        </button>
        <span class="qb-meta">${_esc(q.submitted_by)} · ${_qbFmtDate(q.created_at)}</span>
        <div class="qb-card-actions">
          <button class="qb-link-btn" data-id="${q.id}" onclick="qbCopyLink('${q.id}')" data-tip="Copy deep link"><i class="fa-solid fa-link"></i></button>
          ${isOwn?`<button class="qb-del-btn" onclick="qbDelete('${q.id}')" data-tip="Delete"><i class="fa-solid fa-trash"></i></button>`:''}
        </div>
      </div>
    </div>`;
  }).join('');

  const deepId=new URLSearchParams(location.search).get('quote');
  if(deepId){
    history.replaceState(null,'',location.pathname);
    requestAnimationFrame(()=>{
      const card=document.querySelector(`.qb-card[data-qid="${deepId}"]`);
      if(card){card.scrollIntoView({behavior:'smooth',block:'center'});card.classList.add('qb-highlight');setTimeout(()=>card.classList.remove('qb-highlight'),2500);}
    });
  }
}

window.__pageInits=window.__pageInits||{};
window.__pageInits.quotes=function(){
  _qbListenerActive=false;
  if(_qbQuotes.length)_qbRender();
  _qbSetupListener();
};
window.addEventListener('load',()=>{
  _qbSetupListener();
  document.getElementById('qb-text')?.addEventListener('keydown',e=>{
    if(e.key==='Enter'&&e.ctrlKey){e.preventDefault();qbSubmit();}
  });
});
