# Remove Phase 4.5.35 Initiative Score

This release owns one script, one stylesheet, their two manifest entries and one guarded seam block. Removing it
removes the Initiative Score lines (Combat card, Quick Access, Quick's row) and the Set score field; Quick, Void and
the Initiative roll work exactly as before. Its two ledger entries ('Initiative', 'Initiative bonuses') live in the
trunk's round ledger, which is transient: nothing is saved in a character either way.

## Surgical removal (the method)

1. Copy the Phase 0 folder to a separate scratch directory (never the live tree; the remover refuses it).
2. From this folder: `python -B qa/remove-phase.py <absolute-scratch-folder> --dry-run`, and read the plan.
3. Run it without `--dry-run`, rebuild that copy with `build/recombine.py --verify`, and run the retained suites
   against the rebuilt HTML (`BUGFIX — Characters Screen Top Bar/qa/current-suite-runner.js`).
4. Apply the same removal to the working branch, delete this folder, and remove this release's entry from
   `QA — Removal Chain Registry/removal_chain.py`.

The remover deletes only `src/sheet/209.99999996-feat-initiative-score.js`, `src/css/59.999982-feat-initiative-score.css`,
their manifest entries and the `initiative-score-seam` block, and repins `expect_sha256`; it refuses on any leftover
`IS4535`, `IS4535UI`, `INITIATIVE_SCORE_ENABLED`, `is4535…` id or `is4535-` class in a retained source. With nothing later
present, `--expect-sha 8a7d72fc1d8cac7a63be96157ebe814c91bd48ce54f0ce99e89c103c25b3cfae` requires the exact pre-release
build: **3,740,458 bytes** (Phase 4.5.33's device correction, branch `claude/phase-4-5-33-device-correction`).

## Dependencies (declared)

- **On Feature 4.5.33 (guarded):** Quick's bonus reaches the score through 4.5.33's Initiative modifier (source
  `quick`), and the score is written on Quick's row (`VI4533.rows`, `.vi4533-row`). Without 4.5.33 there is no Quick
  and no line on its row; the roll, Void's +10, Center's +10 and a typed total still make the score (measured: the
  pinned variant "Quick entries switched off" fails only the Quick checks). Feature 4.5.33 gains a reader, not a
  dependent: removing 4.5.33 means removing this release first (the removal chain does so), and 4.5.33's row works as
  before without it (its own harness, 44/44, on the build with and without this release).
- **On the trunk:** `rollWithModifiers`, `refreshAllAdvConfigControls`, `renderCombatRoundUI` and
  `renderQuickAccessPanel` (wrapped; each wrapper keeps the previous binding and calls it), the round ledger
  (`getRoundLedger`, `recordRoundSpend`, `clearRoundSpend`), `getPreRollModifiers`, `makeRollContext`, `ROLL_KINDS`,
  `getTraitValueByName`, `#f_initiative`, `#qaInitiativeValue`, and `#rollModalOverlay` / `#rollTotalDisplay` (watched
  to follow dice the player re-keeps before closing the roll).

The removal chain registry gained one entry, at its end.
