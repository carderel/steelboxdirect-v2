# Design Spec — Rent-to-Own Page + Site Integration (2026-07-30)

**Context change (owner, 2026-07-30):** SBD now leans into rent-to-own. Ryan and Eli are working together on it (turf split resolved — Eli has Ryan's blessing; 1–2 backlinks expected from the VRTO/MCR ecosystem). The program is Freedom Conex's RTO, administered by **My Container Rental (MCR)** — a third party.

## Owner-locked decisions
0. **Build base: `main` (30944ff), fresh branch `feat/rent-to-own`.** The feat/graphics-plates branch is PARKED (owner: plate drawings below the visual bar; he'll produce graphics himself later). Optional: cherry-pick 51e7d72 (blog-image finals, not plates) to main — owner call, pending.
1. **Application flow: CONFIRMED SIMPLE.** Doug works RTO via a checkbox when he generates the quote — Freedom Conex does the rest. So the ONLY plumbing needed: the quote form asks pay-in-full vs rent-to-own and that intent reaches the seller email. No MCR portal wiring, no other integration.
2. **Approved facts (ONLY these may appear):** 12/24/36/48-month terms · no *traditional* credit check · Lifetime Leak Warranty applies to RTO units · delivery "about two weeks" (locked hedged wording). **Explicitly OFF the page** (unconfirmed through FC/SBD): 20% down, 90-day/33% early-payoff discounts, no-interest framing, "instant approval."
3. **Zero dollar amounts** on the RTO page.
4. **Copy flip = marketing only.** terms.astro + privacy.astro untouched; a terms-language draft is delivered to the owner separately (not shipped).
5. **THE HEDGE (owner-required, everywhere strategic):** delivery is contingent on **third-party approval by My Container Rental**. Harmonized wording so it never contradicts "no credit check": headline fact = "no *traditional* credit check"; hedge = "delivery is scheduled after your application is approved by My Container Rental, the independent third party that administers the program." Short form for sprinkles/labels: "subject to third-party approval."

## The page — `/rent-to-own/` (new, prerendered)
Decision-engine landing page in the site's educational-brutalist DNA (out-classes FC's thin 4-step page and MCR's generic site). Accent: pick an unused accent or reuse yellow; H1/eyebrow in the § motif.

1. **Hero** — "Rent to Own. No Traditional Credit Check." + lede: own a WWT container over 12/24/36/48 months through the Freedom Conex program; no $ figures.
2. **How it works** — 4 spec-cards: (1) Get your quote from SBD → (2) Apply through My Container Rental (independent program administrator; no traditional credit check; **approval is theirs**) → (3) Choose your term (12/24/36/48) → (4) **After third-party approval**, delivery in about two weeks (locked hedge: "we'll give you an honest window before you commit").
3. **Terms section** — 12/24/36/48 chip-cards using the existing card/stat-tile patterns only. **NO new plate-style SVG illustration** (owner ruled the 2026-07-28 plates below the site's visual bar and is redoing graphics himself; plates branch parked, do not merge).
4. **"Is rent-to-own right for you?"** — comparison table (site pattern): RTO vs buy outright vs monthly self-storage. Rows: ownership at end / upfront cost (qualitative only: "lowest to start" vs "one payment") / credit requirement / what happens if you stop / end state. $-free.
5. **Trust strip** — same WWT single grade, Lifetime Leak Warranty applies, Est. 2009, veteran-owned FC program, authorized-agent framing.
6. **FAQ** (visible + FAQPage in the @graph, single source array): rent-vs-rent-to-own difference; is approval guaranteed (NO — MCR's decision, independent of SBD); do payments build ownership; can I buy out early (ONLY if owner confirms buyout language — otherwise omit); condition of RTO units (same WWT); delivery timing (hedged); who is My Container Rental.
7. **CTA** — quote form, preselecting rent-to-own intent (`/quote/?intent=rto` or equivalent).

**Schema:** buildPageSchema Service kind (serviceType rent-to-own container program) + FAQPage; NO price fields. Quick Facts block renders per the standard content-page gating.

## Quote form + API
- New select **"How do you want to pay?"**: Buy outright / **Rent-to-own, 12–48 months (subject to third-party approval)** / Not sure yet. Optional preselect via query param.
- `submit-quote.ts`: field passes through to seller email (labeled prominently for RTO leads) + buyer confirmation. RTO buyer confirmation includes the hedge line verbatim. No DB schema change (email-only field like self-pickup precedent) unless trivially safe.

## The sprinkle (marketing flip — every touch carries the short hedge)
- **Hub FAQ** `/shipping-containers-for-sale/`: rewrite the 3-day-old "Can I rent…? → we don't offer rent-to-own" answer to YES-RTO + link + hedge. (Visible + FAQPage node update together — single source.)
- **Quote-page payment FAQ** + any payment FAQs stating "no rent-to-own": flip with hedge.
- **Homeowners + businesses** rent-vs-own tables: add an RTO column/row or a callout line linking `/rent-to-own/`.
- **Homepage** price-section microcopy: "or rent to own — no traditional credit check" + link.
- **Nav**: Containers dropdown + footer link. **llms.txt**: add the page.
- **City pages: UNTOUCHED** (hard stop territory; no $-adjacent or program claims there).
- Grep sweep for every "rent-to-own"/"rent to own"/"we don't rent" instance sitewide; each one flips or is justified in the task report.

## Deliver-to-owner (not shipped)
- **Terms.astro draft language** (separate .outputs doc): RTO offered through FC/MCR, approval contingency, program-administrator disclosure — for owner/attorney.
- **Blog post: QUEUED** ("down the road") — decision-engine post targeting the AnswerSocrates rent-vs-own gap; mycontainerrental.com is the AEO citation incumbent to beat.

## Guardrails (unchanged + new)
City pages $-free & untouched · no fabricated numbers/claims (only the 4 approved facts) · locked delivery wording ("about two weeks" + honest-window hedge, never a promise) · WWT-only · no "instant approval"/down-payment/discount claims · hedge present at page steps, FAQ, quote option, confirmation email, and every sprinkle · schema $-free on this page.

## Memory/strategy updates on completion
Supersede "RTO = Ryan's lane / SBD has no RTO" in memories; record the collaboration + expected backlinks; log decision in .project-catalog/decisions/.
