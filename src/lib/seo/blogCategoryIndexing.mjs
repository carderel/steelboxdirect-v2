/**
 * BLOG CATEGORY INDEXING RULE
 * ===========================
 *
 * WHY THIS FILE EXISTS. Two surfaces decide whether a blog category URL is offered to Google, and
 * until 2026-09-01 they disagreed. src/pages/blog/category/[category].astro set noindex only when a
 * category rendered zero posts, so a populated category page shipped indexable. astro.config.mjs
 * excluded EVERY /blog/category/ URL from the sitemap with no condition at all. The net effect was
 * three real, populated, indexable pages that the sitemap actively withheld. Nothing errored,
 * nothing was reported, and the pages simply waited to be found some other way. This module is the
 * one place the rule now lives, and both surfaces read it.
 *
 * WHY THE THRESHOLD IS 2 AND NOT 1. A category page is a list, and a list of one is a worse copy of
 * the single thing it lists: same title words, same description, one link, and no reason for a
 * reader who found the post to want the page. Sending Google a URL like that is asking it to choose
 * between two near duplicates, and the cost of losing that coin flip is that the post loses. Two
 * posts is the smallest number at which the page starts doing the only job a category page has,
 * which is to show that there is more than the one thing. So the constant is 2, it is named, and it
 * is exported rather than typed into either surface, because a threshold that appears twice is a
 * threshold that will eventually appear as two different numbers.
 *
 * WHY BOTH SURFACES MUST READ THE SAME FUNCTION. A URL that is listed in the sitemap and also
 * carries a noindex tag is a direct self contradiction, and Google reports it back as one:
 * "Submitted URL marked noindex" in Search Console, an error against the property rather than a
 * quiet omission. The inverse, an indexable page held out of the sitemap, is the bug that was
 * actually here: no error anywhere, just a page that never gets crawled on schedule. Both failures
 * come from the same root, which is two copies of one decision. There is now one copy.
 * src/lib/compliance/blog-category-indexing-guard.test.ts asserts the agreement against BUILT dist
 * output rather than against source, because agreement in source is only evidence and agreement in
 * the artifact is the fact.
 *
 * WHY THE COUNTS ARE READ OFF DISK RATHER THAN THROUGH astro:content. astro.config.mjs is the first
 * thing Astro loads, and the content collection does not exist while the config is being evaluated,
 * so getCollection() is not available to the sitemap filter at the moment the filter is defined.
 * Reading the frontmatter as text is the same technique, and the same tradeoff, that
 * src/lib/seo/sitemapLastmod.mjs already uses for post dates: only a couple of plain scalar keys are
 * needed, they sit above the closing delimiter where body text cannot reach them, and a plain file
 * read works in any checkout however shallow. Plain .mjs for the same reason that file is .mjs, so
 * the config can import it with no loader questions.
 *
 * ON DRAFTS. draft: true posts do not count, which mirrors what the category page itself renders in
 * a production build (it filters on import.meta.env.PROD). In dev the page shows drafts and may
 * therefore render more posts than this module counts, and that is not a drift: the sitemap is a
 * production artifact and there is no dev build to disagree with.
 *
 * WHY THE PREDICATE ITSELF LIVES ONE FILE OVER, in src/lib/seo/blogCategoryIndexRule.mjs. The page
 * is one of the two surfaces that must consult it, and every page module is bundled for the
 * Cloudflare worker whether it prerenders or not. Importing this file from the page therefore
 * dragged node:fs into that bundle and failed the build outright, before tree shaking ever got a
 * say. So the constant, the predicate and the slug rule sit in a sibling with no I/O in it, this
 * file re-exports all three unchanged, and the split is a bundling boundary rather than a second
 * copy of the decision. shouldIndexCategory is still defined exactly once.
 *
 * ON DELETING ROUTES. This module decides indexing and nothing else. All six category routes still
 * build and all six URLs still resolve, exactly as getStaticPaths() has always guaranteed. A
 * category that fills up later crosses the threshold on its own with no code change.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  MIN_POSTS_FOR_CATEGORY_INDEX,
  shouldIndexCategory,
  categorySlug,
} from './blogCategoryIndexRule.mjs';

const REPO_ROOT = fileURLToPath(new URL('../../../', import.meta.url));

/** Repo relative, forward slashed, matching how sitemapLastmod.mjs names the same directory. */
const BLOG_DIR = 'src/content/blog';

/**
 * Re-exported so that every consumer that can afford the file system read (the config, the guards)
 * has one import to reach for, while the page reaches past this file to the pure sibling.
 */
export { MIN_POSTS_FOR_CATEGORY_INDEX, shouldIndexCategory, categorySlug };

/**
 * Published post count per category slug, read from frontmatter on disk. draft: true is skipped.
 * A category with no posts never appears as a key, which is the same answer as a count of zero for
 * every caller below.
 */
export function publishedPostCountsBySlug() {
  const counts = new Map();
  const dir = join(REPO_ROOT, BLOG_DIR);
  if (!existsSync(dir)) return counts;
  for (const name of readdirSync(dir)) {
    if (!/\.(md|mdx)$/.test(name)) continue;
    const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(join(dir, name), 'utf8'));
    if (!fm) continue;
    const read = (key) => {
      const hit = new RegExp(`^${key}:\\s*(.+)$`, 'm').exec(fm[1]);
      return hit ? hit[1].trim().replace(/^['"]|['"]$/g, '') : null;
    };
    if (read('draft') === 'true') continue;
    const category = read('category');
    if (!category) continue;
    const slug = categorySlug(category);
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }
  return counts;
}

/**
 * The category slugs that are allowed into the index and the sitemap. Sorted so the sitemap filter,
 * the guard and any future diff all see one stable order.
 */
export function indexableCategorySlugs() {
  return [...publishedPostCountsBySlug().entries()]
    .filter(([, count]) => shouldIndexCategory(count))
    .map(([slug]) => slug)
    .sort();
}

/**
 * True when this sitemap URL is a category URL that has earned its place. Non category URLs are not
 * this function's business and it says so by returning false; the config asks the question only
 * after it has established the URL is under /blog/category/.
 */
export function sitemapAllowsCategoryUrl(url) {
  const allowed = indexableCategorySlugs();
  return allowed.some((slug) => url.includes(`/blog/category/${slug}/`) || url.endsWith(`/blog/category/${slug}`));
}
