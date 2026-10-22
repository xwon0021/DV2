// Preview-only geometry dimensions and axis-label wrapping; quantitative encodings stay intact.
function editorialFigureDimensions(spec, target, container) {
  const mobile = innerWidth <= 620,
    paired = innerWidth >= 900;
  if (target === 'map1') {
    const selectedPalette = [
      '#F6F1DE',
      '#C9DBC5',
      '#86BCBB',
      '#4795B1',
      '#286B9A',
      '#254573',
      '#191E43'
    ];
    const mapLayer = spec.layer?.find(
      (layer) => layer.encoding?.color?.field === 'Businesses_per_10000'
    );
    if (mapLayer?.encoding.color.scale) mapLayer.encoding.color.scale.range = selectedPalette;
    if (!mobile) spec.height = Math.min(540, Math.round(container.clientWidth * 0.65));
  }
  if (target === 'map2' && !mobile) spec.height = 400;
  // V6: give the paired bars and industry names room on a wide screen.
  if (target === 'vis06' && !mobile) {
    spec.height = 540;
    spec.encoding.y.axis.labelLimit = 240;
    spec.encoding.y.axis.labelFontSize = 12;
    spec.encoding.color.legend.orient = 'top';
    spec.encoding.color.legend.direction = 'horizontal';
    spec.encoding.color.legend.columns = 2;
  }
  if (target === 'vis07' && !mobile) {
    spec.height = 440;
    spec.padding = { left: 76, right: 60, top: 14, bottom: 48 };
    spec.axes[0].encode = {
      labels: {
        update: {
          text: {
            signal:
              "datum.value === 'Wages and salaries' ? ['Wages and','salaries'] : datum.value === 'Sales and service income' ? ['Sales and','service income'] : datum.value === 'Industry value added' ? ['Industry value','added'] : datum.value"
          }
        }
      }
    };
  }
  if (target === 'vis13') {
    spec.width = Math.max(180, container.clientWidth - 10);
    spec.autosize = { type: 'fit', contains: 'padding' };
  }
  if (target === 'vis09' && !mobile) spec.height = 350;
  return spec;
}
document.getElementById('inspect-tasmania-food').addEventListener('click', () => {
  const state = document.getElementById('matrix-state'),
    subdivision = document.getElementById('matrix-subdivision');
  state.value = 'TAS';
  subdivision.value = '11';
  subdivision.dispatchEvent(new Event('change', { bubbles: true }));
  document.getElementById('heatmap').scrollIntoView({
    block: 'center',
    behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth'
  });
});

function addEditorialFlowNavigation(spec) {
  // V12: keep the map shapes and export curves together when zooming or dragging.
  const signal = (name) => spec.signals.find((s) => s.name === name),
    down = { type: 'pointerdown', filter: ['event.button === 0'] };
  spec.signals.push({
    name: 'v1Dragging',
    value: false,
    on: [
      { events: down, update: 'true' },
      { events: 'window:pointerup, window:pointercancel', update: 'false' }
    ]
  });
  signal('mapZoom').on = [];
  signal('panEnabled').value = true;
  signal('panStart').on = [{ events: down, update: '[x(),y(),mapPan[0],mapPan[1]]' }];
  signal('mapPan').on = [
    {
      events: {
        source: 'window',
        type: 'pointermove',
        throttle: 32,
        between: [down, { source: 'window', type: 'pointerup' }]
      },
      update: 'v1Dragging ? [panStart[2]+x()-panStart[0],panStart[3]+y()-panStart[1]] : mapPan'
    }
  ];
  spec.projections[0] = {
    name: 'worldProjection_base',
    type: 'equalEarth',
    rotate: [-150, 0, 0],
    scale: { signal: 'min((width-20)/5.5,(height-28)/2.65)' },
    translate: { signal: '[width/2,height/2]' }
  };
  for (const d of spec.data) {
    for (const t of d.transform || []) {
      if (t.projection === 'worldProjection') t.projection = 'worldProjection_base';
    }
  }
  for (const mark of spec.marks) {
    mark.clip = true;
    const geo = mark.transform?.find((t) => t.type === 'geoshape');
    if (geo) {
      const src = mark.from.data,
        name = src + '_v1_paths';
      if (src === 'stateRates') {
        spec.data.push({
          name,
          source: 'stateRates',
          transform: [
            { type: 'geopath', projection: 'worldProjection_base', as: 'sa2Path' },
            {
              type: 'aggregate',
              groupby: ['State', 'Rate'],
              fields: ['sa2Path'],
              ops: ['values'],
              as: ['items']
            },
            {
              type: 'formula',
              expr: "join(pluck(datum.items,'sa2Path'),'')",
              as: 'v1ProjectedPath'
            }
          ]
        });
      } else if (src === 'world') {
        spec.data.push({
          name,
          source: 'world',
          transform: [
            { type: 'geopath', projection: 'worldProjection_base', as: 'countryPath' },
            { type: 'aggregate', fields: ['countryPath'], ops: ['values'], as: ['items'] },
            {
              type: 'formula',
              expr: "join(pluck(datum.items,'countryPath'),'')",
              as: 'v1ProjectedPath'
            }
          ]
        });
      } else {
        spec.data.push({
          name,
          source: src,
          transform: [
            { type: 'geopath', projection: 'worldProjection_base', as: 'v1ProjectedPath' }
          ]
        });
      }
      mark.from.data = name;
      mark.type = 'path';
      mark.transform = mark.transform.filter((t) => t !== geo);
      const update = mark.encode.update;
      update.path = { field: 'v1ProjectedPath' };
      update.scaleX = { signal: 'mapZoom' };
      update.scaleY = { signal: 'mapZoom' };
      update.x = { signal: 'width/2*(1-mapZoom)+mapPan[0]' };
      update.y = { signal: 'height/2*(1-mapZoom)+mapPan[1]' };
      if (update.strokeWidth) {
        const widths = Array.isArray(update.strokeWidth)
          ? update.strokeWidth
          : [update.strokeWidth];
        update.strokeWidth = widths.map((w) => {
          const encoded = { ...w, signal: `(${w.signal ?? w.value})/mapZoom` };
          delete encoded.value;
          return encoded;
        });
      }
    } else if (mark.name === 'flowLines' || mark.name === 'flowHitTarget') {
      const update = mark.encode.update;
      update.scaleX = { signal: 'mapZoom' };
      update.scaleY = { signal: 'mapZoom' };
      update.x = { signal: 'width/2*(1-mapZoom)+mapPan[0]' };
      update.y = { signal: 'height/2*(1-mapZoom)+mapPan[1]' };
      if (mark.name === 'flowLines') {
        update.strokeWidth = {
          signal:
            "(max(1.6, scale('flowWidth',datum.Value_AUD_thousands)) * (datum.Key === hoverFlow || datum.Key === selectedFlow ? 1.5 : 1)) / sqrt(mapZoom)"
        };
      } else {
        update.strokeWidth = {
          signal:
            "max(22, max(1.6, scale('flowWidth',datum.Value_AUD_thousands)) * sqrt(mapZoom) + 16) / mapZoom"
        };
      }
    } else if (mark.encode?.update?.x?.field === 'px' || mark.encode?.update?.x?.field === 'tipX') {
      const update = mark.encode.update,
        xf = update.x.field,
        yf = update.y.field;
      update.x = { signal: `width/2*(1-mapZoom)+mapPan[0]+datum.${xf}*mapZoom` };
      update.y = { signal: `height/2*(1-mapZoom)+mapPan[1]+datum.${yf}*mapZoom` };
    }
  }
  return spec;
}
function editorialChordFit(spec, container) {
  // V10: move the chord and its labels so they fit the screen width.
  const width = container.clientWidth,
    compact = width < 760;
  spec.width = width;
  const radius = compact ? width * 0.24 : Math.min(190, width * 0.215);
  spec.height = Math.max(compact ? 470 : 520, Math.ceil(radius * 2.56 + 40));
  const signal = (n) => spec.signals.find((s) => s.name === n);
  signal('radius').update = compact ? 'width*.24' : 'min(190,width*.215)';
  signal('cx').update = compact ? 'width*.34' : 'width*.38';
  signal('cy').update = 'height/2';
  const labels = spec.marks.find((m) => m.name === 'industryLabels').encode.update;
  labels.limit = { signal: compact ? 'width*.31-10' : 'width*.30-10' };
  if (!compact) {
    labels.x = { signal: 'datum.Side > 0 ? width*.70 : 108' };
    for (const mark of spec.marks) {
      const u = mark.encode?.update;
      if (u?.path?.signal?.includes('datum.Mid'))
        u.path.signal =
          "'M'+(cx+sin(datum.Mid)*radius*1.16)+','+(cy-cos(datum.Mid)*radius*1.16)+'L'+(cx+datum.Side*radius*1.22)+','+(cy+datum.LabelY*radius)+'L'+(datum.Side > 0 ? width*.70-4 : 113)+','+(cy+datum.LabelY*radius)";
    }
  }
  if (compact) {
    labels.x = { signal: 'datum.Side > 0 ? width*.67 : cx' };
    labels.y = { signal: 'datum.Side > 0 ? cy+datum.LabelY*160 : cy+radius*1.4' };
    labels.align = { signal: "datum.Side > 0 ? 'left' : 'center'" };
    labels.fontSize = { value: width < 450 ? 10 : 12 };
    for (const mark of spec.marks) {
      const u = mark.encode?.update;
      if (u?.path?.signal?.includes('datum.Mid'))
        u.path.signal =
          "'M'+(cx+sin(datum.Mid)*radius*1.16)+','+(cy-cos(datum.Mid)*radius*1.16)+'L'+(datum.Side > 0 ? cx+radius*1.22 : cx-radius*1.22)+','+(datum.Side > 0 ? cy+datum.LabelY*160 : cy+radius*1.4)+'L'+(datum.Side > 0 ? width*.67-4 : cx)+','+(datum.Side > 0 ? cy+datum.LabelY*160 : cy+radius*1.4)";
    }
  }
  return spec;
}
function editorialSlopeFit(spec, container) {
  spec.width = container.clientWidth;
  const compact = spec.width < 760;
  const marginSig = compact ? 'min(115,width*.22)' : '240';
  const leaderSig = compact ? 'min(97,width*.22-18)' : '218';
  for (const mark of spec.marks) {
    const u = mark.encode?.update;
    if (!u) continue;
    for (const key of ['x', 'x2']) {
      if (u[key]?.value === 240) u[key] = { signal: marginSig };
      if (u[key]?.signal)
        u[key].signal = u[key].signal
          .replace(/width-240/g, `width-${marginSig}`)
          .replace(/width-218/g, `width-${leaderSig}`)
          .replace(/^240$/, marginSig)
          .replace(/^218/, leaderSig);
    }
    if (mark.type === 'text' && ['labels', 'rightLabels'].includes(mark.name)) {
      u.limit = { signal: compact ? 'min(95,width*.22-20)' : '195' };
      if (compact) {
        const value = mark.name === 'labels' ? 'IVA_2023_24' : 'IVA_2024_25';
        u.text = { signal: `[datum.Short,format(datum.${value},',.0f')]` };
        u.fontSize = { value: 10 };
        u.lineHeight = { value: 11 };
      }
    }
    if (mark.type === 'text' && u.text?.value?.includes('common vertical scale') && compact) {
      u.text.value = 'IVA · A$ million · common vertical scale';
      u.fontSize = { value: 10 };
    }
  }
  return spec;
}

// Navigate to the normal-flow chapter start, never a sticky heading's current box.
(() => {
  const nav = document.querySelector('.chapter-index');
  if (!nav) return;

  const chapterTitles = {
    '#place': '01 / Place · Australian Made Products',
    '#industry': '02 / Industry · Australian Made Products',
    '#change': '03 / Change · Australian Made Products',
    '#connections': '04 / Connections · Australian Made Products'
  };
  const baseTitle = document.title;

  function updateActiveLink(hash) {
    nav.querySelectorAll('a').forEach((a) => {
      const match = a.getAttribute('href') === hash;
      a.classList.toggle('active', match);
      if (match) {
        a.setAttribute('aria-current', 'true');
      } else {
        a.removeAttribute('aria-current');
      }
    });
    if (chapterTitles[hash]) {
      document.title = chapterTitles[hash];
    } else if (!hash || hash === '#') {
      document.title = baseTitle;
    }
  }

  function showChapter(hash) {
    const section = document.getElementById(hash.slice(1));
    if (!section?.matches('main > .story-section')) return;
    const top =
      window.scrollY +
      section.getBoundingClientRect().top +
      parseFloat(getComputedStyle(section).paddingTop) -
      nav.getBoundingClientRect().height -
      12;
    window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
    updateActiveLink(hash);
  }

  nav.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    history.pushState(null, '', link.hash);
    showChapter(link.hash);
  });

  window.addEventListener('hashchange', () => showChapter(location.hash));

  if (location.hash) {
    updateActiveLink(location.hash);
  }

  // Scroll spy to keep active tab, URL hash, and page title corresponding to the section in view
  const sections = document.querySelectorAll('main > .story-section');
  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          const id = '#' + visible[0].target.id;
          updateActiveLink(id);
          if (location.hash !== id) {
            history.replaceState(null, '', id);
          }
        } else if (window.scrollY < 200) {
          updateActiveLink('');
          if (location.hash) {
            history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        }
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
      }
    );

    sections.forEach((sec) => observer.observe(sec));
  }
})();
const rateColors = ['#F6F1DE', '#C9DBC5', '#86BCBB', '#4795B1', '#286B9A', '#254573', '#191E43'];
const chartViews = new Map();
// Each pair connects a space in index.html to the chart file it should show.
// The number in a filename may differ from the V number shown on the page.
const specTargets = [
  ['map1', 'work/viz1.vg.json?v=final'],
  ['map3', 'work/viz3.vg.json?v=final'],
  ['vis04', 'work/viz4.vg.json?v=tealplum'],
  ['heatmap', 'work/viz5.vg.json?v=final'],
  ['vis06', 'work/viz6.vg.json?v=final'],
  ['vis07', 'work/viz7.vg.json?v=final'],
  ['vis08', 'work/viz8.vg.json?v=final'],
  ['vis10', 'work/viz10.vg.json?v=final'],
  ['vis11', 'work/viz11.vg.json?v=align2024'],
  ['vis12', 'work/viz12.vg.json?v=zoomflow']
];
function getBoundaryUrl() {
  return 'work/data/SA2_2021_AUST_GDA2020_web.json';
}

function showRateLegend(breaks) {
  const labels = [
    `0–${breaks[0].toLocaleString('en-AU', { maximumFractionDigits: 1 })}`,
    ...breaks
      .slice(1)
      .map(
        (value, index) =>
          `>${breaks[index].toLocaleString('en-AU', { maximumFractionDigits: 1 })}–${value.toLocaleString('en-AU', { maximumFractionDigits: 1 })}`
      ),
    `>${breaks.at(-1).toLocaleString('en-AU', { maximumFractionDigits: 1 })}`
  ];
  document.getElementById('rate-legend').innerHTML = labels
    .map(
      (label, index) =>
        `<button type="button" class="legend-item" data-rate-class="${index}" aria-pressed="false"><span class="swatch" style="background:${rateColors[index]}"></span><span>${label}</span></button>`
    )
    .join('');
}

async function loadSpec(target, url) {
  // Get the chart instructions, adjust the size, then ask Vega to draw it.
  const container = document.getElementById(target);
  if (target === 'vis09') {
    v9Playback?.dispose();
    v9Playback = null;
  }
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Could not load ${url} (${response.status})`);
    let spec = await response.json();
    if (
      ['map3', 'vis04', 'heatmap', 'vis06', 'vis07', 'vis08', 'vis10', 'vis12'].includes(target)
    ) {
      // These charts have study notes beside their code. Remove them before Vega reads the charts.
      const removeNotes = (part) => {
        if (Array.isArray(part)) return part.forEach(removeNotes);
        if (!part || typeof part !== 'object') return;
        delete part.notes;
        Object.values(part).forEach(removeNotes);
      };
      removeNotes(spec);
    }
    spec = editorialFigureDimensions(spec, target, container);
    if (target === 'map1') spec.data.url = await getBoundaryUrl();
    if (target === 'map2') spec.layer[0].data.url = await getBoundaryUrl();
    if ((target === 'map1' || target === 'map2') && window.innerWidth <= 620) {
      spec.height = target === 'map1' ? 320 : 280;
    }
    if (target === 'vis06' && window.innerWidth <= 620) {
      // V6: use shorter axis labels and a stacked legend on a phone.
      spec.encoding.color.legend.direction = 'vertical';
      spec.encoding.color.legend.columns = 1;
      spec.encoding.x.axis = { values: [-15, 0, 15, 30], title: 'Growth (%)' };
      spec.encoding.y.axis.labelLimit = 115;
      spec.encoding.y.axis.labelFontSize = 11;
      spec.height = 650;
    }
    if (target === 'vis07') {
      spec.width = container.clientWidth;
      if (window.innerWidth <= 620) {
        spec.height = 330;
        spec.padding = { left: 52, right: 12, top: 14, bottom: 60 };
        spec.axes[0].encode = {
          labels: {
            update: {
              text: {
                signal:
                  "datum.value === 'Wages and salaries' ? 'Wages' : datum.value === 'Sales and service income' ? 'Sales' : datum.value === 'Industry value added' ? 'IVA' : datum.value"
              }
            }
          }
        };
      }
    }
    if (target === 'vis07' && window.innerWidth <= 620) {
      Object.assign(spec.axes[0].encode.labels.update, {
        angle: { value: -25 },
        align: { value: 'right' },
        baseline: { value: 'middle' },
        dy: { value: 7 }
      });
    }
    if (target === 'vis09') spec = addV9Playback(spec);
    if (target === 'vis09' && window.innerWidth <= 620) {
      spec.width = 650;
      spec.height = 430;
    }
    if (target === 'vis04') {
      // V4 keeps room for the industry names and the two share labels as the screen changes size.
      const compact = container.clientWidth < 620;
      const laptopAdaptHeight = Math.max(340, Math.min(410, Math.round(window.innerHeight * 0.44)));
      spec.padding = compact
        ? { left: 118, right: 16, top: 32, bottom: 44 }
        : { left: 230, right: 132, top: 34, bottom: 48 };
      spec.width = Math.max(185, container.clientWidth - spec.padding.left - spec.padding.right);
      spec.height = compact ? 430 : laptopAdaptHeight;
    }
    if (target === 'heatmap') {
      const laptopHeatmapHeight = Math.max(
        250,
        Math.min(290, Math.round(window.innerHeight * 0.32))
      );
      spec.height = window.innerWidth <= 620 ? 300 : laptopHeatmapHeight;
      if (window.innerWidth < 720) spec.width = { step: 48 };
    }
    if (target === 'vis11') spec = editorialSlopeFit(spec, container);
    if (target === 'vis10') {
      spec.width = container.clientWidth;
      spec = editorialChordFit(spec, container);
    }
    if (target === 'vis08') {
      delete spec.width;
      spec.vconcat.forEach((v) => {
        v.width = Math.max(
          180,
          Math.min(container.clientWidth, window.innerWidth - 24) -
            (window.innerWidth <= 620 ? 90 : 70)
        );
      });
      spec.vconcat[0].height = window.innerWidth <= 620 ? 240 : 300;
      if (window.innerWidth <= 620) {
        spec.vconcat[0].layer[3].mark.align = 'right';
        spec.vconcat[0].layer[3].encoding.text.datum = '2019–2020 low: 830.2k';
      }
    }
    if (target === 'map3' || target === 'vis12') {
      spec.width = container.clientWidth;
      spec.height =
        window.innerWidth <= 620
          ? target === 'map3'
            ? 320
            : 290
          : target === 'vis12'
            ? Math.min(440, Math.round(container.clientWidth * 0.49))
            : 420;
    }
    if (target === 'vis12') spec = addEditorialFlowNavigation(spec);
    if (target === 'vis08') spec = addEmploymentBrushBindings(spec);
    if (['map1', 'map2', 'map3'].includes(target)) spec = addMapNavigation(spec, target, container);
    if (target === 'map1') {
      window.v1NavigationCleanup?.();
      window.v1TooltipLeaderCleanup?.();
    }
    if (['map2', 'map3', 'vis12'].includes(target)) window[target + 'NavigationCleanup']?.();
    chartViews.get(target)?.finalize();
    // Keep the view so the buttons below can change the chart's signals.
    const result = await vegaEmbed(container, spec, {
      actions: true,
      renderer: [
        'map1',
        'map2',
        'map3',
        'vis04',
        'heatmap',
        'vis07',
        'vis09',
        'vis10',
        'vis11',
        'vis12'
      ].includes(target)
        ? 'svg'
        : 'canvas'
    });
    chartViews.set(target, result.view);
    if (target === 'map1') {
      await setupV1ClassHighlight(result.view);
      await setupV1TooltipLeader(result.view);
      setupV1Performance(result.view);
    }
    if (['map3', 'vis10', 'vis12'].includes(target)) setupRedesignControls(target, result.view);
    if (['map1', 'map2', 'map3'].includes(target)) setupMapNavigation(target, result.view);
    if (target === 'vis12') setupV1Navigation(result.view, target);
    if (target === 'vis08') setupEmploymentPolish(result.view);
    if (target === 'heatmap') setupMatrixPolish(result.view);
    if (target === 'map3') setupFacilityFilters(result.view);
    if (target === 'vis12') setupDestinationSummary(result.view);
    if (target === 'vis10') setupIndustrySummary(result.view);
    if (['vis07', 'vis09', 'vis11'].includes(target)) setupProfileFocus(target, result.view);
    if (target === 'vis09') setupV9Playback(result.view);
  } catch (error) {
    container.replaceChildren();
    const message = document.createElement('p');
    message.className = 'load-error';
    message.textContent =
      'Chart unavailable. Serve this folder over HTTP and check that its data files are present.';
    container.append(message);
    console.error(error);
  }
}

function populateSelect(select, rows, getKey, getLabel) {
  const previous = select.value;
  select.querySelectorAll('option:not(:first-child)').forEach((option) => option.remove());
  rows.forEach((row) => select.add(new Option(getLabel(row), getKey(row))));
  select.value = Array.from(select.options).some((option) => option.value === previous)
    ? previous
    : '';
}
const aud = (value) => 'A$' + value.toLocaleString('en-AU', { maximumFractionDigits: 0 });
function setupRedesignControls(target, view) {
  if (target === 'map3') {
    // V3: selecting a facility in the lookup highlights its dot and shows its details.
    const select = document.getElementById('facility-select'),
      detail = document.getElementById('facility-detail');
    const rows = view
      .data('facilities')
      .slice()
      .sort((a, b) => a.Facility_Name.localeCompare(b.Facility_Name));
    const repeated = new Map();
    rows.forEach((r) => {
      const key = r.Facility_Name + '|' + r.State;
      repeated.set(key, (repeated.get(key) || 0) + 1);
    });
    populateSelect(
      select,
      rows,
      (r) => String(r.Facility_ID),
      (r) =>
        `${r.Facility_Name} · ${r.State}${repeated.get(r.Facility_Name + '|' + r.State) > 1 ? ' · ID ' + r.Facility_ID : ''}`
    );
    const show = (key) => {
      const row = rows.find((r) => String(r.Facility_ID) === String(key));
      detail.textContent = row
        ? `${row.Facility_Name} · ${row.State} · ${row.Industry} · ${row.Reporting_Period}. Source: NPI reporting facilities; not all manufacturers or Australian Made certified facilities.`
        : 'Hover or tap a dot for its name and primary industry. The lookup also reaches facilities sharing coordinates.';
    };
    select.onchange = () => {
      const row = rows.find((r) => String(r.Facility_ID) === select.value);
      view.signal('selectedFacility', row?.Facility_ID ?? null).runAsync();
      show(select.value);
    };
    view.addSignalListener('selectedFacility', (_, key) => {
      select.value = key == null ? '' : String(key);
      show(key);
    });
    select.onchange();
  }
  if (target === 'vis12') {
    // V12: connect the origin and destination dropdowns to the map selections.
    const state = document.getElementById('export-state-select'),
      flow = document.getElementById('export-flow-select'),
      reset = document.getElementById('export-filter-reset'),
      detail = document.getElementById('export-flow-detail');
    const rows = view.data('flows'),
      origins = view.data('origins');
    populateSelect(
      state,
      origins,
      (r) => r.State,
      (r) => r.State
    );
    const showFlows = () =>
      populateSelect(
        flow,
        rows.filter((r) => !state.value || r.Source === state.value),
        (r) => r.Key,
        (r) => `${r.Source} → ${r.Target}`
      );
    const show = (key) => {
      const row = rows.find((r) => r.Key === key);
      detail.textContent = row
        ? `${row.Source} → ${row.Target}: ${aud(row.Value_AUD_thousands * 1000)} (2025 manufactured exports)`
        : 'Hover or tap a connection, or choose an origin and destination above.';
    };
    state.onchange = () => {
      view.signal('selectedState', state.value).signal('selectedFlow', '').runAsync();
      flow.value = '';
      showFlows();
      show('');
    };
    flow.onchange = () => {
      view.signal('selectedFlow', flow.value).runAsync();
      show(flow.value);
    };
    reset.onclick = () => {
      state.value = '';
      flow.value = '';
      showFlows();
      show('');
      view.signal('selectedState', '').signal('selectedFlow', '').runAsync();
    };
    view.addSignalListener('selectedState', (_, key) => {
      state.value = key;
      flow.value = '';
      showFlows();
    });
    view.addSignalListener('selectedFlow', (_, key) => {
      flow.value = key;
      show(key);
    });
    showFlows();
    view.signal('selectedState', state.value).signal('selectedFlow', flow.value).runAsync();
    show(flow.value);
  }
  if (target === 'vis10') {
    // V10: the dropdowns and chord clicks share the same industry and ribbon signals.
    const industry = document.getElementById('industry-select'),
      relationship = document.getElementById('relationship-select'),
      detail = document.getElementById('relationship-detail'),
      resetBtn = document.getElementById('chord-reset');
    const nodes = view.data('nodes'),
      rows = view.data('edges');
    populateSelect(
      industry,
      nodes,
      (r) => r.Code,
      (r) => r.Name
    );
    const showEdges = () =>
      populateSelect(
        relationship,
        rows.filter(
          (r) => !industry.value || r.Source === industry.value || r.Target === industry.value
        ),
        (r) => r.Key,
        (r) => `${r.Source_Name} → ${r.Target_Name}`
      );
    const show = (key) => {
      const row = rows.find((r) => r.Key === key);
      detail.textContent = row
        ? `Supplier → User: ${row.Source_Name} → ${row.Target_Name}. ${aud(row.Value_AUD_millions * 1000000)} (source A$ million), 2023–24 domestic intermediate use at basic prices.${row.Source === row.Target ? ' Manufacturing self-use.' : ''}`
        : 'Arrow tips point to the using division. Manufacturing → Manufacturing is self-use, not a reciprocal pair.';
    };
    industry.onchange = () => {
      view.signal('selectedIndustry', industry.value).signal('selectedEdge', '').runAsync();
      relationship.value = '';
      showEdges();
      show('');
    };
    relationship.onchange = () => {
      view.signal('selectedEdge', relationship.value).runAsync();
      show(relationship.value);
    };
    if (resetBtn) {
      resetBtn.onclick = () => {
        industry.value = '';
        relationship.value = '';
        showEdges();
        show('');
        view.signal('selectedIndustry', '').signal('selectedEdge', '').runAsync();
      };
    }
    view.addSignalListener('selectedIndustry', (_, key) => {
      industry.value = key;
      showEdges();
    });
    view.addSignalListener('selectedEdge', (_, key) => {
      relationship.value = key;
      show(key);
    });
    showEdges();
    view
      .signal('selectedIndustry', industry.value)
      .signal('selectedEdge', relationship.value)
      .runAsync();
    show(relationship.value);
  }
}

async function start() {
  // Load the legend values first, then load the main charts together.
  try {
    const response = await fetch('work/data/validation.json');
    if (!response.ok) throw new Error('Validation metadata is unavailable');
    const validation = await response.json();
    // show V1 rate legend
    showRateLegend(validation.visualisation_1_2.rate_class_breaks);
  } catch (error) {
    document.getElementById('rate-legend').textContent = 'Legend metadata unavailable.';
    console.error(error);
  }
  await Promise.all(specTargets.map(([target, url]) => loadSpec(target, url)));
  let previousWidth = window.innerWidth;
  let previousHeight = window.innerHeight;
  let resizeTimer;
  let resizeQueue = Promise.resolve();
  // Redraw after a real size change so charts fit smaller screens.
  window.addEventListener('resize', () => {
    if (window.innerWidth === previousWidth && Math.abs(window.innerHeight - previousHeight) < 30)
      return;
    previousWidth = window.innerWidth;
    previousHeight = window.innerHeight;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeQueue = resizeQueue.then(() =>
        Promise.all(specTargets.map(([target, url]) => loadSpec(target, url)))
      );
    }, 180);
  });
}

start();
