# Checkpoint: 2026-08-11 20:10 UTC, permit batch committed

Trigger: **HS-UDO-002, phase completion.** The first commit since 2026-08-04 has landed.
Session: claude-opus-5-2026-08-11-1657. Timestamps read from `date -u`, per L014.

## What landed

```
431799b compliance: PROJECT_HS_003 rework, WV/KY city pages, nationwide service-area schema
 23 files changed, 2044 insertions(+), 384 deletions(-)
```

Previous HEAD was `544077b` (2026-08-04). **Three workstreams had been sitting uncommitted for a week.**

Committed as **Option A**, a combined 22-path commit plus the pre-staged `.bak` deletion, rather than the
13-path permit-only commit the prior session planned. The reason is recorded in T-115: five of six source
files were workstream-mixed, and a pathspec takes a file whole. The decisive fact was that a permit-only
commit would have published 8 links to Lexington and Huntington routes that did not yet exist, because the
persona pages were on the list and `cities.ts` was not. Astro does not link-check, so the build could not
have caught it.

## Verified after the commit, independently of the committing agent

| Check | Result |
|---|---|
| Files in commit | 23 |
| Index empty | 0 staged |
| Working tree entries | 82 (was 105) |
| Deferred migration deletions intact | 34 unstaged |
| Forbidden paths committed | 0 |
| `UDO Project/` still untracked | yes |
| Pushed | **NO**, ## main...origin/main [ahead 1] |

The porcelain count dropped by 23 rather than the predicted 22. The committing agent flagged this rather
than glossing it, and the explanation is correct: the pre-staged `.bak` deletion was itself one of the
original 105 entries, so committing it removed it from the listing too.

## NOT pushed, deliberately

The owner authorized a commit. A push triggers a Cloudflare Pages deploy and is a separate decision.
`main` is ahead of `origin/main` by 1.

## Two fixes made during the commit run that were not in the original batch

1. **T-113**, a live PROJECT_HS_003 class-6 violation at `contractors/index.astro:122` ("rated to take a
   forklift"), found by the verifier, outside every existing diff hunk, and the surviving twin of one the
   batch had already fixed on the businesses page. Reported to the owner under the rule's violation
   protocol rather than fixed silently, then replaced with copy that names the load question, attributes
   the answer to the manufacturer's specification for that unit, and states "We do not issue load ratings."
2. **Nine pre-existing em dashes** on the wider commit's added side, in three files the original grant did
   not cover. Owner extended the grant. Net-new dash count was already zero; this made the added side
   literally zero.

## Known state after this checkpoint

- **`npm test` now fails on `main`**, deliberately, at the 2 owner-reserved blog findings (T-036, T-116).
  No CI gates on it. It does mean the suite stops being a usable signal until those are adjudicated.
- **The audit trail is still gitignored** (T-107). Nothing in `UDO Project/` is in this commit, including
  this checkpoint. The one-line fix is to anchor six `.gitignore` patterns to the repo root.
- The UDO v2.2 migration remains deferred (T-075), 34 deletions still pending.

## Rollback

`git reset --soft HEAD~1` restores the pre-commit state with the working tree intact and the 23 paths
back in the index. Nothing has been pushed, so no remote state depends on this commit.
