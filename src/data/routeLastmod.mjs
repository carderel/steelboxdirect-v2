// src/data/routeLastmod.mjs
// GENERATED FILE. Do not hand edit. Written in full by scripts/generate-route-lastmod.mjs, which
// walks this repository's git history. A hand edit here is lost on the next run, and a hand edit
// that happens to survive is worse than one that is lost, because it publishes a freshness date
// that no commit ever supported.
//
// WHAT THIS FILE HOLDS. One entry per route producing source module, mapping the repo relative
// path of that module to the ISO date of the last commit that touched it. That is the fact the
// sitemap turns into <lastmod>. It is keyed by source file rather than by URL because the fact is
// about the file: fourteen city URLs come from one [city].astro and share one date, and a new city
// therefore needs no regeneration to inherit a correct one.
//
// WHY IT IS COMMITTED RATHER THAN COMPUTED AT BUILD TIME. Cloudflare Pages clones shallow, and a
// shallow clone answers "when did this file last change" wrongly rather than not at all: every
// answer collapses toward the deploy date. The build used to run git itself and, on detecting the
// shallow clone, correctly refused to state anything, which shipped 8 dates out of 54 URLs in
// production against 52 out of 52 locally. Deriving the dates where the history exists and reading
// them here as data fixes that without softening the refusal. Full reasoning: the headers of
// scripts/generate-route-lastmod.mjs and src/lib/seo/sitemapLastmod.mjs.
//
// A ROUTE ABSENT FROM THIS TABLE SHIPS WITHOUT A lastmod. That is a supported outcome and it is not
// a bug to paper over. Omission is honest, invention is not, and a sitemap whose dates are trusted
// on the entries that carry them is worth more than one where every entry carries a guess.
//
// KEEPING IT CURRENT. Run npm run generate:route-lastmod after editing a page. The freshness guard
// at src/lib/compliance/route-lastmod-freshness-guard.test.ts fails the test suite when a recorded
// date is older than the file it describes, so this table cannot rot in silence.
//
// No em dash and no en dash may appear in this file. The build time dash guard scans it.

/** Shape version, matching SCHEMA_VERSION in the generator. */
export const SCHEMA_VERSION = 1;

/** Repo relative source module path to ISO date of its last commit. Sorted by path. */
export const routeLastmod = {
  'src/content/blog/12-things-never-store-in-a-shipping-container.md': '2026-08-20T15:56:43-04:00',
  'src/content/blog/99-dollar-down-rent-to-own.md': '2026-08-31T13:48:55-04:00',
  'src/content/blog/check-used-container-identity-free-bic-lookups.md': '2026-09-02T15:11:22-04:00',
  'src/content/blog/contractor-who-stopped-losing-tools.md': '2026-08-28T14:41:04-04:00',
  'src/content/blog/get-a-used-shipping-container-certified.md': '2026-08-25T13:21:46-04:00',
  'src/content/blog/how-to-read-container-id-number-iso-6346.md': '2026-08-20T15:56:43-04:00',
  'src/content/blog/sample-choosing-container-size.md': '2026-08-20T15:56:43-04:00',
  'src/content/blog/sample-container-vs-pole-barn.md': '2026-08-20T15:56:43-04:00',
  'src/content/blog/shipping-container-dimensions-size-chart.md': '2026-08-25T00:12:45-04:00',
  'src/content/blog/the-cheap-container-that-wasnt.md': '2026-08-28T14:41:04-04:00',
  'src/content/blog/why-does-my-container-rain-inside-condensation.md': '2026-08-20T15:56:43-04:00',
  'src/content/blog/wind-and-water-tight-explained.md': '2026-08-20T15:56:43-04:00',
  'src/pages/404.astro': '2026-08-24T15:22:53-04:00',
  'src/pages/about/index.astro': '2026-09-02T15:12:02-04:00',
  'src/pages/admin/dashboard.astro': '2026-06-02T14:19:34-04:00',
  'src/pages/admin/login.astro': '2026-08-24T15:22:53-04:00',
  'src/pages/admin/reset.astro': '2026-08-24T15:22:53-04:00',
  'src/pages/ai-info/index.astro': '2026-08-31T13:45:44-04:00',
  'src/pages/blog/[...slug].astro': '2026-08-20T15:56:43-04:00',
  'src/pages/blog/category/[category].astro': '2026-09-01T16:34:38-04:00',
  'src/pages/blog/index.astro': '2026-08-20T15:56:43-04:00',
  'src/pages/condition/index.astro': '2026-08-25T13:21:46-04:00',
  'src/pages/conex-boxes-for-sale/index.astro': '2026-08-25T13:21:46-04:00',
  'src/pages/contact/index.astro': '2026-09-02T15:12:02-04:00',
  'src/pages/container-buying-guide/index.astro': '2026-08-24T15:22:53-04:00',
  'src/pages/container-certification-guide/index.astro': '2026-08-25T13:21:46-04:00',
  'src/pages/container-reference/index.astro': '2026-08-24T15:22:53-04:00',
  'src/pages/container-rent-vs-buy-calculator/index.astro': '2026-08-31T13:45:44-04:00',
  'src/pages/container-rental-guide/index.astro': '2026-08-24T15:22:53-04:00',
  'src/pages/cost/index.astro': '2026-08-31T13:45:44-04:00',
  'src/pages/delivery/index.astro': '2026-08-28T14:40:49-04:00',
  'src/pages/find-a-container-inspector/index.astro': '2026-08-25T13:21:46-04:00',
  'src/pages/for/businesses/index.astro': '2026-08-31T13:45:44-04:00',
  'src/pages/for/contractors/index.astro': '2026-08-28T14:41:04-04:00',
  'src/pages/for/farmers/index.astro': '2026-08-24T15:22:53-04:00',
  'src/pages/for/homeowners/index.astro': '2026-08-31T13:45:44-04:00',
  'src/pages/index.astro': '2026-08-20T15:56:43-04:00',
  'src/pages/iso-6346-check-digit-calculator/index.astro': '2026-09-02T15:12:02-04:00',
  'src/pages/locations/[state]/[citySlug].astro': '2026-08-31T13:36:49-04:00',
  'src/pages/locations/index.astro': '2026-08-24T15:22:53-04:00',
  'src/pages/permits/index.astro': '2026-08-24T23:25:37-04:00',
  'src/pages/portable-storage-vs-buying-a-container/index.astro': '2026-08-24T17:42:28-04:00',
  'src/pages/privacy.astro': '2026-08-28T15:53:06-04:00',
  'src/pages/quote/index.astro': '2026-08-24T15:22:53-04:00',
  'src/pages/rent-to-own/index.astro': '2026-08-31T13:39:19-04:00',
  'src/pages/shipping-container-guides/index.astro': '2026-09-02T15:12:02-04:00',
  'src/pages/shipping-containers-for-sale/[slug].astro': '2026-08-31T13:42:42-04:00',
  'src/pages/shipping-containers-for-sale/index.astro': '2026-08-25T13:21:46-04:00',
  'src/pages/size/calculator.astro': '2026-08-24T15:22:53-04:00',
  'src/pages/size/index.astro': '2026-08-25T15:52:34-04:00',
  'src/pages/terms.astro': '2026-08-28T15:53:06-04:00',
};

export default routeLastmod;
