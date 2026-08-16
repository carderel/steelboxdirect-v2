# Checkpoint: 2026-08-14 08:00 UTC, release pushed

Trigger: **HS-UDO-002, phase completion.** The first deploy since 2026-08-04, carrying eight commits.
Session: claude-opus-5-2026-08-12-0000 (three calendar days).

## What went live

```
0b63011 fix(rental-guide): stop Section B stating the conex count twice
0941737 feat(nav): wire the rental guide and the guides hub into the site
996da01 feat(guides): add /shipping-container-guides/ hub
c3cf5cc feat(guides): guides catalogue with derived count and 404-proof ItemList entries
bcd1d5e feat(rental): add /container-rental-guide/
6dfcbcf feat(rental): provider dataset with derived counts and a referral-intent guard
2ea1274 feat(rental): shared rental-stance module + rent-to-own html FAQ branch (T-084, T-062)
431799b compliance: PROJECT_HS_003 rework, WV/KY city pages, nationwide service-area schema
```

Previous deployed state was `544077b` (2026-08-04). **431799b had been committed since 2026-08-12 and never
deployed**, so this release carries it too.

| | |
|---|---|
| Commits | 8 |
| Pages | 53 to 55 |
| Tests | 218 passing, 1 failing (pre-existing HS003 guard at exactly 2 findings) |
| Added lines | 5,302 |
| Em dashes introduced | **0** |
| En dashes introduced | **0** |
| Deferred migration | 34 deletions, unstaged and unpushed throughout |
| Forbidden paths in any commit | 0 |

## New URLs

- `/container-rental-guide/` the rental guide
- `/shipping-container-guides/` the guides hub

The Guides nav trigger moved from `/size/` to the hub, so a live link changed behaviour.

## Rollback

The remote has moved, so rollback is now a forward-fix rather than a reset.

```
git revert --no-commit 0b63011 0941737 996da01 c3cf5cc bcd1d5e 6dfcbcf 2ea1274
git commit -m 'revert: back out the rental guide and guides hub release'
git push origin main
```

That leaves `431799b` deployed, which is the compliance rework and the two city pages, and is independently
sound. **Do NOT `git push --force`.** To back out 431799b as well, add it to the revert list.

## Known state at push time, none of it introduced by this release

- **T-133:** one of the two owner-reserved HS003 findings, `wind-and-water-tight-explained.md:45`, builds to
  a LIVE page. The other does not build. Half of a long-tolerated test failure is a published class 6
  exposure and it needs adjudicating on its own merits.
- **T-112:** 634 pre-existing em dashes in `src/`, 1,206 in built output on 55 of 55 pages, 142 inside
  JSON-LD. Explicitly out of scope for this release. HS-OUT-001 needs either a sweep or an amendment.
- **T-128:** the QuickFacts 250-mile fallback on 37 of 55 pages.
- **T-131:** cream on signal orange at 2.77:1, failing WCAG AA on `/permits/` and `/locations/`.
- **T-107:** `UDO Project/` is still gitignored wholesale, so this entire audit trail remains outside
  version control.

## Owner follow-up, no longer blocking

**Phone KOI Rental.** The page ships saying two conex companies, KOI is not named, and nothing published is
unverified. If they are trading, flipping `status: 'held'` to `'published'` in `rentalProviders.ts` moves all
four derived count sites in one edit. Verified by simulation rather than assumed.
