const ROSTER_CSV_URL='https://docs.google.com/spreadsheets/d/15tE7r-z_8mEjOYRfyZY-3OCE6x-6XRwCKgxFjlD6exE/export?format=csv&gid=684178055';
const ROSTER_COLS=[
  {key:'id',       label:'ID',      idx:2,  filter:false, show:true},
  {key:'name',     label:'Name',    idx:3,  filter:false, show:true},
  {key:'callsign', label:'Callsign',idx:-1, filter:false, show:true},
  {key:'rank',     label:'Rank',    idx:7,  filter:true,  show:true},
  {key:'status',   label:'Status',  idx:19, filter:true,  show:true},
  {key:'division', label:'Dept',    idx:-1, filter:true,  show:true},
  {key:'shift',    label:'Shift',   idx:21, filter:true,  show:true},
  {key:'discord',  label:'Discord', idx:22, filter:false, show:true},
  {key:'joined',   label:'Joined',  idx:24, filter:false, show:true},
];
let rosterData=[],rosterFilterState={},rosterSort={col:'',dir:1},rosterLoaded=false;
const ROSTER_FILTER_ORDER={
  division:['BCSO','LSPD','ODPD'],
  status:['Active','Reserve','Part-Time','LOA','Inactive'],
  shift:['AU','EU','NA'],
};
const ROSTER_RANK_WEIGHT={
  chiefofpolice:0,sheriff:1,chief:2,asschiefofpolice:3,asschief:4,undersheriff:5,
  captain:6,lieutenant:7,sergeant:8,snrofficer:9,snrdeputy:10,
  officer:11,deputy:12,ppofasttrack:13,ppo:14,cadetfasttrack:15,cadet:16,
};

function parseCSV(text){
  const rows=[];let row=[],cell='',inQ=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(c==='"'){if(inQ&&text[i+1]==='"'){cell+='"';i++;}else inQ=!inQ;}
    else if(c===','&&!inQ){row.push(cell.trim());cell='';}
    else if((c==='\n'||c==='\r')&&!inQ){
      if(c==='\r'&&text[i+1]==='\n')i++;
      row.push(cell.trim());rows.push(row);row=[];cell='';
    }else cell+=c;
  }
  if(cell||row.length){row.push(cell.trim());rows.push(row);}
  return rows;
}

async function _fetchRosterHtmlData(){
  const htmlUrl='https://docs.google.com/spreadsheets/d/15tE7r-z_8mEjOYRfyZY-3OCE6x-6XRwCKgxFjlD6exE/export?format=html&gid=684178055';
  const result={links:{}};
  try{
    const res=await fetch(htmlUrl,{cache:'no-store'});
    if(!res.ok)return result;
    const html=await res.text();
    const doc=new DOMParser().parseFromString(html,'text/html');
    doc.querySelectorAll('a[href]').forEach(a=>{
      const t=a.textContent.trim(),h=a.getAttribute('href');
      if(t&&h)result.links[t]=h;
    });
  }catch(e){console.error('[roster] HTML parse error:',e);}
  return result;
}

function normalizeRosterValue(value){return String(value??'').trim().replace(/\s+/g,' ');}
function normalizeRosterRank(rank){return normalizeRosterValue(rank).toLowerCase().replace(/[^a-z]/g,'');}

function formatRosterDateString(value){
  const raw=normalizeRosterValue(value);
  if(!raw)return'';
  const parts=raw.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if(!parts)return raw;
  const date=new Date(Number(parts[1]),Number(parts[2])-1,Number(parts[3]));
  if(Number.isNaN(date.getTime()))return raw;
  return new Intl.DateTimeFormat('en-US',{month:'2-digit',day:'2-digit',year:'numeric'}).format(date);
}

function getRosterDateSortValueFromString(value){
  const raw=normalizeRosterValue(value);
  if(!raw)return 0;
  const parts=raw.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if(parts)return new Date(Number(parts[1]),Number(parts[2])-1,Number(parts[3])).getTime();
  const parsed=Date.parse(raw);
  return Number.isNaN(parsed)?0:parsed;
}

function getRosterDivision(raw,currentDept){
  const source=`${normalizeRosterValue(raw)} ${normalizeRosterValue(currentDept)}`.toLowerCase();
  if(source.includes('blaine')||source.includes('bcso'))return'BCSO';
  if(source.includes('ocean drive')||source.includes('odpd'))return'ODPD';
  if(source.includes('los santos')||source.includes('lspd'))return'LSPD';
  return'';
}

function resolveDiscordLink(discordValue,discordLinks){
  const value=normalizeRosterValue(discordValue);
  if(!value)return null;
  if(/^https?:\/\//i.test(value))return value;
  if(/^\d{17,20}$/.test(value))return`https://discord.com/users/${value}`;
  return discordLinks[value]||discordLinks['@'+value]||null;
}

function buildRosterCallsign(callsignValue,suffixCode){
  const base=normalizeRosterValue(callsignValue);
  const suffix=normalizeRosterValue(suffixCode).toUpperCase();
  if(!base)return'';
  if(/[A-Z]/i.test(base))return base;
  if(suffix==='C')return`${base}-C`;
  if(suffix==='PPO'||suffix==='P')return`${base}-P`;
  return base;
}

function rosterCompare(key,a,b){
  if(key==='rank'){
    const aW=ROSTER_RANK_WEIGHT[normalizeRosterRank(a)];
    const bW=ROSTER_RANK_WEIGHT[normalizeRosterRank(b)];
    if(aW!=null||bW!=null){
      const l=aW??Number.MAX_SAFE_INTEGER,r=bW??Number.MAX_SAFE_INTEGER;
      if(l!==r)return l-r;
    }
  }
  const ordered=ROSTER_FILTER_ORDER[key];
  if(ordered){
    const ai=ordered.indexOf(a),bi=ordered.indexOf(b);
    if(ai!==-1||bi!==-1){
      const l=ai===-1?Number.MAX_SAFE_INTEGER:ai,r=bi===-1?Number.MAX_SAFE_INTEGER:bi;
      if(l!==r)return l-r;
    }
  }
  return String(a||'').localeCompare(String(b||''),undefined,{numeric:true,sensitivity:'base'});
}

async function loadRoster(){
  const container=document.getElementById('roster-container');
  if(container)container.innerHTML='<div class="roster-status">Loading roster…</div>';
  try{
    const [csvRes,htmlData]=await Promise.all([
      fetch(ROSTER_CSV_URL,{cache:'no-store'}),
      _fetchRosterHtmlData()
    ]);
    const discordLinks=htmlData.links;
    if(!csvRes.ok)throw new Error('HTTP '+csvRes.status);
    const rows=parseCSV(await csvRes.text());
    const STOP_SECTION='gone but not forgotten';
    let currentDept='';
    rosterData=[];
    for(const [rowIdx,cells] of rows.entries()){
      const getVal=i=>normalizeRosterValue(cells[i]||'');
      const id=getVal(2),name=getVal(3),callsign=getVal(4),deptValue=getVal(5);
      const suffix=getVal(6),rank=getVal(7),status=getVal(19),joinedRaw=getVal(24);
      const discord=getVal(22);
      if(id&&!name&&!callsign&&!rank){
        currentDept=id;
        if(id.toLowerCase().includes(STOP_SECTION))break;
        continue;
      }
      const isPersonRow=!!(currentDept&&name&&(callsign||deptValue||suffix||rank||status||discord||joinedRaw||id));
      if(!isPersonRow)continue;
      const member={dept:currentDept};
      ROSTER_COLS.filter(c=>c.idx>=0).forEach(c=>{member[c.key]=getVal(c.idx);});
      member.status=normalizeRosterValue(member.status);
      if(member.status==='KIA')continue;
      member.division=getRosterDivision(deptValue,currentDept);
      if(!member.division)continue;
      member.callsign=buildRosterCallsign(callsign,suffix);
      member.joined=formatRosterDateString(joinedRaw);
      member._joinedSort=getRosterDateSortValueFromString(joinedRaw);
      member.discordLink=resolveDiscordLink(member.discord,discordLinks);
      member.sheetUrl=`https://docs.google.com/spreadsheets/d/15tE7r-z_8mEjOYRfyZY-3OCE6x-6XRwCKgxFjlD6exE/edit#gid=684178055&range=D${rowIdx+1}`;
      rosterData.push(member);
    }
    rosterLoaded=true;
    rosterFilterState={};rosterSort={col:'',dir:1};
    buildRosterFilters();renderRoster();
  }catch(err){
    if(container)container.innerHTML=`<div class="roster-status error">Failed to load roster.<small>${escapeHtml(err.message)}</small></div>`;
    console.error('Roster load failed:',err);
  }
}

function buildRosterFilters(){
  const wrap=document.getElementById('roster-filters');
  if(!wrap)return;
  wrap.innerHTML='';rosterFilterState={};
  ROSTER_COLS.filter(c=>c.filter).forEach(col=>{
    const vals=[...new Set(rosterData.map(r=>r[col.key]).filter(v=>v))].sort((a,b)=>rosterCompare(col.key,a,b));
    if(vals.length<2)return;
    rosterFilterState[col.key]='';
    const sel=document.createElement('select');
    sel.className='roster-filter-sel';
    sel.innerHTML=`<option value="">All ${escapeHtml(col.label)}</option>`+vals.map(v=>`<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join('');
    sel.onchange=()=>{rosterFilterState[col.key]=sel.value;renderRoster();};
    wrap.appendChild(sel);
  });
}

function sortRosterBy(key){
  rosterSort.dir=rosterSort.col===key?-rosterSort.dir:1;
  rosterSort.col=key;
  renderRoster();
}

function getCellClass(key,val){
  if(!val)return'';
  if(key==='status'){
    const v=val.toLowerCase().replace(/[^a-z]/g,'');
    if(v==='active')return'status-active';
    if(v==='reserve')return'status-reserve';
    if(v==='loa')return'status-loa';
    if(v.includes('part'))return'status-parttime';
    if(v==='inactive')return'status-inactive';
  }
  if(key==='division'){
    if(val==='LSPD')return'dept-lspd';
    if(val==='BCSO')return'dept-bcso';
    if(val==='ODPD')return'dept-odpd';
  }
  if(key==='shift'){
    if(val==='AU')return'shift-au';
    if(val==='EU')return'shift-eu';
    if(val==='NA')return'shift-na';
  }
  return'';
}

function renderRoster(){
  const container=document.getElementById('roster-container');
  const countEl=document.getElementById('roster-count');
  if(!container||!rosterLoaded)return;
  const q=document.getElementById('roster-search').value.toLowerCase().trim();
  let list=rosterData.filter(row=>{
    for(const[k,v]of Object.entries(rosterFilterState)){if(v&&row[k]!==v)return false;}
    if(q){if(!Object.values(row).join(' ').toLowerCase().includes(q))return false;}
    return true;
  });
  if(rosterSort.col){
    const{col,dir}=rosterSort;
    list=[...list].sort((a,b)=>{
      if(col==='joined')return((a._joinedSort||0)-(b._joinedSort||0))*dir;
      return rosterCompare(col,a[col]||'',b[col]||'')*dir;
    });
  }
  if(countEl)countEl.textContent=list.length+' member'+(list.length!==1?'s':'');
  if(!list.length){container.innerHTML='<div class="roster-status">No members match.</div>';return;}
  const displayCols=ROSTER_COLS.filter(c=>c.show);
  const thead='<tr>'+displayCols.map(c=>{
    const cls=rosterSort.col===c.key?(rosterSort.dir===1?'sort-asc':'sort-desc'):'';
    return`<th class="${cls}" onclick="sortRosterBy('${c.key}')">${escapeHtml(c.label)}</th>`;
  }).join('')+'</tr>';
  const tbody=list.map(row=>'<tr>'+displayCols.map(c=>{
    const val=row[c.key]||'';
    const cls=getCellClass(c.key,val);
    if(c.key==='name'&&row.sheetUrl){
      return`<td><a class="roster-name-link" href="${escapeHtml(row.sheetUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(val)}</a></td>`;
    }
    if(c.key==='discord'&&row.discordLink){
      return`<td><a href="${escapeHtml(row.discordLink)}" target="_blank" rel="noopener noreferrer">${escapeHtml(val)}</a></td>`;
    }
    if(cls)return`<td><span class="${cls}">${escapeHtml(val)}</span></td>`;
    return`<td>${escapeHtml(val)}</td>`;
  }).join('')+'</tr>').join('');
  container.innerHTML=`<div class="roster-tbl-wrap"><table><thead>${thead}</thead><tbody>${tbody}</tbody></table></div>`;
}

window.__pageInits=window.__pageInits||{};
window.__pageInits.roster=function(){if(rosterLoaded){buildRosterFilters();renderRoster();}else loadRoster();};
window.addEventListener('load',loadRoster);
