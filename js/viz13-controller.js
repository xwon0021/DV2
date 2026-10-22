(function () {
  // Presentation geometry only. Fractions come from the unchanged validated data.
  const isotypeClassicRects = [
    [6, 9, 12, 9],
    [3.5, 9, 2.5, 10],
    [18, 9, 2.5, 10],
    [7, 18, 4, 9],
    [13, 18, 4, 9]
  ];
  const isotypeSlimRects = [
    [8, 9, 8, 10],
    [5, 10, 3, 8],
    [16, 10, 3, 8],
    [8, 19, 3, 8],
    [13, 19, 3, 8]
  ];
  function iconRectAreaLeft(rects, x) {
    return rects.reduce((a, [left, y, w, h]) => a + Math.max(0, Math.min(w, x - left)) * h, 0);
  }
  const isotypeBasket = [
    [4, 6],
    [23, 6],
    [20, 21],
    [7, 21]
  ];
  function iconCircleAreaLeft(x, cx, r) {
    let u = (x - cx) / r;
    return u <= -1
      ? 0
      : u >= 1
        ? Math.PI * r * r
        : r * r * (Math.asin(u) + u * Math.sqrt(1 - u * u) + Math.PI / 2);
  }
  function iconPolygonArea(points) {
    let n = 0;
    for (let i = 0; i < points.length; i++) {
      let a = points[i],
        b = points[(i + 1) % points.length];
      n += a[0] * b[1] - b[0] * a[1];
    }
    return Math.abs(n) / 2;
  }
  function iconPolygonAreaLeft(points, x) {
    let out = [];
    for (let i = 0; i < points.length; i++) {
      let a = points[i],
        b = points[(i + 1) % points.length],
        insideA = a[0] <= x,
        insideB = b[0] <= x;
      if (insideA) out.push(a);
      if (insideA !== insideB) {
        let t = (x - a[0]) / (b[0] - a[0]);
        out.push([x, a[1] + t * (b[1] - a[1])]);
      }
    }
    return out.length >= 3 ? iconPolygonArea(out) : 0;
  }
  function iconAreaLeft(style, x) {
    if (style === 'classic')
      return iconCircleAreaLeft(x, 12, 3.2) + iconRectAreaLeft(isotypeClassicRects, x);
    if (style === 'slim')
      return iconCircleAreaLeft(x, 12, 3.5) + iconRectAreaLeft(isotypeSlimRects, x);
    if (style === 'person')
      return (
        iconCircleAreaLeft(x, 12, 4) +
        0.5 * iconCircleAreaLeft(x, 12, 9) +
        Math.max(0, Math.min(18, x - 3)) * 5
      );
    if (style === 'cart')
      return (
        iconPolygonAreaLeft(isotypeBasket, x) +
        iconCircleAreaLeft(x, 8, 2) +
        iconCircleAreaLeft(x, 19, 2)
      );
    return Math.max(0, Math.min(18, x - 3)) * 17;
  }
  function iconClipCutoff(style, fraction) {
    // Find where the coloured part should stop for a partly filled icon.
    if (fraction <= 0) return 0;
    if (fraction >= 1) return 24;
    let lo = 0,
      hi = 24,
      target = iconAreaLeft(style, 24) * fraction;
    for (let i = 0; i < 40; i++) {
      let mid = (lo + hi) / 2;
      if (iconAreaLeft(style, mid) < target) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  }
  // A partly filled icon shows the remaining part of a percentage.
  function makeIsotypeIcon(style, fraction, rowOrder, index) {
    let svg = svgElement('svg', { viewBox: '0 0 24 28', focusable: 'false' });
    if (style === 'bag') {
      // Original bag design preserved: rectangular quantitative body, grey handle.
      svg.append(svgElement('rect', { x: 3, y: 9, width: 18, height: 17, fill: '#E1E6EB' }));
      if (fraction > 0)
        svg.append(
          svgElement('rect', { x: 3, y: 9, width: 18 * fraction, height: 17, fill: '#8E3FA9' })
        );
      svg.append(
        svgElement('rect', {
          x: 3,
          y: 9,
          width: 18,
          height: 17,
          fill: 'none',
          stroke: '#8797A5',
          'stroke-width': 0.7
        })
      );
      svg.append(
        svgElement('path', {
          d: 'M8 9V6A4 4 0 0 1 16 6V9',
          fill: 'none',
          stroke: '#8797A5',
          'stroke-width': 1.2
        })
      );
      return svg;
    }
    const shapes =
      style === 'classic'
        ? [
            ['circle', { cx: 12, cy: 4.2, r: 3.2 }],
            ...isotypeClassicRects.map(([x, y, width, height]) => ['rect', { x, y, width, height }])
          ]
        : style === 'slim'
          ? [
              ['circle', { cx: 12, cy: 4.5, r: 3.5 }],
              ...isotypeSlimRects.map(([x, y, width, height]) => ['rect', { x, y, width, height }])
            ]
          : style === 'person'
            ? [
                ['circle', { cx: 12, cy: 5, r: 4 }],
                ['path', { d: 'M3 26V21A9 9 0 0 1 21 21V26Z' }]
              ]
            : [
                ['path', { d: 'M4 6H23L20 21H7Z' }],
                ['circle', { cx: 8, cy: 25, r: 2 }],
                ['circle', { cx: 19, cy: 25, r: 2 }]
              ];
    let id = 'isotype-' + style + '-' + rowOrder + '-' + index,
      defs = svgElement('defs', {}),
      clip = svgElement('clipPath', { id, clipPathUnits: 'userSpaceOnUse' });
    clip.append(
      svgElement('rect', { x: 0, y: 0, width: iconClipCutoff(style, fraction), height: 28 })
    );
    defs.append(clip);
    svg.append(defs);
    for (let attrs of [
      { fill: '#E1E6EB' },
      { fill: '#8E3FA9', 'clip-path': 'url(#' + id + ')' },
      { fill: 'none', stroke: '#8797A5', 'stroke-width': 0.7 }
    ]) {
      let group = svgElement('g', attrs);
      for (let [tag, geometry] of shapes) group.append(svgElement(tag, geometry));
      svg.append(group);
    }
    if (style === 'cart')
      svg.append(
        svgElement('path', {
          d: 'M1 3H3L7 22H21',
          fill: 'none',
          stroke: '#8797A5',
          'stroke-width': 1.2
        })
      );
    return svg;
  }

  let findings,
    baseline,
    iconStyle = 'classic';
  const ns = 'http://www.w3.org/2000/svg';
  function svgElement(tag, attrs) {
    let e = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    return e;
  }
  function content(target, r) {
    // Show the exact survey wording and percentage for this row.
    target.replaceChildren();
    let title = document.createElement('strong');
    title.textContent = r.Percentage + '% · ' + r.Label;
    let statement = document.createElement('p');
    statement.textContent = r.Statement;
    let meta = document.createElement('p');
    meta.textContent = r.Period + ' · ' + r.Source;
    let caveat = document.createElement('p');
    caveat.textContent =
      r.Qualifier.replace('; source wording retained', '') +
      '. Separate survey finding; attitude/intention is not verified purchasing behaviour.';
    target.append(title, statement, meta, caveat);
  }
  function positionTip(event, row) {
    const tip = document.getElementById('people-tip');
    if (tip.hidden) return;
    const rect = row.getBoundingClientRect(),
      gap = 14,
      pad = 12;
    const x = event?.clientX ?? rect.left + Math.min(80, rect.width / 2);
    const y = event?.clientY ?? rect.bottom;
    const w = tip.offsetWidth,
      h = tip.offsetHeight;
    let left = x + gap,
      top = y + gap;
    if (left + w > innerWidth - pad) left = x - w - gap;
    if (top + h > innerHeight - pad) top = (event?.clientY ?? rect.top) - h - gap;
    tip.style.left = Math.max(pad, Math.min(left, innerWidth - w - pad)) + 'px';
    tip.style.top = Math.max(pad, Math.min(top, innerHeight - h - pad)) + 'px';
  }
  function show(r, event, row) {
    let tip = document.getElementById('people-tip');
    content(tip, r);
    tip.hidden = false;
    positionTip(event, row);
  }
  function hide() {
    document.getElementById('people-tip').hidden = true;
  }
  // V13 uses 20 icons per finding: one full icon stands for 5 percentage points.
  fetch('work/data/viz13.json')
    .then((r) => r.json())
    .then((rows) => {
      findings = rows;
      for (let r of rows) {
        let row = document.createElement('article');
        row.className = 'isotype-row';
        row.tabIndex = 0;
        row.setAttribute('role', 'button');
        row.setAttribute('aria-label', r.Statement + ' · ' + r.Period);
        let title = document.createElement('div');
        title.className = 'statement';
        title.textContent = r.Label;
        let q = document.createElement('span');
        q.className = 'qualifier';
        q.textContent = r.Qualifier.replace('; source wording retained', '');
        title.append(q);
        let icons = document.createElement('div');
        icons.className = 'icons';
        icons.setAttribute('aria-hidden', 'true');
        for (let [i, fraction] of r.Icons.entries())
          icons.append(makeIsotypeIcon(iconStyle, fraction, r.Order, i));
        icons.dataset.order = r.Order;
        let value = document.createElement('div');
        value.className = 'percent';
        value.textContent = r.Percentage + '%';
        row.append(title, icons, value);
        row.onmouseenter = (e) => show(r, e, row);
        row.onmousemove = (e) => positionTip(e, row);
        row.onmouseleave = hide;
        row.onfocus = () => show(r, null, row);
        row.onblur = hide;
        row.onclick = (e) => {
          document.querySelectorAll('.isotype-row').forEach((e) => e.classList.remove('active'));
          row.classList.add('active');
          let d = document.getElementById('people-detail');
          content(d, r);
          d.hidden = false;
          if (innerWidth < 700) hide();
          else show(r, e.detail ? e : null, row);
        };
        row.onkeydown = (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            row.click();
          }
        };
        document.getElementById('people-rows').append(row);
      }
    });
  // Each finding becomes one row of icons plus its exact percentage.
  function changeIconStyle(style) {
    iconStyle = style;
    for (let host of document.querySelectorAll('.icons')) {
      let r = findings.find((r) => r.Order === +host.dataset.order);
      host.replaceChildren(...r.Icons.map((f, i) => makeIsotypeIcon(style, f, r.Order, i)));
    }
    document
      .querySelectorAll('[data-icon-style]')
      .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.iconStyle === style)));
    let words = {
      person: ['people', 'person'],
      classic: ['people', 'person'],
      slim: ['people', 'person'],
      bag: ['bags', 'bag'],
      cart: ['carts', 'cart']
    }[style];
    document.getElementById('people-icon-unit').textContent =
      '20 ' +
      words[0] +
      ' = 100% · each ' +
      words[1] +
      ' represents 5 percentage points of respondents.';
  }
  document.querySelectorAll('[data-icon-style]').forEach(
    (b) =>
      (b.onclick = () => {
        if (findings) changeIconStyle(b.dataset.iconStyle);
      })
  );
  window.addEventListener('scroll', hide, true);
  window.addEventListener('resize', hide);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hide();
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.isotype-row')) hide();
  });
})();
