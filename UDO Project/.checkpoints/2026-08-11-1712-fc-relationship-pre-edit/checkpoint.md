# Checkpoint: 2026-08-11 17:12 UTC, before any Freedom Conex copy change

Trigger: **HS-UDO-002, before a risky operation.** The first source change of the `fc-relationship`
workstream has not happened yet. This is the rollback point for it.
Session: claude-opus-5-2026-08-11-1657
Timestamps read from `date -u`, not interpolated (L014).

---

## Repo state at checkpoint

- Branch `main`, **HEAD `544077b`** ("fix(locations): add Columbus to homepage CTA + persona-page delivery grids", 2026-08-04).
- **Nothing committed since 544077b.** The prior session ran three workstreams and committed none of them.
- `git status --porcelain` totals **105 entries**.
- `git diff --stat -- src/`: **15 files, 260 insertions, 52 deletions.**
- Staged: one deletion, `src/pages/permits/_index.astro.bak`.
- Untracked under `src/`: `src/content/blog/the-cheap-container-that-wasnt.md`, `src/lib/compliance/`.
- 34 unstaged root-level deletions, UDO v2.2 migration residue, deliberately deferred (T-075).

## The 15 already-modified source files, which this workstream must not disturb

```
src/components/SiteFooter.astro          src/pages/for/businesses/index.astro
src/components/SiteNav.astro             src/pages/for/contractors/index.astro
src/components/home/CtaSection.astro     src/pages/for/farmers/index.astro
src/components/home/HeroSection.astro    src/pages/for/homeowners/index.astro
src/data/cities.test.ts                  src/pages/locations/index.astro
src/data/cities.ts                       src/pages/shipping-containers-for-sale/index.astro
src/data/containers.ts
src/lib/schema/entities.test.ts
src/lib/schema/entities.ts
```

## A finding worth recording: the T-105 target is clean at HEAD

Verified at checkpoint time with `git status --porcelain` on each candidate target:

| File | State | Consequence |
|---|---|---|
| `src/pages/container-buying-guide/index.astro` | **clean at HEAD** | T-105's fix can be committed on its own without entangling the permit batch |
| `src/pages/terms.astro` | **clean at HEAD** | same |
| `src/pages/privacy.astro` | **clean at HEAD** | same |
| `public/llms.txt` | already modified | a T-106 edit here would mix into an existing uncommitted change |
| `src/lib/schema/entities.ts` | already modified | same, and it holds both `parentOrganization` nodes and `foundingDate` |

**This materially improves the commit story.** The three highest-value FC targets carry no pending changes, so
the T-105 correction is separable from the permit batch (T-054, T-075) rather than adding to a tree that already
holds three unrelated workstreams. `llms.txt` and `entities.ts` are the two that would entangle, and both are
Category B or A instances rather than the T-105 factual error.

## SHA-256 of the candidate targets, for exact rollback verification

```
32a5bad94b157dbc051de36a0f979fbf49a7afc10993b5dcc0c0f37eb7129ccf  src/pages/container-buying-guide/index.astro  (256 lines)
aec31a577df3a6670279175bc8257ad3458385da0b5d503e9514a53fd4c8542c  src/pages/terms.astro                        (190 lines)
95d34b616b81c2732d8de047ed94a3e2e75e88da2f0c55d7046193c04d83175d  src/pages/privacy.astro                      (427 lines)
f1cd088160eb6fbea808148f77bad2c673b55d9a9cff7782c26b9204c8b218b0  public/llms.txt                              (47 lines)
07c3dd73c7dafdbbd75ddd8121f1f80c51402cdf405ebe0b1a0a2898962257c8  src/lib/schema/entities.ts                   (116 lines)
```

## Rollback

For the three clean-at-HEAD files, rollback is exact and safe:

```
git checkout -- src/pages/container-buying-guide/index.astro src/pages/terms.astro src/pages/privacy.astro
```

**Do NOT use `git checkout --` on `public/llms.txt` or `src/lib/schema/entities.ts`.** Both carry uncommitted
work from the prior session's schema fix (T-073) and the Columbus rollout, and a checkout would silently destroy
it. If either is edited in this workstream, revert by hand against the SHA above, or stash first.

Verify any rollback by re-running `shasum -a 256` and matching the values above.

## Scope this checkpoint protects

Authorized this session (owner ruling, `decisions/2026-08-11-1700-delegation-ruling-and-fc-priority.md`):

- **T-105**, the 2009 founding misattribution on the buying guide. A factual correction with an unconditional
  mandate. Wording still to be drafted and picked by the owner.
- **T-106**, scoping and inventory only. **The legal pages are NOT being reworded this session.** That routes to
  Doug and possibly a lawyer, and the right language depends on the still-open T-102 identifier question.

Not authorized and not touched: the permit-batch commit, the gitignore fix (T-107), the footer link (T-101,
which is deliberately gated on T-102), the RTO drafts, the rental resource page.

## Gate that must clear before any edit

`data-auditor` is re-verifying the external facts live (HS-EVID-001). **If it cannot support Steel Box
Direct's own 2009 date, the T-105 fix changes shape:** the date gets removed rather than reattributed, because
moving it would convert an unverified schema value into a published factual claim on the one page whose whole
argument is "find out who you are actually buying from." No copy is written until that returns.

## Known-red state that is expected, not a regression

- `src/lib/compliance/hs003-content-guard.test.ts` is **deliberately RED** at 2 owner-reserved blog findings
  and is intentionally not wired to the build (T-036). Do not read that failure as caused by this workstream.
- Test baseline to compare against: **149 passing, 1 failing** (the guard). Build **exit 0 at 53 pages**.
