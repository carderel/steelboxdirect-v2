# Locations Ground-Truth Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Rebuild the 4 existing city pages on a public, verifiable ground-truth dataset — removing the fabricated per-city ratings, invented "units placed" counts, and "ISO-certified" claims — and render new `$`-free fact-dense sections (service-area + ZIPs, "common uses" persona mesh, county zoning resources). Phase 2 (new cities) is documented but gated on owner approval.

**Architecture:** `src/data/cities.ts` is the ground-truth dataset. Extend the `City` interface with public-fact fields, rewrite the 4 city objects to strip fabrications and add researched real data, then render additive sections in `src/pages/[citySlug].astro`. Schema (`Service` node) + Quick Facts block already ship from the earlier feature — no schema changes needed.

**Tech Stack:** Astro 4, TypeScript, vitest (already installed).

## Global Constraints

- **HARD STOP:** NO dollar amounts on any location page — data strings, stats, copy, schema. (HARD_STOPS HS-PROJ.)
- **No fabrication:** every field is public/verifiable or an already-true business fact. No invented ratings, counts, customers, testimonials. Unverified values MUST NOT ship — omit and note instead of guessing.
- **Condition:** WWT (used), sold as-is, NOT certified for shipping. Remove all "ISO-certified"/"ISO standards" language.
- **Permit/zoning = buyer responsibility** — the zoning block links real authorities; never makes determinations or promises.
- **Delivery:** no time promise beyond the locked "about two weeks"; framing is "delivered from regional depots serving [region]" (no invented per-city yards/drivers/back-roads claims).
- **Keep** the owner-confirmed real claim "answered within 4 business hours" (`cta.body`).
- **Real Google rating stays site-wide only** — never per-city.
- `commonUses` personas must be exactly one of: `farmers` | `contractors` | `homeowners` | `businesses` (they link to `/for/{persona}/`).
- Prices/keeps: `[citySlug].astro` already passes the `schema` prop; do NOT change it. Keep `export const prerender = true`.

---

## Task 1: Rebuild the ground-truth dataset (`src/data/cities.ts`)

**Files:**
- Modify: `src/data/cities.ts` (extend `City` interface; rewrite all 4 city objects)
- Test: `src/data/cities.test.ts` (new — integrity guardrail)

**Interfaces:**
- Produces: extended `City` type with new fields `primaryZips: string[]`, `zoning: {county:string; office:string; url:string}[]`, `geography: {interstates:string[]; features:string[]}`, `areaProfile: string`, `commonUses: {label:string; persona:'farmers'|'contractors'|'homeowners'|'businesses'}[]`, `usesIntro: string`. `stats` unchanged in shape but values become real facts.

- [ ] **Step 1: Write the integrity test `src/data/cities.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { cities } from './cities';

const VALID_PERSONAS = ['farmers', 'contractors', 'homeowners', 'businesses'];

describe('cities ground-truth dataset integrity', () => {
  it('has all 4 existing areas', () => {
    expect(cities.map((c) => c.slug)).toEqual(
      expect.arrayContaining([
        'cincinnati-shipping-containers', 'dayton-shipping-containers',
        'indianapolis-shipping-containers', 'louisville-shipping-containers',
      ])
    );
  });

  for (const c of cities) {
    describe(c.slug, () => {
      const blob = JSON.stringify(c);

      it('contains NO fabricated rating / placement-count / ISO-certified claims', () => {
        expect(blob).not.toMatch(/\d(\.\d)?\s*\/\s*5/);          // "4.9/5"
        expect(blob.toLowerCase()).not.toContain('review average');
        expect(blob).not.toMatch(/units placed/i);
        expect(blob).not.toMatch(/\bplaced hundreds\b/i);
        expect(blob).not.toMatch(/ISO[- ]?certified/i);
        expect(blob).not.toMatch(/highest ISO standards/i);
      });

      it('contains NO dollar amounts (hard stop)', () => {
        expect(blob).not.toMatch(/\$\s*\d/);
      });

      it('has the required ground-truth fields populated', () => {
        expect(c.primaryZips.length).toBeGreaterThan(0);
        expect(c.zoning.length).toBeGreaterThan(0);
        c.zoning.forEach((z) => {
          expect(z.county).toBeTruthy();
          expect(z.office).toBeTruthy();
          expect(z.url).toMatch(/^https?:\/\//);
        });
        expect(c.geography.interstates.length).toBeGreaterThan(0);
        expect(c.areaProfile.length).toBeGreaterThan(0);
        expect(c.commonUses.length).toBeGreaterThan(0);
        c.commonUses.forEach((u) => {
          expect(u.label).toBeTruthy();
          expect(VALID_PERSONAS).toContain(u.persona);
        });
        expect(c.usesIntro.length).toBeGreaterThan(0);
      });
    });
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — current data has "4.9/5"/"units placed"/"ISO-certified" AND the new required fields don't exist yet (type + runtime errors).

- [ ] **Step 3: Extend the `City` interface**

In `src/data/cities.ts`, add these fields to the `City` interface (after `stats`):
```ts
  primaryZips: string[];
  zoning: Array<{ county: string; office: string; url: string }>;
  geography: { interstates: string[]; features: string[] };
  areaProfile: string;
  commonUses: Array<{ label: string; persona: 'farmers' | 'contractors' | 'homeowners' | 'businesses' }>;
  usesIntro: string;
```

- [ ] **Step 4: Rewrite each of the 4 city objects — research + de-fabricate**

For EACH city (Cincinnati, Dayton, Indianapolis, Louisville), do all of the following. **Every new value must come from a primary public source; record the source URL in your report. If you cannot verify a value, OMIT it (e.g. drop that county's zoning entry) rather than guess.**

**(a) Strip fabrications in existing fields:**
- `content.intro` and each `content.features[].body`: remove "ISO-certified" / "highest ISO standards" (reword to WWT/"built to ISO 668 dimensional standards" is acceptable ONLY as a dimensional-spec statement, not a certification claim — simplest is to drop the ISO phrasing and speak to WWT durability). Remove invented specifics.
- `delivery.body`: reframe to honest fulfillment — e.g. "Delivered from regional depots serving the {region}. We plan placement and can scout tight or soft sites before scheduling." Remove "our drivers have placed hundreds," "we know the back roads."
- Keep genuine, verifiable geography/economy references (interstates, rivers, real regional industries).

**(b) Repurpose `stats` to REAL facts** (no ratings, no counts). Use exactly these 3 per city (the county number is real = `counties.length`):
```ts
stats: [
  { value: String(<counties.length>), label: 'Counties served' },
  { value: 'WWT', label: 'One honest grade' },
  { value: 'Est. 2009', label: 'Family-owned dealer' },
],
```

**(c) Populate the new fields with researched public data:**
- `primaryZips`: 4–6 representative ZIP codes for the metro (public).
- `zoning`: for each real county in `delivery.counties` that you can verify, the county's planning/zoning office name + its official `.gov`/county URL. Prefer county government planning/zoning pages. Omit any county whose authority you cannot verify.
- `geography.interstates`: the real interstates through the metro (e.g. Cincinnati → `["I-75","I-71","I-275"]`). `geography.features`: notable public landmarks relevant to placement/weather (e.g. `["Ohio River"]`); `[]` if none.
- `areaProfile`: ONE sentence of genuine, public geographic context about housing/terrain/access variation in the area (informs honest placement talk). No superlatives, no invented stats.
- `commonUses`: 3–4 uses that are genuinely common in that area's real economy, each tagged to the best-fit persona. Example (Louisville): `{ label: 'Bourbon-barrel & distillery overflow storage', persona: 'businesses' }`, `{ label: 'Horse-farm tack & hay storage', persona: 'farmers' }`. Frame as area norms, NOT specific customers.
- `usesIntro`: ONE genuinely-local intro line for the common-uses block (e.g. Louisville: "Between the distilleries downtown and the horse farms in Oldham County, here's how {city} puts a container to work.").

**(d)** Ensure NO `$` and no dollar figures anywhere in the object.

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test`
Expected: PASS (integrity + all-fields tests green for all 4 cities). Also run `npm run build` → clean.

- [ ] **Step 6: Commit**

```bash
git add src/data/cities.ts src/data/cities.test.ts
git commit -m "feat(locations): rebuild cities.ts on public ground-truth; strip fabricated claims"
```

---

## Task 2: Render the new sections (`src/pages/[citySlug].astro`)

**Files:**
- Modify: `src/pages/[citySlug].astro` (add 2 sections + repurpose nothing else; add scoped CSS)

**Interfaces:**
- Consumes: the new `City` fields from Task 1.

- [ ] **Step 1: Add the "Common uses in {city}" section**

Insert BETWEEN the closing `</section>` of `local-content` (line ~92) and the `<section class="cta-section">` (line ~94):
```astro
  <section class="local-uses">
    <div class="wrap">
      <div class="m local_uses_label">Common uses in {c.city}</div>
      <p class="local_uses_intro">{c.usesIntro}</p>
      <div class="uses-grid">
        {c.commonUses.map((u) => (
          <a class="use-card" href={`/for/${u.persona}/`}>
            <span class="use-label">{u.label}</span>
            <span class="use-persona">For {u.persona} →</span>
          </a>
        ))}
      </div>
    </div>
  </section>
```

- [ ] **Step 2: Add the "Permits & zoning" resource section**

Immediately after the `local-uses` section (still before `cta-section`):
```astro
  <section class="local-zoning">
    <div class="wrap">
      <div class="m local_zoning_label">Permits &amp; zoning by county</div>
      <p class="local_zoning_note">Zoning and permit rules are set by your local authority and are the buyer's responsibility to confirm before you buy. Start with your county:</p>
      <ul class="zoning-list">
        {c.zoning.map((z) => (
          <li>
            <a href={z.url} target="_blank" rel="noopener nofollow">{z.county} — {z.office}</a>
          </li>
        ))}
      </ul>
      <p class="local_zoning_zips">Primary ZIPs served: {c.primaryZips.join(' · ')}</p>
    </div>
  </section>
```

- [ ] **Step 3: Add scoped CSS** (append inside the existing `<style>` block, before the closing `</style>`)

```css
  .local-uses { padding: 80px 0; background: var(--cream); border-top: 1.5px solid rgba(11,15,26,.1); }
  .local_uses_intro { font-size: 18px; line-height: 1.5; max-width: 760px; margin: 12px 0 32px; }
  .uses-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
  .use-card { display: flex; flex-direction: column; gap: 8px; background: white; border: 2.5px solid var(--ink); padding: 20px; box-shadow: 6px 6px 0 var(--ink); transition: transform .15s, box-shadow .15s; }
  .use-card:hover { transform: translate(-2px,-2px); box-shadow: 8px 8px 0 var(--yellow); }
  .use-label { font-family: var(--narrow); font-weight: 700; font-size: 18px; text-transform: uppercase; line-height: 1.05; }
  .use-persona { font-family: var(--mono); font-size: 10px; letter-spacing: .1em; text-transform: uppercase; opacity: .6; }
  .local-zoning { padding: 80px 0; background: white; border-top: 1.5px solid rgba(11,15,26,.1); }
  .zoning-list { list-style: none; padding: 0; margin: 16px 0 24px; display: grid; gap: 10px; }
  .zoning-list a { font-family: var(--mono); font-size: 13px; border-bottom: 1.5px solid currentColor; padding-bottom: 2px; }
  .zoning-list a:hover { color: var(--c5-permits); }
  .local_zoning_zips { font-family: var(--mono); font-size: 12px; opacity: .7; }
```

- [ ] **Step 4: Build + verify render**

Run: `npm run build`. Then:
- `grep -c 'local-uses' dist/cincinnati-shipping-containers/index.html` → ≥1
- `grep -c 'local-zoning' dist/cincinnati-shipping-containers/index.html` → ≥1
- `grep -o 'href="/for/[a-z]*/"' dist/cincinnati-shipping-containers/index.html | sort -u` → shows persona links (all must be farmers/contractors/homeowners/businesses)
- `grep -c '\$[0-9]' dist/cincinnati-shipping-containers/index.html` → `0`

- [ ] **Step 5: Commit**

```bash
git add src/pages/[citySlug].astro
git commit -m "feat(locations): render common-uses mesh + county zoning resources"
```

---

## Task 3: Validation

**Files:** none (verification only).

- [ ] **Step 1: Unit + build** — `npm test` all green (incl. `cities.test.ts`); `npm run build` clean.
- [ ] **Step 2: Fabrication residue sweep** — across all 4 built city pages, grep must return NOTHING for: `\$[0-9]`, `/5`, `Units placed`, `placed hundreds`, `ISO-certified`, `highest ISO standards`, `review average`. Report the grep results.
- [ ] **Step 3: Real-data spot check** — for each city, load 2–3 `zoning[].url` values and confirm each resolves to the correct county authority (not a 404/parked page). Confirm `primaryZips` belong to the metro. Report any that fail (author should omit them).
- [ ] **Step 4: Mesh integrity** — every `/for/{persona}/` link on the city pages resolves to a built page (no 404): confirm `dist/for/farmers/`, `/contractors/`, `/homeowners/`, `/businesses/` exist.
- [ ] **Step 5: Schema intact** — `grep -c '"@graph"' dist/<city>/index.html` → 1; `grep -c '"@type":"Service"' ...` → ≥1; no `"price"` field on city pages.
- [ ] **Step 6: Playwright (best-effort)** — serve `dist/` and load 2 city pages at 1280px + 390px: new sections render, persona cards clickable, no horizontal overflow, no `$` visible. If browser unavailable, verify section order in dist HTML (local-uses + local-zoning appear between local-content and cta-section) and note visual as manual follow-up.
- [ ] **Step 7: Report** — write findings to `.outputs/seo/2026-07-24-locations-validation.md`. Do NOT deploy — owner controls the push.

---

## Phase 2 (documented — GATED on owner approval, not executed by this plan)

After Phase 1 ships, the orchestrator drafts candidate new service areas **within SBD's real OH/IN/KY/western-WV footprint** with public data pre-filled, e.g.: Columbus OH, Lexington KY, Huntington WV, Charleston WV, Fort Wayne IN, Toledo OH, Northern Kentucky (Florence/Covington). **Owner prunes to genuinely-served areas before any build.** Each approved area becomes a new object in `cities.ts` on the same schema (passing `cities.test.ts` automatically), plus an entry in the `/locations/` hub `ItemList`. No new area goes live without owner confirmation of real coverage. This phase gets its own task list when the city list is approved.

---

## Self-Review (author)

- **Spec coverage:** §4 data model → Task 1 (interface + fields + de-fabrication + real stats); §5 rendering (common-uses block, zoning resource, ZIPs) → Task 2; §7 guardrails → Global Constraints + `cities.test.ts` (fabrication/`$` assertions) + Task 3 sweeps; §8 validation → Task 3; §6 Phase 2 → documented + gated.
- **Placeholder scan:** interface + test + section markup + CSS are exact code. The researched DATA values are intentionally not hardcoded in the plan (they must be sourced live per the no-fabrication rule); Task 1 Step 4 specifies exactly what to research, the shape, worked examples, and the omit-don't-guess rule.
- **Type consistency:** new `City` fields used in Task 2 markup (`primaryZips`, `zoning[].{county,office,url}`, `commonUses[].{label,persona}`, `usesIntro`) match the interface added in Task 1 Step 3 and the assertions in `cities.test.ts`.
- **Guardrail enforcement is testable:** `cities.test.ts` fails the build if any fabricated pattern or `$` re-enters the dataset — a durable regression guard, not just a one-time check.
