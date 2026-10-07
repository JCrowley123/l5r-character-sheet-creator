# Remove Phase 4.5.27 Situational Roll Entries

This release owns one fragment, one manifest entry and one guarded seam block. Removing it
returns the nine Advantages to recording their cost and text only, and restores the earlier
catalogue wording of Clear Thinker and Heartless. No character data changes: nothing this release
does is ever saved.

## Surgical removal (the method)

1. Copy the Phase 0 folder to a separate scratch directory (never the live tree; the remover
   refuses it, its parents and its children).
2. From this folder: `python -B qa/remove-phase.py <absolute-scratch-folder> --dry-run`, and read
   the plan.
3. Run it without `--dry-run`, rebuild that copy with its own `build/recombine.py --verify`, and
   run the retained suites against the rebuilt HTML
   (`BUGFIX — Minor Clan Defender Paragon Gate/qa/current-suite-runner.js`).
4. Apply the same removal to the working branch, delete this folder, remove this release's entry
   from `QA — Removal Chain Registry/removal_chain.py`, and drop the `situational-entries` set-aside
   from the two retained checks named below (optional: they pass either way).

The remover deletes only `src/sheet/209.9999994-feat-situational-entries.js`, its manifest entry
and the `situational-entries-seam` block in `210-test-seam-and-init.js`, and repins the manifest's
`expect_sha256`. It preserves every surrounding byte and line ending, and refuses before writing
anything on foreign or malformed markers, a missing or duplicate block or manifest entry, unsafe or
linked paths, hard links into the live tree, and any leftover `SIT4527`,
`SITUATIONAL_ENTRIES_ENABLED` or `sit4527…` name in a retained source.

With nothing later present, `--expect-sha b6b8bc00756cbeca437228f5cef8f182598ab7dd493f91bc6f0c1c2f8b91fe83`
requires the exact pre-release build: **3,561,844 bytes**, `main` at `b414423` (the Minor Clan
Defender Paragon fix's build). Measured on 7 October 2026; see README.md.

## Dependencies (declared)

- **On base Phase 4.5 (Part I):** the `adv-config` registry seat, `advConfigExtendedRollModifiers`
  (wrapped for Imperial Scribe's Free Raise line) and `ADV_CONFIG_ENABLED` /
  `ADV_CONFIG_ROLL_EFFECTS_ENABLED`. Every use is guarded; without them nothing is offered or
  shown. Remove this release before that base.
- **On Feature 4.5.15 (the roll declaration registry):** the nine declarations are a registered
  provider, `situational-entries`. Guarded: without the registry the nine offer nothing and the
  Free Raise line still appears (measured in `qa/dependency-harness.js`, `REGISTRY-OFF` and
  `REGISTRY-ABSENT`). This fragment names `RD4515`, so the registry's own remover refuses while it
  is present: **remove this release first**. Declared in that release's ROLLBACK.md too.
- **On Feature 4.52 (Disadvantage configuration, Phase 4.5.2's folder):** `D45.active('Failure of
  Bushido')` tells Balance that the Honor tenet bars it. Guarded: without that layer Balance is
  simply offered (measured: `DISADV-CONFIG-OFF`). Declared in that release's ROLLBACK.md too.
- **Comment-only mentions:** Friend of the Elements (Phase 4.5), Heart of Vengeance (4.5.16) and
  Jurojin's Blessing (4.5.21) are named in comments as precedents. Nothing reads them.

**Later dependent — Phase 4.5.28 Situational Entry Buttons and Gates (7 October 2026).** It retunes
three of the nine from outside, on the owner's rulings and device corrections: Wary and Precise
Memory are applied by their Spot ambush and Recall buttons instead of ticks, and Imperial Scribe is
withheld until Status 2+ and Calligraphy 4+. Its fragment names `SIT4527`, so this release's remover
refuses while it is present: **remove 4.5.28 first**. This release's harness reads
`window.__L5R_TEST__.SIT4528` and asserts the ruled behaviour when it is present (117 checks: the ten
per-roll dice checks of Wary and Precise Memory are not run there, and the tick lifecycle checks use
Imperial Spouse on Courtier) and is unchanged without it (127/127).
Its `dependency-harness.js` and `checklist-walk.js` describe this release alone and are not re-run on
later builds. Declared in that release's ROLLBACK.md.

## Cross-phase fixture corrections (test-only, declared)

Two retained checks pinned the registry's exact list of production providers. Each now also sets
aside `situational-entries` while `window.__L5R_TEST__.SIT4527` is present, as every earlier
provider's release did:

| Retained check | Before the correction, on this build | After |
|---|---|---|
| Feature 4.5.15, `RD-NO-PRODUCTION-PROVIDER` | 52/53 (it named `situational-entries`) | 53/53 with this release present and removed |
| Feature 4.5.16, `HV-PROVIDER-REGISTERED` | 90/91 (it named `situational-entries`) | 91/91 with this release present and removed |

No other retained harness changed. The removal chain registry gained one entry, at its end.
