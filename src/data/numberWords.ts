// src/data/numberWords.ts
// Small-number-to-word helper. Prose that says "two companies" or "Eight guides" derives its
// word from the same array the count derives from, so a data change cannot leave a stale word
// behind in a sentence.

const WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six',
  'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
];

/** Lowercase word for 0 to 12; the digits themselves above that. */
export function countWord(n: number): string {
  return WORDS[n] ?? String(n);
}

/** The same word with an initial capital, for sentence-initial prose. */
export function titleCountWord(n: number): string {
  const w = countWord(n);
  return w.charAt(0).toUpperCase() + w.slice(1);
}
