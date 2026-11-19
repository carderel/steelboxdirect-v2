/**
 * QUOTE QUANTITY AND PER-CONTAINER SIZES: the shared vocabulary.
 *
 * Owner-approved change 2026-11-19 (a buyer sent the form twice, 20ft then 40ft, because the size
 * field took one answer). "How many?" on /quote/ is now 1, 2, 3, 4 or "5 or more". Picking 2 to 4
 * shows one size select per container: container 1 keeps name="size_preference" (the NOT NULL,
 * CHECK-constrained column), the others are size_2 .. size_4. "5 or more" shows a free-text
 * bulk_details box instead of extra selects.
 *
 * The old buckets ('2_4', '5_9', '10_19', '20_plus') are no longer offered but MUST stay readable:
 * stored leads, cached forms and imported seller emails still carry them. New values sort first.
 *
 * Pure module (no server imports) so the quote endpoint and any later reader can share it. Keep in sync with the <option> values in src/pages/quote/index.astro and
 * QUANTITY_BUCKET_MIN in src/lib/rto-eligibility.ts.
 */

export const QUANTITY_LABELS: Record<string, string> = {
  '1': '1 container',
  '2': '2 containers',
  '3': '3 containers',
  '4': '4 containers',
  '5_plus': '5 or more',
  // Legacy buckets (form before 2026-11-19).
  '2_4': '2 to 4',
  '5_9': '5 to 9',
  '10_19': '10 to 19',
  '20_plus': '20 or more',
};

/** Report / sort order: current form values first, then the legacy buckets. */
export const QUANTITY_ORDER = ['1', '2', '3', '4', '5_plus', '2_4', '5_9', '10_19', '20_plus'];

/** Size select names for containers 2..4. Container 1 is size_preference. */
export const EXTRA_SIZE_FIELDS = ['size_2', 'size_3', 'size_4'] as const;
export type ExtraSizeField = (typeof EXTRA_SIZE_FIELDS)[number];

/** How many size selects a quantity value carries: 2..4 for '2'..'4', otherwise 1. */
export function sizeSlotCount(quantity: unknown): number {
  const q = quantity === undefined || quantity === null ? '' : String(quantity);
  return q === '2' || q === '3' || q === '4' ? Number(q) : 1;
}

/**
 * One size per container, in form order. Container 1 is size_preference as sent. Extra selects are
 * not required (CSS show/hide cannot toggle `required`), so a blank or missing extra size is
 * 'not_sure'. Selects beyond the chosen quantity are ignored here (a buyer who picked 3, then went
 * back to 2, still submits size_3).
 */
export function containerSizes(data: { quantity?: unknown; size_preference?: unknown } & Partial<Record<ExtraSizeField, unknown>>): string[] {
  const first = data.size_preference === undefined || data.size_preference === null ? '' : String(data.size_preference);
  const sizes = [first];
  const slots = sizeSlotCount(data.quantity);
  for (let i = 1; i < slots; i++) {
    const v = data[EXTRA_SIZE_FIELDS[i - 1]];
    const t = typeof v === 'string' ? v.trim() : '';
    sizes.push(t || 'not_sure');
  }
  return sizes;
}

/**
 * "20ft x2, 40ft" from ['20ft', '40ft', '20ft']: each size once, first-seen order, with a count when
 * repeated. A single size reads exactly as before ("40ft"), so single-container emails, subjects
 * and the email importer are unchanged. `labels` swaps codes for display labels (buyer email).
 */
export function sizeSummary(sizes: string[], labels?: Record<string, string>): string {
  const counts = new Map<string, number>();
  for (const s of sizes) counts.set(s, (counts.get(s) ?? 0) + 1);
  return [...counts]
    .map(([s, n]) => {
      const shown = labels ? labels[s] || s.replace(/_/g, ' ') || 'Not sure yet' : s;
      return n > 1 ? `${shown} x${n}` : shown;
    })
    .join(', ');
}

/** The 5-or-more free text, trimmed; undefined when blank. A non-string becomes its JSON text. */
export function bulkDetailsText(v: unknown): string | undefined {
  if (v === undefined || v === null) return undefined;
  const t = (typeof v === 'string' ? v : JSON.stringify(v)).trim();
  return t || undefined;
}

/** Bulk details on one line (newlines become " / "), for the line-based seller email. */
export function bulkDetailsOneLine(v: unknown): string | undefined {
  const t = bulkDetailsText(v);
  return t ? t.split(/\s*\r?\n\s*/).filter(Boolean).join(' / ') : undefined;
}

/** Quantity label for display; a missing value reads as 1 container, an unknown one degrades. */
export function quantityLabel(quantity: unknown): string {
  if (quantity === undefined || quantity === null || quantity === '') return QUANTITY_LABELS['1'];
  const q = String(quantity);
  return QUANTITY_LABELS[q] || q.replace(/_/g, ' ');
}
