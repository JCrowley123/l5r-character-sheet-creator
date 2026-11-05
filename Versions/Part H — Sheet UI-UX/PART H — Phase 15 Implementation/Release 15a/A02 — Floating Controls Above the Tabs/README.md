# Release 15a · A02 — the floating controls in the bottom corners, above the tabs (revision 2)

Phase 15, Release 15a, finding A02 ([audit entry](<../../../PART H — Phase 15 UI Consistency Audit/AUDIT.md>), owner ruling Q2 of 1 November 2026, [delivery rules](<../../../PART H — Phase 15 UI Consistency Audit/PHASE-15-DESIGN-RULES.md>)). Built on 4 November 2026 after the owner accepted A01 and A01 went live. **Revised on 5 November 2026 on the owner's decision (Revise)**, after the device checks of revision 1. Built alone: none of A03 onward, none of the three 8b.1 UI follow-ups, and not FU-15a-1. The folder keeps its name, and the files and switch keep revision 1's names, so the removal chain and the records still point at one unit.

## Why there is a revision 2

Revision 1 set aside a 52 px band between the pages and the tab bar and put the three buttons on it. All 11 device checks passed on iPhone Safari and Laptop Edge. The owner's verdict (checklist comments, 5 November):
- The band made two solid bars at the bottom that felt separate from the sheet, starkly so on the laptop.
- On the iPhone it felt cluttered and claustrophobic, because it took page height on a small screen.

The owner chose (a) no bar, (d) the dice as a floating button and (e) return-to-top only after scrolling, with Quick Access floating bottom-left. They parked (c), key stats always on view like D&D Beyond's header, for the new Combat tab: see the roadmap's Combat tab plan and the [mock-up canvas](https://claude.ai/artifact/3xjspD1SqtVrRz46dvoM3h).

## What changed

Three buttons used to float over the sheet. On a phone:
- Quick Access's circle sat over each page's heading.
- The return-to-top button sat on the tab bar.
- The dice covered the lowest fields, even at the very end of a page (Combat's Wounds **+**, for example).

Revision 2 places the same three buttons in the bottom corners, just above the tabs:

- **Quick Access**, bottom-left. Its panel opens upward from the button.
- **The dice**, bottom-right.
- **Return to top**, directly above the dice. It still appears only after the page has scrolled 300 px (Phase 1's own rule), and there is still only one. On a short screen (a phone on its side, height 500 px or less) it sits beside the dice instead, so the corner stays one button high.

Every page also gets **room at its end** as tall as the corner stack: 116 px, or 64 px on a short screen, instead of the carousel's 24–30 px. So at the very end of a page every field scrolls clear of the buttons. Part-way down a page, content passes under the corners as it scrolls, which the owner accepted. The pages run down to the tab bar again, so no height is lost. Search stays in the app bar, and there is no second destination bar. On a desktop the buttons sit in the page margins and cover nothing.

Unchanged: what each button does, its name and its keyboard order. Also unchanged: the tabs, swiping, each page's scroll position, the modals and screens that open above the sheet, print (no buttons, no extra room) and all character data. The buttons are not moved or copied in the page. A02 only sets where they are drawn and how much room each page leaves at its end.

## Measured (5 November 2026)

`qa/reproduce.cjs` loads the Phase 15 audit's dense test character into a build. It visits every tab in Play and Manage, at the top, part-way and at the end of each page, on a phone (390 × 844), a small phone (375 × 667) and a desktop (1440 × 1000): 171 states. A01 as live and revision 2 were measured with the same probe: `qa/reproduce/predecessor-a01-r2/` and `qa/reproduce/candidate-r2/`. Comparison: [COMPARISON.md](COMPARISON.md).

On the phone:
- Headings covered at the top of a page: 19 → **0**.
- Controls on the tabs: 21 → **0**.
- Content covered at the very end of a page: 16 → **0**.
- Page height: 641 px, the same as A01 (revision 1 cut it to 589).

## How it is built

| Owned item | Purpose |
|---|---|
| `src/sheet/209.9999999999999996-feat-floating-strip.js` | `FC15` sets `fc15-on` on the body when the carousel's shell holds its tab bar; `FLOATING_STRIP_ENABLED`. It adds no element |
| `src/css/1128-floating-strip.css` | The corner placements of the three buttons and the Quick Access panel, the short-screen placement of return-to-top, and the end-of-page room, all under `body.car-active.fc15-on` |
| Manifest entries for both | CSS last before the stylesheet closes; script right after A01's |
| `210-test-seam-and-init.js` block `floating-strip-seam` | Guarded test exports, right after A01's block |
| `QA — Removal Chain Registry` entry | Last in `CHAIN`, after A01 |

Each button's bottom edge is the tab bar's measured height (`--car-tabbar-h`, the carousel's own, including any safe-area padding) plus an 8 px gap. When the app bar is placed at the bottom, its height is added. Quick Access and return-to-top are 44 px, the carousel's minimum touch target; the dice is 48 px. Quick Access sits 2 px higher than the dice's bottom edge, so the two centres line up. ID selectors let the new placements outrank the older ones without `!important` and without editing them. The end-of-page room is set with `@media screen`, so print keeps its own spacing. Marker `PART H PHASE 15.1.2` (Phase 15 · Release 15a · finding 2). Removal: [ROLLBACK.md](ROLLBACK.md).

**Not verified automatically:** the app bar placed at the bottom (the app ships it at the top), and the Quick Access panel reaching its height cap (the densest test character's panel is shorter than the cap).

## Verification

Recorded in [HANDOVER.md](HANDOVER.md) with the measured numbers of this run. Revision 1's evidence (candidate `1cc41d8c…5d2c`: discovery-1/-2, final-run-1 to -4, the under-load folders ending -3 and -4, `reproduce/candidate/`) is kept as it was.
