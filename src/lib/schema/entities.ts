export const SITE_URL = 'https://steelboxdirect.com';
export const ORG_ID = `${SITE_URL}/#organization`;
export const LOCALBUSINESS_ID = `${SITE_URL}/#localbusiness`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

const SAME_AS = [
  'https://maps.google.com/?cid=16337072236475848136',
  'https://www.linkedin.com/company/steel-box-direct/',
  'https://www.facebook.com/SteelBoxDirect/',
  'https://www.pinterest.com/steelboxdirect/',
  'https://www.youtube.com/@steelboxdirect',
];

const WARRANTY = {
  '@type': 'WarrantyPromise',
  description: 'Lifetime Leak Warranty on Wind & Water Tight containers',
};

const OFFERED_SERVICE = {
  '@type': 'Offer',
  itemOffered: { '@type': 'Service', name: 'Wind & Water Tight Shipping Container Sales' },
  warranty: WARRANTY,
};

/**
 * areaServed is a two-node list, deliberately.
 *
 * The GeoCircle is the core home region we run ourselves: 250 miles from Cincinnati, matching
 * the `region: 'home'` cities in src/data/cities.ts and the 250-mile language used in page copy.
 * It stays so the local-dominance signal survives.
 *
 * The Country node is the honest ceiling: delivery is available anywhere in the US out of the
 * depot hubs, and has happened outside Ohio, Indiana, and Kentucky. A single continental
 * GeoCircle would have said "circle" when the truth is "hub network", and a list of only the
 * depot states would have implied the other states are excluded, which is the same
 * understatement in a smaller form.
 *
 * Geography only. No permit, zoning, classification, tax, or insurance claim belongs here
 * (PROJECT_HS_003: schema strips surrounding attribution).
 */
const CORE_MARKET_AREA = {
  '@type': 'GeoCircle',
  geoMidpoint: { '@type': 'GeoCoordinates', latitude: '39.1365839', longitude: '-84.540972' },
  geoRadius: '402336', // 250 miles in metres
  description:
    'Core home region, within 250 miles of Cincinnati, Ohio: Ohio, Indiana, Kentucky, and western West Virginia',
};

const NATIONAL_AREA = {
  '@type': 'Country',
  name: 'United States',
  description: 'Nationwide delivery from depot hubs through our supplier network',
};

const AREA_SERVED = [CORE_MARKET_AREA, NATIONAL_AREA];

/**
 * Human-readable rendering of AREA_SERVED for the visible "Serves" cell in QuickFacts.
 *
 * It has to say the same thing the graph says, in the same register, or the visible band
 * contradicts the structured data. The two clauses map one-to-one onto the two areaServed
 * nodes: the GeoCircle first (local dominance leads, per the 2026-08-11 ruling), then the
 * Country node, qualified as "from depot hubs" so it reads as a capability and not as a
 * claim of local presence in every market.
 *
 * This is the default for pages with no geography of their own (guides, products, hubs,
 * collections, home). Pages that DO have a specific area set `serves` explicitly in
 * buildPageSchema and never see this string. Do not enumerate states here: a state list
 * implies the unlisted states are excluded, which is the reason the graph does not do it.
 */
export const SERVICE_AREA_LINE = '250 mi from Cincinnati, OH · nationwide from depot hubs';

/**
 * Deliberately NO parentOrganization property and no parent company Organization node anywhere
 * in this graph.
 *
 * Owner ruling, 2026-08-19: the parent company stays in visible HTML, meaning the footer agent
 * credit, the nav agent strip, and the legal pages, but it gets zero presence in structured data.
 * Adding either the node back or a parentOrganization reference to it will fail the guard test in
 * entities.test.ts. Do not reintroduce one without a new ruling.
 */
export function globalNodes(): Record<string, unknown>[] {
  const organization = {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'Steel Box Direct',
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/logo.png`,
    description:
      'Shipping container buying guide and quote service. Core home region within 250 miles of Cincinnati, Ohio, with nationwide delivery from depot hubs.',
    areaServed: AREA_SERVED,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Sales',
      telephone: '+15135462543',
      url: `${SITE_URL}/quote/`,
    },
    makesOffer: OFFERED_SERVICE,
    sameAs: SAME_AS,
  };

  const localBusiness = {
    '@type': 'LocalBusiness',
    '@id': LOCALBUSINESS_ID,
    name: 'Steel Box Direct',
    url: `${SITE_URL}/`,
    image: `${SITE_URL}/logo.png`,
    telephone: '+15135462543',
    description: "Shipping container buyer's guide and sales service.",
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Cincinnati',
      addressRegion: 'OH',
      addressCountry: 'US',
    },
    geo: { '@type': 'GeoCoordinates', latitude: '39.1365839', longitude: '-84.540972' },
    areaServed: AREA_SERVED,
    hasMap: 'https://maps.google.com/?cid=16337072236475848136',
    makesOffer: OFFERED_SERVICE,
    sameAs: SAME_AS,
  };

  const website = {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: 'Steel Box Direct',
    url: `${SITE_URL}/`,
    publisher: { '@id': ORG_ID },
  };

  return [organization, localBusiness, website];
}
