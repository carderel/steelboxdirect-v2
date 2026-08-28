/**
 * ROUTE lastmod FRESHNESS GUARD
 * =============================
 *
 * WHY THIS FILE EXISTS. On 2026-08-28 the sitemap's <lastmod> dates stopped being computed during
 * the build and started being read from a committed table, src/data/routeLastmod.mjs, written by
 * scripts/generate-route-lastmod.mjs. That move fixed a real production failure (Cloudflare Pages
 * clones shallow, the build refused to trust a shallow clone, and 46 of 54 URLs shipped bare on
 * every deploy) and it introduced a new failure mode in exchange, which is what this guard is for.
 *
 * THE NEW FAILURE MODE. A computed value cannot go stale. A committed one can, silently, and in the
 * one direction nobody notices: a developer edits src/pages/delivery/index.astro, forgets to run
 * the generator, and the sitemap keeps advertising last month's date for a page that changed today.
 * Understating freshness is the safe direction, which is exactly why it never announces itself. Six
 * months of that and the table is a museum piece, the sitemap is telling Google nothing has moved
 * on this site since spring, and every hour of it looked fine. So the rot has to be made loud, and
 * the test suite is where it gets made loud.
 *
 * WHAT IT ASSERTS, IN TWO TIERS, and the split matters more than the assertions do.
 *
 *   TIER 1, everything that needs no git at all. Shape, sortedness, every key still on disk, every
 *   value a full ISO instant, and, most important of all, that lastmodFor() actually answers from
 *   the committed table with no history present. That last one IS the production bug, expressed as
 *   a test: it is the assertion that would have failed on 2026-08-27 and did not exist to fail.
 *   These run everywhere, including on Cloudflare and in any shallow CI checkout.
 *
 *   TIER 2, the freshness comparison itself, which needs full history and is skipped without it.
 *   The committed table is rebuilt from git and compared entry for entry.
 *
 * WHY TIER 2 SKIPS RATHER THAN FAILS WHEN THE HISTORY IS MISSING. A shallow checkout cannot tell a
 * stale table from a current one. It can only produce a wrong answer, because in a depth 1 clone
 * every file the clone touched reports the clone date and every other file reports nothing, so a
 * comparison there would flag most of the table as newer than recorded and demand a regeneration
 * that would itself be fabricated. A guard that fails for a reason it invented is worse than no
 * guard: it trains people to ignore it. So the check is skipped, the skip is announced on stderr
 * rather than being silent, and tier 1 still runs with real teeth. The developer machine and any
 * full history CI job are where freshness gets verified, and those are the only places a stale
 * table can be created or fixed anyway.
 *
 * WHEN THIS GUARD FAILS, THE FIX IS ALWAYS THE SAME ONE COMMAND: npm run generate:route-lastmod,
 * then commit the diff. Never hand edit the table, and never delete an entry to quiet a failure.
 * An entry deleted from the table does not become undated in a harmless way, it becomes a URL that
 * silently stops carrying freshness information at all.
 */

import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { routeLastmod, SCHEMA_VERSION as TABLE_SCHEMA } from '../../data/routeLastmod.mjs';
import { lastmodFor } from '../seo/sitemapLastmod.mjs';
import {
  buildTable,
  diffTables,
  gitHistoryIsUsable,
  OUT_PATH,
  SCHEMA_VERSION,
} from '../../../scripts/generate-route-lastmod.mjs';

const REPO_ROOT = import.meta.dirname
  ? join(import.meta.dirname, '..', '..', '..')
  : process.cwd();

const hasGit: boolean = gitHistoryIsUsable();

/** The committed table as an object, and as the raw text a reviewer reads in the diff. */
const table: Record<string, string> = routeLastmod;
const entries = Object.entries(table);
const RAW = readFileSync(join(REPO_ROOT, OUT_PATH), 'utf8');

/** The rerun command, spelled once so every failure message says the same thing. */
const FIX = 'npm run generate:route-lastmod, then commit the result';

if (!hasGit) {
  console.warn(
    `[route-lastmod] No usable git history here (missing git, or a shallow clone), so the ` +
      `freshness comparison is SKIPPED, not passed. ${OUT_PATH} is checked for shape and for ` +
      `serving dates without git, which is all this environment can honestly verify.`,
  );
}

/**
 * A representative spread of URLs: the home page, both stalled commercial pages, a nested static
 * page, both dynamic routes, and a post. Deliberately the same list the sitemap guard samples.
 */
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

describe('route lastmod guard: the committed table is well formed', () => {
  it('exists, carries a matching schema version, and is not thin', () => {
    expect(existsSync(join(REPO_ROOT, OUT_PATH)), `${OUT_PATH} should exist`).toBe(true);
    expect(TABLE_SCHEMA, 'the table schema version must match the generator').toBe(SCHEMA_VERSION);
    expect(entries.length, 'the table should cover most of the site').toBeGreaterThan(35);
  });

  it('records a full ISO instant for every entry, never a partial or a placeholder', () => {
    const bad = entries.filter(([, iso]) => !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/.test(iso));
    expect(bad.map(([f, iso]) => `${f} = ${iso}`), 'malformed dates in the table').toEqual([]);
  });

  it('points only at files that still exist, so no deleted page keeps a date', () => {
    const orphans = entries.map(([f]) => f).filter((f) => !existsSync(join(REPO_ROOT, f)));
    expect(orphans, `these table keys no longer exist on disk. Fix: ${FIX}`).toEqual([]);
  });

  it('keys only route producing modules, under src/pages or src/content/blog', () => {
    const stray = entries
      .map(([f]) => f)
      .filter((f) => !/^src\/(pages|content\/blog)\//.test(f) || !/\.(astro|md|mdx)$/.test(f));
    expect(stray, 'only page modules and blog entries belong in this table').toEqual([]);
  });

  it('is sorted and one entry per line, so the diff reads as which pages changed', () => {
    const keys = entries.map(([f]) => f);
    expect(keys, 'the table must be written sorted by path').toEqual([...keys].sort());
    // Parsing the raw text and getting the same set back proves the object literal really is one
    // entry per line. A serialiser that collapsed it onto fewer lines would still import fine and
    // would make every regeneration look like a rewrite of the whole file in review.
    const parsed = [...RAW.matchAll(/^ {2}'([^']+)': '([^']+)',$/gm)].map((m) => m[1]);
    expect(parsed).toEqual(keys);
  });
});

describe('route lastmod guard: the build reads data, and never asks git', () => {
  /**
   * The regression this exists to catch is not hypothetical. It is what shipped on 2026-08-27, and
   * the tempting fix for any future gap in the table is to reach back for git at build time.
   */
  const derivation = readFileSync(join(REPO_ROOT, 'src/lib/seo/sitemapLastmod.mjs'), 'utf8');

  it('the derivation module spawns no process, so a shallow clone changes nothing', () => {
    expect(derivation, 'must not import child_process').not.toMatch(/node:child_process|['"]child_process['"]/);
    expect(derivation, 'must not spawn or exec anything').not.toMatch(/exec(File)?Sync|spawnSync|execSync/);
  });

  it('the derivation module reads the committed table', () => {
    expect(derivation).toMatch(/from '\.\.\/\.\.\/data\/routeLastmod\.mjs'/);
    expect(derivation).toMatch(/routeLastmod/);
  });

  it('serves a date for the sampled URLs with no git involved at all', () => {
    // Nothing in this test touches git, and nothing in the call path can. If this passes in a
    // developer checkout it passes on Cloudflare, which is the entire point of the change.
    const dated = SAMPLE_URLS.filter((u) => typeof lastmodFor(u) === 'string');
    expect(dated, 'every sampled URL should carry a lastmod from the committed table').toEqual(
      SAMPLE_URLS,
    );
  });

  it('resolves a URL to its own module date, not to some shared one', () => {
    expect(lastmodFor('https://steelboxdirect.com/delivery/')).toBe(
      table['src/pages/delivery/index.astro'],
    );
    expect(lastmodFor('https://steelboxdirect.com/')).toBe(table['src/pages/index.astro']);
    expect(lastmodFor('https://steelboxdirect.com/locations/ohio/dayton-shipping-containers/')).toBe(
      table['src/pages/locations/[state]/[citySlug].astro'],
    );
  });

  it('still omits rather than invents when a URL is not in the table', () => {
    expect(lastmodFor('https://steelboxdirect.com/no-such-page/')).toBeUndefined();
  });
});

describe('route lastmod guard: the table is not stale (needs full git history)', () => {
  it.skipIf(!hasGit)('every recorded date matches the last commit that touched that file', () => {
    const derived = buildTable();
    const diff = diffTables(entries, derived);
    expect(
      [...diff.stale, ...diff.missing, ...diff.removed],
      [
        '',
        `ROUTE LASTMOD FRESHNESS GUARD: ${OUT_PATH} no longer matches git history.`,
        'A page changed and the table did not, so the sitemap is advertising an old date for it.',
        `Fix: ${FIX}. Do not hand edit the table.`,
        '',
        ...diff.stale.map((l: string) => `  stale    ${l}`),
        ...diff.missing.map((l: string) => `  missing  ${l}`),
        ...diff.removed.map((l: string) => `  dropped  ${l}`),
        '',
      ].join('\n'),
    ).toEqual([]);
  });

  it.skipIf(!hasGit)('covers every route module that git has ever seen a commit for', () => {
    const derived = buildTable();
    expect(derived.length, 'the derivation itself should not come back empty').toBeGreaterThan(35);
    expect(entries.length).toBe(derived.length);
  });
});
