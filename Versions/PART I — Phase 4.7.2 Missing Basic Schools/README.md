# Phase 4.7.2 — Missing Basic Schools

Adds Hiruma Scout [Bushi] and the Tiger Clan's Yotsu Bushi School from the
Heroes of Rokugan alternate setting, with ten source-cited Technique references.
Normal School application supplies the printed Trait benefit, Honor and free
Skills. Hiruma Scout unlocks the five existing Paths that name that School.
Yotsu's first free choice is restricted to Lore: Gaijin or Lore: Shadowlands;
canonical Ronin Yotsu and the Sword of Yotsu Path remain separate.

Conditional Technique effects remain manual. No outfit is invented for Hiruma
Scout. Read [AUDIT.md](AUDIT.md), [MANUAL-TESTS.md](MANUAL-TESTS.md) and
[ROLLBACK.md](ROLLBACK.md). These changes are verified on a development branch,
not merged or deployed. Owner manual testing and iPhone layout checks are Not run.

## Verification — 5 October 2026

- Full combined suite: **4,230/4,230**. Basic School harness: **38/38**.
- Shared dependency checks: **189/189**; all six Basic mutation variants match
  reviewed pins. Both new harnesses fail their capability check on original main.
- Removal fixtures: 23 passed, one Windows symlink test skipped.
- Without Basic Schools: **4,192/4,192**. Without Supplemental Advanced Schools:
  **4,036/4,036** retained plus **38/38** Basic checks. Both removal orders restore
  main's exact bytes. Each layer preserves the other.
- Structural inventory, source ownership and build drift pass. Build:
  **3,560,263 bytes**, SHA-256
  `fcb88eb1c8be5094f9e528b7b5d8f19805eae6dc60ac5c4fd17bf1fbfed7c4a8`.

The retained Alternate Paths harness has two conditional expected-result updates:
Hiruma Scout appears in Crab Berserker's eligible Schools, and five Hiruma Scout
clauses leave the unavailable list while this release is enabled. Both historical
expectations remain when it is removed. The own harness's disabled-feature guard
was corrected during mutation discovery; normal assertions and counts are unchanged.

Run `node qa/current-suite-runner.js /absolute/path/to/l5r-character-sheet.html`
with Playwright available. Separate proofs: `qa/dependency-boundary-harness.js`,
`qa/verify-variants.py`, `qa/test-removal.py`, and
`qa/verify-independent-removal.py`. The last runs every retained suite on scratch
builds. Logs and exact counts are in `qa/final-verification.json`.

Phase 4.7 now has 23 Advanced records (22 playable human entries, one unavailable
Nezumi entry), plus these two Basic Schools. Advanced-rank Path replacement and
automatic Technique effects remain outside the implemented model. Scorpion
Instigator's four Blackmail purchases review is deferred by the owner to Phase 15
or beyond. The ledger and roadmap preserve all other fine-tuning feedback.
