import { describe, it, expect } from 'vitest';
import { globalNodes, ORG_ID, LOCALBUSINESS_ID, WEBSITE_ID } from './entities';

describe('globalNodes', () => {
  const nodes = globalNodes();
  const byId = (id: string) => nodes.find((n) => n['@id'] === id) as Record<string, any>;

  it('emits the three global entities with stable @ids', () => {
    expect(byId(ORG_ID)['@type']).toBe('Organization');
    expect(byId(LOCALBUSINESS_ID)['@type']).toBe('LocalBusiness');
    expect(byId(WEBSITE_ID)['@type']).toBe('WebSite');
    expect(nodes).toHaveLength(3);
  });

  /**
   * Owner ruling, 2026-08-19: the parent company gets zero presence in structured data, while
   * every visible HTML reference to it stays exactly as it is. This guard is the enforcement.
   *
   * It walks the serialised graph instead of checking named properties, so it catches a
   * reintroduction in any shape: a standalone node, a parentOrganization link, an extra sameAs
   * entry, a description sentence, or the relationship written the other way round as
   * subOrganization. The spellings covered are the ones the codebase has actually used, in any
   * case, with an optional space, hyphen, or underscore between the two words, plus the retired
   * fragment id and the outbound domain.
   */
  it('never names the parent company anywhere in the graph, in any spelling (owner ruling)', () => {
    const json = JSON.stringify(nodes);
    for (const spelling of [/freedom[\s_-]*conex/i, /#freedomconex/i, /freedomconex\.com/i]) {
      expect(json).not.toMatch(spelling);
    }
    // the property has to be gone, not just its value: an empty or relabelled parent link is a link
    expect(json).not.toContain('parentOrganization');
    expect(json).not.toContain('subOrganization');
  });

  /**
   * Owner ruling, 2026-08-20: no founding date anywhere. The 2009 claim could not be
   * substantiated (the fulfilling company incorporated in 2023), so the property is removed
   * outright rather than replaced with another year. This guard keeps it out of the graph.
   */
  it('never claims a founding date, in any spelling (owner ruling)', () => {
    const json = JSON.stringify(nodes);
    expect(json).not.toContain('foundingDate');
    expect(json).not.toContain('2009');
  });

  it('areaServed pairs the core GeoCircle with a US Country node, so reach is not capped at 250 miles', () => {
    for (const id of [LOCALBUSINESS_ID, ORG_ID]) {
      const area = byId(id).areaServed as any[];
      expect(Array.isArray(area)).toBe(true);
      const circle = area.find((a) => a['@type'] === 'GeoCircle');
      const country = area.find((a) => a['@type'] === 'Country');
      // local signal kept: still the 250-mile home region around Cincinnati
      expect(circle.geoRadius).toBe('402336');
      expect(circle.geoMidpoint.latitude).toBe('39.1365839');
      // national truth added: delivery is not bounded by that circle
      expect(country.name).toBe('United States');
    }
  });

  it('no areaServed text makes a permit, zoning, tax, insurance, or structural claim (PROJECT_HS_003)', () => {
    const text = JSON.stringify(nodes.map((n) => n.areaServed)).toLowerCase();
    for (const banned of ['permit', 'zoning', 'tax', 'insur', 'classif', 'structure', 'rated for']) {
      expect(text).not.toContain(banned);
    }
  });

  it('carries only real NAP + sameAs and never a rating', () => {
    const lb = byId(LOCALBUSINESS_ID);
    expect(lb.telephone).toBe('+15135462543');
    expect(lb.address.addressLocality).toBe('Cincinnati');
    // hasMap and sameAs sit on the same node the parent link was removed from, so pin them here
    expect(lb.hasMap).toBe('https://maps.google.com/?cid=16337072236475848136');
    expect(lb.sameAs).toHaveLength(3);
    expect(lb.sameAs).toContain('https://www.linkedin.com/company/steel-box-direct/');
    expect(JSON.stringify(nodes)).not.toContain('aggregateRating');
    expect(JSON.stringify(nodes)).not.toContain('AggregateRating');
  });
});
