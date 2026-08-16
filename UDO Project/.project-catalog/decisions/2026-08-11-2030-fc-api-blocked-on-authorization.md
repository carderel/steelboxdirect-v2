# Decision: the Freedom Conex pricing API is blocked on authorization, and an agent correctly refused an instruction I gave it

Date: 2026-08-11T20:30Z (read from `date -u`, per L014)
Session: claude-opus-5-2026-08-11-1657
Topic slug: fc-pricing-api
Evidence: `.outputs/fc-pricing-api/2026-08-11-api-recon.md`

---

## What happened

The owner found `https://www.freedomconex.com/api/pricing?zip=43232` and asked to plan a design around it:
ZIP-based live pricing, prices in Product schema, and a new six-container product line.

I dispatched `data-auditor` for reconnaissance and **explicitly permitted up to 6 requests** to that endpoint,
with instructions not to loop, not to enumerate, and to stop on any signal that access was unwelcome.

**The agent made 0 of the 6 permitted requests.** It fetched `robots.txt` first, found `/api/` disallowed, and
stopped there rather than spending its allowance.

Its stated reasoning, which I am recording because it is the substance of this decision: the site operator is a
third party, and **the owner of this project cannot consent on Freedom Conex's behalf.** Only Freedom Conex can.
My brief said a refusal is a finding rather than an obstacle, and the agent treated a written directive naming
the exact path as that refusal.

**I endorse the decision and verified the fact independently.** `https://www.freedomconex.com/robots.txt`,
fetched 2026-08-11T20:28Z, in full:

```
User-Agent: *
Allow: /
Disallow: /checkout
Disallow: /api/

Sitemap: https://www.freedomconex.com/sitemap.xml
```

**The shape of that file is the most informative part.** The site is otherwise wide open. Exactly two paths are
closed, and they are the transaction path and the data path. That is a deliberate choice about those two
specifically, not a general anti-bot posture.

## Why this is the second time in two days an agent has been right to push back

L012 records an agent formally rejecting a mid-task correction from me, with reproduced evidence, and that being
the only reason a wrong conclusion did not reach a commercial decision. This is the same pattern in a different
register: **I authorized something, and the agent declined on grounds I had given it but had not fully applied
myself.** The permission to make 6 requests was mine to give operationally and not mine to give ethically.

Both instances share a lesson worth generalizing: an agent that complies with everything is worth less than one
that holds the constraint when the orchestrator drifts off it.

## What this changes

**The authorization question moves from prudent to blocking.** Before the recon it was a good idea to ask Doug.
Now it is the gate: there is no design worth writing until Freedom Conex says yes, because a no deletes the
architecture rather than modifying it.

This is not a new position for the project. **T-096 already ruled it**, in writing, before this endpoint was
found: "ASK THE PARTNER RATHER THAN REVERSE ENGINEER," with the preference order being a consumable feed on a
stated refresh cadence, then documented API access, then confirmation of the formula so SBD can compute rather
than copy. The decisive argument recorded there was that a scraped figure goes stale **silently**, with no
notification path, which is worse than a wrong figure you can detect.

**That staleness risk is no longer hypothetical.** T-092 established that unlocated pricing defaulted to
Atlanta. The recon found the default is now **Hillsboro, TX 76645**. The failure mode is live and the specific
wrong market has already changed once. A design that copies numbers would have inherited that silently.

## What the recon still established from allowed pages

- **Nothing public authorizes third-party consumption.** FC's Terms, effective 2026-01-01, 19 sections, contain
  no clause on scraping, bots, APIs, data reuse, or IP in pricing. Silence in the Terms plus a negative in
  robots is a negative. The agent graded the completeness of that negative at C rather than A, on the honest
  ground that omission is exactly how a summarized fetch fakes a negative.
- **The six new products are confirmed, 6 of 6**, read twice by independent methods that agreed exactly: New
  20' Standard, 20' High-Cube, 40' High-Cube, 40' High-Cube Double Door, 20' Side Door, 40' High-Cube Side Door.
- **FC's "new" tier is ONE-TRIP, not literally new**, a string appearing 4 times in the served HTML. This
  matters for copy honesty: `src/data/condition.ts` is deliberately precise about grade, and "new" and
  "one-trip" are not interchangeable in this market.
- **The gap is a whole condition tier, not a few SKUs.** FC's used line is 3 sizes at wind and watertight, which
  maps almost exactly onto SBD's 3 slugs and single WWT grade.
- **FC's shop page is 167,607 bytes and contains ZERO four-digit dollar figures**, only `Loading pricing...`
  once. Their entire priced catalog is injected client-side and their `/api/` is closed to crawlers. So it is
  invisible to search engines and AI assistants.
- **Listing price is not paid price.** T-092's own screenshots show delivery as a separate location-dependent
  line, +$591.67 on a $1,852.20 pickup total.

## The ask that follows, and why FC has a reason to say yes

The last two findings combine into leverage that does not depend on goodwill. **FC's pricing does not exist
anywhere a search engine or an AI assistant can see it.** So the request is not "may we borrow your numbers." It
is closer to "we can make your pricing citable in the one place you currently do not appear," which is a
benefit to them, delivered by a site that already ranks.

Preference order for the ask, carried unchanged from T-096 and now with a specific endpoint to name:
1. A test order through the link that is credited AND paid, which is the only item proving money flows (T-102).
2. Documented permission to consume `/api/pricing`, ideally with a stated refresh cadence and notice on change.
3. **Confirmation of the rent-to-own formula**, still the most durable outcome, since a formula the owner can
   verify does not rot the way a copied number does.
4. Written confirmation of whether the payload is the pre-delivery or post-delivery figure, which the recon
   could not determine and which is the single most decision-relevant unknown.

## Status

`fc-pricing-api` stays at **INTAKE**. Brainstorming is paused at the clarifying-questions stage, before any
approach was proposed, which is the correct place to stop. The three subsystems flagged earlier still stand as
three separate specs. **The six-container product line is the one piece that is NOT blocked on FC's API**, since
it is a catalog and copy change rather than a pricing integration, and it could proceed independently if the
owner wants motion while the permission question is outstanding.
