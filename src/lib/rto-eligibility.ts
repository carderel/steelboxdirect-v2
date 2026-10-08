/**
 * RENT-TO-OWN QUANTITY LIMIT: the single source of truth.
 *
 * Owner decision 2026-10-08, PENDING SUPPLIER CONFIRMATION: rent-to-own is for limited quantities.
 * Orders above this many containers get bulk / contract terms quoted by Doug instead. If the
 * supplier sets a different cap, change this one number; the quote form (client), the submit-quote
 * endpoint (server), the visible note and the seller email line all read it from here.
 */
export const RTO_MAX_QUANTITY = 4;

// Smallest unit count each /quote/ quantity bucket can mean. Keep in sync with the <option>
// values in src/pages/quote/index.astro and QUANTITY_POINTS in src/pages/api/submit-quote.ts.
const QUANTITY_BUCKET_MIN: Record<string, number> = {
  '1': 1,
  '2_4': 2,
  '5_9': 5,
  '10_19': 10,
  '20_plus': 20,
};

/**
 * True when the quantity bucket is entirely above the rent-to-own cap. A missing or unknown value
 * (old cached form, tampered body) is treated as one unit, so it never blocks rent-to-own and never
 * throws. A bucket that straddles the cap stays eligible: Doug can sort that out on the call, and
 * wrongly refusing a small order is the worse error.
 */
export function exceedsRtoQuantity(quantity: string | undefined | null): boolean {
  if (!quantity) return false;
  const min = QUANTITY_BUCKET_MIN[quantity];
  return min !== undefined && min > RTO_MAX_QUANTITY;
}

/** Buyer-facing note shown near the payment field when rent-to-own is disabled. */
export const RTO_QUANTITY_NOTE =
  `Rent-to-own covers orders of up to ${RTO_MAX_QUANTITY} containers. ` +
  `For ${RTO_MAX_QUANTITY + 1} or more, Doug will quote bulk terms.`;

/** Line added to the seller email when a buyer asked for rent-to-own on an over-cap order. */
export const RTO_BULK_SELLER_LINE =
  `Asked for rent-to-own on a ${RTO_MAX_QUANTITY + 1}+ order: quote bulk terms instead.`;
