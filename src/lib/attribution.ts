/**
 * Attribution Tracking Layer
 *
 * Captures and stores first-party attribution data in localStorage.
 * Data is attached to form submissions for full context preservation.
 */

const STORAGE_KEY = 'container_attribution';

export interface AttributionData {
  firstTouch: {
    source: string | null;
    medium: string | null;
    landingPage: string;
    timestamp: string;
    referrer: string | null;
  };
  session: {
    pagesVisited: string[];
    calculatorResult: string | null;
    startTime: number;
  };
}

/**
 * Get UTM parameters from URL
 */
function getUtmParams(): { source: string | null; medium: string | null } {
  if (typeof window === 'undefined') return { source: null, medium: null };

  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get('utm_source'),
    medium: params.get('utm_medium'),
  };
}

/**
 * Infer source/medium from referrer if no UTM params
 */
function inferSource(referrer: string | null): { source: string | null; medium: string | null } {
  if (!referrer) return { source: 'direct', medium: 'none' };

  try {
    const url = new URL(referrer);
    const hostname = url.hostname.toLowerCase();

    if (hostname.includes('google')) return { source: 'google', medium: 'organic' };
    if (hostname.includes('bing')) return { source: 'bing', medium: 'organic' };
    if (hostname.includes('yahoo')) return { source: 'yahoo', medium: 'organic' };
    if (hostname.includes('duckduckgo')) return { source: 'duckduckgo', medium: 'organic' };
    if (hostname.includes('facebook')) return { source: 'facebook', medium: 'social' };
    if (hostname.includes('twitter') || hostname.includes('x.com')) return { source: 'twitter', medium: 'social' };
    if (hostname.includes('linkedin')) return { source: 'linkedin', medium: 'social' };

    return { source: hostname, medium: 'referral' };
  } catch {
    return { source: 'unknown', medium: 'unknown' };
  }
}

/**
 * Initialize attribution tracking on page load
 * Call this on every page
 */
export function initAttribution(): void {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem(STORAGE_KEY);
  let data: AttributionData;

  if (stored) {
    // Existing session - update pages visited
    data = JSON.parse(stored);

    // Add current page if not already tracked
    const currentPath = window.location.pathname;
    if (!data.session.pagesVisited.includes(currentPath)) {
      data.session.pagesVisited.push(currentPath);
    }
  } else {
    // New session - capture first touch
    const utmParams = getUtmParams();
    const referrer = document.referrer || null;

    const { source, medium } = utmParams.source
      ? utmParams
      : inferSource(referrer);

    data = {
      firstTouch: {
        source,
        medium,
        landingPage: window.location.pathname,
        timestamp: new Date().toISOString(),
        referrer,
      },
      session: {
        pagesVisited: [window.location.pathname],
        calculatorResult: null,
        startTime: Date.now(),
      },
    };
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Record calculator result
 */
export function setCalculatorResult(result: string): void {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return;

  const data: AttributionData = JSON.parse(stored);
  data.session.calculatorResult = result;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Get attribution data for form submission
 */
export function getAttributionData(): AttributionData | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  return JSON.parse(stored);
}

/**
 * Calculate time on site in seconds
 */
export function getTimeOnSite(): number {
  if (typeof window === 'undefined') return 0;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return 0;

  const data: AttributionData = JSON.parse(stored);
  return Math.round((Date.now() - data.session.startTime) / 1000);
}

/**
 * Clear attribution data (call after successful form submission)
 */
export function clearAttribution(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Format attribution data for form submission
 */
export function formatForSubmission(): {
  first_touch_source: string | null;
  first_touch_medium: string | null;
  landing_page: string | null;
  pages_visited: string[];
  calculator_result: string | null;
  time_on_site_seconds: number;
  referrer: string | null;
} {
  const data = getAttributionData();

  if (!data) {
    return {
      first_touch_source: null,
      first_touch_medium: null,
      landing_page: null,
      pages_visited: [],
      calculator_result: null,
      time_on_site_seconds: 0,
      referrer: null,
    };
  }

  return {
    first_touch_source: data.firstTouch.source,
    first_touch_medium: data.firstTouch.medium,
    landing_page: data.firstTouch.landingPage,
    pages_visited: data.session.pagesVisited,
    calculator_result: data.session.calculatorResult,
    time_on_site_seconds: getTimeOnSite(),
    referrer: data.firstTouch.referrer,
  };
}
