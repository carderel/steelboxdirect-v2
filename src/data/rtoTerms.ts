// src/data/rtoTerms.ts
// The single canonical statement of My Container Rental's rent-to-own down payment terms.
//
// WHY THIS IS A MODULE AND NOT PAGE COPY, in order of force.
//   1. $99 is a dollar amount, and hand-typing a dollar amount is a hard stop on this project.
//      A figure typed into a page has no provenance, so nothing can prove where it came from or
//      whether it is still true. Sourcing it here is what makes it publishable at all.
//   2. It will change. It replaces a 10% down requirement on 2026-09-01, and that is the second
//      revision this year, after June's temporary $99 special. Assume a third. One edit here
//      beats an edit on every page that quotes it, and beats the page this pass would miss.
//   3. The disclosure must not drift. If each page writes its own version of the distance
//      condition, the versions diverge, and a page stating the offer without its condition is a
//      false claim, not a shorter one. That is why consumers take the composed strings below
//      rather than assembling their own sentence out of the parts.
//
// Same rule as rentalStance.ts: the FACT never forks, the WRAPPER always differs. This module
// owns the figures and the one condition sentence. A page brings its own framing around them.
//
// TWO THINGS THAT ARE EASY TO GET WRONG AND WERE GOT WRONG ONCE.
//
//   1. The 150 miles is measured from the DEPOT the container ships from, NOT from Cincinnati.
//      Containers ship nationwide out of depot hubs, so a buyer far from Ohio is not thereby
//      outside the $99 tier. An earlier pass measured straight-line distance from Cincinnati for
//      all 15 metros and concluded that 8 of them could not be offered $99. That was wrong, and
//      it would have withheld the standard offer from most of the footprint. Never reintroduce a
//      Cincinnati-relative or otherwise per-city distance claim.
//
//   2. Doug's 2026-08-28 announcement says no application or special approval is needed. The
//      owner checked, found that everything observable still requires an application, and ruled
//      that the site keeps its existing wording. This module therefore says nothing whatsoever
//      about applications, and nothing in it licenses stripping the approval copy out of
//      /rent-to-own/. The small print below keeps the third-party approval qualifier.

export const RTO_TERMS = {
  /** Standard-container down payment inside the distance limit. */
  downPayment: '$99',
  /** Down payment beyond the distance limit, and on modified or specialty units. */
  remoteDownPayment: '20%',
  /** Miles from the shipping depot, not from Cincinnati. See note 1 above. */
  distanceLimitMiles: '150',
  /** ISO date the terms take effect. Render it via rtoEffectiveDateLabel(). */
  effectiveDate: '2026-09-01',
  /** The independent third party that administers the program. Not Steel Box Direct. */
  provider: 'My Container Rental',
} as const;

/**
 * The canonical condition. Any surface stating the down payment states this with it.
 * Both tiers appear here deliberately: a reader who cannot get $99 learns what they can get,
 * instead of reading an offer, failing to qualify for it, and leaving with nothing.
 */
export const RTO_DOWN_CONDITION =
  `${RTO_TERMS.downPayment} applies to standard containers delivered within `
  + `${RTO_TERMS.distanceLimitMiles} miles of the depot your container ships from; `
  + `${RTO_TERMS.remoteDownPayment} down beyond that.`;

/** Owner-approved CTA headline, 2026-08-28. His words. Do not rewrite without asking him. */
export const RTO_CTA_HEADLINE =
  'Find out how you can get your shipping container for one easy down payment as low as '
  + `${RTO_TERMS.downPayment}!`;

/**
 * Owner-approved CTA small print, with the depot correction folded in.
 * The approval qualifier leads, per the owner ruling in note 2 above. It is not decoration and
 * it does not come out.
 */
export const RTO_CTA_SMALLPRINT =
  `Pending third-party approval. ${RTO_DOWN_CONDITION} `
  + 'Delivery distance also affects your monthly payment.';

/**
 * Human-readable effective date, e.g. "September 1, 2026".
 *
 * The trailing Z makes the string parse as UTC, which is the zone it is then formatted in. Parse
 * it as local time and format it as UTC and the two disagree: east of Greenwich, local midnight on
 * the 1st is 22:00 UTC on the 31st, and the label reads "August 31, 2026". An effective date that
 * renders a day early is a claim the program is live before it is.
 */
export function rtoEffectiveDateLabel(): string {
  return new Date(`${RTO_TERMS.effectiveDate}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
