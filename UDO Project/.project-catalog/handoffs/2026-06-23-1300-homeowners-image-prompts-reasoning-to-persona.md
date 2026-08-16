# Handoff — Homeowners Image Prompts

## Verified Facts
- Grade A: `src/pages/for/homeowners/index.astro` contains six image placeholder slots.
- Grade A: Slot filenames in page comments are:
  - `homeowner-20ft-container-suburban-driveway.jpg`
  - `container-door-puck-lock-residential.jpg`
  - `storage-unit-vs-container-comparison.jpg`
  - `tilt-bed-delivery-residential-driveway.jpg`
  - `container-corner-block-gravel-pad.jpg`
  - `container-louver-vent-condensation.jpg`
- Grade A: Slot dimensions in the page are:
  - Hero: 640x480.
  - Security: 640x360.
  - Cost: 1260x540.
  - Delivery: 1260x540.
  - Foundation: 520x293.
  - Condensation: 520x293.
- Grade A: Current completed use-case pages use photorealistic, real-context images for farmers and contractors, imported through `astro:assets`.
- Grade A: Homeowners page message centers on residential driveway/backyard storage, ownership vs storage rental, security, delivery clearance, foundation/blocks, and condensation venting.

## Inferences
- Grade D: The homeowner prompts should be photorealistic Midwestern residential scenes, not generic product renders, because farmers/contractors now use contextual real-world imagery and the homeowner page copy is location/use-case specific.
- Grade D: Prompts should avoid readable text, logos, faces, license plates, and brand marks because generated image artifacts can create legal, quality, and trust issues.
- Grade D: Wide slots need extra crop room and clean composition because the page will likely follow the farmers/contractors full-bleed image direction.

## Confidence
Confidence: 88%.
Based on: direct page slot comments, dimensions, alt text, and completed farmers/contractors implementation pattern.
Uncertainties: exact image generator model and whether homeowner hero will be redesigned before integration.

## Persona Boundaries
Persona may state:
- The six prompts map to the current homeowner slots.
- The prompts are tuned for photorealistic residential Ohio/Indiana/Kentucky context.
- The prompts include negative constraints to reduce common generated-image defects.

Persona may not state:
- That images have been generated.
- That the prompts are guaranteed to produce usable first-pass assets.
- That product code changed.

