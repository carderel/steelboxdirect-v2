import { describe, it, expect } from 'vitest';
import { cities } from './cities';

const VALID_PERSONAS = ['farmers', 'contractors', 'homeowners', 'businesses'];

const HOME_SLUGS = [
  'cincinnati-shipping-containers', 'dayton-shipping-containers',
  'columbus-shipping-containers',
  'indianapolis-shipping-containers', 'louisville-shipping-containers',
  'lexington-shipping-containers', 'huntington-shipping-containers',
];

const DEPOT_SLUGS = [
  'cleveland-shipping-containers', 'savannah-shipping-containers',
  'charleston-shipping-containers', 'norfolk-shipping-containers',
  'houston-shipping-containers', 'new-york-shipping-containers',
  'detroit-shipping-containers', 'kansas-city-shipping-containers',
];

describe('cities ground-truth dataset integrity', () => {
  it('has all 7 home areas', () => {
    expect(cities.map((c) => c.slug)).toEqual(expect.arrayContaining(HOME_SLUGS));
  });

  it('has all 8 depot cities', () => {
    expect(cities.map((c) => c.slug)).toEqual(expect.arrayContaining(DEPOT_SLUGS));
  });

  it('has exactly 15 cities with unique slugs', () => {
    expect(cities).toHaveLength(15);
    expect(new Set(cities.map((c) => c.slug)).size).toBe(15);
  });

  it('marks the 7 home cities region "home" and the 8 depot cities region "depot"', () => {
    for (const c of cities) {
      if (HOME_SLUGS.includes(c.slug)) expect(c.region).toBe('home');
      else expect(c.region).toBe('depot');
    }
  });

  for (const c of cities) {
    describe(c.slug, () => {
      const blob = JSON.stringify(c);

      it('contains NO fabricated rating / placement-count / ISO-certified claims', () => {
        expect(blob).not.toMatch(/\d(\.\d)?\s*\/\s*5/);          // "4.9/5"
        expect(blob.toLowerCase()).not.toContain('review average');
        expect(blob).not.toMatch(/units placed/i);
        expect(blob).not.toMatch(/\bplaced hundreds\b/i);
        expect(blob).not.toMatch(/ISO[- ]?certified/i);
        expect(blob).not.toMatch(/highest ISO standards/i);
      });

      // KEEP THIS. The city-page pricing override of 2026-08-17 lifted the prohibition on the PAGE
      // and not on the DATA, so this assertion stands unchanged. A city page may now render a
      // delivered figure, but only one interpolated from the generated feed in src/data/geoPricing.ts,
      // scoped to a named centroid ZIP, carrying its effective date and its disclaimer. A dollar
      // figure hand typed into a lede, a delivery body, a stat or a FAQ answer is exactly the
      // hand-typed price the replacement rule still forbids, and this blob scan is the only thing in
      // the repository that catches it.
      //
      // The rule SPLIT, it did not move. The page half now lives in
      // src/lib/compliance/city-pricing-guard.test.ts, which is a new file because there had never
      // been a guard on the city template at all. Deleting this assertion in the belief that the new
      // guard covers it would leave the data side unguarded, and the data side is the half a human
      // edits by hand.
      //
      // Decision: UDO Project/.project-catalog/decisions/2026-08-17-city-page-pricing-override.md.
      it('contains NO dollar amounts (hard stop)', () => {
        expect(blob).not.toMatch(/\$\s*\d/);
      });

      it('never names the supplier', () => {
        expect(blob).not.toMatch(/freedom\s*conex/i);
      });

      it('has the required routing fields (state / stateSlug / region / slug pattern)', () => {
        expect(c.state).toBeTruthy();
        expect(c.state).toMatch(/^[A-Z][A-Za-z ]+$/);            // full state name, not "OH"
        expect(c.state.length).toBeGreaterThan(2);
        expect(c.stateSlug).toMatch(/^[a-z]+(-[a-z]+)*$/);       // kebab-case
        expect(['home', 'depot']).toContain(c.region);
        expect(c.slug).toMatch(/-shipping-containers$/);
      });

      it('has the required ground-truth fields populated', () => {
        expect(c.primaryZips.length).toBeGreaterThan(0);
        expect(c.zoning.length).toBeGreaterThan(0);
        c.zoning.forEach((z) => {
          expect(z.county).toBeTruthy();
          expect(z.office).toBeTruthy();
          expect(z.url).toMatch(/^https?:\/\//);
        });
        expect(c.geography.interstates.length).toBeGreaterThan(0);
        expect(c.areaProfile.length).toBeGreaterThan(0);
        expect(c.commonUses.length).toBeGreaterThan(0);
        c.commonUses.forEach((u) => {
          expect(u.label).toBeTruthy();
          expect(VALID_PERSONAS).toContain(u.persona);
        });
        expect(c.usesIntro.length).toBeGreaterThan(0);
      });

      if (DEPOT_SLUGS.includes(c.slug)) {
        it('depot delivery framing is non-empty and depot-based (no home-region claims)', () => {
          expect(c.delivery.headline.length).toBeGreaterThan(0);
          expect(c.delivery.body.length).toBeGreaterThan(0);
          expect(c.delivery.counties.length).toBeGreaterThan(0);
          // The whole depot entry must avoid home-region-only claims, not just delivery.*:
          expect(blob).not.toMatch(/250\s*miles/i);
          expect(blob).not.toMatch(/flat[- ]fee/i);
        });
      }
    });
  }
});
