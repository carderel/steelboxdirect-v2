// src/data/geoPricing.ts
// GENERATED FILE. Do not hand edit. Written in full by scripts/harvest-geo-pricing.mjs on the daily
// schedule, and rewritten only on the runs where a figure actually moved. A hand edit here is lost
// on the next committing run, and a hand edit that happens to survive is worse than one that is
// lost, because it publishes a number no feed ever returned.
//
// WHAT TO DO WHEN A FIGURE IN HERE LOOKS WRONG. Do not correct it in this file. Three cases, in
// order of how often they happen:
//   1. The feed is right and this file is stale. Run the harvest and let it commit.
//   2. The feed itself is wrong. Raise it with the supplier contact, then hold the harvest by
//      disabling the workflow, because a figure that is rewritten every morning cannot be pinned by
//      editing the output.
//   3. The harvest computed it wrongly. Fix the script and its unit tests, then rerun. The bug will
//      be in the arithmetic or in which field was read, and the second of those is the half that
//      fails silently. See UNIT PRICE BASIS below.
//
// WHAT THIS FILE HOLDS. One record per metro, keyed by the slug in src/data/cities.ts, priced for
// the population-centroid ZIP in src/data/geoCentroids.ts. Per SKU: the delivered figure, the pickup
// figure, an approximate pickup distance, an availability flag, and the date that figure last
// CHANGED. Used Wind and Water Tight is the only grade priced here, which is the only grade this
// site sells. Nothing else belongs in this file.
//
// UNIT PRICE BASIS, and the live bug it exists to prevent. Every delivered figure is the DELIVERY
// unit price plus the base delivery cost, rounded once at the end and never in parts. The feed also
// returns a lower field that reads like a unit price and is not one: it holds the smaller of the
// pickup and the delivery unit prices, so a delivered total built from it understates the true
// delivered figure while still summing to a plausible amount and passing every bound and every
// day-over-day move check. Measured at centroid 45404 on 2026-08-17, that field returned 1440.60
// against a delivery unit price of 1492.05, an understatement of 51.45 per container that no sanity
// check can see. The export named unitPriceBasis below names the field that is summed, its type
// admits exactly one value, and geoPricing.test.ts asserts both.
//
// WHAT NEVER LANDS HERE. No supplier name, no identifier from the feed, and no free text of any
// kind. The harvest copies an allowlisted set of numeric and boolean fields and never serialises a
// response. geoPricing.test.ts asserts the exact key set of every record and asserts that the whole
// file is printable ASCII, so an unexpected field or a stray character fails the suite instead of
// shipping.
//
// RULES FOR EDITING, meaning for editing the serialiser that writes this file:
//   1. Keep every comment in this file free of apostrophes and quote characters. The hs003 guard
//      pairs quote characters across the whole file to find string literals, so one stray apostrophe
//      up here re-pairs every literal below it and can silently suppress a real finding. An even
//      number is harmless and an odd number is not, so reason about parity across the whole file
//      rather than about one apostrophe.
//   2. No em dash and no en dash, ever. Neither character can reach this file except through a free
//      text field, which rule 3 already forbids.
//   3. Never widen the field allowlist to a string field from the feed.
//   4. lastVerified is operational and is never rendered anywhere. The date that renders is
//      effectiveSince. A visible check date would need a deploy every single day to stay true.
//   5. A metro belongs to its ZIP through the centroid module, never through this one. Each record
//      echoes its zip so the guard can assert the two agree, which is how a serialiser that priced
//      the wrong ZIP gets caught in a diff rather than on the phone.
//   6. An empty geoPricing is a legitimate state and means no price is published anywhere. It is not
//      a price of zero, and no consumer may read it as one.

import type { Pricing } from './pricing';

/**
 * The SKU keys this feed prices, derived from the Pricing interface with its date key removed, so
 * the two modules cannot drift apart in what counts as a SKU. Type only, so nothing is imported at
 * runtime and the two modules never form a cycle.
 */
export type GeoSkuKey = Exclude<keyof Pricing, 'asOf'>;

/**
 * Names the feed field that is summed into every delivered figure. One admissible value on purpose:
 * the wrong field is a compile error rather than a silent 51.45 per container. See UNIT PRICE BASIS.
 */
export type UnitPriceBasis = 'deliveryUnitPrice';

export interface GeoSkuPrice {
  /** Delivery unit price plus base delivery cost, rounded to the nearest 10. The published figure. */
  delivered: number;
  /**
   * Pickup unit price rounded to the nearest 10, or null when the feed reported none. It is not the
   * delivered figure with the delivery taken off, and no surface may compute a saving from it.
   */
  pickup: number | null;
  /** Approximate miles from the centroid ZIP to the sourcing yard, as reported by the feed. */
  pickupDistanceMiles: number | null;
  /** Feed availability for this SKU at this ZIP. False suppresses the SKU rather than staling it. */
  available: boolean;
  /** ISO date this figure last CHANGED in this metro. This is the date that renders. See rule 4. */
  effectiveSince: string;
}

export interface GeoMetroPricing {
  /** Echo of the centroid ZIP this metro was priced from. Must equal geoCentroids for the same slug. */
  zip: string;
  skus: Record<GeoSkuKey, GeoSkuPrice>;
}

/** Shape version of this generated module. Bumped when the serialiser changes the shape. */
export const feedVersion = 1;

/** The one feed field summed into every delivered figure. See UNIT PRICE BASIS in the header. */
export const unitPriceBasis: UnitPriceBasis = 'deliveryUnitPrice';

/**
 * The SKU keys in render order. A runtime list is needed because a type cannot be iterated, and
 * geoPricing.test.ts asserts this list equals the key set of pricing with its date key removed.
 */
export const geoSkuKeys: GeoSkuKey[] = ['20ftCargo', '40ftStandard', '40ftStandardHC'];

/**
 * ISO date of the last successful, fully validated harvest run, or null before the first one.
 * OPERATIONAL ONLY, never rendered on any surface. See rule 4 in the header.
 */
export const lastVerified: string | null = '2026-08-18';

/**
 * Metro slug to priced record. Empty until the first harvest run commits, which is why every
 * consumer treats an absent metro as no price rather than as a price of zero.
 */
export const geoPricing: Record<string, GeoMetroPricing> = {
  "charleston-shipping-containers": {
    zip: "29406",
    skus: {
      "20ftCargo": {
        delivered: 1640,
        pickup: 1390,
        pickupDistanceMiles: 7.3,
        available: true,
        effectiveSince: "2026-08-18"
      },
      "40ftStandard": {
        delivered: 1970,
        pickup: 1720,
        pickupDistanceMiles: 7.3,
        available: true,
        effectiveSince: "2026-08-18"
      },
      "40ftStandardHC": {
        delivered: 2170,
        pickup: 2010,
        pickupDistanceMiles: 7.3,
        available: true,
        effectiveSince: "2026-08-18"
      }
    }
  },
  "cincinnati-shipping-containers": {
    zip: "45237",
    skus: {
      "20ftCargo": {
        delivered: 2040,
        pickup: 1440,
        pickupDistanceMiles: 7.7,
        available: true,
        effectiveSince: "2026-08-18"
      },
      "40ftStandard": {
        delivered: 2420,
        pickup: 1850,
        pickupDistanceMiles: 102.6,
        available: true,
        effectiveSince: "2026-08-18"
      },
      "40ftStandardHC": {
        delivered: 2310,
        pickup: 1960,
        pickupDistanceMiles: 7.7,
        available: true,
        effectiveSince: "2026-08-18"
      }
    }
  },
  "cleveland-shipping-containers": {
    zip: "44105",
    skus: {
      "20ftCargo": {
        delivered: 2090,
        pickup: 1540,
        pickupDistanceMiles: 3.1,
        available: true,
        effectiveSince: "2026-08-18"
      },
      "40ftStandard": {
        delivered: 2700,
        pickup: 1850,
        pickupDistanceMiles: 154.5,
        available: true,
        effectiveSince: "2026-08-18"
      },
      "40ftStandardHC": {
        delivered: 2580,
        pickup: 2030,
        pickupDistanceMiles: 3.1,
        available: true,
        effectiveSince: "2026-08-18"
      }
    }
  },
  "columbus-shipping-containers": {
    zip: "43219",
    skus: {
      "20ftCargo": {
        delivered: 2040,
        pickup: 1490,
        pickupDistanceMiles: 18.3,
        available: true,
        effectiveSince: "2026-08-18"
      },
      "40ftStandard": {
        delivered: 2400,
        pickup: 1850,
        pickupDistanceMiles: 18.3,
        available: true,
        effectiveSince: "2026-08-18"
      },
      "40ftStandardHC": {
        delivered: 2300,
        pickup: 1750,
        pickupDistanceMiles: 18.3,
        available: true,
        effectiveSince: "2026-08-18"
      }
    }
  },
  "dayton-shipping-containers": {
    zip: "45404",
    skus: {
      "20ftCargo": {
        delivered: 2040,
        pickup: 1440,
        pickupDistanceMiles: 44.7,
        available: true,
        effectiveSince: "2026-08-18"
      },
      "40ftStandard": {
        delivered: 2400,
        pickup: 1850,
        pickupDistanceMiles: 77.7,
        available: true,
        effectiveSince: "2026-08-18"
      },
      "40ftStandardHC": {
        delivered: 2300,
        pickup: 1960,
        pickupDistanceMiles: 44.7,
        available: true,
        effectiveSince: "2026-08-18"
      }
    }
  },
  "detroit-shipping-containers": {
    zip: "48072",
    skus: {
      "20ftCargo": {
        delivered: 2020,
        pickup: 1440,
        pickupDistanceMiles: 20.1,
        available: true,
        effectiveSince: "2026-08-18"
      },
      "40ftStandard": {
        delivered: 2320,
        pickup: 1750,
        pickupDistanceMiles: 20.1,
        available: true,
        effectiveSince: "2026-08-18"
      },
      "40ftStandardHC": {
        delivered: 2530,
        pickup: 1960,
        pickupDistanceMiles: 20.1,
        available: true,
        effectiveSince: "2026-08-18"
      }
    }
  },
  "houston-shipping-containers": {
    zip: "77008",
    skus: {
      "20ftCargo": {
        delivered: 1780,
        pickup: 1230,
        pickupDistanceMiles: 19.6,
        available: true,
        effectiveSince: "2026-08-18"
      },
      "40ftStandard": {
        delivered: 2200,
        pickup: 1650,
        pickupDistanceMiles: 19.6,
        available: true,
        effectiveSince: "2026-08-18"
      },
      "40ftStandardHC": {
        delivered: 2200,
        pickup: 1650,
        pickupDistanceMiles: 19.6,
        available: true,
        effectiveSince: "2026-08-18"
      }
    }
  },
  "huntington-shipping-containers": {
    zip: "25704",
    skus: {
      "20ftCargo": {
        delivered: 2210,
        pickup: 1490,
        pickupDistanceMiles: 129.8,
        available: true,
        effectiveSince: "2026-08-18"
      },
      "40ftStandard": {
        delivered: 2570,
        pickup: 1850,
        pickupDistanceMiles: 129.8,
        available: true,
        effectiveSince: "2026-08-18"
      },
      "40ftStandardHC": {
        delivered: 2460,
        pickup: 1750,
        pickupDistanceMiles: 129.8,
        available: true,
        effectiveSince: "2026-08-18"
      }
    }
  },
  "indianapolis-shipping-containers": {
    zip: "46218",
    skus: {
      "20ftCargo": {
        delivered: 2040,
        pickup: 1490,
        pickupDistanceMiles: 12.7,
        available: true,
        effectiveSince: "2026-08-18"
      },
      "40ftStandard": {
        delivered: 2600,
        pickup: 1490,
        pickupDistanceMiles: 177.9,
        available: true,
        effectiveSince: "2026-08-18"
      },
      "40ftStandardHC": {
        delivered: 2510,
        pickup: 1960,
        pickupDistanceMiles: 12.7,
        available: true,
        effectiveSince: "2026-08-18"
      }
    }
  },
  "kansas-city-shipping-containers": {
    zip: "64110",
    skus: {
      "20ftCargo": {
        delivered: 2120,
        pickup: 1570,
        pickupDistanceMiles: 6.3,
        available: true,
        effectiveSince: "2026-08-18"
      },
      "40ftStandard": {
        delivered: 2610,
        pickup: 2060,
        pickupDistanceMiles: 6.3,
        available: true,
        effectiveSince: "2026-08-18"
      },
      "40ftStandardHC": {
        delivered: 2380,
        pickup: 1830,
        pickupDistanceMiles: 6.3,
        available: true,
        effectiveSince: "2026-08-18"
      }
    }
  },
  "lexington-shipping-containers": {
    zip: "40502",
    skus: {
      "20ftCargo": {
        delivered: 2040,
        pickup: 1830,
        pickupDistanceMiles: 83.7,
        available: true,
        effectiveSince: "2026-08-18"
      },
      "40ftStandard": {
        delivered: 2910,
        pickup: 1850,
        pickupDistanceMiles: 192.5,
        available: true,
        effectiveSince: "2026-08-18"
      },
      "40ftStandardHC": {
        delivered: 2450,
        pickup: 1900,
        pickupDistanceMiles: 83.7,
        available: true,
        effectiveSince: "2026-08-18"
      }
    }
  },
  "louisville-shipping-containers": {
    zip: "40205",
    skus: {
      "20ftCargo": {
        delivered: 2120,
        pickup: 1830,
        pickupDistanceMiles: 12.3,
        available: true,
        effectiveSince: "2026-08-18"
      },
      "40ftStandard": {
        delivered: 3000,
        pickup: 2160,
        pickupDistanceMiles: 176.4,
        available: true,
        effectiveSince: "2026-08-18"
      },
      "40ftStandardHC": {
        delivered: 2450,
        pickup: 1900,
        pickupDistanceMiles: 12.3,
        available: true,
        effectiveSince: "2026-08-18"
      }
    }
  },
  "new-york-shipping-containers": {
    zip: "11222",
    skus: {
      "20ftCargo": {
        delivered: 2110,
        pickup: 1260,
        pickupDistanceMiles: 35.5,
        available: true,
        effectiveSince: "2026-08-18"
      },
      "40ftStandard": {
        delivered: 2290,
        pickup: 1440,
        pickupDistanceMiles: 35.5,
        available: true,
        effectiveSince: "2026-08-18"
      },
      "40ftStandardHC": {
        delivered: 2390,
        pickup: 1540,
        pickupDistanceMiles: 35.5,
        available: true,
        effectiveSince: "2026-08-18"
      }
    }
  },
  "norfolk-shipping-containers": {
    zip: "23505",
    skus: {
      "20ftCargo": {
        delivered: 1890,
        pickup: 1290,
        pickupDistanceMiles: 25,
        available: true,
        effectiveSince: "2026-08-18"
      },
      "40ftStandard": {
        delivered: 2430,
        pickup: 1830,
        pickupDistanceMiles: 25,
        available: true,
        effectiveSince: "2026-08-18"
      },
      "40ftStandardHC": {
        delivered: 2250,
        pickup: 1650,
        pickupDistanceMiles: 25,
        available: true,
        effectiveSince: "2026-08-18"
      }
    }
  },
  "savannah-shipping-containers": {
    zip: "31408",
    skus: {
      "20ftCargo": {
        delivered: 1760,
        pickup: 1180,
        pickupDistanceMiles: 6.1,
        available: true,
        effectiveSince: "2026-08-18"
      },
      "40ftStandard": {
        delivered: 2120,
        pickup: 1540,
        pickupDistanceMiles: 6.1,
        available: true,
        effectiveSince: "2026-08-18"
      },
      "40ftStandardHC": {
        delivered: 2120,
        pickup: 1540,
        pickupDistanceMiles: 6.1,
        available: true,
        effectiveSince: "2026-08-18"
      }
    }
  }
};
