# Design Spec — Locations URL Restructure + National Depot Expansion (2026-07-31)

**Owner brief:** expand from 4 to 12 city pages under a new URL structure; test whether more covered surface area works. The 8 new cities are the top markets where actual depots exist (via the supplier network).

## Owner-locked decisions
- **URL structure:** `/locations/{state-slug}/{city-slug}-shipping-containers/` (e.g. `/locations/ohio/cincinnati-shipping-containers/`). Existing 4 pages MOVE there with **301 redirects** from the old flat URLs. No state index pages this round (state segment is future-proofing; breadcrumb middle level renders unlinked).
- **New cities (8):** Cleveland OH · Savannah GA · **Charleston SC** (owner-confirmed, not WV) · Norfolk VA · Houston TX · New York NY (slug `new-york-shipping-containers` under `/locations/new-york/`) · Detroit MI · **Kansas City MO** (owner-confirmed; copy covers the metro both sides).
- **Footprint messaging = option 2 + bridge:** homepage/footer/global schema/quote form keep the OH-IN-KY 250-mile story UNCHANGED. Each depot-city page carries the reconciling BRIDGE COPY up high (approved draft below). The /locations/ hub splits into "Home region" (CIN/DAY/IND/LOU) + "Served from regional depots" (the 8) — the split itself is the explanation.
- **Bridge copy (approved wording, adapt city name only):** "Steel Box Direct is a family-run dealer headquartered near Cincinnati — Ohio, Indiana, and Kentucky are our home delivery region. {City} is one of the markets we fulfill through our supplier network, from a depot right in the area: same containers, same Lifetime Leak Warranty, same person handling your quote. Sourcing from a local yard instead of hauling steel across the country keeps freight short — and short freight is what keeps our pricing structure low." **NEVER name Freedom Conex in this copy — "our supplier network" only.** Pricing claim stays qualitative — NO dollar amounts (hard stop).
- **Data depth: FULL PARITY** with the Phase-1 ground-truth schema for all 8: primaryZips, zoning[] (county authority + REAL URL), geography, areaProfile, commonUses[] (persona-tagged → /for/*), usesIntro, counties, seo fields. Researched from public sources, evidence-graded, ZERO fabrication; owner click-checks zoning URLs post-deploy (Phase-1 precedent).
- **Facebook** (https://www.facebook.com/SteelBoxDirect/) rides along: schema sameAs (Organization + LocalBusiness in entities.ts) + footer company-social row next to LinkedIn. Completes the NAP trio.

## Data model (src/data/cities.ts)
Add per-city: `state` ("Ohio"), `stateSlug` ("ohio"), `region: 'home' | 'depot'`. Existing 4 = home. Depot cities' `delivery` framing = depot-based (radius around THEIR depot, qualitative), NOT the Cincinnati 250-mile line. `cities.test.ts` extends: new fields required on all 12; fabrication guards (no ratings/counts/ISO/$ patterns) unchanged and now covering 12 entries; depot entries MUST contain the bridge-copy marker (test asserts `region==='depot'` pages get bridge rendering — via template test or data flag).

## Routing
- New dynamic route `src/pages/locations/[state]/[citySlug].astro` (moved template; `getStaticPaths` emits state+city pairs from cities.ts). Old `src/pages/[citySlug].astro` DELETED.
- **301s:** old flat URLs → new URLs for the 4 existing pages. Mechanism: whatever Cloudflare Pages honors for static output (`public/_redirects` file preferred; implementer verifies against the existing _routes.json setup and the prior 40ft-slug redirect precedent). Must be real 301s, not meta-refresh.
- Canonicals, BreadcrumbList (Home › Locations › {State} › {City}; state crumb unlinked), Service schema URLs all update. Sitemap picks up new URLs automatically — verify old ones drop out.

## Page template additions (depot cities only)
Bridge-copy block renders after the hero for `region==='depot'`. Depot cities link the SAME 4 persona pages (/for/*) in common-uses; zoning section = their researched counties. Everything else identical to home cities. **All 12 pages $-free** (hard stop, test-guarded).

## Hub + nav + links
- `/locations/` hub: two sections w/ headings + one-line explanation of the depot model (bridge summary); ItemList schema covers all 12 (new URLs).
- SiteNav Locations dropdown: 4 home cities + "All locations →" (12 airport codes won't fit). Footer Locations column: same pattern.
- Internal-link sweep: every hardcoded old city URL sitewide (use-case pages, footer, blog mesh, llms.txt) → new URLs. llms.txt adds the 8.

## Out of scope
State index pages · homepage/footer/quote service-area copy changes · global LocalBusiness areaServed changes (per-page Service areaServed covers each new metro) · X/Instagram/Pinterest (owner creating; add when live) · IndexNow ping (owner decision post-deploy).

## Verification bar
Build clean · extended tests green · all 12 built pages $-free (grep) · bridge copy present on exactly the 8 depot pages · 301s return 301 (curl on served output or Cloudflare-compatible config verified) · no fabricated data (research verifier per city + final review) · sitemap has 12 new URLs, 0 old · nav/hub/mesh links resolve (no 404s) · Facebook in sameAs + footer.
