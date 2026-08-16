# Decision: all three Freedom Conex exposure items are HELD, no site changes

Date: 2026-08-11T18:00Z (read from `date -u`, per L014)
Session: claude-opus-5-2026-08-11-1657
Decided by: Eli Carder (owner)
Topic slug: fc-relationship
Evidence base: `.outputs/fc-relationship/2026-08-11-fc-relationship-exposure-inventory.md` (324 lines, 55
instances across 17 live files) and `.outputs/fc-relationship/2026-08-11-fc-facts-reverification.md` (59KB,
six questions, Grade A on most)

**Net result: zero source files changed this session. HEAD remains `544077b`. The working tree is byte-identical
to how the session found it, at 105 porcelain entries.**

---

## The three rulings, in the owner's own words

| Item | Owner ruling (verbatim) | Effect |
|---|---|---|
| The 2009 date (T-105 premise) | "This is riding Conex Freedom's coattails so lets leave it" | All 28 instances stay. No edit. |
| The buying-guide passage (T-105) | "Hold the whole passage" | Lines 17, 57, 81 unchanged. |
| The Lifetime Leak warranty (T-110) | "At this point this is still Freedom Conex and so that warranty still lands." | All 10 files unchanged. |

## Interpretation recorded explicitly, because these were short answers to detailed questions

I read ruling 1 as **leave the 2009 date on the site exactly as it is**, and the coattails remark as the
explanation of why it is there rather than as an instruction to change anything. I read ruling 3 as **the
Freedom Conex warranty genuinely does apply to Steel Box Direct's customers, therefore presenting it is
legitimate.** If either reading is wrong, the work to undo is nil, since nothing was changed.

## Two residual risks, stated once and then not re-litigated

These are recorded because a future session will find the audit and wonder why nothing was done. It was not an
oversight. It was decided.

**1. The stated rationale for 2009 no longer holds, which the owner may not have had in front of him.** If the
date rides Freedom Conex's longevity, that longevity is not in evidence: FC's Texas entity was chartered
**2025-10-16**, the NC-linked franchise record starts 2024-01-08, and their own "Established in 2023" appears
only as marketing copy on one page of their site. **So 2009 is now unsupported for both parties rather than
misattributed between them.** It ships on all 53 pages, including an `Est. 2009` badge in the site-wide footer
and fifteen city-page lines pairing it with "Family-owned dealer." The sharpest version: the buying guide tells
readers that a legitimate dealer is "a registered company, a real address, and a track record" that they should
verify, and the same page carries the least verifiable claim on the site.

**2. Ruling 3 answers applicability, and the finding was about the remedy.** Whether the warranty "lands" and
whether our description of it matches its terms are different questions. FC's own wording calls it **limited**,
conditions it on no 90-day claim having been made, and states its sole remedy is a mailed patch that "will need
to be installed by the Customer." Nine of ten files present it in Steel Box Direct's voice as "Lifetime Leak."
Separately, FC's 90-day Satisfaction Guarantee **expressly excludes Wind and Water Tight containers, the only
grade SBD sells**, so that term applies to nothing in the catalog. The site correctly does not claim it, and
should not start.

Neither risk blocks anything. Both are the owner's call and the owner has made it.

## What this closes and what it does not

**Closed as decided:** the question of whether to change site copy about the 2009 date, the buying-guide
passage, or the warranty presentation. Do not re-raise these as findings. If they come up again, they come up as
consequences of a **changed circumstance**, specifically the seller-of-record question moving, not as a repeat
of this audit.

**Not closed, and unaffected by these rulings:**
- **T-106** remains open. The legal-posture gap is unchanged: `terms.astro` asserts both "authorized independent
  agent" (lines 8, 16, 172) and "Parent company" (line 176) on the same page, the exact phrase "authorized
  independent agent" returns **zero** matches across FC's entire site, and FC's Terms name exactly two parties
  under an entire-agreement clause. That still routes to Doug and possibly a lawyer.
- **T-111**, the two unreachable registries (North Carolina SOS, Ohio SOS), both owner-doable in a browser.
- **T-102**, the SBD-specific referral code, which is the question everything else is coupled to.

## Process note worth keeping

The audit produced no site change and was still worth running. It falsified the premise of T-105, corrected the
composition of T-106, found a warranty issue nobody had looked for, closed my own Hillsboro false alarm, and
established that 2009 is unsupported rather than merely misplaced. **An audit whose result is "the owner
decides to leave it" is a successful audit**, provided the decision is recorded with its evidence, which is what
this file is for. The failure mode would have been changing the copy on my own reading of the facts.
