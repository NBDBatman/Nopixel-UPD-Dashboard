function esc(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function hl(s,q){return q?s.replace(new RegExp('('+esc(q)+')','gi'),'<mark>$1</mark>'):s}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// JS-based tooltip — use data-tip-js="text" for elements inside overflow:hidden/auto containers
(function(){
  const T=document.createElement('div');T.id='_jstip';
  T.style.cssText='position:fixed;z-index:9999;background:var(--s4);color:var(--text);border:1px solid var(--border);border-radius:6px;padding:4px 10px;font-size:11px;font-weight:600;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .12s;box-shadow:0 2px 8px rgba(0,0,0,.45)';
  document.addEventListener('DOMContentLoaded',()=>document.body.appendChild(T));
  let _hide;
  document.addEventListener('mouseover',e=>{
    const el=e.target.closest('[data-tip-js]');if(!el)return;
    clearTimeout(_hide);
    T.textContent=el.dataset.tipJs;T.style.opacity='0';T.style.display='block';
    const r=el.getBoundingClientRect(),tw=T.offsetWidth,th=T.offsetHeight;
    let left=r.left+r.width/2-tw/2,top=r.top-th-7;
    if(top<6){top=r.bottom+7;}
    if(left<6)left=6;
    if(left+tw>window.innerWidth-6)left=window.innerWidth-tw-6;
    T.style.left=left+'px';T.style.top=top+'px';T.style.opacity='1';
  });
  document.addEventListener('mouseout',e=>{
    if(!e.target.closest('[data-tip-js]'))return;
    _hide=setTimeout(()=>{T.style.opacity='0';setTimeout(()=>T.style.display='none',120);},80);
  });
  document.addEventListener('click',()=>{T.style.opacity='0';T.style.display='none';});
})();
