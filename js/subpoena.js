let _spCases=[],_spActiveCaseId=null;
let _spPhoneRecords=[],_spBankRecords=[],_spContacts={};
let _spActiveConvo=null,_spConvos={},_spPhoneSearch='';
let _spBankFilters={type:'',dir:'',search:''},_spSelectedAccount=null,_spBankCols={};

const _SP_BANK_COL_DEFS=[
  {k:'date',     l:'Date',                def:true},
  {k:'txId',     l:'ID',                  def:false},
  {k:'type',     l:'Type',                def:true},
  {k:'dir',      l:'Direction',           def:true},
  {k:'fromName', l:'From',               def:true},
  {k:'fromId',   l:'From: Account ID',   def:false},
  {k:'fromType', l:'From: Account type', def:false},
  {k:'toName',   l:'To',                 def:true},
  {k:'toId',     l:'To: Account ID',     def:false},
  {k:'toType',   l:'To: Account type',   def:false},
  {k:'amount',   l:'Amount',             def:true},
  {k:'taxAmt',   l:'Tax Amount',         def:false},
  {k:'netAmt',   l:'Net Amount',         def:false},
  {k:'taxPct',   l:'Tax %',              def:false},
  {k:'taxType',  l:'Tax-Type',           def:false},
  {k:'comment',  l:'Comment',            def:true},
];
function _spLoadBankCols(){
  try{const s=JSON.parse(localStorage.getItem('upd-sp-bank-cols')||'{}');
    const d=Object.fromEntries(_SP_BANK_COL_DEFS.map(c=>[c.k,c.def]));
    _spBankCols={...d,...s};}
  catch(e){_spBankCols=Object.fromEntries(_SP_BANK_COL_DEFS.map(c=>[c.k,c.def]));}
}
function spToggleBankColPicker(btn){
  const existing=document.getElementById('sp-col-picker');
  if(existing){existing.remove();return;}
  const panel=document.createElement('div');
  panel.id='sp-col-picker';panel.className='sp-col-picker';
  panel.innerHTML=_SP_BANK_COL_DEFS.map(c=>`<label class="sp-col-item"><input type="checkbox"${_spBankCols[c.k]?' checked':''} onchange="spSetBankCol('${c.k}',this.checked)"><span>${c.l}</span></label>`).join('');
  btn.closest('.sp-col-btn-wrap').appendChild(panel);
  setTimeout(()=>document.addEventListener('click',function h(e){if(!panel.contains(e.target)&&e.target!==btn){panel.remove();document.removeEventListener('click',h);}},{capture:true}),0);
}
function spSetBankCol(k,v){
  _spBankCols[k]=v;
  localStorage.setItem('upd-sp-bank-cols',JSON.stringify(_spBankCols));
  _spRenderBank();
}
let _spSidebarView='convos';

// ── Contacts ──────────────────────────────────────────────────────────────────

function _spLoadContacts(){
  try{_spContacts=JSON.parse(localStorage.getItem('upd-sp-contacts'))||{};}catch(e){_spContacts={};}
}
function _spSaveContacts(){localStorage.setItem('upd-sp-contacts',JSON.stringify(_spContacts));}
function _spGetName(num){return _spContacts[String(num)]||String(num);}

function _spActiveCase(){return _spCases.find(c=>c.id===_spActiveCaseId)||null;}
function _spSyncActiveCase(){const c=_spActiveCase();if(c){c.phone=_spPhoneRecords;c.bank=_spBankRecords;}}
function _spSaveCases(){
  _spSyncActiveCase();
  try{localStorage.setItem('upd-sp-cases',JSON.stringify(_spCases));}catch(e){}
}
function _spLoadCases(){
  try{_spCases=JSON.parse(localStorage.getItem('upd-sp-cases'))||[];}catch(e){_spCases=[];}
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function _spNorm(k){return String(k||'').toLowerCase().replace(/[^a-z0-9]/g,'');}
function _spParseTs(ts){if(!ts)return 0;const d=new Date(ts);return isNaN(d)?0:d.getTime();}
function _spReadFiles(files,parser){
  [...files].forEach(f=>{
    const r=new FileReader();
    r.onload=ev=>{
      try{parser(XLSX.read(new Uint8Array(ev.target.result),{type:'array',cellDates:true}));}
      catch(err){console.error('Parse error:',err);}
    };
    r.readAsArrayBuffer(f);
  });
}

// ── Phone upload ──────────────────────────────────────────────────────────────

function spUploadPhone(){
  const inp=document.createElement('input');inp.type='file';inp.accept='.xlsx,.xls,.csv';inp.multiple=true;
  inp.onchange=e=>_spReadFiles(e.target.files,_spParsePhone);
  inp.click();
}

function _spParsePhone(wb){
  const records=[];
  for(const sn of wb.SheetNames){
    const rows=XLSX.utils.sheet_to_json(wb.Sheets[sn],{defval:'',raw:false});
    for(const row of rows){
      const get=k=>{const key=Object.keys(row).find(rk=>_spNorm(rk)===k);if(!key)return'';const v=String(row[key]).trim();return(v==='null'||v==='undefined')?'':v;}
      if(get('numberfrom')||get('numberto')){
        records.push({type:'sms',from:get('numberfrom'),to:get('numberto'),message:get('message'),timestamp:_spParseTs(get('timestamp')||get('time')||get('date')||get('sentat')||get('createdat'))});
      }else if(get('callfrom')||get('callto')){
        records.push({type:'call',from:get('callfrom'),to:get('callto'),duration:get('duration')||get('callduration'),timestamp:_spParseTs(get('timestamp')||get('time')||get('date'))});
      }
    }
  }
  if(!records.length)return;
  _spPhoneRecords=[..._spPhoneRecords,...records].sort((a,b)=>a.timestamp-b.timestamp);
  const _ppc=_spActiveCase();if(_ppc)_ppc.phone=_spPhoneRecords;
  _spSaveCases();
  _spBuildConvos();_spRenderConvoList();_spRenderStats();_spShowSplit();
  _spRenderCasesList();
}

// ── Phonebook import / export ─────────────────────────────────────────────────

function spImportPhonebook(){
  const inp=document.createElement('input');inp.type='file';inp.accept='.csv,.txt';
  inp.onchange=e=>{
    const f=e.target.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=ev=>{
      const lines=ev.target.result.split('\n').filter(l=>l.trim());
      let count=0;
      for(const line of lines){
        const parts=line.split(',').map(p=>p.trim().replace(/^["']|["']$/g,''));
        if(parts.length<2)continue;
        const [a,b]=parts;
        const isNumA=/^[\d\+\-\s\(\)]+$/.test(a.replace(/\s/g,''));
        if(isNumA&&b){_spContacts[a]=b;count++;}
        else if(/^[\d\+\-\s\(\)]+$/.test(b.replace(/\s/g,''))&&a){_spContacts[b]=a;count++;}
      }
      _spSaveContacts();_spBuildConvos();_spRenderConvoList();_spRenderStats();
      if(_spActiveConvo)_spRenderMessages();
      alert(`Imported ${count} contact${count!==1?'s':''}.`);
    };
    r.readAsText(f);
  };
  inp.click();
}

function spExportContacts(){
  const entries=Object.entries(_spContacts);
  if(!entries.length){alert('No contacts saved yet.');return;}
  const csv='Number,Name\n'+entries.map(([n,name])=>`"${n}","${name}"`).join('\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
  const a=document.createElement('a');a.href=url;a.download='subpoena-contacts.csv';a.click();
  URL.revokeObjectURL(url);
}

function spShowBulkNaming(){
  document.getElementById('sp-bulk-overlay')?.remove();
  // Collect all unique numbers from current case
  const counts={};
  for(const r of _spPhoneRecords){
    const add=n=>{if(!n)return;if(!counts[n])counts[n]={sms:0,calls:0};if(r.type==='sms')counts[n].sms++;else counts[n].calls++;};
    add(r.from);add(r.to);
  }
  if(!Object.keys(counts).length){alert('No phone records loaded.');return;}
  const sorted=Object.keys(counts).sort((a,b)=>(counts[b].sms+counts[b].calls)-(counts[a].sms+counts[a].calls));
  const ov=document.createElement('div');ov.id='sp-bulk-overlay';ov.className='sp-bulk-overlay';
  ov.innerHTML=`<div class="sp-bulk-panel">
    <div class="sp-bulk-hd"><span><i class="fa-solid fa-users-gear"></i> Name All Contacts</span><button onclick="document.getElementById('sp-bulk-overlay').remove()"><i class="fa-solid fa-xmark"></i></button></div>
    <div class="sp-bulk-hint">${sorted.length} contacts — type names then click Save All</div>
    <div class="sp-bulk-list">${sorted.map(num=>{
      const c=counts[num];
      return`<div class="sp-bulk-row">
        <div class="sp-bulk-num">${escapeHtml(num)}</div>
        <div class="sp-bulk-meta">${c.sms?`<span>${c.sms} msg</span>`:''}${c.calls?`<span>${c.calls} call</span>`:''}</div>
        <input class="sp-bulk-inp" data-num="${escapeHtml(num)}" placeholder="Enter name…" value="${escapeHtml(_spContacts[num]||'')}">
      </div>`;
    }).join('')}</div>
    <div class="sp-bulk-footer">
      <button class="np-btn" onclick="spSaveBulkNames()"><i class="fa-solid fa-check"></i> Save All</button>
      <button class="np-btn" onclick="document.getElementById('sp-bulk-overlay').remove()">Cancel</button>
    </div>
  </div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove();});
  // Enter moves to next input
  ov.querySelectorAll('.sp-bulk-inp').forEach((inp,i,all)=>{
    inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();all[i+1]?all[i+1].focus():spSaveBulkNames();}});
  });
}

function spSaveBulkNames(){
  document.querySelectorAll('#sp-bulk-overlay .sp-bulk-inp').forEach(inp=>{
    const num=inp.dataset.num;const name=inp.value.trim();
    if(name)_spContacts[num]=name;else delete _spContacts[num];
  });
  _spSaveContacts();_spBuildConvos();_spRenderConvoList();_spRenderStats();
  if(_spActiveConvo)_spRenderMessages();
  document.getElementById('sp-bulk-overlay')?.remove();
}

function spShowSharedContacts(){
  document.getElementById('sp-shared-overlay')?.remove();
  // Scan all non-deleted cases for phone numbers and bank account IDs
  const numMap={};  // num -> Set of case names
  const acctMap={}; // acctId -> Set of case names
  for(const c of _spCases){
    if(c.deleted)continue;
    const cname=c.name||'Unnamed';
    const phone=c.id===_spActiveCaseId?_spPhoneRecords:(c.phone||[]);
    const bank=c.id===_spActiveCaseId?_spBankRecords:(c.bank||[]);
    const nums=new Set();
    for(const r of phone){if(r.from)nums.add(r.from);if(r.to)nums.add(r.to);}
    for(const n of nums){if(!numMap[n])numMap[n]=new Set();numMap[n].add(cname);}
    const accts=new Set();
    for(const r of bank){if(r.fromId)accts.add(r.fromId);if(r.toId)accts.add(r.toId);}
    for(const a of accts){if(!acctMap[a])acctMap[a]=new Set();acctMap[a].add(cname);}
  }
  const sharedNums=Object.entries(numMap).filter(([,s])=>s.size>1).sort((a,b)=>b[1].size-a[1].size);
  const sharedAccts=Object.entries(acctMap).filter(([,s])=>s.size>1).sort((a,b)=>b[1].size-a[1].size);
  if(!sharedNums.length&&!sharedAccts.length){
    const msg=document.createElement('div');msg.className='sp-toast';msg.textContent='No shared contacts or accounts found across cases.';
    document.body.appendChild(msg);setTimeout(()=>msg.remove(),3000);return;
  }
  const pills=cases=>[...cases].map(n=>`<span class="sp-shared-pill">${escapeHtml(n)}</span>`).join('');
  const ov=document.createElement('div');ov.id='sp-shared-overlay';ov.className='sp-bulk-overlay';
  ov.innerHTML=`<div class="sp-bulk-panel">
    <div class="sp-bulk-hd"><span><i class="fa-solid fa-link"></i> Shared Across Cases</span><button onclick="document.getElementById('sp-shared-overlay').remove()"><i class="fa-solid fa-xmark"></i></button></div>
    <div class="sp-bulk-list">
      ${sharedNums.length?`<div class="sp-shared-section-hd">Phone Numbers (${sharedNums.length})</div>
        ${sharedNums.map(([num,cases])=>`<div class="sp-shared-row">
          <div class="sp-shared-id">${escapeHtml(_spContacts[num]||num)}${_spContacts[num]?`<span class="sp-shared-raw"> ${escapeHtml(num)}</span>`:''}</div>
          <div class="sp-shared-cases">${pills(cases)}</div>
        </div>`).join('')}`:''}
      ${sharedAccts.length?`<div class="sp-shared-section-hd">Bank Accounts (${sharedAccts.length})</div>
        ${sharedAccts.map(([id,cases])=>{
          const a=_spBankAccounts.get(id);
          const label=a?_spAccountLabel(a):id;
          return`<div class="sp-shared-row">
            <div class="sp-shared-id">${escapeHtml(label)}</div>
            <div class="sp-shared-cases">${pills(cases)}</div>
          </div>`;
        }).join('')}`:''}
    </div>
  </div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove();});
}

// ── Conversations ─────────────────────────────────────────────────────────────

function _spBuildConvos(){
  _spConvos={};
  for(const r of _spPhoneRecords){
    const key=[r.from,r.to].sort().join('|');
    if(!_spConvos[key])_spConvos[key]={key,participants:[r.from,r.to].sort(),records:[],lastTs:0,smsCount:0,callCount:0};
    _spConvos[key].records.push(r);
    if(r.timestamp>_spConvos[key].lastTs)_spConvos[key].lastTs=r.timestamp;
    if(r.type==='sms')_spConvos[key].smsCount++;else _spConvos[key].callCount++;
  }
}

function _spConvoLabel(key){
  return(_spConvos[key]?.participants||key.split('|')).map(p=>_spGetName(p)).join(' · ');
}

function _spConvoDisplayName(c){
  const named=c.participants.filter(p=>_spContacts[p]);
  if(named.length)return named.map(p=>_spContacts[p]).join(' & ');
  return'Unknown Contact';
}

function _spRenderConvoList(){
  const el=document.getElementById('sp-convo-list');if(!el)return;
  const q=_spPhoneSearch.toLowerCase();
  const sorted=Object.keys(_spConvos).sort((a,b)=>_spConvos[b].lastTs-_spConvos[a].lastTs)
    .filter(k=>{
      if(!q)return true;
      const c=_spConvos[k];
      if(_spConvoDisplayName(c).toLowerCase().includes(q))return true;
      if(c.participants.some(p=>p.includes(q)))return true;
      return c.records.some(r=>r.message?.toLowerCase().includes(q));
    });
  if(!sorted.length){el.innerHTML='<div class="sp-empty">No conversations match.</div>';return;}
  el.innerHTML=sorted.map(k=>{
    const c=_spConvos[k];
    const displayName=_spConvoDisplayName(c);
    const nums=c.participants.join(' · ');
    const last=c.records[c.records.length-1];
    const preview=last?.type==='call'?'📞 Call':escapeHtml((last?.message||'').slice(0,44));
    const ts=c.lastTs?new Date(c.lastTs).toLocaleString('en-AU',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',hour12:false}):'';
    return`<div class="sp-convo-item${k===_spActiveConvo?' active':''}" onclick="spSelectConvo(this,'${k.replace(/\\/g,'\\\\').replace(/'/g,"\\'")}')">
      <div class="sp-convo-top">
        <span class="sp-convo-name">${escapeHtml(displayName)}</span>
        ${c.callCount?`<span class="sp-convo-badge">${c.callCount}📞</span>`:''}
        <span class="sp-convo-ts">${escapeHtml(ts)}</span>
      </div>
      <div class="sp-convo-nums">${escapeHtml(nums)}</div>
      <div class="sp-convo-preview">${preview}</div>
    </div>`;
  }).join('');
}

function spSelectConvo(el,key){
  _spActiveConvo=key;
  document.querySelectorAll('.sp-convo-item').forEach(i=>i.classList.remove('active'));
  el.classList.add('active');
  _spRenderMessages();
}

// ── Messages ──────────────────────────────────────────────────────────────────

function _spRenderMessages(){
  const msgEl=document.getElementById('sp-messages');
  const hdEl=document.getElementById('sp-thread-header');
  if(!msgEl)return;
  const c=_spConvos[_spActiveConvo];
  if(!c){
    msgEl.innerHTML='<div class="sp-empty sp-empty-thread"><i class="fa-solid fa-comments"></i><span>Select a conversation</span></div>';
    if(hdEl)hdEl.innerHTML='';return;
  }
  if(hdEl){
    hdEl.innerHTML=c.participants.map(p=>`<div class="sp-contact-chip">
      <span class="sp-chip-num">${escapeHtml(p)}</span>
      <input class="sp-chip-input" value="${escapeHtml(_spContacts[p]||'')}" placeholder="Add name…"
        onchange="spNameContact('${p.replace(/'/g,"\\'")}',this.value)">
    </div>`).join('');
  }
  const q=_spPhoneSearch.toLowerCase();
  const [left]=c.participants;
  const esc=s=>escapeHtml(s);
  const hl=s=>{
    const e=escapeHtml(s);
    return q&&s.toLowerCase().includes(q)?e.replace(new RegExp('('+escapeHtml(q).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi'),'<mark>$1</mark>'):e;
  };
  msgEl.innerHTML=c.records.map(r=>{
    const ts=r.timestamp?new Date(r.timestamp).toLocaleString('en-AU',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',hour12:false}):'';
    if(r.type==='call'){
      return`<div class="sp-call-row"><i class="fa-solid fa-phone"></i><span><strong>${esc(_spGetName(r.from))}</strong> → <strong>${esc(_spGetName(r.to))}</strong>${r.duration?' · '+esc(r.duration):''}</span><span class="sp-ts">${esc(ts)}</span></div>`;
    }
    const out=r.from===left;
    return`<div class="sp-msg-row${out?' sp-out':' sp-in'}">
      <div class="sp-bubble"><div class="sp-bubble-sender">${esc(_spGetName(r.from))}</div><div class="sp-bubble-text">${hl(r.message||'')}</div><div class="sp-ts">${esc(ts)}</div></div>
    </div>`;
  }).join('');
  msgEl.scrollTop=msgEl.scrollHeight;
}

function spNameContact(num,name){
  _spContacts[num]=name.trim();_spSaveContacts();_spBuildConvos();_spRenderConvoList();_spRenderStats();_spRenderMessages();
}

// ── Activity stats ────────────────────────────────────────────────────────────

function spSidebarTab(view,el){
  _spSidebarView=view;
  document.querySelectorAll('.sp-sb-tab').forEach(b=>b.classList.remove('active'));
  if(el)el.classList.add('active');
  const cl=document.getElementById('sp-convo-list');
  const st=document.getElementById('sp-stats-panel');
  if(cl)cl.style.display=view==='convos'?'block':'none';
  if(st)st.style.display=view==='stats'?'block':'none';
}

function _spRenderStats(){
  const el=document.getElementById('sp-stats-panel');if(!el)return;
  if(!_spPhoneRecords.length){el.innerHTML='<div class="sp-empty">No data yet.</div>';return;}

  // Top conversations
  const convCounts=Object.entries(_spConvos)
    .map(([k,c])=>({label:_spConvoLabel(k),count:c.smsCount+c.callCount}))
    .sort((a,b)=>b.count-a.count).slice(0,8);
  const maxConv=convCounts[0]?.count||1;

  // Activity by hour
  const byHour=Array(24).fill(0);
  for(const r of _spPhoneRecords){if(r.timestamp)byHour[new Date(r.timestamp).getHours()]++;}
  const maxHour=Math.max(...byHour)||1;

  // Messages by day (last 14 days with data)
  const byDay={};
  for(const r of _spPhoneRecords){
    if(!r.timestamp)continue;
    const d=new Date(r.timestamp).toLocaleDateString('en-AU',{day:'2-digit',month:'short'});
    byDay[d]=(byDay[d]||0)+1;
  }
  const dayEntries=Object.entries(byDay).slice(-14);
  const maxDay=Math.max(...dayEntries.map(d=>d[1]))||1;

  el.innerHTML=`
    <div class="sp-stats-inner">
      <div class="sp-stat-section">
        <div class="sp-stat-title">Top Conversations</div>
        ${convCounts.map(({label,count})=>`
          <div class="sp-stat-row">
            <span class="sp-stat-lbl2" title="${escapeHtml(label)}">${escapeHtml(label)}</span>
            <div class="sp-bar-track"><div class="sp-bar-fill" style="width:${(count/maxConv*100).toFixed(1)}%"></div></div>
            <span class="sp-bar-count">${count}</span>
          </div>`).join('')}
      </div>
      <div class="sp-stat-section">
        <div class="sp-stat-title">Activity by Hour</div>
        <div class="sp-hour-chart">
          ${byHour.map((n,h)=>`<div class="sp-hour-col" title="${h}:00 — ${n} messages">
            <div class="sp-hour-bar" style="height:${(n/maxHour*100).toFixed(1)}%"></div>
            <div class="sp-hour-lbl">${h%6===0?h:''}</div>
          </div>`).join('')}
        </div>
      </div>
      ${dayEntries.length?`<div class="sp-stat-section">
        <div class="sp-stat-title">Messages by Day</div>
        ${dayEntries.map(([d,n])=>`
          <div class="sp-stat-row">
            <span class="sp-stat-lbl2">${escapeHtml(d)}</span>
            <div class="sp-bar-track"><div class="sp-bar-fill" style="width:${(n/maxDay*100).toFixed(1)}%"></div></div>
            <span class="sp-bar-count">${n}</span>
          </div>`).join('')}
      </div>`:''}
      <div class="sp-stat-summary">
        <span>${_spPhoneRecords.filter(r=>r.type==='sms').length} messages</span>
        <span>${_spPhoneRecords.filter(r=>r.type==='call').length} calls</span>
        <span>${Object.keys(_spConvos).length} conversations</span>
      </div>
    </div>`;
}

// ── Phone helpers ─────────────────────────────────────────────────────────────

function spPhoneSearch(){
  _spPhoneSearch=document.getElementById('sp-phone-search')?.value||'';
  _spRenderConvoList();if(_spActiveConvo)_spRenderMessages();
}

function spClearPhone(){
  _spPhoneRecords=[];_spConvos={};_spActiveConvo=null;_spPhoneSearch='';
  const c=_spActiveCase();if(c)c.phone=[];
  _spSaveCases();
  const si=document.getElementById('sp-phone-search');if(si)si.value='';
  _spRenderConvoList();_spRenderStats();_spShowSplit();
  _spRenderCasesList();
}

function _spShowSplit(){
  const empty=document.getElementById('sp-phone-empty');
  const split=document.getElementById('sp-phone-split');
  const has=!!_spPhoneRecords.length;
  if(empty)empty.style.display=has?'none':'flex';
  if(split)split.style.display=has?'flex':'none';
  const exportBtn=document.getElementById('sp-phone-export-btn');
  if(exportBtn)exportBtn.style.display=has?'':'none';
  if(!has&&document.getElementById('sp-messages'))
    document.getElementById('sp-messages').innerHTML='<div class="sp-empty sp-empty-thread"><i class="fa-solid fa-comments"></i><span>Select a conversation</span></div>';
}

// ── Bank upload ───────────────────────────────────────────────────────────────

let _spBankAccounts=new Map();

function spUploadBank(){
  const inp=document.createElement('input');inp.type='file';inp.accept='.xlsx,.xls,.csv';inp.multiple=true;
  inp.onchange=e=>_spReadFiles(e.target.files,_spParseBank);
  inp.click();
}

function _spFormatBankDate(raw){
  if(!raw)return'';
  const d=new Date(raw);
  if(isNaN(d))return raw;
  return d.toLocaleString('en-AU',{day:'2-digit',month:'short',year:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});
}

function _spParseBank(wb){
  const records=[];
  const cv=v=>{const s=String(v==null?'':v).trim();return(s==='null'||s==='undefined')?'':s;};
  for(const sn of wb.SheetNames){
    const rows=XLSX.utils.sheet_to_json(wb.Sheets[sn],{defval:'',raw:false});
    if(!rows.length)continue;
    const get=k=>{const key=Object.keys(rows[0]).find(rk=>_spNorm(rk)===_spNorm(k));if(!key)return r=>cv(r[key]);return r=>{const v=cv(r[key]);return v;};}
    for(const row of rows){
      const g=k=>{const key=Object.keys(row).find(rk=>_spNorm(rk)===_spNorm(k));if(!key)return'';return cv(row[key]);};
      const amount=parseFloat(String(g('amount')||'0').replace(/[^0-9.]/g,''))||0;
      const type=g('type');
      if(!amount&&!type)continue;
      records.push({
        id:g('id'),type,direction:g('direction'),
        fromId:g('from_account_id'),fromCiv:g('from_civ_name'),fromAcct:g('from_account_name'),
        toId:g('to_account_id'),toCiv:g('to_civ_name'),toAcct:g('to_account_name'),
        amount,comment:g('comment')||g('description'),
        date:_spFormatBankDate(g('date')||g('timestamp')),
        taxPct:g('tax_percentage'),taxType:g('tax_type'),
        _ts:_spParseTs(g('date')||g('timestamp')),
      });
    }
  }
  if(!records.length)return;
  _spBankRecords=[..._spBankRecords,...records];
  const _bpc=_spActiveCase();if(_bpc)_bpc.bank=_spBankRecords;
  _spSaveCases();
  _spBuildBankAccounts();_spUpdateBankFilters();_spRenderAccountSidebar();_spRenderBank();_spShowBankContent();
  _spRenderCasesList();
}

const _SP_SYSTEM_ACCOUNTS={
  '1':'State Account','2':'Mayor Account','3':'DOJ Account',
  '4':'State Account','5':'State Account','6':'LSPD Account',
  '7':'State Account','8':'State Account','9':'State Account',
  '10':'LS Authority Account','11':'BC Authority Account','12':'BCSO Account',
};
function _spSystemName(id){
  if(_SP_SYSTEM_ACCOUNTS[id])return _SP_SYSTEM_ACCOUNTS[id];
  const n=parseInt(id);
  return(!isNaN(n)&&n>0&&n<=100)?'State Account':'';
}

function _spBuildBankAccounts(){
  _spBankAccounts=new Map();
  const upsert=(id,civ,acct)=>{
    const ex=_spBankAccounts.get(id);
    _spBankAccounts.set(id,{
      id,
      civName:civ||(ex?.civName)||'',
      accountName:acct||(ex?.accountName)||'',
    });
  };
  for(const r of _spBankRecords){
    // Only use from_civ_name — to_civ_name in NoPixel CSVs is the sender duplicated, not the recipient owner
    if(r.fromId)upsert(r.fromId,r.fromCiv,r.fromAcct);
    if(r.toId)upsert(r.toId,'',r.toAcct);
  }
}

function _spDetectRecurring(){
  // Group by fromId+toId+amount (exact match)
  const groups={};
  _spBankRecords.forEach((r,i)=>{
    if(!r.fromId||!r.toId||!r.amount)return;
    const key=`${r.fromId}|${r.toId}|${r.amount}`;
    if(!groups[key])groups[key]=[];
    groups[key].push({i,ts:r._ts||0});
  });
  const recurring=new Set();
  for(const entries of Object.values(groups)){
    if(entries.length<3)continue;
    const timed=entries.filter(e=>e.ts>0).sort((a,b)=>a.ts-b.ts);
    if(timed.length<3)continue;
    const gaps=[];for(let i=1;i<timed.length;i++)gaps.push(timed[i].ts-timed[i-1].ts);
    const mean=gaps.reduce((s,g)=>s+g,0)/gaps.length;
    const std=Math.sqrt(gaps.reduce((s,g)=>s+(g-mean)**2,0)/gaps.length);
    const cv=std/mean;
    const meanDays=mean/(864e5);
    if(cv<0.3&&meanDays>=3&&meanDays<=95)timed.forEach(e=>recurring.add(e.i));
  }
  return recurring;
}

function _spAccountLabel(a){
  if(!a)return'Unknown';
  const sys=_spSystemName(a.id);
  // System accounts: ignore civName (it's always the subpoena subject in NoPixel CSVs)
  if(sys)return a.accountName||sys;
  return a.civName||a.accountName||a.id;
}

function _spAccountSub(a){
  if(!a)return'';
  const sys=_spSystemName(a.id);
  if(sys)return a.accountName?sys:('ID: '+a.id);
  if(a.civName&&a.accountName)return a.accountName;
  return'ID: '+a.id;
}

// ── Account sidebar ───────────────────────────────────────────────────────────

function _spRenderAccountSidebar(){
  const el=document.getElementById('sp-account-list');if(!el)return;
  const isIn=r=>(r.direction||'').toLowerCase()==='in';
  const fmt=n=>'$'+n.toLocaleString('en-AU',{minimumFractionDigits:2,maximumFractionDigits:2});
  const sorted=[..._spBankAccounts.values()].sort((a,b)=>{
    const ca=_spBankRecords.filter(r=>r.fromId===b.id||r.toId===b.id).length;
    const cb=_spBankRecords.filter(r=>r.fromId===a.id||r.toId===a.id).length;
    return cb-ca;
  });
  const totIn=_spBankRecords.filter(isIn).reduce((s,r)=>s+r.amount,0);
  const totOut=_spBankRecords.filter(r=>!isIn(r)).reduce((s,r)=>s+r.amount,0);
  el.innerHTML=
    `<div class="sp-account-item sp-account-all-item${_spSelectedAccount===null?' active':''}" onclick="spSelectAccount(null,this)">
      <div class="sp-account-name">All Transactions</div>
      <div class="sp-account-sub">${_spBankRecords.length} transactions</div>
      <div class="sp-account-flow"><span class="sp-amt-in">+${fmt(totIn)}</span><span class="sp-amt-out">-${fmt(totOut)}</span></div>
    </div>`+
    sorted.map(a=>{
      const txCount=_spBankRecords.filter(r=>r.fromId===a.id||r.toId===a.id).length;
      // Money received by subject FROM this account (they sent to subject)
      const received=_spBankRecords.filter(r=>r.fromId===a.id&&isIn(r)).reduce((s,r)=>s+r.amount,0);
      // Money sent by subject TO this account
      const sent=_spBankRecords.filter(r=>r.toId===a.id&&!isIn(r)).reduce((s,r)=>s+r.amount,0);
      const net=received-sent;
      return`<div class="sp-account-item${_spSelectedAccount===a.id?' active':''}" onclick="spSelectAccount('${a.id.replace(/'/g,"\\'")}',this)">
        <div class="sp-account-name">${escapeHtml(_spAccountLabel(a))}</div>
        <div class="sp-account-sub">${escapeHtml(_spAccountSub(a))} · ${txCount} tx</div>
        <div class="sp-account-flow">
          ${received?`<span class="sp-amt-in" title="Received from">+${fmt(received)}</span>`:''}
          ${sent?`<span class="sp-amt-out" title="Sent to">-${fmt(sent)}</span>`:''}
          ${received&&sent?`<span class="sp-account-net ${net>=0?'sp-amt-in':'sp-amt-out'}" title="Net">=${fmt(Math.abs(net))}</span>`:''}
        </div>
      </div>`;
    }).join('');
}

function spSelectAccount(account,el){
  _spSelectedAccount=account;
  document.querySelectorAll('.sp-account-item').forEach(i=>i.classList.remove('active'));
  if(el)el.classList.add('active');
  const hd=document.getElementById('sp-bank-view-title');
  if(hd){
    if(account===null){hd.textContent='All Transactions';}
    else{
      const a=_spBankAccounts.get(account);
      const parts=[_spAccountLabel(a)];
      if(a?.civName&&a?.accountName)parts.push(a.accountName);
      parts.push('ID: '+account);
      hd.textContent=parts.join(' · ');
    }
  }
  _spRenderBank();
}

// ── Bank render ───────────────────────────────────────────────────────────────

function _spUpdateBankFilters(){
  const types=[...new Set(_spBankRecords.map(r=>r.type).filter(Boolean))];
  const dirs=[...new Set(_spBankRecords.map(r=>r.direction).filter(Boolean))];
  const typeEl=document.getElementById('sp-bank-type');
  const dirEl=document.getElementById('sp-bank-dir');
  if(typeEl)typeEl.innerHTML='<option value="">All Types</option>'+types.map(t=>`<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
  if(dirEl)dirEl.innerHTML='<option value="">All Directions</option>'+dirs.map(d=>`<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join('');
}

function spBankFilter(){
  _spBankFilters.type=document.getElementById('sp-bank-type')?.value||'';
  _spBankFilters.dir=document.getElementById('sp-bank-dir')?.value||'';
  _spRenderBank();
}

function spBankSearch(){
  _spBankFilters.search=document.getElementById('sp-bank-search')?.value||'';
  _spRenderBank();
}

function _spRenderBank(){
  const el=document.getElementById('sp-bank-body');if(!el)return;
  let rows=_spBankRecords;
  if(_spSelectedAccount!==null)rows=rows.filter(r=>r.fromId===_spSelectedAccount||r.toId===_spSelectedAccount);
  if(_spBankFilters.type)rows=rows.filter(r=>(r.type||'').toLowerCase()===_spBankFilters.type.toLowerCase());
  if(_spBankFilters.dir)rows=rows.filter(r=>(r.direction||'').toLowerCase()===_spBankFilters.dir.toLowerCase());
  if(_spBankFilters.search){
    const q=_spBankFilters.search.toLowerCase();
    rows=rows.filter(r=>Object.values(r).some(v=>String(v).toLowerCase().includes(q)));
  }
  const isIn=r=>(r.direction||'').toLowerCase()==='in';
  const totalIn=rows.filter(isIn).reduce((s,r)=>s+r.amount,0);
  const totalOut=rows.filter(r=>!isIn(r)).reduce((s,r)=>s+r.amount,0);
  const net=totalIn-totalOut;
  const fmt=n=>'$'+n.toLocaleString('en-AU',{minimumFractionDigits:2,maximumFractionDigits:2});
  const statsEl=document.getElementById('sp-bank-stats');
  if(statsEl)statsEl.innerHTML=`
    <div class="sp-stat"><div class="sp-stat-lbl">Transactions</div><div class="sp-stat-val">${rows.length}</div></div>
    <div class="sp-stat"><div class="sp-stat-lbl">Money In</div><div class="sp-stat-val sp-amt-in">${fmt(totalIn)}</div></div>
    <div class="sp-stat"><div class="sp-stat-lbl">Money Out</div><div class="sp-stat-val sp-amt-out">${fmt(totalOut)}</div></div>
    <div class="sp-stat"><div class="sp-stat-lbl">Net</div><div class="sp-stat-val ${net>=0?'sp-amt-in':'sp-amt-out'}">${fmt(Math.abs(net))}</div></div>`;
  const _recurringSet=_spDetectRecurring();
  const visCols=_SP_BANK_COL_DEFS.filter(c=>_spBankCols[c.k]);
  const headEl=document.getElementById('sp-bank-head');
  if(headEl)headEl.innerHTML=visCols.map(c=>`<th>${c.l}</th>`).join('');
  if(!rows.length){el.innerHTML=`<tr><td colspan="${visCols.length}" style="text-align:center;padding:24px;color:var(--text3)">No transactions match.</td></tr>`;return;}
  const acctCell=id=>{
    if(!id)return'—';
    const a=_spBankAccounts.get(id);
    const label=_spAccountLabel(a||{id,civName:'',accountName:''});
    const sub=a?_spAccountSub(a):'ID: '+id;
    return`<span>${escapeHtml(label)}</span><br><span style="font-size:10px;color:var(--text3)">${escapeHtml(sub)}</span>`;
  };
  el.innerHTML=rows.map(r=>{
    const inbound=isIn(r);
    const amtClass=inbound?'sp-amt-in':'sp-amt-out';
    const amtStr=(inbound?'+':'-')+fmt(r.amount);
    const typePill=r.type?`<span class="sp-type-pill sp-type-${escapeHtml(r.type.toLowerCase())}">${escapeHtml(r.type.toUpperCase())}</span>`:'—';
    const taxPct=parseFloat(r.taxPct)||0;
    const taxAmt=r.amount*(taxPct/100);
    const netAmt=r.amount-taxAmt;
    const cell=k=>{switch(k){
      case'date':return`<td class="sp-ts-cell">${escapeHtml(r.date||'—')}</td>`;
      case'txId':return`<td style="font-family:var(--mono);font-size:11px">${escapeHtml(r.id||'—')}</td>`;
      case'type':return`<td>${typePill}${_recurringSet.has(_spBankRecords.indexOf(r))?'<span class="sp-recurring-badge" title="Recurring transaction">↻</span>':''}</td>`;
      case'dir':return`<td><span class="sp-dir-${inbound?'in':'out'}">${escapeHtml(r.direction||'—')}</span></td>`;
      case'fromName':return`<td>${acctCell(r.fromId)}</td>`;
      case'fromId':return`<td style="font-family:var(--mono);font-size:11px">${escapeHtml(r.fromId||'—')}</td>`;
      case'fromType':return`<td>${escapeHtml(r.fromAcct||'—')}</td>`;
      case'toName':return`<td>${acctCell(r.toId)}</td>`;
      case'toId':return`<td style="font-family:var(--mono);font-size:11px">${escapeHtml(r.toId||'—')}</td>`;
      case'toType':return`<td>${escapeHtml(r.toAcct||'—')}</td>`;
      case'amount':return`<td class="${amtClass} sp-amt-cell">${amtStr}</td>`;
      case'taxAmt':return`<td>${taxPct?fmt(taxAmt):'—'}</td>`;
      case'netAmt':return`<td class="${amtClass}">${taxPct?fmt(netAmt):fmt(r.amount)}</td>`;
      case'taxPct':return`<td>${r.taxPct||'—'}</td>`;
      case'taxType':return`<td>${escapeHtml(r.taxType||'—')}</td>`;
      case'comment':return`<td class="sp-comment-cell">${escapeHtml(r.comment||'—')}</td>`;
      default:return'<td>—</td>';
    }};
    return`<tr${_recurringSet.has(_spBankRecords.indexOf(r))?' class="sp-recurring-row"':''}>${visCols.map(c=>cell(c.k)).join('')}</tr>`;
  }).join('');
}

function spClearBank(){
  _spBankRecords=[];_spBankAccounts=new Map();_spBankFilters={type:'',dir:'',search:''};_spSelectedAccount=null;
  const c=_spActiveCase();if(c)c.bank=[];
  _spSaveCases();
  const si=document.getElementById('sp-bank-search');if(si)si.value='';
  _spRenderAccountSidebar();_spRenderBank();_spShowBankContent();
  _spRenderCasesList();
}

function _spShowBankContent(){
  const empty=document.getElementById('sp-bank-empty');
  const content=document.getElementById('sp-bank-content');
  const has=!!_spBankRecords.length;
  if(empty)empty.style.display=has?'none':'flex';
  if(content)content.style.display=has?'flex':'none';
  const exportBtn=document.getElementById('sp-bank-export-btn');
  if(exportBtn)exportBtn.style.display=has?'':'none';
}

// ── Mode ──────────────────────────────────────────────────────────────────────

function spSetMode(mode,el){
  document.querySelectorAll('.sp-mode-btn').forEach(b=>b.classList.remove('active'));
  if(el)el.classList.add('active');
  document.getElementById('sp-phone').style.display=mode==='phone'?'flex':'none';
  document.getElementById('sp-bank').style.display=mode==='bank'?'flex':'none';
}

// ── Export preview ────────────────────────────────────────────────────────────

let _spExportMode=null;

function spOpenExport(mode){
  _spExportMode=mode;
  const overlay=document.getElementById('sp-export-overlay');if(!overlay)return;
  const content=document.getElementById('sp-export-content');if(!content)return;
  content.innerHTML=mode==='phone'?_spBuildPhoneExport():_spBuildBankExport();
  overlay.style.display='flex';
}

function spCloseExport(){
  const overlay=document.getElementById('sp-export-overlay');
  if(overlay)overlay.style.display='none';
}

function spToggleExportEntry(el){el.classList.toggle('sp-entry-hidden');}

function _spBuildPhoneExport(){
  const c=_spActiveConvo?_spConvos[_spActiveConvo]:null;
  if(!c)return'<div style="padding:40px;text-align:center;color:var(--text3)">Select a conversation first.</div>';
  const nums=c.participants.map(p=>_spGetName(p)!==p?`${_spGetName(p)} (${p})`:p);
  const [left]=c.participants;
  const esc=s=>escapeHtml(s);
  let html=`<div class="sp-exp-hd"><div class="sp-exp-title">Communication Logs</div><div class="sp-exp-sub">${nums.join(' &amp; ')}</div></div>
  <div class="sp-exp-thread">`;
  for(const r of c.records){
    const ts=r.timestamp?new Date(r.timestamp).toLocaleString('en-AU',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',hour12:false}):'';
    if(r.type==='call'){
      html+=`<div class="sp-call-row sp-exp-toggle" onclick="spToggleExportEntry(this)">
        <i class="fa-solid fa-phone"></i>
        <span><strong>${esc(_spGetName(r.from))}</strong> → <strong>${esc(_spGetName(r.to))}</strong>${r.duration?' · '+esc(r.duration):''}</span>
        <span class="sp-ts">${esc(ts)}</span>
      </div>`;
    }else{
      const out=r.from===left;
      html+=`<div class="sp-msg-row${out?' sp-out':' sp-in'} sp-exp-toggle" onclick="spToggleExportEntry(this)">
        <div class="sp-bubble">
          <div class="sp-bubble-sender">${esc(_spGetName(r.from))}</div>
          <div class="sp-bubble-text">${esc(r.message||'')}</div>
          <div class="sp-ts">${esc(ts)}</div>
        </div>
      </div>`;
    }
  }
  return html+'</div>';
}

function _spBuildBankExport(){
  let rows=_spBankRecords;
  if(_spSelectedAccount!==null)rows=rows.filter(r=>r.fromId===_spSelectedAccount||r.toId===_spSelectedAccount);
  if(_spBankFilters.type)rows=rows.filter(r=>(r.type||'').toLowerCase()===_spBankFilters.type.toLowerCase());
  if(_spBankFilters.dir)rows=rows.filter(r=>(r.direction||'').toLowerCase()===_spBankFilters.dir.toLowerCase());
  if(_spBankFilters.search){const q=_spBankFilters.search.toLowerCase();rows=rows.filter(r=>Object.values(r).some(v=>String(v).toLowerCase().includes(q)));}
  const acctLabel=_spSelectedAccount!==null?_spAccountLabel(_spBankAccounts.get(_spSelectedAccount)||{id:_spSelectedAccount,civName:'',accountName:''}):'All Transactions';
  const isIn=r=>(r.direction||'').toLowerCase()==='in';
  const fmt=n=>'$'+n.toLocaleString('en-AU',{minimumFractionDigits:2,maximumFractionDigits:2});
  const acctCell=id=>{if(!id)return'—';const a=_spBankAccounts.get(id);return escapeHtml(_spAccountLabel(a||{id,civName:'',accountName:''}));};
  let html=`<div class="sp-exp-hd"><div class="sp-exp-title">Bank Records</div><div class="sp-exp-sub">${escapeHtml(acctLabel)} &mdash; ${rows.length} transactions</div></div>
  <div class="sp-exp-body sp-exp-tbl-wrap"><table class="sp-exp-tbl">
    <thead><tr><th>Date</th><th>Type</th><th>Dir</th><th>From</th><th>To</th><th>Amount</th><th>Comment</th></tr></thead><tbody>`;
  for(const r of rows){
    const inb=isIn(r);
    html+=`<tr class="sp-exp-toggle" onclick="spToggleExportEntry(this)">
      <td class="sp-exp-mono">${escapeHtml(r.date||'—')}</td>
      <td>${escapeHtml((r.type||'—').toUpperCase())}</td>
      <td class="${inb?'sp-amt-in':'sp-amt-out'}">${escapeHtml(r.direction||'—')}</td>
      <td>${acctCell(r.fromId)}</td><td>${acctCell(r.toId)}</td>
      <td class="${inb?'sp-amt-in':'sp-amt-out'}">${(inb?'+':'-')+fmt(r.amount)}</td>
      <td>${escapeHtml(r.comment||'—')}</td></tr>`;
  }
  return html+'</tbody></table></div>';
}

function spCreatePng(){
  const src=document.getElementById('sp-export-content');if(!src)return;
  const btn=document.getElementById('sp-create-png-btn');
  if(btn){btn.disabled=true;btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Rendering…';}
  // Clone and strip hidden entries
  const clone=src.cloneNode(true);
  clone.querySelectorAll('.sp-entry-hidden').forEach(el=>el.remove());
  clone.style.position='fixed';clone.style.left='-9999px';clone.style.top='0';
  clone.style.width=src.offsetWidth+'px';
  document.body.appendChild(clone);
  const bgVal=getComputedStyle(document.documentElement).getPropertyValue('--s1').trim()||'#0f1623';
  html2canvas(clone,{backgroundColor:bgVal,scale:2,useCORS:true,logging:false})
    .then(canvas=>{
      const a=document.createElement('a');
      a.download=`subpoena-${_spExportMode}-${new Date().toISOString().slice(0,10)}.png`;
      a.href=canvas.toDataURL('image/png');a.click();
    })
    .catch(e=>console.error('Export failed:',e))
    .finally(()=>{
      document.body.removeChild(clone);
      if(btn){btn.disabled=false;btn.innerHTML='<i class="fa-solid fa-image"></i> Create PNG';}
    });
}

// ── Case colour picker ────────────────────────────────────────────────────────

let _spCpH=0,_spCpS=1,_spCpV=1,_spCpDrag=null,_spCpCaseId=null;

function _spHsvToRgb(h,s,v){const f=n=>{const k=(n+h/60)%6;return v-v*s*Math.max(0,Math.min(k,4-k,1));};return{r:Math.round(f(5)*255),g:Math.round(f(3)*255),b:Math.round(f(1)*255)};}
function _spRgbToHsv(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=0;if(d){if(max===r)h=((g-b)/d)%6;else if(max===g)h=(b-r)/d+2;else h=(r-g)/d+4;h=h*60;if(h<0)h+=360;}return{h,s:max?d/max:0,v:max};}
function _spRgbToHex(r,g,b){return'#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');}
function _spCpHexToRgb(hex){if(!/^#[0-9a-fA-F]{6}$/.test(hex))return null;return{r:parseInt(hex.slice(1,3),16),g:parseInt(hex.slice(3,5),16),b:parseInt(hex.slice(5,7),16)};}
function _spCpCurrentHex(){const{r,g,b}=_spHsvToRgb(_spCpH,_spCpS,_spCpV);return _spRgbToHex(r,g,b);}

function _spCpDrawSV(){
  const cv=document.getElementById('sp-cpick-sv');if(!cv)return;
  const ctx=cv.getContext('2d'),w=cv.width,h=cv.height;
  const{r,g,b}=_spHsvToRgb(_spCpH,1,1);
  ctx.fillStyle=`rgb(${r},${g},${b})`;ctx.fillRect(0,0,w,h);
  const wg=ctx.createLinearGradient(0,0,w,0);wg.addColorStop(0,'rgba(255,255,255,1)');wg.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=wg;ctx.fillRect(0,0,w,h);
  const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,'rgba(0,0,0,0)');bg.addColorStop(1,'rgba(0,0,0,1)');
  ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
  const cx=_spCpS*w,cy=(1-_spCpV)*h;
  ctx.beginPath();ctx.arc(cx,cy,7,0,2*Math.PI);ctx.strokeStyle='rgba(0,0,0,.5)';ctx.lineWidth=3;ctx.stroke();
  ctx.beginPath();ctx.arc(cx,cy,7,0,2*Math.PI);ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();
}
function _spCpDrawHue(){
  const cv=document.getElementById('sp-cpick-hue');if(!cv)return;
  const ctx=cv.getContext('2d'),w=cv.width,h=cv.height;
  const g=ctx.createLinearGradient(0,0,w,0);
  for(let i=0;i<=12;i++)g.addColorStop(i/12,`hsl(${i*30},100%,50%)`);
  ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  const x=(_spCpH/360)*w,tx=Math.max(0,Math.min(w-8,x-4));
  ctx.fillStyle='rgba(255,255,255,.9)';ctx.fillRect(tx,0,8,h);
  ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1;ctx.strokeRect(tx,0,8,h);
}
function _spCpRedraw(){
  _spCpDrawSV();_spCpDrawHue();
  const hex=_spCpCurrentHex();
  const prev=document.getElementById('sp-cpick-preview');const hexEl=document.getElementById('sp-cpick-hex');
  if(prev)prev.style.background=hex;
  if(hexEl&&document.activeElement!==hexEl)hexEl.value=hex;
}

function spOpenCaseColorPicker(caseId,btn){
  const ex=document.getElementById('sp-case-cpicker');
  if(ex){if(_spCpCaseId===caseId){ex._cleanup?.();ex.remove();return;}ex._cleanup?.();ex.remove();}
  _spCpCaseId=caseId;
  const c=_spCases.find(c=>c.id===caseId);
  const cur=(c?.color)||'#3b82f6';
  const rgb=_spCpHexToRgb(cur);
  if(rgb){const hsv=_spRgbToHsv(rgb.r,rgb.g,rgb.b);_spCpH=hsv.h;_spCpS=hsv.s;_spCpV=hsv.v;}
  const panel=document.createElement('div');
  panel.id='sp-case-cpicker';panel.className='np-cpicker-panel';
  panel.innerHTML=`
    <div class="np-cpicker-label">Case Colour</div>
    <canvas id="sp-cpick-sv" class="np-cp-sv" width="182" height="130"></canvas>
    <canvas id="sp-cpick-hue" class="np-cp-hue" width="182" height="12"></canvas>
    <div class="np-cpicker-top">
      <div class="np-cpicker-preview-box" id="sp-cpick-preview" style="background:${cur}"></div>
      <input type="text" class="np-cpicker-hex" id="sp-cpick-hex" value="${cur}" maxlength="7" placeholder="#rrggbb" spellcheck="false">
    </div>
    <div class="np-cpicker-actions">
      <button class="np-btn" style="flex:1;justify-content:center" onclick="spCaseColorApply()"><i class="fa-solid fa-check"></i> Apply</button>
      ${c?.color?`<button class="np-btn" onclick="spSetCaseColor(${caseId},'');document.getElementById('sp-case-cpicker')?._cleanup?.();document.getElementById('sp-case-cpicker')?.remove()"><i class="fa-solid fa-xmark"></i> Clear</button>`:''}
    </div>`;
  document.body.appendChild(panel);
  const rect=btn.getBoundingClientRect();
  const pw=202,ph=390;
  let left=rect.right+6,top=rect.top;
  if(left+pw>window.innerWidth-8)left=rect.left-pw-6;
  if(top+ph>window.innerHeight-8)top=window.innerHeight-ph-8;
  panel.style.top=Math.max(4,top)+'px';panel.style.left=Math.max(4,left)+'px';
  _spCpRedraw();
  const svCv=document.getElementById('sp-cpick-sv'),hueCv=document.getElementById('sp-cpick-hue');
  function svPick(e){const r=svCv.getBoundingClientRect();_spCpS=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));_spCpV=Math.max(0,Math.min(1,1-(e.clientY-r.top)/r.height));_spCpRedraw();}
  function huePick(e){const r=hueCv.getBoundingClientRect();_spCpH=Math.max(0,Math.min(359.9,((e.clientX-r.left)/r.width)*360));_spCpRedraw();}
  svCv.addEventListener('mousedown',e=>{_spCpDrag='sv';svPick(e);e.preventDefault();});
  hueCv.addEventListener('mousedown',e=>{_spCpDrag='hue';huePick(e);e.preventDefault();});
  const onMove=e=>{if(_spCpDrag==='sv')svPick(e);else if(_spCpDrag==='hue')huePick(e);};
  const onUp=()=>{_spCpDrag=null;};
  document.addEventListener('mousemove',onMove);document.addEventListener('mouseup',onUp);
  const hexEl=document.getElementById('sp-cpick-hex');
  hexEl.addEventListener('input',()=>{
    const v=hexEl.value.trim();
    if(/^#[0-9a-fA-F]{6}$/.test(v)){const rgb=_spCpHexToRgb(v);if(!rgb)return;const hsv=_spRgbToHsv(rgb.r,rgb.g,rgb.b);_spCpH=hsv.h;_spCpS=hsv.s;_spCpV=hsv.v;_spCpDrawSV();_spCpDrawHue();document.getElementById('sp-cpick-preview').style.background=v;}
  });
  hexEl.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();spCaseColorApply();}if(e.key==='Escape'){panel._cleanup?.();panel.remove();}});
  panel._cleanup=()=>{document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);};
  setTimeout(()=>document.addEventListener('click',function h(e){
    if(!panel.contains(e.target)&&!btn.contains(e.target)){panel._cleanup?.();panel.remove();document.removeEventListener('click',h,true);}
  },true),0);
}

function spCaseColorApply(){
  const v=(document.getElementById('sp-cpick-hex')?.value||'').trim();
  spSetCaseColor(_spCpCaseId,/^#[0-9a-fA-F]{6}$/.test(v)?v:_spCpCurrentHex());
  const p=document.getElementById('sp-case-cpicker');p?._cleanup?.();p?.remove();
}

function spSetCaseColor(id,color){
  const c=_spCases.find(c=>c.id===id);if(!c)return;
  c.color=color||null;_spSaveCases();_spRenderCasesList();
}

// ── Cases management ──────────────────────────────────────────────────────────

let _spCaseView='active',_spCaseSearch='';

function _spSwitchAwayFrom(id){
  const next=_spCases.find(c=>!c.archived&&!c.deleted&&c.id!==id);
  if(next){spSelectCase(next.id);}
  else{
    const nc={id:Date.now(),name:'New Case',phone:[],bank:[],archived:false,deleted:false,deletedAt:null};
    _spCases.unshift(nc);_spActiveCaseId=nc.id;
    _spPhoneRecords=[];_spBankRecords=[];
    _spConvos={};_spActiveConvo=null;_spBankAccounts=new Map();_spBankFilters={type:'',dir:'',search:''};_spSelectedAccount=null;
    _spSaveCases();_spRenderCasesList();_spShowSplit();_spShowBankContent();_spRenderConvoList();_spRenderStats();_spRenderAccountSidebar();_spRenderBank();
  }
}

function spNewCase(){
  _spSyncActiveCase();
  const c={id:Date.now(),name:'New Case',phone:[],bank:[],archived:false,deleted:false,deletedAt:null};
  _spCases.unshift(c);_spActiveCaseId=c.id;
  _spPhoneRecords=[];_spBankRecords=[];
  _spConvos={};_spActiveConvo=null;_spBankAccounts=new Map();_spBankFilters={type:'',dir:'',search:''};_spSelectedAccount=null;
  _spCaseView='active';_spUpdateCaseTabs();
  _spSaveCases();_spRenderCasesList();_spShowSplit();_spShowBankContent();_spRenderConvoList();_spRenderStats();_spRenderAccountSidebar();_spRenderBank();
}

function spSelectCase(id){
  if(id===_spActiveCaseId)return;
  _spSyncActiveCase();_spActiveCaseId=id;
  const c=_spActiveCase();if(!c)return;
  _spPhoneRecords=c.phone||[];_spBankRecords=c.bank||[];
  _spConvos={};_spActiveConvo=null;_spPhoneSearch='';
  _spBankAccounts=new Map();_spBankFilters={type:'',dir:'',search:''};_spSelectedAccount=null;
  const si=document.getElementById('sp-phone-search');if(si)si.value='';
  _spBuildConvos();_spBuildBankAccounts();_spUpdateBankFilters();
  _spRenderCasesList();_spRenderConvoList();_spRenderStats();_spRenderAccountSidebar();_spRenderBank();_spShowSplit();_spShowBankContent();
}

function spArchiveCase(id,e){
  e.stopPropagation();
  const c=_spCases.find(c=>c.id===id);if(!c)return;
  c.archived=true;
  if(_spActiveCaseId===id)_spSwitchAwayFrom(id);
  else{_spSaveCases();_spRenderCasesList();}
}

function spTrashCase(id,e){
  e.stopPropagation();
  const c=_spCases.find(c=>c.id===id);if(!c)return;
  c.deleted=true;c.deletedAt=Date.now();c.archived=false;
  if(_spActiveCaseId===id)_spSwitchAwayFrom(id);
  else{_spSaveCases();_spRenderCasesList();}
}

function spRestoreCase(id,e){
  e.stopPropagation();
  const c=_spCases.find(c=>c.id===id);if(!c)return;
  c.archived=false;c.deleted=false;c.deletedAt=null;
  _spSaveCases();_spRenderCasesList();
}

function spPermanentDeleteCase(id,e){
  e.stopPropagation();
  _spCases=_spCases.filter(c=>c.id!==id);
  _spSaveCases();_spRenderCasesList();
}

function spEmptySpTrash(){
  _spCases=_spCases.filter(c=>!c.deleted);
  _spSaveCases();_spRenderCasesList();
}

function spSetCaseView(view,el){
  _spCaseView=view;_spUpdateCaseTabs(el);
  const footer=document.getElementById('sp-cases-trash-footer');
  if(footer)footer.style.display=view==='trash'?'':'none';
  _spRenderCasesList();
}

function _spUpdateCaseTabs(activeEl){
  document.querySelectorAll('.sp-cases-tab').forEach((b,i)=>{
    const views=['active','archived','trash'];
    b.classList.toggle('active',b===activeEl||(activeEl===undefined&&views[i]===_spCaseView));
  });
}

function spSearchCases(q){_spCaseSearch=q.toLowerCase();_spRenderCasesList();}

function spRenameCase(id,name){
  const c=_spCases.find(c=>c.id===id);
  if(c){c.name=name.trim()||'Unnamed';_spSaveCases();_spRenderCasesList();}
}

function _spRenderCasesList(){
  const el=document.getElementById('sp-cases-list');if(!el)return;
  const q=_spCaseSearch;
  let list=_spCases.filter(c=>{
    if(_spCaseView==='archived')return c.archived&&!c.deleted;
    if(_spCaseView==='trash')return c.deleted;
    return!c.archived&&!c.deleted;
  });
  if(q)list=list.filter(c=>(c.name||'').toLowerCase().includes(q));
  if(!list.length){
    const msg=_spCaseView==='trash'?'Trash is empty':_spCaseView==='archived'?'No archived cases':q?'No matching cases':'No cases yet';
    el.innerHTML=`<div class="sp-case-empty">${msg}</div>`;return;
  }
  const phn=c=>c.id===_spActiveCaseId?_spPhoneRecords:c.phone||[];
  const bnk=c=>c.id===_spActiveCaseId?_spBankRecords:c.bank||[];
  el.innerHTML=list.map(c=>{
    const pc=phn(c).length,bc=bnk(c).length;
    const badges=`<div class="sp-case-badges">
      ${pc?`<span class="sp-case-badge sp-cb-phone"><i class="fa-solid fa-mobile-screen-button"></i> ${pc}</span>`:''}
      ${bc?`<span class="sp-case-badge sp-cb-bank"><i class="fa-solid fa-building-columns"></i> ${bc}</span>`:''}
      ${!pc&&!bc?'<span class="sp-case-badge sp-cb-empty">Empty</span>':''}
    </div>`;
    if(_spCaseView==='trash'){
      return`<div class="sp-case-item">
        <div class="sp-case-item-top"><span class="sp-case-name-txt">${escapeHtml(c.name||'Unnamed')}</span></div>
        ${badges}
        <div class="sp-case-item-actions">
          <button class="sp-case-action-btn" onclick="spRestoreCase(${c.id},event)"><i class="fa-solid fa-rotate-left"></i> Restore</button>
          <button class="sp-case-action-btn sp-case-action-red" onclick="spPermanentDeleteCase(${c.id},event)"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>`;
    }
    if(_spCaseView==='archived'){
      return`<div class="sp-case-item">
        <div class="sp-case-item-top"><span class="sp-case-name-txt">${escapeHtml(c.name||'Unnamed')}</span></div>
        ${badges}
        <div class="sp-case-item-actions">
          <button class="sp-case-action-btn" onclick="spRestoreCase(${c.id},event)"><i class="fa-solid fa-rotate-left"></i> Restore</button>
          <button class="sp-case-action-btn sp-case-action-red" onclick="spTrashCase(${c.id},event)"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>`;
    }
    const active=c.id===_spActiveCaseId;
    return`<div class="sp-case-item${active?' active':''}" style="${c.color?'border-left-color:'+c.color:''}" onclick="spSelectCase(${c.id})">
      <div class="sp-case-item-top">
        <input class="sp-case-name-inp" value="${escapeHtml(c.name||'')}"
          onclick="event.stopPropagation()"
          onchange="spRenameCase(${c.id},this.value)"
          onkeydown="if(event.key==='Enter')this.blur()">
        <div class="sp-case-item-btns">
          <button class="sp-case-del" onclick="spCopyDeepLink(${c.id},event)" data-tip-js="Copy deep link"><i class="fa-solid fa-link"></i></button>
          <button class="sp-case-del sp-case-palette-btn" onclick="spOpenCaseColorPicker(${c.id},this);event.stopPropagation()" data-tip-js="Set colour"><i class="fa-solid fa-palette" style="${c.color?'color:'+c.color:''}"></i></button>
          <button class="sp-case-del" onclick="spArchiveCase(${c.id},event)" data-tip-js="Archive"><i class="fa-solid fa-box-archive"></i></button>
          <button class="sp-case-del sp-case-del-red" onclick="spTrashCase(${c.id},event)" data-tip-js="Move to trash"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
      ${badges}
    </div>`;
  }).join('');
}

function spCopyDeepLink(id,e){
  e.stopPropagation();
  const url=location.href.split('?')[0]+'?case='+id;
  navigator.clipboard.writeText(url).then(()=>{
    const btn=e.target.closest('button');
    if(btn){const orig=btn.innerHTML;btn.innerHTML='<i class="fa-solid fa-check"></i>';setTimeout(()=>{btn.innerHTML=orig;},1800);}
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────

function _initSubpoena(){
  _spLoadContacts();
  _spLoadCases();
  _spLoadBankCols();

  // Migrate old per-key storage to cases system
  if(!_spCases.length){
    const defaultCase={id:Date.now(),name:'Case 1',phone:[],bank:[]};
    try{const old=localStorage.getItem('upd-sp-phone');if(old){defaultCase.phone=JSON.parse(old)||[];localStorage.removeItem('upd-sp-phone');}}catch(e){}
    try{const old=localStorage.getItem('upd-sp-bank');if(old){defaultCase.bank=JSON.parse(old)||[];localStorage.removeItem('upd-sp-bank');}}catch(e){}
    _spCases=[defaultCase];
    localStorage.setItem('upd-sp-cases',JSON.stringify(_spCases));
  }

  // Normalise cases that predate archived/deleted fields, clean old trash
  const thirtyDays=30*24*60*60*1000;
  _spCases=_spCases.filter(c=>!c.deleted||!c.deletedAt||(Date.now()-c.deletedAt)<thirtyDays);
  _spCases.forEach(c=>{if(c.archived===undefined)c.archived=false;if(c.deleted===undefined){c.deleted=false;c.deletedAt=null;}});
  // Activate first non-deleted, non-archived case; fall back to first case
  const firstActive=_spCases.find(c=>!c.archived&&!c.deleted)||_spCases[0];
  _spActiveCaseId=firstActive?.id||null;
  _spPhoneRecords=firstActive?.phone||[];
  _spBankRecords=firstActive?.bank||[];

  if(_spPhoneRecords.length){_spBuildConvos();_spRenderConvoList();_spRenderStats();}
  if(_spBankRecords.length){_spBuildBankAccounts();_spUpdateBankFilters();_spRenderAccountSidebar();_spRenderBank();}
  _spShowSplit();_spShowBankContent();
  _spRenderCasesList();
  const _pending=sessionStorage.getItem('upd-sp-pending-case');
  if(_pending){sessionStorage.removeItem('upd-sp-pending-case');const _pid=parseInt(_pending);if(_spCases.find(c=>c.id===_pid))spSelectCase(_pid);}
  const _deepCase=new URLSearchParams(location.search).get('case');
  if(_deepCase&&!_pending){history.replaceState(null,'',location.pathname);const _dci=parseInt(_deepCase);if(_spCases.find(c=>c.id===_dci))spSelectCase(_dci);}
}

window.__pageInits=window.__pageInits||{};
window.__pageInits.subpoena=_initSubpoena;
window.addEventListener('load',_initSubpoena);
