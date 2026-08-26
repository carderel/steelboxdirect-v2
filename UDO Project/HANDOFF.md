> ## CURRENT AS OF 2026-08-26. Everything below this block is older and partly superseded.
>
> **LIVE AT `03ec219`. `main == origin`. Site at 62 routes, 435 tests, guards green.**
> The working session ran 2026-08-21 through 2026-08-26 (~24 production deploys, all
> owner-authorized and live-verified). Read the session logs `sessions/2026-08-21` through
> `2026-08-26-session.md` and transcripts in order; `PROJECT_STATE.json` todos carry the
> full per-item record (T-155 through T-171).
>
> ### What is LIVE now that was not on 2026-08-20
>
> 1. **Product pages rebuilt (T-171, the big one).** Amazon-style listing hero (photo left,
>    buy box right; mobile order title-image-info), feed price + expanded disclaimer (ZIP
>    drives delivered price, talk to Doug), TWO-DOOR action block: "Have Doug call me"
>    3-field callback form POSTing leadType 'callback' to /api/submit-quote (EMAIL-ONLY, no
>    DB write, subject CALLBACK REQUESTED) + full-quote door with ?size= preselection.
>    Comparison = table desktop / cards mobile from ONE compareRows source. The clearance
>    plate section is HIDDEN (SHOW_CLEARANCE_PLATE=false) after two rejected drawings;
>    owner is generating textless Gemini illustrations (prompts in
>    .outputs/image-prompts/2026-08-26-clearance-plate-*.md); dimensions overlay in code on
>    return. Interim hero photo = the real 40ft HC on a trailer, honestly captioned.
>    **PENDING: the owner-visible live callback E2E test with Doug. Requested, not yet run.**
> 2. **"Two ways to start" popup on 52 of 62 pages** (was 5): exclusion-list default
>    (quote/tool/legal pageTypes + size/index), stuck-open-on-hero-less-pages script fix.
> 3. **The inspector finder** `/find-a-container-inspector/` (guide #11): all 98 US IICL
>    inspectors from the owner's manual directory pass, state-grouped, attributed, 16-test
>    integrity guard. Canonical data: .outputs/research/2026-08-25-iicl-inspectors-clean.csv.
>    QUARTERLY re-verification due ~2026-11-25 (runbook: 2026-08-25-iicl-enumeration.md).
> 4. **Certification authority cluster (T-163):** /container-certification-guide/ (guide #10)
>    + blog post, 49 CFR / COA TG03 / Hapag-Lloyd primary-sourced. Owner wants 3-4 more
>    posts (next: BIC self-check walkthrough; the 98/4 scarcity story is now first-party).
> 5. **GKP coverage fix (T-169):** hub + product titles carry "Used", six-synonym lede,
>    NEW /conex-boxes-for-sale/, one-trip section on /condition/, job-site office section
>    on /for/contractors/, ~36k/mo serviceable vocabulary closed.
> 6. **Portable-storage package (T-161):** guide #9 + /cost/ math-flips module + 4th FAQ on
>    all 15 city pages. **Dimensions post rebuilt (T-162)** on a primary-source audit +
>    approved FIG plates. **City Quick Facts show all 3 sizes** with ZIP per cell.
> 7. **Integrity:** fabricated 2026-03-10 publish dates replaced with git-true dates +
>    permanent guard (T-166); blog date UTC display fix; breadcrumbs GSC fix live.
> 8. **Social/entity:** Pinterest + YouTube in sameAs + footer; p:domain_verify live;
>    homepage hero = the YouTube blueprint video; 6 rto images integrated (slot 3 tilt-bed
>    still owner-owed).
>
> ### Standing rulings made this stretch (do not relitigate)
>
> - **strongconex.com: PARKED.** Not aged (born 2024-05, dropped, re-registered fresh),
>   backlinks are pure spam (both SEMrush exports analyzed). NEVER 301 it into SBD, never
>   in schema/NAP. Brainstorm open at the capital-appetite question.
> - **Ads play: SHELVED by owner.** Demand validated (~320k/mo national buy-intent) but
>   dead on the $30/sale take ($63-667 ad cost/sale). Do not re-raise; he brings the number.
> - **Email channel split:** directories use info@, site publishes support@. Deliberate.
> - **AI images may NEVER serve as photos of reality** (honest-wear gallery, customer
>   photos). The owner's 15 Gemini wear images were refused on C2PA evidence; the shot
>   list (.outputs/content/2026-08-25-wear-photo-shot-list.md) needs a phone at the yard.
> - **SBD's own 35 SEMrush backlinks = scraper/template noise.** Benign, no disavow.
>
> ### Owner's desk (the entire critical path is his)
>
> 1. LIVE CALLBACK E2E TEST (his phone number, Doug watching the inbox) - closes T-171.
> 2. Yard photo shoot (one session covers the wear gallery + per-size product heroes;
>    the FC condition-card raw originals from Doug include a real 20ft).
> 3. Three Gemini clearance illustrations (prompt files ready, save-as names inside).
> 4. VRTO guest post live date from Ryan -> starts the 10-day clock for the SBD-side post
>    (draft ready: .outputs/content/2026-08-21-vrto-guest-post-shed-vs-container.md).
> 5. Maps rank recheck ~2026-09-04 (Cincinnati money keyword vs the #23 baseline, GBP
>    category changed 2026-08-21). Also standing: tilt-bed rto image, info@ routing test,
>    GSC Validate Fix click, Pinterest claim + Facebook About checks.
>
# HANDOFF: start here for the next context window

> ## CURRENT AS OF 2026-08-20 ~21:50 UTC. Everything below this block is older and partly superseded.
>
> **LIVE AT `2dff5df`. `main == origin`. Site at 57 routes.** Eight commits shipped
> (`014472f..2dff5df`), every one owner-authorized in-session, all live-verified on production.
> The session that shipped them opened 2026-08-19 evening and is logged at
> `sessions/2026-08-20-session.md` (plus the closed morning session at `2026-08-19-session.md`);
> the transcript is `history/2026-08-19-1855-session-transcript.md`, 25 cycles.
>
> ### What shipped, in one pass
>
> 1. **/rent-to-own/ rework to the owner's own review** (`549fa61`). My Container Rental is
>    consolidated to ONE sanctioned FAQ answer ("Who is the third party application
>    administrator?"). That answer legitimately renders three times in built HTML (visible FAQ,
>    FAQPage JSON-LD, Quick Facts) with two in-answer mentions each, so grep finds SIX; the owner
>    ruled keep. Approval framing is visually muted per his spec (14px/10px, no background,
>    #b1aca3, deliberately low contrast, do not "fix"). "Pick Your Term" replaced the runway
>    metaphor. T-153, T-063 closed.
> 2. **Site-wide dash purge** (`9b24a32` and riders). 642 em and en dashes plus entity forms
>    cleared; source and dist at ZERO. Sole exception: the untracked owner-reserved draft. T-112,
>    T-077, T-030 closed.
> 3. **Every 2009 founding claim removed** (`8cd05f6`). The owner could not substantiate the date
>    ("not sure where Doug came up with 2009"), so schema `foundingDate` is gone and a guard test
>    asserts it never returns. **No founding year may be stated anywhere, for SBD or for Freedom
>    Conex.** T-105 closed.
> 4. **Guards wired into the build** (`e95e693`). `npm run build` now runs the HS003 guard plus a
>    new dash guard before astro build; a violation fails the Cloudflare deploy naming file:line.
>    T-036 closed. Known guard limits still open: T-114 (flat-assertion blind spot), T-117
>    (near-neighbour false positives).
> 5. **/ai-info/ AI fact sheet** (`1a544cd`). Built from a seven-item owner interview with zero
>    invented facts and zero skipped items. Prices interpolate from `pricing.ts` (never hardcoded),
>    WebPage schema only (FAQPage deliberately withheld to avoid duplicate-schema suppression),
>    footer anchor "Information for AI assistants", llms.txt entry with the UTM citation format.
>    Interview record: `UDO Project/.outputs/ai-info/` (gitignored, THIS MACHINE ONLY, see T-142).
> 6. **HS003 guard comment-parity fix** (`61aa149`, T-146): comments stripped string-aware before
>    literal pairing, six regression tests, header rewritten (T-135).
>
> ### The deploy failure worth remembering
>
> The FIRST CI build failed: `dash-guard.test.ts` asserted its exclusion entry (the untracked
> draft) exists on disk. True locally, false in Cloudflare's git checkout, so the guard failed its
> own staleness test and blocked the deploy. Fixed forward in `2dff5df` (tracked exclusions must
> exist; untracked-by-design ones may be absent), proven by parking the draft and running the guard
> both ways. **LESSON: test any build gate against a clean git checkout before shipping it;
> untracked files are the canonical local-vs-CI difference.**
>
> ### Fact rulings from the owner interview, binding on all future copy
>
> - GBP: **5.0 stars, 11 reviews** (owner screenshot), veteran-owned, **daily 9 AM to 9 PM
>   Eastern**, service-area profile with no street address BY DESIGN. Primary category is
>   currently "Storage facility", which is the T-155 problem, not a fact to repeat.
> - Doug: **"more than eight years in shipping, packaging, and logistics."** Never nine, no start
>   year, and 2009 was never his date.
> - SBD is a **brand name, not an entity**; no entity-type claim anywhere. Sales entity is Freedom
>   Conex LLC per the terms wording. Supplier portability is deliberate (owner owns domain + work).
> - Canonical consistency phrase: **"shipping containers for sale in Ohio, Indiana, and
>   Kentucky."**
> - Locked review quotes with first-name attribution: William (McCune), Jason (Abdalla), Steve
>   (Novak). The two friend-of-Doug reviews are deliberately unused.
> - "My Container Rental" appears ONLY in the one rent-to-own FAQ; every other surface says
>   "independent third party administrator."
> - The delivery-service sentence is owner-confirmed verbatim: "Steel Box Direct is a
>   delivery-based service with no walk-up location or sales yard; containers are delivered to the
>   buyer's site, or picked up at partner depots by arrangement."
>
> ### Awaiting the owner
>
> 1. **LinkedIn fix, he committed to it:** the company description says "shipping-inspection
>    ready", which contradicts the terms' "not certified for ocean shipping."
> 2. **T-155:** Maps ranks SBD #23 for "shipping container for sale" Cincinnati while the GBP
>    category is "Storage facility". Switching the primary category to a container-sales category
>    is likely the biggest local-pack lever available.
> 3. **Rent-to-own images:** prompts ready at
>    `UDO Project/.outputs/image-prompts/2026-08-19-rent-to-own-image-prompts.md` (hero first).
> 4. **T-142 got more expensive:** the AI-info interview record and this session's research live
>    only in gitignored `.outputs/` on this machine.
> 5. **Recommended next build:** competitor comparison pages (vs Container One, vs ConexTalk),
>    set up by /ai-info/'s named-alternatives list.
> 6. **T-143 new-condition containers** still pinned; when they launch, /ai-info/'s one-grade
>    lines and its last-updated date need one edit.
>
> ### Unchanged landmines
>
> Both untracked files stay untracked (blog draft, supabase-keepalive.yml); add `.github/` files by
> full path only; the 34 legacy deletions stay unstaged; README/START_HERE migration edits stay
> uncommitted (T-075). This handoff block and the post-release PROJECT_STATE/transcript updates are
> LOCAL and ride with the next `docs(udo)` commit.

---

> ## SUPERSEDED: CURRENT AS OF 2026-08-19. Everything below this block is older and partly superseded.
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
