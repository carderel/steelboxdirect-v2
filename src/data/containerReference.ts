// src/data/containerReference.ts
// Single source of truth for the Container Reference hub + page enrichment.
// Sources (cite firsthand): ISO 668:2020 (dimensions/ratings), ISO 6346 (coding/marking),
// BIC (bic-code.org, owner-code registry), IMO CSC (safety-approval plate).
// Guardrail: SBD sells Wind & Water Tight (used) only; `sold:false` rows are informational, never offers. No prices.

export interface ReferenceSize {
  code: string;          // short label e.g. "20ft Std"
  label: string;         // full label e.g. "20ft Standard"
  sold: boolean;         // true = SBD sells this (WWT used)
  productSlug?: string;  // product page slug when sold
  ext: string;           // external L × W × H
  intL: string;          // internal length
  intW: string;          // internal width
  intH: string;          // internal height
  door: string;          // door opening W × H
  capacity: string;      // cubic capacity
  note?: string;         // caveat (availability, permit, etc.)
}

// Figures per ISO 668:2020 general-purpose containers (fuller precision than the
// rounded product-page specs. That is intentional; different audiences, no same-page clash).
// EXCEPTION: the 10ft row. ISO 668 defines the 10ft (1D) at 8'0" tall; the 8'6" 10ft that dealers
// actually sell is a common trade build, not an ISO 668 size, so its label says so (fact check
// 2026-10-13, ledger entry faq-10ft-size-condition-cost).
export const referenceSizes: ReferenceSize[] = [
  {
    code: '10ft Std', label: '10ft (common trade build, not ISO 668)', sold: false,
    ext: `9'9.75" × 8'0" × 8'6"`, intL: `9'3"`, intW: `7'8.5"`, intH: `7'10.1"`,
    door: `7'8.1" × 7'5.8"`, capacity: '561 cu ft',
    note: 'Far fewer 10ft containers are in circulation than 20ft or 40ft, so used ones are hard to find. A 10ft is a special request for us: ask and we will tell you what we can find.',
  },
  {
    code: '20ft Std', label: '20ft Standard', sold: true, productSlug: '20-foot-shipping-container',
    ext: `19'10.5" × 8'0" × 8'6"`, intL: `19'4.2"`, intW: `7'8.5"`, intH: `7'10.1"`,
    door: `7'8.1" × 7'5.8"`, capacity: '1,172 cu ft',
  },
  {
    code: '20ft HC', label: '20ft High Cube', sold: false,
    ext: `19'10.5" × 8'0" × 9'6"`, intL: `19'4.2"`, intW: `7'8.5"`, intH: `8'10.1"`,
    door: `7'8.1" × 8'5.8"`, capacity: '1,320 cu ft',
    note: 'Uncommon in the used market; usually one-trip/new.',
  },
  {
    code: '40ft Std', label: '40ft Standard', sold: true, productSlug: '40-foot-shipping-container',
    ext: `40'0" × 8'0" × 8'6"`, intL: `39'5.7"`, intW: `7'8.5"`, intH: `7'10.1"`,
    door: `7'8.1" × 7'5.8"`, capacity: '2,387 cu ft',
  },
  {
    code: '40ft HC', label: '40ft High Cube', sold: true, productSlug: '40-foot-high-cube-container',
    ext: `40'0" × 8'0" × 9'6"`, intL: `39'5.7"`, intW: `7'8.5"`, intH: `8'10.1"`,
    door: `7'8.1" × 8'5.8"`, capacity: '2,691 cu ft',
    note: 'In 40ft, the High Cube is more common than the standard height.',
  },
  {
    code: '45ft HC', label: '45ft High Cube', sold: false,
    ext: `45'0" × 8'0" × 9'6"`, intL: `44'5.7"`, intW: `7'8.5"`, intH: `8'10.1"`,
    door: `7'8.1" × 8'5.8"`, capacity: '3,037 cu ft',
    note: 'High-cube only; usually needs an oversize permit or extendable trailer to move.',
  },
];

export interface MarkingPart { part: string; detail: string }

// The 11-character container ID per ISO 6346 (owner code registered with BIC).
export const bicIdParts: MarkingPart[] = [
  { part: 'Owner Code (3 letters)', detail: 'The registered owner/operator prefix, issued through BIC (bic-code.org).' },
  { part: 'Equipment Category (1 letter)', detail: 'U = freight container · J = detachable freight-container equipment · Z = trailer or chassis.' },
  { part: 'Serial Number (6 digits)', detail: "The individual unit's number, assigned by the owner." },
  { part: 'Check Digit (1 boxed digit)', detail: 'A math-derived digit (shown in a box) that validates the other 10 characters.' },
];

export interface SizeTypeCode { code: string; meaning: string }

// ISO 6346 size/type code: first char = length.
export const lengthCodes: SizeTypeCode[] = [
  { code: '1', meaning: '10ft' },
  { code: '2', meaning: '20ft' },
  { code: '3', meaning: '30ft' },
  { code: '4', meaning: '40ft' },
  { code: 'L', meaning: '45ft (newer BIC tables list 45ft as 5; most 45ft boxes in service are still marked L, e.g. L5G1)' },
];

// ISO 6346 size/type code: second char = height & width.
export const heightWidthCodes: SizeTypeCode[] = [
  { code: '0', meaning: `8'0" high` },
  { code: '2', meaning: `8'6" high (standard)` },
  { code: '4', meaning: `9'0" high` },
  { code: '5', meaning: `9'6" high (high cube)` },
  { code: '8', meaning: `4'3" high (half-height)` },
  { code: '9', meaning: `4'0" high or less` },
  { code: 'C', meaning: `8'6" high & over 8' wide` },
];

// ISO 6346 size/type code: third & fourth chars = container type.
export const typeCodes: SizeTypeCode[] = [
  { code: 'G0 / G1', meaning: 'General-purpose dry van (G1 = passive-vented)' },
  { code: 'V0 / V2', meaning: 'Mechanically ventilated' },
  { code: 'U0 / U1', meaning: 'Open-top' },
  { code: 'P1 / P3', meaning: 'Flat rack / platform' },
];

export interface LifecycleFact { title: string; body: string }

// Qualitative only: no contested statistics (honors the uncited-stat rule).
export const lifecycleFacts: LifecycleFact[] = [
  {
    title: 'Built from weathering steel',
    body: `Shipping containers are made from Cor-Ten (weathering) steel, which forms a stable, non-porous patina as it ages. That's why the surface rust you see on a used box is usually cosmetic, not structural: the steel is protecting itself.`,
  },
  {
    title: 'Decades of service life',
    body: `A container spends years in active maritime service, then can serve for decades in static land use with basic maintenance. A Wind & Water Tight unit is retired from the sea, not worn out.`,
  },
  {
    title: 'Why used units are abundant',
    body: `North America imports far more containerized freight than it exports, and repositioning empty boxes back overseas costs more than building new ones. So shipping lines sell them off here, which is why a good used container is widely available and a smart-value buy.`,
  },
];

export interface RefFaq { q: string; a: string }

export const referenceFaqs: RefFaq[] = [
  {
    q: 'What do the numbers on a shipping container mean?',
    a: `Every container carries an 11-character ID under ISO 6346: a 3-letter owner code registered with BIC, a 1-letter equipment category (U for freight containers), a 6-digit serial number, and a boxed check digit that validates the rest.`,
  },
  {
    q: 'How do I read a container\'s size and type code?',
    a: `The 4-character size/type code sits below the ID. The first character is length (2 = 20ft, 4 = 40ft, L = 45ft; newer BIC tables list 45ft as 5, but most 45ft boxes in service are still marked L, e.g. L5G1), the second is height/width (2 = 8'6" standard, 5 = 9'6" high cube), and the last two describe the type (G1 = general-purpose dry van).`,
  },
  {
    q: 'What is the CSC plate on a shipping container?',
    a: `The CSC Safety Approval Plate, required under the IMO International Convention for Safe Containers, is the container's passport: it records structural approval and inspection history and stays with the unit into the used market.`,
  },
  {
    q: 'Is surface rust on a used container a problem?',
    a: `Usually not. Containers are built from Cor-Ten weathering steel that forms a protective patina, so surface rust is typically cosmetic. Every container we stock is Wind & Water Tight: it keeps out rain, wind, snow, and pests, with no holes and doors that seal.`,
  },
  // Added 2026-10-27 (T-220). Wording checked against the calculator page and the ISO 6346 post
  // FAQs so no question repeats theirs.
  {
    q: 'Can the check digit catch a wrong container number?',
    a: `Usually, yes. Each of the first 10 characters becomes a number and is weighted by its position. The total is divided by 11, and the remainder is the check digit, with a remainder of 10 written as 0. Most typos change the result, so the number stops matching.`,
  },
  {
    q: 'What does 45G1 mean on a shipping container?',
    a: `It is the size and type code. The 4 means 40ft long. The 5 means 9'6" high, which is a high cube. G1 means general purpose with passive vents. So 45G1 is a standard 40ft high cube.`,
  },
  {
    q: 'What is the difference between max gross, tare, and payload?',
    a: `Max gross is the most the container and its cargo may weigh together. Tare is the weight of the empty container. Payload is max gross minus tare: the cargo weight marked for that unit when it ships.`,
  },
  {
    q: 'What if a used container has no CSC plate?',
    a: `For storage, it does not matter. The CSC plate is required for containers in international transport. It is not needed for storage or for a truck delivery that stays within the United States. If you plan to ship a box overseas, ask about the plate before you buy.`,
  },
];

// ---------------------------------------------------------------------------------------------
// Markings expansion (T-220, owner approved 2026-10-27). Additions only: above this block, only
// four FAQs were appended to referenceFaqs. Plain, short sentences. No owner names from BIC data, no weights, no prices.
// ---------------------------------------------------------------------------------------------

export const ISO6346_CALCULATOR_PATH = '/iso-6346-check-digit-calculator/';
export const BIC_REGISTER_URL = 'https://www.bic-code.org/bic-codes/';
export const BIC_SIZE_TYPE_URL = 'https://www.bic-code.org/size-type-code/';
export const CSC_GUIDE_PLATE_PATH = '/container-certification-guide/#plate';
export const BIC_LOOKUPS_POST_PATH = '/blog/check-used-container-identity-free-bic-lookups/';

// Product pages linked from the markings tables (T-220 internal-linking pass).
const PRODUCT_20_STD = '/shipping-containers-for-sale/20-foot-shipping-container/';
const PRODUCT_40_STD = '/shipping-containers-for-sale/40-foot-shipping-container/';
const PRODUCT_40_HC = '/shipping-containers-for-sale/40-foot-high-cube-container/';

// Optional in-text link: linkText must appear verbatim inside the row's meaning; the page wraps
// that substring and fails the build if it is missing, so copy edits cannot silently drop a link.
export interface InlineLink { href: string; linkText: string }

// Short body copy for the markings section. Linked sentences are split into lead / link / tail so
// the page can wrap only the link text and the sentence still reads as one line of copy.
export interface LinkedLine { lead: string; link: string; tail: string }

export const markingsCopy = {
  calculator: { lead: 'Have a container number? Check it in seconds with our ', link: 'free check digit calculator', tail: '.' } as LinkedLine,
  calculatorButton: 'Check a container number',
  ownerLookup: { lead: 'To see who owns a prefix, ', link: 'search the BIC register', tail: '.' } as LinkedLine,
  bicGuide: { lead: 'Our guide to ', link: 'free BIC lookups for a used container', tail: ' walks through it.' } as LinkedLine,
  exampleH: 'A worked example: CSQU 305438 3, 45G1',
  exampleIntro: 'Here is one full set of markings, read part by part. The ID is a widely used example number. We paired it with a 45G1 code to show both parts together.',
  exampleOutro: { lead: 'Want to see the check digit math? Run this number through the ', link: 'check digit calculator', tail: ' for the full arithmetic.' } as LinkedLine,
  commonCodesH: 'Common full size and type codes',
  commonCodesIntro: 'You will see these full codes most often. Each one reads left to right, using the parts above.',
  commonCodesSource: { lead: 'These codes come from ISO 6346. The BIC publishes the code parts on its ', link: 'size and type code page', tail: '.' } as LinkedLine,
  weightH: 'Weight and capacity markings',
  weightIntro: 'Most containers also show weight and volume markings on the doors.',
  weightBuyer: 'For a buyer, tare is usually the number to know. It is what the empty box weighs on the delivery truck. Payload is the cargo limit marked for shipping.',
  cscFieldsIntro: 'The plate records:',
  cscScope: 'The plate is about international shipping. Our used Wind & Water Tight containers are sold for storage and are not certified for ocean shipping.',
  cscGuide: { lead: 'For more on the plate and who needs one, see our ', link: 'container certification guide', tail: '.' } as LinkedLine,
};

// The worked example. The ID is the widely cited ISO 6346 example (Wikipedia); its check digit is
// asserted at build time against src/lib/iso6346.ts by the page, so the copy cannot drift.
export interface ExampleRow { chars: string; part: string; meaning: string; link?: InlineLink }

export const workedExample = {
  id: 'CSQU3054383',
  display: 'CSQU 305438 3',
  sizeType: '45G1',
  rows: [
    { chars: 'CSQ', part: 'Owner code', meaning: 'The 3-letter prefix registered with BIC.' },
    { chars: 'U', part: 'Category', meaning: 'U means a freight container.' },
    { chars: '305438', part: 'Serial number', meaning: "This unit's number in the owner's fleet." },
    { chars: '3', part: 'Check digit', meaning: 'Worked out from the 10 characters before it. It is shown in a box.' },
    { chars: '4', part: 'Length', meaning: '40ft long.' },
    { chars: '5', part: 'Height', meaning: `9'6" high, which is a high cube.`, link: { href: PRODUCT_40_HC, linkText: 'high cube' } },
    { chars: 'G1', part: 'Type', meaning: 'General purpose, with passive vents.' },
  ] as ExampleRow[],
};

// Common full size/type codes. Each meaning is assembled from the code parts above.
export const commonSizeTypeCodes: (SizeTypeCode & { link?: InlineLink })[] = [
  { code: '22G1', meaning: `20ft standard, 8'6" high, general purpose with vents`, link: { href: PRODUCT_20_STD, linkText: '20ft standard' } },
  { code: '42G1', meaning: `40ft standard, 8'6" high, general purpose with vents`, link: { href: PRODUCT_40_STD, linkText: '40ft standard' } },
  { code: '45G1', meaning: `40ft high cube, 9'6" high, general purpose with vents`, link: { href: PRODUCT_40_HC, linkText: '40ft high cube' } },
  { code: 'L5G1', meaning: `45ft high cube, 9'6" high, general purpose with vents` },
  { code: '22U1', meaning: '20ft open top' },
  { code: '22P1', meaning: '20ft flat rack with fixed ends' },
  { code: '22R1', meaning: '20ft refrigerated container (reefer)' },
];

// Door weight and capacity markings. Deliberately no figures: weights differ by unit.
export const weightMarkings: SizeTypeCode[] = [
  { code: 'MAX GROSS', meaning: 'The most the container and its cargo may weigh together.' },
  { code: 'TARE', meaning: 'The weight of the empty container.' },
  { code: 'PAYLOAD (or NET)', meaning: 'The cargo weight marked for that unit when it ships. It equals max gross minus tare.' },
  { code: 'CU. CAP.', meaning: 'The inside volume, usually shown in cubic meters and cubic feet.' },
];

// What the CSC Safety Approval Plate records (IMO CSC 1972, Annex I).
export const cscPlateFields: string[] = [
  'The country of approval and the approval reference',
  'The date of manufacture',
  "The manufacturer's identification number for the container",
  'The maximum operating gross mass',
  'The allowable stacking load',
  'The transverse racking test load',
  'An examination date, or an ACEP number if the container is on an approved continuous examination program',
];
