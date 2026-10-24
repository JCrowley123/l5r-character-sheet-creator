# Remove BUGFIX — Yomi Sees the Ancestor

Set `YOMI_ANCESTOR_ENABLED` (in `src/sheet/209.999999999992-bugfix-yomi-ancestor.js`) to `false` and reload: the FT-45 fix is off. Saves are untouched.

## Surgical removal

| Location | Owned item |
|---|---|
| `src/sheet/209.999999999992-bugfix-yomi-ancestor.js` | whole fragment and its `build/manifest.json` entry |
| `src/sheet/210-test-seam-and-init.js` | `yomianc-seam` |

The blocks begin `// BUGFIX YOMIANC BEGIN <slug>` and end `// END YOMIANC <slug>`.

1. Copy the Phase 0 folder to a short scratch folder (the remover refuses the live tree).
2. Remove later releases first, newest first (`QA — Removal Chain Registry/removal_chain.py`).
3. `python -B qa/remove-phase.py <scratch> --dry-run`, inspect, then run it without `--dry-run`. With no later
   releases present, add `--expect-sha eacfacb4d4cbf526617dfb53073ef0ec6aa7fa37f4b145be3aa0b20b1f7862e1`
   (the build before this layer, 7,969,638 bytes).
4. Rebuild with `build/recombine.py --verify` and run the suite. Then apply the same removal to the working branch,
   delete this release's entry from `CHAIN`, and delete this folder.

## Dependencies

- **Feature 4.5.10 Cursed by the Realm:** wraps `R4510.ancestralPresent()` (guarded). Declared in its ROLLBACK.
- **Phase 4.8 Ancestors:** reads `ANC48.current()` (guarded). Declared in its ROLLBACK.
