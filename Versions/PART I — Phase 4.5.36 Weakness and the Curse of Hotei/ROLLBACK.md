# Remove PART I — Phase 4.5.36 Weakness and the Curse of Hotei

Set `WEAKNESS_HOTEI_ENABLED` (in `src/sheet/209.9999999999-feat-weakness-hotei.js`) to `false` and reload: Weakness is
a plain entry again (no pick, nothing lowered), Hotei's row shows Feature 4.5.11's "not yet automated" note and the
Void card has no two-point spend. Saves are untouched (a Weakness row keeps its `traitPick` setting).

## Surgical removal

| Location | Owned item |
|---|---|
| `src/sheet/209.9999999999-feat-weakness-hotei.js` | whole fragment and its `build/manifest.json` entry |
| `src/css/59.9999891-feat-weakness-hotei.css` | whole stylesheet and its manifest entry |
| `src/sheet/080-identity-build-ui.js` | `weakness-trait-roll` |
| `src/sheet/110-modals-trackers.js` | `weakness-rings`, `weakness-insight`, `weakness-tn-initiative`, `weakness-initiative-roll` |
| `src/sheet/120-persistence.js` | `weakness-save` |
| `src/sheet/210-test-seam-and-init.js` | `weakness-hotei-seam` |

Each block begins `// PART I PHASE 4.5.36 BEGIN <slug>` and ends `// END WEAK4536 <slug>`.

1. Copy the Phase 0 folder to a scratch directory (the remover refuses the live tree).
2. Remove later releases first, newest first (`QA — Removal Chain Registry/removal_chain.py`).
3. `python -B qa/remove-phase.py <scratch> --dry-run`, inspect, then run it without `--dry-run`. With no later
   releases present, add `--expect-sha 820443923217991eeafa8907ff6ac82bdcaa522b6b04b2f9134096820ff09777`
   (BUGFIX — Gift of the Lady per School and Imperial Histories Volumes, 3,912,042 bytes).
4. Rebuild with `build/recombine.py --verify` and run the Gift of the Lady fix's suite (5,466). Then apply the same
   removal to the working branch, delete this layer's entry from `CHAIN`, and delete this folder.

The switch-guarded lines in Feature 4.5.11's and 4.5.12's harnesses (README, "Retained test changes") can stay:
without this layer they assert the original expectations. Their pre-change copies are in `originals/`.

## Dependencies

- **Feature 4.5.2 (Disadvantage configuration, `D45`)** installs the Weakness pick; without it Weakness is a plain
  entry and nothing is lowered.
- **Feature 4.5.11 (Seven Fortunes' Curse, `F4511`)** owns the Hotei row; without it the Void card offers nothing.
- **Feature 4.5.33 (`VI4533`)**: Momoku closes the two-point spend as it closes the whole card (read guarded).
- **Feature 4.5.12 (Bishamon), 4.5.29 (Bad Health), 4.5.31 (Blind)** read the lowered values through the trunk; no
  edit to any of them.
