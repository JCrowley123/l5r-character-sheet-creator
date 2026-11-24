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
`--expect-sha dfbe292c3ed194d2af8f41393ea8972c9c7ee27631b7ff1cfac9bfb70f638021` requires the exact pre-release
build: **3,718,717 bytes** (Phase 14 Search's build with its device corrections of 9 October; it was `df80ee3c…`, 3,717,053
bytes, before them).

## Dependencies (declared)

- **On the trunk:** `consumeVoidPoint` and `rollWithModifiers` (wrapped for Touch of the Void's check, device correction of
  9 October, which also watches `#rollModalOverlay` close), `getVoidPending`, `canSpendVoid`, `getPreRollModifiers`, `renderVoidPanel`, the round ledger
  (`getRoundLedger`, `recordRoundSpend`, `hasSpentThisRound`, `getRoundSpend`), `isCombatActive`,
  `rollDicePool`, `showRollResult`, `rollWithModifiers`, `getTraitValueByName`. Each wrapper keeps the previous
  binding and calls it.
- **On Phase 4.5 (guarded):** the roll modifiers ride its adv-config seat (`advConfigExtendedRollModifiers`, no
  new registry seat, as every 4.5 release since 4.5.2); row lines are drawn from `refreshAllAdvConfigControls`.
  With `ADV_CONFIG_ENABLED` or `ADV_CONFIG_ROLL_EFFECTS_ENABLED` off, the extra Void dice and Quick's Initiative
  are not added; Momoku's closed Void card and the rows stay (measured: `qa/dependency-harness.js`, 24/24).
- **On Phase 4.5.2's Sworn Enemy suppression (an interaction, not a dependency):** the extra Void dice carry the
  source `void`, so whatever drops Void's +1k1 drops them with it.
- **None on Phase 14 Search**, which it was built on top of.

No earlier harness needed a term. The removal chain registry gained one entry, at its end.

## Release 15b B03 — Lead an ally (24 November 2026)

**A later unit now reads this release.** Release 15b B03 (`Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15b/B03 — Lead an Ally/`) wraps `VI4533.lines` and rewords two of this release's buttons: Leadership's "Lead an ally (School Rank + 1k1)" reads "Lead an ally", and Quick's "Did not act first: +Reflexes" reads "Use". Each gets its amount beside it ("1k1 + 2 (School Rank)", "+3 (Reflexes)", in its own `la15-amount` span) and a spoken name of its own. The rolls, the round ledger, once a Round, the notes and the greyed-out reasons are this release's own. This release's remover matches `VI4533` as its surface, so it refuses while B03 is present: **remove B03 first**; the removal chain does this in order.

No harness of this release needed a change: `qa/void-initiative-harness.js` reads the buttons' state, titles and `.vi4533-note` notes, not the two buttons' words, and passed 44/44 with B03 present.
