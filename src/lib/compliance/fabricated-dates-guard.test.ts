/**
 * FABRICATED-DATES GUARD
 * ======================
 *
 * On 2026-08-24 an external reviewer caught five guide pages publishing a schema.org
 * datePublished of March 10, 2026, a date that predates the domain's existence. The date was
 * hand-typed on the pages AND baked into buildPageSchema.ts as a silent fallback whenever a
 * caller passed no dates. Both were fabrications on a site whose entire positioning is factual
 * honesty. The fix (same day) replaced the page literals with git-derived dates and removed the
 * fallback outright: buildPageSchema now emits NO date field it was not actually given.
 * Omission is honest; invention is not.
 *
 * This guard keeps both halves of that fix from regressing:
 *   1. The retired literal date appears nowhere under src/. The needle is assembled at runtime
 *      from its parts (year, month, day joined by hyphens), so this file's own bytes never
 *      contain the string it forbids and the scan needs zero exclusions. Same self-consistency
 *      technique as dash-guard.test.ts; same ruling style as the founding-date guard in
 *      entities.test.ts (owner ruling, 2026-08-20: never invent a date to fill a slot).
 *   2. buildPageSchema, called without date args, emits no datePublished and no dateModified.
 *      The one retained fallback is dateModified inheriting datePublished when only the latter
 *      is known, because a page never modified was last modified when it was published. That
 *      is a true statement, not an invented one.
 *
 * If this guard fires, the fix is to derive a real date (git history, content frontmatter, a
 * feed's effective date) or to omit the field. It is never to type a plausible-looking date.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { buildPageSchema } from '../schema/buildPageSchema';

const REPO_ROOT = import.meta.dirname
  ? join(import.meta.dirname, '..', '..', '..')
  : process.cwd();

// Assembled at runtime so the forbidden literal never exists as contiguous bytes in this file.
const RETIRED_DATE = ['2026', '03', '10'].join('-');

/** Text extensions scanned; everything else is skipped as binary. Mirrors dash-guard.test.ts. */
const TEXT_EXT = /\.(astro|ts|tsx|js|mjs|md|mdx|json|txt|xml|css|svg)$/;

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (TEXT_EXT.test(entry)) acc.push(p);
  }
  return acc;
}

const rel = (p: string): string => relative(REPO_ROOT, p).split(sep).join('/');

describe('fabricated-dates guard: the retired literal is gone from src/', () => {
  it('scans a non-trivial file set, including itself', () => {
    const files = walk(join(REPO_ROOT, 'src'));
    expect(files.length).toBeGreaterThan(50);
    expect(files.map(rel)).toContain('src/lib/compliance/fabricated-dates-guard.test.ts');
  });

  it(`finds zero occurrences of the fabricated ${RETIRED_DATE} date anywhere under src/`, () => {
    expect(existsSync(join(REPO_ROOT, 'src'))).toBe(true);
    const findings: string[] = [];
    for (const file of walk(join(REPO_ROOT, 'src'))) {
      const content = readFileSync(file, 'utf-8');
      if (!content.includes(RETIRED_DATE)) continue;
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i]?.includes(RETIRED_DATE)) findings.push(`  ${rel(file)}:${i + 1}`);
      }
    }
    expect(
      findings.length,
      [
        '',
        `FABRICATED-DATES GUARD: the retired ${RETIRED_DATE} literal is back in src/.`,
        'That date predates the domain and was ruled a fabrication on 2026-08-24.',
        'Derive a real date from git history or the relevant data module, or omit the field.',
        '',
        ...findings,
        '',
      ].join('\n'),
    ).toBe(0);
  });
});

describe('fabricated-dates guard: buildPageSchema invents no dates', () => {
  const guideWithoutDates = () =>
    buildPageSchema({
      url: 'https://steelboxdirect.com/size/',
      title: 'Size',
      description: 'd',
      page: { kind: 'guide', topic: 'size', title: 'Size', specs: [], faqs: [] },
    });

  it('a guide built without date args emits an Article with NO datePublished and NO dateModified', () => {
    const { graph } = guideWithoutDates();
    const art = graph.find((n) => n['@type'] === 'Article') as Record<string, unknown>;
    expect(art).toBeDefined();
    expect('datePublished' in art).toBe(false);
    expect('dateModified' in art).toBe(false);
  });

  it('no invented date reaches the serialized graph at all', () => {
    const { graph } = guideWithoutDates();
    expect(JSON.stringify(graph)).not.toContain(RETIRED_DATE);
  });

  it('dateModified may still fall back to a KNOWN datePublished, and only to that', () => {
    const { graph } = buildPageSchema({
      url: 'https://steelboxdirect.com/size/',
      title: 'Size',
      description: 'd',
      datePublished: '2026-05-19',
      page: { kind: 'guide', topic: 'size', title: 'Size', specs: [], faqs: [] },
    });
    const art = graph.find((n) => n['@type'] === 'Article') as Record<string, unknown>;
    expect(art.datePublished).toBe('2026-05-19');
    expect(art.dateModified).toBe('2026-05-19');
  });
});
