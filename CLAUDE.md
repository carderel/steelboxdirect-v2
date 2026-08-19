# Steel Box Direct — Claude Code Rules

You are operating under the Universal Dynamic Orchestrator (UDO) protocol.
Read ORCHESTRATOR.md, HARD_STOPS.md, REASONING_CONTRACT.md, and PROJECT_STATE.json before doing anything.

---

## NON-NEGOTIABLE SESSION RULES

These apply regardless of what the user asks. No exceptions.

### Session Log (ABSOLUTE)
- Create a session log at `.project-catalog/sessions/YYYY-MM-DD-session-log.md` before the session ends.
- If no session log exists at end of session → HALT and write it.

### Checkpoints (ABSOLUTE)
- Create a checkpoint at `.checkpoints/YYYY-MM-DD-HH-MM-[label]/checkpoint.md` every 3 completed todos.
- Create one at every logical phase boundary and before session end.
- Use TaskCreate to track todos so you never lose count.

### Memory (ABSOLUTE)
- Update `.claude/projects/.../memory/pending-work.md` whenever the task list changes.
- Write new feedback memories when the user corrects your approach.

---

## HARD STOPS (inline — full list in HARD_STOPS.md)

- NEVER commit secrets, API keys, or credentials
- NEVER hand-type a dollar amount on a city page. City pages may show a price ONLY when it is
  interpolated from the pricing module, scoped to a named ZIP, and shown with its effective date
  and disclaimer (policy changed 2026-08-17, see quick facts below)
- NEVER end a session without a session log
- NEVER proceed past 5 todos without a checkpoint
- NEVER ignore a UDO circuit breaker

---

## PROJECT QUICK FACTS

- Stack: Astro 4, TypeScript, Cloudflare Pages (`output: 'hybrid'`)
- Dev server: `npm run dev` → localhost:4321
- Build: `npm run build`
- Deploy: `git push` → triggers Cloudflare Pages auto-deploy
- All dynamic routes need `export const prerender = true`
- Pricing policy (updated 2026-08-17): average prices ALLOWED on homepage, product/size pages, use-case pages, and NOW CITY PAGES. All must be sourced from `src/data/pricing.ts` (never hardcoded) and shown with the "average starting price, your quote may be more or less" disclaimer. **City pages additionally require** a named ZIP, the `effectiveSince` date, and the population-centroid basis. The old city-page hard stop is SUPERSEDED: its original reason was staleness, and a daily-verified feed cures staleness. Rationale + scope: `.project-catalog/decisions/2026-08-17-city-page-pricing-override.md`, which supersedes the city clause in `.project-catalog/decisions/2026-07-09-pricing-display-policy.md`
- Agents: `.agents/astro-developer.md`, `.agents/seo-analyst.md`, `.agents/verifier.md`, `.agents/stuck.md`
- Session logs: `.project-catalog/sessions/`
- Checkpoints: `.checkpoints/`
- Working memory: `.memory/working/`
