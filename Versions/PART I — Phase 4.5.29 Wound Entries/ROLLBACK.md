# Remove Phase 4.5.29 Wound Entries

This release owns one script, one stylesheet, their two manifest entries and one guarded seam block.
Removing it returns Strength of the Earth, Low Pain Threshold, Bad Health and Permanent Wound to recording
their cost and text only. **The wound core is untouched either way**: this release never edits
`110-modals-trackers.js` or `170-feat-wounds.js`; it only rebinds three of their function names, keeping each
original inside its wrapper, so deleting the script restores them exactly. No character data changes: nothing
this release does is saved.

## Surgical removal (the method)

1. Copy the Phase 0 folder to a separate scratch directory (never the live tree; the remover refuses it,
   its parents and its children).
2. From this folder: `python -B qa/remove-phase.py <absolute-scratch-folder> --dry-run`, and read the plan.
3. Run it without `--dry-run`, rebuild that copy with its own `build/recombine.py --verify`, and run the
   retained suites against the rebuilt HTML
   (`PART I — Phase 4.5.28 Situational Entry Buttons and Gates/qa/current-suite-runner.js`).
4. Apply the same removal to the working branch, delete this folder, and remove this release's entry from
   `QA — Removal Chain Registry/removal_chain.py`.

The remover deletes only `src/sheet/209.9999996-feat-wound-entries.js`, `src/css/59.99992-feat-wound-entries.css`,
their manifest entries and the `wound-entries-seam` block in `210-test-seam-and-init.js`, and repins the
manifest's `expect_sha256`. It preserves every surrounding byte and line ending, and refuses before writing
anything on foreign or malformed markers, a missing or duplicate block or manifest entry, unsafe or linked
paths, hard links into the live tree, and any leftover `WND4529`, `WOUND_ENTRIES_ENABLED`, `wound4529…` name or
`wound4529-` class in a retained source.

With nothing later present, `--expect-sha d711f1ce7de21121e8fb3c915ff49f1ff26502ae18ff1e11041182f949b39311`
requires the exact pre-release build: **3,587,753 bytes**, `main` at `9f84489`.

## If the wound core changes (the owner's planned end-of-project review)

Nothing here needs to change as long as `computeWoundThresholds(earth)`, `getWoundPenalty()` and
`formatWoundPenalty(lvl)` keep the meanings written in THE CONTRACT at the top of the script. Rename or
replace one and its adapter is not installed (guarded) and this release's `WE-CONTRACT-*` checks fail; the
fix is then in the script's adapters only. Removing this release first and re-adding it afterwards is also
safe: it holds no state.

## Dependencies (declared)

- **On the wound core (hard, guarded):** the three functions above (Part C Feature 3, Part H Phase 1.6).
- **On base Phase 4.5 (soft):** the roll line rides `advConfigExtendedRollModifiers` and the row lines
  `refreshAllAdvConfigControls`; with the Advantage configuration or its roll effects switched off, those two
  go and the penalties, Wound Ranks and track text still work (measured: `qa/dependency-harness.js`).
- **Nothing reads it:** Dark Paragon's Determination (Feature 4.5.23) calls `getWoundPenalty()` by name, so it
  negates the adjusted penalty without any change; the Quick Access panel mirrors the track's own text.

No later release depends on this one. No retained harness changed. The removal chain registry gained one
entry, at its end.
