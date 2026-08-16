# Decision: Owner rulings on all five competitive gaps

Date: 2026-08-11
Decided by: Eli Carder (owner)
Recorded by: orchestrator (Claude Opus 5, 1M context, Claude Code CLI)
Status: ACTIVE
Topic slugs: competitor-gaps (analysis, now REPORTED), geo-wv-lexington (ACTIVE), rto-rental-vacuum (ACTIVE)
Tags: #competitor-gaps #geo #rent-to-own #accessories #permits #aeo

## Context

Three parallel maps were delivered on 2026-08-11 and are the evidence base for these rulings:

- `.outputs/competitor-gaps/2026-08-11-conextalk-architecture.md` (data-auditor, 48 tool uses)
- `.outputs/competitor-gaps/2026-08-11-competitor-keyword-map.md` (researcher, 67 tool uses)
- `.outputs/competitor-gaps/2026-08-11-our-coverage-baseline.md` (seo-analyst, 86 tool uses)

Five gaps were put to the owner. All five were ruled on in one pass.

**Framing correction established by the analysis and worth preserving:** the owner opened with "Conextalk is
beating us." The maps found that on editorial depth we are ahead and it is not close. Conextalk has 100
indexable pages, 589 keywords, four blog posts whose newest is roughly 11 months old, a FAQ page with exactly
one question, zero FAQPage schema, and no size guide, cost page, permits page, buying guide, or persona pages.
Their advantages are transactional surface (62 priced SKUs), accessories (36 to 40 percent of their entire
search footprint), and credential moats. The competitive problem was never content volume.

## The five rulings

### 1. West Virginia and Lexington KY: PROCEED

**Evidence:** we claim WV as served in copy across 10 files under `src/` (locations hub, all four persona
pages, footer, `lib/schema/entities.ts`) and have ZERO WV pages, verified by the orchestrator. Onsitestorage
holds `shipping containers for sale west virginia` at RANK 1 from a single Huntington page; conexwest holds
4/13/19; **Conextalk is absent from WV entirely.** Lexington KY: onsitestorage rank 1, 8, 11; conexwest absent;
Conextalk absent; we have no page. WV keyword research already exists in three files.

**Why this was ranked first:** it is the same city template we already ship 13 times, so build cost is low, and
it is uncontested by the named rival.

**BLOCKER RAISED BEFORE ANY WORK: serviceability is an owner fact.** Whether Steel Box Direct and its
fulfillment partner can actually deliver to Huntington WV, Parkersburg WV, and Lexington KY cannot be verified
from the repo or the web. Existing copy claiming western WV is evidence for the WV cities but not proof, and
**nothing in the repo claims Lexington KY at all.** A city page for a market we cannot serve is worse than no
page. The research agent was instructed to flag this per city as OWNER MUST CONFIRM and not to soften it.

### 2. Weight, tare, and pallet capacity: DEFERRED to its own session

Owner choice. Nothing about the analysis changed and this remains the **highest strategic fit** of any gap
found: conexwest holds roughly 45 weight queries at top-10 with many at rank 1, and rank 3 on roughly EIGHTEEN
near-identical phrasings of one pallet question from a SINGLE asset. That is the AEO shape exactly, one asset
absorbing a phrasing family, and AEO is the site strategy.

Carried forward as T-047 with a correction the orchestrator made to the agent's finding: **we already publish
tare and payload** in `src/data/containers.ts`, rendered on product pages. The agent checked
`containerReference.ts`, where there is genuinely zero, and missed it. So the gap is the question-shaped asset,
not the data, and it is cheaper than reported. **Dependency: resolve T-026 first** (whether unattributed
spec-sheet load figures are prohibited structural claims under PROJECT_HS_003 class 6), because a
weight-focused asset multiplies whatever exposure those figures carry.

### 3. Rent-to-own and the rental vacuum: PLAN AND EXECUTE

**Evidence:** Conextalk's rental footprint collapsed 42 keyword rows to 10 in five weeks, roughly 33 keywords
gone including `shipping containers for rent in ohio` from rank 42, all via one URL that went 43 rows to 11.
Cause UNVERIFIED (grade C). Onsitestorage now holds that exact query at RANK 1 via a Columbus rent-to-own
product page, with 471 rent-to-own rows against conexwest's 200 and Conextalk's zero.

**THE CONSTRAINT, raised by the orchestrator before dispatch:** the site states in two FAQ answers that Steel
Box Direct does **not** offer plain month-to-month rentals. So this cannot be attacked with a rental offering.
The honest play is capturing rental-INTENT searchers into rent-to-own while being straight that we do not rent,
and conceding where renting genuinely suits the buyer better. The strategist was told to treat that as the
interesting part of the problem rather than an obstacle, and being the dealer who tells the truth was framed as
a real advantage rather than a limitation.

**Watch item written into the brief:** rent-to-own is inherently about money (terms, payments, totals), and
dollar amounts are FORBIDDEN on city pages. If the proposed architecture puts a city name and a payment figure
on the same page, that requires an explicit owner ruling and must not be assumed fine or silently stripped.

### 4. Accessories: DEFERRED to a larger vendor and backlink planning session

Owner scoped it explicitly as "a larger planning session where we can leverage vendors and try to build a
backlink strategy around" it. That reframes the item: it is not merely a content gap, it is the intake for a
vendor-partnership plus digital-PR workstream.

**It converges with existing open work:** T-011 (accessory vendor partnerships, open since June) and T-017 (the
Mytee Products outreach, where a public 5 percent affiliate program is already confirmed and the open question
is whether they will do something reciprocal). The `.agents/` roster already includes
`backlink-assets-strategist`, `backlink-local-researcher`, and `backlink-competitor-analyst`, built for exactly
this.

**Scale of the gap, for that session:** accessories are 36 to 40 percent of Conextalk's entire search footprint
and their only growth engine, with `conex shelving` at rank 1, `conex lock box` at 2, and roughly 30 more in the
top 10, across 23 accessory and modification SKU pages. We have zero. Note also that their question intent
resolves to product pages rather than articles, which is a weak AEO posture that could be beaten with
comparison content requiring no inventory at all.

### 5. Permits and zoning: KILLED

**Owner ruling, verbatim in substance:** "Our stance is still the same uncommitted one we hold to mitigate
risk."

So the single largest cluster our named rival has zero of is **deliberately ceded on legal-risk grounds.**
Conexwest holds 404 permit/zoning rows and SEVEN rank-1 positions including
`do i need a permit for a shipping container`, with dedicated Kentucky, West Virginia, and Ohio posts.
Onsitestorage holds only 28, which proves this is not a scale effect: conexwest wins the generic phrasing with a
Florida-specific post, so topical coverage does the work and the opportunity is real.

**This is the right call by the owner's own risk appetite, and it is consistent.** The project spent
2026-08-10 and 2026-08-11 building PROJECT_HS_003 and removing 12 live violations plus a homepage hard-stop
breach precisely to stop making permit determinations. Chasing the cluster that rewards making them would have
undone that work.

**DO NOT RE-RAISE this as an SEO opportunity.** The row is kept, with its evidence, per the TOPICS.md
convention that killed items keep their reason so the work is never re-derived by inference. PROJECT_HS_003
stands unchanged and unweakened.

## Consequences

- `competitor-gaps` moves to REPORTED. Two child workstreams open: `geo-wv-lexington` and `rto-rental-vacuum`.
- T-046 and T-048 to in_progress; T-047 and T-050 carried forward as deferred with their reasons intact;
  T-049 killed.
- The permit ruling closes a tension that had been open since the keyword map landed: the biggest available
  cluster and the project's strongest compliance rule pointed in opposite directions. The owner resolved it in
  favour of the rule.

## Still owed, and unrelated to these rulings

Two commit decisions from the 2026-08-11 verification remain open and are blocking the permit-compliance batch
(T-054): the commit sequencing (12 of 48 unstaged paths belong to that batch, and PROJECT_HS_003 itself is
untracked so it would not ship with the enforcement it authorizes), and whether `UDO Project/.outputs/` should
be version-controlled at all, given that `.gitignore` is **already** ignoring it and therefore already
discarding this session's entire evidence base.

## Related

- `.outputs/competitor-gaps/` (all three maps)
- `PROJECT_STATE.json` T-046 through T-051, T-026, T-011, T-017, T-054
- `UDO Project/HARD_STOPS.md` PROJECT_HS_003
- `.project-catalog/decisions/2026-07-09-pricing-display-policy.md`
- `TOPICS.md` rows: competitor-gaps, geo-wv-lexington, rto-rental-vacuum
