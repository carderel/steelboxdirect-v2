import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

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
  },
  integrations: [
    react(),
    // Blog category pages are excluded while thin — many render zero posts and
    // the rest are still just templated one-liners over a post grid (see
    // .outputs/seo/2026-07-06-blog-seo-geo-audit.md). Category pages with posts
    // additionally get noindex in blog/category/[category].astro; this keeps
    // them out of the sitemap across the board so Google isn't fed empty/thin
    // URLs while the section is young. Revisit once categories fill out.
    sitemap({ filter: (page) => !page.includes('/admin/') && !page.includes('/blog/category/') }),
  ],
});
