# Decision: Lift the city-page dollar hard stop, replace it with a provenance rule

**Date:** 2026-08-17
**Decider:** Owner (Eli), explicit: "city-page policy is over ridden. population centroid is the correct one"
**Supersedes:** the city-page clause in `2026-07-09-pricing-display-policy.md` and the
`CLAUDE.md` hard stop line "NEVER add dollar amounts or pricing to city pages"
**Status:** Decided. Guard and CLAUDE.md updated in the same change.

---

## What changed

City pages may now display a price. The prohibition is replaced by a **provenance and
freshness rule** rather than removed outright:

> A price on a city page MUST derive from the daily FreedomConex feed, MUST be scoped to a
> named ZIP, MUST carry the effective date, and MUST carry the disclaimer. A hardcoded or
> hand-typed dollar amount on a city page remains forbidden.

So the guard flips from "no dollar signs under `src/pages/locations/`" to "any dollar figure
under `src/pages/locations/` must be interpolated from the pricing module and accompanied by
its date and disclaimer." That is a stricter test in every respect except the one the owner
lifted.

## Why the original stop no longer applies

The stop is traceable to `2026-06-04-cost-comparison-content-and-dollar-exception.md`, whose
stated rule was "No dollar amounts on any page (prices fluctuate)." **The reason was
staleness.** It was not legal, not regulatory, and unrelated to PROJECT_HS_003.

`2026-07-09-pricing-display-policy.md` then allowed prices on the homepage and product pages
while preserving the city-page exclusion, **but gave no reason specific to city pages.** The
06-04 distinction had been "comparison math, not a quotable container sticker"; the 07-09
change then permitted quotable stickers on product pages. The distinction that justified the
carve-out dissolved, and the city-page clause survived as inertia rather than as a rationale.

**The daily feed inverts the original concern.** A number verified daily and stamped with its
effective date is fresher than the static figure that has sat on the homepage since
2026-07-09. Applying a staleness rule to the freshest number on the site while exempting the
stalest one is backwards.

## What is NOT changed

- **PROJECT_HS_003 is untouched.** Price is not a regulated topic. Nothing here licenses a
  permit, zoning, tax, insurance or structural claim on a city page, and HS_003 class 7
  (jurisdiction plus outcome) still forbids naming a city in the same breath as a
  determination.
- **WWT-only stands.** Used Wind and Water Tight is the only grade priced anywhere.
- **No delivery-time promises.** Cost varying by distance is fine; speed claims are not.
- **No hand-typed prices anywhere**, city pages included. Everything derives from the module.
- **New-condition containers stay out** and remain pinned as a separate build (T-143).

## The ZIP basis: population centroid

Each metro's published price is computed for the **population centroid ZIP**, not the
downtown or nearest-to-yard ZIP.

Reason: the yard is usually near downtown, so a downtown ZIP produces the cheapest possible
delivery and makes the published number a best case that nearly every real buyer beats on the
way up. The centroid is a slightly higher headline that is far more often close to right, and
it shrinks rather than maximises the gap the buyer discovers on the call.

## Copy contract

Approved shape, wording to be finalised in the build spec:

> **$2,040** delivered to 45202. This price has been in effect since August 12.
> Your ZIP will be different. Delivery distance is most of the variation, so call for
> your number.

- Rounded to the nearest $10. No cents; cents imply a precision the feed does not have.
- The date shown is `effectiveSince`, the date the price last CHANGED, never the date it was
  last checked. See T-141 for why the two are mutually exclusive under the commit-on-change
  build.
- "Best price" phrasing is rejected. It implies the displayed number is not the best one,
  which invites the call but devalues the figure and edges toward bait. Frame on completion,
  not discount.

## Schema

City pages carry the price as **visible DOM text and in QuickFacts**, and deliberately **NOT**
as an `Offer` node. Fifteen cities times three sizes would mint 45 duplicate Offer entities
for 3 products, and inconsistent duplicates degrade rich results. A sandboxed agent reads the
DOM text without needing an Offer node. Product spec pages keep their real `Offer.price` and
gain `priceSpecification.validFrom`.

## Related

`2026-06-04-cost-comparison-content-and-dollar-exception.md`,
`2026-07-09-pricing-display-policy.md`, T-141 (the feed and its architecture), T-143 (new
condition, deferred), T-139 (the `$0` on the locations hub, which this does not address).
