/**
 * SITEMAP lastmod DERIVATION, THE DISK HALF
 * =========================================
 *
 * WHY THIS FILE EXISTS. Until 2026-08-28 every entry in sitemap-0.xml was a bare <loc> with no
 * <lastmod>, and lastmod is the field Google actually uses to schedule a recrawl. Two commercial
 * pages, /delivery/ and /container-buying-guide/, sat at "Discovered, currently not indexed" with
 * last crawled = never, and a sitemap that says nothing about freshness gives the scheduler no
 * reason to move them up the queue.
 *
 * WHY IT IS NOT A BUILD TIMESTAMP. The obvious one line fix, a lastmod handed the build clock,
 * would stamp all 54 URLs with the date of the deploy and would be false for 53 of them. That is
 * the same class of error the fabricated-dates guard was written for on 2026-08-24 (see
 * src/lib/compliance/fabricated-dates-guard.test.ts: "Omission is honest; invention is not"), and
 * it is also self defeating, because a sitemap whose every lastmod moves on every deploy is a
 * sitemap Google learns to ignore. So this module states a real date per URL or returns undefined
 * and lets the entry ship bare. A sitemap where some entries carry a true lastmod and the rest
 * carry none is correct.
 *
 * THE TWO SOURCES OF TRUTH.
 *   1. Blog posts use the content entry's own frontmatter, updatedDate when present and pubDate
 *      otherwise. Those dates were made git true by commit a042f3e, they are authored claims about
 *      the post, and they are readable in any build environment.
 *   2. Everything else reads src/data/routeLastmod.mjs, a COMMITTED table of the last commit that
 *      touched each page module. That is a fact recorded in this repository's history, derived by
 *      scripts/generate-route-lastmod.mjs where the history exists, and reviewed in a diff.
 *
 * WHY THE TABLE IS COMMITTED RATHER THAN DERIVED HERE, which is the bug this file was rewritten to
 * fix on 2026-08-28. The first version of this module shelled out to git during the build. Locally
 * that dated 52 of 52 URLs. In production it dated 8 of 54, and those 8 were the blog posts, which
 * never needed git. Cloudflare Pages clones SHALLOW, and in a depth 1 clone git log -1 -- <path>
 * returns HEAD's date for the handful of files HEAD touched and nothing for every other file, so
 * every surviving answer would have been the deploy date. This module detected that and correctly
 * emitted nothing, which meant the safety path fired on every single deploy and drained the field
 * the change had just added. The refusal was right. Asking the question in an environment that
 * cannot answer it was wrong. So the question is now asked once, on a machine with full history,
 * and the answer is committed. Nothing here softens the refusal: a route absent from the table
 * still ships bare, and the generator itself refuses to write a table from a shallow clone, because
 * doing that would turn a transient omission into a committed invention.
 *
 * NO GIT, NO CHILD PROCESS, NO CLOCK IN THIS FILE. It reads three things, a data module, the blog
 * frontmatter and the src/pages listing, all plain files present in any checkout however shallow.
 * That is the property that makes production behave like a developer machine, and
 * src/lib/compliance/route-lastmod-freshness-guard.test.ts asserts it rather than trusting it.
 *
 * WHY THIS FILE WAS SPLIT IN TWO ON 2026-09-08. T-212 put the same date on every page's WebPage
 * node as schema.org dateModified, sourced from this lookup so the two surfaces cannot disagree.
 * The schema builder runs inside the page bundle, and the Cloudflare adapter builds that bundle
 * with ssr.noExternal for a webworker target, which refuses to bundle node:fs at all ("Cannot
 * bundle Node.js built-in node:fs imported from src/lib/seo/sitemapLastmod.mjs", the first build
 * attempt). So the resolution logic moved, unchanged in behaviour, to src/lib/seo/lastmodResolve.mjs
 * as a pure function of (index, url), and this file became the half that touches the disk: it
 * builds the index once, hands it to the sitemap hook here in Node, and serves the identical index
 * into the bundle as the virtual module virtual:route-lastmod-index through routeLastmodIndexPlugin
 * below, registered in astro.config.mjs and vitest.config.ts. One resolver, one index, two callers.
 * A second mapper beside the schema builder would have been shorter and would have drifted.
 *
 * WHY ONLY THE PAGE MODULE, AND NOT ITS LAYOUTS, COMPONENTS AND DATA MODULES. Widening the
 * attribution to imported files sounds more accurate and is in fact less honest. A shared module
 * usually changes for one consumer at a time: adding one city to cities.ts would move lastmod on
 * all fourteen city URLs, thirteen of which did not change. And src/data pricing is refreshed by a
 * daily GitHub Action, so including it would push every page it feeds back to "changed today" every
 * single day, reinventing the build timestamp problem by a longer route. Attributing only the page
 * module understates in some cases and overstates in none. Understating is the safe direction for a
 * hint that Google discounts wholesale once it catches a site inflating it.
 *
 * WHY THE TABLE IS KEYED BY SOURCE FILE AND NOT BY URL. The recorded fact is about the file. One
 * [citySlug].astro serves fourteen city URLs and one date covers all of them, so a new city
 * inherits a correct date with no regeneration at all. resolvePageFileIn() in the pure half maps a
 * URL back to its module using the same resolution order Astro uses.
 *
 * Plain .mjs rather than .ts so the Astro config, which is itself .mjs, can import it directly with
 * no loader questions, and for the same reason the committed table is .mjs too. The compliance
 * guards import these same files and exercise them for real. No em dash and no en dash in this
 * file: the build time dash guard scans it.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { routeLastmod } from '../../data/routeLastmod.mjs';
import { BLOG_DIR, PAGES_DIR, PAGE_FILE_RE, lastmodIn } from './lastmodResolve.mjs';

const REPO_ROOT = fileURLToPath(new URL('../../../', import.meta.url));

/**
 * Frontmatter read as text, not through astro:content, because this runs while the Astro config is
 * being loaded and the content layer does not exist yet. Only two keys are needed and both are
 * plain scalars, so a line match over the frontmatter block is enough and cannot be fooled by body
 * text, which sits after the closing delimiter. Returns a plain object so it survives JSON.
 */
function blogFrontmatterDates() {
  const dates = {};
  const dir = join(REPO_ROOT, BLOG_DIR);
  if (!existsSync(dir)) return dates;
  for (const name of readdirSync(dir)) {
    const match = /^(.+)\.(md|mdx)$/.exec(name);
    if (!match) continue;
    const raw = readFileSync(join(dir, name), 'utf8');
    const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
    if (!fm) continue;
    const read = (key) => {
      const hit = new RegExp(`^${key}:\\s*(.+)$`, 'm').exec(fm[1]);
      return hit ? hit[1].trim().replace(/^['"]|['"]$/g, '') : null;
    };
    const value = read('updatedDate') ?? read('pubDate');
    if (!value) continue;
    const iso = /^\d{4}-\d{2}-\d{2}/.exec(value);
    if (iso) dates[match[1]] = iso[0];
  }
  return dates;
}

/** Every route producing module under src/pages, repo relative, forward slashed, sorted. */
function collectPageFiles() {
  const out = [];
  const walk = (rel) => {
    const abs = join(REPO_ROOT, rel);
    if (!existsSync(abs)) return;
    for (const entry of readdirSync(abs, { withFileTypes: true })) {
      const next = `${rel}/${entry.name}`;
      if (entry.isDirectory()) walk(next);
      else if (entry.isFile() && PAGE_FILE_RE.test(entry.name)) out.push(next);
    }
  };
  walk(PAGES_DIR);
  return out.sort();
}

let index = null;

/**
 * The index both callers resolve against. Built once per process from the committed table, the
 * blog frontmatter and the src/pages listing, then reused for every lookup and serialised verbatim
 * into the virtual module, so the sitemap and the page bundle see one object, not two derivations.
 */
export function buildLastmodIndex() {
  if (index) return index;
  const commits = { ...(routeLastmod ?? {}) };
  if (Object.keys(commits).length === 0) {
    console.warn(
      '[sitemap] src/data/routeLastmod.mjs is empty, so non blog URLs will ship without <lastmod> ' +
        'rather than with a fabricated one. Run: npm run generate:route-lastmod',
    );
  }
  index = { commits, posts: blogFrontmatterDates(), pageFiles: collectPageFiles() };
  return index;
}

/** Test seam: forget the cached index so a guard can rebuild it. */
export function resetLastmodCache() {
  index = null;
}

/**
 * The lastmod for one sitemap URL, or undefined when this repository cannot state one truthfully.
 * Undefined is a supported answer and ships the entry bare, exactly as it shipped before this file
 * existed.
 */
export function lastmodFor(url) {
  return lastmodIn(buildLastmodIndex(), url);
}

/**
 * The @astrojs/sitemap serialize hook. Always returns the item: dropping entries is this hook's
 * other power and is not wanted here.
 */
export function serializeWithLastmod(item) {
  const lastmod = lastmodFor(item.url);
  return lastmod ? { ...item, lastmod } : item;
}

/** The specifier page code imports. Declared for TypeScript in src/env.d.ts. */
export const LASTMOD_INDEX_ID = 'virtual:route-lastmod-index';
const RESOLVED_LASTMOD_INDEX_ID = `\0${LASTMOD_INDEX_ID}`;

/**
 * Vite plugin serving buildLastmodIndex() into the bundle as a default export. This is how the
 * schema builder, which may not import node:fs, receives the very index the sitemap resolved
 * against. Registered in astro.config.mjs for the site and in vitest.config.ts so the schema tests
 * exercise the real thing rather than a stub.
 */
export function routeLastmodIndexPlugin() {
  return {
    name: 'sbd-route-lastmod-index',
    resolveId(id) {
      return id === LASTMOD_INDEX_ID ? RESOLVED_LASTMOD_INDEX_ID : null;
    },
    load(id) {
      if (id !== RESOLVED_LASTMOD_INDEX_ID) return null;
      return `export default ${JSON.stringify(buildLastmodIndex())};\n`;
    },
  };
}
