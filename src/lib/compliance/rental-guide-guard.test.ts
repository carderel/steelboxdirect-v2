/**
 * Diff-checkable guards for /container-rental-guide/.
 *
 * These encode the four pre-build SEO decisions and the cannibalization controls that a future
 * editor could otherwise undo without noticing: the slug, the schema kind, explicit dates, no
 * rent-to-own wording in the ranking surfaces, no rent-to-own link in the hero, and no Steel Box
 * Direct price anywhere on a page whose whole argument is that it is not selling to you here.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const REPO_ROOT = import.meta.dirname
  ? join(import.meta.dirname, '..', '..', '..')
  : process.cwd();
const PAGE = join(REPO_ROOT, 'src/pages/container-rental-guide/index.astro');

describe('/container-rental-guide/ page guards', () => {
  const exists = existsSync(PAGE);
  const src = exists ? readFileSync(PAGE, 'utf8') : '';
  const frontmatter = src.slice(0, src.indexOf('\n---', 4));
  const body = src.slice(src.indexOf('\n---', 4));

  it('the page exists at the /container-rental-guide/ route', () => {
    expect(exists).toBe(true);
  });

  it('uses the container-rental-guide slug and never the retired /container-rental/ slug', () => {
    expect(src).not.toContain('/container-rental/');
    expect(src).toContain("{ name: 'Container Rental Guide' }");
    expect(src).not.toContain("{ name: 'Container Rental' }");
  });

  it('breadcrumbs are two levels with no pathless Guides crumb', () => {
    const crumbs = src.match(/const crumbs = \[(.*?)\];/s)?.[1] ?? '';
    expect(crumbs).toContain("name: 'Home', path: '/'");
    expect(crumbs).toContain("name: 'Container Rental Guide'");
    expect(crumbs).not.toContain("'Guides'");
    expect((crumbs.match(/name:/g) ?? []).length).toBe(2);
  });

  it('passes datePublished and dateModified explicitly (buildPageSchema defaults to 2026-03-10)', () => {
    expect(src).toMatch(/datePublished="2026-08-14"/);
    expect(src).toMatch(/dateModified="2026-08-14"/);
  });

  it("emits kind: 'guide' with topic omitted, and never a Service node", () => {
    expect(src).toContain("kind: 'guide'");
    expect(src).not.toMatch(/\btopic:/);
    expect(src).not.toMatch(/serviceType/);
    expect(src).not.toContain("kind: 'useCase'");
    expect(src).not.toContain("guideTopic");
  });

  it('keeps rent-to-own out of the title prop, the schema title and the h1', () => {
    const titleProp = src.match(/\n\s+title="([^"]+)"/)?.[1] ?? '';
    const schemaTitle = src.match(/\btitle: '([^']+)'/)?.[1] ?? '';
    const h1 = src.match(/<h1[\s\S]*?<\/h1>/)?.[0] ?? '';
    expect(titleProp.length).toBeGreaterThan(10);
    expect(schemaTitle.length).toBeGreaterThan(10);
    expect(h1.length).toBeGreaterThan(10);
    for (const surface of [titleProp, schemaTitle, h1]) {
      expect(surface).not.toMatch(/rent[- ]to[- ]own/i);
    }
  });

  it('the meta description leads with the non-rental fact and names the states early', () => {
    const desc = src.match(/\n\s+description="([^"]+)"/)?.[1] ?? '';
    expect(desc.length).toBeGreaterThan(130);
    expect(desc.length).toBeLessThan(165);
    expect(desc).toMatch(/does not rent/i);
    expect(desc.indexOf('Ohio')).toBeLessThan(90);
  });

  it('ASYMMETRIC LINKING: two ownership-anchored links to /rent-to-own/, never from the hero', () => {
    const rtoLinks = (body.match(/href="\/rent-to-own\/"/g) ?? []).length;
    expect(rtoLinks).toBe(2);
    const heroStart = body.indexOf('<!-- 1. HERO');
    const heroEnd = body.indexOf('<!-- 2. THE DURATION FORK');
    expect(heroStart).toBeGreaterThan(-1);
    expect(heroEnd).toBeGreaterThan(heroStart);
    expect(body.slice(heroStart, heroEnd)).not.toContain('/rent-to-own/');
  });

  it('NO STEEL BOX DIRECT PRICE: every dollar figure is an attributed third-party rate', () => {
    const amounts = [...src.matchAll(/\$(\d[\d,]*)/g)].map((m) => m[1]);
    const allowed = new Set(['129', '159', '50', '3']);
    expect(amounts.filter((a) => !allowed.has(a))).toEqual([]);
    expect(src).not.toContain("from '../../data/pricing'");
    expect(src).not.toMatch(/average starting price/i);
  });

  it('the calculator seeds EMPTY, with the no-JS paper fallback intact', () => {
    expect(src).toMatch(/id="calc-rate"/);
    expect(src).toMatch(/id="calc-months"/);
    // No value= seeding on either input, and no pre-computed total in static HTML.
    const rateInput = src.match(/<input[^>]*id="calc-rate"[^>]*>/)?.[0] ?? '';
    const monthsInput = src.match(/<input[^>]*id="calc-months"[^>]*>/)?.[0] ?? '';
    expect(rateInput).not.toMatch(/\bvalue=/);
    expect(monthsInput).not.toMatch(/\bvalue=/);
    expect(src).not.toMatch(/paid in total<\/p>/);
    expect(src).toContain('calc-nojs');
  });

  it('derives the provider counts and the verification date from the data module', () => {
    expect(frontmatter).toContain("from '../../data/rentalProviders'");
    expect(body).toContain('{conexCountWord}');
    expect(body).toContain('{VERIFIED_LABEL}');
    // No hardcoded count words in the three places the mockup hardcoded "three".
    expect(body).not.toMatch(/verify three companies/i);
    expect(body).not.toMatch(/three names long/i);
  });

  it('sources the non-rental fact from the shared stance module', () => {
    expect(frontmatter).toContain("composeRentalStance");
    expect(frontmatter).toContain("from '../../data/rentalStance'");
  });

  it('uses astro:assets with imports from src/assets/photos, not inline data URIs', () => {
    expect(src).toContain("import { Image } from 'astro:assets'");
    expect(src).toContain("../../assets/photos/");
    expect(src).not.toContain('data:image/');
  });

  it('carries no em dash or en dash (HS-OUT-001)', () => {
    expect(src).not.toMatch(/[\u2014\u2013]/);
  });

  it('is a plain static page with no prerender directive', () => {
    expect(src).not.toContain('export const prerender');
  });
});
