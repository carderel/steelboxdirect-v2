# Container Reference Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone Container Reference hub page (`/container-reference/`) fed by a new shared data module, then enrich the condition/product/size/use-case pages from that data and wire everything into a hub-and-spoke internal-linking structure.

**Architecture:** One source-of-truth TS data module (`src/data/containerReference.ts`) holds the full ISO spec table, ISO 6346 markings data, and qualitative lifecycle facts. A new Astro guide page renders it with anchor-linked sections. Existing pages import the same module (or link into the hub anchors) so numbers never drift. Schema reuses the existing `pageType="guide"` (Article + BreadcrumbList auto-emitted) plus a head-slot FAQPage.

**Tech Stack:** Astro 4 (hybrid/Cloudflare), TypeScript, existing brutalist CSS design tokens (`--yellow`/`--ink`/`--cream`, `--narrow`/`--mono`), `@astrojs/sitemap`.

## Global Constraints

Every task's requirements implicitly include this section. Values copied verbatim from the spec:

- **WWT-only framing** — SBD sells one grade: Wind & Water Tight (used). Non-sold sizes appear **informational only, never as an offer**.
- **No dollar amounts anywhere** on any page.
- **Original copy** — write fresh; never paste from the containerreference.com scrape.
- **Cite primaries firsthand:** ISO 668:2020, ISO 6346, BIC (bic-code.org), IMO CSC. No competitor-blog citations.
- **No uncited/contested statistics** — lifecycle section stays qualitative.
- **Existing page titles/H1s unchanged** (anti-cannibalization); enrichment is additive only.
- **All dynamic routes need `export const prerender = true`** (this page is static — include it).
- **Commits:** Do NOT `git commit` per task. Per project CLAUDE.md, commit only on explicit owner authorization. Instead, create a UDO checkpoint at `.checkpoints/YYYY-MM-DD-HH-MM-<label>/` every 3 completed tasks and at the end.
- **Testing reality:** No unit-test harness exists. "Verify" = `npm run build` clean + dev-serve HTTP 200 + grep served HTML for expected JSON-LD/markup + Playwright at 1280px and 390px (no horizontal page overflow; tables scroll in their own container).

**Dev server note:** `npm run dev` serves on `localhost:4321` (may increment to 4322+ if busy — check startup output). Examples below use `:4321`.

---

### Task 1: Container reference data module

**Files:**
- Create: `src/data/containerReference.ts`

**Interfaces:**
- Consumes: nothing (pure data).
- Produces:
  - `interface ReferenceSize { code: string; label: string; sold: boolean; productSlug?: string; ext: string; intL: string; intW: string; intH: string; door: string; capacity: string; note?: string }`
  - `export const referenceSizes: ReferenceSize[]` (6 entries)
  - `interface MarkingPart { part: string; detail: string }`
  - `export const bicIdParts: MarkingPart[]`
  - `interface SizeTypeCode { code: string; meaning: string }`
  - `export const lengthCodes: SizeTypeCode[]`, `export const heightWidthCodes: SizeTypeCode[]`, `export const typeCodes: SizeTypeCode[]`
  - `interface LifecycleFact { title: string; body: string }`
  - `export const lifecycleFacts: LifecycleFact[]`
  - `interface RefFaq { q: string; a: string }`
  - `export const referenceFaqs: RefFaq[]`

- [ ] **Step 1: Write the data module**

Create `src/data/containerReference.ts` with exactly this content:

```ts
// src/data/containerReference.ts
// Single source of truth for the Container Reference hub + page enrichment.
// Sources (cite firsthand): ISO 668:2020 (dimensions/ratings), ISO 6346 (coding/marking),
// BIC (bic-code.org, owner-code registry), IMO CSC (safety-approval plate).
// Guardrail: SBD sells Wind & Water Tight (used) only; `sold:false` rows are informational, never offers. No prices.

export interface ReferenceSize {
  code: string;          // short label e.g. "20ft Std"
  label: string;         // full label e.g. "20ft Standard"
  sold: boolean;         // true = SBD sells this (WWT used)
  productSlug?: string;  // product page slug when sold
  ext: string;           // external L × W × H
  intL: string;          // internal length
  intW: string;          // internal width
  intH: string;          // internal height
  door: string;          // door opening W × H
  capacity: string;      // cubic capacity
  note?: string;         // caveat (availability, permit, etc.)
}

// Figures per ISO 668:2020 general-purpose containers (fuller precision than the
// rounded product-page specs — intentional; different audiences, no same-page clash).
export const referenceSizes: ReferenceSize[] = [
  {
    code: '10ft Std', label: '10ft Standard', sold: false,
    ext: `9'9.75" × 8'0" × 8'6"`, intL: `9'3"`, intW: `7'8.5"`, intH: `7'10.1"`,
    door: `7'8.1" × 7'5.8"`, capacity: '561 cu ft',
    note: 'Typically one-trip/new only; rarely available used.',
  },
  {
    code: '20ft Std', label: '20ft Standard', sold: true, productSlug: '20-foot-shipping-container',
    ext: `19'10.5" × 8'0" × 8'6"`, intL: `19'4.2"`, intW: `7'8.5"`, intH: `7'10.1"`,
    door: `7'8.1" × 7'5.8"`, capacity: '1,172 cu ft',
  },
  {
    code: '20ft HC', label: '20ft High Cube', sold: false,
    ext: `19'10.5" × 8'0" × 9'6"`, intL: `19'4.2"`, intW: `7'8.5"`, intH: `8'10.1"`,
    door: `7'8.1" × 8'5.8"`, capacity: '1,320 cu ft',
    note: 'Uncommon in the used market; usually one-trip/new.',
  },
  {
    code: '40ft Std', label: '40ft Standard', sold: true, productSlug: '40-foot-shipping-container',
    ext: `40'0" × 8'0" × 8'6"`, intL: `39'5.7"`, intW: `7'8.5"`, intH: `7'10.1"`,
    door: `7'8.1" × 7'5.8"`, capacity: '2,387 cu ft',
  },
  {
    code: '40ft HC', label: '40ft High Cube', sold: true, productSlug: '40-foot-high-cube-container',
    ext: `40'0" × 8'0" × 9'6"`, intL: `39'5.7"`, intW: `7'8.5"`, intH: `8'10.1"`,
    door: `7'8.1" × 8'5.8"`, capacity: '2,691 cu ft',
    note: 'In 40ft, the High Cube is more common than the standard height.',
  },
  {
    code: '45ft HC', label: '45ft High Cube', sold: false,
    ext: `45'0" × 8'0" × 9'6"`, intL: `44'5.7"`, intW: `7'8.5"`, intH: `8'10.1"`,
    door: `7'8.1" × 8'5.8"`, capacity: '3,037 cu ft',
    note: 'High-cube only; usually needs an oversize permit or extendable trailer to move.',
  },
];

export interface MarkingPart { part: string; detail: string }

// The 11-character container ID per ISO 6346 (owner code registered with BIC).
export const bicIdParts: MarkingPart[] = [
  { part: 'Owner Code (3 letters)', detail: 'The registered owner/operator prefix, issued through BIC (bic-code.org).' },
  { part: 'Equipment Category (1 letter)', detail: 'U = freight container · J = detachable freight-container equipment · Z = trailer or chassis.' },
  { part: 'Serial Number (6 digits)', detail: "The individual unit's number, assigned by the owner." },
  { part: 'Check Digit (1 boxed digit)', detail: 'A math-derived digit (shown in a box) that validates the other 10 characters.' },
];

export interface SizeTypeCode { code: string; meaning: string }

// ISO 6346 size/type code — first char = length.
export const lengthCodes: SizeTypeCode[] = [
  { code: '1', meaning: '10ft' },
  { code: '2', meaning: '20ft' },
  { code: '3', meaning: '30ft' },
  { code: '4', meaning: '40ft' },
  { code: 'L', meaning: '45ft' },
];

// ISO 6346 size/type code — second char = height & width.
export const heightWidthCodes: SizeTypeCode[] = [
  { code: '0', meaning: `8'0" high` },
  { code: '2', meaning: `8'6" high (standard)` },
  { code: '4', meaning: `4'3" high (half-height)` },
  { code: '5', meaning: `9'6" high (high cube)` },
  { code: 'C', meaning: `8'6" high & over 8' wide` },
];

// ISO 6346 size/type code — third & fourth chars = container type.
export const typeCodes: SizeTypeCode[] = [
  { code: 'G0 / G1', meaning: 'General-purpose dry van (G1 = passive-vented)' },
  { code: 'V0 / V2', meaning: 'Mechanically ventilated' },
  { code: 'U0 / U1', meaning: 'Open-top' },
  { code: 'P1 / P3', meaning: 'Flat rack / platform' },
];

export interface LifecycleFact { title: string; body: string }

// Qualitative only — no contested statistics (honors the uncited-stat rule).
export const lifecycleFacts: LifecycleFact[] = [
  {
    title: 'Built from weathering steel',
    body: `Shipping containers are made from Cor-Ten (weathering) steel, which forms a stable, non-porous patina as it ages. That's why the surface rust you see on a used box is usually cosmetic, not structural — the steel is protecting itself.`,
  },
  {
    title: 'Decades of service life',
    body: `A container spends roughly 10–12 years in active maritime service, then can last 25+ years in static land use with basic maintenance. A Wind & Water Tight unit is retired from the sea, not worn out.`,
  },
  {
    title: 'Why used units are abundant',
    body: `North America imports far more containerized freight than it exports, and repositioning empty boxes back overseas costs more than building new ones. So shipping lines sell them off here — which is why a sound used container is widely available and a smart-value buy.`,
  },
];

export interface RefFaq { q: string; a: string }

export const referenceFaqs: RefFaq[] = [
  {
    q: 'What do the numbers on a shipping container mean?',
    a: `Every container carries an 11-character ID under ISO 6346: a 3-letter owner code registered with BIC, a 1-letter equipment category (U for freight containers), a 6-digit serial number, and a boxed check digit that validates the rest.`,
  },
  {
    q: 'How do I read a container’s size and type code?',
    a: `The 4-character size/type code sits below the ID. The first character is length (2 = 20ft, 4 = 40ft, L = 45ft), the second is height/width (2 = 8'6" standard, 5 = 9'6" high cube), and the last two describe the type (G1 = general-purpose dry van).`,
  },
  {
    q: 'What is the CSC plate on a shipping container?',
    a: `The CSC Safety Approval Plate, required under the IMO International Convention for Safe Containers, is the container's passport — it records structural approval and inspection history and stays with the unit into the used market.`,
  },
  {
    q: 'Is surface rust on a used container a problem?',
    a: `Usually not. Containers are built from Cor-Ten weathering steel that forms a protective patina, so surface rust is typically cosmetic. Every container we sell is Wind & Water Tight — structurally sound and sealed against rain, wind, snow, and pests.`,
  },
];
```

- [ ] **Step 2: Type-check the module compiles**

Run: `cd "/Users/flackfizer/Documents/Projects/Container Site" && npm run build 2>&1 | tail -5`
Expected: build still completes ("Complete!" / no TypeScript errors). (The module isn't imported yet, so this only confirms it doesn't break the project; Task 2's import gives it full type-checking.)

- [ ] **Step 3: Sanity-read the data**

Confirm by reading the file: 6 entries in `referenceSizes`, exactly three with `sold: true` (20ft Std, 40ft Std, 40ft HC) each with a `productSlug` that matches a slug in `src/data/containers.ts` (`20-foot-shipping-container`, `40-foot-shipping-container`, `40-foot-high-cube-container`). No dollar signs anywhere in the file.

---

### Task 2: Container Reference hub page

**Files:**
- Create: `src/pages/container-reference/index.astro`

**Interfaces:**
- Consumes (from Task 1): `referenceSizes`, `bicIdParts`, `lengthCodes`, `heightWidthCodes`, `typeCodes`, `lifecycleFacts`, `referenceFaqs`.
- Produces: the route `/container-reference/` with anchors `#dimensions`, `#markings`, `#lifecycle`.

- [ ] **Step 1: Write the page**

Create `src/pages/container-reference/index.astro` with this content:

```astro
---
export const prerender = true;

import BaseLayout from '../../layouts/BaseLayout.astro';
import {
  referenceSizes, bicIdParts, lengthCodes, heightWidthCodes, typeCodes,
  lifecycleFacts, referenceFaqs,
} from '../../data/containerReference';

const breadcrumbs = [
  { name: 'Home', path: '/' },
  { name: 'Container Reference' },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: referenceFaqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};
---

<BaseLayout
  pageType="guide"
  title="Container Reference: Dimensions, Markings & Lifecycle | Steel Box Direct"
  description="A plain-English reference for shipping container dimensions (ISO 668), markings and ISO 6346 codes, and what a used Wind & Water Tight container really is. Sizes, specs, and how to read your box."
  datePublished="2026-07-02"
  dateModified="2026-07-02"
  breadcrumbs={breadcrumbs}
>
  <script type="application/ld+json" slot="head" is:inline set:html={JSON.stringify(faqSchema)} />

  <!-- HERO -->
  <section class="ref-hero">
    <div class="wrap">
      <div class="sh">
        <span class="idx">§ Reference</span>
        <span class="nm">Steel Box Direct</span>
        <span class="tg">ISO 668 · ISO 6346 · IMO CSC</span>
      </div>
      <h1 class="big">The Container<br><em>Reference.</em></h1>
      <p class="lede">Everything technical about steel shipping containers in plain English — real dimensions, how to read the markings, and what a used Wind &amp; Water Tight box actually is.</p>
      <nav class="ref-jump">
        <a href="#dimensions">Dimensions &amp; specs</a>
        <a href="#markings">Markings &amp; ISO codes</a>
        <a href="#lifecycle">Lifecycle &amp; condition</a>
      </nav>
    </div>
  </section>

  <!-- DIMENSIONS -->
  <section id="dimensions" class="ref-section ref-dims">
    <div class="wrap">
      <h2 class="section-title">Container Dimensions &amp; Specifications</h2>
      <p class="section-intro">Standard sizes per ISO 668:2020. We sell the three marked <strong>“We sell”</strong> as Wind &amp; Water Tight (used); the rest are here for reference.</p>
      <div class="table-wrap">
        <table class="ref-table">
          <thead>
            <tr>
              <th>Size</th><th>External (L×W×H)</th><th>Interior L</th><th>Interior W</th><th>Interior H</th><th>Door (W×H)</th><th>Capacity</th><th>SBD</th>
            </tr>
          </thead>
          <tbody>
            {referenceSizes.map((s) => (
              <tr class={s.sold ? 'is-sold' : ''}>
                <th scope="row">{s.label}</th>
                <td>{s.ext}</td>
                <td>{s.intL}</td>
                <td>{s.intW}</td>
                <td>{s.intH}</td>
                <td>{s.door}</td>
                <td>{s.capacity}</td>
                <td>
                  {s.sold
                    ? <a class="sell-flag" href={`/shipping-containers-for-sale/${s.productSlug}/`}>✓ We sell →</a>
                    : <span class="info-flag">Reference</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul class="ref-notes">
        {referenceSizes.filter((s) => s.note).map((s) => (
          <li><strong>{s.label}:</strong> {s.note}</li>
        ))}
      </ul>
    </div>
  </section>

  <!-- MARKINGS -->
  <section id="markings" class="ref-section ref-markings">
    <div class="wrap">
      <h2 class="section-title">How to Read a Container’s Markings</h2>
      <p class="section-intro">Every container is stamped with a standardized identity under ISO 6346. Here’s what the letters and numbers mean.</p>

      <h3 class="ref-h3">The 11-character ID number</h3>
      <div class="table-wrap">
        <table class="ref-table">
          <thead><tr><th>Part</th><th>What it means</th></tr></thead>
          <tbody>
            {bicIdParts.map((p) => (
              <tr><th scope="row">{p.part}</th><td>{p.detail}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 class="ref-h3">The 4-character size &amp; type code</h3>
      <div class="code-grid">
        <div class="code-col">
          <h4>1st char — length</h4>
          <ul>{lengthCodes.map((c) => <li><b>{c.code}</b> {c.meaning}</li>)}</ul>
        </div>
        <div class="code-col">
          <h4>2nd char — height / width</h4>
          <ul>{heightWidthCodes.map((c) => <li><b>{c.code}</b> {c.meaning}</li>)}</ul>
        </div>
        <div class="code-col">
          <h4>3rd–4th chars — type</h4>
          <ul>{typeCodes.map((c) => <li><b>{c.code}</b> {c.meaning}</li>)}</ul>
        </div>
      </div>

      <div class="ref-callout">
        <h4>The CSC Safety Approval Plate</h4>
        <p>Required under the IMO International Convention for Safe Containers, the CSC plate is the container’s “passport” — it records structural approval and inspection history and stays with the unit into the used market.</p>
      </div>
    </div>
  </section>

  <!-- LIFECYCLE -->
  <section id="lifecycle" class="ref-section ref-lifecycle">
    <div class="wrap">
      <h2 class="section-title">Lifecycle: Why a Used Box Is a Smart Buy</h2>
      <p class="section-intro">A Wind &amp; Water Tight container is retired from the sea, not worn out. Here’s why used steel holds up.</p>
      <div class="life-grid">
        {lifecycleFacts.map((f) => (
          <div class="life-card">
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </div>
        ))}
      </div>
      <p class="ref-link-out">See exactly what we sell → <a href="/condition/">our condition guide</a>.</p>
    </div>
  </section>

  <!-- FAQ -->
  <section class="ref-section ref-faq">
    <div class="wrap">
      <h2 class="section-title">Reference FAQ</h2>
      <div class="faq-list">
        {referenceFaqs.map((f) => (
          <div class="faq-item">
            <h3>{f.q}</h3>
            <p>{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  </section>

  <!-- SPOKE LINKS + CTA -->
  <section class="ref-section ref-spokes">
    <div class="wrap">
      <h2 class="section-title">Shop by Size</h2>
      <div class="spoke-row">
        <a href="/shipping-containers-for-sale/20-foot-shipping-container/">20ft Standard →</a>
        <a href="/shipping-containers-for-sale/40-foot-shipping-container/">40ft Standard →</a>
        <a href="/shipping-containers-for-sale/40-foot-high-cube-container/">40ft High Cube →</a>
        <a href="/size/">Size guide →</a>
        <a href="/condition/">Condition guide →</a>
      </div>
      <div class="cta-box">
        <h2>Know your size? Get a real quote.</h2>
        <p>Tell us your size, zip code, and intended use — we’ll get back to you within 4 business hours.</p>
        <a href="/quote/" class="btn">Get My Quote <svg viewBox="0 0 24 24"><path d="M5 12h14M13 5l7 7-7 7"/></svg></a>
      </div>
    </div>
  </section>
</BaseLayout>

<style>
  .ref-hero { padding: 120px 0 72px; background: var(--yellow); border-bottom: 2.5px solid var(--ink); }
  .sh { display: flex; gap: 16px; flex-wrap: wrap; font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: .08em; opacity: .7; margin-bottom: 20px; }
  .ref-hero .big { font-family: var(--narrow); font-size: var(--t-big); text-transform: uppercase; line-height: .95; font-weight: 800; }
  .ref-hero .lede { font-size: 20px; line-height: 1.45; max-width: 680px; font-weight: 500; margin-top: 24px; }
  .ref-jump { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; }
  .ref-jump a { font-family: var(--mono); font-size: 12px; text-transform: uppercase; letter-spacing: .06em; background: var(--ink); color: var(--yellow); padding: 8px 14px; }
  .ref-jump a:hover { background: var(--cream); color: var(--ink); }

  .ref-section { padding: 80px 0; border-bottom: 1.5px solid rgba(11,15,26,.1); scroll-margin-top: 120px; }
  .ref-dims { background: var(--cream); }
  .ref-markings { background: white; }
  .ref-lifecycle { background: var(--cream); }
  .ref-faq { background: white; }
  .ref-spokes { background: var(--cream); }
  .section-title { font-family: var(--narrow); font-size: 36px; text-transform: uppercase; margin-bottom: 12px; }
  .section-intro { font-size: 17px; line-height: 1.6; max-width: 760px; opacity: .8; margin-bottom: 32px; }
  .ref-h3 { font-family: var(--narrow); font-size: 22px; text-transform: uppercase; margin: 36px 0 16px; }

  .table-wrap { overflow-x: auto; border: 2.5px solid var(--ink); background: white; }
  .ref-table { width: 100%; border-collapse: collapse; min-width: 720px; }
  .ref-table th, .ref-table td { padding: 12px 16px; text-align: left; border-bottom: 1.5px solid rgba(11,15,26,.1); font-size: 14px; }
  .ref-table thead th { font-family: var(--narrow); font-size: 14px; font-weight: 700; text-transform: uppercase; background: var(--ink); color: var(--yellow); position: sticky; top: 0; }
  .ref-table tbody th { font-family: var(--narrow); font-weight: 700; font-size: 15px; }
  .ref-table tr:last-child td, .ref-table tr:last-child th { border-bottom: none; }
  .ref-table tr.is-sold { background: rgba(255,211,0,.14); }
  .sell-flag { font-family: var(--mono); font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--ink); border-bottom: 2px solid var(--yellow-d); white-space: nowrap; }
  .sell-flag:hover { background: var(--ink); color: var(--yellow); }
  .info-flag { font-family: var(--mono); font-size: 10px; text-transform: uppercase; letter-spacing: .06em; opacity: .45; }
  .ref-notes { margin: 20px 0 0; padding-left: 20px; }
  .ref-notes li { font-size: 14px; line-height: 1.6; opacity: .8; margin-bottom: 6px; }

  .code-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .code-col { border: 2.5px solid var(--ink); background: white; padding: 20px 24px; }
  .code-col h4 { font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: .06em; opacity: .6; margin-bottom: 12px; }
  .code-col ul { list-style: none; margin: 0; padding: 0; }
  .code-col li { font-size: 14px; line-height: 1.7; }
  .code-col li b { font-family: var(--mono); background: var(--yellow); padding: 1px 6px; margin-right: 8px; }

  .ref-callout { margin-top: 32px; background: var(--ink); color: var(--cream); padding: 32px; border: 2.5px solid var(--ink); }
  .ref-callout h4 { font-family: var(--narrow); font-size: 22px; text-transform: uppercase; margin-bottom: 10px; color: var(--yellow); }
  .ref-callout p { line-height: 1.6; opacity: .85; max-width: 760px; }

  .life-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .life-card { border-left: 4px solid var(--yellow); padding-left: 22px; }
  .life-card h3 { font-family: var(--narrow); font-size: 20px; text-transform: uppercase; margin-bottom: 10px; }
  .life-card p { line-height: 1.6; opacity: .8; font-size: 15px; }
  .ref-link-out { margin-top: 28px; font-size: 16px; }
  .ref-link-out a { border-bottom: 2px solid var(--yellow-d); font-weight: 600; }

  .faq-list { border: 2.5px solid var(--ink); }
  .faq-item { padding: 28px 32px; border-bottom: 1.5px solid rgba(11,15,26,.1); }
  .faq-item:last-child { border-bottom: none; }
  .faq-item h3 { font-family: var(--narrow); font-size: 20px; text-transform: uppercase; margin-bottom: 10px; }
  .faq-item p { opacity: .8; line-height: 1.6; max-width: 780px; }

  .spoke-row { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 48px; }
  .spoke-row a { font-family: var(--narrow); font-weight: 700; font-size: 16px; text-transform: uppercase; border: 2.5px solid var(--ink); padding: 12px 18px; background: white; }
  .spoke-row a:hover { background: var(--ink); color: var(--yellow); }
  .cta-box { background: var(--ink); color: var(--cream); padding: 56px; text-align: center; box-shadow: 12px 12px 0 var(--yellow); }
  .cta-box h2 { font-family: var(--narrow); font-size: 40px; text-transform: uppercase; margin-bottom: 14px; }
  .cta-box p { font-size: 17px; opacity: .8; margin-bottom: 32px; }

  @media (max-width: 960px) {
    .code-grid, .life-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 768px) {
    .ref-section { padding: 56px 0; }
    .cta-box { padding: 36px 22px; }
    .cta-box h2 { font-size: 28px; }
  }
</style>
```

- [ ] **Step 2: Build**

Run: `cd "/Users/flackfizer/Documents/Projects/Container Site" && npm run build 2>&1 | tail -8`
Expected: "Complete!" with no errors; output includes a `container-reference/index.html` route.

- [ ] **Step 3: Serve & verify HTML + JSON-LD**

Run: `npm run dev` (background), then:
`curl -s http://localhost:4321/container-reference/ -o /dev/null -w "%{http_code}\n"` → `200`
`curl -s http://localhost:4321/container-reference/ | grep -c '"@type":"FAQPage"'` → `1`
`curl -s http://localhost:4321/container-reference/ | grep -c '"@type":"Article"'` → `1`
`curl -s http://localhost:4321/container-reference/ | grep -c '"@type":"BreadcrumbList"'` → `1`
`curl -s http://localhost:4321/container-reference/ | grep -c '\$'` → `0` (no dollar amounts)

---

### Task 3: Add "Reference" to the Guides nav dropdown

**Files:**
- Modify: `src/components/SiteNav.astro:31-37` (the `.nav-gd-drop` block)

**Interfaces:**
- Consumes: the `/container-reference/` route from Task 2.
- Produces: a nav link users can reach the hub from.

- [ ] **Step 1: Add the dropdown link**

In `src/components/SiteNav.astro`, inside `<div class="nav-gd-drop">`, add a new link after the Size Guide line (keep existing lines intact):

```astro
          <a href="/size/"><span class="dc">SZ</span><span>Size Guide</span></a>
          <a href="/container-reference/"><span class="dc">REF</span><span>Container Reference</span></a>
          <a href="/condition/"><span class="dc">CND</span><span>Condition Guide</span></a>
```

- [ ] **Step 2: Build & verify link present**

Run: `npm run build 2>&1 | tail -3` → "Complete!"
Run: `curl -s http://localhost:4321/ | grep -c '/container-reference/'` → `≥1`

---

### Task 4: Enrich the Condition guide (lifecycle block)

**Files:**
- Modify: `src/pages/condition/index.astro`

**Interfaces:**
- Consumes: `lifecycleFacts` from Task 1; the `/container-reference/#markings` and `#lifecycle` anchors.
- Produces: a lifecycle content block on `/condition/` linking up to the hub.

- [ ] **Step 1: Import the data**

In the frontmatter of `src/pages/condition/index.astro`, add to the imports:

```astro
import { lifecycleFacts } from '../../data/containerReference';
```

- [ ] **Step 2: Add the lifecycle block**

Inside the main `<section class="guide-content guide_content"><div class="wrap">` (append near the end of that content wrap, before it closes), add:

```astro
      <div class="cond-lifecycle">
        <h2>Why used steel holds up</h2>
        <div class="cond-life-grid">
          {lifecycleFacts.map((f) => (
            <div class="cond-life-card">
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
        <p class="cond-life-link">
          Want the technical detail? See how to read a container’s markings and full ISO dimensions in our
          <a href="/container-reference/">Container Reference</a>.
        </p>
      </div>
```

- [ ] **Step 3: Add minimal styles**

In the page's `<style>` block, add:

```css
  .cond-lifecycle { margin-top: 48px; padding-top: 40px; border-top: 2.5px solid var(--ink); }
  .cond-lifecycle h2 { font-family: var(--narrow); font-size: 30px; text-transform: uppercase; margin-bottom: 24px; }
  .cond-life-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
  .cond-life-card { border-left: 4px solid var(--c2-cond); padding-left: 20px; }
  .cond-life-card h3 { font-family: var(--narrow); font-size: 18px; text-transform: uppercase; margin-bottom: 8px; }
  .cond-life-card p { font-size: 14px; line-height: 1.6; opacity: .8; }
  .cond-life-link { margin-top: 24px; font-size: 15px; }
  .cond-life-link a { border-bottom: 2px solid var(--c2-cond); font-weight: 600; }
  @media (max-width: 860px) { .cond-life-grid { grid-template-columns: 1fr; } }
```

- [ ] **Step 4: Build & verify**

Run: `npm run build 2>&1 | tail -3` → "Complete!"
Run: `curl -s http://localhost:4321/condition/ | grep -c '/container-reference/'` → `≥1`
Run: `curl -s http://localhost:4321/condition/ | grep -c '\$'` → `0`

**→ CHECKPOINT after Task 4** (4 tasks done): create `.checkpoints/YYYY-MM-DD-HH-MM-refhub-core/checkpoint.md` summarizing the hub page + nav + condition enrichment.

---

### Task 5: Enrich the 3 product spec pages

**Files:**
- Modify: `src/pages/shipping-containers-for-sale/[slug].astro` (shared template → applies to all 3 slugs)

**Interfaces:**
- Consumes: the `/container-reference/#markings` and `#dimensions` anchors.
- Produces: markings note + full-reference links on every product page.

- [ ] **Step 1: Add a "Full spec reference" link under the specs table**

In `src/pages/shipping-containers-for-sale/[slug].astro`, inside `<section class="prod-specs">`, immediately after the `</div>` that closes `.specs-card`, add:

```astro
        <p class="spec-ref-link">
          Full ISO 668 dimensions for every size are in our
          <a href="/container-reference/#dimensions">Container Reference</a>.
        </p>
```

- [ ] **Step 2: Add a markings provenance note to the Guide Links block**

In the existing `<section class="prod-guides">` `.guides-row`, add one more guide link after the existing four:

```astro
        <a href="/container-reference/#markings" class="guide-link">How to read container markings →</a>
```

- [ ] **Step 3: Add minimal style for the spec-ref link**

In the page's `<style>` block, add:

```css
  .spec-ref-link { margin-top: 20px; font-size: 15px; opacity: .85; }
  .spec-ref-link a { border-bottom: 2px solid var(--yellow-d); font-weight: 600; }
```

- [ ] **Step 4: Build & verify all three slugs link to the hub**

Run: `npm run build 2>&1 | tail -3` → "Complete!"
For each slug, expect `≥1`:
`curl -s http://localhost:4321/shipping-containers-for-sale/20-foot-shipping-container/ | grep -c '/container-reference/'`
`curl -s http://localhost:4321/shipping-containers-for-sale/40-foot-shipping-container/ | grep -c '/container-reference/'`
`curl -s http://localhost:4321/shipping-containers-for-sale/40-foot-high-cube-container/ | grep -c '/container-reference/'`

---

### Task 6: Cross-link the Size guide + 4 use-case pages

**Files:**
- Modify: `src/pages/size/index.astro`
- Modify: `src/pages/for/farmers/index.astro`
- Modify: `src/pages/for/contractors/index.astro`
- Modify: `src/pages/for/homeowners/index.astro`
- Modify: `src/pages/for/businesses/index.astro`

**Interfaces:**
- Consumes: the `/container-reference/#dimensions` anchor.
- Produces: one contextual inbound link from each spoke to the hub (completes hub-and-spoke).

- [ ] **Step 1: Size guide cross-link**

In `src/pages/size/index.astro`, find a natural spot in the main content wrap (near where sizes/dimensions are discussed) and add:

```astro
      <p class="ref-crosslink">
        For exact interior/exterior figures on every ISO size, see the
        <a href="/container-reference/#dimensions">Container Reference</a>.
      </p>
```

Then in that page's `<style>` add (skip if a similar rule already exists):

```css
  .ref-crosslink { margin: 24px 0; font-size: 15px; }
  .ref-crosslink a { border-bottom: 2px solid var(--yellow-d); font-weight: 600; }
```

- [ ] **Step 2: Use-case contextual links (×4)**

In EACH of the four `src/pages/for/<audience>/index.astro` files, locate the existing FAQ/`.uc-` content region and add one contextual sentence with a link. Use audience-appropriate copy; each MUST contain `href="/container-reference/"`. Suggested per file (place inside an existing `<div class="wrap">` content area, not in `<head>`):

- farmers: `<p class="uc-refline">New to container specs? Our <a href="/container-reference/#dimensions">Container Reference</a> lists every size’s real dimensions and capacity.</p>`
- contractors: `<p class="uc-refline">Need exact door and interior clearances? See the <a href="/container-reference/#dimensions">Container Reference</a>.</p>`
- homeowners: `<p class="uc-refline">Curious what the markings on a container mean? Our <a href="/container-reference/#markings">Container Reference</a> decodes them.</p>`
- businesses: `<p class="uc-refline">Compare every ISO size’s capacity in the <a href="/container-reference/#dimensions">Container Reference</a>.</p>`

Add this shared style to each file's `<style>` block (or once if they share a stylesheet — they don't, so add to each):

```css
  .uc-refline { margin: 20px 0; font-size: 15px; opacity: .9; }
  .uc-refline a { border-bottom: 2px solid var(--yellow-d); font-weight: 600; }
```

- [ ] **Step 3: Build & verify each spoke links to the hub**

Run: `npm run build 2>&1 | tail -3` → "Complete!"
Expect `≥1` for each:
`curl -s http://localhost:4321/size/ | grep -c '/container-reference/'`
`curl -s http://localhost:4321/for/farmers/ | grep -c '/container-reference/'`
`curl -s http://localhost:4321/for/contractors/ | grep -c '/container-reference/'`
`curl -s http://localhost:4321/for/homeowners/ | grep -c '/container-reference/'`
`curl -s http://localhost:4321/for/businesses/ | grep -c '/container-reference/'`

---

### Task 7: Final verification + Playwright + checkpoint

**Files:** none (verification only).

- [ ] **Step 1: Clean build**

Run: `npm run build 2>&1 | tail -8`
Expected: "Complete!", no warnings about the new route, `container-reference/index.html` present.

- [ ] **Step 2: Playwright — desktop (1280) and mobile (390)**

Load `http://localhost:4321/container-reference/` at 1280px and 390px. Confirm:
- Hero, all three sections (#dimensions/#markings/#lifecycle), FAQ, spokes render.
- The dimensions and markings tables scroll **inside their own container** — no horizontal overflow of the page body at 390px.
- Jump links (`#dimensions` etc.) scroll to the right section (verify `scroll-margin-top` clears the sticky header).
- Load one enriched page (`/condition/`) at 390px — lifecycle grid stacks, link works.

- [ ] **Step 3: Schema confirm in served HTML**

`curl -s http://localhost:4321/container-reference/ | grep -o '"@type":"[A-Za-z]*"' | sort | uniq -c`
Expected to include: Article, BreadcrumbList, FAQPage, Organization, LocalBusiness, WebPage.

- [ ] **Step 4: Guardrail sweep**

`curl -s http://localhost:4321/container-reference/ | grep -c '\$'` → `0`
Read the served page once for WWT-only framing (no "cargo worthy"/"one-trip"/"certified for shipping" as SBD offers) and confirm non-sold sizes read as reference, not offers.

- [ ] **Step 5: Final checkpoint + state**

Create `.checkpoints/YYYY-MM-DD-HH-MM-refhub-complete/checkpoint.md`. Update `PROJECT_STATE.json` (add to `completed`) and the session log + transcript. Do NOT commit — report to owner and await push authorization.

---

## Self-Review

**1. Spec coverage:**
- Reference page `/container-reference/` → Task 2 ✓
- Data module (single source of truth) → Task 1 ✓
- Full ISO table w/ SBD-sold flagged, non-sold informational → Task 1 (data) + Task 2 (render) ✓
- Markings/ISO 6346 section → Task 1 + Task 2 ✓
- Lifecycle qualitative → Task 1 + Task 2 ✓
- Enrich condition → Task 4 ✓; product pages → Task 5 ✓; size → Task 6 ✓; 4 use-cases → Task 6 ✓
- Hub-and-spoke interlinking → hub-down links in Task 2, spoke-up links in Tasks 4/5/6 ✓
- Article + BreadcrumbList + FAQPage schema → Task 2 (pageType=guide auto Article/Breadcrumb; head-slot FAQPage) ✓
- Nav placement → Task 3 ✓
- Verification (build + Playwright + JSON-LD) → Task 7 ✓
- Guardrails (WWT, no $, original, primaries, non-sold informational) → Global Constraints + per-task greps + Task 7 sweep ✓

**2. Placeholder scan:** No TBD/TODO; all code blocks are complete; use-case copy is provided verbatim per file. ✓

**3. Type consistency:** Page imports in Task 2 match the exact export names/types defined in Task 1 (`referenceSizes`, `bicIdParts`, `lengthCodes`, `heightWidthCodes`, `typeCodes`, `lifecycleFacts`, `referenceFaqs`). `productSlug` values match `containers.ts` slugs. `guideTopic` intentionally omitted (union has no `reference` member — Article still emits from `pageType="guide"`). ✓

## Notes / risks
- `/size/index.astro` and the 4 use-case files have bespoke structure; Steps in Tasks 6 say "locate a natural spot" rather than exact line numbers because those files weren't line-mapped here. The implementer should insert inside an existing `<div class="wrap">` content region (never in `<head>`), then verify with the provided `grep`.
- Dev port may be 4322+ if 4321 is busy — adjust curl/Playwright URLs to the actual port from `npm run dev` output.
