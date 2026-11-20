# Cycle review after Release 15a — 19 November 2026

Claude, on the kickoff for Release 15b ([KICKOFF-15B.md](<G6 — New Functions/KICKOFF-15B.md>), §2). This is the light review the [4 November work order](<../../../REASSESSMENT — Cycle 8 Closure 2026-11-04/WORK-ORDER.md>) puts between 15a and 15b. It ran no full suite and no browser. Branch `claude/release-15b-kickoff`, from `main` `3b499a88` (application `921f3ac9…6150`, 17,718,601 bytes, confirmed).

**The owner's decisions were asked in one Claude Doc: [Work Order — 19 November 2026: Release 15b](https://claude.ai/artifact/WqezEhpZ2mYS76kXD96WiP). On 20 November the owner approved all three as recommended (§6).**

## 1. What 15a cost

A point is 1% of Claude's weekly allowance, read from the account-wide meter. Each group runs from its first reading to the next group's first reading, so the figures add up to the meter's movement. They are upper bounds: other sessions share the meter. Codex's work (G2's qualification and go-live, G3's reproduction and first mock-ups, and most of the resistance rules read) ran on its own allowance and is not added.

| Group | Units | Meter (weekly, all models) | Points | Notes |
|---|---:|---|---:|---|
| A01 | 1 | 9% → 17% (4 Nov) | 8 | |
| A02 | 1 | 17% → 35% (4–5 Nov) | 18 | revision 2 after the device round |
| A03 | 1 | 35% → 62% (5–6 Nov) | 27 | revision 2 after the device round |
| G1 | 4 | 62% → 81% (6–7 Nov) | 19 | three mock-up rounds |
| G2 | 5 | 81% → 93% (7 Nov) | 12 | Claude's build only; Codex qualified it |
| G3 | 3 | 0% → 53% (11–12 Nov) | 53 | 8b.1-UI-03 revised; the five-hour limit reached once |
| G4 | 4 | 53% → 75% (12 Nov) | 22 | A10.1 revised after the code review |
| AE | 3 | 75% → 99%, then 58% → 64% (12–14 Nov) | 30 | AE2 and AE3 revised. On 13 November the meter fell from about 99% to 58% with no weekly reset (an account-side change), so the two stretches are added |
| G5 | 1 | 64% → 75% (14–16 Nov), then 0% → 6% (18 Nov) | 17 | A08 accepted; A12 built, then withdrawn |
| G6 | 3 | 6% → 29% (18–19 Nov) | 23 | A19 revised; A19.1 added. Includes G5's go-live |
| **Total** | **26** | | **229** | |

Not counted: A12's revision options and resistance mock-ups (75% → 82%, about 7) and Claude's part of the resistance rules read (82% → 95%, about 13). Both moved with A12 to the resistance phase.

**Against the plan.** The 4 November work order planned 94 (58–150) for 15a. It cost about 229: 2.4 times the midpoint and about 1.5 times the top of the range. The reasons:

- Seven of the ten groups revised a unit after its code review or the owner's device round (A02, A03, A04.1, 8b.1-UI-03, A10.1, AE2 and AE3, A19). Each revision repeats checks, and A01 to A03 each re-ran full qualification.
- Seven of the 26 units were not in the plan: A03.1, A04.1, A10.1, A19.1 and AE1 to AE3.
- The plan priced each finding alone, before the owner's grouped process of 6 November. Under it a group cost 17 to 53 points, about 22 in the middle (G2 left out: Codex qualified it).

**15b re-estimated from those actuals: about 120 (85–182) points,** against 57 (37–93) on 4 November. It assumes one revision per group, as 15a had. It is a planning judgment, not an approved budget.

| Group (as recommended) | Findings | Tier | Points |
|---|---|---|---:|
| 1 · Totals and their breakdowns | A14, B02, B04, B14 | Screen-only | 22 (16–32) |
| 2 · Labels and wording | B01, B03, B05, B09 | Screen-only | 18 (13–28) |
| 3 · Reference text | B06, B10, B11, B16 | Screen-only | 20 (14–30) |
| 4 · Search controls | B07, B08 | Behaviour | 28 (20–42) |
| 5 · Print and About | B12, B13 | Screen-only, plus paper checks | 32 (22–50) |

Each group includes about 1 point for the stage with 15a removed (decision 3). Phase 15's closure, about 4 (3–6), comes after. After the ledger republish the weekly meter read 34%, so about 66 points remain before the reset on 25 November at 01:00 UTC: groups 1 and 2 should fit, group 3 only if decisions and device rounds come promptly, and groups 4 and 5 fall in the week from 25 November.

## 2. The whole of 15a removed gives Release 8c exactly

[`review-qa/remove-all-15a.py`](review-qa/remove-all-15a.py) copied the live Phase 0 tree to a temporary folder and removed every release registered after Phase 11.2.6 (Part K) through `removal_chain.strip_later`. Result: **13/13** ([log](review-qa/remove-all-15a.log)).

- Everything registered after Phase 11.2.6 is a 15a unit, and every 15a folder with a remover is registered: 26 entries.
- The live tree is `921f3ac9…6150`, 17,718,601 bytes, with 26 distinct `PART H PHASE 15.1.x` markers.
- The 26 removers ran newest first, A19.1 to A01. `recombine.py --verify` reported **BYTE-IDENTICAL**: `139e081092d4899d66563a362073ff594a4b6d00ac452fe0789328c8884a2551`, 17,525,378 bytes.
- The rebuild equals, byte for byte, the application at Release 8c's production record (`962782da`).
- No 15a marker or fragment is left in the scratch tree, and the live tree was unchanged.

**A count corrected.** 15a has **26** built units, not 28 as the kickoff says. The 28 appears to include A12 (withdrawn) and A18 (closed, nothing built). The markers are 15.1.1 to 15.1.7, 15.1.3.1, 15.1.4.1, 15.1.11, 15.1.15, 15.1.16, 15.1.21 to 15.1.31 and 15.1.33 to 15.1.35; 15.1.32 (A12) is unused. The first 15b marker is recommended as `PART H PHASE 15.2.1` (kickoff §8).

## 3. What 15a left open

| Note | From | Where it goes |
|---|---|---|
| On paper, Advantages start 836 px lower than Disadvantages on the dense character | A03 | B12, group 5 |
| The colophon's faint mon shows over the tab bar | A02 | B13, group 5 |
| A tap on a Void pip does not redraw the Void card's note ("2 Void Points remaining" with 3 back) until the next redraw | G6 | Recorded only; not in 15b |
| A19's Undo covers Void spent on the card only: not in a roll preview, Lost Love, Dark Paragon, an Ancestor's gift or a pip | A19 | As designed; recorded |
| The splash layer's fade check failed once while Chrome was busy, and passed when run again | G4 | Watched in 15b's light checks |
| FU-15a-1: Kiho, Kata and spells already learnt stay in their pickers | A01 | Unscheduled |
| Naming the monk's Lore subject in the wizard adds a "School Skill at Rank 0" warning (already in Release 8c) | A01 | Recorded only |
| Quick Access is short on a phone held sideways (45–100 px of list); it works | A02 | Recorded only |
| Not tested automatically: the app bar at the bottom, Quick Access at its height cap, screen readers, the Fold's outer screen below 320 px | A02, A03 | Recorded only |
| AE2: a failed save clears its note; the note says "added with its Spell Scroll" even when only the spell was missing | AE review | Recorded only |
| A08: an input event sent late by another layer would split a tap group; none does today | G5 review | Recorded only |
| A11's three layout observations: the Rings note, the Armor & TN heading, the Wounds table's first column | G2 | Recorded only |
| An always-visible stats header | A02 | Parked with the Combat tab |
| FT-59: a mon and colour theme for every Clan | G1 | Parked |
| A04.2: one pattern for a configured row | G2 | Parked until its rules read |
| A character-check rule listing Advantages still at "Needs a choice" | G2 | A small later unit |
| A12 withdrawn; resistance-read Q1 ruled rules as written (Honour kept against Fear and in Brash's check); Q5 open | G5 | The resistance phase |
| A18 closed, not reproduced; A13 and B15 kept as they are | G4, audit | Closed |

## 4. Today's build read for B14 and B01 (kickoff §5)

A code read only, no browser; the group's mock-up will take real screenshots.

- **B14 is not on the resisting rows.** The "+8 … (Lost)" line belongs to Touch of the Spirit Realms (Jigoku), an Advantage that adds the Taint Rank to attack rolls and to Physical-Trait Skill and Trait rolls, twice when Lost (Core Rulebook pp.154–155; `209.92992-feat-adv-spirit-realms.js`). It is drawn in the roll preview's automatic modifiers ("Lost: twice Taint Rank 4") and on the Advantage card ("Adding 8 (Taint Rank 4, doubled: Lost)."). It is not a declaration and not a row of the resistance rules table, so the kickoff's own condition keeps it in 15b. Cursed by the Realm (Jigoku), a Disadvantage, is a different entry: its penalty to resisting the Taint is resistance row `C-realm-jigoku`.
- **B01's buttons.** Brash, Can't Lie, Contrary, Overconfident, Rumormonger and Soft-Hearted are check buttons on the Disadvantage cards (`209.9999998-feat-checks-conditions.js`, Phase 4.5.31, Part I); today they read "Check (TN 25)", "Check (TN 5 × Glory)" and so on. All six are rows of the resistance rules table, as existing dedicated checks. The design the owner leaned to (combined version 1) adds a button beside an ability where the book names one roll, the same kind of button, so that phase will likely restyle these six. B01 sets their wording, which the phase can reuse. Lost Love's "Spend a Void Point" is not a resistance. Brash's Honour bar (resistance-read Q1, ruled rules as written) is a rules fix, not a label, and is not B01's.

## 5. Usage

Claude, Opus 5.5, Pro plan, account-wide meters: weekly all models 30% and five-hour 15% at 23:25 UTC (start); 32% and 29% at 23:39 UTC, after the work-order doc; 34% and 42% at 23:45 UTC, after the ledger page was read in full and republished. The review cost about 4 points against its 4 (3–6) estimate. The weekly meter resets on 25 November at 01:00 UTC.

## 6. The owner's decisions, 20 November 2026

The owner gave the same answer in two places, verbatim: the button "Approve as recommended" in this Claude session, and "approve the three 15b decisions as recommended" in the session that started it. The answer is recorded in the work-order doc's Decision column on all three rows.

1. **Groups and order.** 1 A14, B02, B04, B14 · 2 B01, B03, B05, B09 · 3 B06, B10, B11, B16 · 4 B07, B08 (behaviour tier) · 5 B12, B13.
2. **B14 and B01.** Both stay in 15b.
3. **The 15a-removed stage.** Each group's chain gains a stage that removes all of 15a, keeps the group and runs the group's own harnesses.

Group 1's mock-ups followed the same day: [MOCKUP.md](<../Release 15b/G1 — Totals and Their Breakdowns/MOCKUP.md>). The weekly meter read 35% at the start (00:55 UTC).
