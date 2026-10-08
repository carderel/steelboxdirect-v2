/**
 * The size-versus-price helpers. They exist so no page types a comparison percentage again (facts
 * audit 2026-10-08), so what matters is that each helper is the arithmetic its name says, computed
 * from the live modules rather than from fixed numbers.
 */
import { describe, it, expect } from 'vitest';
import { pricing } from './pricing';
import {
  skuCubicFeet,
  pricePerCuFt,
  pricePerSqFt,
  pctMorePrice,
  pctCheaperPerCuFt,
  pctCheaperPerSqFt,
  floorRatio,
} from './sizeComparison';

describe('sizeComparison helpers', () => {
  it('reads capacity from containers.ts', () => {
    expect(skuCubicFeet('20ftCargo')).toBe(1172);
    expect(skuCubicFeet('40ftStandard')).toBe(2390);
    expect(skuCubicFeet('40ftStandardHC')).toBe(2694);
  });

  it('computes per-unit prices from pricing.ts and the interior floor', () => {
    expect(pricePerCuFt('20ftCargo')).toBeCloseTo(pricing['20ftCargo'].price / 1172, 10);
    expect(pricePerSqFt('40ftStandard')).toBeCloseTo(pricing['40ftStandard'].price / 302, 10);
  });

  it('states percentages as whole numbers in the direction the name says', () => {
    const p20 = pricing['20ftCargo'].price;
    const p40 = pricing['40ftStandard'].price;
    expect(pctMorePrice('40ftStandard', '20ftCargo')).toBe(Math.round(((p40 - p20) / p20) * 100));
    expect(pctMorePrice('20ftCargo', '20ftCargo')).toBe(0);
    const perCu = (p: number, cu: number) => p / cu;
    expect(pctCheaperPerCuFt('40ftStandard', '20ftCargo')).toBe(
      Math.round(((perCu(p20, 1172) - perCu(p40, 2390)) / perCu(p20, 1172)) * 100),
    );
    expect(Number.isInteger(pctCheaperPerSqFt('40ftStandardHC', '20ftCargo'))).toBe(true);
  });

  it('puts a 40ft at about twice the floor of a 20ft', () => {
    expect(Math.round(floorRatio('40ftStandard', '20ftCargo'))).toBe(2);
  });
});
