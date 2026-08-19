/**
 * Guard on src/data/geoCentroids.ts, the hand-written half of the geo pricing pair.
 *
 * This file has one job: make it impossible for the centroid list and cities.ts to drift apart, and
 * impossible for a centroid to be quietly replaced by the service-area ZIP that sits three lines
 * away in the same repository. The primaryZips assertion below is the load-bearing one. Every other
 * check here is cheap; that one encodes the whole reason the derivation pass existed.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  geoCentroids,
  centroidBySlug,
  centroidCount,
  centroidZips,
  publishingCentroids,
  publishingCentroidCount,
  nationalBasisCentroids,
  nationalBasisCentroidCount,
  CENTROIDS_DERIVED_ON,
} from './geoCentroids';
import { cities } from './cities';

const REPO_ROOT = import.meta.dirname
  ? join(import.meta.dirname, '..', '..')
  : process.cwd();

const MODULE_PATH = 'src/data/geoCentroids.ts';
const TEST_PATH = 'src/data/geoCentroids.test.ts';
const MODULE_SRC = readFileSync(join(REPO_ROOT, MODULE_PATH), 'utf8');
const TEST_SRC = readFileSync(join(REPO_ROOT, TEST_PATH), 'utf8');

/** Em dash and en dash, as escapes. Never write either character literally in this repo. */
const DASHES = /[\u2014\u2013]/;

/**
 * Straight apostrophe, straight double quote, backtick, and all four curly forms, every one written
 * as an escape. Writing them literally here would itself put three unpaired quote characters into
 * this file, which is the very hazard the assertion below exists to catch.
 */
const QUOTE_CHARS = /[\u0027\u0022\u0060\u2018\u2019\u201c\u201d]/;

/**
 * The agreed publish set, ruled 2026-08-18: all fifteen. The earlier draft published the seven
 * home-region metros only, on the assumption that depot delivery economics were worse. The live-feed
 * probe disproved it, every depot metro resolved to a local yard, and several of those yards sit
 * nearer their centroid than the home-region ones do. There is no phase two.
 *
 * WHY THIS IS STILL A HARDCODED LIST OF FIFTEEN NAMES AND NOT publish EVERY ENTRY. Written out
 * long-hand, the assertion below stays red for both directions of drift: a metro switched off with
 * its kill switch, and a sixteenth metro that arrives already publishing. Written as every entry
 * publishes, it would pass in the first case only by coincidence of nobody having tried, and in the
 * second it would wave a brand new market through unreviewed. Derive it from cities.ts and the same
 * hole opens. If a metro is switched off deliberately, delete the slug here in the same commit.
 */
const EXPECTED_PUBLISH = [
  'cincinnati-shipping-containers',
  'dayton-shipping-containers',
  'columbus-shipping-containers',
  'indianapolis-shipping-containers',
  'louisville-shipping-containers',
  'lexington-shipping-containers',
  'huntington-shipping-containers',
  'cleveland-shipping-containers',
  'savannah-shipping-containers',
  'charleston-shipping-containers',
  'norfolk-shipping-containers',
  'houston-shipping-containers',
  'new-york-shipping-containers',
  'detroit-shipping-containers',
  'kansas-city-shipping-containers',
];

/**
 * The agreed NATIONAL BASIS set, ruled 2026-08-18: the seven home region metros, and only those feed
 * the site wide average figure that renders on the homepage, the product hub and three product pages.
 *
 * WHY THIS IS A SECOND LIST AND NOT publish MINUS SOMETHING. The publish set above and this set
 * answer different questions and are allowed to differ, which is the whole point of keeping two
 * fields. publish asks whether a metro can stand behind the all in delivered promise on its own city
 * page, and the live feed probe answered yes for all fifteen. This asks what a site wide average
 * should mean when the word average is rendered beside one number on pages that scope themselves to
 * the home region in their own titles and delivery copy. A reader who sees only one of the two lists
 * will read this as the depot split being resurrected. It is not: no metro stopped publishing and no
 * city page changed. The reasoning is written out in the NATIONAL BASIS RULING note in the module.
 *
 * Written out long hand for the same reason EXPECTED_PUBLISH is: derived from region in cities.ts, or
 * from the flags themselves, and the assertion passes for both directions of drift, a home metro
 * silently dropped out of the average and an out of region metro silently averaged into it.
 */
const EXPECTED_NATIONAL_BASIS = [
  'cincinnati-shipping-containers',
  'dayton-shipping-containers',
  'columbus-shipping-containers',
  'indianapolis-shipping-containers',
  'louisville-shipping-containers',
  'lexington-shipping-containers',
  'huntington-shipping-containers',
];

/**
 * Slugs whose derived centroid legitimately coincides with a ZIP already listed in that same city
 * primaryZips array. Each was checked against the derivation before being listed here, and each has
 * an independent derivation recorded in
 * UDO Project/.outputs/research/2026-08-17-metro-centroid-zips.md:
 *
 *   louisville 40205  Belknap and Bonnycastle. The population-weighted mean of the 12-county 2023
 *                     Louisville CBSA county centers resolves here, 5.0 miles southeast of the
 *                     downtown reference ZIP 40202. It is also the fourth of five marketing ZIPs
 *                     for the metro, which is coincidence and not provenance. Louisville is one of
 *                     only two metros where the centroid changes the delivered figure at all, and
 *                     it changes it downward, which is the opposite of what a shortcut would do.
 *   savannah 31408    Garden City, Chatham County. Resolved directly from the three-county metro
 *                     computation. The research note offers 31405 as a more conventionally
 *                     residential and identically priced alternative and still recommends 31408 as
 *                     the criterion answer.
 *   houston 77008     Houston Heights, Harris County. The 10-county 2023 CBSA county sum matches
 *                     the published MSA total to 585 people and Harris County carries 66 percent
 *                     of the weight, so the point lands well inside a 36,631-person ZCTA.
 *
 * An allowlisted collision is not a weakened guard, because a coincidence was never the failure
 * mode: the failure is PICKING a service-area ZIP as a shortcut, and an independently derived
 * centroid landing on one is expected, since marketing ZIPs cluster near population and so does a
 * population centroid. Louisville primaryZips, for instance, are a downtown-adjacent run, so a
 * centroid five miles southeast of downtown landing inside 40205 is unsurprising rather than
 * suspicious.
 *
 * Do not extend this list to silence a failure. A new entry means either the derivation moved or
 * somebody took the shortcut rule 1 of the module forbids, and the two look identical from here.
 */
const PRIMARY_ZIP_COLLISION_ALLOWLIST = [
  'louisville-shipping-containers',
  'savannah-shipping-containers',
  'houston-shipping-containers',
];

const cityBySlug = new Map(cities.map((c) => [c.slug, c]));

describe('geoCentroids: coverage against cities.ts', () => {
  it('holds exactly one entry per city, in both directions, so the two files cannot drift', () => {
    expect([...geoCentroids].map((m) => m.slug).sort())
      .toEqual([...cities].map((c) => c.slug).sort());
  });

  it('derives its count rather than hardcoding it, and matches the city count', () => {
    expect(centroidCount).toBe(geoCentroids.length);
    expect(centroidCount).toBe(cities.length);
  });

  it('has no duplicate slugs', () => {
    expect(new Set(geoCentroids.map((m) => m.slug)).size).toBe(geoCentroids.length);
  });

  it('joins to a real city record for every slug, suffix form included', () => {
    for (const m of geoCentroids) {
      const city = cityBySlug.get(m.slug);
      expect(
        city,
        `${m.slug} does not match any slug in cities.ts. The key form is the full cities.ts slug, `
        + 'suffix included, not the bare metro name.',
      ).toBeDefined();
      expect(m.slug).toMatch(/-shipping-containers$/);
    }
  });

  it('exposes centroidBySlug as a complete lookup over the same entries', () => {
    expect(Object.keys(centroidBySlug).sort()).toEqual(geoCentroids.map((m) => m.slug).sort());
    for (const m of geoCentroids) expect(centroidBySlug[m.slug]).toBe(m);
  });
});

describe('geoCentroids: ZIP shape', () => {
  it('stores every zip as a five-digit STRING, because leading zeros are significant', () => {
    for (const m of geoCentroids) {
      expect(typeof m.zip, `${m.slug} zip must be a string, not a number`).toBe('string');
      expect(m.zip, `${m.slug} zip`).toMatch(/^[0-9]{5}$/);
    }
  });

  it('has no duplicate zips: two metros priced from one point would be an editing slip', () => {
    expect(new Set(centroidZips).size).toBe(geoCentroids.length);
    expect(centroidZips).toEqual(geoCentroids.map((m) => m.zip));
  });
});

describe('geoCentroids: not a service-area ZIP', () => {
  /**
   * THE ASSERTION THIS FILE EXISTS FOR. primaryZips are marketing ZIPs picked to demonstrate
   * coverage across counties. Reusing one as the priced point is the specific shortcut the
   * derivation pass existed to avoid, and it would be invisible in review.
   */
  it('never prices a metro from a ZIP already listed in that city primaryZips', () => {
    for (const m of geoCentroids) {
      if (PRIMARY_ZIP_COLLISION_ALLOWLIST.includes(m.slug)) continue;
      const city = cityBySlug.get(m.slug);
      expect(
        city?.primaryZips ?? [],
        `${m.slug} centroid ${m.zip} is one of its own primaryZips. Either the derivation was `
        + 'skipped and a service-area ZIP was reused, or the true centroid really does land there. '
        + 'Redo the derivation, then add the slug to PRIMARY_ZIP_COLLISION_ALLOWLIST with the '
        + 'working recorded, exactly as the three existing entries are.',
      ).not.toContain(m.zip);
    }
  });

  it('carries no dead allowlist entries, so it cannot become cover for a shortcut', () => {
    for (const slug of PRIMARY_ZIP_COLLISION_ALLOWLIST) {
      const centroid = centroidBySlug[slug];
      expect(centroid, `${slug} is allowlisted but has no centroid entry`).toBeDefined();
      expect(
        cityBySlug.get(slug)?.primaryZips ?? [],
        `${slug} is allowlisted for a primaryZips collision that no longer exists. Delete the `
        + 'allowlist entry and let the real assertion cover it.',
      ).toContain(centroid?.zip);
    }
    expect(PRIMARY_ZIP_COLLISION_ALLOWLIST.length).toBe(3);
    expect(new Set(PRIMARY_ZIP_COLLISION_ALLOWLIST).size)
      .toBe(PRIMARY_ZIP_COLLISION_ALLOWLIST.length);
  });
});

describe('geoCentroids: the publish gate', () => {
  it('publishes exactly the agreed set, slug by slug', () => {
    expect(publishingCentroids.map((m) => m.slug).sort()).toEqual([...EXPECTED_PUBLISH].sort());
    expect(publishingCentroidCount).toBe(publishingCentroids.length);
    expect(publishingCentroidCount).toBe(15);
    expect(new Set(EXPECTED_PUBLISH).size).toBe(EXPECTED_PUBLISH.length);
  });

  /**
   * The ruling, stated as the invariant rather than as a list, so a reader of a future failure can
   * see WHICH commitment broke. The check above would also catch a wholesale depot switch-off, but
   * it would report it as fifteen names against seven and leave the reason to be reconstructed.
   */
  it('publishes both regions, depot markets included, as ruled', () => {
    const regionsPublishing = new Set(publishingCentroids.map((m) => cityBySlug.get(m.slug)?.region));
    const regionsExisting = new Set(geoCentroids.map((m) => cityBySlug.get(m.slug)?.region));
    expect(regionsExisting).toEqual(new Set(['home', 'depot']));
    expect(
      [...regionsPublishing].sort(),
      'a whole region stopped publishing. Depot metros publish on the same terms as home metros: '
      + 'the live-feed probe found a local yard in every one of them. If this was deliberate, edit '
      + 'EXPECTED_PUBLISH and the PUBLISH RULING note in the same commit.',
    ).toEqual([...regionsExisting].sort());
  });

  /**
   * publish is true fifteen times out of fifteen, which makes it look like a field nobody uses and
   * a tidy-up away from deletion. It is the per-metro kill switch, the only place one bad metro feed
   * can be stopped without touching the other fourteen, and a later task reads it. These three
   * checks are what a deletion would have to walk past: the field on every entry, the field on the
   * interface, and the doc comment that says why a uniform value is not a dead one.
   */
  it('keeps the publish kill switch, and the note saying why a uniform true is not dead weight', () => {
    for (const m of geoCentroids) {
      expect(Object.hasOwn(m, 'publish'), `${m.slug} has no publish field`).toBe(true);
    }
    expect(MODULE_SRC).toMatch(/publish: boolean;/);
    expect(
      MODULE_SRC,
      'the publish field lost the comment explaining that it is the per-metro kill switch. Restore '
      + 'it before the field itself gets removed as unused.',
    ).toContain('kill switch');
  });

  it('types publish as a boolean on every entry', () => {
    for (const m of geoCentroids) expect(typeof m.publish, `${m.slug} publish`).toBe('boolean');
  });
});

describe('geoCentroids: the national basis gate', () => {
  it('feeds the site wide average from exactly the agreed basis set, slug by slug', () => {
    expect(nationalBasisCentroids.map((m) => m.slug).sort())
      .toEqual([...EXPECTED_NATIONAL_BASIS].sort());
    expect(nationalBasisCentroidCount).toBe(nationalBasisCentroids.length);
    expect(nationalBasisCentroidCount).toBe(7);
    expect(new Set(EXPECTED_NATIONAL_BASIS).size).toBe(EXPECTED_NATIONAL_BASIS.length);
  });

  /**
   * The ruling as an invariant rather than as a list, so a future failure names WHICH commitment
   * broke. The basis is a strict subset of the publish set, it is the whole of one region and none of
   * the other, and it is smaller than the publish set. That last clause is the one that goes red if
   * somebody decides the two fields are redundant and points one at the other.
   */
  it('averages one whole region and no part of the other, and stays narrower than the publish set', () => {
    const basisRegions = new Set(nationalBasisCentroids.map((m) => cityBySlug.get(m.slug)?.region));
    expect(basisRegions).toEqual(new Set(['home']));
    const homeCount = geoCentroids.filter((m) => cityBySlug.get(m.slug)?.region === 'home').length;
    expect(
      nationalBasisCentroidCount,
      'the basis must be every home metro. A home metro missing from the average is a home market '
      + 'whose own city page figure sits above or below a site wide number it did not contribute to.',
    ).toBe(homeCount);
    expect(
      nationalBasisCentroidCount,
      'the basis is no longer narrower than the publish set, so the two fields have collapsed into '
      + 'one. If widening the average back to every publishing metro was deliberate, edit '
      + 'EXPECTED_NATIONAL_BASIS and the NATIONAL BASIS RULING note in the same commit.',
    ).toBeLessThan(publishingCentroidCount);
    for (const m of nationalBasisCentroids) {
      expect(publishingCentroids, `${m.slug} is in the basis but does not publish`).toContain(m);
    }
  });

  /**
   * Three checks a tidy up would have to walk past: the field on every entry, the field on the
   * interface, and the note that says why it is not a duplicate of publish. The derived export is the
   * intersection of the two flags, so the per metro kill switch still moves the site wide figure in
   * the same direction as it moves that city page, which is the property the old basis had when it
   * read publishingCentroids.
   */
  it('keeps nationalBasis a real boolean field, distinct from publish, and intersected with it', () => {
    for (const m of geoCentroids) {
      expect(Object.hasOwn(m, 'nationalBasis'), `${m.slug} has no nationalBasis field`).toBe(true);
      expect(typeof m.nationalBasis, `${m.slug} nationalBasis`).toBe('boolean');
    }
    expect(MODULE_SRC).toMatch(/nationalBasis: boolean;/);
    expect(MODULE_SRC).toContain('NATIONAL BASIS RULING');
    expect(
      MODULE_SRC,
      'the derived export must intersect the basis flag with the publish flag, so that switching a '
      + 'metro off with its kill switch also removes it from the site wide average',
    ).toContain('m.nationalBasis && m.publish');
    // Never derived from cities.ts: a region rename would otherwise silently reprice the homepage.
    expect(MODULE_SRC).not.toMatch(/from '\.\/cities'/);
  });
});

describe('geoCentroids: provenance recorded in the module header', () => {
  it('states the selection criterion', () => {
    expect(MODULE_SRC).toContain('SELECTION CRITERION');
    expect(MODULE_SRC).toContain('population-weighted mean');
    expect(MODULE_SRC).toContain('core-based statistical area');
  });

  it('names the data sources and the research note that holds the working', () => {
    expect(MODULE_SRC).toContain('Census 2020 Centers of Population');
    expect(MODULE_SRC).toContain('Census2020_Current');
    expect(MODULE_SRC).toContain('OMB Bulletin 23-01');
    expect(MODULE_SRC).toContain('2026-08-17-metro-centroid-zips.md');
  });

  it('records the derivation date and the live-feed probe result', () => {
    expect(CENTROIDS_DERIVED_ON).toMatch(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/);
    expect(MODULE_SRC).toContain('PROBE RESULTS');
    expect(MODULE_SRC).toContain(CENTROIDS_DERIVED_ON);
  });

  it('flags the two entries whose metro definition is weakly sourced', () => {
    expect(MODULE_SRC).toContain('CONFIDENCE');
    expect(MODULE_SRC).toMatch(/cleveland 44105/);
    expect(MODULE_SRC).toMatch(/charleston 29406/);
  });

  it('carries a numbered editing rules block, as the other data modules do', () => {
    expect(MODULE_SRC).toContain('RULES FOR EDITING');
  });
});

describe('geoCentroids: house hard stops', () => {
  it('holds no dollar figure: this module maps metros to ZIPs and nothing else', () => {
    expect(MODULE_SRC).not.toMatch(/\$\s*[0-9]/);
  });

  it('never names the supplier', () => {
    expect(MODULE_SRC).not.toMatch(/freedom\s*conex/i);
  });

  it('contains neither an em dash nor an en dash, in the module or in this guard', () => {
    expect(DASHES.test(MODULE_SRC), `${MODULE_PATH} contains U+2014 or U+2013`).toBe(false);
    expect(DASHES.test(TEST_SRC), `${TEST_PATH} contains U+2014 or U+2013`).toBe(false);
  });

  /**
   * T-146 parity. The hs003 extractor pairs quote characters across the whole file to find string
   * literals and does not skip comments, so an odd number of apostrophes in comments re-pairs every
   * literal below the imbalance and silently drops coverage for the file. Zero is the only count
   * that is safe without having to think about it.
   */
  it('has no apostrophe or quote character in any comment, in the module or in this guard', () => {
    for (const [label, src] of [[MODULE_PATH, MODULE_SRC], [TEST_PATH, TEST_SRC]] as const) {
      const offenders = src.split('\n')
        .map((line, i) => [i + 1, line] as const)
        .filter(([, line]) => /^\s*(\/\/|\/\*|\*)/.test(line))
        .filter(([, line]) => QUOTE_CHARS.test(line))
        .map(([n, line]) => `${label}:${n} ${line.trim()}`);
      expect(offenders, 'comment lines carrying a quote character').toEqual([]);
    }
  });
});
