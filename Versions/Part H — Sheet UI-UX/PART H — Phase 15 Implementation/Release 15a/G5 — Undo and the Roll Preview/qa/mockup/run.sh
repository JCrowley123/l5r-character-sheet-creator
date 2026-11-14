#!/bin/sh
export NODE_PATH=C:/Users/jcrow/l5r-qa-tools/node_modules PLAYWRIGHT_BROWSERS_PATH=C:/Users/jcrow/l5r-qa-tools/ms-playwright PYTHONUTF8=1
unset NODE_OPTIONS
exec node --require "C:/Users/jcrow/l5r-release-15a-group5/Versions/PART K — Phase 14.2 Kata and Kiho References/qa/navigation-budget.cjs" --require "C:/Users/jcrow/l5r-release-15a-group5/Versions/Part F — Cross-Platform Delivery/PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs" "$@"
