/**
 * INSPECTOR DIRECTORY INTEGRITY GUARD
 * ===================================
 *
 * Two suites in the cities.test.ts style. The first pins the ground truth of the dataset
 * against the owner-verified 2026-08-25 IICL enumeration (106 credential rows, 98 unique US
 * inspectors) and its transcription rules: verbatim rows, normalized state codes, no dollar
 * figures, and NO republication of the IICL's internal rating column.
 *
 * The second guards the page: every count /find-a-container-inspector/ states must derive
 * from this module rather than being hand-typed, the retrieval date and the IICL attribution
 * links must render from the module's constants, no listed name or company may be hand-typed
 * into the page (which is what keeps every company, competitor included, rendered identically
 * by the same loop), and the page carries zero dollar signs.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  inspectorRows,
  inspectors,
  inspectorCount,
  credentialCount,
  dryVanInspectorCount,
  chassisInspectorCount,
  reeferInspectorCount,
  inspectorsByState,
  stateCount,
  homeRegionInspectorCount,
  HOME_REGION_STATES,
  RETRIEVED_DATE,
  RETRIEVED_LABEL,
  SOURCE_NAME,
  IICL_DIRECTORY_URLS,
} from './inspectors';

const REPO_ROOT = import.meta.dirname
  ? join(import.meta.dirname, '..', '..')
  : process.cwd();

const PAGE_PATH = join(REPO_ROOT, 'src/pages/find-a-container-inspector/index.astro');
const page = readFileSync(PAGE_PATH, 'utf8');
// Counts are scanned in everything BEFORE the <style> block, because CSS is full of numbers
// (padding, font sizes) that are not claims about the dataset. HTML comments are stripped for
// the same reason: a numbered section marker is not a claim either.
const pageContent = page
  .slice(0, page.indexOf('<style>'))
  .replace(/<!--[\s\S]*?-->/g, '');

describe('inspectors ground-truth dataset integrity', () => {
  it('holds the owner-verified 2026-08-25 enumeration: 106 credential rows, 98 unique inspectors', () => {
    expect(inspectorRows).toHaveLength(106);
    expect(inspectors).toHaveLength(98);
    expect(new Set(inspectors.map((i) => i.inspectionId)).size).toBe(98);
  });

  it('splits into the three credentials the three IICL searches returned', () => {
    expect(dryVanInspectorCount).toBe(55);
    expect(chassisInspectorCount).toBe(44);
    expect(reeferInspectorCount).toBe(7);
    expect(dryVanInspectorCount + chassisInspectorCount + reeferInspectorCount)
      .toBe(credentialCount);
    expect(credentialCount).toBe(inspectorRows.length);
    expect(inspectorCount).toBe(inspectors.length);
  });

  it('NEVER republishes the IICL internal rating column', () => {
    for (const row of inspectorRows) {
      expect(Object.keys(row)).not.toContain('rating');
    }
    expect(JSON.stringify(inspectorRows)).not.toMatch(/"rating"/);
  });

  it('normalizes exactly two things: trimmed fields and an uppercase two-letter state', () => {
    for (const row of inspectorRows) {
      expect(row.state).toMatch(/^[A-Z]{2}$/);
      for (const v of [row.company, row.name, row.inspectionId, row.city]) {
        expect(v).toBe(v.trim());
      }
    }
  });

  it('TRANSCRIBED VERBATIM: directory oddities survive uncorrected', () => {
    // These are the source rows as the IICL publishes them. Correcting them here would turn a
    // citation into an invention; the row is the citation.
    const cities = inspectorRows.map((r) => r.city);
    expect(cities).toContain('Southborugh');            // MA, as listed
    expect(cities).toContain('Alpine,ca');              // CA, as listed
    expect(cities).toContain('Carson ca.');             // CA, as listed
    expect(cities).toContain('ConGlobal Industries');   // LA, as listed
    expect(inspectorRows.map((r) => r.name)).toContain('Kenenth Hoppe'); // as listed
  });

  it('merges multi-credential inspectors consistently: one id, one person, one location', () => {
    const byId = new Map<string, typeof inspectorRows>();
    for (const row of inspectorRows) {
      byId.set(row.inspectionId, [...(byId.get(row.inspectionId) ?? []), row]);
    }
    for (const [id, rows] of byId) {
      expect(new Set(rows.map((r) => r.name)).size, `id ${id} names disagree`).toBe(1);
      expect(new Set(rows.map((r) => r.company)).size, `id ${id} companies disagree`).toBe(1);
      expect(new Set(rows.map((r) => r.city)).size, `id ${id} cities disagree`).toBe(1);
      expect(new Set(rows.map((r) => r.state)).size, `id ${id} states disagree`).toBe(1);
    }
    const merged = inspectors.find((i) => i.credentials.length > 1);
    expect(merged).toBeDefined();
  });

  it('state grouping is alphabetical, complete, and every valid-through year parses sanely', () => {
    const states = inspectorsByState.map((g) => g.state);
    expect(states).toEqual([...states].sort());
    expect(stateCount).toBe(states.length);
    expect(inspectorsByState.reduce((n, g) => n + g.inspectors.length, 0)).toBe(inspectorCount);
    for (const ins of inspectors) {
      for (const c of ins.credentials) {
        expect(c.validThroughYear).toBeGreaterThanOrEqual(2026);
        expect(c.validThroughYear).toBeLessThan(2040);
      }
    }
  });

  it('the home region derives from OH/IN/KY and nothing else', () => {
    expect([...HOME_REGION_STATES]).toEqual(['OH', 'IN', 'KY']);
    const derived = inspectors.filter((i) =>
      (HOME_REGION_STATES as readonly string[]).includes(i.state)).length;
    expect(homeRegionInspectorCount).toBe(derived);
    expect(homeRegionInspectorCount).toBeGreaterThan(0);
  });

  it('contains NO dollar amounts (hard stop) and no em/en dash (HS-OUT-001)', () => {
    const blob = JSON.stringify(inspectorRows);
    expect(blob).not.toMatch(/\$\s*\d/);
    // Escapes, not literal dash characters, so the dash guard's own scan stays clean here.
    expect(blob).not.toMatch(/[\u2014\u2013]/);
  });

  it('carries the attribution constants the page is obligated to render', () => {
    expect(RETRIEVED_DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(SOURCE_NAME).toContain('IICL');
    expect(IICL_DIRECTORY_URLS.dryVan)
      .toBe('https://iicl.org/find-a-certified-inspector/dry-van-container/');
    expect(IICL_DIRECTORY_URLS.chassis)
      .toBe('https://iicl.org/find-a-certified-inspector/chassis/');
    expect(IICL_DIRECTORY_URLS.reefer)
      .toBe('https://iicl.org/find-a-certified-inspector/refrigerated-containers/');
  });
});

describe('/find-a-container-inspector/ page integrity guard', () => {
  it('every count derives from inspectors.ts: no derived count appears as a literal', () => {
    // If the quarterly re-verification changes the data, a hand-typed number would silently go
    // stale. The page must interpolate, so the literal spellings of the CURRENT derived counts
    // must not appear anywhere outside the style block.
    const derived = new Set([
      inspectorCount, credentialCount, dryVanInspectorCount, chassisInspectorCount,
      reeferInspectorCount, stateCount, homeRegionInspectorCount, 50 - stateCount,
    ]);
    for (const n of derived) {
      expect(pageContent, `literal count ${n} is hand-typed in the page`)
        .not.toMatch(new RegExp(`\\b${n}\\b`));
    }
    // And the interpolations it must use instead are actually there.
    for (const token of [
      'inspectorCount', 'credentialCount', 'dryVanInspectorCount', 'chassisInspectorCount',
      'reeferInspectorCount', 'stateCount', 'homeRegionInspectorCount',
    ]) {
      expect(pageContent).toContain(token);
    }
  });

  it('renders the retrieval date from the module, never hand-typed', () => {
    expect(pageContent).toContain('RETRIEVED_LABEL');
    expect(pageContent).not.toContain(RETRIEVED_LABEL);
    expect(pageContent).not.toContain(RETRIEVED_DATE.split('-').reverse().join('/'));
  });

  it('renders the attribution block: source name, the three IICL deep links, the correction contact', () => {
    expect(pageContent).toContain('SOURCE_NAME');
    expect(pageContent).toContain('IICL_DIRECTORY_URLS.dryVan');
    expect(pageContent).toContain('IICL_DIRECTORY_URLS.chassis');
    expect(pageContent).toContain('IICL_DIRECTORY_URLS.reefer');
    expect(pageContent).toContain('Verified quarterly');
    expect(pageContent).toContain('support@steelboxdirect.com');
  });

  it('hand-types NO listed name or company: every row renders through the one loop', () => {
    // This is also what keeps the no-editorializing rule structural: a company the owner
    // competes with is rendered by the same map() as everyone else, or not at all.
    for (const ins of inspectors) {
      expect(pageContent, `inspector name ${ins.name} is hand-typed`).not.toContain(ins.name);
      if (ins.company !== '') {
        expect(pageContent, `company ${ins.company} is hand-typed`).not.toContain(ins.company);
      }
    }
    expect(pageContent).toContain('inspectorsByState.map(');
  });

  it('contains NO dollar signs outside template interpolation (hard stop)', () => {
    // `${` is TypeScript interpolation; any other $ is a price and this page must carry none.
    expect(page).not.toMatch(/\$(?!\{)/);
  });

  it('prerenders, breadcrumbs Home > Guides > this page, guide schema kind', () => {
    expect(pageContent).toContain('export const prerender = true');
    expect(pageContent).toContain("name: 'Home', path: '/'");
    expect(pageContent).toContain("name: 'Guides', path: '/shipping-container-guides/'");
    expect(pageContent).toContain("kind: 'guide'");
    expect(pageContent).not.toMatch(/'Person'|"Person"/);
  });
});
