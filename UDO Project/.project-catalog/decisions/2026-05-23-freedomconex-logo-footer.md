# Decision: FreedomConex Logo in Footer

**Date:** 2026-05-23  
**Status:** Implemented

## Decision
Logo placed in footer first column below `.agent-credit` text, on a yellow (`var(--yellow)`) background pill, linking to https://www.freedomconex.com/ with `rel="nofollow noopener noreferrer"`.

## Rationale
- Yellow background makes logo visible against dark ink footer without needing a transparent PNG
- `mix-blend-mode: multiply` was tried first but white × dark ≈ dark — logo disappeared into footer background
- `rel="nofollow"` satisfies user requirement to not pass SEO value to external link
- Logo file: `public/assets/freedom-conex-logo.png` (copied from `user uploads/`)
