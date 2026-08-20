# Checkpoint: 2026-08-20 release (pre-push)

Base: main == origin == 014472f. Working tree carries five verified batches, all owner-authorized:

1. T-146: HS003 guard comment-stripping fix (+T-135 header rewrite).
2. T-153: owner-directed /rent-to-own/ rework (MCR consolidated to one FAQ answer, approval framing
   downplayed to #b1aca3 spec, all owner copy verbatim). T-063 closed within it.
3. T-112: site-wide dash sweep, 642 dashes + 2 entities cleared; src+public and all built HTML at
   zero (untracked draft excepted). T-077, T-030 closed within it.
4. T-105: all 2009 founding claims removed site-wide (24+ hits), schema foundingDate gone with a
   never-again guard test.
5. T-036: guards wired into the build (dash guard + HS003), teeth-checked. T-154: /ai-info/ fact
   sheet built from the owner interview, prices interpolated from pricing.ts, footer + llms.txt.

Final verified state pre-commit: npm run guard 60/60 at 0 findings; vitest 413 tests / 18 files;
tsc exit 0; build exit 0 at 57 HTML routes; dist greps 0 for dashes, "My Container Rental" outside
the sanctioned FAQ, and "2009".

Commit plan: seven explicit-pathspec commits (compliance fix, rto, dash sweep, 2009 removal, guard
wiring, ai-info, docs). EXCLUDED on purpose: README.md and START_HERE.md (deferred UDO migration,
T-075), the 34 root-level deletions (unstaged by owner decision), src/content/blog/
the-cheap-container-that-wasnt.md (owner-reserved, untracked), everything under .github/ (untracked
by design, HS-OUT-001 landmine), root uploads/tooling noise.

Rollback: git reset --hard 014472f discards the entire release (working tree only until push).
After push, revert by commit range.

Owner authorization trail: rto edits (his 2026-08-19 review message), dash sweep ("Do the site wide
sweep of em dashes"), guard wiring ("wire the guard into the build"), 2009 removal ("remove any date
reference from the site"), ai-info + push ("ONce the page is finished push live").
