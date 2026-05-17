function _parseClDate(raw){
  const m=raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if(!m)return 0;
  const y=parseInt(m[3])+(m[3].length===2?2000:0);
  return new Date(y,parseInt(m[2])-1,parseInt(m[1])).getTime();
}

function _formatClDate(raw){
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const m=raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if(!m)return raw;
  const d=parseInt(m[1]),mo=parseInt(m[2])-1,y=parseInt(m[3])+(m[3].length===2?2000:0);
  return`${d} ${months[mo]||m[2]} ${y}`;
}

function _authorCls(author){
  const v=(author||'').toLowerCase();
  if(v==='barr')return'cl-author-barr';
  if(v==='remi')return'cl-author-remi';
  return'cl-author-other';
}

async function renderChangelog(){
  const root=document.getElementById('cl-root');
  if(!root)return;
  root.innerHTML='<div class="cl-loading"><i class="fa-solid fa-spinner fa-spin"></i> Loading…</div>';
  try{
    const res=await fetch('/changelog.json',{cache:'no-store'});
    if(!res.ok)throw new Error('HTTP '+res.status);
    const data=await res.json();

    if(!Array.isArray(data.entries)||!data.entries.length){
      root.innerHTML='<p class="cl-empty">No changelog entries.</p>';return;
    }

    const groups=new Map();
    data.entries.forEach(e=>{
      const d=e.date||'Unknown';
      if(!groups.has(d))groups.set(d,[]);
      groups.get(d).push(e);
    });

    const sorted=[...groups.entries()].sort((a,b)=>_parseClDate(b[0])-_parseClDate(a[0]));

    const contactHtml=data.contact
      ?`<div class="cl-contact"><i class="fa-solid fa-circle-info"></i><span>${escapeHtml(data.contact)}</span></div>`
      :'';

    const timelineHtml=sorted.map(([date,entries],gi)=>`
      <div class="cl-group">
        <div class="cl-date-node">
          <span class="cl-dot${gi===0?' cl-dot-latest':''}"><i class="fa-solid fa-circle-dot"></i></span>
          <span class="cl-date-label">${escapeHtml(_formatClDate(date))}</span>
          <span class="cl-entry-count">${entries.length} change${entries.length!==1?'s':''}</span>
        </div>
        <div class="cl-entries">
          ${entries.map(e=>`
            <div class="cl-entry">
              <span class="cl-author ${_authorCls(e.author)}">${escapeHtml(e.author||'—')}</span>
              <span class="cl-change">${escapeHtml(e.change||'')}</span>
            </div>`).join('')}
        </div>
      </div>`).join('');

    root.innerHTML=contactHtml+`<div class="cl-timeline">${timelineHtml}</div>`;
  }catch(err){
    root.innerHTML='<p class="cl-empty">Changelog could not be loaded.</p>';
    console.error('Failed to load changelog:',err);
  }
}

window.__pageInits=window.__pageInits||{};
window.__pageInits.changelog=renderChangelog;
window.addEventListener('load',renderChangelog);
