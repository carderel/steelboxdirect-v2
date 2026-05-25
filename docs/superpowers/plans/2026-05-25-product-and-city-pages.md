# Product Pages + City Page Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build SEO product pages for 3 container types under `/shipping-containers-for-sale/` and refactor 4 flat city `.astro` files into a single data-driven template — both using the same `getStaticPaths()` + data file pattern.

**Architecture:** Each section has a typed data file (`containers.ts`, `cities.ts`) and one Astro template that calls `getStaticPaths()` to generate all pages statically. All pages are pre-rendered at build time. The nav gets a Containers link pointing to the hub.

**Tech Stack:** Astro 4, TypeScript, Cloudflare Pages (`output: 'hybrid'`), `npm run dev` on localhost:4322, `npm run build` to verify static generation.

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| CREATE | `src/data/containers.ts` | All product data — specs, copy, SEO, use cases |
| CREATE | `src/data/cities.ts` | All city data — delivery areas, map coords, features, stats |
| CREATE | `src/pages/shipping-containers-for-sale/index.astro` | Hub landing page |
| CREATE | `src/pages/shipping-containers-for-sale/[slug].astro` | Spec page template (generates 3 pages) |
| CREATE | `src/pages/[city-slug].astro` | City template (generates 4 pages, same URLs) |
| MODIFY | `src/layouts/BaseLayout.astro` | Add `<slot name="head" />` + Containers nav link |
| DELETE | `src/pages/cincinnati-shipping-containers.astro` | Replaced by template |
| DELETE | `src/pages/dayton-shipping-containers.astro` | Replaced by template |
| DELETE | `src/pages/indianapolis-shipping-containers.astro` | Replaced by template |
| DELETE | `src/pages/louisville-shipping-containers.astro` | Replaced by template |

---

## Task 1: Create `src/data/containers.ts`

**Files:**
- Create: `src/data/containers.ts`

- [ ] **Step 1: Create the data file**

```typescript
// src/data/containers.ts

export interface ContainerSpecs {
  externalDims: string;
  internalDims: string;
  doorOpening: string;
  payload: string;
  tare: string;
  cubicCap: string;
}

export interface Container {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  keySpecs: [string, string, string];
  specs: ContainerSpecs;
  useCases: Array<{ title: string; body: string }>;
  compareNote: string;
  seo: { title: string; description: string };
}

export const containers: Container[] = [
  {
    slug: '20-foot-shipping-container',
    name: '20-Foot Shipping Container',
    shortName: '20ft',
    tagline: 'Fits a standard driveway. Stores a full garage.',
    keySpecs: ["20' × 8' × 8'6\"", '1,172 cu ft', "7'8\" door width"],
    specs: {
      externalDims: "20' L × 8' W × 8'6\" H",
      internalDims: "19'4\" L × 7'8\" W × 7'10\" H",
      doorOpening:  "7'8\" W × 7'5\" H",
      payload:      '47,900 lbs',
      tare:         '4,850 lbs',
      cubicCap:     '1,172 cu ft',
    },
    useCases: [
      { title: 'Farm & Ranch Storage',   body: "Secure, weatherproof storage for equipment, feed, and tools without a permanent structure permit in most counties." },
      { title: 'Construction Job Site',  body: "Lock up tools and materials on-site. The 20ft fits most job sites where a 40ft would block access." },
      { title: 'Backyard Workshop',      body: "Convert into a workshop, hobby room, or overflow storage. Fits most suburban lots and standard driveways." },
    ],
    compareNote: "Half the length of a 40ft — fits tighter spaces and costs less to deliver.",
    seo: {
      title:       '20-Foot Shipping Container for Sale | Steel Box Direct',
      description: 'Buy a 20ft shipping container delivered within 250 miles of Cincinnati. Cargo-worthy and one-trip units available. Get a quote within 4 business hours.',
    },
  },
  {
    slug: '40-foot-shipping-container',
    name: '40-Foot Shipping Container',
    shortName: '40ft',
    tagline: 'Maximum storage. The industry standard for serious projects.',
    keySpecs: ["40' × 8' × 8'6\"", '2,390 cu ft', "7'8\" door width"],
    specs: {
      externalDims: "40' L × 8' W × 8'6\" H",
      internalDims: "39'5\" L × 7'8\" W × 7'10\" H",
      doorOpening:  "7'8\" W × 7'5\" H",
      payload:      '59,039 lbs',
      tare:         '8,160 lbs',
      cubicCap:     '2,390 cu ft',
    },
    useCases: [
      { title: 'Large Farm Operations', body: "Store tractors, implements, and seasonal equipment. Two 20ft worth of space in a single footprint with one door to manage." },
      { title: 'Commercial Storage',   body: "Inventory overflow, seasonal stock, or on-site warehousing. The 40ft is the industry standard for a reason." },
      { title: 'Permanent Structures', body: "The most popular base for container conversions — offices, workshops, and guest spaces. Enough room to split into zones." },
    ],
    compareNote: "Twice the storage of a 20ft — needs more clearance for delivery and placement.",
    seo: {
      title:       '40-Foot Shipping Container for Sale | Steel Box Direct',
      description: 'Buy a 40ft shipping container delivered within 250 miles of Cincinnati. Standard cargo-worthy units with flat-fee local delivery. Get a quote in 4 hours.',
    },
  },
  {
    slug: '40-foot-one-trip-container',
    name: '40-Foot One-Trip Container',
    shortName: '40ft One-Trip',
    tagline: 'Like new. One ocean crossing. Ready for anything.',
    keySpecs: ["40' × 8' × 8'6\"", '2,390 cu ft', 'Near-new condition'],
    specs: {
      externalDims: "40' L × 8' W × 8'6\" H",
      internalDims: "39'5\" L × 7'8\" W × 7'10\" H",
      doorOpening:  "7'8\" W × 7'5\" H",
      payload:      '59,039 lbs',
      tare:         '8,160 lbs',
      cubicCap:     '2,390 cu ft',
    },
    useCases: [
      { title: 'Conversions & Builds',      body: "The cleanest canvas for container homes, offices, and studios. No rust, no previous cargo residue, no surprises." },
      { title: 'Food & Sensitive Storage',  body: "When cargo-worthy just isn't clean enough. One-trip containers haven't carried anything other than their initial load." },
      { title: 'Long-Term Investment',      body: "Premium condition means lower maintenance over time. If it's staying on your property for 10+ years, one-trip is worth the premium." },
    ],
    compareNote: "Same footprint as the standard 40ft — premium condition, higher price point.",
    seo: {
      title:       '40-Foot One-Trip Shipping Container for Sale | Steel Box Direct',
      description: 'Buy a like-new 40ft one-trip container delivered within 250 miles of Cincinnati. One ocean crossing, near-perfect condition. Get a quote in 4 hours.',
    },
  },
];
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "/Users/flackfizer/Documents/Projects/Container Site"
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/data/containers.ts
git commit -m "feat: add containers data file"
```

---

## Task 2: Add head slot to BaseLayout

This lets spec and hub pages inject JSON-LD schema into `<head>` cleanly.

**Files:**
- Modify: `src/layouts/BaseLayout.astro` (inside `<head>`, after the closing `</Schema>` tag)

- [ ] **Step 1: Add the slot**

Open `src/layouts/BaseLayout.astro`. Find this line (around line 42):

```astro
    <Schema pageType={pageType} pageTitle={title} pageDescription={description} guideTopic={guideTopic} />
```

Add one line immediately after it:

```astro
    <Schema pageType={pageType} pageTitle={title} pageDescription={description} guideTopic={guideTopic} />
    <slot name="head" />
```

- [ ] **Step 2: Verify dev server still starts**

```bash
npm run dev
```

Open http://localhost:4322 — homepage should render with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat: add named head slot to BaseLayout for per-page schema"
```

---

## Task 3: Create spec page template

**Files:**
- Create: `src/pages/shipping-containers-for-sale/[slug].astro`

- [ ] **Step 1: Create the directory and file**

```bash
mkdir -p "/Users/flackfizer/Documents/Projects/Container Site/src/pages/shipping-containers-for-sale"
```

Then create `src/pages/shipping-containers-for-sale/[slug].astro`:

```astro
---
export const prerender = true;

import BaseLayout from '../../layouts/BaseLayout.astro';
import { containers } from '../../data/containers';
import type { Container } from '../../data/containers';

export function getStaticPaths() {
  return containers.map((c) => ({ params: { slug: c.slug }, props: { container: c } }));
}

interface Props { container: Container }
const { container: c } = Astro.props;
const others = containers.filter((x) => x.slug !== c.slug);

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://steelboxdirect.com/" },
    { "@type": "ListItem", "position": 2, "name": "Shipping Containers for Sale", "item": "https://steelboxdirect.com/shipping-containers-for-sale/" },
    { "@type": "ListItem", "position": 3, "name": c.name, "item": `https://steelboxdirect.com/shipping-containers-for-sale/${c.slug}/` },
  ]
};
---

<BaseLayout title={c.seo.title} description={c.seo.description} pageType="guide">
  <script type="application/ld+json" slot="head" is:inline set:html={JSON.stringify(breadcrumb)} />

  <!-- HERO -->
  <section class="prod-hero">
    <div class="wrap">
      <div class="breadcrumb-nav">
        <a href="/shipping-containers-for-sale/">Shipping Containers for Sale</a>
        <span>›</span>
        <span>{c.name}</span>
      </div>
      <h1 class="big prod-h1">{c.name}</h1>
      <div class="key-specs">
        {c.keySpecs.map((s) => <span class="spec-chip">{s}</span>)}
      </div>
      <p class="lede">{c.tagline}</p>
      <a href="/quote/" class="btn prod-cta">Get a Quote <svg viewBox="0 0 24 24"><path d="M5 12h14M13 5l7 7-7 7"/></svg></a>
    </div>
  </section>

  <!-- SPECS TABLE -->
  <section class="prod-specs">
    <div class="wrap">
      <h2 class="section-title">Specifications</h2>
      <div class="specs-card">
        <table class="specs-table">
          <tbody>
            <tr><th>External Dimensions</th><td>{c.specs.externalDims}</td></tr>
            <tr><th>Internal Dimensions</th><td>{c.specs.internalDims}</td></tr>
            <tr><th>Door Opening</th><td>{c.specs.doorOpening}</td></tr>
            <tr><th>Payload Capacity</th><td>{c.specs.payload}</td></tr>
            <tr><th>Tare Weight</th><td>{c.specs.tare}</td></tr>
            <tr><th>Cubic Capacity</th><td>{c.specs.cubicCap}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- SIZE COMPARE -->
  <section class="prod-compare">
    <div class="wrap">
      <h2 class="section-title">How It Compares</h2>
      <div class="compare-card">
        <table class="compare-table">
          <thead>
            <tr>
              <th></th>
              {containers.map((x) => (
                <th class={x.slug === c.slug ? 'current-col' : ''}>
                  {x.slug === c.slug
                    ? <span>{x.shortName}</span>
                    : <a href={`/shipping-containers-for-sale/${x.slug}/`}>{x.shortName}</a>
                  }
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>External</th>
              {containers.map((x) => <td class={x.slug === c.slug ? 'current-col' : ''}>{x.specs.externalDims}</td>)}
            </tr>
            <tr>
              <th>Internal</th>
              {containers.map((x) => <td class={x.slug === c.slug ? 'current-col' : ''}>{x.specs.internalDims}</td>)}
            </tr>
            <tr>
              <th>Capacity</th>
              {containers.map((x) => <td class={x.slug === c.slug ? 'current-col' : ''}>{x.specs.cubicCap}</td>)}
            </tr>
            <tr>
              <th>Best for</th>
              {containers.map((x) => <td class={x.slug === c.slug ? 'current-col' : ''}>{x.compareNote}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- USE CASES -->
  <section class="prod-uses">
    <div class="wrap">
      <h2 class="section-title">Common Uses</h2>
      <div class="uses-grid">
        {c.useCases.map((u) => (
          <div class="feature">
            <h4>{u.title}</h4>
            <p>{u.body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>

  <!-- PRICING -->
  <section class="prod-pricing">
    <div class="wrap">
      <div class="pricing-card">
        <div class="m">Pricing</div>
        <p>We don't post fixed prices — steel and freight costs change weekly, and a real number matters more than a stale one on a webpage.</p>
        <a href="/quote/" class="btn">Get a Current Quote <svg viewBox="0 0 24 24"><path d="M5 12h14M13 5l7 7-7 7"/></svg></a>
        <p class="response-note">Most requests answered within 4 business hours.</p>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta-section">
    <div class="wrap">
      <div class="cta-box">
        <h2>Ready for a {c.shortName} quote?</h2>
        <p>Tell us your zip code and we'll get you a real number — fast.</p>
        <a href="/quote/" class="btn">Get My Quote <svg viewBox="0 0 24 24"><path d="M5 12h14M13 5l7 7-7 7"/></svg></a>
      </div>
    </div>
  </section>

</BaseLayout>

<style>
  /* HERO */
  .prod-hero { padding: 100px 0 72px; background: var(--yellow); border-bottom: 2.5px solid var(--ink); }
  .breadcrumb-nav { font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: .08em; opacity: .6; margin-bottom: 24px; display: flex; align-items: center; gap: 8px; }
  .breadcrumb-nav a { color: inherit; text-decoration: none; }
  .breadcrumb-nav a:hover { opacity: 1; }
  .prod-h1 { margin-bottom: 24px; }
  .key-specs { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 24px; }
  .spec-chip { font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: .08em; background: var(--ink); color: var(--yellow); padding: 6px 14px; }
  .lede { font-size: 22px; line-height: 1.4; max-width: 680px; font-weight: 500; margin-bottom: 32px; }
  .prod-cta { margin-top: 8px; }

  /* SPECS TABLE */
  .prod-specs { padding: 96px 0; background: var(--cream); border-bottom: 1.5px solid rgba(11,15,26,.1); }
  .section-title { font-family: var(--narrow); font-size: 36px; text-transform: uppercase; margin-bottom: 32px; }
  .specs-card { background: white; border: 2.5px solid var(--ink); box-shadow: 8px 8px 0 var(--ink); overflow: hidden; }
  .specs-table { width: 100%; border-collapse: collapse; }
  .specs-table tr { border-bottom: 1.5px solid rgba(11,15,26,.1); }
  .specs-table tr:last-child { border-bottom: none; }
  .specs-table th { font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: .08em; opacity: .55; text-align: left; padding: 18px 24px; width: 40%; font-weight: 500; }
  .specs-table td { font-family: var(--narrow); font-size: 20px; font-weight: 600; padding: 18px 24px; }

  /* COMPARE */
  .prod-compare { padding: 96px 0; background: white; border-bottom: 1.5px solid rgba(11,15,26,.1); }
  .compare-card { background: var(--cream); border: 2.5px solid var(--ink); overflow-x: auto; }
  .compare-table { width: 100%; border-collapse: collapse; min-width: 520px; }
  .compare-table th, .compare-table td { padding: 16px 20px; text-align: left; border-bottom: 1.5px solid rgba(11,15,26,.1); font-size: 14px; }
  .compare-table thead th { font-family: var(--narrow); font-size: 18px; font-weight: 700; text-transform: uppercase; background: var(--cream); }
  .compare-table tbody th { font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: .08em; opacity: .55; font-weight: 500; background: var(--cream); }
  .compare-table tr:last-child td, .compare-table tr:last-child th { border-bottom: none; }
  .current-col { background: var(--ink); color: var(--yellow); }
  .current-col a { color: var(--yellow); }
  .compare-table a { color: var(--ink); text-decoration: underline; text-underline-offset: 3px; }

  /* USE CASES */
  .prod-uses { padding: 96px 0; background: var(--cream); border-bottom: 1.5px solid rgba(11,15,26,.1); }
  .uses-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
  .feature { border-left: 4px solid var(--yellow); padding-left: 24px; }
  .feature h4 { font-family: var(--narrow); font-size: 22px; text-transform: uppercase; margin-bottom: 10px; }
  .feature p { opacity: .8; line-height: 1.5; font-size: 15px; }

  /* PRICING */
  .prod-pricing { padding: 80px 0; background: white; }
  .pricing-card { background: var(--ink); color: var(--cream); padding: 48px; border: 2.5px solid var(--ink); max-width: 600px; }
  .pricing-card .m { color: var(--yellow); font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 16px; }
  .pricing-card p { font-size: 17px; line-height: 1.6; opacity: .8; margin-bottom: 28px; }
  .response-note { font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: .08em; opacity: .45; margin-top: 16px; margin-bottom: 0; }

  /* CTA */
  .cta-section { padding: 80px 0 120px; background: var(--cream); }
  .cta-box { background: var(--ink); color: var(--cream); padding: 64px; text-align: center; border: 2.5px solid var(--ink); box-shadow: 12px 12px 0 var(--yellow); }
  .cta-box h2 { font-family: var(--narrow); font-size: 48px; text-transform: uppercase; margin-bottom: 16px; }
  .cta-box p { font-size: 18px; opacity: .8; margin-bottom: 40px; }

  @media (max-width: 768px) {
    .uses-grid { grid-template-columns: 1fr; }
    .cta-box { padding: 40px 24px; }
    .cta-box h2 { font-size: 32px; }
    .pricing-card { padding: 32px 24px; }
  }
</style>
```

- [ ] **Step 2: Verify dev server shows spec pages**

```bash
npm run dev
```

Open all three in browser and confirm they render:
- http://localhost:4322/shipping-containers-for-sale/20-foot-shipping-container/
- http://localhost:4322/shipping-containers-for-sale/40-foot-shipping-container/
- http://localhost:4322/shipping-containers-for-sale/40-foot-one-trip-container/

Check: H1 is correct per page, spec table populates, compare table highlights current column, use cases render, pricing section has no dollar amounts.

- [ ] **Step 3: Verify build generates all 3 pages**

```bash
npm run build 2>&1 | grep -E "shipping-containers-for-sale|error|Error"
```

Expected: three lines containing `shipping-containers-for-sale/20-foot`, `40-foot`, `40-foot-one-trip`. No errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/shipping-containers-for-sale/
git commit -m "feat: add container spec page template with getStaticPaths"
```

---

## Task 4: Create hub page

**Files:**
- Create: `src/pages/shipping-containers-for-sale/index.astro`

- [ ] **Step 1: Create the hub page**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { containers } from '../../data/containers';

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What size shipping container do I need?",
      "acceptedAnswer": { "@type": "Answer", "text": "A 20ft container fits most residential lots and single-car driveways, storing roughly the equivalent of a full garage. A 40ft container doubles that capacity and is the standard for farm, commercial, and conversion projects. If you need near-new condition for a conversion or sensitive storage, choose a 40ft one-trip." }
    },
    {
      "@type": "Question",
      "name": "What is the difference between cargo-worthy and one-trip?",
      "acceptedAnswer": { "@type": "Answer", "text": "Cargo-worthy containers have been used for multiple shipping voyages but are structurally sound and wind/water tight. One-trip containers made a single ocean crossing — they are essentially new and show minimal wear. One-trip units cost more and are best for conversions or applications requiring pristine interiors." }
    },
    {
      "@type": "Question",
      "name": "Do you deliver to my area?",
      "acceptedAnswer": { "@type": "Answer", "text": "We deliver within 250 miles of Cincinnati, covering Ohio, Indiana, Kentucky, and surrounding areas. This includes the Cincinnati, Dayton, Indianapolis, and Louisville metros and their surrounding counties." }
    },
    {
      "@type": "Question",
      "name": "How long does delivery take?",
      "acceptedAnswer": { "@type": "Answer", "text": "Most quote requests are answered within 4 business hours. Delivery scheduling depends on inventory and your location, but we typically place units within days of your order being confirmed." }
    },
    {
      "@type": "Question",
      "name": "Can I modify or convert a shipping container?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. Containers can be cut, insulated, electrified, and fitted with doors and windows. For conversions we recommend one-trip units for the cleanest starting point. Local permit requirements vary — contact us and we can point you toward the right resources for your county." }
    },
  ]
};
---

<BaseLayout
  title="Shipping Containers for Sale | Steel Box Direct"
  description="Buy a 20ft, 40ft, or 40ft one-trip shipping container delivered within 250 miles of Cincinnati. No broker markup. Get a quote within 4 business hours."
  pageType="guide"
>
  <script type="application/ld+json" slot="head" is:inline set:html={JSON.stringify(faqSchema)} />

  <!-- HERO -->
  <section class="hub-hero">
    <div class="wrap">
      <div class="sh">
        <span class="idx">Products</span>
        <span class="nm">Steel Box Direct</span>
        <span class="tg">No broker · Local delivery · Est. 2009</span>
      </div>
      <h1 class="big">Shipping Containers<br>for <em>Sale.</em></h1>
      <p class="lede">Three sizes. Cargo-worthy and one-trip condition. Delivered within 250 miles of Cincinnati — to your driveway, job site, or farm.</p>
    </div>
  </section>

  <!-- PRODUCT CARDS -->
  <section class="hub-products">
    <div class="wrap">
      <div class="products-grid">
        {containers.map((c) => (
          <a class="product-card" href={`/shipping-containers-for-sale/${c.slug}/`}>
            <div class="pc-eyebrow">{c.shortName}</div>
            <h2 class="pc-name">{c.name}</h2>
            <div class="pc-dims">{c.specs.externalDims}</div>
            <div class="pc-cap">{c.specs.cubicCap} capacity</div>
            <p class="pc-tag">{c.tagline}</p>
            <div class="pc-cta">See specs <svg viewBox="0 0 24 24"><path d="M5 12h14M13 5l7 7-7 7"/></svg></div>
          </a>
        ))}
      </div>
    </div>
  </section>

  <!-- COMPARISON TABLE -->
  <section class="hub-compare">
    <div class="wrap">
      <h2 class="section-title">Compare All Sizes</h2>
      <div class="compare-wrap">
        <table class="compare-table">
          <thead>
            <tr>
              <th></th>
              {containers.map((c) => (
                <th><a href={`/shipping-containers-for-sale/${c.slug}/`}>{c.shortName}</a></th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>External</th>
              {containers.map((c) => <td>{c.specs.externalDims}</td>)}
            </tr>
            <tr>
              <th>Internal</th>
              {containers.map((c) => <td>{c.specs.internalDims}</td>)}
            </tr>
            <tr>
              <th>Door Opening</th>
              {containers.map((c) => <td>{c.specs.doorOpening}</td>)}
            </tr>
            <tr>
              <th>Cubic Capacity</th>
              {containers.map((c) => <td>{c.specs.cubicCap}</td>)}
            </tr>
            <tr>
              <th>Payload</th>
              {containers.map((c) => <td>{c.specs.payload}</td>)}
            </tr>
            <tr>
              <th>Best For</th>
              {containers.map((c) => <td>{c.compareNote}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- USE CASE MATCHER -->
  <section class="hub-matcher">
    <div class="wrap">
      <h2 class="section-title">Not Sure Which Size?</h2>
      <div class="matcher-grid">
        <a class="matcher-card" href="/shipping-containers-for-sale/20-foot-shipping-container/">
          <div class="mc-label">Tight on space</div>
          <h3>Standard driveway, suburban lot, or job site with limited clearance</h3>
          <div class="mc-rec">→ 20ft container</div>
        </a>
        <a class="matcher-card" href="/shipping-containers-for-sale/40-foot-shipping-container/">
          <div class="mc-label">Maximum storage</div>
          <h3>Farm, commercial property, or wide-open land where size isn't a constraint</h3>
          <div class="mc-rec">→ 40ft container</div>
        </a>
        <a class="matcher-card" href="/shipping-containers-for-sale/40-foot-one-trip-container/">
          <div class="mc-label">Conversion or build</div>
          <h3>You're turning the container into something — office, studio, or living space</h3>
          <div class="mc-rec">→ 40ft one-trip</div>
        </a>
      </div>
    </div>
  </section>

  <!-- WHY STEEL BOX -->
  <div class="why-grid">
    <div class="why-blk why-1">
      <span class="why-lbl">§ 01 · Pricing</span>
      <div class="why-num">$0</div>
      <h3>No broker<br>markup</h3>
      <p>You deal directly with us. No middleman adding margin between you and the container yard.</p>
      <span class="why-tag">All-in pricing, always</span>
    </div>
    <div class="why-blk why-2">
      <span class="why-lbl">§ 02 · Delivery</span>
      <div class="why-num">250</div>
      <h3>Regional<br>depots</h3>
      <p>Containers pull from yards near your city. Shorter haul means lower freight and faster scheduling.</p>
      <span class="why-tag">Miles of coverage</span>
    </div>
    <div class="why-blk why-3">
      <span class="why-lbl">§ 03 · Service</span>
      <div class="why-num">4h</div>
      <h3>Real<br>follow-through</h3>
      <p>Most quote requests answered within 4 business hours. We pick up the phone.</p>
      <span class="why-tag">Response guarantee</span>
    </div>
  </div>

  <!-- FAQ -->
  <section class="hub-faq">
    <div class="wrap">
      <h2 class="section-title">Common Questions</h2>
      <div class="faq-list">
        <div class="faq-item">
          <h3>What size shipping container do I need?</h3>
          <p>A 20ft fits most residential lots and single-car driveways — roughly a full garage worth of storage. A 40ft doubles that and is the standard for farm, commercial, and conversion projects. If you need near-new condition for a build, choose a 40ft one-trip.</p>
        </div>
        <div class="faq-item">
          <h3>What's the difference between cargo-worthy and one-trip?</h3>
          <p>Cargo-worthy containers have completed multiple shipping voyages but are structurally sound and wind/water tight. One-trip containers made a single ocean crossing — essentially new with minimal wear. One-trip costs more and is best for conversions or applications requiring pristine interiors.</p>
        </div>
        <div class="faq-item">
          <h3>Do you deliver to my area?</h3>
          <p>We deliver within 250 miles of Cincinnati, covering Ohio, Indiana, Kentucky, and surrounding areas — including the Cincinnati, Dayton, Indianapolis, and Louisville metros and their surrounding counties.</p>
        </div>
        <div class="faq-item">
          <h3>How long does delivery take?</h3>
          <p>Most quote requests are answered within 4 business hours. Delivery scheduling depends on inventory and your location, but we typically place units within days of your order being confirmed.</p>
        </div>
        <div class="faq-item">
          <h3>Can I modify or convert a shipping container?</h3>
          <p>Yes — containers can be cut, insulated, electrified, and fitted with doors and windows. For conversions we recommend one-trip units for the cleanest starting point. Local permit requirements vary; contact us and we'll point you toward the right resources for your county.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta-section">
    <div class="wrap">
      <div class="cta-box">
        <h2>Ready to get a quote?</h2>
        <p>Tell us your size, zip code, and intended use — we'll get back to you within 4 business hours.</p>
        <a href="/quote/" class="btn">Get My Quote <svg viewBox="0 0 24 24"><path d="M5 12h14M13 5l7 7-7 7"/></svg></a>
      </div>
    </div>
  </section>

</BaseLayout>

<style>
  /* HERO */
  .hub-hero { padding: 120px 0 80px; background: var(--yellow); border-bottom: 2.5px solid var(--ink); }
  .lede { font-size: 22px; line-height: 1.4; max-width: 720px; font-weight: 500; margin-top: 28px; }

  /* PRODUCT CARDS */
  .hub-products { padding: 96px 0; background: var(--cream); border-bottom: 1.5px solid rgba(11,15,26,.1); }
  .products-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
  .product-card { display: flex; flex-direction: column; gap: 10px; background: white; border: 2.5px solid var(--ink); padding: 40px; box-shadow: 8px 8px 0 var(--ink); text-decoration: none; color: var(--ink); transition: transform .15s, box-shadow .15s; }
  .product-card:hover { transform: translate(-2px, -2px); box-shadow: 10px 10px 0 var(--ink); }
  .pc-eyebrow { font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: .1em; color: var(--ink); opacity: .5; }
  .pc-name { font-family: var(--narrow); font-size: 28px; text-transform: uppercase; font-weight: 700; margin: 0; line-height: 1.1; }
  .pc-dims { font-family: var(--mono); font-size: 12px; opacity: .6; }
  .pc-cap { font-family: var(--mono); font-size: 12px; opacity: .6; }
  .pc-tag { font-size: 15px; opacity: .75; line-height: 1.5; flex: 1; margin: 8px 0 0; }
  .pc-cta { font-family: var(--narrow); font-size: 16px; font-weight: 700; text-transform: uppercase; display: flex; align-items: center; gap: 6px; color: var(--ink); margin-top: auto; padding-top: 16px; border-top: 1.5px solid rgba(11,15,26,.1); }
  .pc-cta svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2; }

  /* COMPARE */
  .hub-compare { padding: 96px 0; background: white; border-bottom: 1.5px solid rgba(11,15,26,.1); }
  .section-title { font-family: var(--narrow); font-size: 36px; text-transform: uppercase; margin-bottom: 32px; }
  .compare-wrap { overflow-x: auto; border: 2.5px solid var(--ink); }
  .compare-table { width: 100%; border-collapse: collapse; min-width: 520px; }
  .compare-table th, .compare-table td { padding: 16px 20px; text-align: left; border-bottom: 1.5px solid rgba(11,15,26,.1); font-size: 14px; }
  .compare-table thead th { font-family: var(--narrow); font-size: 20px; font-weight: 700; text-transform: uppercase; background: var(--ink); color: var(--yellow); }
  .compare-table thead th:first-child { background: var(--ink); color: transparent; }
  .compare-table thead a { color: var(--yellow); text-decoration: none; }
  .compare-table thead a:hover { text-decoration: underline; }
  .compare-table tbody th { font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: .08em; opacity: .55; font-weight: 500; background: var(--cream); width: 20%; }
  .compare-table tr:last-child td, .compare-table tr:last-child th { border-bottom: none; }

  /* MATCHER */
  .hub-matcher { padding: 96px 0; background: var(--cream); border-bottom: 1.5px solid rgba(11,15,26,.1); }
  .matcher-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .matcher-card { display: flex; flex-direction: column; gap: 12px; padding: 32px; border: 2.5px solid var(--ink); background: white; text-decoration: none; color: var(--ink); box-shadow: 6px 6px 0 var(--ink); transition: transform .15s, box-shadow .15s; }
  .matcher-card:hover { transform: translate(-2px,-2px); box-shadow: 8px 8px 0 var(--ink); }
  .mc-label { font-family: var(--mono); font-size: 10px; text-transform: uppercase; letter-spacing: .1em; background: var(--yellow); padding: 4px 10px; align-self: flex-start; }
  .matcher-card h3 { font-size: 15px; line-height: 1.5; font-weight: 500; margin: 0; flex: 1; }
  .mc-rec { font-family: var(--narrow); font-size: 18px; font-weight: 700; text-transform: uppercase; margin-top: auto; }

  /* WHY GRID — matches /locations/ pattern exactly */
  .why-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
  .why-blk { padding: 64px 48px; display: flex; flex-direction: column; gap: 16px; border-right: 1.5px solid rgba(11,15,26,.15); }
  .why-blk:last-child { border-right: none; }
  .why-lbl { font-family: var(--mono); font-size: 10px; text-transform: uppercase; letter-spacing: .1em; opacity: .5; }
  .why-num { font-family: var(--narrow); font-size: 72px; font-weight: 800; line-height: 1; }
  .why-blk h3 { font-family: var(--narrow); font-size: 32px; text-transform: uppercase; line-height: 1.1; margin: 0; }
  .why-blk p { opacity: .7; line-height: 1.6; font-size: 15px; flex: 1; }
  .why-tag { font-family: var(--mono); font-size: 10px; text-transform: uppercase; letter-spacing: .08em; opacity: .45; }
  .why-1 { background: var(--yellow); }
  .why-2 { background: var(--cobalt, #2d3ab1); color: white; }
  .why-3 { background: var(--green, #2a7d4f); color: white; }

  /* FAQ */
  .hub-faq { padding: 96px 0; background: var(--cream); border-bottom: 1.5px solid rgba(11,15,26,.1); }
  .faq-list { display: flex; flex-direction: column; gap: 0; border: 2.5px solid var(--ink); }
  .faq-item { padding: 32px 40px; border-bottom: 1.5px solid rgba(11,15,26,.1); }
  .faq-item:last-child { border-bottom: none; }
  .faq-item h3 { font-family: var(--narrow); font-size: 22px; text-transform: uppercase; margin-bottom: 12px; }
  .faq-item p { opacity: .75; line-height: 1.6; max-width: 740px; }

  /* CTA */
  .cta-section { padding: 80px 0 120px; background: var(--cream); }
  .cta-box { background: var(--ink); color: var(--cream); padding: 64px; text-align: center; border: 2.5px solid var(--ink); box-shadow: 12px 12px 0 var(--yellow); }
  .cta-box h2 { font-family: var(--narrow); font-size: 48px; text-transform: uppercase; margin-bottom: 16px; }
  .cta-box p { font-size: 18px; opacity: .8; margin-bottom: 40px; }

  @media (max-width: 960px) {
    .products-grid, .matcher-grid, .why-grid { grid-template-columns: 1fr; }
    .why-blk { border-right: none; border-bottom: 1.5px solid rgba(11,15,26,.15); }
  }
  @media (max-width: 768px) {
    .cta-box { padding: 40px 24px; }
    .cta-box h2 { font-size: 32px; }
    .faq-item { padding: 24px; }
  }
</style>
```

- [ ] **Step 2: Verify hub page in dev**

```bash
npm run dev
```

Open http://localhost:4322/shipping-containers-for-sale/ — verify all 7 sections render, product cards link to correct spec pages, compare table shows all 3 containers.

- [ ] **Step 3: Run build**

```bash
npm run build 2>&1 | grep -E "shipping-containers-for-sale|error|Error"
```

Expected: 4 lines (`index` + 3 slug pages). No errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/shipping-containers-for-sale/index.astro
git commit -m "feat: add shipping containers for sale hub page"
```

---

## Task 5: Add Containers link to nav

**Files:**
- Modify: `src/layouts/BaseLayout.astro` (the `<nav class="p">` block, around line 60)

- [ ] **Step 1: Add the nav link**

Find this block in `src/layouts/BaseLayout.astro`:

```astro
        <nav class="p" id="main-nav">
          <a href="/size/">The Five</a>
```

Add the Containers link as the first item:

```astro
        <nav class="p" id="main-nav">
          <a href="/shipping-containers-for-sale/">Containers</a>
          <a href="/size/">The Five</a>
```

- [ ] **Step 2: Verify nav in dev**

```bash
npm run dev
```

Open http://localhost:4322 — confirm "Containers" link appears in the nav and goes to `/shipping-containers-for-sale/`.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat: add Containers nav link to header"
```

---

## Task 6: Create `src/data/cities.ts`

**Files:**
- Create: `src/data/cities.ts`

- [ ] **Step 1: Create the data file**

```typescript
// src/data/cities.ts

export interface CityMap {
  bbox: string;
  marker: string;
  title: string;
}

export interface City {
  slug: string;
  city: string;
  region: string;
  eyebrow: string;
  lede: string;
  delivery: {
    headline: string;
    body: string;
    counties: string[];
  };
  map: CityMap;
  content: {
    h2: string;
    intro: string;
    features: Array<{ title: string; body: string }>;
  };
  stats: Array<{ value: string; label: string }>;
  cta: {
    headline: string;
    body: string;
  };
  seo: {
    title: string;
    description: string;
  };
}

export const cities: City[] = [
  {
    slug: 'cincinnati-shipping-containers',
    city: 'Cincinnati',
    region: 'Tri-State',
    eyebrow: 'Cincinnati · Tri-State',
    lede: 'From the suburbs of Mason to the farms of Brown County, we deliver steel-clad protection to the Queen City. No middleman, no call centers — just local expertise.',
    delivery: {
      headline: 'Hamilton, Clermont, & Warren',
      body: 'We know the Tri-State. Whether it\'s a tight suburban driveway in Indian Hill or a sprawling field in Bethel, our drivers have placed hundreds of units in your backyard.',
      counties: ['Hamilton County', 'Clermont County', 'Warren County', 'Butler County', 'Boone/Kenton/Campbell (KY)'],
    },
    map: {
      bbox: '-84.712,38.903,-84.312,39.303',
      marker: '39.1031,-84.5120',
      title: 'Cincinnati, OH delivery area map',
    },
    content: {
      h2: 'Why Cincinnati buyers choose Steel Box Direct',
      intro: 'The Cincinnati market is flooded with brokers and call centers that have never seen the containers they sell. We\'re different. We\'re a family-owned operation that understands the local landscape.',
      features: [
        { title: 'No 275-Loop Upcharge',  body: 'Unlike national sellers who charge extra for "metro" delivery, our local presence means we treat every neighborhood with the same fair pricing.' },
        { title: 'Site Visits Available', body: 'Not sure if that 40-footer will fit in your Hyde Park driveway? We can often perform a digital or physical site assessment using local knowledge of the area.' },
        { title: 'Ag-Exempt Expertise',  body: 'If you\'re in Brown, Warren, or Butler county, we can help you understand why your farm storage is likely zoned-exempt, saving you the headache of unnecessary permits.' },
      ],
    },
    stats: [
      { value: '150+', label: 'Units placed in Tri-State' },
      { value: '4.9/5', label: 'Local review average' },
    ],
    cta: {
      headline: 'Ready for a Cincinnati quote?',
      body: 'Most requests in the Tri-State are answered within 4 business hours.',
    },
    seo: {
      title: 'Shipping Containers for Sale in Cincinnati, OH | Steel Box Direct',
      description: 'Buying a shipping container in Cincinnati? We provide cargo-worthy and one-trip containers with flat-fee delivery to Hamilton, Clermont, and Warren counties.',
    },
  },
  {
    slug: 'dayton-shipping-containers',
    city: 'Dayton',
    region: 'Miami Valley',
    eyebrow: 'Dayton · Miami Valley',
    lede: 'From the tech hubs near Wright-Patterson to the manufacturing floors of the Miami Valley, we provide the steel-clad storage that keeps Dayton moving.',
    delivery: {
      headline: 'Montgomery, Greene, & Miami',
      body: 'We\'re regulars on I-75 and I-675. Whether you\'re near the Air Force Base or have a farm out in Miami County, our local knowledge ensures a smooth delivery.',
      counties: ['Montgomery County', 'Greene County', 'Miami County', 'Clark County', 'Preble County'],
    },
    map: {
      bbox: '-84.392,39.559,-83.992,39.959',
      marker: '39.7589,-84.1916',
      title: 'Dayton, OH delivery area map',
    },
    content: {
      h2: 'Why Dayton buyers choose Steel Box Direct',
      intro: 'The "Birthplace of Aviation" knows the value of good engineering. Our containers are built to the highest ISO standards, providing the same durability Dayton\'s manufacturing sector expects.',
      features: [
        { title: 'Manufacturing Storage', body: 'Dayton\'s industrial heritage means businesses often need quick, secure overflow storage. Our units are perfect for parts, tools, and inventory protection.' },
        { title: 'Wright-Patt Proximity', body: 'We understand the specific needs of contractors and personnel near the AFB. Secure, weather-tight storage is non-negotiable, and we deliver exactly that.' },
        { title: 'Miami Valley Expertise', body: 'From Beavercreek to Tipp City, we know the local zoning trends and can help you determine the best placement for your container.' },
      ],
    },
    stats: [
      { value: '85+', label: 'Units placed in Miami Valley' },
      { value: '4.8/5', label: 'Local review average' },
    ],
    cta: {
      headline: 'Ready for a Dayton quote?',
      body: 'Most requests in the Miami Valley are answered within 4 business hours.',
    },
    seo: {
      title: 'Shipping Containers for Sale in Dayton, OH | Steel Box Direct',
      description: 'Looking for a shipping container in Dayton? We offer cargo-worthy and one-trip containers with flat-fee delivery to Montgomery, Greene, and Miami counties.',
    },
  },
  {
    slug: 'indianapolis-shipping-containers',
    city: 'Indianapolis',
    region: 'Crossroads',
    eyebrow: 'Indianapolis · Crossroads',
    lede: 'From the tech corridors of Fishers to the industrial hubs of Marion County, we deliver steel-clad protection to the Crossroads of America.',
    delivery: {
      headline: 'Marion, Hamilton, & Hendricks',
      body: 'We know the Indy metro. Whether it\'s a tight site in Carmel or a sprawling logistics facility near the airport, our drivers have the experience to place your unit precisely.',
      counties: ['Marion County', 'Hamilton County', 'Hendricks County', 'Johnson County', 'Hancock County'],
    },
    map: {
      bbox: '-86.358,39.568,-85.958,39.968',
      marker: '39.7684,-86.1581',
      title: 'Indianapolis, IN delivery area map',
    },
    content: {
      h2: 'Why Indy buyers choose Steel Box Direct',
      intro: 'Indianapolis is a world-class logistics hub. We match that standard by providing high-quality, ISO-certified containers that meet the rigorous demands of Indiana\'s business and agricultural sectors.',
      features: [
        { title: 'Crossroads Logistics',  body: 'We understand that Indy is where America\'s freight moves. Our containers provide the secure, mobile storage needed to keep your operations flexible and protected.' },
        { title: 'Hamilton County Growth', body: 'With rapid development in Fishers, Carmel, and Noblesville, we provide quick-deployment storage solutions for construction, retail, and homeowners.' },
        { title: 'Hoosier Reliability',   body: 'We\'re a family-owned operation that values the same hard work and transparency that defines Indiana. No brokers, no hidden fees — just local service.' },
      ],
    },
    stats: [
      { value: '120+', label: 'Units placed in Central Indiana' },
      { value: '4.9/5', label: 'Local review average' },
    ],
    cta: {
      headline: 'Ready for an Indy quote?',
      body: 'Most requests in Central Indiana are answered within 4 business hours.',
    },
    seo: {
      title: 'Shipping Containers for Sale in Indianapolis, IN | Steel Box Direct',
      description: 'Buying a shipping container in Indy? We provide cargo-worthy and one-trip containers with flat-fee delivery to Marion, Hamilton, and Hendricks counties.',
    },
  },
  {
    slug: 'louisville-shipping-containers',
    city: 'Louisville',
    region: 'Derby City',
    eyebrow: 'Louisville · Derby City',
    lede: 'From the historic riverfront to the sprawling horse farms of Oldham County, we deliver steel-clad protection to the gateway of the South.',
    delivery: {
      headline: 'Jefferson, Oldham, & Bullitt',
      body: 'We\'re well-versed in the Louisville metro. Whether you\'re navigating the tight streets of the Highlands or have a wide-open farm in Bullitt County, we\'ve got you covered.',
      counties: ['Jefferson County', 'Oldham County', 'Bullitt County', 'Shelby County', 'Spencer County'],
    },
    map: {
      bbox: '-85.959,38.053,-85.559,38.453',
      marker: '38.2527,-85.7585',
      title: 'Louisville, KY delivery area map',
    },
    content: {
      h2: 'Why Louisville buyers choose Steel Box Direct',
      intro: 'Louisville blends industrial power with agricultural tradition. Our containers serve both worlds, providing the durable, weather-tight storage needed for bourbon barrels, farm equipment, and more.',
      features: [
        { title: 'River City Durability',   body: 'With our proximity to the Ohio River, we know the importance of moisture-resistant storage. Our containers are wind and water tight, ensuring your inventory stays dry year-round.' },
        { title: 'Horse Farm Solutions',    body: 'From Oldham to Shelby County, we provide secure tack rooms, hay storage, and equipment protection that fits seamlessly into the rural landscape.' },
        { title: 'Bourbon Country Storage', body: 'We work with local distilleries and businesses to provide scalable, secure storage solutions for inventory, barrels, and specialized equipment.' },
      ],
    },
    stats: [
      { value: '95+', label: 'Units placed in Kentuckiana' },
      { value: '4.8/5', label: 'Local review average' },
    ],
    cta: {
      headline: 'Ready for a Louisville quote?',
      body: 'Most requests in Kentuckiana are answered within 4 business hours.',
    },
    seo: {
      title: 'Shipping Containers for Sale in Louisville, KY | Steel Box Direct',
      description: 'Looking for a shipping container in Louisville? We offer cargo-worthy and one-trip containers with flat-fee delivery to Jefferson, Oldham, and Bullitt counties.',
    },
  },
];
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/data/cities.ts
git commit -m "feat: add cities data file"
```

---

## Task 7: Create city page template

**Files:**
- Create: `src/pages/[city-slug].astro`

- [ ] **Step 1: Create the template**

```astro
---
export const prerender = true;

import BaseLayout from '../layouts/BaseLayout.astro';
import { cities } from '../data/cities';
import type { City } from '../data/cities';

export function getStaticPaths() {
  return cities.map((c) => ({ params: { 'city-slug': c.slug }, props: { city: c } }));
}

interface Props { city: City }
const { city: c } = Astro.props;
---

<BaseLayout title={c.seo.title} description={c.seo.description} pageType="guide">

  <section class="local-hero">
    <div class="wrap">
      <div class="sh local_hero_eyebrow">
        <span class="idx">Region</span>
        <span class="nm">{c.eyebrow}</span>
        <span class="tg">Local Delivery Expert</span>
      </div>
      <h1 class="big local_hero_headline">Shipping Containers<br>in <em>{c.city}.</em></h1>
      <p class="lede local_hero_lede">{c.lede}</p>
    </div>
  </section>

  <section class="local-details">
    <div class="wrap">
      <div class="grid local_details_grid">

        <div class="card local_details_delivery_card">
          <div class="m local_card_label">Delivery Areas</div>
          <h3 class="local_card_headline">{c.delivery.headline}</h3>
          <p class="local_card_body">{c.delivery.body}</p>
          <ul class="check-list local_card_county_list">
            {c.delivery.counties.map((county) => <li>{county}</li>)}
          </ul>
        </div>

        <div class="card local_details_card_2">
          <iframe
            class="local-map"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${c.map.bbox}&layer=mapnik&marker=${c.map.marker}`}
            title={c.map.title}
            loading="lazy"
          ></iframe>
        </div>

      </div>
    </div>
  </section>

  <section class="local-content">
    <div class="wrap">
      <div class="row">
        <div class="main-col local_content_main">
          <h2>{c.content.h2}</h2>
          <p>{c.content.intro}</p>
          {c.content.features.map((f) => (
            <div class="feature local_feature">
              <h4 class="local_feature_headline">{f.title}</h4>
              <p class="local_feature_body">{f.body}</p>
            </div>
          ))}
        </div>
        <aside class="side-col local_content_sidebar">
          <div class="m-card local_stats_card">
            <div class="m">Local Stats</div>
            {c.stats.map((s) => (
              <div class="stat local_stat">
                <span class="v local_stat_value">{s.value}</span>
                <span class="l local_stat_label">{s.label}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  </section>

  <section class="cta-section">
    <div class="wrap">
      <div class="cta-box local_cta_box">
        <h2 class="local_cta_headline">{c.cta.headline}</h2>
        <p class="local_cta_body">{c.cta.body}</p>
        <a href="/quote/" class="btn local_cta_btn">
          Get My Local Quote
          <svg viewBox="0 0 24 24"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        </a>
      </div>
    </div>
  </section>

</BaseLayout>

<style>
  .local-hero { padding: 120px 0 80px; background: var(--yellow); border-bottom: 2.5px solid var(--ink); }
  .lede { font-size: 24px; line-height: 1.4; max-width: 800px; margin-top: 32px; font-weight: 500; }

  .local-details { padding: 96px 0; background: var(--cream); border-bottom: 1.5px solid rgba(11,15,26,.1); }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
  .card { background: white; border: 2.5px solid var(--ink); padding: 40px; box-shadow: 8px 8px 0 var(--ink); }
  .card h3 { font-family: var(--narrow); font-size: 32px; text-transform: uppercase; margin: 16px 0; }

  .check-list { list-style: none; padding: 0; margin: 24px 0 0; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .check-list li { font-family: var(--mono); font-size: 11px; text-transform: uppercase; display: flex; align-items: center; gap: 8px; letter-spacing: .05em; }
  .check-list li::before { content: "✓"; color: var(--c4-cost); font-weight: 800; }

  .local_details_card_2 { padding: 0; overflow: hidden; }
  .local-map { width: 100%; height: 100%; min-height: 320px; display: block; border: none; }

  .local-content { padding: 96px 0; background: white; }
  .row { display: grid; grid-template-columns: 2fr 1fr; gap: 80px; }
  .main-col h2 { font-family: var(--narrow); font-size: 40px; text-transform: uppercase; margin-bottom: 24px; }
  .feature { margin-top: 40px; border-left: 4px solid var(--yellow); padding-left: 24px; }
  .feature h4 { font-family: var(--narrow); font-size: 22px; text-transform: uppercase; margin-bottom: 8px; }
  .feature p { opacity: .8; line-height: 1.5; }

  .m-card { background: var(--ink); color: white; padding: 32px; border: 2.5px solid var(--ink); }
  .m-card .m { color: var(--yellow); margin-bottom: 24px; }
  .stat { margin-bottom: 24px; }
  .stat:last-child { margin-bottom: 0; }
  .stat .v { display: block; font-family: var(--narrow); font-size: 44px; font-weight: 700; color: var(--yellow); line-height: 1; }
  .stat .l { font-family: var(--mono); font-size: 10px; text-transform: uppercase; opacity: .6; letter-spacing: .1em; margin-top: 4px; display: block; }

  .cta-section { padding: 80px 0 120px; background: var(--cream); }
  .cta-box { background: var(--ink); color: var(--cream); padding: 64px; text-align: center; border: 2.5px solid var(--ink); box-shadow: 12px 12px 0 var(--yellow); }
  .cta-box h2 { font-family: var(--narrow); font-size: 48px; text-transform: uppercase; margin-bottom: 16px; }
  .cta-box p { font-size: 18px; opacity: .8; margin-bottom: 40px; }

  @media (max-width: 960px) { .row { grid-template-columns: 1fr; gap: 48px; } }
  @media (max-width: 768px) {
    .grid { grid-template-columns: 1fr; }
    .cta-box { padding: 40px 24px; }
    .cta-box h2 { font-size: 32px; }
  }
</style>
```

- [ ] **Step 2: Verify all 4 city pages in dev**

```bash
npm run dev
```

Open all four and confirm they render with the correct city-specific content and OSM maps:
- http://localhost:4322/cincinnati-shipping-containers/
- http://localhost:4322/dayton-shipping-containers/
- http://localhost:4322/indianapolis-shipping-containers/
- http://localhost:4322/louisville-shipping-containers/

Check: H1 correct per city, map renders, counties list correct, no dollar amounts anywhere.

- [ ] **Step 3: Run build — verify 4 city URLs generated**

```bash
npm run build 2>&1 | grep -E "shipping-containers|error|Error"
```

Expected: 8 lines — 4 city pages + 4 product pages (hub + 3 specs). No errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/[city-slug].astro
git commit -m "feat: add city page template with getStaticPaths — replaces 4 flat files"
```

---

## Task 8: Delete old flat city files

Only do this after Task 7 Step 3 confirms the build generates all 4 city URLs correctly.

**Files:**
- Delete: `src/pages/cincinnati-shipping-containers.astro`
- Delete: `src/pages/dayton-shipping-containers.astro`
- Delete: `src/pages/indianapolis-shipping-containers.astro`
- Delete: `src/pages/louisville-shipping-containers.astro`

- [ ] **Step 1: Delete the files**

```bash
rm "/Users/flackfizer/Documents/Projects/Container Site/src/pages/cincinnati-shipping-containers.astro"
rm "/Users/flackfizer/Documents/Projects/Container Site/src/pages/dayton-shipping-containers.astro"
rm "/Users/flackfizer/Documents/Projects/Container Site/src/pages/indianapolis-shipping-containers.astro"
rm "/Users/flackfizer/Documents/Projects/Container Site/src/pages/louisville-shipping-containers.astro"
```

- [ ] **Step 2: Run build to confirm nothing broke**

```bash
npm run build 2>&1 | grep -E "shipping-containers|error|Error"
```

Expected: same 8 lines as before, no errors. City pages still generated by `[city-slug].astro`.

- [ ] **Step 3: Spot-check one city page in preview**

```bash
npm run preview
```

Open http://localhost:4321/cincinnati-shipping-containers/ — page should render identically to before deletion.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "refactor: replace 4 flat city files with dynamic template

City pages now driven by src/data/cities.ts + [city-slug].astro.
URLs unchanged. Dayton/Indy/Louisville pricing cards replaced with OSM maps.
Adding a new city = one entry in cities.ts.
"
```

---

## Self-Review

**Spec coverage:**
- ✅ `containers.ts` data file (Task 1)
- ✅ Spec page template with `getStaticPaths()` (Task 3)
- ✅ Hub page with all 7 sections (Task 4)
- ✅ Nav Containers link (Task 5)
- ✅ `cities.ts` data file (Task 6)
- ✅ City template replacing 4 flat files (Task 7)
- ✅ Old files deleted after verification (Task 8)
- ✅ No dollar amounts on any page
- ✅ `export const prerender = true` on both dynamic routes
- ✅ BreadcrumbList schema on spec pages via head slot
- ✅ FAQ schema on hub page via head slot
- ✅ OSM maps on all 4 city pages

**Type consistency:** `Container` and `City` interfaces defined in Task 1/6, imported and used consistently in Task 3/4/7. `containers` array used in hub page for card rendering and compare table — matches the same import used in `[slug].astro`. ✅

**No placeholders:** All steps include complete code. All commands include expected output. ✅
