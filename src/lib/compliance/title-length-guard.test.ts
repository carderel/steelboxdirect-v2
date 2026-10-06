/**
 * Title-length guard for the pages SEO report 3 (2026-10-06) flagged as "Title Too Long".
 *
 * Search results truncate past ~60 characters, so each page's literal `title=` prop must stay
 * at or under 60 once HTML entities are decoded (`&` counts as one character, which is how the
 * scanner measures it after decoding). Blog posts are covered separately: `seoTitle` in
 * src/content/config.ts carries a `.max(60)` Zod constraint, so an over-long override fails the build.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const PAGES = [
  'src/pages/index.astro',
  'src/pages/about/index.astro',
  'src/pages/ai-info/index.astro',
  'src/pages/blog/index.astro',
  'src/pages/container-certification-guide/index.astro',
  'src/pages/for/homeowners/index.astro',
  'src/pages/locations/index.astro',
];

describe('page titles fit in 60 characters', () => {
  for (const rel of PAGES) {
    it(rel, () => {
      const src = readFileSync(join(process.cwd(), rel), 'utf8');
      const title = src.match(/\n\s+title="([^"]+)"/)?.[1] ?? '';
      expect(title.length).toBeGreaterThanOrEqual(30);
      expect(title.length).toBeLessThanOrEqual(60);
    });
  }

  it('the homepage keeps the brand in its title', () => {
    const src = readFileSync(join(process.cwd(), 'src/pages/index.astro'), 'utf8');
    expect(src.match(/\n\s+title="([^"]+)"/)?.[1]).toContain('Steel Box Direct');
  });
});
