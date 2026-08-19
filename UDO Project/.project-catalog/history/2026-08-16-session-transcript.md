# Transcript: 2026-08-16

Companion to `.project-catalog/sessions/2026-08-16-session.md`. The log is the entry point; this file is
the append-only cycle record.

---

## Cycle 1, resume and state reconstruction

**Prompt:** `resume`

Read, in this order: repo root listing, `UDO Project/` listing, `2026-08-14-session.md`,
`PROJECT_STATE.json` field dump, `pending-work` memory.

Findings:

- `pending-work.md` is **twelve days stale** and describes 2026-08-04 as the present. Not used.
- Live at `0b63011`, three commits unpushed. Verified with `git log origin/main..HEAD` and `git status -sb`,
  not taken from the log's assertion.
- Six items were parked for the owner by the 08-14 close.

Verification of the T-107 mechanism before putting it to the owner:

```
UDO Project/PROJECT_STATE.json                        -> NOT IGNORED
UDO Project/LESSONS_LEARNED.md                        -> NOT IGNORED
UDO Project/.project-catalog/sessions/2026-08-14-...  -> .gitignore:41:.project-catalog/
UDO Project/.checkpoints                              -> .gitignore:37:.checkpoints/
```

This **corrects** the prior record's "gitignored wholesale" claim. Two unanchored patterns, applied at
every depth, are the entire mechanism.

Secret pre-scan across `UDO Project/` (389 files, 4.1MB):

```
== PROJECT_STATE hits ==     1 RESEND_API_KEY    1 SUPABASE_SERVICE_ROLE_KEY
== ckpt+decision hits ==     1 RESEND_API_KEY    2 SUPABASE_SERVICE_ROLE_KEY
```

Variable names only, no values. Safe to track.

Also pulled `git show 5a7422e` in full, to hand the contrast agent a concrete model rather than a
description of one.

## Cycle 2, owner decision set

Four questions in one call. Answers:

| Item | Answer |
|---|---|
| Push the three commits | **After** the contrast fix, one deploy |
| KOI Rental | **Confirmed trading, publish** |
| Five remaining contrast failures | **Fix only FaqSection**, accept the other four |
| T-107 audit trail | **Track it** |

## Cycle 3, dispatch

Tasks 1 to 4 created. Task 4, the push, blocked by 1, 2 and 3.

Three `astro-developer` agents dispatched in background. Shared constraints: do not commit application
code, do not push, no em or en dashes anywhere including code comments, leave the working tree dirty.

The git agent carried extra constraints, because it is the only one that touches the index while two others
are writing to the tree: explicit pathspecs only, `git add -A` / `git add .` / `git commit -a` named and
forbidden, the 34 deferred UDO deletions and the modified `README.md` / `START_HERE.md` to stay unstaged,
stop without committing if the independent secret scan finds a real value.

## Cycle 4, first agent returns

**FaqSection contrast: clean.** Build exit 0 at 55 pages, 224 passing 0 failing, one file modified, zero
dashes.

Two results worth carrying, both cases of the agent departing from its instructions correctly rather than
following them literally:

1. Instructed to mirror 5a7422e exactly. It did not, on one line, and was right. 5a7422e's
   `.big em{font-style:italic}` drops the colour, which is safe in that file because the shared rule has no
   colour. **Here the shared rule carries `color:var(--c5-permits)`**, so the literal mirror would have
   cascaded orange onto orange and made the word "everyone" invisible. It used `color:inherit`.
2. **`.sh .tg` still fails at 2.98:1** after the swap, because `opacity:.55` holds it down independently of
   the colour token. It declined to fix it and gave the reason: the identical opacity ships on
   `/locations/` and `/shipping-container-guides/`, so a one-page fix would re-create the very
   inconsistency this change was authorized to remove. Correct call. Logged in T-136 as a site-wide
   decision.

## Cycle 5, UDO compliance writes

Stop hook fired: no session log for 2026-08-16.

`PROJECT_STATE.json` updated surgically via script against a backup, not rewritten. T-107 to `in_progress`
with the corrected mechanism and the pre-scan result appended, T-124 closed on KOI, T-131 extended with the
one-of-five ruling, **T-136 created** for the four accepted failures plus the `.sh .tg` opacity question.
`notes` rewritten. Post-write guard: **0 em dashes, 0 en dashes** in the file.

Session log and this transcript created.

Two agents still in flight at the end of this cycle: KOI publish, and the gitignore anchoring commit.

## Cycle 6, KOI agent returns

**Published, counts reconciled, verified in built HTML.** `dist/container-rental-guide/index.html` now reads
"3 companies, rent only", "Three. Here they are." and "three names long". All three counts derive from
`publishedConexProviders` and updated themselves. A sitewide `dist` sweep for count phrasings returns
exactly one hit.

Five other instances of "two" on the page were checked and correctly left alone: two categories, two
sections, two rate publishers. None is a company count. This is the discipline that `0b63011` lacked.

`url` and `linkLabel` were **required**, not optional, by `rentalProviders.test.ts:62`. The agent used the
URL already verified HTTP 200 with no sale language in the 08-12 pass rather than inventing one.

Two items reported rather than changed:

1. **KOI is the only Section B card with no `Yard` fact**, while JOTS & SOTS shows `Ironton, Ohio`. The
   omission lets a reader infer Ohio by contrast. Research had recommended Florence KY appear next to the
   name. **Orchestrator decision: add it.** Publishing the card was authorized; making the published card
   accurate is part of doing that well, not a scope expansion.
2. `rentalProviders.test.ts:117` is titled for a rationale that is now spent. Logged as **T-138**.

## Cycle 7, git agent returns, and corrects my method

**T-107 committed as `ec2b470`**, 222 files, 15,379 insertions, on `5a7422e`, not pushed.

**The correction worth carrying: `git check-ignore` consults the index by default.** A path git already
knows about reports NOT IGNORED even when a pattern matches it. My cycle-1 check on the root dirs was
reading the wrong thing. `--no-index` gives the actual pattern decision.

The agent did not spot-check. It snapshotted the ignore decision for **all 9,381 paths** before and after,
which is the correct instrument for a change to a global rule. **577 paths ignored to visible, zero newly
ignored.** `backups/` still ignored, now via line 92 rather than the broad pattern.

Two things it surfaced that I had not asked about:

- **The UDO runtime block was never in HEAD.** It lived only in the working tree from `upgrade.py`, so
  committing `.gitignore` necessarily carries it. Correct outcome, but it happened as a consequence, so it
  is now recorded as deliberate.
- **~260 paths under `UDO-v4-LEGACY-DO-NOT-EDIT/` are now visible to a future `git add -A`.** It measured
  the impact as inert rather than guessing: zero tracked files, `git status --porcelain` byte identical
  before and after. Logged as **T-137**.

State write: T-107 closed, **T-137 and T-138 created**. 0 dashes.

## Cycle 8, yard fact and commit prep

Yard agent returned. One line added,
`{ k: 'Yard', parts: [{ text: 'Florence, Kentucky, in Boone County' }] }`, placed between `Rents` and
`Service area` to match the JOTS fact order. Build exit 0 at 55 pages, 224 passing.

**It named one yard, not two, and the reasoning is right.** The research attaches a county to the Florence
site and none to the Dixie Highway site. Naming the second would have forced either a broken
`City, State, in X County` shape or a county the file does not support. It also confirmed
`src/data/cities.ts:61` carries `Boone/Kenton/Campbell (KY)` in the Cincinnati list, so the placement is
legitimate on the repo's own definition. It deliberately omitted street, ZIP, hours, email and phone.

It flagged, out of scope, that KOI now has four facts to JOTS's five, lacking `Best for`. It declined to
compose one, because the research supports no claim about what KOI is best suited to. Correct.

Commit agent dispatched: two commits, explicit pathspecs, the 34 deferred deletions to stay unstaged.

## Cycle 9, commits land, and an honest disclosure

`8931176` contrast, `4d7f376` KOI. One file each, index clean after each, 34 deletions still unstaged,
`ahead 6`.

**The committing agent disclosed that it wrote the build and test claims into both messages as dictated,
without re-running anything.** That is exactly the L002 failure mode, volunteered rather than hidden. It
set the brief for the verifier: treat every claim in the set as unverified.

## Cycle 10, independent pre-push verification, nine checks

**VERDICT: SAFE TO PUSH.** All nine pass on independent evidence, nothing inconclusive.

Re-ran rather than trusted: clean `rm -rf dist && npm run build` exit 0 at 55 pages, 224 passing 0 failing.
Conex count three in all three rendered locations with 3 Section B cards backing it. Zero SBD prices on the
rental guide. Zero dollars across all 15 city pages. Zero credential values across 233 files and 15,529
added lines. Zero broken internal links across all 55 pages. KOI's URL live 200.

**It caught itself mid-error and showed the work.** A first-pass grep appeared to show a bare
`.big em{color:var(--c3-deliver)}`, which would have made 5a7422e a genuine regression by cascading blue
onto orange. Full-selector extraction showed the rules were `.loc-hero .big em` and `.outofarea .big em`.
Cleared with reasoning, not with a verdict.

**Two prior conclusions overturned, both instrument failures:**

1. **L017's draft-ships-into-the-bundle claim is FALSE.** The three chunks exist by name, which is what the
   08-14 check saw, but each is **63 bytes** reading `// Contents removed by Astro as it's used for
   prerendering only`. Title, description and body appear nowhere in `dist`. The check confirmed the chunks
   existed and never opened them. One `wc -c` would have settled it. L017 now carries a correction block,
   the original paragraph left standing so the error stays legible; T-036's point (b) annotated.
2. Earlier the same session, my own `git check-ignore` method was wrong for the same class of reason.

Also surfaced: `dist/locations/index.html`, the **hub**, renders `$0`. Pre-existing, byte identical to
`origin/main`, and the hard stop only ever covered city pages. But the phrasing this project keeps reaching
for, "zero dollar figures under `dist/locations/**`", is false and will stay false. Logged as **T-139**.

## Cycle 11, push and live confirmation

```
To https://github.com/carderel/steelboxdirect-v2.git
   0b63011..4d7f376  main -> main
```

Plain fast forward, no force marker. Three live URLs at 200. First live grep about a minute after push
still showed the OLD build reading `2 companies, rent only`; the second about 100 seconds later showed the
new one. **The live page now says three in all three places.**

**Orchestrator spot-check, and it was worth doing.** The push agent's report rendered the KOI card as
carrying the link label "Their Lexington rental page", which would have been a real error: a Kentucky
Cincinnati-metro operator mislabelled with another city, published live about a named third party. Fetched
the live page directly. **Refuted.** "Their Lexington rental page" belongs to the TEG Lease card
immediately above KOI, and both of KOI's `href`s point at `koirental.com/services-storage-containers` under
the label "Their storage containers page". The agent had run two adjacent cards together in transcription.
No live error. The card is correct.

That makes three agent claims checked independently this session and one of the three wrong, though wrong
in the report rather than in the work.

## Cycle 12, new thread, T-140 rent-vs-own calculator

**Prompt:** should the rental calculator move to its own page with unique content, linking back to the
rental guide?

Classified as a spike. Read `container-rental-guide/index.astro:334-387` and the page outline first.

**Answer: no to moving it, yes to building a different one.** The existing calculator is two inputs and one
multiplication, sitting immediately after the "24 payments made. Nothing owned." comparison. It is not a
tool on a page, it is the arithmetic beat inside the page's argument. Lifted out it is a commodity widget
on a thin page and the guide loses its beat.

**The real argument, which the question did not contain:** the guide's calculator is crippled by the
guide's own integrity constraint, and says so in its own copy. It cannot compare renting to owning. The
2026-07-09 pricing policy permits averages everywhere except city pages, so a both-sides-costed calculator
is permissible on a separate URL and forbidden inside the guide. The honest version of the calculation has
nowhere legal to live.

Owner: "Run with it. Get it to a mockup. Make sure to use SEO agents too."

## Cycle 13, parallel SEO and copy

Two agents dispatched together. **The SEO brief carried an explicit licence to recommend against
building**, because `pricing.ts`'s header shows `/for/homeowners/` and `/for/businesses/` already carry
rent-vs-own comparisons and the rental guide runs the argument as its spine. Fourth page, same intent.

**seo-analyst verdict: BUILD, conditionally, four load-bearing conditions.** The finding that decided it:
the three existing surfaces compare three DIFFERENT objects, a self-storage unit, leased square footage,
and a container rental with dollars banned by design. The dollar-quantified container-against-container
query is served by no page on the site. Locked: `/container-rent-vs-buy-calculator/` (the `rent` token
never stands alone, so the 08-14 URL-in-a-citation failure cannot recur), `kind: 'guide'` with `topic`
omitted, **zero price into JSON-LD**, no `guides.ts` entry, and a fourth `composeRentalStance` consumer
with a new question. It set a 90-day kill trigger.

**Two orchestrator corrections to that report.** It could not save its own file, because `seo-analyst` has
Read, Grep and Glob but no Write, so the document was transcribed by hand into
`.outputs/seo/2026-08-16-rent-vs-own-calculator-seo.md`. And its stated guard baseline of "1 failing, 2
findings" is the PRE-08-14 state; the guard is green at 0, so any finding from this page is new.

**content-writer** delivered copy plus seven open questions left unsmoothed. Its load-bearing assumption,
that the purchase average already contemplates delivery, was **verified true** by the orchestrator against
the live disclaimer: "it depends mostly on how far we deliver ... a real, all-in number". So no
purchase-side delivery field, and the rental-side asymmetry becomes the page's most useful honest point.

## Cycle 14, mockup

`frontend-designer`, one self-contained 83KB file, nothing under `src/`. Orchestrator verified
independently: **0 em dashes, 0 en dashes, 0 U+2212, 0 CSS escapes, 0 external requests**, `src/` and
`public/` clean.

**It reported failing a constraint rather than hiding it.** The 700 to 900 word ceiling versus "do not
rewrite the copy" are incompatible: the copy doc carries roughly 1,800 words. It compressed layout as far
as honesty allowed, landed at 1,121 running words, said so plainly, and supplied a specific 220-word cut
list that reaches 926. Correct behaviour.

It also caught a term collision the two agents created between them: the copy says "crossover" throughout,
the SEO lock says the page owns "break-even". It used break-even in every locked surface and left body
prose verbatim, then flagged the split for a sweep.

Sent to the owner for review.

## Cycle 15, owner feedback, mockup revision, and a new strategic thread

Owner on the mockup: "needs some love from the design skill ... 'Do the arithmetic yourself' has a lot of
black in it ... also needs photos. Content wise its good." So a purely visual pass, copy frozen.

`frontend-designer` committed to one idea rather than lightening things at random: **the ink field is graph
paper and the tool is laid on top of it.** Inputs moved off the black onto a cream sheet, break-even numeral
given its own field, three stat tiles became a label-left value-right ledger, the footnote wall dropped from
about 300px to 120px. Four photos, each chosen to carry an argument, base64-inlined so the file opens from
anywhere. It caught and fixed a contrast failure **it had introduced itself**, a hover state at 3.75:1 on
cream, and reported it. Orchestrator verified: 0 dashes, 0 external refs, 4 images.

**Approved by the owner 2026-08-16.** Spec re-dispatched, after the first attempt died on an API error.

### The new thread, T-141

Owner raised that FreedomConex has put up a public shop with geo-based pricing. **Orchestrator pulled the
API across six ZIPs rather than theorising**, and the data reshaped the question:

1. **Their used grade is literally the string `WWT`.** Publishing used pricing needs no change to the locked
   condition stance. Only NEW is a new catalogue item.
2. **Unit price is regionally stable at about 3.5 percent spread; DELIVERY is the variable**, $550 to $1,162
   in region. That is the answer to the owner's needle: publish the stable unit price, make delivery the
   named variable that genuinely requires the call.
3. **The API independently corroborates the HC-below-Standard anomaly** that had rested on the owner's
   say-so since 2026-07-09.

Also flagged: FC's own public shop quotes $2,040.60 delivered for a Cincinnati used 20ft while the site
publishes $2,010, on five-week-old data.

### Owner answers, 2026-08-17

Doug has agreed to the republishing. NEW containers OUT, pinned as a standalone build. Pricing refresh
**daily at 5am**, and **"the margin is already in the price so its not marked up, what FC shows is what we
should show."**

That last answer creates the single question the build now turns on, and it is a roughly 30 percent
question. See the response for the unit-versus-delivered analysis.

### Two verifications this cycle

- **`pricing.ts` carries `label: '20ft Cargo'`** on a site that sells WWT only. Confirmed NOT rendered
  anywhere: only `.price` is consumed, and `grep "20ft Cargo" dist/index.html` returns 0. So it is an
  internal leftover rather than a live claim, but it is a loaded gun: rendering `.label` would publish a
  grade the site does not sell.
- **FC's shop is a client-rendered app with no price in its HTML.** So FC will not earn price rich results
  or AI price citations on its own numbers. A build-time harvest would put SBD ahead of its own supplier on
  the supplier's prices.

## Cycle 16, the all-in audit, and a recommendation reversed

Owner: "Yeah that all in line needs reviewed it seems."

Audited every instance rather than just the one disclaimer, and the result **reversed the previous cycle's
recommendation.** "All-in" is not a footnote, it is the brand's central differentiator, live in 20-plus
places including the homepage hero ticker, `PriceSection.astro:18` ("Sticker prices elsewhere rarely include
delivery. Ours do"), a `container-buying-guide` comparison-table row deployed AGAINST competitors who hide
freight, `cost/index.astro:84`, the buyer confirmation email at `submit-quote.ts:118`, and the entire thesis
of the untracked `the-cheap-container-that-wasnt.md` draft.

**Correction issued to the owner:** last cycle recommended publishing FC's UNIT price as the headline and
called the cost "a site-wide copy change, real work, not huge." That understated it badly. Publishing a
unit price that excludes freight would make Steel Box Direct the exact seller its own buying guide tells
readers to distrust. Recommendation flipped to **publish the delivered price**, which also barely moves the
numbers, $2,040.60 against a published $2,010.

**And a business risk surfaced underneath the copy question.** The hero promises delivery included within
250 miles, unqualified, while `baseDeliveryCost` reaches $1,457 when a SKU sources from Detroit. So the
all-in promise silently absorbs several hundred dollars of freight depending on which yard holds the stock.
That, rather than "Doug closes better", is the honest reason the call exists: the page cannot know where the
box is coming from.

## Cycle 17, spec delivered, three of my own locks overridden

Spec at `docs/superpowers/specs/2026-08-16-rent-vs-buy-calculator-design.md`, 1,475 lines, four tasks, plus
a Contradiction Register resolving 10 conflicts. **It hit the L016 escape trap on itself**, three lines
intended as unicode escapes landing as literal dashes, caught by its own grep, and now warns the implementer.

Three orchestrator overrides, each because the lock rested on something later verified false:

1. **Two locked strings were factually wrong.** The `specs` cell "Both sides include: Delivery, entered by
   you" and the `llms.txt` draft "with delivery entered on both sides" are both false, since the purchase
   average already contemplates delivery. Fixed in the SEO doc. **The spec agent handled this correctly:
   reproduced the wrong strings verbatim and escalated**, rather than silently editing a locked surface or
   silently shipping an inaccuracy.
2. **Nav moves from Guides to TOOLS.** The SEO doc argued the reasoning that killed a "Rental" tab also
   kills a "Tools" tab. Verified false premise: **a Tools dropdown already exists** at `SiteNav.astro:45-54`
   with Size Calculator, Delivery Checker and Get a Quote. Nothing is added as a tab, and filing a tool
   under Guides is a category error. The mockup's instinct was right.
3. **There is no page-count assertion in code.** Verified across `src/` and `.github/`. It exists only in
   session records, which are history and do not get retro-edited.

## Cycle 18, build starts, and the pickup insight

Owner: "Finish the calculator and do what you need to do." Tasks 1 and 2 dispatched to separate agents with
fresh context, per the 08-14 finding that one agent executing everything inherits its own misreadings.

### The pickup idea, and why the owner's hedge was the accurate statement

Owner proposed a pickup disclosure whose copy hedged, "may save you some money ... best that you call us."
Pulled `pickupUnitPrice` against `deliveryUnitPrice` across the metros. **Pickup is NOT delivery minus the
freight fee: the pickup unit price is sometimes HIGHER than the delivery unit price.** Cincinnati 40ft HC
pickup is $1,955.10 against a delivery unit of $1,749.30, so the saving is $385 of a $591 delivery, not
$591. Savings across the sample range $314 to $853 and follow no rule a page could state.

So the hedge is not a hedge, it is correct, and a confident "you save the delivery fee" would have been
wrong. Also: pickup yards are often far. A Cincinnati buyer's 40ft standard pickups from Columbus, 107
miles; Louisville's from Nashville, 176 miles.

**Recommended inline `<details>` rather than a modal**, on three grounds: the content stays in the HTML
where AI crawlers can cite it, which is the entire point of the exercise; a lead-capture popup already
overlaps the price area as a known issue; and a disclosure needs no focus trap.

**Strategic bonus:** the audit had concluded the delivered price must be the headline, which left the unit
price with nowhere honest to live. The pickup disclosure is where it lives, and it gives `AggregateOffer` a
genuine `lowPrice` and `highPrice` rather than a contrived range.

### A live bug found in passing

`src/pages/api/submit-quote.ts:118` sends EVERY buyer "the price we send you is all-in, the container plus
delivery to your ZIP and placement on flat ground", unconditionally. **A self-pickup buyer is told delivery
is included**, in the same email whose summary line correctly reads "Self pick-up near". Live transactional
mail, two-minute conditional fix.

## Cycle 19, Task 1 returns with a spec defect

`src/data/tools.ts` and `tools.test.ts` written, house patterns followed, 8 of 9 new tests passing.

**The one failure is a genuine spec defect, and the agent refused to improvise around it.** Task 1 requires
three things that cannot hold at once: `tools.ts` carries a `/container-rent-vs-buy-calculator/` entry, the
guard asserts every tool URL resolves to a real page file, and Task 1's gate is a green `npm test`. Task 2
creates that page. The spec also contradicts the house rule it copied: `guides.ts:9-11` says do not add an
entry before its page exists.

It wrote the assertion exactly as specified, let it fail loudly, and offered three resolutions rather than
picking one. **Accepted resolution: treat Task 1 and Task 2 as ONE gate, zero code change.** Task 2 was
already dispatched in parallel rather than sequentially, so the page appears and the assertion goes green
without an edit. The parallel dispatch incidentally dissolved the defect the sequential decomposition
created.

It also hit the dash trap: literal U+2014 and U+2013 landed inside a character class on lines 94 and 95 of
its own guard, caught by grepping immediately, fixed by script rather than by retyping.

## Cycle 20, Tasks 2 and 3, and the guard's worst defect yet

Owner: "proceed."

**Task 2, the page.** 56 HTML files, 262 tests green, HS003 at 0 findings with the new page in scope. Task
1's deliberately-red URL assertion went green on its own once the page existed.

**It refused a briefing instruction and was right to.** The orchestrator had said a same-sentence deferral
makes the mockup's approved "what we sell" sentence safe. That is true only of the SHAPE layer. Class 6
`absolute` patterns fire regardless, and `/\brated for\b/i` is one of them. The agent probed BOTH wordings
through the guard's exported `scanUnit` rather than trusting the briefing: mockup wording 2 hits, reframe 0.
So approved copy changed, forced by a hard stop.

**It also corrected the orchestrator on a fact.** The canonical stance sentence appears ONCE in the mockup,
not twice; L904 says "does not rent containers" without "shipping", so the test would not have tripped.

**Two Astro-scoping fixes that would have silently disfigured the approved design.** `.calc-big .mo` had to
become `:global(.mo)`, because the script CREATES that span so it never carries the scope attribute. Without
it the "Month" label above the break-even numeral renders unstyled at full size, wrecking the one element
the owner approved as the visual climax.

**Task 3, wiring**, plus two copy corrections. Nav went to the Tools dropdown per the orchestrator override,
and the new guard case asserts it is inside the Tools slice and ABSENT from Guides, so the override is
diff-checkable rather than a comment.

### The find of the session

**`extractUnits` at `hs003-content-guard.test.ts:577` pairs quote characters across the ENTIRE Astro
frontmatter, comments included.** A `//` comment containing "this page's metaDescription" re-paired every
literal below it and produced a phantom class-1 PERMIT OUTCOME finding against the guides hub's deliberately
compliant permit FAQ, nowhere near the cause. The agent bisected against `git show HEAD:` to prove the
finding was its own, then removed the apostrophe.

**The verifier then proved it is worse than "phantom at the wrong line": it can SUPPRESS real findings.** A
masking probe went from 2 hits to 1, because merging flips the unit non-atomic and a distant deferral then
clears a genuine hit via `unitDeferral`. **So a green guard is worth less than it looks whenever frontmatter
quote pairing is unbalanced.** Logged as T-146, and it materially changes the T-036 calculus: wiring this
guard as a deploy gate before fixing this turns a stray apostrophe into a deploy-blocking scavenger hunt.

It was firing benignly on new code at `src/data/tools.ts:8` (`hub's`), in a file whose sibling carries a
comment warning against exactly that. Fixed before commit.

## Cycle 21, email path, three bugs not one

Dispatched for the self-pickup contradiction; the agents found two more in the same file.

1. The all-in promise was unconditional, so self-pickup buyers were told their price included delivery.
2. **Both `.replace('_', ' ')` calls replaced only the FIRST underscore**, so every buyer with a
   multi-underscore value read raw database fields: `Condition: wind water_tight`, `Timeline: 1-3_months`.
   Now label-mapped, with the condition map holding the single-grade rule.
3. The RTO heads-up said "delivery" to pickup buyers.

**The agent expanded scope once and disclosed it:** it also mapped `size_preference`, unasked, because
`40ft_hc` was rendering literally. Correct call. It also DECLINED to zero the file's em dashes, because one
sits in copy it was told to keep verbatim, and caught that the orchestrator's brief had quoted that sentence
with a comma where the live copy has an em dash, refusing to repunctuate live transactional copy on the
strength of a paraphrase.

**Verified across 400 rendered option combinations: zero raw underscores, no condition label implying Cargo
Worthy, One Trip or New.** No test covers this route at all, so the renders are the only evidence. Logged.

## Cycle 22, verification and release

**Independent verifier: SAFE TO COMMIT, all eleven items pass**, conditional on one exclusion. It confirmed
all four spec instructions the orchestrator had flagged as wrong, and independently reproduced the
apostrophe mechanism by experiment rather than accepting the report.

**The one hard condition: stage by explicit path.** `src/content/blog/the-cheap-container-that-wasnt.md` is
untracked, unrelated, three weeks old, and carries 5 em dashes. Sweeping it in would breach HS-OUT-001's
create clause. The feature's own files are completely clean at 0 dashes.

Four commits dispatched: the tools catalogue, the page, the wiring, the email fixes. Then push.

## Cycle 23, deployed, and an instruction that would have caused harm

**LIVE.** `e67a451..e3fc422`, four commits, `/container-rent-vs-buy-calculator/` returning 200, site at 56
pages. Verified headlessly rather than by curl, because the break-even numeral and the Month label are
written by client JS: first paint shows the empty state with `calc-stats` hidden and `offsetParent` null,
proving the `[hidden]` fix in production, and entering rate 195 against $2,710 yields
`<span class="mo">Month </span>14`, proving the `:global(.mo)` scoping fix.

**THE ORCHESTRATOR'S OWN INSTRUCTION WOULD HAVE DESTROYED HS003 COVERAGE FOR A FILE.** The brief said
"remove the apostrophe at `src/data/tools.ts:8`". The agent probed the real tokenizer before complying and
found FOUR comment apostrophes, not one. **Four is even, so the literals still paired correctly.**

| variant | units the guard sees |
|---|---|
| as shipped, 4 apostrophes | 10, being 8 correct atomic literals plus 2 spurious blobs |
| **line 8 alone fixed, as instructed** | **2, all eight real literals swallowed** |
| all four reworded | 8, exactly the real literals |

**So T-146 is a PARITY bug, not a presence bug.** An even count is benign; an odd count re-pairs everything
below the imbalance. Advice of the form "remove that apostrophe" is actively dangerous, and the orchestrator
gave exactly that advice. Stripping comments before extraction is now clearly the only safe fix, since any
partial cleanup can flip parity and silently zero out scanning while every test stays green.

## Cycle 24, the pricing architecture

Owner asked to explain the pricing workflow, then proposed tracking all 15 ZIPs to publish a per-city price.

**The city-page dollar stop was traced rather than assumed, and the finding decided it.** Its origin is the
2026-06-04 rule "No dollar amounts on any page (prices fluctuate)". **The reason was staleness**, not law and
not HS_003. The 2026-07-09 policy preserved the city clause but gave no city-specific reason, and the
distinction it had rested on, comparison-math versus quotable-sticker, was dissolved by that same policy
allowing stickers on product pages. **A daily feed inverts the concern**: applying a staleness rule to the
freshest number while exempting the five-week-old homepage figure is backwards.

**Then the owner refined the idea and improved it**: publish that day's actual price for the ZIP pulled,
scoped explicitly, rather than an average. Pros and cons analysed. The decisive point is that it needs no
history to earn, where "typically" would need ninety days.

**On the daily-rebuild concern the owner raised, the breakpoint was misdiagnosed at first.** Verified: every
page is prerendered static except one API route, and `.github/workflows/` holds only the Supabase keepalive,
so **there is no CI running the test suite at all.** The hazard is not the rebuild, it is that an automated
5am commit makes a robot the unattended deployer of anything sitting on `main`, ungated.

Option C adopted: diff before committing so most days are no-ops, and the Action runs the suite itself and
promotes only on green. **The feature pays for the test gate the project has never had.** Option B, SSR,
rejected for a project-specific reason: the entire QA discipline here is grepping `dist`, and SSR pages have
no built HTML to grep.

**Check-date versus change-date, answered:** change-date, because a visible check date requires a daily
deploy and collapses C. Store both, render only `effectiveSince`. The phrasing "this price has been in
effect since August 12" converts the compromise into the stronger claim, and the real hazard, a silent job
failure being indistinguishable from a stable market, is handled by `lastVerified` plus a loud failure.

## Cycle 25, the policy formally superseded

Owner: "city-page policy is over ridden. population centroid is the correct one."

Written up as `.project-catalog/decisions/2026-08-17-city-page-pricing-override.md` rather than absorbed
into a commit message, because a hard stop bending quietly is how a project loses the ones that matter.
**The stop is replaced, not deleted, and the replacement is stricter in every respect except the one
lifted.** CLAUDE.md updated at both `:30` and `:46`; em dash count went 3 to 2 with none added.

## Cycle 26, the pricing spec and a guard that never existed

Spec delivered with an 11-entry Contradiction Register. **C4 is the one that matters: the city-page guard
never existed.** Orchestrator verified independently. The only enforcement is `cities.test.ts:54-56` scanning
`JSON.stringify(city)`, the DATA, and no test reads the city template at all. The hard stop has been held by
convention and manual dist greps for months. So the guard is a NEW FILE and protection ARRIVES WITH the
feature that needs it rather than being weakened by it.

**C8** killed the module design the orchestrator had assumed: the calculator's forward-compatibility clause
is only half true. It does `Object.keys(pricing)` excluding exactly `'asOf'` by name, so new SKU keys are
tolerated as promised, but a sibling `effectiveSince` or `metros` key makes `pricing[k].price` undefined and
breaks both the page build and its guard. Hence a separate generated `geoPricing.ts`.

**C10** found a latent bug: `priceValidUntil` derives from `asOf` behind a comment claiming self-maintenance.
Under commit-on-change, a price stable 13 months publishes an EXPIRED Offer on three product pages with no
failing test.

**C7** corrected an orchestrator over-specification: a Cloudflare deploy hook only replaces push-to-deploy if
auto-deploy is switched OFF, which changes behaviour for every human push. Test-before-push inside the Action
gives the same gate at zero infra cost.

**The catch most worth having:** `pickupLocationName` may contain "Freedom Conex", and `cities.test.ts:58-60`
asserts city data never names the supplier. Serialising the API response would have tripped that guard or
published the supplier's name across 15 city pages. The harvest now copies an explicit field allowlist.

## Cycle 27, publish all, and the depot concern disproved

Owner: "Harvest all publish all." Before accepting, the orchestrator pulled all eight depot metros rather
than arguing from the site's own home-versus-depot framing. **Every one has a local yard**, most closer than
the home-region ones: Charleston 4.8 miles with $250 delivery against Cincinnati's 18 miles and $600.
Delivered 20ft ranges $1,639 Charleston to $2,119 Kansas City. The concern was inherited from framing, not
data, and was wrong.

One real anomaly, and it is in the home region rather than a depot market: **Cleveland's 40ft standard sources
from Columbus, 153.8 miles, at $918 delivery**, while its 20ft and HC come from the Cleveland yard 5.6 miles
out. Exactly the case the approved caveat covers.

## Cycle 28, the centroid research, and two orchestrator claims refuted

**`fromPrice` is not the unit price.** It is `min(pickupUnitPrice, deliveryUnitPrice)`. Verified at 45404:
$1,440.60 against a deliveryUnitPrice of $1,492.05. Building the delivered total from `fromPrice` understates
Dayton by $51.45 **while every sanity check passes.** Identical in Cincinnati, which is why the
orchestrator's own figure held up for two days and the error survived unexamined.

**The centroid rationale was wrong.** `baseDeliveryCost` is a flat per-metro zone rate when the delivering
yard is local. Centroid versus downtown is identical to the cent in 13 of 15 metros, and Louisville's
centroid is $17.51 CHEAPER, the opposite of the predicted direction. The decision survives on a better
reason: the flat rate is a current property of the feed, not a guarantee.

**A third correction:** `pickupLocationName` is the nearest PICKUP yard, frequently not the delivering yard,
which appears only as an unnamed UUID.

The `researcher` agent also has no Write tool, so the file was transcribed by hand. **Second agent definition
today with that gap**, after `seo-analyst`.

## Cycle 29, build starts

Owner: "Fix the fromPrice field and build it."

Four sites patched in the spec rather than passed verbally, so the wrong field cannot leak back in from the
document. Tasks 1 and 2 dispatched in parallel on disjoint file sets. Both agents warned about the apostrophe
PARITY hazard in comments, not just the dash rule, since one agent yesterday nearly destroyed a file's HS003
coverage by following the orchestrator's own "remove the apostrophe" instruction.

## Cycle 30, Tasks 1 to 5 of the geo pricing build

**Two orchestrator errors in Task 1, both caught because the agent flagged rather than complied.** The
`publish` flags shipped 7-and-8 because the owner's "harvest all publish all" ruling was never carried into
the brief. And the instruction "the centroid ZIP is not one of that city's `primaryZips`" is **impossible for
3 of 15**: louisville 40205, savannah 31408, houston 77008 all collide, verified by parsing `cities.ts`. The
framing was wrong: a coincidence is not the failure mode, PICKING a service ZIP as a shortcut is. Service
ZIPs cluster near population and so does a population centroid.

**The `fromPrice` correction took six passes and the orchestrator got it wrong twice.** Final measured truth,
with every number naming its ZIP because that is the entire lesson:

| ZIP | deliveryUnitPrice | baseDeliveryCost | correct | wrong basis |
|---|---|---|---|---|
| Dayton 45404 | 1492.05 | **550** | 2040 | 1990 |
| Cincinnati 45237 | **1440.60** | 600 | 2040 | 2040, equal |

**The original spec example was correct arithmetic for Cincinnati and was never wrong.** The value 1440.60
plays two roles at two ZIPs: `fromPrice` at Dayton, `deliveryUnitPrice` at Cincinnati. Patch five changed
1440.60 to 1492.05, a Dayton figure, while keeping 600, a Cincinnati figure, **two turns after the
orchestrator's own verification run had printed 550 on screen.** The coincidence, not a typo, is why six
passes failed. Protection is now machine-produced: every dry run prints a `wrongBasis` column, and Dayton is
the only one of 45 figures where the two differ.

**Three defences Task 2 built rather than trusting instructions.** `unitPriceBasis` as a single-member union
makes writing `'fromPrice'` a COMPILE error. `GeoSkuKey = Exclude<keyof Pricing, 'asOf'>` makes the spec's
hoped-for "cannot drift" actually true. `lastVerified: string | null` because `string` could not express the
pre-harvest state.

**Two spec assertions were unsurvivable.** "No Offer on city pages" fails at baseline, because
`entities.ts:18-22` puts a priceless `makesOffer` Offer on the site-wide Organization. And the prescribed
brace-depth interpolation stripper **would have blinded the guard to the exact block Task 5 writes**, because
a depth scan deletes everything inside a `.map()` callback and all three figures render inside a map. Caught
live when the first implementation reported "no typed digits" on a block containing `was 2,110 last month`.

**Live data settled two design questions.** Feed Sanity 9 self-contradicted on whether a bad pickup rejects
the value or the run; ruled the value, and Savannah's 1183.35 pickup proved it, since the abort reading would
have taken all 15 metros off the air on the first production run over one secondary number. The 1200 floor
was itself a category error, delivered being a total and pickup a bare unit price; `PICKUP_MIN` is now 900,
derived two ways rather than guessed.

**Task 4 found the gap that would have taken the site down:** no instruction covers the empty feed, which is
the committed state. A pure derivation yields NaN and takes out all 56 pages. A last-known-good fallback was
structurally required and unmentioned. It also fixed `priceValidUntil`, which under commit-on-change would
have published an EXPIRED Offer on three product pages after 13 stable months, with nothing failing.

**Two landmines computed rather than predicted.** The derived national figures 2000 / 2460 / 2360 mean
`formatPrice(2000)` collides with the calculator's invented no-JS example literal, failing the rent-vs-buy
guard the moment the harvest commits. And `Prices confirmed` would assert a verification date, which D5
forbids. Task 5 fixed both: example figures moved to 225 / 2475 / 150, **immune by construction** since 2475
does not end in zero and `roundToTen` can never emit it, and both properties are now asserted rather than
commented. Cell relabelled to `Prices in effect since`.

Suite 348 passing. Task 6 dispatched with the population **deliberately uncommitted**, because it moves
public prices and gives 15 city pages a price for the first time. The owner sees the numbers first.

## Cycle 31, "do what is best" and the Cloudflare diagnostic

Owner delegated fully. Orchestrator chose, in priority order: fix the `/cost/` falsehood, ship Option A with
scoped labels as its condition, add the fifteen-metro table, add one cost FAQ, add a product-to-locations
bridge. Declined Option B and day-precision product dates.

### The /cost/ fix, done by derivation not retyping

`:78` claimed "Cincinnati pricing is 15% lower than coastal markets." Orchestrator verified: **+15.4 percent
HIGHER**, same magnitude, inverted sign, wrong on all three sizes. The replacement computes both the number
**and the direction word**, so if the feed ever really does put Cincinnati below the ports the sentence flips
itself. The port metros are named in the copy so a reader can recheck the average against the table.

Two adjacent claims were REMOVED rather than hedged, and the reasoning is the useful part. The "15-25% of the
total project" delivery share **cannot be derived at any provenance**, because the only decomposition
available is delivered versus pickup and the pricing decision forbids treating pickup as
delivered-minus-the-fee. The "within 100 miles of Cincinnati is our primary tier" claim now contradicts the
same page, which publishes prices for fifteen metros. The $900-to-$1,600 illustration went too, because the
trap is now illustrated with our own published totals, which is better evidence and cannot go stale.

### The Cloudflare AI diagnostic, and a real bug found sideways

Owner raised Cloudflare's Agent Readiness beta: Quick Wins 3 of 5, missing Content Signals in robots.txt and
"Markdown for Agents".

**The finding that mattered had nothing to do with either checkbox.** RFC 9309 has crawlers obey only their
single most specific matching group, and groups do NOT inherit. This site's robots.txt has six named
AI-crawler groups each carrying `Allow: /` and no `Disallow`, **so `Disallow: /admin/` applies to nothing
except crawlers falling through to `*`.** All six named AI crawlers are currently permitted to crawl
`/admin/login`, `/admin/dashboard` and `/admin/reset`.

**Orchestrator sized it rather than repeating the alarm:** all three admin pages carry
`noindex, nofollow`, none is in the sitemap, and the dashboard's static HTML contains no JWTs, no Supabase
host, no emails and no phone numbers. A correctness bug worth fixing in the same commit, not an incident.

The same mechanic is why a Content Signals line must be repeated in every group; under `*` alone, none of the
six crawlers would ever see it.

**The orchestrator's RFC worry was unfounded**, and RFC 9309 s2.2.4 settles it: parsing of other records MUST
NOT interfere, and only a user-agent line or EOF terminates a group. Also learned: there are FOUR signals not
three (`use` was added), and **Cloudflare's own default deliberately omits `ai-input`** because omission means
neither grants nor restricts, which makes stating it explicitly more meaningful than assumed.

**One thing never to do:** enabling Cloudflare's managed robots.txt PREPENDS a block whose default includes
`Disallow: /` for GPTBot, ClaudeBot, CCBot and Google-Extended. Combined with no group inheritance, that would
silently block the exact crawlers the strategy depends on.

**Markdown for Agents is theatre on this stack**, and the agent proved it from installed source rather than
docs: `@astrojs/cloudflare/dist/entrypoints/server.js` returns `env.ASSETS.fetch()` for prerendered pages and
returns **before `app.render()` is ever called**, so Astro middleware can never see an `Accept` header.
`functions/_middleware.ts` is ignored whenever `_worker.js` exists. Snippets are Pro+. And the sharpest point:
auto-converting 47 non-markdown pages would create a second full corpus **outside the HS003 guard's
coverage**. Verdict: $20/month for Pro or stay at 3 of 5. Recommended staying.
