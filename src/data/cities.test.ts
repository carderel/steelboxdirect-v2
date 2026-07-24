import { describe, it, expect } from 'vitest';
import { cities } from './cities';

const VALID_PERSONAS = ['farmers', 'contractors', 'homeowners', 'businesses'];

describe('cities ground-truth dataset integrity', () => {
  it('has all 4 existing areas', () => {
    expect(cities.map((c) => c.slug)).toEqual(
      expect.arrayContaining([
        'cincinnati-shipping-containers', 'dayton-shipping-containers',
        'indianapolis-shipping-containers', 'louisville-shipping-containers',
      ])
    );
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
    });
  }
});
