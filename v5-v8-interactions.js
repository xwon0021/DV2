function fullFinancialYearLabel(value) {
  return String(value).replace(/^(\d{4})[–-](\d{2})$/, (_, start, end) => {
    const endingYear=Math.floor(Number(start)/100)*100+Number(end)+(Number(end)<Number(start)%100?100:0);
    return start+'–'+endingYear;
  });
}
function addEmploymentBrushBindings(spec) {
  const compiled=vegaLite.compile(spec).spec;
  const overview=compiled.marks.find(m=>m.name==='employmentOverview_group');
  const brush=overview.signals.find(s=>s.name==='brush_x');
  brush.on.push({events:[{signal:'periodStart'},{signal:'periodEnd'}],update:'isValid(periodStart) && isValid(periodEnd) ? [scale("employmentOverview_x", periodStart), scale("employmentOverview_x", periodEnd)] : [0,0]'});
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
  document.getElementById('employment-reset').onclick=async()=>{await view.signal('periodStart',null).signal('periodEnd',null).runAsync();feedback({});};feedback({});
}
