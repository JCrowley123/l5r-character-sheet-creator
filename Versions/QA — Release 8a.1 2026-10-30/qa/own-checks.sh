#!/bin/bash
# Release 8a.1: every own check in one pass, in order, each logged; the next starts whatever the last did.
# Usage: bash own-checks.sh <folder name>  (fresh folder only)
set -u
V=/c/Users/jcrow/l5r-character-sheet-creator/Versions
Q="$V/QA — Release 8a.1 2026-10-30/qa"
OUT="$Q/$1"; mkdir "$OUT" || exit 1
export NODE_PATH='C:/Users/jcrow/l5r-qa-tools/node_modules' PYTHONUTF8=1
export NODE_OPTIONS='--require "C:/Users/jcrow/l5r-character-sheet-creator/Versions/QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js"'
python -B "$Q/run-own.py" "$1/own" "BUGFIX — Overspend One Line/qa/one-line-harness.js" "BUGFIX — Free Choice Note Clears/qa/free-choice-harness.js" \
  "BUGFIX — Wizard Overspend Warns/qa/overspend-warns-harness.js" "BUGFIX — Apply School Skill Rows/qa/school-skill-rows-harness.js" \
  "PART K — Phase 11.2.1 Wizard Skills and Advantages/qa/wizard2-harness.js" "PART K — Phase 11.2 Creation Wizard/qa/wizard-harness.js" \
  "PART K — Phase 11.2.2 Wizard Free Choices Spells and Kiho/qa/wizard3-harness.js" > "$OUT/own.out" 2>&1; echo "own exit $?" >> "$OUT/summary.txt"
for L in "BUGFIX — Overspend One Line" "BUGFIX — Free Choice Note Clears"; do
  python -B "$V/$L/qa/verify-variants.py" > "$OUT/variants-${L##* — }.log" 2>&1; echo "variants $L exit $?" >> "$OUT/summary.txt"
  python -B "$V/$L/qa/test-removal.py" > "$OUT/removal-${L##* — }.log" 2>&1; echo "removal $L exit $?" >> "$OUT/summary.txt"
done
python -B "$V/BUGFIX — Overspend One Line/qa/xw8-variants-ol8-off.py" > "$OUT/xw8-variants-ol8-off.log" 2>&1; echo "xw8 variants ol8 off exit $?" >> "$OUT/summary.txt"
python -B "$V/BUGFIX — Free Choice Note Clears/qa/xw8-variants-off-8a1.py" > "$OUT/wizard-variants-xw8-off.log" 2>&1; echo "wizard variants xw8 off exit $?" >> "$OUT/summary.txt"
echo done >> "$OUT/summary.txt"
