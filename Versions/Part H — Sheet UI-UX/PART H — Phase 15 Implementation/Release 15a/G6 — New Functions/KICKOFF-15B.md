# Kickoff — Release 15b: text, Search and print

Prepared by Claude on **19 November 2026**, at the end of the G6 session, at the owner's request ("start the Release 15b kickoff"). It is self-contained, so the earlier chats are not needed. Paths are relative to the repository root.

- The canonical checkout is `C:/Users/jcrow/l5r-character-sheet-creator`. Never use the OneDrive clone.
- That checkout sits on an old branch with untracked QA folders. Never switch its branch.
- **Work in the worktree `C:/Users/jcrow/l5r-release-15b`.** Its branch is `claude/release-15b-kickoff`, cut from `main` `3b499a88`, and it holds this file. Branch from there.

## 1. Where things stand

| Item | State |
|---|---|
| Live app | **Release 15a is complete and live.** `main` is at `3b499a88`: records on top of the qualified `c359fa3a`. Application `921f3ac9e5c61bde84068a20dd5cc4ab014367e8b1b7930438cf24b4a7686150`, **17,718,601 bytes**, at `Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html`. Production was verified on 19 November: seven files byte for byte, 4,930/4,930 checks on the downloaded files, and browser/offline smoke 22/22. |
| 15a record | 28 units, A01 to A19.1, registered in the removal chain right after Phase 11.2.6 (Part K, Release 8c). Their markers are `PART H PHASE 15.1.x`, the last being `15.1.35`; `15.1.32` is unused because A12 was withdrawn. The groups' handovers (G1 to G6 and AE) are in `Versions/Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/`; [G6's](HANDOVER.md) is the latest. A12 was withdrawn into the resistance phase, A18 was closed as not reproduced, and A13 was kept as it is (Q5). |
| 15b | **Not started.** No review, mock-up or build has been done. |
| Usage | Reading at about 23:20 UTC on 19 November: **weekly 30% (all models)**, 5-hour 10%. The weekly meter resets at **01:00 UTC on 25 November**. Take a reading at the start, before any full pass and at the end. Tell the owner if a group is unlikely to fit before the reset. |

Start with `git fetch`. Confirm that `main` is `3b499a88`, or a later commit that only adds records, and that the application hash matches the one above.

## 2. First, the cycle review after 15a

The [4 November work order](<../../../../REASSESSMENT — Cycle 8 Closure 2026-11-04/WORK-ORDER.md>) puts a short review between 15a and 15b ("Cycle review after 15a", about 4 points, range 3–6). Keep it light: it needs no full suite and no browser run.

1. **Costs.**
   - Add up 15a's actual cost from each group's cost block in the ledger's part 3.
   - Compare it with the 94 points (58–150) planned on 4 November.
   - Re-estimate 15b from those actuals. The 4 November figure for 15b, 57 (37–93), was worked out per finding, before the owner's grouped process of 6 November.
2. **Whole-15a removal, in a scratch tree.** Use the removal chain (`Versions/QA — Removal Chain Registry/removal_chain.py`) to remove all 28 15a units from today's `main`.
   - The result must be Release 8c's application exactly: `139e081092d4899d66563a362073ff594a4b6d00ac452fe0789328c8884a2551`, 17,525,378 bytes. Confirm first that nothing outside 15a is registered after Phase 11.2.6.
   - The comparison must be byte-identical, and `recombine.py --verify` must pass.
   - Removers refuse the live tree, so use a scratch copy.
3. **Open notes from 15a.** Make one short table of what the device rounds and handovers left open. For example:
   - A03's print note now belongs to B12.
   - In G6 a tap on a Void pip did not redraw the Void card's note. This is out of scope and recorded only.
4. **Republish the ledger page** at https://claude.ai/artifact/76wpQnwpk6gm6YSwns1PDk, last republished on 4 November, from `Versions/BUILD-LEDGER.html`. Read it with the Artifact tool first, then publish to the same URL.
5. **The next work order.**
   - 15b's groups and order (§4 and §6).
   - Then the resistance phase.
   - Then the phase that applies School Techniques, Kata and Kiho as modifiers.
   - Put it with the review's findings in one Claude Doc with a Decision field, as the 4 November order was.

Write the records once, in a single commit: the review note in the `Release 15a/` folder, the ledger (MD and HTML), the roadmap and a `Versions/CLAUDE.md` pointer. They go to `main` only on the owner's word.

## 3. One decision for the owner, before any mock-up

The design rules require 15b's sequence to be recorded before its first step, keeping A14's identity. Put the following to the owner once, in the work-order doc, each with a recommendation:

- the groups and their order (§6);
- where B14, and any part of B01, belongs (§5).

Do what the owner says, and do not ask again.

## 4. 15b's scope

Read each finding in full under its heading in `Versions/Part H — Sheet UI-UX/PART H — Phase 15 UI Consistency Audit/AUDIT.md` (A14, B01 to B16). Check each one against today's build, because the audit's screenshots date from 31 October, before 15a.

| Finding | Size | What it does | Check first |
|---|---|---|---|
| A14 · explain wound penalties once | S | One net penalty on the wound track, with an information breakdown: the rank penalty, each signed modifier, and the total. The arithmetic and the reduced-penalty floors stay as they are. | Build the owner's two-wound-entry fixture before anything else. A19 and A19.1 changed the Void card's damage row next to the track, and the later Combat tab plans to reuse A14. |
| B01 · short check labels | S | Short labels on the Disadvantage check buttons: Brash, Overconfident, Can't Lie, Contrary, Rumormonger, Soft-Hearted and Lost Love. TN, conditions and costs stay visible. | The wording is settled (Q8). Some are resist checks (§5). |
| B02 · actual and catalogue price | S | "Actual N XP · catalogue M XP", with the reason in the information, as Clan-priced rows already do. Read the price engine's results and never recompute them. | Social Position, and Kharmic Tie with Blissful Betrothal. |
| B03 · Leadership label | S | "Lead an ally". The formula and the condition go beside it or into its information, and any amount the player needs stays visible. | |
| B04 · Blind under Armor TN | S | Drop the repeated Blind line, once the Armor TN information shows Blind's whole contribution. | Quick Access. |
| B05 · restrained success wording | S | Touch of the Void's success line reads "You remain in control". The result, TN, failure and cost messages stay. | A19 revision 1 changed how Touch of the Void's save flows, so read today's text. |
| B06 · Clan and School prose | S | Manage keeps one identity summary and one Apply/Cancel instruction, with the reference prose behind the information. Play keeps the School and the Technique link. All warnings stay. | A04's information pattern and AE3's School-technique tags. |
| B07 · Search controls while scrolling | M | Search gets a compact sticky region with the query and category, filters in a disclosure, and return-to-top. The result scroll and focus are restored when a detail closes. There is no second navigation bar. | A02's floating corners: return-to-top already sits bottom-right. |
| B08 · Search facets | M | Cost moves into More filters. Skill becomes the weapon-kind filter, and Weapon/Arrow becomes "Item type" in More filters. Clans get All / Clans / Families. Combinations, counts and reset are kept. | |
| B09 · Skill picker Trait labels | S | The picker's labels come from the final corrected catalogue: compare every picker Trait with its added row and change labels only. It stays independent of A20. | A20's book table: for example, Etiquette (Courtesy) with Willpower is Core p.145. |
| B10 · old-name tags | S | Hide the "Formerly" tags, but keep both old names as search aliases and keep old saves and scrolls working. | The Spell Names harness's display assertion needs an expectation that follows the switch, with its count unchanged. The alias checks stay. |
| B11 · Blackmail in Search | S | Search says four different people for the Scorpion Instigator, as the School picker does, with the existing citation. Eligibility is unchanged. | |
| B12 · browser print | L | Fix the Rings width first. Hide actions, spinners, empty Roll columns and screen-only text. Top-align the Advantage columns, avoid needless page breaks and drop truly empty panels. There is no page-count target. | A03's note: on paper, Advantages start 836 px lower on the dense character. The template PDF export and its continuation pages stay as they are. |
| B13 · colophon | S | Current provenance and credits go into About, reached from the existing menu. Stale and screen-only text comes off paper. Attribution and licence stay reachable, and no floating control is added. | |
| B14 · Jigoku's total | S | The line reads "+8 to total — Taint Rank 4 × 2 (Lost)", built from current values. The formula and the gate stay. | It sits on the resisting rows (§5). |
| B16 · citation range | S | The whole book and page-range link comes first, then the Library badge beside it. The destination and the missing-book action stay unchanged. | Seen on the Scorpion Instigator (pp.249–250). |
| B15 · Library correction drop-down | — | **Kept as it is** (Q5). Record the decision; there is no build. | |

## 5. Overlap with the resistance phase

The resistance phase is pinned to start after Phase 15. It redesigns the resisting rows: the owner leans to versions 1 and 2, merged into one whole-row design, and Q5 of the resistance rules read is still open. Its records are on branch `claude/release-15a-a12` (tip `a8ada8aa`), in G5's folder. Do not reopen that design here.

- **B14** is a line on those resisting rows. Recommend moving it into the resistance phase, so the merged design words it once. Keep it in 15b only if today's build shows the line outside the rows that phase redraws.
- **B01's** buttons are on the Disadvantage cards, not on the resisting rows, so recommend keeping B01 in 15b. Check whether any of them (Brash, Rumormonger or Lost Love) would be redrawn by the resistance design, and say so if one would.

## 6. Proposed groups (a starting point)

These groups follow the 6 November amendment's 3–4 related findings. Revisit them after reading today's build.

| Group | Findings | Likely tier |
|---|---|---|
| 1 · Sheet information | A14, B02, B06, B09 | Screen-only |
| 2 · Sheet wording | B01, B03, B04, B05 (with B14 if it stays) | Screen-only |
| 3 · Search text | B10, B11, B16 | Screen-only |
| 4 · Search controls | B07, B08 | To decide: B07 restores focus and scroll, and B08 changes which results show, which points to behaviour tier |
| 5 · Print and About | B12, B13 | Screen-only on screen; print needs its own paper checks |

The recommended order is 1, 2, 3, 4, then 5. Group 1 comes first because the audit's sequence begins with A14. Print comes last because it is the largest finding and touches everything printed.

## 7. 15b must work with 15a removed

The design rules (§3 and §5) require 15b to keep working with all of 15a removed, and Phase 15's closure must prove it.

- Each unit declares which 15a layers it reads or decorates (A02's corners, A03's cards, A04's i, AE3's tags, A19, A20 and so on). It must behave sensibly when they are absent.
- Recommended, and cheap: add one stage to each group's chain. Remove all of 15a with the group kept, using the chain's single-unit removals in reverse order. Rebuild, and run the group's own harnesses on the result.
- That finds a dependency while it is cheap to fix, not at closure. Confirm this stage with the owner in the review (§2).

## 8. The process

These are the owner's rulings. Read `PHASE-15-DESIGN-RULES.md` in the audit folder, including the 6 November amendment.

1. **Mock-up first.** Show today's screen beside the proposal, using real screenshots of the live build at phone and laptop size, as WebP images.
   - Publish it as a private artifact with a clear recommendation. The owner likes side-by-side boards.
   - Record the owner's words verbatim in a `MOCKUP.md`.
   - Build only what the owner approves.
2. **One folder per finding** under `Release 15b/`. Each folder has its own fragments, switch, marker, seam block, README, ROLLBACK, a harness with ids pinned before its first run, a remover and `test-removal.py`.
   - Each finding gets a `CHAIN` entry after `A19.1 — The Damage Row Fits a Phone`.
   - A group folder holds shared records only.
3. **Markers.** The recommendation for 15b is `PART H PHASE 15.2.1` onwards, so an "undo release 15b" can pick out its units at a glance. Before the first build, confirm that the remover and the drift check accept it.
4. **Branches and the owner's review.**
   - Use stacked branches, each with its own preview.
   - Light checks: the unit's own harness, its removal proof, the dependency check and the harnesses of the layers it touches.
   - Run one read-only code review before the owner's review.
   - Then the owner's device round, in a Claude Doc checklist with a repository mirror: Pass or Fail per device, and Accept, Revise or Remove per finding.
5. **Qualify only the accepted units,** by tier.
   - **Screen-only:** one full pass, as both the candidate and the retained build. Counts are pinned by arithmetic and there is no discovery run. The 4× CPU screen is needed only for timing, animation or asynchronous behaviour.
   - **Behaviour:**
     - variants predicted and pushed before discovery;
     - the chain: group removal, variants, dependencies and the 4× CPU screen;
     - then two full passes, each passing on its first execution.
   - **Counts for the first group:**
     - candidate = **7,453** plus the group's new checks (205 leaves plus its harnesses);
     - retained, with the group removed (G6 as live) = 7,453 − 73 = **7,380**, on 203 leaves.
     - The retained count leaves out the same two live-site leaves as every group since G1: 5a's `sw-checks.js` and 5b's `notice-checks.js`.
     - Removing the group must restore `921f3ac9…6150`, 17,718,601 bytes, exactly.
6. **Records, then go-live.**
   - Write the records once per group: the handover, the ledger (MD and HTML: parts 1, 2, 3, 4 and 6 and the header), the roadmap and a CLAUDE.md pointer.
   - Go live only on the owner's word. Fast-forward `main` with no merge commit and no force.
   - Then run `verify-live.py` and the browser/offline smoke, `Versions/BUGFIX — Older School Choices/qa/live-browser-smoke.cjs <evidence dir>`.

**G6's `qa/` folder is the worked example for the behaviour tier:**

- `verify-variants.py`
- `test-removal-group.py`
- `dependencies.py`
- `run-under-load.py`
- `qualify-before-full.py`
- `final-qa.py`
- `run-final-twice.py`
- `light-run.cjs`
- `verify-preview.py`
- `verify-live.py`

**G3's `qa/` folder (`Release 15a/G3 — Spell Rows/qa/`) is the worked example for screen-only.** It has `run-final-once.py`.

Copy the scripts and change their constants. Create fresh state files. Never reuse G6's run folders, logs or `full-launched.txt`.

## 9. Environment and lessons from 15a

**Environment.**

- Set `NODE_PATH=C:/Users/jcrow/l5r-qa-tools/node_modules`, `PLAYWRIGHT_BROWSERS_PATH=C:/Users/jcrow/l5r-qa-tools/ms-playwright` and `PYTHONUTF8=1`. Leave `NODE_OPTIONS` unset.
- Every leaf preloads `Versions/PART K — Phase 14.2 Kata and Kiho References/qa/navigation-budget.cjs` and `Versions/Part F — Cross-Platform Delivery/PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs`. Splash and startup tests are the exception.

**Running checks.**

- One browser job at a time.
- Run full suites on mains power, with sleep held off.
- A failed full pass is investigated, never re-run.
- Never drop assertions, widen expected values or merely lengthen timeouts.

**Lessons from 15a's harnesses.**

- **15b changes labels, and other layers read labels.** A20's touched run found Smart Roll Preview reading the Trait row's label. Before changing any label's text or structure, search for every reader of it.
- **A harness that takes its unit's page class away must put it back only if it was there.** Otherwise a disabled build gets switched on by its own harness.
- **Pick mutations that the check really guards.** A mutation can be masked: in G3, lowering a button's min-height changed nothing because the row stretched the button.
- **Under the 4× CPU throttle, an idle page can sleep past a timer.** Keep the page awake while waiting; G5 wakes it every 250 ms.
- **Make "press the unit's control" steps tolerant of the unit being absent,** so the run on the predecessor build still reports.
- **Keep one unit's checks independent of a sibling unit's output.**
- **Open a closed `<details>` before clicking inside it.**
- **Harness pages block web fonts,** so name boxes are 3 px shorter than on a device. Leave margins for that.

**Building and committing.**

- A rebuild can fail with `OSError 22` (a file lock). Run it again.
- Run `PYTHONUTF8=1 python build.py --check-drift` before every commit. `recombine.py --verify` must be byte-identical.
- In prose, write "Phase 12 (Part K)", never in marker order, and never a bare "BUGFIX" in a comment.
- `Versions/CLAUDE.md` is append-only and must keep exactly eight CR bytes. Markdown and JSON use LF.
- Commit only your own files. Never stash or reset. End commits with the Co-Authored-By line.

**Rules content and privacy.**

- Rules content goes in our own words, with book and page references, never verbatim.
- Book text may be extracted only to temporary folders, which are deleted afterwards. B09 and B11 may need a book check.
- Keep the owner's email private.

## 10. Not in scope

- the resistance phase, beyond deciding where B14 and B01 belong;
- the phase that applies Techniques as modifiers;
- A04.2, parked;
- FT-59;
- FU-15a-1;
- the parked stats header;
- the remaining A11 layout observations;
- the Combat tab, tattoos, sync and the career planner;
- FT-16;
- the roll-odds idea;
- the template PDF redraw;
- G6's Void-pip note (record it; do not fix it).
