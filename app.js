const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbzrNCLwRIt71fF6KiKnBltlc7dXvmJkwvRZKi7QILFAbrCYqaGMzQ_L9FryUkKRYDgT/exec';
const state = { rows: [], filtered: [], apiUrl: localStorage.getItem('jr_capacity_api_url') || DEFAULT_API_URL };

const $ = (id) => document.getElementById(id);
const fmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

const els = {
  processFilter: $('processFilter'), machineFilter: $('machineFilter'), stepFilter: $('stepFilter'), searchInput: $('searchInput'),
  capacityBody: $('capacityBody'), previewBody: $('previewBody'), partBars: $('partBars'), machineBars: $('machineBars'),
  efficiencySelect: $('efficiencySelect'), apiUrlInput: $('apiUrlInput'), connectionMessage: $('connectionMessage'),
  connectionDot: $('connectionDot'), connectionText: $('connectionText'), lastUpdated: $('lastUpdated')
};

function normalizeText(v){ return String(v ?? '').trim(); }
function toNumber(v){
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const n = Number(String(v ?? '').replace(/,/g,'').replace(/%/g,'').trim());
  return Number.isFinite(n) ? n : 0;
}
function unique(list){ return [...new Set(list.map(normalizeText).filter(Boolean))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})); }
function escapeHtml(v){ return String(v ?? '').replace(/[&<>'"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function showToast(msg){ const el=$('toast'); el.textContent=msg; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),2200); }

function setConnection(ok, message){
  els.connectionDot.classList.remove('ok','bad'); els.connectionDot.classList.add(ok?'ok':'bad');
  els.connectionText.textContent = ok ? 'เชื่อมต่อแล้ว' : 'ยังไม่ได้เชื่อมต่อ';
  els.connectionMessage.className = `message ${ok?'ok':'bad'}`; els.connectionMessage.textContent = message || '';
}

function canonicalRow(r, index){
  const pick = (...keys) => { for (const k of keys) if (r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== '') return r[k]; return ''; };
  const speed = toNumber(pick('speed','Speed','speed 1 min./pcs','Speed 1 min./pcs','1 min/pcs','Production time (minutes)','生产工时（分钟）'));
  const cap100Raw = pick('100%','100','Capacity 100%','cap100');
  const cap90Raw = pick('90%','90','Capacity 90%','cap90');
  const cap85Raw = pick('85%','85','Capacity 85%','cap85');
  // If the sheet does not contain calculated capacity, derive pieces/hour from minutes/piece.
  const derived100 = speed > 0 ? 60 / speed : 0;
  return {
    item: normalizeText(pick('Item','item')) || String(index+1),
    partName: normalizeText(pick('Part Name','Part Name.','PART NAME','PartName')),
    partNo: normalizeText(pick('Part No.','Part No','PART NO','PartNo')),
    speed,
    cap100: cap100Raw !== '' ? toNumber(cap100Raw) : derived100,
    cap90: cap90Raw !== '' ? toNumber(cap90Raw) : derived100 * .90,
    cap85: cap85Raw !== '' ? toNumber(cap85Raw) : derived100 * .85,
    process: normalizeText(pick('Process','PROCESS')),
    machine: normalizeText(pick('M/C','MC','Machine','MACHINE')),
    step: normalizeText(pick('Step','STEP')),
    raw: r
  };
}

function populateSelect(select, values, firstLabel){
  const current=select.value; select.innerHTML=`<option value="">${firstLabel}</option>` + values.map(v=>`<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join('');
  if(values.includes(current)) select.value=current;
}

function rebuildFilters(){
  populateSelect(els.processFilter, unique(state.rows.map(r=>r.process)), 'All Process');
  // split multiple machines like "M/C1, M/C2" only for filter choices while preserving original display
  const machines = state.rows.flatMap(r=>r.machine.split(/[,;/|]+/).map(s=>s.trim()).filter(Boolean));
  populateSelect(els.machineFilter, unique(machines), 'All Machine');
  populateSelect(els.stepFilter, unique(state.rows.map(r=>r.step)), 'All Step');
}

function applyFilters(){
  const q=normalizeText(els.searchInput.value).toLowerCase(); const p=els.processFilter.value; const m=els.machineFilter.value; const s=els.stepFilter.value;
  state.filtered = state.rows.filter(r => {
    const hay=[r.item,r.partName,r.partNo,r.process,r.machine,r.step].join(' ').toLowerCase();
    const machineTokens=r.machine.split(/[,;/|]+/).map(x=>x.trim());
    return (!q || hay.includes(q)) && (!p || r.process===p) && (!m || machineTokens.includes(m) || r.machine===m) && (!s || r.step===s);
  });
  renderAll();
}

function rowHtml(r){
  return `<tr><td>${escapeHtml(r.item)}</td><td>${escapeHtml(r.partName)}</td><td><strong>${escapeHtml(r.partNo)}</strong></td><td class="num">${r.speed?fmt.format(r.speed):'-'}</td><td class="num">${r.cap100?fmt.format(r.cap100):'-'}</td><td class="num">${r.cap90?fmt.format(r.cap90):'-'}</td><td class="num">${r.cap85?fmt.format(r.cap85):'-'}</td><td>${escapeHtml(r.process)}</td><td>${escapeHtml(r.machine)}</td><td>${escapeHtml(r.step)}</td></tr>`;
}
function renderTable(){
  const html=state.filtered.length ? state.filtered.map(rowHtml).join('') : '<tr><td class="empty" colspan="10">ไม่พบข้อมูล</td></tr>';
  els.capacityBody.innerHTML=html; els.previewBody.innerHTML=state.filtered.length?state.filtered.slice(0,20).map(rowHtml).join(''):'<tr><td class="empty" colspan="10">ไม่พบข้อมูล</td></tr>';
  $('tableCount').textContent=`${state.filtered.length} rows`; $('previewCount').textContent=`${state.filtered.length} rows`;
}
function renderKpis(){
  $('kpiParts').textContent=unique(state.filtered.map(r=>r.partNo)).length;
  $('kpiMachines').textContent=unique(state.filtered.flatMap(r=>r.machine.split(/[,;/|]+/))).length;
  $('kpiProcesses').textContent=unique(state.filtered.map(r=>r.process)).length;
  $('kpiRows').textContent=state.filtered.length;
}
function renderBars(){
  const eff=els.efficiencySelect.value; const key=eff==='100'?'cap100':eff==='85'?'cap85':'cap90';
  const partMap=new Map();
  state.filtered.forEach(r=>{ if(!r.partNo) return; partMap.set(r.partNo,(partMap.get(r.partNo)||0)+toNumber(r[key])); });
  const partData=[...partMap.entries()].sort((a,b)=>b[1]-a[1]).slice(0,10); const maxPart=Math.max(1,...partData.map(x=>x[1]));
  els.partBars.innerHTML=partData.length?partData.map(([label,val])=>`<div class="bar-row"><div class="bar-label" title="${escapeHtml(label)}">${escapeHtml(label)}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(1,val/maxPart*100)}%"></div></div><div class="bar-value">${fmt.format(val)}</div></div>`).join(''):'<div class="empty">ไม่มีข้อมูล</div>';

  const machineMap=new Map();
  state.filtered.forEach(r=>r.machine.split(/[,;/|]+/).map(x=>x.trim()).filter(Boolean).forEach(mc=>machineMap.set(mc,(machineMap.get(mc)||0)+1)));
  const machineData=[...machineMap.entries()].sort((a,b)=>b[1]-a[1]).slice(0,10); const maxMachine=Math.max(1,...machineData.map(x=>x[1]));
  els.machineBars.innerHTML=machineData.length?machineData.map(([label,val])=>`<div class="bar-row"><div class="bar-label" title="${escapeHtml(label)}">${escapeHtml(label)}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(1,val/maxMachine*100)}%"></div></div><div class="bar-value">${val} rows</div></div>`).join(''):'<div class="empty">ไม่มีข้อมูล</div>';
}
function renderAll(){ renderTable(); renderKpis(); renderBars(); }

async function fetchJson(url){
  const response = await fetch(url, { method:'GET', cache:'no-store', redirect:'follow' });
  if(!response.ok) throw new Error(`HTTP ${response.status}`);
  const text=await response.text();
  try { return JSON.parse(text); } catch { throw new Error('Apps Script ไม่ได้ส่ง JSON กลับมา ตรวจสอบการ Deploy และสิทธิ์ Access'); }
}
async function loadData(showMessage=true){
  if(!state.apiUrl){ setConnection(false,'กรุณาใส่ Apps Script Web App URL ก่อน'); showView('settings'); return; }
  try{
    els.lastUpdated.textContent='กำลังโหลดข้อมูล…';
    const join=state.apiUrl.includes('?')?'&':'?'; const data=await fetchJson(`${state.apiUrl}${join}action=capacity&t=${Date.now()}`);
    if(data.ok===false) throw new Error(data.error||'Unknown API error');
    const rows=Array.isArray(data)?data:(data.rows||data.data||[]);
    state.rows=rows.map(canonicalRow).filter(r=>r.partNo||r.partName||r.process||r.machine);
    state.filtered=[...state.rows]; rebuildFilters(); renderAll();
    const stamp=data.updatedAt ? new Date(data.updatedAt) : new Date();
    els.lastUpdated.textContent=`อัปเดตล่าสุด ${stamp.toLocaleString('th-TH')}`;
    setConnection(true,`เชื่อมต่อสำเร็จ พบ ${state.rows.length} แถว`); if(showMessage) showToast('โหลดข้อมูลสำเร็จ');
  }catch(err){
    state.rows=[];state.filtered=[];renderAll();els.lastUpdated.textContent='โหลดข้อมูลไม่สำเร็จ';setConnection(false,err.message);if(showMessage)showToast('เชื่อมต่อไม่สำเร็จ');
  }
}

function exportCsv(){
  if(!state.filtered.length){showToast('ไม่มีข้อมูลสำหรับ Export');return;}
  const header=['Item','Part Name','Part No.','speed 1 min./pcs','100%','90%','85%','Process','M/C','Step'];
  const quote=v=>`"${String(v??'').replace(/"/g,'""')}"`;
  const lines=[header,...state.filtered.map(r=>[r.item,r.partName,r.partNo,r.speed,r.cap100,r.cap90,r.cap85,r.process,r.machine,r.step])].map(row=>row.map(quote).join(','));
  const blob=new Blob(['\uFEFF'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'}); const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`JR_Capacity_${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(a.href);
}

function showView(name){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active')); document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
  $(`view-${name}`).classList.add('active'); $('pageTitle').textContent=name==='dashboard'?'Capacity Dashboard':name==='capacity'?'Capacity Table':'Connection Settings'; $('sidebar').classList.remove('open');
}

document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
['input','change'].forEach(ev=>els.searchInput.addEventListener(ev,applyFilters)); [els.processFilter,els.machineFilter,els.stepFilter].forEach(el=>el.addEventListener('change',applyFilters));
els.efficiencySelect.addEventListener('change',renderBars);
$('clearFilterBtn').addEventListener('click',()=>{els.searchInput.value='';els.processFilter.value='';els.machineFilter.value='';els.stepFilter.value='';applyFilters();});
$('refreshBtn').addEventListener('click',()=>loadData(true)); $('exportBtn').addEventListener('click',exportCsv);
$('menuBtn').addEventListener('click',()=>$('sidebar').classList.toggle('open'));
$('saveApiBtn').addEventListener('click',()=>{const url=normalizeText(els.apiUrlInput.value);if(!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec/i.test(url)){setConnection(false,'URL ต้องเป็น Apps Script Web App และลงท้ายด้วย /exec');return;}state.apiUrl=url;localStorage.setItem('jr_capacity_api_url',url);loadData(true);});
$('testApiBtn').addEventListener('click',()=>{state.apiUrl=normalizeText(els.apiUrlInput.value)||state.apiUrl;loadData(true);});

els.apiUrlInput.value=state.apiUrl;
if(state.apiUrl) loadData(false); else { renderAll(); setConnection(false,'กรุณา Deploy Code.gs แล้วนำ Web App URL มาใส่ในหน้า Connection'); }
