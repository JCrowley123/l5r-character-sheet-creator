#!/bin/sh
# Release 15b group 2: the group's four own harnesses, one at a time, on one build, with the suite's two preloads.
#   sh own-run.sh <sheet.html> <log folder>
# Writes one log per harness, sha256.txt and summary.txt (one line per harness). Light checks only.
export NODE_PATH=C:/Users/jcrow/l5r-qa-tools/node_modules PLAYWRIGHT_BROWSERS_PATH=C:/Users/jcrow/l5r-qa-tools/ms-playwright PYTHONUTF8=1
unset NODE_OPTIONS
SHEET="$1"; OUT="$2"
HERE=$(cd "$(dirname "$0")" && pwd)
R15B="$HERE/../.."
V="$R15B/../../.."
mkdir -p "$OUT"; OUT=$(cd "$OUT" && pwd)
sha256sum "$SHEET" | cut -d' ' -f1 > "$OUT/sha256.txt"
: > "$OUT/summary.txt"
for h in "B01 — Check Buttons Named for What They Do/qa/check-names-harness.js" \
         "B03 — Lead an Ally/qa/lead-an-ally-harness.js" \
         "B05 — You Remain in Control/qa/remain-in-control-harness.js" \
         "B09 — Skill Picker Traits from the Final List/qa/picker-traits-harness.js"; do
  name=$(basename "$h" .js)
  (cd "$R15B/$(dirname "$h")" && node --require "$V/PART K — Phase 14.2 Kata and Kiho References/qa/navigation-budget.cjs" \
    --require "$V/Part F — Cross-Platform Delivery/PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs" \
    "$(basename "$h")" "$SHEET" > "$OUT/$name.log" 2>&1)
  echo "$name $(tail -1 "$OUT/$name.log")" >> "$OUT/summary.txt"
done
cat "$OUT/summary.txt"
