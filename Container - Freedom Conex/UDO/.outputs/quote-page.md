# Quote Page: Request a Container Quote

**Purpose:** Conversion | **Word count:** ~200 + form spec | **Target:** Decision-ready buyers

---

## Page Header

### Get a Quote for Container Delivery

Tell us what you need and where it's going. We'll respond with pricing and availability.

**Service Area:** We deliver within approximately 250 miles of Cincinnati, Ohio—covering Ohio, Indiana, Kentucky, and parts of surrounding states.

---

## Before You Submit

For the most accurate quote, it helps to know:

- **Size:** 20-foot, 40-foot, or 40-foot High Cube
- **Condition:** New, Cargo Worthy, or Wind & Water Tight
- **Delivery location:** ZIP code and basic site conditions
- **Timeline:** When you need it

Not sure about size? **[Use our Size Calculator →]**

---

## Quote Request Form

### Section 1: What You Need

| Field | Type | Required | Options/Notes |
|-------|------|----------|---------------|
| Container Size | Select | Yes | 20-foot / 40-foot / 40-foot High Cube / Not sure |
| Condition Preference | Select | Yes | New (One-Trip) / Cargo Worthy / Wind & Water Tight / Not sure |
| Primary Use | Select | Yes | Farm/Equipment Storage / Workshop/Workspace / General Storage / Other |
| Use Description | Text (short) | No | "Briefly describe what you'll store or use it for" |

### Section 2: Delivery Details

| Field | Type | Required | Options/Notes |
|-------|------|----------|---------------|
| Delivery ZIP Code | Text | Yes | 5-digit ZIP |
| Property Type | Select | Yes | Farm/Agricultural / Rural Residential / Suburban / Commercial |
| Site Access | Select | Yes | Easy (wide driveway, firm ground) / Moderate (some constraints) / Difficult (tight or soft) / Not sure |
| Placement Notes | Text (short) | No | "Any access concerns or special requirements?" |

### Section 3: Timeline

| Field | Type | Required | Options/Notes |
|-------|------|----------|---------------|
| Timeline | Select | Yes | ASAP (within 2 weeks) / 1-3 months / 3-6 months / Just researching |

### Section 4: Contact Information

| Field | Type | Required | Options/Notes |
|-------|------|----------|---------------|
| Name | Text | Yes | |
| Email | Email | Yes | |
| Phone | Phone | Yes | |
| Best Time to Call | Select | No | Morning / Afternoon / Evening / No preference |

### Section 5: Additional Information

| Field | Type | Required | Options/Notes |
|-------|------|----------|---------------|
| Additional Notes | Textarea | No | "Anything else we should know?" |

---

## Lead Scoring Logic (Backend)

**Score each submission to prioritize follow-up:**

| Factor | Points |
|--------|--------|
| Specific size selected (not "Not sure") | +10 |
| Specific condition selected (not "Not sure") | +10 |
| Use: Farm/Equipment Storage | +15 |
| Use: Workshop/Workspace | +10 |
| Use: General Storage | +5 |
| Property: Farm/Agricultural | +10 |
| Property: Rural Residential | +5 |
| Timeline: ASAP | +20 |
| Timeline: 1-3 months | +15 |
| Timeline: 3-6 months | +10 |
| Timeline: Just researching | +3 |
| Site access: Easy | +5 |
| Filled additional notes | +5 |

**Thresholds:**
- **50+ points:** Priority lead (respond within hours)
- **30-49 points:** Standard lead (respond within 1 business day)
- **Under 30 points:** Lower priority (still respond, but after higher-scoring leads)

---

## Form Submission Flow

### On Submit:

1. Validate all required fields
2. Calculate lead score
3. Capture:
   - All form data
   - Timestamp
   - Referring page (which decision hub or calculator)
   - Session data (pages visited before submission)
4. Send to CRM/lead inbox with full context
5. Display confirmation message

### Confirmation Message:

> **Thanks for your request.**
>
> We've received your information and will respond within one business day with pricing and availability for your area.
>
> **What happens next:**
> 1. We'll review your requirements
> 2. We'll check current inventory and delivery options
> 3. You'll receive a quote by email or phone (your preference)
>
> Questions? Reply to the confirmation email or call us directly.

---

## Trust Elements (Below Form)

### Why Request a Quote Here?

- **Accurate pricing:** We quote based on your actual location and current availability
- **No obligation:** A quote is just information—no pressure
- **Fast response:** Most quotes within one business day
- **Clear terms:** You'll know exactly what's included

### About This Site

This site is operated independently to help container buyers make informed decisions. Quotes are fulfilled by authorized Freedom Conex contractors serving your area.

---

## Data Captured for Attribution (Tier 1)

Every submission automatically includes:

| Data Point | Purpose |
|------------|---------|
| Timestamp | Response time tracking |
| Referring page | Content effectiveness |
| Pages visited | Decision journey mapping |
| Lead score | Quality assessment |
| Form completion time | Engagement signal |
| ZIP code | Service area validation |

This data is available regardless of seller reporting.

---

## Notes for Development

- Form should feel simple despite capturing significant data
- Mobile: Stack all fields vertically, large touch targets
- Pre-fill size if arriving from calculator
- Pre-fill use case if arriving from use-case page (future)
- No CAPTCHA visible; use honeypot field for spam
- Seller-agnostic language throughout
- Confirmation should set clear expectations
