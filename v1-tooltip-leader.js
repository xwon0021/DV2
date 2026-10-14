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
