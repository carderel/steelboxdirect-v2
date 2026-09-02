# Session transcript: 2026-08-28 (same working session, continued past midnight)

> **Cycle 5 (the GSC impression-surge analysis) was performed on 2026-08-28 but recorded in
> `history/2026-08-27-session-transcript.md` before the date rollover was noticed.** It is left
> there rather than duplicated here. Read that entry for the surge finding. This file continues
> from cycle 6.

## Cycle 6 (records rolled to 2026-08-28)

- Stop hook fired: no session log for 2026-08-28. Created `sessions/2026-08-28-session.md` and
  this transcript, and updated `PROJECT_STATE.json`.
- State at the rollover, carried forward:
  - `main == origin == e2e84a4`. **NO commits this session.** Nothing shipped, nothing live.
  - Working tree still carries the uncommitted UDO-migration deletions (old root UDO markdown
    files, root `PROJECT_STATE.json`, root `.project-catalog/`) plus modified `README.md` and
    `START_HERE.md`. Unchanged since before the session opened. This is why the Stop hook keeps
    looking for `.project-catalog/sessions/` at the repo root: the records now live under
    `UDO Project/`.
  - **T-168 move 1:** draft verifier-passed and sent to the owner, awaiting his review.
    `.outputs/content/2026-08-27-bic-provenance-self-check-post.md`. Not integrated.
  - **T-172 (new):** GSC surge analysed. Awaiting the owner's GSC date-range compare.
- Two owner decisions are now outstanding: (1) approve or change the BIC post draft, (2) run the
  GSC compare 08-15..08-20 vs 08-21..08-26 and send the export.

## Cycle 7 (AI-features compare read: 3.8x, but only 2.8% of the surge)

- Owner supplied the compare export, but with the **Generative AI Features filter still applied**:
  `Performance-on-Search-Generative-AI-Features-2026-08-28.xlsx`. Correct ranges
  (08-15..08-20 vs 08-21..08-26), wrong scope for attribution, and no clicks column.
  Told the owner plainly and re-requested the unfiltered version.
- MEASURED: AI-feature impressions 16 -> 61 (3.8x). Desktop 8 -> 36, mobile 8 -> 25, US 7 -> 39.
  (Pages tab sums to 64; Devices and Countries both agree at 61, so 61 is the total and the gap
  is GSC's usual per-dimension aggregation difference.)
- THE FINDING IS THE SHARE: total impressions over the same windows went 587 -> 2,180 (+1,593).
  AI features are **2.8% of the surge window AND 2.8% of the gain**. So AI features did NOT drive
  the surge and were NOT left behind by it. The AEO surface is growing in step with the ordinary
  search surface, not ahead of it.
- WHERE IT MOVED: two pages are 35 of 61 (57%).
  `/blog/12-things-never-store-in-a-shipping-container/` went **0 -> 19** (a listicle, from
  nothing); `/container-reference/` doubled 8 -> 16 and was already the leader. Both are the
  formats AI Overviews lift: numbered lists and reference/spec pages. That is an actionable
  content-format signal.
- CORROBORATION OF THE TIER-1 HYPOTHESIS: city pages had ZERO AI-feature impressions in the
  baseline and 9 in the surge window (Dayton 5, Huntington 3, Indianapolis 1). Independent support
  for the 08-19/08-24 city-page template expansion reading in the main analysis. Corroboration,
  not proof: nine impressions.
- HONEST SIZE STATED: 61 impressions total. A handful of queries moves the whole picture at that
  scale, and one week is not a trend. Explicitly told the owner NOT to re-plan AEO strategy on it.
- Addendum appended to `.outputs/analysis/2026-08-28-gsc-impression-surge.md`.
- STILL OUTSTANDING: the unfiltered compare, same ranges, filter removed, Pages + Queries tabs by
  impression difference. That is what names the pages behind the +1,593.
- No src/ changes, no build, no commits this cycle.

## Cycle 8 (unfiltered compare landed: ATTRIBUTION SETTLED, it was a 404 bug fix)

- Owner supplied the correct export: `...Performance-on-Search-2026-08-28 (1).xlsx`, Web,
  compare 08-15..08-20 vs 08-21..08-26, no AI filter, all 9 columns.
- HEADLINE: all pages 695 -> 2,390 impressions (+1,695). **Location pages 100 -> 1,552 = +1,452 =
  86% of the entire gain.** /locations/indiana/indianapolis-shipping-containers/ alone went
  20 -> 826 (+806) = **48% of the site's total gain**. Clicks moved 2 -> 6.
- MECHANISM FOUND, AND IT IS A BUG FIX. Commit `78e5f48` (2026-08-21, the exact jump date):
  "fix(seo): 301 the trailing-slash flat city URLs and ~partytown leftovers". Its message states
  Google had INDEXED URLs THAT WERE SERVING 404s. The 12-line public/_redirects named exactly four
  cities and ALL FOUR GAINED: indianapolis 20->826 (+806), cincinnati 2->50 (+48),
  dayton 2->50 (+48), louisville 11->29 (+18). Three are in the top nine movers site-wide. The flat
  duplicate URLs are now absent from the Pages tab, so consolidation completed. Right date, right
  pages, right mechanism.
- CORRECTION TO THE MAIN ANALYSIS: section 5 had ranked "city-page template expansion" and
  "crawl/duplicate unblocking" as JOINT tier 1. The compare separates them: the 404/301 fix is THE
  DRIVER. The 08-24 template changes (Quick Facts, 4th FAQ, breadcrumbs) landed mid-window and
  cannot explain an 08-21/08-22 jump. Stated plainly to the owner.
- SECOND, SEPARATE EFFECT: Columbus 0 -> 197 and New York 0 -> 195 were NOT in the 301 list. Both
  from literal zero. Columbus's city entry was added 2026-08-04 (git-checked), so ~3 weeks old at
  the boundary; reads as normal indexing lag completing, plausibly accelerated by the same recrawl.
  Labelled INFERENCE, unlike the 301 attribution.
- QUERY SIDE CONFIRMS "new matching, not better ranking": 291 queries went 0 -> something, adding
  1,418 impressions = 84% of the query-level gain (297 -> 1,728), nearly all at position 50-75.
  Indianapolis's own position did NOT improve (62.5 -> 65.9).
- THE FOUR ROWS ACTUALLY WORTH SOMETHING: **/ai-info/ 0 -> 94 at position 5.7** (shipped `1a544cd`
  08-20, page 1 from a standing start, best positional result in the dataset, validates the AEO
  thesis); the GBP-linked homepage 45 -> 76 holding position 3.7 with 4 clicks; /blog/12-things-
  never-store-in-a-shipping-container/ 7 -> 67 at position 11.5 (also the top AI-features gainer);
  /container-reference/ position nearly halved 27.6 -> 15.5.
- FLAGGED AS A WATCH ITEM, NOT A FINDING: five commercial pages LOST impressions (/cost/ -18,
  /size/ -17, /for/businesses/ -16, /shipping-containers-for-sale/ -16, /20-foot -9). Candidate
  cause is cannibalisation by the new /conex-boxes-for-sale/ page and the "Used" title rewrites
  (`907fc0f`, 08-25), but the losses are small and the window short. Re-check next export.
- RECOMMENDATION GIVEN: a 12-line _redirects file produced 86% of the month's impression growth, so
  auditing GSC for other indexed 404s and duplicate URL forms is the cheapest lever found so far.
- Addendum 2 appended to `.outputs/analysis/2026-08-28-gsc-impression-surge.md`. T-172 can close on
  the attribution question; the remaining open items are the watch items.
- No src/ changes, no build, no commits this cycle.

## Cycle 9 (T-173 coverage audit: the report is CLEAN, no second goldmine)

- Owner supplied five GSC Coverage Drilldown exports (all "Sitemap: All known pages").
- RESULT: **T-173's premise does not hold. There is no second indexed-404 goldmine.** Total
  affected URLs across all five issue types = 10, of which 6 need no action and 1 is already fixed.
  Reported the negative result plainly rather than manufacturing work from it.
- (a) NOT FOUND (404): 1 URL, `/~partytown/`, last crawled 2026-06-19 (two months BEFORE the fix).
  ORCHESTRATOR VERIFIED LIVE with a Googlebot UA: both `/~partytown/` and `/~partytown` return
  301 -> home. Already fixed by 78e5f48; the GSC entry is stale pending recrawl. No action.
- (b) PAGE WITH REDIRECT: 4 URLs = exactly the four flat city URLs from 78e5f48, **last crawled
  2026-08-21 and 08-22**. THIS CLOSES THE T-172 CAUSAL CHAIN: fix shipped 08-21 -> Google recrawled
  all four on 08-21/08-22 -> those cities' canonical pages gained +920 impressions between them,
  and the daily series turned on exactly those days (113 on 08-20, 190 on 08-21, 301 on 08-22).
  The attribution is no longer inference from timing. Healthy end state, no action.
- (c) DISCOVERED - CURRENTLY NOT INDEXED: 3 URLs, all with last-crawled = epoch (NEVER FETCHED):
  `/delivery/`, `/container-buying-guide/`, `/privacy/`. Bucket was 18 on 05-31, now 3, so the
  trend is good and these are stragglers. INVESTIGATED /delivery/ because it is commercial:
  live HTTP 200 to Googlebot, self-referencing canonical, no noindex, present in the live
  sitemap, and 16 internal links including SiteNav and SiteFooter. Nothing mechanically wrong;
  Google has simply deprioritised fetching it. FIXABLE WEAKNESS FOUND on the other one:
  `/container-buying-guide/` has exactly ONE internal link (the nav) versus /delivery/'s 16.
- (d) CRAWLED - CURRENTLY NOT INDEXED: 0 URLs. Clean. Historical peak 2.
- (e) ALTERNATE PAGE WITH PROPER CANONICAL: 2 URLs, `/quote/?size=40ft_hc` and `/quote/?pay=rto`,
  correctly canonicalising to /quote/. Passive confirmation that T-171's ?size= preselection links
  are NOT creating duplicate-content problems. No action.
- ADJACENT FINDING (not in the exports, found while checking sitemap completeness): the live
  sitemap holds 52 URLs against 61 built routes. The gap is 3 /admin/ pages (correctly excluded)
  and 6 /blog/category/* pages, excluded DELIBERATELY per a documented comment at
  astro.config.mjs:36-38 ("so Google isn't fed empty/thin URLs while the section is young.
  Revisit once categories fill out."). The blog now has 10 posts across the 6 categories, so the
  revisit condition is arguably met. Logged as an owner call, not a recommendation.
- Analysis: `.outputs/analysis/2026-08-28-coverage-audit.md`.
- No src/ changes, no build, no commits this cycle.

## Cycle 10 (why Request Indexing bounces; and 2 finished blog posts found unpublished)

- Owner reported he has submitted /delivery/ and /container-buying-guide/ for indexing MULTIPLE
  TIMES with no result, and guessed internal linking. Also asked whether the blog pages referenced
  in cycle 9 are published but merely absent from the sitemap.
- HIS INTERNAL-LINKING GUESS IS WRONG FOR /delivery/. Counted live hrefs on six pages with a
  Googlebot UA: /delivery/ is linked 4 to 6 times on EVERY page (nav + footer + body). It is one of
  the best-linked pages on the site. Told him plainly.
- THE LIKELY ACTUAL CAUSE: **/delivery/ is 347 words.** Measured visible text with scripts, styles,
  nav and footer stripped: /delivery/ 347, /condition/ 796 (indexed), /container-buying-guide/
  1,549, /shipping-container-guides/ 3,072 (indexed). A 347-word COMMERCIAL page is the textbook
  "Discovered - currently not indexed" case, and Request Indexing cannot override a value judgment,
  which explains why repeated submissions bounce. Everything else checks out: 200 to Googlebot,
  self-canonical, no noindex, NO X-Robots-Tag header, present in the live sitemap. Labelled
  LEADING HYPOTHESIS, high confidence but not certain, since Google publishes no threshold.
- /container-buying-guide/ HAS NO PROVEN CAUSE and this was stated as unknown rather than guessed.
  1,549 words so depth is fine; linked once per page (nav) plus twice on the guides hub. Candidates
  named but unconfirmed: intent competition with /shipping-container-guides/, the sitemap gap
  below, or plain crawl prioritisation.
- NEW SITE-WIDE FINDING: **the live sitemap carries NO `<lastmod>` on any of its 52 URLs.** Every
  entry is a bare `<url><loc>...</loc></url>`; no lastmod, no changefreq, no priority. lastmod is
  what Google uses to schedule recrawls, so the sitemap currently asserts existence and says
  nothing about freshness. Cheap site-wide fix via the @astrojs/sitemap `serialize` option. Not a
  proven cause of either non-indexation, but a real gap.
- BLOG QUESTION, TWO THINGS WERE CONFLATED, BOTH ANSWERED:
  (a) the 6 blog CATEGORY pages ARE published (200, no noindex, reachable by internal link) and are
      only withheld from the sitemap, per the documented astro.config.mjs:36-38 decision. = T-176.
  (b) NOT PREVIOUSLY FLAGGED: **4 blog POSTS carry `draft: true`, are not built, and return live
      404s.** Two are `sample-` scaffolds (336 and 420 words, read as placeholders). **The other two
      are finished-looking Field Stories at ~920 words each**: `the-cheap-container-that-wasnt`
      (925) and `contractor-who-stopped-losing-tools` (919). The published blog is 6 posts; two more
      are written and idle. Owner call: publish or kill. Publishing would take the blog 6 -> 8 and
      stop Field Stories being an empty category, which also feeds the T-176 thinness question.
- Addendum appended to `.outputs/analysis/2026-08-28-coverage-audit.md` with a revised 5-item
  action list, including "stop resubmitting those two URLs until the page changes".
- No src/ changes, no build, no commits this cycle.

## Cycle 11 (owner GO on four items; delivery draft lands and exposes unsourced statistics)

- OWNER GO on four things: expand /delivery/, add sitemap lastmod, publish the two Field Stories
  ("those are the white parables"), and link each parable from the appropriate use-case page
  (his example: the contractor parable on the contractors page).
- PRE-FLIGHT CHECKS by orchestrator: both parables are complete (925 and 919 words, full
  frontmatter incl. takeaways + FAQ + hero image + alt, format "White Parable"), and ALL FIVE
  referenced images exist on disk. Only `draft: true` holds them back.
- ORCHESTRATOR JUDGMENT CALL, owner told not asked: pubDate moves to 2026-08-28 rather than the
  July authoring dates (git-added 2026-07-08). They have never been public; they return live 404s.
  Publishing today under a July date would assert availability that did not exist, which is the
  same class of error T-166 had to remove. Cheap for the owner to reverse.
- Checked the T-166 guard (src/lib/compliance/fabricated-dates-guard.test.ts): it forbids only the
  retired 2026-03-10 literal and the buildPageSchema fallback. It does NOT validate blog pubDate
  against git, so publishing is not blocked by it.
- DISPATCHED TWO agents in parallel on non-overlapping files: astro-developer for the sitemap
  lastmod (astro.config.mjs + a new compliance guard), content-writer for the /delivery/ expansion
  DRAFT to .outputs. Deliberately held the third workstream (publish parables + wire links) so two
  agents would not run `npm run build` over the same dist/ concurrently.
- DELIVERY DRAFT LANDED: ~1,010 new visible words (page total ~1,350 after integration), 8 copy
  blocks + 5 FAQ pairs, all placed relative to existing sections with nothing replaced. Clearance
  figures reused verbatim from the existing page rather than invented. No dollar figure, no dash.
  In-context link to /blog/the-cheap-container-that-wasnt/ included as briefed.
- THE DRAFT'S REAL VALUE WAS THREE INTEGRITY FLAGS ON THE LIVE PAGE. Orchestrator verified all
  three independently by grep:
  1. **UNSOURCED STATISTICS, src/pages/delivery/index.astro lines 64 and 66**, inside a card
     LABELLED "Logistics Data": "**92%** of rural properties can receive tilt-bed delivery" and
     "**95%** of access issues are solved by crane-set". No source anywhere in the repo. Presented
     as data. This is the same class of failure as the fabricated dates an external reviewer caught
     on 2026-08-24. THE MOST SERIOUS FIND OF THE SESSION.
  2. **SELF-CONTRADICTION on the same page**: line 34 says "A 65-foot truck combination needs room
     to maneuver", line 65 says "60 feet is the average truck length".
  3. **UNSOURCED DURATION IN SCHEMA**: src/lib/schema/howto.ts:99 emits "Delivery takes 30-45
     minutes". Schema strips surrounding attribution (PROJECT_HS_003), so an unsourced number is
     worse there than in body copy.
- FALSE FLAG, ORCHESTRATOR'S OWN FAULT, CORRECTED: the draft also flagged "250 miles of Cincinnati"
  as invented, because the orchestrator's brief said the site had rejected it. THAT WAS AN
  OVER-GENERALISATION of the T-171 note, which rejected adding it to the PRODUCT PAGE confidence
  strip, not site-wide. Verified the opposite: 250 miles is DELIBERATE and DOCUMENTED. It is the
  GeoCircle in src/lib/schema/entities.ts (geoRadius 402336 m) with a thorough comment stating it
  matches the `region: 'home'` cities in src/data/cities.ts and the 250-mile language in page copy,
  and it appears twice in the homepage hero. NOT a fabrication. It also appears in the contractor
  parable (line 83), which is therefore CONSISTENT with the site and needs no change.
- No src/ changes, no build, no commits this cycle. astro-developer still in flight.

## Cycle 12 (delivery + parables integrated; social-posting question; n8n RULED OUT by the owner)

- INTEGRATION AGENT RETURNED, all five tasks done and verified: build exit 0, **447 tests pass**.
  dist/ greps confirm 0 occurrences of `92%`, `95%`, `30-45`, `Logistics Data`, and
  `average truck length`. Both parables build, appear on /blog/, and carry
  `<lastmod>2026-08-28T00:00:00.000Z</lastmod>` in sitemap-0.xml, which also proves the other
  agent's lastmod work still functions. /delivery/ emits FAQPage #faq with all 5 new pairs.
  Both in-context links render (/for/contractors/ and /cost/).
- The 92/95 card is now labelled **"Clearance At A Glance"** holding five figures already
  published in the main column (12 ft pinch, 14 ft overhead, 30,000 lb ground, 100+ ft approach,
  65 ft truck and trailer). Nothing invented. The 60-foot contradiction is gone. The howto step
  now reads "Coordinate timing with the driver. Be present to direct placement."
- AGENT JUDGMENT CALLS, all accepted: (1) `the-cheap-container-that-wasnt.md` sat in
  dash-guard.test.ts's EXCLUDE_ALL with an explicit retirement condition ("if it is ever tracked or
  published, remove the exclusion and fix the copy"); publishing triggered it, so its 4 em dashes
  were reworded and the exclusion deleted. (2) **/delivery/ came out at ~2,250 visible words, not
  the ~1,300 briefed** because the draft's own self-estimate was wrong; the agent integrated the
  approved copy in full rather than cutting it, and offered Block G as the first cut. Owner told,
  not yet answered.
- **OPEN BLOCKER: `src/content/blog/the-cheap-container-that-wasnt.md` IS UNTRACKED IN GIT (`??`).**
  It will 404 on Cloudflare until someone `git add`s it. Nothing has been committed this session.
- SOCIAL POSTING QUESTION. Owner asked whether to stand up a LOCAL WORDPRESS install with a free
  auto-poster plugin, or build his own app. Orchestrator verified, in session, rather than
  guessing: he runs an n8n instance with **209 workflows**, active daily schedules and a global
  error handler; it holds **46 credentials and ZERO social ones**; n8n has native LinkedIn
  (post:create), Facebook Graph API and X nodes but **NO Pinterest and NO Instagram node**; and
  steelboxdirect.com/rss.xml is live with 6 items, pairing with n8n's RSS Feed Trigger.
- THE ANSWER GIVEN: neither option. Scheduling was never the hard part; PLATFORM API ACCESS is,
  and a WordPress plugin does not skip creating a Meta app or getting a LinkedIn app approved. A
  *local* WP install is actively worse because OAuth callbacks and reliable cron both want a public
  host.
- **OWNER THEN RULED N8N OUT: it is his WORK account (wowbrands) and he keeps it separate from
  SBD.** Orchestrator confirmed this is consistent with the existing design principle that SBD is
  a portable channel, not an entity: automation on a work-owned platform is the one dependency he
  could not take with him. Pointed him at the substrate SBD already owns, GitHub Actions (3 cron
  workflows live in this repo today), Supabase and Cloudflare. He is leaning toward building his
  own planning dashboard and ASKED FOR THINKING ROOM, so no design was pushed at him.
- MEMORY WRITTEN: `sbd-automation-stays-off-work-accounts.md` plus its MEMORY.md index line, so a
  future session does not re-propose n8n for SBD.
- No commits this cycle. Working tree carries all the src/ changes plus one untracked blog post.

## Cycle 13 (SHIPPED and live-verified; the shallow-clone flag MATERIALISED in production)

- Owner: "Push the commit and the delivery page." Interpreted as ship everything as-is, keeping
  /delivery/ at full length (he did not ask for the trim that was offered).
- PRE-PUSH VERIFY, fresh: `npx vitest run` 21 files / **447 tests pass**; `npm run build` exit 0.
- STAGED SELECTIVELY so the unrelated, still-undecided UDO root-file migration (the deleted root
  markdown files, README.md, START_HERE.md) stayed OUT of these commits. Confirmed
  `git status --porcelain src/ astro.config.mjs` was empty before pushing.
- THREE COMMITS, pushed `e2e84a4..dad9939`, `main == origin == dad9939`:
  - `3c3fd80` feat(seo): derive a real sitemap lastmod, or ship none at all
  - `12411c2` fix(delivery): remove two unsourced statistics, then expand the page
  - `dad9939` feat(blog): publish the two white parables and link them where they land
  The previously untracked `the-cheap-container-that-wasnt.md` was `git add`ed, clearing the 404
  blocker.
- LIVE VERIFICATION AFTER DEPLOY, all passing:
  - Both parables HTTP 200; /delivery/, /for/contractors/, /cost/ HTTP 200.
  - **/delivery/ is 2,636 visible words live**, up from 347.
  - Zero live hits for `92%`, `95%`, `Logistics Data`, `average truck length`, or `30-45`.
  - FAQPage on /delivery/ carries all 5 Question nodes.
  - In-context links render: contractors 1, cost 1, delivery 2.
  - RSS feed went 6 items to **8**.
- **THE T-177 SHALLOW-CLONE FLAG CAME TRUE. This is a production failure.** Live
  sitemap-0.xml: **54 <loc> but only 8 <lastmod>**, against 52/52 locally. The 8 survivors are
  exactly the 8 blog posts, whose dates come from content frontmatter and need no git. All 46
  git-derived URLs ship bare. Cloudflare Pages clones shallow, so the module's
  `git rev-parse --is-shallow-repository` safety path fires on every deploy.
- ASSESSMENT: the SAFETY BEHAVIOUR IS CORRECT and must be preserved. A shallow clone makes
  `git log -1 -- <path>` collapse toward HEAD's date, which would have been a build timestamp
  wearing a git costume, i.e. exactly the fabricated-date failure the guard exists to prevent.
  The module chose to omit rather than lie. The right outcome, but the feature is ~85% dead in
  production.
- FIX DISPATCHED (astro-developer): move the git derivation OUT of the deploy build and into a
  COMMITTED artifact. A generator script walks git once where full history exists, writes a
  diff-friendly data file, and the sitemap module reads that file for non-blog routes instead of
  shelling out to git. Blog frontmatter path is untouched since it already works in production.
  Plus a STALENESS GUARD so the committed file cannot silently rot, and an explicit brief NOT to
  weaken the shallow check or fall back to a timestamp. Verification demanded includes SIMULATING
  the shallow/no-git environment and proving the lastmods survive. IN FLIGHT.

## Cycle 14 (shallow-clone fix shipped and live-verified; 54/54 lastmod)

- FIX RETURNED and was INDEPENDENTLY RE-VERIFIED by the orchestrator rather than taken on report:
  made a real `git clone --depth 1 file://<repo>` (confirmed `is-shallow-repository` = true,
  1 commit), rsynced the working tree over it leaving .git shallow, and built there.
  **RESULT: 54 of 54 lastmod, and the URL-to-lastmod map was IDENTICAL to the full-history
  build.** Also confirmed the reader starts no child process (0 hits for child_process/execSync/
  spawnSync) and the data table holds 46 entries.
- APPROACH SHIPPED: the git walk moved OUT of the deploy build into
  `scripts/generate-route-lastmod.mjs`, which runs where history exists and commits its answer to
  `src/data/routeLastmod.mjs` (46 entries, keyed by SOURCE MODULE not URL, so a new city inherits
  a date without regeneration). The build reads that table plus blog frontmatter and starts no
  subprocess, which is why a shallow clone can no longer change its output. A route missing from
  the table still ships bare. The generator REFUSES to write from a shallow clone, since
  committing wrong dates is worse than omitting them for one deploy.
  **The --is-shallow-repository safety check was preserved, not weakened.**
- STALENESS CANNOT CREEP IN: `route-lastmod-freshness-guard.test.ts` fails when a route's source
  module has a commit newer than the recorded date. Its git comparison SKIPS LOUDLY (stderr line
  saying it skipped, not passed) where history is unusable, rather than false-failing. Tier 1
  checks (shape, sortedness, keys on disk, no child process in the reader, every sampled URL
  dated) run everywhere.
- 459 tests pass, up from 447 (12 new). Build exit 0.
- COMMITTED `fdec056` and PUSHED `dad9939..fdec056`. main == origin == fdec056.
- **LIVE VERIFIED AFTER DEPLOY: 54 urls, 54 lastmod, 0 bare, 6 distinct dates
  (2026-07-06:4, 08-20:5, 08-24:28, 08-25:9, 08-26:3, 08-28:5), zero /admin/ or /blog/category/
  leaks.** The production failure from cycle 13 is closed.
- LESSON WORTH KEEPING: the shallow-clone risk was written down at T-177 BEFORE it happened, which
  turned a silent 85% regression into a same-session diagnosis and fix. Writing down the risk you
  chose not to solve is what makes it cheap later.

## Cycle 15 (RTO $99 planning opened; /ai-info/ layout bug fixed and shipped)

- OWNER FORWARDED A TEXT FROM DOUG: from 2026-09-01 My Container Rental makes $99 the standard RTO
  down payment for standard containers delivered within 150 miles, replacing 10% down, "no
  application or special approval needed"; 20% down over 150 miles; modified/specialty (side-
  opening, roll-up doors, office units) stay at 20%. June's $99 special roughly doubled volume.
  Owner asked to PLAN a blog post plus the pages it touches.
- CLASSIFIED ARCHITECTURAL under the brainstorming skill and said so: it changes a live program
  term with an effective date, collides with the pricing hard stop, and spans many pages.
- CONTEXT EXPLORED, THREE FINDINGS REPORTED:
  1. **Doug's memo contradicts the live page.** /rent-to-own/ is built around "Fill out the rent to
     own conex application" with "subject to third-party approval" in the step tag, quick facts,
     term note, comparison table and two FAQs.
  2. **No down-payment figure exists anywhere on the site today.** No "10% down". So this is NEW
     information, not a correction of a wrong number.
  3. **Two radii now exist**: the site's 250-mile home region (homepage hero + the entities.ts
     GeoCircle) vs Doug's 150-mile $99 threshold. Different things a reader will conflate.
- **OWNER RULING (he called Doug): the official status is the memo, but everything he observes
  still requires an application, so SBD KEEPS ITS EXISTING WORDING.** Do not publish "no
  application needed". Safer, and it leaves the RTO page's structure intact.
- SECOND FINDING THAT SIMPLIFIES THE WHOLE JOB: **SBD does not sell modified containers at all**,
  stated on /ai-info/, /for/homeowners/ and /for/contractors/. The catalog is three standard
  products (20ft, 40ft, 40ft HC). So Doug's specialty-exclusion clause applies to nothing SBD
  sells: every container SBD sells qualifies for $99 down inside 150 miles.
- THREE ORCHESTRATOR CALLS PUT TO THE OWNER (not questions): $99 lives in a canonical
  `src/data/rtoTerms.ts` module with a test, following the documented rentalStance.ts
  "fact never forks, wrapper always differs" pattern, never typed onto pages; the 150-mile
  boundary gets published plainly because hiding it recreates the exact trap the
  cheap-container parable warns about; and build now while stating "starting September 1, 2026".
- OWNER CHOSE THE WIDE SCOPE ("everything, city pages too") over the recommended core funnel.
- **PLANNING IS PAUSED MID-QUESTION.** The orchestrator was asking how city pages should handle
  the term, because the 2026-08-17 city-page pricing policy admits a price ONLY when interpolated
  from the pricing module, scoped to a named ZIP, with effective date and population-centroid
  basis, and $99 down is a FLAT PROGRAM TERM matching none of those. Also the 150-mile rule splits
  the city list: roughly inside are Cincinnati, Dayton, Columbus, Louisville, Lexington,
  Indianapolis, Huntington; outside are Cleveland, Detroit, Houston, New York, Kansas City,
  Charleston, Savannah, Norfolk. The two options offered were amend the policy with a new decision
  record and drive each city page from a computed distance, or link-don't-state. **The owner
  interrupted before answering. Do not proceed past this gate without his call.**
- INTERLEAVED QUICK FIX, SHIPPED: owner reported /ai-info/ rendering flush to the left edge with a
  screenshot. CAUSE: `article { max-width: 800px; line-height: 1.6 }` with no centring and no
  gutter, so the measure was right and the position was not. **The identical line was on
  /terms/ and /privacy/**, so all three were fixed rather than leaving two known-broken pages.
  Each article now sits in the site's standard `.wrap` (BaseLayout: max-width + margin 0 auto +
  32px gutter dropping to 20px on mobile, already used by 109 elements) with margin-inline: auto
  to centre the 800px measure inside it, plus padding-block for room under the header. No new
  spacing values invented. VERIFIED IN A BROWSER before pushing (Playwright screenshot against a
  local server over dist), not just in the HTML. 459 tests pass. Committed `9a78f7a`, pushed
  `fdec056..9a78f7a`, and LIVE-VERIFIED on all three URLs.

## Cycle 16 (2026-08-31: the 150-mile origin was wrong; CTA design settled)

- **ORCHESTRATOR ERROR, OWNER-CORRECTED.** The orchestrator read Doug's "delivered within 150
  miles" as 150 miles FROM CINCINNATI and built an analysis on it: computed straight-line
  distances for all 15 metros, concluded 8 of them (Norfolk 474 mi, Houston 893, New York 567,
  Savannah 522, Charleston 506, Kansas City 540, Detroit 236, Cleveland 223) could not offer $99,
  and told the owner his own Norfolk screenshot was the exact failure case.
  **The owner corrected it: the 150 miles is measured FROM THE DEPOT the container ships from.**
  '$99 is available to any location but if it's over 150 miles from a depot then it's 20% down.'
  That is consistent with the site's existing 'we deliver nationwide from depot hubs' language in
  src/lib/schema/howto.ts. THE WHOLE DISTANCE ANALYSIS IS VOID.
- CONSEQUENCE, and it simplifies the build: the CTA is EVERGREEN and IDENTICAL on all 15 city
  pages. No geo-awareness, no distance data, no per-city variants, and the earlier
  "the city list splits in half" problem does not exist.
- **CTA DESIGN SETTLED, in the owner's own words.** Placement: the empty right column beside the
  delivered-price block on city pages (he screenshotted it on /locations/virginia/norfolk-.../).
  Headline: 'Find out how you can get your shipping container for one easy down payment as low as
  $99!' Small print, with the depot correction folded in: 'Pending third-party approval. $99
  applies to standard containers delivered within 150 miles of the depot your container ships
  from; 20% down beyond that. Delivery distance also affects your monthly payment.'
  Links to /rent-to-own/ and its down-payment section.
- ONE ITEM SURVIVES THE CORRECTION, for a different reason than distance: the city-page pricing
  hard stop admits a price ONLY when interpolated from the pricing module, ZIP-scoped, with
  effective date and centroid basis. $99 is a FLAT PROGRAM TERM from a different module and meets
  none of those, so a decision record amending the policy is still needed. Owner has not objected.
- NEXT: write the spec, then invoke writing-plans. Nothing built yet.

---

**DATE ROLLED to 2026-08-31 during cycle 16.** Cycle 16 above was written before the rollover was
noticed and is left in place rather than duplicated. The session continues in
`history/2026-08-31-session-transcript.md` from cycle 17.
