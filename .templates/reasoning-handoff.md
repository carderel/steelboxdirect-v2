Reasoning to Persona Handoff Packet

Topic: [What was analyzed]
Date: [YYYY-MM-DD HH:MM]
Reasoning Agent: [LLM session that performed analysis]
Target Persona: [Persona agent that will produce the deliverable]

--------------------------------
PURPOSE
--------------------------------

This document is the ONLY authorized interface between Reasoning Contract mode and Persona mode.
Persona agents MUST NOT begin work without an approved handoff packet.

--------------------------------
EXECUTIVE SUMMARY
--------------------------------

[2 to 3 sentences stating the bottom line of the analysis.
No new claims. No speculation. Summary must be derived entirely from sections below.]

--------------------------------
VERIFIED FACTS
--------------------------------

These statements have Grade A to C evidence.
Persona agents MAY state these as facts exactly as written.
Persona agents MAY NOT rephrase in a way that increases certainty.

Fact 1: [Statement]
Evidence: [Source or citation]
Grade: [A B or C]
Confidence: [X percent]

Fact 2: [Statement]
Evidence: [Source or citation]
Grade: [A B or C]
Confidence: [X percent]

--------------------------------
SUPPORTED CONCLUSIONS
--------------------------------

These conclusions are supported by the verified facts but are probabilistic.
Persona agents MAY state these conclusions only with the stated confidence level.

Conclusion 1: [Statement]
Based on: [Referenced facts]
Confidence: [X percent]
Limitations: [What would weaken or overturn this conclusion]

--------------------------------
ASSUMPTIONS MADE
--------------------------------

These assumptions were required to proceed but are not verified facts.
Persona agents MUST treat these as conditional and MAY NOT present them as facts.

ID | Assumption | Justification | Impact if Wrong | Status
A001 | [Assumption] | [Why assumed] | [What changes] | Unverified

--------------------------------
EXPLICITLY UNCERTAIN AREAS
--------------------------------

There is insufficient evidence in these areas.
Persona agents MUST NOT make claims, implications, or suggestions about them.

- [Topic]: [Why uncertain]
- [Topic]: [Why uncertain]

--------------------------------
PERSONA AGENT BOUNDARIES
--------------------------------

Persona agent MAY:
- State verified facts exactly as written
- Present supported conclusions with stated confidence
- Shape tone, structure, and presentation only

Persona agent MAY NOT:
- Introduce new facts
- Upgrade confidence levels
- Perform additional analysis
- Resolve stated uncertainties
- Infer intent beyond this packet

Tone and style guidance:
[Optional delivery notes only. No analytical latitude.]

--------------------------------
SOURCE INDEX
--------------------------------

ID | Source | Type | Reliability
S1 | [Source] | [Type] | High Medium Low
S2 | [Source] | [Type] | High Medium Low

--------------------------------
HANDOFF VALIDATION CHECKLIST
--------------------------------

Before Persona mode begins, ALL must be true:

[ ] All facts have evidence and grades
[ ] All conclusions include confidence and limitations
[ ] All assumptions are flagged
[ ] Uncertain areas are listed
[ ] Persona boundaries are explicit

If any box is unchecked, Persona mode MUST NOT proceed.

--------------------------------
PERSONA AGENT ACKNOWLEDGMENT (MANDATORY)
--------------------------------

Persona agent MUST explicitly acknowledge this statement before writing:

"I have reviewed this reasoning to persona handoff packet.
I understand I am bound by its facts, conclusions, assumptions, and boundaries.
I will not introduce new claims, perform additional analysis, or increase confidence.
My role is limited to delivery only."

Failure to acknowledge is a protocol violation and must halt execution.

--------------------------------
ENFORCEMENT NOTE
--------------------------------

Persona mode without this handoff packet is a circuit breaker condition.
Work must halt and return to Reasoning Contract mode.

END OF DOCUMENT