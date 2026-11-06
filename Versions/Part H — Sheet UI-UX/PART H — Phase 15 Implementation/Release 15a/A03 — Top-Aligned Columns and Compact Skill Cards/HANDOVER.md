# Release 15a · A03 — handover

**State, 6 November 2026 (about 15:15 UTC): the owner ACCEPTED A03 REVISION 2 after passing every device check. The owner's go-live word is next.**
- Both full passes of revision 2 passed on their first executions.
- The owner passed all 17 device-check boxes on iPhone Safari and Laptop Edge, with no comments, and chose **Accept**.
- **Not merged, not deployed.** Merging to `main` and deploying need the owner's explicit go-live word.

| | |
|---|---|
| Branch | `claude/release-15a-a03` (from `main` `5f7a060f`, A02 live). Revision 2: build `53d861db`; review fixes and frozen candidate `064094a3`; harness typing fix and variant discovery `252fbd59`; the qualification evidence and these records follow in the next commit. Revision 1: `2c77bfd1`, `9ccce5e8` |
| Candidate application (revision 2) | `e73b7c0cac70c95d2965d993c9a3b9f0b66eb6f3ef4b81d6667166667090de06`, 17,553,370 bytes |
| Predecessor (A02 as live) | `91d451099ee58f1b481fcf87b3defa7955138f9fb67a56e8fa6fac1e5ad66dc0`, 17,538,334 bytes |
| Preview | <https://claude-release-15a-a03.l5r-character-sheet-creator.pages.dev/> (verified 550/550 at 14:47 UTC, byte for byte with the local package: page `e7cb9b99…cbc1`, 17,560,147 bytes; service worker `946e8dc511b4b539`) |
| Owner checklist (revision 2) | [A03 device checks, revision 2 (Claude Doc)](https://claude.ai/artifact/NuGaGAL8e4tDvjMJWfdnxy) · [DEVICE-CHECKS.md](DEVICE-CHECKS.md) |
| Revision 1's checklist and the owner's comments | [Claude Doc](https://claude.ai/artifact/CNTa2BVhtR2iHWrQ5EaNTM) |
| Comparison | [COMPARISON.md](COMPARISON.md) |
| What A03 is and owns | [README.md](README.md) · [ROLLBACK.md](ROLLBACK.md) |

## The owner's device checks and decision on revision 2

6 November 2026, in the [revision 2 checklist](https://claude.ai/artifact/NuGaGAL8e4tDvjMJWfdnxy):
- **Every box passed:** checks 1 and 4–13 on iPhone Safari, and checks 1–3 and 13 on Laptop Edge, 17 boxes in all. There were no comments.
- Check 4 asked whether the XP, the Emphasis count and the Free badges are missed in Play, now that a phone shows them only in Manage. It passed with no comment.
- Two answers were left blank in the doc and given in chat when asked: check 13 on Laptop Edge (the browser's print) **Pass**, and the decision **Accept**.
- **Decision: Accept.** A03 stays as built.

## The owner's decision on revision 1, and what revision 2 changes

**Revision 1** (application `eb1c29f7…8d18`) qualified first time (full passes 1 and 2). On a phone each Skill card showed two rows, the name, Rank and d10, then a labelled **Details** control with a one-line summary and the eye; the rest of the card opened under Details.

**The owner's verdict, 6 November, in the checklist's comments:** all 12 checks passed on iPhone Safari and Laptop Edge, and the decision was **Revise**.
1. Details hides information that is useful at the table, such as the Masteries and the Emphases. The faster scrolling may not be worth it.
2. If anything stays hidden, it should be in the eye's Skill information ("the tooltip"), not in a second control.
3. On the laptop the Advantage and Disadvantage cards still look uneven, because they differ in length. Could they sit on a "grid"?

**Prototypes, measured on the revision 1 build** (scratch only; pictures sent to the owner in chat):
- **No Details in Play:**
  - showing every Mastery, Play cards were 114–173 px against 116 px as built, about 4.5 cards to a screen instead of 5.5 (1.5 before A03);
  - showing only the Masteries reached, they were 114–127 px on average;
  - Manage, with every control, was 214–443 px.
- **Laptop grid** (each Advantage beside a Disadvantage, at the same height):
  - pairs lined up exactly, and the page grew about 100 px;
  - the shorter card in every pair was padded with 17–88 px of blank space.

**Recommendation and decision.**
- Claude recommended dropping Details and keeping the laptop columns as built. The reasons:
  - the two lists are not related row by row;
  - the padding is in every row;
  - an edit in one list would move the other;
  - the even look ends where the shorter list does;
  - it costs height.
- The owner chose: **no Details, only the Masteries reached in Play, and the laptop columns as built.**
- The eye's Skill information shows no Masteries except its debug buttons. That is noted for A04, which settles what sits behind the information button.

**What revision 2 does:** see [README.md](README.md). In brief:
- **Play:** the name, Rank and d10; one summary line (Trait, Emphases, School) beside the eye, wrapping rather than cut off; then the Masteries reached.
- **Manage:** every field straight away (Trait and School beside the eye, Emphases, XP, every Mastery, Remove last).
- **Laptop, tablet, a phone held sideways, and print:** unchanged from revision 1.

## Reforecast (stated at A03's start; estimate only, not a budget approval)

- **A03:** the work order sets it at M, 5 (3–8). Reproduction showed a small change carried by a fixed process: harness, removal, variants, review, 4× screen, discovery, two passes and records.
- **The rest of 15a:** A01 took about 7 points, A02 about 17 and A03 about 24, each A02 and A03 including one revision on the owner's devices. At about 7 points for a clean unit, the other 15 units of 15a need about 100 more weekly points (80–150), plus any revisions. Plan that as several weeks, not as the old grouped 20.

## Verification, measured on this run (revision 2, candidate `e73b7c0c…de06`)

| Check | Result | Evidence |
|---|---|---|
| Reproduction | Measured on A02 as live at A03's start (5 November, unchanged since): desktop headings 1,092–2,249 px apart; phone cards 324–601 px; the long Skills page 7,581 px in Play | `qa/reproduce/predecessor-a02/` |
| A03's own harness | **37/37** on the frozen candidate. 35 checks were pinned first; `FIRST-ROW-STEADY` and `SUMMARY-READABLE` were added after the review and pinned before running | `qa/compact-skills-harness.js`, `qa/expected-checks.json`; A03's leaf in each full pass (`qa/final-run-3/01-full.log`, `qa/final-run-4/01-full.log`) |
| With A02 removed | A03's remover test **12/12**, keeping the A02-removed build; A03's harness **37/37** on that build | `qa/removal-a02-alone-r2.log`, `qa/a02-removed-a03-kept-r2.log` |
| Earlier layers with A03 present | A02's harness **23/23**; Phase 12.4's Skills harness **17/17** | `qa/a02-harness-with-a03-r2.log`, `qa/phase-12.4-with-a03-r2.log` |
| Code review (one, read-only) | No blocking defect. Fixed:<br>• the first row moved between modes<br>• a two-line Emphasis note ran together<br>• the colour match is now case-insensitive<br>• a stylesheet comment and the manifest note<br>Added: `FIRST-ROW-STEADY`, `SUMMARY-READABLE` and the variant `school-caption-wide`. Declared: a phone held sideways keeps the table; the XP, the count line and the Free badges are drawn in Manage only; the focus order | `qa/code-review.md` |
| Variant discovery | **Discovery 1:** 18 of 21 as pinned. Three cases failed more checks than predicted, and none failed fewer:<br>• `no-grid`'s extra `PHONE-END-CLEAR` failure is real, so its pin was put back;<br>• the baseline's and `disabled`'s extra failure came from the harness's typing (Ctrl+A after a tap), fixed without changing any assertion.<br>**Discovery 2:** all **21/21** as pinned | `qa/VARIANT-PINS.md`, `qa/variants-discover-r2-1.log`, `qa/variants-discover-r2-2.log`, `qa/variants-discover-e73b7c0c-1/`, `qa/variants-discover-e73b7c0c/` |
| Qualification chain | Every stage passed, 11:14–12:51 UTC | `qa/qualification-e73b7c0c.json`, `qa/qualify-launch-r2.log` |
| ↳ Removal proof | **12/12**:<br>• A03 alone rebuilds A02 `91d45109…6dc0` exactly;<br>• then A02 rebuilds A01 exactly;<br>• A02 alone and A01 alone verify with A03 kept;<br>• the refusals fire | `qa/removal-final-e73b7c0c.log` |
| ↳ Negative variants | **21/21** matched their pins | `qa/variants-final-e73b7c0c.log`, `qa/negative-e73b7c0c/` |
| ↳ Dependency check | Clean: every reference inside A03's own blocks | `qa/dependencies-e73b7c0c.log` |
| ↳ 4× CPU screen | **113/113 harnesses, 5,317/5,317** (A03's own and every geometry or Skill/Adv-list leaf), 52 min | `qa/under-load-final-e73b7c0c.log`, `qa/under-load-e73b7c0c/` |
| ↳ Discovery run | **6,865/6,865**, fresh folder, 182 leaves | `qa/discovery-2/full.log` |
| Full pass 3 | **Passed on its first execution**, 12:53–13:44 UTC: candidate 6,865/6,865, retained 6,755/6,755, removal to `91d45109…6dc0` exact | `qa/final-run-3/summary.json`, `qa/run-final-twice-34.log` |
| Full pass 4 | **Passed on its first execution**, 13:44–14:35 UTC: candidate 6,865/6,865, retained 6,755/6,755, removal to `91d45109…6dc0` exact | `qa/final-run-4/summary.json`, `qa/run-final-twice-34.log` |
| Comparison | Columns 0 px apart. Phone cards 114–158 px in Play and 241–470 px in Manage. The long Skills page is 7,581 → 2,908 px in Play. The desktop Skills table is unchanged | [COMPARISON.md](COMPARISON.md), `qa/reproduce/candidate-r2/`, `qa/reproduce/compare-r2.md` |
| Local package | **550/550** on the deployed files at 14:41 UTC (23 harnesses: A02's 21, A03's own and Phase 12.4's Skills harness). Page `e7cb9b99…cbc1`, 17,560,147 bytes; service worker `946e8dc511b4b539` | `qa/verify-local-r2.log`, `qa/local/live-verification.json` |
| Hosted branch preview | **550/550** at 14:47 UTC, byte for byte with the local package: the same page, service worker and assets, served on the first download (`verify-live.py --url=<preview>`) | `qa/verify-preview-r2.log`, `qa/hosted-preview/live-verification.json` |

**Counts, discovered and pinned:**
- **Candidate 6,865:** A03's 37 + A02's 6,828; 182 leaves.
- **Retained 6,755:** the tree with A03 removed (exactly A02), less the two live-site leaves; 179 leaves.

**Revision 1's record is kept as it was.** Its candidate was `eb1c29f7…8d18`, and its evidence is in:
- the folders and logs ending `-eb1c29f7`;
- `discovery-1`, `final-run-1` and `final-run-2`;
- `reproduce/candidate`;
- `own-eb1c29f7.log`, `a02-removed-a03-kept.log`, `a02-harness-with-a03.log` and `phase-12.4-with-a03.log`.
- `verify-local.log` and `verify-preview.log`, with their records kept in `local/` and `hosted-preview/` under names ending `-eb1c29f7`.

## Usage (Claude, account-wide, kept separate from Codex)

| When (UTC) | Five-hour | Weekly | Note |
|---|---|---|---|
| 5 Nov 23:34 | 10% | 35% | revision 1 start |
| 6 Nov 00:17 | 52% | 41% | revision 1 before full QA |
| 6 Nov 03:45 | 78% | 44% | revision 1 end |
| 6 Nov 09:15 | 15% | 46% | revision 2 start (after the owner's feedback, the prototypes and the recommendation) |
| 6 Nov 11:15 | 59% | 56% | revision 2 before its qualification chain (after the build, the review, the fixes and the harness typing investigation) |
| 6 Nov 12:54 | 73% | 58% | revision 2 before full QA (after its qualification chain) |
| 6 Nov 14:48 | 10% | 59% | revision 2 end, after the deployed-file checks, before the records commit (the five-hour window restarted at about 14:30) |

**In all, A03 moved the weekly meter from 35% to 59%, about 24 points, against the work order's 5 (3–8):**
- revision 1: about 9 (35% → 44%);
- the owner's feedback, the prototypes and the recommendation: about 2 (44% → 46%);
- revision 2: about 13 (46% → 59%), most of it before its qualification chain (46% → 56%): the build, one review round with its fixes, and the harness typing investigation between the two variant discoveries.

Model `claude-opus-5-5`. Readings come from the desktop app (`qa/usage.json`). They are account-wide, not exclusive to A03. The chains and the full passes ran on the machine, not on the allowance.

## Follow-ups (not A03's; nothing built)

1. **Browser print still aligns the Adv & Disadv columns to the bottom.** On paper Advantages start 836 px lower on the dense character. Print belongs to Release 15b's B12, where this belongs.
2. **For A04:** the Skill information window (the eye) has no player-facing Mastery list, only debug buttons. The owner suggested it as the home for reference detail.
3. **Not verified automatically:**
   - Safari's `:has()` and `display: contents` on the owner's iPhone (device checks 4–11);
   - screen readers (the accessibility tree is checked in Chromium, and the focus order is declared in the README);
   - the Fold's outer screen below 320 px.
4. **The 8b.1 UI follow-ups, FU-15a-1 and the parked stats header** stay as recorded.

## Next

**The owner accepted revision 2 on 6 November.** Merging and going live wait for the owner's separate go-live word. On that word:
1. fast-forward `main` to the branch (no merge commit, no force);
2. verify production byte for byte with `qa/verify-live.py` (no `--url`);
3. run the browser and offline smoke, `BUGFIX — Older School Choices/qa/live-browser-smoke.cjs <qa/live>`.

If A03 ever has to come out, `qa/remove-phase.py` on a scratch copy rebuilds A02 exactly ([ROLLBACK.md](ROLLBACK.md)).

The owner has decided, so A04 may now be scheduled. It has not started, and its kickoff is not written.
