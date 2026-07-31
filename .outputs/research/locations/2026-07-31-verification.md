# Verification Report — 8 Depot-City Ground-Truth Datasets (2026-07-31)

Independent adversarial verification (RC-mode) of the eight researcher outputs in
`.outputs/research/locations/2026-07-31-{cleveland,savannah,charleston,norfolk,houston,new-york,detroit,kansas-city}.md`
against Task 2 of `docs/superpowers/plans/2026-07-31-locations-national.md` and the spec
`docs/superpowers/specs/2026-07-31-locations-national-design.md`.

## Method (independent of the researchers)

1. **All 42 zoning/permitting URLs re-fetched** (curl, browser UA, status + `<title>` captured).
   Every Grade-A claim returned HTTP 200 with a plausible, matching title.
2. **All 16 bot-walled B/C URLs corroborated via DIFFERENT search queries** than a researcher
   would use (office names, street addresses, ordinance topics — not `site:domain zoning`),
   plus WebFetch (independent network path) and, for the one holdout, the Wayback Machine
   CDX/snapshot record.
3. **16 ZIPs (2 per city) checked against the Zippopotam/GeoNames API** — a source no
   researcher cited. 16/16 map to the claimed place (one naming note below).
4. **County lists cross-checked against OMB/Census MSA delineations** (2023 revision),
   including fresh searches for the Cleveland (6-county, incl. Ashtabula) and Houston
   (10-county) delineations.
5. **Fabrication grep across all 8 files:** supplier names ("Freedom Conex"), `$` amounts,
   ratings/`x/5`, "units placed", "ISO-certified", population figures in page-copy fields —
   all clean. Population numbers appear only inside sourcing/method notes, never in
   page-facing fields.
6. **Contract + cross-file checks:** Task-2 field list present in all 8; slugs all end
   `-shipping-containers`; stateSlugs all kebab-case (`ohio`, `georgia`, `south-carolina`,
   `virginia`, `texas`, `new-york`, `michigan`, `missouri`); seo titles all match the existing
   entries' "Shipping & Storage Containers for Sale in {City}, {ST} | Steel Box Direct"
   pattern; no cross-file contradictions (Cleveland shares `ohio` with Cincinnati/Dayton as
   intended).

---

## Per-city verdicts

### Cleveland, OH — PASS-WITH-FIXES (applied)
- All 5 zoning URLs verified: Cuyahoga (countyplanning.us, 200 ✓ + .gov alternate 200 ✓),
  Lake (200 ✓), Geauga (200 ✓), Medina (200 ✓ — researcher's B stands, live-verified twice).
- Lorain (C+): TLS-blocked to all automated clients here too, but independently corroborated
  via a different query (exact URL + title + department + 226 Middle Ave Elyria address).
  **Fix applied:** FLAG updated with the verifier corroboration; effective grade B. Click-check stands.
- Counties: 5 of the 6-county 2023 OMB MSA; Ashtabula omission documented by the researcher ✓.
- ZIPs 44113 → Cleveland OH ✓, 44060 → Mentor OH ✓ (Zippopotam).
- Port/steel claims trace to portofcleveland.com / clevelandcliffs.com ✓; commonUses grounded.
- **Fix applied:** seo.description "flat-fee delivery" → "depot-based delivery" (see global fix).

### Savannah, GA — PASS
- Chatham/thempc.org 200 ✓ ("Chatham County Zoning"), Bulloch 200 ✓, Liberty 200 ✓.
- Effingham (B) corroborated (exact URL "Planning & Zoning | Effingham County, GA" + 804 S.
  Laurel St address via different query) ✓. Bryan (B) corroborated (exact URL "Community
  Development | Bryan County" + GA DCA linkage) ✓.
- MSA = Bryan/Chatham/Effingham ✓; Bulloch/Liberty marked non-MSA delivery adds by the
  researcher — honest, documented ✓.
- ZIPs 31401 → Savannah ✓, 31322 → Pooler ✓.
- Port superlative properly attributed to GPA; Hyundai/Gulfstream/Fort Stewart qualitative ✓.
- Already used "depot-based delivery" in seo — the pattern the other files were normalized to.
- No edits needed.

### Charleston, SC — PASS-WITH-FIXES (applied)
- Charleston County .gov 200 ✓. Berkeley (B) + Dorchester (B) 403-walled; both corroborated
  via different queries (Berkeley: exact URL "Planning and Zoning – Berkeley County Government"
  + Moncks Corner address; Dorchester: exact URL "Planning & Zoning | Dorchester County, SC
  website" + 500 N. Main St Summerville) ✓.
- Tri-county MSA exactly right; researcher explicitly refused padding ✓.
- ZIPs 29401 → Charleston ✓, 29464 → Mount Pleasant ✓.
- **Fix applied:** removed the dated "2.6 million TEUs in fiscal year 2025" volume stat from the
  page-facing areaProfile (shelf-life; stat-bearing page copy). The attributed "8th-largest
  U.S. container port" rank stays. Figure preserved in SOURCES.
- **Fix applied:** seo.description "flat-fee delivery" → "depot-based delivery".

### Norfolk, VA — PASS-WITH-FIXES (applied)
- 5 of 7 URLs re-verified 200 with exact titles (Virginia Beach, Portsmouth, Suffolk,
  Newport News, Hampton) ✓. Norfolk (B) corroborated via different query (exact URL "Zoning |
  City of Norfolk, Virginia - Official Website" + sibling Dept. of City Planning page) ✓.
  Chesapeake (B) corroborated (exact URL "Zoning Administration | Chesapeake, VA") ✓.
- Independent-cities structure is the honest representation and is internally consistent;
  the researcher's template warning is correct (see TRANSCRIBER NOTES).
- ZIPs 23510 → Norfolk ✓, 23320 → Chesapeake ✓. Excluding 23511 (Naval Station) was right.
- "World's largest naval station" (Navy), "largest industrial employer in Virginia" (HII/VEDP),
  Planters 1912 (city history) all primary-sourced; headcount properly kept OUT of page copy ✓.
- **Fix applied:** seo.description "flat-fee delivery" → "depot-based delivery" (+ FLAG #6).

### Houston, TX — PASS-WITH-FIXES (applied)
- City of Houston DevelopRegs 200 ✓ (no-zoning statement is real and on-page), Harris OCE 200 ✓
  (content: "Permits Division is primarily responsible for permitting all development within
  Harris County"), Fort Bend 200 ✓.
- Montgomery (B): curl 200 re-verified AND content-confirmed here ("permit will be required
  for any development on a property…") — stronger than the researcher graded it ✓.
- Brazoria (C) + Galveston (C): 403-walled; both corroborated via different queries (Brazoria:
  sibling /departments/floodplain/contact-us + 451 N. Velasco Angleton; Galveston: sibling
  /floodplain/floodplain-application, /floodplain-faq-s, /development-guidelines pages) ✓.
  Kept at C, owner click-check stands.
- The no-zoning/permitting framing is CORRECT (verified on houstontx.gov) — do not "fix" it.
- **Fix applied:** documented the researcher's undocumented scoping call — 2023 OMB MSA is
  TEN counties; the five outer ones are a delivery-radius omission (note added to counties[]).
- ZIPs 77002 → Houston ✓. 77380 → Zippopotam/USPS default place name is "Spring, TX"; the ZIP
  covers south Woodlands in Montgomery County, so the dataset's label is acceptable — noted.
- **Fix applied:** seo.description "flat-fee delivery" → "depot-based delivery" (+ FLAG #7).

### New York, NY — PASS
- All 4 URLs re-verified 200 ✓ (DCP zoning page JS-rendered exactly as the researcher flagged —
  content grep confirms zoning content; DOB title exact; Nassau title exact; Westchester title exact).
- Citywide-zoning structure (2 NYC rows + 2 county rows) is the honest representation ✓.
- Boroughs=counties is settled civic fact; Nassau/Westchester inclusion flagged as a judgment
  call by the researcher — acceptable and documented ✓.
- ZIPs 10001 → New York City ✓, 10301 → Staten Island ✓.
- Port (PANYNJ) and construction (NYBC) claims attributed/qualitative ✓. Only dataset that
  drafted the FULL template field set (eyebrow/lede/delivery/content/stats/cta/map) — the
  model the other seven should have followed.
- No edits needed.

### Detroit, MI — PASS-WITH-FIXES (applied)
- Wayne/BSEED 200 ✓, Macomb 200 ✓, Livingston 200 ✓.
- Oakland (B) 403-walled; corroborated via different query (exact URL "Planning Services -
  Land Use, Zoning & Policy | Oakland County, MI" + 2100 Pontiac Lake Rd Waterford address) ✓.
- St. Clair (was B): the exact `/SubHome/Index/645` path appears NOWHERE in the current search
  index. Wayback snapshot (2023-05-28) confirms it WAS the Metro Planning Commission page
  (headings: Metro Planning Commission/Office, County Master Plan), but zero archive captures
  since 2024 and the currently-indexed MPC pages use `stclaircounty.org/offices/metro/`.
  **Weakest URL of all 42.** **Fix applied:** FLAG downgraded to B→C with the current-index
  fallback URL; owner click-check FIRST, swap-or-omit instruction added.
- Counties: 5 of the 6-county MSA; Lapeer omission documented ✓. Michigan local-zoning honesty
  note is correct (Act 110 of 2006).
- ZIPs 48226 → Detroit ✓, 48083 → Troy ✓.
- **Fix applied:** seo.description "flat-fee delivery" → "depot-based delivery" (FLAG #4 updated).

### Kansas City, MO — PASS-WITH-FIXES (applied)
- Clay 200 ✓, Platte 200 ✓, Johnson KS (optional) 200 ✓.
- Jackson (B) corroborated via different query (exact URL "Zoning & Subdivision Applications -
  Jackson County MO" + county building-permit PDFs under /public-works/zoning-amp-subdivision-applications/) ✓.
- Cass (B) corroborated (exact URL title + department PDFs naming "Building Codes,
  Environmental Health and Zoning" at 30508 SW Outer Road, Harrisonville) ✓.
- Wyandotte (optional, B) corroborated (exact URL "Zoning Code" on wycokck.org) ✓.
- Bi-state handling mirrors Cincinnati's KY precedent, clearly marked; optional KS rows
  correctly quarantined as an owner decision ✓.
- ZIPs 64106 → Kansas City ✓, 64701 → Harrisonville ✓.
- Rail-hub and Claycomo/Ford claims qualitative + sourced ✓.
- **Fix applied:** seo.description "flat-fee delivery" → "depot-based delivery" (+ FLAG #7).

---

## Global fix applied across 6 files

**"flat-fee delivery" → "depot-based delivery"** in the seo.description of Cleveland,
Charleston, Norfolk, Houston, Detroit, and Kansas City. "Flat-fee delivery" is a
pricing-structure claim verified only for the home region; carrying it verbatim into depot
markets is an unverified business claim (Detroit's researcher flagged this themselves;
Savannah and New York had already avoided it). Removal-only fix — the owner may restore
"flat-fee" wording if it genuinely holds for depot-fulfilled markets (see TRANSCRIBER NOTES).

## Fabrication hunt — result: CLEAN

- No "Freedom Conex"/supplier names anywhere. No `$` amounts. No ratings, review averages,
  "units placed", or ISO claims. No SBD-history claims for any depot city (Cleveland FLAG 6
  explicitly notes depot existence comes from the owner brief, not research — correct posture).
- All superlatives in page copy are attributed to a primary source (GPA, SC Ports, Port
  Houston, PANYNJ, US Navy, HII/VEDP) or kept qualitative.
- Every commonUse traces to a stated grounding; the two "missing farmers persona" cases
  (Charleston, Houston, NYC) are documented omissions, not paddings — correct under RC rules.
- One stat was removed from page copy as a precaution (Charleston TEU figure, above).

## Contract completeness

All Task-2 required fields (name, state, stateSlug, slug, counties[], primaryZips, zoning[],
geography, areaProfile, commonUses[], usesIntro, seo) are present in all 8 files. However,
the full `City` interface also requires **eyebrow, lede, delivery{headline,body,counties},
map, content{h2,intro,features[3]}, stats[3], cta** — coverage of these is uneven (a
researcher gap, not a transcriber liberty): NY = complete; Savannah/KC = partial; Cleveland/
Houston/Detroit = map only; Charleston = map center only; Norfolk = none. See TRANSCRIBER
NOTES #6.

---

## OWNER CLICK-CHECK LIST (every B/C URL — one line each; ⚑ = check first)

1. ⚑ Detroit / St. Clair Co MPC: https://www.stclaircounty.org/SubHome/Index/645 — no index/archive trace since 2023; fallback https://www.stclaircounty.org/offices/metro/
2. Cleveland / Lorain Co: https://www.loraincountyohio.gov/575/Planning-and-Zoning
3. Savannah / Effingham Co: https://www.effinghamcounty.org/241/Planning-Zoning
4. Savannah / Bryan Co: https://www.bryancountyga.gov/government/departments-h-z/planning-zoning
5. Charleston / Berkeley Co: https://berkeleycountysc.gov/dept/planning/
6. Charleston / Dorchester Co: https://www.dorchestercountysc.gov/business/planning-zoning
7. Norfolk / City of Norfolk: https://www.norfolk.gov/1088/Zoning
8. Norfolk / City of Chesapeake: https://www.cityofchesapeake.net/645/Zoning-Administration
9. Houston / Brazoria Co (grade C): https://www.brazoriacountytx.gov/departments/floodplain
10. Houston / Galveston Co (grade C): https://www.galvestoncountytx.gov/county-offices/engineering-floodplain-right-of-way/floodplain
11. Detroit / Oakland Co: https://www.oakgov.com/community/community-development/planning-services
12. Kansas City / Jackson Co: https://www.jacksongov.org/Business/Development-and-Construction/Zoning-Subdivision-Applications
13. Kansas City / Cass Co: https://www.casscounty.com/2144/Building-Codes-Zoning-Environmental-Heal
14. Kansas City / Wyandotte Co KS (only if the optional KS rows ship): https://www.wycokck.org/Departments/Planning-and-Urban-Design/Zoning-Code
15. (low priority — machine-verified 200 by verifier) Houston / Montgomery Co: https://www.mctx.org/departments/departments_d_-_f/environmental_health/permitting/index.php
16. (low priority — machine-verified 200 twice) Cleveland / Medina Co: https://www.medinaco.org/planning/

## TRANSCRIBER NOTES (template implications — Task 3/4 must handle these)

1. **Norfolk "counties" wording:** the zoning/delivery lists carry "City of …" entries
   (Virginia independent cities — there are no county zoning offices). Any template heading
   or copy that hardcodes "counties" will be wrong on this page; render as "local zoning
   authorities" / "cities served" or equivalent. The "Counties served" stat label also needs
   a Norfolk-safe variant.
2. **Houston section label:** Houston has NO zoning (verified on houstontx.gov) and Texas
   counties cannot zone. The zoning[] rows are development/permitting authorities — the
   section must be labeled "development & permitting resources" (or similar), NOT "zoning
   offices". Also: 6 zoning[] rows for 5 counties (City of Houston + unincorporated Harris
   are genuinely different authorities) — keep both; `county` is a display label.
3. **NYC citywide zoning rows:** two rows cover "New York City (all five boroughs)" (DCP +
   DOB) plus two county rows (Nassau/Westchester, which note that zoning is municipal there).
   The zoning table must render these row labels as given — do not expand to five duplicated
   borough rows.
4. **KC/Cincinnati bundle counting:** KC's counties[] has 5 entries with 'Johnson/Wyandotte
   (KS)' combined (mirrors Cincinnati's 'Boone/Kenton/Campbell (KY)'). If a stat tile counts
   counties from array length, KC shows '5' — consistent with Cincinnati's precedent, but the
   bundle covers 6 actual counties; keep whichever convention Cincinnati already renders.
   The optional KS zoning rows are an OWNER decision — do not transcribe them silently.
5. **Depot-tier "flat-fee delivery" claim — OWNER QUESTION:** verifier normalized all depot
   seo descriptions to "depot-based delivery" because flat-fee is only verified for the home
   region. If the flat-fee structure DOES hold for depot markets, the owner can restore the
   stronger wording in one sweep at transcription time.
6. **Copywriting-field gap (researcher gap, not transcriber liberty):** the City interface
   needs eyebrow, lede, delivery.headline/body, content{h2,intro,features}, stats, cta, map
   for every entry. Only New York delivered all of them; Savannah/KC partial; the rest ship
   map coordinates at most. Task 3's "the transcriber adds NOTHING" is not satisfiable for
   these fields as-is: either route the gap back through a copy-drafting pass constrained to
   each dataset's verified facts (NY's entry is the model), or explicitly amend the task to
   allow claim-free boilerplate adapted from existing entries. Do NOT let the transcriber
   invent new city facts to fill them.
7. **Michigan/NY-suburb zoning honesty:** Detroit's and NYC's county rows are pointer
   resources (zoning is municipal under MI Act 110 / NY home rule). The existing
   "permits/zoning are set by your local authority and are the buyer's responsibility"
   template line covers this — keep it, don't strengthen county-authority claims.
8. **Bridge copy** is spec-law and template-level; none of the 8 datasets embed it — correct.
   No dataset names the supplier anywhere.

## Verdict summary

| City | Verdict |
|---|---|
| Cleveland | PASS-WITH-FIXES (applied) |
| Savannah | PASS |
| Charleston | PASS-WITH-FIXES (applied) |
| Norfolk | PASS-WITH-FIXES (applied) |
| Houston | PASS-WITH-FIXES (applied) |
| New York | PASS |
| Detroit | PASS-WITH-FIXES (applied) |
| Kansas City | PASS-WITH-FIXES (applied) |

No FAILs. All fixes were applied directly in the dataset files (removals/corrections only —
no new unverified claims added). The set is cleared for Task-3 transcription subject to the
TRANSCRIBER NOTES above and the owner click-check list post-deploy.
