# Remove the Minor Clan Defender Paragon gate

This fix owns only its new fragment, one manifest entry, and one guarded seam
block. Removing it restores the previous name-only Paragon entry requirement;
no Advanced School records, Techniques or Advantage configurations are deleted.

## Dependencies

- **Core Advanced Schools (Phase 4.7):** `AS47.enabled`, `AS47.unmet` and
  `AS47.refresh`. The fix wraps eligibility only, not record or progression
  methods. If this provider is absent/disabled, the wrapper is not installed.
- **Supplemental Advanced Schools (Phase 4.7.1):** the Minor Clan Defender
  catalogue entry and `SUPPLEMENTAL_ADVANCED_SCHOOLS_ENABLED`. Without that
  release, the wrapper is inactive.
- **Paragon (Phase 4.5.18):** `P4518.complete` validates the existing configuration
  schema and all seven tenets. Without this validator, or with Paragon disabled,
  new Minor Clan Defender entry remains unavailable. Other schools still work.
- **Base Advantage configuration (Phase 4.5):** guarded `readAdvConfig` supplies
  the saved row setting, and the Paragon validator already depends on the base
  configuration switch. A missing reader cannot cause an exception in this fix;
  it leaves this prerequisite unmet. The base layer's other consumers still
  have their own removal obligations.

Each provider's ROLLBACK.md names this consumer. Remove this fix first when
removing those providers as a compound rollback, or deliberately retain its
documented inactive/fail-closed behavior. It has no dependency on Missing Basic
Schools. Its two existing-harness fixture corrections are conditional on this
fix being present, so they remain safe after its removal.

## Owned surface

| File | Exact removal |
|---|---|
| `src/sheet/209.9999993-bugfix-minor-defender-paragon.js` | Delete the fragment; it owns `PARAGON_GATE_ENABLED`, `PG47` and the local `pg47PriorUnmet` wrapper |
| `build/manifest.json` | Remove its one fragment entry and recompute `expect_sha256` from retained fragments |
| `src/sheet/210-test-seam-and-init.js` | Delete only `// BUGFIX PG47 BEGIN minor-defender-paragon-seam` through `// END PG47 minor-defender-paragon-seam` |

There are no owned CSS, markup, persisted keys or registry roll contributors.
The QA removal-chain entry is in
`Versions/QA — Removal Chain Registry/removal_chain.py` and leaves with the
release after an intentional project rollback. The phase's own fragment copy
and QA files leave with this folder. Do not restore old copies of shared files.

## Procedure

Create an external scratch copy of the Phase 0 folder. Run
`qa/remove-phase.py SCRATCH_COPY --dry-run`, inspect its plan, then rerun without
`--dry-run`. Rebuild that scratch copy with `build/recombine.py --verify` and
run the retained suite from Missing Basic Schools against its resulting HTML.
`qa/verify-regression.py` performs that full comparison automatically.

The remover refuses the live tree, its ancestors/descendants, symlinks or
junctions, hard-linked files, escaping paths, duplicate manifest entries/keys,
foreign or malformed markers and leaked owned identifiers. It preflights every
change before writing and preserves surrounding bytes and line endings.

With this as the newest layer, add
`--expect-sha fcb88eb1c8be5094f9e528b7b5d8f19805eae6dc60ac5c4fd17bf1fbfed7c4a8`
to require the exact preceding main build before anything is written. Later
independent features must be preserved; use their measured retained hash or
omit that option instead of forcing a historical hash onto newer code.

After reviewing the scratch proof, apply only the owned removal to the working
branch, rebuild, and remove this folder and its removal-chain entry. If no later
layer remains, use Missing Basic Schools' `qa/current-suite-runner.js` as the
current runner. No character save migration is required by this fix.

## Measured proof

- Corrected source build: **3,561,844 bytes**, SHA-256
  `b6b8bc00756cbeca437228f5cef8f182598ab7dd493f91bc6f0c1c2f8b91fe83`.
- Removal restores main `d39348a`: **3,560,263 bytes**, SHA-256
  `fcb88eb1c8be5094f9e528b7b5d8f19805eae6dc60ac5c4fd17bf1fbfed7c4a8`.
- Safety fixtures: **20 passed**, one Windows symlink test skipped. Ownership:
  both exported names are confined to this fix's own blocks. Core Advanced
  Schools after removal: **196/196**.
- On 7 October the final corrected suite passed **4,262/4,262**, and the
  exact restored baseline passed **4,230/4,230** retained checks. Consult
  `qa/regression-verification.json` and the full logs for measured evidence.

The kill-switch `PARAGON_GATE_ENABLED = false` provides a startup-only behavior
rollback without deleting source. It preserves the test seam for diagnosis and
returns the gate to its pre-fix behavior; it does not alter saved characters.
