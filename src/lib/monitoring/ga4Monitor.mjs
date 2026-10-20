/**
 * GA4 MONITOR, THE PURE HALF
 * ==========================
 *
 * WHAT THIS FILE IS. Every decision the daily GA4 monitor makes, expressed as pure functions over
 * plain data. Nothing here reads the network, the disk or the clock: the runner in
 * scripts/ga4-monitor.mjs fetches the GA4 report, the production responses and the open issue, and
 * hands them in. That split is what lets every alert rule carry a unit test
 * (ga4Monitor.test.ts beside this file) instead of being discovered on a live Tuesday.
 *
 * Owner approval: 2026-10-19. Workflow: .github/workflows/ga4-monitor.yml.
 *
 * DATES. Every date is a GA4 style string, YYYY-MM-DD, in the PROPERTY timezone, because that is
 * how the Data API reports the date dimension. Arithmetic is done on UTC midnights of those strings
 * so no runner timezone or daylight saving shift can move a day.
 *
 * DATA LAG. The monitor only ever looks at COMPLETED days. latestCompletedDay() is today in the
 * property timezone minus lagDays (default 1). Today itself is never read: a partial day would look
 * like a traffic collapse every morning.
 *
 * PUBLIC REPOSITORY. Findings land in public GitHub issues and public Actions logs, so finding
 * messages carry ratios and day names, never absolute session counts.
 */

export const MONITORED_EVENTS = ['page_view', 'generate_lead', 'form_start', 'phone_click'];
export const LEAD_EVENTS = ['generate_lead', 'generate_lead_callback'];

/** phone_click only joins the silent event check once it has fired on or after this date (GTM fix pending). */
export const PHONE_CLICK_ARMED_SINCE = '2026-10-20';

export const DEFAULTS = {
  lagDays: 1,
  trafficRatio: 0.3,
  minBaselineSessions: 10,
  silentDays: 7,
  priorDays: 28,
};

const DAY_MS = 86_400_000;

/** GA4 reports the date dimension as YYYYMMDD; accept that or YYYY-MM-DD and return YYYY-MM-DD. */
export function normalizeDate(raw) {
  const s = String(raw);
  if (/^\d{8}$/.test(s)) return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  throw new Error(`unrecognised date: ${s}`);
}

export function addDays(date, n) {
  const t = Date.parse(`${date}T00:00:00Z`) + n * DAY_MS;
  return new Date(t).toISOString().slice(0, 10);
}

/** 0 Sunday through 6 Saturday. */
export function weekday(date) {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

export function isWeekday(date) {
  const d = weekday(date);
  return d !== 0 && d !== 6;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export function dayLabel(date) {
  return `${DAY_NAMES[weekday(date)]} ${date}`;
}

/** Today's calendar date in a timezone, as YYYY-MM-DD. The only function here that takes an instant. */
export function dateInZone(instant, timeZone) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(instant);
}

export function latestCompletedDay(todayInZone, lagDays = DEFAULTS.lagDays) {
  return addDays(todayInZone, -Math.max(1, lagDays));
}

/**
 * Turn GA4 rows into a lookup. rows: [{ date, eventName, count }] (date in either GA4 form).
 * Returns { get(eventName, date) } with missing cells reading as zero, because GA4 omits rows with
 * no events rather than returning a zero.
 */
export function eventTable(rows) {
  const map = new Map();
  for (const r of rows) {
    const key = `${r.eventName}|${normalizeDate(r.date)}`;
    map.set(key, (map.get(key) ?? 0) + Number(r.count ?? 0));
  }
  return {
    get: (eventName, date) => map.get(`${eventName}|${date}`) ?? 0,
    dates: (eventName) =>
      [...map.entries()]
        .filter(([k, v]) => k.startsWith(`${eventName}|`) && v > 0)
        .map(([k]) => k.split('|')[1]),
  };
}

export function sessionTable(rows) {
  const map = new Map();
  for (const r of rows) map.set(normalizeDate(r.date), (map.get(normalizeDate(r.date)) ?? 0) + Number(r.sessions ?? 0));
  return (date) => map.get(date) ?? 0;
}

/** The n most recent weekdays on or before `latest`. */
export function lastWeekdays(latest, n = 2) {
  const out = [];
  let d = latest;
  while (out.length < n) {
    if (isWeekday(d)) out.push(d);
    d = addDays(d, -1);
  }
  return out;
}

/**
 * CHECK 1, no leads. Fires when BOTH lead events are zero on each of the last two completed
 * weekdays. Weekends are skipped entirely: buyers are mostly businesses and a quiet Saturday is
 * normal, so a weekend zero never counts toward the alert.
 */
export function checkNoLeads(eventRows, latest) {
  const t = eventTable(eventRows);
  const days = lastWeekdays(latest, 2);
  const total = days.reduce((sum, d) => sum + LEAD_EVENTS.reduce((s, e) => s + t.get(e, d), 0), 0);
  if (total > 0) return { id: 'no-leads', ok: true, message: `Leads recorded on ${days.map(dayLabel).join(' / ')}.` };
  return {
    id: 'no-leads',
    ok: false,
    fingerprint: 'no-leads',
    message: `Zero generate_lead and zero generate_lead_callback events on the last two completed weekdays (${days
      .slice()
      .reverse()
      .map(dayLabel)
      .join(' and ')}).`,
  };
}

/**
 * CHECK 2, traffic collapse. Yesterday's sessions against the mean of the same weekday in each of
 * the four prior weeks (the trailing 28 days). Below `ratio` of that mean is an alert. When the
 * baseline mean is under `minBaseline` sessions the check abstains, since 1 against 4 is noise.
 */
export function checkTrafficCollapse(sessionRows, latest, opts = {}) {
  const ratio = opts.ratio ?? DEFAULTS.trafficRatio;
  const minBaseline = opts.minBaseline ?? DEFAULTS.minBaselineSessions;
  const s = sessionTable(sessionRows);
  const priorDays = [7, 14, 21, 28].map((k) => addDays(latest, -k));
  const baseline = priorDays.reduce((sum, d) => sum + s(d), 0) / priorDays.length;
  const current = s(latest);
  if (baseline < minBaseline) {
    return { id: 'traffic-collapse', ok: true, skipped: true, message: `Baseline under ${minBaseline} sessions; traffic check abstained.` };
  }
  const pct = Math.round((current / baseline) * 100);
  if (current >= ratio * baseline) {
    return { id: 'traffic-collapse', ok: true, message: `${dayLabel(latest)} sessions at ${pct}% of the same-weekday 28 day baseline.` };
  }
  return {
    id: 'traffic-collapse',
    ok: false,
    fingerprint: 'traffic-collapse',
    message: `${dayLabel(latest)} sessions were ${pct}% of the trailing 28 day same-weekday average (alert threshold ${Math.round(
      ratio * 100,
    )}%).`,
  };
}

/**
 * CHECK 3, event went silent. An event that fired at least once in the 28 days BEFORE the last 7
 * days, and zero times in those 7, has gone silent: usually a GTM or tag change that broke it.
 * phone_click is held out until it has fired on or after PHONE_CLICK_ARMED_SINCE.
 */
export function checkSilentEvents(eventRows, latest, opts = {}) {
  const silentDays = opts.silentDays ?? DEFAULTS.silentDays;
  const priorDays = opts.priorDays ?? DEFAULTS.priorDays;
  const events = opts.events ?? MONITORED_EVENTS;
  const armedSince = opts.phoneClickArmedSince ?? PHONE_CLICK_ARMED_SINCE;
  const t = eventTable(eventRows);
  const recentStart = addDays(latest, -(silentDays - 1));
  const priorStart = addDays(recentStart, -priorDays);
  const priorEnd = addDays(recentStart, -1);
  const sumRange = (e, from, to) => {
    let total = 0;
    for (let d = from; d <= to; d = addDays(d, 1)) total += t.get(e, d);
    return total;
  };
  const silent = [];
  const skipped = [];
  for (const e of events) {
    if (e === 'phone_click' && !t.dates(e).some((d) => d >= armedSince)) {
      skipped.push(e);
      continue;
    }
    const prior = sumRange(e, priorStart, priorEnd);
    const recent = sumRange(e, recentStart, latest);
    if (prior > 0 && recent === 0) silent.push(e);
  }
  const skipNote = skipped.length ? ` Not yet armed: ${skipped.join(', ')}.` : '';
  if (!silent.length) return { id: 'silent-events', ok: true, message: `No monitored event went silent.${skipNote}` };
  return {
    id: 'silent-events',
    ok: false,
    fingerprint: `silent-events:${silent.slice().sort().join(',')}`,
    message: `Fired in the prior ${priorDays} days but zero in the ${silentDays} days ${recentStart} to ${latest}: ${silent.join(', ')}.${skipNote}`,
  };
}

/**
 * CHECK 4, production smoke. results: [{ name, url, method, expectStatus, expectBodyIncludes?,
 * status, body, error? }]. A transport error, a wrong status, or a missing body marker fails.
 */
export function checkSmoke(results) {
  const failures = [];
  const names = [];
  for (const r of results) {
    let why = null;
    if (r.error) why = `request failed (${r.error})`;
    else if (r.status !== r.expectStatus) why = `HTTP ${r.status}, expected ${r.expectStatus}`;
    else if (r.expectBodyIncludes && !String(r.body ?? '').includes(r.expectBodyIncludes))
      why = `HTTP ${r.status} but body lacks "${r.expectBodyIncludes}"`;
    if (why) {
      failures.push(`${r.method} ${r.url}: ${why}`);
      names.push(r.name);
    }
  }
  if (!failures.length) return { id: 'smoke', ok: true, message: `All ${results.length} production probes passed.` };
  return {
    id: 'smoke',
    ok: false,
    fingerprint: `smoke:${[...new Set(names)].sort().join(',')}`,
    message: failures.join('; '),
  };
}

/** Stable fingerprint for a set of findings. Same open problem means same fingerprint. */
export function fingerprintOf(findings) {
  return findings
    .filter((f) => !f.ok)
    .map((f) => f.fingerprint ?? f.id)
    .sort()
    .join('|');
}

export const FINGERPRINT_MARKER = 'ga4-monitor-fingerprint:';

export function fingerprintComment(fp) {
  return `<!-- ${FINGERPRINT_MARKER} ${fp} -->`;
}

/** The most recent fingerprint embedded in an issue body or its comments (later text wins). */
export function extractFingerprint(texts) {
  let last = null;
  const re = new RegExp(`<!-- ${FINGERPRINT_MARKER} (.*?) -->`, 'g');
  for (const text of texts) {
    for (const m of String(text ?? '').matchAll(re)) last = m[1];
  }
  return last;
}

/**
 * DEDUPE. One open issue under the monitor label at a time.
 *   no failures, no open issue          none
 *   no failures, open issue, complete   close   (only when every check actually ran)
 *   failures, no open issue             create
 *   failures, open issue, same print    none    (the same problem, already reported)
 *   failures, open issue, new print     comment (the problem changed)
 */
export function decideAlertAction({ findings, openIssue, complete }) {
  const fp = fingerprintOf(findings);
  if (!fp) {
    if (openIssue && complete) return { action: 'close', fingerprint: '' };
    return { action: 'none', fingerprint: '' };
  }
  if (!openIssue) return { action: 'create', fingerprint: fp };
  if (openIssue.fingerprint === fp) return { action: 'none', fingerprint: fp };
  return { action: 'comment', fingerprint: fp };
}

export function renderAlertBody(findings, { runUrl, latest } = {}) {
  const failing = findings.filter((f) => !f.ok);
  const passing = findings.filter((f) => f.ok);
  const lines = [];
  lines.push(`The GA4 monitor found ${failing.length} problem${failing.length === 1 ? '' : 's'}${latest ? ` (data through ${latest})` : ''}.`);
  lines.push('');
  for (const f of failing) lines.push(`- **${f.id}**: ${f.message}`);
  if (passing.length) {
    lines.push('');
    lines.push('Passing:');
    lines.push('');
    for (const f of passing) lines.push(`- ${f.id}: ${f.message}`);
  }
  lines.push('');
  lines.push('This issue gets a new comment only when the set of problems changes, and closes itself on the first fully green run.');
  if (runUrl) lines.push(`\nRun log: ${runUrl}`);
  lines.push('');
  lines.push(fingerprintComment(fingerprintOf(findings)));
  return lines.join('\n');
}
