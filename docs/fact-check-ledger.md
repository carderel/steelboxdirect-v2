# Fact-Check Ledger

Append-only log of independent fact checks for steelboxdirect.com. Owner rule (2026-10-08): every new page or post, and every new claim, statement or statistic, is verified by an agent that did NOT write it, using research from a reputable source (not memory). One entry per page, newest at the bottom. Never edit or delete past entries; if a fact changes, add a new entry that supersedes it.

**Verdicts:** VERIFIED (source confirms), CORRECTED (draft was wrong; fixed value given), REMOVED (no reputable source; claim cut), SITE-DATA (taken from the site's own data module, e.g. pricing.ts; module named), OPINION (judgment/advice, not a factual claim; no source needed).

**Source grades:** A = primary/official (standards body, carrier spec sheet, government agency); B = reputable secondary (trade publication, major industry org); C = weak (blog, forum, search snippet). A C-grade source alone is not enough for VERIFIED.

## Entry template

```
## <page or post slug> — <YYYY-MM-DD>
Checked by: <agent type>, independent of author: <yes>
Status of page: <draft | live>

| # | Claim (as written) | Verdict | Correct value / note | Source (URL) | Grade | Accessed |
|---|---|---|---|---|---|---|
```

---

## blog/container-size-type-codes (draft 2026-10-08-container-type-codes.md) — 2026-10-08
Checked by: data-auditor, independent of author: yes
Status of page: draft
Freshness: checked 2026-10-08. BIC web page live 2026-10-08 (current table); BIC table PDF dated 2018 (reproduces ISO 6346:1995/Amd 3:2012); ICHCA BP#25 dated Nov 2021; Hapag-Lloyd spec dated 03/2016 (used for code lists only, not for weights); Marfret PDF dated 2017.

| # | Claim (as written) | Verdict | Correct value / note | Source (URL) | Grade | Accessed |
|---|---|---|---|---|---|---|
| 1 | The 4-character size and type code sits under the ID number on the right-hand door | VERIFIED | BIC: the four characters "commonly appear right under the container identification sequence"; ICHCA: the markings are in "the upper right-hand corner of the container's right-hand door" | https://www.bic-code.org/size-type-code/ ; https://ichca.com/wp-content/uploads/2015/10/BP-25-AN-ILLUSTRATED-GUIDE-TO-CONTAINER-SIZE-AND-TYPE-CODES-2021-Publication-FINAL.pdf | A | 2026-10-08 |
| 2 | The code comes from ISO 6346; BIC publishes the code tables | VERIFIED | The BIC page publishes Tables 1-3 and refers markers to the latest ISO 6346 | https://www.bic-code.org/size-type-code/ | A | 2026-10-08 |
| 3 | Since 1995, every ISO container must carry this code | VERIFIED | ICHCA: "Since 1995, it has been a mandatory requirement that all ISO containers must be marked with the appropriate Size and Type Codes"; BIC: "Since 1995 the ISO marking standard includes..." | ICHCA BP#25 URL above; https://www.bic-code.org/size-type-code/ | A | 2026-10-08 |
| 4 | Order is length, then height (and width), then type group, then type detail | VERIFIED | BIC: "The first character is related to the length... The second character is relative to its height. The remaining two elements... identify the container type and characteristics" | https://www.bic-code.org/size-type-code/ | A | 2026-10-08 |
| 5 | 45G1 = 40ft, 9'6" tall, GP with passive vents = 40ft High Cube (also the 42G1 vs 45G1 FAQ: one foot taller) | VERIFIED | Hapag-Lloyd: "HIGH CUBE GENERAL PURPOSE CONTAINER, ISO Size Type Code: 45G0, 45G1", 9'6"; 42G0/42G1 = 8'6" | https://www.hapag-lloyd.com/content/dam/website/downloads/press_and_media/publications/15211_Container_Specification_engl_Gesamt_web.pdf | A | 2026-10-08 |
| 6 | A "20ft" box is really a hair under 20 feet | VERIFIED | ICHCA Table 2 note: "a 20 ft container is actually 19' 10.5" long, see ISO 668" | ICHCA BP#25 URL above | A | 2026-10-08 |
| 7 | Length table 1=10, 2=20, 3=30, 4=40, 5=45, B=24, C=24'6", G=41, H=43, M=48, N=49, P=53 ft | VERIFIED | Matches the BIC current Table 1 (2991/6058/9125/12192/13716/7315/7430/12500/13106/14630/14935/16154 mm) | https://www.bic-code.org/size-type-code/ | A | 2026-10-08 |
| 8 | On used boxes in the US you'll almost always see 2 or 4 | OPINION | Flag: an unsourced inference presented as fact. It is plausible, and it matches the sizes the site sells | - | - | 2026-10-08 |
| 9 | Height table 0=8'0", 2=8'6", 4=9'0", 5=9'6", 6=>9'6", 8=4'3", 9=<=4'0" | VERIFIED | BIC Table 2: 2438/2591/2742/2896/>2896/1295/<=1219 mm. "Half height" for code 8 is a gloss, not BIC wording | https://www.bic-code.org/size-type-code/ | A | 2026-10-08 |
| 10 | A number in position 2 means 8 ft wide; a letter means wider than 8 ft | VERIFIED | BIC Table 2: the numeric column is the 2438 mm width; the letter codes fall in the >2438 mm width columns | https://www.bic-code.org/size-type-code/ | A | 2026-10-08 |
| 11 | One carrier sheet lists 4CG1 as a 40ft palletwide | VERIFIED | Marfret: "4CG1 40' Palletwide" | https://www.marfret.com/app/uploads/2017/12/iso-en.pdf | A | 2026-10-08 |
| 12 | Type groups G, V, B, R, U, P, T | VERIFIED | BIC Amd 3 table lists G/V/B/R/U/P. The BIC page lists "T1 - Tank Container". Note: the Amd 3 table codes tanks as K/N; T is the group on the BIC page | https://www.bic-code.org/wp-content/uploads/2018/01/SizeAndType-Table1-3.pdf ; https://www.bic-code.org/size-type-code/ | A | 2026-10-08 |
| 13 | Detail codes G0, G1, V0, B0, R1, U1, P0, P1, P3 as described | VERIFIED | BIC Amd 3 table: G0 "Opening(s) at one end or both ends"; G1 "Passive vents at upper part of cargo space"; V0 non-mechanical; B0 closed; R1 "Mechanically refrigerated and heated"; U1 open top "plus removable top member(s) in end frames" (draft simplifies to "Open top", acceptable); P0 platform; P1 "Two complete and fixed ends"; P3 "Folding complete end structure" | https://www.bic-code.org/wp-content/uploads/2018/01/SizeAndType-Table1-3.pdf | A | 2026-10-08 |
| 14 | G0 and G1 differ only by the small vents near the roof | VERIFIED | Same table: both are group GP; G1 adds "passive vents at upper part of cargo space" | same as #13 | A | 2026-10-08 |
| 15 | A letter in the 4th position means reduced stacking or racking rating | VERIFIED | BIC: "Containers with reduced stacking and racking strength are marked with a letter in the 4th position" | https://www.bic-code.org/size-type-code/ | A | 2026-10-08 |
| 16 | Lookup codes 22G1, 22G0, 20G0, 42G1, 42G0, 45G1, 45G0, L5G1, 22R1, 42R1, 45R1, 22U1, 42U1, 45U1, 22P1/42P1, 22P3/42P3 and their meanings | VERIFIED | All are listed in Hapag-Lloyd "Container Size Type Codes According to ISO 6346" (03/2016) with matching L x H and type | Hapag-Lloyd URL in #5 | A | 2026-10-08 |
| 17 | 25G1 = 20ft high cube dry with vents | VERIFIED | Built from the BIC tables (2 = 20 ft, 5 = 9'6", G1). It is not on the Hapag list | https://www.bic-code.org/size-type-code/ | A | 2026-10-08 |
| 18 | We sell three sizes, all WWT used (20ft, 40ft, 40ft HC); code mapping to those | SITE-DATA | src/data/containers.ts (three entries); src/pages/condition/index.astro ("Everything we sell is used Wind & Water Tight") | src/data/containers.ts | site data | 2026-10-08 |
| 19 | G1 and G0 are both common in the used market | OPINION | Flag: unsourced market observation | - | - | 2026-10-08 |
| 20 | For years L meant 45 ft; carrier sheets list the 45ft HC as L5G1 | VERIFIED | The BIC 2018 PDF reproducing ISO 6346:1995/Amd 3:2012 lists 13,716 mm / 45 ft = "L", with 5 "unassigned". Hapag-Lloyd 03/2016 lists "45' x 9'6" High Cube Cont. L5G1" | https://www.bic-code.org/wp-content/uploads/2018/01/SizeAndType-Table1-3.pdf ; Hapag-Lloyd URL in #5 | A | 2026-10-08 |
| 21 | BIC's current table moves 45 ft to the digit 5 and lists L as unassigned | VERIFIED | The current BIC page Table 1 has 13716 mm 45 ft = 5 and L = "unassigned" | https://www.bic-code.org/size-type-code/ | A | 2026-10-08 |
| 22 | A newer 45ft high cube could be marked 55G1 | VERIFIED | Derived from the current BIC table and hedged ("could"). Flag: no in-service 55G1 example or carrier sheet was found | https://www.bic-code.org/size-type-code/ | A | 2026-10-08 |
| 23 | FAQ: "most 45-foot high cubes in service are marked L5G1" | CORRECTED | No source quantifies "most". Use "commonly marked L5G1 (the code carrier spec sheets list)" | Hapag-Lloyd URL in #5 | A | 2026-10-08 |
| 24 | Pre-1995 boxes may carry all-number 1984 codes; marking was optional then; some very old boxes have no code | VERIFIED | ICHCA: "Prior to 1995, markings were optional (1984 edition of ISO Standard 6346). Some ISO containers built before 1984 will not bear the Size and Type Code markings" | ICHCA BP#25 URL above | B | 2026-10-08 |
| 25 | In old codes the first two digits are size and the last two are type | VERIFIED | ICHCA: "The first two digits of the size and type code are the size code" (1984 tables) | ICHCA BP#25 URL above | B | 2026-10-08 |
| 26 | 2200 = 20ft 8'6" GP; 2210 = same with passive vents; 4510 = 40ft, >8'6", gooseneck tunnel, passive vents (body and FAQ) | VERIFIED | ICHCA Fig 8: "Type 2200, 20ft long, 8ft 6in high... marked under the 1984 version". The cover box (22G1) "would have been 2210". 1984 Table 1: size 45 = 40 ft, h > 2591 mm, WITH gooseneck tunnel. Appendix A: type 10 = "Passive vents at upper part of cargo space" | ICHCA BP#25 URL above | B | 2026-10-08 |
| 27 | A gooseneck tunnel lets the box sit lower on a special chassis; it is a recess in the floor at one end | VERIFIED | ICHCA: tunnels "allow a container to be carried on a gooseneck chassis which lowers their overall height". Flag: the "recess in the floor at one end" detail is not stated by ICHCA (unverified, low risk) | ICHCA BP#25 URL above | B | 2026-10-08 |
| 28 | The current size code no longer tracks the gooseneck tunnel | VERIFIED | ICHCA: size code covered gooseneck "under the 1984 standard"; the same 9'6" gooseneck box under the current standard is plain 45 | ICHCA BP#25 URL above | B | 2026-10-08 |
| 29 | The ID number is usually painted on the roof too | VERIFIED | The BIC marking page shows ID marks on the door end, sides, top and blind end | https://www.bic-code.org/marking-of-containers/ | A | 2026-10-08 |
| 30 | Some CSC safety plates also list the size and type code | REMOVED | The BIC CSC/combined data plate page lists approval, date, ID number, payload and stacking/racking values, but not the size-type code. No reputable source found. Cut the sentence | https://www.bic-code.org/csc-combined-data-plate/ | A | 2026-10-08 |
| 31 | The code describes how a box was built, not its condition | OPINION | Logical; no source needed | - | - | 2026-10-08 |

## blog/are-shipping-containers-airtight (draft 2026-10-08-are-containers-airtight.md) — 2026-10-08
Checked by: data-auditor, independent of author: yes
Status of page: draft
Freshness: checked 2026-10-08. CDC/EPA/OSHA/HSE pages live 2026-10-08. HSE RR1178 page updated 2025-04-03 (study 2017-2019). GDV handbook pages undated. NIOSH archive page (last reviewed 2016) is cited by the draft but supports no specific claim.

| # | Claim (as written) | Verdict | Correct value / note | Source (URL) | Grade | Accessed |
|---|---|---|---|---|---|---|
| 1 | A shipping container is not airtight; WWT keeps out rain, wind, snow, pests | VERIFIED | GDV: "Standard containers should not be considered to be absolutely water vapor tight... especially in the door area". BIC's type table keeps "Airtight" as a separate bulk code (B1), not GP. WWT definition per src/pages/condition/index.astro | https://www.tis-gdv.de/tis_e/containe/klima/klima-htm/ ; https://www.bic-code.org/wp-content/uploads/2018/01/SizeAndType-Table1-3.pdf | B / A | 2026-10-08 |
| 2 | "Nobody tests a WWT container for air" (and the FAQ's "not built or tested to be airtight") | CORRECTED | Absolute claim, unsourced. Reword: "WWT is a weather-and-water grade, not an airtightness rating." No source was opened for test procedures | (GDV URL in #1 supports "not airtight" only) | B | 2026-10-08 |
| 3 | Door gaskets stop water but are not a perfect air seal; a little air moves in and out | VERIFIED | GDV: wear "especially in the door area, time and time again results in leaks" | GDV URL in #1 | B | 2026-10-08 |
| 4 | Some containers have small vents up high; others have none | VERIFIED | BIC: G1 = passive vents at upper part; G0 = no vent designation | https://www.bic-code.org/wp-content/uploads/2018/01/SizeAndType-Table1-3.pdf | A | 2026-10-08 |
| 5 | "...or the old ones are blocked" | REMOVED | No source. Cut, or hedge as "vents can get clogged; check them" (OPINION) | - | - | 2026-10-08 |
| 6 | Leakage is not ventilation; fumes build up faster than they leak away | VERIFIED | HSE RR1178: "Freight containers are confined spaces: they have limited or no ventilation in transit and hazardous atmospheres can build up inside" | https://www.hse.gov.uk/research/rrhtm/rr1178.htm | A | 2026-10-08 |
| 7 | HSE measured air inside freight containers at ports and found toxic substances and low oxygen in some | VERIFIED | RR1178: "Measurements of the atmospheres inside freight containers at the volunteer sites found a wide range of toxic substances and low oxygen levels" | RR1178 URL | A | 2026-10-08 |
| 8 | "Those boxes weren't broken. They had just been shut for a long time." | CORRECTED | HSE says neither. Use: "HSE says the build-up depends on the contents, their condition and the length of time in transit." | RR1178 URL | A | 2026-10-08 |
| 9 | Closed-car-in-garage analogy | OPINION | - | - | - | 2026-10-08 |
| 10 | Burning fuel makes CO | VERIFIED | CDC: "CO is found in fumes produced any time you burn fuel" | https://www.cdc.gov/carbon-monoxide/about/index.html | A | 2026-10-08 |
| 11 | CDC: CO is "an odorless, colorless gas that kills without warning" | VERIFIED | Exact quote on the CDC page and in the CDC generator PDF | CDC URL in #10 | A | 2026-10-08 |
| 12 | Early signs feel like the flu: headache, dizziness, weakness, upset stomach, confusion | VERIFIED | CDC lists "headache, dizziness, weakness, upset stomach, vomiting, chest pain, and confusion". The "flu-like" wording is attributed to the same CDC page in search results; the page fetch did not echo it | CDC URL in #10 | A | 2026-10-08 |
| 13 | CDC: never use a generator in a home or garage "even if doors and windows are open" | VERIFIED | Exact quote | CDC URL in #10 ; https://www.cdc.gov/carbon-monoxide/media/pdfs/Generators_1.pdf | A | 2026-10-08 |
| 14 | Keep a generator outside, more than 20 feet from doors, windows and vents | VERIFIED | CDC: "Only use generators outside, more than 20 feet away from any windows, doors, and vents" | CDC URL in #10 | A | 2026-10-08 |
| 15 | A container with its doors cracked is no safer than a garage | OPINION | Inference from the CDC garage rule; reasonable | - | - | 2026-10-08 |
| 16 | EPA lists unvented kerosene and gas space heaters, generators and gas-powered equipment as CO sources | VERIFIED | EPA: "Unvented kerosene and gas space heaters"; "Generators and other gasoline-powered equipment" | https://www.epa.gov/indoor-air-quality-iaq/what-carbon-monoxide | A | 2026-10-08 |
| 17 | Burning fuel also uses up oxygen | VERIFIED | OSHA: "Oxygen can also be consumed by rusting metal, ripening fruits, drying paint, or coatings, combustion, or bacterial activities" (EPA does not say this; the source should be OSHA) | https://www.osha.gov/etools/shipyard/ship-repair/confined-spaces/oxygen-deficient | A | 2026-10-08 |
| 18 | CDC lists car and truck engines and small engines among CO sources | VERIFIED | CDC: "...cars or trucks, small engines, stoves..." | CDC URL in #10 | A | 2026-10-08 |
| 19 | Some cargo is fumigated to kill pests in shipping; the fumigant is poison | VERIFIED | EU-OSHA OSHwiki: "The chemicals used are toxic not only to pests, but also to humans" | https://oshwiki.osha.europa.eu/en/themes/health-risks-and-prevention-practices-during-handling-fumigated-containers | A | 2026-10-08 |
| 20 | Rules say a fumigated container should carry a warning label | VERIFIED | HSE: fumigated containers must be labelled and declared under the IMDG Code | https://www.hse.gov.uk/ports/confined-spaces.htm | A | 2026-10-08 |
| 21 | HSE: "absence of marking cannot be taken to mean fumigants are not present" | VERIFIED | Exact quote | HSE ports URL | A | 2026-10-08 |
| 22 | Boxes marked as aired out can still hold gas that soaked into cargo and seeped back out | VERIFIED | HSE: containers "marked as having been ventilated after fumigation may also contain fumigant that was absorbed by the cargo and released during transit" | HSE ports URL | A | 2026-10-08 |
| 23 | EU-OSHA: some fumes come from cargo itself; toluene and benzene found | VERIFIED | OSHwiki: "Toluene, benzene and xylene are solvents... detected in containers but are not used as fumigants as they originate from the cargo" | OSHwiki URL | A | 2026-10-08 |
| 24 | A storage container is empty and handled many times; risk is mainly sealed boxes with cargo | OPINION | Flag: an inference. It is consistent with HSE's in-transit framing | - | - | 2026-10-08 |
| 25 | HSE: a suspect box should be opened and tested by a trained, competent person | VERIFIED | HSE: opened "with a competent person present", tested, ventilated, gas-free certificate | HSE ports URL | A | 2026-10-08 |
| 26 | Gas cans, thinner, solvents, propane can leak vapor that builds up in a closed box | OPINION | General safety advice; no specific source opened | - | - | 2026-10-08 |
| 27 | In full sun the air inside gets much hotter than outside | VERIFIED | GDV Container Handbook: "At an external air temperature of 25 - 30°C, air temperatures within the container may accordingly rise as high as 50 - 55°C" | https://www.containerhandbuch.de/chb_e/scha/scha_10_03_02_01.html | B | 2026-10-08 |
| 28 | Heat makes some stored items give off more fumes | VERIFIED | EPA-hosted report: "increasing indoor air temperatures typically increases the emissions rates of volatile organic compounds (VOCs)" | https://www.epa.gov/sites/default/files/2014-08/documents/field_climate_change_iaq.pdf | B | 2026-10-08 |
| 29 | Warm damp air meeting cold steel turns to water drops on the ceiling; not a leak | VERIFIED | GDV: "If air is cooled to below its dew point (e.g. by cold container walls...), condensation forms"; ceiling especially affected | GDV TIS URL in #1 | B | 2026-10-08 |
| 30 | Passive vents placed high and low are the usual first step | OPINION | Advice. BIC's ventilated type V0 is defined by "vents at lower and upper parts of cargo space" | - | - | 2026-10-08 |
| 31 | Winter storage lists (what stores well, what to leave out) | OPINION | - | - | - | 2026-10-08 |
| 32 | Permits are the buyer's job; we don't determine them | OPINION | Site policy statement (permit-buyer-responsibility) | - | - | 2026-10-08 |
| 33 | Limited Lifetime Leak Warranty covers water; we send a patch kit you apply | SITE-DATA | src/pages/condition/index.astro: "if it ever leaks, we send you a fiberglass patch kit you apply yourself" (page copy, not a data module) | src/pages/condition/index.astro | site data | 2026-10-08 |
| 34 | WWT is the one grade we sell | SITE-DATA | src/pages/condition/index.astro; src/data/containers.ts | src/pages/condition/index.astro | site data | 2026-10-08 |
| 35 | We don't sell installed heat | SITE-DATA | No heating product in src/data/containers.ts. Owner should confirm | src/data/containers.ts | site data | 2026-10-08 |

## blog/20ft-vs-40ft-shipping-container (draft 2026-10-08-20ft-vs-40ft.md) — 2026-10-08
Checked by: data-auditor, independent of author: yes
Status of page: draft
Freshness: checked 2026-10-08. containers.ts working tree 2026-10-08 (facts fix in progress). pricing.ts feed asOf 2026-10-02. Supplier notes 2026-10-08. Hapag-Lloyd 03/2016 is a cross-check only; current weights come from containers.ts (Maersk/CMA CGM fetched 2026-10-08).

| # | Claim (as written) | Verdict | Correct value / note | Source (URL) | Grade | Accessed |
|---|---|---|---|---|---|---|
| 1 | A 40ft has about twice the floor space of a 20ft | SITE-DATA | 302.2 / 148.2 = 2.04x (recomputed from internalDims) | src/data/containers.ts | site data | 2026-10-08 |
| 2 | About 150 sq ft (20ft) and about 305 sq ft (40ft) of floor (body, FAQ) | CORRECTED | ~148 and ~302 sq ft: 19'4" x 7'8" = 148.2; 39'5" x 7'8" = 302.2. interiorFloorSqFt() and pricing.ts sqft now carry 148/302 | src/data/containers.ts ; src/data/pricing.ts ; facts audit Q2 | site data | 2026-10-08 |
| 3 | Two 20fts: about 297 sq ft combined | CORRECTED | ~296 sq ft (2 x 148.2). The table should read 302 vs 296 | src/data/containers.ts | site data | 2026-10-08 |
| 4 | Inside dims 19'4" x 7'8" x 7'10" and 39'5" x 7'8" x 7'10" | SITE-DATA | containers.ts internalDims. Hapag-Lloyd cross-check: 19'4¼" x 7'8⅝" x 7'10¼"; 39'5⅝" | src/data/containers.ts ; Hapag-Lloyd PDF (codes entry #5) | site data | 2026-10-08 |
| 5 | 1,172 cu ft (20ft), 2,390 (40ft), two 20s 2,344 combined | SITE-DATA | containers.ts cubicCap; 2 x 1,172 = 2,344. Hapag: 1,172 / 2,391 ft3 | src/data/containers.ts | site data | 2026-10-08 |
| 6 | Width and height are the same; only length changes | VERIFIED | Hapag-Lloyd 22G1 vs 42G1: same inside width 2,352 mm and height ~2,393-2,395 mm | https://www.hapag-lloyd.com/content/dam/website/downloads/press_and_media/publications/15211_Container_Specification_engl_Gesamt_web.pdf | A | 2026-10-08 |
| 7 | Well under twice the price | SITE-DATA | National $2,290 / $1,990 = 1.15x (40ft); $2,360 / $1,990 = 1.19x (HC), asOf 2026-10-02. Recomputed via vite-node | src/data/pricing.ts (geoPricing.ts) | site data | 2026-10-08 |
| 8 | Part of the price is fixed (doors, corner posts, end walls, the trip); a longer box adds only floor and side wall | OPINION | Flag: a cost-structure inference presented as fact; no source | - | - | 2026-10-08 |
| 9 | Price per square foot drops as you go up in size | SITE-DATA | $13.45 (20ft) to $7.58 (40ft) per interior sq ft. Note the HC is $7.81, a bit above the 40ft standard | src/data/pricing.ts | site data | 2026-10-08 |
| 10 | One 40ft holds a little more than two 20fts | SITE-DATA | 2,390 vs 2,344 cu ft; 302 vs 296 sq ft | src/data/containers.ts | site data | 2026-10-08 |
| 11 | Oct 2026: supplier says 20fts are tighter and one-trip 20fts are hardest to source (body, FAQ, card copy) | VERIFIED | Notes: "20ft scarce ...; one-trip 20s harder" | UDO Project/.outputs/supplier/2026-10-08-freedom-conex-sales-meeting.md | supplier, internal | 2026-10-08 |
| 12 | Supplier's reasons: shipping costs up; manufacturers focusing on 40ft High Cubes | VERIFIED | Notes: "(shipping costs, manufacturers focus on 40HC)" | supplier notes above | supplier, internal | 2026-10-08 |
| 13 | A one-trip container was built, loaded once for an ocean trip, then sold | VERIFIED | Container xChange: "has made only one trip from the manufacturer to its first shipping destination to drop off cargo" (edited 2024-11-06) | https://www.container-xchange.com/blog/one-trip-shipping-containers | B | 2026-10-08 |
| 14 | Fewer new 20fts now can mean fewer used 20fts later | OPINION | Author's inference, hedged ("can mean") | - | - | 2026-10-08 |
| 15 | The 40ft HC is the size the industry is building more of | VERIFIED | The supplier said "manufacturers focus on 40HC". Note: attribute it to the supplier; there is no industry production data | supplier notes above | supplier, internal | 2026-10-08 |
| 16 | The High Cube is "already easier to find used than the plain 40ft standard" | REMOVED | Not in the supplier notes; no source found. Cut | - | - | 2026-10-08 |
| 17 | A 40ft needs a level strip about 40 feet long | VERIFIED | BIC length code 4 = 12,192 mm = 40 ft | https://www.bic-code.org/size-type-code/ | A | 2026-10-08 |
| 18 | The 20ft fits most suburban lots and standard driveways | SITE-DATA | containers.ts 20ft use case | src/data/containers.ts | site data | 2026-10-08 |
| 19 | Tilt-bed: the box slides off the back as the truck pulls forward | SITE-DATA | src/pages/delivery/index.astro FAQ | src/pages/delivery/index.astro | site data | 2026-10-08 |
| 20 | The truck needs room for its own length plus the container's, in a straight line | SITE-DATA | Paraphrases the site rule: 100+ ft straight approach, ~65 ft truck combination (permitCounties.ts DELIVERY_ACCESS; delivery page) | src/data/permitCounties.ts | site data | 2026-10-08 |
| 21 | The 40ft needs more clearance; the 20ft costs less to deliver | SITE-DATA | containers.ts compareNote strings | src/data/containers.ts | site data | 2026-10-08 |
| 22 | Crane-set delivery may solve tight routes for either size | SITE-DATA | delivery/index.astro: crane-set "solves sharp turns, fencelines, restricted lots, and ground too soft" | src/pages/delivery/index.astro | site data | 2026-10-08 |
| 23 | The 20ft fits most job sites where a 40ft would get in the way | SITE-DATA | containers.ts: "fits most job sites where a 40ft would block access" | src/data/containers.ts | site data | 2026-10-08 |
| 24 | A 20ft is listed to carry about 47,900 lbs | CORRECTED | Typical 62,020-62,280 lbs (28,130-28,250 kg at 30,480 kg max gross). containers.ts was updated; 47,900 reflects an old 24,000 kg rating. Hapag CPSU 20ft: 62,126 lb | src/data/containers.ts ; Hapag-Lloyd PDF | site data / A | 2026-10-08 |
| 25 | A 40ft is listed at about 59,039 lbs | CORRECTED | Typical 59,000-63,490 lbs (containers.ts). Hapag: 58,863-63,493 lb | src/data/containers.ts ; Hapag-Lloyd PDF | site data / A | 2026-10-08 |
| 26 | So the 20ft carries roughly four-fifths of the weight in half the floor | CORRECTED | On current figures a 20ft carries about the SAME payload as a 40ft (~62,000 vs 59,000-63,500 lb) in half the floor | recomputed from #24-25 | site data | 2026-10-08 |
| 27 | Empty weight about 4,850 lbs (20ft) vs about 8,160 lbs (40ft) | CORRECTED | 20ft 4,920-5,180 lbs; 40ft 8,160-8,270 lbs (containers.ts). Hapag: 5,071-5,181 / 8,157-8,333 lb | src/data/containers.ts ; Hapag-Lloyd PDF | site data / A | 2026-10-08 |
| 28 | Check the data plate on the door for your unit's exact ratings | VERIFIED | The BIC CSC plate carries payload and stacking/racking values; per ICHCA it is fixed to the doors or front wall | https://www.bic-code.org/csc-combined-data-plate/ | A | 2026-10-08 |
| 29 | 40ft and 40ft HC have the same footprint; the HC is one foot taller | VERIFIED | Hapag 42G1 8'6" vs 45G1 9'6", both 40 ft; BIC height codes 2/5 | Hapag-Lloyd PDF | A | 2026-10-08 |
| 30 | Inside height ~7'10" vs ~8'10"; 2,390 vs 2,694 cu ft | SITE-DATA | containers.ts. Hapag: 7'10¼" / 8'10¼"; 2,391 / 2,695 ft3 | src/data/containers.ts | site data | 2026-10-08 |
| 31 | Door opening 7'5" vs 8'5" tall (and the FAQ: a foot taller) | SITE-DATA | containers.ts doorOpening. Hapag lists 7'5¾"-7'6¼" and 8'6¼" (within ~1") | src/data/containers.ts | site data | 2026-10-08 |
| 32 | The extra foot "is the difference between one layer of pallets and two" | CORRECTED | Depends on load height. Reword: "can be the difference... depending on how tall each pallet load is" | recomputed from door heights #31 | site data | 2026-10-08 |
| 33 | The HC clears insulation and ceiling for a conversion | OPINION | Matches the containers.ts HC use case | - | - | 2026-10-08 |
| 34 | Almost all deliveries take about two weeks | SITE-DATA | src/data/homeFaq.ts; permitCounties.ts | src/data/homeFaq.ts | site data | 2026-10-08 |
| 35 | Checklist and "storage fills whatever space you give it" | OPINION | - | - | - | 2026-10-08 |
| 36 | Permits are the buyer's job; we don't determine them | OPINION | Site policy | - | - | 2026-10-08 |
| 37 | Card copy: "our supplier reports fewer one-trip 20ft containers" / "20fts are getting harder to find" | VERIFIED | Supplier notes | supplier notes above | supplier, internal | 2026-10-08 |

## 20ft-vs-40ft-shipping-container — 2026-10-08
Checked by: data-auditor, independent of author: yes
Status of page: final, pre-publish (draft: false, pubDate 2026-10-08). Supersedes the draft entry "blog/20ft-vs-40ft-shipping-container (draft ...)" above; every CORRECTED/REMOVED item there is fixed in the final text.
Freshness: checked 2026-10-08. All URLs re-opened 2026-10-08: Maersk dry spec PDF (undated), CMA CGM containers page (live; direct fetch 403, read via Google Translate proxy), Hapag-Lloyd spec PDF (03/2016, cross-check), BIC size-type and CSC pages (live), Container xChange (edited 2024-11-06), Freedom Conex RTO page (live). Supplier notes dated 2026-10-08. pricing.ts feed asOf 2026-10-02 (FLAG: 6 days old against a feed described as daily; the post prints no prices and the ratio claims hold, but the feed refresh should be checked). FAQ answers repeat body claims and match the rows below.
Recorded by the orchestrator from the checker's output (the checker's own write was blocked by a shell hook); content unchanged.

| # | Claim (as written) | Verdict | Correct value / note | Source (URL) | Grade | Accessed |
|---|---|---|---|---|---|---|
| 1 | A 40ft has about twice the floor space of a 20ft (description, body, FAQ) | SITE-DATA | 302.2 / 148.2 = 2.04x, recomputed from internalDims | src/data/containers.ts | site data | 2026-10-08 |
| 2 | About 148 sq ft (20ft) and about 302 sq ft (40ft) of floor | SITE-DATA | 19'4" x 7'8" = 148.2; 39'5" x 7'8" = 302.2; pricing.ts sqft 148/302. Draft CORRECTED item fixed | src/data/containers.ts ; src/data/pricing.ts | site data | 2026-10-08 |
| 3 | Inside dims 19'4" x 7'8" x 7'10" and 39'5" x 7'8" x 7'10" | SITE-DATA | Maersk cross-check: 19'4 1/8" / 39'5 11/16" x 7'8 1/2" x 7'10 3/16" | src/data/containers.ts ; https://www.maersk.com/~/media_sc9/maersk/local-information/files/africa/south-africa/important-information/container-type-and-sizes/dry-equipment-specifications-updated.pdf | site data / A | 2026-10-08 |
| 4 | 1,172 cu ft (20ft) and 2,390 cu ft (40ft) | SITE-DATA | containers.ts cubicCap. CMA CGM 33.2 / 67.8 m3 = 1,172 / 2,394 cu ft; Maersk 1,165 / 2,366 | src/data/containers.ts ; https://www.cma-cgm.com/products-services/containers | site data / A | 2026-10-08 |
| 5 | Width and height are the same; only the length changes | VERIFIED | Maersk 20' and 40' standard: same internal width 2,350 mm and height 2,393 mm | Maersk PDF in #3 | A | 2026-10-08 |
| 6 | Well under twice the price | SITE-DATA | $2,290 / $1,990 = 1.15x (40ft); $2,360 / $1,990 = 1.19x (HC), feed asOf 2026-10-02, recomputed via vite-node. See freshness flag | src/data/pricing.ts (geoPricing.ts) | site data | 2026-10-08 |
| 7 | Part of the price is fixed (doors, corner posts, end walls, the trip); a longer box adds floor and side wall | OPINION | Cost-structure reasoning, no source | - | - | 2026-10-08 |
| 8 | Price per square foot drops as you go up in size | SITE-DATA | $13.45 (20ft) to $7.58 (40ft) / $7.81 (HC) per interior sq ft | src/data/pricing.ts | site data | 2026-10-08 |
| 9 | Table (302 sq ft / 2,390 cu ft vs 148 / 1,172 each) and "one 40ft holds a little more than two 20fts" | SITE-DATA | 2,390 vs 2,344 cu ft; 302 vs 296 sq ft. Draft CORRECTED combined-figure item no longer present (table now says "each") | src/data/containers.ts | site data | 2026-10-08 |
| 10 | One delivery / pad / door set; two 20fts only when the space must be split | OPINION | - | - | - | 2026-10-08 |
| 11 | Oct 2026: supplier says 20fts are getting tighter and one-trip 20fts are the hardest to source (body, FAQ) | VERIFIED | Notes: "20ft scarce ...; one-trip 20s harder". Flag: "hardest" is slightly stronger than the notes' "harder"; low risk. Orchestrator: post reworded to "harder" before publish | UDO Project/.outputs/supplier/2026-10-08-freedom-conex-sales-meeting.md | supplier, internal | 2026-10-08 |
| 12 | Supplier's reasons: shipping costs up; manufacturers focusing on 40ft High Cubes | VERIFIED | Notes: "(shipping costs, manufacturers focus on 40HC)" | supplier notes above | supplier, internal | 2026-10-08 |
| 13 | A one-trip container was built, loaded once for an ocean trip, then sold off | VERIFIED | "has made only one trip from the manufacturer to its first shipping destination to drop off cargo" (edited 2024-11-06) | https://www.container-xchange.com/blog/one-trip-shipping-containers | B | 2026-10-08 |
| 14 | One-trip is "the top of the used market" | OPINION | Consistent with xChange: used containers "are certainly cheaper than one-trip ones" | xChange URL in #13 | B | 2026-10-08 |
| 15 | Fewer new 20fts now means fewer used 20fts later | OPINION | Labeled in the text as "our own reasoning" | - | - | 2026-10-08 |
| 16 | 20fts are still available and we still sell them | SITE-DATA | 20ft entry present in containers.ts | src/data/containers.ts | site data | 2026-10-08 |
| 17 | The 40ft HC is the size the supplier says manufacturers focus on (two places) | VERIFIED | Supplier notes. Now attributed to the supplier; the draft REMOVED claim ("easier to find used than the standard") is absent | supplier notes above | supplier, internal | 2026-10-08 |
| 18 | A 40ft needs a level strip about 40 feet long, plus door-swing room | VERIFIED | BIC length code 4 = 40 ft (12,192 mm) | https://www.bic-code.org/size-type-code/ | A | 2026-10-08 |
| 19 | The 20ft fits most suburban lots and standard driveways | SITE-DATA | containers.ts 20ft use case | src/data/containers.ts | site data | 2026-10-08 |
| 20 | Permits and zoning are the buyer's job; we don't determine or guarantee them | OPINION | Site policy (permit = buyer responsibility) | - | - | 2026-10-08 |
| 21 | Tilt-bed: the box slides off the back as the truck pulls forward | SITE-DATA | Delivery page FAQ | src/pages/delivery/index.astro | site data | 2026-10-08 |
| 22 | The truck needs room for its own length plus the container's, in a straight line | SITE-DATA | DELIVERY_ACCESS (100+ ft straight approach) | src/data/permitCounties.ts | site data | 2026-10-08 |
| 23 | The 40ft needs more clearance; the 20ft costs less to deliver | SITE-DATA | containers.ts compareNote strings | src/data/containers.ts | site data | 2026-10-08 |
| 24 | Straight approach, width/overhead clearance, firm ground; crane-set may solve tight routes for either size | SITE-DATA | Delivery page | src/pages/delivery/index.astro | site data | 2026-10-08 |
| 25 | The 20ft fits most job sites where a 40ft would get in the way | SITE-DATA | containers.ts: "fits most job sites where a 40ft would block access" | src/data/containers.ts | site data | 2026-10-08 |
| 26 | Tool-lockup fit; dense loads run out of weight before room | OPINION | - | - | - | 2026-10-08 |
| 27 | A 20ft typically carries about 62,020 to 62,280 lbs | VERIFIED | CMA CGM 28,250 kg = 62,281 lb; Maersk 28,200 kg = 62,170 lb; Hapag CPSU 30,480 kg gross less 2,350 kg tare = 28,130 kg = 62,016 lb (Hapag table shows 62,126 lb at 2,300 kg tare) | CMA CGM URL in #4 ; Maersk PDF in #3 ; https://www.hapag-lloyd.com/content/dam/website/downloads/press_and_media/publications/15211_Container_Specification_engl_Gesamt_web.pdf | A | 2026-10-08 |
| 28 | A 40ft typically carries about 59,000 to 63,490 lbs | VERIFIED | CMA CGM 26,760 kg = 58,996 lb; Maersk 28,800 kg = 63,493 lb | CMA CGM URL in #4 ; Maersk PDF in #3 | A | 2026-10-08 |
| 29 | So the 20ft carries about the same payload as a 40ft in half the floor | VERIFIED | Recomputed from #27-28 and #1. Draft CORRECTED item fixed | recomputed | A | 2026-10-08 |
| 30 | Empty weight about 4,920-5,180 lbs (20ft) vs 8,160-8,270 lbs (40ft) | VERIFIED | 20ft: CMA CGM 2,230 kg = 4,916; Maersk 2,280 = 5,027; Hapag up to 2,350 = 5,181. 40ft: Maersk 3,700 = 8,157; CMA CGM 3,720 = 8,201; Hapag 3,750 = 8,267 | Sources in #27 | A | 2026-10-08 |
| 31 | Ranges are typical; the CSC plate on the door is the authority for your box | VERIFIED | BIC: payload and stacking/racking values must be on the plate, "typically riveted to the outside of the left door" | https://www.bic-code.org/csc-combined-data-plate/ | A | 2026-10-08 |
| 32 | Quick checklist; "storage fills whatever space you give it" | OPINION | - | - | - | 2026-10-08 |
| 33 | 40ft and 40ft HC have the same footprint; the HC is one foot taller | VERIFIED | BIC height codes 8'6" vs 9'6"; Maersk 40' x 8' x 8'6" vs 40' x 8' x 9'6" | BIC URL in #18 ; Maersk PDF in #3 | A | 2026-10-08 |
| 34 | Inside height ~7'10" vs ~8'10"; 2,390 vs 2,694 cu ft (body, FAQ) | SITE-DATA | containers.ts. Maersk 7'10 3/16" / 8'10 1/8"; CMA CGM 67.8 / 76.4 m3 = 2,394 / 2,698 cu ft | src/data/containers.ts ; Maersk PDF in #3 | site data / A | 2026-10-08 |
| 35 | Door opening 7'5" tall vs 8'5" tall (a foot taller) | VERIFIED | Maersk door height 7'5 1/2" (40' std) vs 8'5 7/16" (40' HC) | Maersk PDF in #3 | A | 2026-10-08 |
| 36 | The extra foot "can be" one vs two pallet layers depending on load height; HC for shelving, equipment, conversions | OPINION | Hedged as the draft entry required | - | - | 2026-10-08 |
| 37 | "Almost all deliveries take about two weeks"; honest window before you commit | VERIFIED | Freedom Conex RTO page: "Our delivery timeline is about 2 weeks from the time you place your order." Locked copy; the window promise is a commitment, not a fact | https://www.freedomconex.com/rent-to-own | A | 2026-10-08 |

### Homepage (commit 0df93a6) and 20ft product-page card

| # | Claim (as written) | Verdict | Correct value / note | Source (URL) | Grade | Accessed |
|---|---|---|---|---|---|---|
| H1 | Personas: "Wind & Water Tight, so it cost less than a new one-trip unit" (replaces the unsourced "2/3 cost savings") | VERIFIED | xChange: used containers "are certainly cheaper than one-trip ones" | xChange URL in #13 | B | 2026-10-08 |
| H2 | Price card: "Almost all deliveries take about two weeks; we'll give you an honest window before you commit" | VERIFIED | Same as #37 | https://www.freedomconex.com/rent-to-own | A | 2026-10-08 |
| H3 | HC note "Supply runs deep right now, so the High Cube average sits below the standard 40ft" (homepage, hub, HC page), now gated on hcBelowStandard | SITE-DATA | Gate logic correct. On the current feed hcBelowStandard = false ($2,360 HC > $2,290 std), so the note does NOT render; it would be false if it did | src/data/pricing.ts | site data | 2026-10-08 |
| H4 | Price card "~148 sq ft of floor" (read from p20.sqft) | SITE-DATA | 148 | src/data/pricing.ts | site data | 2026-10-08 |
| H5 | Personas intro "We've placed 400+ containers" (unchanged context for H1) | VERIFIED | Owner-attested 2026-10-08. FLAG: not independently verifiable; no external source | owner attestation | owner, internal | 2026-10-08 |
| C1 | 20ft card: "Getting harder to find: our supplier reports fewer one-trip 20ft containers" (src/pages/shipping-containers-for-sale/[slug].astro:569) | VERIFIED | Supplier notes: "20ft scarce ...; one-trip 20s harder" | supplier notes above | supplier, internal | 2026-10-08 |

Totals: VERIFIED 18, SITE-DATA 17, OPINION 8, CORRECTED 0, REMOVED 0.
