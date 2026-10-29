#!/bin/bash
# Release 7b.2, after the review: rebuild, pin the candidate hash, recompute the restore points, then rerun the three
# layers' own checks, R23's variants, the removal tests, the two edited older harnesses, and R23 at 4x CPU.
set -u
V=/c/Users/jcrow/l5r-character-sheet-creator/Versions
P="$V/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability"
S="C:/Users/jcrow/AppData/Local/Temp/claude/C--Users-jcrow-OneDrive-Documents-L5R-character-sheet-creator/2247bf15-fa27-401a-8a38-58f7e201d1f8/scratchpad"
OUT="$V/QA — Release 7b.2 2026-10-29/qa/after-review"
mkdir "$OUT" || exit 1
export PYTHONUTF8=1 NODE_PATH='C:/Users/jcrow/l5r-qa-tools/node_modules' NODE_OPTIONS='--require "C:/Users/jcrow/l5r-character-sheet-creator/Versions/QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js"'
NODE="/c/Program Files/nodejs/node.exe"
FAST="$V/Part F — Cross-Platform Delivery/PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs"
SHEET="$P/l5r-character-sheet.html"
cd "$P" || exit 1
SHA=$(python build/recombine.py | sed -n 's/^sha256 : //p')
python - "$SHA" <<'PYEOF'
import re, sys
from pathlib import Path
p = Path('build/manifest.json'); t = p.read_text(encoding='utf-8')
p.write_bytes(re.sub(r'("expect_sha256"\s*:\s*")[0-9a-f]{64}(")', lambda m: m.group(1) + sys.argv[1] + m.group(2), t, count=1).encode('utf-8'))
PYEOF
python build/recombine.py --verify > "$OUT/build.log"; cat "$OUT/build.log"
python "$S/restore_points.py" | tee "$OUT/restore-points.log"
BK=$(sed -n 's/^BUGFIX — Instigator Blackmail Count -> \([0-9a-f]*\) \([0-9]*\).*/\1 \2/p' "$OUT/restore-points.log")
SH=$(sed -n 's/^BUGFIX — Station and Shapeshifter Reference Entries -> \([0-9a-f]*\) \([0-9]*\).*/\1 \2/p' "$OUT/restore-points.log")
SR=$(sed -n 's/^BUGFIX — Advantage Set Rules -> \([0-9a-f]*\) \([0-9]*\).*/\1 \2/p' "$OUT/restore-points.log")
python "$S/make_removal_tests.py" $BK $SH $SR
for L in "BUGFIX — Advantage Set Rules:set-rules-harness.js" "BUGFIX — Station and Shapeshifter Reference Entries:station-reference-harness.js" "BUGFIX — Instigator Blackmail Count:instigator-harness.js"; do
  D="${L%%:*}"; H="${L##*:}"; cd "$V/$D/qa"
  "$NODE" --require "$FAST" "$H" "$SHEET" > own.log 2>&1; echo "$D own: $(tail -1 own.log)"
  python test-removal.py > removal.log 2>&1; echo "$D removal: $(tail -1 removal.log)"
done
cd "$V/BUGFIX — Advantage Set Rules/qa" && rm -rf negative && python verify-variants.py > negative.log 2>&1; echo "R23 variants: $(tail -1 negative.log)"
for H in "PART I — Phase 4.5.37 Supplement Advantages and Disadvantages/qa/supplement-harness.js" "PART I — Phase 4.7 Advanced Schools/qa/advanced-schools-harness.js"; do
  cd "$(dirname "$V/$H")"; "$NODE" --require "$FAST" "$(basename "$H")" "$SHEET" > "$OUT/$(basename "$H").log" 2>&1; echo "$H: $(grep -E '[0-9]+/[0-9]+ checks passed' "$OUT/$(basename "$H").log" | tail -1)"
done
cd "$V/BUGFIX — Advantage Set Rules/qa" && L5R_CPU_RATE=4 "$NODE" --require "$FAST" --require "$V/QA — Cycle 7a Device Follow-up 2026-10-27/qa/cpu-throttle.cjs" set-rules-harness.js "$SHEET" > "$OUT/set-rules.cpu4.log" 2>&1; echo "R23 at 4x CPU: $(tail -1 "$OUT/set-rules.cpu4.log")"
cd "$V/PART I — Phase 4.5.37 Supplement Advantages and Disadvantages/qa" && L5R_CPU_RATE=4 "$NODE" --require "$FAST" --require "$V/QA — Cycle 7a Device Follow-up 2026-10-27/qa/cpu-throttle.cjs" supplement-harness.js "$SHEET" > "$OUT/supplement.cpu4.log" 2>&1; echo "4.5.37 at 4x CPU: $(grep -E '[0-9]+/[0-9]+ checks passed' "$OUT/supplement.cpu4.log" | tail -1)"
