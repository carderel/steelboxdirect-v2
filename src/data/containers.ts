// src/data/containers.ts
import type { ImageMetadata } from 'astro';
import { CONDITION } from './condition';
import interimHeroPhoto from '../assets/photos/container-blue-weathered.jpg';

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
      { title: 'Farm & Ranch Storage',   body: "Secure, weatherproof storage for equipment, feed, and tools. Sealed steel and lockable doors keep weather and pests out." },
      { title: 'Construction Job Site',  body: "Lock up tools and materials on-site. The 20ft fits most job sites where a 40ft would block access." },
      { title: 'Backyard Workshop',      body: "Convert into a workshop, hobby room, or overflow storage. Fits most suburban lots and standard driveways." },
    ],
    compareNote: `Half the length of a 40ft, so it fits tighter spaces and costs less to deliver. ${CONDITION.blurb}`,
    seo: {
      title:       'Used 20ft Shipping Container for Sale | Steel Box Direct',
      description: `Buy a 20ft shipping container delivered within 250 miles of Cincinnati. ${CONDITION.seoTail} Get a quote within 4 business hours.`,
    },
    heroPhoto: INTERIM_HERO_PHOTO,
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
      { title: 'Container Conversions', body: "The most popular base for container conversions: offices, workshops, and guest spaces. Enough room to split into zones." },
    ],
    compareNote: `Twice the storage of a 20ft, but it needs more clearance for delivery and placement. ${CONDITION.blurb}`,
    seo: {
      title:       'Used 40ft Shipping Container for Sale | Steel Box Direct',
      description: `Buy a 40ft shipping container delivered within 250 miles of Cincinnati. ${CONDITION.seoTail} Flat-fee local delivery. Get a quote in 4 hours.`,
    },
    heroPhoto: INTERIM_HERO_PHOTO,
  },
  {
    slug: '40-foot-high-cube-container',
    name: '40-Foot High Cube Container',
    shortName: '40ft High Cube',
    tagline: 'A full foot of extra headroom. The 40ft, taller.',
    keySpecs: ["40' × 8' × 9'6\"", '2,694 cu ft', CONDITION.label],
    specs: {
      externalDims: "40' L × 8' W × 9'6\" H",
      internalDims: "39'5\" L × 7'8\" W × 8'10\" H",
      doorOpening:  "7'8\" W × 8'5\" H",
      payload:      '59,039 lbs',
      tare:         '8,160 lbs',
      cubicCap:     '2,694 cu ft',
    },
    useCases: [
      { title: 'Conversions & Builds',      body: "A full foot of extra headroom makes the High Cube the easiest 40ft to convert into a home, office, or studio: room for insulation, ceiling finishes, and lighting without losing standing height." },
      { title: 'Tall & Stacked Storage',    body: "The extra 9'6\" exterior height clears tall equipment, racking, and stacked pallets that won't fit a standard 40ft: ~2,694 cubic feet versus 2,390." },
      { title: 'Maximum Cubic Capacity',    body: "Same footprint as the standard 40ft, but the added height yields the most cubic capacity we offer. It's the right call when you're paying for volume, not floor space." },
    ],
    compareNote: `Same footprint as the standard 40ft, but a foot taller, with the most headroom and cubic capacity we offer. ${CONDITION.blurb}`,
    seo: {
      title:       '40-Foot High Cube Shipping & Storage Container for Sale | Steel Box Direct',
      description: `Buy a 40ft High Cube container delivered within 250 miles of Cincinnati. A full foot of extra headroom and ~2,694 cu ft. ${CONDITION.seoTail} Get a quote in 4 hours.`,
    },
    heroPhoto: INTERIM_HERO_PHOTO,
  },
];
