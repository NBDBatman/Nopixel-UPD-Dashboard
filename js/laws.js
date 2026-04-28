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
  if(!list.length){c.innerHTML='<div class="law-empty">No case laws match your search.</div>';return;}
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
  if(!selectedLaw){detail.classList.remove('show');detail.innerHTML='';return;}
  const body=selectedLaw.sections.map(s=>s.label?`<div class="law-sub"><strong>${s.label}</strong><span>${s.text}</span></div>`:`<p>${s.text}</p>`).join('');
  detail.classList.add('show');
  detail.innerHTML=`
    <div class="law-detail-card">
      <div class="law-detail-head">
        <div>
          <span class="law-cat ${selectedLaw.cat}">${selectedLaw.catLabel}</span>
          <h2>${selectedLaw.title}</h2>
        </div>
        <button class="law-close" type="button" onclick="clearLawDetail()" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="law-text">${body}</div>
    </div>`;
}

function selectLaw(index){selectedLaw=LAWS[index]||null;renderLaws();}
function clearLawDetail(){selectedLaw=null;renderLaws();}

document.addEventListener('keydown',e=>{if(e.key==='Escape'&&selectedLaw)clearLawDetail();});

function setLawFilter(el,f){
  lawFilter=f;
  document.querySelectorAll('.law-filter-btn').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  renderLaws();
}

window.__pageInits=window.__pageInits||{};
window.__pageInits.laws=renderLaws;
window.addEventListener('load',renderLaws);
