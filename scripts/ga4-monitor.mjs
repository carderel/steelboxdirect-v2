#!/usr/bin/env node
/**
 * scripts/ga4-monitor.mjs
 *
 * The daily GA4 and production health monitor (owner approved 2026-10-19). Runs from
 * .github/workflows/ga4-monitor.yml. Every rule lives in src/lib/monitoring/ga4Monitor.mjs as a pure
 * function with unit tests; this file only fetches and reports.
 *
 * WHAT IT READS
 *   GA4_SA_KEY         service account JSON (raw or base64). The account needs Viewer on the property.
 *   GA4_PROPERTY_ID    numeric GA4 property id.
 *   GA4_TIMEZONE       property timezone, default America/New_York.
 *   GA4_LAG_DAYS       completed day offset, default 1 (yesterday). Today is never read.
 *   SITE_URL           default https://steelboxdirect.com
 *   GITHUB_TOKEN, GITHUB_REPOSITORY   for the alert issue. Absent, or --dry-run, means print only.
 *
 * WHAT IT DOES WHEN GA4 IS NOT CONFIGURED. The production smoke probes still run (they need no
 * secret) and still alert. The GA4 checks are reported as NOT RUN, the job exits 1 with one clear
 * ::error:: line, and NO issue is opened for the missing configuration, so an unconfigured monitor
 * is visibly red without filing the same issue every day. A not run check is never reported as a
 * pass, and an open alert issue is only auto closed by a run in which every check actually ran.
 *
 * AUTH. A signed JWT exchanged for an access token, done with node:crypto so the job needs no
 * dependency beyond Node itself. Scope is analytics.readonly.
 *
 * EXIT CODES. 0 healthy, or a problem that is already reported on the open issue (a ::warning::).
 * 1 a new alert was raised, a check could not run, or the GA4 API failed.
 */

import { createSign } from 'node:crypto';
import { appendFileSync } from 'node:fs';
import {
  LEAD_EVENTS,
  MONITORED_EVENTS,
  DEFAULTS,
  addDays,
  dateInZone,
  latestCompletedDay,
  checkNoLeads,
  checkTrafficCollapse,
  checkSilentEvents,
  checkSmoke,
  decideAlertAction,
  extractFingerprint,
  renderAlertBody,
  fingerprintComment,
} from '../src/lib/monitoring/ga4Monitor.mjs';

const LABEL = 'ga4-monitor';
const DRY_RUN = process.argv.includes('--dry-run') || !process.env.GITHUB_TOKEN;
const SITE = (process.env.SITE_URL || 'https://steelboxdirect.com').replace(/\/$/, '');
const TZ = process.env.GA4_TIMEZONE || 'America/New_York';
const LAG = Number(process.env.GA4_LAG_DAYS || DEFAULTS.lagDays);
const CITY_PATH = '/locations/ohio/cincinnati-shipping-containers/';

const summary = [];
const log = (line) => {
  console.log(line);
  summary.push(line);
};

function parseKey(raw) {
  const text = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
  const key = JSON.parse(text);
  if (!key.client_email || !key.private_key) throw new Error('GA4_SA_KEY lacks client_email or private_key');
  return key;
}

const b64url = (buf) => Buffer.from(buf).toString('base64url');

async function accessToken(key) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(
    JSON.stringify({
      iss: key.client_email,
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    }),
  );
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${claims}`);
  const jwt = `${header}.${claims}.${b64url(signer.sign(key.private_key))}`;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.access_token) throw new Error(`token exchange failed: HTTP ${res.status} ${body.error ?? ''}`);
  return body.access_token;
}

async function runReport(token, propertyId, request) {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(request),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`runReport failed: HTTP ${res.status} ${body.error?.status ?? ''} ${body.error?.message ?? ''}`.trim());
  return body.rows ?? [];
}

async function fetchGa4(key, propertyId, latest) {
  const token = await accessToken(key);
  const dateRanges = [{ startDate: addDays(latest, -35), endDate: latest }];
  const events = [...new Set([...MONITORED_EVENTS, ...LEAD_EVENTS])];
  const eventRows = await runReport(token, propertyId, {
    dateRanges,
    dimensions: [{ name: 'date' }, { name: 'eventName' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: { filter: { fieldName: 'eventName', inListFilter: { values: events } } },
    limit: 10000,
  });
  const sessionRows = await runReport(token, propertyId, {
    dateRanges,
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'sessions' }],
    limit: 1000,
  });
  return {
    events: eventRows.map((r) => ({ date: r.dimensionValues[0].value, eventName: r.dimensionValues[1].value, count: Number(r.metricValues[0].value) })),
    sessions: sessionRows.map((r) => ({ date: r.dimensionValues[0].value, sessions: Number(r.metricValues[0].value) })),
  };
}

async function probe(p) {
  try {
    const res = await fetch(p.url, {
      method: p.method,
      redirect: 'manual',
      headers: { 'user-agent': 'sbd-ga4-monitor (+github actions)', ...(p.body ? { 'content-type': 'application/json' } : {}) },
      body: p.body,
      signal: AbortSignal.timeout(30_000),
    });
    return { ...p, status: res.status, body: (await res.text()).slice(0, 2000) };
  } catch (err) {
    return { ...p, error: err?.message ?? String(err) };
  }
}

async function smoke() {
  const probes = [
    { name: 'home', url: `${SITE}/`, method: 'GET', expectStatus: 200 },
    { name: 'quote', url: `${SITE}/quote/`, method: 'GET', expectStatus: 200 },
    { name: 'city', url: `${SITE}${CITY_PATH}`, method: 'GET', expectStatus: 200 },
    // An empty object: the function rejects it at validation, before any database or email work, so
    // nothing is stored and nobody is notified. Never send field values here.
    { name: 'submit-quote', url: `${SITE}/api/submit-quote`, method: 'POST', body: '{}', expectStatus: 400, expectBodyIncludes: 'Missing required field' },
  ];
  return checkSmoke(await Promise.all(probes.map(probe)));
}

async function gh(path, init = {}) {
  const res = await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      ...(init.body ? { 'content-type': 'application/json' } : {}),
    },
  });
  const body = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, body };
}

async function findOpenIssue() {
  const list = await gh(`/issues?labels=${LABEL}&state=open&per_page=1&sort=created&direction=desc`);
  if (!list.ok) throw new Error(`issue lookup failed: HTTP ${list.status}`);
  const issue = (list.body ?? []).find((i) => !i.pull_request);
  if (!issue) return null;
  const comments = await gh(`/issues/${issue.number}/comments?per_page=100`);
  const texts = [issue.body, ...(comments.ok ? comments.body.map((c) => c.body) : [])];
  return { number: issue.number, fingerprint: extractFingerprint(texts) };
}

async function main() {
  const findings = [];
  const notRun = [];
  const today = dateInZone(new Date(), TZ);
  const latest = latestCompletedDay(today, LAG);
  log(`### GA4 monitor`);
  log('');
  log(`Today in ${TZ}: ${today}. Latest completed day checked: ${latest}.`);

  findings.push(await smoke());

  const rawKey = process.env.GA4_SA_KEY || '';
  const propertyId = (process.env.GA4_PROPERTY_ID || '').trim();
  if (!rawKey || !propertyId) {
    const missing = [!rawKey && 'GA4_SA_KEY (secret)', !propertyId && 'GA4_PROPERTY_ID (variable or secret)'].filter(Boolean).join(' and ');
    notRun.push(`GA4 checks not run: missing ${missing}. Add under Settings, Secrets and variables, Actions. No issue is opened for this.`);
  } else {
    try {
      const data = await fetchGa4(parseKey(rawKey), propertyId, latest);
      findings.push(checkNoLeads(data.events, latest));
      findings.push(checkTrafficCollapse(data.sessions, latest));
      findings.push(checkSilentEvents(data.events, latest));
    } catch (err) {
      // Message only: never echo the key or the token.
      notRun.push(`GA4 checks not run: ${err?.message ?? err}. Check that GA4_SA_KEY is valid JSON for a service account with Viewer on property ${propertyId}, and that the Analytics Data API is enabled for its project.`);
    }
  }

  log('');
  for (const f of findings) log(`- ${f.ok ? 'PASS' : 'FAIL'} ${f.id}: ${f.message}`);
  for (const n of notRun) log(`- NOT RUN ${n}`);

  const complete = notRun.length === 0;
  let exitCode = complete ? 0 : 1;
  const runUrl = process.env.RUN_URL;

  if (DRY_RUN) {
    const d = decideAlertAction({ findings, openIssue: null, complete });
    log('');
    log(`Dry run: would ${d.action}${d.fingerprint ? ` (fingerprint ${d.fingerprint})` : ''}. No GitHub writes.`);
    if (d.action === 'create') exitCode = 1;
  } else {
    await gh('/labels', { method: 'POST', body: JSON.stringify({ name: LABEL, color: 'D93F0B', description: 'Daily GA4 and production health monitor' }) });
    const openIssue = await findOpenIssue();
    const d = decideAlertAction({ findings, openIssue, complete });
    const body = renderAlertBody(findings, { runUrl, latest });
    if (d.action === 'create') {
      const r = await gh('/issues', { method: 'POST', body: JSON.stringify({ title: `GA4 monitor: problem detected as of ${today}`, labels: [LABEL], body }) });
      if (!r.ok) throw new Error(`issue create failed: HTTP ${r.status}`);
      log(`\nOpened issue #${r.body.number}.`);
      exitCode = 1;
    } else if (d.action === 'comment') {
      const r = await gh(`/issues/${openIssue.number}/comments`, { method: 'POST', body: JSON.stringify({ body: `The set of problems changed.\n\n${body}` }) });
      if (!r.ok) throw new Error(`issue comment failed: HTTP ${r.status}`);
      log(`\nCommented on issue #${openIssue.number}: the problem set changed.`);
      exitCode = 1;
    } else if (d.action === 'close') {
      await gh(`/issues/${openIssue.number}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body: `All checks passed with data through ${latest}. Closing.\n\n${runUrl ? `Run log: ${runUrl}\n\n` : ''}${fingerprintComment('')}` }),
      });
      await gh(`/issues/${openIssue.number}`, { method: 'PATCH', body: JSON.stringify({ state: 'closed', state_reason: 'completed' }) });
      log(`\nAll green: closed issue #${openIssue.number}.`);
    } else if (d.fingerprint) {
      console.log(`::warning::Still failing (${d.fingerprint}); already reported on issue #${openIssue.number}, so no new alert.`);
      log(`\nAlready reported on issue #${openIssue.number}; no new alert.`);
    }
  }

  for (const n of notRun) console.log(`::error::${n}`);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary.join('\n') + '\n');
  process.exit(exitCode);
}

main().catch((err) => {
  console.log(`::error::GA4 monitor crashed: ${err?.message ?? err}`);
  process.exit(1);
});
