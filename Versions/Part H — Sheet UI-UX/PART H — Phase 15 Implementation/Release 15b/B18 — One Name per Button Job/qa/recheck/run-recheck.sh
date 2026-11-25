#!/bin/sh
# B18 re-check (25 November 2026): the stage-1 inventory pipeline, unchanged, on the tree this file sits in.
# Usage: sh run-recheck.sh <out folder>   (about 8 minutes; one browser job at a time)
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$HERE"; while [ ! -f "$ROOT/build.py" ]; do ROOT="$(dirname "$ROOT")"; done
cd "$ROOT"
B18="$HERE/../inventory"
OUT="$1"
mkdir -p "$OUT"
date -u +%FT%TZ > "$OUT/started.txt"
sh "$B18/run.sh" "$B18/scan.cjs" "$OUT/scan" phone,laptop management,play > "$OUT/scan.log" 2>&1
sh "$B18/run.sh" "$B18/scan-hidden.cjs" "$OUT/hidden" > "$OUT/hidden.log" 2>&1
python -X utf8 -I "$B18/static_scan.py" "$OUT/static.json" > "$OUT/static.log" 2>&1
python -X utf8 -I "$B18/dialog_labels.py" "$OUT/dialogs.json" > "$OUT/dialogs.log" 2>&1
python -X utf8 -I "$B18/merge.py" "$OUT/scan/raw.json" "$OUT/static.json" "$B18/jobs.py" "$OUT/table.json" "$OUT/dialogs.json" "$OUT/hidden/hidden.json" > "$OUT/merge.log" 2>&1
python -X utf8 -I "$HERE/compare.py" "$B18/data/table.json" "$OUT/table.json" "$OUT/compare.json" > "$OUT/compare.log" 2>&1
date -u +%FT%TZ > "$OUT/finished.txt"
