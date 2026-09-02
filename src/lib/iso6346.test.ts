/**
 * ISO 6346 CHECK DIGIT: UNIT TESTS
 * ================================
 *
 * The arithmetic under /iso-6346-check-digit-calculator/ is the whole value of that page, so it
 * gets held in place here rather than trusted.
 *
 * THE CROSS CHECK THAT MATTERS MOST is the first one. src/lib/iso6346.ts DERIVES the letter table
 * from the rule ("start at 10, skip every multiple of 11"), and the live blog post
 * src/content/blog/how-to-read-container-id-number-iso-6346.md PRINTS the resulting 26 values in
 * prose. This file types the post's 26 values out by hand and asserts the derivation reproduces
 * them exactly. So the module and the published prose cannot drift apart without a red test, and
 * neither one is taken on faith.
 *
 * The second cross check is the worked example. That post walks KEIU900079 through all ten rows,
 * states sum = 6,927 and check digit 8, and this file asserts all three numbers. If the module
 * ever disagrees with the page that taught the arithmetic, the failure names the page.
 *
 * TEST VECTORS were derived independently, by hand and then confirmed against a separate scratch
 * implementation that used the post's typed table rather than this module's derived one. Two of
 * them (MSCU0000100 and MSCU0000060) exist specifically to exercise the remainder-of-10 fold,
 * which is the one branch a naive implementation gets wrong.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  LETTER_VALUES,
  WEIGHTS,
  WEIGHTED_LENGTH,
  FULL_LENGTH,
  MODULUS,
  CATEGORY_LETTERS,
  normalizeContainerNumber,
  characterValue,
  checkDigitFor,
  analyzeContainerNumber,
} from './iso6346';

const REPO_ROOT = import.meta.dirname
  ? join(import.meta.dirname, '..', '..')
  : process.cwd();

const MODULE_SOURCE = readFileSync(join(REPO_ROOT, 'src/lib/iso6346.ts'), 'utf8');
const BLOG_POST = join(REPO_ROOT, 'src/content/blog/how-to-read-container-id-number-iso-6346.md');

/**
 * The 26 letter values, TYPED OUT from the prose of the live blog post. Do not replace this with
 * anything computed: the point of the literal is that it is an independent witness.
 */
const POST_LETTER_VALUES: Record<string, number> = {
  A: 10, B: 12, C: 13, D: 14, E: 15, F: 16, G: 17, H: 18, I: 19, J: 20, K: 21, L: 23, M: 24,
  N: 25, O: 26, P: 27, Q: 28, R: 29, S: 30, T: 31, U: 32, V: 34, W: 35, X: 36, Y: 37, Z: 38,
};

/* -------------------------------------------------------------- the standard itself */

describe('ISO 6346: the letter table agrees with the live blog post', () => {
  it('the derived table reproduces all 26 values the post prints', () => {
    expect(LETTER_VALUES).toEqual(POST_LETTER_VALUES);
  });

  it('the blog post really does still print those values, character for character', () => {
    // If someone edits the post's table, this is the test that notices. The needle is the exact
    // run of pairs as published, so a single transposed value fails here rather than silently
    // leaving the module and the page disagreeing in production.
    const post = readFileSync(BLOG_POST, 'utf8');
    const published = Object.entries(POST_LETTER_VALUES)
      .map(([letter, value]) => `${letter}=${value}`)
      .join(', ');
    expect(post).toContain(published);
  });

  it('skips every multiple of 11, which is the reason the table looks irregular', () => {
    for (const value of Object.values(LETTER_VALUES)) {
      expect(value % MODULUS, `${value} is a multiple of ${MODULUS}`).not.toBe(0);
    }
    // The three skipped values are 11, 22 and 33, and nothing else in range is skipped.
    const values = Object.values(LETTER_VALUES);
    expect(values[0]).toBe(10);
    expect(values[values.length - 1]).toBe(38);
    expect(new Set(values).size).toBe(26);
  });

  it('weights are 2 to the power of the zero based position, 1 through 512', () => {
    expect(WEIGHTS).toEqual([1, 2, 4, 8, 16, 32, 64, 128, 256, 512]);
    WEIGHTS.forEach((w, i) => expect(w).toBe(2 ** i));
    expect(WEIGHTS).toHaveLength(WEIGHTED_LENGTH);
    expect(FULL_LENGTH).toBe(WEIGHTED_LENGTH + 1);
  });

  it('names the three category letters ISO 6346 defines, and no fourth', () => {
    expect(Object.keys(CATEGORY_LETTERS).sort()).toEqual(['J', 'U', 'Z']);
  });

  it('values a digit at its face value and a letter from the table', () => {
    expect(characterValue('0')).toBe(0);
    expect(characterValue('7')).toBe(7);
    expect(characterValue('9')).toBe(9);
    expect(characterValue('A')).toBe(10);
    expect(characterValue('U')).toBe(32);
    expect(characterValue('Z')).toBe(38);
    expect(characterValue('a')).toBeNull();
    expect(characterValue('*')).toBeNull();
    expect(characterValue('')).toBeNull();
    expect(characterValue('AB')).toBeNull();
  });
});

/* -------------------------------------------------------------- the worked example */

describe('ISO 6346: the blog post worked example, row by row', () => {
  const r = analyzeContainerNumber('KEIU9000798');

  it('parses as a validation and passes', () => {
    expect(r.parsed).toBe(true);
    expect(r.mode).toBe('validate');
    expect(r.valid).toBe(true);
  });

  it('reaches the sum the post publishes, 6927, and the check digit 8', () => {
    expect(r.sum).toBe(6927);
    expect(r.remainder).toBe(8);
    expect(r.checkDigit).toBe(8);
    expect(r.givenCheckDigit).toBe(8);
  });

  it('produces the same ten rows the post tabulates', () => {
    expect(r.steps.map((s) => [s.char, s.value, s.weight, s.product])).toEqual([
      ['K', 21, 1, 21],
      ['E', 15, 2, 30],
      ['I', 19, 4, 76],
      ['U', 32, 8, 256],
      ['9', 9, 16, 144],
      ['0', 0, 32, 0],
      ['0', 0, 64, 0],
      ['0', 0, 128, 0],
      ['7', 7, 256, 1792],
      ['9', 9, 512, 4608],
    ]);
  });

  it('splits the number into the four parts the post names', () => {
    expect(r.ownerCode).toBe('KEI');
    expect(r.categoryLetter).toBe('U');
    expect(r.categoryMeaning).toBe('Freight container');
    expect(r.serial).toBe('900079');
  });

  it('numbers the positions 1 through 10 and sums to the reported total', () => {
    expect(r.steps.map((s) => s.position)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(r.steps.reduce((a, s) => a + s.product, 0)).toBe(r.sum);
    expect(r.steps.filter((s) => s.isLetter).map((s) => s.char)).toEqual(['K', 'E', 'I', 'U']);
  });
});

/* -------------------------------------------------------------- valid vectors */

describe('ISO 6346: valid numbers', () => {
  /** [number, sum, remainder, check digit]. Every row was derived by hand first. */
  const VALID: [string, number, number, number][] = [
    // The widely cited example. Confirmed here rather than assumed.
    ['CSQU3054383', 6185, 3, 3],
    // The blog post's own example.
    ['KEIU9000798', 6927, 8, 8],
    // Hand derived: MSCU = 24 + 60 + 52 + 256 = 392, serial 123456 = 5136, total 5528, 5528 = 11 x 502 + 6.
    ['MSCU1234566', 5528, 6, 6],
    // Hand derived: TGHU = 31 + 34 + 72 + 256 = 393, serial 200000 contributes 32, total 425, 425 = 11 x 38 + 7.
    ['TGHU2000007', 425, 7, 7],
    // A number with letters at both ends of the table.
    ['APZU3709874', 7528, 4, 4],
    // Remainder 0, which is a check digit of 0 for the ordinary reason and NOT the fold.
    ['XYZZ0000010', 1078, 0, 0],
  ];

  for (const [number, sum, remainder, checkDigit] of VALID) {
    it(`${number} checks out`, () => {
      const r = analyzeContainerNumber(number);
      expect(r.parsed).toBe(true);
      expect(r.error).toBeNull();
      expect(r.sum).toBe(sum);
      expect(r.remainder).toBe(remainder);
      expect(r.checkDigit).toBe(checkDigit);
      expect(r.valid).toBe(true);
      expect(checkDigitFor(number.slice(0, 10))).toBe(checkDigit);
    });
  }
});

/* -------------------------------------------------------------- the fold */

describe('ISO 6346: a remainder of 10 folds to a check digit of 0', () => {
  // This is the single branch a naive implementation gets wrong, so it gets two vectors and an
  // explicit assertion that remainder and check digit DISAGREE, which is what the fold means.
  const FOLD: [string, number][] = [
    ['MSCU0000100', 648],
    ['MSCU0000060', 3464],
  ];

  for (const [number, sum] of FOLD) {
    it(`${number}: sum ${sum} leaves remainder 10, so the check digit is 0`, () => {
      const r = analyzeContainerNumber(number);
      expect(r.parsed).toBe(true);
      expect(r.sum).toBe(sum);
      expect(r.sum! % MODULUS).toBe(10);
      expect(r.remainder).toBe(10);
      expect(r.checkDigit).toBe(0);
      expect(r.valid).toBe(true);
    });
  }

  it('never returns 10 as a check digit, for any input at all', () => {
    // Exhaustive over a serial sweep: a check digit is one character, so 10 can never be right.
    for (let serial = 0; serial < 3000; serial++) {
      const d = checkDigitFor(`MSCU${String(serial).padStart(6, '0')}`);
      expect(d).not.toBeNull();
      expect(d! >= 0 && d! <= 9, `serial ${serial} produced ${d}`).toBe(true);
    }
  });

  it('keeps the pre fold remainder visible, so the page can show the fold happening', () => {
    // A caller that only ever sees the folded digit cannot teach why it folded.
    expect(analyzeContainerNumber('MSCU0000100').remainder).toBe(10);
    expect(analyzeContainerNumber('XYZZ0000010').remainder).toBe(0);
    // Both end at a check digit of 0, and the remainders are the reason they are different cases.
    expect(analyzeContainerNumber('MSCU0000100').checkDigit)
      .toBe(analyzeContainerNumber('XYZZ0000010').checkDigit);
  });
});

/* -------------------------------------------------------------- calculate mode */

describe('ISO 6346: 10 characters means calculate rather than validate', () => {
  // DELIBERATE DESIGN CHOICE. A brief for this page suggested 10 characters should error with
  // "that is 10 characters, an ISO 6346 number is 11". It does not, because 4 letters plus 6
  // digits is exactly the input for the second job the page has to do, working the check digit
  // OUT. One field serves both questions, because a person holding a container number does not
  // know in advance which of the two they have. Every other wrong length still errors by name.
  it('works the check digit out and reports no comparison', () => {
    const r = analyzeContainerNumber('CSQU305438');
    expect(r.parsed).toBe(true);
    expect(r.mode).toBe('calculate');
    expect(r.checkDigit).toBe(3);
    expect(r.givenCheckDigit).toBeNull();
    expect(r.valid).toBeNull();
    expect(r.steps).toHaveLength(10);
  });

  it('checkDigitFor takes the first ten characters and nothing else', () => {
    expect(checkDigitFor('CSQU305438')).toBe(3);
    expect(checkDigitFor('csqu 305438')).toBe(3);
    expect(checkDigitFor('CSQU3054383')).toBeNull();
    expect(checkDigitFor('CSQU30543')).toBeNull();
    expect(checkDigitFor('CSQU30543*')).toBeNull();
    expect(checkDigitFor('')).toBeNull();
  });
});

/* -------------------------------------------------------------- forgiving input */

describe('ISO 6346: input is normalized before it is judged', () => {
  it('accepts lowercase', () => {
    const r = analyzeContainerNumber('csqu3054383');
    expect(r.normalized).toBe('CSQU3054383');
    expect(r.valid).toBe(true);
  });

  it('accepts the spacing people actually type off a stencil', () => {
    for (const raw of [
      'CSQU 305438 3',
      ' CSQU3054383 ',
      'CSQU-305438-3',
      'csqu 3054383',
      'CSQU.305438.3',
      'CSQU / 305438 / 3',
      'CSQU_3054383',
      'csqu-305438 3  ',
    ]) {
      const r = analyzeContainerNumber(raw);
      expect(r.normalized, raw).toBe('CSQU3054383');
      expect(r.valid, raw).toBe(true);
    }
  });

  it('echoes the raw input back untouched, so a page can show what was typed', () => {
    expect(analyzeContainerNumber('  csqu-305438-3 ').input).toBe('  csqu-305438-3 ');
  });

  it('normalizes null and undefined into an empty string rather than throwing', () => {
    expect(normalizeContainerNumber(undefined as unknown as string)).toBe('');
    expect(normalizeContainerNumber(null as unknown as string)).toBe('');
    expect(analyzeContainerNumber(undefined as unknown as string).error?.code).toBe('empty');
  });
});

/* -------------------------------------------------------------- failure classes */

describe('ISO 6346: a wrong check digit is a parse that fails the comparison', () => {
  it('CSQU3054384 parses, and reports the digit it should have been', () => {
    const r = analyzeContainerNumber('CSQU3054384');
    // Not an error: the number is well formed, it just does not check out. The distinction is
    // the whole point, because the page has to say WHICH of the two happened.
    expect(r.parsed).toBe(true);
    expect(r.error).toBeNull();
    expect(r.valid).toBe(false);
    expect(r.givenCheckDigit).toBe(4);
    expect(r.checkDigit).toBe(3);
  });

  it('every one of the nine other digits in that slot fails, and only 3 passes', () => {
    const passing = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      .filter((d) => analyzeContainerNumber(`CSQU305438${d}`).valid === true);
    expect(passing).toEqual([3]);
  });

  it('catches the classic transposition the check digit exists to catch', () => {
    // CSQU3054383 with two serial digits swapped: the boxed digit no longer agrees.
    expect(analyzeContainerNumber('CSQU3045383').valid).toBe(false);
    expect(analyzeContainerNumber('CSQU3504383').valid).toBe(false);
  });
});

describe('ISO 6346: each bad input class gets its own specific error', () => {
  const cases: { raw: string; code: string; says: RegExp }[] = [
    { raw: '', code: 'empty', says: /CSQU3054383/ },
    { raw: '     ', code: 'empty', says: /Nothing to check/ },
    { raw: 'CSQU30543', code: 'too-short', says: /That is 9 characters/ },
    { raw: 'C', code: 'too-short', says: /That is 1 character\./ },
    { raw: 'CSQU305438312', code: 'too-long', says: /That is 13 characters/ },
    { raw: 'CSQU3054383 45G1', code: 'too-long', says: /45G1/ },
    { raw: 'CSQU3054383!', code: 'unsupported-characters', says: /letters and digits only/ },
    { raw: 'CSQU305438#3', code: 'unsupported-characters', says: /#/ },
    { raw: 'CS1U3054383', code: 'owner-code-not-letters', says: /"CS1"/ },
    { raw: '1SQU3054383', code: 'owner-code-not-letters', says: /owner code/ },
    { raw: 'CSQ13054383', code: 'category-not-letter', says: /"1"/ },
    { raw: 'CSQU30S4383', code: 'serial-not-digits', says: /"30S438"/ },
    { raw: 'CSQU305438X', code: 'check-digit-not-a-digit', says: /"X"/ },
  ];

  for (const { raw, code, says } of cases) {
    it(`${JSON.stringify(raw)} reports ${code}`, () => {
      const r = analyzeContainerNumber(raw);
      expect(r.parsed).toBe(false);
      expect(r.error?.code).toBe(code);
      expect(r.error?.message).toMatch(says);
      expect(r.valid).toBeNull();
      expect(r.checkDigit).toBeNull();
      expect(r.steps).toEqual([]);
    });
  }

  it('no error message is generic: every one names the length or the characters seen', () => {
    for (const { raw } of cases) {
      const message = analyzeContainerNumber(raw).error?.message ?? '';
      expect(message.length, raw).toBeGreaterThan(40);
      expect(message, raw).not.toMatch(/invalid input/i);
    }
  });

  it('a wrong length is reported by the length after normalizing, not before', () => {
    // "CSQU 3054 38" is 12 characters typed and 10 usable, so it calculates rather than erroring.
    expect(analyzeContainerNumber('CSQU 3054 38').mode).toBe('calculate');
    expect(analyzeContainerNumber('CSQU 3054 3').error?.code).toBe('too-short');
    expect(analyzeContainerNumber('CSQU 3054 3').error?.message).toMatch(/That is 9 characters/);
  });
});

describe('ISO 6346: the category letter', () => {
  it('accepts U, J and Z with no warning, and names what each one means', () => {
    for (const [letter, meaning] of Object.entries(CATEGORY_LETTERS)) {
      const ten = `CSQ${letter}305438`;
      const digit = checkDigitFor(ten);
      const r = analyzeContainerNumber(`${ten}${digit}`);
      expect(r.parsed, letter).toBe(true);
      expect(r.valid, letter).toBe(true);
      expect(r.warnings, letter).toEqual([]);
      expect(r.categoryMeaning, letter).toBe(meaning);
    }
  });

  it('warns on any other letter but still answers, because the arithmetic is defined', () => {
    // CSQX: the fourth character is a letter, so the sum is computable. Refusing to answer would
    // hide the check digit from someone who has simply misread a stencilled U.
    const r = analyzeContainerNumber('CSQX3054382');
    expect(r.parsed).toBe(true);
    expect(r.error).toBeNull();
    expect(r.categoryLetter).toBe('X');
    expect(r.categoryMeaning).toBeNull();
    expect(r.warnings).toHaveLength(1);
    expect(r.warnings[0].code).toBe('nonstandard-category');
    expect(r.warnings[0].message).toMatch(/only three/);
    expect(r.checkDigit).toBe(2);
    expect(r.valid).toBe(true);
  });

  it('a nonstandard category plus a bad eleventh character reports the error and keeps the warning', () => {
    const r = analyzeContainerNumber('CSQX305438Y');
    expect(r.parsed).toBe(false);
    expect(r.error?.code).toBe('check-digit-not-a-digit');
    expect(r.warnings.map((w) => w.code)).toEqual(['nonstandard-category']);
  });
});

/* -------------------------------------------------------------- house rules */

describe('ISO 6346 module: house rules', () => {
  it('carries no em dash or en dash anywhere in the module (HS-OUT-001)', () => {
    expect(MODULE_SOURCE).not.toMatch(/[\u2014\u2013]/);
  });

  it('makes no network call and reads nothing off the machine', () => {
    // The page has to work with no connection, and a linkable calculator that phones home is not
    // one. This is asserted on the source because it is a property of the module, not a run.
    expect(MODULE_SOURCE).not.toMatch(/\bfetch\b|XMLHttpRequest|localStorage|sessionStorage/);
    expect(MODULE_SOURCE).not.toMatch(/^\s*import\b/m);
    expect(MODULE_SOURCE).not.toMatch(/\brequire\(/);
  });

  it('hardcodes no letter table, so the skip rule stays the source of the values', () => {
    // A literal "A: 10, B: 12" list in the code would make the derivation decorative and would
    // hide a transposed value. Comments are stripped first: the header comment legitimately
    // SHOWS the resulting values as documentation, which is not the same as depending on them.
    const code = MODULE_SOURCE
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/[^\n]*/g, '');
    expect(code).not.toMatch(/B['"]?\s*[:=]\s*12/);
    expect(code).not.toMatch(/L['"]?\s*[:=]\s*23/);
    expect(code).toMatch(/while \(value % MODULUS === 0\) value\+\+;/);
  });
});
