// src/data/pricing.ts
// Single source of truth for container pricing displayed across the site.
// Consumed by: /for/homeowners/ (5-yr rent-vs-own), /for/businesses/ (cost-per-sq-ft),
// the homepage price section (home/PriceSection.astro), the product hub
// (/shipping-containers-for-sale/), the product spec pages ([slug].astro), the rent-vs-buy
// calculator (/container-rent-vs-buy-calculator/) and the schema builder (lib/schema).
// Prices are AVERAGE starting prices, not quotes — always render with the disclaimer.
// See decision 2026-06-04-cost-comparison-content-and-dollar-exception.md.
//
// WHERE THE MONEY COMES FROM. The three figures and the date below are no longer typed here. They
// are derived at build time from src/data/geoPricing.ts, the generated per metro feed. The split is
// deliberate: the feed supplies money and dates, and this module supplies identity and geometry,
// meaning the label and the square footage, which no feed has any business touching.
//
// WHY THE SHAPE IS FROZEN, and it is load bearing. Two consumers enumerate every own key of the
// pricing object and exclude exactly one of them by name, asOf: the rent-vs-buy calculator at
// src/pages/container-rent-vs-buy-calculator/index.astro and its guard at
// src/lib/compliance/rent-vs-buy-guard.test.ts. Both are agnostic to a new SKU key, which is what
// they were built for. Neither is agnostic to a new METADATA key: a sibling of asOf lands in the
// calculator list of price keys, makes the price lookup undefined, and takes out that page build and
// its guard together. src/data/geoPricing.ts also derives its SKU key type from this interface, so a
// fourth key here is a compile error there. Add nothing to Pricing. Everything the feed carries
// beyond a price belongs in geoPricing.ts and is read through the helpers below.
//
// WHERE THE BASIS METADATA LIVES, given the paragraph above. nationalBasisScope and
// nationalPriceLabel are MODULE level exports and are deliberately not keys of the pricing object,
// for exactly the reason just stated: a sibling of asOf lands in the calculator list of price keys
// and takes that page and its guard down together. Object.keys(pricing) is unchanged by them, and
// pricing.test.ts asserts that key set exactly. Anything else the basis ever needs to say goes here,
// beside them, and never inside Pricing.

import { geoPricing, geoSkuKeys, type GeoMetroPricing, type GeoSkuKey } from './geoPricing';
import { nationalBasisCentroids } from './geoCentroids';
import { countWord } from './numberWords';

export interface ContainerPrice {
  /** Display label for the size/grade. */
  label: string;
  /** Average starting price in USD (whole dollars). See NATIONAL BASIS for what it averages. */
  price: number;
  /** Usable floor area in square feet. */
  sqft: number;
}

export interface Pricing {
  /**
   * ISO date the national figures last CHANGED. Not the date they were last checked: a rendered
   * check date needs a deploy every day to stay true, so the verification date is operational only,
   * lives in geoPricing.ts as lastVerified, and no rendered surface reads it. Drives the as of
   * {month year} microcopy through asOfLabel, and the day precision copy through
   * effectiveSinceLabel.
   */
  asOf: string;
  '20ftCargo': ContainerPrice;
  '40ftStandard': ContainerPrice;
  '40ftStandardHC': ContainerPrice;
}

/**
 * BASELINE. The national figures this module carried before the feed existed, owner confirmed on the
 * date below. Used only while the feed has priced no publishing metro, which is a legitimate state
 * and means no metro is priced yet rather than a price of zero. Keeping the last reviewed figures as
 * the floor is what lets an empty feed build and render honestly instead of rendering nothing. Every
 * number here goes cold on the first committing harvest run and is then only the fallback under a
 * feed that has never run.
 */
const BASELINE_PRICE: Record<GeoSkuKey, number> = {
  '20ftCargo': 2010,
  '40ftStandard': 2710,
  // NOTE: owner-confirmed accurate 2026-07-09 (HC below Standard is real, supply-driven), and the
  // live feed corroborated the same ordering independently in 2026-08 across several metros.
  '40ftStandardHC': 2470,
};

/** The date the baseline figures were confirmed. Serves as asOf only while the feed is empty. */
const BASELINE_AS_OF = '2026-07-09';

/** Whole tens. Cents imply a precision a sum of two feed fields does not have. */
const roundToTen = (n: number): number => Math.round(n / 10) * 10;

/**
 * The metro records that feed a national figure: every metro in the national basis set that the feed
 * has actually priced. Membership is a human decision recorded per metro in src/data/geoCentroids.ts
 * and read here through one export, so this module never needs to know what a region is and never
 * imports src/data/cities.ts. That export is already the intersection of the basis flag and the
 * publish flag, so using the per metro kill switch still moves the national figure in the same
 * direction as it moves that city page.
 */
function contributingMetros(): GeoMetroPricing[] {
  return nationalBasisCentroids
    .map((metro) => geoPricing[metro.slug])
    .filter((record): record is GeoMetroPricing => Boolean(record));
}

/**
 * NATIONAL BASIS, stated once and changed in one place. The site wide figure for a SKU is the MEAN
 * of the delivered figures across the NATIONAL BASIS metros the feed has priced that report the SKU
 * as available, rounded to the nearest ten. The basis set is the seven home region metros, ruled
 * 2026-08-18, and its membership is recorded per metro in src/data/geoCentroids.ts.
 *
 * A mean rather than one reference metro, because the word average is rendered beside this number on
 * the homepage, the product hub and three product pages, and one market presented as an average is
 * not an average. Delivered rather than a bare unit price, because delivered is what the feed
 * publishes and what a buyer pays. Availability filters the mean because a metro that cannot supply
 * a size is not evidence of what that size costs. No contributor at all falls back to the baseline.
 *
 * WHY THE BASIS IS NARROWER THAN THE PUBLISH SET, and why this is not a reversal of anything. The
 * basis was every publishing metro, which meant all fifteen. It is now the seven home region ones,
 * which reads at a glance like the home and depot split that the publish ruling of the same date
 * retired. It is not that split, because it answers a different question. The publish ruling asked
 * whether a depot metro can stand behind the same all in delivered promise on its own city page: the
 * live feed probe found a local yard in every one of them, so the answer was yes and all fifteen
 * still publish, unchanged. This asks what a site wide average should MEAN. The five surfaces that
 * render it scope themselves to the home region in their own titles, descriptions and delivery copy
 * and name no out of region metro anywhere, so a mean over all fifteen produced a figure whose true
 * basis no clause on those pages could state, and it sat below every home market on the 20ft. The
 * label beside the figure now names the basis, which is only possible while the basis is nameable.
 * Nothing here reopens the publish question. Do not undo this by pointing at the publish ruling.
 *
 * WHAT IT COSTS. The contributing sample went from forty five figures to twenty one, so each metro
 * carries roughly double the leverage it did. A move of one hundred in one metro now moves the site
 * wide figure by about fourteen where it used to move it by about seven, and with the rounding above
 * the rendered figure will visibly change more often. That is the accepted price of a nameable basis.
 *
 * Changing the basis is the membership flags in src/data/geoCentroids.ts, this function and their
 * tests, and nothing else. The two rejected candidates, one reference metro and a mean over every
 * harvested metro whether it publishes or not, are recorded under Open Question O2 in
 * docs/superpowers/specs/2026-08-17-geo-pricing-feed-design.md.
 */
export function nationalPrice(sku: GeoSkuKey): number {
  const figures = contributingMetros()
    .map((record) => record.skus[sku])
    .filter((figure) => figure.available)
    .map((figure) => figure.delivered);
  if (figures.length === 0) return BASELINE_PRICE[sku];
  return roundToTen(figures.reduce((sum, value) => sum + value, 0) / figures.length);
}

/**
 * The date the national figures last changed: the latest effectiveSince among the metro figures that
 * actually feed them. It advances only when a contributing figure moves, which is the point of the
 * daily diff, and it is never a verification date. Baseline date while the feed is empty.
 */
export function nationalEffectiveSince(): string {
  const dates = contributingMetros().flatMap((record) =>
    geoSkuKeys
      .filter((sku) => record.skus[sku].available)
      .map((sku) => record.skus[sku].effectiveSince),
  );
  if (dates.length === 0) return BASELINE_AS_OF;
  return dates.reduce((latest, date) => (date.localeCompare(latest) > 0 ? date : latest));
}

export const pricing: Pricing = {
  asOf: nationalEffectiveSince(),
  '20ftCargo': { label: '20ft Cargo', price: nationalPrice('20ftCargo'), sqft: 160 },
  '40ftStandard': { label: '40ft Standard', price: nationalPrice('40ftStandard'), sqft: 320 },
  '40ftStandardHC': { label: '40ft Standard HC', price: nationalPrice('40ftStandardHC'), sqft: 320 },
};

/** Map product-page slugs → the matching price record (single source of truth). */
export const priceBySlug: Record<string, ContainerPrice> = {
  '20-foot-shipping-container': pricing['20ftCargo'],
  '40-foot-shipping-container': pricing['40ftStandard'],
  '40-foot-high-cube-container': pricing['40ftStandardHC'],
};

/** Format a whole-dollar price for display, e.g. 2010 → "$2,010". */
export function formatPrice(price: number): string {
  return '$' + price.toLocaleString('en-US');
}

/**
 * The basis of the national figure in words, counted rather than typed, e.g. seven home metros.
 */
export const nationalBasisScope = `${countWord(nationalBasisCentroids.length)} home metros`;

/**
 * THE LABEL that renders beside every national figure, and it is one constant on purpose.
 *
 * It used to read Avg. starting price on all four surfaces, which stated that the number was an
 * average and stated nothing about what it averaged. That is the specific defect this constant fixes.
 * An extractive system quotes a number together with the nearest text that carries a scope, so a
 * figure whose own label carries none gets quoted under whatever scope the retriever finds next,
 * which on these pages is a nationwide delivery capability. The label now carries its basis inside
 * the same string as the number, so the figure cannot be lifted away from what it is a mean of.
 *
 * One constant rather than four literals, because the four surfaces are a homepage component, a hub,
 * a product template body and a QuickFacts cell, and a basis change that updated three of them would
 * ship a page contradicting its siblings with nothing failing. The count comes from the basis list,
 * so moving a metro into or out of the basis rewrites this sentence without anybody editing copy.
 *
 * KEEP IT SHORT. All four render slots are uppercased mono at ten to thirteen pixels under a large
 * figure, three of them inside a one third width card, so this fits on one line at desktop width and
 * has no room to grow into a sentence. The full basis, with the seven metros named and the effective
 * date attached, belongs in the homepage cost FAQ in src/data/homeFaq.ts, which is the machine
 * readable surface, not in this label.
 */
export const nationalPriceLabel = `Avg. starting price, ${nationalBasisScope}`;

/** Human-readable "as of" label derived from asOf, e.g. "July 2026". */
export const asOfLabel = new Date(pricing.asOf + 'T00:00:00').toLocaleDateString('en-US', {
  month: 'long',
  year: 'numeric',
});

/**
 * Day precision label for the date a figure came into effect, for the city page copy contract: in
 * effect since August 12.
 *
 * A function of the date being shown rather than a constant, because a city page states the date of
 * ITS metro figure and the national date is a different date. The year is appended only when the
 * date falls outside the current year, so a figure that has held since last summer cannot be read as
 * this summer, while the common case stays the two word form the copy contract asks for.
 */
export function effectiveSinceLabel(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  const currentYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString(
    'en-US',
    currentYear
      ? { month: 'long', day: 'numeric' }
      : { month: 'long', day: 'numeric', year: 'numeric' },
  );
}

/**
 * Future ISO date (YYYY-MM-DD) for the Product priceValidUntil field: one year from the BUILD date.
 *
 * It used to derive from pricing.asOf plus a year, and the comment here claimed that was self
 * maintaining, on the reasoning that every price refresh bumped asOf and pushed the expiry forward
 * with it. The feed retires that reasoning. asOf is now a CHANGE date, so it advances only when a
 * figure actually moves, and a figure that holds for thirteen months would drag priceValidUntil into
 * the past and publish an expired price on three product pages, silently, with nothing failing.
 * Anchored to the build date it cannot go stale in the past, it is independent of how often prices
 * move, and it says the only thing it should say to a crawler, which is recheck within a year.
 * buildPageSchema.test.ts asserts the value is in the future, which is the property that matters and
 * the one a frozen date fails.
 */
export const priceValidUntil = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
})();

/** Monthly cost when a purchase is amortized over 5 years (60 months), rounded to whole dollars. */
export function monthlyOver5yr(price: number): number {
  return Math.round(price / 60);
}

/** Raw one-time cost per square foot. Format in-template (e.g. round to nearest $0.50 for display). */
export function perSqFt(price: number, sqft: number): number {
  return price / sqft;
}

/** Round a per-sq-ft figure to the nearest $0.50 for display. */
export function roundToHalf(value: number): number {
  return Math.round(value * 2) / 2;
}
