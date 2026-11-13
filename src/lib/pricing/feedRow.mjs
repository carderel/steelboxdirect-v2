/**
 * src/lib/pricing/feedRow.mjs
 *
 * The pure half of the supplier price feed contract, shared by two readers:
 *   1. scripts/harvest-geo-pricing.mjs, the daily per metro harvest, which imports and re exports
 *      everything below unchanged, so its behavior and its test suite are exactly what they were.
 *   2. src/lib/pricing/zipPrice.ts, the live per ZIP lookup behind /price/.
 *
 * Moved here from the harvest on 2026-10-31 so the two cannot disagree about which field is summed,
 * how a figure is rounded, or what the bounds are. Nothing in this file imports node built ins,
 * because the Cloudflare worker bundle that serves /price/ refuses node:fs.
 *
 * THE ONE ARITHMETIC RULE. Every delivered figure is the DELIVERY unit price plus the base delivery
 * cost, rounded once at the very end and never in parts. The feed also returns a lower field that
 * reads like a unit price and is not one: it holds the smaller of the pickup and the delivery unit
 * prices. Measured at centroid 45404 on 2026-08-17 that field returned 1440.60 against a delivery
 * unit price of 1492.05, an understatement of 51.45 per container that passes every bound. It is
 * named below for provenance only and is never added to anything. feedRow.test.ts asserts this file
 * never places that field beside a plus sign.
 *
 * NO APOSTROPHES AND NO QUOTE CHARACTERS IN COMMENTS, and neither an em dash nor an en dash anywhere,
 * for the same reasons the harvest header gives.
 */

/** The public per ZIP pricing endpoint. */
export const ENDPOINT = 'https://www.freedomconex.com/api/pricing';

/** The only grade this site sells and the literal string the feed returns for it. */
export const GRADE = 'WWT';

/** The SKU keys of src/data/pricing.ts minus its date key, in render order. */
export const SKU_KEYS = ['20ftCargo', '40ftStandard', '40ftStandardHC'];

/** SKU key to the feed size identifier. The feed keys rows by grade and size, so both are needed. */
export const SIZE_ID_BY_SKU = {
  '20ftCargo': '20-std',
  '40ftStandard': '40-std',
  '40ftStandardHC': '40-hc',
};

/** The feed field that is summed. One value, named once, so a later reader cannot swap it by accident. */
export const UNIT_PRICE_BASIS = 'deliveryUnitPrice';

/**
 * The lower field that reads like a unit price and holds the smaller of the pickup and the delivery
 * unit prices. Named so it can be read for provenance and so that reading it is searchable. It is
 * never summed into a figure and never serialised.
 */
export const MIN_OF_TWO_FIELD = 'fromPrice';

/**
 * Absolute bounds on a DELIVERED figure, inclusive. From the Feed Sanity section of the spec. The
 * floor catches a unit only response or a zeroed delivery; the ceiling catches a decimal shift, which
 * on a real figure would land above 20000.
 */
export const FIGURE_MIN = 1200;
export const FIGURE_MAX = 6000;

/**
 * Floor on a PICKUP figure, which is a different quantity and needs a different floor. The delivered
 * floor bounds a total, unit plus delivery. A pickup figure is the bare unit price with no delivery in
 * it, so the delivered floor is too high for it by roughly the cost of a delivery, and it rejected a
 * real one: on 2026-08-18 the live feed returned a savannah 20ft pickup unit price of 1183.35, which
 * rounds to 1180, and the shared floor of 1200 withheld it.
 *
 * Derived from the same live run rather than picked. Subtracting the smallest base delivery cost in
 * the fifteen metro set, 250 at charleston, from the delivered floor of 1200 gives 950 as the
 * equivalent bound on a bare unit price. 900 is the nearest whole hundred below that, and it still
 * catches a cents read (11.83), a decimal shift (118.34) and a zeroed field. The ceiling is shared.
 */
export const PICKUP_MIN = 900;

/* ------------------------------------------------------- text hygiene patterns */

/** HS-OUT-001. Both code points as escapes, so this file cannot contain what it forbids. */
export const DASHES = /[\u2014\u2013]/;
/** One pattern that no mistyped escape can defeat: it forbids both dashes and all other non ASCII. */
export const PRINTABLE_ASCII = /^[\x20-\x7E\n]*$/;
export const SUPPLIER = /freedom\s*conex/i;
export const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/* --------------------------------------------------------------- pure helpers */

export function isFiniteNumber(v) {
  return typeof v === 'number' && Number.isFinite(v);
}

/** Rounds to the nearest ten dollars. Identical by construction to the guard in geoPricing.test.ts. */
export function roundToTen(n) {
  return Math.round(n / 10) * 10;
}

/**
 * The published figure: the DELIVERY unit price plus the base delivery cost, rounded once. Reads two
 * fields and no others. Throws rather than coercing, because a silent NaN here becomes a published
 * number.
 */
export function deliveredPrice(row) {
  const unit = row?.[UNIT_PRICE_BASIS];
  const delivery = row?.baseDeliveryCost;
  if (!isFiniteNumber(unit) || !isFiniteNumber(delivery)) {
    throw new TypeError('deliveredPrice needs a finite delivery unit price and a finite delivery cost');
  }
  return roundToTen(unit + delivery);
}

/** The pickup figure, rounded, or null when the feed reported no usable pickup unit price. */
export function pickupFigure(row) {
  const unit = row?.pickupUnitPrice;
  if (!isFiniteNumber(unit) || unit <= 0) return null;
  return roundToTen(unit);
}

/** Keeps only the rows the site sells. A payload of nothing but the out of scope grade yields none. */
export function selectWwt(payload) {
  const byKey = payload?.byKey;
  if (!byKey || typeof byKey !== 'object') return [];
  return Object.values(byKey).filter((row) => row && row.grade === GRADE);
}

/** The single WWT row for one feed size identifier, or null when the feed returned none. */
export function rowForSize(rows, sizeId) {
  const matches = rows.filter((row) => row.sizeId === sizeId);
  return matches.length === 1 ? matches[0] : null;
}

export function withinBounds(v) {
  return isFiniteNumber(v) && v >= FIGURE_MIN && v <= FIGURE_MAX;
}

/** Bounds on a pickup figure. Same ceiling, lower floor, because it carries no delivery. See PICKUP_MIN. */
export function pickupWithinBounds(v) {
  return isFiniteNumber(v) && v >= PICKUP_MIN && v <= FIGURE_MAX;
}

/**
 * The sanity check on a delivered or a pickup figure, shared by the daily harvest and the live lookup
 * behind /price/ so the two cannot disagree. Owner decision 2026-11-13, option A: the feed is trusted.
 * The supplier ships from every yard, and a metro priced well above its neighbours is a box that has
 * to come from a farther yard, which is a real price. So a figure is blocked only when it is not a
 * finite number, is not above zero, or is more than SANITY_FACTOR times or less than one SANITY_FACTOR
 * of the median committed figure for the same size across every committed metro. The site sells one
 * grade, so the size is the whole of size and condition. This replaced the twenty percent move ceiling
 * and the nearest metro guard, both of which withheld real prices.
 */
export const SANITY_FACTOR = 3;

/** The median of the finite figures above zero, or null when there are none. */
export function median(values) {
  const v = (Array.isArray(values) ? values : [])
    .filter((x) => isFiniteNumber(x) && x > 0)
    .sort((a, b) => a - b);
  if (v.length === 0) return null;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 === 1 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}

/**
 * The median committed figure per size across every metro in a geoPricing map, available sizes only.
 * The field is delivered by default, or pickup. A size with no usable figure maps to null.
 */
export function committedMedians(geoPricing, field = 'delivered') {
  const metros = geoPricing && typeof geoPricing === 'object' ? Object.values(geoPricing) : [];
  const out = {};
  for (const sku of SKU_KEYS) {
    const values = [];
    for (const metro of metros) {
      const entry = metro?.skus?.[sku];
      if (entry && entry.available === true) values.push(entry[field]);
    }
    out[sku] = median(values);
  }
  return out;
}

/**
 * Whether a figure is sane. Not finite or not above zero always fails. With no usable median there is
 * nothing to compare against, so only that comparison is skipped. Inclusive at both edges.
 */
export function passesSanity(value, reference) {
  if (!isFiniteNumber(value) || value <= 0) return false;
  if (!isFiniteNumber(reference) || reference <= 0) return true;
  return value <= reference * SANITY_FACTOR && value * SANITY_FACTOR >= reference;
}
