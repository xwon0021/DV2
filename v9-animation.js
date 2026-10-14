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
