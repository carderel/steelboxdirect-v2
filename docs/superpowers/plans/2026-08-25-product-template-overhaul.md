# Product Page Template Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the shared product page template around above-the-fold buyer confidence, a two-door action block (Doug callback mini-form + preselected full quote), mobile comparison cards, an on-page clearance diagram, and roll the "Two ways to start" popup out site-wide.

**Architecture:** All three product pages render from `src/pages/shipping-containers-for-sale/[slug].astro` + `src/data/containers.ts`, so every template change is one file. The callback lead reuses the existing `/api/submit-quote` endpoint with a `leadType: 'callback'` branch (email-only, no DB write, the payment-intent precedent). The popup rollout is a BaseLayout default flip plus a FloatingSidebar script fix.

**Tech Stack:** Astro 4 (hybrid, Cloudflare adapter), TypeScript, vitest, Playwright MCP for visual verification. Guards run inside `npm run build`.

**Spec:** `docs/superpowers/specs/2026-08-25-product-template-overhaul-design.md`

## Global Constraints

- ZERO em dashes and ZERO en dashes in anything written (the dash guard fails the build).
- NO hand-typed dollar figures anywhere; every price renders through `src/data/pricing.ts` (`priceBySlug`, `formatPrice`, `nationalPriceLabel`, `asOfLabel`).
- Never name My Container Rental or Freedom Conex in page copy.
- WWT is never described as shipping-certified. No delivery timeframes. Service area claim: "Ohio, Indiana, Kentucky + western West Virginia".
- The 4-business-hours claim and "Lifetime Leak Warranty" are the only response/warranty claims allowed.
- No AI-generated product imagery; photo slots render ONLY when a real photo exists.
- No DB schema changes. No new required fields on the full quote form.
- "My Container Rental" count in dist/rent-to-own/index.html must stay 6 (regression tripwire).
- Commit after each task with the exact messages given (Co-Authored-By trailer per repo convention).

---

### Task 1: FloatingSidebar site-wide rollout

**Files:**
- Modify: `src/layouts/BaseLayout.astro:49` (the `showFloatingSidebar` line)
- Modify: `src/components/FloatingSidebar.astro:33-71` (the inline script)
- Modify: `src/pages/size/index.astro` (add `floatingSidebar={false}` to its BaseLayout tag)

**Interfaces:**
- Consumes: `pageType` prop values already passed by every page. Before editing, run `grep -rh 'pageType="' src/pages/ | sort | uniq -c` and confirm the pages to exclude (quote, size/calculator, privacy, terms, ai-info, admin/*, 404) all carry pageType values in the exclusion list; any that do not get an explicit `floatingSidebar={false}` instead.
- Produces: popup renders on every page except exclusions; no page can show a stuck-open panel.

- [ ] **Step 1: Flip the BaseLayout default.** Replace line 49:

```astro
const noSidebarPageTypes = ['quote', 'tool', 'legal'];
const showFloatingSidebar = floatingSidebar ?? !noSidebarPageTypes.includes(pageType);
```

If the grep in Interfaces shows 404/admin/ai-info NOT covered by those pageType values, add `floatingSidebar={false}` to those pages' BaseLayout tags rather than growing the list blindly. Add `floatingSidebar={false}` to `src/pages/size/index.astro` (it is pageType="guide" and is the popup's own CTA target).

- [ ] **Step 2: Fix the hero dependency in FloatingSidebar.astro.** Restructure the script so listeners attach before the hero check and hero-less pages get a scroll fallback:

```js
(function(){
  const sbf = document.getElementById('sbf');
  const handle = document.getElementById('sbf-open');
  const closeBtn = document.getElementById('sbf-close');
  if (!sbf || !handle || !closeBtn) return;

  let dismissed = false;
  closeBtn.addEventListener('click', () => {
    dismissed = true;
    sbf.classList.add('is-hidden');
    handle.classList.add('is-visible');
  });
  handle.addEventListener('click', () => {
    dismissed = false;
    sbf.classList.remove('is-hidden');
    handle.classList.remove('is-visible');
  });

  sbf.classList.add('is-hidden');
  const hero = document.querySelector('.hero, .uc-hero');
  if (hero) {
    const observer = new IntersectionObserver((entries) => {
      if (dismissed) return;
      entries.forEach((entry) => {
        if (!entry.isIntersecting) sbf.classList.remove('is-hidden');
        else sbf.classList.add('is-hidden');
      });
    }, { threshold: 0.35 });
    observer.observe(hero);
  } else {
    // No hero on this page: reveal after the reader scrolls one viewport.
    const onScroll = () => {
      if (dismissed) return;
      if (window.scrollY > window.innerHeight) sbf.classList.remove('is-hidden');
      else sbf.classList.add('is-hidden');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();
```

- [ ] **Step 3: Build and verify presence/absence.**

Run: `npm run build` (exit 0), then:
`grep -l 'Two ways to start' dist -r --include=index.html | wc -l` Expected: roughly 50+ (was 5).
`grep -c 'Two ways to start' dist/quote/index.html dist/terms/index.html dist/size/calculator/index.html dist/size/index.html` Expected: 0 on each.
`grep -c 'Two ways to start' dist/shipping-containers-for-sale/20-foot-shipping-container/index.html dist/cost/index.html dist/blog/index.html` Expected: 1 on each.

- [ ] **Step 4: Playwright the stuck-open case.** Serve dist, load /cost/ (no hero) at 1280: on load the panel must be hidden; after scrolling past one viewport it appears; close button hides it. Load /quote/: no panel in DOM.

- [ ] **Step 5: Run vitest.** `npx vitest run` Expected: all pass (no test asserts the old default; if one does, update it with a comment naming this rollout and report).

- [ ] **Step 6: Commit.**

```bash
git add src/layouts/BaseLayout.astro src/components/FloatingSidebar.astro src/pages/size/index.astro
git commit -m "feat(ux): roll the two-ways-to-start popup out site-wide

Default flips from home-only to an exclusion list (quote, tool, legal
pageTypes; /size/ opts out as the popup's own CTA target). The script
no longer bails on hero-less pages, which would have rendered the
panel stuck open with a dead close button on cost, condition,
delivery, and permits; those pages get a scroll-threshold reveal."
```

---

### Task 2: Callback lead branch in the quote endpoint

**Files:**
- Modify: `src/pages/api/submit-quote.ts` (the `required` list block near line 239, the seller/buyer email builders near lines 155-222, and the DB-save step)

**Interfaces:**
- Consumes: existing `QuoteFormData` type, `sendSellerNotification`, buyer confirmation sender, `getClients`.
- Produces: the endpoint accepts `{ leadType: 'callback', name, phone, email, size_preference? }` and returns the same success JSON shape (`sellerNotified`, `buyerConfirmed`, `dbSaved: false`). The Task 3 form POSTs exactly this payload.

- [ ] **Step 1: Add the type field.** Extend the data interface with `leadType?: string;`.

- [ ] **Step 2: Branch the required list.** Where the `required` array is checked:

```ts
const isCallback = data.leadType === 'callback';
const required = isCallback
  ? ['name', 'email', 'phone']
  : ['name', 'email', 'phone', 'size_preference', 'condition_preference',
     'primary_use', 'delivery_zip', 'site_access', 'timeline'];
```

- [ ] **Step 3: Skip the DB insert for callbacks.** Wrap the Supabase insert in `if (!isCallback) { ... }` so `dbSaved` stays false for callbacks (no schema change; the email path is the record). Lead scoring and ZIP distance also skip for callbacks (no ZIP collected): guard those calls with `isCallback ? null : ...` equivalents so nothing throws on missing fields.

- [ ] **Step 4: Seller email for callbacks.** In the seller notification builder, when `isCallback`, the subject becomes:

```ts
`CALLBACK REQUESTED - ${data.name} - ${data.phone}${data.size_preference ? ' - ' + data.size_preference : ''}`
```

and the body's first line is the phone number with "Wants a phone call. Answers 9am-9pm ET daily was promised." plus name, email, and the size if present. Keep the no-PII-in-logs rule (HS-DATA-001): log only "callback lead received".

- [ ] **Step 5: Buyer confirmation for callbacks.** Subject: `We got your callback request`. Body states: we received your request, we answer calls 9am to 9pm Eastern every day, and if a call is missed we follow up by email. No delivery promises, no pricing.

- [ ] **Step 6: Verify by local invocation.** `npm run build` must pass. Then verify the branch logic by reading the diff (the live E2E test happens post-deploy with the owner watching, per spec §8; note this in the task report). Run `npx vitest run` (no endpoint unit tests exist; all existing tests must stay green).

- [ ] **Step 7: Commit.**

```bash
git add src/pages/api/submit-quote.ts
git commit -m "feat(leads): accept callback leads on the quote endpoint

leadType callback requires only name, phone, and email; skips the DB
insert (email-only, the payment-intent precedent) and scoring; seller
subject leads with CALLBACK REQUESTED and the phone number; buyer
confirmation states the 9am-9pm ET daily answering window."
```

---

### Task 3: The two-door action block

**Files:**
- Create: `src/components/CallbackForm.astro`
- Modify: `src/pages/shipping-containers-for-sale/[slug].astro` (insert the action block section after the pricing section)

**Interfaces:**
- Consumes: Task 2's endpoint contract; `c.slug` and `c.shortName` from the template; the quote form's existing `?size=` param map (`20ft`, `40ft`, `40ft_hc`).
- Produces: `<CallbackForm sizeLabel={c.shortName} sizeParam={...} />` used by the template. Size param mapping: `20-foot-shipping-container -> 20ft`, `40-foot-shipping-container -> 40ft`, `40-foot-high-cube-container -> 40ft_hc` (derive from slug in the template, pass as prop).

- [ ] **Step 1: Build CallbackForm.astro.** Props: `sizeLabel: string`, `sizePreference: string` (the quote-form select value). Markup: a two-door grid; Door 1 is the form (three inputs: name text required, phone tel required, email email required; button "Have Doug call me"); Door 2 is `<a class="btn" href={'/quote/?size=' + sizePreference}>Build my full quote</a>` with a one-line sub-caption "Every detail, one form, quote back within 4 business hours." Door 1 sub-caption: "We answer calls 9am to 9pm ET, every day." Inline script:

```js
const form = document.getElementById('cb-form');
const ok = document.getElementById('cb-success');
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = form.querySelector('button');
  btn.disabled = true; btn.textContent = 'Sending...';
  const fd = new FormData(form);
  const payload = {
    leadType: 'callback',
    name: fd.get('cb_name'),
    phone: fd.get('cb_phone'),
    email: fd.get('cb_email'),
    size_preference: form.dataset.size,
  };
  try {
    const res = await fetch('/api/submit-quote', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('bad status');
    form.hidden = true; ok.hidden = false;
  } catch {
    btn.disabled = false; btn.textContent = 'Have Doug call me';
    document.getElementById('cb-error').hidden = false;
  }
});
```

Success message: "Got it. Expect a call between 9am and 9pm Eastern." Error message: "That did not go through. Call us at (513) 546-2543 or use the full quote form." Styles: scoped, house tokens (ink borders, yellow primary button, mono microcopy), stacked at <=720px.

- [ ] **Step 2: Insert into the template.** In `[slug].astro`, directly after the `prod-pricing` section closes, add `<section class="prod-action">` wrapping `<CallbackForm sizeLabel={c.shortName} sizePreference={sizeParamFor(c.slug)} />` with the slug-to-param map defined in frontmatter. Also change the hero CTA link (line ~62) from `/quote/` to `{'/quote/?size=' + sizeParam}` so the top button preselects too.

- [ ] **Step 3: Build + dist checks.** `npm run build` exit 0. Greps on all three product dist pages: `Have Doug call me` = 1 each; `quote/?size=20ft` on the 20ft page, `quote/?size=40ft_hc` on the HC page; zero em/en dashes (separate greps); no dollar sign added by this section (page-level $ count unchanged from the price module baseline; record before/after).

- [ ] **Step 4: Playwright at 390 and 1280.** The two doors render side by side at 1280, stacked at 390, no overflow. Fill the form with test values but DO NOT submit (the E2E submission is the owner-visible post-deploy test).

- [ ] **Step 5: vitest.** All green; product-page guards untouched.

- [ ] **Step 6: Commit.**

```bash
git add src/components/CallbackForm.astro "src/pages/shipping-containers-for-sale/[slug].astro"
git commit -m "feat(product): two-door action block, Doug callback or preselected quote

Door one posts a three-field callback lead (email-only pipeline);
door two and the hero CTA carry the size into the quote form's
existing ?size= preselection."
```

---

### Task 4: Above-the-fold confidence strip + section reorder + photo slot

**Files:**
- Modify: `src/data/containers.ts` (add optional `heroPhoto?: { src: string; alt: string }` to the Container type; set on no container yet)
- Modify: `src/pages/shipping-containers-for-sale/[slug].astro` (hero + section order)

**Interfaces:**
- Consumes: `priceBySlug[c.slug].price`, `formatPrice`, `nationalPriceLabel`, `asOfLabel` (already imported); `c.keySpecs`, `c.tagline`.
- Produces: the section order Task 5 and Task 6 assume: prod-hero (with strip) -> prod-pricing -> prod-action -> prod-specs -> prod-compare -> prod-clearance (Task 6 adds) -> prod-uses -> prod-guides -> cta-section.

- [ ] **Step 1: Add the confidence strip to the hero.** After the `.lede` paragraph in the hero section, insert:

```astro
<ul class="conf-strip" aria-label="Why buyers trust this container">
  {price && (
    <li><strong>{formatPrice(price.price)}</strong> {nationalPriceLabel.toLowerCase()}. Not a quote; yours may be more or less. ({asOfLabel})</li>
  )}
  <li><strong>Wind &amp; Water Tight (used).</strong> Honest cosmetic wear. <a href="/condition/">What that means</a></li>
  <li><strong>Lifetime Leak Warranty</strong> on every container</li>
  <li>Delivered across <strong>Ohio, Indiana, Kentucky + western West Virginia</strong></li>
  <li>Quotes answered within <strong>4 business hours</strong></li>
</ul>
```

Verify the exact `nationalPriceLabel` and `asOfLabel` render sensibly in that sentence by checking dist; adjust ONLY the joining words, never the data values. Styles: mono, chip-row on desktop, stacked list on mobile, ink checkmark markers. The /condition/ link swaps to the wear guide when T-170 ships (leave a source comment saying so).

- [ ] **Step 2: Photo slot.** In the hero, before the strip:

```astro
{c.heroPhoto && (
  <figure class="prod-photo">
    <Image src={c.heroPhoto.src} alt={c.heroPhoto.alt} width={1400} format="webp" />
  </figure>
)}
```

Import `Image` from astro:assets only if the import pattern used elsewhere (farmers page) applies to public-path strings; if `heroPhoto.src` will be an imported asset, type it as `ImageMetadata` instead and note it in the report. No container gets a photo in this task (slots stay empty until real photos land).

- [ ] **Step 3: Reorder sections.** Move the `prod-pricing` section block (lines ~147-163 pre-edit) to directly after the hero, before `prod-specs`. Order after edit: hero, pricing, action (Task 3), specs, compare, uses, guides, cta. Do not alter any section's inner content in this step; pure move. The Quick Facts block renders via BaseLayout (schema-driven) and is untouched.

- [ ] **Step 4: Build + JSON-LD diff.** `npm run build`. For each of the three product pages: extract the JSON-LD block pre-move (from git stash or the previous dist copy) and post-move, parse both with python3 json.loads, and assert the Product node (name, offers, price) is identical. Dist greps: the strip renders all five items on each product page; the price line shows a $ figure WITH "Not a quote" adjacent; zero em/en dashes.

- [ ] **Step 5: Playwright at 390/1280.** Strip legible at 390 (no truncation), hero not pushed below the fold by the empty photo slot (slot renders nothing when heroPhoto is unset).

- [ ] **Step 6: vitest + commit.**

```bash
git add src/data/containers.ts "src/pages/shipping-containers-for-sale/[slug].astro"
git commit -m "feat(product): above-the-fold confidence strip, price-first order

Five sourced claims in the hero (feed price with disclaimer, WWT with
honest wear, Lifetime Leak, the named service area, 4-business-hour
quotes); pricing moves above specs; an empty real-photo slot renders
nothing until a real photo exists."
```

---

### Task 5: Comparison cards on mobile, one data source

**Files:**
- Modify: `src/pages/shipping-containers-for-sale/[slug].astro` (the prod-compare section, lines ~90-131 pre-reorder)

**Interfaces:**
- Consumes: `containers` array and `others` from frontmatter.
- Produces: one `compareRows` array in frontmatter that BOTH the desktop table and mobile cards map over. Shape: `{ label: string; values: Record<slug, string> }[]`.

- [ ] **Step 1: Lift the comparison data.** Read the current table markup and transcribe its rows into a frontmatter `compareRows` array (labels: the current row labels minus any per-column repeated condition text; keep "Best for" short). All three containers' cells, not just `others`.

- [ ] **Step 2: Render twice from the one array.** Desktop: the existing table style, `class="compare-table"` inside a `div.compare-desktop`. Mobile: `div.compare-cards` with one card per container (current page's container first, marked "This page"), each card listing label/value pairs. CSS: `.compare-cards { display:none }` above 960px, `.compare-desktop { display:none }` at 960px and below. No content forks: both render from `compareRows`.

- [ ] **Step 3: Build + verify.** Dist: both renderings present in HTML on all three pages; row labels appear exactly twice per page (once per rendering); no em/en dashes. Playwright: at 390 the cards render and the page has no horizontal scroll; at 1280 the table renders.

- [ ] **Step 4: vitest + commit.**

```bash
git add "src/pages/shipping-containers-for-sale/[slug].astro"
git commit -m "feat(product): comparison renders as cards on mobile

One compareRows array drives the desktop table and the mobile cards
so the two presentations cannot diverge; condition boilerplate stated
once above the comparison instead of per column."
```

---

### Task 6: Delivery clearance SVG plate

**Files:**
- Modify: `src/pages/shipping-containers-for-sale/[slug].astro` (new `prod-clearance` section between compare and uses)

**Interfaces:**
- Consumes: `c.specs.externalDims` (parse the length), verified delivery facts read from `src/pages/delivery/index.astro` BEFORE drawing (truck/tilt-bed length and straight-line clearance guidance; use ONLY numbers that page already publishes; omit anything it does not).
- Produces: an inline SVG plate per page sized to that container.

- [ ] **Step 1: Read /delivery/ and extract the published clearance facts.** Record in the task report exactly which numbers the page publishes (e.g. total rig length, overhead clearance). If /delivery/ publishes no numeric clearance for a fact, that fact is OMITTED from the diagram (spec: omit rather than estimate).

- [ ] **Step 2: Draw the plate.** House plate grammar (match the dimensions-post plates): FIG. title block ("FIG. D1 DELIVERY CLEARANCE, {c.shortName}"), side profile of truck + tilt-bed + container (corrugation rhythm, corner castings), a dimension line for the container length ({from c.specs}) and one for the total approach length if /delivery/ publishes it, mono text in chips, currentColor/site tokens, `<title>` + `aria-label`, viewBox + width:100%, text >= 13px at 460 viewBox scale. Zero dashes in SVG text. Caption links /delivery/ for the full guide.

- [ ] **Step 3: Build + verify.** Dist: one `FIG. D1` per product page with the right size in the title; SVG parses (well-formed XML); numbers match the sources named in Step 1 (list them in the report). Playwright 390/1280/2200: no overflow.

- [ ] **Step 4: vitest + commit.**

```bash
git add "src/pages/shipping-containers-for-sale/[slug].astro"
git commit -m "feat(product): on-page delivery clearance plate per size

Hand-drawn SVG in the house plate grammar showing the rig and this
container's length with only figures the delivery guide already
publishes; nothing estimated."
```

---

### Task 7: Full verification, ship, and the owner-visible lead test

**Files:** none (verification + release)

- [ ] **Step 1: Full suite.** `npm run build` (exit 0, 62 routes), `npx vitest run` (all pass), MCR grep on dist/rent-to-own = 6.
- [ ] **Step 2: Independent verifier subagent** re-measures: section order on all three pages, JSON-LD Product nodes intact, confidence strip claims match their sources (price from feed, no invented claims), callback payload contract matches the endpoint branch, popup presence/absence matrix, comparison dual-render, plate numbers vs /delivery/, dash and dollar sweeps, Playwright 390/768/1280/2200.
- [ ] **Step 3: Ship.** Push (auto-deploys). Live-verify the three product pages + popup on two sample pages.
- [ ] **Step 4: The owner-visible E2E lead test.** With the owner watching: submit one callback lead with his own contact details from the live 20ft page; confirm the seller email arrives flagged CALLBACK REQUESTED and the buyer confirmation arrives; owner confirms with Doug. Only then mark T-171's pipeline leg done. If the test fails, the action block's Door 1 gets feature-flagged off (hide the form, keep Door 2) within the hour.

---

## Self-Review

- Spec coverage: §1 Task 4; §2 Tasks 4+3; §3 Tasks 2+3; §4 Task 5; §5 Task 6; §6 Task 1; §7 Task 4 Step 2 (slots) + shot-list note lives in T-170; §8 Task 7. Wear mini-block (spec §2) intentionally deferred to the T-170 ship per spec ("skipped in v1"); noted here so it is not read as a gap.
- Placeholders: none; all code inline.
- Type consistency: `sizePreference` prop = quote form's `size_preference` select values (`20ft`, `40ft`, `40ft_hc`); endpoint field `leadType` used identically in Tasks 2 and 3; `compareRows` defined and consumed only in Task 5.
