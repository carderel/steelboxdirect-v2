import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { OPENS, CLOSES, OPENING_DAYS, HOURS_LABEL, to12h } from './businessHours';
import { globalNodes, LOCALBUSINESS_ID } from '../lib/schema/entities';

const read = (p: string) => readFileSync(resolve(__dirname, '../..', p), 'utf8');

/**
 * Guard: the LocalBusiness openingHoursSpecification must equal the hours the /contact/ page
 * shows (owner confirmed against the GBP 2026-10-06). Both read src/data/businessHours.ts; this
 * test fails if either side stops doing so or a literal hour string creeps back into a page.
 */
describe('business hours: schema matches visible contact-page hours', () => {
  const lb = globalNodes().find((n) => n['@id'] === LOCALBUSINESS_ID) as Record<string, any>;

  it('LocalBusiness carries one daily 09:00-21:00 OpeningHoursSpecification', () => {
    expect(lb.openingHoursSpecification).toEqual([
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '09:00',
        closes: '21:00',
      },
    ]);
    expect([...OPENING_DAYS]).toHaveLength(7);
  });

  it('the visible label is derived from the same opens/closes values', () => {
    expect(HOURS_LABEL).toBe('9 AM to 9 PM');
    expect(HOURS_LABEL).toBe(`${to12h(lb.openingHoursSpecification[0].opens)} to ${to12h(lb.openingHoursSpecification[0].closes)}`);
    expect([OPENS, CLOSES]).toEqual(['09:00', '21:00']);
  });

  it('no schema timezone claim (OpeningHoursSpecification has no timezone property)', () => {
    const json = JSON.stringify(lb.openingHoursSpecification);
    expect(json).not.toMatch(/timezone|Eastern|ET\b|-0[45]:00/i);
  });

  for (const page of ['src/pages/contact/index.astro', 'src/pages/ai-info/index.astro']) {
    it(`${page} renders hours from HOURS_LABEL, never a hard-coded range`, () => {
      const src = read(page);
      expect(src).toContain("from '../../data/businessHours'");
      expect(src).toContain('HOURS_LABEL');
      expect(src).not.toMatch(/\d{1,2}(:\d\d)?\s*(AM|PM)\s*to\s*\d{1,2}(:\d\d)?\s*(AM|PM)/i);
    });
  }
});
