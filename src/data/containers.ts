// src/data/containers.ts

export interface ContainerSpecs {
  externalDims: string;
  internalDims: string;
  doorOpening: string;
  payload: string;
  tare: string;
  cubicCap: string;
}

export interface Container {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  keySpecs: [string, string, string];
  specs: ContainerSpecs;
  useCases: Array<{ title: string; body: string }>;
  compareNote: string;
  seo: { title: string; description: string };
}

export const containers: Container[] = [
  {
    slug: '20-foot-shipping-container',
    name: '20-Foot Shipping Container',
    shortName: '20ft',
    tagline: 'Fits a standard driveway. Stores a full garage.',
    keySpecs: ["20' × 8' × 8'6\"", '1,172 cu ft', "7'8\" door width"],
    specs: {
      externalDims: "20' L × 8' W × 8'6\" H",
      internalDims: "19'4\" L × 7'8\" W × 7'10\" H",
      doorOpening:  "7'8\" W × 7'5\" H",
      payload:      '47,900 lbs',
      tare:         '4,850 lbs',
      cubicCap:     '1,172 cu ft',
    },
    useCases: [
      { title: 'Farm & Ranch Storage',   body: "Secure, weatherproof storage for equipment, feed, and tools without a permanent structure permit in most counties." },
      { title: 'Construction Job Site',  body: "Lock up tools and materials on-site. The 20ft fits most job sites where a 40ft would block access." },
      { title: 'Backyard Workshop',      body: "Convert into a workshop, hobby room, or overflow storage. Fits most suburban lots and standard driveways." },
    ],
    compareNote: "Half the length of a 40ft — fits tighter spaces and costs less to deliver. Wind & Water Tight (used) — structurally sound and storage-ready.",
    seo: {
      title:       '20-Foot Shipping Container for Sale | Steel Box Direct',
      description: 'Buy a 20ft shipping container delivered within 250 miles of Cincinnati. Wind & Water Tight (used) — sound, storage-ready steel. Get a quote within 4 business hours.',
    },
  },
  {
    slug: '40-foot-shipping-container',
    name: '40-Foot Shipping Container',
    shortName: '40ft',
    tagline: 'Maximum storage. The industry standard for serious projects.',
    keySpecs: ["40' × 8' × 8'6\"", '2,390 cu ft', "7'8\" door width"],
    specs: {
      externalDims: "40' L × 8' W × 8'6\" H",
      internalDims: "39'5\" L × 7'8\" W × 7'10\" H",
      doorOpening:  "7'8\" W × 7'5\" H",
      payload:      '59,039 lbs',
      tare:         '8,160 lbs',
      cubicCap:     '2,390 cu ft',
    },
    useCases: [
      { title: 'Large Farm Operations', body: "Store tractors, implements, and seasonal equipment. Two 20ft worth of space in a single footprint with one door to manage." },
      { title: 'Commercial Storage',   body: "Inventory overflow, seasonal stock, or on-site warehousing. The 40ft is the industry standard for a reason." },
      { title: 'Permanent Structures', body: "The most popular base for container conversions — offices, workshops, and guest spaces. Enough room to split into zones." },
    ],
    compareNote: "Twice the storage of a 20ft — needs more clearance for delivery and placement. Wind & Water Tight (used) — structurally sound and storage-ready.",
    seo: {
      title:       '40-Foot Shipping Container for Sale | Steel Box Direct',
      description: 'Buy a 40ft shipping container delivered within 250 miles of Cincinnati. Wind & Water Tight (used) — sound, storage-ready steel. Flat-fee local delivery. Get a quote in 4 hours.',
    },
  },
  {
    slug: '40-foot-high-cube-container',
    name: '40-Foot High Cube Container',
    shortName: '40ft High Cube',
    tagline: 'A full foot of extra headroom. The 40ft, taller.',
    keySpecs: ["40' × 8' × 9'6\"", '2,694 cu ft', 'Wind & Water Tight (used)'],
    specs: {
      externalDims: "40' L × 8' W × 9'6\" H",
      internalDims: "39'5\" L × 7'8\" W × 8'10\" H",
      doorOpening:  "7'8\" W × 8'5\" H",
      payload:      '59,039 lbs',
      tare:         '8,160 lbs',
      cubicCap:     '2,694 cu ft',
    },
    useCases: [
      { title: 'Conversions & Builds',      body: "A full foot of extra headroom makes the High Cube the easiest 40ft to convert into a home, office, or studio — room for insulation, ceiling finishes, and lighting without losing standing height." },
      { title: 'Tall & Stacked Storage',    body: "The extra 9'6\" exterior height clears tall equipment, racking, and stacked pallets that won't fit a standard 40ft — ~2,694 cubic feet versus 2,390." },
      { title: 'Maximum Cubic Capacity',    body: "Same footprint as the standard 40ft, but the added height yields the most cubic capacity we offer — the right call when you're paying for volume, not floor space." },
    ],
    compareNote: "Same footprint as the standard 40ft, but a foot taller — the most headroom and cubic capacity we offer. Wind & Water Tight (used) — structurally sound and storage-ready.",
    seo: {
      title:       '40-Foot High Cube Shipping Container for Sale | Steel Box Direct',
      description: 'Buy a 40ft High Cube container delivered within 250 miles of Cincinnati. A full foot of extra headroom and ~2,694 cu ft. Wind & Water Tight (used) — sound, storage-ready steel. Get a quote in 4 hours.',
    },
  },
];
