# Remove PART F — Phase 0.6.2 Splash Screen

Set `SPLASH_ENABLED` (block `splash-logic` in `src/markup/10-swipe-tab-shell.html`) to `false` and rebuild: the splash
is removed as soon as it is parsed and the page opens as before. Characters are untouched.

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
nothing else listens for.
