/**
 * WEBPAGE dateModified GUARD
 * ==========================
 *
 * WHY THIS FILE EXISTS. Until 2026-09-08 the sitemap stated a <lastmod> for nearly every URL while
 * the WebPage node in the same page's JSON-LD stated no dateModified at all (T-212, verified live).
 * Only the ten blog posts carried one, and on the Article node rather than the WebPage node. The
 * fix reads the WebPage date from the exact lookup the sitemap integration uses, lastmodFor() in
 * src/lib/seo/sitemapLastmod.mjs, so the two surfaces are one fact rendered twice and cannot
 * disagree. This guard holds that in place from three directions.
 *
 * WHAT IT ASSERTS.
 *   1. A route the committed table knows produces a WebPage dateModified equal, byte for byte, to
 *      the sitemap's lastmod for that URL, across every branch that emits a WebPage node.
 *   2. A route the table does not know produces NO dateModified. Omission is the supported
 *      outcome; a guess never is. The caller's prop is honoured only in that case.
 *   3. Nothing emitted is newer than the newest entry in the table, in the unit graph and in the
 *      built HTML. A fallback to build time or to today would produce a value past that ceiling on
 *      every build, so this is the assertion that catches the one line "fix" the whole lastmod
 *      workstream was written to forbid. The schema module is also byte scanned for a zero argument
 *      Date constructor and for the wall clock aliases, the same scan the sitemap guard runs.
 *
 * WHY THE TABLE OUTRANKS THE dateModified PROP, ON EVERY NODE. Twenty templates pass that prop.
 * Most values were hand derived on 2026-08-24 and never moved; the city template passes a price
 * effective date and /cost/ computes one, and a price date describes a price, not the page. Any of
 * those winning would put a date in the graph that the sitemap contradicts for the same URL. The
 * first cut applied the table to WebPage alone and the verifier found 23 of 69 built pages stating
 * two different dateModified strings, 7 on different calendar days. So the guide Article and the
 * blog Article route through the same function as WebPage, and this file asserts that every
 * dateModified in a built page is one identical string. datePublished stays as the caller passed it.
 *
 * WHY THE BUILT OUTPUT HALF SKIPS WITHOUT dist/. It compares HTML to XML that only a build writes.
 * Run npm run build first; a stale dist from before a change will fail here until rebuilt, which is
 * the same convention blog-category-indexing-guard.test.ts follows.
 */

import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { buildPageSchema } from '../schema/buildPageSchema';
import type { BuildSchemaArgs } from '../schema/types';
import { lastmodFor, buildLastmodIndex } from '../seo/sitemapLastmod.mjs';
import lastmodIndex from 'virtual:route-lastmod-index';
import { routeLastmod } from '../../data/routeLastmod.mjs';

const REPO_ROOT = import.meta.dirname
  ? join(import.meta.dirname, '..', '..', '..')
  : process.cwd();

const SITE = 'https://steelboxdirect.com';
const SCHEMA_SOURCE = 'src/lib/schema/buildPageSchema.ts';
/** Every file between the table and the WebPage node that could put a date there. */
const SCANNED_SOURCES = [SCHEMA_SOURCE, 'src/lib/seo/lastmodResolve.mjs', 'src/lib/seo/sitemapLastmod.mjs'];
const DIST = join(REPO_ROOT, 'dist');
const SITEMAP = join(DIST, 'sitemap-0.xml');

type Node = Record<string, any>;

const read = (rel: string) => readFileSync(join(REPO_ROOT, rel), 'utf8');

/** The sitemap integration renders every lastmod through toISOString; the WebPage node must match. */
const asSitemapWrites = (stated: string) => new Date(stated).toISOString();

const webPageOf = (graph: Record<string, unknown>[]) =>
  graph.find((n) => n['@type'] === 'WebPage') as Node;
const articleOf = (graph: Record<string, unknown>[]) =>
  graph.find((n) => n['@type'] === 'Article') as Node;

function build(path: string, extra: Partial<BuildSchemaArgs> = {}) {
  return buildPageSchema({
    url: `${SITE}${path}`,
    title: 'T',
    description: 'd',
    page: { kind: 'excluded' },
    ...extra,
  });
}

/** The newest instant the table records. Nothing on the site may claim to be newer. */
const NEWEST_TABLE_INSTANT = Math.max(
  ...Object.values(routeLastmod as Record<string, string>).map((iso) => Date.parse(iso)),
);

/** The same spread the two sitemap guards sample, minus the blog post, which has its own test. */
const SAMPLE_PATHS = [
  '/',
  '/delivery/',
  '/container-buying-guide/',
  '/cost/',
  '/size/calculator/',
  '/for/farmers/',
  '/locations/ohio/dayton-shipping-containers/',
  '/shipping-containers-for-sale/20-foot-shipping-container/',
];

const CITY_PATH = '/locations/ohio/cincinnati-shipping-containers/';
const city: any = { slug: 'cincinnati-shipping-containers', city: 'Cincinnati', state: 'OH', region: 'home' };

describe('webpage dateModified guard: a known route carries the sitemap date', () => {
  it('every sampled route gets a WebPage dateModified equal to its sitemap lastmod', () => {
    for (const path of SAMPLE_PATHS) {
      const lastmod = lastmodFor(`${SITE}${path}`);
      expect(lastmod, `${path} should be in the table for this test to mean anything`).toBeTruthy();
      const wp = webPageOf(build(path).graph);
      expect(wp.dateModified, path).toBe(asSitemapWrites(lastmod as string));
    }
  });

  it('the homepage and a city page read the very table entries the sitemap reads', () => {
    expect(webPageOf(build('/').graph).dateModified).toBe(
      asSitemapWrites(routeLastmod['src/pages/index.astro']),
    );
    const { graph } = build(CITY_PATH, { page: { kind: 'city', city, faqs: [{ q: 'Deliver?', a: 'Yes.' }] } });
    expect(webPageOf(graph).dateModified).toBe(
      asSitemapWrites(routeLastmod['src/pages/locations/[state]/[citySlug].astro']),
    );
  });

  it('holds across every branch that emits a WebPage node', () => {
    const path = '/delivery/';
    const expected = asSitemapWrites(lastmodFor(`${SITE}${path}`) as string);
    const pages: BuildSchemaArgs['page'][] = [
      { kind: 'excluded' },
      { kind: 'home', faqs: [] },
      { kind: 'productHub', faqs: [] },
      { kind: 'guide', topic: 'delivery', title: 'Delivery', specs: [], faqs: [] },
      { kind: 'useCase', audience: 'Farmers', title: 'Farm storage', specs: [], faqs: [] },
      { kind: 'collection', title: 'Guides', items: [], faqs: [] },
      { kind: 'city', city, faqs: [] },
    ];
    for (const page of pages) {
      expect(webPageOf(build(path, { page }).graph).dateModified, page.kind).toBe(expected);
    }
  });

  it('the table outranks a hand typed prop, so a stale literal cannot contradict the sitemap', () => {
    const path = '/for/farmers/';
    const sitemap = asSitemapWrites(lastmodFor(`${SITE}${path}`) as string);
    const wp = webPageOf(build(path, { dateModified: '2026-06-04' }).graph);
    expect(wp.dateModified).toBe(sitemap);
  });

  it('the guide Article states the same table date as WebPage, and keeps datePublished as passed', () => {
    const { graph } = build('/delivery/', {
      datePublished: '2026-05-19',
      dateModified: '2026-08-28',
      page: { kind: 'guide', topic: 'delivery', title: 'Delivery', specs: [], faqs: [] },
    });
    const expected = asSitemapWrites(lastmodFor(`${SITE}/delivery/`) as string);
    expect(articleOf(graph).datePublished).toBe('2026-05-19');
    expect(articleOf(graph).dateModified).toBe(expected);
    expect(webPageOf(graph).dateModified).toBe(expected);
  });

  it('a caller prop newer than the table, the /cost/ case, does not win on any node', () => {
    const path = '/cost/';
    const expected = asSitemapWrites(lastmodFor(`${SITE}${path}`) as string);
    const newer = '2026-09-03';
    expect(Date.parse(newer), 'fixture must be newer than the table for this test to bite')
      .toBeGreaterThan(Date.parse(lastmodFor(`${SITE}${path}`) as string));
    const { graph } = build(path, {
      dateModified: newer,
      page: { kind: 'guide', topic: 'cost', title: 'Cost', specs: [], faqs: [] },
    });
    expect(articleOf(graph).dateModified).toBe(expected);
    expect(webPageOf(graph).dateModified).toBe(expected);
  });

  it('a blog post keeps its frontmatter date, which is also what the sitemap states', () => {
    const slug = 'wind-and-water-tight-explained';
    const fm = read(`src/content/blog/${slug}.md`);
    const declared = /^(?:updatedDate|pubDate):\s*['"]?(\d{4}-\d{2}-\d{2})/m.exec(fm)![1];
    const path = `/blog/${slug}/`;
    expect(lastmodFor(`${SITE}${path}`)).toBe(declared);
    const { graph } = build(path, {
      datePublished: declared,
      dateModified: declared,
      page: {
        kind: 'blogPost', title: 'T', description: 'd', author: 'Steel Box Direct',
        datePublished: declared, dateModified: declared, takeaways: [], faqs: [],
      },
    });
    expect(webPageOf(graph).dateModified).toBe(asSitemapWrites(declared));
    expect(articleOf(graph).dateModified).toBe(asSitemapWrites(declared));
    expect(articleOf(graph).datePublished).toBe(declared);
  });

  it('every dated node in a graph states one identical string', () => {
    const cases: Partial<BuildSchemaArgs>[] = [
      { page: { kind: 'guide', topic: 'size', title: 'Size', specs: [], faqs: [] }, datePublished: '2026-05-19', dateModified: '2026-08-25' },
      { page: { kind: 'blogPost', title: 'T', description: 'd', author: 'A', datePublished: '2026-07-06', dateModified: '2026-07-06', takeaways: [], faqs: [] } },
    ];
    for (const [i, extra] of cases.entries()) {
      const path = i === 0 ? '/size/' : '/blog/wind-and-water-tight-explained/';
      const dates = build(path, extra).graph
        .map((n) => (n as Node).dateModified)
        .filter((d): d is string => typeof d === 'string');
      expect(dates.length, path).toBeGreaterThanOrEqual(2);
      expect(new Set(dates).size, `${path} states ${dates.join(' and ')}`).toBe(1);
    }
  });

  it('adds no datePublished to a WebPage node, because nothing in the repo records one', () => {
    for (const path of SAMPLE_PATHS) {
      expect('datePublished' in webPageOf(build(path).graph), path).toBe(false);
    }
  });
});

describe('webpage dateModified guard: an unknown route ships no date', () => {
  it('emits no dateModified key at all when the table has no entry and no prop was passed', () => {
    expect(lastmodFor(`${SITE}/no-such-page/`)).toBeUndefined();
    const wp = webPageOf(build('/no-such-page/').graph);
    expect('dateModified' in wp).toBe(false);
  });

  it('honours the caller prop only where the table is silent, on every node', () => {
    const { graph } = build('/no-such-page/', {
      dateModified: '2026-05-01',
      page: { kind: 'guide', title: 'G', specs: [], faqs: [] },
    });
    expect(webPageOf(graph).dateModified).toBe(asSitemapWrites('2026-05-01'));
    expect(articleOf(graph).dateModified).toBe(asSitemapWrites('2026-05-01'));
  });
});

describe('webpage dateModified guard: never the clock', () => {
  const src = read(SCHEMA_SOURCE);

  it('the schema module reuses the sitemap resolver rather than carrying a second mapper', () => {
    expect(src).toMatch(/from '\.\.\/seo\/lastmodResolve\.mjs'/);
    expect(src).toMatch(/from 'virtual:route-lastmod-index'/);
    expect(src).toMatch(/lastmodIn\(lastmodIndex,/);
    expect(src, 'the bundle may not import the disk half').not.toMatch(/sitemapLastmod\.mjs'/);
    expect(src, 'must not spawn git at render time').not.toMatch(/node:child_process|['"]child_process['"]/);
    const resolver = read('src/lib/seo/lastmodResolve.mjs');
    // An import statement, not a mention: the header of that file names node:fs in prose to explain
    // why it is absent, and a raw byte scan cannot tell a rule from a description of the rule.
    expect(resolver, 'the pure half must import nothing from node').not.toMatch(/from\s+['"]node:/);
  });

  it('the index served into the bundle is the index the sitemap resolved against', () => {
    expect(lastmodIndex).toEqual(buildLastmodIndex());
    expect(lastmodIndex.pageFiles.length).toBeGreaterThan(30);
    expect(Object.keys(lastmodIndex.posts).length).toBeGreaterThan(5);
  });

  it('no file on the path constructs a Date with no argument', () => {
    const findings: string[] = [];
    for (const rel of SCANNED_SOURCES) {
      read(rel).split('\n').forEach((line, i) => {
        if (/new\s+Date\s*\(\s*\)/.test(line)) findings.push(`  ${rel}:${i + 1}  ${line.trim()}`);
      });
    }
    expect(
      findings.length,
      [
        '',
        'WEBPAGE dateModified GUARD: a zero argument Date reached the schema builder.',
        'That stamps every WebPage node with the deploy time. Read the sitemap lookup or omit.',
        '',
        ...findings,
        '',
      ].join('\n'),
    ).toBe(0);
  });

  it('no file on the path reads a wall clock alias', () => {
    for (const rel of SCANNED_SOURCES) {
      const text = read(rel);
      expect(text, `${rel} must not read Date.now`).not.toMatch(/Date\s*\.\s*now\s*\(/);
      expect(text, `${rel} must not read Date.UTC`).not.toMatch(/Date\s*\.\s*UTC\s*\(/);
      expect(text, `${rel} must not use performance.now`).not.toMatch(/performance\s*\.\s*now\s*\(/);
    }
  });

  it('nothing the builder emits is newer than the newest table entry', () => {
    expect(Number.isFinite(NEWEST_TABLE_INSTANT)).toBe(true);
    const paths = [...SAMPLE_PATHS, CITY_PATH, '/blog/wind-and-water-tight-explained/'];
    for (const path of paths) {
      const stated = webPageOf(build(path).graph).dateModified as string;
      expect(stated, path).toBeTruthy();
      expect(Date.parse(stated), `${path} claims ${stated}, newer than anything in the table`)
        .toBeLessThanOrEqual(NEWEST_TABLE_INSTANT);
    }
  });
});

/* ------------------------------------------------------------ built output */

/** Every JSON-LD node in one HTML file, flattened across all ld+json blocks. */
function ldNodesIn(html: string): Node[] {
  const out: Node[] = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    let parsed: any;
    try {
      parsed = JSON.parse(m[1]);
    } catch {
      continue;
    }
    const nodes: Node[] = Array.isArray(parsed?.['@graph']) ? parsed['@graph'] : [parsed];
    out.push(...nodes.filter(Boolean));
  }
  return out;
}

/** Every WebPage dateModified in one HTML file. Normally zero or one. */
const webPageDatesIn = (html: string): string[] =>
  ldNodesIn(html)
    .filter((n) => n['@type'] === 'WebPage' && typeof n.dateModified === 'string')
    .map((n) => n.dateModified as string);

/** Every dateModified on ANY node in one HTML file, in document order. */
const allDatesIn = (html: string): string[] =>
  ldNodesIn(html)
    .filter((n) => typeof n.dateModified === 'string')
    .map((n) => n.dateModified as string);

function htmlFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === '_worker.js' || entry === '_astro') continue;
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) htmlFiles(p, acc);
    else if (entry.endsWith('.html')) acc.push(p);
  }
  return acc;
}

/** /a/b/ to dist/a/b/index.html, and / to dist/index.html. */
const htmlFor = (loc: string) => join(DIST, new URL(loc).pathname, 'index.html');

function sitemapEntries(): { loc: string; lastmod?: string }[] {
  const xml = readFileSync(SITEMAP, 'utf8');
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
    loc: /<loc>([^<]+)<\/loc>/.exec(m[1])![1],
    lastmod: /<lastmod>([^<]+)<\/lastmod>/.exec(m[1])?.[1],
  }));
}

describe('webpage dateModified guard: the built pages agree with the built sitemap', () => {
  const hasDist = existsSync(SITEMAP) && existsSync(join(DIST, 'index.html'));

  it.skipIf(!hasDist)('every dated sitemap URL renders the identical string on its WebPage node', () => {
    const entries = sitemapEntries();
    const dated = entries.filter((e) => e.lastmod);
    expect(dated.length, 'the sitemap should date most of the site').toBeGreaterThan(40);
    const mismatches: string[] = [];
    for (const { loc, lastmod } of dated) {
      const file = htmlFor(loc);
      if (!existsSync(file)) {
        mismatches.push(`  ${loc}  (no HTML at ${file})`);
        continue;
      }
      const dates = webPageDatesIn(readFileSync(file, 'utf8'));
      if (dates.length !== 1 || dates[0] !== lastmod) {
        mismatches.push(`  ${loc}  sitemap=${lastmod}  webpage=${dates.join(',') || '(none)'}`);
      }
    }
    expect(mismatches, ['', 'sitemap <lastmod> and WebPage dateModified disagree:', ...mismatches].join('\n'))
      .toEqual([]);
  });

  it.skipIf(!hasDist)('the homepage and the Cincinnati page, by name, carry their sitemap date', () => {
    const byLoc = new Map(sitemapEntries().map((e) => [e.loc, e.lastmod]));
    for (const loc of [`${SITE}/`, `${SITE}${CITY_PATH}`]) {
      const lastmod = byLoc.get(loc);
      expect(lastmod, `${loc} should carry a sitemap lastmod`).toBeTruthy();
      expect(webPageDatesIn(readFileSync(htmlFor(loc), 'utf8'))).toEqual([lastmod]);
    }
  });

  it.skipIf(!hasDist)('no built page states more than one distinct dateModified, and it matches the sitemap', () => {
    const byLoc = new Map(sitemapEntries().map((e) => [new URL(e.loc).pathname, e.lastmod]));
    const offenders: string[] = [];
    let pagesWithDates = 0;
    for (const file of htmlFiles(DIST)) {
      const dates = allDatesIn(readFileSync(file, 'utf8'));
      if (dates.length === 0) continue;
      pagesWithDates += 1;
      const distinct = [...new Set(dates)];
      const rel = '/' + file.slice(DIST.length + 1).replace(/index\.html$/, '').replace(/\\/g, '/');
      if (distinct.length !== 1) offenders.push(`  ${rel}  states ${distinct.join(' and ')}`);
      const lastmod = byLoc.get(rel);
      if (lastmod && distinct[0] !== lastmod) offenders.push(`  ${rel}  page=${distinct[0]}  sitemap=${lastmod}`);
    }
    expect(pagesWithDates).toBeGreaterThan(40);
    expect(offenders, ['', 'a built page disagrees with itself or with the sitemap:', ...offenders].join('\n'))
      .toEqual([]);
  });

  it.skipIf(!hasDist)('no built page claims a WebPage dateModified newer than the newest table entry', () => {
    const files = htmlFiles(DIST);
    expect(files.length).toBeGreaterThan(40);
    const tooNew: string[] = [];
    let dated = 0;
    for (const file of files) {
      for (const stated of webPageDatesIn(readFileSync(file, 'utf8'))) {
        dated += 1;
        if (Date.parse(stated) > NEWEST_TABLE_INSTANT) tooNew.push(`  ${file}  ${stated}`);
      }
    }
    expect(dated, 'most built pages should now carry a WebPage dateModified').toBeGreaterThan(40);
    expect(tooNew, ['', 'a built page claims to be newer than any recorded commit:', ...tooNew].join('\n'))
      .toEqual([]);
  });
});
