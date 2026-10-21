# Remove BUGFIX — Clan and School Pickers Follow the Character

Set `CFS_SYNC_ENABLED` (in `src/sheet/209.99999999993-bugfix-clan-school-sync.js`) to `false` and reload: after a load
the Clan & School pickers keep their first options again (Crab, Hida, Hida Bushi). Saves are untouched.

## Surgical removal

| Location | Owned item |
|---|---|
| `src/sheet/209.99999999993-bugfix-clan-school-sync.js` | whole fragment and its `build/manifest.json` entry |
| `src/sheet/210-test-seam-and-init.js` | `cfssync-seam` |
| `BUGFIX — Spell Slots Tab on Safari/qa/safari-tab-harness.js`, `PART H — Phase 9 Clan-Themed Look/qa/clan-theming-harness.js` | `apply-asks-first` (outside the Phase 0 tree: pass scratch copies with `--fixture`) |

The block begins `// BUGFIX CFSSYNC BEGIN cfssync-seam` and ends `// END CFSSYNC cfssync-seam`.

1. Copy the Phase 0 folder to a scratch directory (the remover refuses the live tree).
2. Remove later releases first, newest first (`QA — Removal Chain Registry/removal_chain.py`).
3. `python -B qa/remove-phase.py <scratch> --dry-run`, inspect, then run it without `--dry-run`. With no later
   releases present, add `--expect-sha a9a1119903b38610795ba32c5a01603b5f8e2113a1f825532fcd8d2087a1ed85`
   (the Library, Release 2d, 6,718,713 bytes).
4. Rebuild with `build/recombine.py --verify` and run the Library's suite (5,705). Then apply the same removal to the
   working branch, delete this release's entry from `CHAIN`, and delete this folder.

## Dependencies

- **Phase 2 Identity build UI (`080-identity-build-ui.js`):** the pickers and their refresh functions this fix calls.
- **Phase 11 Characters list, Phase 7 save format and every other `applyData()` wrapper:** this fix wraps the
  outermost binding at its place in the build; later fragments that wrap `applyData()` wrap it in turn.
- **Phase 4.8 Ancestors:** `renderAncestorCard()` is called after a sync when present, as a picker change does.
