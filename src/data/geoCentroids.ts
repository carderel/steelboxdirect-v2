// src/data/geoCentroids.ts
// One population-centroid ZIP per metro, plus the two per-metro flags that decide whether a city
// page publishes a price at all and whether that metro counts toward the sitewide average. All
// fifteen publish, seven of them feed the sitewide average. Hand written, human owned. Nothing
// generated ever writes this file.
//
// WHY THIS IS NOT PART OF THE GENERATED PRICE MODULE. src/data/geoPricing.ts is rewritten by an
// unattended daily job. If the ZIP list and the publish flags lived in that same file, a
// serialiser bug could quietly reprice a metro from the wrong ZIP, or switch on a market that was
// deliberately left off, and the diff would read as an ordinary price update. Kept apart, the job
// can change what a metro costs but never which metro or which ZIP, and the guard asserts that.
//
// WHY A CENTROID AND NOT A SERVICE-AREA ZIP. cities.ts carries primaryZips, which are marketing
// service-area ZIPs picked to demonstrate coverage across several counties. A number quoted from
// one of those is a number from a spot chosen for reach, not one representative of the metro. A
// centroid is a stated, reproducible rule rather than an arbitrary pick, and it stays defensible
// if the feed ever moves from a flat per-metro delivery zone rate to per-mile pricing.
//
// WHAT THIS MODULE OWNS, in one line each. zip, the point a metro is priced from. publish, whether
// that metro renders a price on its own city page. nationalBasis, whether that metro counts toward
// the sitewide average. Three separate human decisions, and the second and third are not the same
// question: see NATIONAL BASIS RULING below before assuming one implies the other.
//
// SELECTION CRITERION, applied identically fifteen times:
//   For each metro, take the counties of its core-based statistical area under OMB Bulletin 23-01
//   of July 2023, compute the population-weighted mean of the Census 2020 county centers of
//   population, and resolve that point to the 2020 ZCTA whose polygon contains it. ZCTAs are built
//   only from residential address blocks, so a returned ZCTA is by construction not a
//   PO-box-only or single-building ZIP. No substitution was needed anywhere: all fifteen computed
//   points landed in a residential, serviceable ZCTA on the first resolution.
//
// SOURCES. Census 2020 Centers of Population, county files, one per state. ZCTA resolution via the
// Census Geocoder, benchmark Public_AR_Current, vintage Census2020_Current. Metro composition from
// OMB Bulletin 23-01 as tabulated per CBSA. Derived 2026-08-17. The full working, the per-metro
// coordinates, the alternates considered, the confidence table and every source URL live in:
//   UDO Project/.outputs/research/2026-08-17-metro-centroid-zips.md
// One stated approximation: the weighting used population alone rather than population times
// cosine of latitude. Across a single metro that shifts the point by roughly 0.01 degrees, which
// matters only for new-york, where three candidate ZCTAs all return the same price anyway.
//
// PROBE RESULTS, 2026-08-17. Every ZIP below was queried against the live pricing feed before it
// was locked in, because a centroid the feed cannot price is not a usable centroid and 5am inside
// an unattended job is the wrong moment to discover it. All fifteen returned serviceable, with
// availability true and non-null pricing fields, on all three SKUs this site sells. Thirty-four
// ZIPs were queried in total, the other nineteen being downtown references and alternates. The
// recorded figures stay in the research note: this module holds no prices.
//
// CONFIDENCE. The research note rates every metro and rates nine of the fifteen medium. Two of
// those nine need naming right here, because their weakness sits in the metro DEFINITION rather
// than in the arithmetic, which means a later reader can reasonably arrive at a different ZIP and
// be right to ask why:
//   cleveland 44105   The July 2023 delineation added Ashtabula County, taking the metro from five
//                     counties to six, and that flips the answer from 44109, Old Brooklyn, to
//                     44105, Slavic Village. The six-county composition was taken from Wikipedia,
//                     a secondary source, not from a primary delineation file.
//   charleston 29406  The three-county composition, Berkeley plus Charleston plus Dorchester, is
//                     the one definitional claim the research pass could not source. It is a long
//                     stable definition, but it is uncited. Downgraded on citation, not on
//                     arithmetic.
// Neither is urgent, because each prices identically to its alternative, 44109 and 29401
// respectively. Do not read the other thirteen as uniformly certain either: the seven remaining
// medium ratings are medium on arithmetic robustness in small metros, or on an editorial choice of
// definition, rather than on a missing citation. Read the table in the note before moving a ZIP.
//
// PUBLISH RULING, 2026-08-18. All fifteen metros publish. The earlier recommendation was to harvest
// all fifteen and publish only the seven home-region metros, on the assumption that the depot
// markets carried worse delivery economics and so could not sit behind the same all-in delivered
// promise. The live-feed probe disproved the assumption. Every depot metro resolved to a local yard,
// and several of those yards are nearer their metro centroid than the home-region yards are to
// theirs: charleston is the nearest in the whole set at under five miles, against roughly eighteen
// for cincinnati, and it is charged accordingly. The delivered spread across the fifteen is narrow
// and its low end is a depot metro, not a home one. The per-metro distances and figures stay in the
// research note, because this module holds no prices. There is no phase two: the split the earlier
// draft described does not exist, and no metro is waiting to be turned on.
//
// NATIONAL BASIS RULING, 2026-08-18. The sitewide average is the mean of the SEVEN home-region
// metros only, recorded in the nationalBasis field below and consumed by nationalPrice in
// src/data/pricing.ts.
//
// READ THIS BEFORE UNDOING IT. This looks like the home and depot split the PUBLISH RULING directly
// above just retired, and it is not the same split, because it answers a different question. The
// publish question is whether a depot metro can stand behind the same all-in delivered promise on
// its own city page, and the probe answered yes for all fifteen, so all fifteen publish. The basis
// question is what a sitewide average should MEAN when the word average is rendered beside one
// number on the homepage, the product hub and three product pages. Those five surfaces scope
// themselves to the home region in their own titles, descriptions, ledes and delivery copy, and none
// of them mentions a coastal or out-of-region metro anywhere. A mean over all fifteen therefore
// renders a figure whose true basis cannot be stated in any clause the surrounding copy supports,
// and four out-of-region metros priced from yards under ten miles out pulled it below every single
// home market. Naming the basis in the label, which those surfaces now do, is only possible if the
// basis is nameable. Nothing here reopens the publish question, no metro stops publishing, and no
// city page changes. If a later reader wants the wider mean back, that is a decision about the
// sitewide average and it is argued on this paragraph, not on the paragraph above it.
//
// COST OF THIS RULING, so it is not a surprise later. The contributing sample drops from forty five
// figures to twenty one, which roughly doubles the leverage of each metro. A hundred dollar move in
// one metro moves the sitewide figure by about fourteen dollars where it used to move it by about
// seven, and with the rounding in pricing.ts the rendered figure will visibly change more often.
// One home metro currently sits well above its own group mean on the 40ft standard, sourced from
// beyond a hundred and seventy miles out, so it drags that size while the scarcity lasts.
//
// RULES FOR EDITING:
//   1. Never derive a ZIP from primaryZips, and never average them or pick the one nearest
//      downtown. Those are three different wrong answers. Redo the criterion above instead.
//      Three of the fifteen centroids do land on a ZIP that also appears in the same city
//      primaryZips list, by arithmetic rather than by shortcut, and geoCentroids.test.ts
//      allowlists exactly those three by slug with the derivation recorded. Do not add a fourth
//      to that allowlist without redoing the derivation and writing down what you checked.
//   2. Probe a candidate against the live feed before locking it, and note the result above.
//   3. zip is a string, never a number. Leading zeros are significant in ZIP codes. None of these
//      fifteen begins with a zero, which is exactly why the type has to hold the line now, before
//      one does.
//   4. slug matches a cities.ts slug exactly, suffix included. The guard asserts one entry per
//      city and no extras in either direction, so a sixteenth city cannot land without an entry
//      here, and an entry here cannot outlive its city.
//   5. publish is true on all fifteen and stays that way by default. It is kept as the per-metro
//      kill switch: if one metro feed goes bad, that metro stops quoting on its own without
//      touching the other fourteen and without a code change anywhere else. Switching one off is a
//      deliberate one-line diff, and the guard stays red until the expected publish set in
//      geoCentroids.test.ts is edited in the same commit, which is the point of the assertion. Do
//      not delete the field for looking unused, and do not read a uniform true as a reason to.
//   6. Keep every comment in this file free of apostrophes and quote characters. The hs003 guard
//      pairs quote characters across the whole file to find string literals, so one stray
//      apostrophe up here re-pairs every literal below it and can silently suppress a real
//      finding. An even number is harmless and an odd number is not, so reason about parity across
//      the whole file rather than about one apostrophe.
//   7. Never name the supplier here, and never put a price or a delivery-time claim in this
//      module. It maps metros to ZIPs and nothing else.
//   8. nationalBasis is a separate decision from publish and is never derived from region in
//      cities.ts, because the two would then be the same field and a region rename would silently
//      reprice the homepage. It is also never derived from publish: switching a metro off with its
//      kill switch already removes it from the sitewide figure through nationalBasisCentroids below,
//      which is the intersection of the two. Moving a metro into or out of the basis is a deliberate
//      one-line diff, the expected set in geoCentroids.test.ts has to be edited in the same commit,
//      and the NATIONAL BASIS RULING note above has to be updated to say why. A metro cannot be in
//      the basis without publishing, since a figure nobody can look up on a city page has no
//      business being averaged into the one number the whole site renders.

/** ISO date the fifteen centroids were derived and probed. Provenance, not a freshness signal. */
export const CENTROIDS_DERIVED_ON = '2026-08-17';

export interface MetroCentroid {
  /** Matches a slug in src/data/cities.ts exactly, including the -shipping-containers suffix. */
  slug: string;
  /**
   * Population-centroid ZIP for the metro, five digits, always a string. See the selection
   * criterion in this module header for how it was chosen.
   */
  zip: string;
  /**
   * Whether this metro publishes a price on its city page. True on all fifteen. NOT dead weight for
   * being uniform: this is the per-metro kill switch, the one place a single metro can be stopped
   * from quoting when its feed data goes bad, without touching the other fourteen, and a later task
   * reads it. Do not remove it as unused. See editing rule 5 before changing one.
   */
  publish: boolean;
  /**
   * Whether this metro counts toward the sitewide average figure. True on the seven home-region
   * metros and false on the eight depot metros, ruled 2026-08-18. NOT a duplicate of publish and not
   * a duplicate of region in cities.ts: read the NATIONAL BASIS RULING in this module header, which
   * states why a metro can publish its own delivered figure and still be wrong to average into a
   * number rendered under the word average on five home-region-scoped surfaces. See editing rule 8.
   */
  nationalBasis: boolean;
}

export const geoCentroids: MetroCentroid[] = [
  // Home region.

  // Roselawn, Golf Manor and Bond Hill, Hamilton County OH. 15-county CBSA verified.
  { slug: 'cincinnati-shipping-containers', zip: '45237', publish: true, nationalBasis: true },

  // Old North Dayton, Montgomery County OH. Three-county metro, so the point is not robust.
  { slug: 'dayton-shipping-containers', zip: '45404', publish: true, nationalBasis: true },

  // Northeast Columbus, Mifflin Township, Franklin County OH. Airport ZCTA, and residential.
  { slug: 'columbus-shipping-containers', zip: '43219', publish: true, nationalBasis: true },

  // Martindale-Brightwood, Marion County IN. 11-county 2023 definition verified.
  { slug: 'indianapolis-shipping-containers', zip: '46218', publish: true, nationalBasis: true },

  // Belknap and Bonnycastle, Jefferson County KY. Also appears in primaryZips: see rule 1.
  { slug: 'louisville-shipping-containers', zip: '40205', publish: true, nationalBasis: true },

  // Chevy Chase and Ashland Park, Lexington-Fayette KY. Fayette is 62 percent of the metro.
  { slug: 'lexington-shipping-containers', zip: '40502', publish: true, nationalBasis: true },

  // Westmoreland, west Huntington, Cabell County WV. Small strung-out river metro.
  { slug: 'huntington-shipping-containers', zip: '25704', publish: true, nationalBasis: true },

  // Depot region. Publishing on the same terms as the home region: see PUBLISH RULING above.

  // Slavic Village and Union-Miles, Cuyahoga County OH. Medium confidence, see CONFIDENCE above.
  { slug: 'cleveland-shipping-containers', zip: '44105', publish: true, nationalBasis: false },

  // Garden City, Chatham County GA. Industrial-heavy, and a genuine residential ZCTA.
  { slug: 'savannah-shipping-containers', zip: '31408', publish: true, nationalBasis: false },

  // North Charleston, Charleston County SC. Medium confidence, see CONFIDENCE above.
  { slug: 'charleston-shipping-containers', zip: '29406', publish: true, nationalBasis: false },

  // Riverview and Lochhaven, Norfolk city VA. The point sits near the Lafayette River shoreline.
  { slug: 'norfolk-shipping-containers', zip: '23505', publish: true, nationalBasis: false },

  // Houston Heights, Harris County TX. Also appears in primaryZips: see rule 1.
  { slug: 'houston-shipping-containers', zip: '77008', publish: true, nationalBasis: false },

  // Greenpoint, Brooklyn, Kings County NY. 22-county CBSA under the 2023 delineation.
  { slug: 'new-york-shipping-containers', zip: '11222', publish: true, nationalBasis: false },

  // Berkley, Oakland County MI. Largest centroid-to-downtown offset in the set at 14.3 miles.
  { slug: 'detroit-shipping-containers', zip: '48072', publish: true, nationalBasis: false },

  // Rockhill and UMKC, Kansas City MO, Jackson County. Bi-state 14-county CBSA.
  { slug: 'kansas-city-shipping-containers', zip: '64110', publish: true, nationalBasis: false },
];

/** Derived, never hardcoded, so the count cannot disagree with the list. */
export const centroidCount = geoCentroids.length;

/** Slug to entry lookup for the harvest script and the city page template. */
export const centroidBySlug: Record<string, MetroCentroid> = Object.fromEntries(
  geoCentroids.map((m) => [m.slug, m]),
);

/** The metros that render a price. Derived from the publish flags, currently all fifteen of them. */
export const publishingCentroids = geoCentroids.filter((m) => m.publish);

export const publishingCentroidCount = publishingCentroids.length;

/**
 * The metros that feed the sitewide average figure: the seven whose nationalBasis flag is on, AND
 * that publish. The intersection rather than the flag alone, so that flipping the per-metro kill
 * switch moves the sitewide figure in the same direction as it moves that city page, which is the
 * property the old basis had when it read publishingCentroids. Consumed by nationalPrice and
 * nationalEffectiveSince in src/data/pricing.ts and by nothing else. See NATIONAL BASIS RULING and
 * editing rule 8 in this module header before changing the membership.
 */
export const nationalBasisCentroids = geoCentroids.filter((m) => m.nationalBasis && m.publish);

/** Derived, so a rendered count of the basis metros cannot disagree with the list above. */
export const nationalBasisCentroidCount = nationalBasisCentroids.length;

/** Every ZIP the harvest queries, in list order. All fifteen are harvested regardless of publish. */
export const centroidZips = geoCentroids.map((m) => m.zip);
