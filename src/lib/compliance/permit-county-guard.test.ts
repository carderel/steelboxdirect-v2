/**
 * COUNTY PERMIT SECTION GUARD (T-215, rewritten 2026-09-16 for the consolidation)
 * ==============================================================================
 *
 * WHAT THESE SECTIONS ARE, because every assertion below follows from it. /permits/{state}/
 * publishes WHO TO ASK and WHAT TO ASK THEM, one anchored section per jurisdiction. It never
 * publishes what the answer is. PROJECT_HS_003 in UDO Project/HARD_STOPS.md forbids determining,
 * advising on, or guaranteeing a regulatory outcome on a reader's behalf, in either direction, and
 * 77 sections that each name a jurisdiction by name are the highest risk surface on this site for
 * breaking it: the temptation to finish the sentence for the reader is strongest exactly where the
 * jurisdiction is known.
 *
 * WHAT CHANGED ON 2026-09-16, AND WHAT THIS GUARD NOW HAS TO HOLD. Until that date each of the 77
 * records had its own URL at /permits/{state}/{county}/. Hamilton County and Warren County were
 * 1,121 words apiece with 1,105 of those words in identical runs and not one unique four word
 * segment between them, so the pages were folded into their 11 state pages, each keeping the slug
 * its URL ended in as a section anchor, and the old URLs 301 to the section. The old invariants
 * ("one built page per record", "every county page carries the carve-out") described a surface that
 * no longer exists. They are not deleted, they are RESTATED against the surface that replaced them,
 * plus three that the consolidation itself makes necessary:
 *
 *   1. NO COUNTY ROUTE BUILDS. The template is gone from disk and dist/ carries no three segment
 *      path under /permits/. A route that quietly came back would compete with the section it was
 *      consolidated into, which is the whole defect this change exists to remove.
 *   2. EVERY RETIRED URL REDIRECTS, in both slash forms, to the anchor that replaced it. 77 records
 *      times two forms, recomputed here from the data rather than counted, and read out of the
 *      BUILT dist/_redirects rather than out of the config that is supposed to produce it.
 *
 *      REWRITTEN 2026-09-17, because that assertion passed while production served 404s. The 154
 *      rules were all present in dist/_redirects and Cloudflare was reading only the first 110 of
 *      them: no build error, no deploy warning, no log line, 56 URLs dead. A local test that reads
 *      a file the platform silently truncates is measuring the wrong artifact. So the 154 rules are
 *      22 placeholder rules, the assertion RESOLVES a URL through the rule set instead of looking
 *      one up in it, and it is joined by the assertion this whole episode was about: the rule count
 *      in dist/_redirects stays under 100. A silent platform ceiling needs a loud local test.
 *   3. NO SECTION CARRIES A WORD THE DATA DID NOT SUPPLY. This is the assertion that does the real
 *      HS_003 work now. Each built section's visible text is reconstructed from
 *      src/data/permitCounties.ts and compared letter for letter. A single sentence of invented
 *      per jurisdiction zoning prose fails the suite, and there is no phrase list to get past,
 *      because the test does not ask what the sentence says. It asks who wrote it.
 *
 * WHY THIS EXISTS ALONGSIDE hs003-content-guard.test.ts RATHER THAN INSTEAD OF IT. That guard is the
 * general one and it is the stronger of the two on open prose: it matches the SHAPE of a
 * determination (regulated topic plus determination marker minus deferral) and it scans src/. This
 * one is narrow and complementary in the two directions the general guard states it cannot reach:
 *
 *   1. IT SCANS BUILT OUTPUT, not source. Every word in a section arrives by interpolation from
 *      src/data/permitCounties.ts through a template, and the general guard's own KNOWN LIMITATIONS
 *      say plainly that it "cannot see text composed at runtime from template interpolation". A
 *      jurisdiction name plus a determination assembled from two files is invisible to a source
 *      scan and obvious in dist/. It also reads the JSON-LD, which the source scan does not.
 *   2. IT ASSERTS PRESENCE, not just absence. A page can be free of every banned phrase and still
 *      be useless as a signpost by naming no office, linking no government source, or dropping the
 *      buyer-responsibility sentence in a refactor. Absence checks cannot catch a page that says
 *      nothing.
 *
 * A PHRASE LIST IS STILL THE RIGHT TOOL FOR THE SHARED COPY, and the reason is the opposite of the
 * one that made a phrase list the wrong tool for the general guard. There, the phrases were an
 * attempt to police open-ended prose and failed three times. Here the copy is a closed set: eight
 * checklist strings, three disclaimer sentences, one multi office note and one template, all of
 * which this file also scans at the source level. The phrase list is a tripwire on a known-good
 * surface, not a filter on unknown prose, and the shape guard is still standing behind it.
 *
 * TIER 1 runs everywhere with no build: derivation invariants, the phrase scan over the data module
 * and the template, the redirect table's derivation, and the copy-fidelity checks that keep the
 * reused sentences from drifting away from the pages they were copied from.
 *
 * TIER 2 needs dist/ AND FAILS WITHOUT IT. It used to skip, on the it.skipIf convention the sitemap
 * and blog-category guards use, and that was wrong here for one reason those guards do not carry:
 * the section reconstruction below is the mechanical enforcement of a hard stop. Verified 2026-09-17
 * by moving dist/ aside: this file reported "29 passed | 20 skipped" and vitest reported
 * "Test Files 1 passed". Green. npm run build runs only the hs003 and dash guards, so a build alone
 * never reaches the reconstruction either, which left the HS_003 protection present only when
 * somebody happened to run npm test AFTER a build, and silently absent otherwise while still
 * reporting success.
 *
 * That is the failure class this project has already paid for twice: the grep --include=*.html that
 * matched no file and exited 0, and the hidden footer text that every source-reading check missed
 * for 120 days. Both reported a pass while checking nothing. So a missing dist/ is treated here the
 * way scripts/pre-push-gate.sh already treats it: not as evidence of compliance, but as an
 * unreviewable state, which denies. Exit 2 in scripts/pre-deploy-seo-scan.mjs means "could not
 * scan" and the gate blocks the push on it; requireBuiltOutput() below is the same ruling in a test.
 * Tier 1 still has teeth in a bare checkout, but it no longer gets to speak for tier 2.
 *
 * The cost is real and accepted: npm test in a fresh checkout fails until npm run build has run, and
 * the failure message says exactly that. A gate you have to satisfy is the point.
 *
 * THE QUESTION EXEMPTION, and why it is narrow. A determination phrase inside a question is not a
 * determination: "Who decides whether you need a permit in Hamilton County?" is the page's whole
 * job. So a finding is cleared only when the sentence CONTAINING it ends in a question mark, which
 * is the same test the general guard uses (its isQuestion). It is deliberately not cleared by a
 * question mark somewhere else in the paragraph, and not by any hedge: a hedged determination is
 * still a determination, and that is the ruling HS_003 already made about class 2.
 *
 * IF THIS FIRES, the fix is to turn the statement back into a question, or to hand it to the office
 * ("the offices below are where to start"). It is never to add a phrase exemption, and it is never
 * to relax the section reconstruction so that a new sentence can live in a section.
 */

import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { cities } from '../../data/cities';
import {
  permitCounties,
  permitCountyCount,
  permitStates,
  permitCountyByKey,
  countiesForCity,
  countySlug,
  multiOfficeNote,
  ASK_CHECKLIST,
  PERMIT_DISCLAIMER,
  MUNICIPAL_CARVE_OUT,
  DELIVERY_ACCESS,
  type PermitCounty,
} from '../../data/permitCounties';

const REPO_ROOT = import.meta.dirname
  ? join(import.meta.dirname, '..', '..', '..')
  : process.cwd();

const DIST = join(REPO_ROOT, 'dist');
const read = (rel: string): string => readFileSync(join(REPO_ROOT, rel), 'utf-8');

/** The template that used to publish one page per record. Deleted 2026-09-16; asserted gone below. */
const RETIRED_COUNTY_TEMPLATE = 'src/pages/permits/[state]/[county].astro';
const STATE_TEMPLATE = 'src/pages/permits/[state]/index.astro';
const HUB_PAGE = 'src/pages/permits/index.astro';
const CITY_TEMPLATE = 'src/pages/locations/[state]/[citySlug].astro';
const DELIVERY_PAGE = 'src/pages/delivery/index.astro';
const ASTRO_CONFIG = 'astro.config.mjs';
const PUBLIC_REDIRECTS = 'public/_redirects';

/* ------------------------------------------------------------------ the phrase list */

/**
 * Statements that answer the permit question for the reader. Both directions are here, because
 * HS_003 bans both: "no permit is required" is exactly as much a determination as "a permit is
 * required" and is the more expensive one to be wrong about.
 */
const DETERMINATION_PHRASES = [
  'you need a permit',
  'a permit is required',
  'no permit is required',
  'you will need',
  'does not require a permit',
  'is allowed',
  'is not allowed',
  'is legal',
  'is illegal',
  // THE JURISDICTIONAL FORM, added after review caught it shipping past the list above. A page can
  // determine nothing about permits and still make an exclusive claim about WHO DECIDES, which is
  // the same class of error one level up: the first draft of the county template said "the office
  // below is the one that decides what applies to a container there" on all 77 pages. It was false
  // on every page whose office is an advisory Planning Commission (26 of the 80 offices), on the
  // seven whose own labels say the municipality or township administers zoning, and on the nine
  // municipalities that sit in no county at all. "Where to start" is the true form and the only one
  // this site is in a position to publish. Full reasoning above MUNICIPAL_CARVE_OUT in
  // src/data/permitCounties.ts.
  'decides what applies',
  'is the office that decides',
  'is the one that decides',
  // Added 2026-09-10: 'is who decides' shipped past this list once and was caught by human
  // review, not by test. The dangerous sentence is routinely the one nobody enumerated.
  'is who decides',
  'who decides for',
  'decides for',
] as const;

const decode = (s: string): string =>
  s
    .replace(/&#39;|&apos;|&rsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&sect;/g, '§')
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCharCode(Number(d)));

const splitSentences = (text: string): string[] => text.split(/(?<=[.?!])\s+/);

const isQuestion = (sentence: string): boolean => /\?\s*$/.test(sentence.trim());

interface Finding { phrase: string; sentence: string }

/** Every determination phrase in `text` that does not sit inside a question. */
function scanForDeterminations(text: string): Finding[] {
  const out: Finding[] = [];
  for (const sentence of splitSentences(decode(text).replace(/\s+/g, ' '))) {
    if (isQuestion(sentence)) continue;
    const lower = sentence.toLowerCase();
    for (const phrase of DETERMINATION_PHRASES) {
      if (lower.includes(phrase)) out.push({ phrase, sentence: sentence.trim() });
    }
  }
  return out;
}

const fmt = (label: string, findings: Finding[]): string =>
  findings.map((f) => `  ${label}: "${f.phrase}" in: ${f.sentence}`).join('\n');

/** Visible page text: scripts and styles removed first, then tags, then entities. */
function visibleText(htmlSource: string): string {
  const stripped = htmlSource
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  return decode(stripped).replace(/\s+/g, ' ').trim();
}

/** Every letter and mark of punctuation, with all whitespace removed. See the note at its first use. */
const squeeze = (s: string): string => s.replace(/\s+/g, '');

/**
 * Template source as prose, with code comments removed first.
 *
 * WHY COMMENTS ARE STRIPPED, and it is not a convenience. A comment is not published copy, and the
 * comments in this template DELIBERATELY QUOTE THE RETIRED WORDING so a later editor can see what
 * was wrong with it and why. Scanning them produced a finding against an explanation of the
 * finding, which is the phantom-finding failure mode hs003-content-guard.test.ts documents at
 * length in its T-146 section and solves the same way. Line-anchored, so a "https://" inside a
 * string literal is untouched: a URL never begins a line with a double slash.
 */
function sourceText(file: string): string {
  const withoutComments = read(file)
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/^[ \t]*\/\/.*$/gm, ' ');
  return visibleText(withoutComments);
}

/** Every string value in a page's JSON-LD graph, flattened. */
function jsonLdStrings(htmlSource: string): string[] {
  const out: string[] = [];
  const walk = (node: unknown): void => {
    if (typeof node === 'string') out.push(node);
    else if (Array.isArray(node)) node.forEach(walk);
    else if (node && typeof node === 'object') Object.values(node).forEach(walk);
  };
  for (const m of htmlSource.matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
  )) {
    walk(JSON.parse(m[1] ?? 'null'));
  }
  return out;
}

const statePath = (stateSlug: string): string => join(DIST, 'permits', stateSlug, 'index.html');
const stateHtml = (stateSlug: string): string => readFileSync(statePath(stateSlug), 'utf-8');

/** Every .html file in dist/, repo relative, so a sweep cannot miss a directory by hand. */
function allBuiltHtml(): string[] {
  const out: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const abs = join(dir, entry.name);
      if (entry.isDirectory()) walk(abs);
      else if (entry.name.endsWith('.html')) out.push(abs);
    }
  };
  walk(DIST);
  return out;
}

/**
 * The visible text of one jurisdiction's section, pulled out of a built state page by its anchor id.
 *
 * BALANCED, NOT NON-GREEDY, and the difference is the whole point of the function. The first version
 * matched lazily to the FIRST </section>, which is correct only while `.jur` sections contain no
 * nested <section>. That is true today and it is an assumption about markup nobody has written down
 * anywhere near the template. If a nested section were ever added, the capture would stop at the
 * inner closing tag and every word after it would fall OUTSIDE the reconstruction comparison, which
 * is a silent hole in exactly the assertion that enforces the hard stop: invented prose placed after
 * a nested block would never be compared. Counting depth costs four lines and removes the
 * assumption. Unbalanced markup returns null, which fails the caller loudly rather than quietly
 * comparing a truncated string.
 */
function sectionHtml(html: string, slug: string): string | null {
  const open = new RegExp(`<section[^>]*\\sid="${slug}"[^>]*>`).exec(html);
  if (!open) return null;
  const start = open.index + open[0].length;
  const tags = /<section\b[^>]*>|<\/section\s*>/g;
  tags.lastIndex = start;
  let depth = 1;
  let tag: RegExpExecArray | null;
  while ((tag = tags.exec(html)) !== null) {
    depth += tag[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return html.slice(start, tag.index);
  }
  return null;
}

/**
 * Everything the DATA says a section may contain, in render order. Compared against the built
 * section letter for letter, which is what makes "no invented per jurisdiction prose" a test rather
 * than a hope. Every string here comes from src/data/permitCounties.ts, which comes from
 * src/data/cities.ts. Nothing in this function is typed copy.
 */
function expectedSectionText(county: PermitCounty): string {
  const parts: string[] = [county.headingPlace];
  for (const office of county.offices) {
    if (office.scope) parts.push(`${county.name}, ${office.scope}`);
    parts.push(office.name);
  }
  const note = multiOfficeNote(county);
  if (note) parts.push(note);
  parts.push(county.cities.map((c) => `Containers in ${c.city}, ${c.state}`).join(' and '));
  return parts.join(' ');
}

const hasDist = existsSync(join(DIST, 'permits', 'index.html'));

const NO_BUILD_MESSAGE = [
  'dist/ is not built, so this assertion could not read the output it exists to police.',
  'This FAILS rather than skips, on purpose. A missing build is not evidence of compliance, it is',
  'an unreviewable state, and the assertions below are the mechanical enforcement of PROJECT_HS_003.',
  'A skipped hard-stop guard that reports green is the exact failure mode this file was written',
  'against. scripts/pre-push-gate.sh already rules the same way on a missing dist/ (exit 2, deny).',
  '',
  'Fix: run npm run build, then re-run this suite.',
].join('\n');

function requireBuiltOutput(): void {
  expect(hasDist, NO_BUILD_MESSAGE).toBe(true);
}

/**
 * A tier 2 test. Same call shape as the it.skipIf(!hasDist) it replaces, so the tier stays legible
 * at every call site, but the precondition is asserted inside the test body instead of deciding
 * whether the test runs. Vitest then reports 20 FAILURES with the message above rather than 20
 * skips, and the file cannot report a pass on a checkout where it read nothing.
 */
const itBuilt = (name: string, fn: () => void): void =>
  it(name, () => {
    requireBuiltOutput();
    fn();
  });

/* ------------------------------------------------------------------ the redirect resolver */

interface RedirectRule {
  from: string;
  to: string;
  status: string;
}

/** Every rule in the BUILT file, comments and blanks dropped, in the order Cloudflare reads them. */
function parseRedirects(): RedirectRule[] {
  const out: RedirectRule[] = [];
  for (const line of readFileSync(join(DIST, '_redirects'), 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [from, to, status] = trimmed.split(/\s+/);
    if (from && to && status) out.push({ from, to, status });
  }
  return out;
}

/**
 * What Cloudflare Pages will serve for one URL, or null if no rule claims it.
 *
 * Cloudflare's matcher in miniature, and it has to be a matcher rather than a lookup now: since
 * 2026-09-17 the 154 retired county URLs are served by 22 PLACEHOLDER rules, and a test that reads
 * the file as a table of literal paths would have found nothing and reported green. A :placeholder
 * matches exactly one path segment and is substituted wherever its name appears in the target,
 * fragment included; a splat matches the rest of the path and fills :splat. First match wins.
 *
 * Every one of those behaviours was checked against the real thing before this was written, by
 * serving a fixture through wrangler pages dev, which runs the same asset runtime Pages runs. This
 * function is that observed behaviour written down, not an inference from documentation.
 */
function resolveRedirect(rules: RedirectRule[], url: string): { target: string; status: string } | null {
  for (const rule of rules) {
    const names: string[] = [];
    const pattern = rule.from
      .split('/')
      .map((segment) => {
        if (segment === '*') {
          names.push('splat');
          return '(.*)';
        }
        if (segment.startsWith(':')) {
          names.push(segment.slice(1));
          return '([^/]+)';
        }
        return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      })
      .join('/');
    const match = new RegExp(`^${pattern}$`).exec(url);
    if (!match) continue;
    let target = rule.to;
    names.forEach((name, i) => {
      target = target.split(`:${name}`).join(match[i + 1] ?? '');
    });
    return { target, status: rule.status };
  }
  return null;
}

/** The URL every built page answers on, derived from where the file landed in dist/. */
function builtPageUrls(): string[] {
  return allBuiltHtml().map((file) => {
    const rel = relative(DIST, file).split(sep).join('/');
    return rel.endsWith('/index.html') ? `/${rel.slice(0, -'index.html'.length)}` : `/${rel.replace(/\.html$/, '')}`;
  });
}

/* ------------------------------------------------------------------ tier 1: derivation */

describe('permit county derivation', () => {
  it('produces one record per unique county plus state across every city zoning array', () => {
    const keys = new Set<string>();
    let entries = 0;
    for (const c of cities) {
      for (const z of c.zoning) {
        entries += 1;
        const parts = z.county.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
        const bare = (parts ? (parts[1] ?? '') : z.county).trim();
        // The state override the module documents: a parenthetical postal abbreviation states the
        // state, so this expectation has to honour it or it would demand the bug.
        const paren = parts ? (parts[2] ?? '').trim().toUpperCase() : '';
        const abbr = /^[A-Z]{2}$/.test(paren) ? paren : '';
        const stateSlug = abbr
          ? (permitCounties.find((p) => p.slug === countySlug(bare))?.stateSlug ?? c.stateSlug)
          : c.stateSlug;
        keys.add(`${stateSlug}/${countySlug(bare)}`);
      }
    }
    expect(entries).toBe(80);
    expect(permitCountyCount).toBe(keys.size);
    expect(Object.keys(permitCountyByKey).sort()).toEqual([...keys].sort());
  });

  it('keeps same-named counties in different states apart', () => {
    // The four pairs that make county-plus-state the only safe dedupe key. If any of these
    // collapses into one record, one state's readers get sent to another state's office.
    for (const [slug, states] of [
      ['hamilton-county', ['ohio', 'indiana']],
      ['clark-county', ['ohio', 'kentucky']],
      ['montgomery-county', ['ohio', 'texas']],
      ['wayne-county', ['michigan', 'west-virginia']],
    ] as const) {
      for (const state of states) expect(permitCountyByKey[`${state}/${slug}`]).toBeDefined();
    }
  });

  it('gives every record a usable slug, anchor, retired path, office and serving city', () => {
    for (const county of permitCounties) {
      expect(county.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      // The retired URL, kept so the 301 table can be generated from the same derivation, and the
      // anchor that replaced it. The fragment IS the old final segment, on purpose: one string
      // names the jurisdiction in the old URL, in the redirect destination and in the section id.
      expect(county.path).toBe(`/permits/${county.stateSlug}/${county.slug}/`);
      expect(county.anchorPath).toBe(`/permits/${county.stateSlug}/#${county.slug}`);
      expect(county.name.length).toBeGreaterThan(2);
      expect(county.offices.length).toBeGreaterThan(0);
      expect(county.cities.length).toBeGreaterThan(0);
      for (const office of county.offices) {
        expect(office.name.length).toBeGreaterThan(4);
        expect(office.url).toMatch(/^https?:\/\//);
      }
      for (const city of county.cities) {
        expect(city.path).toBe(`/locations/${city.stateSlug}/${city.slug}/`);
        expect(cities.some((c) => c.slug === city.slug)).toBe(true);
      }
    }
  });

  it('invents no office and no URL: every one traces back to cities.ts', () => {
    const known = new Set(cities.flatMap((c) => c.zoning.map((z) => `${z.office}|${z.url}`)));
    for (const county of permitCounties) {
      for (const office of county.offices) {
        expect(known.has(`${office.name}|${office.url}`)).toBe(true);
      }
    }
  });

  it('groups every county into exactly one state index', () => {
    expect(permitStates.flatMap((s) => s.counties)).toHaveLength(permitCountyCount);
    for (const entry of permitStates) {
      expect(entry.path).toBe(`/permits/${entry.stateSlug}/`);
      expect(entry.counties.length).toBeGreaterThan(0);
      for (const county of entry.counties) expect(county.stateSlug).toBe(entry.stateSlug);
    }
  });

  it('gives every county a section anchor that is unique within its state page', () => {
    // Two records sharing a slug inside one state would collapse into one anchor, which is the
    // consolidation's version of the same-named-county collision the dedupe key prevents.
    for (const entry of permitStates) {
      const slugs = entry.counties.map((c) => c.slug);
      expect(new Set(slugs).size, `${entry.path} has a duplicate section id`).toBe(slugs.length);
    }
  });

  it('answers countiesForCity from the same records, for every city', () => {
    for (const c of cities) {
      const forCity = countiesForCity(c.slug);
      expect(forCity.length).toBeGreaterThan(0);
      for (const county of forCity) {
        expect(county.cities.some((x) => x.slug === c.slug)).toBe(true);
      }
    }
  });

  it('carries no ZIP field, because no ZIP to county mapping is sourceable', () => {
    // Not pedantry. The module header explains that cities.ts primaryZips are flat per-metro
    // service-area ZIPs with no county relation, so any per-county ZIP list would be invented, and
    // a wrong ZIP on a permit section sends a reader to the wrong county office. If a sourced ZCTA
    // to county crosswalk ever lands, delete this test in the same change that adds the field.
    for (const county of permitCounties) {
      expect(Object.keys(county)).not.toContain('zips');
    }
  });
});

/* ------------------------------------------------------------------ tier 1: the retired route */

describe('the county route is retired, not merely unlinked', () => {
  it('has no county template on disk', () => {
    expect(
      existsSync(join(REPO_ROOT, RETIRED_COUNTY_TEMPLATE)),
      `${RETIRED_COUNTY_TEMPLATE} is back. It would rebuild 77 near-duplicate pages competing with the sections that replaced them.`,
    ).toBe(false);
  });

  it('links no retired county URL from any page source', () => {
    // The whole of src/ and public/, because a stale href does not announce itself: it 301s, which
    // looks fine to a human and spends a hop on every crawl.
    const offenders: string[] = [];
    const walk = (dir: string): void => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const abs = join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(abs);
          continue;
        }
        if (!/\.(astro|ts|tsx|mjs|js|md|txt|json)$/.test(entry.name)) continue;
        // This file and the data module name the retired paths on purpose, in a field and in
        // prose that explain why they are retired.
        const rel = relative(REPO_ROOT, abs);
        if (rel === 'src/data/permitCounties.ts') continue;
        if (rel.endsWith('permit-county-guard.test.ts')) continue;
        const body = readFileSync(abs, 'utf-8');
        for (const county of permitCounties) {
          if (body.includes(`href="${county.path}"`) || body.includes(`href={county.path}`)) {
            offenders.push(`${rel} links ${county.path}`);
          }
        }
      }
    };
    walk(join(REPO_ROOT, 'src'));
    walk(join(REPO_ROOT, 'public'));
    expect(offenders, `\n${offenders.join('\n')}`).toEqual([]);
  });
});

/* ------------------------------------------------------------------ tier 1: the redirects */

describe('the 77 retired county URLs redirect', () => {
  it('states the retired URLs as placeholder rules, one per state per slash form', () => {
    // WHY A PLACEHOLDER AND NOT 154 LINES. Both slash forms of all 77 retired URLs were stated
    // one line each until 2026-09-17, 77 in public/_redirects and 77 generated into
    // astro.config.mjs, and 56 of them were serving a live 404 in production: Cloudflare Pages
    // honours roughly the first 110 lines of _redirects and drops the rest with no build error,
    // no deploy warning and no log line. The rule that broke was not wrong, it was 111th. So the
    // 154 lines are 22 placeholder rules, recomputed here, so the block cannot rot: adding a
    // county to a city zoning array in a state that has none yet fails the suite until the block
    // is regenerated.
    const lines = read(PUBLIC_REDIRECTS)
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'));
    const permitLines = lines.filter((l) => l.startsWith('/permits/'));
    const expected = permitStates.flatMap((state) => [
      `${state.path}:county/ ${state.path}#:county 301`,
      `${state.path}:county ${state.path}#:county 301`,
    ]);
    expect(permitLines).toEqual(expected);
    expect(permitLines).toHaveLength(permitStates.length * 2);
  });

  it('names no county slug in either redirect surface, because a slug list is what broke', () => {
    // The anti-transcription assertion, now pointed at both files. A hand typed block would start
    // correct and end wrong in the direction nobody looks, and a 154 line block was ALSO the
    // defect on its own terms. Comments are stripped first: both headers name
    // /permits/ohio/hamilton-county on purpose while explaining what happened to it, which is
    // documentation rather than a transcribed table.
    const config = read(ASTRO_CONFIG)
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/^[ \t]*\/\/.*$/gm, ' ');
    const redirects = read(PUBLIC_REDIRECTS)
      .split('\n')
      .filter((l) => !l.trim().startsWith('#'))
      .join('\n');
    for (const county of permitCounties) {
      expect(config, `astro.config.mjs hardcodes the slug ${county.slug}`).not.toContain(
        `/${county.slug}`,
      );
      expect(redirects, `public/_redirects hardcodes the slug ${county.slug}`).not.toContain(
        `/${county.slug}`,
      );
    }
  });
});

/* ------------------------------------------------------------------ tier 1: copy */

describe('county permit copy determines nothing', () => {
  it('states no determination in any checklist question', () => {
    for (const item of ASK_CHECKLIST) {
      const findings = [...scanForDeterminations(item.label), ...scanForDeterminations(item.ask)];
      expect(findings, `\n${fmt(item.label, findings)}`).toEqual([]);
    }
  });

  it('frames every checklist item as a question to put to the office', () => {
    expect(ASK_CHECKLIST.length).toBeGreaterThanOrEqual(6);
    for (const item of ASK_CHECKLIST) {
      expect(item.ask, `checklist item "${item.label}" must instruct the reader to ask`).toMatch(
        /^Ask\b/,
      );
    }
  });

  it('states no determination in the disclaimer, the carve-out, the note or the delivery copy', () => {
    for (const text of [
      PERMIT_DISCLAIMER.lede,
      ...PERMIT_DISCLAIMER.responsibility,
      MUNICIPAL_CARVE_OUT,
      DELIVERY_ACCESS.clearance,
      DELIVERY_ACCESS.timing,
      ...permitCounties.map(multiOfficeNote),
    ]) {
      const findings = scanForDeterminations(text);
      expect(findings, `\n${fmt('copy', findings)}`).toEqual([]);
    }
  });

  it('states no determination in any derived county record', () => {
    for (const county of permitCounties) {
      const text = [
        county.name,
        county.headingPlace,
        county.scopeNote ?? '',
        ...county.offices.flatMap((o) => [o.name, o.scope ?? '']),
      ].join('. ');
      const findings = scanForDeterminations(text);
      expect(findings, `\n${county.path}\n${fmt('record', findings)}`).toEqual([]);
    }
  });

  it('states no determination in the state template', () => {
    const findings = scanForDeterminations(sourceText(STATE_TEMPLATE));
    expect(findings, `\n${STATE_TEMPLATE}\n${fmt(STATE_TEMPLATE, findings)}`).toEqual([]);
  });

  /**
   * THE HUB PAGE IS DELIBERATELY OUT OF SCOPE FOR THE PHRASE SCAN, and the reason is worth having
   * written down because it is the one case where this narrow guard is less correct than the
   * general one. /permits/ has said since May 2026: "Whether a permit is required depends on your
   * jurisdiction and what you plan to do with the container." That is an INDIRECT QUESTION with the
   * deferral in the same breath, which is exactly the shape this project wants, and it contains the
   * literal "a permit is required" while ending in a period. A phrase list cannot tell it apart
   * from the determination it inverts; the shape guard in hs003-content-guard.test.ts can, and
   * clears it on the same-unit deferral.
   *
   * So rather than teaching this scanner a "whether" exemption that a real determination could
   * later hide behind ("we can tell you whether a permit is required"), the hub keeps its sentence,
   * the scanner keeps its teeth, and the state pages are asserted NOT to borrow that sentence.
   * Their copy hands the question to the office instead, which needs no exemption at all.
   */
  it('does not let the state pages borrow the hub sentence that only the shape guard can clear', () => {
    expect(read(HUB_PAGE)).toContain('Whether a permit is required depends on your jurisdiction');
    expect(read(STATE_TEMPLATE)).not.toContain('a permit is required');
  });

  it('keeps the disclaimer word for word identical to the permits hub it was copied from', () => {
    // The hub page owns this wording. If somebody improves it there, this fails rather than
    // leaving 11 state pages quoting a retired version of the site's own hard-stop language.
    const hub = read(HUB_PAGE).replace(/\s+/g, ' ');
    expect(hub).toContain(PERMIT_DISCLAIMER.lede.replace(/\s+/g, ' '));
    // The three bullets carry inline <strong> in the hub markup, so they are compared on the
    // tag-stripped text with ALL whitespace removed. Stripping a tag leaves a space behind, and
    // "purchase</strong>;" comes back as "purchase ;": that is a rendering artifact of the
    // comparison, not a difference in the copy, and matching on the letters is the only comparison
    // that is true of both surfaces. Every word and every mark of punctuation still has to match.
    const hubText = squeeze(visibleText(read(HUB_PAGE)));
    for (const line of PERMIT_DISCLAIMER.responsibility) {
      expect(hubText).toContain(squeeze(line));
    }
  });

  it('keeps the delivery access wording identical to the delivery page it was copied from', () => {
    const delivery = read(DELIVERY_PAGE).replace(/\s+/g, ' ');
    expect(delivery).toContain(DELIVERY_ACCESS.clearance.replace(/\s+/g, ' '));
    expect(delivery).toContain(DELIVERY_ACCESS.timing.replace(/\s+/g, ' '));
  });

  it('has the state template render the shared copy rather than a second copy of it', () => {
    const template = read(STATE_TEMPLATE);
    expect(template).toContain('PERMIT_DISCLAIMER.lede');
    expect(template).toContain('MUNICIPAL_CARVE_OUT');
    expect(template).toContain('DELIVERY_ACCESS.clearance');
    expect(template).toContain('ASK_CHECKLIST');
    expect(template).toContain('multiOfficeNote');
    expect(template).toContain('export const prerender = true');
    // No HowTo: the guide branch of buildPageSchema emits howtoByTopic[topic] when a topic is
    // passed, and the permits HowTo is a general instruction set that has no business being
    // restated on 11 jurisdiction-specific URLs.
    expect(template).not.toContain('guideTopic');
    expect(template).not.toMatch(/topic:\s*'permits'/);
  });

  it('has the jump list work without script, because the standing rule is avoid JS', () => {
    const template = read(STATE_TEMPLATE);
    expect(template).not.toContain('<script');
    expect(template).not.toContain('position: sticky');
  });

  it('has the city template link its counties by anchor, from the same records', () => {
    const template = read(CITY_TEMPLATE);
    expect(template).toContain('countiesForCity');
    expect(template).toContain('county.anchorPath');
    expect(template).not.toContain('href={county.path}');
  });
});

/* ------------------------------------------------------------------ tier 2: built output */

describe('built permit pages', () => {
  itBuilt('builds one page per state and not one county page', () => {
    for (const entry of permitStates) {
      expect(existsSync(statePath(entry.stateSlug)), `missing ${entry.path}`).toBe(true);
    }
    for (const county of permitCounties) {
      expect(
        existsSync(join(DIST, 'permits', county.stateSlug, county.slug, 'index.html')),
        `${county.path} still builds a page`,
      ).toBe(false);
    }
    // And nothing three segments deep under /permits/ at all, so a route added under another name
    // cannot slip past a check that only knows the 77 slugs.
    for (const entry of readdirSync(join(DIST, 'permits'), { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const stateDir = join(DIST, 'permits', entry.name);
      const nested = readdirSync(stateDir, { withFileTypes: true }).filter((e) => e.isDirectory());
      expect(nested.map((e) => e.name), `/permits/${entry.name}/ has child routes again`).toEqual([]);
    }
  });

  itBuilt('carries every county as an anchored section and a jump link', () => {
    for (const entry of permitStates) {
      const html = stateHtml(entry.stateSlug);
      for (const county of entry.counties) {
        expect(html, `${entry.path} has no section id for ${county.slug}`).toMatch(
          new RegExp(`<section[^>]*\\sid="${county.slug}"`),
        );
        expect(html, `${entry.path} has no jump link to #${county.slug}`).toContain(
          `href="#${county.slug}"`,
        );
      }
    }
  });

  itBuilt('writes no word into a section that the data did not supply', () => {
    // THE ANTI-INVENTION ASSERTION. Compared with all whitespace removed, for the same reason the
    // hub bullet comparison is: tag stripping leaves spaces behind that are a rendering artifact of
    // the comparison rather than a difference in the copy. Every letter and every mark of
    // punctuation still has to match, so a single added sentence of per jurisdiction zoning prose
    // fails here regardless of what it says.
    for (const entry of permitStates) {
      const html = stateHtml(entry.stateSlug);
      for (const county of entry.counties) {
        const section = sectionHtml(html, county.slug);
        expect(section, `${entry.path} has no section for ${county.slug}`).not.toBeNull();
        expect(
          squeeze(visibleText(section ?? '')),
          `${entry.path}#${county.slug} renders text src/data/permitCounties.ts did not supply`,
        ).toBe(squeeze(expectedSectionText(county)));
      }
    }
  });

  itBuilt('no built state page states a determination in its visible text', () => {
    for (const entry of permitStates) {
      const findings = scanForDeterminations(visibleText(stateHtml(entry.stateSlug)));
      expect(findings, `\n${entry.path}\n${fmt('visible', findings)}`).toEqual([]);
    }
  });

  itBuilt('no built state page states a determination in its JSON-LD', () => {
    for (const entry of permitStates) {
      for (const value of jsonLdStrings(stateHtml(entry.stateSlug))) {
        const findings = scanForDeterminations(value);
        expect(findings, `\n${entry.path}\n${fmt('json-ld', findings)}`).toEqual([]);
      }
    }
  });

  itBuilt('every built state page carries the municipal carve-out', () => {
    // The sentence that keeps "where to start" from collapsing back into "who decides". It has to
    // be on all 11, not on the county-shaped ones only: Virginia's seven independent cities and a
    // five-borough consolidated city need it as much as a township-zoned Ohio county does.
    for (const entry of permitStates) {
      const text = visibleText(stateHtml(entry.stateSlug));
      expect(text, `${entry.path} dropped the municipal carve-out`).toContain(MUNICIPAL_CARVE_OUT);
    }
  });

  itBuilt('sends nobody to a "county site" on a page that lists municipalities', () => {
    // Nine records sit in no county this site names: Virginia's seven independent cities, New York
    // City and the City of Houston, and they now share their page with counties. The retired
    // per-page wording branched on the record's own noun; one page covering both cannot, so the
    // wording is jurisdiction-neutral and the old dead end is asserted gone.
    for (const entry of permitStates) {
      const text = visibleText(stateHtml(entry.stateSlug));
      expect(text).toContain("search that jurisdiction's own site for planning, zoning, or building");
      expect(text, `${entry.path} sends a municipality reader to a county site`).not.toContain(
        'search the county site',
      );
    }
    // And the municipalities really are in the data, so this cannot pass by vacuity.
    expect(permitCounties.filter((c) => c.kind === 'municipality')).toHaveLength(9);
  });

  itBuilt('shows the multi-office note on every record that lists more than one office', () => {
    // The singular "the office below" against two office cards was the original defect. Franklin
    // County OH and Cabell County WV are the records where the city-versus-county split matters
    // most, and New York City is the third.
    for (const county of permitCounties) {
      if (county.offices.length < 2) continue;
      const section = sectionHtml(stateHtml(county.stateSlug), county.slug) ?? '';
      expect(
        visibleText(section),
        `${county.anchorPath} lists ${county.offices.length} offices with no note`,
      ).toContain(multiOfficeNote(county));
    }
    for (const key of ['ohio/franklin-county', 'west-virginia/cabell-county', 'new-york/new-york-city']) {
      expect(permitCountyByKey[key]?.offices.length).toBe(2);
    }
  });

  itBuilt('publishes no rules claim in an office scope label', () => {
    // Finding B: the City of Houston county label in cities.ts carries a parenthetical describing
    // Houston's development-rule regime. It is adjudicated in the HS_003 allowlist for that file
    // and is NOT carried onto a page that names Houston, because a scope label is atomic.
    const houston = permitCountyByKey['texas/city-of-houston'];
    expect(houston).toBeDefined();
    expect(houston?.offices.every((o) => !o.scope)).toBe(true);
    expect(visibleText(stateHtml('texas'))).not.toContain('ordinance-based development rules');
    for (const county of permitCounties) {
      for (const office of county.offices) {
        expect(office.scope ?? '', `${county.anchorPath} renders a rules claim as a scope`).not.toMatch(
          /zoning|permit|ordinance|requirement/i,
        );
      }
    }
  });

  itBuilt('every built state page carries the buyer-responsibility sentence', () => {
    for (const entry of permitStates) {
      const text = visibleText(stateHtml(entry.stateSlug));
      expect(text, `${entry.path} dropped the buyer-responsibility sentence`).toContain(
        "buyer's responsibility",
      );
      expect(text, `${entry.path} dropped the we-do-not-determine sentence`).toMatch(
        /do(?:es)? not determine, advise on, or guarantee permit/,
      );
    }
  });

  itBuilt('every built state page links every one of its government offices', () => {
    // The office URLs are the only genuinely unique datum the retired pages held. Not one of them
    // may be lost in the consolidation, so every URL in the data is asserted present, as a real
    // outbound anchor, on the page that absorbed it.
    for (const entry of permitStates) {
      const html = stateHtml(entry.stateSlug);
      for (const county of entry.counties) {
        expect(county.offices.length).toBeGreaterThan(0);
        for (const office of county.offices) {
          const anchor = new RegExp(
            `<a[^>]*href="${office.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*rel="[^"]*noopener`,
          );
          expect(anchor.test(html), `${entry.path} lost its link to ${office.url}`).toBe(true);
        }
      }
    }
  });

  itBuilt('every built state page links its cities, permits, delivery and one quote CTA', () => {
    for (const entry of permitStates) {
      const html = stateHtml(entry.stateSlug);
      const body = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
      for (const county of entry.counties) {
        for (const city of county.cities) {
          expect(body, `${entry.path} does not link ${city.path}`).toContain(`href="${city.path}"`);
        }
      }
      expect(body).toContain('href="/permits/"');
      expect(body).toContain('href="/delivery/"');
      // One quote CTA on the page, not three. The permit question is the reason the reader is here.
      expect(body.match(/href="\/quote\/"/g) ?? []).toHaveLength(1);
    }
  });

  itBuilt('emits no HowTo and no schema type that could assert a requirement', () => {
    const allowed = new Set([
      'Organization',
      'LocalBusiness',
      'WebSite',
      'CollectionPage',
      'FAQPage',
      'WebPage',
      'BreadcrumbList',
    ]);
    for (const entry of permitStates) {
      const graph = JSON.parse(
        (stateHtml(entry.stateSlug).match(
          /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
        ) ?? [])[1] ?? 'null',
      );
      const types = (graph['@graph'] as { '@type': string }[]).map((n) => n['@type']);
      expect(types).not.toContain('HowTo');
      for (const type of types) {
        expect(allowed.has(type), `${entry.path} emits an unexpected ${type} node`).toBe(true);
      }
    }
  });

  itBuilt('points every ItemList entry at the section that replaced its old URL', () => {
    for (const entry of permitStates) {
      const graph = JSON.parse(
        (stateHtml(entry.stateSlug).match(
          /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
        ) ?? [])[1] ?? 'null',
      );
      const coll = (graph['@graph'] as Record<string, unknown>[]).find(
        (n) => n['@type'] === 'CollectionPage',
      );
      const items =
        ((coll?.mainEntity as Record<string, unknown> | undefined)?.itemListElement as
          | { item: string }[]
          | undefined) ?? [];
      expect(items.map((i) => i.item)).toEqual(
        entry.counties.map((c) => `https://steelboxdirect.com${c.anchorPath}`),
      );
    }
  });

  itBuilt('every FAQPage question is visible on the page it is emitted on', () => {
    // The FAQPage is only honest where the reader sees the same pairs. QuickFacts renders the
    // first three, and these pages ship exactly three.
    for (const entry of permitStates) {
      const html = stateHtml(entry.stateSlug);
      const text = visibleText(html);
      const graph = JSON.parse(
        (html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) ?? [])[1] ?? 'null',
      );
      const faq = (graph['@graph'] as Record<string, unknown>[]).find(
        (n) => n['@type'] === 'FAQPage',
      );
      expect(faq, `${entry.path} emits no FAQPage`).toBeDefined();
      const questions = (faq?.mainEntity as { name: string }[]) ?? [];
      expect(questions.length).toBeGreaterThan(0);
      for (const q of questions) {
        expect(text, `${entry.path} emits an invisible FAQ question: ${q.name}`).toContain(q.name);
      }
    }
  });

  itBuilt('the permits hub links every state index', () => {
    const html = readFileSync(join(DIST, 'permits', 'index.html'), 'utf-8');
    for (const entry of permitStates) {
      expect(html, `the permits hub does not link ${entry.path}`).toContain(`href="${entry.path}"`);
    }
  });

  itBuilt('every built city page links the sections that serve it', () => {
    // The defect this fixes was measured: before T-215 the city pages named these offices, linked
    // them off site, and carried ZERO contextual links into /permits/ anywhere in the body. The
    // links now carry the anchor rather than a URL that would 301.
    for (const c of cities) {
      const path = join(DIST, 'locations', c.stateSlug, c.slug, 'index.html');
      if (!existsSync(path)) continue;
      const html = readFileSync(path, 'utf-8');
      const counties = countiesForCity(c.slug);
      expect(counties.length).toBeGreaterThan(0);
      for (const county of counties) {
        expect(html, `${c.slug} does not link ${county.anchorPath}`).toContain(
          `href="${county.anchorPath}"`,
        );
      }
    }
  });

  itBuilt('links no retired county URL from any built page', () => {
    const offenders: string[] = [];
    for (const file of allBuiltHtml()) {
      const html = readFileSync(file, 'utf-8');
      for (const county of permitCounties) {
        if (html.includes(`href="${county.path}"`)) {
          offenders.push(`${relative(DIST, file)} links ${county.path}`);
        }
      }
    }
    expect(offenders, `\n${offenders.join('\n')}`).toEqual([]);
  });

  itBuilt('advertises no retired county URL in the sitemap', () => {
    const xml = readFileSync(join(DIST, 'sitemap-0.xml'), 'utf-8');
    for (const county of permitCounties) {
      expect(xml, `the sitemap still advertises ${county.path}`).not.toContain(
        `https://steelboxdirect.com${county.path}`,
      );
    }
    for (const entry of permitStates) {
      expect(xml, `the sitemap dropped ${entry.path}`).toContain(
        `https://steelboxdirect.com${entry.path}`,
      );
    }
  });

  itBuilt('301s both slash forms of all 77 retired URLs to the section anchor', () => {
    // Read out of the BUILT file rather than out of the source that is meant to produce it, because
    // the question this answers is what Cloudflare will serve, and RESOLVED rather than looked up,
    // because the rules that serve these 154 URLs are 22 placeholders and a string lookup cannot
    // see through one. resolveRedirect below is Cloudflare's own matching rules in miniature:
    // placeholders match one segment and substitute into the destination, fragment included, a
    // splat matches the rest, and the first matching rule wins. Confirmed against the real asset
    // runtime with wrangler pages dev before this test was written.
    const rules = parseRedirects();
    for (const county of permitCounties) {
      const bare = county.path.replace(/\/$/, '');
      expect(resolveRedirect(rules, county.path), `${county.path} has no 301`).toEqual({
        target: county.anchorPath,
        status: '301',
      });
      expect(resolveRedirect(rules, bare), `${bare} has no 301`).toEqual({
        target: county.anchorPath,
        status: '301',
      });
    }
    expect(permitCountyCount).toBe(77);
  });

  itBuilt('keeps dist/_redirects under the rule count Cloudflare silently stops reading at', () => {
    // THE ASSERTION THIS FILE EXISTS TO CARRY NOW. On 2026-09-17, 166 rules shipped and production
    // served 110 of them. Cloudflare Pages stopped reading partway down the file: no build error,
    // no deploy warning, no log line, and the 56 rules below the cut returned 404 while every rule
    // above it worked. Nothing in the toolchain can fail on this, so the toolchain has to be told.
    // The ceiling is measured at roughly 110 and the limit here is 100, deliberately below it: the
    // exact number is a platform behaviour nobody published and it can move.
    const rules = parseRedirects();
    expect(
      rules.length,
      `dist/_redirects carries ${rules.length} rules. Cloudflare Pages silently drops the tail of ` +
        `this file past roughly 110. Collapse rules into placeholders rather than raising this.`,
    ).toBeLessThan(100);
  });

  itBuilt('leaves every non permit redirect resolving, including the four flat city URLs', () => {
    // The permit placeholders sit in the same file as the rules that predate them, above the block
    // the adapter appends, and a placeholder that matched too much or a rule that fell below the
    // ceiling would break these without breaking anything above. Stated as URL in, URL out, from
    // the same resolver, so the check is what Cloudflare serves rather than what the file says.
    const rules = parseRedirects();
    const expected: Array<[string, string]> = [
      ['/admin', '/admin/login'],
      [
        '/shipping-containers-for-sale/40-foot-one-trip-container',
        '/shipping-containers-for-sale/40-foot-high-cube-container',
      ],
      ['/cincinnati-shipping-containers', '/locations/ohio/cincinnati-shipping-containers'],
      ['/cincinnati-shipping-containers/', '/locations/ohio/cincinnati-shipping-containers/'],
      ['/dayton-shipping-containers', '/locations/ohio/dayton-shipping-containers'],
      ['/dayton-shipping-containers/', '/locations/ohio/dayton-shipping-containers/'],
      ['/indianapolis-shipping-containers', '/locations/indiana/indianapolis-shipping-containers'],
      ['/indianapolis-shipping-containers/', '/locations/indiana/indianapolis-shipping-containers/'],
      ['/louisville-shipping-containers', '/locations/kentucky/louisville-shipping-containers'],
      ['/louisville-shipping-containers/', '/locations/kentucky/louisville-shipping-containers/'],
      ['/~partytown', '/'],
      ['/~partytown/debug/partytown-sandbox-sw.js', '/'],
    ];
    for (const [from, to] of expected) {
      expect(resolveRedirect(rules, from), `${from} no longer redirects`).toEqual({
        target: to,
        status: '301',
      });
    }
  });

  itBuilt('lets a placeholder swallow no path that a real page answers', () => {
    // A placeholder rule matches more than the 77 URLs it replaced: /permits/ohio/anything 301s to
    // /permits/ohio/#anything. That is accepted, because nothing links or indexes such a URL and
    // there is no other real subpath under /permits/{state}/ today. This is the assertion that
    // keeps "today" honest: the day a real page is built under a state, this fails, and the
    // placeholder has to be retired in favour of something narrower.
    const rules = parseRedirects();
    for (const entry of permitStates) {
      expect(resolveRedirect(rules, entry.path), `${entry.path} is being redirected`).toBe(null);
    }
    for (const url of builtPageUrls()) {
      expect(resolveRedirect(rules, url), `${url} is a real page and a redirect claims it`).toBe(
        null,
      );
    }
  });
});

/* ------------------------------------------------------------------ the scanner itself */

describe('the determination scanner', () => {
  it('catches a determination in either direction', () => {
    expect(scanForDeterminations('In Hamilton County a permit is required for a container.')).toHaveLength(1);
    expect(scanForDeterminations('No permit is required on agricultural land.')).toHaveLength(1);
    expect(scanForDeterminations('A container on your own acreage is allowed here.')).toHaveLength(1);
    expect(scanForDeterminations('You will need approval from the county first.')).toHaveLength(1);
  });

  it('catches the jurisdictional form that shipped past the first phrase list', () => {
    // These four are the exact sentences the review caught, one per added phrase.
    expect(
      scanForDeterminations('The office below is the one that decides what applies to a container there.'),
    ).toHaveLength(2);
    expect(
      scanForDeterminations('The Hamilton County Regional Planning Commission is the office that decides for Hamilton County.'),
    ).toHaveLength(2);
    expect(scanForDeterminations('Wayne County decides for a parcel in Livonia.')).toHaveLength(1);
    // And the replacement wording is clean.
    expect(scanForDeterminations(`Your parcel sits in Wayne County, Michigan, and the office below is where to start. ${MUNICIPAL_CARVE_OUT}`)).toEqual([]);
  });

  it('clears the same words inside a question, and only inside a question', () => {
    expect(scanForDeterminations('Who decides whether a permit is required in Hamilton County?')).toEqual([]);
    // A question mark elsewhere in the paragraph does NOT clear a statement.
    const mixed = scanForDeterminations(
      'Who decides in Hamilton County? In Hamilton County a permit is required.',
    );
    expect(mixed).toHaveLength(1);
  });

  it('reads through HTML entities, so an escaped apostrophe cannot hide a phrase', () => {
    expect(scanForDeterminations('The container is not allowed &#39;here&#39;.')).toHaveLength(1);
  });
});

/* ------------------------------------------------------------------ the section reconstruction */

describe('the section reconstruction', () => {
  it('rejects a section that gained a sentence', () => {
    // The assertion above is only worth having if it fails on the thing it is aimed at, so the
    // failure is demonstrated here rather than assumed. A section with one extra sentence of
    // invented zoning prose must not compare equal to the data.
    const county = permitCountyByKey['ohio/hamilton-county'];
    expect(county).toBeDefined();
    const honest = squeeze(expectedSectionText(county as PermitCounty));
    const invented = squeeze(
      `${expectedSectionText(county as PermitCounty)} Most residential parcels here are fine without review.`,
    );
    expect(invented).not.toBe(honest);
  });

  it('pulls a section out of built-shaped markup by its anchor id', () => {
    const html =
      '<section class="jur astro-x" id="hamilton-county"><h3>Hamilton County, Ohio</h3></section>' +
      '<section class="jur astro-x" id="warren-county"><h3>Warren County, Ohio</h3></section>';
    expect(visibleText(sectionHtml(html, 'warren-county') ?? '')).toBe('Warren County, Ohio');
    expect(sectionHtml(html, 'no-such-county')).toBeNull();

    // A NESTED <section> DOES NOT TRUNCATE THE CAPTURE. `.jur` sections do not nest today, and the
    // reconstruction assertion would go quietly half-blind the day one did: a lazy match to the
    // first </section> would stop at the inner tag and leave everything after it uncompared, so
    // invented prose parked below a nested block would never be read. Asserted rather than assumed.
    const nested =
      '<section class="jur" id="butler-county"><h3>Butler County, Ohio</h3>' +
      '<section class="offices"><p>Butler County Planning</p></section>' +
      '<p>Containers in Hamilton, Ohio</p></section>' +
      '<section class="jur" id="warren-county"><h3>Warren County, Ohio</h3></section>';
    expect(visibleText(sectionHtml(nested, 'butler-county') ?? '')).toBe(
      'Butler County, Ohio Butler County Planning Containers in Hamilton, Ohio',
    );
    // And the section after the nested one is still found, so depth counting does not desynchronise.
    expect(visibleText(sectionHtml(nested, 'warren-county') ?? '')).toBe('Warren County, Ohio');
    // Unbalanced markup is null, never a truncated string that could compare equal by accident.
    expect(sectionHtml('<section id="orphan-county"><h3>Orphan</h3>', 'orphan-county')).toBeNull();
  });
});
