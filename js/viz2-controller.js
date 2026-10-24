(function (root) {
  'use strict';
  const PURPLE = '#A855D6',
    HIGHLIGHT = '#C62828',
    MAX_COUNT = 826;
  const modes = {
    current: {
      title: 'National display · enlarged circles',
      description:
        'Larger circles, a national view and manual map scale. Circle diameters are 50% larger than the earlier comparison; dense symbols may still overlap at 15×.'
    },
    detail: {
      title: 'Inspect one place at a time',
      description:
        'Choose a state or SA2. The map fits the chosen area directly, with no continuous zoom gesture. The detail circles are enlarged too, while remaining smaller than the national reference circles.'
    },
    ranking: {
      title: 'See the location. Compare the count.',
      description:
        'Choose an area or ranked bar, then drag to explore it. The map and ranked bars share a red selection; bars keep count comparisons readable.'
    }
  };
  function distanceKm(a, b) {
    const rad = Math.PI / 180,
      dlat = (b.Latitude - a.Latitude) * rad,
      dlon = (b.Longitude - a.Longitude) * rad;
    const h =
      Math.sin(dlat / 2) ** 2 +
      Math.cos(a.Latitude * rad) * Math.cos(b.Latitude * rad) * Math.sin(dlon / 2) ** 2;
    return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, h)));
  }
  function pointFeature(r) {
    return {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [r.Longitude, r.Latitude] },
      properties: {}
    };
  }
  function buildModel(rows, features, state, code, method) {
    // Choose the SA2 records and map boundaries for the selected view.
    const all = method === 'current',
      regionRows = all ? rows : rows.filter((r) => !state || r.State === state);
    const selected = regionRows.find((r) => r.SA2_Code === code) || null;
    const codes = new Set(regionRows.map((r) => r.SA2_Code));
    let land = features.filter((f) =>
      state && !all
        ? codes.has(String(f.properties.SA2_CODE21))
        : /^[1-8]/.test(String(f.properties.SA2_CODE21))
    );
    let points = regionRows,
      fit = land,
      scope;
    // Selecting an SA2 shows nearby anchors; use the five nearest in sparse areas.
    if (selected && !all) {
      const nearest = regionRows
        .map((r) => ({ row: r, distance: distanceKm(selected, r) }))
        .sort((a, b) => a.distance - b.distance);
      let nearby = nearest.filter((x) => x.distance <= 25),
        expanded = nearby.length < Math.min(5, nearest.length);
      if (expanded) nearby = nearest.slice(0, Math.min(5, nearest.length));
      points = nearby.map((x) => x.row);
      fit = points.map(pointFeature);
      // Fit actual surrounding geometries only if anchor spread is degenerate.
      if (new Set(points.map((r) => r.Longitude + ',' + r.Latitude)).size < 2) {
        const pointCodes = new Set(points.map((r) => r.SA2_Code));
        fit = features.filter((f) => pointCodes.has(String(f.properties.SA2_CODE21)));
      }
      scope = expanded
        ? `${selected.SA2_Name}: sparse-area detail fitted to ${points.length} nearest recorded SA2 anchors in ${selected.State} (furthest ${nearby.at(-1).distance.toFixed(1)} km).`
        : `${selected.SA2_Name}: detail fitted to ${points.length} recorded SA2 anchors within 25 km, restricted to ${selected.State}.`;
    } else
      scope = all
        ? 'National reference view · mainland Australia and Tasmania initially fitted. Select an SA2 for its count; use Map scale to inspect overlap.'
        : `${state || 'Australia · mainland and Tasmania'} · ${regionRows.length.toLocaleString('en-AU')} SA2 records. Select an SA2 to inspect its neighbourhood.`;
    // The bars rank all SA2s in the study area, even when the map shows a neighbourhood.
    const ranking = regionRows
      .slice()
      .sort(
        (a, b) =>
          b.Manufacturing_Businesses - a.Manufacturing_Businesses ||
          a.SA2_Code.localeCompare(b.SA2_Code)
      );
    return {
      points,
      land,
      fit,
      selected,
      scope,
      ranking,
      state,
      method,
      areaMax: all ? 2025 : 810
    };
  }
  function makeMapSpec(model, width, mobile) {
    // Turn one SA2 count into a circle: bigger count means bigger circle area.
    // The map point is an SA2 anchor, not a factory address.
    const laptopMapHeight = Math.max(420, Math.min(500, Math.round(width * 0.9)));
    const height = mobile ? 340 : laptopMapHeight,
      manual = ['current', 'ranking'].includes(model.method);
    const down = { type: 'pointerdown', filter: ['event.button === 0'] };
    const spec = {
      $schema: 'https://vega.github.io/schema/vega/v5.json',
      width,
      height,
      padding: { left: 0, right: 0, top: 0, bottom: 0 },
      autosize: { type: 'pad', contains: 'padding' },
      background: '#EAF2F6',
      // These values remember zoom, pan, the clicked SA2 and the hovered SA2.
      signals: [
        { name: 'mapZoom', value: 1 },
        { name: 'mapPan', value: [0, 0] },
        {
          name: 'selectedCode',
          value: model.selected?.SA2_Code || '',
          on: [{ events: '@dots:click', update: 'datum.SA2_Code' }]
        },
        {
          name: 'hoveredCode',
          value: '',
          on: [
            { events: '@dots:mouseover', update: 'datum.SA2_Code' },
            { events: '@dots:mouseout', update: "''" }
          ]
        }
      ],
      // geopoint turns each CSV longitude/latitude into an on-screen x/y position.
      data: [
        { name: 'fitFeatures', values: model.fit },
        {
          name: 'land',
          values: model.land,
          transform: [{ type: 'geopath', projection: 'base', as: 'cachedPath' }]
        },
        {
          name: 'points',
          values: model.points.map((r) => ({ ...r })),
          transform: [
            {
              type: 'geopoint',
              projection: 'projection',
              fields: ['Longitude', 'Latitude'],
              as: ['px', 'py']
            },
            { type: 'collect', sort: { field: 'Manufacturing_Businesses', order: 'descending' } }
          ]
        }
      ],
      projections: [
        {
          name: 'base',
          type: 'mercator',
          fit: { signal: "data('fitFeatures')" },
          extent: [
            [16, 16],
            [width - 16, height - 16]
          ]
        },
        {
          name: 'projection',
          type: 'mercator',
          scale: { signal: "(scale('base',[1,0])[0]-scale('base',[0,0])[0])*180/PI*mapZoom" },
          translate: {
            signal:
              "[width/2+(scale('base',[0,0])[0]-width/2)*mapZoom+mapPan[0],height/2+(scale('base',[0,0])[1]-height/2)*mapZoom+mapPan[1]]"
          }
        }
      ],
      // countSize controls circle AREA from a fixed 0–826 business domain.
      scales: [
        {
          name: 'countSize',
          type: 'linear',
          domain: [0, MAX_COUNT],
          range: [0, model.areaMax],
          zero: true
        }
      ],
      legends: [
        {
          size: 'countSize',
          title: ['Manufacturing businesses', 'Circle area represents count'],
          titleLimit: Math.max(220, width - 24),
          titleLineHeight: 20,
          titlePadding: 10,
          values: [25, 200, 800],
          orient: 'bottom',
          direction: 'horizontal',
          symbolFillColor: PURPLE,
          symbolStrokeColor: '#ffffff',
          symbolFillOpacity: 0.42,
          labelFontSize: 15,
          titleFontSize: 15,
          labelOffset: 10,
          columns: 3,
          columnPadding: 28,
          padding: 8,
          offset: 16
        }
      ],
      marks: [
        {
          type: 'path',
          from: { data: 'land' },
          clip: true,
          encode: {
            update: {
              path: { field: 'cachedPath' },
              scaleX: { signal: 'mapZoom' },
              scaleY: { signal: 'mapZoom' },
              x: { signal: 'width/2*(1-mapZoom)+mapPan[0]' },
              y: { signal: 'height/2*(1-mapZoom)+mapPan[1]' },
              fill: { value: '#f0f3f6' },
              stroke: { value: '#ADBCC8' },
              strokeWidth: { signal: '0.55/mapZoom' }
            }
          }
        },
        {
          type: 'symbol',
          name: 'dots',
          from: { data: 'points' },
          clip: true,
          encode: {
            update: {
              x: { field: 'px' },
              y: { field: 'py' },
              size: { scale: 'countSize', field: 'Manufacturing_Businesses' },
              shape: { value: 'circle' },
              fill: { signal: `datum.SA2_Code===selectedCode ? '${HIGHLIGHT}' : '${PURPLE}'` },
              fillOpacity: { signal: 'datum.Manufacturing_Businesses>0 ? 0.42 : 0' },
              stroke: {
                signal: `datum.SA2_Code===selectedCode || datum.SA2_Code===hoveredCode ? '${HIGHLIGHT}' : '#ffffff'`
              },
              strokeWidth: {
                signal: 'datum.SA2_Code===selectedCode || datum.SA2_Code===hoveredCode ? 2 : 0.2'
              },
              cursor: { value: 'pointer' },
              tooltip: {
                signal:
                  "{'SA2':datum.SA2_Name,'State':datum.State,'Manufacturing businesses':format(datum.Manufacturing_Businesses,',d'),'Year':datum.Year}"
              }
            }
          }
        },
        {
          type: 'symbol',
          name: 'selectionOutline',
          from: { data: 'points' },
          clip: true,
          interactive: false,
          encode: {
            update: {
              x: { field: 'px' },
              y: { field: 'py' },
              size: { signal: "scale('countSize',datum.Manufacturing_Businesses)+55" },
              fill: { value: 'transparent' },
              stroke: { value: HIGHLIGHT },
              strokeWidth: { value: 1 },
              opacity: { signal: 'datum.SA2_Code===selectedCode ? 1 : 0' }
            }
          }
        }
      ],
      config: { font: 'Arial,sans-serif', legend: { labelColor: '#20312F', titleColor: '#20312F' } }
    };
    if (manual)
      spec.signals.push(
        {
          name: 'dragging',
          value: false,
          on: [
            { events: down, update: 'true' },
            { events: 'window:pointerup, window:pointercancel', update: 'false' }
          ]
        },
        {
          name: 'panStart',
          value: [0, 0, 0, 0],
          on: [{ events: down, update: '[x(),y(),mapPan[0],mapPan[1]]' }]
        }
      );
    if (manual) {
      spec.signals.push({
        name: 'dragMoved',
        value: false,
        on: [
          { events: down, update: 'false' },
          {
            events: {
              source: 'window',
              type: 'pointermove',
              between: [down, { source: 'window', type: 'pointerup' }]
            },
            update: 'dragMoved || abs(x()-panStart[0])+abs(y()-panStart[1]) > 4'
          }
        ]
      });
      spec.signals.find((s) => s.name === 'selectedCode').on[0].update =
        'dragMoved ? selectedCode : datum.SA2_Code';
    }
    if (manual)
      spec.signals.find((s) => s.name === 'mapPan').on = [
        {
          events: {
            source: 'window',
            type: 'pointermove',
            throttle: 32,
            between: [down, { source: 'window', type: 'pointerup' }]
          },
          update: 'dragging ? [panStart[2]+x()-panStart[0],panStart[3]+y()-panStart[1]] : mapPan'
        }
      ];
    return spec;
  }
  const api = { buildModel, makeMapSpec, distanceKm, MAX_COUNT };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
    return;
  }
  const embedded = document.querySelector('[data-v2-overlap]');
  const uiRoot = embedded || document;
  const $ = (id) => document.getElementById(embedded ? (id === 'map' ? 'map2' : 'v2-' + id) : id);
  let rows = [],
    features = [],
    view = null,
    method = embedded
      ? 'ranking'
      : ['current', 'detail', 'ranking'].includes(
            new URLSearchParams(location.search).get('method')
          )
        ? new URLSearchParams(location.search).get('method')
        : 'detail',
    generation = 0,
    ready = false,
    viewMethod = null,
    renderedRegion = null;
  const navigation = { current: { zoom: 1, pan: [0, 0] }, ranking: { zoom: 1, pan: [0, 0] } };
  function captureNavigation() {
    if (view && navigation[viewMethod])
      navigation[viewMethod] = { zoom: view.signal('mapZoom'), pan: view.signal('mapPan').slice() };
  }
  const state = { region: embedded ? '' : 'New South Wales', code: '' };
  function scopeRows() {
    return method === 'current'
      ? rows
      : rows.filter((r) => !state.region || r.State === state.region);
  }
  function populateLookup() {
    const query = $('search') ? $('search').value.trim().toLocaleLowerCase() : '',
      list = scopeRows()
        .filter((r) => r.SA2_Name.toLocaleLowerCase().includes(query))
        .sort((a, b) => a.SA2_Name.localeCompare(b.SA2_Name));
    $('sa2').replaceChildren(new Option('All SA2s in study area', ''));
    for (const r of list)
      $('sa2').add(
        new Option(
          `${r.SA2_Name} · ${r.Manufacturing_Businesses.toLocaleString('en-AU')}`,
          r.SA2_Code
        )
      );
    const selected = scopeRows().find((r) => r.SA2_Code === state.code);
    if (selected && !list.some((r) => r.SA2_Code === selected.SA2_Code))
      $('sa2').add(new Option('Selected: ' + selected.SA2_Name, selected.SA2_Code));
    $('sa2').value = state.code;
    $('lookup-status').textContent = query
      ? `${list.length} SA2 names match. Search changes the lookup list; map records remain unchanged.`
      : '';
  }
  function describeSelection(model) {
    const host = $('selected');
    host.classList.toggle('instruction-card', !model.selected);
    host.replaceChildren();
    const title = document.createElement('strong');
    title.textContent = model.selected
      ? `${model.selected.SA2_Name} · ${model.selected.Manufacturing_Businesses.toLocaleString('en-AU')} manufacturing businesses`
      : 'Choose an SA2 to inspect its exact count.';
    host.append(title);
    if (model.selected) {
      const p = document.createElement('p');
      p.textContent = `${model.selected.State} · SA2 ${model.selected.SA2_Code} · ${model.selected.Year}. Existing point-on-surface anchor; not an individual factory location.`;
      host.append(p);
    }
  }
  // In the dashboard ranking view, selecting an SA2 refits the map to its neighbourhood.
  function select(code) {
    state.code = code || '';
    // The options only change with the study area or search, not every selection.
    $('sa2').value = state.code;
    if (state.code && $('sa2').value !== state.code) {
      const row = rows.find((r) => r.SA2_Code === state.code);
      if (row) $('sa2').add(new Option(row.SA2_Name, row.SA2_Code));
      $('sa2').value = state.code;
    }
    render({ refit: method === 'ranking' });
  }
  function setHover(code) {
    if (view)
      view
        .signal('hoveredCode', code || '')
        .runAsync()
        .catch((error) => console.error(error));
  }
  function renderRanking(model) {
    // Show the fifteen highest counts. Clicking a bar selects the same SA2 on the map.
    const host = $('bars');
    host.replaceChildren();
    const top = model.ranking.slice(0, 15);
    $('ranking-scope').textContent =
      `Top ${Math.min(15, model.ranking.length)} of ${model.ranking.length.toLocaleString('en-AU')} SA2s · ${state.region || 'Australia'}.`;
    function add(row) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'bar-row';
      b.classList.toggle('active', row.SA2_Code === state.code);
      b.dataset.code = row.SA2_Code;
      b.setAttribute(
        'aria-label',
        `${row.SA2_Name}: ${row.Manufacturing_Businesses} manufacturing businesses`
      );
      b.setAttribute('aria-pressed', String(row.SA2_Code === state.code));
      const name = document.createElement('span');
      name.className = 'bar-name';
      name.textContent = row.SA2_Name;
      const track = document.createElement('span');
      track.className = 'track';
      const fill = document.createElement('span');
      fill.className = 'bar';
      fill.style.width = (100 * row.Manufacturing_Businesses) / MAX_COUNT + '%';
      track.append(fill);
      const value = document.createElement('span');
      value.className = 'bar-value';
      value.textContent = row.Manufacturing_Businesses.toLocaleString('en-AU');
      b.append(name, track, value);
      b.onclick = () => select(row.SA2_Code);
      b.onmouseenter = b.onfocus = () => setHover(row.SA2_Code);
      b.onmouseleave = b.onblur = () => setHover('');
      host.append(b);
    }
    top.forEach(add);
  }
  async function render({ refit = false } = {}) {
    // Build the live Vega spec here; this page does not fetch work/viz2.vg.json.
    if (!ready) return;
    cancelAnimationFrame(zoomFrame);
    zoomFrame = 0;
    pendingZoom = null;
    captureNavigation();
    if (refit && method === 'ranking') navigation.ranking = { zoom: 1, pan: [0, 0] };
    const token = ++generation;
    $('comparison').setAttribute('aria-busy', 'true');
    const overview = method === 'current',
      manual = ['current', 'ranking'].includes(method),
      ranking = method === 'ranking',
      model = buildModel(rows, features, state.region, state.code, method);
    if (!embedded) {
      $('method-label').textContent =
        'METHOD ' + { current: 'A', detail: 'B', ranking: 'C' }[method];
      $('method-title').textContent = modes[method].title;
      $('method-description').textContent = modes[method].description;
    }
    $('comparison').setAttribute(
      'aria-labelledby',
      embedded ? 'editorial-v2-title' : 'tab-' + method
    );
    for (const b of uiRoot.querySelectorAll('[data-method]'))
      b.setAttribute('aria-selected', String(b.dataset.method === method));
    // Ranking view keeps the bars visible and hides the continuous zoom slider.
    $('composition').classList.toggle('with-ranking', ranking);
    $('ranking').hidden = !ranking;
    $('manual-controls').hidden = !manual;
    $('region').disabled = overview;
    $('map').classList.toggle('manual', manual);
    $('zoom-control').hidden = ranking;
    if ($('search-control')) $('search-control').hidden = true;
    uiRoot.querySelector('.filters').classList.toggle('without-search', ranking);
    if (ranking) uiRoot.querySelector('.filters').append($('reset'));
    else $('manual-controls').insertBefore($('reset'), $('manual-hint'));
    $('scope').textContent = model.scope;
    $('size-note').textContent = 'Circle area shows business count on a fixed 0–826 scale. Circles can overlap.';
    describeSelection(model);
    if (ranking) renderRanking(model);
    if (manual) {
      $('zoom').value = String(navigation[method].zoom);
      $('zoom-label').textContent = navigation[method].zoom.toFixed(1) + '×';
    }
    $('manual-hint').textContent = ranking
      ? 'Drag to pan. Reset returns to the fitted area; choosing another SA2 fits its neighbourhood. Ordinary scrolling moves the page.'
      : 'Drag to pan. Ordinary scrolling moves the page.';
    try {
      const width = Math.max(180, Math.floor($('map').parentElement.clientWidth));
      if (view && viewMethod === method && view.width() === width) {
        // Keep the parsed chart and its SVG. Only the fit and visible points change.
        if (renderedRegion !== state.region) {
          view.change('land', vega.changeset().remove(() => true).insert(model.land));
        }
        view
          .change('fitFeatures', vega.changeset().remove(() => true).insert(model.fit))
          .change('points', vega.changeset().remove(() => true).insert(model.points))
          .signal('selectedCode', state.code)
          .signal('hoveredCode', '');
        if (manual) view.signal('mapZoom', navigation[method].zoom).signal('mapPan', navigation[method].pan.slice());
        await view.runAsync();
        renderedRegion = state.region;
        return;
      }
      view?.finalize();
      view = null;
      $('map').replaceChildren();
      const canvas = document.createElement('div');
      $('map').append(canvas);
      const result = await vegaEmbed(canvas, readableChartText(makeMapSpec(model, width, innerWidth < 620)), {
        renderer: 'svg',
        actions: true
      });
      if (token !== generation) {
        result.view.finalize();
        return;
      }
      view = result.view;
      viewMethod = method;
      renderedRegion = state.region;
      const liveView = view;
      if (manual)
        await view
          .signal('mapZoom', navigation[method].zoom)
          .signal('mapPan', navigation[method].pan.slice())
          .runAsync();
      view.addSignalListener('selectedCode', (_, code) => {
        requestAnimationFrame(() => {
          if (view === liveView && code !== state.code) select(code);
        });
      });
      view.addSignalListener('hoveredCode', (_, code) => {
        for (const b of $('bars').querySelectorAll('.bar-row'))
          b.classList.toggle('hovered', b.dataset.code === code);
      });
      $('load-status').textContent =
        `${rows.length.toLocaleString('en-AU')} SA2s loaded.`;
    } catch (error) {
      console.error(error);
      $('load-status').textContent =
        (embedded ? 'V2 could not render: ' : 'Comparison could not render: ') + error.message;
      $('load-status').classList.add('load-error');
    } finally {
      if (token === generation) $('comparison').setAttribute('aria-busy', 'false');
    }
  }
  $('region').onchange = () => {
    state.region = $('region').value;
    state.code = '';
    if ($('search')) $('search').value = '';
    populateLookup();
    render({ refit: method === 'ranking' });
  };
  if ($('search')) $('search').oninput = populateLookup;
  $('sa2').onchange = () => select($('sa2').value);
  $('clear').onclick = () => {
    state.region = '';
    $('region').value = '';
    if ($('search')) $('search').value = '';
    populateLookup();
    if (navigation[method]) {
      navigation[method] = { zoom: 1, pan: [0, 0] };
      if (view && viewMethod === method) view.signal('mapZoom', 1).signal('mapPan', [0, 0]);
    }
    select('');
  };
  for (const button of uiRoot.querySelectorAll('[data-method]')) {
    button.onclick = () => {
      captureNavigation();
      method = button.dataset.method;
      if (method !== 'current' && state.code) {
        const row = rows.find((r) => r.SA2_Code === state.code);
        if (row && state.region && row.State !== state.region) {
          state.region = row.State;
          $('region').value = state.region;
        }
      }
      populateLookup();
      render({ refit: method === 'ranking' });
    };
    button.onkeydown = (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const list = [...uiRoot.querySelectorAll('[data-method]')],
        i = list.indexOf(button),
        next =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? 2
              : (i + (event.key === 'ArrowRight' ? 1 : -1) + 3) % 3;
      list[next].focus();
      list[next].click();
    };
  }
  let pendingZoom = null,
    zoomFrame = 0;
  $('zoom').oninput = () => {
    const next = Number($('zoom').value);
    $('zoom-label').textContent = next.toFixed(1) + '×';
    pendingZoom = next;
    if (zoomFrame) return;
    zoomFrame = requestAnimationFrame(async () => {
      zoomFrame = 0;
      if (!view || method !== 'current') return;
      const prior = view.signal('mapZoom'),
        z = pendingZoom;
      pendingZoom = null;
      await view
        .signal(
          'mapPan',
          view.signal('mapPan').map((v) => (v * z) / prior)
        )
        .signal('mapZoom', z)
        .runAsync();
      captureNavigation();
    });
  };
  // Reset the map scale and position without changing the business counts.
  $('reset').onclick = async () => {
    cancelAnimationFrame(zoomFrame);
    zoomFrame = 0;
    pendingZoom = null;
    $('zoom').value = '1';
    $('zoom-label').textContent = '1.0×';
    if (navigation[method]) navigation[method] = { zoom: 1, pan: [0, 0] };
    if (view) await view.signal('mapZoom', 1).signal('mapPan', [0, 0]).runAsync();
  };
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 220);
  });
  Promise.all([
    fetch('work/data/vis02_sa2_count_points.csv').then((r) => {
      if (!r.ok) throw Error('V2 count data: HTTP ' + r.status);
      return r.text();
    }),
    fetch('work/data/SA2_2021_AUST_GDA2020_web.json').then((r) => {
      if (!r.ok) throw Error('SA2 geometry: HTTP ' + r.status);
      return r.json();
    })
  ])
    .then(([csv, topology]) => {
      // Read the count table and the area boundaries before drawing V2.
      rows = vega.read(csv, { type: 'csv' }).map((r) => ({
        ...r,
        Manufacturing_Businesses: Number(r.Manufacturing_Businesses),
        Year: Number(r.Year),
        Longitude: Number(r.Longitude),
        Latitude: Number(r.Latitude)
      }));
      if (
        rows.some(
          (r) =>
            !Number.isFinite(r.Manufacturing_Businesses) ||
            !Number.isFinite(r.Longitude) ||
            !Number.isFinite(r.Latitude)
        )
      )
        throw Error('Invalid original count/coordinate value.');
      features = vega.read(topology, { type: 'topojson', feature: 'SA2_2021_AUST_GDA2020' });
      for (const name of [...new Set(rows.map((r) => r.State))].sort())
        $('region').add(new Option(name, name));
      if (!rows.some((r) => r.State === state.region)) state.region = '';
      $('region').value = state.region;
      if (!embedded)
        state.code =
          rows.find(
            (r) => r.State === state.region && r.SA2_Name === 'Sydney (North) - Millers Point'
          )?.SA2_Code || '';
      for (const id of ['search', 'sa2', 'clear', 'region']) if ($(id)) $(id).disabled = false;
      ready = true;
      populateLookup();
      render();
    })
    .catch((error) => {
      console.error(error);
      $('load-status').textContent = 'Data could not load: ' + error.message;
      $('load-status').classList.add('load-error');
      $('comparison').setAttribute('aria-busy', 'false');
    });
})(typeof window !== 'undefined' ? window : globalThis);
