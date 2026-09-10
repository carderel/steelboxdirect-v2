/**
 * COUNTY PERMIT PAGE GUARD (T-215)
 * ================================
 *
 * WHAT THESE PAGES ARE, because every assertion below follows from it. /permits/{state}/{county}/
 * publishes WHO DECIDES and WHAT TO ASK THEM. It never publishes what the answer is. PROJECT_HS_003
 * in UDO Project/HARD_STOPS.md forbids determining, advising on, or guaranteeing a regulatory
 * outcome on a reader's behalf, in either direction, and 77 pages that each name a county by name
 * are the highest risk surface on this site for breaking it: the temptation to finish the sentence
 * for the reader is strongest exactly where the jurisdiction is known.
 *
 * WHY THIS EXISTS ALONGSIDE hs003-content-guard.test.ts RATHER THAN INSTEAD OF IT. That guard is the
 * general one and it is the stronger of the two: it matches the SHAPE of a determination (regulated
 * topic plus determination marker minus deferral) and it scans src/. This one is narrow and
 * complementary in the two directions the general guard states it cannot reach:
 *
 *   1. IT SCANS BUILT OUTPUT, not source. Every word on a county page arrives by interpolation from
 *      src/data/permitCounties.ts through a template, and the general guard's own KNOWN LIMITATIONS
 *      say plainly that it "cannot see text composed at runtime from template interpolation". A
 *      county name plus a determination assembled from two files is invisible to a source scan and
 *      obvious in dist/. It also reads the JSON-LD, which the source scan explicitly does not.
 *   2. IT ASSERTS PRESENCE, not just absence. A page can be free of every banned phrase and still
 *      be useless as a signpost by naming no office, linking no government source, or dropping the
 *      buyer-responsibility sentence in a refactor. Absence checks cannot catch a page that says
 *      nothing.
 *
 * A PHRASE LIST IS THE RIGHT TOOL HERE, and the reason is the opposite of the one that made a
 * phrase list the wrong tool for the general guard. There, the phrases were an attempt to police
 * open-ended prose and failed three times. Here the copy is a closed set: eight checklist strings,
 * three disclaimer sentences and one template, all of which this file also scans at the source
 * level. The phrase list is a tripwire on a known-good surface, not a filter on unknown prose, and
 * the shape guard is still the thing standing behind it.
 *
 * TIER 1 runs everywhere with no build: derivation invariants, the phrase scan over the data module
 * and the templates, and the two copy-fidelity checks that keep the reused sentences from drifting
 * away from the pages they were copied from.
 *
 * TIER 2 needs dist/ and is skipped without it, the same it.skipIf convention the sitemap and
 * blog-category guards use. Skipping is honest here: a stale or absent dist cannot tell you
 * anything about the copy that is about to ship, and tier 1 still has teeth in a bare checkout.
 * Run npm run build first if you want the full set.
 *
 * THE QUESTION EXEMPTION, and why it is narrow. A determination phrase inside a question is not a
 * determination: "Who decides whether you need a permit in Hamilton County?" is the page's whole
 * job. So a finding is cleared only when the sentence CONTAINING it ends in a question mark, which
 * is the same test the general guard uses (its isQuestion). It is deliberately not cleared by a
 * question mark somewhere else in the paragraph, and not by any hedge: a hedged determination is
 * still a determination, and that is the ruling HS_003 already made about class 2.
 *
 * IF THIS FIRES, the fix is to turn the statement back into a question, or to hand it to the office
 * ("the office below is who determines whether ..."). It is never to add a phrase exemption.
 */

import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cities } from '../../data/cities';
import {
  permitCounties,
  permitCountyCount,
  permitStates,
  permitCountyByKey,
  countiesForCity,
  countySlug,
  ASK_CHECKLIST,
  PERMIT_DISCLAIMER,
  MUNICIPAL_CARVE_OUT,
  DELIVERY_ACCESS,
} from '../../data/permitCounties';

const REPO_ROOT = import.meta.dirname
  ? join(import.meta.dirname, '..', '..', '..')
  : process.cwd();

const DIST = join(REPO_ROOT, 'dist');
const read = (rel: string): string => readFileSync(join(REPO_ROOT, rel), 'utf-8');

const COUNTY_TEMPLATE = 'src/pages/permits/[state]/[county].astro';
const STATE_TEMPLATE = 'src/pages/permits/[state]/index.astro';
const HUB_PAGE = 'src/pages/permits/index.astro';
const CITY_TEMPLATE = 'src/pages/locations/[state]/[citySlug].astro';
const DELIVERY_PAGE = 'src/pages/delivery/index.astro';

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

/**
 * Template source as prose, with code comments removed first.
 *
 * WHY COMMENTS ARE STRIPPED, and it is not a convenience. A comment is not published copy, and the
 * comments in these templates DELIBERATELY QUOTE THE RETIRED WORDING so a later editor can see
 * what was wrong with it and why. Scanning them produced a finding against an explanation of the
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

const countyHtmlPath = (stateSlug: string, slug: string): string =>
  join(DIST, 'permits', stateSlug, slug, 'index.html');

const hasDist = existsSync(join(DIST, 'permits', 'index.html'));
if (!hasDist) {
  process.stderr.write(
    '[permit-county-guard] dist/ not built: tier 2 built-output assertions skipped. Run npm run build.\n',
  );
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

  it('gives every record a usable slug, path, office and serving city', () => {
    for (const county of permitCounties) {
      expect(county.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(county.path).toBe(`/permits/${county.stateSlug}/${county.slug}/`);
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
    // a wrong ZIP on a permit page sends a reader to the wrong county office. If a sourced ZCTA to
    // county crosswalk ever lands, delete this test in the same change that adds the field.
    for (const county of permitCounties) {
      expect(Object.keys(county)).not.toContain('zips');
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

  it('states no determination in the disclaimer or the delivery copy', () => {
    for (const text of [
      PERMIT_DISCLAIMER.lede,
      ...PERMIT_DISCLAIMER.responsibility,
      DELIVERY_ACCESS.clearance,
      DELIVERY_ACCESS.timing,
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

  it('states no determination in either new template', () => {
    for (const file of [COUNTY_TEMPLATE, STATE_TEMPLATE]) {
      const findings = scanForDeterminations(sourceText(file));
      expect(findings, `\n${file}\n${fmt(file, findings)}`).toEqual([]);
    }
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
   * the scanner keeps its teeth, and the county pages are asserted NOT to borrow that sentence.
   * The county copy hands the question to the office instead, which needs no exemption at all.
   */
  it('does not let the county pages borrow the hub sentence that only the shape guard can clear', () => {
    expect(read(HUB_PAGE)).toContain('Whether a permit is required depends on your jurisdiction');
    for (const file of [COUNTY_TEMPLATE, STATE_TEMPLATE]) {
      expect(read(file)).not.toContain('a permit is required');
    }
  });

  it('keeps the disclaimer word for word identical to the permits hub it was copied from', () => {
    // The hub page owns this wording. If somebody improves it there, this fails rather than
    // leaving 77 county pages quoting a retired version of the site's own hard-stop language.
    const hub = read(HUB_PAGE).replace(/\s+/g, ' ');
    expect(hub).toContain(PERMIT_DISCLAIMER.lede.replace(/\s+/g, ' '));
    // The three bullets carry inline <strong> in the hub markup, so they are compared on the
    // tag-stripped text with ALL whitespace removed. Stripping a tag leaves a space behind, and
    // "purchase</strong>;" comes back as "purchase ;": that is a rendering artifact of the
    // comparison, not a difference in the copy, and matching on the letters is the only comparison
    // that is true of both surfaces. Every word and every mark of punctuation still has to match.
    const squeeze = (s: string): string => s.replace(/\s+/g, '');
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

  it('has the county template render the shared copy rather than a second copy of it', () => {
    const template = read(COUNTY_TEMPLATE);
    expect(template).toContain('PERMIT_DISCLAIMER.lede');
    expect(template).toContain('DELIVERY_ACCESS.clearance');
    expect(template).toContain('ASK_CHECKLIST');
    expect(template).toContain('export const prerender = true');
    // No HowTo: the guide branch of buildPageSchema emits howtoByTopic[topic] when a topic is
    // passed, and the permits HowTo is a general instruction set that has no business being
    // restated on 77 jurisdiction-specific URLs.
    expect(template).not.toContain('guideTopic');
    expect(template).not.toMatch(/topic:\s*'permits'/);
  });

  it('has the city template link its counties from the same records', () => {
    const template = read(CITY_TEMPLATE);
    expect(template).toContain('countiesForCity');
    expect(template).toContain('county.path');
  });
});

/* ------------------------------------------------------------------ tier 2: built output */

describe('built county permit pages', () => {
  it.skipIf(!hasDist)('one built page per record, and no orphans', () => {
    for (const county of permitCounties) {
      expect(
        existsSync(countyHtmlPath(county.stateSlug, county.slug)),
        `missing built page for ${county.path}`,
      ).toBe(true);
    }
    for (const entry of permitStates) {
      expect(
        existsSync(join(DIST, 'permits', entry.stateSlug, 'index.html')),
        `missing built state index for ${entry.path}`,
      ).toBe(true);
    }
  });

  it.skipIf(!hasDist)('no built county page states a determination in its visible text', () => {
    for (const county of permitCounties) {
      const findings = scanForDeterminations(
        visibleText(readFileSync(countyHtmlPath(county.stateSlug, county.slug), 'utf-8')),
      );
      expect(findings, `\n${county.path}\n${fmt('visible', findings)}`).toEqual([]);
    }
  });

  it.skipIf(!hasDist)('no built county page states a determination in its JSON-LD', () => {
    for (const county of permitCounties) {
      const html = readFileSync(countyHtmlPath(county.stateSlug, county.slug), 'utf-8');
      for (const value of jsonLdStrings(html)) {
        const findings = scanForDeterminations(value);
        expect(findings, `\n${county.path}\n${fmt('json-ld', findings)}`).toEqual([]);
      }
    }
  });

  it.skipIf(!hasDist)('every built county page carries the municipal carve-out', () => {
    // The sentence that keeps "where to start" from collapsing back into "who decides". It has to
    // be on all 77, not on the county-shaped ones only: an independent city and a five-borough
    // consolidated city need it as much as a township-zoned Ohio county does.
    for (const county of permitCounties) {
      const text = visibleText(readFileSync(countyHtmlPath(county.stateSlug, county.slug), 'utf-8'));
      expect(text, `${county.path} dropped the municipal carve-out`).toContain(MUNICIPAL_CARVE_OUT);
    }
  });

  it.skipIf(!hasDist)('tells a municipality reader to search the city site, not the county site', () => {
    // Nine records sit in no county this site names: Virginia's seven independent cities, New York
    // City and the City of Houston. "Search the county site" is a dead end on those pages.
    for (const county of permitCounties) {
      const text = visibleText(readFileSync(countyHtmlPath(county.stateSlug, county.slug), 'utf-8'));
      expect(text).toContain(`search the ${county.siteNoun} site for planning, zoning, or building`);
      if (county.kind === 'municipality') {
        expect(text, `${county.path} sends a municipality reader to a county site`).not.toContain(
          'search the county site',
        );
      }
    }
  });

  it.skipIf(!hasDist)('shows a note on every page that lists more than one office', () => {
    // The singular "the office below" against two office cards was the defect. Franklin County OH
    // and Cabell County WV are the pages where the city-versus-county split matters most.
    for (const county of permitCounties) {
      if (county.offices.length < 2) continue;
      const html = readFileSync(countyHtmlPath(county.stateSlug, county.slug), 'utf-8');
      expect(html, `${county.path} lists ${county.offices.length} offices with no note`).toContain(
        'county_scope_note',
      );
    }
    // And the two named pages really do have two offices, so this test cannot pass by vacuity.
    for (const key of ['ohio/franklin-county', 'west-virginia/cabell-county', 'new-york/new-york-city']) {
      expect(permitCountyByKey[key]?.offices.length).toBe(2);
    }
  });

  it.skipIf(!hasDist)('publishes no rules claim in an office-card label', () => {
    // Finding B: the City of Houston county label in cities.ts carries a parenthetical describing
    // Houston's development-rule regime. It is adjudicated in the HS_003 allowlist for that file
    // and is NOT carried onto a page whose H1 names Houston, because a card label is atomic.
    const houston = permitCountyByKey['texas/city-of-houston'];
    expect(houston).toBeDefined();
    expect(houston?.offices.every((o) => !o.scope)).toBe(true);
    const html = readFileSync(countyHtmlPath('texas', 'city-of-houston'), 'utf-8');
    expect(visibleText(html)).not.toContain('ordinance-based development rules');
    for (const county of permitCounties) {
      for (const office of county.offices) {
        expect(office.scope ?? '', `${county.path} renders a rules claim as a scope`).not.toMatch(
          /zoning|permit|ordinance|requirement/i,
        );
      }
    }
  });

  it.skipIf(!hasDist)('every built county page carries the buyer-responsibility sentence', () => {
    for (const county of permitCounties) {
      const text = visibleText(readFileSync(countyHtmlPath(county.stateSlug, county.slug), 'utf-8'));
      expect(text, `${county.path} dropped the buyer-responsibility sentence`).toContain(
        "buyer's responsibility",
      );
      expect(text, `${county.path} dropped the we-do-not-determine sentence`).toMatch(
        /do(?:es)? not determine, advise on, or guarantee permit/,
      );
    }
  });

  it.skipIf(!hasDist)('every built county page links every one of its government offices', () => {
    for (const county of permitCounties) {
      const html = readFileSync(countyHtmlPath(county.stateSlug, county.slug), 'utf-8');
      expect(county.offices.length).toBeGreaterThan(0);
      for (const office of county.offices) {
        const anchor = new RegExp(
          `<a href="${office.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*rel="[^"]*noopener`,
        );
        expect(anchor.test(html), `${county.path} lost its link to ${office.url}`).toBe(true);
      }
    }
  });

  it.skipIf(!hasDist)('every built county page links its city, its state index, permits, delivery and one quote CTA', () => {
    for (const county of permitCounties) {
      const html = readFileSync(countyHtmlPath(county.stateSlug, county.slug), 'utf-8');
      const body = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
      for (const city of county.cities) {
        expect(body, `${county.path} does not link ${city.path}`).toContain(`href="${city.path}"`);
      }
      expect(body).toContain(`href="/permits/${county.stateSlug}/"`);
      expect(body).toContain('href="/permits/"');
      expect(body).toContain('href="/delivery/"');
      // One quote CTA on the page, not three. The permit question is the reason the reader is here.
      expect(body.match(/href="\/quote\/"/g) ?? []).toHaveLength(1);
    }
  });

  it.skipIf(!hasDist)('emits no HowTo and no schema type that could assert a requirement', () => {
    const allowed = new Set([
      'Organization',
      'LocalBusiness',
      'WebSite',
      'Article',
      'FAQPage',
      'WebPage',
      'BreadcrumbList',
    ]);
    for (const county of permitCounties) {
      const html = readFileSync(countyHtmlPath(county.stateSlug, county.slug), 'utf-8');
      const graph = JSON.parse(
        (html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) ?? [])[1] ??
          'null',
      );
      const types = (graph['@graph'] as { '@type': string }[]).map((n) => n['@type']);
      expect(types).not.toContain('HowTo');
      for (const type of types) {
        expect(allowed.has(type), `${county.path} emits an unexpected ${type} node`).toBe(true);
      }
    }
  });

  it.skipIf(!hasDist)('every FAQPage question is visible on the page it is emitted on', () => {
    // The FAQPage is only honest where the reader sees the same pairs. QuickFacts renders the
    // first three, and these pages ship exactly three.
    for (const county of permitCounties) {
      const html = readFileSync(countyHtmlPath(county.stateSlug, county.slug), 'utf-8');
      const text = visibleText(html);
      const graph = JSON.parse(
        (html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) ?? [])[1] ??
          'null',
      );
      const faq = (graph['@graph'] as Record<string, unknown>[]).find(
        (n) => n['@type'] === 'FAQPage',
      );
      expect(faq, `${county.path} emits no FAQPage`).toBeDefined();
      const questions = (faq?.mainEntity as { name: string }[]) ?? [];
      expect(questions.length).toBeGreaterThan(0);
      for (const q of questions) {
        expect(text, `${county.path} emits an invisible FAQ question: ${q.name}`).toContain(q.name);
      }
    }
  });

  it.skipIf(!hasDist)('every built state index links every county it claims', () => {
    for (const entry of permitStates) {
      const html = readFileSync(join(DIST, 'permits', entry.stateSlug, 'index.html'), 'utf-8');
      for (const county of entry.counties) {
        expect(html, `${entry.path} does not link ${county.path}`).toContain(
          `href="${county.path}"`,
        );
      }
      const findings = scanForDeterminations(visibleText(html));
      expect(findings, `\n${entry.path}\n${fmt('visible', findings)}`).toEqual([]);
    }
  });

  it.skipIf(!hasDist)('the permits hub links every state index', () => {
    const html = readFileSync(join(DIST, 'permits', 'index.html'), 'utf-8');
    for (const entry of permitStates) {
      expect(html, `the permits hub does not link ${entry.path}`).toContain(
        `href="${entry.path}"`,
      );
    }
  });

  it.skipIf(!hasDist)('every built city page links the county pages that serve it', () => {
    // The defect this fixes was measured: before T-215 the city pages named these offices, linked
    // them off site, and carried ZERO contextual links into /permits/ anywhere in the body.
    for (const c of cities) {
      const path = join(DIST, 'locations', c.stateSlug, c.slug, 'index.html');
      if (!existsSync(path)) continue;
      const html = readFileSync(path, 'utf-8');
      const counties = countiesForCity(c.slug);
      expect(counties.length).toBeGreaterThan(0);
      for (const county of counties) {
        expect(html, `${c.slug} does not link ${county.path}`).toContain(`href="${county.path}"`);
      }
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
