# ROLLBACK — PART K Phase 11.2.2: Wizard Free Choices, Spells and Kiho

## What it adds

All in `Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for
Maintainability/`:

- `src/sheet/209.996-feat-wizard-free-choices.js`: the free-choice reader, the Lore box, the
  Spells and Kiho steps, the reminder and the Review list. It rebinds, by property:
  `CW1121.slots`, `CW1121.groupsForSlot`, `CW1121.skillsStep.render`, `CW112.render`,
  `CW112.refreshNav`, `CW112.next`, `CW112.applySchool`, `CW112.start` and the Review step's
  `render`. Each wrapper keeps the previous binding and calls it.
- `src/css/59.996-feat-wizard-free-choices.css`: its own classes (`cw1122-*`) and the Lore
  box's 44px height.
- Two manifest entries.
- One delimited block in `src/sheet/210-test-seam-and-init.js`:
  `// PART K PHASE 11.2.2 BEGIN wizard3-seam` … `// END WIZARD1122 wizard3-seam`. It also puts
  the trunk's `SPELL_LIBRARY` on the test seam, which it was not on before.
- `expect_sha256` in `build/manifest.json`.

It adds nothing to the save format: Skills, spells, scrolls and Kiho are ordinary sheet rows.

## Remove it

On a scratch copy of the Phase 0 tree (the remover refuses the live tree):

```bash
cp -r "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability" /tmp/p0
python3 "Versions/PART K — Phase 11.2.2 Wizard Free Choices Spells and Kiho/qa/remove-phase.py" /tmp/p0
python3 /tmp/p0/build/recombine.py --verify
```

Measured: byte-identical to `ee049396…` (3,003,661 bytes, commit `7f25263`). The wizard goes back
to 11.2.1's eight steps, with its narrower reading of free choices and no reminder.

Or set `WIZARD_FREE_CHOICES_ENABLED = false`: nothing is rebound and no step is added.

## Dependencies

- **Hard, on Phase 11.2.1 (Wizard Skills and Advantages):** it replaces 11.2.1's free-choice
  reading and wraps its Skills step. **Remove this phase first.** Measured: 11.2.1's remover
  refuses while this fragment is present. Declared in 11.2.1's ROLLBACK too.
- **Hard, on Phase 11.2 (Creation Wizard):** through 11.2.1, and directly (it wraps `CW112`'s
  methods). 11.2's remover also refuses while this fragment is present (measured; it stops at
  11.2.1 first).
- **Soft, on Phase 5 (Part J):** the Kiho step's overspend message reads `validateCharacter()`
  through `CW112.findings()`; without Phase 5 it does not block on overspending.
- **On the trunk:** `findAnySchoolLibraryEntry()`, `schoolCasterCategory()`, `SPELL_LIBRARY`,
  `spellEligibility()`, `hasSpellScroll()`, `renderSpellScrollsList()` and its `+ Add` buttons,
  `spellNameFromScrollLabel()`, `#techQuickAdd` and `refreshTechQuickAddOptions()`,
  `kihoEntitlement()`, `kihoRows()`, `kihoRowIsFree()`, `renderKihoGrantNote()` and
  `#kihoGrantNote`, the Skill row's name input and Emphasis ✕, the Equipment and Technique rows'
  remove buttons, `recalcAll()`.

## Fixtures it changed in another phase

Declared here and in 11.2.1's ROLLBACK:

1. **Phase 11.2.1's `wizard2-harness.js`** moved from Skills to Advantages and on to Review with
   one Next press each. For an Isawa Shugenja this phase adds a Spells step, and asks once before
   leaving a step with a choice open, so that no longer lands on the same screen. It now moves
   **by step title** (`toStep`), as 11.2.1 did to 11.2's harness: **32/32 with and without this
   phase**, measured.
2. **Phase 11.2.1's `verify-variants.py`** now removes this phase first, with this phase's own
   remover, before building each variant. This phase replaces the free-choice reading one of
   those variants breaks, so with this phase present that variant could not fail (measured:
   32/32, off target). With it removed first, all nine of 11.2.1's variants fail where
   expected again (measured).

No other harness was changed. Phase 11.2's suite passes 43/43 unchanged.

## Depended on by

- **Phase 11.2.3 (Wizard Starting Spells), hard.** It rebinds `CW1122.spellsStep.render` and
  `CW1122.openFor` by property, and uses `CW1122.addSpell`, `removeSpell` and `openBox`. Remove
  11.2.3 first: this phase's remover refuses while 11.2.3 is present (measured). 11.2.3 also
  changed this phase's `test-removal.py` and its "phase removed" variant to remove later stages
  first; declared in 11.2.3's ROLLBACK.
- **Phase 11.2.4 (Wizard Starting Spells for Every School), hard, through 11.2.3 and directly:**
  its picker adds spells with `CW1122.addSpell` and outlines open boxes on `CW1122.nudged`. Remove
  11.2.4 and 11.2.3 first: this phase's remover refuses while either is present (measured).

## QA files changed later (25 September)

The Kitsune Shugenja [Mantis] bugfix (25 September) deleted one library line, which changes the
build under every stage, so the same live test also undoes that fix first, with the fix's own
remover (`LATER_FIXES`), and passes 15/15. Declared in that fix's ROLLBACK.

Phase 11.2.4 (25 September) added itself to this phase's `LATER_STAGES`, in `test-removal.py`
and `verify-variants.py`, so both remove it first; 15/15. Declared in 11.2.4's ROLLBACK.

Phase 11.2.4 records Isawa Shugenja's starting spells, and this phase's harness uses Isawa to
stand for a School with no recorded line. Its `fresh()` now takes Isawa's line away for its own
page when one is recorded (a no-op without 11.2.4); no check or expectation changed. Measured:
52/52, with and without 11.2.4. Declared in 11.2.4's ROLLBACK.

The Import File Picker Filter bugfix (25 September) is listed first in this folder's `LATER_STAGES`, so the
live removal fixture removes it with its own remover before this one. Declared in that fix's ROLLBACK.

## Later-release list moved to the shared registry (25 September 2026)

This folder's removal fixtures no longer keep their own `LATER_STAGES` / `LATER_FIXES` lists. They
read the one shared list in [QA — Removal Chain Registry](../QA%20%E2%80%94%20Removal%20Chain%20Registry/README.md)
and strip every release built after this one, newest first, each by its own remover. A new release
registers itself there once instead of being added here. **This folder's live removal fixture now
depends on that registry**; its ROLLBACK says how to restore the old lists (verbatim copies are in
its `originals/`). The removal method for this release itself is unchanged.
