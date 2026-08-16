# Checkpoint — 2026-07-02 15:23 — Shed/pole-barn interception rolled across all use-case pages (move #1 complete)

**Repo:** steelboxdirect-v2 · **Branch:** main · **Base:** `0380fef` · **UNCOMMITTED** (rides with logo + LinkedIn + farmers batch).

## What this completes
Move #1 from `.outputs/seo/2026-07-02-shed-polebarn-interception.md` across ALL four use-case pages — capture each buyer's own alternative-vocabulary and reframe to a container. Adapted per audience rather than forcing a shed table everywhere.

## Per-page changes (audience-appropriate)
- **farmers** (done earlier): new `.uc-compare` shed-vs-pole-barn-vs-container table (7 rows) + 3 JTBD FAQs. Accent green (`--c4-cost`).
- **contractors** (this pass): NEW `.uc-compare` section "Weighing a job-site trailer or a gang box?" — 4-col table (Job-site trailer / Gang box / Steel container, 6 rows) + CSS (blue `--c3-deliver` tint) + 3 JTBD FAQs (trailer, gang box, project-length). Mirrors existing "deliver & retrieve" model language, no invented rental program.
- **businesses** (this pass): NO new section — page ALREADY has a `.uc-compare` "Cost of Space" table (own vs rent off-site). Added 3 JTBD FAQs in self-storage/warehouse/leasing vocabulary (self-storage vs on-site, add space without a bigger warehouse, store inventory on site).
- **homeowners** (this pass): NO new section — page ALREADY has a `.uc-compare` rent-vs-own (10×10 unit vs 20ft) table. Added 3 JTBD FAQs (storage-shed alternative, steel vs wood/plastic shed lifespan, HOA/backyard zoning) + 1 source (Conexwest shed-vs-container).

All new FAQs auto-wire into each page's FAQPage JSON-LD (single `faqs` array pattern). New businesses/homeowners FAQs APPENDED to preserve their index-based image/link injection (`i === 2/3/6`, `i === 5/6`).

## Content-policy compliance (locked rules honored on every page)
- No NEW dollar amounts (businesses/homeowners already carry cited market figures per their established pattern; my additions stayed qualitative).
- No delivery-time promises (container speed framed as "delivered ready to use / we deliver & retrieve," never a duration).
- Permit/HOA = buyer's responsibility, hedged, no determinations.
- WWT-only condition language. Titles/H1s unchanged (anti-cannibalization) — new keywords live in body + FAQ.

## Verification
- `npm run build` clean.
- Served HTML: all 9 new FAQ questions present in the three pages' FAQPage JSON-LD.
- Playwright: contractors new table renders (blue accent, container column tinted); contractors mobile 390px → no page-level horizontal overflow.

## Next
- Ryan's DataForSEO sizing of the 5 keyword clusters (spec in the .outputs doc) → decides whether to build the standalone local hub (move #2).
- Commit/push decision still pending (owner) — entire session's work (logo, LinkedIn, all 4 use-case pages) uncommitted together.
