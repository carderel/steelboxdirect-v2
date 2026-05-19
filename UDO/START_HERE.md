# 🚀 New AI? Start Here.

## ⚠️ MANDATORY FIRST STEP

**STOP. Read `ORCHESTRATOR.md` NOW and adopt its protocols before doing anything else.**

Do not proceed until you have:
1. Read ORCHESTRATOR.md completely
2. Understood the SESSION LOGGING requirement (you MUST log every session)
3. Understood CHECKPOINT triggers (auto-save after 3 todos, phase completions)
4. Understood when to CREATE AGENTS (2+ distinct personas needed)
5. Understood the MEMORY SYSTEM (canonical/working/disposable)
6. Understood the DUAL-MODE SYSTEM (RC mode for analysis, Persona mode for delivery)

**Say this before starting work:**
> "I have read ORCHESTRATOR.md and will follow UDO protocol. I understand I must: log sessions, checkpoint progress, create agents when needed, use the memory system, and operate in the correct mode (RC for analysis, Persona for delivery)."

---

## After Reading Orchestrator

Complete these orientation steps:

1. **Check hard stops:** `HARD_STOPS.md` (rules you must NEVER violate)
2. **Check reasoning contract:** `REASONING_CONTRACT.md` (how to think during analysis)
3. **Check current status:** `PROJECT_STATE.json`
4. **Check lessons:** `LESSONS_LEARNED.md` (mistakes to avoid)
5. **Know your environment:** `CAPABILITIES.json`
6. **Check recent sessions:** `.project-catalog/sessions/` (most recent file)

## Then Give Your Orientation Report:

> "I've read ORCHESTRATOR.md and REASONING_CONTRACT.md and reviewed the project.
> - **Goal:** [from PROJECT_STATE.json]
> - **Phase:** [current phase]
> - **Last session:** [summary from most recent session log]
> - **Next steps:** [from PROJECT_STATE.json or last session]
> Ready to continue."

---

## Quick Reference

### Dual-Mode System

| Mode | Use For | Key Rule |
|------|---------|----------|
| **RC Mode** | Analysis, research, decisions | Every claim needs evidence |
| **Persona Mode** | Writing, creating, delivering | Only use facts from RC handoff |

**Flow:** RC Mode → Handoff Packet → Persona Mode → Deliverable

### Session Commands

| Command | What AI Does |
|---------|--------------| 
| `Resume` | Quick resume with oversight report |
| `Deep resume` | Full context with recent sessions |
| `Handoff` | Create session log, update state, end session |
| `Quick handoff` | Minimal session log |
| `Status` | Oversight report only |
| `Backfill sessions` | Reconstruct missing session logs |

### Mode Commands

| Command | What AI Does |
|---------|--------------|
| `RC mode` | Engage Reasoning Contract mode |
| `Analyze [topic]` | RC mode for specific analysis |
| `Persona: [name]` | Switch to persona for delivery |
| `Write [deliverable]` | Persona mode (needs RC handoff first) |

### Command Shortcuts

| Short | Full Command |
|-------|--------------|
| `r` | Resume |
| `dr` | Deep resume |
| `h` | Handoff |
| `qh` | Quick handoff |
| `s` | Status |
| `cp` | Checkpoint this |
| `bf` | Backfill sessions |
| `cc` | Compliance check |

---

## Rule Hierarchy

| Layer | Location | Override? |
|-------|----------|-----------|
| 0 | `HARD_STOPS.md` | NEVER |
| 0.5 | `REASONING_CONTRACT.md` | NEVER (during analysis) |
| 1 | `.rules/*.md` | With justification |
| 2 | `.agents/*.md` | By orchestrator |
| 3 | `LESSONS_LEARNED.md` | Easily |

---

## Compliance Checklist

Before starting ANY work, confirm you will:

- [ ] Log this session to `.project-catalog/sessions/` before ending
- [ ] Auto-checkpoint after every 3 completed todos
- [ ] Create agents if task requires 2+ distinct personas
- [ ] Document major decisions in `.project-catalog/decisions/`
- [ ] Use memory system for facts discovered during work
- [ ] Update PROJECT_STATE.json after completing work
- [ ] Use RC mode for analysis, Persona mode for delivery
- [ ] Create handoff packet before switching from RC to Persona mode

**If you find yourself working without logging, STOP and catch up.**
**If you find yourself making claims without evidence, STOP and engage RC mode.**
