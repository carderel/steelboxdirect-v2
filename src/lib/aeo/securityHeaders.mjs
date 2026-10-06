/**
 * SECURITY RESPONSE HEADERS for the generated Cloudflare `_headers` file (added 2026-10-06).
 *
 * Spec: UDO Project/.outputs/research/2026-10-06-seo-report2-audit.md (REAL-FIX rows for CSP,
 * X-XSS-Protection, COOP and Permissions-Policy). Plain .mjs, not .ts, so `astro.config.mjs` (via
 * `./supabaseCspIntegration.mjs`) can import it without a TypeScript loader. This module must stay
 * free of node: imports, because markdownTwin.ts is bundled into the Cloudflare worker.
 * `renderHeadersFile()` in `src/lib/aeo/markdownTwin.ts` emits these on `/*`.
 *
 * WHY REPORT-ONLY. A Content-Security-Policy can break a live page in ways a green build never
 * sees: the GTM container loads Microsoft Clarity and the Pinterest tag at runtime, and neither
 * appears anywhere in this repository. Report-Only logs every violation in the browser console and
 * blocks nothing. Promote the header name to `Content-Security-Policy` only after a browser pass on
 * the live site shows a clean console. After enforcement, any NEW tag added in GTM that loads a new
 * origin is blocked until it is added here.
 *
 * ORIGINS, verified 2026-10-06 against dist/ and the live GTM container (GTM-K4T6CHW8):
 *   - www.googletagmanager.com: GTM script + noscript iframe; GA4 (G-WXQQVQWWH7) beacons to
 *     *.google-analytics.com / *.analytics.google.com, Google signals to *.g.doubleclick.net and
 *     www.google.com.
 *   - static.cloudflareinsights.com (beacon script) and cloudflareinsights.com (RUM POST), see the
 *     Cloudflare Web Analytics block at the bottom of src/layouts/BaseLayout.astro.
 *   - fonts.googleapis.com (stylesheet) and fonts.gstatic.com (font files).
 *   - www.youtube.com and www.openstreetmap.org iframes (video embed, city maps). youtube-nocookie
 *     is kept from the audit draft so switching the embed host later does not need a CSP change.
 *   - Microsoft Clarity (custom HTML tag in GTM): script from www.clarity.ms then
 *     scripts.clarity.ms, collect beacons to *.clarity.ms, a pixel from c.bing.com.
 *   - Pinterest tag (__pntr in GTM): script from s.pinimg.com, events to ct.pinterest.com.
 *   - Supabase: browser-side on /admin/ only, added at BUILD time by `withSupabaseOrigin()`.
 *
 * 'unsafe-inline' is unavoidable on script-src (inline GTM snippet, the font-preload onload
 * handler on every page, the inline import map in public/3d/embed-*.html), so the value of this
 * policy is the origin allowlist plus frame-ancestors, object-src and base-uri.
 *
 * DELIBERATELY ABSENT
 *   - Cross-Origin-Embedder-Policy: breaks the YouTube, OpenStreetMap and GTM iframes, and the site
 *     has no need for cross-origin isolation.
 *   - Strict-Transport-Security: set at the Cloudflare edge (zone setting), not in this file. Live
 *     value on 2026-10-06 was max-age=2592000. Change it there, not here.
 *   - Permissions-Policy entries for fullscreen, autoplay, encrypted-media, picture-in-picture,
 *     accelerometer, gyroscope, clipboard-write and web-share: YouTube and the 3D viewer use them.
 */

/** Placeholder-free CSP directives. Order is the emitted order. */
export const CSP_DIRECTIVES = [
  ['default-src', ["'self'"]],
  [
    'script-src',
    [
      "'self'",
      "'unsafe-inline'",
      'https://www.googletagmanager.com',
      'https://static.cloudflareinsights.com',
      'https://www.clarity.ms',
      'https://scripts.clarity.ms',
      'https://s.pinimg.com',
    ],
  ],
  ['style-src', ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com']],
  ['font-src', ["'self'", 'data:', 'https://fonts.gstatic.com']],
  [
    'img-src',
    [
      "'self'",
      'data:',
      'blob:',
      'https://*.google-analytics.com',
      'https://*.googletagmanager.com',
      'https://*.g.doubleclick.net',
      'https://www.google.com',
      'https://*.clarity.ms',
      'https://c.bing.com',
      'https://ct.pinterest.com',
    ],
  ],
  [
    'connect-src',
    [
      "'self'",
      'https://*.google-analytics.com',
      'https://*.analytics.google.com',
      'https://*.googletagmanager.com',
      'https://*.g.doubleclick.net',
      'https://www.google.com',
      'https://cloudflareinsights.com',
      'https://*.clarity.ms',
      'https://ct.pinterest.com',
    ],
  ],
  [
    'frame-src',
    [
      "'self'",
      'https://www.googletagmanager.com',
      'https://www.youtube.com',
      'https://www.youtube-nocookie.com',
      'https://www.openstreetmap.org',
      'https://ct.pinterest.com',
    ],
  ],
  ['frame-ancestors', ["'self'"]],
  ['base-uri', ["'self'"]],
  ['form-action', ["'self'"]],
  ['object-src', ["'none'"]],
];

export const CSP_HEADER_NAME = 'Content-Security-Policy-Report-Only';

export const PERMISSIONS_POLICY =
  'camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), hid=(), bluetooth=(), midi=(), display-capture=()';

/** The CSP value, with no Supabase origin. This is what the committed public/_headers carries. */
export function buildCsp() {
  return CSP_DIRECTIVES.map(([name, sources]) => `${name} ${sources.join(' ')}`).join('; ');
}

/** Header lines for the `/*` stanza, already indented for the _headers format. */
export function securityHeaderLines() {
  return [
    `  ${CSP_HEADER_NAME}: ${buildCsp()}`,
    '  X-XSS-Protection: 0',
    '  Cross-Origin-Opener-Policy: same-origin',
    `  Permissions-Policy: ${PERMISSIONS_POLICY}`,
  ];
}

/**
 * `https://x.supabase.co` and `wss://x.supabase.co` from a PUBLIC_SUPABASE_URL, or [] when the
 * value is missing or unparseable. Only the origin is used; a path or key never reaches the header.
 */
export function supabaseOrigins(url) {
  if (!url) return [];
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return [];
  }
  if (parsed.protocol !== 'https:') return [];
  return [`https://${parsed.host}`, `wss://${parsed.host}`];
}

/**
 * Adds the Supabase origins to connect-src in a rendered _headers file. Run at build time on
 * dist/_headers by `supabaseCspIntegration()` in `./supabaseCspIntegration.mjs`, so the committed public/_headers stays independent of
 * the environment (CI runs the drift guard with no Supabase variables set). No URL, no change.
 */
export function withSupabaseOrigin(headersText, url) {
  const origins = supabaseOrigins(url);
  if (origins.length === 0) return headersText;
  return headersText.replace(/(connect-src [^;\n]*)/, `$1 ${origins.join(' ')}`);
}
