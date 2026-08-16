# Decision: T-015 container shelter angle, APPROVE NARROW then gate

Date: 2026-08-10
Decided by: Eli Carder (owner)
Recorded by: orchestrator (Claude Opus 5, 1M context, Claude Code CLI)
Status: ACTIVE
Topic slug: container-shelter
Tags: #container-shelter #content-gap #partnerships #permits

## The decision

The owner approved the **narrow** shape, not the full packet scope.

**In scope now:** the farmers-page section edit only. Specifically the `<p class="uc-framing">`
paragraph closing the "Shed or Pole Barn?" section of `src/pages/for/farmers/index.astro` (plain prose,
final sentence at roughly line 170). Plus the Mytee outreach call as an owner action.

**Gated, not approved:** the planning-intent blog post. It stays unbuilt until one of the named
triggers returns evidence.

**Explicitly never in scope:** a canopy or roof-kit product page. Steel Box Direct cannot fulfill
canopies, and such a page would attract exactly the already-owns-containers traffic the research
identified as poorly converting.

## Rationale

The evidence in the packet is not uniform in quality, and the approved shape matches each component to
its own evidence grade rather than bundling them:

- The farmers-page defect is **Grade A**, verified twice (2026-08-07, re-verified 2026-08-10). The page
  raises the strongest objection to its own product, concedes it, and abandons the reader. Fixing that
  does not depend on knowing the segment size.
- The blog post rests on **Grade B/C qualitative demand evidence only**, with the packet's own
  confidence at ~80 percent that the planning-stage segment is real and reachable but only ~55 percent
  that it converts better than average traffic. That is not enough to spend a content cycle on yet.

The strategist recommended full scope at 70 percent confidence and separately synthesized this narrow
option; the owner chose the narrow one. The recorded risk of the narrow path is real and accepted: an
edit with no destination to link to may relocate the dead end rather than remove it. Mitigation is a
drafting constraint, the paragraph must stand entirely on its own and link only to pages that already
exist.

## Gate conditions for the blog post

Un-defer the post when EITHER returns:

1. A small real Google Ads test on "shipping container barn" and drive-through-bay style terms showing
   geo-relevant clicks inside OH/IN/KY/western WV. This is the honest sizing method under the keyword
   trust hierarchy; no estimator lookup substitutes for it.
2. Mytee confirming something reciprocal, meaning they send container buyers to Steel Box Direct.

Kill condition, carried from the brief: if a test shows clicks concentrated on canopy and roof-kit terms
rather than barn and drive-through terms, the intent is dominated by people who already own containers
and the angle should be killed outright.

## Evidence corrections applied before this decision (HS-EVID-001)

A data-auditor pass on 2026-08-10 re-verified the stored claims. Three corrections were folded into
PROJECT_STATE T-015 before the decision was put to the owner:

- "SKU CSB-C" is **wrong**. CSB-C is a base rail clamp part. Shelter kits use CSB2020 / CSB4020 /
  CSB4040 style SKUs.
- The "roughly 1.9k to 12k" price band is **unverified and contradicted**. Mytee's own live FAQ says
  1.5k to 27k, and 8 to 18 dollars per square foot for added features. Their site returns 403 to direct
  fetch and renders prices client-side, so a human browser session or a phone call is the only way to
  re-verify the ladder.
- Mytee's affiliate program is **confirmed live** (5 percent commission, 30 day cookie, self-serve at
  `/partner-signup`), refuting the prior Grade D "no formal program" caveat. Material qualifier: that is
  an affiliate program, not a dealer relationship. Dealer, wholesale, and reciprocal-referral terms
  remain unconfirmed, so the outreach action survives with a changed question.

Also found: the farmers page concedes the pole-barn point in **three** places (roughly lines 29, 37,
170), not one. Lines 29 and 37 sit inside the `faqs` array that generates the page's JSON-LD FAQPage
schema, so editing them would change structured data and visible copy together. They are deliberately
excluded from this narrow approval. Line 170 is plain prose and is the approved insertion point.

## Publish gates for the edit (all required, subagent-verified, not authorial good intentions)

1. **Permit language.** No "no permit", "usually no permit", "permit-free", "not a permanent
   structure", "personal property", or "not a building". No assertion in the opposite direction either.
   Steel Box Direct makes no classification. No county, city, or state named with a permit outcome. One
   required statement in Steel Box Direct's voice: a permanent roof changes what the local building
   department may want to review, and getting that determination is the reader's job, before building.
   This is consistent with the existing recorded stance that permit determination is the buyer's
   responsibility.
2. **No structural claims.** Nothing stating or implying that a Steel Box Direct container can support,
   carry, anchor, or mount a roof. Structural and mounting questions deflect to the kit manufacturer or
   a licensed engineer. No pairing with a condition grade or product listing.
3. **No vendor specifics.** No vendor named. No wind rating, snow load, span rating, or price figure,
   not even attributed. The 70 mph / 47 psf figures (and the 76 mph with anchor kit noted on 2026-08-10)
   are the vendor's claims about the vendor's product and are banned from this paragraph entirely. They
   are especially banned from headings, meta description, image alt text, and any schema, because those
   surfaces strip attribution and convert a vendor claim into a Steel Box Direct claim.
4. **No dollar figures.**
5. **HS-OUT-001.** New text must be dash-clean. Verification must use one pattern per character
   (separate checks for U+2014 and U+2013) per lesson L003; the combined-pattern grep silently
   false-PASSes on macOS BSD grep.

## Known pre-existing issue, flagged not fixed

`src/pages/for/farmers/index.astro` already contains literal em dash characters in its committed copy,
which conflicts with HS-OUT-001 for committed files. Pre-existing and out of scope for this edit. Raised
for a separate owner call, since a site-wide dash cleanup is its own task with its own diff risk.

## Related

- `.project-catalog/sessions/2026-08-07-session-log.md` (the RC-mode evidence packet)
- `UDO Project/PROJECT_STATE.json` T-015, T-011
- `UDO Project/TOPICS.md` slug `container-shelter`
- `UDO Project/LESSONS_LEARNED.md` L002, L003
- Edit target: `src/pages/for/farmers/index.astro`
