/**
 * Guard on the generated price feed, src/data/geoPricing.ts.
 *
 * This is the only file in the repository that a robot rewrites with no human in the loop, so these
 * assertions are the whole review. They come in five groups.
 *
 * Shape and key allowlists. Every record is checked against an exact key set, at metro level and at
 * SKU level, and the file is checked as text for identifiers and for a supplier name. That pairing
 * is what makes it structurally impossible for a name or an internal identifier to reach the repo:
 * an unexpected field fails before anyone reads the diff.
 *
 * Value bounds. Multiples of ten inside published bounds, which is what catches a decimal shift, a
 * unit-only response or a zeroed delivery.
 *
 * Date invariants. A change date can never sit after the run that verified it and can never sit in
 * the future, and the honesty invariant ties lastVerified to whether any metro is priced at all in
 * both directions, so a file carrying a verification date and no prices fails, and so does a file
 * carrying prices and no date.
 *
 * The arithmetic basis. The delivered figure is the DELIVERY unit price plus delivery, never the
 * lower min-of-two field the feed also returns. That bug happened live, understated one metro by
 * 51.45 per container, and passed every other check in this file, which is why it gets its own
 * fixture and why the basis is a named export rather than a convention.
 *
 * Empty is legitimate. Before the first harvest there are no metros and lastVerified is null. The
 * coverage assertion arms itself the moment a harvest lands, so nothing here has to be remembered.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  geoPricing,
  geoSkuKeys,
  lastVerified,
  feedVersion,
  unitPriceBasis,
} from './geoPricing';
import { centroidBySlug, geoCentroids } from './geoCentroids';
import { pricing, type Pricing } from './pricing';

const REPO_ROOT = import.meta.dirname
  ? join(import.meta.dirname, '..', '..')
  : process.cwd();
const MODULE = join(REPO_ROOT, 'src/data/geoPricing.ts');
const HARVEST_SCRIPT = join(REPO_ROOT, 'scripts/harvest-geo-pricing.mjs');
const src = readFileSync(MODULE, 'utf8');

// HS-OUT-001. Both code points as escapes, never as the literal characters, so this file cannot
// contain the thing it forbids.
const DASHES = /[\u2014\u2013]/;
// One assertion that no mistyped escape can defeat: it forbids both dash code points and every other
// character outside printable ASCII in a single pattern.
const PRINTABLE_ASCII = /^[\x20-\x7E\n]*$/;

const ISO_DATE = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
const SUPPLIER = /freedom\s*conex/i;
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

// Absolute bounds on a DELIVERED figure, from the Feed Sanity section of the design spec. A floor of
// 1200 catches a unit-only response or a zeroed delivery; a ceiling of 6000 leaves headroom for
// out-of-region freight while still catching a decimal shift, which would land above 20000.
const FIGURE_MIN = 1200;
const FIGURE_MAX = 6000;

// A pickup figure gets its own floor, because it is a different quantity. The delivered floor bounds a
// TOTAL, unit price plus delivery. A pickup figure is the bare unit price with no delivery in it, so
// the delivered floor sits too high for it by roughly the cost of a delivery, and it rejected a real
// one: the live feed returned a savannah 20ft pickup unit price of 1183.35 on 2026-08-18, which rounds
// to 1180, and the shared floor of 1200 withheld it, so that metro would have published no pickup
// disclosure for a legitimate figure.
//
// 900 is derived from the same live run in two steps. Decomposition first: taking the smallest base
// delivery cost in the fifteen metro set, 250 at charleston, off the delivered floor of 1200 gives 950
// as the equivalent bound on a bare unit price. Move headroom second: a figure may move by up to the
// run ceiling of 20 percent, and the lowest live pickup figure is 1180, so any floor above 944 can
// reject a legal one run move. 900 is the nearest whole hundred clearing both, and it still catches
// what a floor is for, since that same unit price read as cents lands at 11.83, a decimal shift lands
// at 118.34 and a zeroed field lands at 0, each an order of magnitude below it. The ceiling is shared:
// the highest live pickup figure is 2160.
const PICKUP_MIN = 900;

// Fields that may never appear as a data key in the generated file. Matched in key form, so a comment
// naming one of them for a human reader stays legal while a serialised value never does.
const FORBIDDEN_KEYS = [
  'grade',
  'fromPrice',
  'pickupLocationName',
  'pickupLocationId',
  'deliveryLocationId',
  'deliveryDriverId',
];

const METRO_KEYS = ['skus', 'zip'];
const SKU_KEYS = ['available', 'delivered', 'effectiveSince', 'pickup', 'pickupDistanceMiles'];

const metroSlugs = Object.keys(geoPricing);
const harvested = metroSlugs.length > 0;
const today = new Date().toISOString().slice(0, 10);

const roundToTen = (n: number): number => Math.round(n / 10) * 10;

/**
 * The delivered figure, defined once here so the harvest has a written target to match. Reads the
 * delivery unit price and the base delivery cost and nothing else.
 */
const deliveredFrom = (row: { deliveryUnitPrice: number; baseDeliveryCost: number }): number =>
  roundToTen(row.deliveryUnitPrice + row.baseDeliveryCost);

// Measured at centroid 45404 on 2026-08-17: the min-of-two field returned 1440.60 while the delivery
// unit price returned 1492.05. baseDeliveryCost here is a round stand-in chosen only so the two
// candidate totals land on different multiples of ten. It is not a measured value.
const BASIS_FIXTURE = {
  deliveryUnitPrice: 1492.05,
  minOfTwoField: 1440.6,
  baseDeliveryCost: 600,
};

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (/\.(astro|ts|tsx|md)$/.test(entry) && !/\.test\.ts$/.test(entry)) acc.push(p);
  }
  return acc;
}

describe('geoPricing generated module: text hygiene', () => {
  it('announces that it is generated and names the script that writes it', () => {
    expect(src.startsWith('// src/data/geoPricing.ts')).toBe(true);
    expect(src).toContain('GENERATED FILE');
    expect(src).toContain('Do not hand edit');
    expect(src).toContain('scripts/harvest-geo-pricing.mjs');
    expect(src).toContain('Wind and Water Tight');
  });

  it('carries no em dash and no en dash (HS-OUT-001)', () => {
    expect(src).not.toMatch(DASHES);
  });

  it('is printable ASCII from end to end, which a mistyped escape cannot fake', () => {
    expect(src).toMatch(PRINTABLE_ASCII);
  });

  it('imports nothing at runtime: the single import is the type-only SKU key source', () => {
    const imports = src.match(/^\s*import\s[^\n]*$/gm) ?? [];
    expect(imports).toHaveLength(1);
    expect(imports[0]).toContain('import type');
    expect(imports[0]).toContain("from './pricing'");
  });

  it('never names the supplier, in data or in prose', () => {
    expect(src).not.toMatch(SUPPLIER);
  });

  it('carries no feed identifier, in key form or as a UUID', () => {
    expect(src).not.toMatch(UUID);
    for (const key of FORBIDDEN_KEYS) {
      expect(src, `${key} must never appear as a data key here`).not.toMatch(
        new RegExp(`(^|[^A-Za-z])${key}\\s*:`),
      );
    }
  });

  /**
   * The forbidden key check above hunts for a bare identifier followed by a colon, and that is the
   * only form it can see. Wrap a key in quote characters and the closing quote sits between the name
   * and the colon, so the pattern misses it entirely. The serialiser emits bare keys for exactly that
   * reason, and this is the assertion that keeps it that way: a later change to a quoted key style
   * would disarm the identifier protection while leaving every other assertion in this file green.
   *
   * Armed even with no data in the file, because the interface declarations use the same bare form.
   * Record keys are deliberately not covered: a metro slug has to stay quoted because it carries
   * hyphens, and a SKU id has to stay quoted because it starts with a digit.
   */
  it('writes every data field as a bare identifier key, the one form the forbidden key check can see', () => {
    for (const key of [...METRO_KEYS, ...SKU_KEYS]) {
      expect(src, `${key} must appear as a bare identifier key`).toMatch(
        new RegExp(`(^|[^A-Za-z])${key}\\s*:`, 'm'),
      );
      expect(src, `${key} must not be written as a quoted key: the identifier check cannot see one`)
        .not.toMatch(new RegExp(`["']${key}["']\\s*:`));
    }
    // The reason, demonstrated on both forms so a later reader does not have to rediscover it.
    const check = new RegExp(`(^|[^A-Za-z])fromPrice\\s*:`);
    expect(check.test('  fromPrice: 1440.6,')).toBe(true);
    expect(check.test('  ' + JSON.stringify('fromPrice') + ': 1440.6,')).toBe(false);
  });

  it('carries no NEW grade, which is a separate build and stays out (T-143)', () => {
    expect(src).not.toMatch(/\bNEW\b/);
  });
});

describe('geoPricing generated module: shape', () => {
  it('declares a positive integer feedVersion', () => {
    expect(Number.isInteger(feedVersion)).toBe(true);
    expect(feedVersion).toBeGreaterThan(0);
  });

  it('agrees with pricing.ts about what a SKU is', () => {
    const fromPricingModule = (Object.keys(pricing) as (keyof Pricing)[])
      .filter((k) => k !== 'asOf')
      .sort();
    expect([...geoSkuKeys].sort()).toEqual(fromPricingModule);
  });

  it('prices only metros that the centroid module defines', () => {
    for (const slug of metroSlugs) {
      expect(centroidBySlug[slug], `${slug} is priced but is not a known metro`).toBeDefined();
    }
  });

  it('echoes the centroid ZIP for every metro it prices', () => {
    for (const slug of metroSlugs) {
      expect(geoPricing[slug].zip, `${slug} was priced from the wrong ZIP`).toBe(
        centroidBySlug[slug].zip,
      );
      expect(geoPricing[slug].zip).toMatch(/^[0-9]{5}$/);
    }
  });

  it('holds exactly the allowlisted keys at metro level and at SKU level', () => {
    for (const slug of metroSlugs) {
      expect(Object.keys(geoPricing[slug]).sort()).toEqual(METRO_KEYS);
      expect(Object.keys(geoPricing[slug].skus).sort()).toEqual([...geoSkuKeys].sort());
      for (const key of geoSkuKeys) {
        expect(Object.keys(geoPricing[slug].skus[key]).sort(), `${slug} ${key}`).toEqual(SKU_KEYS);
      }
    }
  });

  it('covers every centroid metro once a harvest has run, all fifteen or none', () => {
    if (!harvested) {
      expect(lastVerified).toBeNull();
      return;
    }
    expect([...metroSlugs].sort()).toEqual(geoCentroids.map((m) => m.slug).sort());
  });
});

describe('geoPricing generated module: values', () => {
  it('keeps every delivered figure a whole multiple of ten inside the published bounds', () => {
    for (const slug of metroSlugs) {
      for (const key of geoSkuKeys) {
        const v = geoPricing[slug].skus[key].delivered;
        expect(Number.isInteger(v), `${slug} ${key} delivered ${v}`).toBe(true);
        expect(v % 10, `${slug} ${key} delivered ${v}`).toBe(0);
        expect(v).toBeGreaterThanOrEqual(FIGURE_MIN);
        expect(v).toBeLessThanOrEqual(FIGURE_MAX);
      }
    }
  });

  it('keeps every pickup figure null or a whole multiple of ten inside the pickup bounds', () => {
    for (const slug of metroSlugs) {
      for (const key of geoSkuKeys) {
        const v = geoPricing[slug].skus[key].pickup;
        if (v === null) continue;
        expect(Number.isInteger(v), `${slug} ${key} pickup ${v}`).toBe(true);
        expect(v % 10, `${slug} ${key} pickup ${v}`).toBe(0);
        expect(v).toBeGreaterThanOrEqual(PICKUP_MIN);
        expect(v).toBeLessThanOrEqual(FIGURE_MAX);
      }
    }
  });

  it('keeps the pickup floor below the delivered floor, and low enough for the live spread', () => {
    // A pickup figure that passed the delivered floor would say the two quantities are the same kind
    // of number, and they are not: one is a total and the other is a unit price.
    expect(PICKUP_MIN).toBeLessThan(FIGURE_MIN);
    // The measured rejection this floor exists for: 1183.35 rounds to 1180 and must survive.
    expect(1180).toBeGreaterThanOrEqual(PICKUP_MIN);
    // And it must survive a legal one run move of the ceiling, 20 percent, from that same figure.
    expect(Math.round(1180 * 0.8)).toBeGreaterThanOrEqual(PICKUP_MIN);
    // It still has to catch what a floor is for: a cents reading, a decimal shift and a zero.
    for (const corrupt of [0, 11.83, 118.34]) expect(corrupt).toBeLessThan(PICKUP_MIN);
  });

  it('reports pickup distance as a plausible number of miles or not at all', () => {
    for (const slug of metroSlugs) {
      for (const key of geoSkuKeys) {
        const v = geoPricing[slug].skus[key].pickupDistanceMiles;
        if (v === null) continue;
        expect(Number.isFinite(v), `${slug} ${key} distance ${v}`).toBe(true);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(3000);
      }
    }
  });

  it('reports availability as a boolean, never as a truthy string', () => {
    for (const slug of metroSlugs) {
      for (const key of geoSkuKeys) {
        expect(typeof geoPricing[slug].skus[key].available, `${slug} ${key}`).toBe('boolean');
      }
    }
  });
});

describe('geoPricing generated module: dates', () => {
  it('carries a real ISO effectiveSince for every figure, and never a future one', () => {
    for (const slug of metroSlugs) {
      for (const key of geoSkuKeys) {
        const d = geoPricing[slug].skus[key].effectiveSince;
        expect(d, `${slug} ${key}`).toMatch(ISO_DATE);
        expect(new Date(`${d}T00:00:00Z`).toISOString().slice(0, 10), `${slug} ${key}`).toBe(d);
        expect(d.localeCompare(today), `${slug} ${key} is dated in the future`).toBeLessThanOrEqual(0);
      }
    }
  });

  it('never dates a change after the run that verified it', () => {
    if (lastVerified === null) return;
    expect(lastVerified).toMatch(ISO_DATE);
    for (const slug of metroSlugs) {
      for (const key of geoSkuKeys) {
        const d = geoPricing[slug].skus[key].effectiveSince;
        expect(d.localeCompare(lastVerified), `${slug} ${key}`).toBeLessThanOrEqual(0);
      }
    }
  });

  it('keeps lastVerified and the priced set honest about each other, both ways', () => {
    if (harvested) expect(lastVerified).toMatch(ISO_DATE);
    else expect(lastVerified).toBeNull();
  });

  it('keeps lastVerified off every rendered surface (D5)', () => {
    const surfaces = ['src/pages', 'src/components', 'src/layouts']
      .map((d) => join(REPO_ROOT, d))
      .filter((d) => existsSync(d))
      .flatMap((d) => walk(d));
    expect(surfaces.length).toBeGreaterThan(20);
    for (const file of surfaces) {
      expect(readFileSync(file, 'utf8'), `${file} must not read the verification date`).not.toContain(
        'lastVerified',
      );
    }
  });
});

describe('geoPricing generated module: the arithmetic basis', () => {
  it('names the delivery unit price as the summed field, and admits no other value', () => {
    expect(unitPriceBasis).toBe('deliveryUnitPrice');
    expect(src).toContain('deliveryUnitPrice');
  });

  it('never builds a delivered total from the lower min-of-two field', () => {
    const correct = deliveredFrom(BASIS_FIXTURE);
    const wrong = roundToTen(BASIS_FIXTURE.minOfTwoField + BASIS_FIXTURE.baseDeliveryCost);
    // The fixture has to discriminate, or the assertion below is decoration.
    expect(correct).not.toBe(wrong);
    expect(correct).toBe(2090);
    expect(wrong).toBe(2040);
    expect(deliveredFrom(BASIS_FIXTURE)).not.toBe(wrong);
  });

  it('rounds the sum once, never the two parts before adding them', () => {
    // Rounding the parts first gives 1490 plus 600, which is 2090 here by luck and 2100 elsewhere.
    const parts = roundToTen(1492.05) + roundToTen(597.5);
    const once = deliveredFrom({ deliveryUnitPrice: 1492.05, baseDeliveryCost: 597.5 });
    expect(once).toBe(2090);
    expect(parts).toBe(2090);
    const drift = deliveredFrom({ deliveryUnitPrice: 1444.96, baseDeliveryCost: 600.04 });
    expect(drift).toBe(2050);
    expect(roundToTen(1444.96) + roundToTen(600.04)).toBe(2040);
  });

  it('holds the harvest to the same basis once the script exists', () => {
    if (!existsSync(HARVEST_SCRIPT)) return;
    const script = readFileSync(HARVEST_SCRIPT, 'utf8');
    expect(script, 'the min-of-two field is provenance only and must never be summed').not.toMatch(
      /fromPrice[^\n]{0,24}\+|\+[^\n]{0,24}fromPrice/,
    );
  });
});
