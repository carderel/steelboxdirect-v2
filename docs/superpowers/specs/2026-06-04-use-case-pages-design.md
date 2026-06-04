# Destination Pages — Design Spec
**Date:** 2026-06-04
**Status:** Approved
**Project:** Steel Box Direct (steelboxdirect.com)

---

## Goal

Build 4 ICP audience pages (`/for/[audience]/`) and expand to 3 new cities, creating the destination layer that directory backlinks and internal links will flow into. Guiding principle: **optimise for ranking, SEO, and AI visibility.**

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

**BaseLayout props:**
```
title="Shipping Containers for Farms in Ohio, Indiana & Kentucky | Steel Box Direct"
description="Farm storage containers delivered to your field. Most agricultural land in OH, IN, and KY qualifies for zoning exemptions — no permit, no foundation, no monthly fees."
pageType="guide"
datePublished="2026-06-04"
dateModified="2026-06-04"
```

**Hero:**
- Eyebrow: `For Farmers & Ag Operations`
- H1: `Farm Storage That Holds Up to Ohio Winters.`
- Lede: No permit on most agricultural land. No foundation required. Delivered to your field — not just your driveway. One purchase, no monthly storage fees.
- Accent bar color: `var(--c4-cost)` (green)

**Why containers work for farmers — 4 blocks:**

Block 1 — "Most farm properties qualify for zoning exemptions"
> Zoning rules in Ohio, Indiana, and Kentucky typically exempt agricultural land from the permit requirements that apply to residential or commercial properties. If you're farming — crops, livestock, or equipment — you're likely exempt. We can help you confirm based on your county and property type. No permit paperwork, no waiting period, no variance hearings.

Block 2 — "Weather-sealed storage without a permanent structure"
> A cargo-worthy ISO container holds a positive pressure seal against rain, wind, and snow. Unlike a barn addition or pole building, a container doesn't require a foundation, a concrete slab, or a building permit in most counties. It's technically personal property — meaning it can be placed, relocated, or removed without triggering a permanent structure review.

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

Q1: Do I need a permit for a shipping container on my farm in Ohio, Indiana, or Kentucky?
> In most cases, no. Ohio, Indiana, and Kentucky all have agricultural use exemptions that typically apply to storage structures on working farm land. If your property is classified as agricultural — meaning it's actively used for crop production, livestock, or ag-related purposes — it generally falls outside the residential and commercial zoning rules that require permits for storage structures. That said, rules vary by county and sometimes by municipality, so we recommend a quick call to your county zoning office to confirm. We've helped hundreds of farm buyers navigate this question, and the vast majority move forward without a permit of any kind.

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

Block 2 — "Ground-level access — no dock, no ramp"
> Container doors open to ground level. Tools, materials, and equipment go straight in and out without a lift gate or dock plate. The floor is 5/4" hardwood or steel plate — rated for forklift entry if needed. Standard interior height is 7'10".

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

Block 4 — "Permit requirements vary — we can help you figure yours out"
> Some municipalities require a zoning permit for a storage container; many don't. Agricultural properties almost always have exemptions. Residential properties inside city limits are most likely to need a permit. When you request a quote, include your county and whether you're inside city limits — we'll tell you what we know and help you find out what we don't.

**Container recommendations:**
- 20ft: "Best for: most residential properties. Fits the footprint of a large shed, stores the equivalent of a two-car garage." → `/shipping-containers-for-sale/20-foot-shipping-container/`
- 40ft: "Best for: large properties with a full driveway or dedicated storage area. Roughly twice the capacity of a 20ft." → `/shipping-containers-for-sale/40-foot-shipping-container/`
- One-trip: "Best for: placement in a visible location — front yard, property entrance, or anywhere appearance matters." → `/shipping-containers-for-sale/40-foot-one-trip-container/`
- Framing line: "Most homeowners choose the 20ft. It fits most driveways and backyards without special placement planning."

**FAQ (5 questions — unique to this page):**

Q1: Will a 20ft container fit in a standard suburban driveway?
> Usually, yes. A 20ft container is 8 feet wide and 20 feet long — roughly the footprint of a large SUV and a half-car length. Most standard suburban driveways are wide enough, though placement depends on attached garages, fence lines, or utility setbacks. More important than the footprint is delivery clearance: the truck needs about 50 feet of unobstructed approach. A standard residential street with traffic is typically workable. Include your address when requesting a quote and we can assess the approach.

Q2: Do I need a permit to have a shipping container on my residential property in Ohio?
> It depends on your location. Properties zoned agricultural are almost universally exempt. Residential properties inside city limits in Ohio have varying rules — some municipalities require a permit, some have a size threshold below which no permit is required, and some have no restriction at all. Most unincorporated township properties in Ohio, Indiana, and Kentucky don't require a permit. The fastest way to find out is to call your county auditor or zoning office. When you request a quote, tell us your county and we'll share what we know from working in your area.

Q3: How does delivery work in a residential neighborhood?
> A tilt-bed truck backs in, tilts, and slides the container into position. The process takes 30–45 minutes from truck arrival to completion. We minimize impact on neighboring traffic, but neighbors may need to move vehicles temporarily if the approach is tight. We don't require street closures or permits for delivery in most cases. If your street has weight limits or parking restrictions, mention that when you request a quote.

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

Block 4 — "Secure enough for most commercial insurance policies"
> A Cor-Ten steel container with a puck-lock hasp meets the standard for covered business property storage under most commercial property insurance policies. We provide delivery documentation for your records. If your carrier has specific requirements, let us know and we can accommodate.

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

Q4: How do businesses typically handle container storage for accounting or tax purposes?
> A purchased container is generally treated as tangible personal property and depreciates under MACRS as a 5 or 7-year asset under standard IRS classifications, though your accountant should confirm based on your specific use. The container is not real property and does not typically trigger real estate assessments or property tax reclassification. A leased container would be expensed as an operating cost. We provide a standard bill of sale for all purchases.

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
      { title: 'Agricultural Heritage', body: "Pickaway and Fairfield counties south of Columbus have deep agricultural roots. Farm storage containers on ag-exempt land are one of our most common orders in this region." },
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
    intro: "The Bluegrass region has some of the most demanding storage needs in our service area — horse farms need equipment and tack storage, distilleries need overflow space, and the growing suburbs around Lexington need residential solutions that work without permits on ag-classified land.",
    features: [
      { title: 'Horse Farm Solutions', body: "Woodford, Bourbon, and Scott counties are horse country. We have delivered tack storage, equipment containers, and hay storage to farms throughout the Bluegrass. Most ag-classified parcels in Kentucky qualify for zoning exemptions." },
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
    intro: "Fort Wayne has one of Indiana's strongest manufacturing and logistics bases. Our containers serve the full range — from production facilities that need overflow storage to rural properties in Allen and DeKalb counties where ag-exempt land makes placement simple.",
    features: [
      { title: 'Manufacturing and Industrial', body: "Allen County's industrial parks run along I-69 and US-30. We deliver to active production facilities, warehousing operations, and contractor staging areas throughout the Fort Wayne metro." },
      { title: 'Agricultural Northeast Indiana', body: "DeKalb, Noble, and Whitley counties have substantial agricultural activity. Farm storage containers on ag-classified land typically do not require permits, and our drivers know the rural roads in this region." },
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
      <a href="/for/farmers/" class="loc-icp-card">
        <span class="loc-icp-title">Farmers</span>
        <span class="loc-icp-desc">Zoning exemptions on most ag land in OH/IN/KY. Delivered to your field.</span>
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
