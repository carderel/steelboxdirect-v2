# Decision: Product Pages Architecture

**Date:** 2026-05-25  
**Session:** 2026-05-25 brainstorm + planning session  
**Agents involved:** seo-analyst, orchestrator

---

## Decision 1: URL Structure

**Chosen:** `/shipping-containers-for-sale/` hub + keyword-slug subpages  
**Slugs:** `20-foot-shipping-container`, `40-foot-shipping-container`, `40-foot-one-trip-container`

**Alternatives considered:**
- `/containers/` hub — cleaner but lower keyword value in URL
- Flat root-level slugs — loses hub-page topical authority

**Rationale:** Hub URL captures "shipping containers for sale" head term. Subpage slugs capture size-specific long-tail queries. Nested structure signals topical relationship to crawlers.

---

## Decision 2: Implementation Approach

**Chosen:** Dynamic route with `getStaticPaths()` + shared data file (`containers.ts`)

**Alternatives considered:**
- Astro content collections — overkill for 3 products, no content editors
- Flat separate `.astro` files — matches current city page pattern but doesn't scale; layout changes require editing every file

**Rationale:** One template file means one place to update layout and SEO logic. Data in `containers.ts` means one place to update content. Astro still generates fully static HTML per URL — no SEO trade-off.

---

## Decision 3: Pricing Policy

**Chosen:** No dollar amounts on any page. Short explanation + CTA to quote form.

**Rationale:** Steel and freight prices change weekly. A number on a page becomes a liability. Homepage already uses "avg · prices vary" language. Consistent policy eliminates stale-price complaints.

---

## Decision 4: City Pages Refactored in Same Session

**Chosen:** City pages brought into scope alongside product pages.

**Rationale:** Same pattern (data file + dynamic template), same session, eliminates future tech debt before it compounds. User confirmed this explicitly.

**Key rules:**
- Existing city URLs preserved exactly (`/cincinnati-shipping-containers/` etc.)
- Old flat files deleted only after build confirms template generates identical URLs
- No redirects needed

---

## Decision 5: Pricing Cards → Maps on City Pages

**Chosen:** Replace Dayton, Indianapolis, Louisville pricing cards with OSM map embeds matching Cincinnati.

**Rationale:** Three city pages had dollar amounts (`$275–$475`, `$300–$500`, `$285–$485`). Now inconsistent with the no-numbers pricing policy. Cincinnati already has a map. Standardizing on maps removes risk and improves consistency.
