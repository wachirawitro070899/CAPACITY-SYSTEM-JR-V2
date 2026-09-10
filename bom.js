(()=>{
  const sourceRows=Array.isArray(window.JR_BOM_ROWS)?window.JR_BOM_ROWS:[];
  const DATA_KEY='jr_bom_rows_v2',OUTPUT_KEY='jr_bom_output_parts_v2';
  const readStore=(key,fallback)=>{try{const value=JSON.parse(localStorage.getItem(key));return value??fallback}catch(_){return fallback}};
  let rows=readStore(DATA_KEY,sourceRows),outputParts=readStore(OUTPUT_KEY,{});
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
    .bom-flow-grid{display:grid;grid-template-columns:repeat(var(--steps),minmax(120px,1fr));grid-template-rows:auto auto 58px auto;column-gap:10px;align-items:end}
    .bom-drag-hint{grid-column:1/-1;margin:0 0 10px;color:#075092;font-size:12px;font-weight:800;text-align:center}.bom-feed-slot{grid-row:2;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:8px;align-self:stretch;position:relative;min-height:76px;padding:6px 4px 17px;border:2px dashed transparent;border-radius:12px;transition:.15s}.bom-feed-slot:after{content:"";position:absolute;left:50%;bottom:-1px;width:4px;height:20px;background:#0b4f8c}.bom-feed-slot:before{content:"";position:absolute;left:calc(50% - 7px);bottom:-1px;border-left:9px solid transparent;border-right:9px solid transparent;border-top:13px solid #0b4f8c;transform:translateY(12px)}.bom-feed-slot.drag-over{border-color:#2563eb;background:#dbeafe}.bom-feed-slot:empty{border-color:#dbe3ee}.bom-feed-slot:empty:after,.bom-feed-slot:empty:before{opacity:.35}
    .bom-part-card{display:grid;grid-template-columns:70px minmax(95px,1fr);gap:10px;align-items:center;width:100%;max-width:220px;padding:9px;border:2px solid #075092;border-radius:10px;background:linear-gradient(180deg,#eaf7ff,#d9edfb);color:#102033;box-shadow:0 5px 12px rgba(2,95,155,.12);cursor:grab}.bom-part-card:active{cursor:grabbing}.bom-part-card.dragging{opacity:.45;transform:scale(.97)}
    .bom-part-image,.bom-final-image{width:76px;height:62px;border-radius:9px;object-fit:cover;background:#e2e8f0;border:2px solid rgba(255,255,255,.75)}.bom-final-image{width:118px;height:92px}
    .bom-part-name{font-weight:950;word-break:break-word}.bom-qty{margin-top:3px;font-size:11px;font-weight:850}.bom-mini-flow{margin-top:5px;font-size:10px;line-height:1.4;color:#075092}.bom-image-actions{display:flex;gap:5px;flex-wrap:wrap}.bom-upload{margin-top:6px;border:1px solid #93c5fd;background:#fff;color:#075092;border-radius:7px;padding:4px 7px;font-size:10px;font-weight:800;cursor:pointer}.bom-upload.remove{border-color:#fecaca;color:#b91c1c}
    .bom-spine{display:contents}.bom-step{grid-row:4;display:flex;align-items:center;min-width:0}.bom-node{flex:1;padding:13px 8px;border:2px solid #c35b00;border-radius:9px;background:linear-gradient(180deg,#ffb03b,#ff9228);color:#111827;font-weight:950;text-align:center;box-shadow:0 5px 12px rgba(249,115,22,.16)}.bom-node.assembly{background:linear-gradient(180deg,#ffb03b,#ff9228)}.bom-node-arrow{width:20px;flex:none;color:#075092;font-size:25px;font-weight:950;text-align:center}.bom-final-arrow{height:4px;background:#075092;position:relative;margin-bottom:42px}.bom-final-arrow:after{content:"";position:absolute;right:-1px;top:-7px;border-left:14px solid #075092;border-top:9px solid transparent;border-bottom:9px solid transparent}.bom-final-card{display:grid;justify-items:center;gap:8px;padding:14px;border:2px solid #17832e;border-radius:10px;background:linear-gradient(180deg,#edfbe9,#cef3c7);color:#102033;text-align:center;box-shadow:0 6px 16px rgba(7,148,71,.15)}.bom-final-card strong{font-size:16px;word-break:break-word}.bom-empty-image{display:grid;place-items:center;color:#64748b;font-size:10px;text-align:center;padding:5px}
    .bom-table-image{width:54px;height:44px;object-fit:cover;border-radius:7px;background:#e2e8f0}.bom-table-upload{display:block;margin:4px auto 0;border:0;border-radius:6px;background:#2563eb;color:#fff;padding:4px 7px;font-size:9px;cursor:pointer}
    .bom-editor{margin-bottom:18px;padding:18px}.bom-editor[hidden]{display:none}.bom-editor-grid{display:grid;grid-template-columns:repeat(4,minmax(150px,1fr));gap:12px}.bom-editor-actions{display:flex;gap:8px;align-items:end;flex-wrap:wrap}.bom-editor-note{margin:10px 0 0;color:#64748b;font-size:11px}.bom-row-actions{display:flex;gap:5px;justify-content:center}.bom-row-actions button{border:0;border-radius:7px;padding:5px 8px;font-size:10px;font-weight:800;cursor:pointer}.bom-edit-row{background:#dbeafe;color:#1d4ed8}.bom-delete-row{background:#fee2e2;color:#b91c1c}.bom-result-change{display:block;margin-top:4px;color:#b45309;font-size:10px;font-weight:850}.bom-output-note{margin-top:7px;padding:5px 8px;border-radius:7px;background:#fff7ed;color:#9a3412;font-size:10px;font-weight:800}
    @media(max-width:900px){.bom-toolbar,.bom-editor-grid{grid-template-columns:1fr 1fr}.bom-kpis{grid-template-columns:1fr 1fr}}@media(max-width:560px){.bom-toolbar,.bom-kpis,.bom-editor-grid{grid-template-columns:1fr}.bom-flow-head{display:grid}.bom-flow-head .field{min-width:0}.bom-flow-title{font-size:21px}.bom-part-card{grid-template-columns:60px 1fr}}
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
        <div class="field"><label>&nbsp;</label><div class="button-row"><button class="btn ghost" id="bomClear">Clear</button><button class="btn primary" id="bomOpenEditor">+ เพิ่ม / แก้ไข BOM</button></div></div>
      </div>
      <article class="card bom-editor" id="bomEditor" hidden><div class="panel-head"><div><h2 id="bomEditorTitle">เพิ่มรายการ BOM</h2><p>กำหนด Part, Component, Process และ Part No. หลังประกอบ</p></div><button class="btn ghost" id="bomCloseEditor">ปิด</button></div><form id="bomForm"><div class="bom-editor-grid">
        <div class="field"><label>กลุ่ม Assembly / Final Part *</label><input id="bomEditAssembly" required placeholder="เช่น TM-755A-1"></div>
        <div class="field"><label>Part No. / Component *</label><input id="bomEditPart" required placeholder="เช่น TM-755A-1-2"></div>
        <div class="field"><label>Part No. หลังประกอบ</label><input id="bomEditOutput" placeholder="เว้นว่าง = ใช้ Part No. เดิม"></div>
        <div class="field"><label>ประเภท</label><select id="bomEditType"><option value="Part">Part</option><option value="Component">Component</option><option value="Final Part">Final Part</option></select></div>
        ${Array.from({length:6},(_,i)=>`<div class="field"><label>Process ${i+1}</label><input id="bomEditProcess${i+1}" list="bomProcessList" placeholder="เลือกหรือพิมพ์เพิ่ม"></div>`).join('')}
        <div class="bom-editor-actions"><button class="btn primary" type="submit">บันทึก</button><button class="btn ghost" type="button" id="bomResetForm">ล้างฟอร์ม</button></div>
      </div><datalist id="bomProcessList"><option value="Stamping"><option value="Welding"><option value="Assembly"><option value="Sorting"><option value="Rubber Cap Assembly"><option value="Packing"><option value="Finished Part"><option value="Supply"></datalist><p class="bom-editor-note">ถ้า Part No. หลังประกอบไม่เปลี่ยน ให้เว้นช่องไว้หรือกรอกเลขเดิม ระบบจะแสดงเส้นทางต่อเนื่องโดยใช้ Part No. เดิม</p></form></article>
      <div class="bom-kpis">
        <article class="card bom-kpi"><span>Assembly Groups</span><strong id="bomKpiAssembly">0</strong></article>
        <article class="card bom-kpi"><span>Single Parts</span><strong id="bomKpiParts">0</strong></article>
        <article class="card bom-kpi"><span>Processes</span><strong id="bomKpiProcesses">0</strong></article>
        <article class="card bom-kpi"><span>BOM Rows</span><strong id="bomKpiRows">0</strong></article>
      </div>
      <article class="card panel bom-flow-panel"><div class="bom-flow-head"><div><h2>BOM Flow / แผนผังก้างปลา</h2><p>ชิ้นส่วนและลำดับ Process ไหลเข้าสู่ Final Part</p></div><div class="field"><label>เลือก Part Assembly ที่ต้องการดู</label><select id="bomDiagramAssembly"></select></div></div><div class="bom-flow-title">BOM PROCESS FLOW</div><div id="bomFishbone" class="bom-fishbone"></div></article>
      <article class="card panel"><div class="panel-head"><div><h2>BOM Auto Part</h2><p>ลำดับกระบวนการของ Part Assembly และ Single Part No. จากไฟล์ BOM</p></div><span class="badge" id="bomCount">0 rows</span></div>
        <div class="table-wrap large"><table class="bom-table"><thead><tr><th>#</th><th>Image</th><th>Part Assembly</th><th>Part / Component</th><th>Part No. หลังประกอบ</th><th>Process 1</th><th>Process 2</th><th>Process 3</th><th>Process 4</th><th>Process 5</th><th>Process 6</th><th>Process Flow</th><th>จัดการ</th></tr></thead><tbody id="bomBody"></tbody></table></div>
        <div class="bom-source-note">Source: BOM Auto part.xlsx · แสดงข้อมูลตามลำดับที่บันทึกในชีต Bom</div>
        <input id="bomImageInput" type="file" accept="image/*" hidden>
      </article>`;
    main.appendChild(view);
  }

  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=v=>String(v??'').trim();
  const usableAssembly=v=>{const x=norm(v);return x&&x!=='-';};
  let data=[],assemblies=[],processes=[];
  const rebuildData=()=>{let current='';data=rows.map((r,i)=>{const explicit=usableAssembly(r.assembly)?norm(r.assembly):'';if(explicit)current=explicit;const assembly=norm(r.assemblyResolved)||current||norm(r.partNo);const out={...r,index:i+1,sourceIndex:i,assemblyResolved:assembly,groupStart:!!explicit};if(current&&norm(r.partNo)===current)current='';return out}).filter(r=>norm(r.partNo));assemblies=[...new Set(data.map(r=>r.assemblyResolved).filter(Boolean))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));processes=[...new Set(data.flatMap(r=>r.processes||[]).map(norm).filter(Boolean))].sort((a,b)=>a.localeCompare(b));};
  rebuildData();
  const assemblySel=document.getElementById('bomAssembly'),diagramSel=document.getElementById('bomDiagramAssembly'),processSel=document.getElementById('bomProcess'),search=document.getElementById('bomSearch');
  const rebuildSelects=()=>{const oldA=assemblySel.value,oldD=diagramSel.value,oldP=processSel.value;assemblySel.innerHTML='<option value="">All Assembly</option>'+assemblies.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');diagramSel.innerHTML=assemblies.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');processSel.innerHTML='<option value="">All Process</option>'+processes.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');if(assemblies.includes(oldA))assemblySel.value=oldA;if(assemblies.includes(oldD))diagramSel.value=oldD;if(processes.includes(oldP))processSel.value=oldP;};
  rebuildSelects();
  const imageKey=p=>`jr_bom_image_${p}`;
  const positionKey=(assembly,part)=>`jr_bom_position_${assembly}_${part}`;
  const savedPosition=(assembly,part,max)=>{try{const n=Number(localStorage.getItem(positionKey(assembly,part)));return Number.isInteger(n)&&n>=0&&n<max?n:null}catch(_){return null}};
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
    const placed=shown.map((r,i)=>{
      const supply=/supply/i.test((r.processes||[]).filter(Boolean).join(' '));
      const joinCandidates=steps.map((p,idx)=>/assembly|welding|rubber|ประกอบ|เชื่อม/i.test(p)?idx:-1).filter(idx=>idx>=0);
      const automatic=i===0&&!supply?0:(joinCandidates[Math.min(i-(shown[0]&&!/supply/i.test((shown[0].processes||[]).join(' '))?1:0),joinCandidates.length-1)]??Math.min(i,steps.length-1));
      return {row:r,column:savedPosition(selected,r.partNo,steps.length)??Math.max(0,automatic)};
    });
    const feederSlots=steps.map((_,column)=>`<div class="bom-feed-slot" data-drop-column="${column}" style="grid-column:${column+1}">${placed.filter(x=>x.column===column).map(({row:r})=>`<div class="bom-part-card" draggable="true" data-drag-part="${esc(r.partNo)}">${imageHtml(r.partNo,'bom-part-image')}<div><div class="bom-part-name">${esc(r.partNo)}</div><div class="bom-qty">QTY 1</div><div class="bom-mini-flow">${esc((r.processes||[]).filter(Boolean).join(' → ')||'รอระบุ Process')}</div>${imageActions(r.partNo)}</div></div>`).join('')}</div>`).join('');
    const spine=steps.map((p,i)=>`<div class="bom-step" style="grid-column:${i+1}">${i?'<span class="bom-node-arrow">→</span>':''}<span class="bom-node ${/assembly|welding|เชื่อม|ประกอบ/i.test(p)?'assembly':''}">${esc(p)}</span></div>`).join('');
    const output=norm(outputParts[selected])||selected,changed=output!==selected;
    document.getElementById('bomFishbone').innerHTML=`<div class="bom-flow-canvas"><div class="bom-flow-grid" style="--steps:${steps.length}"><div class="bom-drag-hint">↔ ลากกล่อง Part ไปวางเหนือ Process ที่ต้องการ <button class="btn ghost" data-reset-layout>คืนตำแหน่งเดิม</button></div>${feederSlots}<div class="bom-spine">${spine}</div></div><div class="bom-final-arrow"></div><div class="bom-final-card">${imageHtml(output,'bom-final-image')}<strong>FINISHED PART:<br>${esc(output)}</strong>${changed?`<div class="bom-output-note">เปลี่ยนจาก ${esc(selected)} → ${esc(output)}</div>`:'<div class="bom-output-note">Part No. ไม่เปลี่ยน</div>'}${imageActions(output)}</div></div>`;
  };
  const render=()=>{
    const q=norm(search.value).toLowerCase(),a=assemblySel.value,p=processSel.value;
    const filtered=data.filter(r=>(!q||`${r.assemblyResolved} ${r.partNo}`.toLowerCase().includes(q))&&(!a||r.assemblyResolved===a)&&(!p||(r.processes||[]).includes(p)));
    document.getElementById('bomBody').innerHTML=filtered.map(r=>{
      const ps=Array.from({length:6},(_,i)=>norm((r.processes||[])[i]));
      const cells=ps.map(x=>`<td><span class="bom-process ${x?'':'empty'}">${esc(x||'-')}</span></td>`).join('');
      const flow=ps.filter(Boolean).join(' → ');
      const output=norm(outputParts[r.assemblyResolved])||r.assemblyResolved;
      return `<tr data-group-start="${r.groupStart}"><td>${r.index}</td><td>${imageHtml(r.partNo,'bom-table-image')}<button class="bom-table-upload" data-upload-part="${esc(r.partNo)}">ใส่รูป</button></td><td>${esc(r.assemblyResolved)}</td><td>${esc(r.partNo)}<small class="bom-result-change">${esc(r.type||'Part')}</small></td><td>${esc(output)}${output!==r.assemblyResolved?`<small class="bom-result-change">เปลี่ยน Part No.</small>`:''}</td>${cells}<td class="bom-sequence">${esc(flow||'-')}</td><td><div class="bom-row-actions"><button class="bom-edit-row" data-edit-row="${r.sourceIndex}">แก้ไข</button><button class="bom-delete-row" data-delete-row="${r.sourceIndex}">ลบ</button></div></td></tr>`;
    }).join('')||'<tr><td colspan="13" class="empty">ไม่พบข้อมูล BOM ตามตัวกรอง</td></tr>';
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
  const editor=document.getElementById('bomEditor'),form=document.getElementById('bomForm');let editingIndex=-1;
  const resetEditor=()=>{editingIndex=-1;form.reset();document.getElementById('bomEditorTitle').textContent='เพิ่มรายการ BOM';};
  const openEditor=(index=-1)=>{editor.hidden=false;editingIndex=index;if(index<0){resetEditor()}else{const r=rows[index];document.getElementById('bomEditorTitle').textContent='แก้ไข '+norm(r.partNo);document.getElementById('bomEditAssembly').value=norm(r.assemblyResolved)||norm(r.assembly)||norm(r.partNo);document.getElementById('bomEditPart').value=norm(r.partNo);document.getElementById('bomEditOutput').value=norm(outputParts[norm(r.assemblyResolved)||norm(r.assembly)])||'';document.getElementById('bomEditType').value=r.type||'Part';Array.from({length:6},(_,i)=>document.getElementById(`bomEditProcess${i+1}`).value=norm((r.processes||[])[i]));}editor.scrollIntoView({behavior:'smooth',block:'start'});};
  document.getElementById('bomOpenEditor').addEventListener('click',()=>openEditor());
  document.getElementById('bomCloseEditor').addEventListener('click',()=>editor.hidden=true);
  document.getElementById('bomResetForm').addEventListener('click',resetEditor);
  form.addEventListener('submit',e=>{e.preventDefault();const assembly=norm(document.getElementById('bomEditAssembly').value),partNo=norm(document.getElementById('bomEditPart').value),output=norm(document.getElementById('bomEditOutput').value)||assembly;if(!assembly||!partNo)return;const item={assembly,assemblyResolved:assembly,partNo,type:document.getElementById('bomEditType').value,processes:Array.from({length:6},(_,i)=>norm(document.getElementById(`bomEditProcess${i+1}`).value))};if(editingIndex>=0)rows[editingIndex]={...rows[editingIndex],...item};else rows.push(item);outputParts[assembly]=output;localStorage.setItem(DATA_KEY,JSON.stringify(rows));localStorage.setItem(OUTPUT_KEY,JSON.stringify(outputParts));rebuildData();rebuildSelects();diagramSel.value=assembly;render();resetEditor();editor.hidden=true;showToast('บันทึก BOM แล้ว');});
  let pendingPart='';const imageInput=document.getElementById('bomImageInput');
  const fishbone=document.getElementById('bomFishbone');let draggingPart='';
  fishbone.addEventListener('dragstart',e=>{const card=e.target.closest('[data-drag-part]');if(!card)return;draggingPart=card.dataset.dragPart;card.classList.add('dragging');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',draggingPart)});
  fishbone.addEventListener('dragover',e=>{const slot=e.target.closest('[data-drop-column]');if(!slot)return;e.preventDefault();e.dataTransfer.dropEffect='move';fishbone.querySelectorAll('.drag-over').forEach(x=>x.classList.remove('drag-over'));slot.classList.add('drag-over')});
  fishbone.addEventListener('dragleave',e=>{const slot=e.target.closest('[data-drop-column]');if(slot&&!slot.contains(e.relatedTarget))slot.classList.remove('drag-over')});
  fishbone.addEventListener('drop',e=>{const slot=e.target.closest('[data-drop-column]');if(!slot)return;e.preventDefault();const part=draggingPart||e.dataTransfer.getData('text/plain');if(!part)return;try{localStorage.setItem(positionKey(diagramSel.value||assemblies[0]||'',part),slot.dataset.dropColumn);showToast('ย้าย '+part+' แล้ว')}catch(_){showToast('ไม่สามารถบันทึกตำแหน่งได้')}draggingPart='';renderFishbone()});
  fishbone.addEventListener('dragend',()=>{draggingPart='';fishbone.querySelectorAll('.dragging,.drag-over').forEach(x=>x.classList.remove('dragging','drag-over'))});
  fishbone.addEventListener('click',e=>{if(!e.target.closest('[data-reset-layout]'))return;const selected=diagramSel.value||assemblies[0]||'';data.filter(r=>r.assemblyResolved===selected).forEach(r=>{try{localStorage.removeItem(positionKey(selected,r.partNo))}catch(_){}});renderFishbone();showToast('คืนตำแหน่งผังเดิมแล้ว')});
  document.getElementById('view-bom').addEventListener('click',e=>{const edit=e.target.closest('[data-edit-row]');if(edit){openEditor(Number(edit.dataset.editRow));return}const del=e.target.closest('[data-delete-row]');if(del){const i=Number(del.dataset.deleteRow),part=rows[i]?.partNo;if(part&&confirm(`ลบ ${part} ออกจาก BOM หรือไม่?`)){rows.splice(i,1);localStorage.setItem(DATA_KEY,JSON.stringify(rows));rebuildData();rebuildSelects();render();showToast('ลบ '+part+' แล้ว')}return}const remove=e.target.closest('[data-remove-part]');if(remove){try{localStorage.removeItem(imageKey(remove.dataset.removePart));render();showToast('ลบรูป '+remove.dataset.removePart+' แล้ว')}catch(_){showToast('ไม่สามารถลบรูปได้')}return}const b=e.target.closest('[data-upload-part]');if(!b)return;pendingPart=b.dataset.uploadPart;imageInput.value='';imageInput.click();});
  imageInput.addEventListener('change',()=>{const file=imageInput.files?.[0];if(!file||!pendingPart)return;const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const max=640,scale=Math.min(1,max/Math.max(img.width,img.height)),canvas=document.createElement('canvas');canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);try{localStorage.setItem(imageKey(pendingPart),canvas.toDataURL('image/jpeg',.82));render();showToast('บันทึกรูป '+pendingPart+' แล้ว')}catch(_){showToast('รูปมีขนาดใหญ่เกินไป กรุณาเลือกรูปที่เล็กลง')}};img.src=reader.result};reader.readAsDataURL(file);});
  button?.addEventListener('click',()=>{if(typeof showView==='function')showView('bom');else{document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));document.getElementById('view-bom')?.classList.add('active');}document.getElementById('pageTitle').textContent='BOM Process';});
  render();
})();
