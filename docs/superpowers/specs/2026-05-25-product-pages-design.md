# Design Spec: Product Pages for SEO
**Date:** 2026-05-25  
**Status:** Approved  
**Author:** The Architect (UDO session)

---

## Goal

Build a product section for Steel Box Direct that ranks for container-size keywords and converts undecided buyers. Two-tier structure: a hub landing page + individual spec subpages per container type.

---

## Container Types in Scope

- 20-Foot Shipping Container
- 40-Foot Shipping Container
- 40-Foot One-Trip Container

---

## URL Structure

```
/shipping-containers-for-sale/                              ← hub
/shipping-containers-for-sale/20-foot-shipping-container/  ← spec
/shipping-containers-for-sale/40-foot-shipping-container/  ← spec
/shipping-containers-for-sale/40-foot-one-trip-container/  ← spec
```

---

## Implementation Approach

**Dynamic route with `getStaticPaths()` + shared data file.**

Chosen for: easiest to edit without SEO sacrifice. All product content lives in one file (`containers.ts`). Template is shared across all spec pages. Astro generates fully static HTML per URL — Google sees three separate, fully-rendered, keyword-specific pages.

### Files

```
src/data/containers.ts                              ← all product data (specs, copy, SEO)
src/pages/shipping-containers-for-sale/index.astro  ← hub page
src/pages/shipping-containers-for-sale/[slug].astro ← spec page template
```

### Future: City Pages
City pages (`cincinnati-shipping-containers.astro`, etc.) should follow this same pattern when more cities are added — refactor to `src/data/cities.ts` + `src/pages/[city-slug].astro`. Out of scope for this implementation.

---

## Data Structure (`containers.ts`)

```typescript
export interface Container {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  keySpecs: [string, string, string]; // shown as chips in hero
  specs: {
    externalDims: string;
    internalDims: string;
    doorOpening: string;
    payload: string;
    tare: string;
    cubicCap: string;
  };
  useCases: Array<{ title: string; body: string }>;
  compareNote: string; // one-line differentiator vs other sizes
  seo: {
    title: string;
    description: string;
  };
}

export const containers: Container[] = [
  {
    slug: "20-foot-shipping-container",
    name: "20-Foot Shipping Container",
    shortName: "20ft",
    tagline: "Fits a standard driveway. Stores a full garage.",
    keySpecs: ["20' × 8' × 8'6\"", "1,172 cu ft", "7'8\" door width"],
    specs: {
      externalDims: "20' L × 8' W × 8'6\" H",
      internalDims: "19'4\" L × 7'8\" W × 7'10\" H",
      doorOpening:  "7'8\" W × 7'5\" H",
      payload:      "47,900 lbs",
      tare:         "4,850 lbs",
      cubicCap:     "1,172 cu ft",
    },
    useCases: [
      { title: "Farm & Ranch Storage", body: "Secure, weatherproof storage for equipment, feed, and tools without a permanent structure permit in most counties." },
      { title: "Construction Job Site", body: "Lock up tools and materials on-site. The 20ft fits most job sites where a 40ft would block access." },
      { title: "Backyard Workshop", body: "Convert into a workshop, hobby room, or overflow storage. Fits most suburban lots and standard driveways." },
    ],
    compareNote: "Half the length of a 40ft — fits tighter spaces and costs less to deliver.",
    seo: {
      title: "20-Foot Shipping Container for Sale | Steel Box Direct",
      description: "Buy a 20ft shipping container delivered within 250 miles of Cincinnati. Cargo-worthy and one-trip units available. Get a quote within 4 business hours.",
    },
  },
  {
    slug: "40-foot-shipping-container",
    name: "40-Foot Shipping Container",
    shortName: "40ft",
    tagline: "Maximum storage. The industry standard for serious projects.",
    keySpecs: ["40' × 8' × 8'6\"", "2,390 cu ft", "7'8\" door width"],
    specs: {
      externalDims: "40' L × 8' W × 8'6\" H",
      internalDims: "39'5\" L × 7'8\" W × 7'10\" H",
      doorOpening:  "7'8\" W × 7'5\" H",
      payload:      "59,039 lbs",
      tare:         "8,160 lbs",
      cubicCap:     "2,390 cu ft",
    },
    useCases: [
      { title: "Large Farm Operations", body: "Store tractors, implements, and seasonal equipment. Two 20ft worth of space in a single footprint with one door to manage." },
      { title: "Commercial Storage", body: "Inventory overflow, seasonal stock, or on-site warehousing. The 40ft is the industry standard for a reason." },
      { title: "Permanent Structures", body: "The most popular base for container conversions — offices, workshops, and guest spaces. Enough room to split into zones." },
    ],
    compareNote: "Twice the storage of a 20ft — needs more clearance for delivery and placement.",
    seo: {
      title: "40-Foot Shipping Container for Sale | Steel Box Direct",
      description: "Buy a 40ft shipping container delivered within 250 miles of Cincinnati. Standard cargo-worthy units with flat-fee local delivery. Get a quote in 4 hours.",
    },
  },
  {
    slug: "40-foot-one-trip-container",
    name: "40-Foot One-Trip Container",
    shortName: "40ft One-Trip",
    tagline: "Like new. One ocean crossing. Ready for anything.",
    keySpecs: ["40' × 8' × 8'6\"", "2,390 cu ft", "Near-new condition"],
    specs: {
      externalDims: "40' L × 8' W × 8'6\" H",
      internalDims: "39'5\" L × 7'8\" W × 7'10\" H",
      doorOpening:  "7'8\" W × 7'5\" H",
      payload:      "59,039 lbs",
      tare:         "8,160 lbs",
      cubicCap:     "2,390 cu ft",
    },
    useCases: [
      { title: "Conversions & Builds", body: "The cleanest canvas for container homes, offices, and studios. No rust, no previous cargo residue, no surprises." },
      { title: "Food & Sensitive Storage", body: "When cargo-worthy just isn't clean enough. One-trip containers haven't carried anything other than their initial load." },
      { title: "Long-Term Investment", body: "Premium condition means lower maintenance over time. If it's staying on your property for 10+ years, one-trip is worth the premium." },
    ],
    compareNote: "Same footprint as the standard 40ft — premium condition, higher price point.",
    seo: {
      title: "40-Foot One-Trip Shipping Container for Sale | Steel Box Direct",
      description: "Buy a like-new 40ft one-trip container delivered within 250 miles of Cincinnati. One ocean crossing, near-perfect condition. Get a quote in 4 hours.",
    },
  },
];
```

---

## Hub Page (`index.astro`) — Section Order

1. **Hero** — Yellow background. H1: "Shipping Containers for Sale". Subhead: service area + delivery pitch.
2. **Product Cards** — Three ink-bordered cards. Each: name, external dims, "prices vary — get a quote", *"See specs →"* link.
3. **Comparison Table** — All three containers side by side. Rows: external size, internal size, door opening, cubic capacity, tare weight, best for. Column headers link to spec pages.
4. **Use Case Matcher** — "Not sure which size?" Three scenario cards (tight driveway / job site / maximum storage), each pointing to the right product.
5. **Why Steel Box** — 3 trust blocks reusing the `.why-blk` pattern from `/locations/index.astro` (the `§ 01 / 02 / 03` numbered blocks with stat, headline, and tag): no broker markup / regional depots / real follow-through.
6. **FAQ** — 4–5 questions with FAQ schema markup.
7. **CTA** — Ink box, yellow shadow.

### Hub FAQ Questions
- What size shipping container do I need?
- What's the difference between cargo-worthy and one-trip?
- Do you deliver to my area?
- How long does delivery take?
- Can I modify or convert a container?

---

## Spec Page Template (`[slug].astro`) — Section Order

1. **Hero** — Yellow background. H1: product name. Three `keySpecs` chips. Tagline. Quote CTA.
2. **Specs Table** — Two-column card (label / value) from `specs` object.
3. **Size Compare** — Three-column table, all containers. Current page column highlighted. Other columns link to their spec pages.
4. **Use Cases** — Three cards from `useCases[]`. Yellow left-border treatment matching existing `.feature` style.
5. **Pricing** — No numbers. Short explanation (prices shift weekly, real number matters more than a stale one). Single CTA: *"Get a Current Quote →"*. Response time note.
6. **CTA Section** — Ink box, yellow shadow. Headline: "Ready for a [shortName] quote?" — pulls from data so it reads specific.

### Spec Page SEO
- `<title>` and `<meta description>` from `seo` object in data
- H1 = product name
- BreadcrumbList schema: Home → Shipping Containers for Sale → [Product Name]
- Internal links: hub → spec, spec → hub (breadcrumb + CTA), spec → spec (size compare table)

---

## Pricing Policy (All Pages)

No price numbers anywhere. Explanation: steel and freight costs shift weekly. Push to quote form. This matches the existing homepage approach and eliminates stale-pricing risk.

---

## Out of Scope

- City page refactor (noted as follow-up for when more cities are added)
- High cube, refrigerated, or other container variants
- Interactive size quiz or configurator
- Inventory management or live stock display
