# Remove Phase 4.5.32 Damage, Sessions and XP

This release owns one script, one stylesheet, their two manifest entries and one guarded seam block.
Removing it returns Hands of Stone, Large, Small, Great Destiny, Dark Fate, Haunted, Enlightened, Obtuse and
Blissful Betrothal to recording their cost and text only. In a character: a saved switch or session use (row
setting of type `dsx4532`) is then kept untouched and flagged by Feature 4.5.3 as a setting this build cannot
show; a cost Blissful Betrothal discounted stays as it is in the box, the player's to change (the remembered
price, `blissful` in the save, is simply not read); Wounds already set by Great Destiny or Dark Fate stay set.

## Surgical removal (the method)

1. Copy the Phase 0 folder to a separate scratch directory (never the live tree; the remover refuses it,
   its parents and its children).
2. From this folder: `python -B qa/remove-phase.py <absolute-scratch-folder> --dry-run`, and read the plan.
3. Run it without `--dry-run`, rebuild that copy with its own `build/recombine.py --verify`, and run the
   retained suites against the rebuilt HTML (`PART I — Phase 4.5.31 Checks and Conditions/qa/current-suite-runner.js`).
4. Apply the same removal to the working branch, delete this folder, and remove this release's entry from
   `QA — Removal Chain Registry/removal_chain.py`.

The remover deletes only `src/sheet/209.9999999-feat-damage-sessions-xp.js`,
`src/css/59.99995-feat-damage-sessions-xp.css`, their manifest entries and the `damage-sessions-xp-seam` block
in `210-test-seam-and-init.js`, and repins the manifest's `expect_sha256`. It preserves every surrounding
byte and line ending, and refuses before writing anything on foreign or malformed markers, a missing or
duplicate block or manifest entry, unsafe or linked paths, hard links into the live tree, and any leftover
`DSX4532`, `DAMAGE_SESSIONS_XP_ENABLED`, `dsx4532…` name or `dsx4532-` class in a retained source. A fixture
proves Phase 4.5.31's script and stylesheet are left byte-identical.

With nothing later present, `--expect-sha 9bfbf6f207d069a241d1c212543afd920ceac3ade2ce784303ee78d7df74c733`
requires the exact pre-release build: **3,650,567 bytes** (Phase 4.5.31's build).

## Dependencies (declared, each measured by `qa/dependency-harness.js`)

- **On base Phase 4.5 (guarded):** `refreshAdvConfigControl`, `refreshAllAdvConfigControls`, `readAdvConfig` /
  `writeAdvConfig` and the switches `ADV_CONFIG_ENABLED` / `ADV_CONFIG_ROLL_EFFECTS_ENABLED`. With either switch
  off Haunted's tick is not offered; damage, the Destinies, the XP entries, the rows and Blissful Betrothal's
  prices stay (none of them is a roll modifier, and the prices are set on every pass).
- **On the declaration registry, Feature 4.5.15 (guarded):** Haunted's tick. Without it the tick is not
  offered; everything else stays.
- **On the Advantage eligibility gates, Feature 4.5.5 (guarded):** Large and Small greyed beside each other in
  the pickers. Without them they are not greyed; with both on the list neither applies, and their rows say so.
- **On Feature 4.5.3's repairs (guarded):** told that `dsx4532` is a known setting type.
- **The contracts (see the fragment's header), each wrapper calling the core first:** `getWeaponDamageDice`
  and `rollWeaponDamage` (damage dice and the result's note), `computeWoundThresholds` (read, via Feature
  4.5.29: the Destinies follow any change to it), `voidCost` (Enlightened), `getPaidEmphCount` then
  `skillCost` (Obtuse), the Advantage rows' `.en-cost` after every other module (Blissful Betrothal).
- **Also wraps, keeping the previous binding:** `rollWithModifiers` (Haunted's use is spent by the roll it
  reaches), `collectData` and `makeEntry` (the remembered prices), `R455.ineligible`,
  `R453.isUnknownConfigType`; registers with `RD4515` and `MODES12.register`.
- **None on Phase 4.5.31**, which it was built on top of: either can be removed alone (the removal chain
  removes later releases first).

## Cross-phase fixture corrections (declared)

Two earlier harnesses list the production tick providers: Feature 4.5.15 `roll-declarations-harness.js`,
`RD-NO-PRODUCTION-PROVIDER`, and Feature 4.5.16 `heart-vengeance-harness.js`, `HV-PROVIDER-REGISTERED`. Each
gained a term for `damage-sessions-xp` that applies only while `DSX4532` is present.

The removal chain registry gained one entry, at its end.
