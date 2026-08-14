import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  VERIFIED_ON,
  VERIFIED_LABEL,
  portableStorageCities,
  conexProviders,
  publishedConexProviders,
  conexCount,
  conexCountWord,
  portableListingCount,
  portableMetroCount,
  rateCompanyNames,
  rateCompanyCountWord,
} from './rentalProviders';
import { countWord, titleCountWord } from './numberWords';

const REPO_ROOT = import.meta.dirname
  ? join(import.meta.dirname, '..', '..')
  : process.cwd();
const SOURCE = readFileSync(join(REPO_ROOT, 'src/data/rentalProviders.ts'), 'utf8');

const allProviders = [
  ...portableStorageCities.flatMap((c) => c.providers),
  ...conexProviders,
];

describe('numberWords', () => {
  it('spells small counts and falls back to digits above twelve', () => {
    expect(countWord(0)).toBe('zero');
    expect(countWord(2)).toBe('two');
    expect(countWord(3)).toBe('three');
    expect(countWord(8)).toBe('eight');
    expect(countWord(12)).toBe('twelve');
    expect(countWord(13)).toBe('13');
  });

  it('capitalises for sentence-initial prose', () => {
    expect(titleCountWord(2)).toBe('Two');
    expect(titleCountWord(8)).toBe('Eight');
    expect(titleCountWord(13)).toBe('13');
  });
});

describe('rental provider dataset', () => {
  it('derives the human verification label from the ISO date', () => {
    expect(VERIFIED_ON).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(VERIFIED_LABEL).toBe('12 August 2026');
  });

  it('REFERRAL INTENT: no provider link points at a sales path', () => {
    // A future editor must not be able to turn a rental referral into a sales referral.
    const SALES_PATH = /\/(for-sale|for_sale|buy|purchase|shop|store|inventory)(\/|$|\?|#)/i;
    for (const p of allProviders) {
      if (!p.url) continue;
      expect(p.url, `${p.name} link must not be a sales path`).not.toMatch(SALES_PATH);
      expect(p.url, `${p.name} link must be https`).toMatch(/^https:\/\//);
    }
  });

  it('every published provider has a working link and a link label; held providers have neither', () => {
    for (const p of allProviders) {
      if (p.status === 'published') {
        expect(p.url, `${p.name} is published and needs a url`).toBeTruthy();
        expect(p.linkLabel, `${p.name} is published and needs a linkLabel`).toBeTruthy();
        expect(p.facts.length).toBeGreaterThan(0);
      } else {
        expect(p.url, `${p.name} is held and must carry no url`).toBeUndefined();
        expect(p.heldNote, `${p.name} is held and must say why`).toBeTruthy();
      }
    }
  });

  it('the conex count derives from published entries only', () => {
    expect(publishedConexProviders).toEqual(conexProviders.filter((p) => p.status === 'published'));
    expect(conexCount).toBe(publishedConexProviders.length);
    expect(conexCountWord).toBe(countWord(conexCount));
  });

  it('the portable-storage counts derive from the city list', () => {
    expect(portableMetroCount).toBe(portableStorageCities.length);
    expect(portableListingCount).toBe(
      portableStorageCities.reduce((n, c) => n + c.providers.length, 0),
    );
    expect(portableMetroCount).toBe(5);
    expect(portableListingCount).toBe(12);
  });

  it('names exactly the companies that publish a rate, and derives that count', () => {
    // Reading order on the page: the Cleveland section lists Got Bins before MaxxBox, and the
    // Set preserves first-seen order. The plan's Step 5 authorises fixing this expectation to
    // match reading order rather than reordering the cities.
    expect(rateCompanyNames).toEqual(['Got Bins', 'MaxxBox Storage']);
    expect(rateCompanyCountWord).toBe(countWord(rateCompanyNames.length));
  });

  it('every dollar figure is one of the two companies own published rates', () => {
    const blob = JSON.stringify(allProviders);
    const amounts = [...blob.matchAll(/\$(\d[\d,]*)/g)].map((m) => m[1]);
    const allowed = new Set(['129', '159', '179', '209', '50', '3']);
    expect(amounts.filter((a) => !allowed.has(a))).toEqual([]);
    expect(amounts.length).toBeGreaterThan(0);
  });

  it('every quoted rate carries its attribution and its date', () => {
    for (const p of allProviders) {
      for (const f of p.facts) {
        const text = f.parts.map((part) => part.text).join('');
        if (!/\$\d/.test(text)) continue;
        expect(f.source, `${p.name} quotes a rate and needs a source line`).toBeTruthy();
        expect(f.source).toContain(VERIFIED_LABEL);
      }
    }
  });

  it('carries no competitor phone number reserved for the owner confirmation call', () => {
    expect(SOURCE).not.toContain('479-2555');
    expect(SOURCE).not.toContain('8594792555');
  });

  it('carries no em dash or en dash (HS-OUT-001)', () => {
    expect(SOURCE).not.toMatch(/[\u2014\u2013]/);
  });

  it('has unique provider ids inside each section', () => {
    const portableIds = portableStorageCities.flatMap((c) => c.providers.map((p) => `${c.city}:${p.id}`));
    expect(new Set(portableIds).size).toBe(portableIds.length);
    const conexIds = conexProviders.map((p) => p.id);
    expect(new Set(conexIds).size).toBe(conexIds.length);
  });
});
