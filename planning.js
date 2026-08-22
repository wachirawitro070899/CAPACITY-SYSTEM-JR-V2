(()=>{
  const planningStyle=document.createElement('style');
  planningStyle.textContent=`
  .planning-controls{display:grid;grid-template-columns:repeat(2,minmax(260px,1fr));gap:16px;margin-bottom:18px}
  .planning-control{padding:18px;background:linear-gradient(135deg,#142f4b,#193b5d);border-radius:16px;color:#fff;box-shadow:0 10px 26px rgba(15,23,42,.12)}
  .planning-control label{display:block;font-size:13px;font-weight:800;margin-bottom:10px}
  .planning-control-row{display:grid;grid-template-columns:90px 1fr;gap:14px;align-items:center}
  .planning-control input[type=number]{width:100%;padding:10px 12px;border-radius:9px;border:0;background:#f8fafc;color:#172033;font-weight:800;text-align:center}
  .planning-control input[type=range]{width:100%;accent-color:#f59e0b}
  .planning-control small{display:block;margin-top:8px;color:#cbd5e1}
  .planning-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:18px}
  .planning-kpi{padding:17px;border-radius:14px;background:#fff;border:1px solid #e5eaf2;box-shadow:0 8px 20px rgba(15,23,42,.05)}
  .planning-kpi span{font-size:11px;color:#6d7890;font-weight:750}.planning-kpi strong{display:block;margin-top:6px;font-size:25px;color:#172033}
  .planning-table th,.planning-table td{text-align:center!important;vertical-align:middle}.planning-table thead th{background:#1e3a5f!important;color:#fff!important}
  .planning-table td:nth-child(5),.planning-table td:nth-child(6){font-weight:850;color:#2563eb}.planning-table td:nth-child(7){font-weight:900;color:#16a34a}
  .planning-badge{display:inline-flex;align-items:center;padding:5px 9px;border-radius:999px;font-size:11px;font-weight:850;background:#ecfdf3;color:#166534}
  @media(max-width:900px){.planning-controls{grid-template-columns:1fr}.planning-kpis{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:520px){.planning-kpis{grid-template-columns:1fr}.planning-control-row{grid-template-columns:75px 1fr}}
  `;
  document.head.appendChild(planningStyle);

  const nav=document.querySelector('.nav');
  if(nav&&!document.querySelector('[data-view="planning"]')){
    const btn=document.createElement('button');
    btn.className='nav-item';btn.dataset.view='planning';btn.textContent='Planning Capacity';
    nav.insertBefore(btn,nav.querySelector('[data-view="settings"]'));
    btn.addEventListener('click',()=>showView('planning'));
  }

  const main=document.querySelector('.main');
  if(main&&!document.getElementById('view-planning')){
    const section=document.createElement('section');
    section.className='view';section.id='view-planning';
    section.innerHTML=`
      <div class="planning-controls">
        <div class="planning-control">
          <label>Capacity / Efficiency (%)</label>
          <div class="planning-control-row">
            <input id="planCapacityNumber" type="number" min="50" max="120" step="1" value="90">
            <input id="planCapacityRange" type="range" min="50" max="120" step="1" value="90">
          </div>
          <small>ปรับประสิทธิภาพการผลิต เช่น 100%, 90%, 85% หรือค่าที่ Planning ต้องการจำลอง</small>
        </div>
        <div class="planning-control">
          <label>ชั่วโมงทำงาน / Work Hours</label>
          <div class="planning-control-row">
            <input id="planHoursNumber" type="number" min="1" max="24" step="0.5" value="10.5">
            <input id="planHoursRange" type="range" min="1" max="24" step="0.5" value="10.5">
          </div>
          <small>กำหนดชั่วโมงผลิตจริงต่อวันหรือช่วงเวลาที่ต้องการวางแผน</small>
        </div>
      </div>
      <div class="planning-kpis">
        <div class="planning-kpi"><span>Efficiency</span><strong id="planKpiEfficiency">90%</strong></div>
        <div class="planning-kpi"><span>Work Hours</span><strong id="planKpiHours">10.5 hr</strong></div>
        <div class="planning-kpi"><span>Final Parts</span><strong id="planKpiParts">0</strong></div>
        <div class="planning-kpi"><span>Total Planned Output</span><strong id="planKpiOutput">0 pcs</strong></div>
      </div>
      <article class="card panel">
        <div class="panel-head"><div><h2>Planning Capacity Check</h2><p>คำนวณจาก Total CT ของทุก Process / Step ภายใต้ Final Part</p></div><span class="planning-badge">Live Simulation</span></div>
        <div class="table-wrap"><table class="planning-table"><thead><tr><th>Final Part</th><th>Total CT 100%<br><small>sec/pcs</small></th><th>Efficiency</th><th>Adjusted CT<br><small>sec/pcs</small></th><th>Capacity<br><small>pcs/hour</small></th><th>Work Hours</th><th>Planned Capacity<br><small>pcs</small></th></tr></thead><tbody id="planningBody"></tbody></table></div>
      </article>`;
    main.appendChild(section);
  }

  const capN=document.getElementById('planCapacityNumber'),capR=document.getElementById('planCapacityRange'),hrN=document.getElementById('planHoursNumber'),hrR=document.getElementById('planHoursRange');
  function clamp(v,min,max){return Math.min(max,Math.max(min,Number(v)||min))}
  function sync(a,b,min,max){const v=clamp(a.value,min,max);a.value=v;b.value=v;renderPlanning()}
  capN?.addEventListener('input',()=>sync(capN,capR,50,120));capR?.addEventListener('input',()=>sync(capR,capN,50,120));
  hrN?.addEventListener('input',()=>sync(hrN,hrR,1,24));hrR?.addEventListener('input',()=>sync(hrR,hrN,1,24));

  window.renderPlanning=function(){
    const body=document.getElementById('planningBody');if(!body)return;
    const eff=clamp(capN?.value||90,50,120)/100,hours=clamp(hrN?.value||10.5,1,24);
    let totals=[];
    try{totals=finalPartTotals(state.rows.length?state.rows:state.filtered)}catch(_){totals=[]}
    let totalOutput=0;
    body.innerHTML=totals.length?totals.map(x=>{
      const adjusted=x.ct100>0?x.ct100/eff:0;
      const perHour=adjusted>0?3600/adjusted:0;
      const output=perHour*hours;totalOutput+=output;
      return `<tr><td><strong>${escapeHtml(x.finalPart)}</strong></td><td>${n(x.ct100)}</td><td>${(eff*100).toFixed(0)}%</td><td>${n(adjusted)}</td><td>${n(perHour)}</td><td>${hours}</td><td>${fmt.format(Math.floor(output))}</td></tr>`
    }).join(''):'<tr><td colspan="7" class="empty">ยังไม่มีข้อมูล Final Part</td></tr>';
    document.getElementById('planKpiEfficiency').textContent=`${(eff*100).toFixed(0)}%`;
    document.getElementById('planKpiHours').textContent=`${hours} hr`;
    document.getElementById('planKpiParts').textContent=totals.length;
    document.getElementById('planKpiOutput').textContent=`${fmt.format(Math.floor(totalOutput))} pcs`;
  };

  const originalRenderAll=renderAll;
  renderAll=function(){originalRenderAll();renderPlanning()};
  renderPlanning();
})();