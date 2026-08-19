#!/usr/bin/env node
/**
 * scripts/harvest-geo-pricing.mjs
 *
 * Harvests the per metro container price feed, validates every figure, diffs the result against the
 * committed values and rewrites exactly one file, src/data/geoPricing.ts, and only on the runs where
 * a figure actually moved. Nothing else in the repository is touched. This script never runs git and
 * never deploys: promotion belongs to the workflow that calls it.
 *
 * THE ONE ARITHMETIC RULE, and the live bug it exists to prevent. Every delivered figure is the
 * DELIVERY unit price plus the base delivery cost, rounded once at the very end and never in parts.
 * The feed also returns a lower field that reads like a unit price and is not one: it holds the
 * smaller of the pickup and the delivery unit prices. Measured at centroid 45404 on 2026-08-17 that
 * field returned 1440.60 against a delivery unit price of 1492.05, so a delivered total built from it
 * understates that metro by 51.45 per container while still summing to a plausible amount and passing
 * every bound and every day over day move check. It is read here for provenance only, it is never
 * added to anything, and it is never serialised. See MIN_OF_TWO_FIELD below, and note that
 * src/data/geoPricing.test.ts asserts this source file never places that field beside a plus sign.
 *
 * ROUNDING. Round the sum once. Rounding the two parts and then adding them drifts by up to ten
 * dollars: 1444.96 with 600.04 is 2050 rounded once and 2040 rounded in parts.
 *
 * ALL OR NOTHING. Every check runs before anything is written. One failing metro or one failing SKU
 * writes nothing at all, leaves the previous good module exactly as it was, and exits 1. A partial
 * write would mix todays figures with last weeks under one shared set of change dates, which
 * produces a file that looks fresh and is not.
 *
 * AVAILABILITY HYSTERESIS, and the state it needs. Feed Sanity 12 of the design spec requires two
 * consecutive runs reporting an unavailable SKU before the suppression takes effect, so a flapping
 * flag cannot cause a daily deploy. That rule needs the previous runs flags, and the committed module
 * does not carry them: it carries only the resolved availability, which by design does not move on
 * the first observation. So the previous runs flags live in the sidecar state file described below,
 * which is the same file the workflow persists through the Actions cache for the verification date.
 * WHEN THE SIDECAR IS ABSENT the hysteresis CANNOT be applied, and this script degrades explicitly
 * rather than silently: it treats the observation as a first one, holds the committed availability,
 * names the SKU in the summary under unsuppressed, sets hysteresis to cold, and warns on stderr. One
 * successful run repairs the state for the next one, so cold is self healing after a single run. It
 * is a deliberate and reported degradation, not an implemented rule against state that does not
 * exist.
 *
 * WHAT IS DELIBERATELY NOT CHECKED. There is no cross SKU ordering check. The 40ft high cube really
 * does price below the 40ft standard in this feed, it is owner confirmed, and a guard asserting the
 * opposite would be a test asserting a falsehood. Do not add one.
 *
 * EXIT CODES. 0 when nothing moved, 0 when something moved and was written, 1 on any validation or
 * transport failure. The caller branches on the machine readable summary on stdout rather than on the
 * exit code alone, so that nothing moved and wrote a change stay distinguishable. stdout carries the
 * summary and nothing else. Every human readable line goes to stderr.
 *
 * LOCAL DRY RUN, which writes nothing at all, not even the sidecar:
 *   node scripts/harvest-geo-pricing.mjs --dry-run
 *   node scripts/harvest-geo-pricing.mjs --dry-run --only=45404,45237,11222
 *
 * NO APOSTROPHES AND NO QUOTE CHARACTERS IN COMMENTS in this file. The hs003 unit extractor pairs
 * quote characters across a whole file, so one stray apostrophe re parses every literal below it. An
 * even count is harmless and an odd count is not. Reason about parity across the whole file. Neither
 * an em dash nor an en dash may appear anywhere either, in code or in prose or in generated output.
 */

import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..');

/* ----------------------------------------------------------------- constants */

/** Shape version of the generated module. Must match feedVersion in the template below. */
export const FEED_VERSION = 1;

export const ENDPOINT = 'https://www.freedomconex.com/api/pricing';

/**
 * A descriptive agent string. This is a public endpoint a partner has agreed to, and an identified
 * daily reader is a better thing to be than an anonymous one.
 */
export const USER_AGENT =
  'SteelBoxDirect-GeoPricingHarvest/1.0 (+https://steelboxdirect.com; daily price feed)';

/** The only grade this site sells and the literal string the feed returns for it. */
export const GRADE = 'WWT';

/** The SKU keys of src/data/pricing.ts minus its date key, in render order. */
export const SKU_KEYS = ['20ftCargo', '40ftStandard', '40ftStandardHC'];

/** SKU key to the feed size identifier. The feed keys rows by grade and size, so both are needed. */
export const SIZE_ID_BY_SKU = {
  '20ftCargo': '20-std',
  '40ftStandard': '40-std',
  '40ftStandardHC': '40-hc',
};

/** The feed field that is summed. One value, named once, so a later reader cannot swap it by accident. */
export const UNIT_PRICE_BASIS = 'deliveryUnitPrice';

/**
 * The lower field that reads like a unit price and holds the smaller of the pickup and the delivery
 * unit prices. Named so it can be read for provenance and so that reading it is searchable. It is
 * never summed into a figure and never serialised.
 */
export const MIN_OF_TWO_FIELD = 'fromPrice';

/**
 * Absolute bounds on a DELIVERED figure, inclusive. From the Feed Sanity section of the spec. The
 * floor catches a unit only response or a zeroed delivery; the ceiling catches a decimal shift, which
 * on a real figure would land above 20000.
 */
export const FIGURE_MIN = 1200;
export const FIGURE_MAX = 6000;

/**
 * Floor on a PICKUP figure, which is a different quantity and needs a different floor. The delivered
 * floor bounds a total, unit plus delivery. A pickup figure is the bare unit price with no delivery in
 * it, so the delivered floor is too high for it by roughly the cost of a delivery, and it rejected a
 * real one: on 2026-08-18 the live feed returned a savannah 20ft pickup unit price of 1183.35, which
 * rounds to 1180, and the shared floor of 1200 withheld it, so that metro would have shipped with no
 * pickup disclosure for a legitimate figure.
 *
 * Derived from the same live run rather than picked. Two steps. First, decomposition: subtracting the
 * smallest base delivery cost in the fifteen metro set, 250 at charleston, from the delivered floor of
 * 1200 gives 950 as the equivalent bound on a bare unit price. Second, move headroom: a figure is
 * allowed to move by up to the run ceiling of 20 percent, and the lowest live pickup figure is 1180,
 * so any floor above 944 can reject a legal one run move. 900 is the nearest whole hundred that clears
 * both, and it still catches everything a floor exists for, since the lowest live unit price read as
 * cents lands at 11.83, a decimal shift lands at 118.34, and a zeroed or missing field lands at 0, all
 * an order of magnitude below it. The ceiling is shared: the highest live pickup figure is 2160.
 */
export const PICKUP_MIN = 900;

/** Day over day move ceiling on a delivered or a pickup figure, as a fraction of the committed one. */
export const MOVE_CEILING = 0.2;

export const HTTP_TIMEOUT_MS = 20000;
export const HTTP_ATTEMPTS = 3;
export const HTTP_BACKOFF_MS = 1500;
export const METRO_DELAY_MS = 750;

export const STATE_SCHEMA = 'geo-pricing-harvest-state/1';
export const SUMMARY_SCHEMA = 'geo-pricing-harvest/1';

export const DEFAULT_PATHS = {
  centroids: join(REPO_ROOT, 'src/data/geoCentroids.ts'),
  committed: join(REPO_ROOT, 'src/data/geoPricing.ts'),
  out: join(REPO_ROOT, 'src/data/geoPricing.ts'),
  // .cache is already ignored by .gitignore, so an operational file cannot be committed by accident.
  state: join(REPO_ROOT, '.cache/geo-pricing-state.json'),
};

/* ------------------------------------------------------- text hygiene patterns */

/** HS-OUT-001. Both code points as escapes, so this file cannot contain what it forbids. */
export const DASHES = /[\u2014\u2013]/;
/** One pattern that no mistyped escape can defeat: it forbids both dashes and all other non ASCII. */
export const PRINTABLE_ASCII = /^[\x20-\x7E\n]*$/;
export const SUPPLIER = /freedom\s*conex/i;
export const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
export const ISO_DATE = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;

/** Feed fields that may never appear as a data key in the generated module. */
export const FORBIDDEN_KEYS = [
  'grade',
  'fromPrice',
  'pickupLocationName',
  'pickupLocationId',
  'deliveryLocationId',
  'deliveryDriverId',
  'sizeId',
];

/* --------------------------------------------------------- the module template */

/**
 * The generated module, in full, with two substitution points. Held here rather than patched into
 * whatever is already on disk, so that a corrupted or hand edited file cannot propagate its damage
 * into the next run. Everything outside the two placeholders is fixed text.
 */
const MODULE_TEMPLATE = String.raw`// src/data/geoPricing.ts
// GENERATED FILE. Do not hand edit. Written in full by scripts/harvest-geo-pricing.mjs on the daily
// schedule, and rewritten only on the runs where a figure actually moved. A hand edit here is lost
// on the next committing run, and a hand edit that happens to survive is worse than one that is
// lost, because it publishes a number no feed ever returned.
//
// WHAT TO DO WHEN A FIGURE IN HERE LOOKS WRONG. Do not correct it in this file. Three cases, in
// order of how often they happen:
//   1. The feed is right and this file is stale. Run the harvest and let it commit.
//   2. The feed itself is wrong. Raise it with the supplier contact, then hold the harvest by
//      disabling the workflow, because a figure that is rewritten every morning cannot be pinned by
//      editing the output.
//   3. The harvest computed it wrongly. Fix the script and its unit tests, then rerun. The bug will
//      be in the arithmetic or in which field was read, and the second of those is the half that
//      fails silently. See UNIT PRICE BASIS below.
//
// WHAT THIS FILE HOLDS. One record per metro, keyed by the slug in src/data/cities.ts, priced for
// the population-centroid ZIP in src/data/geoCentroids.ts. Per SKU: the delivered figure, the pickup
// figure, an approximate pickup distance, an availability flag, and the date that figure last
// CHANGED. Used Wind and Water Tight is the only grade priced here, which is the only grade this
// site sells. Nothing else belongs in this file.
//
// UNIT PRICE BASIS, and the live bug it exists to prevent. Every delivered figure is the DELIVERY
// unit price plus the base delivery cost, rounded once at the end and never in parts. The feed also
// returns a lower field that reads like a unit price and is not one: it holds the smaller of the
// pickup and the delivery unit prices, so a delivered total built from it understates the true
// delivered figure while still summing to a plausible amount and passing every bound and every
// day-over-day move check. Measured at centroid 45404 on 2026-08-17, that field returned 1440.60
// against a delivery unit price of 1492.05, an understatement of 51.45 per container that no sanity
// check can see. The export named unitPriceBasis below names the field that is summed, its type
// admits exactly one value, and geoPricing.test.ts asserts both.
//
// WHAT NEVER LANDS HERE. No supplier name, no identifier from the feed, and no free text of any
// kind. The harvest copies an allowlisted set of numeric and boolean fields and never serialises a
// response. geoPricing.test.ts asserts the exact key set of every record and asserts that the whole
// file is printable ASCII, so an unexpected field or a stray character fails the suite instead of
// shipping.
//
// RULES FOR EDITING, meaning for editing the serialiser that writes this file:
//   1. Keep every comment in this file free of apostrophes and quote characters. The hs003 guard
//      pairs quote characters across the whole file to find string literals, so one stray apostrophe
//      up here re-pairs every literal below it and can silently suppress a real finding. An even
//      number is harmless and an odd number is not, so reason about parity across the whole file
//      rather than about one apostrophe.
//   2. No em dash and no en dash, ever. Neither character can reach this file except through a free
//      text field, which rule 3 already forbids.
//   3. Never widen the field allowlist to a string field from the feed.
//   4. lastVerified is operational and is never rendered anywhere. The date that renders is
//      effectiveSince. A visible check date would need a deploy every single day to stay true.
//   5. A metro belongs to its ZIP through the centroid module, never through this one. Each record
//      echoes its zip so the guard can assert the two agree, which is how a serialiser that priced
//      the wrong ZIP gets caught in a diff rather than on the phone.
//   6. An empty geoPricing is a legitimate state and means no price is published anywhere. It is not
//      a price of zero, and no consumer may read it as one.

import type { Pricing } from './pricing';

/**
 * The SKU keys this feed prices, derived from the Pricing interface with its date key removed, so
 * the two modules cannot drift apart in what counts as a SKU. Type only, so nothing is imported at
 * runtime and the two modules never form a cycle.
 */
export type GeoSkuKey = Exclude<keyof Pricing, 'asOf'>;

/**
 * Names the feed field that is summed into every delivered figure. One admissible value on purpose:
 * the wrong field is a compile error rather than a silent 51.45 per container. See UNIT PRICE BASIS.
 */
export type UnitPriceBasis = 'deliveryUnitPrice';

export interface GeoSkuPrice {
  /** Delivery unit price plus base delivery cost, rounded to the nearest 10. The published figure. */
  delivered: number;
  /**
   * Pickup unit price rounded to the nearest 10, or null when the feed reported none. It is not the
   * delivered figure with the delivery taken off, and no surface may compute a saving from it.
   */
  pickup: number | null;
  /** Approximate miles from the centroid ZIP to the sourcing yard, as reported by the feed. */
  pickupDistanceMiles: number | null;
  /** Feed availability for this SKU at this ZIP. False suppresses the SKU rather than staling it. */
  available: boolean;
  /** ISO date this figure last CHANGED in this metro. This is the date that renders. See rule 4. */
  effectiveSince: string;
}

export interface GeoMetroPricing {
  /** Echo of the centroid ZIP this metro was priced from. Must equal geoCentroids for the same slug. */
  zip: string;
  skus: Record<GeoSkuKey, GeoSkuPrice>;
}

/** Shape version of this generated module. Bumped when the serialiser changes the shape. */
export const feedVersion = 1;

/** The one feed field summed into every delivered figure. See UNIT PRICE BASIS in the header. */
export const unitPriceBasis: UnitPriceBasis = 'deliveryUnitPrice';

/**
 * The SKU keys in render order. A runtime list is needed because a type cannot be iterated, and
 * geoPricing.test.ts asserts this list equals the key set of pricing with its date key removed.
 */
export const geoSkuKeys: GeoSkuKey[] = ['20ftCargo', '40ftStandard', '40ftStandardHC'];

/**
 * ISO date of the last successful, fully validated harvest run, or null before the first one.
 * OPERATIONAL ONLY, never rendered on any surface. See rule 4 in the header.
 */
export const lastVerified: string | null = __LAST_VERIFIED__;

/**
 * Metro slug to priced record. Empty until the first harvest run commits, which is why every
 * consumer treats an absent metro as no price rather than as a price of zero.
 */
export const geoPricing: Record<string, GeoMetroPricing> = __GEO_PRICING__;
`;

/* --------------------------------------------------------------- pure helpers */

export function isFiniteNumber(v) {
  return typeof v === 'number' && Number.isFinite(v);
}

/** Rounds to the nearest ten dollars. Identical by construction to the guard in geoPricing.test.ts. */
export function roundToTen(n) {
  return Math.round(n / 10) * 10;
}

/**
 * The published figure: the DELIVERY unit price plus the base delivery cost, rounded once. Reads two
 * fields and no others. Throws rather than coercing, because a silent NaN here becomes a published
 * number.
 */
export function deliveredPrice(row) {
  const unit = row?.[UNIT_PRICE_BASIS];
  const delivery = row?.baseDeliveryCost;
  if (!isFiniteNumber(unit) || !isFiniteNumber(delivery)) {
    throw new TypeError('deliveredPrice needs a finite delivery unit price and a finite delivery cost');
  }
  return roundToTen(unit + delivery);
}

/** The pickup figure, rounded, or null when the feed reported no usable pickup unit price. */
export function pickupFigure(row) {
  const unit = row?.pickupUnitPrice;
  if (!isFiniteNumber(unit) || unit <= 0) return null;
  return roundToTen(unit);
}

/** Keeps only the rows the site sells. A payload of nothing but the out of scope grade yields none. */
export function selectWwt(payload) {
  const byKey = payload?.byKey;
  if (!byKey || typeof byKey !== 'object') return [];
  return Object.values(byKey).filter((row) => row && row.grade === GRADE);
}

/** The single WWT row for one feed size identifier, or null when the feed returned none. */
export function rowForSize(rows, sizeId) {
  const matches = rows.filter((row) => row.sizeId === sizeId);
  return matches.length === 1 ? matches[0] : null;
}

export function withinBounds(v) {
  return isFiniteNumber(v) && v >= FIGURE_MIN && v <= FIGURE_MAX;
}

/** Bounds on a pickup figure. Same ceiling, lower floor, because it carries no delivery. See PICKUP_MIN. */
export function pickupWithinBounds(v) {
  return isFiniteNumber(v) && v >= PICKUP_MIN && v <= FIGURE_MAX;
}

/**
 * Whether a figure moved further than the ceiling allows. A metro with no committed figure has
 * nothing to move from, so the check is skipped rather than failed: that is the first run and every
 * newly added metro.
 */
export function moveWithinCeiling(next, previous) {
  if (!isFiniteNumber(previous) || previous <= 0) return true;
  return Math.abs(next - previous) / previous <= MOVE_CEILING;
}

/**
 * Feed Sanity 12. Two consecutive unavailable observations before a suppression takes effect. The
 * previous observation comes from the sidecar, so a run with no sidecar cannot confirm one and holds
 * instead, reporting that it held. See AVAILABILITY HYSTERESIS in the header.
 */
export function resolveAvailability({ feedAvailable, committedAvailable, pendingFalse, warm }) {
  if (feedAvailable) {
    return { available: true, pendingFalse: false, held: false, degraded: false };
  }
  const heldValue = committedAvailable === undefined ? true : committedAvailable;
  if (!warm) {
    return { available: heldValue, pendingFalse: true, held: true, degraded: true };
  }
  if (pendingFalse) {
    return { available: false, pendingFalse: true, held: false, degraded: false };
  }
  return { available: heldValue, pendingFalse: true, held: true, degraded: false };
}

/**
 * Carry forward. An unchanged delivered figure keeps the date it has always had, and only a figure
 * that actually moved is stamped with today. This is what makes the rendered claim that a price has
 * been in effect since a given day true rather than decorative. A committed date that is missing,
 * malformed or in the future is not trusted and is replaced by today.
 */
export function resolveEffectiveSince({ delivered, committedSku, today }) {
  const previous = committedSku?.effectiveSince;
  const usable =
    typeof previous === 'string' && ISO_DATE.test(previous) && previous.localeCompare(today) <= 0;
  if (!usable) return today;
  return committedSku.delivered === delivered ? previous : today;
}

/* ------------------------------------------------------------ metro validation */

/**
 * Validates one metro payload and builds its record. Returns errors, which abort the whole run, and
 * warnings, which do not. Also returns the raw observations so a human can check the arithmetic on a
 * dry run without reading the response body.
 */
export function validateMetro({ slug, zip, payload, committedMetro, pending, warm, today }) {
  const errors = [];
  const warnings = [];
  const observations = {};
  const pendingNext = [];

  if (!payload || typeof payload !== 'object') {
    errors.push({ slug, zip, sku: null, check: 'shape', detail: 'payload is not an object' });
    return { record: null, errors, warnings, observations, pendingNext };
  }
  if (payload.zip !== zip) {
    errors.push({
      slug,
      zip,
      sku: null,
      check: 'zip-echo',
      detail: `feed answered for ${String(payload.zip)}`,
    });
  }
  if (payload.serviceable !== true) {
    errors.push({ slug, zip, sku: null, check: 'serviceable', detail: 'feed reports not serviceable' });
  }

  const rows = selectWwt(payload);
  if (rows.length === 0) {
    errors.push({
      slug,
      zip,
      sku: null,
      check: 'grade-filter',
      detail: `zero rows of grade ${GRADE}, which is the signature of a grade string change`,
    });
  }

  const skus = {};
  for (const sku of SKU_KEYS) {
    const sizeId = SIZE_ID_BY_SKU[sku];
    const row = rowForSize(rows, sizeId);
    if (!row) {
      errors.push({
        slug,
        zip,
        sku,
        check: 'row-present',
        detail: `no single row of grade ${GRADE} for size ${sizeId}`,
      });
      continue;
    }

    const unit = row[UNIT_PRICE_BASIS];
    const delivery = row.baseDeliveryCost;
    if (!isFiniteNumber(unit) || unit <= 0 || !isFiniteNumber(delivery) || delivery < 0) {
      errors.push({
        slug,
        zip,
        sku,
        check: 'unit-and-delivery-finite',
        detail: `delivery unit ${String(unit)} and delivery cost ${String(delivery)}`,
      });
      continue;
    }

    const delivered = deliveredPrice(row);
    const committedSku = committedMetro?.skus?.[sku];
    const committedDelivered = committedSku?.delivered;

    if (!withinBounds(delivered)) {
      errors.push({
        slug,
        zip,
        sku,
        check: 'delivered-bounds',
        detail: `${delivered} is outside ${FIGURE_MIN} to ${FIGURE_MAX}`,
        committed: committedDelivered ?? null,
        rejected: delivered,
      });
      continue;
    }
    if (!moveWithinCeiling(delivered, committedDelivered)) {
      errors.push({
        slug,
        zip,
        sku,
        check: 'delivered-move-ceiling',
        detail: `moved more than ${MOVE_CEILING * 100} percent in one run`,
        committed: committedDelivered ?? null,
        rejected: delivered,
      });
      continue;
    }

    // Pickup is a secondary disclosure, never the published price. A bad pickup number is nulled and
    // warned about rather than taking the whole site off the air, which the spec names as the wrong
    // trade in the same breath as it applies the bounds to pickup.
    let pickup = pickupFigure(row);
    const committedPickup = committedSku?.pickup;
    if (pickup !== null && !pickupWithinBounds(pickup)) {
      warnings.push({
        slug,
        zip,
        sku,
        check: 'pickup-bounds',
        detail: `${pickup} is outside ${PICKUP_MIN} to ${FIGURE_MAX}, so pickup is withheld`,
      });
      pickup = null;
    }
    if (pickup !== null && !moveWithinCeiling(pickup, committedPickup)) {
      warnings.push({
        slug,
        zip,
        sku,
        check: 'pickup-move-ceiling',
        detail: `pickup moved more than ${MOVE_CEILING * 100} percent, so pickup is withheld`,
      });
      pickup = null;
    }
    if (pickup === null) {
      warnings.push({ slug, zip, sku, check: 'pickup-absent', detail: 'no usable pickup figure' });
    }

    const rawDistance = row.pickupDistanceMiles;
    const pickupDistanceMiles =
      isFiniteNumber(rawDistance) && rawDistance >= 0 && rawDistance <= 3000 ? rawDistance : null;

    // Provenance only. The lower field should be the smaller of the two unit prices; if it ever comes
    // back above the delivery unit price the feed contract changed and a human should look.
    const minOfTwo = row[MIN_OF_TWO_FIELD];
    if (isFiniteNumber(minOfTwo) && minOfTwo > unit) {
      warnings.push({
        slug,
        zip,
        sku,
        check: 'provenance-basis',
        detail: 'the lower feed field came back above the delivery unit price',
      });
    }

    const feedAvailable = row.available === true && row.deliveryAvailable === true;
    const wasPending = Array.isArray(pending) && pending.includes(sku);
    const availability = resolveAvailability({
      feedAvailable,
      committedAvailable: committedSku?.available,
      pendingFalse: wasPending,
      warm,
    });
    if (availability.pendingFalse) pendingNext.push(sku);
    if (availability.held) {
      warnings.push({
        slug,
        zip,
        sku,
        check: availability.degraded ? 'hysteresis-cold' : 'hysteresis-hold',
        detail: availability.degraded
          ? 'feed reports unavailable and no previous run state exists, so the suppression is held for one run'
          : 'first unavailable observation, so the suppression waits for a second consecutive one',
      });
    }

    skus[sku] = {
      delivered,
      pickup,
      pickupDistanceMiles,
      available: availability.available,
      effectiveSince: resolveEffectiveSince({ delivered, committedSku, today }),
    };

    observations[sku] = {
      sizeId,
      unitBasis: UNIT_PRICE_BASIS,
      unit,
      baseDeliveryCost: delivery,
      delivered,
      pickupUnitPrice: isFiniteNumber(row.pickupUnitPrice) ? row.pickupUnitPrice : null,
      pickup,
      pickupDistanceMiles,
      feedAvailable,
      available: availability.available,
      minOfTwoObserved: isFiniteNumber(minOfTwo) ? minOfTwo : null,
      // The number this metro WOULD have published off the lower field, computed for the dry run log
      // only so that a human can see the two candidates side by side and see which one was taken. It
      // is a diagnostic, it is never written to the module and it is never put in the summary. Do not
      // promote it into anything. At some ZIPs the two fields are equal and this column matches the
      // published figure, which is exactly the coincidence that hid the bug: read the whole column.
      deliveredIfLowerField: isFiniteNumber(minOfTwo) ? roundToTen(minOfTwo + delivery) : null,
    };
  }

  const record = errors.length === 0 ? { zip, skus } : null;
  return { record, errors, warnings, observations, pendingNext };
}

/* ------------------------------------------------------------------- the diff */

const SKU_FIELDS = ['delivered', 'pickup', 'pickupDistanceMiles', 'available', 'effectiveSince'];

/** Every field level difference between the committed map and the candidate map, in stable order. */
export function diffPricing(committed, candidate) {
  const changes = [];
  const slugs = new Set([...Object.keys(committed ?? {}), ...Object.keys(candidate ?? {})]);
  for (const slug of [...slugs].sort()) {
    const before = committed?.[slug];
    const after = candidate?.[slug];
    if (!after) {
      changes.push({ slug, sku: null, field: 'metro', from: 'priced', to: 'absent' });
      continue;
    }
    if (!before) {
      changes.push({ slug, sku: null, field: 'metro', from: 'absent', to: 'priced' });
      continue;
    }
    if (before.zip !== after.zip) {
      changes.push({ slug, sku: null, field: 'zip', from: before.zip, to: after.zip });
    }
    for (const sku of SKU_KEYS) {
      const a = before.skus?.[sku];
      const b = after.skus?.[sku];
      if (!b) continue;
      if (!a) {
        changes.push({ slug, sku, field: 'sku', from: 'absent', to: 'priced' });
        continue;
      }
      for (const field of SKU_FIELDS) {
        if (a[field] !== b[field]) {
          changes.push({ slug, sku, field, from: a[field], to: b[field] });
        }
      }
    }
  }
  return changes;
}

/* ------------------------------------------------------ serialise and read back */

/**
 * Writes the module text. The data literal is emitted as strict JSON, which is also valid TypeScript,
 * for one reason: it means the reader below is JSON.parse rather than a hand rolled parser, so a
 * serialiser that disagrees with its own reader is impossible. Output is byte stable for equal input,
 * because metros are sorted and SKU keys are emitted in a fixed order regardless of insertion order.
 */
export function serialise({ geoPricing, lastVerified }) {
  const body = toTsKeys(JSON.stringify(orderForOutput(geoPricing), null, 2));
  const verified = lastVerified === null || lastVerified === undefined ? 'null' : `'${lastVerified}'`;
  return MODULE_TEMPLATE.replace('__LAST_VERIFIED__', () => verified).replace(
    '__GEO_PRICING__',
    () => body,
  );
}

/** Reads back what serialise wrote, and reads the committed module the same way. */
export function parseCommitted(text) {
  const verifiedMatch = text.match(
    /export const lastVerified: string \| null = (null|'([0-9]{4}-[0-9]{2}-[0-9]{2})');/,
  );
  if (!verifiedMatch) throw new Error('cannot read lastVerified from the module');
  const lastVerified = verifiedMatch[1] === 'null' ? null : verifiedMatch[2];

  const marker = 'export const geoPricing: Record<string, GeoMetroPricing> = ';
  const at = text.indexOf(marker);
  if (at < 0) throw new Error('cannot find the geoPricing declaration in the module');
  const rest = text.slice(at + marker.length);
  if (rest[0] !== '{') throw new Error('the geoPricing declaration does not open with an object');
  let depth = 0;
  let end = -1;
  for (let i = 0; i < rest.length; i += 1) {
    if (rest[i] === '{') depth += 1;
    else if (rest[i] === '}') {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end < 0) throw new Error('the geoPricing object literal is not balanced');
  if (rest[end + 1] !== ';') throw new Error('the geoPricing object literal is not terminated');
  return { geoPricing: JSON.parse(toJsonKeys(rest.slice(0, end + 1))), lastVerified };
}

/**
 * Parses the human owned centroid module. Deliberately read only: nothing here ever writes it.
 *
 * WHY THE PATTERN SKIPS TRAILING FLAGS. slug, zip and publish are the only fields this script needs,
 * and it is deliberately incurious about the rest. Each entry also carries nationalBasis, which
 * decides whether a metro feeds the site wide average figure and has nothing whatever to do with
 * which ZIPs get queried, so pinning it here would couple the harvest to a rendering decision and
 * would fail the run on the day somebody adds a fourth flag. The trailing group therefore skips any
 * further boolean flag by name. What it does NOT skip is a missing or renamed slug, zip or publish:
 * those still drop the entry, and the count check below turns that into a loud failure.
 */
export function parseCentroids(text) {
  const pattern =
    /\{\s*slug:\s*'([a-z0-9-]+)'\s*,\s*zip:\s*'([0-9]{5})'\s*,\s*publish:\s*(true|false)\s*(?:,\s*[A-Za-z]+:\s*(?:true|false)\s*)*\}/g;
  const out = [];
  for (const m of text.matchAll(pattern)) {
    out.push({ slug: m[1], zip: m[2], publish: m[3] === 'true' });
  }
  if (out.length === 0) throw new Error('parsed zero centroids, so the module shape changed');
  const seen = new Set();
  for (const c of out) {
    if (seen.has(c.slug)) throw new Error(`duplicate centroid slug ${c.slug}`);
    seen.add(c.slug);
  }
  return out;
}

/**
 * Everything the data guard asserts, asserted here too, before the text reaches disk. Duplicated on
 * purpose: the guard catches a bad file in review and this catches it before it is written at all.
 */
export function inspectSerialised(text, expected) {
  const problems = [];
  const say = (detail) => problems.push(detail);

  if (!PRINTABLE_ASCII.test(text)) say('output is not printable ASCII from end to end');
  if (DASHES.test(text)) say('output carries an em dash or an en dash (HS-OUT-001)');
  if (SUPPLIER.test(text)) say('output names the supplier');
  if (UUID.test(text)) say('output carries a feed identifier shaped like a UUID');
  if (/\bNEW\b/.test(text)) say('output mentions the out of scope grade');
  if (text.includes('__LAST_VERIFIED__') || text.includes('__GEO_PRICING__')) {
    say('output still holds a template placeholder');
  }
  for (const key of FORBIDDEN_KEYS) {
    // Both key forms, bare and quoted, so the check cannot be evaded by a change of output style.
    const bare = new RegExp(`(^|[^A-Za-z])${key}\\s*:`);
    const quoted = new RegExp(`"${key}"\\s*:`);
    if (bare.test(text) || quoted.test(text)) say(`output carries ${key} as a data key`);
  }
  if (!text.startsWith('// src/data/geoPricing.ts')) say('output does not open with its own path');
  for (const phrase of [
    'GENERATED FILE',
    'Do not hand edit',
    'scripts/harvest-geo-pricing.mjs',
    'Wind and Water Tight',
    UNIT_PRICE_BASIS,
  ]) {
    if (!text.includes(phrase)) say(`output is missing the required phrase ${phrase}`);
  }
  const imports = text.match(/^\s*import\s[^\n]*$/gm) ?? [];
  if (imports.length !== 1 || !imports[0].includes('import type')) {
    say('output must carry exactly one import and it must be type only');
  }

  let readBack;
  try {
    readBack = parseCommitted(text);
  } catch (err) {
    say(`output cannot be read back: ${err.message}`);
    return problems;
  }
  if (JSON.stringify(readBack.geoPricing) !== JSON.stringify(orderForOutput(expected.geoPricing))) {
    say('output does not read back as the data it was given');
  }
  if (readBack.lastVerified !== (expected.lastVerified ?? null)) {
    say('output does not read back the verification date it was given');
  }

  const slugs = Object.keys(readBack.geoPricing);
  if (slugs.length === 0 && readBack.lastVerified !== null) {
    say('a verification date with no priced metro is dishonest');
  }
  if (slugs.length > 0 && !ISO_DATE.test(readBack.lastVerified ?? '')) {
    say('priced metros with no verification date is dishonest');
  }

  const today = expected.today ?? new Date().toISOString().slice(0, 10);
  for (const slug of slugs) {
    const metro = readBack.geoPricing[slug];
    if (!/^[0-9]{5}$/.test(metro.zip)) say(`${slug} carries a malformed zip`);
    for (const sku of SKU_KEYS) {
      const s = metro.skus?.[sku];
      if (!s) {
        say(`${slug} is missing ${sku}`);
        continue;
      }
      if (!Number.isInteger(s.delivered) || s.delivered % 10 !== 0 || !withinBounds(s.delivered)) {
        say(`${slug} ${sku} delivered ${s.delivered} is not a whole ten in bounds`);
      }
      if (s.pickup !== null) {
        if (!Number.isInteger(s.pickup) || s.pickup % 10 !== 0 || !pickupWithinBounds(s.pickup)) {
          say(`${slug} ${sku} pickup ${s.pickup} is not a whole ten in bounds`);
        }
      }
      if (typeof s.available !== 'boolean') say(`${slug} ${sku} availability is not a boolean`);
      if (!ISO_DATE.test(s.effectiveSince ?? '')) say(`${slug} ${sku} has no ISO change date`);
      else {
        if (s.effectiveSince.localeCompare(today) > 0) say(`${slug} ${sku} is dated in the future`);
        if (readBack.lastVerified && s.effectiveSince.localeCompare(readBack.lastVerified) > 0) {
          say(`${slug} ${sku} changed after the run that verified it`);
        }
      }
    }
  }
  return problems;
}

/**
 * Emits identifier keys unquoted, the way TypeScript source is normally written. The load bearing
 * reason is not cosmetic: the key form assertions in geoPricing.test.ts look for a bare key followed
 * by a colon, so a forbidden feed field that ever escaped the allowlist is emitted bare and is caught
 * by the data guard as well as by the inspection below. The transform is exactly invertible here,
 * because no value in this data can contain a colon.
 */
export function toTsKeys(json) {
  return json.replace(/"([A-Za-z_$][A-Za-z0-9_$]*)":/g, '$1:');
}

/** The inverse, so the reader is JSON.parse and a serialiser that disagrees with it is impossible. */
export function toJsonKeys(text) {
  return text.replace(/(^|[{,\s])([A-Za-z_$][A-Za-z0-9_$]*)\s*:/g, '$1"$2":');
}

/** One ordering, used by the writer and by the read back check, so they compare like with like. */
export function orderForOutput(geoPricing) {
  const ordered = {};
  for (const slug of Object.keys(geoPricing ?? {}).sort()) {
    const metro = geoPricing[slug];
    const skus = {};
    for (const sku of SKU_KEYS) {
      const s = metro.skus[sku];
      skus[sku] = {
        delivered: s.delivered,
        pickup: s.pickup,
        pickupDistanceMiles: s.pickupDistanceMiles,
        available: s.available,
        effectiveSince: s.effectiveSince,
      };
    }
    ordered[slug] = { zip: metro.zip, skus };
  }
  return ordered;
}

/* -------------------------------------------------------------- the transport */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * One metro, with a timeout and bounded retries. Anything other than a 200 with a parseable body is
 * a failure, and a failure here fails the whole run rather than dropping one metro.
 */
export async function fetchMetro(
  zip,
  { attempts = HTTP_ATTEMPTS, timeoutMs = HTTP_TIMEOUT_MS, backoffMs = HTTP_BACKOFF_MS, fetchImpl, sleepImpl } = {},
) {
  const doFetch = fetchImpl ?? fetch;
  const doSleep = sleepImpl ?? sleep;
  let lastError = 'unknown';
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await doFetch(`${ENDPOINT}?zip=${encodeURIComponent(zip)}`, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
        signal: controller.signal,
      });
      if (!res.ok) {
        lastError = `HTTP ${res.status}`;
      } else {
        const body = await res.text();
        try {
          return JSON.parse(body);
        } catch {
          lastError = 'body is not parseable JSON';
        }
      }
    } catch (err) {
      lastError = err?.name === 'AbortError' ? `timeout after ${timeoutMs} ms` : String(err?.message ?? err);
    } finally {
      clearTimeout(timer);
    }
    if (attempt < attempts) await doSleep(backoffMs * attempt);
  }
  throw new Error(`zip ${zip}: ${lastError}`);
}

/* ------------------------------------------------------------- the state file */

/** Reads the sidecar. A missing or unreadable sidecar is not a failure, it is the cold path. */
export function readState(path) {
  if (!path || !existsSync(path)) {
    return { state: { schema: STATE_SCHEMA, lastVerified: null, pendingUnavailable: {} }, warm: false };
  }
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8'));
    if (parsed?.schema !== STATE_SCHEMA) {
      return { state: { schema: STATE_SCHEMA, lastVerified: null, pendingUnavailable: {} }, warm: false };
    }
    return {
      state: {
        schema: STATE_SCHEMA,
        lastVerified: parsed.lastVerified ?? null,
        pendingUnavailable: parsed.pendingUnavailable ?? {},
      },
      warm: true,
    };
  } catch {
    return { state: { schema: STATE_SCHEMA, lastVerified: null, pendingUnavailable: {} }, warm: false };
  }
}

export function writeState(path, state) {
  mkdirSync(dirname(path), { recursive: true });
  atomicWrite(path, `${JSON.stringify(state, null, 2)}\n`);
}

/** Writes through a temporary file, so a crash mid write cannot leave a half a module behind. */
export function atomicWrite(path, text) {
  const tmp = `${path}.tmp-${process.pid}`;
  try {
    writeFileSync(tmp, text, 'utf8');
    renameSync(tmp, path);
  } finally {
    if (existsSync(tmp)) rmSync(tmp, { force: true });
  }
}

/* ------------------------------------------------------------------ the runner */

export function parseArgs(argv) {
  const opts = {
    dryRun: false,
    only: null,
    paths: { ...DEFAULT_PATHS },
    useState: true,
    delayMs: METRO_DELAY_MS,
    today: new Date().toISOString().slice(0, 10),
    help: false,
  };
  for (const arg of argv) {
    if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '--no-state') opts.useState = false;
    else if (arg === '--help' || arg === '-h') opts.help = true;
    else if (arg.startsWith('--only=')) opts.only = arg.slice(7).split(',').map((s) => s.trim()).filter(Boolean);
    else if (arg.startsWith('--out=')) opts.paths.out = resolve(arg.slice(6));
    else if (arg.startsWith('--committed=')) opts.paths.committed = resolve(arg.slice(12));
    else if (arg.startsWith('--centroids=')) opts.paths.centroids = resolve(arg.slice(12));
    else if (arg.startsWith('--state=')) opts.paths.state = resolve(arg.slice(8));
    else if (arg.startsWith('--delay=')) opts.delayMs = Number(arg.slice(8));
    else if (arg.startsWith('--today=')) opts.today = arg.slice(8);
    else throw new Error(`unknown argument ${arg}`);
  }
  // A subset run cannot produce a complete file, and an incomplete file breaks the coverage guard,
  // so a subset is a read only investigation by construction.
  if (opts.only) opts.dryRun = true;
  return opts;
}

const USAGE = [
  'Harvests the per metro container price feed and rewrites src/data/geoPricing.ts on a real change.',
  '',
  'Usage: node scripts/harvest-geo-pricing.mjs [options]',
  '',
  '  --dry-run          fetch, validate and diff, write nothing at all',
  '  --only=A,B         limit to these metro slugs or ZIPs. Implies --dry-run',
  '  --out=PATH         write the module here instead of src/data/geoPricing.ts',
  '  --committed=PATH   read the committed module from here',
  '  --centroids=PATH   read the centroid module from here',
  '  --state=PATH       sidecar run state. Default .cache/geo-pricing-state.json',
  '  --no-state         ignore and do not write the sidecar. Forces the cold hysteresis path',
  '  --delay=MS         pause between metros. Default 750',
  '  --today=YYYY-MM-DD pin the run date. Testing only',
  '',
  'Exit 0 when nothing moved, 0 when a change was written, 1 on any failure.',
  'stdout carries a one line JSON summary and nothing else. Human output goes to stderr.',
].join('\n');

export async function main(argv = process.argv.slice(2), deps = {}) {
  const log = deps.log ?? ((line) => console.error(line));
  const emit = deps.emit ?? ((summary) => console.log(JSON.stringify(summary)));
  let opts;
  try {
    opts = parseArgs(argv);
  } catch (err) {
    log(`harvest: ${err.message}`);
    log(USAGE);
    return 1;
  }
  if (opts.help) {
    log(USAGE);
    return 0;
  }

  const summary = {
    schema: SUMMARY_SCHEMA,
    feedVersion: FEED_VERSION,
    status: 'failed',
    dryRun: opts.dryRun,
    wrote: false,
    ranAt: new Date().toISOString(),
    today: opts.today,
    unitPriceBasis: UNIT_PRICE_BASIS,
    hysteresis: 'cold',
    metrosRequested: 0,
    metrosPriced: 0,
    changeCount: 0,
    changes: [],
    failures: [],
    warnings: [],
    unsuppressed: [],
    outPath: null,
  };

  let centroids;
  let committed;
  try {
    centroids = parseCentroids(readFileSync(opts.paths.centroids, 'utf8'));
    committed = parseCommitted(readFileSync(opts.paths.committed, 'utf8'));
  } catch (err) {
    summary.failures.push({ check: 'inputs', detail: err.message });
    log(`harvest: cannot read the inputs: ${err.message}`);
    emit(summary);
    return 1;
  }

  const wanted = opts.only
    ? centroids.filter((c) => opts.only.includes(c.slug) || opts.only.includes(c.zip))
    : centroids;
  if (wanted.length === 0) {
    summary.failures.push({ check: 'selection', detail: 'no centroid matched the selection' });
    log('harvest: no centroid matched the selection');
    emit(summary);
    return 1;
  }
  summary.metrosRequested = wanted.length;

  const { state, warm } = opts.useState ? readState(opts.paths.state) : { state: null, warm: false };
  summary.hysteresis = warm ? 'warm' : 'cold';
  if (!warm) {
    log(
      'harvest: no previous run state, so the two run availability hysteresis cannot be applied on this run. Any unavailable SKU is held for one run and reported under unsuppressed.',
    );
  }

  const candidate = {};
  const pendingNextAll = {};
  const allObservations = {};
  for (const centroid of wanted) {
    let payload;
    try {
      payload = await fetchMetro(centroid.zip, deps.fetchOpts);
    } catch (err) {
      summary.failures.push({
        slug: centroid.slug,
        zip: centroid.zip,
        sku: null,
        check: 'transport',
        detail: err.message,
      });
      log(`harvest: ${centroid.slug} transport failure: ${err.message}`);
      continue;
    }
    const result = validateMetro({
      slug: centroid.slug,
      zip: centroid.zip,
      payload,
      committedMetro: committed.geoPricing[centroid.slug],
      pending: state?.pendingUnavailable?.[centroid.slug] ?? [],
      warm,
      today: opts.today,
    });
    summary.failures.push(...result.errors);
    summary.warnings.push(...result.warnings);
    for (const w of result.warnings) {
      if (w.check === 'hysteresis-cold' || w.check === 'hysteresis-hold') {
        summary.unsuppressed.push({ slug: w.slug, sku: w.sku, reason: w.check });
      }
    }
    if (result.record) candidate[centroid.slug] = result.record;
    if (result.pendingNext.length > 0) pendingNextAll[centroid.slug] = result.pendingNext;
    allObservations[centroid.slug] = result.observations;
    if (opts.delayMs > 0 && centroid !== wanted[wanted.length - 1]) await sleep(opts.delayMs);
  }
  summary.metrosPriced = Object.keys(candidate).length;

  logTable(log, wanted, allObservations, candidate, committed.geoPricing);

  if (summary.failures.length > 0) {
    summary.status = 'failed';
    log(
      `harvest: ${summary.failures.length} check failures, so nothing was written and the previous module stands.`,
    );
    for (const f of summary.failures) {
      log(`harvest: FAIL ${f.slug ?? 'run'} ${f.sku ?? ''} ${f.check}: ${f.detail}`);
    }
    emit(summary);
    return 1;
  }

  // The data guard requires every centroid metro or none, so a partial map may never reach the
  // committed path. A subset run is already forced to dry run, and this is the belt for that brace.
  const writingCommitted = resolve(opts.paths.out) === resolve(DEFAULT_PATHS.out);
  const missing = centroids.filter((c) => !candidate[c.slug]).map((c) => c.slug);
  if (!opts.dryRun && writingCommitted && missing.length > 0) {
    summary.status = 'failed';
    summary.failures.push({ check: 'coverage', detail: `not priced: ${missing.join(' ')}` });
    log(`harvest: refusing to write a partial module. Not priced: ${missing.join(' ')}`);
    emit(summary);
    return 1;
  }

  const changes = diffPricing(committed.geoPricing, candidate);
  summary.changes = changes;
  summary.changeCount = changes.length;

  if (changes.length === 0) {
    summary.status = 'no-change';
    if (!opts.dryRun && opts.useState) {
      writeState(opts.paths.state, {
        schema: STATE_SCHEMA,
        lastVerified: opts.today,
        lastRunAt: summary.ranAt,
        pendingUnavailable: pendingNextAll,
      });
    }
    log('harvest: every figure matches the committed module, so there is nothing to write.');
    emit(summary);
    return 0;
  }

  const text = serialise({ geoPricing: candidate, lastVerified: opts.today });
  const problems = inspectSerialised(text, {
    geoPricing: candidate,
    lastVerified: opts.today,
    today: opts.today,
  });
  if (problems.length > 0) {
    summary.status = 'failed';
    for (const p of problems) summary.failures.push({ check: 'serialiser', detail: p });
    log('harvest: the serialised module failed its own inspection, so nothing was written.');
    for (const p of problems) log(`harvest: FAIL serialiser: ${p}`);
    emit(summary);
    return 1;
  }

  log(`harvest: ${changes.length} field changes.`);
  for (const c of changes) {
    log(`harvest: CHANGE ${c.slug} ${c.sku ?? ''} ${c.field} ${String(c.from)} to ${String(c.to)}`);
  }

  if (opts.dryRun) {
    summary.status = 'would-write';
    summary.outPath = null;
    log('harvest: dry run, so nothing was written.');
    emit(summary);
    return 0;
  }

  atomicWrite(opts.paths.out, text);
  if (opts.useState) {
    writeState(opts.paths.state, {
      schema: STATE_SCHEMA,
      lastVerified: opts.today,
      lastRunAt: summary.ranAt,
      pendingUnavailable: pendingNextAll,
    });
  }
  summary.status = 'written';
  summary.wrote = true;
  summary.outPath = opts.paths.out;
  log(`harvest: wrote ${opts.paths.out}`);
  emit(summary);
  return 0;
}

/** One line per metro and SKU, so the human checking a dry run can redo the arithmetic by eye. */
function logTable(log, wanted, observations, candidate, committedPricing) {
  log('');
  log('metro                            sku             unit  +delivery  delivered  wrongBasis  was    pickup  mi     avail');
  for (const centroid of wanted) {
    const obs = observations[centroid.slug] ?? {};
    for (const sku of SKU_KEYS) {
      const o = obs[sku];
      if (!o) {
        log(`${pad(centroid.slug, 32)} ${pad(sku, 15)} no row`);
        continue;
      }
      const was = committedPricing?.[centroid.slug]?.skus?.[sku]?.delivered ?? '-';
      log(
        [
          pad(centroid.slug, 32),
          pad(sku, 15),
          pad(String(o.unit), 8),
          pad(String(o.baseDeliveryCost), 10),
          pad(String(o.delivered), 10),
          pad(String(o.deliveredIfLowerField ?? '-'), 11),
          pad(String(was), 6),
          pad(String(o.pickup ?? '-'), 7),
          pad(String(o.pickupDistanceMiles ?? '-'), 6),
          String(o.available),
        ].join(' '),
      );
    }
  }
  log('');
  const priced = Object.keys(candidate).length;
  log(`harvest: priced ${priced} metros and ${priced * SKU_KEYS.length} figures.`);
}

function pad(s, n) {
  return String(s).length >= n ? String(s) : String(s) + ' '.repeat(n - String(s).length);
}

// Only run when executed directly, never when imported by the unit tests.
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main().then(
    (code) => process.exit(code),
    (err) => {
      console.error(`harvest: unhandled failure: ${err?.stack ?? err}`);
      console.log(
        JSON.stringify({ schema: SUMMARY_SCHEMA, status: 'failed', wrote: false, failures: [{ check: 'unhandled', detail: String(err?.message ?? err) }] }),
      );
      process.exit(1);
    },
  );
}
