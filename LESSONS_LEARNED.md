# Lessons Learned

This file captures recent/situational lessons. It's **Layer 3** of the rule hierarchy.

---

## Rule Hierarchy

| Layer | Location | Purpose | Max Items |
|-------|----------|---------|-----------|
| 0 | HARD_STOPS.md | Absolute rules (NEVER violate) | ~15 |
| 1 | .rules/*.md | Detailed standards | Unlimited |
| 2 | .agents/*.md (Learned Rules section) | Agent-specific rules | ~15/agent |
| 3 | LESSONS_LEARNED.md (this file) | Recent/situational | ~20 active |

---

## How This File Works

**For AIs**:
1. Read this file at session start
2. When adding a lesson:
   - Agent-specific? → Add to that agent's `## Learned Rules` section
   - Stable standard? → Add to appropriate `.rules/` file
   - Situational/recent? → Add here
3. When lessons pile up, prompt user to review and graduate stable ones

**For Humans**:
- When you correct the AI, say "add to lessons"
- AI will ask clarifying questions before adding
- Review periodically to graduate stable lessons upward

---

## Active Lessons (Layer 3)

### L001 — Always check UDO first
**Date:** 2026-05-25  
Before deciding how to handle any situation — execution approach, compliance gaps, agent usage, mode selection — check what the UDO protocol already specifies. Do not improvise, offer options, or ask the user when ORCHESTRATOR.md has already answered the question. UDO is the operating system; consult it before acting.

---

## Archived Lessons

| ID | Title | Graduated To | Date |
|----|-------|--------------|------|
