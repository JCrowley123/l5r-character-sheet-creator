# Release 15b group 1 · read-only code review of the group's diff

21 November 2026 (Claude), in this session, before the owner's device round, as the 6 November amendment asks.

**Scope:** the diff from `claude/release-15b-kickoff` (`2e0740ba`, Release 15a as live) to `claude/release-15b-b17` in the Phase 0 sources and the manifest. That is:
- the four scripts and three stylesheets (B14 has none);
- the four seam blocks;
- the four older harnesses made to follow a switch.

Each finding below was checked against the code and, where it says so, in the browser.

## Changed during the review

| # | Unit | Finding | Outcome |
|---|---|---|---|
| 0 | B17 | **Found by the "15a removed, group kept" check, not by reading; recorded here with the review's changes.** With all of Release 15a removed, B17's harness was 10/13. Without A04's ring, the sheet's phone rule gives every `.sk-info-btn` a 40 px minimum, so the i stood 6 px off the badge's line. | **Fixed:** the i is 28 px with an 8 px touch reach under `body.kt15-on`, the same as A04 draws it. Build `5ac767c6…574d`. On it: B17 13/13 with and without 15a, removal 10/10, dependencies clean, touched layers re-run (1,002/1,002). The run that found it is kept in `light/own-on-15a-removed-ca319f80/`. |

## Low, left as they are (for the record)

| # | Unit | Finding | Why it stays |
|---|---|---|---|
| 1 | A14 | The i shows only while an entry changes the **current** level's penalty. With Low Pain Threshold at Healthy (no penalty) there is no i, and a tap on another level still opens that level's own sums. | As approved: "with an i when an entry changes the penalty". Every level's window carries its own table. |
| 2 | A14 | The i finds the current level from the bar's current segment (`title` = the level's name), rather than working the level out again. | Deliberate. Phase 4.5.29's contract is that layers never do wound arithmetic, and the bar is the track's own answer. |
| 3 | B04 | "Other bonuses" appears only if something outside the named functions changes `#f_currentTN`. Today only the core and Blind's adapter (which moves the base and the figure together) write it, so the row never shows. | It keeps the table adding up if a later layer adds a bonus without naming it. |
| 4 | B04 | With Weakness and Blind together, the base row names Blind with the Reflexes that `getTraitValueByName` gives, the same figure Blind's own note uses. | It agrees with the line the Combat card keeps. |
| 5 | B17 | **Print:** the summary line is hidden on screen only, so paper shows it and the badge's new words ("Aiko · Rank 3"). | B12 (print) is a later 15b group, and paper loses nothing. |
| 6 | B17 | **Focus:** Reset session redraws the row (the trunk rebuilds it on every recalc), so focus does not stay on the button after a keyboard press. | As before B17. Phase 4.5 rebuilds every configured row the same way. |
| 7 | All | The seam blocks expose `WP15`, `AT15`, `JK15` and `KT15` to tests only. | As the pattern. |

## Checked and fine

- **Removal:** each unit's remover strips its fragments, manifest entries and block, and the rebuild is byte-identical to its predecessor (10/10 each). Each predecessor removed with the unit kept also verifies.
- **The whole of Release 15a** (26 units) comes off with the group kept: the rebuild verifies, and all four harnesses pass on it.
- **Dependencies:** every reference to each unit's surface is inside its own blocks (4/4). The older releases each unit reads are declared both ways:
  - A14 reads Phase 4.5.29 (`WND4529`);
  - B04 reads Feature 4.5.34 (`BL4534`), Feature 4.5.36 (`weakness4536Reflexes`) and Phase 4.8 (`ancestorArmorTNBonus`);
  - B14 reads Feature 4.5.24 (`TR4524`);
  - B17 reads Phase 4.5 (by names its remover does not own).
  - A scan of every older remover's surface against the names the group reads found only those five.
- **Nothing saved:** no unit adds a save field, a storage key or a History entry. B14 changes words only. A14 and B04 change no figure. B17 changes no use, cost or configuration (Reset session and Change are the trunk's).
- **Switches:** with any one off, nothing is wrapped or drawn, and the screen is as before.
- **Wrappers:** each wrapper calls the function it replaced first and catches its own errors. An error in a unit can never stop the track, Quick Access, a roll or an Advantage row from drawing.
- **Accessibility:**
  - Every new i has a spoken name and no title, so Phase 4.54 adds no i of its own.
  - Every window table has a spoken name.
  - B17's buttons have spoken names that say what they do, and its pips keep their spoken count.
  - All new i's are print-hidden.
- **The four older harnesses** read the unit's seam and change only the declared checks. Each passes with its unit present and removed: 4.5.29 45/45, 4.5.24 50/50, and 4.5 (two harnesses) 99/99.
