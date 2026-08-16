# Session Log — 2026-07-08 — Blog-404 report investigated; GTM dev-guard fix

**Repo:** steelboxdirect-v2 · **Branch:** main · **last_commit:** fa5f779 (unchanged — nothing committed/pushed)
**Checkpoint:** `.checkpoints/2026-07-08-09-42-gtm-dev-guard/`
**Continues:** `.project-catalog/sessions/2026-07-07-2355-session-log.md` (same conversation window)

## Issue
Owner: "sample blog posts made it onto the website and are now 404s." (Blog system is intentionally uncommitted/un-deployed pending real images.)

## Investigation (systematic-debugging, read-only subagent)
- Live site CLEAN: no /blog/ reference in nav, footer, sitemap-0.xml (25 URLs), llms.txt, rss (404), robots.txt, or Cloudflare preview (behind Access). All blog URLs 404 with proper noindex 404 template.
- Git: HEAD == origin/main == fa5f779; zero blog files in any pushed commit; all blog code untracked; draft-gating (`import.meta.env.PROD ? !draft : true`) works — local prod build emits no post pages, empty RSS.
- **Root cause (~80% conf): unguarded GTM.** BaseLayout.astro loaded GTM-K4T6CHW8 unconditionally → localhost browsing of draft/sample posts during the blog build fired pageviews into production GA4 → phantom /blog/ paths (incl. `sample-*` slugs that never existed in ANY build output) appear in analytics and 404 when clicked. No other mechanism matches.
- Unknowns: no GSC/GA4/Bing access; owner did not state where he saw the 404s before approving the fix. If it was crawl data (GSC/Bing), an external-discovery vector needs a second look.

## Fix (owner said "proceed")
- Implementer subagent: `src/layouts/BaseLayout.astro` — frontmatter `const isProd = import.meta.env.PROD;` + `{isProd && ...}` around BOTH the head `<script is:inline>` GTM loader and the body `<noscript>` iframe. Nothing else touched; blog-batch mods preserved. Build passed.
- Independent verifier: **PASS** — dist (home + locations) has both GTM pieces; dev server (4323, killed) has zero googletagmanager refs on 2 pages; no head/regression issues.
- **Uncommitted** (rides with the held blog batch; commits owner-gated).

## Latent hazards flagged (pre-existing, not fixed)
1. Stale local `dist/sitemap-0.xml` contains `/blog/` → do NOT run `npm run indexnow` until a fresh post-launch build.
2. Uncommitted llms.txt blog URLs + SiteNav Blog nav link MUST ship in the SAME deploy as the blog pages, or the reported bug becomes real.

## UDO compliance
Todos tracked (tasks 5–8) ✓ · checkpoint at 5-todo threshold ✓ · all investigation/implementation/verification via subagents (orchestrator coordinated only, L002) ✓ · memory pending-work updated ✓ · no commits/pushes, no hard-stop conflicts ✓.

## Later same day — research 3rd pass + BLOG LAUNCH + western-WV go-live
- Owner confirmed the 404 sightings were GA4 (dev-testing pollution) — root cause closed; GTM guard fixes it going forward.
- **Perplexity 3rd research pass** reconciled into `.outputs/strategy/2026-07-07-cam-fresh-vs-internal-comparison.md` (ADDENDUM). 7 CONVERGENT / 2 COMPLEMENTARY / 1 DIVERGENT (A10 sizing). Verdict spread (50% vs ~72%) ≈ calibration convention. Gates unchanged, gate 1 (DataForSEO) triple-converged.
- **Blog launch (owner: "commit and push; content > images"):** finalized 5 info articles + companions (2 new video scripts, 5 social packs, 5 agent-md) + image brief (15 prompts). Ran seo-audit internal-linking audit → fixed outbound anchors + added blog-to-blog + 9 reciprocal INBOUND links (completed the hub-and-spoke mesh). Prepped for live: flipped draft:false (5 only), stripped FPO wording, removed FPO template badge, fixed ISO 6346 false photo-claim. Independent verifier PASS (build, drafts excluded, rss 5, mesh resolves, secret scan clean, no rogue changes).
- **Western-WV:** owner confirmed Doug fulfills → included in the same push (Huntington/Charleston/Parkersburg across homepage/use-case/hub/quote/locations/footer/Schema).
- **PUSHED fa5f779 → 0c7d2c7** (main → Cloudflare auto-deploy). Staged explicit paths only; excluded all screenshot/tooling noise. All subagent-driven (orchestrator coordinated + git release only), UDO-compliant.

## Deploy verified LIVE (post-push)
Polled production: all 5 blog posts + /blog/ + /condition/ + /shipping-containers-for-sale/ = 200; the 3 draft posts (contractor + 2 samples) = 404 (correctly excluded); rss = 5 items; western-WV live on product hub; mesh confirmed (/condition/ links /blog/wind-and-water-tight-explained/). Blog launch complete and healthy.

## WIN logged
First inbound phone call this morning — customer found SBD via organic Google (no ad spend). Validates the SBD SEO/AEO lead-gen POC end-to-end.

## Authority-hub go/no-go discussion (analysis; owner deliberating)
Owner asked, with both research passes in, whether to build the authority hub. Assessment delivered (draws on the verified comparison + Perplexity addendum). Owner's working thesis: trust-first entry, SWEAT-EQUITY build (domain+hosting only), morph to data-authority like VRTO. Assessed SOUND (~80% sound path to START) — the sweat-equity model dissolves the research's biggest open conflict (cost). One correction relayed: budget a small non-optional legal wrapper (LLC + basic liability + never-AI-summarize-reviews). Recommended still closing 2 near-free gates first (DataForSEO demand pull + VRTO cold-start audit) before months of sweat. NOT locked — Eli's call. Captured: decision log `.project-catalog/decisions/2026-07-08-authority-hub-direction.md` + memory [[business-model-and-experiments]].
- **Compliance self-catch:** in the turn delivering the refinement assessment I told the owner I'd "noted this in memory" but no write had fired; caught on the owner's compliance check and remediated (memory + decision log + this entry written). Lesson: don't claim an audit-trail write as done without the tool call landing.

## Next
- Owner: generate 15 final images (`.outputs/image-prompts/2026-07-08-blog-launch-image-prompts.md`) → next push swaps them in + de-generics alt text.
- Open owner call: "As-Is" wording on live /condition/ (non-blocking).
- Authority hub: when owner moves, gate 1 = DataForSEO demand pull, gate 2 = VRTO cold-start audit.
- Standing: CAM pre-capital gates (incl. costed MVP); Supabase restore (DB BROKEN); Facebook page; batch-2 blog (contractor Field Story + more); IndexNow now safe (Cloudflare builds fresh).
