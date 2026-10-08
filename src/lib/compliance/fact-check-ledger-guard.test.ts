/**
 * FACT-CHECK LEDGER GUARD
 * =======================
 *
 * Owner rule (2026-10-08): every new page or blog post is fact-checked by an agent that did NOT
 * write it, using web research from reputable sources (never memory), and every claim is logged
 * in the append-only ledger docs/fact-check-ledger.md before publish. This guard makes "before
 * publish" mechanical: a new page or post with no ledger entry fails Vitest, and the pre-push
 * gate (scripts/pre-push-gate.sh) runs Vitest, so the push stops.
 *
 * WHAT COUNTS AS NEW
 *   1. Blog posts: every file in src/content/blog whose frontmatter has draft !== true and
 *      pubDate on or after the cutoff. Drafts are exempt until they flip to published.
 *   2. Pages: every .astro/.md/.mdx file under src/pages that git records as ADDED in a commit
 *      on or after the cutoff (git log --diff-filter=A --since) and that still exists on disk.
 *      Endpoints (.ts/.js) carry no prose claims and are not counted.
 *   Everything published before the cutoff is grandfathered; the quarterly full-site sweep in
 *   CLAUDE.md covers it instead.
 *
 * SLUGS. A post's slug is its filename without extension. A page's slug is its route path with
 * no leading or trailing slash: src/pages/foo/index.astro is "foo", src/pages/foo/bar.astro is
 * "foo/bar", src/pages/index.astro is "home". Dynamic routes keep their bracket form
 * ("city/[slug]"). The ledger must contain a heading line starting "## <slug> " followed by the
 * dash the ledger template uses.
 *
 * If git is unavailable (or the history is shallow), the page half is SKIPPED with a warning,
 * not passed. The post half needs no git and always runs.
 *
 * If this guard fires, the fix is to run the independent fact check and append its entry to the
 * ledger. It is never to backdate a pubDate, mark a live post as a draft, or widen the cutoff.
 * The dash character is built from its char code so this file stays clean under dash-guard.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const REPO_ROOT = import.meta.dirname
  ? join(import.meta.dirname, '..', '..', '..')
  : process.cwd();

/** The owner rule took effect on this date; content published on or after it needs an entry. */
const CUTOFF = '2026-10-08';

const LEDGER_PATH = join(REPO_ROOT, 'docs', 'fact-check-ledger.md');
const BLOG_DIR = join(REPO_ROOT, 'src', 'content', 'blog');
const DASH = String.fromCharCode(0x2014);

const LEDGER = existsSync(LEDGER_PATH) ? readFileSync(LEDGER_PATH, 'utf8') : '';

// A missing ledger is not its own failure: it reads as empty, so any new page or post fails
// below with the slug named, and a tree with nothing new stays green.
/** Slugs that have a ledger heading of the form "## <slug> <dash>". */
const ledgerSlugs = new Set<string>(
  LEDGER.split('\n')
    .map((line) => line.match(new RegExp(`^##\\s+(.+?)\\s+${DASH}`)))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => m[1].trim()),
);

function missingMessage(kind: string, slugs: string[]): string {
  return (
    `FACT-CHECK LEDGER GUARD: ${slugs.length} new ${kind} published on or after ${CUTOFF} ` +
    `with no entry in docs/fact-check-ledger.md:\n` +
    slugs.map((s) => `  - missing "## ${s} ${DASH} <date>" entry for: ${s}`).join('\n') +
    `\nFix: have an agent that did not write the content fact-check it via web research and ` +
    `append the entry (claim, verdict, source URL, grade, date). Do not backdate or re-draft.`
  );
}

/** Pull a single scalar frontmatter field, tolerating quotes. */
function frontmatterField(src: string, field: string): string | undefined {
  const fm = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return undefined;
  const line = fm[1].match(new RegExp(`^${field}:\\s*(.+)$`, 'm'));
  return line ? line[1].trim().replace(/^['"]|['"]$/g, '') : undefined;
}

function newPublishedPosts(): string[] {
  return readdirSync(BLOG_DIR)
    .filter((f) => /\.(md|mdx)$/.test(f))
    .filter((f) => {
      const src = readFileSync(join(BLOG_DIR, f), 'utf8');
      if (frontmatterField(src, 'draft') === 'true') return false;
      const pub = frontmatterField(src, 'pubDate');
      return pub !== undefined && pub.slice(0, 10) >= CUTOFF;
    })
    .map((f) => f.replace(/\.(md|mdx)$/, ''));
}

function git(args: string[]): string | null {
  try {
    return execFileSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return null;
  }
}

const hasGit: boolean =
  git(['rev-parse', '--is-inside-work-tree'])?.trim() === 'true' &&
  git(['rev-parse', '--is-shallow-repository'])?.trim() === 'false';

if (!hasGit) {
  console.warn(
    '[fact-check-ledger] No usable git history (missing git or a shallow clone), so the new-PAGE ' +
      'check is SKIPPED, not passed. The new-POST check still runs.',
  );
}

function pageSlug(relPath: string): string {
  const route = relPath
    .replace(/^src\/pages\//, '')
    .replace(/\.(astro|md|mdx)$/, '')
    .replace(/(^|\/)index$/, '');
  return route === '' ? 'home' : route;
}

function newPages(): string[] {
  const out = git([
    'log',
    '--diff-filter=A',
    `--since=${CUTOFF}T00:00:00`,
    '--name-only',
    '--format=',
    '--',
    'src/pages',
  ]);
  if (out === null) return [];
  const files = new Set(
    out
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => /\.(astro|md|mdx)$/.test(l))
      .filter((l) => existsSync(join(REPO_ROOT, l))),
  );
  return [...files].map(pageSlug).sort();
}

describe('fact-check ledger guard', () => {
  it('maps page paths to slugs the way the ledger names them', () => {
    expect(pageSlug('src/pages/index.astro')).toBe('home');
    expect(pageSlug('src/pages/cost/index.astro')).toBe('cost');
    expect(pageSlug('src/pages/size/calculator.astro')).toBe('size/calculator');
    expect(pageSlug('src/pages/city/[slug].astro')).toBe('city/[slug]');
  });

  it('every published blog post on or after the cutoff has a ledger entry', () => {
    const missing = newPublishedPosts().filter((s) => !ledgerSlugs.has(s));
    expect(missing, missingMessage('blog post(s)', missing)).toEqual([]);
  });

  it.skipIf(!hasGit)('every page file added in git on or after the cutoff has a ledger entry', () => {
    const missing = newPages().filter((s) => !ledgerSlugs.has(s));
    expect(missing, missingMessage('page(s)', missing)).toEqual([]);
  });
});
