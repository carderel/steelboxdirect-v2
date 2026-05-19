# Marketing System Proposal: Container Decision Engine

**Date:** 2026-01-30
**Analysis Mode:** Reasoning Contract (RC)
**Analyst:** Claude Opus 4.5

---

## Executive Summary

This document proposes a complete marketing system for an education-first decision engine targeting shipping container buyers. The system is designed to:

- **Discover buyers through search** at the moment they're making purchase decisions
- **Resolve their decisions** through neutral, educational content
- **Convert them at readiness** through a decision-capturing quote request
- **Attribute closed sales** through closed-loop reporting

Success is measured by qualified quote requests and attributable closed sales—not traffic.

**Key insight:** This is not a sales funnel. It's a decision resolution engine that earns trust through education and converts when buyers are ready to act.

---

## Deliverable 1: Buyer Decision Model

### The 8 Purchase-Blocking Decisions

| ID | Decision | What Blocks Them | Resolution |
|----|----------|------------------|------------|
| D1 | **Size Selection** | Don't know what size they need | Calculator, comparison, use-case mapping |
| D2 | **Condition Choice** | Confused about new vs. used grades | Condition guide, trade-off explanation |
| D3 | **Delivery Feasibility** | Worried it won't work at their site | Delivery guide, site requirements, visuals |
| D4 | **Price Expectations** | Don't know what things should cost | Pricing framework (not specific prices) |
| D5 | **Modification Options** | Don't know what's possible | Modification catalog, feasibility guide |
| D6 | **Permitting/Zoning** | Fear of legal/zoning issues | Permitting guide, common scenarios |
| D7 | **Vendor Evaluation** | Don't know who to trust | Solved by educational stance |
| D8 | **Timeline/Availability** | Don't know how long things take | Process explanation |

### Decision Tiers

**Tier 1 - Entry Decisions** (Must resolve to proceed)
- D1: Size Selection
- D2: Condition Choice

**Tier 2 - Commitment Decisions** (Must resolve to request quote)
- D3: Delivery Feasibility
- D4: Price Expectations
- D6: Permitting/Zoning

**Tier 3 - Conversion Decisions** (Resolved during sales conversation)
- D5: Modification Options
- D7: Vendor Evaluation
- D8: Timeline/Availability

### Buyer Segments and Their Primary Concerns

| Segment | Primary Concerns | Secondary |
|---------|------------------|-----------|
| Construction/Contractors | Size, Delivery, Timeline | Condition |
| Agricultural/Rural | Size, Delivery, Permits | Condition |
| Small Business | Size, Cost, Permits | Modifications |
| Residential | Size, Modifications, Permits | Cost |
| Retail/Commercial | Modifications, Cost, Permits | Delivery |
| Institutional | Cost, Permits, Timeline | Size |

**Confidence: 80%** | Would increase with buyer interviews or seller input

---

## Deliverable 2: Site Architecture

### Core Structure

```
/                           → Decision Router (Home)
│
├── DECISION HUBS (Primary Content)
│   ├── /size/              → Size Decision Hub
│   │   ├── /size/guide/
│   │   ├── /size/calculator/
│   │   └── /size/20-vs-40/
│   │
│   ├── /condition/         → Condition Decision Hub
│   │   ├── /condition/guide/
│   │   ├── /condition/new-vs-used/
│   │   └── /condition/what-to-inspect/
│   │
│   ├── /delivery/          → Delivery Decision Hub
│   │   ├── /delivery/guide/
│   │   └── /delivery/requirements/
│   │
│   ├── /cost/              → Cost Framework Hub
│   │   ├── /cost/factors/
│   │   └── /cost/total/
│   │
│   └── /permits/           → Permitting Decision Hub
│       ├── /permits/guide/
│       ├── /permits/residential/
│       └── /permits/commercial/
│
├── USE CASES (SEO Entry Points)
│   ├── /uses/construction-storage/
│   ├── /uses/farm-storage/
│   ├── /uses/home-storage/
│   ├── /uses/workshop/
│   ├── /uses/retail-popup/
│   └── /uses/temporary-office/
│
├── /modifications/         → Modifications Hub (Lower Priority)
├── /learn/                 → Supporting Articles
├── /quote/                 → Conversion Point
└── /about/                 → Trust/Transparency
```

### Architecture Principles

| Principle | Implementation |
|-----------|----------------|
| Decision-centric | Navigation mirrors decision journey, not product catalog |
| Hub model | Authoritative landing pages, not blog post sprawl |
| Progressive disclosure | Quick answers + depth for those who want it |
| Use cases as on-ramps | SEO entry points that route to relevant decisions |
| Conversion at readiness | Quote CTA contextual, not aggressive |

### Page Count

- **MVP Launch:** ~10 pages (5 hub guides + calculator + use cases + quote + about)
- **Full Build:** ~25 pages

---

## Deliverable 3: Content Strategy

### Content Tiers

| Tier | Purpose | Page Count | Priority |
|------|---------|------------|----------|
| **1: Decision Hubs** | Resolve the 8 buying decisions | 10-15 | Must have |
| **2: Use Cases** | SEO entry points by segment | 8-12 | Should have |
| **3: Supporting** | Deep dives, edge cases | As needed | Nice to have |

### Decision Hub Content Specifications

| Hub | Primary Page Words | Key Tool | Target Queries |
|-----|-------------------|----------|----------------|
| Size | 2,000-3,000 | Calculator | "what size container do I need" |
| Condition | 2,500-3,500 | Comparison chart | "used shipping container condition" |
| Delivery | 2,000-2,500 | Visual guide | "container delivery requirements" |
| Cost | 1,500-2,000 | Framework (not prices) | "how much does a container cost" |
| Permits | 1,500-2,000 | Scenario guide | "do I need permit for container" |

### SEO Targeting Philosophy

**Target:** Decision-stage queries (high purchase intent)
**Avoid:** Informational queries with no buying intent

Good targets:
- "what size shipping container do I need"
- "used vs new shipping container"
- "container delivery requirements"

Avoid:
- "history of shipping containers"
- "how shipping containers are made"

### Production Priority

**Launch MVP:**
1. Homepage (decision router)
2. 5 Decision Hub main guides
3. Size calculator
4. Quote page
5. About page

**Phase 2 (30-60 days):**
- Remaining hub supporting pages
- 4-6 highest-priority use case pages

**Phase 3 (ongoing):**
- Additional use cases based on data
- Supporting content based on FAQs

---

## Deliverable 4: Conversion Flow

### Primary Conversion: Quote Request Form

**Location:** `/quote/`

**Form Structure:**

| Section | Fields | Purpose |
|---------|--------|---------|
| **Decision Capture** | Size preference, Condition preference, Primary use, Delivery location, Site access, Timeline | Qualify and contextualize |
| **Contact** | Name, Email, Phone, Best time | Enable follow-up |
| **Optional** | Additional notes | Capture edge cases |

**Lead Scoring System:**

| Factor | Points |
|--------|--------|
| Specific size selection | +10 |
| Specific condition preference | +10 |
| Timeline: ASAP | +20 |
| Timeline: 1-3 months | +15 |
| Timeline: 3-6 months | +10 |
| Timeline: Just researching | +3 |
| Commercial use case | +10 |
| Easy delivery access | +5 |
| Filled optional field | +5 |

**Score Thresholds:**
- 50+: Priority lead (contact within hours)
- 30-49: Standard lead (within 1 business day)
- <30: Lower priority (still contact)

### Secondary Conversion: Email Capture

**Trigger:** After calculator completion
**Offer:** "Email me these results"
**Follow-up:** Results + 1 educational email (not sales spam)

### CTA Placement

**Where:**
- End of decision hub guides
- After tool completion
- Navigation (persistent, subtle)
- Footer

**Not where:**
- Homepage hero (too early)
- Pop-ups (interruptive)
- Every paragraph (annoying)

### Lead Handoff to Seller

Each lead delivered with:
- Full form data
- Lead score + rationale
- Pages visited before submission
- Decision context

---

## Deliverable 5: Measurement and Attribution Plan

### Metric Hierarchy

**Outcome Metrics (What Actually Matters):**
| Metric | Definition |
|--------|------------|
| Attributable Closed Sales | Sales where quote originated from site |
| Revenue Attributed | Dollar value of closed sales |
| Cost per Acquisition | Marketing spend / closed sales |

**Leading Metrics (Predict Outcomes):**
| Metric | Definition |
|--------|------------|
| Qualified Quote Requests | Form submissions scored 30+ |
| Quote-to-Close Rate | Closed sales / quote requests |

**Diagnostic Metrics (Understand Problems):**
| Metric | Definition |
|--------|------------|
| Quote Page Conversion | Visits → submissions |
| Decision Hub Engagement | Time on page, scroll depth |
| Multi-Hub Visitors | % visiting 2+ decision hubs |

### The Attribution System

```
User visits site
    ↓
Analytics captures: source, pages, time, events
    ↓
User submits quote form
    ↓
Form captures: decisions, contact, timestamp
System adds: source, pages visited, lead score
    ↓
Lead delivered to seller with full context
    ↓
Seller contacts lead, updates status
    ↓
Seller reports outcome: Won ($X) / Lost (reason)
    ↓
System closes loop: attributes revenue to source/content
```

### Technical Requirements

| Component | Options |
|-----------|---------|
| Analytics | GA4 or Plausible |
| Form handling | Formspree, Netlify Forms |
| Lead storage | Airtable, Notion, Google Sheets |
| Email notifications | Zapier or native |

### Seller Responsibilities (Non-Negotiable for True Measurement)

Seller must report for each lead:
- Status: Contacted / Quoted / Won / Lost
- If won: Sale amount
- If lost: Reason (price, timing, competitor, unqualified)

**Without this feedback loop, we can only measure lead volume, not actual success.**

### Reporting Cadence

| Frequency | Focus |
|-----------|-------|
| Weekly | Quote requests, conversion rate, problems |
| Monthly | Closed sales, revenue, source breakdown, content performance |
| Quarterly | ROI analysis, strategic decisions |

---

## Assumptions Requiring Validation

| ID | Assumption | Risk if Wrong |
|----|------------|---------------|
| **A001** | Seller can fulfill new, used, modified containers | Architecture may need adjustment |
| **A002** | All buyer segments are valid targets | May need segment filtering |
| **A007** | Use case priority order is correct | May need reordering based on data |
| **A014** | Seller will report outcomes | Cannot measure true success |

**Recommendation:** Validate A001, A002, and A014 before build begins.

---

## Implementation Sequence

### Phase 0: Validation (Before Build)
- Confirm seller capabilities (A001)
- Confirm target segments (A002)
- Confirm tracking commitment (A014)
- Keyword research to validate SEO targets

### Phase 1: MVP Build
- Homepage
- 5 Decision Hub guides
- Size calculator
- Quote page with form + scoring
- Basic analytics setup
- Lead delivery mechanism

### Phase 2: Expansion (Post-Launch)
- Remaining hub pages
- Use case pages (prioritized by data)
- Secondary conversion (email capture)
- Closed-loop reporting implementation

### Phase 3: Optimization (Ongoing)
- A/B test form length
- Refine lead scoring based on close data
- Expand content based on performance
- Improve attribution accuracy

---

## Constraints Honored

| Constraint | How Honored |
|------------|-------------|
| Neutral, education-first positioning | Content educates, doesn't sell |
| No deceptive locality claims | No fake local pages, honest service area |
| No premature selling | CTAs contextual, not aggressive |
| SEO for decision-critical content only | Targeting decision queries, not vanity traffic |
| Lead quality > volume | Scoring system, decision-capturing form |

---

## Confidence Assessment

| Component | Confidence | Key Uncertainty |
|-----------|------------|-----------------|
| Decision model | 80% | Needs validation with real buyers |
| Site architecture | 85% | Solid foundation, may evolve |
| Content strategy | 80% | SEO targets need keyword validation |
| Conversion flow | 75% | Form friction untested |
| Measurement plan | 70% | Depends on seller follow-through |

**Overall confidence: 78%**

This is a well-reasoned proposal based on the brief provided. Key risks are assumptions about seller capabilities and tracking commitment. Recommend validating critical assumptions before significant build investment.

---

## Appendix: Working Documents

Full analysis available in:
- `.memory/working/buyer-decision-analysis.md`
- `.memory/working/site-architecture.md`
- `.memory/working/content-strategy.md`
- `.memory/working/conversion-flow.md`
- `.memory/working/measurement-attribution.md`

