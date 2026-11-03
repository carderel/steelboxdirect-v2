/**
 * PAGES.DEV HOST REDIRECT (added 2026-11-03, T-230).
 *
 * The Cloudflare Pages project host steelboxdirect-v2.pages.dev served the full production site as
 * a duplicate of steelboxdirect.com. Static pages get `X-Robots-Tag: noindex` there from the
 * generated public/_headers (see PAGES_DEV_NOINDEX_STANZAS in src/lib/aeo/markdownTwin.ts), but
 * Cloudflare does not apply `_headers` to worker responses, so the server rendered routes (/price/,
 * /api/*) need this instead: a 301 to the same path and query on the real domain.
 *
 * SCOPE, deliberately narrow:
 *   - Only the exact production pages.dev host. Branch preview hosts (main.steelboxdirect-v2...)
 *     sit behind Cloudflare Access and are how changes get checked before they go live, so they
 *     are left alone. steelboxdirect.com, localhost and the build-time prerender host never match.
 *   - Only GET and HEAD. A redirect cannot carry a POST body through a browser fetch to another
 *     origin, so redirecting a stray quote submission on the pages.dev host would lose the lead.
 *     Non-GET requests pass through untouched; nothing about them is indexable.
 *
 * The dashboard Bulk Redirect is the primary fix. This is the code-side backup.
 */
export const PAGES_DEV_HOST = 'steelboxdirect-v2.pages.dev';
export const CANONICAL_ORIGIN = 'https://steelboxdirect.com';

/** The redirect target for this request, or null when the request must be served as is. */
export function pagesDevRedirectTarget(url: URL, method: string): string | null {
  if (url.hostname.toLowerCase() !== PAGES_DEV_HOST) return null;
  const m = method.toUpperCase();
  if (m !== 'GET' && m !== 'HEAD') return null;
  return `${CANONICAL_ORIGIN}${url.pathname}${url.search}`;
}
