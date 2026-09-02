# Session transcript: 2026-08-27 (new session; cycle numbering restarts)

## Cycle 1 (owner "resume": state re-established, no work executed)

- Owner said "resume" with no target. Orchestrator read state before answering.
- FOUND: the root-level UDO files the CLAUDE.md rules point at no longer exist. Root
  `PROJECT_STATE.json` and `.project-catalog/` are deleted-but-uncommitted; the live
  records are under `UDO Project/`. Read `UDO Project/HANDOFF.md`,
  `UDO Project/PROJECT_STATE.json`, and the memory `pending-work.md` instead.
- VERIFIED sync: `git ls-remote --heads origin main` returns `e2e84a4`, equal to local
  HEAD. Nothing unpushed. (Memory said `03ec219`; the newer `e2e84a4` is the
  2026-08-26 handoff docs commit, already pushed.)
- Todo census: 171 records, 12 in_progress, 109 pending, 2 killed. Todo bodies live under
  the `task` key, not `content`.
- Read the open highs T-155, T-171, T-170, T-159, T-163, T-168, T-124. Every one of the
  top items is gated on an owner action (Doug callback test, yard photos, Gemini
  illustrations, Ryan's live date, the ~2026-09-04 Maps recheck).
- REPORTED to owner: clean state, uncommitted UDO-migration deletions flagged, owner-desk
  critical path listed, two options offered (write the T-168 BIC plate self-check blog
  post, or he names a target). Recommended the blog post as the only unblocked
  high-value item. Awaiting his pick.
- NO code changes, NO build, NO deploy, NO commits this cycle.

## Cycle 2 (UDO compliance close-out)

- Stop hook fired: no session log for 2026-08-27. Created
  `sessions/2026-08-27-session.md` and this transcript; updated `PROJECT_STATE.json`
  (`last_updated`, prompt counter, session_count, notes).

## Cycle 3 (T-168 move 1 started; the planned premise was REFUTED by verification)

- Owner picked option 1: the BIC self-check blog post (T-168 move 1).
- Orchestrator read T-168 and T-163 in full, plus the blog collection schema
  (`src/content/config.ts`, 6 fixed categories) and post 1's frontmatter as the format model.
- DISPATCHED researcher to verify the free BIC tools BEFORE drafting, on the standing
  evidence protocol. Brief asked for primary sources and explicit UNVERIFIED labels.
- RESEARCH LANDED and BROKE THE PLAN. Three premise failures:
  (1) NO free public tool returns a container's CSC examination status. BoxTech gates
      `inspection_date`, `next_inspection_date`, `certificate_expired` and
      `certificate_details_match` behind a `CertificateViewer` permission (verified in the
      BoxTech OpenAPI spec). The ACEP database indexes PROGRAMMES AND OPERATORS, not
      containers, and BIC publishes its own disclaimer that absence "DOES NOT MEAN that an
      ACEP is not valid."
  (2) BoxTech is free but NOT public: a free account is required, no anonymous lookup.
  (3) BoxTech coverage is VOLUNTARY, ~45% of an estimated 25M+ global fleet as of
      Sept 2019 per UK MCA MIN 633 (M) 2.4/2.3. A miss is expected and proves nothing.
- CITATION CORRECTED before it could ship: the ACEP publication duty is IMO Resolution
  MSC.310(88) (adopted 2010-12-03, in force 2012-01-01), NOT the "CSC 2014 amendments."
  MSC.355(92) (in force 2014-07-01) amends plate contents and SI units only. The BIC
  database is IMO-ENCOURAGED (CSC.1/Circ.143, CSC.1/Circ.138/Rev.1), not mandated.
- Agent had no write tool; orchestrator saved the deliverable to
  `.outputs/research/2026-08-27-bic-self-check-verification.md` (20 publishable claims,
  13 do-not-publish items, 4 premise flags).
- FLAG 4 CLOSED BY ORCHESTRATOR via Playwright: bic-acep.org is a client-rendered SPA the
  researcher could not exercise. Ran it live. Search is PUBLIC, no login. Four search-mode
  buttons as documented. Deep-link pattern `/prefix-search/<PREFIX>` verified. Result
  columns: ACEP NUMBER | CONTAINER OPERATOR(S) | DELIVERING AUTHORITY | ADMINISTRATION.
  Live results captured: MSCU = one row (RINA / Italy), TGHU = TWO rows (Bermuda, so one
  prefix can carry multiple ACEPs), HJCU = "No results found". Addendum appended to the
  research file with retrieval date 2026-08-27.
- LIVE-TESTED GOTCHAS now on record: PONU resolves to Maersk A/S (register shows today's
  prefix holder, not the box's owner); HJCU returns "No code found" (defunct lines vanish);
  KEIU, the worked example in our own ISO 6346 post, is NOT in the register and must not be
  used as this post's example; `bic-code.org/bic-codes/check-digit-calculator/` is a dead
  path, the calculator is at `bic-code.org/check-digit-calculator/`.
- RE-SCOPE DECIDED by orchestrator (owner told, not asked; nothing published, cheap to
  reverse): the post becomes IDENTITY AND PROVENANCE, not certification status. Spine:
  expectations -> check digit -> prefix owner -> BoxTech Sold/Scrapped/Lost/Stolen alerts
  (the buyer-protection check, free account, uncovered by us or competitors) -> plate +
  ACEP database -> the honest wall (condition and exam status need physical inspection per
  49 CFR 452.3; none of it required for domestic storage per 49 CFR 450.1).
- DISPATCHED content-writer with a source-locked brief: publish only from the verified
  list, flag anything unsourceable rather than inventing it. Draft to
  `.outputs/content/2026-08-27-bic-provenance-self-check-post.md`. IN FLIGHT.
- No src/ changes, no build, no commits this cycle.

## Cycle 4 (draft landed, verifier FAILED it on 2 ship-blockers, all 7 fixes applied)

- content-writer returned the draft to
  `.outputs/content/2026-08-27-bic-provenance-self-check-post.md`, ~2,400 body words,
  plus its own "CLAIMS I WANTED TO MAKE BUT COULD NOT SOURCE" list (10 items) instead of
  inventing detail. No src/ files touched.
- Orchestrator spot-check first: 0 em dashes, 0 dollar figures, 0 KEIU, no duplicate
  frontmatter keys (an earlier apparent duplicate was an artifact of the orchestrator's own
  overlapping sed/awk read, not the file).
- DISPATCHED verifier with 14 adversarial criteria against the source-lock file.
- VERIFIER VERDICT: FAIL overall, 2 ship-blocking, both trivially fixable. 12 of 14
  criteria PASS, including frontmatter build-safety (category byte-exact to
  BLOG_CATEGORIES[0]), all 5 internal link targets confirmed to exist in the repo, FAQ
  self-containment, no check-digit duplication, CFR cited by number with no ecfr-implying
  URL, and the honesty position reinforcing rather than undercutting the certification guide.
- SHIP-BLOCKER 1: the draft published the dead URL string
  `bic-code.org/bic-codes/check-digit-calculator/` verbatim as a warning. Greppable and
  copyable, and it is do-not-publish item 9. FIXED: rewritten to warn without the string.
- SHIP-BLOCKER 2: the working-note section publishes the USCG host and carrier tracking
  pages (do-not-publish items 11 and 12). FIXED by marking it with an explicit
  DELETE-BEFORE-INTEGRATION block rather than removing it, since the owner should read it.
- FIVE MORE FIXES APPLIED: unsourced frequency claim "it usually means the code was
  retired" -> "a retired code is one common explanation"; title and takeaway overclaimed
  "public" when BoxTech has no anonymous search -> "4 Lookups" / "these free lookups";
  unsourced "almost always U for freight containers" cut; unsourced "takes about two
  minutes" cut; retrieval-date parity added to the HJCU register miss.
- POST-FIX RECHECK: 0 occurrences of the dead URL, 0 em dashes, 0 KEIU. Draft sent to the
  owner for review.
- STILL NOT DONE: owner review, then strip the working note, move into
  src/content/blog/, build, and ship. No src/ changes, no build, no commits this cycle.

## Cycle 5 (2026-08-28: GSC impression surge analysed; coverage win, not a ranking win)

- Owner supplied `user uploads/Search console/Aug/https___steelboxdirect.com_-Performance-on-Search-2026-08-28.xlsx`
  and asked what caused a post-08-21 jump he read as "nearly double".
- MEASURED: baseline 2026-07-30..08-20 = 2,222 impressions over 22 days = 101.0/day.
  2026-08-21..08-26 = 2,180 over 6 days = 363.3/day. Settled 5 days = 398/day.
  **3.6x to 3.9x, not 2x.** Owner's read corrected. Plateau ~435/day held 3 days.
- THE CATCH: clicks did not follow. 15 clicks in the whole 28 days, site CTR ~0.31%.
  Average position moved the WRONG way, ~44 -> ~47.4. Desktop 3,459 impressions at position
  51.3; mobile only 923 but at position 26.6. Signature = COVERAGE EXPANSION, not a ranking win.
- WHERE IT SITS: location pages are 2,151 of 4,891 page impressions (44%).
  /locations/indiana/indianapolis-shipping-containers/ alone = 870 impressions (18%) at
  position 65.8 for 3 clicks.
- WHAT IS NOT DRIVING IT: every page shipped in the 08-21..08-26 sprint is absent or negligible
  (cert guide, inspector finder, conex-boxes-for-sale, portable-storage, rent-vs-buy calculator,
  cert blog post). The surge is on pages that already existed, so the cause is template-level and
  site-level, not new content.
- RANKED CAUSES (Tier 1): city-page template expansion (3a9c97d delivered prices 08-19,
  5637e81 call CTA 08-19, 669f91b all-3-sizes Quick Facts 08-24, 15ff7c2 4th city FAQ 08-24) and
  crawl/dupe unblocking (91a4b8f robots+Content Signals 08-19, 78e5f48 trailing-slash city 301s
  on 08-21 = the exact jump date, 488abd5 breadcrumb schema fix 08-24). Tier 2: 907fc0f GKP
  vocabulary (08-25, can only explain the plateau), product JSON-LD (Product snippets appearance
  is NEW at 137 impressions/pos 76.9), and the owner's 08-21 GBP category change.
- FLAGGED AS NOT-A-WIN: ~330 impressions (~11% of listed query impressions) are brand-name
  collision with other "steel box" companies incl. BigSteelBox Canada and steelbox.fr
  ("what is the company name for steelbox.fr" = 88 impressions at position 5.5). Plus ~400
  impressions of out-of-area demand (New York 195, Houston 129, KC, Charleston, Savannah,
  Norfolk, Shreveport, Texas) the business cannot serve.
- HONEST LIMIT STATED TO OWNER: this export's Pages and Queries tabs are 28-day TOTALS with no
  per-day split, so attribution is INFERENCE from commit timing plus volume distribution, NOT
  proof. The 2-minute action that settles it: GSC Performance -> Date -> Compare
  08-15..08-20 vs 08-21..08-26, read Pages and Queries by impression difference.
- Analysis written to `.outputs/analysis/2026-08-28-gsc-impression-surge.md`.
- No src/ changes, no build, no commits this cycle.

---

**DATE ROLLED to 2026-08-28 during cycle 5.** Cycle 5 above was written before the rollover was
noticed and is left in place rather than duplicated. The session continues in
`history/2026-08-28-session-transcript.md` from cycle 6.
