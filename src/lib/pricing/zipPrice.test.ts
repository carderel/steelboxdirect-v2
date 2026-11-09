// Unit tests for src/lib/pricing/zipPrice.ts, the live per ZIP lookup behind /price/. Fixtures only,
// no network. No em dash and no en dash in this file.
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CACHE_TTL_SECONDS,
  CACHE_VERSION,
  applyCommittedCeiling,
  committedMetroForZip,
  GUARD_RADIUS_MILES,
  prefixAssignment,
  SERVICE_PREFIXES,
  ZIP_SKUS,
  resultHeading,
  type CommittedMetro,
  type ZipSku,
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
import { geoCentroids } from '../../data/geoCentroids';
import { geoPricing } from '../../data/geoPricing';
import { CENTROID_POINTS } from '../../data/zipPrefixCenters';

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

  it('is on cache version 2 or later, so answers cached before the committed ceiling guard are orphaned', () => {
    expect(CACHE_VERSION).toBeGreaterThanOrEqual(2);
  });

  it('reads caches.default from the runtime when present and null otherwise', () => {
    const c = new MemoryCache();
    expect(cacheFromRuntime({ caches: { default: c } })).toBe(c);
    expect(cacheFromRuntime(undefined)).toBeNull();
    expect(cacheFromRuntime({ caches: {} })).toBeNull();
  });
});

/* ------------------------------------------------- committed metro ceiling (T-234) */

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

// Fixture committed figures, the values in src/data/geoPricing.ts on 2026-11-04. Injected so these
// tests do not move when the daily harvest commits a new figure.
const COMMITTED: Record<string, CommittedMetro> = {
  louisville: { slug: 'louisville-shipping-containers', zip: '40205', delivered: { '20ftCargo': 2050, '40ftStandard': 2340, '40ftStandardHC': 2370 } },
  lexington: { slug: 'lexington-shipping-containers', zip: '40502', delivered: { '20ftCargo': 1960, '40ftStandard': 2250, '40ftStandardHC': 2320 } },
  indianapolis: { slug: 'indianapolis-shipping-containers', zip: '46218', delivered: { '20ftCargo': 1910, '40ftStandard': 2340, '40ftStandardHC': 2380 } },
  cincinnati: { slug: 'cincinnati-shipping-containers', zip: '45237', delivered: { '20ftCargo': 1950, '40ftStandard': 2250, '40ftStandardHC': 2320 } },
};
const BY_PREFIX: Record<string, CommittedMetro> = {
  '402': COMMITTED.louisville,
  '405': COMMITTED.lexington,
  '462': COMMITTED.indianapolis,
  '452': COMMITTED.cincinnati,
};
const committedFor = (zip: string) => BY_PREFIX[zip.slice(0, 3)] ?? null;

describe('zipPrice: which committed metro a ZIP is checked against', () => {
  it('maps a centroid ZIP to its own metro', () => {
    expect(committedMetroForZip('40205')?.slug).toBe('louisville-shipping-containers');
    expect(committedMetroForZip('40502')?.slug).toBe('lexington-shipping-containers');
    expect(committedMetroForZip('46218')?.slug).toBe('indianapolis-shipping-containers');
  });

  // T-234 gap, found live 2026-11-04: these suburbs sit in a prefix next to the centroid prefix, so
  // the old same prefix rule left them unguarded. Each must map to its NEAREST metro centroid.
  it.each([
    ['40047', 'louisville-shipping-containers'],
    ['40014', 'louisville-shipping-containers'],
    ['40207', 'louisville-shipping-containers'],
    ['40356', 'lexington-shipping-containers'],
    ['40383', 'lexington-shipping-containers'],
    ['46032', 'indianapolis-shipping-containers'],
    ['46143', 'indianapolis-shipping-containers'],
    ['45202', 'cincinnati-shipping-containers'],
    ['45040', 'cincinnati-shipping-containers'],
    ['45420', 'dayton-shipping-containers'],
    ['43081', 'columbus-shipping-containers'],
    ['43215', 'columbus-shipping-containers'],
    ['43001', 'columbus-shipping-containers'],
  ])('maps %s to its nearest committed metro, %s', (zip, slug) => {
    expect(committedMetroForZip(zip)?.slug).toBe(slug);
  });

  it('maps nothing beyond the guard radius, so a far ZIP behaves exactly as before', () => {
    expect(GUARD_RADIUS_MILES).toBe(120);
    // Paducah KY, Morgantown WV, Martinsburg WV: every prefix center is over 120 miles from any centroid.
    expect(committedMetroForZip('42001')).toBeNull();
    expect(committedMetroForZip('26501')).toBeNull();
    expect(committedMetroForZip('25401')).toBeNull();
  });

  it('maps nothing for a served prefix with no 2020 ZCTA', () => {
    expect(committedMetroForZip('45999')).toBeNull();
    expect(committedMetroForZip('41999')).toBeNull();
  });

  it('every served prefix maps to a metro within the radius or is explicitly unguarded with a reason', () => {
    const seen: string[] = [];
    for (const r of SERVICE_PREFIXES) {
      for (let p = r.lo; p <= r.hi; p++) {
        const prefix = String(p).padStart(3, '0');
        const a = prefixAssignment(prefix);
        seen.push(prefix);
        if (a.slug) {
          expect(a.miles).toBeLessThanOrEqual(GUARD_RADIUS_MILES);
          expect(geoCentroids.some((c) => c.slug === a.slug)).toBe(true);
        } else {
          expect(a.reason, `prefix ${prefix}`).toMatch(/\S/);
        }
      }
    }
    expect(seen).toHaveLength(100);
    // The far prefixes, named, so widening or narrowing the radius is a visible diff here.
    const unguarded = seen.filter((p) => !prefixAssignment(p).slug);
    expect(unguarded).toEqual(['459', '463', '464', '466', '419', '420', '254', '262', '263', '264', '265', '267', '268']);
  });

  it('every centroid ZIP has a point and maps to its own metro', () => {
    for (const c of geoCentroids) {
      expect(CENTROID_POINTS[c.zip], c.slug).toBeDefined();
      if (geoPricing[c.slug]) expect(committedMetroForZip(c.zip)?.slug).toBe(c.slug);
    }
  });

  it('a centroid prefix maps to its own metro', () => {
    expect(prefixAssignment('402').slug).toBe('louisville-shipping-containers');
    expect(prefixAssignment('405').slug).toBe('lexington-shipping-containers');
    expect(prefixAssignment('462').slug).toBe('indianapolis-shipping-containers');
    expect(prefixAssignment('452').slug).toBe('cincinnati-shipping-containers');
    expect(prefixAssignment('454').slug).toBe('dayton-shipping-containers');
    expect(prefixAssignment('432').slug).toBe('columbus-shipping-containers');
    expect(prefixAssignment('257').slug).toBe('huntington-shipping-containers');
  });

  it('reads committed delivered figures from geoPricing, never a typed number', () => {
    const m = committedMetroForZip('40205');
    expect(m?.zip).toBe('40205');
    for (const v of Object.values(m?.delivered ?? {})) expect(typeof v).toBe('number');
  });

  it('skips a committed size that is not available, so it is never guarded against', () => {
    const centroids = [{ slug: 'x-shipping-containers', zip: '45237', publish: true, nationalBasis: true }];
    const pricing = {
      'x-shipping-containers': {
        zip: '45237',
        skus: {
          '20ftCargo': { delivered: 1950, pickup: null, pickupDistanceMiles: null, available: false, effectiveSince: '2026-10-01' },
          '40ftStandard': { delivered: 2250, pickup: null, pickupDistanceMiles: null, available: true, effectiveSince: '2026-10-01' },
          '40ftStandardHC': { delivered: 2320, pickup: null, pickupDistanceMiles: null, available: true, effectiveSince: '2026-10-01' },
        },
      },
    };
    const m = committedMetroForZip('45202', centroids, pricing);
    expect(m?.delivered).toEqual({ '40ftStandard': 2250, '40ftStandardHC': 2320 });
  });

  it('a prefix whose nearest centroid has no committed record maps nothing, never the next nearest', () => {
    const centroids = [
      { slug: 'near-shipping-containers', zip: '40205', publish: true, nationalBasis: true },
      { slug: 'far-shipping-containers', zip: '40502', publish: true, nationalBasis: true },
    ];
    const rec = { zip: '40502', skus: { '40ftStandard': { delivered: 2250, pickup: null, pickupDistanceMiles: null, available: true, effectiveSince: '2026-10-01' } } } as never;
    expect(committedMetroForZip('40047', centroids, { 'far-shipping-containers': rec })).toBeNull();
  });

  it('maps nothing for a centroid with no committed record', () => {
    const centroids = [{ slug: 'x-shipping-containers', zip: '45237', publish: true, nationalBasis: true }];
    expect(committedMetroForZip('45202', centroids, {})).toBeNull();
  });
});

describe('zipPrice: a live figure more than twenty percent off the committed metro figure is withheld', () => {
  const NOW = new Date('2026-11-04T15:00:00Z');
  const figures = (out: Awaited<ReturnType<typeof lookupZipPrice>>) =>
    out.status === 'ok' ? Object.fromEntries(out.result.lines.map((l) => [l.sku, l.delivered])) : null;

  it('Louisville 40205: every size jumped more than twenty percent, so no figure is shown', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(payloadDelivering('40205', 2560, 2950, 3050)));
    const out = await lookupZipPrice('40205', { fetchImpl, now: () => NOW, committedFor });
    expect(out.status).toBe('ok');
    if (out.status !== 'ok') return;
    expect(out.result.lines).toEqual([]);
    expect(out.withheld).toEqual(['20ftCargo', '40ftStandard', '40ftStandardHC']);
    expect(out.result.unavailable).toEqual([]);
  });

  it('Lexington 40502: every size withheld', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(payloadDelivering('40502', 2470, 2860, 2960)));
    const out = await lookupZipPrice('40502', { fetchImpl, now: () => NOW, committedFor });
    expect(figures(out)).toEqual({});
    if (out.status === 'ok') expect(out.withheld).toHaveLength(3);
  });

  it('Indianapolis 46218: only the 40ft high cube is withheld, the other sizes still show', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(payloadDelivering('46218', 1910, 2340, 2880)));
    const out = await lookupZipPrice('46218', { fetchImpl, now: () => NOW, committedFor });
    expect(figures(out)).toEqual({ '20ftCargo': 1910, '40ftStandard': 2340 });
    if (out.status === 'ok') expect(out.withheld).toEqual(['40ftStandardHC']);
  });

  it('Cincinnati 45202: within the ceiling on every size, so all three show', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(payloadDelivering('45202', 1980, 2370, 2470)));
    const out = await lookupZipPrice('45202', { fetchImpl, now: () => NOW, committedFor });
    expect(figures(out)).toEqual({ '20ftCargo': 1980, '40ftStandard': 2370, '40ftStandardHC': 2470 });
    if (out.status === 'ok') expect(out.withheld).toEqual([]);
  });

  it('an unmapped ZIP is unchanged, whatever the figure', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(payloadDelivering('47901', 2560, 2950, 3050)));
    const out = await lookupZipPrice('47901', { fetchImpl, now: () => NOW, committedFor });
    expect(figures(out)).toEqual({ '20ftCargo': 2560, '40ftStandard': 2950, '40ftStandardHC': 3050 });
    if (out.status === 'ok') expect(out.withheld).toEqual([]);
  });

  it('guards a drop of more than twenty percent too, matching the harvest', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(payloadDelivering('40205', 1500, 2340, 2370)));
    const out = await lookupZipPrice('40205', { fetchImpl, now: () => NOW, committedFor });
    expect(figures(out)).toEqual({ '40ftStandard': 2340, '40ftStandardHC': 2370 });
    if (out.status === 'ok') expect(out.withheld).toEqual(['20ftCargo']);
  });

  it('guards a cache hit as well as a fresh answer', async () => {
    const cache = new MemoryCache();
    const fetchImpl = vi.fn(async () => jsonResponse(payloadDelivering('40205', 2560, 2340, 2370)));
    await lookupZipPrice('40205', { cache, fetchImpl, now: () => NOW, committedFor });
    const hit = await lookupZipPrice('40205', { cache, fetchImpl, now: () => NOW, committedFor });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(hit).toMatchObject({ status: 'ok', fromCache: true, withheld: ['20ftCargo'] });
    expect(figures(hit)).toEqual({ '40ftStandard': 2340, '40ftStandardHC': 2370 });
  });

  // T-234 gap. The real ZIP to metro mapping, with the fixture committed figures above, so the test
  // checks the nearest centroid rule end to end without moving when the harvest commits.
  const FIXTURE_BY_SLUG: Record<string, CommittedMetro> = Object.fromEntries(
    Object.values(COMMITTED).map((m) => [m.slug, m]),
  );
  FIXTURE_BY_SLUG['dayton-shipping-containers'] = { slug: 'dayton-shipping-containers', zip: '45404', delivered: { '20ftCargo': 1940, '40ftStandard': 2250, '40ftStandardHC': 2320 } };
  FIXTURE_BY_SLUG['columbus-shipping-containers'] = { slug: 'columbus-shipping-containers', zip: '43219', delivered: { '20ftCargo': 1940, '40ftStandard': 2300, '40ftStandardHC': 2370 } };
  const realMapping = (zip: string) => {
    const slug = committedMetroForZip(zip)?.slug;
    return slug ? FIXTURE_BY_SLUG[slug] ?? null : null;
  };

  // Live feed figures for these ZIPs on 2026-11-04, routed through a yard that does not serve them.
  // 40014 20ft sits at exactly twenty percent over the committed Louisville figure, which the
  // unchanged MOVE_CEILING admits, so only its two 40ft sizes are withheld. Indianapolis suburbs are
  // wrong on the high cube only, as at the centroid.
  it.each([
    ['40047', 2640, 3030, 3130, ['20ftCargo', '40ftStandard', '40ftStandardHC']],
    ['40014', 2460, 2850, 2950, ['40ftStandard', '40ftStandardHC']],
    ['40356', 2540, 2930, 3030, ['20ftCargo', '40ftStandard', '40ftStandardHC']],
    ['40383', 2520, 2910, 3010, ['20ftCargo', '40ftStandard', '40ftStandardHC']],
    ['46032', 2000, 2610, 2940, ['40ftStandardHC']],
    ['46143', 2000, 2730, 2970, ['40ftStandardHC']],
  ] as const)('%s: the inflated wrong yard figures are withheld', async (zip, d20, d40, d40hc, withheld) => {
    const fetchImpl = vi.fn(async () => jsonResponse(payloadDelivering(zip, d20, d40, d40hc)));
    const out = await lookupZipPrice(zip, { fetchImpl, now: () => NOW, committedFor: realMapping });
    expect(out.status).toBe('ok');
    if (out.status !== 'ok') return;
    expect(out.withheld).toEqual(withheld);
    const shown = out.result.lines.map((l) => l.delivered);
    // Widen the const tuple so includes() accepts any ZipSku.
    const withheldSkus: readonly ZipSku[] = withheld;
    for (const inflated of [d20, d40, d40hc].filter((_, i) => withheldSkus.includes(ZIP_SKUS[i]))) {
      expect(shown).not.toContain(inflated);
    }
  });

  // Live feed figures on 2026-11-04 for correctly routed Cincinnati, Dayton and Columbus ZIPs.
  it.each([
    ['45202', 1980, 2370, 2470],
    ['45040', 1940, 2320, 2430],
    ['45420', 1940, 2320, 2430],
    ['43081', 1940, 2320, 2430],
    ['43215', 1940, 2320, 2430],
  ] as const)('%s: a correct price inside the ceiling stays visible on every size', async (zip, d20, d40, d40hc) => {
    const fetchImpl = vi.fn(async () => jsonResponse(payloadDelivering(zip, d20, d40, d40hc)));
    const out = await lookupZipPrice(zip, { fetchImpl, now: () => NOW, committedFor: realMapping });
    expect(figures(out)).toEqual({ '20ftCargo': d20, '40ftStandard': d40, '40ftStandardHC': d40hc });
    if (out.status === 'ok') expect(out.withheld).toEqual([]);
  });

  it('a far ZIP outside the radius is unchanged by the real mapping, whatever the figure', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(payloadDelivering('42001', 2560, 2950, 3050)));
    const out = await lookupZipPrice('42001', { fetchImpl, now: () => NOW, committedFor: realMapping });
    expect(figures(out)).toEqual({ '20ftCargo': 2560, '40ftStandard': 2950, '40ftStandardHC': 3050 });
    if (out.status === 'ok') expect(out.withheld).toEqual([]);
  });

  it('applyCommittedCeiling never substitutes the committed figure for a withheld one', () => {
    const result = {
      zip: '40205',
      checkedOn: '2026-11-04',
      lines: [{ sku: '20ftCargo' as const, delivered: 2560, pickup: 2100, pickupMiles: 120 }],
      unavailable: [],
    };
    const out = applyCommittedCeiling(result, COMMITTED.louisville);
    expect(out.result.lines).toEqual([]);
    expect(out.withheld).toEqual(['20ftCargo']);
    expect(JSON.stringify(out)).not.toContain('2050');
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
