# Checkpoint — 2026-06-25 11:56 — Legal pages + permit reframe

**Branch:** main · **Last commit:** `4ae3965` · **Build:** clean (`npm run build` → Complete!)

## Pushed live this session
- `cda6527` codex usage-page hero images merged to main (+ warranty-stamp CSS fix)
- `5a8e55b` uc-hero-stamp mobile overlap fix (all 4 use-case pages)
- `4ae3965` footer Google-review QR placard (`public/assets/review-qr.png`)

## Uncommitted working tree (16 files — HELD per owner "hold for now")
```
M src/components/Schema.astro            # permit FAQ schema → neutral/responsibility
M src/components/home/FaqSection.astro   # delivery ~2wk, payment FAQ, permit Q, "before they pay"
M src/components/home/FiveSection.astro  # permit card → buyer responsibility
M src/components/home/RigSection.astro   # HC height 8'6" → 9'6"
M src/data/cities.ts                     # Cincinnati/Dayton permit reframe
M src/data/condition.ts                  # WWT blurb: + honest cosmetic wear
M src/pages/api/submit-quote.ts          # self-pickup field → seller email + buyer confirm
M src/pages/condition/index.astro        # WWT spec tone split-the-difference
M src/pages/for/businesses/index.astro   # delivery 3–5 days → ~2 weeks
M src/pages/for/farmers/index.astro      # permit reframe (kept citations as references)
M src/pages/for/homeowners/index.astro   # permit reframe + delivery
M src/pages/locations/index.astro        # delivery wording ~2 weeks
M src/pages/permits/index.astro          # FULL reframe → buyer responsibility
M src/pages/privacy.astro                # FreedomConex-based, hybrid, trimmed to reality
M src/pages/quote/index.astro            # delivery wording + self-pickup select
M src/pages/terms.astro                  # FreedomConex T&C: WWT-only + Lifetime Leak, TX law
```

## To resume
1. Owner decision: commit + push the batch (one logical commit, or split: legal pages / permit reframe / manager-content / self-pickup).
2. Attorney pass on privacy + terms before publish.
3. Confirm manager intent: permit reframe (done) vs full removal.

## Guardrails honored
- WWT-only policy intact; no Cargo Worthy/One-Trip reintroduced.
- No dollar amounts added to city pages (legal fees in T&C are contract terms, allowed).
- No secrets touched. Build verified clean.
