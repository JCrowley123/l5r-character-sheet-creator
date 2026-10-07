# Remove Phase 4.5.28 Situational Entry Buttons and Gates

This release owns one script, one stylesheet, their two manifest entries and one guarded seam block.
Removing it returns Wary and Precise Memory to Feature 4.5.27's per-roll ticks on ordinary
Investigation / Perception and Intelligence rolls, takes away the Spot ambush and Recall buttons, and
lifts the Imperial Scribe and Sacrosanct requirements (both selectable again, Imperial Scribe's +1k0
and Free Raise offered whatever the character's Status and Calligraphy). No character data changes:
nothing this release does is ever saved, and it never reprices or removes a row.

## Surgical removal (the method)

1. Copy the Phase 0 folder to a separate scratch directory (never the live tree; the remover
   refuses it, its parents and its children).
2. From this folder: `python -B qa/remove-phase.py <absolute-scratch-folder> --dry-run`, and read
   the plan.
3. Run it without `--dry-run`, rebuild that copy with its own `build/recombine.py --verify`, and
   run the retained suites against the rebuilt HTML
   (`PART I — Phase 4.5.27 Situational Roll Entries/qa/current-suite-runner.js`).
4. Apply the same removal to the working branch, delete this folder, and remove this release's
   entry from `QA — Removal Chain Registry/removal_chain.py`. The conditional corrections named
   below may stay: they pass either way.

The remover deletes only `src/sheet/209.9999995-feat-situational-buttons.js`,
`src/css/59.99991-feat-situational-buttons.css`, their manifest entries and the
`situational-buttons-seam` block in `210-test-seam-and-init.js`, and repins the manifest's
`expect_sha256`. It preserves every surrounding byte and line ending, and refuses before writing
anything on foreign or malformed markers, a missing or duplicate block or manifest entry, unsafe or
linked paths, hard links into the live tree, and any leftover `SIT4528`,
`SITUATIONAL_BUTTONS_ENABLED`, `sit4528…` name or `sit4528-` class in a retained source.

With nothing later present, `--expect-sha 26eb8d8c1f0c61c015831e5b426010d470d49df1a2d86975f5fc9f3b58fa416f`
requires the exact pre-release build: **3,573,333 bytes**, `main` at `32bebec` (Phase 4.5.27's
build). Measured on 7 October 2026; see README.md.

## Dependencies (declared)

- **On Feature 4.5.27 (hard):** this release retunes its Wary, Precise Memory and Imperial Scribe
  entries and wraps `SIT4527.freeRaise`, all by property. Without that fragment this release does
  nothing at all (measured: `qa/dependency-harness.js`, `ENTRIES-ABSENT`). It names `SIT4527`, so
  Feature 4.5.27's remover refuses while this is present: **remove this release first** (pinned by
  `test_feature_4527_remover_refuses_while_this_is_present`). With 4.5.27's switch or the Advantage
  roll-effect switch off, the two buttons go and the requirement notes stay (`ENTRIES-OFF`,
  `ROLL-EFFECTS-OFF`).
- **On Feature 4.5.15: none since the device correction of 7 October.** As first shipped it rebound
  `RD4515.start` to pre-tick Wary; Wary is now applied directly and the fragment no longer names the
  registry (`REGISTRY-OFF` and `REGISTRY-ABSENT` change nothing here). The registry's remover still
  refuses while Feature 4.5.27 is present.
- **On Feature 4.5.5 (soft):** `R455.ineligible` is rebound by property so the quick-add picker greys
  out the two gated entries with their requirement. Without it they are not greyed out, but their
  rows still say why and Imperial Scribe's bonuses stay withheld (`PICKER-GATE-OFF`). Declared in
  that release's ROLLBACK.md.
- **On the trunk:** `rollWithModifiers` (marks the Spot ambush roll), `advConfigExtendedRollModifiers`
  (Precise Memory's and Wary's applied +1k1), `refreshAllAdvConfigControls` (Phase 4.5's, called by
  the trunk's `recalcAll` on every pass: the row line and the picker; `recalcAll` is wrapped only if
  it is absent), the four Honor and Status boxes' `input`/`change` events,
  `rollSkill`, `makeRollContext`, `getTraitValueByName` and the `f_statusPts` / `f_honorPts` fields.
  All guarded; the wraps keep the previous binding and delegate.

No later release depends on this one.

## Cross-phase fixture corrections (test-only, declared)

| Retained check | Before the correction, on this build | After |
|---|---|---|
| Feature 4.5.5, `GATES455-GATE-04` (how many Advantages the picker greys out) | 40/41 (four, not two: Imperial Scribe and Sacrosanct are now gated too) | 41/41 with this release present and removed; adds two when `window.__L5R_TEST__.SIT4528` is present |
| Feature 4.5.27, `situational-entries-harness.js` | The Wary, Precise Memory and Imperial Scribe checks assume the old behaviour | Reads `SIT4528` (as corrected on 7 October): Wary and Precise Memory leave every probe and the two real routes (their ten per-roll dice checks are not run: neither is a tick), the tick lifecycle checks use Imperial Spouse on Courtier (the same +1k1) in Wary's place, every reset meets Imperial Scribe's requirements, and `tick` leaves a ticked option ticked. **117/117** with this release; **127/127** without it, exactly as first shipped |

No other retained harness changed. The removal chain registry gained one entry, at its end.
