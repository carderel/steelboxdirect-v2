// src/data/inspectors.ts
// Every IICL-certified container inspector in the US directory, as retrieved from the IICL's
// "Find a Certified Inspector" search pages on RETRIEVED_DATE. This is the single source for
// /find-a-container-inspector/: every count that page states derives from this file, never from
// a hand-typed number, on the rentalProviders.ts precedent.
//
// PROVENANCE AND OBLIGATIONS (from the 2026-08-25 enumeration, owner-verified complete):
//   - Retrieved by a manual pass on the three IICL search pages with Country = USA. The IICL
//     publishes no terms of use, but compilation copyright applies and rows are personal data,
//     so the safe pattern is: attribute, deep-link the three search pages, add value (state
//     grouping, credential explanation, booking process), and honor correction or removal
//     requests. The page's attribution block is non-negotiable.
//   - Re-verified quarterly (Feb / May / Aug / Nov manual pass). Update RETRIEVED_DATE and the
//     rows together, never one without the other.
//
// RULES FOR EDITING:
//   1. Rows are transcribed VERBATIM from the retrieved directory. Do not correct spellings,
//      city oddities, or apparent state mismatches: the row is the citation. Normalization
//      below is limited to trimming whitespace and uppercasing the state code.
//   2. The IICL's internal rating column is deliberately NOT here. It is the IICL's own scoring
//      and not ours to republish.
//   3. No dollar figures in this module, ever.

export type CredentialType = 'dry van' | 'chassis' | 'reefer';

export interface InspectorRow {
  /** Employer as listed. Empty string when the directory lists none. */
  company: string;
  name: string;
  /** IICL inspection ID. One person holds one ID across all their credentials. */
  inspectionId: string;
  city: string;
  state: string;
  /** Certification start date as listed, M/D/YY. */
  certStart: string;
  /** Certification expiry date as listed, M/D/YY. */
  certExpires: string;
  credential: CredentialType;
}

/** ISO date of the manual directory pass these rows were copied from. */
export const RETRIEVED_DATE = '2026-08-25';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Prose form of RETRIEVED_DATE, e.g. "August 25, 2026". Never hand-typed in page copy. */
export const RETRIEVED_LABEL = ((): string => {
  const [y, m, d] = RETRIEVED_DATE.split('-').map(Number);
  return `${MONTHS[(m ?? 1) - 1]} ${d}, ${y}`;
})();

export const SOURCE_NAME = 'IICL Find a Certified Inspector directory';

/** The three IICL search pages the rows came from. Deep-linked in the attribution block. */
export const IICL_DIRECTORY_URLS = {
  dryVan: 'https://iicl.org/find-a-certified-inspector/dry-van-container/',
  chassis: 'https://iicl.org/find-a-certified-inspector/chassis/',
  reefer: 'https://iicl.org/find-a-certified-inspector/refrigerated-containers/',
} as const;

/** The states Steel Box Direct's home delivery region sits in, for the directory callout. */
export const HOME_REGION_STATES = ['OH', 'IN', 'KY'] as const;

/** Normalizing constructor: trim every field, uppercase the state. Nothing else is altered. */
const r = (
  company: string, name: string, inspectionId: string, city: string, state: string,
  certStart: string, certExpires: string, credential: CredentialType,
): InspectorRow => ({
  company: company.trim(),
  name: name.trim(),
  inspectionId: inspectionId.trim(),
  city: city.trim(),
  state: state.trim().toUpperCase(),
  certStart: certStart.trim(),
  certExpires: certExpires.trim(),
  credential,
});

/**
 * Verbatim transcription of the retrieved directory, one row per credential, in the order the
 * three searches returned them: dry van, then chassis, then refrigerated. A person certified for
 * more than one equipment type appears once per credential here and once in `inspectors` below.
 */
export const inspectorRows: InspectorRow[] = [
  r('', 'Charles Sapp', '1001055', 'Jacksonville', 'FL', '12/21/22', '12/21/27', 'dry van'),
  r('', 'Alexander Aubuchon', '1010382', 'Savannah', 'GA', '6/16/25', '6/16/30', 'dry van'),
  r('Textainer', 'Anthony F. Gucciardi Jr.', '1000943', 'Cherry Hill', 'NJ', '12/19/23', '12/19/28', 'dry van'),
  r('Textainer', 'Brad Bostdorff', '1000941', 'San Francisco', 'CA', '12/18/23', '12/18/28', 'dry van'),
  r('', 'Erhan Sakaoglu', '1010340', 'Davie', 'FL', '11/20/24', '11/20/29', 'dry van'),
  r('The Eagle Leasing Company', 'Mark Eagle', '1000697', 'Southborugh', 'MA', '11/30/22', '11/30/27', 'dry van'),
  r('Equipment Management Services', 'Rene Mondragon', '1001254', 'Houston', 'TX', '2/13/23', '2/13/28', 'dry van'),
  r('Container Certification & Testing', 'Timothy Frederick', '1008754', 'Cinnaminson', 'NJ', '10/22/24', '10/22/29', 'dry van'),
  r('', 'Alexander Henry', '1013930', 'Orting', 'WA', '6/27/22', '6/27/27', 'dry van'),
  r('SeaCube', 'Anthony Ascani', '1030349', 'Montvale', 'NJ', '10/23/25', '10/23/30', 'dry van'),
  r('West Gulf Containers', 'Anthony Esordi', '1019884', 'Channelview', 'TX', '11/7/25', '11/7/30', 'dry van'),
  r('ISM-JAZ', 'Arthur Zimmerly', '1044168', 'Norfolk', 'VA', '7/30/26', '7/30/31', 'dry van'),
  r('Tahoma Global Logistics', 'Barry Harmon', '1016676', 'Tacoma', 'WA', '5/10/23', '5/10/28', 'dry van'),
  r('Textainer', 'Benjamin Nero', '1029358', 'San Francisco', 'CA', '9/17/25', '9/17/30', 'dry van'),
  r('U.S. Coast Guard', 'Bradley Martin', '1016844', 'Yorktown', 'VA', '11/30/23', '11/30/28', 'dry van'),
  r('CORDC', 'Bryan Clemons', '1016471', 'Westcliffe, CA', 'CO', '4/20/23', '4/20/28', 'dry van'),
  r('ConGlobal Industries', 'Clifford Hamilton', '1016922', 'Chesapeake', 'VA', '10/23/23', '10/23/28', 'dry van'),
  r('Cargo Hound Inspections', 'Daniel Kelley', '1016874', 'Dallas', 'TX', '3/25/24', '3/25/29', 'dry van'),
  r('PODI', 'Dave Potomac', '1000775', 'Gaithersburg', 'CO', '4/22/26', '4/22/31', 'dry van'),
  r('TN Americas LLC', 'Dennis Turner', '1016604', 'Kevil', 'KY', '10/13/23', '10/13/28', 'dry van'),
  r('Neptune Marine Surveys & Services, Inc.', 'Desmond Ransom', '1032570', 'Dillsboro', 'IN', '8/18/25', '8/18/30', 'dry van'),
  r('Sparc Transport', 'Ed Kim', '1019978', 'Channahon', 'IL', '3/22/24', '3/22/29', 'dry van'),
  r('CHS Container Group', 'Edward Shea', '1020575', 'Norfolk', 'VA', '7/2/25', '7/2/30', 'dry van'),
  r('Westinghouse', 'Eric Hartman', '1016760', 'Lexington', 'SC', '12/21/23', '12/21/28', 'dry van'),
  r('Boatinspectusa.com LLC', 'Evan Hughes', '1020224', 'Alpharetta', 'GA', '5/13/24', '5/13/29', 'dry van'),
  r('SONO Marine Cargo Surveys and Inspections, LLC', 'George Mosescu', '1016677', 'Virginia Beach', 'VA', '9/6/24', '9/6/29', 'dry van'),
  r('Textainer', 'Helen Urbano', '1016491', 'Cranford', 'NJ', '11/17/23', '11/17/28', 'dry van'),
  r('ConGlobal Industries', 'Jacob Gerstner', '1032553', 'ConGlobal Industries', 'LA', '5/20/25', '5/20/30', 'dry van'),
  r('SeaCube', 'James Scampoli', '1030353', 'Montvale', 'NJ', '12/18/25', '12/18/30', 'dry van'),
  r('Textainer', 'Jared Shaffer', '1034817', 'San Francisco', 'CA', '12/29/25', '12/29/30', 'dry van'),
  r('RSD Container Yard Services', 'Jeffrey Pollard', '1018119', 'Bountiful', 'UT', '9/16/23', '9/16/28', 'dry van'),
  r('TN Americas LLC', 'Jeremie Lanier', '1016603', 'Kevil', 'KY', '8/31/23', '8/31/28', 'dry van'),
  r('Tote Maritime', 'Jesse Starr', '1029291', 'Jacksonville', 'FL', '5/27/26', '5/27/31', 'dry van'),
  r('Textainer', 'Jessica Sanchez', '1000945', 'San Francisco', 'CA', '12/18/25', '12/18/30', 'dry van'),
  r('Independent Container Line', 'Joffrey Hoy', '1034826', 'Eddystone', 'PA', '12/23/25', '12/23/30', 'dry van'),
  r('Triton International', 'Jonathan Naulty', '1030374', 'Walnut Creek', 'CA', '3/25/25', '3/25/30', 'dry van'),
  r('Tahoma Global Logistics', 'Joseph Gordius', '1016370', 'Bonney Lake', 'WA', '11/14/23', '11/14/28', 'dry van'),
  r("Miller's Mobile Services Inc.", 'Kaden Knowles', '1037024', 'Jacksonville', 'FL', '12/18/25', '12/18/30', 'dry van'),
  r('U.S. Coast Guard', 'Kenenth Hoppe', '1016843', 'Yorktown', 'VA', '12/14/23', '12/14/28', 'dry van'),
  r('UAL America', 'Kristi Vestal', '1006749', 'Houston', 'TX', '5/12/26', '5/12/31', 'dry van'),
  r("Miller's Mobile Services Inc.", 'Kurt Miller', '1037023', 'Jacksonville', 'FL', '12/31/25', '12/31/30', 'dry van'),
  r('UCSD', 'Mark Gibaud', '1026005', 'Alpine,ca', 'CA', '12/17/24', '12/17/29', 'dry van'),
  r('Boatinspectusa.com LLC', 'Mark Hughes', '1018162', 'Alpharetta', 'GA', '12/21/23', '12/21/28', 'dry van'),
  r('ConGlobal Industries', 'Mark Mullins', '1013851', 'North Charleston', 'SC', '12/31/21', '12/31/26', 'dry van'),
  r('GSB Equipment LLC', 'Matthew Prausa', '1016183', 'Brightwood', 'OR', '4/5/23', '4/5/28', 'dry van'),
  r('Textainer', 'Michelle Orlando', '1016485', 'Toms River', 'NJ', '5/22/26', '5/22/31', 'dry van'),
  r('Hapag-Lloyd (America), LLC', 'Oycan Gurkan', '1013493', 'Atlanta', 'GA', '6/18/24', '6/18/29', 'dry van'),
  r('Textainer', 'Peter Brandon', '1012320', 'San Francisco', 'CA', '9/17/25', '9/17/30', 'dry van'),
  r('ConexTalk', 'Rebecca Bonomini', '1027164', 'Harrison', 'OH', '7/22/25', '7/22/30', 'dry van'),
  r('Triton International', 'Ricky Jimenez', '1023822', 'Beachwood', 'NJ', '4/25/25', '4/25/30', 'dry van'),
  r('Triton International', 'Samantha Weaver', '1018364', 'Edison', 'NJ', '3/31/25', '3/31/30', 'dry van'),
  r('Wainui Maritime', 'Tony Fergusson', '1016592', 'Savannah', 'GA', '9/11/23', '9/11/28', 'dry van'),
  r('Touax Container', 'Valentina Fraga', '1020631', 'Homestead', 'FL', '12/30/24', '12/30/29', 'dry van'),
  r('CakeBoxx Technologies LLC', 'Zhongyuan Peng', '1015150', 'McLean', 'VA', '6/10/22', '6/10/27', 'dry van'),
  r('Lilac Solutions Inc.', 'Charles Burgoon', '1015683', 'Oakland', 'CA', '7/26/22', '7/26/27', 'dry van'),
  r('Consolidated Chassis Management', 'Larry Thompson', '1001506', 'Kennedale', 'TX', '11/3/22', '11/3/27', 'chassis'),
  r('Consolidated Chassis Management', 'Michael Andrew', '1001528', 'Savannah', 'GA', '7/29/22', '7/29/27', 'chassis'),
  r('Consolidated Chassis Management', 'Ricky Rochester', '1006475', 'Newnan', 'GA', '12/22/25', '12/22/30', 'chassis'),
  r('', 'Craig Sinitzki', '1001500', 'Romeoville', 'IL', '7/27/22', '7/27/27', 'chassis'),
  r('Consolidated Chassis Management', 'David Green', '1006407', 'Easton', 'PA', '10/25/24', '10/25/29', 'chassis'),
  r('', 'Frederic Youngs', '1001512', 'Denver', 'CO', '11/14/22', '11/14/27', 'chassis'),
  r('Consolidated Chassis Management', 'John Russell', '1002103', 'Lawtey', 'FL', '5/30/23', '5/30/28', 'chassis'),
  r('', 'Lisa Willmann', '1001530', 'Dupo', 'IL', '10/12/22', '10/12/27', 'chassis'),
  r('Consolidated Chassis Management', 'Michael Greer', '1002382', 'Port Wentworth', 'GA', '10/13/23', '10/13/28', 'chassis'),
  r('', 'Seth Venable', '1001534', 'Mount Pleasant', 'SC', '11/9/22', '11/9/27', 'chassis'),
  r('', 'Charles Sapp', '1001055', 'Jacksonville', 'FL', '12/17/25', '12/17/30', 'chassis'),
  r('Consolidated Chassis Management', 'Eberto Enriquez Arita', '1001508', 'Kansas City', 'KS', '10/14/22', '10/14/27', 'chassis'),
  r('Consolidated Chassis Management', 'Jonathan Trusty', '1006556', 'North Charleston', 'SC', '10/12/21', '10/12/26', 'chassis'),
  r('Consolidated Chassis Management', 'Kevin Hord', '1006543', 'Austell', 'GA', '9/28/21', '9/28/26', 'chassis'),
  r('Consolidated Chassis Management', 'Martin Summers', '1001501', 'Crosby', 'TX', '10/14/22', '10/14/27', 'chassis'),
  r('Consolidated Chassis Management', 'Richard Barber', '1001529', 'Pembroke', 'GA', '11/12/22', '11/12/27', 'chassis'),
  r('Consolidated Chassis Management', 'Adam Levandusky', '1016804', 'Woodstock', 'GA', '9/5/23', '9/5/28', 'chassis'),
  r('', 'Alexander Aubuchon', '1010382', 'Savannah', 'GA', '6/16/25', '6/16/30', 'chassis'),
  r('Consolidated Chassis Management', 'Barry Simpson', '1020626', 'Savannah', 'GA', '9/30/24', '9/30/29', 'chassis'),
  r('', 'Bobby Smith', '1013857', 'McDonough', 'GA', '12/31/21', '12/31/26', 'chassis'),
  r('Pacific Crane Maintenance Co.', 'Bryan Bell', '1016101', 'Cypress', 'CA', '6/10/23', '6/10/28', 'chassis'),
  r('Direct Chassis Link Inc.', 'Daniel Baran', '1019586', 'Joliet', 'IL', '12/16/23', '12/16/28', 'chassis'),
  r('J T Intermodal Inc.', 'David Smith', '1013754', 'McDonough', 'GA', '12/31/21', '12/31/26', 'chassis'),
  r('Consolidated Chassis Management', 'Demetrios Miltiades', '1020583', 'Savannah', 'GA', '9/30/24', '9/30/29', 'chassis'),
  r('Consolidated Chassis Management', 'Doye Blane', '1016654', 'Douglasville', 'GA', '5/18/23', '5/18/28', 'chassis'),
  r('Consolidated Chassis Management', 'Drake Sims', '1016576', 'Southaven', 'MS', '5/25/23', '5/25/28', 'chassis'),
  r('ConGlobal Industries', 'Ernest Grizzard', '1012772', 'Pooler', 'GA', '4/19/23', '4/19/28', 'chassis'),
  r('Three Rivers Trucking', 'Ignacio Cabrera', '1026063', 'Carson ca.', 'CA', '12/27/24', '12/27/29', 'chassis'),
  r('Direct Chassis Link Inc.', 'Jeremy Tolleson', '1023826', 'Marion', 'AR', '6/21/25', '6/21/30', 'chassis'),
  r('Consolidated Chassis Management', 'Jimmy Goddard', '1020638', 'Jacksonville', 'FL', '9/3/24', '9/3/29', 'chassis'),
  r('Consolidated Chassis Management', 'John South', '1020619', 'Savannah', 'GA', '9/30/24', '9/30/29', 'chassis'),
  r('Cordele Refurbishment and Manufacturing', 'Joshua Pollock', '1015697', 'Americus', 'GA', '12/27/22', '12/27/27', 'chassis'),
  r('Arrowhead Intermodal Services, LLC', 'Kelly Sutton', '1013405', 'Edgerton', 'KS', '11/6/21', '11/6/26', 'chassis'),
  r('Consolidated Chassis Management', 'Kenneth Smallwood', '1015616', 'Dallas', 'GA', '9/16/22', '9/16/27', 'chassis'),
  r('', 'Louie Herrera', '1020644', 'San Gabriel', 'CA', '10/14/24', '10/14/29', 'chassis'),
  r('', 'Larry Combs', '1006529', 'Jesup', 'GA', '9/25/24', '9/25/29', 'chassis'),
  r('The Genset Pool', 'Michael Drew', '1015095', 'Union City', 'NJ', '3/7/22', '3/7/27', 'chassis'),
  r('Arrowhead Intermodal Services, LLC', 'Micheal Sierra', '1013409', 'Edgerton', 'KS', '11/6/21', '11/6/26', 'chassis'),
  r('FlexiVan', 'Nathaniel Snyder', '1020588', 'Gahanna', 'OH', '8/30/24', '8/30/29', 'chassis'),
  r('Consolidated Chassis Management', 'Philip Pace', '1020615', 'Savannah', 'GA', '10/7/25', '10/7/30', 'chassis'),
  r('Consolidated Chassis Management', 'Robert Dryja', '1020442', 'Manhattan', 'IL', '7/13/24', '7/13/29', 'chassis'),
  r('Consolidated Chassis Management', 'William Akins', '1034855', 'Senoia', 'GA', '11/24/25', '11/24/30', 'chassis'),
  r('Consolidated Chassis Management', 'Zachariah Paro', '1016505', 'Grover', 'NC', '4/17/23', '4/17/28', 'chassis'),
  r('Consolidated Chassis Management', 'James Cameron', '1020621', 'Savannah', 'GA', '9/30/24', '9/30/29', 'chassis'),
  r('Textainer', 'Anthony F. Gucciardi Jr.', '1000943', 'Cherry Hill', 'NJ', '12/16/25', '12/16/30', 'reefer'),
  r('Textainer', 'Benjamin Nero', '1029358', 'San Francisco', 'CA', '3/16/26', '3/16/31', 'reefer'),
  r('Textainer', 'Brad Bostdorff', '1000941', 'San Francisco', 'CA', '11/26/25', '11/26/30', 'reefer'),
  r('Triton International', 'Jonathan Naulty', '1030374', 'Walnut Creek', 'CA', '5/6/26', '5/6/31', 'reefer'),
  r('Textainer', 'Peter Brandon', '1012320', 'San Francisco', 'CA', '12/8/25', '12/8/30', 'reefer'),
  r('', 'Pawel Sypytkowski', '1012604', 'Bayonne', 'NJ', '6/25/22', '6/25/27', 'reefer'),
  r('Triton International', 'Ricky Jimenez', '1023822', 'Beachwood', 'NJ', '12/30/25', '12/30/30', 'reefer'),
];

/* ------------------------------------------------------------------ derived shapes */

export interface InspectorCredential {
  credential: CredentialType;
  certStart: string;
  certExpires: string;
  /** Four-digit year the credential is valid through, parsed from certExpires. */
  validThroughYear: number;
}

export interface Inspector {
  inspectionId: string;
  name: string;
  company: string;
  city: string;
  state: string;
  credentials: InspectorCredential[];
}

const throughYear = (certExpires: string): number => {
  const yy = Number(certExpires.split('/')[2]);
  return 2000 + yy;
};

/**
 * One entry per person, keyed by IICL inspection ID, credentials merged in row order. Location
 * and company come from the person's first row; the retrieved directory lists each multi-credential
 * inspector at the same company and city on every row, which inspectors.test.ts asserts.
 */
export const inspectors: Inspector[] = ((): Inspector[] => {
  const byId = new Map<string, Inspector>();
  for (const row of inspectorRows) {
    const cred: InspectorCredential = {
      credential: row.credential,
      certStart: row.certStart,
      certExpires: row.certExpires,
      validThroughYear: throughYear(row.certExpires),
    };
    const existing = byId.get(row.inspectionId);
    if (existing) existing.credentials.push(cred);
    else {
      byId.set(row.inspectionId, {
        inspectionId: row.inspectionId,
        name: row.name,
        company: row.company,
        city: row.city,
        state: row.state,
        credentials: [cred],
      });
    }
  }
  return [...byId.values()];
})();

/* ------------------------------------------------------------------ derived counts
   Every count the finder page states comes from here. None is hand-typed anywhere. */

/** Unique certified people in the US directory. */
export const inspectorCount = inspectors.length;

/** Total credentials held (a person certified for two equipment types counts twice here). */
export const credentialCount = inspectorRows.length;

export const dryVanInspectorCount = inspectorRows.filter((x) => x.credential === 'dry van').length;
export const chassisInspectorCount = inspectorRows.filter((x) => x.credential === 'chassis').length;
export const reeferInspectorCount = inspectorRows.filter((x) => x.credential === 'reefer').length;

/** States sorted A to Z, each with its inspectors sorted by name. The directory render order. */
export const inspectorsByState: { state: string; inspectors: Inspector[] }[] = ((): {
  state: string; inspectors: Inspector[];
}[] => {
  const byState = new Map<string, Inspector[]>();
  for (const ins of inspectors) {
    const list = byState.get(ins.state) ?? [];
    list.push(ins);
    byState.set(ins.state, list);
  }
  return [...byState.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([state, list]) => ({
      state,
      inspectors: [...list].sort((a, b) => a.name.localeCompare(b.name)),
    }));
})();

/** How many states have at least one listed inspector. */
export const stateCount = inspectorsByState.length;

/** Inspectors located in the OH/IN/KY home region. */
export const homeRegionInspectors: Inspector[] = inspectors.filter((ins) =>
  (HOME_REGION_STATES as readonly string[]).includes(ins.state));

export const homeRegionInspectorCount = homeRegionInspectors.length;

/** Display label for a credential type, for badges and legends. */
export const credentialLabel = (c: CredentialType): string =>
  c === 'dry van' ? 'Dry van' : c === 'chassis' ? 'Chassis' : 'Refrigerated';
