// src/data/stats.ts
// Quantitative claims used across pages. Keep them HERE with a basis/source note
// so they stay consistent and auditable — never bury an unsourced number in markup.
// If a figure can't be sourced, soften the wording or remove it (see the deleted "87%" stat).

export const STATS = {
  /** Used (Wind & Water Tight) vs. new (one-trip) container price. */
  usedSavingsVsNew: {
    value: '40–60%',
    /** Basis for the figure. Industry pricing range — verify before citing as hard fact. */
    basis: 'Industry estimate for used vs. new (one-trip) shipping-container pricing.',
  },
} as const;
