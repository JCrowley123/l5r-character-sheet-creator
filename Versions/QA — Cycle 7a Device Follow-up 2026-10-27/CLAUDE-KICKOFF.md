# Claude kickoff — Cycle 7a device follow-up, 28 October 2026

## Start here

The owner explicitly asked Codex to build, report at 15 weekly allowance points, stop at 20, and hand unfinished work to Claude. Last observed weekly meter: 95%, baseline 76% (19 points used); report was delivered at 92% (+16; first observed crossing). Five-hour allowance reset during the chat pause and now reads 0%; the weekly cap still applies. Weekly reset identity 1793615565; current five-hour reset1793169975. No reset credit used. Codex reserved the remaining allowance for this handoff. Do not assume all work is complete or restart the feature from scratch.

Work only in `C:\Users\jcrow\l5r-character-sheet-creator`, branch `codex/cycle-7a-device-followup`. Do NOT modify the OneDrive clone. Base main is e58fe09, originally clean and pulled. Feature commits: 3f197ea (CE7 card editing), d67699d (WP7 wound preview). A subsequent handoff/QA-evidence commit contains this file. Main/live remain at the prior approved release; new merge and deployment approval is required.

Read the owner's original kickoff in `C:\Users\jcrow\Downloads\cycle-7a-kickoff-for-chatgpt-2026-10-24.md`, current rules/pointers in Versions/CLAUDE.md, ledger parts 1–4 and roadmap rulings. CLAUDE.md must retain exactly 8 CR bytes. The global ledger, roadmap and CLAUDE records have NOT yet been updated for this follow-up. This kickoff is the current state, overriding its obsolete earlier running checkpoints.

## Approved behavior

- Management: directly editable nonnegative integer Rank/Points fields inside all four cards. Remove the visible Rank settings disclosure and Set Rank buttons. Play: plain read-only Rank/Points values.
- Move Recognition by your lord into Glory and Status beside their adjustment steppers; Management-only. Wording remains isolated in RP7.labels.recognize.
- Move Check Taint Growth inside Taint beside the stepper.
- Preserve nine read-only pips, existing carry/caps and banked Glory/Status points. Adjustment amount has no visible label, has an accessible label, accepts positive integers only and resets to 1 only on success. Current values remain separately displayed, no decimal summary.
- Undo: 20 seconds, hidden after use/successful manual save; retained through 1.2-second background autosave. Errors remain explanatory. Review found edge cases below.
- Wound selector stays Management -> Rings & Traits. Add Campaign wounds heading, actual final threshold preview including character modifiers, and a Play Combat pointer to the setting. Combat remains hidden in Management.
- Owner findings JSON is copied to owner-findings.json. 9/10 device checks passed on Edge/iPhone Safari. Wound maths was correct; discoverability needed work. PDF checks passed; do not reopen PDF scope.

## Build and evidence

Candidate: `be0df2935dda0027a0020120bf207d7ea69fc443bd1f50badee90847f55784f1`, 17,347,572 bytes, in Part F Phase 0 `l5r-character-sheet.html`. Production code has NOT changed since d67699d. Both feature layers are built and committed, but NOT release-ready due to open review findings.

CE7 folder: Versions/BUGFIX — Characteristic Card Editing. Source logic/UI ...9982/...9983, CSS ...9975. Own harness 31/31; existing CP7 33/33; strict removal 6/6 restoring e58fe09 candidate (SHA4f2ebd5b6ec932010983906dff5f8c76c52c8116b680fb0d2d461c722d130e5f,17,336,656 bytes). Baseline and disabled each1/31; three mutations each fail exactly one pinned check. Variant pins were written before first execution.

WP7 folder: Versions/BUGFIX — Wound Settings Preview. Source logic/UI ...9984/...9985, CSS ...9976. Own18/18; existing WM7 31/31; removal6/6. Baseline/disabled1/18; wrong totals9 pinned failures, wrong pointer1. WP7 removal restores CE7 predecessor SHAac59ef11ee32eb97852c1140e8fb5040b8530c9dd03f6dd3296b50cacda6a919,17,344,141 bytes. If CE7 changes, refresh this WP7 predecessor proof/hash consistently; CE7's own base remains unchanged.

Both layers have switches, guarded seam entries, chain registration, README/ROLLBACK and negative/removal evidence. Dependency scanner logs report own marked lines because the legacy scanner recognizes bare BUGFIX only; each hit was inspected, strict removers pass. CE7 touches the CP7 undo-expiry hook, manual-save hooks in120 and seam210 in narrow owned blocks. The old CP7 harness changed only three recognition selectors to support the moved buttons; assertions/count33 retained.

Actual save integration checks2/2 passed in qa/visual.cjs: manual save clears Undo; background autosave persists and preserves it. Four PNGs in qa/visual. Desktop and wound phone inspected. Tall phone card capture is partly obscured by fixed toolbar; per-card recapture recommended. cards-play-phone.png exists but has NOT been visually inspected. Own responsive geometry checks passed1600/390/320.

Affected run1: 93/93 groups completed, 0 failures among completed groups. All 93 groups passed and the runner completed during the chat pause; no runner remains active. Exact results/logs: qa/affected-1. Do not overwrite this evidence. After review fixes, use a fresh output directory and candidate for affected checks. Full QA has NOT started.

## Immediate next work

1. Read REVIEW-FINDINGS.md: all three P2 findings are OPEN, source-review only. Reproduce and fix the invalid-draft Undo/load, unchanged-value stale alert, and slow first-save/newer Undo identity issue. No partially applied fix exists. Add focused behavior regressions and matching negative pins before execution. Keep fixes within CE7 ownership/removability.
2. Rerun affected own/legacy, negative and exact-removal checks for changed code. Update own counts, pins, README/ROLLBACK and WP7 predecessor hash if necessary. Current full-run candidate total6350 assumes CE7=31, WP7=18; additions require truthful count updates, never reduced checks.
3. Finish focused visual checks and rerun groups affected by the review fixes serially. The initial93-group run has passed. The single reviewer is COMPLETE; do not launch another. Reviewer only after own tests/before full suite has been satisfied. No helpers for implementation/planning/records/books. A failing-test investigator only after cause remains unclear after a couple tries.
4. Run two fresh full QA passes only after findings and focused checks are resolved, on mains/awake with no competing browsers. Prepared runners in qa/: current-suite-runner.js, retained-suite-runner.js, flat-suite-runner.js, final-qa.py. Dry lists validated6350 candidate/147 leaves and6228 retained/143 leaves with no wrapper errors. No full-run driver was started. Verify invocation interface before running. Do not use the OLD Reports/run-refinements-full-qa.py, which targets the prior release.
5. Finish release records/rollback instructions, preserve CLAUDE's8 CR bytes, commit/push branch, report what is ready. Ask separately before merging/deploying. Device checklist can be generated after deployment if requested.

## Runtime / QA cautions

Node `C:\Program Files\nodejs\node.exe`. Python `C:\Users\jcrow\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe -X utf8 -B`. NODE_PATH=C:/Users/jcrow/l5r-qa-tools/node_modules. PYTHONUTF8=1. NODE_OPTIONS should contain only `--require "C:/Users/jcrow/l5r-character-sheet-creator/Versions/QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js"`. Splash-fast is a LEAF --require, never globally inherited. Full runners preserve the prior flat scheduling/rotation fixes. Wait document.fonts.ready before geometry. Git operations required elevated sandbox execution in Codex; GitHub CLI is absent, ordinary git works. Remote is https://github.com/JCrowley123/l5r-character-sheet-creator.git.

qa/run-affected.py hardcodes affected-1 and refuses existing folder; make a fresh run directory for rerun. expected counts in affected-invocations.json came from prior evidence; inspect any mismatch rather than weakening checks. No tests were weakened. One-shot authoring/checkpoint scripts in C:/REA-Workspace/Reports are NONIDEMPOTENT; don't rerun them blindly. Repository files are authoritative.

The old deployed refinement had6301 candidate/6102 retained checks and is unrelated to this follow-up's completion. This branch's retained6228 is the current base suite with deployed-site checks excluded, as recorded in the prepared runners.
