# Transcript: 2026-09-10

Continues `2026-09-09-session-transcript.md`.

## Cycle: landing pages tabled, location-page strategy opened (T-214)

Owner tabled the mockups ("that looks good, lets table it for now") and asked to strategize leveraging
the location pages for traffic. Classified as strategy: the deliverable is a recommendation, and the
approval gate holds before anything is built.

Measured the baseline before theorising. The 15 city pages plus the hub are 46% of site impressions
and 10 of 52 clicks. Best positions are Huntington 25.3 and Cleveland 34.4, which are NOT the biggest
markets; the biggest impression earner, Indianapolis at 2,910, sits at 61.7 and its own page-filtered
export showed 95% desktop on near-me queries, i.e. mostly scraper traffic.

CHECKED A SUSPECTED DEFECT AND CLEARED IT: GSC lists both /indianapolis-shipping-containers/ and
/locations/indiana/indianapolis-shipping-containers/, which looked like split equity. Curl shows the
flat URLs 301 to the /locations/{state}/ paths, the canonical points to the new path, and only the new
path is in the sitemap. The duplicate rows are historical. Reported as cleared rather than as a find.

Two analyses dispatched: seo-analyst (template vs unique content quantified per field, inbound internal
link counts per city, depot-page verdict, hub gap, one structural change) and researcher (live SERP
composition for five footprint city queries, who ranks without a local yard, what Google documents
about proximity and service-area eligibility for a one-address seller, long-tail shapes a
single-location seller can actually win, competitor city-page teardowns, and honest timeline evidence).

## Cycle: SERP research in, and it argues against the premise

Researcher could not write files (read-only toolset), so I transcribed the findings to
.outputs/research/2026-09-10-local-serp-composition.md rather than lose them. Four findings that cut
against expanding city pages: (1) Google ranks local results by distance from the VERIFIED address and
Sterling Sky's longitudinal test found service areas are visual only, so 14 of 15 cities have no
local-pack path and only Dayton is inside the documented two-hour boundary; (2) the pages that rank
these queries are 1,800 to 10,000 words with transactable priced inventory and hundreds to thousands of
third-party reviews, against SBD's 800 to 1,000 words and 11 reviews; (3) containeralliance ranks in
Columbus with no prices, no FAQ and no address, which is clean evidence that domain prominence rather
than page quality is being rewarded; (4) the only SBD pages near page one are content, /ai-info/ at
5.2 and the listicle at 10.7, while city pages sit at 42 to 85. Honest timeline evidence: only 1.74% of
new pages reach the top ten within a year.

THE WINNABLE SHAPE the research did find, with live SERPs as evidence: place-name plus regulatory or
logistics queries are won by content and government pages with zero yards present. A Conexwest BLOG
POST outranks louisvilleky.gov for Louisville container zoning. "Shipping container permit hamilton
county ohio" has nothing county-specific on page one at all. And the incumbent that ranks for Ohio
zoning cites no code sections, names no departments and links to zero government sources, while
cities.ts already holds eight verified county zoning-office URLs per city, buried in a sales-page
footer.

I then closed the researcher's own most important gap myself. The cannibalization hypothesis from the
August analysis is FALSE: comparing the 09-02 and 09-06 exports, no page lost impressions and every
supposed victim gained. Dismissed. The same comparison produced a sharper fact: city pages gained
1,910 impressions in four days for zero additional clicks, five before and five after.

## Cycle: page audit in, verified, strategy formed

Audit transcribed to .outputs/seo/2026-09-10-location-page-audit.md. I verified its three load-bearing
claims rather than relaying them: /locations/{state}/ returns 404 for ohio, kentucky and indiana;
"Local Delivery Expert" does render on the Norfolk and Houston pages; and a probe of Huntington's
areaProfile sentence confirms it is absent from the built HTML and present in the .md twin.

I CORRECTED the agent's framing on that last one. It called 1,042 words of local prose "invisible to
Google". The .md twin is served and is the AEO surface, and /ai-info/ ranks 5.2, the best position on
the site. So the prose is feeding the channel that works. Rendering it in HTML is an addition, not a
rescue.

The two reports agree from opposite directions, which is what makes the recommendation safe: the audit
found that content volume does not predict position within the set (Norfolk 315 unique words at 84.7,
Dayton 174 at 43.4), and the research found that the ranking incumbents win on domain prominence and
review mass rather than page quality (containeralliance ranks in Columbus with no prices, no FAQ, no
address). Both point away from "write more city copy".

Strategy going to the owner: stop competing for "containers for sale [city]", which 14 of 15 cities have
no local-pack path to win. Redirect the same effort to the shape the live SERPs show is winnable by
content, county-level permit and zoning answers, where SBD already holds 92 verified zoning-office URLs
against an incumbent that cites no code sections and links to zero government sources. Second, build
the missing state layer, which is the only way to give the eight depot pages honest inbound links
without claiming home-region service in the global nav.

## Cycle: owner said proceed. Over-claim fixed, permit pages dispatched

T-216 DONE first because it was a correctness defect on live pages, not an optimisation: "Local
Delivery Expert" rendered on all fifteen city pages including Norfolk, Houston and New York. Gated on
region === 'home'; depot pages now read "Depot Network Delivery". Verified across all fifteen built
pages, 672 tests pass, build exit 0. Uncommitted.

T-215 dispatched: county permit answer pages from the 80 verified zoning entries already in cities.ts.
The brief leads with WHY (the SERP asymmetry) and then makes the permit hard stop the binding
constraint over every SEO instinct: signposts not determinations, disclaimer sentences reused verbatim
from the existing permits page, and a new compliance test that fails the build if a determination
phrase appears. Also instructed to add the contextual city-to-permits links the audit found missing.

## Cycle: permit verification FAILED on a claim my own scan could not catch

Verifier passed seven of nine items (build exit 0, 703 tests, 77 unique county+state pairs matching an
independent parse of cities.ts, 3 dual-office and 4 same-name-different-state pairs correct, zero
invented ZIPs, 231 of 231 FAQ pairs visible, bidirectional links exact, disclaimer byte-identical to
the hub, all 88 URLs in a 150-URL sitemap) and FAILED the hard stop.

THE FINDING, and it is a good one. All 77 pages said "the office below is the one that decides what
applies to a container there." My phrase scan cleared it because I was scanning for PERMIT
determinations. This is a JURISDICTIONAL determination: asserting which authority governs the reader's
parcel, exclusively and unhedged. It is also provably wrong on seven pages where the office's own label
contradicts it two lines below (Nassau: "zoning is administered by Nassau's towns, cities and
villages"; Wayne MI: "Detroit proper; suburbs zone locally", so a Livonia reader is told Detroit decides
for them; Union and Lawrence OH: township inspectors administer unincorporated areas). And 26 of 80
offices are Planning Commissions, which are advisory: the Hamilton County page tells a Cincinnati
reader the Regional Planning Commission decides for them, and Cincinnati is the one jurisdiction it does
not decide for. Cincinnati is that page's only inbound city link. I confirmed all of this in the built
output before ordering the fix.

The guard file had prescribed the safe form at its own lines 50-51 and the shipped copy went past it,
while DETERMINATION_PHRASES contained nothing that caught it, so 31 passing tests said nothing.

Fix dispatched: non-exclusive starting-point wording with an explicit municipal carve-out, the same
shape applied to the FAQ sentence so the JSON-LD stops asserting it, scopeNote shown whenever there is
more than one office, county-site wording conditioned for Virginia independent cities and NYC, and the
missed phrases added to the tripwire. On the Houston "no zoning" label I took the low-risk option
myself rather than banking a question: render only the scope part of a parenthetical and suppress any
that makes a zoning claim, leaving cities.ts untouched.

LESSON WORTH KEEPING: a keyword scan for a hard stop only catches the stop as literally worded. The
sentence that failed contained no permit-determination phrase at all. Compliance review needs a reader
judging implication, not a grep, which is exactly why the verifier ran.

## Cycle: hard-stop fix applied, re-verification dispatched

All four findings fixed. 708 tests across 29 files, build exit 0, sitemap unchanged at 150. My own
checks: 77 of 77 county pages carry the municipal carve-out, ZERO pages retain any of the four retired
exclusive phrasings, Houston's label is reduced to "City of Houston", municipality pages say "search
the city site" while counties still say county, Virginia's index title now reads "by City", and all
three multi-office pages render a note.

The builder found a third instance of the exclusive claim that neither the verifier nor I had named:
FAQ 3 read "the office named on this page is who decides". That is the second time in this task that
the dangerous sentence was one nobody had enumerated, which is exactly the lesson already written to
the feedback memory.

Two builder decisions I accepted. It exported the carve-out as MUNICIPAL_CARVE_OUT so template, FAQ
and guard read one string, with the advisory-body and contradicting-label evidence recorded above it so
a future editor cannot innocently restore the old wording. And its source scanner now strips code
comments before scanning, because its own explanatory comments quote the retired wording and were
flagging themselves; the stripper is line-anchored and built-output scanning is unaffected. I asked the
verifier to confirm that change cannot hide a real finding.

One item left open for the owner by the builder rather than decided: seven office NAMES in cities.ts
carry their own parentheticals, such as Wayne County MI rendering "(Detroit proper; suburbs zone
locally)" as H3 link text. With the carve-out in place these now read as supporting hedges rather than
contradictions, and they are strings the city pages already publish, so they were left alone. Sent to
the verifier as a specific question.

## Cycle: verdict shippable, three follow-ups applied, committed

Verifier returned SHIPPABLE. It read 14 pages in full and scanned all 89 over visible text and JSON-LD
for ten patterns: two hits, both the pre-existing hedged hub sentence. All seven previously
contradicting pages now read consistently, and it quoted Nassau in full to show the office parenthetical
now reads as the specific instance of the general carve-out.

It left three non-blocking follow-ups and I applied all three rather than shipping copy I knew was
imperfect. (1) The carve-out contrasted with "the county" on nine municipality pages that sit in no
county at all, so a Norfolk reader was invited to look for a county office that does not exist;
dropped the contrast and added "township", which the verifier separately noted was missing from the
noun list. (2) Added "is who decides" and "who decides for" to the tripwire, closing the one regression
human review caught and the test did not. (3) The state index hand-typed a paraphrase of shared
hard-stop language, which is what single-sourcing exists to prevent, so it now renders the constant.

Committed 0d8a1bb, then ran generate:route-lastmod and committed bcc81d6, because the permit modules had
no git history at build time and would otherwise have shipped with no dateModified and no sitemap
lastmod, breaking the single-source rule established in f348d91. Verified after: Hamilton County reads
2026-09-10T18:16:21.000Z on the page and the identical value in the sitemap.

Two commits ahead of origin. Holding the push for the owner: 88 new public URLs on permit-adjacent
content is outward-facing, and he has authorised each previous push explicitly.

## Cycle: shipped, and the harvest proved itself on the way

Owner: "ppush it live". The push was REJECTED, and the reason was good news. The daily geo-pricing
harvest had committed 719a04a to main by itself, five figures moved. That is the T-209 fix from
2026-09-03 finally executing on a GitHub runner on a day the feed actually changed; every green run
until now had been a no-op day where all five gates skipped. The CI proof I had been holding open is
now closed by the job doing its job.

Handled the divergence carefully rather than forcing. Checked for overlap first: the harvest touched
only src/data/geoPricing.ts and my commits touch none of it. A plain rebase refused because of
unstaged changes, and those turned out to be the 34 legacy UDO deletions the 2026-09-03 log explicitly
says not to commit or "fix" without asking the owner. Used rebase.autoStash so the working tree came
back exactly as it was: 34 deletions still uncommitted, README, START_HERE and PROJECT_STATE still
modified. Then regenerated route-lastmod, because the rebase rewrote the commits that own the permit
modules and the recorded dates no longer matched them.

One self-inflicted false alarm worth recording: I ran the suite while a background build was still
writing dist, got "681 passed, 27 skipped", and started investigating a regression. The guard was
correctly reporting that dist/permits/index.html did not exist yet. Waited for the build with an
until-loop and got 708 of 708. The lesson is mine, not the code's: never test against a dist that is
mid-write.

LIVE-VERIFIED about 120 seconds after push. All seven spot-checked permit URLs return 200. All four
previously failing pages carry the carve-out and the buyer-responsibility sentence and retain none of
the retired wording. Norfolk and Houston read "Depot Network Delivery". Live sitemap is 150 URLs, 89 of
them /permits/. IndexNow returned HTTP 200 from both Bing and api.indexnow.org for all 150.
