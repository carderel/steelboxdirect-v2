// src/data/googleReviews.ts
//
// Typed wrapper over src/data/googleReviews.json, the ONLY place the Google review count and star
// average are stored. Every surface that shows them (footer review band, homepage hero line, /about/,
// /ai-info/) reads reviewsDisplay() from here. Never hand type a review count anywhere else in src/:
// src/lib/compliance/review-count-guard.test.ts fails the suite if one appears.
//
// BUILD TIME ONLY. reviewsDisplay() runs in Astro frontmatter during the static build, with the build
// moment as its clock. There is no client script, no runtime call to Google and no CSP change.
//
// THE STALE RULE (src/lib/reviews/googleReviewsRules.mjs): the figure shows for up to 24 days after
// checkedAt and is hidden from day 25 on. Hidden means show is false and every caller renders its
// plain leave a review fallback. Invalid data (zero, blank, NaN, out of range stars, future date) is
// treated exactly like stale data, so a visitor never sees 0 or an empty number.
//
// COPY. The word for the score is stars, never the r word, because the PROJECT_HS_003 content guard
// treats that word as a structural load topic. The verb is checked, not as of or updated, because a
// check can find the same count as last week.
//
// SCHEMA. None. No AggregateRating, on purpose: Google treats a business marking up its own Google
// reviews as self serving and ineligible, see src/lib/schema/entities.test.ts.

import record from './googleReviews.json';
import {
  ageInDays,
  formatCheckedDate,
  isShowable,
  MAX_SHOW_AGE_DAYS,
} from '../lib/reviews/googleReviewsRules.mjs';

export interface GoogleReviewsRecord {
  source: 'owner-manual' | 'google-business-profile-api';
  profileUrl: string;
  reviewUrl: string;
  averageStars: number;
  reviewCount: number;
  checkedAt: string;
}

export const googleReviews: GoogleReviewsRecord = record as GoogleReviewsRecord;

/** Public profile and leave a review links. Safe to render whether or not the figure shows. */
export const GOOGLE_PROFILE_URL = googleReviews.profileUrl;
export const GOOGLE_REVIEW_URL = googleReviews.reviewUrl;

interface HiddenDisplay {
  show: false;
  profileUrl: string;
  reviewUrl: string;
  ageDays: number;
}

interface ShownDisplay {
  show: true;
  profileUrl: string;
  reviewUrl: string;
  ageDays: number;
  /** One decimal, e.g. 5.0 */
  starsText: string;
  /** Whole stars rounded DOWN, then hollow stars to five, so a 4.8 never shows five full stars. */
  starGlyphs: string;
  count: number;
  /** 11 Google reviews, or 1 Google review */
  countLabel: string;
  /** November 7, 2026 */
  checkedLabel: string;
  /** 5.0 stars from 11 Google reviews */
  summary: string;
  /** 5.0 stars from 11 Google reviews, checked November 7, 2026 */
  sentence: string;
}

export type ReviewsDisplay = HiddenDisplay | ShownDisplay;

export function starGlyphs(stars: number): string {
  const full = Math.max(0, Math.min(5, Math.floor(stars + 1e-9)));
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

export function countLabel(count: number): string {
  return count === 1 ? '1 Google review' : `${count} Google reviews`;
}

/**
 * What to render, decided at build time.
 * @param buildDate the moment of the build; injectable for tests
 * @param data the record; injectable for tests
 */
export function reviewsDisplay(
  buildDate: Date = new Date(),
  data: GoogleReviewsRecord = googleReviews,
): ReviewsDisplay {
  const ageDays = ageInDays(data?.checkedAt, buildDate);
  const profileUrl = typeof data?.profileUrl === 'string' ? data.profileUrl : googleReviews.profileUrl;
  const reviewUrl = typeof data?.reviewUrl === 'string' ? data.reviewUrl : googleReviews.reviewUrl;
  if (!isShowable(data, buildDate)) {
    return { show: false, profileUrl, reviewUrl, ageDays };
  }
  const starsText = data.averageStars.toFixed(1);
  const checkedLabel = formatCheckedDate(data.checkedAt);
  const summary = `${starsText} stars from ${countLabel(data.reviewCount)}`;
  return {
    show: true,
    profileUrl,
    reviewUrl,
    ageDays,
    starsText,
    starGlyphs: starGlyphs(data.averageStars),
    count: data.reviewCount,
    countLabel: countLabel(data.reviewCount),
    checkedLabel,
    summary,
    sentence: `${summary}, checked ${checkedLabel}`,
  };
}

export { MAX_SHOW_AGE_DAYS };
