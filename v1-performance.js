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
