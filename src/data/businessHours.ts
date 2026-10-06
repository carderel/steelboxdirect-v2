/**
 * Business hours: the single source for both the visible copy and the structured data.
 *
 * Owner confirmed 2026-10-06 that daily 9:00 to 21:00 Eastern matches the Google Business
 * Profile. The /contact/ and /ai-info/ pages render HOURS_LABEL, and the LocalBusiness node in
 * src/lib/schema/entities.ts emits OPENING_HOURS_SPECIFICATION, so the two cannot drift apart.
 *
 * No timezone appears in the schema: OpeningHoursSpecification has no timezone property, and
 * Google reads the hours in the business's local time. "Eastern" lives in visible copy only.
 */
export const OPENING_DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
] as const;
export const OPENS = '09:00';
export const CLOSES = '21:00';

/** "09:00" -> "9 AM", "21:00" -> "9 PM". Whole hours only, which is all this business uses. */
export function to12h(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}${m ? `:${String(m).padStart(2, '0')}` : ''} ${h < 12 ? 'AM' : 'PM'}`;
}

/** Visible range, e.g. "9 AM to 9 PM". Pages append "Eastern" or "ET" as their copy needs. */
export const HOURS_LABEL = `${to12h(OPENS)} to ${to12h(CLOSES)}`;

export const OPENING_HOURS_SPECIFICATION = {
  '@type': 'OpeningHoursSpecification',
  dayOfWeek: [...OPENING_DAYS],
  opens: OPENS,
  closes: CLOSES,
};
