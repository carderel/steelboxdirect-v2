# Use-Case Pages Implementation Plan

> For agentic workers: This plan is written to be executed task-by-task by fresh subagents. Each task is self-contained — it gives the exact file path, the exact import path, verbatim BaseLayout props, the accent variable, the complete FAQPage JSON-LD with that page's five Q&A inlined, and all verbatim body content mapped onto the Shared Page Skeleton. Do not read other tasks to complete your task. Do not paraphrase any marketing copy — paste it verbatim.

**Goal:** Ship the seed set of four standalone, off-template use-case (ICP) pages — `/for/farmers/`, `/for/contractors/`, `/for/homeowners/`, `/for/businesses/` — each with bespoke, keyword-dense content and a page-specific FAQPage JSON-LD block, optimised for ranking, SEO, and AI visibility. Each page is a single self-contained `.astro` file. Nav wiring, city expansion (Columbus / Lexington / Fort Wayne), the `/locations/` ICP section, and reverse city→ICP cross-links are **OUT OF SCOPE** for this plan and deferred to a later one.

**Architecture:**

```
src/data/pricing.ts          ← single source of truth for $ figures (Task 0 — build FIRST)
src/pages/for/
  farmers/index.astro        ← static, standalone (Task 1) — DOLLAR-FREE
  contractors/index.astro    ← static, standalone (Task 2) — DOLLAR-FREE
  homeowners/index.astro     ← static, standalone (Task 3) — imports pricing.ts (5-yr rent-vs-own)
  businesses/index.astro     ← static, standalone (Task 4) — imports pricing.ts (cost-per-sq-ft)
```

**Build order:** Task 0 (`src/data/pricing.ts`) → Task 1 (farmers) → Task 2 (contractors) → Task 3 (homeowners) → Task 4 (businesses). Task 0 MUST be built before Tasks 3 and 4, which import it.

Each file:
- Imports `BaseLayout` from `../../../layouts/BaseLayout.astro` (THREE `../` — the file lives at `src/pages/for/<x>/index.astro`, BaseLayout lives at `src/layouts/BaseLayout.astro`).
- Uses `pageType="guide"`, `datePublished="2026-06-04"`, `dateModified="2026-06-04"`.
- Injects a page-specific `FAQPage` JSON-LD via `<Fragment slot="head">` (the BaseLayout renders `<slot name="head" />` inside `<head>` right after the `<Schema />` component).
- Shares the **Shared Page Skeleton** markup + scoped `<style>` block defined below, parameterised only by its accent colour and content.
- Is **static** — needs NO `export const prerender = true;` line. The project is `output: 'hybrid'`, which prerenders by default; the reference page `src/pages/cost/index.astro` has no prerender directive and prerenders fine. Only dynamic routes like `[citySlug].astro` need the directive. State this in each task and do NOT add a prerender line.

**Tech Stack:** Astro 4 (`output: 'hybrid'`), TypeScript, Cloudflare Pages. Global CSS variables and utility classes (`.wrap`, `.m`, `.btn`, `.btn-ghost`, accent vars `--c2-cond` red `#E53935`, `--c3-deliver` cobalt `#1747E6`, `--c4-cost` green `#0B8F4E`, `--c5-permits` orange `#FF5A1F`, `--ink` `#0B0F1A`, `--cream` `#F6F1E7`, `--yellow` `#FFD300`, `--narrow`, `--mono`) are all defined globally in `src/layouts/BaseLayout.astro`. Do not redefine them; just reference them.

**Hard project rules (apply to every task):**
- **Dollar-amount scope (user-approved exception).** Per `.project-catalog/decisions/2026-06-04-cost-comparison-content-and-dollar-exception.md`, ONLY two pages display dollar figures: **homeowners** (5-year rent-vs-own) and **businesses** (cost-per-sq-ft). On those two pages, every dollar figure that derives from container price is **sourced from / computed in-template from `src/data/pricing.ts`** — never hardcoded. The competitor/third-party comparison ranges (e.g. "$150–250 per month" storage-unit rent) are approved verbatim spec copy and stay as written. **Farmers and contractors are DOLLAR-FREE** — they must contain zero `$` characters. Do NOT add any container/product price not present in the verbatim source or `pricing.ts`.
- Use the spec copy verbatim. No "TBD", no placeholders, no "see spec", no un-shown code.
- "Where we deliver" links only the four LIVE city pages: Cincinnati, Dayton, Indianapolis, Louisville. Do NOT link Columbus, Lexington, or Fort Wayne (not built yet).

---

## Shared Page Skeleton (canonical structure — referenced by all 4 tasks)

Every use-case page follows this exact section order and markup. The ONLY things that change between pages are: (a) the BaseLayout props, (b) the `FAQPage` JSON-LD content, (c) the accent CSS variable used in the four marked spots, and (d) the body text. Everything structural below is identical across all four pages.

**Accent variable per page (used in the hero accent bar, the section eyebrow rule, the rec-card top border, and the FAQ left border):**
- Farmers → `var(--c4-cost)` (green)
- Contractors → `var(--c3-deliver)` (cobalt)
- Homeowners → `var(--c2-cond)` (red)
- Businesses → `var(--c5-permits)` (orange)

Below, `__ACCENT__` marks where the page's accent var goes, and `__…__` placeholders mark where verbatim content from the per-page task is dropped in. In the real files there are NO placeholders — each task gives the fully-assembled values.

### Section order
1. **HERO** — eyebrow chip + H1 + lede + accent bar
2. **WHY CONTAINERS WORK FOR [audience]** — 4 blocks (headline + full paragraph)
3. **WHICH CONTAINER FITS** — 3 recommendation cards (link to product pages) + framing line
4. **WHERE WE DELIVER** — short paragraph + 4 city cards (Cincinnati, Dayton, Indianapolis, Louisville)
5. **COMMON QUESTIONS** — 5 Q&A (full paragraph answers) + matching FAQPage JSON-LD in head
6. **CTA** — `.guide-product-cta` dark pattern → `/quote/`

### Canonical markup skeleton

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
// NOTE: static page — NO `export const prerender = true;` line (hybrid prerenders by default).
---

<BaseLayout
  title="__TITLE__"
  description="__DESCRIPTION__"
  pageType="guide"
  datePublished="2026-06-04"
  dateModified="2026-06-04"
>

  <Fragment slot="head">
    <script type="application/ld+json" set:html={JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        /* __5 Q&A OBJECTS, VERBATIM PER PAGE__ */
      ]
    })} />
  </Fragment>

  <!-- 1. HERO -->
  <section class="uc-hero">
    <div class="wrap">
      <span class="uc-eyebrow">__EYEBROW__</span>
      <h1 class="uc-h1">__H1__</h1>
      <p class="uc-lede">__LEDE__</p>
      <div class="uc-accent" style="background: __ACCENT__;"></div>
    </div>
  </section>

  <!-- 2. WHY CONTAINERS WORK -->
  <section class="uc-why">
    <div class="wrap">
      <div class="uc-sh" style="border-color: __ACCENT__;">
        <span class="m">Why It Works</span>
        <h2 class="uc-h2">__WHY_HEADING__</h2>
      </div>
      <div class="uc-why-grid">
        <div class="uc-block">
          <h3>__WHY_1_TITLE__</h3>
          <p>__WHY_1_BODY__</p>
        </div>
        <div class="uc-block">
          <h3>__WHY_2_TITLE__</h3>
          <p>__WHY_2_BODY__</p>
        </div>
        <div class="uc-block">
          <h3>__WHY_3_TITLE__</h3>
          <p>__WHY_3_BODY__</p>
        </div>
        <div class="uc-block">
          <h3>__WHY_4_TITLE__</h3>
          <p>__WHY_4_BODY__</p>
        </div>
      </div>
    </div>
  </section>

  <!-- 3. WHICH CONTAINER FITS -->
  <section class="uc-recs">
    <div class="wrap">
      <div class="uc-sh" style="border-color: __ACCENT__;">
        <span class="m">Which Container Fits</span>
        <h2 class="uc-h2">Which container fits your situation</h2>
      </div>
      <div class="uc-rec-grid">
        <a href="/shipping-containers-for-sale/20-foot-shipping-container/" class="uc-rec" style="border-top-color: __ACCENT__;">
          <span class="uc-rec-size">20ft</span>
          <p class="uc-rec-body">__REC_20__</p>
          <span class="uc-rec-link">View 20ft container →</span>
        </a>
        <a href="/shipping-containers-for-sale/40-foot-shipping-container/" class="uc-rec" style="border-top-color: __ACCENT__;">
          <span class="uc-rec-size">40ft</span>
          <p class="uc-rec-body">__REC_40__</p>
          <span class="uc-rec-link">View 40ft container →</span>
        </a>
        <a href="/shipping-containers-for-sale/40-foot-one-trip-container/" class="uc-rec" style="border-top-color: __ACCENT__;">
          <span class="uc-rec-size">One-Trip</span>
          <p class="uc-rec-body">__REC_ONETRIP__</p>
          <span class="uc-rec-link">View one-trip container →</span>
        </a>
      </div>
      <p class="uc-framing">__FRAMING_LINE__</p>
    </div>
  </section>

  <!-- 4. WHERE WE DELIVER -->
  <section class="uc-deliver">
    <div class="wrap">
      <div class="uc-sh" style="border-color: __ACCENT__;">
        <span class="m">Where We Deliver</span>
        <h2 class="uc-h2">Where we deliver</h2>
      </div>
      <p class="uc-deliver-lede">We deliver within 250 miles of Cincinnati — across Ohio, Indiana, and Kentucky. Here are the metro areas we serve most:</p>
      <div class="uc-city-grid">
        <a href="/cincinnati-shipping-containers/" class="uc-city"><span class="uc-city-code">CIN</span><span class="uc-city-name">Cincinnati, OH</span><span class="uc-city-arrow">→</span></a>
        <a href="/dayton-shipping-containers/" class="uc-city"><span class="uc-city-code">DAY</span><span class="uc-city-name">Dayton, OH</span><span class="uc-city-arrow">→</span></a>
        <a href="/indianapolis-shipping-containers/" class="uc-city"><span class="uc-city-code">IND</span><span class="uc-city-name">Indianapolis, IN</span><span class="uc-city-arrow">→</span></a>
        <a href="/louisville-shipping-containers/" class="uc-city"><span class="uc-city-code">LOU</span><span class="uc-city-name">Louisville, KY</span><span class="uc-city-arrow">→</span></a>
      </div>
    </div>
  </section>

  <!-- 5. COMMON QUESTIONS -->
  <section class="uc-faq">
    <div class="wrap">
      <div class="uc-sh" style="border-color: __ACCENT__;">
        <span class="m">Common Questions</span>
        <h2 class="uc-h2">Common questions</h2>
      </div>
      <div class="uc-faq-list">
        <div class="uc-faq-item" style="border-left-color: __ACCENT__;">
          <h3>__FAQ_1_Q__</h3>
          <p>__FAQ_1_A__</p>
        </div>
        <div class="uc-faq-item" style="border-left-color: __ACCENT__;">
          <h3>__FAQ_2_Q__</h3>
          <p>__FAQ_2_A__</p>
        </div>
        <div class="uc-faq-item" style="border-left-color: __ACCENT__;">
          <h3>__FAQ_3_Q__</h3>
          <p>__FAQ_3_A__</p>
        </div>
        <div class="uc-faq-item" style="border-left-color: __ACCENT__;">
          <h3>__FAQ_4_Q__</h3>
          <p>__FAQ_4_A__</p>
        </div>
        <div class="uc-faq-item" style="border-left-color: __ACCENT__;">
          <h3>__FAQ_5_Q__</h3>
          <p>__FAQ_5_A__</p>
        </div>
      </div>
    </div>
  </section>

  <!-- 6. CTA -->
  <section class="guide-product-cta" style="padding: 64px 0; background: var(--ink); color: var(--cream);">
    <div class="wrap" style="display: flex; flex-direction: column; align-items: flex-start; gap: 24px; max-width: 680px;">
      <p class="m" style="color: var(--yellow); margin: 0;">Ready when you are</p>
      <h2 style="font-family: var(--narrow); font-size: clamp(28px, 4vw, 44px); font-weight: 700; text-transform: uppercase; margin: 0; line-height: 1.05;">__CTA_HEADLINE__</h2>
      <p style="font-size: 17px; opacity: .75; margin: 0; line-height: 1.5;">Tell us your size, condition, and delivery zip. We respond within 4 business hours.</p>
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <a href="/quote/" class="btn" style="background: var(--yellow); color: var(--ink); border-color: var(--yellow);">Get My Quote →</a>
        <a href="/shipping-containers-for-sale/" class="btn-ghost" style="color: var(--cream);">Browse containers first</a>
      </div>
    </div>
  </section>

</BaseLayout>
```

### Canonical scoped `<style>` block (identical in all 4 files)

Paste this `<style>` block (no `is:global`) at the end of every page file, after `</BaseLayout>`:

```astro
<style>
  /* ---- HERO ---- */
  .uc-hero { padding: 110px 0 72px; background: var(--yellow); border-bottom: 2.5px solid var(--ink); }
  .uc-eyebrow { display: inline-block; font-family: var(--mono); font-size: 11px; letter-spacing: .1em; text-transform: uppercase; background: var(--ink); color: var(--cream); padding: 7px 14px; }
  .uc-h1 { font-family: var(--narrow); font-weight: 700; font-size: clamp(44px, 8vw, 78px); line-height: .92; letter-spacing: -.02em; text-transform: uppercase; margin: 28px 0 0; }
  .uc-lede { font-size: 22px; line-height: 1.45; max-width: 760px; margin: 28px 0 0; font-weight: 500; }
  .uc-accent { height: 10px; width: 180px; margin-top: 40px; }

  /* ---- SHARED SECTION HEADER ---- */
  .uc-sh { border-top: 4px solid var(--ink); padding-top: 18px; margin-bottom: 48px; }
  .uc-sh .m { display: block; opacity: .55; margin-bottom: 10px; }
  .uc-h2 { font-family: var(--narrow); font-weight: 700; font-size: clamp(30px, 4.5vw, 48px); line-height: 1; letter-spacing: -.01em; text-transform: uppercase; margin: 0; }

  /* ---- WHY ---- */
  .uc-why { padding: 96px 0; background: var(--cream); border-bottom: 1.5px solid rgba(11,15,26,.1); }
  .uc-why-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
  .uc-block { background: white; border: 2px solid var(--ink); padding: 32px; box-shadow: 8px 8px 0 var(--ink); }
  .uc-block h3 { font-family: var(--narrow); font-weight: 700; font-size: 24px; text-transform: uppercase; line-height: 1.05; margin: 0 0 14px; }
  .uc-block p { font-size: 16px; line-height: 1.55; opacity: .82; margin: 0; }

  /* ---- RECOMMENDATIONS ---- */
  .uc-recs { padding: 96px 0; background: white; border-bottom: 1.5px solid rgba(11,15,26,.1); }
  .uc-rec-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .uc-rec { display: flex; flex-direction: column; background: var(--cream); border: 2px solid var(--ink); border-top: 8px solid var(--ink); padding: 28px; transition: transform .15s, box-shadow .15s; }
  .uc-rec:hover { transform: translate(-3px, -3px); box-shadow: 6px 6px 0 var(--ink); }
  .uc-rec-size { font-family: var(--narrow); font-weight: 700; font-size: 34px; text-transform: uppercase; line-height: 1; margin-bottom: 14px; }
  .uc-rec-body { font-size: 15px; line-height: 1.5; opacity: .82; margin: 0 0 20px; flex: 1; }
  .uc-rec-link { font-family: var(--mono); font-size: 11px; letter-spacing: .06em; text-transform: uppercase; font-weight: 500; margin-top: auto; }
  .uc-framing { margin: 40px 0 0; font-size: 18px; line-height: 1.5; font-weight: 500; max-width: 760px; border-left: 4px solid var(--yellow); padding-left: 24px; }

  /* ---- WHERE WE DELIVER ---- */
  .uc-deliver { padding: 96px 0; background: var(--cream); border-bottom: 1.5px solid rgba(11,15,26,.1); }
  .uc-deliver-lede { font-size: 18px; line-height: 1.5; max-width: 720px; margin: 0 0 40px; opacity: .85; }
  .uc-city-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .uc-city { display: flex; flex-direction: column; gap: 6px; background: white; border: 2px solid var(--ink); padding: 22px 24px; transition: background .15s, color .15s; }
  .uc-city:hover { background: var(--ink); color: var(--cream); }
  .uc-city-code { font-family: var(--narrow); font-weight: 700; font-size: 26px; line-height: 1; color: var(--ink); }
  .uc-city:hover .uc-city-code { color: var(--yellow); }
  .uc-city-name { font-family: var(--mono); font-size: 11px; letter-spacing: .05em; text-transform: uppercase; }
  .uc-city-arrow { font-family: var(--narrow); font-weight: 700; font-size: 20px; margin-top: 8px; }

  /* ---- FAQ ---- */
  .uc-faq { padding: 96px 0; background: white; }
  .uc-faq-list { display: flex; flex-direction: column; gap: 28px; }
  .uc-faq-item { border-left: 4px solid var(--ink); padding-left: 28px; max-width: 860px; }
  .uc-faq-item h3 { font-family: var(--narrow); font-weight: 700; font-size: 22px; line-height: 1.15; text-transform: uppercase; margin: 0 0 12px; }
  .uc-faq-item p { font-size: 16px; line-height: 1.6; opacity: .82; margin: 0; }

  /* ---- RESPONSIVE ---- */
  @media (max-width: 768px) {
    .uc-hero { padding: 72px 0 56px; }
    .uc-why-grid { grid-template-columns: 1fr; gap: 20px; }
    .uc-rec-grid { grid-template-columns: 1fr; }
    .uc-city-grid { grid-template-columns: 1fr 1fr; }
    .uc-block { padding: 24px; }
    .uc-faq-item { padding-left: 20px; }
  }
</style>
```

---

## Task 0 — `src/data/pricing.ts` (PREREQUISITE — build FIRST)

**File to create:** `src/data/pricing.ts`
**Why first:** Tasks 3 (homeowners) and 4 (businesses) import this file. It is the single source of truth for every dollar figure on those two pages, so price drift is a one-file fix. The project already uses typed TS data files (`src/data/cities.ts`, `src/data/containers.ts`); match that style.

This task creates a complete, typed data file — no placeholders. Create it exactly as below.

```ts
// src/data/pricing.ts
// Single source of truth for container pricing displayed on use-case pages.
// Only /for/homeowners/ (5-yr rent-vs-own) and /for/businesses/ (cost-per-sq-ft)
// consume this — see decision 2026-06-04-cost-comparison-content-and-dollar-exception.md.

export interface ContainerPrice {
  /** Display label for the size/grade. */
  label: string;
  /** Current purchase price in USD (whole dollars). */
  price: number;
  /** Usable floor area in square feet. */
  sqft: number;
}

export interface Pricing {
  /** Date these prices were last confirmed. Drives the "updated June 2026" microcopy. */
  asOf: string;
  '20ftCargo': ContainerPrice;
  '40ftStandard': ContainerPrice;
  '40ftStandardHC': ContainerPrice;
}

export const pricing: Pricing = {
  asOf: '2026-06-04',
  '20ftCargo': { label: '20ft Cargo', price: 2007, sqft: 160 },
  '40ftStandard': { label: '40ft Standard', price: 2709, sqft: 320 },
  // NOTE: HC priced under Standard as of this date — verify before relying on long-term; per user 2026-06-04
  '40ftStandardHC': { label: '40ft Standard HC', price: 2470, sqft: 320 },
};

/** Monthly cost when a purchase is amortized over 5 years (60 months), rounded to whole dollars. */
export function monthlyOver5yr(price: number): number {
  return Math.round(price / 60);
}

/** Raw one-time cost per square foot. Format in-template (e.g. round to nearest $0.50 for display). */
export function perSqFt(price: number, sqft: number): number {
  return price / sqft;
}

/** Round a per-sq-ft figure to the nearest $0.50 for display. */
export function roundToHalf(value: number): number {
  return Math.round(value * 2) / 2;
}
```

**Verification (Task 0):**
1. `npm run build` — expect zero errors. This data file alone changes nothing visible (no page imports it yet); the build passing confirms the TypeScript is valid.
2. Commit:
   ```
   git add src/data/pricing.ts
   git commit -m "feat(data): add pricing.ts single source of truth for use-case cost figures

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
   ```

---

## Task 1 — `/for/farmers/` (FULL CANONICAL EXAMPLE)

**File to create:** `src/pages/for/farmers/index.astro`
**Import path:** `import BaseLayout from '../../../layouts/BaseLayout.astro';` (THREE `../`)
**Accent variable:** `var(--c4-cost)` (green) — used in the hero accent bar, all four `.uc-sh` borders, all three `.uc-rec` top borders, and all five `.uc-faq-item` left borders.
**Static page:** do NOT add `export const prerender = true;`.

This task shows the **complete assembled file** as the canonical reference. Create it exactly as below.

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
---

<BaseLayout
  title="Shipping Containers for Farms in Ohio, Indiana & Kentucky | Steel Box Direct"
  description="Farm storage containers delivered to your field. Most agricultural land in OH, IN, and KY qualifies for zoning exemptions — no permit, no foundation, no monthly fees."
  pageType="guide"
  datePublished="2026-06-04"
  dateModified="2026-06-04"
>

  <Fragment slot="head">
    <script type="application/ld+json" set:html={JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Do I need a permit for a shipping container on my farm in Ohio, Indiana, or Kentucky?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "In most cases, no. Ohio, Indiana, and Kentucky all have agricultural use exemptions that typically apply to storage structures on working farm land. If your property is classified as agricultural — meaning it's actively used for crop production, livestock, or ag-related purposes — it generally falls outside the residential and commercial zoning rules that require permits for storage structures. That said, rules vary by county and sometimes by municipality, so we recommend a quick call to your county zoning office to confirm. We've helped hundreds of farm buyers navigate this question, and the vast majority move forward without a permit of any kind."
          }
        },
        {
          "@type": "Question",
          "name": "Can a container be delivered to a field or gravel area, or does the truck need a paved road?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Delivery trucks can handle gravel lanes, packed dirt drives, and field access roads in most conditions. What we need is a delivery path that's at least 12 feet wide with no overhead obstructions below 14 feet — low branches, power lines, gate arches. Soft ground, mud, or steep grades can create challenges, but our drivers have placed containers on farm properties across Ohio, Indiana, and Kentucky for years and know how to work around difficult terrain. When you request a quote, describe your access path and we'll flag anything that might affect delivery before we schedule."
          }
        },
        {
          "@type": "Question",
          "name": "What size container do I need for farm equipment storage?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "It depends on what you're storing. A 20ft container (roughly 1,170 cubic feet of interior space) fits small equipment like ATVs, implements, and a full complement of hand tools and supplies. A 40ft container (about 2,385 cubic feet) handles larger equipment — round balers, combine headers, grain carts — and still leaves room for feed, chemicals, and parts. Most buyers storing equipment that includes anything with a wide header or large footprint go with the 40ft. If you're unsure, describe your largest piece of equipment in the quote form and we'll confirm fit."
          }
        },
        {
          "@type": "Question",
          "name": "Can I put a container on grass or unpaved ground?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, with some preparation. Containers can be placed on compacted gravel, packed earth, or level grass, but they need reasonably level, firm ground to sit without shifting. For permanent placement, most farm buyers put down a layer of crushed gravel or concrete blocks under the corner castings — this keeps the floor off wet ground and prevents long-term warping. For temporary or seasonal placement, flat grass works fine. Our drivers can advise on placement when they arrive."
          }
        },
        {
          "@type": "Question",
          "name": "What's the difference between cargo-worthy and one-trip for farm use?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A cargo-worthy container has made multiple international shipping voyages. It's structurally sound, passes a weathertight inspection, and will keep rain, wind, and pests out — but the interior may show rust staining, dents, or residual cargo odor from previous loads. For equipment and feed storage, this is typically irrelevant. A one-trip container made a single ocean crossing before being sold — the interior is essentially new, free of contamination, and odor-neutral. One-trip units cost more but are the right choice for seed storage, chemical storage, or any situation where interior cleanliness matters."
          }
        }
      ]
    })} />
  </Fragment>

  <!-- 1. HERO -->
  <section class="uc-hero">
    <div class="wrap">
      <span class="uc-eyebrow">For Farmers &amp; Ag Operations</span>
      <h1 class="uc-h1">Farm Storage That Holds Up to Ohio Winters.</h1>
      <p class="uc-lede">No permit on most agricultural land. No foundation required. Delivered to your field — not just your driveway. One purchase, no monthly storage fees.</p>
      <div class="uc-accent" style="background: var(--c4-cost);"></div>
    </div>
  </section>

  <!-- 2. WHY CONTAINERS WORK -->
  <section class="uc-why">
    <div class="wrap">
      <div class="uc-sh" style="border-color: var(--c4-cost);">
        <span class="m">Why It Works</span>
        <h2 class="uc-h2">Why containers work for farmers</h2>
      </div>
      <div class="uc-why-grid">
        <div class="uc-block">
          <h3>Most farm properties qualify for zoning exemptions</h3>
          <p>Zoning rules in Ohio, Indiana, and Kentucky typically exempt agricultural land from the permit requirements that apply to residential or commercial properties. If you're farming — crops, livestock, or equipment — you're likely exempt. We can help you confirm based on your county and property type. No permit paperwork, no waiting period, no variance hearings.</p>
        </div>
        <div class="uc-block">
          <h3>Weather-sealed storage without a permanent structure</h3>
          <p>A cargo-worthy ISO container holds a positive pressure seal against rain, wind, and snow. Unlike a barn addition or pole building, a container doesn't require a foundation, a concrete slab, or a building permit in most counties. It's technically personal property — meaning it can be placed, relocated, or removed without triggering a permanent structure review.</p>
        </div>
        <div class="uc-block">
          <h3>One purchase, no monthly bill</h3>
          <p>A container is a one-time purchase, not a recurring expense. There's no monthly fee, no renewal notice, and no contract — you own it outright the day it's delivered. Compared to building a permanent pole barn or hauling equipment to off-farm storage, it pays for itself, and because steel holds its value, a container resells well when you no longer need it. It's an asset that stays on your books, not a cost that recurs every month.</p>
        </div>
        <div class="uc-block">
          <h3>Sized for equipment, feed, and tools</h3>
          <p>A 20ft container stores a full set of small equipment and supplies. A 40ft container fits a combine header, round bales, seed inventory, and toolboxes with room to walk through. One-trip units — essentially new — give you a clean interior for seed storage, chemical storage, or anything requiring pristine conditions.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- 3. WHICH CONTAINER FITS -->
  <section class="uc-recs">
    <div class="wrap">
      <div class="uc-sh" style="border-color: var(--c4-cost);">
        <span class="m">Which Container Fits</span>
        <h2 class="uc-h2">Which container fits your situation</h2>
      </div>
      <div class="uc-rec-grid">
        <a href="/shipping-containers-for-sale/20-foot-shipping-container/" class="uc-rec" style="border-top-color: var(--c4-cost);">
          <span class="uc-rec-size">20ft</span>
          <p class="uc-rec-body">Best for: small equipment, fertilizer and chemical storage, hand tools, and seed bags. Fits most farm lane widths.</p>
          <span class="uc-rec-link">View 20ft container →</span>
        </a>
        <a href="/shipping-containers-for-sale/40-foot-shipping-container/" class="uc-rec" style="border-top-color: var(--c4-cost);">
          <span class="uc-rec-size">40ft</span>
          <p class="uc-rec-body">Best for: combine headers, large tillage equipment, hay and feed, multi-item storage. Requires a firm delivery path of at least 12ft width and 14ft height clearance.</p>
          <span class="uc-rec-link">View 40ft container →</span>
        </a>
        <a href="/shipping-containers-for-sale/40-foot-one-trip-container/" class="uc-rec" style="border-top-color: var(--c4-cost);">
          <span class="uc-rec-size">One-Trip</span>
          <p class="uc-rec-body">Best for: seed storage, chemical storage, livestock equipment, or any application requiring a near-new interior without odors or previous cargo residue.</p>
          <span class="uc-rec-link">View one-trip container →</span>
        </a>
      </div>
      <p class="uc-framing">Most farm buyers choose the 40ft cargo-worthy unit — it handles the widest range of equipment and feed storage at the most practical price point.</p>
    </div>
  </section>

  <!-- 4. WHERE WE DELIVER -->
  <section class="uc-deliver">
    <div class="wrap">
      <div class="uc-sh" style="border-color: var(--c4-cost);">
        <span class="m">Where We Deliver</span>
        <h2 class="uc-h2">Where we deliver</h2>
      </div>
      <p class="uc-deliver-lede">We deliver within 250 miles of Cincinnati — across Ohio, Indiana, and Kentucky. Here are the metro areas we serve most:</p>
      <div class="uc-city-grid">
        <a href="/cincinnati-shipping-containers/" class="uc-city"><span class="uc-city-code">CIN</span><span class="uc-city-name">Cincinnati, OH</span><span class="uc-city-arrow">→</span></a>
        <a href="/dayton-shipping-containers/" class="uc-city"><span class="uc-city-code">DAY</span><span class="uc-city-name">Dayton, OH</span><span class="uc-city-arrow">→</span></a>
        <a href="/indianapolis-shipping-containers/" class="uc-city"><span class="uc-city-code">IND</span><span class="uc-city-name">Indianapolis, IN</span><span class="uc-city-arrow">→</span></a>
        <a href="/louisville-shipping-containers/" class="uc-city"><span class="uc-city-code">LOU</span><span class="uc-city-name">Louisville, KY</span><span class="uc-city-arrow">→</span></a>
      </div>
    </div>
  </section>

  <!-- 5. COMMON QUESTIONS -->
  <section class="uc-faq">
    <div class="wrap">
      <div class="uc-sh" style="border-color: var(--c4-cost);">
        <span class="m">Common Questions</span>
        <h2 class="uc-h2">Common questions</h2>
      </div>
      <div class="uc-faq-list">
        <div class="uc-faq-item" style="border-left-color: var(--c4-cost);">
          <h3>Do I need a permit for a shipping container on my farm in Ohio, Indiana, or Kentucky?</h3>
          <p>In most cases, no. Ohio, Indiana, and Kentucky all have agricultural use exemptions that typically apply to storage structures on working farm land. If your property is classified as agricultural — meaning it's actively used for crop production, livestock, or ag-related purposes — it generally falls outside the residential and commercial zoning rules that require permits for storage structures. That said, rules vary by county and sometimes by municipality, so we recommend a quick call to your county zoning office to confirm. We've helped hundreds of farm buyers navigate this question, and the vast majority move forward without a permit of any kind.</p>
        </div>
        <div class="uc-faq-item" style="border-left-color: var(--c4-cost);">
          <h3>Can a container be delivered to a field or gravel area, or does the truck need a paved road?</h3>
          <p>Delivery trucks can handle gravel lanes, packed dirt drives, and field access roads in most conditions. What we need is a delivery path that's at least 12 feet wide with no overhead obstructions below 14 feet — low branches, power lines, gate arches. Soft ground, mud, or steep grades can create challenges, but our drivers have placed containers on farm properties across Ohio, Indiana, and Kentucky for years and know how to work around difficult terrain. When you request a quote, describe your access path and we'll flag anything that might affect delivery before we schedule.</p>
        </div>
        <div class="uc-faq-item" style="border-left-color: var(--c4-cost);">
          <h3>What size container do I need for farm equipment storage?</h3>
          <p>It depends on what you're storing. A 20ft container (roughly 1,170 cubic feet of interior space) fits small equipment like ATVs, implements, and a full complement of hand tools and supplies. A 40ft container (about 2,385 cubic feet) handles larger equipment — round balers, combine headers, grain carts — and still leaves room for feed, chemicals, and parts. Most buyers storing equipment that includes anything with a wide header or large footprint go with the 40ft. If you're unsure, describe your largest piece of equipment in the quote form and we'll confirm fit.</p>
        </div>
        <div class="uc-faq-item" style="border-left-color: var(--c4-cost);">
          <h3>Can I put a container on grass or unpaved ground?</h3>
          <p>Yes, with some preparation. Containers can be placed on compacted gravel, packed earth, or level grass, but they need reasonably level, firm ground to sit without shifting. For permanent placement, most farm buyers put down a layer of crushed gravel or concrete blocks under the corner castings — this keeps the floor off wet ground and prevents long-term warping. For temporary or seasonal placement, flat grass works fine. Our drivers can advise on placement when they arrive.</p>
        </div>
        <div class="uc-faq-item" style="border-left-color: var(--c4-cost);">
          <h3>What's the difference between cargo-worthy and one-trip for farm use?</h3>
          <p>A cargo-worthy container has made multiple international shipping voyages. It's structurally sound, passes a weathertight inspection, and will keep rain, wind, and pests out — but the interior may show rust staining, dents, or residual cargo odor from previous loads. For equipment and feed storage, this is typically irrelevant. A one-trip container made a single ocean crossing before being sold — the interior is essentially new, free of contamination, and odor-neutral. One-trip units cost more but are the right choice for seed storage, chemical storage, or any situation where interior cleanliness matters.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- 6. CTA -->
  <section class="guide-product-cta" style="padding: 64px 0; background: var(--ink); color: var(--cream);">
    <div class="wrap" style="display: flex; flex-direction: column; align-items: flex-start; gap: 24px; max-width: 680px;">
      <p class="m" style="color: var(--yellow); margin: 0;">Ready when you are</p>
      <h2 style="font-family: var(--narrow); font-size: clamp(28px, 4vw, 44px); font-weight: 700; text-transform: uppercase; margin: 0; line-height: 1.05;">Get a quote for your farm operation.</h2>
      <p style="font-size: 17px; opacity: .75; margin: 0; line-height: 1.5;">Tell us your size, condition, and delivery zip. We respond within 4 business hours.</p>
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <a href="/quote/" class="btn" style="background: var(--yellow); color: var(--ink); border-color: var(--yellow);">Get My Quote →</a>
        <a href="/shipping-containers-for-sale/" class="btn-ghost" style="color: var(--cream);">Browse containers first</a>
      </div>
    </div>
  </section>

</BaseLayout>
```

Then append the **canonical scoped `<style>` block** from the Shared Page Skeleton section verbatim, after `</BaseLayout>`.

**Verification (Task 1):**
1. `npm run build` — expect zero errors and the route `/for/farmers/index.html` in the build output.
2. Confirm the FAQPage JSON-LD renders: `grep -c '"@type":"FAQPage"' dist/for/farmers/index.html` should return `1` (or `grep -o 'FAQPage' dist/for/farmers/index.html | head`). Also confirm all five questions are present: `grep -c '"@type":"Question"' dist/for/farmers/index.html` should return `5`.
2a. **DOLLAR-FREE assertion:** `grep -oE '\$[0-9]' dist/for/farmers/index.html | wc -l` must return `0` (counts actual dollar-amounts; any stray `$` in global chrome is ignored). The farmers page carries no cost comparison and no dollar figures (per the decision, farms don't use rented storage). If any dollar-amount appears, the build fails this gate — fix before committing.
3. Dev-server visual check: `npm run dev`, open `http://localhost:4321/for/farmers/`. Confirm hero, four why-blocks, three rec cards linking to the product pages, four city cards linking to the live city pages, five FAQ items with green accents, and the dark CTA to `/quote/`.
4. Commit:
   ```
   git add src/pages/for/farmers/index.astro
   git commit -m "feat(use-case): add /for/farmers/ use-case page

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
   ```

---

## Task 2 — `/for/contractors/`

**File to create:** `src/pages/for/contractors/index.astro`
**Import path:** `import BaseLayout from '../../../layouts/BaseLayout.astro';` (THREE `../`)
**Accent variable:** `var(--c3-deliver)` (cobalt) — use in the hero accent bar, all four `.uc-sh` borders, all three `.uc-rec` top borders, and all five `.uc-faq-item` left borders.
**Static page:** do NOT add `export const prerender = true;`.

Build this file using the **Shared Page Skeleton** markup + the **canonical scoped `<style>` block** above (and the on-disk `src/pages/for/farmers/index.astro` as a structural reference). Substitute the contractors content below verbatim, and set every `__ACCENT__` spot to `var(--c3-deliver)`.

**BaseLayout props:**
- `title="Shipping Containers for Job Sites in Ohio, Indiana & Kentucky | Steel Box Direct"`
- `description="Job site storage containers delivered across OH/IN/KY. Ground-level access, standard padlock hasp, dropped and picked up when the job's done."`
- `pageType="guide"`, `datePublished="2026-06-04"`, `dateModified="2026-06-04"`

**Hero:**
- Eyebrow: `For Contractors & Construction`  (write as `For Contractors &amp; Construction` in markup)
- H1: `Job Site Storage That Locks and Stays.`
- Lede: `Standard padlock hasp. Ground-level door access. No forklift needed to load it. Delivered when you need it, retrieved when the job's done.`

**Why containers work for contractors — H2 `Why containers work for contractors`, 4 blocks:**
- Block 1 title: `Harder to break into than a job site trailer`
  Body: `ISO shipping containers are built from Cor-Ten steel — the same material used in ocean freight. The standard door lock mechanism accepts a padlock or puck lock through a lockbox hasp. Unlike a job site trailer, there's no gap at the roofline, no plastic panels, and no soft aluminum skin to cut through. It's substantially more secure than a wood toolbox, a cargo trailer, or an open van.`
- Block 2 title: `Ground-level access — no dock, no ramp`
  Body: `Container doors open to ground level. Tools, materials, and equipment go straight in and out without a lift gate or dock plate. The floor is 5/4" hardwood or steel plate — rated for forklift entry if needed. Standard interior height is 7'10".`
- Block 3 title: `Delivered and retrieved on your schedule`
  Body: `We deliver within 250 miles of Cincinnati. You call when you're ready; we drop it. When the project ends, we pick it up. No rental center, no trailer registration, no CDL required on your end. The container sits on site until you need it gone.`
- Block 4 title: `Flexible for multi-trade and phased projects`
  Body: `A single 40ft container handles material storage for multiple trades simultaneously. When you need a second container for a new phase, we can drop another. Most commercial projects in our service area get same-week delivery if inventory is available.`

**Recommendations (framing H2 `Which container fits your situation`):**
- 20ft body: `Best for: single-trade tool storage, tight urban sites, or projects with limited staging area. Fits in a standard parking space with room to open doors.` → `/shipping-containers-for-sale/20-foot-shipping-container/`
- 40ft body: `Best for: multi-trade material storage, full tool sets across crews, and projects where you want staging and secure storage in the same unit.` → `/shipping-containers-for-sale/40-foot-shipping-container/`
- One-trip body: `Best for: clients or project owners who require a presentable on-site appearance — renovation projects in occupied neighborhoods, corporate campuses, or school sites.` → `/shipping-containers-for-sale/40-foot-one-trip-container/`
- Framing line: `Most contractors on active builds choose the 40ft cargo-worthy unit. It handles the most volume at the best price per square foot of storage.`

**Where we deliver:** identical to skeleton (same lede + four live city cards CIN/DAY/IND/LOU).

**FAQ — H2 `Common questions`, 5 items. Use these verbatim in BOTH the `.uc-faq-item` blocks AND the `FAQPage` JSON-LD `mainEntity` array:**

- Q1: `Can a container be delivered directly to an active construction site?`
  A1: `Yes, and it's one of the most common setups we handle. Our delivery truck uses a tilt-bed or boom-off method depending on site conditions. We need enough space to maneuver the truck (typically 50+ feet of clear approach), a stable surface to set the container on, and overhead clearance of at least 14 feet. For tight urban sites, we do a site assessment upfront. Tell us about the site when you request a quote — entry width, surface type, and any overhead obstacles — and we'll confirm feasibility before scheduling.`
- Q2: `What kind of lock works best on a shipping container?`
  A2: `The door hasp on most cargo-worthy containers accepts a standard discus or puck lock — Abloy, Medeco, or Master Lock "puck" series. These fit inside the lockbox recess on the door handle and are virtually impossible to cut without heavy equipment. Avoid standard padlocks with exposed shackles — they're vulnerable to bolt cutters. If you need to key multiple containers to the same lock for a large project, let us know and we can coordinate.`
- Q3: `How much space does the truck need to deliver a container?`
  A3: `For a 20ft container, the truck needs approximately 50 feet of clear approach with at least 12 feet of width. For a 40ft container, plan for 70+ feet of clear approach. Overhead clearance should be at least 14 feet along the entire approach path. The container will be placed roughly 3–5 feet from where the truck stops. If the site is tight, describe the layout in your quote request — our drivers are experienced with constrained job sites.`
- Q4: `Can you deliver multiple containers to the same site?`
  A4: `Yes. Multiple containers can be delivered to a single project in one trip or staggered across multiple trips. If you need units placed adjacent in a specific configuration — side-by-side with aligned doors, for example — include that in your quote request. We'll plan the delivery sequence to ensure the footprint works and all doors stay accessible.`
- Q5: `What happens if we need to move the container mid-project?`
  A5: `We can relocate the container within our service area for a repositioning fee. Alternatively, if you have a forklift or excavator on site with sufficient capacity (empty 20ft containers weigh about 4,850 lbs; 40ft units run 8,000+ lbs), your crew can reposition using the corner castings or forklift pockets on the underside.`

**Complete FAQPage JSON-LD block for this page (paste verbatim inside `<Fragment slot="head">`):**

```astro
  <Fragment slot="head">
    <script type="application/ld+json" set:html={JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Can a container be delivered directly to an active construction site?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, and it's one of the most common setups we handle. Our delivery truck uses a tilt-bed or boom-off method depending on site conditions. We need enough space to maneuver the truck (typically 50+ feet of clear approach), a stable surface to set the container on, and overhead clearance of at least 14 feet. For tight urban sites, we do a site assessment upfront. Tell us about the site when you request a quote — entry width, surface type, and any overhead obstacles — and we'll confirm feasibility before scheduling."
          }
        },
        {
          "@type": "Question",
          "name": "What kind of lock works best on a shipping container?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The door hasp on most cargo-worthy containers accepts a standard discus or puck lock — Abloy, Medeco, or Master Lock \"puck\" series. These fit inside the lockbox recess on the door handle and are virtually impossible to cut without heavy equipment. Avoid standard padlocks with exposed shackles — they're vulnerable to bolt cutters. If you need to key multiple containers to the same lock for a large project, let us know and we can coordinate."
          }
        },
        {
          "@type": "Question",
          "name": "How much space does the truck need to deliver a container?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "For a 20ft container, the truck needs approximately 50 feet of clear approach with at least 12 feet of width. For a 40ft container, plan for 70+ feet of clear approach. Overhead clearance should be at least 14 feet along the entire approach path. The container will be placed roughly 3–5 feet from where the truck stops. If the site is tight, describe the layout in your quote request — our drivers are experienced with constrained job sites."
          }
        },
        {
          "@type": "Question",
          "name": "Can you deliver multiple containers to the same site?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Multiple containers can be delivered to a single project in one trip or staggered across multiple trips. If you need units placed adjacent in a specific configuration — side-by-side with aligned doors, for example — include that in your quote request. We'll plan the delivery sequence to ensure the footprint works and all doors stay accessible."
          }
        },
        {
          "@type": "Question",
          "name": "What happens if we need to move the container mid-project?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We can relocate the container within our service area for a repositioning fee. Alternatively, if you have a forklift or excavator on site with sufficient capacity (empty 20ft containers weigh about 4,850 lbs; 40ft units run 8,000+ lbs), your crew can reposition using the corner castings or forklift pockets on the underside."
          }
        }
      ]
    })} />
  </Fragment>
```

**CTA headline:** `Get a quote for your job site.` (CTA section markup, eyebrow, supporting line, and buttons are identical to the skeleton; only the `<h2>` headline text changes.)

**Verification (Task 2):**
1. `npm run build` — zero errors, route `/for/contractors/index.html` present.
2. `grep -c '"@type":"Question"' dist/for/contractors/index.html` returns `5`; `grep -c 'FAQPage' dist/for/contractors/index.html` is at least `1`.
2a. **DOLLAR-FREE assertion:** `grep -oE '\$[0-9]' dist/for/contractors/index.html | wc -l` must return `0` (counts actual dollar-amounts; any stray `$` in global chrome is ignored). Contractors carries no cost comparison and no dollar figures (already the case in the verbatim copy — no edit expected). If any dollar-amount appears, fix before committing.
3. `npm run dev`, open `http://localhost:4321/for/contractors/` — confirm cobalt accents, four why-blocks, three rec cards, four live city cards, five FAQ items, dark CTA to `/quote/`.
4. Commit:
   ```
   git add src/pages/for/contractors/index.astro
   git commit -m "feat(use-case): add /for/contractors/ use-case page

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
   ```

---

## Task 3 — `/for/homeowners/`

**File to create:** `src/pages/for/homeowners/index.astro`
**Import path:** `import BaseLayout from '../../../layouts/BaseLayout.astro';` (THREE `../`)
**Accent variable:** `var(--c2-cond)` (red) — use in the hero accent bar, all four `.uc-sh` borders, all three `.uc-rec` top borders, and all five `.uc-faq-item` left borders.
**Static page:** do NOT add `export const prerender = true;`.

Build using the **Shared Page Skeleton** markup + the **canonical scoped `<style>` block** (and `src/pages/for/farmers/index.astro` as a structural reference). Substitute the homeowners content below verbatim; set every `__ACCENT__` to `var(--c2-cond)`.

**Frontmatter import (REQUIRED — this page displays dollar figures from `pricing.ts`):** in the `---` frontmatter, alongside the `BaseLayout` import, add:
```ts
import { pricing, monthlyOver5yr } from '../../../data/pricing';
const own20 = pricing['20ftCargo'];
const ownMonthlyDisplay = `$${monthlyOver5yr(own20.price)}`;        // "$33"
const ownPurchaseDisplay = `$${own20.price.toLocaleString('en-US')}`; // "$2,007"
```
Use `ownMonthlyDisplay` and `ownPurchaseDisplay` in why-block 1 (and FAQ Q4 below). Do NOT hardcode `33` or `2,007` in markup — they must derive from `pricing.ts`.

**BaseLayout props:**
- `title="Shipping Containers for Home Storage in Ohio, Indiana & Kentucky | Steel Box Direct"`
- `description="Own your storage instead of renting it. Steel Box Direct delivers 20ft and 40ft containers to homes across OH/IN/KY. No monthly fees, no storage unit hassle."`
- `pageType="guide"`, `datePublished="2026-06-04"`, `dateModified="2026-06-04"`

**Hero:**
- Eyebrow: `For Homeowners`
- H1: `Backyard Storage Without the Monthly Bill.`
- Lede: `One purchase. No renewal notices. No unit fee increases. Weatherproof storage that lives on your property — not in a facility across town.`

**Why containers work for homeowners — H2 `Why containers work for homeowners`, 4 blocks:**
- Block 1 title: `Own it instead of renting it`
  **This block carries the 5-year rent-vs-own comparison and is the homeowners page's dollar block. Do NOT hardcode the monthly or purchase figure — compute them in-template from `pricing` (imported per the frontmatter note below).** The rent side ("$150–250 per month → $9,000–$15,000 over five years") is approved verbatim competitor copy and stays as written. The own side is computed: a 20ft Cargo at `pricing['20ftCargo'].price` ($2,007 today) amortizes to `monthlyOver5yr(pricing['20ftCargo'].price)` (~$33/mo over 60 months).
  Body (assemble in-template — interpolate the computed values, do not paste literal `33` or `2,007`): `A 10×10 climate-controlled storage unit in Cincinnati runs $150–250 per month. Over five years, that's $9,000–$15,000 in fees — for a space you never own. A 20ft container is a one-time purchase of {ownPurchaseDisplay} today, or about {ownMonthlyDisplay} per month amortized over five years — and it belongs to you permanently. When you no longer need it, it can be resold — containers hold their value well because steel doesn't depreciate like wood. The math works strongly in favor of ownership for anyone storing long-term.` where `ownPurchaseDisplay` renders `pricing['20ftCargo'].price` formatted as `$2,007` and `ownMonthlyDisplay` renders `monthlyOver5yr(pricing['20ftCargo'].price)` as `$33`.
  Immediately after this block's `<p>`, add the microcopy line: `<p class="uc-price-note">Container pricing reflects current market · updated June 2026.</p>` (small, muted; add a `.uc-price-note { font-family: var(--mono); font-size: 11px; letter-spacing: .04em; text-transform: uppercase; opacity: .55; margin: 12px 0 0; }` rule to this page's scoped `<style>` block).
- Block 2 title: `More secure than a shed, more accessible than a storage facility`
  Body: `A shipping container is built from the same Cor-Ten steel used in ocean freight. There's no OSB or vinyl skin to cut through, no plastic windows, and no flat roof that accumulates water. The double door locks with a steel hasp designed for padlocks or puck locks. And it's on your property — you access it any time, day or night, without driving anywhere.`
- Block 3 title: `A 20ft container fits most suburban properties`
  Body: `The most common residential size is the 20ft container: 8 feet wide, 8'6" tall, and 20 feet long — roughly the footprint of two standard parking spaces end-to-end. Most suburban driveways and backyards in Ohio, Indiana, and Kentucky can accommodate a 20ft unit. The delivery truck needs about 50 feet of clear approach — a standard residential street is typically sufficient.`
- Block 4 title: `Permit requirements vary — we can help you figure yours out`
  Body: `Some municipalities require a zoning permit for a storage container; many don't. Agricultural properties almost always have exemptions. Residential properties inside city limits are most likely to need a permit. When you request a quote, include your county and whether you're inside city limits — we'll tell you what we know and help you find out what we don't.`

**Recommendations (framing H2 `Which container fits your situation`):**
- 20ft body: `Best for: most residential properties. Fits the footprint of a large shed, stores the equivalent of a two-car garage.` → `/shipping-containers-for-sale/20-foot-shipping-container/`
- 40ft body: `Best for: large properties with a full driveway or dedicated storage area. Roughly twice the capacity of a 20ft.` → `/shipping-containers-for-sale/40-foot-shipping-container/`
- One-trip body: `Best for: placement in a visible location — front yard, property entrance, or anywhere appearance matters.` → `/shipping-containers-for-sale/40-foot-one-trip-container/`
- Framing line: `Most homeowners choose the 20ft. It fits most driveways and backyards without special placement planning.`

**Where we deliver:** identical to skeleton (same lede + four live city cards CIN/DAY/IND/LOU).

**FAQ — H2 `Common questions`, 5 items. Use these verbatim in BOTH the `.uc-faq-item` blocks AND the JSON-LD:**

- Q1: `Will a 20ft container fit in a standard suburban driveway?`
  A1: `Usually, yes. A 20ft container is 8 feet wide and 20 feet long — roughly the footprint of a large SUV and a half-car length. Most standard suburban driveways are wide enough, though placement depends on attached garages, fence lines, or utility setbacks. More important than the footprint is delivery clearance: the truck needs about 50 feet of unobstructed approach. A standard residential street with traffic is typically workable. Include your address when requesting a quote and we can assess the approach.`
- Q2: `Do I need a permit to have a shipping container on my residential property in Ohio?`
  A2: `It depends on your location. Properties zoned agricultural are almost universally exempt. Residential properties inside city limits in Ohio have varying rules — some municipalities require a permit, some have a size threshold below which no permit is required, and some have no restriction at all. Most unincorporated township properties in Ohio, Indiana, and Kentucky don't require a permit. The fastest way to find out is to call your county auditor or zoning office. When you request a quote, tell us your county and we'll share what we know from working in your area.`
- Q3: `How does delivery work in a residential neighborhood?`
  A3: `A tilt-bed truck backs in, tilts, and slides the container into position. The process takes 30–45 minutes from truck arrival to completion. We minimize impact on neighboring traffic, but neighbors may need to move vehicles temporarily if the approach is tight. We don't require street closures or permits for delivery in most cases. If your street has weight limits or parking restrictions, mention that when you request a quote.`
- Q4: `How does buying a container compare to renting a storage unit long-term?`
  **This answer carries the 5-yr comparison and must reference the computed purchase figure from `pricing.ts` (do NOT hardcode `2,007`).** The competitor ranges ("$150–200 per month", "$9,000–$12,000") are approved verbatim. Assemble the answer in-template, interpolating `ownPurchaseDisplay`:
  A4 (template): `The math usually favors ownership for anything beyond 2–3 years. A climate-controlled 10×10 storage unit in the Cincinnati metro averages $150–200 per month and increases annually. Over 5 years, that's $9,000–$12,000 in fees for space you never own. A 20ft container is a one-time purchase of {ownPurchaseDisplay} today — far less over that horizon, and you can sell it when you're done. The container also holds more than a 10×10 unit and sits on your property. The tradeoff: you need the outdoor space, and a storage facility protects climate-sensitive items better since containers have no HVAC.`
  Render this same assembled string in BOTH the `.uc-faq-item` `<p>` and the matching JSON-LD `text` value below (the JSON-LD uses `JSON.stringify`, so interpolate `${ownPurchaseDisplay}` into the JS string there — see the updated JSON-LD note).
- Q5: `Can I add shelving, electricity, or other modifications to a container?`
  A5: `Yes — containers are commonly modified for exactly this purpose. Shelving mounts directly to the corrugated side walls using standard fasteners. Electrical can be run from your home's panel to the container if it's placed within practical distance; an electrician can wire a standard outlet and light in a few hours. We don't sell modified containers, but we can point you toward local fabricators who handle electrical, shelving, ventilation, and insulation.`

**Complete FAQPage JSON-LD block for this page (paste verbatim inside `<Fragment slot="head">`):**

```astro
  <Fragment slot="head">
    <script type="application/ld+json" set:html={JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Will a 20ft container fit in a standard suburban driveway?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Usually, yes. A 20ft container is 8 feet wide and 20 feet long — roughly the footprint of a large SUV and a half-car length. Most standard suburban driveways are wide enough, though placement depends on attached garages, fence lines, or utility setbacks. More important than the footprint is delivery clearance: the truck needs about 50 feet of unobstructed approach. A standard residential street with traffic is typically workable. Include your address when requesting a quote and we can assess the approach."
          }
        },
        {
          "@type": "Question",
          "name": "Do I need a permit to have a shipping container on my residential property in Ohio?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "It depends on your location. Properties zoned agricultural are almost universally exempt. Residential properties inside city limits in Ohio have varying rules — some municipalities require a permit, some have a size threshold below which no permit is required, and some have no restriction at all. Most unincorporated township properties in Ohio, Indiana, and Kentucky don't require a permit. The fastest way to find out is to call your county auditor or zoning office. When you request a quote, tell us your county and we'll share what we know from working in your area."
          }
        },
        {
          "@type": "Question",
          "name": "How does delivery work in a residential neighborhood?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A tilt-bed truck backs in, tilts, and slides the container into position. The process takes 30–45 minutes from truck arrival to completion. We minimize impact on neighboring traffic, but neighbors may need to move vehicles temporarily if the approach is tight. We don't require street closures or permits for delivery in most cases. If your street has weight limits or parking restrictions, mention that when you request a quote."
          }
        },
        {
          "@type": "Question",
          "name": "How does buying a container compare to renting a storage unit long-term?",
          "acceptedAnswer": {
            "@type": "Answer",
            // NOTE: interpolate ${ownPurchaseDisplay} from pricing.ts — this is a JS template literal inside the object passed to JSON.stringify. Do NOT hardcode the purchase price.
            "text": `The math usually favors ownership for anything beyond 2–3 years. A climate-controlled 10×10 storage unit in the Cincinnati metro averages $150–200 per month and increases annually. Over 5 years, that's $9,000–$12,000 in fees for space you never own. A 20ft container is a one-time purchase of ${ownPurchaseDisplay} today — far less over that horizon, and you can sell it when you're done. The container also holds more than a 10×10 unit and sits on your property. The tradeoff: you need the outdoor space, and a storage facility protects climate-sensitive items better since containers have no HVAC.`
          }
        },
        {
          "@type": "Question",
          "name": "Can I add shelving, electricity, or other modifications to a container?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes — containers are commonly modified for exactly this purpose. Shelving mounts directly to the corrugated side walls using standard fasteners. Electrical can be run from your home's panel to the container if it's placed within practical distance; an electrician can wire a standard outlet and light in a few hours. We don't sell modified containers, but we can point you toward local fabricators who handle electrical, shelving, ventilation, and insulation."
          }
        }
      ]
    })} />
  </Fragment>
```

**CTA headline:** `Get a quote for your property.` (rest of CTA section identical to skeleton.)

**Verification (Task 3):**
1. `npm run build` — zero errors, route `/for/homeowners/index.html` present.
2. `grep -c '"@type":"Question"' dist/for/homeowners/index.html` returns `5`; `grep -c 'FAQPage' dist/for/homeowners/index.html` is at least `1`.
2a. **Pricing.ts wiring:** confirm the computed monthly figure rendered — `grep -c '\$33' dist/for/homeowners/index.html` is at least `1` (why-block 1), and the purchase figure — `grep -c '\$2,007' dist/for/homeowners/index.html` is at least `1` (why-block 1 + FAQ Q4). Confirm the microcopy rendered — `grep -c 'current market · updated June 2026' dist/for/homeowners/index.html` is at least `1`. (If `pricing.ts` changes, these greps change with it — that's expected.)
3. `npm run dev`, open `http://localhost:4321/for/homeowners/` — confirm red accents, four why-blocks, three rec cards, four live city cards, five FAQ items, dark CTA to `/quote/`. Visually confirm why-block 1 shows the ~$33/mo and $2,007 figures plus the "current market · updated June 2026" microcopy, and FAQ Q4 shows the $2,007 purchase figure.
4. Commit:
   ```
   git add src/pages/for/homeowners/index.astro
   git commit -m "feat(use-case): add /for/homeowners/ use-case page

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
   ```

---

## Task 4 — `/for/businesses/`

**File to create:** `src/pages/for/businesses/index.astro`
**Import path:** `import BaseLayout from '../../../layouts/BaseLayout.astro';` (THREE `../`)
**Accent variable:** `var(--c5-permits)` (orange) — use in the hero accent bar, all four `.uc-sh` borders, all three `.uc-rec` top borders, and all five `.uc-faq-item` left borders.
**Static page:** do NOT add `export const prerender = true;`.

Build using the **Shared Page Skeleton** markup + the **canonical scoped `<style>` block** (and `src/pages/for/farmers/index.astro` as a structural reference). Substitute the businesses content below verbatim; set every `__ACCENT__` to `var(--c5-permits)`.

**Frontmatter import (REQUIRED — this page displays a dollar figure from `pricing.ts`):** in the `---` frontmatter, alongside the `BaseLayout` import, add:
```ts
import { pricing, perSqFt, roundToHalf } from '../../../data/pricing';
const std40 = pricing['40ftStandard'];                                  // 40ft Standard, NOT HC
const perSqFtDisplay = `$${roundToHalf(perSqFt(std40.price, std40.sqft)).toFixed(2)}`; // "$8.50"
```
Use `perSqFtDisplay` in why-block 1. Use the 40ft **Standard** (2709 ÷ 320 = $8.47 → rounds to **$8.50**), NOT the HC, to sidestep the HC price anomaly. Do NOT hardcode `8.50` in markup.

**BaseLayout props:**
- `title="Commercial Container Storage in Ohio, Indiana & Kentucky | Steel Box Direct"`
- `description="Overflow inventory, equipment storage, and secure commercial storage containers. Delivered within 250 miles of Cincinnati across OH/IN/KY. Quote in 4 hours."`
- `pageType="guide"`, `datePublished="2026-06-04"`, `dateModified="2026-06-04"`

**Hero:**
- Eyebrow: `For Businesses & Commercial Use`  (write as `For Businesses &amp; Commercial Use` in markup)
- H1: `Overflow Storage That Scales With Your Operation.`
- Lede: `Seasonal inventory spikes. Equipment overflow. On-site document archive. Delivered to your loading area, configured to your timeline.`

**Why containers work for businesses — H2 `Why containers work for businesses`, 4 blocks:**
- Block 1 title: `Avoid the cost of off-site commercial storage`
  **This block carries the cost-per-sq-ft comparison and is the businesses page's dollar block. Do NOT hardcode the per-sq-ft figure — interpolate `perSqFtDisplay` (~$8.50, computed from the 40ft Standard in `pricing.ts`).** Keep the competitor side tied to the spec's existing "per square foot / per month" framing — do NOT invent a precise competitor sticker price beyond that.
  Body (assemble in-template — interpolate `perSqFtDisplay`): `Commercial storage facilities charge by the pallet, the square foot, or the cubic foot — every month — and access windows are limited by facility hours. Own a 40ft container outright and your storage works out to about {perSqFtDisplay} per square foot, one time. An on-site container gives you same-day access to inventory, eliminates inbound/outbound freight costs to and from a third-party facility, and removes a logistics dependency from your operation. For businesses with predictable seasonal peaks, a container that arrives in spring and departs in fall is significantly cheaper than 6 months of commercial rack storage charged per square foot every month.` where `{perSqFtDisplay}` renders the value computed in the frontmatter.
  Immediately after this block's `<p>`, add the microcopy line: `<p class="uc-price-note">Container pricing reflects current market · updated June 2026.</p>` (add the `.uc-price-note { font-family: var(--mono); font-size: 11px; letter-spacing: .04em; text-transform: uppercase; opacity: .55; margin: 12px 0 0; }` rule to this page's scoped `<style>` block).
- Block 2 title: `Ground-level, forklift-compatible access`
  Body: `Container doors open at ground level to a hardwood or steel floor. Standard ISO containers have forklift pockets on the underside, so repositioning on site doesn't require a crane. Pallet jacks and forklifts enter directly — no dock required. Interior height is 7'10" for standard containers.`
- Block 3 title: `Scales up or down with your inventory cycle`
  Body: `Need three containers for Q4 and one for the rest of the year? We can drop and retrieve on your schedule. Multiple units can be positioned adjacent with doors accessible. For businesses that want to own rather than manage a recurring delivery contract, purchase with resale when no longer needed is also straightforward.`
- Block 4 title: `Secure enough for most commercial insurance policies`
  Body: `A Cor-Ten steel container with a puck-lock hasp meets the standard for covered business property storage under most commercial property insurance policies. We provide delivery documentation for your records. If your carrier has specific requirements, let us know and we can accommodate.`

**Recommendations (framing H2 `Which container fits your situation`):**
- 20ft body: `Best for: single-product overflow, document archive, small equipment. Compact footprint for sites with limited staging area.` → `/shipping-containers-for-sale/20-foot-shipping-container/`
- 40ft body: `Best for: pallet-level inventory, seasonal goods, multi-product overflow. Handles full pallet entry with a forklift.` → `/shipping-containers-for-sale/40-foot-shipping-container/`
- One-trip body: `Best for: food-adjacent storage, pharmaceutical overflow, electronics, or any application with contamination or odor sensitivity requirements.` → `/shipping-containers-for-sale/40-foot-one-trip-container/`
- Framing line: `Most commercial buyers choose the 40ft cargo-worthy unit for inventory overflow — it handles standard pallet configurations and costs significantly less per cubic foot than the 20ft.`

**Where we deliver:** identical to skeleton (same lede + four live city cards CIN/DAY/IND/LOU).

**FAQ — H2 `Common questions`, 5 items. Use these verbatim in BOTH the `.uc-faq-item` blocks AND the JSON-LD:**

- Q1: `Can a container be placed at a loading dock or commercial facility?`
  A1: `Containers can be placed adjacent to a loading dock, in a parking lot, or in a designated staging area. They cannot be directly docked to a raised loading platform — the container door sill sits at ground level, not at dock height. For dock-height access, a yard ramp or dock plate bridges the gap; these are widely available from material handling suppliers. Describe your placement area when requesting a quote and we'll confirm feasibility.`
- Q2: `What are your lead times for commercial delivery?`
  A2: `For standard cargo-worthy 20ft and 40ft units, most commercial orders in our service area are delivered within 3–5 business days of quote approval, subject to inventory availability. One-trip units may have a slightly longer lead time. If you have a project start date or a specific delivery window, include it in the quote request and we'll confirm upfront.`
- Q3: `Can we get multiple containers for a single location?`
  A3: `Yes. Multiple containers can be delivered to a single site in one trip or staggered across multiple trips. If you need units placed adjacent in a specific configuration — side-by-side with aligned doors — include a description of the layout in your quote request. We'll plan the delivery sequence to ensure the footprint works and all doors remain accessible.`
- Q4: `How do businesses typically handle container storage for accounting or tax purposes?`
  A4: `A purchased container is generally treated as tangible personal property and depreciates under MACRS as a 5 or 7-year asset under standard IRS classifications, though your accountant should confirm based on your specific use. The container is not real property and does not typically trigger real estate assessments or property tax reclassification. A leased container would be expensed as an operating cost. We provide a standard bill of sale for all purchases.`
- Q5: `Do you work with businesses that need deliveries across different locations?`
  A5: `Yes. We serve the full 250-mile radius from Cincinnati, which includes major commercial corridors in Ohio, Indiana, and Kentucky. If your business has multiple facilities within our service area, each location gets its own delivery. For recurring commercial relationships, contact us directly to discuss volume arrangements.`

**Complete FAQPage JSON-LD block for this page (paste verbatim inside `<Fragment slot="head">`):**

```astro
  <Fragment slot="head">
    <script type="application/ld+json" set:html={JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Can a container be placed at a loading dock or commercial facility?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Containers can be placed adjacent to a loading dock, in a parking lot, or in a designated staging area. They cannot be directly docked to a raised loading platform — the container door sill sits at ground level, not at dock height. For dock-height access, a yard ramp or dock plate bridges the gap; these are widely available from material handling suppliers. Describe your placement area when requesting a quote and we'll confirm feasibility."
          }
        },
        {
          "@type": "Question",
          "name": "What are your lead times for commercial delivery?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "For standard cargo-worthy 20ft and 40ft units, most commercial orders in our service area are delivered within 3–5 business days of quote approval, subject to inventory availability. One-trip units may have a slightly longer lead time. If you have a project start date or a specific delivery window, include it in the quote request and we'll confirm upfront."
          }
        },
        {
          "@type": "Question",
          "name": "Can we get multiple containers for a single location?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Multiple containers can be delivered to a single site in one trip or staggered across multiple trips. If you need units placed adjacent in a specific configuration — side-by-side with aligned doors — include a description of the layout in your quote request. We'll plan the delivery sequence to ensure the footprint works and all doors remain accessible."
          }
        },
        {
          "@type": "Question",
          "name": "How do businesses typically handle container storage for accounting or tax purposes?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A purchased container is generally treated as tangible personal property and depreciates under MACRS as a 5 or 7-year asset under standard IRS classifications, though your accountant should confirm based on your specific use. The container is not real property and does not typically trigger real estate assessments or property tax reclassification. A leased container would be expensed as an operating cost. We provide a standard bill of sale for all purchases."
          }
        },
        {
          "@type": "Question",
          "name": "Do you work with businesses that need deliveries across different locations?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. We serve the full 250-mile radius from Cincinnati, which includes major commercial corridors in Ohio, Indiana, and Kentucky. If your business has multiple facilities within our service area, each location gets its own delivery. For recurring commercial relationships, contact us directly to discuss volume arrangements."
          }
        }
      ]
    })} />
  </Fragment>
```

**CTA headline:** `Get a quote for your operation.` (rest of CTA section identical to skeleton.)

**Verification (Task 4):**
1. `npm run build` — zero errors, route `/for/businesses/index.html` present.
2. `grep -c '"@type":"Question"' dist/for/businesses/index.html` returns `5`; `grep -c 'FAQPage' dist/for/businesses/index.html` is at least `1`.
2a. **Pricing.ts wiring:** confirm the per-sq-ft figure rendered — `grep -c '\$8.50' dist/for/businesses/index.html` is at least `1` (why-block 1, from 40ft Standard 2709÷320). Confirm the microcopy rendered — `grep -c 'current market · updated June 2026' dist/for/businesses/index.html` is at least `1`. (If `pricing.ts` changes, this grep changes with it — expected.)
3. `npm run dev`, open `http://localhost:4321/for/businesses/` — confirm orange accents, four why-blocks, three rec cards, four live city cards, five FAQ items, dark CTA to `/quote/`. Visually confirm why-block 1 shows the ~$8.50/sq ft figure plus the "current market · updated June 2026" microcopy.
4. Commit:
   ```
   git add src/pages/for/businesses/index.astro
   git commit -m "feat(use-case): add /for/businesses/ use-case page

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
   ```

---

## Final cross-page verification (after all 5 tasks)

1. `npm run build` — confirm the data file builds and all four routes build with zero errors:
   - `src/data/pricing.ts` compiles (Task 0)
   - `dist/for/farmers/index.html`
   - `dist/for/contractors/index.html`
   - `dist/for/homeowners/index.html`
   - `dist/for/businesses/index.html`
2. Confirm each page has exactly one FAQPage and five Questions in its built HTML (run the per-task greps).
3. Confirm the sitemap picked up all four routes (the `@astrojs/sitemap` filter only excludes `/admin/`): check `dist/sitemap-0.xml` for `/for/farmers/`, `/for/contractors/`, `/for/homeowners/`, `/for/businesses/`.
4. **Dollar-scope gate (per decision 2026-06-04):** ONLY homeowners and businesses may contain `$`. Confirm:
   - `grep -oE '\$[0-9]' dist/for/farmers/index.html | wc -l` → `0`
   - `grep -oE '\$[0-9]' dist/for/contractors/index.html | wc -l` → `0`
   - `grep -oE '\$[0-9]' dist/for/homeowners/index.html | wc -l` → `> 0` (5-yr figures + microcopy)
   - `grep -oE '\$[0-9]' dist/for/businesses/index.html | wc -l` → `> 0` (per-sq-ft figure + microcopy)
   And confirm every price figure on homeowners/businesses derives from `src/data/pricing.ts` (no hardcoded container price in markup). The competitor/third-party ranges (e.g. "$150–250 per month") are approved verbatim spec copy. No new quotable container sticker was added to any city/product page.
