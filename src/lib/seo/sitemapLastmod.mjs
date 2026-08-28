/**
 * SITEMAP lastmod DERIVATION
 * ==========================
 *
 * WHY THIS FILE EXISTS. Until 2026-08-28 every entry in sitemap-0.xml was a bare <loc> with no
 * <lastmod>, and lastmod is the field Google actually uses to schedule a recrawl. Two commercial
 * pages, /delivery/ and /container-buying-guide/, sat at "Discovered, currently not indexed" with
 * last crawled = never, and a sitemap that says nothing about freshness gives the scheduler no
 * reason to move them up the queue.
 *
 * WHY IT IS NOT A BUILD TIMESTAMP. The obvious one line fix, a lastmod handed the build clock,
 * would stamp all 52 URLs with the date of the deploy and would be false for 51 of them. That is the same class of
 * error the fabricated-dates guard was written for on 2026-08-24 (see
 * src/lib/compliance/fabricated-dates-guard.test.ts: "Omission is honest; invention is not"), and
 * it is also self defeating, because a sitemap whose every lastmod moves on every deploy is a
 * sitemap Google learns to ignore. So this module derives a real date per URL or returns undefined
 * and lets the entry ship bare. A sitemap where some entries carry a true lastmod and the rest
 * carry none is correct.
 *
 * THE TWO SOURCES OF TRUTH.
 *   1. Blog posts use the content entry's own frontmatter, updatedDate when present and pubDate
 *      otherwise. Those dates were made git true by commit a042f3e, they are authored claims about
 *      the post, and they are readable in any build environment with no dependency on git.
 *   2. Everything else uses the last commit that touched the .astro module which produces the
 *      route. That is a fact recorded in this repository's history, not an estimate.
 *
 * WHY ONLY THE PAGE MODULE, AND NOT ITS LAYOUTS, COMPONENTS AND DATA MODULES. Widening the
 * derivation to imported files sounds more accurate and is in fact less honest. A shared module
 * usually changes for one consumer at a time: adding one city to cities.ts would move lastmod on
 * all fourteen city URLs, thirteen of which did not change. And src/data pricing is refreshed by a
 * daily GitHub Action, so including it would push every page it feeds back to "changed today" every
 * single day, reinventing the build timestamp problem by a longer route. Attributing only the page
 * module understates in some cases and overstates in none. Understating is the safe direction for a
 * hint that Google discounts wholesale once it catches a site inflating it.
 *
 * WHY SHELLING OUT TO GIT IS SAFE HERE. The build runs on Cloudflare Pages, which clones the
 * repository, so git and its history are normally present. Normally is not always, so both failure
 * modes are handled rather than assumed away:
 *   - no git binary, or not a work tree: no dates for non blog URLs, blog frontmatter still works.
 *   - a SHALLOW clone: also no dates. This case matters more than it looks. In a depth 1 clone
 *     git log -1 -- <path> returns HEAD's date for the handful of files that HEAD touched and
 *     nothing for every other file, so the surviving dates would all be the deploy date. That is
 *     the fabrication we are avoiding, wearing a git costume. Detect it and emit nothing.
 * Either way the build logs a warning line so the regression is visible in the deploy log instead
 * of silently draining lastmod out of the sitemap.
 *
 * Plain .mjs rather than .ts so the Astro config, which is itself .mjs, can import it directly with
 * no loader questions. The compliance guard imports the same file and exercises it for real.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = fileURLToPath(new URL('../../../', import.meta.url));

/** Route file extensions Astro will build a page from. */
const PAGE_EXT = ['astro', 'md', 'mdx'];

/** Repo relative paths, forward slashed, which is how git prints them. */
const PAGES_DIR = 'src/pages';
const BLOG_DIR = 'src/content/blog';

function git(args) {
  return execFileSync('git', args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
}

/**
 * True only when this checkout can answer "when did file X last change" correctly.
 * A shallow clone answers it wrongly rather than not at all, which is why it is rejected outright.
 */
export function gitHistoryIsUsable() {
  try {
    if (git(['rev-parse', '--is-inside-work-tree']).trim() !== 'true') return false;
    return git(['rev-parse', '--is-shallow-repository']).trim() === 'false';
  } catch {
    return false;
  }
}

/**
 * One walk of the log rather than one process per URL: git log newest first, printing each commit's
 * date followed by the paths it touched, and the first date a path appears under is that path's
 * last modification. Pathspecs keep the walk to the two trees that produce routes.
 */
function lastCommitDates() {
  const dates = new Map();
  if (!gitHistoryIsUsable()) return dates;
  let out;
  try {
    out = git([
      '-c',
      'core.quotepath=false',
      'log',
      '--pretty=format:%cI',
      '--name-only',
      '--no-merges',
      '--',
      PAGES_DIR,
      BLOG_DIR,
    ]);
  } catch {
    return dates;
  }
  let current = null;
  for (const line of out.split('\n')) {
    const value = line.trim();
    if (!value) continue;
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
      current = value;
      continue;
    }
    if (current && !dates.has(value)) dates.set(value, current);
  }
  return dates;
}

/**
 * Frontmatter read as text, not through astro:content, because this runs while the Astro config is
 * being loaded and the content layer does not exist yet. Only two keys are needed and both are
 * plain scalars, so a line match over the frontmatter block is enough and cannot be fooled by body
 * text, which sits after the closing delimiter.
 */
function blogFrontmatterDates() {
  const dates = new Map();
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
    if (iso) dates.set(match[1], iso[0]);
  }
  return dates;
}

/**
 * URL path segments back to the file that renders them, mirroring Astro's own resolution order:
 * a literal file or directory wins, and only when no literal match exists does a [param] file or
 * directory at that level take the segment. Returns a repo relative path or null.
 */
function resolvePageFile(dir, segments) {
  const abs = join(REPO_ROOT, dir);
  if (!existsSync(abs)) return null;
  const entries = readdirSync(abs, { withFileTypes: true });
  const [head, ...rest] = segments;

  if (rest.length === 0) {
    for (const ext of PAGE_EXT) {
      if (entries.some((e) => e.isFile() && e.name === `${head}.${ext}`)) return `${dir}/${head}.${ext}`;
    }
    if (entries.some((e) => e.isDirectory() && e.name === head)) {
      for (const ext of PAGE_EXT) {
        const index = `${dir}/${head}/index.${ext}`;
        if (existsSync(join(REPO_ROOT, index))) return index;
      }
    }
    const dynamic = entries.find((e) => e.isFile() && /^\[.+\]\.(astro|md|mdx)$/.test(e.name));
    return dynamic ? `${dir}/${dynamic.name}` : null;
  }

  if (entries.some((e) => e.isDirectory() && e.name === head)) {
    const hit = resolvePageFile(`${dir}/${head}`, rest);
    if (hit) return hit;
  }
  const dynamicDir = entries.find((e) => e.isDirectory() && /^\[.+\]$/.test(e.name));
  return dynamicDir ? resolvePageFile(`${dir}/${dynamicDir.name}`, rest) : null;
}

let index = null;

/** Built once per build, then reused for all 50 plus lookups. */
function loadIndex() {
  if (index) return index;
  const commits = lastCommitDates();
  const posts = blogFrontmatterDates();
  if (commits.size === 0) {
    console.warn(
      '[sitemap] No usable git history in this checkout (missing git, or a shallow clone). ' +
        'Non blog URLs will ship without <lastmod> rather than with a build timestamp.',
    );
  }
  index = { commits, posts };
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
  const { commits, posts } = loadIndex();
  let pathname;
  try {
    pathname = new URL(url).pathname;
  } catch {
    return undefined;
  }
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 2 && segments[0] === 'blog') {
    const slug = segments[1];
    const authored = posts.get(slug);
    if (authored) return authored;
    // No frontmatter date means fall back to the entry file's own history, never to the
    // [...slug].astro template, whose date belongs to the layout and not to any one post.
    for (const ext of ['md', 'mdx']) {
      const entry = `${BLOG_DIR}/${slug}.${ext}`;
      if (commits.has(entry)) return commits.get(entry);
    }
    return undefined;
  }

  if (segments.length === 0) return commits.get(`${PAGES_DIR}/index.astro`);

  const file = resolvePageFile(PAGES_DIR, segments);
  return file ? commits.get(file) : undefined;
}

/**
 * The @astrojs/sitemap serialize hook. Always returns the item: dropping entries is this hook's
 * other power and is not wanted here.
 */
export function serializeWithLastmod(item) {
  const lastmod = lastmodFor(item.url);
  return lastmod ? { ...item, lastmod } : item;
}
