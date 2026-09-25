# ROLLBACK — PART K Phase 11.2.1: Wizard Skills and Advantages

## What it adds

All in `Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for
Maintainability/`:

- `src/sheet/209.995-feat-wizard-skills-advantages.js`: the two steps, and the code that inserts
  them into Phase 11.2's wizard and wraps `CW112.applySchool`, `CW112.start`, `CW112.finish` and
  the Review step's `render` by property.
- `src/css/59.995-feat-wizard-skills-advantages.css`: its own classes (`cw1121-*`).
- Two manifest entries.
- One delimited block in `src/sheet/210-test-seam-and-init.js`:
  `// PART K PHASE 11.2.1 BEGIN wizard2-seam` … `// END WIZARD1121 wizard2-seam`.
- `expect_sha256` in `build/manifest.json`.

It adds nothing to the save format: Skills and Advantages it adds are ordinary sheet rows.

## Remove it

On a scratch copy of the Phase 0 tree (the remover refuses the live tree):

```bash
cp -r "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability" /tmp/p0
python3 "Versions/PART K — Phase 11.2.1 Wizard Skills and Advantages/qa/remove-phase.py" /tmp/p0
python3 /tmp/p0/build/recombine.py --verify
```

Measured: byte-identical to `9244163e…` (2,985,043 bytes, commit `5c50e87`). The wizard goes back
to six steps, and its Review again says Skills and Advantages are finished on the sheet.

Or set `WIZARD_SKILLS_ADV_ENABLED = false`: the two steps are then never inserted.

## Dependencies

- **Hard, on Phase 11.2 (Creation Wizard):** everything here extends `CW112`. **Remove this
  phase first.** Measured: 11.2's remover refuses while this fragment is present. Declared in
  11.2's ROLLBACK too.
- **Soft, on Phase 5 (Part J):** the overspend gate reads `validateCharacter()` through
  `CW112.findings()`; without Phase 5 the steps do not block on overspending.
- **Soft, on Phase 4.5 (Part I):** a configurable Advantage opens its own choice because the
  sheet's `#advQuickAdd` handler calls `openAdvConfigModal` when present; this phase only mirrors
  the picker. Ineligible entries are greyed because Phase 4.5.5 greys the sheet's own options,
  which are copied as they are.
- **On the trunk:** `#skillQuickAdd`, `#advQuickAdd`, `#disadvQuickAdd`, the Skill row's inputs
  and remove button, the entry rows, `findSkill()`, `findAnySchoolLibraryEntry()`, `setStatus()`.

## A fixture it changed in another phase

Phase 11.2's `wizard-harness.js` reached Review with a fixed number of Next clicks, and went back
to School with a fixed number of Back clicks. With the two extra steps that no longer lands on the
same screen. It now moves **by step title** (`toStep`, `backTo`), which works with and without this
phase: **43/43 both ways**, measured. No other harness was changed.

## Depended on by

- **Phase 11.2.2 (Wizard Free Choices, Spells and Kiho), hard.** It replaces this phase's
  `CW1121.slots` and `CW1121.groupsForSlot` and wraps `CW1121.skillsStep.render`, all by
  property. Remove 11.2.2 first: this phase's remover refuses while 11.2.2 is present
  (measured). 11.2.2 changed two of this phase's QA files, declared in its ROLLBACK:
  `wizard2-harness.js` now moves by step title (32/32 with and without 11.2.2), and
  `verify-variants.py` removes 11.2.2 before building each variant, so the variants measure this
  phase's own code.

## QA files changed later (25 September)

Phase 11.2.3 found this phase's live removal fixture failing once a later Part K stage depended
on it: this phase's remover correctly refuses while one is present. `qa/test-removal.py` now
removes every later Part K stage first, newest first, each with its own remover, and passes
15/15. Its "phase removed" variant in `qa/verify-variants.py` does the same. Declared in 11.2.3's
ROLLBACK.

The Kitsune Shugenja [Mantis] bugfix (25 September) deleted one library line, which changes the
build under every stage, so the same live test also undoes that fix first, with the fix's own
remover (`LATER_FIXES`), and passes 15/15. Declared in that fix's ROLLBACK.

Phase 11.2.4 (25 September) added itself to this phase's `LATER_STAGES`, in `test-removal.py`
and `verify-variants.py`, so both remove it first; 15/15. Declared in 11.2.4's ROLLBACK.

Phase 11.2.4 records Isawa Shugenja's starting spells, and this phase's harness uses Isawa to
stand for a School with no recorded line. Its `fresh()` now takes Isawa's line away for its own
page when one is recorded (a no-op without 11.2.4); no check or expectation changed. Measured:
32/32, with and without 11.2.4. Declared in 11.2.4's ROLLBACK.
