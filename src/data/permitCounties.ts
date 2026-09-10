// src/data/permitCounties.ts
// The county level jurisdictions behind /permits/{state}/{county}/, DERIVED AT IMPORT TIME from the
// zoning arrays in src/data/cities.ts. There is no second copy of a county name, an office name or
// an office URL anywhere in this repository: cities.ts owns those facts and this module reshapes
// them. Adding a county to a city's zoning array publishes a permit page for it on the next build,
// and removing one unpublishes it, with nothing here to remember.
//
// WHY DERIVED RATHER THAN TRANSCRIBED. A transcribed copy of 80 office URLs is a second source of
// truth that starts identical and ends wrong, and the direction it goes wrong in is invisible: the
// city page keeps linking the office it always linked while the permit page keeps linking the one
// somebody fixed six months ago. Deriving also keeps the strings physically out of this file, which
// matters for one concrete reason beyond tidiness. The PROJECT_HS_003 content guard
// (src/lib/compliance/hs003-content-guard.test.ts) carries an ALLOWLIST entry adjudicated against
// the exact path src/data/cities.ts for the "City of Houston (no zoning; ordinance-based
// development rules)" label. Copying that label into this file would have re-raised a finding that
// an owner already ruled on, in a file the ruling does not cover. Derivation cannot.
//
// THE DERIVATION, in the order it runs.
//   1. Every entry of every city's `zoning` array is read. There are 80 of them across 15 cities.
//   2. A trailing parenthetical is split off the county label. "Lawrence County (OH)" gives the
//      bare name plus "OH"; "Franklin County (townships)" gives the bare name plus "townships".
//   3. A parenthetical that is a state abbreviation SETS THE STATE, because the label is stating
//      it: Lawrence County is in Ohio even though it reaches this file through the Huntington, West
//      Virginia city record, and Boyd and Greenup are in Kentucky for the same reason. Any other
//      parenthetical is kept as the office's `scope`, which is the part of the county that office
//      actually answers for, and is rendered as such.
//   4. Records are keyed on state slug plus county slug, so the two Hamilton Counties (Ohio and
//      Indiana), the two Clark Counties (Ohio and Kentucky), the two Montgomery Counties (Ohio and
//      Texas) and the two Wayne Counties (Michigan and West Virginia) stay four pairs of distinct
//      pages rather than collapsing into four. Nothing here dedupes across states, ever.
//   5. Where two entries share a county, both offices are kept, in the order cities.ts lists them.
//      Three counties are like this: Franklin County OH (city of Columbus, then the townships),
//      Cabell County WV (city of Huntington, then outside the city limits) and New York City (City
//      Planning, then Buildings). Offices are deduplicated on URL, never on name.
//
// The result is 77 records from 80 entries. Not one of the 77 is served by two cities, which is
// worth stating because it looks like an accident and is not: the counties that appear twice in
// cities.ts appear under two DIFFERENT states, and step 4 keeps those apart on purpose.
//
// WHEN THE OFFICE URLs WERE VERIFIED. cities.ts records one verification date, at line 485: the
// eight depot metros' research is dated 2026-07-31 and their zoning entries came from it. The seven
// home region metros' zoning arrays carry NO recorded verification date in cities.ts, and this
// module does not invent one for them. Any page that wants to state a date has to state one that a
// file actually records, which today means the depot date or nothing.
//
// WHAT IS DELIBERATELY ABSENT: ZIP CODES. A per county ZIP list would be the natural thing to carry
// here and it is not carryable. cities.ts holds `primaryZips` as a flat per city array with no
// county relation, and its own comment in src/data/geoCentroids.ts describes them as service area
// ZIPs "picked to demonstrate coverage across several counties". src/data/geoCentroids.ts maps one
// centroid ZIP per metro and names that ZIP's county in a PROSE COMMENT rather than in a field. So
// the only sourceable ZIP to county facts in this repository are 15 comment lines, none of which
// says which of a metro's four to eight counties the other primaryZips sit in. Splitting a city's
// ZIPs across its counties would therefore be invention, and a wrong ZIP on a permit page sends a
// reader to the wrong county office. The field is omitted rather than guessed. If it is ever wanted,
// the honest way to get it is a sourced ZCTA to county crosswalk, not a redistribution of this data.

import { cities, type City } from './cities';

/** One office a county page names. `scope` is the part of the county it answers for, when stated. */
export interface PermitOffice {
  name: string;
  url: string;
  /**
   * From the county label's parenthetical, and ONLY when that parenthetical is a scope: the part of
   * the jurisdiction this office answers for, like "townships" or "outside city limits".
   *
   * A parenthetical that instead makes a claim about rules is dropped rather than rendered, because
   * an office-card label is an atomic surface with no room for a caveat and this site does not
   * publish a requirement outcome for a named place. The one case in the data today is the City of
   * Houston label, whose parenthetical describes Houston's development-rule regime; cities.ts keeps
   * it (an owner has adjudicated it there, in the HS_003 allowlist) and this module does not carry
   * it onto a page that names Houston in a heading. See SCOPE_CLAIM below.
   */
  scope?: string;
}

/** The city page or pages that serve a county, carried so the county page can link back. */
export interface PermitCountyCity {
  slug: string;
  city: string;
  state: string;
  stateSlug: string;
  /** Ready to render path of that city page. */
  path: string;
}

export interface PermitCounty {
  /** Bare jurisdiction name, e.g. "Hamilton County", "City of Norfolk", "New York City". */
  name: string;
  state: string;
  stateSlug: string;
  /** Kebab-case final URL segment, e.g. "hamilton-county". */
  slug: string;
  /** Ready to render path, e.g. "/permits/ohio/hamilton-county/". */
  path: string;
  /**
   * How the place is named in a heading. "Hamilton County, Ohio", but "New York City" and "City of
   * Virginia Beach" alone, because a name that already contains its state does not need it twice.
   */
  headingPlace: string;
  /**
   * Whether this record is a county or a municipality. Virginia's seven independent cities, New
   * York City and the City of Houston are municipalities: they sit in no county this site names, so
   * copy that tells a reader to "search the county site" is wrong on those nine pages and right on
   * the other 68. Derived from the name rather than declared, because every county in the data
   * carries the word County and no municipality does.
   */
  kind: 'county' | 'municipality';
  /** The word to use for this jurisdiction's own website: "county" or "city". */
  siteNoun: 'county' | 'city';
  /** One or more offices, in the order cities.ts lists them. Never empty. */
  offices: PermitOffice[];
  /** A scope shared by every office, hoisted so it is stated once. */
  scopeNote?: string;
  /** The serving city page or pages. Never empty. */
  cities: PermitCountyCity[];
}

/**
 * A parenthetical containing one of these words is a statement about rules, not a scope label, and
 * is dropped from the rendered office scope. Kept deliberately broad: the cost of dropping a true
 * scope label is a slightly thinner label, and the cost of rendering a rules claim beside a place
 * name is a PROJECT_HS_003 violation on a page that names the place in its H1.
 */
const SCOPE_CLAIM = /zoning|permit|ordinance|code|rule|requirement|administer|law|exempt/i;

/**
 * Parenthetical to state, for the three entries that reach this module through a city in a
 * different state. Postal abbreviations only, and only the states this site's footprint touches.
 * This is the one hardcoded table in the file and it maps an abbreviation to a name, not a county
 * to a state: it decides nothing about any jurisdiction that cities.ts has not already labelled.
 */
const STATE_BY_ABBR: Record<string, { state: string; stateSlug: string }> = {
  OH: { state: 'Ohio', stateSlug: 'ohio' },
  IN: { state: 'Indiana', stateSlug: 'indiana' },
  KY: { state: 'Kentucky', stateSlug: 'kentucky' },
  WV: { state: 'West Virginia', stateSlug: 'west-virginia' },
  MI: { state: 'Michigan', stateSlug: 'michigan' },
  GA: { state: 'Georgia', stateSlug: 'georgia' },
  TX: { state: 'Texas', stateSlug: 'texas' },
  VA: { state: 'Virginia', stateSlug: 'virginia' },
  SC: { state: 'South Carolina', stateSlug: 'south-carolina' },
  NY: { state: 'New York', stateSlug: 'new-york' },
  MO: { state: 'Missouri', stateSlug: 'missouri' },
  KS: { state: 'Kansas', stateSlug: 'kansas' },
};

/** URL segment from a display name. Ampersands become "and" so a slug never loses a word. */
export function countySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function cityRef(c: City): PermitCountyCity {
  return {
    slug: c.slug,
    city: c.city,
    state: c.state,
    stateSlug: c.stateSlug,
    path: `/locations/${c.stateSlug}/${c.slug}/`,
  };
}

function derive(source: City[]): PermitCounty[] {
  const byKey = new Map<string, PermitCounty>();

  for (const c of source) {
    for (const z of c.zoning) {
      const parts = z.county.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
      const name = (parts ? (parts[1] ?? '') : z.county).trim();
      const paren = parts ? (parts[2] ?? '').trim() : '';
      const abbr = STATE_BY_ABBR[paren.toUpperCase()];
      const state = abbr ? abbr.state : c.state;
      const stateSlug = abbr ? abbr.stateSlug : c.stateSlug;
      const slug = countySlug(name);
      const key = `${stateSlug}/${slug}`;

      const isCounty = /\bCounty\b/.test(name);

      let rec = byKey.get(key);
      if (!rec) {
        rec = {
          name,
          state,
          stateSlug,
          slug,
          path: `/permits/${stateSlug}/${slug}/`,
          headingPlace: name.includes(state) ? name : `${name}, ${state}`,
          kind: isCounty ? 'county' : 'municipality',
          siteNoun: isCounty ? 'county' : 'city',
          offices: [],
          cities: [],
        };
        byKey.set(key, rec);
      }

      const scope = paren && !abbr && !SCOPE_CLAIM.test(paren) ? paren : '';
      if (!rec.offices.some((o) => o.url === z.url)) {
        rec.offices.push({ name: z.office, url: z.url, ...(scope ? { scope } : {}) });
      }
      if (!rec.cities.some((x) => x.slug === c.slug)) rec.cities.push(cityRef(c));
    }
  }

  for (const rec of byKey.values()) {
    // A scope every office shares is a fact about the county, not about one office, so it is stated
    // once above the list instead of repeated on each row. New York City is the only one today.
    const scopes = rec.offices.map((o) => o.scope);
    if (rec.offices.length > 1 && scopes.every((s) => s && s === scopes[0])) {
      rec.scopeNote = scopes[0];
      for (const o of rec.offices) delete o.scope;
    }
  }

  return [...byKey.values()].sort(
    (a, b) => a.stateSlug.localeCompare(b.stateSlug) || a.slug.localeCompare(b.slug),
  );
}

/** Every jurisdiction with a permit page, sorted by state slug then county slug. */
export const permitCounties: PermitCounty[] = derive(cities);

/** Derived, so the count cannot disagree with the list. 77 as of 2026-09-10. */
export const permitCountyCount = permitCounties.length;

export interface PermitState {
  state: string;
  stateSlug: string;
  /** Ready to render path, e.g. "/permits/ohio/". */
  path: string;
  counties: PermitCounty[];
  /**
   * True when every entry in this state is a municipality rather than a county, which is Virginia
   * and only Virginia today: its seven Hampton Roads entries are independent cities and sit in no
   * county at all. A title reading "by County in Virginia" over a list of seven cities is simply
   * wrong, so the index reads the noun off this flag instead of assuming one.
   */
  allMunicipal: boolean;
  /** The word for what this index lists: "County" or "City". */
  jurisdictionNoun: 'County' | 'City';
}

/** The state indexes, in the order the state slugs sort. */
export const permitStates: PermitState[] = [
  ...permitCounties
    .reduce((acc, county) => {
      const existing = acc.get(county.stateSlug);
      if (existing) existing.counties.push(county);
      else
        acc.set(county.stateSlug, {
          state: county.state,
          stateSlug: county.stateSlug,
          path: `/permits/${county.stateSlug}/`,
          counties: [county],
          // Filled below, once every county in the state has been collected: the flag is a fact
          // about the whole group and cannot be decided from its first member.
          allMunicipal: false,
          jurisdictionNoun: 'County',
        });
      return acc;
    }, new Map<string, PermitState>())
    .values(),
]
  .map((entry) => {
    const allMunicipal = entry.counties.every((c) => c.kind === 'municipality');
    return { ...entry, allMunicipal, jurisdictionNoun: allMunicipal ? ('City' as const) : ('County' as const) };
  })
  .sort((a, b) => a.stateSlug.localeCompare(b.stateSlug));

/** "{stateSlug}/{countySlug}" to record, for the route and for the tests. */
export const permitCountyByKey: Record<string, PermitCounty> = Object.fromEntries(
  permitCounties.map((c) => [`${c.stateSlug}/${c.slug}`, c]),
);

/**
 * The counties a given city page serves, for the contextual link block that city template renders.
 * Derived from the same records, so a city page and a county page can never disagree about which
 * counties belong to which metro.
 */
export function countiesForCity(citySlug: string): PermitCounty[] {
  return permitCounties.filter((c) => c.cities.some((x) => x.slug === citySlug));
}

/**
 * THE DISCLAIMER, copied word for word from src/pages/permits/index.astro so that every county page
 * says exactly what the hub says. It is held here rather than re-typed per page, and
 * src/lib/compliance/permit-county-guard.test.ts asserts these sentences are still present in that
 * hub page, so the two surfaces cannot drift apart in either direction.
 */
export const PERMIT_DISCLAIMER = {
  lede:
    "It depends on where you are and how you'll use the container. Permit and zoning rules vary by county, municipality, and intended use, and it's the buyer's responsibility to confirm them with the local authority before purchasing. We do not determine, advise on, or guarantee permit requirements.",
  responsibility: [
    'Confirm requirements with your county or municipal zoning/building department.',
    'Do this before you purchase; rules and enforcement vary widely.',
    'We do not determine, advise on, or guarantee permit outcomes.',
  ],
} as const;

/**
 * THE MUNICIPAL CARVE-OUT, and the review finding that put it here. The first draft of the county
 * template told every reader that "the office below is the one that decides what applies to a
 * container there". That is an exclusive jurisdictional determination, it is the shape HS_003
 * forbids, and it was demonstrably FALSE on a large share of these pages:
 *
 *   - 26 of the 80 offices in cities.ts are Planning Commissions, which are advisory bodies. The
 *     Hamilton County Regional Planning Commission does not decide for the City of Cincinnati, and
 *     Cincinnati is the only city that page links to.
 *   - Seven offices carry a label in cities.ts that contradicts the claim two lines below it on the
 *     same page: Nassau and Westchester say zoning is administered by their towns and villages,
 *     Wayne County MI says "Detroit proper; suburbs zone locally", Oakland and Macomb say zoning is
 *     by each city or township, and Union OH and Lawrence OH say township zoning inspectors
 *     administer it in unincorporated areas.
 *   - Nine records are municipalities that sit in no county this site names at all.
 *
 * So the page now says where to START and hands the reader the question of which level answers,
 * which is both true everywhere and the only thing this site is in a position to say. One sentence,
 * rendered on all 77 pages, shared with the guard that asserts it is still there.
 */
export const MUNICIPAL_CARVE_OUT =
  'If your parcel is inside a city, town, township, or village, that municipality may be the one that answers, so ask which.';

/**
 * WHAT TO ASK, and why every one of these is written as a question rather than as an answer.
 *
 * This site publishes who to ask and what to ask them. It does not publish what the answer is, for
 * any jurisdiction, in either direction, and PROJECT_HS_003 in UDO Project/HARD_STOPS.md is the rule
 * that says so. Each item below is therefore an instruction to the reader to put a question to an
 * office, and each one names the office side of the exchange rather than predicting its reply.
 *
 * TWO WORDINGS ARE DELIBERATELY AVOIDED HERE, and a later editor should not restore them. The
 * question about how a county categorises a container is NOT phrased with the words the building
 * classification vocabulary uses ("accessory structure", "permanent structure", "temporary
 * structure", "classified as"), because those phrases are banned outright by HS_003 class 2,
 * hedged or not, and because a page that names the category is one edit away from asserting that
 * the reader's container is in it. Asking which category the county's own code uses gets the reader
 * the same answer from the only party who can give it. Likewise nothing here states a duration, a
 * distance or a fee, because those are the reply, not the question.
 */
export interface PermitQuestion {
  /** Short checklist label. Kept free of any word that could read as a determination. */
  label: string;
  /** The question, in the form to put it to the office. */
  ask: string;
}

export const ASK_CHECKLIST: readonly PermitQuestion[] = [
  {
    label: 'Intended use',
    ask: 'Ask what changes for plain storage versus a workshop, an office, or anything anybody sleeps in, and tell them which one you have in mind.',
  },
  {
    label: 'Duration on site',
    ask: 'Ask whether the answer changes with how long the container sits there, and say whether it is for a season or for good.',
  },
  {
    label: 'Setbacks and placement',
    ask: 'Ask how they measure setbacks on a parcel like yours, and from which line: the road, the rear, the side, or an easement.',
  },
  {
    label: 'Their own categories',
    ask: 'Ask which category their code puts a container in, and what that category asks of the owner, rather than assuming it matches a neighboring county.',
  },
  {
    label: 'Ground and tie-down',
    ask: 'Ask whether they want it set on blocks, on gravel, on a pad, or tied down, and who has to sign that off.',
  },
  {
    label: 'HOA and deed restrictions',
    ask: 'Ask your HOA or read your deed restrictions separately, because a subdivision can carry its own rules on top of whatever the county tells you.',
  },
  {
    label: 'Applications, fees, timing',
    ask: 'Ask which applications they take for this, what each one costs, how long each takes, and what they want submitted with it.',
  },
  {
    label: 'In writing',
    ask: 'Ask for the answer in writing, with the name of the person who gave it, before you buy anything.',
  },
] as const;

/**
 * The delivery access wording, copied from src/pages/delivery/index.astro. Locked copy: it is the
 * approved statement of what the truck needs and it is not to be paraphrased per page. The guard
 * asserts these two strings still appear in that page, so a change there fails the suite here
 * rather than silently leaving two versions of the same promise on the site.
 */
export const DELIVERY_ACCESS = {
  clearance:
    'A loaded container delivery rig is roughly a sixty-five foot truck combination. For a tilt-bed delivery it needs at least 100 feet of straight approach, 12 feet of width clearance at the narrowest point of the route, and 14 feet of overhead clearance for branches and wires. The ground along the route and at the drop point has to support a 30,000 lb truck. When a site cannot provide that, a crane-set delivery places the container instead.',
  timing:
    'Almost all deliveries take about two weeks, and we will give you an honest window before you commit.',
} as const;
