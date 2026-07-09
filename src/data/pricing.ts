// src/data/pricing.ts
// Single source of truth for container pricing displayed across the site.
// Consumed by: /for/homeowners/ (5-yr rent-vs-own), /for/businesses/ (cost-per-sq-ft),
// the homepage price section (home/PriceSection.astro), the product hub
// (/shipping-containers-for-sale/), and the product spec pages ([slug].astro).
// Prices are AVERAGE starting prices, not quotes — always render with the disclaimer.
// See decision 2026-06-04-cost-comparison-content-and-dollar-exception.md.

export interface ContainerPrice {
  /** Display label for the size/grade. */
  label: string;
  /** Average starting price in USD (whole dollars). */
  price: number;
  /** Usable floor area in square feet. */
  sqft: number;
}

export interface Pricing {
  /** Date these prices were last confirmed. Drives the "as of {month year}" microcopy. */
  asOf: string;
  '20ftCargo': ContainerPrice;
  '40ftStandard': ContainerPrice;
  '40ftStandardHC': ContainerPrice;
}

export const pricing: Pricing = {
  asOf: '2026-07-09',
  '20ftCargo': { label: '20ft Cargo', price: 2010, sqft: 160 },
  '40ftStandard': { label: '40ft Standard', price: 2710, sqft: 320 },
  // NOTE: owner-confirmed accurate 2026-07-09 (HC below Standard is real, supply-driven).
  '40ftStandardHC': { label: '40ft Standard HC', price: 2470, sqft: 320 },
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

/** Human-readable "as of" label derived from asOf, e.g. "July 2026". */
export const asOfLabel = new Date(pricing.asOf + 'T00:00:00').toLocaleDateString('en-US', {
  month: 'long',
  year: 'numeric',
});

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
