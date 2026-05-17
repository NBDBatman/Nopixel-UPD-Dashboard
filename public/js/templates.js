const TEMPLATE_FILES=[
  '01-Standard-Report.md','02-Search-Warrant.md','03-Subpoena.md',
  '04-Bail-Conditions.md','05-Criminal-Docket.md','06-DOA.md',
];
const TMPL_ICONS=[
  'fa-file-pen','fa-magnifying-glass','fa-database',
  'fa-handcuffs','fa-gavel','fa-skull',
];
let TMPLS=[];

function parseMd(text){
  const lines=text.split('\n');
  let title='Untitled',bodyStart=0;
  for(let i=0;i<lines.length;i++){
    if(lines[i].startsWith('# ')){title=lines[i].slice(2).trim();bodyStart=i+1;break;}
  }
  while(bodyStart<lines.length&&lines[bodyStart].trim()==='')bodyStart++;
  return{title,body:lines.slice(bodyStart).join('\n').trimEnd()};
}

function renderTmplBody(body){
  const lines=body.split('\n');
  let html='<div class="tmpl-fields">';
  let i=0;
  while(i<lines.length){
    const raw=lines[i],trimmed=raw.trim();
    if(!trimmed){i++;continue;}
    if(trimmed.startsWith('•')){
      const text=trimmed.slice(1).trim();
      const label=text.endsWith(':')?text.slice(0,-1):text;
      html+=`<div class="tmpl-bullet-field"><span class="tmpl-bullet-dot"></span><span class="tmpl-field-label">${escapeHtml(label)}</span></div>`;
      i++;continue;
    }
    if(raw.startsWith('  ')&&trimmed.includes(':')){
      const ci=trimmed.indexOf(':');
      const lbl=trimmed.slice(0,ci),desc=trimmed.slice(ci+1).trim();
      html+=`<div class="tmpl-condition-field"><div class="tmpl-cond-head"><span class="tmpl-cond-dot"></span><span class="tmpl-cond-label">${escapeHtml(lbl)}</span></div>${desc?`<p class="tmpl-cond-desc">${escapeHtml(desc)}</p>`:''}</div>`;
      i++;continue;
    }
    if(raw.startsWith('  ')){
      html+=`<span class="tmpl-sub-item">${escapeHtml(trimmed)}</span>`;
      i++;continue;
    }
    if(trimmed.endsWith(':')){
      const label=trimmed.slice(0,-1);i++;
      const hints=[];
      while(i<lines.length){
        const nr=lines[i],nt=nr.trim();
        if(!nt||nt.endsWith(':')||nt.startsWith('•')||nr.startsWith('  '))break;
        hints.push(nt);i++;
      }
      html+=`<div class="tmpl-field"><span class="tmpl-field-label">${escapeHtml(label)}</span>${hints.length?`<span class="tmpl-field-hint">${escapeHtml(hints.join('\n'))}</span>`:''}</div>`;
      continue;
    }
    html+=`<p class="tmpl-plain">${escapeHtml(trimmed)}</p>`;
    i++;
  }
  return html+'</div>';
}

async function loadTemplates(){
  TMPLS=await Promise.all(TEMPLATE_FILES.map(async f=>{
    const res=await fetch(`/Report_Templates/${f}`,{cache:'no-store'});
    if(!res.ok)throw new Error(`HTTP ${res.status} loading ${f}`);
    return parseMd(await res.text());
  }));
}

async function renderTemplates(){
  const c=document.getElementById('tmpl-container');
  const countEl=document.getElementById('tmpl-count');
  if(!c)return;
  c.innerHTML='<div class="tmpl-status">Loading templates…</div>';
  try{await loadTemplates();}
  catch(err){c.innerHTML='<div class="tmpl-status">Unable to load templates.</div>';console.error(err);return;}
  c.innerHTML='';
  if(!TMPLS.length){c.innerHTML='<div class="tmpl-status">No templates found.</div>';return;}
  if(countEl)countEl.textContent=`${TMPLS.length} templates`;
  TMPLS.forEach((t,i)=>{
    const icon=TMPL_ICONS[i]||'fa-file-lines';
    const num=String(i+1).padStart(2,'0');
    const d=document.createElement('div');
    d.className='tmpl-card';
    d.innerHTML=`
      <div class="tmpl-head">
        <span class="tmpl-num">${num}</span>
        <i class="fa-solid ${icon} tmpl-icon"></i>
        <span class="tmpl-title">${escapeHtml(t.title)}</span>
        <button class="tmpl-copy" onclick="copyTmpl(this,${i})"><i class="fa-solid fa-copy"></i><span>Copy</span></button>
      </div>
      <div class="tmpl-body">${renderTmplBody(t.body)}</div>`;
    c.appendChild(d);
  });
}

function copyTmpl(btn,i){
  if(!TMPLS[i])return;
  navigator.clipboard.writeText(TMPLS[i].body).then(()=>{
    const span=btn.querySelector('span'),icon=btn.querySelector('i');
    if(span)span.textContent='Copied!';
    if(icon){icon.classList.remove('fa-copy');icon.classList.add('fa-check');}
    btn.classList.add('ok');
    setTimeout(()=>{
      if(span)span.textContent='Copy';
      if(icon){icon.classList.remove('fa-check');icon.classList.add('fa-copy');}
      btn.classList.remove('ok');
    },2000);
  });
}

window.__pageInits=window.__pageInits||{};
window.__pageInits.templates=renderTemplates;
window.addEventListener('load',renderTemplates);
