# ROLLBACK — PART K Phase 11.2.3: Wizard Starting Spells

## What it adds

All in `Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for
Maintainability/`:

- `src/sheet/209.997-feat-wizard-starting-spells.js`: the `STARTING_SPELLS` table (Kitsu
  Shugenja only, Core Rulebook p.118 as quoted by the owner) and `CW1123`. It rebinds, by
  property: `CW1122.spellsStep.render`, `CW1122.openFor`, `CW112.applySchool` and `CW112.start`.
  It also pushes one rule, `school-starting-spells` (`info`), onto Phase 5's
  `CHARACTER_VALIDATOR_RULES`.
- **No stylesheet**, deliberately (see the README).
- One manifest entry.
- One delimited block in `src/sheet/210-test-seam-and-init.js`:
  `// PART K PHASE 11.2.3 BEGIN wizard4-seam` … `// END WIZARD1123 wizard4-seam`.
- `expect_sha256` in `build/manifest.json`.

Nothing in the save format changes: the spells are ordinary Technique rows and their scrolls
ordinary Equipment rows.

## Remove it

On a scratch copy of the Phase 0 tree (the remover refuses the live tree):

```bash
cp -r "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability" /tmp/p0
python3 "Versions/PART K — Phase 11.2.3 Wizard Starting Spells/qa/remove-phase.py" /tmp/p0
python3 /tmp/p0/build/recombine.py --verify
```

Measured: byte-identical to `a2d148ee…` (3,030,719 bytes, commit `8c9b9eb`). The Spells step goes
back to 11.2.2's generic picker and note, and the character check loses its starting-spells note.

Or set `WIZARD_STARTING_SPELLS_ENABLED = false`: nothing is rebound or registered.

## Dependencies

- **Hard, on Phase 11.2.2 (Wizard Free Choices, Spells and Kiho):** it extends 11.2.2's Spells
  step and uses its `addSpell`, `removeSpell`, `openBox` and reminder. **Remove this phase
  first.** Measured: 11.2.2's remover refuses while this fragment is present. Declared in
  11.2.2's ROLLBACK too.
- **Soft, on Phase 5 (Part J, Character Creation Linting):** the `school-starting-spells` rule is
  pushed onto `CHARACTER_VALIDATOR_RULES` only when that registry and `validationFinding()`
  exist. Without Phase 5 the wizard works unchanged, and there is simply no note. Declared in
  Phase 5's ROLLBACK too.
- **On the trunk:** `SPELL_LIBRARY`, `spellEligibility()`, `getSchoolsList()`, `#techList` rows
  and their `data-spell-element`.

## Fixtures it changed in other phases

Found while building this phase: each Part K stage's live removal fixture had been failing since
the next stage landed (see the README). Declared here and in each phase's ROLLBACK:

1. **`test-removal.py` of Phase 11, 11.2, 11.2.1 and 11.2.2:** the live-tree test first removes
   every later Part K stage present, newest first, each with its own remover (`strip_later`).
   All five pass 15/15.
2. **`verify-variants.py` of Phase 11, 11.2 and 11.2.2:** the "previous build (phase removed)"
   variant does the same, so it can reach that phase's own remover. Their other variants still
   run on the live tree.
3. **`verify-variants.py` of 11.2.1:** it already removed 11.2.2 before every variant; it now
   removes every later stage, this one included.

No harness check was changed.
