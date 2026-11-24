# Release 15b · group 2 (B01, B03, B05, B09) — handover

24 November 2026 (Claude). **Accepted, qualified and live** (24 November). The qualification passed every stage first time.

**What group 2 is:** four units on stacked branches, on top of group 1 as live.

- **B01:** Check Buttons Named for What They Do.
- **B03:** Lead an Ally.
- **B05:** You Remain in Control.
- **B09:** Skill Picker Traits from the Final List.

**Branches and build:** the group tip is `claude/release-15b-b09`. It carries round 2 (B01 and B03 revised) and the group's records; the lower branches (`-b01`, `-b03`, `-b05`) keep round 1. Application `1f002be964b12ee91b7ed484b949946a859d84b84a7a7756bf7d9ed1841b5819`, 17,773,727 bytes.

## Approvals and acceptance

- **Mock-ups** ([MOCKUP.md](MOCKUP.md), the owner's words verbatim):
  - round 1, 24 November: "Approve as recommended" (all four as recommended);
  - the word to build: "Build here".
- **Device round 1** (24 November; [DEVICE-CHECKS.md](DEVICE-CHECKS.md), mirroring the Claude Doc https://claude.ai/artifact/Nphzgd9PYVFgZRPbLFPQmX):
  - every check passed on iPhone and laptop; the optional VoiceOver check was not run;
  - B05 and B09 accepted; B01 and B03 revised, from the owner's nine comments.
- **Round 2** (24 November): "Narrow round 2 first", then "Approve as shown":
  - B01: Lord Moon's resist button at the check buttons' size; Touch of the Void outlined and named "Keep control (TN 30)"; ten failure lines without "Tell the GM";
  - B03: Quick and Leadership outlined.
- **Device round 2** (24 November): every check passed on iPhone and laptop, and B01 and B03 were accepted. The owner, verbatim, relayed by the kickoff session: "The checks passed and I have updated them. Please proceed".
- **Parked from the device round:** the badges, ticks and how an entry shows its choice (a unit of their own, from B18's inventory, Great Potential's pill included); the combat notes (a full rules read and audit before the combat overhaul, with Dazed tracked as a condition).

## The qualification (screen-only tier)

- **The chain** ran once (19:27 to 19:30 UTC, 24 November) and passed first time (`qa/qualification-1f002be9.json`):
  - **Group removal 30/30** (`qa/removal-final-1f002be9.log`):
    - all four units removed restores group 1 as live exactly: `5ac767c6…574d`, 17,750,809 bytes;
    - B01, B03 and B05 each removed alone, and B17 removed with the group kept; every kept harness ran in full on each;
    - **the owner's decision 3:** all 26 Release 15a units removed with the group kept (`fd8fb7d0…8469`, 17,580,504 bytes), and all four harnesses passed on it.
  - **Dependencies 4/4** (`qa/dependencies-1f002be9.log`).
- **The full pass** ran once (19:30 to 20:26 UTC) and passed on its first execution:
  - candidate **7,562/7,562** (213 leaves, 28.65 minutes);
  - retained **7,432/7,432** (207 leaves, 26.55 minutes);
  - removing the group restored group 1 as live exactly (`5ac767c6…574d`).
- **Counts, pinned by arithmetic before the run:**
  - candidate = group 1's qualified 7,505 + B01's 23 + B03's 15 + B05's 10 + B09's 9 = **7,562** (209 + 4 = 213 leaves);
  - retained, with the group removed (group 1 as live) = A14's 17 + B04's 12 + B14's 10 + B17's 13 + group 1's retained 7,380 = **7,432** (203 + 4 = 207 leaves). Like every retained run since Release 7b.1, it leaves out the two live-site leaves (the service-worker and notice checks, 73 checks). So it is not 7,505 on 209 leaves, as the qualification brief had it: 7,505 is group 1's candidate count, which includes those two leaves.
  - The lists were generated before the run (`qa/candidate-list.json`, `qa/retained-list.json`). They differ from group 1's only by the four units' harnesses (candidate) and by group 1's four harnesses (retained), with the shared leaves in the same order.
- **The three older harnesses that follow `CN15`** (Feature 4.5.31's checks harness, 101; Feature 4.5.33's void-initiative harness, 44; Release 15a A07's moon-row harness, 26) keep their ids and counts. Each appears once in both lists, and both runners pin their counts (`changedHarnesses`): with B01 present in the candidate pass, and without it in the retained pass.
- **No discovery run and no 4× CPU screen,** as the screen-only tier allows. **The tier question, decided:** the 4× screen is for timing, animation or asynchronous behaviour. B01, B03 and B05 wrap synchronously: words and classes are set as a row is drawn or a roll is asked for. B09 relabels the picker in a `MutationObserver` callback. That is a microtask: it always runs to completion before the next task, paint or input event, whatever the CPU speed, so a slower CPU cannot reorder it against a tap or a redraw. It has no timer, animation frame, network wait or chain of awaits. So the screen does not apply, and B09's harness was not run under load.

## Units

| Unit | Marker | Tag / switch | Own checks | Branch |
|---|---|---|---:|---|
| B01 Check Buttons Named for What They Do | `PART H PHASE 15.2.6` | `CN15` / `CHECK_BUTTON_NAMES_ENABLED` | 23 | `claude/release-15b-b01` (round 1); round 2 on the tip |
| B03 Lead an Ally | `PART H PHASE 15.2.7` | `LA15` / `LEAD_AN_ALLY_ENABLED` | 15 | `claude/release-15b-b03` (round 1); round 2 on the tip |
| B05 You Remain in Control | `PART H PHASE 15.2.8` | `RC15` / `REMAIN_IN_CONTROL_ENABLED` | 10 | `claude/release-15b-b05` |
| B09 Skill Picker Traits from the Final List | `PART H PHASE 15.2.9` | `SKP15` / `PICKER_TRAITS_FINAL_ENABLED` | 9 | `claude/release-15b-b09` (the group tip) |

All four are screen-only. Each unit's folder has its README, ROLLBACK, harness with pinned ids, remover and removal proof. All four are registered in the removal chain after B17.

What each does:

- **B01.** Seven Disadvantage check buttons are named for what they do ("Resist insult (TN 25)", "Steady yourself — Spend Void" and so on), each spoken name starting with the button's words. Round 2: Lord Moon's "Resist Lord Moon (TN 20)" at the check buttons' size; Touch of the Void's button outlined, "Keep control (TN 30)"; ten failure lines without "Tell the GM", Elemental Imbalance's reading "…: the GM decides what happens. Your Spell Casting Roll still proceeds."
- **B03.** Leadership reads "Lead an ally" and Quick reads "Use", each with its amount beside it ("1k1 + 2 (School Rank)", "+3 (Reflexes)"), both outlined.
- **B05.** Touch of the Void's and Lord Moon's Curse's success lines say "You remain in control." and "Willpower roll passed. You remain in control tonight."
- **B09.** The Skills picker reads each Skill's Trait from the list as it stands after every layer: Intimidation reads "(Awareness)", like the row it adds.

**Older harnesses that follow a unit's switch** (same ids and counts, declared in both ROLLBACKs): Feature 4.5.31's checks harness and its dependency harness, Feature 4.5.33's void-initiative harness and Release 15a A07's moon-row harness, all following B01.

**Older removers that now refuse while a unit is present** (remove the unit first; reciprocal notes are in each ROLLBACK):
- Feature 4.5.31, because of B01;
- Feature 4.5.33, because of B01 and B03.

## Where the evidence is

- **Mock-ups and their reproduction:** [MOCKUP.md](MOCKUP.md) and [REPRODUCTION.md](REPRODUCTION.md); the board is https://claude.ai/artifact/REUwrJoboaHe6xQBuGDDy2.
- **Code review (round 1):** [qa/code-review.md](qa/code-review.md).
- **Light checks:** each unit's README, `qa/light/` (round 2: `r2-*`), `qa/dependencies-*.log`, `qa/remove-15a-keep-group*.log`.
- **Previews on their deployed files:** the tip passed 3,863/3,863 (89 harnesses) on round 2's build (`qa/preview-b09-round2.log`, `qa/hosted-preview/claude-release-15b-b09/`); round 1's lower previews matched their builds file for file (`qa/preview-b0*-files.log`).
- **Qualification:**
  - the chain: `qa/qualification-1f002be9.json` and its two stage logs;
  - the full pass: `qa/final-run-1/summary.json` and `qa/run-final-once.log`;
  - the scripts: group 1's (`qualify-before-full.py`, `run-final-once.py`, `final-qa.py`, `test-removal-group.py`, the three suite runners) with this group's constants.

## Environment notes

- Built and qualified in the worktree `C:/Users/jcrow/l5r-release-15b-g2`, so the shared checkout kept its branch.
- Every QA run used the project's own Playwright browsers (`l5r-qa-tools`), and the full runs used mains power with the system held awake.

## Usage

Claude, Opus 5.5, Pro plan; account-wide weekly meter:

| Point | Weekly, all models |
|---|---:|
| 24 November, the owner's "Build here" | 69% |
| 24 November, group built, previews verified, checklist made | 76% |
| 24 November, round 2 built and previewed | 83% |
| 24 November, before qualification | 86% |
| 24 November, after the full pass | 87% |
| 24 November, after the go-live, its production checks and the records | 95% |

## Production

**24 November 2026 · group 2 live (Claude).** On the owner's word ("Go live", to the question "Put group 2 live?", relayed by the kickoff session), `main` was fast-forwarded from `acdb6f75` to `be14d725` at 22:53 UTC, with no merge commit and no force (14 commits). The first push was held by the session's permission check until the owner allowed it.

Production checks:

- **Files:** all seven deployed files match the qualified build.
  - Deployed page `0f3f9b841764b9dfcada1b45088bff84a3a8a41dc4aadba7e81f50ad8f6c7838`, 17,780,504 bytes.
  - Application `1f002be9…5819`.
  - Service worker build `ac7f49e9781c15eb`.
- **Harnesses:** 159 application harnesses passed **6,263/6,263** on the downloaded production files (23:19 UTC).
  - A03's 23 always run, plus each unit's own harness and the layers it touches, each counted once.
  - Group 2 adds B01's 23, B03's 15, B05's 10 and B09's 9 checks, and the layers of their light checks (round 1's four sets and round 2's union run).
- **Browser/offline smoke:** **22/22** (23:19 UTC).

**Evidence:**
- [qa/live/live-verification.json](qa/live/live-verification.json), [qa/live/live-qa.log](qa/live/live-qa.log) and [qa/live/live-browser-smoke.json](qa/live/live-browser-smoke.json);
- `qa/verify-live.log` and `qa/browser-smoke.log`.

**How they ran:** on the downloaded production files, with `qa/verify-live.py` (group 1's script with the four units added; group 1's light lists read from group 1's folder) and the Older School Choices browser smoke.

The ledger (MD and HTML: parts 1, 2, 3, 4 and 6), the roadmap and a CLAUDE.md pointer are updated. The ledger page is not republished; that waits for the owner.

## Next

- B18's rulings on its button inventory (on its ruling page), then Release 15b group 3 (B06, B10, B11, B16), mock-ups first.
- Parked from this group: the badges, ticks and how an entry shows its choice (a unit of their own, from B18's inventory); the combat notes (a rules read and audit before the combat overhaul, with Dazed tracked as a condition).
