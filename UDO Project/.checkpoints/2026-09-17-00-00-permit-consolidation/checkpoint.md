# Checkpoint: 2026-09-17 permit consolidation

## State
Work is IN THE TREE, uncommitted and unpushed. `main == origin` at `e5ae910`.

## What was decided
The owner brought a Gemini plan for the 77 near-identical county permit pages and chose option A:
consolidate into the 11 existing `/permits/{state}/` hubs and 301 the old URLs.

Three parts of the Gemini plan were refused and the reasons are recorded in
[[gemini-seo-advice-must-be-audited]]:
1. Per-county "localized variations of our standard zoning guidelines" is a permit determination for
   a named place. Hard stop. It is also unsourceable: `permitCounties.ts` derives from `cities.ts`
   and holds only an office name, scope and URL per county.
2. A "Big 7" metro list. There are 15 city pages. Redirecting the other 8 as thin would have removed
   the pages responsible for 86% of the site's impression gain.
3. Building a state permit hub that already existed at `src/pages/permits/[state]/index.astro`.

## What was built
- `permits/[state]/index.astro` rewritten: one anchored `<section id="{county-slug}">` per
  jurisdiction, plain anchor jump list, no JS, no sticky. `CollectionPage` schema with `ItemList`
  pointing at the anchors, plus 3 state-scoped FAQs.
- `permits/[state]/[county].astro` DELETED.
- 77 redirects generated in `astro.config.mjs` from `permitCounties.map(...)`. No slug hand-typed.
- 77 trailing-slash companions in `public/_redirects`, with a guard test that recomputes the block.
- `permitCounties.ts` gained `anchorPath` and `multiOfficeNote()`. Still fully derived.
- `locations/[state]/[citySlug].astro`: link target and one intro sentence only. +14/-5, one file.
- `permit-county-guard.test.ts` rewritten, 44 to 49 tests.
- `routeLastmod.mjs` regenerated.

## Numbers
- Tests 708 to 721, 29 files. Build clean, hs003 and dash guards pass.
- Sitemap 161 to 84 URLs. Delta exactly -77, zero gained, nothing non-permit lost.
- `dist/_redirects` 166 rules, 154 county forms, zero state/slug mismatches.

## Independent verification
A verifier reproduced all 12 claims from a clean rebuild, building the BEFORE state in a throwaway
worktree rather than trusting the agent. All sweeps in Python. The anti-invention guard was confirmed
non-vacuous three independent ways: residue test, before/after sentence diff (109 new sentences, all
state-level boilerplate, zero stating a requirement for a named place), and a named-place plus modal
scan.

## The hole found, being fixed now
20 of the 49 assertions, INCLUDING the letter-for-letter anti-invention reconstruction, were
`it.skipIf(!hasDist)`. With `dist/` moved aside the file reported "29 passed | 20 skipped" and looked
green. `npm run build` never exercises the reconstruction either. That is the same failure class this
project already paid for twice: the `grep --include=*.html` false pass, and the hidden footer text
that every source-reading check missed for 120 days. A fix is dispatched: a missing `dist/` must FAIL
the hard-stop assertions, matching the pre-push gate's existing stance.

Also latent: `sectionHtml` matches to the first `</section>`, so a nested section added later would
truncate the reconstruction capture.

## Not verified
- Live Cloudflare 301 behaviour. Verified as correct lines in `dist/_redirects`, not as HTTP
  responses. Only a deploy proves Pages serves them.
- 400px rendering is reasoned, not measured. No browser was opened.
- The 708 baseline is inferred, not executed: the HEAD guard references the deleted template so it
  cannot run against the current tree.

## Next
Owner decides whether to push. If pushed: submit IndexNow, then confirm the 301s serve on production
and recheck GSC coverage, because 77 URLs are being retired at once.
