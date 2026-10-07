# Phase 4.7.1 — Supplemental Advanced Schools

Adds fourteen sourcebook records to the Core catalogue. Thirteen are available to supported human characters; Nezumi Berserkers is recorded but cannot be enrolled without a Nezumi character model. The app now knows 23 Advanced Schools, of which 22 support the current character model.

Entry checks, three-rank progression and save/load reuse the Core release. All 42 new Technique descriptions are source-cited references; their conditional effects remain manual. See [AUDIT.md](AUDIT.md) for interpretation and remaining model boundaries, and [MANUAL-TESTS.md](MANUAL-TESTS.md) for worked normal and fringe cases.

The owner authorized the remaining Phase 4.7 work on 4 October. Scorpion Instigator's Blackmail purchase count is deferred to Phase 15 or later. No iPhone test result is inferred from automated browser checks.

## Validation

- Focused behavioral harness: 156/156, including thresholds, configuration checks, alternative entry routes, distinct Ring/Weapon counts, progression and save/load.
- Previous Core build fails the new capability check (1/2), confirming the harness detects absent functionality.
- Removal fixtures restore main `6f87a4c` exactly: 3,525,220 bytes; SHA-256 `b02aa5584cc90cbb948ece23980bcf5ae766d943eada6430c52353dead2e8950`.
- Final supplemental build: **4,192/4,192** full checks, ten reviewed/pinned mutation variants, and 189 shared dependency checks. Surgical removal preserves all Core checks and the later independent Basic Schools. Both removal orders restore the original main build exactly; see the Basic release's independent-removal evidence.
- Build: **3,554,472 bytes**, SHA-256 `a67ae916e00e82dcfd6ed555e2dc07a04eeaecb3604b9256ca8c812632445092`. Verified on 5 October; merged the same day on the owner's instruction. Live focused checks pass 156/156 on 6 October. On 7 October the owner confirmed the corrected Paragon requirement (test 1), Kolat Assassin (9a) and Legion of Two Thousand (9b) all work as expected, closing those functional follow-ups. See the manual guide; device/browser was unspecified and iPhone layout remains unconfirmed.

Run `node qa/current-suite-runner.js /absolute/path/to/l5r-character-sheet.html` with Playwright available. Run Python `qa/test-removal.py` for surgical-removal fixtures; `qa/verify-variants.py --discover --jobs 2` discovers the mutant failures before a pinned verification run.

See [ROLLBACK.md](ROLLBACK.md) for exact ownership and dependency boundaries.

The Core harness now counts and names only Core-source entries, so this extension does not weaken its nine-School assertions. No Core progression rule was changed. Final evidence: `qa/final-verification.json`.
