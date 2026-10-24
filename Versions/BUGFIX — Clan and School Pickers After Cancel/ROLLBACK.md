# Remove BUGFIX — Clan and School Pickers After Cancel

Set `CFS_CANCEL_ENABLED` (in `src/sheet/209.999999999991-bugfix-cfs-cancel.js`) to `false` and reload: the FT-44 fix is off. Saves are untouched.

## Surgical removal

| Location | Owned item |
|---|---|
| `src/sheet/209.999999999991-bugfix-cfs-cancel.js` | whole fragment and its `build/manifest.json` entry |
| `src/sheet/210-test-seam-and-init.js` | `cfscancel-seam` |
| `BUGFIX — Clan and School Pickers Follow the Character/qa/cfs-sync-harness.js` | `restage-after-school-cancel`, `restage-after-family-cancel` (outside the Phase 0 tree: pass a scratch copy with `--fixture`) |

The blocks begin `// BUGFIX CFSCANCEL BEGIN <slug>` and end `// END CFSCANCEL <slug>`.

1. Copy the Phase 0 folder to a short scratch folder (the remover refuses the live tree).
2. Remove later releases first, newest first (`QA — Removal Chain Registry/removal_chain.py`).
3. `python -B qa/remove-phase.py <scratch> --fixture <copy of cfs-sync-harness.js> --dry-run`, inspect, then run it without `--dry-run`. With no later
   releases present, add `--expect-sha 7c7cdf217f65b341d78fdc58c6d97457bd072100b95bad7f0692c734b41cbb92`
   (the build before this layer, 7,966,579 bytes).
4. Rebuild with `build/recombine.py --verify` and run the suite. Then apply the same removal to the working branch,
   delete this release's entry from `CHAIN`, and delete this folder.

## Dependencies

- **BUGFIX — Clan and School Pickers Follow the Character (5a):** `CFSSYNC.sync()`, `.question()` and `.enabled()`
  (guarded), and two blocks in its harness. Declared in its ROLLBACK.
- **Phase 11 Characters list:** wraps `CL11.openCharacter` (guarded). Declared in its ROLLBACK.
- **The sheet's `appConfirm()`** (trunk, `120-persistence.js`): wrapped.
