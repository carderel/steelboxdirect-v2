# Session transcript: 2026-08-26 (continuation; cycles follow the 2026-08-25 file)

## Cycles 51-53 (backfill: plate v2 rejected; listing hero rework built; alt integrity fix)

- Plate v2 delivered (real rig silhouette, 3-level dimension rhythm) and REJECTED by the
  owner ("scale way off, elementary"). Pivot per owner: he generates a Gemini illustration;
  orchestrator delivered a textless prompt (his own no-text-in-generated-images rule: one
  mangled figure = a false claim) with proportions pinned; exact dimensions overlay in code
  when the image lands.
- Owner then rejected the whole above-fold layout ("so much empty space... think amazon
  listing, image left; mobile image over description under title; hard to read").
  frontend-designer rebuilt the hero as a listing grid: photo left 45% desktop, H1 first
  on mobile with DOM-order-as-mobile-order, 4 confidence bullets, buy box (54px feed price
  + adjacent disclaimer + both CTAs; call-me anchors to #talk-to-doug with smooth scroll),
  prod-pricing slimmed to its unique ZIP pitch with NO duplicate price, JSON-LD Product
  byte-identical on all 3 pages, interim real photo (container-blue-weathered.jpg, the
  months-live homepage photo) wired via containers.ts.
- INTEGRITY CATCH by the builder: the interim photo shows a 40ft HIGH CUBE (45G1 code) on
  a TRAILER; my brief's alt said "40ft... rural property", wrong twice. Orchestrator fixed
  both strings inline (containers.ts alt + caption), rebuilt exit 0, vitest green, dist
  carries the corrected caption. (Inline edit noted as a deliberate 2-string exception to
  the dispatch-everything rule.)
- Owner "resume" after the day rolled: state re-established, preview server confirmed live
  (200), 6 local commits confirmed unpushed, records rolled to 2026-08-26.

## Cycles 54-57 (owner approved + two copy upgrades; option A; SHIPPED + LIVE)

- Owner: "Much better." Then two copy directives, both applied inline (small-string
  exception) and verified: buy-box disclaimer + ZIP/talk-to-Doug sentence; service bullet
  + italic nationwide note (claim pre-existing in schema + /ai-info/). On the 20ft image:
  ruled AGAINST hunting stock; Doug's raw condition-card originals include a real 20ft
  (22G1); yard shoot covers the rest.
- Owner chose A: clearance hidden (SHOW_CLEARANCE_PLATE=false wrap, markup kept), three
  per-size textless Gemini prompt files delivered to .outputs/image-prompts/.
- SHIPPED 10087d3..03ec219 (8 commits) in one push. LIVE ~90s: buy box, nationwide note,
  clearance absent, interim photo, popup matrix correct, 200.
- SIDE THREAD: owner alarmed by SBD's 35 SEMrush backlinks he never made. Analysis:
  all scraper/link-seller/template noise (Fiverr pages carry literal unfilled {braces});
  benign, ignored by engines, NO disavow, not the traction blocker; the cure is earned
  links (citation kit, finder page, VRTO post).

## Awaiting owner

1. Review listing-v2 (screenshots + local preview) -> approve, tweak, or reject.
2. The Gemini clearance illustration (his generation) -> code overlay follows.
3. The push word for the whole T-171 package -> then the live callback E2E with Doug.
