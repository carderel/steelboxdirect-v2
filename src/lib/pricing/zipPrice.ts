// src/lib/pricing/zipPrice.ts
//
// The live per ZIP price lookup behind /price/. Owner approved 2026-10-31, including a live call to
// the pricing endpoint per visitor, cached and rate limited.
//
// WHAT IS SHARED AND WHAT IS NOT. The arithmetic, the field that is summed, the bounds and the grade
// filter are imported from src/lib/pricing/feedRow.mjs, the same module the daily harvest uses, so
// this page and the city pages cannot disagree about how a delivered figure is built. What is added
// here is only what a single live request needs: a ZIP shape check, a service area prefix check, a
// guess from the visitor location, a validator that fails closed per request, an allowlist that keeps
// every feed identifier out of the result, a 4 second timeout, and a 12 hour cache.
//
// FAIL CLOSED. Any failed check on a size the feed says is available throws the whole result away.
// A page never shows a partial or unvalidated price. A size the feed reports as unavailable is left
// out and named as unavailable, the same rule the city pages follow.
//
// NEVER OUTPUT. The supplier name, the driver and location identifiers, the yard name, and the lower
// min of two field. The result type below is the allowlist: numbers, one ZIP, one date.
//
// No em dash and no en dash anywhere in this file, and no apostrophes in comments.

import {
  ENDPOINT,
  SKU_KEYS,
  SIZE_ID_BY_SKU,
  UNIT_PRICE_BASIS,
  DASHES,
  PRINTABLE_ASCII,
  SUPPLIER,
  UUID,
  isFiniteNumber,
  deliveredPrice,
  pickupFigure,
  selectWwt,
  rowForSize,
  withinBounds,
  pickupWithinBounds,
  moveWithinCeiling,
} from './feedRow.mjs';
import { geoCentroids, type MetroCentroid } from '../../data/geoCentroids';
import { geoPricing, type GeoMetroPricing } from '../../data/geoPricing';
import { CENTROID_POINTS, PREFIX_CENTERS, PREFIXES_WITHOUT_ZCTA } from '../../data/zipPrefixCenters';

export type ZipSku = '20ftCargo' | '40ftStandard' | '40ftStandardHC';

/** Render order, read from the shared module so a fourth SKU cannot be priced in one place only. */
export const ZIP_SKUS = SKU_KEYS as ZipSku[];

/** The size query parameter values the form submits, mapped to SKU keys. */
export const SIZE_PARAM: Record<string, ZipSku> = {
  '20': '20ftCargo',
  '40': '40ftStandard',
  '40hc': '40ftStandardHC',
};

/** Display wording per size, the same words the city page price lines use. */
export const SIZE_LABEL: Record<ZipSku, string> = {
  '20ftCargo': '20ft',
  '40ftStandard': '40ft standard',
  '40ftStandardHC': '40ft high cube',
};

/** The product page for each size, matching the city page links. */
export const SIZE_PAGE: Record<ZipSku, string> = {
  '20ftCargo': '/shipping-containers-for-sale/20-foot-shipping-container/',
  '40ftStandard': '/shipping-containers-for-sale/40-foot-shipping-container/',
  '40ftStandardHC': '/shipping-containers-for-sale/40-foot-high-cube-container/',
};

/**
 * The disclaimer, word for word as src/components/QuickFacts.astro renders it. Copied rather than
 * reworded, and zipPrice.test.ts asserts the component still carries this exact sentence, so the two
 * cannot drift apart.
 */
export const PRICE_DISCLAIMER = 'Prices shown are average starting prices; your quote may be more or less.';

/** Per request timeout on the upstream call. */
export const UPSTREAM_TIMEOUT_MS = 4000;

/** How long a validated per ZIP result is reused, in seconds. 12 hours. */
export const CACHE_TTL_SECONDS = 12 * 60 * 60;

/**
 * Bump to orphan every cached entry after a shape change. 2 since 2026-11-04 (T-234): entries written
 * before the committed metro ceiling existed are orphaned so none of them is read again.
 */
export const CACHE_VERSION = 2;

export const ZIP_USER_AGENT =
  'SteelBoxDirect-ZipPrice/1.0 (+https://steelboxdirect.com/price/; per visitor price lookup)';

/* ---------------------------------------------------------------- ZIP checks */

/** A 5 digit ZIP from user input, or null. Trims whitespace and nothing else. */
export function normalizeZip(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const zip = raw.trim();
  return /^[0-9]{5}$/.test(zip) ? zip : null;
}

/**
 * The instant price service area by the first three digits of the ZIP, inclusive. Ohio 430 to 459,
 * Indiana 460 to 479, Kentucky 400 to 427, West Virginia 247 to 268.
 */
export const SERVICE_PREFIXES: ReadonlyArray<{ state: string; lo: number; hi: number }> = [
  { state: 'Ohio', lo: 430, hi: 459 },
  { state: 'Indiana', lo: 460, hi: 479 },
  { state: 'Kentucky', lo: 400, hi: 427 },
  { state: 'West Virginia', lo: 247, hi: 268 },
];

/** The state whose prefix range covers this ZIP, or null when it is outside the service area. */
export function serviceState(zip: string): string | null {
  if (!/^[0-9]{5}$/.test(zip)) return null;
  const prefix = Number(zip.slice(0, 3));
  const hit = SERVICE_PREFIXES.find((r) => prefix >= r.lo && prefix <= r.hi);
  return hit ? hit.state : null;
}

/**
 * A best guess ZIP from the request location object Cloudflare attaches to each request. Returns a
 * ZIP only when the country is US, the postal code is exactly 5 digits, and the ZIP is inside the
 * service area. Everything else returns null, which renders the plain form with no location message.
 * That null path is what crawlers see, since they arrive from data centers outside the area.
 *
 * The country check is stricter than the brief on purpose: several countries also use 5 digit postal
 * codes, and one of them falling inside an Ohio prefix would price a stranger in Essen as Columbus.
 *
 * The value is never logged or stored by this function or its caller.
 */
export function guessZipFromCf(cf: unknown): string | null {
  if (!cf || typeof cf !== 'object') return null;
  const { country, postalCode } = cf as { country?: unknown; postalCode?: unknown };
  if (country !== 'US') return null;
  if (typeof postalCode !== 'string' || !/^[0-9]{5}$/.test(postalCode)) return null;
  return serviceState(postalCode) ? postalCode : null;
}

/**
 * The result heading. It promises prices only when at least one is on the page. When every size is
 * withheld or unavailable it names the delivery ZIP and nothing more.
 */
export function resultHeading(zip: string, shownCount: number): string {
  return shownCount > 0 ? `Prices delivered to ${zip}` : `Delivery to ${zip}`;
}

/* ------------------------------------------------------------------- dates */

/** ISO calendar date of an instant in America/New_York. */
export function easternIsoDate(now: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/** October 31, 2026 from 2026-10-31. Formatted in UTC so the calendar date is never shifted. */
export function dateLabel(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/* --------------------------------------------------------------- validation */

/** One priced size. These four fields are the whole allowlist of what leaves the feed. */
export interface ZipPriceLine {
  sku: ZipSku;
  delivered: number;
  pickup: number | null;
  pickupMiles: number | null;
}

export interface ZipPriceResult {
  zip: string;
  /** ISO date, America/New_York, of the moment the feed answered. Rendered as the check date. */
  checkedOn: string;
  lines: ZipPriceLine[];
  /** Sizes the feed reported as not available at this ZIP. */
  unavailable: ZipSku[];
}

export type ValidationFailure =
  | 'shape'
  | 'zip-echo'
  | 'not-serviceable'
  | 'grade-filter'
  | 'unit-and-delivery-finite'
  | 'delivered-bounds'
  | 'hygiene';

export type Validation =
  | { ok: true; result: ZipPriceResult }
  | { ok: false; reason: ValidationFailure };

/**
 * Copies the allowlisted fields of one row into a price line. Reads the delivery unit price, the
 * base delivery cost, the pickup unit price and the pickup distance, and nothing else, so an
 * identifier or a name on the row has no path into the output.
 */
export function toPriceLine(sku: ZipSku, row: Record<string, unknown>): ZipPriceLine | null {
  const unit = row[UNIT_PRICE_BASIS];
  const delivery = row.baseDeliveryCost;
  if (!isFiniteNumber(unit) || (unit as number) <= 0 || !isFiniteNumber(delivery) || (delivery as number) < 0) {
    return null;
  }
  const delivered = deliveredPrice(row) as number;
  if (!withinBounds(delivered)) return null;
  // Pickup is shown only when the feed says pickup is offered for this row. False or missing omits it.
  let pickup = row.pickupAvailable === true ? (pickupFigure(row) as number | null) : null;
  // Same trade the harvest makes: a bad pickup figure is withheld, never the delivered price.
  if (pickup !== null && !pickupWithinBounds(pickup)) pickup = null;
  const rawMiles = row.pickupDistanceMiles;
  const pickupMiles =
    pickup !== null && isFiniteNumber(rawMiles) && (rawMiles as number) >= 0 && (rawMiles as number) <= 3000
      ? Math.round(rawMiles as number)
      : null;
  return { sku, delivered, pickup, pickupMiles };
}

/** True when a serialised result carries nothing it should not: ASCII only, no ids, no name, no dash. */
export function resultIsClean(result: ZipPriceResult): boolean {
  const text = JSON.stringify(result);
  return PRINTABLE_ASCII.test(text) && !DASHES.test(text) && !UUID.test(text) && !SUPPLIER.test(text);
}

/**
 * Validates one live payload for one requested ZIP. Fails closed: any failed check on an available
 * size rejects the whole payload. The not-serviceable reason is reported only once the echo matches,
 * so a reply about some other ZIP can never be read as an answer about this one.
 */
export function validateZipPayload(payload: unknown, zip: string, checkedOn: string): Validation {
  if (!payload || typeof payload !== 'object') return { ok: false, reason: 'shape' };
  const p = payload as { zip?: unknown; serviceable?: unknown };
  if (p.zip !== zip) return { ok: false, reason: 'zip-echo' };
  if (p.serviceable !== true) return { ok: false, reason: 'not-serviceable' };

  const rows = selectWwt(payload) as Record<string, unknown>[];
  if (rows.length === 0) return { ok: false, reason: 'grade-filter' };

  const lines: ZipPriceLine[] = [];
  const unavailable: ZipSku[] = [];
  for (const sku of ZIP_SKUS) {
    const row = rowForSize(rows, SIZE_ID_BY_SKU[sku]) as Record<string, unknown> | null;
    if (!row || row.available !== true || row.deliveryAvailable !== true) {
      unavailable.push(sku);
      continue;
    }
    const unit = row[UNIT_PRICE_BASIS];
    const delivery = row.baseDeliveryCost;
    if (!isFiniteNumber(unit) || (unit as number) <= 0 || !isFiniteNumber(delivery) || (delivery as number) < 0) {
      return { ok: false, reason: 'unit-and-delivery-finite' };
    }
    const line = toPriceLine(sku, row);
    if (!line) return { ok: false, reason: 'delivered-bounds' };
    lines.push(line);
  }

  const result: ZipPriceResult = { zip, checkedOn, lines, unavailable };
  if (!resultIsClean(result)) return { ok: false, reason: 'hygiene' };
  return { ok: true, result };
}

/* --------------------------------------------------- committed metro ceiling */

// WHY THIS EXISTS (T-234, 2026-11-04). The feed began routing delivery for some metros through a yard
// that does not serve them, which inflated live delivered figures by twenty percent and more. The
// daily harvest already refuses to commit a figure that moved more than MOVE_CEILING from the
// committed one. This applies the same rule, with the same function, to the live per ZIP answer: a
// size whose live delivered figure is more than MOVE_CEILING away, in either direction, from the
// committed figure of the metro the ZIP belongs to is withheld, and the page sends the visitor to the
// quote form for it. The committed figure is NEVER shown in its place, because it is priced for the
// centroid ZIP of that metro, not for the ZIP the visitor typed.
//
// WHICH METRO A ZIP BELONGS TO, revised 2026-11-04 (T-234 gap). A ZIP that equals a centroid belongs
// to that metro. Otherwise its three digit prefix belongs to the metro centroid NEAREST the center of
// that prefix, by great circle distance, when that centroid is within GUARD_RADIUS_MILES. The first
// version matched only the prefix the centroid itself sits in, which left suburbs one prefix over
// (40047 Mount Washington, 40356 Nicholasville, 46032 Carmel, 46143 Greenwood) unguarded and showing
// wrong yard figures live. Prefix centers and centroid points are Census 2020 ZCTA internal points,
// cited in src/data/zipPrefixCenters.ts. No ZIP level coordinate source exists in this repository
// and the feed returns neither coordinates nor a delivery distance, so the prefix is the unit.
//
// WHY 120 MILES. Measured 2026-11-04 by querying the live feed once per served prefix: ZIPs the feed
// routes through the right yard stay inside the ceiling well out from their metro (Fort Wayne at 107
// miles from the Indianapolis centroid moved 18 percent, Youngstown at 56 miles from Cleveland 16,
// every Cincinnati, Dayton and Columbus prefix 6 or less), so a flat ceiling does not hide correct
// far prices inside the radius. Beyond roughly 120 miles a different yard legitimately takes over
// (Chicago for Gary and South Bend, Nashville and St. Louis for western Kentucky, Baltimore for the
// eastern panhandle), and a figure from another yard cannot be judged against this metro at all.
// Beyond the radius nothing is guarded, which is the behavior before this guard existed.
//
// WHY THE CEILING DOES NOT SCALE WITH DISTANCE. The feed returns no delivery distance, only the
// distance to a pickup yard, so delivery cannot be separated from the unit price per ZIP. The same
// measurement shows correctly routed figures inside the radius fit under the flat ceiling, and a
// ceiling that widened with distance would admit exactly the wrong yard figures this exists to stop.
//
// The nearest centroid is chosen among every centroid, and a ZIP whose nearest metro has no committed
// record maps to nothing rather than to the next nearest, which would be judging it against a metro
// that does not serve it. zipPrice.test.ts asserts every served prefix maps or is named unguarded.

/** Prefix centers farther than this from every metro centroid are not guarded. See WHY 120 MILES. */
export const GUARD_RADIUS_MILES = 120;

/** Great circle distance in statute miles between two [latitude, longitude] points. */
export function haversineMiles(a: readonly [number, number], b: readonly [number, number]): number {
  const R = 3958.8;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export type PrefixAssignment =
  | { slug: string; miles: number; reason?: undefined }
  | { slug?: undefined; miles?: number; reason: string };

/** The metro centroid nearest a three digit prefix center, within the radius, or why there is none. */
export function prefixAssignment(
  prefix: string,
  centroids: ReadonlyArray<MetroCentroid> = geoCentroids,
): PrefixAssignment {
  const center = PREFIX_CENTERS[prefix];
  if (!center) return { reason: PREFIXES_WITHOUT_ZCTA[prefix] ?? 'no prefix center' };
  let best: { slug: string; miles: number } | null = null;
  for (const c of centroids) {
    const point = CENTROID_POINTS[c.zip];
    if (!point) continue;
    const miles = haversineMiles(center, point);
    if (!best || miles < best.miles) best = { slug: c.slug, miles };
  }
  if (!best) return { reason: 'no centroid point' };
  if (best.miles > GUARD_RADIUS_MILES) {
    return { miles: best.miles, reason: `nearest centroid is beyond ${GUARD_RADIUS_MILES} miles` };
  }
  return best;
}

/** The committed delivered figures of one metro, available sizes only. */
export interface CommittedMetro {
  slug: string;
  /** The centroid ZIP the committed figures were priced for. Never rendered. */
  zip: string;
  delivered: Partial<Record<ZipSku, number>>;
}

/** The metro whose committed figures a ZIP is checked against, or null when none applies. */
export function committedMetroForZip(
  zip: string,
  centroids: ReadonlyArray<MetroCentroid> = geoCentroids,
  pricing: Record<string, GeoMetroPricing> = geoPricing,
): CommittedMetro | null {
  if (!/^[0-9]{5}$/.test(zip)) return null;
  const exact = centroids.filter((c) => c.zip === zip);
  let metro: MetroCentroid | undefined;
  if (exact.length === 1) {
    metro = exact[0];
  } else if (exact.length === 0) {
    const slug = prefixAssignment(zip.slice(0, 3), centroids).slug;
    metro = slug ? centroids.find((c) => c.slug === slug) : undefined;
  }
  if (!metro) return null;
  const record = pricing[metro.slug];
  if (!record || !record.skus) return null;
  const delivered: Partial<Record<ZipSku, number>> = {};
  for (const sku of ZIP_SKUS) {
    const committed = record.skus[sku];
    if (committed && committed.available === true && withinBounds(committed.delivered)) {
      delivered[sku] = committed.delivered;
    }
  }
  return { slug: metro.slug, zip: metro.zip, delivered };
}

/**
 * Drops every line whose delivered figure is more than MOVE_CEILING away from the committed figure
 * for its size, and names those sizes as withheld. A size with no committed figure is kept as is.
 * Pure: the input result is not modified, and no committed figure is copied into the output.
 */
export function applyCommittedCeiling(
  result: ZipPriceResult,
  committed: CommittedMetro | null,
): { result: ZipPriceResult; withheld: ZipSku[] } {
  if (!committed) return { result, withheld: [] };
  const withheld: ZipSku[] = [];
  const lines = result.lines.filter((line) => {
    const previous = committed.delivered[line.sku];
    if (moveWithinCeiling(line.delivered, previous)) return true;
    withheld.push(line.sku);
    return false;
  });
  return { result: { ...result, lines }, withheld };
}

/* --------------------------------------------------------------- transport */

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

/** One upstream call, one attempt, aborted after the timeout. Throws on anything but a parsed 200. */
export async function fetchZipPayload(
  zip: string,
  { fetchImpl = fetch, timeoutMs = UPSTREAM_TIMEOUT_MS }: { fetchImpl?: FetchLike; timeoutMs?: number } = {},
): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(`${ENDPOINT}?zip=${encodeURIComponent(zip)}`, {
      headers: { 'User-Agent': ZIP_USER_AGENT, Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return JSON.parse(await res.text());
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------------------------------------------- cache */

/** The subset of the Workers Cache interface this module uses. */
export interface CacheLike {
  match(request: Request): Promise<Response | undefined>;
  put(request: Request, response: Response): Promise<void>;
}

/** A synthetic same site URL, keyed by ZIP only, so every visitor asking about a ZIP shares one entry. */
export function cacheKey(zip: string): Request {
  return new Request(`https://steelboxdirect.com/__zip-price-cache/v${CACHE_VERSION}/${zip}`);
}

type Stored =
  | { v: number; kind: 'ok'; storedAt: number; result: ZipPriceResult }
  | { v: number; kind: 'not-serviceable'; storedAt: number; zip: string };

/** Reads and re checks a cached entry. Anything malformed or expired reads as a miss. */
export function parseStored(text: string, zip: string, nowMs: number): Stored | null {
  let s: Stored;
  try {
    s = JSON.parse(text);
  } catch {
    return null;
  }
  if (!s || s.v !== CACHE_VERSION || !isFiniteNumber(s.storedAt)) return null;
  if (nowMs - s.storedAt > CACHE_TTL_SECONDS * 1000 || nowMs < s.storedAt) return null;
  if (s.kind === 'not-serviceable') return s.zip === zip ? s : null;
  if (s.kind !== 'ok' || !s.result || s.result.zip !== zip || !Array.isArray(s.result.lines)) return null;
  for (const line of s.result.lines) {
    if (!ZIP_SKUS.includes(line.sku) || !withinBounds(line.delivered)) return null;
    if (line.pickup !== null && !pickupWithinBounds(line.pickup)) return null;
  }
  if (!resultIsClean(s.result)) return null;
  return s;
}

export type LookupOutcome =
  | {
      status: 'ok';
      /** Lines withheld by the committed metro ceiling are already removed from this result. */
      result: ZipPriceResult;
      /** Sizes available at this ZIP whose live figure was withheld by the committed metro ceiling. */
      withheld: ZipSku[];
      fromCache: boolean;
      maxAgeSeconds: number;
    }
  | { status: 'not-serviceable'; fromCache: boolean; maxAgeSeconds: number }
  | { status: 'error'; reason: ValidationFailure | 'transport' | 'timeout' };

export interface LookupDeps {
  cache?: CacheLike | null;
  fetchImpl?: FetchLike;
  now?: () => Date;
  timeoutMs?: number;
  /** Lets the cache write finish after the response is sent. Optional. */
  waitUntil?: (p: Promise<unknown>) => void;
  /** The committed metro figures for a ZIP. Defaults to committedMetroForZip; injected in tests. */
  committedFor?: (zip: string) => CommittedMetro | null;
}

/**
 * Cache first, then at most ONE upstream call. Validated results and confirmed not-serviceable
 * answers are cached for 12 hours. Transport failures, timeouts and validation failures are never
 * cached, so a bad minute upstream does not become a bad half day here. A cache that throws is
 * treated as absent, which is the dev path.
 */
export async function lookupZipPrice(zip: string, deps: LookupDeps = {}): Promise<LookupOutcome> {
  const now = deps.now ?? (() => new Date());
  const committedFor = deps.committedFor ?? ((z: string) => committedMetroForZip(z));
  // Applied on every ok answer, cached or fresh, so the cache holds what the feed said and the
  // ceiling always reads the committed figures of the current deploy.
  const guarded = (result: ZipPriceResult) => applyCommittedCeiling(result, committedFor(zip));
  const cache = deps.cache ?? null;
  const key = cacheKey(zip);

  if (cache) {
    try {
      const hit = await cache.match(key);
      if (hit) {
        const nowMs = now().getTime();
        const s = parseStored(await hit.text(), zip, nowMs);
        if (s) {
          const left = Math.max(0, CACHE_TTL_SECONDS - Math.floor((nowMs - s.storedAt) / 1000));
          return s.kind === 'ok'
            ? { status: 'ok', ...guarded(s.result), fromCache: true, maxAgeSeconds: left }
            : { status: 'not-serviceable', fromCache: true, maxAgeSeconds: left };
        }
      }
    } catch {
      // A broken cache is a miss, never an error page.
    }
  }

  let payload: unknown;
  try {
    payload = await fetchZipPayload(zip, { fetchImpl: deps.fetchImpl, timeoutMs: deps.timeoutMs });
  } catch (err) {
    return { status: 'error', reason: (err as Error)?.name === 'AbortError' ? 'timeout' : 'transport' };
  }

  const fetchedAt = now();
  const v = validateZipPayload(payload, zip, easternIsoDate(fetchedAt));
  let stored: Stored | null = null;
  let outcome: LookupOutcome;
  if (v.ok) {
    stored = { v: CACHE_VERSION, kind: 'ok', storedAt: fetchedAt.getTime(), result: v.result };
    outcome = { status: 'ok', ...guarded(v.result), fromCache: false, maxAgeSeconds: CACHE_TTL_SECONDS };
  } else if (v.reason === 'not-serviceable') {
    stored = { v: CACHE_VERSION, kind: 'not-serviceable', storedAt: fetchedAt.getTime(), zip };
    outcome = { status: 'not-serviceable', fromCache: false, maxAgeSeconds: CACHE_TTL_SECONDS };
  } else {
    return { status: 'error', reason: v.reason };
  }

  if (cache && stored) {
    const write = cache
      .put(
        key,
        new Response(JSON.stringify(stored), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
          },
        }),
      )
      .catch(() => undefined);
    if (deps.waitUntil) deps.waitUntil(write);
    else await write;
  }
  return outcome;
}

/** The default cache from the Cloudflare runtime when there is one, else null. Never throws. */
export function cacheFromRuntime(runtime: unknown): CacheLike | null {
  try {
    const caches = (runtime as { caches?: { default?: CacheLike } } | undefined)?.caches;
    const c = caches?.default;
    return c && typeof c.match === 'function' && typeof c.put === 'function' ? c : null;
  } catch {
    return null;
  }
}
