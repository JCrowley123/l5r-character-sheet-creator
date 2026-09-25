# ROLLBACK — PART K Phase 11.2: Creation Wizard

## What it adds

All in `Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for
Maintainability/`:

- `src/sheet/209.994-feat-creation-wizard.js`: the whole wizard, plus the rebinding of Phase 11's
  `CL11.createNew` that launches it.
- `src/css/59.994-feat-creation-wizard.css`: its own classes (`cw112-*`).
- Two manifest entries, one for each file above.
- One delimited block in `src/sheet/210-test-seam-and-init.js`:
  `// PART K PHASE 11.2 BEGIN wizard-seam` … `// END WIZARD112 wizard-seam`, the guarded seam
  export.
- `expect_sha256` in `build/manifest.json`.

Characters made with the wizard are ordinary saves. It adds nothing to the save format.

## Remove it

On a scratch copy of the Phase 0 tree (the remover refuses the live tree):

```bash
cp -r "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability" /tmp/p0
python3 "Versions/PART K — Phase 11.2 Creation Wizard/qa/remove-phase.py" /tmp/p0
python3 /tmp/p0/build/recombine.py --verify
```

Measured: the result is byte-identical to `6043dabb…` (2,958,319 bytes, commit `2b3b8c4`), and
`manifest.json` and `210-test-seam-and-init.js` match that commit exactly. Copy the tree back, then
delete this folder. "Create New Character" then goes back to starting a blank saved character.

Or set `CREATION_WIZARD_ENABLED = false` to keep it in the build but switched off.

## Dependencies

- **Hard, on Phase 11 (Characters List and Save Model):** the wizard is launched by rebinding
  `CL11.createNew`, and relies on the character already being saved. **Remove this phase first.**
  Measured: Phase 11's remover refuses while this fragment is present, and removing 11.2 then 11
  reaches `864c5134…` exactly. Declared in Phase 11's ROLLBACK too.
- **Soft, on Phase 5 (Part J, Character Creation Linting):** each step's gate and the Review list
  come from `validateCharacter()`. Guarded with `typeof`: without Phase 5, steps gate only on
  whether each choice was applied, and Review says the check is unavailable. Declared in Phase 5's
  ROLLBACK.
- **Soft, on Phase 9 (Part H, Clan-Themed Look):** Clan cards show `CLAN_MON_DATA` images when
  present. Declared in Phase 9's ROLLBACK.
- **On the trunk:** the Clan/Family/School selects and Apply buttons, `schoolsForPicker()`,
  `getSchoolsList()`, the Trait inputs, the Void stepper, `RINGS`, `resetToBaseline()`,
  `appConfirm()`, `setStatus()`, `currentId`.

## A fixture it changed in another phase

Phase 11's `characters-harness.js` clicked Create New Character and then tapped the Characters
list. With the wizard present, that tap would land on the wizard. The check now closes the wizard
first, **only if the wizard is present** (`CW112 && CW112.isOpen()`), so it passes with this phase
present and with it removed: 70/70 both ways. No other retained harness was changed.

## Depended on by

- **Phase 11.2.1 (Wizard Skills and Advantages), hard.** It inserts two steps into `CW112.steps`
  and wraps `applySchool`, `start`, `finish` and the Review step's `render` by property. Remove
  11.2.1 first: this phase's remover refuses while 11.2.1 is present (measured). 11.2.1 also
  changed this phase's harness to navigate by step title; 43/43 with and without 11.2.1.

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

The Import File Picker Filter bugfix (25 September) is listed first in this folder's `LATER_STAGES`, so the
live removal fixture removes it with its own remover before this one. Declared in that fix's ROLLBACK.

## Later-release list moved to the shared registry (25 September 2026)

This folder's removal fixtures no longer keep their own `LATER_STAGES` / `LATER_FIXES` lists. They
read the one shared list in [QA — Removal Chain Registry](../QA%20%E2%80%94%20Removal%20Chain%20Registry/README.md)
and strip every release built after this one, newest first, each by its own remover. A new release
registers itself there once instead of being added here. **This folder's live removal fixture now
depends on that registry**; its ROLLBACK says how to restore the old lists (verbatim copies are in
its `originals/`). The removal method for this release itself is unchanged.
