/**
 * US phone validation shared by /api/submit-quote (quote and callback paths) and the form markup.
 *
 * Added 2026-11-20 after a live lead arrived with phone "225": Doug cannot call a lead like that,
 * and there was no check beyond "field present". Rules:
 * - strip everything but digits;
 * - accept 10 digits, or 11 starting with 1 (the country code is dropped);
 * - NANP: area code and exchange must each start with 2-9;
 * - reject one digit repeated ten times (5555555555 and friends).
 * Returns the normalized 10 digits, or null when the number cannot be dialed.
 */
export function normalizeUsPhone(input: unknown): string | null {
  if (typeof input !== 'string' && typeof input !== 'number') return null;
  let digits = String(input).replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);
  if (digits.length !== 10) return null;
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(digits)) return null;
  if (/^(\d)\1{9}$/.test(digits)) return null;
  return digits;
}

/** "(513) 555-0123" for a valid number, null otherwise. */
export function formatUsPhone(input: unknown): string | null {
  const d = normalizeUsPhone(input);
  return d ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : null;
}

/**
 * HTML pattern attribute for the phone inputs. Browsers anchor it implicitly. It allows any
 * separators, an optional leading 1, and enforces the NANP 2-9 rule on area code and exchange.
 * The repeated-digit rule is server-only (the server is the real gate; this is the friendly hint).
 */
export const PHONE_PATTERN = String.raw`\D*1?\D*[2-9]\d{2}\D*[2-9]\d{2}\D*\d{4}\D*`;

export const PHONE_ERROR_MESSAGE = 'Please enter a 10-digit phone number so Doug can reach you.';

export const PHONE_HINT = '10-digit US number, like (513) 555-0123';
