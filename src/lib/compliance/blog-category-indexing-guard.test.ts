/**
 * BLOG CATEGORY INDEXING GUARD
 * ============================
 *
 * WHY THIS FILE EXISTS. Two surfaces decide whether a blog category URL is offered to Google: the
 * noindex tag on src/pages/blog/category/[category].astro and the sitemap filter in
 * astro.config.mjs. Before 2026-09-01 they were written separately and had drifted apart. The page
 * noindexed a category only when it rendered zero posts; the config excluded every category URL
 * with no condition at all. So the three populated categories shipped as indexable pages that the
 * sitemap deliberately withheld. That is not a crash, it is not a warning, and it is not visible in
 * Search Console either, because the failure is an absence. The opposite drift is visible and worse:
 * a URL submitted in the sitemap that also carries noindex comes back as "Submitted URL marked
 * noindex", an error logged against the property.
 *
 * WHAT THIS GUARD ACTUALLY ASSERTS, and why it is not the obvious thing. The obvious test reads
 * both source files and checks they call the same helper. That proves the wiring and nothing else:
 * a layout could swallow the noindex prop, the sitemap filter could be shadowed by an adapter
 * setting, a route could stop building. So the load bearing assertions here read the BUILT dist
 * output and compare the two artifacts against each other:
 *
 *   1. Every /blog/category/ URL in dist/sitemap-0.xml has a built page that carries no noindex.
 *   2. Every built category page that carries noindex is absent from the sitemap.
 *   3. /admin/ appears nowhere in the sitemap, still and always.
 *   4. All six category routes still build. This change is about indexing and never about deleting
 *      routes: the URLs stay stable, getStaticPaths() still emits one per fixed category, and a
 *      category that is quiet today keeps its address for when it fills up.
 *   5. The threshold constant is really consulted, category by category, against the post counts
 *      read from frontmatter. A predicate that always returned true would satisfy 1 and 2 by making
 *      the noindex set empty, and this is the assertion that fails it.
 *
 * WHY IT SKIPS RATHER THAN FAILS WITH NO dist. Every assertion above is a statement about a build
 * artifact, and a checkout that has not been built cannot answer it either way. The convention in
 * this directory is it.skipIf(!existsSync(built)), same as sitemap-lastmod-guard.test.ts, and the
 * source level assertions below still run everywhere with real teeth.
 *
 * WHEN THIS FAILS, the fix is to make the two surfaces agree by changing the one shared function in
 * src/lib/seo/blogCategoryIndexing.mjs, or to publish another post in the category. It is never to
 * hardcode a slug list into the config, which is the exact shape of the bug this replaced.
 */

import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  MIN_POSTS_FOR_CATEGORY_INDEX,
  categorySlug,
  indexableCategorySlugs,
  publishedPostCountsBySlug,
  shouldIndexCategory,
} from '../seo/blogCategoryIndexing.mjs';

const REPO_ROOT = import.meta.dirname
  ? join(import.meta.dirname, '..', '..', '..')
  : process.cwd();

const read = (rel: string) => readFileSync(join(REPO_ROOT, rel), 'utf8');

const SITEMAP = join(REPO_ROOT, 'dist/sitemap-0.xml');

/**
 * The category names, parsed out of src/content/config.ts rather than imported from it.
 *
 * That module imports astro:content, a virtual module that exists only inside an Astro build, so
 * importing it here (or importing src/lib/blog.ts, which imports it in turn) fails collection
 * outright under vitest. Reading the declaration as text costs one small parser and buys a guard
 * that runs in the plain test process, which is where it has to run to be useful.
 */
function declaredCategories(): string[] {
  const src = read('src/content/config.ts');
  const block = /BLOG_CATEGORIES\s*=\s*\[([\s\S]*?)\]\s*as const/.exec(src);
  if (!block) throw new Error('BLOG_CATEGORIES declaration not found in src/content/config.ts');
  return [...block[1].matchAll(/(['"])(.*?)\1/g)].map((m) => m[2]);
}

const CATEGORIES = declaredCategories();

/** All six routes, named the way the route itself names them. */
const ALL_SLUGS = CATEGORIES.map((c) => categorySlug(c)).sort();

const builtPage = (slug: string) => join(REPO_ROOT, 'dist/blog/category', slug, 'index.html');

const allPagesBuilt = () => ALL_SLUGS.every((s) => existsSync(builtPage(s)));

/**
 * The robots meta BaseLayout emits. Checked as a tag rather than as a loose substring so a future
 * page that merely discusses indexing in its copy is not mistaken for a noindexed one. Assertion 1
 * additionally holds sitemapped pages to the stricter substring rule.
 */
const hasNoindexTag = (html: string) =>
  /<meta[^>]+name=["']robots["'][^>]*noindex/i.test(html);

/** Category slugs listed in the built sitemap, deduplicated and sorted. */
function sitemappedCategorySlugs(): string[] {
  const xml = readFileSync(SITEMAP, 'utf8');
  const hits = [...xml.matchAll(/\/blog\/category\/([a-z0-9-]+)\/?</g)].map((m) => m[1]);
  return [...new Set(hits)].sort();
}

describe('blog category indexing: one rule, read by both surfaces', () => {
  it('keeps the threshold above one, because a one post category page is a near duplicate', () => {
    expect(MIN_POSTS_FOR_CATEGORY_INDEX).toBeGreaterThanOrEqual(2);
  });

  it('is a threshold and not a truthiness check', () => {
    expect(shouldIndexCategory(0)).toBe(false);
    expect(shouldIndexCategory(MIN_POSTS_FOR_CATEGORY_INDEX - 1)).toBe(false);
    expect(shouldIndexCategory(MIN_POSTS_FOR_CATEGORY_INDEX)).toBe(true);
    expect(shouldIndexCategory(MIN_POSTS_FOR_CATEGORY_INDEX + 1)).toBe(true);
  });

  it('carries the same slug transform as categoryToSlug in src/lib/blog.ts', () => {
    // categoryToSlug cannot be imported here (see declaredCategories above), so the two bodies are
    // compared as normalized text. The stronger check, that the mjs rule reproduces the slugs Astro
    // actually built from the real categoryToSlug, is the dist directory assertion further down.
    const body = (src: string, fn: string) => {
      const hit = new RegExp(`function ${fn}\\([^)]*\\)[^{]*\\{([\\s\\S]*?)\\n\\}`).exec(src);
      expect(hit, `${fn} body not found`).not.toBeNull();
      return hit![1].replace(/\s+/g, ' ').trim();
    };
    expect(body(read('src/lib/seo/blogCategoryIndexRule.mjs'), 'categorySlug')).toBe(
      body(read('src/lib/blog.ts'), 'categoryToSlug'),
    );
  });

  it('never counts a draft post toward the threshold', () => {
    const counts = publishedPostCountsBySlug();
    const total = [...counts.values()].reduce((a, b) => a + b, 0);
    const files = readdirSync(join(REPO_ROOT, 'src/content/blog')).filter((f) => /\.mdx?$/.test(f));
    const drafts = files.filter((f) =>
      /^draft:\s*true\s*$/m.test(read(`src/content/blog/${f}`).split('---')[1] ?? ''),
    );
    expect(files.length).toBeGreaterThan(0);
    expect(drafts.length, 'the draft fixtures this assertion needs are gone').toBeGreaterThan(0);
    expect(total).toBe(files.length - drafts.length);
    // Every counted slug is one of the six real categories, so a stray or misspelled category in
    // frontmatter can never quietly create a seventh entry that nothing renders.
    for (const slug of counts.keys()) expect(ALL_SLUGS).toContain(slug);
  });

  it('reports a stable, sorted allow list drawn from those counts', () => {
    const counts = publishedPostCountsBySlug();
    const expected = ALL_SLUGS.filter((s) => shouldIndexCategory(counts.get(s) ?? 0));
    expect(indexableCategorySlugs()).toEqual(expected);
  });
});

describe('blog category indexing: the source still delegates the decision', () => {
  it('keeps the file system out of the module a page is allowed to import', () => {
    const rule = read('src/lib/seo/blogCategoryIndexRule.mjs');
    expect(rule, 'node:fs in the rule module breaks the Cloudflare worker bundle').not.toMatch(
      /from 'node:/,
    );
    expect(rule).toMatch(/export function shouldIndexCategory/);
    // And the reader really re-exports rather than redefining, so there is one predicate.
    const reader = read('src/lib/seo/blogCategoryIndexing.mjs');
    expect(reader).toMatch(/from '\.\/blogCategoryIndexRule\.mjs'/);
    expect(reader, 'shouldIndexCategory is defined twice').not.toMatch(
      /export function shouldIndexCategory/,
    );
  });

  it('the page computes noindex from the shared predicate, not from a bare length check', () => {
    const page = read('src/pages/blog/category/[category].astro');
    // The page imports the pure sibling, never the file system reader: see the header of
    // src/lib/seo/blogCategoryIndexRule.mjs for why that boundary exists and what breaks without it.
    expect(page).toMatch(/from '\.\.\/\.\.\/\.\.\/lib\/seo\/blogCategoryIndexRule\.mjs'/);
    expect(page, 'the page must not pull node:fs into the worker bundle').not.toMatch(
      /blogCategoryIndexing\.mjs/,
    );
    expect(page).toMatch(/noindex=\{!shouldIndexCategory\(posts\.length\)\}/);
    expect(page, 'the old zero post rule is back on the page').not.toMatch(
      /noindex=\{posts\.length === 0\}/,
    );
  });

  it('the sitemap filter asks the same module rather than listing slugs inline', () => {
    const config = read('astro.config.mjs');
    expect(config).toMatch(/sitemapAllowsCategoryUrl\(page\)/);
    for (const slug of ALL_SLUGS) {
      expect(config, `${slug} is hardcoded in the config`).not.toContain(slug);
    }
  });

  it('still builds one route per fixed category, so no URL is ever dropped', () => {
    const page = read('src/pages/blog/category/[category].astro');
    expect(page).toMatch(/BLOG_CATEGORIES\.map/);
    expect(CATEGORIES.length).toBe(6);
    expect(new Set(ALL_SLUGS).size).toBe(6);
  });
});

describe('blog category indexing: the built artifacts agree', () => {
  it.skipIf(!existsSync(join(REPO_ROOT, 'dist/blog/category')))(
    'builds all six category pages, and exactly those six',
    () => {
      for (const slug of ALL_SLUGS) {
        expect(
          existsSync(builtPage(slug)),
          `dist/blog/category/${slug}/index.html is missing`,
        ).toBe(true);
      }
      // The built directory names come from the real categoryToSlug, so this is also the proof
      // that the slug rule restated in blogCategoryIndexing.mjs produces the same strings.
      expect(readdirSync(join(REPO_ROOT, 'dist/blog/category')).sort()).toEqual(ALL_SLUGS);
    },
  );

  it.skipIf(!existsSync(SITEMAP))('advertises no /admin/ URL', () => {
    expect(readFileSync(SITEMAP, 'utf8')).not.toContain('/admin/');
  });

  it.skipIf(!existsSync(SITEMAP) || !allPagesBuilt())(
    'every sitemapped category page is free of noindex',
    () => {
      const listed = sitemappedCategorySlugs();
      expect(listed.length).toBeGreaterThan(0);
      for (const slug of listed) {
        const html = readFileSync(builtPage(slug), 'utf8');
        expect(hasNoindexTag(html), `${slug} is in the sitemap AND carries a noindex tag`).toBe(
          false,
        );
        expect(
          html.includes('noindex'),
          `${slug} is in the sitemap and the word noindex appears in its HTML`,
        ).toBe(false);
      }
    },
  );

  it.skipIf(!existsSync(SITEMAP) || !allPagesBuilt())(
    'every noindexed category page is absent from the sitemap',
    () => {
      const listed = sitemappedCategorySlugs();
      const noindexed = ALL_SLUGS.filter((s) => hasNoindexTag(readFileSync(builtPage(s), 'utf8')));
      for (const slug of noindexed) {
        expect(listed, `${slug} is noindexed AND submitted in the sitemap`).not.toContain(slug);
      }
      expect([...listed, ...noindexed].sort()).toEqual(ALL_SLUGS);
    },
  );

  it.skipIf(!allPagesBuilt())('applies the threshold category by category', () => {
    const counts = publishedPostCountsBySlug();
    for (const slug of ALL_SLUGS) {
      const count = counts.get(slug) ?? 0;
      const html = readFileSync(builtPage(slug), 'utf8');
      expect(
        hasNoindexTag(html),
        `${slug} has ${count} published post(s) and the threshold is ` +
          `${MIN_POSTS_FOR_CATEGORY_INDEX}, so noindex should be ${!shouldIndexCategory(count)}`,
      ).toBe(!shouldIndexCategory(count));
    }
  });

  it.skipIf(!existsSync(SITEMAP))('lists exactly the allowed categories and nothing else', () => {
    expect(sitemappedCategorySlugs()).toEqual(indexableCategorySlugs());
  });
});
