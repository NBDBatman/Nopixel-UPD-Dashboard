// ── NAVIGATION ──────────────────────────────────────────────────
function showPage(id, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  el.classList.add('active');
}

// ── 10-CODES DATA ────────────────────────────────────────────────
const CODES=[
  {code:'10-2',desc:'Loud and Clear',prio:'normal'},
  {code:'10-3',desc:'Stop Radio Chatter',prio:'normal'},
  {code:'10-4',desc:'Acknowledgment (OK)',prio:'normal'},
  {code:'10-6',desc:'Available but Busy',prio:'normal'},
  {code:'10-7',desc:'Out of Service',prio:'normal'},
  {code:'10-8',desc:'Back in Service',prio:'normal'},
  {code:'10-9',desc:'Repeat Last',prio:'normal'},
  {code:'10-10',desc:'Fight in Progress',prio:'normal'},
  {code:'10-11',desc:'Deadly Weapon Seen',prio:'normal'},
  {code:'10-12',desc:'Stand By / Staging',prio:'normal'},
  {code:'10-13A',desc:'Officer Down (Emergency)',prio:'emergency'},
  {code:'10-13B',desc:'Officer Down (Non-Emergency)',prio:'urgent'},
  {code:'10-14A',desc:'EMS Down (Emergency)',prio:'emergency'},
  {code:'10-14B',desc:'EMS Down (Non-Emergency)',prio:'urgent'},
  {code:'10-15',desc:'Civil Disturbance',prio:'normal'},
  {code:'10-16',desc:'Domestic Problem',prio:'normal'},
  {code:'10-17',desc:'Meet Complainant',prio:'normal'},
  {code:'10-18',desc:'Quickly',prio:'normal'},
  {code:'10-19',desc:'Return to',prio:'normal'},
  {code:'10-20',desc:'Location (Where are you)',prio:'normal'},
  {code:'10-21',desc:'Call by Telephone',prio:'normal'},
  {code:'10-22',desc:'Disregard',prio:'normal'},
  {code:'10-23',desc:'Arrived on Scene',prio:'normal'},
  {code:'10-24',desc:'Assignment Completed',prio:'normal'},
  {code:'10-25',desc:'Meet with Me',prio:'normal'},
  {code:'10-26',desc:'Detaining Subject — Expedite',prio:'normal'},
  {code:'10-27',desc:"Driver's License Info",prio:'normal'},
  {code:'10-28',desc:'Vehicle Registration Info',prio:'normal'},
  {code:'10-31A',desc:'Burglary',prio:'normal'},
  {code:'10-31B',desc:'Robbery at Gunpoint',prio:'normal'},
  {code:'10-32',desc:'Person with Firearm',prio:'normal'},
  {code:'10-34',desc:'Drug Sales',prio:'normal'},
  {code:'10-35',desc:'Major Crime Alert',prio:'normal'},
  {code:'10-36',desc:'Correct Time',prio:'normal'},
  {code:'10-37',desc:'Investigate Suspicious Activity',prio:'normal'},
  {code:'10-37A',desc:'Investigate Armored Vehicle',prio:'normal'},
  {code:'10-37B',desc:'Trespass on Private Property',prio:'normal'},
  {code:'10-37C',desc:'Suspicious Financial Activity',prio:'normal'},
  {code:'10-38',desc:'Traffic Stop',prio:'normal'},
  {code:'10-39',desc:'Urgent — Use Light & Siren',prio:'normal'},
  {code:'10-40',desc:'Silent Run — No Lights/Siren',prio:'normal'},
  {code:'10-41',desc:'On Duty',prio:'normal'},
  {code:'10-42',desc:'Off Duty',prio:'normal'},
  {code:'10-43',desc:'Information',prio:'normal'},
  {code:'10-44',desc:'Permission to Leave For',prio:'normal'},
  {code:'10-45',desc:'Animal Carcass',prio:'normal'},
  {code:'10-46',desc:'Assist Motorist',prio:'normal'},
  {code:'10-47',desc:'Injured Person',prio:'normal'},
  {code:'10-48',desc:'Traffic Standard Repair At',prio:'normal'},
  {code:'10-49',desc:'Traffic Light Out At',prio:'normal'},
  {code:'10-50',desc:'Vehicle Accident',prio:'normal'},
  {code:'10-52',desc:'EMS Needed',prio:'normal'},
  {code:'10-53',desc:'Road Blocked At',prio:'normal'},
  {code:'10-54',desc:'Livestock on Highway',prio:'normal'},
  {code:'10-55',desc:'Intoxicated Driver',prio:'normal'},
  {code:'10-58',desc:'Direct Traffic',prio:'normal'},
  {code:'10-59',desc:'Convoy or Escort',prio:'normal'},
  {code:'10-60',desc:'Carjacking',prio:'normal'},
  {code:'10-61',desc:'Personnel in Area',prio:'normal'},
  {code:'10-62',desc:'Reply to Message',prio:'normal'},
  {code:'10-63',desc:'Prepare to Make Written Copy',prio:'normal'},
  {code:'10-64',desc:'Message for Local Delivery',prio:'normal'},
  {code:'10-65',desc:'Net Message Assignment',prio:'normal'},
  {code:'10-66',desc:'Message Cancellation',prio:'normal'},
  {code:'10-67',desc:'Smoke / Flames Reported',prio:'normal'},
  {code:'10-68',desc:'Dispatch Information',prio:'normal'},
  {code:'10-69',desc:'Message Received',prio:'normal'},
  {code:'10-70',desc:'Explosion',prio:'normal'},
  {code:'10-71A',desc:'Shots Fired',prio:'normal'},
  {code:'10-71B',desc:'Shots Fired from a Vehicle',prio:'normal'},
  {code:'10-73',desc:'Advise Status',prio:'normal'},
  {code:'10-76',desc:'Enroute',prio:'normal'},
  {code:'10-77',desc:'Need Backup (Non-Emergency)',prio:'urgent'},
  {code:'10-78',desc:'Urgent Backup (Emergency)',prio:'emergency'},
  {code:'10-79',desc:'Notify Coroner',prio:'normal'},
  {code:'10-80',desc:'Pursuit in Progress',prio:'normal'},
  {code:'10-81',desc:'Breath Test',prio:'normal'},
  {code:'10-83',desc:'Work School Crossing At',prio:'normal'},
  {code:'10-84',desc:'If Meeting, Advise ETA',prio:'normal'},
  {code:'10-85',desc:'Delayed Due To',prio:'normal'},
  {code:'10-86',desc:'Officer / Operator on Duty',prio:'normal'},
  {code:'10-87',desc:'Getting Paycheck / Pick Up Checks',prio:'normal'},
  {code:'10-88',desc:'Present Telephone # Of',prio:'normal'},
  {code:'10-89',desc:'Bomb Threat',prio:'normal'},
  {code:'10-90A',desc:'Hi-Sec Robbery in Progress',prio:'normal'},
  {code:'10-90B',desc:'Low-Sec Robbery in Progress',prio:'normal'},
  {code:'10-91',desc:'Transport',prio:'normal'},
  {code:'10-93',desc:'Blockade',prio:'normal'},
  {code:'10-94',desc:'Reckless Driver / Street Race',prio:'normal'},
  {code:'10-95',desc:'Suspect in Custody',prio:'normal'},
  {code:'10-98',desc:'Jail Break',prio:'normal'},
  {code:'10-99',desc:'Jailbreak / Stolen Vehicle',prio:'normal'},
  {code:'10-99A',desc:'Stolen Vehicle With Tracker',prio:'normal'},
  {code:'10-99B',desc:'Vehicle Stolen in Area',prio:'normal'},
  {code:'10-100A',desc:'Disturbance at the Power Grid',prio:'normal'},
  {code:'10-101',desc:'Monitored Bank Activity',prio:'normal'},
];

let codeFilter='all', codeView='grid';

function esc(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function hl(s,q){return q?s.replace(new RegExp('('+esc(q)+')','gi'),'<mark>$1</mark>'):s}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function renderCodes(){
  const q=document.getElementById('codes-search').value.toLowerCase().trim();
  const list=CODES.filter(c=>{
    if(codeFilter!=='all'&&c.prio!==codeFilter)return false;
    return!q||c.code.toLowerCase().includes(q)||c.desc.toLowerCase().includes(q);
  });
  document.getElementById('codes-count').textContent=list.length+' codes';
  if(codeView==='grid'){
    const g=document.getElementById('codes-grid');
    g.innerHTML='';
    if(!list.length){g.innerHTML='<div class="code-no-results">No codes match.</div>';return;}
    list.forEach(c=>{
      const d=document.createElement('div');
      d.className='code-card '+c.prio;
      d.title=`${c.code} - ${c.desc}`;
      d.innerHTML=`<span class="code-num">${hl(c.code,q)}</span><span class="code-desc">${hl(c.desc,q)}</span>`;
      g.appendChild(d);
    });
  }else{
    const tb=document.getElementById('codes-tbody');
    tb.innerHTML='';
    list.forEach(c=>{
      const p=c.prio==='emergency'?'<span class="prio-e"><i class="fa-solid fa-circle icon-red"></i> Emergency</span>':c.prio==='urgent'?'<span class="prio-u"><i class="fa-solid fa-circle icon-orange"></i> Urgent</span>':'<span class="prio-n">—</span>';
      const tr=document.createElement('tr');
      tr.innerHTML=`<td><span class="code-tag">${hl(c.code,q)}</span></td><td>${hl(c.desc,q)}</td><td>${p}</td>`;
      tb.appendChild(tr);
    });
  }
}
function setFilter(el,f){codeFilter=f;document.querySelectorAll('.ftab').forEach(t=>t.classList.remove('active'));el.classList.add('active');renderCodes()}
function setView(el,v){codeView=v;document.querySelectorAll('.vtab').forEach(t=>t.classList.remove('active'));el.classList.add('active');document.getElementById('codes-grid').style.display=v==='grid'?'grid':'none';document.getElementById('codes-table-wrap').style.display=v==='table'?'block':'none';renderCodes()}

// ── CASE LAWS ────────────────────────────────────────────────────
const LAWS=[
  {title:'Tennessee v. Garner',cat:'force',catLabel:'Use of Force',sections:[{text:'Under the Fourth Amendment, a Police Officer may use Deadly Force to prevent the escape of a fleeing suspect only if the officer has a good faith belief that the suspect poses a significant threat of death or serious physical injury. When a Non-Violent felon is ordered to stop, ignoring that order does not give rise to a reasonable belief that deadly force is necessary, unless it has been threatened.'}]},
  {title:'Terry v. Ohio',cat:'search',catLabel:'Search & Seizure',sections:[{text:'Under the Fourth Amendment, a police officer may stop a suspect and frisk them without probable cause to arrest, if the officer has a reasonable suspicion that the person has committed, is committing or is about to commit a crime, and has a reasonable belief that the person "may be armed and presently dangerous."'}]},
  {title:'Penn. vs Mimms',cat:'search',catLabel:'Traffic Stops',sections:[{text:'Police can order a driver out of a car during a lawful traffic stop for officer safety without needing Reasonable Suspicion.'}]},
  {title:'Wyoming v. Houghton',cat:'search',catLabel:'Passenger Searches',sections:[{text:'Police officers with probable cause to search a vehicle may inspect passengers\' belongings found in the car that are capable of concealing the object of the search.'}]},
  {title:'Carroll v. United States',cat:'search',catLabel:'Vehicle Searches',sections:[{text:'Automobile exception to Fourth Amendment protection against warrantless searches. Buildings are stationary while vehicles can be moved before a warrant can be issued. If officers have probable cause that an automobile contains evidence of a crime, the vehicle can be searched without a warrant.'}]},
  {title:'Miranda v. Arizona',cat:'court',catLabel:'Right to Counsel',sections:[{text:'Under the Fifth Amendment, statements a defendant in custody makes during interrogation are admissible only if law enforcement told the defendant of the right to remain silent and the right to speak with an attorney before the interrogation, and those rights were exercised or waived in a knowing, voluntary, and intelligent manner.'}]},
  {title:'The Suarez Standard',cat:'conduct',catLabel:'Station Transport',sections:[{text:'To move an individual to a police station: (1) Reasonable concern for safety only satisfiable by transporting to a station. (2) To identify using forensic tools only usable at the station, if cannot be ID\'d on scene. (3) Investigative interrogation that can only be performed at a secure location while under detainment or arrest. (4) With consent — if not under arrest, they are free to leave the station if not immediately pressing charges.'}]},
  {title:'The Saab Scenario',cat:'search',catLabel:'Item Possession',sections:[{text:'If items are found in immediate care, custody, and/or control of an individual and the officer can reasonably articulate that the person has or should have knowledge of those items. If found within a property (vehicle or building) and no one claims ownership, PC for possession exists for the owner/driver. If LEO witness someone discard items during a chase and can tie it to DNA/fingerprint, PC exists for possession of the item.'}]},
  {title:'Qualified Immuni-Dee',cat:'force',catLabel:'Qualified Immunity',sections:[{label:'Standard:',text:'Officers are granted immunity from liability when they act in good faith and make reasonable decisions based on the perceived threat at the time, even if, in hindsight, less-lethal alternatives may have been available.'},{label:'Threat Perception:',text:'Courts evaluate the officer\'s perception of the threat rather than applying an ideal retrospective analysis.'},{label:'High-Risk Scenarios:',text:'When an officer reasonably believes their life or safety is in immediate danger, their response is judged based on the information available to them at that moment.'}]},
  {title:'The Rhodes Rule',cat:'conduct',catLabel:'Evidence Disclosure',sections:[{text:'Investigators are required to disclose to commanding officers, the prosecution, and the defense any evidence that is relevant and material to guilt, innocence, or procedural fairness. They must ensure no material evidence is withheld or obscured. Evidence is "material" if its disclosure would reasonably influence decisions by commanding officers, prosecutors, or the court.'},{text:'If an allegation is fielded against investigators of withholding evidence, the overseeing Judicial Authority must evaluate the evidence allegedly withheld and the circumstances that led to its exclusion to determine its evidentiary value. They must also determine the context and circumstances surrounding its exclusion and determine if there was any wrongdoing.'}]},
  {title:'People V Barry Benson — Aiding and Abetting',cat:'court',catLabel:'Criminal Law',sections:[{text:'Harbouring of a fugitive did not apply as Mr McQuillen was never in custody when he fled. The court found a serious lack of charge to convey the seriousness of the crime committed.'},{label:'New Charges resulting from this case:',text:'Aiding and Abetting a HAG Offense | Fleeing Judicial Proceedings'}]},
  {title:'The Callahan Clause',cat:'court',catLabel:'Murder Charges',sections:[{text:'When a murder charge is being deliberated, lesser included charges must be considered by the presiding Judge(s). If 1st Degree Murder is pressed, both 2nd Degree Murder and Manslaughter must also be considered. The lesser charge still needs to be proven beyond a reasonable doubt.'}]},
  {title:'Sterling Style',cat:'force',catLabel:'Vehicular Intervention',sections:[{label:'Against Fleeing Cyclists:',text:'LEOs may, under specific circumstances, use their patrol vehicles to physically stop a suspect fleeing on a bicycle when used to terminate a pursuit involving a known risk.'},{label:'Prior Felonious Conduct:',text:'Reasonableness of force is evaluated in context of the suspect\'s preceding actions. When a suspect has committed a serious felony demonstrating disregard for public safety, otherwise-excessive tactics may be deemed appropriate.'},{label:'Proportionality:',text:'Vehicular intervention must be proportional — low-speed collision is viewed more favorably. Using the vehicle as a barrier is preferred but not the only method.'}]},
  {title:'The KJ Criterion',cat:'force',catLabel:'Lethal Force',sections:[{text:'Verbal statements alone, without physical actions or contextual indicators of imminent harm, do not provide sufficient probable cause to justify lethal force. Law enforcement cannot resort to deadly force based solely on verbal statements. A reasonable standard based on specific and articulable facts indicating an imminent threat is constitutionally required.'}]},
  {title:'Derek Drives a Plane Decree',cat:'court',catLabel:'DUI',sections:[{text:'No person is allowed to operate any motorized vehicle while intoxicated. "Driving" is synonymous with riding, taxiing, flying, etc.'}]},
  {title:'The Blunt Standard',cat:'conduct',catLabel:'Government Employment',sections:[{text:'No person shall hold a government position with a felony on their record. This protects the general public from the harm that felons are recognized as being capable of inflicting on others.'}]},
];

let lawFilter='all';
let selectedLaw=null;

function renderLaws(){
  const c=document.getElementById('laws-container');
  const count=document.getElementById('laws-count');
  const search=document.getElementById('laws-search');
  const detail=document.getElementById('law-detail');
  const q=search?search.value.toLowerCase().trim():'';
  const list=LAWS.filter(l=>{
    if(lawFilter!=='all'&&l.cat!==lawFilter)return false;
    const body=l.sections.map(s=>(s.label||'')+' '+s.text).join(' ');
    return !q||l.title.toLowerCase().includes(q)||l.catLabel.toLowerCase().includes(q)||body.toLowerCase().includes(q);
  });
  renderLawDetail(detail);
  if(count)count.textContent=`${list.length} of ${LAWS.length} standards`;
  c.innerHTML='';
  if(!list.length){
    c.innerHTML='<div class="law-empty">No case laws match your search.</div>';
    return;
  }
  list.forEach((l,i)=>{
    const d=document.createElement('div');
    d.className='law-card'+(selectedLaw===l?' active':'');
    const sectionCount=l.sections.length===1?'1 note':`${l.sections.length} notes`;
    const preview=l.sections[0].text;
    d.innerHTML=`
      <div class="law-head">
        <span class="law-index">${String(i+1).padStart(2,'0')}</span>
        <span class="law-cat ${l.cat}">${l.catLabel}</span>
      </div>
      <button class="law-main" type="button" onclick="selectLaw(${LAWS.indexOf(l)})">
        <span class="law-title">${l.title}</span>
        <span class="law-preview">${preview}</span>
        <span class="law-meta"><span>${sectionCount}</span><span>Open</span><i class="fa-solid fa-arrow-up-right-from-square"></i></span>
      </button>`;
    c.appendChild(d);
  });
}
function renderLawDetail(detail){
  if(!detail)return;
  if(!selectedLaw){
    detail.classList.remove('show');
    detail.innerHTML='';
    return;
  }
  const body=selectedLaw.sections.map(s=>s.label?`<div class="law-sub"><strong>${s.label}</strong><span>${s.text}</span></div>`:`<p>${s.text}</p>`).join('');
  detail.classList.add('show');
  detail.innerHTML=`
    <div class="law-detail-card">
      <div class="law-detail-head">
        <div>
          <span class="law-cat ${selectedLaw.cat}">${selectedLaw.catLabel}</span>
          <h2>${selectedLaw.title}</h2>
        </div>
        <button class="law-close" type="button" onclick="clearLawDetail()" aria-label="Close case law details"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="law-text">${body}</div>
    </div>`;
}
function selectLaw(index){
  selectedLaw=LAWS[index]||null;
  renderLaws();
}
function clearLawDetail(){
  selectedLaw=null;
  renderLaws();
}
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&selectedLaw)clearLawDetail();
});
function setLawFilter(el,f){
  lawFilter=f;
  document.querySelectorAll('.law-filter-btn').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  renderLaws();
}

// ── TEMPLATES ────────────────────────────────────────────────────
const TEMPLATE_FILES = [
  '01-Standard-Report.md',
  '02-Search-Warrant.md',
  '03-Subpoena.md',
  '04-Bail-Conditions.md',
  '05-Criminal-Docket.md',
  '06-DOA.md',
];

const TMPL_ICONS = [
  'fa-file-pen',
  'fa-magnifying-glass',
  'fa-database',
  'fa-handcuffs',
  'fa-gavel',
  'fa-skull',
];

let TMPLS = [];

function parseMd(text) {
  const lines = text.split('\n');
  let title = 'Untitled', bodyStart = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('# ')) { title = lines[i].slice(2).trim(); bodyStart = i + 1; break; }
  }
  while (bodyStart < lines.length && lines[bodyStart].trim() === '') bodyStart++;
  const body = lines.slice(bodyStart).join('\n').trimEnd();
  return { title, body };
}

function renderTmplBody(body) {
  const lines = body.split('\n');
  let html = '<div class="tmpl-fields">';
  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    const trimmed = raw.trim();
    if (!trimmed) { i++; continue; }
    // Bullet item (• prefix)
    if (trimmed.startsWith('•')) {
      const text = trimmed.slice(1).trim();
      const label = text.endsWith(':') ? text.slice(0, -1) : text;
      html += `<div class="tmpl-bullet-field"><span class="tmpl-bullet-dot"></span><span class="tmpl-field-label">${escapeHtml(label)}</span></div>`;
      i++; continue;
    }
    // Indented condition line (2+ spaces + colon inside) e.g. "  Residence: You shall not..."
    if (raw.startsWith('  ') && trimmed.includes(':')) {
      const ci = trimmed.indexOf(':');
      const lbl = trimmed.slice(0, ci);
      const desc = trimmed.slice(ci + 1).trim();
      html += `<div class="tmpl-condition-field"><div class="tmpl-cond-head"><span class="tmpl-cond-dot"></span><span class="tmpl-cond-label">${escapeHtml(lbl)}</span></div>${desc ? `<p class="tmpl-cond-desc">${escapeHtml(desc)}</p>` : ''}</div>`;
      i++; continue;
    }
    // Indented sub-item (no colon)
    if (raw.startsWith('  ')) {
      html += `<span class="tmpl-sub-item">${escapeHtml(trimmed)}</span>`;
      i++; continue;
    }
    // Field label (ends with :) — collect any immediate hint lines following it
    if (trimmed.endsWith(':')) {
      const label = trimmed.slice(0, -1);
      i++;
      const hints = [];
      while (i < lines.length) {
        const nr = lines[i], nt = nr.trim();
        if (!nt || nt.endsWith(':') || nt.startsWith('•') || nr.startsWith('  ')) break;
        hints.push(nt); i++;
      }
      html += `<div class="tmpl-field"><span class="tmpl-field-label">${escapeHtml(label)}</span>${hints.length ? `<span class="tmpl-field-hint">${escapeHtml(hints.join('\n'))}</span>` : ''}</div>`;
      continue;
    }
    html += `<p class="tmpl-plain">${escapeHtml(trimmed)}</p>`;
    i++;
  }
  html += '</div>';
  return html;
}

async function loadTemplates() {
  const results = await Promise.all(
    TEMPLATE_FILES.map(async (filename) => {
      const res = await fetch(`./Report_Templates/${filename}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status} loading ${filename}`);
      return parseMd(await res.text());
    })
  );
  TMPLS = results;
}

async function renderTemplates() {
  const c = document.getElementById('tmpl-container');
  const countEl = document.getElementById('tmpl-count');
  if (!c) return;
  c.innerHTML = '<div class="tmpl-status">Loading templates…</div>';
  try {
    await loadTemplates();
  } catch (err) {
    c.innerHTML = '<div class="tmpl-status">Unable to load templates from Report_Templates/.</div>';
    console.error('Failed to load templates:', err);
    return;
  }
  c.innerHTML = '';
  if (!TMPLS.length) { c.innerHTML = '<div class="tmpl-status">No templates found.</div>'; return; }
  if (countEl) countEl.textContent = `${TMPLS.length} templates`;
  TMPLS.forEach((t, i) => {
    const icon = TMPL_ICONS[i] || 'fa-file-lines';
    const num = String(i + 1).padStart(2, '0');
    const d = document.createElement('div');
    d.className = 'tmpl-card';
    d.innerHTML = `
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

function copyTmpl(btn, i) {
  if (!TMPLS[i]) return;
  navigator.clipboard.writeText(TMPLS[i].body).then(() => {
    const span = btn.querySelector('span');
    const icon = btn.querySelector('i');
    if (span) span.textContent = 'Copied!';
    if (icon) { icon.classList.remove('fa-copy'); icon.classList.add('fa-check'); }
    btn.classList.add('ok');
    setTimeout(() => {
      if (span) span.textContent = 'Copy';
      if (icon) { icon.classList.remove('fa-check'); icon.classList.add('fa-copy'); }
      btn.classList.remove('ok');
    }, 2000);
  });
}

// ── CHANGELOG ────────────────────────────────────────────────────
async function renderChangelog(){
  const meta=document.getElementById('changelog-meta');
  const tbody=document.getElementById('changelog-tbody');
  if(!meta||!tbody)return;

  try{
    const res=await fetch('./changelog.json',{cache:'no-store'});
    if(!res.ok)throw new Error('HTTP '+res.status);
    const data=await res.json();

    meta.textContent=data.contact||'';
    tbody.innerHTML='';

    if(!Array.isArray(data.entries)||!data.entries.length){
      tbody.innerHTML='<tr><td colspan="3">No changelog entries.</td></tr>';
      return;
    }

    data.entries.forEach(entry=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${escapeHtml(entry.date)}</td><td>${escapeHtml(entry.author)}</td><td>${escapeHtml(entry.change)}</td>`;
      tbody.appendChild(tr);
    });
  }catch(err){
    meta.textContent='Changelog could not be loaded.';
    tbody.innerHTML='<tr><td colspan="3">Unable to load changelog.json.</td></tr>';
    console.error('Failed to load changelog:',err);
  }
}

// ══════════════════════════════════════════════════════
// STREET GUESSER ENGINE
// ══════════════════════════════════════════════════════

class Vec{
  constructor(x=0,y=0){this.x=x;this.y=y}
  add(o){this.x+=o.x;this.y+=o.y;return this}
  sub(o){this.x-=o.x;this.y-=o.y;return this}
  mult(s){this.x*=s;this.y*=s;return this}
  mag(){return Math.sqrt(this.x*this.x+this.y*this.y)}
  dist(o){return Math.sqrt((o.x-this.x)**2+(o.y-this.y)**2)}
  norm(){const m=this.mag();return new Vec(this.x/m,this.y/m)}
  dot(o){return this.x*o.x+this.y*o.y}
  static add(a,b){return new Vec(a.x+b.x,a.y+b.y)}
  static sub(a,b){return new Vec(a.x-b.x,a.y-b.y)}
  static mult(a,s){return new Vec(a.x*s,a.y*s)}
}

class SGStreet{
  constructor(engine,street){
    this.engine=engine;this.street=street;
    this.hovered=false;this.selectable=true;this.guessedCorrectly=false;
    this.segs='Points' in street?[street.Points]:street.Segments;
    this._calcBounds();
  }
  _calcBounds(){
    let x0=9999,x1=-9999,y0=9999,y1=-9999;
    for(const seg of this.segs)for(const p of seg){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])}
    this.bounds={min:new Vec(x0,y0),max:new Vec(x1,y1),center:new Vec((x0+x1)/2,(y0+y1)/2)};
  }
  inBounds(pt){
    return pt.x>this.bounds.min.x*0.9&&pt.x<this.bounds.max.x*1.1&&pt.y>this.bounds.min.y*0.9&&pt.y<this.bounds.max.y*1.1;
  }
  inCursor(cursor){
    const cv=this.engine.c2w(cursor);
    let best=null;
    for(const seg of this.segs){
      for(let i=1;i<seg.length;i++){
        const a=new Vec(seg[i-1][0],seg[i-1][1]),b=new Vec(seg[i][0],seg[i][1]);
        const dir=Vec.sub(b,a),len=dir.mag(),nd=dir.norm();
        const pl=Math.max(0,Math.min(Vec.sub(cv,a).dot(nd),len));
        const cp=Vec.add(a,Vec.mult(nd,pl));
        const d=cp.dist(cv);
        if(d<6&&(best===null||d<best))best=d;
      }
    }
    return best;
  }
  draw(ctx,zoom){
    if(!this.hovered&&this.selectable)return;
    let color,alpha;
    if(this.selectable){color=this.hovered?'#f97316':'#6b7280';alpha=this.hovered?0.9:0.3;}
    else{color=this.guessedCorrectly?'#22c55e':'#ef4444';alpha=0.7;}
    ctx.globalAlpha=alpha;ctx.strokeStyle=color;
    ctx.lineWidth=Math.max(2,3*zoom);ctx.lineCap='round';ctx.lineJoin='round';
    for(const seg of this.segs){
      ctx.beginPath();
      const s=this.engine.w2c(new Vec(seg[0][0],seg[0][1]));
      ctx.moveTo(s.x,s.y);
      for(let i=1;i<seg.length;i++){const p=this.engine.w2c(new Vec(seg[i][0],seg[i][1]));ctx.lineTo(p.x,p.y);}
      ctx.stroke();
    }
    ctx.globalAlpha=1;
  }
}

class SGEngine{
  constructor(){
    this.canvas=document.getElementById('sg-canvas');
    this.ctx=this.canvas.getContext('2d');
    this.mapImg=new Image();
    this.mapImg.src='./StreetGuesser/images/map.png';
    this.mapImg.onload=()=>{this.resetView(true);this._loop()};
    this.offset=new Vec(0,0);this.zoom=0.5;
    this.drag=new Vec(0,0);this.holding=false;this.moving=false;
    this.hovered=null;this.animating=false;
    this.tOffset=new Vec(0,0);this.tZoom=0.5;
    this.objs={};this.data=null;
    this.started=false;this.queue=[];this.qi=0;
    this.guesses=0;this.correct=0;this.t0=null;this.ticking=false;
    this._events();
    new ResizeObserver(()=>{
      if(!this.canvas.offsetParent)return;
      this.canvas.width=this.canvas.offsetWidth;
      this.canvas.height=this.canvas.offsetHeight;
    }).observe(this.canvas);
  }
  _events(){
    this.canvas.addEventListener('mousedown',e=>{this.drag=this._xy(e);this.holding=true;this.moving=false;});
    window.addEventListener('mousemove',e=>{
      if(!document.getElementById('page-guesser').classList.contains('active'))return;
      const pos=this._xy(e);this._hover(pos);
      if(!this.holding)return;
      const d=Vec.sub(this.drag,pos);
      if(d.mag()>3)this.moving=true;
      if(this.moving){this.offset.add(d.mult(1/this.zoom));this.drag.x=pos.x;this.drag.y=pos.y;this.animating=false;}
    });
    window.addEventListener('mouseup',()=>{this.holding=false;});
    this.canvas.addEventListener('mouseup',e=>{if(!this.moving&&e.button===0)this._select(this._xy(e));});
    this.canvas.addEventListener('wheel',e=>{
      e.preventDefault();this.animating=false;
      const xy=this._xy(e);
      if(e.deltaY>0){this.zoom/=1.25;}
      else{this.zoom*=1.25;this.offset.add(Vec.sub(xy,new Vec(this.canvas.width/2,this.canvas.height/2)).mult(1/(this.zoom*4)));}
    },{passive:false});
  }
  _xy(e){const r=this.canvas.getBoundingClientRect();return new Vec(e.clientX-r.left,e.clientY-r.top)}
  w2c(wv){return new Vec(this.canvas.width/2+(-this.offset.x+wv.x)*this.zoom,this.canvas.height/2+(-this.offset.y+wv.y)*this.zoom)}
  c2w(cv){return new Vec(this.offset.x+(cv.x-this.canvas.width/2)/this.zoom,this.offset.y+(cv.y-this.canvas.height/2)/this.zoom)}
  resetView(instant=false){
    if(!this.mapImg.width)return;
    const ox=this.mapImg.width/4,oy=this.mapImg.height/3.5,oz=0.5;
    if(instant){this.offset=new Vec(ox,oy);this.zoom=oz;}
    else{this.tOffset=new Vec(ox,oy);this.tZoom=oz;this.animating=true;}
  }
  focus(obj){
    const b=obj.bounds;
    this.tOffset=new Vec(b.center.x,b.center.y);
    this.tZoom=Math.min(Math.min(this.canvas.width,this.canvas.height)/1.2/b.min.dist(b.max),10);
    this.animating=true;
  }
  _animStep(){
    if(!this.animating)return;
    const k=0.12;
    this.offset.x+=(this.tOffset.x-this.offset.x)*k;
    this.offset.y+=(this.tOffset.y-this.offset.y)*k;
    this.zoom+=(this.tZoom-this.zoom)*k;
    if(Math.abs(this.tOffset.x-this.offset.x)<1&&Math.abs(this.tOffset.y-this.offset.y)<1&&Math.abs(this.tZoom-this.zoom)<.05)this.animating=false;
  }
  _hover(pos){
    let best=null,bd=Infinity;
    for(const o of Object.values(this.objs)){
      if(!o.inBounds(this.c2w(pos)))continue;
      const d=o.inCursor(pos);if(d!==null&&d<bd){best=o;bd=d;}
    }
    if(best!==this.hovered){if(this.hovered)this.hovered.hovered=false;this.hovered=best;if(best)best.hovered=true;}
  }
  _select(pos){
    let best=null,bd=Infinity;
    for(const o of Object.values(this.objs)){
      if(!o.selectable||!o.inBounds(this.c2w(pos)))continue;
      const d=o.inCursor(pos);if(d!==null&&d<bd){best=o;bd=d;}
    }
    if(best)this._onSelect(best);
  }
  _loop(){
    const ctx=this.ctx;
    ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    ctx.globalAlpha=1;
    if(this.mapImg.width){
      ctx.drawImage(this.mapImg,this.canvas.width/2-this.offset.x*this.zoom,this.canvas.height/2-this.offset.y*this.zoom,this.mapImg.width*this.zoom/2,this.mapImg.height*this.zoom/2);
    }
    for(const o of Object.values(this.objs))o.draw(ctx,this.zoom);
    this._animStep();
    requestAnimationFrame(()=>this._loop());
  }
  load(dataKey,label){
    this.data=MAP[dataKey];
    this._resetState();
    this._buildObjs();
    this.resetView(false);
    document.getElementById('sg-name').textContent=label;
    document.getElementById('sg-score').textContent='0/'+Object.keys(this.data).length;
    document.getElementById('sg-correct').textContent='0 Correct';
    document.getElementById('sg-incorrect').textContent='0 Incorrect';
    document.getElementById('sg-timer').textContent='0:00';
  }
  _buildObjs(){
    this.objs={};
    for(const[k,s]of Object.entries(this.data))this.objs[k]=new SGStreet(this,s);
  }
  _resetState(){
    this.started=false;this.queue=[];this.qi=0;this.guesses=0;this.correct=0;this.t0=null;this.ticking=false;
    document.getElementById('sg-overlay').classList.remove('show');
    document.getElementById('sg-giveup').style.display='none';
    document.getElementById('sg-start-btn').style.display='inline-block';
    const sd=document.getElementById('sg-street');sd.textContent='Click Start to Begin';sd.className='sg-street-display unstarted';
  }
  _updateUI(){
    const total=this.data?Object.keys(this.data).length:0;
    document.getElementById('sg-score').textContent=this.guesses+'/'+total;
    document.getElementById('sg-correct').textContent=this.correct+' Correct';
    document.getElementById('sg-incorrect').textContent=(this.guesses-this.correct)+' Incorrect';
  }
  _showStreet(){
    if(!this.queue.length)return;
    const sd=document.getElementById('sg-street');
    sd.textContent=this.queue[this.qi];sd.className='sg-street-display';
  }
  start(){
    if(this.started||!this.data)return;
    this.started=true;
    this.queue=Object.keys(this.data).sort(()=>Math.random()-.5);
    this.qi=0;this.guesses=0;this.correct=0;this.t0=new Date();this.ticking=true;
    document.getElementById('sg-giveup').style.display='inline-block';
    document.getElementById('sg-start-btn').style.display='none';
    this._updateUI();this._showStreet();this._tick();
  }
  end(){
    if(!this.started)return;
    this.started=false;this.ticking=false;this._showResult();
  }
  retry(){
    document.getElementById('sg-overlay').classList.remove('show');
    this._buildObjs();this._resetState();this.start();
  }
  prev(){
    if(!this.started)return;
    this.qi=(this.qi-1+this.queue.length)%this.queue.length;this._showStreet();
  }
  next(){
    if(!this.started)return;
    this.qi=(this.qi+1)%this.queue.length;this._showStreet();
  }
  _onSelect(obj){
    if(!this.started)return;
    const cur=this.queue[this.qi];
    const ok=obj.street.Name===cur;
    if(ok){obj.selectable=false;obj.guessedCorrectly=true;this.correct++;}
    else{const co=this.objs[cur];if(co){co.selectable=false;co.guessedCorrectly=false;this.focus(co);}}
    this.queue.splice(this.qi,1);
    if(this.qi>=this.queue.length)this.qi=0;
    this.guesses++;this._updateUI();
    if(!this.queue.length)this.end();else this._showStreet();
  }
  _tick(){
    if(!this.ticking)return;
    const d=new Date()-this.t0;
    const m=Math.floor(d/60000),s=Math.floor((d%60000)/1000).toString().padStart(2,'0');
    document.getElementById('sg-timer').textContent=m+':'+s;
    setTimeout(()=>this._tick(),1000);
  }
  _showResult(){
    this.resetView(false);
    const total=Object.keys(this.data).length,d=new Date()-this.t0;
    const m=Math.floor(d/60000),s=Math.floor((d%60000)/1000).toString().padStart(2,'0');
    document.getElementById('sg-result-pct').textContent=Math.round(this.correct/total*100)+'%';
    document.getElementById('sg-result-score').textContent=this.correct+'/'+total;
    document.getElementById('sg-result-time').textContent=m+':'+s;
    document.getElementById('sg-overlay').classList.add('show');
  }
}

const GAME_LABELS={Streets:'All Streets',Vinewood:'Vinewood Streets',MirrorPark:'Mirror Park Streets',Sandy:'Sandy Shores Streets',Grapeseed:'Grapeseed Streets',Paleto:'Paleto Streets',InnerCityRoads:'Inner City Streets'};
let sgEngine=null,sgCurrentKey='Streets';

function switchGame(key,el){
  sgCurrentKey=key;
  document.querySelectorAll('.sg-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  if(sgEngine)sgEngine.load(key,GAME_LABELS[key]);
}

// Init on page load
window.addEventListener('load',()=>{
  renderCodes();renderLaws();renderTemplates();renderChangelog();
  sgEngine=new SGEngine();
  sgEngine.load('Streets','All Streets');
});
