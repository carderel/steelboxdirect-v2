// Single source for the home page FAQ. `a` (plain text) feeds BOTH the
// FAQPage JSON-LD schema (built in src/pages/index.astro) and the visible
// list rendered by src/components/home/FaqSection.astro. `html` is an
// optional richer visible variant (e.g. with links): same text, plus markup.
//
// The cost answer is DERIVED from the pricing modules rather than written out: see the docstring on
// costAnswer below. No figure and no metro name in this file is typed.
import { cities } from './cities';
import { nationalBasisCentroids } from './geoCentroids';
import { pricing, formatPrice, asOfLabel, nationalBasisScope, type Pricing } from './pricing';
export interface HomeFaqItem {
  q: string;
  a: string;
  html?: string;
}

/**
 * THE COST ANSWER, and why it is derived rather than written.
 *
 * Before this entry the homepage carried three price figures as visible DOM text and nothing in
 * structured form, because none of the six questions below asked about price. The FAQPage node built
 * from this array was the only machine readable question and answer surface on the page, so the one
 * number a reader most often wants was the one number an answer engine could not lift cleanly.
 *
 * The answer states the three figures, the basis they are means of, the seven metros that basis names
 * and the date the figures last changed, in one sentence, so it is quotable standalone with nothing
 * around it. That also closes the scope gap on the homepage: an extractive system that takes this
 * sentence takes the scope with it and cannot present the figures as a nationwide price.
 *
 * Every number and every metro name is derived. Nothing here is typed, so a feed run that moves a
 * figure, or a change to which metros the basis contains, rewrites this sentence with no edit. The
 * hedge sits in the same answer as the figures, because a schema node travels without the page and
 * carries no disclaimer of its own.
 */
const joinList = (parts: string[]): string => (parts.length > 1
  ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`
  : parts.join(''));

/** The metros the basis names, read from the basis list so a membership change rewrites the prose. */
const basisMetroNames = joinList(((): string[] => {
  const nameBySlug = new Map(cities.map((c) => [c.slug, c.city]));
  return nationalBasisCentroids.map((m) => nameBySlug.get(m.slug) ?? m.slug);
})());

/**
 * One phrase per priced SKU, enumerated from the pricing keys the same way the rent vs buy
 * calculator does it, so a fourth priced size cannot silently make this sentence false.
 */
const sizePhrases = (Object.keys(pricing) as (keyof Pricing)[])
  .filter((k): k is Exclude<keyof Pricing, 'asOf'> => k !== 'asOf')
  .map((k) => `${formatPrice(pricing[k].price)} for a ${pricing[k].label}`);

const costAnswer =
  `As of ${asOfLabel}, our average starting prices delivered are ${joinList(sizePhrases)}, `
  + `each one the mean of our ${nationalBasisScope}: ${basisMetroNames}. Those are averages and `
  + 'not quotes, so what you pay can land above or below, depending mostly on how far we deliver '
  + 'and on current market supply, and we give you a real all-in number when you ask for a quote.';

/**
 * The visible twin. Built by substituting into the answer above rather than restated, so the two
 * cannot drift: strip the anchor and this is character for character the string the schema carries.
 */
const costAnswerHtml = costAnswer.replace(
  `our ${nationalBasisScope}`,
  `our <a href="/locations/">${nationalBasisScope}</a>`,
);

export const homeFaqs: HomeFaqItem[] = [
  {
    q: "Won't it rust out on me?",
    a: "Corten steel, painted inside and out. On crushed-stone pads with airflow underneath, 25 years is realistic. We'll show you how to prep the site.",
  },
  {
    q: 'Can you get it back my driveway?',
    a: "Usually yes. Tilt-bed needs ~100 ft of approach and firm ground. For tight or soft sites, crane-set works with no lane damage. We'll scout before we schedule.",
  },
  {
    q: 'Do I need a permit?',
    a: "It depends on your county and how you'll use the container, and rules vary widely. Confirming permit and zoning requirements with your local authority before you buy is the buyer's responsibility; we don't determine or guarantee them.",
  },
  {
    q: 'Is used actually safe for my equipment?',
    a: "Every container we sell is Wind & Water Tight (used): structurally sound and weather-tight, with surface rust that's purely cosmetic. It keeps rain, wind, and snow off your equipment and holds up for decades on a prepped pad.",
  },
  {
    q: 'How quickly can you get it here?',
    a: "Almost all deliveries take about two weeks. Depot inventory is stacked and sequenced (units aren't staged for quick pull) and drivers book out several weeks in advance, so exact timing depends on current availability. We'll give you an honest window before you commit, and you'll hear from us at every step until it's on your property.",
  },
  {
    q: 'How do I pay? Do you offer financing?',
    a: "Two ways. Buy outright, paid in full up front, with Afterpay available for buyers who qualify so you can pay in installments while we schedule your unit right away. Or rent to own over 12, 24, 36, or 48 months through the Freedom Conex program: no traditional credit check, subject to third-party approval, and the container is yours at the end of the term.",
    html: 'Two ways. Buy outright, paid in full up front, with Afterpay available for buyers who qualify so you can pay in installments while we schedule your unit right away. Or <a href="/rent-to-own/">rent to own</a> over 12, 24, 36, or 48 months through the Freedom Conex program: no traditional credit check, subject to third-party approval, and the container is yours at the end of the term.',
  },
  // Last in the array on purpose. The home QuickFacts card renders the first three questions only
  // (buildPageSchema case home), and its price disclaimer is switched off for that page, so a priced
  // answer promoted into the top three would put a figure in a card built to hold none.
  {
    q: 'How much does a shipping container cost?',
    a: costAnswer,
    html: costAnswerHtml,
  },
];
