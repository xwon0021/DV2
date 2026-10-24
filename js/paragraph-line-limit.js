/* Preview prose only: cap lines at ten words, counting hyphenated parts separately. */
(() => {
  'use strict';
  const root = document.body;
  if (!root) return;
  const selector = 'p';
  const marker = 'data-prose-break';
  const htmlNamespace = 'http://www.w3.org/1999/xhtml';

  function format(paragraph) {
    paragraph.querySelectorAll(`br[${marker}]`).forEach((br) => br.remove());
    // Let narrow columns wrap naturally. Add a break only when an actual
    // rendered line exceeds ten words, so we do not create short orphan lines.
    const maxPasses = paragraph.textContent.split(/\s+/).length;
    for (let pass = 0; pass < maxPasses; pass++) {
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
      let top = null, count = 0, previousEnd = 0, breakAt = null;
      for (const word of text.matchAll(/[^\s\0]+/g)) {
        const start = word.index;
        const end = start + word[0].length;
        const first = runs.find((run) => start >= run.start && start < run.end);
        const last = runs.find((run) => end > run.start && end <= run.end);
        if (!first || !last) continue;
        const range = document.createRange();
        range.setStart(first.node, start - first.start);
        range.setEnd(last.node, end - last.start);
        const rect = range.getClientRects()[0];
        if (!rect || !rect.height) continue;
        if (top === null || Math.abs(rect.top - top) > 5) {
          top = rect.top;
          count = 0;
        }
        // Keep a connected token intact, but count each hyphenated part.
        // Word joiners protect wrapping and must not affect the word count.
        const wordCount = word[0].replace(/\u2060/g, '').split(/[-‐‑‒–—]+/u)
          .filter(part => /[\p{L}\p{N}]/u.test(part)).length;
        count += wordCount;
        if (count > 10 && count > wordCount) {
          breakAt = previousEnd;
          break;
        }
        previousEnd = end;
      }
      if (breakAt === null) break;
      const run = runs.find((run) => breakAt > run.start && breakAt <= run.end);
      if (!run) break;
      const after = run.node.splitText(breakAt - run.start);
      const br = document.createElement('br');
      br.setAttribute(marker, '');
      after.before(br);
    }
  }

  const options = { childList: true, characterData: true, subtree: true };
  const observer = new MutationObserver((records) => {
    if (!root.isConnected) return;
    const changed = new Set();
    function include(node) {
      const element = node.nodeType === 1 ? node : node.parentElement;
      if (!element || element.namespaceURI !== htmlNamespace) return;
      const paragraph = element.closest(selector);
      if (paragraph) changed.add(paragraph);
      element.querySelectorAll(selector).forEach((p) => changed.add(p));
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
    changed.forEach((p) => {
      if (p.isConnected) format(p);
    });
    // V13 measures its tooltip before this observer runs; keep the taller box visible.
    const tip = document.getElementById('people-tip');
    if (tip && !tip.hidden && Array.from(changed).some((p) => tip.contains(p))) {
      const rect = tip.getBoundingClientRect();
      tip.style.top = Math.max(12, Math.min(rect.top, innerHeight - rect.height - 12)) + 'px';
    }
    observer.observe(root, options);
  });
  let resizeFrame;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      observer.disconnect();
      document.querySelectorAll(selector).forEach(format);
      observer.observe(root, options);
    });
  });
  document.querySelectorAll(selector).forEach(format);
  observer.observe(root, options);
  root.addEventListener('toggle', event => {
    if (event.target.tagName !== 'DETAILS' || !event.target.open) return;
    observer.disconnect();
    event.target.querySelectorAll(selector).forEach(format);
    observer.observe(root, options);
  }, true);
  // A web font can change the line lengths after initial formatting.
  document.fonts?.ready.then(() => {
    observer.disconnect();
    document.querySelectorAll(selector).forEach(format);
    observer.observe(root, options);
  });
})();
