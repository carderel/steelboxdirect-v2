import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { serializeWithLastmod } from './src/lib/seo/sitemapLastmod.mjs';
import { sitemapAllowsCategoryUrl } from './src/lib/seo/blogCategoryIndexing.mjs';

export default defineConfig({
  output: 'hybrid',
  adapter: cloudflare({
    routes: {
      extend: {
        exclude: [
          { pattern: '/sitemap-index.xml' },
          { pattern: '/sitemap-0.xml' },
        ],
      },
    },
  }),
  site: 'https://steelboxdirect.com',
  redirects: {
    '/admin': '/admin/login',
    '/shipping-containers-for-sale/40-foot-one-trip-container': '/shipping-containers-for-sale/40-foot-high-cube-container',
    // City pages moved under /locations/{state}/ (2026-07-31). The Cloudflare
    // adapter emits these into dist/_redirects as real HTTP 301s (same
    // mechanism as the proven 40ft slug redirect above).
    '/cincinnati-shipping-containers': '/locations/ohio/cincinnati-shipping-containers',
    '/dayton-shipping-containers': '/locations/ohio/dayton-shipping-containers',
    '/indianapolis-shipping-containers': '/locations/indiana/indianapolis-shipping-containers',
    '/louisville-shipping-containers': '/locations/kentucky/louisville-shipping-containers',
  },
  integrations: [
    react(),
    // Blog category pages were excluded across the board from 2026-07-06, when every one of
    // them was thin and several rendered zero posts (see
    // .outputs/seo/2026-07-06-blog-seo-geo-audit.md). Three of the six have since filled out,
    // and a blanket exclusion left those three indexable on the page and withheld from the
    // sitemap at the same time, which is one decision written down twice and disagreeing with
    // itself. The rule now lives in one place, src/lib/seo/blogCategoryIndexing.mjs: a category
    // is offered here only when it clears the published post threshold, and
    // blog/category/[category].astro sets noindex from that same function. A category that
    // fills up later crosses over on its own. See that module's header for why the threshold is
    // two posts and not one, and src/lib/compliance/blog-category-indexing-guard.test.ts for the
    // assertion that the two surfaces still agree in the built output.
    //
    // serialize adds <lastmod>, which until 2026-08-28 no entry carried. lastmod is the field
    // Google's scheduler reads to decide a recrawl is worth doing, and /delivery/ plus
    // /container-buying-guide/ were both sitting at "Discovered, currently not indexed" with last
    // crawled = never. The dates are derived, never generated: blog posts use their own
    // frontmatter, other routes use the last commit that touched the page module, and any URL
    // whose date cannot be established truthfully ships bare exactly as it did before. Stamping
    // every URL with the build time would have been one line and would have been a lie about 51
    // of 52 pages, which is the failure the fabricated-dates guard exists to prevent. The full
    // reasoning, including why imported layouts and data modules are deliberately excluded and
    // what happens in a shallow clone, is in the header of src/lib/seo/sitemapLastmod.mjs, and
    // src/lib/compliance/sitemap-lastmod-guard.test.ts holds both halves in place.
    //
    // changefreq and priority stay off. Google has said publicly it ignores both, and unlike
    // lastmod neither can be derived from anything this repository actually knows.
    sitemap({
      filter: (page) => {
        // /admin/ is Disallowed in robots.txt and is never advertised, under any condition.
        if (page.includes('/admin/')) return false;
        if (page.includes('/blog/category/')) return sitemapAllowsCategoryUrl(page);
        return true;
      },
      serialize: serializeWithLastmod,
    }),
  ],
});
