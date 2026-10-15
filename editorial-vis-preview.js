// Preview-only geometry dimensions and axis-label wrapping; quantitative encodings stay intact.
function editorialFigureDimensions(spec,target,container) {
  const mobile=innerWidth<=620, paired=innerWidth>=900;
  if(target==='map1'){spec=JSON.parse(JSON.stringify(spec).replaceAll('#F1F5F9','#D9E7F4'));if(!mobile)spec.height=Math.min(800,Math.round(container.clientWidth*.88));}
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
 return spec;
}
function editorialChordFit(spec,container){
 const width=container.clientWidth,compact=width<760;spec.width=width;spec.height=compact?Math.max(430,Math.round(width*.26*2.9+40)):420;
 const signal=n=>spec.signals.find(s=>s.name===n);
 signal('radius').update=compact?'width*.26':'min(230,width*.23)';signal('cx').update=compact?'width*.34':'width*.38';signal('cy').update=compact?'height*.43':'height/2';
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
