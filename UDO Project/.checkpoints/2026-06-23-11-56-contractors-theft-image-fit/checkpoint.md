# Checkpoint — 2026-06-23 11:56 — Contractors theft image fit

**User-requested layout fix.** The `The lock matters more than the box` lock-comparison image was being cropped by a portrait frame.

## Completed
- Confirmed source asset `container-lock-comparison-puck-vs-padlock.jpg` is `1408x768`.
- Changed `.uc-img-theft` from `aspect-ratio: 4 / 5` to `aspect-ratio: 11 / 6`.
- Kept the mobile rule consistent with the same `11 / 6` ratio.

## Verification
- `npm run build` passed.
