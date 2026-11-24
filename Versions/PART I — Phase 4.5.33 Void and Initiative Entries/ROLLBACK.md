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

## Release 15b B01, round 2 — Touch of the Void's button (24 November 2026)

**A second later unit now reads this release.** Release 15b B01 (`Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15b/B01 — Check Buttons Named for What They Do/`), in its round 2 (the owner's "Approve as shown", 24 November 2026), wraps `VI4533.lines`. Touch of the Void's "Willpower (TN 30)" reads "Keep control (TN 30)", with the spoken name "Keep control (TN 30): Touch of the Void, Willpower roll after you spend a Void Point", and takes the outlined look of the other check buttons (the class `ghost`). B01 also wraps the trunk's `rollWithModifiers` so that this release's failure line for that check reads "You are Dazed for one Round.", without "Tell the GM: the sheet does not track Dazed.". The roll, its TN, the check after every Void Point spent and the note are this release's own. This release's remover matches `VI4533` as its surface, so it refuses while B01 is present: **remove B01 first** (and B03); the removal chain does this in order.

**Declared fixture correction.** `qa/void-initiative-harness.js` is conditional on B01: while `CN15` is on the seam, `VI-TOUCH-ROW` and `VI-TOUCH-ONLY-ITS-OWN-LIST` expect "Keep control (TN 30)". It has the same ids and count, and with B01 removed every line runs as before. `VI-TOUCH-CHECK-TN30` reads the failure line by the word "Dazed" and needed no change.
