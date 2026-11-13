// Unit tests for src/lib/pricing/zipPrice.ts, the live per ZIP lookup behind /price/. Fixtures only,
// no network. No em dash and no en dash in this file.
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CACHE_TTL_SECONDS,
  CACHE_VERSION,
  applySanityCheck,
  deliveredMedians,
  ZIP_SKUS,
  resultHeading,
  type SizeMedians,
  PRICE_DISCLAIMER,
  UPSTREAM_TIMEOUT_MS,
  cacheFromRuntime,
  cacheKey,
  dateLabel,
  easternIsoDate,
  guessZipFromCf,
  lookupZipPrice,
  normalizeZip,
  parseStored,
  serviceState,
  toPriceLine,
  validateZipPayload,
  type CacheLike,
} from './zipPrice';
import { geoPricing } from '../../data/geoPricing';

const REPO_ROOT = import.meta.dirname ? join(import.meta.dirname, '..', '..', '..') : process.cwd();

const IDS = {
  deliveryLocationId: '0d6685bb-1ec7-4508-afc7-b3f5c76337a9',
  deliveryDriverId: '748c11fa-14a0-4161-8292-7501459ae945',
  pickupLocationId: 'b4dac368-108e-45b9-aee0-76c4ebb739e4',
};

function row(sizeId: string, unit: number, delivery: number, extra: Record<string, unknown> = {}) {
  return {
    sizeId,
    grade: 'WWT',
    available: true,
    deliveryAvailable: true,
    pickupAvailable: true,
    deliveryUnitPrice: unit,
    baseDeliveryCost: delivery,
    pickupUnitPrice: unit - 51.45,
    pickupDistanceMiles: 44.7,
    pickupLocationName: 'Some Yard',
    fromPrice: unit - 51.45,
    ...IDS,
    ...extra,
  };
}

function payload(zip = '43219', overrides: Record<string, unknown> = {}) {
  return {
    zip,
    serviceable: true,
    byKey: {
      'new:20-std': { ...row('20-std', 2469.6, 677.19), grade: 'NEW' },
      'used:20-std': row('20-std', 1492.05, 600),
      'used:40-std': row('40-std', 1852.2, 550),
      'used:40-hc': row('40-hc', 1749.3, 550),
    },
    ...overrides,
  };
}

describe('zipPrice: ZIP checks', () => {
  it('accepts only 5 digits', () => {
    expect(normalizeZip(' 43219 ')).toBe('43219');
    for (const bad of ['abc', '4321', '432190', '43219-1234', '', null, undefined, 43219]) {
      expect(normalizeZip(bad as unknown)).toBeNull();
    }
  });

  it('maps prefixes to the four states, inclusive at both ends', () => {
    expect(serviceState('43000')).toBe('Ohio');
    expect(serviceState('45999')).toBe('Ohio');
    expect(serviceState('46000')).toBe('Indiana');
    expect(serviceState('47999')).toBe('Indiana');
    expect(serviceState('40000')).toBe('Kentucky');
    expect(serviceState('42799')).toBe('Kentucky');
    expect(serviceState('24700')).toBe('West Virginia');
    expect(serviceState('26899')).toBe('West Virginia');
  });

  it('rejects everything just outside each range', () => {
    for (const z of ['42999', '48000', '39999', '42800', '24699', '26900', '90210', '10001', '00000']) {
      expect(serviceState(z), z).toBeNull();
    }
  });
});

describe('zipPrice: guess from the request location', () => {
  it('returns an in area US ZIP', () => {
    expect(guessZipFromCf({ country: 'US', postalCode: '43219' })).toBe('43219');
    expect(guessZipFromCf({ country: 'US', postalCode: '40202', city: 'Louisville' })).toBe('40202');
  });

  it('returns null with no location data, as in dev and for most crawlers', () => {
    expect(guessZipFromCf(undefined)).toBeNull();
    expect(guessZipFromCf(null)).toBeNull();
    expect(guessZipFromCf({})).toBeNull();
    expect(guessZipFromCf('43219')).toBeNull();
  });

  it('returns null outside the area, so a crawler in a far data center gets the plain page', () => {
    expect(guessZipFromCf({ country: 'US', postalCode: '94043' })).toBeNull();
    expect(guessZipFromCf({ country: 'US', postalCode: '20147' })).toBeNull();
  });

  it('returns null for anything that is not exactly 5 digits', () => {
    expect(guessZipFromCf({ country: 'US', postalCode: '43219-1234' })).toBeNull();
    expect(guessZipFromCf({ country: 'US', postalCode: '4321' })).toBeNull();
    expect(guessZipFromCf({ country: 'US', postalCode: 43219 })).toBeNull();
  });

  it('returns null outside the US even when the postal code looks like an Ohio ZIP', () => {
    expect(guessZipFromCf({ country: 'DE', postalCode: '45127' })).toBeNull();
    expect(guessZipFromCf({ postalCode: '43219' })).toBeNull();
  });
});

describe('zipPrice: validation', () => {
  const ok = validateZipPayload(payload(), '43219', '2026-10-31');

  it('prices every size from the delivery unit price plus delivery, rounded once', () => {
    expect(ok.ok).toBe(true);
    if (!ok.ok) return;
    expect(ok.result.lines.map((l) => [l.sku, l.delivered])).toEqual([
      ['20ftCargo', 2090],
      ['40ftStandard', 2400],
      ['40ftStandardHC', 2300],
    ]);
    expect(ok.result.unavailable).toEqual([]);
  });

  it('never uses the lower min of two field', () => {
    if (!ok.ok) throw new Error('fixture should validate');
    expect(ok.result.lines[0].delivered).not.toBe(2040);
  });

  it('strips every identifier and name: the output carries only allowlisted keys', () => {
    if (!ok.ok) throw new Error('fixture should validate');
    expect(Object.keys(ok.result).sort()).toEqual(['checkedOn', 'lines', 'unavailable', 'zip']);
    for (const l of ok.result.lines) {
      expect(Object.keys(l).sort()).toEqual(['delivered', 'pickup', 'pickupMiles', 'sku']);
    }
    const text = JSON.stringify(ok.result);
    for (const v of Object.values(IDS)) expect(text).not.toContain(v);
    expect(text).not.toMatch(/Some Yard|fromPrice|grade|Driver|Location/i);
  });

  it('rounds pickup and its distance', () => {
    if (!ok.ok) throw new Error('fixture should validate');
    expect(ok.result.lines[0]).toEqual({ sku: '20ftCargo', delivered: 2090, pickup: 1440, pickupMiles: 45 });
  });

  it('rejects a reply about another ZIP', () => {
    expect(validateZipPayload(payload('43215'), '43219', '2026-10-31')).toEqual({ ok: false, reason: 'zip-echo' });
  });

  it('reports not serviceable only after the echo matches', () => {
    expect(validateZipPayload(payload('43219', { serviceable: false }), '43219', 'x')).toEqual({
      ok: false,
      reason: 'not-serviceable',
    });
    expect(validateZipPayload({ ...payload('43219'), serviceable: 'true' }, '43219', 'x').ok).toBe(false);
  });

  it('rejects a payload with no WWT rows', () => {
    const p = payload();
    p.byKey = { 'new:20-std': { ...row('20-std', 2000, 600), grade: 'NEW' } } as typeof p.byKey;
    expect(validateZipPayload(p, '43219', 'x')).toEqual({ ok: false, reason: 'grade-filter' });
  });

  it('fails closed when any available size is out of bounds: no partial price', () => {
    const low = payload();
    low.byKey['used:40-std'] = row('40-std', 400, 100);
    expect(validateZipPayload(low, '43219', 'x')).toEqual({ ok: false, reason: 'delivered-bounds' });
    const high = payload();
    high.byKey['used:40-hc'] = row('40-hc', 5800, 600);
    expect(validateZipPayload(high, '43219', 'x')).toEqual({ ok: false, reason: 'delivered-bounds' });
  });

  it('fails closed on a non numeric price field', () => {
    const p = payload();
    p.byKey['used:20-std'] = row('20-std', 1500, 600, { deliveryUnitPrice: '1500' });
    expect(validateZipPayload(p, '43219', 'x')).toEqual({ ok: false, reason: 'unit-and-delivery-finite' });
  });

  it('lists an unavailable size rather than pricing it', () => {
    const p = payload();
    p.byKey['used:40-hc'] = row('40-hc', 1749.3, 550, { deliveryAvailable: false });
    delete (p.byKey as Record<string, unknown>)['used:40-std'];
    const v = validateZipPayload(p, '43219', 'x');
    expect(v.ok).toBe(true);
    if (!v.ok) return;
    expect(v.result.lines.map((l) => l.sku)).toEqual(['20ftCargo']);
    expect(v.result.unavailable).toEqual(['40ftStandard', '40ftStandardHC']);
  });

  it('withholds a pickup figure below the floor without touching the delivered price', () => {
    const line = toPriceLine('20ftCargo', row('20-std', 1492.05, 600, { pickupUnitPrice: 850 }));
    expect(line).toEqual({ sku: '20ftCargo', delivered: 2090, pickup: null, pickupMiles: null });
  });

  it('omits the pickup figure when pickupAvailable is false or missing, delivered price unchanged', () => {
    const off = toPriceLine('20ftCargo', row('20-std', 1492.05, 600, { pickupAvailable: false }));
    expect(off).toEqual({ sku: '20ftCargo', delivered: 2090, pickup: null, pickupMiles: null });
    const r = row('20-std', 1492.05, 600) as Record<string, unknown>;
    delete r.pickupAvailable;
    expect(toPriceLine('20ftCargo', r)).toEqual({ sku: '20ftCargo', delivered: 2090, pickup: null, pickupMiles: null });
    const on = toPriceLine('20ftCargo', row('20-std', 1492.05, 600, { pickupAvailable: true }));
    expect(on).toEqual({ sku: '20ftCargo', delivered: 2090, pickup: 1440, pickupMiles: 45 });
  });

  it('omits pickup in a validated result when the row has pickupAvailable false', () => {
    const v = validateZipPayload(
      { zip: '43219', serviceable: true, byKey: { a: row('20-std', 1492.05, 600, { pickupAvailable: false }) } },
      '43219',
      '2026-10-31',
    );
    if (!v.ok) throw new Error(v.reason);
    expect(v.result.lines[0].pickup).toBeNull();
    expect(v.result.lines[0].pickupMiles).toBeNull();
  });

  it('rejects non ASCII smuggled into the result', () => {
    const v = validateZipPayload(payload('43219'), '43219', '2026\u201310\u201331');
    expect(v).toEqual({ ok: false, reason: 'hygiene' });
  });
});

describe('zipPrice: dates', () => {
  it('uses the America/New_York calendar date', () => {
    // 02:30 UTC on Nov 1 is still Oct 31 in New York.
    expect(easternIsoDate(new Date('2026-11-01T02:30:00Z'))).toBe('2026-10-31');
    expect(easternIsoDate(new Date('2026-11-01T05:00:00Z'))).toBe('2026-11-01');
    expect(dateLabel('2026-10-31')).toBe('October 31, 2026');
  });
});

describe('zipPrice: the disclaimer is the QuickFacts sentence, word for word', () => {
  it('matches the component', () => {
    const qf = readFileSync(join(REPO_ROOT, 'src/components/QuickFacts.astro'), 'utf8');
    expect(qf).toContain(PRICE_DISCLAIMER);
    expect(PRICE_DISCLAIMER).toContain('your quote may be more or less');
  });
});

/* --------------------------------------------------------------- lookup */

class MemoryCache implements CacheLike {
  store = new Map<string, string>();
  async match(req: Request) {
    const t = this.store.get(req.url);
    return t === undefined ? undefined : new Response(t);
  }
  async put(req: Request, res: Response) {
    this.store.set(req.url, await res.text());
  }
}

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('zipPrice: lookup, cache and transport', () => {
  const NOW = new Date('2026-10-31T15:00:00Z');

  it('fetches once on a miss, then serves from cache with no second fetch', async () => {
    const cache = new MemoryCache();
    // Declare the FetchLike parameters so mock.calls is typed with the requested URL.
    const fetchImpl = vi.fn(async (_input: string, _init?: RequestInit) => jsonResponse(payload()));
    const first = await lookupZipPrice('43219', { cache, fetchImpl, now: () => NOW });
    expect(first.status).toBe('ok');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(String(fetchImpl.mock.calls[0][0])).toBe('https://www.freedomconex.com/api/pricing?zip=43219');

    const later = new Date(NOW.getTime() + 3600 * 1000);
    const second = await lookupZipPrice('43219', { cache, fetchImpl, now: () => later });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(second).toMatchObject({ status: 'ok', fromCache: true, maxAgeSeconds: CACHE_TTL_SECONDS - 3600 });
    if (second.status === 'ok') expect(second.result.checkedOn).toBe('2026-10-31');
  });

  it('treats an entry older than 12 hours as a miss', async () => {
    const cache = new MemoryCache();
    const fetchImpl = vi.fn(async () => jsonResponse(payload()));
    await lookupZipPrice('43219', { cache, fetchImpl, now: () => NOW });
    const stale = new Date(NOW.getTime() + (CACHE_TTL_SECONDS + 1) * 1000);
    await lookupZipPrice('43219', { cache, fetchImpl, now: () => stale });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('caches a confirmed not serviceable answer', async () => {
    const cache = new MemoryCache();
    const fetchImpl = vi.fn(async () => jsonResponse(payload('43219', { serviceable: false })));
    expect((await lookupZipPrice('43219', { cache, fetchImpl, now: () => NOW })).status).toBe('not-serviceable');
    expect((await lookupZipPrice('43219', { cache, fetchImpl, now: () => NOW })).status).toBe('not-serviceable');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('never caches a validation failure or a transport failure', async () => {
    const cache = new MemoryCache();
    const bad = vi.fn(async () => jsonResponse(payload('99999')));
    expect(await lookupZipPrice('43219', { cache, fetchImpl: bad, now: () => NOW })).toEqual({
      status: 'error',
      reason: 'zip-echo',
    });
    const down = vi.fn(async () => jsonResponse({}, 503));
    expect(await lookupZipPrice('43219', { cache, fetchImpl: down, now: () => NOW })).toEqual({
      status: 'error',
      reason: 'transport',
    });
    const garbage = vi.fn(async () => new Response('<html>'));
    expect((await lookupZipPrice('43219', { cache, fetchImpl: garbage, now: () => NOW })).status).toBe('error');
    expect(cache.store.size).toBe(0);
  });

  it('aborts after the timeout and reports it', async () => {
    expect(UPSTREAM_TIMEOUT_MS).toBe(4000);
    const hang = vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_, reject) => {
          init?.signal?.addEventListener('abort', () => {
            const e = new Error('aborted');
            e.name = 'AbortError';
            reject(e);
          });
        }),
    );
    const out = await lookupZipPrice('43219', { fetchImpl: hang, timeoutMs: 20, now: () => NOW });
    expect(out).toEqual({ status: 'error', reason: 'timeout' });
  });

  it('works with no cache at all, which is the dev path', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(payload()));
    expect((await lookupZipPrice('43219', { cache: null, fetchImpl, now: () => NOW })).status).toBe('ok');
  });

  it('treats a throwing cache as a miss, never an error', async () => {
    const broken: CacheLike = {
      match: async () => {
        throw new Error('no cache here');
      },
      put: async () => {
        throw new Error('no cache here');
      },
    };
    const fetchImpl = vi.fn(async () => jsonResponse(payload()));
    expect((await lookupZipPrice('43219', { cache: broken, fetchImpl, now: () => NOW })).status).toBe('ok');
  });

  it('rejects a tampered or mismatched cache entry', () => {
    const nowMs = NOW.getTime();
    const good = {
      v: CACHE_VERSION,
      kind: 'ok',
      storedAt: nowMs,
      result: { zip: '43219', checkedOn: '2026-10-31', lines: [{ sku: '20ftCargo', delivered: 2090, pickup: null, pickupMiles: null }], unavailable: [] },
    };
    expect(parseStored(JSON.stringify(good), '43219', nowMs)).not.toBeNull();
    expect(parseStored(JSON.stringify(good), '43215', nowMs)).toBeNull();
    const bad = { ...good, result: { ...good.result, lines: [{ sku: '20ftCargo', delivered: 99, pickup: null, pickupMiles: null }] } };
    expect(parseStored(JSON.stringify(bad), '43219', nowMs)).toBeNull();
    expect(parseStored('not json', '43219', nowMs)).toBeNull();
    expect(parseStored(JSON.stringify({ ...good, v: 0 }), '43219', nowMs)).toBeNull();
  });

  it('keys the cache by ZIP only', () => {
    expect(cacheKey('43219').url).toBe(`https://steelboxdirect.com/__zip-price-cache/v${CACHE_VERSION}/43219`);
  });

  it('is on cache version 2 or later, so answers cached before the first guard are orphaned', () => {
    expect(CACHE_VERSION).toBeGreaterThanOrEqual(2);
  });

  it('reads caches.default from the runtime when present and null otherwise', () => {
    const c = new MemoryCache();
    expect(cacheFromRuntime({ caches: { default: c } })).toBe(c);
    expect(cacheFromRuntime(undefined)).toBeNull();
    expect(cacheFromRuntime({ caches: {} })).toBeNull();
  });
});

/* ------------------------------------------------------------- sanity check */

// 2026-11-13, owner decision option A: the feed is trusted. The committed metro ceiling, which
// withheld a live figure more than twenty percent off its nearest metro, is gone. A live figure is
// withheld only when it fails the shared sanity check against the median committed figure for its
// size across every metro.

// A payload whose WWT rows deliver exactly the given figures. delivered = unit + 500, and every
// figure below is a multiple of ten, so rounding cannot move it.
function payloadDelivering(zip: string, d20: number, d40: number, d40hc: number) {
  return payload(zip, {
    byKey: {
      'used:20-std': row('20-std', d20 - 500, 500),
      'used:40-std': row('40-std', d40 - 500, 500),
      'used:40-hc': row('40-hc', d40hc - 500, 500),
    },
  });
}

// Fixture medians, injected so these tests do not move when the daily harvest commits a new figure.
const MEDIANS: SizeMedians = { '20ftCargo': 1950, '40ftStandard': 2300, '40ftStandardHC': 2370 };

describe('zipPrice: medians come from the committed module', () => {
  it('has a positive median for every size, read from geoPricing, never a typed number', () => {
    const m = deliveredMedians();
    for (const sku of ZIP_SKUS) {
      expect(typeof m[sku], sku).toBe('number');
      expect(m[sku] as number).toBeGreaterThan(0);
    }
    expect(deliveredMedians(geoPricing)).toEqual(m);
  });

  it('the nearest metro mapping and its coordinate table are gone', async () => {
    const mod = (await import('./zipPrice')) as Record<string, unknown>;
    for (const name of ['applyCommittedCeiling', 'committedMetroForZip', 'prefixAssignment', 'GUARD_RADIUS_MILES', 'haversineMiles']) {
      expect(mod[name], name).toBeUndefined();
    }
    const src = readFileSync(join(REPO_ROOT, 'src/lib/pricing/zipPrice.ts'), 'utf8');
    expect(src).not.toMatch(/zipPrefixCenters|wrong yard/i);
  });
});

describe('zipPrice: the feed is trusted, and only an insane figure is withheld', () => {
  const NOW = new Date('2026-11-13T15:00:00Z');
  const figures = (out: Awaited<ReturnType<typeof lookupZipPrice>>) =>
    out.status === 'ok' ? Object.fromEntries(out.result.lines.map((l) => [l.sku, l.delivered])) : null;

  // Live feed figures on 2026-11-04 that the old twenty percent guard withheld. Each is now shown.
  it.each([
    ['40205', 2560, 2950, 3050],
    ['40502', 2470, 2860, 2960],
    ['40047', 2640, 3030, 3130],
    ['40356', 2540, 2930, 3030],
    ['46218', 1910, 2340, 2880],
    ['46032', 2000, 2610, 2940],
  ] as const)('%s: a figure from a farther yard is shown on every size', async (zip, d20, d40, d40hc) => {
    const fetchImpl = vi.fn(async () => jsonResponse(payloadDelivering(zip, d20, d40, d40hc)));
    const out = await lookupZipPrice(zip, { fetchImpl, now: () => NOW, medians: MEDIANS });
    expect(figures(out)).toEqual({ '20ftCargo': d20, '40ftStandard': d40, '40ftStandardHC': d40hc });
    if (out.status === 'ok') expect(out.withheld).toEqual([]);
  });

  it('withholds a size more than three times its median, and only that size', async () => {
    // Inside the absolute bounds, so only the sanity check can catch it.
    const fetchImpl = vi.fn(async () => jsonResponse(payloadDelivering('40205', 5900, 2950, 3050)));
    const out = await lookupZipPrice('40205', { fetchImpl, now: () => NOW, medians: MEDIANS });
    expect(figures(out)).toEqual({ '40ftStandard': 2950, '40ftStandardHC': 3050 });
    if (out.status === 'ok') expect(out.withheld).toEqual(['20ftCargo']);
  });

  it('withholds a size under a third of its median', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(payloadDelivering('43215', 1940, 2320, 2430)));
    const out = await lookupZipPrice('43215', {
      fetchImpl,
      now: () => NOW,
      medians: { ...MEDIANS, '40ftStandardHC': 7400 },
    });
    expect(figures(out)).toEqual({ '20ftCargo': 1940, '40ftStandard': 2320 });
    if (out.status === 'ok') expect(out.withheld).toEqual(['40ftStandardHC']);
  });

  it('checks a cache hit as well as a fresh answer', async () => {
    const cache = new MemoryCache();
    const fetchImpl = vi.fn(async () => jsonResponse(payloadDelivering('40205', 5900, 2340, 2370)));
    await lookupZipPrice('40205', { cache, fetchImpl, now: () => NOW, medians: MEDIANS });
    const hit = await lookupZipPrice('40205', { cache, fetchImpl, now: () => NOW, medians: MEDIANS });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(hit).toMatchObject({ status: 'ok', fromCache: true, withheld: ['20ftCargo'] });
    expect(figures(hit)).toEqual({ '40ftStandard': 2340, '40ftStandardHC': 2370 });
  });

  it('defaults to the committed medians when none are injected', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(payloadDelivering('40205', 2560, 2950, 3050)));
    const out = await lookupZipPrice('40205', { fetchImpl, now: () => NOW });
    expect(figures(out)).toEqual({ '20ftCargo': 2560, '40ftStandard': 2950, '40ftStandardHC': 3050 });
  });

  it('applySanityCheck is pure and never substitutes another figure for a withheld one', () => {
    const result = {
      zip: '40205',
      checkedOn: '2026-11-13',
      lines: [
        { sku: '20ftCargo' as const, delivered: 5900, pickup: 2100, pickupMiles: 120 },
        { sku: '40ftStandard' as const, delivered: 2950, pickup: null, pickupMiles: null },
      ],
      unavailable: [],
    };
    const copy = JSON.parse(JSON.stringify(result));
    const out = applySanityCheck(result, MEDIANS);
    expect(result).toEqual(copy);
    expect(out.result.lines.map((l) => l.sku)).toEqual(['40ftStandard']);
    expect(out.withheld).toEqual(['20ftCargo']);
    expect(JSON.stringify(out)).not.toContain('1950');
  });

  it('with no median for a size, only the finite and positive check applies', () => {
    const result = {
      zip: '40205',
      checkedOn: '2026-11-13',
      lines: [{ sku: '20ftCargo' as const, delivered: 5900, pickup: null, pickupMiles: null }],
      unavailable: [],
    };
    expect(applySanityCheck(result, { '20ftCargo': null }).withheld).toEqual([]);
  });
});

describe('zipPrice: result heading', () => {
  it('reads Prices delivered to ZIP only when at least one price is shown', () => {
    expect(resultHeading('45202', 3)).toBe('Prices delivered to 45202');
    expect(resultHeading('45202', 1)).toBe('Prices delivered to 45202');
  });

  it('reads Delivery to ZIP when every size is withheld or unavailable', () => {
    expect(resultHeading('40047', 0)).toBe('Delivery to 40047');
  });
});
