import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { serializeWithLastmod, routeLastmodIndexPlugin } from './src/lib/seo/sitemapLastmod.mjs';
import { sitemapAllowsCategoryUrl } from './src/lib/seo/blogCategoryIndexing.mjs';
import { permitCounties } from './src/data/permitCounties.ts';

/**
 * THE 77 RETIRED COUNTY PERMIT URLs (2026-09-16).
 *
 * /permits/{state}/{county}/ was 77 pages of 1,121 words each with 1,105 of those words in runs
 * identical to their neighbours, and the only fact that differed between any two of them was the
 * office name, its scope and its link. Those rows now live as anchored sections on the state page,
 * with each section keeping the exact slug its URL used to end in, and the old URLs 301 here.
 *
 * GENERATED, NOT TYPED. The list is built from src/data/permitCounties.ts, the same module the
 * sections on src/pages/permits/[state]/index.astro are built from, so a redirect cannot name a
 * jurisdiction the page does not carry and a jurisdiction cannot be added or removed without its
 * redirect following. Hand typing 77 lines would have made a second source of truth out of a
 * derived one, which is the failure that module's own header exists to prevent.
 *
 * THE KEY IS THE BARE FORM BECAUSE ASTRO ALLOWS NO OTHER. A trailing slash was tried here first
 * and Astro normalises it away: keying both '/permits/ohio/hamilton-county/' and the bare form
 * produced 154 lines in dist/_redirects that were 77 rules written twice, with the slash form
 * emitted nowhere. The pages shipped WITH a trailing slash and that is the form Google indexed, and
 * Cloudflare's _redirects matcher treats the two paths as different, which is the exact failure
 * that put the hand written slash variants of the four flat city URLs in public/_redirects. So the
 * 77 slash companions live there, beside them, generated from this same module and held to it by
 * src/lib/compliance/permit-county-guard.test.ts. Verified in dist/_redirects after a real build,
 * not assumed.
 *
 * THE DESTINATION CARRIES A FRAGMENT, and that was the open question going in. It survives Astro's
 * redirect handling and the adapter's _redirects writer intact, confirmed by reading dist/_redirects
 * rather than by reasoning about it. Google discards the fragment when it consolidates the signal,
 * so it is a courtesy to the human who clicks an old link rather than an SEO mechanism; if a future
 * Astro or adapter version starts mangling it, falling back to the bare '/permits/{state}/'
 * destination costs nothing that matters.
 */
const retiredCountyPermitRedirects = Object.fromEntries(
  // county.path is the retired URL and county.anchorPath is the section that replaced it. Both come
  // from the same derivation the page sections come from, so neither can name a jurisdiction the
  // page does not carry. The slash is stripped here rather than left for Astro to strip, so what is
  // written is what is emitted.
  permitCounties.map((county) => [county.path.replace(/\/$/, ''), county.anchorPath]),
);

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
  vite: {
    // Serves the sitemap's lastmod index into the page bundle as virtual:route-lastmod-index, so
    // the WebPage node's dateModified (src/lib/schema/buildPageSchema.ts) is resolved from the
    // exact data the serialize hook below uses for <lastmod>. The bundle cannot import the disk
    // reading half itself: this adapter refuses to bundle node:fs. See the 2026-09-08 section of
    // the header in src/lib/seo/sitemapLastmod.mjs.
    plugins: [routeLastmodIndexPlugin()],
  },
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
    // The 77 retired county permit URLs. Trailing slash companions: public/_redirects.
    ...retiredCountyPermitRedirects,
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
