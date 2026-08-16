# Checkpoint: 2026-08-14, session end

Trigger: **HS-UDO-002, session end.** Owner requested shutdown.
Session: claude-opus-5-2026-08-12-0000, three calendar days.

## Repo state

```
local HEAD:   5a7422e  fix(a11y): swap cream to ink on the two orange text blocks that fail WCAG AA
origin/main:  0b63011  fix(rental-guide): stop Section B stating the conex count twice
branch:       ## main...origin/main [ahead 3]
unpushed:     3 commits
porcelain:    83 entries
deletions:    34 unstaged (deferred UDO v2.2 migration)
staged:       0
pages built:        55
```

## THE THREE UNPUSHED COMMITS, and what the live site is missing

```
5a7422e fix(a11y): swap cream to ink on the two orange text blocks that fail WCAG AA
e429343 fix(schema): stop the Serves cell contradicting areaServed on 32 pages
5e0362e fix(compliance): reframe two PROJECT_HS_003 findings in blog content
```

The live site is at `0b63011` and does **not** carry: the two PROJECT_HS_003 blog fixes, the `Serves` cell
correction, or the WCAG AA contrast fixes. **One `git push origin main` deploys all three.**

## Rollback

The three unpushed commits can be dropped locally without touching the remote:

```
git reset --hard 0b63011      # discards them, working tree returns to the deployed state
git reset --soft 0b63011      # keeps the changes staged instead
```

To back out what is already deployed, revert forward rather than force-push. The command sequence is in
`.checkpoints/2026-08-14-0800-release-pushed/checkpoint.md`.

## What is live that was not three days ago

- `/container-rental-guide/` and `/shipping-container-guides/`, 53 pages to 55.
- The Guides nav trigger now points at the hub rather than `/size/`, so a live link changed behaviour.
- The site-wide PROJECT_HS_003 compliance rework, the Huntington and Lexington city pages, and the
  nationwide service-area schema, all of which had been committed since 2026-08-12 and never deployed.

## Suite

**219 passing, 0 failing.** Green for the first time. Both previously tolerated HS003 findings are closed,
including one that had been live on a published page since 2026-07-06.

## The single most important open item

**T-107.** `UDO Project/` is gitignored wholesale by legacy bare patterns at `.gitignore` lines 36 to 42,
so every session log, decision record, checkpoint and transcript in this project, **including this file**, is
outside version control. The fix is anchoring six patterns to the repo root and it takes five minutes.

## Awaiting the owner

1. **Push the three commits**, or decide not to.
2. **KOI Rental.** "Koi is fine" was ambiguous between confirmed-trading and leave-as-is. Flipping
   `status: 'held'` to `'published'` in `rentalProviders.ts` moves all four derived count sites and
   publishes a named third party as verified. Not inferred.
3. **Five more cream-on-orange AA failures**, identical 2.77:1, three on the homepage. One is the same
   body-text block just fixed on `/locations/`, so the site is internally inconsistent until authorized.
4. **`--c2-cond` and `--c4-cost`** at 3.69 to 3.75:1, passing AA-large and failing AA-normal. Ink gives
   only 4.53 and 4.60. Genuine judgement call, not a clear fix.
5. **T-036**, wiring the now-green guard to the build.
6. **T-112**, the 634 pre-existing em dashes, deferred by owner ruling to a new session.
