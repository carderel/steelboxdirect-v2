// src/data/zipPrefixCenters.ts
//
// Coordinates, and nothing else, for the committed metro ceiling behind /price/ (T-234). Two tables:
// the point of every metro centroid ZIP, and the approximate center of every three digit ZIP prefix
// (USPS sectional center) inside the instant price service area. src/lib/pricing/zipPrice.ts reads
// both and assigns each prefix to its NEAREST committed metro centroid, in code, so no metro is ever
// typed against a prefix by hand here. This module holds no prices and no metro names.
//
// SOURCE. United States Census Bureau, 2020 Census Gazetteer Files, ZIP Code Tabulation Areas,
// national file 2020_Gaz_zcta_national.txt, columns INTPTLAT and INTPTLONG (the internal point of
// each ZCTA, in decimal degrees, NAD83):
//   https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2020_Gazetteer/2020_Gaz_zcta_national.zip
//   https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.2020.html
// Retrieved and derived 2026-11-04.
//
// DERIVATION. A centroid point is the internal point of the ZCTA with the same five digits as the
// centroid ZIP in src/data/geoCentroids.ts. A prefix center is the unweighted mean of the internal
// points of every 2020 ZCTA whose first three digits are that prefix, rounded to four decimals
// (about 36 feet). Unweighted is a stated approximation: it pulls the point toward where ZCTAs are
// dense, which is where people live, and it only has to decide which metro is nearest, not where.
//
// PREFIXES WITH NO ZCTA. 419 and 459 sit inside the service ranges and hold no 2020 ZCTA, so the
// Census tabulates no residential ZIP in either and they have no center here. A ZIP in either is
// left unguarded, exactly as before, which zipPrice.test.ts asserts with the reason below.
//
// No apostrophes, no quote characters in comments, no em dash and no en dash in this file.

/** Internal point of each metro centroid ZCTA, keyed by the centroid ZIP. [latitude, longitude]. */
export const CENTROID_POINTS: Readonly<Record<string, readonly [number, number]>> = {
  '45237': [39.1946, -84.4510],
  '45404': [39.7895, -84.1618],
  '43219': [40.0074, -82.9207],
  '46218': [39.8073, -86.0997],
  '40205': [38.2230, -85.6833],
  '40502': [38.0110, -84.4832],
  '25704': [38.3076, -82.4874],
  '44105': [41.4495, -81.6303],
  '31408': [32.1174, -81.1842],
  '29406': [32.9373, -80.0354],
  '23505': [36.9142, -76.2894],
  '77008': [29.7982, -95.4169],
  '11222': [40.7278, -73.9476],
  '48072': [42.4979, -83.1859],
  '64110': [39.0344, -94.5728],
  '28206': [35.2554, -80.8215],
};

/** Served prefixes with no 2020 ZCTA, each with the reason it has no center. */
export const PREFIXES_WITHOUT_ZCTA: Readonly<Record<string, string>> = {
  '419': 'no 2020 ZCTA in this prefix',
  '459': 'no 2020 ZCTA in this prefix',
};

/**
 * Approximate center of every served three digit prefix that holds a 2020 ZCTA. [latitude,
 * longitude]. Ohio 430 to 459, Indiana 460 to 479, Kentucky 400 to 427, West Virginia 247 to 268.
 */
export const PREFIX_CENTERS: Readonly<Record<string, readonly [number, number]>> = {
  '430': [40.1709, -82.9191], // 58 ZCTAs
  '431': [39.6890, -82.8989], // 46 ZCTAs
  '432': [39.9934, -82.9842], // 29 ZCTAs
  '433': [40.5225, -83.4018], // 37 ZCTAs
  '434': [41.4580, -83.2983], // 41 ZCTAs
  '435': [41.4658, -84.1350], // 50 ZCTAs
  '436': [41.6637, -83.5700], // 17 ZCTAs
  '437': [39.8570, -81.7025], // 55 ZCTAs
  '438': [40.2583, -81.8708], // 17 ZCTAs
  '439': [40.2234, -80.8550], // 55 ZCTAs
  '440': [41.5235, -81.4108], // 56 ZCTAs
  '441': [41.4569, -81.6668], // 48 ZCTAs
  '442': [41.1169, -81.5868], // 44 ZCTAs
  '443': [41.0732, -81.5353], // 17 ZCTAs
  '444': [41.0948, -80.7566], // 50 ZCTAs
  '445': [41.0859, -80.6624], // 12 ZCTAs
  '446': [40.6648, -81.4866], // 67 ZCTAs
  '447': [40.8184, -81.3775], // 14 ZCTAs
  '448': [41.0333, -82.7632], // 57 ZCTAs
  '449': [40.7519, -82.5318], // 7 ZCTAs
  '450': [39.3927, -84.4816], // 32 ZCTAs
  '451': [39.1169, -83.9288], // 47 ZCTAs
  '452': [39.1718, -84.4877], // 45 ZCTAs
  '453': [39.9944, -84.2802], // 77 ZCTAs
  '454': [39.7442, -84.1772], // 28 ZCTAs
  '455': [39.9154, -83.7967], // 5 ZCTAs
  '456': [38.9391, -82.8237], // 62 ZCTAs
  '457': [39.3607, -81.7927], // 45 ZCTAs
  '458': [40.8133, -84.1982], // 79 ZCTAs
  '460': [40.1491, -86.0455], // 44 ZCTAs
  '461': [39.6401, -86.1573], // 59 ZCTAs
  '462': [39.8064, -86.1408], // 37 ZCTAs
  '463': [41.4466, -87.1634], // 44 ZCTAs
  '464': [41.5692, -87.3326], // 9 ZCTAs
  '465': [41.4508, -86.0448], // 46 ZCTAs
  '466': [41.6815, -86.2620], // 10 ZCTAs
  '467': [41.1956, -85.1964], // 59 ZCTAs
  '468': [41.0802, -85.1431], // 16 ZCTAs
  '469': [40.7285, -86.0692], // 57 ZCTAs
  '470': [39.1708, -85.0616], // 27 ZCTAs
  '471': [38.3919, -86.0029], // 44 ZCTAs
  '472': [39.0444, -85.7457], // 31 ZCTAs
  '473': [40.0696, -85.2167], // 56 ZCTAs
  '474': [39.0282, -86.6772], // 41 ZCTAs
  '475': [38.4151, -86.9929], // 52 ZCTAs
  '476': [38.1616, -87.4699], // 26 ZCTAs
  '477': [37.9994, -87.5642], // 9 ZCTAs
  '478': [39.4547, -87.3055], // 44 ZCTAs
  '479': [40.4306, -87.0668], // 64 ZCTAs
  '400': [38.1187, -85.3207], // 49 ZCTAs
  '401': [37.8665, -86.1672], // 31 ZCTAs
  '402': [38.2094, -85.6919], // 33 ZCTAs
  '403': [38.0396, -84.1877], // 38 ZCTAs
  '404': [37.4936, -84.4185], // 25 ZCTAs
  '405': [38.0292, -84.4910], // 15 ZCTAs
  '406': [38.2052, -84.8667], // 2 ZCTAs
  '407': [36.9533, -84.0834], // 12 ZCTAs
  '408': [36.8874, -83.2677], // 36 ZCTAs
  '409': [36.9110, -83.6934], // 29 ZCTAs
  '410': [38.7937, -84.4298], // 55 ZCTAs
  '411': [38.3809, -82.9648], // 26 ZCTAs
  '412': [37.8575, -82.7176], // 29 ZCTAs
  '413': [37.6009, -83.4229], // 15 ZCTAs
  '414': [37.8338, -83.2009], // 6 ZCTAs
  '415': [37.4586, -82.3527], // 38 ZCTAs
  '416': [37.5008, -82.7409], // 33 ZCTAs
  '417': [37.2346, -83.2224], // 32 ZCTAs
  '418': [37.2188, -82.8595], // 33 ZCTAs
  '420': [36.9159, -88.5765], // 49 ZCTAs
  '421': [36.8798, -86.0500], // 28 ZCTAs
  '422': [36.9284, -87.0017], // 29 ZCTAs
  '423': [37.4604, -87.0206], // 40 ZCTAs
  '424': [37.4740, -87.6522], // 27 ZCTAs
  '425': [37.1532, -84.7196], // 14 ZCTAs
  '426': [36.7793, -84.7028], // 12 ZCTAs
  '427': [37.3486, -85.7639], // 33 ZCTAs
  '247': [37.4101, -81.2406], // 16 ZCTAs
  '248': [37.4711, -81.6410], // 53 ZCTAs
  '249': [37.8769, -80.3918], // 32 ZCTAs
  '250': [38.1876, -81.4849], // 50 ZCTAs
  '251': [38.2271, -81.5176], // 52 ZCTAs
  '252': [38.6114, -81.5556], // 39 ZCTAs
  '253': [38.3595, -81.6295], // 13 ZCTAs
  '254': [39.4097, -78.0667], // 23 ZCTAs
  '255': [38.2877, -82.1680], // 39 ZCTAs
  '256': [37.7633, -82.0218], // 40 ZCTAs
  '257': [38.3875, -82.3972], // 5 ZCTAs
  '258': [37.7811, -81.2240], // 42 ZCTAs
  '259': [37.7856, -81.0622], // 34 ZCTAs
  '260': [40.1669, -80.6231], // 23 ZCTAs
  '261': [39.2033, -81.2618], // 32 ZCTAs
  '262': [38.7493, -80.0552], // 50 ZCTAs
  '263': [39.1955, -80.5353], // 31 ZCTAs
  '264': [39.2407, -80.3899], // 28 ZCTAs
  '265': [39.5736, -80.1292], // 33 ZCTAs
  '266': [38.4815, -80.7884], // 26 ZCTAs
  '267': [39.3432, -78.9787], // 23 ZCTAs
  '268': [38.9672, -78.9972], // 22 ZCTAs
};
