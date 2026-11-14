# Release 15a · the automatic-entries group — handover

13 November 2026 (Claude). **Accepted and qualified. Not live:** G4 stays live until the owner's go-live word.

**13 November 2026 · the group qualified (Claude).** Release 15a's automatic-entries group is accepted and qualified. AE1 (a Yogo Wardmaster is given Sense, Commune and Summon, as The Great Clans p.229 reads, and five Schools show their book page), AE2 revision 2 (opening a character credits its School's given spells once per School: held spells marked as the School's, a missing one added with its scroll, and a note in the character check until the player's own save) and AE3 revision 1 (no XP box and no remove button on School, Path and Advanced School Techniques or on a School's given spells; a quiet tag on the name's line, on its own line at the left when the name would not fit) are on `claude/release-15a-ae3`. Application `99b76d625c04e6aa22ba8508005975525bbece945b82ead8c443b593e58115b8`, 17,675,311 bytes. The owner approved the mock-ups after two revisions ("Approve as recommended") and accepted all three at the device round, AE2 as revision 2 after its re-checks ("I have ran the new checks and they pass I am happy to mark all as passed and to accept AE1, AE2 and AE3").

Negative variants: thirteen cases predicted and pushed before discovery; twelve matched exactly at the first discovery. One prediction was wrong: on G4 as live, AE3's harness fails 14 checks, not 16, because the sheet re-adds a renamed School Technique and two later checks read that second card. The pin was corrected and explained before the chain, and a second discovery of that one case matched. AE2's harness stops early on a build without the unit, so the checker gained one pinned form: the stop, its count and the exact failures before it. The chain passed first time: group removal 29/29 (all of the group removed restores G4 as live `fa634abb…00cb` exactly), all 13 variants on their pins, dependencies 3/3, the 4× CPU screen 161/161 leaves (G4's leaves plus those that open a character or use the wizard). Two full passes, each on its first execution (22:51 UTC on 13 November to 00:30 UTC on 14 November): candidate **7,380/7,380** and retained **7,253/7,253** (run 1: 25.92 and 23.15 minutes; run 2: 25.53 and 23.20 minutes). The code review found one defect, fixed as AE3 revision 1.

## Units

| Unit | Marker | Tag / switch | Own checks | Tier | Branch |
|---|---|---|---:|---|---|
| AE1 Sense for the Yogo Wardmaster | `PART H PHASE 15.1.28` | `YG15` / `YOGO_GIVEN_SPELLS_ENABLED` | 13 | Behaviour | `claude/release-15a-ae1` |
| AE2 Given Spells Credited on Opening, revision 2 | `PART H PHASE 15.1.29` | `GS15` / `GIVEN_SPELLS_ON_OPENING_ENABLED` | 21 | Behaviour | `claude/release-15a-ae2` |
| AE3 No XP Box or Remove on Automatic Entries, revision 1 | `PART H PHASE 15.1.30` | `AX15` / `AUTOMATIC_ENTRY_CONTROLS_ENABLED` | 20 | Screen-only | `claude/release-15a-ae3` (the group tip) |

Each unit's folder has its README (what changed, builds, light checks, every failure found and fixed), ROLLBACK, harness with pinned ids, remover and removal proof. All three are registered in the removal chain after A17. The declared changes to other layers' tests are listed in the group's [README](README.md): Phase 11.2.4's wizard harness reads AE1's lines when AE1 is in the build; six harnesses pause AE2; 8b.1-UI-03's harness takes AE3's body class away for its page.

## Where the evidence is

- Approvals: [MOCKUP.md](MOCKUP.md) (three rounds; "Approve as recommended", 13 November); reproduction on G4 as live: [REPRODUCTION.md](REPRODUCTION.md).
- Code review: [qa/code-review.md](qa/code-review.md). Previews on their deployed files: `qa/hosted-preview/` (AE1 377/377; after the restack AE2 398/398, AE3 418/418).
- Device round: [DEVICE-CHECKS.md](DEVICE-CHECKS.md), mirroring the Claude Doc https://claude.ai/artifact/MSCwtNQk4adKdxV6DBxxhn. All three accepted; AE2 as revision 2 (the owner's option B: given spells handled once per School, and the Play-mode cause of check 9) after its re-checks R1–R4.
- Qualification: [qa/VARIANT-PINS.md](qa/VARIANT-PINS.md) (the predictions, the pinned-stop form, both discoveries and the one correction), `qa/variants.json`, `qa/discovery-probe/` (the probe that explained the correction), `qa/qualification-99b76d62.json` and its four stage logs, `qa/negative-99b76d62/summary.json`, `qa/under-load-final-99b76d62/results.json`, `qa/final-run-1/summary.json`, `qa/final-run-2/summary.json`, `qa/run-final-twice.log`. A light run of the removal proof before the chain: `qa/light/removal-group-light-run.log` (29/29).
- Counts: candidate G4 7,326 + 13 + 21 + 20 = 7,380 (201 leaves); retained, all of the group removed (G4 as live), A09 20 + A10 23 + A10.1 16 + A17 25 + G4's retained 7,169 = 7,253 (196 leaves), excluding the same 73 live-site checks as before.

## Environment notes

- Built and qualified in the worktree `C:/Users/jcrow/l5r-release-15a-g5`, so the shared checkout kept its branch.
- The brief planned the qualification for after the weekly reset on 18 November; the reading at the start was 58%, and the owner said to start at once ("Start now").
- The laptop was on battery when the qualification reached the chain; it waited for mains power ("Done, carry on"). Chrome and Edge stayed open at the owner's word ("Run with them open"); everything passed with them open.
- The 4× CPU screen picks its leaves by pattern. Because AE1 and AE2 change what opening a character and the wizard do, the pattern adds the leaves that open a character or use the wizard to G4's: 161 leaves instead of 140.

## Next

Go-live only on the owner's word: fast-forward `main` to the group's tip (no merge commit, no force), then production verification on the downloaded production files with `qa/verify-live.py` (G4's, with AE1, AE2 and AE3 and the layers they touch added) and the browser/offline smoke. Nothing after the group is agreed yet.

## Usage

Claude readings on a Pro plan, 13 November, for the qualification: weekly all models 58% at the start, 62% before the two full passes, 63% after them (Fable 0% throughout); the five-hour limit was not reached.
