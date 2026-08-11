import { describe, it, expect } from 'vitest';
import { globalNodes, ORG_ID, LOCALBUSINESS_ID, WEBSITE_ID, FREEDOMCONEX_ID } from './entities';

describe('globalNodes', () => {
  const nodes = globalNodes();
  const byId = (id: string) => nodes.find((n) => n['@id'] === id) as Record<string, any>;

  it('emits the four global entities with stable @ids', () => {
    expect(byId(ORG_ID)['@type']).toBe('Organization');
    expect(byId(LOCALBUSINESS_ID)['@type']).toBe('LocalBusiness');
    expect(byId(WEBSITE_ID)['@type']).toBe('WebSite');
    expect(byId(FREEDOMCONEX_ID)['@type']).toBe('Organization');
  });

  it('links both parents to Freedom Conex by @id reference', () => {
    expect(byId(ORG_ID).parentOrganization).toEqual({ '@id': FREEDOMCONEX_ID });
    expect(byId(LOCALBUSINESS_ID).parentOrganization).toEqual({ '@id': FREEDOMCONEX_ID });
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
    expect(lb.sameAs).toContain('https://www.linkedin.com/company/steel-box-direct/');
    expect(JSON.stringify(nodes)).not.toContain('aggregateRating');
    expect(JSON.stringify(nodes)).not.toContain('AggregateRating');
  });
});
