// Preview-only geometry dimensions and axis-label wrapping; quantitative encodings stay intact.
function editorialFigureDimensions(spec,target,container) {
  const mobile=innerWidth<=620, paired=innerWidth>=900;
  if(target==='map1'){
    const selectedPalette=['#F6F1DE','#C9DBC5','#86BCBB','#4795B1','#286B9A','#254573','#191E43'];
    const mapLayer=spec.layer?.find(layer=>layer.encoding?.color?.field==='Businesses_per_10000');
    if(mapLayer?.encoding.color.scale)mapLayer.encoding.color.scale.range=selectedPalette;
    if(!mobile)spec.height=Math.min(540,Math.round(container.clientWidth*.65));
  }
  if(target==='map2'&&!mobile)spec.height=400;
  if(target==='vis06'&&paired){spec.height=520;spec.encoding.y.axis.labelLimit=155;spec.encoding.y.axis.labelFontSize=11;spec.encoding.color.legend.direction='vertical';spec.encoding.color.legend.columns=1;}
  if(target==='vis07'&&paired){
    spec.height=580;
    spec.axes[0].encode={labels:{update:{text:{signal:"datum.value === 'Wages and salaries' ? ['Wages and','salaries'] : datum.value === 'Sales and service income' ? ['Sales and','service income'] : datum.value === 'Industry value added' ? ['Industry value','added'] : datum.value"}}}};
  }
  if(target==='vis12'){spec.width=Math.max(180,container.clientWidth-10);spec.autosize={type:'fit',contains:'padding'};}
  if(target==='vis09'&&!mobile)spec.height=350;
  return spec;
}
document.getElementById('inspect-tasmania-food').addEventListener('click',()=>{
  const state=document.getElementById('matrix-state'),subdivision=document.getElementById('matrix-subdivision');
  state.value='TAS';subdivision.value='11';
  subdivision.dispatchEvent(new Event('change',{bubbles:true}));
  document.getElementById('heatmap').scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
});

function addEditorialFlowNavigation(spec) {
 const signal=name=>spec.signals.find(s=>s.name===name),down={type:'pointerdown',filter:['event.button === 0']};
 spec.signals.push({name:'v1Dragging',value:false,on:[{events:down,update:'true'},{events:'window:pointerup, window:pointercancel',update:'false'}]});
 signal('mapZoom').on=[];signal('panEnabled').value=true;
 signal('panStart').on=[{events:down,update:'[x(),y(),mapPan[0],mapPan[1]]'}];
 signal('mapPan').on=[{events:{source:'window',type:'pointermove',throttle:32,between:[down,{source:'window',type:'pointerup'}]},update:'v1Dragging ? [panStart[2]+x()-panStart[0],panStart[3]+y()-panStart[1]] : mapPan'}];
 spec.projections[0]={
  name:'worldProjection_base',
  type:'equalEarth',
  rotate:[-150,0,0],
  scale:{signal:'min((width-20)/5.5,(height-28)/2.65)'},
  translate:{signal:'[width/2,height/2]'}
 };
 for(const d of spec.data){
  for(const t of d.transform||[]){
   if(t.projection==='worldProjection')t.projection='worldProjection_base';
  }
 }
 for(const mark of spec.marks){
  mark.clip=true;
  const geo=mark.transform?.find(t=>t.type==='geoshape');
  if(geo){
   const src=mark.from.data,name=src+'_v1_paths';
   if(src==='stateRates'){
    spec.data.push({
     name,source:'stateRates',
     transform:[
      {type:'geopath',projection:'worldProjection_base',as:'sa2Path'},
      {type:'aggregate',groupby:['State','Rate'],fields:['sa2Path'],ops:['values'],as:['items']},
      {type:'formula',expr:"join(pluck(datum.items,'sa2Path'),'')",as:'v1ProjectedPath'}
     ]
    });
   }else if(src==='world'){
    spec.data.push({
     name,source:'world',
     transform:[
      {type:'geopath',projection:'worldProjection_base',as:'countryPath'},
      {type:'aggregate',fields:['countryPath'],ops:['values'],as:['items']},
      {type:'formula',expr:"join(pluck(datum.items,'countryPath'),'')",as:'v1ProjectedPath'}
     ]
    });
   }else{
    spec.data.push({
     name,source:src,
     transform:[{type:'geopath',projection:'worldProjection_base',as:'v1ProjectedPath'}]
    });
   }
   mark.from.data=name;mark.type='path';
   mark.transform=mark.transform.filter(t=>t!==geo);
   const update=mark.encode.update;
   update.path={field:'v1ProjectedPath'};
   update.scaleX={signal:'mapZoom'};update.scaleY={signal:'mapZoom'};
   update.x={signal:'width/2*(1-mapZoom)+mapPan[0]'};
   update.y={signal:'height/2*(1-mapZoom)+mapPan[1]'};
   if(update.strokeWidth){
    const widths=Array.isArray(update.strokeWidth)?update.strokeWidth:[update.strokeWidth];
    update.strokeWidth=widths.map(w=>{const encoded={...w,signal:`(${w.signal ?? w.value})/mapZoom`};delete encoded.value;return encoded;});
   }
  }else if(mark.name==='flowLines'||mark.name==='flowHitTarget'){
   const update=mark.encode.update;
   update.scaleX={signal:'mapZoom'};update.scaleY={signal:'mapZoom'};
   update.x={signal:'width/2*(1-mapZoom)+mapPan[0]'};
   update.y={signal:'height/2*(1-mapZoom)+mapPan[1]'};
   update.strokeWidth=mark.name==='flowLines'?{signal:"scale('flowWidth',datum.Value_AUD_thousands)/mapZoom"}:{signal:'8/mapZoom'};
  }else if(mark.encode?.update?.x?.field==='px'||mark.encode?.update?.x?.field==='tipX'){
   const update=mark.encode.update,xf=update.x.field,yf=update.y.field;
   update.x={signal:`width/2*(1-mapZoom)+mapPan[0]+datum.${xf}*mapZoom`};
   update.y={signal:`height/2*(1-mapZoom)+mapPan[1]+datum.${yf}*mapZoom`};
  }
 }
 return spec;
}
function editorialChordFit(spec,container){
 const width=container.clientWidth,compact=width<760;spec.width=width;
 const radius=compact?width*.24:Math.min(190,width*.215);
 spec.height=Math.max(compact?470:520,Math.ceil(radius*2.56+40));
 const signal=n=>spec.signals.find(s=>s.name===n);
 signal('radius').update=compact?'width*.24':'min(190,width*.215)';signal('cx').update=compact?'width*.34':'width*.38';signal('cy').update='height/2';
 const labels=spec.marks.find(m=>m.name==='industryLabels').encode.update;
 labels.limit={signal:compact?'width*.31-10':'width*.30-10'};
 if(!compact){
  labels.x={signal:'datum.Side > 0 ? width*.70 : 108'};
  for(const mark of spec.marks){const u=mark.encode?.update;if(u?.path?.signal?.includes('datum.Mid'))u.path.signal="'M'+(cx+sin(datum.Mid)*radius*1.16)+','+(cy-cos(datum.Mid)*radius*1.16)+'L'+(cx+datum.Side*radius*1.22)+','+(cy+datum.LabelY*radius)+'L'+(datum.Side > 0 ? width*.70-4 : 113)+','+(cy+datum.LabelY*radius)";}
 }
 if(compact){
  labels.x={signal:'datum.Side > 0 ? width*.67 : cx'};
  labels.y={signal:'datum.Side > 0 ? cy+datum.LabelY*160 : cy+radius*1.4'};
  labels.align={signal:"datum.Side > 0 ? 'left' : 'center'"};labels.fontSize={value:width<450?10:12};
  for(const mark of spec.marks){const u=mark.encode?.update;if(u?.path?.signal?.includes('datum.Mid'))u.path.signal="'M'+(cx+sin(datum.Mid)*radius*1.16)+','+(cy-cos(datum.Mid)*radius*1.16)+'L'+(datum.Side > 0 ? cx+radius*1.22 : cx-radius*1.22)+','+(datum.Side > 0 ? cy+datum.LabelY*160 : cy+radius*1.4)+'L'+(datum.Side > 0 ? width*.67-4 : cx)+','+(datum.Side > 0 ? cy+datum.LabelY*160 : cy+radius*1.4)";}
 }
 return spec;
}
function editorialSlopeFit(spec,container){
 spec.width=container.clientWidth;const compact=spec.width<760;
 for(const mark of spec.marks){const u=mark.encode?.update;if(!u)continue;
  for(const key of ['x','x2']){
   if(u[key]?.value===240)u[key]={signal:'min(240,width*.34)'};
   if(u[key]?.signal)u[key].signal=u[key].signal.replace(/width-240/g,'width-min(240,width*.34)').replace(/width-218/g,'width-min(240,width*.34)+22').replace(/^240$/,'min(240,width*.34)').replace(/^218/,'min(240,width*.34)-22');
  }
  if(mark.type==='text'&&['labels','rightLabels'].includes(mark.name)){
   u.limit={signal:'min(195,width*.34-23)'};
   if(compact){const value=mark.name==='labels'?'IVA_2023_24':'IVA_2024_25';u.text={signal:`[datum.Short,format(datum.${value},',.0f')]`};u.fontSize={value:10};u.lineHeight={value:11};}
  }
  if(mark.type==='text'&&u.text?.value?.includes('common vertical scale')&&compact){u.text.value='IVA · A$ million · common vertical scale';u.fontSize={value:10};}
 }
 return spec;
}

// Navigate to the normal-flow chapter start, never a sticky heading's current box.
(() => {
  const nav=document.querySelector('.chapter-index');
  function showChapter(hash){
    const section=document.getElementById(hash.slice(1));
    if(!section?.matches('main > .story-section'))return;
    const top=window.scrollY+section.getBoundingClientRect().top
      +parseFloat(getComputedStyle(section).paddingTop)-nav.getBoundingClientRect().height-12;
    window.scrollTo({top:Math.max(0,top),behavior:'instant'});
  }
  nav.addEventListener('click',event=>{
    const link=event.target.closest('a[href^="#"]');
    if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    event.preventDefault();
    history.pushState(null,'',link.hash);
    showChapter(link.hash);
  });
  window.addEventListener('hashchange',()=>showChapter(location.hash));
})();
const rateColors = ["#F6F1DE", "#C9DBC5", "#86BCBB", "#4795B1", "#286B9A", "#254573", "#191E43"];
const chartViews = new Map();
const specTargets = [
  ["map1", "work/viz1.vg.json?v=final"],
  ["map3", "work/viz3.vg.json?v=final"],
  ["vis04", "work/viz4.vg.json?v=final"],
  ["heatmap", "work/viz5.vg.json?v=final"],
  ["vis06", "work/viz6.vg.json?v=final"],
  ["vis07", "work/viz7.vg.json?v=final"],
  ["vis08", "work/viz8.vg.json?v=final"],
  ["vis10", "work/viz10.vg.json?v=final"],
  ["vis11", "work/viz11.vg.json?v=final"],
  ["vis13", "work/viz13.vg.json?v=final"]
];
function getBoundaryUrl() {
  return "work/data/SA2_2021_AUST_GDA2020_web.json";
}

function showRateLegend(breaks) {
  const labels = [
    `0–${breaks[0].toLocaleString("en-AU", { maximumFractionDigits: 1 })}`,
    ...breaks.slice(1).map((value, index) => `>${breaks[index].toLocaleString("en-AU", { maximumFractionDigits: 1 })}–${value.toLocaleString("en-AU", { maximumFractionDigits: 1 })}`),
    `>${breaks.at(-1).toLocaleString("en-AU", { maximumFractionDigits: 1 })}`
  ];
  document.getElementById("rate-legend").innerHTML = labels.map((label, index) =>
    `<button type="button" class="legend-item" data-rate-class="${index}" aria-pressed="false"><span class="swatch" style="background:${rateColors[index]}"></span><span>${label}</span></button>`
  ).join("");
}

async function loadSpec(target, url) {
  const container = document.getElementById(target);
  if (target === "vis09") { v9Playback?.dispose(); v9Playback = null; }
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load ${url} (${response.status})`);
    let spec = await response.json();
    spec = editorialFigureDimensions(spec,target,container);
    if (target === "map1") spec.data.url = await getBoundaryUrl();
    if (target === "map2") spec.layer[0].data.url = await getBoundaryUrl();
    if ((target === "map1" || target === "map2") && window.innerWidth <= 620) {
      spec.height = target === "map1" ? 320 : 280;
    }
    if (target === "vis06" && window.innerWidth <= 620) {
      spec.encoding.color.legend.direction = "vertical";
      spec.encoding.color.legend.columns = 1;
      spec.encoding.x.axis = { values: [-15, 0, 15, 30], title: "Growth (%)" };
      spec.encoding.y.axis.labelLimit = 115;
      spec.encoding.y.axis.labelFontSize = 11;
      spec.height = 650;
    }
    if (target === "vis07") {
      spec.width = container.clientWidth;
      if (window.innerWidth <= 620) {
        spec.height = 330;
        spec.padding = { left: 52, right: 12, top: 14, bottom: 60 };
        spec.axes[0].encode = { labels: { update: { text: { signal: "datum.value === 'Wages and salaries' ? 'Wages' : datum.value === 'Sales and service income' ? 'Sales' : datum.value === 'Industry value added' ? 'IVA' : datum.value" } } } };
      }
    }
    if (target === "vis07" && window.innerWidth <= 620) {
      Object.assign(spec.axes[0].encode.labels.update, {angle:{value:-25},align:{value:"right"},baseline:{value:"middle"},dy:{value:7}});
    }
    if (target === "vis09") spec = addV9Playback(spec);
    if (target === "vis09" && window.innerWidth <= 620) {
      spec.width = 650;
      spec.height = 430;
    }
    if (target === "vis04") {
      const compact = container.clientWidth < 620;
      spec.padding = compact
        ? { left: 118, right: 16, top: 48, bottom: 46 }
        : { left: 220, right: 112, top: 48, bottom: 46 };
      spec.width = Math.max(185, container.clientWidth - spec.padding.left - spec.padding.right);
      spec.height = compact ? 570 : 620;
    }
    if (target === "heatmap" && window.innerWidth < 720) spec.width = { step: 48 };
    if (target === "vis13") spec = editorialSlopeFit(spec,container);
    if (target === "vis11") {
      spec.width = container.clientWidth;
      spec = editorialChordFit(spec,container);
    }
    if (target === "vis08") {
      delete spec.width;
      spec.vconcat.forEach(v => { v.width = Math.max(180, Math.min(container.clientWidth, window.innerWidth - 24) - (window.innerWidth <= 620 ? 90 : 70)); });
      spec.vconcat[0].height = window.innerWidth <= 620 ? 240 : 300;
      if (window.innerWidth <= 620) { spec.vconcat[0].layer[3].mark.align = "right"; spec.vconcat[0].layer[3].encoding.text.datum = "2019–2020 low: 830.2k"; }
    }
    if (target === "map3" || target === "vis10") {
      spec.width = container.clientWidth;
      spec.height = window.innerWidth <= 620 ? (target === "map3" ? 320 : 290) : (target === "vis10" ? Math.min(440, Math.round(container.clientWidth * 0.49)) : 470);
    }
    if (target === "vis12" && window.innerWidth <= 620) {
      spec.width = Math.max(180, container.clientWidth - 10);
      spec.height = 280;
      spec.encoding.x.axis.title = "Reported share (%)";
      spec.encoding.x.axis.values = [0, 50, 100];
      spec.encoding.y.axis.labelExpr = "datum.label === 'Have been looking to buy more' ? ['Have been looking', 'to buy more'] : datum.label === 'More likely with known origin' ? ['More likely with', 'known origin'] : datum.label";
      spec.encoding.y.axis.labelLimit = 155;
      spec.encoding.y.axis.labelFontSize = 12;
    }
    if (target === "vis10") spec = addEditorialFlowNavigation(spec);
    if (target === "vis08") spec = addEmploymentBrushBindings(spec);
    if (["map1", "map2", "map3"].includes(target)) spec = addMapNavigation(spec, target, container);
    if (target === "map1") { window.v1NavigationCleanup?.(); window.v1TooltipLeaderCleanup?.(); }
    if (["map2","map3","vis10"].includes(target)) window[target+"NavigationCleanup"]?.();
    chartViews.get(target)?.finalize();
    const result = await vegaEmbed(container, spec, { actions: true, renderer: ["map1", "map2", "map3", "vis04", "heatmap", "vis07", "vis09", "vis10", "vis11", "vis13"].includes(target) ? "svg" : "canvas" });
    chartViews.set(target, result.view);
    if (target === "map1") { await setupV1ClassHighlight(result.view); await setupV1TooltipLeader(result.view); setupV1Performance(result.view); }
    if (["map3", "vis10", "vis11"].includes(target)) setupRedesignControls(target, result.view);
    if (["map1", "map2", "map3"].includes(target)) setupMapNavigation(target, result.view);
    if (target === "vis10") setupV1Navigation(result.view,target);
    if (target === "vis08") setupEmploymentPolish(result.view);
    if (target === "heatmap") setupMatrixPolish(result.view);
    if (target === "map3") setupFacilityFilters(result.view);
    if (target === "vis10") setupDestinationSummary(result.view);
    if (target === "vis11") setupIndustrySummary(result.view);
    if (["vis07", "vis09", "vis13"].includes(target)) setupProfileFocus(target, result.view);
    if (target === "vis09") setupV9Playback(result.view);
  } catch (error) {
    container.replaceChildren();
    const message = document.createElement("p");
    message.className = "load-error";
    message.textContent = "Chart unavailable. Serve this folder over HTTP and check that its data files are present.";
    container.append(message);
    console.error(error);
  }
}


function populateSelect(select, rows, getKey, getLabel) {
  const previous = select.value;
  select.querySelectorAll("option:not(:first-child)").forEach(option => option.remove());
  rows.forEach(row => select.add(new Option(getLabel(row), getKey(row))));
  select.value = Array.from(select.options).some(option => option.value === previous) ? previous : "";
}
const aud = value => "A$" + value.toLocaleString("en-AU", { maximumFractionDigits: 0 });
function setupRedesignControls(target, view) {
  if (target === "map3") {
    const select = document.getElementById("facility-select"), detail = document.getElementById("facility-detail");
    const rows = view.data("facilities").slice().sort((a,b) => a.Facility_Name.localeCompare(b.Facility_Name));
    const repeated = new Map();
    rows.forEach(r => { const key = r.Facility_Name + "|" + r.State; repeated.set(key, (repeated.get(key) || 0) + 1); });
    populateSelect(select, rows, r => String(r.Facility_ID), r => `${r.Facility_Name} · ${r.State}${repeated.get(r.Facility_Name + "|" + r.State) > 1 ? " · ID " + r.Facility_ID : ""}`);
    const show = key => {
      const row = rows.find(r => String(r.Facility_ID) === String(key));
      detail.textContent = row ? `${row.Facility_Name} · ${row.State} · ${row.Industry} · ${row.Reporting_Period}. Source: NPI reporting facilities; not all manufacturers or Australian Made certified facilities.` : "Hover or tap a dot for its name and primary industry. The lookup also reaches facilities sharing coordinates.";
    };
    select.onchange = () => { const row = rows.find(r => String(r.Facility_ID) === select.value); view.signal("selectedFacility", row?.Facility_ID ?? null).runAsync(); show(select.value); };
    view.addSignalListener("selectedFacility", (_, key) => { select.value = key == null ? "" : String(key); show(key); });
    select.onchange();
  }
  if (target === "vis10") {
    const state = document.getElementById("export-state-select"), flow = document.getElementById("export-flow-select"), reset = document.getElementById("export-filter-reset"), detail = document.getElementById("export-flow-detail");
    const rows = view.data("flows"), origins = view.data("origins");
    populateSelect(state, origins, r => r.State, r => r.State);
    const showFlows = () => populateSelect(flow, rows.filter(r => !state.value || r.Source === state.value), r => r.Key, r => `${r.Source} → ${r.Target}`);
    const show = key => {
      const row = rows.find(r => r.Key === key);
      detail.textContent = row ? `${row.Source} → ${row.Target}: ${aud(row.Value_AUD_thousands * 1000)}. STM + ETM (Simply + Elaborately Transformed Manufactures), 2025. Recorded state-of-origin Export basis; representative areas, not ports or shipping routes.` : "Hover or tap a connection, or choose an origin and destination above.";
    };
    state.onchange = () => { view.signal("selectedState", state.value).signal("selectedFlow", "").runAsync(); flow.value = ""; showFlows(); show(""); };
    flow.onchange = () => { view.signal("selectedFlow", flow.value).runAsync(); show(flow.value); };
    reset.onclick = () => {
      state.value = "";
      flow.value = "";
      showFlows();
      show("");
      view.signal("selectedState", "").signal("selectedFlow", "").runAsync();
    };
    view.addSignalListener("selectedState", (_, key) => { state.value = key; flow.value = ""; showFlows(); });
    view.addSignalListener("selectedFlow", (_, key) => { flow.value = key; show(key); });
    showFlows(); view.signal("selectedState", state.value).signal("selectedFlow", flow.value).runAsync(); show(flow.value);
  }
  if (target === "vis11") {
    const industry = document.getElementById("industry-select"), relationship = document.getElementById("relationship-select"), detail = document.getElementById("relationship-detail");
    const nodes = view.data("nodes"), rows = view.data("edges");
    populateSelect(industry, nodes, r => r.Code, r => r.Name);
    const showEdges = () => populateSelect(relationship, rows.filter(r => !industry.value || r.Source === industry.value || r.Target === industry.value), r => r.Key, r => `${r.Source_Name} → ${r.Target_Name}`);
    const show = key => { const row = rows.find(r => r.Key === key); detail.textContent = row ? `Supplier → User: ${row.Source_Name} → ${row.Target_Name}. ${aud(row.Value_AUD_millions * 1000000)} (source A$ million), 2023–24 domestic intermediate use at basic prices.${row.Source === row.Target ? " Manufacturing self-use." : ""}` : "Arrow tips point to the using division. Manufacturing → Manufacturing is self-use, not a reciprocal pair."; };
    industry.onchange = () => { view.signal("selectedIndustry", industry.value).signal("selectedEdge", "").runAsync(); relationship.value = ""; showEdges(); show(""); };
    relationship.onchange = () => { view.signal("selectedEdge", relationship.value).runAsync(); show(relationship.value); };
    view.addSignalListener("selectedIndustry", (_, key) => { industry.value = key; showEdges(); });
    view.addSignalListener("selectedEdge", (_, key) => { relationship.value = key; show(key); });
    showEdges(); view.signal("selectedIndustry", industry.value).signal("selectedEdge", relationship.value).runAsync(); show(relationship.value);
  }
}

async function start() {
  try {
    const response = await fetch("work/data/validation.json");
    if (!response.ok) throw new Error("Validation metadata is unavailable");
    const validation = await response.json();
    showRateLegend(validation.visualisation_1_2.rate_class_breaks);
  } catch (error) {
    document.getElementById("rate-legend").textContent = "Legend metadata unavailable.";
    console.error(error);
  }
  await Promise.all(specTargets.map(([target, url]) => loadSpec(target, url)));
  let previousWidth = window.innerWidth;
  let resizeTimer;
  let resizeQueue = Promise.resolve();
  window.addEventListener("resize", () => {
    if (window.innerWidth === previousWidth) return;
    previousWidth = window.innerWidth;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeQueue = resizeQueue.then(() =>
        Promise.all(specTargets.map(([target, url]) => loadSpec(target, url)))
      );
    }, 180);
  });
}

start();
