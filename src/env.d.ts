/// <reference path="../.astro/types.d.ts" />

/**
 * Served by routeLastmodIndexPlugin in src/lib/seo/sitemapLastmod.mjs, registered in
 * astro.config.mjs and vitest.config.ts. It is the index the sitemap resolves <lastmod> from,
 * handed into the page bundle so src/lib/schema/buildPageSchema.ts can give the WebPage node the
 * same date. Shape and resolver: src/lib/seo/lastmodResolve.mjs.
 */
declare module 'virtual:route-lastmod-index' {
  const index: {
    commits: Record<string, string>;
    posts: Record<string, string>;
    pageFiles: string[];
  };
  export default index;
}
