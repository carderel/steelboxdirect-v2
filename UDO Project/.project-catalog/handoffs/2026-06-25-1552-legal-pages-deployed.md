# UDO Handoff — 2026-06-25 15:52 — Legal pages + permit reframe DEPLOYED

**Repo:** steelboxdirect-v2 · **Branch:** main · **HEAD:** `dcde71a`
**Deploy:** pushed `4ae3965..dcde71a` → Cloudflare Pages auto-deploy in flight.

## What shipped this commit (`dcde71a`, 16 files)
- **Privacy** (`privacy.astro`) — rebuilt from Freedom Conex policy, **hybrid branding** (SBD = authorized agent; Freedom Conex LLC = operating/data-controller entity), trimmed to SBD reality (kept Microsoft Clarity session-recording + SMS + Stripe/Afterpay; cut targeted-ads/gov-ID/geolocation/public-DB sourcing; softened email→transactional; added multi-state rights courtesy section).
- **Terms** (`terms.astro`) — rebuilt from Freedom Conex T&C: **WWT-only + Lifetime Leak Warranty** (90-day Satisfaction Guarantee omitted — FC excludes WWT), **Texas governing law**, hybrid branding. Resolves prior contradiction (homepage promised Lifetime Leak Warranty; old §7 disclaimed all).
- **Permit reframe → buyer responsibility** — `permits/index.astro`, `FiveSection`, `FaqSection`, `Schema.astro`, `cities.ts`, `farmers`, `homeowners`. Statutes kept as general references; no SBD permit determinations/promises.
- **Manager edits** — HC 8'6"→9'6" (`RigSection`); delivery → "almost all deliveries take about two weeks" (`FaqSection`/`quote`/`locations`/`businesses`); "deposit"→"payment"; payment FAQ paid-up-front + Afterpay (no RTO); WWT condition tone balanced (`condition.ts` + condition page).
- **Self-pickup** — quote form select + `submit-quote.ts` (seller email + buyer confirm; email-only, no DB schema change).

## Verification
- `npm run build` clean before push.
- Earlier in session: Playwright mobile checks (hero-stamp, footer QR); permit-phrasing grep scan clean.

## State
- `PROJECT_STATE.json` updated: `last_commit` = `dcde71a`; batch marked DEPLOYED; commit/push todo cleared.
- Working tree now clean except local UDO/state files and the 2 untracked unreferenced `40ft-container-hero.jpeg/.png` (pre-existing noise, intentionally not tracked).

## OPEN for next session
1. **Attorney review** of the now-live privacy + terms (privacy still 2023-era on multi-state/CPRA specifics; likely below state-law thresholds — confirm). Content observations only, not legal advice.
2. **Confirm manager intent:** permit *reframe* (shipped) vs literal full removal of the permits page.
3. Backlog unchanged: GBP + Organization.sameAs, GA4 verify, og:image, calculator static fallback, Cloudflare secrets→Secret type, cost-comparison SEO page, accessories partnerships.

## Guardrails honored
WWT-only intact (no CW/One-Trip reintroduced); no city-page pricing; no secrets; build verified.

Related memory: [[legal-pages-hybrid-branding]], [[permit-buyer-responsibility]], [[delivery-2-weeks-wording]], [[pending-work]].
