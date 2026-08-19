/**
 * Guard on the derived national figures in src/data/pricing.ts.
 *
 * Three things are worth testing here and nothing else is.
 *
 * The shape, because it is load bearing in a way that is easy to miss. Two consumers enumerate every
 * own key of the pricing object and exclude exactly one of them by name, so a metadata key added
 * beside asOf breaks the rent-vs-buy calculator build and its guard together. The key set assertion
 * below is what turns that into a failing test rather than a broken page.
 *
 * The basis, because it is the one place the meaning of the site wide figure lives. The word average
 * is rendered next to this number on five surfaces, and the basis is what makes that word true. The
 * basis is the NATIONAL BASIS metro set, ruled 2026-08-18 as the seven home region metros, which is
 * a narrower set than the publish set of fifteen and is a separate human decision from it. The
 * fixtures below therefore mix a basis metro with a non basis one, so that a change that quietly
 * widened the basis back to every publishing metro would move a number in here rather than pass.
 *
 * The two paths, because only one of them is live at a time and the other one ships unexercised. With
 * no metro priced the module falls back to the last reviewed figures, which is the state before the
 * first harvest run. With metros priced it means them. The fallback test arms itself off the real feed
 * so neither path is ever the untested one.
 */
import { describe, it, expect, vi } from 'vitest';
import { geoPricing } from './geoPricing';
import { nationalBasisCentroids } from './geoCentroids';
import { countWord } from './numberWords';
import {
  pricing,
  nationalPrice,
  nationalEffectiveSince,
  nationalBasisScope,
  nationalPriceLabel,
  priceValidUntil,
  asOfLabel,
  effectiveSinceLabel,
  formatPrice,
  priceBySlug,
} from './pricing';

const ISO_DATE = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;

/** The figures this module carried before the feed existed. Only reachable while the feed is empty. */
const BASELINE = { '20ftCargo': 2010, '40ftStandard': 2710, '40ftStandardHC': 2470 } as const;
const BASELINE_AS_OF = '2026-07-09';

const pricedBasis = nationalBasisCentroids.filter((metro) => metro.slug in geoPricing);

/** A metro record in the generated shape. Delivered figures only: nothing else feeds a national one. */
const metro = (zip: string, figures: [number, string, boolean][]) => ({
  zip,
  skus: {
    '20ftCargo': record(figures[0]),
    '40ftStandard': record(figures[1]),
    '40ftStandardHC': record(figures[2]),
  },
});

const record = ([delivered, effectiveSince, available]: [number, string, boolean]) => ({
  delivered,
  pickup: delivered - 600,
  pickupDistanceMiles: 12.3,
  available,
  effectiveSince,
});

/** Reloads pricing.ts against a stand-in feed, which is the only way to reach the populated path. */
async function withFeed(geo: Record<string, unknown>) {
  vi.resetModules();
  vi.doMock('./geoPricing', () => ({
    geoSkuKeys: ['20ftCargo', '40ftStandard', '40ftStandardHC'],
    geoPricing: geo,
    lastVerified: '2026-08-18',
    feedVersion: 1,
    unitPriceBasis: 'deliveryUnitPrice',
  }));
  const mod = await import('./pricing');
  vi.doUnmock('./geoPricing');
  vi.resetModules();
  return mod;
}

describe('pricing.ts keeps the shape its consumers depend on', () => {
  it('exposes exactly the three SKU keys and the one date key, and nothing else', () => {
    expect(Object.keys(pricing)).toEqual(['asOf', '20ftCargo', '40ftStandard', '40ftStandardHC']);
  });

  it('keeps every non-date key a full price record, which is what the calculator assumes', () => {
    for (const key of Object.keys(pricing)) {
      if (key === 'asOf') continue;
      const entry = pricing[key as '20ftCargo'];
      expect(typeof entry.label, key).toBe('string');
      expect(Number.isInteger(entry.price), key).toBe(true);
      expect(entry.price, key).toBeGreaterThan(0);
      expect(entry.sqft, key).toBeGreaterThan(0);
    }
  });

  it('keeps identity and geometry hand written, since no feed owns a label or a floor area', () => {
    expect(pricing['20ftCargo'].label).toBe('20ft Cargo');
    expect(pricing['20ftCargo'].sqft).toBe(160);
    expect(pricing['40ftStandard'].label).toBe('40ft Standard');
    expect(pricing['40ftStandardHC'].sqft).toBe(320);
  });

  it('maps every product page slug to one of those same records', () => {
    expect(Object.values(priceBySlug)).toHaveLength(3);
    for (const entry of Object.values(priceBySlug)) {
      expect(Object.values(pricing)).toContain(entry);
    }
  });

  it('states a real ISO change date and a month precision label built from it', () => {
    expect(pricing.asOf).toMatch(ISO_DATE);
    expect(pricing.asOf).toBe(nationalEffectiveSince());
    expect(asOfLabel).toBe(
      new Date(pricing.asOf + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    );
  });
});

describe('pricing.ts falls back to the last reviewed figures only while no metro is priced', () => {
  it('uses the baseline with an empty feed and the feed once there is one', () => {
    if (pricedBasis.length === 0) {
      expect(pricing['20ftCargo'].price).toBe(BASELINE['20ftCargo']);
      expect(pricing['40ftStandard'].price).toBe(BASELINE['40ftStandard']);
      expect(pricing['40ftStandardHC'].price).toBe(BASELINE['40ftStandardHC']);
      expect(pricing.asOf).toBe(BASELINE_AS_OF);
      return;
    }
    // The feed is live, so the baseline must no longer be able to reach a rendered surface.
    const delivered = pricedBasis.flatMap((m) =>
      Object.values(geoPricing[m.slug].skus).filter((s) => s.available).map((s) => s.delivered),
    );
    expect(delivered.length).toBeGreaterThan(0);
    expect(pricing.asOf.localeCompare(BASELINE_AS_OF)).toBeGreaterThanOrEqual(0);
  });

  it('never reads an empty feed as a price of zero', () => {
    for (const key of ['20ftCargo', '40ftStandard', '40ftStandardHC'] as const) {
      expect(pricing[key].price).toBeGreaterThan(1000);
      expect(formatPrice(pricing[key].price)).toMatch(/^\$[0-9],[0-9]{3}$/);
    }
  });
});

describe('the national basis: the mean of the national basis metros the feed has priced', () => {
  it('means the delivered figures and rounds the mean to a whole ten', async () => {
    const { pricing: derived, nationalPrice: derivedPrice } = await withFeed({
      'cincinnati-shipping-containers': metro('45237', [
        [2040, '2026-08-12', true],
        [2420, '2026-08-14', true],
        [2310, '2026-08-10', true],
      ]),
      'dayton-shipping-containers': metro('45404', [
        [2040, '2026-08-11', true],
        [2400, '2026-08-11', true],
        [2300, '2026-08-11', true],
      ]),
      'huntington-shipping-containers': metro('25704', [
        [2210, '2026-08-11', true],
        [2570, '2026-08-11', true],
        [2460, '2026-08-11', true],
      ]),
      // Publishes on its own city page and is deliberately NOT in the basis, so every figure below
      // is computed as though this record were absent. See the NATIONAL BASIS RULING in
      // src/data/geoCentroids.ts for why the two sets differ.
      'savannah-shipping-containers': metro('31408', [
        [1760, '2026-08-17', true],
        [2120, '2026-08-17', true],
        [2120, '2026-08-17', true],
      ]),
    });
    // mean of 2040, 2040 and 2210 is 2096.67, which rounds to 2100 and not to 2090
    expect(derivedPrice('20ftCargo')).toBe(2100);
    expect(derived['20ftCargo'].price).toBe(2100);
    expect(derivedPrice('40ftStandard')).toBe(2460);
    expect(derivedPrice('40ftStandardHC')).toBe(2360);
    // the mean is not any single metro figure, which is the whole reason it is a mean
    expect(derivedPrice('20ftCargo')).not.toBe(2040);
    expect(derivedPrice('20ftCargo')).not.toBe(2210);
    // and it is not the mean of all four, which is what the basis narrowing bought. Widening the
    // basis back to every publishing metro lands on 2010 here rather than failing quietly.
    expect(derivedPrice('20ftCargo')).not.toBe(2010);
    // identity and geometry survive the derivation untouched
    expect(derived['20ftCargo'].label).toBe('20ft Cargo');
    expect(derived['20ftCargo'].sqft).toBe(160);
    expect(Object.keys(derived)).toEqual(['asOf', '20ftCargo', '40ftStandard', '40ftStandardHC']);
  });

  it('drops a SKU a metro cannot supply, since an unavailable size is no evidence of its price', async () => {
    const { nationalPrice: derivedPrice } = await withFeed({
      'cincinnati-shipping-containers': metro('45237', [
        [2040, '2026-08-12', true],
        [2420, '2026-08-12', true],
        [2310, '2026-08-12', true],
      ]),
      // Both metros are in the basis, so availability is the only thing filtering anything here.
      'huntington-shipping-containers': metro('25704', [
        [2210, '2026-08-17', true],
        [2570, '2026-08-17', true],
        [2460, '2026-08-17', false],
      ]),
    });
    // the 40ft HC drops the huntington figure and is the cincinnati one alone
    expect(derivedPrice('40ftStandardHC')).toBe(2310);
    // the other two sizes still average both metros: 2125 rounds up to 2130
    expect(derivedPrice('20ftCargo')).toBe(2130);
  });

  it('ignores an unpriced metro, an unknown metro, and a metro outside the national basis', async () => {
    const { nationalPrice: derivedPrice } = await withFeed({
      'cincinnati-shipping-containers': metro('45237', [
        [2040, '2026-08-12', true],
        [2420, '2026-08-12', true],
        [2310, '2026-08-12', true],
      ]),
      // not a metro any centroid defines, so it can never reach a national figure
      'atlantis-shipping-containers': metro('00000', [
        [5900, '2026-08-12', true],
        [5900, '2026-08-12', true],
        [5900, '2026-08-12', true],
      ]),
      // a real, priced, PUBLISHING metro that is outside the basis. It renders its own delivered
      // figure on its own city page and contributes nothing to the site wide one.
      'charleston-shipping-containers': metro('29406', [
        [1640, '2026-08-18', true],
        [1970, '2026-08-18', true],
        [2170, '2026-08-18', true],
      ]),
    });
    expect(derivedPrice('20ftCargo')).toBe(2040);
  });

  it('dates the national figures from the latest contributing change, never from a check date', async () => {
    const { pricing: derived } = await withFeed({
      'cincinnati-shipping-containers': metro('45237', [
        [2040, '2026-08-12', true],
        [2420, '2026-08-14', true],
        [2310, '2026-08-10', true],
      ]),
      'dayton-shipping-containers': metro('45404', [
        [2040, '2026-08-11', true],
        // the latest date in the fixture sits on a figure that is not available, so it must not count
        [2400, '2026-08-30', false],
        [2300, '2026-08-11', true],
      ]),
    });
    expect(derived.asOf).toBe('2026-08-14');
  });

  it('falls back for a SKU with no contributor at all rather than reporting nothing', async () => {
    const { nationalPrice: derivedPrice } = await withFeed({});
    expect(derivedPrice('20ftCargo')).toBe(BASELINE['20ftCargo']);
  });

  /**
   * The label is the condition the basis narrowing was accepted on, so it is pinned here rather than
   * left to review. A mean of a named subset is still a mean, but only while the subset is named
   * beside the number: unnamed, it is a true statement that reads as a broader one, and an extractive
   * system quotes the figure under whatever scope it finds nearest instead. The old label said
   * nothing but the word average, which is the defect.
   *
   * Pinned as properties rather than as one literal, so rewording the copy stays cheap while
   * dropping the basis from it, or hardcoding the count, both fail.
   */
  it('names its own basis in the rendered label, with the metro count derived and not typed', () => {
    expect(nationalBasisScope).toBe(`${countWord(nationalBasisCentroids.length)} home metros`);
    expect(nationalPriceLabel).toContain(nationalBasisScope);
    expect(nationalPriceLabel).toMatch(/avg|average/i);
    // The count is spelled from the basis list, so moving a metro rewrites the label by itself.
    expect(nationalBasisCentroids.length).toBeGreaterThan(1);
    expect(nationalPriceLabel).toContain(countWord(nationalBasisCentroids.length));
    expect(nationalPriceLabel).not.toMatch(/[0-9]/);
    // Short enough for four uppercased mono slots under a large figure. See the docstring in
    // src/data/pricing.ts for why length is a real constraint here and not a preference.
    expect(nationalPriceLabel.length).toBeLessThanOrEqual(48);
  });
});

describe('the dates the schema publishes', () => {
  it('keeps priceValidUntil in the future, which is what the old derivation could not promise', () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(priceValidUntil).toMatch(ISO_DATE);
    expect(priceValidUntil.localeCompare(today)).toBeGreaterThan(0);
    // build date plus a year, so a price that holds for thirteen months cannot expire it
    expect(Number(priceValidUntil.slice(0, 4))).toBe(Number(today.slice(0, 4)) + 1);
  });

  it('labels a change date to the day, and names the year only when it is not the current one', () => {
    const year = new Date().getFullYear();
    expect(effectiveSinceLabel(`${year}-08-12`)).toBe('August 12');
    expect(effectiveSinceLabel(`${year - 1}-08-12`)).toBe(`August 12, ${year - 1}`);
  });
});
