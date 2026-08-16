# Checkpoint: 2026-08-11 13:00 local (17:00 UTC), session end

Trigger: HS-UDO-002 session end, and a context-window handoff requested by the owner at 83 percent.
Session transcript: `.project-catalog/history/2026-08-09-2325-session-transcript.md` (opened 2026-08-09 23:25
local, one transcript per session per HS-UDO-012, three calendar dates)
LLM: Claude Opus 5, 1M context (claude-opus-5[1m]), Claude Code CLI
Topic slugs touched: container-shelter, competitor-gaps, geo-wv-lexington, rto-rental-vacuum

## Repository state

- Branch `main`, HEAD **`544077b`**, unchanged all session. **NOTHING COMMITTED.**
- `src/`: **15 files changed, 260 insertions, 52 deletions.**
- Total dirty paths tree-wide: **105** (includes the UDO v2.2 migration residue, deliberately deferred).
- One STAGED item only: `D src/pages/permits/_index.astro.bak`.
- One untracked new directory: `src/lib/compliance/` (the guard test).
- `package.json`: one added script line, `test:hs003`.
- Build: **exit 0, 53 HTML pages.** Tests: **149 passing, 1 failing** (the guard's live-surface scan, at its
  expected 2 owner-reserved blog findings). `npx tsc --noEmit`: 1 pre-existing error at
  `submit-quote.ts:148 TS7006`, proven byte-identical to baseline.

## Rollback

Per-file revert restores pre-session state for any content file, since all are clean at 544077b:

```
git checkout -- src/pages/for/businesses/index.astro
git checkout -- src/pages/for/contractors/index.astro
git checkout -- src/pages/for/farmers/index.astro
git checkout -- src/pages/for/homeowners/index.astro
git checkout -- src/pages/locations/index.astro
git checkout -- src/components/home/HeroSection.astro
git checkout -- src/components/SiteNav.astro
git checkout -- src/components/SiteFooter.astro
git checkout -- src/components/home/CtaSection.astro
git checkout -- src/pages/shipping-containers-for-sale/index.astro
git checkout -- src/data/cities.ts src/data/cities.test.ts src/data/containers.ts
git checkout -- src/lib/schema/entities.ts src/lib/schema/entities.test.ts
git checkout -- public/llms.txt package.json
git checkout -- docs/superpowers/specs/2026-05-25-product-pages-design.md
git checkout -- docs/superpowers/specs/2026-06-04-use-case-pages-design.md
git checkout -- docs/superpowers/plans/2026-05-25-product-and-city-pages.md
git checkout -- docs/superpowers/plans/2026-06-04-use-case-pages.md
```

Restore the deleted backup (still in HEAD, deletion staged not committed):
`git checkout HEAD -- src/pages/permits/_index.astro.bak`
Remove the new guard: `rm -rf src/lib/compliance/`

## What shipped into the tree this session

1. **Permit compliance rework.** 12 hard violations plus the homepage ticker fixed across four content files;
   four spec/plan docs amended with visible `AMENDED` markers; the tracked non-compliant permits backup deleted;
   PROJECT_HS_003 written; a shape-based compliance guard built (`src/lib/compliance/hs003-content-guard.test.ts`,
   1219 lines) and left deliberately RED at 2 owner-reserved blog findings.
2. **Two new city pages**, Huntington WV and Lexington KY, wired across 11 files matching the Columbus precedent.
3. **Service-area schema fixed** to `[GeoCircle(250mi), Country(US)]` with a two-directional ratchet test.
4. **A homepage capability line** added beneath the ticker as a static element outside `aria-hidden`.

## Verification state at checkpoint

Two independent verifier passes ran. The second returned **COMMIT-READY, conditional on explicit pathspec
staging**, with 6 findings, none a hard-stop violation and none a publish-gate failure. All 12 original
violations confirmed gone from source AND from all 335 files in `dist/`. The businesses twin-string invariant
holds at 1026 characters. `faqs` length and order unchanged on all four persona pages. `UDO Framework/`
untouched.

## THE COMMIT INSTRUCTION, and it must not be lost

**Use explicit pathspecs. NEVER `git add -A` or `git commit -a`.** Only 12 of 48 tracked modifications belong to
the permit batch; a blanket add sweeps in `.gitignore`, `README.md`, `START_HERE.md`, and 34 root-level
deletions from the UDO v2.2 migration the owner deliberately deferred (T-075).

**And `UDO Project/.outputs/` is currently gitignored and already effective.** Every evidence artifact this
session produced sits in a directory git has been told to discard: three competitor maps, the violation
inventory, the rental provider dataset, the RTO plan and drafts, the city datasets. Committing them needs
`git add -f` or a `.gitignore` change. **That decision is still open (T-054) and is the single most
time-sensitive item.**

`.project-catalog/` is NOT ignored, so session logs, decisions, checkpoints, and transcripts are safe.

> **CORRECTION appended 2026-08-11T18:15Z by session claude-opus-5-2026-08-11-1657. The line immediately above
> is FALSE. Do not act on it.**
>
> Verified Grade A with `git check-ignore -v`, which names the matching pattern for every path tested:
> `UDO Project/.project-catalog/` is ignored by `.gitignore:41`, `.checkpoints/` by line 37, `.memory/`
> (including `canonical/`) by line 39, `.outputs/` by line 40, `.agents/` by line 36, and `.rules/` by line 42.
> `git ls-files "UDO Project/"` returns **0**.
>
> The original check inspected only the 35 lines `upgrade.py` appended (lines 84 through 94) and missed the
> **legacy bare patterns at lines 36 through 42**, which predate the v2.0 folder split. A bare directory pattern
> with no leading slash matches at any depth, so each one catches its `UDO Project/` counterpart whole. So the
> scope is not `.outputs/`: it is the entire working context, including this checkpoint file.
>
> **This does NOT affect the commit instruction above, which remains correct.** An explicit-pathspec commit
> touches only the named source paths and cannot sweep the 34 root deletions or the untracked `UDO Project/`
> tree. The hazard is confined to `git add -A` and to any later attempt to commit the audit trail, which would
> silently add nothing.
>
> Root cause and one-line fix are recorded in **T-107**: anchor the six legacy patterns to the repo root
> (`/.agents/`, `/.checkpoints/`, `/.memory/`, `/.outputs/`, `/.project-catalog/`, `/.rules/`), which enacts the
> policy `upgrade.py` already intends. The same correction is appended to `HANDOFF.md`.

## Compliance state

- Session logs: `2026-08-10-session-log.md`, `2026-08-11-session-log.md` (extended at session end).
- Decisions logged this session: 5, in `.project-catalog/decisions/` (verified by listing, not asserted).
- Lessons promoted: L007 through L014 (eight this session; 14 active total).
- Checkpoints: three this session, this being the third.
- PROJECT_STATE: 104 todos, valid JSON, conflict check passing (HS-UDO-015).
- No Framework files modified (HS-UDO-014, HS-UDO-016).
- **Known state defect, see L013:** 55 of 104 todos are marked high priority, so priority no longer
  discriminates. Re-ranking against a cap of roughly seven is the first task for the next session.
- **Known audit defect, see L014:** `last_updated` timestamps written earlier in the session were interpolated
  rather than read from the clock and ran up to eight hours ahead. Corrected at session end to the real time.
