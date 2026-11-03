# Step 3b · Release 8c

Branch `codex/release-8c-rank-spell-choices`, based on Release 8b.1 at `543e0261`. The owner approved the reading, rank advancement picker and explicit claims for older ranks. Production still serves Release 8b.1.

- [School-by-School reading and owner decision](READING.md)
- [Phone checklist](DEVICE-CHECKS.html) and [text checklist](DEVICE-CHECKS.md)
- [Removal and save compatibility](ROLLBACK.md)

The level-up prompt offers Choose spells or Later. Each owed pick stays with its School and earning rank. In Manage, reopen the note in the character check. Importing an older save establishes the existing School Rank as the starting point for automatic tracking. The player may report a missing count once for each earlier rank. No past pick is assumed.

The 36 targeted checks passed, including Skill and Insight edits through their normal input handlers, progression beyond Rank 10, Yogo Ward and Travel eligibility, the mandatory Fuzake spell already earned in another School, and a warning naming spells left on the sheet after a rank correction. [Review reproductions and final results](qa/review-fixed.log). The frozen application is `139e081092d4899d66563a362073ff594a4b6d00ac452fe0789328c8884a2551`, 17,525,378 bytes. Under-load and suite qualification are in progress. Owner device acceptance and publication are pending.

Three exact wizard-versus-manual save comparisons failed during the initial 4× CPU screening. Manual creation serialized an empty Rank 1 history while the wizard did not. Release 8c now writes history only when a rank above the starting rank exists. The 36 rank checks passed after the correction. The original failure evidence is kept in `qa/under-load-final`. Discovery and the full suite had not started.
