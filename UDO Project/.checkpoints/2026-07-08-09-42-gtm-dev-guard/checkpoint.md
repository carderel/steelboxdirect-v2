# Checkpoint — blog-404 investigation + GTM dev-guard fix

**Date:** 2026-07-08 09:42
**Trigger:** 5 completed todos since last checkpoint (tasks 4–8)

## Completed since `.checkpoints/2026-07-07-23-55-cam-comparison-complete/`
- Task 4: CAM comparison verdict reported to owner; audit trail closed (memory, PROJECT_STATE, session log 2026-07-07-2355).
- Task 5: **Blog-404 investigation** (systematic-debugging Phase 1, read-only subagent). FINDING: live site is CLEAN — no blog URL referenced anywhere (nav/sitemap/llms.txt/rss/robots/preview); all blog code still untracked; deploy == fa5f779. The 404s exist because blog was never deployed (intended). ROOT-CAUSE HYPOTHESIS (~80%): GTM-K4T6CHW8 loaded unguarded in BaseLayout.astro → localhost dev browsing of draft/sample posts sent pageviews to production GA4 → phantom `/blog/…` paths in analytics that 404 when clicked. `sample-*` slugs never existed in ANY build output (draft-gated), so analytics is the only mechanism found that matches. Owner asked to confirm where he saw them; replied "proceed".
- Task 6: Assessment reported. Latent hazards flagged: stale local dist/sitemap-0.xml contains /blog/ (indexnow hazard); uncommitted llms.txt + SiteNav Blog link must ship in the SAME deploy as blog pages.
- Task 7: **Fix implemented** (subagent): `src/layouts/BaseLayout.astro` — `const isProd = import.meta.env.PROD` + `{isProd && ...}` around BOTH the head GTM `<script is:inline>` loader and the body `<noscript>` iframe. Working-tree only (rides with the held blog batch); NOT committed/pushed (owner-gated).
- Task 8: **Independent verifier PASS**: prod dist keeps both GTM pieces on multiple pages; dev server (port 4323, killed after) has ZERO googletagmanager references on / and /locations/; no regressions (blog-batch mods preserved, head well-formed, attribution script intact).

## State
- Working tree: BaseLayout.astro now carries the GTM guard on top of the blog-batch modifications. last_commit unchanged fa5f779. Nothing committed or pushed.
- Unknowns remaining: no GSC/GA4 access — owner has not yet said where he saw the 404s; if GSC/Bing shows them as CRAWLED URLs (not analytics rows), re-open investigation for an external-discovery vector.

## Next
- Update pending-work memory + session log (this session), then report to owner.
- Standing: blog launch gate = real images; push sequencing rule (blog pages + references together); Supabase restore; western-WV; Facebook page.
