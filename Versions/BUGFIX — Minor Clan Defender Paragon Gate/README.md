# Minor Clan Defender requires a configured Paragon

Minor Clan Defender previously accepted an Advantage row named Paragon before
the player had chosen its Bushido tenet. This independent fix requires at least
one Paragon in **Advantages** with a valid, confirmed tenet. All seven printed
tenets qualify; a blank, cancelled, malformed or unsupported setting does not.
The other entry requirements still apply. Sources: Emerald Empire p.63 and
Core Rulebook p.152, as recorded in the existing school and Paragon catalogues.

This changes new entry eligibility only. It does not revoke an existing
Advanced School enrolment, delete earned Techniques, spend XP, award Honor or
automate a Paragon effect. Other Advanced Schools are unchanged. The focused
test exports, reloads and advances an existing enrolment after its Paragon row
has been removed, confirming that saved progression remains intact.

Built on `codex/fix-minor-defender-paragon`, after main `d39348a`. The fix was
merged to main on 7 October at **9dc8d01** ([PR #7](https://github.com/JCrowley123/l5r-character-sheet-creator/pull/7)), and the live deployment is verified. This status is separate from the Phase 4.7 releases
already merged on 5 October. On 7 October the owner reran Test 1 and confirmed
the Paragon requirement works as expected. Device/browser was not specified;
iPhone layout remains unconfirmed.

## Implementation and removal

The owned fragment is
`src/sheet/209.9999993-bugfix-minor-defender-paragon.js` in Phase 0. It wraps
`AS47.unmet` after the supplemental school checks and calls the existing
`P4518.complete` validator through the guarded `readAdvConfig` reader. It adds
one guarded test-seam block and one manifest entry. No new shared markup,
stylesheet, save field, format step or roll modifier is introduced.

`PARAGON_GATE_ENABLED = false` disables the wrapper at page startup and restores
the previous name-only prerequisite. Surgical removal is described in
[ROLLBACK.md](ROLLBACK.md); it does not restore whole shared files.
`minor-defender-paragon.js` is the release's own copy of the production fragment.

## Verification — 6–7 October 2026

- Focused browser checks: **32/32**. The original main build passes **17/32**,
  failing the new configuration checks as expected.
- All seven tenets, blank/cancelled configuration, malformed saved data, wrong
  row/list, other prerequisites, direct entry, the real configuration modal,
  and saved enrolment/progression are covered.
- Dependency boundaries: **40/40**. Missing or disabled Paragon keeps this
  prerequisite unmet; absent/disabled Core or supplemental Advanced Schools
  leaves this wrapper inactive without a page error. Disabled base Advantage
  configuration also leaves entry unavailable.
- Five deliberately broken builds produce exactly their reviewed, pinned
  failures. Core Advanced Schools remains **196/196** after removal.
- Retained supplemental checks: **156/156**. Existing shared Basic Schools
  dependency checks: **189/189**.
- Remover safety fixtures: **20 passed**, one Windows symlink test skipped.
  Ownership scan: both exported names and every reference are inside this fix's
  owned fragment or seam block.
- Corrected build: **3,561,844 bytes**, SHA-256
  `b6b8bc00756cbeca437228f5cef8f182598ab7dd493f91bc6f0c1c2f8b91fe83`.
  Actual scratch removal restores **3,560,263 bytes**, SHA-256
  `fcb88eb1c8be5094f9e528b7b5d8f19805eae6dc60ac5c4fd17bf1fbfed7c4a8`.
- Final combined run: **4,262/4,262 passed**. After actual scratch removal,
  **4,230/4,230 retained checks passed** on the exact restored baseline.
  See `qa/regression-verification.json` and both full regression logs.

Logs: `qa/focused.log`, `qa/baseline.log`, `qa/dependency-boundaries.log`,
`qa/variant-discovery.log`, `qa/pinned-variants.log`,
`qa/retained-supplemental.log`, `qa/retained-dependencies.log`,
`qa/remover-fixtures.log` and `qa/ownership.log`. Build sizes/hashes are in
`qa/build-metadata.json`. The recovered pinned and retained logs were produced
before the interrupted session ended; they were preserved on 7 October rather
than rerun.

Run `node qa/current-suite-runner.js /absolute/path/to/l5r-character-sheet.html`
with Playwright available. `qa/verify-regression.py` runs the corrected full
suite, removes only this fix in a guarded scratch copy, verifies the exact
preceding build, then runs every retained suite. `qa/verify-variants.py` checks
the reviewed pins; `qa/test-removal.py` exercises the remover's refusal rules.

Two retained test fixtures now configure their Paragon row only while `PG47`
is enabled: the supplemental harness and the Basic Schools dependency harness.
Their assertions/counts are unchanged, and their old fixtures still apply when
this fix is disabled or removed.

## Live verification — 7 October 2026

The published page exactly matches the committed source plus its PWA head.
Manifest, icons and service worker match; a fresh browser boots without page
errors. The downloaded live page passes **226/226 focused checks** (156
supplemental, 38 Basic, 32 Paragon gate). See qa/live-verification.json and the
three live harness logs. Owner functional retest: **Pass, 7 October**. The owner
also confirmed Kolat Assassin (9a) and Legion of Two Thousand (9b). iPhone visual
confirmation remains unreported; the test device/browser was not specified.
