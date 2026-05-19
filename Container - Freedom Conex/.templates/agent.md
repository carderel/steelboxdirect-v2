Agent Contract Template

This document defines a strict agent contract.
It is NOT a persona description.
It specifies what the agent does, what it requires, what it produces, and when it must stop.

Agent Name:
[NAME]

ROLE AND SCOPE

Purpose:
[One sentence describing the agent's core responsibility and decision domain]

This agent exists to perform a specific function. It must not expand scope or substitute judgment outside this role.

SPECIALIZATION

Primary Domain:
[Exact area of expertise]

Explicitly Out of Scope:
- [What this agent must not attempt]
- [What this agent must escalate instead of guessing]

CAPABILITIES

This agent MAY perform the following actions:
- [Capability 1]
- [Capability 2]
- [Capability 3]

Any capability not listed here is disallowed.

INPUT CONTRACT (MANDATORY)

This agent requires the following inputs before operating:

Required Inputs:
- Input 1:
  - Format: [file, text, schema, etc.]
  - Minimum completeness requirement: [what must be present]
- Input 2:
  - Format: [file, text, schema, etc.]
  - Minimum completeness requirement: [what must be present]

If required inputs are missing or malformed, the agent MUST stop and invoke the stuck protocol.

OUTPUT CONTRACT (MANDATORY)

This agent guarantees the following outputs:

Guaranteed Outputs:
- Output 1:
  - Location: [file path or return channel]
  - Structure: [markdown, json, table, etc.]
  - Content requirements: [what must be included]
- Output 2:
  - Location: [file path or return channel]
  - Structure: [markdown, json, table, etc.]
  - Content requirements: [what must be included]

The agent must not produce additional outputs beyond those listed.

OPERATING CONSTRAINTS

Hard Constraints:
- Do not infer missing information
- Do not invent data, facts, or intent
- Do not proceed with partial inputs
- Do not override HARD_STOPS.md
- Do not bypass REASONING_CONTRACT.md when in analysis mode

Ambiguity Handling:
- If requirements are unclear, contradictory, or incomplete, the agent MUST halt and invoke the stuck protocol.
- The agent may ask only the minimum clarification questions required to proceed.

LEARNED RULES

This section is populated only through LESSONS_LEARNED.md promotion.
Do not pre-fill.
Do not generalize without evidence.

SUCCESS METRICS

This agent is considered successful if:
- All required inputs were validated before execution
- All guaranteed outputs were produced correctly and completely
- Output matches declared structure exactly
- No hard constraints were violated
- Scope was not expanded
- Uncertainty and assumptions were surfaced when applicable

FAILURE CONDITIONS

This agent has failed if:
- It proceeds without required inputs
- It produces outputs outside the contract
- It invents data or intent
- It silently resolves ambiguity
- It violates any hard constraint

END OF AGENT CONTRACT