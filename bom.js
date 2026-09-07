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
    .bom-flow-panel{margin-bottom:18px}.bom-flow-head{display:flex;justify-content:space-between;gap:14px;align-items:end;margin-bottom:18px}.bom-flow-head .field{min-width:260px}
    .bom-flow-title{max-width:620px;margin:0 auto 22px;padding:11px 24px;border-radius:12px;background:linear-gradient(135deg,#075092,#063d72);color:#fff;text-align:center;font-size:28px;font-weight:950;letter-spacing:.5px;box-shadow:0 8px 20px rgba(7,80,146,.2)}
    .bom-fishbone{min-height:310px;padding:24px;border:1px solid #dbe3ee;border-radius:16px;background:linear-gradient(135deg,#f8fbff,#fff);overflow-x:auto}
    .bom-flow-canvas{display:grid;grid-template-columns:minmax(760px,1fr) 56px minmax(160px,190px);align-items:end;min-width:990px}
    .bom-flow-grid{display:grid;grid-template-columns:repeat(var(--steps),minmax(120px,1fr));grid-template-rows:auto 58px auto;column-gap:10px;align-items:end}
    .bom-feed-slot{grid-row:1;display:grid;justify-items:center;align-self:stretch;position:relative;padding:0 4px 16px}.bom-feed-slot:after{content:"";position:absolute;left:50%;bottom:-1px;width:4px;height:20px;background:#0b4f8c}.bom-feed-slot:before{content:"";position:absolute;left:calc(50% - 7px);bottom:-1px;border-left:9px solid transparent;border-right:9px solid transparent;border-top:13px solid #0b4f8c;transform:translateY(12px)}
    .bom-part-card{display:grid;grid-template-columns:70px minmax(95px,1fr);gap:10px;align-items:center;width:100%;max-width:220px;padding:9px;border:2px solid #075092;border-radius:10px;background:linear-gradient(180deg,#eaf7ff,#d9edfb);color:#102033;box-shadow:0 5px 12px rgba(2,95,155,.12)}
    .bom-part-image,.bom-final-image{width:76px;height:62px;border-radius:9px;object-fit:cover;background:#e2e8f0;border:2px solid rgba(255,255,255,.75)}.bom-final-image{width:118px;height:92px}
    .bom-part-name{font-weight:950;word-break:break-word}.bom-qty{margin-top:3px;font-size:11px;font-weight:850}.bom-mini-flow{margin-top:5px;font-size:10px;line-height:1.4;color:#075092}.bom-image-actions{display:flex;gap:5px;flex-wrap:wrap}.bom-upload{margin-top:6px;border:1px solid #93c5fd;background:#fff;color:#075092;border-radius:7px;padding:4px 7px;font-size:10px;font-weight:800;cursor:pointer}.bom-upload.remove{border-color:#fecaca;color:#b91c1c}
    .bom-spine{grid-row:3;display:contents}.bom-step{display:flex;align-items:center;min-width:0}.bom-node{flex:1;padding:13px 8px;border:2px solid #c35b00;border-radius:9px;background:linear-gradient(180deg,#ffb03b,#ff9228);color:#111827;font-weight:950;text-align:center;box-shadow:0 5px 12px rgba(249,115,22,.16)}.bom-node.assembly{background:linear-gradient(180deg,#ffb03b,#ff9228)}.bom-node-arrow{width:20px;flex:none;color:#075092;font-size:25px;font-weight:950;text-align:center}.bom-final-arrow{height:4px;background:#075092;position:relative;margin-bottom:42px}.bom-final-arrow:after{content:"";position:absolute;right:-1px;top:-7px;border-left:14px solid #075092;border-top:9px solid transparent;border-bottom:9px solid transparent}.bom-final-card{display:grid;justify-items:center;gap:8px;padding:14px;border:2px solid #17832e;border-radius:10px;background:linear-gradient(180deg,#edfbe9,#cef3c7);color:#102033;text-align:center;box-shadow:0 6px 16px rgba(7,148,71,.15)}.bom-final-card strong{font-size:16px;word-break:break-word}.bom-empty-image{display:grid;place-items:center;color:#64748b;font-size:10px;text-align:center;padding:5px}
    .bom-table-image{width:54px;height:44px;object-fit:cover;border-radius:7px;background:#e2e8f0}.bom-table-upload{display:block;margin:4px auto 0;border:0;border-radius:6px;background:#2563eb;color:#fff;padding:4px 7px;font-size:9px;cursor:pointer}
    @media(max-width:900px){.bom-toolbar{grid-template-columns:1fr 1fr}.bom-kpis{grid-template-columns:1fr 1fr}}@media(max-width:560px){.bom-toolbar,.bom-kpis{grid-template-columns:1fr}.bom-flow-head{display:grid}.bom-flow-head .field{min-width:0}.bom-flow-title{font-size:21px}.bom-part-card{grid-template-columns:60px 1fr}}
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
      <article class="card panel bom-flow-panel"><div class="bom-flow-head"><div><h2>BOM Flow / แผนผังก้างปลา</h2><p>ชิ้นส่วนและลำดับ Process ไหลเข้าสู่ Final Part</p></div><div class="field"><label>เลือก Part Assembly ที่ต้องการดู</label><select id="bomDiagramAssembly"></select></div></div><div class="bom-flow-title">BOM PROCESS FLOW</div><div id="bomFishbone" class="bom-fishbone"></div></article>
      <article class="card panel"><div class="panel-head"><div><h2>BOM Auto Part</h2><p>ลำดับกระบวนการของ Part Assembly และ Single Part No. จากไฟล์ BOM</p></div><span class="badge" id="bomCount">0 rows</span></div>
        <div class="table-wrap large"><table class="bom-table"><thead><tr><th>#</th><th>Image</th><th>Part Assembly</th><th>Single Part No.</th><th>Process 1</th><th>Process 2</th><th>Process 3</th><th>Process 4</th><th>Process 5</th><th>Process 6</th><th>Process Flow</th></tr></thead><tbody id="bomBody"></tbody></table></div>
        <div class="bom-source-note">Source: BOM Auto part.xlsx · แสดงข้อมูลตามลำดับที่บันทึกในชีต Bom</div>
        <input id="bomImageInput" type="file" accept="image/*" hidden>
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
  const assemblySel=document.getElementById('bomAssembly'),diagramSel=document.getElementById('bomDiagramAssembly'),processSel=document.getElementById('bomProcess'),search=document.getElementById('bomSearch');
  assemblySel.innerHTML='<option value="">All Assembly</option>'+assemblies.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
  diagramSel.innerHTML=assemblies.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
  processSel.innerHTML='<option value="">All Process</option>'+processes.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
  const imageKey=p=>`jr_bom_image_${p}`;
  const imageFor=p=>{try{return localStorage.getItem(imageKey(p))||''}catch(_){return''}};
  const imageHtml=(p,cls)=>imageFor(p)?`<img class="${cls}" src="${imageFor(p)}" alt="${esc(p)}">`:`<div class="${cls} bom-empty-image">No image</div>`;
  const imageActions=p=>`<div class="bom-image-actions"><button class="bom-upload" data-upload-part="${esc(p)}">ใส่/เปลี่ยนรูป</button>${imageFor(p)?`<button class="bom-upload remove" data-remove-part="${esc(p)}">ลบรูป</button>`:''}</div>`;
  const renderFishbone=()=>{
    const selected=diagramSel.value||assemblies[0]||'',members=data.filter(r=>r.assemblyResolved===selected);
    const finalRow=members.find(r=>norm(r.partNo)===selected)||members[members.length-1];
    const components=members.filter(r=>r!==finalRow);
    const shown=components.length?components:members;
    const central=(finalRow?.processes||[]).map(norm).filter(Boolean);
    const steps=central.length?central:['FINAL PROCESS'];
    const feederSlots=shown.map((r,i)=>{
      const supply=/supply/i.test((r.processes||[]).filter(Boolean).join(' '));
      const joinCandidates=steps.map((p,idx)=>/assembly|welding|rubber|ประกอบ|เชื่อม/i.test(p)?idx:-1).filter(idx=>idx>=0);
      const col=i===0&&!supply?1:(joinCandidates[Math.min(i-(shown[0]&&!/supply/i.test((shown[0].processes||[]).join(' '))?1:0),joinCandidates.length-1)]??Math.min(i,steps.length-1))+1;
      return `<div class="bom-feed-slot" style="grid-column:${Math.max(1,col)}"><div class="bom-part-card">${imageHtml(r.partNo,'bom-part-image')}<div><div class="bom-part-name">${esc(r.partNo)}</div><div class="bom-qty">QTY 1</div><div class="bom-mini-flow">${esc((r.processes||[]).filter(Boolean).join(' → ')||'รอระบุ Process')}</div>${imageActions(r.partNo)}</div></div></div>`;
    }).join('');
    const spine=steps.map((p,i)=>`<div class="bom-step" style="grid-column:${i+1}">${i?'<span class="bom-node-arrow">→</span>':''}<span class="bom-node ${/assembly|welding|เชื่อม|ประกอบ/i.test(p)?'assembly':''}">${esc(p)}</span></div>`).join('');
    document.getElementById('bomFishbone').innerHTML=`<div class="bom-flow-canvas"><div class="bom-flow-grid" style="--steps:${steps.length}">${feederSlots}<div class="bom-spine">${spine}</div></div><div class="bom-final-arrow"></div><div class="bom-final-card">${imageHtml(selected,'bom-final-image')}<strong>FINAL PART:<br>${esc(selected)}</strong>${imageActions(selected)}</div></div>`;
  };
  const render=()=>{
    const q=norm(search.value).toLowerCase(),a=assemblySel.value,p=processSel.value;
    const filtered=data.filter(r=>(!q||`${r.assemblyResolved} ${r.partNo}`.toLowerCase().includes(q))&&(!a||r.assemblyResolved===a)&&(!p||(r.processes||[]).includes(p)));
    document.getElementById('bomBody').innerHTML=filtered.map(r=>{
      const ps=Array.from({length:6},(_,i)=>norm((r.processes||[])[i]));
      const cells=ps.map(x=>`<td><span class="bom-process ${x?'':'empty'}">${esc(x||'-')}</span></td>`).join('');
      const flow=ps.filter(Boolean).join(' → ');
      return `<tr data-group-start="${r.groupStart}"><td>${r.index}</td><td>${imageHtml(r.partNo,'bom-table-image')}<button class="bom-table-upload" data-upload-part="${esc(r.partNo)}">ใส่รูป</button></td><td>${esc(r.assemblyResolved)}</td><td>${esc(r.partNo)}</td>${cells}<td class="bom-sequence">${esc(flow||'-')}</td></tr>`;
    }).join('')||'<tr><td colspan="11" class="empty">ไม่พบข้อมูล BOM ตามตัวกรอง</td></tr>';
    document.getElementById('bomCount').textContent=`${filtered.length} rows`;
    document.getElementById('bomKpiAssembly').textContent=new Set(filtered.map(r=>r.assemblyResolved)).size;
    document.getElementById('bomKpiParts').textContent=new Set(filtered.map(r=>r.partNo)).size;
    document.getElementById('bomKpiProcesses').textContent=new Set(filtered.flatMap(r=>r.processes||[]).filter(Boolean)).size;
    document.getElementById('bomKpiRows').textContent=filtered.length;
    renderFishbone();
  };
  [search,assemblySel,processSel].forEach(el=>el.addEventListener(el===search?'input':'change',render));
  document.getElementById('bomClear').addEventListener('click',()=>{search.value='';assemblySel.value='';processSel.value='';render();});
  assemblySel.addEventListener('change',()=>{if(assemblySel.value)diagramSel.value=assemblySel.value;renderFishbone();});
  diagramSel.addEventListener('change',renderFishbone);
  let pendingPart='';const imageInput=document.getElementById('bomImageInput');
  document.getElementById('view-bom').addEventListener('click',e=>{const remove=e.target.closest('[data-remove-part]');if(remove){try{localStorage.removeItem(imageKey(remove.dataset.removePart));render();showToast('ลบรูป '+remove.dataset.removePart+' แล้ว')}catch(_){showToast('ไม่สามารถลบรูปได้')}return}const b=e.target.closest('[data-upload-part]');if(!b)return;pendingPart=b.dataset.uploadPart;imageInput.value='';imageInput.click();});
  imageInput.addEventListener('change',()=>{const file=imageInput.files?.[0];if(!file||!pendingPart)return;const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const max=640,scale=Math.min(1,max/Math.max(img.width,img.height)),canvas=document.createElement('canvas');canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);try{localStorage.setItem(imageKey(pendingPart),canvas.toDataURL('image/jpeg',.82));render();showToast('บันทึกรูป '+pendingPart+' แล้ว')}catch(_){showToast('รูปมีขนาดใหญ่เกินไป กรุณาเลือกรูปที่เล็กลง')}};img.src=reader.result};reader.readAsDataURL(file);});
  button?.addEventListener('click',()=>{if(typeof showView==='function')showView('bom');else{document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));document.getElementById('view-bom')?.classList.add('active');}document.getElementById('pageTitle').textContent='BOM Process';});
  render();
})();
