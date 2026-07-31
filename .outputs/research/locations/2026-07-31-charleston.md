# Ground-Truth Dataset — Charleston, SOUTH CAROLINA (depot city)

> Task 2 research output for `docs/superpowers/plans/2026-07-31-locations-national.md`.
> RC-mode: every fact below is from public primary/corroborated sources listed under SOURCES.
> Anything that failed verification was OMITTED. No $, no SBD-history claims, no population stats.
> NOTE FOR TRANSCRIBER: this is Charleston, **South Carolina** — not West Virginia (owner-confirmed in spec).

## Identity / routing

- **name:** Charleston
- **state:** South Carolina
- **stateSlug:** south-carolina
- **slug:** charleston-shipping-containers
- **region:** depot

## counties[] (tri-county metro — verified)

The OMB/Census-defined Charleston–North Charleston, SC MSA is exactly these three counties
(locally "the Tri-County"). All three are genuinely within a depot delivery radius.

1. Charleston County
2. Berkeley County
3. Dorchester County

(Do NOT pad with Colleton or other counties — they are not in the MSA and were not verified.)

## primaryZips (city core + notable delivery areas — all verified)

- `29401` — downtown Charleston peninsula (Charleston County)
- `29405` — North Charleston (Charleston County)
- `29464` — Mount Pleasant (Charleston County)
- `29483` — Summerville (Dorchester County; MSA principal city)
- `29445` — Goose Creek (Berkeley County)

## zoning[] (county authority + official URL, evidence-graded)

| county | office | url | grade |
|---|---|---|---|
| Charleston County | Charleston County Zoning & Planning Department | https://www.charlestoncounty.gov/departments/zoning-planning/ | **A** — official county .gov; HTTP 200 verified 2026-07-31 (note: the older `charlestoncounty.org` address 301s to this .gov URL — use the .gov form) |
| Berkeley County | Berkeley County Planning and Zoning Department | https://berkeleycountysc.gov/dept/planning/ | **B** — official county .gov domain; department page + multiple sibling pages (contact form, zoning verification letter, term definitions) confirmed on the domain via search. curl returns 403 (bot protection), so not machine-fetch-verified — **owner click-check** |
| Dorchester County | Dorchester County Planning & Zoning Department | https://www.dorchestercountysc.gov/business/planning-zoning | **B** — official county .gov domain; page + sibling pages (BZA, comprehensive plan, zoning & land development standards) confirmed on the domain via search. curl returns 403 (bot protection) — **owner click-check** |

All three counties ≥ C → all three INCLUDED. Nothing omitted for grade.

## geography

**Structured (cities.ts contract):**

- **interstates:** `['I-26', 'I-526']`
- **features:** `['Ashley River', 'Cooper River', 'Wando River', 'Atlantic tidal marsh']`

**Prose (honest delivery realities, 2 sentences):**
The Lowcountry is flat and low-lying — the metro is threaded by the Ashley, Cooper, and Wando
rivers and broad tidal marsh, and much of the area sits in mapped flood zones with a high water
table, so soft or low-lying placement sites often need a gravel pad or blocking before a
container goes down. Deliveries run the I-26 corridor from the port inland toward Summerville
and Moncks Corner and loop the metro on I-526, with island and beach communities reached by
bridge causeways.

## areaProfile (2–3 sentences)

The Charleston metro is built around the Port of Charleston — which SC Ports ranks as the
8th-largest U.S. container port — with major industrial
anchors in Boeing's 787 Dreamliner final-assembly campus in North Charleston and the Volvo Car
plant in Ridgeville, Berkeley County. Beyond the port and plants, hurricane-season preparedness
is a recurring fact of life on this stretch of coast — the state's emergency management division
publishes evacuation zones and an annual hurricane guide for the Charleston coastline — so
locals here think about secure, weather-tight storage in a way inland metros don't have to.

## commonUses[] (4, persona-tagged, grounded in the verified metro economy)

1. `{ label: 'Port-linked freight & logistics overflow storage along the I-26 corridor', persona: 'businesses' }`
   — grounded: Port of Charleston, 8th-largest US container port (SC Ports FY25 release).
2. `{ label: 'Aerospace & automotive supplier storage near Boeing North Charleston and Volvo Ridgeville', persona: 'businesses' }`
   — grounded: Boeing 787 final assembly in North Charleston (Boeing); Volvo Car plant in Ridgeville, Berkeley County (Volvo/SC Commerce).
3. `{ label: 'New-construction jobsite storage in the Summerville–Goose Creek–Moncks Corner growth corridor', persona: 'contractors' }`
   — grounded: Summerville is an MSA principal city (Census); Goose Creek and Moncks Corner are the Berkeley County suburban corridor along I-26.
4. `{ label: 'Home-renovation and hurricane-season storage for coastal and flood-zone properties', persona: 'homeowners' }`
   — grounded: SCEMD Know Your Zone evacuation zones + annual SC Hurricane Guide cover the Charleston coast.

(Port city → leans logistics/business per plan guidance; no farmers entry — upper-county
agriculture exists but no strong public corroboration tying it to container use, so omitted
rather than padded.)

## usesIntro (1 city-specific line)

"From the container terminals on the Cooper River to the growth corridor around Summerville, here's how the Lowcountry puts a container to work."

## seo (follows existing entries' pattern; description uses the `${CONDITION.label}` template var)

- **title:** `Shipping & Storage Containers for Sale in Charleston, SC | Steel Box Direct`
- **description:** `` `Buying a shipping container in Charleston? We provide ${CONDITION.label} containers with depot-based delivery to Charleston, Berkeley, and Dorchester counties.` ``
  (VERIFIER EDIT 2026-07-31: "flat-fee delivery" → "depot-based delivery" — flat-fee is a home-region claim not verified for depot markets; owner may restore.)

## Supporting copy notes (for Task 3 transcription — delivery framing must be depot-based per spec)

- Delivery counties list: `['Charleston County', 'Berkeley County', 'Dorchester County']`
- Depot framing: fulfilled through the supplier network from a depot in the area (bridge copy
  verbatim from spec — never name the supplier). NO "250 miles of Cincinnati" line.
- Map center (city hall / peninsula): approx `32.7765,-79.9311`; suggested bbox `-80.131,32.576,-79.731,32.976` (same 0.4° pattern as existing entries).

---

## SOURCES

1. **Tri-county MSA definition** — Census Reporter, Charleston–North Charleston, SC Metro Area (OMB delineation: Berkeley, Charleston, Dorchester): http://censusreporter.org/profiles/31000US16700-charleston-north-charleston-sc-metro-area/ ; corroborated by Wikipedia "Charleston metropolitan area, South Carolina" (principal cities Charleston, North Charleston, Summerville).
2. **Port of Charleston volume** — SC Ports Authority news release, "Railed cargo, container volume grows at SC Ports in FY25" (July 21, 2025): https://scspa.com/news/railed-cargo-container-volume-grows-at-sc-ports-in-fy25/ — "2.6 million TEUs in fiscal year 2025, up 3%"; "8th largest U.S. container port". PRIMARY source.
3. **Charleston County zoning** — https://www.charlestoncounty.gov/departments/zoning-planning/ (HTTP 200 verified; .org variant redirects here).
4. **Berkeley County zoning** — https://berkeleycountysc.gov/dept/planning/ (official domain, corroborated by sibling pages: /dept/planning/contact-form/, /dept/planning/zoning-verification-letter/).
5. **Dorchester County zoning** — https://www.dorchestercountysc.gov/business/planning-zoning (official domain, corroborated by sibling pages: comprehensive plan, zoning & land development standards, BZA pages).
6. **Boeing North Charleston** — Boeing mediaroom, "Boeing South Carolina Breaks Ground on 787 Site Expansion": https://boeing.mediaroom.com/2025-11-07-Boeing-South-Carolina-Breaks-Ground-on-787-Site-Expansion ; 787 final assembly consolidated in North Charleston (2021), per Boeing/Wikipedia "Boeing South Carolina".
7. **Volvo Car plant, Ridgeville (Berkeley County)** — Volvo Car USA: https://www.volvocars.com/us/l/hometown/ ; SC Dept. of Commerce: https://www.sccommerce.com/industries/success-stories/volvo
8. **Hurricane preparedness context** — SCEMD SC Hurricane Guide: https://www.scemd.org/stay-informed/publications/hurricane-guide/ ; Know Your Zone evacuation zones: https://www.scemd.org/prepare/know-your-zone/
9. **ZIP codes** — zip-codes.com Charleston County listing + zipcode.org city listings (29401 downtown Charleston; 29405 North Charleston; 29464 Mount Pleasant; 29483 Summerville; 29445 Goose Creek), cross-consistent across multiple ZIP databases.

## FLAGS

- **Owner click-check required:** Berkeley (https://berkeleycountysc.gov/dept/planning/) and Dorchester (https://www.dorchestercountysc.gov/business/planning-zoning) zoning URLs return 403 to automated fetchers (bot protection) — both are on the counties' official .gov domains and corroborated by multiple sibling pages, but a human click-check post-deploy is the Phase-1 precedent.
- **Charleston County domain note:** county migrated `charlestoncounty.org` → `charlestoncounty.gov`; the dataset uses the .gov URL (verified 200). If a verifier sees the .org form elsewhere, it 301s to .gov.
- **Storm-prep framing:** hurricane risk/preparedness on the Charleston coast is corroborated (SCEMD); container-demand causation is framed qualitatively ("locals think about secure storage"), never as a statistic. Do not harden this into a demand stat.
- **Omitted on purpose:** metro population figures (source was not census.gov — rule says omit); a farmers common-use (insufficient public corroboration for coastal Charleston); any Colleton/other-county expansion; I-95 (clips only the far western edge of the metro — not honest as a delivery corridor for the tri-county core).
- **TEU figure shelf-life:** "2.6 million TEUs in FY2025" is the latest SC Ports fiscal-year release as of research date. VERIFIER EDIT 2026-07-31: the TEU figure was removed from the page-facing areaProfile (dated volume stat with shelf-life; the attributed "8th-largest" rank stays). The figure remains available in SOURCES if the owner wants it back with a re-check of scspa.com.
