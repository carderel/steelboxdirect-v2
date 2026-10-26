import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { homeReads } from './homeReads';

const REPO_ROOT = import.meta.dirname
  ? join(import.meta.dirname, '..', '..')
  : process.cwd();
const BLOG_DIR = join(REPO_ROOT, 'src/content/blog');

// Reads the frontmatter flag straight off disk. astro:content is not available under vitest, and
// ReadsSection.astro repeats the same check at build time against the real collection.
const isDraft = (src: string): boolean => {
  const fm = src.match(/^---\n([\s\S]*?)\n---/);
  return !!fm && /^draft:\s*true\s*$/m.test(fm[1]);
};

describe('homepage curated reads', () => {
  it('holds exactly three unique slugs', () => {
    expect(homeReads).toHaveLength(3);
    expect(new Set(homeReads.map((r) => r.slug)).size).toBe(3);
  });

  it('every slug is a real, published (non-draft) post', () => {
    for (const r of homeReads) {
      const file = join(BLOG_DIR, `${r.slug}.md`);
      expect(existsSync(file), `${r.slug} has no file in src/content/blog/`).toBe(true);
      expect(isDraft(readFileSync(file, 'utf8')), `${r.slug} is a draft`).toBe(false);
    }
  });

  it('no blurb carries a figure: no digit, no "$", no "dollar"', () => {
    for (const r of homeReads) {
      expect(r.blurb, r.slug).not.toMatch(/\$|\bdollars?\b|\d/i);
      expect(r.blurb.trim().length, `${r.slug} blurb is empty`).toBeGreaterThan(0);
    }
  });
});
