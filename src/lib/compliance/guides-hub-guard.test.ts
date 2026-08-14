/**
 * Diff-checkable guards for /shipping-container-guides/.
 *
 * The FAQ set is the sharp edge here. It feeds FAQPage JSON-LD, where the surrounding page copy
 * does not travel with an answer, so the "all four names are used interchangeably" claim about
 * rent-to-own, lease-to-own, rent-to-buy and lease-to-buy must not be in it: those terms can
 * carry distinct meanings under state consumer lease statutes. The glossary keeps the same
 * observation, because the glossary is not schema-bound.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const REPO_ROOT = import.meta.dirname
  ? join(import.meta.dirname, '..', '..', '..')
  : process.cwd();
const PAGE = join(REPO_ROOT, 'src/pages/shipping-container-guides/index.astro');

describe('/shipping-container-guides/ hub guards', () => {
  const exists = existsSync(PAGE);
  const src = exists ? readFileSync(PAGE, 'utf8') : '';
  const frontmatter = src.slice(0, src.indexOf('\n---', 4));
  const body = src.slice(src.indexOf('\n---', 4));

  it('the page exists at the /shipping-container-guides/ route', () => {
    expect(exists).toBe(true);
  });

  it("emits kind: 'collection', matching /locations/ and /blog/", () => {
    expect(src).toContain("kind: 'collection'");
    expect(src).not.toContain("kind: 'guide'");
    expect(src).not.toContain("kind: 'useCase'");
  });

  it('takes its ItemList items from the guides catalogue, never a hand-written array', () => {
    expect(src).toContain('items: guideListItems');
    expect(frontmatter).toContain("from '../../data/guides'");
  });

  it('breadcrumbs are two levels: Home, then a pathless Guides crumb', () => {
    const crumbs = src.match(/const crumbs = \[(.*?)\];/s)?.[1] ?? '';
    expect(crumbs).toContain("name: 'Home', path: '/'");
    expect(crumbs).toContain("name: 'Guides'");
    expect((crumbs.match(/name:/g) ?? []).length).toBe(2);
  });

  it('passes datePublished and dateModified explicitly', () => {
    expect(src).toMatch(/datePublished="2026-08-14"/);
    expect(src).toMatch(/dateModified="2026-08-14"/);
  });

  it('carries exactly three FAQs', () => {
    expect((frontmatter.match(/^\s+q: /gm) ?? []).length).toBe(3);
  });

  it('the interchangeable-terms claim is OUT of the FAQ set and still IN the glossary', () => {
    expect(frontmatter).not.toMatch(/interchangeab/i);
    expect(frontmatter).not.toMatch(/lease-to-buy/i);
    expect(body).toMatch(/interchangeab/i);
  });

  it('derives the guide count instead of hardcoding a word', () => {
    expect(body).not.toMatch(/\bEight guides\b/);
    expect(body).not.toMatch(/\bSeven guides\b/);
    expect(body).toContain('guideTitleCountWord');
    expect(body).toContain('guideCountWord');
  });

  it('the title is short enough not to truncate, and the enumeration lives in the description', () => {
    const title = src.match(/\n\s+title="([^"]+)"/)?.[1] ?? '';
    expect(title.length).toBeGreaterThan(45);
    expect(title.length).toBeLessThanOrEqual(60);

    // The description is composed from the guide count, so resolve the interpolation before
    // measuring it. The two source fragments are joined the way the template literal joins them.
    const raw = frontmatter.match(/const metaDescription =\s*([\s\S]*?);\n/)?.[1] ?? '';
    const desc = raw
      .replace(/\$\{guideTitleCountWord\}/g, 'Eight')
      .split('\n')
      .map((line) => line.trim().replace(/^\+\s*/, ''))
      .join('')
      .replace(/^[`']|[`']$/g, '')
      .replace(/[`']\s*[`']/g, '');
    expect(desc.length).toBeGreaterThan(130);
    expect(desc.length).toBeLessThan(165);
    expect(desc).toMatch(/^Eight shipping container guides/);
    expect(desc).toMatch(/size/i);
    expect(desc).toMatch(/permits/i);
    // The description prop must reference the composed constant, never a hardcoded count.
    expect(src).toContain('description={metaDescription}');
  });

  it('routes to the rental guide at its real slug', () => {
    expect(src).not.toContain('/container-rental/');
    expect(src).not.toContain('is-pending');
    expect(src).not.toContain('pending-badge');
  });

  it('uses astro:assets with imports from src/assets/photos, not inline data URIs', () => {
    expect(src).toContain("import { Image } from 'astro:assets'");
    expect(src).toContain('../../assets/photos/');
    expect(src).not.toContain('data:image/');
  });

  it('carries no em dash or en dash (HS-OUT-001)', () => {
    expect(src).not.toMatch(/[\u2014\u2013]/);
  });

  it('is a plain static page with no prerender directive', () => {
    expect(src).not.toContain('export const prerender');
  });
});
