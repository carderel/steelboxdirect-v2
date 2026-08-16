# Checkpoint — 2026-07-24 12:26 — Schema graph + Quick Facts: brainstorm + plan complete

**Phase boundary:** Design + planning done for the unified schema `@graph` + visible "Quick Facts" block feature. No product/source code changed yet — build not started.

## Branch / git
- Branch: `feat/schema-quickfacts` (off `main` @ `a53ccd9`).
- Commits this phase:
  - `4728f5a` — design spec (`docs/superpowers/specs/2026-07-24-schema-quickfacts-design.md`)
  - (plan commit) — implementation plan (`docs/superpowers/plans/2026-07-24-schema-quickfacts.md`)
- Working tree also carries the pre-existing uncommitted PROJECT_STATE.json + untracked analysis assets from prior sessions (not part of this feature).

## What was decided (owner, this session)
1. Visible block = **human-readable facts card** (not raw JSON), **leads with the page's main entity**, compact business identity (footer already carries full NAP/sameAs). Rationale: sandboxed AI agents read visible DOM text, not `<head>` JSON-LD — this surfaces the schema facts where they read.
2. **No AggregateRating/Review** (deferred; never fabricated). Each page focuses on its main schema entity.
3. Scope = **content/commercial pages only** (exclude quote/calculator/legal/admin/404).
4. Visual direction = **"B-v2 — Spec Sheet / Index Card"** (cream card, hard ink shadow, yellow header, spec grid, quiet business strip, FAQ `<dl>`).
5. Architecture = **single pure module** `src/lib/schema/` → `buildPageSchema()` returns `{ graph, quickFacts }`; `BaseLayout` emits one `@graph` + renders `<QuickFacts>`. Consolidates today's separate `<head>` scripts + 12 head-slot injections. No drift by construction.

## Correctness fixes baked into the plan
- City pages currently emit `Article` (wrong) and rewrite `LocalBusiness` address per city (misleading for a SAB with no yard) → plan gives cities a `Service` node with `areaServed`, keeps `LocalBusiness` canonical (Cincinnati).
- Use-case pages currently emit `Article` (wrong) → become `Service`.
- `/locations/` has a visible FAQ with **no** `FAQPage` schema → plan adds it.
- ai-seo skill guardrail honored: block is a genuine human summary (capped specs/FAQs), not an AI-bait fragment.

## Guardrails locked
City pages `$`-free (hard stop) · no fabricated ratings · avg-price + disclaimer only on home/product/use-case · real NAP/sameAs/parent only · WWT-only · no delivery-time promise.

## Next
- Execution mode chosen by owner (subagent-driven per UDO L002).
- 17 tasks, 4 phases (module → component/wiring → page migration → validation).
- Verifier runs Rich Results + Playwright + anti-drift + `$`-free city check. Do NOT deploy — owner controls push.

## Compliance
UDO: spec + plan committed; checkpoint written (this file); brainstorming task list #1-6 complete. Session log still required before session end. No hard-stop conflicts.
