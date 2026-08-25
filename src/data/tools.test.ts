import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tools, toolCount } from './tools';
import { guides, guideCount, guideListItems } from './guides';

const REPO_ROOT = import.meta.dirname
  ? join(import.meta.dirname, '..', '..')
  : process.cwd();

const SOURCE = readFileSync(join(REPO_ROOT, 'src/data/tools.ts'), 'utf8');

describe('tools catalogue', () => {
  it('holds two tools with unique ids, codes and urls', () => {
    expect(tools).toHaveLength(2);
    expect(new Set(tools.map((t) => t.id)).size).toBe(2);
    expect(new Set(tools.map((t) => t.code)).size).toBe(2);
    expect(new Set(tools.map((t) => t.url)).size).toBe(2);
  });

  it('derives the count rather than hardcoding it', () => {
    expect(toolCount).toBe(tools.length);
  });

  it('NO STRIP 404s: every tool url resolves to a real page file on disk', () => {
    for (const t of tools) {
      const seg = t.url.replace(/^\/|\/$/g, '');
      const candidates = [
        join(REPO_ROOT, 'src/pages', seg, 'index.astro'),
        join(REPO_ROOT, 'src/pages', `${seg}.astro`),
      ];
      expect(
        candidates.some(existsSync),
        `${t.id} points at ${t.url}, which has no page file. A strip card pointing at a 404 is `
        + 'worse than a shorter strip: ship the page first, then add the entry.',
      ).toBe(true);
    }
  });

  it('every url is root-relative with a trailing slash', () => {
    for (const t of tools) {
      expect(t.url.startsWith('/'), `${t.id} url must start with /`).toBe(true);
      expect(t.url.endsWith('/'), `${t.id} url must end with /`).toBe(true);
    }
  });

  it('carries both tools under the codes the nav uses for them', () => {
    const size = tools.find((t) => t.url === '/size/calculator/');
    expect(size).toBeDefined();
    expect(size?.code).toBe('CAL');

    const rentVsBuy = tools.find((t) => t.url === '/container-rent-vs-buy-calculator/');
    expect(rentVsBuy).toBeDefined();
    expect(rentVsBuy?.code).toBe('RVB');
  });

  it('every code fits the nav .dc convention: two to four uppercase letters', () => {
    for (const t of tools) {
      expect(t.code.length, `${t.id} code length`).toBeGreaterThanOrEqual(2);
      expect(t.code.length, `${t.id} code length`).toBeLessThanOrEqual(4);
      expect(t.code, `${t.id} code shape`).toMatch(/^[A-Z]{2,4}$/);
    }
  });

  it('every card carries the copy the strip needs', () => {
    for (const t of tools) {
      expect(t.kind.length, `${t.id} kind`).toBeGreaterThan(3);
      expect(t.question.endsWith('?'), `${t.id} question must be a question`).toBe(true);
      expect(t.blurb.length, `${t.id} blurb`).toBeGreaterThan(80);
    }
  });

  it('DELIBERATELY NOT A GUIDE: no tool leaks into the guides list or its ItemList', () => {
    const guidesSource = readFileSync(join(REPO_ROOT, 'src/data/guides.ts'), 'utf8');
    expect(
      guidesSource.includes('/container-rent-vs-buy-calculator/'),
      'A calculator entry in guides.ts would bump guideTitleCountWord and rewrite the live meta '
      + 'description of the guides hub. The tool belongs in tools.ts.',
    ).toBe(false);

    // Eleven as of 2026-08-25: the inspector finder is the eleventh GUIDE (it is a directory
    // with booking guidance, on the rental-guide precedent, not a calculator). The count here
    // exists to catch a tool leaking in, so a twelfth entry still has to be a guide to move it.
    expect(guides).toHaveLength(11);
    expect(guideCount).toBe(11);

    const guideUrls = guides.map((g) => g.url);
    const itemListUrls = guideListItems.map((i) => i.url);
    for (const t of tools) {
      expect(guideUrls, `${t.id} must not be a guide`).not.toContain(t.url);
      expect(itemListUrls, `${t.id} must not be in the guides ItemList`)
        .not.toContain(`https://steelboxdirect.com${t.url}`);
    }
  });

  it('carries no em dash or en dash anywhere in the module (HS-OUT-001)', () => {
    expect(SOURCE).not.toMatch(/[\u2014\u2013]/);
    expect(JSON.stringify(tools)).not.toMatch(/[\u2014\u2013]/);
  });
});
