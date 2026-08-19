/**
 * The city page price guard.
 *
 * This is a NEW file rather than an edit, and the reason matters. The rule everyone stated, no dollar
 * signs under src/pages/locations, has never existed in code. The only enforcing assertion in the
 * repository is in src/data/cities.test.ts, and it scans JSON.stringify of each city object. It never
 * opens the template. So the city page template has been free to render a dollar figure for months
 * with nothing failing, and the hard stop was held by convention and by manual greps of dist.
 *
 * The decision of 2026-08-17 lifted the prohibition on the page and replaced it with a provenance and
 * freshness rule, which is stricter in every respect except the one the owner lifted:
 *
 *   A price on a city page MUST derive from the daily feed, MUST be scoped to a named ZIP, MUST carry
 *   the effective date, and MUST carry the disclaimer. A hardcoded or hand-typed dollar amount on a
 *   city page remains forbidden.
 *
 * See UDO Project/.project-catalog/decisions/2026-08-17-city-page-pricing-override.md.
 *
 * HOW THIS FILE ARMS ITSELF, and why nothing here is skipped. The provenance rule is conditional by
 * nature: it constrains a price if one is rendered, and no decision requires a city page to carry a
 * price at all. So the prohibition assertions run always, and the provenance assertions run whenever
 * the template renders a figure. The link between the two is the arming assertion: the moment the feed
 * prices a metro whose publish flag is on, the template is REQUIRED to render the block, so the
 * provenance assertions cannot stay dormant once there is anything to be dormant about. That is why
 * this file is green before the template exists without being decoration, and it is why it needs no
 * describe.skip and no TODO that somebody has to remember to unskip.
 *
 * WHY IT SHIPS BEFORE THE FIRST NUMBER. A module mapping a metro to a dollar figure, sitting in
 * src/data beside the city template, puts the old hazard one import away. Before this work, adding a
 * price to a city page meant typing a number, which is a conspicuous act. Afterwards it means an
 * import and an interpolation, which looks like ordinary work and reviews as ordinary work.
 *
 * ARMING VERIFIED, 2026-08-18. Task 5 landed the price block and nothing here needed unskipping,
 * because the arming design made a skip unnecessary. The armed path was exercised rather than
 * reasoned about: the generated module was populated with all fifteen metros in a scratch copy, the
 * suite was rerun, and this file stayed green with armed true. Hiding the section marker under that
 * same populated feed turned four assertions red, one of them inside the armed branch, which is the
 * proof that none of them is dormant decoration. The module was then restored byte identical,
 * verified by sha256. The first live population belongs to Task 6.
 *
 * NOT ASSERTED HERE, deliberately: the two dash characters in the city template. The template already
 * carries pre-existing ones on untouched lines and removing them is T-112, deferred by owner ruling.
 * The dash assertions below cover the modules this work creates and this guard itself.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { buildPageSchema } from '../schema/buildPageSchema';
import { cities } from '../../data/cities';
import { geoPricing } from '../../data/geoPricing';
import { publishingCentroids } from '../../data/geoCentroids';

const REPO_ROOT = import.meta.dirname
  ? join(import.meta.dirname, '..', '..', '..')
  : process.cwd();
const LOCATIONS = join(REPO_ROOT, 'src/pages/locations');
const CITY_TEMPLATE = join(LOCATIONS, '[state]', '[citySlug].astro');
const HUB = join(LOCATIONS, 'index.astro');
const SCHEMA_LIB = join(REPO_ROOT, 'src/lib/schema/buildPageSchema.ts');
const GEO_PRICING = join(REPO_ROOT, 'src/data/geoPricing.ts');
const GEO_CENTROIDS = join(REPO_ROOT, 'src/data/geoCentroids.ts');
const CENTROID_TEST = join(REPO_ROOT, 'src/data/geoCentroids.test.ts');
const SELF = join(REPO_ROOT, 'src/lib/compliance/city-pricing-guard.test.ts');

// HS-OUT-001. Both code points as escapes, never as the literal characters, so this file cannot
// contain the thing it forbids. A combined BRE grep false-passes on BSD grep, so the shell check is
// run once per character too.
const DASHES = /[\u2014\u2013]/;
const SUPPLIER = /freedom\s*conex/i;
const DOLLAR_FIGURE = /\$\s*[0-9][0-9,.]*/g;

// T-139. The locations hub ships one stylistic zero dollar tile, a no-broker-markup claim rather than
// a price, at src/pages/locations/index.astro. It is allowlisted by VALUE and not by count, so fixing
// T-139 leaves this green, while any real figure appearing there fails. Nothing else under
// src/pages/locations may carry a dollar literal at all.
const HUB_ALLOWED_LITERALS = new Set(['$0']);

const PRICE_SECTION_MARKER = 'class="local-price"';
const BRIDGE_MARKER = 'class="local-bridge"';
const GEO_IMPORT = /from '(?:\.\.\/)+data\/geoPricing'/;
const CENTROID_IMPORT = /from '(?:\.\.\/)+data\/geoCentroids'/;
const PRICING_IMPORT = /from '(?:\.\.\/)+data\/pricing'/;

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (entry.endsWith('.astro')) acc.push(p);
  }
  return acc;
}

const rel = (p: string): string => relative(REPO_ROOT, p).split(sep).join('/');
const locationFiles = walk(LOCATIONS);
const citySrc = readFileSync(CITY_TEMPLATE, 'utf8');
const cityFrontmatter = citySrc.slice(0, citySrc.indexOf('\n---', 4));
const schemaSrc = readFileSync(SCHEMA_LIB, 'utf8');

/** The city branch of the schema builder, sliced out so the product branch does not answer for it. */
const cityBranch = (() => {
  const start = schemaSrc.indexOf("case 'city': {");
  if (start < 0) return '';
  const end = schemaSrc.indexOf("case '", start + 14);
  return schemaSrc.slice(start, end > start ? end : undefined);
})();

const sectionStart = citySrc.indexOf(PRICE_SECTION_MARKER);
const priceSection = (() => {
  if (sectionStart < 0) return '';
  const open = citySrc.lastIndexOf('<', sectionStart);
  const close = citySrc.indexOf('</section>', sectionStart);
  return citySrc.slice(open, close > 0 ? close + 10 : undefined);
})();

/**
 * Visible literal text: what a reader sees and an author typed, with every expression removed first.
 *
 * The removal is in three passes rather than a brace-depth scan, and the reason is a trap. A depth
 * scan drops everything inside a map callback, including the JSX the callback returns, so the copy
 * that repeats per SKU becomes invisible and a typed digit inside it goes unnoticed. So pass one
 * removes leaf expressions, meaning balanced braces with no tag inside, repeatedly for nesting. Pass
 * two removes the code that wraps a JSX-bearing expression, both the fragment from its brace up to
 * the tag it opens and the fragment from a closing tag to the brace that closes it. Pass three drops
 * the tags. What survives is copy, and any digit in it was typed by a person.
 */
function visibleText(html: string): string {
  let s = html;
  for (let i = 0; i < 8; i += 1) {
    const next = s.replace(/\{[^{}<]*\}/g, ' ');
    if (next === s) break;
    s = next;
  }
  s = s.replace(/\{[^<{}]*(?=<)/g, ' ').replace(/(?<=>)[^<>{}]*\}/g, ' ');
  return s.replace(/<[^>]*>/g, ' ').replace(/[{}]/g, ' ');
}

const visiblePrice = visibleText(priceSection);

/** True when the template pulls figures from the pricing modules or already ships the block. */
const rendersPrice =
  GEO_IMPORT.test(cityFrontmatter) || PRICING_IMPORT.test(cityFrontmatter) || priceSection !== '';

const pricedPublishing = publishingCentroids.filter((m) => m.slug in geoPricing);
/** The feed prices at least one metro whose publish flag is on, so a price block is now required. */
const armed = pricedPublishing.length > 0;

function typeCount(node: unknown, type: string): number {
  if (Array.isArray(node)) return node.reduce<number>((n, v) => n + typeCount(v, type), 0);
  if (node && typeof node === 'object') {
    const obj = node as Record<string, unknown>;
    const here = obj['@type'] === type ? 1 : 0;
    return Object.values(obj).reduce<number>((n, v) => n + typeCount(v, type), here);
  }
  return 0;
}

function keySet(node: unknown, acc: Set<string> = new Set()): Set<string> {
  if (Array.isArray(node)) node.forEach((v) => keySet(v, acc));
  else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      acc.add(k);
      keySet(v, acc);
    }
  }
  return acc;
}

const sampleCity = cities.find((c) => c.region === 'home') ?? cities[0];
const graphArgs = {
  url: `https://steelboxdirect.com/locations/${sampleCity.stateSlug}/${sampleCity.slug}/`,
  title: `Shipping Containers in ${sampleCity.city}`,
  description: 'City page under test.',
  breadcrumbs: [{ name: 'Home', path: '/' }, { name: sampleCity.city }],
};
// If a later task widens the city branch args, this call is where it shows up, and the failure
// message is the instruction: extend the args here rather than deleting the assertion.
const cityGraph = buildPageSchema({
  ...graphArgs,
  page: { kind: 'city', city: sampleCity, faqs: [{ q: 'Question?', a: 'Answer.' }] },
}).graph;
const baselineGraph = buildPageSchema({ ...graphArgs, page: { kind: 'excluded' } }).graph;

describe('city page pricing: the prohibition that survives', () => {
  it('scans the city template and every other page under src/pages/locations', () => {
    expect(existsSync(CITY_TEMPLATE)).toBe(true);
    expect(locationFiles.map(rel)).toContain('src/pages/locations/[state]/[citySlug].astro');
    expect(locationFiles.length).toBeGreaterThanOrEqual(2);
  });

  it('holds no hand-typed dollar figure on any page under src/pages/locations', () => {
    for (const file of locationFiles) {
      const allowed = file === HUB ? HUB_ALLOWED_LITERALS : new Set<string>();
      for (const found of readFileSync(file, 'utf8').match(DOLLAR_FIGURE) ?? []) {
        expect(
          allowed,
          `${rel(file)} carries the dollar literal ${found}: a figure on a city page must be interpolated from the feed`,
        ).toContain(found);
      }
    }
  });

  it('never uses the rejected best-price framing, and never states a saving', () => {
    for (const file of locationFiles) {
      const src = readFileSync(file, 'utf8');
      expect(src, `${rel(file)} must not say best price`).not.toMatch(/best price/i);
      expect(src, `${rel(file)} must not state a saving: pickup is not delivery with the fee removed`).not.toMatch(
        /\bsavings?\b|\byou save\b/i,
      );
    }
  });

  it('never names the supplier or its yard, on a page or in either pricing module', () => {
    for (const file of [...locationFiles, GEO_PRICING, GEO_CENTROIDS]) {
      const src = readFileSync(file, 'utf8');
      expect(src, `${rel(file)}`).not.toMatch(SUPPLIER);
      expect(src, `${rel(file)} must not carry the yard name field`).not.toContain('pickupLocationName');
    }
  });

  it('carries no em dash and no en dash in either pricing module or in this guard (HS-OUT-001)', () => {
    for (const file of [GEO_PRICING, GEO_CENTROIDS, SELF]) {
      expect(readFileSync(file, 'utf8'), rel(file)).not.toMatch(DASHES);
    }
  });
});

describe('city page pricing: no Offer, on the page or in the graph', () => {
  it('keeps every offer and product token out of the city template', () => {
    expect(citySrc).not.toMatch(/priceCurrency|itemCondition|priceValidUntil/);
    expect(citySrc).not.toMatch(/['"]Offer['"]|['"]Product['"]/);
    expect(citySrc).not.toMatch(/kind: 'product'/);
  });

  it('keeps the city branch of the schema builder free of price nodes', () => {
    expect(cityBranch.length).toBeGreaterThan(200);
    expect(cityBranch).not.toMatch(/Offer|priceCurrency|priceSpecification|'Product'/);
  });

  it('adds no Offer and no Product to the built city graph, and no price key anywhere in it', () => {
    // The site-wide Organization and LocalBusiness nodes carry a priceless makesOffer node on every
    // page, so the test is that the city branch adds none of its own, not that the graph has none.
    expect(typeCount(cityGraph, 'Offer')).toBe(typeCount(baselineGraph, 'Offer'));
    expect(typeCount(cityGraph, 'Product')).toBe(0);
    const keys = keySet(cityGraph);
    for (const forbidden of [
      'price',
      'offers',
      'priceCurrency',
      'priceSpecification',
      'priceValidUntil',
      'lowPrice',
      'highPrice',
    ]) {
      expect(keys, `the city graph must not carry ${forbidden}`).not.toContain(forbidden);
    }
  });
});

describe('city page pricing: the provenance rule', () => {
  it('requires the price block as soon as the feed prices a publishing metro', () => {
    if (armed) {
      expect(
        rendersPrice,
        'the feed now prices a metro whose publish flag is on, so the city template must render the price block',
      ).toBe(true);
      expect(priceSection).not.toBe('');
    } else {
      // Pre-harvest state, recorded rather than skipped. One of the two legitimate reasons must hold:
      // no metro is priced yet, or no metro publishes.
      expect(Object.keys(geoPricing).length === 0 || publishingCentroids.length === 0).toBe(true);
    }
  });

  it('traces every rendered figure to the pricing modules, with nothing typed into the block', () => {
    if (!rendersPrice) {
      expect(priceSection).toBe('');
      return;
    }
    expect(cityFrontmatter).toMatch(GEO_IMPORT);
    expect(cityFrontmatter).toMatch(CENTROID_IMPORT);
    expect(cityFrontmatter).toMatch(PRICING_IMPORT);
    expect(cityFrontmatter).toContain('formatPrice');
    // Every number in the block arrives interpolated. A digit in the literal text is a typed number,
    // whether or not somebody put a dollar sign in front of it.
    expect(visiblePrice, 'the price block must contain no typed digits').not.toMatch(/[0-9]/);
  });

  it('scopes the figure to a named ZIP in the same block', () => {
    if (!rendersPrice) {
      expect(priceSection).toBe('');
      return;
    }
    expect(priceSection).toMatch(/zip/i);
    expect(priceSection).toContain('delivered to');
  });

  it('states the effective date in the same block, and never the verification date', () => {
    if (!rendersPrice) {
      expect(priceSection).toBe('');
      return;
    }
    expect(priceSection).toMatch(/effectiveSince/);
    expect(priceSection).not.toContain('lastVerified');
    expect(priceSection).toContain('in effect since');
  });

  it('puts the all-in claim and the hedge inside the same block as the figure', () => {
    if (!rendersPrice) {
      expect(priceSection).toBe('');
      return;
    }
    // Asserted against the raw block rather than the extracted copy, so that splitting a sentence
    // across an element or an emphasis tag does not read as a missing sentence.
    expect(priceSection).toContain('nothing added later');
    expect(priceSection).toContain('Your ZIP will be different');
  });

  it('makes no delivery-time claim in the price block', () => {
    if (!rendersPrice) {
      expect(priceSection).toBe('');
      return;
    }
    expect(visiblePrice).not.toMatch(/\b(?:same|next)[- ]day\b/i);
    expect(visiblePrice).not.toMatch(/\b(?:in|within) (?:a|one|two|three|[0-9]+) (?:day|days|week|weeks)\b/i);
  });

  it('flips the QuickFacts disclaimer on for publishing metros', () => {
    expect(cityBranch).toContain('showPriceDisclaimer');
    if (!armed) return;
    expect(
      cityBranch,
      'a published figure needs its disclaimer, so the city branch may no longer hardcode the flag off',
    ).not.toContain('showPriceDisclaimer: false');
  });
});

describe('city page pricing: publish gating and placement', () => {
  it('leaves WHICH metros publish to the centroid guard, and fails if that guard disappears', () => {
    // Deliberately not duplicated here. The publish set was ruled on 2026-08-18 as all fifteen,
    // superseding the earlier home-region-only draft, and it is pinned slug by slug in the centroid
    // guard so that both directions of drift stay red: a metro switched off, and a sixteenth metro
    // arriving already switched on. A second copy of the list in this file would go stale against
    // that ruling, which is exactly how the superseded assumption got written down twice. What this
    // guard owns is the page side: a figure renders only through the flag, which is the assertion
    // below.
    expect(publishingCentroids.length).toBeGreaterThan(0);
    expect(existsSync(CENTROID_TEST), 'the publish set has no guard left').toBe(true);
    const centroidTest = readFileSync(CENTROID_TEST, 'utf8');
    expect(centroidTest).toMatch(/publishingCentroids/);
    expect(
      centroidTest,
      'the centroid guard no longer pins an expected publish set, so nothing checks which metros publish',
    ).toMatch(/EXPECTED_PUBLISH/);
  });

  it('gates the price block on the publish flag rather than on region or on data presence', () => {
    if (!rendersPrice) {
      expect(priceSection).toBe('');
      return;
    }
    // Two halves, because the flag is usually resolved in frontmatter and applied in the body: the
    // template has to read the publish flag at all, and the block has to render conditionally rather
    // than unconditionally. Neither half is sufficient alone.
    expect(cityFrontmatter, 'the template must read the centroid publish flag').toMatch(/publish/);
    const lead = citySrc.slice(Math.max(0, sectionStart - 400), sectionStart);
    expect(lead, 'the price block must render inside a conditional, not unconditionally').toMatch(
      /&&|\?/,
    );
  });

  it('keeps the price above the depot bridge if a metro ever renders both', () => {
    if (!rendersPrice) {
      expect(priceSection).toBe('');
      return;
    }
    const bridge = citySrc.indexOf(BRIDGE_MARKER);
    if (bridge < 0) return;
    expect(sectionStart).toBeLessThan(bridge);
  });
});
