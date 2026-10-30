#!/bin/bash
# Release 8a.1, after the review, pass 2: the Overspend One Line variants again (own-5, the no-clear and every-step pins corrected), then the list of leaves, the changed harnesses at 4x CPU
# (under-load-1), then one discovery run of the candidate suite (affected-1). Each step only if the one before passed.
set -u
Q="/c/Users/jcrow/l5r-character-sheet-creator/Versions/QA — Release 8a.1 2026-10-30/qa"
cd "$Q"
export NODE_PATH='C:/Users/jcrow/l5r-qa-tools/node_modules' PYTHONUTF8=1
# The installed-Chrome preload for every harness (own-3 lacked it: no browser launched, no check ran).
export NODE_OPTIONS='--require "C:/Users/jcrow/l5r-character-sheet-creator/Versions/QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js"'
mkdir own-5 || exit 1
python -B "$Q/../../BUGFIX — Overspend One Line/qa/verify-variants.py" > "own-5/variants-Overspend One Line.log" 2>&1 || { echo "own-5 failed"; exit 1; }
SHEET="$Q/../../Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html"
NODE_OPTIONS='--require "C:/Users/jcrow/l5r-character-sheet-creator/Versions/QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js"' \
  "/c/Program Files/nodejs/node.exe" flat-suite-runner.js "$SHEET" --list > list.json 2> list.err; grep -q "\"leaves\"" list.json || { echo "list failed"; exit 1; }
python -B run-under-load.py under-load-1 > under-load-1.out 2>&1 || { echo "under load failed"; exit 1; }
python -B discovery.py affected-1 > affected-1.out 2>&1 || { echo "discovery failed"; exit 1; }
echo "ALL PASSED"
