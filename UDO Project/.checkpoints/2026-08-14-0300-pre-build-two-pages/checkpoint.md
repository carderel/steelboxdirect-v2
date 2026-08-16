# Checkpoint: 2026-08-14 03:00 UTC, before the first source change of this session

Trigger: **HS-UDO-002, before a risky operation.** Seven tasks of source changes are about to begin.
Session: claude-opus-5-2026-08-12-0000 (three calendar days, 2026-08-12 through 2026-08-14).

## The state this protects

**No source file has been touched at any point in this session until now.** Everything so far has been
mockups in a scratchpad, evidence documents, and the audit trail.

```
HEAD:        431799b compliance: PROJECT_HS_003 rework, WV/KY city pages, nationwide service-area schema
branch:      ## main...origin/main [ahead 1]
porcelain:   83 entries
deletions:   34 unstaged (deferred UDO v2.2 migration, T-075)
staged:      0
```

**`431799b` is committed and NOT pushed.** Owner ruling 2026-08-14: build both pages first, then one deploy
carrying that commit plus the new work.

## What is about to change

Plan: `docs/superpowers/plans/2026-08-14-rental-guide-and-guides-hub.md`, 4,242 lines, 7 tasks, 67 steps.
Execution mode: subagent-driven, a fresh agent per task with review between.

| Task | Deliverable |
|---|---|
| 1 | `rentalStance.ts` plus the `/rent-to-own/` html-branch fix (T-084 + T-062, a coupled precondition) |
| 2 | Provider dataset, derived counts, and the referral-link guard test |
| 3 | The `/container-rental-guide/` page |
| 4 | The guides catalogue |
| 5 | The `/shipping-container-guides/` hub |
| 6 | Integration edits and the link-direction guards |
| 7 | Release verification sweep |

## Baseline that must hold, measured not quoted

- `npm run build`: exit 0, 53 HTML files.
- Test suite: **149 passing, 1 failing**, that failure being the HS003 guard at exactly 2 owner-reserved
  blog findings. **A second failing test blocks.** Plan ramps totals 156, 169, 184, 193, 206, 218.

## Rollback

Nothing in this workstream is committed yet. To abandon entirely:

```
git checkout -- src/ public/llms.txt   # ONLY safe while this workstream owns those changes
```

**Careful:** `src/` currently has zero uncommitted modifications, so a checkout is safe RIGHT NOW and
stops being safe the moment Task 1 lands. After that, roll back per-commit with
`git reset --soft HEAD~1` for each task commit, which preserves the working tree.

The deferred UDO v2.2 migration (34 root deletions plus .gitignore, README.md, START_HERE.md) must remain
untouched throughout, and `UDO Project/` stays untracked and gitignored per T-107.

## Owner gates cleared before this point

- **Quarterly re-verification: committed** (T-082), so the provider directory is viable.
- **KOI Rental: the owner will phone (859) 479-2555.** The build ships KOI as `status: 'held'`, so the page
  says TWO companies everywhere and one field flip makes it three. Their number is guarded out of the repo.

## Still open and NOT gating this build

- Pricing policy on third-party rates (owner flagged, orchestrator read is that attributed competitor
  pricing is reporting rather than selling).
- The hub FAQ asserting the four rent-to-own synonyms are interchangeable: **pulled from the FAQ set**
  pending a legal read, **kept in the glossary**, which does not enter JSON-LD.
