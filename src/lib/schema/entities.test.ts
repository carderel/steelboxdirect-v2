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

  it('carries only real NAP + sameAs and never a rating', () => {
    const lb = byId(LOCALBUSINESS_ID);
    expect(lb.telephone).toBe('+15135462543');
    expect(lb.address.addressLocality).toBe('Cincinnati');
    expect(lb.sameAs).toContain('https://www.linkedin.com/company/steel-box-direct/');
    expect(JSON.stringify(nodes)).not.toContain('aggregateRating');
    expect(JSON.stringify(nodes)).not.toContain('AggregateRating');
  });
});
