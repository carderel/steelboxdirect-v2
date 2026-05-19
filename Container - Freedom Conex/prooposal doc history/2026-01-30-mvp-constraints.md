# Decision Record: MVP Constraints

**Date:** 2026-01-30
**Status:** Binding
**Requested by:** Stakeholder
**Context:** Revisions to marketing system proposal per design constraints

---

## Decision 1: Buyer Decision Model Reduction

### Final 5 Core Pre-Quote Decisions

| ID | Decision | Why Required Before Quote |
|----|----------|---------------------------|
| **D1** | Size Selection | Cannot quote without knowing size. Fundamental product variable. |
| **D2** | Condition Choice | Determines price range by 40-60%. Must have preference. |
| **D3** | Delivery Feasibility | Deal-breaker if site cannot receive. Must believe it's possible. |
| **D4** | Price Expectations | Misaligned expectations waste seller time. Must be realistic. |
| **D5** | Permitting Concern | If buyer believes it's illegal/impossible, they won't proceed. Must have reassurance. |

### Demoted Decisions

| Original | New Status | Rationale |
|----------|------------|-----------|
| D5: Modifications | Sales-stage | Only relevant to subset of buyers. Seller handles during quote conversation. |
| D7: Vendor Evaluation | Implicit | Solved by educational stance, not explicit content. Trust is earned, not explained. |
| D8: Timeline | Form capture | Captured in quote form for qualification. Not a content decision. |

### Decision Rationale

The 5 retained decisions share a common property: **if unresolved, the buyer cannot or will not request a quote.**

Modifications, vendor trust, and timeline are important but don't block quote submission—they're resolved during or after the sales conversation.

---

## Decision 2: Primary Segment Commitment

### Selected: Agricultural/Rural

### Justification

| Criterion | Assessment |
|-----------|------------|
| **Close likelihood** | HIGH. Practical decision-makers, often cash buyers, clear needs. |
| **Decision clarity** | HIGH. Standard use cases (equipment storage, feed, workshop). Simple requirements. |
| **Delivery feasibility** | HIGH. Large properties, easy access, rarely space-constrained. |
| **Permit complexity** | LOW. Rural zoning typically more permissive. |
| **Price sensitivity** | MODERATE. Value-focused but not extreme bargain hunters. |
| **Modification needs** | LOW. Usually want standard containers. |
| **Competition** | LOWER. Less served by sophisticated marketing than construction/commercial. |

### Why Not Others

| Segment | Reason for Demotion |
|---------|---------------------|
| Construction | May have established vendor relationships. Transactional but commoditized. |
| Small Business | Too varied, harder to create focused content. |
| Residential | High tire-kicker rate. Permit anxiety. Smaller deal sizes. |
| Retail/Commercial | Modification-heavy, longer sales cycle, more complexity. |
| Institutional | Procurement complexity, slow decisions. |

### Expansion Path

Phase 2: Construction (clear needs, higher volume)
Phase 3: Small business / Residential (with modified content)

---

## Decision 3: Calculator Scope and Guardrails

### What the Calculator WILL Do

- Accept use case inputs (what are you storing, how much)
- Output size recommendation (20ft, 40ft, 40ft HC)
- Show dimensions and approximate capacity
- Provide visual reference (what fits inside)

### What the Calculator WILL NOT Do

- Display prices or price ranges
- Estimate total cost
- Show availability
- Promise delivery timelines

### Rationale for No Pricing

1. **Prices vary** by market, condition, time, and availability
2. **Price anchoring** creates bad leads who fixate on a number we can't guarantee
3. **Price shoppers** are lower-quality leads
4. **Pricing frameworks** (in content) are sufficient; calculators imply precision we don't have

### Post-Calculator Flow

```
Calculator Complete
    ↓
"Based on your needs, a [SIZE] container is likely the right fit."
    ↓
"Ready to get a quote for a [SIZE]?" [CTA]
    ↓
OR
"Want to learn more about [SIZE] containers first?" [Link to hub]
```

### Filtering Mechanism

- Calculator users who proceed to quote: Qualified, ready
- Calculator users who exit: May return later, captured in analytics
- Calculator users who want price first: Content explains pricing factors, frames expectations, does NOT give numbers

---

## Decision 4: Attribution Under Seller Non-Compliance

### Fallback Signal Hierarchy

**Tier 1: No Seller Input Required (Always Available)**

| Signal | What It Tells Us |
|--------|------------------|
| Quote request volume | Demand level |
| Lead score distribution | Lead quality proxy |
| Quote page conversion rate | Form effectiveness |
| Pages visited before quote | Content effectiveness |
| Time to quote request | Decision cycle length |
| Return visits before conversion | Research depth |

**Tier 2: Minimal Seller Input (Low Burden)**

| Signal | What It Tells Us |
|--------|------------------|
| "Was lead contactable?" (Y/N) | Data quality |
| "Was lead qualified?" (Y/N) | Lead quality validation |

Ask weekly via simple form: "Of last week's leads, how many were worth pursuing?"

**Tier 3: Periodic Aggregate (Monthly)**

| Signal | What It Tells Us |
|--------|------------------|
| "Approximately how many leads closed this month?" | Revenue proxy |
| "Approximate revenue from site leads?" | ROI estimate |

Does not require per-lead tracking. Estimate is sufficient for directional decisions.

### Content Quality Signals (No Seller Needed)

| Signal | Indicates |
|--------|-----------|
| Hub engagement depth (scroll >70%) | Content is useful |
| Multi-hub sessions | Decision progression working |
| Calculator completion rate | Tool is useful |
| Quote form abandonment rate | Form friction |
| Return visit rate | Site is memorable/trusted |

### Attribution Integrity Protection

1. **Track what we control precisely.** Don't depend on seller for operational metrics.
2. **Simplify seller asks.** Binary or aggregate questions, not per-lead diaries.
3. **Build value first.** Show seller the data WE can provide, earn cooperation.
4. **Accept uncertainty.** Directional data beats no data. Precision comes with trust.

### Minimum Viable Attribution

If seller provides NOTHING:
- We can still measure: traffic → engagement → quote requests
- We can still score leads and track score distribution over time
- We can still identify best-performing content by conversion contribution
- We CANNOT measure true ROI—but we can show leading indicators

---

## Decision 5: MVP Scope Cap

### Hard Boundaries

| Dimension | Limit | Rationale |
|-----------|-------|-----------|
| **Total pages** | 8 maximum | Prevents content sprawl |
| **Segment** | Agricultural/Rural only | Depth before breadth |
| **Use cases** | Farm storage, equipment storage only | Focused messaging |
| **Geography** | Seller's actual service area only | No fake locality |
| **Decisions covered** | 5 core decisions only | Per Decision 1 |
| **Tools** | Size calculator only | Per Decision 3 |

### MVP Page List (8 Pages)

1. **Homepage** - Decision router
2. **Size Guide** - D1 resolution
3. **Size Calculator** - D1 tool
4. **Condition Guide** - D2 resolution
5. **Delivery Guide** - D3 resolution
6. **Pricing Factors** - D4 framework (not prices)
7. **Permits Overview** - D5 reassurance
8. **Quote Page** - Conversion

### Explicitly Excluded from V1

| Excluded | Why |
|----------|-----|
| Modifications content | Sales-stage, not pre-quote |
| Retail/commercial use cases | Different segment |
| Residential use cases | Different segment, higher tire-kicker rate |
| Construction use cases | Phase 2 |
| Multiple location pages | No fake locality |
| Blog/article section | Not decision-critical |
| FAQ page | Integrate into hubs instead |
| About page | Can add in Phase 2 |

### Expansion Criteria

**Do NOT expand until:**

1. Quote volume exceeds seller's comfortable handling capacity (problem of success)
2. Conversion rate (quote page visits → submissions) stabilizes for 30+ days
3. Clear hypothesis exists for new content with measurable prediction
4. Seller confirms leads are qualified (Tier 2 signal)

**Expansion sequence:**

| Phase | Trigger | Addition |
|-------|---------|----------|
| 2 | Quote capacity exceeded | Construction use case content |
| 3 | Conversion stable + segment validated | Small business OR residential |
| 4 | Revenue attribution confirmed | Deeper content, more tools |

### Scope Creep Prevention

- Every new page requires written justification
- No "while we're at it" additions
- SEO opportunities are noted but not pursued unless they pass expansion criteria
- Content requests go to a backlog, not immediate production

---

## Summary of Binding Decisions

| # | Decision | Commitment |
|---|----------|------------|
| 1 | 5 core decisions | Size, Condition, Delivery, Price Expectations, Permits |
| 2 | Primary segment | Agricultural/Rural |
| 3 | Calculator scope | Size only, no pricing |
| 4 | Attribution fallbacks | Tier 1-3 hierarchy, protect integrity without seller |
| 5 | MVP scope | 8 pages max, strict expansion criteria |

