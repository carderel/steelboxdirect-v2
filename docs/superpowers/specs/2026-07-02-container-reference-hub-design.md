# Design Spec — Container Reference Hub + Targeted Enrichment

**Date:** 2026-07-02
**Status:** Approved (owner: "looks good proceed")
**Source data:** `.outputs/seo/2026-07-02-container-technical-reference-library.md` (extracted from Freedom Conex's now-unpublished containerreference.com scrape; FC is SBD's principal, content in-network/usable as a data source).
**Origin:** Recovers and completes the build phase of a crash-interrupted session. Research phase survived on disk; no page had been built yet.

---

## 1. Goal

Create one authoritative, evergreen **Container Reference** hub page that consolidates the technical container knowledge (dimensions, ISO markings, lifecycle), then use that spec data to enrich the pages that benefit most and wire everything into a hub-and-spoke internal-linking structure. The page targets informational + AI-citation intent while feeding link equity to the commercial product pages.

## 2. Locked decisions (from brainstorm)

| # | Decision | Choice |
|---|----------|--------|
| Q1 | Page identity | Broad "Container Reference" hub at `/container-reference/`; equal-weight dimensions + markings + lifecycle; anchor-linked sections (`#dimensions`, `#markings`, `#lifecycle`) so each earns its own snippet. |
| Q2 | Enrichment depth | Targeted enrichment + hub-and-spoke interlinking (not links-only, not deep-everywhere). |
| Q3 | Lifecycle stats | Qualitative only — no contested percentages (honors the uncited-stat hard rule). |
| Q4 | Table scope | Full ISO range (10/20/20HC/40/40HC/45); SBD's three (20ft, 40ft, 40ft HC) flagged "We sell" → product pages; others informational only, no prices, no offer language. |

## 3. Architecture

### 3.1 Data module (single source of truth)
New file **`src/data/containerReference.ts`** exporting:
- `referenceSizes: ReferenceSize[]` — the 6 ISO sizes. Each: `{ code, label, sold, productSlug?, ext, intL, intW, intH, door, capacity, notes? }`. `sold: true` for 20ft / 40ft / 40ft HC with `productSlug` linking to the product page.
- `markingCodes` — the ISO 6346 size/type code table (length chars, height/width chars, type codes G0/G1/V0/V2/U0/U1/P1/P3) and the 11-char BIC ID breakdown parts.
- `lifecycleFacts` — qualitative bullet content (Corten patina, service life, origin, abundance).

Rationale: one place for spec numbers → no drift across hub + enriched pages. `containers.ts` (commercial products) stays focused; reconcile the minor precision difference (`19'4"` vs `19'4.2"`) once, here. Reference table uses the fuller ISO precision; product pages keep their existing rounded figures (acceptable — different audiences, no user-facing contradiction on the same page).

### 3.2 Reference page
`src/pages/container-reference/index.astro` — `pageType="guide"`, `guideTopic="reference"`, `prerender = true`, static. Brutalist design matching existing guide pages (yellow/ink/cream, `--narrow`/`--mono` fonts, box-shadow cards). Sections:
1. **Hero** — guide header; eyebrow "§ 06 · Reference"; H1 "The Container Reference: Specs, Markings & Lifecycle"; lede.
2. **`#dimensions`** — full ISO 668 spec table from `referenceSizes`; "✅ We sell" marker + product link on sold rows; info-only note on others; HC-height + 45ft-permit caveats.
3. **`#markings`** — 11-char BIC ID breakdown, 4-char size/type code table, CSC safety plate explainer.
4. **`#lifecycle`** — "Why a used Wind & Water Tight box is a smart buy" — qualitative Corten/service-life/abundance.
5. **FAQ** — small markings/dimensions Q&A wired into FAQPage JSON-LD.
6. **CTA + spoke links** — quote box; links to 3 products, `/condition/`, `/size/`.

### 3.3 Enrichment (targeted)
- **`/condition/`** — add a short lifecycle/Corten block ("surface rust is usually cosmetic, not structural"), linking to `/container-reference/#lifecycle`.
- **3 product spec pages** (`[slug].astro`) — add a one-paragraph "How to read your container's markings" note + link to `#markings`, and a "Full spec reference →" link to `#dimensions`. (Single shared markup in the template, applies to all three.)
- **`/size/` guide** — cross-link to `#dimensions` as the authoritative table.
- **4 use-case pages** — one contextual link each into the hub.

### 3.4 Internal linking (hub-and-spoke)
Hub links **down** to 3 products, `/condition/`, `/size/`, `/quote/`. Every spoke links **up** to the hub (deep-linked to the relevant anchor). ~10 reciprocal internal links total.

## 4. Schema & SEO
- Article schema via `pageType="guide"` (datePublished 2026-07-02, dateModified 2026-07-02).
- BreadcrumbList matching the product-page breadcrumb pattern (Home › Container Reference).
- FAQPage JSON-LD for the markings/dimensions FAQ (AI-citability).
- Title/description target "shipping container dimensions", "container sizes", "container markings / ISO 6346", "shipping container specifications". No cannibalization of product-page commercial titles.
- Sitemap: auto-included (not under `/admin/`).

## 5. Guardrails
- **WWT-only** framing throughout; non-sold sizes shown **informational only**, never as an offer.
- **No dollar amounts** anywhere.
- **Original copy** — written fresh, not pasted from the scrape (old pages may persist in cache/Wayback; original ranks better).
- **Cite primaries firsthand:** ISO 668:2020, ISO 6346, BIC (bic-code.org), IMO CSC. No competitor-blog citations.
- **No uncited/contested stats** in the lifecycle section.
- Titles/H1s of existing pages unchanged (anti-cannibalization); enrichment is additive.

## 6. Verification
- `npm run build` clean.
- Playwright desktop (1280) + mobile (390): table scrolls in-container, no horizontal page overflow; hub + one enriched page render.
- Confirm Article + BreadcrumbList + FAQPage JSON-LD present in served HTML.
- Checkpoint at phase boundary; session log + transcript updated.

## 7. UDO execution
Multi-specialization (SEO/content + Astro dev + verification) → agents mandatory. Orchestrator delegates: `astro-developer` (data module + page + enrichment build), `verifier` (build/Playwright/schema validation). Outputs land in the repo + `.outputs/` where applicable.

## 8. Out of scope (this build)
- Trade-imbalance statistics with citations (deferred per Q3 — can be a future lifecycle upgrade).
- Standalone dimensions/markings sub-pages (single hub only, per Q1).
- The tabled cost-comparison page and accessories partnerships (separate backlog items).
