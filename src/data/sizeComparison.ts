// src/data/sizeComparison.ts
// Size-versus-price comparisons, COMPUTED from src/data/pricing.ts (money) and src/data/containers.ts
// (geometry). Nothing here is typed.
//
// WHY THIS EXISTS. The facts audit of 2026-10-08 found two hand-typed comparison sentences, each
// wrong: /size/ said a 40ft costs "30% less per cubic foot than two 20-ft units" (about 44% at the
// time), and /cost/ said a 40ft is "~40-60% more cost" than a 20ft (about 15%). The national figures
// move with the daily feed, so any typed percentage is wrong the first time a price changes. A page
// that wants one of these comparisons calls a helper, and the sentence moves with the feed.
//
// WHERE A RENDERED PERCENTAGE IS ALLOWED. These are price-derived figures, so the pricing policy in
// CLAUDE.md applies: only on the page types allowed to show prices, always beside the "average
// starting price, your quote may be more or less" disclaimer and the as-of date. A page outside that
// policy can still use the helpers to decide WHETHER a qualitative sentence is true before it
// renders it, without printing the number.
//
// "Per cubic foot versus two 20ft units" is the same figure as "per cubic foot versus one 20ft",
// because two 20s cost twice as much and hold twice as much. The helpers compare per unit of space.

import type { GeoSkuKey } from './geoPricing';
import { pricing, skuSlug } from './pricing';
import { containerBySlug, cubicFeet } from './containers';

/** Interior cubic feet for a SKU, from containers.ts. */
export function skuCubicFeet(sku: GeoSkuKey): number {
  return cubicFeet(containerBySlug(skuSlug[sku]));
}

/** National average starting price per cubic foot, unrounded. */
export function pricePerCuFt(sku: GeoSkuKey): number {
  return pricing[sku].price / skuCubicFeet(sku);
}

/** National average starting price per square foot of INTERIOR floor, unrounded. */
export function pricePerSqFt(sku: GeoSkuKey): number {
  return pricing[sku].price / pricing[sku].sqft;
}

/** Percentage change from b to a, rounded to a whole number. Positive means a is higher. */
function pctChange(a: number, b: number): number {
  return Math.round(((a - b) / b) * 100);
}

/** How much more a costs than b in total, as a whole percentage. Negative if a costs less. */
export function pctMorePrice(a: GeoSkuKey, b: GeoSkuKey): number {
  return pctChange(pricing[a].price, pricing[b].price);
}

/** How much less a costs per cubic foot than b, as a whole percentage. Negative if a costs more. */
export function pctCheaperPerCuFt(a: GeoSkuKey, b: GeoSkuKey): number {
  return -pctChange(pricePerCuFt(a), pricePerCuFt(b));
}

/** How much less a costs per interior square foot than b, as a whole percentage. */
export function pctCheaperPerSqFt(a: GeoSkuKey, b: GeoSkuKey): number {
  return -pctChange(pricePerSqFt(a), pricePerSqFt(b));
}

/** Interior floor of a over b, unrounded. About 2 for a 40ft over a 20ft. */
export function floorRatio(a: GeoSkuKey, b: GeoSkuKey): number {
  return pricing[a].sqft / pricing[b].sqft;
}
