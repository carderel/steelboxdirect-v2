// src/data/containers.ts
import type { ImageMetadata } from 'astro';
import { CONDITION } from './condition';
import interimHeroPhoto from '../assets/photos/container-blue-weathered.jpg';

export interface SpecSource {
  /** Who published the figure. */
  label: string;
  url: string;
  /** What this source backs, and anything a reviewer needs to know about it. */
  covers: string;
}

export interface ContainerSpecs {
  externalDims: string;
  internalDims: string;
  doorOpening: string;
  /**
   * TYPICAL payload for a current unit of this size, as a range across carrier spec sheets. Never a
   * promise for a specific box: used units vary by build and rating, and the CSC plate on the door
   * is the authority. Render it with SPEC_WEIGHT_NOTE wherever it is shown.
   */
  payload: string;
  /** TYPICAL tare (empty) weight, as a range. Same caveat and same note as payload. */
  tare: string;
  cubicCap: string;
  /** Where the figures in this block come from. The facts audit of 2026-10-08 traced each one. */
  sources: SpecSource[];
}

export interface Container {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  /** Derived from specs by keySpecsFor() below. Never typed: it used to repeat specs by hand. */
  keySpecs: [string, string, string];
  specs: ContainerSpecs;
  useCases: Array<{ title: string; body: string }>;
  compareNote: string;
  seo: { title: string; description: string };
  /**
   * Real photo only, never AI-generated (see the product overhaul spec, section 7).
   * Typed as ImageMetadata because photos ship as imported src/assets files rendered
   * through astro:assets Image (the farmers-page pattern), not public-path strings.
   * All three containers currently share INTERIM_HERO_PHOTO below, a real 40ft
   * photograph, honestly captioned as such until per-size yard photos replace it.
   */
  heroPhoto?: { src: ImageMetadata; alt: string; caption?: string };
}

/**
 * THE WEIGHT CAVEAT, one string so every surface that shows payload or tare says the same thing.
 * The figures are typical values from carrier spec sheets, not a rating for the box a buyer gets:
 * a used unit can carry an older, lower rating (some older 20ft boxes were rated at 24,000 kg gross).
 */
export const SPEC_WEIGHT_NOTE =
  'Payload and tare are typical figures from carrier spec sheets and vary by box; the CSC plate on the door is the authority for yours.';

/**
 * SPEC SOURCES. Dimensions and capacity are ISO 668 general-purpose figures (the full ISO table
 * lives in containerReference.ts) and match the carrier sheets below (CMA CGM: 33.2 / 67.7 / 76.3 m3). Weights are the typical ranges across the Maersk
 * and CMA CGM sheets, converted from kg at 2.2046 lb/kg and rounded to the nearest ten pounds.
 * Hapag-Lloyd was checked too, but its pages refuse automated fetches, so it is not cited here.
 */
const MAERSK_DRY_SPECS: SpecSource = {
  label: 'Maersk, dry container equipment specifications (PDF)',
  url: 'https://www.maersk.com/~/media_sc9/maersk/local-information/files/africa/south-africa/important-information/container-type-and-sizes/dry-equipment-specifications-updated.pdf',
  covers: 'Tare, max gross and payload by size; interior dimensions and door opening. Undated; fetched 2026-10-08.',
};
const CMA_CGM_CONTAINERS: SpecSource = {
  label: 'CMA CGM, container specifications',
  url: 'https://www.cma-cgm.com/products-services/containers',
  covers: 'Tare, payload, capacity in m3 and dimensions by size. Fetched 2026-10-08.',
};
const SPEC_SOURCES: SpecSource[] = [MAERSK_DRY_SPECS, CMA_CGM_CONTAINERS];

/**
 * Interim listing photo, one real photograph for all three sizes. This is the blue
 * weathered 40ft that served as the live homepage photo for months, so it is a real
 * unit, not a render. The alt and caption both say a 40ft is shown so the 20ft and
 * High Cube pages never imply the photo is their own size. Swap per size when the
 * yard photos land, then delete this constant.
 */
const INTERIM_HERO_PHOTO: NonNullable<Container['heroPhoto']> = {
  src: interimHeroPhoto,
  alt: 'Used Wind and Water Tight shipping container on a delivery trailer (40ft High Cube shown)',
  caption: '40ft High Cube shown. Yard photos of each size are coming.',
};

export const containers: Container[] = [
  {
    slug: '20-foot-shipping-container',
    name: '20-Foot Shipping Container',
    shortName: '20ft',
    tagline: 'Fits a standard driveway. Stores a full garage.',
    keySpecs: ['', '', ''], // filled from specs below
    specs: {
      externalDims: "20' L × 8' W × 8'6\" H",
      internalDims: "19'4\" L × 7'8\" W × 7'10\" H",
      doorOpening:  "7'8\" W × 7'5\" H",
      // Maersk / CMA CGM, 30,480 kg max gross: payload 28,130 to 28,250 kg, tare 2,230 to 2,350 kg.
      payload:      '62,020 to 62,280 lbs',
      tare:         '4,920 to 5,180 lbs',
      cubicCap:     '1,172 cu ft',
      sources:      SPEC_SOURCES,
    },
    useCases: [
      { title: 'Farm & Ranch Storage',   body: "Secure, weatherproof storage for equipment, feed, and tools. Sealed steel and lockable doors keep weather and pests out." },
      { title: 'Construction Job Site',  body: "Lock up tools and materials on-site. The 20ft fits most job sites where a 40ft would block access." },
      { title: 'Backyard Workshop',      body: "Convert into a workshop, hobby room, or overflow storage. Fits most suburban lots and standard driveways." },
    ],
    compareNote: `Half the length of a 40ft, so it fits tighter spaces and costs less to deliver. ${CONDITION.blurb}`,
    seo: {
      title:       'Used 20ft Shipping Container for Sale',
      description: `Buy a 20ft shipping container delivered within 250 miles of Cincinnati. ${CONDITION.seoTail} Get a quote in 4 business hours.`,
    },
    heroPhoto: INTERIM_HERO_PHOTO,
  },
  {
    slug: '40-foot-shipping-container',
    name: '40-Foot Shipping Container',
    shortName: '40ft',
    tagline: 'Maximum storage. The industry standard for serious projects.',
    keySpecs: ['', '', ''], // filled from specs below
    specs: {
      externalDims: "40' L × 8' W × 8'6\" H",
      internalDims: "39'5\" L × 7'8\" W × 7'10\" H",
      doorOpening:  "7'8\" W × 7'5\" H",
      // Maersk / CMA CGM: payload 26,760 to 28,800 kg (30,480 or 32,500 kg max gross), tare 3,700 to 3,750 kg.
      payload:      '59,000 to 63,490 lbs',
      tare:         '8,160 to 8,270 lbs',
      cubicCap:     '2,390 cu ft',
      sources:      SPEC_SOURCES,
    },
    useCases: [
      { title: 'Large Farm Operations', body: "Store tractors, implements, and seasonal equipment. Two 20ft worth of space in a single footprint with one door to manage." },
      { title: 'Commercial Storage',   body: "Inventory overflow, seasonal stock, or on-site warehousing. The 40ft is the industry standard for a reason." },
      { title: 'Container Conversions', body: "The most popular base for container conversions: offices, workshops, and guest spaces. Enough room to split into zones." },
    ],
    compareNote: `Twice the storage of a 20ft, but it needs more clearance for delivery and placement. ${CONDITION.blurb}`,
    seo: {
      title:       'Used 40ft Shipping Container for Sale',
      description: `Buy a 40ft container delivered within 250 miles of Cincinnati. ${CONDITION.seoTail} Quote in 4 business hours.`,
    },
    heroPhoto: INTERIM_HERO_PHOTO,
  },
  {
    slug: '40-foot-high-cube-container',
    name: '40-Foot High Cube Container',
    shortName: '40ft High Cube',
    tagline: 'A full foot of extra headroom. The 40ft, taller.',
    keySpecs: ['', '', ''], // filled from specs below
    specs: {
      externalDims: "40' L × 8' W × 9'6\" H",
      internalDims: "39'5\" L × 7'8\" W × 8'10\" H",
      doorOpening:  "7'8\" W × 8'5\" H",
      // Maersk / CMA CGM: payload 26,580 to 28,620 kg (30,480 or 32,500 kg max gross), tare 3,880 to 3,900 kg.
      // Its own figures, not a copy of the standard 40ft: the extra foot of steel weighs about 400 lb.
      payload:      '58,600 to 63,100 lbs',
      tare:         '8,550 to 8,600 lbs',
      cubicCap:     '2,694 cu ft',
      sources:      SPEC_SOURCES,
    },
    useCases: [
      { title: 'Conversions & Builds',      body: "A full foot of extra headroom makes the High Cube the easiest 40ft to convert into a home, office, or studio: room for insulation, ceiling finishes, and lighting without losing standing height." },
      { title: 'Tall & Stacked Storage',    body: "The extra 9'6\" exterior height clears tall equipment, racking, and stacked pallets that won't fit a standard 40ft: ~2,694 cubic feet versus 2,390." },
      { title: 'Maximum Cubic Capacity',    body: "Same footprint as the standard 40ft, but the added height yields the most cubic capacity we offer. It's the right call when you're paying for volume, not floor space." },
    ],
    compareNote: `Same footprint as the standard 40ft, but a foot taller, with the most headroom and cubic capacity we offer. ${CONDITION.blurb}`,
    seo: {
      title:       '40-Foot High Cube Shipping & Storage Container for Sale',
      description: `Buy a 40ft High Cube delivered within 250 miles of Cincinnati: a foot more headroom, ~2,694 cu ft. ${CONDITION.label} steel. Quote in 4 business hours.`,
    },
    heroPhoto: INTERIM_HERO_PHOTO,
  },
];

/* ------------------------------------------------------------------ derived geometry
 *
 * Every square foot figure on the site is COMPUTED here from the dimension strings above, never
 * typed. The facts audit of 2026-10-08 found pages calling 160 and 320 sq ft "floor space": those
 * are the OUTSIDE footprint (20 x 8, 40 x 8). The floor you can actually use is the interior
 * length times the interior width, about 148 and 302 sq ft. Both are exported, under names that
 * say which is which, so a page has to choose on purpose.
 */

/** The separator in the dimension strings: U+00D7, the multiplication sign. */
const DIM_SEP = '\u00D7';

export type Axis = 'L' | 'W' | 'H';

/**
 * Split a dimension string such as `19'4" L x 7'8" W x 7'10" H` into its axes. Throws on a segment
 * it cannot read, so a malformed edit above fails the build instead of rendering a blank.
 */
export function dimAxes(value: string): Partial<Record<Axis, string>> {
  const out: Partial<Record<Axis, string>> = {};
  for (const part of value.split(DIM_SEP)) {
    const m = part.trim().match(/^(.+?)\s+([LWH])$/);
    if (!m) throw new Error(`containers.ts: cannot read an axis out of "${part.trim()}"`);
    out[m[2] as Axis] = m[1];
  }
  return out;
}

/** One axis of a dimension string, throwing if it is not there. */
export function dimAxis(value: string, axis: Axis): string {
  const v = dimAxes(value)[axis];
  if (!v) throw new Error(`containers.ts: "${value}" has no ${axis} axis`);
  return v;
}

/** Feet and inches to decimal feet: `19'4"` gives 19.333, `8'` gives 8. */
export function feetFromDim(dim: string): number {
  const m = dim.trim().match(/^(\d+)'\s*(?:(\d+(?:\.\d+)?)")?$/);
  if (!m) throw new Error(`containers.ts: cannot read feet and inches out of "${dim}"`);
  return Number(m[1]) + (m[2] ? Number(m[2]) / 12 : 0);
}

/** Usable INTERIOR floor area, whole square feet: interior length x interior width. */
export function interiorFloorSqFt(c: Container): number {
  const v = c.specs.internalDims;
  return Math.round(feetFromDim(dimAxis(v, 'L')) * feetFromDim(dimAxis(v, 'W')));
}

/** OUTSIDE footprint, whole square feet: external length x external width. Not floor space. */
export function footprintSqFt(c: Container): number {
  const v = c.specs.externalDims;
  return Math.round(feetFromDim(dimAxis(v, 'L')) * feetFromDim(dimAxis(v, 'W')));
}

/** Cubic capacity as a number, read from the cubicCap string. */
export function cubicFeet(c: Container): number {
  const m = c.specs.cubicCap.match(/^([\d,]+)\s*cu ft$/);
  if (!m) throw new Error(`containers.ts ${c.slug}: cannot read cubic feet out of "${c.specs.cubicCap}"`);
  return Number(m[1].replace(/,/g, ''));
}

/** A weight range string such as `4,920 to 5,180 lbs` as [low, high] pounds. */
export function weightRangeLbs(value: string): [number, number] {
  const m = value.match(/^([\d,]+)(?:\s+to\s+([\d,]+))?\s*lbs$/);
  if (!m) throw new Error(`containers.ts: cannot read a weight out of "${value}"`);
  const lo = Number(m[1].replace(/,/g, ''));
  return [lo, m[2] ? Number(m[2].replace(/,/g, '')) : lo];
}

/** Whole number with thousands separators, e.g. 1172 gives 1,172. */
export function formatSqFt(n: number): string {
  return n.toLocaleString('en-US');
}

export const CONTAINER_SLUGS = {
  '20ft': '20-foot-shipping-container',
  '40ft': '40-foot-shipping-container',
  '40ftHC': '40-foot-high-cube-container',
} as const;

export function containerBySlug(slug: string): Container {
  const c = containers.find((x) => x.slug === slug);
  if (!c) throw new Error(`containers.ts: no container with slug "${slug}"`);
  return c;
}

/**
 * keySpecs, derived. The first two used to repeat externalDims and cubicCap by hand, and the third
 * repeated the door width; all three now come from the spec block so they cannot disagree with it.
 * The High Cube keeps the condition label in the third slot, as it always has.
 */
for (const c of containers) {
  const ext = c.specs.externalDims;
  c.keySpecs = [
    `${dimAxis(ext, 'L')} ${DIM_SEP} ${dimAxis(ext, 'W')} ${DIM_SEP} ${dimAxis(ext, 'H')}`,
    c.specs.cubicCap,
    c.slug === CONTAINER_SLUGS['40ftHC'] ? CONDITION.label : `${dimAxis(c.specs.doorOpening, 'W')} door width`,
  ];
}
