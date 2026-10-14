const rateColors = ["#F1F5F9", "#C7E4EB", "#83C8D6", "#3D9CB8", "#22749D", "#185078", "#102E55"];
const chartViews = new Map();
const specTargets = [
  ["map1", "work/map1.vg.json"],
  ["map2", "work/map2.vg.json"],
  ["map3", "work/map3.vg.json?v=npi-dots"],
  ["treemap", "work/vis04_iva_treemap.vg.json?v=fit-labels"],
  ["heatmap", "work/vis05_state_subdivision_heatmap.vg.json?v=selectable-matrix-1"],
  ["vis06", "work/vis06_grouped_growth.vg.json?v=accepted-bars-1"],
  ["vis07", "work/vis07_parallel_coordinates.vg.json?v=polish-labels"],
  ["vis08", "work/vis08_national_employment.vg.json?v=full-years"],
  ["vis09", "work/vis09_employment_rank_bump.vg.json?v=polish-rank-labels"],
  ["vis10", "work/vis10_state_export_flow_map.vg.json"],
  ["vis11", "work/vis11_directed_chord.vg.json"],
  ["vis12", "work/vis12_consumer_attitudes.vg.json"],
  ["vis13", "work/vis13_iva_slopegraph.vg.json?v=polish-context"]
];
function getBoundaryUrl() {
  return "work/data/SA2_2021_AUST_GDA2020_web.json";
}

function showRateLegend(breaks) {
  const labels = [
    `0–${breaks[0].toLocaleString("en-AU", { maximumFractionDigits: 1 })}`,
    ...breaks.slice(1).map((value, index) => `>${breaks[index].toLocaleString("en-AU", { maximumFractionDigits: 1 })}–${value.toLocaleString("en-AU", { maximumFractionDigits: 1 })}`),
    `>${breaks.at(-1).toLocaleString("en-AU", { maximumFractionDigits: 1 })}`
  ];
  document.getElementById("rate-legend").innerHTML = labels.map((label, index) =>
    `<button type="button" class="legend-item" data-rate-class="${index}" aria-pressed="false"><span class="swatch" style="background:${rateColors[index]}"></span><span>${label}</span></button>`
  ).join("");
}

async function loadSpec(target, url) {
  const container = document.getElementById(target);
  if (target === "vis09") { v9Playback?.dispose(); v9Playback = null; }
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load ${url} (${response.status})`);
    let spec = await response.json();
    if (target === "map1") spec.data.url = await getBoundaryUrl();
    if (target === "map2") spec.layer[0].data.url = await getBoundaryUrl();
    if ((target === "map1" || target === "map2") && window.innerWidth <= 620) {
      spec.height = 380;
    }
    if (target === "vis06" && window.innerWidth <= 620) {
      spec.encoding.color.legend.direction = "vertical";
      spec.encoding.color.legend.columns = 1;
      spec.encoding.x.axis = { values: [-15, 0, 15, 30], title: "Growth (%)" };
      spec.encoding.y.axis.labelLimit = 115;
      spec.encoding.y.axis.labelFontSize = 11;
      spec.height = 650;
    }
    if (target === "vis07") {
      spec.width = container.clientWidth;
      if (window.innerWidth <= 620) {
        spec.height = 330;
        spec.padding = { left: 52, right: 12, top: 14, bottom: 42 };
        spec.axes[0].encode = { labels: { update: { text: { signal: "datum.value === 'Wages and salaries' ? 'Wages' : datum.value === 'Sales and service income' ? 'Sales' : datum.value === 'Industry value added' ? 'IVA' : datum.value" } } } };
      }
    }
    if (target === "vis09") spec = addV9Playback(spec);
    if (target === "vis09" && window.innerWidth <= 620) {
      spec.width = 650;
      spec.height = 430;
    }
    if (target === "treemap" && container.clientWidth < spec.width) {
      const widthRatio = container.clientWidth / spec.width;
      spec.width = container.clientWidth;
      spec.height = Math.max(260, Math.round(spec.height * widthRatio));
    }
    if (target === "heatmap" && window.innerWidth < 720) spec.width = { step: 48 };
    if (target === "vis13") spec.width = Math.max(900, container.clientWidth - 10);
    if (target === "vis11") {
      spec.width = Math.max(860, container.clientWidth - 10);
      if (window.innerWidth <= 620) spec.height = 560;
    }
    if (target === "vis08") {
      delete spec.width;
      spec.vconcat.forEach(v => { v.width = Math.max(180, Math.min(container.clientWidth, window.innerWidth - 24) - (window.innerWidth <= 620 ? 90 : 70)); });
      spec.vconcat[0].height = window.innerWidth <= 620 ? 240 : 300;
      if (window.innerWidth <= 620) { spec.vconcat[0].layer[3].mark.align = "right"; spec.vconcat[0].layer[3].encoding.text.datum = "2019–2020 low: 830.2k"; }
    }
    if (target === "map3" || target === "vis10") {
      spec.width = container.clientWidth;
      spec.height = window.innerWidth <= 620 ? (target === "map3" ? 320 : 290) : (target === "vis10" ? 520 : 470);
    }
    if (target === "vis12" && window.innerWidth <= 620) {
      spec.width = "container";
      spec.height = 280;
      spec.encoding.x.axis.title = "Reported share (%)";
      spec.encoding.x.axis.values = [0, 50, 100];
      spec.encoding.y.axis.labelExpr = "datum.label === 'Have been looking to buy more' ? ['Have been looking', 'to buy more'] : datum.label === 'More likely with known origin' ? ['More likely with', 'known origin'] : datum.label";
      spec.encoding.y.axis.labelLimit = 155;
      spec.encoding.y.axis.labelFontSize = 12;
    }
    if (target === "vis08") spec = addEmploymentBrushBindings(spec);
    if (["map1", "map2", "map3"].includes(target)) spec = addMapNavigation(spec, target, container);
    if (target === "map1") window.v1TooltipLeaderCleanup?.();
    chartViews.get(target)?.finalize();
    const result = await vegaEmbed(container, spec, { actions: false, renderer: ["map1", "map2", "map3", "heatmap", "vis07", "vis09", "vis10", "vis11", "vis13"].includes(target) ? "svg" : "canvas" });
    chartViews.set(target, result.view);
    if (target === "map1") { await setupV1ClassHighlight(result.view); await setupV1TooltipLeader(result.view); setupV1Performance(result.view); }
    if (["map3", "vis10", "vis11"].includes(target)) setupRedesignControls(target, result.view);
    if (["map1", "map2", "map3"].includes(target)) setupMapNavigation(target, result.view);
    if (target === "vis10") setupMapNavigation(target, result.view);
    if (target === "vis08") setupEmploymentPolish(result.view);
    if (target === "heatmap") setupMatrixPolish(result.view);
    if (target === "map3") setupFacilityFilters(result.view);
    if (target === "vis10") setupDestinationSummary(result.view);
    if (target === "vis11") setupIndustrySummary(result.view);
    if (["vis07", "vis09", "vis13"].includes(target)) setupProfileFocus(target, result.view);
    if (target === "vis09") setupV9Playback(result.view);
  } catch (error) {
    container.replaceChildren();
    const message = document.createElement("p");
    message.className = "load-error";
    message.textContent = "Chart unavailable. Serve this folder over HTTP and check that its data files are present.";
    container.append(message);
    console.error(error);
  }
}


function populateSelect(select, rows, getKey, getLabel) {
  const previous = select.value;
  select.querySelectorAll("option:not(:first-child)").forEach(option => option.remove());
  rows.forEach(row => select.add(new Option(getLabel(row), getKey(row))));
  select.value = Array.from(select.options).some(option => option.value === previous) ? previous : "";
}
const aud = value => "A$" + value.toLocaleString("en-AU", { maximumFractionDigits: 0 });
function setupRedesignControls(target, view) {
  if (target === "map3") {
    const select = document.getElementById("facility-select"), detail = document.getElementById("facility-detail");
    const rows = view.data("facilities").slice().sort((a,b) => a.Facility_Name.localeCompare(b.Facility_Name));
    const repeated = new Map();
    rows.forEach(r => { const key = r.Facility_Name + "|" + r.State; repeated.set(key, (repeated.get(key) || 0) + 1); });
    populateSelect(select, rows, r => String(r.Facility_ID), r => `${r.Facility_Name} · ${r.State}${repeated.get(r.Facility_Name + "|" + r.State) > 1 ? " · ID " + r.Facility_ID : ""}`);
    const show = key => {
      const row = rows.find(r => String(r.Facility_ID) === String(key));
      detail.textContent = row ? `${row.Facility_Name} · ${row.State} · ${row.Industry} · ${row.Reporting_Period}. Source: NPI reporting facilities; not all manufacturers or Australian Made certified facilities.` : "Hover or tap a dot for its name and primary industry. The lookup also reaches facilities sharing coordinates.";
    };
    select.onchange = () => { const row = rows.find(r => String(r.Facility_ID) === select.value); view.signal("selectedFacility", row?.Facility_ID ?? null).runAsync(); show(select.value); };
    view.addSignalListener("selectedFacility", (_, key) => { select.value = key == null ? "" : String(key); show(key); });
    select.onchange();
  }
  if (target === "vis10") {
    const state = document.getElementById("export-state-select"), flow = document.getElementById("export-flow-select"), detail = document.getElementById("export-flow-detail");
    const rows = view.data("flows"), origins = view.data("origins");
    populateSelect(state, origins, r => r.State, r => r.State);
    const showFlows = () => populateSelect(flow, rows.filter(r => !state.value || r.Source === state.value), r => r.Key, r => `${r.Source} → ${r.Target}`);
    const show = key => {
      const row = rows.find(r => r.Key === key);
      detail.textContent = row ? `${row.Source} → ${row.Target}: ${aud(row.Value_AUD_thousands * 1000)}. STM + ETM (Simply + Elaborately Transformed Manufactures), 2025. Recorded state-of-origin Export basis; representative areas, not ports or shipping routes.` : "Hover or tap a connection, or choose an origin and destination above.";
    };
    state.onchange = () => { view.signal("selectedState", state.value).signal("selectedFlow", "").runAsync(); flow.value = ""; showFlows(); show(""); };
    flow.onchange = () => { view.signal("selectedFlow", flow.value).runAsync(); show(flow.value); };
    view.addSignalListener("selectedState", (_, key) => { state.value = key; flow.value = ""; showFlows(); });
    view.addSignalListener("selectedFlow", (_, key) => { flow.value = key; show(key); });
    showFlows(); view.signal("selectedState", state.value).signal("selectedFlow", flow.value).runAsync(); show(flow.value);
  }
  if (target === "vis11") {
    const industry = document.getElementById("industry-select"), relationship = document.getElementById("relationship-select"), detail = document.getElementById("relationship-detail");
    const nodes = view.data("nodes"), rows = view.data("edges");
    populateSelect(industry, nodes, r => r.Code, r => r.Name);
    const showEdges = () => populateSelect(relationship, rows.filter(r => !industry.value || r.Source === industry.value || r.Target === industry.value), r => r.Key, r => `${r.Source_Name} → ${r.Target_Name}`);
    const show = key => { const row = rows.find(r => r.Key === key); detail.textContent = row ? `Supplier → User: ${row.Source_Name} → ${row.Target_Name}. ${aud(row.Value_AUD_millions * 1000000)} (source A$ million), 2023–24 domestic intermediate use at basic prices.${row.Source === row.Target ? " Manufacturing self-use." : ""}` : "Arrow tips point to the using division. Manufacturing → Manufacturing is self-use, not a reciprocal pair."; };
    industry.onchange = () => { view.signal("selectedIndustry", industry.value).signal("selectedEdge", "").runAsync(); relationship.value = ""; showEdges(); show(""); };
    relationship.onchange = () => { view.signal("selectedEdge", relationship.value).runAsync(); show(relationship.value); };
    view.addSignalListener("selectedIndustry", (_, key) => { industry.value = key; showEdges(); });
    view.addSignalListener("selectedEdge", (_, key) => { relationship.value = key; show(key); });
    showEdges(); view.signal("selectedIndustry", industry.value).signal("selectedEdge", relationship.value).runAsync(); show(relationship.value);
  }
}

async function start() {
  try {
    const response = await fetch("work/data/validation.json");
    if (!response.ok) throw new Error("Validation metadata is unavailable");
    const validation = await response.json();
    showRateLegend(validation.visualisation_1_2.rate_class_breaks);
  } catch (error) {
    document.getElementById("rate-legend").textContent = "Legend metadata unavailable.";
    console.error(error);
  }
  await Promise.all(specTargets.map(([target, url]) => loadSpec(target, url)));
  let previousWidth = window.innerWidth;
  let resizeTimer;
  let resizeQueue = Promise.resolve();
  window.addEventListener("resize", () => {
    if (window.innerWidth === previousWidth) return;
    previousWidth = window.innerWidth;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeQueue = resizeQueue.then(() =>
        Promise.all(specTargets.map(([target, url]) => loadSpec(target, url)))
      );
    }, 180);
  });
}

start();
