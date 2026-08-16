# Checkpoint — 2026-06-10 13:10 — Mobile review fixes deployed

**HEAD:** `622820d` (pushed to `main` → Cloudflare auto-deploy)
**Branch:** main, clean (only untracked test/asset files, no source pending)

## What this checkpoint covers
Interactive Playwright-MCP mobile review at 390px + the resulting fixes, all shipped.

## Completed todos (4/4)
1. ✅ Verify hero button truncation + secondary nav strip suspects → truncation REFUTED, strip orphan-pipe CONFIRMED.
2. ✅ Test mobile hamburger nav / Locations / Use Type strip → found CRITICAL unscrollable-menu bug.
3. ✅ Test quote form on mobile → passes (fields fit, validation works, WWT-only condition dropdown).
4. ✅ Sweep key templates for overflow/legibility → all clean (compare-table is intentional scroller).

## Fixes shipped (`622820d`, `src/layouts/BaseLayout.astro`)
- **Mobile menu now scrolls** — `max-height:calc(100dvh - 96px)` + `overflow-y:auto` on `nav.p`. Fixes Get-a-Quote / Tools / Locations being unreachable below the fold on standard phones (was the most impactful conversion bug found).
- **Secondary strip** — chip outlines + removed `a + a::before` pipe on mobile (no orphan pipe on wrap).
- **Menu toggle** — 44px tap target.

## Verification
- `npm run build` clean.
- Re-tested in-browser: menu scrolled to reveal all bottom items; chips render without orphan pipe; toggle measured 44px; calculator advanced on tap.

## Constraints honored
- No prices/dollar amounts touched.
- Condition copy untouched (still WWT-only).
- Single-source FAQ / stats.ts / condition.ts patterns untouched.

## Next session
No blocking task. Backlog: GBP + social profiles + logo SVG (block backlink strategy), cost-comparison SEO page, accessories partnerships, Cloudflare secrets→Secret type, og:image, /size/calculator/ static fallback.
