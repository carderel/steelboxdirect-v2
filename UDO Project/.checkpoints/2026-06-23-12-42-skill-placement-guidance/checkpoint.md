# Checkpoint — 2026-06-23 12:42 — Skill placement guidance

**User question.** Where should custom skills live inside the UDO project structure?

## Guidance Recorded
- Repo-specific Codex skills belong in `.agents/skills/<skill-name>/SKILL.md`.
- UDO agents remain `.agents/*.md`.
- UDO rules remain `.rules/*.md`.
- Durable memory remains `.memory/`.
- Audit/session/decision artifacts remain `.project-catalog/`.

## Evidence
- Existing repo-local skill: `.agents/skills/web-perf/SKILL.md`.
- Codex skill format from `skill-creator`: each skill is a folder with required `SKILL.md` and optional `scripts/`, `references/`, `assets/`, and `agents/openai.yaml`.
