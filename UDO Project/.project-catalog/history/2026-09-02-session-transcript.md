# Transcript: 2026-09-02

Continues `2026-09-01-session-transcript.md` across the date boundary. Earlier cycles of this same
working session (resume, T-168 integration, Screaming Frog audit, security headers, GSC
adjudications, RTO social pack, Bing backlink gap) are appended to that file and are not duplicated
here.

## Cycle: the Indianapolis impressions question (T-192)

Owner asked why `/locations/indiana/indianapolis-shipping-containers/` is "getting a ton of
impressions" and whether there is opportunity there, supplying a GSC xlsx export.

**Analysed rather than answered from intuition.** Read all 7 sheets of
`user uploads/Search console/Sep/https___steelboxdirect.com_-Performance-on-Search-2026-09-02.xlsx`
(Web, last 3 months, 44 clicks / 11,015 impressions site-wide).

**The answer inverted the premise, and that was the useful part.** The impressions are not
opportunity:

- The page holds 1,652 impressions and 3 clicks at **position 65.3**, CTR 0.18%. Page 7 of Google.
- Legacy `/indianapolis-shipping-containers/` holds 652 more at position 61.4, so 2,304 impressions
  (21% of all site impressions) sit on one city's two URLs.
- **Every** query containing indiana/indianapolis/indy totals **164 impressions** across 27 queries.
  Against the page's 1,652, local demand is arithmetically impossible as the driver.
- Root cause found: **brand confusion.** 37 queries containing "steel box"/"steelbox" carry 1,186
  impressions and **zero clicks**, aimed at BigSteelBox and steelbox.fr, both different companies.
  `/ai-info/` holds 499 impressions at position 5.3 with 0 clicks, which is the steelbox.fr query.
- **The reframe that mattered most:** impressions went 94/day (08-17) to 585/day (08-30), roughly 6x,
  while clicks stayed flat at 0 to 2/day. Told the owner plainly not to read the impression growth as
  validation of recent work.

**Stated the limit rather than papering over it:** the export is site-wide, not page-filtered, so the
query-to-page join is INFERRED. Gave him the exact two-minute check (GSC Performance, filter
Page = exact URL, Queries tab). Not yet run.

**The actionable residue:** "shipping containers for sale indianapolis" ranks **position 70.5** for a
purpose-built 1,052-word page. That is the authority constraint measured a fourth time this session,
after the T-175 crawl-budget diagnosis and the T-191 zero-shared-domains finding. Recorded that
signal splitting is real and measurable too (899 impressions still on four correctly-301'd legacy
URLs).

Report at `.outputs/seo/2026-09-02-indianapolis-impressions-analysis.md`. T-192 raised, high.

## Cycle: session close-out

Stop hook fired for a missing 2026-09-02 session log. Written at
`.project-catalog/sessions/2026-09-02-session.md` with the usual root pointer at
`../../.project-catalog/sessions/2026-09-02-session.md`, since the path migration is still undecided
and CLAUDE.md still points at the root.

PROJECT_STATE.json was already current (counter 0, updated at T-192).

**Tree state at close: still zero commits.** T-168's post and its one guard allowlist entry remain
uncommitted on the owner's explicit hold. The route-lastmod regeneration handoff is recorded in both
the session log and T-168 so the freshness guard is not tripped whenever that commit does happen.

## Cycle: page-filtered export arrives, two of my claims fall

Owner supplied the filtered export I asked for. Measurement replaced inference, and **two things I
had told him were wrong.** Corrected in the report and in T-192 rather than quietly amended.

1. **Brand confusion was NOT driving that page.** I had attributed part of its impressions to the
   "steel box"/"steelbox" queries. On this page that is 6 queries and 40 impressions, 2.5%. The
   1,186-impression problem is real site-wide but sits on other URLs, mainly `/ai-info/`.
2. **I called the queries broad noise. They are the best queries on the site.** 122 queries and
   1,114 impressions, **68.6%**, are "near me" commercial searches. Only 1.8% are Indiana geo
   queries, and zero name any other city, so Google has specifically chosen this page as the site's
   answer to un-geo-qualified "near me" search.

Corrected verdict: **right demand, unreachable rank.** 98% of impressions at position 41+, 64.5% at
61+. Zero clicks on 1,624 impressions is the arithmetic of that, not a CTR defect. The page's
targeting was already correct, which is the opposite of what my first read implied.

**The tell I would not have predicted:** device split is 1,545 desktop to 79 mobile, 95/5, on
*near me* queries, which is backwards from real behaviour. Desktop SERPs render far more results, so
a position-66 listing registers an impression on desktop and almost never on mobile. The impression
total is substantially an artifact of desktop SERP depth rather than reach.

**This redirects the recommendation.** "Near me" intent is won in the local pack, not with a city
page, so **T-155 (GBP primary category, recheck due ~2026-09-04) is the lever for this demand.** The
filtered export is independent evidence that T-155 is the highest-value open item on the board.

## Cycle: audit against the "Google is Banning AI Websites" transcript

Owner asked whether SBD falls into any of the traps named in a YouTube transcript, and whether any
ideas in it are worth taking, naming one himself: a real local image per location page.

**Flagged the source honestly before using it.** The video is a funnel for a paid community and
several claims in it are unsourced. But its core framing is checkable: Google publishes a scaled
content abuse policy that names templated location pages, so the four signals were worth auditing
against. Audited from repo, live site, the 2026-09-01 crawl and git history, not from the video.

**Result: 2 of 4 signals clean, 2 with one specific fail each.**

- **Content sameness: PASS with evidence.** Screaming Frog Near Duplicates = 0 and Semantically
  Similar = 0 (post-crawl analysis had completed, so the zeros are real), and `cities.ts` carries
  **27 per-city fields**. This is the trap the video says kills location pages and SBD is not in it.
- **Behavior signals: no data to pass or fail.** 44 clicks in 3 months site-wide; the Indianapolis
  page has 0 clicks on 1,624 impressions. Not a slop problem, a rank problem. The engagement fix the
  video recommends (a real person answering) SBD already has via Doug and T-171.
- **Site patterns: one clear fail.** Publish pace is fine (max 3 new page files/day, no dumps) and
  Doug Froh is named on the homepage with socials. But **`/about/` and `/contact/` both 404.** That
  is the most direct hit in the transcript. Raised as **T-193**.
- **No experience: one clear fail, and it is the owner's own instinct.** Prices, ZIPs, counties,
  zoning and phone are all real. But **all 15 city pages carry zero content photos** - the only
  `<img>` tags are two logos, a partner logo and a review QR, and `cities.ts` has no image field at
  all. Raised as **T-194**, with an explicit warning that repeating one stock photo across 15 pages
  would defeat the purpose and manufacture a sameness signal that does not currently exist.

**Disagreed with the video on one point rather than passing it along.** It says local business sites
do not need blog posts. That does not transfer here: SBD's blog is load-bearing for the AEO strategy,
which is the one thing on this project with confirmed positive results. The video addresses
rank-and-rent micro sites monetised by phone calls. Told the owner not to cut the blog on that advice.

Report at `.outputs/seo/2026-09-02-scaled-content-abuse-audit.md`.

## Cycle: T-193 About + Contact built (owner-approved), and the 50-cities review

Owner approved ideas 1 and 2 from the slop audit ("I think we need to use those first 2 ideas"),
agreed with my disagreement on the blog point, and deferred the author-byline question. Dispatched
astro-developer for About and Contact immediately, since T-194's photos are blocked on his yard shoot.

**Built and orchestrator-verified in the BUILT HTML rather than trusted from the report:** both pages
show 0 founding-date references, 0 `info@`, 0 em/en dashes, 0 dollar amounts, no street address;
`support@` on `/contact/` only; phone character-identical. Build exit 0, 601 tests unchanged, 66 to 68
routes, sitemap 58 to 61.

**One thing worth recording so nobody "fixes" it:** a grep of the SOURCE flags `2009` on About and
`info@` on Contact. Both are source comments documenting the rules. They render as zero.

**A correction the agent made that I did not ask for and that was right:** the footer's `/quote/`
link was previously labelled "Contact", so anyone hunting for contact details landed in the quote
form. It relabelled that to "Get a quote" and pointed "Contact" at the real page.

**Reviewed the "50 Cities in One Day" transcript (T-195).** Same creator, different business model
(rank-and-rent, 50 EMD domains), so most of it does not transfer and that was said plainly. But his
core thesis, skip the biggest city and build the #2 to #4 metro, is **confirmed by SBD's own GSC
data**: ranked by average position, Huntington WV, the smallest market targeted, is FIRST at 29.3, a
13-point margin, while Norfolk (84.7), Houston (79.0), Savannah (78.9) and Kansas City (73.7) are
worst. Paired it with the crawl finding that in-footprint city pages sit at depth 1 with 138-140
inlinks while out-of-footprint ones sit at depth 2 with 2. Explicitly told him this is NOT a
recommendation to delete them, because they exist under his own serviceability ruling (T-046).

**Owner caught a real hole and I logged it rather than answering it.** "GBP is not possible for those
cities so we need a strong plan." He is right: a GBP needs real presence, so the 7 out-of-footprint
city pages cannot have one, and fabricating a location was already ruled out under T-155. That sits
in direct tension with the T-192 finding that near-me intent is won in the local pack. He is sourcing
a non-GMB video and asked to bring it himself, so the plan was deliberately NOT designed ahead of him.

## Cycle: transcripts 3 and 4 reviewed

**Transcript 3, "How I Rank #1 in 7 Days" (same creator as 1 and 2).** Most useful of his three
because it addresses a primary local site rather than a network. Two outcomes:
- **T-196 raised, high:** GBP allows up to 10 categories and most businesses set one. T-155's whole
  diagnosis was a category problem, the owner changed only the PRIMARY on 2026-08-21, and nine slots
  may be empty. Free, same-day, reversible, and it attacks the top open item. Told him to do it in the
  same sitting as the ~09-04 recheck. Added the honest caveat that this only holds for genuinely
  accurate categories.
- **T-197 raised as an explicit DEFERRAL** so nobody rediscovers and builds it: neighborhood pages.
  Three measured reasons against it now, the strongest being that Google will not crawl `/delivery/`
  at depth 1 with 272 inlinks, so 50 more URLs adds 50 uncrawled URLs and dilutes the binding
  constraint. Also corrected his "buy a backlink for $100-300" framing: chamber membership is
  legitimate, paying for a link is link buying. Told him to skip the "invisible URLs" tactic he
  declines to describe on camera.

**Transcript 4, "Keywords Are Dead" — different and much better source**, a local-SEO agency owner
reacting to Neil Patel and correcting him where wrong. The owner's read ("verifies what the site is
intended for") is right, and two findings go past validation:

1. **T-155's "immovable" constraint may shrink.** Ask Maps shipped in March; he reads it as a
   harbinger of Gemini entering the map pack, which would drop PROXIMITY in favour of ATTRIBUTES.
   Proximity is the one factor SBD structurally cannot compete on. Logged onto T-155 with the honest
   status that Ask Maps is real but the map-pack inference is his, not measured.
2. **SBD's rank problem and its AI-visibility opportunity are separate scores.** 90% of AI-cited pages
   rank 21 or lower; AI citations from Google's top 10 fell 76% to 38%. After two days of uniformly
   bleak rank findings (T-175, T-191, T-192, T-195), this is the first evidence that the AEO lane is
   open while the organic lane is blocked, and it matches SBD's own observed Gemini flip. It is also
   the rebuttal to three straight videos calling blogging the worst rung.

Also raised: **T-198** (change the review ask to "what happened and what was the outcome", rotate to
Yelp and Angi, because Gemini reads review TEXT for attributes and weights non-GBP reviews);
**T-199** (check for a Bing Places listing, since ChatGPT uses Bing; the only ChatGPT-specific lever
in four transcripts); **T-200** (write the "not a fit" content, the one gap in his four-part trust
framework, and the most SBD-shaped piece available given the existing honesty posture); **T-201**
(deprioritise `ai-brand-monitor` rather than fix it, on his specific evidence that AI visibility
trackers do not work, which saves the Apify setup effort).

Noted that his corrections to Patel are sound: roundup articles are discounted now, Reddit far less
cited than a year ago, and national off-site mentions matter much less for a local business, which
partially offsets T-191's urgency without cancelling the local-links half of it.

## Cycle: ScrapeBox harvest analysed, then the 12 link targets strategised

**T-203, the harvest (1,357 URLs / 1,322 domains).** Owner warned it was not fully cleaned and he was
right: 711 of 1,322 (54%) carry no container word. Every figure in the report states which population
it covers. Three findings: all 13 Bing-compared competitors also appear in the harvest, so two
independent methods agree on the competitive set and T-191's premise was sound; 62 state-name-plus-
container EMDs confirm the micro-site pattern is real in this exact niche; and cross-referencing the
harvest against the 1,411 Bing referring domains produced **45 domains that both rank and link**,
triaged into four buckets. That cross-reference also **corrected T-191's own target table**: its top
two coverage-ranked targets, seacanfox and ftshippingcontainers, rank for the money keywords
themselves, so they are competitors rather than prospects.

**Then strategised the 12 editorial targets, with live verification. Half died.**
3 KEEP (ccr-mag, smallbarndo, housedigest), 3 conditional MAYBE (livinginacontainer, illustrarch,
re-thinkingthefuture), **6 REJECT because they sell links** (urbansplatter on Fiverr/brokers at
$20-250 a dofollow post; kreafolk's own advertise page sells "Link Insertions"; skyryedesign is
Legiit inventory priced on DR; thehomesteadsurvival routes contributors to a buy-guest-posts
marketplace; buildgreennh carries its own Generative AI Disclaimer; designingidea's only listing
route is a CSLB/ROC contractor directory SBD is geographically ineligible for).

**I spot-checked one reject myself** rather than taking the report on trust: fetched
kreafolk.com/pages/advertise and confirmed it sells "Link Insertions" and guest posts by name. The
agent's method holds.

**The load-bearing idea, and it is a good one:** SBD is not pitching container homes, it is pitching
**the procurement and provenance step that comes before every container home.** Every build these
publishers cover starts with someone buying a used box off the secondhand market and none of them
cover how to verify what arrives. It is also the only frame that survives PROJECT_HS_003, because an
architecture audience wants structure, load, permits and zoning, all of which SBD is barred from
determining.

**T-204 raised:** a free ISO 6346 check-digit validator. The arithmetic is already documented
character by character in the live post, so the spec is done. The point is not the tool, it is the
reclassification: resource pages link to free calculators and never to sellers.

**Carried forward as explicit caveats** rather than buried: four sites 403'd the agent's fetcher and
rest on snippets; whether the existing competitor links on any of the twelve were editorial or paid
is unknown, because Bing gives domain and count only; and every DR/DA/traffic figure is a vendor
claim quoted to show what is being sold, not a measurement.

**A stop condition was written into the sequencing and I am keeping it:** zero placements after six
weeks with one follow-up each means stop national editorial outreach and redirect to the local lane.
Realistic round-one yield is zero to two links, and without a pre-agreed stop, that normal outcome
tends to get treated as a reason to lower the standard and start paying.
