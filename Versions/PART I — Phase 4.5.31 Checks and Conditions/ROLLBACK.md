# Remove Phase 4.5.31 Checks and Conditions

This release owns one script, one stylesheet, their two manifest entries and one guarded seam block.
Removing it returns Brash, Can't Lie, Contrary, Epilepsy, Overconfident, Rumormonger, Soft-Hearted, Lame,
Missing Limb, Disbeliever, Lost Love, Blind and Ishiken-Do to recording their cost and text only, and Void
spells to being learnable without Ishiken-Do. A saved switch (Lost Love, Soft-Hearted) or limb (Missing Limb)
is a row setting of type `chk4531`; with this release gone, Feature 4.5.3 keeps it untouched and flags it as a
setting this build cannot show. Nothing else in a character changes.

## Surgical removal (the method)

1. Copy the Phase 0 folder to a separate scratch directory (never the live tree; the remover refuses it,
   its parents and its children).
2. From this folder: `python -B qa/remove-phase.py <absolute-scratch-folder> --dry-run`, and read the plan.
3. Run it without `--dry-run`, rebuild that copy with its own `build/recombine.py --verify`, and run the
   retained suites against the rebuilt HTML (`PART I — Phase 4.5.30 Automatic Roll Entries/qa/current-suite-runner.js`).
4. Apply the same removal to the working branch, delete this folder, and remove this release's entry from
   `QA — Removal Chain Registry/removal_chain.py`.

The remover deletes only `src/sheet/209.9999998-feat-checks-conditions.js`,
`src/css/59.99994-feat-checks-conditions.css`, their manifest entries and the `checks-conditions-seam` block
in `210-test-seam-and-init.js`, and repins the manifest's `expect_sha256`. It preserves every surrounding
byte and line ending, and refuses before writing anything on foreign or malformed markers, a missing or
duplicate block or manifest entry, unsafe or linked paths, hard links into the live tree, and any leftover
`CHK4531`, `CHECKS_CONDITIONS_ENABLED`, `chk4531…` name or `chk4531-` class in a retained source. A fixture
proves Phase 4.5.30's script and stylesheet are left byte-identical.

With nothing later present, `--expect-sha 9ae14a17644a46c7a73482999637c3a8a48ac65c0428894a7ccd42c40cbd8f51`
requires the exact pre-release build: **3,614,960 bytes** (Phase 4.5.30's build, main `2a7e6da`).

## Dependencies (declared, each measured by `qa/dependency-harness.js`)

- **On base Phase 4.5 (guarded):** `advConfigExtendedRollModifiers`, `refreshAdvConfigControl`,
  `refreshAllAdvConfigControls`, `readAdvConfig` / `writeAdvConfig` and the switches `ADV_CONFIG_ENABLED` /
  `ADV_CONFIG_ROLL_EFFECTS_ENABLED`. With either switch off no entry changes a roll and no tick is offered;
  the rows, the check buttons, Blind's Armor TN and the Void spell gate stay.
- **On the declaration registry, Feature 4.5.15 (guarded):** the three ticks (Lame, Missing Limb,
  Disbeliever). Without it they are not offered; everything else stays.
- **On the casting report, Phase 8 of Part J (guarded):** the flag on a Void spell already on the list.
  Without it there is nothing to flag; learning is still gated.
- **On the Advantage eligibility gates, Feature 4.5.5 (guarded):** Ishiken-Do greyed out for a non-Shugenja
  in the picker. Without them its row still says it is not in effect.
- **On Feature 4.5.3's repairs (guarded):** told that `chk4531` is a known setting type. Without them the
  switches still save.
- **Wraps, keeping the previous binding:** `spellEligibility` and `techQuickAddOptionsHTML` (the spell
  picker), `CW1122.spellsStep.render` (the creation wizard's spell step), `R455.ineligible`,
  `R453.isUnknownConfigType`; registers with `RD4515`, `registerCastingDiagnostic` and `MODES12.register`.
- **Reads, never changes:** the trunk's Armor TN boxes (`#f_baseTN`, `#f_currentTN`, under the contract in
  the fragment's header), `getTraitValueByName`, the Honor boxes, `D45.active('Failure of Bushido')`,
  `characterCasterLock`, `hasAdvantageNamed`, `isRangedWeapon`, `getVoidPoints` / `consumeVoidPoint`,
  `renderQuickAccessPanel`.
- **None on Phase 4.5.30**, which it was built on top of: either can be removed alone (the removal chain
  removes later releases first).

## Cross-phase fixture corrections (declared)

Four earlier harnesses pinned a count this release changes. Each gained a term that applies only while
`CHK4531` is present, so with this release removed they check exactly what they checked before:

- Phase 8 (Part J) `casting-diagnostics-harness.js`, "all seven built-in rules are registered": `ishiken-do`
  is registered at priority 15, between `school-restriction` and `rank-too-low`.
- Feature 4.5.15 `roll-declarations-harness.js`, `RD-NO-PRODUCTION-PROVIDER`, and Feature 4.5.16
  `heart-vengeance-harness.js`, `HV-PROVIDER-REGISTERED`: the `checks-conditions` tick provider.
- Feature 4.5.5 `adv-eligibility-harness.js`, `GATES455-GATE-04`: Ishiken-Do is greyed for that test's
  character, which has no Shugenja School.

The removal chain registry gained one entry, at its end.

## Declared dependents (added 9 October 2026)

- Phase 4.5.34 Blind's Armor TN Note (Part I) reads `CHK4531.has('Blind')` and the `data-chk4531` mark on `#f_baseTN` to explain Blind's base. A hard dependency: removing this release means removing 4.5.34 first (the removal chain does so).

## Release 15a A05 — Missing Limb's picker (7 November 2026)

Release 15a A05 (`Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A05 — Missing Limb Picker/`), under the owner's ruling Q1, restyles this release's Missing Limb field as a shared field. While `body.lp15-on` is set, an observer on `#disadvList` replaces the text node of `label.chk4531-field` ("Missing ") with its own `span.lp15-label` ("Missing limb") and marks the label and its `.chk4531-row`; its stylesheet then places the label above `select.chk4531-limb`, gives the select the shared field's look and a 44 px height, and puts `.chk4531-note` below. It calls nothing here; the select, its options, saved value and `aria-label` are unchanged. This harness passes 101/101 with A05 present. A05 names `chk4531-*` classes, so this release's remover may refuse while A05 is present: remove A05 first (the removal chain does so in order).

## Release 15a A11 — explanatory text gaps (7 November 2026)

Release 15a A11 (`Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A11 — Explanatory Text Gaps and One Left Edge/`), on the owner's word of 7 November, gives this release's condition row (`.chk4531-row` / `.dsx4532-row`) a 6 px bottom margin while `body.te15-on` is set, so the description no longer sits 2 px under its controls. Stylesheet only; it calls nothing here. This release's harness passes in full with A11 present. A11's stylesheet names this release's row class, so this release's remover may refuse while A11 is present: remove A11 first (the removal chain does so in order).
