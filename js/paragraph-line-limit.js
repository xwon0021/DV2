/* Preview prose only: preserve text and inline markup, cap lines at ten words. */
(() => {
  'use strict';
  const root = document.body;
  if (!root) return;
  const selector = 'p';
  const marker = 'data-prose-break';
  const htmlNamespace = 'http://www.w3.org/1999/xhtml';

  function format(paragraph) {
    paragraph.querySelectorAll(`br[${marker}]`).forEach(br => br.remove());
    if (paragraph.closest('.page-footer')) return;
    const runs = [];
    let text = '';
    function collect(node) {
      if (node.nodeType === 3) {
        runs.push({ node, start: text.length, end: text.length + node.length });
        text += node.data;
      } else if (node.nodeType === 1 && node.namespaceURI === htmlNamespace) {
        if (node.tagName === 'BR') text += '\0';
        else Array.from(node.childNodes).forEach(collect);
      }
    }
    collect(paragraph);
    const breaks = [];
    let start = 0;
    for (const line of text.split('\0')) {
      const words = Array.from(line.matchAll(/\S+/g));
      for (let i = 9; i < words.length - 1; i += 10) {
        breaks.push(start + words[i].index + words[i][0].length);
      }
      start += line.length + 1;
    }
    // Work backwards so splitting a text node cannot invalidate earlier offsets.
    for (const offset of breaks.reverse()) {
      const run = runs.find(run => offset > run.start && offset <= run.end);
      if (!run) continue;
      const after = run.node.splitText(offset - run.start);
      const br = document.createElement('br');
      br.setAttribute(marker, '');
      after.before(br);
    }
  }

  const options = { childList: true, characterData: true, subtree: true };
  const observer = new MutationObserver(records => {
    if (!root.isConnected) return;
    const changed = new Set();
    function include(node) {
      const element = node.nodeType === 1 ? node : node.parentElement;
      if (!element || element.namespaceURI !== htmlNamespace) return;
      const paragraph = element.closest(selector);
      if (paragraph) changed.add(paragraph);
      element.querySelectorAll(selector).forEach(p => changed.add(p));
    }
    for (const record of records) {
      // Chart SVG updates do not require formatting or a document-wide scan.
      const element = record.target.nodeType === 1 ? record.target : record.target.parentElement;
      if (!element || element.namespaceURI !== htmlNamespace) continue;
      const paragraph = element.closest(selector);
      if (paragraph) changed.add(paragraph);
      record.addedNodes.forEach(include);
    }
    if (!changed.size) return;
    observer.disconnect();
    changed.forEach(p => { if (p.isConnected) format(p); });
    // V12 measures its tooltip before this observer runs; keep the taller box visible.
    const tip = document.getElementById('people-tip');
    if (tip && !tip.hidden && Array.from(changed).some(p => tip.contains(p))) {
      const rect = tip.getBoundingClientRect();
      tip.style.top = Math.max(12, Math.min(rect.top, innerHeight - rect.height - 12)) + 'px';
    }
    observer.observe(root, options);
  });
  document.querySelectorAll(selector).forEach(format);
  observer.observe(root, options);
})();
