/**
 * Google review count: data shape, the build time stale rule, display copy, and the writer script.
 *
 * Design: UDO Project/.outputs/research/2026-11-07-google-review-count-plan.md (6.1 to 6.7).
 * The guard against hand typed counts elsewhere in src/, and the built output checks, live in
 * src/lib/compliance/review-count-guard.test.ts.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import record from './googleReviews.json';
import {
  reviewsDisplay,
  starGlyphs,
  countLabel,
  type GoogleReviewsRecord,
} from './googleReviews';
import {
  ageInDays,
  validateUpdate,
  isShowable,
  serializeRecord,
  formatCheckedDate,
  MAX_SHOW_AGE_DAYS,
  MAX_COUNT_DROP,
  watchdogNotifyToday,
} from '../lib/reviews/googleReviewsRules.mjs';

const REPO_ROOT = join(import.meta.dirname, '..', '..');
const SCRIPT = join(REPO_ROOT, 'scripts', 'update-google-reviews.mjs');
const EM = String.fromCharCode(0x2014);
const EN = String.fromCharCode(0x2013);

const base: GoogleReviewsRecord = {
  source: 'owner-manual',
  profileUrl: 'https://maps.google.com/?cid=16337072236475848136',
  reviewUrl: 'https://g.page/r/CcgVCj2k8LjiEBM/review',
  averageStars: 5.0,
  reviewCount: 11,
  checkedAt: '2026-11-07',
};

/** Noon UTC on the day that is `days` after 2026-11-07. */
function dayAfter(days: number): Date {
  return new Date(Date.UTC(2026, 10, 7 + days, 12));
}

describe('googleReviews.json shape', () => {
  it('is a valid, showable record when checked against its own checkedAt day', () => {
    const r = record as GoogleReviewsRecord;
    expect(['owner-manual', 'google-business-profile-api']).toContain(r.source);
    expect(Number.isInteger(r.reviewCount)).toBe(true);
    expect(r.reviewCount).toBeGreaterThanOrEqual(1);
    expect(r.averageStars).toBeGreaterThanOrEqual(1);
    expect(r.averageStars).toBeLessThanOrEqual(5);
    expect(r.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(isShowable(r, new Date(r.checkedAt + 'T12:00:00Z'))).toBe(true);
  });

  it('checkedAt is not in the future', () => {
    expect(ageInDays((record as GoogleReviewsRecord).checkedAt, new Date())).toBeGreaterThanOrEqual(0);
  });

  it('keeps the profile on the SBD cid and the review link already used in the footer', () => {
    const r = record as GoogleReviewsRecord;
    expect(r.profileUrl).toBe('https://maps.google.com/?cid=16337072236475848136');
    expect(r.reviewUrl).toBe('https://g.page/r/CcgVCj2k8LjiEBM/review');
  });

  it('is laid out exactly as the writer serialises it, so a no-op run produces no diff', () => {
    const raw = readFileSync(join(REPO_ROOT, 'src', 'data', 'googleReviews.json'), 'utf8');
    expect(serializeRecord(JSON.parse(raw))).toBe(raw);
  });
});

describe('stale rule (evaluated at build time)', () => {
  it('shows on the check day and through day 24', () => {
    for (const d of [0, 1, 13, 14, 23, MAX_SHOW_AGE_DAYS]) {
      expect(reviewsDisplay(dayAfter(d), base).show, `day ${d}`).toBe(true);
    }
  });

  it('hides from day 25 on', () => {
    for (const d of [MAX_SHOW_AGE_DAYS + 1, 26, 30, 365]) {
      expect(reviewsDisplay(dayAfter(d), base).show, `day ${d}`).toBe(false);
    }
  });

  it('the cutoff is 24 days, inside the 30 day storage limit with margin', () => {
    expect(MAX_SHOW_AGE_DAYS).toBe(24);
  });

  it('counts UTC calendar days, not 24 hour blocks', () => {
    expect(ageInDays('2026-11-07', new Date('2026-11-07T00:00:01Z'))).toBe(0);
    expect(ageInDays('2026-11-07', new Date('2026-11-07T23:59:59Z'))).toBe(0);
    expect(ageInDays('2026-11-07', new Date('2026-12-01T23:59:59Z'))).toBe(24);
    expect(ageInDays('2026-11-07', new Date('2026-12-02T00:00:00Z'))).toBe(25);
  });

  it('hides a checkedAt in the future rather than trusting it', () => {
    expect(reviewsDisplay(dayAfter(-1), base).show).toBe(false);
  });
});

describe('never renders 0, blank or NaN', () => {
  const bad: Array<[string, Partial<GoogleReviewsRecord> | Record<string, unknown>]> = [
    ['count 0', { reviewCount: 0 }],
    ['count negative', { reviewCount: -2 }],
    ['count fractional', { reviewCount: 11.5 }],
    ['count NaN', { reviewCount: NaN }],
    ['count missing', { reviewCount: undefined }],
    ['count as string', { reviewCount: '11' }],
    ['stars 0', { averageStars: 0 }],
    ['stars 6', { averageStars: 6 }],
    ['stars NaN', { averageStars: NaN }],
    ['stars missing', { averageStars: undefined }],
    ['checkedAt blank', { checkedAt: '' }],
    ['checkedAt not a date', { checkedAt: '2026-02-30' }],
    ['unknown source', { source: 'scraped' }],
  ];
  for (const [label, patch] of bad) {
    it(`hides on ${label}`, () => {
      const d = reviewsDisplay(dayAfter(1), { ...base, ...patch } as GoogleReviewsRecord);
      expect(d.show).toBe(false);
      expect(JSON.stringify(d)).not.toMatch(/stars from|NaN/);
    });
  }

  it('a shown display never carries 0, NaN, undefined or an empty count', () => {
    const d = reviewsDisplay(dayAfter(2), base);
    expect(d.show).toBe(true);
    if (!d.show) return;
    expect(d.sentence).not.toMatch(/\b0 Google|NaN|undefined|null/);
    expect(d.count).toBeGreaterThan(0);
  });
});

describe('display copy', () => {
  it('builds the exact sentence from the data', () => {
    const d = reviewsDisplay(dayAfter(0), base);
    expect(d.show && d.sentence).toBe('5.0 stars from 11 Google reviews, checked November 7, 2026');
  });

  it('uses the singular for one review', () => {
    expect(countLabel(1)).toBe('1 Google review');
    expect(countLabel(12)).toBe('12 Google reviews');
    const d = reviewsDisplay(dayAfter(0), { ...base, reviewCount: 1 });
    expect(d.show && d.sentence).toBe('5.0 stars from 1 Google review, checked November 7, 2026');
  });

  it('rounds star glyphs DOWN so a 4.8 never shows five full stars', () => {
    expect(starGlyphs(5)).toBe('★'.repeat(5));
    expect(starGlyphs(4.8)).toBe('★'.repeat(4) + '☆');
    expect(starGlyphs(4.0)).toBe('★'.repeat(4) + '☆');
    expect(starGlyphs(1)).toBe('★' + '☆'.repeat(4));
    const d = reviewsDisplay(dayAfter(0), { ...base, averageStars: 4.8 });
    expect(d.show && d.sentence).toBe('4.8 stars from 11 Google reviews, checked November 7, 2026');
  });

  it('never uses the r word (PROJECT_HS_003 content guard), as of, or a dash', () => {
    const d = reviewsDisplay(dayAfter(0), base);
    const text = JSON.stringify(d);
    expect(text).not.toMatch(/\brating\b/i);
    expect(text).not.toMatch(/\bas of\b/i);
    expect(text).not.toContain(EM);
    expect(text).not.toContain(EN);
  });

  it('formats dates without the build machine locale', () => {
    expect(formatCheckedDate('2026-01-01')).toBe('January 1, 2026');
    expect(formatCheckedDate('2026-12-31')).toBe('December 31, 2026');
  });
});

describe('validateUpdate (the manual entry and future API gate)', () => {
  const now = dayAfter(7);

  it('accepts a good entry and stamps checkedAt with the UTC date', () => {
    const r = validateUpdate(base, { stars: '4.9', count: '12' }, now);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.next).toMatchObject({ averageStars: 4.9, reviewCount: 12, checkedAt: '2026-11-14' });
    expect(r.changed).toEqual(['averageStars', 'reviewCount']);
  });

  it('reports a date-only refresh as no changed figure', () => {
    const r = validateUpdate(base, { stars: '5.0', count: '11' }, now);
    expect(r.ok && r.changed).toEqual([]);
  });

  const rejects: Array<[string, unknown, unknown]> = [
    ['count 0', '5.0', '0'],
    ['count blank', '5.0', ''],
    ['count fractional', '5.0', '11.5'],
    ['count negative', '5.0', '-1'],
    ['count NaN', '5.0', 'NaN'],
    ['count words', '5.0', 'eleven'],
    ['stars 6', '6', '11'],
    ['stars 0', '0', '11'],
    ['stars 0.9', '0.9', '11'],
    ['stars 5.1', '5.1', '11'],
    ['stars NaN', 'NaN', '11'],
    ['stars blank', '', '11'],
    ['big drop', '5.0', String(11 - MAX_COUNT_DROP - 1)],
  ];
  for (const [label, stars, count] of rejects) {
    it(`rejects ${label}`, () => {
      expect(validateUpdate(base, { stars, count }, now).ok).toBe(false);
    });
  }

  it('allows a drop of exactly the tolerance', () => {
    expect(validateUpdate(base, { stars: '5.0', count: String(11 - MAX_COUNT_DROP) }, now).ok).toBe(true);
  });
});

describe('watchdog notification cadence', () => {
  it('stays quiet under 10 days, then flags on a spaced cadence and daily through the rebuild window', () => {
    const days = Array.from({ length: 40 }, (_, d) => d).filter((d) => watchdogNotifyToday(d));
    expect(days).toEqual([10, 13, 16, 19, 22, 23, 24, 25, 32, 39]);
  });
  it('always flags missing or invalid data', () => {
    expect(watchdogNotifyToday(NaN)).toBe(true);
  });
});

describe('scripts/update-google-reviews.mjs', () => {
  let dir: string;
  let file: string;
  const original = serializeRecord(base);

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'sbd-reviews-'));
    file = join(dir, 'googleReviews.json');
    writeFileSync(file, original);
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  function run(args: string[]): { code: number; stdout: string; summary: any } {
    try {
      const stdout = execFileSync(process.execPath, [SCRIPT, '--file', file, ...args], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      return { code: 0, stdout, summary: JSON.parse(stdout.trim().split('\n').pop()!) };
    } catch (e: any) {
      const stdout = String(e.stdout ?? '');
      return { code: e.status ?? 1, stdout, summary: JSON.parse(stdout.trim().split('\n').pop() || '{}') };
    }
  }

  it('writes a valid change and reports it', () => {
    const r = run(['--stars', '4.9', '--count', '12', '--today', '2026-11-14']);
    expect(r.code).toBe(0);
    expect(r.summary.status).toBe('written');
    expect(r.summary.changed).toEqual(['averageStars', 'reviewCount']);
    const written = JSON.parse(readFileSync(file, 'utf8'));
    expect(written).toMatchObject({ averageStars: 4.9, reviewCount: 12, checkedAt: '2026-11-14' });
    expect(written.profileUrl).toBe(base.profileUrl);
    expect(written.reviewUrl).toBe(base.reviewUrl);
  });

  it('reports date-only when only checkedAt moves', () => {
    const r = run(['--stars', '5.0', '--count', '11', '--today', '2026-11-14']);
    expect(r.summary.status).toBe('date-only');
    expect(JSON.parse(readFileSync(file, 'utf8')).checkedAt).toBe('2026-11-14');
  });

  it('reports unchanged and leaves the bytes alone on a same-day repeat', () => {
    const r = run(['--stars', '5.0', '--count', '11', '--today', '2026-11-07']);
    expect(r.summary.status).toBe('unchanged');
    expect(readFileSync(file, 'utf8')).toBe(original);
  });

  for (const [label, stars, count] of [
    ['count 0', '5.0', '0'],
    ['stars 6', '6', '11'],
    ['stars NaN', 'NaN', '11'],
    ['count NaN', '5.0', 'abc'],
    ['big drop', '5.0', '7'],
  ] as const) {
    it(`fails on ${label}, exits 1, and leaves the file byte identical`, () => {
      const r = run(['--stars', stars, '--count', count, '--today', '2026-11-14']);
      expect(r.code).toBe(1);
      expect(r.summary.status).toBe('failed');
      expect(readFileSync(file, 'utf8')).toBe(original);
    });
  }

  it('dry run writes nothing', () => {
    const r = run(['--stars', '4.9', '--count', '12', '--today', '2026-11-14', '--dry-run']);
    expect(r.summary.status).toBe('written');
    expect(readFileSync(file, 'utf8')).toBe(original);
  });

  it('report-age flags at 10 days and asks for a rebuild from 22 days', () => {
    expect(run(['--report-age', '--today', '2026-11-16']).summary).toMatchObject({ ageDays: 9, flag: false, rebuild: false, showable: true });
    expect(run(['--report-age', '--today', '2026-11-17']).summary).toMatchObject({ ageDays: 10, flag: true, rebuild: false });
    expect(run(['--report-age', '--today', '2026-11-29']).summary).toMatchObject({ ageDays: 22, flag: true, rebuild: true, showable: true });
    expect(run(['--report-age', '--today', '2026-12-02']).summary).toMatchObject({ ageDays: 25, rebuild: true, showable: false });
    expect(readFileSync(file, 'utf8')).toBe(original);
  });
});
