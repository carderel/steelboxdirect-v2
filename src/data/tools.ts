// src/data/tools.ts
// The interactive tools listed on /shipping-container-guides/, in strip order.
//
// WHY THIS IS NOT guides.ts. A calculator is not a guide, and the difference is load bearing in
// three separate places. guides.ts exports guideTitleCountWord, derived from guides.length, and the
// hub interpolates it into its metaDescription and twice into visible prose, so a ninth entry there
// would silently rewrite the live meta description of a page that is not about any tool, flipping
// Eight to Nine. guideListItems feeds the hub CollectionPage ItemList, which llms.txt describes as
// eight buying guides, so a tool inside it misdescribes the collection. And guides.test.ts asserts
// eight entries with fixed group sizes, which would have to be weakened to admit a non-member.
// Separate list, separate strip, no shared count.
//
// This list also closes an existing gap: /size/calculator/ has been in the footer and the Tools nav
// dropdown all along, but appeared nowhere on the guides hub.
//
// RULES FOR EDITING:
//   1. Do not add an entry before its page exists. tools.test.ts asserts every url resolves to a
//      real file under src/pages, because a strip card pointing at a 404 is worse than a shorter
//      strip.
//   2. `code` matches the code the nav dropdown shows for the same tool, so one code identifies a
//      tool everywhere it appears. Two to four uppercase letters, the shape every other .dc code in
//      the nav already uses.
//   3. Nothing here is exported into a schema graph. The strip is navigation, not a collection.
//   4. Resolved 2026-08-19 (T-146): the hs003 guard now strips comments before pairing string
//      literals, so the old rule against apostrophes in comments no longer applies.

export interface Tool {
  id: string;
  /** Short code shown on the strip card and in the nav dropdown. Matches the SiteNav .dc value. */
  code: string;
  /** What the tool is called. Also the label on the strip card. */
  kind: string;
  url: string;
  /** The question the tool answers, so the strip can follow the hub start-with-your-question
   * idiom without pretending to be a guide card. */
  question: string;
  /** One or two sentences on what the tool actually does with what you give it. */
  blurb: string;
}

export const tools: Tool[] = [
  {
    id: 'size-calculator',
    code: 'CAL',
    kind: 'Size Calculator',
    url: '/size/calculator/',
    question: 'Which size do I actually need?',
    blurb:
      'Takes what you plan to store, in pallets or vehicles or rooms of furniture, and works out '
      + 'which of the three common lengths holds it with room to walk. Sizing by what fits beats '
      + 'sizing by what sounded right.',
  },
  {
    id: 'rent-vs-buy-calculator',
    code: 'RVB',
    kind: 'Rent vs Buy Calculator',
    url: '/container-rent-vs-buy-calculator/',
    question: 'How long before buying costs less than renting?',
    blurb:
      'Puts a monthly rental rate plus its delivery and pickup on one side, a container bought and '
      + 'delivered on the other, and finds the month where the two totals cross. Enter your own '
      + 'numbers; nothing is filled in for you.',
  },
  {
    id: 'iso-6346-check-digit-calculator',
    code: 'CHK',
    kind: 'Check Digit Calculator',
    url: '/iso-6346-check-digit-calculator/',
    question: 'Does this container number check out?',
    blurb:
      'Takes the 11-character number stencilled on a container and says whether the boxed check '
      + 'digit agrees with the other ten, or works the digit out if you only have the first ten. '
      + 'Shows every row of the arithmetic, and is straight about how little a match proves.',
  },
];

export const toolCount = tools.length;
