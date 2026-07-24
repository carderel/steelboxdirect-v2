# Design Spec — Locations Pages: Ground-Truth Rebuild + Scale

**Date:** 2026-07-24
**Status:** Draft for owner review
**Author:** Orchestrator (brainstorming). Build to be executed subagent-driven per UDO L002.
**Depends on:** the schema `@graph` + Quick Facts feature shipped earlier today (city pages already emit a `Service` node + `$`-free Quick Facts block).

---

## 1. Goal

Make the location/service-area pages **fact-dense from real ground truth** instead of hallucinated local flavor, then scale to new areas on the clean template. Two phases:

1. **Phase 1 — Fix the foundation:** rebuild the existing 4 city pages (Cincinnati, Dayton, Indianapolis, Louisville) on a public, verifiable ground-truth dataset; remove the fabricated claims currently live.
2. **Phase 2 — Scale:** add new service-area pages within SBD's real OH/IN/KY/western-WV footprint on the same schema (orchestrator proposes candidates; **owner prunes to genuinely-served areas before anything goes live**).

**Principle (owner's):** the model must only *format hard facts we provide*, never invent local context. Every field is either public/verifiable or an already-true business fact. This is also the only approach compatible with the project's hard rules.

---

## 2. Current-State Finding (evidence, Grade A — read from `src/data/cities.ts`)

The 4 live city pages contain fabricated / unverifiable claims that violate project guardrails:

- **Per-city star ratings** — `stats` carries "4.9/5 Local review average" (Cincinnati/Indy), "4.8/5" (Dayton/Louisville). SBD has ONE real Google Maps rating (~9 reviews total), not per-city averages. Fabricated rating → violates the no-fake-ratings hard rule (the rule that protects the real-rating AEO/Gemini win).
- **Invented placement counts** — "150+/85+/120+/95+ Units placed in [region]". Not real, verifiable numbers for a lead-gen POC fulfilled via regional depots.
- **Condition contradictions** — Indianapolis "ISO-**certified** containers"; Dayton "highest ISO standards." SBD sells **WWT used, sold as-is, not certified for shipping**.
- **Unverifiable flavor** — "our drivers have placed hundreds of units in your backyard," "we know the back roads."
- **"Answered within 4 business hours"** (`cta.body`) — owner-CONFIRMED real (2026-07-24); KEEP as-is.

These are visible-copy fabrications (they are NOT in the schema graph — the Service node has no rating/count — so no schema fix needed, but the on-page text must be corrected).

---

## 3. Decisions Locked (owner, this brainstorm)

| # | Decision |
|---|---|
| D1 | **Fix foundation first, then scale** (Phase 1 rebuild → Phase 2 new areas). |
| D2 | Ground truth = **public/verifiable facts + already-true business facts only.** Owner is NOT supplying private operational data (depot origins, review text, coverage confirmation) this round → build from public data. |
| D3 | **Remove** the fabricated ratings, placement counts, and ISO-certified language; repurpose stat tiles to real facts. |
| D4 | Phase 2 city selection = **orchestrator proposes, owner approves** before live. |
| D5 | Reuse the shipped `Service` schema + Quick Facts block; land the paused (2026-07-16) "common uses in [City]" block here. |

---

## 4. Ground-Truth Data Model

Extend the `City` interface in `src/data/cities.ts` (the ground-truth dataset). All new fields are public or already-true.

### 4.1 Add
```ts
primaryZips: string[];                 // public — representative ZIPs in the metro
zoning: Array<{                        // public — real county authority + link
  county: string;
  office: string;                      // e.g. "Hamilton County Regional Planning Commission"
  url: string;                         // real, verified URL
}>;
geography: {
  interstates: string[];               // e.g. ["I-75", "I-71", "I-275"]
  features: string[];                  // e.g. ["Ohio River"] — public landmarks
};
areaProfile: string;                   // public geographic fact re housing/terrain/access,
                                       // e.g. "Dense pre-war lots in the Highlands to open
                                       // acreage in Bullitt County — access varies, so we
                                       // scout placement before scheduling."
commonUses: Array<{                    // real regional-economy uses, framed as area norms
  label: string;                       // e.g. "Bourbon-barrel & distillery overflow"
  persona: 'farmers'|'contractors'|'homeowners'|'businesses';  // links to /for/* (mesh)
}>;
usesIntro: string;                     // ONE genuinely-local intro line (from the 7/16 drafts)
```

### 4.2 Repurpose `stats` → real facts only
Replace the fabricated tiles with true, per-area or business-wide facts, e.g.:
`{ value: '<N>', label: 'Counties served' }`, `{ value: 'WWT', label: 'Single honest grade' }`, `{ value: 'Est. 2009', label: 'Family-owned' }`, `{ value: 'Lifetime', label: 'Leak warranty' }`.
(Number of counties is derived from `counties.length` — real.)

### 4.3 Rewrite (remove fabrication) in existing text fields
- `delivery.body`, `content.intro`, `content.features[].body`: strip "ISO-certified", invented counts, "placed hundreds," "know the back roads." Reframe to honest capability: family-owned regional dealer, delivered from regional depots serving the region, no broker markup, local delivery planning/site scouting (a real capability), permit/zoning = buyer responsibility (link the new `zoning` authorities).
- Keep the honest, verifiable geographic/economic context (interstates, rivers, regional industries) — that's real.

### 4.4 Data population (build-time)
A research subagent fills `primaryZips`, `zoning` (real office names + verified URLs), `geography`, `areaProfile`, `commonUses`, `usesIntro` per area from **primary public sources**, with citations recorded in the build notes. No value ships unverified. No `$` anywhere.

---

## 5. Rendering (`src/pages/[citySlug].astro`)

Additive sections, following existing component patterns; all `$`-free:

1. **Service-area block** — counties + `primaryZips` + existing OSM map (already present). Honest "delivered from regional depots serving [region]" framing.
2. **"Common uses in [City]" block** — the paused 2026-07-16 design: a `<section class="local-uses">` after `local-content`, before `cta-section`; `usesIntro` line + persona cards (`commonUses` → `/for/{persona}/`). Completes the bidirectional city↔use-case mesh.
3. **Permits & zoning resource block** — lists each county's real `zoning` office with a link (reinforces permit=buyer-responsibility; genuinely useful, citation-worthy for AEO).
4. **Repurposed stat tiles** — real facts (§4.2).
5. **Quick Facts block** (already shipped) — surfaces service area, counties, condition, warranty, delivery framing; stays `$`-free.
6. **`Service` schema** (already shipped) — `areaServed` = city; `provider` → canonical LocalBusiness; the `zoning`/`geography` facts stay as visible text (agents read the DOM).

No new hero imagery required; reuse existing layout/CSS idioms (`uc-city-grid` reversed for persona cards, resource-list style from `container-reference`).

---

## 6. Phases

- **Phase 1 (this build):** extend `City` interface; research + populate real data for the 4 existing areas; rewrite fabricated copy; add the 3 new page sections; verify. Ships the integrity fix + richer pages for the current 4.
- **Phase 2 (after owner approves the list):** orchestrator drafts candidate new areas within the real footprint (e.g. Columbus OH, Lexington KY, Huntington/Charleston WV, Fort Wayne IN, Toledo OH, Northern Kentucky) with public data filled in; **owner prunes to genuinely-served areas**; build on the same schema; add to `locations` hub `ItemList`. No new area goes live without owner confirmation of real coverage.

---

## 7. Guardrails (baked in)

- **HARD STOP:** no dollar amounts on any location page (Quick Facts, stats, copy, schema). Verified by build grep, per the shipped city `$`-free check.
- **No fabrication:** no ratings/counts/testimonials/customers invented; every field public-verifiable or already-true; unverified values do not ship.
- **WWT / not certified for shipping** — remove all "ISO-certified" language.
- **Permit/zoning = buyer responsibility** — the zoning block links authorities; never makes determinations or promises.
- **Delivery** — no time promise beyond the locked "about two weeks"; "delivered from regional depots" framing is honest (no invented per-city yards/drivers).
- **Real Google rating stays site-wide only** (never per-city).

---

## 8. Validation

- Build clean; unit tests green.
- **$-free:** grep every built location page (existing 4 + any new) for `$[0-9]` → none; Service node has no price.
- **No fabrication residue:** grep built pages for the removed claims ("ISO-certified", "/5", "Units placed", "placed hundreds") → none.
- **Real-data spot check:** each `zoning.url` resolves to the correct authority; ZIPs belong to the metro; `commonUses` personas link to live `/for/*` pages (no 404).
- **Schema:** `Service` + `areaServed` intact; `@graph` still single per page; Quick Facts renders; mesh links resolve.
- Playwright: new sections render, no overflow, desktop + mobile; city pages `$`-free.

---

## 9. Out of Scope / Non-Goals

- Private operational data (depot origins, per-city reviews) — owner not supplying this round.
- Dollar amounts / pricing on location pages (hard stop).
- New hero photography.
- Programmatic sprawl beyond genuinely-served areas (GKP shows tiny local volume; this is an AEO fact-density play, not a keyword land-grab — quality over count).

---

## 10. Assumptions

- **A001** — Public sources give accurate county zoning-office names + stable URLs for each area. *If wrong:* omit that county's link rather than guess. Status: verify at build.
- **A002** — `commonUses` regional-economy framing (bourbon/horse-farm/aviation/logistics) is genuine public knowledge, not fabricated customer claims. *If a use can't be substantiated as an area norm, drop it.* Status: verify at build.
- **A003** — RESOLVED: owner confirmed "answered within 4 business hours" is a real policy (2026-07-24). Keep the claim as-is.
