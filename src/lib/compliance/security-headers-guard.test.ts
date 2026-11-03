/**
 * SECURITY HEADERS GUARD (2026-10-06)
 *
 * Holds the `/*` security stanza of the generated public/_headers in place, and the build-time
 * Supabase step honest. Spec and origin inventory: src/lib/aeo/securityHeaders.mjs.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  buildCsp,
  supabaseOrigins,
  withSupabaseOrigin,
  CSP_HEADER_NAME,
} from '../aeo/securityHeaders.mjs';

const REPO_ROOT = import.meta.dirname
  ? join(import.meta.dirname, '..', '..', '..')
  : process.cwd();
const headers = readFileSync(join(REPO_ROOT, 'public/_headers'), 'utf-8');

describe('security headers: public/_headers', () => {
  it('opens with a /* stanza carrying the four security headers', () => {
    const stanza = headers.split('\n/*\n')[1]?.split('\n/')[0] ?? '';
    expect(stanza).toContain(`${CSP_HEADER_NAME}: ${buildCsp()}`);
    expect(stanza).toContain('X-XSS-Protection: 0');
    expect(stanza).toContain('Cross-Origin-Opener-Policy: same-origin');
    expect(stanza).toMatch(/Permissions-Policy: camera=\(\), microphone=\(\)/);
  });

  it('enforces the CSP (promoted from Report-Only after a clean live sweep, 2026-10-06)', () => {
    expect(CSP_HEADER_NAME).toBe('Content-Security-Policy');
    expect(headers).not.toMatch(/Content-Security-Policy-Report-Only/);
  });

  it('never sends COEP (breaks YouTube, OpenStreetMap and GTM iframes)', () => {
    expect(headers).not.toMatch(/Cross-Origin-Embedder-Policy/i);
  });

  it('allowlists every third-party origin the built pages load', () => {
    const csp = buildCsp();
    for (const origin of [
      'https://www.googletagmanager.com',
      'https://static.cloudflareinsights.com',
      'https://cloudflareinsights.com',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://www.youtube.com',
      'https://www.openstreetmap.org',
    ]) {
      expect(csp, origin).toContain(origin);
    }
  });

  it('allows the two origins the 2026-10-06 live sweep reported (exact tokens, per directive)', () => {
    const directive = (name: string) =>
      (buildCsp().split('; ').find((d) => d.startsWith(`${name} `)) ?? '').split(' ');
    // Bare domain: *.analytics.google.com does not match analytics.google.com itself.
    expect(directive('connect-src')).toContain('https://analytics.google.com');
    // Pinterest tag loads /static/ct/token_create.js from ct.pinterest.com.
    expect(directive('script-src')).toContain('https://ct.pinterest.com');
  });

  it('does not restrict features YouTube and the 3D viewer use', () => {
    const pp = headers.match(/Permissions-Policy: (.*)/)?.[1] ?? '';
    for (const f of ['fullscreen', 'autoplay', 'encrypted-media', 'picture-in-picture', 'web-share']) {
      expect(pp, f).not.toContain(f);
    }
  });

  it('commits no Supabase origin (it is added to dist/_headers at build time)', () => {
    expect(headers).not.toMatch(/supabase/i);
  });
});

/**
 * PAGES.DEV NOINDEX (2026-11-03, T-230). The Pages project host served the full site as a
 * duplicate of steelboxdirect.com. These assertions hold the documented host rules in place and
 * make sure no noindex can ever reach the real domain. Spec: PAGES_DEV_NOINDEX_STANZAS in
 * src/lib/aeo/markdownTwin.ts. Do not relax them.
 */
describe('security headers: pages.dev hosts are noindex, steelboxdirect.com never is', () => {
  /** Parse public/_headers into [pattern, header lines] rules (comments and blanks dropped). */
  const rules: Array<[string, string[]]> = [];
  for (const line of headers.split('\n')) {
    if (line.trim() === '' || line.trimStart().startsWith('#')) continue;
    if (/^\s/.test(line)) rules[rules.length - 1]?.[1].push(line.trim());
    else rules.push([line.trim(), []]);
  }
  const rule = (pattern: string) => rules.find(([p]) => p === pattern)?.[1] ?? [];

  it('sends X-Robots-Tag: noindex on every path of the production pages.dev host', () => {
    expect(rule('https://:project.pages.dev/*')).toContain('X-Robots-Tag: noindex');
  });

  it('sends X-Robots-Tag: noindex on every path of branch and preview pages.dev hosts', () => {
    expect(rule('https://:version.:project.pages.dev/*')).toContain('X-Robots-Tag: noindex');
  });

  it('keeps the four security headers on /* so the pages.dev host inherits them too', () => {
    expect(rule('/*').some((h) => h.startsWith(`${CSP_HEADER_NAME}: `))).toBe(true);
  });

  it('carries no noindex on any rule that can match steelboxdirect.com', () => {
    // Every rule that is not scoped to a pages.dev host applies to the real domain: path-only
    // rules match every host, and any absolute rule naming steelboxdirect.com obviously does.
    const reachesRealDomain = rules.filter(
      ([p]) => !/^https:\/\/[^/]*\.pages\.dev\//.test(p) || /steelboxdirect\.com/i.test(p),
    );
    expect(reachesRealDomain.length).toBeGreaterThan(0);
    for (const [pattern, lines] of reachesRealDomain) {
      expect(lines.join('\n'), pattern).not.toMatch(/noindex/i);
    }
  });

  it('names no absolute rule for steelboxdirect.com at all', () => {
    expect(rules.filter(([p]) => /steelboxdirect\.com/i.test(p))).toEqual([]);
  });

  it('stays under the Cloudflare Pages limit of 100 header rules', () => {
    expect(rules.length).toBeLessThanOrEqual(100);
  });
});

describe('security headers: build-time Supabase origin', () => {
  it('derives https and wss origins and drops path and query', () => {
    expect(supabaseOrigins('https://abc.supabase.co/rest/v1?x=1')).toEqual([
      'https://abc.supabase.co',
      'wss://abc.supabase.co',
    ]);
  });

  it('omits it when the variable is missing or not https', () => {
    expect(supabaseOrigins(undefined)).toEqual([]);
    expect(supabaseOrigins('')).toEqual([]);
    expect(supabaseOrigins('not a url')).toEqual([]);
    expect(supabaseOrigins('http://abc.supabase.co')).toEqual([]);
    expect(withSupabaseOrigin(headers, undefined)).toBe(headers);
  });

  it('appends to connect-src only', () => {
    const out = withSupabaseOrigin(headers, 'https://abc.supabase.co');
    const csp = out.match(/Content-Security-Policy: (.*)/)?.[1] ?? '';
    const connect = csp.split('; ').find((d: string) => d.startsWith('connect-src')) ?? '';
    expect(connect.endsWith('https://abc.supabase.co wss://abc.supabase.co')).toBe(true);
    expect(csp.match(/supabase/g)?.length).toBe(2);
  });
});
