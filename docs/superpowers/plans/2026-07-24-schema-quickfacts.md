# Schema Graph + Quick Facts Block — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the site's fragmented schema (an array of separate `<head>` scripts + 12 per-page head-slot injections) with a single data module that emits one `@graph` in the head AND a visible, on-brand "Quick Facts" block above the footer — both derived from the same per-page node data so they can never drift.

**Architecture:** A pure TypeScript module (`src/lib/schema/`) exports a global entity graph (Organization/LocalBusiness/WebSite/Freedom Conex with stable `@id`s) and a pure function `buildPageSchema(input)` returning `{ graph, quickFacts }`. `BaseLayout.astro` calls it once, emits the `@graph` as a single JSON-LD script, and renders `<QuickFacts>` above the footer when `quickFacts` is non-null. Each page passes a small `schema` prop describing its main entity; the module builds the correct node type and the matching visible facts.

**Tech Stack:** Astro 4, TypeScript, vitest (new, dev-only, for the pure module). No client JS.

## Global Constraints

- **Hard stop:** City pages carry **NO dollar amounts** — city `Service` nodes have no `offers`/price; city Quick Facts blocks show no `$`. (HARD_STOPS HS-PROJ, CLAUDE.md.)
- **No fabricated ratings/reviews** — never emit `AggregateRating` or `Review`. Trust signals = real `sameAs` + `WarrantyPromise` + `parentOrganization` only.
- Average price shows **only** on home / product hub / product detail / use-case pages, always with the disclaimer string: **"average starting price — your quote may be more or less"**. Source prices from `src/data/pricing.ts`. (Pricing policy 2026-07-09.)
- **Real entity data only:** NAP = Steel Box Direct, Cincinnati OH, `+15135462543`; parent = Freedom Conex LLC (`https://www.freedomconex.com`); `sameAs` = `https://maps.google.com/?cid=16337072236475848136` + `https://www.linkedin.com/company/steel-box-direct/`. Do not invent fields.
- **Condition:** Wind & Water Tight (used) only; `itemCondition` = `https://schema.org/UsedCondition`; never "certified for shipping".
- **Delivery:** never promise a delivery time; locked phrase is "about two weeks"; "all-in quote" framing is allowed (no `$`).
- `LocalBusiness` is one canonical entity (Cincinnati). Do **not** rewrite its address/geo per city — express city relevance via `Service.areaServed`.
- `SITE_URL` = `https://steelboxdirect.com` (no trailing slash).
- Quick Facts is a **summary**: cap specs at ~8 rows and FAQs at ~3. Semantic HTML only. Gated to content/commercial pages (never quote/calculator/legal/admin/404).
- All dynamic routes keep `export const prerender = true`.
- UDO L002: execution is subagent-driven; the orchestrator coordinates and keeps the audit trail only.

---

## File Structure

**Create:**
- `src/lib/schema/entities.ts` — global graph nodes + stable `@id` constants (pure).
- `src/lib/schema/types.ts` — `PageSchemaInput` union, `QuickFacts`/`QuickFact`/`QuickFaq`, `BuildSchemaArgs`.
- `src/lib/schema/buildPageSchema.ts` — the pure builder (all page-kind branches).
- `src/lib/schema/index.ts` — barrel re-export.
- `src/lib/schema/entities.test.ts`, `buildPageSchema.test.ts` — vitest unit tests.
- `src/components/QuickFacts.astro` — the visible B-v2 block.
- `vitest.config.ts` — minimal config.

**Modify:**
- `package.json` — add `vitest` dev-dep + `test` script.
- `src/layouts/BaseLayout.astro` — call `buildPageSchema`, emit single `@graph`, render `<QuickFacts>` above footer; add `schema` prop.
- `src/components/Schema.astro` — **deleted** at the end (its role moves into the module); BaseLayout stops importing it.
- The pages listed in Phase 3 — remove head-slot schema, pass the `schema` prop.

**Data-module touch (small, additive):**
- `src/pages/container-buying-guide/index.astro` and `src/pages/locations/index.astro` own FAQ/city data locally; the plan passes it through the prop (no new data module required).

---

## Interfaces (single source — every task refers here)

```ts
// src/lib/schema/types.ts
export type GuideTopic = 'size' | 'condition' | 'delivery' | 'cost' | 'permits';

export interface QuickFact { k: string; v: string }
export interface QuickFaq { q: string; a: string }

export interface QuickFacts {
  entityTitle: string;          // header — the page's main entity
  entitySubtitle?: string;      // e.g. "Wind & Water Tight · used, sold as-is"
  specs: QuickFact[];           // primary grid (≤ 8)
  faqs: QuickFaq[];             // ≤ 3
  showPriceDisclaimer: boolean; // render the avg-price disclaimer line
}

// Discriminated union describing a page's main entity.
export type PageSchemaInput =
  | { kind: 'home' }
  | { kind: 'productHub'; faqs: QuickFaq[] }
  | { kind: 'product'; container: import('../../data/containers').Container;
      price?: import('../../data/pricing').ContainerPrice;
      specs: QuickFact[] }
  | { kind: 'city'; city: import('../../data/cities').City; faqs: QuickFaq[] }
  | { kind: 'useCase'; audience: string; title: string; specs: QuickFact[]; faqs: QuickFaq[] }
  | { kind: 'guide'; topic?: GuideTopic; title: string; specs: QuickFact[]; faqs: QuickFaq[] }
  | { kind: 'collection'; title: string; items: { name: string; url: string }[]; faqs: QuickFaq[] }
  | { kind: 'blogPost'; title: string; description: string; author: string;
      datePublished: string; dateModified: string; image?: string;
      takeaways: string[]; faqs: QuickFaq[] }
  | { kind: 'excluded' };       // quote/tool/legal → minimal WebPage graph, NO block

export interface BuildSchemaArgs {
  page: PageSchemaInput;
  url: string;                                  // Astro.url.href (canonical, trailing slash per route)
  title: string;
  description: string;
  breadcrumbs?: { name: string; path?: string }[];
  datePublished?: string;
  dateModified?: string;
  image?: string;                               // absolute og/article image URL
}

export interface BuiltSchema {
  graph: Record<string, unknown>[];
  quickFacts: QuickFacts | null;                // null ⇒ no visible block
}
```

---

## Phase 1 — Core module (pure TS, vitest)

### Task 1: vitest setup + global entities

**Files:**
- Modify: `package.json` (scripts + devDependencies)
- Create: `vitest.config.ts`
- Create: `src/lib/schema/types.ts` (paste the full Interfaces block above)
- Create: `src/lib/schema/entities.ts`
- Test: `src/lib/schema/entities.test.ts`

**Interfaces:**
- Produces: `SITE_URL`, `ORG_ID`, `LOCALBUSINESS_ID`, `WEBSITE_ID`, `FREEDOMCONEX_ID` (string consts); `globalNodes(): Record<string, unknown>[]` returning `[organization, freedomConex, localBusiness, website]`.

- [ ] **Step 1: Add vitest to `package.json`**

Add to `scripts`: `"test": "vitest run"`, `"test:watch": "vitest"`.
Add to `devDependencies`: `"vitest": "^2.1.0"`. Then run `npm install`.

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 3: Create `src/lib/schema/types.ts`**

Paste the entire "Interfaces" code block from the section above verbatim.

- [ ] **Step 4: Write the failing test `src/lib/schema/entities.test.ts`**

```ts
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
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `./entities`.

- [ ] **Step 6: Create `src/lib/schema/entities.ts`**

```ts
export const SITE_URL = 'https://steelboxdirect.com';
export const ORG_ID = `${SITE_URL}/#organization`;
export const LOCALBUSINESS_ID = `${SITE_URL}/#localbusiness`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const FREEDOMCONEX_ID = `${SITE_URL}/#freedomconex`;

const SAME_AS = [
  'https://maps.google.com/?cid=16337072236475848136',
  'https://www.linkedin.com/company/steel-box-direct/',
];

const WARRANTY = {
  '@type': 'WarrantyPromise',
  description: 'Lifetime Leak Warranty on Wind & Water Tight containers',
};

const OFFERED_SERVICE = {
  '@type': 'Offer',
  itemOffered: { '@type': 'Service', name: 'Wind & Water Tight Shipping Container Sales' },
  warranty: WARRANTY,
};

export function globalNodes(): Record<string, unknown>[] {
  const freedomConex = {
    '@type': 'Organization',
    '@id': FREEDOMCONEX_ID,
    name: 'Freedom Conex LLC',
    url: 'https://www.freedomconex.com',
  };

  const organization = {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'Steel Box Direct',
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/logo.png`,
    description:
      'Shipping container buying guide and quote service serving 250 miles from Cincinnati, Ohio.',
    foundingDate: '2009',
    parentOrganization: { '@id': FREEDOMCONEX_ID },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Sales',
      telephone: '+15135462543',
      url: `${SITE_URL}/quote/`,
    },
    makesOffer: OFFERED_SERVICE,
    sameAs: SAME_AS,
  };

  const localBusiness = {
    '@type': 'LocalBusiness',
    '@id': LOCALBUSINESS_ID,
    name: 'Steel Box Direct',
    url: `${SITE_URL}/`,
    image: `${SITE_URL}/logo.png`,
    telephone: '+15135462543',
    description: "Shipping container buyer's guide and sales service.",
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Cincinnati',
      addressRegion: 'OH',
      addressCountry: 'US',
    },
    geo: { '@type': 'GeoCoordinates', latitude: '39.1365839', longitude: '-84.540972' },
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: { '@type': 'GeoCoordinates', latitude: '39.1365839', longitude: '-84.540972' },
      geoRadius: '402336', // 250 miles in metres
      description:
        '250-mile radius from Cincinnati, Ohio — Ohio, Indiana, Kentucky, and western West Virginia',
    },
    hasMap: 'https://maps.google.com/?cid=16337072236475848136',
    parentOrganization: { '@id': FREEDOMCONEX_ID },
    makesOffer: OFFERED_SERVICE,
    sameAs: SAME_AS,
  };

  const website = {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: 'Steel Box Direct',
    url: `${SITE_URL}/`,
    publisher: { '@id': ORG_ID },
  };

  return [organization, freedomConex, localBusiness, website];
}
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npm test`
Expected: PASS (3 tests).

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/lib/schema/types.ts src/lib/schema/entities.ts src/lib/schema/entities.test.ts
git commit -m "feat(schema): global entity graph module + vitest"
```

---

### Task 2: `buildPageSchema` core — WebPage + breadcrumb + graph assembly + FAQ helper

**Files:**
- Create: `src/lib/schema/buildPageSchema.ts`
- Create: `src/lib/schema/index.ts`
- Test: `src/lib/schema/buildPageSchema.test.ts`

**Interfaces:**
- Consumes: `globalNodes`, the `*_ID` consts (Task 1); types (Task 1).
- Produces: `buildPageSchema(args: BuildSchemaArgs): BuiltSchema`. Internal helpers `webPageNode`, `breadcrumbNode`, `faqNode`, `nodeId(url, frag)`, and the constant business strip lives in the component (Task 9), not here.

- [ ] **Step 1: Write the failing test `src/lib/schema/buildPageSchema.test.ts`**

```ts
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
    JSON.stringify(graph, (k, v) => { if (k === '@id' && typeof v === 'string') {/*def*/} return v; });
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `./buildPageSchema`.

- [ ] **Step 3: Create `src/lib/schema/buildPageSchema.ts` (core only — page-kind branches added in Tasks 3-5)**

```ts
import type { BuildSchemaArgs, BuiltSchema, QuickFacts, QuickFaq } from './types';
import { globalNodes, ORG_ID, LOCALBUSINESS_ID, WEBSITE_ID, SITE_URL } from './entities';

const nodeId = (url: string, frag: string) => `${url}#${frag}`;

function breadcrumbNode(url: string, crumbs?: { name: string; path?: string }[]) {
  const items = crumbs && crumbs.length ? crumbs : [{ name: 'Home', path: '/' }];
  return {
    '@type': 'BreadcrumbList',
    '@id': nodeId(url, 'breadcrumb'),
    itemListElement: items.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: b.name,
      ...(b.path ? { item: `${SITE_URL}${b.path}` } : {}),
    })),
  };
}

function faqNode(url: string, faqs: QuickFaq[]) {
  return {
    '@type': 'FAQPage',
    '@id': nodeId(url, 'faq'),
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

function webPageNode(args: BuildSchemaArgs, aboutId?: string, mainEntityId?: string) {
  return {
    '@type': 'WebPage',
    '@id': nodeId(args.url, 'webpage'),
    url: args.url,
    name: args.title,
    description: args.description,
    isPartOf: { '@id': WEBSITE_ID },
    breadcrumb: { '@id': nodeId(args.url, 'breadcrumb') },
    ...(aboutId ? { about: { '@id': aboutId } } : {}),
    ...(mainEntityId ? { mainEntity: { '@id': mainEntityId } } : {}),
  };
}

export function buildPageSchema(args: BuildSchemaArgs): BuiltSchema {
  const graph: Record<string, unknown>[] = [...globalNodes()];
  const bc = breadcrumbNode(args.url, args.breadcrumbs);
  let quickFacts: QuickFacts | null = null;

  // page-kind branches are appended in Tasks 3-5; default handles 'excluded'
  const p = args.page;
  switch (p.kind) {
    // BRANCHES INSERTED IN TASKS 3-5 ABOVE THIS DEFAULT
    default: {
      graph.push(webPageNode(args, ORG_ID));
      break;
    }
  }

  graph.push(bc);
  return { graph, quickFacts };
}

// exported for tests / reuse
export { nodeId, breadcrumbNode, faqNode, webPageNode };
```

- [ ] **Step 4: Create `src/lib/schema/index.ts`**

```ts
export * from './types';
export * from './entities';
export { buildPageSchema } from './buildPageSchema';
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/schema/buildPageSchema.ts src/lib/schema/index.ts src/lib/schema/buildPageSchema.test.ts
git commit -m "feat(schema): buildPageSchema core — webpage/breadcrumb/faq + graph assembly"
```

---

### Task 3: Product + product-hub branches

**Files:**
- Modify: `src/lib/schema/buildPageSchema.ts` (add `case 'product'` and `case 'productHub'` before `default`)
- Test: `src/lib/schema/buildPageSchema.test.ts` (append cases)

**Interfaces:**
- Consumes: `Container`, `ContainerPrice` types; `priceValidUntil` from `src/data/pricing`.
- Produces: for `product`, a `Product` node `@id` `#product` with `offers` (price only when `price` provided) + quickFacts (specs from `p.specs`, no FAQ). For `productHub`, a `CollectionPage` `#collection` + FAQ node + quickFacts.

- [ ] **Step 1: Append failing tests**

```ts
import { priceValidUntil } from '../../data/pricing';

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
```

- [ ] **Step 2: Run to verify fail**

Run: `npm test` — Expected: FAIL (Product node undefined).

- [ ] **Step 3: Add the branches**

Add at the top of `buildPageSchema.ts` imports:
```ts
import { priceValidUntil } from '../../data/pricing';
```
Insert these cases inside the `switch`, before `default:`:
```ts
    case 'product': {
      const productId = nodeId(args.url, 'product');
      graph.push({
        '@type': 'Product',
        '@id': productId,
        name: p.container.name,
        description: p.container.seo.description,
        image: args.image ?? `${SITE_URL}/logo.png`,
        brand: { '@id': ORG_ID },
        category: 'Shipping Containers',
        offers: {
          '@type': 'Offer',
          priceCurrency: 'USD',
          ...(p.price ? { price: p.price.price } : {}),
          priceValidUntil,
          itemCondition: 'https://schema.org/UsedCondition',
          availability: 'https://schema.org/InStock',
          seller: { '@id': ORG_ID },
          url: args.url,
        },
      });
      graph.push(webPageNode(args, productId, productId));
      quickFacts = {
        entityTitle: p.container.name,
        entitySubtitle: 'Wind & Water Tight (used) · sold as-is',
        specs: p.specs,
        faqs: [],
        showPriceDisclaimer: Boolean(p.price),
      };
      break;
    }
    case 'productHub': {
      const collId = nodeId(args.url, 'collection');
      graph.push({ '@type': 'CollectionPage', '@id': collId, url: args.url, name: args.title, description: args.description, isPartOf: { '@id': WEBSITE_ID } });
      graph.push(faqNode(args.url, p.faqs));
      graph.push(webPageNode(args, collId, nodeId(args.url, 'faq')));
      quickFacts = { entityTitle: 'Containers for Sale', specs: [], faqs: p.faqs.slice(0, 3), showPriceDisclaimer: true };
      break;
    }
```

- [ ] **Step 4: Run to verify pass** — `npm test` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/schema/buildPageSchema.ts src/lib/schema/buildPageSchema.test.ts
git commit -m "feat(schema): product + product-hub schema branches"
```

---

### Task 4: City + use-case branches (Service node)

**Files:**
- Modify: `src/lib/schema/buildPageSchema.ts`
- Test: append cases

**Interfaces:**
- Consumes: `City` type.
- Produces: `city` → `Service` node `#service` (`provider` → LocalBusiness, `areaServed` = city; **no offers**) + FAQ + quickFacts with **no price**. `useCase` → `Service` `#service` (`provider` → LocalBusiness, `audience`) + FAQ + quickFacts.

- [ ] **Step 1: Append failing tests**

```ts
it('city branch: Service with areaServed, NO price anywhere, block $-free', () => {
  const city: any = { slug: 'cincinnati-shipping-containers', city: 'Cincinnati', state: 'OH' };
  const { graph, quickFacts } = buildPageSchema({
    url: 'https://steelboxdirect.com/cincinnati-shipping-containers/', title: 'Cincinnati', description: 'c',
    page: { kind: 'city', city, faqs: [{ q: 'Deliver?', a: 'Yes.' }] },
  });
  const svc = graph.find((n) => n['@type'] === 'Service') as any;
  expect(svc.provider).toEqual({ '@id': expect.stringContaining('#localbusiness') });
  expect(svc.areaServed.name).toContain('Cincinnati');
  expect(JSON.stringify(graph)).not.toMatch(/price|Offer|\$/);
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
```

- [ ] **Step 2: Run to verify fail** — `npm test` → FAIL.

- [ ] **Step 3: Add the branches** (insert before `default:`)

```ts
    case 'city': {
      const svcId = nodeId(args.url, 'service');
      graph.push({
        '@type': 'Service',
        '@id': svcId,
        name: `Shipping Container Delivery — ${p.city.city}, ${p.city.state}`,
        serviceType: 'Shipping container sales and delivery',
        provider: { '@id': LOCALBUSINESS_ID },
        areaServed: { '@type': 'City', name: `${p.city.city}, ${p.city.state}` },
      });
      graph.push(faqNode(args.url, p.faqs));
      graph.push(webPageNode(args, svcId, nodeId(args.url, 'faq')));
      quickFacts = {
        entityTitle: `Containers in ${p.city.city}, ${p.city.state}`,
        entitySubtitle: 'Wind & Water Tight (used) · delivered on-site',
        specs: [
          { k: 'Service area', v: `${p.city.city} + surrounding counties` },
          { k: 'Condition', v: 'Wind & Water Tight (used)' },
          { k: 'Warranty', v: 'Lifetime Leak' },
          { k: 'Delivery', v: 'All-in quote, about two weeks' },
        ],
        faqs: p.faqs.slice(0, 3),
        showPriceDisclaimer: false,
      };
      break;
    }
    case 'useCase': {
      const svcId = nodeId(args.url, 'service');
      graph.push({
        '@type': 'Service',
        '@id': svcId,
        name: p.title,
        serviceType: 'Shipping container sales and delivery',
        provider: { '@id': LOCALBUSINESS_ID },
        audience: { '@type': 'Audience', audienceType: p.audience },
      });
      graph.push(faqNode(args.url, p.faqs));
      graph.push(webPageNode(args, svcId, nodeId(args.url, 'faq')));
      quickFacts = { entityTitle: p.title, specs: p.specs, faqs: p.faqs.slice(0, 3), showPriceDisclaimer: false };
      break;
    }
```

- [ ] **Step 4: Run to verify pass** — `npm test` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/schema/buildPageSchema.ts src/lib/schema/buildPageSchema.test.ts
git commit -m "feat(schema): city + use-case Service branches (city stays \$-free)"
```

---

### Task 5: Guide/HowTo + collection + blog-post + home branches

**Files:**
- Modify: `src/lib/schema/buildPageSchema.ts`
- Create: `src/lib/schema/howto.ts` (the 5 HowTo objects migrated verbatim from `Schema.astro`)
- Test: append cases

**Interfaces:**
- Consumes: `howtoByTopic` from `./howto`.
- Produces: `guide` → `Article` `#article` (+ `HowTo` `#howto` when `topic` set) + optional FAQ. `collection` → `CollectionPage` + `ItemList`. `blogPost` → `Article` with author/dates/image + optional FAQ. `home` → uses global graph + FAQ + WebPage `about` Organization.

- [ ] **Step 1: Create `src/lib/schema/howto.ts`**

Copy the five HowTo objects verbatim from `src/components/Schema.astro` lines 148-303 (`sizeGuideSchema`, `conditionGuideSchema`, `deliveryGuideSchema`, `pricingGuideSchema`, `permitsGuideSchema`) but (a) drop the per-object `'@context'` line, (b) add `'@id'` at call time, (c) for `pricingGuideSchema` keep its `CONDITION`/`STATS` imports. Export:
```ts
import { CONDITION } from '../../data/condition';
import { STATS } from '../../data/stats';
import type { GuideTopic } from './types';
// ... the five objects (without '@context') ...
export const howtoByTopic: Record<GuideTopic, Record<string, unknown>> = {
  size: sizeGuideSchema, condition: conditionGuideSchema, delivery: deliveryGuideSchema,
  cost: pricingGuideSchema, permits: permitsGuideSchema,
};
```

- [ ] **Step 2: Append failing tests**

```ts
it('guide branch with topic adds an Article and a HowTo node', () => {
  const { graph } = buildPageSchema({ url: 'https://steelboxdirect.com/size/', title: 'Size', description: 's', page: { kind: 'guide', topic: 'size', title: 'Size', specs: [], faqs: [] } });
  expect(graph.some((n) => n['@type'] === 'Article')).toBe(true);
  expect(graph.some((n) => n['@type'] === 'HowTo')).toBe(true);
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
```

- [ ] **Step 3: Run to verify fail** — `npm test` → FAIL.

- [ ] **Step 4: Add the branches** (import `howtoByTopic`; insert before `default:`)

```ts
    case 'home': {
      graph.push(faqNode(args.url, []).mainEntity ? faqNode(args.url, (p as any).faqs ?? []) : faqNode(args.url, []));
      graph.push(webPageNode(args, ORG_ID, nodeId(args.url, 'faq')));
      // home faqs are passed via a dedicated field below (see note)
      break;
    }
    case 'guide': {
      const artId = nodeId(args.url, 'article');
      graph.push({
        '@type': 'Article',
        '@id': artId,
        headline: args.title,
        description: args.description,
        image: args.image ?? `${SITE_URL}/og-image.png`,
        datePublished: args.datePublished ?? '2026-03-10',
        dateModified: args.dateModified ?? args.datePublished ?? '2026-03-10',
        author: { '@id': ORG_ID },
        publisher: { '@id': ORG_ID },
        mainEntityOfPage: { '@id': nodeId(args.url, 'webpage') },
      });
      if (p.topic) graph.push({ ...howtoByTopic[p.topic], '@id': nodeId(args.url, 'howto') });
      if (p.faqs.length) graph.push(faqNode(args.url, p.faqs));
      graph.push(webPageNode(args, artId, p.faqs.length ? nodeId(args.url, 'faq') : artId));
      quickFacts = { entityTitle: p.title, specs: p.specs, faqs: p.faqs.slice(0, 3), showPriceDisclaimer: false };
      break;
    }
    case 'collection': {
      const collId = nodeId(args.url, 'collection');
      graph.push({
        '@type': 'CollectionPage',
        '@id': collId,
        url: args.url,
        name: args.title,
        description: args.description,
        isPartOf: { '@id': WEBSITE_ID },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: p.items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
        },
      });
      if (p.faqs.length) graph.push(faqNode(args.url, p.faqs));
      graph.push(webPageNode(args, collId, p.faqs.length ? nodeId(args.url, 'faq') : collId));
      quickFacts = { entityTitle: args.title, specs: [], faqs: p.faqs.slice(0, 3), showPriceDisclaimer: false };
      break;
    }
    case 'blogPost': {
      const artId = nodeId(args.url, 'article');
      graph.push({
        '@type': 'Article',
        '@id': artId,
        headline: p.title,
        description: p.description,
        image: p.image ?? `${SITE_URL}/og-image.png`,
        datePublished: p.datePublished,
        dateModified: p.dateModified,
        author: { '@id': ORG_ID },
        publisher: { '@id': ORG_ID },
        mainEntityOfPage: { '@id': nodeId(args.url, 'webpage') },
      });
      if (p.faqs.length) graph.push(faqNode(args.url, p.faqs));
      graph.push(webPageNode(args, artId, p.faqs.length ? nodeId(args.url, 'faq') : artId));
      quickFacts = {
        entityTitle: p.title,
        specs: p.takeaways.slice(0, 6).map((t) => ({ k: 'Takeaway', v: t })),
        faqs: p.faqs.slice(0, 3),
        showPriceDisclaimer: false,
      };
      break;
    }
```

**Note on `home`:** the `home` union member takes no fields, but the homepage needs its FAQs in the block + FAQPage. Change the union member to `{ kind: 'home'; faqs: QuickFaq[] }` in `types.ts`, and implement the branch as:
```ts
    case 'home': {
      graph.push(faqNode(args.url, p.faqs));
      graph.push(webPageNode(args, ORG_ID, nodeId(args.url, 'faq')));
      quickFacts = { entityTitle: 'Steel Box Direct', entitySubtitle: 'Wind & Water Tight containers · Est. 2009', specs: [], faqs: p.faqs.slice(0, 3), showPriceDisclaimer: false };
      break;
    }
```
(Delete the first placeholder `home` case shown above; keep only this one.)

- [ ] **Step 5: Run to verify pass** — `npm test` → PASS (all branches).

- [ ] **Step 6: Commit**

```bash
git add src/lib/schema/howto.ts src/lib/schema/buildPageSchema.ts src/lib/schema/buildPageSchema.test.ts src/lib/schema/types.ts
git commit -m "feat(schema): guide/HowTo, collection, blogPost, home branches"
```

---

## Phase 2 — Rendering

### Task 6: `QuickFacts.astro` component (B-v2)

**Files:**
- Create: `src/components/QuickFacts.astro`
- Verify: `npm run build`

**Interfaces:**
- Consumes: `QuickFacts` type.
- Produces: `<QuickFacts facts={QuickFacts} />` — renders nothing when `facts` is null.

- [ ] **Step 1: Create the component**

```astro
---
import type { QuickFacts } from '../lib/schema/types';
interface Props { facts: QuickFacts | null }
const { facts } = Astro.props;
---
{facts && (
  <section class="qf" aria-labelledby="qf-h">
    <div class="wrap">
      <div class="qf-card">
        <div class="qf-hd">
          <h2 id="qf-h">{facts.entityTitle}{facts.entitySubtitle && <small>{facts.entitySubtitle}</small>}</h2>
          <span class="qf-stamp">Quick Facts</span>
        </div>

        {facts.specs.length > 0 && (
          <div class="qf-primary">
            <div class="qf-seclbl">This page</div>
            <div class="qf-specgrid">
              {facts.specs.slice(0, 8).map((s) => (
                <div class="qf-spec"><div class="k">{s.k}</div><div class="v">{s.v}</div></div>
              ))}
            </div>
          </div>
        )}

        <div class="qf-biz">
          <div class="bcell"><span class="k">Seller</span><span class="v">Steel Box Direct · Est. 2009</span></div>
          <div class="bcell"><span class="k">Serves</span><span class="v">250 mi from Cincinnati, OH</span></div>
          <div class="bcell"><span class="k">Call</span><span class="v"><a href="tel:+15135462543">(513) 546-2543</a></span></div>
        </div>

        {facts.faqs.length > 0 && (
          <div class="qf-faq">
            <div class="qf-seclbl">Frequently asked</div>
            <dl>
              {facts.faqs.slice(0, 3).map((f) => (<><dt>{f.q}</dt><dd>{f.a}</dd></>))}
            </dl>
          </div>
        )}

        {facts.showPriceDisclaimer && (
          <p class="qf-disc">Prices shown are average starting prices — your quote may be more or less.</p>
        )}
      </div>
    </div>
  </section>
)}

<style>
  .qf{padding:44px 0;background:var(--cream)}
  .qf-card{background:var(--cream);color:var(--ink);border:2.5px solid var(--ink);box-shadow:10px 10px 0 var(--ink)}
  .qf-hd{display:flex;align-items:baseline;justify-content:space-between;gap:16px;padding:16px 22px 12px;border-bottom:2.5px solid var(--ink);background:var(--yellow)}
  .qf-hd h2{margin:0;font-family:var(--narrow);text-transform:uppercase;letter-spacing:-.01em;font-size:clamp(22px,3vw,27px);line-height:.95}
  .qf-hd h2 small{display:block;font-family:var(--mono);font-weight:500;font-size:11px;letter-spacing:.1em;color:#5a4a00;margin-top:6px}
  .qf-stamp{font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;border:1.5px solid var(--ink);padding:4px 9px;white-space:nowrap}
  .qf-seclbl{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#5a5a52;padding:12px 22px 6px}
  .qf-specgrid{display:grid;grid-template-columns:repeat(3,1fr)}
  .qf-spec{padding:12px 22px 14px;border-top:1px solid rgba(11,15,26,.13)}
  .qf-spec:not(:nth-child(3n)){border-right:1px solid rgba(11,15,26,.13)}
  .qf-spec .k{font-family:var(--mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#5a5a52;margin-bottom:5px}
  .qf-spec .v{font-family:var(--narrow);font-weight:700;font-size:19px;line-height:1}
  .qf-biz{display:flex;flex-wrap:wrap;border-top:2.5px solid var(--ink);background:rgba(11,15,26,.03)}
  .qf-biz .bcell{flex:1 1 auto;padding:11px 22px;border-right:1px solid rgba(11,15,26,.1)}
  .qf-biz .bcell:last-child{border-right:none}
  .qf-biz .k{display:block;font-family:var(--mono);font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:#5a5a52;margin-bottom:3px}
  .qf-biz .v{font-family:var(--narrow);font-weight:700;font-size:15px}
  .qf-faq{padding:16px 22px 20px;border-top:2.5px solid var(--ink)}
  .qf-faq dl{margin:0}
  .qf-faq dt{font-family:var(--narrow);font-weight:700;text-transform:uppercase;font-size:14px;margin-top:10px}
  .qf-faq dt:first-of-type{margin-top:0}
  .qf-faq dd{margin:2px 0 0;font-size:13px;line-height:1.45;color:#33332e}
  .qf-disc{margin:0;padding:10px 22px 16px;font-family:var(--mono);font-size:11px;color:#5a5a52}
  @media (max-width:640px){ .qf-specgrid{grid-template-columns:1fr 1fr} .qf-spec:not(:nth-child(3n)){border-right:none} .qf-spec:nth-child(odd){border-right:1px solid rgba(11,15,26,.13)} }
</style>
```

- [ ] **Step 2: Build** — Run `npm run build`. Expected: clean (component unused until Task 7, so build only proves it compiles once imported; if Astro tree-shakes it, proceed).

- [ ] **Step 3: Commit**

```bash
git add src/components/QuickFacts.astro
git commit -m "feat(schema): QuickFacts.astro visible block (B-v2)"
```

---

### Task 7: Wire into `BaseLayout.astro`

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Verify: `npm run build` + one page renders block + head `@graph`

**Interfaces:**
- Consumes: `buildPageSchema`, `PageSchemaInput`; `QuickFacts.astro`.
- Produces: `BaseLayout` accepts a new prop `schema?: PageSchemaInput`. When omitted, defaults to `{ kind: 'excluded' }`. Emits `<script type="application/ld+json">` with `{ '@context', '@graph' }`. Renders `<QuickFacts>` above `<SiteFooter>`.

- [ ] **Step 1: Add imports + prop**

In the frontmatter, add:
```ts
import QuickFacts from '../components/QuickFacts.astro';
import { buildPageSchema } from '../lib/schema';
import type { PageSchemaInput } from '../lib/schema/types';
```
Add to `Props`: `schema?: PageSchemaInput;`
Destructure it with default: `schema = { kind: 'excluded' } as PageSchemaInput,`
Build the result after prop destructuring:
```ts
const built = buildPageSchema({
  page: schema,
  url: Astro.url.href,
  title,
  description,
  breadcrumbs,
  datePublished,
  dateModified,
  image: resolvedOgImage === 'https://steelboxdirect.com/og-image.png' ? undefined : resolvedOgImage,
});
const jsonLd = { '@context': 'https://schema.org', '@graph': built.graph };
```

- [ ] **Step 2: Replace the `<Schema .../>` line + slot in `<head>`**

Delete line 92 (`<Schema ... />`) and its import (line 2). Replace with:
```astro
<script type="application/ld+json" is:inline set:html={JSON.stringify(jsonLd)} />
<slot name="head" />
```
(Keep the `<slot name="head" />` for any remaining non-schema head content; page schema head-slots are removed in Phase 3.)

- [ ] **Step 3: Render the block above the footer**

Between `</main>` and `<SiteFooter />` (line ~112), add:
```astro
    <QuickFacts facts={built.quickFacts} />
```

- [ ] **Step 4: Build + spot check**

Run: `npm run build`
Then: `grep -c '"@graph"' dist/index.html` → Expected: `1`.
Confirm no page emits two ld+json blocks yet is fine — Phase 3 removes the old ones.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat(schema): emit single @graph + render QuickFacts in BaseLayout"
```

---

## Phase 3 — Page migration

Each task: (a) delete the page's head-slot schema script(s), (b) add the `schema={...}` prop to `<BaseLayout>`, (c) build. The `specs`/`faqs` arrays each task passes ARE the real content — copy them from the page's existing visible data. After each task run `npm run build` and confirm the page still emits exactly one `@graph` (via `grep`).

### Task 8: Product pages

**Files:** Modify `src/pages/shipping-containers-for-sale/[slug].astro`, `src/pages/shipping-containers-for-sale/index.astro`.

- [ ] **[slug].astro** — delete the `breadcrumb` + `productSchema` consts (lines 18-46) and both `<script slot="head">` lines (50-51). Add breadcrumbs + schema prop:
```astro
<BaseLayout title={c.seo.title} description={c.seo.description} pageType="product"
  breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Shipping Containers for Sale', path: '/shipping-containers-for-sale/' }, { name: c.name }]}
  schema={{ kind: 'product', container: c, price,
    specs: [
      { k: 'Exterior', v: c.specs.externalDims },
      { k: 'Interior', v: c.specs.internalDims },
      { k: 'Door opening', v: c.specs.doorOpening },
      { k: 'Cubic capacity', v: c.specs.cubicCap },
      { k: 'Condition', v: 'Wind & Water Tight (used)' },
      { k: 'Warranty', v: 'Lifetime Leak' },
      ...(price ? [{ k: 'Avg. starting price', v: formatPrice(price.price) }] : []),
    ] }}>
```
- [ ] **index.astro (hub)** — delete `faqSchema` const + its `<script slot="head">` (line 49). Add:
```astro
  schema={{ kind: 'productHub', faqs: faqs.map((f) => ({ q: f.q, a: f.a })) }}
```
- [ ] Build: `npm run build`; `grep -c '@graph' dist/shipping-containers-for-sale/index.html` → `1`.
- [ ] Commit: `git commit -am "refactor(schema): migrate product hub + detail to @graph module"`

### Task 9: City pages

**Files:** Modify `src/pages/[citySlug].astro`.

- [ ] Delete the entire `<Fragment slot="head">…</Fragment>` inline FAQPage (lines ~30-61). Keep `cityOverride` prop **removed** (LocalBusiness stays canonical now) OR leave it — the module ignores it. Add:
```astro
  schema={{ kind: 'city', city: c, faqs: [
    { q: `Do you deliver shipping containers to ${c.city}, ${c.state}?`, a: `Yes. We deliver to ${c.delivery.counties.join(', ')} and surrounding areas. ${c.delivery.body}` },
    { q: `What counties near ${c.city} do you serve?`, a: `We serve ${c.delivery.counties.join(', ')} with flat-fee delivery from Cincinnati, Ohio.` },
    { q: `How quickly can I get a container quote in ${c.city}?`, a: c.cta.body },
  ] }}
```
- [ ] Remove the now-unused `cityOverride={...}` prop and (if present) `datePublished`/`dateModified` that only fed the old Article. Keep `breadcrumbs` if desired: `breadcrumbs={[{ name: 'Home', path: '/' }, { name: c.city }]}`.
- [ ] Build; verify a city page HTML has **no `$`**: `grep -o '\$[0-9]' dist/cincinnati-shipping-containers/index.html` → empty.
- [ ] Commit: `git commit -am "refactor(schema): city pages → Service node, \$-free, no per-city LocalBusiness rewrite"`

### Task 10: Use-case pages (farmers, contractors, homeowners, businesses)

**Files:** Modify all four `src/pages/for/*/index.astro`.

For each page: delete the `<Fragment slot="head">` inline FAQPage; add `schema={{ kind: 'useCase', audience: '<x>', title: '<page H1>', specs: [...], faqs: faqs.map((f)=>({q:f.q,a:f.a})) }}`. Use each page's real `faqs` const and 3-5 real specs. Example (farmers):
```astro
  schema={{ kind: 'useCase', audience: 'farmers', title: 'Container Storage for Farms',
    specs: [
      { k: 'Foundation', v: 'None needed — sits on a gravel pad' },
      { k: 'Condition', v: 'Wind & Water Tight (used)' },
      { k: 'Warranty', v: 'Lifetime Leak' },
      { k: 'Service area', v: 'OH · IN · KY · W. WV' },
    ],
    faqs: faqs.map((f) => ({ q: f.q, a: f.a })) }}
```
audiences: farmers→`'farmers'`, contractors→`'contractors'`, homeowners→`'homeowners'`, businesses→`'businesses'`. Titles: use each page's existing H1 wording.
- [ ] Build after all four; commit: `git commit -am "refactor(schema): use-case pages → Service branch"`

### Task 11: Guide pages (size, condition, delivery, cost, permits)

**Files:** Modify `src/pages/size/index.astro`, `condition/index.astro`, `delivery/index.astro`, `cost/index.astro`, `permits/index.astro`.

For each: add `schema={{ kind: 'guide', topic: '<topic>', title: '<H1>', specs: [], faqs: [<any visible FAQs on the page, else []>] }}`. Keep existing `datePublished`/`dateModified`; keep `guideTopic` prop (still valid) — but the HowTo now comes from the module via `topic`, so it is fine that both exist (module owns emission). Example (size):
```astro
  schema={{ kind: 'guide', topic: 'size', title: 'What Size Shipping Container Do You Need?', specs: [], faqs: [] }}
```
- [ ] Build; commit: `git commit -am "refactor(schema): guide pages → Article+HowTo branch"`

### Task 12: Reference + buying guide

**Files:** Modify `src/pages/container-reference/index.astro`, `src/pages/container-buying-guide/index.astro`.

- [ ] **container-reference** — delete `faqSchema` const + `<script slot="head">`. Add:
```astro
  schema={{ kind: 'guide', title: 'Container Reference: Dimensions, Markings & Lifecycle', specs: [], faqs: referenceFaqs.map((f) => ({ q: f.q, a: f.a })) }}
```
- [ ] **container-buying-guide** — delete `faqSchema` const + `<script slot="head">`. Add:
```astro
  schema={{ kind: 'guide', title: 'How to Buy a Shipping Container Safely', specs: [], faqs: faqs.map((f) => ({ q: f.q, a: f.a })) }}
```
- [ ] Build; commit: `git commit -am "refactor(schema): reference + buying-guide → module"`

### Task 13: Locations (gap fix — adds FAQPage it never had)

**Files:** Modify `src/pages/locations/index.astro`.

- [ ] Read the visible FAQ (lines ~128-160) and transcribe each Q/A into a `faqs` const in the frontmatter. Build the city ItemList from `cities`:
```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { cities } from '../../data/cities';
const faqs = [ /* { q, a } transcribed verbatim from the visible FAQ below */ ];
const items = cities.map((c) => ({ name: `${c.city}, ${c.state}`, url: `https://steelboxdirect.com/${c.slug}/` }));
---
<BaseLayout title="Shipping Containers Near You — Steel Box Direct Delivery Locations"
  description="Steel Box Direct delivers ... Check your city."
  pageType="guide"
  breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Locations' }]}
  schema={{ kind: 'collection', title: 'Delivery Locations', items, faqs }}>
```
- [ ] Build; commit: `git commit -am "refactor(schema): locations → CollectionPage + adds missing FAQPage"`

### Task 14: Blog index + category + posts

**Files:** Modify `src/pages/blog/index.astro`, `src/pages/blog/category/[category].astro`, `src/pages/blog/[...slug].astro`.

- [ ] **blog/index** — delete `blogSchema` const + `<script slot="head">`. Add:
```astro
  schema={{ kind: 'collection', title: 'Steel Box Direct Blog', items: posts.map(({ post }) => ({ name: post.data.title, url: `https://steelboxdirect.com/blog/${post.slug}/` })), faqs: [] }}
```
- [ ] **blog/category/[category]** — mirror the same `collection` shape with that category's posts + title `\`${category} — Steel Box Direct Blog\``.
- [ ] **blog/[...slug]** — delete the conditional `faqSchema` const + `<script slot="head">`. Add:
```astro
  schema={{ kind: 'blogPost', title: post.data.title, description: post.data.description, author: post.data.author,
    datePublished: post.data.pubDate.toISOString().slice(0,10),
    dateModified: (post.data.updatedDate ?? post.data.pubDate).toISOString().slice(0,10),
    image: ogImageUrl, takeaways: post.data.takeaways ?? [], faqs: post.data.faff ?? post.data.faq ?? [] }}
```
(Use `post.data.faq ?? []` — correct the typo; `faq` is the real field.)
- [ ] Build; commit: `git commit -am "refactor(schema): blog index/category/post → module"`

### Task 15: Home

**Files:** Modify `src/pages/index.astro`.

- [ ] Delete the `faqSchema` const (line ~29 area) + its `<script slot="head">`. Import `homeFaqs`; add:
```astro
  schema={{ kind: 'home', faqs: homeFaqs.map((f) => ({ q: f.q, a: f.a })) }}
```
(`import { homeFaqs } from '../data/homeFaq';` if not already imported.)
- [ ] Build; `grep -c '@graph' dist/index.html` → `1`; `grep -c 'application/ld+json' dist/index.html` → `1`.
- [ ] Commit: `git commit -am "refactor(schema): home → module (single @graph)"`

### Task 16: Retire `Schema.astro` + sweep

**Files:** Delete `src/components/Schema.astro`. Grep the repo.

- [ ] Run: `grep -rn "Schema.astro\|slot=\"head\"" src/pages src/layouts` — Expected: only non-schema head-slot uses remain (if any). No page should still inject `application/ld+json` via a slot: `grep -rn "application/ld+json" src/pages` → Expected: empty.
- [ ] Delete `src/components/Schema.astro`.
- [ ] Remove now-dead props from `BaseLayout` if unused (`guideTopic`, `cityOverride`, `datePublished`, `dateModified` may still feed `buildPageSchema` — keep those; remove only truly unused ones).
- [ ] Build: `npm run build` → clean.
- [ ] Commit: `git commit -am "refactor(schema): retire Schema.astro; module is sole schema source"`

---

## Phase 4 — Validation

### Task 17: Full validation + verification

**Files:** none (verification only).

- [ ] **Unit tests:** `npm test` → all green.
- [ ] **Build:** `npm run build` → clean, no warnings about the schema module.
- [ ] **Single-graph check (each representative page):**
```bash
for f in index shipping-containers-for-sale/index cincinnati-shipping-containers/index for/farmers/index size/index locations/index blog/index; do
  echo "$f: $(grep -c '"@graph"' dist/$f.html) graph(s), $(grep -c 'application/ld+json' dist/$f.html) ld+json";
done
```
Expected: each `1 graph, 1 ld+json`.
- [ ] **@graph integrity (node script or manual):** for each representative page, extract the ld+json, `JSON.parse`, assert every `{ '@id': X }` reference resolves to a node with that `@id`. (Reuse the walk logic from Task 2's test.)
- [ ] **Rich Results Test / Schema Markup Validator:** paste the built HTML (or run the deployed preview URL) for: home, one product spec, one city, `size`, one use-case, one blog post, `locations`. Expected: valid `Organization`, `LocalBusiness`, `WebPage`, plus per-page `Product`/`Service`/`Article`+`HowTo`/`FAQPage`/`CollectionPage`. Zero errors; only the intentional honest-merchant warnings (no `aggregateRating`, no `shippingDetails`).
- [ ] **Anti-drift check:** for each page kind, confirm the visible Quick Facts strings (specs + FAQ questions) appear in the emitted `@graph` JSON. City page: confirm NO `$` in either the block or the graph.
- [ ] **Playwright visual (desktop 1280 + mobile 390):** Quick Facts renders above the footer on home, a product page, a city page, a guide, a blog post; no horizontal overflow; the city block shows no `$`; excluded pages (`/quote/`, `/size/calculator`, `/privacy`) show NO block.
- [ ] **Report:** write findings to `.outputs/` and hand back to the orchestrator for the audit trail. Do not deploy — owner controls the push.

---

## Self-Review (author)

- **Spec coverage:** §4 module → Tasks 1-5; §4.3 rendering → Tasks 6-7; §5 per-page mapping → Tasks 8-15 (every included page kind has a task; excluded kinds handled by the `excluded` default + gating in Task 7); §6 visual → Task 6; §7 guardrails → Global Constraints + city test (Task 4) + validation (Task 17); §8 validation → Task 17. Locations FAQ gap + city LocalBusiness fix are explicitly tasked (13, 9).
- **Placeholder scan:** every code step contains real code; per-page tasks carry their actual specs/faqs. Fixed the `post.data.faff` typo → `post.data.faq`.
- **Type consistency:** `PageSchemaInput`/`QuickFacts`/`BuildSchemaArgs` defined once in `types.ts`; `home` member updated to carry `faqs` in Task 5 (noted). `buildPageSchema`, `globalNodes`, `howtoByTopic`, `nodeId`/`faqNode`/`webPageNode` names consistent across tasks.
- **Known follow-through:** Task 5 revises the `home` union member added in Task 1 — the Task 5 note calls this out so the engineer updates `types.ts` accordingly.
```
