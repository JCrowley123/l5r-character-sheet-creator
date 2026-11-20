# Release 15b · A14 — One Net Wound Penalty

Group 1 (totals and their breakdowns), unit 1.

- **The finding:** the audit's A14, "Explain wound penalties once".
- **The owner's approval:** in three rounds on 20 November 2026, as mocked up, with one revision. The owner's words: "So in the wound penalty section it would say -5 to total -- nicked … the new "i" icon does a good enough explanation for how the penalty is calculated." See [MOCKUP.md](<../G1 — Totals and Their Breakdowns/MOCKUP.md>).
- **Built:** 20 November 2026 (Claude), on branch `claude/release-15b-a14`, stacked on `claude/release-15b-kickoff` (Release 15a as live).

## What changes

When Low Pain Threshold or Strength of the Earth changes the Wound penalty (Phase 4.5.29 (Part I)):

- **Where the brackets go:** the Wounds line, each level's spoken name, the level's window and Quick Access now show only the penalty that applies. For example, "Nicked — TN of all rolls +5 — 12 of 38 wound points", without "(Low Pain Threshold +5, Strength of the Earth −3)".
- **An i at the end of the Wounds line**, and of Quick Access's Wounds line, opens the current level's window. It appears only while an entry changes the current level's penalty.
- **The window,** whether opened from the i or by tapping a level, shows a table above the level's rule:
  - the rank's own penalty (Nicked +3);
  - each entry, signed, with its kind and page (Low Pain Threshold +5, Disadvantage, Core Rulebook p.160; Strength of the Earth −3, Advantage, Core Rulebook p.154);
  - the total, "TN of all rolls +5" (or "none" when Strength of the Earth cancels it).
- **The roll preview** keeps its one Wound Penalty row, "-5 to total — Nicked", as the owner revised it. The informational row "3 → 5 (…) already included in the Wound Penalty" goes, from the preview and from the result.
- **Unchanged:**
  - the penalty a roll gets (−5 here), the Wound Ranks, the floors and the thresholds;
  - a character without those entries;
  - print (the i is print-hidden, and the window is not printed);
  - the save file.

Screen only. No figure is worked out here: every number is Phase 4.5.29's own.

## How it is built

- `src/sheet/209.9999999999999999993-feat-net-wound-penalty.js` holds `WP15` and the switch `NET_WOUND_PENALTY_ENABLED`, and marks the page with `body.wp15-on`. It wraps three trunk functions, each calling the one it replaced first:
  - `formatWoundPenalty` takes off exactly the bracketed ending that Phase 4.5.29 adds;
  - `showWoundInfoModal` adds the table;
  - `renderQuickAccessPanel`, which the track calls after every render, puts the two i's back after the track rewrites both lines.
  - It also replaces `WND4529.rollNote` with an empty list.
- **The i** is a `.sk-info-btn` with no text of its own, so Quick Access's copy of the line (`textContent`) is unchanged. Its letter comes from this unit's `::after`, and A04's ring draws over it where A04 is present.
- `src/css/1150-net-wound-penalty.css` styles the i's spacing and the table, under `body.wp15-on`.
- **One guarded seam block:** `net-wound-penalty-seam`.

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With A14 (this branch) | `0bd322b99cf89633b7feba8685c9f3320c2ffecb96f4b8b178c1959a53c99677` | 17,728,093 |
| A14 removed (Release 15a as live) | `921f3ac9e5c61bde84068a20dd5cc4ab014367e8b1b7930438cf24b4a7686150` | 17,718,601 |

## Light checks (20 November)

| Check | Result |
|---|---|
| Own harness `qa/net-wound-harness.js` (17 checks, pinned before the first run) | 17/17 on the first run (`qa/run-1.log`) |
| `qa/test-removal.py` | 10/10 (`qa/removal.log`) |
| Own harness on the build with A14 removed (Release 15a as live) | 5/17: the checks that hold without the unit (the penalty, no i without entries or when Healthy, no page errors) (`qa/run-on-a14-removed.log`) |
| The harnesses of the layers it touches (A19, A19.1, A04, Explain This Roll, the wound bar, Quick Access, Clan theming, Phase 4.5.29, Phase 4.5.32, campaign wounds) | 10/10 harnesses, 295/295 (`G1 — Totals and Their Breakdowns/qa/light/a14-touched-run.log`) |
| Phase 4.5.29's harness, conditional on A14, on the build with A14 removed | 45/45 (`G1 — Totals and Their Breakdowns/qa/light/a14-removed-4529-run.log`) |

## Not covered by the harness

- A native iPhone and Safari. In the device round, open the Wounds line's i on a real phone and on the laptop.
