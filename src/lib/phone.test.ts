import { describe, it, expect } from 'vitest';
import { normalizeUsPhone, formatUsPhone, PHONE_PATTERN } from './phone';

// The browser anchors pattern attributes as ^(?:pattern)$ with the v flag.
const browserPattern = new RegExp(`^(?:${PHONE_PATTERN})$`, 'v');

describe('normalizeUsPhone', () => {
  it.each([
    ['(513) 555-0123', '5135550123'],
    ['1-513-555-0123', '5135550123'],
    ['+1 513 555 0123', '5135550123'],
    ['513.555.0123', '5135550123'],
    ['5135550123', '5135550123'],
  ])('accepts %s', (input, expected) => {
    expect(normalizeUsPhone(input)).toBe(expected);
    expect(browserPattern.test(input)).toBe(true);
  });

  it.each([
    ['225'],
    ['5555555555'],
    ['0000000000'],
    ['0135550123'], // area code starts with 0
    ['1135550123'], // area code starts with 1
    ['5130550123'], // exchange starts with 0
    ['5131550123'], // exchange starts with 1
    ['25135550123'], // 11 digits not starting with 1
    ['513555012345'],
    [''],
  ])('rejects %s', (input) => {
    expect(normalizeUsPhone(input)).toBeNull();
  });

  it('rejects non-string input', () => {
    expect(normalizeUsPhone(undefined)).toBeNull();
    expect(normalizeUsPhone(null)).toBeNull();
    expect(normalizeUsPhone({})).toBeNull();
  });

  it('browser pattern rejects the short and NANP-invalid numbers', () => {
    for (const bad of ['225', '0135550123', '5130550123', '513555012']) {
      expect(browserPattern.test(bad)).toBe(false);
    }
  });
});

describe('formatUsPhone', () => {
  it('formats valid numbers and returns null for invalid', () => {
    expect(formatUsPhone('+1 513 555 0123')).toBe('(513) 555-0123');
    expect(formatUsPhone('225')).toBeNull();
  });
});
