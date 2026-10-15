# QA — Cycle 2 2026-10-15

Test infrastructure for Cycle 2; the sheet is not touched here. It holds the cycle's full-suite runner, the final QA
script and the under-load measurement the owner asked for before the one full suite.

## Under-load check (15 October 2026, 18:13–18:15 UTC)

The owner's instruction for this cycle: make the full suite pass first time, without weakening any check. Layers A and
B add about 470 citations and 16 kB of text to Search's haystack, so the two timing checks were measured first, on a
quiet machine (15 Chrome processes, the owner's own browser, as at the earlier baseline; no other Node or Python).

| Worst keystroke, 4× CPU, five repeats | Candidate (3,906,008 bytes) | `main` (3,843,210 bytes) |
|---|---|---|
| Search, `S14-KEYSTROKE-UNDER-50MS` | 11.0–19.1 ms | 12.5–24.7 ms |
| Facets, `F141-UI-KEYSTROKE-UNDER-50MS` | 14.3–27.1 ms | 14.5–34.3 ms |

All 20 runs passed every check (Search 62/62, facets 44/44). The layers cost nothing measurable; the narrowest margin
is 23 ms under the limit. Method: the unmodified harnesses, candidate and `main` alternating, with
`qa/keystroke-probe.js` preloaded after the Chrome shim; it only logs the number each check already computes (the value
`page.evaluate` returns while throttling is on). Raw lines: `qa/keystroke-under-load.log`. No harness, check or
threshold changed.

## Running

`qa/flat-suite-runner.js` is Cycle 1's flat runner with new entries: the candidate runs BUGFIX — Spell Names Match the
Books' suite chain (**5,430** checks: 113 leaf harnesses through 91 wrappers); `--retained` runs BUGFIX — Printed
Skills and Equipment Tables' chain (**5,294**, 107 leaves) on the predecessor. It preloads Phase 14.2's 60-second
navigation allowance. `qa/final-qa.py` checks the build, runs the candidate, removes the three releases newest first
through the registry in a scratch copy, requires the exact `main` build (3,843,210 bytes, `14711d4f…`), and runs the
retained suite on it. Environment as in Cycle 1's README (installed Chrome through `use-installed-chrome.js`;
`NODE_PATH=C:/Users/jcrow/l5r-qa-tools/node_modules`).

## Full-suite run

| Run | Result |
|---|---|
| 1 (`qa/final-run-1/`, 18:56–19:33 UTC) | **Failed 4 leaves**: page loads over 60 s in Explain This Roll, Wizard Starting Spells (2 checks) and Import File Picker, and `PSE-MANAGEMENT-MODE` (a layout measured 150 ms after a resize). The laptop was on battery with the screen off (connected standby 18:13–21:26 UTC, battery report); the run took 37.0 minutes against Cycle 1's 14.9, every part 1.7–3× slower. On mains power the four passed at normal speed: 22/22 (3.5 s), 71/71 (58 s), 10/10 (5 s), 18/18 (8 s) |
| 2 (`qa/final/`, 22:10–22:38 UTC) | Mains power, screen kept awake: **5,430/5,430, all 113 leaves fresh**, 14.0 minutes (retained 13.4); the three releases removed rebuilt `main` exactly; retained **5,294/5,294** |

No check, threshold or allowance changed. **Run the full suite on mains power with the screen kept awake**: keep-awake
prevents sleep but not standby throttling.

## Live check (15 October 2026, 23:22 UTC, after the merge `8052c00`)

`qa/verify-live.py`: the deployed page and service worker match the build byte for byte; on the downloaded live page
Search 62/62, 14.3b 40/40, 9.1 19/19 and Spell Names 16/16. Evidence in `qa/live/`.
