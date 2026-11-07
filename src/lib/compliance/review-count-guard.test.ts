/**
 * GOOGLE REVIEW COUNT GUARD
 * =========================
 *
 * The review count and star average live in ONE place, src/data/googleReviews.json, read through
 * src/data/googleReviews.ts at build time. Before 2026-11-07 the count was hand typed on /about/ and
 * twice on /ai-info/ ("as of August 2026"), which is a number that silently goes stale.
 *
 * TIER 1 (source, always runs): no file under src/ may hand type a review count. Matches "N Google
 * reviews", "N reviews", "N five-star reviews" and spelled out numbers before "Google reviews".
 * Exempt: the data module itself and test files. Anything else needs an ALLOWLIST entry with a reason,
 * and a stale entry fails the suite.
 *
 * TIER 2 (dist/, FAILS without it, same ruling as permit-county-guard.test.ts: a skipped check reads as
 * a green run): the built footer on several pages, the homepage line, /about/ and /ai-info/ carry the
 * data-driven sentence with its checked date (or the plain fallback once the data is stale), and no
 * built page carries AggregateRating.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { reviewsDisplay, googleReviews } from '../../data/googleReviews';
import { ageInDays, MAX_SHOW_AGE_DAYS } from '../reviews/googleReviewsRules.mjs';

const REPO_ROOT = join(import.meta.dirname, '..', '..', '..');
const DIST = join(REPO_ROOT, 'dist');
const rel = (p: string) => relative(REPO_ROOT, p).split(sep).join('/');

const EXEMPT = new Set([
  'src/data/googleReviews.json',
  'src/data/googleReviews.ts',
  'src/lib/reviews/googleReviewsRules.mjs',
]);

interface AllowEntry {
  file: string;
  contains: string;
  reason: string;
}

const ALLOWLIST: AllowEntry[] = [
  {
    file: 'src/pages/shipping-containers-for-sale/[slug].astro',
    contains: 'another 30 reviews describe relief',
    reason:
      'HTML source comment summarising the Columbus COMPETITOR review corpus used as research for ' +
      'the band below it. Not rendered, and not a claim about the Steel Box Direct review count.',
  },
];

const NUMBER_WORDS =
  'one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|' +
  'sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty';

const PATTERNS: RegExp[] = [
  /\b\d[\d,]*\s+(?:(?:five|5)[- ]star\s+|verified\s+|google\s+)*reviews?\b/i,
  new RegExp(`\\b(?:${NUMBER_WORDS})\\s+(?:(?:five|5)[- ]star\\s+)?google\\s+reviews?\\b`, 'i'),
];

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (/\.(astro|ts|tsx|js|mjs|md|mdx|json|txt)$/.test(entry) && !/\.test\.(ts|mjs)$/.test(entry)) acc.push(p);
  }
  return acc;
}

interface Hit { file: string; line: number; text: string }

function sourceHits(): Hit[] {
  const hits: Hit[] = [];
  for (const p of walk(join(REPO_ROOT, 'src'))) {
    const file = rel(p);
    if (EXEMPT.has(file)) continue;
    readFileSync(p, 'utf8').split('\n').forEach((text, i) => {
      if (PATTERNS.some((re) => re.test(text))) hits.push({ file, line: i + 1, text: text.trim() });
    });
  }
  return hits;
}

const isAllowed = (h: Hit) => ALLOWLIST.some((a) => a.file === h.file && h.text.includes(a.contains));

describe('tier 1: no hand typed review count in src/', () => {
  const hits = sourceHits();

  it('finds no review count outside the googleReviews data module', () => {
    const bad = hits.filter((h) => !isAllowed(h));
    expect(
      bad,
      'Hand typed review count found. Read it from reviewsDisplay() in src/data/googleReviews.ts ' +
        'instead:\n' + bad.map((h) => `  ${h.file}:${h.line}  ${h.text}`).join('\n'),
    ).toEqual([]);
  });

  it('every allowlist entry has a reason and still matches something', () => {
    for (const a of ALLOWLIST) {
      expect(a.reason.length, a.file).toBeGreaterThan(20);
      expect(hits.some((h) => h.file === a.file && h.text.includes(a.contains)), `stale allowlist entry ${a.file}`).toBe(true);
    }
  });

  it('the patterns catch the shapes that used to be hand typed', () => {
    for (const s of [
      '5.0 stars from 11 Google reviews, as of August 2026.',
      'a 5.0 Google score from 11 reviews',
      'over 40 five-star reviews',
      'eleven Google reviews',
      '1 Google review',
    ]) {
      expect(PATTERNS.some((re) => re.test(s)), s).toBe(true);
    }
    expect(PATTERNS.some((re) => re.test('Read our Google reviews'))).toBe(false);
  });
});

/* ------------------------------------------------------------------ tier 2: dist */

const BUILT = existsSync(join(DIST, 'index.html'));
const NOT_BUILT =
  'dist/ is not built, so this assertion could not read the output it exists to police. Run ' +
  '`npm run build` first. A skip here would read as a pass while checking nothing.';

function page(route: string): string {
  const p = join(DIST, route, 'index.html');
  expect(existsSync(p), `missing built page ${route}`).toBe(true);
  return readFileSync(p, 'utf8');
}

function footerBand(html: string): string {
  const m = html.match(/<div class="review-band"[\s\S]*?class="review-qr-tile[\s\S]*?<\/a>/);
  expect(m, 'footer review band not found').not.toBeNull();
  return m![0];
}

/** Decode the handful of entities Astro emits in text, so the sentence can be compared as written. */
const decode = (s: string) =>
  s.replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ');

const now = new Date();
const expected = reviewsDisplay(now);
const testAge = ageInDays(googleReviews.checkedAt, now);

/**
 * Whether the built output must show the figure. The build ran at or before this test, so the build
 * age is at most the test age: if the test age is within the window, the build age was too. A built
 * page that falls back while that holds means dist/ is stale or the wiring broke.
 */
const mustShow = expected.show && testAge <= MAX_SHOW_AGE_DAYS;

const VOID = new Set(['br', 'img', 'meta', 'link', 'input', 'hr', 'source', 'wbr', 'path', 'circle', 'rect']);

/** The opening tags still open at the end of a fragment, outermost first. */
function openElements(fragment: string): string[] {
  const stack: Array<{ name: string; tag: string }> = [];
  for (const m of fragment.matchAll(/<(\/?)([a-zA-Z][\w-]*)\b[^>]*?(\/?)>/g)) {
    const [tag, closing, rawName, selfClosing] = m;
    const name = rawName.toLowerCase();
    if (selfClosing || VOID.has(name)) continue;
    if (closing) {
      const at = stack.map((e) => e.name).lastIndexOf(name);
      if (at >= 0) stack.length = at;
    } else stack.push({ name, tag });
  }
  return stack.map((e) => e.tag);
}

describe('tier 2: built output', () => {
  const sentence = reviewsDisplay(new Date(googleReviews.checkedAt + 'T12:00:00Z'));
  const want = sentence.show ? sentence.sentence : '';

  it('the data is showable on its own check day (sanity for every assertion below)', () => {
    expect(sentence.show).toBe(true);
  });

  for (const route of ['', 'cost', 'locations', 'about']) {
    it(`footer on /${route}${route ? '/' : ''} renders the figure with its checked date, or the plain fallback`, () => {
      if (!BUILT) throw new Error(NOT_BUILT);
      const band = decode(footerBand(page(route)));
      if (band.includes('stars from')) {
        expect(band.includes(want), `footer sentence is not "${want}"`).toBe(true);
        expect(/checked [A-Z][a-z]+ \d{1,2}, \d{4}/.test(band), 'footer has no checked date').toBe(true);
        expect(band.includes(`href="${googleReviews.profileUrl}"`), 'profile link missing').toBe(true);
      } else {
        expect(mustShow, 'footer fell back to the plain band while the data is fresh: dist/ is stale or the wiring broke').toBe(false);
        expect(band.includes('Rate us on Google'), 'fallback eyebrow missing').toBe(true);
      }
      expect(/\b0 Google review|NaN|undefined/.test(band), 'footer renders zero, NaN or undefined').toBe(false);
      expect(band.includes(`href="${googleReviews.reviewUrl}"`), 'leave a review link missing').toBe(true);
    });
  }

  it('homepage hero carries the line near the main call to action when fresh', () => {
    if (!BUILT) throw new Error(NOT_BUILT);
    const html = decode(page(''));
    const hero = html.match(/<div class="hz hz-5"[\s\S]*?<\/div>/)?.[0] ?? '';
    expect(hero, 'hz-5 call to action block not found').not.toBe('');
    if (mustShow) expect(hero.includes(want), `hero line "${want}" missing: dist/ stale or wiring broke`).toBe(true);
    expect(/\b0 Google review|NaN|undefined/.test(hero), 'hero renders zero, NaN or undefined').toBe(false);
  });

  it('/about/ and /ai-info/ carry the data-driven sentence and no August 2026 hand typed count', () => {
    if (!BUILT) throw new Error(NOT_BUILT);
    for (const route of ['about', 'ai-info']) {
      const html = decode(page(route));
      if (mustShow) expect(html.includes(want), `/${route}/ is missing "${want}": dist/ stale or wiring broke`).toBe(true);
      expect(/reviews,? as of August 2026|from 11 reviews as of/.test(html), `/${route}/ still carries the hand typed count`).toBe(false);
      expect(/\b0 Google review|stars from NaN/.test(html), `/${route}/ renders a zero or NaN`).toBe(false);
    }
  });

  it('the review sentence and its parent element are never hidden markup', () => {
    if (!BUILT) throw new Error(NOT_BUILT);
    // The star glyph span is aria-hidden on purpose (decorative; the number is in the sentence).
    // What must never be hidden is the element that carries the sentence, or its parent.
    for (const route of ['', 'about', 'ai-info', 'cost']) {
      const html = page(route);
      let idx = html.indexOf('stars from');
      let seen = 0;
      while (idx >= 0) {
        seen++;
        const open = openElements(html.slice(Math.max(0, idx - 4000), idx));
        for (const tag of open.slice(-2)) {
          expect(/\bhidden\b|aria-hidden|style=|display:\s*none|visibility:\s*hidden/i.test(tag), `/${route}/ wraps the review sentence in ${tag}`).toBe(false);
        }
        idx = html.indexOf('stars from', idx + 1);
      }
      if (mustShow) expect(seen, `/${route}/ has no review sentence`).toBeGreaterThan(0);
    }
  });

  it('the open element reader sees through closed siblings and catches a hidden wrapper', () => {
    expect(openElements('<p class="x"><span aria-hidden="true">*</span> <a href="y">')).toEqual(['<p class="x">', '<a href="y">']);
    expect(openElements('<div style="display:none"><p><br>')).toEqual(['<div style="display:none">', '<p>']);
  });

  it('no built page carries AggregateRating', () => {
    if (!BUILT) throw new Error(NOT_BUILT);
    const offenders: string[] = [];
    const walkHtml = (dir: string) => {
      for (const e of readdirSync(dir)) {
        const p = join(dir, e);
        if (statSync(p).isDirectory()) walkHtml(p);
        else if (e.endsWith('.html') && /aggregateRating/i.test(readFileSync(p, 'utf8'))) offenders.push(rel(p));
      }
    };
    walkHtml(DIST);
    expect(offenders).toEqual([]);
  });
});
