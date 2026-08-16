# Decision: Delegation mode ruling for the 2026-08-09/10 session

Date: 2026-08-10 (session opened 2026-08-09 23:25 local)
Decided by: Eli Carder (owner)
Recorded by: orchestrator (Claude Opus 5, 1M context, Claude Code CLI)
Status: ACTIVE for this session
Tags: #udo-protocol #delegation #compliance

## Context

The 2026-08-07 delegation ruling
(`.project-catalog/decisions/2026-08-07-delegation-mode-ruling.md`) explicitly scoped itself to that
session and instructed the orchestrator to re-raise the conflict in any future session opening under a
harness that again defaults to no agent use. This session opened under exactly that default, so the
question was re-asked at orientation rather than assumed to carry forward.

The conflict is unchanged:

1. `UDO Project/HARD_STOPS.md` PROJECT_HS_002 requires specialized work to be delegated before
   execution begins. `UDO Framework/HARD_STOPS.md` HS-EXEC-001 restricts the orchestrator to
   coordination and the audit trail. `LESSONS_LEARNED.md` L002 records this as an owner correction
   dated 2026-07-02.
2. The harness session configuration again carried an instruction that the Agent tool must not be
   called unless the user requests it.

`CAPABILITIES.json` reports `delegation.available: true`, so capability was never the question.

## Decision

**PROJECT_HS_002 wins. Delegation is ACTIVE for this session.**

The owner selected "Delegate as UDO requires" at orientation. That answer is the explicit user request
the harness condition asks for, so the harness instruction is satisfied rather than overridden and the
two rules are reconciled, not ranked. Identical outcome and identical reasoning to 2026-08-07.

## Consequences

- The orchestrator performs zero execution work. Its only hands-on artifacts are coordination and the
  audit trail: session records, checkpoints, decisions, memory, PROJECT_STATE, TOPICS.
- Every response carries the PROJECT_HS_002 post-response verification line, naming real agents with
  specific evidence, or declaring meta-work.
- `PROJECT_HS_002 suspended` is NOT logged this session.

## Scope limit and a standing recommendation

This ruling again covers one session only, for the same reason: the harness condition depends on a
request from the user present in that session.

Recommendation for the owner, raised because this is now the second consecutive session spending an
orientation question on it: this reconciliation has produced the same answer twice, from two different
models (Claude Fable 5 on 2026-08-07, Claude Opus 5 here). If that is stable, the durable fix is to
record the standing request at the harness level (a project `CLAUDE.md` line, or a `.claude/settings.json`
entry) so the condition is pre-satisfied and orientation stops re-litigating a settled question. Until
that exists, the re-raise stays mandatory.

## Related

- `.project-catalog/decisions/2026-08-07-delegation-mode-ruling.md` (the prior, identical ruling)
- `UDO Project/HARD_STOPS.md` PROJECT_HS_002
- `UDO Framework/HARD_STOPS.md` HS-EXEC-001
- `UDO Project/LESSONS_LEARNED.md` L002
- `UDO Project/CAPABILITIES.json` delegation block
