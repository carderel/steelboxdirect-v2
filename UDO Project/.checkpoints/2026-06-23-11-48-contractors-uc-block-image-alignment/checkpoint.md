# Checkpoint — 2026-06-23 11:48 — Contractors `uc-block` image alignment

**User-requested layout fix.** Align the inline images at the bottom of the two adjacent `uc-block` cards:
- `Harder to break into than a job site trailer`
- `Ground-level access — no dock, no ramp`

## Completed
- Updated `.uc-block` to use `display:flex; flex-direction:column`.
- Added `.uc-block > .uc-img-inline { margin-top:auto; }`.

## Verification
- `npm run build` passed.
