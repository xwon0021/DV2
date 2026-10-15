FIT3179 DV2 Visualisation Plan — Source of Truth
Plan governance / agent instructions
This file is the current source of truth for the FIT3179 DV2 project.
Rules:
1. Every future change to the visualisation plan must be updated in this file before implementation.
2. Any coding agent working on this project must read this file at the start of the task.
3. If the current code, an older prompt, or another planning file conflicts with this file, the agent must stop and report the conflict and treat this file as the latest plan unless explicitly told otherwise.
4. Do not recover requirements from older PLAN.md versions if they conflict with this file.
5. Do not add, remove, reorder, or redesign visualisations without updating this file first.
6. Implemented visualisations may still be improved later if there is a clear data, readability, storytelling, interaction, or rubric reason. Any such change must first be reflected here.
7. Lecture/reference images are inspiration only, not authoritative answers. Judge every design choice against the actual data, analytical task, Munzner What/Why/How, marks/channels, storytelling, and the FIT3179 rubric.
8. Do not force an idiom merely to increase the advanced-idiom count.
9. Do not invent, fill, or silently convert missing/suppressed values to zero.
10. After any implementation batch, update this file if the final implemented design differs from the planned design.
Project
Topic: Australian Made Products
Working title: Where Australia Makes, Sells and Chooses Local
Audience: General Australian or Malaysian audience
Format: One responsive, vertically scrolling webpage
Target visualisations: 13
Current implementation status: V1–V13 implemented and reviewed; approved V3/V10/V11 replacements completed. Prior polish QA is historical.
Author: Wong Xin Thung
Plan last updated: 12 October 2026
Scope
The project uses manufacturing businesses, industry measures, exports and stated consumer attitudes as evidence about Australian-made products.
These datasets do not identify every product made in Australia and do not prove that a product satisfies Australian Made certification rules.
Keep that distinction clear in the introduction and conclusion.
The project targets 13 visualisations.
CURRENT IMPLEMENTATION / approved implementation batch, 9 October 2026
Implement only V3 actual-location dot map, V10 geographic state-origin export flow map and V11 directed domestic intermediate-use chord. Keep V6 and all other chart specs/data unchanged. No V14. Completed conservative count: 9 advanced idioms and 4 map idioms; V6/V13 borderline idioms are excluded.
Historical idiom classifications and audit decisions are preserved below under HISTORICAL AUDIT; they do not override the current descriptions.
Core files and sources
File	Use
abs_manufacturing_businesses_sa2_2023_2025.xlsx	Manufacturing business counts by SA2
work/manufacturing_sa2_2025.csv	Clean 2025 SA2 manufacturing business counts
abs_manufacturing_industry_2024_25.xlsx	Manufacturing employment, wages, sales/service income, IVA by subdivision and state
abs_manufacturing_timeseries_2006_2025.xlsx	National and subdivision manufacturing time series
country-triec-pivot-table-calendar-years.xlsx	DFAT calendar-year trade data
roy-morgan-research-2025.pdf	Consumer attitudes toward Australian-made products
Population estimates by SA2 and above, 2001 to 2025.xlsx	2025 population denominator
work/SA2_2021_AUST_GDA2020.json or equivalent optimised boundary file	SA2 geography
Data Visualisation 2 Specifications.pdf	Assignment requirements


Ignore temporary Excel lock files beginning with ~$.
Current implementation status
V1 — Manufacturing business concentration by SA2
Idiom: Choropleth map
Status: READY
Advanced: Yes
Measure:
manufacturing businesses / ERP × 10,000
Validated:
- 2,463 manufacturing SA2 records
- 2,454 population records
- 2,473 boundary features
- 2,454 matched manufacturing/population records
- 34 zero-population areas
- two missing manufacturing totals
- 9 “Currently Unknown / No usual address” records without population plus name conflicts
- final valid rate records: 2,418
Interpretation:
- business concentration relative to residents
- not factory density
- not workforce participation
- not productivity
Interaction:
- hover outline/emphasis
- tooltip with SA2, business count, population and rate
- preserve global spatial context
Risk:
small resident denominators can create very high rates.
V2 — Absolute manufacturing businesses by SA2
Idiom: Proportional-symbol map
Status: READY
Advanced: Yes
Validated:
- 2,452 valid count records
- 122 zero-count
- 2,330 positive symbols
Design:
- one point-on-surface / derived location per SA2
- symbol area proportional to manufacturing business count
- constant primary purple (#A855D6) style; no count colour scale
- do not use a second count colour scale
Interpretation:
points are area-level locations, not exact factory locations.
V3 — Reporting manufacturing facilities across Australia
Idiom: Actual-location dot map
Status: READY WITH MINOR LIMITATION
Advanced: Yes; implementation and responsive/tooltip QA completed
Question: Where are reporting manufacturing facilities located across Australia?
Data: validated NPI primary manufacturing reporting facilities, 2024/2025;1,210unique IDs/all8jurisdictions;10coincident-coordinate excess records retained.
Encoding: fixed-size circle; actual longitude/latitude; constant deep purple (#7B3FB1); amber selection. No size measure, coordinate jitter or output/employment inference.
Tooltip: facility name, state/territory, primary industry, reporting period, NPI coverage/source context.
Visible caveat: NPI reporting facilities do not represent all manufacturing businesses or all Australian Made certified facilities.
Live data promotion must be reproducible from preserved validated candidate data; no raw edits.
V4 — Manufacturing IVA by subdivision
Idiom: Treemap
Status: READY
Advanced: Yes
Validated:
- 15 manufacturing subdivisions
- subdivision IVA total: $141,974m
- $1m difference from published total attributable to rounding
Encoding:
- area = IVA
- muted qualitative subdivision colour; area alone represents IVA
- labels only when they fit
- smaller tiles via tooltip
Interpretation:
IVA is not profit, sales or number of products.
V5 — State × subdivision manufacturing employment share
Idiom: Matrix heatmap
Status: READY
Advanced: Yes
Validated:
- 120 state/subdivision cells
- 9 missing/suppressed
- WA/TAS/NT/ACT shares below 100% because of missing cells
- VIC slight difference due to rounding
Encoding:
- row = state
- column = manufacturing subdivision
- colour = within-state employment share
Interpretation:
dark cell = larger share of that state's manufacturing workforce, not more workers nationally.
Missing/suppressed values remain distinct from zero.
V6 — Recent sales growth vs IVA growth
Idiom: Dumbbell comparison
Status: READY
Advanced: Do not rely on as advanced
Question:
Did recent sales/service-income growth move in line with IVA growth?
Data:
- 15 manufacturing subdivisions
- 13 complete sales-growth comparisons
- 2 rows with missing sales values show IVA only
Formula:
(2024–25 − 2023–24) / 2023–24 × 100
Rules:
- missing values remain missing
- invalid/zero baselines are not converted to zero
- both measures are nominal unless a documented deflator is used
V7 — Manufacturing economic profile
Idiom: Parallel coordinates
Status: READY
Advanced: Yes
Question:
How do manufacturing subdivisions differ across employment, wages, sales and IVA?
Data:
- 13 complete subdivision profiles
Measures:
- employment
- wages
- sales/service income
- IVA
Preparation:
each dimension is independently min–max normalised to 0–1.
Tooltips retain original values and units.
Interaction:
hover selected subdivision and de-emphasise others while retaining context.
Interpretation:
this is a multi-measure economic profile, not productivity.
V8 — National manufacturing employment
Idiom: Time-series line chart
Status: READY WITH MINOR LIMITATION
Advanced: No
Data:
- 19 annual observations
- 2006–07 to 2024–25
- employment at June end
- units: thousands
Validation:
- supplied national series agrees with the 2024–25 industry table after rounding
- no gap or methodology break was identified in the supplied workbook
- the workbook provides no definitive comparability statement
Required caveat:
Employment is measured at June end. No break was identified in the supplied series, although the workbook does not provide a definitive comparability statement.
V9 — Manufacturing subdivision employment rank
Idiom: Bump chart
Status: READY
Advanced: Yes
Question:
How have the relative employment ranks of major manufacturing subdivisions changed?
Data:
- 190 records
- 10 subdivisions with the highest 2024–25 employment
- ranked against all 15 subdivisions in every year
- 19 financial years
- ties share a rank
- no years filled
Interpretation:
rank is relative position, not absolute employment size.
Tooltip:
- subdivision
- year
- rank
- actual employment
The selection rule must remain disclosed.
Storytelling flow
Section 1 — Where manufacturing happens
V1–V3
1. Relative concentration by SA2
2. Absolute business scale by SA2
3. Real locations of NPI reporting manufacturing facilities
Section 2 — What Australia makes
V4–V7
4. IVA composition by subdivision
5. State workforce composition
6. Recent sales-growth vs IVA-growth comparison
7. Multi-measure economic profiles
Section 3 — How manufacturing has changed
V8–V9
8. National manufacturing employment trend
9. Subdivision employment rank changes
Section 4 — Beyond the factory
V10–V13
Current approved sequence (retain chart identifiers):
V11. Domestic economic connections with manufacturing
V13. Recent IVA change across subdivisions
V10. State-origin manufactured export destinations
V12. Australian-made consumer attitudes
Narrative: domestic economic connections → recent IVA change → international export connections → consumer attitudes.
Any reordering must be updated in this file before implementation.
V10 — State-origin manufactured merchandise exports
Idiom: Geographic origin–destination flow map
Status: READY WITH MINOR LIMITATION
Question: Where do Australian states export manufactured merchandise?
Data: validated2025 DFAT Export/TRIEC23STM+24ETM;82selectedflows/8states/25destinations;$45.269466115bn represented of$53.120650088bn (85.2201%);$7.851183973bn omitted. Unmatched endpoints remain in denominator.
Encoding: geographic positions/calculated representative area anchors; connection curves and stroke width proportional to monetary value with no minimum-width inflation; constant navy/slate; amber selected state/flow.
Interaction: state dropdown/hover/click and flow emphasis; moderate fading retains geography/context. Touch controls and exact-value alternative are necessary for tiny ACT/NT flows.
Tooltip: origin, destination, combined full STM+ETM classification, value/unit,2025,recorded state-origin Export basis.
Caveat: anchors are not ports, curves not shipping routes; not national Australian-produced series. State origin refers to production/manufacturing reporting origin, not loading port.
V11 — Manufacturing domestic economic connections
Idiom: Directed chord diagram
Status: READY WITH MINOR LIMITATION
Question: How is manufacturing economically connected to the rest of Australia’s economy?
Data: ABS2023–24 Input-Output Table5;official IOIG→ANZSIC division join;19nodes/37directedrelationships;$444.3612941bn/100%of scoped domestic intermediate use;noisolates.
Encoding: circular nominal division identity; directional ribbon width proportional to supply→use monetary value. Neutral slate, amber selection. Reciprocal supplier/user records and manufacturing self-use stay separate.
Direction: outward arrow tip at using division; tooltip explicitly Supplier→User. Node arc spans allocate ribbon endpoints, not standalone industry-output totals.
Interaction: hover/click division/ribbon, moderate context fade; accessible industry control for touch. Readable minimum-width chord may internally scroll on narrow screens instead of shrinking19labels.
Tooltip: supplying division, using division, flow/unit/year,domestic intermediate-use wording.
Scope: domestic industry accounting, not company supply chains/physical movement; manufacturing self-use included;nonmanufacturing↔nonmanufacturing and final demand outsidequestion.
V12 — Australian-made consumer attitudes
Idiom: Horizontal dot plot
Classification: Basic
Status: Implemented
Question
What do Australian consumers report about their interest in Australian-made products?
Source
roy-morgan-research-2025.pdf
Findings to verify exactly
Approximately:
- 73% want to buy more Australian-made products
- 67% intend to buy more
- 63% looked for Australian-made products in the prior year
- 84% are more likely to buy when they know a product is Australian Made
The exact wording and time qualifiers must be checked against the source.
Encoding
- y = statement
- x = percentage
- 0–100% scale
Design
- one row per statement
- concise labels
- full wording in tooltip or adjacent note
- direct percentage labels allowed
- consistent mark style
- optional focal emphasis on the 84% result only if it strengthens the story
Tooltip
Must include:
- full statement
- percentage
- survey date/period
- source
- important qualifier if needed
Critical interpretation rule
These four values are:
- separate survey statements
- not a funnel
- not cumulative
- not additive
- not mutually exclusive groups
- not stages of conversion
Do not imply intention equals observed purchase behaviour.
V13 — Manufacturing IVA change
Idiom: Slopegraph
Classification: Borderline advanced; do not inflate
Status: Implemented
Question
How did manufacturing subdivision IVA change from 2023–24 to 2024–25?
Source
abs_manufacturing_industry_2024_25.xlsx
Use one non-overlapping manufacturing subdivision level only.
Measures
For each valid subdivision:
- 2023–24 IVA
- 2024–25 IVA
Derived:
absolute_change = IVA_2024_25 - IVA_2023_24
percentage_change = (IVA_2024_25 - IVA_2023_24) / IVA_2023_24 × 100
Only calculate percentage change for valid non-zero baselines.
Encoding
- left = 2023–24
- right = 2024–25
- one line per subdivision
Design
- direct labels strongly preferred
- retain all subdivisions if readable
- neutral context for most lines
- highlight only a small number of meaningful movers
- avoid rainbow categories
If labels become unreadable:
- do not silently remove categories
- use a documented prioritisation/highlight strategy while retaining context where possible
Tooltip
Must include:
- subdivision
- 2023–24 IVA
- 2024–25 IVA
- absolute change
- percentage change where valid
- units
Annotation
At most:
- largest increase
- largest decline
Only if verified from the data.
Interpretation
- IVA is not profit
- IVA is not sales
- nominal values may contain price effects
- do not call this productivity
Classification note
Implement because it answers the before/after question well.
Do not automatically count it as advanced for rubric purposes. Final classification must be conservative.
Colour system
- Rates and shares: ordered light-to-dark blue
- Single quantitative series / context: restrained constant stylistic colour, normally navy/slate; current experiment V2 primary purple, V3/V8 deep purple, V12 plum
- Treemap: muted qualitative subdivision identity
- Context / non-focal lines: medium slate / grey
- Annotation / focal highlight: warm amber
- Missing: neutral grey / distinct missing style
Rules:
- no red-green pairing
- do not rely on colour alone
- do not add a new bright categorical palette merely because a lecture example used one
Typography system
- Main page title: serif/display face, approximately 34–40px
- Section heading: sans-serif, approximately 24–28px
- Chart title: sans-serif, approximately 18–22px
- Body: approximately 16–18px
- Chart labels: ideally at least 13–14px where space permits
- Notes/source: at least 12px
Writing:
- short, direct sentences
- define ANZSIC, ERP, STM and ETM once
- keep chart labels concise
Layout system
- one vertically scrolling page
- consistent main content width
- common alignment for titles, charts, legends and source notes
- single-column on narrow screens
- no page-level horizontal scrolling
- use whitespace for hierarchy
- quiet background
- restrained borders
- keep legends near charts
- sources directly below charts
Internal chart scrolling is acceptable only when genuinely necessary, such as V5’s long subdivision axis.
Annotation rules
Maximum:
- 1–2 meaningful callouts per chart
A good annotation should state, where practical:
- group
- value
- unit
- period
Annotate only verified peaks, troughs, meaningful exceptions and contrasts.
Do not:
- label every mark
- cherry-pick before cleaning
- cover important data
- invent causal explanations
Interaction / hover rules
Use interaction only if it improves the analytical task.
Good patterns:
- hover outline
- stronger stroke/opacity
- exact-value tooltip
- selected line/flow emphasis
- moderate fading of unrelated context
Avoid:
- hiding all context
- changing colour in a way that suggests a new encoding
- linked filtering without analytical purpose
- dashboard-like interaction merely for novelty
Current guidance:
- V1: hover outline + tooltip
- V2: symbol emphasis + tooltip
- V3: facility point emphasis + tooltip
- V4: tile highlight + tooltip
- V5: cell border + tooltip
- V6: mark emphasis + tooltip
- V7: selected line emphasis + fade others
- V8: line/point tooltip
- V9: selected subdivision emphasis
- V10: state/flow emphasis + tooltip
- V11: directed ribbon/division emphasis + tooltip
- V12: simple point emphasis + tooltip
- V13: selected subdivision line + endpoints, with moderate context fade
Metadata
Every visualisation must include a visible source note.
Metadata should record:
- organisation
- exact dataset title
- year/period
- stable source URL
- student author
- visualisation date
Core sources:
- M1 — ABS Counts of Australian Businesses, July 2021–June 2025
- M2 — ABS Australian Industry, 2024–25
- M3 — ABS Australian Industry time-series spreadsheets
- M4 — DFAT Country and TRIEC pivot table, calendar years
- M5 — Roy Morgan / Australian Made Campaign, March 2025 research
- M6 — ABS ASGS Edition 3 SA2 digital boundaries
- M7 — ABS Regional Population, 2024–25
Data preparation and validation gates
1. Exclude blank rows and temporary records.
2. Preserve stable geography/industry identifiers.
3. Do not turn unmatched, missing or suppressed values into zero.
4. Use one ANZSIC hierarchy level at a time.
5. Check units before calculation.
6. Check percentage-change denominators.
7. Keep calendar years separate from financial years.
8. Preserve original values in tooltips where normalisation is used.
9. Document selection/filtering rules.
10. Validate final transformed data before chart implementation.
Additional gates:
- V1: check low-population denominators
- V5: missing/suppressed cells remain missing
- V7: min–max normalisation per measure
- V8: do not claim definitive long-run comparability unless stated
- V9: rank all subdivisions first, then display the disclosed selected set
- V10: verify trade basis, STM/ETM labels, units and years
- V11: validate semantic suitability before implementation
- V12: preserve exact survey wording and qualifiers
- V13: check valid/non-zero baseline before percentage change
Domain / Who / What / Why / How
Domain
Australian-made products, approached through manufacturing businesses, industry structure and performance, exports, and consumer attitudes.
Who
General Australian or Malaysian readers with no assumed knowledge of ABS geography, ANZSIC categories or TRIEC classifications.
What
The page combines:
- 2025 SA2 manufacturing business counts
- 2025 population denominators
- 2024–25 manufacturing economic measures
- 2006–07 to 2024–25 manufacturing employment time series
- DFAT2025 recorded state-origin manufactured exports
- March 2025 Roy Morgan consumer survey findings
Why
Readers need to distinguish:
- relative concentration from absolute scale
- industry size from industry composition
- national change from changing ranks
- manufacturing structure from export performance
- stated consumer attitudes from observed purchasing
How
The page begins with:
- choropleth for population-normalised SA2 concentration
- proportional symbols for absolute SA2 business counts
- actual-location dot map for reporting manufacturing facilities
It then moves into:
- treemap for IVA composition
- heatmap for within-state employment share
- dumbbell for recent growth comparison
- parallel coordinates for multi-measure subdivision profiles
Long-run change uses:
- national employment line chart
- subdivision bump chart
The final section extends the story in this order:
- V11: directed domestic manufacturing supply/use connections
- V13: recent IVA before/after comparison
- V10: geographic state-origin export destinations
- V12: separate consumer attitude/intention findings
Across the page:
- position carries most quantitative comparisons
- sequential blue is reserved for rates/shares
- navy/slate provides quantitative context
- amber highlights only selected findings
- tooltips provide exact values
- annotations remain selective
- missing data remain distinct from zero
QA requirements
Visual QA
After each implementation batch:
- serve http://localhost:8000
- inspect newly changed charts
- perform a quick regression scan of all existing charts
Check:
- chart renders
- clipping
- title overlap
- annotation overlap
- label readability
- correct axes
- visible units
- legend/direct-label clarity
- source visibility
- visual hierarchy
- page-level horizontal overflow
Tooltip QA
V3:
- at least three actual facilities from different jurisdictions
V10:
- at least two origins and three destination flows, large and small, including ACT/NT
V11:
- three directed relationships including reciprocal pair, manufacturing self-use, incoming and outgoing
V12:
- at least two survey statements
V13:
- at least one increase
- at least one decline
Across all:
- no undefined
- no NaN
- no null shown as valid data
- consistent number formatting
- units explicit
Responsive QA
Where tooling permits:
- desktop/laptop around 1280px
- narrow/mobile around 390px
If exact viewport controls are unavailable:
- test the narrowest available width
- report the limitation honestly
Console QA
If console access is available:
- Vega errors
- Vega warnings
- failed data loads
- JavaScript exceptions
If console access is unavailable:
state that limitation.
Final rubric checklist
- [ ] Final page contains more than 10 charts; target = 13.
- [ ] At least 3 distinct map idioms are present.
- [ ] Choropleth values are normalised.
- [ ] Proportional symbols use area correctly.
- [ ] Marks/channels match the analytical task.
- [ ] Missing/suppressed data are not silently treated as zero.
- [ ] Colour roles are consistent.
- [ ] Typography is readable.
- [ ] One clear vertical reading order is maintained.
- [ ] No page-level horizontal scroll.
- [ ] Sources and metadata are visible.
- [ ] Annotations are evidence-based.
- [ ] Story flows from place → structure → change → wider context.
- [ ] Domain / Who / What / Why / How are aligned with the final implementation.
- [ ] Advanced-idiom count is reported conservatively.
- [ ] Borderline idioms are not inflated merely to meet a quota.
- [ ] V11 is used only if semantically valid and non-redundant.
- [ ] V13 is not automatically counted as advanced.
Implementation notes
V1–V9 stability
V1–V9 are currently stable, but not permanently locked.
They may be modified later if:
- a confirmed regression exists
- a reference/rubric insight clearly improves readability or storytelling
- an interaction or annotation improvement is strongly justified
- full-page consistency requires a small change
Any such change must:
1. first be written into this plan;
2. be implemented;
3. receive regression QA.
Advanced idiom target
Current conservative advanced idioms: 9 — V1 choropleth, V2 proportional-symbol map, V3 actual-location dot map, V4 treemap, V5 matrix heatmap, V7 parallel coordinates, V9 bump chart, V10 geographic flow map, V11 directed chord. All implemented and QA reviewed. Map idioms: 4 (V1/V2/V3/V10). V6 dumbbell and V13 slopegraph remain borderline and are excluded. Classification remains subject to tutor judgement; no V14.
Required agent startup instruction
Every coding-agent task for this project should begin with:
Read the latest FIT3179 DV2 visualisation plan Markdown in the project before making changes. Treat it as the source of truth. Compare it against the current implementation and report any conflict. Do not recover requirements from older plans or prompts if they disagree with the latest plan. If the task requires a plan change, update the plan first, then implement.
## HISTORICAL AUDIT — final polish batch, before approved replacements, 9 October 2026
- Keep 13 charts; no V14, no source/derived-data changes without a confirmed error.
- Reorder only Section 4 to V11 → V13 → V10 → V12 and rewrite its transitions to match.
- V7: keep parallel coordinates and original normalisation; use readable short/wrapped dimension labels, full measure names in tooltip, sufficient plot width and internal scrolling only if necessary. Preserve original-value tooltips.
- V6: diagnose merged colour/shape legend warning and use one consistent combined legend showing circle/diamond categories; preserve both channel mappings.
- Shared polish: bring source/method note typography to 12px, reduce needless V7 padding, preserve all source caveats and align V8's comparability note with this plan.
- Inspect V1–V13 at 1280px and 390px. Further small visual adjustments must be recorded here before implementation.
- Review chart questions, annotations, transitions and hover/context behaviour; no novelty interaction.

Additional review findings — recorded before fixes
- V3's displayed tile grid is vertically reversed: TAS appears above QLD/NT because Tile_Y = 4 − Grid_Row is sorted ascending. Correct the y display order only; keep measures and data unchanged. Replace thick outlined text with contrast-aware solid labels and give label marks the same tooltip as their tile.
- V9 direct labels at 9px are too small. Increase to 13px, use 12px year labels, and retain a readable minimum-width chart with internal scrolling on mobile. Keep ranks/selection/data unchanged.
- Expand the opening scope sentence and closing transition to distinguish manufacturing evidence from certified products.

- Mobile review: V6’s combined horizontal legend clips its second label at 390px. Stack the two legend entries vertically on narrow screens and reduce x-axis tick density; preserve shape/colour mappings, domain and observations.

- V13 hover review: at 25% opacity the unselected endpoint labels become too faint. Retain 45% context opacity across its marks/labels while strengthening the selected subdivision; no values or positions change.

- Live viewport-switch regression: fixed-width V4/V7 retain desktop canvas dimensions until reload, causing page overflow. Re-render existing chart specs after a debounced width change and finalize old Vega views; use existing mobile layout rules and unchanged data. Test both fresh mobile loading and live desktop-to-mobile resizing.

Final polish verification — 9 October 2026
- All 13 charts visually reviewed on localhost at 1280px and 390px, including 390×844px interaction checks; V1–V9 order retained.
- V3 geographic display order corrected; V6 merged-legend warning removed; V7 labels readable; V9 labels enlarged with mobile internal scrolling; V13 hover context retained at 45% opacity.
- Fresh mobile loading and live 1280→390→1280 resizing preserve 13 charts with document width equal to viewport width.
- Representative tooltips checked for V3/V6/V7/V9 and all V10–V13; clean browser console and zero Vega-Lite compilation warnings.
- Source files and derived datasets unchanged by SHA-256 comparison (41 baseline files include specs/data/sources).
- Internal scrolling remains necessary for V5, V9, V11 and V13 on mobile; small map regions, small treemap tiles and very thin flows remain inherent limitations.
- Conservative advanced count: 8 (V1–V5, V7, V9, V11). V6 and V13 remain borderline; no automatic claim of 9.
- Ready for final rubric review, subject to tutor judgement on idiom classification; no Moodle answers or V14. Detailed evidence: work/qa/FINAL_POLISH_REPORT.md.


## HISTORICAL AUDIT — first controlled redesign audit, 9 October 2026

This audit supersedes only the previous polish batch's prohibition on introducing new candidate data: new official source downloads and read-only audit transformations are authorized by the controlled-redesign request. Existing source files and live chart datasets/specs remain unchanged. Keep 13 charts, no V14. The active implementation and Section 4 order remain as described above until an implementation gate is passed.

Phase 1–3 status: candidate data inspected and quantified; approval report prepared. Stop before Phase 4 because V10's geographic endpoint/selection design and V11's directed chord readability remain unresolved. No visualisation code has been modified in this batch.

## Map idiom, attribute and colour safety matrix

| Idiom | Geometry | Attribute type | Value type | Main mark/channel | Colour type | Current/proposed chart | Main misuse risk |
|---|---|---|---|---|---|---|---|
| Choropleth | Geographic polygons | Quantitative rate; nominal geography | Normalised businesses per residents | Polygon fill lightness | Sequential blue; grey missing | V1 keep | Encoding raw counts confounds area/population; missing is not zero |
| Proportional symbol | Real points or disclosed area representative points | Quantitative count; nominal geography | Absolute total | Symbol area proportional to total | Constant navy | V2 keep | Radius rather than area scaling; implying SA2 points are factories |
| Dot map | Real entity points OR declared statistical dots within regions | Nominal facility/class; spatial coordinates | Discrete entity count, one dot per facility | Fixed-size dot position | Constant navy; category hue only if needed | V3 proposed, data/idiom approved but not implemented | Historical/inactive facilities mixed with current year; fake facility coordinates; reporting sample mistaken for all manufacturers |
| Bin map | Regular equal-area tessellation over real points | Quantitative bin count; nominal bin ID | Absolute count per equal-area bin | Polygon fill ordered lightness | Sequential blue; no-data separate | V6 audited, keep dumbbell in this batch | Binning aggregated centroids; pretending reporting counts describe all manufacturers; grid-dependent clusters |
| Flow map | Geographic origin and destination areas represented by disclosed anchor points | Nominal state/country/TRIEC; quantitative flow; temporal year | Monetary OD quantity | Geographic line position and width | Constant navy/slate; amber selection; categorical hue only if necessary | V10 candidate, needs supplementary geography/selection validation | Treating routing curves as shipping routes; equating recorded state exports to national Australian-produced series; invisible thin flows; confidentiality |
| Tile-grid | Schematic state tiles | Nominal state; quantitative rate | Employment per residents | Schematic position; fill lightness | Sequential blue | V3 current until approved replacement implemented | Schematic positions interpreted as exact geography; nominal state encoded as ordered colour |

## Week 6 network/tree idiom safety matrix

| Idiom | Required data structure | Attribute types | Main channels | Colour rule | Candidate project data | Main misuse risk |
|---|---|---|---|---|---|---|
| Node-link | Real nodes + relationships, optional weights | Nominal nodes/categories; quantitative edge weight | Node position, connection, edge width | Muted qualitative categories or constant marks; amber selection | ABS industry input-output network | Dense hairball; layout distance mistaken for an economic measure |
| Chord | Weighted pairwise matrix/edges; direction explicitly retained where present | Nominal supplying/using industries; quantitative monetary flow; temporal year | Circular arc identity; ribbon width; explicit direction cues | Constant/muted marks or qualitative node hues, never ordered lightness for identity | ABS Table 5, 2023–24; 51 manufacturing IOIGs aggregated to 15 subdivisions | Standard undirected chords erase direction; reciprocal links double counted; self-links misread; dense ribbons; filtered absence mistaken for no relationship |
| Sankey/alluvial | Weighted connections between defined node sets/stages | Nominal state/subdivision; quantitative employment | Separate node columns and proportional ribbons | Constant navy/slate; amber selection | Current V11 ABS employment composition | Claiming physical worker movement; missing converted to zero; hierarchy totals double counted |
| Adjacency matrix | Pairwise node matrix | Nominal row/column identities; quantitative edge values | Position and ordered cell lightness | Sequential for nonnegative weight; diverging only for meaningful midpoint | ABS industry input-output | Overlap with V5 visual form; mirrored/directed interpretation confused; blanks shown as zero |
| Dendrogram | True parent-child hierarchy, or clearly documented clustering with justified distance | Nominal industry identity; hierarchical relation; quantitative distance only if defined | Branch connection and hierarchy position | Constant or qualitative category hues | ANZSIC hierarchy | Taxonomy mistaken for economic dependence; inventing clustering or meaningful branch lengths |

## Candidate decisions and gates

| Chart | Decision | Evidence and rationale |
|---|---|---|
| V3 | APPROVED FOR IMPLEMENTATION, deferred by batch stop | NPI GeoJSON has real facility points and four-digit primary ANZSIC. Select 1100–2599 and latest_report_year 2024/2025: 1,210 unique facilities, all eight jurisdictions, no invalid selected coordinates. Fixed-size constant-navy dots, one per reporting facility. Ten coincident-coordinate excess records retained, not jittered into invented locations. Tooltip: facility, primary industry, jurisdiction, period and coverage caveat. This replaces a schematic map with lecture-backed real point geometry and gives a facility-level lookup task. |
| V6 | KEEP CURRENT CHART | Same NPI input is technically bin-safe: 50km EPSG:3577 squares produce 212 occupied bins (counts 1–94), all 1,210 retained. However, replacing V6 would repeat V3's reporting-facility geography within the industry section and remove the only direct sales-versus-IVA growth comparison. Technical validity alone does not outweigh distinct storytelling value. No bin chart is approved in this batch. |
| V10 | NEEDS DIFFERENT DATA (supplementary geography), not approved yet | DFAT state × economy × TRIEC cache supports genuine geographic OD values in A$000, 2016–2025, Export basis. For 2025 STM+ETM, eight named states supply 1,115 positive country pairs and $53.120650088bn. Foreign (Re-exports) and Confidential origins cannot be drawn as Australian states. Top-three named destinations per state yields 24 flows/$22.380705783bn (42.131837%); $30.739944305bn omitted. Geography/concordance and a readable selection with sufficient coverage remain unverified. Keep the export line until these gates pass. Do not label the state series as the workbook's national Australian-produced export series. |
| V11 | KEEP CURRENT CHART; chord not approved | Data semantically support a directed industry-use network, but a legible directed chord selection is unresolved. Manufacturing-only: 51 IOIGs/2,601 numeric cells, or 15 subdivision nodes/225 positive edges/$56.6680225bn. Top40 retains 82.8154% but isolates Printing. Manufacturing plus five objectively largest outside IOIG partners: 20 nodes/375 positive links/$217.2599675bn, while $227.1013266bn of other external relationships is excluded; top40 further isolates three manufacturing subdivisions. A standard undirected chord is unsuitable for directed supplying→using quantities. Current alluvial remains truthful, stable and advanced. |

Official audit sources were downloaded intact into work/audit/redesign_2026_10_09/sources/. Processing is reproducible with audit_sources.py (openpyxl and pyproj); validation.json records source hashes, filters, zeros/missing values and before/after totals. No source workbook is modified.

NPI reporting thresholds vary by substance and activity; the inventory is not a census of Australian manufacturers. Primary manufacturing classification excludes manufacturing as a secondary activity. The all-year facility file includes historical reporters, so the period filter is mandatory. Do not show emissions or infer output/employment from facility counts.

ABS Table 5 uses domestic outputs as intermediate inputs at basic prices, with imports separately allocated. Rows supply; columns use. This is industry accounting, not company supply chains or physical movement. Values below $1m may be modelling artefacts without standalone economic meaning; published additivity/rounding caveats remain. No missing cells were observed in the audited manufacturing-related block. Option B's external IOIGs are selected objectively by combined incoming/outgoing manufacturing-related value, not handpicked: non-ferrous metal ore mining, construction services, sheep/grains/beef/dairy cattle, residential building construction, professional/scientific/technical services.

DFAT state data are recorded merchandise exports, not inflation-adjusted output or shipping routes. State of origin means final production/manufacturing stage, not port of loading. Confidential commodities/areas can under-report state and partner values. General explanatory-note wording mentions trade types unavailable in this workbook; actual cache fields govern extraction (Export/Import only). Country/regional 'nfd' values must not receive fabricated geographic endpoints; selected eight-state manufacturing 'Southern and East Africa nfd' is $1.026m and remains unresolved geography.

Current counts remain unchanged: 13 visualisations, 3 map idioms, project conservative advanced count 8 (including tile-grid subject to tutor acceptance). Implementing V3 alone would strengthen lecture alignment without increasing the count. A future safe V10 flow map could add one advanced idiom and one map idiom (9 advanced / 4 maps under the current project convention); V6 and V11 are retained, and V13 remains borderline. No proposed idiom is counted before implementation and QA.

No new desktop/mobile/tooltip/console acceptance is claimed in this audit-only batch. Previous final-polish QA is historical evidence. Live implementation stability is verified by hashes; a future implementation batch must repeat responsive/tooltips/console QA for replacements and scan all13. Details and all ten suitability criteria are in work/audit/redesign_2026_10_09/APPROVAL_REPORT.md.


## Dataset-building extension — latest instruction, 9 October 2026

Resume candidate construction rather than reject an idiom because a first file is incomplete. Supplementary authoritative geography, identifier standardisation, joins and documented calculations are authorized. Preserve raw sources and reproducible build/validation outputs. No invented coordinates, records, flows or missing-value fills. Previous V10/V11 deferral is reopened for the specified reduction tests; prior audit is a historical snapshot, not a permanent veto. Keep V6's analytical-value comparison in the review even though its bin input is technically valid. Before chart implementation, record validated candidate decisions and any active-plan changes.

Build facility-level NPI data and equal-area 50km bins; join state/country reference geometry to DFAT exports; compare cumulative80/85/90%, value thresholds and national-top-N with per-state representation; compare chord official aggregation, minimum-flow and cumulative filters with all-node coverage and clearly directed relationships. Report represented/omitted values and unmatched geometry.


## Revised build decisions — authoritative candidate checkpoint, 9 October 2026

HISTORICAL pre-code approval snapshot: this section superseded the earlier candidate decision/gate table **for candidate approval only**. The active page still has the existing 13 visualisations, with Section 4 V11 → V13 → V10 → V12; no replacement chart code has been written. Preserve the active plan until implementation and QA confirm each replacement. The supplementary-data build removes the earlier V10 geometry and V11 reduction barriers; never interpret historical audit deferrals as permanent rejection.

| Chart | Revised decision | Validated candidate / active-plan change proposed |
|---|---|---|
| V3 | APPROVED FOR IMPLEMENTATION | Actual-location dot map: 1,210 unique primary manufacturing NPI reporting facilities, 2024/2025, all eight jurisdictions. Fixed-size navy dots, amber selection. Reporting-facility location/lookup question replaces the tile-grid employment-rate comparison. Threshold coverage and ten excess coincident-coordinate records disclosed. |
| V6 | KEEP CURRENT CHART | Constructed and validated 212 occupied 50km square EPSG:3577 bins, counts1–94, all1,210 facilities retained. Data are sufficient. Keep the dumbbell because the sales-versus-IVA growth comparison contributes more distinct analytical value than repeating V3 facility geography. Rejection is on storytelling value, not dataset insufficiency. |
| V10 | APPROVED FOR IMPLEMENTATION | DFAT2025 Export STM+ETM, eight recorded state-of-origin categories; real geographic state/country anchors joined from ABS/Natural Earth geometry. Cumulative85% plus largest link for unrepresented states:82 flows/25destinations/all8states, $45.269466115bn (85.2201%) of $53.120650088bn. Omitted$7.851183973bn, including unresolved endpoint values in denominator. State selection with moderate context fading is required for traceability; proportional widths must not inflate small-state values. Proposed question: “Where do Australian states export manufactured merchandise?” Do not call this the national Australian-produced export series or claim routing curves are shipping routes. |
| V11 | APPROVED FOR IMPLEMENTATION | Directed chord using ABS2023–24 Table5 and official IOIG→ANZSIC division concordance. Manufacturing and all division partners:19nodes/37directedrelationships/$444.3612941bn/100% of manufacturing-related domestic intermediate use, zero isolated nodes. Proposed question: “How is manufacturing economically connected to the rest of Australia’s economy?” Aggregate to one consistent official division level, preserve separate supply→use reciprocal edges and manufacturing self-use. No arbitrary Other or partner selection. Within-manufacturing alternative retained in audit:15nodes/45edges/85.0606%, no isolation. |

V10/V11 map/network safety-matrix candidate entries are now backed by supplementary geometry/concordance and constructed data; the earlier “needs geography / unresolved reduction” descriptions are historical. Their main misuse risks remain applicable. Country/state anchors are calculated representative area points, not observed ports or facility coordinates. Nominal identity uses labels/constant context, never an ordered light-to-dark category scale.

Reproduction: `python3 scripts/build_redesign_candidates.py` then `python3 scripts/report_redesign_candidates.py`; dependencies openpyxl, shapely, pyproj, beautifulsoup4. Preserved raw sources, derived datasets, field traceability, joins, filters, exclusions, unmatched records, source URLs/dates/hashes and strategy comparisons are under `work/audit/redesign_2026_10_09/`, particularly `BUILD_REPORT.md` and `built/validation.json`. Official methodology resolves combinedIOIG1205; no values are imputed.

This is the requested pre-code approval checkpoint. Phase4 must render approved candidates, test direction/labels/flow traceability and all requested responsive/tooltips/console checks; retain current charts if reasonable visual adjustments cannot make an approved candidate readable. No new browser acceptance or completed advanced-idiom credit is claimed. Current13charts/3maps/project-conservative8advanced (strict7excluding tutor-conditionaltile-grid); expected after approved replacements passQA:9lecture-backedadvanced/4maps. V6dumbbell and V13slopegraph remain borderline. No V14.


## CURRENT IMPLEMENTATION — approved redesign execution
Latest user authorization implements V3/V10/V11 only from validated reproducible derived datasets. Promote/build final chart-ready data into work/data; Vega consumes these JSON files, not workbooks. Geometry layouts and display simplification are reproducible and do not change values. Keep Section4order V11→V13→V10→V12 because domestic connections→recent contribution change→international connections→consumer attitudes remains coherent. Prior audit/polish evidence below/above is historical, not new acceptance. Required QA:1280/390/live1280→390→1280, prescribed point/flow/direction/self-use tooltip samples, console and quickall13regression; protected-other-chart hashes and exactlive-dataset rebuild equivalence.

Redesign visual review adjustments before fixes: V3 coast context includes remote islands far outside the selected facility extent, leaving excessive blank space. Clip only V3 display coastline to110–155°E/45–9°S (mainland/Tasmania context); keepall1,210reported coordinates unchanged. V11 retain13px labels and reduce radius on its minimum-width narrow chart so direct labels do not touch arcs. Correct the adjacent V13→V10 transition to recorded state-origin exports and broaden footer source wording to include new preserved NPI/DFAT/cartographic references. No other chart data/spec change.

V10 pointer QA: physically truthful ACT line widths can be subpixel. Add an invisible8px pointer hit region for the currently selected flow only; it does not alter visible stroke width or encode value. The native flow selector remains the keyboard/touch exact-value alternative. Test actual tooltip fields through the selected invisible hit region as well as ordinary large flow strokes.

Mobile interaction review before fixes: ensure a relationship selector restores its placeholder when a division change removes the previous option; node clicks clear a previously selected unrelated ribbon/flow; node hover temporarily takes precedence over a persistent edge selection. These are selection-state fixes only, with no data/encoding changes. Facility lookup disambiguates repeated names with source facility IDs; tooltip may include the source ID.

Final narrow-layout refinement before implementation: V11's860px minimum-width chord can keep13px labels with560px mobile height instead of710px; reduce vertical whitespace without changing circle radius, ribbon widths, labels or data. Footer explicitly limits SA2-geography wording toV1/V2 and names NPI/reference geometry for the new maps.

Final SVG hover review before fix: changing z-order on hover can reparent a ribbon/path under the pointer and dismiss its tooltip. Reserve foreground reordering for persistent selection only; keep hover emphasis through colour/opacity. This avoids hover tooltip flicker without changing mark width, records or monetary values.

## CURRENT IMPLEMENTATION — final verification, 9 October 2026

V3 uses work/map3.vg.json and work/data/vis03_npi_facilities.json: 1,210 unique actual-location NPI manufacturing reporting facilities, 2024/2025, eight jurisdictions; ten coincident-coordinate excess records retained without jitter. Fixed-size navy circles; amber selection. Reporting coverage is not all manufacturers or certified facilities.

V10 uses work/vis10_state_export_flow_map.vg.json: 82 selected geographic state-origin → country connections, eight states and 25 countries; A$45.269466115bn of A$53.120650088bn, 85.2200905674278%, omitted A$7.851183973bn. 2025 Export, TRIEC23+24. Actual visible widths are linear export value; tiny ACT/NT widths are not inflated. Representative area anchors are not ports, curves not shipping routes. Unmatched endpoint values remain in the denominator. Native state/flow controls retain exact-value access on touch.

V11 uses work/vis11_directed_chord.vg.json: 19 official ANZSIC division nodes, 37 directed domestic intermediate-use relationships, A$444.3612941bn, 100% of scoped manufacturing-related value, 2023–24. Source/target angular sectors and target arrow tips preserve reciprocal supply/use and manufacturing self-use. Neutral navy/slate context, amber selection; arcs allocate endpoints and do not measure industry output. Internal mobile scrolling retains 13px labels.

Traceability: preserved official/raw sources under work/audit/redesign_2026_10_09/sources/ → scripts/build_redesign_candidates.py → validated built/ → scripts/build_redesign_live_data.py → work/data/ → Vega. NPI, DFAT, ABS Table5/concordance/methodology and ABS SA2 anchor geography; Natural Earth supplies reference country cartography, not government certification. Source URLs, dates, fields, joins, filters, missing/unmatched counts and hashes remain in source_manifest.json, built/validation.json and BUILD_REPORT.md. No workbook/source GeoJSON manually edited. No bin map implemented; V6 unchanged.

Final QA: individual desktop1280/mobile390 review of all13, live1280→390→1280 redraw, all13 rendered, document width equals viewport width. Representative actual pointer tooltips verified for three facilities (NT/WA/TAS), VIC→USA, QLD→PNG and ACT→UAE, Mining→Manufacturing, reciprocal Manufacturing→Mining and Manufacturing self-use. Tooltips contain correct source/target, values, units, year and scope; no undefined/NaN/null. Old-chart tooltip spot checks and all13 visual regression completed. Console capture shows no errors or warnings. Existing other10 chart specs/data and original sources match protected hashes. Full candidate rebuild plus promotion reproduced all11 live files byte-for-byte.

Section4 remains V11→V13→V10→V12. Shared changes are limited to new-chart embedding/controls/responsive styles and accurate adjacent narrative/source context. No other chart data meaning changed. Evidence and remaining limitations: work/qa/redesign/FINAL_REPORT.md; browser_qa.json; tooltip_checks.json; integrity_rebuild_results.json and screenshots. Prior historical acceptance/deferrals do not override this final section.

## Interaction, animation and coordinated-view design

CURRENT planned polish, 9 October 2026. Interaction patterns are adapted from FIT3179 Studio-linked Vega-Lite official examples where applicable. The user supplies the Studio linkage; the examples establish the patterns, not a claim that every adaptation was explicitly taught. References: [Search Input](https://vega.github.io/vega-lite/examples/param_search_input.html), [Crossfilter (Filter)](https://vega.github.io/vega-lite/examples/interactive_crossfilter.html), [Scatterplot Pan & Zoom](https://vega.github.io/vega-lite/examples/selection_translate_scatterplot_drag.html), [Overview and Detail](https://vega.github.io/vega-lite/examples/interactive_overview_detail.html), [Vega Zoomable World Map](https://vega.github.io/vega/examples/zoomable-world-map/).

Baseline rendered V3:1210 dots before/after facility lookup; lookup is selection, not filtering. No state/industry controls exist. Add separately named real filters; no validated files/values change. Supporting views are parts of existing V3/V10/V11, not V14. Preserve13 chart identifiers and order.

| Chart | Overview | Zoom | Filter | Search | Focus/selection | Details / tooltip hierarchy | Animation | Reset | Mobile |
|---|---|---|---|---|---|---|---|---|---|
| V1 | Fixed national rate classes | Native Vega projection signals after VL compilation; fitted geographic extent scales/pans, not colour domain | None | None | Hover geographic area | SA2, count/population/rate/year; missing explicit | No zoom animation; restrained tooltip reveal | View only | Explicit zoom/pan buttons, deliberate drag mode, normal scroll by default |
| V2 | Global area-proportional count scale | Same native projection adaptation; symbol area remains fixed | None | None | Hover symbol | SA2, business count, representative-location context | Same | View only | Same |
| V3 | All1210 validated dots | Native projection extent signals; fixed24area dots; buttons and deliberate drag | State AND primary-industry exact equality via Vega filter transform; all removes condition | Literal case-insensitive name substring highlights, never removes records | Lookup/tap retained among filtered records; selected amber | Facility first, jurisdiction/industry, period, reporting scope; visible exact details | SVG colour/opacity250ms, no position tween | Separate view and filters; filter reset clears search/focus | Controls44px, stack state-count bars, drag opt-in |
| V7 | All13 profiles | None | None | None | Persistent subdivision selector plus hover precedence | Original four values/units preserved | SVG stroke/opacity250ms | All profiles | Readable axes, selector supports tap |
| V9 | All10 disclosed histories | None | None | None | Persistent subdivision selector plus hover emphasis | Subdivision/year/integer rank/original employment | SVG stroke/opacity250ms, no line drawing | All histories | Existing internal scrolling; tap control |
| V10 | All82 retained flows | Keep full-world extent: coordinated destination ranking is more useful than pan for OD tracing; no zoom added | None; correctly labelled state focus, never filter | None | State/flow selected amber, moderate fade, fixed width scale | Origin→destination, A$bn,2025/STM+ETM/state-origin context | SVG opacity/colour250ms, no width rescaling | All states/clear flow | Stacked top-destination bars; tiny flows lookup |
| V11 | All19nodes/37directed ribbons | None | None; industry focus retains network | None | Industry/edge selected amber | Supplier→User,A$bn,2023–24/basic prices/scope | SVG opacity/colour250ms; no rotation | All relationships | Existing internal chord scroll; supplies/receives bars stacked |
| V13 | All15 subdivisions | None | None | None | Persistent selector plus hover,45% minimum context | Both original IVA values,absolute/percentage change,unit/year | SVG opacity/stroke250ms | All subdivisions | Existing readable internally scrolling labels; tap control |

V3 supporting bars: dynamically count the same validated facilities by state after industry filter only; retain all8jurisdictions including true zero counts, fixed global count domain, selected state amber. State selection filters map but leaves cross-state comparison. Search does not change bars. V10 top8destination bars aggregate only82retained flows for all/selected origin; descending, fixed global monetary domain, show retained total and number of destinations, report top8display restriction rather than changing85.22% coverage. V11 paired Supplies to/Receives from summaries use selected division edges, full values, fixed common monetary domain; top5 initially, all via disclosure, manufacturing self-use identified in both directional summaries (not summed twice as network total). Default unobtrusive instruction. Accessible HTML horizontal bars are lightweight coordinated views driven by the same Vega source datasets/selection signals; no new complex network or decorative mini chart.

Global: soften unnecessary outer card borders/shadows into a narrative figure layout; supporting views sit under main charts to preserve geographic/chord width on desktop and stack on mobile. Navy/slate marks, ordered blue quantitative rates, amber selection/verified focal annotations, grey missing/context. Improve existing transitions without reorder. Audit all tooltip titles/formats, preserving existing original-value and missing semantics. Use compact identity/value/time/context hierarchy in new charts. 250ms CSS SVG/summary transitions; disable under prefers-reduced-motion. No animation of data position/geometry. View resets do not clear filters. Re-render on resize retains current controls; map view may reset to overview, documented.

Required new rendered QA: real V3 counts all/state/industry/AND/reset/search, state bars, zoom/pan/reset/afterzoomtooltip; V1/V2 zoom fixed scales; V10 two states+ACT/destination bars; V11 three industries+directional summaries/reciprocal/self-use; persistent V7/V9/V13 focus; desktop1280/mobile390/live resize; console/all13regression; data hash equality. Prior passed QA remains historical, not new acceptance.

Polish review before refinements: V7 selection still uses navy rather than amber and leaves lines at25%opacity. Use amber selected line/points and45%line context. V13 selected subdivisions should use amber; when focus is active the two default annotated movers become neutral context, otherwise retain their verified focal amber. V9 focus strengthens line stroke without rank/value changes. Tooltip audit: add missing period to V4/V5/V7, clarify A$million labels in V4/V7 and use consistent A$bn node summaries in V11. These are label/display changes only.

Native projection adaptation detail: geographic views do not have ordinary x/y scales to bind an interval to. Vega fit-extent/translation signals provide scale/translation of the projection, with pointer-stream drag and event-only Ctrl-wheel filtering; signal gating belongs in update expressions (Vega event filters cannot reference signals). Explicit buttons and opt-in drag protect vertical touch scrolling. No coordinate/size/value mutation.

Confirmed display-parsing bug before correction: V1's zero-population Wollangambe–Wollemi tooltip renders0.0 although validated CSV rate is blank and Rate_Status=zero_population. Vega numeric CSV parsing can coerce blanks to0. Restore missing with existing Rate_Status and readable unavailable tooltip; never change CSV values. Check/fix V5 blank employment/share parsing with explicit empty-string guards, preserving real zero cells and nine suppressed cells. Renderer may use SVG for V5 to inspect exact missing mark encoding. This is a confirmed correctness exception, not new data transformation.

Final tooltip/missing refinement: separate valid and unavailable V1/V5 mark layers, preserving55 neutral background regions (including19 boundary records without a linked chart row) and9 suppressed heatmap cells. Unmatched V1 tooltip identity comes from the original boundary name; unavailable state/count/population/year are explicit text, never fabricated values. Add restrained amber hover outlines to V1/V2/V5 SVG marks; no additional filters or linked views for simple charts.

## CURRENT IMPLEMENTATION — interaction polish acceptance record

The interaction design section above now describes implemented V1/V2/V3 map controls, true V3 state AND primary-industry filters, independent name search, V3/V10/V11 coordinated summaries, and persistent V7/V9/V13 focus. Keep13 charts, all existing idioms, and Section4 V11→V13→V10→V12. Sources/data/build scripts are unchanged;40 recorded data/source hashes match the baseline.

New rendered checks completed: all13 desktop/narrow visual review;390px document width=390 and1280px document width=1280 after rendering; internal chord/slope scrolling; V3 All1210/VIC354/wine157/VIC+wine31/reset1210/search2matches with1210dots; zoom1.6/pan/reset and unchanged dot/symbol size; V10 state summaries including ACT with82mapflows; V11 B/C/D summaries with37ribbons; actual supplier/user reciprocal and self-use tooltips; original-value V7/V9/V13 details. Independent captured-summary reconciliation passes. Source/method semantics and narrative order remain unchanged.

Acceptance boundary: browser automation became unavailable during the last reload/recheck (native service unavailable and debugger disconnections). The final V1 missing-field text fallbacks and final V1/V2/V5 CSS hover outlines need a fresh rendered acceptance check. Earlier missing-layer checks verified55 unavailable V1 regions and9 grey suppressed V5 cells, and actual V5 tooltip correctly said unavailable. No final post-refinement console pass is claimed. Physical touch-device gestures and an OS reduced-motion toggle were not tested;390px browser layout/control checks and reduced-motion CSS review were completed. Detailed results and limitations: work/qa/interaction_polish/FINAL_REPORT.md. Status: implementation delivered; final browser acceptance remains limited, not an unconditional final-rubric sign-off.

## HISTORICAL BASELINE — Colour and visual-rhythm polish

CURRENT approved styling, 10 October 2026. This section supersedes earlier navy-only/blue-grey styling descriptions, not data/idiom/interaction rules. Conflict identified before code: V2 constant navy, V4 constant blue-grey, and generic navy single-series guidance must accommodate this controlled palette. Historical audits retain their original descriptions.

Amber #A76312 remains selected/active/focal; never an ordinary default series. Sequential blue remains ordered quantitative V1 rate/V5 share with unchanged thresholds/domains. Grey remains missing/context, distinct from zero. Section numbers and section eyebrows only use01teal #2F6F73,02green #5F7D67,03indigo #5B5F91,04rust #9A6045. Main headings/body remain dark ink; no section backgrounds.

V2 constant teal #2F6F73, same opacity/white stroke/global area scale. V3 map remains navy for dense-point contrast, supporting state bars teal, selected state amber. V4 uses a fixed nominal subdivision-domain qualitative palette: #4F7C82,#668A73,#8C7A55,#7A6F91,#A26E52,#557A9A,#8B6D76,#6D8467,#9A8159,#62778B,#8D795E,#587F75,#776C87,#9B735E,#6D8291. No colour magnitude scale/legend; contrast-aware label colour selected from black/white by calculated luminance. Same subdivision maps to same colour.

V6 Sales #2F7D79 circle and IVA #A0644B diamond; neutral connectors and unchanged legend/shape redundancy. V8 line/points #5B5F91, one series. V7/V9/V13 focus/context unchanged. V10 main flows unchanged; destination bars #3F727E. V11 main chord unchanged; Supplies to bars #357B78 and Receives from #9A6045 denote direction role only, common monetary scale preserved, active relationship amber. V12 all independent points/percentage labels #9A6045; no extra84% emphasis needed, no amber default.

Feature layout: only V3 state-summary region rgba(47,111,115,.05) and V10 summary rgba(154,96,69,.04) gain small padding. V11 paired summaries subtly grouped with clearer small directional headings. Keep dominant map/chord widths; no whole-chart cards/shadows/gradients. Strengthen section whitespace only; retain text/order. No animation, filter, search, tooltip, geometry, quantitative scale, validated value, classification or count changes.

Required acceptance: actual localhost desktop1280/mobile390 whole-page colour review, contrast checks, all13regression and console. Preserve prior unresolved acceptance limits unless newly tested.

CURRENT colour-polish delivery/acceptance: the palette and local supporting-view styling above are implemented. Active V2 is teal; V4 fixed qualitative subdivision palette; V6 teal/rust; V8 indigo; V12 rust. V3 map/V10 flows/V11 chord and all quantitative encodings remain unchanged. The V11 existing selectedEdge signal now colours the corresponding summary row amber without changing selection behaviour. Static comparison verifies33live-data hashes unchanged, all chart data/transforms/tooltips/projections/selection definitions unchanged, and app.js unchanged. Minimum V4 label contrast4.62:1; V12 rust labels4.77:1 on existing page background. No new animation.

CURRENT colour and visual-rhythm acceptance — 10 October 2026: COLOUR POLISH READY.

Fresh rendered acceptance used ONLY the ChatGPT desktop built-in browser at http://localhost:3000/, with viewport overrides of 1280 x 900 and 390 x 900. Reviewed the whole scrolling story and all V1–V13 at both widths using native screenshots and native scrolling; no Playwright, Chrome extension, external Chrome, cloud browser or terminal browser automation. Full-page screenshot capture was unavailable, so the whole-page review used successive viewport screenshots. Restored the normal viewport after review.

PASS: V4 muted qualitative treemap has no rainbow impression or implied colour magnitude; visible labels remain readable and small-tile labels are suppressed on mobile. V6 teal Sales circles and rust IVA diamonds remain distinguishable, with readable desktop/mobile legends. V8 indigo line/points remain clear and establish Section 03. V11 default chord remains navy/slate; selecting Manufacturing verifies teal Supplies to and rust Receives from, readable paired headings, common value scale, and mobile stacking. Amber indicates selected/focal context. V12 rust dots and percentages remain readable at both widths; four independent findings and the explicit non-additive/non-funnel caveat provide a distinct ending.

PASS: Section 01–04 teal/green/indigo/rust accents are subtle; dark headings/body dominate. V3/V10/V11 supporting tints group summaries without heavy cards, while main maps/chord retain priority. V1/V5 use ordered blue lightness, missing values remain neutral grey, V4 uses nominal hue, and no rainbow quantitative or unjustified diverging colour scale was observed. Amber remains selection/focal emphasis, including the already-approved verified annotations, rather than an ordinary data series.

PASS: all13 rendered regression at desktop/mobile; no visible page-level horizontal overflow. A horizontal scroll attempt on the mobile page body at the footer produced no sideways movement; the V13 chart itself scrolls independently. This was visual/native-scroll acceptance, not a programmatic document-width measurement. Wider chart contents remain in their existing internal scroll regions. Fresh reload plus final built-in console inspection returned no error/warning entries; no JavaScript errors, failed data loads or Vega/Vega-Lite warnings were observed, and all13 chart views rendered.

No rendered issue requiring a fix was confirmed. This acceptance update changes PLAN.md only; no chart/code/data changes and no animation added. Prior static hash/contrast results above are historical evidence, not rerun claims. Prior interaction-specific tooltip/hover, physical-touch and OS reduced-motion limitations remain outside this colour-only acceptance. The earlier work/qa/colour_rhythm/FINAL_REPORT.md records the historical blocked attempt and is superseded by this acceptance entry for colour/rhythm status. Conservative advanced9/map4/13charts unchanged.


## Approved V9 optional temporal reading aid — 10 October 2026

Narrow exception to the no animated geometry rule: V9 alone may update a current-year guide and emphasize points at discrete observed years. No rank interpolation, line drawing, autoplay, looping, changing domains or hiding histories. This is an OPTIONAL temporal reading aid to follow manufacturing subdivision employment ranks across years, not a replacement for the full static bump-chart overview, separate chart, new data encoding or new advanced idiom. V1–V8/V10–V13 remain unchanged.

Default full-history overview; Play starts 2006–07, Pause retains year, Play resumes paused year, and Play after completion restarts. One observed year per 1000ms step, ending 2024–25. Slider integer indices select only the19 observed years, update immediately and pause. Current year remains readable outside chart. Reset returns to overview and preserves subdivision focus. Complete histories and fixed year/rank domains remain; active points use existing slate/amber focus colours with larger size, and neutral slate guide. Tied ranks remain tied; no data/value/cohort changes.

Focus changes, tooltip/direct chart interaction and internal scrolling pause playback. Focus persists on resume/reset. Controls wrap at390px with44px minimum targets, keyboard and visible focus, no chart auto-scroll. Manual year changes announce politely; playback years are not live announcements. Reduced motion disables timed playback and tweening; manual years and overview remain available. Stop timers on leaving viewport, hidden document, page exit and before resize/re-render; disconnect observers/listeners on disposal and prevent duplicate timers.

Acceptance pending: built-in browser only1280/390; overview/no autoplay, start/advance/end/pause/reset/slider, focus and exact tooltips/ties, mobile/internal scrolling/overflow, resize/offscreen/hidden/reduced-motion lifecycle, console/all13. Verify protected data/source hashes,190records/19years/10subdivisions, ranking/cohort/tooltips and conservative advanced9/map4/chart13 unchanged.

V9 QA finding: manual slider input was read after pause refreshed its value. Minimum fix: capture the observed-year index before pausing. No data or encoding changes.


CURRENT V9 implementation acceptance — 10 October 2026: V9 ANIMATION READY WITH MINOR LIMITATION.

Updated PLAN before implementation; V9-only exception remains optional and the original full-history overview is default. Files changed: PLAN.md, index.html (one script include), app.js (three V9-only hooks), styles.css (V9-only controls), new v9-animation.js, and work/qa/v9_animation evidence. No source/data/spec changes.

Built-in-browser checks at 1280/390: full overview/no autoplay; Play starts at 2006–07, advances annual observations and stops at 2024–25 without looping; Pause/Reset work; focus persists through playback/reset, changing focus pauses. Direct chart interaction and internal mobile horizontal scrolling pause. Resize stops playback and initializes an overview with focus retained. Complete histories remain visible; guide/point emphasis uses existing slate/amber meaning. Keyboard slider Home/End/Right selects exact observed years and updates external text/manual ARIA announcement after the event-order fix. Mobile controls fit with visible keyboard focus and CSS 44px minimum targets; internal chart scrolling remains, no playback auto-scroll, no visible page overflow.

All13 Vega view containers rendered after reload and mobile resize; fresh built-in console returned [] for warnings/errors. Initial stale page had failed-fetch errors and localhost connection refusal before restarting the local server; these are not final-console results. All64 protected source/data/spec hashes match the before snapshot. V9 remains190records,19years,10subdivisions. Unchanged spec/data preserve integer ranks, ties, final-year cohort rule, exact tooltip fields/values, colour system and domains. Conservative advanced9/map4/chart13 unchanged.

Deterministic lifecycle test passes all19 discrete states/end stop, hidden-document pause, resize/offscreen/focus/inspection cancellation, reduced-motion disabling playback with manual selection available, manual announcements, reset and disposal. This is a mocked DOM/view test, not browser automation. Native browser independently checked resize/offscreen/direct interaction/internal scroll.

Remaining minor acceptance limits: hidden-tab test was confounded by browser resize/re-render; OS reduced-motion setting and screen-reader speech were not exercised live. Their handlers passed deterministic tests. Tooltip fields/values remain unchanged and are visible in rendered accessibility mark metadata, but a fresh tooltip popup was not independently verified. No claim of a programmatic overflow measurement or physical-touch test. Browser viewport restored. Evidence: work/qa/v9_animation/desktop.jpg, mobile.jpg, lifecycle_test.cjs.


## CURRENT EXPERIMENT — controlled purple-led editorial palette, 12 October 2026

User-authorized colour-only experiment. This supersedes the active mixed section palette above; the accepted teal/green/indigo/rust palette and its QA remain HISTORICAL baseline evidence. Current conflicts resolved before implementation: V2 teal becomes primary purple; V3 navy dots become deep purple; V8 indigo becomes deep purple; V12 rust becomes plum; four section accents become one purple family. No changes to data, scales/domains, geometry, idioms, order, controls, filters, tooltips, animation or V9 playback. Retain13charts/9conservativeadvanced/4mapidioms.

Styling: primary #A855D6; deep #7B3FB1; soft #D9B7EE; ink #172C3F unchanged; secondary teal #2F7D7A; neutral geography/context/missing unchanged. Section numbers deep purple, small uppercase eyebrows primary purple; main headings remain ink. V1/V5 sequential blue unchanged. V2 circles/size key primary purple, existing opacity/white outline/area domain. V3 fixed dots deep purple, state summary primary purple. V6 Sales teal/circle, IVA primary purple/diamond, connectors neutral. V8 one series deep purple. V12 uniform #8E3FA9 points/percentage labels. V10 flows remain slate/navy, destination bars deep purple. V11 chord remains slate/navy; Supplies teal, Receives primary purple on unchanged common monetary scale. V7/V9/V13 neutral context unchanged.

V4 fixed nominal subdivision palette: #5B5F97,#7B4FA3,#A855D6,#4E7D84,#2F7D7A,#6F8A67,#9B8153,#B06A3C,#A45F6A,#6C6A8C,#587B9A,#8A6F52,#7B6B78,#607A70,#8D725E. Retain area-only IVA magnitude encoding and contrast-aware black/white label lookup recalculated for new fills. No ordering/legend added. Supporting V3/V10/V11 regions use rgba(168,85,214,.05), existing padding/layout unchanged.

Amber #D8891C replaces older mark/outline/bar focus colour, selection semantics unchanged. Retain darker #A76312 for small selected text where bright amber fails text contrast; same amber family/meaning, no new category. No changed opacity, width, size, transition timing or behaviour. Required built-in-browser-only1280x900/390x900 full-page review, all13render/overflow, focus/legend checks, fresh console and protected-source/data/structural comparisons. Stop styling after QA unless a confirmed problem needs correction. Acceptance pending.

Browser refresh note before fix: the existing stylesheet version still shows historical accents after reload. Bump only the stylesheet query token in index.html to purple-experiment-1; no interaction/script change.

Confirmed contrast refinement during QA: #A855D6 small eyebrow text is3.997:1 on #F6F8FA, below4.5:1. Use #7B3FB1 for small eyebrow text as well as section numbers; retain primary purple for non-text marks/bars. V4 recalculated black/white text reaches minimum4.591:1; V12 plum text5.744:1. This is an accessibility correction, not further aesthetic iteration.


## CURRENT IMPLEMENTATION — purple-led experiment acceptance, 12 October 2026

PURPLE EXPERIMENT READY. Recommendation KEEP: stronger unified editorial identity, most visible improvementsV2/V6/V8/V12. Main trade-off is less section-specific hue variety. The CURRENT EXPERIMENT palette above is implemented, superseding the historical mixed section palette. All section numbers/eyebrows use deep purple #7B3FB1 (primary purple for marks rather than small text), V2 primary purple, V3 deep dots/primary summary, V4 fixed15colour qualitative palette with recalculated black/white text, V6 teal/purple, V8 deep purple, V11 teal Supplies/purple Receives, V10 deep-purple destination bars, V12 uniform #8E3FA9. Neutral networks/context and V1/V5 ordered blue unchanged. Amber marks #D8891C; small selected text retains darker #A76312.

Actual rendered built-in-browser-only full-page/native-scroll review1280x900 and390x900; all13 charts reviewed/rendered, labels/legends/source wraps and supporting-view grouping acceptable. No visible page-level overflow; mobile body horizontal-scroll attempt at footer caused no sideways movement. Existing internally scrolling charts remain necessary. Fresh captured desktop/mobile/final console warning/error logs[]; no failed data load or Vega warning observed. Viewport restored, same existing tab retained; cache-busting page query avoids stale root HTML. No other browser or Playwright used.

Protected46source/data hashes match;11spec modifications differ only in hex colour literals. app.js/interactions.js/v9-animation.js byte unchanged; index.html differs only in stylesheet cache token. No data, quantitative domain, filter, tooltip, geometry, order, playback, animation or count change. V4 minimum label contrast4.591:1, V12 labels5.744:1. The V9 small-text exception was checked structurally; no claim of exhaustive new tooltip/playback/physical-touch/reduced-motion acceptance. Prior interaction-specific limitations remain. No styling iteration after review. Details: work/qa/purple_experiment/FINAL_REPORT.md and validation.json.13charts/9conservativeadvanced/4mapidioms unchanged.


## CURRENT DESIGN REVIEW — separate candidates, 12 October 2026

Production remains the accepted purple-led 13-chart implementation. This review does NOT promote experimental candidates. User decides after preview/recommendation. Store reproducible candidate specifications/data in work/experiments/controlled_redesign; use redesign-preview.html in the same built-in browser tab. No source/data overwrite or production chart/order/scale/interaction changes.

Annotation checklist: (1) V12 tooltip already verified in rendered page; add discoverability in preview. (2) brighter V6 two-measure colours; (3) V5 sequential alternative hue; (4) V4 higher-saturation nominal hues; (5) V2 mathematically proportional, better-separated legend samples; (6) V1 sequential orange and larger view; (7) V2 side legend; (8) larger V2; (9) V9 stable categorical focus hue rather than universal amber; (10) V10 darker boundaries, separated width-key samples; (11) V10 native signal zoom/deliberate drag. Items2–4/6/9/11 conflict with current active palette/focus/zoom policy and remain preview-only pending clarification. Never exaggerate symbol/line size to differentiate quantities.

Candidate questions: V2 equal-cell SA2 grid cartogram using all2452 validated SA2 counts (schematic relocation, never factory coordinates; reject if noisy); factory glyph belongs in explanatory title/key rather than irregular proportional marks. V6 paired-growth scatter x=sales%, y=IVA%, zero/equality references,13complete pairs and2explicit exclusions. V8 observed line/light area with zero-baseline fixed scale and full-history interval-brushed overview, no interpolated observations. V10 assess normalized state manufacturing employment per10000 residents (2024–25 employment/2025 population) behind unchanged2025 export OD widths; disclose year/basis mismatch; retain pure flow if Australian regions too small. V12 annotated lollipop and independent common-scale radial previews; preserve4validated2025 findings, qualifiers and non-additivity. Audit richer2022 logo-association research separately, without adopting older data.

Principles: marks/channels follow geometry, attribute and quantity; colour ordered lightness for rates/shares/counts, nominal hue for subdivision identity, neutral missing, amber focus. Candidate equal-cell cartogram uses area only for equal regions and sequential count lightness. Flow geometry is connection, never shipping route. Projection zoom changes display only, not symbol/width scales. Full-history employment overview remains visible and area starts at zero. Native Vega-Lite overview/detail interval-domain pattern and Vega projection signals are adapted from official references. Touch-safe drag is deliberately enabled. No decorative animation or new production interaction.

Required evidence before recommendation: measured distribution/bin counts, candidate desktop1280/mobile390 previews using only existing ChatGPT built-in browser; visible tooltips, brush/reset and zoom/drag checks; console; hashes confirm production files and validated live data unchanged. No claim of original lecture pages unavailable locally: use PLAN, supplied map revision guide, official Vega references and primary flow-map research.

Candidate-only geographic efficiency refinement: avoid a92MB expanded copy of official polygons. V10 normalized background will colour the existing validated display SA2 polygons uniformly by their official parent state, using an original-boundary-code → state → validated state-rate lookup. Analytical unit remains state; no geometry alteration, invented coordinate, production change or state-value recomputation. Missing/unmatched parent lookups stay grey.

## CURRENT CANDIDATE REVIEW STATUS — 12 October 2026

Separate candidates built at redesign-preview.html (selector:V12/V8/V2/V6/V10/comment-colours). No production promotion.12candidate specifications+4gauge children compile/parse without warnings in static official Vega/Vega-Lite checks. Repeat build exactly reproduces18generated JSONoutputs;53protected live files hash unchanged. Production remains13charts/9conservativeadvanced/4maps.

Rendered evidence this pass: current V12tooltip popup works (73%fullwording/period/source/qualifier). After attempting candidate viewport/navigation, built-in browser runtime timed out/reset; reconnect returned Browser is not available:2 and browser inventory[]. ChatGPT built-in browser access is unavailable. I did not fall back to another browser. Candidate desktop/mobile/console/tooltip/brush/zoom/drag/overflow acceptance is PENDING; no rendered candidate comparison or fresh full-page regression claimed.

Provisional recommendations: retain V2circles; equal-cell cartogram's35.36cell maximum relocation is a major geographic-readability risk, not evidence that all continuous cartogram techniques were tested. V6scatter/V8overview-detail/V12lollipop and V10darker-boundary/native-zoom previews are candidates for further polish only. Keep pure V10rather than combined state-rate background pending proof of benefit at world scale; reject V12gauges for weaker comparison. Colour/focus policy conflicts remain preview-only pending the user's answer. Full11comment checklist, distribution audit, sources/references, explicit limitations and files:work/experiments/controlled_redesign/REVIEW.md. User decides promotion after actual browser acceptance.


## CURRENT APPROVED UPDATES — 13 October 2026

User explicitly approves production V8overview/detail, V2larger proportional map+side size key+zoom, V10normalized manufacturing context+flows, real origin filtering and selected-connection highlight/direction arrow, larger V1, V4macaron nominal hue palette, blue V5, existing V9animation. This supersedes conflicting historical palette/preview-only statements for these items. Production remains13charts; no order, source value, ranking, denominator or true symbol/flow scale change. V1 'is good' is interpreted as approval of the sequential orange preview; thresholds/missing treatment stay unchanged and national default extent retained. V2existing native zoom/pan remains, larger canvas and exact-area25/200/800legend side key desktop/below mobile.

V8promote19observedJune-end values to line+zero-baseline light area, native interval-brushed overview and reset. Overview keepsfullhistory; fixed0..1100thousands detail scale. Original financial-year tooltip preserved; observedDate labels generated reproducibly. V10background=validated state manufacturing employment per10000residents (2024–25employment/2025population), sequential blue; official SA2parent-state lookup and unchanged displaygeometry. Export widths retain2025global monetary scale and82flow/85.2201%overallcoverage. selectedState applies a real data filter to visible flows; all-state reset restores82. Supply world/context polygons remain. Select flow highlights amber and displays only its arrowhead, to avoid82arrow clutter. Arrow is ODdirection, not shipping route; small flow widths never inflated. Existing native Vega projection zoom/deliberate drag promoted with combined map.

V4fixed15pastel/macaron categorical hues with contrast-aware labels; hue encodes subdivision identity, IVA area unchanged. V5explicitsequentialblue; nine suppressedcells stayneutralmissing. V9accepted static histories+optional observed-yearPlay/Pause/Reset/slider remain byte unchanged, universalamberfocus; reject macaron-focus experiment for production.

V6/V12: user rejects earlier candidate choices; keepcurrentproduction temporarily and build new separate options. V6grouped horizontal growth bars preserve validIVA-only subdivisions and showtwo measures using commonzero/percent scale, no red-green pair. V12editorial percentage panels usefourindependent2025statements, common0–100rails, exactlabels/fullqualifiers/details, notfunnel/additivity. Neither new option promoted without user's choice.

Acceptance requires actualexistingChatGPTbuilt-in browser localhost3000 desktop1280/mobile390 and resize, representative statefilter/connectionarrow/brushreset/tooltips, all13regression, console. No externalbrowser fallback. Record actual evidence and limits rather than infer acceptance from build checks.


## CURRENT IMPLEMENTATION STATUS — approved choices,13October2026

Implemented:V1orange/larger650desktop380narrow;V2larger/sideexact-area25–200–800key/existingnativezoom;V4macaronnominalpalette(darklabels,min6.428:1);V5blueunchanged;V8promotednativeoverview/detail+reset/19observations;V10promotednormalizedstatecontext+realstatefilter+selectedconnectionamber/arrow+nativezoom/deliberatedrag. V9acceptedanimation/specbyteunchanged. V6groupedgrowthbars andV12editorialstatementpanels are separate newoptions, notpromoted. Chartorder13/advanced9/maps4unchanged. Oldpreview-only/no-production-promotion text is historical for the choices nowexplicitlyapproved.

V10filterdataflowpasses82all/NSW24/VIC16/QLD16/SA8/WA9/TAS7/NT1/ACT1; selectioncreatesonearrow; zoomdoesnotaltermonetarywidthscale. V8brushreset keeps19sources. V6candidate28validbars(15IVA+13Sales),missingSalesnotzero.33original livedatahashes unchanged;2newderivedliveJSONoutputsadded;approvedoutputsrebuildexact. All13active+2historicalspecsdataflowpass; renderer-noneNodechecks haveexpectedwindow-eventwarnings, NOT a browserconsoleclaim.

RenderedacceptancePENDING:built-inbrowserwasavailablebeforeedit,butinitialnavigationhitconnectionrefused;serverrestartedandverifiedHTTP200. Currenttab'sgenerateddata:errorpageisblockedbyBrowserUseURLpolicy. Noalternatebrowser/workaroundused;viewportrestored;manualrefreshrequestpending. Desktop/mobile/actualfilters/gesturetooltips/console/all13visualregressionnotclaimed. Fullfacts/files/limitations:work/qa/approved_updates_2026_10_13/REPORT.md.


## CURRENT V6 APPROVAL / V12 REJECTION —13October2026

User accepts V6newpairedhorizontalgrowthbars: promote to work/vis06_grouped_growth.vg.json and app target, keeping common−15..30%scale,28validbars(15IVA/13Sales), missingSalesabsent and allsubdivisionidentities. Mobile legend vertical, readable labels,650pxheight; preserve values/source/caveats. This replaces activeV6dumbbell description; dumbbell remains historical/recoverable. Conservativeadvanced9unchanged. Reproduction order:apply_approved_updates.py then promote_v6_grouped.py.

User rejects V12editorialpanels; do not promote them. CurrentproductionV12dotplot stays pending a new design choice. Offer conceptual options grounded in4independentpercentages; no new data, idiom replacement or candidate implementation authorized by the request for ideas alone. Recommend4independent100unitdotmatrices with exactpercentlabels, fullwording tooltips and prominent qualifiers; eachdot=1percentagepoint, never1respondent; no funnel or additive interpretation. Richer category×preference comparison would require verified supplementary survey data.

V6 rendered correction: folded measures caused default aggregate sorting to put the two IVA-only subdivisions first. Use min(ANZSIC_Code), numeric parse and ascending official code order. This changes label ordering only, never values/rankings.

V6 promotion acceptance: actual existingChatGPTbuilt-inbrowser page inspected at normaldesktopwidth and390px. Pairedbars and verticalmobilelegend readable; negativegrowth crossescommonzero;IVA-only rows retained; officialANZSICorder confirmed after sortingfix. Freshbrowser warning/errorlogs[]. V12unchanged. No claim of newall13exhaustiveQA or freshV6tooltip-popup acceptance. Main remainingV12decision is designconcept, not missingdata.


## CURRENT WEEK10 STUDIO / ANNOTATION UPDATE —13October2026

Reviewed supplied Week10StudioPDF:pages2–7vconcat+interval brush+detaildomain, overviewy-axis tickCount3/gridfalse;pages18–22yearparameter+filter, projectionzoom parameter, fixed quantitative colour scale, basegeographyformissing. OriginalV8uses the sameofficialoverview/detailreference linkedbyStudio; restoreoverview3tickyaxis andblue reference styling,19observations/zerobaseline unchanged.

Comments1/2:mapsstilltoosmall because fitincludesCocos/Norfolk/outlyingregions(longitudeextent96.82..167.998). Change initialprojectionfit to8states/mainland+Tasmania withoutremovingrendereddata;retainAllregionsbutton,zoom/pananddefaultviewreset. This isdisplaynavigation,notfiltering. VisiblecaveatoutlyingregionsaccessibleviaAllregions. Symbolglobalareas/rateclasses/geometries unchanged;do notsolvebyonlyaddingcanvasheight.

V4useuserprovidednominalpalette#D7BBFF/#A2D2FF/#FFC2D1/#FCEFB4/#FFFFFF;15identitiescannotbedistinguishedby5uniquehuesalone,sofixedrepeatingassignment+directlabels/darkink/thinneutralboundaries;noorderingormagnitudeencodingincolour. V6requestednewmeasurecolours;awaitoptionalchoice,defaultblue/coralifnoanswer;amberstillfocus.

BuildseparateStudio previewroute(studio-preview.html)beforepromotingidiomchanges. V9animateddonutquestion=howmanufacturingemploymentsubdivisioncompositionchanges,NOTrankhistory. Useall15officialseries×19observedyears frompreservedABSworkbook,verifyfinite/missing,totalreconciliation;sharesusetheexplicitvalidsubdivisiontotal,not10displayedbumpseriesalone. DiscreteobservedyearPlay/Pause/Reset/slider,noautoplay/nointerpolatedmeasurements,noautomaticloop;respectreducedmotion. ProductionV9bump+animationunchangedpendinguserchoice. Donut/animationdoesnotautomaticallycountadvanced;promotionwouldlosetheclearlyadvancedbumpidiomunlessanotheracceptedadvancedredesigncompensates.

V1time-sliderchoroplethcandidate:preservedbusinessworkbookTable3/2/1June2023/2024/2025,ManufacturingdivisionC,totalfield;matchedERPJune30eachyearfrompopulationTable1;same2021SA2boundaries. Rate=businesses/ERP×10000onlyvalidpositivedenominator;missingstaysgrey. Fixedsameclassesacrossyears;validate2025ratesagainstliveV1,documentunmatched/virtualrecords/coverage. AdaptStudioYear_selection→filter andprojectionparameterzoom;notnationalemploymentassignedtolocalareas. ProductionV1remainssingleyearuntilpreviewapproval.

Requiredactualbuilt-inbrowser desktop1280/mobile390previews/interactions/console;noalternativebrowser. Redditreferenceopenedasinspirationonly;externalPlotPanelrendernotaccessiblethroughwebtool,nootherbrowserused.

Time-map preview refinement before implementation: add native projection-fit region selection (National/mainland,Allregions,8officialstatehierarchycodes) equivalent to Studio map-centre control, using real source boundary components rather than guessed city coordinates. Region/zoom reset preservesyear;yearfilter neverchangescolourclasses.

Confirmedtime-previewlegendclippinginbuilt-inbrowser:removefixedautosize-noneoverridesothebottomratelegendhasroom. NativeVegaautosize-pad;colourclassesunchanged. Useaccessibleblue#0C92C4forV8(samehuefamilyasreference) andretainhigherluminanceareafillopacity.

Time-maplegendfinalrefinement:explicitnativeVega symbollegend for the7thresholdclasses,not an auto-gradientlegend. Orderedcolours/classesunchanged;this fixes representation of class boundaries.

Confirmedmobile-donuttooltipclipping:pinpreviewtooltipswithinviewport(top10px/left10px)on narrow screens,withboundedscrollableheight. This preview-onlydetailsfix doesnotchangeproductioninteractions or values.

Confirmednarrowpreviewframingissue:autosize-padincludesoffscreenoutlyinggeography,expandingSVGandshrinkingmap/legendthroughmax-widthCSS. Usefixedviewportwithclippedmarks;renderpreviewthresholdlegendinHTMLfromtheexactspecscale(domain/range). This changeslayoutonly. ApplysameclippedfixedviewporttocompiledproductionV1/V2initialfitsoAllregionscontrolratherthanautosizercontrolsgeographicextent.

V4finalboundaryclarification:adjacentsame-colourtilesneedvisiblewhite separators;whitepalette tiles usegreyedges instead. This preservesall15tile identities/areas. Time-maptooltips displayavailablecounts/populationevenwhenrateinvalid;no-null-as-data. Addsmall-denominatorcaveat.

## CURRENT VERSION COMPARISON NAVIGATION — 13 October 2026

User requests a button to revisit older idioms and several versions before further changes. Add Compare versions links for V1/V2/V4/V6/V8/V9/V10/V11, a separate versions.html viewer, preserved immutable spec snapshots, and an explicit current-production link. Historical previews are labelled with their data scope and may omit later page-level controls; current interactions are reviewed on production. V1 time-slider and V9 donut remain candidate links, not promotions. V10 export-line versus flow-map and V11 alluvial versus chord use different questions/datasets and must carry prominent scope warnings. No chart added to the production page, data transformation, scale or order changed. Future changes must preserve a pre-change spec and register its version first. Run build_version_viewer.py after all existing promotion/framing scripts so comparison links are reproducible.

Confirmed rendered V8 mobile issue: long overview x-axis instruction is clipped at390px. Shorten it to 'Drag to select years'; retain the full brush/reset instruction above. Change text only, preserving overview axis/data/brush domains. Version archive snapshots retain their historical wording.

## CURRENT STUDIO AND VERSION ACCEPTANCE — 13 October 2026

Production now V1/V2 mainland/Tasmania initialfit with Allregions/unchanged-data native navigation; V4 supplied5pastel hues/directlabels; V6blue/coral pairedbars; V8blueoverview/detail with restored lower3tickyaxis and mobile-safe caption. Supersedes earlier interim autosize/tooltip instructions: final maps use clippedfixedviewport; previewmobiletooltip is bottom-pinned; time-mapHTMLthresholdkey reads exactspecdomain/range. V9productionbump+existinganimation unchanged; donut/time-map remain separate approval candidates.

Actual existingChatGPTbuilt-inbrowser1280/390 checks completed for changedfigures and candidate interactions. Versionbuttons on8charts,13saved immutable specs, currentlinks and2candidate links; V6switching/V4button/currentreturn/mobilecontrols tested. Freshproduction/viewerconsolewarn/error queries[]. Not an exhaustivefreshall13tooltips/visualregression claim. Full current evidence/limits:work/qa/studio_updates_2026_10_13/REPORT.md. Production13charts/4maps/9conservativeadvanced; data/order/quantitative scales unchanged. Use final reproduction sequence in REPORT including versionbuilder last; all future changes preserve/register pre-change versions first.

## V8 HISTORICAL PREVIEW ANNOTATION — 13 October 2026

User requests y-axis labels on the archived purple overview/detail view. Preserve the original snapshot and add a separately labelled 'Purple overview/detail — labelled overview axis' variant: lower y-axis title Employment (thousands), three ticks, no grid, shorter brush caption. Same19 observations, domains and brush. Production unchanged. Archive now14 saved specifications; historical originals remain recoverable.

## V5 LABEL ANNOTATION / V7 OPTIONS — 14 October 2026

Expand V5 y-axis jurisdiction abbreviations to full state/territory names using display-only labelExpr; retain original State_Code grouping/order, values, colour scale and missing treatment. Preserve pre-change V5 specification and add Compare versions navigation before applying this change. Narrow view retains existing internal heatmap scrolling. No x-axis/subdivision wording change requested.

V7 request is for three recommendations only: retain parallel coordinates with guided focus; consider linked four-measure small multiples in original units; consider interactive scatterplot matrix. No candidate implementation or promotion authorized yet. No invented timeline or automatic temporal animation for this single-year dataset.

V5 acceptance: actual existing built-in-browser normal793px and390px views inspected; full jurisdiction names render without truncation, narrow heatmap retains internal scrolling. Fresh normal-width warning/error query[]. Structural comparison against saved original confirms only y-axis labelExpr/limit/padding changed. V7 remains unchanged; options are recommendations. Reproduction: apply_v5_full_labels.py after older promotion scripts, followed by build_version_viewer.py. Archive now9charts/15saved specifications.

## V7 SEPARATE THREE-OPTION PREVIEW — 14 October 2026

User authorizes preview implementations only. Preserve production V7 unchanged and register its current parallel-coordinate spec in the version viewer. Build v7-preview.html with: (1) guided parallel coordinates plus selected original-value summary and restrained focus transition; (2) four coordinated dot panels in original units; (3) six pairwise scatter panels for four original measures. All use the same13 complete-case subdivisions from existing52-row validated V7 CSV. Two source subdivisions missing sales remain outside this comparison, explicitly disclosed. No new years, rates, imputation or quantitative transformation. External subdivision selection coordinates focus, never filters records. Tooltips show original units. Preserve context, amber focus; preview-only250ms emphasis/reduced-motion override where supported. Native Vega/Vega-Lite; desktop and390px built-in-browser review. Dense guided/matrix candidates may use declared internal horizontal scrolling. No promotion or advanced-count change until user chooses.

V7 preview acceptance: all3 options render in the existing built-in browser at1280/390; dropdown focus persists across designs and original-value summary verified for Food/Furniture. Dots stack on narrow screens; guided/matrix require explicitly disclosed internal scroll. Fresh warning/error logs[]. Rebuild exact; production V7 spec and validated CSV hash unchanged. Current version archive10charts/16specs. No promotion; details/limits in work/experiments/v7_options/QA.md. Recommend guided for continuity/advanced diversity, dots for mobile clarity; matrix remains denser.

## V9 ANIMATED COMPOSITION CANDIDATE — 14 October 2026

User authorizes a refined separate candidate and two rendered iterations, not promotion. Candidate question: How has manufacturing employment composition across all15 subdivisions changed over time? Title Manufacturing employment composition over time; subtitle Share of total manufacturing employment by subdivision,2006–07 to2024–25. Original Data1 source re-inspected:15 valid/nonnegative values for every19observed years,285records,0missing; shares sum100% within1e-8; maximum rounding difference from published total0.2thousand. Denominator remains sum15 actual subdivision values.

Build v9-donut-preview.html comparing current production bump spec against candidate. Preserve the earlier discrete donut preview/version. New build adds documented stable-code cumulative angles and rank among15(competition ranking), with exact original values unchanged. Candidate nativeVega arc geometry tweens via projection-independent angle signals for800ms and650ms hold, no autoplay/loop; target year/value/share are always observed values, exact tooltips disabled during morph. Manual slider pauses and jumps instantly. Pause snaps to exact displayed observed frame. Persistent subdivision selection follows its code; stable fill colour never changes with rank/focus (amber outline/background only), moderate context fade. All15 current-year summary entries sorted by employment, swatches keyed to fixed code. At most one current-largest annotation. Click/tap selected details fallback available. Reducedmotion disables timed playback/tween, manual controls remain. Mobile donut fits; summary stacks; no category omitted or Other invented.

Production V9 remains bump until explicit approval. Losing rank trajectories/top10 cross-year comparison is a tradeoff; donut plus animation is not conservatively advanced, so promotion would reduce clearly advanced count9→8. Existing charts/order/data untouched.

V9 Render1 confirmed issues before Render2: centre text used default left alignment and could cross the hole; mobile resize measured the old SVG intrinsic width, so the donut was clipped. Fix centre alignment, clear the old SVG before measuring, use minmax(0,1fr)/min-width0 in mobile composition. Separate similar muted palette tones by hue only; fixed code-to-colour mapping retained. No value, angle proportion or grouping change.

V9 comparison-resize check found candidate measured width0 while hidden behind the bump baseline. Defer hidden candidate rendering and re-render when switching back, retaining selected code/year. This preview-only lifecycle fix follows the observed blank donut after desktop/mobile comparison switching.

V9 refined candidate acceptance: Render1+Render2 inspected in existing built-in browser at1280/390. Corrected centre/mobilenativeSVG and comparison-hidden-width issues verified. Food slice click exact tooltip (206.5thousand,20.54%,2006–07,rank1), Petroleum persistent selection through playback/finalyear (3.6thousand,0.40%,rank15), sliderpause/year17→18auto-stop, all15summary and current-bump comparison tested. Freshconsolewarn/error[]. Repeatbuild exact; rawworkbook/productionV9 hashes unchanged. Reducedmotion handlers implemented, OS toggle not manually exercised. Recommendation PROMOTE ANIMATED DONUT for newcompositionquestion, subject to explicit approval and conservative advanced-count tradeoff9→8. Production stillbump; no promotion. Full report work/experiments/v9_animated/REPORT.md.

Final manual-slider test confirmed playback pauses, but its status line retained the preceding year. Fix the instant-jump status to the newly displayed observed year; Reset uses the same path. Values/geometry remain exact.

## V9 EXTERNAL-LABEL CANDIDATE — 14 October 2026

User requests replacing the large right-side composition list with external labels. Preserve prior list candidate at v9-donut-list-preview.html and expose comparison link. New candidate directly labels largest8 subdivisions per observed year on desktop and largest2 on narrow screens; retain all15 slices and unchanged values/angles/palette/800ms playback logic. Use validated short labels with manufacturing context/full-name tooltips. Leader paths start at tweened slice midpoint, extend radially and connect via a short horizontal end segment. Per-side constrained label slots enforce spacing; positions interpolate on the existing transitionT, side changes only when a slice midpoint crosses the actual hemisphere. Current percentages remain exact observed-year values. Centre unchanged. Remove the aside/list; compact optional industry selector accesses all15/small slices without a static legend. Two actual built-in-browser rendered iterations required before acceptance; production unchanged.

V9 label Render1: desktop external labels/leader lines readable; mobile Machinery equip. label clipped and total text crossed centre hole. Render2 wraps mobile category names, moves label anchors10px inward, gives centre a larger relative hole with14px total/22px year, shortens mobile chart height to340 and makes selected detail compact. Desktop label font13px. All15 angles/values/colours and playback unchanged.

V9 label acceptance: two actual built-in-browser iterations1280/390; final desktop8/mobile2 direct labels, no observed label overlap/clipping or page overflow in inspected views. Same15 slices/285values, palette/tooltip equality and unchanged stop/move/play function source verified. All19 target layouts satisfy per-side spacing. Leaders/labels share existingtween, exact percentages; current-top membership may change, hemisphere crossings cause necessary side changes. Food mobile tooltip2016–17 verified215.2thousand/25.92%/rank1. Freshconsole[]. Previous list route preserved; production remainsbump. Details and limits: work/experiments/v9_animated/LABEL_QA.md. Reproduction runs build_v9_labels.py after build_v9_animated.py.

## V9 ALL LABELS / DESCENDING CLOCKWISE ORDER — 14 October2026

User supersedes previous8desktop/2mobile label limit and fixed-code angular order. Directly label all15 subdivisions. Within each observed year, clockwise from12o'clock sort descending share/employment, break ties by ANZSIC code; stable colour remains keyed to code. Maintain original values/share/rank and complete15 composition. Per-side labels use .13-radius minimum gap for dense small-slice side. Mobile uses an explicitly scrollable1000px internal chart to preserve full15 legible external labels rather than tiny text/page overflow. Preserve limited-label candidate at v9-donut-limited-labels.html.

Ranking changes reorder angular positions: ordinary keyed angle morph can create overlapping/gapped slices. On reordered frames, use800ms fade-out of exact previous geometry/fade-in of exact target geometry at invisible midpoint; unchanged-order frames retain existing geometry tween. Controls/year timing/measurement text unchanged. Leaders/labels use the same phase/fade. This necessary animation adaptation is explicitly documented, no invented intermediate measurement.

V9 all-label acceptance: built-in-browser1280 inspection showsall15 labels/readable leaderlines and descendingclockwise sizes; playback/pause checked through2015–16.390px internal horizontal chartscroll tested natively; no observed page-level overflow. Freshconsole[]. All19 targetlayouts validate15 labels, descendingangles/.13gap; originalvalue/share/rank fields, palette andtooltip unchanged; rebuildexact. Priorlimitedlabels recoverable. Full details work/experiments/v9_animated/ALL_LABELS_QA.md. Productionstillbump, no promotion.

## V9 BAR-RACE / V12 ISOTYPE PREVIEWS — 14 October2026

User authorizes separate previews, not promotion. V9 bar-race uses unchanged original ABS dataset/all15×19=285valid values. New question combines employment size and ranking over observed years. Stable code palette matches donut; nativeVega lengths and deterministic sorted positions tween850ms/350ms hold, original-year labels/tooltips only, global0..260thousand scale; competition rank handles ties, code breaks display-order ties. Play/Pause/Reset/slider, persistent code selection, moderate fading, no autoplay/loop; reducedmotion instant manual updates. Mobile stacked rank/name above each bar with readable labels rather than shrinking desktop layout. Bump/donut/race comparison routes remain separate; race is BASIC, no count inflation.

V12 candidate uses unchanged4 RoyMorgan/AustralianMade March2025 findings:73/67/63/84. Four independent shopping-bag ISOTYPE rows,20icons=100%,1fullbody=5percentagepoints; partial rectangular body width expresses remainder exactly. Same primarypurple as existingV12, neutralgrey remainder, amberfocusoutline only. Handle is consistent decorative outline, body carries quantitative fraction. Desktop statement/icons/exactpercentage aligned; mobile statement/percentage then10+10icons. Fullwording/period/source/qualifier/independent-attitude caveat in hover/tap details. One verified84% conditional-likelihood annotation; not a funnel/purchase outcome. ISOTYPE is advanced candidate subject to tutor judgement. Current dot retained for comparison. Two actual built-in-browser iterations1280/390 for each candidate; production/data/order/scales untouched.

Race/ISOTYPE Render1 inspected1280/390. Race layout works, strengthen name/value font to13px and bar heights for readability. ISOTYPE mobile20-in-line icons too small and percentage flowed below icons: Render2 uses10+10 bags with percentage explicitly beside statement. Keep exact body fractions; add tap-detail fallback/tooltip dismissal. Remove implementation phrase 'source wording retained' from display qualifier only, retaining original source wording/data. Product spacing polished; no encoding/data change.

Race Render2 playback found a stale Vega tooltip from an earlier year remaining visible after the target year advanced. Clear the public view tooltip handler at frame changes and Pause/Reset; do not change tooltip values. This confirmed details-on-demand correctness fix is candidate-only.

Race/ISOTYPE acceptance: two actual built-in-browser iterations1280/390 each; race plays/stops/reset/sliderpause, Machinery selected across2→3 ranks, mobile original-values labels readable. Public tooltip clear added for confirmed stale-year popup. ISOTYPE20desktop/10+10mobile, exact fractions/all4statements and73%rowclick/84%hover details checked. Bump/dot baselines loaded; currentdonut comparison linked. Freshconsole[]. Rebuildexact and productionV9/V12/surveyhashes unchanged. Recommendation PROMOTE BAR RACE / PROMOTE ISOTYPE pending explicit approval; race BASIC, ISOTYPE advancedcandidate subjecttotutor. Productionstillbump/dot, countunchanged. Limits/report:work/experiments/race_isotype/REPORT.md.

## V9 BAR-RACE HUE PALETTE — 14 October2026

User accepts the bar-race direction and requests a categorical hue palette avoiding red and green; this authorizes candidate colour refinement, not production promotion. Use15 stable code-keyed hues within blue/cyan/violet/gold families; no employment/rank ordering encoded by lightness. Amber remains selection outline. Preserve previous palette/spec/page with comparison button. Data, scale, positions, timing and tooltips unchanged; V12 unchanged. Palette source race_palette.json used reproducibly by build_race_isotype.py.

V9 hue-palette acceptance: existing built-in-browser desktop1280/mobile390 inspected; blue/cyan/violet/gold bars and dark value labels readable, freshconsole[]. Deep spec comparison proves only category-colour range changed; dataset/timing/quantitative scale/tooltip unchanged; repeatbuild exact. Previous palette route/button retained. No production promotion; V12 unchanged.

## V9 BRIGHTER HUE PALETTE — 14 October2026

User requests brighter bar-race candidate colours. Increase saturation/brightness within the same blue/cyan/violet/yellow hue families; no red/green, no quantitative lightness ordering.15 colours remain code-keyed across19years; amber outline stays focus. Preserve just-replaced muted hue spec/page and existing earlier palette link. Only categorical range changes; production/data/animation/scales/tooltips unchanged. Native built-in-browser colour check required.

Brighter V9 palette acceptance: actual built-in-browser1280/390 views inspected, labels readable and blue/cyan/violet/yellow hue distinction stronger, fresh desktopconsole[]. Deep comparison confirms only categorical range changed. Previous muted and earliest palettes remain linked. Production/data/scales/animation unchanged.

## V9 CATEGORY SEPARATION REFINEMENT — 14 October2026

User requests stronger perceptual separation and balanced visual weight. Retain no-red/no-green constraint, stable nominal code mapping. Screen15-colour candidates in cyan/blue/violet/magenta/gold families using closest-pair CIELAB76 distance; reject pairs close in both hue(<12degrees) and lightness(<9L). Constrain L roughly52..77, avoiding previous very pale yellows. Quantitative size/rank never determines colour. This is an approximate palette screening, not colour-vision/accessibility proof. Preserve just-replaced bright palette route/spec. Only colour range changes; production/animation/data/scale/tooltips unchanged. Native rendered inspection required.

Rendered separation review: three gold candidates read olive on the light page. Shift these to warmer gold (hueabout38–41), retaining12L spacing between them and balanced overall lightness; no red/green, no exact focusamber reused. Recompute screening metrics from rounded finalRGB values. This colour-only correction responds to actual built-in render.

V9 separation acceptance: actual built-in desktop1280/mobile390 reviewed; final warmergold avoids olive appearance, label readability retained, freshconsole[]. Final closest-pair approximateCIELAB76 screening6.25→15.85, finalL52..78. Categorycolourrange is sole specdifference; rebuild exact, values/scales/tooltips/animation and production unchanged. Prior bright/muted/earliest palettes linked. Method/metrics in palette_separation.json and PALETTE_QA.md.

## V12 ICON PREFERENCE SWITCHER — 14 October2026

User authorizes only V12 ISOTYPE candidate preference control. Person default, Bag existing design retained exactly, Cart simple shopping silhouette; no factory/map icon. Native labelled Person/Bag/Cart buttons, aria-pressed, visiblefocus,44pxtargets, no reload. Update80SVG icons only; keep row nodes/active state/details and allfour unchanged data records. Dynamic unit explanation exactly20 symbols=100%,1symbol=5percentagepoints of respondents, not individual people or observed purchases.

Same bounds24×28/baseline/purplefilled/greyremainder. Existing bag rectangular body fractionalwidth remains. Person/head/body and cart/basket/wheels are clipped using a calculated cutoff whose filled silhouette area equals source fraction (binary search of rectangle/circle/polygon area), avoiding arbitrary rounding from different shapes. Consistent decorative outlines/handles do not encode quantity. All20icons perrow, unchanged14.6/13.4/12.6/16.8 icon-equivalents. Keep desktop20/mobile10+10 layout and original tooltips. Preserve bag-only candidate route beforeedit. Actualbuilt-inbrowser1280/390 tests all3 styles and rowselectionrequired. V9/production/data unchanged.

V12 switcher acceptance: all3 styles inspected inexistingbuilt-inbrowser1280/390; nativebuttons/pressedstate/unittext and73%rowselection/details persistence verified. All12style×percent computations exact within1e-8; existingBaggeometry retained andtooltipcontentfunctionunchanged. Freshconsole[]. Existingtab5closed; reusedexistingtab8, noalternativebrowser. Nativekeyboardbuttons implemented, physicalkeyboard/touch notmanuallytested. ProductionV9/V12/surveyhashesunchanged. Report/validation work/qa/v12_icon_switch/. OnlyV12candidate/UIreferencePLAN changed.

## V12 ROUNDED PERSON ICON — 14 October2026

Replace only the candidate's blocky full-body Person with a rounded gender-neutral head-and-shoulders silhouette. Person remains default; preserve existing Bag and Cart options, row selection, layout, tooltips and percentages. Preserve previous person version with a navigation link before editing. Recalculate shape-area clipping for the new head circle and semicircular shoulders plus rectangular base, so partial fills remain exact. Basket and product-box are suggestions only, not implemented new options. Built-in-browser desktop/mobile checks required; production unchanged.

Rounded-person implementation: previous person helper/page preserved and linked. All12 shape×percentage cases validated within1e-8;73/67/63/84 unchanged. New silhouette uses4-radius head and9-radius semicircular shoulders with rectangular base; matching area calculation preserves exact clipping. Rendered QA pending: existing built-in tab8 found but reload and debugger synchronization timed out. No alternative browser used; desktop/mobile appearance not claimed verified.

## V12 MULTIPLE PERSON STYLES — 14 October2026

Add two person alternatives to the candidate: Classic full-body and Slim full-body, alongside current rounded Avatar (default). Retain Bag/Cart. Native labelled buttons reuse existing accessibility/focus and row-preserving switching. All person variants mean respondent percentage points; no demographic identity implied. Same20icons/exact73,67,63,84 and existing tooltips/layout. Match silhouette clipping to each shape's analytical area. Preserve current rounded-person page/helper before edit. Built-in-browser QA only; no production promotion.

Multiple-person acceptance: existing built-in-browser tab8 reload succeeded. Classic/Slim native switching verified with pressed states; allthree person styles visually inspected at390px, Classic/Slim at normal1166px and Avatar at1280px. Mobile controls wrap, icons10+10, allfour percentage rows visible after scroll, no observed page overflow;84% tooltip source/period/caveat rendered. All20style×percentage cases exact within1e-8. Previous choices preserved/linked; Avatar left selected and viewport restored. No fresh console query available through this native wrapper; no console-clear claim. Only candidate presentation andPLAN changed; production unmodified.

## V9 HARMONIOUS QUALITATIVE PALETTE — 14 October2026

Respond to annotated candidate: replace disproportionately bright magenta and repeated similar blues/violets with15 stable code-keyed cyan/blue/violet/mauve/warmgold colours. Retain earlier no-red/no-green constraint. Approximate CIELAB screening balances chroma28..52 and lightness50..78; maximise closest-pair distance rather than saturation. Colour remains nominal identity; rank/size do not drive it. Amber selection outline unchanged. Preserve current separated palette/spec/page and add Previous separated palette link before edit. Update reproducible race_palette.json and rebuild; verify spec differs only in colour range, data/production hashes unchanged. Actual built-in-browser review atdesktop/mobile required. No production promotion.

V9 harmonious-palette acceptance: actual existing built-in-browser tab9 inspected at normal1166,1280 and390px; all15 bars reviewed by scroll, no observed page overflow. First/final year slider and persistent Machinery selection rank2→3 verified with stable mauve. Fresh warning/error logs[]. Previous separated palette linked; viewport restored. Sole spec change categorical colour range, rebuilt data/validation identical. Approximate minimumCIELAB76 distance15.85→17.07 with chroma28..52; improved balance is not colour-blind certification. Metrics/code mapping palette_harmony.json. Production unchanged, no promotion.

## V9 TARGETED PAIR SEPARATION / YEAR INSET — 14 October2026

User explicitly retains current palette direction. Adjust only named similar groups: Basic chemicals/Beverage-tobacco; Wood/Polymer-rubber/Primary metals; Non-metal minerals/Furniture-other. Keep other8 subdivision colours unchanged, same fixed code mapping over19years, no red/green and amberfocus unchanged. Preserve harmonious version/page before edit. Give year text explicit top baseline and inset16pxright/8pxtop; shift axis header20pxdown to keep a dedicated year row without clipping or collision. Bars/scale/data/timing/tooltips unchanged. Update reproducible build source before rebuilding; desktop/mobile built-in browser checks required. Production not promoted.

Targeted V9 implementation complete: only7 named colours plus year top baseline/insets and axis header spacing changed. All5 named pair distances increased in approximateCIELAB76 screening; other8 colours unchanged. Race/year/isotype/validation rebuild byte-identical; scales/timing/tooltips unchanged. Previous harmonious version linked. New rendered desktop/mobile acceptance pending: tab9 reload timed out, then existing-tab debugger synchronization timed out; no fallback browser. Pre-change rendered review completed, no post-change visual/console pass claimed. Metrics palette_targeted.json.

Targeted V9 rendered acceptance completed on retry: existing built-in-browser tab9 accessible, inspected at1280/390. Named colour pairs visibly separated while overall palette direction retained; year2024–25 fully within chart with clear top/right inset and no axis-title collision atboth widths. All15 mobilebars reviewed byscroll, no observed page-level overflow. Manual first/final-year selection and mobile playback2007–08→2012–13/Pause checked; stable category hues retained. Fresh warning/errorlogs[]. Normal viewport restored. No further styling/data edits during retry; production unmodified. This supersedes the preceding pending-browser acceptance note.

## V5 SELECTABLE MATRIX / V8 FOCUS-CONTEXT POLISH — 14 October2026

Scope onlyV5/V8; preserve source datasets/order/13charts/all other specs and interactions. Snapshot both current specs and provide previous-version links before edit. References: officialVega-Lite SelectableHeatmap (pointselection/conditionalstroke+opacity) and OverviewAndDetail (intervalbrush/detailtime-domain), adapted to existingv5 runtime; consistent with Studio-linked patterns, not a claim of additional lecture content.

V5 overview120cells/111reported/9suppressed. Nativepoint selection oncell; hoveroutline+tooltip. Persistentcell sets State/Subdivision focus; rowORcolumn retains opacity1, unrelated cells .45, selectedintersectionamberoutline. Native labelled44px selects provide accessible row/column selection rather than fragileaxis hacks. Detail below shows exactshare/employment/June2025 or explicitunavailable, no rank claims with suppression. Reset clears focus/detail. No recordfilter. Quantitative distribution: min0.07891%,Q1=2.89985%,median4.54347%,Q3=9.62944%,max37.44966%; bins0–5/5–10/10–15/15–20/20–25/25–30/>=30 have62/22/15/4/2/5/1 reportedcells. Replace old0..30linearblue ramp with fixedcontinuous piecewise sequentialblue knots0/3/6/10/20/40, giving common lowshares discrimination and keepinghighvalues. Not discretebins/quantiles; no values removed. OneoutsideannotationTasmaniaFood37.45%,7439people. Missingneutralgrey, realzero distinct.

V8 retain19observedannualvalues/nativevconcat line+area/zero0..1100y-domain and overviewcontext. A tighter~800..1050focusdomain would amplify movement and makefilledarea baseline interpretation weaker; rejected. Brush translucentamberfill/outline; dynamicperiod feedback gives observedfinancial-year bounds, handlesempty-observationwindowexplicitly. Add nativeStart/Endyear selects as keyboard/tapbrushalternative. Keeptwo verifiedannotations:2019–20low830.2k/latest2024–25900.8k; mobileadjustlabelplacementif needed. Observedpointclick plus Inspectyearselect provides exactdetails. Resetclearsbrush, restoresfeedback/domain,annotations; no interpolatedvalues. No new animation. Existingcaveats/sources retained.

Bothcharts require Render1→review→revision→Render2 in existingbuilt-inbrowser1280/390, all13quickrender regression/freshconsole. Datahashes/rebuild checks beforeacceptance.

Render1 nativebrowser: V5cellclickVictoriaFood27.85%/70297people selectsintersection,row/column andtooltip correctly; native row/columncontrolswork. Improve tinyxlabels10→11px and crowded lowlegendticksuse0/5/10/20/40 withoutchangingpiecewise colourknots. V8 From2018–19/To2020–21 updates3observed-yearcue/domain butexternalstorewritesleavevisualbrushabsent; shortfocus repeatsyearlabels atmonthticks. Render2 fix: compile onlyV8 with existingVega-Lite5 and expose two nativeparameter signals to generatedbrush_x event stream, using existing overviewxscale; controls/reset updatevisualbrush andnormalnativebrushstore together. No private runtime access. Set annualminimumtickspacing; putminimumannotationbelowline toseparateitfromlatest onmobile. Keepzeroaxis/allvalues. Pinnedcompiler adaptation requireschecks afterlibraryupgrade.

Render2 V8 brush now correctlyoutlined/filledfromcontrols. Temporal tickMinStep didnotpreventmonthticks; use nativecalendar-year tickCount expression (1yearstep forrange<6years,5yearstep forfullhistory) instead. Displayonly; domain/values unchanged.

Long-pageviewport overrides produced blankbuilt-in captures although nativeAX/controlactions worked; normalviewport renders recovered. Add V5/V8-only reviewroute from exactproductionarticlemarkup/live specs/sharedcontrols/styles to permit same-browser responsive inspection without long-pagecapturefailure. This is testfixture, not newproductionchart oralternativebrowser. Add nativepoint nearestselection for reliabletapdetails; exactobservedyearonly. Fullpage390captureacceptance remains separate.

Mobile reviewfixture confirmsV8canvas/endpointlabel clipping with old52pxaxis allowance. Increase onlyV8 mobileaxis allowance to90px (minimumplot180), usecompactminimumlabel/rightalignment; samequantitative domains/sourcevalues. Mainpage andfixture useidentical sizing; no CSS hidingoverflow.

FinalV8detailcheck: nearestnativechartclickselects2015–16/837.3k correctly, buttooltip persists afterbrush2018–19..2020–21. ClearpublicVega tooltiphandleronbrushfeedbackchanges; retainedinspector detailoutsidebrushmustexplicitlystateoutsidecurrentfocus. Exacttooltipvalues/content retained. ConfirmedV8-onlydetailscorrectnessfix; recheckrequired.

Supporting-range date audit: ISOsource YYYY-MM-DD parsesasUTC, while appendingT00:00:00 usedlocaltime andcouldshift controlbounds bytimezone. Normalize UIstamp to explicitUTC midnight matchingoriginalVega sourceparse. This is controlrange correctness only; no source date/value changed. Recheck3observed-yearwindow andreset.

V5/V8 acceptance: multipleactualbuilt-inbrowseriterations completed. V5nativecell/row/columnfocus/reset,27.85%VictoriaFood70297people,missingWA Pulp/paper verified. V8nativebrush/controlrange3observedyears,nearestclick837.3k2015–16,reset+keyboardEnter,UTCbounds,annotations andoutside-focus detail verified.1280/390 responsiveinspection used liveV5/V8reviewroute (sameproductionmarkup/specs/styles/controls) dueintermittentblanklong-pageoverride/anchorcaptures; normalfullstoryquickscroll/13charthostsconfirmed. Noobservedoverflowinreviewroutes; fullstory390visualacceptanceremainslimited. Physicaltouch nottested; mobilebrushdragattemptnotconfirmed,From/Tokeyboard/tapalternativeworks. Freshnativeconsolewarn/error[].50othertrackedfileshashunchanged;V5all120cells/V8all19valuesunchanged. DetailedQA/limits/exactfiles:work/qa/v5_v8_polish/REPORT.md.

## V8 FULL FINANCIAL-YEAR DISPLAY — 14 October2026

Display-only request: V8controloptionlabels,selectedperiod/detailtext,tooltips,annotations,deck/caveat/sourceyearwording useYYYY–YYYY. RenameFrom/To toStart financialyear/End financialyear. Retaincompactsinglecalendar-year axisticks. PreserveoriginalFinancial_Yearfield/Date/Year_Order/indexvalues/selectionfields/UTCparsing/nativebrushlogic/all19observations. Addderivedpresentation-onlyFinancial_Year_Display fortooltip; UIformatterexpandstwo-digitendingyearonly. Preservepre-changespecandcontrolsupportsnapshot beforeedit; previousdesignlinks remainhistorical. V5/allothercharts untouched.

V8full-yearstaticacceptance: all19UIformatteroutputs matchoriginalDateyear; all livedatahashes unchanged. Specdifference limitedto display-only Financial_Year_Display, tooltipfield andannotationwording. V5supportfunction/range-applicationcode unchanged; sourcefinancial-year selectionfield staysabbreviated internally. Compactcalendar-yearaxisticks retained. RenderedQA notperformed: built-inbrowserinventory has0tabs, nofallback. CurrentHTML/app/support/spec/reviewroute updated; historicalsavedversions intentionallyretainoriginalwording.

## V12 VERSION / CANDIDATE NAVIGATION — 14 October2026

Confirmedomission: productionV12headinghadnoCompareversionslink,andversionmanifest/builderhadno12entry. Add V12historybutton usingexistingversionsviewer plusdirectPreviewISOTYPEbutton. Archive originaldot spec unchanged; linkcurrentISOTYPEcandidate includingAvatar/Classic/Slim/Bag/Cart. Candidate'sexistingpreviousiconlinksretainearlierdesignaccess. Register12inbuilder sofutureversionnavigation rebuildkeepsentry. No chart/data/idiom/style/interactionpromotion. Browserverificationpendingbecauselastbuilt-inreconnection wassecurity-policyblocked; no workaround orotherbrowser.

## V5 LUMINANCE REFINEMENT COMPARISON — 14 October2026

User requests sequentialblue refinement only; no categorical/diverging values, missingneutralgrey, activeamberoutline unchanged. Clarificationbeforeimplementation: actualcurrentcolourknots0/3/6/10/20/40, while legendticks0/5/10/20/40. Prepare separatecurrent/candidate comparison; proposedfixedcontinuousknots0/5/10/20/40 with #EEF4FA/#C9DCEC/#91B5D3/#4F83B1/#1F4E79. Nomagnitude/grouping/denominator/value change. All120cells/111reported/9missing, selection/tooltip/caveat unchanged. Verifydecreasingrelative luminance. PreservecurrentV5snapshot; productionpalette remainsunchanged untilactualbuilt-inrendercomparisonaccepted. Add previewnavigation only. Lastbuilt-inreconnectsecurityblocked; noalternatebrowser/workaround, renderedacceptancepending.

## V1 LEGEND CLASS HIGHLIGHT — 14 October2026

ScopeonlyV1. Convert7existingHTMLlegendclassentriesintonativeclick/tap/keyboardbuttons,oneactiveclass;clicksamebuttontogglesoff,Showallclears. NativeVega-Lite selectedRateClass parameter controlsvalidgeoshapefill: selected retainsunchangedthresholdorange,other validregions#E6E8EB,neverfiltered. Existingmissinggrey#e4e8ec retainedinoverview; whileclassactive use distinctdarkerneutral#BCC4CC andmatchmissingkey. Existingthresholdboundaries usedexactly (equalitygoestohigherclass,matchingthresholdscale),displaygroupRate_Class only. Tooltips unchangedforallregions; selectedclasshoverstrongeramberoutline. Counts derivedonlyfromunchangedvalidCSVrecords give sparseclassfeedback. Mapprojection/nativezoom/pan code/scales untouched. PreserveoriginalV1specandsourcehashes;previousversionnavigationretained. AddinstructionSelectacolourrangetohighlightmatchingSA2s. Built-in1280/390QArequired; priorbrowsersecurity-policyblocklimitsrenderedacceptance,noalternatebrowser/workaround.

V1hovercascadecheck: existingCSSforcedeveryhoverto1.2px, overridingnewnative3pxselected-classhover. RemoveonlythatV1CSSstroke-width override; nativeVega nowcontrols1.25pxnormal/3pxselectedhover. OtherchartCSSunchanged. Staticdataflow verifies2418valid/55missing,classes605/604/604/363/121/96/25,all7signals andresetretaineveryrecord.

V1delivery: legendnativebuttons/oneclass toggle/Showall/livecounts,missingkeytone andconditionalmapfillimplemented. Compile/parse/staticdataflowpass; allsourcefiles/othercharts/navigationunchanged. Rendereddesktop1280/mobile390/sparseclassvisibility/zoom-pan/overflow/browserconsoleacceptanceNOTclaimed: previousbuilt-inbrowserreconnectsecurityblocked, no workaround/fallback. ImplementationawaitsrenderedQA. Files:index.html,app.js,styles.css(V1hoverruleonly),work/map1.vg.json;newv1-class-highlight.js/css andwork/qa/v1_class_highlight snapshots/counts/validation.


## V1 TOOLTIP LEADER LINE — 14 October 2026

Scope only V1 tooltip presentation. Preserve every map/data/spec/threshold/colour/projection/navigation/legend and tooltip-content field. Wrap the existing public Vega tooltip handler for V1 only; retain its formatting. A fixed, pointer-transparent, aria-hidden SVG draws a 1.25px neutral navy connector from the nearest tooltip edge to the actual rendered polygon. Prefer its screen-space bounding-box centre only when SVG isPointInFill confirms it is inside the polygon and visible; otherwise use the actual hit-tested pointer position, retaining local SVG coordinates for zoom/pan updates. This is a visual anchor derived from existing projected geometry, not invented geography. Clamp nearby tooltip placement to viewport, avoid covering the anchor. Mouseleave clears immediately; touch tap pins the same tooltip and outline, another tap changes target, outside tap/reset dismisses. Recompute anchor/line after native map signal changes and scroll; never alter navigation signals. All tooltip data remain in existing text. Cleanup on chart rebuild. Built-in-browser desktop/mobile/dense-east-coast/inland/Tasmania/zoom checks required; do not claim unperformed QA.

V1 leader-line implementation: new scoped v1-tooltip-leader.js/css; only V1 setup/cleanup hooks in app.js and asset references in index.html. First built-in render exposed a tooltip callback mismatch; corrected to official Vega public signature (handler,event,item,value), preserving the original handler arguments and values. Public tooltip setter is followed by runAsync because it resets the renderer. Pointer anchoring uses rendered SVG geometry, touch selection rejects drag gestures, connector updates are requestAnimationFrame-coalesced. Syntax checks pass; map1 spec/data/navigation/legend code unchanged. Corrected Render2 could not be inspected: reload timed out and the same built-in browser subsequently reported unavailable. Desktop1280/mobile390/east-coast/inland/Tasmania/zoom-pan/touch/overflow final acceptance and fresh final console checks remain pending. No fallback browser used. Status: IMPLEMENTED, NEEDS RENDERED QA.


## V1 PERFORMANCE — 14 October 2026

User authorizes V1 lag diagnosis and targeted performance improvement. Preserve all geography/source values/spec colour classes/tooltip fields and interaction meanings, SVG renderer and every other visualisation. Current projection fits all boundary coordinates again whenever zoom/pan extent changes. Optimise only V1: a stable native Vega base Mercator projection fits existing mainland/all-region data once per size/extent change; displayed Mercator uses native geoScale/geoTranslate expressions to apply the same zoom/pan affine transformation. No simplification, precision reduction, filtering, geometry removal or new library. Verify projected coordinates against old fit model at representative zoom/pan/full-region states before promotion. Keep old navigation/spec snapshots. Add opt-in ?v1perf=1 diagnostics around V1 public runAsync for actual in-page elapsed time, not automation timing. Further changes require measured justification; other charts/loading behaviour remains unchanged in this batch. Built-in browser is sole rendered QA surface.

Compatibility adjustment before final implementation: installed Vega5 does not recognise current-documentation geoTranslate. Use its existing scale(name,[longitude,latitude]) projection expression instead: Mercator [0,0] gives translation, and x-distance [0,0]→[1,0] gives scale×π/180. This applies only to current default-centred/unrotated V1 Mercator; validate old/new projected positions, including full-region extent, before browser reload. Baseline in-page runAsync samples1296.3ms/1186.6ms (not input-tool round trips).

Second performance step justified by measured remaining863–1070ms redraw: keep cached native fit but also materialise projected SVG path strings using native Vega geopath data transform, once per geographic extent/size. V1 internal renderer marks become native path marks (same choropleth idiom/polygons/labels/values) with x/y and scaleX/scaleY signals applying exact viewport affine zoom/pan. Vega SVG path renderer uses non-scaling-stroke, preserving outline widths. All original geographic source coordinates retained; no boundary simplification. Projection/transform equivalence remains checked. This avoids reserialising every polygon's vertices on each gesture; native Vega signals and SVG hit testing remain.

Final decision: REJECT the cached-geopath/path-mark experiment. Live redraw measured2792.4ms, worse than baseline, so remove the runtime path conversion entirely. Retain only stable native Mercator fit optimisation, previously measured862.9/1070.2ms vs baseline1296.3/1186.6ms at same normal browser width. Final V1 still uses original native geoshape/SVG marks; no change to geometry resampling, projection precision or rendering idiom. Timings are two live runAsync samples per version, not a statistical benchmark or proof of smoothness. Remaining SVG redraw cost is a known limitation.

V1 performance acceptance: actual existing built-in-browser live page measured baseline1296.3/1186.6ms and retained cached-fit862.9/1070.2ms, roughly22% lower mean across onlytwo samples. Final pan-right848.7ms andreset786.2ms; sparsehighestclass25matchingSA2s verified. Freshcaptured warning/errorlogs[].51data/spec hashesunchanged. Coordinate equivalence across32size-independent mainland/all-region zoom/pan states within2.254e-10px;2418valid/55missing. Rendered checks atnormalbrowserwidth only; mobile/finaltooltip-connector acceptance and compositorFPS are not claimed. Page loading strategy/othercharts unchanged. Retained files: interactions.js(V1branch only),app.js(V1opt-in timinghook),index.html(assetversion/reference),newv1-performance.js,PLAN.md andwork/qa/v1_performance snapshots/reports. Status: READY WITH MINOR LIMITATION (noticeable residual SVG redraw cost).


## V1 HIGH-CONTRAST SEQUENTIAL PALETTE — 15 October 2026

User explicitly requests stronger contrast inspired by supplied light-to-dark reference, without copying its colours. This supersedes V1's prior orange styling only. Keep existing seven threshold classes and all source values/projection/geometry/zoom/pan/legend selection/tooltip fields. Use ordered ice/cyan/blue/navy with strictly decreasing luminance: #F1F5F9, #C7E4EB, #83C8D6, #3D9CB8, #22749D, #185078, #102E55. Higher class always darker; no rainbow, no diverging interpretation. Missing/context grey and amber active outline unchanged. Update map range and HTML legend from same fixed seven colours. Archive immediate previous orange spec in Compare versions before edit. Actual built-in rendered comparison required; other charts untouched.

V1 contrast implementation/static validation complete: map colour range and HTML legend share the seven new colours; relative luminance0.908/0.736/0.510/0.282/0.153/0.073/0.027 strictly decreases. Deep spec comparison shows colour range is the only spec difference;2418valid/55missing/class counts605/604/604/363/121/96/25 unchanged, all seven class selections/reset accepted without removing records. Immediate previous orange spec registered in Compare versions; other version entries unchanged. Native browser reload reported stale tab, existing built-in tab inventory thenempty; no rendered/console acceptance claimed, no fallback browser. Status: IMPLEMENTED, RENDERED COMPARISON PENDING.


## V1 CONTRAST + SLIDER COMPARISON CANDIDATE — 15 October 2026

Preview only, not production promotion. User requests stronger class contrast and a zoom scale/slider instead of +/− and directional buttons; retain deliberate drag. Build v1-contrast-zoom-preview.html comparing current V1 against separate candidate using a single full-width view toggle and both palette strips, avoiding two crowded small maps. Candidate colours #F6F1DE/#C9DBC5/#86BCBB/#4795B1/#286B9A/#254573/#191E43: restrained warm-light to teal/blue/navy ordered luminance, higher values darker. Preserve seven thresholds/all data/geo/projection/hover/tooltips/legend class semantics. Candidate: labelled native range1–12×, explicit Enable drag, Reset map view and All regions; remove +/− and up/down/left/right only within candidate. HTML range bridges existing native Vega mapZoom/mapPan signals; cached Mercator fit retained. Geographic projection zoom cannot use Vega-Lite Cartesian bind-scales; adapt using native projection scale/translate signals. Coalesce slider requests to latest value and serialize slider runs to avoid queuing every drag input. No new animation/library; touch scrolling remains normal until drag enabled. Current view retains existing buttons. Snapshot specs/data hashes; production files unchanged. Existing built-in browser only for desktop/mobile comparison.

V1 comparison preview rendered in existing built-in browser. Render1 oversized heading reduced; Render2 normal/1280/390 views inspected. Candidate palette materially distinguishes warm low classes from teal/blue high classes while luminance remains ordered; current/candidate both available through buttons and visible palette strips. Native slider3.0×desktop/2.0×mobile andreset1.0×verified; switchingCurrentrestoresoldnavigationbuttons. Mobilelegendwrapsbelowmap; no observedpageoverflow. Enable drag toggled on (visible in final screenshot), but gesture/verification call timed out, so drag displacement andphysicaltouch are not claimed tested. Browserreconnected; freshwarning/errorlogs[]; viewportreset andcandidateleftopen. Production/data/spec helper hashesunchanged. Filesnew: v1-contrast-zoom-preview.html/js, work/experiments/v1_contrast_zoom/current.vg.json/candidate.vg.json/validation.json; PLANupdated only. No production promotion. Status: PREVIEW READY WITH MINOR QA LIMITATION.


## V1 DIRECT GESTURE PREVIEW / NEW-VIEW GOVERNANCE — 15 October 2026

User's pasted clarification permits additional storytelling prototypes beyond existing V1–V13, including unused validated fields, additional available tables, authoritative new public sources and reproducible derived measures. This supersedes earlier blanket no-new-candidate restriction for prototypes, not production promotion. Every candidate must answer a new relevant question, have validated provenance/denominators and a justified WHERE→WHAT→CHANGE→CONNECTIONS→OUTWARD→PEOPLE narrative position; no rubric inflation or decorative additions. Production chart additions/replacements still require preview and explicit acceptance. Current implementation batch remains V1 only.

Adapt official Vega Zoomable World Map (https://vega.github.io/vega/examples/zoomable-world-map/) into current V1 comparison candidate: native wheel zoom with deltaMode-normalized factor, direct pointer drag enabled immediately, native copy(projection)/invert(cloned,xy()) gesture anchors. No Enable drag button and no directional/+− buttons in candidate. Keep labelled zoom slider as keyboard/touch alternative, plus reset/all-regions. Preserve north-up regional Mercator geometry and fitted base: unlike world example, do not rotate longitude/centre globe; reproject the inverse-derived drag anchors through the cloned projection to derive equivalent pixel translation. Native mapZoom/mapPan projection parameters retain current1–12limits. Throttle pointermove at32ms to reduce redundant updates, no new animation or library. Candidate-only CSS allows vertical page scroll on touch (touch-action:pan-y); horizontal touch drag can pan, desktop drag can pan in both directions. Cancelled touch gestures clear cloned/start/drag state. Originalproduction/currentcomparison remainunchanged. Strongerpalette/data/classes/tooltipcontent unchanged. Preview/browser checks required, including direct drag and wheel if exposed by built-in tooling; unperformedphysicaltouch not claimed.

Direct-gesture candidate implementation: preview-onlyv1-direct-pan.js pluscandidateHTML/JS changes. Vega5parse/dataflowpassed; inverse-derived synthetic50px/20px pointer displacement produces mapPan[50,20] within1e-12; panEnabledtrue bydefault;2418valid/55missing. Existingbuilt-inbrowser reloadinitiallytimedout, reconnectsucceeded: renderedcandidate shows slider/reset/all-regions only, noEnableDrag or directional/zoom buttons; map/palette/source/caveat visible. Native directdrag test then timedout at60s andresetcontrolruntime, so actualdrag displacement/wheelzoom/mobiletouch acceptance remainspending; noalternativebrowser. Production/datahashesunchanged. Status: IMPLEMENTED, GESTURE RENDERED QA PENDING.

Post-timeout built-in screenshot recovered: map visibly translated approximately70pxright/30pxdown compared with pre-gesture capture, matching the requested drag. This confirms direct drag produces movement without an enable button, but not smoothness/frame-rate. Freshwarning/errorlogs[]. Wheel zoom andphysicalmobiletouch remainnotmanuallyverified. Saved renderedproof /private/tmp/v1-direct-gesture-preview.png.


## V10 ACT DISPLAY EXCLUSION — 15 October 2026

User explicitly requests removing Australian Capital Territory from V10. This supersedes previous all-eight-plotted-origins requirement for display only. ACT has a valid2025 A$7,872,440 flow toUnitedArabEmirates; do not delete/source-zero that record. Filter ACT out of runtime flows and origins using native Vega transform.filter. Remove its origin marker/filter/connection choices; retain original sourceJSON82flows/8origins, truthful backgroundgeography including ACT and unchanged rate/width scales. Display81flows/7origins/25destinations, A$45,261,593,675; coverage85.205271%against unchanged originaleight-origin A$53,120,650,088 denominator; omitted A$7,859,056,413. Supportingdestination summary uses same displayed81flow basis; update coverage/source wording and All seven shown origins label. VisibleACTexclusionnote explains display choice, not zeroexports. Othercharts untouched; nativefilter/state/reset/tooltip/renderedQArequired.

V10 ACT exclusion acceptance: native Vega parse/dataflow passed (81 displayed flows, seven origins, NT retained); original flow/origin source hashes unchanged; spec comparison confirms only the two ACT display filters were added. Fresh built-in-browser reload confirmed ACT absent from the origin and connection controls, NT filtering and destination summary working, and restoration to all seven origins. Rendered map inspected at the current desktop viewport; console warning/error query returned no entries. Mobile and full-page regression were not rerun for this scoped exclusion.

## Standardised V1–V3 spec filenames — 15 October 2026

Rename current production specs using the same numbered, descriptive pattern as V4–V13: map1.vg.json → vis01_manufacturing_concentration_choropleth.vg.json, map2.vg.json → vis02_business_clusters_symbol_map.vg.json, map3.vg.json → vis03_npi_facility_dot_map.vg.json. Update live dashboard/preview references and scripts reading or writing production paths. Preserve historical snapshot filenames and audit hashes. DOM anchors map1/map2/map3 stay unchanged; no spec contents, data or interactions change.

Filename-change validation: all three renamed specs are byte-identical to their originals; app.js syntax and modified Python script syntax pass; every dashboard spec target exists. Remaining old-name script references intentionally read preserved historical snapshots. No rendered QA claimed for this filename-only task.

## V1 native navigation update — 15 October 2026

Production V1 only: adapt native Vega wheel and pointer signals from the official zoomable-world-map example, retaining north-up Mercator and cached responsive fitted base. Cmd OR Ctrl + wheel zoom uses deltaMode-normalised exponential factor, limits1–12; ordinary wheel remains page scrolling. View-centred zoom scales the current pan by the actual zoom ratio, avoiding jumps and ensuring continuity at limits. Native pointerdown stores pixel position/current mapPan; window pointermove translates by pixel displacement; pointerup/cancel stops drag. No rotation/centre changes. Simplify V1 toolbar to +, −, Reset, All regions; remove desktop directional and Enable drag buttons. Touch-action:pan-y lets vertical page scrolling remain native; horizontal touch dragging pans, +/− remain touch/keyboard alternatives. Reset restores zoom1/pan0/mainland+Tasmania fit while preserving selectedRateClass and analytical data. Existing tooltip/leader implementation, including its existing dismissal on outside/reset, stays unchanged. Responsive rebuild starts with fresh national fit. Do not clamp pan, preserving access to valid outlying geography via All regions. Native scale/translate projection formulas remain unchanged. Record browser and static QA separately; other visualisations unchanged.

V1 native navigation acceptance: native Vega5 compile/parse/dataflow passed; coordinated wheel-view updates preserve class selection; map spec/app.js/tooltip-leader/class helper byte-identical; shared map helper differs only by V1 dispatch. Built-in desktop1280 rendered +zoom1.6×, direct drag after zoom (about70px right/30px down), reset1× and ordinary page-scroll verified. Narrow390 +/−/reset and highest-class selection retained through zoom/reset verified; controls/instructions fit with no observed V1 overflow. All13 Vega chart containers present in fresh rendered tree; no chart-unavailable text, console warning/error query empty. Cmd/Ctrl modifier-wheel input cannot be sent by exposed native tool; physicaltouch drag/tap and tooltip connector endpoint post-navigation remain unverified (SA2 input check timed out). Existing reset/outside tooltip-dismissal unchanged, not newly added. No full manual interaction regression claimed. Browser viewport override reset. Status: IMPLEMENTED WITH RENDERED QA LIMITATIONS. Evidence: work/qa/v1_native_navigation/validation.json, /private/tmp/v1-native-desktop.png and /private/tmp/v1-native-mobile.png.

## V1 modifier-wheel regression diagnosis — 15 October 2026

NEEDS FIX — modifier-wheel zoom failed manual user test. This overrides the previous V1 navigation acceptance/QA-limitation status. Diagnose before choosing a fix: temporarily instrument the actual V1 container and window wheel capture, record deltaY/deltaMode/metaKey/ctrlKey/isTrusted/defaultPrevented, map delivery and actual mapZoom before/after. User performs normal/Cmd/Ctrl/pinch gestures in built-in browser because tooling cannot synthesize modifier-wheel input. Instrumentation must not prevent default or alter zoom. Only after observed behaviour choose native repair or one non-passive JavaScript wheel bridge to existing native signals; never duplicate listeners. Remove temporary diagnostics after diagnosis/fix; READY requires demonstrated modifier-wheel and tooltip/leader after zoom/pan. Other charts/data/spec unchanged.

Diagnostic observation: 379 page-wheel events recorded, mapZoom1 and zero signal changes. Visible final12 pinch events were trusted deltaMode0/ctrlKeytrue/metaKeyfalse but inMapfalse with no map capture/bubble. This confirms page delivery of pinch, not delivery to Vega; cannot conclude Vega failure from outside-map events. Diagnostic log expanded and displaced map; corrected to compact fixed panel retaining per-test totals before requesting repeat on-map gestures. Final fix decision remains pending on-map evidence.

## V1 single wheel bridge repair — 15 October 2026

Observed repeat tests:90 page wheel events,16 mapZoom changes, final1.019944177; Cmd stage31 page/6 map/6 prevented, Ctrl29 page/8 map/8 prevented, pinch24 page/9 map/9 prevented, pinch zoom1.135429038→1.107628688. Native stream can work for in-map events; outside-map events retain browser default. User confirms whole-window zoom remains unwanted. Replace ONLY V1 native wheel stream with a container capture listener passive:false, modifier metaKey OR ctrlKey, synchronous preventDefault for map gestures only. One active wheel zoom path; native pointer pan retained. Frame-coalesce requested zoom1–12 and scale mapPan by actual zoom ratio; serialize public view.runAsync and clean listeners on rebuild. Normal wheel untouched. Keep temporary compact diagnostic panel for final manual bridge verification, then remove it. Do not claim READY until actual map-only gesture and tooltip/leader checks pass.

Bridge manual test failed: user reports page text still changes. New observed map events:4 Cmd wheels, all inMaptrue, mapZoom1→1.008213319, defaultPreventedfalse. Add diagnostic cancelable/bridgeHandled/preventedAtBridge/visualViewport.scale to distinguish noncancelable native gesture from listener delivery or stale asset. Status remains NEEDS FIX.

Latest user Cmd-scroll capture after bridge2 reload: trusted/cancelabletrue, metaKeytrue/ctrlKeyfalse/deltaMode0, mapCapturetrue, bridgeHandledtrue, preventedAtBridgetrue; actual zoom1→1.221896847 (14 signal changes),28 events/27 map/24 prevented. Ordinary nonmodifier sample leaves zoom unchanged. Browser console warning/errorlogs[]. This demonstrates the JS bridge receiving and cancelling a real on-map Cmd-wheel event; prior failure cause not conclusively isolated, outside-map default zoom and earlier uncancelled samples both documented. Page-text stability confirmation and tooltip/leader post-navigation acceptance pending; not READY. Evidence work/qa/v1_native_navigation/wheel_manual_capture.json.

## V1 post-diagnosis lag check — 15 October 2026

User reports lag; whether whole-page zoom persists is awaiting clarification. Remove temporary diagnostic panel/window/container observational listeners and event serialization before measuring navigation; these update text for every wheel and can contaminate interaction timing. Retain one non-passive V1 wheel bridge and native pan, unchanged data/projection/geometry. Use existing opt-in v1perf public-view redraw timer in the built-in page to measure actual work, not browser-tool latency. Further navigation optimisation requires measured evidence. Keep status NEEDS FIX until outstanding manual/tooltip checks pass.

V1 measured performance decision: live public-view zoom redraw886.1ms at1.6× (not automation latency). Cache native Mercator-projected SVG paths once per responsive fit/All-regions change using Vega geopath, then apply native path-mark scaleX/scaleY/x/y from existing mapZoom/mapPan. This is affine navigation of the same full-resolution geography, not simplification/new projection/data change. Keep live projection signals as coordinate reference; no rotation/centre change. Divide strokeWidth by zoom to preserve screen-space outline widths. Tooltip/leader uses actual SVG path CTM and retains exact item data. No other chart path rendering changes. Static coordinate/data/fit checks plus live before/after timings and tooltip regression required; revert if unsuitable.

Cached-path result: native Vega parse/dataflow passed;2418valid/55missing unchanged; cached path strings stable through zoom/pan; affine coordinates match live Mercator within1e-8 using actual runtime dimensions (padding accounted for); selected class retained. Built-in measured1→1.6× redraw886.1ms before vs65.4ms after (13.55×). Actual rendered map inspected, inland SA2 outline remains aligned; native tool click did not expose tooltip, so three-SA2 tooltip/connector regression still pending. Temporary wheel diagnostics fully removed; optional existing v1perf timer used only for measurement. Exact numerical performance evidence saved work/qa/v1_native_navigation/performance_cached_paths.json. Page-text clarification/manual smoothness still awaiting user feedback. No READY claim.

## V1 first-wheel response — 15 October 2026

User still notices a small zoom delay after path caching. Existing wheel bridge always waits for requestAnimationFrame before the first update. Apply the first event of an idle gesture immediately (150ms idle boundary), while retaining frame-coalescing and single-flight updates for sustained wheel input. Skip unchanged limit updates. Preserve wheel modifier/default prevention,1–12limits, pan ratio, native drag and all semantic/chart/tooltip behaviour. This removes scheduling wait only; do not claim lower redraw cost or smoother manual gestures without new evidence.

## V1 ordinary wheel zoom — 15 October 2026

User now requests scroll up→zoom in, scroll down→zoom out. This explicitly supersedes the modifier-only wheel and ordinary-page-scroll-over-map requirement. Intercept wheel only on the V1 chart container using the existing single non-passive bridge, without a modifier requirement. Negative deltaY increases zoom, positive decreases it; keep limits1–12, north-up pan, reset, cached paths, data and analytical selection unchanged. Wheel outside V1 still scrolls the page; mobile vertical touch scrolling remains pan-y, with +/− fallback. Update V1 instruction only. Built-in rendered wheel direction checks required.

Ordinary-wheel rendered check: built-in browser wheel over actual V1 map increases indicator1.0×→1.1× on scroll up; scroll down returns1.0×. Fresh console warning/errorlogs[]. Data/spec/projection/source geometry unchanged. This verifies the new ordinary wheel directions; does not close earlier tooltip/leader and physical-touch QA gaps.

## Editorial composition preview — 15 October 2026

User requests a whole-page editorial design preview. Create separate editorial-preview.html/css only, reusing all13 production specs/runtime/scripts/data and preserving chart order, values, colours, scales and interactions. Production index/styles/scripts remain unchanged. Replace repeated figure rules and uniform stacking with asymmetric map+margin-note compositions (V1/V3/V10), left introduction beside treemapV4, inset comparison figuresV6/V7, wide employment featureV8, open chordV11, and centred conclusionV12. Strengthen serif display typography, paper background, chapter spacing and prose transitions; no heavy cards or added animation. Keep critical caveats and selections visible. Collapse optional controls, version links, and long methods/sources into labelled keyboard-accessible details; keep V1 +/−/reset, V8 reset and dynamic period feedback visible. Preserve every original source/caveat text, control ID and chart ID. Preview only; built-in desktop/mobile rendered iteration required; do not promote automatically.

Editorial preview Render1 desktop review: all13 figures inspected through story scroll. Refine Render2 by merging version navigation into sources/notes, replacing generic explore labels with chart-specific wording, placing the unchanged long V10 coverage caveat full-width below the feature instead of a tall rail, and preplacing the unchanged V9 playback markup inside its expandable exploration control (existing runtime binds same IDs). Remove existing supporting-region tint in preview only for cleaner page integration. Production unchanged.

Editorial narrow-layout Render1 caught a V1-only preview setup error: broad version-link grouping included the Show all button; merging only anchor links removed it. Restore original button/ID in original legend wrap, verify all production IDs remain after final transformations. Keep V7 normalisation and V12 survey caveat visible as captions. No production files changed. Re-render before delivery.

Editorial preview acceptance: Render2 corrected V1 Show all; final built-in fresh load has13 chart containers/no Chart unavailable/no new warning or error logs. Desktop1280 story scroll inspected; mobile390 V1/heatmap exploration+Victoria selection/V8/export stacking inspected. No observed page overflow, but no instrumented width measurement or exhaustive interaction/physical-touch QA claimed. Production index/styles/app/interactions/v1-navigation hashes unchanged; all original control IDs,13 chart order,source/caveat/insight wording preserved. New files editorial-preview.html/css and work/qa/editorial_preview evidence; PLAN updated. Preview only, awaiting user design choice; production not promoted.

## V1 Cmd-wheel interaction correction — 15 October 2026

User clarifies V1 zoom must require Cmd: Cmd+scroll up zooms in, Cmd+scroll down zooms out. This supersedes the ordinary-wheel zoom rule. Existing single V1 bridge returns immediately unless event.metaKey; only Cmd-wheel is prevented on map. Normal scroll, including outside V1, scrolls the webpage. Preserve cached-path performance, pan/reset,1–12limits, data/geometry/colours/legend/tooltips. Update instructions and cache keys in production and editorial preview, since both use the same V1 navigation helper. No editorial layout promotion or other chart changes.

## Editorial Data Visualisation Composition Rework

15 October2026; new preview only: editorial-vis-preview.html/css/js plus a preview-only app loader with layout dimensions/axis-label wrapping only. Preserve production and earlier preview. Goal is analytical figure composition rather than charts floating in an editorial website. Hero V1/V5/V8/V10; support V2/V3/V4/V6/V7/V9/V11/V13; conclusion V12 current dot plot retained. Group V1+V2 relative/absolute, V6+V7 recent growth/current profiles, V8+V9 employment levels/ranks, V11+V13 domestic network/IVA follow-up, keeping existing order. Selective square off-white figure panels, no shadows; compact FIG labels, aligned captions, integrated sources, less vertical gap. V3 reporting count in summary rail, V4 verified subtotal141,974m across15 subdivisions and Food31,279m/22.03%, V8 verified19-observation start1005.5k/low830.2k/latest900.8k statistic strip, V10 compactcoverage85.21% and representative-anchor/OD caveat with long method behind disclosure, V12 independent findings with conditional84% emphasis. V5 Tasmania Food37.45% annotation integrated above heatmap with an explicit Inspect this cell action using existing focus controls/signals. No other coordinated interactions forced. Keep necessary analytical controls accessible in disclosures, existing zoom/brush/filter/tooltip logic. Mobile stack paired scenes, internal scroll for dense charts, retain captions/caveats and44px controls. Preview-only loader changes physical chart sizes/wrapped labels; no numerical scale/domain/data/colour/threshold/projection-type changes. Built-in1280×720 and390×844 rendered iterations/console/regression required. Not production promotion.

Composition Render1 revision: V6/V7 side-by-side at1280 made labels too small; use staggered full-width supporting figures below1500px and keep pair only on wider desktops. V12 container sizing left internal desktop scroll; fit its existing0–100 dot plot into available panel width, preserving encoding/data. Re-render desktop/mobile before acceptance.

Composition mobile Render1 revision: shorten only preview V1/V2 physical height380→280px to reduce vertical map whitespace; wrap V1 seven-class legend into three columns with12px labels. Angle V7 mobile axis labels25degrees for separation without changing field names. Fit V12 numeric panel width minus10px to remove redundant internal scroll; maintain0–100 domain. All changes are preview layout only.

Composition preview acceptance: second desktop1280×720 and narrow390×844 renders inspected in built-in browser only. All13 chart containers rendered; no Chart unavailable and no fresh warnings/errors. V6/V7 staggered widths improve desktop readability; mobile legend wraps and V7 angled labels no longer collide; V12 fits both viewports without redundant chart scrolling. No observed page-level overflow (no instrumented width claim); V5/V9/V11/V13 retain internal scrolling. Verified V5 annotation selection on both sizes, V8 start-period feedback/reset, V10 Victoria origin/ranking update, V1 class highlight preserved through zoom/reset and Show all clears. No exhaustive tooltip/leader-line or physical-touch gesture claim. Protected production/earlier-preview hashes, original IDs/order/source links unchanged. Evidence work/qa/editorial_vis_preview/acceptance.json and actual rendered screenshots. Recommendation: hybrid composition, pending human approval; production remains unchanged.

## Final Editorial Visualisation Polish

15 October2026. Refine current editorial-vis-preview only; no whole-page redesign or production promotion. Preserve80–90% layout, title/intro, Georgia/Arial typography, neutral colours, all13 data/metrics/thresholds/geometry/semantics/order/sources/factual annotations and existing interactions. Four scene types: hero(V1/V5/V8/V10), paired comparison(V1+V2,V6+V7,V8+V9), map/visual+side insight(V3/V10/V11), conclusion/evidence(V12). Exact refinements: compact shared V1/V2 hierarchy with attached relative/absolute transition and explicitly supportingV2; retest55/45 V6/V7 at1280 replacing earlier below1500 stacking decision only if readable, align chart tops, shared existing sources, mobile stack; reduceV9/V13 heading/rule weight and continuation spacing; add small V11 Manufacturing→Construction74,214.5907million=A$74.215bn largest outward domestic intermediate-use relationship shown2023–24 atbasicprices, verified from unchanged edges (no new chart/controls); reduce repeated labels/rules/source headings selectively. Preserve V3/V4/V5/V8/V10/V12 composition except inherited quiet figure numbers/notes treatment; no cross-highlight added because stable interaction outweighs novelty. Native accessible disclosures retained. Built-in desktop1280×720/mobile390×844 render/console/regression required; no exhaustive physical-touch claim.

Final polish acceptance: built-in desktop1280×720 and mobile390×844 inspected.55/45 V6/V7 pair readable with aligned chart tops/wrapped V7 labels, control moved below chart and shared notes; narrow stack readable. V1 hero/V2 supporting bridge integrated; V9/V13 heading/rule treatment quiet; V11 static largest outward relationship beside chord, below on narrow. V3/V4/V5/V8/V10/V12 compositions preserved. All13 rendered, no Chart unavailable/no fresh warning/errorlogs/no visible failed-load state. Tested V7 focus, V11 industry selection/directional lists, V9 playback/reset, V5 annotation selection, V8 period/reset, V10 filter/ranking, V1 class highlight through zoom/reset, and shared source disclosure. No observed page-level overflow; dense charts retain internal scroll; no instrumented width or exhaustive tooltip/physical-touch claim. Production and earlier preview hashes unchanged; original IDs/order/source links retained. Evidence work/qa/editorial_vis_preview/final_polish. Current preview only, pending approval for promotion.

## Editorial preview annotation updates — 15 October2026

Process all seven new browser comments in current editorial-vis-preview only. Comments1/2 supersede retained V1 +/− button requirement: remove these buttons, preserve Reset/All regions and keyboard zoom fallback on focusable map. Comment3: add Windows Ctrl-scroll support as well as Mac Cmd-scroll, not merely inaccurate instruction text. Comment4 supersedes V1 side caveat: move unchanged caveat below map/legend, fullwidth. Comment5: V2 adopts V1 north-up translation pan, scale zoom1–12, one coalesced nonpassive modifier-wheel bridge, cached unchanged geography and direct drag without activation; simplify controls toReset/Allregions, preserve proportional symbol AREA/count scale and tooltips. Use preview-only copies of navigation/interactions helpers to avoid changing production. Comment6 supersedes V3 side insight: move unchanged1210stat/state ranking/caveat belowmap; wide compact desktop summary, mobile stack. Comment7 footer replaced verbatim with user wording: Generative AI supported coding, data validation, visualisation design, idiom selection, and grammar refinement. All data, calculations, joins, and chart outputs were checked against the original source materials. No data, colour, threshold, geometry, source, other chart or production edits. Built-in desktop/mobile checks required; exact manual modifier-wheel/touch verification limits reported.

Annotation Render1 adjustment: V3 bottom summary fourth child created a mostly empty second grid row; group the existing facility detail under the1210stat within the same first column. Keep ranking/caveat alongside on desktop and all blocks stacked on narrow. No content or interaction change.

Annotation acceptance: all7 comments implemented in preview only. Built-in desktop and390mobile render inspected: V1 +/− gone, correct Mac/Windows instructions; unchanged caveat belowmap; V2 simplified native navigation with matching instructions, actual keyboardzoom1→1.6/directdrag/reset/tooltip verified; V3stat/ranking/caveat belowmap with compact desktop row/mobile stack; footer exact requested text. All13 chart containers rendered, no Chart unavailable, console warning/errorlogs[]. Production/earlier preview hashes unchanged. Physical Cmd/Ctrl-wheel and touchpinch not tested; later native V1class/key check timed out, not claimed passed. Evidence work/qa/editorial_vis_preview/annotations/acceptance.json; preview remains unpromoted.

## Editorial annotation batch 2 — 21 comments

User instructions supersede selective framing, collapsed controls and retained bump/dot idioms. Preview only.1 enlarge V1 responsive area;2 remove Showall, same-class click clears;3 visible lightblue#D9E7F4 lowest class with unchanged thresholds;4 V2keyleft/mapright no overlay;5 V3headlineleft, ranking/caveatbelow;6 all13 square V5-style frames;7/8 V7control directly visible;9 sticky chapterbar and story-section headings;10 V8directcontrols;11 existing full15category19year bar race, bump kept in history;12 V11directcontrols;13 responsive compact chord without horizontalscroll/fullnames via controls/tooltips;14 trimsummarygaps;15 V13directcontrols;16 responsive slopegraph xpositions/wrappedlabels samey-domain;17 explicitly identify FIG13 slopegraph and sharedsources;18 tightentransition;19 V10rankingbelowmap;20 directfilters/V1modifier-wheel translationpan withoutrotation;21 existingclassicpeople ISOTYPE exact73/67/63/84/partialfill, originaldot kept in history. Same source/data/palettes exceptlowestV1class; production untouched. Native-responsive layouts, no screenshot scaling or new libraries. Desktop/mobile builtin render/interactionQA and any unreadable-small-screen limitations required.

Batch2 Render1 chord adjustment: wide chord had unnecessary vertical margins because560height retained a smallradius. Use420wideheight, north/south irrelevant nongeographic circle layout withradius width*.23/cx width*.38, leftlabel end108/rightlabels70%width. Labels remain same categories, full tooltip/control names unchanged; no data/value/colour changes.

Batch2 mobile Render1 corrections: reduce compact chord label spread180→160px for top/bottom clearance; constrain bar-race tracking selector to parent width on narrow screens. These are layout-only corrections; fullnames remain controls/tooltips.

Batch2 correctness repair: live bar race became blank after viewport resize with no console error, while AX still contained bars/axis. Avoid finalizing/recreating the SVG view for each resize; update existing native Vega view width/height/mobile signal and callresize/runAsync instead. Preserve same view/data/palette/year/focus and playback. Verify mobile↔desktop and height-only resize before acceptance.

Batch2 resize root cause refined: return to desktop retained mobile-sized intrinsic VegaEmbedhostwidth because preview CSS omitted originalcandidate width100%. Restore fullwidth block host; base racewidth on parent clientWidth so an oldSVG cannot constrain its own next width. Recheck both directions. Existing view-resize lifecycle remains.

Batch2 acceptance: all21 comments implemented in current preview only; all13 outer figures/order/source links preserved, production/earlier preview hashes unchanged. Twelve Vega views plus four-row people ISOTYPE rendered. Built-in1280×720/390×844 inspected; extra1000height for full proof. V9 Play/Pause/Reset/final-year slider and responsive return now pass after fixing blank/intrinsic-width lifecycle issue;285finite values/15codes×19years/100%yearlyshares validated. ISOTYPE73/67/63/84 exact20icon fractions verified;67% tap detail/source/period/caveat tested. V1 class selected25matching/reclick clears;V13Foodfocus;V10keyzoom/directdrag/reset/Victoriafilter/ranking tested. No fresh console warnings/errors/no Chart unavailable. V11/V13 compact long names shortened withfullnames in controls/tooltips; physicalCmd/Ctrl-wheel/touchpinch notverified; no observed page-level overflow/noinstrumentedwidthclaim. V9basicbar; V12advancedcandidate subjecttutorjudgement, no production rubric change. Evidence work/qa/editorial_vis_preview/batch2. Preview unpromoted.


## Editorial preview publication cleanup — 15 October 2026
Remove all earlier-design/version/palette/candidate navigation and historical design-only notes from current preview, keeping original history files and real sources intact. V9 is the current all-15 subdivision animated bar chart race; replace obsolete bump methodology with accurate current guidance. Show V3 and V5 filtering directly. V3 keeps only Reset map view in map toolbar and adopts V1 modifier-wheel scale zoom and direct translation pan, north-up and independent of filters/selection. V1/V2 scroll-up (negative wheel delta) zooms in, scroll-down zooms out with Cmd on Mac/Ctrl on Windows; ordinary scroll remains page scroll. Remove visible keyboard +/- hint in V2 while retaining keyboard accessibility. Preview-only changes; no index/production/data/spec changes. Validate in built-in browser and report physical-gesture limits.


## Final panel-width and layout consistency pass
15 October 2026. Current editorial-vis-preview only, no production promotion or whole-page redesign. All single-idiom rows (V1/V2/V3/V4/V5/V8/V9/V11/V13/V10/V12) use the same 100% outer frame. V6/V7 use equal minmax(0,1fr) columns with a 28px gap on desktop and matching padding/stretch alignment; stack at narrow widths. Outer framing is distinct from internal chart/statistic columns. V8/V9 must share exact left/right boundaries. V10 returns to one full-width frame with internal map/ranking columns on desktop and stacked narrow, compact map height. Remove prior narrow support-panel maximum widths/offsets, no nested scene frames; standard 28px row spacing and24px panel padding (16px mobile). Reduce only the three requested caveat/transition/time-scene subtitle treatments. Preserve source notes, factual text/order, all data/values/colours/thresholds/geometry and interactions. Preview-only responsive chart dimensions/label wrapping may adapt to equal columns; no encoding/domain changes. QA built-in browser at1280 and390; distinguish visual checks from unverified physical gestures.

Panel-width acceptance: built-in browser1280×720 and390×844 verified. Desktop all11 single-row panels x60,width1160; V6/V7 x60/x654,width566each,gap28 with exact equal top/bottom and chart-host top alignment. Mobile all13 x14,width362; V6/V7 stack with28gap. Instrumented document scrollWidth equals viewport1280/390. All12 Vega views and four ISOTYPE rows rendered,no load-error. V10 map/ranking side by side atdesktop and stacked mobile;440px desktop map instead of520. V7 Food focus, V5 Tasmania×Food annotation, V9 final-year slider and V10 Victoria/ranking tested. Console warn/error logs empty. Baseline hash comparison confirms data/specs/production unchanged; only four preview implementation files changed plusPLAN. Existing source text/order untouched (HTML changes script/style version tokens only). Physical modifier-scroll/pinch and exhaustive interactions not rerun in this layout-only pass. Exact files: editorial-vis-preview.html, editorial-vis-preview.css, editorial-vis-preview.js, editorial-vis-app.js, PLAN.md. Preview not promoted.
