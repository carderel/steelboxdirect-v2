/**
 * THE HOMEPAGE "BEFORE YOU BUY" READS, curated rather than latest.
 *
 * Spec: UDO Project/.outputs/strategy/2026-10-23-internal-linking-review.md, section 2. A "latest
 * posts" strip would rotate the homepage's link set almost weekly and would surface date-bound or
 * out-of-region posts, so these three are picked by hand. Swap a slot when a post proves itself in
 * GSC; it is a one-line edit.
 *
 * WHY THE BLURB IS WRITTEN HERE AND NOT TAKEN FROM THE POST DESCRIPTION. A post description is
 * free to carry a figure (one of these does, a hand-typed price), and the homepage may only show
 * prices interpolated from src/data/pricing.ts. homeReads.test.ts fails on any digit, any "$", or
 * the word "dollar" in a blurb, and on any slug that is missing or still a draft.
 */
export interface HomeRead {
  /** Blog collection slug, i.e. the file name under src/content/blog/ without .md. */
  slug: string;
  /** One line, no figures. Restates only what the post itself says. */
  blurb: string;
}

export const homeReads: HomeRead[] = [
  {
    slug: '20ft-vs-40ft-shipping-container',
    blurb:
      'Why the bigger box usually gives you more for your money, and the short list of jobs where the smaller one is still the right call.',
  },
  {
    slug: 'the-cheap-container-that-wasnt',
    blurb:
      'A low sticker price can leave out delivery. The one question that tells you whether a price is real.',
  },
  {
    slug: '12-things-never-store-in-a-shipping-container',
    blurb:
      'A sealed steel box keeps out rain, not heat, cold, or moisture swings. What not to store inside, and the easy fixes.',
  },
];
