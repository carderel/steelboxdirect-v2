# Decision: Delegation mode ruling (PROJECT_HS_002 vs harness default)

Date: 2026-08-07
Decided by: Eli Carder (owner)
Recorded by: orchestrator (Claude Opus 5, 1M context, Claude Code CLI)
Status: ACTIVE for this session
Tags: #udo-protocol #delegation #compliance

## Context

At session orientation on 2026-08-07 a direct conflict surfaced between two live rule sources:

1. **UDO project rules.** `UDO Project/HARD_STOPS.md` PROJECT_HS_002 requires that all specialized
   work (analysis, research, planning, writing, code) be delegated to subagents before execution
   begins. `UDO Framework/HARD_STOPS.md` HS-EXEC-001 restricts the orchestrator to coordination and
   the audit trail. `LESSONS_LEARNED.md` L002 records this as a prior owner correction dated
   2026-07-02: "Always subagent."
2. **Harness session configuration.** This session's Claude Code environment carried an instruction
   that the Agent tool must not be called unless the user requests it.

Both cannot hold at once. `CAPABILITIES.json` records `delegation.available: true`, so the
capability itself was never in question. The question was purely which rule governs.

## Decision

**PROJECT_HS_002 wins. Delegation is ACTIVE for this session.**

The owner selected "Delegate as UDO requires" and confirmed that this answer stands as the explicit
user request for agent use for the remainder of the session. That satisfies the harness condition
("unless the user requests it") rather than overriding it, so the two rules are reconciled, not
ranked.

## Rationale

- The harness instruction is conditional, not absolute. It gates agent use on a user request. The
  owner supplied that request, so the condition is met and no rule is being violated.
- PROJECT_HS_002 and HS-EXEC-001 are hard stops. A hard stop cannot be suspended by a harness
  default; it can only be suspended by the documented capability check (`delegation.available:
  false`), which does not apply here.
- L002 records that this exact question was already settled by owner correction on 2026-07-02.
  Re-deciding it the other way would contradict a logged lesson.

## Consequences

- The orchestrator performs zero execution work this session. Its only hands-on artifacts are
  coordination and the audit trail: session records, checkpoints, decisions, memory, PROJECT_STATE,
  CAPABILITIES.
- Every response must carry the PROJECT_HS_002 post-response verification line, naming real agents
  with specific evidence, or declaring meta-work.
- `PROJECT_HS_002 suspended` is NOT logged this session, because delegation is available and active.

## Scope limit

This ruling covers the 2026-08-07 session. If a future session opens under a harness that again
defaults to no-agents, the orchestrator raises the conflict again rather than assuming this ruling
carries forward, since the harness condition depends on a request from the user present in that
session.

## Related

- `UDO Project/HARD_STOPS.md` PROJECT_HS_002
- `UDO Framework/HARD_STOPS.md` HS-EXEC-001
- `UDO Project/LESSONS_LEARNED.md` L002
- `UDO Project/CAPABILITIES.json` delegation block
