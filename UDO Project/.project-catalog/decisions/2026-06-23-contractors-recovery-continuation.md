# Decision — Continue With Contractors Use-Case Image/Hero Rollout

## Context
- User instructed takeover from Claude Code and pointed to `undocumented-progress.md`.
- `undocumented-progress.md` was present but empty (`0` bytes).
- Latest session log (`.project-catalog/sessions/2026-06-22-session-log.md`) stated farmers was complete and contractors/homeowners/businesses still used old boxed heroes/placeholders.
- `user uploads/Generated Images/contractors/` contained a complete contractor image set.
- No comparable homeowners/businesses image folders were found during recovery.

## Decision
Continue with the contractors use-case page before homeowners/businesses.

## Rationale
- Contractors was the only pending use-case page with a complete available image set.
- The contractors page still had placeholder data-URI image slots and old boxed hero markup.
- Farmers provided a completed local pattern for full-bleed hero + Astro image integration.

## Constraints
- Preserve existing copy, FAQ schema, breadcrumbs, and floating sidebar behavior.
- Strip metadata from copied generated images.
- Do not touch unrelated untracked `.claude`, `.playwright-mcp`, root images, or docs.
- Preserve pre-existing dirty `ProblemSection.astro` change.

## Evidence
- `wc -c undocumented-progress.md` returned `0`.
- `npm run build` passed after the contractors changes.
- `curl -I http://127.0.0.1:4322/for/contractors/` returned `HTTP/1.1 200 OK`.
- `dist/for/contractors/index.html` references the new optimized contractor WebP assets.
