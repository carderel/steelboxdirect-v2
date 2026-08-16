# Session Log — 2026-07-11 → 2026-07-13 — GSC schema fixes, mobile nav, Supabase restore, image v2, strategy pivot → AEO-Practice spinout

**Repo:** steelboxdirect-v2 · **Branch:** main · **HEAD == origin == a53ccd9** (Cloudflare deployed)
**Mode:** Orchestrator (The Architect) — all execution + verification subagent-driven per UDO L002. Final checkpoint `.checkpoints/2026-07-13-13-27-session-closeout/` (prior mid-session cp `.checkpoints/2026-07-12-17-27-schema-images-strategy-pivot/`).

## Shipped LIVE this session (2 commits)
1. **93eac00** — `price` added to Product.offers (fixes GSC error "Either price or priceSpecification.price should be specified (in offers)") + mobile nav dropdown sub-items 18px→14px (specificity-winning `nav.p .nav-*-drop a` rule mirroring the desktop fix). Live-verified 8/8 fetches; **owner validated the schema fix in GSC (passed).**
2. **a53ccd9** — honest merchant-listing enrichment on product offers: `itemCondition=UsedCondition` + self-maintaining `priceValidUntil` (new `pricing.ts` helper = asOf+1yr → 2027-07-09); `category` already present. Deliberately OMITS `shippingDetails` + `hasMerchantReturnPolicy` (owner decision: Google Shopping/merchant path DROPPED; quote-based/distance-variable/as-is business can't populate truthfully). Both stay non-critical in GSC — correct.

## GSC standing decision (RECORD so future sessions don't undo it)
After the enrichment push, GSC surfaced two NEW non-critical warnings: **Missing `aggregateRating`** + **Missing `review`** (3 product pages). DECISION: **LEAVE as non-critical, do NOT add.** Rationale: (a) Google prohibits marking up third-party/aggregator (Google Maps) reviews as your own product schema → manipulation/manual-action risk; (b) SBD has NO first-party on-site review system to legitimately aggregate; (c) **the AEO Gemini win happened *because* SBD refused to fake AggregateRating** — Gemini read the REAL Maps rating. Same pattern as shipping/returns: merchant "missing field" warnings requiring invented data → intentionally left. Only legit path = build a real first-party review system (out of scope). **Never add fabricated ratings/reviews.**

## Other deliverables (non-code)
- `.outputs/image-prompts/2026-07-11-image-needs-worklist.md` (v1 audit; owner found hard to use) → `.outputs/image-prompts/2026-07-11-image-prompts-v2.md` (v2 flat filename+prompt list, 20 prompts). **Owner works from v2.** Do NOT add extra work to it.
- Strategy docs: `.outputs/strategy/2026-07-10-container-sales-demand-monetization.md`, `2026-07-10-vrto-cold-start-audit.md`, `2026-07-12-aeo-competitive-signal-scan.md`, `2026-07-12-aeo-field-credibility-scan.md`.
- Sales kit: `.outputs/aeo-service/2026-07-12-fast-lane-kit.md`.

## Supabase (was BROKEN → RESTORED; keep-alive PARKED on owner)
- Root cause: free-tier auto-pause (project `qwgbfrvjhgcpwzhclqnn` was PAUSED, returned NXDOMAIN). Owner clicked Restore → endpoint back (DNS resolves, REST 401=healthy). Same URL/keys → no Cloudflare change, no redeploy. Leads were NEVER lost (Resend seller-email safety net; SELLER_EMAIL confirmed set in Cloudflare = carder.creative@gmail.com + dfroh...).
- Persistence: owner chose **free + keep-alive**. Decision `.project-catalog/decisions/2026-07-10-supabase-keepalive.md`. GitHub Actions workflow (`.github/workflows/supabase-keepalive.yml`, ping every 3 days) BUILT + committed locally as 791d08b but push REJECTED (gh token lacks `workflow` scope; refresh didn't stick in-env). **RESET to origin — file is untracked on disk.** GitHub Actions secrets `SUPABASE_URL` + `SUPABASE_ANON_KEY` ARE set (via gh secret set). **OWNER ACTION:** create `.github/workflows/supabase-keepalive.yml` via GitHub web editor (content in the decision doc / task #4), commit to main → then next session triggers + verifies the run. (DB will re-pause ~7 days idle until this lands.)

## STRATEGY ARC → new venture spun out
- **Container authority hub = PASS as a build.** Ryan's adversarial framework research + our GKP data killed it: demand wrong-shape (13.5% local vs 86.5% national buy-intent), slot CONTESTED not void (Boxhub/xChange/ContainerMap), thin value-capture. Not building.
- **VRTO cold-start audit:** owner put 65–75% of VRTO's success on insider RTO position, but pushed back (SBD ranked cold in ~2wk; VRTO data moat was built in-house scrape+API+AI) → rankings/AEO/data-moat all PORT cold; insider = accelerant not prerequisite. Moot for containers (PASS stands on demand-shape).
- **Real objective surfaced (memory [[owner-income-and-paradigm-objective]]):** ride the AEO paradigm shift + need NEAR-TERM income. Chose **cash in 1–4 weeks, time-only/$0.**
- **Fast lane decided:** productize the proven AEO skill as a service; bid on ALREADY-POSTED Upwork gigs (respond-to-demand, not cold outreach — owner has no warm list, dislikes outreach, wowbrands/RTO clients OFF-LIMITS). Two research scans confirmed: proven delivery is SCARCE amid loud talk; demand real+buyable now; ~65–70% chance of first gig in 1–4 weeks with active bidding; edge real but time-limited ~12–24mo.
- **Two proof assets:** SBD (container, documented Gemini flip) + **CFTMA martial arts (cftmartialarts.com)** — Gemini names it top local rec (DIFFERENT vertical = reproducibility). OPEN: was CFTMA an engineered flip w/ a "before," or maintained/currently-cited? (sets 2nd-case framing).
- **Sales kit built** (`.outputs/aeo-service/2026-07-12-fast-lane-kit.md`): positioning, SBD case ×3, proposal template + example, AI Visibility Audit offer, pricing ladder ($250–500 audit / $1k–1.8k project / $1k–2.5k/mo retainer), this-week checklist.
- **SPUN OUT to a SEPARATE project:** `/Users/flackfizer/Documents/Projects/AEO-Practice/` with `HANDOFF.md` (full bootstrap) + `inherited-assets/` (kit + 2 scans copied). Named "AEO Practice" (renamable). Keeps this containers UDO clean. NOT yet UDO-scaffolded — handoff §10 explains how. Owner will restart a fresh prompt to work it.

## PARKED / owner actions
- Supabase keep-alive workflow: owner creates the YAML via GitHub web UI (see above).
- Optional: mobile-nav mirror already done; "As-Is" wording on /condition/; lead-capture popup overlaps price area (pre-existing).
- AEO-Practice: resolve CFTMA framing; capture SBD+CFTMA before/after screenshots; niche-vs-broad; clarify "openclaw" (automate gig-finding/drafting only, never auto-send); optionally scaffold the new UDO; the vertical-screener machine (reverse-engineer Ryan's framework) is the LONG-TERM lane.

## No hard-stop conflicts. City pages remain $-free. No fabricated ratings/reviews.
