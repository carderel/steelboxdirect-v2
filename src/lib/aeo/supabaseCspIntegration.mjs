/**
 * Build-time half of the CSP: see src/lib/aeo/securityHeaders.mjs. Kept in its own file because it
 * touches node:fs, and securityHeaders.mjs is pulled into the Cloudflare worker bundle through
 * markdownTwin.ts, where node built-ins cannot be bundled.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';
import { withSupabaseOrigin } from './securityHeaders.mjs';

/**
 * Astro integration: after the build, add the Supabase origin to dist/_headers when
 * PUBLIC_SUPABASE_URL is available (process env first, then the project .env via Vite's loadEnv).
 * Without it, the policy simply omits Supabase, which only affects /admin/.
 */
export function supabaseCspIntegration() {
  return {
    name: 'sbd-supabase-csp',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const url =
          process.env.PUBLIC_SUPABASE_URL ||
          loadEnv('production', process.cwd(), 'PUBLIC_').PUBLIC_SUPABASE_URL;
        const file = fileURLToPath(new URL('_headers', dir));
        let text;
        try {
          text = await readFile(file, 'utf-8');
        } catch {
          return;
        }
        const next = withSupabaseOrigin(text, url);
        if (next !== text) {
          await writeFile(file, next, 'utf-8');
          logger.info('CSP: added the Supabase origin to connect-src in dist/_headers');
        } else {
          logger.info('CSP: PUBLIC_SUPABASE_URL not set, Supabase origin omitted');
        }
      },
    },
  };
}
