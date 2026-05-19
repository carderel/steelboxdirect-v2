# Size Calculator: Interactive Tool Specification

**Purpose:** Help users determine the right container size based on their storage needs
**Constraint:** Size recommendation only—NO pricing

---

## Calculator Flow

### Step 1: What Are You Storing?

**Question:** "What will you primarily store in the container?"

| Option | Display Text | Internal Value |
|--------|--------------|----------------|
| A | Farm equipment (tractors, implements, ATVs) | farm_equipment |
| B | Vehicles (cars, trucks, trailers) | vehicles |
| C | Materials and supplies (feed, hay, building materials) | materials |
| D | Tools and workshop items | workshop |
| E | General storage (household, seasonal, mixed) | general |
| F | Other / Multiple types | other |

**Logic:** Selection determines follow-up questions and baseline recommendation.

---

### Step 2: Size/Quantity Questions (Conditional)

**If farm_equipment:**

"How many large pieces of equipment?"
- 1 piece (tractor, combine, etc.)
- 2-3 pieces
- 4+ pieces

"Do you need space to work inside, or just storage?"
- Storage only
- Some workspace
- Dedicated workshop area

---

**If vehicles:**

"How many vehicles?"
- 1 vehicle
- 2 vehicles
- 3+ vehicles

"What size vehicles?"
- Compact/mid-size cars
- Full-size trucks/SUVs
- Mix of sizes

---

**If materials:**

"Approximately how much material?"
- A few pallets worth
- 10-20 pallets
- 20+ pallets or bulk storage

"Will you stack materials?"
- Yes, stacking is fine
- Prefer single-level storage

---

**If workshop:**

"Primary use?"
- Tool storage only
- Workspace with some tools
- Full workshop (bench, equipment, storage)

"Will you stand and work inside regularly?"
- Yes, frequently
- Occasionally
- Rarely (mostly storage)

---

**If general or other:**

"How much stuff, roughly?"
- A garage-worth or less
- More than a single-car garage
- Two-car garage or more

---

### Step 3: Additional Factors

**Question:** "Any of these apply?"

| Option | Impact |
|--------|--------|
| "I need extra headroom (tall equipment or standing workspace)" | Suggests High Cube |
| "I might expand storage later" | Suggests larger size |
| "Space on my property is limited" | Notes 20' as easier to place |
| "I want to keep costs lower" | Notes 20' is more economical |

(Allow multiple selections or none)

---

## Recommendation Logic

### Decision Matrix

| Primary Use | Quantity/Scale | Workspace Need | Recommendation |
|-------------|---------------|----------------|----------------|
| farm_equipment | 1 piece | Storage only | 20' or 40' depending on implement size |
| farm_equipment | 1 piece | Some workspace | 40' |
| farm_equipment | 2+ pieces | Any | 40' |
| farm_equipment | Any | Workshop | 40' HC |
| vehicles | 1 | - | 20' |
| vehicles | 2+ | - | 40' |
| materials | Few pallets | - | 20' |
| materials | 10+ pallets | - | 40' |
| workshop | Tool storage | - | 20' |
| workshop | Full workshop | Standing work | 40' HC |
| general | Garage or less | - | 20' |
| general | More than garage | - | 40' |

### Modifier Rules

- If "extra headroom" selected → upgrade to High Cube variant
- If "might expand" selected → suggest next size up
- If "space limited" + recommendation is 40' → note that 20' is an option with trade-offs

---

## Results Display

### Recommendation Format

```
Based on your needs:

[RECOMMENDED SIZE]
40-Foot Container

Why this size:
• [Reason 1 based on inputs]
• [Reason 2 based on inputs]
• [Reason 3 if applicable]

Dimensions:
• Exterior: 40' × 8' × 8'6"
• Interior floor: ~320 sq ft
• Interior height: 7'10"

[If High Cube recommended, show those dimensions instead]
```

### Alternative Consideration (When Applicable)

```
Also worth considering:

[ALTERNATIVE SIZE]
20-Foot Container

Why you might choose this:
• Lower cost
• Easier to place
• Sufficient if [condition]

Trade-off: Less space for [specific use case detail]
```

---

## Post-Result Actions

### Primary CTA

```
Ready to get a quote for a [SIZE]?

[Request a Quote →]
```

- Pre-fill the quote form with recommended size
- Pass calculator completion as attribution data

### Secondary CTA

```
Want to learn more first?

[Read the full Size Guide →]
```

### Tertiary Option

```
[Email me these results]

(Captures email, sends summary, enables follow-up)
```

---

## What the Calculator Does NOT Do

| Excluded | Reason |
|----------|--------|
| Show prices | Creates false anchoring, prices vary |
| Show availability | We don't know real-time inventory |
| Guarantee fit | This is guidance, not engineering |
| Recommend condition | Separate decision (Condition Guide) |

---

## Technical Notes

### Data Captured (For Attribution)

- All inputs selected
- Final recommendation
- Alternative shown (if any)
- Time to complete
- CTA clicked (quote, guide, email, exit)

### Mobile Behavior

- One question per screen
- Large touch targets
- Progress indicator
- Back button to revise answers

### Accessibility

- All inputs keyboard navigable
- Clear focus states
- Screen reader compatible labels
- No time limits

---

## Sample User Journey

1. User selects: "Farm equipment"
2. User selects: "2-3 pieces" + "Some workspace"
3. User selects: "I need extra headroom"
4. Calculator recommends: **40-Foot High Cube**
5. Shows dimensions, reasoning
6. Shows alternative: 40' standard (if headroom isn't critical)
7. User clicks "Request a Quote"
8. Quote form opens with "40-Foot High Cube" pre-selected

---

## Development Notes

- Keep logic simple and maintainable
- Test edge cases (multiple modifiers, contradictory inputs)
- Ensure mobile experience is smooth
- Track completion rate as success metric
- A/B test CTA placement if traffic supports it
