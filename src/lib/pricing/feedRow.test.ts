// Unit tests for src/lib/pricing/feedRow.mjs, the pure feed contract shared by the daily harvest and
// the live per ZIP lookup. No network. No em dash and no en dash in this file.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  DASHES,
  FIGURE_MAX,
  FIGURE_MIN,
  MOVE_CEILING,
  PICKUP_MIN,
  PRINTABLE_ASCII,
  SIZE_ID_BY_SKU,
  SKU_KEYS,
  UNIT_PRICE_BASIS,
  deliveredPrice,
  moveWithinCeiling,
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

describe('feedRow: the move ceiling is shared with the harvest', () => {
  it('is twenty percent and lives in the shared module so the worker can import it', () => {
    expect(MOVE_CEILING).toBe(0.2);
    expect(harvest.MOVE_CEILING).toBe(MOVE_CEILING);
    expect(harvest.moveWithinCeiling).toBe(moveWithinCeiling);
  });
  it('rejects a move of more than twenty percent in either direction and skips with nothing committed', () => {
    expect(moveWithinCeiling(2508, 2090)).toBe(true);
    expect(moveWithinCeiling(2560, 2050)).toBe(false);
    expect(moveWithinCeiling(1600, 2090)).toBe(false);
    expect(moveWithinCeiling(2090, null)).toBe(true);
    expect(moveWithinCeiling(2090, 0)).toBe(true);
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
