# Checkpoint: 2026-08-11 18:40 UTC, before the pre-commit fix batch

Trigger: **HS-UDO-002, before a risky operation.** Four files are about to be edited and then committed.
Session: claude-opus-5-2026-08-11-1657. Timestamps read from `date -u`, per L014.

## Authorized scope, owner ruling 2026-08-11T18:35Z

1. Fix the live PROJECT_HS_003 class-6 violation at `src/pages/for/contractors/index.astro:122` (T-113),
   by adapting the model answer this same batch installed at `src/pages/for/businesses/index.astro:126`.
2. Clean the 10 pre-existing dashes on the added side of the diff (7 U+2014, 3 U+2013).
3. Then commit **Option A**: 22 paths plus the already-staged `.bak` deletion.

Owner declined Option B (permit-only, 7 paths) because it would exclude the four content rewrites that are
the substance of the rework, and declined leaving the dashes despite all 10 being verified present at HEAD.

## Why a combined commit rather than the planned permit-only one

Five of six source files are workstream-mixed and a pathspec takes a file whole (T-115). The decisive fact:
the persona pages carry 8 links to Lexington and Huntington while HEAD's `cities.ts` contains zero
references to either, so a permit-only commit would publish 8 routes that 404. Astro does not link-check,
so `npm run build` cannot catch it.

## Pre-edit SHA-256 of every file in the authorized edit scope

```
d07f6c37018740d9192a1464376bb114835f73ea6e02bea733048a05f4cb2ac4  src/pages/for/contractors/index.astro
d530bd842221e5b89253403ef5cb3af68743588146a69333ba6ded4eb781d7c7  src/data/containers.ts
c2253062cffb300025b0fd97c126e89980ff2cb3d7e8c487058dc6facccbd904  docs/superpowers/specs/2026-06-04-use-case-pages-design.md
c7d6caf61ec08011d16b80ceb84278117783a82fb1fbab88bad19f6a269ac495  docs/superpowers/plans/2026-06-04-use-case-pages.md
```

## Repo state at checkpoint

- HEAD: `544077b`, unchanged since 2026-08-04.
- `git status --porcelain` entries: **105**.
- Staged: `D src/pages/permits/_index.astro.bak`.
- Verified baseline before edits: build **exit 0 at 53 pages**, tests **149 passing, 1 failing**
  (the HS003 guard at its 2 owner-reserved blog findings, deliberate per T-036), `tsc` exit 2 with one
  pre-existing error in `submit-quote.ts`.

## Rollback

All four files in scope are **already modified** relative to HEAD, so `git checkout --` on any of them
would destroy prior-session work, not just this batch's edits. **Do not use it.** Roll back by restoring
the content that matches the SHA-256 values above, then re-verify with `shasum -a 256`.

If the commit itself needs undoing after the fact, `git reset --soft HEAD~1` preserves the working tree.

## Excluded and must stay excluded

`.gitignore`, `README.md`, `START_HERE.md`, `LICENSE`, the 34 root-level deletions, and the untracked
`UDO Project/` tree. All are the deferred UDO v2.2 migration (T-075). Note per T-107 that `UDO Project/`
is gitignored wholesale, so `git add` on it would silently add nothing.

---

## SCOPE EXTENSION appended 2026-08-11T19:50Z, owner ruling

The independent verifier returned **CLEAR WITH CONDITIONS**. Two conditions, neither a correctness or
compliance defect, both now authorized for a second fix pass.

**Condition 1, a copy defect in the T-113 replacement.** The clause "the only number that answers it is the
one in that unit manufacturer's specification" binds the possessive to the compound noun *unit manufacturer*,
so `that` points at a manufacturer never introduced in the discourse. Confirmed to be a collapse of two
correct constructions from the businesses model, which uses "the unit's manufacturer" and "the manufacturer's
specification" separately. Authorized fix: "the one in the manufacturer's specification for that unit",
which reuses a string already blessed in compliant guard fixture C13.

**Condition 2, nine pre-existing em dashes on the wider commit's added side**, in three files that were
outside the original four-file grant. Owner ruled: **extend the grant and clean all nine.** Orchestrator
verified the counts and the net-new figure independently.

| File | U+2014 added | removed | net-new |
|---|---|---|---|
| src/pages/locations/index.astro | 6 | 6 | 0 |
| src/pages/shipping-containers-for-sale/index.astro | 2 | 2 | 0 |
| src/components/home/CtaSection.astro | 1 | 1 | 0 |

They surface only because the Lexington and Huntington city edits reflowed those lines.

### Pre-edit SHA-256 for the three newly added files

```
cef61d4063c3e55302c52304e5febbc727df7177f1460d40820a58203d9e4729  src/pages/locations/index.astro
459457dfa857bbc955a8f8d4ee1db8059fd6fe1e51a29ef7b9f8a916ff883890  src/pages/shipping-containers-for-sale/index.astro
97babaa3a91bcd99d1ecd0c308aa054ce3ad22515f02fd84ade27a4afecf0428  src/components/home/CtaSection.astro
```

### Rollback note, unchanged in force

All three are already modified relative to HEAD and carry the Huntington and Lexington city rollout.
`git checkout --` on any of them destroys that work. Restore by content against the SHA values above.

### Still excluded, and deliberately

`src/components/home/HeroSection.astro` carries its own dash debt at line 29 (T-077) and
`src/components/home/ProblemSection.astro` carries two at line 34 (T-112). **Neither is in this grant.**
The standard being met is zero on the ADDED side, not zero in the file: these three files retain
pre-existing dashes on unchanged lines, which remain part of the 647-instance debt tracked in T-112.
