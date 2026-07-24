import { describe, it, expect } from 'vitest';
import { buildPageSchema } from './buildPageSchema';
import { WEBSITE_ID } from './entities';

const base = {
  url: 'https://steelboxdirect.com/size/',
  title: 'What size container?',
  description: 'Pick a size.',
  breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Size' }],
};

describe('buildPageSchema core', () => {
  it('excluded pages emit a WebPage graph but no quickFacts', () => {
    const { graph, quickFacts } = buildPageSchema({ ...base, page: { kind: 'excluded' } });
    expect(quickFacts).toBeNull();
    expect(graph.some((n) => n['@type'] === 'WebPage')).toBe(true);
    expect(graph.some((n) => n['@id'] === WEBSITE_ID)).toBe(true);
  });

  it('every @id reference resolves to a node in the graph (no orphans)', () => {
    const { graph } = buildPageSchema({ ...base, page: { kind: 'guide', topic: 'size', title: 'Size', specs: [], faqs: [{ q: 'Q?', a: 'A.' }] } });
    const ids = new Set(graph.map((n) => n['@id']).filter(Boolean));
    const refs: string[] = [];
    // collect { '@id': X } reference objects
    const walk = (o: any) => {
      if (Array.isArray(o)) o.forEach(walk);
      else if (o && typeof o === 'object') {
        const keys = Object.keys(o);
        if (keys.length === 1 && keys[0] === '@id') refs.push(o['@id']);
        else Object.values(o).forEach(walk);
      }
    };
    walk(graph);
    for (const r of refs) expect(ids.has(r)).toBe(true);
  });

  it('breadcrumb node lists items in order with absolute URLs', () => {
    const { graph } = buildPageSchema({ ...base, page: { kind: 'excluded' } });
    const bc = graph.find((n) => n['@type'] === 'BreadcrumbList') as any;
    expect(bc.itemListElement[0].item).toBe('https://steelboxdirect.com/');
    expect(bc.itemListElement[1].name).toBe('Size');
  });
});
