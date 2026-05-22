import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';

export default defineConfig({
  output: 'hybrid',
  adapter: cloudflare(),
  site: 'https://steelboxdirect.com',
  integrations: [
    react(),
    sitemap({ filter: (page) => !page.includes('/admin/') }),
    partytown({ config: { forward: ['dataLayer.push'] } }),
  ],
});
