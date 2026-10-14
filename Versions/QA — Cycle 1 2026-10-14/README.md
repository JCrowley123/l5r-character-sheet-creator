# QA — Cycle 1 2026-10-14

Test infrastructure for Cycle 1; the sheet is not touched here. It holds the cycle's full-suite runner, the final QA
script, and the one retained test-synchronisation change the cycle's investigation called for.

## Why the full suite failed under load (investigated 14 October 2026)

The last full run before this cycle failed five checks in four groups; each passed unchanged on rerun, with causes not
established. A failing-test investigator (the owner's second helper role) found all three causes:

| Check | Cause | Remedy |
|---|---|---|
| `S14-ESCAPE-CLOSES` (Phase 14) | Closing an entry left focus on a hidden heading; Chromium drops it at the next rendering update, so the second Escape depended on timing | Layer 1, BUGFIX — Search Focus on Close |
| `F141-UI-KEYSTROKE-UNDER-50MS`, `S14-KEYSTROKE-UNDER-50MS` | Not load alone: the facets' worst keystroke was 32–56 ms at rest (1,467 normaliser calls per keystroke) | Layer 4, BUGFIX — Search Keystroke Speed (18–20 ms after) |
| `PDF-PRINT-REMOVES-MIRRORS` (Phase 11.1) | The carousel's clone refresh copies Export to PDF's print copies mid-print; reproduced deterministically | Layer 5, BUGFIX — Print Copies Cleanup |
| `MT-W320/W390-BACK-AGAIN` (Manage Button Clipping) | Test timing: a tap holds `:active` ~0.15 s before the 0.1 s ease-back, so the fixed 250 ms wait had no margin | Test synchronisation, below |

No threshold, tolerance or assertion was changed anywhere.

## Retained test change

`BUGFIX — Manage Button Clipping/qa/manage-toggle-harness.js`: `press()` now waits until the label has changed, the
press has ended and nothing in the header is animating, instead of a fixed 250 ms. Assertions and the 0.5 px tolerance
are unchanged. Candidate **36/36**, `main` **36/36**; with the clipping fix removed it still fails 10 checks (26/36).
The original is in `originals/manage-toggle-harness.js`.

## Running

`qa/flat-suite-runner.js` is Phase 14.2's flat runner with new entries: the candidate runs Layer 7's suite chain
(**5,249** checks: 104 leaf harnesses through 85 wrappers, seven layers); `--retained` runs Phase 14.2's chain (**5,107**, 94 leaves)
on the predecessor. It preloads 14.2's 60-second navigation allowance. `qa/final-qa.py` builds, runs the candidate,
removes all seven layers newest first through the registry in a scratch copy, requires the exact `main` build
(3,800,283 bytes, `7b68f34d…`), and runs the retained suite on it.

## Full-suite runs

| Run | Candidate | Result |
|---|---|---|
| 1 (`qa/final-run-1/`, 14 October, 14:47–15:14 UTC) | five layers, 3,828,766 bytes | **5,229/5,229 first time**, all 102 leaves fresh; all five layers removed rebuilt `main` exactly; retained **5,107/5,107** |
| 2 (`qa/final-run-2/`, 14 October, evening) | five layers plus the owner's Fill the Emptiness correction, 3,828,819 bytes | **5,226/5,229**: Phase 12's modes harness (`PM12-MANAGEMENT-TYPING-WORKS`, `PM12-PLAY-TYPING-BLOCKED`, `PM12-MODE-NEVER-SAVED`): the first real keystrokes on a fresh page did not reach the Notes box. **The same failure reproduced on `main`** (1 standalone run in 5); not caused by this cycle. Cause: a carousel start-up race (the investigator, 14 October); fixed by Layer 7, BUGFIX — Carousel Settles on Its
Destination |
| 3 (`qa/final/`, 14 October, 22:58–23:27 UTC) | seven layers (Layer 6 on the owner's decision; Layer 7, the carousel fix for run 2's failure), 3,833,345 bytes, `c3b20fbe…` | **5,249/5,249 first time**, all 104 leaves fresh; all seven layers removed rebuilt `main` exactly; retained **5,107/5,107**. On installed Chrome 155 (below) |

## Test environment (14 October 2026, evening)

The Windows updates installed on 14 October (KB5127647, KB5127648, KB5127690; applied at the 21:07 restart) make
Playwright's bundled Chromium 153 crash on opening any page (access violation at the same address every time); the
harnesses then exit silently. The installed Google Chrome 155 works. `qa/use-installed-chrome.js` adds
`channel: 'chrome'` to every Playwright launch; load it with
`NODE_OPTIONS=--require "C:/…/QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js"` (forward slashes: backslashes in a
quoted `NODE_OPTIONS` path are dropped). Playwright itself was installed from inside the Claude app, so other processes
(the Terminal panel, the Store Python that runs the `.py` fixtures) need `NODE_PATH` set to
`C:\Users\jcrow\AppData\Local\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\npm\node_modules`. No harness, check,
threshold or tolerance changed. Layer 7's checks and full run 3 (both suites) ran this way.
