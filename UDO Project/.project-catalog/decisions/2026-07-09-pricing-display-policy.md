# Decision: Restore average price display (policy expansion)

**Date:** 2026-07-09
**Decider:** Owner (Eli), explicit instruction: "put the price ranges back on… really push that it's an average range and the quote may be more or less."

## What changed
The prior default — "No dollar amounts on any page (prices fluctuate)" — is expanded. Average prices are now ALLOWED on:
- Homepage (PriceSection)
- Product hub + 3 spec pages (/shipping-containers-for-sale/ 20ft, 40ft, 40ft-HC)
- Use-case pages (already had a sanctioned exception per `2026-06-04-cost-comparison-content-and-dollar-exception.md`)

**UNCHANGED / still a hard stop:** NEVER add dollar amounts or pricing to CITY pages. City pages stay dollar-free. This decision does NOT touch that hard stop.

## Why this is compliant, not an override
- The named hard stop is city-pages-only; owner scoped pricing to homepage + product pages, so the hard stop is honored, not violated.
- The broader "no $ on any page" was a default guardrail (fluctuation risk), which already had a documented carve-out (use-case pages). This extends that carve-out.
- The fluctuation risk is mitigated exactly as owner directed: prominent "average, your quote may be more or less" disclaimer + an "as of" date.

## Approved specifics
- **Numbers (owner-confirmed accurate, rounded to nearest $10, single source `src/data/pricing.ts`, asOf 2026-07-09):** 20ft $2,010 · 40ft Standard $2,710 · 40ft High Cube $2,470.
- **HC below Standard is REAL** (owner confirmed "surprisingly accurate") — supply-driven; a subtle reassurance note added so it doesn't read as a typo. Not a data error.
- **Format:** single average ("starting at / average") per size, NOT a firm price.
- **Disclaimer (approved):** "These are average starting prices, not quotes. What you pay can land above or below — it depends mostly on how far we deliver and current market supply. We'll give you a real, all-in number when you request a quote. (Average as of July 2026.)"
- **Guardrails held:** WWT-only; no delivery-TIME promises (cost varies by delivery distance is fine, speed claims are not); all numbers from pricing.ts (no hardcodes/fabrication); city pages untouched.

## Maintenance note
Prices fluctuate — the `asOf` date + disclaimer manage this. Refresh `pricing.ts` when the owner supplies new averages; the "as of" microcopy updates with it.

## Related
`.project-catalog/decisions/2026-06-04-cost-comparison-content-and-dollar-exception.md`; memory [[business-model-and-experiments]], [[pending-work]].
