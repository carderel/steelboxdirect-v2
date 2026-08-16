# Decision: Site-wide permit rework authorized, scope and prevention set

Date: 2026-08-10
Decided by: Eli Carder (owner)
Recorded by: orchestrator (Claude Opus 5, 1M context, Claude Code CLI)
Status: ACTIVE, execution in flight
Topic slug: container-shelter
Tags: #permits #compliance #content-policy #gates #schema

## What was authorized

Presented with the full sweep (12 hard violations across 4 live files, 8 borderline across 5 files, inventory
at `.outputs/container-shelter/2026-08-10-permit-gate-violation-inventory.md`), the owner authorized:

1. **Rework scope: ALL 12 hard violations, including the 3 insurance-coverage claims.** The insurance class
   was outside the seven categories the sweep was briefed on; the owner scoped it in. This matters because
   the auditor's judgment was that insurance belongs at severity position 2 or 3 if included, since "your
   insurer covers it" is the easiest claim for a customer to prove they relied on.
2. **Businesses page: targeted edits plus adding the missing buyer-responsibility disclaimer.** Not the full
   rewrite the auditor floated. It is the only persona page with no disclaimer anywhere in it, which is
   plausibly why six of the twelve violations accumulated there, so the disclaimer closes the structural gap
   without a large-diff rewrite of copy that may be converting.
3. **PROJECT_HS_003 added** to `UDO Project/HARD_STOPS.md`.
4. **`src/pages/permits/_index.astro.bak` deleted.**

## What was NOT authorized

**The build-time guard test (T-025) was declined.** It stays pending.

This is worth stating plainly rather than burying: prevention now rests entirely on PROJECT_HS_003, which is
a rule that a human or a model has to read and apply. There is no automated gate. The sweep demonstrated that
four different authors, working from the same page skeleton, independently reached for the same
non-compliant framing without any of them intending to. A written rule addresses that only if it is read
every time. The repo already contains the precedent for the automated version
(`src/data/cities.test.ts:44-49`), so the option remains cheap to take later. Re-raise it if a violation
appears again after this cleanup.

## Scope consequence the owner's choice resolved

Six of the twelve hard violations feed the JSON-LD FAQPage (businesses 32, 44, 56; farmers 33, 37;
homeowners 43). Authorizing all twelve therefore **puts schema-bound lines in scope**, which resolves the
conflict recorded in T-019 between the T-015 narrow approval (which excluded schema-bound lines on purpose)
and the avoid-any-conflicts directive. Compliance work now reaches the structured-data layer. The
CONVERSION half of T-019 (farmers line 29's dead-end pole-barn concession, which is a weak-framing problem
rather than a gate violation) remains out of scope and unscheduled.

## Findings that shaped how the work was dispatched

- **`src/pages/permits/index.astro` is compliant.** Five explicit deferrals, clean HowTo schema. The hub is
  fine and is being contradicted by the persona pages linking to it. So this is a cleanup, not a redesign.
- **The compliant template already exists on-site** (farmers 17/116/117, homeowners 27/59/149, permits page,
  and `shipping-containers-for-sale/index.astro:38` for structural questions). Every rework agent was told
  to reuse those exact sentences rather than invent phrasing, so the fix lands in the site's own voice.
- **There is no one-place fix, and this was proven rather than assumed.** No shared persona FAQ module
  exists; each page declares its own literal `faqs` array. A cross-file duplicate-sentence pass found 135
  duplicates, of which exactly two are permit-related and both are the COMPLIANT disclaimer. Not one
  violating sentence is duplicated across files. The skeleton and the schema wiring were copied; the copy was
  hand-written four times. Shared mental model, not shared code. Hence per-file rework.
- **The change-order hazard on businesses 32 and 291.** One claim, two separately hardcoded copies, one in
  the DOM and one in the JSON-LD. Any instruction naming only one line produces a page that contradicts its
  own structured data. Both line numbers were written into the dispatch brief explicitly.
- **A cross-page contradiction ships today.** `containers.ts:68` titles the 40ft use case "Permanent
  Structures" while `farmers:120` sells storage "without a permanent structure." Gate 1 bans both directions.
  The agent handling `containers.ts` was told not to default to changing it, since "permanent structure" there
  may be construction vocabulary rather than legal classification, and was asked to argue a position either
  way and reconcile the two pages whichever way it lands.

## How it was dispatched

Checkpoint `2026-08-10-0510-permit-rework-authorized` taken FIRST, per HS-UDO-002, because the batch contains
both live-copy edits across three JSON-LD surfaces and a destructive git operation. It carries per-file
rollback commands and the restore command for the deleted backup.

Four agents, concurrent:

- **content-writer**, businesses page: targets 32/291, 126, the insurance cluster (142/143, 44, 56), plus
  adding the disclaimer. Given the two judgment calls to make and explain (what happens to the MACRS
  depreciation content, and what happens to the IRS Publication 946 link and the Sources entry at line 314).
- **content-writer**, farmers and homeowners: targets farmers 33, 37, 120, 162 and homeowners 43, 31, 39.
  Told NOT to redraft farmers 122 and 166 (already drafted) but to stay consistent with them, and to
  coordinate rather than duplicate the table footnote.
- **content-writer**, `src/data/containers.ts`: targets 41 and 68. Told to verify the schema-binding claim
  itself rather than trusting the inventory.
- **astro-developer**, the deletion: verify before deleting, confirm nothing references the path, `git rm`
  (stage, do not commit), run the build and report the real result, and confirm the two sibling backups and
  the live permits page are untouched.

All three content agents draft to `.outputs/`; none may modify a page. Integration and verification are
separate later steps, gated on owner approval of the drafts.

## Publish gates, now six

Gate 6 is new this cycle: no insurance-coverage determination. Full list is in PROJECT_HS_003 and in the
checkpoint. Gate 5 (HS-OUT-001) must be verified one pattern per character per lesson L003.

## Related

- `.project-catalog/decisions/2026-08-10-gate-conflicts-must-be-reworded.md` (the directive this executes)
- `.project-catalog/decisions/2026-08-10-t015-container-shelter-approve-narrow.md` (the original gates)
- `.outputs/container-shelter/2026-08-10-permit-gate-violation-inventory.md` (the sweep)
- `.checkpoints/2026-08-10-0510-permit-rework-authorized/checkpoint.md`
- `UDO Project/HARD_STOPS.md` PROJECT_HS_003
- `UDO Project/LESSONS_LEARNED.md` L008
- `PROJECT_STATE.json` T-018 through T-025
