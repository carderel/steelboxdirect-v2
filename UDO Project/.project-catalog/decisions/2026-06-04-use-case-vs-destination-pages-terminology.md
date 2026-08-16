# Decision — Use-Case Pages vs Destination Pages (terminology + architecture)

**Date:** 2026-06-04
**Mode:** RC (analysis / clarification)
**Status:** Decided (user-confirmed)

---

## Context

The 2026-06-04 design spec was authored under the project name "Destination Pages,"
which conflated two distinct page types under one label. The user clarified the intended
two-layer model, resolving the ambiguity.

## Decision

Two **separate** page types, defined as:

- **Use-case pages** — SEO pages targeting a specific *usage* of a container.
  - Seed set: Farming, Contractors, Home, Business. **Open-ended** — more added later.
  - Built **off-template / unique content** to avoid duplicate-content penalties. May share
    some structural elements, but content is bespoke per page.
  - Live at `/for/[use-case]/`.
  - Main-nav placement **deferred** until the pages are built.
  - Provide outward internal links (e.g. "Where we deliver" → city pages).
- **Destination pages** — the City/Local landing pages.
  - Live: Cincinnati, Dayton, Indianapolis, Louisville.
  - Planned expansion: Columbus (OH), Lexington (KY), Fort Wayne (IN).
  - Already an established page type.

The two layers cross-link (hub-and-spoke mesh). The **primary new deliverable** is the
use-case pages.

## Actions taken

- Spec retitled "Use-Case Pages — Design Spec"; added a locked Terminology section.
- Spec file renamed: `2026-06-04-destination-pages-design.md` → `2026-06-04-use-case-pages-design.md`.
- "ICP page" in the spec body == use-case page (noted in Terminology).

## Open / deferred

- Main-nav placement for use-case pages (re-evaluate once built).
- City→use-case cross-links (all 4 per city vs curated per market) — defer with nav.

## Confidence

High — based on explicit user statement (Grade A evidence).
