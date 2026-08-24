import { describe, it, expect } from 'vitest';
import { buildPageSchema } from './buildPageSchema';
import type { PageSchemaInput } from './types';
import { WEBSITE_ID, SERVICE_AREA_LINE } from './entities';
import { pricing, priceValidUntil, formatPrice } from '../../data/pricing';

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

  /**
   * Site wide companion to the guard in entities.test.ts. That one covers the three global nodes
   * every page carries. This one covers the per page branches, so the ruling holds for the whole
   * builder rather than for a single page type.
   *
   * Owner ruling, 2026-08-19: the parent company keeps every visible HTML reference and gets none
   * in structured data. What this catches is a branch reintroducing the link locally, for example a
   * Product growing a brand or manufacturer that points at the parent, or a city branch naming the
   * depot operator.
   *
   * FAQ answers are caller supplied page copy rather than something the builder writes, and the
   * copy that does name the parent is a word for word mirror of a visible sentence. So the fixtures
   * here keep FAQ text neutral on purpose: the subject under test is the builder.
   */
  it('no page kind puts the parent company in the graph, in any spelling (owner ruling)', () => {
    const container: any = { slug: '20-foot-shipping-container', name: '20ft', seo: { description: '20ft.' } };
    const city: any = { slug: 'houston-shipping-containers', city: 'Houston', state: 'Texas', region: 'depot' };
    const faqs = [{ q: 'Do you deliver?', a: 'Yes, from a depot in the area.' }];
    const kinds: PageSchemaInput[] = [
      { kind: 'home', faqs },
      { kind: 'productHub', faqs },
      { kind: 'product', container, price: { label: '20ft', price: 2010, sqft: 160 }, specs: [] },
      { kind: 'city', city, faqs },
      { kind: 'useCase', audience: 'farms', title: 'Farms', specs: [], faqs },
      { kind: 'guide', topic: 'cost', title: 'Cost', specs: [], faqs },
      { kind: 'collection', title: 'Guides', items: [{ name: 'Cost', url: '/cost/' }], faqs },
      { kind: 'blogPost', title: 'T', description: 'd', author: 'A', datePublished: '2026-01-01',
        dateModified: '2026-01-02', takeaways: ['t'], faqs },
      { kind: 'excluded' },
    ];
    // if a new kind joins the union, extend the list above rather than editing this number
    expect(kinds).toHaveLength(9);
    for (const page of kinds) {
      const json = JSON.stringify(buildPageSchema({ ...base, page }).graph);
      for (const spelling of [/freedom[\s_-]*conex/i, /#freedomconex/i, /freedomconex\.com/i]) {
        expect(json, page.kind).not.toMatch(spelling);
      }
      expect(json, page.kind).not.toContain('parentOrganization');
      expect(json, page.kind).not.toContain('subOrganization');
    }
  });

  it('breadcrumb node lists items in order with absolute URLs', () => {
    const { graph } = buildPageSchema({ ...base, page: { kind: 'excluded' } });
    const bc = graph.find((n) => n['@type'] === 'BreadcrumbList') as any;
    expect(bc.itemListElement[0].item).toBe('https://steelboxdirect.com/');
    expect(bc.itemListElement[1].name).toBe('Size');
  });

  /**
   * Google requires `item` on every ListItem except the last, so a pathless middle crumb is a GSC
   * error the moment it ships (the August 2026 city-page flag). The builder's defence is to drop
   * that crumb and renumber rather than emit it, so a future call-site mistake degrades to a valid
   * three-level trail instead of an invalid four-level one. The last crumb stays exempt: it names
   * the page being viewed and legitimately carries no item.
   */
  it('drops a non-last crumb without a path and keeps positions sequential', () => {
    const { graph } = buildPageSchema({
      ...base,
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Locations', path: '/locations/' },
        { name: 'Ohio' },
        { name: 'Cincinnati' },
      ],
      page: { kind: 'excluded' },
    });
    const bc = graph.find((n) => n['@type'] === 'BreadcrumbList') as any;
    expect(bc.itemListElement.map((li: any) => li.name)).toEqual(['Home', 'Locations', 'Cincinnati']);
    expect(bc.itemListElement.map((li: any) => li.position)).toEqual([1, 2, 3]);
    expect(bc.itemListElement[0].item).toBe('https://steelboxdirect.com/');
    expect(bc.itemListElement[1].item).toBe('https://steelboxdirect.com/locations/');
    expect(bc.itemListElement[2].item).toBeUndefined();
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

  /**
   * The price spec carries the date the figure came into effect. Two properties matter and neither is
   * covered by the assertions above: the duplicated figure has to agree with the one on the offer,
   * because two different numbers in one node is worse than one number, and validFrom has to be the
   * CHANGE date rather than the date the price was last checked. A check date on a rendered surface
   * would need a deploy every day to stay true, which is why pricing.asOf was redefined rather than
   * repointed.
   */
  it('product branch states validFrom from the change date, with a figure that agrees with the offer', () => {
    const container: any = { slug: '20-foot-shipping-container', name: '20ft', seo: { description: '20ft.' } };
    const { graph } = buildPageSchema({
      url: 'https://steelboxdirect.com/shipping-containers-for-sale/20-foot-shipping-container/',
      title: '20ft', description: '20ft.',
      page: { kind: 'product', container, price: { label: '20ft Cargo', price: 2010, sqft: 160 }, specs: [] },
    });
    const spec = (graph.find((n) => n['@type'] === 'Product') as any).offers.priceSpecification;
    expect(spec['@type']).toBe('UnitPriceSpecification');
    expect(spec.priceCurrency).toBe('USD');
    expect(spec.validFrom).toBe(pricing.asOf);
    expect(spec.validFrom).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(spec.price).toBe(2010);
    // the two figures in the one node, asserted equal rather than assumed equal
    for (const p of [{ price: 2010, sqft: 160, label: 'a' }, { price: 2710, sqft: 320, label: 'b' }]) {
      const { graph: g } = buildPageSchema({
        url: 'https://steelboxdirect.com/shipping-containers-for-sale/x/', title: 'X', description: 'x',
        page: { kind: 'product', container, price: p, specs: [] },
      });
      const offers = (g.find((n) => n['@type'] === 'Product') as any).offers;
      expect(offers.price).toBe(offers.priceSpecification.price);
    }
  });

  /**
   * priceValidUntil is anchored to the build date, not to pricing.asOf plus a year. Under a feed that
   * commits only when a figure moves, asOf stops advancing on its own, so the old derivation would
   * publish an expired date on three product pages once a price held for more than a year. The
   * assertion that matters is therefore that the value is in the future, which a frozen date fails
   * and which the equality assertion above cannot see.
   */
  it('priceValidUntil is a future date, one year from the build date rather than from the change date', () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(priceValidUntil).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(priceValidUntil.localeCompare(today)).toBeGreaterThan(0);
    const oneYearOut = (() => {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      return d.toISOString().slice(0, 10);
    })();
    expect(priceValidUntil).toBe(oneYearOut);
    expect(Number(priceValidUntil.slice(0, 4))).toBe(Number(today.slice(0, 4)) + 1);
  });

  it('product branch omits price when none supplied', () => {
    const container: any = { slug: 'x', name: 'X', seo: { description: 'x' } };
    const { graph } = buildPageSchema({ url: 'https://steelboxdirect.com/shipping-containers-for-sale/x/', title: 'X', description: 'x', page: { kind: 'product', container, specs: [] } });
    const prod = graph.find((n) => n['@type'] === 'Product') as any;
    expect('price' in prod.offers).toBe(false);
    // no figure means no price spec either, rather than a spec with an undefined figure in it
    expect('priceSpecification' in prod.offers).toBe(false);
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
    // depot city: qualitative depot framing, no distance claim, no supplier name
    expect(depotQf!.serves).toBe('Depot in the Houston area · our supplier network');
    expect(depotQf!.specs[0].v).toBe('Delivered from a depot in the Houston area through our supplier network');
    const depotJson = JSON.stringify(depotQf);
    expect(depotJson).not.toMatch(/250\s*mi|miles/i);
    expect(depotJson).not.toMatch(/freedom\s*conex/i);
  });

  /**
   * The split: a product page carries a machine readable figure, a city page carries a human readable
   * one. So the resolved city payload has to reach the visible cells and reach nothing in the graph.
   *
   * The graph half is asserted as a COUNT against a non-city baseline for the same URL, not as an
   * absence. The site-wide Organization and LocalBusiness nodes already carry a priceless offer node
   * on every page, so a literal absence assertion would fail at baseline and get deleted by whoever
   * hit it. The count says what is meant: this branch adds none of its own.
   */
  it('city branch with a resolved price fills the visible cells and adds nothing priced to the graph', () => {
    const city: any = { slug: 'dayton-shipping-containers', city: 'Dayton', state: 'Ohio', region: 'home' };
    const url = 'https://steelboxdirect.com/locations/ohio/dayton-shipping-containers/';
    const args = { url, title: 'Dayton', description: 'd', breadcrumbs: [{ name: 'Home', path: '/' }] };
    const { graph, quickFacts } = buildPageSchema({
      ...args,
      page: {
        kind: 'city', city, faqs: [{ q: 'Deliver?', a: 'Yes.' }],
        price: { zip: '45404', delivered: 2040, sizeLabel: '20ft', effectiveSince: '2026-08-12' },
      },
    });
    const baseline = buildPageSchema({ ...args, page: { kind: 'excluded' } }).graph;
    const countType = (node: unknown, type: string): number => {
      if (Array.isArray(node)) return node.reduce<number>((n, v) => n + countType(v, type), 0);
      if (node && typeof node === 'object') {
        const obj = node as Record<string, unknown>;
        return Object.values(obj).reduce<number>((n, v) => n + countType(v, type), obj['@type'] === type ? 1 : 0);
      }
      return 0;
    };

    // visible half: the figure is scoped to its ZIP and its size, and the date is split off into its
    // own cell so each one stands up alone when a scraper reads one row and not the other
    expect(quickFacts!.specs[0]).toEqual({ k: 'Delivered price', v: `${formatPrice(2040)} for a 20ft to 45404` });
    expect(quickFacts!.specs[1]).toEqual({ k: 'Price in effect since', v: 'August 12' });
    expect(quickFacts!.specs[1].v).not.toMatch(/\d{4}-\d{2}-\d{2}/);
    expect(quickFacts!.specs.length).toBeLessThanOrEqual(8);
    expect(quickFacts!.showPriceDisclaimer).toBe(true);
    // the Serves cell is untouched by the price payload
    expect(quickFacts!.serves).toBe('Dayton + surrounding counties · 250 mi home region');

    // graph half: nothing priced, and nothing from the payload
    expect(countType(graph, 'Offer')).toBe(countType(baseline, 'Offer'));
    expect(countType(graph, 'Product')).toBe(0);
    const json = JSON.stringify(graph);
    expect(json).not.toContain('$');
    expect(json).not.toContain('45404');
    expect(json).not.toContain('2040');
    for (const key of ['"price"', '"offers"', '"priceSpecification"', '"priceValidUntil"', '"validFrom"']) {
      expect(json, `the city graph must not carry ${key}`).not.toContain(key);
    }
  });

  it('city branch without a resolved price prints no cells and no disclaimer', () => {
    const city: any = { slug: 'norfolk-shipping-containers', city: 'Norfolk', state: 'Virginia', region: 'depot' };
    const { quickFacts } = buildPageSchema({
      url: 'https://steelboxdirect.com/locations/virginia/norfolk-shipping-containers/', title: 'Norfolk', description: 'n',
      page: { kind: 'city', city, faqs: [] },
    });
    expect(quickFacts!.specs.map((s) => s.k)).not.toContain('Delivered price');
    expect(quickFacts!.specs.map((s) => s.k)).not.toContain('Price in effect since');
    expect(quickFacts!.showPriceDisclaimer).toBe(false);
    expect(JSON.stringify(quickFacts)).not.toContain('$');
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

/**
 * The HowTo nodes are structured data, so they are held to a stricter standard than body prose.
 *
 * TWO FAILURES ON 2026-08-18, both in the /cost/ HowTo in src/lib/schema/howto.ts, both invisible
 * because nothing read the node:
 *   1. A U+2014 and a U+2013 shipped inside the step text. Assistants quote structured data
 *      verbatim, so a typographic dash there travels further than the same dash in a paragraph.
 *   2. The delivery step said the service area is 250 miles from Cincinnati, while the visible
 *      /cost/ page publishes delivered pricing for fifteen metros, most of them outside that
 *      radius. The machine layer contradicted the table above it, on one page.
 * Commit e429343 fixed the same class of contradiction in the visible Serves cell. These tests
 * hold the schema side of it.
 */
describe('HowTo nodes are dash clean and do not understate the service area', () => {
  const TOPICS = ['size', 'condition', 'delivery', 'cost', 'permits'] as const;

  const howtoFor = (topic: (typeof TOPICS)[number]): any => {
    const { graph } = buildPageSchema({
      ...base,
      url: `https://steelboxdirect.com/${topic}/`,
      page: { kind: 'guide', topic, title: topic, specs: [], faqs: [] },
    });
    const node = graph.find((n) => n['@type'] === 'HowTo');
    expect(node, `no HowTo node for topic ${topic}`).toBeDefined();
    return node;
  };

  const stepText = (node: any): string[] => (node.step ?? []).map((s: any) => String(s.text ?? ''));

  it('the /cost/ HowTo carries no em dash and no en dash', () => {
    // escaped code points on purpose, so this guard cannot contain what it forbids
    for (const text of stepText(howtoFor('cost'))) {
      expect(text).not.toMatch(/[\u2014\u2013]/);
    }
  });

  it('the /cost/ delivery step pairs the 250 mi home region with the nationwide capability', () => {
    const delivery = stepText(howtoFor('cost')).find((t) => /250 mi/i.test(t));
    expect(delivery, 'no step states the home region radius').toBeDefined();
    // the radius alone reads as the whole footprint, which the visible price table contradicts
    expect(delivery!).toMatch(/nationwide/i);
    expect(delivery!).toMatch(/nationwide[^.]*\b(hub|hubs|network|depot)\b/i);
    expect(delivery!.search(/250 mi/i)).toBeLessThan(delivery!.search(/nationwide/i));
    // no state list: naming states implies the unnamed states are excluded
    expect(delivery!).not.toMatch(/\b(Ohio|Indiana|Kentucky|West Virginia)\b/);
    // no pricing inside a geography claim
    expect(delivery!).not.toContain('$');
  });

  it('no HowTo step anywhere claims a service area the price tables outgrew', () => {
    for (const topic of TOPICS) {
      for (const text of stepText(howtoFor(topic))) {
        if (!/250 mi/i.test(text)) continue;
        expect(text, `${topic} step states the radius with no nationwide clause`).toMatch(/nationwide/i);
      }
    }
  });
});
