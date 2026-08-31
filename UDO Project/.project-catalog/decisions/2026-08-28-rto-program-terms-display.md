# Decision: Define a flat program term as a second class of publishable figure

**Date:** 2026-08-28
**Decider:** Owner (Eli), after speaking with Doug about My Container Rental's 2026-08-28 announcement
**Supersedes:** nothing. The 2026-08-17 city-page pricing override stands exactly as written.
**Status:** Decided. `src/lib/compliance/city-pricing-guard.test.ts` amended in the same change.
**Todo:** T-183

---

## Context

Doug's text of 2026-08-28: from **2026-09-01**, My Container Rental makes **$99** the standard
rent-to-own down payment on standard containers, replacing the previous 10% down. Beyond **150
miles from the depot the container ships from**, and on modified or specialty units, **20% down**
applies. June's $99 special roughly doubled My Container Rental's sales volume, which is why the
figure is becoming standard rather than staying a promotion.

The site wants that offer on the pages where a buyer is already looking at money, city pages
included. That runs straight into the city-page pricing rule, so the rule has to be read carefully
before anything ships.

## Decision

The **2026-08-17 city-page pricing policy is EXTENDED, not altered.** It continues to govern
**delivered container prices** in the exact words it was written in:

> A price on a city page MUST derive from the daily feed, MUST be scoped to a named ZIP, MUST carry
> the effective date, and MUST carry the disclaimer. A hardcoded or hand-typed dollar amount on a
> city page remains forbidden.

Beside it, a **second and separate class of publishable figure** is defined: a **flat program
term**. A flat program term is a fixed contractual figure set by a named third party, identical
everywhere, and not computed from anything about the reader.

`$99`, `20%`, and `150 miles` are flat program terms. A delivered price is not.

## Rules for a flat program term, on any page

1. **Sourced from `src/data/rtoTerms.ts`, never hand-typed.** One module owns the figures. Every
   surface interpolates. A literal `$99` in page copy is a defect regardless of whether it happens
   to be correct today.
2. **Always rendered together with its condition, never alone.** The condition is what makes the
   offer true. A headline stating the figure without the distance tiers beside it is a false claim,
   not an abbreviated one. The CTA component that carries this figure takes no props, so there is
   no mechanism by which the small print can be switched off.
3. **Attributed to My Container Rental.** The program is administered by an independent third
   party. Steel Box Direct does not set these terms and does not approve anyone for them.
4. **Carrying its effective date.** The term takes effect 2026-09-01. Copy says so rather than
   implying the figure was always there.

## Why a second class rather than an amendment to the first

The 2026-08-17 rule is a **provenance and freshness rule for a number that the daily feed computes
per ZIP.** Every clause in it exists because the underlying figure moves and is derived: the feed
requirement pins where the number came from, the named ZIP pins what it is a price *of*, the
population centroid pins which point in the metro was measured, and the effective date pins how
long it has held.

`$99` has none of those properties. It has no ZIP, no feed, and no centroid. It is not a
measurement of anything, it is a term in somebody's contract.

Forcing it through the delivered-price rule would leave only two ways out, and both are bad:

- **Loosen the delivered-price rule** so that its ZIP, feed, and centroid clauses become optional.
  That would dissolve the protection that made publishing a price on a city page defensible in the
  first place, and it would do so on behalf of a figure that never needed it.
- **Dress `$99` up as a feed-derived, ZIP-scoped number.** That is a lie about provenance. It would
  put a named ZIP and a centroid basis next to a figure that has nothing to do with either, and the
  next reader of that page, human or machine, would draw a false conclusion about how it was
  derived.

A second class costs one paragraph and keeps both statements honest. The delivered price is
measured, so it carries its measurement. The program term is contractual, so it carries its
contract.

## What is still forbidden

- **A hand-typed dollar amount anywhere on a city page.** Unchanged and unweakened. The digit rule
  in `city-pricing-guard.test.ts` was not relaxed to admit `$99`; the figure arrives interpolated
  from `rtoTerms.ts` like every other figure on the page, so the rule never had to bend.
- **Any flat program term rendered without its condition.** Enforced by
  `src/lib/compliance/rto-terms-guard.test.ts`.
- **Any per-city or geo-aware variant of the offer.** The 150 miles is measured from the **depot
  the container ships from**, never from Cincinnati. There is no per-city distance question and no
  distance data to build. An earlier design pass assumed Cincinnati, computed straight-line
  distances for all fifteen metros, and concluded that eight of them could not offer $99. That
  analysis is void.
- **Any change to application or approval wording.** Doug's memo says no application or special
  approval is needed. Everything observable still requires an application, so the site keeps its
  existing wording. Owner ruling 2026-08-28. Nothing in this record licenses tidying that language
  up to match the memo.
- **Restating My Container Rental's June volume result as a Steel Box Direct statistic**, or
  converting "roughly doubled" into a percentage nobody measured.

## What this record does NOT change

- **The 2026-08-17 policy itself.** Not one clause of it moves. Delivered prices on city pages
  still require the feed, the named ZIP, the centroid basis, the effective date, and the
  disclaimer.
- **PROJECT_HS_003.** A down payment is not a regulated topic. Nothing here licenses a permit,
  zoning, tax, insurance, or structural claim.
- **WWT-only.** Used Wind and Water Tight remains the only grade priced anywhere.
- **No delivery-time promises.** The condition is about distance affecting cost, which is fine.
  Speed claims are not.

## Related

`2026-08-17-city-page-pricing-override.md` (the delivered-price rule this sits beside, unchanged),
`2026-07-09-pricing-display-policy.md` (the first pricing expansion, whose city clause the 08-17
record superseded and which this record does not touch), `2026-07-30-rent-to-own-pivot.md`,
`docs/superpowers/specs/2026-08-31-rto-99-down-design.md` section 4, T-183.
