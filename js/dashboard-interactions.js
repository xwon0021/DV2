// Preview-only V1/V2 navigation; production helpers remain unchanged.
// Native Vega gestures adapted from https://vega.github.io/vega/examples/zoomable-world-map/.
// Regional Australia stays north-up: only scale and pixel translation change.
function addV1Navigation(spec, target) {
  const signal = name => spec.signals.find(s => s.name === name);
  const down = {type:'pointerdown', filter:["event.button === 0"]};
  spec.signals.push(
    {name:'v1Dragging', value:false, on:[{events:down,update:'true'},
      {events:'window:pointerup, window:pointercancel',update:'false'}]}
  );
  signal('mapZoom').on=[];
  signal('panEnabled').value=true;
  signal('panStart').on=[{events:down,update:'[x(),y(),mapPan[0],mapPan[1]]'}];
  signal('mapPan').on=[
    {events:{source:'window',type:'pointermove',throttle:32,
      between:[down,{source:'window',type:'pointerup'}]},
      update:'v1Dragging ? [panStart[2]+x()-panStart[0],panStart[3]+y()-panStart[1]] : mapPan'}
  ];
  if(target==='map1') {
    const projection=spec.projections.find(p=>!p.name.endsWith('_base'));
    spec.signals.push({name:'zoom_level',update:projection.scale.signal});
    projection.scale={signal:'zoom_level'};
  }
  return cacheV1ProjectedPaths(spec);
}
function setupV1Navigation(view, target='map1') {
  const cleanupKey=target==='map1'?'v1NavigationCleanup':target+'NavigationCleanup';
  window[cleanupKey]?.();
  const host=document.getElementById(target);
  let pendingZoom=null, frame=0, running=false, disposed=false, lastWheelAt=-Infinity;
  function requestFrame() { if (!frame && !running && !disposed) frame=requestAnimationFrame(flush); }
  async function flush() {
    frame=0;if(disposed || pendingZoom===null)return;
    const next=pendingZoom;pendingZoom=null;running=true;
    const current=view.signal('mapZoom');
    view.signal('mapPan',view.signal('mapPan').map(value=>value*next/current)).signal('mapZoom',next);
    try { await view.runAsync(); } catch(error) { if(!disposed)console.error(error); }
    finally { running=false;if(pendingZoom!==null)requestFrame(); }
  }
  function wheel(event) {
    if (!event.metaKey && !event.ctrlKey) return;
    event.preventDefault(); // Cmd-wheel over V1 zooms the map; ordinary wheel scrolls the page.
    const current=pendingZoom ?? view.signal('mapZoom');
    const factor=Math.pow(1.0005,-event.deltaY*Math.pow(16,event.deltaMode));
    const next=Math.max(1,Math.min(15,current*factor));
    const now=performance.now(), idle=now-lastWheelAt>150;lastWheelAt=now;
    if(next===current)return;
    pendingZoom=next;
    if(idle && !running && !frame) flush(); else requestFrame();
  }
  host.tabIndex=0;
  host.setAttribute('aria-keyshortcuts','+ -');
  function keyboard(event) {
    if(event.target!==host || !['+','=','-'].includes(event.key))return;
    event.preventDefault();
    const current=pendingZoom ?? view.signal('mapZoom');
    pendingZoom=Math.max(1,Math.min(15,event.key==='-'?current/1.6:current*1.6));
    if(!running && !frame)flush();else requestFrame();
  }
  host.addEventListener('keydown',keyboard);
  host.addEventListener('wheel',wheel,{capture:true,passive:false});
  window[cleanupKey]=()=>{
    disposed=true;cancelAnimationFrame(frame);pendingZoom=null;
    host.removeEventListener('keydown',keyboard);host.removeEventListener('wheel',wheel,true);window[cleanupKey]=null;
  };
  const toolbar=document.querySelector(`[data-map="${target}"]`);
  host.classList.add('v1-native-navigation');
  const slider=target==='map1'?toolbar.querySelector('#v1-zoom-scale'):null;
  if(slider)slider.oninput=()=>{
    pendingZoom=Math.max(1,Math.min(15,Number(slider.value)));
    requestFrame();
  };
  const output=toolbar.querySelector('output');
  output.textContent=`${view.signal('mapZoom').toFixed(1)}×`;
  toolbar.querySelectorAll('button').forEach(button=>button.onclick=async()=>{
    cancelAnimationFrame(frame);frame=0;pendingZoom=null;
    const action=button.dataset.action, zoom=view.signal('mapZoom');
    if(action==='in'||action==='out') {
      const next=Math.max(1,Math.min(15,action==='in'?zoom*1.6:zoom/1.6));
      view.signal('mapPan',view.signal('mapPan').map(value=>value*next/zoom)).signal('mapZoom',next);
    }
    if(action==='reset'||action==='all') {
      if(['map1','map2'].includes(target))view.signal('fullMapExtent',action==='all');
      view.signal('mapZoom',1).signal('mapPan',[0,0]).signal('v1Dragging',false);
    }
    await view.runAsync();
  });
  if(slider)slider.value=String(view.signal('mapZoom'));
  view.addSignalListener('mapZoom',(_,zoom)=>{output.textContent=`${zoom.toFixed(1)}×`;if(slider){slider.value=String(zoom);slider.setAttribute('aria-valuetext',`${zoom.toFixed(1)} times`);}});
}


// Cache the unchanged projected geometry; zoom/pan update affine path transforms.
function cacheV1ProjectedPaths(spec) {
  for(const mark of spec.marks) {
    const geo=mark.transform?.find(t=>t.type==='geoshape');
    if(!geo)continue;
    const name=mark.from.data+'_v1_paths';
    spec.data.push({name,source:mark.from.data,transform:[
      {type:'geopath',projection:geo.projection+'_base',as:'v1ProjectedPath'}
    ]});
    mark.from.data=name;mark.type='path';
    mark.transform=mark.transform.filter(t=>t!==geo);
    const update=mark.encode.update;
    update.path={field:'v1ProjectedPath'};
    update.scaleX={signal:'mapZoom'};update.scaleY={signal:'mapZoom'};
    update.x={signal:'width/2*(1-mapZoom)+mapPan[0]'};
    update.y={signal:'height/2*(1-mapZoom)+mapPan[1]'};
    const widths=Array.isArray(update.strokeWidth)?update.strokeWidth:[update.strokeWidth];
    update.strokeWidth=widths.map(w=>{const encoded={...w,signal:`(${w.signal ?? w.value})/mapZoom`};delete encoded.value;return encoded;});
  }
  return spec;
}
// Preview-only helper copy; only V2 navigation dispatch differs.
// Projection signals adapt Vega's native map pan/zoom; all value scales stay global.
function addMapNavigation(spec, target, container) {
  if (spec.$schema.includes('vega-lite')) {
    spec.width = container.clientWidth;
    spec = vegaLite.compile(spec).spec;
  }
  spec.signals ||= [];
  spec.signals.push(
    {name:'mapZoom',value:1,on:[{events:{type:'wheel',filter:['event.ctrlKey'],consume:true},update:'clamp(mapZoom * pow(1.001, -event.deltaY), 1, 15)'}]},
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
  if (["map1","map2","map3"].includes(target)) {
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
  if (["map1","map2","map3"].includes(target)) spec = addV1Navigation(spec,target);
  return spec;
}
function setupMapNavigation(target,view) {
  if (["map1","map2","map3"].includes(target)) return setupV1Navigation(view,target);
  const box=document.getElementById(target),toolbar=document.querySelector(`[data-map="${target}"]`);
  toolbar.querySelector('output').textContent='1.0×'; box.classList.remove('drag-enabled'); toolbar.querySelector('[data-action="drag"]').setAttribute('aria-pressed','false');
  toolbar.querySelectorAll('button').forEach(b => b.onclick=async()=> {
    const z=view.signal('mapZoom'),p=view.signal('mapPan'),a=b.dataset.action;
    if(a==='all'){view.signal('fullMapExtent',true).signal('mapZoom',1).signal('mapPan',[0,0]);}
    if(a==='reset' && ['map1','map2'].includes(target))view.signal('fullMapExtent',false);
    if(a==='in')view.signal('mapZoom',Math.min(15,z*1.6)).signal('mapPan',p.map(v=>v*1.6));
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
    const isSelected = r.key === select;
    const button=document.createElement(onSelect?'button':'div');button.className='summary-row';button.dataset.key=r.key;button.dataset.value=r.value;button.setAttribute('aria-label',`${r.label}: ${format(r.value)}`);
    if(isSelected) button.classList.add('selected');
    if(onSelect){button.type='button';button.setAttribute('aria-pressed',String(isSelected));button.onclick=()=>onSelect(r.key);}
    const label=document.createElement('span');label.className='summary-label';label.textContent=r.label;
    const track=document.createElement('span');track.className='bar-track';const fill=document.createElement('span');fill.className='bar-fill';fill.style.width=`${max ? r.value/max*100 : 0}%`;fill.classList.toggle('selected',isSelected);track.append(fill);
    const value=document.createElement('span');value.className='summary-value';value.textContent=format(r.value);button.append(label,track,value);button.title=r.context||`${r.label}: ${format(r.value)}`;list.append(button);
  });
}
const billions = dollars => `A$${(dollars/1e9).toLocaleString('en-AU',{minimumFractionDigits:3,maximumFractionDigits:3})}bn`;
function setupFacilityFilters(view) {
  const rows=view.data('facilities'),state=document.getElementById('facility-state'),industry=document.getElementById('facility-industry'),search=document.getElementById('facility-search'),lookup=document.getElementById('facility-select');
  populateSelect(state,[...new Set(rows.map(r=>r.State))].sort().map(x=>({x})),r=>r.x,r=>r.x);
  populateSelect(industry,[...new Set(rows.map(r=>r.Industry))].sort().map(x=>({x})),r=>r.x,r=>r.x);
  const update=async()=>{
    view.signal('stateFilter',state.value).signal('industryFilter',industry.value).signal('searchName',search?search.value.trim():'').signal('selectedFacility',null);
    await view.runAsync();
    const shown=rows.filter(r=>(!state.value||r.State===state.value)&&(!industry.value||r.Industry===industry.value));
    populateSelect(lookup,shown.slice().sort((a,b)=>a.Facility_Name.localeCompare(b.Facility_Name)),r=>String(r.Facility_ID),r=>`${r.Facility_Name} · ${r.State} · ${r.Facility_ID}`);
    const matches=search?shown.filter(r=>r.Facility_Name.toLowerCase().includes(search.value.trim().toLowerCase())).length:0;
    document.getElementById('facility-count').textContent=`${shown.length.toLocaleString()} of 1,210 facilities match the filters.${search&&search.value.trim()?` ${matches} name matches highlighted; search does not remove dots.`:''}`;
    const states=[...new Set(rows.map(r=>r.State))].sort();
    const bars=states.map(s=>({key:s,label:s,value:rows.filter(r=>r.State===s&&(!industry.value||r.Industry===industry.value)).length}));
    summaryBars(document.getElementById('facility-summary'),'Reporting facilities by state',bars,354,v=>v.toLocaleString(),state.value,s=>{state.value=state.value===s?'':s;update();});
  };
  state.onchange=industry.onchange=update;
  if(search) search.oninput=update;
  document.getElementById('facility-reset').onclick=()=>{state.value='';industry.value='';if(search)search.value='';update();};
  update();
}
function setupDestinationSummary(view) {
  const rows=view.data('flows'),global=new Map();rows.forEach(r=>global.set(r.Target,(global.get(r.Target)||0)+r.Value_AUD_thousands*1000));const max=Math.max(...global.values());
  const update=key=>{
    const values=new Map();const selected=rows.filter(r=>!key||r.Source===key);selected.forEach(r=>values.set(r.Target,(values.get(r.Target)||0)+r.Value_AUD_thousands*1000));
    const bars=[...values].map(([label,value])=>({key:label,label,value})).sort((a,b)=>b.value-a.value);
    const host=document.getElementById('export-summary');summaryBars(host,key?`Top 8 destinations · ${key}`:'Top 8 export destinations',bars.slice(0,8),max,billions,'');
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
  const unique=[...new Map(rows.map(r=>[r[key],r])).values()].sort((a,b)=>a[label].localeCompare(b[label]));
  populateSelect(select,unique,r=>r[key],r=>r[label]);

  if (target === 'vis07') {
    const resetBtn = document.getElementById('vis07-reset');

    select.onchange = () => {
      const val = select.value || null;
      view.signal(sig, val).runAsync();
    };

    if (resetBtn) {
      resetBtn.onclick = () => {
        select.value = '';
        view.signal(sig, null).runAsync();
      };
    }

    view.addSignalListener('focusSubdivision', (_, sub) => {
      if (select.value !== (sub || '')) {
        select.value = sub || '';
      }
    });

    return;
  }

  select.onchange=()=>view.signal(sig,select.value||null).runAsync();
  select.onchange();
}
// V9 only: observed-year emphasis; original histories, ranks and tooltips remain intact.
let v9Playback = null;
function addV9Playback(spec) {
  const years = Array.from({length:19}, (_,i)=>`${2006+i}–${String(2007+i).slice(-2)}`);
  spec.params.push({name:'activeYearIndex',value:-1});
  // Explicit original domains prevent the filtered guide/points from shrinking scales.
  for (const layer of spec.layer) layer.encoding.x.scale.domain = years;
  const x = {field:'Financial_Year',type:'ordinal',sort:{field:'Year_Order',order:'ascending'},scale:{domain:years,padding:0.5}};
  spec.layer.push({transform:[{filter:'datum.Year_Order === activeYearIndex'},{aggregate:[{op:'count',as:'count'}],groupby:['Financial_Year','Year_Order']}],mark:{type:'rule',color:'#8297a8',strokeWidth:1,strokeDash:[4,4]},encoding:{x}});
  const point = JSON.parse(JSON.stringify(spec.layer[1]));
  point.transform = [{filter:'datum.Year_Order === activeYearIndex'}];
  point.mark.size = 100;
  point.mark.stroke = '#f5f7fa';
  point.mark.strokeWidth = 1;
  spec.layer.push(point);
  return spec;
}
function setupV9Playback(view) {
  const chart=document.getElementById('vis09'), focus=document.getElementById('vis09-focus');
  let controls=document.getElementById('v9-playback');
  if(!controls){
    controls=document.createElement('div'); controls.id='v9-playback';
    controls.innerHTML='<div class="v9-buttons"><button type="button" id="v9-play">Play</button><button type="button" id="v9-pause">Pause</button><button type="button" id="v9-reset">Reset to overview</button></div><label for="v9-year">Financial year</label><input id="v9-year" type="range" min="0" max="18" step="1" value="0"><p id="v9-current">Full-history overview · 2006–07 to 2024–25</p><p id="v9-motion" class="interaction-hint"></p><span id="v9-announcement" class="v9-sr" aria-live="polite" aria-atomic="true"></span>';
    chart.before(controls);
  }
  const play=controls.querySelector('#v9-play'), pauseButton=controls.querySelector('#v9-pause'), reset=controls.querySelector('#v9-reset'), slider=controls.querySelector('#v9-year'), label=controls.querySelector('#v9-current'), announce=controls.querySelector('#v9-announcement');
  const years=[...new Map(view.data('source_0').map(r=>[r.Year_Order,r.Financial_Year])).entries()].sort((a,b)=>a[0]-b[0]).map(r=>r[1]);
  const abort=new AbortController(), motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let index=-1, timer=null, running=false, disposed=false, visible=false, generation=0;
  const listen=(node,event,fn,options={})=>node.addEventListener(event,fn,{...options,signal:abort.signal});
  function sync(){
    play.disabled=running||motion.matches; pauseButton.disabled=!running;
    slider.value=String(Math.max(0,index)); slider.setAttribute('aria-valuetext',years[Math.max(0,index)]);
    label.textContent=index<0?'Full-history overview · 2006–07 to 2024–25':`${running?'Playing':index===years.length-1?'Final year':'Paused'} · ${years[index]}`;
    controls.querySelector('#v9-motion').textContent=motion.matches?'Reduced motion: select a year manually; full overview remains available.':'Optional playback follows observed annual ranks. Full histories remain visible.';
  }
  function pause(){generation++; running=false; if(timer!==null)clearTimeout(timer); timer=null; sync();}
  async function show(next,manual=false){
    index=next; sync();
    if(manual)announce.textContent=next<0?'Full-history overview restored.':`Financial year ${years[next]} selected.`;
    if(!disposed)await view.signal('activeYearIndex',index).runAsync();
  }
  function schedule(){
    const token=generation;
    timer=setTimeout(async()=>{
      timer=null;
      if(disposed||!running||token!==generation)return;
      if(document.hidden||!visible||motion.matches){pause();return;}
      try{await show(index+1);}catch(error){pause();if(!disposed)console.error(error);return;}
      if(disposed||!running||token!==generation)return;
      if(index>=years.length-1)pause(); else schedule();
    },1000);
  }
  listen(play,'click',async()=>{
    if(disposed||running||motion.matches||document.hidden||!visible)return;
    pause(); running=true; const token=generation;
    try{await show(index<0||index===years.length-1?0:index);}catch(error){pause();console.error(error);return;}
    if(!disposed&&running&&token===generation)schedule();
  });
  listen(pauseButton,'click',pause);
  listen(reset,'click',()=>{pause();show(-1,true);});
  listen(slider,'input',()=>{const selected=Number(slider.value);pause();show(selected,true);});
  listen(focus,'change',pause);
  for(const event of ['pointerover','pointerdown','focusin','wheel','touchstart'])listen(chart,event,pause,{passive:true});
  listen(chart,'scroll',pause,{passive:true});
  listen(document,'visibilitychange',()=>{if(document.hidden)pause();});
  listen(window,'resize',pause);
  listen(window,'pagehide',pause);
  listen(motion,'change',()=>{pause();sync();});
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible)pause();});observer.observe(chart);
  sync();
  v9Playback={pause,dispose(){if(disposed)return;pause();disposed=true;abort.abort();observer.disconnect();}};
}
function fullFinancialYearLabel(value) {
  return String(value).replace(/^(\d{4})[–-](\d{2})$/, (_, start, end) => {
    const endingYear=Math.floor(Number(start)/100)*100+Number(end)+(Number(end)<Number(start)%100?100:0);
    return start+'–'+endingYear;
  });
}
function addEmploymentBrushBindings(spec) {
  const compiled=vegaLite.compile(spec).spec;
  compiled.signals = compiled.signals || [];
  if (!compiled.signals.some(s => s.name === 'brushReset')) {
    compiled.signals.push({ name: 'brushReset', value: 0 });
  }
  const overview=compiled.marks.find(m=>m.name==='employmentOverview_group'||m.name==='concat_1_group');
  if (overview && overview.signals) {
    const brush=overview.signals.find(s=>s.name==='brush_x');
    const brushTuple=overview.signals.find(s=>s.name==='brush_tuple');
    const xScale = (overview.scales && overview.scales.find(s => s.name.endsWith('_x') || s.name === 'x'))
      || (compiled.scales && compiled.scales.find(s => s.name.includes('overview') || s.name.includes('concat_1')));
    const scaleName = xScale ? xScale.name : 'concat_1_x';
    if (brush) {
      brush.on = brush.on || [];
      brush.on.push({ events: [{ signal: 'brushReset' }], update: '[0, 0]' });
      brush.on.push({ events: [{ signal: 'periodStart' }, { signal: 'periodEnd' }], update: `isValid(periodStart) && isValid(periodEnd) ? [scale("${scaleName}", periodStart), scale("${scaleName}", periodEnd)] : [0, 0]` });
    }
    if (brushTuple) {
      brushTuple.on = brushTuple.on || [];
      brushTuple.on.push({ events: [{ signal: 'brushReset' }], update: 'null' });
    }
  }
  return compiled;
}
// Supporting controls for V5/V8 only; chart selection and brushing remain native Vega-Lite.
async function setupMatrixPolish(view) {
  const rows=vega.read(await (await fetch('work/data/vis05_state_subdivision_employment.csv')).text(),{type:'csv'});
  const states={NSW:'New South Wales',VIC:'Victoria',QLD:'Queensland',WA:'Western Australia',SA:'South Australia',TAS:'Tasmania',NT:'Northern Territory',ACT:'Australian Capital Territory'};
  const state=document.getElementById('matrix-state'),sub=document.getElementById('matrix-subdivision'),detail=document.getElementById('matrix-detail');
  state.replaceChildren(new Option('All states',''));Object.entries(states).forEach(([code,name])=>state.add(new Option(name,code)));
  sub.replaceChildren(new Option('All subdivisions',''));rows.filter(r=>r.State_Code==='NSW').forEach(r=>sub.add(new Option(r.Subdivision,r.ANZSIC_Code)));
  function describe(){detail.replaceChildren();detail.hidden=!state.value&&!sub.value;if(detail.hidden)return;const r=rows.find(r=>r.State_Code===state.value&&r.ANZSIC_Code===sub.value);let title=document.createElement('strong');title.textContent=(states[state.value]||'All states')+' × '+(sub.selectedOptions[0].textContent);detail.append(title);let p=document.createElement('p');if(r){p.textContent=r.Employment_Share_pct===''?'Employment and share are suppressed or unavailable; this is not zero.':r.Subdivision+' accounts for '+Number(r.Employment_Share_pct).toFixed(2)+'% of '+states[r.State_Code]+'’s manufacturing employment · '+Number(r.Employment_2024_25).toLocaleString('en-AU')+' people · June 2025.';}else p.textContent=state.value?'This row is highlighted; choose a subdivision for exact cell details.':'This column is highlighted across states; choose a state for exact cell details.';detail.append(p);}
  async function apply(){describe();await view.signal('focusState',state.value).signal('focusSubdivision',sub.value).runAsync();}
  view.addSignalListener('matrixCell',(_,cell)=>{if(cell.State_Code?.length&&cell.ANZSIC_Code?.length){state.value=String(cell.State_Code[0]);sub.value=String(cell.ANZSIC_Code[0]);apply();}});
  state.onchange=apply;sub.onchange=apply;document.getElementById('matrix-reset').onclick=()=>{state.value='';sub.value='';view.data('matrixCell_store',[]);apply();};
}
async function setupEmploymentPolish(view) {
  const rows=await (await fetch('work/data/vis08_national_employment_overview.json')).json();
  const start=document.getElementById('employment-start'),end=document.getElementById('employment-end'),inspect=document.getElementById('employment-inspect'),period=document.getElementById('employment-period'),detail=document.getElementById('employment-detail');
  for(const select of [start,end,inspect]){select.replaceChildren();if(select===inspect)select.add(new Option('Choose observed year',''));rows.forEach((r,i)=>select.add(new Option(fullFinancialYearLabel(r.Financial_Year),String(i))));}start.value='0';end.value='18';
  let selectedBounds=null;
  const stamp=r=>Date.parse(r.Date+'T00:00:00Z');
  function feedback(brush){const clear=view.tooltip();if(typeof clear==='function')clear(view,{},null,null);const range=brush?.Date;selectedBounds=range?.length?range:null;if(inspect.value!=='')showYear(+inspect.value);if(!range?.length){period.textContent='Showing full history · 2006–2007 to 2024–2025';start.value='0';end.value='18';return;}const selected=rows.filter(r=>stamp(r)>=+range[0]&&stamp(r)<=+range[1]);if(!selected.length){period.textContent='No observed June-end point in this interval. Widen the selection or reset.';return;}period.textContent='Showing '+fullFinancialYearLabel(selected[0].Financial_Year)+' to '+fullFinancialYearLabel(selected.at(-1).Financial_Year)+' · '+selected.length+' observed years';start.value=String(rows.indexOf(selected[0]));end.value=String(rows.indexOf(selected.at(-1)));}
  function showYear(i){const r=rows[i];if(!r)return;inspect.value=String(i);detail.hidden=false;detail.textContent=fullFinancialYearLabel(r.Financial_Year)+' · '+r.Employment_Thousands.toLocaleString('en-AU',{minimumFractionDigits:1,maximumFractionDigits:1})+' thousand people employed at June end · observed annual value.'+(selectedBounds&&(stamp(r)<+selectedBounds[0]||stamp(r)>+selectedBounds[1])?' Outside the current focused period.':'');}
  view.addSignalListener('brush',(_,b)=>feedback(b));view.addSignalListener('employmentPoint',(_,p)=>{if(p.Financial_Year?.length)showYear(rows.findIndex(r=>r.Financial_Year===p.Financial_Year[0]));});
  async function applyRange(){let a=+start.value,b=+end.value;if(a>b){if(document.activeElement===start)end.value=String(a);else start.value=String(b);a=+start.value;b=+end.value;}const bounds=[stamp(rows[a])-1,stamp(rows[b])+1];await view.signal('periodStart',bounds[0]).signal('periodEnd',bounds[1]).runAsync();}
  start.onchange=applyRange;end.onchange=applyRange;inspect.onchange=()=>{if(inspect.value===''){detail.hidden=true;return;}showYear(+inspect.value);};
  const resetHandler=async()=>{
    start.value='0';
    end.value='18';
    inspect.value='';
    selectedBounds=null;
    if(detail){detail.hidden=true;detail.textContent='';}
    if(period){period.textContent='Showing full history · 2006–2007 to 2024–2025';}
    try{view.data('brush_store',[]);}catch(_){}
    try{view.data('employmentPoint_store',[]);}catch(_){}
    try{
      const nextReset=(view.signal('brushReset')||0)+1;
      await view
        .signal('brushReset',nextReset)
        .signal('periodStart',null)
        .signal('periodEnd',null)
        .signal('brush',{})
        .signal('employmentPoint',{})
        .runAsync();
    }catch(_){
      try{await view.signal('periodStart',null).signal('periodEnd',null).runAsync();}catch(_){}
    }
    const clear=view.tooltip();
    if(typeof clear==='function')clear(view,{},null,null);
    feedback({});
  };
  document.getElementById('employment-reset').onclick=resetHandler;
  feedback({});
}
let v1HighlightedClass=-1;
async function setupV1ClassHighlight(view) {
  const legend=document.getElementById('rate-legend'),wrap=legend.closest('.rate-legend-wrap'),status=document.getElementById('rate-highlight-status');
  const buttons=Array.from(legend.querySelectorAll('[data-rate-class]'));
  const counts=await (await fetch('work/data/viz1-class-counts.json')).json();
  async function apply() {
    buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===v1HighlightedClass)));
    wrap.dataset.classActive=String(v1HighlightedClass>=0);
    status.textContent=v1HighlightedClass<0?'All colour ranges shown.':buttons[v1HighlightedClass].textContent.trim()+' · '+counts.class_counts[v1HighlightedClass].toLocaleString('en-AU')+' matching SA2s. Other areas remain visible as context.';
    await view.signal('selectedRateClass',v1HighlightedClass).runAsync();
  }
  buttons.forEach((button,i)=>{button.onclick=()=>{v1HighlightedClass=v1HighlightedClass===i?-1:i;apply();};});
  const reset=document.getElementById('rate-show-all');if(reset)reset.onclick=()=>{v1HighlightedClass=-1;apply();};
  await apply();
}
// V1-only visual aid. Original Vega tooltip values and map signals are untouched.
async function setupV1TooltipLeader(view) {
  window.v1TooltipLeaderCleanup?.();
  const host = document.getElementById('map1');
  const original = view.tooltip();
  const ns = 'http://www.w3.org/2000/svg';
  const overlay = document.createElementNS(ns, 'svg');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('class', 'v1-tooltip-connector');
  const line = document.createElementNS(ns, 'line');
  line.setAttribute('stroke', '#34495B');
  line.setAttribute('stroke-width', '1.25');
  overlay.append(line); document.body.append(overlay);
  let active = null, pinned = false, frame = 0, handler = null, touchStart = null;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  function clear() {
    active?.path.classList.remove('v1-tooltip-pinned');
    active = null; pinned = false; overlay.style.display = 'none';
    const tip = document.getElementById('vg-tooltip-element');
    if (tip) tip.style.visibility = ''; 
    original.call(view, handler, null, null, null);
  }
  function point(path, event) {
    const matrix = path.getScreenCTM();
    if (!matrix) return null;
    const box = path.getBBox();
    let local = new DOMPoint(box.x + box.width / 2, box.y + box.height / 2);
    const screen = local.matrixTransform(matrix);
    const bounds = host.getBoundingClientRect();
    if (!path.isPointInFill(local) || screen.x < Math.max(0, bounds.left) ||
        screen.x > Math.min(innerWidth, bounds.right) || screen.y < Math.max(0, bounds.top) ||
        screen.y > Math.min(innerHeight, bounds.bottom)) {
      local = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    }
    return local;
  }
  function draw() {
    frame = 0;
    if (!active?.path.isConnected) { overlay.style.display = 'none'; return; }
    const matrix = active.path.getScreenCTM();
    const tip = document.getElementById('vg-tooltip-element');
    if (!matrix || !tip?.classList.contains('visible')) { overlay.style.display = 'none'; return; }
    const a = active.local.matrixTransform(matrix);
    const map = host.getBoundingClientRect();
    if (a.x < Math.max(0,map.left) || a.x > Math.min(innerWidth,map.right) ||
        a.y < Math.max(0,map.top) || a.y > Math.min(innerHeight,map.bottom)) {
      overlay.style.display = 'none'; tip.style.visibility = 'hidden'; return;
    }
    tip.style.visibility = ''; tip.style.position = 'fixed';
    const r = tip.getBoundingClientRect(), gap = 22, margin = 10;
    let x = a.x + gap;
    if (x + r.width > innerWidth - margin) x = a.x - gap - r.width;
    x = clamp(x, margin, Math.max(margin, innerWidth - r.width - margin));
    let y = clamp(a.y - r.height / 2, margin, Math.max(margin, innerHeight-r.height-margin));
    // On small screens a wide tooltip goes above/below rather than covering its anchor.
    if (a.x >= x && a.x <= x+r.width) {
      y = a.y - r.height - gap >= margin ? a.y-r.height-gap : a.y+gap;
      y = clamp(y, margin, Math.max(margin,innerHeight-r.height-margin));
    }
    tip.style.left = `${x}px`; tip.style.top = `${y}px`;
    const edges = [
      [x,clamp(a.y,y,y+r.height)], [x+r.width,clamp(a.y,y,y+r.height)],
      [clamp(a.x,x,x+r.width),y], [clamp(a.x,x,x+r.width),y+r.height]
    ];
    edges.sort((p,q)=>Math.hypot(p[0]-a.x,p[1]-a.y)-Math.hypot(q[0]-a.x,q[1]-a.y));
    line.setAttribute('x1',edges[0][0]); line.setAttribute('y1',edges[0][1]);
    line.setAttribute('x2',a.x); line.setAttribute('y2',a.y);
    overlay.style.display = 'block';
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(draw); }
  function show(event,item,value, persist=false) {
    const path = event?.target?.closest?.('#map1 svg path');
    if (!path || !value) return;
    const local = point(path,event); if (!local) return;
    active?.path.classList.remove('v1-tooltip-pinned');
    active = {path,local}; pinned = persist;
    if (persist) path.classList.add('v1-tooltip-pinned');
    original.call(view,handler,event,item,value); draw();
  }
  view.tooltip(function(h,event,item,value) {
    handler = h;
    if (pinned) return;
    if (value == null) { clear(); return; }
    show(event,item,value);
  });
  await view.runAsync(); // Public tooltip setter resets the renderer.
  function touchDown(event) {
    touchStart = [event.clientX,event.clientY];
  }
  function tap(event,item) {
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
    if (touchStart && Math.hypot(event.clientX-touchStart[0],event.clientY-touchStart[1]) > 6) return;
    if (item?.tooltip) show(event,item,item.tooltip,true);
  }
  function outside(event) { if (pinned && !host.contains(event.target)) clear(); }
  function leave() { if (!pinned) clear(); }
  function reset(event) { if (event.target.closest('[data-action="reset"]')) clear(); }
  const toolbar = document.querySelector('[data-map="map1"]');
  view.addEventListener('pointerdown',touchDown);
  view.addEventListener('pointerup',tap);
  host.addEventListener('pointerleave',leave);
  document.addEventListener('pointerdown',outside,true);
  toolbar.addEventListener('click',reset);
  window.addEventListener('scroll',schedule,true);
  ['mapZoom','mapPan','fullMapExtent'].forEach(s=>view.addSignalListener(s,schedule));
  window.v1TooltipLeaderCleanup = () => {
    window.v1TooltipLeaderCleanup = null;
    cancelAnimationFrame(frame); clear(); overlay.remove(); view.tooltip(original);
    view.removeEventListener('pointerdown',touchDown);
    view.removeEventListener('pointerup',tap);
    host.removeEventListener('pointerleave',leave);
    document.removeEventListener('pointerdown',outside,true);
    toolbar.removeEventListener('click',reset);
    window.removeEventListener('scroll',schedule,true);
    ['mapZoom','mapPan','fullMapExtent'].forEach(s=>view.removeSignalListener(s,schedule));
  };
}
// Opt-in in-page timings; browser automation latency is excluded.
function setupV1Performance(view) {
  if (!new URLSearchParams(location.search).has('v1perf')) return;
  const output = document.createElement("output");
  output.id = "v1-redraw-timing"; output.setAttribute("aria-live","polite");
  document.querySelector('[data-map="map1"]').append(output);
  const run = view.runAsync.bind(view);
  let sample = 0;
  view.runAsync = async function(...args) {
    const zoom = view.signal('mapZoom'), pan = view.signal('mapPan').slice();
    const start = performance.now();
    const result = await run(...args);
    const ms = +(performance.now()-start).toFixed(1);
    output.textContent = `V1 redraw ${++sample}: ${ms} ms`;
    console.info('[V1 performance] '+JSON.stringify({sample,zoom,pan,redrawMs:ms}));
    return result;
  };
}
