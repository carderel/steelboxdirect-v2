# Checkpoint — nav fix + pricing display (both verified, uncommitted)

**Date:** 2026-07-09 03:04
**Trigger:** phase boundary + >3 todos since last checkpoint (tasks 18–21 + keyword recalibration + gov-docs)

## Done since 2026-07-08 17:15 checkpoint
- Keyword-tool recalibration → memory `keyword-data-trust-hierarchy.md` (SpyFu = map only; GKP/real-Ads primary).
- Task 18: NAV fix — 15px + dropdown nowrap; root cause = CSS specificity bug (nav.p a 1.1em overrode dropdown 11px). Verified desktop+mobile.
- Tasks 19/20/21: PRICING display restored (home + product hub + 3 spec pages), single source pricing.ts, avg + prominent disclaimer, city pages $-free (hard stop honored). Gov docs updated (CLAUDE.md, decision 2026-07-09-pricing-display-policy.md, memory). Verifier PASS-WITH-FIXES (date drift June→July fixed).

## Numbers of record (pricing.ts, asOf 2026-07-09)
20ft $2,010 · 40ft Standard $2,710 · 40ft HC $2,470 (HC<Standard confirmed real/supply-driven).

## Pre-existing findings surfaced (not from this work)
- Delivery-wording drift: "next-week"/"within days" copy vs locked "~two weeks" — recommend audit.
- Lead-capture popup overlaps price area (pre-existing) — FYI.

## State
Nothing pushed; last_commit 0c7d2c7. Uncommitted: nav CSS + pricing (5 files) + use-case asOfLabel + CLAUDE.md + audit files + pre-existing noise. Tasks 1–21 all complete/closed.

## Next (owner-gated)
Push decision (nav+pricing now vs bundle w/ blog images); dropdown 12–13px hierarchy tweak?; then commit+push scoped + verify live + PROJECT_STATE last_commit update.
