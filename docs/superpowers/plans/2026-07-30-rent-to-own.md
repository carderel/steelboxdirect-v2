# Rent-to-Own Page + Site Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/rent-to-own/` + quote-form payment-intent field + site-wide copy flip per `docs/superpowers/specs/2026-07-30-rent-to-own-page-design.md` (read it FIRST — its "Owner-locked decisions" and hedge wording are law).

**Architecture:** New prerendered page in the existing brutalist/decision-engine pattern; one new select on the quote form flowing through `submit-quote.ts` to seller + buyer emails; a grep-driven flip of every "no rent-to-own" statement in marketing copy. Branch `feat/rent-to-own` off `main` (30944ff). NO new SVG illustrations. NO changes to terms.astro/privacy.astro/city pages.

**Tech Stack:** Astro 4, existing `src/lib/schema/` buildPageSchema (Service + FAQPage), existing quote form + Resend email path.

## Global Constraints (every task)
- THE HEDGE, exact framings from the spec §5: long form on the page; short form "subject to third-party approval" at every sprinkle/label; "no **traditional** credit check" always (never bare "no credit check").
- Approved facts ONLY: 12/24/36/48 terms, no traditional credit check, Lifetime Leak Warranty applies, "about two weeks" delivery with the locked honest-window hedge. NO buyout language, NO down-payment/discount/instant-approval claims, NO dollar amounts on the page or in new FAQ copy.
- City pages untouched. terms/privacy untouched. FAQ arrays are schema-bound single sources — edit answers in place, never fork visible vs schema text.
- Verify per task: `npm run build` clean · `npx vitest run` 26/26 · Playwright 1280+390 on touched pages (no overflow) · grep built output for guardrails (see task steps) · scoped `git add` + commit with the branch's trailer lines.

---

### Task 0: Branch
- [ ] `git checkout main && git checkout -b feat/rent-to-own` (working tree carries known-dirty PROJECT_*.json — leave unstaged).

### Task 1: `/rent-to-own/` page
**Files:** Create `src/pages/rent-to-own/index.astro`. Read first: spec §"The page"; `src/pages/cost/index.astro` + `src/pages/delivery/index.astro` (the guide-page pattern: hero/§ eyebrow/spec-cards/dark stat sidebar/FAQ/CTA); `src/lib/schema/buildPageSchema.ts` (Service+FAQPage kinds and how pages pass `schema`); `src/data/homeFaq.ts` style for single-source FAQ arrays.
**Interfaces produced:** route `/rent-to-own/`; its FAQ array (in-file, single source → visible + FAQPage); CTA links `/quote/?pay=rto`.
- [ ] Build the 7 sections per spec §1–7 (hero; 4 how-it-works spec-cards with MCR named as independent administrator in step 2 and the third-party-approval hedge in step 4; 12/24/36/48 chip-cards — existing card patterns only, no new SVG; RTO vs buy vs self-storage comparison table, qualitative rows only; trust strip; FAQ incl. "Is approval guaranteed?" (answer: no — MCR's decision, independent of SBD) and "Who is My Container Rental?"; CTA → `/quote/?pay=rto`).
- [ ] Schema: Service (rent-to-own container program, areaServed like other Service pages, NO price/offers) + FAQPage from the same array. Title/meta: target "rent to own shipping container" + OH/IN/KY modifiers; H1 unique (no cannibalization of the hub).
- [ ] Verify: build; grep built page — zero `$` digits, zero "instant approval", zero bare "no credit check" (must always have "traditional"), hedge present ≥3 times; Playwright 1280+390. Commit `feat(rto): /rent-to-own/ decision-engine page`.

### Task 2: Quote form + API + emails
**Files:** Modify the quote form page (locate: `grep -rn "condition" src/pages/quote/` — the existing dropdown pattern), `src/pages/api/submit-quote.ts`. Read the self-pickup precedent in both (email-only field, no DB migration).
- [ ] Add required select "How do you want to pay?" — options exactly: `Buy outright` / `Rent-to-own, 12–48 months (subject to third-party approval)` / `Not sure yet`. Preselect RTO when `?pay=rto`.
- [ ] `submit-quote.ts`: pass field through; seller email gets a prominent `PAYMENT INTENT: RENT-TO-OWN` line for RTO leads; buyer confirmation for RTO includes the long-form hedge sentence verbatim from the spec. Non-RTO emails unchanged. No DB schema change.
- [ ] Verify: build; dev-server POST smoke test of the API path if the existing test approach allows (match how self-pickup was verified); Playwright the form at 390 (new select fits, validates). Commit `feat(rto): quote payment-intent field + email plumbing`.

### Task 3: Site-wide sprinkle + flip sweep
**Files:** `grep -rn -i "rent.to.own\|rent to own\|we don't rent\|only sell" src/` — flip or justify EVERY hit in the task report. Known targets: hub FAQ rent answer (`src/pages/shipping-containers-for-sale/index.astro` — rewrite to YES + link + short hedge), quote-page payment FAQ, homeowners/businesses rent-vs-own tables (add an RTO callout line linking the page), homepage price microcopy ("or rent to own — no traditional credit check" + link), SiteNav Containers dropdown + footer link, `public/llms.txt`.
- [ ] Apply flips; every mention carries the short hedge; city pages and terms/privacy get ZERO edits (grep-verify).
- [ ] Verify: build; grep built city pages unchanged vs main (`git diff main -- src/data/cities.ts src/pages/[citySlug].astro` empty); FAQPage nodes on hub still valid (one FAQ answer changed, count unchanged); Playwright hub+home 1280/390. Commit `feat(rto): site-wide rent-to-own mentions + FAQ flips`.

### Task 4: Owner deliverables (not shipped)
- [ ] Write `.outputs/legal/2026-07-30-terms-rto-draft.md`: proposed terms.astro language — RTO offered through the FC program administered by MCR; delivery contingent on MCR approval; payment terms per executed RTO agreement (supersedes paid-in-full for RTO deals); for owner/attorney review. Explicitly NOT wired into the site.
- [ ] Add the RTO blog post to the content queue note in the session log (AnswerSocrates rent-vs-own gap; beat mycontainerrental.com as citation incumbent).

### Task 5: Final review gate
- [ ] Independent reviewer subagent: whole-branch diff vs spec (hedge coverage, approved-facts-only, $-free page, city/terms untouched, schema valid, no bare "no credit check"), build+tests, verdict READY/NOT. Then owner demo + merge/push decision (owner may bundle the 51e7d72 cherry-pick).

## Self-review
Spec coverage: page(T1), form+checkbox-for-Doug(T2), sprinkle(T3), terms draft+blog queue(T4), gate(T5) — all spec sections mapped; PLATE 10 removed per owner. No placeholders; exact option strings and grep gates given. Types/routes consistent (`/rent-to-own/`, `?pay=rto`).
