# Decision — Frontend-Design Integration of Expanded Use-Case Content

**Date:** 2026-06-04
**Mode:** Orchestration (user-directed)
**Status:** Decided

---

## Context

User reviewed the 4 content drafts. Approved the copy. Directed: lean into the
cost-over-storage-rental comparison (a comparison TABLE) on BOTH homeowners and businesses;
use a front-end design agent to build out the design incorporating the recommended images,
with placeholders until real assets are provided.

## Decision

- Created UDO agent `.agents/frontend-designer.md` (frontend-design skill applied strictly
  within the existing Steel Box Direct design system).
- Topology: **homeowners as design canary first** (it has the comparison table — the hardest
  new element). Orchestrator surfaces it on localhost for a direction check, then the same
  agent/pattern is applied SEQUENTIALLY to businesses → farmers → contractors (sequential to
  avoid build/commit/dist races; consistent visual vision).
- Comparison tables on homeowners ("Rent vs own over 5 yrs") and businesses ("Cost of
  Space") made prominent; figures stay dynamic from `pricing.ts`.
- Images = styled PLACEHOLDERS until user provides assets: final alt text set now, intended
  filename noted, fixed dimensions to prevent CLS, no broken/external image requests.
- During integration also fold in SEO should-fixes: SF-1 trim titles ~60 chars; SF-2 already
  handled in drafts (per-audience "where we deliver" + CTA subcopy).
- **FAQPage JSON-LD regenerated** per page to mirror expanded visible FAQs (parity).

## Constraints
- No new dollar amounts; preserve internal links; static pages; local commits only (no push);
  match existing design system (no new aesthetic).

## Confidence
High — explicit user directive (Grade A).
