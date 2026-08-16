# Checkpoint — 2026-06-29 23:34 — Storage keyword gap fix

## Phase
optimization_expansion — on-page keyword targeting

## What was done (this phase)
Applied "& Storage" keyword blending to the commercial "for sale" pages that previously targeted only "shipping container." 12 edits, build clean, visually verified.

### Files changed (UNCOMMITTED — held pending owner deploy decision)
- `src/pages/index.astro` — title + meta description (+ "& storage")
- `src/components/home/HeroSection.astro` — billboard H1 → "Shipping & Storage Containers / That Actually Show Up."
- `src/pages/shipping-containers-for-sale/index.astro` — title + H1
- `src/pages/[citySlug].astro` — city H1 → "Shipping & Storage Containers in {City}"
- `src/data/cities.ts` — 4 city seo.titles (Cincinnati/Dayton/Indianapolis/Louisville)
- `src/data/containers.ts` — 3 product seo.titles (20ft/40ft/40ft HC; HC kept "Shipping" + added "Storage")

### Verification
- `npm run build` → **Complete!** (clean)
- Rendered `<title>` tags confirmed in dist for homepage, hub, Cincinnati, 40ft HC.
- Playwright visual check of homepage hero at 1200px and 390px — H1 wraps cleanly, no overflow.

## Decisions
- Enrich existing pages, NOT new pages (avoids cannibalization on a low-authority domain). URLs unchanged.
- 40ft HC title keeps "Shipping" (the term it already surfaces for) and adds "& Storage" rather than swapping.
- Honest scope: only homepage is indexed today, so it's the only near-term traffic capture; rest banks value for when indexing catches up.

## Project events
- Owner secured ≥1 legitimate backlink (not topically related, but legit). Details (source / dofollow) pending. Helps authority + crawl demand — relevant to the "Discovered – not indexed" gap.

## Open / next
- Deploy decision: commit + push the 12 storage edits? (Not committed — following hold-until-owner-says pattern.)
- Optional follow-up: blend "storage container" into product/city meta descriptions + image alt + body long-tail ("portable storage container," "Conex box").
- Validate top "storage" terms in Google Keyword Planner.
- Still pending from session: GSC Request-Indexing pass (owner), parked permit-contacts decision log, session log.

## Artifacts
- `.outputs/seo/2026-06-29-storage-keyword-gap.md`
- `.outputs/seo/2026-06-29-gsc-request-indexing-runbook.md`
- `.outputs/seo/2026-06-29-gbp-post-blurbs.md`
- `.memory/working/2026-06-29-gsc-performance-analysis.md`
- Handoff: `.project-catalog/handoffs/2026-06-29-1320-indexing-action-kit.md`
