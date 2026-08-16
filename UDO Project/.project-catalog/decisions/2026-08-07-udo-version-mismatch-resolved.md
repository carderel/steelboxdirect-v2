# Decision: PROJECT_META udo_version corrected from 4.5 to 2.2

Date: 2026-08-07
Decided by: orchestrator, on the owner's instruction to close the outstanding compliance gaps
Evidence gathered by: Explore subagent (RC mode, read-only)
Status: APPLIED
Tags: #udo-protocol #version #migration #compliance

## The open item

`PROJECT_STATE.json` had carried this note since 2026-08-05: "OPEN: PROJECT_META.json udo_version
reads 4.5 while PROJECT_STATE and the Framework read 2.2, left unresolved pending an owner call."

## Finding

**4.5 is stale. 2.2 is correct.** The trap here is that 4.5 looks like a newer version than 2.2.
It is not.

Decisive evidence (Grade A, root `README.md` line 142): "The legacy v4.x series (v4.9, v4.10, and
earlier) was superseded by the v2.0 rewrite above; it is not compatible with this repository and is
not maintained." UDO renumbered its release line downward during the v2.0 rewrite, so v4.x is the
abandoned older scheme and v2.x is current.

Supporting evidence:

- `UDO Framework/VERSION` contains `2.2.3` (Grade A).
- `.project-catalog/decisions/2026-08-05-upgrade-to-2.2.3.md` records "Source version: 2.2.3, Mode:
  migrate-root" (Grade A).
- `UDO-v4-LEGACY-DO-NOT-EDIT/PROJECT_META.json` also reads `4.5`, and that directory's own
  `_LEGACY_NOTICE.md` identifies it as "the original UDO v4.x protocol files and data" kept "for
  reference and audit only" (Grade A).
- `upgrade.py` `transform_project_meta()` preserves every field except adding `protocol_strict`, and
  never touches `udo_version` (Grade A). So the migration copied 4.5 forward verbatim. A later
  session hand-filled name, description, owner, and repository but left the version field alone
  (Grade D, chain shown, corroborated by lesson L004).
- Nothing reads `udo_version` programmatically. A repo-wide grep returns only declaration sites and
  documentation, and `validate.py` does not assert on it (Grade B). This was a metadata-correctness
  issue, not a functional break.

Confidence: 96 percent. The residual doubt is that the upstream fresh-install template was not
available for inspection, so a separate "schema version" reading of the field cannot be fully ruled
out. Nothing in this repository supports that reading.

## Edit applied

`UDO Project/PROJECT_META.json` line 8: `"udo_version": "4.5"` becomes `"udo_version": "2.2"`.

"2.2" was chosen over "2.2.3" so the value matches `PROJECT_STATE.json` exactly. 2.2 is the release
line, 2.2.3 is a patch inside it. If patch-level precision is ever wanted, both files must change in
the same pass.

## Related stale artifacts, flagged but NOT changed

These were found during the investigation and left alone deliberately, because they are outside the
scope the owner approved and touching them has non-obvious blast radius:

1. `ROOT/.udo-version` still reads `4.5`. It is a v4-era root file that `upgrade.py` does not manage
   at all (Grade A: the string `.udo-version` never appears in `upgrade.py`), so migrate-root left
   it behind. Harmless today. It could mislead a future upgrade run or a human.
2. `UDO Project/.manifest.json` declares `"version": "2.0"`, `"udo_version": "2.0"`, and
   `"framework_reference": "UDO Framework v2.0"`. This is the v2.0 template manifest shipped forward
   untouched. Stale, but less consequential than PROJECT_META.

Recommend an owner call on both. Item 1 is the one more likely to cause a real problem later.

## Related

- `.project-catalog/decisions/2026-08-05-upgrade-to-2.2.3.md`
- `.project-catalog/decisions/2026-08-05-v4-to-v22-migration-record.md`
- `LESSONS_LEARNED.md` L004 (a version migration can move the folders and lose the identity)
