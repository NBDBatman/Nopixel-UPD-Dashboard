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

let codeFilter='all';

function _renderCodeGrid(items,q){
  const wrap=document.createElement('div');
  wrap.className='codes-section-grid';
  items.forEach(c=>{
    const d=document.createElement('div');
    d.className='code-card '+c.prio;
    d.innerHTML=`<div class="code-num">${hl(c.code,q)}</div><div class="code-desc">${hl(c.desc,q)}</div>`;
    wrap.appendChild(d);
  });
  return wrap;
}

function renderCodes(){
  const q=document.getElementById('codes-search').value.toLowerCase().trim();
  const list=CODES.filter(c=>{
    if(codeFilter!=='all'&&c.prio!==codeFilter)return false;
    return!q||c.code.toLowerCase().includes(q)||c.desc.toLowerCase().includes(q);
  });
  document.getElementById('codes-count').textContent=list.length+' codes';
  const g=document.getElementById('codes-grid');
  g.innerHTML='';
  if(!list.length){g.innerHTML='<div class="code-empty">No codes match your search.</div>';return;}
  if(codeFilter==='all'&&!q){
    [{key:'emergency',label:'Emergency',icon:'fa-circle-exclamation'},
     {key:'urgent',label:'Urgent',icon:'fa-triangle-exclamation'},
     {key:'normal',label:'Standard Codes',icon:'fa-radio'},
    ].forEach(({key,label,icon})=>{
      const items=list.filter(c=>c.prio===key);
      if(!items.length)return;
      const h=document.createElement('div');
      h.className='codes-section-head '+key;
      h.innerHTML=`<i class="fa-solid ${icon}"></i><span>${label}</span><em>${items.length}</em>`;
      g.appendChild(h);
      g.appendChild(_renderCodeGrid(items,q));
    });
  }else{
    g.appendChild(_renderCodeGrid(list,q));
  }
}

function setFilter(el,f){
  codeFilter=f;
  document.querySelectorAll('.code-filt').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  renderCodes();
}

window.__pageInits=window.__pageInits||{};
window.__pageInits.codes=renderCodes;
window.addEventListener('load',renderCodes);
