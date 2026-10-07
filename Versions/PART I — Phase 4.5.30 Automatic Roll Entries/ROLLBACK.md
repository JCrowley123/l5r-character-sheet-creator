# Remove Phase 4.5.30 Automatic Roll Entries

This release owns one script, one stylesheet, their two manifest entries and one guarded seam block.
Removing it returns Silent, Prodigy, Voice, Bad Eyesight, Disturbing Countenance and Anachronism to
recording their cost and text only. No character data changes: nothing this release does is saved.

## Surgical removal (the method)

1. Copy the Phase 0 folder to a separate scratch directory (never the live tree; the remover refuses it,
   its parents and its children).
2. From this folder: `python -B qa/remove-phase.py <absolute-scratch-folder> --dry-run`, and read the plan.
3. Run it without `--dry-run`, rebuild that copy with its own `build/recombine.py --verify`, and run the
   retained suites against the rebuilt HTML (`PART I — Phase 4.5.29 Wound Entries/qa/current-suite-runner.js`).
4. Apply the same removal to the working branch, delete this folder, and remove this release's entry from
   `QA — Removal Chain Registry/removal_chain.py`.

The remover deletes only `src/sheet/209.9999997-feat-automatic-entries.js`,
`src/css/59.99993-feat-automatic-entries.css`, their manifest entries and the `automatic-entries-seam` block
in `210-test-seam-and-init.js`, and repins the manifest's `expect_sha256`. It preserves every surrounding
byte and line ending, and refuses before writing anything on foreign or malformed markers, a missing or
duplicate block or manifest entry, unsafe or linked paths, hard links into the live tree, and any leftover
`AUTO4530`, `AUTOMATIC_ENTRIES_ENABLED`, `auto4530…` name or `auto4530-` class in a retained source. A fixture
proves Phase 4.5.29's script and stylesheet are left byte-identical.

With nothing later present, `--expect-sha fa745f5b243121c1cd8a115c01aa7dbeaca8712b4cd58be386b9e401efec9aaf`
requires the exact pre-release build: **3,604,557 bytes** (Phase 4.5.29's build).

## Dependencies (declared)

- **On base Phase 4.5 (hard for the dice, guarded):** `advConfigExtendedRollModifiers` and
  `ADV_CONFIG_ENABLED` / `ADV_CONFIG_ROLL_EFFECTS_ENABLED`; with either switch off no entry changes a roll
  (measured: `qa/dependency-harness.js`). The row line rides `refreshAllAdvConfigControls`.
- **On Part C Feature 1's `isRangedWeapon` (soft):** without it Bad Eyesight applies to Perception-based
  rolls only (`RANGED-TEST-ABSENT`).
- **Reads the School data** (`getSchoolsList`, `schoolConcreteSkillNames`, the Skills table's School tick)
  for Prodigy; changes none of it.
- **None on Phase 4.5.29**, which it was built on top of: the two touch different things and either can be
  removed alone (the removal chain removes later releases first).

No later release depends on this one. No retained harness changed. The removal chain registry gained one
entry, at its end.
