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
    compareNote: "Half the length of a 40ft — fits tighter spaces and costs less to deliver.",
    seo: {
      title:       '20-Foot Shipping Container for Sale | Steel Box Direct',
      description: 'Buy a 20ft shipping container delivered within 250 miles of Cincinnati. Cargo-worthy and one-trip units available. Get a quote within 4 business hours.',
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
    compareNote: "Twice the storage of a 20ft — needs more clearance for delivery and placement.",
    seo: {
      title:       '40-Foot Shipping Container for Sale | Steel Box Direct',
      description: 'Buy a 40ft shipping container delivered within 250 miles of Cincinnati. Standard cargo-worthy units with flat-fee local delivery. Get a quote in 4 hours.',
    },
  },
  {
    slug: '40-foot-one-trip-container',
    name: '40-Foot One-Trip Container',
    shortName: '40ft One-Trip',
    tagline: 'Like new. One ocean crossing. Ready for anything.',
    keySpecs: ["40' × 8' × 8'6\"", '2,390 cu ft', 'Near-new condition'],
    specs: {
      externalDims: "40' L × 8' W × 8'6\" H",
      internalDims: "39'5\" L × 7'8\" W × 7'10\" H",
      doorOpening:  "7'8\" W × 7'5\" H",
      payload:      '59,039 lbs',
      tare:         '8,160 lbs',
      cubicCap:     '2,390 cu ft',
    },
    useCases: [
      { title: 'Conversions & Builds',      body: "The cleanest canvas for container homes, offices, and studios. No rust, no previous cargo residue, no surprises." },
      { title: 'Food & Sensitive Storage',  body: "When cargo-worthy just isn't clean enough. One-trip containers haven't carried anything other than their initial load." },
      { title: 'Long-Term Investment',      body: "Premium condition means lower maintenance over time. If it's staying on your property for 10+ years, one-trip is worth the premium." },
    ],
    compareNote: "Same footprint as the standard 40ft — premium condition, higher price point.",
    seo: {
      title:       '40-Foot One-Trip Shipping Container for Sale | Steel Box Direct',
      description: 'Buy a like-new 40ft one-trip container delivered within 250 miles of Cincinnati. One ocean crossing, near-perfect condition. Get a quote in 4 hours.',
    },
  },
];
