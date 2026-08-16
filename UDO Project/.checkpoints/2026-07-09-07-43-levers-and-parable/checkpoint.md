# Checkpoint — delivery-included levers (x4) + new parable

**Date:** 2026-07-09 07:43
**Trigger:** phase boundary + >3 todos since 03:04 checkpoint (tasks 22-24)

## Done since 03:04
- Task 22: NEW parable `src/content/blog/the-cheap-container-that-wasnt.md` (White Parable / Field Stories, draft:true, batch-2, HELD) from today's real call (buyer's ~$800-900 quote that excluded shipping; "did that include shipping?...No..." beat). Illustrative/composite, Facts box, routes to /quote/, no SBD prices. + social pack + agent-md. FK 4.7.
- Tasks 23/24: 4 "price includes delivery" LEVER placements (owner approved all 4), built + verified PASS:
  1. submit-quote.ts buyer email — "the price we send is all-in… no surprise freight."
  2. cost/index.astro — revived buyer-education block ("The One Question That Protects You"), illustrative $900→$1,600 third-party example (clearly NOT SBD pricing), routes to /quote/.
  3. container-buying-guide/index.astro — checklist item 07 + recap row + FAQ "Does the container price include delivery?" (visible + FAQPage schema in sync).
  4. PriceSection.astro — "Sticker prices elsewhere rarely include delivery. Ours do."
  Verifier PASS: build clean, city pages $-free, no delivery-TIME promise, only illustrative $ on cost page, WWT intact.

## Answer to owner's question ("do we note the emailed price includes shipping?")
YES — all-in is messaged heavily site-wide already; gaps were the confirmation EMAIL (now fixed) + the shelved cost-page education lever (now live).

## UNCOMMITTED working tree — full deployable stack (nothing pushed; last_commit 0c7d2c7)
Product code: BaseLayout.astro (nav 15px+dropdown), pricing.ts + PriceSection + shipping-containers-for-sale/index + [slug] + for/homeowners + for/businesses (pricing), submit-quote.ts + cost/index + container-buying-guide (levers). Content: the-cheap-container-that-wasnt.md (draft:true — won't render in prod). Governance: CLAUDE.md. + audit files. + pre-existing untracked noise.
ALL verified. Blog draft is draft:true so safe to commit (excluded from build).

## Pending owner decisions
- PUSH timing: deployable stack (nav + pricing + levers) now, or bundle with blog final images?
- Dropdown sub-items 12-13px hierarchy tweak?
- Parable batch-2: ride along whenever, or hold until it has a video script + contractor story de-FPO?
- Delivery-wording drift audit ("next-week"/"within days" vs locked "~two weeks") — owner call.

## Next
On owner push call: stage explicit paths (exclude noise), commit, push, verify live, update PROJECT_STATE last_commit.
