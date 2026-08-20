/**
 * HS-OUT-001 BUILD-TIME DASH GUARD
 * ================================
 *
 * Encodes HS-OUT-001: no em dashes (U+2014) or en dashes (U+2013) in output or committed files.
 * Scans every text file under `src/` and `public/` for the literal characters AND the HTML entity
 * spellings that render as them ("mdash" / "ndash" named entities and the #8212 / #8211 numeric
 * forms), because an entity in source IS a dash in output.
 *
 * Authorized as todo T-036, wired into `npm run build` via the `guard` script in package.json so a
 * violation fails the deploy before `astro build` runs.
 *
 * DESIGN NOTES, so this file cannot flag itself:
 *   - The dash characters appear in this source only as \u escapes. The file bytes never contain
 *     a literal U+2014 or U+2013; the escape becomes the character at RUNTIME, which is exactly
 *     what the fixtures need and exactly what the scanner must not find in the file bytes.
 *   - The entity strings are assembled by concatenation below ('&' + 'mdash;' etc.), so the
 *     assembled needle exists at runtime but never as contiguous bytes in this file. That means
 *     this guard scans ITSELF with zero exclusions, which is the strongest self-consistency proof
 *     available.
 *
 * EXCLUSIONS (exact relative path, POSIX separators):
 *   1. src/content/blog/the-cheap-container-that-wasnt.md, ALL checks. Owner-reserved draft,
 *      deliberately kept with em dashes, UNTRACKED so it never reaches CI. Excluded so LOCAL
 *      builds do not fail on a file that never ships. If it is ever tracked or published, remove
 *      the exclusion and fix the copy.
 *   2. src/lib/compliance/hs003-content-guard.test.ts, ENTITY checks only. Its entity-decoding
 *      machinery contains the mdash entity as a literal needle (around line 540). It is still
 *      scanned for literal dash characters, which it does not contain (its fixtures use \u
 *      escapes, per its own "NOTE ON DASHES" header comment).
 *
 * On failure the message lists every finding as relative-path:line so you can jump straight to it.
 * The fix is to reword with a comma, a period, a colon, or parentheses, not to widen the
 * exclusion list.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const REPO_ROOT = import.meta.dirname
  ? join(import.meta.dirname, '..', '..', '..')
  : process.cwd();

const SCAN_ROOTS = ['src', 'public'];

/** Text extensions scanned. Anything else (images, fonts, ico, pdf) is skipped as binary. */
const TEXT_EXT = /\.(astro|ts|tsx|js|mjs|md|mdx|json|txt|xml|css|svg)$/;

/** Excluded from ALL checks, by exact repo-relative path. */
const EXCLUDE_ALL = new Set<string>([
  'src/content/blog/the-cheap-container-that-wasnt.md',
]);

/** Excluded from ENTITY checks only; still scanned for literal dash characters. */
const EXCLUDE_ENTITIES = new Set<string>([
  'src/lib/compliance/hs003-content-guard.test.ts',
]);

/* ------------------------------------------------------------------ needles */

// Literal characters, via escapes so this file's own bytes stay clean.
const EM_DASH = '\u2014';
const EN_DASH = '\u2013';

// Entity strings, assembled at runtime so they never appear contiguously in this file's bytes.
const AMP = String.fromCharCode(38);
const ENTITY_NEEDLES: { needle: string; label: string }[] = [
  { needle: `${AMP}mdash;`, label: 'em-dash named entity' },
  { needle: `${AMP}ndash;`, label: 'en-dash named entity' },
  { needle: `${AMP}#8212;`, label: 'em-dash numeric entity' },
  { needle: `${AMP}#8211;`, label: 'en-dash numeric entity' },
];

const LITERAL_NEEDLES: { needle: string; label: string }[] = [
  { needle: EM_DASH, label: 'literal em dash U+2014' },
  { needle: EN_DASH, label: 'literal en dash U+2013' },
];

/* ------------------------------------------------------------------ scanner */

export interface DashFinding {
  line: number;
  label: string;
}

/**
 * Scans one file's content. `checkEntities` is false only for the HS003 guard exclusion above.
 * Line-by-line indexOf: no regex engine, no allocation beyond the split, fast enough that the
 * whole src+public tree scans in well under a second.
 */
export function scanContentForDashes(content: string, checkEntities = true): DashFinding[] {
  const findings: DashFinding[] = [];
  const needles = checkEntities ? [...LITERAL_NEEDLES, ...ENTITY_NEEDLES] : LITERAL_NEEDLES;
  // Cheap whole-file pre-check before the per-line pass; most files exit here.
  if (!needles.some((n) => content.includes(n.needle))) return findings;
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    for (const n of needles) {
      if (line.includes(n.needle)) findings.push({ line: i + 1, label: n.label });
    }
  }
  return findings;
}

/* ------------------------------------------------------------------ file walk */

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (TEXT_EXT.test(entry)) acc.push(p);
  }
  return acc;
}

const rel = (p: string): string => relative(REPO_ROOT, p).split(sep).join('/');

function collectFiles(): string[] {
  const out: string[] = [];
  for (const root of SCAN_ROOTS) {
    const p = join(REPO_ROOT, root);
    if (existsSync(p)) walk(p, out);
  }
  return out.sort();
}

/* ------------------------------------------------------------------ suites */

describe('HS-OUT-001 dash guard: scan wiring', () => {
  it('resolves the repo root and finds a non-trivial file set to scan', () => {
    expect(existsSync(join(REPO_ROOT, 'package.json'))).toBe(true);
    const files = collectFiles();
    expect(files.length).toBeGreaterThan(50);
    // It must scan itself and the HS003 guard, or the self-consistency claims above are hollow.
    const rels = files.map(rel);
    expect(rels).toContain('src/lib/compliance/dash-guard.test.ts');
    expect(rels).toContain('src/lib/compliance/hs003-content-guard.test.ts');
  });

  it('the all-checks exclusion targets a file that actually exists (stale exclusions fail)', () => {
    for (const e of EXCLUDE_ALL) {
      expect(existsSync(join(REPO_ROOT, e)), `stale EXCLUDE_ALL entry: ${e}`).toBe(true);
    }
    for (const e of EXCLUDE_ENTITIES) {
      expect(existsSync(join(REPO_ROOT, e)), `stale EXCLUDE_ENTITIES entry: ${e}`).toBe(true);
    }
  });
});

describe('HS-OUT-001 dash guard: teeth self-test (synthetic fixtures)', () => {
  it('detects a literal em dash', () => {
    const hits = scanContentForDashes(`clean line\nbad ${EM_DASH} line\n`);
    expect(hits).toEqual([{ line: 2, label: 'literal em dash U+2014' }]);
  });

  it('detects a literal en dash', () => {
    const hits = scanContentForDashes(`pages 4${EN_DASH}5\n`);
    expect(hits).toEqual([{ line: 1, label: 'literal en dash U+2013' }]);
  });

  it('detects each entity form on its own line', () => {
    const content = ENTITY_NEEDLES.map((n) => `text ${n.needle} text`).join('\n');
    const hits = scanContentForDashes(content);
    expect(hits).toEqual(ENTITY_NEEDLES.map((n, i) => ({ line: i + 1, label: n.label })));
  });

  it('entity exclusion mode still catches literal dashes but ignores entities', () => {
    const content = `entity ${AMP}mdash; here\nliteral ${EM_DASH} here\n`;
    const hits = scanContentForDashes(content, false);
    expect(hits).toEqual([{ line: 2, label: 'literal em dash U+2014' }]);
  });

  it('does not fire on hyphens, minus signs, or escape-sequence text', () => {
    const clean = 'a-b, 3 - 4, wind-and-water-tight, \\u2014 as text, --flag, a -- b\n';
    expect(scanContentForDashes(clean)).toEqual([]);
  });
});

describe('HS-OUT-001 dash guard: live scan of src/ and public/', () => {
  it('finds zero em/en dashes (literal or entity) outside the documented exclusions', () => {
    const findings: string[] = [];
    for (const file of collectFiles()) {
      const r = rel(file);
      if (EXCLUDE_ALL.has(r)) continue;
      const hits = scanContentForDashes(readFileSync(file, 'utf-8'), !EXCLUDE_ENTITIES.has(r));
      for (const h of hits) findings.push(`  ${r}:${h.line}  (${h.label})`);
    }
    expect(
      findings.length,
      [
        '',
        `HS-OUT-001 DASH GUARD: ${findings.length} em/en dash finding(s) in src/ or public/.`,
        'The rule: no em dashes (U+2014) or en dashes (U+2013), literal or as HTML entities,',
        'in output or committed files. Reword with a comma, period, colon, or parentheses.',
        'Do NOT add exclusions to clear a failure; exclusions are an owner decision.',
        '',
        ...findings,
        '',
      ].join('\n'),
    ).toBe(0);
  });
});
