# Checkpoint: 2026-08-10 05:10 UTC, permit rework authorized

Trigger: HS-UDO-002, before risky and destructive operations. Two qualify in this batch: (a) copy edits
across four live site files including three JSON-LD surfaces, (b) deletion of a git-tracked file
(`src/pages/permits/_index.astro.bak`). Checkpoint taken BEFORE any of it.

Supersedes in scope, does not replace: `2026-08-10-0345-container-shelter-pre-edit` (still valid, narrower).
Topic slug: container-shelter
Session transcript: `.project-catalog/history/2026-08-09-2325-session-transcript.md`
LLM: Claude Opus 5, 1M context (claude-opus-5[1m]), Claude Code CLI

## Repository state at checkpoint

- Branch: `main`
- HEAD: `544077b`
- `src/` clean, zero modifications. One pre-existing untracked file:
  `src/content/blog/the-cheap-container-that-wasnt.md` (mtime 2026-07-27, `draft: true`, unrelated).

## Owner authorization received this cycle

1. **Rework scope: ALL 12 hard violations, including the 3 insurance-coverage claims.** This means
   schema-bound lines ARE now in scope (6 of the 12 feed the JSON-LD FAQPage), which resolves the conflict
   recorded in T-019 between the T-015 narrow approval and the avoid-any-conflicts directive.
2. **Businesses page: targeted edits plus add the missing buyer-responsibility disclaimer.** Not a full
   rewrite. It is the only persona page with no disclaimer anywhere in it, which is the structural gap that
   let six violations accumulate there.
3. **Add PROJECT_HS_003** to `UDO Project/HARD_STOPS.md`.
4. **Delete `src/pages/permits/_index.astro.bak`.**
5. **NOT authorized: the build-time guard test (T-025).** Remains pending. Consequence to keep in view:
   prevention now rests on a hard stop that a human or model must read, with no automated gate behind it.

## Files in scope for modification

| File | Hard violations | Notes |
|---|---|---|
| `src/pages/for/businesses/index.astro` | 6 (32, 291, 126, 143, 44, 56) | 32 and 291 are separately hardcoded copies of ONE claim. Both must be named or the page ships contradicting its own schema. Add disclaimer. |
| `src/pages/for/farmers/index.astro` | 4 (33, 37, 122, 166) | 33 and 37 are schema-bound. 122 and 166 already drafted. Borderlines 120, 162 in scope. |
| `src/pages/for/homeowners/index.astro` | 1 (43) | Schema-bound. Borderlines 31, 39. Line 31 renders on three surfaces. |
| `src/data/containers.ts` | 1 (41) | Renders on the 20ft product money page. Borderline 68 contradicts farmers 120 across pages. |
| `src/pages/permits/_index.astro.bak` | 5 (not live) | DELETE, authorized. Tracked in git. |

## Rollback instructions

All four content files are clean at 544077b, so per-file revert fully restores pre-edit state:

```
git checkout -- src/pages/for/businesses/index.astro
git checkout -- src/pages/for/farmers/index.astro
git checkout -- src/pages/for/homeowners/index.astro
git checkout -- src/data/containers.ts
```

To restore the deleted backup file (it is tracked, so it is recoverable):

```
git checkout 544077b -- src/pages/permits/_index.astro.bak
```

If any of it has been committed, revert the specific commit. No other file is in scope.

## What must NOT be touched

- `src/pages/permits/index.astro`. Verified COMPLIANT. It is the model, not a target.
- `farmers:17`, `116`, `117`; `homeowners:27`, `59`, `149`. The compliant disclaimer template. Copy from
  these, do not edit them.
- `farmers:170`. Verified already compliant. It is the T-015 CONVERSION target, a separate workstream.
- `src/data/cities.ts` zoning arrays, `src/data/homeFaq.ts`, `src/lib/schema/howto.ts`, warranty copy in
  `terms.astro`, `src/lib/schema/entities.ts`. All verified clean.
- `src/pages/cost/_index.astro.bak`, `src/pages/delivery/_index.astro.bak`. Tracked, clean on these
  categories, NOT authorized for deletion.
- Any Framework file (HS-UDO-014, HS-UDO-016).

## Publish gates (unchanged, all required, verifier-checked)

1. No permit, zoning, classification, or tax-assessment determination in EITHER direction. No jurisdiction
   named with an outcome. Required: a statement that the determination belongs to the reader's local
   authority and getting it is the reader's job.
2. No structural, load, or mounting claims about containers. Deflect to manufacturer or licensed engineer.
3. No vendor named, no wind/snow/span rating, no price figure, not even attributed. Banned especially from
   headings, meta, alt text, and schema, which strip attribution.
4. No dollar figures.
5. HS-OUT-001 dash-clean, verified one pattern per character (U+2014 and U+2013 separately) per L003.
6. NEW, from this cycle: no insurance-coverage determination. No claim about what a third party's policy
   covers.

## CORRECTION appended 2026-08-10 06:05 UTC: gate 4 was over-scoped

Gate 4 above reads "No dollar figures." That is correct as written for the T-015 container-shelter paragraph,
where it originated, but it is WRONG as a site-wide gate and it was carried into this batch's briefs without
being reconciled against project policy. The content-writer working farmers and homeowners caught it.

The pricing policy of 2026-07-09
(`.project-catalog/decisions/2026-07-09-pricing-display-policy.md`, also summarized in `CLAUDE.md`) AUTHORIZES
average prices on the homepage, product and size pages, and use-case pages, sourced from `src/data/pricing.ts`
and shown with the "average starting price, your quote may be more or less" disclaimer. Prices remain
forbidden on city pages. The homeowners page's existing figures sit inside that authorization, with the
disclaimers already present at lines 123 and 213.

**Corrected gate 4, for this batch and forward:** no NEW dollar figure may be introduced by compliance rework,
and no price may be attached to a permit, classification, tax, insurance, or structural claim. Existing
authorized pricing is not a violation and must not be stripped by a compliance pass. A bare `\$` grep will
produce false findings on the homeowners page; that is expected, not a defect.

Orchestrator error, disclosed rather than quietly patched: the shelter-specific gates were lifted into a
site-wide brief without checking them against standing policy. Same failure shape as L008, one level up. The
agent applied gate 4 to new text only, so no draft is contaminated.

## SCOPE ADDITION appended 2026-08-10 06:25 UTC, integration authorized

Owner authorized integration of all four drafts as ONE commit, plus two additions not in the original scope
above. Rollback coverage extended:

1. **T-015 variant C is now IN the same commit.** The farmers-page `uc-framing` paragraph (line 170) gets
   variant C, the question-led 199-word version. This is the CONVERSION edit, previously listed under "Known
   interim gap" below as deliberately excluded. It is no longer excluded. Rollback is unchanged, since it is
   the same file already covered: `git checkout -- src/pages/for/farmers/index.astro`. Consequence for
   dispatch: the farmers page now receives compliance edits AND the conversion edit, so BOTH must be applied
   by a SINGLE agent to avoid two agents writing one file.
2. **The four spec and plan docs are now in scope (T-027).** These were NOT in the file list above and need
   their own rollback line:

```
git checkout -- docs/superpowers/specs/2026-05-25-product-pages-design.md
git checkout -- docs/superpowers/specs/2026-06-04-use-case-pages-design.md
git checkout -- docs/superpowers/plans/2026-05-25-product-and-city-pages.md
git checkout -- docs/superpowers/plans/2026-06-04-use-case-pages.md
```

3. **The build-time guard (T-025) is now authorized** after the owner reconsidered on new evidence (the
   violations have a written source a hard stop cannot police, and three separate cases proved a keyword grep
   passes real violations). It will be built AFTER integration so it validates the cleaned state rather than
   failing against in-flight edits. A new test file is additive, so rollback is deletion of that file.

Corrected note on the "Known interim gap" section below: the farmers line 29 concession remains a live
CONVERSION gap, but line 29 is separately in scope as a gate violation under T-A of the farmers rework, so
read that section as partially superseded.

## Known interim gap accepted by proceeding

Farmers line 29's dead-end pole-barn concession is a CONVERSION defect, not a gate violation, and stays out
of this batch. The T-015 paragraph variants remain unpicked. So the AEO surface keeps the weaker framing
until T-019's conversion half is scheduled.

## Compliance state at checkpoint

- Transcript current through Response 7. Session log exists for 2026-08-10.
- PROJECT_STATE: 25 todos, valid JSON, counter reset, HS-UDO-015 conflict check passing.
- Decisions logged this session: 3 (delegation, T-015 narrow, gate conflicts reworded). A fourth is owed
  for this authorization.
- PROJECT_HS_003: authorized, not yet written at checkpoint time.
- No Framework files modified.
