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
export const referenceSizes: ReferenceSize[] = [
  {
    code: '10ft Std', label: '10ft Standard', sold: false,
    ext: `9'9.75" × 8'0" × 8'6"`, intL: `9'3"`, intW: `7'8.5"`, intH: `7'10.1"`,
    door: `7'8.1" × 7'5.8"`, capacity: '561 cu ft',
    note: 'Typically one-trip/new only; rarely available used.',
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
  { code: 'L', meaning: '45ft' },
];

// ISO 6346 size/type code: second char = height & width.
export const heightWidthCodes: SizeTypeCode[] = [
  { code: '0', meaning: `8'0" high` },
  { code: '2', meaning: `8'6" high (standard)` },
  { code: '4', meaning: `4'3" high (half-height)` },
  { code: '5', meaning: `9'6" high (high cube)` },
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
    body: `A container spends roughly 10-12 years in active maritime service, then can last 25+ years in static land use with basic maintenance. A Wind & Water Tight unit is retired from the sea, not worn out.`,
  },
  {
    title: 'Why used units are abundant',
    body: `North America imports far more containerized freight than it exports, and repositioning empty boxes back overseas costs more than building new ones. So shipping lines sell them off here, which is why a sound used container is widely available and a smart-value buy.`,
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
    a: `The 4-character size/type code sits below the ID. The first character is length (2 = 20ft, 4 = 40ft, L = 45ft), the second is height/width (2 = 8'6" standard, 5 = 9'6" high cube), and the last two describe the type (G1 = general-purpose dry van).`,
  },
  {
    q: 'What is the CSC plate on a shipping container?',
    a: `The CSC Safety Approval Plate, required under the IMO International Convention for Safe Containers, is the container's passport: it records structural approval and inspection history and stays with the unit into the used market.`,
  },
  {
    q: 'Is surface rust on a used container a problem?',
    a: `Usually not. Containers are built from Cor-Ten weathering steel that forms a protective patina, so surface rust is typically cosmetic. Every container we sell is Wind & Water Tight: structurally sound and sealed against rain, wind, snow, and pests.`,
  },
];
