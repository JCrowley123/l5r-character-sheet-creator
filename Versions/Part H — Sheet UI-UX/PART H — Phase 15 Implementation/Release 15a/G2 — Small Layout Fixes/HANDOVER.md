# Release 15a G2 — Small Layout Fixes — handover

9 November 2026 (Codex). **Qualified; waiting for the owner's go-live word.**

Release 15a G2 is qualified, with go-live pending. A05 Missing Limb picker, A06 grant actions and their state, A07 the Moon row, A11 text gaps and one left edge, and A04.1 inline picker rules are on claude/release-15a-a04.1. Application 7793602382c68895b25dc572b71bd05af33667a9c1b1d1bd76032efd744182f0, 17,609,230 bytes. The owner passed 36/36 device checks on 7 November and re-checked revised check 15 on iPhone Safari and Laptop Edge on 8 November. Main and production remain G1; no merge or deployment was performed.

## Units and device review

| Unit | Marker | New checks | Branch |
|---|---|---:|---|
| A05 Missing Limb picker | PART H PHASE 15.1.5 | 22 | claude/release-15a-a05 |
| A06 Grant actions and their state | PART H PHASE 15.1.6 | 20 | claude/release-15a-a06 |
| A07 The Moon row | PART H PHASE 15.1.7 | 26 | claude/release-15a-a07 |
| A11 Text gaps and one left edge | PART H PHASE 15.1.11 | 22 | claude/release-15a-a11 |
| A04.1 One way to show choices in pickers, revision 1 | PART H PHASE 15.1.4.1 | 56 | claude/release-15a-a04.1 |

Each unit keeps its own README, ROLLBACK, remover, removal tests and harness. The owner accepted A05/A06/A07/A11 on 7 November. A04.1's nested Blessing card was revised; the owner confirmed check 15 passed on both devices on 8 November. [Device mirror](DEVICE-CHECKS.md), [approved mock-ups and decisions](MOCKUP.md), [preview evidence](PREVIEWS.md), [code review](qa/code-review.md).

## Qualification

The 25 negative cases matched their predictions in the single discovery and their exact pins in final qualification. The original removal chain stopped at 46/47: A11 had insufficient eligible fixture rows with A05 removed, despite correct alignment. Its fixture was strengthened without changing assertions; A11 then passed 22/22 on all six affected inputs (132/132). The original failed chain remains intact. A guarded continuation validated this evidence and ran only the unstarted variants and dependencies (25/25 and 5/5). All five G2 units removed restore G1 byte-for-byte (17,586,964 bytes). The single full pass passed on its first execution: candidate 7,148/7,148 and retained 6,929/6,929, with fresh execution and no reused leaves. No assertions were widened and no failed chain or full pass was retried. No 4x CPU screen applies to this screen-only group.

- Frozen application: `7793602382c68895b25dc572b71bd05af33667a9c1b1d1bd76032efd744182f0`; **17,609,230 bytes**. No application source changed during this session.
- Predecessor restored: `2dcf6f20846b0c9ea97b59b94537abda6d510714b3bc1ef6376175056d066af6`; **17,586,964 bytes**.
- Candidate arithmetic: G1 7,002 + 22 + 20 + 26 + 22 + 56 = **7,148**.
- Retained arithmetic: 35 + 33 + 50 + 19 + 37 + 6,755 = **6,929**. The same two live-site leaves, 73 checks, are excluded as in G1's retained run.
- [Variant pins](qa/VARIANT-PINS.md), committed before discovery at `d8764eaf`; [discovery results](qa/variants-discover-77936023/summary.json); [preserved failed chain](qa/qualification-77936023.json); [qualified continuation](qa/qualification-77936023-a11-fixture.json); [full pass](qa/final-run-1/summary.json).
- Full candidate and retained durations: 25.48 and 22.92 minutes.
- The original group removal's 47 checks comprise 15 structural checks and 32 complete harness runs: 46 passed, and one A11 run failed only its fixture-coverage minimum. Each removed-unit tree keeps the other G2 units; A03.1 is also removed with G2 kept. The six fresh A11 proofs use the unchanged harness and preserved page hashes. Phase 4.5.21's declared conditional fixture passed both with and without A04.1. A03's timing-sensitive harness passed on the A11-removed tree.

## Harness and environment notes

The previously declared A03 synchronization fix remains in place. Before discovery, A11's two class-comparison checks were corrected to restore the exact initial `te15-on` state in `finally`. This prevents a disabled variant being activated by its harness. Assertions, IDs and time limits are unchanged; the targeted candidate run passed 22/22. The correction is declared in A11's ROLLBACK. No discovery pin correction or repeat was needed.

The removal-stage failure was investigated using read-only geometry capture on the exact preserved scratch page: 17 cards, eight eligible text rows on phone, seven on desktop, no misaligned edges and no page errors. The original fixture depended on A05 placing Missing Limb's note below its select. Only A11's own fixture changed: its existing Moon card received a description, adding independent text coverage while retaining the eight-row minimum and 1 px tolerance. The unchanged 22-check harness passed the candidate and all five removal inputs where A11 remains. The continuation and full-launch gates bind the original failure, scoped log hashes, check IDs, fixture and application hashes. [Investigation](qa/A11-REMOVAL-INVESTIGATION.md) · [scoped proof](qa/a11-fixture-validation/summary.json). Qualification was therefore not an uninterrupted first-chain pass; the full pass itself ran once and passed.

Set `NODE_PATH=C:/Users/jcrow/l5r-qa-tools/node_modules`, `PLAYWRIGHT_BROWSERS_PATH=C:/Users/jcrow/l5r-qa-tools/ms-playwright`, and `PYTHONUTF8=1`. Do not inherit the old installed-Chrome shim. Every ordinary leaf uses navigation-budget.cjs and splash-fast.cjs as in the suite. Browser jobs ran sequentially on mains power, with sleep inhibited for each stage. Scratch removers never target the live source tree.

## Later work recorded from the owner's decisions

- **A04.2 — one pattern for a configured row:** Parked until the rules read pass is done. One line: a filled choice badge at the far left, Change in Manage only, then the i explaining every choice. Below: a summary of the chosen option, written from the later rules read. Say Applied automatically or Reminder in words. Bishamon's Clan-coloured note becomes plain summary text. Mock-up first; not part of G2.
- **Identity character check — Needs a choice:** Owner idea outside G2: list every Advantage or Disadvantage still at Needs a choice, as missing free Skill choices are listed today. No such rule exists today. A small future unit can register one rule with Phase 5 (Part J), using the sheet's own configuration-complete test.
- **A11 whole-app read — later layout work:** Keep for later: the Rings note 12 px right of its label on a laptop; the Armor & TN information heading in Play and its bonus note 3 px below the field; the Wounds table's first column 8 px right of its caption.

G3 onward, FU-15a-1, the parked stats header and FT-59 remain outside this work. A04.2 is gated on completion of the rules read pass.

## Usage and session continuity

[Usage readings](qa/USAGE.md) keep Codex separate from Claude. The initial Codex reading was unavailable, so no whole-session cost is asserted. The owner confirmed Remote Control enabled and the iPhone connected on 8 November.

## Go-live — on the owner's word only

1. Fast-forward `main` to the qualified G2 tip, with no merge commit and no force; push main only after that authorization.
2. From this group's folder run `python -B qa/verify-live.py` with no `--url`, using the environment above.
3. Return to the repository root and run `node "Versions/BUGFIX — Older School Choices/qa/live-browser-smoke.cjs" "Versions/Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/G2 — Small Layout Fixes/qa/live"` (22 checks).
4. Record production evidence. Do not commit `candidate-leaves/`, `retained-leaves/` or `local/site/`.

No later group is started by this handover. The qualification files are single-use; do not launch the completed chain or full pass again.
