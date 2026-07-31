import { describe, it, expect } from 'vitest';
import { cities } from './cities';

const VALID_PERSONAS = ['farmers', 'contractors', 'homeowners', 'businesses'];

const HOME_SLUGS = [
  'cincinnati-shipping-containers', 'dayton-shipping-containers',
  'indianapolis-shipping-containers', 'louisville-shipping-containers',
];

const DEPOT_SLUGS = [
  'cleveland-shipping-containers', 'savannah-shipping-containers',
  'charleston-shipping-containers', 'norfolk-shipping-containers',
  'houston-shipping-containers', 'new-york-shipping-containers',
  'detroit-shipping-containers', 'kansas-city-shipping-containers',
];

describe('cities ground-truth dataset integrity', () => {
  it('has all 4 existing areas', () => {
    expect(cities.map((c) => c.slug)).toEqual(expect.arrayContaining(HOME_SLUGS));
  });

  it('has all 8 depot cities', () => {
    expect(cities.map((c) => c.slug)).toEqual(expect.arrayContaining(DEPOT_SLUGS));
  });

  it('has exactly 12 cities with unique slugs', () => {
    expect(cities).toHaveLength(12);
    expect(new Set(cities.map((c) => c.slug)).size).toBe(12);
  });

  it('marks the 4 home cities region "home" and the 8 depot cities region "depot"', () => {
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
