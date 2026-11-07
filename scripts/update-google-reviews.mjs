#!/usr/bin/env node
/**
 * scripts/update-google-reviews.mjs
 *
 * Writes src/data/googleReviews.json from a validated stars and count pair, and nothing else. Called by
 * .github/workflows/google-reviews.yml (workflow_dispatch, the stopgap manual entry while Business
 * Profile API access is pending). Never runs git, never deploys.
 *
 * ALL OR NOTHING. Every check in src/lib/reviews/googleReviewsRules.mjs runs before anything is
 * written. On any failure the file is left byte identical and the exit code is 1.
 *
 * STDOUT carries exactly one JSON summary line and nothing else, so the workflow can branch on it:
 *   {"status":"written","changed":["reviewCount"],"stars":"5.0","count":12,"checkedAt":"2026-11-14"}
 *   {"status":"date-only","changed":[],...}   the numbers matched, only checkedAt moved
 *   {"status":"unchanged",...}                same numbers, same day, the file is already current
 *   {"status":"failed","reason":"..."}
 *
 * Usage:
 *   node scripts/update-google-reviews.mjs --stars 5.0 --count 11
 *   node scripts/update-google-reviews.mjs --stars 5.0 --count 11 --dry-run
 *   node scripts/update-google-reviews.mjs --report-age      prints checkedAt and age, writes nothing
 * Test hooks: --file <path> to target another file, --today YYYY-MM-DD to pin the clock.
 *
 * No apostrophes or quote characters in comments, and no em or en dashes anywhere (HS-OUT-001).
 */

import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  validateUpdate,
  serializeRecord,
  ageInDays,
  parseIsoDate,
  isShowable,
  watchdogNotifyToday,
  FLAG_AGE_DAYS,
  REBUILD_AGE_DAYS,
  REBUILD_STOP_AGE_DAYS,
  MAX_SHOW_AGE_DAYS,
} from '../src/lib/reviews/googleReviewsRules.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_FILE = join(HERE, '..', 'src', 'data', 'googleReviews.json');

function parseArgs(argv) {
  const out = { dryRun: false, reportAge: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const take = () => argv[++i];
    if (a === '--stars') out.stars = take();
    else if (a === '--count') out.count = take();
    else if (a === '--file') out.file = take();
    else if (a === '--today') out.today = take();
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--report-age') out.reportAge = true;
    else throw new Error(`unknown argument ${a}`);
  }
  return out;
}

function emit(summary) {
  process.stdout.write(JSON.stringify(summary) + '\n');
}

function fail(reason) {
  emit({ status: 'failed', reason });
  process.stderr.write(`update-google-reviews: ${reason}\n`);
  process.exit(1);
}

let args;
try {
  args = parseArgs(process.argv.slice(2));
} catch (e) {
  fail(e.message);
}

let now = new Date();
if (args.today !== undefined) {
  const t = parseIsoDate(args.today);
  if (Number.isNaN(t)) fail('--today must be a YYYY-MM-DD date');
  now = new Date(t + 12 * 3600000);
}

const file = args.file ?? DEFAULT_FILE;

let previous;
try {
  previous = JSON.parse(readFileSync(file, 'utf8'));
} catch (e) {
  fail(`could not read the committed record: ${e.message}`);
}

if (args.reportAge) {
  const age = ageInDays(previous?.checkedAt, now);
  emit({
    status: 'age',
    checkedAt: previous?.checkedAt ?? null,
    ageDays: Number.isNaN(age) ? null : age,
    showable: isShowable(previous, now),
    flag: Number.isNaN(age) || age >= FLAG_AGE_DAYS,
    notifyToday: watchdogNotifyToday(Number.isNaN(age) ? NaN : age),
    rebuild: !Number.isNaN(age) && age >= REBUILD_AGE_DAYS && age <= REBUILD_STOP_AGE_DAYS,
    hideAfterDays: MAX_SHOW_AGE_DAYS,
  });
  process.exit(0);
}

if (args.stars === undefined || args.count === undefined) fail('both --stars and --count are required');

const result = validateUpdate(previous, { stars: args.stars, count: args.count }, now);
if (!result.ok) fail(result.reason);

const next = result.next;
const body = serializeRecord(next);
const current = readFileSync(file, 'utf8');
const summary = {
  stars: next.averageStars.toFixed(1),
  count: next.reviewCount,
  previousCount: previous?.reviewCount ?? null,
  checkedAt: next.checkedAt,
  changed: result.changed,
};

if (body === current) {
  emit({ status: 'unchanged', ...summary });
  process.exit(0);
}

const status = result.changed.length > 0 ? 'written' : 'date-only';
if (!args.dryRun) {
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, body);
  renameSync(tmp, file);
}
emit({ status, dryRun: args.dryRun, ...summary });
