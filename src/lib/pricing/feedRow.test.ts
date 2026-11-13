// Unit tests for src/lib/pricing/feedRow.mjs, the pure feed contract shared by the daily harvest and
// the live per ZIP lookup. No network. No em dash and no en dash in this file.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  DASHES,
  FIGURE_MAX,
  FIGURE_MIN,
  PICKUP_MIN,
  SANITY_FACTOR,
  PRINTABLE_ASCII,
  SIZE_ID_BY_SKU,
  SKU_KEYS,
  UNIT_PRICE_BASIS,
  committedMedians,
  deliveredPrice,
  median,
  passesSanity,
  pickupFigure,
  pickupWithinBounds,
  roundToTen,
  rowForSize,
  selectWwt,
  withinBounds,
} from './feedRow.mjs';
import * as harvest from '../../../scripts/harvest-geo-pricing.mjs';
import * as shared from './feedRow.mjs';

const REPO_ROOT = import.meta.dirname ? join(import.meta.dirname, '..', '..', '..') : process.cwd();
const SELF = join(REPO_ROOT, 'src/lib/pricing/feedRow.mjs');

describe('feedRow: arithmetic', () => {
  it('sums the delivery unit price and the delivery cost and rounds once', () => {
    expect(UNIT_PRICE_BASIS).toBe('deliveryUnitPrice');
    expect(deliveredPrice({ deliveryUnitPrice: 1444.96, baseDeliveryCost: 600.04 })).toBe(2050);
    // Rounding in parts would give 2040: the reason the sum is rounded once.
    expect(roundToTen(1444.96) + roundToTen(600.04)).toBe(2040);
  });

  it('never reads the lower min of two field, even when it is present and smaller', () => {
    const row = { deliveryUnitPrice: 1492.05, baseDeliveryCost: 600, fromPrice: 1440.6 };
    expect(deliveredPrice(row)).toBe(2090);
    expect(deliveredPrice(row)).not.toBe(2040);
  });

  it('throws rather than coercing a missing field', () => {
    expect(() => deliveredPrice({ baseDeliveryCost: 600 })).toThrow(TypeError);
    expect(() => deliveredPrice({ deliveryUnitPrice: '1500', baseDeliveryCost: 600 })).toThrow(TypeError);
  });

  it('rounds pickup, and nulls a missing or non positive pickup', () => {
    expect(pickupFigure({ pickupUnitPrice: 1183.35 })).toBe(1180);
    expect(pickupFigure({ pickupUnitPrice: 0 })).toBeNull();
    expect(pickupFigure({})).toBeNull();
  });

  it('holds the published bounds', () => {
    expect([FIGURE_MIN, FIGURE_MAX, PICKUP_MIN]).toEqual([1200, 6000, 900]);
    expect(withinBounds(1200)).toBe(true);
    expect(withinBounds(1190)).toBe(false);
    expect(withinBounds(6010)).toBe(false);
    expect(pickupWithinBounds(900)).toBe(true);
    expect(pickupWithinBounds(890)).toBe(false);
  });
});

describe('feedRow: row selection', () => {
  it('keeps WWT rows only and finds exactly one per size', () => {
    const payload = {
      byKey: {
        a: { grade: 'NEW', sizeId: '20-std' },
        b: { grade: 'WWT', sizeId: '20-std' },
        c: { grade: 'WWT', sizeId: '40-hc' },
        d: { grade: 'WWT', sizeId: '40-hc' },
      },
    };
    const rows = selectWwt(payload);
    expect(rows).toHaveLength(3);
    expect(rowForSize(rows, '20-std')).toBe(payload.byKey.b);
    expect(rowForSize(rows, '40-hc')).toBeNull();
    expect(selectWwt({})).toEqual([]);
  });

  it('maps every SKU to a feed size', () => {
    expect(SKU_KEYS).toEqual(['20ftCargo', '40ftStandard', '40ftStandardHC']);
    for (const k of SKU_KEYS) expect(SIZE_ID_BY_SKU[k as keyof typeof SIZE_ID_BY_SKU]).toBeTruthy();
  });
});

describe('feedRow: the sanity check is shared with the harvest', () => {
  it('is a factor of three and lives in the shared module so the worker can import it', () => {
    expect(SANITY_FACTOR).toBe(3);
    expect(harvest.SANITY_FACTOR).toBe(SANITY_FACTOR);
    expect(harvest.passesSanity).toBe(passesSanity);
    expect(harvest.committedMedians).toBe(committedMedians);
  });
  it('the move ceiling is gone: the feed is trusted, so a twenty percent move is not a failure', () => {
    expect((shared as Record<string, unknown>).MOVE_CEILING).toBeUndefined();
    expect((shared as Record<string, unknown>).moveWithinCeiling).toBeUndefined();
    expect(passesSanity(2950, 2340)).toBe(true);
    expect(passesSanity(1600, 2340)).toBe(true);
  });
  it('blocks a figure that is not a finite number or not above zero', () => {
    for (const bad of [NaN, Infinity, -Infinity, null, undefined, '2340', 0, -5]) {
      expect(passesSanity(bad, 2340), String(bad)).toBe(false);
    }
  });
  it('blocks more than three times or less than a third of the median, inclusive at the edges', () => {
    expect(passesSanity(7020, 2340)).toBe(true);
    expect(passesSanity(7030, 2340)).toBe(false);
    expect(passesSanity(780, 2340)).toBe(true);
    expect(passesSanity(770, 2340)).toBe(false);
  });
  it('skips only the median comparison when there is no median, never the finite and positive check', () => {
    expect(passesSanity(2340, null)).toBe(true);
    expect(passesSanity(2340, 0)).toBe(true);
    expect(passesSanity(0, null)).toBe(false);
    expect(passesSanity(NaN, null)).toBe(false);
  });
  it('median handles odd, even, empty and junk input', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(median([])).toBeNull();
    expect(median([null, NaN, 0, -1, 'x'])).toBeNull();
    expect(median([2000, null, 2400, NaN])).toBe(2200);
  });
  it('committedMedians reads available sizes only, per size, for the field asked', () => {
    const sku = (delivered: number, pickup: number | null, available = true) => ({
      delivered,
      pickup,
      pickupDistanceMiles: null,
      available,
      effectiveSince: '2026-11-01',
    });
    const pricing = {
      a: { zip: '45404', skus: { '20ftCargo': sku(1900, 1400), '40ftStandard': sku(2300, 1800), '40ftStandardHC': sku(2400, null) } },
      b: { zip: '45237', skus: { '20ftCargo': sku(2000, 1500), '40ftStandard': sku(2900, 1900), '40ftStandardHC': sku(2500, 1900) } },
      c: { zip: '40205', skus: { '20ftCargo': sku(2600, 2100), '40ftStandard': sku(9999, 9999, false), '40ftStandardHC': sku(2700, 2000) } },
    };
    expect(committedMedians(pricing)).toEqual({ '20ftCargo': 2000, '40ftStandard': 2600, '40ftStandardHC': 2500 });
    expect(committedMedians(pricing, 'pickup')).toEqual({ '20ftCargo': 1500, '40ftStandard': 1850, '40ftStandardHC': 1950 });
    expect(committedMedians({})).toEqual({ '20ftCargo': null, '40ftStandard': null, '40ftStandardHC': null });
  });
});

describe('feedRow: the harvest re exports the same functions, not copies', () => {
  it('every shared export is the identical binding in the harvest', () => {
    for (const [name, value] of Object.entries(shared)) {
      expect((harvest as Record<string, unknown>)[name], name).toBe(value);
    }
  });
});

describe('feedRow: source hygiene', () => {
  const text = readFileSync(SELF, 'utf8');
  it('is printable ASCII with no dash characters', () => {
    expect(DASHES.test(text)).toBe(false);
    expect(PRINTABLE_ASCII.test(text)).toBe(true);
  });
  it('never places the min of two field beside a plus sign', () => {
    expect(text).not.toMatch(/fromPrice[^\n]{0,24}\+|\+[^\n]{0,24}fromPrice/);
  });
  it('imports no node built in, so the worker bundle can load it', () => {
    expect(text).not.toMatch(/from 'node:/);
  });
});
