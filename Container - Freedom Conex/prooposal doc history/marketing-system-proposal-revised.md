# Marketing System Proposal: Container Decision Engine

**Version:** 2.0 (Revised)
**Date:** 2026-01-30
**Analysis Mode:** Reasoning Contract (RC)

---

## Executive Summary

This document proposes a complete marketing system for an education-first decision engine targeting shipping container buyers. The system is designed to:

- **Discover buyers through search** at the moment they're making purchase decisions
- **Resolve their decisions** through neutral, educational content
- **Convert them at readiness** through a decision-capturing quote request
- **Attribute success** through a tiered measurement system that degrades gracefully

Success is measured by qualified quote requests and attributable closed sales—not traffic.

**Key insight:** This is not a sales funnel. It's a decision resolution engine that earns trust through education and converts when buyers are ready to act.

### MVP Constraints (Binding)

| Dimension | Constraint |
|-----------|------------|
| Core decisions | 5 (not 8) |
| Primary segment | Agricultural/Rural only |
| Maximum pages | 8 |
| Calculator scope | Size only, no pricing |
| Attribution | Tiered fallbacks, not seller-dependent |
| Segment expansion | Evidence-based, controlled experiments only |

---

## Deliverable 1: Buyer Decision Model

### The 5 Core Pre-Quote Decisions

| ID | Decision | Why Required Before Quote |
|----|----------|---------------------------|
| **D1** | **Size Selection** | Cannot quote without knowing size. Fundamental product variable. |
| **D2** | **Condition Choice** | Determines price range by 40-60%. Must have preference. |
| **D3** | **Delivery Feasibility** | Deal-breaker if site cannot receive. Must believe it's possible. |
| **D4** | **Price Expectations** | Misaligned expectations waste seller time. Must be realistic. |
| **D5** | **Permitting Concern** | If buyer believes it's illegal/impossible, they won't proceed. |

### Demoted Decisions (Not MVP Content)

| Decision | New Status | Rationale |
|----------|------------|-----------|
| Modifications | Sales-stage | Only relevant to subset of buyers. Seller handles during quote. |
| Vendor Evaluation | Implicit | Solved by educational stance, not explicit content. |
| Timeline | Form capture | Captured in form for qualification. Not a content decision. |

### Why These 5

Each retained decision shares a critical property: **if unresolved, the buyer cannot or will not request a quote.**

- No size → can't quote
- No condition preference → can't price
- Delivery seems impossible → won't proceed
- Price expectations wildly off → wastes everyone's time
- Believes it's illegal → won't proceed

Modifications, vendor trust, and timeline are important but don't block quote submission—they're resolved during or after the sales conversation.

---

## Deliverable 2: Primary Segment Commitment

### Selected Segment: Agricultural/Rural

### Justification

| Criterion | Assessment |
|-----------|------------|
| **Close likelihood** | HIGH. Practical decision-makers, often cash buyers, clear needs. |
| **Decision clarity** | HIGH. Standard use cases (equipment storage, feed, workshop). |
| **Delivery feasibility** | HIGH. Large properties, easy access, rarely space-constrained. |
| **Permit complexity** | LOW. Rural zoning typically more permissive. |
| **Price sensitivity** | MODERATE. Value-focused but not extreme bargain hunters. |
| **Modification needs** | LOW. Usually want standard containers. |
| **Competition** | LOWER. Less served by sophisticated marketing. |

### Why Not Others (For MVP)

| Segment | Reason for Phase 2+ |
|---------|---------------------|
| Construction | Established vendor relationships. Higher competition. |
| Small Business | Too varied. Harder to create focused content. |
| Residential | High tire-kicker rate. Permit anxiety. Smaller deals. |
| Retail/Commercial | Modification-heavy. Longer sales cycle. |
| Institutional | Procurement complexity. Slow decisions. |

### Segment Expansion Protocol

Expansion is **phased and evidence-based**, not opportunistic.

**Prerequisites (ALL required before any expansion):**
- Quote page conversion rate stable 30+ days
- Seller confirms leads are qualified (Tier 2 attribution)
- Quote volume does not exceed seller capacity
- 5-decision framework demonstrably resolves buyer blockers

**Expansion Method:**
Each new segment launches as a **controlled experiment**:
- Explicit success criteria (e.g., "15% conversion in 60 days")
- Explicit failure criteria (e.g., "<5% conversion triggers removal")
- Minimum 60-day evaluation window
- 1-2 pages max per segment test

**Architectural Constraint:**
New segments **must route through existing decision framework**—no parallel flows, no duplicate hubs, no separate quote forms.

**Provisional Sequence:**

| Priority | Segment | Prerequisite |
|----------|---------|--------------|
| 1 | Agricultural/Rural | N/A (MVP) |
| 2 | Construction | Primary validated |
| 3 | Small Business | Construction validated |
| 4 | Residential | Robust qualification proven |

Full protocol: `.project-catalog/decisions/2026-01-30-segment-expansion-protocol.md`

---

## Deliverable 3: Site Architecture (MVP)

### MVP Structure (8 Pages)

```
/                       → Decision Router (Home)
├── /size/              → Size Guide (D1)
├── /size/calculator/   → Size Calculator (D1 tool)
├── /condition/         → Condition Guide (D2)
├── /delivery/          → Delivery Guide (D3)
├── /cost/              → Pricing Factors (D4)
├── /permits/           → Permits Overview (D5)
└── /quote/             → Quote Request
```

### What's NOT in MVP

| Excluded | Rationale |
|----------|-----------|
| `/modifications/` | Sales-stage, not pre-quote |
| `/uses/construction/` | Phase 2 segment |
| `/uses/residential/` | Phase 2+ segment |
| `/uses/retail/` | Phase 2+ segment |
| `/about/` | Can add Phase 2 if trust signals needed |
| `/learn/` (blog) | Not decision-critical |
| Multiple hub sub-pages | MVP focuses on primary resolution |

### Page Specifications

| Page | Purpose | Word Count | Key Element |
|------|---------|------------|-------------|
| Homepage | Route to decisions | 300-500 | Decision paths, not sales pitch |
| Size Guide | Resolve D1 | 1,500-2,000 | Comparison table, visual aids |
| Calculator | Tool for D1 | Interactive | Size recommendation only |
| Condition Guide | Resolve D2 | 1,500-2,000 | Grade comparison, trade-offs |
| Delivery Guide | Resolve D3 | 1,200-1,500 | Site requirements, visuals |
| Pricing Factors | Resolve D4 | 1,000-1,500 | Framework, NOT prices |
| Permits Overview | Resolve D5 | 1,000-1,500 | Reassurance, next steps |
| Quote Page | Convert | 200 + form | Decision-capturing form |

**Total MVP content:** ~7,000-9,000 words + calculator

---

## Deliverable 4: Calculator Scope and Guardrails

### What the Calculator WILL Do

- Accept inputs: What are you storing? Approximate quantity/dimensions?
- Output: Size recommendation (20ft, 40ft, or 40ft HC)
- Show: Dimensions and approximate capacity
- Provide: Visual reference (what fits inside)

### What the Calculator WILL NOT Do

| Excluded Output | Rationale |
|-----------------|-----------|
| Prices or price ranges | Creates false anchoring. Prices vary. |
| Cost estimates | Same as above. |
| Availability | We don't know inventory in real-time. |
| Delivery timelines | Depends on location, seller capacity. |

### Why No Pricing in Calculator

1. **Prices vary** by market, condition, time, availability
2. **Price anchoring** creates bad leads who fixate on numbers we can't guarantee
3. **Price shoppers** are lower-quality leads for this model
4. **Pricing frameworks** in content are sufficient; calculators imply false precision

### Post-Calculator Flow

```
Calculator Complete
    ↓
"Based on your needs, a [SIZE] container is likely right."
    ↓
Option A: "Ready for a quote?" → /quote/ (pre-filled with size)
Option B: "Learn more about [SIZE] containers" → /size/
```

### Filtering Effect

- Calculator → Quote: Qualified, ready to proceed
- Calculator → Exit: May return, captured in analytics
- Calculator → Wants price: Content explains factors, frames expectations, no numbers

---

## Deliverable 5: Conversion Flow

### Quote Request Form

**Location:** `/quote/`

**Form Structure:**

| Section | Fields | Purpose |
|---------|--------|---------|
| **Decision Capture** | Size (pre-fill if from calc), Condition preference, Primary use, Delivery zip, Site access, Timeline | Qualify + contextualize |
| **Contact** | Name, Email, Phone | Enable follow-up |
| **Optional** | Additional notes | Edge cases |

### Lead Scoring (Adjusted for Segment)

| Factor | Points | Rationale |
|--------|--------|-----------|
| Specific size selection | +10 | Made decision |
| Specific condition preference | +10 | Made decision |
| Use case: Farm/equipment storage | +15 | Target segment |
| Use case: Other agricultural | +10 | Target segment |
| Use case: Non-agricultural | +5 | Valid but not focus |
| Timeline: ASAP | +20 | High urgency |
| Timeline: 1-3 months | +15 | Near-term |
| Timeline: 3-6 months | +10 | Planning |
| Timeline: Just researching | +3 | Low urgency |
| Easy delivery access | +5 | Low friction |
| Filled optional field | +5 | Engaged |

**Thresholds:**
- 50+: Priority lead
- 30-49: Standard lead
- <30: Lower priority

### CTA Placement

**Where:**
- End of each guide page
- After calculator completion
- Navigation (persistent, subtle)

**Not where:**
- Homepage hero
- Pop-ups
- Every paragraph

---

## Deliverable 6: Measurement and Attribution Plan

### The Problem

Ideal attribution requires seller to report closed sales. Sellers may not comply consistently.

### Solution: Tiered Attribution System

Attribution degrades gracefully. We measure what we can, always.

---

### Tier 1: No Seller Input Required (Always Available)

| Metric | What It Tells Us |
|--------|------------------|
| Quote request volume | Demand level |
| Lead score distribution | Quality proxy |
| Quote page conversion rate | Form effectiveness |
| Pages visited before quote | Content effectiveness |
| Calculator completion rate | Tool usefulness |
| Time to quote request | Decision cycle length |
| Return visits before conversion | Research depth |

**These metrics are always available.** If seller provides nothing, we still know:
- Is traffic converting?
- Is content working?
- Are leads appearing qualified?

---

### Tier 2: Minimal Seller Input (Low Burden)

| Signal | Input Required |
|--------|----------------|
| "Was lead contactable?" | Y/N per lead |
| "Was lead qualified?" | Y/N per lead |

**Implementation:** Weekly email or simple form.

"Of last week's 5 leads, how many were worth pursuing? [0-5]"

This validates lead quality without requiring per-lead tracking.

---

### Tier 3: Periodic Aggregate (Monthly)

| Signal | Input Required |
|--------|----------------|
| "How many leads closed this month?" | Single number |
| "Approximate revenue from site leads?" | Single number |

**Implementation:** Monthly check-in.

Does not require lead-by-lead tracking. Estimate is sufficient for directional decisions.

---

### Tier 4: Full Closed-Loop (Ideal)

| Signal | Input Required |
|--------|----------------|
| Per-lead status | Contacted/Quoted/Won/Lost |
| If won: Sale amount | Dollar value |
| If lost: Reason | Category |

**Implementation:** CRM or tracking spreadsheet.

This is ideal but not required for MVP operation.

---

### Attribution Integrity Protection

| Principle | Implementation |
|-----------|----------------|
| Track what we control | Never depend on seller for operational metrics |
| Simplify seller asks | Binary or aggregate questions, not diaries |
| Build trust first | Show seller value of OUR data, earn cooperation |
| Accept uncertainty | Directional data beats no data |

### Minimum Viable Attribution (Seller Provides Nothing)

We can still:
- Measure traffic → engagement → quote requests
- Score leads and track score distribution over time
- Identify best-performing content by quote contribution
- Detect form friction via abandonment

We cannot:
- Measure true ROI
- Validate lead quality beyond form signals
- Optimize for close rate

**This is acceptable for MVP.** Full attribution is Phase 2+.

---

## Deliverable 7: MVP Scope Cap

### Hard Boundaries

| Dimension | Limit |
|-----------|-------|
| Total pages | 8 maximum |
| Segment | Agricultural/Rural only |
| Use cases | Farm storage, equipment storage only |
| Decisions covered | 5 core decisions only |
| Tools | Size calculator only (no pricing) |
| Geography | Seller's actual service area |

### MVP Page List (Final)

1. Homepage
2. Size Guide
3. Size Calculator
4. Condition Guide
5. Delivery Guide
6. Pricing Factors
7. Permits Overview
8. Quote Page

### Explicitly Excluded from V1

| Excluded | Why |
|----------|-----|
| Modifications content | Sales-stage |
| Construction use cases | Phase 2 segment |
| Residential use cases | Phase 2+ segment |
| Retail/commercial use cases | Phase 2+ segment |
| Location-specific pages | No fake locality |
| Blog/articles | Not decision-critical |
| About page | Phase 2 if needed |

### Expansion Criteria

**Do NOT expand until ALL of:**

1. Quote volume exceeds seller's comfortable handling capacity
2. Conversion rate stabilizes for 30+ days
3. Tier 2 attribution confirms lead quality (seller says "yes, these are good")

**Then and only then:**

| Phase | Addition | Trigger |
|-------|----------|---------|
| 2 | Construction segment | Capacity exceeded |
| 3 | Additional segments | Sustained Phase 2 performance |
| 4 | Deeper content | Revenue attribution confirmed |

### Scope Creep Prevention

- Every new page requires written justification against expansion criteria
- No "while we're at it" additions
- SEO opportunities go to backlog, not production
- Content requests require hypothesis + measurement plan

---

## Summary of Binding Decisions

| # | Area | Decision |
|---|------|----------|
| 1 | Decisions | 5 core: Size, Condition, Delivery, Price Expectations, Permits |
| 2 | Segment | Agricultural/Rural only (MVP) |
| 3 | Calculator | Size only, no pricing |
| 4 | Attribution | 4-tier fallback system |
| 5 | Scope | 8 pages max |
| 6 | Expansion | Evidence-based, controlled experiments, existing framework only |

---

## Implementation Sequence

### Phase 0: Pre-Build (Now)
- Confirm seller service area
- Validate calculator logic with seller
- Set up analytics (GA4 or Plausible)
- Set up form handling + lead delivery

### Phase 1: MVP Build
- 8 pages per spec above
- Size calculator (no pricing)
- Quote form with scoring
- Tier 1 attribution active

### Phase 2: Validation (30-60 days post-launch)
- Monitor Tier 1 metrics
- Implement Tier 2 seller check-ins
- Validate lead quality
- Determine expansion readiness

### Phase 3: Expansion (If criteria met)
- Add Construction segment content
- Deepen existing guides if needed
- Implement Tier 3/4 attribution

---

## Constraints Honored

| Constraint | How Honored |
|------------|-------------|
| Neutral, education-first | Content educates, doesn't sell |
| No deceptive locality | No fake local pages |
| No premature selling | CTAs contextual, not aggressive |
| Decision-critical SEO only | 5 decisions, nothing else |
| Lead quality > volume | Scoring, segment focus, no price anchoring |
| MVP discipline | 8 pages max, strict expansion criteria |

---

## Risk Assessment (Revised)

| Component | Confidence | Key Risk | Mitigation |
|-----------|------------|----------|------------|
| Decision model | 85% | Over-simplified | Can add back if needed |
| Segment choice | 80% | Wrong segment | Expansion criteria catch this |
| Calculator | 90% | Users want prices | Content explains why not |
| Attribution | 85% | Seller non-compliance | Tier system degrades gracefully |
| Scope cap | 90% | SEO pressure to expand | Written criteria enforced |

**Overall confidence: 84%** (up from 78% with clearer constraints)

---

## Appendix: Decision Record

Full decision documentation:
- `.project-catalog/decisions/2026-01-30-mvp-constraints.md`

Working analysis:
- `.memory/working/buyer-decision-analysis.md`
- `.memory/working/site-architecture.md`
- `.memory/working/content-strategy.md`
- `.memory/working/conversion-flow.md`
- `.memory/working/measurement-attribution.md`
