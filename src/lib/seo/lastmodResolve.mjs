/**
 * lastmod RESOLUTION, THE PURE HALF
 * =================================
 *
 * WHAT THIS FILE IS. The one function that turns a URL into a lastmod, with every fact it needs
 * handed to it as data. It reads no file, spawns no process and consults no clock. It exists as a
 * separate module because two callers need it and only one of them is allowed to touch the disk:
 *
 *   1. The sitemap serialize hook in astro.config.mjs, running in plain Node during the build. It
 *      calls lastmodFor() in src/lib/seo/sitemapLastmod.mjs, which builds the index from disk with
 *      node:fs and passes it here.
 *   2. The WebPage node in src/lib/schema/buildPageSchema.ts, running inside the page bundle. The
 *      Cloudflare adapter builds that bundle with ssr.noExternal for a webworker target and refuses
 *      outright to bundle node:fs ("Cannot bundle Node.js built-in"), so that caller cannot import
 *      the fs half. It receives the SAME index, serialised once at config load and served into the
 *      bundle as the virtual module virtual:route-lastmod-index by routeLastmodIndexPlugin(), and
 *      passes it here.
 *
 * One resolver, one index, two callers. That is what lets the sitemap's <lastmod> and the page's
 * dateModified be a single fact rendered twice rather than two computations that happen to agree.
 * The alternative, a second URL to file mapper living next to the schema builder, would drift the
 * first time somebody fixed a routing edge case in one and not the other.
 *
 * THE INDEX. Three plain, JSON safe fields, because the whole thing crosses a JSON.stringify:
 *   commits    repo relative page module path to the ISO instant of its last commit. This is
 *              src/data/routeLastmod.mjs verbatim, the committed table the generator writes.
 *   posts      blog slug to the YYYY-MM-DD the post's own frontmatter states, updatedDate when
 *              present and pubDate otherwise.
 *   pageFiles  every route producing module under src/pages, sorted, forward slashed. This is the
 *              directory listing the fs half used to take live, snapshotted once so this file can
 *              walk it without a filesystem.
 *
 * ROUTING. resolvePageFileIn() maps URL segments back to a module using Astro's own precedence: a
 * literal file or directory wins, and only when no literal match exists does a [param] file or
 * directory at that level take the segment. It is the same walk the fs version performed with
 * readdirSync, expressed over the listing instead.
 *
 * OMISSION IS THE SUPPORTED ANSWER. A URL that resolves to no module, or to a module the table has
 * no entry for, returns undefined. Both callers ship nothing in that case. Nothing here, and
 * nothing in either caller, falls back to build time or to today; the compliance guards scan for
 * that construct and fail the suite if it appears.
 *
 * Plain .mjs so the Astro config, itself .mjs, can import the fs half which imports this, with no
 * loader questions. No em dash and no en dash in this file: the build time dash guard scans it.
 */

/** Repo relative paths, forward slashed, which is how the committed table keys them. */
export const PAGES_DIR = 'src/pages';
export const BLOG_DIR = 'src/content/blog';

/** Route file extensions Astro will build a page from. */
export const PAGE_EXT = ['astro', 'md', 'mdx'];

/** Matches a route producing file name at any level. */
export const PAGE_FILE_RE = /\.(astro|md|mdx)$/;

const has = (record, key) => Object.hasOwn(record ?? {}, key);

/**
 * URL path segments back to the file that renders them, over a sorted listing of page files.
 * Returns a repo relative path or null. Mirrors Astro's resolution order exactly as described in
 * the header.
 */
export function resolvePageFileIn(pageFiles, dir, segments) {
  const prefix = `${dir}/`;
  const files = new Set();
  const dirs = new Set();
  for (const f of pageFiles) {
    if (!f.startsWith(prefix)) continue;
    const rest = f.slice(prefix.length);
    const slash = rest.indexOf('/');
    if (slash === -1) files.add(rest);
    else dirs.add(rest.slice(0, slash));
  }
  if (files.size === 0 && dirs.size === 0) return null;

  const [head, ...rest] = segments;

  if (rest.length === 0) {
    for (const ext of PAGE_EXT) {
      if (files.has(`${head}.${ext}`)) return `${dir}/${head}.${ext}`;
    }
    if (dirs.has(head)) {
      for (const ext of PAGE_EXT) {
        const index = `${dir}/${head}/index.${ext}`;
        if (pageFiles.includes(index)) return index;
      }
    }
    const dynamic = [...files].sort().find((n) => /^\[.+\]\.(astro|md|mdx)$/.test(n));
    return dynamic ? `${dir}/${dynamic}` : null;
  }

  if (dirs.has(head)) {
    const hit = resolvePageFileIn(pageFiles, `${dir}/${head}`, rest);
    if (hit) return hit;
  }
  const dynamicDir = [...dirs].sort().find((n) => /^\[.+\]$/.test(n));
  return dynamicDir ? resolvePageFileIn(pageFiles, `${dir}/${dynamicDir}`, rest) : null;
}

/**
 * The lastmod for one URL given an index, or undefined when the index cannot state one. This is
 * the function both the sitemap and the WebPage node call.
 */
export function lastmodIn(index, url) {
  const commits = index?.commits ?? {};
  const posts = index?.posts ?? {};
  const pageFiles = index?.pageFiles ?? [];

  let pathname;
  try {
    pathname = new URL(url).pathname;
  } catch {
    return undefined;
  }
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 2 && segments[0] === 'blog') {
    const slug = segments[1];
    if (has(posts, slug)) return posts[slug];
    // No frontmatter date means fall back to the entry file's own recorded commit, never to the
    // [...slug].astro template, whose date belongs to the layout and not to any one post.
    for (const ext of ['md', 'mdx']) {
      const entry = `${BLOG_DIR}/${slug}.${ext}`;
      if (has(commits, entry)) return commits[entry];
    }
    return undefined;
  }

  if (segments.length === 0) {
    const home = `${PAGES_DIR}/index.astro`;
    return has(commits, home) ? commits[home] : undefined;
  }

  const file = resolvePageFileIn(pageFiles, PAGES_DIR, segments);
  return file && has(commits, file) ? commits[file] : undefined;
}
