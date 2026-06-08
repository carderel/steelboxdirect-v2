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
    sitemap({ filter: (page) => !page.includes('/admin/') }),
  ],
});
