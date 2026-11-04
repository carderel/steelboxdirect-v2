#!/usr/bin/env bash
# PRE-PUSH GATE
#
# Wired as a PreToolUse hook on `git push`. Three jobs:
#
#   0. HARD BLOCK on a failing Vitest suite. The compliance guards in src/lib/compliance/ (dash,
#      HS-003, pricing, fact-check ledger, and the rest) only protect the site if a red suite
#      stops the push. The fact-check ledger guard (owner rule 2026-10-08) depends on this.
#
#   1. HARD BLOCK on hidden text in the built output. That pattern shipped on ~161 pages on
#      2026-09-16 and only an external tool caught it. It is a Google spam signal and there is no
#      legitimate version of it, so it is not a judgement call and the push simply stops.
#
#   2. REQUIRE an SEO review of the rendered output. The scan is a floor, not a review: it cannot
#      tell a lazy blog thumbnail (fine) from a lazy hero (a defect), so anything needing judgement
#      is handed to the review rather than guessed at.
#
# It scans dist/, never src/, because src/ is what everyone was already reading when the bug shipped.
# A stale or missing dist/ is itself a finding: you cannot review output you have not built.

set -uo pipefail

# Self-filter (owner-approved 2026-10-13). The settings.json `if: Bash(git push:*)` filter also
# fires on compound commands that never push (for loops, `cd x; npm run build; ...`, heredocs),
# and a red suite then blocks unrelated work. So the gate decides for itself: read the hook JSON
# from stdin and exit 0 silently unless the command actually invokes `git push` (including
# `git -C <dir> push` / `git -c k=v push`) at a command position: start, or after ; & | ( ` $( or
# a newline. Quoted strings are stripped first so `git commit -m "... git push"` does not trip it.
# Anything ambiguous (no stdin, unparseable JSON, empty command) falls through to the full gate.
# The rest of this script never reads stdin, so consuming it here changes nothing downstream.
if [ ! -t 0 ]; then
  HOOK_INPUT="$(cat)"
  CMD=""
  if command -v jq >/dev/null 2>&1; then
    CMD="$(printf '%s' "$HOOK_INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)"
  elif command -v python3 >/dev/null 2>&1; then
    CMD="$(printf '%s' "$HOOK_INPUT" | python3 -c 'import json,sys
try: print(json.load(sys.stdin).get("tool_input",{}).get("command","") or "")
except Exception: pass' 2>/dev/null)"
  elif command -v node >/dev/null 2>&1; then
    CMD="$(printf '%s' "$HOOK_INPUT" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{process.stdout.write(String((JSON.parse(s).tool_input||{}).command||""))}catch(e){}})' 2>/dev/null)"
  fi
  if [ -n "$CMD" ]; then
    # Strip single- and double-quoted strings (newlines first flattened to ';' so multi-line
    # quotes are handled and line starts count as command positions).
    STRIPPED="$(printf '%s' "$CMD" | tr '\n' ';' | sed -E "s/'[^']*'/''/g; s/\"([^\"\\\\]|\\\\.)*\"/\"\"/g")"
    PUSH_RE='(^|[;&|(`]|\$\()[[:space:]]*([A-Za-z_][A-Za-z0-9_]*=[^[:space:]]*[[:space:]]+)*(command[[:space:]]+)?git([[:space:]]+-[Cc][[:space:]]+[^[:space:]]+)*[[:space:]]+push([[:space:]]|$|[;&|)`])'
    printf '%s' "$STRIPPED" | grep -Eq "$PUSH_RE"
    # Only a clean "no match" (1) skips the gate; a grep error (2+) falls through and runs it.
    [ "$?" -eq 1 ] && exit 0
  fi
fi

# Output helpers. Every decision goes through emit(), which JSON-encodes a heading plus the
# contents of a file. jq is preferred; python3 and node are fallbacks so a host without jq (a
# bare Linux sandbox) still gets a real decision instead of an empty, silently-allowing reply.
# If no encoder exists at all, a fixed deny is printed: the gate fails closed, never open.
#   emit deny    "<heading>" <file>
#   emit context "<heading>" <file>
emit() {
  local mode="$1" head="$2" file="$3" out=""
  if command -v jq >/dev/null 2>&1; then
    if [ "$mode" = deny ]; then
      out="$(jq -Rs --arg head "$head" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:($head + "\n\n" + .)}}' "$file" 2>/dev/null)"
    else
      out="$(jq -Rs --arg head "$head" '{hookSpecificOutput:{hookEventName:"PreToolUse",additionalContext:($head + "\n\n" + .)}}' "$file" 2>/dev/null)"
    fi
  fi
  if [ -z "$out" ] && command -v python3 >/dev/null 2>&1; then
    out="$(python3 -c 'import json,sys
mode,head,path=sys.argv[1:4]
try: body=open(path,encoding="utf-8",errors="replace").read()
except Exception: body=""
key="permissionDecisionReason" if mode=="deny" else "additionalContext"
o={"hookEventName":"PreToolUse",key:head+"\n\n"+body}
if mode=="deny": o["permissionDecision"]="deny"
print(json.dumps({"hookSpecificOutput":o}))' "$mode" "$head" "$file" 2>/dev/null)"
  fi
  if [ -z "$out" ] && command -v node >/dev/null 2>&1; then
    out="$(node -e 'const [mode,head,path]=process.argv.slice(1);let body="";try{body=require("fs").readFileSync(path,"utf8")}catch(e){}
const key=mode==="deny"?"permissionDecisionReason":"additionalContext";const o={hookEventName:"PreToolUse",[key]:head+"\n\n"+body};
if(mode==="deny")o.permissionDecision="deny";process.stdout.write(JSON.stringify({hookSpecificOutput:o}))' "$mode" "$head" "$file" 2>/dev/null)"
  fi
  if [ -z "$out" ]; then
    out='{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"PUSH BLOCKED: the pre-push gate itself errored: no JSON encoder (jq, python3 or node) is available to report its result. This is a gate error, not a test result. Install jq and retry."}}'
  fi
  printf '%s\n' "$out"
}

# The gate itself broke (setup, missing tool, unwritable temp dir). Say so plainly: reporting
# this as "the Vitest suite is failing" sent the 2026-11-02 cloud routine chasing a green suite.
# It still denies the push; an unrun gate is not a passed gate.
gate_error() {
  local msg_file
  msg_file="$(mktemp "${TMPDIR:-/tmp}/sbd-gate-err.XXXXXX" 2>/dev/null)" || msg_file=""
  if [ -n "$msg_file" ]; then
    printf '%s\n' "$1" >"$msg_file"
    emit deny "PUSH BLOCKED: the pre-push gate itself errored before it could run its checks. This is a gate error, NOT a test or scan result. Fix the gate environment and retry; do not bypass the gate." "$msg_file"
    rm -f "$msg_file"
  else
    emit deny "PUSH BLOCKED: the pre-push gate itself errored before it could run its checks (and could not create a temp file to report details). This is a gate error, NOT a test or scan result. Error: $1" /dev/null
  fi
  exit 0
}

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}"
[ -n "$PROJECT_DIR" ] || gate_error "Could not determine the project directory (CLAUDE_PROJECT_DIR unset and git rev-parse --show-toplevel failed)."
cd "$PROJECT_DIR" 2>/dev/null || gate_error "Could not cd into project directory: $PROJECT_DIR"

for tool in npx node; do
  command -v "$tool" >/dev/null 2>&1 || gate_error "Required tool not found on PATH: $tool"
done

# Portable temp file: an explicit template with trailing X's works on both BSD (macOS) and GNU
# (Linux) mktemp. `mktemp -t name` without X's is BSD-only; GNU rejects it with "too few X's".
MKTEMP_ERR="$(mktemp "${TMPDIR:-/tmp}/sbd-seo-scan.XXXXXX" 2>&1)"
MKTEMP_STATUS=$?
if [ "$MKTEMP_STATUS" -ne 0 ] || [ -z "$MKTEMP_ERR" ] || [ ! -f "$MKTEMP_ERR" ] || [ ! -w "$MKTEMP_ERR" ]; then
  gate_error "mktemp failed (exit $MKTEMP_STATUS, TMPDIR=${TMPDIR:-<unset>}): $MKTEMP_ERR"
fi
LOG="$MKTEMP_ERR"

# Job 0: the full Vitest suite. Any failure blocks the push with the tail of the run attached.
# SPEC_GUARD_DIST=require makes the spec claims guard (src/lib/compliance/spec-claims-guard.test.ts)
# check the BUILT HTML and fail when there is none, so its rendered-output pass can never be a
# silent skip at the one gate that matters. It catches figures interpolated at build time that a
# source scan cannot see: percentages, square and cubic feet, weights and door dimensions.
SPEC_GUARD_DIST=require npx vitest run >"$LOG" 2>&1
VITEST_STATUS=$?
if [ "$VITEST_STATUS" -ne 0 ]; then
  tail -n 60 "$LOG" >"$LOG.tail" 2>/dev/null && mv "$LOG.tail" "$LOG"
  if [ "$VITEST_STATUS" -eq 126 ] || [ "$VITEST_STATUS" -eq 127 ]; then
    # Shell could not execute vitest at all: still a block, but name it for what it is.
    emit deny "PUSH BLOCKED: the pre-push gate could not launch Vitest (exit $VITEST_STATUS). This is a gate error, not a test result; the suite did not run. Fix the environment (npm install?) and retry." "$LOG"
  else
    emit deny "PUSH BLOCKED: the Vitest suite is failing (exit $VITEST_STATUS). Compliance guards (including the fact-check ledger guard) must be green before a push. Fix the cause; do not skip or weaken the guard." "$LOG"
  fi
  rm -f "$LOG"
  exit 0
fi

node scripts/pre-deploy-seo-scan.mjs >"$LOG" 2>&1
STATUS=$?

deny() {
  emit deny "$1" "$LOG"
  rm -f "$LOG"
  exit 0
}

if [ "$STATUS" -eq 2 ]; then
  deny "PUSH BLOCKED: there is no build to review. Run npm run build, then re-run the SEO review before pushing."
fi

if [ "$STATUS" -eq 126 ] || [ "$STATUS" -eq 127 ]; then
  deny "PUSH BLOCKED: the pre-push gate could not launch the SEO scan (exit $STATUS). This is a gate error, not a scan result; the scan did not run."
fi

if [ "$STATUS" -ne 0 ]; then
  deny "PUSH BLOCKED: hidden text found in the built output. This is the defect that shipped site-wide on 2026-09-16. Remove it. Do not reimplement it with visibility:hidden, off-screen positioning, display:none or 1px text."
fi

# Clean enough to proceed. Hand the judgement calls to the review rather than pretending the scan
# settled them.
emit context "STANDING RULE, rendered-output review before push.
The mechanical scan found no hidden text. It does NOT clear the push on its own.
Before this push, an SEO agent must have reviewed the RENDERED output in dist/ for: hidden or cloaked text, above-the-fold images that are lazy-loaded, titles/H1/canonical correctness, and structured data that claims more than the visible page.
If that review has not happened for the current build, dispatch it now and push afterwards.

Scan output follows." "$LOG"
rm -f "$LOG"
exit 0
