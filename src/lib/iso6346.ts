/**
 * ISO 6346 CONTAINER NUMBER CHECK DIGIT
 * =====================================
 *
 * The arithmetic that /iso-6346-check-digit-calculator/ runs, and the only copy of it. The page
 * imports this module into a bundled `<script>` (the precedent is src/pages/quote/index.astro,
 * which imports src/lib/attribution.ts the same way), so the tested function and the running
 * function are the same function. There is deliberately no second hand written copy inside an
 * `is:inline` block: two copies of an arithmetic rule is one copy plus a future disagreement.
 *
 * SOURCE OF TRUTH FOR THE RULE.
 * src/content/blog/how-to-read-container-id-number-iso-6346.md, which is live and documents this
 * character by character. This module implements exactly what that post describes:
 *
 *   1. Turn each of the first 10 characters into a number. Digits keep their face value. Letters
 *      use a fixed table that skips every multiple of 11, so no two letters can be confused.
 *   2. Multiply each value by a doubling weight, 1, 2, 4, 8 up to 512, left to right.
 *   3. Sum the products and divide by 11. The remainder is the check digit. One exception: a
 *      remainder of 10 means the check digit is 0.
 *
 * WHY THE LETTER TABLE IS DERIVED AND NOT TYPED.
 * The post states the rule ("skips every multiple of 11") AND the resulting table. Typing the
 * table would make the rule decorative and a single transposed digit invisible. So the table is
 * generated from the rule below, and src/lib/iso6346.test.ts asserts the generated table equals
 * the 26 values the blog post prints. If the rule and the post ever disagree, the test says so.
 *
 * WHAT THIS MODULE DOES NOT DO.
 * It checks arithmetic on a number. It makes no network call, reads no database, and knows
 * nothing about whether a container exists, who owns it, what condition it is in, or its
 * examination status. Nothing here is a determination about anything physical.
 */

/** Position weights for characters 1 through 10: two to the power of the zero based index. */
export const WEIGHTS: readonly number[] = Object.freeze([1, 2, 4, 8, 16, 32, 64, 128, 256, 512]);

/** How many characters carry weight. The eleventh character is the check digit itself. */
export const WEIGHTED_LENGTH = 10;

/** Full length of an ISO 6346 container number: 4 letters, 6 digits, 1 check digit. */
export const FULL_LENGTH = 11;

/** The modulus. A remainder of 10 folds to 0, which is the standard's single exception. */
export const MODULUS = 11;

/**
 * The letter table, generated from the rule rather than transcribed from it: start at 10, count
 * up, and skip any value that is a multiple of 11. That skip is the whole point of the scheme,
 * because a value divisible by the modulus is invisible to the modulus.
 */
function buildLetterValues(): Record<string, number> {
  const table: Record<string, number> = {};
  let value = 10;
  for (let i = 0; i < 26; i++) {
    while (value % MODULUS === 0) value++;
    table[String.fromCharCode(65 + i)] = value;
    value++;
  }
  return table;
}

/** A=10, B=12 ... Z=38. Frozen: this is a standard, not a setting. */
export const LETTER_VALUES: Readonly<Record<string, number>> = Object.freeze(buildLetterValues());

/**
 * The fourth character, the equipment category identifier. ISO 6346 defines three.
 * A number whose fourth letter is not one of these is still arithmetically checkable, which is
 * why an unexpected letter here produces a warning rather than a refusal to answer.
 */
export const CATEGORY_LETTERS: Readonly<Record<string, string>> = Object.freeze({
  U: 'Freight container',
  J: 'Detachable freight container related equipment',
  Z: 'Trailers and chassis',
});

/** Characters stripped before parsing, so a number copied off a stencil or a bill of lading works. */
const SEPARATORS = /[\s\-_.,/\\:]+/g;

/** "1 character", "9 characters". A count in a message people read should read like English. */
const chars = (n: number): string => `${n} character${n === 1 ? '' : 's'}`;

export type Iso6346ErrorCode =
  | 'empty'
  | 'unsupported-characters'
  | 'too-short'
  | 'too-long'
  | 'owner-code-not-letters'
  | 'category-not-letter'
  | 'serial-not-digits'
  | 'check-digit-not-a-digit';

export type Iso6346WarningCode = 'nonstandard-category';

/** What the input was understood to be asking for. */
export type Iso6346Mode = 'validate' | 'calculate';

export interface Iso6346Step {
  /** 1 through 10, left to right, as the blog post numbers them. */
  position: number;
  char: string;
  /** Face value for a digit, table value for a letter. */
  value: number;
  weight: number;
  product: number;
  isLetter: boolean;
}

export interface Iso6346Problem {
  code: Iso6346ErrorCode | Iso6346WarningCode;
  /** Written for a person standing next to a container, never a generic failure string. */
  message: string;
}

export interface Iso6346Result {
  /** The raw string, untouched, so a caller can echo back what was typed. */
  input: string;
  /** Uppercased with separators removed. Empty string when there was nothing usable. */
  normalized: string;
  /** True when the shape parsed and the arithmetic ran. Says nothing about whether it matched. */
  parsed: boolean;
  /** Present only when parsed is false. */
  error: Iso6346Problem | null;
  /** Non fatal notes. Populated even when parsed is true. */
  warnings: Iso6346Problem[];
  /** 'validate' for 11 characters, 'calculate' for 10. Null when nothing parsed. */
  mode: Iso6346Mode | null;
  ownerCode: string | null;
  categoryLetter: string | null;
  /** The ISO meaning of the category letter, or null when it is not one of the three. */
  categoryMeaning: string | null;
  serial: string | null;
  /** One row per weighted character. Empty when parsing failed. */
  steps: Iso6346Step[];
  /** Sum of the products. Null when parsing failed. */
  sum: number | null;
  /** sum modulo 11, BEFORE the ten folds to zero. Kept separately so the page can show the fold. */
  remainder: number | null;
  /** The check digit the arithmetic produces: remainder, with 10 folded to 0. */
  checkDigit: number | null;
  /** The eleventh character as typed. Null in calculate mode. */
  givenCheckDigit: number | null;
  /** True or false in validate mode, null in calculate mode where there is nothing to compare. */
  valid: boolean | null;
}

/** Uppercase, and drop the separators people actually type. */
export function normalizeContainerNumber(raw: string): string {
  return String(raw ?? '').replace(SEPARATORS, '').toUpperCase();
}

/** Table value for a letter, face value for a digit, null for anything else. */
export function characterValue(char: string): number | null {
  if (char.length !== 1) return null;
  if (char >= '0' && char <= '9') return char.charCodeAt(0) - 48;
  const letter = LETTER_VALUES[char];
  return letter === undefined ? null : letter;
}

const fail = (
  input: string,
  normalized: string,
  code: Iso6346ErrorCode,
  message: string,
  warnings: Iso6346Problem[] = [],
): Iso6346Result => ({
  input,
  normalized,
  parsed: false,
  error: { code, message },
  warnings,
  mode: null,
  ownerCode: null,
  categoryLetter: null,
  categoryMeaning: null,
  serial: null,
  steps: [],
  sum: null,
  remainder: null,
  checkDigit: null,
  givenCheckDigit: null,
  valid: null,
});

/**
 * The check digit for the first 10 characters of a container number.
 *
 * Returns null rather than throwing when the input is not exactly 10 usable characters, because
 * every caller here is a UI that has to say something specific about why, and an exception is the
 * one thing a UI cannot render.
 */
export function checkDigitFor(firstTen: string): number | null {
  const s = normalizeContainerNumber(firstTen);
  if (s.length !== WEIGHTED_LENGTH) return null;
  let sum = 0;
  for (let i = 0; i < WEIGHTED_LENGTH; i++) {
    const value = characterValue(s.charAt(i));
    if (value === null) return null;
    sum += value * WEIGHTS[i];
  }
  const remainder = sum % MODULUS;
  return remainder === 10 ? 0 : remainder;
}

/**
 * Parse and check one container number, and show the working.
 *
 * Accepts 10 characters (calculate the check digit) or 11 (validate the one given). One field
 * covers both jobs, because a person holding a container number does not know in advance which
 * question they have. Any other length is an error naming the length that was actually seen.
 */
export function analyzeContainerNumber(raw: string): Iso6346Result {
  const input = String(raw ?? '');
  const normalized = normalizeContainerNumber(input);

  if (normalized.length === 0) {
    return fail(input, normalized, 'empty',
      'Nothing to check yet. Enter a container number, for example CSQU3054383.');
  }

  const stray = normalized.replace(/[A-Z0-9]/g, '');
  if (stray.length > 0) {
    const shown = Array.from(new Set(stray.split(''))).join(' ');
    return fail(input, normalized, 'unsupported-characters',
      `A container number is letters and digits only, and this one contains ${shown}. `
      + 'Spaces, hyphens and full stops are fine and get ignored.');
  }

  if (normalized.length < WEIGHTED_LENGTH) {
    return fail(input, normalized, 'too-short',
      `That is ${chars(normalized.length)}. An ISO 6346 number is 11: three letters of owner `
      + 'code, one category letter, six digits of serial, then the check digit. Enter the first 10 '
      + 'to have the check digit worked out, or all 11 to have it checked.');
  }

  if (normalized.length > FULL_LENGTH) {
    return fail(input, normalized, 'too-long',
      `That is ${chars(normalized.length)}. An ISO 6346 number is 11, so there is at least one `
      + 'character too many here. Check for a size and type code such as 45G1 stencilled on the '
      + 'line below the ID, which is a separate code and not part of the number.');
  }

  const mode: Iso6346Mode = normalized.length === FULL_LENGTH ? 'validate' : 'calculate';
  const ownerCode = normalized.slice(0, 3);
  const categoryLetter = normalized.charAt(3);
  const serial = normalized.slice(4, 10);

  if (!/^[A-Z]{3}$/.test(ownerCode)) {
    return fail(input, normalized, 'owner-code-not-letters',
      `The first three characters are the owner code and have to be letters, but this number has `
      + `"${ownerCode}". If a digit crept in, an 8 read as a B or a 0 read as an O is the usual `
      + 'cause on a worn stencil.');
  }

  if (!/^[A-Z]$/.test(categoryLetter)) {
    return fail(input, normalized, 'category-not-letter',
      `The fourth character is the equipment category identifier and has to be a letter, but this `
      + `number has "${categoryLetter}". On a freight container it is almost always U.`);
  }

  if (!/^[0-9]{6}$/.test(serial)) {
    return fail(input, normalized, 'serial-not-digits',
      `Characters five to ten are the six digit serial number, but this number has "${serial}". `
      + 'A letter here is usually an O read for a 0 or an I read for a 1.');
  }

  const warnings: Iso6346Problem[] = [];
  const categoryMeaning = CATEGORY_LETTERS[categoryLetter] ?? null;
  if (categoryMeaning === null) {
    warnings.push({
      code: 'nonstandard-category',
      message: `The fourth character is "${categoryLetter}", and ISO 6346 defines only three `
        + 'category letters: U for a freight container, J for detachable freight container related '
        + 'equipment, and Z for trailers and chassis. The arithmetic below still runs, because it '
        + 'is defined for any letter, but re-read that character off the container before you '
        + 'trust the result.',
    });
  }

  let givenCheckDigit: number | null = null;
  if (mode === 'validate') {
    const eleventh = normalized.charAt(10);
    if (!/^[0-9]$/.test(eleventh)) {
      return fail(input, normalized, 'check-digit-not-a-digit',
        `The eleventh character is the check digit and has to be a single digit 0 to 9, but this `
        + `number has "${eleventh}".`, warnings);
    }
    givenCheckDigit = Number(eleventh);
  }

  const steps: Iso6346Step[] = [];
  let sum = 0;
  for (let i = 0; i < WEIGHTED_LENGTH; i++) {
    const char = normalized.charAt(i);
    const value = characterValue(char) as number;
    const weight = WEIGHTS[i];
    const product = value * weight;
    steps.push({ position: i + 1, char, value, weight, product, isLetter: !/[0-9]/.test(char) });
    sum += product;
  }

  const remainder = sum % MODULUS;
  const checkDigit = remainder === 10 ? 0 : remainder;

  return {
    input,
    normalized,
    parsed: true,
    error: null,
    warnings,
    mode,
    ownerCode,
    categoryLetter,
    categoryMeaning,
    serial,
    steps,
    sum,
    remainder,
    checkDigit,
    givenCheckDigit,
    valid: mode === 'validate' ? givenCheckDigit === checkDigit : null,
  };
}
