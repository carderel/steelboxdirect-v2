# Terms & Conditions — Rent-to-Own Draft Language (OWNER-REVIEW DRAFT)

> **STATUS: CONTENT DRAFT FOR OWNER / ATTORNEY REVIEW ONLY.**
> This document is drafting-support material prepared by a content assistant. It is **not legal advice**, has **not** been reviewed by an attorney, and is **NOT wired into the site** — `src/pages/terms.astro` and `src/pages/privacy.astro` are untouched. Nothing below ships until the owner (and ideally the attorney who reviews the Freedom Conex terms) signs off.
>
> Source of program facts: owner-locked spec `docs/superpowers/specs/2026-07-30-rent-to-own-page-design.md` and decision `.project-catalog/decisions/2026-07-30-rent-to-own-pivot.md`. Only owner-approved facts are used: RTO offered through Freedom Conex's program; administered by My Container Rental (independent third party; portal.mycontainerrental.com); no *traditional* credit check; terms of 12/24/36/48 months; delivery contingent on MCR approval; Lifetime Leak Warranty applies; "about two weeks" hedged delivery wording.

---

## 1. What in the CURRENT terms conflicts with rent-to-own

The live `/terms/` page (effective January 1, 2026, last updated June 25, 2026) was written for a **paid-in-full purchase model with Afterpay as the only installment exception**. Five places conflict with, or are silent in a way that undermines, a rent-to-own transaction:

### 1a. Payment Terms — the paid-in-full clause (PRIMARY CONFLICT)

**Section: "Payment Terms," first bullet** (`src/pages/terms.astro`, line 37):

> "The balance due must be paid in full prior to scheduling delivery or fulfillment of the order, unless you have been approved for Afterpay installment financing."

A rent-to-own customer, by definition, does **not** pay the balance in full before delivery. As written, this sentence makes every RTO delivery a breach of the site's own terms. It needs an RTO carve-out (proposed language in §2 below).

### 1b. General — retention-of-title / repossession clause

**Section: "General," fourth bullet** (line 27):

> "The Customer expressly agrees that the equipment listed in any Invoice remains the property of the Company until payment is made in full. Failure to pay and settle all debts may result in repossession of the equipment and recovery of any unrecovered debts…"

For an outright sale this is a simple retention-of-title clause. For RTO, title/ownership mechanics and any repossession-on-default rights belong to the **separate rent-to-own agreement** administered by My Container Rental — this bullet must be scoped to outright purchases, or it will collide with (or purport to duplicate) whatever the RTO agreement says. **Attorney question:** which document's repossession/default language controls (see Open Questions).

### 1c. General — no-transfer-before-payment clause

**Section: "General," fifth bullet** (line 28):

> "The Customer shall not sell, transfer, or assign ownership of any equipment until payment has been made in full to the Company."

Same interaction as 1b: correct for outright sales; for RTO, the restriction period and its end condition are defined by the executed RTO agreement, not by "payment in full to the Company" as this page defines it.

### 1d. Returns / Rejections / Cancellations — "all sales are final" trigger list

**Section: "Returns / Rejections / Cancellations," first bullet** (line 101):

> "By signing the Afterpay application, accepting delivery, or submitting payment for an Invoice, the Customer acknowledges and agrees that all sales are final."

The trigger list names Afterpay but not the RTO agreement, and "all sales are final" doesn't cleanly describe a transaction where ownership hasn't transferred yet. Also the fourth bullet (line 104) ties the 10% cancellation fee to "after an Afterpay contract has been signed and delivery scheduled" — silent on cancellation after an RTO agreement is executed. Needs attorney direction rather than invented language (see Open Questions).

### 1e. Acceptance — contract-formation clause

**Section: "Acceptance"** (line 166):

> "Any Invoice may be accepted to form a binding contract upon either (a) signature and/or payment for the items listed in the Invoice prior to the expiration date, or (b) issuance of a purchase order referencing an Invoice prior to the expiration date."

An RTO deal is formed by executing the **separate rent-to-own agreement**, not by paying an Invoice. The intro paragraph (lines 14–19, "…marked by the remission of payment or a signed agreement for the equipment invoiced. By purchasing, you agree to these terms.") partially covers a "signed agreement" path, but neither passage says which document governs when both exist.

**Not in conflict (confirm, don't change):** the Lifetime Leak Warranty section applies to RTO units per the owner-locked facts — no edit needed beyond, optionally, an explicit sentence in the new RTO section (included below).

---

## 2. Proposed replacement / additional language (draft, in the existing terms voice)

All text below keeps the current hybrid-branding structure: **Freedom Conex LLC = "Company" (contracting entity)**, **Steel Box Direct = authorized independent agent**. New defined term proposed: **"Program Administrator" = My Container Rental**.

### 2a. Amended Payment Terms bullet (replaces line 37)

> The balance due must be paid in full prior to scheduling delivery or fulfillment of the order, unless you have been approved for Afterpay installment financing or you have entered into a rent-to-own agreement under the Company's rent-to-own program (see "Rent-to-Own Program" below). This paid-in-full requirement applies to outright purchases only; payment terms for rent-to-own transactions are set by the executed rent-to-own agreement.

### 2b. Amended General bullets (scope lines 27–28 to outright purchases)

Fourth bullet — prepend a scoping phrase:

> For outright purchases, the Customer expressly agrees that the equipment listed in any Invoice remains the property of the Company until payment is made in full. Failure to pay and settle all debts may result in repossession of the equipment and recovery of any unrecovered debts, and does not relieve the Customer from liability for costs incurred while settling such debts, including legal fees and court costs at the Company's expense. For rent-to-own transactions, ownership, retention of title, and remedies on non-payment are governed by the executed rent-to-own agreement.

Fifth bullet — same treatment:

> The Customer shall not sell, transfer, or assign ownership of any equipment until payment has been made in full to the Company (for outright purchases) or until ownership has transferred to the Customer under the terms of the executed rent-to-own agreement (for rent-to-own transactions).

### 2c. NEW section — "Rent-to-Own Program" (proposed placement: immediately after "Payment Terms")

> ## Rent-to-Own Program
>
> - The Company offers a rent-to-own option on select containers. The program is administered by My Container Rental (the "Program Administrator"), an independent third party.
> - Rent-to-own transactions are executed under a **separate rent-to-own agreement** between the Customer and the Company's rent-to-own program as administered by the Program Administrator. That agreement — not this page — governs the payment schedule, term length (12, 24, 36, or 48 months), fees, and the conditions under which ownership transfers to the Customer.
> - Steel Box Direct, as authorized independent agent, facilitates quotes and communicates the Customer's rent-to-own intent to the Company. Steel Box Direct is not a party to the rent-to-own agreement and does not make approval decisions.
> - Rent-to-own applications do not involve a traditional credit check; however, **approval is not guaranteed**. The approval decision is made solely by the Program Administrator, independently of the Company and of Steel Box Direct.
> - **Delivery of a rent-to-own unit is contingent on the Customer's application being approved by the Program Administrator.** Delivery is scheduled only after approval; once approved, almost all deliveries take about two weeks, and the Customer will be given an honest delivery window before committing.
> - Ownership of the equipment does not transfer to the Customer until the terms of the executed rent-to-own agreement have been met. Until that time, the Customer's rights and obligations regarding the equipment — including use, payment, and what happens on non-payment or cancellation — are governed by the executed rent-to-own agreement.
> - The Lifetime Leak Warranty described in these terms applies to rent-to-own units.
> - **Rent-to-own is not the same as Afterpay.** Afterpay is a third-party installment financing option for outright purchases, under which the sale completes and these purchase terms apply in full. Rent-to-own is a separate program under a separate agreement.
> - In the event of any conflict between these terms and an executed rent-to-own agreement with respect to payment, ownership, or default, the executed rent-to-own agreement controls as to that rent-to-own transaction. *(Attorney to confirm this precedence rule — see Open Questions.)*

### 2d. Amended Returns / Rejections / Cancellations first bullet (line 101) — trigger list

> …By signing the Afterpay application, executing a rent-to-own agreement, accepting delivery, or submitting payment for an Invoice, the Customer acknowledges and agrees that all sales are final.

*(Flag: "all sales are final" may need attorney rewording for RTO, where the transaction is not yet a completed sale — see Open Questions. Drafted minimally here to avoid inventing return/buyback rights.)*

### 2e. Amended Acceptance section (line 166) — add an RTO formation path

> Any Invoice may be accepted to form a binding contract upon either (a) signature and/or payment for the items listed in the Invoice prior to the expiration date, or (b) issuance of a purchase order referencing an Invoice prior to the expiration date. For rent-to-own transactions, the binding agreement for the equipment is the executed rent-to-own agreement administered by the Program Administrator; these terms continue to apply to matters the rent-to-own agreement does not address, including delivery, site readiness, storage, and warranty.

---

## 3. DO NOT IMPORT — MCR national-site claims (confirm with FC/MCR first)

My Container Rental's own national marketing states several program features that are **NOT owner-approved for SBD** and must not appear in any SBD terms or marketing document until Freedom Conex / MCR confirm in writing that they apply to this program:

- **20% down** (any down-payment amount or percentage)
- **Early-payoff discounts** (e.g., the 90-day / 33% figures on MCR's site)
- **"No interest" / interest-free framing**
- **"Instant approval"**

If the attorney or owner wants any of these in the terms, get the exact figures and conditions from FC/MCR directly — do not source them from mycontainerrental.com.

---

## 4. OPEN QUESTIONS for owner / attorney

1. **Governing-law interaction.** These terms are governed by Texas law with exclusive Texas venue, plus a binding-arbitration clause (AAA Commercial Rules). What law and dispute process does the MCR rent-to-own agreement specify, and how do the two documents interact when a dispute touches both (e.g., a delivery-damage claim on an RTO unit)? Should the RTO section's precedence sentence (2c, last bullet) be broader or narrower?
2. **Early-payoff / buyout mechanics.** Can an RTO customer buy out early, and on what terms? FC's and MCR's pages suggest early-payoff options, but nothing is confirmed for this program. Until confirmed, the draft (and the marketing page) stay silent. If confirmed, does buyout language belong in these terms at all, or only in the MCR agreement?
3. **Repossession / default language.** The General section's repossession clause was drafted for unpaid invoices. For RTO default, who repossesses (FC, MCR, or the program), under which document, and with what notice? Rent-to-own transactions are consumer-regulated in many states (rental-purchase statutes with specific disclosure and reinstatement rights) — the attorney should confirm the MCR agreement carries the required disclosures for the states SBD sells into (OH/IN/KY currently), and that this page doesn't contradict them.
4. **90-day protection policy.** Freedom Conex's site mentions a 90-day protection/guarantee in some contexts, and the prior terms adoption deliberately **excluded** the 90-day Satisfaction Guarantee because it excludes WWT units. Does any 90-day policy on FC's RTO page apply to SBD's WWT rent-to-own units? If yes, it needs its own confirmed language; if no, confirm it stays omitted.
5. **Afterpay vs. RTO distinction wording.** The draft states plainly that Afterpay (installment financing on a completed sale) is not rent-to-own (2c). Is this the framing FC wants, and should the Afterpay bullet in Payment Terms also cross-reference the RTO section so a skimming customer can't conflate the two?
6. **Cancellation fees after RTO execution.** The 10% cancellation fee is currently triggered by "delivery has been scheduled (or after an Afterpay contract has been signed and delivery scheduled)." Does the same fee apply if a customer cancels after executing the RTO agreement but before delivery — or does the MCR agreement's own cancellation regime apply instead? Drafted as an open question rather than invented.
7. **"All sales are final" phrasing for RTO.** Since an RTO transaction is not a completed sale at delivery, does the attorney want a parallel phrase (e.g., "all deliveries under an executed rent-to-own agreement are final") instead of extending "all sales are final" to RTO (2d)?
8. **Who receives RTO payments.** These terms name Freedom Conex LLC as the payee for invoices; the RTO agreement is administered by MCR (portal.mycontainerrental.com). Confirm which entity the customer actually pays month-to-month, and whether the Payment Terms bullets about payment methods, NSF fees, and >$10,000 rules apply to RTO payments at all.

---

*Prepared 2026-07-30 on branch `feat/rent-to-own`. Deliverable of Task 4, `docs/superpowers/plans/2026-07-30-rent-to-own.md`. Quotes above are verbatim from `src/pages/terms.astro` as of branch HEAD b0a84a7 (file unmodified on this branch).*
