# Design: the $99 RTO down payment across the site

Date: 2026-08-31 · Status: awaiting owner approval · Todo: T-183
Trigger: Doug's text, 2026-08-28. My Container Rental makes $99 the standard RTO down payment
from 2026-09-01.

## 1. THE FACTS WE ARE PUBLISHING

Established from Doug's message plus the owner's two rulings:

- From **2026-09-01**, the RTO down payment on **standard containers** is **$99**, replacing the
  previous 10% down.
- **$99 is available to any location.** The condition is distance from the **depot the container
  ships from**, not from Cincinnati. Over 150 miles from that depot, **20% down** applies.
- Modified and specialty containers stay at 20% down. **This clause applies to nothing Steel Box
  Direct sells**: the catalog is 20ft, 40ft, and 40ft high cube, and three pages already state
  that SBD does not sell modified containers. It is recorded here so the fact is not lost, and so
  an assistant asking about a side-opening container gets the honest answer.
- The program is administered by **My Container Rental**, not by Steel Box Direct.

### The one thing we are NOT publishing

Doug's message says "No application or special approval is needed."

**Owner ruling, 2026-08-28, after speaking with Doug: the official status is the memo, but
everything observable still requires an application, so SBD keeps its existing wording.** Every
"application" and "subject to third-party approval" string on `/rent-to-own/` stays exactly as it
is. We publish what is observably true, not what the memo asserts.

This is load bearing. Do not let a later pass "tidy up" the approval language to match Doug's text.

## 2. TWO CORRECTIONS MADE DURING DESIGN

Recorded because both were wrong for a while and either could be reintroduced.

1. **The 150 miles is from the DEPOT, not from Cincinnati.** An earlier pass assumed Cincinnati,
   computed straight-line distances for all 15 metros, and concluded that 8 of them could not
   offer $99. That analysis is void. There is no per-city distance question, no geo-awareness, and
   no new distance data to build.
2. **The specialty-container exclusion is irrelevant to SBD's catalog.** It reads as a major
   carve-out in Doug's memo and is close to a no-op here.

## 3. ARCHITECTURE

### 3.1 One canonical module: `src/data/rtoTerms.ts`

Follows the documented pattern in `src/data/rentalStance.ts`: **the fact never forks, the wrapper
always differs.** The module owns the facts and the disclosure strings. Each page writes its own
surrounding copy.

Why a module and not page copy, in order of force:

1. **The pricing hard stop.** `$99` is a dollar amount. Hardcoding it on a page is forbidden.
2. **It will change.** It replaced 10% and it is the second revision this year. One edit, not
   twenty.
3. **The disclosure must not drift.** If each page writes its own version of the 150-mile
   condition, they will diverge, and a page that states the offer without its condition is a
   false claim.

The module exports the figures, the effective date, the provider name, and one canonical
disclosure string. It carries a test in the same style as `rentalStance.test.ts`.

### 3.2 The city-page CTA

**Owner-designed. Placement: the empty right column beside the delivered-price block**, which is
dead space today. Identical on all 15 city pages.

Headline, the owner's own words:

> Find out how you can get your shipping container for one easy down payment as low as $99!

Small print:

> Pending third-party approval. $99 applies to standard containers delivered within 150 miles of
> the depot your container ships from; 20% down beyond that. Delivery distance also affects your
> monthly payment.

Links to `/rent-to-own/` and its down-payment section.

Both strings come from `rtoTerms.ts`. The headline and small print render as a unit: **the
component must make it impossible to ship the offer without its condition.** No prop that hides
the small print.

Built in the established technical-plate language per the 2026-07-28 graphics-plates decision.

### 3.3 `/rent-to-own/` becomes the single source of truth

- A new down-payment section, **with an `id` anchor**. The page has no `id` anchors today, so this
  is new.
- States both tiers, the depot condition, the effective date, and the provider.
- All existing application and approval copy untouched, per section 1.

### 3.4 Remaining surfaces

| Surface | Treatment |
|---|---|
| 3 product pages | `$99 down` in the buy box, condition adjacent, never alone |
| `/cost/` | Upfront-cost section gains the RTO alternative |
| Rent-vs-buy calculator | Down-payment input reflects the new figure |
| `/ai-info/` | Fact-sheet lines, including the specialty carve-out |
| 4 use-case pages | One line each, from the module |
| Blog post | The announcement |

### 3.5 The blog post

The story is Doug's own result: the June $99 special roughly **doubled** sales volume, which is why
it is becoming standard. That is a first-party fact from the program administrator and it is the
most interesting thing in the memo.

Attribute the volume claim to My Container Rental. Do not restate it as an SBD statistic, and do
not convert "roughly doubled" into a percentage.

## 4. POLICY AMENDMENT REQUIRED

The city-page pricing hard stop admits a price **only** when it is interpolated from the pricing
module, scoped to a named ZIP, and shown with its effective date and population-centroid basis.

`$99` is a **flat program term** from a different module. It is not ZIP-derived and not
geo-derived, so it satisfies none of those conditions.

The CTA is defensible, but the policy as written does not cover it. Record the amendment at
`UDO Project/.project-catalog/decisions/2026-08-28-rto-program-terms-display.md`, defining a second
class of publishable figure, "flat program term", with its own rules: sourced from `rtoTerms.ts`,
never typed; always rendered with its condition; attributed to My Container Rental; carrying its
effective date. Same pattern as the 2026-08-17 override.

Without this, a future session reads the CTA as a hard-stop violation and reverts it.

## 5. THE EFFECTIVE DATE

Today is 2026-08-31. The change is live 2026-09-01, tomorrow. Copy states the date plainly rather
than implying the term is already active.

## 6. TESTING

- `rtoTerms.test.ts`: shape, the disclosure string present, figures not empty.
- A guard asserting **no hand-typed `$99`** anywhere outside `rtoTerms.ts`, in the style of the
  existing compliance guards.
- A guard asserting the CTA component **cannot render its headline without its small print**.
- The existing dash guard and fabricated-dates guard must stay green.

## 7. EXPLICITLY OUT OF SCOPE

- Any change to application or approval wording.
- Any per-city or geo-aware variant of the CTA.
- Any change to the 2026-08-17 delivered-price policy itself. We add a class beside it, we do not
  alter it.
- Any claim about approval odds, or any restatement of the volume figure as an SBD statistic.
