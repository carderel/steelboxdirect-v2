# Checkpoint — nav + pricing + levers DEPLOYED & live-verified

**Date:** 2026-07-09 09:56
**Trigger:** production push + phase boundary

## Deployed
`0c7d2c7 → 6c1128e` on main → Cloudflare. Commit: "feat(nav+pricing): trim nav sizing, restore average prices, add delivery-included levers."

Contents: nav (links 15px, dropdowns 12px via specificity fix), pricing restored (homepage + hub + 3 spec pages, avgs from pricing.ts, disclaimer), 4 delivery-included levers, delivery-wording fixed to "about two weeks", CLAUDE.md pricing policy. 12-file scoped stage.

## Live verification (Playwright, prod) — ALL PASS
- Homepage prices $2,010/$2,710/$2,470 render (one node, 80px) + disclaimer + "sticker prices elsewhere" microcopy + "about two weeks".
- Nav: trigger 15px, dropdown labels 12px, single-line.
- Cost education block + illustrative $900→$1,600 (labeled not-SBD).
- Buying-guide "Does the price include delivery?" FAQ visible + JSON-LD.
- HARD STOP: all 4 city pages 0 dollar amounts.
- Mobile 390 no overflow.

## Tasks 1–27 all complete/closed.

## Held / not deployed
Parable `the-cheap-container-that-wasnt.md` (draft, batch 2) — uncommitted in working tree.

## Pre-existing follow-ups (flagged, not shipped)
- Mobile dropdown items 18px (should be 14px) — same specificity collision, dead rule; one-line mirror fix later.
- Lead-capture "Two ways to start" popup overlaps price area.
- "As-Is" wording on live /condition/ (owner call).

## State
last_commit 6c1128e. Working tree: held parable draft + pre-existing untracked noise + local audit files. No pending product code.

## Next (owner-driven)
Blog final images → next push (swap + de-generic alt). Batch-2 blog finalize (de-FPO + video scripts). Authority-hub gates (SpyFu map + GKP + VRTO). Supabase restore. Facebook page. Optional mobile-dropdown mirror fix.
