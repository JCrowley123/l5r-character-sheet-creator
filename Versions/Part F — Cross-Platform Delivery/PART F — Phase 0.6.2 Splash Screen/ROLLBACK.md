# Remove PART F — Phase 0.6.2 Splash Screen

Set `SPLASH_ENABLED` (block `splash-logic` in `src/markup/10-swipe-tab-shell.html`) to `false` and rebuild: the splash
is removed as soon as it is parsed and the page opens as before. Characters are untouched.

To keep the artwork but drop Release 5a.2's 5 s minimum, set `SPLASH_MIN_MS` (same block) to `0` and rebuild: the
splash then leaves as soon as the sheet is ready, as in 5a (it still takes taps until then).

## Surgical removal

| Location | Owned item |
|---|---|
| `src/css/59.9999893-feat-splash-screen.css` | whole fragment and its `build/manifest.json` entry |
| `src/markup/10-swipe-tab-shell.html` | `splash-design`, `splash-logic` |
| `src/shell/02-style-close-head.html` | `splash-noscript` |
| `src/sheet/210-test-seam-and-init.js` | `splash-ready` |

Each block begins `PART F PHASE 0.6.2 BEGIN <slug>` and ends `END SPLASH062 <slug>`, in the file's own comments.

1. Copy the Phase 0 folder to a scratch directory (the remover refuses the live tree).
2. Remove later releases first, newest first (`QA — Removal Chain Registry/removal_chain.py`).
3. `python -B qa/remove-phase.py <scratch> --dry-run`, inspect, then run it without `--dry-run`. With no later
   releases present, add `--expect-sha 37eebd8039c01211433778907425f7be1047855a79a4e914e8363a447e2d2981`
   (BUGFIX — Clan and School Pickers Follow the Character, 6,728,218 bytes).
4. Rebuild with `build/recombine.py --verify`, run the suite, then apply the same removal to the working branch,
   delete this release's entry from `CHAIN`, and delete this folder.

## Dependencies

None in other layers' code: the logic needs only its own markup, and the ready signal is a plain DOM event that
nothing else listens for. Two test files preload this folder's `qa/splash-fast.cjs` (Release 5a.2's test switch):
`QA — Cycle 5 Release 5a 2026-10-21/qa/flat-suite-runner.js` (`SPLASH_FAST`) and `qa/verify-live.py` there. Remove
those references when you delete this folder.

**Declared (12 November 2026, Release 15a A17).** A17 (`PART H PHASE 15.1.27`) puts one marked block, `splash-fill-art`,
inside this layer's `splash-design` block (after the landscape picture's source, before the `img`); its END line hands
the lines after it back to this layer (`// PART F PHASE 0.6.2 (continued)`). While A17 is present this layer's remover
refuses (a foreign marker inside its block): remove A17 first; the removal chain does so in order. A17 also changes this
layer's harness check `S-ART-BY-SHAPE` into a conditional: the expected fit is `cover` when A17's splash fill is present
and `contain` otherwise (same id and count). See `Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A17 — The Splash Fills the Screen/ROLLBACK.md`.
