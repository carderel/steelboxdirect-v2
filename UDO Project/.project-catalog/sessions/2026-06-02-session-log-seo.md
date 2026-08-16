# Session Log — 2026-06-02 (SEO Audit + Fixes)

**Branch:** main  
**Commits this session:** 42555b4 → 5ca8632  
**Status:** Complete — pushed live

---

## Work Completed

### IndexNow Integration (earlier in session)
See `2026-06-02-session-log.md` for details.

### Full Technical SEO Audit
Conducted RC-mode audit of steelboxdirect.com. 16 issues identified across crawlability, structured data, on-page SEO, and local SEO.

### SEO Fixes Implemented (9 commits)

#### Schema.astro — critical structured data fixes
- Removed shared generic `FAQPage` schema (was identical on 9+ pages — Google spam signal)
- Removed invalid `SearchAction` potentialAction from both `webSiteSchema` and `webpageSchema`
- Removed `Organization.sameAs` self-reference (was pointing to own domain)
- Added `@id: 'https://steelboxdirect.com/#localbusiness'` to LocalBusiness
- Added `telephone: '+15135462543'` to LocalBusiness
- Wired `datePublished`/`dateModified` props through BaseLayout → Schema

#### BaseLayout.astro — layout improvements
- Added `noindex?: boolean` prop (renders `<meta name="robots" content="noindex, nofollow">` when true)
- Added Open Graph meta tags: `og:type`, `og:url`, `og:title`, `og:description`, `og:site_name`
- Added Twitter Card meta tags: `twitter:card`, `twitter:title`, `twitter:description`
- Made Google Fonts non-blocking: `rel="preload" as="style" media="print" onload="..."` + `<noscript>` fallback
- Forwarded `datePublished`/`dateModified` to Schema component

#### robots.txt + admin pages
- Added `Disallow: /admin/` to robots.txt
- Passed `noindex={true}` to both `admin/login.astro` and `admin/dashboard.astro`

#### Guide pages — Article schema dates
- All 5 guide pages (size, condition, delivery, cost, permits) now pass per-page dates:
  - `datePublished="2026-03-10"` / `dateModified="2026-05-26"`

#### Guide pages — internal linking CTAs
- Added dark CTA section before `</BaseLayout>` on all 5 guide pages
- Size → links to /shipping-containers-for-sale/, 20ft, 40ft
- Condition → links to /shipping-containers-for-sale/, one-trip
- Cost → links to /quote/, /shipping-containers-for-sale/
- Delivery/Permits → links to /quote/, /shipping-containers-for-sale/
- Buttons use `var(--yellow)` inline override to be visible on `var(--ink)` background

#### City pages — city-specific FAQ schema + dates
- `[citySlug].astro` now injects city-specific `FAQPage` via `<Fragment slot="head">`
- 3 questions per city dynamically generated from `c.city`, `c.state`, `c.delivery.counties`, `c.delivery.body`, `c.cta.body`
- Added `datePublished="2026-04-15"` / `dateModified="2026-05-26"` to city pages

---

## Commits

| Hash | Message |
|------|---------|
| 42555b4 | fix(seo): remove shared FAQPage schema, fix LocalBusiness @id/telephone, clean WebSite schema |
| aa335d3 | fix(seo): remove invalid SearchAction from webpageSchema |
| 53799fc | feat(seo): add noindex prop, OG/Twitter meta tags, non-blocking Google Fonts, forward date props |
| bcbe86f | fix(perf): add media=print to Google Fonts preload for proper async loading |
| f963f0e | fix(seo): noindex admin pages, disallow /admin/ in robots.txt |
| 80a39c1 | fix(seo): per-page Article schema dates on all guide pages |
| 0b1d969 | feat(seo): add product/quote CTAs to all guide pages (internal linking) |
| 7a4b453 | feat(seo): city-specific FAQPage schema + Article dates on city pages |
| 5ca8632 | fix: make CTA buttons visible on dark guide-product-cta sections |

---

## Remaining SEO Items (deferred / user action required)

- **Google Business Profile** — user has not created one yet; add GBP URL to Organization.sameAs when available
- **GA4/Partytown verification** — user should check Network tab to confirm GA4 hits firing
- **Calculator page static content** — /size/calculator/ is React-only; needs static content fallback for Googlebot
- **og:image** — no image added to OG tags; add when logo/hero asset is confirmed
- **`webpageSchema` `deliveryMethod: OnlineOnly`** — minor invalid value in quotePageSchema, out of scope

---

## UDO Protocol Notes

- Full brainstorm → spec → plan → subagent-driven-development flow followed for IndexNow
- SEO audit used RC mode with evidence grades
- SEO fixes went directly to writing-plans → subagent-driven-development (requirements clear from audit)
- astro-developer + seo-analyst agents used for execution
- Two-stage review (spec + quality) on each of 6 implementation tasks
- Visual regression caught by final reviewer (invisible btn on dark CTAs) — fixed before push
