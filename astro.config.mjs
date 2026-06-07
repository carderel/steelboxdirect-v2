import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';

export default defineConfig({
  output: 'hybrid',
  adapter: cloudflare({
    routes: {
      extend: {
        exclude: [
          { pattern: '/sitemap-index.xml' },
          { pattern: '/sitemap-0.xml' },
          { pattern: '/~partytown/*' },
        ],
      },
    },
  }),
  site: 'https://steelboxdirect.com',
  redirects: {
    '/admin': '/admin/login',
  },
  integrations: [
    react(),
    sitemap({ filter: (page) => !page.includes('/admin/') }),
    partytown({ config: { forward: ['dataLayer.push'] } }),
  ],
});
