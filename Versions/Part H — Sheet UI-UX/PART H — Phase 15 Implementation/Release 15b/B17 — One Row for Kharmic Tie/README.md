# Release 15b · B17 — One Row for Kharmic Tie

Group 1 (totals and their breakdowns), unit 4.

- **Where it came from:** a new unit, from the owner's round-1 answer of 20 November 2026: "I would have expected a UI of a single change button, a single "i" icon the 3 pips and the reset."
- **Approved in three rounds:**
  - **round 2:** "I approve as recommended";
  - **round 3:** "I approve round 3", for Change and the i on the badge's row;
  - **B18 ruling:** "Approve as proposed", so "Reset session" is kept until B18 decides one word for every such button.
- **The pattern:** it is the first use of the owner's A04.2 row pattern: the choice as a badge, then Change, then one i.
- **Records:** see [MOCKUP.md](<../G1 — Totals and Their Breakdowns/MOCKUP.md>).
- **Built:** 21 November 2026 (Claude), on branch `claude/release-15b-b17`, stacked on `claude/release-15b-b14`.

## What changes

A configured Kharmic Tie (Phase 4.5 (Part I)) is one row:

- **On the left:** the badge, "Aiko · Rank 3", then the pips (●●○) and Reset session.
- **On the right:** Change (Manage only, as before), then one i, held to the badge's line.

How it lays out:

- **On a laptop:** everything is on one line.
- **On a phone in Play:** one line.
- **On a phone in Manage:** the pips and Reset session move under the badge. Change and the i stay on the badge's line.
- **With "Reset":** if B18 later picks "Reset" for every such button, the phone's Manage row fits on one line too (round 3).

What goes:

- **The summary line** "Target: Aiko — Rank 3; 2/3 uses remaining" is hidden on screen. The badge and the pips say it.
- **The two i's** Phase 4.54 (Part I) drew from the badge's and Reset session's titles ("The chosen person for this Kharmic Tie", "Restore this advantage to its per-session maximum"). The titles go, so no i is drawn.

**The one i** opens a window titled "Kharmic Tie", subtitled "Rank 3 · tied to Aiko". It holds:

- the rule in a sentence, with its page (Core Rulebook p.151, as the Phase 4.5 sourcebook audit records it);
- each use, +1k1;
- the uses left (2 of 3);
- what the roll preview and Reset session do;
- in Manage, what Change does.

**Spoken names:**

- Reset session: "Reset session: all 3 Kharmic Tie uses back";
- Change: "Change Kharmic Tie: person or Rank";
- the i: "Kharmic Tie information";
- the pips keep "2 of 3 Kharmic Tie uses remaining".

**Unchanged:**

- the uses, Reset session's work, Change's window, the preview's offer on attack rolls, and the cost;
- an unconfigured Tie's "Needs a choice / Choose…" row;
- the save file.

**Print:** the row prints as before, except that the badge reads "Aiko · Rank 3". B12 (print) is a later group.

## How it is built

- `src/sheet/209.9999999999999999996-feat-kharmic-tie-row.js` holds `KT15` and the switch `KHARMIC_TIE_ROW_ENABLED`, and marks the page with `body.kt15-on`. It wraps `refreshAdvConfigControl`, calling the one it replaced first, so Phase 4.54's and A04's passes have run. Then it reshapes a configured Kharmic Tie's row:
  - it removes Phase 4.54's i's and the two titles;
  - it rewords the badge;
  - it gives the buttons their spoken names;
  - it puts the badge and controls in `.kt15-main`, and Change and the new i in `.kt15-end`.
- `src/css/1152-kharmic-tie-row.css`: the two-column row, the hidden summary, the i's fallback letter and the window's table, under `body.kt15-on`.
- **One guarded seam block:** `kharmic-tie-row-seam`.

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With B17 (this branch, on B14): group 1 complete | `5ac767c6c3680126cfe664aef41e7312d98f24eee842ec679e38ed664dde574d` | 17,750,809 |
| First build of B17, before the i's size was fixed (see below) | `6fb8be32085496f096e794759362e06da9432d8df52799776fba445424443e26` | 17,750,156 |
| Release 15a removed, group 1 kept (`G1 — Totals and Their Breakdowns/qa/remove-15a-keep-group.py`) | `9889c42605d9aedfddd1705e848e1771516cc916b695065471b42ab7fd0a825f` | 17,557,586 |
| B17 removed (B14) | `65b81f74b2dd82cea0ea334fb92c0da7936ae33b01e9008a01d5533df4ef5939` | 17,741,065 |

## Light checks (21 November)

| Check | Result |
|---|---|
| Own harness `qa/kharmic-row-harness.js` (13 checks, pinned before the first run) | Run 1: 12/13 (`qa/run-1.log`). `KT-UNCONFIGURED-UNCHANGED-PHONE` failed in the harness itself: it read the unconfigured row's text with `innerText`, which gives the button's capitalised on-screen form ("CHOOSE…"), so its "Choose…" match missed. The row was right (class `unconfigured`, "Needs a choice", none of B17's parts). It now reads `textContent`; no expectation changed. Run 2: 13/13 (`qa/run-2-text-content.log`). |
| `qa/test-removal.py` | 10/10 (`qa/removal.log`) |
| The harnesses of the layers it touches (Phase 4.5 and its completion pass, Disadvantages, Configuration UX, Darling of the Court, Damage Sessions and XP with Blissful Betrothal, A Changing Sworn Enemy, Phase 12.5's Play controls, Quick Access, A04, A04.1, A15, A16) | 13/13 harnesses, 1,002/1,002 (`G1 — Totals and Their Breakdowns/qa/light/b17-touched-run.log`) |
| Phase 4.5's harnesses, conditional on B17, on the build with B17 removed (B14) | 2/2 harnesses, 99/99 (`G1 — Totals and Their Breakdowns/qa/light/b17-removed-45-run.log`) |
| All four of the group's harnesses on the first build (`6fb8be32…3e26`) | A14 17/17, B04 12/12, B14 10/10, B17 13/13 (`G1 — Totals and Their Breakdowns/qa/light/own-on-group-6fb8be32/`) |
| **The "15a removed, group kept" check** (the owner's decision 3) on the first build | All 26 Release 15a units removed, rebuild verifies; A14 17/17, B04 12/12, B14 10/10, but **B17 10/13** (`G1 — Totals and Their Breakdowns/qa/light/own-on-15a-removed-ca319f80/`). Without A04's ring the sheet's phone rule made the i 40 px tall, so it sat 6 px off the badge's line (and the row was 40 px high in Play). **Fixed:** the i is 28 px with an 8 px touch reach (44 px) under `body.kt15-on`, the same as A04 draws it, whether or not A04 is there. |
| B17's harness on the fixed build | 13/13 (`qa/run-3-touch-size.log`) |
| `qa/test-removal.py` on the fixed build | 10/10 (`qa/removal-2-touch-size.log`) |
| The dependency check, B17, on the fixed build | 1/1 (`G1 — Totals and Their Breakdowns/qa/dependencies-b17-touch-size.log`) |
| The harnesses of the layers it touches, on the fixed build | 13/13 harnesses, 1,002/1,002 (`G1 — Totals and Their Breakdowns/qa/light/b17-touched-run-2-touch-size.log`) |
| All four of the group's harnesses on the fixed group build (`5ac767c6…574d`) | A14 17/17, B04 12/12, B14 10/10, B17 13/13 (`G1 — Totals and Their Breakdowns/qa/light/own-on-group-5ac767c6/`) |
| The same on Release 15a removed, group kept (`9889c426…825f`) | A14 17/17, B04 12/12, B14 10/10, B17 13/13 (`G1 — Totals and Their Breakdowns/qa/light/own-on-15a-removed-9889c426/`) |
| The dependency check, all four units (`G1 — Totals and Their Breakdowns/qa/dependencies.py`) | 4/4: every reference inside each unit's own blocks (`G1 — Totals and Their Breakdowns/qa/dependencies-group.log`) |

## Not covered by the harness

- A native iPhone and Safari. In the device round, open a Kharmic Tie on a real phone in Play and in Manage, and tap its i and Reset session.
- The roll preview's Kharmic Tie offer is not driven here. B17 does not touch it, and Phase 4.5's own harnesses cover it.
