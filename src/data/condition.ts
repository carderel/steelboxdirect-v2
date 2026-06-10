// src/data/condition.ts
// SINGLE SOURCE OF TRUTH for container CONDITION messaging.
// We sell ONE grade. Change the wording here and it propagates everywhere
// that imports it — no more multi-file sweeps when the grade/positioning changes.

export const CONDITION = {
  /** Grade name on its own, e.g. for headings/prose. */
  grade: 'Wind & Water Tight',
  /** Short abbreviation. */
  abbr: 'WWT',
  /** Canonical label used in most copy. */
  label: 'Wind & Water Tight (used)',
  /** Standard marketing tail for body copy / compare notes. */
  blurb: 'Wind & Water Tight (used) — structurally sound and storage-ready.',
  /** Standard tail for SEO meta descriptions (slightly tighter). */
  seoTail: 'Wind & Water Tight (used) — sound, storage-ready steel.',
} as const;
