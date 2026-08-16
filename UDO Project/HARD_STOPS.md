# Project Hard Stops

This document extends the UDO Framework hard stops with project-specific constraints.

## Framework Hard Stops

The project inherits all framework hard stops from `UDO Framework/HARD_STOPS.md`:

- See `UDO Framework/HARD_STOPS.md` for the authoritative list (some IDs are retired tombstones). All listed items are mandatory.

## Active Project Hard Stops

### PROJECT_HS_001: Mandatory Session Transcript Updates (Hardened v2.1)

**Description:** Session transcript MUST be updated after every user prompt/response cycle with verified file writes and explicit reporting.

**PRE-FLIGHT CHECK (before response creation):**
- Verify `.project-catalog/history/YYYY-MM-DD-HHMM-session-transcript.md` exists and is writable
- If file does not exist or is locked: HALT immediately, report to user, do not proceed with response

**ENFORCEMENT (during response):**
- Append work summary to transcript file after each response completes
- Timestamp each entry: `## Response [N] - [HH:MM:SS UTC]`
- Include: task completed, agents invoked (with skills), decisions made, files changed

**POST-RESPONSE VERIFICATION (mandatory):**
- Verify file write succeeded by checking file modification timestamp
- Report in response ONLY ONE OF:
  - ✅ `Agents used: [AgentName] (Skill: [SkillName])`
    `History Updated [file path] [timestamp from actual file write]`
  - OR ✅ `No agents needed (meta-work: [reason])`
    `History Updated [file path] [timestamp from actual file write]`
  - OR ✗ `VIOLATION: History file write failed - [specific reason]. Escalating to user.`
- If none of above appears in response -> response is incomplete, HALT before next prompt

**Verification Requirements:**
- Agent names must exist in `.agents/` directory (not generic names like "Claude", "Orchestrator")
- Skills must be listed in that agent's CAPABILITIES section (verifiable)
- File timestamp must be AFTER this response started (not old/backdated)
- Exact path must match: `.project-catalog/history/YYYY-MM-DD-HHMM-*.md` pattern

**VIOLATION CIRCUIT BREAKER:**
- If transcript write fails: HALT before accepting next user prompt
- Escalate to user: "Transcript write failed. Requires manual intervention. Unable to proceed."
- Do not resume until user confirms file is writable

**Exception process:** NONE. If file cannot be written, this blocks all work until user fixes it.

---

### PROJECT_HS_002: Delegation (v3, capability-aware)

**Step 0, CAPABILITY CHECK (once per session, at orientation):**
Read CAPABILITIES.json `delegation` block (written at session start per START_HERE).
- `available: true` -> this rule is ACTIVE.
- `available: false` -> this rule is SUSPENDED for the session. Log once in the transcript:
  "PROJECT_HS_002 suspended: no subagent capability in [harness]. Specialized work executes in main context; checkpoint cadence tightened per HS-EXEC-001."

**When ACTIVE:**
- Specialized work (analysis, research, planning, writing, code) MUST be delegated BEFORE execution begins.
- Valid delegates, in preference order:
  1. Installed project agents (`.agents/*.md`, synced to the harness)
  2. Harness-native agents (e.g. Explore, general-purpose, Plan) for search/read/plan work
  3. If neither fits: check the agents catalog (AGENTS_INDEX/CATALOG-AGENTS, see ORCHESTRATOR "Capability Discovery"), offer install; else create from `../UDO Framework/.templates/agent.md`
- Meta-work needs no agent: orchestration, status updates, direct factual answers, audit-trail writes.

**POST-RESPONSE VERIFICATION (when ACTIVE), report exactly one:**
- `Agents used: [name(s)] ([harness-native | .agents/])` plus one sentence of specific evidence
- `No agents needed (meta-work: [reason])`
- `VIOLATION: [task] executed without delegation` -> HALT before next prompt, escalate to user.

**Evidence rules:** named agents must be real (a `.agents/` file or a harness-native agent the harness actually ran); evidence must be specific ("read 14 files, found 3 candidates"), never "completed the work".

---

### PROJECT_HS_003: No Determinations Steel Box Direct Is Not Entitled To Make

**Added:** 2026-08-10, on owner authorization. See
`.project-catalog/decisions/2026-08-10-gate-conflicts-must-be-reworded.md` and
`.project-catalog/decisions/2026-08-10-sitewide-permit-rework-authorized.md`.

**Description:** NEVER publish copy that determines or promises a regulatory, tax, insurance, or structural
outcome on the reader's behalf, **in either direction**, for any jurisdiction or any third party.

**The banned classes:**

1. **Permit outcomes.** No "no permit needed", "permit-free", "usually no permit", "rarely need a permit",
   "no inspection". Also no assertion that a permit IS required.
2. **Building classification.** No "personal property", "real property", "permanent structure", "not a
   permanent structure", "temporary structure", "a building", "not a building", "accessory structure",
   "classified as". **Both directions are banned.** Asserting a container is NOT a permanent structure and
   asserting it IS the base for permanent structures are the same violation.
3. **Zoning outcomes.** No "zoning allows", "allowed by right", "no variance needed", "grandfathered".
4. **Tax and assessment outcomes.** No "no reassessment", "won't raise your taxes", "not taxable", "does not
   trigger a property-tax reclassification", "is not real property". Also no comparative assessment claims
   about alternatives (for example what a pole barn does to an assessed value).
5. **Insurance coverage.** No claim about what a third party's policy covers, requires, or accepts. Added to
   this rule on 2026-08-10 by owner decision after three such claims were found live.
6. **Structural, load, and mounting capacity.** No "rated for", "load bearing", "supports the weight", "can
   support", "mounts to", or any wind, snow, span, or psf figure, whether or not attributed to a vendor.
   Structural questions deflect to the kit or container manufacturer or a licensed engineer.
7. **Jurisdiction plus outcome.** Never name a county, city, township, or state in the same breath as a
   permit, zoning, or tax outcome.

**What IS permitted, and required:** describe the QUESTION accurately. What axis matters, who decides, what
changes the answer, what to ask. Attribution and conditionality are the tools. "Ask your carrier whether X"
is compliant; "your carrier covers X" is not. "Your county auditor decides what gets assessed" is
compliant; "this will not be assessed" is not.

**REFRAME, NOT REMOVAL.** Going silent on these topics is its own failure. Buyers want the orientation, and
a dealer who refuses to discuss permits is less useful, not safer. Deleting the topic is not compliance, it
is abdication. The honest version is also a competitive advantage over a dealer who overpromises and gets a
customer fined or denied.

**Surfaces this applies to with special force.** Headings, meta descriptions, image alt text, table cells,
and anything feeding JSON-LD. These strip surrounding attribution, so a hedge that exists two sentences away
does not travel with the claim. A table cell has no room for a caveat, which makes cells the most quotable
and most dangerous form of any claim. On this site the persona-page `faqs` arrays feed the FAQPage JSON-LD
via `src/lib/schema/buildPageSchema.ts`, and the first three FAQs of each also render visibly in QuickFacts,
so one bad answer can occupy three surfaces at once.

**The compliant template already exists in this repo.** Copy it rather than inventing phrasing:
- `src/pages/permits/index.astro` (the whole page; audited compliant 2026-08-10)
- `src/pages/for/farmers/index.astro` lines 17, 116, 117
- `src/pages/for/homeowners/index.astro` lines 27, 59, 149
- `src/pages/shipping-containers-for-sale/index.astro:38` (the model for structural questions)

**Enforcement note, and an honest limitation.** A keyword blacklist is NOT sufficient and this is proven, not
theoretical: the 2026-08-10 sweep found that eight enumerated banned phrases returned zero site-wide while
`src/data/containers.ts:41` reached permit-free meaning through "without a permanent structure permit in most
counties," which no listed pattern would have caught. Check meaning, not just wording. A build-time guard was
proposed (T-025) and is NOT yet authorized, so this rule currently depends on being read.

**Violation protocol:** if you find live copy violating this, do not silently fix it and do not silently
leave it. Report it to the owner with file, line, schema-binding status, and severity. The 2026-08-10 sweep
is the model for that report.

## Relationship to Framework

- All framework hard stops are **mandatory** (see `UDO Framework/HARD_STOPS.md` for the authoritative list; some IDs are retired tombstones)
- Project hard stops **extend** framework rules, not replace them
- When conflict exists, framework rules take precedence
- Project rules add domain-specific constraints

## Enforcement

Hard stops are enforced via:
- Pre-session review (agent reads before starting work)
- Mid-session checks (agent verifies during work)
- Post-session audit (session log references)
- Handoff protocol (constraints communicated to successor)

## Updates

When adding new hard stops:
1. Document clearly with rationale
2. Communicate to all agents
3. Update session logs
4. Note decision in .project-catalog/decisions/

## See Also

- `UDO Framework/HARD_STOPS.md` - Framework hard stops
- `UDO Framework/ORCHESTRATOR.md` - Full protocol
