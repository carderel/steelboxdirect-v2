# Locations National Expansion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure city URLs to `/locations/{state}/{city}-shipping-containers/` with 301s, add 8 fully-researched depot-city pages, split the hub, wire Facebook — per `docs/superpowers/specs/2026-07-31-locations-national-design.md` (READ FIRST; bridge copy + hard stops are law).

**Architecture:** Research wave (8 parallel city datasets, verified) → data-model extension + tests → route move + redirects → hub/nav/link sweep. Branch `feat/locations-national` off main (3a8147c).

## Global Constraints (every task)
- ZERO fabrication: every city fact from public primary/corroborated sources; ungraded/unverifiable → OMIT (a thinner honest page beats a padded one). NO ratings, unit counts, "ISO-certified", invented flavor (cities.test.ts guards).
- All 12 city pages $-free. Bridge copy verbatim per spec (city name swapped), never names the supplier. No delivery-time promises beyond the locked hedged wording where the template already has it.
- Verify per task: `npm run build` clean · `npx vitest run` green · scoped git add + commit with the session trailers.

### Task 0: Branch + spec/plan commit
- [ ] `git checkout -b feat/locations-national` from main; commit spec+plan.

### Task 1: Facebook NAP wiring
**Files:** `src/lib/schema/entities.ts` (Organization.sameAs + LocalBusiness.sameAs arrays — find the LinkedIn/GBP entries and add `https://www.facebook.com/SteelBoxDirect/`), `src/components/SiteFooter.astro` (company-social row: Facebook icon+link beside the LinkedIn one, reuse existing social CSS/markup pattern).
- [ ] Add both; run entity tests; Playwright footer check. Commit `feat(nap): Facebook page in schema sameAs + footer social row`.

### Task 2: Research wave — 8 city datasets (PARALLEL subagents, then per-city verification)
**Output per city:** `.outputs/research/locations/2026-07-31-{city}.md` with EXACTLY the fields cities.ts needs (study Cincinnati/Dayton entries first as the format contract): name, state, stateSlug, slug (`{city}-shipping-containers`), counties[] (metro counties genuinely in a delivery radius), primaryZips (real ZIPs, city-core + notable delivery areas), zoning[] ({county authority name, REAL official URL — .gov strongly preferred; https; mark each URL's evidence grade + how corroborated}), geography (1-2 honest sentences: terrain/access relevant to container delivery), areaProfile (2-3 sentences: what the metro's storage demand actually looks like — industries, port/logistics context), commonUses[] (4 entries persona-tagged farmers/contractors/homeowners/businesses — grounded in the metro's real economy; port cities lean logistics/business, avoid speculative items), usesIntro (1 city-specific line), seo {title, description} following the existing entries' pattern ("Shipping & Storage Containers in {City}, {ST}"). RC-mode: grade every zoning URL A–C; anything below C = OMIT the county. NO population stats unless from census.gov. NO claims about SBD history in that city.
- [ ] Dispatch 8 researchers in parallel (Cleveland OH, Savannah GA, Charleston SC, Norfolk VA, Houston TX, New York NY, Detroit MI, Kansas City MO). New York scoping: NYC's boroughs = counties (use borough names + NYC zoning); delivery realism (tight urban placement) belongs in geography honestly.
- [ ] Dispatch 1 verifier across all 8 outputs: spot-check zoning URLs (HEAD/GET where fetchable; corroborate otherwise + mark for owner click-check), reject fabricated-looking ZIPs/counties (cross-check county lists vs census/state sources), confirm commonUses are grounded not invented. Verifier report → `.outputs/research/locations/2026-07-31-verification.md`. Fix-or-omit loop with the researcher outputs until PASS.
- [ ] Commit the 9 research files `docs(locations): 8 depot-city ground-truth datasets + verification`.

### Task 3: Data model + tests
**Files:** `src/data/cities.ts`, `src/data/cities.test.ts`.
- [ ] Add `state`, `stateSlug`, `region: 'home'|'depot'` to the interface; backfill the 4 home cities (Ohio/ohio ×2 — Cincinnati+Dayton, Indiana, Kentucky; region 'home'). Depot cities: `delivery` framing depot-based per spec (no "250 miles of Cincinnati" line in their fields).
- [ ] Transcribe the 8 verified datasets into cities.ts (verbatim from the research files — the transcriber adds NOTHING).
- [ ] Extend cities.test.ts: new fields required ×12; slug pattern `-shipping-containers$`; stateSlug kebab; fabrication guards run over all 12; depot entries have non-empty depot delivery framing; home entries unchanged snapshot-wise. Run: green. Commit `feat(locations): 12-city dataset w/ state routing fields + extended guards`.

### Task 4: Route restructure + 301s
**Files:** Create `src/pages/locations/[state]/[citySlug].astro` (move the template; `getStaticPaths` from cities.ts pairs; render bridge-copy block after hero when `region==='depot'` — verbatim spec copy w/ city name; breadcrumbs Home›Locations›{State}(unlinked)›{City}; canonical + Service schema URL = new path). DELETE `src/pages/[citySlug].astro`. Redirects: investigate the existing redirect mechanism (grep astro.config + public/ for the 40ft-slug precedent + _routes.json interplay); implement 301s for the 4 old flat URLs via the mechanism that yields real HTTP 301 on Cloudflare Pages (`public/_redirects` expected); document which.
- [ ] Build; verify dist has the 12 new paths and NOT the old 4; verify redirect artifact present/correct. Playwright 2 pages (1 home city, 1 depot city w/ bridge copy) at 1280+390. Commit `feat(locations): state-scoped city routes + 301s from flat URLs`.

### Task 5: Hub, nav, link sweep
**Files:** `src/pages/locations/index.astro` (two sections: "Our home region" 4 + "Served from regional depots" 8 with a one-line depot explanation; ItemList → 12 new URLs), `src/components/SiteNav.astro` + `SiteFooter.astro` (4 home cities + "All locations →" pattern; update hrefs), `public/llms.txt` (+8, update 4), sitewide grep `-shipping-containers` for every hardcoded old URL (use-case pages, blog mesh, components) → new paths.
- [ ] Sweep + verify zero references to old flat URLs remain in src/ (grep). Build; Playwright hub+nav 1280/390. Commit `feat(locations): hub regions split + nav/footer/link sweep`.

### Task 6: Full verification + independent review
- [ ] Verifier: build clean; tests green; all 12 built pages $-free (grep dist); bridge copy on exactly 8; old URLs 301 (serve dist w/ a redirects-aware check or verify the _redirects artifact); sitemap 12-in/4-out; no internal 404s (link-check the mesh); llms.txt/nav/hub consistent; Facebook sameAs in built @graph.
- [ ] Independent adversarial review (fresh subagent): fabrication hunt across the 8 new datasets vs their research files + spot re-verification of 8 random zoning URLs; hard-stop sweep; verdict. Then checkpoint + owner demo + merge/push call. Post-deploy owner actions: click-check ~30 zoning URLs, GSC inspect 301s, submit new URLs.

## Self-review
Spec↔tasks mapped (research T2, data T3, routes T4, hub/nav T5, FB T1, verification T6). No placeholders; exact field contract defined by pointing at the existing entries as the schema authority. Bridge copy referenced to spec verbatim. Redirect mechanism = investigate-then-implement with a required real-301 outcome.
