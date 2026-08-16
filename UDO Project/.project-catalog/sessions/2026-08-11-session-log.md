# Session: 2026-08-11

Tags: #container-shelter #permits #compliance #gates #schema #build-guard
LLM: Claude Opus 5, 1M context (claude-opus-5[1m]), Claude Code CLI
Continuation of the session that opened 2026-08-09 23:25 local. Single transcript per HS-UDO-012:
`.project-catalog/history/2026-08-09-2325-session-transcript.md` (Responses 1 through 18)
Prior logs this session: `.project-catalog/sessions/2026-08-10-session-log.md`
Branch: main. HEAD: 544077b. Working tree carries the uncommitted rework; **nothing committed all session.**
Topic slug: container-shelter

## Summary

The 2026-08-10 permit rework was integrated across four site files and four spec documents, then independently
verified and guarded. The verification is the story: an adversarial verifier pass and a purpose-built guard test
between them found a live hard-stop violation on the homepage that the original inventory had declared
impossible, five regressions the rework itself introduced, and two previously unknown violations including one on
a published blog post. The authorized scope is clean and provably so. The site is not yet compliant, and the
inventory's own conclusions had to be corrected.

## Work Completed

- Integrated all four approved drafts across `src/pages/for/{businesses,farmers,homeowners}/index.astro` and
  `src/data/containers.ts`, plus T-015 variant C. 28 insertions, 21 deletions.
- Amended four git-tracked spec and plan documents (373 insertions, 44 deletions), marking rather than silently
  rewriting so the correction is visible to future readers.
- Built the T-025 compliance guard test (`src/lib/compliance/hs003-content-guard.test.ts`, 1219 lines) with a
  `test:hs003` script.
- Ran an adversarial verifier pass across all six gates, eight checks.
- Wrote the correction block into the violation inventory retracting three false claims.
- Dispatched fixes for the five introduced regressions plus the homepage violation. **In flight at log time.**

## Mode Usage

- RC Mode: the verification and guard-design work. Every finding carries file, line, and reproduction.
- Persona Mode: the copy rework, bounded by the approved drafts and the six gates.
- Handoffs: none formal. The drafts functioned as the constraint documents.

## The finding that matters most

**`src/components/home/HeroSection.astro` lines 46 and 55: `Most farm storage is <em>zoned exempt</em>`.**
Live, rendered twice in `dist/index.html`, present at 544077b. Orchestrator confirmed all three facts
independently, case-insensitively, before relaying.

It falsifies three claims the 2026-08-10 inventory made and that the orchestrator relayed to the owner as
findings:

1. "The homepage is clean." It is not. `homeFaq.ts` is clean; the hero component is not.
2. "`src/components/` contains no permit, classification, tax, or structural copy."
3. "Category 4 zoning outcome claims: ZERO." The grep was "by right / no variance / grandfathered". The live
   phrase is "zoned exempt".

And it falsifies the inventory's headline structural conclusion, **"No shared component is the source, the fix
cannot be centralized."** The per-file rework remained correct for the 12 items it covered, but the reasoning
that produced it was incomplete, and **12 was an undercount.**

Self-referentially: that same inventory warned that a quantifier makes a claim "worse than an unqualified one
because it sounds researched," then reported a category empty on the strength of a three-phrase grep. The
homepage instance carries the same quantifier, is `<em>`-emphasized, has zero attribution, and lives in a
scrolling ticker where no caveat can travel with it.

Correction block written to the top of
`.outputs/container-shelter/2026-08-10-permit-gate-violation-inventory.md` so the next session cannot inherit
the false claims as fact.

## Verified clean, with direct evidence

All 12 original hard violations gone from source AND from all 335 files in `dist/` including `_worker.js` and
`llms.txt`. The businesses twin-string invariant holds at 1026 characters in source and in built HTML, and the
verifier extended the check to all 10 answers on all 4 persona pages: zero mismatches. `faqs` length and order
identical to 544077b everywhere, so the QuickFacts slice still feeds the same answers. Do-not-touch list
verified by SHA-256 across 12 files. `UDO Framework/` untouched. Gate 5 measured on the added diff side only,
one pattern per character per L003, plus a Unicode-category sweep for exotic dashes. Build exit 0, 51 pages.
`tsc` exit 2 with one error, pre-existence proven rather than assumed.

## Decisions Made

1. **Integrate all four drafts as one commit** (owner). Both content agents had independently flagged that
   businesses and farmers must ship together or the JSON-LD would contradict itself across pages.
2. **Clean the four spec/plan docs, and build the guard test** (owner). The guard had been declined earlier;
   the owner reversed on new evidence, which was legitimate rather than a change of mind: the violations turned
   out to have a written source a hard stop cannot police.
3. **T-015 variant C** (owner), folded into the same commit.
4. **Fix all five introduced regressions before committing, and fix the homepage violation in this batch**
   (owner).
5. **Reserve the published blog structural claim for owner judgment** (orchestrator). The guard agent called it
   a genuine judgment call rather than a defect, and it was excluded from the fix pass rather than decided.
6. **Do not wire a `prebuild` hook yet** (guard agent, endorsed). The guard is legitimately red, so wiring it
   would block Cloudflare deploys before the findings are adjudicated.

## Agents Used

Eleven dispatches this session, all `.agents/`, all reporting with per-gate evidence:

- **astro-developer x4** (integration): farmers page including variant C (27 tool uses); businesses page,
  which delivered the twin-string proof (33); homeowners plus `containers.ts` (24); the four spec docs (86).
- **astro-developer** (guard test, 71): built a shape-based detector, not a blacklist.
- **verifier** (79): adversarial framing, eight checks, produced 8 findings that four success reports missed.
- **content-writer and frontend-designer**: the fix pass, **in flight at log time.**
- Earlier the same session: data-auditor, strategist, and 3x content-writer for the drafts (logged 2026-08-10).

Orchestrator performed zero execution work per HS-EXEC-001 and L002. Its hands-on output was the audit trail
plus three independent spot-checks of agent claims.

## Checkpoints Created

- `.checkpoints/2026-08-10-0510-permit-rework-authorized/checkpoint.md`, amended twice during the day rather
  than rewritten: once for the over-scoped gate 4 correction, once for the scope addition when variant C, the
  spec docs, and the guard entered scope.

## Blockers/Issues

1. **The site is not compliant and the topic must not be closed as such.** T-031 (homepage) plus T-035 (two
   blog posts, one published) are live violations. Fixes for T-031 are in flight; T-035(b) awaits owner
   judgment.
2. **Five regressions were introduced by the rework** (T-032), including a cross-page factual contradiction
   with a physical-safety edge: businesses now says 40ft units generally lack forklift pockets while
   contractors still instructs a crew to reposition using them, both in JSON-LD. Fixes in flight.
3. **The guard test is red**, correctly, and therefore not wired to the build (T-036). It cannot be wired until
   the findings are adjudicated.
4. **No test CI exists at all.** `.github/workflows/` holds only the Supabase keep-alive, so nothing runs the
   existing 137-test suite automatically. Larger gap than the guard wiring.
5. **Nothing is committed.** The working tree holds all of it plus one staged deletion. Three separate agents
   flagged the non-empty index unprompted; the commit must use explicit paths.
6. **Orchestrator errors this session, all disclosed at the time:** gate 4 was over-scoped against standing
   pricing policy (caught by a subagent); the spec-doc brief named 6 instances where 28 existed; the
   "compliant model" claim at `shipping-containers-for-sale:38` was propagated into three briefs unverified and
   turns out to be weaker than the standard the rework set (T-034); a case-sensitive grep produced false
   reassurance about a vendor citation (L010); and a session log claimed a lesson was promoted before the
   lesson was written.

## Lessons

Promoted this session, all in `LESSONS_LEARNED.md`:

- **L009:** a verification step can fail falsely, not just pass falsely. A draft's own self-check subtracted an
  occurrence count from a line count, and following it literally would have reported a perfect paste as broken.
  A self-check handed forward by an agent is a claim to verify, not a spec to obey.
- **L010:** case-sensitive spot-checks produce false reassurance, in the direction of reporting less risk than
  exists.

Not yet promoted but earned, and recommended for the next session: **keyword enumeration failed six separate
times this session** (`containers.ts:41`, the second claim in `businesses:126`, the stacking claims at
`farmers:53`, the four ag-exemption passages in the specs, `zoned exempt` on the homepage, and
`can still carry a load` on a published post). Three of those lists were written by the orchestrator after it
had already been burned. That is the strongest argument for the guard and belongs in the lessons file as its
own entry.

## Next Session Should

1. **Collect the two in-flight fix agents** (content-writer, frontend-designer) and review their output.
2. **Decide T-035(b)**, the published post's "can still carry a load". Owner judgment, deliberately not decided.
3. **Re-run the verifier and the guard** after the fixes land. Do not commit on the strength of the earlier
   PASS; the tree has changed since.
4. **Then commit**, with explicit paths, covering the four content files, four spec docs, the guard test, the
   `package.json` line, and the staged `.bak` deletion.
5. **Then wire `prebuild`** (T-036) once the guard is green, and consider a test CI workflow.
6. Still open and untouched: T-023 (resolved), T-026 (payload/tare), T-028 (Cor-Ten and iContainers), T-029,
   T-030 (dash sweep, now with a known inconsistency to align), T-033, T-034, T-020, plus T-012 through T-014
   from prior sessions and the 111-item blog backlog.

---

# EXTENSION: the rest of 2026-08-11

The log above was written mid-session at the first Stop-hook gate and covers only the permit compliance work.
Two further workstreams ran afterward. Session ended 17:00 UTC at 83 percent context, by owner request, so work
was stopped deliberately rather than truncated. **`UDO Project/HANDOFF.md` is the entry point for the next
window.**

## Workstream 2: competitive gap analysis (slug `competitor-gaps`, now REPORTED)

Owner supplied a Screaming Frog crawl of Conextalk and SpyFu exports. Three agents mapped in parallel:
Conextalk's architecture, the competitor keyword footprint, and our own coverage baseline.

**The premise inverted.** The owner opened with "Conextalk is beating us." The maps found the opposite on
content: they have 100 indexable pages and 589 keywords against our 43 pages, four blog posts whose newest is
roughly 11 months old, a FAQ page with **one question**, and **zero FAQPage schema** against our 28 pages. No
size guide, cost page, permits page, buying guide, or persona pages. What actually beats us is transactional
surface (62 priced SKUs with live prices in `Product` + `Offer` schema), accessories (36 to 40 percent of their
entire search footprint), and credential moats.

**The structural gap in one sentence: we have no city x size intersection at all.** City is one axis with 15
pages, size is another with 3, and they never meet. Conextalk has 22 such pages.

**The cheapest win found, and verified independently:** every city record carries an `areaProfile` field of 60 to
120 words of specific local detail, and a `geography` object. **Neither is rendered anywhere.** `areaProfile`
appears 14 times in `cities.ts`, once in its test, and in **zero** built HTML files. Roughly 800 to 1,500 words of
already-authored local content sitting unpublished, on exactly the axis where the competitor is weakest.

**Owner ruled on all five gaps in one pass** (`decisions/2026-08-11-competitor-gap-rulings.md`): WV and Lexington
proceed; weight/tare/pallet deferred to its own session though still rated the highest-fit gap; the rent-to-own
vacuum planned and partly executed; accessories deferred to a vendor plus backlink session; and **permits KILLED
on legal-risk grounds**, which cedes the single largest cluster the rival has zero of. That kill is consistent
rather than merely cautious: the same session built PROJECT_HS_003 specifically to stop making the claims that
cluster rewards.

**Then built:** Huntington WV and Lexington KY city pages, 11 files, matching the Columbus precedent exactly. The
research pass flagged serviceability as an owner fact and the owner cleared it (nationwide delivery from any hub),
while separately confirming that **local dominance remains the strategy**, so nationwide capability was explicitly
not read as a mandate for national pages.

**Also fixed:** the service-area schema, which claimed a 250-mile circle around Cincinnati and meant the Houston
page was claiming an area that geometrically excluded Houston. Now `[GeoCircle(250mi), Country(US)]` with a test
that fails if either half is later dropped.

## Workstream 3: the Freedom Conex relationship (owner-initiated, and it outranks the rest)

Started as a pricing question and became a commercial risk assessment.

**Rent-to-own payment data.** The owner supplied figures from the partner's affiliate checkout. Caught a data
error before publication: one row showed the monthly payment FALLING when delivery was added, which is impossible.
Then found the bigger problem, that **the figures are Atlanta prices**, location-set by IP, and would be wrong for
every customer SBD serves. Recon then established the payment is **strictly proportional to the delivered total**,
with a divisor of 22 fitting both observed points under either rounding rule and a hidden fixed fee ruled out by
testing the intercept. So SBD can compute rather than copy, which survives a supplier change where a copied number
does not.

**The strategic card.** The partner's product pages ship `Loading pricing...` in the initial HTML and inject prices
client-side, and their `robots.txt` disallows `/api/`. **So their entire location-priced catalog is invisible to
search engines and AI crawlers.** That inverts the ask from "may we borrow your numbers" to "we can make your
pricing citable where you currently do not exist."

**Attribution.** The owner found the affiliate link 307s to a bare `/shop` and reported no cookie. **A cookie
exists**, `fc-rep=doug`, flagged `HttpOnly`, 90-day window, reproduced three times. `HttpOnly` is precisely why a
JavaScript check reports absence. I had endorsed the owner's conclusion and then instructed the running agent to
treat it as settled; **the agent rejected that correction with the header reproduced, which is the only reason the
error did not reach a commercial decision.** Promoted as L012.

**The phase-out worry resolved toward the reassuring reading.** `/doug` returns 200 and **so does `/chelsea`**,
while four control paths 404. An explicit allowlist, and SBD is not the only holder. But a third reading fits best:
the partner runs a **person-level** distributed channel, and first-name routes with no branding, territory, or
partner status are how an interchangeable rep is treated rather than a regional partner. Intent remains Grade C and
no public source can move it.

**The two findings that outrank everything else, both orchestrator-verified:**

1. **`container-buying-guide` lines 57 and 81 attribute a 2009 founding to Freedom Conex.** Their own materials say
   2023 and BBB records incorporation as 2023-08-01. The date is real but belongs to SBD (`entities.ts:72`). It
   sits on the page arguing "find out who you're actually buying from."
2. **`terms.astro:16` asserts an agency the partner's own terms do not grant.** Their Terms, effective 2026-01-01,
   authorize no outside party and reference only "associated sales reps."

Full exposure inventory: ~15 live files, with `public/llms.txt:44` and the two `parentOrganization` assertions the
likeliest to be missed since neither renders on a page. Plus 10 files carrying the partner's warranty as SBD's own
promise, which is the harder half because those are commitments to customers.

## Additional decisions and artifacts from the extension

Decisions: 5 records total this session, verified by listing. Outputs persisted to
`.outputs/competitor-gaps/` (3 documents), `.outputs/rto-rental-vacuum/` (2), `.outputs/rental-resource/` (2), and
`.outputs/geo-wv-lexington/` (1). **All of those sit in a gitignored directory, which is open item T-054.**

## Lessons from the extension

**L011** check an agent's tool grant against the brief in both directions, after three briefs this session asked
agents to do things their grants forbid. **L012** a more realistic instrument can be blind where a cruder one sees,
and an agent pushing back with evidence is the system working. **L013** priority stops being information when 55
of 104 todos are high. **L014** stamp real times or none, after `last_updated` values ran up to eight hours ahead.

## Blockers carried into the next session

1. `.outputs/` gitignored and already effective (T-054). Most time-sensitive.
2. The 2009 attribution error (T-105) and the agency assertion gap (T-106).
3. Commit with explicit pathspecs only; 12 of 48 tracked modifications belong to the batch.
4. 55 of 104 todos marked high; re-rank against a cap of roughly seven first (L013).
5. Three rulings gate the rental resource page (T-082), one a genuine gate on quarterly maintenance.
6. RTO Phases 1 and 2 drafted and awaiting a variant pick; read T-062 first.

## Files Changed

Created:
- `src/lib/compliance/hs003-content-guard.test.ts`
- `.outputs/container-shelter/2026-08-10-rework-{businesses,farmers-homeowners,containers-data}.md`
- `.project-catalog/decisions/2026-08-10-sitewide-permit-rework-authorized.md`
- `.checkpoints/2026-08-10-0510-permit-rework-authorized/checkpoint.md`
- this session log

Modified (all UNSTAGED unless noted):
- `src/pages/for/{businesses,farmers,homeowners}/index.astro`, `src/data/containers.ts`
- `docs/superpowers/specs/2026-05-25-product-pages-design.md`,
  `docs/superpowers/specs/2026-06-04-use-case-pages-design.md`,
  `docs/superpowers/plans/2026-05-25-product-and-city-pages.md`,
  `docs/superpowers/plans/2026-06-04-use-case-pages.md`
- `package.json` (one script line)
- `UDO Project/HARD_STOPS.md` (PROJECT_HS_003), `LESSONS_LEARNED.md` (L007 through L010),
  `PROJECT_STATE.json` (T-016 through T-036), `TOPICS.md`, the inventory (correction block)

Deleted (STAGED): `src/pages/permits/_index.astro.bak`

No Framework files modified (HS-UDO-014, HS-UDO-016), verified by mtime.
