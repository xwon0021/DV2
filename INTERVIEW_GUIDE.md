# FIT3179 DV2: quick interview guide

## The answer to “How did you build the dashboard?”

“I started with data from ABS, NPI, DFAT and the consumer survey. I prepared smaller CSV and JSON files for the questions I wanted to answer. `index.html` has the story and empty chart spaces. The files in `work/viz*.vg.json` tell Vega or Vega-Lite which data to load and how to draw each chart. `js/dashboard-app.js` loads most of them using `vegaEmbed()`. The other JavaScript files connect filters, buttons, tooltips, zoom and playback to the charts. CSS controls the layout and mobile view.”

**Follow one chart:** data file → field or calculation in the spec → visual encoding → `vegaEmbed()` or a controller → chart in `index.html`.

## Where to point in the code

| On the page | Idiom and meaning | Data → drawing → interaction |
| --- | --- | --- |
| V1 | Choropleth. SA2 colour = businesses per 10,000 residents. | `vis01_sa2_rate.csv` + SA2 boundaries → `viz1.vg.json` (`lookup`, `Businesses_per_10000`, colour threshold) → `dashboard-app.js` and `dashboard-interactions.js` (legend, selection, zoom). |
| V2 | Proportional symbol map. Circle area = number of businesses in an SA2. | `vis02_sa2_count_points.csv` + SA2 boundaries → `viz2-controller.js` (`buildModel`, `makeMapSpec`, `countSize`) → map, lookup and linked ranking. The point is an SA2 anchor, not a factory. |
| V3 | Dot map. Each point = one NPI reporting facility. | `vis03_npi_facilities.json` → `viz3.vg.json` (`geopoint`, `facilityDots`) → `setupFacilityFilters()` in `dashboard-interactions.js`. These are reporting facilities, not all factories. |
| V4 | Connected dot plot. Two dots compare each industry's share of workers and share of IVA. | `vis06_sales_vs_iva_growth.csv` → `viz4.vg.json` (`joinaggregate`, `employmentShare`, `ivaShare`, `fold`, rule and dots) → `dashboard-app.js`. |
| V5 | Heatmap. Each cell colour = an industry's share of that state's manufacturing employment. | `vis05_state_subdivision_employment.csv` → `viz5.vg.json` (`x` industry, `y` state, `color` share) → `setupMatrixPolish()` in `dashboard-interactions.js`. |
| V6 | Paired bars. Two growth rates for each industry. | `vis06_sales_vs_iva_growth.csv` → `viz6.vg.json` (`fold` sales and IVA growth, `x` growth, `y` industry, `yOffset` measure) → `dashboard-app.js`. Missing values are filtered out. |
| V7 | Parallel coordinates. One industry is a line across four economic measures. | `vis07_parallel_coordinates.csv` → `viz7.vg.json` (`Normalised_Value` on a 0–1 scale) → industry focus in `dashboard-interactions.js`. Compare profiles, not raw units. |
| V8 | Time series with overview and detail. The line shows employment over time. | `vis08_national_employment_overview.json` → `viz8.vg.json` (`vconcat`, period selection) → `addEmploymentBrushBindings()` in `dashboard-interactions.js`. |
| V9 | Animated ranking bars. Length = employment, vertical place = rank. | `viz9.json` + `viz9-years.json` → `viz9.vg.json` (`current`, `Visual_Value`, `Visual_Position`) → `viz9-controller.js` (slider, Play, Pause). |
| V10 | Directed chord. A connection goes from supplying industry to using industry. | `vis11_domestic_edges.json` + division nodes + layout → `viz10.vg.json` (`edges`, ribbons, arcs) → `setupRedesignControls()` in `dashboard-app.js`. |
| V11 | Slopegraph. Two endpoints show 2023–24 and 2024–25 IVA for each industry. | Values inside `viz11.vg.json` (`iva`, `slopes`, `endpoints`) → `editorialSlopeFit()` and focus control. Both years use one vertical scale. |
| V12 | Flow map. Paths show state-origin manufactured exports to destinations. | `vis10_state_export_flows.json` + `vis10_flow_geometry.json` → `viz12.vg.json` (`flows`, `flowLines`, width scale) → export selectors and zoom in the JavaScript. |
| V13 | Isotype. 20 icons = 100%; each icon = 5 percentage points. | `viz13.json` → `viz13-controller.js` (`makeIsotypeIcon`, partial fill, exact label). These are reported attitudes or intentions. |

**Watch the numbering:** the page number is the topic order. Data and file names may use an older number. Use this table instead of assuming V12 reads `vis12_...`.

## Three charts to practise explaining in more detail

### V1: why a rate instead of a count?

“I joined the SA2 code in the boundary file with the SA2 code in my data table. The rate is `business count / population × 10,000`. A large area can have more businesses simply because it has more people, so the rate is more suitable for comparing areas. In the Vega-Lite spec, `lookup` performs the join and `encoding.color` maps the rate to a light-to-dark scale. Missing or invalid rates are shown separately.”

### V4: what creates the connected dots?

“The file has employment and IVA for each manufacturing industry. `joinaggregate` gets the totals. Two `formula` transforms divide each industry's value by the total and multiply by 100. `fold` turns those two share columns into two point records per industry. The spec draws one rule between the shares and two differently coloured and shaped points. The horizontal axis is a shared percentage scale.”

### V9: is animation invented data?

“No. `viz9.json` contains the observed years. The slider picks one year using `yearIndex`. The chart looks up the previous year's value and position for the same industry. `transitionT` only moves the bars smoothly between the two observed frames. The labels show the chosen year's recorded values.”

## Small theory answers

- **Idiom:** the chart form, such as choropleth, heatmap or slopegraph.
- **Mark:** the visible object, such as a dot, bar, line, rectangle or map area.
- **Channel:** how a value changes the mark, such as position, length, area or colour.
- **Absolute vs normalised:** V2 uses business counts; V1 divides by population. V7 changes different measures to a common 0–1 scale.
- **Interaction:** a user action changes a filter or Vega signal, then the view redraws. For example, V3 changes `stateFilter`; V9 changes `yearIndex`.

## Quick practice

For any chart, say **one data row**, **the main visual channel**, **why the idiom fits**, and **the relevant file/function**. Open `index.html`, choose V1, V4 and V9, and practise those four answers aloud.
