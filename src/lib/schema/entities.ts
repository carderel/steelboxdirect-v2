export const SITE_URL = 'https://steelboxdirect.com';
export const ORG_ID = `${SITE_URL}/#organization`;
export const LOCALBUSINESS_ID = `${SITE_URL}/#localbusiness`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const FREEDOMCONEX_ID = `${SITE_URL}/#freedomconex`;

const SAME_AS = [
  'https://maps.google.com/?cid=16337072236475848136',
  'https://www.linkedin.com/company/steel-box-direct/',
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

export function globalNodes(): Record<string, unknown>[] {
  const freedomConex = {
    '@type': 'Organization',
    '@id': FREEDOMCONEX_ID,
    name: 'Freedom Conex LLC',
    url: 'https://www.freedomconex.com',
  };

  const organization = {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'Steel Box Direct',
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/logo.png`,
    description:
      'Shipping container buying guide and quote service serving 250 miles from Cincinnati, Ohio.',
    foundingDate: '2009',
    parentOrganization: { '@id': FREEDOMCONEX_ID },
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
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: { '@type': 'GeoCoordinates', latitude: '39.1365839', longitude: '-84.540972' },
      geoRadius: '402336', // 250 miles in metres
      description:
        '250-mile radius from Cincinnati, Ohio — Ohio, Indiana, Kentucky, and western West Virginia',
    },
    hasMap: 'https://maps.google.com/?cid=16337072236475848136',
    parentOrganization: { '@id': FREEDOMCONEX_ID },
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

  return [organization, freedomConex, localBusiness, website];
}
