/**
 * RTO TERMS GUARD
 * ===============
 *
 * Two rules, one file.
 *
 *   1. THE FIGURE IS NEVER TYPED. `$99` is a dollar amount, and a hand-typed dollar amount has no
 *      provenance: nothing can prove where it came from or whether it is still true. Every surface
 *      reads it from `src/data/rtoTerms.ts`, so the next revision is one edit. This guard scans
 *      every .astro, .ts and .md file under src/ for the literal figure and fails on any hit.
 *
 *   2. THE OFFER NEVER TRAVELS ALONE. `RTO_CTA_HEADLINE` states an offer. `RTO_CTA_SMALLPRINT`
 *      states the condition that makes the offer true. Rendered apart, the headline is a false
 *      claim rather than a shorter one, so both live in one component that takes no props. A prop
 *      is how the small print eventually gets switched off on some page by someone in a hurry.
 *      This guard asserts the two strings share a component AND that `Astro.props` never appears
 *      in it, because the second assertion is what keeps the first one from being routed around.
 *
 * THE NEEDLE IS IMPORTED, NOT TYPED. `RTO_TERMS.downPayment` supplies the string this file
 * searches for, so the guard obeys the rule it enforces and retargets itself when the figure
 * changes. This file exempts itself from nothing: the walk drops *.test.ts, which is what keeps
 * the needle in memory from reading as a violation on disk.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { RTO_TERMS } from '../../data/rtoTerms';

const REPO_ROOT = import.meta.dirname
  ? join(import.meta.dirname, '..', '..', '..')
  : process.cwd();

const CTA = 'src/components/RtoDownPaymentCta.astro';

/** The one file allowed to hold the figure, because it is the file every other one reads it from. */
const FIGURE_SOURCE = 'src/data/rtoTerms.ts';

/**
 * Directory prefixes exempt from the hand-typed-figure scan ONLY. Exactly one entry, and it must
 * stay exactly this narrow.
 *
 * WHY src/content/blog/ IS EXEMPT: blog posts are markdown, and markdown cannot import a module.
 * A post explaining the down payment change has to spell the figure out in its prose, so the
 * module rule physically cannot bind it. The rule is not being relaxed here; it is being applied
 * where it can apply.
 *
 * WHAT THIS EXEMPTION DOES NOT COVER: every .astro and .ts file, including every page that renders
 * a blog post, and including src/content/config.ts. Those can import, so they must. Do not widen
 * this to src/content/, do not add a second prefix to clear a failure, and if a future format
 * lands that can import, this entry comes back out. An exemption that grows is how the guard stops
 * meaning anything.
 */
const FIGURE_SCAN_EXEMPT_PREFIXES = ['src/content/blog/'];

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (/\.(astro|ts|md)$/.test(entry)) acc.push(p);
  }
  return acc;
}

const rel = (p: string): string => relative(REPO_ROOT, p).split(sep).join('/');

const readCta = (): string => readFileSync(join(REPO_ROOT, CTA), 'utf8');

describe('rto terms guard: the figure is never typed, the offer never travels alone', () => {
  const files = walk(join(REPO_ROOT, 'src')).filter((f) => !/\.test\.ts$/.test(f));

  it('scans a non-trivial file set', () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it('exempts nothing from the figure scan but the markdown blog, which cannot import', () => {
    // A stale or widened exemption is a silent hole, so the exemption list is itself asserted.
    expect(FIGURE_SCAN_EXEMPT_PREFIXES).toEqual(['src/content/blog/']);
    expect(existsSync(join(REPO_ROOT, 'src/content/blog'))).toBe(true);
  });

  it('no file outside rtoTerms.ts hand-types the down payment figure', () => {
    const offenders = files
      .map(rel)
      .filter((r) => r !== FIGURE_SOURCE)
      .filter((r) => !FIGURE_SCAN_EXEMPT_PREFIXES.some((prefix) => r.startsWith(prefix)))
      .filter((r) => readFileSync(join(REPO_ROOT, r), 'utf8').includes(RTO_TERMS.downPayment));
    expect(
      offenders,
      [
        '',
        `Hand-typed "${RTO_TERMS.downPayment}" found. Import RTO_TERMS from src/data/rtoTerms.ts`,
        'instead. Do not add an exemption to clear this.',
        '',
      ].join('\n'),
    ).toEqual([]);
  });

  it('the CTA renders its small print in the same component as its headline', () => {
    const src = readCta();
    expect(src).toContain('RTO_CTA_HEADLINE');
    expect(src).toContain('RTO_CTA_SMALLPRINT');
  });

  it('the CTA takes no props, so the small print cannot be switched off', () => {
    expect(readCta()).not.toMatch(/Astro\.props/);
  });

  it('the CTA links into the rent-to-own down payment section', () => {
    expect(readCta()).toContain('/rent-to-own/#down-payment');
  });
});
