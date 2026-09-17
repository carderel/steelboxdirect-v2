#!/usr/bin/env bash
# PRE-PUSH GATE
#
# Wired as a PreToolUse hook on `git push`. Two jobs:
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
cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel)}" || exit 0

LOG="$(mktemp -t sbd-seo-scan)"
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
