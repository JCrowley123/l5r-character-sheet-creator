# Remove BUGFIX — Void Card Reasons on a Phone

Set `VOID_REASONS_ENABLED` (in `src/sheet/209.999999999995-bugfix-void-reasons.js`) to `false` and reload: the FT-38 fix is off. Saves are untouched.

## Surgical removal

| Location | Owned item |
|---|---|
| `src/sheet/209.999999999995-bugfix-void-reasons.js` | whole fragment and its `build/manifest.json` entry |
| `src/css/59.9999895-bugfix-void-reasons.css` | whole fragment and its `build/manifest.json` entry |
| `src/sheet/210-test-seam-and-init.js` | `voidwhy-seam` |

The blocks begin `// BUGFIX VOIDWHY BEGIN <slug>` and end `// END VOIDWHY <slug>`.

1. Copy the Phase 0 folder to a short scratch folder (the remover refuses the live tree).
2. Remove later releases first, newest first (`QA — Removal Chain Registry/removal_chain.py`).
3. `python -B qa/remove-phase.py <scratch> --dry-run`, inspect, then run it without `--dry-run`. With no later
   releases present, add `--expect-sha aa2d710eefcecd882df9f57052d473dd04f99d5617f2e16a0eca444b2830b7ed`
   (the build before this layer, 7,974,888 bytes).
4. Rebuild with `build/recombine.py --verify` and run the suite. Then apply the same removal to the working branch,
   delete this release's entry from `CHAIN`, and delete this folder.

## Dependencies

- **The Void card** (trunk, `160-feat-void.js`): wraps `renderVoidPanel()`; reads `#voidSpendButtons`' buttons and
  `#voidDisabledReason`; wraps `renderVoidPips()` (trunk, `110-modals-trackers.js`). Hotei's button (Feature 4.5.36) is read like any other `.void-spend-btn`; no dependency.
