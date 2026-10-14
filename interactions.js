// Projection signals adapt Vega's native map pan/zoom; all value scales stay global.
function addMapNavigation(spec, target, container) {
  if (spec.$schema.includes('vega-lite')) {
    spec.width = container.clientWidth;
    spec = vegaLite.compile(spec).spec;
  }
  spec.signals ||= [];
  spec.signals.push(
    {name:'mapZoom',value:1,on:[{events:{type:'wheel',filter:['event.ctrlKey'],consume:true},update:'clamp(mapZoom * pow(1.001, -event.deltaY), 1, 12)'}]},
    {name:'panEnabled',value:false},
    {name:'panStart',value:[0,0,0,0],on:[{events:'pointerdown',update:'[x(),y(),mapPan[0],mapPan[1]]'}]},
    {name:'mapPan',value:[0,0],on:[{events:'[pointerdown, window:pointerup] > window:pointermove',update:'panEnabled ? [panStart[2]+x()-panStart[0],panStart[3]+y()-panStart[1]] : mapPan'}]}
  );
  if (["map1", "map2"].includes(target)) {
    const geography = spec.data.find(d => d.format?.type === "topojson");
    if (!geography) throw new Error("Map fit requires the original topology dataset");
    spec.signals.push({name:'fullMapExtent',value:false});
    spec.autosize={type:'none',contains:'padding'};
    spec.marks.forEach(mark => {mark.clip=true;});
    spec.data.push({name:'mapFullExtent',source:geography.name}, {name:'mapMainExtent',source:'mapFullExtent',transform:[{type:'filter',expr:"indexof(['1','2','3','4','5','6','7','8'],substring(datum.properties.SA2_CODE21,0,1)) >= 0"}]});
    for (const projection of spec.projections) projection.fit={signal:"fullMapExtent ? data('mapFullExtent') : data('mapMainExtent')"};
  }
  for (const p of spec.projections) {
    // fit remains the full source geography, regardless of facility filters.
    delete p.size;
    p.extent={signal:'[[width/2+(12-width/2)*mapZoom+mapPan[0],height/2+(12-height/2)*mapZoom+mapPan[1]],[width/2+(width-12-width/2)*mapZoom+mapPan[0],height/2+(height-12-height/2)*mapZoom+mapPan[1]]]'};
  }
  if (target === "map1") {
    // Fit unchanged geography only when size/coverage changes, not for every gesture.
    const bases = spec.projections.map(p => ({
      ...p, name: p.name + "_base", extent: {signal:'[[12,12],[width-12,height-12]]'}
    }));
    spec.projections.forEach((p,i) => {
      const base = bases[i].name;
      delete p.fit; delete p.extent;
      p.scale = {signal:`(scale('${base}',[1,0])[0]-scale('${base}',[0,0])[0])*180/PI*mapZoom`};
      p.translate = {signal:`[width/2 + (scale('${base}',[0,0])[0]-width/2)*mapZoom + mapPan[0], height/2 + (scale('${base}',[0,0])[1]-height/2)*mapZoom + mapPan[1]]`};
    });
    spec.projections.unshift(...bases);

  }
  return spec;
}
function setupMapNavigation(target,view) {
  const box=document.getElementById(target),toolbar=document.querySelector(`[data-map="${target}"]`);
  toolbar.querySelector('output').textContent='1.0×'; box.classList.remove('drag-enabled'); toolbar.querySelector('[data-action="drag"]').setAttribute('aria-pressed','false');
  toolbar.querySelectorAll('button').forEach(b => b.onclick=async()=> {
    const z=view.signal('mapZoom'),p=view.signal('mapPan'),a=b.dataset.action;
    if(a==='all'){view.signal('fullMapExtent',true).signal('mapZoom',1).signal('mapPan',[0,0]);}
    if(a==='reset' && ['map1','map2'].includes(target))view.signal('fullMapExtent',false);
    if(a==='in')view.signal('mapZoom',Math.min(12,z*1.6)).signal('mapPan',p.map(v=>v*1.6));
    if(a==='out')view.signal('mapZoom',Math.max(1,z/1.6)).signal('mapPan',p.map(v=>v/1.6));
    if(a==='reset'){view.signal('mapZoom',1).signal('mapPan',[0,0]).signal('panEnabled',false);box.classList.remove('drag-enabled');toolbar.querySelector('[data-action="drag"]').setAttribute('aria-pressed','false');}
    if(a==='drag'){const on=!view.signal('panEnabled');view.signal('panEnabled',on);box.classList.toggle('drag-enabled',on);b.setAttribute('aria-pressed',String(on));}
    const deltas={left:[70,0],right:[-70,0],up:[0,70],down:[0,-70]};if(deltas[a])view.signal('mapPan',[p[0]+deltas[a][0],p[1]+deltas[a][1]]);
    await view.runAsync();toolbar.querySelector('output').textContent=`${view.signal('mapZoom').toFixed(1)}×`;
  });
  view.addSignalListener('mapZoom',(_,z)=>toolbar.querySelector('output').textContent=`${z.toFixed(1)}×`);
}
function summaryBars(host, title, rows, max, format, select, onSelect) {
  host.replaceChildren();const h=document.createElement('h4');h.textContent=title;host.append(h);
  if(!rows.length){const p=document.createElement('p');p.textContent='No matching records in the validated selection.';host.append(p);return;}
  const list=document.createElement('div');list.className='summary-bars';host.append(list);
  rows.forEach(r=>{
    const button=document.createElement(onSelect?'button':'div');button.className='summary-row';button.dataset.key=r.key;button.dataset.value=r.value;button.setAttribute('aria-label',`${r.label}: ${format(r.value)}`);
    if(onSelect){button.type='button';button.onclick=()=>onSelect(r.key);}
    const label=document.createElement('span');label.className='summary-label';label.textContent=r.label;
    const track=document.createElement('span');track.className='bar-track';const fill=document.createElement('span');fill.className='bar-fill';fill.style.width=`${max ? r.value/max*100 : 0}%`;fill.classList.toggle('selected',r.key===select);track.append(fill);
    const value=document.createElement('span');value.className='summary-value';value.textContent=format(r.value);button.append(label,track,value);button.title=r.context||`${r.label}: ${format(r.value)}`;list.append(button);
  });
}
const billions = dollars => `A$${(dollars/1e9).toLocaleString('en-AU',{minimumFractionDigits:3,maximumFractionDigits:3})}bn`;
function setupFacilityFilters(view) {
  const rows=view.data('facilities'),state=document.getElementById('facility-state'),industry=document.getElementById('facility-industry'),search=document.getElementById('facility-search'),lookup=document.getElementById('facility-select');
  populateSelect(state,[...new Set(rows.map(r=>r.State))].sort().map(x=>({x})),r=>r.x,r=>r.x);
  populateSelect(industry,[...new Set(rows.map(r=>r.Industry))].sort().map(x=>({x})),r=>r.x,r=>r.x);
  const update=async()=>{
    view.signal('stateFilter',state.value).signal('industryFilter',industry.value).signal('searchName',search.value.trim()).signal('selectedFacility',null);
    await view.runAsync();
    const shown=rows.filter(r=>(!state.value||r.State===state.value)&&(!industry.value||r.Industry===industry.value));
    populateSelect(lookup,shown.slice().sort((a,b)=>a.Facility_Name.localeCompare(b.Facility_Name)),r=>String(r.Facility_ID),r=>`${r.Facility_Name} · ${r.State} · ${r.Facility_ID}`);
    const matches=shown.filter(r=>r.Facility_Name.toLowerCase().includes(search.value.trim().toLowerCase())).length;
    document.getElementById('facility-count').textContent=`${shown.length.toLocaleString()} of 1,210 facilities match the filters.${search.value.trim()?` ${matches} name matches highlighted; search does not remove dots.`:''}`;
    const states=[...new Set(rows.map(r=>r.State))].sort();
    const bars=states.map(s=>({key:s,label:s,value:rows.filter(r=>r.State===s&&(!industry.value||r.Industry===industry.value)).length}));
    summaryBars(document.getElementById('facility-summary'),'Reporting facilities by state',bars,354,v=>v.toLocaleString(),state.value,s=>{state.value=state.value===s?'':s;update();});
  };
  state.onchange=industry.onchange=update;search.oninput=update;
  document.getElementById('facility-reset').onclick=()=>{state.value='';industry.value='';search.value='';update();};
  update();
}
function setupDestinationSummary(view) {
  const rows=view.data('flows'),global=new Map();rows.forEach(r=>global.set(r.Target,(global.get(r.Target)||0)+r.Value_AUD_thousands*1000));const max=Math.max(...global.values());
  const update=key=>{
    const values=new Map();const selected=rows.filter(r=>!key||r.Source===key);selected.forEach(r=>values.set(r.Target,(values.get(r.Target)||0)+r.Value_AUD_thousands*1000));
    const bars=[...values].map(([label,value])=>({key:label,label,value})).sort((a,b)=>b.value-a.value);
    const host=document.getElementById('export-summary');summaryBars(host,key?`Top destinations · ${key}`:'Top destinations · all retained origins',bars.slice(0,8),max,billions,'');
    const note=document.createElement('p');note.className='method-note';note.textContent=`Largest ${Math.min(8,bars.length)} of ${bars.length} retained destinations. Retained flows for this view total ${billions(selected.reduce((n,r)=>n+r.Value_AUD_thousands*1000,0))}. Global coverage remains 85.22%; these are not all state exports. Common bar scale across states.`;host.append(note);
  };
  view.addSignalListener('selectedState',(_,key)=>update(key));update(view.signal('selectedState'));
}
function setupIndustrySummary(view) {
  const rows=view.data('edges'),max=Math.max(...rows.map(r=>r.Value_AUD_millions*1e6));
  const update=key=>{
    const host=document.getElementById('industry-summary');host.replaceChildren();
    if(!key){const p=document.createElement('p');p.className='interaction-hint';p.textContent='Select an industry to compare what it supplies and receives.';host.append(p);return;}
    for(const [field,other,title] of [['Source','Target','Supplies to'],['Target','Source','Receives from']]){
      const list=rows.filter(r=>r[field]===key).map(r=>({key:r.Key,label:r[other+'_Name']+(r.Source===r.Target?' · self-use':''),value:r.Value_AUD_millions*1e6,context:`${r.Source_Name} → ${r.Target_Name}, ${billions(r.Value_AUD_millions*1e6)}; 2023–24 domestic intermediate use, basic prices`})).sort((a,b)=>b.value-a.value);
      const section=document.createElement('section');section.className='direction-summary';section.dataset.direction=field==='Source'?'supplies':'receives';host.append(section);summaryBars(section,title,list.slice(0,5),max,billions,'',edge=>{document.getElementById('relationship-select').value=edge;document.getElementById('relationship-select').onchange();});
      if(list.length>5){const details=document.createElement('details'),sum=document.createElement('summary'),rest=document.createElement('div');sum.textContent=`Show all ${list.length} partners`;details.append(sum,rest);section.append(details);summaryBars(rest,'Remaining partners',list.slice(5),max,billions,'',edge=>{document.getElementById('relationship-select').value=edge;document.getElementById('relationship-select').onchange();});}
    }
    const p=document.createElement('p');p.className='method-note';p.textContent='Common value scale. Self-use appears in both directional lists; do not add the lists to obtain the network total.';host.append(p);
  };
  const markActiveEdge=()=>document.querySelectorAll('#industry-summary .summary-row').forEach(row=>row.querySelector('.bar-fill')?.classList.toggle('selected',row.dataset.key===view.signal('selectedEdge')));
  view.addSignalListener('selectedEdge',markActiveEdge);
  view.addSignalListener('selectedIndustry',(_,key)=>{update(key);markActiveEdge();});update(view.signal('selectedIndustry'));markActiveEdge();
}
function setupProfileFocus(target,view) {
  const select=document.getElementById(target+'-focus');let rows,sig,key,label;
  if(target==='vis07'){rows=view.data('profiles');sig='focusSubdivision';key=label='Subdivision';}
  if(target==='vis13'){rows=view.data('iva');sig='focusCode';key='Code';label='Subdivision';}
  if(target==='vis09'){rows=view.data('source_0');sig='focusSubdivision';key=label='Subdivision';}
  const unique=[...new Map(rows.map(r=>[r[key],r])).values()].sort((a,b)=>a[label].localeCompare(b[label]));populateSelect(select,unique,r=>r[key],r=>r[label]);select.onchange=()=>view.signal(sig,select.value||null).runAsync();select.onchange();
}
