# Checkpoint — 2026-07-30 — RTO build complete, pending final review (branch feat/rent-to-own)

**Branch off main (30944ff):** b0a84a7 spec+plan · 7e3aecc T1 /rent-to-own/ page (7 sections, Service+FAQPage schema, 27/27 tests incl. new schema-option test) · fe56f78 T4 terms draft (.outputs/legal/, force-added; 5 conflicting terms clauses quoted + carve-outs + attorney questions) · 94c28b7 T2 quote payment_intent select + email plumbing (matches receive_method precedent — NOT inserted to DB; RTO buyer email carries verbatim hedge; POST smoke skipped deliberately: live creds would email seller) · 4ae3abf T3 sweep (hub FAQ flip w/ honest no-plain-rentals line, homeFaq payment flip, PriceSection microcopy, homeowners/businesses callouts, nav+footer links, llms.txt; contractors hit justified-unedited; city/terms/privacy diff-vs-main EMPTY).

**Guardrails held:** no bare "no credit check" (all "traditional"); hedge at page/FAQ/form-label/buyer-email/every sprinkle; zero new $; approved-facts-only; buyout language OUT (owner); city+legal pages untouched.

**Known branch quirk:** untracked parable draft breaks builds (references image that lives on the PARKED plates branch) — agents stash/restore it per build. Resolution options at merge: cherry-pick 51e7d72 (blog finals) or park the draft file; OWNER CALL pending.

**Plates branch:** PARKED per owner (visual bar) — do not merge; owner producing graphics himself later.

**Next:** Task 5 independent whole-branch review → owner demo → merge/push decision (+ cherry-pick call).
