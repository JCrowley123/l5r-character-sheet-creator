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

## Release 15a A11 — explanatory text gaps (7 November 2026)

Release 15a A11 (`Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A11 — Explanatory Text Gaps and One Left Edge/`), on the owner's word of 7 November, gives this release's condition row (`.chk4531-row` / `.dsx4532-row`) a 6 px bottom margin while `body.te15-on` is set, so the description no longer sits 2 px under its controls. Stylesheet only; it calls nothing here. This release's harness passes in full with A11 present. A11's stylesheet names this release's row class, so this release's remover may refuse while A11 is present: remove A11 first (the removal chain does so in order).

## Release 15b B18 — one name per button job (26 November 2026)

**A later unit now reads this release.** Release 15b B18 (`Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15b/B18 — One Name per Button Job/`) names Great Destiny's, Dark Fate's and Haunted's buttons (`.dsx4532-btn`): "Reset session" reads "Reset", heard "Reset {entry} for a new session"; Use is heard "Use Great Destiny: …"; and the message after a second Use reads "… Reset to use it again." (B18 rewrites it as the message window is asked for). Its words and spoken names are the ones the owner approved on B18's board (25 November 2026); what this release does is unchanged. This release's remover finds `dsx4532-btn` in B18's script, so it refuses while B18 is present: **remove B18 first**; the removal chain does this in order.

**Declared fixture correction.** `qa/damage-sessions-xp-harness.js` follows B18: while `BN15` is on the seam, the rows expect "Reset", the used message "… Reset to use it again.", and the presses look for "Reset" (`DS-GREAT-DESTINY-*`, `DS-DARK-FATE-*`, `DS-DESTINY-EXCEPTION`, `DS-HAUNTED-*`). It keeps its ids and count, and with B18 removed every line runs as before.

## Release 15b B18.1 — one size for Reset (26 November 2026)

**A later unit now styles this release's buttons.** Release 15b B18.1 (`Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15b/B18.1 — One Size for Reset/`) gives Great Destiny's, Dark Fate's and Haunted's buttons (`.dsx4532-btn`) the one Reset size the owner approved (28 px tall, capitals, .78rem; round 2 of B18, 25 November 2026), from its stylesheet under `body.rs15-on`. It calls nothing here. This release's remover finds `dsx4532-btn` in B18.1's stylesheet, so it refuses while B18.1 is present: **remove B18.1 first**; the removal chain does this in order.
