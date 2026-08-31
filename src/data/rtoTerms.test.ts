import { describe, it, expect } from 'vitest';
import {
  RTO_TERMS,
  RTO_DOWN_CONDITION,
  RTO_CTA_HEADLINE,
  RTO_CTA_SMALLPRINT,
  rtoEffectiveDateLabel,
} from './rtoTerms';

describe('rtoTerms: one canonical statement of the down payment program', () => {
  it('carries both tiers and the provider', () => {
    expect(RTO_TERMS.downPayment).toBe('$99');
    expect(RTO_TERMS.remoteDownPayment).toBe('20%');
    expect(RTO_TERMS.distanceLimitMiles).toBe('150');
    expect(RTO_TERMS.provider).toBe('My Container Rental');
  });

  it('measures the distance from the depot, never from Cincinnati', () => {
    expect(RTO_DOWN_CONDITION).toMatch(/depot/i);
    expect(RTO_DOWN_CONDITION).not.toMatch(/cincinnati/i);
    expect(RTO_CTA_SMALLPRINT).not.toMatch(/cincinnati/i);
  });

  it('states both tiers in the condition, so the offer never travels alone', () => {
    expect(RTO_DOWN_CONDITION).toContain(RTO_TERMS.downPayment);
    expect(RTO_DOWN_CONDITION).toContain(RTO_TERMS.remoteDownPayment);
    expect(RTO_DOWN_CONDITION).toContain(RTO_TERMS.distanceLimitMiles);
  });

  it('keeps the third-party approval qualifier in the small print', () => {
    expect(RTO_CTA_SMALLPRINT).toMatch(/third.party approval/i);
  });

  it('renders the effective date as a readable label', () => {
    expect(rtoEffectiveDateLabel()).toBe('September 1, 2026');
  });

  // The dashes appear here only as \u escapes, per the convention rentalStance.test.ts follows
  // and dash-guard.test.ts documents: the escapes become the characters at runtime, so the
  // assertion is unchanged, but the file bytes stay clean and the guard scans this file with no
  // exclusion. Writing the literals inline makes the dash guard flag the dash test.
  it('carries no em dash or en dash (HS-OUT-001)', () => {
    for (const s of [RTO_DOWN_CONDITION, RTO_CTA_HEADLINE, RTO_CTA_SMALLPRINT]) {
      expect(s).not.toMatch(/[\u2014\u2013]/);
    }
  });
});
