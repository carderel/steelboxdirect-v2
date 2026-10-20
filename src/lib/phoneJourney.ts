/**
 * Phone click journey tracking (owner request 2026-10-20).
 *
 * Every tel: link click pushes ONE dataLayer event, phone_click, carrying where on the page the
 * visitor was and a short summary of their path through the site. GTM tag "GA4 - phone_click"
 * forwards each key below as an event parameter.
 *
 * The journey is read from the existing attribution store (src/lib/attribution.ts); this file does
 * not keep a second one. No PII: paths, headings, numbers and the first-touch source only.
 * Minimal JS: one delegated click listener plus one passive, rAF-throttled scroll listener.
 */

import { getAttributionData } from './attribution';

/** GA4 rejects event parameter values over 100 characters. */
export const JOURNEY_MAX = 100;
export const SECTION_MAX = 60;
const SEP = ' > ';
const ELLIPSIS = '…';
/** The site header (SiteNav). Pages also use <header>/<nav> inside content (blog hero, TOCs). */
const SITE_HEADER = 'header.site';

/**
 * Join paths with ' > ' and keep the result within `max` characters. When it does not fit, keep
 * the landing page and as many of the most recent pages as fit, with '…' standing in for the
 * middle. A single over-long path is hard-cut and ends in '…'.
 */
export function truncateJourney(paths: string[], max = JOURNEY_MAX): string {
  const full = paths.join(SEP);
  if (full.length <= max) return full;

  const first = paths[0];
  const tail: string[] = [];
  for (let i = paths.length - 1; i >= 1; i--) {
    const candidate = [first, ELLIPSIS, paths[i], ...tail].join(SEP);
    if (candidate.length > max) break;
    tail.unshift(paths[i]);
  }
  if (tail.length > 0) return [first, ELLIPSIS, ...tail].join(SEP);

  // Not even landing + … + current fits: hard-cut.
  return full.slice(0, max - 1) + ELLIPSIS;
}

/** Clamp to an integer 0-100. */
function pct(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * How far down the page the bottom of the viewport is, as an integer 0-100.
 * A page shorter than the viewport counts as fully seen (100).
 */
export function scrollPercent(scrollY: number, viewportHeight: number, docHeight: number): number {
  if (!(docHeight > 0)) return 0;
  return pct(((scrollY + viewportHeight) / docHeight) * 100);
}

export interface HeadingCandidate {
  tag: string; // 'h1' | 'h2' | 'h3'
  text: string;
}

/** Collapse whitespace, trim and cap at `max` characters ('…' marks a cut). */
export function cleanSectionText(text: string, max = SECTION_MAX): string {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length <= max ? t : t.slice(0, max - 1).trimEnd() + ELLIPSIS;
}

/**
 * Given the headings at or above the clicked link, in document order, return the section name:
 * the nearest h2, else the nearest h1 or h3. Empty headings are skipped. Returns null if none.
 */
export function pickSection(candidates: HeadingCandidate[]): string | null {
  const usable = candidates
    .map((c) => ({ tag: c.tag.toLowerCase(), text: cleanSectionText(c.text) }))
    .filter((c) => c.text.length > 0);
  for (let i = usable.length - 1; i >= 0; i--) if (usable[i].tag === 'h2') return usable[i].text;
  for (let i = usable.length - 1; i >= 0; i--) if (usable[i].tag === 'h1' || usable[i].tag === 'h3') return usable[i].text;
  return null;
}

export interface JourneyParams {
  journey?: string;
  pages_count?: number;
  landing_page?: string;
  session_source?: string;
}

/** Journey params from the attribution record. Any missing piece is omitted, never invented. */
export function journeyParams(data: {
  firstTouch?: { source?: string | null; medium?: string | null; landingPage?: string | null };
  session?: { pagesVisited?: unknown };
} | null): JourneyParams {
  const out: JourneyParams = {};
  if (!data) return out;
  const visited = data.session?.pagesVisited;
  if (Array.isArray(visited)) {
    const paths = visited.filter((p): p is string => typeof p === 'string' && p.length > 0);
    if (paths.length > 0) {
      out.journey = truncateJourney(paths);
      out.pages_count = paths.length;
    }
  }
  const landing = data.firstTouch?.landingPage;
  if (landing) out.landing_page = landing.slice(0, JOURNEY_MAX);
  const src = data.firstTouch?.source;
  const med = data.firstTouch?.medium;
  if (src) out.session_source = (med ? `${src} / ${med}` : src).slice(0, JOURNEY_MAX);
  return out;
}

/* ---------------------------------------------------------------- browser-only below */

function currentScrollPct(): number {
  const de = document.documentElement;
  return scrollPercent(window.scrollY || de.scrollTop || 0, window.innerHeight || de.clientHeight, Math.max(de.scrollHeight, document.body ? document.body.scrollHeight : 0));
}

/**
 * Headings that sit "at or above" the link. For content and footer links that is document order.
 * For a header or nav link (the sticky Call button) the link is above everything in the DOM, so
 * "where on the page" means the section being read: headings whose top has reached the upper
 * third of the viewport. Headings inside the site header are never section names.
 */
function sectionFor(link: Element, inHeader: boolean): string | null {
  const headings = Array.prototype.slice.call(document.querySelectorAll('h1,h2,h3')) as Element[];
  const limit = (window.innerHeight || 0) / 3;
  const candidates: HeadingCandidate[] = [];
  for (const h of headings) {
    if (h.closest(SITE_HEADER)) continue;
    const above = inHeader
      ? h.getBoundingClientRect().top <= limit
      : h === link || h.contains(link) || !!(h.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING);
    if (above) candidates.push({ tag: h.tagName, text: h.textContent || '' });
  }
  return pickSection(candidates);
}

function safeAttribution(): ReturnType<typeof getAttributionData> {
  try {
    return getAttributionData();
  } catch {
    return null; // private mode, storage disabled, or a corrupt record
  }
}

let installed = false;

export function installPhoneClickTracking(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  let maxScroll = currentScrollPct();
  let ticking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const p = currentScrollPct();
        if (p > maxScroll) maxScroll = p;
      });
    },
    { passive: true },
  );

  document.addEventListener(
    'click',
    (e) => {
      const t = e.target as Element | null;
      const a = t && t.closest ? t.closest('a[href^="tel:"]') : null;
      if (!a) return;
      const location = a.closest('footer') ? 'footer' : a.closest(SITE_HEADER) ? 'header' : 'content';
      const now = currentScrollPct();
      if (now > maxScroll) maxScroll = now;

      const payload: Record<string, unknown> = {
        event: 'phone_click',
        link_location: location,
        scroll_pct: now,
        max_scroll_pct: maxScroll,
        time_on_page_s: Math.max(0, Math.round(performance.now() / 1000)),
      };
      try {
        const section = sectionFor(a, location === 'header');
        if (section) payload.page_section = section;
      } catch {
        /* never let tracking break the call */
      }
      Object.assign(payload, journeyParams(safeAttribution()));

      const w = window as unknown as { dataLayer?: unknown[] };
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push(payload);
    },
    true,
  );
}
