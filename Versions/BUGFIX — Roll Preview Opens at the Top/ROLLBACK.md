# Remove BUGFIX — Roll Preview Opens at the Top

Set `ROLL_PREVIEW_TOP_ENABLED` (in `src/sheet/209.999999999993-bugfix-roll-preview-top.js`) to `false` and reload: the FT-21 fix is off. Saves are untouched.

## Surgical removal

| Location | Owned item |
|---|---|
| `src/sheet/209.999999999993-bugfix-roll-preview-top.js` | whole fragment and its `build/manifest.json` entry |
| `src/sheet/210-test-seam-and-init.js` | `rptop-seam` |

The blocks begin `// BUGFIX RPTOP BEGIN <slug>` and end `// END RPTOP <slug>`.

1. Copy the Phase 0 folder to a short scratch folder (the remover refuses the live tree).
2. Remove later releases first, newest first (`QA — Removal Chain Registry/removal_chain.py`).
3. `python -B qa/remove-phase.py <scratch> --dry-run`, inspect, then run it without `--dry-run`. With no later
   releases present, add `--expect-sha a02e64a17598be5222df7d7e95a0f1aab831c850f2ba9b67a31c01654f1f39bb`
   (the build before this layer, 7,971,417 bytes).
4. Rebuild with `build/recombine.py --verify` and run the suite. Then apply the same removal to the working branch,
   delete this release's entry from `CHAIN`, and delete this folder.

## Dependencies

- **Phase 3 of Part G, Smart Roll Preview:** wraps `showRollPreview()` (guarded) and scrolls its card. Declared in its
  ROLLBACK.
