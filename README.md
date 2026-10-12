# Australian Made Products · Visualising Local Manufacturing

**FIT3179 · Data Visualisation 2**  
*A data-led exploration of where Australian manufacturing happens, what the sector produces, how it has transformed over time, and how consumer sentiment connects to local products.*

- **Author**: Wong Xin Thung
- **Unit**: FIT3179 (Data Visualisation 2), Monash University
- **Entry Point**: `index.html`

---

## 📊 Dashboard Structure & Visualisations

The dashboard is structured into four narrative chapters featuring 13 cohesive, interactive visualisations:

### 01 / Place and Concentration
- **Fig. 01 — Manufacturing Concentration (Choropleth Map)**: Business count per 10,000 residents across Australian SA2 areas (`work/viz1.vg.json`).
- **Fig. 02 — Absolute Business Clusters (Proportional Symbol Map & Ranking)**: National counts and regional cluster ranking (`work/viz2.vg.json`).
- **Fig. 03 — Reporting Manufacturing Facilities (Dot Map)**: 1,210 National Pollutant Inventory (NPI) manufacturing locations (`work/viz3.vg.json`).

### 02 / Sector Structure
- **Fig. 04 — Workforce Share vs. Industry Value Added (Connected Dot Plot)**: Compares employment share with economic value across 15 subdivisions (`work/viz4.vg.json`).
- **Fig. 05 — State Manufacturing Mix (Heatmap Matrix)**: Subdivisions' employment shares by Australian state/territory (`work/viz5.vg.json`).
- **Fig. 06 — Sales vs. Value-Added Growth (Paired Divergence Bar Chart)**: Year-on-year growth comparison (2023–24 to 2024–25) (`work/viz6.vg.json`).
- **Fig. 07 — Multi-Dimensional Economic Profiles (Parallel Coordinates)**: Normalised comparison of employment, wages, sales, and IVA (`work/viz7.vg.json`).

### 03 / Change Over Time
- **Fig. 08 — National Manufacturing Employment History (Overview + Detail Time Series)**: Track employment from 2006–07 through 2024–25 with interactive brush zoom (`work/viz8.vg.json`).
- **Fig. 09 — Employment Ranking & Size (Interactive Timeline Race)**: 18-year animated ranking progression across all manufacturing subdivisions (`work/viz9.vg.json`).

### 04 / Beyond the Factory
- **Fig. 10 — State Manufactured Exports (Geographic Flow Map)**: 81 state-origin export flows to global trading partners (`work/viz10.vg.json`).
- **Fig. 11 — Domestic Economic Connections (Directed Chord Diagram)**: Inter-industry intermediate supply relationships (`work/viz11.vg.json`).
- **Fig. 12 — Consumer Attitudes on Buying Local (Isotype Pictogram / Dot Plot)**: Stated Australian Made consumer purchasing preferences (`work/viz12.vg.json`).
- **Fig. 13 — Industry Value Added Trajectory (Slopegraph)**: Sectoral gains and contractions between 2023–24 and 2024–25 (`work/viz13.vg.json`).

---

## 📁 Repository Organisation

```text
├── index.html                   # Main dashboard entry page
├── README.md                    # Project documentation
├── DEPLOYMENT_FILES.txt         # Clean whitelist of deployment files
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
│   ├── viz12-controller.js      # Interactive isotype pictogram controller
│   └── paragraph-line-limit.js  # Text balance and line clamp utility
│
└── work/                        # Official standardised visualisation specs & data
    ├── viz1.vg.json to viz13.vg.json # Official Vega specifications
    └── data/                    # Clean, validated GeoJSON, JSON & CSV datasets
```

---

## 🚀 Running Locally

Because Vega loads external geographic boundaries and tabular data via `fetch()`, this dashboard must be served over a local web server (not `file://`):

```bash
# Start a local server (Python 3):
python3 -m http.server 3000
```
Open **`http://localhost:3000/index.html`** in your browser.

---

## 🌐 Data Sources & Acknowledgements

- **Australian Bureau of Statistics (ABS)**: Business Counts (2025), Regional Population (2025), Australian Industry (2024–25), Input-Output Tables (2023–24), ASGS Digital Boundaries (2021).
- **Department of Climate Change, Energy, the Environment and Water (DCCEEW)**: National Pollutant Inventory (NPI) reporting facility database.
- **Department of Foreign Affairs and Trade (DFAT)**: Merchandise Trade Pivot Tables (2025).
- **Roy Morgan Research / Australian Made Campaign Ltd**: Consumer Research Study (March 2025).
