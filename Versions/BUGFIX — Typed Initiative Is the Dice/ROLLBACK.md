# Remove BUGFIX — Typed Initiative Is the Dice

Set `TYPED_INITIATIVE_DICE_ENABLED` (in `src/sheet/209.999999999994-bugfix-typed-initiative.js`) to `false` and reload: the FT-23 fix is off. Saves are untouched.

## Surgical removal

| Location | Owned item |
|---|---|
| `src/sheet/209.999999999994-bugfix-typed-initiative.js` | whole fragment and its `build/manifest.json` entry |
| `src/sheet/210-test-seam-and-init.js` | `initdice-seam` |

The blocks begin `// BUGFIX INITDICE BEGIN <slug>` and end `// END INITDICE <slug>`.

1. Copy the Phase 0 folder to a short scratch folder (the remover refuses the live tree).
2. Remove later releases first, newest first (`QA — Removal Chain Registry/removal_chain.py`).
3. `python -B qa/remove-phase.py <scratch> --dry-run`, inspect, then run it without `--dry-run`. With no later
   releases present, add `--expect-sha 06e169ec575ed4d543dfbe205ec7bdd58e6edfd98da571a153996e83812afbfe`
   (the build before this layer, 7,972,920 bytes).
4. Rebuild with `build/recombine.py --verify` and run the suite. Then apply the same removal to the working branch,
   delete this release's entry from `CHAIN`, and delete this folder.

## Dependencies

- **Feature 4.5.35 Initiative Score:** replaces `IS4535.set`, wraps `IS4535UI.line` and labels `#is4535Input` (guarded).
  Declared in its ROLLBACK.
