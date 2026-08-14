import { describe, it, expect } from 'vitest';
import { buildPageSchema } from './buildPageSchema';
import { WEBSITE_ID, SERVICE_AREA_LINE } from './entities';
import { priceValidUntil } from '../../data/pricing';

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

  it('product branch emits a Product with UsedCondition + price and price-disclaimer quickFacts', () => {
    const container: any = { slug: '40-foot-high-cube-container', name: '40ft High Cube', seo: { description: 'HC.' } };
    const { graph, quickFacts } = buildPageSchema({
      url: 'https://steelboxdirect.com/shipping-containers-for-sale/40-foot-high-cube-container/',
      title: '40ft HC', description: 'HC.',
      page: { kind: 'product', container, price: { label: '40ft HC', price: 2470, sqft: 320 },
              specs: [{ k: 'Exterior height', v: "9'6\"" }] },
    });
    const prod = graph.find((n) => n['@type'] === 'Product') as any;
    expect(prod.offers.price).toBe(2470);
    expect(prod.offers.itemCondition).toBe('https://schema.org/UsedCondition');
    expect(prod.offers.priceValidUntil).toBe(priceValidUntil);
    expect(prod.offers.seller).toEqual({ '@id': expect.stringContaining('#organization') });
    expect(quickFacts!.showPriceDisclaimer).toBe(true);
    expect(quickFacts!.faqs).toEqual([]);
  });

  it('product branch omits price when none supplied', () => {
    const container: any = { slug: 'x', name: 'X', seo: { description: 'x' } };
    const { graph } = buildPageSchema({ url: 'https://steelboxdirect.com/shipping-containers-for-sale/x/', title: 'X', description: 'x', page: { kind: 'product', container, specs: [] } });
    const prod = graph.find((n) => n['@type'] === 'Product') as any;
    expect('price' in prod.offers).toBe(false);
  });

  it('city branch: Service with areaServed, NO price anywhere, block $-free', () => {
    const city: any = { slug: 'cincinnati-shipping-containers', city: 'Cincinnati', state: 'OH', region: 'home' };
    const { graph, quickFacts } = buildPageSchema({
      url: 'https://steelboxdirect.com/locations/ohio/cincinnati-shipping-containers/', title: 'Cincinnati', description: 'c',
      page: { kind: 'city', city, faqs: [{ q: 'Deliver?', a: 'Yes.' }] },
    });
    const svc = graph.find((n) => n['@type'] === 'Service') as any;
    expect(svc.provider).toEqual({ '@id': expect.stringContaining('#localbusiness') });
    expect(svc.areaServed.name).toContain('Cincinnati');
    expect(JSON.stringify(graph)).not.toContain('$');
    expect(JSON.stringify(graph)).not.toMatch(/"price"\s*:/);
    expect(svc.offers).toBeUndefined();
    expect(quickFacts!.showPriceDisclaimer).toBe(false);
    expect(JSON.stringify(quickFacts)).not.toContain('$');
  });

  it('city branch quickFacts are region-aware: home gets the local line, depot gets the depot line', () => {
    const home: any = { slug: 'cincinnati-shipping-containers', city: 'Cincinnati', state: 'Ohio', region: 'home' };
    const { quickFacts: homeQf } = buildPageSchema({
      url: 'https://steelboxdirect.com/locations/ohio/cincinnati-shipping-containers/', title: 'Cincinnati', description: 'c',
      page: { kind: 'city', city: home, faqs: [] },
    });
    // home city: its own local area, never the site-wide network line
    expect(homeQf!.serves).toBe('Cincinnati + surrounding counties · 250 mi home region');
    expect(homeQf!.serves).not.toBe(SERVICE_AREA_LINE);
    expect(homeQf!.specs[0]).toEqual({ k: 'Service area', v: 'Cincinnati + surrounding counties' });

    const depot: any = { slug: 'houston-shipping-containers', city: 'Houston', state: 'Texas', region: 'depot' };
    const { quickFacts: depotQf } = buildPageSchema({
      url: 'https://steelboxdirect.com/locations/texas/houston-shipping-containers/', title: 'Houston', description: 'h',
      page: { kind: 'city', city: depot, faqs: [] },
    });
    // depot city: qualitative depot framing — no distance claim, no supplier name
    expect(depotQf!.serves).toBe('Depot in the Houston area · our supplier network');
    expect(depotQf!.specs[0].v).toBe('Delivered from a depot in the Houston area through our supplier network');
    const depotJson = JSON.stringify(depotQf);
    expect(depotJson).not.toMatch(/250\s*mi|miles/i);
    expect(depotJson).not.toMatch(/freedom\s*conex/i);
  });

  it('useCase branch: Service with audience + quickFacts specs', () => {
    const { graph, quickFacts } = buildPageSchema({
      url: 'https://steelboxdirect.com/for/farmers/', title: 'Farmers', description: 'f',
      page: { kind: 'useCase', audience: 'farmers', title: 'Container Storage for Farms', specs: [{ k: 'Foundation', v: 'None needed' }], faqs: [{ q: 'Q', a: 'A' }] },
    });
    const svc = graph.find((n) => n['@type'] === 'Service') as any;
    expect(svc.audience.audienceType).toBe('farmers');
    expect(quickFacts!.specs[0].k).toBe('Foundation');
  });

  it('useCase branch: optional serviceType + areaServed override the defaults, still NO price', () => {
    const { graph } = buildPageSchema({
      url: 'https://steelboxdirect.com/rent-to-own/', title: 'Rent to Own', description: 'r',
      page: { kind: 'useCase', audience: 'rent-to-own container buyers', title: 'Rent-to-Own Shipping Containers',
              serviceType: 'Rent-to-own shipping container program',
              areaServed: ['Ohio', 'Indiana', 'Kentucky'],
              specs: [], faqs: [{ q: 'Q', a: 'A' }] },
    });
    const svc = graph.find((n) => n['@type'] === 'Service') as any;
    expect(svc.serviceType).toBe('Rent-to-own shipping container program');
    expect(svc.areaServed).toEqual([
      { '@type': 'State', name: 'Ohio' },
      { '@type': 'State', name: 'Indiana' },
      { '@type': 'State', name: 'Kentucky' },
    ]);
    expect(svc.offers).toBeUndefined();
    expect(JSON.stringify(svc)).not.toMatch(/"price"\s*:/);
    // default preserved when the new options are omitted
    const { graph: g2 } = buildPageSchema({
      url: 'https://steelboxdirect.com/for/farmers/', title: 'Farmers', description: 'f',
      page: { kind: 'useCase', audience: 'farmers', title: 'Farm Storage', specs: [], faqs: [] },
    });
    const svc2 = g2.find((n) => n['@type'] === 'Service') as any;
    expect(svc2.serviceType).toBe('Shipping container sales and delivery');
    expect('areaServed' in svc2).toBe(false);
  });

  it('guide branch with topic adds an Article and a HowTo node', () => {
    const { graph } = buildPageSchema({ url: 'https://steelboxdirect.com/size/', title: 'Size', description: 's', page: { kind: 'guide', topic: 'size', title: 'Size', specs: [], faqs: [] } });
    expect(graph.some((n) => n['@type'] === 'Article')).toBe(true);
    expect(graph.some((n) => n['@type'] === 'HowTo')).toBe(true);
    const art = graph.find((n) => n['@type'] === 'Article') as any;
    expect(art.headline).toBe('Size');
  });

  it('collection branch emits ItemList of children', () => {
    const { graph } = buildPageSchema({ url: 'https://steelboxdirect.com/locations/', title: 'Locations', description: 'l', page: { kind: 'collection', title: 'Locations', items: [{ name: 'Cincinnati', url: 'https://steelboxdirect.com/cincinnati-shipping-containers/' }], faqs: [] } });
    const coll = graph.find((n) => n['@type'] === 'CollectionPage') as any;
    expect(coll.mainEntity['@type']).toBe('ItemList');
    expect(coll.mainEntity.itemListElement[0].item).toContain('cincinnati');
  });

  it('blogPost branch emits Article with author + dates', () => {
    const { graph, quickFacts } = buildPageSchema({ url: 'https://steelboxdirect.com/blog/x/', title: 'X', description: 'd', page: { kind: 'blogPost', title: 'X', description: 'd', author: 'Steel Box Direct', datePublished: '2026-07-01', dateModified: '2026-07-02', takeaways: ['t1'], faqs: [] } });
    const art = graph.find((n) => n['@type'] === 'Article') as any;
    expect(art.author).toEqual({ '@id': expect.stringContaining('#organization') });
    expect(art.datePublished).toBe('2026-07-01');
    expect(quickFacts!.specs.length).toBeLessThanOrEqual(8);
  });
});

/**
 * The visible "Serves" cell and the graph's areaServed have to agree.
 *
 * areaServed is deliberately two nodes (GeoCircle 250mi/Cincinnati + Country United States).
 * Before this guard the visible cell rendered only the first node on every page that did not
 * set an override, so the majority of the site said "250 mi" while its own structured data
 * said nationwide. These tests fail if either half of that pairing drifts again.
 */
describe('QuickFacts "Serves" cell agrees with areaServed', () => {
  const cityFixture = (region: string, city: string): any => ({ slug: `${city.toLowerCase()}-shipping-containers`, city, state: 'OH', region });
  const containerFixture: any = { slug: '20-foot-shipping-container', name: '20ft Container', seo: { description: '20ft.' } };

  // one sample per PageSchemaInput kind that renders a QuickFacts block
  const samples: { kind: string; page: any; local: boolean }[] = [
    { kind: 'home', page: { kind: 'home', faqs: [] }, local: false },
    { kind: 'productHub', page: { kind: 'productHub', faqs: [] }, local: false },
    { kind: 'product', page: { kind: 'product', container: containerFixture, specs: [] }, local: false },
    { kind: 'useCase', page: { kind: 'useCase', audience: 'farmers', title: 'Farms', specs: [], faqs: [] }, local: false },
    { kind: 'guide', page: { kind: 'guide', topic: 'size', title: 'Size', specs: [], faqs: [] }, local: false },
    { kind: 'collection', page: { kind: 'collection', title: 'Guides', items: [], faqs: [] }, local: false },
    { kind: 'blogPost', page: { kind: 'blogPost', title: 'X', description: 'd', author: 'Steel Box Direct', datePublished: '2026-07-01', dateModified: '2026-07-02', takeaways: [], faqs: [] }, local: false },
    { kind: 'city/home', page: { kind: 'city', city: cityFixture('home', 'Dayton'), faqs: [] }, local: true },
    { kind: 'city/depot', page: { kind: 'city', city: cityFixture('depot', 'Houston'), faqs: [] }, local: true },
  ];

  it('every kind that renders a block sets a non-empty Serves value', () => {
    for (const s of samples) {
      const { quickFacts } = buildPageSchema({ ...base, page: s.page });
      expect(quickFacts, s.kind).not.toBeNull();
      expect(quickFacts!.serves, s.kind).toBeTruthy();
    }
  });

  it('non-geographic kinds get the network line; city pages keep their own local area', () => {
    for (const s of samples) {
      const { quickFacts } = buildPageSchema({ ...base, page: s.page });
      if (s.local) expect(quickFacts!.serves, s.kind).not.toBe(SERVICE_AREA_LINE);
      else expect(quickFacts!.serves, s.kind).toBe(SERVICE_AREA_LINE);
    }
  });

  it('the network line names BOTH areaServed nodes, so neither half can be dropped', () => {
    // GeoCircle half: the 250-mi Cincinnati home region, stated first (local dominance leads)
    expect(SERVICE_AREA_LINE).toMatch(/250 mi.*Cincinnati/i);
    // Country half: the nationwide ceiling
    expect(SERVICE_AREA_LINE).toMatch(/nationwide/i);
    expect(SERVICE_AREA_LINE.search(/250 mi/i)).toBeLessThan(SERVICE_AREA_LINE.search(/nationwide/i));
  });

  it('the network line qualifies "nationwide" and never enumerates states', () => {
    // "nationwide" must carry the hub/network qualifier: we are not local everywhere
    expect(SERVICE_AREA_LINE).toMatch(/nationwide[^.]*\b(hub|hubs|network)\b/i);
    // a state list would imply the unlisted states are excluded (the reason the graph omits one)
    expect(SERVICE_AREA_LINE).not.toMatch(/\b(Ohio|Indiana|Kentucky|West Virginia)\b/);
    // geography only, and no pricing (PROJECT_HS_003 / city-page pricing hard stop)
    expect(SERVICE_AREA_LINE).not.toContain('$');
    expect(SERVICE_AREA_LINE).not.toMatch(/permit|zoning|insur|tax/i);
  });

  it('no Serves value contains an em dash or en dash (HS-OUT-001)', () => {
    for (const s of samples) {
      const { quickFacts } = buildPageSchema({ ...base, page: s.page });
      // escaped on purpose: the guard must not itself put a literal dash in the repo
      expect(quickFacts!.serves, s.kind).not.toMatch(/[\u2014\u2013]/);
    }
  });
});
