# Product Page Template Overhaul — Design Spec (2026-08-25)

Owner-approved design (verbal approval of all 8 sections, 2026-08-25). Sources: owner's
notes + ChatGPT and Gemini page audits (synthesized; ChatGPT's "250 miles of Cincinnati"
claim rejected as invented; Gemini's "actual customer photos" rejected as unfabricatable).
Related projects: T-170 honest-wear (shared photo session), T-171 (this).

## Scope

One shared template drives all three product pages:
`src/pages/shipping-containers-for-sale/[slug].astro` + `src/data/containers.ts`.
Also touched: `/quote/` (param preselection + callback lead handling),
the submit-quote endpoint (locate the actual handler file at build time; callback lead type),
`src/layouts/BaseLayout.astro` + `src/components/FloatingSidebar.astro` (popup rollout),
the T-170 product block (wear expectations) when its copy ships.
NOT in scope: the product hub, city pages, any pricing-policy change, DB schema changes.

## 1. Above-the-fold confidence block

Order per page: H1 (keeps the shipped "Used {size} Shipping Container for Sale" phrasing)
→ real photo slot (see §7) → confidence strip with five SOURCED facts:
1. Average starting price for this size, interpolated from `src/data/pricing.ts`
   (never hand-typed) + the standard "average starting price, your quote may be more or
   less" disclaimer inline.
2. Condition: "Wind & Water Tight (used), honest cosmetic wear" — links the T-170 wear
   guide once it exists; until then links `/condition/`.
3. "Lifetime Leak Warranty" (terms-backed).
4. Service area: "Ohio, Indiana, Kentucky + western West Virginia" (canonical claim).
5. "Quotes answered within 4 business hours" (live sitewide claim).
No invented figures, no delivery-time promises, no "250 miles" style radius claims.

## 2. Section reorder

Confidence block → price module + Quick Facts → ACTION BLOCK (§3) → wear-expectations
mini-block (T-170 Piece 3 copy; placeholder-free: section ships only when that copy
ships, else skipped in v1) → specs table → comparison (§4) → clearance diagram (§5) →
common uses → FAQ. Existing schema bindings (Product node, price, FAQPage) move with
their sections unchanged; the JSON-LD graph must remain semantically identical except
where sections themselves change.

## 3. Action block: two doors

Side-by-side (stacked on mobile):
- DOOR 1 "Have Doug call me": inline mini-form, exactly three fields (name, phone,
  email), no others. POST to the existing quote endpoint with `leadType: 'callback'`
  and `container: <this size>` preset. EMAIL-ONLY handling (the payment-intent
  precedent): no DB schema change; seller notification subject leads with
  "CALLBACK REQUESTED" and the phone number in the first line; buyer confirmation email
  states "we answer calls 9am to 9pm Eastern, every day" (matches GBP hours). If the DB
  insert path would reject the partial record, skip the insert for callback leads and
  rely on the email path + loud error logging (the submit-quote resilience pattern).
- DOOR 2 "Build my full quote" (final label may be tuned in copy): links
  `/quote/?container=<slug>&condition=wwt`; the quote form reads the params and
  preselects size + condition. Unknown/invalid params are ignored silently.
Response promise wording is Doug-confirmed (2026-08-25: answers all calls, gets emails
instantly). Both doors carry no other required fields.

## 4. Comparison presentation

Desktop (>=961px): keep the table, trimmed (condition language stated once above, not
per column; "Best for" row kept short). Mobile (<=960px): the same data renders as three
stacked cards (CSS-only restructure preferred; if the DOM must fork, one source array
drives both renderings so the data cannot diverge).

## 5. Delivery clearance diagram

Hand-authored inline SVG plate (the dimensions-post plate system: FIG. title block,
drafting dimension lines, mono text, currentColor/site tokens, title + aria-label,
zero dashes): truck + tilt-bed + container total length for THIS page's size, straight-line
approach, overhead clearance note. Numbers from existing verified site facts
(delivery guide); anything unverifiable is omitted rather than estimated. Placed in/near
the delivery section with a link to /delivery/ for the full guide.

## 6. FloatingSidebar ("Two ways to start") rollout

BaseLayout default flips to exclusion-list:
`const noSidebar = ['quote','tool','legal'];`
`const showFloatingSidebar = floatingSidebar ?? !noSidebar.includes(pageType);`
plus `floatingSidebar={false}` on `size/index.astro` (self-link) and any admin/404 page
whose pageType is not already excluded (verify each). FloatingSidebar.astro script fix:
attach open/close listeners BEFORE the hero check; when no `.hero/.uc-hero` exists, fall
back to starting hidden with a scroll-threshold reveal instead of returning early
(prevents the stuck-open panel on condition/cost/delivery/permits).

## 7. Photo dependency (shared with T-170)

The shot list (.outputs/content/2026-08-25-wear-photo-shot-list.md) gains hero-grade
shots: one clean 3/4 exterior per size (20ft, 40ft, 40ft HC), plus door-open interior.
Template ships text-complete in v1 with the photo slot rendering only when a real photo
exists for that size (no placeholder imagery, no AI product photos ever). v2 fills slots
as photos land.

## 8. Verification & rollout

- Full guard suite + vitest; every existing product-page guard must pass unmodified
  unless it asserts moved-section order (report any such change).
- JSON-LD: parse + diff the Product/FAQPage nodes pre/post reorder on all three pages.
- Playwright at 390/768/1280/2200: no overflow; action block usable at 390; comparison
  cards render on mobile, table on desktop; popup present on product/guide/city/blog
  samples, absent on quote/calculator/terms, NOT stuck-open on /cost/.
- Lead pipeline end-to-end: one real callback test submission (owner-triggered or
  orchestrator-triggered with owner watching), Doug confirms receipt; buyer confirmation
  email verified. This is the only test that leaves the machine; it is owner-visible.
- Ship: template + popup + quote changes in one release; live verification per the
  standing pattern.

## Non-goals

No pricing policy changes; no DB schema changes; no new dollar figures outside the
pricing module; no AI-generated product or customer imagery; no rental/financing claims;
the hub and city pages unchanged (except none needed); no changes to the existing quote
form's required fields for the full-quote path.
