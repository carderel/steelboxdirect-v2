// src/data/rentalProviders.ts
// Every rental company named on /container-rental-guide/, plus the verification date and every
// count that page's prose interpolates.
//
// WHY THIS IS A DATA MODULE. Three separate strings on that page state how many conex rental
// companies were verified (the Section B intro, the QuickFacts spec cell, and the Section B
// closing note), and the verification date appears in five more. Inline copy would drift the
// moment one of them changed. Everything derives from this file.
//
// THE HELD MECHANISM. Any provider can ship `status: 'held'` when publishing that name needs an
// owner decision first. A held entry never renders, carries no `url` and no `linkLabel`, carries
// a `heldNote` saying why, and is left out of every derived count, so the count strings stay true
// without anyone editing prose. To publish one, set `status: 'published'`, add `url` and
// `linkLabel`, drop the `heldNote`, and all three count strings update together. There are no
// held entries at present.
//
// RULES FOR EDITING:
//   1. A provider `url` must be that company's own RENTAL page. The guard test rejects
//      /for-sale, /buy, /purchase and /shop paths outright.
//   2. Any dollar figure must be that company's own published rate, quoted as published, with
//      a `source` line naming the company, the medium, and VERIFIED_LABEL.
//   3. No averages, no ranges, no "typical" figure. Two published numbers are two published
//      numbers, not a market rate.
//   4. Do not add KOI Rental's phone number to this file or to any other file in the repo. A
//      guard test in rentalProviders.test.ts enforces that.

import { countWord, titleCountWord } from './numberWords';

/** ISO date every company on the page was last checked on its own public website. */
export const VERIFIED_ON = '2026-08-12';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Prose form of VERIFIED_ON, e.g. "12 August 2026". Never hand-typed in page copy. */
export const VERIFIED_LABEL = ((): string => {
  const [y, m, d] = VERIFIED_ON.split('-').map(Number);
  return `${d} ${MONTHS[(m ?? 1) - 1]} ${y}`;
})();

/** One run of text inside a fact value. `chip: true` renders it as a highlighted rate chip. */
export interface ProviderFactPart {
  text: string;
  chip?: boolean;
}

export interface ProviderFact {
  /** Short label, e.g. "Rents", "Service area", "Published rate". */
  k: string;
  /** The value, as a list of runs so a rate can be highlighted without inline markup. */
  parts: ProviderFactPart[];
  /** Attribution line. Required whenever `parts` contains a dollar figure. */
  source?: string;
}

export interface RentalProvider {
  id: string;
  name: string;
  /** 'held' entries never render and are excluded from every derived count. */
  status: 'published' | 'held';
  /** That company's own rental page. Absent while held. */
  url?: string;
  /** Visible label on the card's outbound link. Absent while held. */
  linkLabel?: string;
  /** Why a held entry is held. Never mentions a third party's business status. */
  heldNote?: string;
  /** True when the company publishes a rental rate on its own website. */
  publishesRate?: boolean;
  facts: ProviderFact[];
}

export interface ProviderCity {
  city: string;
  /** Region line beside the city name. */
  meta: string;
  providers: RentalProvider[];
}

const MAXXBOX_RATE_SOURCE =
  `Published by MaxxBox Storage on their own rates page. Read ${VERIFIED_LABEL}. `
  + 'Worked through in the example above.';

const MAXXBOX_FACT_RENTS: ProviderFact = {
  k: 'Rents',
  parts: [{
    text: 'Portable storage boxes in 16 and 20 foot lengths. These are portable storage boxes, '
      + 'not shipping containers',
  }],
};

const GOT_BINS_FACT_RENTS: ProviderFact = {
  k: 'Rents',
  parts: [{
    text: 'Storage bins in 5, 8, 10, and 16 foot lengths, designed and built in Ohio. These are '
      + 'portable storage boxes, not shipping containers',
  }],
};

const GOT_BINS_PERIODS: ProviderFact = {
  k: 'Rental periods',
  parts: [
    { text: 'They publish two: ' },
    { text: 'a 14 day period and a 30 day period, and the 30 day period carries a one month minimum', chip: true },
    { text: ` (stated on their own site, read ${VERIFIED_LABEL})` },
  ],
};

const maxxboxFor = (city: string): RentalProvider => ({
  id: 'maxxbox',
  name: 'MaxxBox Storage',
  status: 'published',
  url: 'https://www.maxxboxstorage.com/our-rates',
  linkLabel: 'Their published rates page',
  publishesRate: true,
  facts: [
    MAXXBOX_FACT_RENTS,
    {
      k: 'Service area',
      parts: [{
        text: city === 'Columbus'
          ? 'Offices include Newark in Licking County. They state coverage of every Ohio county'
          : 'Offices in Lima, Findlay, Newark, Huntsville, and Marion. They state coverage of '
            + `every Ohio county. None of their listed yards is in ${city}, so ask what delivery `
            + 'to your address involves',
      }],
    },
    {
      k: 'Published rate',
      parts: [
        { text: 'MaxxBox publishes a full rate card: ' },
        { text: '$129 a month for the 16 foot box, $159 a month for the 20 foot', chip: true },
        {
          text: ', with delivery, moving locations, and final pickup each $50 under 20 miles, '
            + 'then $50 plus $3 a mile beyond 20 miles. They publish these as statewide Ohio '
            + `rates rather than ${city} rates.`,
        },
      ],
      source: MAXXBOX_RATE_SOURCE,
    },
  ],
});

export const portableStorageCities: ProviderCity[] = [
  {
    city: 'Cincinnati',
    meta: 'Ohio · Northern Kentucky · Southeast Indiana',
    providers: [
      {
        id: 'gominis-cincinnati',
        name: "Go Mini's of Cincinnati",
        status: 'published',
        url: 'https://www.gominis.com/cincinnati/',
        linkLabel: 'Their Cincinnati rental page',
        facts: [
          { k: 'Rents', parts: [{ text: 'Portable storage containers in 12, 16, and 20 foot lengths' }] },
          {
            k: 'Service area',
            parts: [{ text: 'More than 50 communities, primarily Hamilton, Warren, and Clermont counties' }],
          },
          {
            k: 'Contact',
            parts: [{ text: 'Locally owned franchise with a local number, (513) 972-4778' }],
          },
          {
            k: 'Published rate',
            parts: [{
              text: 'None on their site. Their brand pricing page says rates are set locally and '
                + 'vary through the year, so this one is a phone call',
            }],
          },
        ],
      },
      {
        id: 'pods-cincinnati',
        name: 'PODS',
        status: 'published',
        url: 'https://www.pods.com/locations/united-states/ohio/dayton-cincinnati',
        linkLabel: 'Their Dayton and Cincinnati page',
        facts: [
          { k: 'Rents', parts: [{ text: 'PODS portable storage containers' }] },
          {
            k: 'Service area',
            parts: [{
              text: 'A combined Dayton and Cincinnati service area, with a facility northeast of '
                + 'downtown off I-275',
            }],
          },
          {
            k: 'Published rate',
            parts: [{ text: 'None on their Dayton and Cincinnati location page' }],
          },
        ],
      },
    ],
  },
  {
    city: 'Cleveland',
    meta: 'Northeast Ohio',
    providers: [
      {
        id: 'gominis-cleveland',
        name: "Go Mini's of Cleveland",
        status: 'published',
        url: 'https://www.gominis.com/cleveland/',
        linkLabel: 'Their Cleveland rental page',
        facts: [
          { k: 'Rents', parts: [{ text: 'Portable storage containers up to 20 feet' }] },
          {
            k: 'Service area',
            parts: [{
              text: '78 towns across Cuyahoga, Lake, Lorain, Medina, Portage, and Summit counties',
            }],
          },
          {
            k: 'Contact',
            parts: [{ text: 'Locally owned franchise with a local number, (330) 522-1410' }],
          },
          { k: 'Published rate', parts: [{ text: 'None on their site' }] },
        ],
      },
      {
        id: 'gotbins-cleveland',
        name: 'Got Bins',
        status: 'published',
        url: 'https://www.gotbins.com/cleveland/',
        linkLabel: 'Their Cleveland rental page',
        publishesRate: true,
        facts: [
          GOT_BINS_FACT_RENTS,
          { k: 'Service area', parts: [{ text: 'Columbus and Cleveland' }] },
          {
            k: 'Published rate',
            parts: [
              { text: 'On their Cleveland page, Got Bins publishes ' },
              { text: 'starting at $179 a month for an 8 foot bin', chip: true },
              { text: ' kept on your own property, and ' },
              { text: 'starting at $209 a month for an 8 foot bin', chip: true },
              {
                text: ' stored at their facility. The 8 foot bin is the second smallest of their '
                  + 'four sizes, and neither figure is a shipping container rate.',
              },
            ],
            source: `Published by Got Bins on their own Cleveland page. Read ${VERIFIED_LABEL}. `
              + 'Starting rates, so your quote may be higher.',
          },
          GOT_BINS_PERIODS,
          { k: 'Local since', parts: [{ text: 'Opened their first location in Columbus in 2008' }] },
        ],
      },
      maxxboxFor('Cleveland'),
    ],
  },
  {
    city: 'Columbus',
    meta: 'Central Ohio',
    providers: [
      {
        id: 'gominis-columbus',
        name: "Go Mini's of Columbus",
        status: 'published',
        url: 'https://www.gominis.com/columbus/',
        linkLabel: 'Their Columbus rental page',
        facts: [
          {
            k: 'Rents',
            parts: [{
              text: 'Portable storage containers, rental only. Nothing on the page is offered '
                + 'for purchase',
            }],
          },
          {
            k: 'Contact',
            parts: [{
              text: 'Franchise with its own local number rather than the corporate line, '
                + '(614) 502-6821',
            }],
          },
          {
            k: 'Terms',
            parts: [{ text: 'Their own quote form asks you to pick a rental duration from 1 to 12 months' }],
          },
          { k: 'Published rate', parts: [{ text: 'None on their site' }] },
        ],
      },
      {
        id: 'gotbins-columbus',
        name: 'Got Bins',
        status: 'published',
        // Their /columbus/ URL is a 404. Columbus is their headquarters and their own navigation
        // item labelled Columbus points at the main site, so that is where this card points.
        // No Columbus URL was invented and no dead link is used.
        url: 'https://www.gotbins.com/',
        linkLabel: 'Their main rental site',
        facts: [
          GOT_BINS_FACT_RENTS,
          {
            k: 'Service area',
            parts: [{
              text: 'Columbus and Cleveland. Columbus is their headquarters, and their own '
                + 'Columbus navigation link points at their main site rather than a separate '
                + 'city page',
            }],
          },
          {
            k: 'Published rate',
            parts: [{
              text: 'None for Columbus. The starting figures they publish are on their Cleveland '
                + 'page and are Cleveland figures, so do not carry them over to a Columbus quote',
            }],
          },
          GOT_BINS_PERIODS,
          { k: 'Local since', parts: [{ text: 'Opened their first location in Columbus in 2008' }] },
        ],
      },
      maxxboxFor('Columbus'),
    ],
  },
  {
    city: 'Dayton',
    meta: 'Southwest Ohio',
    providers: [
      {
        id: 'gominis-dayton',
        name: "Go Mini's of Dayton",
        status: 'published',
        url: 'https://www.gominis.com/dayton/',
        linkLabel: 'Their Dayton rental page',
        facts: [
          {
            k: 'Rents',
            parts: [{
              text: 'Portable storage containers, rental only. Nothing on the page is offered '
                + 'for purchase',
            }],
          },
          {
            k: 'Contact',
            parts: [{
              text: 'Franchise with its own local number rather than the corporate line, '
                + '(937) 600-0249',
            }],
          },
          {
            k: 'Terms',
            parts: [{ text: 'Their own quote form asks you to pick a rental duration from 1 to 12 months' }],
          },
          { k: 'Published rate', parts: [{ text: 'None on their site' }] },
        ],
      },
      maxxboxFor('Dayton'),
      {
        id: 'pods-dayton',
        name: 'PODS',
        status: 'published',
        url: 'https://www.pods.com/locations/united-states/ohio/dayton-cincinnati',
        linkLabel: 'Their Dayton and Cincinnati page',
        facts: [
          { k: 'Rents', parts: [{ text: 'PODS portable storage containers' }] },
          { k: 'Service area', parts: [{ text: 'A combined Dayton and Cincinnati service area' }] },
          {
            k: 'Published rate',
            parts: [{ text: 'None on their Dayton and Cincinnati location page' }],
          },
        ],
      },
    ],
  },
  {
    city: 'Indianapolis',
    meta: 'Central Indiana',
    providers: [
      {
        id: 'gominis-indianapolis',
        name: "Go Mini's of Indianapolis",
        status: 'published',
        url: 'https://www.gominis.com/indianapolis/',
        linkLabel: 'Their Indianapolis rental page',
        facts: [
          { k: 'Rents', parts: [{ text: 'Portable storage containers up to 20 feet' }] },
          {
            k: 'Service area',
            parts: [{ text: '52 cities across Marion, Hamilton, Johnson, and Hendricks counties' }],
          },
          {
            k: 'Contact',
            parts: [{ text: 'Locally owned franchise with a local number, (317) 699-8216' }],
          },
          { k: 'Published rate', parts: [{ text: 'None on their site' }] },
        ],
      },
    ],
  },
];

export const conexProviders: RentalProvider[] = [
  {
    id: 'jots-and-sots',
    name: 'JOTS & SOTS (Storage on the Spot)',
    status: 'published',
    url: 'https://jotsandsots.com/storage/',
    linkLabel: 'Their storage rental page',
    facts: [
      {
        k: 'Rents',
        parts: [{
          text: '16 gauge corrugated steel containers in 20 and 40 foot, plus office and break '
            + 'room units and portable toilets',
        }],
      },
      { k: 'Yard', parts: [{ text: 'Ironton, Ohio, in Lawrence County' }] },
      { k: 'Service area', parts: [{ text: 'The Ohio, West Virginia, and Kentucky tri-state' }] },
      {
        k: 'Best for',
        parts: [{
          text: 'Huntington and the tri-state, plus construction, commercial, residential, and '
            + 'industrial sites',
        }],
      },
      { k: 'Published rate', parts: [{ text: 'None on their site, so this one is a phone call' }] },
    ],
  },
  {
    id: 'teg-lease',
    name: 'TEG Lease',
    status: 'published',
    url: 'https://teglease.com/locations/ky/lexington/',
    linkLabel: 'Their Lexington rental page',
    facts: [
      {
        k: 'Rents',
        parts: [{
          text: 'Conex format containers in 8x10, 8x20, and 8x40, in standard, double door, and '
            + 'high cube, plus ground level offices',
        }],
      },
      {
        k: 'Service area',
        parts: [{ text: 'In Kentucky they list Bowling Green, Lexington, and Louisville' }],
      },
      {
        k: 'Best for',
        parts: [{ text: 'Lexington and Louisville, and they name construction sites specifically' }],
      },
      {
        k: 'Published rate',
        parts: [{
          text: 'None on either their Lexington or their Louisville page, so this one is a phone call',
        }],
      },
    ],
  },
  {
    id: 'koi-rental',
    name: 'KOI Rental',
    status: 'published',
    url: 'https://www.koirental.com/services-storage-containers',
    linkLabel: 'Their storage containers page',
    facts: [
      { k: 'Rents', parts: [{ text: 'Cargo containers in 10, 20, 40, and 45 foot, plus dry vans' }] },
      { k: 'Yard', parts: [{ text: 'Florence, Kentucky, in Boone County' }] },
      {
        k: 'Service area',
        parts: [{ text: 'They state Ohio, Kentucky, and Indiana, worked from Northern Kentucky' }],
      },
      { k: 'Published rate', parts: [{ text: 'None anywhere on their site' }] },
    ],
  },
];

/** Only these render. `conexCount` and every count string in page prose derive from this. */
export const publishedConexProviders = conexProviders.filter((p) => p.status === 'published');
export const conexCount = publishedConexProviders.length;
export const conexCountWord = countWord(conexCount);
export const conexTitleCountWord = titleCountWord(conexCount);

export const portableMetroCount = portableStorageCities.length;
export const portableListingCount = portableStorageCities.reduce(
  (n, c) => n + c.providers.length,
  0,
);

/** The companies that publish a rate on their own website, in the order the page names them. */
export const rateCompanyNames = [
  ...new Set(
    portableStorageCities
      .flatMap((c) => c.providers)
      .filter((p) => p.publishesRate)
      .map((p) => p.name),
  ),
];
export const rateCompanyCountWord = countWord(rateCompanyNames.length);
