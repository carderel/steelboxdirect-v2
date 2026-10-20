import { describe, it, expect } from 'vitest';
import {
  addDays,
  isWeekday,
  lastWeekdays,
  latestCompletedDay,
  dateInZone,
  normalizeDate,
  checkNoLeads,
  checkTrafficCollapse,
  checkSilentEvents,
  checkSmoke,
  decideAlertAction,
  extractFingerprint,
  fingerprintOf,
  renderAlertBody,
} from './ga4Monitor.mjs';

// 2026-10-19 is a Monday.
const MON = '2026-10-19';
const TUE = '2026-10-20';
const SAT = '2026-10-17';

function daily(eventName: string, from: string, to: string, count = 1) {
  const rows = [];
  for (let d = from; d <= to; d = addDays(d, 1)) rows.push({ date: d.replace(/-/g, ''), eventName, count });
  return rows;
}

describe('date helpers', () => {
  it('normalizes GA4 YYYYMMDD and passes through ISO', () => {
    expect(normalizeDate('20261019')).toBe('2026-10-19');
    expect(normalizeDate('2026-10-19')).toBe('2026-10-19');
    expect(() => normalizeDate('10/19/2026')).toThrow();
  });
  it('adds days across a month boundary', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
  it('knows weekends', () => {
    expect(isWeekday(MON)).toBe(true);
    expect(isWeekday(SAT)).toBe(false);
    expect(isWeekday('2026-10-18')).toBe(false);
  });
  it('lastWeekdays skips the weekend', () => {
    expect(lastWeekdays('2026-10-18', 2)).toEqual(['2026-10-16', '2026-10-15']);
    expect(lastWeekdays(MON, 2)).toEqual([MON, '2026-10-16']);
  });
  it('latestCompletedDay never returns today, even with lag 0', () => {
    expect(latestCompletedDay(TUE)).toBe(MON);
    expect(latestCompletedDay(TUE, 0)).toBe(MON);
    expect(latestCompletedDay(TUE, 2)).toBe('2026-10-18');
  });
  it('dateInZone uses the property timezone, not UTC', () => {
    // 02:00 UTC on the 20th is still the 19th in New York.
    expect(dateInZone(new Date('2026-10-20T02:00:00Z'), 'America/New_York')).toBe('2026-10-19');
  });
});

describe('checkNoLeads', () => {
  it('alerts when both lead events are zero on the last two weekdays', () => {
    const r = checkNoLeads([], MON);
    expect(r.ok).toBe(false);
    expect(r.message).toContain('Friday 2026-10-16');
    expect(r.message).toContain('Monday 2026-10-19');
  });
  it('a callback lead alone is enough', () => {
    const rows = [{ date: '20261016', eventName: 'generate_lead_callback', count: 1 }];
    expect(checkNoLeads(rows, MON).ok).toBe(true);
  });
  it('a generate_lead alone is enough', () => {
    const rows = [{ date: '20261019', eventName: 'generate_lead', count: 2 }];
    expect(checkNoLeads(rows, MON).ok).toBe(true);
  });
  it('weekend leads do not count and weekend zeros do not alert on their own', () => {
    // Latest completed day is Sunday: the window is Thursday and Friday, not Saturday and Sunday.
    const weekendOnly = [{ date: '20261017', eventName: 'generate_lead', count: 5 }];
    expect(checkNoLeads(weekendOnly, '2026-10-18').ok).toBe(false);
    const friday = [{ date: '20261016', eventName: 'generate_lead', count: 1 }];
    expect(checkNoLeads(friday, '2026-10-18').ok).toBe(true);
  });
  it('ignores unrelated events', () => {
    const rows = daily('page_view', '2026-10-01', MON, 100);
    expect(checkNoLeads(rows, MON).ok).toBe(false);
  });
});

describe('checkTrafficCollapse', () => {
  const baselineRows = [7, 14, 21, 28].map((k) => ({ date: addDays(MON, -k), sessions: 100 }));
  it('alerts below 30% of the same-weekday baseline', () => {
    const r = checkTrafficCollapse([...baselineRows, { date: MON, sessions: 29 }], MON);
    expect(r.ok).toBe(false);
    expect(r.message).toContain('29%');
  });
  it('passes at exactly 30%', () => {
    expect(checkTrafficCollapse([...baselineRows, { date: MON, sessions: 30 }], MON).ok).toBe(true);
  });
  it('treats a missing day as zero sessions', () => {
    expect(checkTrafficCollapse(baselineRows, MON).ok).toBe(false);
  });
  it('compares only to the same weekday', () => {
    // Huge Tuesday numbers must not raise a Monday baseline.
    const noise = [6, 13, 20, 27].map((k) => ({ date: addDays(MON, -k), sessions: 10_000 }));
    expect(checkTrafficCollapse([...baselineRows, ...noise, { date: MON, sessions: 50 }], MON).ok).toBe(true);
  });
  it('abstains when the baseline is too small to mean anything', () => {
    const tiny = [7, 14, 21, 28].map((k) => ({ date: addDays(MON, -k), sessions: 4 }));
    const r = checkTrafficCollapse([...tiny, { date: MON, sessions: 0 }], MON);
    expect(r.ok).toBe(true);
    expect(r.skipped).toBe(true);
  });
  it('never prints absolute session counts (public repo)', () => {
    const r = checkTrafficCollapse([...baselineRows, { date: MON, sessions: 12 }], MON);
    expect(r.message).not.toMatch(/\b100\b/);
    expect(r.message).not.toMatch(/\b12 sessions\b/);
  });
});

describe('checkSilentEvents', () => {
  const recentStart = addDays(MON, -6);
  const priorEnd = addDays(recentStart, -1);
  const priorStart = addDays(recentStart, -28);

  it('alerts on an event that fired in the prior 28 days and is zero for 7', () => {
    const rows = [...daily('form_start', priorStart, priorEnd), ...daily('page_view', priorStart, MON)];
    const r = checkSilentEvents(rows, MON);
    expect(r.ok).toBe(false);
    expect(r.message).toContain('form_start');
    expect(r.message).not.toContain('page_view,');
    expect(r.fingerprint).toBe('silent-events:form_start');
  });
  it('one hit in the last 7 days keeps it alive', () => {
    const rows = [...daily('form_start', priorStart, priorEnd), { date: MON, eventName: 'form_start', count: 1 }];
    expect(checkSilentEvents(rows, MON).ok).toBe(true);
  });
  it('an event that never fired is not silent, it is absent', () => {
    expect(checkSilentEvents([], MON).ok).toBe(true);
  });
  it('ignores firings older than the 28 day prior window', () => {
    const rows = [{ date: addDays(priorStart, -1), eventName: 'generate_lead', count: 3 }];
    expect(checkSilentEvents(rows, MON).ok).toBe(true);
  });
  it('holds phone_click out until it fires on or after 2026-10-20', () => {
    // Fired before the GTM fix, silent since: not armed, so no alert.
    const preFix = daily('phone_click', '2026-10-01', '2026-10-10');
    const r = checkSilentEvents(preFix, '2026-10-25');
    expect(r.ok).toBe(true);
    expect(r.message).toContain('phone_click');
    // Fired after the fix, then silent for 7 days: armed, so it alerts.
    const armed = daily('phone_click', '2026-10-20', '2026-10-22');
    const later = checkSilentEvents(armed, '2026-10-29');
    expect(later.ok).toBe(false);
    expect(later.fingerprint).toBe('silent-events:phone_click');
  });
  it('fingerprint is order independent', () => {
    const rows = [...daily('page_view', priorStart, priorEnd), ...daily('form_start', priorStart, priorEnd)];
    expect(checkSilentEvents(rows, MON).fingerprint).toBe('silent-events:form_start,page_view');
  });
});

describe('checkSmoke', () => {
  const ok = [
    { name: 'home', url: 'https://x/', method: 'GET', expectStatus: 200, status: 200, body: '' },
    {
      name: 'api',
      url: 'https://x/api/submit-quote',
      method: 'POST',
      expectStatus: 400,
      expectBodyIncludes: 'Missing required field',
      status: 400,
      body: '{"error":"Missing required field: name"}',
    },
  ];
  it('passes when every probe matches', () => {
    expect(checkSmoke(ok).ok).toBe(true);
  });
  it('fails on a wrong status', () => {
    const r = checkSmoke([{ ...ok[0], status: 503 }, ok[1]]);
    expect(r.ok).toBe(false);
    expect(r.fingerprint).toBe('smoke:home');
    expect(r.message).toContain('503');
  });
  it('fails when the API answers 400 for the wrong reason', () => {
    const r = checkSmoke([ok[0], { ...ok[1], body: '{"error":"Invalid request body"}' }]);
    expect(r.ok).toBe(false);
    expect(r.fingerprint).toBe('smoke:api');
  });
  it('fails on a transport error', () => {
    const r = checkSmoke([{ ...ok[0], status: undefined, error: 'ECONNRESET' }]);
    expect(r.ok).toBe(false);
    expect(r.message).toContain('ECONNRESET');
  });
});

describe('alert dedupe', () => {
  const fail = { id: 'no-leads', ok: false, fingerprint: 'no-leads', message: 'x' };
  const pass = { id: 'smoke', ok: true, message: 'fine' };

  it('creates when failing and nothing is open', () => {
    expect(decideAlertAction({ findings: [fail, pass], openIssue: null, complete: true }).action).toBe('create');
  });
  it('stays quiet on the same open problem', () => {
    expect(decideAlertAction({ findings: [fail], openIssue: { number: 1, fingerprint: 'no-leads' }, complete: true }).action).toBe('none');
  });
  it('comments when the problem set changes', () => {
    const more = [fail, { id: 'smoke', ok: false, fingerprint: 'smoke:home', message: 'y' }];
    const d = decideAlertAction({ findings: more, openIssue: { number: 1, fingerprint: 'no-leads' }, complete: true });
    expect(d).toEqual({ action: 'comment', fingerprint: 'no-leads|smoke:home' });
  });
  it('closes on a fully green run only', () => {
    expect(decideAlertAction({ findings: [pass], openIssue: { number: 1, fingerprint: 'no-leads' }, complete: true }).action).toBe('close');
    expect(decideAlertAction({ findings: [pass], openIssue: { number: 1, fingerprint: 'no-leads' }, complete: false }).action).toBe('none');
  });
  it('does nothing when green and nothing is open', () => {
    expect(decideAlertAction({ findings: [pass], openIssue: null, complete: true }).action).toBe('none');
  });
  it('round trips the fingerprint through the rendered body, latest comment winning', () => {
    const body = renderAlertBody([fail, pass], { latest: MON });
    expect(extractFingerprint([body])).toBe('no-leads');
    const later = renderAlertBody([{ ...fail, id: 'smoke', fingerprint: 'smoke:home' }]);
    expect(extractFingerprint([body, later])).toBe('smoke:home');
    expect(extractFingerprint(['no marker here'])).toBeNull();
    expect(fingerprintOf([pass])).toBe('');
  });
});
