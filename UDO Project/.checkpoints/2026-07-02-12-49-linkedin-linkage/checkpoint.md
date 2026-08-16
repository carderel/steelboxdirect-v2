# Checkpoint — 2026-07-02 12:49 — LinkedIn company page linkage

**Repo:** steelboxdirect-v2 · **Branch:** main · **Base:** `0380fef` · **UNCOMMITTED** (with the logo batch).

## Change
Owner created a LinkedIn company page (`https://www.linkedin.com/company/steel-box-direct/`).
- `Schema.astro` — added URL to **Organization.sameAs** + **LocalBusiness.sameAs**.
- `SiteFooter.astro` — new visible **"Follow Steel Box Direct"** company-social row (LinkedIn icon), separate from Doug Froh's personal block; reuses existing footer social CSS (no new styles).

## Verify
- `npm run build` clean.
- Served home HTML: LinkedIn URL appears 3× (Org sameAs, LB sameAs, footer). `sameAs` array = [maps cid, linkedin company].
- Playwright: footer company row renders separate from Doug's, matching 38px icon styling — desktop + mobile.

## Open
- Commit/push decision still pending (owner) — this rides with the logo batch.
- Facebook company page = only remaining owner NAP action.
- Strategic: RTO / cargo-container vertical discussion opened (Ryan's VRTO research) — analysis only, no code.
