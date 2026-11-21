# Release 15b · B04 — One Armor TN Breakdown

Group 1 (totals and their breakdowns), unit 2.

- **The finding:** the audit's B04, "Avoid repeating Blind under Armor TN" (FT-20; Q8).
- **The owner's approval:** approved as shown on 20 November 2026 ("Other than the points raised above I am happy with the mock ups"). See [MOCKUP.md](<../G1 — Totals and Their Breakdowns/MOCKUP.md>).
- **Built:** 20 November 2026 (Claude), on branch `claude/release-15b-b04`, stacked on `claude/release-15b-a14`.

## What changes

- **Quick Access** shows "Armor TN 7" with an i. Blind's line under it ("Blind: Reflexes 2 + 5 = 7", Feature 4.5.34 (Part I)) is hidden there.
- **The i opens a window** titled "Armor TN", subtitled "7 to be hit", with one breakdown:
  - **the base:** with Blind, "Base: Blind, Reflexes 2 + 5" and the note "Blind: Reflexes + 5 instead of Reflexes × 5 + 5, Core Rulebook p.156"; otherwise "Base: Reflexes 2 × 5 + 5", with a note when Weakness lowers Reflexes;
  - **the Armor TN Bonus**, with the armour's name when it has one;
  - **each other bonus in effect**, by name: the stance, a Void Point spent this round, two weapons (Insight Rank), Way of the Dragon (School Rank), and Shiba's gift (Intelligence, Core Rulebook p.243);
  - **"Other bonuses"**, only if the sheet's figure includes something none of those account for, so the rows always add up;
  - **the Armor TN.**
- **The Combat card's formula i ("TN & Initiative")** shows the same table, with its formula text kept underneath.
- **Unchanged:**
  - every number;
  - the Combat card's Blind line under Base TN (the owner's call of 9 October);
  - print (the i is print-hidden; Blind's Quick Access line is hidden on screen only);
  - the save file.

Screen only. No figure is worked out here: the base and the Armor TN are the sheet's own fields, and each bonus is the sheet's own function.

## How it is built

- `src/sheet/209.9999999999999999994-feat-armor-tn-breakdown.js` holds `AT15` and the switch `ARMOR_TN_BREAKDOWN_ENABLED`, and marks the page with `body.at15-on`. It wraps two trunk functions, each calling the one it replaced first:
  - `showCombatFormulaInfo` adds the table above the formula, for `'tn'` only;
  - `renderQuickAccessPanel` puts the i back after Quick Access rewrites the Armor TN.
- **The i** is a `.sk-info-btn` with no text of its own, like A14's.
- `src/css/1151-armor-tn-breakdown.css`: the i's spacing and fallback letter, the table, and `#qaArmorTNValue + #bl4534QaNote` hidden, all under `body.at15-on`.
- **One guarded seam block:** `armor-tn-breakdown-seam`.

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With B04 (this branch, on A14) | `56f51ab38339f13e8f64bc417ec3bef0b6c768bbfd226194943ab64800e5d156` | 17,737,482 |
| B04 removed (A14) | `0bd322b99cf89633b7feba8685c9f3320c2ffecb96f4b8b178c1959a53c99677` | 17,728,093 |
| A14 removed, B04 kept | `560e1789472d180468899e81d0f8e569aac7cd38e5034b31bf3893f83230c5b0` | 17,727,990 |

## Light checks (20–21 November)

| Check | Result |
|---|---|
| Own harness `qa/armor-tn-harness.js` (12 checks, pinned before the first run) | Run 1: 11/12 (`qa/run-1.log`). `AT-SIGHTED-ARMOR-AND-STANCE-PHONE` failed in the harness itself: it looked for the Defense tile by the tile's whole text, which starts with its icon, and found nothing. The lookup now reads the tile's name (`.stance-name`); no expectation changed. Run 2: 12/12 (`qa/run-2-stance-name.log`). |
| `qa/test-removal.py` | 10/10 (`qa/removal.log`) |
| The harnesses of the layers it touches (Quick Access, the Combat tab, A04, A04.1, A15, A16, Phase 4.5.4, the reference windows of Phases 4.5.13 to 4.5.24, Ancestors and their corrections, Checks and Conditions, Blind's note, Weakness) | 22/22 harnesses, 1,698/1,698 (`G1 — Totals and Their Breakdowns/qa/light/b04-touched-run.log`) |

## Not covered by the harness

- A native iPhone and Safari. In the device round, open Quick Access's Armor TN i and the Combat card's formula i on a real phone and on the laptop.
- Two weapons, Way of the Dragon, a Void Point and Shiba's gift are named from the sheet's own functions. The harness proves the rows add up with a stance and armour, not each of those rows.
