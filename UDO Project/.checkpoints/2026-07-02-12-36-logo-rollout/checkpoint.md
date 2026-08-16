# Checkpoint — 2026-07-02 12:36 — Logo rollout

**Repo:** steelboxdirect-v2 · **Branch:** main · **Base commit:** `0380fef`
**Status:** Full logo rollout complete + verified. **UNCOMMITTED** (owner has not authorized a push).

## What this checkpoint captures
Official SBD logo set (supplied by owner at `user uploads/Steel Box Direct logo/assets/logo`)
wired across the site + schema. Resolves the long-standing **LOGO GAP** todo.

## Completed todos (this session)
1. Placed logo assets in `public/` (source set + derived header/footer/schema/og assets).
2. Fixed schema `logo.svg` 404 → repointed 3 refs to `/logo.png`.
3. Swapped header brand (CSS-faked → real logo PNG).
4. Swapped footer brand + favicon + og:image.
5. Build + Playwright verify + this checkpoint/log (in progress → done at session end).

## Key decision (evidence-graded)
- **Grade A (verified):** site loads Archivo / Archivo Narrow / JetBrains Mono / Permanent Marker — **NOT Poppins** (the logo font). BaseLayout.astro:75,119-121.
- **Inference (D):** SVG-via-`<img>` (and inline SVG) would font-fall-back off Poppins and not match approved art → **use the PNG assets** (Poppins baked in) for all visible logos.
- **Grade A:** header bg = `var(--yellow)` (BaseLayout.astro:146-147) → header logo uses transparent/ink-text variant. Footer bg = `var(--ink)` `#0B0F1A` (SiteFooter.astro:85) → footer logo uses yellow-on-ink variant.
- **A001 (resolved):** footer logo's `#141414` block showed a faint seam on `#0B0F1A` footer → recolored dark pixels to `#0B0F1A` so the block is invisible. Verified in Playwright.

## Files changed (uncommitted)
- `src/components/Schema.astro` — Organization.logo + LocalBusiness.image → `/logo.png`
- `src/pages/shipping-containers-for-sale/[slug].astro` — Product.image → `/logo.png`
- `src/components/SiteNav.astro` — `.brand` → `<img.brand-logo>`
- `src/components/SiteFooter.astro` — `.fbrand` h3 → `<img.fbrand-logo>` (+ CSS)
- `src/layouts/BaseLayout.astro` — `.brand-logo` CSS (desktop+mobile); og:image/twitter:image + summary_large_image
- `public/favicon.svg` — container drawing → ink tile + yellow "S"
- **new:** `public/logo.png` (1024 sq badge), `public/logo.svg` (vector badge), `public/og-image.png` (1200x630 card), `public/assets/logo/` (full source set + `logo-header.png` + `logo-footer.png`)
- `PROJECT_STATE.json` — logged completion, cleared resolved todos

## Verification
- `npm run build` — Complete! (clean)
- All assets HTTP 200 on dev (logo.png / og-image.png / logo-header.png / logo-footer.png / favicon.svg)
- Served home HTML schema now shows `"logo"`/`"image"` = `https://steelboxdirect.com/logo.png`
- Playwright: header@1280 ✓, footer@1280 (seamless) ✓, header@390 mobile ✓

## Next / open
- **Owner decision:** commit + push this batch (Cloudflare auto-deploys). Uncommitted per default (no push authorized).
- Stray root `Logo.png` now obsolete — owner may delete.
- Remaining backlog unchanged (attorney review of legal pages, permit reframe confirm, GA4 verify, calculator static fallback, Cloudflare secrets, cost-comparison page, accessories partnerships).
- Latent: 2026-06-29 session (7945f46 / 0380fef) still has no session log — `Backfill sessions` if wanted.
