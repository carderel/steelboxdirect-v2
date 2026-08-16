# Handoff Packet — Indexing Action Kit (RC → Persona)

**Date:** 2026-06-29 13:20
**Topic:** GSC Request-Indexing runbook + GBP post blurbs
**Source analysis:** `.memory/working/2026-06-29-gsc-performance-analysis.md`

## Verified facts (Grade A)
- 21 URLs are "Discovered – currently not indexed," never crawled (epoch-0 last-crawl). Homepage + 40ft HC page already indexed. (GSC Coverage export.)
- No technical block: robots OK, no noindex, internal links present, canonicals self-referencing, static serving, trailing slashes consistent, all URLs in sitemap. (Repo + dist/ audit.)
- Diagnosis: new-site crawl deprioritization (low authority), not a defect. Confidence 85%.
- GBP is live with reviews (user statement). Linked in schema (cid in 398c382). Footer review-QR placard drives reviews.
- Full URL inventory (from `dist/sitemap-0.xml`): homepage, /shipping-containers-for-sale/ + 3 product subpages (20ft, 40ft, 40ft HC), 4 city pages (cincinnati/dayton/indianapolis/louisville), /locations/, 4 use-case pages (farmers/contractors/homeowners/businesses), /cost/, /delivery/, /condition/, /permits/, /size/, /size/calculator/, /quote/, /privacy/, /terms/.

## Locked copy constraints (Persona MUST honor)
- **NO dollar amounts / pricing** anywhere (HARD STOP + city-page rule).
- **WWT (Wind & Water Tight, used) sold as-is, NOT certified for shipping.** No Cargo Worthy / New / "certified for shipping" claims.
- Delivery wording: **"almost all deliveries take about two weeks."**
- Service area: **within 250 miles of Cincinnati.**
- **No permit promises** (buyer responsibility).
- Lifetime Leak Warranty is the warranty claim in use.

## Boundaries
- Persona MAY: format the runbook, order URLs by SEO priority, write GBP post copy within the constraints above.
- Persona MAY NOT: invent new product grades, add prices, promise permits/certification, alter the delivery-timeline wording, claim indexing outcomes as guaranteed.

## Deliverables
1. `.outputs/seo/2026-06-29-gsc-request-indexing-runbook.md`
2. `.outputs/seo/2026-06-29-gbp-post-blurbs.md`

Persona acknowledges these constraints before writing.
