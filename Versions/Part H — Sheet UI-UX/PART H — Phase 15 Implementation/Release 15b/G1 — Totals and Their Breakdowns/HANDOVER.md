# Release 15b · group 1 (A14, B04, B14, B17) — handover

23 November 2026 (Claude). **Accepted and qualified; not live.** Group 1 is the first group of Release 15b. The qualification passed every stage first time.

**What group 1 is:** four units on stacked branches.

- **A14:** One Net Wound Penalty.
- **B04:** One Armor TN Breakdown.
- **B14:** Jigoku's Total, Then Its Arithmetic.
- **B17:** One Row for Kharmic Tie, added at the owner's round-1 answer.
- **Dropped:** B02 (Actual and Catalogue Price), in round 2.

**Branches and build:** the group tip is `claude/release-15b-b17`, which also carries the group's records. Application `5ac767c6c3680126cfe664aef41e7312d98f24eee842ec679e38ed664dde574d`, 17,750,809 bytes.

## Approvals and acceptance

- **Mock-ups,** in three rounds on 20 November 2026 ([MOCKUP.md](MOCKUP.md), the owner's words verbatim):
  - A14 was revised so that the preview reads "-5 to total — Nicked".
  - B04 and B14 were approved as shown.
  - B02 was dropped.
  - B17 was approved, with Change and the i on the badge's row.
  - The owner's consistency note led to B18 (One Name per Button Job). It was approved as proposed, and B17 keeps "Reset session" until B18 rules.
- **The owner's word to build:** "Build here" (20 November).
- **Device round** (23 November; [DEVICE-CHECKS.md](DEVICE-CHECKS.md), mirroring the Claude Doc https://claude.ai/artifact/DZshih7839JogjPMKkzBiR):
  - all 22 checks passed on iPhone and laptop, and all four units were accepted. The owner, verbatim: "I have ran the tests and the pass as described."
  - Three observations were parked for later (P1–P3 in DEVICE-CHECKS.md): the Combat page's i's, the dashed realm badge with a whole-sheet badge check, and a Taint phase after Phase 15.

## The qualification (screen-only tier)

- **The chain** ran once (16:31 to 16:35 UTC, 23 November) and passed first time:
  - **Group removal 30/30:**
    - All four units removed restores Release 15a as live exactly: `921f3ac9…6150`, 17,718,601 bytes.
    - A14, B04 and B14 were each removed alone, and A19.1 removed with the group kept. Every kept harness was run in full on each.
    - **The owner's decision 3:** all 26 Release 15a units were removed with the group kept (`9889c426…825f`, 17,557,586 bytes), and all four harnesses passed on it.
  - **Dependencies 4/4.**
- **The full pass** ran once (16:35 to 17:31 UTC) and passed on its first execution:
  - candidate **7,505/7,505** (209 leaves, 29.17 minutes);
  - retained **7,380/7,380** (203 leaves, 26.73 minutes);
  - removing the group restored Release 15a as live exactly.
- **Counts:**
  - candidate = G6's 7,453 + A14's 17 + B04's 12 + B14's 10 + B17's 13 = 7,505 (209 leaves).
  - retained, with the group removed (Release 15a as live) = A19's 25 + A20's 18 + A19.1's 9 + G6's retained 7,328 = 7,380 (203 leaves). It excludes the same two live-site leaves as before.
- **No discovery run and no 4× CPU screen,** as the screen-only tier allows. The group adds no timing, animation or asynchronous behaviour: each wrapper redraws synchronously after the sheet's own render.

## Units

| Unit | Marker | Tag / switch | Own checks | Branch |
|---|---|---|---:|---|
| A14 One Net Wound Penalty | `PART H PHASE 15.2.1` | `WP15` / `NET_WOUND_PENALTY_ENABLED` | 17 | `claude/release-15b-a14` |
| B04 One Armor TN Breakdown | `PART H PHASE 15.2.3` | `AT15` / `ARMOR_TN_BREAKDOWN_ENABLED` | 12 | `claude/release-15b-b04` (on A14) |
| B14 Jigoku's Total, Then Its Arithmetic | `PART H PHASE 15.2.4` | `JK15` / `JIGOKU_TOTAL_FIRST_ENABLED` | 10 | `claude/release-15b-b14` (on B04) |
| B17 One Row for Kharmic Tie | `PART H PHASE 15.2.5` | `KT15` / `KHARMIC_TIE_ROW_ENABLED` | 13 | `claude/release-15b-b17` (on B14; the group tip) |

`PART H PHASE 15.2.2` is unused: it was B02's, and B02 was dropped. All four units are screen-only.

What each does:

- **A14.** With Low Pain Threshold or Strength of the Earth, the Wounds line, each level's spoken name, the level's window and Quick Access show the one penalty that applies. An i opens the level's sums: the rank's penalty, each entry with its page, and the total. The roll preview keeps one row, "-5 to total — Nicked".
- **B04.** Quick Access's Armor TN has an i, and Blind's line there is gone. The i and the Combat card's formula i show one table that adds up: the base (Blind, Core p.156), the Armor TN Bonus, each bonus in effect by name, and the total.
- **B14.** Jigoku says its total first: "+8 to total — Taint Rank 4 × 2 (Lost)" in the preview, and "Adding +8 — …" on the card.
- **B17.** A configured Kharmic Tie is one row:
  - the badge "Aiko · Rank 3", the pips and Reset session;
  - Change (Manage only) and one i, held to the badge's line;
  - the i's window, which gives the rule with Core p.151, each use, the uses left, and what the buttons do.

Each unit's folder has its README, ROLLBACK, harness with pinned ids, remover and removal proof. All four are registered in the removal chain after A19.1.

**Older harnesses that follow a unit's switch.** Three of them keep their ids and counts, and are declared in both ROLLBACKs:
- Phase 4.5.29's wound entries harness follows A14;
- Feature 4.5.24's Spirit Realms harness follows B14;
- Phase 4.5's expansion harness follows B17.

**Older removers that now refuse while a unit is present** (remove the unit first; reciprocal notes are in each ROLLBACK):
- Phase 4.5.29, because of A14;
- Features 4.5.34 and 4.5.36 and Phase 4.8, because of B04;
- Feature 4.5.24, because of B14.

## Where the evidence is

- **Mock-ups and their reproduction:** [MOCKUP.md](MOCKUP.md) and [REPRODUCTION.md](REPRODUCTION.md); the board is https://claude.ai/artifact/7eYntEEDBHV846kfVG3iaP.
- **Code review:** [qa/code-review.md](qa/code-review.md). One change, found by the "15a removed, group kept" check: B17's i now keeps its 28 px size without A04.
- **Light checks:** each unit's README, `qa/light/`, `qa/dependencies-*.log`, and `qa/remove-15a-keep-group.log`.
- **Previews on their deployed files:** the top preview passed 3,238/3,238 (51 harnesses), and the three lower previews match their builds file for file. Results are in `qa/hosted-preview/` and `qa/preview-*.log`.
- **Qualification:**
  - the chain: `qa/qualification-5ac767c6.json` and its two stage logs;
  - the full pass: `qa/final-run-1/summary.json` and `qa/run-final-once.log`.

## Environment notes

- Built and qualified in the worktree `C:/Users/jcrow/l5r-release-15b`, so the shared checkout kept its branch.
- Every QA run used the project's own Playwright browsers (`l5r-qa-tools`), and the full runs used mains power.

## Usage

Claude, Opus 5.5, Pro plan; account-wide weekly meter:

| Point | Weekly, all models |
|---|---:|
| 20 November, the owner's "Build here" | 40% |
| 21 November, group built, previews verified, checklist made | 53% |
| 23 November, after the device round (before qualification) | 56% |
| 23 November, after the full pass and these records | 57% |

## Next

- **Go-live** on the owner's word only: fast-forward `main`, with no merge commit and no force.
- **Then:** check production, and write the ledger, roadmap and CLAUDE.md records.
- **After that:** B18's rulings (its inventory is on `claude/jovial-rubin-993414`, not merged) and Release 15b group 2.
