#!/usr/bin/env node
/**
 * scripts/generate-route-lastmod.mjs
 *
 * Walks this repository's git history once and writes exactly one file, src/data/routeLastmod.mjs,
 * a committed map from route producing source module to the ISO date of the last commit that
 * touched it. Nothing else is written. The sitemap build reads that committed map instead of
 * running git, which is the whole reason this script exists.
 *
 * THE PRODUCTION FAILURE THAT CREATED IT. Commit 3c3fd80 derived <lastmod> from git at BUILD time.
 * On a developer machine that produced 52 dates out of 52 URLs. In production it produced 8 out of
 * 54, and the 8 survivors were the blog posts, whose dates come from frontmatter and never needed
 * git at all. Cloudflare Pages clones shallow, the derivation module correctly refuses to trust a
 * shallow clone (see the header of src/lib/seo/sitemapLastmod.mjs for why a shallow clone answers
 * "when did file X last change" WRONGLY rather than not at all), so the safety path fired on every
 * single deploy and drained the field it had just added. The safety behaviour was right. The place
 * the derivation ran was wrong. Moving it here fixes the location without weakening the rule.
 *
 * WHY A COMMITTED ARTIFACT IS THE RIGHT SHAPE. A last commit date is an immutable historical fact
 * that only changes when someone edits the file, and that someone is standing in a full checkout
 * with the history in front of them. Recomputing it on every deploy asks the least capable
 * environment in the pipeline a question the most capable one already answered. So the answer gets
 * committed, reviewed in a diff like any other fact, and read by the build as plain data.
 *
 * WHY THE SHALLOW CHECK IS STRICTER HERE THAN IT WAS AT BUILD TIME. It has to be. Under the old
 * design a shallow clone cost one sitemap its dates, and the next full build repaired it. Under
 * this design a run against a shallow clone would write HEAD collapsed dates INTO THE REPOSITORY,
 * where they would be reviewed as if they were derived, committed, and then served as truth for
 * however long they survived. Transient omission became permanent invention. So this script refuses
 * to write anything at all unless the checkout can answer the question correctly, and it exits 1
 * saying so. Fetch the full history and run it again. Never hand edit the output to fill a gap.
 *
 * WHAT IS RECORDED, AND WHY IT IS KEYED BY SOURCE FILE RATHER THAN BY URL. The key is the repo
 * relative path of the module that renders the route, because that path is what the recorded fact
 * is ABOUT. Keying by URL would be a worse artifact in three ways: the fourteen city URLs all come
 * from one [city].astro and would repeat one date fourteen times, a new city added to cities.ts
 * would need a regeneration before its URL could carry any date at all, and a reviewer reading the
 * diff could no longer tell which file actually moved. The build maps a URL back to its module with
 * the same resolution order Astro uses, in resolvePageFile() in the derivation module.
 *
 * WHY ONLY THE PAGE MODULE, and not its layouts, components and data imports: unchanged from the
 * original design, and the reasoning lives in one place, the header of src/lib/seo/sitemapLastmod.mjs.
 * Short version: a shared module changes for one consumer at a time, and src/data pricing is
 * rewritten by a daily Action, so widening the attribution reinvents the build timestamp by a
 * longer route. Understating freshness is the safe direction. Overstating it is not.
 *
 * DETERMINISM. The output carries no generation timestamp and its keys are sorted, so a run that
 * changes nothing rewrites the file byte for byte identically and produces an empty diff. That is
 * deliberate twice over: it keeps review noise at zero, and a generation timestamp inside a file
 * whose entire purpose is to keep build clocks out of the sitemap would be an odd thing to add.
 *
 * USAGE
 *   node scripts/generate-route-lastmod.mjs            write the file (npm run generate:route-lastmod)
 *   node scripts/generate-route-lastmod.mjs --check    write nothing, exit 1 if the file is stale
 *   node scripts/generate-route-lastmod.mjs --quiet    write, but log only on change or failure
 *
 * EXIT CODES. 0 when written or already current, 1 when the history is unusable and 1 from --check
 * when the committed file has drifted. The freshness guard in
 * src/lib/compliance/route-lastmod-freshness-guard.test.ts asserts the same invariant from the test
 * suite, so this file cannot silently rot between runs.
 *
 * No em dash and no en dash anywhere in this file, in code or in prose or in generated output. The
 * dash guard scans the file this script writes.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..');

/* ----------------------------------------------------------------- constants */

/**
 * Shape version of the generated module. Bump it when the exported shape changes, so a consumer
 * reading an older committed file can tell rather than guess.
 */
export const SCHEMA_VERSION = 1;

/** Repo relative, forward slashed, which is how git prints paths. */
export const PAGES_DIR = 'src/pages';
export const BLOG_DIR = 'src/content/blog';

/** The only file this script writes. */
export const OUT_PATH = 'src/data/routeLastmod.mjs';

/** Extensions Astro will build a page from. Everything else under src/pages is support code. */
const PAGE_EXT = /\.(astro|md|mdx)$/;

/**
 * Directory and file names skipped by the walk.
 *   api      endpoints, not pages, and they emit no sitemap URL.
 *   leading _ Astro's own convention for a file that is not a route.
 * /admin IS recorded even though robots.txt disallows it and the sitemap filters it out. Recording
 * it costs three lines and keeps one simple rule, every page module is in the table, in place of a
 * second exclusion list that a future page would have to remember to stay off.
 */
const SKIP_DIR = new Set(['api']);

/* ------------------------------------------------------------------ git access */

function git(args) {
  return execFileSync('git', args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
}

/**
 * True only when this checkout can answer "when did file X last change" correctly.
 *
 * A shallow clone is rejected outright rather than tolerated, because it answers WRONGLY rather
 * than not at all: in a depth 1 clone git log -1 -- <path> returns HEAD's date for the handful of
 * files HEAD touched and nothing for every other file, so the surviving dates are all the clone
 * date wearing a git costume. Cloudflare Pages clones shallow, and so does actions/checkout at its
 * default depth, so this is the common case in automation rather than an exotic one.
 *
 * Exported because both the derivation guard and the freshness guard need to ask the same question,
 * and two implementations of it would eventually disagree.
 */
export function gitHistoryIsUsable() {
  try {
    if (git(['rev-parse', '--is-inside-work-tree']).trim() !== 'true') return false;
    return git(['rev-parse', '--is-shallow-repository']).trim() === 'false';
  } catch {
    return false;
  }
}

/**
 * One walk of the log rather than one process per file: git log newest first, printing each
 * commit's date followed by the paths it touched, so the first date a path appears under is that
 * path's last modification. Pathspecs keep the walk to the two trees that produce routes.
 *
 * Returns an empty Map, never a partial or invented one, when the history cannot be trusted.
 */
export function lastCommitDates() {
  const dates = new Map();
  if (!gitHistoryIsUsable()) return dates;
  let out;
  try {
    out = git([
      '-c',
      'core.quotepath=false',
      'log',
      '--pretty=format:%cI',
      '--name-only',
      '--no-merges',
      '--',
      PAGES_DIR,
      BLOG_DIR,
    ]);
  } catch {
    return dates;
  }
  let current = null;
  for (const line of out.split('\n')) {
    const value = line.trim();
    if (!value) continue;
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
      current = value;
      continue;
    }
    if (current && !dates.has(value)) dates.set(value, current);
  }
  return dates;
}

/* ------------------------------------------------------------------ file walk */

/**
 * Every route producing source file that exists on disk right now, repo relative and sorted.
 *
 * Existence on disk is the filter that matters. The git log above also reports files that were
 * deleted or renamed at some point in history, and a deleted page still has a perfectly real last
 * commit date. Recording it would put a key in the table for a route this site no longer serves,
 * which is dead weight at best and a resurrected URL at worst.
 */
export function collectRouteSourceFiles() {
  const found = [];
  const walk = (rel) => {
    const abs = join(REPO_ROOT, rel);
    if (!existsSync(abs)) return;
    for (const entry of readdirSync(abs, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
      if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue;
      const child = `${rel}/${entry.name}`;
      if (entry.isDirectory()) {
        if (SKIP_DIR.has(entry.name)) continue;
        walk(child);
      } else if (PAGE_EXT.test(entry.name)) {
        found.push(child);
      }
    }
  };
  walk(PAGES_DIR);
  walk(BLOG_DIR);
  return found.sort();
}

/**
 * The table as it SHOULD be, given the working tree and the history: sorted pairs of repo relative
 * path and ISO commit date.
 *
 * A file with no commit date is omitted rather than given a placeholder. That happens for a page
 * that has been created but never committed, and the honest statement about a file git has never
 * seen is silence. Downstream, an absent key ships that URL bare, exactly as every URL shipped
 * before lastmod existed.
 */
export function buildTable(commits = lastCommitDates(), files = collectRouteSourceFiles()) {
  const table = [];
  for (const file of files) {
    const iso = commits.get(file);
    if (iso) table.push([file, iso]);
  }
  return table;
}

/* ------------------------------------------------------------------ rendering */

/**
 * The generated module, as a string. Plain .mjs rather than .ts for the same reason the derivation
 * module is .mjs: astro.config.mjs imports that module while the config itself is loading, and a
 * plain ESM object literal raises no loader questions in Astro, in vitest or in bare node. One
 * entry per line, sorted, so a reviewer reads the diff as "these three pages changed".
 */
export function renderModule(table) {
  const body = table.map(([file, iso]) => `  '${file}': '${iso}',`).join('\n');
  return `// ${OUT_PATH}
// GENERATED FILE. Do not hand edit. Written in full by scripts/generate-route-lastmod.mjs, which
// walks this repository's git history. A hand edit here is lost on the next run, and a hand edit
// that happens to survive is worse than one that is lost, because it publishes a freshness date
// that no commit ever supported.
//
// WHAT THIS FILE HOLDS. One entry per route producing source module, mapping the repo relative
// path of that module to the ISO date of the last commit that touched it. That is the fact the
// sitemap turns into <lastmod>. It is keyed by source file rather than by URL because the fact is
// about the file: fourteen city URLs come from one [city].astro and share one date, and a new city
// therefore needs no regeneration to inherit a correct one.
//
// WHY IT IS COMMITTED RATHER THAN COMPUTED AT BUILD TIME. Cloudflare Pages clones shallow, and a
// shallow clone answers "when did this file last change" wrongly rather than not at all: every
// answer collapses toward the deploy date. The build used to run git itself and, on detecting the
// shallow clone, correctly refused to state anything, which shipped 8 dates out of 54 URLs in
// production against 52 out of 52 locally. Deriving the dates where the history exists and reading
// them here as data fixes that without softening the refusal. Full reasoning: the headers of
// scripts/generate-route-lastmod.mjs and src/lib/seo/sitemapLastmod.mjs.
//
// A ROUTE ABSENT FROM THIS TABLE SHIPS WITHOUT A lastmod. That is a supported outcome and it is not
// a bug to paper over. Omission is honest, invention is not, and a sitemap whose dates are trusted
// on the entries that carry them is worth more than one where every entry carries a guess.
//
// KEEPING IT CURRENT. Run npm run generate:route-lastmod after editing a page. The freshness guard
// at src/lib/compliance/route-lastmod-freshness-guard.test.ts fails the test suite when a recorded
// date is older than the file it describes, so this table cannot rot in silence.
//
// No em dash and no en dash may appear in this file. The build time dash guard scans it.

/** Shape version, matching SCHEMA_VERSION in the generator. */
export const SCHEMA_VERSION = ${SCHEMA_VERSION};

/** Repo relative source module path to ISO date of its last commit. Sorted by path. */
export const routeLastmod = {
${body}
};

export default routeLastmod;
`;
}

/* ------------------------------------------------------------------ the run */

/** Sorted pairs from the committed module, or an empty array when it does not exist yet. */
function readCommittedTable() {
  const abs = join(REPO_ROOT, OUT_PATH);
  if (!existsSync(abs)) return null;
  const src = readFileSync(abs, 'utf8');
  const pairs = [];
  for (const m of src.matchAll(/^\s{2}'([^']+)':\s*'([^']+)',$/gm)) pairs.push([m[1], m[2]]);
  return pairs;
}

/** Human readable classification of how the committed table differs from the derived one. */
export function diffTables(committed, derived) {
  const was = new Map(committed ?? []);
  const now = new Map(derived);
  const stale = [];
  const missing = [];
  const removed = [];
  for (const [file, iso] of now) {
    if (!was.has(file)) missing.push(`${file}  ${iso}`);
    else if (was.get(file) !== iso) stale.push(`${file}  ${was.get(file)} -> ${iso}`);
  }
  for (const [file, iso] of was) if (!now.has(file)) removed.push(`${file}  ${iso}`);
  return { stale, missing, removed, changed: stale.length + missing.length + removed.length };
}

async function main(argv = process.argv.slice(2)) {
  const check = argv.includes('--check');
  const quiet = argv.includes('--quiet');
  const log = (line) => console.error(`route-lastmod: ${line}`);

  if (!gitHistoryIsUsable()) {
    log('this checkout cannot answer when a file last changed.');
    log('either git is unavailable or the clone is SHALLOW, and a shallow clone returns the clone');
    log('date for the few files HEAD touched and nothing for the rest. Writing that would commit a');
    log('fabricated freshness date. Nothing has been written.');
    log('fix: git fetch --unshallow  (or clone with full history) and run this again.');
    return 1;
  }

  const derived = buildTable();
  const committed = readCommittedTable();
  const diff = diffTables(committed, derived);

  if (committed === null) log(`${OUT_PATH} does not exist yet and will be created.`);

  if (diff.changed === 0) {
    if (!quiet) log(`already current: ${derived.length} route modules dated, nothing to write.`);
    return 0;
  }

  for (const line of diff.stale) log(`  moved    ${line}`);
  for (const line of diff.missing) log(`  new      ${line}`);
  for (const line of diff.removed) log(`  dropped  ${line}`);

  if (check) {
    log(`${OUT_PATH} is out of date in ${diff.changed} entries.`);
    log('fix: npm run generate:route-lastmod, then commit the result.');
    return 1;
  }

  writeFileSync(join(REPO_ROOT, OUT_PATH), renderModule(derived), 'utf8');
  log(`wrote ${OUT_PATH}: ${derived.length} route modules dated, ${diff.changed} entries changed.`);
  return 0;
}

// Only run when executed directly, never when imported by a guard.
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main().then(
    (code) => process.exit(code),
    (err) => {
      console.error(`route-lastmod: unhandled failure: ${err?.stack ?? err}`);
      process.exit(1);
    },
  );
}
