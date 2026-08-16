# Decision — Content-Writer Agent + Article Expansion of Use-Case Pages

**Date:** 2026-06-04
**Mode:** Orchestration (user-directed)
**Status:** Decided

---

## Context

User reviewed the 4 built use-case pages on localhost; they're structurally correct but
content-thin — sparse / poorly spaced on a wide monitor. User directed: invoke a content
writer to write a fuller article for each page + recommend 4–8 images per page with
descriptions usable as SEO alt text.

## Decision

- Created new UDO agent `.agents/content-writer.md` (long-form SEO/AI-visibility content +
  image recommendations). No external (VoltAgent) agent needed; leverages local
  `copywriting` + `ai-seo` + `image` skills.
- Dispatch ONE content-writer per page (4 parallel) — independent deliverable files, no repo
  mutation, no build/commit → safe to parallelize.
- Deliverables are **review drafts** written to `.outputs/use-case-content/<audience>-article.md`
  — NOT applied to live pages. Rationale: user must approve copy and source/generate the
  images before an astro-developer integrates them + adjusts layout/spacing.
- Each deliverable: section-by-section expanded article (mapped to existing page section
  order) + image plan table (placement · description · full alt · truncated alt · filename).

## Constraints carried to writers
- No new dollar amounts; only existing pricing.ts-sourced figures (home/biz) stay.
- Preserve internal links (3 product, 4 city, /quote/).
- Keep pages genuinely distinct (fix SF-2: vary the shared "where we deliver" lede + CTA
  subcopy per audience).
- Recommend images only — do NOT generate.

## Follow-on (after user approves drafts)
- astro-developer integrates approved copy + image slots + spacing fixes; address SEO
  should-fix items (SF-1 title length, SF-2 dedupe) during integration.

## Confidence
High — explicit user directive (Grade A).
