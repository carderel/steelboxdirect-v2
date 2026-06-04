// src/data/pricing.ts
// Single source of truth for container pricing displayed on use-case pages.
// Only /for/homeowners/ (5-yr rent-vs-own) and /for/businesses/ (cost-per-sq-ft)
// consume this — see decision 2026-06-04-cost-comparison-content-and-dollar-exception.md.

export interface ContainerPrice {
  /** Display label for the size/grade. */
  label: string;
  /** Current purchase price in USD (whole dollars). */
  price: number;
  /** Usable floor area in square feet. */
  sqft: number;
}

export interface Pricing {
  /** Date these prices were last confirmed. Drives the "updated June 2026" microcopy. */
  asOf: string;
  '20ftCargo': ContainerPrice;
  '40ftStandard': ContainerPrice;
  '40ftStandardHC': ContainerPrice;
}

export const pricing: Pricing = {
  asOf: '2026-06-04',
  '20ftCargo': { label: '20ft Cargo', price: 2007, sqft: 160 },
  '40ftStandard': { label: '40ft Standard', price: 2709, sqft: 320 },
  // NOTE: HC priced under Standard as of this date — verify before relying on long-term; per user 2026-06-04
  '40ftStandardHC': { label: '40ft Standard HC', price: 2470, sqft: 320 },
};

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
