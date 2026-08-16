# Decision — Supabase keep-alive (prevent free-tier idle pause)

**Date:** 2026-07-10
**Status:** Approved by owner
**Context:** Supabase project `qwgbfrvjhgcpwzhclqnn` was found paused (free tier auto-pauses after ~7 days of inactivity), which took lead persistence + `/admin` down 2026-07-04 → owner restored it 2026-07-09 (Scenario A, 1-click, endpoint verified back: DNS resolves, REST 401=healthy). Owner wants to stay on **free tier** for now (low-volume POC) and revisit paid at real volume.

## Decision
Add a **GitHub Actions scheduled workflow** that pings the Supabase REST API on a cron so the project never crosses the 7-day inactivity threshold. $0.

### Why GitHub Actions over a Cloudflare Worker
- Site is **Cloudflare Pages** (`@astrojs/cloudflare`, `output: hybrid`), GitHub-connected (push→deploy). **No wrangler/Worker infra exists**, and Cloudflare **Pages has no native cron** — a CF-native ping would require standing up a separate Worker (new wrangler deploy + secret pipeline).
- The repo is already on GitHub → a scheduled workflow is one committed YAML + repo secrets, no new tooling, no second deploy pipeline. Same result, far less friction. (Owner chose this option explicitly.)

### Design
- **Cadence:** every 3 days (`cron: '0 6 */3 * *'`), NOT weekly — a 7-day cron races the 7-day pause threshold; 3 days gives comfortable margin. Plus `workflow_dispatch` for manual runs.
- **Ping:** `curl -fsS "$SUPABASE_URL/rest/v1/leads?select=id&limit=1"` with `apikey` + `Authorization: Bearer` headers. A PostgREST select executes a real DB query = activity that resets the idle timer. `-f` fails the job on HTTP 4xx/5xx (alerts us if the key/endpoint breaks).
- **Key:** uses the **anon** key (already a PUBLIC value in the client bundle), NOT the service_role key — smallest blast radius. RLS on `leads` filters anon to empty, but the query still hits Postgres (200 `[]`), which is sufficient to count as activity.
- **Secrets:** `SUPABASE_URL` + `SUPABASE_ANON_KEY` as GitHub repo secrets. No literal keys in the file (HS-SEC-001).
- **Least privilege:** `permissions: {}` (job needs no repo token).

## Known limitations (flagged to owner)
- GitHub disables scheduled workflows after **60 days of repo inactivity** — fine for an active project; if the repo ever goes quiet 60d, the cron stops (and the DB would then be at risk of pausing again).
- Keep-alive is a moving part: if it silently fails and no one notices, the DB can still pause. Acceptable at POC volume + the Resend email safety net remains the backstop.
- **Revisit at real volume → Supabase Pro (~$25/mo, no auto-pause)** = the maintenance-free fix. Tracked.

## Owner setup (one-time)
1. GitHub repo → Settings → Secrets and variables → Actions → add repo secrets:
   - `SUPABASE_URL` = `https://qwgbfrvjhgcpwzhclqnn.supabase.co`
   - `SUPABASE_ANON_KEY` = the anon/public key (Supabase → Project Settings → API → anon public, or local `.env` `PUBLIC_SUPABASE_ANON_KEY`).
2. Actions tab → "Supabase keep-alive" → Run workflow (manual) to confirm green.
