(()=>{
  const rows=Array.isArray(window.JR_BOM_ROWS)?window.JR_BOM_ROWS:[];
  const style=document.createElement('style');
  style.textContent=`
    .bom-toolbar{display:grid;grid-template-columns:minmax(240px,2fr) minmax(180px,1fr) minmax(180px,1fr) auto;gap:12px;margin-bottom:18px;padding:15px}
    .bom-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:18px}
    .bom-kpi{padding:18px}.bom-kpi span{font-size:12px;color:#6d7890;font-weight:700}.bom-kpi strong{display:block;font-size:29px;margin-top:7px}
    .bom-table{min-width:1120px}.bom-table th{text-align:center;background:#7f1d1d;color:#fff}.bom-table td{text-align:center;vertical-align:middle}
    .bom-table td:nth-child(2),.bom-table td:nth-child(3){text-align:left;font-weight:750}.bom-table tbody tr[data-group-start="true"] td{border-top:3px solid #fecaca}
    .bom-process{display:inline-flex;align-items:center;justify-content:center;min-width:82px;padding:5px 8px;border-radius:999px;background:#fef2f2;color:#991b1b;font-size:11px;font-weight:800}
    .bom-process.empty{background:#f8fafc;color:#94a3b8}.bom-sequence{color:#475569;font-size:11px;white-space:normal;min-width:210px}.bom-source-note{margin-top:10px;color:#64748b;font-size:11px}
    @media(max-width:900px){.bom-toolbar{grid-template-columns:1fr 1fr}.bom-kpis{grid-template-columns:1fr 1fr}}@media(max-width:560px){.bom-toolbar,.bom-kpis{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  const nav=document.querySelector('.nav');
  let button=document.querySelector('[data-view="bom"]');
  if(nav&&!button){button=document.createElement('button');button.className='nav-item';button.dataset.view='bom';button.textContent='BOM Process';nav.insertBefore(button,nav.querySelector('[data-view="planning"]')||nav.querySelector('[data-view="settings"]'));}
  const main=document.querySelector('.main');
  if(main&&!document.getElementById('view-bom')){
    const view=document.createElement('section');view.className='view';view.id='view-bom';
    view.innerHTML=`
      <div class="bom-toolbar card">
        <div class="field"><label>ค้นหา Part Assembly / Single Part No.</label><input id="bomSearch" type="search" placeholder="พิมพ์ Part No."></div>
        <div class="field"><label>Part Assembly</label><select id="bomAssembly"><option value="">All Assembly</option></select></div>
        <div class="field"><label>Process</label><select id="bomProcess"><option value="">All Process</option></select></div>
        <div class="field"><label>&nbsp;</label><button class="btn ghost" id="bomClear">Clear</button></div>
      </div>
      <div class="bom-kpis">
        <article class="card bom-kpi"><span>Assembly Groups</span><strong id="bomKpiAssembly">0</strong></article>
        <article class="card bom-kpi"><span>Single Parts</span><strong id="bomKpiParts">0</strong></article>
        <article class="card bom-kpi"><span>Processes</span><strong id="bomKpiProcesses">0</strong></article>
        <article class="card bom-kpi"><span>BOM Rows</span><strong id="bomKpiRows">0</strong></article>
      </div>
      <article class="card panel"><div class="panel-head"><div><h2>BOM Auto Part</h2><p>ลำดับกระบวนการของ Part Assembly และ Single Part No. จากไฟล์ BOM</p></div><span class="badge" id="bomCount">0 rows</span></div>
        <div class="table-wrap large"><table class="bom-table"><thead><tr><th>#</th><th>Part Assembly</th><th>Single Part No.</th><th>Process 1</th><th>Process 2</th><th>Process 3</th><th>Process 4</th><th>Process 5</th><th>Process 6</th><th>Process Flow</th></tr></thead><tbody id="bomBody"></tbody></table></div>
        <div class="bom-source-note">Source: BOM Auto part.xlsx · แสดงข้อมูลตามลำดับที่บันทึกในชีต Bom</div>
      </article>`;
    main.appendChild(view);
  }

  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=v=>String(v??'').trim();
  const usableAssembly=v=>{const x=norm(v);return x&&x!=='-';};
  let current='';
  const data=rows.map((r,i)=>{
    const explicit=usableAssembly(r.assembly)?norm(r.assembly):'';
    if(explicit)current=explicit;
    const assembly=current||norm(r.partNo);
    const out={...r,index:i+1,assemblyResolved:assembly,groupStart:!!explicit};
    if(current&&norm(r.partNo)===current)current='';
    return out;
  }).filter(r=>norm(r.partNo));
  const assemblies=[...new Set(data.map(r=>r.assemblyResolved).filter(Boolean))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
  const processes=[...new Set(data.flatMap(r=>r.processes||[]).map(norm).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  const assemblySel=document.getElementById('bomAssembly'),processSel=document.getElementById('bomProcess'),search=document.getElementById('bomSearch');
  assemblySel.innerHTML='<option value="">All Assembly</option>'+assemblies.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
  processSel.innerHTML='<option value="">All Process</option>'+processes.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
  const render=()=>{
    const q=norm(search.value).toLowerCase(),a=assemblySel.value,p=processSel.value;
    const filtered=data.filter(r=>(!q||`${r.assemblyResolved} ${r.partNo}`.toLowerCase().includes(q))&&(!a||r.assemblyResolved===a)&&(!p||(r.processes||[]).includes(p)));
    document.getElementById('bomBody').innerHTML=filtered.map(r=>{
      const ps=Array.from({length:6},(_,i)=>norm((r.processes||[])[i]));
      const cells=ps.map(x=>`<td><span class="bom-process ${x?'':'empty'}">${esc(x||'-')}</span></td>`).join('');
      const flow=ps.filter(Boolean).join(' → ');
      return `<tr data-group-start="${r.groupStart}"><td>${r.index}</td><td>${esc(r.assemblyResolved)}</td><td>${esc(r.partNo)}</td>${cells}<td class="bom-sequence">${esc(flow||'-')}</td></tr>`;
    }).join('')||'<tr><td colspan="10" class="empty">ไม่พบข้อมูล BOM ตามตัวกรอง</td></tr>';
    document.getElementById('bomCount').textContent=`${filtered.length} rows`;
    document.getElementById('bomKpiAssembly').textContent=new Set(filtered.map(r=>r.assemblyResolved)).size;
    document.getElementById('bomKpiParts').textContent=new Set(filtered.map(r=>r.partNo)).size;
    document.getElementById('bomKpiProcesses').textContent=new Set(filtered.flatMap(r=>r.processes||[]).filter(Boolean)).size;
    document.getElementById('bomKpiRows').textContent=filtered.length;
  };
  [search,assemblySel,processSel].forEach(el=>el.addEventListener(el===search?'input':'change',render));
  document.getElementById('bomClear').addEventListener('click',()=>{search.value='';assemblySel.value='';processSel.value='';render();});
  button?.addEventListener('click',()=>{if(typeof showView==='function')showView('bom');else{document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));document.getElementById('view-bom')?.classList.add('active');}document.getElementById('pageTitle').textContent='BOM Process';});
  render();
})();
