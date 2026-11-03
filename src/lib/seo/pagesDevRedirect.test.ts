import { describe, it, expect } from 'vitest';
import { pagesDevRedirectTarget } from './pagesDevRedirect';

const t = (href: string, method = 'GET') => pagesDevRedirectTarget(new URL(href), method);

describe('pages.dev host redirect', () => {
  it('sends the production pages.dev host to the same path and query on steelboxdirect.com', () => {
    expect(t('https://steelboxdirect-v2.pages.dev/price/')).toBe('https://steelboxdirect.com/price/');
    expect(t('https://steelboxdirect-v2.pages.dev/price/?zip=45202')).toBe(
      'https://steelboxdirect.com/price/?zip=45202',
    );
    expect(t('https://steelboxdirect-v2.pages.dev/', 'HEAD')).toBe('https://steelboxdirect.com/');
  });

  it('never touches the real domain, including the quote POST', () => {
    expect(t('https://steelboxdirect.com/price/')).toBeNull();
    expect(t('https://www.steelboxdirect.com/price/')).toBeNull();
    expect(t('https://steelboxdirect.com/api/submit-quote', 'POST')).toBeNull();
  });

  it('never touches local dev, the build prerender host, or preview branch hosts', () => {
    expect(t('http://localhost:4321/price/')).toBeNull();
    expect(t('http://127.0.0.1:8788/price/')).toBeNull();
    expect(t('https://main.steelboxdirect-v2.pages.dev/price/')).toBeNull();
    expect(t('https://abc123.steelboxdirect-v2.pages.dev/price/')).toBeNull();
  });

  it('lets a non-GET request on the pages.dev host through, so a stray lead is not lost', () => {
    expect(t('https://steelboxdirect-v2.pages.dev/api/submit-quote', 'POST')).toBeNull();
  });
});
