// src/data/stats.ts
// Quantitative claims used across pages. Keep them HERE with a basis/source note
// so they stay consistent and auditable. Never bury an unsourced number in markup.
// If a figure can't be sourced, soften the wording or remove it (see the deleted "87%" stat).

export const STATS = {
  /**
   * Used (Wind & Water Tight) vs. new (one-trip) container price, stated QUALITATIVELY.
   * It was "40-60%" until the 2026-10-08 facts audit: the basis note said "verify before citing as
   * hard fact", no citation was ever found, and /cost/ contradicted it with "50%". The direction
   * (used costs less than new) is not in doubt; the size of the gap had no source, so it is gone.
   * `phrase` is written to complete "...steel, ___." and "Costs ___." on the consuming surfaces.
   */
  usedVsNew: {
    phrase: 'less than a new one-trip unit',
    basis: 'Direction only. No sourced figure for the size of the used-to-new price gap.',
  },
} as const;

/**
 * SOURCED PERCENTAGE REGISTRY.
 *
 * The only percentages and "1 in N" figures allowed in rendered copy. Enforced by
 * src/lib/compliance/spec-claims-guard.test.ts, which fails on any percentage in source or in the
 * built HTML that no entry here accounts for. Keep it SMALL: an entry is a claim the site can prove
 * at a URL, or a contractual term the site publishes as a term rather than as a statistic.
 *
 * Each entry matches by the exact figure plus a context pattern that must appear within the same
 * stretch of text, so "20%" is allowed beside "down" and nowhere else.
 */
export interface SourcedFigure {
  id: string;
  /** The figure exactly as it renders, e.g. "20%". */
  figure: string;
  /** Must also match the surrounding text (about 160 characters either side). */
  context: RegExp;
  /** Where the figure is proved. A public URL, always. */
  sourceUrl: string;
  /** What kind of figure it is and who owns it. */
  note: string;
}

export const SOURCED_FIGURES: SourcedFigure[] = [
  {
    id: 'rto-remote-down-payment',
    figure: '20%',
    context: /\bdown\b|down payment|rent[- ]to[- ]own|\brequire\b/i,
    sourceUrl: 'https://steelboxdirect.com/rent-to-own/',
    note: 'Contract term, not a statistic. Single source: RTO_TERMS.remoteDownPayment in src/data/rtoTerms.ts.',
  },
  {
    id: 'terms-cancellation-fee',
    figure: '10%',
    context: /cancellation fee/i,
    sourceUrl: 'https://steelboxdirect.com/terms/',
    note: 'Contract term from the Freedom Conex terms adopted on /terms/. Not a statistic.',
  },
  {
    id: 'boxtech-coverage-2019',
    figure: '45%',
    context: /BoxTech/,
    sourceUrl: 'https://assets.publishing.service.gov.uk/media/5f242082e90e071a603d3402/MIN_633.pdf',
    note: 'Quoted verbatim from UK MCA Marine Information Note MIN 633 (M), July 2020, section 2.3.',
  },
];
