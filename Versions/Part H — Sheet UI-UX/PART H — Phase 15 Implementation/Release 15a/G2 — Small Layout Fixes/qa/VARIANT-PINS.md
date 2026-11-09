# G2 negative-variant pins — prepared before any run

8 November 2026 (Codex). Frozen candidate `7793602382c68895b25dc572b71bd05af33667a9c1b1d1bd76032efd744182f0`, 17,609,230 bytes. Baseline for each unit: G1 as live, commit `2790a2ba`, application `2dcf6f20846b0c9ea97b59b94537abda6d510714b3bc1ef6376175056d066af6`, 17,586,964 bytes. Every exact failed-check ID is in `variants.json`. Predictions are from the harness oracles and source, not observed test output.

20 mutations (switch off, own CSS removed, two focused defects per unit) plus 5 baselines. Each mutation changes exactly one unique string in a scratch HTML file. The discovery runs once, then corrections are explained here before the qualification chain. No full-suite discovery, retries or widened assertions.

| Case | Predicted failures | Why |
|---|---:|---|
| A05:baseline | 20 | G1 baseline contains none of the five G2 units. |
| A05:disabled | 20 | Switch off; own installation and presentation absent. |
| A05:no-css | 10 | Remove only this unit stylesheet; JS and seam remain. |
| A06:baseline | 14 | G1 baseline contains none of the five G2 units. |
| A06:disabled | 14 | Switch off; own installation and presentation absent. |
| A06:no-css | 10 | Remove only this unit stylesheet; JS and seam remain. |
| A07:baseline | 22 | G1 baseline contains none of the five G2 units. |
| A07:disabled | 22 | Switch off; own installation and presentation absent. |
| A07:no-css | 18 | Remove only this unit stylesheet; JS and seam remain. |
| A11:baseline | 12 | G1 baseline contains none of the five G2 units. |
| A11:disabled | 12 | Switch off; own installation and presentation absent. |
| A11:no-css | 10 | Remove only this unit stylesheet; JS and seam remain. |
| A04.1:baseline | 38 | G1 baseline contains none of the five G2 units. |
| A04.1:disabled | 38 | Switch off; own installation and presentation absent. |
| A04.1:no-css | 22 | Remove only this unit stylesheet; JS and seam remain. |
| A05:wrong-label | 6 | Exact shared label text in initial, saved and Play row. |
| A05:short-select | 4 | Measured select height falls below 44 in Manage and Play. |
| A06:wrong-state | 4 | Generated state read on both unrecorded grant rows. |
| A06:unfilled-primary | 6 | Primary fill compared with independently resolved ink token. |
| A07:wrong-severity | 4 | Generated severity label in both modes. |
| A07:small-checkbox | 4 | Checkbox dimensions measured in both modes. |
| A11:cramped-conditions | 2 | Description gap measured on all six condition cards. |
| A11:tight-hint-lines | 2 | Independent line-height/font-size ratio. |
| A04.1:truncated-rule | 10 | Every inline rule compared with its original hidden disclosure. |
| A04.1:nested-border | 10 | A visible inner label border violates one box per option. |

## Harness preparation

A11's two comparison checks now restore the body class exactly as found using `finally`; this prevents a disabled variant being switched on by the harness. Declared in A11's ROLLBACK; assertions, time limits, IDs and 22-check count unchanged. No application source changed.

Both required preloads are used by the variant runner. Launchers set NODE_PATH and PLAYWRIGHT_BROWSERS_PATH to QA-tools and PYTHONUTF8=1, with no old installed-Chrome shim. G1's execution and assertion logic is otherwise retained.

## Counts pinned before full QA

Candidate: G1 7,002 + A05 22 + A06 20 + A07 26 + A11 22 + A04.1 56 = **7,148**.
Retained: A04 35 + A15 33 + A16 50 + A03.1 19 + A03 37 + A03 retained 6,755 = **6,929**. Excludes the same 73 live-site checks as G1's retained procedure.

The group removal must restore G1 exactly. It also runs all kept G2 harnesses for each singly removed unit, Phase 4.5.21's conditional fixture (77), and A03's timing-sensitive harness (37) on the A11-removed build. No 4x CPU screen: no G2 unit adds timing or animation.

## Discovery

Discovery completed once on 8 November 2026. **All 25 cases matched every predicted failed-check ID exactly**, each with exit 1 and a complete pinned harness count. No pin correction, harness change or repeat discovery was needed. Predictions were committed and pushed as `d8764eaf` before discovery. Evidence: `variants-discover.log` and `variants-discover-77936023/summary.json`. The qualification chain will now assert the same pins.

Preparation validation: the A11 candidate harness passed 22/22 on its first execution after the hygiene fix (a11-hygiene-candidate.log). Syntax, unique mutation anchors and invocation inventories passed: candidate 191 leaves / 7,148 checks; retained 184 leaves / 6,929 checks. Read-only review found no blocking defect in the adapted scripts or their count arithmetic.

## Removal-stage fixture correction and continuation

The original qualification chain stopped at removal, **46/47**, before final variants or dependencies. A11's desktop alignment check had seven eligible fixture rows when A05 was removed, despite no off-edge text. The exact failure, raw geometry, and correction are recorded in [A11-REMOVAL-INVESTIGATION.md](A11-REMOVAL-INVESTIGATION.md).

Only A11's own Moon fixture description changed. The unchanged harness passed **22/22 on all six affected inputs** (candidate and five preserved removal builds), with the eight-row minimum, 1 px tolerance, assertion IDs and counts retained. All other harness inputs and application bytes are unchanged.

The original chain is never restarted or overwritten. `continue-after-a11-fixture.py` validates the exact original failure and scoped evidence, then runs only the previously unstarted final variants and dependencies. It records a separate `qualification-77936023-a11-fixture.json`; `run-final-once.py` requires this truthful continuation and the unchanged fixture/harness hashes. The five A11 negative-case predictions remain unchanged and must match in final qualification; no prediction is widened based on a failed run.
