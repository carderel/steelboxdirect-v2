/**
 * BLOG CATEGORY INDEX RULE, THE PURE HALF
 * =======================================
 *
 * The decision itself: how many published posts a blog category needs before its page is offered to
 * Google, and the slug rule that names the page. No I/O, no imports, nothing a bundler has to think
 * about. Its sibling src/lib/seo/blogCategoryIndexing.mjs re-exports every symbol here and adds the
 * disk read that counts the posts; read that file's header for the whole argument, including why
 * the threshold is two and not one.
 *
 * WHY THIS IS A SEPARATE FILE, which is not aesthetic and was not the first attempt. Both surfaces
 * must consult the same predicate, and one of those surfaces is a page. The site targets Cloudflare
 * Workers, so every page module is bundled for the worker whether it prerenders or not, and the
 * first version of this change had src/pages/blog/category/[category].astro importing the module
 * that reads node:fs. The build failed outright: "Cannot bundle Node.js built in node:fs imported
 * from src/lib/seo/blogCategoryIndexing.mjs". Tree shaking does not save it, because the resolver
 * runs before it. So the file a page can import holds no file system at all.
 *
 * The split does NOT split the rule. shouldIndexCategory is defined exactly once, here. The page
 * imports it from this file, the sitemap filter imports it from the sibling that re-exports it, and
 * src/lib/compliance/blog-category-indexing-guard.test.ts asserts the two surfaces still agree in
 * the built output, which is the only place agreement can actually be checked.
 */

/**
 * The smallest number of published posts that earns a category page a place in the index and the
 * sitemap. Two, because a list of one is a worse copy of the single thing it lists.
 */
export const MIN_POSTS_FOR_CATEGORY_INDEX = 2;

/** The single predicate. The page's noindex and the sitemap filter both resolve to this call. */
export function shouldIndexCategory(publishedPostCount) {
  return publishedPostCount >= MIN_POSTS_FOR_CATEGORY_INDEX;
}

/**
 * "Buyer's Guides & How-To" to "buyers-guides-and-how-to".
 *
 * A byte for byte restatement of categoryToSlug() in src/lib/blog.ts, which cannot be imported by
 * the .mjs config because it is .ts and pulls in astro:content. The duplication is held in place by
 * an assertion rather than by good intentions: the guard compares the two function bodies and also
 * compares this rule's output against the directory names Astro really built.
 */
export function categorySlug(category) {
  return category
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
