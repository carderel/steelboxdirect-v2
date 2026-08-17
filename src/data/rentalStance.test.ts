import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  RENTAL_STANCE_FACT,
  RENTAL_STANCE_FACT_HTML,
  composeRentalStance,
} from './rentalStance';

describe('rental stance module: one canonical fact, per-page wrappers', () => {
  it('states the non-rental fact and the two things we do instead', () => {
    expect(RENTAL_STANCE_FACT).toMatch(/Steel Box Direct does not rent shipping containers/);
    expect(RENTAL_STANCE_FACT).toMatch(/sell/i);
    expect(RENTAL_STANCE_FACT).toMatch(/rent-to-own/);
  });

  it('carries no em dash or en dash (HS-OUT-001)', () => {
    expect(RENTAL_STANCE_FACT).not.toMatch(/[\u2014\u2013]/);
    expect(RENTAL_STANCE_FACT_HTML).not.toMatch(/[\u2014\u2013]/);
  });

  it('the html twin is the same fact with one rent-to-own link and no other markup', () => {
    expect(RENTAL_STANCE_FACT_HTML).toContain('href="/rent-to-own/"');
    expect(RENTAL_STANCE_FACT_HTML.match(/<a /g)).toHaveLength(1);
    expect(RENTAL_STANCE_FACT_HTML.replace(/<[^>]+>/g, '')).toBe(RENTAL_STANCE_FACT);
  });

  it('composes the fact with per-page context, fact first', () => {
    const out = composeRentalStance({ context: 'Context sentence for one page.' });
    expect(out.a).toBe(`${RENTAL_STANCE_FACT} Context sentence for one page.`);
    expect(out.a.startsWith(RENTAL_STANCE_FACT)).toBe(true);
  });

  it('produces a DIFFERENT answer for every different context, so no two schema-bound pages match', () => {
    const a = composeRentalStance({ context: 'First page context.' }).a;
    const b = composeRentalStance({ context: 'Second page context.' }).a;
    const c = composeRentalStance({ context: 'Third page context.' }).a;
    expect(new Set([a, b, c]).size).toBe(3);
  });

  it('drops the self-link when linkRentToOwn is false', () => {
    const out = composeRentalStance({ context: 'On the rent-to-own page.', linkRentToOwn: false });
    expect(out.html).not.toContain('href="/rent-to-own/"');
    expect(out.html).toBe(`${RENTAL_STANCE_FACT} On the rent-to-own page.`);
  });

  it('uses contextHtml for the html twin when one is supplied', () => {
    const out = composeRentalStance({
      context: 'Plain context.',
      contextHtml: 'Rich <a href="/somewhere/">context</a>.',
    });
    expect(out.a).toBe(`${RENTAL_STANCE_FACT} Plain context.`);
    expect(out.html).toBe(`${RENTAL_STANCE_FACT_HTML} Rich <a href="/somewhere/">context</a>.`);
  });
});

describe('rental stance: four schema-bound pages, four different questions', () => {
  const REPO_ROOT = import.meta.dirname
    ? join(import.meta.dirname, '..', '..')
    : process.cwd();

  const PAGES = {
    productHub: 'src/pages/shipping-containers-for-sale/index.astro',
    rentToOwn: 'src/pages/rent-to-own/index.astro',
    rentalGuide: 'src/pages/container-rental-guide/index.astro',
    rentBuyCalculator: 'src/pages/container-rent-vs-buy-calculator/index.astro',
  };

  // Each page composes the SAME canonical fact with its OWN question, matched to its own intent.
  // If two of these ever converge, two URLs emit an identical FAQPage Question/Answer pair.
  const QUESTIONS = {
    productHub: 'Can I rent a shipping container, or do you only sell them?',
    rentToOwn: "What's the difference between renting and rent-to-own?",
    rentalGuide: 'Does Steel Box Direct rent shipping containers?',
    rentBuyCalculator: 'If you do not rent containers, why does this calculator price a rental?',
  };

  const read = (key: keyof typeof PAGES): string =>
    readFileSync(join(REPO_ROOT, PAGES[key]), 'utf8');

  it('the four questions are distinct strings', () => {
    const qs = Object.values(QUESTIONS);
    expect(new Set(qs).size).toBe(4);
  });

  it('each page asks its own question and none of the other three', () => {
    for (const key of Object.keys(PAGES) as (keyof typeof PAGES)[]) {
      const src = read(key);
      expect(src, `${PAGES[key]} must ask its own question`).toContain(QUESTIONS[key]);
      for (const other of Object.keys(QUESTIONS) as (keyof typeof QUESTIONS)[]) {
        if (other === key) continue;
        expect(src, `${PAGES[key]} must not also ask ${other}'s question`)
          .not.toContain(QUESTIONS[other]);
      }
    }
  });

  it('all four compose the fact through the module rather than holding their own copy', () => {
    for (const key of Object.keys(PAGES) as (keyof typeof PAGES)[]) {
      const src = read(key);
      expect(src, `${PAGES[key]} must call composeRentalStance`).toContain('composeRentalStance');
      // The literal fact sentence must exist in exactly one place: the module.
      expect(src).not.toContain('Steel Box Direct does not rent shipping containers.');
    }
  });
});
