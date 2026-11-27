# B18 light checks (26 November 2026)

Each run used the project's own Playwright browsers (`l5r-qa-tools`) and, from the second discovery run on, the suite's two
preloads (Phase 14.2's navigation budget and the splash's test switch), as the full-pass runner gives every leaf. The
leaves are the live suite's 213 (group 2's `qa/candidate-list.json`), run a few at a time by a scratch runner.

| Folder | Build | What | Result |
|---|---|---|---|
| `discovery-no-preloads/` | B18 `2b17b31e…3705` (before the A08 fix) | all 213 leaves, 6 at a time, no preloads | 20 flagged: 14 real pins, 6 the splash taking taps without the preload |
| `discovery-with-preloads/` | the same | the 20 flagged, 3 at a time, with the preloads | 14 real: the harnesses that pin B18's old words (A08's also found B18 breaking its tap grouping) |
| `changed-on-b18/` | B18 `e6755993…c089` (after the heading fix) | the 14 changed harnesses (and the Template PDF leaf the filter also caught) | 15/15 harnesses, 781/781 |
| `changed-on-main/` | live main `1f002be9…5819` | the same | 15/15 harnesses, 781/781 |
| `full-b18/` | B18 `2be73c43…faea` | all 213 leaves, 5 at a time | 7,561/7,562; the one miss, the splash's "fades after ready and 5 s" timing in `sw-checks.js`, passes alone (61/61) |
| `tip-own/`, `tip-15a-removed/` | the tip `56b280e2…aab1`, and the same with all 26 Release 15a units removed (`e0178e80…`) | the three units' harnesses | 35/35, 11/11, 11/11 on each |
| `full-tip-revised/` | the tip `56b280e2…aab1` | all 213 leaves, 5 at a time | 213/213, 7,562/7,562 |
