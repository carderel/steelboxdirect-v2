/**
 * The /cost/ page price guard.
 *
 * WHY THIS FILE EXISTS. On 2026-08-18 the sidebar of src/pages/cost/index.astro was found to be
 * carrying an inverted claim: Cincinnati pricing is 15 percent lower than coastal markets. Recomputed
 * against the live feed, Cincinnati is HIGHER than the ocean-port metros on all three sizes this site
 * sells, by a similar magnitude in the opposite direction. The figure was hand typed in May 2026, the
 * assumption behind it was disproved by the live probe recorded in src/data/geoCentroids.ts, and
 * nothing in the repository could tell, because no test opened the page. The same page also carried a
 * hand typed 900 to 1600 illustration and a hand typed 15 to 25 percent delivery share, both undated
 * and unsourced.
 *
 * So the rule this file enforces is the provenance rule from
 * UDO Project/.project-catalog/decisions/2026-08-17-city-page-pricing-override.md, applied to the one
 * page that targets cost intent: every figure interpolated from the feed, scoped to a named ZIP,
 * carrying its effective date, carrying the disclaimer, and never hand typed.
 *
 * SECOND PASS, same day. The rewritten bullet was rewritten again after the owner objected that a
 * percentage above an average of the port metros explains nothing: nobody inland can buy at the port
 * price, so the figure invites the reading that they are being overcharged and then leaves them to
 * settle it. Two published figures from the table replace it, the cheapest ocean-port metro against
 * the home metro. So the assertions below moved with the claim: instead of pinning a computed
 * direction word, they pin the RULE that selects the two anchors and the GATE that keeps the further
 * inland reading true, and they forbid any comparison against an average of metros coming back. The
 * delivery leg is deliberately not split out of the gap, because baseDeliveryCost never leaves the
 * harvest script and pickup may not be subtracted from delivered. See the page frontmatter.
 *
 * WHY SOURCE SCANNING RATHER THAN RENDER TESTING. The failure being prevented is a human typing a
 * number into a template, so the source is the surface where it happens and the source is where it has
 * to be caught. city-pricing-guard.test.ts scans templates for the same reason and is the precedent
 * this file follows, including its arming design: the prohibitions run always, and the provenance
 * assertions arm themselves the moment the feed prices a publishing metro, so nothing here needs a
 * skip that somebody has to remember to remove.
 *
 * NOT ASSERTED HERE, deliberately. The page carries four pre-existing em dashes on lines this work did
 * not touch, and removing them is T-112, deferred by owner ruling. Rather than skip the check, the
 * count is ratcheted: four may stay, a fifth fails. The same treatment is given to the three
 * pre-existing percentage claims about grade, which are not feed derived and are out of scope here,
 * and which are allowed only while they sit away from any geography claim.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { cities } from '../../data/cities';
import { geoPricing } from '../../data/geoPricing';
import { publishingCentroids } from '../../data/geoCentroids';

const REPO_ROOT = import.meta.dirname
  ? join(import.meta.dirname, '..', '..', '..')
  : process.cwd();
const COST_PAGE = join(REPO_ROOT, 'src/pages/cost/index.astro');
const SELF = join(REPO_ROOT, 'src/lib/compliance/cost-page-guard.test.ts');

// Both code points as escapes, never as the literal characters, so this file cannot contain the thing
// it forbids.
const DASHES = /[\u2014\u2013]/g;

/** Pre-existing em dash count at 2026-08-18, on lines this work did not touch. T-112 removes them. */
const PRE_EXISTING_DASHES = 4;

const source = readFileSync(COST_PAGE, 'utf8');

/**
 * The page with its line comments and its style block removed.
 *
 * Needed because this guard has to forbid the very sentence the page comments now quote as the bug
 * that was fixed, and because a CSS width of 100 percent is not a pricing claim. Scanning the raw file
 * would make the fix look like the bug and the stylesheet look like a claim.
 */
const body = source
  .replace(/<style>[\s\S]*?<\/style>/g, ' ')
  .replace(/^[ \t]*\/\/.*$/gm, ' ')
  .replace(/\/\*[\s\S]*?\*\//g, ' ');

/** Any literal dollar figure, which is the thing that may never be typed on this page. */
const DOLLAR_FIGURE = /\$\s*[0-9][0-9,.]*/g;

/** A percentage or a range of them, however written. */
const PERCENT_CLAIM = /(~?[0-9][0-9,.]*(?:\s*(?:to|-)\s*[0-9][0-9,.]*)?)\s*(?:%|percent)/g;

/**
 * The three pre-existing percentage claims, allowlisted BY VALUE rather than by count, so fixing one
 * leaves this green while a fourth appearing fails. All three are about grade and size rather than
 * geography, which is the distinction the geography assertion below enforces.
 */
const ALLOWED_PERCENT_VALUES = new Set(['~40-60', '50']);

/**
 * Words that turn a percentage into a claim about PLACE, which is the class of claim only the feed can
 * make. A percentage about grade or size is a different animal and three of those already ship here.
 */
const GEOGRAPHY_WORDS = /coastal|\bcoast\b|inland|\bports?\b|\bmetros?\b|\bmarkets?\b/i;
const METRO_NAMES = new RegExp(cities.map((c) => c.city).join('|'), 'i');

/** Prose only, so the window measures words rather than markup. */
const proseBody = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

/** Characters either side of a percentage that count as the same claim. */
const CLAIM_WINDOW = 110;

const armed = publishingCentroids.some((centroid) => geoPricing[centroid.slug] !== undefined);

describe('the /cost/ page price surface', () => {
  it('exists where this guard expects it', () => {
    expect(existsSync(COST_PAGE)).toBe(true);
  });

  it('carries no hand typed dollar figure anywhere in the page', () => {
    // Not scoped to the body: a dollar figure has no business in a comment on this page either, and
    // the 900 to 1600 illustration that was removed lived in rendered copy.
    expect(source.match(DOLLAR_FIGURE) ?? []).toEqual([]);
  });

  it('takes its figures from the generated feed and its ZIPs from the human owned centroid module', () => {
    expect(source).toMatch(/from '(?:\.\.\/)+data\/geoPricing'/);
    expect(source).toMatch(/from '(?:\.\.\/)+data\/geoCentroids'/);
    // The rows come from the publish flags, so the unattended daily job can change what a metro costs
    // but never which metros are listed.
    expect(source).toContain('publishingCentroids');
    expect(source).toContain('centroid.zip');
  });

  it('gates the table and every derived sentence on a non empty feed', () => {
    expect(source).toContain('const hasCostTable = costRows.length > 0;');
    expect(source).toContain('{hasCostTable &&');
    // An empty feed is a legitimate state, so the derived prose needs its own gates rather than
    // borrowing the table one.
    expect(source).toContain('showReferenceRange');
    expect(source).toContain('showCoastInland');
  });

  it('drops a metro the feed cannot price rather than rendering a blank row', () => {
    expect(source).toContain('if (!record || !city) return null;');
    expect(source).toContain('if (cells.every((cell) => cell.delivered === null)) return null;');
  });

  it('anchors the coast comparison on two figures picked by rule from the feed', () => {
    // Rewritten 2026-08-18 with the claim it guards. The bullet used to publish a percentage against
    // the MEAN of the port metros, and this test pinned the direction word that percentage chose. The
    // percentage is gone, so pinning it would pin nothing. What has to hold now is that BOTH anchors
    // are selected from the feed by a rule rather than named by hand: the cheapest ocean-port metro
    // and the home metro. A hand picked pair is a pair that goes stale the next time the feed moves.
    expect(source).toContain('const portAnchor: Figure | null');
    expect(source).toMatch(/portAnchor[\s\S]{0,600}f\.delivered < low\.delivered/);
    expect(source).toContain('const homeReference: Figure | null');
    // Both figures render through the feed values, never through a literal, which is also what the no
    // hand typed dollar figure assertion above enforces from the other side.
    expect(source).toContain('formatPrice(portAnchor.delivered)');
    expect(source).toContain('formatPrice(homeReference.delivered)');
    // And the metro names come off the city record, so the sentence cannot name one metro beside
    // another metro figure.
    expect(source).toContain('{portAnchor.city}');
    expect(source).toContain('{homeReference.city}');
  });

  it('renders the further inland reading only while the arithmetic agrees with it', () => {
    // The inversion that shipped in May is only impossible if the sentence cannot outlive the sign it
    // depends on. The wording no longer switches on a computed direction, so the GATE has to carry
    // that job: the bullet may render only when the home metro is above the cheapest port metro, and
    // only when the two anchors are different metros.
    expect(source).toContain('const showCoastInland =');
    expect(source).toMatch(/homeReference\.delivered > portAnchor\.delivered/);
    expect(source).toMatch(/portAnchor\.city !== homeReference\.city/);
    expect(source).toContain('{showCoastInland && portAnchor && homeReference &&');
  });

  it('draws no comparison against an average of metros', () => {
    // The unit that was removed, not just the number. An average across five metros is not something
    // a reader can buy at, so a percentage against one invites the reading that they are being
    // overcharged and then leaves them to resolve it. Two published figures replace it.
    expect(source).not.toMatch(/portMean|GapPercent/);
    expect(proseBody).not.toMatch(/average across/i);
    expect(proseBody).not.toMatch(/percent (?:higher|lower)/i);
  });

  it('names only real, priced metros in the ocean port set', () => {
    // A typo here would not throw. It would quietly drop a metro out of the average and move the
    // published percentage, which is the class of silent error this whole page rewrite is about.
    const listed = [...source.matchAll(/'([a-z-]+-shipping-containers)'/g)].map((m) => m[1]);
    expect(listed.length).toBeGreaterThan(0);
    for (const slug of listed) {
      expect(cities.some((c) => c.slug === slug)).toBe(true);
    }
  });

  it('scopes every row to a ZIP and to the date its own figures last changed', () => {
    if (!armed) return;
    expect(source).toContain('class="cost_table_zip"');
    expect(source).toContain('<time datetime={row.effectiveSince}>');
    expect(source).toContain('effectiveSinceLabel(row.effectiveSince)');
  });

  it('carries the disclaimer the pricing decision requires', () => {
    if (!armed) return;
    expect(source).toContain('Your ZIP is not one of these');
    expect(source).toMatch(/delivery distance is most of what moves the number/);
    expect(source).toMatch(/rather than as your quote/);
    expect(source).toContain('rounded to the nearest');
  });

  it('states no saving and never touches the pickup figure', () => {
    // Pickup is not the delivered figure with the delivery taken back off, and the feed returns pickup
    // unit prices that are sometimes higher. A saving computed from the pair would be fiction.
    expect(body).not.toMatch(/pickup/i);
    // The prohibition is a saving stated AGAINST a delivered figure, not the word saving, which the page
    // already uses for grade and for market timing on lines this work did not touch.
    expect(proseBody).not.toMatch(/\bsav(?:e|es|ing|ings)\b[^.]{0,70}deliver/i);
    expect(proseBody).not.toMatch(/deliver[^.]{0,70}\bsav(?:e|es|ing|ings)\b/i);
  });

  it('uses no best price phrasing', () => {
    expect(body).not.toMatch(/best price|cheapest|lowest price|beat (?:any|our|their)/i);
  });

  it('keeps every surviving percentage claim away from any geography claim', () => {
    for (const match of proseBody.matchAll(PERCENT_CLAIM)) {
      const value = (match[1] ?? '').replace(/\s+/g, '');
      expect(ALLOWED_PERCENT_VALUES.has(value), `unexpected percentage claim: ${match[0]}`).toBe(true);
      // A grade claim may stay. A geography claim may not, because geography is what the feed prices
      // and a typed number cannot track it.
      const window = proseBody.slice(
        Math.max(0, (match.index ?? 0) - CLAIM_WINDOW),
        (match.index ?? 0) + CLAIM_WINDOW,
      );
      expect(GEOGRAPHY_WORDS.test(window), `percentage near a geography claim: ${match[0]}`).toBe(false);
      expect(METRO_NAMES.test(window), `percentage near a metro name: ${match[0]}`).toBe(false);
    }
  });

  it('does not reintroduce the inverted coastal claim', () => {
    expect(body).not.toMatch(/lower than coastal/i);
    expect(body).not.toMatch(/coastal markets?/i);
  });

  it('makes dateModified track the feed rather than a frozen date', () => {
    expect(source).toContain('dateModified={pageDateModified}');
    expect(source).toContain('COPY_LAST_REVIEWED');
    expect(source).not.toMatch(/dateModified="/);
  });

  it('promises no delivery time', () => {
    expect(body).not.toMatch(/deliver\w*[^.<]{0,60}\b(?:in|within)\s+\d+\s*(?:hour|day|week)/i);
    expect(body).not.toMatch(/same.day delivery|next.day delivery/i);
  });

  it('scrolls a wide table inside its own container', () => {
    if (!armed) return;
    expect(source).toContain('class="cost-table-scroll"');
    expect(source).toMatch(/\.cost-table-scroll\s*\{[^}]*overflow-x:\s*auto/);
    // An overflow box is not keyboard reachable on its own, so the scroll region is labelled and
    // focusable rather than only scrollable by pointer.
    expect(source).toContain('role="region"');
    expect(source).toContain('tabindex="0"');
    expect(source).toMatch(/\.cost-table\s*\{[^}]*min-width:/);
  });

  it('adds no em dash and no en dash beyond the four already there', () => {
    expect((source.match(DASHES) ?? []).length).toBeLessThanOrEqual(PRE_EXISTING_DASHES);
    expect((readFileSync(SELF, 'utf8').match(DASHES) ?? []).length).toBe(0);
  });
});
