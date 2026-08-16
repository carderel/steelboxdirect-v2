# UDO Handoff — 2026-06-25 16:19 — GBP schema linkage + shutdown

**Repo:** steelboxdirect-v2 · **Branch:** main · **HEAD:** `a32070c`
**Deploy:** all work pushed to main; Cloudflare auto-deploy in flight.

## Shipped since the prior handoff (`2026-06-25-1552`)
- **`398c382`** — linked the Google Business Profile into structured data. Owner provided the GMB Maps URL; derived the canonical `https://maps.google.com/?cid=16337072236475848136` and added it to **`Organization.sameAs`** and **`LocalBusiness` `hasMap` + `sameAs`**; aligned the `LocalBusiness` geo default to the GBP pin (`39.1365839, -84.540972`). Build clean; URL renders into schema on 27 pages.
- **`a32070c`** — `PROJECT_STATE.json` updated (GBP linkage done).

## Full session deploy chain (2026-06-25)
`cda6527` (codex hero images merge) → `5a8e55b` (mobile hero-stamp fix) → `4ae3965` (footer review QR) → `dcde71a` (legal pages + permit reframe + manager edits + self-pickup) → `398c382` (GBP schema) → `a32070c` (state).

## ⚠️ Known gap surfaced this session — LOGO
- There is **no finalized Steel Box Direct logo** (owner confirmed not done yet). `public/` has only `freedom-conex-logo.png` (the agent/parent logo); a stray `Logo.png` sits untracked at repo root.
- **`logo.svg` is referenced but does not exist** → resolves to a 404:
  - `src/components/Schema.astro` — `Organization.logo` and `LocalBusiness.image` point to `https://steelboxdirect.com/logo.svg`.
  - `src/pages/shipping-containers-for-sale/[slug].astro` — also references `logo.svg`.
- Impact: schema logo/image is a dead URL; affects rich-result eligibility and the directory/backlink NAP kit.

## OPEN for next session
1. **Logo:** create a real Steel Box Direct logo (SVG + 1024px square) → drop `logo.svg` into `public/`, or repoint the two references to an existing asset. Needed for schema validity + directory submissions.
2. **Attorney review** of the now-live privacy + terms (privacy still 2023-era on multi-state/CPRA specifics; likely below state-law thresholds — confirm). Not legal advice.
3. **Confirm manager intent:** permit reframe (shipped) vs literal full removal of the permits page.
4. **Owner NAP actions** (block backlink strategy): Facebook + LinkedIn company pages (GBP now exists ✓).
5. **Small code tasks (deferred):** og:image (#7, needs image pick), `/size/calculator/` static fallback (#8), FAQ schema/snippet optimization (#9).
6. **Config:** GA4 firing verify, final Cloudflare DNS, switch Cloudflare secrets Plaintext→Secret type.
7. **Future bets:** cost-comparison SEO page; accessories partnerships / `/accessories/` page.

## Guardrails honored
WWT-only intact; no city-page pricing; no secrets; every push built clean.

Related memory: [[legal-pages-hybrid-branding]], [[permit-buyer-responsibility]], [[delivery-2-weeks-wording]], [[pending-work]].
