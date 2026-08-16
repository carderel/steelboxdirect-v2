# Session Log — 2026-06-25 — Live pushes, manager content edits, legal pages

**Repo:** steelboxdirect-v2
**Branch:** main
**Last commit on main:** `a32070c`
**Status:** Owner approved push — legal/content batch (`dcde71a`), then GBP linked into schema from owner-provided Maps URL (`398c382`), then state (`a32070c`). All deployed. **Known gap surfaced:** no SBD logo yet; `logo.svg` referenced but missing (404) in Schema.astro + product slug page. Handoffs: `.project-catalog/handoffs/2026-06-25-1552-legal-pages-deployed.md`, `.../2026-06-25-1619-gbp-schema-shutdown.md`.

## User Requests (in order)
1. Push all the changes Codex did live.
2. Fix the `uc-hero-stamp` overlapping/blocking the image on mobile.
3. Add a Google-review QR code to the footer; mock it up with the frontend skill.
4. Manager edits: HC height 8'6"→9'6"; delivery wording → "almost all deliveries take about 2 weeks"; payment = paid up front (+ Afterpay; **no** rent-to-own).
5. Copy Freedom Conex Privacy Policy + Terms; legal-review both for staleness (their privacy is 2023).
6. Manager: "take the **permit** information off — it's the buyer's responsibility." (interpreted "permanent" = "permit")
7. Pull full Freedom Conex site; reconcile our claims to theirs (meaning, not verbatim).
8. Self-pickup in quote form; split-the-difference WWT condition tone; build Terms as WWT-only + Lifetime Leak Warranty.

## Work Completed — PUSHED to production (Cloudflare auto-deploy)
- **`cda6527`** — merged `codex-usage-page-hero-images` into main (usage-page hero images + 18 use-case photos) + committed warranty-stamp CSS fix.
- **`5a8e55b`** — `uc-hero-stamp` mobile fix: pinned the caption flush to the bottom edge as a slim ribbon (≤960px) across all 4 use-case pages so it stops covering the hero image.
- **`4ae3965`** — footer Google-review QR placard (brutalist card, cream tile, links to `g.page/r/CcgVCj2k8LjiEBM/review`); QR at `public/assets/review-qr.png`.

## Work Completed — UNCOMMITTED (held per owner; build passes clean)
1. **HC height** — `RigSection.astro` 8'6"→**9'6"** (label "Interior height"→"Height"). containers.ts + calculator were already correct.
2. **Delivery wording** — "Most deliveries land within 1–2 weeks of deposit" → **"Almost all deliveries take about two weeks"** in `FaqSection`, `quote`, `locations`; businesses page "3–5 business days" → ~2 weeks. Kept "honest window before you commit." ("deposit"→"payment" sweep; FAQ headline "before they pay".) **Verbatim-supported by FC's RTO page.**
3. **Payment FAQ** — new homepage Q: paid in full up front + Afterpay (installments); **no rent-to-own**. Owner confirmed "Afterpay" = the installment service, NOT FC's pay-after-delivery (we do not offer pay-after-delivery).
4. **Privacy Policy** (`privacy.astro`) — rebuilt from Freedom Conex's policy, **hybrid branding** (SBD = authorized agent; Freedom Conex LLC = operating/data-controller entity), trimmed to SBD reality: kept session-recording (Microsoft Clarity) + SMS + Stripe/Afterpay; **cut** targeted-advertising, gov-ID photocopies, precise geolocation, public-database sourcing; softened email→transactional; added a brief multi-state rights courtesy section.
5. **Permit reframe → buyer-responsibility** (owner chose "reframe, keep page" over full removal): `permits/index.astro` (cut "usually no," 73% stat, "we'll figure out your permits" CTAs), homepage `FiveSection` + `FaqSection`, `Schema.astro` permit FAQ, `cities.ts` (Cincinnati/Dayton), `farmers` + `homeowners` pages. Kept statutory citations as *general references, not advice*. No SBD permit determinations/promises remain (verified by grep).
6. **WWT condition tone** — split the difference (between our optimistic and FC's rougher spec): `condition.ts` blurb + `condition/index.astro` WWT card now name honest wear (surface rust, scratches, dents, marked/patched areas, possible prior repairs) while staying reassuring.
7. **Self-pickup** — added "How you'll receive it" select (Tilt-bed delivery / Self pick-up) to the quote form; wired through `submit-quote.ts` (seller email + buyer confirmation; email-only, no DB schema change).
8. **Terms page** (`terms.astro`) — rebuilt from Freedom Conex T&C: **WWT-only** "Our Containers"; **Lifetime Leak Warranty** (omitted the 90-day Satisfaction Guarantee — FC excludes WWT); payment adapted to up-front+Afterpay (removed pay-after-delivery); kept General/Pick Up/Delivery/Storage/Returns/Disclaimer (reconciled "except for the Lifetime Leak Warranty")/Taxes/Arbitration (AAA)/Indemnification/SMS/Acceptance; **Texas governing law**, hybrid branding. Fixes the prior contradiction (homepage promised Lifetime Leak Warranty; old §7 disclaimed all warranties).

## Content reconciliation vs Freedom Conex live site (user uploads/Freedom Conex Site Pages)
- ✅ Matches: products (20/40/40HC), HC 9'6", "about 2 weeks" delivery, Lifetime Leak Warranty, WWT/"Used," authorized-agent + veteran-owned parent.
- FC shop quote form offers only New/Used (4-grade taxonomy lives only in T&C fine print) → confirms WWT-only is consistent.
- Decisions: discount left as-is (Military & Veteran); rent-to-own left off; pay-after-delivery not offered.

## Verification
- `npm run build` — **Complete!** (clean) after each phase; final build clean.
- Mobile fixes verified via Playwright at 390px (contractors hero before/after; footer QR desktop + mobile).
- Permit phrasing re-scanned (grep) — no residual assurances/promises.

## OPEN / NEXT
- **Owner decision:** commit + push the 16-file uncommitted batch? (Owner said "hold.")
- **Attorney review** recommended for privacy + terms before publish (privacy still 2023-era on multi-state/CPRA specifics; likely below state-law thresholds for this business size — confirm).
- Confirm with manager: permit "reframe" (kept page) vs literal "remove entirely."
- Pre-existing backlog unchanged (GBP, GA4 verify, og:image, calculator static fallback, Cloudflare secrets, cost-comparison page, accessories partnerships).

## Artifacts
- Checkpoint: `.checkpoints/2026-06-25-11-56-legal-pages-permit-reframe/checkpoint.md`
- Memory: updated `pending-work.md`; new feedback/project memories (legal-pages-hybrid-branding, permit-buyer-responsibility, delivery-2-weeks-wording).
