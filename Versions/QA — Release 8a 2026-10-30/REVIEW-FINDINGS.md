# Release 8a — code review findings (30 October 2026)

One read-only review (Helper 1) of `main..claude/release-8a-xp-gate-load` and the working tree (both layers, their seams,
removers and registry entries, and every harness change), after the layers passed their own checks and before the
suite. One defect in a layer, one coverage defect in an older check, and seven lower findings or notes. Each check added
from it was pinned before its first run; the defect was reproduced on the pre-review build before it was fixed.

| # | Finding | Outcome |
|---|---|---|
| 1 | With XW8 on, Phase 11.2's CW-OVERSPEND-BLOCKS no longer shows that Rings & Traits still blocks on another error, so 11.2's variant "no validator gate on Traits" would pass on the shipped build. | **Closed.** CW-OVERSPEND-BLOCKS also drives Willpower 11 (outside 1–10) and requires Next blocked with that reason, both ways. Count unchanged. |
| 2 | `xw8-variants-off.log` was empty when read (the run was still going). | The run was stopped for the harness edits below and re-run on the final files (`qa/xw8-off/`). |
| 3 | XW8: Finish could run twice. `appConfirm` leaves focus on Finish, so Enter (or a second tap) while the question is open asks again, one OK resolves both, and the wizard finishes twice; Back while the question is open then OK finishes from another step. | **Reproduced** by XW-FINISH-ONCE (pinned first; fails on the pre-review build). Fixed: one question at a time, and Finish goes on only if the wizard is still open on Review. Variant finish-twice. |
| 4 | With XW8 on, CW-OVERSPEND-CLEARS and CW1-OVERSPEND-CLEARS pass whatever happens. | **Closed.** Both also require the overspend gone, both ways. Count unchanged. |
| 5 | XW8 harness gaps: the Kiho check guarded its step itself; no check of the warning on Skills or Advantages; no check that Review, overspent and with another error, still blocks Finish. | **Closed.** XW-KIHO-STEP-OPEN adds the step and lets the wizard's own read guard it; XW-EVERY-STEP-OPEN also requires the warning (and no red line) on Skills and on Advantages; new XW-REVIEW-OTHER-ERROR-BLOCKS (Willpower 11 while overspent). Variants drops-every-finding (new), no-decorate re-pinned (+ XW-EVERY-STEP-OPEN). 15 → 17 checks with finding 3's. |
| 6 | Characters list: `flushedNew` / `flushedHide` were worked out but not asserted, so under heavy load the plain autosave could write first and a "no flush" build pass. | **Closed.** Each flag is part of its check's value, expected true. Count unchanged. |
| 7 | Characters list: in the flush cases a wait on the write count could run to the ceiling (slow, not wrong) if the timer wrote first. | **Changed.** The flush cases wait for the flush's own write to finish (no timer, nothing in flight), not for a count. |
| 8 | `CW112.finish` now returns a promise and, when overspent, waits for the question; Phase 12's and 4.5.25's harnesses call it directly, neither overspent. | Recorded (ROLLBACK, Dependencies). Both pass; nothing to change. |
| 9 | AU8: an unsaved sheet imported from a file whose fields match a blank sheet but which carries a History is now replaced without asking, losing that History. | Recorded as a known limit (README). Rare: such a file's History describes changes it does not show. |

Clean, per the review: XW8's wrapping order and property lookups; no leak of the left-out finding into a page (the
Review list keeps it); every other reason still blocks; the validator absent; Finish within budget still synchronous; each
switch turns its layer fully off; AU8 reached by both callers of `confirmDiscard`; seams, manifest, markers, removers and
registry; the Characters list's write wrapper changes nothing the app does, and every "nothing written" wait requires the
timer to be null.
