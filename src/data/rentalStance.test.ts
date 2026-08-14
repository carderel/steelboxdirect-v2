import { describe, it, expect } from 'vitest';
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
