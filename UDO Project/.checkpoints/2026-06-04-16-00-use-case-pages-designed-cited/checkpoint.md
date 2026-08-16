# Checkpoint — 2026-06-04 ~16:00 — Use-Case Pages Designed + Cited (all 4)

**Phase boundary:** All 4 use-case pages fully designed, content-expanded, cited, verified, committed (local main). Awaiting user review + real images, then push, then nav + city expansion.

## Final state — committed (local, NOT pushed)
- `0fe9d6b` pricing.ts
- `3b06a9d`→`cc69aa9`→`e092219`→`656c997` homeowners (built → expanded → canary design → national-rental/citations patch)
- `e64baaa`→`6c8eaed` businesses (built → design build-out + Cost-of-Space table + citations)
- `f0473d7`→`7256e94` ... farmers (built → design build-out + citations) [farmers build commit 3b06a9d earlier; design 7256e94]
- `28c6923` contractors (design build-out + citations + tare fix)

## Verified (build + greps)
- All 4 build clean; routes in dist + sitemap.
- FAQ↔JSON-LD parity (single `faqs` array): homeowners 7, businesses 7, farmers 7, contractors 5.
- Dollar-scope: farmers/contractors = 0; homeowners/businesses dynamic from pricing.ts.
- Homeowners self-storage corrected to NATIONAL avg ~$120/mo (~$7,200/5yr) + disclaimer + SpareFoot citation; time promise removed (also FAQ Q3 "30–45 min" scrubbed).
- No unconditional time/speed promises on any page.
- Contractors tare fixed 4,850→~5,000 lb.
- Citations real/verified (GOV/EDU/standards/industry), library at `.outputs/use-case-content/citations.md`.

## Design system
- Hero 2-col grid, brutalist cards, comparison tables (home/biz), `figure.uc-img` image placeholders (data-URI, final alt, fixed dims → zero CLS, intended filename in comments). Per-audience accent.

## Open / flags (minor, for final-review/polish)
- Kentucky ag citation used `laruecountyky.gov` (county) rather than KRS 100 statute from citations.md — verify it states the ≥5 contiguous-acres caveat; consider swapping to KRS. 
- Images are placeholders — user to supply real assets (drop-in by filename, zero CLS).
- 40ft HC < Standard in pricing.ts (verify-comment; biz uses Standard).

## Reviews on record
- verifier PASS; seo-analyst ship-ready (SF-1 titles trimmed during integration; SF-2 dedupe done in drafts).

## Next
- User reviews all 4 on localhost:4321 → supply real images → push to deploy.
- Then deferred sequence: nav placement ("Who We Serve") → city expansion (Columbus/Lexington/Fort Wayne).
- Backlog: cost-comparison page; accessories partnerships.
