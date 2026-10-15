// Preview-only V1/V2 navigation; production helpers remain unchanged.
// Native Vega gestures adapted from https://vega.github.io/vega/examples/zoomable-world-map/.
// Regional Australia stays north-up: only scale and pixel translation change.
function addV1Navigation(spec) {
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
    const next=Math.max(1,Math.min(12,current*factor));
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
    pendingZoom=Math.max(1,Math.min(12,event.key==='-'?current/1.6:current*1.6));
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
  const output=toolbar.querySelector('output');
  output.textContent=`${view.signal('mapZoom').toFixed(1)}×`;
  toolbar.querySelectorAll('button').forEach(button=>button.onclick=async()=>{
    cancelAnimationFrame(frame);frame=0;pendingZoom=null;
    const action=button.dataset.action, zoom=view.signal('mapZoom');
    if(action==='in'||action==='out') {
      const next=Math.max(1,Math.min(12,action==='in'?zoom*1.6:zoom/1.6));
      view.signal('mapPan',view.signal('mapPan').map(value=>value*next/zoom)).signal('mapZoom',next);
    }
    if(action==='reset'||action==='all') {
      if(target!=='vis10')view.signal('fullMapExtent',action==='all');
      view.signal('mapZoom',1).signal('mapPan',[0,0]).signal('v1Dragging',false);
    }
    await view.runAsync();
  });
  view.addSignalListener('mapZoom',(_,zoom)=>{output.textContent=`${zoom.toFixed(1)}×`;});
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
