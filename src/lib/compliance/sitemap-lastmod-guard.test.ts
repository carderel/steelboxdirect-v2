/**
 * SITEMAP lastmod GUARD
 * =====================
 *
 * WHY THIS FILE EXISTS. On 2026-08-28 the sitemap gained <lastmod>, which every entry had been
 * shipping without. There is exactly one wrong way to add that field and it is also the easiest
 * way: hand the serialize hook a build timestamp so all 52 URLs claim they changed at deploy time.
 * That is false for every page the deploy did not touch, it is the same species of invention the
 * fabricated-dates guard was written for on 2026-08-24, and it is the fastest known way to teach
 * Google that this site's lastmod means nothing. So the dates are derived from git history and
 * post frontmatter (src/lib/seo/sitemapLastmod.mjs), and this guard makes the shortcut fail loudly
 * if a future edit reaches for it.
 *
 * WHAT IT PROTECTS, IN ORDER OF WHAT WOULD HURT MOST.
 *   1. No build clock anywhere in the sitemap path. Byte scan for a zero argument Date constructor
 *      and for Date.now, over the config and the derivation module only. The scan list is explicit
 *      rather than a walk of src/, which is what lets this file spell the forbidden patterns out in
 *      full: it never reads itself, so it needs none of the runtime needle assembly that
 *      fabricated-dates-guard.test.ts uses to stay self consistent. The flip side, learned the
 *      first time this guard ran, is that the two scanned files must DESCRIBE the forbidden
 *      construct in their comments rather than spell it, because a raw byte scan cannot tell a
 *      rule from a mention of a rule. Scanning raw bytes is deliberate even so: stripping comments
 *      first would be the only alternative, and a scanner that quietly ignores whole regions is a
 *      scanner with a hiding place in it.
 *   2. The derivation is real, not merely non-empty. The delivery page's lastmod is compared
 *      against an independent git log run in this test, so a stub returning any plausible constant
 *      fails.
 *   3. The dates differ across URLs. One shared value across the site is the exact fingerprint of
 *      failure mode 1 even if it arrived by some other route, such as a data file's date being
 *      attributed to every page that imports it.
 *   4. The pre-existing sitemap exclusions survive. /admin/ is disallowed in robots.txt and must
 *      not be advertised in a sitemap, and /blog/category/ is held back while the section is thin
 *      (both noindex and excluded). Adding a serialize option meant editing that same integration
 *      call, which is precisely when a filter gets dropped by accident.
 *
 * WHAT CHANGED ON 2026-08-28, AND WHY THE SCAN LIST GREW TO FOUR FILES. The first version derived
 * the dates by running git during the build. That worked on a developer machine and failed in
 * production, where Cloudflare Pages clones shallow: the derivation module correctly refused to
 * trust a shallow clone, so 46 of 54 URLs shipped bare on every deploy while the same build dated
 * 52 of 52 locally. The derivation moved to scripts/generate-route-lastmod.mjs, which runs where the
 * history exists and writes the committed table src/data/routeLastmod.mjs, and the build now reads
 * that table. Both new files join the clock scan, because either one could put a fabricated date
 * into the sitemap: the generator by writing one, the table by carrying one.
 *
 * THE STALENESS THIS FILE DELIBERATELY DOES NOT COVER lives one file over, in
 * route-lastmod-freshness-guard.test.ts: a committed table can go quietly out of date in a way a
 * computed one could not. Assertion 2 below, which compares the delivery page against an
 * independent git log, is a real freshness check in itself, but it is a check of one file and the
 * other guard checks all of them.
 *
 * If assertion 2 or 3 fails in a checkout with no git history, the answer is never to fill the gap
 * with a generated date. Omission is the supported outcome: the module returns undefined and the
 * entry ships bare.
 */

import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { lastmodFor, serializeWithLastmod } from '../seo/sitemapLastmod.mjs';
// gitHistoryIsUsable now lives with the derivation, in the generator, because the build no longer
// asks git anything. One implementation of the shallow clone test, imported by every guard that
// needs it, is the only way the answer stays consistent across them.
import { gitHistoryIsUsable } from '../../../scripts/generate-route-lastmod.mjs';

const REPO_ROOT = import.meta.dirname
  ? join(import.meta.dirname, '..', '..', '..')
  : process.cwd();

/** Every file that can put a lastmod into the sitemap: the wiring, the reader, the writer, the data. */
const SITEMAP_SOURCES = [
  'astro.config.mjs',
  'src/lib/seo/sitemapLastmod.mjs',
  'scripts/generate-route-lastmod.mjs',
  'src/data/routeLastmod.mjs',
];

const read = (rel: string) => readFileSync(join(REPO_ROOT, rel), 'utf8');

const CONFIG = read('astro.config.mjs');

const hasGit = gitHistoryIsUsable();

/** A representative spread: static pages, a nested static page, both dynamic routes, a post. */
const SAMPLE_URLS = [
  'https://steelboxdirect.com/',
  'https://steelboxdirect.com/delivery/',
  'https://steelboxdirect.com/container-buying-guide/',
  'https://steelboxdirect.com/cost/',
  'https://steelboxdirect.com/size/calculator/',
  'https://steelboxdirect.com/for/farmers/',
  'https://steelboxdirect.com/locations/ohio/dayton-shipping-containers/',
  'https://steelboxdirect.com/shipping-containers-for-sale/20-foot-shipping-container/',
  'https://steelboxdirect.com/blog/wind-and-water-tight-explained/',
];

describe('sitemap lastmod guard: no build clock in the sitemap path', () => {
  it('reads every sitemap source file, and none is empty', () => {
    for (const rel of SITEMAP_SOURCES) {
      expect(existsSync(join(REPO_ROOT, rel)), `${rel} should exist`).toBe(true);
      expect(read(rel).length).toBeGreaterThan(200);
    }
  });

  it('never constructs a Date with no argument, which is the build clock', () => {
    const findings: string[] = [];
    for (const rel of SITEMAP_SOURCES) {
      read(rel)
        .split('\n')
        .forEach((line, i) => {
          if (/new\s+Date\s*\(\s*\)/.test(line)) findings.push(`  ${rel}:${i + 1}  ${line.trim()}`);
        });
    }
    expect(
      findings.length,
      [
        '',
        'SITEMAP LASTMOD GUARD: a zero argument Date reached the sitemap path.',
        'That stamps every URL with the deploy time and is false for every page the deploy',
        'did not change. Derive the date from git history or post frontmatter, or omit it.',
        '',
        ...findings,
        '',
      ].join('\n'),
    ).toBe(0);
  });

  it('never reads Date.now, nor any other wall clock alias', () => {
    for (const rel of SITEMAP_SOURCES) {
      const src = read(rel);
      expect(src, `${rel} must not read Date.now`).not.toMatch(/Date\s*\.\s*now\s*\(/);
      expect(src, `${rel} must not read Date.UTC`).not.toMatch(/Date\s*\.\s*UTC\s*\(/);
      expect(src, `${rel} must not use performance.now`).not.toMatch(/performance\s*\.\s*now\s*\(/);
    }
  });

  it('wires serialize to the derivation module rather than to an inline literal', () => {
    expect(CONFIG).toMatch(/serialize:\s*serializeWithLastmod/);
    expect(CONFIG).toMatch(/from '\.\/src\/lib\/seo\/sitemapLastmod\.mjs'/);
    expect(CONFIG, 'lastmod must not be typed into the config as a literal').not.toMatch(
      /lastmod:\s*['"`]/,
    );
  });
});

describe('sitemap lastmod guard: the dates are derived from real history', () => {
  it.skipIf(!hasGit)('matches an independent git log for the delivery page', () => {
    const expected = execFileSync(
      'git',
      ['log', '-1', '--format=%cI', '--', 'src/pages/delivery/index.astro'],
      { cwd: REPO_ROOT, encoding: 'utf8' },
    ).trim();
    expect(expected).not.toBe('');
    expect(lastmodFor('https://steelboxdirect.com/delivery/')).toBe(expected);
  });

  it('takes a blog post date from its own frontmatter, not from the [...slug] template', () => {
    const fm = read('src/content/blog/wind-and-water-tight-explained.md');
    const declared = /^(?:updatedDate|pubDate):\s*['"]?(\d{4}-\d{2}-\d{2})/m.exec(fm);
    expect(declared).not.toBeNull();
    expect(lastmodFor('https://steelboxdirect.com/blog/wind-and-water-tight-explained/')).toBe(
      declared![1],
    );
  });

  it.skipIf(!hasGit)('gives the two Discovered-not-indexed pages a lastmod at all', () => {
    for (const url of [
      'https://steelboxdirect.com/delivery/',
      'https://steelboxdirect.com/container-buying-guide/',
    ]) {
      expect(lastmodFor(url), `${url} should carry a derived lastmod`).toMatch(/^\d{4}-\d{2}-\d{2}/);
    }
  });

  it.skipIf(!hasGit)('does not hand the whole site one shared date', () => {
    const values = SAMPLE_URLS.map((u) => lastmodFor(u)).filter(Boolean);
    expect(values.length).toBeGreaterThan(6);
    expect(
      new Set(values).size,
      'every sampled URL shares one lastmod, which is what a build timestamp looks like',
    ).toBeGreaterThan(2);
  });

  it('returns undefined for a URL it cannot attribute, rather than inventing one', () => {
    expect(lastmodFor('https://steelboxdirect.com/no-such-page/')).toBeUndefined();
    expect(lastmodFor('not a url')).toBeUndefined();
  });

  it('keeps every entry in the sitemap, with or without a date', () => {
    const known = serializeWithLastmod({ url: 'https://steelboxdirect.com/delivery/' });
    expect(known.url).toBe('https://steelboxdirect.com/delivery/');
    const unknown = serializeWithLastmod({ url: 'https://steelboxdirect.com/no-such-page/' });
    expect(unknown.url).toBe('https://steelboxdirect.com/no-such-page/');
    expect('lastmod' in unknown).toBe(false);
  });
});

describe('sitemap lastmod guard: the exclusions that predate lastmod still hold', () => {
  it('still filters /admin/ and /blog/category/ out of the sitemap', () => {
    expect(CONFIG).toMatch(/filter:\s*\(page\)\s*=>/);
    expect(CONFIG).toMatch(/!page\.includes\('\/admin\/'\)/);
    expect(CONFIG).toMatch(/!page\.includes\('\/blog\/category\/'\)/);
  });

  const built = join(REPO_ROOT, 'dist/sitemap-0.xml');

  it.skipIf(!existsSync(built))('a built sitemap lists no /admin/ or /blog/category/ URL', () => {
    const xml = readFileSync(built, 'utf8');
    expect(xml).not.toContain('/admin/');
    expect(xml).not.toContain('/blog/category/');
    expect(xml.match(/<loc>/g)?.length ?? 0).toBeGreaterThan(40);
  });
});
