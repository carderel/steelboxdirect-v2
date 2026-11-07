/**
 * src/lib/reviews/googleReviewsRules.mjs
 *
 * The ONE place the Google review count rules live. Plain JavaScript on purpose, so the same code is
 * imported by the typed site wrapper (src/data/googleReviews.ts, evaluated at build time) and by the
 * unattended writer (scripts/update-google-reviews.mjs, run from .github/workflows/google-reviews.yml)
 * and the daily age check in .github/workflows/geo-pricing-watchdog.yml. Two copies of a cutoff drift.
 *
 * Design: UDO Project/.outputs/research/2026-11-07-google-review-count-plan.md, sections 6.1 to 6.6.
 *
 * THE STALE RULE. The figure is shown for up to MAX_SHOW_AGE_DAYS whole days after checkedAt and is
 * hidden from day 25 on, which leaves a five day margin under the 30 calendar day storage limit in the
 * Business Profile API policy. The rule is evaluated when the site BUILDS, so it only bites when a
 * build happens. That is why the daily watchdog flags at FLAG_AGE_DAYS and calls a Cloudflare deploy
 * hook from REBUILD_AGE_DAYS on (when that secret exists).
 *
 * NEVER A ZERO. A missing, zero, fractional, negative or non numeric count, a star figure outside 1 to
 * 5, or an unparseable or future checkedAt all read as not showable, exactly like stale data. The
 * caller then falls back to the plain leave a review copy. A visitor never sees 0, a blank or NaN.
 *
 * No apostrophes or quote characters in comments here, and no em or en dashes anywhere (HS-OUT-001).
 */

/** Last whole day of age on which the figure still shows. Day 25 and later hides it. */
export const MAX_SHOW_AGE_DAYS = 24;
/** Age in days at which the daily watchdog flags the data on the tracking issue. */
export const FLAG_AGE_DAYS = 10;
/** Age in days from which the watchdog asks Cloudflare for a rebuild, if a deploy hook secret exists. */
export const REBUILD_AGE_DAYS = 22;
/** Last age at which the watchdog still asks for a rebuild. Past it the figure is long hidden. */
export const REBUILD_STOP_AGE_DAYS = 29;
/** A drop larger than this against the committed count is refused as a red flag. */
export const MAX_COUNT_DROP = 3;

/**
 * Whether the daily watchdog should comment on the tracking issue today. Flagging every single day
 * from day 10 would teach the owner to mute the issue, so: days 10, 13, 16 and 19, then EVERY day from
 * 22 to 25 (the rebuild window, where the figure is about to hide), then weekly. Invalid or missing
 * data always flags.
 * @param {number} age
 * @returns {boolean}
 */
export function watchdogNotifyToday(age) {
  if (!Number.isFinite(age)) return true;
  if (age < FLAG_AGE_DAYS) return false;
  if (age < REBUILD_AGE_DAYS) return (age - FLAG_AGE_DAYS) % 3 === 0;
  if (age <= MAX_SHOW_AGE_DAYS + 1) return true;
  return (age - (MAX_SHOW_AGE_DAYS + 1)) % 7 === 0;
}

export const ALLOWED_SOURCES = ['owner-manual', 'google-business-profile-api'];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Parse a YYYY-MM-DD string to a UTC midnight timestamp, or NaN when it is not a real calendar date.
 * @param {unknown} iso
 * @returns {number}
 */
export function parseIsoDate(iso) {
  if (typeof iso !== 'string') return NaN;
  const m = iso.match(ISO_DATE);
  if (!m) return NaN;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const t = Date.UTC(y, mo - 1, d);
  const back = new Date(t);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d) return NaN;
  return t;
}

/**
 * The UTC calendar date of a moment, as YYYY-MM-DD.
 * @param {Date} now
 * @returns {string}
 */
export function utcDateString(now) {
  return now.toISOString().slice(0, 10);
}

/**
 * Whole days between checkedAt and the UTC calendar date of now. NaN when checkedAt is invalid.
 * @param {unknown} checkedAt
 * @param {Date} now
 * @returns {number}
 */
export function ageInDays(checkedAt, now) {
  const checked = parseIsoDate(checkedAt);
  if (Number.isNaN(checked)) return NaN;
  const today = parseIsoDate(utcDateString(now));
  return Math.round((today - checked) / 86400000);
}

/**
 * November 7, 2026. Built by hand so the output never depends on the locale of the build machine.
 * @param {string} checkedAt
 * @returns {string}
 */
export function formatCheckedDate(checkedAt) {
  const t = parseIsoDate(checkedAt);
  if (Number.isNaN(t)) return '';
  const d = new Date(t);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/**
 * @param {unknown} stars
 * @returns {boolean}
 */
export function isValidStars(stars) {
  return typeof stars === 'number' && Number.isFinite(stars) && stars >= 1 && stars <= 5;
}

/**
 * @param {unknown} count
 * @returns {boolean}
 */
export function isValidCount(count) {
  return typeof count === 'number' && Number.isInteger(count) && count >= 1;
}

/**
 * Every reason a stored record cannot be shown, ignoring age. An empty list means the shape is good.
 * @param {any} record
 * @param {Date} now
 * @returns {string[]}
 */
export function recordProblems(record, now) {
  const problems = [];
  if (!record || typeof record !== 'object') return ['record is not an object'];
  if (!ALLOWED_SOURCES.includes(record.source)) problems.push('source is not a known source');
  if (!isValidStars(record.averageStars)) problems.push('averageStars is not a number from 1 to 5');
  if (!isValidCount(record.reviewCount)) problems.push('reviewCount is not a whole number of at least 1');
  const age = ageInDays(record.checkedAt, now);
  if (Number.isNaN(age)) problems.push('checkedAt is not a real YYYY-MM-DD date');
  else if (age < 0) problems.push('checkedAt is in the future');
  if (typeof record.profileUrl !== 'string' || !record.profileUrl.startsWith('https://')) problems.push('profileUrl is not an https URL');
  if (typeof record.reviewUrl !== 'string' || !record.reviewUrl.startsWith('https://')) problems.push('reviewUrl is not an https URL');
  return problems;
}

/**
 * Whether the stored figure may be shown on a build made at now.
 * @param {any} record
 * @param {Date} now
 * @returns {boolean}
 */
export function isShowable(record, now) {
  if (recordProblems(record, now).length > 0) return false;
  const age = ageInDays(record.checkedAt, now);
  return age >= 0 && age <= MAX_SHOW_AGE_DAYS;
}

/**
 * Parse a stars input from a form or CLI. Strings like 4.8 are accepted, anything else is NaN.
 * @param {unknown} raw
 * @returns {number}
 */
export function parseStarsInput(raw) {
  if (typeof raw === 'number') return raw;
  if (typeof raw !== 'string') return NaN;
  const s = raw.trim();
  if (!/^\d(?:\.\d+)?$/.test(s)) return NaN;
  return Number(s);
}

/**
 * Parse a count input. Only plain digits are accepted, so 11.5, 1e2, -3 and blank are all NaN.
 * @param {unknown} raw
 * @returns {number}
 */
export function parseCountInput(raw) {
  if (typeof raw === 'number') return raw;
  if (typeof raw !== 'string') return NaN;
  const s = raw.trim();
  if (!/^\d+$/.test(s)) return NaN;
  return Number(s);
}

/**
 * Validate a proposed update against the committed record. Nothing is written by this function.
 *
 * @param {any} previous the committed record
 * @param {{ stars: unknown, count: unknown, source?: string }} input raw values from the form or API
 * @param {Date} now
 * @returns {{ ok: true, next: object, changed: string[] } | { ok: false, reason: string }}
 */
export function validateUpdate(previous, input, now) {
  const stars = parseStarsInput(input.stars);
  const count = parseCountInput(input.count);
  if (!isValidCount(count)) {
    return { ok: false, reason: `count must be a whole number of at least 1, got ${JSON.stringify(input.count)}` };
  }
  if (!isValidStars(stars)) {
    return { ok: false, reason: `stars must be a number from 1.0 to 5.0, got ${JSON.stringify(input.stars)}` };
  }
  const prevCount = previous && isValidCount(previous.reviewCount) ? previous.reviewCount : null;
  if (prevCount !== null && prevCount - count > MAX_COUNT_DROP) {
    return {
      ok: false,
      reason: `count dropped from ${prevCount} to ${count}, more than ${MAX_COUNT_DROP}. Refused as a red flag; check the profile before entering it again`,
    };
  }
  const source = input.source ?? 'owner-manual';
  if (!ALLOWED_SOURCES.includes(source)) {
    return { ok: false, reason: `source must be one of ${ALLOWED_SOURCES.join(', ')}` };
  }
  const roundedStars = Math.round(stars * 10) / 10;
  const next = {
    source,
    profileUrl: previous?.profileUrl,
    reviewUrl: previous?.reviewUrl,
    averageStars: roundedStars,
    reviewCount: count,
    checkedAt: utcDateString(now),
  };
  const problems = recordProblems(next, now);
  if (problems.length > 0) {
    return { ok: false, reason: `the new record would not be showable: ${problems.join('; ')}` };
  }
  const changed = [];
  if (previous?.averageStars !== roundedStars) changed.push('averageStars');
  if (previous?.reviewCount !== count) changed.push('reviewCount');
  if (previous?.source !== source) changed.push('source');
  return { ok: true, next, changed };
}

/**
 * Serialise a record the way the committed file is laid out, with one decimal on the stars.
 * @param {any} record
 * @returns {string}
 */
export function serializeRecord(record) {
  const lines = [
    '{',
    `  "source": ${JSON.stringify(record.source)},`,
    `  "profileUrl": ${JSON.stringify(record.profileUrl)},`,
    `  "reviewUrl": ${JSON.stringify(record.reviewUrl)},`,
    `  "averageStars": ${Number(record.averageStars).toFixed(1)},`,
    `  "reviewCount": ${record.reviewCount},`,
    `  "checkedAt": ${JSON.stringify(record.checkedAt)}`,
    '}',
  ];
  return lines.join('\n') + '\n';
}
