# Checkpoint — 2026-06-22 15:55 — Use-case images + hero redesign + breadcrumbs/sidebar (DEPLOYED)

**Phase boundary + session end.** Pushed to main → Cloudflare auto-deploy. HEAD `a0433a5`.

## Shipped this session
1. Farming images sanitized (exiftool -all=, C2PA/SynthID metadata stripped) + SEO-named.
2. Farmers page: 5 real images integrated (Astro <Image> WebP) + hero redesigned full-bleed "field poster".
3. All 4 use-case pages: visible breadcrumbs + single BreadcrumbList schema + floating lead sidebar.
4. Mobile hero gap fixed (removed dead 768px `.uc-hero` padding).

## Files
- New: `src/components/Breadcrumbs.astro`, `src/assets/photos/farmers/` (6 jpgs).
- Modified: `Schema.astro`, `BaseLayout.astro`, `FloatingSidebar.astro`, all 4 `src/pages/for/*/index.astro`.
- Excluded from commit: pre-existing `src/components/home/ProblemSection.astro` change (not this session's).

## Verified
Build clean; 4 pages each have breadcrumb + sidebar + 1 BreadcrumbList; sidebar scoped (home ✓, /size/ ✗ correctly); Playwright desktop+mobile.

## Next session
- Roll the full-bleed hero redesign + integrate real images to contractors / homeowners / businesses (still old boxed hero + placeholders).
- Crop-field hero asset committed but unused (reuse candidate).
- See `.project-catalog/sessions/2026-06-22-session-log.md`.
