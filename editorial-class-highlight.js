let v1HighlightedClass=-1;
async function setupV1ClassHighlight(view) {
  const legend=document.getElementById('rate-legend'),wrap=legend.closest('.rate-legend-wrap'),status=document.getElementById('rate-highlight-status');
  const buttons=Array.from(legend.querySelectorAll('[data-rate-class]'));
  const counts=await (await fetch('work/qa/v1_class_highlight/counts.json')).json();
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
