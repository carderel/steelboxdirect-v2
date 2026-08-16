# Checkpoint — 2026-06-04 14:12 — Orientation + Terminology Realignment

**Phase boundary:** Orientation complete + terminology realigned → entering agent-orchestrated build.

## Completed this phase
- UDO orientation (read ORCHESTRATOR, HARD_STOPS, REASONING_CONTRACT, PROJECT_STATE, LESSONS_LEARNED, CAPABILITIES, latest session log).
- Updated `CAPABILITIES.json` → Opus 4.8, Darwin 25.5.0.
- Resolved "use-case pages vs destination pages" confusion (user-confirmed two-layer model):
  - Use-case pages = container-usage SEO pages (`/for/[use-case]/`), off-template/unique, open-ended seed set (farmers/contractors/homeowners/businesses). PRIMARY deliverable.
  - Destination pages = city/local pages (existing; expansion = Columbus/Lexington/Fort Wayne).
- Realigned spec: retitled "Use-Case Pages — Design Spec", added locked Terminology section, renamed file → `docs/superpowers/specs/2026-06-04-use-case-pages-design.md`.
- Decision logs written: terminology; agent orchestration topology.
- Memory updated: `pending-work.md`.

## Current state
- Nothing built in code yet. No `src/pages/for/`. `cities.ts` still has original 4 cities.
- Spec is content-complete (full copy + FAQs for all 4 pages) and approved.

## Scope locked (user)
- Sequential: use-case pages FIRST → then nav placement → then city expansion.
- This cycle = 4 use-case pages only.

## Next
- Dispatch plan agent → review → dispatch astro-developer build agents (farmers canary, then 3 parallel) → seo-analyst + verifier review.
- All work delegated to subagents per user directive; orchestrator does no implementation.

## Key patterns (for agent briefings)
- Import path: `../../../layouts/BaseLayout.astro`.
- BaseLayout props: title, description, pageType="guide", datePublished, dateModified; `<slot name="head" />` present.
- FAQPage JSON-LD: `<Fragment slot="head"><script type="application/ld+json" set:html={JSON.stringify({...})} /></Fragment>` (see `[citySlug].astro:30-61`).
- City slugs: cincinnati/dayton/indianapolis/louisville-shipping-containers; nav codes CIN/DAY/IND/LOU.
- Accents: farmers --c4-cost, contractors --c3-deliver, homeowners --c2-cond, businesses --c5-permits.
- CTA: reuse `.guide-product-cta` inline pattern (see `cost/index.astro:178-188`).
