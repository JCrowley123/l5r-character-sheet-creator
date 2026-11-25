#!/bin/sh
# Runs a Node script with the project's QA environment (kickoff §9). Usage: run.sh script.cjs [args]
# The two preloads are found relative to the repository root, so this works from any worktree.
ROOT="$(cd "$(dirname "$0")" && while [ ! -f build.py ]; do cd ..; done; pwd)"
export NODE_PATH=C:/Users/jcrow/l5r-qa-tools/node_modules PLAYWRIGHT_BROWSERS_PATH=C:/Users/jcrow/l5r-qa-tools/ms-playwright PYTHONUTF8=1
unset NODE_OPTIONS
exec node --require "$ROOT/Versions/PART K — Phase 14.2 Kata and Kiho References/qa/navigation-budget.cjs" --require "$ROOT/Versions/Part F — Cross-Platform Delivery/PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs" "$@"
