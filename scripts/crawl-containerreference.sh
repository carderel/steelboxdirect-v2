#!/bin/bash
# Biweekly Screaming Frog crawl of https://containerreference.com/ (competitor).
# Scheduled weekly by launchd (com.steelboxdirect.crawl-containerreference);
# skips if the last successful crawl is < MIN_AGE_DAYS old, giving a ~2-week cadence.
# Usage: crawl-containerreference.sh [--force]
set -uo pipefail

URL="https://containerreference.com/"
BASE="/Users/flackfizer/Documents/Projects/Container-Site/competitors/containerreference"
SF="/Applications/Screaming Frog SEO Spider.app/Contents/MacOS/ScreamingFrogSEOSpiderLauncher"
LOG="$BASE/crawl.log"
STAMP="$BASE/.last-success"     # epoch seconds of last successful crawl
MIN_AGE_DAYS=13
TABS="Internal:All,Response Codes:All,Page Titles:All,Meta Description:All,H1:All,Directives:All"

mkdir -p "$BASE"
now=$(date +%s)
ts() { date '+%Y-%m-%d %H:%M:%S'; }

if [[ "${1:-}" != "--force" && -f "$STAMP" ]]; then
  last=$(cat "$STAMP" 2>/dev/null || echo 0)
  age_days=$(( (now - last) / 86400 ))
  if (( age_days < MIN_AGE_DAYS )); then
    echo "$(ts)  SKIP  last success ${age_days}d ago (<${MIN_AGE_DAYS}d)" >> "$LOG"
    exit 0
  fi
fi

[[ -x "$SF" ]] || { echo "$(ts)  FAIL  Screaming Frog launcher not found" >> "$LOG"; exit 2; }

OUT="$BASE/$(date +%Y-%m-%d)"
# Never overwrite an existing run's folder.
[[ -e "$OUT" ]] && OUT="$OUT-$(date +%H%M%S)"
mkdir -p "$OUT"

"$SF" --headless --crawl "$URL" \
  --output-folder "$OUT" \
  --save-crawl \
  --export-format csv \
  --export-tabs "$TABS" \
  --task-name "containerreference $(date +%Y-%m-%d)" \
  --project-name "containerreference" 2>&1 \
  | /usr/bin/sed -E 's/("(licence_key|username|signature)":")[^"]*/\1REDACTED/g' > "$OUT/sf-run.log"
rc=${PIPESTATUS[0]}

csv="$OUT/internal_all.csv"
crawlfile=$(ls "$OUT"/*.seospider "$OUT"/*.dbseospider 2>/dev/null | head -1)
size=$(du -sh "$OUT" 2>/dev/null | cut -f1 | tr -d ' ')

if (( rc != 0 )) || [[ ! -s "$csv" ]] || [[ -z "$crawlfile" ]]; then
  echo "$(ts)  FAIL  rc=$rc csv=$([[ -s $csv ]] && echo ok || echo missing) crawlfile=${crawlfile:+ok}${crawlfile:-missing} folder=$OUT size=${size:-0}" >> "$LOG"
  exit $(( rc != 0 ? rc : 3 ))
fi

urls=$(/usr/bin/python3 -c 'import csv,sys; print(sum(1 for _ in csv.reader(open(sys.argv[1], encoding="utf-8-sig")))-1)' "$csv" 2>/dev/null \
       || echo $(( $(wc -l < "$csv") - 1 )))
echo "$now" > "$STAMP"
echo "$(ts)  OK    urls=$urls folder=$(basename "$OUT") size=$size" >> "$LOG"
exit 0
