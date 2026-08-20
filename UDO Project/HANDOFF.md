# HANDOFF: start here for the next context window

> ## CURRENT AS OF 2026-08-19. Everything below this block is older and partly superseded.
>
> **LIVE AT `014472f`. `main == origin`. NOTHING UNPUSHED.** First session close in this project's history
> with a level tree and no deferred deploy. 398 tests across 17 files, build 56 pages, `tsc` exit 0, HS003
> green at 0 findings.
>
> **Read the four session logs in order:** `2026-08-16`, `2026-08-17`, `2026-08-18`, `2026-08-19`. The
> transcript was NOT split at any of the three midnight rollovers, per HS-UDO-012, and lives at
> `.project-catalog/history/2026-08-16-session-transcript.md`. The logs are the entry point; the transcript
> is long. Latest checkpoint: `.checkpoints/2026-08-19-1400-session-end/`.
>
> ### Two things that must stay untracked
>
> `src/content/blog/the-cheap-container-that-wasnt.md` and `.github/workflows/supabase-keepalive.yml`. Both
> carry em dashes and would breach HS-OUT-001's create clause if committed. **`.github/` is untracked in its
> entirety**, so `git add .github/` is the specific command that would do it. Add workflow files by
> individual full path. The 34 UDO migration deletions also stay unstaged.
>
> ### What shipped, 21 commits, `0b63011` to `014472f`
>
> A daily FreedomConex geo-pricing feed covering 15 metros and 45 figures, harvested at 10:00 UTC and
> committing only when a price actually moves. A delivered price on all 15 city pages, the first in the
> site's history. `/container-rent-vs-buy-calculator/`. A 15-metro table on `/cost/`. National figures
> rebased on the seven home metros at $2,080 / $2,610 / $2,400. A loud ZIP callout under every city price
> block. Content Signals in `robots.txt`. The parent company out of the JSON-LD graph on all 56 pages while
> every visible reference stands byte-identical.
>
> ### The pricing policy CHANGED. Read the decision before touching a price.
>
> `.project-catalog/decisions/2026-08-17-city-page-pricing-override.md`. The city-page dollar hard stop is
> **superseded, not deleted**, and replaced by a stricter provenance rule: any dollar figure on a city page
> must derive from the pricing module, be scoped to a named ZIP, and carry its effective date and
> disclaimer. **A hand-typed amount on a city page remains forbidden.** `CLAUDE.md` lines 30 and 46 were
> rewritten to match.
>
> ### Traps that will cost you time
>
> - **`fromPrice` is NOT the unit price.** It is `min(pickupUnitPrice, deliveryUnitPrice)`. Delivered totals
>   must use `deliveryUnitPrice + baseDeliveryCost`. This took SIX correction passes because 1440.60 is the
>   `fromPrice` at Dayton and the `deliveryUnitPrice` at Cincinnati, so one value plays two roles at two
>   ZIPs. Never quote a price without naming its ZIP.
> - **The HS003 guard pairs quote characters across a whole file, comments included.** It is a PARITY bug:
>   an even number of stray apostrophes is benign, an odd number re-pairs every literal below it and can
>   SUPPRESS a real finding. "Remove that apostrophe" is dangerous advice; the orchestrator gave it and it
>   would have destroyed a file's coverage. See T-146, and fix it BEFORE T-036.
> - **`grep $'\u2014\|\u2013' file` returns exit 1 even on a file containing both**, because BSD grep BRE
>   treats `\|` as a literal pipe. One pattern per invocation, always.
> - **`git check-ignore` consults the index by default.** Use `--no-index` for the real pattern decision.
> - **Assert on tag-stripped text, not raw HTML.** The literal `45237 not your ZIP?` does not appear in
>   served HTML because the ZIP renders inside a chip span.
> - **Two agent definitions cannot write files.** `seo-analyst` and `researcher` lack Write, which forced
>   three hand transcriptions into `.outputs/`. See T-148.
>
> ### Awaiting the owner, in priority order
>
> 1. **T-153.** He wants to review `/rent-to-own/` HIMSELF and asked that it not be audited for him. Do not
>    dispatch a review of it unprompted.
> 2. **T-142.** `.outputs/` is gitignored, so the fifteen researched ZIP codes behind the published prices
>    live only on this machine.
> 3. **T-150.** The harvest's JSON summary goes to `$RUNNER_TEMP` and is discarded, so an unattended daily
>    job has no retrievable structured output. One `tee`.
> 4. **T-146 before T-036**, for the parity reason above.
> 5. **Re-run the Cloudflare AI diagnostic.** Content Signals should take Quick Wins to 4 of 5. Markdown for
>    Agents was assessed as theatre on this stack; see the 08-18 log.
> 6. **The blog dates.** `updatedDate` is wired end to end and unused on all five live posts, three of which
>    were edited weeks after their claimed pubDate of 2026-07-06.
>
> ### The harvest is operational
>
> It has run once in production, run 32258976810, no-op path, sidecar cache saved so the next run comes up
> warm. **The permissions question is settled empirically:** a workflow-level `permissions` block DOES
> elevate above a repository default of `read`, proven by the run's own token grant. The scheduled run will
> not silently 403 the first day a price moves. `main` is unprotected with 0 rulesets.

---

> ## CORRECTION, added 2026-08-11T17:00Z by session claude-opus-5-2026-08-11-1657
>
> **Item 1 below understates its own problem, and one sentence in it is false.** It says
> "`.project-catalog/` is NOT ignored, so logs, decisions, checkpoints, and transcripts are safe."
> They are not safe. Verified Grade A with `git check-ignore -v` against 16 representative paths:
>
> | Path | Status | Matching pattern |
> |---|---|---|
> | `.project-catalog/` (sessions, decisions, history) | IGNORED | `.gitignore:41` |
> | `.checkpoints/` | IGNORED | `.gitignore:37` |
> | `.memory/` (including `canonical/`) | IGNORED | `.gitignore:39` |
> | `.outputs/` | IGNORED | `.gitignore:40` |
> | `.agents/` (all 14 definitions) | IGNORED | `.gitignore:36` |
> | `.rules/` | IGNORED | `.gitignore:42` |
> | The 9 loose files at `UDO Project/` root | tracked-eligible | none |
> | `UDO Framework/` | tracked-eligible | none |
>
> The earlier check inspected only the 35 lines `upgrade.py` appended (lines 84 through 94) and missed the
> **legacy bare patterns at lines 36 through 42**, which predate the v2.0 folder split. A bare directory
> pattern with no leading slash matches at any depth, so each catches its `UDO Project/` counterpart whole.
> `git ls-files "UDO Project/"` returns **0**, and status collapses the entire tree to one `?? "UDO Project/"` line.
>
> **Why this matters more than the original item:** the 34 pending root deletions remove the *old tracked*
> copies of exactly these directories. Committing the migration would delete the tracked audit trail and be
> silently unable to add the replacement, because `git add` skips ignored subtrees without erroring.
>
> **The fix is cheap and the intent is already documented in the repo:** `upgrade.py`'s own lines 84 through 94
> ignore only outputs, working and disposable memory, uploads, and backups, which means it intends
> `.project-catalog/`, `.checkpoints/`, `.memory/canonical/`, `.agents/`, and `.rules/` to be **tracked**.
> Anchoring the six legacy patterns to the repo root (`/.agents/`, `/.checkpoints/`, and so on) enacts that
> intent with no other change. The owner decision on `.outputs/` specifically is unchanged and still open.
>
> Full record: **T-107** in `PROJECT_STATE.json`. Also new: **T-108**, agent-sync drift is frontmatter by
> design rather than corruption, so 14-of-14 drift is expected and the check needs narrowing.

Written 2026-08-11 17:00 UTC at the end of a session that opened 2026-08-09 23:25 local and ran three calendar
dates. Context window reached 83 percent, so work was stopped deliberately rather than truncated.

**Read this file, then `PROJECT_STATE.json`, then stop and ask. Do not start building.**

---

## In one paragraph

Three workstreams ran. A site-wide permit-compliance rework is **complete and verified commit-ready** but
**uncommitted**. A competitive gap analysis against Conextalk is **complete, with all five gaps ruled on by the
owner**. And an investigation into the Freedom Conex relationship, which the owner initiated, surfaced findings
that **outrank everything else on this list**. Nothing is committed. HEAD is still `544077b`.

---

## THE THREE THINGS THAT NEED THE OWNER, in order

**1. `UDO Project/.outputs/` is gitignored and already effective (T-054).**
Verify with `git check-ignore -q "UDO Project/.outputs/competitor-gaps/2026-08-11-competitor-keyword-map.md"`.
Every evidence artifact from this session lives there: three competitor maps, a 12-violation inventory, a
verified rental-provider dataset with a February re-verification deadline, the RTO plan and drafts, and the
Huntington and Lexington city datasets. **This is the most time-sensitive open decision.** `.project-catalog/` is
NOT ignored, so logs, decisions, checkpoints, and transcripts are safe.

**2. A factual error on the trust page (T-105).**
`src/pages/container-buying-guide/index.astro` lines 57 and 81 state that Freedom Conex has "sold containers
since 2009." FC's own materials say "Established in 2023" and BBB records incorporation as 2023-08-01. The 2009
date is real but belongs to Steel Box Direct (`entities.ts:72` `foundingDate`), not to FC. **It sits on the page
whose entire argument is "find out who you're actually buying from."**

**3. Legal pages assert an agency their partner's terms do not grant (T-106).**
`src/pages/terms.astro:16` says the sale is made by FC "through its authorized independent agent, Steel Box
Direct." FC's own Terms, effective 2026-01-01, authorize no outside party and reference only "the Company, and/or
its associated sales reps." This is a legal-posture gap independent of anyone's intentions.

---

## The commit, when authorized

**Explicit pathspecs only. NEVER `git add -A` or `git commit -a`.** Only 12 of 48 tracked modifications belong to
the permit batch; a blanket add sweeps in `.gitignore`, `README.md`, `START_HERE.md`, and 34 root-level deletions
from the UDO v2.2 migration the owner deliberately deferred (T-075). The pathspec list is in T-054 and in
`.checkpoints/2026-08-11-1300-session-end-three-workstreams/checkpoint.md`.

Note that PROJECT_HS_003, the rule authorizing all the compliance work, lives in **untracked**
`UDO Project/HARD_STOPS.md`, while the tracked root `HARD_STOPS.md` at HEAD contains zero instances of it. So a
scoped commit ships the enforcement without the rule. The owner accepted that by deferring the migration.

---

## What is in the tree, uncommitted

`git diff --stat -- src/` shows **15 files, 260 insertions, 52 deletions**. Build exit 0 at **53 pages**. Tests
**149 passing, 1 failing** (the compliance guard's live-surface scan, at its expected 2 findings).

1. **Permit compliance rework**: 12 hard violations plus a homepage hard-stop breach fixed across four content
   files; four spec/plan docs amended with visible `AMENDED` markers; a tracked non-compliant permits backup
   deleted (staged); PROJECT_HS_003 written; a shape-based guard built at
   `src/lib/compliance/hs003-content-guard.test.ts` and left **deliberately RED** on two owner-reserved blog
   findings, and NOT wired to the build for that reason (T-036).
2. **Huntington WV and Lexington KY city pages**, 11 files, matching the Columbus rollout precedent.
3. **Service-area schema** changed to `[GeoCircle(250mi, Cincinnati), Country(US)]`, with a test that fails if
   either half is later removed.
4. **A homepage capability line** beneath the ticker, as a static element deliberately outside `aria-hidden`.

Two independent verifier passes ran; the second returned COMMIT-READY conditional on pathspec staging, with six
findings, none a hard-stop or gate failure.

---

## Owner rulings already made, do not re-litigate

| Item | Ruling |
|---|---|
| Permits and zoning content (T-049) | **KILLED** on legal risk. Largest cluster the rival has zero of, deliberately ceded. Marked do-not-re-raise. |
| WV and Lexington city pages | **APPROVED and built** |
| Rent-to-own vacuum | **Plan and execute**, Phases 1 and 2 drafted, Phase 3 gated |
| Weight, tare, pallet capacity (T-047) | **Deferred to its own session.** Still rated the highest-strategic-fit gap found. |
| Accessories (T-050) | **Deferred** to a vendor plus backlink planning session |
| Nationwide reach | Capability confirmed. **Local dominance remains the strategy** (T-072). Do not read nationwide delivery as a mandate for national pages. |
| UDO v2.2 migration commit | **Deferred** (T-075) |
| Schema understating reach | **Approved and fixed** (T-073) |

---

## Ready to execute, no decision needed

- **T-078**: `src/lib/schema/howto.ts:114` still emits "We serve 250 miles from Cincinnati" in JSON-LD, live on
  `/cost/`. One string, same class of defect the owner already approved fixing.
- **T-101**: `SiteFooter.astro:11` links to `freedomconex.com/` rather than the tracked `/doug` route, so footer
  traffic is uncredited. Its `rel` also carries `noreferrer`, which additionally defeats the secondary trail in
  T-103. Settle T-102 first so the link is pointed at the right thing once.
- **T-104**: `submit-quote.ts:143-145` falls back to `seller@example.com` if `SELLER_EMAIL` is unset in
  production, silently losing the email half of every lead record. Verify the env var, then consider failing
  loudly instead.

---

## Drafted and awaiting a pick, not yet applied

- **RTO Phase 1 and 2** at `.outputs/rto-rental-vacuum/2026-08-11-phase1-phase2-drafts.md`. Two labeled variants
  for the owner to choose between, plus a shared-module proposal. **Read T-062 first:** the rent-to-own page
  renders `<p>{f.a}</p>` with no `html` branch while the product hub has one, so a shared module exporting an
  `html` key would have it silently dropped.
- **The rental resource page.** Design at `.outputs/rental-resource/` alongside a verified provider dataset.
  **Three owner rulings gate it (T-082)**, one of which is a genuine gate: no quarterly maintenance commitment
  means do not build it.

---

## Two process defects to fix early

**Priority is no longer information (L013).** 55 of 104 todos are marked high. Re-rank against a cap of roughly
seven, demoting the rest with their reasoning intact. Cheap, and it makes state usable again.

**Timestamps were interpolated, not read (L014).** Earlier `last_updated` values ran up to eight hours ahead and
a calendar day wrong. Corrected at session end. Run `date -u` before writing any timestamp into a durable
artifact.

---

## Standing constraints that shaped everything here

- **PROJECT_HS_002 delegation is ACTIVE but re-asked every session.** This harness defaults to no Agent-tool use
  unless the user requests it, and the ruling is deliberately scoped to one session. Ask at orientation. Two
  consecutive sessions have now reached the same answer from two different models; the durable fix is a line in
  `CLAUDE.md` or `.claude/settings.json` (recommended in `decisions/2026-08-10-delegation-mode-ruling.md`).
- **The keyword data trust hierarchy.** The owner has verified SpyFu-style volume estimates wrong against his own
  real Ads data. Use them as a competitive map only: presence, rank, ranking URL, change over time. Never sort or
  prioritize by volume. Where a volume figure would be decision-relevant, say it needs a Keyword Planner check or
  a live Ads test.
- **Pricing.** Average prices are permitted on the homepage, product and size pages, and use-case pages, sourced
  from `src/data/pricing.ts` with the standard disclaimer. **Never on city pages.** No fabricated figures.
- **PROJECT_HS_003.** No permit, zoning, classification, tax, insurance, or structural determination in either
  direction, on any surface, with special force in schema, headings, meta, alt text, and table cells.
- **Check `.agents/<name>.md` before writing a brief (L011).** Three agents this session were briefed to do
  things their tool grants forbid.
- **HS-OUT-001.** No em or en dashes in output or committed files. Verify one pattern per character (L003); a
  combined grep silently false-passes on macOS BSD grep.

---

## Reading order for the full record

1. This file.
2. `PROJECT_STATE.json`, 104 todos. **Grep it rather than reading it**; several task strings exceed the Read
   tool's line truncation.
3. `.project-catalog/sessions/2026-08-11-session-log.md` and `2026-08-10-session-log.md`.
4. `.checkpoints/2026-08-11-1300-session-end-three-workstreams/checkpoint.md` for repo state and rollback.
5. `.project-catalog/decisions/`, six records from this session.
6. `LESSONS_LEARNED.md`, L001 through L014.
7. `.project-catalog/history/2026-08-09-2325-session-transcript.md` if you need the full narrative. It is long.
8. The readable owner-facing summary: `https://claude.ai/code/artifact/41b82847-3c42-425a-8e45-8551db323419`
   (covers through the competitive analysis; the Freedom Conex findings postdate it).
