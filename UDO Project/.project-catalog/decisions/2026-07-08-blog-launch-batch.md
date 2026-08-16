# Decision: Blog launch batch = first 5 info articles, then push live

**Date:** 2026-07-08
**Decider:** Owner (Eli), via AskUserQuestion

## Decision
1. **Launch batch = the 5 informational drafts**: ISO 6346 container IDs, condensation, 12-things-never-store, dimensions size chart, WWT explained. The contractor Field Story (White Parable) is HELD for batch 2.
2. **Push live after the 5 are done** — supersedes the earlier "build 10–13 before deploy" gate from `.project-catalog/decisions/2026-07-06-blog-content-strategy.md`.
3. **Image gate cleared via the Gemini generation workflow** (proven on use-case pages): orchestrator team produces per-article prompt briefs → owner generates in Gemini → subagents strip metadata/C2PA, SEO-name, convert WebP, integrate.

## Constraints carried forward
- Push sequencing: blog pages + Blog nav link + llms.txt blog entries + sitemap/RSS config must ship in the SAME deploy (all already co-resident in the working tree) — see 2026-07-08 session log latent-hazard note.
- Standing per-article deliverables: blog post + social posts + short-video script + agent-readable .md.
- Guardrails unchanged: WWT-only, no dollar amounts, no delivery-time promises, permit=buyer-responsibility, no fabricated customers/quotes/reviews, primary-source citations, 5th-grade-baseline tone per by-audience matrix (`.outputs/content/blog-voice-style-guide.md`).
- Rebuild before any IndexNow run (stale local dist contains /blog/).
