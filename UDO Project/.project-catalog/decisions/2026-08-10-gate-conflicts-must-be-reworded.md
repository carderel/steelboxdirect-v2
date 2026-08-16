# Decision: A gate conflict in live copy is never left standing, it is reworded or caveated

Date: 2026-08-10
Decided by: Eli Carder (owner)
Recorded by: orchestrator (Claude Opus 5, 1M context, Claude Code CLI)
Status: ACTIVE, and stated in general terms rather than scoped to one page
Topic slug: container-shelter (found here, but the ruling is not limited to it)
Tags: #permits #compliance #content-policy #gates

## The owner's direction, verbatim in substance

Avoid any conflicts with already established gates. If copy violates the forbidden gates, it needs to be
reworded or given a caveat.

## What prompted it

The T-015 publish gates (see `2026-08-10-t015-container-shelter-approve-narrow.md`) were authored to
forbid, among other things, asserting a permit or classification outcome in either direction. A drafting
agent then noticed, incidentally, that `src/pages/for/farmers/index.astro` already violates those gates:

- Line 122 asserts the container "stays classified as personal property" and avoids "a permanent-structure
  review or a reassessment of your land." This is a tax and assessment claim as well as a permit claim.
- Line 166, the comparison table's Ownership row, repeats it as "stays personal property and resells,"
  rendering within a few inches of the paragraph the T-015 edit was about to change.

So the new rule and the live page contradicted each other, and would have contradicted each other on one
screen. Recorded as lesson L008.

## Interpretation applied

The narrow reading of the direction is "fix lines 122 and 166." The reading applied is broader, and the
owner was told so before work began: **"avoid ANY conflicts" is a sweep, not a two-line patch.** The two
known violations were found by accident, while an agent was reading the file for an unrelated purpose.
Nothing about how they surfaced suggests they are the only ones. Lesson L008 exists precisely because
authoring a gate without auditing existing copy against it is the failure mode here.

Therefore two parallel workstreams were dispatched:

1. **Full inventory** (data-auditor, read only): sweep all of `src/` for permit determinations, classification
   claims in either direction, tax and assessment claims, zoning outcome claims, structural and load claims
   about containers, any jurisdiction named together with an outcome, and warranty language that could be
   read as extending to structural use. Every hit classified HARD VIOLATION / BORDERLINE / CLEAN / NOT
   APPLICABLE, with schema binding determined per hit and hard violations ranked by legal exposure rather
   than by fix cost. Also asked to determine whether the `/permits/` page itself is compliant, and whether
   violations cluster in a shared component or a copied pattern (which would make the fix one place instead
   of many).
2. **Rework** (content-writer, drafts only): MINIMAL and FULLER options for lines 122 and 166, under all
   five gates, checked for coherence against the pending T-015 paragraph variants since the two render near
   each other.

## The governing principle, stated for reuse

**Reframe, not removal.** This matches the standing recorded guidance. Going silent on permits is its own
failure: buyers want the orientation, and a dealer who refuses to discuss the topic is less useful, not
safer. The line is that Steel Box Direct may describe the QUESTION accurately (what axis matters, who
decides, what changes the answer, what to ask) and may never ANSWER it on the reader's behalf. Attribution
and conditionality are the tools.

Secondary point worth keeping: the honest version is a competitive advantage over a dealer who overpromises
and gets a customer fined. That can be leaned into without mentioning competitors.

## Consequences

- T-018 moves to in_progress. Its scope is now the full inventory plus the rework, not just two lines.
- Nothing integrates until the owner sees the inventory and picks options. Repo remains clean at 544077b.
- The T-015 variant pick and the T-018 rework are decided TOGETHER. Shipping one without the other puts an
  assurance and a non-assurance on the same screen.
- If the inventory shows the violations cluster in a shared component or a copied persona-page pattern, the
  fix scope changes from "edit N pages" to "edit one source", and the owner gets that as a separate scope
  call before any rewrite proceeds.

## Recommendation raised, NOT yet decided by the owner

This is now the second time the permit stance has needed enforcement from memory and prose rather than from
an enforceable rule. Consider promoting it to a project hard stop (PROJECT_HS_003) in
`UDO Project/HARD_STOPS.md`, worded roughly: never publish copy that determines or promises a permit,
zoning, building-classification, or tax-assessment outcome, in either direction, for any jurisdiction. A
hard stop is checkable at session start and survives model changes; a memory entry and a decision record
depend on somebody reading them. Flagged for the owner rather than added, because adding a hard stop is the
owner's call, not the orchestrator's.

## Related

- `.project-catalog/decisions/2026-08-10-t015-container-shelter-approve-narrow.md` (the gates)
- `UDO Project/LESSONS_LEARNED.md` L008
- `UDO Project/PROJECT_STATE.json` T-018, T-019
- Memory: the permit-is-buyer-responsibility stance (reframe not removal)
- Targets: `src/pages/for/farmers/index.astro` lines 122 and 166, plus whatever the inventory returns
