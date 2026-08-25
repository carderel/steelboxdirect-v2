import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  guides,
  guideCount,
  guideCountWord,
  guideTitleCountWord,
  guidesByGroup,
  guideListItems,
} from './guides';
import { countWord } from './numberWords';

const REPO_ROOT = import.meta.dirname
  ? join(import.meta.dirname, '..', '..')
  : process.cwd();

describe('guides catalogue', () => {
  it('holds eleven guides with unique ids, codes and urls', () => {
    expect(guides).toHaveLength(11);
    expect(new Set(guides.map((g) => g.id)).size).toBe(11);
    expect(new Set(guides.map((g) => g.code)).size).toBe(11);
    expect(new Set(guides.map((g) => g.url)).size).toBe(11);
  });

  it('derives the count and the count word', () => {
    expect(guideCount).toBe(guides.length);
    expect(guideCountWord).toBe(countWord(guides.length));
    expect(guideTitleCountWord).toBe('Eleven');
  });

  it('NO ITEMLIST 404s: every guide url resolves to a real page file on disk', () => {
    for (const g of guides) {
      const seg = g.url.replace(/^\/|\/$/g, '');
      const candidates = [
        join(REPO_ROOT, 'src/pages', seg, 'index.astro'),
        join(REPO_ROOT, 'src/pages', `${seg}.astro`),
      ];
      expect(
        candidates.some(existsSync),
        `${g.id} points at ${g.url}, which has no page file. An ItemList entry pointing at a 404 `
        + 'is worse than a shorter list: ship the page first, then add the entry.',
      ).toBe(true);
    }
  });

  it('every url is root-relative with a trailing slash', () => {
    for (const g of guides) {
      expect(g.url.startsWith('/'), `${g.id} url must start with /`).toBe(true);
      expect(g.url.endsWith('/'), `${g.id} url must end with /`).toBe(true);
    }
  });

  it('includes the rental guide, in the getting group', () => {
    const rental = guides.find((g) => g.url === '/container-rental-guide/');
    expect(rental).toBeDefined();
    expect(rental?.group).toBe('getting');
    expect(rental?.code).toBe('RTL');
  });

  it('splits into the three router groups the hub renders', () => {
    expect(guidesByGroup('box')).toHaveLength(5);
    expect(guidesByGroup('getting')).toHaveLength(4);
    expect(guidesByGroup('commit')).toHaveLength(2);
    expect(
      guidesByGroup('box').length + guidesByGroup('getting').length + guidesByGroup('commit').length,
    ).toBe(guideCount);
  });

  it('every card carries the copy the router needs', () => {
    for (const g of guides) {
      expect(g.kind.length, `${g.id} kind`).toBeGreaterThan(3);
      expect(g.question.endsWith('?'), `${g.id} question must be a question`).toBe(true);
      expect(g.body.length, `${g.id} body`).toBeGreaterThan(80);
      expect(g.covers.length, `${g.id} covers`).toBeGreaterThan(10);
      expect(g.cta.length, `${g.id} cta`).toBeGreaterThan(5);
      expect(g.accent).toMatch(/^c-[a-z]+$/);
    }
  });

  it('builds absolute ItemList entries named by guide kind', () => {
    expect(guideListItems).toHaveLength(11);
    for (const item of guideListItems) {
      expect(item.url).toMatch(/^https:\/\/steelboxdirect\.com\/[a-z-]+\/$/);
      expect(item.name.length).toBeGreaterThan(3);
    }
    expect(guideListItems.map((i) => i.url)).toContain(
      'https://steelboxdirect.com/container-rental-guide/',
    );
  });

  it('carries no em dash or en dash (HS-OUT-001)', () => {
    expect(JSON.stringify(guides)).not.toMatch(/[\u2014\u2013]/);
  });
});
