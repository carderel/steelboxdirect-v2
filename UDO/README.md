# UDO - Universal Dynamic Orchestrator

**AI Project Management System | Version 4.5**

UDO is a file-based framework that gives AI assistants structure, memory, and accountability across sessions. It works with any LLM that can read and write files (Claude, GPT, Gemini, etc.).

---

## The Problem UDO Solves

AI assistants are stateless. Every session starts fresh. This creates problems:

- **No continuity** — Previous decisions, context, and progress are lost
- **No accountability** — No audit trail of what was done or why
- **No structure** — AI jumps straight to execution without planning
- **No verification** — Claims aren't tied to evidence
- **No handoffs** — Can't transfer work between sessions or AI systems

UDO solves these by giving AI a persistent workspace with rules, memory, and checkpoints.

---

## Quick Start

### Install

**Mac/Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/carderel/Ultimate-UDO/main/UDO/install.sh | bash
```

**Windows PowerShell:**
```powershell
irm https://raw.githubusercontent.com/carderel/Ultimate-UDO/main/UDO/install.ps1 | iex
```

### Use

Tell your AI:
```
Read UDO/START_HERE.md and begin
```

---

## How It Works

UDO creates a `UDO/` folder in your project containing:

```
UDO/
├── START_HERE.md           # AI reads this first every session
├── ORCHESTRATOR.md         # Core rules and workflow
├── PROJECT_STATE.json      # Current goal, phase, todos
├── COMMANDS.md             # Available commands
│
├── .agents/                # Specialized AI agents for specific tasks
├── .checkpoints/           # Saved progress snapshots
├── .inputs/                # Source materials and references
├── .memory/                # Persistent facts and working notes
├── .outputs/               # Deliverables and evidence
├── .project-catalog/       # Session logs, decisions, errors
├── .rules/                 # Project-specific constraints
├── .templates/             # Reusable document templates
├── .tools/                 # Tool adapters and integrations
└── .takeover/              # Audit system for existing projects
```

---

## Core Concepts

### Sessions & Continuity
Every AI session creates a log in `.project-catalog/sessions/`. When a new session starts, the AI reads previous logs to understand context.

### Checkpoints
Progress is saved every 3 todos. If a session crashes or context is lost, work can resume from the last checkpoint.

### Agents
For specialized tasks, UDO creates focused agents (e.g., "Security Auditor", "Data Analyst") with specific expertise and constraints.

### Memory System
- **Canonical** — Verified facts that persist across sessions
- **Working** — Current session notes and drafts
- **Disposable** — Temporary scratchpad, cleared between sessions

### Evidence & Teach-Back
For deliverables with claims, UDO requires:
- Evidence packets linking claims to source data
- Teach-back documents so humans can understand and defend findings

---

## Folder Reference

| Folder | Purpose |
|--------|---------|
| `.agents/` | Specialized AI agents for focused tasks |
| `.checkpoints/` | Progress snapshots for recovery |
| `.inputs/` | Source materials, briefs, reference docs |
| `.memory/` | Persistent facts and working notes |
| `.outputs/` | Final deliverables and evidence |
| `.project-catalog/` | Session logs, decisions, handoffs |
| `.rules/` | Project-specific constraints |
| `.templates/` | Document templates |
| `.tools/` | Tool adapters for external services |
| `.takeover/` | Audit system for existing projects |

Each folder contains a README.md explaining its purpose in detail.

---

## Protocols

UDO includes several reasoning protocols:

| Protocol | Purpose |
|----------|---------|
| `REASONING_CONTRACT.md` | Evidence requirements for claims |
| `DEVILS_ADVOCATE.md` | Red team review before delivery |
| `AUDIENCE_ANTICIPATION.md` | Tailor output to stakeholders |
| `EVIDENCE_PROTOCOL.md` | Source every claim in deliverables |
| `TEACH_BACK_PROTOCOL.md` | Explain findings so humans can defend them |

---

## Commands

Common commands (full list in COMMANDS.md):

| Command | Action |
|---------|--------|
| `/status` | Show current phase, todos, blockers |
| `/checkpoint` | Save progress now |
| `/handoff` | Prepare for session transfer |
| `/spawn [type]` | Create specialized agent |
| `/rc` | Enter Reasoning Contract mode |
| `/da` | Run Devil's Advocate review |

---

## LLM Compatibility

UDO works with any LLM that can read/write files:

| Platform | File Access | Notes |
|----------|-------------|-------|
| Claude Code CLI | Full | Recommended |
| Cursor / Windsurf | Full | Works well |
| VS Code + Claude Extension | Limited | May need manual file creation |
| ChatGPT + Code Interpreter | Partial | Upload/download workflow |
| Gemini CLI | Full | Works well |

---

## Update vs Fresh Install

If UDO is already installed:

```bash
# Update (keeps your data)
curl -fsSL .../install.sh | bash -s -- --update

# Fresh install (removes existing)
curl -fsSL .../install.sh | bash -s -- --fresh
```

---

## License

MIT

---

## Contributing

Issues and PRs welcome at [github.com/carderel/Ultimate-UDO](https://github.com/carderel/Ultimate-UDO)
