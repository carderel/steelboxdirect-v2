/**
 * scripts/harvest-geo-pricing.test.mjs
 *
 * Unit tests for the price harvest, on the node test runner, matching scripts/indexnow.test.mjs.
 * Fixtures only: nothing here touches the network, and the two tests that exercise the whole run
 * inject a fake transport and write into a temporary directory.
 *
 * THE ONE TEST THAT MATTERS MOST is the arithmetic basis group. The delivered figure is the DELIVERY
 * unit price plus the base delivery cost. The feed also returns a lower field holding the smaller of
 * the pickup and the delivery unit prices, measured at 1440.60 against a delivery unit price of
 * 1492.05 at centroid 45404, and a total built from the lower field understates that metro by 51.45
 * per container while passing every other check in this file. The value 1440.60 therefore appears
 * below ONLY inside negative assertions, and never as a delivery unit price in any fixture. A fixture
 * that used it as one would produce a green test documenting the wrong number, which is exactly how
 * this bug survived several correction passes.
 *
 * No apostrophes and no quote characters in comments in this file, and neither dash character
 * anywhere. There is a test at the bottom that checks both rules against this file and the script.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, existsSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

import {
  DASHES,
  DEFAULT_PATHS,
  FIGURE_MAX,
  FIGURE_MIN,
  MIN_OF_TWO_FIELD,
  PICKUP_MIN,
  PRINTABLE_ASCII,
  SKU_KEYS,
  SUPPLIER,
  UNIT_PRICE_BASIS,
  deliveredPrice,
  diffPricing,
  inspectSerialised,
  main,
  moveWithinCeiling,
  orderForOutput,
  parseArgs,
  parseCentroids,
  parseCommitted,
  pickupFigure,
  pickupWithinBounds,
  resolveAvailability,
  resolveEffectiveSince,
  rowForSize,
  roundToTen,
  selectWwt,
  serialise,
  toJsonKeys,
  toTsKeys,
  validateMetro,
  withinBounds,
} from './harvest-geo-pricing.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..');
const SCRIPT = join(HERE, 'harvest-geo-pricing.mjs');
const TESTS = join(HERE, 'harvest-geo-pricing.test.mjs');
const COMMITTED = join(REPO_ROOT, 'src/data/geoPricing.ts');
const CENTROIDS = join(REPO_ROOT, 'src/data/geoCentroids.ts');

const TODAY = '2026-08-18';
const EARLIER = '2026-08-12';

/* --------------------------------------------------------------------- fixtures */

/** A WWT row in the shape the live feed returns, including the fields that must never be copied. */
function wwtRow(sizeId, unit, delivery, extra = {}) {
  return {
    sizeId,
    grade: 'WWT',
    available: true,
    pickupAvailable: true,
    pickupUnitPrice: unit - 51.45,
    pickupLocationId: 'b4dac368-108e-45b9-aee0-76c4ebb739e4',
    pickupLocationName: 'Cincinnati',
    pickupDistanceMiles: 44.7,
    deliveryAvailable: true,
    [UNIT_PRICE_BASIS]: unit,
    baseDeliveryCost: delivery,
    deliveryLocationId: '0d6685bb-1ec7-4508-afc7-b3f5c76337a9',
    deliveryDriverId: '748c11fa-14a0-4161-8292-7501459ae945',
    // Provenance only. The smaller of the two unit prices, never summed into anything.
    [MIN_OF_TWO_FIELD]: Math.min(unit, unit - 51.45),
    ...extra,
  };
}

function newRow(sizeId, unit, delivery) {
  return { ...wwtRow(sizeId, unit, delivery), grade: 'NEW' };
}

/**
 * The three WWT rows as measured at centroid 45404 on 2026-08-17, with the base delivery cost of the
 * 20ft raised to a round 600 so that the correct total and the total from the lower field land on
 * different multiples of ten. The correct 20ft total is 2090 and the wrong one is 2040.
 */
function daytonPayload(overrides = {}) {
  return {
    zip: '45404',
    serviceable: true,
    byKey: {
      'new:20-std': newRow('20-std', 2469.6, 677.19),
      'used:20-std': wwtRow('20-std', 1492.05, 600),
      'used:40-std': wwtRow('40-std', 1852.2, 550),
      'used:40-hc': wwtRow('40-hc', 1749.3, 550),
    },
    ...overrides,
  };
}

/**
 * A second clean metro, so the whole run tests cover more than one. The 20ft unit price here is
 * deliberately NOT 1440.60. That value is the lower min of two field measured at 45404, and the rule
 * in the header is that it appears only inside negative assertions, never as a delivery unit price in
 * a fixture. Note for the reader who checks against the live feed: at centroid 45237 the two fields
 * happen to be equal and 1440.60 genuinely IS the delivery unit price there, which is precisely the
 * coincidence that let the wrong arithmetic look right for weeks. A fixture must not lean on it.
 */
function cincinnatiPayload() {
  return {
    zip: '45237',
    serviceable: true,
    byKey: {
      'used:20-std': wwtRow('20-std', 1543.5, 700),
      'used:40-std': wwtRow('40-std', 1852.2, 700),
      'used:40-hc': wwtRow('40-hc', 1749.3, 700),
    },
  };
}

function metroFixture(zip, delivered, effectiveSince = EARLIER) {
  const skus = {};
  for (const sku of SKU_KEYS) {
    skus[sku] = {
      delivered: delivered[sku],
      pickup: delivered[sku] - 600,
      pickupDistanceMiles: 44.7,
      available: true,
      effectiveSince,
    };
  }
  return { zip, skus };
}

const baseArgs = { slug: 'dayton-shipping-containers', zip: '45404', warm: true, today: TODAY };

/* ----------------------------------------------------------------- grade filter */

test('selectWwt keeps only the grade this site sells', () => {
  const rows = selectWwt(daytonPayload());
  assert.equal(rows.length, 3);
  assert.deepEqual(
    rows.map((r) => r.sizeId).sort(),
    ['20-std', '40-hc', '40-std'],
  );
});

test('selectWwt returns nothing when the out of scope grade is all the feed has', () => {
  const payload = { zip: '45404', serviceable: true, byKey: { 'new:20-std': newRow('20-std', 2469.6, 677.19) } };
  assert.deepEqual(selectWwt(payload), []);
});

test('selectWwt tolerates a missing or malformed body', () => {
  assert.deepEqual(selectWwt(undefined), []);
  assert.deepEqual(selectWwt({}), []);
  assert.deepEqual(selectWwt({ byKey: null }), []);
});

test('rowForSize returns the single row or nothing at all', () => {
  const rows = selectWwt(daytonPayload());
  assert.equal(rowForSize(rows, '20-std').sizeId, '20-std');
  assert.equal(rowForSize(rows, '20-hc'), null);
  assert.equal(rowForSize([...rows, wwtRow('20-std', 1492.05, 600)], '20-std'), null);
});

/* ------------------------------------------------------------ arithmetic basis */

test('deliveredPrice sums the delivery unit price and the delivery cost and rounds the sum', () => {
  assert.equal(deliveredPrice({ [UNIT_PRICE_BASIS]: 1492.05, baseDeliveryCost: 600 }), 2090);
  assert.equal(deliveredPrice({ [UNIT_PRICE_BASIS]: 1492.05, baseDeliveryCost: 597.5 }), 2090);
});

test('deliveredPrice rounds the sum once and never the two parts', () => {
  const once = deliveredPrice({ [UNIT_PRICE_BASIS]: 1444.96, baseDeliveryCost: 600.04 });
  const parts = roundToTen(1444.96) + roundToTen(600.04);
  assert.equal(once, 2050);
  assert.equal(parts, 2040);
  assert.notEqual(once, parts);
});

test('deliveredPrice ignores the lower min of two field entirely', () => {
  // The 45404 row as measured: the lower field is 51.45 below the delivery unit price. The correct
  // total is 2090. A total built from the lower field would be 2040, and that is the bug.
  const row = wwtRow('20-std', 1492.05, 600);
  assert.equal(row[MIN_OF_TWO_FIELD], 1440.6);
  assert.equal(deliveredPrice(row), 2090);
  assert.notEqual(deliveredPrice(row), 2040);
  assert.notEqual(deliveredPrice(row), roundToTen(row[MIN_OF_TWO_FIELD] + row.baseDeliveryCost));
});

test('deliveredPrice refuses to guess when either input is not a finite number', () => {
  for (const bad of [null, undefined, NaN, '1492.05', {}]) {
    assert.throws(() => deliveredPrice({ [UNIT_PRICE_BASIS]: bad, baseDeliveryCost: 600 }), TypeError);
    assert.throws(() => deliveredPrice({ [UNIT_PRICE_BASIS]: 1492.05, baseDeliveryCost: bad }), TypeError);
  }
});

test('pickupFigure rounds a usable pickup unit price and otherwise reports nothing', () => {
  assert.equal(pickupFigure({ pickupUnitPrice: 1440.6 }), 1440);
  assert.equal(pickupFigure({ pickupUnitPrice: 1445 }), 1450);
  assert.equal(pickupFigure({}), null);
  assert.equal(pickupFigure({ pickupUnitPrice: null }), null);
  assert.equal(pickupFigure({ pickupUnitPrice: 0 }), null);
  assert.equal(pickupFigure({ pickupUnitPrice: 'cheap' }), null);
});

/* -------------------------------------------------------------------- bounds */

test('withinBounds rejects at each edge and accepts on the boundary', () => {
  assert.equal(withinBounds(1199), false);
  assert.equal(withinBounds(FIGURE_MIN), true);
  assert.equal(withinBounds(FIGURE_MAX), true);
  assert.equal(withinBounds(6001), false);
  assert.equal(withinBounds(NaN), false);
});

test('a delivered figure below the floor fails the metro and writes no record', () => {
  const payload = daytonPayload();
  payload.byKey['used:20-std'] = wwtRow('20-std', 600, 550);
  const result = validateMetro({ ...baseArgs, payload });
  assert.equal(result.record, null);
  assert.equal(result.errors.length, 1);
  assert.equal(result.errors[0].check, 'delivered-bounds');
  assert.equal(result.errors[0].sku, '20ftCargo');
});

test('a delivered figure above the ceiling fails the metro, which is what a decimal shift looks like', () => {
  const payload = daytonPayload();
  payload.byKey['used:20-std'] = wwtRow('20-std', 14920.5, 600);
  const result = validateMetro({ ...baseArgs, payload });
  assert.equal(result.record, null);
  assert.equal(result.errors[0].check, 'delivered-bounds');
  assert.equal(result.errors[0].rejected, 15520);
});

/* ------------------------------------------------------------- move ceiling */

test('moveWithinCeiling allows a normal move and rejects a twenty percent one in either direction', () => {
  assert.equal(moveWithinCeiling(2100, 2090), true);
  assert.equal(moveWithinCeiling(2508, 2090), true);
  assert.equal(moveWithinCeiling(2600, 2090), false);
  assert.equal(moveWithinCeiling(1672, 2090), true);
  assert.equal(moveWithinCeiling(1600, 2090), false);
});

test('moveWithinCeiling is skipped for a metro with nothing committed to move from', () => {
  assert.equal(moveWithinCeiling(2090, undefined), true);
  assert.equal(moveWithinCeiling(2090, null), true);
  assert.equal(moveWithinCeiling(2090, 0), true);
});

test('a delivered figure that moved too far fails the metro and reports both values', () => {
  const committedMetro = metroFixture('45404', {
    '20ftCargo': 4000,
    '40ftStandard': 2400,
    '40ftStandardHC': 2300,
  });
  const result = validateMetro({ ...baseArgs, payload: daytonPayload(), committedMetro });
  assert.equal(result.record, null);
  assert.equal(result.errors[0].check, 'delivered-move-ceiling');
  assert.equal(result.errors[0].committed, 4000);
  assert.equal(result.errors[0].rejected, 2090);
});

/* ------------------------------------------------------------ the whole metro */

test('a clean metro yields exactly the five allowlisted fields per SKU and the right totals', () => {
  const result = validateMetro({ ...baseArgs, payload: daytonPayload() });
  assert.equal(result.errors.length, 0);
  assert.deepEqual(Object.keys(result.record).sort(), ['skus', 'zip']);
  assert.equal(result.record.zip, '45404');
  assert.deepEqual(Object.keys(result.record.skus), SKU_KEYS);
  for (const sku of SKU_KEYS) {
    assert.deepEqual(Object.keys(result.record.skus[sku]).sort(), [
      'available',
      'delivered',
      'effectiveSince',
      'pickup',
      'pickupDistanceMiles',
    ]);
  }
  assert.equal(result.record.skus['20ftCargo'].delivered, 2090);
  assert.equal(result.record.skus['40ftStandard'].delivered, 2400);
  assert.equal(result.record.skus['40ftStandardHC'].delivered, 2300);
});

test('a metro fails when the feed answers for another ZIP or reports itself unserviceable', () => {
  const wrongZip = validateMetro({ ...baseArgs, payload: daytonPayload({ zip: '45202' }) });
  assert.equal(wrongZip.errors.some((e) => e.check === 'zip-echo'), true);
  const dead = validateMetro({ ...baseArgs, payload: daytonPayload({ serviceable: false }) });
  assert.equal(dead.errors.some((e) => e.check === 'serviceable'), true);
});

test('a missing WWT row for a required SKU fails the run, which is the grade string change signature', () => {
  const payload = daytonPayload();
  delete payload.byKey['used:40-hc'];
  const result = validateMetro({ ...baseArgs, payload });
  assert.equal(result.record, null);
  assert.equal(result.errors[0].check, 'row-present');
  assert.equal(result.errors[0].sku, '40ftStandardHC');
});

test('zero WWT rows fails the run rather than returning an empty metro', () => {
  const payload = { zip: '45404', serviceable: true, byKey: { 'new:20-std': newRow('20-std', 2469.6, 677.19) } };
  const result = validateMetro({ ...baseArgs, payload });
  assert.equal(result.record, null);
  assert.equal(result.errors.some((e) => e.check === 'grade-filter'), true);
});

test('a non finite delivery unit price or delivery cost fails the SKU', () => {
  const payload = daytonPayload();
  payload.byKey['used:20-std'] = wwtRow('20-std', 1492.05, 600);
  payload.byKey['used:20-std'][UNIT_PRICE_BASIS] = null;
  const result = validateMetro({ ...baseArgs, payload });
  assert.equal(result.record, null);
  assert.equal(result.errors[0].check, 'unit-and-delivery-finite');
});

test('a missing pickup unit price writes no pickup figure and does not fail the run', () => {
  const payload = daytonPayload();
  payload.byKey['used:20-std'] = wwtRow('20-std', 1492.05, 600, { pickupUnitPrice: null });
  const result = validateMetro({ ...baseArgs, payload });
  assert.equal(result.errors.length, 0);
  assert.equal(result.record.skus['20ftCargo'].pickup, null);
  assert.equal(result.record.skus['20ftCargo'].delivered, 2090);
  assert.equal(result.warnings.some((w) => w.check === 'pickup-absent'), true);
});

test('an out of bounds pickup figure is withheld with a warning and still does not fail the run', () => {
  const payload = daytonPayload();
  payload.byKey['used:20-std'] = wwtRow('20-std', 1492.05, 600, { pickupUnitPrice: 99000 });
  const result = validateMetro({ ...baseArgs, payload });
  assert.equal(result.errors.length, 0);
  assert.equal(result.record.skus['20ftCargo'].pickup, null);
  assert.equal(result.warnings.some((w) => w.check === 'pickup-bounds'), true);
});

/**
 * The pickup floor is lower than the delivered floor because the two are different quantities, and the
 * live feed proved it: a savannah 20ft pickup unit price of 1183.35 rounds to 1180 and was withheld by
 * the shared floor of 1200, so a real figure was suppressed and that metro would have shipped with no
 * pickup disclosure at all. Delivered is a total, pickup is a bare unit price.
 */
test('pickupWithinBounds uses the lower pickup floor and rejects at each edge', () => {
  assert.ok(PICKUP_MIN < FIGURE_MIN);
  assert.equal(pickupWithinBounds(PICKUP_MIN - 1), false);
  assert.equal(pickupWithinBounds(PICKUP_MIN), true);
  assert.equal(pickupWithinBounds(FIGURE_MAX), true);
  assert.equal(pickupWithinBounds(FIGURE_MAX + 1), false);
  assert.equal(pickupWithinBounds(NaN), false);
  // the measured figure this floor exists for, and the same figure after a legal one run move
  assert.equal(pickupWithinBounds(1180), true);
  assert.equal(pickupWithinBounds(roundToTen(1180 * 0.8)), true);
  // and it still catches a cents reading, a decimal shift and a zeroed field
  for (const corrupt of [0, 11.83, 118.34]) assert.equal(pickupWithinBounds(corrupt), false);
});

test('a pickup figure under the delivered floor is published rather than withheld', () => {
  const payload = daytonPayload();
  payload.byKey['used:20-std'] = wwtRow('20-std', 1492.05, 600, { pickupUnitPrice: 1183.35 });
  const result = validateMetro({ ...baseArgs, payload });
  assert.equal(result.errors.length, 0);
  assert.equal(result.record.skus['20ftCargo'].pickup, 1180);
  assert.equal(result.warnings.some((w) => w.check === 'pickup-bounds'), false);
  assert.equal(result.warnings.some((w) => w.check === 'pickup-absent'), false);
});

test('a pickup figure under the pickup floor is still withheld', () => {
  const payload = daytonPayload();
  payload.byKey['used:20-std'] = wwtRow('20-std', 1492.05, 600, { pickupUnitPrice: 118.34 });
  const result = validateMetro({ ...baseArgs, payload });
  assert.equal(result.errors.length, 0);
  assert.equal(result.record.skus['20ftCargo'].pickup, null);
  assert.equal(result.warnings.some((w) => w.check === 'pickup-bounds'), true);
});

test('an implausible pickup distance is dropped rather than published', () => {
  const payload = daytonPayload();
  payload.byKey['used:20-std'] = wwtRow('20-std', 1492.05, 600, { pickupDistanceMiles: 99999 });
  const result = validateMetro({ ...baseArgs, payload });
  assert.equal(result.record.skus['20ftCargo'].pickupDistanceMiles, null);
});

test('the record never carries a feed identifier or a location name', () => {
  const result = validateMetro({ ...baseArgs, payload: daytonPayload() });
  const text = JSON.stringify(result.record);
  assert.equal(SUPPLIER.test(text), false);
  for (const key of ['grade', 'sizeId', MIN_OF_TWO_FIELD, 'pickupLocationName', 'pickupLocationId', 'deliveryDriverId']) {
    assert.equal(text.includes(key), false, `${key} must not reach the record`);
  }
});

test('the provenance check warns when the lower feed field comes back above the delivery unit price', () => {
  const payload = daytonPayload();
  payload.byKey['used:20-std'] = wwtRow('20-std', 1492.05, 600, { [MIN_OF_TWO_FIELD]: 1600 });
  const result = validateMetro({ ...baseArgs, payload });
  assert.equal(result.errors.length, 0);
  assert.equal(result.warnings.some((w) => w.check === 'provenance-basis'), true);
  assert.equal(result.record.skus['20ftCargo'].delivered, 2090);
});

/* ------------------------------------------------------------- change dates */

test('resolveEffectiveSince carries an unchanged figure forward and stamps only the one that moved', () => {
  const committedSku = { delivered: 2090, effectiveSince: EARLIER };
  assert.equal(resolveEffectiveSince({ delivered: 2090, committedSku, today: TODAY }), EARLIER);
  assert.equal(resolveEffectiveSince({ delivered: 2100, committedSku, today: TODAY }), TODAY);
});

test('resolveEffectiveSince refuses a missing, malformed or future committed date', () => {
  assert.equal(resolveEffectiveSince({ delivered: 2090, committedSku: undefined, today: TODAY }), TODAY);
  assert.equal(
    resolveEffectiveSince({ delivered: 2090, committedSku: { delivered: 2090, effectiveSince: 'yesterday' }, today: TODAY }),
    TODAY,
  );
  assert.equal(
    resolveEffectiveSince({ delivered: 2090, committedSku: { delivered: 2090, effectiveSince: '2099-01-01' }, today: TODAY }),
    TODAY,
  );
});

test('one moved SKU takes todays date while the other two keep the date they have held', () => {
  const committedMetro = metroFixture('45404', {
    '20ftCargo': 2040,
    '40ftStandard': 2400,
    '40ftStandardHC': 2300,
  });
  const result = validateMetro({ ...baseArgs, payload: daytonPayload(), committedMetro });
  assert.equal(result.record.skus['20ftCargo'].delivered, 2090);
  assert.equal(result.record.skus['20ftCargo'].effectiveSince, TODAY);
  assert.equal(result.record.skus['40ftStandard'].effectiveSince, EARLIER);
  assert.equal(result.record.skus['40ftStandardHC'].effectiveSince, EARLIER);
});

/* ------------------------------------------------------------- the hysteresis */

test('resolveAvailability publishes immediately when the feed says available', () => {
  const r = resolveAvailability({ feedAvailable: true, committedAvailable: false, pendingFalse: true, warm: true });
  assert.deepEqual(r, { available: true, pendingFalse: false, held: false, degraded: false });
});

test('resolveAvailability holds the first unavailable observation and suppresses on the second', () => {
  const first = resolveAvailability({ feedAvailable: false, committedAvailable: true, pendingFalse: false, warm: true });
  assert.equal(first.available, true);
  assert.equal(first.pendingFalse, true);
  assert.equal(first.held, true);
  const second = resolveAvailability({ feedAvailable: false, committedAvailable: true, pendingFalse: true, warm: true });
  assert.equal(second.available, false);
  assert.equal(second.held, false);
  assert.equal(second.degraded, false);
});

test('resolveAvailability degrades visibly rather than guessing when there is no previous run state', () => {
  const cold = resolveAvailability({ feedAvailable: false, committedAvailable: true, pendingFalse: true, warm: false });
  assert.equal(cold.available, true);
  assert.equal(cold.held, true);
  assert.equal(cold.degraded, true);
  assert.equal(cold.pendingFalse, true);
});

test('an unavailable SKU is held for one run and then suppressed, and the pending flag rides along', () => {
  const payload = daytonPayload();
  payload.byKey['used:40-hc'] = wwtRow('40-hc', 1749.3, 550, { available: false });
  const committedMetro = metroFixture('45404', {
    '20ftCargo': 2090,
    '40ftStandard': 2400,
    '40ftStandardHC': 2300,
  });

  const firstRun = validateMetro({ ...baseArgs, payload, committedMetro, pending: [] });
  assert.equal(firstRun.record.skus['40ftStandardHC'].available, true);
  assert.deepEqual(firstRun.pendingNext, ['40ftStandardHC']);
  assert.equal(firstRun.warnings.some((w) => w.check === 'hysteresis-hold'), true);

  const secondRun = validateMetro({ ...baseArgs, payload, committedMetro, pending: firstRun.pendingNext });
  assert.equal(secondRun.record.skus['40ftStandardHC'].available, false);
  assert.equal(secondRun.record.skus['20ftCargo'].available, true);
  assert.deepEqual(secondRun.pendingNext, ['40ftStandardHC']);
});

test('an unavailable SKU with no run state is held and named, never suppressed silently', () => {
  const payload = daytonPayload();
  payload.byKey['used:40-hc'] = wwtRow('40-hc', 1749.3, 550, { deliveryAvailable: false });
  const result = validateMetro({ ...baseArgs, payload, warm: false, pending: ['40ftStandardHC'] });
  assert.equal(result.record.skus['40ftStandardHC'].available, true);
  assert.equal(result.warnings.some((w) => w.check === 'hysteresis-cold'), true);
});

/* --------------------------------------------------------------------- diff */

test('diffPricing reports nothing for an identical fetch, which is what makes a run a no op', () => {
  const committedMetro = metroFixture('45404', {
    '20ftCargo': 2090,
    '40ftStandard': 2400,
    '40ftStandardHC': 2300,
  });
  const result = validateMetro({ ...baseArgs, payload: daytonPayload(), committedMetro });
  const committed = { 'dayton-shipping-containers': committedMetro };
  const candidate = { 'dayton-shipping-containers': result.record };
  // The fixture pickup values have to match the computed ones for this to be a true no op.
  for (const sku of SKU_KEYS) {
    committed['dayton-shipping-containers'].skus[sku].pickup = candidate['dayton-shipping-containers'].skus[sku].pickup;
  }
  assert.deepEqual(diffPricing(committed, candidate), []);
});

test('diffPricing names the metro, the SKU and the field on every change', () => {
  const before = { a: metroFixture('45404', { '20ftCargo': 2040, '40ftStandard': 2400, '40ftStandardHC': 2300 }) };
  const after = { a: metroFixture('45404', { '20ftCargo': 2090, '40ftStandard': 2400, '40ftStandardHC': 2300 }) };
  const changes = diffPricing(before, after);
  assert.equal(changes.length, 2);
  assert.deepEqual(changes[0], { slug: 'a', sku: '20ftCargo', field: 'delivered', from: 2040, to: 2090 });
  assert.equal(changes[1].field, 'pickup');
});

test('diffPricing reports an added metro and a vanished one', () => {
  const m = metroFixture('45404', { '20ftCargo': 2090, '40ftStandard': 2400, '40ftStandardHC': 2300 });
  assert.deepEqual(diffPricing({}, { a: m }), [{ slug: 'a', sku: null, field: 'metro', from: 'absent', to: 'priced' }]);
  assert.deepEqual(diffPricing({ a: m }, {}), [{ slug: 'a', sku: null, field: 'metro', from: 'priced', to: 'absent' }]);
});

/* ---------------------------------------------------------------- serialiser */

const sampleData = {
  'dayton-shipping-containers': metroFixture('45404', {
    '20ftCargo': 2090,
    '40ftStandard': 2400,
    '40ftStandardHC': 2300,
  }),
  'cincinnati-shipping-containers': metroFixture('45237', {
    '20ftCargo': 2140,
    '40ftStandard': 2550,
    '40ftStandardHC': 2450,
  }),
};

test('the serialised module is printable ASCII, carries no supplier name and no identifier', () => {
  const text = serialise({ geoPricing: sampleData, lastVerified: TODAY });
  assert.match(text, PRINTABLE_ASCII);
  assert.equal(DASHES.test(text), false);
  assert.equal(SUPPLIER.test(text), false);
  assert.equal(/\bNEW\b/.test(text), false);
  assert.equal(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(text), false);
});

test('the serialised module is byte stable for equal data regardless of insertion order', () => {
  const forward = serialise({ geoPricing: sampleData, lastVerified: TODAY });
  const reversed = {};
  for (const slug of Object.keys(sampleData).reverse()) reversed[slug] = sampleData[slug];
  assert.equal(serialise({ geoPricing: reversed, lastVerified: TODAY }), forward);
  assert.equal(serialise({ geoPricing: sampleData, lastVerified: TODAY }), forward);
});

test('the serialised module reads back as exactly the data it was given', () => {
  const text = serialise({ geoPricing: sampleData, lastVerified: TODAY });
  const back = parseCommitted(text);
  assert.equal(back.lastVerified, TODAY);
  assert.deepEqual(back.geoPricing, orderForOutput(sampleData));
});

test('the key form transform is exactly invertible', () => {
  const json = JSON.stringify(orderForOutput(sampleData), null, 2);
  assert.equal(toJsonKeys(toTsKeys(json)), json);
  assert.equal(toTsKeys(json).includes('"zip"'), false);
  assert.equal(toTsKeys(json).includes('"dayton-shipping-containers"'), true);
});

test('the committed module is exactly what the serialiser would write for the data it holds', () => {
  // Round trip identity, asserted against the real file rather than a fixture, and it holds in the
  // empty state and after the first population alike. It catches two things at once: a hand edit to
  // the generated module, and any drift between the template held in the script and the file on disk.
  const text = readFileSync(COMMITTED, 'utf8');
  const { geoPricing, lastVerified } = parseCommitted(text);
  assert.equal(serialise({ geoPricing, lastVerified }), text);
});

test('an empty harvest writes an empty map and no verification date, never a zero price', () => {
  const text = serialise({ geoPricing: {}, lastVerified: null });
  assert.match(text, /export const geoPricing: Record<string, GeoMetroPricing> = \{\};/);
  assert.match(text, /export const lastVerified: string \| null = null;/);
  assert.deepEqual(parseCommitted(text).geoPricing, {});
});

test('inspectSerialised passes clean output and fails a dishonest date pairing in both directions', () => {
  const good = serialise({ geoPricing: sampleData, lastVerified: TODAY });
  assert.deepEqual(inspectSerialised(good, { geoPricing: sampleData, lastVerified: TODAY, today: TODAY }), []);

  const noDate = serialise({ geoPricing: sampleData, lastVerified: null });
  const a = inspectSerialised(noDate, { geoPricing: sampleData, lastVerified: null, today: TODAY });
  assert.equal(a.some((p) => p.includes('no verification date is dishonest')), true);

  const noPrices = serialise({ geoPricing: {}, lastVerified: TODAY });
  const b = inspectSerialised(noPrices, { geoPricing: {}, lastVerified: TODAY, today: TODAY });
  assert.equal(b.some((p) => p.includes('no priced metro is dishonest')), true);
});

test('inspectSerialised rejects a figure that is not a whole ten in bounds and a future change date', () => {
  const broken = structuredClone(sampleData);
  broken['dayton-shipping-containers'].skus['20ftCargo'].delivered = 2092.05;
  const problems = inspectSerialised(serialise({ geoPricing: broken, lastVerified: TODAY }), {
    geoPricing: broken,
    lastVerified: TODAY,
    today: TODAY,
  });
  assert.equal(problems.some((p) => p.includes('is not a whole ten in bounds')), true);

  const future = structuredClone(sampleData);
  future['dayton-shipping-containers'].skus['20ftCargo'].effectiveSince = '2099-01-01';
  const laterProblems = inspectSerialised(serialise({ geoPricing: future, lastVerified: TODAY }), {
    geoPricing: future,
    lastVerified: TODAY,
    today: TODAY,
  });
  assert.equal(laterProblems.some((p) => p.includes('dated in the future')), true);
  assert.equal(laterProblems.some((p) => p.includes('changed after the run that verified it')), true);
});

/* -------------------------------------------------------------- module readers */

test('parseCentroids reads every hand written metro and its ZIP', () => {
  const centroids = parseCentroids(readFileSync(CENTROIDS, 'utf8'));
  assert.equal(centroids.length, 15);
  const dayton = centroids.find((c) => c.slug === 'dayton-shipping-containers');
  assert.equal(dayton.zip, '45404');
  assert.equal(dayton.publish, true);
  for (const c of centroids) assert.match(c.zip, /^[0-9]{5}$/);
});

test('parseCommitted reads the committed module in whichever state it is in', () => {
  // Deliberately state agnostic. An assertion that the module is empty would pass today and fail on
  // the first population, which is a test that has to be edited to stay true and therefore is not a
  // test. What must hold in both states is the honesty pairing and the field shape.
  const committed = parseCommitted(readFileSync(COMMITTED, 'utf8'));
  const slugs = Object.keys(committed.geoPricing);
  if (slugs.length === 0) {
    assert.equal(committed.lastVerified, null);
  } else {
    assert.match(committed.lastVerified, /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/);
    for (const slug of slugs) {
      assert.match(committed.geoPricing[slug].zip, /^[0-9]{5}$/);
      assert.deepEqual(Object.keys(committed.geoPricing[slug].skus), SKU_KEYS);
    }
  }
});

test('parseCommitted refuses a module it cannot read rather than assuming it is empty', () => {
  assert.throws(() => parseCommitted('export const nothing = 1;'), /cannot read lastVerified/);
  assert.throws(
    () => parseCommitted("export const lastVerified: string | null = null;\n"),
    /cannot find the geoPricing declaration/,
  );
});

/* ------------------------------------------------------------- the whole run */

function fakeFetch(byZip, log = []) {
  return async (url) => {
    const zip = new URL(url).searchParams.get('zip');
    log.push(zip);
    if (!byZip[zip]) return { ok: false, status: 404, text: async () => 'no' };
    return { ok: true, status: 200, text: async () => JSON.stringify(byZip[zip]) };
  };
}

function scratch() {
  const dir = mkdtempSync(join(tmpdir(), 'harvest-test-'));
  const centroids = join(dir, 'geoCentroids.ts');
  writeFileSync(
    centroids,
    [
      'export const geoCentroids = [',
      "  { slug: 'dayton-shipping-containers', zip: '45404', publish: true },",
      "  { slug: 'cincinnati-shipping-containers', zip: '45237', publish: true },",
      '];',
      '',
    ].join('\n'),
  );
  const committed = join(dir, 'geoPricing.ts');
  writeFileSync(committed, readFileSync(COMMITTED, 'utf8'));
  return { dir, centroids, committed, out: join(dir, 'out.ts'), state: join(dir, 'state.json') };
}

function runArgs(paths, extra = []) {
  return [
    `--centroids=${paths.centroids}`,
    `--committed=${paths.committed}`,
    `--out=${paths.out}`,
    `--state=${paths.state}`,
    '--delay=0',
    `--today=${TODAY}`,
    ...extra,
  ];
}

async function run(paths, feed, extra = []) {
  const summaries = [];
  const logs = [];
  const code = await main(runArgs(paths, extra), {
    log: (line) => logs.push(line),
    emit: (s) => summaries.push(s),
    fetchOpts: { fetchImpl: fakeFetch(feed), sleepImpl: async () => {} },
  });
  return { code, summary: summaries[0], logs, summaries };
}

test('a clean run writes the module once and then finds nothing to do on the next run', async () => {
  const paths = scratch();
  try {
    const feed = { 45404: daytonPayload(), 45237: cincinnatiPayload() };
    const first = await run(paths, feed);
    assert.equal(first.code, 0);
    assert.equal(first.summary.status, 'written');
    assert.equal(first.summary.wrote, true);
    assert.equal(first.summary.metrosPriced, 2);
    assert.equal(existsSync(paths.out), true);

    const written = parseCommitted(readFileSync(paths.out, 'utf8'));
    assert.equal(written.lastVerified, TODAY);
    assert.equal(written.geoPricing['dayton-shipping-containers'].skus['20ftCargo'].delivered, 2090);
    assert.equal(written.geoPricing['cincinnati-shipping-containers'].skus['20ftCargo'].delivered, 2240);
    assert.equal(written.geoPricing['dayton-shipping-containers'].skus['20ftCargo'].effectiveSince, TODAY);

    // Second run against the file it just wrote: same feed, so no change and no rewrite.
    const second = await run({ ...paths, committed: paths.out }, feed);
    assert.equal(second.code, 0);
    assert.equal(second.summary.status, 'no-change');
    assert.equal(second.summary.wrote, false);
    assert.equal(second.summary.changeCount, 0);
  } finally {
    rmSync(paths.dir, { recursive: true, force: true });
  }
});

test('one bad SKU in one metro produces zero writes and leaves the previous module untouched', async () => {
  const paths = scratch();
  try {
    const bad = daytonPayload();
    bad.byKey['used:20-std'] = wwtRow('20-std', 600, 100);
    const before = readFileSync(paths.committed, 'utf8');
    const result = await run(paths, { 45404: bad, 45237: cincinnatiPayload() });
    assert.equal(result.code, 1);
    assert.equal(result.summary.status, 'failed');
    assert.equal(result.summary.wrote, false);
    assert.equal(existsSync(paths.out), false);
    assert.equal(readFileSync(paths.committed, 'utf8'), before);
    assert.equal(result.summary.failures[0].check, 'delivered-bounds');
    // The healthy metro is not written on its own: the run is all or nothing.
    assert.equal(result.summary.changeCount, 0);
  } finally {
    rmSync(paths.dir, { recursive: true, force: true });
  }
});

test('a transport failure fails the run and writes nothing', async () => {
  const paths = scratch();
  try {
    const result = await run(paths, { 45404: daytonPayload() }, ['--delay=0']);
    assert.equal(result.code, 1);
    assert.equal(result.summary.failures.some((f) => f.check === 'transport'), true);
    assert.equal(existsSync(paths.out), false);
  } finally {
    rmSync(paths.dir, { recursive: true, force: true });
  }
});

test('a dry run fetches, validates, diffs and writes absolutely nothing', async () => {
  const paths = scratch();
  try {
    const result = await run(paths, { 45404: daytonPayload(), 45237: cincinnatiPayload() }, ['--dry-run']);
    assert.equal(result.code, 0);
    assert.equal(result.summary.status, 'would-write');
    assert.equal(result.summary.wrote, false);
    assert.equal(result.summary.changeCount > 0, true);
    assert.equal(existsSync(paths.out), false);
    assert.equal(existsSync(paths.state), false);
  } finally {
    rmSync(paths.dir, { recursive: true, force: true });
  }
});

test('the run state carries the pending unavailable flags between runs, which is where hysteresis lives', async () => {
  const paths = scratch();
  try {
    const flapping = daytonPayload();
    flapping.byKey['used:40-hc'] = wwtRow('40-hc', 1749.3, 550, { available: false });
    const feed = { 45404: flapping, 45237: cincinnatiPayload() };

    const first = await run(paths, feed);
    assert.equal(first.code, 0);
    assert.equal(first.summary.hysteresis, 'cold');
    assert.equal(first.summary.unsuppressed.length, 1);
    const state = JSON.parse(readFileSync(paths.state, 'utf8'));
    assert.deepEqual(state.pendingUnavailable['dayton-shipping-containers'], ['40ftStandardHC']);
    assert.equal(state.lastVerified, TODAY);
    assert.equal(parseCommitted(readFileSync(paths.out, 'utf8')).geoPricing['dayton-shipping-containers'].skus['40ftStandardHC'].available, true);

    const second = await run({ ...paths, committed: paths.out }, feed);
    assert.equal(second.summary.hysteresis, 'warm');
    assert.equal(second.summary.status, 'written');
    assert.equal(parseCommitted(readFileSync(paths.out, 'utf8')).geoPricing['dayton-shipping-containers'].skus['40ftStandardHC'].available, false);
  } finally {
    rmSync(paths.dir, { recursive: true, force: true });
  }
});

test('a subset selection is forced to a dry run, because a partial file breaks the coverage guard', async () => {
  const paths = scratch();
  try {
    const result = await run(paths, { 45404: daytonPayload() }, ['--only=45404']);
    assert.equal(result.code, 0);
    assert.equal(result.summary.dryRun, true);
    assert.equal(result.summary.metrosRequested, 1);
    assert.equal(existsSync(paths.out), false);
  } finally {
    rmSync(paths.dir, { recursive: true, force: true });
  }
});

test('the default write target is the committed module and a subset can never reach it', () => {
  // Deliberately asserted through parseArgs rather than by running main with no out path, because a
  // test that ran the real target would populate the committed module as a side effect.
  assert.equal(DEFAULT_PATHS.out, join(REPO_ROOT, 'src/data/geoPricing.ts'));
  assert.equal(DEFAULT_PATHS.committed, DEFAULT_PATHS.out);
  assert.equal(parseArgs(['--only=45404']).dryRun, true);
  assert.equal(parseArgs([]).dryRun, false);
  assert.throws(() => parseArgs(['--wat']), /unknown argument/);
});

test('the summary is a single machine readable object and every human line goes elsewhere', async () => {
  const paths = scratch();
  try {
    const result = await run(paths, { 45404: daytonPayload(), 45237: cincinnatiPayload() }, ['--dry-run']);
    assert.equal(result.summaries.length, 1);
    assert.equal(result.summary.schema, 'geo-pricing-harvest/1');
    assert.equal(result.summary.unitPriceBasis, UNIT_PRICE_BASIS);
    assert.equal(typeof JSON.parse(JSON.stringify(result.summary)), 'object');
    assert.equal(result.logs.length > 0, true);
  } finally {
    rmSync(paths.dir, { recursive: true, force: true });
  }
});

/* ------------------------------------------------------------- source hygiene */

test('neither source file carries an em dash or an en dash (HS-OUT-001)', () => {
  for (const file of [SCRIPT, TESTS]) {
    const text = readFileSync(file, 'utf8');
    assert.equal(DASHES.test(text), false, `${file} carries a dash character`);
    assert.match(text, PRINTABLE_ASCII, `${file} is not printable ASCII`);
  }
});

test('the script never places the lower min of two field beside a plus sign', () => {
  // The same assertion src/data/geoPricing.test.ts makes, kept here so the harvest suite catches it
  // first. Reading the field is fine. Adding it to anything is the bug.
  const text = readFileSync(SCRIPT, 'utf8');
  assert.equal(/fromPrice[^\n]{0,24}\+|\+[^\n]{0,24}fromPrice/.test(text), false);
});
