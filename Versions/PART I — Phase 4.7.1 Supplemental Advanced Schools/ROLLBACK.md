# Removing Supplemental Advanced Schools

Owns `src/sheet/209.9999991-feat-advanced-schools-supplemental.js`, its manifest entry and the `PART I PHASE 4.7.1 BEGIN supplemental-advanced-schools-seam` through `END SUP47 supplemental-advanced-schools-seam` block in `210-test-seam-and-init.js`.

Use `qa/remove-phase.py SCRATCH_COPY --dry-run`, then the same command without `--dry-run`, and rebuild with that copy's `build/recombine.py --verify`. The remover refuses the live tree, unexpected markers, escaping paths, duplicate manifest keys and hard-linked files before writing. It does not restore snapshots of shared files. Remove the phase's release folder and registry entry only after intentionally removing it from the project.

Before the later Basic Schools layer, removal must produce **3,525,220 bytes**, SHA-256 `b02aa5584cc90cbb948ece23980bcf5ae766d943eada6430c52353dead2e8950`, main `6f87a4c`. When later work is present, use the removal registry for the historical comparison; direct surgical removal must preserve later independent source.

Dependencies: Core Advanced Schools (Phase 4.7), Alternate Paths (Phase 4.6), and the save-format layer required by Core. These provide catalogue, requirement checks and progression. Advantage configuration supplies Allies and Great Potential choices; without the corresponding configuration, those prerequisites remain unmet. Inquisitor possession reads weapon inventory. No later Basic School layer is required. Remove the supplemental consumer before removing Core; disabling Core, Paths or save format must leave these supplemental entries inactive.

Removing this feature cannot reconstruct the history of a saved supplemental enrolment. Back up character exports before deliberately removing it. No saved-character migration or deletion is performed by the scratch remover.

## Later consumer — Minor Clan Defender Paragon Gate (6 October 2026)

`BUGFIX — Minor Clan Defender Paragon Gate` declares this dependency. Its Minor Clan Defender entry is the only target of the new entry gate. The fix guards absent providers; removing either Advanced School release disables its wrapper. Existing saved Advanced training is retained. Remove the fix first when reverting its requirement, or retain its fail-closed Paragon rule. Its own removal restores the original name-only entry check.
