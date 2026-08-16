# Decision — Cost Comparison Angles + Dollar-Amount Exception (use-case pages)

**Date:** 2026-06-04
**Mode:** RC → orchestration (user-directed)
**Status:** Decided (user-confirmed)

---

## Context

Project rule (CLAUDE.md): "No dollar amounts on any page (prices fluctuate)" / "NEVER add
dollar amounts or pricing to city pages." The approved use-case spec contained third-party
rental-cost dollar figures on farmers + homeowners pages. Surfaced as a hard-stop gate;
user resolved.

## Decision — per-page cost angle

- **Farmers** — NO rental comparison (farms don't use rented storage). Remove the
  "$150–300/month storage unit" figure from why-block 3; reframe on ownership/asset value
  with NO dollar figures. → page is dollar-free.
- **Contractors** — no cost comparison; no dollar figures (already the case). → dollar-free.
- **Homeowners** — **5-year cost** angle: rent (~$150–250/mo, ~$9k–15k/5yr) vs own a 20ft
  (~$33/mo amortized over 60 months; $2,007 today). Carries dollar figures.
- **Businesses** — **cost-per-sq-ft** angle: own a 40ft (~$8.50/sq ft one-time) vs
  self-storage charged per sq ft monthly. Carries dollar figures.

## Dollar-amount exception (scoped)

Approved exception to the no-dollar rule, limited to: **homeowners (5-yr) + businesses
(per-sq-ft) cost blocks only.** All other pages/sections remain dollar-free. Figures are
third-party comparison + amortized ownership math, NOT a quotable container sticker on
city/product pages.

## Pricing data (single source of truth)

Create `src/data/pricing.ts`, `asOf: '2026-06-04'`, prices as given by user:
- 20ft Cargo: $2,007
- 40ft Standard: $2,709
- 40ft Standard HC: $2,470  ⚠️ (under Standard — likely inventory quirk or transposition;
  flagged to user, stored as given; verify before long-term reliance)

Template computes: monthly = price ÷ 60; per-sq-ft = price ÷ floor area (20ft=160 sq ft,
40ft=320 sq ft). Display rounded with "current market · updated Jun 2026" microcopy so
price drift is one-file to fix. Businesses per-sq-ft uses 40ft **Standard**.

## Future backlog (user "remind me later")

Dedicated **cost-comparison SEO page** — shipping container vs other storage options
(self-storage, PODS, pole barn). Heavy schema/AI markup for AI-citation visibility. Logged
to PROJECT_STATE.todos + pending-work. Build AFTER use-case pages + nav + city expansion.

## Confidence

High — explicit user direction (Grade A).
