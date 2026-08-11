# Use-Case Pages — Design Spec
**Date:** 2026-06-04
**Status:** Approved (terminology realigned 2026-06-04)
**Project:** Steel Box Direct (steelboxdirect.com)

> **AMENDED 2026-08-10 for PROJECT_HS_003 compliance. This document was corrected, not born clean.**
> As originally written, this spec was the single largest source of prohibited copy in the repository. It
> contained paste-ready wording that asserted permit outcomes, agricultural zoning exemptions, building
> classification, property-tax treatment, third-party insurance coverage, and a floor load rating, all of
> them determinations Steel Box Direct is not entitled to make on a reader's behalf. Several of those
> strings were implemented verbatim and shipped live for six to nine weeks. Every violating passage has
> been replaced in place with compliant wording, and each carries an inline `AMENDED 2026-08-10` marker
> naming what the original claimed. Markers appear as a bold paragraph in prose, a `//` comment inside
> TypeScript blocks, and an HTML comment inside markup blocks, so the surrounding code stays valid.
> Text written for this amendment contains no em dash and no en dash. Five amended lines in this file still
> carry an em dash and three carry an en dash; in every one of those cases the dash sits in retained
> 2026-06-04 original text, either a `Block N` label whose scaffold was preserved while only its quoted title
> changed, or a sentence where only the violating clause was replaced. Each is noted at its own marker.
> Authority: `UDO Project/.project-catalog/decisions/2026-08-10-sitewide-permit-rework-authorized.md`.
> Rule: `UDO Project/HARD_STOPS.md`, PROJECT_HS_003. Evidence of the live damage:
> `UDO Project/.outputs/container-shelter/2026-08-10-permit-gate-violation-inventory.md`. Do not restore
> the original wording, and do not implement any version of this spec that determines a permit, zoning,
> tax, insurance, or structural outcome for the reader in either direction.

---

## Terminology (locked)

Two **separate** page types — do not conflate:

- **Use-case pages** — SEO pages targeting a specific *usage* of a container. Seed set: Farming, Contractors, Home, Business — **open-ended; more added later**. Built **off-template with unique content** to avoid duplicate-content penalties (they may share some structural elements, but the content is bespoke per page). Main-nav placement is **deferred until the pages are built**. They create outward internal-linking opportunities (e.g. a "Where we deliver" section linking to city pages). This spec's "ICP page" = use-case page.
- **Destination pages** — the City/Local landing pages (Cincinnati, Dayton, Indianapolis, Louisville — live; Columbus, Lexington, Fort Wayne — planned expansion). These already exist as a page type.

This spec's primary new deliverable is the **use-case pages**. The earlier "destination pages" framing was a project-name collision and is corrected here.

---

## Goal

Build the initial set of use-case pages (`/for/[use-case]/`, seed set of 4) and expand the destination (city) layer by 3 new cities. Use-case pages and destination pages cross-link, so directory backlinks and internal links flow through both. Guiding principle: **optimise for ranking, SEO, and AI visibility.**

---

## Scope

**Part A — ICP pages (4 static standalone .astro files):**
- `/for/farmers/`
- `/for/contractors/`
- `/for/homeowners/`
- `/for/businesses/`

**Part B — City expansion (3 new entries in `cities.ts`):**
- Columbus, OH
- Lexington, KY
- Fort Wayne, IN

**Part C — Site-wide wiring:**
- New "Who We Serve" dropdown in `SiteNav.astro`
- Locations dropdown updated with 3 new cities
- Each city page gets 4 ICP cross-links
- `/locations/` hub gets ICP section

---

## Architecture

```
src/pages/for/
  farmers/index.astro        ← static, standalone
  contractors/index.astro    ← static, standalone
  homeowners/index.astro     ← static, standalone
  businesses/index.astro     ← static, standalone

src/data/cities.ts           ← add Columbus, Lexington, Fort Wayne entries
src/components/SiteNav.astro ← add nav-ws dropdown + 3 new location links
src/pages/locations/index.astro ← add "By Customer Type" section
src/pages/[citySlug].astro   ← add ICP cross-link section before CTA
```

No new shared data file. Each ICP `.astro` file is fully standalone — content, schema, and layout all in one file.

---

## ICP Page Section Structure

Every ICP page uses this section order. Content is unique per page.

```
1. HERO
   pageType="guide", datePublished, dateModified
   Eyebrow chip | H1 | Lede | accent color bar

2. WHY CONTAINERS WORK FOR [AUDIENCE]
   3-4 benefit blocks: headline + full paragraph
   Specific numbers, conversational tone, keyword-dense naturally

3. WHICH CONTAINER FITS YOUR SITUATION
   2-3 recommendation cards (20ft, 40ft, one-trip)
   Audience-specific use case framing per card
   Each card links to product page

4. WHERE WE DELIVER
   Short paragraph: "250 miles from Cincinnati — Ohio, Indiana, Kentucky"
   4 city cards (Cincinnati, Dayton, Indianapolis, Louisville)
   Note: Columbus, Lexington, Fort Wayne added once those pages are live

5. COMMON QUESTIONS  (FAQPage JSON-LD via <Fragment slot="head">)
   5-7 full Q&A pairs — unique questions per page
   Full paragraph answers (not one-liners)

6. CTA
   Reuses .guide-product-cta dark ink section pattern
   Audience-specific headline → /quote/
```

**Accent colors per audience:**
- Farmers → `var(--c4-cost)` `#0B8F4E` (kelly green)
- Contractors → `var(--c3-deliver)` `#1747E6` (cobalt)
- Homeowners → `var(--c2-cond)` `#E53935` (red)
- Businesses → `var(--c5-permits)` `#FF5A1F` (orange)

---

## Part A — ICP Page Content

---

### `/for/farmers/`

**AMENDED 2026-08-10 (PROJECT_HS_003).** NOT on the original violation inventory; found during this pass,
and it is the worst placement of the claim in the whole document. The original `description` read: "Farm
storage containers delivered to your field. Most agricultural land in OH, IN, and KY qualifies for zoning
exemptions [emdash] no permit, no foundation, no monthly fees." That is a permit and zoning determination
naming three states, inside a **meta description**, the exact surface PROJECT_HS_003 singles out because it
strips all surrounding attribution and is what an answer engine quotes. Replacement wording is new for this
amendment and keeps the delivery and cost hooks without predicting an outcome.

**BaseLayout props:**
```
title="Shipping Containers for Farms in Ohio, Indiana & Kentucky | Steel Box Direct"
description="Farm storage containers delivered to your field across OH, IN, and KY. Nothing to pour, no monthly storage fees, and we point you to the office that decides local zoning."
pageType="guide"
datePublished="2026-06-04"
dateModified="2026-06-04"
```

**Hero:**
- Eyebrow: `For Farmers & Ag Operations`
- H1: `Farm Storage That Holds Up to Ohio Winters.`
- Lede: No foundation required. Delivered to your field, not just your driveway. One purchase, no monthly storage fees. Local zoning is your county's call, and we tell you who to ask.
- Accent bar color: `var(--c4-cost)` (green)

**AMENDED 2026-08-10 (PROJECT_HS_003).** NOT on the original violation inventory; found during this pass.
The Lede originally opened "No permit on most agricultural land." That is a bare permit determination in the
most prominent sentence on the page. Replacement wording is new for this amendment: the three selling facts
are kept, the permit prediction is replaced with the decider.

**Why containers work for farmers: 4 blocks**

**AMENDED 2026-08-10 (PROJECT_HS_003).** Block 1 was NOT on the original violation inventory and is a hard
violation. Its original title was "Most farm properties qualify for zoning exemptions" and its body asserted
that zoning rules in three named states "typically exempt agricultural land from the permit requirements,"
that a farming reader is "likely exempt," and that there is "no permit paperwork, no waiting period, no
variance hearings." That is a zoning determination, a permit determination, and jurisdiction plus outcome, in
one paragraph, under a heading that states the conclusion by itself. Replacement wording is new for this
amendment and follows the compliant model at `src/pages/permits/index.astro`: name the question, name the
decider, name what moves the answer, hand the determination to the reader.

Block 1: "Zoning and permits: who decides, and what to ask"
> Whether a container needs a zoning or building permit on farm land is decided locally, and it varies. What usually drives the answer is how the parcel is currently used, how the unit is set, how long it stays, and whether anything gets built onto it. Your county zoning office is the one that can tell you what applies to your parcel, and getting that answer before you buy is the buyer's responsibility. We do not determine, advise on, or guarantee permit or zoning requirements. Tell us your county and we will tell you which office to call and what is worth asking.

**AMENDED 2026-08-10 (PROJECT_HS_003).** Block 2 is the passage originally flagged at line 132 of this file,
and its wording shipped live at `src/pages/for/farmers/index.astro` lines 120 and 122. The original title was
"Weather-sealed storage without a permanent structure" and the original body read: "...a container doesn't
require a foundation, a concrete slab, or a building permit in most counties. It's technically personal
property [emdash] meaning it can be placed, relocated, or removed without triggering a permanent structure
review." That is a permit determination, a building-classification determination, and a promise about a review
outcome. The quantifier "in most counties" aggravates it by making an unresearched conclusion sound
researched. The replacement title is the approved wording from
`UDO Project/.outputs/container-shelter/2026-08-10-rework-farmers-homeowners.md` (target T-C, variant C1) and
the replacement body reuses the approved "1B FULLER" phrasing from
`UDO Project/.outputs/container-shelter/2026-08-10-permit-language-rework-draft.md`. The physical facts the
original was reaching for (no pour, no build, movable, resellable) all survive; only the legal conclusions
drawn from them are gone.

Block 2: "Weather-sealed storage with no slab to pour"
> A cargo-worthy ISO container holds a positive pressure seal against rain, wind, and snow. Unlike a barn addition or a pole building, nothing gets poured and nothing gets set in concrete, so you can place it, relocate it across the farm, or sell it off later without undoing any construction. What that means for permits and for how your property gets assessed is a separate question, decided by your county zoning office and your county auditor rather than by us, and getting that answer for your own parcel before you buy is the buyer's responsibility.

Block 3 — "One purchase, no monthly bill"
> The average storage unit runs $150–300 per month. A container costs more upfront but typically pays for itself within 3–5 years compared to off-farm storage — and you own it outright. When you no longer need it, it resells at close to purchase price. Steel holds its value in a way that rented square footage never will.

Block 4 — "Sized for equipment, feed, and tools"
> A 20ft container stores a full set of small equipment and supplies. A 40ft container fits a combine header, round bales, seed inventory, and toolboxes with room to walk through. One-trip units — essentially new — give you a clean interior for seed storage, chemical storage, or anything requiring pristine conditions.

**Container recommendations:**
- 20ft: "Best for: small equipment, fertilizer and chemical storage, hand tools, and seed bags. Fits most farm lane widths." → `/shipping-containers-for-sale/20-foot-shipping-container/`
- 40ft: "Best for: combine headers, large tillage equipment, hay and feed, multi-item storage. Requires a firm delivery path of at least 12ft width and 14ft height clearance." → `/shipping-containers-for-sale/40-foot-shipping-container/`
- One-trip: "Best for: seed storage, chemical storage, livestock equipment, or any application requiring a near-new interior without odors or previous cargo residue." → `/shipping-containers-for-sale/40-foot-one-trip-container/`
- Framing line: "Most farm buyers choose the 40ft cargo-worthy unit — it handles the widest range of equipment and feed storage at the most practical price point."

**FAQ (5 questions — unique to this page):**

**AMENDED 2026-08-10 (PROJECT_HS_003).** NOT on the original violation inventory and a hard violation. The
**question** is fine and is kept verbatim: asking it is exactly what a buyer wants. The original **answer**
opened "In most cases, no," asserted agricultural use exemptions in three named states, said a reader's
property "generally falls outside" the rules requiring permits, and closed "the vast majority move forward
without a permit of any kind." The existing hedge ("rules vary by county") did not travel with any of that.
This answer is also schema-bound in the companion implementation plan, so it would be emitted verbatim as
Steel Box Direct's permit position in FAQPage JSON-LD. Replacement wording is new for this amendment and is
deliberately self-contained, because an FAQ answer is extracted alone and cannot carry a link.

Q1: Do I need a permit for a shipping container on my farm in Ohio, Indiana, or Kentucky?
> That is the right question to ask, and it is not ours to answer. Requirements for a container on farm land are set locally, and they vary by county and sometimes by municipality, so the only answer that counts is the one for your own parcel. Call your county zoning office, describe the container and how you plan to use it, and ask what is required for placement. What tends to drive the answer is how the land is currently used, how the unit is set, how long it stays, and whether you build anything onto it. Getting that answer before you buy is the buyer's responsibility. We do not determine, advise on, or guarantee permit or zoning requirements.

Q2: Can a container be delivered to a field or gravel area, or does the truck need a paved road?
> Delivery trucks can handle gravel lanes, packed dirt drives, and field access roads in most conditions. What we need is a delivery path that's at least 12 feet wide with no overhead obstructions below 14 feet — low branches, power lines, gate arches. Soft ground, mud, or steep grades can create challenges, but our drivers have placed containers on farm properties across Ohio, Indiana, and Kentucky for years and know how to work around difficult terrain. When you request a quote, describe your access path and we'll flag anything that might affect delivery before we schedule.

Q3: What size container do I need for farm equipment storage?
> It depends on what you're storing. A 20ft container (roughly 1,170 cubic feet of interior space) fits small equipment like ATVs, implements, and a full complement of hand tools and supplies. A 40ft container (about 2,385 cubic feet) handles larger equipment — round balers, combine headers, grain carts — and still leaves room for feed, chemicals, and parts. Most buyers storing equipment that includes anything with a wide header or large footprint go with the 40ft. If you're unsure, describe your largest piece of equipment in the quote form and we'll confirm fit.

Q4: Can I put a container on grass or unpaved ground?
> Yes, with some preparation. Containers can be placed on compacted gravel, packed earth, or level grass, but they need reasonably level, firm ground to sit without shifting. For permanent placement, most farm buyers put down a layer of crushed gravel or concrete blocks under the corner castings — this keeps the floor off wet ground and prevents long-term warping. For temporary or seasonal placement, flat grass works fine. Our drivers can advise on placement when they arrive.

Q5: What's the difference between cargo-worthy and one-trip for farm use?
> A cargo-worthy container has made multiple international shipping voyages. It's structurally sound, passes a weathertight inspection, and will keep rain, wind, and pests out — but the interior may show rust staining, dents, or residual cargo odor from previous loads. For equipment and feed storage, this is typically irrelevant. A one-trip container made a single ocean crossing before being sold — the interior is essentially new, free of contamination, and odor-neutral. One-trip units cost more but are the right choice for seed storage, chemical storage, or any situation where interior cleanliness matters.

**CTA:** "Get a quote for your farm operation." → `/quote/`

---

### `/for/contractors/`

**BaseLayout props:**
```
title="Shipping Containers for Job Sites in Ohio, Indiana & Kentucky | Steel Box Direct"
description="Job site storage containers delivered across OH/IN/KY. Ground-level access, standard padlock hasp, dropped and picked up when the job's done."
pageType="guide"
datePublished="2026-06-04"
dateModified="2026-06-04"
```

**Hero:**
- Eyebrow: `For Contractors & Construction`
- H1: `Job Site Storage That Locks and Stays.`
- Lede: Standard padlock hasp. Ground-level door access. No forklift needed to load it. Delivered when you need it, retrieved when the job's done.
- Accent: `var(--c3-deliver)` (cobalt)

**Why containers work for contractors — 4 blocks:**

Block 1 — "Harder to break into than a job site trailer"
> ISO shipping containers are built from Cor-Ten steel — the same material used in ocean freight. The standard door lock mechanism accepts a padlock or puck lock through a lockbox hasp. Unlike a job site trailer, there's no gap at the roofline, no plastic panels, and no soft aluminum skin to cut through. It's substantially more secure than a wood toolbox, a cargo trailer, or an open van.

**AMENDED 2026-08-10 (PROJECT_HS_003).** NOT on the original violation inventory. The original body read:
"The floor is 5/4" hardwood or steel plate [emdash] rated for forklift entry if needed." "Rated for" is a load
claim asserted by Steel Box Direct with no source and no deflection, which PROJECT_HS_003 bans outright;
structural questions go to the container manufacturer or a licensed engineer. The same claim shipped live at
`src/pages/for/businesses/index.astro:126`. Replacement wording follows the approved handling in
`UDO Project/.outputs/container-shelter/2026-08-10-rework-businesses.md` (target 2), which keeps the useful
fact that a forklift drives straight in while refusing to issue the rating.

Block 2 — "Ground-level access — no dock, no ramp"
> Container doors open to ground level. Tools, materials, and equipment go straight in and out without a lift gate or dock plate. The floor is 5/4" hardwood or steel plate, the same deck the unit carried freight on, which is why a pallet jack or a forklift drives straight in through the doors. What that floor is rated to carry is a number from the unit's manufacturer, not from us, and any load close to a limit is a question for the manufacturer's specification or a licensed engineer. We do not issue load ratings. Standard interior height is 7'10".

Block 3 — "Delivered and retrieved on your schedule"
> We deliver within 250 miles of Cincinnati. You call when you're ready; we drop it. When the project ends, we pick it up. No rental center, no trailer registration, no CDL required on your end. The container sits on site until you need it gone.

Block 4 — "Flexible for multi-trade and phased projects"
> A single 40ft container handles material storage for multiple trades simultaneously. When you need a second container for a new phase, we can drop another. Most commercial projects in our service area get same-week delivery if inventory is available.

**Container recommendations:**
- 20ft: "Best for: single-trade tool storage, tight urban sites, or projects with limited staging area. Fits in a standard parking space with room to open doors." → `/shipping-containers-for-sale/20-foot-shipping-container/`
- 40ft: "Best for: multi-trade material storage, full tool sets across crews, and projects where you want staging and secure storage in the same unit." → `/shipping-containers-for-sale/40-foot-shipping-container/`
- One-trip: "Best for: clients or project owners who require a presentable on-site appearance — renovation projects in occupied neighborhoods, corporate campuses, or school sites." → `/shipping-containers-for-sale/40-foot-one-trip-container/`
- Framing line: "Most contractors on active builds choose the 40ft cargo-worthy unit. It handles the most volume at the best price per square foot of storage."

**FAQ (5 questions — unique to this page):**

Q1: Can a container be delivered directly to an active construction site?
> Yes, and it's one of the most common setups we handle. Our delivery truck uses a tilt-bed or boom-off method depending on site conditions. We need enough space to maneuver the truck (typically 50+ feet of clear approach), a stable surface to set the container on, and overhead clearance of at least 14 feet. For tight urban sites, we do a site assessment upfront. Tell us about the site when you request a quote — entry width, surface type, and any overhead obstacles — and we'll confirm feasibility before scheduling.

Q2: What kind of lock works best on a shipping container?
> The door hasp on most cargo-worthy containers accepts a standard discus or puck lock — Abloy, Medeco, or Master Lock "puck" series. These fit inside the lockbox recess on the door handle and are virtually impossible to cut without heavy equipment. Avoid standard padlocks with exposed shackles — they're vulnerable to bolt cutters. If you need to key multiple containers to the same lock for a large project, let us know and we can coordinate.

Q3: How much space does the truck need to deliver a container?
> For a 20ft container, the truck needs approximately 50 feet of clear approach with at least 12 feet of width. For a 40ft container, plan for 70+ feet of clear approach. Overhead clearance should be at least 14 feet along the entire approach path. The container will be placed roughly 3–5 feet from where the truck stops. If the site is tight, describe the layout in your quote request — our drivers are experienced with constrained job sites.

Q4: Can you deliver multiple containers to the same site?
> Yes. Multiple containers can be delivered to a single project in one trip or staggered across multiple trips. If you need units placed adjacent in a specific configuration — side-by-side with aligned doors, for example — include that in your quote request. We'll plan the delivery sequence to ensure the footprint works and all doors stay accessible.

Q5: What happens if we need to move the container mid-project?
> We can relocate the container within our service area for a repositioning fee. Alternatively, if you have a forklift or excavator on site with sufficient capacity (empty 20ft containers weigh about 4,850 lbs; 40ft units run 8,000+ lbs), your crew can reposition using the corner castings or forklift pockets on the underside.

**CTA:** "Get a quote for your job site." → `/quote/`

---

### `/for/homeowners/`

**BaseLayout props:**
```
title="Shipping Containers for Home Storage in Ohio, Indiana & Kentucky | Steel Box Direct"
description="Own your storage instead of renting it. Steel Box Direct delivers 20ft and 40ft containers to homes across OH/IN/KY. No monthly fees, no storage unit hassle."
pageType="guide"
datePublished="2026-06-04"
dateModified="2026-06-04"
```

**Hero:**
- Eyebrow: `For Homeowners`
- H1: `Backyard Storage Without the Monthly Bill.`
- Lede: One purchase. No renewal notices. No unit fee increases. Weatherproof storage that lives on your property — not in a facility across town.
- Accent: `var(--c2-cond)` (red)

**Why containers work for homeowners — 4 blocks:**

Block 1 — "Own it instead of renting it"
> A 10×10 climate-controlled storage unit in Cincinnati runs $150–250 per month. Over five years, that's $9,000–$15,000 in fees — for a space you never own. A container costs more upfront but belongs to you permanently. When you no longer need it, it can be resold — containers hold their value well because steel doesn't depreciate like wood. The math works strongly in favor of ownership for anyone storing long-term.

Block 2 — "More secure than a shed, more accessible than a storage facility"
> A shipping container is built from the same Cor-Ten steel used in ocean freight. There's no OSB or vinyl skin to cut through, no plastic windows, and no flat roof that accumulates water. The double door locks with a steel hasp designed for padlocks or puck locks. And it's on your property — you access it any time, day or night, without driving anywhere.

Block 3 — "A 20ft container fits most suburban properties"
> The most common residential size is the 20ft container: 8 feet wide, 8'6" tall, and 20 feet long — roughly the footprint of two standard parking spaces end-to-end. Most suburban driveways and backyards in Ohio, Indiana, and Kentucky can accommodate a 20ft unit. The delivery truck needs about 50 feet of clear approach — a standard residential street is typically sufficient.

**AMENDED 2026-08-10 (PROJECT_HS_003).** NOT on the original violation inventory. The block **title** was
already compliant and is kept verbatim. The original **body** predicted three outcomes: "Agricultural
properties almost always have exemptions. Residential properties inside city limits are most likely to need a
permit," plus "many don't." Frequency predictions are determinations; "almost always" is the aggravator.
Replacement wording is new for this amendment and swaps the predictions for the variables that actually move
the answer, which is the genuinely useful content the original was standing in for.

Block 4 — "Permit requirements vary — we can help you figure yours out"
> Requirements for a storage container differ between a city, a village, and an unincorporated township, and the office that decides is local rather than statewide. Your local zoning or building department is the one that can tell you what applies at your address, and an HOA or a deed restriction can add rules of its own on top. What usually drives the answer is the size of the unit, how close it sits to a property line, how long it stays, and whether you convert it into finished space. When you request a quote, include your county and whether you're inside city limits, and we'll tell you which office to call and what to ask. Confirming the requirement before you buy is the buyer's responsibility, and we do not determine, advise on, or guarantee permit, zoning, or HOA requirements.

**Container recommendations:**
- 20ft: "Best for: most residential properties. Fits the footprint of a large shed, stores the equivalent of a two-car garage." → `/shipping-containers-for-sale/20-foot-shipping-container/`
- 40ft: "Best for: large properties with a full driveway or dedicated storage area. Roughly twice the capacity of a 20ft." → `/shipping-containers-for-sale/40-foot-shipping-container/`
- One-trip: "Best for: placement in a visible location — front yard, property entrance, or anywhere appearance matters." → `/shipping-containers-for-sale/40-foot-one-trip-container/`
- Framing line: "Most homeowners choose the 20ft. It fits most driveways and backyards without special placement planning."

**FAQ (5 questions — unique to this page):**

Q1: Will a 20ft container fit in a standard suburban driveway?
> Usually, yes. A 20ft container is 8 feet wide and 20 feet long — roughly the footprint of a large SUV and a half-car length. Most standard suburban driveways are wide enough, though placement depends on attached garages, fence lines, or utility setbacks. More important than the footprint is delivery clearance: the truck needs about 50 feet of unobstructed approach. A standard residential street with traffic is typically workable. Include your address when requesting a quote and we can assess the approach.

**AMENDED 2026-08-10 (PROJECT_HS_003).** NOT on the original violation inventory and a hard violation. The
**question** is kept verbatim. The original **answer** asserted that agriculturally zoned properties "are
almost universally exempt" and that "most unincorporated township properties in Ohio, Indiana, and Kentucky
don't require a permit," which is a permit determination attached to three named states. This answer is
schema-bound in the companion implementation plan, so it would ship in FAQPage JSON-LD. Replacement wording is
new for this amendment, is self-contained because an extracted FAQ answer carries no link, and describes the
axis of the question instead of predicting where a reader lands on it.

Q2: Do I need a permit to have a shipping container on my residential property in Ohio?
> It depends on your address, and the office that decides is local rather than statewide. Rules differ between cities, villages, and unincorporated townships, so two properties a short drive apart can land differently. Call your municipal or county zoning office, or your building department, and ask what applies to a container at your address; an HOA or a deed restriction can add requirements on top of whatever the municipality says. What usually drives the answer is the size of the unit, how close it sits to a property line, how long it stays, and whether you convert it into finished space. When you request a quote, tell us your county and we'll tell you which office to call and what to ask. Confirming the requirement before you buy is the buyer's responsibility. We do not determine, advise on, or guarantee permit, zoning, or HOA requirements.

**AMENDED 2026-08-10 (PROJECT_HS_003).** The original answer contained "We don't require street closures or
permits for delivery in most cases." The inventory of record classifies the live version of this sentence as
BORDERLINE rather than a hard violation, because the street-closure half is a true statement about Steel Box
Direct's own operational needs and Steel Box Direct is the only party entitled to make it. It is amended here
anyway, for two reasons: the "or permits ... in most cases" half is a right-of-way permit hedge offered on the
reader's behalf with a quantifier that makes it sound surveyed, and an approved replacement already exists at
`UDO Project/.outputs/container-shelter/2026-08-10-rework-farmers-homeowners.md` (target T-F), so leaving the
spec unamended would leave it disagreeing with the implementation. The replacement is a split, not a deletion:
it keeps the operational fact and hands the municipal rule back, and it names the actual permit category so a
reader who does have to check knows the word to use. The 30 to 45 minute timing sentence is 2026-06-04 original
text and is retained verbatim, including its pre-existing en dash.

Q3: How does delivery work in a residential neighborhood?
> A tilt-bed truck backs in, tilts, and slides the container into position. The process takes 30 to 45 minutes from truck arrival to completion. We minimize impact on neighboring traffic, but neighbors may need to move vehicles temporarily if the approach is tight. For a typical residential delivery we don't need a street closure, and the truck works from your driveway and the apron. Whether your city requires a permit to stage or work in the public right-of-way is a municipal rule, and confirming it is the buyer's responsibility. If your street has weight limits or parking restrictions, mention that when you request a quote.

Q4: How does buying a container compare to renting a storage unit long-term?
> The math usually favors ownership for anything beyond 2–3 years. A climate-controlled 10×10 storage unit in the Cincinnati metro averages $150–200 per month and increases annually. Over 5 years, that's $9,000–$12,000 in fees for space you never own. A container — even at the high end — costs less over that horizon, and you can sell it when you're done. The container also holds more than a 10×10 unit and sits on your property. The tradeoff: you need the outdoor space, and a storage facility protects climate-sensitive items better since containers have no HVAC.

Q5: Can I add shelving, electricity, or other modifications to a container?
> Yes — containers are commonly modified for exactly this purpose. Shelving mounts directly to the corrugated side walls using standard fasteners. Electrical can be run from your home's panel to the container if it's placed within practical distance; an electrician can wire a standard outlet and light in a few hours. We don't sell modified containers, but we can point you toward local fabricators who handle electrical, shelving, ventilation, and insulation.

**CTA:** "Get a quote for your property." → `/quote/`

---

### `/for/businesses/`

**BaseLayout props:**
```
title="Commercial Container Storage in Ohio, Indiana & Kentucky | Steel Box Direct"
description="Overflow inventory, equipment storage, and secure commercial storage containers. Delivered within 250 miles of Cincinnati across OH/IN/KY. Quote in 4 hours."
pageType="guide"
datePublished="2026-06-04"
dateModified="2026-06-04"
```

**Hero:**
- Eyebrow: `For Businesses & Commercial Use`
- H1: `Overflow Storage That Scales With Your Operation.`
- Lede: Seasonal inventory spikes. Equipment overflow. On-site document archive. Delivered to your loading area, configured to your timeline.
- Accent: `var(--c5-permits)` (orange)

**Why containers work for businesses — 4 blocks:**

Block 1 — "Avoid the cost of off-site commercial storage"
> Commercial storage facilities charge by the pallet, the square foot, or the cubic foot — and access windows are limited by facility hours. An on-site container gives you same-day access to inventory, eliminates inbound/outbound freight costs to and from a third-party facility, and removes a logistics dependency from your operation. For businesses with predictable seasonal peaks, a container that arrives in spring and departs in fall is significantly cheaper than 6 months of commercial rack storage.

Block 2 — "Ground-level, forklift-compatible access"
> Container doors open at ground level to a hardwood or steel floor. Standard ISO containers have forklift pockets on the underside, so repositioning on site doesn't require a crane. Pallet jacks and forklifts enter directly — no dock required. Interior height is 7'10" for standard containers.

Block 3 — "Scales up or down with your inventory cycle"
> Need three containers for Q4 and one for the rest of the year? We can drop and retrieve on your schedule. Multiple units can be positioned adjacent with doors accessible. For businesses that want to own rather than manage a recurring delivery contract, purchase with resale when no longer needed is also straightforward.

**AMENDED 2026-08-10 (PROJECT_HS_003).** NOT on the original violation inventory. Both the title and the body
were violations. The original title, "Secure enough for most commercial insurance policies," is a coverage
determination in a **heading**, which PROJECT_HS_003 names as a surface that strips attribution. The original
body asserted that the container "meets the standard for covered business property storage under most
commercial property insurance policies," which is a determination about a third party's contract. Steel Box
Direct does not speak for anyone's carrier. This wording shipped live at
`src/pages/for/businesses/index.astro` lines 142 and 143, where the same claim was made three times on one
page. Replacement title and body are the approved wording from
`UDO Project/.outputs/container-shelter/2026-08-10-rework-businesses.md` (replacements 3A and 3B), which keeps
the construction facts and turns the coverage claim into the questions to put to the carrier.

Block 4: "Steel, a lockbox, and the records your insurer asks for"
> A Cor-Ten steel body has no soft aluminum skin, no roofline gap, and no plastic panel to cut through, and the recessed lockbox sits over the lock shackle so a bolt cutter has very little to grab. That is the construction. What your policy does with it is a different question, and it belongs to your carrier and your agent rather than to us. Raise it with them before you move inventory in, and ask what lock type they want to see, whether the container or its contents need to be listed on your schedule, and whether property kept outside a building is handled differently from property inside one. We can supply delivery paperwork, the placement, and container serial numbers for that conversation. We do not determine, advise on, or guarantee insurance coverage, and we do not speak for your carrier.

**Container recommendations:**
- 20ft: "Best for: single-product overflow, document archive, small equipment. Compact footprint for sites with limited staging area." → `/shipping-containers-for-sale/20-foot-shipping-container/`
- 40ft: "Best for: pallet-level inventory, seasonal goods, multi-product overflow. Handles full pallet entry with a forklift." → `/shipping-containers-for-sale/40-foot-shipping-container/`
- One-trip: "Best for: food-adjacent storage, pharmaceutical overflow, electronics, or any application with contamination or odor sensitivity requirements." → `/shipping-containers-for-sale/40-foot-one-trip-container/`
- Framing line: "Most commercial buyers choose the 40ft cargo-worthy unit for inventory overflow — it handles standard pallet configurations and costs significantly less per cubic foot than the 20ft."

**FAQ (5 questions — unique to this page):**

Q1: Can a container be placed at a loading dock or commercial facility?
> Containers can be placed adjacent to a loading dock, in a parking lot, or in a designated staging area. They cannot be directly docked to a raised loading platform — the container door sill sits at ground level, not at dock height. For dock-height access, a yard ramp or dock plate bridges the gap; these are widely available from material handling suppliers. Describe your placement area when requesting a quote and we'll confirm feasibility.

Q2: What are your lead times for commercial delivery?
> For standard cargo-worthy 20ft and 40ft units, most commercial orders in our service area are delivered within 3–5 business days of quote approval, subject to inventory availability. One-trip units may have a slightly longer lead time. If you have a project start date or a specific delivery window, include it in the quote request and we'll confirm upfront.

Q3: Can we get multiple containers for a single location?
> Yes. Multiple containers can be delivered to a single site in one trip or staggered across multiple trips. If you need units placed adjacent in a specific configuration — side-by-side with aligned doors — include a description of the layout in your quote request. We'll plan the delivery sequence to ensure the footprint works and all doors remain accessible.

**AMENDED 2026-08-10 (PROJECT_HS_003).** NOT on the original violation inventory, and the live version of this
answer was ranked the **worst violation on the site**. The original asserted that a purchased container "is
generally treated as tangible personal property," gave it a 5 or 7 year MACRS recovery period, and stated that
"the container is not real property and does not typically trigger real estate assessments or property tax
reclassification." That is a classification determination plus a tax and assessment determination. The one
hedge present attached only to the depreciation clause, leaving "is not real property" naked. Tax is the class
where reader reliance produces a filing error with a paper trail. This wording shipped live at
`src/pages/for/businesses/index.astro` lines 32 and 291, where line 291 added a link to IRS Publication 946 and
so converted a general statement into apparent authority, and line 32 fed it into FAQPage JSON-LD. Replacement
wording is the approved schema-safe version from
`UDO Project/.outputs/container-shelter/2026-08-10-rework-businesses.md` (replacement 1-SCHEMA); the publication
is named in words rather than linked, because this string is emitted verbatim into structured data.

Q4: How do businesses typically handle container storage for accounting or tax purposes?
> We can hand you clean paperwork. We cannot hand you a tax position, and you should not take one from a container dealer. Start with your accountant or CPA. What you tell them matters, because whether you buy or lease, how the unit is set, and what you use it for all feed into the treatment. Depreciation of business property runs through MACRS, the modified accelerated cost recovery system, and IRS Publication 946, How To Depreciate Property, is the document that explains how it works, including how asset class and recovery period get determined. That determination is your accountant's to make, not ours. Whether the container changes anything about how your parcel itself is assessed is a separate question with a different decider: your county auditor or local assessor. Getting both answers is the buyer's responsibility, and before you buy beats at filing time. We provide a standard bill of sale for every purchase for your records. We do not determine, advise on, or guarantee tax treatment or property assessment.

Q5: Do you work with businesses that need deliveries across different locations?
> Yes. We serve the full 250-mile radius from Cincinnati, which includes major commercial corridors in Ohio, Indiana, and Kentucky. If your business has multiple facilities within our service area, each location gets its own delivery. For recurring commercial relationships, contact us directly to discuss volume arrangements.

**CTA:** "Get a quote for your operation." → `/quote/`

---

## Part B — City Expansion Data

Add these three entries to `src/data/cities.ts` (append after Louisville):

### Columbus, OH
```typescript
{
  slug: 'columbus-shipping-containers',
  city: 'Columbus',
  state: 'OH',
  region: 'Central Ohio',
  eyebrow: 'Columbus · Central Ohio',
  lede: "From the manufacturing corridors of the Westside to the growing suburbs of Delaware County, we deliver steel-clad storage to the heart of Ohio. Direct from Cincinnati — no middleman.",
  delivery: {
    headline: 'Franklin, Delaware & Licking',
    body: "Columbus sits squarely in our service area. Whether you're in a tight Franklinton commercial lot or a sprawling farm outside Sunbury, we know Central Ohio's roads and know how to deliver.",
    counties: ['Franklin County', 'Delaware County', 'Licking County', 'Pickaway County', 'Fairfield County'],
  },
  map: {
    bbox: '-83.182,39.861,-82.819,40.098',
    marker: '39.9612,-82.9988',
    title: 'Columbus, OH delivery area map',
  },
  content: {
    h2: 'Why Columbus buyers choose Steel Box Direct',
    intro: "Columbus is Ohio's largest city and one of the fastest-growing metro areas in the Midwest. That growth means contractors need job site storage, businesses need overflow space, and homeowners need a solution that keeps up with busy lives. We deliver.",
    features: [
      { title: 'I-70 Corridor Expertise', body: "We run I-70 between Cincinnati and Columbus regularly. Our drivers know the access roads, the industrial parks, and the residential neighborhoods. Expect a smooth delivery and a driver who has been there before." },
      { title: 'Delaware County Growth', body: "The Dublin-Powell-Westerville corridor is booming. We deliver to new construction sites, established businesses, and suburban homeowners across Delaware County without the premium pricing that larger national operators charge." },
      // AMENDED 2026-08-10 (PROJECT_HS_003): NOT on the original violation inventory. The original body
      // ended "Farm storage containers on ag-exempt land are one of our most common orders in this region."
      // Naming two counties in the same breath as a zoning-exemption outcome is the jurisdiction-plus-outcome
      // category, the one PROJECT_HS_003 treats as highest risk. Replacement wording is new for this
      // amendment: the local credibility stays, the exemption claim is replaced with the decider.
      { title: 'Agricultural Heritage', body: "Pickaway and Fairfield counties south of Columbus have deep agricultural roots, and farm storage containers are one of our most common orders in this region. What your parcel's zoning requires is your county zoning office's call, not ours." },
    ],
  },
  stats: [
    { value: '90 mi', label: 'from Cincinnati' },
    { value: '4.8/5', label: 'Central Ohio rating' },
  ],
  cta: {
    headline: 'Ready for a Columbus quote?',
    body: 'Most Central Ohio requests are answered within 4 business hours.',
  },
  seo: {
    title: 'Shipping Containers for Sale in Columbus, OH | Steel Box Direct',
    description: 'Buying a shipping container in Columbus? We deliver cargo-worthy and one-trip containers to Franklin, Delaware, and Licking counties with flat-fee pricing.',
  },
},
```

### Lexington, KY
```typescript
{
  slug: 'lexington-shipping-containers',
  city: 'Lexington',
  state: 'KY',
  region: 'Bluegrass',
  eyebrow: 'Lexington · Bluegrass',
  lede: "From the horse farms of Woodford County to the bourbon distilleries of Scott County, we deliver weatherproof storage to the heart of the Bluegrass. Direct, no broker.",
  delivery: {
    headline: 'Fayette, Jessamine & Scott',
    body: "Lexington and the surrounding Bluegrass region are some of our most familiar Kentucky territory. Horse farms, distillery operations, and a growing suburban market all need what we deliver.",
    counties: ['Fayette County', 'Jessamine County', 'Scott County', 'Woodford County', 'Bourbon County'],
  },
  map: {
    bbox: '-84.703,37.941,-84.304,38.141',
    marker: '38.0406,-84.5037',
    title: 'Lexington, KY delivery area map',
  },
  content: {
    h2: 'Why Lexington buyers choose Steel Box Direct',
    // AMENDED 2026-08-10 (PROJECT_HS_003): NOT on the original violation inventory. Two hard violations here.
    // The `intro` originally ended "...need residential solutions that work without permits on ag-classified
    // land," a bare permit determination. The 'Horse Farm Solutions' body originally ended "Most ag-classified
    // parcels in Kentucky qualify for zoning exemptions," a zoning determination naming a state. Replacement
    // wording is new for this amendment. Only the violating clauses were replaced; the rest of each string,
    // including its pre-existing punctuation, is the 2026-06-04 original.
    intro: "The Bluegrass region has some of the most demanding storage needs in our service area. Horse farms need equipment and tack storage, distilleries need overflow space, and the growing suburbs around Lexington need residential storage that does not start with a construction project.",
    features: [
      { title: 'Horse Farm Solutions', body: "Woodford, Bourbon, and Scott counties are horse country. We have delivered tack storage, equipment containers, and hay storage to farms throughout the Bluegrass. What a given parcel's zoning requires is a question for the county, and confirming it is the buyer's responsibility." },
      { title: 'Distillery and Hospitality', body: "Lexington's bourbon and spirits industry has created demand for secure, scalable overflow storage. We work with production facilities and hospitality operations across the I-64 corridor." },
      { title: 'University and Medical District', body: "The University of Kentucky campus and the surrounding medical corridor generate regular demand for temporary and semi-permanent storage. We deliver to commercial sites, construction staging areas, and institutional property." },
    ],
  },
  stats: [
    { value: '130 mi', label: 'from Cincinnati' },
    { value: '4.8/5', label: 'Bluegrass rating' },
  ],
  cta: {
    headline: 'Ready for a Lexington quote?',
    body: 'Most Bluegrass requests are answered within 4 business hours.',
  },
  seo: {
    title: 'Shipping Containers for Sale in Lexington, KY | Steel Box Direct',
    description: 'Looking for a shipping container in Lexington? We deliver cargo-worthy and one-trip containers to Fayette, Woodford, and Scott counties with flat-fee pricing.',
  },
},
```

### Fort Wayne, IN
```typescript
{
  slug: 'fort-wayne-shipping-containers',
  city: 'Fort Wayne',
  state: 'IN',
  region: 'Northeast Indiana',
  eyebrow: 'Fort Wayne · Northeast Indiana',
  lede: "From the manufacturing floors of Allen County to the farm fields of DeKalb and Whitley counties, we bring Cincinnati-quality container service to Northeast Indiana. No brokers, no call centers.",
  delivery: {
    headline: 'Allen, DeKalb & Whitley',
    body: "Fort Wayne is near the edge of our service radius, but we run it regularly. The manufacturing base, the ag land to the north and east, and a growing residential market make it one of our most active Indiana territories.",
    counties: ['Allen County', 'DeKalb County', 'Whitley County', 'Noble County', 'Huntington County'],
  },
  map: {
    bbox: '-85.329,41.031,-84.929,41.231',
    marker: '41.1306,-85.1289',
    title: 'Fort Wayne, IN delivery area map',
  },
  content: {
    h2: 'Why Fort Wayne buyers choose Steel Box Direct',
    // AMENDED 2026-08-10 (PROJECT_HS_003): NOT on the original violation inventory. The `intro` originally
    // ended "...rural properties in Allen and DeKalb counties where ag-exempt land makes placement simple,"
    // and the 'Agricultural Northeast Indiana' body below originally read "Farm storage containers on
    // ag-classified land typically do not require permits, and our drivers know the rural roads in this
    // region." Both name counties in the same breath as a zoning or permit outcome. Replacement wording is new
    // for this amendment; only the violating clauses were replaced, and pre-existing punctuation elsewhere in
    // each string is the 2026-06-04 original.
    intro: "Fort Wayne has one of Indiana's strongest manufacturing and logistics bases. Our containers serve the full range, from production facilities that need overflow storage to rural properties in Allen and DeKalb counties with room to place a unit wherever it is needed.",
    features: [
      { title: 'Manufacturing and Industrial', body: "Allen County's industrial parks run along I-69 and US-30. We deliver to active production facilities, warehousing operations, and contractor staging areas throughout the Fort Wayne metro." },
      { title: 'Agricultural Northeast Indiana', body: "DeKalb, Noble, and Whitley counties have substantial agricultural activity. Farm storage containers are a steady order here and our drivers know the rural roads, but whether a permit applies to your parcel is your county zoning office's call." },
      { title: 'Residential and Suburban', body: "Fort Wayne's residential market is one of the most affordable in Indiana. Homeowners building additions, staging a renovation, or simply needing long-term storage find that a 20ft container fits most properties in the Fort Wayne suburbs." },
    ],
  },
  stats: [
    { value: '185 mi', label: 'from Cincinnati' },
    { value: '4.8/5', label: 'Northeast Indiana rating' },
  ],
  cta: {
    headline: 'Ready for a Fort Wayne quote?',
    body: 'Most Northeast Indiana requests are answered within 4 business hours.',
  },
  seo: {
    title: 'Shipping Containers for Sale in Fort Wayne, IN | Steel Box Direct',
    description: 'Looking for a shipping container in Fort Wayne? We provide cargo-worthy and one-trip containers with flat-fee delivery to Allen, DeKalb, and Whitley counties.',
  },
},
```

---

## Part C — Site-Wide Wiring

### SiteNav.astro — "Who We Serve" dropdown

Insert a new `nav-ws` dropdown AFTER the Locations dropdown (before the `<a class="cta-hd">`). Uses identical CSS class pattern as existing dropdowns but with `ws` prefix:

```astro
<div class="nav-ws">
  <a href="/for/farmers/" class="nav-ws-trigger">
    Who We Serve
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
  </a>
  <div class="nav-ws-drop">
    <a href="/for/farmers/"><span class="dc">FRM</span><span>Farmers</span></a>
    <a href="/for/contractors/"><span class="dc">CON</span><span>Contractors</span></a>
    <a href="/for/homeowners/"><span class="dc">HMO</span><span>Homeowners</span></a>
    <a href="/for/businesses/"><span class="dc">BIZ</span><span>Businesses</span></a>
  </div>
</div>
```

Add CSS for `.nav-ws` / `.nav-ws-trigger` / `.nav-ws-drop` in `BaseLayout.astro` global styles — copy the `.nav-tl` block and substitute `ws` for `tl`. Also add mobile expansion rules in the `@media (max-width: 960px)` block.

### SiteNav.astro — Locations dropdown (add 3 new cities)

Append to `.nav-loc-drop`:
```astro
<a href="/columbus-shipping-containers/"><span class="dc">CMH</span><span>Columbus</span></a>
<a href="/lexington-shipping-containers/"><span class="dc">LEX</span><span>Lexington</span></a>
<a href="/fort-wayne-shipping-containers/"><span class="dc">FWA</span><span>Fort Wayne</span></a>
```

### [citySlug].astro — ICP cross-links section

Add this section immediately BEFORE the existing `.cta-section` on each city page:

```astro
<section class="local-icp">
  <div class="wrap">
    <p class="m" style="margin-bottom: 24px; opacity: .55;">What are you storing?</p>
    <div class="icp-grid">
      <a href="/for/farmers/" class="icp-card">
        <span class="icp-label">Farmers</span>
        <span class="icp-arrow">→</span>
      </a>
      <a href="/for/contractors/" class="icp-card">
        <span class="icp-label">Contractors</span>
        <span class="icp-arrow">→</span>
      </a>
      <a href="/for/homeowners/" class="icp-card">
        <span class="icp-label">Homeowners</span>
        <span class="icp-arrow">→</span>
      </a>
      <a href="/for/businesses/" class="icp-card">
        <span class="icp-label">Businesses</span>
        <span class="icp-arrow">→</span>
      </a>
    </div>
  </div>
</section>
```

Scoped style for `.local-icp` and `.icp-grid` / `.icp-card` in `[citySlug].astro`'s `<style>` block:
```css
.local-icp { padding: 48px 0; background: var(--cream); border-bottom: 1.5px solid rgba(11,15,26,.1); }
.icp-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.icp-card { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border: 2px solid var(--ink); font-family: var(--narrow); font-weight: 700; font-size: 18px; text-transform: uppercase; transition: background .15s, color .15s; }
.icp-card:hover { background: var(--ink); color: var(--cream); }
@media (max-width: 768px) { .icp-grid { grid-template-columns: 1fr 1fr; } }
```

### /locations/index.astro — add "By Customer Type" section

Add a new section after the existing city grid, before the FAQ section:

```astro
<section class="loc-icp">
  <div class="wrap">
    <h2 class="loc-icp-heading">Storage solutions by customer type</h2>
    <div class="loc-icp-grid">
      <!-- AMENDED 2026-08-10 (PROJECT_HS_003): NOT on the original violation inventory. The original desc read
           "Zoning exemptions on most ag land in OH/IN/KY. Delivered to your field." A zoning determination
           naming three states, inside a 70-character card blurb with no room for attribution. Replacement
           wording is new for this amendment. -->
      <a href="/for/farmers/" class="loc-icp-card">
        <span class="loc-icp-title">Farmers</span>
        <span class="loc-icp-desc">Built for farm storage in OH, IN, and KY. Delivered to your field.</span>
        <span class="loc-icp-cta">Learn more →</span>
      </a>
      <a href="/for/contractors/" class="loc-icp-card">
        <span class="loc-icp-title">Contractors</span>
        <span class="loc-icp-desc">Job site delivery, standard padlock, retrieved when done.</span>
        <span class="loc-icp-cta">Learn more →</span>
      </a>
      <a href="/for/homeowners/" class="loc-icp-card">
        <span class="loc-icp-title">Homeowners</span>
        <span class="loc-icp-desc">Own it instead of renting. Fits most suburban driveways.</span>
        <span class="loc-icp-cta">Learn more →</span>
      </a>
      <a href="/for/businesses/" class="loc-icp-card">
        <span class="loc-icp-title">Businesses</span>
        <span class="loc-icp-desc">Overflow inventory and seasonal storage. Forklift-compatible.</span>
        <span class="loc-icp-cta">Learn more →</span>
      </a>
    </div>
  </div>
</section>
```

Scoped style for `locations/index.astro`:
```css
.loc-icp { padding: 64px 0; background: var(--ink); color: var(--cream); }
.loc-icp-heading { font-family: var(--narrow); font-size: clamp(24px, 3vw, 36px); font-weight: 700; text-transform: uppercase; margin: 0 0 32px; }
.loc-icp-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.loc-icp-card { display: flex; flex-direction: column; gap: 8px; padding: 28px 24px; border: 2px solid rgba(246,241,231,.25); transition: border-color .15s, background .15s; }
.loc-icp-card:hover { border-color: var(--yellow); background: rgba(246,241,231,.06); }
.loc-icp-title { font-family: var(--narrow); font-weight: 700; font-size: 22px; text-transform: uppercase; color: var(--yellow); }
.loc-icp-desc { font-size: 14px; opacity: .7; line-height: 1.5; }
.loc-icp-cta { font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: .08em; margin-top: auto; padding-top: 12px; }
@media (max-width: 768px) { .loc-icp-grid { grid-template-columns: 1fr 1fr; } }
```

---

## Schema Per ICP Page

Each ICP page injects a unique `FAQPage` JSON-LD via `<Fragment slot="head">` using its 5 page-specific Q&A pairs. Article schema (via BaseLayout → Schema) uses `datePublished="2026-06-04"` and `dateModified="2026-06-04"`.

No FAQPage on city expansion pages — they use the existing `[citySlug].astro` city-specific FAQ pattern already established.

---

## Sitemap

All new pages auto-included by `@astrojs/sitemap` (filter only excludes `/admin/`). After deploy, submit updated sitemap to Google Search Console.

---

## Files Changed

| File | Action |
|------|--------|
| `src/pages/for/farmers/index.astro` | Create |
| `src/pages/for/contractors/index.astro` | Create |
| `src/pages/for/homeowners/index.astro` | Create |
| `src/pages/for/businesses/index.astro` | Create |
| `src/data/cities.ts` | Modify — add Columbus, Lexington, Fort Wayne |
| `src/components/SiteNav.astro` | Modify — add nav-ws dropdown + 3 city links |
| `src/layouts/BaseLayout.astro` | Modify — add nav-ws CSS block |
| `src/pages/[citySlug].astro` | Modify — add ICP cross-link section |
| `src/pages/locations/index.astro` | Modify — add "By Customer Type" section |
