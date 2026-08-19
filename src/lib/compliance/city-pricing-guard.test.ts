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

const CALLOUT_MARKER = 'class="zip-callout"';

/**
 * THE ONE ALLOWLISTED NUMBER, added 2026-08-19 with the ZIP callout.
 *
 * The callout prints the phone number as literal text, because a number a reader has to click in
 * order to discover is not a visible number. That puts typed digits inside the scanned block for the
 * first time. The digit rule is NOT relaxed to accommodate them: it is given one exemption by VALUE,
 * this exact string and nothing else, so every other digit in the block still fails.
 *
 * The number is deliberately not interpolated from a constant. An interpolated one would vanish from
 * the digit scan, and vanishing from the digit scan is the precise hazard this file was written
 * about: a figure that arrives through an import reviews as ordinary work. A literal plus a named
 * exemption is the version a reviewer can see. The assertions below also fail if the literal stops
 * appearing, so the exemption cannot outlive the thing it was granted for.
 */
const PHONE_DISPLAY = '(513) 546-2543';
const PHONE_TEL = '+15135462543';

/**
 * Every other place on the site that prints or publishes the number. There is no shared constant for
 * it and this guard does not create one, because a constant belongs in src/data or src/lib and both
 * are outside the two files this work may touch. Pinning the invariant here is the honest substitute:
 * a fifth divergent copy of the business number fails the suite, which is the failure a constant
 * would have prevented.
 */
const PHONE_PRINTERS = [
  'src/components/SiteNav.astro',
  'src/components/SiteFooter.astro',
  'src/components/QuickFacts.astro',
  'src/lib/schema/entities.ts',
];

/** Colour tokens the callout may name. Cream and white are absent on purpose, see the ratios below. */
const CALLOUT_COLOUR_TOKENS = new Set(['--ink', '--yellow', '--c5-permits']);
const COLOUR_DECL = /(?:^|;)\s*(color|background|background-color|border|border-top|border-bottom|border-color|outline|outline-color|box-shadow|stroke|fill)\s*:\s*([^;]*)/g;
const OPACITY_DECL = /(?:^|;)\s*opacity\s*:/;
const LOW_CONTRAST_COLOURS = /--cream|#F6F1E7|#fff\b|#ffffff\b|(?:^|[\s:,(])white(?:$|[\s;,)])/i;

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

/**
 * The same copy with the one allowlisted number removed, and the only string the digit rule is
 * asserted against. Splitting on the literal rather than on a digit pattern is what keeps the
 * exemption narrow: a mistyped number, a second number, or a price typed anywhere in the block all
 * leave digits behind and all fail.
 */
const visiblePriceSansPhone = visiblePrice.split(PHONE_DISPLAY).join(' ');

/** The callout, sliced out of the price block so its copy and its dashes answer for themselves. */
const calloutStart = priceSection.indexOf(CALLOUT_MARKER);
const calloutBlock =
  calloutStart < 0 ? '' : priceSection.slice(priceSection.lastIndexOf('<', calloutStart));

/**
 * The scoped stylesheet, comments stripped first so that prose about a selector cannot be mistaken
 * for the selector, then split into flat rules. Rules nested in a media query flatten into the same
 * list, which is what is wanted here: a mobile override that reintroduces a failing pairing has to
 * fail too.
 */
const calloutRules = [
  ...citySrc
    .slice(citySrc.indexOf('<style>'))
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .matchAll(/([^{}]+)\{([^{}]*)\}/g),
]
  .map((m) => ({ selector: m[1].trim().replace(/\s+/g, ' '), body: m[2] }))
  .filter((r) => r.selector.includes('callout'));

function colourValues(body: string): string[] {
  return [...body.matchAll(COLOUR_DECL)].map((m) => m[2]);
}

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
    expect(
      visiblePriceSansPhone,
      `the price block may contain no typed digit other than the allowlisted number ${PHONE_DISPLAY}`,
    ).not.toMatch(/[0-9]/);
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

/**
 * THE ZIP CALLOUT, added 2026-08-19.
 *
 * What it is for. The block above states a figure scoped to one ZIP, and the next thought a reader
 * has is that they do not live in that ZIP. The callout answers that thought where it forms, in the
 * words the reader would use, with the number to dial in plain sight. What follows pins the four
 * things that make it work and would not survive a careless edit: the question, the visible number,
 * the dial target that agrees with it, and the fact that none of it is cream on orange.
 *
 * MEASURED CONTRAST, every text pairing in the band, composited, sRGB, WCAG 2.1:
 *   ink #0B0F1A on signal orange #FF5A1F ... 6.14 to 1 ... the question
 *   yellow #FFD300 on ink #0B0F1A ....... 13.28 to 1 ... the ZIP chip, the button at rest
 *   ink #0B0F1A on yellow #FFD300 ....... 13.28 to 1 ... the button on hover
 *   ink #0B0F1A on signal orange ........ 6.14 to 1 .... the focus ring, non text, needs three
 * And the pairing that is barred rather than used:
 *   cream #F6F1E7 on signal orange ...... 2.77 to 1 .... FAILS AA, forbidden by the rule below
 * No rule in the band sets an opacity, which is the second half of the same rule: an opacity on a
 * saturated ground is how the failures fixed on the fifteenth were written, and a static token check
 * cannot see through one, so the composite is kept trivial by forbidding it outright.
 */
describe('city page pricing: the call to action beside the figure', () => {
  it('ships the callout inside the price block, and nowhere else on the page', () => {
    if (!rendersPrice) {
      expect(priceSection).toBe('');
      return;
    }
    expect(priceSection, 'the callout must sit in the same section as the figure it answers').toContain(
      CALLOUT_MARKER,
    );
    // One copy only, and it is the copy inside the gated section, so the callout inherits the publish
    // gate rather than carrying a second condition that could drift out of step with the first.
    expect(citySrc.split(CALLOUT_MARKER).length - 1, 'exactly one callout, and it is the gated one').toBe(1);
    expect(calloutBlock.length).toBeGreaterThan(200);
  });

  it('asks the reader the question in the reader own terms, with the ZIP interpolated', () => {
    if (!rendersPrice) return;
    expect(calloutBlock, 'the ZIP must come from the centroid, never typed').toContain('{priceZip}');
    expect(calloutBlock, 'the question is the whole mechanism, a statement does not replace it').toContain(
      'not your ZIP?',
    );
    // Owner ruling, 2026-08-19: the action names the address, not the number. No adjective about the
    // figure, because the address is the thing the reader came here about and the adjective is a
    // claim rather than a benefit. The phrasing also borrows the idiom of the price lines above it,
    // the price TO somewhere, rather than reusing the construction of the hedge one line up.
    expect(calloutBlock).toContain('Call for the price to your address');
  });

  it('prints the number as visible text and dials the same digits it prints', () => {
    if (!rendersPrice) return;
    // Visible, not behind a label. The literal has to survive expression stripping, which it only
    // does if a person typed it into the copy.
    expect(visiblePrice, 'the number must be readable without clicking anything').toContain(PHONE_DISPLAY);
    expect(
      visiblePrice.split(PHONE_DISPLAY).length - 1,
      'one question, one number, one action: a second visible copy of the number is a regression',
    ).toBe(1);
    // Tappable, and the dial target agrees digit for digit with what the reader was shown. A visible
    // number that dials a different one is the failure no build error catches.
    expect(calloutBlock).toContain(`href="tel:${PHONE_TEL}"`);
    expect(PHONE_TEL.replace(/\D/g, '')).toBe(`1${PHONE_DISPLAY.replace(/\D/g, '')}`);
  });

  it('keeps the number in step with every other place the site prints it', () => {
    for (const printer of PHONE_PRINTERS) {
      const src = readFileSync(join(REPO_ROOT, printer), 'utf8');
      expect(src, `${printer} no longer carries ${PHONE_TEL}, so the city callout now dials a different number`).toContain(
        PHONE_TEL,
      );
    }
  });

  it('gives the tap target the full forty four pixels', () => {
    if (!rendersPrice) return;
    const rest = calloutRules.find((r) => r.selector === '.callout-act');
    expect(rest, 'the callout action rule is gone, so nothing sizes the tap target').toBeTruthy();
    const min = /min-height:\s*([0-9]+)px/.exec(rest?.body ?? '');
    expect(min, 'the callout action must declare a min-height').toBeTruthy();
    expect(Number(min?.[1]), 'a tap target under forty four pixels is not a tap target').toBeGreaterThanOrEqual(44);
    expect(calloutBlock, 'the action must be a phone link, not a form link dressed as one').toMatch(
      /<a class="callout-act"/,
    );
  });

  it('never puts a failing pairing or an opacity in the band', () => {
    expect(calloutRules.length, 'no callout rules were found, so this whole check is inert').toBeGreaterThanOrEqual(8);
    for (const rule of calloutRules) {
      expect(rule.body, `${rule.selector} must not fade text on a saturated ground`).not.toMatch(OPACITY_DECL);
      for (const value of colourValues(rule.body)) {
        expect(
          value,
          `${rule.selector} names a colour barred from this band: cream on signal orange is 2.77 to 1`,
        ).not.toMatch(LOW_CONTRAST_COLOURS);
        for (const [, token] of value.matchAll(/var\((--[a-z0-9-]+)\)/g)) {
          expect(
            CALLOUT_COLOUR_TOKENS,
            `${rule.selector} paints with ${token}, whose contrast against this band is unmeasured`,
          ).toContain(token);
        }
      }
    }
    const band = calloutRules.find((r) => r.selector === '.zip-callout');
    expect(band?.body).toContain('background: var(--c5-permits)');
    expect(band?.body, 'ink on signal orange is the only text pairing the band may set').toContain(
      'color: var(--ink)',
    );
  });

  it('orients on accuracy, never on freshness, and states no saving and no speed', () => {
    if (!rendersPrice) return;
    const copy = visibleText(calloutBlock);
    // THE FRESHNESS FRAMING, forbidden by owner ruling of 2026-08-19 and the one people will reach
    // for. Every word below invites the reader to call for a NEWER number, and the block directly
    // above states the date the figures have held since and is rewritten daily by the feed. A CTA
    // that offers currency contradicts the page it sits on and tells the reader the figure they just
    // read is stale. Accuracy for their own address is the framing that does not fight the page.
    expect(
      copy,
      'the callout must not offer a fresher number: the page already publishes the live one',
    ).not.toMatch(/up[- ]to[- ]date|\bcurrent\b|\bcurrently\b|\blatest\b|\bmost recent\b|\btoday|\bnewer\b|\bstale\b/i);
    // The forbidden framings, in one place. Calling gets the reader a number for their address, and
    // saying anything about that number being lower devalues the figure the page just published and
    // states a saving nobody has computed.
    expect(copy).not.toMatch(/best price|better price|lower price|cheaper|discount|deal\b/i);
    expect(copy).not.toMatch(/\bsavings?\b|\byou save\b|\bbeat\b/i);
    expect(copy).not.toMatch(/\b(?:same|next)[- ]day\b|\bright now\b|\bimmediately\b/i);
    expect(copy).not.toMatch(/\bpermit|\bzoning|\btax\b|\binsur|\bfoundation\b/i);
  });

  it('carries no em dash and no en dash of its own (HS-OUT-001)', () => {
    // The template as a whole is exempt under T-112, which covers three pre-existing dashes on lines
    // this work does not touch. The callout is new, so it answers for itself, and so does its CSS.
    expect(calloutBlock, 'the callout markup').not.toMatch(DASHES);
    for (const rule of calloutRules) {
      expect(rule.body, `${rule.selector}`).not.toMatch(DASHES);
    }
  });
});
