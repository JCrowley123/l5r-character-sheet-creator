# Remove Phase 4.5.33 Void and Initiative Entries

This release owns one script, one stylesheet, their two manifest entries and one guarded seam block. Removing it
returns Daredevil, Touch of the Void, Momoku, Quick and Leadership to recording their cost and text only. It saves
nothing in a character: Quick's and Leadership's uses live in the trunk's round ledger, which is transient.

## Surgical removal (the method)

1. Copy the Phase 0 folder to a separate scratch directory (never the live tree; the remover refuses it).
2. From this folder: `python -B qa/remove-phase.py <absolute-scratch-folder> --dry-run`, and read the plan.
3. Run it without `--dry-run`, rebuild that copy with `build/recombine.py --verify`, and run the retained suites
   against the rebuilt HTML.
4. Apply the same removal to the working branch, delete this folder, and remove this release's entry from
   `QA — Removal Chain Registry/removal_chain.py`.

The remover deletes only `src/sheet/209.99999993-feat-void-initiative-entries.js`,
`src/css/59.99997-feat-void-initiative-entries.css`, their manifest entries and the `void-initiative-entries-seam`
block, and repins `expect_sha256`; it refuses on any leftover `VI4533`, `VOID_INITIATIVE_ENTRIES_ENABLED`, `vi4533…`
name or `vi4533-` class in a retained source. With nothing later present,
`--expect-sha df80ee3ca32376d5151325a6bb7a223f053357d5632391dcf651297e656e8857` requires the exact pre-release
build: **3,717,053 bytes** (Phase 14 Search's build).

## Dependencies (declared)

- **On the trunk:** the pre-roll registry (`registerPreRollModifier`, contributor `void-initiative-entries`,
  priority 51), `getVoidPending`, `canSpendVoid`, `getPreRollModifiers`, `renderVoidPanel`, the round ledger
  (`getRoundLedger`, `recordRoundSpend`, `hasSpentThisRound`, `getRoundSpend`), `isCombatActive`,
  `rollDicePool`, `showRollResult`, `rollWithModifiers`, `getTraitValueByName`. Each wrapper keeps the previous
  binding and calls it.
- **On Phase 4.5 (guarded):** row lines are drawn from `refreshAllAdvConfigControls`. With
  `ADV_CONFIG_ENABLED` off everything stays (measured: `qa/dependency-harness.js`, 18/18).
- **On Phase 4.5.2's Sworn Enemy suppression (an interaction, not a dependency):** the extra Void dice carry the
  source `void`, so whatever drops Void's +1k1 drops them with it.
- **None on Phase 14 Search**, which it was built on top of.

No earlier harness needed a term. The removal chain registry gained one entry, at its end.
