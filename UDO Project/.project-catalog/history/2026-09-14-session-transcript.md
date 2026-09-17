# Session transcript: 2026-09-14

Continuation of 2026-09-11; the wall clock rolled over mid-session. Cycles 1 through 16 are in
`.project-catalog/history/2026-09-11-session-transcript.md`.

## Cycle 16 (continued here) — memory recovered, dev server up
Owner freed memory. Re-measured before starting anything rather than assuming: free 4,964 MB against
61 MB, and swap total now 6,144 MB with 5,010 MB used, so the earlier 15.8 GB of 17.4 GB thrashing
state is gone. Started the real Vite dev server instead of the static `python3 -m http.server`
fallback, so hot reload works again. All six endpoints 200: three product pages, three embeds.
No code touched this cycle. Nothing committed. Two commits still sit unpushed on main.

## Cycle 17 — camera framing solved per model, and a correction to my own diagnosis
Owner said proceed on the 40ft crop.
CORRECTION TO WHAT I TOLD THE OWNER: I said the 25% zoom crops the 40-footers. Measured it instead
of trusting that. Probing the 40hc at a range of zoom factors, the model still projects to 1.219 in
NDC at zoom 1.00, the ORIGINAL preset with no tighten at all. So the 40s were already overflowing;
the tighten made it worse but did not cause it. The presets were tuned for an unexploded box and the
50% default spread flings parts along a hull twice as long.
Second thing measurement changed: the 20ft framing the owner approved projects to 1.442, i.e. it
clips too, slightly, at the left edge. So "fit everything" was never the standard he approved.
FIX, replacing the fixed INITIAL_ZOOM constant entirely (removed, it could not serve a 20ft and a
40ft high cube at once): `frameModelToFill()` solves BOTH the orbit target and the distance from the
model's own Box3 each load.
- Target moves to the bounding-box centre. The preset target sat at half the container height while
  the exploded roof floats well above it, and that mismatch is what left dead space over the box.
- Distance is solved iteratively; projected size is near-inversely proportional to distance so three
  corrective passes converge. Fixed passes, not a while-loop, so a degenerate box cannot stall it.
- Per-model and per-viewport by construction, so it survives changes to the default spread, the fov,
  the container aspect or the iframe size.
FRAME_FILL tuning, done by eye AT THE REAL IFRAME ASPECT (1280x560), not at the near-square
automation window, which was misleading me: 0.98 fits every corner but left the 20ft small with dead
space either side. Settled at 1.12, which lets the extreme corners graze the edge while the body of
each box reads at a useful size. Verified all three at 1280x560: 20ft green, 40ft blue, 40hc orange,
all whole, all centred, only the 40hc's outermost door leaf grazing the bottom edge.
Build clean, 708 tests, engine markers intact. Still uncommitted.

## Cycle 18 — unique hero per size, and a POLICY CONFLICT the owner must settle
Owner: each product page should have a unique hero; they all share one right now.
VERIFIED THE CLAIM FIRST. True, and worse than stated. All three entries in containers.ts pointed at
one `INTERIM_HERO_PHOTO`, a real photograph of a 40ft High Cube, captioned "40ft High Cube shown.
Yard photos of each size are coming." So two of the three product pages showed a buyer the wrong
size of box. (The `/shipping-containers-for-sale/` index has no images at all, so the complaint is
about the product pages themselves.)
BUILT: one hero render per size, captured from the corrected 3D models at 1600x900, doors closed,
unexploded, chrome and hotspots hidden. First pass clipped both 40-footers because the shipped
FRAME_FILL of 1.12 is tuned for the wide iframe, not a 16:9 still, so the stills were re-shot with a
full-fit override at 0.90; the shipped constant was NOT changed. Converted to JPEG at quality 82,
164 to 174 KB each, into a new `src/assets/renders/` folder so the path itself says render.
Wired through a `modelRender()` helper so alt and caption are generated, not hand-typed per entry:
alt "Scale 3D model of a {size} shipping container, doors closed, shown in three-quarter view";
caption "3D model of a {size}, drawn to ISO dimensions. Not a photograph of the unit you receive."
Kept the real photograph, exported as `REAL_UNIT_PHOTO` rather than deleted, because it is the only
real unit photography on the product pages.
THE CONFLICT, AND I STOPPED RATHER THAN SHIP IT. The heroPhoto field carried the comment "Real photo
only, never AI-generated (see the product overhaul spec, section 7)", and
`docs/superpowers/plans/2026-08-25-product-template-overhaul.md:20` states plainly: "No AI-generated
product imagery; photo slots render ONLY when a real photo exists." PROJECT_STATE carries the
precedent: on 2026-08-25 fifteen owner-supplied images were REFUSED for the honest-wear gallery
after verification found C2PA AI-generation credentials, generator resolutions and zero camera EXIF.
The distinction that may or may not matter to the owner, stated honestly rather than argued: these
renders are deterministic geometry built to ISO dimensions, no generative model, no C2PA AI marks,
and they are labelled as models in both alt and caption. That is a different thing from a Gemini
render of fabricated wear. But the slot rule as written says photo ONLY, and it is not mine to relax.
Left wired in the tree, uncommitted, with the conflict written into the code comment so it cannot be
lost, and a one-line revert available. Build clean, 708 tests. OWNER DECISION REQUIRED.

## Cycle 19 — owner ruled: real photos, just not the same one. Result: NOT POSSIBLE, and a live defect found
Owner settled the policy question against the renders. Reverted immediately: `git checkout` on
containers.ts and `rm -rf src/assets/renders`. Nothing of the render work remains wired.
Then inventoried what real photography actually exists, and verified it the same way the 2026-08-25
refusal did rather than trusting filenames.
FINDING 1, the "20ft photo" is not a photo. `user uploads/Used-20ft-Shipping-Container-for-Sale-
Steel-Box-Direct-09-11-2026_05_29_PM.jpg` is 2560x7545, which is a full-page capture aspect. Opened
it: it is a SCREENSHOT OF OUR OWN PRODUCT PAGE taken during this very spike, showing the SEE IT IN
3D section and HOW IT COMPARES. Unusable.
FINDING 2, the 40ft "hero" is not a photograph either, and IT IS LIVE ON THE HOMEPAGE.
`src/components/home/HeroSection.astro:3` imports `40ft-container-hero-reduced2.png`. Opened it: a
cut-out blue 40ft on transparency, stencilled "TCKU 123456 7". That container number is fabricated.
COMPUTED, not guessed: ISO 6346 over TCKU123456 gives a weighted sum of 5533, 5533 mod 11 = 0, so
the correct check digit is 0, NOT 7. The number painted on our homepage hero fails the very standard
this site publishes a calculator for at /iso-6346-check-digit-calculator/. The source file is also
2816x1536, and uniform 1536 height is the generator signature that flagged the fifteen refused
images on 2026-08-25. No C2PA marks found, and EXIF is stripped on every candidate, so metadata
cannot settle provenance either way; the invalid check digit is the hard evidence.
FINDING 3, exactly ONE plausibly-real unit photo exists: `container-blue-weathered.jpg`, the 40ft
High Cube on a trailer, which is the one already reused on all three pages. `IMG_9808.jpg` at the
repo root is 960x817, identical dimensions, almost certainly the same image.
CONCLUSION: the owner's request cannot be delivered from assets on hand. The blocker is photo
supply, not code. Three real photos, one per size, have to be shot. A shot list already exists from
the 2026-08-25 honest-wear work and the same yard trip covers both.
Tree is clean of the render work; only the 3D spike and T-214 remain.

## Cycle 20 — dev server killed again; deliberately NOT restarting
Fourth low-memory kill. Checked before reacting: free 216 MB, swap 3,900 MB used of 5,120 MB. Tight
again, though nowhere near the 61 MB / 15.8 GB-swap state earlier.
Did NOT restart. Last time an automatic retry loop cost three attempts and the owner is not
previewing right now, so holding is the cheaper move. Nothing depends on the server; no code change
is pending on it and no work is lost.
Still open for the owner: whether to pull the homepage hero image carrying the invalid container
number, the T-214 push, and whether the 3D spike ships.

## Cycle 21 — owner decided all three; T-214 SHIPPED LIVE
Owner: 1 leave the homepage image for now, 2 push, 3 clean the 3D spike and ship it.
1. No action on the homepage hero. The invalid "TCKU 123456 7" stays for now, recorded in the
   session log so it is not forgotten.
2. PUSHED. `34b5b90..5016e97 main -> main`, main == origin, 0/0. That is 4476c54 (11 state pages at
   /locations/{state}/, areaProfile and geography rendered into city HTML, the state crumb, the hub
   state tier) plus 5016e97 (route lastmod). Cloudflare Pages auto-deploy triggered by the push.
   IndexNow submitted 161 URLs, HTTP 200 from both Bing and api.indexnow.org.
3. Dispatched the production hardening of the 3D spike, five items in priority order: delete the
   dead .mobile-fallback markup that costs every desktop 682 KB it never displays (the page template
   does its own 768px swap, so it is pure waste) while KEEPING the three JPGs because the template
   serves them; noindex on all three embeds so they stop competing with the product pages;
   sandbox="allow-scripts" on the iframe because esm.sh currently runs same-origin with the lead
   forms and an import map cannot carry SRI; an IntersectionObserver so the 60fps loop idles when
   scrolled out of view; and a noscript line. Agent warned in the brief not to re-copy anything from
   the source folder, which still has the two control-freezing method-name bugs, and to prove the
   local engine fixes survived.

## Cycle 22 — 3D hardening: 4 of 5 landed, item 3 failed honestly, root fix dispatched
Agent returned. Build clean, 708 tests, exactly baseline. Local engine fixes all grep-proven intact.
LANDED:
- Dead `.mobile-fallback` markup deleted from all three embeds, plus the `#btn-launch-3d` handler and
  107 lines of orphaned CSS. Measured in a real Chromium against dist, not reasoned: desktop now
  fetches NO `/3d/*.jpg` at all, and the desktop embed payload is 92.1 KB against 773.8 KB, a saving
  of 681.7 KB per desktop view, 88% of the old payload. All three JPGs stay in public/3d because the
  page template serves them as the mobile fallback, and mobile still gets its own one per page.
- The agent caught something I did not specify: the 768px block in embed.css also HID the canvas,
  toolbar, header and drawer to reveal the fallback. Deleting only the fallback would have made a
  direct phone load of an embed URL a blank page. It removed those rules too.
- `noindex` and a `noscript` line on all three embeds, confirmed in the BUILT files.
- Render loop now idles. Measured by wrapping renderer.render and scrolling the frame out of the
  parent viewport: 26 renders in view, 0 while scrolled out, 29 on return, and doors 0.991 /
  explode 0.998 / camera settled afterwards, so nothing breaks on return. Falls back to "assume
  visible" with no IntersectionObserver, so it cannot silently freeze, and also listens for
  visibilitychange because the in-frame observer does not see tab switches.
ITEM 3 FAILED, AND THE REPORT IS THE VALUABLE PART. `sandbox="allow-scripts"` is NOT free as I
asserted in the brief. The sandbox puts the frame in an OPAQUE ORIGIN, so `./embed-core.js` is
fetched in CORS mode with `Origin: null`; `/3d/*` sends no Access-Control-Allow-Origin, the module
is blocked and the frame renders black. Proven both ways: the failure console is quoted, and serving
the identical build with one added `/3d/* Access-Control-Allow-Origin: *` rule made it work end to
end. The binding constraint was never storage or forms, it was the ES module graph. Agent removed
the attribute rather than ship a black viewer on three commercial pages and left the diagnosis in a
comment at the iframe. Correct call.
DECISION: took the ROOT fix over the containment fix. The header route would have meant editing
generated `public/_headers` via its generator, and would still leave esm.sh running same-origin with
the lead forms and still leave an availability dependency. Dispatched vendoring Three.js 0.160.0 and
OrbitControls into `public/3d/vendor/`, pinned to the same version the code was written against, and
restoring the sandbox once there is no third-party code left to sandbox.

## Cycle 23 — Three.js vendored, 3D viewer SHIPPED LIVE
Vendoring done from the official three@0.160.0 npm tarball, byte-identical and cmp-verified, into
public/3d/vendor/ with the MIT LICENSE and a README recording provenance, npm shasum and the update
procedure. Import map kept, pointing only at same-origin ./vendor paths, so OrbitControls stays
byte-identical to upstream and re-verifiable. embed-core.js and containerModel.js were not touched.
Agent used three.module.min.js rather than the unminified build I named: same ES module, 166,250 B
gzip against 256,394 B, and the CDN was serving minified anyway. Accepted.
MY PREMISE WAS WRONG A SECOND TIME, and the agent caught it again. I briefed "now that the frame is
same-origin-safe, restore the sandbox". That does not follow. The sandbox puts the frame in an
OPAQUE origin, so the browser fetches OUR OWN ./embed-core.js cross-origin and /3d/* sends no ACAO.
Removing third-party code changes nothing about that. Attribute reverted a second time rather than
ship a black box on three commercial pages, with the diagnosis left in the iframe comment. The
unblock remains one `/3d/* Access-Control-Allow-Origin: *` rule, which must come from
renderHeadersFile() in src/lib/aeo/markdownTwin.ts, not by hand. DECISION: not doing it now. With
the code vendored, the sandbox buys defence in depth against our own bug rather than containment of
someone else's code, so the value dropped sharply. Logged as optional debt, not a blocker.
VERIFIED: zero third-party requests from any embed; canvas renders with 1200-1506 distinct colours;
explode and doors both animate; console clean. Product pages 6 of 6: desktop fetches no /3d/*.jpg,
mobile fetches exactly one fallback JPG per page and attaches no iframe. Engine fixes all grep-proven
intact. 708 tests, exactly baseline.
BYTES, stated honestly rather than spun: desktop viewer goes 94,271 B raw / 27,213 B gzip to
795,800 B raw / 200,674 B gzip. The added 172,698 B gzip is self-hosted Three.js. That is not new
weight, it is relocated: it replaces roughly 220 KB that used to come over the wire from esm.sh, and
lands slightly under it on gzip terms. What changed is that the bytes are first-party, pinned,
auditable and cannot vanish in someone else's outage.
SHIPPED: 432b325 (the viewer, 15 files, 4,625 insertions) and 0b353cb (route lastmod, 1 entry).
Pushed 5016e97..0b353cb, main == origin, 0/0. IndexNow 161 URLs, HTTP 200 from both endpoints.
OPTIONAL DEBT RECORDED, not chased: 670 KB raw of Three.js ships whole because the embeds are plain
static files with no bundler; a build step with tree-shaking would likely cut it a lot, since the
viewer uses a small slice of the library.

## Cycle 24 — Columbus review mining opened (T-214 follow-on)
Owner is refining the location pages using a YouTube method (3n6bEqMFZAU) and has done a Columbus
test run. Supplied `user uploads/Google Reviews/Columbus-20260914T181942Z-1-001/Columbus/`.
Scoped it before dispatching: 36 .txt files, ONE REVIEW PER LINE, 1,201 reviews total, 464 KB.
Largest sets are UNITS, Planes, Container One, Container Management and Bed Bath & Beyond at 100
lines each.
A JUDGEMENT THE OWNER'S PROMPT DID NOT COVER, so I put it in the brief: the folder is not 36
competitors. It mixes three kinds of business. Told the agent to segment and to show its working so
the owner can check the call:
  A container sellers, the real competitor set;
  B portable storage and moving rental (UNITS, Zippy Shell, Go Mini's, Planes, Herlihy), adjacent
    and different intent, analysed separately and only for what transfers, delivery, placement,
    scheduling, damage, communication;
  C irrelevant (Bed Bath & Beyond + The Container Store, Wasserstrom Restaurant Supply, Warehouse
    Rack, packaging and crating firms), excluded and listed.
Also told it `Steel Box Direct.txt` is OURS and must be pulled out of competitor findings and
reported separately.
Extra instructions beyond the owner's six sections: give frequency per complaint so loud is not
mistaken for common; mark vivid-but-rare items as rare; quote real review language rather than
paraphrasing into marketing copy; never invent counts; and flag fraud, undelivered-paid-order and
warranty-refusal patterns SEPARATELY, because those shape what we can honestly claim on our own
pages given the site's no-fabrication rules.
Output goes to `.outputs/research/2026-09-14-columbus-review-mining.md`.
Skim of Container One's file already shows the shape of it: long delivery slips against promised
windows, damage found after the driver has gone, claims handled with tape patches, and against that
a strong seam of praise for individual drivers who place the box exactly right.

## Cycle 25 — Columbus review mining landed; it contradicts the ChatGPT page plan on the main point
All 1,201 lines read across 36 files. Agent had no Write tool, so I wrote the report myself to
`.outputs/research/2026-09-14-columbus-review-mining.md`, 257 lines.
SEGMENTATION PAID OFF. Only 11 of 36 businesses are real competitors, 379 reviews. 6 are portable
storage / moving, 469 reviews, adjacent. 17 are irrelevant, 339 reviews, and the excluded list is
written down for the owner to check: freight-yard driver reviews (A G Container Transport,
ContainerPort, Jet, Crossdock, Terminal Warehouse, A2 Global, WillScot), plus a corrugated paper
plant, a carton manufacturer, two pallet-rack firms, a tanker-trailer wash, a crating firm, two
restaurant suppliers and Bed Bath & Beyond. Analysing all 36 as competitors would have buried the
signal under 339 irrelevant reviews.
THE HEADLINE, AND IT OVERTURNS THE CHATGPT PLAN: **price is almost never the complaint. 2 of 379.**
ChatGPT led with "Upfront Delivered Pricing" as section 1. The evidence says the number one customer
emotion is FEAR OF NOT RECEIVING THE BOX AT ALL: ~35 reviews use scam language, ~30 more describe
pre-purchase fear that was relieved. Price praise is common (~65) but price complaint is ~0. Buyers
do not want the lowest number, they want the delivered number to HOLD.
Ranked priorities: 1 will I receive it, 2 is the box what you said, 3 will it arrive when you said,
4 can the driver place it, 5 can I reach a human, 6 all-in price, 7 speed, 8 what happens when it
goes wrong, 9 local vs middleman, 10 site prep help.
THE UNCLAIMED POSITION, and the best thing in the report: **nobody in the market tells the buyer
they may inspect and refuse BEFORE the box comes off the trailer.** Five reviews describe being
unable to inspect because the box was double-loaded with doors facing the cab; that is the mechanism
that converts a condition complaint into a dispute the buyer loses. It is a PROCESS commitment, not
a product claim, so it is safe for us to make and easy to keep. Container Management did it once and
got a glowing review.
Most repeated praise in the entire dataset, ~115 of 379 reviews, ~30%: the driver put it exactly
where I wanted it. Always about the DRIVER, never the company.
LEGAL FLAGS, which constrain our copy: M-W Containers is an active scam operation in the local SERP,
17 of 30 reviews alleging the same wire-then-silence scheme with a refundable "insurance fee" and an
address that is an auto body shop; its other 13 reviews read as manufactured. A warranty-refusal
pattern runs through the category, at least 7 reviews where a leak under an advertised WWT or leak
warranty was settled with a mailed adhesive patch. CONSEQUENCE: we must not use unqualified "no
leaks" or "guaranteed watertight" or bare "warranty" language, because this audience has been burned
by exactly those words and reads them as a tell. Any warranty line must state term, coverage and the
physical remedy, since the remedy is where every dispute lands.
OUR OWN 10 REVIEWS: six are character testimonials about Doug, only one is a full transaction
narrative. The gap against Container Management's 100 is not sentiment, it is proof-of-delivery
specificity. The three review asks that would move us fastest are the three sentences every winning
competitor review contains: the driver placed it where they wanted, the condition matched, the date
held.

## Cycle 26 — OWNER DECISION: the leak warranty must state its remedy everywhere it sells
Owner raised it himself, unprompted: "Our no leak guarantee is almost the same issue. It's a
fiberglass patch that the user has to apply themselves. I personally think that's misleading."
He is right, and I checked before agreeing rather than just validating him.
THE ACTUAL SHAPE OF THE PROBLEM: `src/pages/terms.astro:94-95` is fully honest. It states that the
Company sends an industry-approved fiberglass-reinforced polyester patch with instructions and that
THE CUSTOMER INSTALLS IT, with cure times. Nothing is hidden there. The problem is the gap: roughly
FOURTEEN other surfaces sell the bare phrase with no remedy attached. Footer trust badge, homepage
ProblemSection, condition, about, rent-to-own (several), container-rental-guide,
portable-storage-vs-buying, contact, ai-info, the state and city location pages, the product
template, and both schema modules, so the claim is asserted to machines as well as humans.
One page tells the truth; fourteen do the persuading.
WHY IT MATTERS HERE SPECIFICALLY: the Columbus mining found at least 7 competitor reviews from
buyers enraged that a leak warranty turned out to be a mailed patch, using the word scam. A buyer
who reads our badge and finds the patch after paying becomes one of those reviews.
THE ARGUMENT THAT MADE IT AN OPPORTUNITY RATHER THAN A CLEANUP, and the owner took it: this audience
already expects the patch trick, and nobody in the market admits it up front. Saying it in the same
breath as the claim makes us the only seller who does, and converts the category's biggest trust
wound into our proof of honesty. So the tone must be confident and matter-of-fact, never apologetic.
Owner chose A: keep the warranty and the name, never let it stand alone.
Dispatched with the rule matched to the space: prose surfaces get the remedy as one clause, varied
naturally rather than the same sentence pasted fourteen times; tight badges and `{ k: 'Warranty' }`
spec rows get a compact honest form plus a deep link; the schema claim must not be broader than the
visible one; and the ONLY permitted change to terms.astro is adding an id anchor, never its legal
wording. Forbidden outright: "no leaks", "guaranteed watertight", "leak proof", or anything implying
we repair the container ourselves.
STILL OUTSTANDING AND NOT MINE TO SETTLE: the warranty is honored by Doug's side, not ours, so
whatever wording lands needs his agreement before it is treated as final.

## Cycle 27 — warranty claim fixed across 19 files, COMMITTED, awaiting push approval
Agent found MORE than my estimate: 30 occurrences across 19 files, not ~14. Extras I had missed
include the rent-vs-buy calculator (3), conex-boxes-for-sale, the container buying guide, and the
farmers page spec row.
THE BROADEST FIX: `lib/schema/entities.ts` WarrantyPromise.description. That node ships on every
page's Organization graph, so it was the single widest unqualified claim on the site, made to
machines. It now states the kit, the self-install and the terms URL.
BADGE WORDING, and the reasoning is worth keeping: "(self-applied patch kit)". "Self-applied" is the
one word that kills the wrong inference, that we come out and fix it, without sounding defensive,
and "patch kit" is concrete enough that nobody feels tricked later. The parenthetical reads as a
spec rather than an apology, which is the tone the business case wants. Badge is now a link to the
terms anchor, on all 168 built pages.
THE JUDGEMENT CALL I LIKED MOST, which I did not ask for: the homepage stamp carried
"Lifetime Leak Warranty.*" where the asterisk paid off with nothing useful ("See terms & conditions
in your quote"). It now pays off with the actual remedy. And the agent RAISED the note from 10px at
45% opacity to 10.5px at 70% with a wider line-height, on the grounds that an admission set in
illegible fine print is the same evasion in a smaller font. Exactly right.
Location pages got a parenthetical rather than a full clause because the state and city files are
deliberately kept in lockstep and a full clause would have wrecked the triad and then repeated on
every depot city page.
VERIFIED BY MEASUREMENT, not assertion: 566 occurrences of "Lifetime Leak" across 168 built files,
and the agent measured each one's character distance to the nearest "patch" or terms anchor. Exactly
two exceed 250 characters, and both are defensible: the terms page's own disclaimer cross-reference,
which is legal wording sitting below the full explanation, and the homepage stamp headline, whose
remedy is in the note directly beneath it, separated only by markup. No bare instance survives
anywhere it sells. Banned-phrase sweep clean; the two `leak-free` hits are pre-existing and neither
is a warranty claim.
My own spot-check of built output confirmed the footer badge, the homepage note and the Columbus
city page spec row all render correctly.
COMMITTED b292b8c (19 files, 68 insertions, 32 deletions) and 80e1a9b (route lastmod, 15 entries
moved). 708 tests throughout. NOT PUSHED: this is outward-facing claim copy and the owner has
approved every push individually so far.
STILL OPEN: Doug honors the warranty. The new wording only surfaces what terms.astro already said,
which lowers the risk considerably, but he should still see it.

## Cycle 28 — product page design review, three mockups dispatched
Owner: review the product pages, they could be streamlined, give three mockups.
Inventoried the real structure before briefing rather than guessing. `[slug].astro` is 746 lines,
shared by all three products, with nine visible sections plus one hidden:
prod-hero (dense listing module with buy box) -> prod-pricing -> prod-action (Doug callback,
id talk-to-doug) -> prod-specs -> prod-3d (new) -> prod-compare -> [prod-clearance, hidden 2026-08-26
after the owner rejected plate v1 and v2] -> prod-uses -> prod-guides -> cta-section.
THREE THINGS I FLAGGED FOR THE DESIGNER TO VERIFY RATHER THAN ACCEPT: the hero buy box already
carries the price and prod-pricing sits directly under it, which looks redundant; there are three
separate ask moments (hero CTAs, prod-action, cta-section), which is probably one too many; and the
3D viewer currently sits between specs and compare, which may not be where it earns its place.
Handed the designer the Columbus review evidence as the ranking criterion, so cuts are argued from
what 1,201 real buyers care about rather than from taste: will I receive it, is it what you said,
will the date hold, can the driver place it, can I reach a human, does the delivered price hold,
speed. Anything not serving a top priority is a candidate to cut, merge or demote. Worth repeating
because it keeps surprising: price is the complaint in only 2 of 379 reviews, so price anxiety is
about SURPRISES, not amount.
Demanded three genuinely DISTINCT editorial positions that disagree with each other, each with a
name, a one-line thesis, and an honest statement of who it serves worse. Three shades of one idea
would be useless.
Hard stops carried into the brief: no hand-typed dollar amounts, the leak warranty must never appear
without its self-applied patch remedy (just fixed site-wide, must not regress even in a mockup),
never state or imply a permit requirement, no em dashes, and no edits under src/.
Mockups land as standalone HTML in the scratchpad at mockups/mock-a|b|c.html, built on the 20ft with
its real copy and real spec values. Plan is to publish all three as one artifact for comparison.

## Cycle 29 — three mockups delivered and published as one artifact
Artifact: https://claude.ai/code/artifact/ab255674-bc7f-422c-9b3d-2249eaafc90b
Built as a decision document in the site's own visual language (ink, yellow, hard 2.5px borders,
offset shadows, mono eyebrows), with the three mockups embedded as iframes behind a tab bar so the
owner can flip between them rather than open three files.
THE FINDING THAT MATTERS MOST, and it is uncomfortable: the page is SILENT on the top two buyer
fears. Priority 1, will I actually receive it, the defining emotion of the category: nothing.
Priority 3, will it arrive when you said, the most frequent operational complaint at 28 reviews:
nothing. Length was never the real problem.
AND THE SECTION THAT ANSWERS PRIORITY 4 IS SWITCHED OFF. `prod-clearance` has been hidden since
2026-08-26 waiting on artwork, nineteen days. Placement is the single most praised moment in the
entire corpus, 115 of 379 reviews. That is the cheapest win available and it is sitting behind an
illustration nobody has drawn.
The designer verified all three of my flags rather than taking them: prod-pricing is a full dark
band with its own h2 and 64px padding doing the work of one link; the three ask moments are real and
cta-section closes the page by re-pitching what the hero already promised; and on the 3D viewer its
objection was better than mine, that its own figcaption concedes it does not show the wear on the
unit you receive, so it cannot serve priority 2.
THREE POSITIONS, genuinely opposed as demanded:
  A THE RECEIPT, the page proves the transaction will happen as described; cuts uses, the closing
    CTA and the 3D viewer, merges compare into specs, turns the clearance plate on. Longest page,
    and it writes four cheques operations must cash every time.
  B THE COUNTER, it is a listing not an essay; everything collapses into one decision module with a
    live size switcher and the rest is a quiet appendix. Thinnest prose, which is the wrong
    direction for the AEO play, and it hands a frightened first-time buyer a form.
  C THE NAMED HUMAN, the box is a commodity and the only variable is who answers the phone; sell
    Doug first. Torches portability, which is this site's stated design goal, and it is
    undercapitalised: of our 10 reviews only one is a full transaction story, so two of three review
    cards sit deliberately empty.
RECOMMENDATION GIVEN: A, with two amendments. Ship the clearance plate NOW with figures in the
footer bar rather than waiting on the illustration, and keep B's discipline of exactly one ask as
the page grows back. The contested call is moving the 3D viewer off the product page three days
after shipping it; B's compromise is to keep it but put it dead last.
Mockups use the 20ft with real copy, real spec values and the literal price text the live page
renders. Nothing under src/ was touched.

## Cycle 30 — the inspection question, answered by our own terms, and it kills the claim
Owner could not sign off on Mock A section 03 and explained why: as he understands it you get the
container they pick for you, because you cannot wander a full yard moving boxes to cherry-pick.
He is right, and the reviews were never about that. Two different moments were being conflated:
  1 pre-purchase yard selection, which is not offered and is not what anyone reviewed;
  2 inspection AT DELIVERY, before the driver sets it on the ground, which is what the five
    complaints were actually about (double-loaded, doors facing the cab, could not look until it
    was already down).
CHECKED OUR OWN TERMS RATHER THAN SPECULATING, and it settles it decisively and against the claim:
  `terms.astro:76` the customer is REQUIRED to thoroughly inspect on delivery and report defects
    PRIOR TO ACCEPTING; failure to do so implies acceptance in delivered condition.
  `terms.astro:103` an exchange for non-conforming equipment exists but only on notice before
    accepting or out-gating, and at the Company's SOLE DISCRETION.
  `terms.astro:106` THE KILLER: a customer who rejects a container during the delivery process pays
    the delivery fee PLUS the return delivery fee PLUS a 10% cancellation fee.
So the right to inspect is real and is in fact an obligation, but rejecting is expensive. Marketing
"inspect it before it comes off the trailer" without the cost attached would have been EXACTLY the
warranty problem we spent today fixing, one page telling the truth while the selling surface implies
something better. The owner's instinct not to sign was right for a stronger reason than he knew.
Section 03 cut, parked not rewritten, with the reasoning recorded in the mockup's change ledger so
it can come back later in an honest form: "you are expected to inspect before you accept, here is
what to check, and here is what rejecting costs."
Also dispatched the approved hero fix: roughly 400px of dead yellow under the hero image, above the
fold, while the buy box runs on in the right column. Owner rejected his own jump-menu idea in favour
of my recommendation. The block answers the two fears the page is silent on, who you are actually
buying from and when it arrives, plus a one-line placement link. Constraints in the brief: invent no
credentials, reuse the LOCKED delivery-timeline wording verbatim rather than writing a new promise,
do not let it read as a second buy box, and do not push the price below the fold at 1440x900.

## Cycle 31 — Mock A revised and republished (artifact v2)
Section 03 deleted with its dead CSS, bands renumbered 01-03 with no gap, and the reasoning written
into the mockup's own change ledger so it survives: the right exists in /terms/ but rejecting costs
the delivery fee plus the return delivery fee plus 10%, so the claim needs the cost attached before
it can be made. Parked, not rewritten. No softened replacement; the agent grep-confirmed no
inspect/reject/refuse copy survives outside that ledger entry.
The hero block is built and the dead yellow is gone. Copy is entirely repo-sourced, which was the
point: family-owned dealer in Cincinnati with NO walk-up sales yard, containers from a supplier
network of regional depots, sales made by Freedom Conex LLC with Steel Box Direct as the authorized
independent agent, Doug Froh handling every quote personally. Sourced from about/index.astro:112,
118-120, 222 and ai-info/index.astro:47-51. No invented years in business, licences, review counts
or accreditations.
The locked delivery sentence was reused verbatim, found at permitCounties.ts:395 and repeated at
delivery/index.astro:146: "Almost all deliveries take about two weeks, and we will give you an
honest window before you commit", plus the commit-time hedge from about/index.astro:246-249. No new
timeline promise was written, which was the trap in this task.
Placement rides as a one-line ink rail rather than a block: 65 ft truck plus tilt bed, 100+ ft of
straight approach, 14 ft overhead, linking to the clearance figure.
MEASURED, not eyeballed: at 1440x900 the price sits 454-505 and the whole buy box ends at 848, so
the price stays above the fold; the new block occupies 715-1105, exactly the region that was empty.
The agent deliberately did NOT force all 390px above the fold because that would have meant shrinking
the hero photo, which is the LCP element. At 400px scrollWidth is exactly 400 with no clipping, and
it found and fixed a PRE-EXISTING bug while verifying: the clearance placeholder's aspect-ratio plus
min-height was forcing 484px of horizontal scroll on phones. Fix scoped to _a.css so b and c are
untouched; both rebuilt byte-identical.
Artifact republished as v2 with the section list corrected, a "why section 03 was cut" panel added
in the owner's own terms, and the recommendation rewritten, since the inspect-before-offload
centrepiece was the stated reason for recommending A and that reason is now gone. Left the open
question visible: whether it returns with the rejection cost stated in the same block.
Killed the stray screenshots from the repo root.

## Cycle 32 — third Mock A pass: promote the dimensions, balance the columns
Owner: there is space under the pricing now too, the dimensions get visually buried, make them more
prominent to even the columns out, and add an on-page anchor to the comparison table.
Filling the left column last round INVERTED the imbalance. At 1440x900 the buy box ends around 848
while the left column now runs to about 1105, so roughly 257px of empty yellow sits under the buy
box in the right column. Told the agent to measure and confirm that itself rather than design to my
number.
The owner's other observation is the sharper one: the dimensions are three small chips under the H1
(20' X 8' X 8'6", 1,172 CU FT, 7'8" DOOR WIDTH). On a page selling a box whose entire purpose is its
size, that is the most buried important content on the page. Promoting them into the gap solves the
burial and the imbalance with one move, which is why his instinct was right.
Briefed it as information design rather than decoration: these are figures a buyer measures a
driveway and a load against, real values only from containers.ts, tabular numerals wherever digits
align, and the agent picks which of the six specs earn their place rather than dumping all of them.
Also told it to remove or demote the H1 chips so the same numbers are not stated twice, and to
justify the call.
Guardrails repeated because this is the third pass on the same block and regression is the risk: do
not shrink the hero photo (LCP), keep the price above the fold, do not let the new block read as a
third competing module since the buy box owns the decision, keep the file pure ASCII including the
transliterated "x" in dimensions, and do NOT reintroduce any inspect, reject or refuse claim.

## Cycle 32b — OWNER OVERRULES cutting the 3D viewer, mid-task
Owner, mid-turn: "Don't lose the 3d interactive part either." That reverses the one call I had
flagged as contested. Mock A had cut prod-3d and relocated it off the product page; the owner says
it stays. Messaged the running agent rather than waiting, so it lands in the same pass.
Instructed: restore it as a labelled placeholder, but put it LAST, below the guides. That was mock
B's compromise and it is the right resolution of the two arguments. The viewer answers none of the
top buyer priorities, so it should not interrupt the proof sequence, but it is the only thing on the
site a competitor cannot copy this quarter, so it earns a place at the end rather than deletion.
Also told it to move the viewer out of the ledger's "cut entirely" column and record that the owner
overruled the cut, so the mockup's own history stays truthful rather than quietly rewritten, and to
keep any caption honest about a model not being a photograph of the unit delivered.

## Cycle 33 — dimensions promoted, columns balanced, 3D restored. Artifact v3.
Agent reproduced my 257px figure exactly before touching anything, which is the right instinct.
Result: left column still ends 1105, right column now ends 1138, so the gap is 33px instead of 257
and it is the right column that runs longer. It overshot to 98px on the first build and tightened
row padding to land at 33.
THE DESIGN ARGUMENT, and it is a good one: containers.ts stores externalDims as ONE STRING, but the
buyer's real question is "is 8' wider than 7'8"", and that is only answerable if the two numbers sit
in the same column. So it broke the L/W/H strings out into aligned tabular columns, external over
internal over door opening, with a plain-English line under each label saying what that row is for
(what your pad has to take, the space you get to fill, what has to fit through it). Capacity, payload
and tare ride a compact footer strip because they are supporting figures, not measuring figures.
All six spec fields used, ranked rather than dumped.
It avoids reading as a third module by using the same grammar as the block opposite: ink edge,
transparent ground so the hero yellow shows through, no shadow, no button. The buy box keeps the
only drop shadow in that column, so it still owns the decision.
CHIPS REMOVED, not demoted, and the reasoning is right: demoting would have kept the same three
numbers stated twice within 400px, which IS the duplication the owner flagged, only quieter. Useful
side effect it flagged honestly: the chips lived in the RIGHT column, so removing them pulled the
buy box up 45px and made the imbalance worse before the new block fixed it.
ANCHOR: `id="size-compare"` on the merged specs-and-compare section, jumped from the dark closing bar
of the dimensions block so it reads as a footer rather than a fourth CTA. scroll-margin-top was
MEASURED not guessed, because the mock bar wraps as it narrows, 86px at 1440 up to 199px at 400, so
it steps 120/140/180/215 across breakpoints. It applied the fix to all four anchors, since the three
existing ones had the same latent bug at phone width.
3D RESTORED per the owner's override, last, after the guides, on --ink-2 with a hairline rule so the
page does not end in one undifferentiated black slab. Placeholder sized to the REAL canvas, 560px,
checked against `.viewer-canvas` in [slug].astro rather than guessed at 16:9, so the slot swaps with
zero layout shift. Not numbered, deliberately: an "04" would imply it is part of the proof sequence,
which is the opposite of the argument for putting it last.
Price unmoved at y=460 against a 900 fold. 400px clean, verified at nine widths.
FLAGGED FOR LATER, not done: there is also ~180px of dead WIDTH right of the buy box, because the
grid column is ~662px while .buy-box is capped at 480. The dimensions block was matched to the same
480 so the two share a right edge; widening either means re-proportioning the grid, which is more
than was asked.
Artifact republished as v3 with A's section list corrected to eight items, the 3D move recorded as an
owner override rather than quietly rewritten, the chips added to the cut list, and the open questions
updated to name the FAQ gap.

## Cycle 34 — owner sets an IA principle: what it is, how you get it, where and who from
Owner instruction verbatim: "Re-arrange each section you want to know what it is, how you can get
it, then where and who it comes from." Read as the page's section order in three acts, and said so
rather than asking, since that is the natural reading:
  ACT 1 WHAT IT IS: dimensions, condition and what WWT means, specs and size compare, the 3D viewer.
  ACT 2 HOW YOU GET IT: price, what changes it, rent to own, delivery timing, placement, the ask.
  ACT 3 WHERE AND WHO IT COMES FROM: the depot network, the company, Doug, the checkable proof.
CONSEQUENCE WORTH NAMING: under this order the 3D viewer moves from LAST into act one, because it is
plainly "what it is". That is the third placement it has had in two hours, so the ledger has to
record the move and the reason or the mockup's history becomes fiction.
THE REAL TENSION, and I told the agent to handle it rather than ignore it: the evidence ranks "will
I actually receive it" as the NUMBER ONE buyer fear, about 35 of 379 reviews using scam language and
about 30 more describing relief the seller was real. "Is this a real company" is currently section
01 for exactly that reason. The owner's order sends it to the end.
RESOLUTION rather than override: the hero block under the photo ALREADY carries the compressed
answer, who you are buying from, Freedom Conex, Doug, no walk-up yard, plus the link "what you can
check before you pay anyone". That stays above the fold, so the frightened first-time buyer still
meets it first, and the full proof band pays it off in act three. Told the agent to verify the hero
link still points at the relocated band, and to say plainly in its report if it judges the reorder
measurably hurts that buyer, but to build it as instructed either way. The owner decides, and he
gets an honest read rather than silent compliance or silent sabotage.

## Cycle 35 — three-act reorder built, with an honest cost. Artifact v4.
New order: listing head, then ACT ONE WHAT IT IS (01 what WWT means, 02 specs and how the three
sizes compare, 03 see it in 3D), ACT TWO HOW YOU GET IT (04 when it arrives and where it lands with
the clearance figure, 05 get your price), ACT THREE WHERE AND WHO IT COMES FROM (06 is this a real
company, 07 guides). Nothing dropped, nothing new written; eight blocks regrouped and renumbered.
Price, the ZIP line and rent to own stay in the buy box above the fold per the hard stop, and the
act two bar says so in one line so the sequence still reads as the owner described it.
ACT MARKERS: reused the existing band-head grammar promoted to full width, on yellow rather than ink
because two of three acts open onto a dark band and an ink bar above an ink band is not a boundary.
`border-top:5px` landing against the previous section's 2.5px bottom makes a chapter break the
heaviest horizontal line in the document. Four sections that previously had no numbered head now
carry one.
MEASURED: price bottom still y=460 against the 900 fold; hero column gap still 33px. Act one
1192-3705, act two 3705-5589, act three 5589-6834. 400px clean, scrollWidth exactly 400. It also
caught that the OLD measuring script compared `.buy-box` instead of `.dims` and would have reported
a bogus 302px gap, so it did not trust its own prior tooling. Fixed another pre-existing anchor bug:
`.a-ask` declared its scroll-margin AFTER the responsive rules, so at 400px the 120px beat the 215px
and the ask heading landed under the sticky bar; moved to the id so specificity wins.
THE HONEST READ, which is why I asked for one: the reorder DOES cost. "Is this a real company" moved
from y=1330 to y=5747 on desktop, first scroll to fifth, and to 8,274 on a phone, most of the
document. And the sharper point, which I had not seen: ACT TWO ASKS FOR A NAME AND PHONE NUMBER AT
y=4937, roughly 800px BEFORE the page proves who is asking.
What holds it together is the hero aside. It was supporting copy; it is now load-bearing, and the
agent's recommendation is right: treat it as locked, and if this page is ever A/B tested, test
exactly this pair, trust band at 01 versus at 06, because it is the one ordering decision on the
page where the evidence points the other way from the instruction. Recorded in the mockup's own
ledger under "who it serves worse" and in the band annotation, so the next person meets the tension
rather than inheriting it silently.
Artifact republished as v4 with the three-act order and a "what the three-act order costs" panel.

## Cycle 36 — FAQ dispatched for Mock A
Owner: "add the FAQ." Seven questions, ranked by the review evidence rather than by what is easy to
answer: delivery included, how long it takes, will the driver place it where I want, what WWT means
and what wear to expect, what happens if it leaks, what to set it on, will a truck fit my driveway.
Told it to drop one rather than pad if an answer would need inventing.
PLACEMENT: ONE block at the end of act three, after the guides. One block rather than questions
scattered through the page, because FAQPage structured data wants a single coherent set and because
the three-act prose already answers most of these in place. Marked in the mockup as the schema source.
THE TRAPS, spelled out because this is exactly where invented claims get born, and every answer has
to be traceable to existing site content or terms.astro:
- Delivery included is scoped to WITHIN 250 MILES on the homepage. Match that, never broaden it to
  "always included".
- How long reuses the LOCKED sentence verbatim from permitCounties.ts:395 and delivery/index.astro:146
  plus the commit-time hedge at about/index.astro:246-249. No new timeline.
- DRIVER PLACEMENT IS THE DANGEROUS ONE. terms.astro:77 makes the CUSTOMER liable for delivery fees,
  return delivery and third-party costs including towing if delivery fails on space, wet ground, mud,
  no clear path, grades or low bridges. So we must not promise placement anywhere they want. The
  honest answer is that access is planned before scheduling, what the truck actually needs, and what
  happens if the site will not take it, cost consequence included. Buyers get furious about exactly
  this in the reviews, which is why the honest version is also the competitive one.
- Leaks answer must carry the self-applied patch kit remedy in the answer itself.
- NO permit question at all, and if the topic touches another answer it defers to the local authority.
- No inspect, reject or refuse claim; that was cut deliberately.
DESIGN: not an accordion that hides answers, because a collapsed FAQ shows nothing in a screenshot
and nothing to a skimming reader; if expandable, first item open and all answers in the DOM.
Required per-answer sourcing: name the file and line for each, and say which was dropped if any
could not be sourced honestly.

## Cycle 37 — FAQ built, every answer sourced. Artifact v5.
Seven questions, nothing dropped, and every single answer traced to a file and line. Section 08,
last in act three, on a cream band so the only place the page lightens is the end. Not an accordion:
a dl with all answers in the DOM and visible with no interaction, so a screenshot and a skimming
reader both get the content. Marked as the FAQPage schema source in three places.
THE TWO ANSWERS THAT MATTER, and both are uncomfortable on purpose:
Q3 driver placement. It does NOT promise placement anywhere the buyer wants. It explains that a
tilt-bed does not lower the box, it slides off the back while the truck creeps forward, so placement
is DIRECTIONAL and door orientation must be planned before the truck backs in. Then it states the
cost consequence tight to terms.astro:77: if delivery cannot be made for space, wet ground, snow,
mud, no clear path, graded hills or low bridges, the customer covers the transport fee, the return
delivery fee and any wrecker or tow charges. It closes with "an hour spent looking at your access
now is the cheapest hour in the whole transaction". That is the honest version AND the competitive
version, because this is precisely what competitor buyers rage about.
Q5 leaks. States the patch kit as the ENTIRE remedy, near-verbatim from terms.astro:95 including
cure times, and says outright "we state it here rather than in fine print, because the remedy is
where every warranty argument in this business ends up".
Sourcing held everywhere: delivery-included scoped to 250 miles from HeroSection.astro:43 and never
broadened; the locked timing string verbatim from permitCounties.ts:395 plus the commit-time hedge
from about/index.astro:246-248; WWT from condition.ts:14; clearance from the locked
DELIVERY_ACCESS.clearance at permitCounties.ts:392. No permit question exists and no answer implies
one. No inspect/reject/refuse claim.
GOOD UNREQUESTED CALL: it changed the guides kicker from "Before you buy: answers to common
questions" to "The long versions, if you want them", because two adjacent heads both promising
answers to common questions is the page arguing with itself. Logged in the ledger.
MEASURED: price untouched at 409-460 against the 900 fold. FAQ 6834-9151, document 7000 to 9317.
400px scrollWidth exactly 400, nothing clipped. All five anchors clear the sticky bar at both widths
and #faq was added to the scroll-margin lists. Another pre-existing-class bug found and fixed while
measuring: grid children default to min-width:auto, so an unbreakable file path in a provenance note
was pushing the document to 418px at a 400px viewport.
Artifact republished as v5.
