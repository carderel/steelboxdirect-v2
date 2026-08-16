# Checkpoint — 2026-07-02 15:01 — Farmers page: shed/pole-barn interception (move #1)

**Repo:** steelboxdirect-v2 · **Branch:** main · **Base:** `0380fef` · **UNCOMMITTED** (rides with logo + LinkedIn batch).

## What this is
Execution of move #1 from `.outputs/seo/2026-07-02-shed-polebarn-interception.md`: fold shed / pole-barn / "store-my-equipment" vocabulary into the existing (already-ranking) use-case pages so we intercept the utility buyer whose consideration set is only "shed or pole barn" and reframe to a container. Started with `/for/farmers/`.

## Changes — src/pages/for/farmers/index.astro (only file touched)
1. **New section `.uc-compare`** ("Already pricing out a shed or pole barn?") inserted after "Why containers work." Intro + a 4-col comparison table (What matters / Storage shed / Pole barn / Steel container) across 7 rows: Security, Weather & pests, Setup, Foundation, Move it later, Lifespan, Ownership. Container column tinted green. Honest trade-off framing paragraph (boxy look + zoning = buyer's responsibility, links to /permits/).
2. **3 JTBD FAQs** added to the `faqs` array (auto-drives both visible FAQ + FAQPage JSON-LD): "Can a shipping container replace a storage shed or pole barn for equipment?", "How do I store a tractor, mower, or equipment without a barn?", "Is a shipping container cheaper than building a pole barn?"
3. **1 source** added (Conexwest shed-vs-container comparison).
4. **CSS** for `.uc-compare*` (brutalist table, overflow-x scroller, min-width 720). Added `.uc-framing a` to the underline rule.

## Content-policy compliance (locked rules honored)
- **No dollar amounts** anywhere (HARD STOP) — cost framed qualitatively ("usually leaner," "one-time purchase"); FAQ explicitly says "We don't quote prices online."
- **No delivery-time promise** — container speed framed as "delivered ready to use — no crew, no build," never a duration.
- **Permit = buyer responsibility** — every zoning mention hedged and routed to /permits/; no determinations/promises.
- **WWT-only** condition language; **cited** the comparison claim.
- Title/H1 unchanged (anti-cannibalization) — shed/pole-barn keywords captured in body + FAQ only.

## Verification
- `npm run build` clean.
- Served /for/farmers/: 3 new FAQ questions present in FAQPage JSON-LD; `.uc-compare` section + table rendered.
- Playwright: desktop table reads correctly (container column highlighted); mobile 390px → table scrolls inside its own container, **no page-level horizontal overflow**.

## Next
- Repeat move #1 on **contractors** and **businesses** use-case pages (different job language: tools/jobsite security; inventory/commercial). Homeowners = optional (zoning-sensitive; lighter touch).
- Ryan sizing the keyword clusters (spec in the .outputs doc) will confirm whether to also build the standalone local hub (move #2).
- Commit/push decision still pending (owner) — logo + LinkedIn + this all uncommitted together.
