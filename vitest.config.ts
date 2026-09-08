import { defineConfig } from 'vitest/config';
import { routeLastmodIndexPlugin } from './src/lib/seo/sitemapLastmod.mjs';

export default defineConfig({
  // The same virtual module astro.config.mjs serves, so the schema builder under test resolves
  // WebPage dateModified from the real index rather than failing on an unknown import.
  plugins: [routeLastmodIndexPlugin()],
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
