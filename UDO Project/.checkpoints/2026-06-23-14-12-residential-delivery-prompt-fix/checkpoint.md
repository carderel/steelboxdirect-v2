# Checkpoint — 2026-06-23 14:12 — Residential Delivery Prompt Fix

## Scope
Prompt-only update to reduce unrealistic residential delivery generations.

## Files Intentionally Changed
- `.outputs/image-prompts/2026-06-23-homeowners-image-prompts.md`
- `.project-catalog/sessions/2026-06-23-1412-residential-delivery-prompt-fix.md`
- `.checkpoints/2026-06-23-14-12-residential-delivery-prompt-fix/checkpoint.md`

## Product Code
No product code changed.

## Resume Notes
Use the stricter delivery prompt first. If model output still places the truck in the yard, use the backup no-truck prompt and show the container already placed.
