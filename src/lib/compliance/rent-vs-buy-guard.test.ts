/**
 * Diff-checkable guards for /container-rent-vs-buy-calculator/.
 *
 * These encode the decisions the page embodies that a later editor could undo without noticing:
 * the slug and the two slugs that were permanently rejected, the schema kind with `topic` left
 * off, explicit dates, the locked title and description, no rent-to-own wording in the ranking
 * surfaces, no hardcoded Steel Box Direct price or as-of label, the disclaimer sitting adjacent to
 * every figure, six inputs that all ship empty, the no-JS fallback and the author-level [hidden]
 * rule the four result slots depend on, the live region, the delivery asymmetry, the composed
 * rental stance, four real image assets instead of inline data URIs, and the terminology this URL
 * owns: break-even, never "crossover".
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pricing, formatPrice, type Pricing } from '../../data/pricing';

const REPO_ROOT = import.meta.dirname
  ? join(import.meta.dirname, '..', '..', '..')
  : process.cwd();
const PAGE = join(REPO_ROOT, 'src/pages/container-rent-vs-buy-calculator/index.astro');

const LOCKED_TITLE = 'Shipping Container Rent vs Buy Calculator | Steel Box Direct';
const STANCE_QUESTION = 'If you do not rent containers, why does this calculator price a rental?';
const CANONICAL_FACT_LITERAL = 'Steel Box Direct does not rent shipping containers.';
// HS-OUT-001. Written as escapes, never as the literal characters, so this file cannot contain
// the thing it forbids.
const DASHES = /[\u2014\u2013]/;

describe('/container-rent-vs-buy-calculator/ page guards', () => {
  const exists = existsSync(PAGE);
  const src = exists ? readFileSync(PAGE, 'utf8') : '';
  const frontmatter = src.slice(0, src.indexOf('\n---', 4));
  const body = src.slice(src.indexOf('\n---', 4));
  const styleBlock = src.slice(src.lastIndexOf('<style>'));
  const nojs = body.slice(body.indexOf('class="calc-nojs"'), body.indexOf('class="calc-js"'));

  it('the page exists at the /container-rent-vs-buy-calculator/ route', () => {
    expect(exists).toBe(true);
  });

  it('never uses either of the two permanently rejected slugs', () => {
    expect(src).not.toContain('/container-rental-calculator/');
    expect(src).not.toContain('/rental-cost-calculator/');
  });

  it('breadcrumbs are two levels with no pathless Guides crumb', () => {
    const crumbs = src.match(/const crumbs = \[(.*?)\];/s)?.[1] ?? '';
    expect(crumbs).toContain("name: 'Home', path: '/'");
    expect(crumbs).toContain("name: 'Rent vs Buy Calculator'");
    expect(crumbs).not.toContain("'Guides'");
    expect((crumbs.match(/name:/g) ?? []).length).toBe(2);
  });

  it('passes explicit dates, so the Article node never falls back to the 2026-03-10 default', () => {
    expect(src).toContain('datePublished="2026-08-17"');
    expect(src).toContain('dateModified="2026-08-17"');
  });

  it("uses kind: 'guide' with topic omitted, and neither useCase nor excluded", () => {
    expect(src).toContain("kind: 'guide'");
    expect(src).not.toMatch(/\btopic:/);
    expect(src).not.toContain('serviceType');
    expect(src).not.toContain("kind: 'useCase'");
    expect(src).not.toContain("kind: 'excluded'");
  });

  it('carries the locked title and a meta description inside the truncation-safe range', () => {
    expect(src).toContain(`title="${LOCKED_TITLE}"`);
    const desc = src.match(/\n  description="([^"]+)"/)?.[1] ?? '';
    expect(desc.length).toBeGreaterThan(130);
    expect(desc.length).toBeLessThan(164);
    expect(desc).toMatch(/break-even|costs less/);
  });

  it('keeps rent-to-own out of the title, the schema title and the H1', () => {
    const schemaTitle = src.match(/kind: 'guide',\s*\n\s*title: '([^']+)'/)?.[1] ?? '';
    const h1 = src.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '';
    expect(schemaTitle.length).toBeGreaterThan(10);
    for (const surface of [LOCKED_TITLE, schemaTitle, h1]) {
      expect(surface).not.toMatch(/rent to own/i);
      expect(surface).not.toMatch(/rent-to-own/i);
    }
    expect(h1).toContain('break-even');
  });

  it('says break-even and never "crossover", in any casing', () => {
    expect(src).not.toMatch(/crossover/i);
  });

  it('holds no hardcoded Steel Box Direct price: every figure comes from pricing.ts', () => {
    expect(frontmatter).toContain("from '../../data/pricing'");
    for (const key of Object.keys(pricing) as (keyof Pricing)[]) {
      if (key === 'asOf') continue;
      expect(src).not.toContain(formatPrice(pricing[key].price));
      expect(src).not.toContain(String(pricing[key].price));
    }
    // The only dollar literals allowed are the invented no-JS worked example and the $0 slot
    // placeholders in the results ledger.
    //
    // WHY THE EXAMPLE FIGURES LOOK ODD. The three prices above are derived from the daily metro
    // feed and move without anybody editing this page, so an example figure that a derived price
    // can ever equal turns an ordinary price move into a failure of the loop above. The example was
    // 200 / 2000 / 150 and the second of those became reachable: a derived national figure of 2000
    // formats to the same literal. Both properties below are structural, not lucky, and both come
    // from bounds asserted in geoPricing.test.ts, where every figure is a whole multiple of ten
    // between 1200 and 6000. The purchase example ends in a digit other than zero, so no rounded
    // figure can ever equal it. The fee and rate examples sit below the 1200 floor, so no delivered
    // figure can reach them. Restate the sum however you like, but keep those two properties.
    const allowed = new Set(['$225', '$2,475', '$150', '$0']);
    for (const found of src.match(/\$[0-9](?:[0-9,]*[0-9])?/g) ?? []) {
      expect(allowed, `unexpected dollar literal ${found}`).toContain(found);
    }
    for (const example of ['$225', '$2,475', '$150']) {
      expect(nojs, `${example} belongs in the no-JS worked example`).toContain(example);
    }
    // The properties themselves, asserted rather than trusted to the comment above, so a later edit
    // that reintroduces a collidable figure fails here with the reason attached.
    for (const example of ['225', '2475']) {
      expect(
        Number(example) % 10 !== 0 || Number(example) < 1200,
        `the ${example} example figure is a roundable in-bounds value and can collide with a derived price`,
      ).toBe(true);
    }
  });

  it('dates the QuickFacts cell as an effective date and never as a verification date', () => {
    // asOf is the date the figures last CHANGED, not the date they were last checked, and the
    // verification date is deliberately unrendered anywhere on the site. A cell reading Prices
    // confirmed would assert the one thing that value is not. Wording matches the city pages.
    expect(src).toContain("{ k: 'Prices in effect since', v: asOfLabel }");
    expect(src).not.toContain('Prices confirmed');
    expect(src).not.toMatch(/verified/i);
  });

  it('holds no hardcoded as-of label: the dated claim derives from pricing.ts', () => {
    expect(src).not.toContain('July 2026');
    expect((src.match(/\{asOfLabel\}/g) ?? []).length).toBeGreaterThanOrEqual(3);
  });

  it('puts the approved disclaimer adjacent to every displayed figure', () => {
    const discs = body.match(/<p class="price-disc"[^>]*>[\s\S]*?<\/p>/g) ?? [];
    expect(discs.length).toBeGreaterThanOrEqual(3);
    for (const disc of discs) {
      expect(disc).toContain('not quotes');
      expect(disc).toContain('{asOfLabel}');
    }
  });

  it('derives the seed options and FAQ 8 from pricing.ts keys, not a hand-written list', () => {
    expect(frontmatter).toContain('Object.keys(pricing)');
    // A key added by a pricing.ts change still renders a correct option and a true sentence.
    expect(frontmatter).toContain('?? pricing[k].label');
    expect(frontmatter).toContain('sizeSeeds.map(');
    expect(frontmatter).toContain('${seedSentence}');
    expect(body).toContain('sizeSeeds.map(');
    // No size label is paired with a price by hand anywhere in the FAQ.
    const faq8 = frontmatter.slice(frontmatter.indexOf('How much does a used shipping container'));
    expect(faq8).not.toMatch(/20ft|40ft/);
  });

  it('ships six inputs and seeds none of them with a value', () => {
    for (const id of ['calc-rate', 'calc-rent-delivery', 'calc-rent-pickup', 'calc-buy', 'calc-months']) {
      const tag = body.match(new RegExp(`<input[^>]*id="${id}"[^>]*>`))?.[0] ?? '';
      expect(tag, `${id} must render as an input`).toContain('type="number"');
      expect(tag, `${id} must not ship a value`).not.toContain('value=');
    }
    const select = body.match(/<select[^>]*id="calc-size"[\s\S]*?<\/select>/)?.[0] ?? '';
    expect(select).toContain('aria-describedby="help-size"');
    expect(select.match(/<option[^>]*>/)?.[0]).toContain('value=""');
    expect(select).toContain('No size chosen');
  });

  it('keeps the no-JS fallback and the author-level [hidden] rule the result slots depend on', () => {
    expect(body).toContain('calc-nojs');
    expect(body).toContain('calc-js');
    expect(body).toContain("classList.add('has-js')");
    expect(styleBlock).toContain('[hidden]');
    for (const id of ['calc-verdict', 'calc-stats', 'calc-seed-disc', 'calc-rentwins']) {
      const tag = body.match(new RegExp(`<[a-z]+[^>]*id="${id}"[^>]*>`))?.[0] ?? '';
      expect(tag, `${id} must ship hidden`).toContain('hidden');
    }
  });

  it('announces every result state once, through one polite live region', () => {
    const out = body.match(/<div[^>]*id="calc-out"[^>]*>/)?.[0] ?? '';
    expect(out).toContain('role="status"');
    expect(out).toContain('aria-live="polite"');
    expect((body.match(/role="status"/g) ?? []).length).toBe(1);
  });

  it('labels and describes all six inputs', () => {
    const ids = ['calc-rate', 'calc-rent-delivery', 'calc-rent-pickup', 'calc-buy', 'calc-size', 'calc-months'];
    for (const id of ids) {
      expect(body, `${id} needs a label`).toContain(`<label for="${id}">`);
    }
    expect((body.match(/aria-describedby="help-/g) ?? []).length).toBe(ids.length);
  });

  it('states the delivery asymmetry and adds no purchase-side delivery field', () => {
    expect((body.match(/asym-card is-rent/g) ?? []).length).toBe(1);
    expect((body.match(/asym-card is-buy/g) ?? []).length).toBe(1);
    const buyCard = body.slice(body.indexOf('asym-card is-buy'));
    const card = buyCard.slice(0, buyCard.indexOf('</div>'));
    expect(card).toContain('There is no purchase delivery box');
    expect(card).toMatch(/already contemplate/);
    // Six inputs, not seven. No id may suggest a purchase-side delivery box.
    expect(body).not.toMatch(/id="calc-(?:buy|purchase)-(?:delivery|deliver|freight)"/);
    expect((body.match(/<input[^>]*type="number"/g) ?? []).length).toBe(5);
  });

  it('composes the non-rental fact through the module and asks its own fourth question', () => {
    expect(frontmatter).toContain('composeRentalStance');
    expect(frontmatter).toContain("from '../../data/rentalStance'");
    expect(src).not.toContain(CANONICAL_FACT_LITERAL);
    expect(src).toContain(STANCE_QUESTION);
  });

  it('puts the stance question at FAQ index 2, which is the last slot QuickFacts slices', () => {
    const questions = [...frontmatter.matchAll(/\n\s*q: (['"])([\s\S]*?)\1,/g)].map((m) => m[2]);
    expect(questions.length).toBe(8);
    expect(questions[2]).toBe(STANCE_QUESTION);
  });

  it('uses astro:assets for four photos and inlines none of them', () => {
    expect(frontmatter).toContain("import { Image } from 'astro:assets'");
    expect((frontmatter.match(/from '\.\.\/\.\.\/assets\/photos\//g) ?? []).length).toBe(4);
    const images = body.match(/<Image[\s\S]*?\/>/g) ?? [];
    expect(images.length).toBe(4);
    for (const img of images) {
      expect(img).toContain('format="webp"');
      expect(img).toMatch(/width=\{/);
      expect(img).not.toMatch(/height=/);
      expect(img).toMatch(/alt="[^"]{40,}"/);
    }
    expect(src).not.toContain('data:image/');
  });

  it('carries no em dash or en dash (HS-OUT-001)', () => {
    expect(src).not.toMatch(DASHES);
  });

  it('does not override the self-canonical BaseLayout emits', () => {
    expect(src).not.toMatch(/rel="canonical"/);
    expect(src).not.toMatch(/canonical=/);
  });

  it('is a plain static page with no prerender directive, not even in a comment', () => {
    expect(src).not.toContain('export const prerender');
  });
});
