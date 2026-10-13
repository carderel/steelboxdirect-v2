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

cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel)}" || exit 0

LOG="$(mktemp -t sbd-seo-scan)"

# Job 0: the full Vitest suite. Any failure blocks the push with the tail of the run attached.
# SPEC_GUARD_DIST=require makes the spec claims guard (src/lib/compliance/spec-claims-guard.test.ts)
# check the BUILT HTML and fail when there is none, so its rendered-output pass can never be a
# silent skip at the one gate that matters. It catches figures interpolated at build time that a
# source scan cannot see: percentages, square and cubic feet, weights and door dimensions.
if ! SPEC_GUARD_DIST=require npx vitest run >"$LOG" 2>&1; then
  tail -n 60 "$LOG" >"$LOG.tail" && mv "$LOG.tail" "$LOG"
  jq -Rs '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:("PUSH BLOCKED: the Vitest suite is failing. Compliance guards (including the fact-check ledger guard) must be green before a push. Fix the cause; do not skip or weaken the guard.\n\n" + .)}}' "$LOG"
  rm -f "$LOG"
  exit 0
fi

node scripts/pre-deploy-seo-scan.mjs >"$LOG" 2>&1
STATUS=$?

deny() {
  jq -Rs --arg head "$1" \
    '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:($head + "\n\n" + .)}}' \
    "$LOG"
  rm -f "$LOG"
  exit 0
}

if [ "$STATUS" -eq 2 ]; then
  deny "PUSH BLOCKED: there is no build to review. Run npm run build, then re-run the SEO review before pushing."
fi

if [ "$STATUS" -ne 0 ]; then
  deny "PUSH BLOCKED: hidden text found in the built output. This is the defect that shipped site-wide on 2026-09-16. Remove it. Do not reimplement it with visibility:hidden, off-screen positioning, display:none or 1px text."
fi

# Clean enough to proceed. Hand the judgement calls to the review rather than pretending the scan
# settled them.
jq -Rs '{hookSpecificOutput:{hookEventName:"PreToolUse",additionalContext:("STANDING RULE, rendered-output review before push.\nThe mechanical scan found no hidden text. It does NOT clear the push on its own.\nBefore this push, an SEO agent must have reviewed the RENDERED output in dist/ for: hidden or cloaked text, above-the-fold images that are lazy-loaded, titles/H1/canonical correctness, and structured data that claims more than the visible page.\nIf that review has not happened for the current build, dispatch it now and push afterwards.\n\nScan output follows.\n\n" + .)}}' "$LOG"
rm -f "$LOG"
exit 0
