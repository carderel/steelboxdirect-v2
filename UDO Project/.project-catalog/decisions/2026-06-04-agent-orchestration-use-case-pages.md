# Decision — Agent Orchestration for Use-Case Pages Build

**Date:** 2026-06-04
**Mode:** Orchestration (The Architect)
**Status:** Decided

---

## Context

User directive: follow UDO, spawn agents, and do **no implementation work in the
orchestrator context window**. UDO Agent Creation Rule independently mandates agents
(multi-specialization build: Astro authoring + SEO/schema + verification).

## Findings

- `.agents/*.md` (astro-developer, seo-analyst, verifier, stuck) are UDO **persona
  definitions**, not Claude Code dispatchable subagent types.
- No `.claude/agents/` or `~/.claude/agents/` registry exists.
- Therefore subagents are dispatched via the `Agent` tool with `subagent_type:
  general-purpose`, injecting the relevant persona contract + extracted codebase
  patterns into each briefing.
- External agents (VoltAgent/awesome-agent-skills) reviewed and deemed **unnecessary** —
  existing project personas cover the work; avoids importing untrusted external
  instructions.

## Decision — Orchestration Topology

1. **Plan agent** (architect / writing-plans) → produces
   `docs/superpowers/plans/2026-06-04-use-case-pages.md` with complete per-page code.
   Orchestrator reviews. [satisfies astro-developer Input Contract: "plan with file
   paths and complete code"]
2. **Build agents** (astro-developer persona) → build the 4 pages. Farmers first as a
   canary (establish canonical off-template structure + confirm build), then
   contractors/homeowners/businesses in parallel (independent files, no conflict).
3. **Review agents** (seo-analyst + verifier) → schema validity, build passes, internal
   links, no dollar amounts, SEO/AI-visibility checks.

## Scope (this cycle)

Use-case pages ONLY. Nav placement + city expansion + reverse city→use-case cross-links
are DEFERRED per user sequencing (pages → nav → cities).

## Constraints carried to all agents

- No dollar amounts / pricing on any page (HS / project rule).
- Off-template, unique content per page (avoid duplicate-content penalty).
- Import path from `src/pages/for/<x>/index.astro` is `../../../layouts/BaseLayout.astro`.
- FAQPage JSON-LD via `<Fragment slot="head">` (pattern from `[citySlug].astro`).
- Reuse global classes (`.wrap`, `.btn`, `.btn-ghost`, `.m`, `.guide-product-cta`).
- Invoke `stuck` protocol if a build error persists past 2 attempts.

## Confidence

High — based on explicit user directive (Grade A) + UDO Agent Creation Rule.
