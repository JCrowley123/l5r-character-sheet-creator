# Step 3b · Release 8c

Branch `codex/release-8c-rank-spell-choices`, based on Release 8b.1 at `543e0261`. The owner approved the reading, rank advancement picker and explicit claims for older ranks. Production still serves Release 8b.1.

- [School-by-School reading and owner decision](READING.md)
- [Phone checklist](DEVICE-CHECKS.html) and [text checklist](DEVICE-CHECKS.md)
- [Removal and save compatibility](ROLLBACK.md)

The level-up prompt offers Choose spells or Later. Each owed pick stays with its School and earning rank. In Manage, reopen the note in the character check. Importing an older save establishes the existing School Rank as the starting point for automatic tracking. The player may report a missing count once for each earlier rank. No past pick is assumed.

The 36 targeted checks passed, including Skill and Insight edits through their normal input handlers, progression beyond Rank 10, Yogo Ward and Travel eligibility, the mandatory Fuzake spell already earned in another School, and a warning naming spells left on the sheet after a rank correction. [Review reproductions and final results](qa/review-fixed.log). The frozen application is `139e081092d4899d66563a362073ff594a4b6d00ac452fe0789328c8884a2551`, 17,525,378 bytes. All 1,240 checks across 21 test groups passed at 4× CPU slowdown on the corrected build. The first and only discovery ran all 179 test groups and passed 6,774/6,774. Production deployment awaits the owner’s go-live instruction.

Three exact wizard-versus-manual save comparisons failed during the initial 4× CPU screening. Manual creation serialized an empty Rank 1 history while the wizard did not. Release 8c now writes history only when a rank above the starting rank exists. The 36 rank checks passed after the correction. The original failure evidence is kept in `qa/under-load-final`. Discovery and the full suite had not started.

[Hosted preview](https://966ad2ea.l5r-character-sheet-creator.pages.dev/) · [Seven verified hosted files](qa/qualified-preview.json) · [4× CPU evidence](qa/under-load-139e0810/results.json) · [Qualification](qa/qualification-139e0810.json)

The corrected application commit is `919a5e35`. The packaged app passed 380/380 checks. Both the local package and hosted preview passed all 24 first-visit and offline checks and all eight phone- and desktop-width walkthrough checks. The first full pass ran 16:33–17:19 UTC and the second 17:19–18:04 UTC on 3 November. Each passed **6,774/6,774** on the candidate and **6,665/6,665** on the restored predecessor. Both executed fresh with zero reused test results. Removal restored 17,505,080 bytes of Release 8b.1 with SHA-256 `1716feb4d43428c0e5a5ebff9d025ac2a353e0af91b8a30227df791d994226f7`. On 3 November 2026 the owner reported all six checklist items passed on iPhone Safari and laptop Edge.

[Full pass 1](qa/final-run-1/summary.json) · [Full pass 2](qa/final-run-2/summary.json) · [Account usage readings](qa/usage.json)
