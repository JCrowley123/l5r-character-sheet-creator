# ROLLBACK — PART K Phase 11.2.4: Wizard Starting Spells for Every School

## What it adds

All in `Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for
Maintainability/`:

- `src/sheet/209.998-feat-wizard-starting-spells-all.js`: the other 20 Schools' lines
  (`STARTING_SPELLS_EVERY_SCHOOL`), the Yogo list of spells treated as Wards
  (`YOGO_TREATED_AS_WARDS`) and `CW1124`, which reads the three lines that are not Element counts.
  It rebinds, by property: `CW1123.forSchool`, `CW1123.describe`, `CW1123.open` and
  `CW1123.render`. Each wrapper keeps the previous binding and calls it. 11.2.3's own table
  (`CW1123.table`, Kitsu only) is not touched.
- **No stylesheet.** The boxes reuse 11.2.1's `cw1121-*` and 11.2.2's `cw1122-open-slot` classes.
- One manifest entry.
- One delimited block in `src/sheet/210-test-seam-and-init.js`:
  `// PART K PHASE 11.2.4 BEGIN wizard5-seam` … `// END WIZARD1124 wizard5-seam`.
- `expect_sha256` in `build/manifest.json`.

Nothing in the save format changes: spells are ordinary Technique rows and their scrolls ordinary
Equipment rows, exactly as 11.2.3 adds them.

## Remove it

On a scratch copy of the Phase 0 tree (the remover refuses the live tree):

```bash
cp -r "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability" /tmp/p0
python3 "Versions/PART K — Phase 11.2.4 Wizard Starting Spells for Every School/qa/remove-phase.py" /tmp/p0
python3 /tmp/p0/build/recombine.py --verify
```

Measured: byte-identical to `63b51115…` (3,042,451 bytes, commit `90d3452`, the Kitsune [Mantis]
fix). Every School but Kitsu goes back to 11.2.2's generic Spells step and its "does not record"
note, and the character check stops noting their allotments.

Or set `WIZARD_STARTING_SPELLS_ALL_ENABLED = false`: nothing is rebound.

## Dependencies

- **Hard, on Phase 11.2.3 (Wizard Starting Spells):** it rebinds four of `CW1123`'s methods and
  uses `CW1123.learned()`. **Remove this phase first.** Measured: 11.2.3's remover refuses while
  this fragment is present ("retained source contains owned marker/surface"). Declared in
  11.2.3's ROLLBACK too.
- **Hard, on Phase 11.2.2, through 11.2.3 and directly:** its picker adds a spell with
  `CW1122.addSpell` and outlines open boxes on `CW1122.nudged`. 11.2.2's remover also refuses
  while it is present: measured, it names 11.2.3's fragment first, and this fragment's `CW1122`
  references match its surface pattern too.
- **Soft, on Phase 5 (Part J):** the character check's note comes from 11.2.3's rule, which reads
  this phase's lines through `CW1123.forSchool` and `CW1123.open`. Without Phase 5 there is no
  note, and nothing else changes.
- **On the trunk:** `SPELL_LIBRARY` (its `maho` and `keywords`), `spellEligibility()`,
  `#f_schoolDeficiencyElement`, `#techList` rows.
- **On the Kitsune [Mantis] bugfix, one check only:** `CW5-EVERY-SCHOOL-RECORDED` compares this
  table with the library. With that fix removed, the check fails naming Kitsune Shugenja [Mantis],
  which is then true. Declared in the fix's ROLLBACK too.

## Fixtures it changed in other phases

1. **Isawa Shugenja stands for "a School with no recorded line"** in 11.2.1's, 11.2.2's and
   11.2.3's harnesses, and this phase records it. Measured on the first combined run: seven
   failures and seven checks missing (`CW1-SAME-AS-BY-HAND`; `CW2-SPELL-COUNT-NOT-GUESSED`,
   `CW2-SPELL-OPTIONS`, `CW2-SPELLS-NUDGE` and two of 11.2.2's scenarios; and
   `CW3-UNRECORDED-SCHOOL-UNCHANGED`). Each harness's `fresh()` now takes Isawa's line away for
   its own page when one is recorded, so its checks still test the path they were written for.
   Without this phase it does nothing. **No check or expectation changed.** Measured: 32/32,
   52/52 and 25/25, with and without this phase.
2. **`LATER_STAGES` in every earlier Part K stage's `test-removal.py` and `verify-variants.py`**
   (11, 11.2, 11.2.1, 11.2.2, 11.2.3) now lists this phase first, so their live fixtures and
   "phase removed" variants remove it with its own remover before removing themselves. All five
   `test-removal.py` pass 15/15. The Kitsune [Mantis] fix's fixtures already listed it.

Declared in each of those phases' ROLLBACKs.

## Depended on by

Nothing.

The Import File Picker Filter bugfix (25 September) is listed first in this folder's `LATER_STAGES`, so the
live removal fixture removes it with its own remover before this one. Declared in that fix's ROLLBACK.

## Later-release list moved to the shared registry (25 September 2026)

This folder's removal fixtures no longer keep their own `LATER_STAGES` / `LATER_FIXES` lists. They
read the one shared list in [QA — Removal Chain Registry](../QA%20%E2%80%94%20Removal%20Chain%20Registry/README.md)
and strip every release built after this one, newest first, each by its own remover. A new release
registers itself there once instead of being added here. **This folder's live removal fixture now
depends on that registry**; its ROLLBACK says how to restore the old lists (verbatim copies are in
its `originals/`). The removal method for this release itself is unchanged.
