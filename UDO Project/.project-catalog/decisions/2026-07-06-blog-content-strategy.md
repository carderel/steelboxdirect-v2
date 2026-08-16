# Decision — Blog Content Strategy (2026-07-06)

**Context:** Owner wants a blog to publish 1+/week and repurpose ("dribble") to socials, covering top keywords. Blue-sky research fleet (5 researchers) → synthesis at `.outputs/content/2026-07-06-blog-content-strategy-blue-sky.md` (111-item backlog, 2+ yr runway). Owner converged.

## Locked decisions
1. **Model confirmed** — 6 SEO pillars ↔ 6 visible categories (Buyer's Guides & How-To; Comparisons & Alternatives; Use-Case Spotlights; Customer Stories & Project Spotlights; Local & Seasonal; Container Specs & Reference). Each post = 1 visible category + 1 pillar tag.
2. **Short-story/scenario format APPROVED** — composite/illustrative only: NO invented named customers, NO fake quotes/reviews; each piece carries an "illustrative scenario" disclosure + a "Facts in this story" box of real, defensible claims. (Honors WWT-only / no-$ / no-delivery-promise / permit=buyer.)
3. **Net-new personas greenlit (all 5):** classic-car/motorcycle collectors (honesty/condensation angle), honest she-shed/man-cave, hunters/deer-camp, nonprofits/food banks, disaster-relief orgs. **Cannabis (OH-only): IN RESERVE** — kept in backlog, not led with (legal-sensitive).
4. **Cadence:** 1/week via quarterly batch-sprints, ~50/30/20 evergreen/seasonal/local — CONFIRMED as default, but owner wants a dedicated discussion (open).
5. **Social platforms:** Facebook, Google Business Profile, Instagram, LinkedIn, Nextdoor. **Video + Pinterest DEFERRED.**
6. **Keyword sizing:** DataForSEO is NOT available. Do our OWN research; owner will use **Google Keyword Planner** (tied to a forthcoming **ads idea**). All backlog priority stays qualitative until owner supplies Keyword Planner data.
7. **Build but DO NOT DEPLOY:** build the `/blog/` system + first 10–13 articles locally; **hold from production** until owner approves the blog **design look & feel**. First batch = the **primary-sourced Specs & Reference** pieces (whitespace + AEO win; reuses `/container-reference/`).

## Guardrails (unchanged)
WWT-only; no dollar amounts; no delivery-time promises; permit=buyer responsibility; honest (no fabricated customers/reviews); cede container modifications/homes (SBD doesn't sell mods).

## Naming — short-narrative ("short story") format (2026-07-06)
- **Internal / systematic (tech-side) name: `White Parable`** — the universal content-type/format tag, kept CONSTANT across verticals/projects. Chosen because a "parable" is understood as an illustrative teaching story → reinforces the composite/illustrative honesty guardrail (never literal customer testimonials). Beats "arc-papers" (opaque) and "Customer Stories" (implies real testimonials).
- **Public-facing category (this container vertical): `Field Stories`** — plain, searchable, honest, fits farm/jobsite/rural audience. REPLACES the planned visible category "Customer Stories & Project Spotlights". Public label is vertical-specific; the internal White Parable format stays constant.
- **Implementation:** blog `format: "White Parable"` on these posts; category enum value "Customer Stories & Project Spotlights" → "Field Stories".
- **Strategy = PILOT first:** write 1-2 White Parables in the launch batch, measure engagement/shares/time-on-page; systematize the template + scale only if they perform.

## Next
- Build `/blog/` infra (content collection + index + post template + category pages + nav + brutalist styling + Article/Breadcrumb schema + sitemap; optional RSS). Un-deployed. Present design for owner look&feel approval.
- Draft first 10–13 primary-sourced articles into the collection (as drafts), review for accuracy/guardrails.
- Discuss cadence with owner. Await owner's ads idea + Keyword Planner data for prioritization.
