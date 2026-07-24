# Design Spec — Accurate Schema Graph + Visible "Quick Facts" Block

**Date:** 2026-07-24
**Status:** Draft for owner review
**Author:** Orchestrator (brainstorming) — build to be executed subagent-driven per UDO L002

---

## 1. Goal

Two coupled outcomes:

1. **Every content page exposes accurate schema.org JSON-LD** via a single unified entity graph — a global entity graph (`Organization`/`LocalBusiness`/`WebSite` with stable `@id`s) plus a correct per-page node (`WebPage` + `Product`/`Service`/`Article`/`CollectionPage`, with `FAQPage`/`HowTo` where applicable) linked by `@id`.
2. **An on-theme "Quick Facts" section renders above the footer**, surfacing that page's structured-data facts as **visible on-page text**.

### Why the visible block (the real driver)

AI agents browsing in sandboxed renderers read the **visible DOM text + accessibility tree** — not `<head>` JSON-LD or raw source. The Quick Facts block puts the schema's facts where those agents (and humans) actually read them. This is an AEO/citation play, consistent with the project's proven "get cited by AI" strategy.

The `ai-seo` skill validates this ("anything an agent would need … should be on a public, indexable page") **with one guardrail**: the block must read as a **genuinely useful human summary**, not a schema dump or an AI-bait fragment (Google's *scaled-content-abuse* risk). Design keeps it a real, concise summary.

---

## 2. Current State (evidence, Grade A — read from source)

- `src/components/Schema.astro` is the one schema component, invoked from `BaseLayout.astro` `<head>`. It emits an **array of separate `<script>` blocks**, each a standalone `@context` object — **not a `@graph`**.
- **No unified `@id` graph**: only `LocalBusiness` has an `@id` (`#localbusiness`); `Organization` and `WebSite` have none; nothing cross-references by `@id`.
- **Drift surface**: 12 pages inject *additional* schema through `<slot name="head">` (product `Product`+`BreadcrumbList`, home/hub/use-case/guide/blog `FAQPage`, blog `BlogPosting`, city inline block). Two sources today.
- **Taxonomy defect**: `pageType` conflates distinct entities — city pages and all four `/for/*` use-case pages are `pageType="guide"`, so they emit **`Article` schema incorrectly**.
- **No visible schema block** exists; schema is head-only.
- Existing data modules to source from: `condition.ts`, `stats.ts`, `pricing.ts`, `containerReference.ts`, `homeFaq.ts`, `cities.ts`, `blog.ts`.

---

## 3. Decisions Locked (owner, this brainstorm)

| # | Decision |
|---|---|
| D1 | Visible block = **human-readable facts card** (not raw JSON, not a JSON expander). |
| D2 | Block **leads with the page's main entity** (page facts + FAQs first); business identity is a compact secondary line. |
| D3 | **Page-first, compact identity** — do NOT re-dump full NAP/`sameAs` (footer already exposes those to agents); avoids duplication / AI-bait. |
| D4 | **No `AggregateRating`/`Review`** anywhere (deferred; never fabricated). Focus each page on its **main schema entity**. |
| D5 | **Scope = content/commercial pages only.** Exclude utility pages (quote, calculator, legal) and noindex pages (admin, 404). |
| D6 | Visual direction = **"B-v2 — Spec Sheet / Index Card"** (cream card, hard ink shadow, yellow header leading with the page entity, spec grid, quiet business strip, FAQ definition list). |
| D7 | Consolidate the separate `<head>` scripts + all 12 head-slot injections into **one `@graph`** (required for "no drift"). |
| D8 | Block is **purely additive** above the footer — replaces nothing currently visible. |

---

## 4. Architecture

### 4.1 Single data module — `src/lib/schema/`

**`entities.ts`** — the global entity graph, built once, stable `@id`s cross-referenced:

- `https://steelboxdirect.com/#organization` — Steel Box Direct; `parentOrganization` → `#freedomconex`; real `sameAs` (Google Maps CID + LinkedIn); `foundingDate` 2009; `makesOffer` (WWT sales) + `WarrantyPromise` (Lifetime Leak).
- `https://steelboxdirect.com/#localbusiness` — NAP (Cincinnati OH, `+15135462543`), `geo`, 250-mi `serviceArea` (OH/IN/KY/W. WV), `hasMap`, `parentOrganization` → `#organization`.
- `https://steelboxdirect.com/#website` — `WebSite`, `publisher` → `#organization`.
- `https://steelboxdirect.com/#freedomconex` — `Organization` (Freedom Conex LLC) node, referenced by both parents (real parent entity).

**`buildPageSchema(ctx)`** — a **pure function**. Input: a per-route context (discriminated union by page kind, carrying only what the page provides — slug, city, guide topic, blog post frontmatter, FAQ list). Output:

```
{
  graph: [ ...globalNodes, pageNode, faqNode?, howToNode?, breadcrumbNode ],
  quickFacts: { title, subtitle, specs: [{k, v}], businessLine, faqs: [{q, a}] }
}
```

Both fields are derived from the **same** page-node data → drift is structurally impossible.

### 4.2 `@id` scheme & linking

- Per-page node `@id`s: `{pageUrl}#webpage`, `#product`, `#service`, `#article`, `#collection`, `#faq`, `#howto`, `#breadcrumb`.
- `WebPage.isPartOf` → `#website`; `WebPage.about`/`mainEntity` → the page's primary node; `WebPage.breadcrumb` → `#breadcrumb`.
- `Product.offers.seller` → `#organization`; `Product.brand` → `#organization`; `Product.itemCondition` = `UsedCondition`; `offers.price` + self-maintaining `priceValidUntil` from `pricing.ts` (product pages only).
- `Service.provider` → `#localbusiness`; `Service.areaServed` → city (city + use-case pages).
- `Article.publisher`/`author` → `#organization`; `Article.mainEntityOfPage` → `#webpage`.
- `CollectionPage.mainEntity` → `ItemList` of children (hub, locations, blog index/category).

### 4.3 Rendering

- **Head**: one `<script type="application/ld+json">` emitting `{ "@context": "https://schema.org", "@graph": [...] }`. Replaces the array + all 12 head-slot injections.
- **Visible**: new `src/components/QuickFacts.astro` (B-v2 layout), rendered in `BaseLayout` **above `<SiteFooter>`**, gated by page kind (§5).
- Both consume `buildPageSchema(ctx)`. **Pure function of the route**; resolved at build/SSR time; **no client JS**.
- `BaseLayout` continues to accept existing props; a small `schemaContext` (or reuse of `guideTopic`/`cityOverride`/product data + a `quickFacts` override prop) feeds `ctx`. Pages that own specific data (product specs, use-case audience, blog frontmatter, FAQ lists) pass it in; everything else is inferred.

---

## 5. Per-Page-Type Mapping

| Route(s) | Page kind | Main entity node | Quick Facts content | Block? |
|---|---|---|---|---|
| `/` | home | `WebPage` + `WebSite`; `about` → `#organization`/service | Business identity line + top home FAQs (`homeFaq.ts`) | ✅ |
| `/shipping-containers-for-sale/` | product-hub | `CollectionPage` + `ItemList` of 3 products | Product lineup (3 sizes) + hub FAQs | ✅ |
| `/shipping-containers-for-sale/[slug]` (20ft, 40ft, 40ft HC) | product | `Product` + `FAQPage` | Container specs (`containerReference.ts`) + avg starting price\* + warranty + FAQs | ✅ |
| `/[citySlug]` | city | `Service` (`areaServed` = city, `provider` → `#localbusiness`) | Service in [City] + service area + phone + warranty + city FAQs — **$-free** | ✅ |
| `/for/{farmers,contractors,homeowners,businesses}` | use-case | `Service` (audience) + `FAQPage` | Use-case summary + relevant specs + FAQs | ✅ |
| `/size` `/condition` `/delivery` `/cost` `/permits` | guide | `Article` + `HowTo` | Guide summary + HowTo steps + FAQs | ✅ |
| `/container-buying-guide/` | guide | `Article` + `FAQPage` | Vetting checklist summary + FAQs | ✅ |
| `/container-reference/` | reference | `Article` + `FAQPage` | ISO reference facts + FAQs | ✅ |
| `/locations/` | locations | `CollectionPage` + `ItemList` of cities; `provider` → `#localbusiness` | Service area + covered cities + FAQs | ✅ |
| `/blog/` , `/blog/category/[category]` | blog-index | `CollectionPage` + `ItemList` of posts | Blog/category description + recent posts | ✅ |
| `/blog/[...slug]` | blog-post | `Article`/`BlogPosting` (+ `FAQPage` if present) | Author + updated date + key takeaways/FAQs | ✅ |
| `/quote/` | quote | `WebPage` (+ existing `TradeAction`) | — | ❌ |
| `/size/calculator` | tool | `WebPage` | — | ❌ |
| `/privacy` `/terms` | legal | `WebPage` | — | ❌ |
| `/404`, `/admin/*` | noindex | minimal / none | — | ❌ |

\* Avg starting price shows **only** on home/product/use-case per the 2026-07-09 pricing policy, always with the "average starting price — your quote may be more or less" disclaimer. **City `Service` nodes carry NO `offers`/price** and the city Quick Facts block is $-free (hard stop HS-PROJ).

---

## 6. Quick Facts Visual Spec (Direction B-v2)

- Cream (`--cream`) card, `2.5px` ink border, `10px 10px 0` ink hard shadow — matches the floating sidebar / site "sign" aesthetic.
- **Header (yellow bar):** page entity title + one-line subtitle (e.g. "40ft High Cube · Wind & Water Tight · used, sold as-is") + a small "Quick Facts" stamp.
- **Primary spec grid:** the page's main-entity facts (≤ ~8 rows), 3-up on desktop, mono labels / narrow-bold values.
- **Business strip (quiet):** one row — Seller · Est. 2009, Serves 250 mi from Cincinnati, Call (513) 546-2543.
- **FAQ block:** `<dl>` definition list (≤ ~3 Q&As) drawn from the page's `FAQPage` node.
- Semantic HTML (`<section>`, `<dl>/<dt>/<dd>`, real headings). Responsive; scrolls internally if needed; no horizontal page overflow. On-brand fonts (Archivo / Archivo Narrow / JetBrains Mono).
- **Content ceiling** (anti-AI-bait): the block is a *summary* — cap specs (~8) and FAQs (~3); never an exhaustive dump.

---

## 7. Guardrails (baked into the build)

- **City pages $-free** (hard stop) — no price in city `Service` node or city Quick Facts.
- **No fabricated ratings/reviews** — no `AggregateRating`/`Review` (D4). Trust signals = real `sameAs` (Google/LinkedIn) + `WarrantyPromise` + `parentOrganization`.
- **Price disclaimer** travels with any displayed average price.
- **Real entity data only** — NAP, `sameAs`, Freedom Conex parent all owner-verified; nothing invented.
- **WWT-only** condition; `itemCondition` = `UsedCondition`; not certified for shipping.
- **Delivery** framed as "all-in quote" / locked "about two weeks" wording; **no delivery-time promises** in facts.
- **Not AI-bait** — genuine human summary, gated to content pages, capped length, normal semantic HTML.

---

## 8. Validation Plan

1. **Rich Results Test + Schema Markup Validator** on representative pages: home, one product spec, one city, one HowTo guide, one use-case, one blog post, one collection (hub/locations/blog index). Zero errors; warnings only where the honest merchant posture intentionally leaves fields unfilled.
2. **`@graph` integrity:** single script parses; all `@id`s unique; every `@id` reference resolves to a node in the graph (no orphans).
3. **Anti-drift check:** verify the visible Quick Facts strings for each page kind appear in the emitted JSON-LD (manual per-kind, or a lightweight assertion).
4. **`npm run build` clean.**
5. **Playwright visual:** Quick Facts renders above footer on desktop + mobile for each included page kind; no overflow; **city page shows no `$`**.
6. **Post-deploy:** monitor GSC for new schema errors; confirm no regression to the honest-merchant warnings posture.

---

## 9. UDO Execution Note

Build is **subagent-driven** (L002): `astro-developer` implements; an independent `verifier` runs the validation plan (Rich Results + Playwright); orchestrator coordinates + keeps the audit trail (session log, checkpoints every 3 todos, decision log, memory, PROJECT_STATE). Orchestrator performs zero hands-on build/verify work.

---

## 10. Out of Scope / Non-Goals

- Ratings/review schema (deferred, D4).
- Quick Facts on quote / calculator / legal / admin / 404.
- Footer redesign, nav changes, pricing changes, city price display.
- New content pages or copy rewrites beyond the facts the block surfaces.

---

## 11. Assumptions

- **A001** — The existing head-slot schema on the 12 pages can be removed and reproduced faithfully by `buildPageSchema`. *Impact if wrong:* a page loses a schema type; mitigated by the per-kind validation pass. Status: Unverified until build.
- **A002** — `pricing.ts`, `containerReference.ts`, `homeFaq.ts`, `cities.ts`, `blog.ts` expose enough per-page data to populate both node + quickFacts without new content authoring. *Impact if wrong:* a small data-module extension is added. Status: Unverified until plan.
