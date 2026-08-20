# Checkpoint: 2026-08-19, session end

Trigger: **HS-UDO-002, session end.** Owner requested handoff.
Session: claude-opus-5-2026-08-16, **four calendar days** (2026-08-16 through 08-19).

## Repo state

```
local HEAD:   014472f  fix(schema): take the parent company out of the JSON-LD graph
origin/main:  014472f  same
branch:       ## main...origin/main       (level, nothing unpushed)
porcelain:    86 entries
deletions:    34 unstaged (deferred UDO v2.2 migration, deliberate)
staged:       0
pages built:  56
tests:        398 passing, 17 files, 0 failures
harvest:      60 passing
tsc:          exit 0
HS003:        46 passing, 0 findings
```

**Nothing is unpushed.** This is the first session close in the project's history with a clean, level tree
and no deferred deploy.

## Twenty-one commits shipped, 0b63011 to 014472f

Carried over from 08-14 and deployed on 08-16: `5e0362e` HS003 blog fixes, `e429343` the Serves cell,
`5a7422e` the first contrast pass.

Then: `ec2b470` audit trail under version control, `8931176` homepage FAQ contrast, `4d7f376` KOI Rental
published, `e67a451` the 08-16 audit record, `544b954` the tools catalogue, `e4989b5` the rent-vs-buy
calculator, `c587089` its wiring, `e3fc422` three email bugs, `9423a18` the geo-pricing feed, `89736fe` the
national basis, `3a9c97d` the city-page price, `acc4868` the /cost/ rewrite, `b8ca738` the calculator fix,
`91a4b8f` robots.txt, `a01cba4` the workflows, `24d73c8` the policy override, `5637e81` the ZIP callout,
`014472f` the schema removal.

## What is new and live

- **`/container-rent-vs-buy-calculator/`**, a break-even tool that owns the phrase "break-even month".
- **A daily FreedomConex geo-pricing feed**, 15 metros and 45 figures, harvested at 10:00 UTC, committing
  only when a price actually moves.
- **A delivered price on all 15 city pages**, the first in the site's history, each scoped to a
  population-centroid ZIP with its effective date and disclaimer.
- **A 15-metro comparison table on `/cost/`**, the most citable page on the domain.
- **National figures rebased on the seven home metros**, $2,080 / $2,610 / $2,400, with labels stating their
  own basis.
- **A loud ZIP callout** under every city price block, tap-to-call, ink on orange at 6.14:1.
- **Content Signals in `robots.txt`** at `use=reference` across all seven groups.
- **The parent company out of the JSON-LD graph** on all 56 pages, every visible reference byte-identical.

## Five things that were quietly wrong and are now fixed

1. A **published PROJECT_HS_003 violation** live since 2026-07-06.
2. **Three bugs in the buyer confirmation email**, including one telling self-pickup buyers their price
   included delivery, and one shipping raw database values like `wind water_tight` to every buyer.
3. A **`robots.txt` whose `Disallow: /admin/` bound none of the six named AI crawlers**, because RFC 9309
   groups do not inherit.
4. A **`/cost/` page asserting Cincinnati was 15 percent cheaper than coastal markets** when the site's own
   feed proves it is 15.4 percent higher.
5. **`priceValidUntil` derived from `asOf`**, which under commit-on-change would have published an expired
   Offer on three product pages after 13 stable months, with nothing failing.

## The harvest has run in production

Run 32258976810, 42 seconds, no-op path, six guarded steps skipped, sidecar cache saved at 298 bytes scoped
to `refs/heads/main` so tomorrow comes up warm. **The permissions question is settled empirically:** a
workflow-level `permissions` block DOES elevate above a repository default of `read`, proven by the run's own
token grant. The scheduled run will not silently 403 the first day a price moves.

## Awaiting the owner, in priority order

1. **T-153.** He wants to review `/rent-to-own/` himself and asked that it not be audited for him.
2. **T-142.** `.outputs/` is gitignored, so the fifteen researched ZIP codes behind the published prices live
   only on this machine.
3. **T-150.** The harvest's JSON summary is discarded with the runner, so an unattended daily job has no
   retrievable structured output. One `tee`.
4. **T-146 BEFORE T-036.** The HS003 guard's quote-pairing defect can SUPPRESS real findings and is
   parity-sensitive, so wiring it as a deploy gate while a stray apostrophe can silently disable a file's
   coverage is the wrong order.
5. **Re-run the Cloudflare AI diagnostic.** Content Signals should take Quick Wins to 4 of 5. Markdown for
   Agents was assessed as theatre on this stack.
6. **The blog dates.** `updatedDate` is wired end to end and unused on all five live posts, three of which
   were edited weeks after their claimed date.

## Process notes worth carrying

Eleven agents contributed. **Every spec error found was in a verification instruction rather than a design
decision**, twelve then eleven then eight across three tasks, which is the 08-14 pattern holding for a third
session.

**Two commit agents stalled or died.** One stall was caused by a brief that supplied rich justification
without stating that the justification was already established, so a careful agent tried to earn it. A
commit brief must say the reasoning is settled.

**Agents corrected the orchestrator on substance at least nine times**, including: the `fromPrice` field,
the centroid rationale, the publish ruling being dropped from a brief, an impossible `primaryZips`
assertion, a parity bug where the instructed fix would have destroyed a file's HS003 coverage, and the wrong
file named for the `/cost/` HowTo.
