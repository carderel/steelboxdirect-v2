# Kansas City, MO — Ground-Truth City Dataset (2026-07-31)

RC-mode research output for Task 2 of `docs/superpowers/plans/2026-07-31-locations-national.md`.
Format contract: existing Cincinnati/Dayton entries in `src/data/cities.ts`.
Scope note (owner-locked): page is hosted under **Missouri** (`/locations/missouri/`); copy may honestly cover the bi-state metro. Bi-state handling mirrors Cincinnati's KY precedent — KS counties appear as one combined, clearly-marked entry in `counties[]`; primary `zoning[]` rows are Missouri counties (graded KS rows provided separately as an owner/transcriber option).

---

## Core fields (verbatim-ready)

### name / state / stateSlug / slug
- name: `Kansas City`
- state: `Missouri`
- stateSlug: `missouri`
- slug: `kansas-city-shipping-containers`

### counties[] (Jackson first; KS marked bi-state, Cincinnati-style)
```
['Jackson County', 'Clay County', 'Platte County', 'Cass County', 'Johnson/Wyandotte (KS)']
```
Grounding: Kansas City, MO's city limits themselves span Jackson, Clay, Platte, and Cass counties (the only major U.S. city spread over four counties in one state — corroborated by Wikipedia + local press including KCUR). Johnson and Wyandotte counties, KS form the metro's Kansas side directly across the state line.

### primaryZips (city core + one notable delivery area per county)
```
['64106', '64114', '64118', '64151', '64701']
```
- 64106 — downtown Kansas City (Jackson County) — verified: zipdatamaps/zip-codes.com
- 64114 — Waldo, south Kansas City (Jackson County) — verified: Wikipedia (Waldo, Kansas City) + Jackson County ZIP maps
- 64118 — Northland/Gladstone area (primarily Clay County) — verified: zip-codes.com, city-data
- 64151 — Parkville/Platte Woods area (Platte County) — verified: zip-codes.com, usa.com
- 64701 — Harrisonville (Cass County seat, southern delivery ring) — verified: worldpopulationreview/zipdatamaps Cass County ZIP lists

### zoning[] (Missouri counties — graded; nothing below C included)
```
[
  { county: 'Jackson County', office: 'Jackson County Public Works — Development & Construction', url: 'https://www.jacksongov.org/Business/Development-and-Construction/Zoning-Subdivision-Applications' },
  { county: 'Clay County', office: 'Clay County Planning & Zoning Department', url: 'https://www.claycountymo.gov/217/Planning-Zoning-Department' },
  { county: 'Platte County', office: 'Platte County Planning and Zoning Department', url: 'https://www.co.platte.mo.us/planning-and-zoning' },
  { county: 'Cass County', office: 'Cass County Building Codes, Zoning & Environmental Health Department', url: 'https://www.casscounty.com/2144/Building-Codes-Zoning-Environmental-Heal' },
]
```
Evidence grades (method: live HTTP fetch with browser UA where possible; exact-URL corroboration via search-result listings otherwise):
| County | URL | Grade | Evidence |
|---|---|---|---|
| Jackson (MO) | jacksongov.org/Business/Development-and-Construction/Zoning-Subdivision-Applications | **B** | Site returns 403 to automated fetch (bot wall, site-wide incl. root). Exact URL + page title "Zoning & Subdivision Applications - Jackson County MO" appears in current search-engine listings of the official .gov domain. Office naming per official-site snippet ("Jackson County Public Works is responsible for all types of permits, code enforcement and applications"). OWNER CLICK-CHECK. |
| Clay (MO) | claycountymo.gov/217/Planning-Zoning-Department | **A** | Live fetch HTTP 200; page title verified: "Planning & Zoning Department \| Clay County, MO". Official .gov. |
| Platte (MO) | co.platte.mo.us/planning-and-zoning | **A** | Live fetch HTTP 200; page title verified: "Planning And Zoning — Platte County". Official county domain (.mo.us). |
| Cass (MO) | casscounty.com/2144/Building-Codes-Zoning-Environmental-Heal | **B** | Connection refused to automated fetch (timeout both www/bare). Exact URL + title "Building Codes, Zoning & Environmental Health \| Cass County, MO - Official Website" appears in current search listings; department name independently corroborated by official DocumentCenter PDFs on the same domain naming the "Building Codes, Environmental Health, and Zoning Department" (Harrisonville, MO). Note: .com domain, but it is the county's official site. OWNER CLICK-CHECK. |

**Optional bi-state zoning rows** (graded; include only if owner wants KS zoning on a MO-hosted page — Cincinnati precedent did NOT list KY zoning rows):
| County | Office | URL | Grade |
|---|---|---|---|
| Johnson (KS) | Johnson County Planning (Planning, Housing and Community Development) | https://www.jocogov.org/department/planning | **A** — live fetch 200, title "Planning \| Johnson County Kansas", official .gov |
| Wyandotte (KS) | Unified Government of Wyandotte County/Kansas City, KS — Planning & Urban Design | https://www.wycokck.org/Departments/Planning-and-Urban-Design/Zoning-Code | **B** — site 403s to automated fetch; exact URL + title "Zoning Code" in current search listings of the official UG domain (.org, official). OWNER CLICK-CHECK |

### geography (cities.ts structured shape)
```
{
  interstates: ['I-70', 'I-35', 'I-29', 'I-49', 'I-435', 'I-470'],
  features: ['Missouri River', 'Kansas River'],
}
```
Honest prose (for template/copy use): Kansas City sits at the confluence of the Kansas and Missouri rivers, where river-bottom rail and industrial districts give way to gently rolling plains — most metro sites are flat, truck-accessible ground reached off the I-435 loop. Spring is the region's severe-weather season (the NWS Kansas City/Pleasant Hill office's most active stretch runs roughly April into June, with large hail and tornado risk), which is a real reason locals put equipment under steel rather than tarps.
- Interstates/rivers: well-established, corroborated by MoDOT Kansas City District freight plan + MARC (Mid-America Regional Council) freight materials.
- Severe-weather seasonality: NWS Kansas City/Pleasant Hill (weather.gov/eax) region; peak season April–June corroborated by NWS-sourced reporting. Qualitative only — no storm counts or damage stats used.

### areaProfile (2–3 sentences)
> Kansas City is one of the nation's busiest rail-freight hubs — multiple Class I railroads and intermodal terminals converge near the confluence of the Kansas and Missouri rivers, and warehousing and distribution anchor the metro economy. The city itself spreads across four Missouri counties, from the Jackson County urban core to the fast-growing Northland suburbs of Clay and Platte counties, with working row-crop and cattle farms across Cass County to the south.

Grounding: rail hub + intermodal — MoDOT Kansas City District Freight Plan, MARC freight fact sheet, KC SmartPort (industry) and Kansas City Terminal Railway (four Class I owners: UP, BNSF, NS, CPKC). Four-county city footprint — Wikipedia/KCUR. Northland growth — census-estimate reporting (Platte and Clay among Missouri's fastest-growing counties 2010–2020 and since; FOX4/Missouri SBDC). Cass County farming — USDA NASS 2022 Census of Agriculture county profile (cp29037): soybeans, corn, forage/hay top crops; substantial cattle and hog inventories. All claims kept qualitative — no tonnage/train-count/population figures in page copy.

### commonUses[] (4, persona-tagged, grounded)
```
[
  { label: 'Rail & intermodal freight overflow storage around KC\'s Class I railroad hub', persona: 'businesses' },
  { label: 'New-construction jobsite storage in the fast-growing Northland (Clay & Platte counties)', persona: 'contractors' },
  { label: 'Farm equipment, hay & grain-season storage in Cass County and the outer Clay–Platte farmland', persona: 'farmers' },
  { label: 'Manufacturing & supplier overflow storage in the Claycomo auto-assembly corridor', persona: 'businesses' },
]
```
Grounding per item:
1. Rail/intermodal — MoDOT KC District Freight Plan; Kansas City Terminal Railway (UP, BNSF, NS, CPKC); metro intermodal terminals widely documented (BNSF Logistics Park Kansas City, UP KC Intermodal Facility, CPKC).
2. Northland construction — Platte County ranked Missouri's fastest-growing county in recent census estimates; Clay also top-tier growth; Parkville/North Kansas City growth reporting (census-based).
3. Farming — USDA NASS 2022 Ag Census, Cass County MO profile (soybeans/corn/hay, cattle); Platte County's own Land Use Plan documents its remaining rural areas.
4. Claycomo — Ford Kansas City Assembly Plant, Claycomo (Clay County), producing F-150 and Transit; one of Ford's largest US plants and Clay County's major employer (Wikipedia, KCUR).

### usesIntro (one city-specific line)
> From the rail yards in the river bottoms to the row crops of Cass County, here's how Kansas City puts a container to work.

(Rail yards in the West/East Bottoms — long-documented KC rail/industrial districts, e.g. CPKC Knoche Yard.)

### seo (existing-entry pattern; description uses the `${CONDITION.label}` template var)
```
{
  title: 'Shipping & Storage Containers for Sale in Kansas City, MO | Steel Box Direct',
  description: `Buying a shipping container in Kansas City? We provide ${CONDITION.label} containers with depot-based delivery to Jackson, Clay, and Platte counties.`,
}
```

---

## Suggested supporting fields (transcriber convenience — coordinates are well-established public geodata; copy suggestions are drafts, not researched facts)

- map (pattern-matched to existing entries' 0.4°×0.4° bbox around the marker):
```
{
  bbox: '-94.779,38.900,-94.379,39.300',
  marker: '39.0997,-94.5786',
  title: 'Kansas City, MO delivery area map',
}
```
- delivery.headline suggestion: `Jackson, Clay, & Platte`
- delivery.counties = counties[] above. delivery.body must use depot-based framing per spec (NOT the Cincinnati 250-mile line) — copywriting, out of research scope.
- Bridge copy: verbatim from spec with "Kansas City" swapped in — spec is law, not restated here.

---

## SOURCES

Zoning authorities (official):
- Jackson County MO — https://www.jacksongov.org/Business/Development-and-Construction/Zoning-Subdivision-Applications (also /Government/Boards-Commissions/Plan-Commission)
- Clay County MO — https://www.claycountymo.gov/217/Planning-Zoning-Department
- Platte County MO — https://www.co.platte.mo.us/planning-and-zoning
- Cass County MO — https://www.casscounty.com/2144/Building-Codes-Zoning-Environmental-Heal (dept name corroborated: https://www.casscounty.com/DocumentCenter/View/343/Informational-Packet---Building-Codes)
- Johnson County KS — https://www.jocogov.org/department/planning
- Wyandotte County KS (Unified Government) — https://www.wycokck.org/Departments/Planning-and-Urban-Design/Zoning-Code

Economy / freight / agriculture:
- MoDOT Kansas City District Freight Plan — https://www.modot.org/kansas-city-district-freight-plan
- MARC (Mid-America Regional Council) freight fact sheet — https://connectedkc.org/wp-content/uploads/2020/04/Freight.pdf
- Kansas City Terminal Railway (four Class I owners) — https://en.wikipedia.org/wiki/Kansas_City_Terminal_Railway / https://kctrailway.com/
- KC SmartPort (industry, qualitative context only) — via https://ithinkbigger.com/great-freight-drives-kcs-transportation-logistics-industry/
- USDA NASS 2022 Census of Agriculture, Cass County MO profile — https://www.nass.usda.gov/Publications/AgCensus/2022/Online_Resources/County_Profiles/Missouri/cp29037.pdf
- Ford Kansas City Assembly Plant (Claycomo, Clay County) — https://en.wikipedia.org/wiki/Kansas_City_Assembly_Plant / https://www.kcur.org/news/2022-06-02/ford-motor-co-s-plant-in-kansas-city-is-adding-1-100-people-to-meet-demand-for-electric-vehicles

Geography / counties / ZIPs / growth / weather:
- KCMO four-county footprint — https://en.wikipedia.org/wiki/Kansas_City,_Missouri ; https://www.kcur.org/politics-elections-and-government/2026-01-19/missouri-split-kansas-city-jackson-county-jackxit
- Northland growth (census-estimate reporting) — https://fox4kc.com/news/four-area-counties-among-fastest-growing-in-missouri/ ; https://sbdc.missouri.edu/publications/mx55 ; https://www.plattecountyedc.com/start-locate-expand/why-platte-county/
- ZIP–county mapping — https://www.zip-codes.com/zip-code/64106/zip-code-64106.asp (+ /64118, /64151); https://en.wikipedia.org/wiki/Waldo,_Kansas_City ; https://worldpopulationreview.com/zips/missouri/cass-county
- NWS Kansas City/Pleasant Hill (severe-weather seasonality) — https://www.weather.gov/eax/

## FLAGS (for verifier + owner)

1. **Owner click-check required:** Jackson County (jacksongov.org — 403 bot wall), Cass County (casscounty.com — refuses automated connections), Wyandotte County (wycokck.org — 403 bot wall). All three URLs corroborated by exact-URL search listings of the official domains, but not machine-fetched. Graded B accordingly.
2. **Jackson County office naming:** page copy says Public Works handles zoning/permits for unincorporated areas; exact division title ("Public Works — Development & Construction") should be eyeballed on click-check. Note most Jackson County residents live in incorporated cities (KCMO, Independence, Lee's Summit) with their own zoning — same buyer-responsibility caveat the template already carries.
3. **KCMO city option:** Kansas City proper's zoning authority is the City Planning & Development Department (kcmo.gov — also 403 to bots). Cincinnati precedent lists county authorities only, so it is omitted from zoning[]; flag if owner wants a city row.
4. **Cass County domain is .com** (casscounty.com) — it IS the official county site, but spec prefers .gov; noted for transparency.
5. **Bi-state:** KS counties included in counties[] as one marked entry (Cincinnati KY precedent). Graded KS zoning rows supplied separately as an option — transcriber must NOT add them silently; owner call.
6. No population numbers, tonnage figures, train counts, or storm statistics were carried into any page-copy field — qualitative claims only, per RC-mode.
7. VERIFIER EDIT 2026-07-31: seo.description "flat-fee delivery" → "depot-based delivery" (flat-fee is verified only for the home region; owner may restore if it holds for depot markets).
