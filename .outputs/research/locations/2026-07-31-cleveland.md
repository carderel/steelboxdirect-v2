# Ground-Truth Dataset — Cleveland, Ohio (depot city)

Researched 2026-07-31 per Task 2 of `docs/superpowers/plans/2026-07-31-locations-national.md`.
RC-mode: every claim below is traceable to the SOURCES list; anything I could not corroborate was omitted.

---

## Core fields

- **name:** Cleveland
- **state:** Ohio
- **stateSlug:** ohio
- **slug:** cleveland-shipping-containers

## counties[]

Metro counties realistically in a container-delivery radius (Cuyahoga first). All five are
constituent counties of the Cleveland, OH Metropolitan Statistical Area under the current
OMB/Census delineation (which lists Cuyahoga, Ashtabula, Geauga, Lake, Lorain, Medina).

1. Cuyahoga County
2. Lorain County
3. Lake County
4. Medina County
5. Geauga County

Scoping choices (see FLAGS): Ashtabula County is in the MSA but its population centers sit
~55–65 road miles northeast of Cleveland — omitted from the headline county list as a
delivery-realism call. Summit County (Akron) is adjacent and reachable but belongs to the
separate Akron MSA — omitted.

## primaryZips

Real city-core + delivery-area ZIPs, each corroborated (see SOURCES):

- **44113** — Cleveland city core (Tremont/Ohio City, west of downtown), Cuyahoga County
- **44060** — Mentor, Lake County
- **44035** — Elyria (county seat), Lorain County
- **44256** — Medina (county seat), Medina County
- **44024** — Chardon (county seat), Geauga County

## zoning[] (one entry per county; graded A–C; below C = omitted)

| county | office | url | grade | verification |
|---|---|---|---|---|
| Cuyahoga County | Cuyahoga County Planning Commission | https://www.countyplanning.us/services/community-planning/zoning-codes/ | A- | Authority's own official site; live-fetched HTTP 200 on 2026-07-31; commission's existence + zoning role corroborated on cuyahogacounty.gov (.gov). Not a .gov domain — the commission's official domain is countyplanning.us. A .gov alternative exists: https://cuyahogacounty.gov/i-want-to-contact/zoning (curl 200). |
| Lorain County | Lorain County Community Development Department | https://www.loraincountyohio.gov/575/Planning-and-Zoning | C+ | Official .gov domain; page title ("Planning and Zoning \| Lorain County, OH") + office name and Elyria address corroborated via search index. Could NOT be live-fetched from this network (TLS handshake refused to both curl and WebFetch — likely a WAF). Kept at C+ per official-.gov weighting; OWNER MUST CLICK-CHECK. |
| Lake County | Lake County Planning & Community Development | https://www.lakecountyohio.gov/planning-community-development/ | A | .gov, https, live-fetched 2026-07-31; office name confirmed on-page ("Planning & Community Development", 105 Main Street, Painesville). |
| Medina County | Medina County Department of Planning Services | https://www.medinaco.org/planning/ | B | Official Medina County domain (medinaco.org), https, curl 200 on 2026-07-31. Department name corroborated by the DPS operating-policies PDF hosted on the same county domain. Not .gov. Note: the department's legacy site (planning.co.medina.oh.us) is unreachable — do not use it. |
| Geauga County | Geauga County Planning Commission | https://bocc.geauga.oh.gov/departments/planning-commission/ | A | .gov, https, curl 200 on 2026-07-31; commission page confirmed (12611 Ravenwood Dr., Chardon 44024). |

No county below grade C → none omitted for grade; Ashtabula/Summit omitted for delivery-radius
scoping, not for source quality.

## geography

Prose (1–2 sentences, delivery-relevant):

> Greater Cleveland sits on the flat Lake Erie shore plain, split down the middle by the
> Cuyahoga River valley, with I-90, I-71, I-77, I-480, and I-271 giving straightforward truck
> access across the metro. The east-side counties (Lake, Geauga) sit in Northeast Ohio's
> lake-effect snow belt, which can affect winter delivery scheduling.

Structured (cities.ts `geography` shape):

- **interstates:** ['I-90', 'I-71', 'I-77', 'I-480', 'I-271']
- **features:** ['Lake Erie', 'Cuyahoga River']

## areaProfile (2–3 sentences)

> The Cleveland metro runs from dense lakefront neighborhoods and the industrial Flats along
> the Cuyahoga River — home to the Port of Cleveland and one of North America's major
> flat-rolled steel operations — out to rural townships in Medina, Geauga, and outer Lorain
> counties. The port is the Great Lakes' container gateway, with a scheduled
> Cleveland–Europe container service, so warehousing and cargo-overflow demand is real here,
> and lake-effect winters keep seasonal storage in steady demand on the east side.

## commonUses[] (4, persona-tagged, grounded in the metro's actual economy)

1. `{ label: 'Port & Great Lakes cargo overflow storage near the lakefront and the Flats (Port of Cleveland container gateway)', persona: 'businesses' }`
2. `{ label: 'Manufacturing parts & tooling overflow storage along the Cuyahoga River industrial corridor', persona: 'businesses' }`
3. `{ label: 'Renovation & new-build jobsite storage across the western and southern suburbs (Lorain & Medina counties)', persona: 'contractors' }`
4. `{ label: 'Farm equipment & seasonal storage in rural Medina, Geauga, and outer Lorain townships', persona: 'farmers' }`

Grounding: #1 Port of Cleveland is the only container port on the Great Lakes with the
scheduled Cleveland-Europe Express service (portofcleveland.com). #2 Cleveland-Cliffs
Cleveland Works, an integrated flat-rolled steel facility, sits on the Cuyahoga River in the
Flats with a wide array of industry along its banks (clevelandcliffs.com, case.edu).
#3 is generic contractor use-case framing tied to the suburban counties served — no growth-rate
or development claims made. #4 Medina/Geauga/outer Lorain are the metro's rural-township
counties (county subdivision/zoning documents govern unincorporated townships in all three —
see zoning sources); no acreage or farm-count claims made.

## usesIntro (1 line)

> From the container docks at the Port of Cleveland to the farm townships of Medina and Geauga
> counties, here's how Northeast Ohio puts a container to work.

## seo

- **title:** `Shipping & Storage Containers for Sale in Cleveland, OH | Steel Box Direct`
- **description:** `` Buying a shipping container in Cleveland? We provide ${CONDITION.label} containers with depot-based delivery to Cuyahoga, Lorain, and Lake counties. ``
  (Template-literal form matching the Cincinnati/Dayton entries — transcriber keeps the `${CONDITION.label}` interpolation. VERIFIER EDIT 2026-07-31: "flat-fee delivery" → "depot-based delivery" — the flat-fee claim is verified only for the home region; owner may restore it if it holds for depot markets.)

## Suggested extras for the transcriber (NOT Task-2-required fields; marked as suggestions)

- **map (suggested):** marker `41.4993,-81.6944` (Cleveland city center, widely published
  coordinates), bbox `-81.894,41.299,-81.494,41.699` (±0.2°, same construction as the
  Cincinnati/Dayton entries), title `Cleveland, OH delivery area map`.
- **region:** `depot` (per spec); delivery copy must use the depot framing + verbatim bridge
  copy from the spec — NOT written here, per spec that copy is law and lives in the template.

---

## SOURCES (every claim traceable)

1. Cleveland MSA constituent counties (Cuyahoga, Ashtabula, Geauga, Lake, Lorain, Medina; census-based delineation): https://www.centerforcleveland.org/geographic-definitions and https://en.wikipedia.org/wiki/Greater_Cleveland (both restating the OMB/Census MSA delineation); county-level census framing also at https://www.countyplanning.us/resources/census-data/
2. Cuyahoga County Planning Commission — official site + zoning services: https://www.countyplanning.us/ (fetched 2026-07-31, confirmed official) and https://www.countyplanning.us/services/community-planning/zoning-codes/ (curl 200); .gov corroboration: https://cuyahogacounty.gov/i-want-to-contact/zoning (curl 200) and https://cuyahogacounty.gov/boards-and-commissions/board-details/other/cuyahoga-county-planning-commission
3. Lorain County Community Development Department / Planning and Zoning page (search-index corroboration; office at 226 Middle Ave, Elyria 44035): https://www.loraincountyohio.gov/575/Planning-and-Zoning — NOT live-fetchable from this network; see FLAGS
4. Lake County Planning & Community Development (fetched 2026-07-31; name + Painesville address on-page): https://www.lakecountyohio.gov/planning-community-development/
5. Medina County Department of Planning Services (curl 200; 144 N. Broadway St Suite 113, Medina OH 44256): https://www.medinaco.org/planning/ ; department name corroborated by https://www.medinaco.org/wp-content/uploads/2019/09/DPS-Policies-and-Procedures.pdf
6. Geauga County Planning Commission (curl 200; 12611 Ravenwood Dr., Chardon OH 44024): https://bocc.geauga.oh.gov/departments/planning-commission/
7. Port of Cleveland — Cleveland-Europe Express container service; only container service on the Great Lakes: https://www.portofcleveland.com/cleveland-europe-express/ and https://www.portofcleveland.com/maritime-logistics/cargo-capabilities/
8. Cleveland-Cliffs Cleveland Works — integrated steel facility on the Cuyahoga River, access to Port of Cleveland/Great Lakes shipping: https://www.clevelandcliffs.com/operations/steelmaking/cleveland ; Flats industrial context: https://case.edu/ech/articles/i/iron-and-steel-industry
9. ZIP corroboration: 44113 = Cleveland (Tremont/Ohio City area), Cuyahoga County: https://www.unitedstateszipcodes.org/44113/ and https://zipmap.net/Ohio/Cuyahoga_County/Z_Tremont.htm ; 44060 = Mentor, Lake County: https://www.zip-codes.com/zip-code/44060/zip-code-44060.asp ; 44035 = Elyria (Lorain Co. Administration Building address, source 3); 44256 = Medina (Medina County DPS address, source 5); 44024 = Chardon (Geauga County Planning Commission address, source 6)
10. Interstate corridors (I-90/I-71/I-77/I-480/I-271) and Lake Erie / Cuyahoga River geography: https://en.wikipedia.org/wiki/Greater_Cleveland ; Tremont/I-90-I-490-I-71 access corroboration: https://en.wikipedia.org/wiki/Tremont,_Cleveland ; snow-belt (lake-effect) location of Lake/Geauga counties: https://en.wikipedia.org/wiki/Northeast_Ohio

## FLAGS (owner click-check list)

1. **Lorain County zoning URL:** https://www.loraincountyohio.gov/575/Planning-and-Zoning could not be live-verified from this machine (TLS handshake blocked — likely their WAF). VERIFIER 2026-07-31: independently corroborated via a different query — exact URL + title "Planning and Zoning | Lorain County, OH" in the current search index, plus the Community Development Department at 226 Middle Ave (4th floor) Elyria confirmed via county directory/Planning Commission pages; effective grade B. Still click-check before deploy; if dead, fallback https://www.loraincountyohio.gov/332/Building-Directory or omit the county.
2. **Cuyahoga zoning URL choice:** I used the Planning Commission's own official domain (countyplanning.us, not .gov). If the owner prefers strict .gov, swap to https://cuyahogacounty.gov/i-want-to-contact/zoning (verified 200) — but note the countyplanning.us page is the more useful zoning resource.
3. **Ashtabula County omitted** from the county list (in the MSA, but ~55–65 road miles NE) and **Summit County (Akron) omitted** (separate MSA). Owner may add either if the depot's actual radius covers them.
4. **Medina legacy site:** planning.co.medina.oh.us (still ranked in search) is unreachable; medinaco.org/planning is the live page. Nothing to fix — just don't "correct" the URL to the legacy domain.
5. **Snow-belt sentence** in `geography` is standard Northeast Ohio climate fact (Wikipedia-grade corroboration). If the owner wants only A-grade claims in copy, it can be dropped without harming the entry.
6. **Depot existence in Cleveland** is taken from the owner brief/spec (supplier-network depots), not independently verified — per spec, no supplier is named and no SBD-history claims are made in any field above.
