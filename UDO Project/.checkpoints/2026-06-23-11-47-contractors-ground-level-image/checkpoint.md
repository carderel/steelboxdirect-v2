# Checkpoint — 2026-06-23 11:47 — Contractors ground-level image

**User-requested follow-up.** Added the provided ground-level jobsite image to the contractors use-case page.

## Completed
- Source image: `user uploads/Generated Images/contractors/Ground-level.jpg`.
- Sanitized copy: `src/assets/photos/contractors/ground-level-jobsite-container-access.jpg`.
- Metadata stripped with `exiftool -overwrite_original -all=`.
- Added `imgGroundLevel` import to `src/pages/for/contractors/index.astro`.
- Rendered the image in the `Ground-level access — no dock, no ramp` `uc-block`.

## Verification
- `exiftool` reports only basic file/image fields for the copied asset.
- `npm run build` passed.
- Astro generated optimized WebP output for `ground-level-jobsite-container-access`.
- `dist/for/contractors/index.html` contains `data-img-slot="ground-level"`.
- `curl -I http://127.0.0.1:4322/for/contractors/` returned `HTTP/1.1 200 OK`.
