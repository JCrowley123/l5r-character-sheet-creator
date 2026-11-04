# Release 15a · A02 — the floating controls on one strip above the tabs

Phase 15, Release 15a, finding A02 ([audit entry](<../../../PART H — Phase 15 UI Consistency Audit/AUDIT.md>), owner ruling Q2 of 1 November 2026, [delivery rules](<../../../PART H — Phase 15 UI Consistency Audit/PHASE-15-DESIGN-RULES.md>)). Built on 4 November 2026 after the owner accepted A01 and A01 went live. Built alone: none of A03 onward, none of the three 8b.1 UI follow-ups, and not FU-15a-1.

## What changed

Three buttons used to float over the sheet. On a phone, Quick Access's circle sat over each page's heading, the return-to-top button sat on the tab bar, and the dice covered the lowest fields, even at the very end of a page (Combat's Wounds **+**, for example). A02 sets aside one band, 52 px high, between the pages and the tab bar. The pages now end above it, so nothing lies over the sheet. The same three buttons sit on that band:

- **Quick Access** on the left. Its panel now opens upward from the button, between the header and the band.
- **Return to top** in the middle. It still appears only after the page has scrolled 300 px (Phase 1's own rule), and there is still only one.
- **The dice** on the right.

Search stays in the app bar. There is no second destination bar.

Unchanged: what each button does, its name and its keyboard order. Also unchanged: the tabs, swiping, each page's scroll position, the modals and screens that open above the sheet, print, and all character data. The buttons are not moved or copied in the page: A02 only reserves the band and sets where they are drawn. The band is the same at every width, on a phone and on a desktop.

## Current behaviour reproduced first (A01 live, 4 November 2026)

The audit's screenshots predate 8b, 8c and A01, so today's build was measured first: every tab in Play and Manage, at the top, part-way and at the end of each page, on a phone (390 × 844), a small phone (375 × 667) and a desktop (1440 × 1000). That is 171 states (`qa/reproduce.cjs`, results in `qa/reproduce/predecessor-a01/`). Findings, all as the audit describes:

- **Quick Access** covered the heading at the top of every page on the phone (for example *Skills*, *Combat*, *Equipment & Money*). Further down, it covered fields and buttons.
- **Return to top** sat on the tab bar whenever it showed, on the phone and on the desktop.
- **The dice** covered fields at the top of pages and controls at the end of pages (Combat's Wounds **+**, Identity's *Review starting spells*, Skills' mastery note).
- On the desktop, Quick Access and the dice sat in the page margins and covered nothing. Only return-to-top touched the tabs there.

The same probe on the candidate: **0 of 171 states** has a control over the page or on the tabs (`qa/reproduce/candidate/`).

## How it is built

| Owned item | Purpose |
|---|---|
| `src/sheet/209.9999999999999996-feat-floating-strip.js` | `FC15` adds the band (`#fc15Strip`) directly before the tab bar and sets `fc15-on` on the body; `FLOATING_STRIP_ENABLED` |
| `src/css/1128-floating-strip.css` | The band's look and height, and the positions of the three buttons and the Quick Access panel, all under `body.car-active.fc15-on` |
| Manifest entries for both | CSS last before the stylesheet closes; script right after A01's |
| `210-test-seam-and-init.js` block `floating-strip-seam` | Guarded test exports, right after A01's block |
| `QA — Removal Chain Registry` entry | Last in `CHAIN`, after A01 |

Each button's position is the tab bar's measured height, plus half the band's spare height. That height is the carousel's own `--car-tabbar-h`, which includes any safe-area padding the tab bar has. The page does not ask for edge-to-edge drawing (`viewport-fit=cover`), so on an iPhone the browser keeps the home-indicator area clear itself and the safe-area insets read as 0. Device check 9 is the real test of that. Quick Access and return-to-top are 44 px, the carousel's own minimum touch target; the dice is 48 px. ID selectors let the new placements outrank the older ones without `!important` and without editing them. The band is decoration only (`aria-hidden`, nothing focusable). Marker `PART H PHASE 15.1.2` (Phase 15 · Release 15a · finding 2). Removal: [ROLLBACK.md](ROLLBACK.md).

**One cost, measured:** the band takes 52 px from every page. On a phone held on its side (844 × 390), the visible page goes from 193 px to 141 px. That is one of the owner's device checks.

**Not verified automatically:** the app bar placed at the bottom (the app ships it at the top; the arithmetic for the bottom was checked by the reviewer, not run), and the Quick Access panel reaching its height cap (the densest test character's panel is shorter than the cap).

## Verification

Recorded in [HANDOVER.md](HANDOVER.md) with the measured numbers of this run.
