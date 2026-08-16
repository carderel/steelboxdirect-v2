# Decision: Sitemap + Partytown Integration Approach

**Date:** 2026-05-23  
**Status:** Implemented

## Decision
Use `@astrojs/sitemap` (v3.1.6) and `@astrojs/partytown` (v2.1.7) as official Astro integrations.

## Rationale
- `@astrojs/sitemap` hooks into `astro build` — zero maintenance, new pages auto-included
- `@astrojs/partytown` moves GTM off the main thread — improves Core Web Vitals

## Key tradeoffs and discoveries
- `@astrojs/sitemap` v3.7.2 (latest) targets Astro 6 and fails on Astro 4 — pinned to 3.1.6
- `exclude` option does not exist in v3.x — correct API is `filter: (page) => !page.includes('/admin/')`
- Cloudflare adapter generates `_routes.json` with `include: ["/*"]` — static files like `sitemap-index.xml` and `~partytown/*` must be explicitly added to `exclude` list via `routes.extend.exclude` in adapter config, otherwise the worker intercepts them and serves the homepage

## Files changed
- `astro.config.mjs` — integrations + adapter routes config
- `src/layouts/BaseLayout.astro` — `type="text/partytown"` on GTM script tag
