import { describe, expect, it } from 'vitest';
import { cleanSectionText, journeyParams, pickSection, scrollPercent, truncateJourney } from './phoneJourney';

describe('truncateJourney', () => {
  it('joins short journeys unchanged', () => {
    expect(truncateJourney(['/', '/sizes/20ft/', '/quote/'])).toBe('/ > /sizes/20ft/ > /quote/');
  });

  it('returns empty string for no pages', () => {
    expect(truncateJourney([])).toBe('');
  });

  it('keeps landing and most recent pages, replacing the middle with an ellipsis', () => {
    const paths = ['/', ...Array.from({ length: 12 }, (_, i) => `/blog/post-number-${i}/`), '/locations/cincinnati-oh/'];
    const out = truncateJourney(paths);
    expect(out.length).toBeLessThanOrEqual(100);
    expect(out.startsWith('/ > … > ')).toBe(true);
    expect(out.endsWith('/locations/cincinnati-oh/')).toBe(true);
    // Recent pages kept in order, contiguous from the end.
    const kept = out.split(' > ').slice(2);
    expect(kept).toEqual(paths.slice(paths.length - kept.length));
    expect(kept.length).toBeGreaterThan(1);
  });

  it('keeps a join of exactly 100 characters untouched and shortens 101', () => {
    const a = '/' + 'a'.repeat(48); // 49
    const fits = [a, '/' + 'b'.repeat(47)]; // 49 + 3 + 48 = 100
    expect(truncateJourney(fits)).toBe(fits.join(' > '));
    const over = [a, '/' + 'b'.repeat(48)]; // 101
    expect(truncateJourney(over).length).toBeLessThanOrEqual(100);
  });

  it('never exceeds 100 characters, even for pathological paths', () => {
    const huge = '/' + 'x'.repeat(300);
    expect(truncateJourney([huge]).length).toBe(100);
    expect(truncateJourney([huge]).endsWith('…')).toBe(true);
    expect(truncateJourney(['/', huge]).length).toBeLessThanOrEqual(100);
    expect(truncateJourney([huge, '/quote/']).length).toBeLessThanOrEqual(100);
  });

  it('respects a custom max', () => {
    expect(truncateJourney(['/a/', '/b/', '/c/', '/d/'], 15)).toBe('/a/ > … > /d/');
  });
});

describe('scrollPercent', () => {
  it('measures the viewport bottom against document height', () => {
    expect(scrollPercent(0, 800, 4000)).toBe(20);
    expect(scrollPercent(1200, 800, 4000)).toBe(50);
    expect(scrollPercent(3200, 800, 4000)).toBe(100);
  });

  it('clamps to 0-100 integers', () => {
    expect(scrollPercent(5000, 800, 4000)).toBe(100);
    expect(scrollPercent(-500, 100, 4000)).toBe(0);
    expect(Number.isInteger(scrollPercent(333, 777, 4001))).toBe(true);
  });

  it('treats short pages as fully seen and handles zero height', () => {
    expect(scrollPercent(0, 900, 600)).toBe(100);
    expect(scrollPercent(0, 900, 0)).toBe(0);
    expect(scrollPercent(NaN, 900, 1000)).toBe(0);
  });
});

describe('pickSection', () => {
  it('prefers the nearest h2', () => {
    expect(
      pickSection([
        { tag: 'H1', text: 'Shipping Containers in Cincinnati' },
        { tag: 'H2', text: 'Sizes' },
        { tag: 'H2', text: 'Delivery' },
        { tag: 'H3', text: 'Site prep' },
      ]),
    ).toBe('Delivery');
  });

  it('falls back to the nearest h1 or h3 when there is no h2', () => {
    expect(pickSection([{ tag: 'h1', text: 'Title' }, { tag: 'h3', text: 'Sub' }])).toBe('Sub');
    expect(pickSection([{ tag: 'h1', text: 'Title' }])).toBe('Title');
  });

  it('skips empty headings and returns null when nothing usable', () => {
    expect(pickSection([{ tag: 'h2', text: '   ' }, { tag: 'h3', text: 'Real' }])).toBe('Real');
    expect(pickSection([])).toBeNull();
  });

  it('cleans and caps text at 60 characters', () => {
    const long = '  A  very\n long heading '.padEnd(120, 'z');
    const out = pickSection([{ tag: 'h2', text: long }])!;
    expect(out.length).toBeLessThanOrEqual(60);
    expect(out.startsWith('A very long heading')).toBe(true);
    expect(out.endsWith('…')).toBe(true);
    expect(cleanSectionText('  Hello\t  world ')).toBe('Hello world');
  });
});

describe('journeyParams', () => {
  it('maps the attribution record', () => {
    expect(
      journeyParams({
        firstTouch: { source: 'google', medium: 'organic', landingPage: '/locations/dayton-oh/' },
        session: { pagesVisited: ['/locations/dayton-oh/', '/sizes/', '/quote/'] },
      }),
    ).toEqual({
      journey: '/locations/dayton-oh/ > /sizes/ > /quote/',
      pages_count: 3,
      landing_page: '/locations/dayton-oh/',
      session_source: 'google / organic',
    });
  });

  it('omits what is missing instead of inventing it', () => {
    expect(journeyParams(null)).toEqual({});
    expect(journeyParams({ firstTouch: { source: null, medium: null, landingPage: '' }, session: { pagesVisited: 'bad' } })).toEqual({});
    expect(journeyParams({ firstTouch: { source: 'direct', medium: null, landingPage: '/' } })).toEqual({
      landing_page: '/',
      session_source: 'direct',
    });
  });

  it('counts every page even when the journey string is shortened', () => {
    const paths = Array.from({ length: 30 }, (_, i) => `/page-${i}/`);
    const p = journeyParams({ session: { pagesVisited: paths } });
    expect(p.pages_count).toBe(30);
    expect(p.journey!.length).toBeLessThanOrEqual(100);
  });
});
