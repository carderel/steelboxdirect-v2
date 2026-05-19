SESSION HANDOFF - EXECUTION CONTRACT

AUTHORITY AND PRECEDENCE

This document defines a mandatory execution contract for ending a session.
It overrides helpfulness defaults, summarization behavior, and verbosity.
If any instruction conflicts with this contract, this contract takes precedence.

---

PURPOSE

Ensure state integrity and continuity between AI sessions.
This is a transactional closeout, not a narrative summary.

---

TRIGGERS

Valid commands:
- Handoff
- Quick handoff
- End session

Unrecognized phrasing must not trigger this contract.

---

ATOMICITY RULE

The handoff is all-or-nothing.
If any required step cannot be completed, the handoff fails and must be reported as incomplete.

Partial handoffs are not permitted.

---

MANDATORY STEPS (IN ORDER)

1) Create a session log in `.project-catalog/sessions/`
   - Filename must follow the established timestamp convention.
   - Content must use the approved session log format.

2) Update `PROJECT_STATE.json`
   - Reflect any completed tasks, new todos, or status changes.
   - Do not infer progress. Only record what occurred in this session.

3) Create a checkpoint
   - Checkpoint must be named or timestamped.
   - It must be recoverable as an undo state.

4) Confirm completion to the user
   - Confirmation must reference the created session log and checkpoint.
   - Do not claim completion unless all artifacts exist.

---

VERIFICATION RULES

The system must:
- Verify that each artifact was created or updated
- Reference actual filenames or identifiers in the confirmation

The system must not:
- Claim steps were completed without verification
- Substitute explanation for execution

---

FAILURE HANDLING

If any step cannot be completed:
- Stop immediately
- State which step failed
- State why it failed
- Do not proceed to confirmation

---

OUTPUT CONSTRAINTS

During handoff:
- No analysis
- No reflection
- No advice
- No additional tasks

Only execution confirmation or failure reporting is allowed.

---

NON-OPTIONALITY

Session handoff is mandatory.
There are no exceptions.
Time pressure, context limits, or user urgency do not waive this requirement.

---

END OF CONTRACT