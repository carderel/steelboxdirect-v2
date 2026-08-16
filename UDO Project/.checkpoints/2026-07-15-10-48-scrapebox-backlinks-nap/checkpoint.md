# Checkpoint — 2026-07-15 10:48 — ScrapeBox backlink playbook + NAP citation sheet

**Repo:** steelboxdirect-v2 · **Branch:** main · **HEAD == origin == a53ccd9** (no commits this session; all work is `.outputs/` analysis + a competitor-profiles/ doc)
**Mode:** Orchestrator (The Architect). All execution subagent-driven per UDO L002.

## What this session has produced so far (all read-only / analysis; no product code touched)

1. **Competitor teardown — WillScot** (`competitor-profiles/willscot.md`). Owner spotted the "Industries we cater to in Columbus OH" section. Finding: it's NOT programmatic city×industry pages — a fixed national set of 6 `/solutions/[industry]` hubs linked from every localized branch page under a city-stamped heading (hub-and-spoke + local relevance signal). WillScot has a real branch NAP + live-price inventory + zero schema on local pages. Strategic read: SBD already owns the pieces (4 use-case pages) — the transferable move is a localized "common uses in [City]" link block on the city-page template.

2. **City-page block — brainstorm IN PROGRESS (PAUSED).** Design landed: new `<section class="local-uses">` on `src/pages/[citySlug].astro` (flat sibling, safe insert), after `local-content`, before `cta-section`; mirrors `uc-city-grid` reversed; 4 constant persona cards → `/for/{farmers,contractors,homeowners,businesses}/`; ONE genuinely-local `usesIntro` per city (owner picked this over generic/per-persona). Draft intro lines written for all 4 cities. **NEXT for this thread:** owner to confirm the 4 intro lines + persona one-liners read right → then write spec (`docs/superpowers/specs/`) → writing-plans → build (astro-developer subagent) → verify. Tasks #2/#3/#4 still open.

3. **ScrapeBox backlink playbook** (`.outputs/seo/2026-07-15-scrapebox-backlink-playbook.md`). White-hat only — ScrapeBox as harvester/QA feeding MANUAL outreach; explicit ban on auto-poster/comment-spam (would risk the ranking+AI-cited site). Two plays: local citations (32 footprints + geo list + junk filter + SAB/NAP rules) and resource-page/broken-link outreach (30 footprints + Broken Links Checker workflow + dead-topic→SBD-URL map + 2 email templates). Extends the 2026-06-23 backlink docs. Highest-leverage first action = hand-submit ~15 known-real core directories before touching ScrapeBox.

4. **NAP citation submission sheet** (`.outputs/seo/2026-07-15-nap-citation-submission-sheet.md`). Agent-ready, 12 sections. NAP verified consistent across schema/footer/nav/terms/privacy: Steel Box Direct · parent Freedom Conex LLC (Hillsboro TX) · (513) 546-2543 · steelboxdirect.com · support@steelboxdirect.com · Cincinnati OH · Est. 2009 · GBP CID 16337072236475848136 · LinkedIn present · logo 1024². Integrity rule enforced: nothing fabricated.
   - **⚠️ Owner must resolve before submitting (blockers 1-6):** (1) business hours [pull from GBP], (2) Facebook page [doesn't exist], (3) payment-methods field [owner decision — don't disclose processor], (4) primary GBP category [confirm; recommended "Container supplier"], (5) GBP address visibility [confirm service-area/hidden], (6) geo pin [confirm 39.1365839,-84.540972 vs cities.ts map-only marker]. Confirmations 7-11: support@ monitored, parent legal address, western-WV fulfillment, Doug Froh still public contact, never type a star rating.

## Also this session (non-SBD, advisory only — no files)
- Warm-outreach / referral copy for the owner's freelance AEO service (separate AEO-Practice venture). Landed on an audit-led referral ask blending "one person + vivid trigger + low-pressure out" with the cheap/fast AI-visibility-check front door. Conversational only; nothing written to repo.
- Answered: site went live on Cloudflare Pages ~May 18-19, 2026 (repo init 2026-05-19; live-site fixes same day). Custom-domain DNS still an open todo.

## Guardrails honored
No $ added anywhere · city pages remain $-free · no fabricated NAP/reviews/ratings · WWT-only framing · SAB no-street-address rule enforced · auto-poster link spam explicitly refused.

## Open threads / next actions
- **City-page block:** await owner confirm on the 4 intro lines → spec → plan → build/verify (subagent).
- **Backlinks:** owner decision on proxies vs Bing/DDG-only harvesting; verify `/blog/sample-container-vs-pole-barn/` slug is published (smells like a draft).
- **NAP sheet:** owner resolves ⚠️ blockers 1-6, then hand sheet to an agent for submissions + log to `backlink-prospect-tracker.csv`.
- Standing owner actions unchanged (Supabase keep-alive YAML, Facebook page).

## Compliance
Tasks #1/#5/#6 completed; #2/#3/#4 open (city block, paused). Checkpoint written at 3 completed todos per cadence. Session log still required before session end (HS-UDO-001).
