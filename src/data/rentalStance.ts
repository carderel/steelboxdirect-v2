// src/data/rentalStance.ts
// The single canonical statement of what Steel Box Direct does and does not do about renting.
//
// WHY THIS IS A MODULE AND NOT A COPY-PASTE. Three schema-bound pages need this fact:
// /shipping-containers-for-sale/, /rent-to-own/, and /container-rental-guide/. All three feed
// their `faqs` array into buildPageSchema(), which emits FAQPage JSON-LD, and the first three
// answers also render visibly in QuickFacts. If the same answer string landed on all three,
// three URLs would emit an identical Question/Answer pair, which suppresses FAQ rich results
// and reads as boilerplate to a human.
//
// THE RULE: the FACT never forks, the WRAPPER always differs. This module owns one fact clause.
// Each page writes its own question, matched to that page's search intent, and its own context
// sentences, and composes the two. Do not add page-specific wording to this file.

export const RENTAL_STANCE_FACT =
  'Steel Box Direct does not rent shipping containers. We sell them, and we offer rent-to-own, '
  + 'where a fixed term of payments ends with you owning the container.';

export const RENTAL_STANCE_FACT_HTML =
  'Steel Box Direct does not rent shipping containers. We sell them, and we offer '
  + '<a href="/rent-to-own/">rent-to-own</a>, where a fixed term of payments ends with you '
  + 'owning the container.';

export interface RentalStanceInput {
  /** Per-page context sentences, appended after the canonical fact. Plain text. */
  context: string;
  /** Optional richer twin of `context` for the visible `html:` branch. Defaults to `context`. */
  contextHtml?: string;
  /**
   * Anchor the words "rent-to-own" inside the fact clause to /rent-to-own/.
   * Pass false on /rent-to-own/ itself so the page does not link to itself.
   */
  linkRentToOwn?: boolean;
}

export interface RentalStanceAnswer {
  /** Plain text. This is what reaches FAQPage JSON-LD and the QuickFacts card. */
  a: string;
  /** Visible-only richer twin. Requires an `html:` render branch on the consuming page. */
  html: string;
}

export function composeRentalStance(input: RentalStanceInput): RentalStanceAnswer {
  const linkRentToOwn = input.linkRentToOwn ?? true;
  const fact = linkRentToOwn ? RENTAL_STANCE_FACT_HTML : RENTAL_STANCE_FACT;
  return {
    a: `${RENTAL_STANCE_FACT} ${input.context}`,
    html: `${fact} ${input.contextHtml ?? input.context}`,
  };
}
