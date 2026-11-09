# A11 removal-chain failure investigation

8 November 2026 (Codex). The first qualification chain stopped after removal: **46/47**, with only `A05-REMOVED-RUNS-A11` reporting **21/22**. No variants-final, dependencies or full suite started. The original state and logs are preserved unchanged.

## Cause established without repeating the failed chain

The exact A05-removed scratch page was preserved before temporary cleanup: SHA-256 `80db689d71a573fff5d2d23362cf9b920324af29f5785e8ed2539756058bfb37`, 17,604,577 bytes. `diagnose-a11-coverage.cjs` uses the harness's own setup and measurements to print geometry, without running its checks. `a11-removal-geometry.log` shows:

| Device | Cards | Eligible rows with description and explanatory text | Misaligned edges | Page errors |
|---|---:|---:|---:|---:|
| Phone | 17 | 8 | 0 | 0 |
| Desktop | 17 | 7 | 0 | 0 |

`TE-PLAY-ONE-EDGE-DESKTOP` requires at least eight eligible rows. A05 removal restores Missing Limb's desktop note beside its select, so `cardEdges.first()` correctly excludes that note. The fixture had relied on A05 to reach eight; the application alignment is correct.

## Correction

Only A11's own fixture changes: its already configured Moon row receives a nonempty test description. Its independently existing summary now participates in the same alignment assertion. All 17 original cards remain, with additional text coverage. The eight-row minimum, 1 px tolerance, every assertion and check ID, and 22-check count remain byte-for-byte unchanged in the harness. Application sources and all other units' fixture copies are unchanged.

The original failed chain is not restarted. Scoped validation must run the unchanged A11 harness against the candidate and each of the five preserved removal builds where A11 is retained. The remaining qualification stages have not yet run. No original failure is overwritten or described as an uninterrupted pass.
