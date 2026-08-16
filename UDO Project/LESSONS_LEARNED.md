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

### L001. Always check UDO first
**Date:** 2026-05-25  
Before deciding how to handle any situation (execution approach, compliance gaps, agent usage, mode selection) check what the UDO protocol already specifies. Do not improvise, offer options, or ask the user when ORCHESTRATOR.md has already answered the question. UDO is the operating system; consult it before acting.

### L002. Orchestrator does ZERO execution work
**Date:** 2026-07-02  
The orchestrator (The Architect) orchestrates; it does not do the work. NEVER run project builds, start dev servers, run test/verify commands, or Write/Edit project source yourself. ALL execution (implementation AND its verification, including environment setup like starting the dev server) is delegated to subagents. The orchestrator's ONLY hands-on actions are coordination + the audit trail (session logs, checkpoints, decisions, memory, PROJECT_STATE, this file). If a step touches the product or its build, dispatch a subagent. "Always subagent." (User correction, 2026-07-02.)

### L003. Verify the verification command before trusting a PASS
**Date:** 2026-08-07
On macOS the shell uses BSD grep, where `\|` is NOT alternation. A hard-stop check that puts both dash characters into one BRE pattern joined by a backslash-pipe
silently searches for that whole sequence as a literal string, finds nothing, and reports a clean
PASS no matter what the file contains. This produced a false PASS on HS-OUT-001 during the
2026-08-05 cycle; a correct re-check found 5 em dashes in the session log and 8 in the transcript.
Use one pattern per character (a single-character `grep -o` piped to `wc -l`, run once for U+2014
and once for U+2013), or `grep -E`, or a Python check. A
verification step that cannot fail is not a verification step. Applies to every compliance grep,
not just dashes.

### L004. A UDO version migration can move the folders and lose the identity
**Date:** 2026-08-07
The v2.2 migration into `UDO Project/` created the full directory tree but left
`PROJECT_STATE.json` as a fresh scaffold (project_id "placeholder-project-id", empty goal) and
`PROJECT_META.json` entirely empty, with `TOPICS.md` unregistered. The folders existing is not
evidence the content survived. After any upgrade, explicitly diff the identity fields
(project_id, goal, owner, created, repository) against the prior install before starting work.
Orientation caught this only because START_HERE mandates reading state before doing anything.

### L005. A content hard stop and a byte-identical sync rule cannot both hold
**Date:** 2026-08-07
HS-OUT-001 forbids em and en dashes in "any output, deliverable, or committed file." The agent-sync
step treats `UDO Project/.agents/` as source of truth and generates harness copies in
`.claude/agents/`, with `validate.py` flagging drift between them. Seven source agent files
(content-writer, frontend-designer, seo-analyst, strategy-analyst, verifier, astro-developer, and
stuck via box-drawing glyphs) contain those characters, predating the hard stop. The sync therefore
cannot produce copies that are both dash-clean and byte-identical. The 2026-08-07 sync chose
dash-clean and rewrote the characters, so the generated copies are semantically identical but will
report as drifted under any hash or diff based check. Resolve it at the source (clean the
`.agents/` files once, which also brings them into hard-stop compliance) rather than per sync, and
remember that a generated artifact inherits every constraint the generator is under. Any rule that
says "copy exactly" and any rule that says "never contain X" will collide the moment a source
contains X.

### L006. Version numbers do not always increase
**Date:** 2026-08-07
UDO renumbered downward: the legacy v4.x line was superseded by the v2.0 rewrite, so v2.2 is NEWER
than v4.5. `PROJECT_META.json` carried 4.5 for two days after migration and read as "ahead of" the
framework's 2.2 to every agent that looked at it, when it was actually two major generations behind.
The migration script preserved the field verbatim by design. Never infer recency from a version
comparison alone; find the release history (here, root `README.md`) and confirm the ordering before
concluding which artifact is stale.

### L007. A stored evidence packet rots in predictable places: identifiers first, structure last
**Date:** 2026-08-10
Re-verifying the 2026-08-07 container-shelter packet before an owner decision (HS-EVID-001) found the
failures were not randomly distributed. Everything transcribed from an outside surface had degraded:
the SKU was flatly wrong ("CSB-C" is a base rail clamp, not the shelter kit), the price band was
contradicted by the vendor's own current page, and a Grade D "no formal program" caveat was refuted by a
live public affiliate program. Everything describing artifacts under our own control was still true and
in two cases understated: the farmers page really does concede its own argument, and it does so three
times rather than once. The rule that follows: when re-verifying a packet under time pressure, spend the
budget on the load-bearing identifiers (SKUs, prices, URLs, program terms, vendor claims) and treat
structural findings about our own repo as durable. The false SKU here was two steps from being published
as fact. Also note the second-order lesson: a git-based audit is blind to untracked files, which is how
`the-cheap-container-that-wasnt.md` read as "new" when its mtime predated the prior audit by eleven days.
Check mtime, not just `git status`, before calling a file new.

### L008. Verify a compliance claim about existing copy before writing a new rule that contradicts it
**Date:** 2026-08-10
The T-015 publish gates were written to forbid classifying a roofed two-container assembly as personal
property or as a building, consistent with the recorded permit-is-the-buyer's-responsibility stance. The
drafting pass then found that `src/pages/for/farmers/index.astro` line 122 already asserts the container
"stays classified as personal property" and avoids "a permanent-structure review or a reassessment of
your land," with line 166 repeating it in the comparison table directly above the paragraph being
edited. The new guardrail and the live page contradict each other, and the contradiction would have
rendered a few inches apart on the same screen. Writing a guardrail is not the same as auditing whether
existing copy already violates it. Any new content rule should trigger a grep for prior violations of
that same rule in the surface it governs, before the rule is applied to new work only.

### L009. A verification step can fail falsely, not just pass falsely, and mixing metrics is how
**Date:** 2026-08-10
L003 covered the false PASS: a check that cannot fail is not a check. This is the mirror case. The businesses
rework draft included its own post-paste guard: "expect the U+2014 count to fall from 39 to 29, ten removed. If
the post-paste count is not exactly 29, a replacement was pasted incompletely." That subtracts an OCCURRENCE
count (10, from `grep -o | wc -l`) from a LINE count (39, from `grep -c`). The two are not interchangeable
whenever any single line carries more than one match, and here old line 143 carried three em dashes by itself.
The correct values are 43 occurrences (53 minus 10) and 31 lines (39 minus 8), both of which the integrating
agent measured and matched exactly. Applying the draft's check literally would have reported a failed paste
when the paste was perfect, and the likely response to that false alarm is to "fix" correct work. Two rules
follow. First, never mix `grep -c` and `grep -o | wc -l` in one piece of arithmetic; state which metric a
threshold refers to. Second, when an agent hands forward a self-check with expected numbers, those numbers are
a claim that needs verifying like any other, not a spec to be obeyed. Related: [[L003]].

### L010. Case-sensitive spot-checks produce false reassurance
**Date:** 2026-08-10
While relaying a subagent finding that a named vendor appeared at two locations in a file, the orchestrator ran
`grep -n "iContainers"` as an independent check, found one hit, and told the owner to treat the second location
as unverified. The second location was real: it is the URL `icontainers.com`, lowercase, which a
case-sensitive pattern cannot match. The agent was right and the spot-check was wrong, in the direction that
reports less risk than actually exists. Any grep used to CONFIRM OR REFUTE a subagent's finding needs `-i`
unless case is genuinely load-bearing, and a single-pattern check that disagrees with a thorough agent is more
likely to be the flawed instrument than the flawed finding. Same family as [[L003]] and [[L009]]: the
verification tool was the defect, not the thing under verification.

### L011. Check an agent's tool grant against the brief before dispatching, in both directions
**Date:** 2026-08-11
Twice in one session the orchestrator wrote a brief that did not match the agent's actual capabilities, and the
two errors were mirror images. First, `data-auditor` was told to return a large violation inventory as response
text and NOT write a file, so a 12-item audit with line numbers and schema traces would have died with the
context window; the orchestrator had to transcribe it afterward at Grade B. Then `seo-analyst` was told to write
its report to `.outputs/`, but that agent is granted Read, Grep, and Glob only, with no Write and no Bash, so it
could neither write the file nor run the build the brief also requested; it returned everything as text and the
orchestrator transcribed again. Both transcriptions are lossy by definition and both were avoidable by reading
`.agents/<name>.md` before writing the brief. This is not a new discovery: PROJECT_STATE notes from 2026-08-07
already recorded that the `verifier` agent claims screenshot validation with no Playwright tools and that
`seo-analyst` requires citations with no web tools. The charter-versus-grant mismatch was a known open item and
the orchestrator walked into it anyway. Rule: before dispatch, confirm the agent can perform every verb in the
brief (write, run, fetch, screenshot), and if it cannot, either pick a different agent or state explicitly that
the deliverable is a return value that the orchestrator will persist. Related: [[L009]].

### L012. A "more realistic" instrument can be blind where a cruder one sees
**Date:** 2026-08-11
The owner checked whether a partner's affiliate link set a cookie, using a browser plugin, and reported none. I
endorsed that over a header inspection on the reasoning that a real browser executes JS and follows redirects
exactly as a customer would, so it must be the stronger evidence. **That inverted for this specific question.**
The cookie was `fc-rep=doug` with the `HttpOnly` flag, whose entire purpose is to make a cookie unreadable from
JavaScript. Any check that reads `document.cookie` is GUARANTEED to report absence, and affiliate cookies are
almost always `HttpOnly`. A raw header dump sees it; the more lifelike instrument cannot. I then compounded the
error by sending the running agent a mid-task correction instructing it to treat the question as settled in the
no-cookie direction; **it formally rejected the correction with the header reproduced three times, which is the
only reason the error did not propagate into a commercial decision.** Two rules. First, before ranking two
instruments, ask what each one is structurally incapable of seeing, because "closer to the real user experience"
is not the same as "more capable." Second, when an agent pushes back on a correction with direct evidence,
that is the system working; do not treat compliance as the expected response. Related: [[L009]], [[L010]] and
[[L011]] are the same family, the instrument being the defect rather than the thing measured, and this is the
fourth instance in one session.

### L013. Priority stops being information when everything is high
**Date:** 2026-08-11
`PROJECT_STATE.json` ended this session with 104 todos of which **55 are marked high priority.** More than half.
I wrote most of them, marking each genuinely-important item high at the moment I logged it, which is locally
correct and globally useless: a future session reading state cannot triage, because "high" no longer
discriminates. The failure is not that the items are unimportant, it is that priority was assigned per-item
instead of relative to the list. Two fixes for next session, and the first is cheap. **Re-rank against a cap:
allow no more than roughly seven high items at once, and demote the rest to normal with their reasoning intact
so nothing is lost.** And when logging a new item, ask whether it belongs above something already marked high
rather than whether it feels important on its own. Same class of problem as an unmaintained directory: the
artifact keeps working mechanically while quietly ceasing to serve its purpose.

### L014. Stamp real times or none at all
**Date:** 2026-08-11
Across this session I wrote `last_updated` timestamps into `PROJECT_STATE.json` and headings into the transcript
by incrementing plausibly rather than reading the clock. By the end, state claimed `2026-08-12T00:30:00Z` when
the real time was `2026-08-11T16:49Z`, roughly eight hours ahead and a calendar day wrong. Nothing downstream
broke, but the audit trail exists so a future session can reconstruct what happened when, and a fabricated
timestamp silently destroys that. It also interacts badly with the HS-UDO-012 midnight-rollover rule, which
keys transcript filenames to a session-start date: drifting stamps make it impossible to tell a real rollover
from an invented one. Rule: read the clock (`date -u`) before writing any timestamp into a durable artifact, or
omit the time and write only the date. Never interpolate.

### L015. A verification command can be scoped wrong as well as patterned wrong, and the scope error is quieter
**Date:** 2026-08-11
L003 established that a check which cannot fail is not a check, and blamed the PATTERN (BSD grep treating
`\|` as a literal). Two new mechanisms found in one audit, both of which produce a clean PASS while measuring
**the wrong bytes** rather than the wrong string, and neither is caught by fixing the pattern.

**First, zsh does not word-split unquoted parameter expansion.** A verifier building a path list as
`FOUR="a b c d"` and running `git diff HEAD -- $FOUR` handed git ONE bogus pathspec. Git returned an
**empty diff with exit 0**, and the dash greps over that empty input returned 0 and 0. A textbook false PASS,
produced on the correct pattern over no data. It was caught only because a single-path `--stat` contradicted
the empty result. Reproduced independently by the orchestrator. Note the asymmetry that makes this dangerous:
the same shell fails LOUDLY on `grep --include=*.astro` ("no matches found") but SILENTLY here. Fix: pass
pathspecs as explicit arguments, or `tr '\n' '\0' | xargs -0`. Never through an unquoted variable.

**Second, `git diff HEAD` cannot see untracked files, so a diff-based "added side" metric can omit most of
the change.** Measuring the full 22-path commit this way covered 641 lines and silently skipped the untracked
1,403-line guard test, which is **69 percent of the 2,044 added lines**. The file was the single largest thing
being committed and the measurement did not know it existed. Fix: enumerate untracked paths separately and
treat their entire contents as added.

**The generalisation, which is the point.** Before trusting any verification number, ask what the command was
actually pointed at, not just what it searched for: did it receive the paths you think it did, did it cover
untracked as well as tracked, is the working tree the state you mean, and did an empty input masquerade as a
clean result. **An empty input and a clean result are indistinguishable in the output.** So a check should
report the size of what it examined (line counts, file counts) alongside its findings, because a scope error
shows up as a suspiciously small denominator and shows up nowhere else.

This is the fifth and sixth instance in two sessions of the instrument being the defect rather than the thing
measured. Related: [[L003]] (wrong pattern), [[L009]] (mixed metrics), [[L010]] (case sensitivity),
[[L012]] (structurally blind instrument), and T-114 (a detector that skips a whole class before evaluating it).
The family is now large enough to be a standing habit rather than a list of anecdotes: **every verification
result needs its denominator stated.**

### L016. The compliance guard reads source literals, so where you wrap a line can create a violation the page does not have
**Date:** 2026-08-14
Found during the guides-hub build. A permits answer was written across two concatenated string literals, breaking
between `"...we do not determine, advise on, or "` and `'guarantee permit outcomes. ...'`. The suite failed with a
third HS003 finding: `[ATOMIC SURFACE] matched: permit + guarantee`.

**The rendered output was byte-identical.** Only the source wrap changed.

**Why it happens, traced in the guard rather than guessed:** `hs003-content-guard.test.ts` extracts **each quoted
string literal in frontmatter as its own text unit**, and any unit under 120 characters is treated as ATOMIC,
meaning the deferral must appear in the same unit as the claim. Splitting a sentence across two literals strands
the deferral in the previous one, so the fragment beginning "guarantee permit outcomes" reads as a bare topic plus
determination with no hedge attached.

**This is a different failure from every dash and grep lesson.** Those were bad instruments measuring the right
thing. This is a correct instrument measuring **the source form rather than the published form**, and being right
to: PROJECT_HS_003's whole premise is that atomic surfaces strip surrounding context, and a string literal is
exactly such a surface once anything consumes it individually.

**Rules that follow.** Never let a hand-wrapped or concatenated string split a claim from its deferral, anywhere
under `src/pages`, `src/components`, `src/layouts` or `src/data`. Keep "who decides" and "we do not determine" in
the same literal as the topic they qualify. And when the guard reports a finding whose quoted sentence looks
truncated or starts mid-clause, suspect the wrap before suspecting the copy. The related trap is the mirror image
and also live: a hand-written unicode escape in a test can land as a literal em dash, so the file forbidding the
character contains it. **Grep every file immediately after writing it rather than trusting the source text you
think you wrote.** Related: [[L009]], [[L015]], and T-114, which records that the same guard cannot see a flat
unhedged assertion at all.

### L017. A deliberately red test hides the difference between its findings, and "draft" does not mean "not deployed"
**Date:** 2026-08-14
Two findings sat inside the HS003 guard for four days, reserved for owner judgment and recorded as T-036. The
suite reported "1 failing, 2 findings" for four days and everyone, including this orchestrator, learned to read
that as the healthy state and moved on. **The two findings were not equivalent.**

`sample-container-vs-pole-barn.md` does not render a page. `wind-and-water-tight-explained.md:46` builds to a
live URL and **had been publicly served since 2026-07-06** carrying "the frame, corner posts, and floor can still
carry a load", a class 6 structural determination. A published violation spent four days camouflaged as half of
an expected number.

**Two rules follow, and the second is the surprising one.**

**A tolerated failure must be itemised, not counted.** "2 findings" is not a state, it is a sum. The moment a test
is allowed to stay red, every finding inside it needs its own status, because the aggregate hides which ones are
live. If the reason for tolerating them differs (one is a draft, one is published), they are not one item.

**And `draft: true` does not mean the content is not deployed.** Verified rather than assumed: the draft post's
compiled content ships into the Cloudflare worker bundle at `dist/_worker.js/chunks/`, three chunks of it, even
though no HTML page renders. So draft content reaches production assets and is subject to the same content rules
as published copy. This is independent support for the guard's existing `SCAN_DRAFT_POSTS = true` setting, and a
standing argument against any future proposal to scan only published content in order to keep a gate green.

> **CORRECTION, 2026-08-16. THE PARAGRAPH ABOVE IS WRONG, AND IT IS LEFT STANDING ON PURPOSE SO THE ERROR IS
> LEGIBLE RATHER THAN QUIETLY EDITED AWAY.** An independent pre-push verifier re-checked it against a clean
> `rm -rf dist && npm run build` and refuted it. The three chunks do exist by name, in
> `dist/_worker.js/manifest_CSy0WTIG.mjs` and on disk, which is what the 08-14 check saw. **But each one is 63
> bytes and contains only the string `// Contents removed by Astro as it's used for prerendering only`.** The
> post's title, its description and its body prose appear NOWHERE in `dist`. The only thing that leaks is the
> slug inside the manifest. The safety margin is wider still on the real deploy: this build had the draft
> present on disk, whereas Cloudflare builds a clean checkout where the file does not exist at all, so the
> stubs are never generated.
>
> **What actually went wrong on 08-14 was the instrument, again, which makes this the same family as L003, L009,
> L010 and L016.** The check confirmed that three chunks bearing the slug EXISTED. It did not open them. Presence
> of a named artifact was read as presence of its content, and the conclusion inherited a confidence the evidence
> never supported. The correct instrument was one `wc -c` or one `cat`.
>
> **What survives the correction:** keep `SCAN_DRAFT_POSTS = true` anyway. The reason is now different and
> weaker, so state it honestly rather than leaning on a refuted one. Drafts get published, usually by flipping a
> single frontmatter field with no re-review, so scanning them catches a violation before the flip rather than
> after. That is a good reason. "The bytes are already on the CDN" was a better one, and it is not true.
>
> **What does NOT survive:** do not cite this lesson as proof that draft content reaches production assets. It
> does not. Anyone re-deriving that claim should open the chunks first.

**Consequence worth acting on:** with both findings closed the guard runs clean, so T-036's stated reason for not
wiring it to the build ("it is legitimately red") no longer exists. That is now a decision rather than a
dependency. Related: [[L016]], and T-114, which records that this same guard cannot see a flat unhedged assertion
at all, so green means "no detectable violation" rather than "compliant".

---

## Archived Lessons

| ID | Title | Graduated To | Date |
|----|-------|--------------|------|
