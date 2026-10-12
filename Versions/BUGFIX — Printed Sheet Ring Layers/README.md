# Printed Sheet Ring Layers

Removes the Ring symbols and cream overlays from printed sheets, following the owner's 10 October 2026 ruling. Screen artwork stays unchanged. Own switch, stylesheet, fragment and guarded test seam; no character data changes.

Focused QA: 8/8. The unchanged baseline fails PRINT-SWITCH, PRINT-SYMBOLS-HIDDEN and PRINT-WASH-HIDDEN (5/8). Three pinned negative variants fail exactly their named checks. Removal fixtures: 16 tests, 14 pass and two Windows link-permission skips. Removal restores 3,780,098 bytes, SHA-256 `b7e1fc2d7c12e077954f1eb539d734679aad96930ae76fb7e61a813df1c94907`.

Integrated build: 3,780,974 bytes, SHA-256 `42751a5b11b0c62e30dfa44354ad099f0f4c5ca67ff08f043311c9da24952b44`. The final complete candidate passes 5,057/5,057; removing this fix with its dependent PDF layer leaves Skill Traits intact and passes 5,016/5,016. All three historical restoration hashes match exactly. Evidence is in `../QA — Small Fix Cycle 2026-10-10/qa/final/summary.json`. Main merge and live verification are recorded below.

Owner P1–P3 passed on iPhone; see the release verification below. The independent FT-30 weapon-layout finding concerns broader print formatting, not Ring artwork.


## Release verification

Merged to main at `d5e418d` and verified live on 11 October 2026 at 16:23 UTC. The deployed page matches the tested PWA bytes (3,799,358 bytes; SHA-256 `312fa071b72e6bd14b5083cdf3f510e66e1e222e4394b69beefa6142f1972403`), service worker `28e6539adf579766`; all 232/232 live checks pass. Owner results received 12 October: all 15 iPhone checks passed (P1–P7, S1–S8), run 11 October on iPhone 16e / iOS 26.6.2. Optional Windows W1–W2 Not run. FT-29 picker labels are owner-deferred; independent saved-PDF review found FT-30 weapon clipping, still open. See `../QA — Small Fix Cycle 2026-10-10/OWNER-RESULTS-2026-10-12.md`.
