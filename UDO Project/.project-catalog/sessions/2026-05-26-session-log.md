# Session Log — 2026-05-26

**Branch:** main  
**Commits this session:** af8e9d3 → 2b998a5  
**Status:** Complete — pushed live

---

## Work Completed

### Hero Scaffold (5-zone grid)
- Built full 5-zone hero grid in `HeroSection.astro`
- Zone 1: H1 `7.5cqi` with `container-type:inline-size`, "That Actually Show Up." in `var(--c3-deliver)` blue, H2 right-aligned at `.75em`
- Zone 2: "Container storage, done right." + "No hard sell." right-aligned, 75%-wide `#a08400` top/bottom borders via `::before`/`::after`, SVG curved arrow pointing at container image
- Zone 3: `containerHero` image full-cover `object-fit:cover`
- Zone 4: body copy with `var(--display)` (Archivo) font, ink highlight marks on "expensive farm equipment" and "five decisions"
- Zone 5: ink CTA button "START: WHAT SIZE? →", two text links (Browse Containers, Skip ahead quote)
- Removed all scaffold borders from `.hero-grid` and `.hz`

### Nav Restructure
- Replaced standalone links (The Five, The Rig, Pricing, FAQ) with:
  - `Shipping Containers ▾` (renamed from "Containers")
  - `Guides ▾` — SZ/CND/DLV/CST/PRM → all five guide pages
  - `Tools ▾` — CAL/DEL/QTE → Size Calculator, Delivery Checker, Get a Quote
- City abbreviation hover: changed from `var(--ink)` to `var(--cream)` — was yellow-on-yellow (invisible)

### Component Extraction (major refactor)
All homepage sections extracted to separate components:
- `src/components/SiteNav.astro`
- `src/components/SiteFooter.astro`
- `src/components/FloatingSidebar.astro`
- `src/components/home/HeroSection.astro`
- `src/components/home/ProblemSection.astro`
- `src/components/home/FiveSection.astro`
- `src/components/home/RigSection.astro`
- `src/components/home/PersonasSection.astro`
- `src/components/home/PriceSection.astro`
- `src/components/home/FaqSection.astro`
- `src/components/home/CtaSection.astro`

`index.astro` is now 25 lines. `BaseLayout.astro` is a thin shell.  
Permanent Marker font moved from head slot into BaseLayout's `<head>`.

### Task Cleanup
- Task #13 (P1-5: city-specific LocalBusiness schema) marked complete — was already implemented in prior session, never closed

---

## Key Technical Decisions

- `container-type: inline-size` on `.hz-1` and all zones using `cqi` units — fonts scale with zone width, not viewport (fixes 2560px monitor overflow)
- `::before`/`::after` pseudo-elements for 75%-width borders (CSS `border-top/bottom` can't be partial-width)
- `var(--display)` = `'Archivo', system-ui, sans-serif` — applied to hz4-copy
- Scoped `<style>` per component — Astro adds `data-astro-cid-*` automatically, no class collisions

---

## Commits

| Hash | Message |
|------|---------|
| 2b998a5 | refactor: extract nav, footer, and homepage sections into components |
| (prior) | Hero zone work accumulated across multiple micro-commits |

---

## Remaining Todos

- FAQ Schema & Snippet Optimization
- Tasks #14–19 (SEO P1/P2 items): locations pageType fix, WebSite schema, guide links, anchor text, Product schema
- Replace favicon.svg with real logo when available
