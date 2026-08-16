# Handoff Packet — Condition Messaging Correction

**Timestamp:** 2026-06-08 12:35 EDT
**Mode boundary:** RC (analysis) → Persona/Execution (site-wide copy pass)
**Topic:** Correct the site's container *condition* terminology per the sales lead.
**Status:** Awaiting owner confirmation of A001–A004, then execution.

---

## Context
Prior passes labeled the default condition "cargo-worthy (used) by default" sitewide
(commits `62779e6`, `bcb4447`). The sales lead clarified (relayed by owner 2026-06-08)
that this is inaccurate — "cargo-worthy" is a shipping certification, which is NOT what
they stock by default.

## Verified facts — Grade A (direct statement from the sales lead, the product authority)
- **F1** — The default condition sold is NOT cargo-worthy / NOT certified for shipping. It is
  a **solid, used container in usable "value" condition — storage-ready, sold as-is.**
- **F2** — **Cargo-worthy = a shipping certification.** Obtaining it requires a **3rd-party
  container inspection**; it is not provided by default.
- **F3** — **New (one-trip / near-new)** is available **on request only** (confirmed 2026-06-07).
- **F4** — Products differ by **SIZE** (20ft, 40ft, 40ft High Cube); condition is a separate axis.
- **F5** — "one trip" was historically the owner's term for the *delivery* (one trip to drop
  off), not the container's voyage history — the original source of the mislabeling.

## Conclusion — corrected condition model — Confidence: HIGH (Grade A source)
Three condition tiers, decoupled from size:
1. **Used — solid "value" condition** *(default)* — sound, weather-resistant, storage-ready,
   **sold as-is, not certified for shipping.** What most buyers get.
2. **Cargo-worthy (shipping-certified)** — certified for shipping cargo; **requires a 3rd-party
   inspection.**
3. **New (one-trip)** — near-new; **available on request.**

## Proposed wording (RECOMMENDATIONS — pending owner confirmation)
- **Default short label:** "Used — solid value condition"
- **Caveat (key pages):** "Storage-ready and sold as-is — not certified for shipping.
  Cargo-worthy (shipping) certification is available through a 3rd-party container inspection."
- Keep "cargo-worthy" **only** as the name of the shipping-cert tier — never as the default.
- Retain "New (one-trip) available on request."

## Assumptions — Unverified, pending owner confirmation (impact if wrong)
- **A001** — Default label = "Used — solid value condition." *Impact:* relabel churn if changed.
- **A002** — "Cargo-worthy" retained only as the shipping-cert tier (not removed entirely).
  *Impact:* if owner wants it gone, remove all mentions instead.
- **A003** — Caveat prominence = Condition guide + a short note on product pages + the quote
  form (NOT on every condition mention). *Impact:* disclaimer density.
- **A004** — "New (one-trip) on request" still stands. *Impact:* low; likely true.

## Boundaries for execution (Persona / build agent)
**MAY:** replace "cargo-worthy (used) by default" with the approved default label + caveat;
update the quote-form condition dropdown to the 3 tiers; keep grade *education* (define
cargo-worthy as the shipping-cert grade, obtained via inspection); preserve all SIZE facts
(High Cube etc.).
**MAY NOT:** call the default cargo-worthy or shipping-certified; claim shipping certification
without the 3rd-party-inspection caveat; introduce prices/dollar amounts; alter size/HC facts;
touch anything outside condition messaging.

## Files in scope (from prior condition sweeps)
- `src/data/containers.ts` — 3 entries' condition copy + SEO descriptions
- `src/data/cities.ts` — 4 city SEO descriptions
- `src/pages/condition/index.astro` — grade education + positioning + the Cargo-Worthy definition
- `src/pages/quote/index.astro` — condition dropdown options
- `src/pages/shipping-containers-for-sale/index.astro` — FAQ + positioning copy
- `src/pages/for/{farmers,contractors,homeowners,businesses}/index.astro` — condition prose + rec bodies
- `src/components/home/FaqSection.astro`, `PersonasSection.astro`
- `src/pages/index.astro` — meta description
- `src/components/Schema.astro` — condition-grade descriptions
- `src/pages/terms.astro` — condition grades + warranty wording (review for consistency)

## Next step
Owner confirms/edits A001–A004 → execution agent runs the condition pass governed strictly by
this packet → `npm run build` → commit + push. Supersedes the "cargo-worthy by default" wording
from `62779e6`/`bcb4447`.

---

## CORRECTION ADDENDUM — 2026-06-08 (sales lead, via owner) — SUPERSEDES the model above

The owner relayed two further clarifications from the sales lead (the product authority).
These **override** the earlier "Used — solid value condition" framing. Grade A source.

**Corrected three-tier model (decoupled from SIZE):**
1. **Wind & Weather (WWT)** *(DEFAULT / "best value")* — wind- and water-tight, sound used
   condition, storage-ready. This is the tier to feature/recommend. Replaces the invented
   "Used — solid value condition" label from the body above.
2. **Cargo Worthy (CW)** — KEEP as a tier name, but **DROP every "certified for shipping" /
   "shipping-certified" claim.** Per the sales lead: *"CW is not certified for shipping — I'd
   drop the reference."* Do NOT remove CW as a class (it is one of the three correct classes);
   only remove the shipping-certification claim attached to it. The prior handoff's
   "cargo-worthy = shipping cert via 3rd-party inspection" framing (F2) is **retired** — do not
   reference a 3rd-party inspection requirement.
3. **New / One-Trip (One-Use)** — near-new, available **on request**. (Owner also noted new/
   one-trip "comes certified, no 3rd party" — factory CSC plate; fine to describe as near-new,
   do not over-claim.)

**Resolved assumptions:** A001 → label is now **"Wind & Weather"** (not "Used — solid value").
A002 → CW retained as tier name, "certified for shipping" claim removed. A003 → caveat reach per
owner's "everything else is solid" (condition guide + product pages + quote form). A004 → New/
one-trip "on request" stands.

**Net change for the execution agent:** wherever any tier is described as "certified for
shipping" / "shipping-certified" (esp. CW), remove that claim. Default/featured tier = Wind &
Weather. Keep CW and New/One-Trip as named tiers.
