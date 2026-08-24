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
import { guideListItems } from '../../data/guides';

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

describe('cannibalization controls: link direction between the rental pages', () => {
  const read = (p: string): string => readFileSync(join(REPO_ROOT, p), 'utf8');
  const rentToOwn = read('src/pages/rent-to-own/index.astro');
  const productHub = read('src/pages/shipping-containers-for-sale/index.astro');
  const rentalGuide = read('src/pages/container-rental-guide/index.astro');
  const rentVsBuy = read('src/pages/container-rent-vs-buy-calculator/index.astro');
  const hub = read('src/pages/shipping-container-guides/index.astro');
  const nav = read('src/components/SiteNav.astro');
  const footer = read('src/components/SiteFooter.astro');
  const llms = read('public/llms.txt');
  const flatten = (s: string): string => s.replace(/\s+/g, ' ');

  it('/rent-to-own/ sends EXACTLY ONE deep link to the guide, inside an html twin', () => {
    const hits = (rentToOwn.match(/\/container-rental-guide\//g) ?? []).length;
    expect(hits).toBe(1);
    const contextHtml = rentToOwn.match(/contextHtml:\s*\n?([\s\S]*?)\n\s*\}\),/)?.[1] ?? '';
    expect(contextHtml).toContain('/container-rental-guide/');
  });

  it('the inbound anchor from /rent-to-own/ is rental-worded, not brand-worded', () => {
    const anchor = rentToOwn.match(/<a href="\/container-rental-guide\/">([^<]+)<\/a>/)?.[1] ?? '';
    expect(anchor.length).toBeGreaterThan(8);
    expect(anchor).toMatch(/rent/i);
    expect(anchor).not.toMatch(/steel box direct/i);
  });

  it('the product hub sends exactly one link to the guide, from its rental FAQ', () => {
    expect((productHub.match(/\/container-rental-guide\//g) ?? []).length).toBe(1);
    expect(productHub).toMatch(/<a href="\/container-rental-guide\/">/);
  });

  it('the guide links back to the hub exactly once', () => {
    expect((rentalGuide.match(/\/shipping-container-guides\//g) ?? []).length).toBe(1);
  });

  it('NO TOP-LEVEL RENTAL TAB: the guide lives in the Guides dropdown only', () => {
    expect(nav).not.toMatch(/>\s*Rental\s*</);
    expect(nav).toContain('/container-rental-guide/');
    expect((nav.match(/\/container-rental-guide\//g) ?? []).length).toBe(1);
  });

  it('the nav Guides trigger points at the hub, not at /size/', () => {
    const trigger = nav.match(/<a href="([^"]+)" class="nav-gd-trigger">/)?.[1] ?? '';
    expect(trigger).toBe('/shipping-container-guides/');
  });

  it('the footer carries both pages and leaves The Five intact', () => {
    expect(footer).toContain('/shipping-container-guides/');
    expect(footer).toContain('/container-rental-guide/');
    expect(footer).toContain('<h5>The Five</h5>');
    const five = footer.match(/<h5>The Five<\/h5>([\s\S]*?)<\/div>/)?.[1] ?? '';
    expect((five.match(/<a /g) ?? []).length).toBe(5);
  });

  it('llms.txt lists both pages, and says plainly that we do not rent', () => {
    expect(llms).toContain('https://steelboxdirect.com/container-rental-guide/');
    expect(llms).toContain('https://steelboxdirect.com/shipping-container-guides/');
    const rentalLine = llms.split('\n').find((l) => l.includes('/container-rental-guide/')) ?? '';
    expect(rentalLine).toMatch(/does not rent/i);
  });

  it('the guide signposts the rent vs buy calculator exactly once, and never from the hero', () => {
    const hits = (rentalGuide.match(/\/container-rent-vs-buy-calculator\//g) ?? []).length;
    expect(hits).toBe(1);
    const heroStart = rentalGuide.indexOf('<!-- 1. HERO');
    const heroEnd = rentalGuide.indexOf('<!-- 2. THE DURATION FORK');
    expect(heroStart).toBeGreaterThan(-1);
    expect(heroEnd).toBeGreaterThan(heroStart);
    expect(rentalGuide.slice(heroStart, heroEnd))
      .not.toContain('/container-rent-vs-buy-calculator/');
  });

  it('REFRAME NOT REMOVAL: the guide still refuses to price its own arithmetic, and now says where the priced version lives', () => {
    // The refusal is the credibility of the whole calculator block. The signpost was added beside
    // it, not instead of it, so the original closing sentence must survive verbatim.
    expect(flatten(rentalGuide)).toContain(
      'And it is not a comparison against any price of ours, because putting one here would make '
      + 'this a sales pitch instead of arithmetic.',
    );
    const anchor = rentalGuide
      .match(/<a href="\/container-rent-vs-buy-calculator\/">([^<]+)<\/a>/)?.[1] ?? '';
    expect(flatten(anchor).trim()).toMatch(/rent vs buy calculator/);
  });

  it('OWNER OVERRIDE: the calculator sits in the nav Tools dropdown, beside the other calculator', () => {
    // A calculator filed under Guides is a category error, and the Tools dropdown already exists,
    // so nothing new is being exposed at the top level. Codes match tools.ts.
    expect((nav.match(/\/container-rent-vs-buy-calculator\//g) ?? []).length).toBe(1);
    const toolsStart = nav.indexOf('nav-tl-drop');
    const toolsEnd = nav.indexOf('nav-loc', toolsStart);
    expect(toolsStart).toBeGreaterThan(-1);
    expect(toolsEnd).toBeGreaterThan(toolsStart);
    expect(nav.slice(toolsStart, toolsEnd)).toContain('/container-rent-vs-buy-calculator/');
    const guidesStart = nav.indexOf('nav-gd-drop');
    const guidesEnd = nav.indexOf('nav-blog-link');
    expect(nav.slice(guidesStart, guidesEnd))
      .not.toContain('/container-rent-vs-buy-calculator/');
  });

  it('footer and llms.txt carry the calculator, with the non-rental fact inside the llms entry', () => {
    expect(footer).toContain('/container-rent-vs-buy-calculator/');
    expect(llms).toContain('https://steelboxdirect.com/container-rent-vs-buy-calculator/');
    // llms.txt is read stripped of all other site context, so the fact has to live in the entry.
    const line = llms.split('\n')
      .find((l) => l.includes('/container-rent-vs-buy-calculator/')) ?? '';
    expect(line).toMatch(/does not rent/i);
  });

  it('CONDITION 2 VALVE: the calculator hands rental intent back to the guide', () => {
    expect((rentVsBuy.match(/\/container-rental-guide\//g) ?? []).length)
      .toBeGreaterThanOrEqual(2);
    expect((rentVsBuy.match(/\/container-rental-guide\/#shape/g) ?? []).length).toBe(1);
  });

  it('the hub Tools strip leaves the hub a collection of exactly nine guides', () => {
    expect(guideListItems).toHaveLength(9);
    expect(hub).toContain("from '../../data/tools'");
    expect(hub).toContain('tools.map(');
    expect(hub).toContain('items: guideListItems');
    expect(hub).toContain('description={metaDescription}');
    expect(hub).toContain('${guideTitleCountWord} shipping container guides');
  });

  it('NO CROSS-CANONICAL: neither page overrides its canonical', () => {
    for (const src of [rentalGuide, read('src/pages/shipping-container-guides/index.astro')]) {
      expect(src).not.toMatch(/rel="canonical"/);
      expect(src).not.toMatch(/canonical=/);
    }
  });
});
