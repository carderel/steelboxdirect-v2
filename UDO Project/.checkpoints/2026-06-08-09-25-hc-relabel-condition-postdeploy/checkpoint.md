# Checkpoint — 2026-06-08 ~09:25 — HC relabel + condition reframe + post-deploy fixes

**Phase:** Post-launch fixes complete. Use-case pages live; HC relabel + condition model corrected; analytics/SEO/lead-capture hardened.

## Shipped this run (all pushed to main → Cloudflare)
- `96a7d4b` nav/footer finalize (use-case strip, Call Now tel, military line, footer logo chip ink)
- (deploy) — use-case pages + nav LIVE
- `6f8090c` IndexNow → Bing endpoint direct (was only hub; BWT now registers)
- `79cee9b` lead-capture resilience: seller email always fires even if Supabase DB down (no more lost leads)
- `e4425d4` 404 page (kills soft-404) + `/admin`→`/admin/login` 301
- `475bfe0` GTM restored as standard main-thread tag (was Partytown-offloaded/broken) + noscript
- `71f43f4` product relabel: 40ft one-trip → **40ft High Cube** (slug + 301, nav, pricing card, use-case cards) — size only
- `62779e6` condition reframe: **used (cargo-worthy) by default; new (one-trip) on request**; HC reframed off near-new → height/capacity
- `bcb4447` condition stragglers: homepage meta + Q4 FAQ + 4 city SEO descriptions

## Verified (sweep + build)
- Old slug only in the 301; zero false HC condition claims; all "View one-trip" CTAs → "View 40ft High Cube"; HC naming consistent; build clean.
- Remaining "cargo-worthy vs one-trip" = intentional grade-education FAQ questions only.

## Condition model (confirmed by owner 2026-06-07/08)
ALL containers are USED (cargo-worthy) by default. NEW (one-trip) available ONLY on request during the sales call. "one-trip" = the buyer's term for one delivery trip — NOT a stocked condition tier. HC = a SIZE (taller), not a condition.

## Admin login
Supabase Auth (email+password). Project healthy (qwgbfrvjhgcpwzhclqnn). User created via dashboard (Auth→Users, auto-confirm) — owner now logged in. NOTE: Supabase **Site URL still = localhost:3000** (default) → password-reset emails redirect to localhost; no in-app reset-password page. Manage passwords via dashboard for now.

## Open / owner actions
- Verify `SELLER_EMAIL` + Resend domain (lead-email safety net depends on it).
- Fix Supabase Site URL → https://steelboxdirect.com (+ redirect URLs) if email flows wanted.
- Copy review: farm persona (Tom) now points to High Cube for a tall tractor — confirm OK.
- Optional: remove now-unused Partytown integration; build self-serve `/admin/reset` page.
- Real hero images (Gemini brief) → swap into placeholders → push.
- Deferred: city expansion (Columbus/Lexington/Fort Wayne); cost-comparison page; accessories partnerships.
