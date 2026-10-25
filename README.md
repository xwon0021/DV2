# Australian Made Products · Visualising Local Manufacturing

**FIT3179 Data Visualisation 2**  
*A data-led exploration of where Australian manufacturing happens, what the sector produces, how it has transformed over time, and how consumer sentiment connects to local products.*

- **Author**: Wong Xin Thung
- **Unit**: FIT3179 (Data Visualisation 2), Monash University
- **Entry Point**: `index.html`
- **Github Pages Link**: `https://xwon0021.github.io/DV2/`
---

## 📊 Dashboard Structure & Visualisations

The dashboard is structured into four narrative chapters featuring 13 cohesive, interactive visualisations:

### 01 / Place and Concentration
- **V1 — Manufacturing Concentration (Choropleth Map)**: Business count per 10,000 residents across Australian SA2 areas (`work/viz1.vg.json`).
- **V2 — Absolute Business Clusters (Proportional Symbol Map & Ranking)**: National counts and regional cluster ranking. The live map spec is built in `js/viz2-controller.js`; `work/viz2.vg.json` is a reference layout.
- **V3 — Reporting Manufacturing Facilities (Dot Map)**: 1,210 National Pollutant Inventory (NPI) manufacturing locations (`work/viz3.vg.json`).

### 02 / Sector Structure
- **V4 — Workforce Share vs. Industry Value Added (Connected Dot Plot)**: Compares employment share with economic value across 15 subdivisions (`work/viz4.vg.json`).
- **V5 — State Manufacturing Mix (Heatmap Matrix)**: Subdivisions' employment shares by Australian state/territory (`work/viz5.vg.json`).
- **V6 — Sales vs. Value-Added Growth (Paired Divergence Bar Chart)**: Year-on-year growth comparison (2023–24 to 2024–25) (`work/viz6.vg.json`).
- **V7 — Multi-Dimensional Economic Profiles (Parallel Coordinates)**: Normalised comparison of employment, wages, sales, and IVA (`work/viz7.vg.json`).

### 03 / Change Over Time
- **V8 — National Manufacturing Employment History (Overview + Detail Time Series)**: 19 June-end observations from 2006–07 through 2024–25, with linked start/end selectors and overview brush (`work/viz8.vg.json`).
- **V9 — Employment Ranking & Size (Interactive Timeline Race)**: Employment changes across 19 annual observations (`work/viz9.vg.json`, `js/viz9-controller.js`).
- **V10 — Industry Value Added Trajectory (Slopegraph)**: Industry gains and declines between 2023–24 and 2024–25 (`work/viz10.vg.json`, `work/data/vis10_industry_value_added.json`).

### 04 / Beyond the Factory
- **V11 — Domestic Economic Connections (Directed Chord Diagram)**: Domestic intermediate-use relationships involving manufacturing (`work/viz11.vg.json`, `work/data/vis11_domestic_edges.json`, `work/data/vis11_division_nodes.json`, `work/data/vis11_directed_layout.json`).
- **V12 — State Manufactured Exports (Geographic Flow Map)**: 81 displayed state-origin export flows (`work/viz12.vg.json`).
- **V13 — Consumer Attitudes on Buying Local (Isotype Pictogram)**: Stated consumer preferences, rendered by `js/viz13-controller.js`. `work/viz13.vg.json` is the reference spec.


---

## 📁 Repository Organisation

```text
├── index.html                   # Main dashboard entry page
├── README.md                    # Project documentation
│
├── css/                         # Modular, cleanly separated styles
│   ├── dashboard-main.css       # Typography, tokens, masthead, story prose
│   ├── dashboard-layout.css     # Grid systems, figure containers, responsive pairs
│   ├── dashboard-controls.css   # Dropdown selects, sliders, buttons, playback UI
│   └── dashboard-visualisations.css # Chart legends, tooltips, key takeaway cards
│
├── js/                          # Modular interaction scripts
│   ├── dashboard-app.js         # Vega/Vega-Lite specification loader & resize engine
│   ├── dashboard-interactions.js# Coordinated cross-filtering, map panning & tooltips
│   ├── viz2-controller.js       # Linked map and live business ranking logic
│   ├── viz9-controller.js       # Playback animation timeline controller
│   ├── viz13-controller.js      # Interactive isotype pictogram controller
│   └── paragraph-line-limit.js  # Paragraph line limit, including hyphenated word counts
│
└── work/                        # Official standardised visualisation specs & data
    ├── viz1.vg.json to viz13.vg.json # Official Vega specifications
    └── data/                    # Clean, validated GeoJSON, JSON & CSV datasets
```



---

## 🌐 Data Sources & Acknowledgements

- **Australian Bureau of Statistics (ABS)**: Business Counts (2025), Regional Population (2025), Australian Industry (2024–25), Input-Output Tables (2023–24), ASGS Digital Boundaries (2021).
- **Department of Climate Change, Energy, the Environment and Water (DCCEEW)**: National Pollutant Inventory (NPI) reporting facility database.
- **Department of Foreign Affairs and Trade (DFAT)**: Merchandise Trade Pivot Tables (2025).
- **Roy Morgan Research / Australian Made Campaign Ltd**: Consumer Research Study (March 2025).
---

## 🚀 Running Locally
```bash
# Start a local server (Python 3):
python3 -m http.server 8080
```
Open **`http://localhost:8080/index.html`** in your browser.