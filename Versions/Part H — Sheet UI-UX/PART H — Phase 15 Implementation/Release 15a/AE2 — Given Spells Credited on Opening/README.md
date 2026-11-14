# Release 15a · AE2 — Given Spells Credited on Opening

The automatic-entries group, unit 2 of 3. The owner's proposal of 11 November 2026 ([G3's owner comments](<../G3 — Spell Rows/OWNER-COMMENTS-2026-11-11.md>), point 2), approved on 13 November 2026 as revision 1 of the mock-up ([the group's mock-ups](<../AE — Automatic Entries/MOCKUP.md>)). Built on 13 November 2026 (Claude), on branch `claude/release-15a-ae2`, stacked on AE1.

**Accepted by the owner at the group's device round, 13 November 2026** ([DEVICE-CHECKS.md](<../AE — Automatic Entries/DEVICE-CHECKS.md>)), as revision 2, after the re-checks R1–R4. Qualified with the group on 13 November 2026 ([handover](<../AE — Automatic Entries/HANDOVER.md>)); not live.

## What changes

- **Opening a character credits its School's given spells.** Whenever a character is opened (a file, or the Characters list), for each Shugenja School on it, the School's own given list is read: Sense, Commune and Summon for most; Fuzake adds Path to Inner Peace; a Yogo Wardmaster's includes Sense with AE1. A held spell, and its scroll, are marked as that School's, exactly as ticking it in the older-holdings review does. A missing one is added with its Spell Scroll, the way the wizard adds it.
- **The character check says what was done.** One note per School, first in the check, for example "Kitsu Shugenja: Sense and Commune marked as your School's spells; Summon added" with "Every Kitsu Shugenja is given these three. Summon was missing, so it was added with its Spell Scroll. This note goes once you save the character."
- **The note stays until the player saves the character themselves**: Save, Save As New or Export JSON. It is kept with the character (`givenSpellsNote`), so closing and reopening shows it again; autosave does not clear it; an exported file never carries it. Reopening never marks or adds the spells twice.
- **The older-holdings review then asks only about the real choices**: for the older Kitsu test character, Water 3, Air 2 and Earth 1, with no "Given by your School" group.
- **Nothing to do, nothing said**: a character whose given spells are already credited (any character made in the wizard), and any character without a Shugenja School, open exactly as before.
- It is part of opening the character, so it is not an undo step, and nothing is written to storage while a character is being opened.

## How it is built

- `src/sheet/209.999999999999999996-feat-given-spells-on-opening.js` — `GS15` and the switch `GIVEN_SPELLS_ON_OPENING_ENABLED`. Wraps `applyData` (after the older-holdings layer's own wrapper), `collectData`, `clearAllRows`, `saveCharacter` and `exportJSON` by name, and puts one rule, `given-spells-credited`, first in the character check. The records are the School-choice layer's own (`SC8.write`, `SC8Logic.addSchool`); a missing spell is added through `CW1122.addSpell`.
- One guarded seam block, `given-spells-on-opening-seam`.
- **A test-only pause, `GS15.paused`**, set by a test page that checks an earlier layer as it works without this unit (see below). Nothing in the sheet sets it.

## Declared conditionals in other layers' tests

Six harnesses build their characters by loading saves of Shugenja and check the review's "Given by your School" group, count spell rows, or compare a reopened save with the saved one. With AE2 those states change, as approved. Each now sets `GS15.paused` when AE2 is in the build, so it keeps checking its own layer as it works without AE2; AE2's own harness checks the combined behaviour. Same ids and counts; without AE2 the line does nothing.

| Harness | Without the pause, on AE2 | With it |
|---|---|---|
| 8b.1-UI-01 `spell-review-harness.js` | 16/32 (the Given group is gone) | 32/32 |
| 8b.1-UI-02 `spell-name-harness.js` | 18/28 | 28/28 |
| 8b.1-UI-03 `spell-remove-harness.js` | 26/34 | 34/34 |
| Older School Choices `older-review-harness.js` | 17/20 | 20/20 |
| Phase 11.2.5 (Part K) `review-regression-harness.js` | 4/6 (Sense, Commune and Summon added to its blank Shugenja: 6 rows for 3, 4 for 1) | 6/6 |
| Clan and School Pickers Follow the Character `cfs-sync-harness.js` | 71/72: `CFS-lion-DATA-INTACT` (its saved Kitsu Shugenja has no spells and reopens with Sense, Commune and Summon); found by the full run on the group's tip | 72/72 |

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With AE2, revision 1 | `ab562fd16ef71d3e3a059771957788b18d6e677acb1c44dbd7ea2034e29e5715` | 17,660,953 |
| AE2 removed (AE1) | `2c21296bf13c44283a4a43393f0512b187752cd7dad62804e2e0c2627139f17a` | 17,651,074 |

## Light checks (13 November)

| Check | Result |
|---|---|
| Own harness `qa/given-spells-harness.js` (16 checks pinned before the first run) | First run 15/16: `GS-REVIEW-CHOICES-ONLY-PHONE` could not click "Review starting spells" on the phone (the floating controls sat over it), a fault in the harness's sequence; it now uses the button's own click. Same ids and count. Then 16/16 |
| Own harness on AE1 (the unit absent) | 0/16: no note appears, and the harness stops there |
| Own harness with AE1 removed (AE2 kept; `4278efd0…cabc`, before the pause was added) | 16/16 |
| `qa/test-removal.py` | 10/10 (again 10/10 on the final build) |
| `feature-dependencies.py` | every reference inside this unit's own blocks |
| The five harnesses above, with the pause | 5/5 harnesses, 120/120 checks |
| The touched layers' own harnesses: saving and opening (the Characters list, Phase 7 save format and Phase 7.1 audit log, Part J), the character check (Phase 5) and casting help (Phase 8), the creation wizard and its five later phases, School choices and Older School Choices, A01, A10.1, 8b.1-UI-01 to UI-03, the app bar, PDF export (seven), Starting Spells Are Scrolls, Spell Names, Gift of the Lady, Kitsune, the overspend and free-choice fixes, Undone Change (log: `AE — Automatic Entries/qa/light/ae2-run.log`) | 40/40 harnesses, 955/955 checks |

## Revision 2 (the device round, 13 November 2026: the owner's option B)

**What the owner found (check 9).** Sense and its scroll removed after the character had been saved; on reopening, the scroll came back alone, with no spell and no note, on iPhone and laptop. Not reproduced in the test browser along the same steps, but one related failure was: with the creation wizard still open, the add went through the wizard's School-choice path and was refused. The add step depended on other layers' state and could fail part-way or quietly.

**The owner's question and decision.** Spells are prayers read from scrolls; a player may lose them for story reasons. The owner chose option B: handle a School's given spells once, on the character's first opening, with the note; a later removal is the player's choice.

**What changes:**

- **Once per School.** After the first opening the School is recorded with the character (`givenSpellsSettled`). A given spell removed after that is not added again.
- **Not listed either.** For a School already done, the character check's starting-spell line no longer lists a removed given spell as "Still to choose … (given by your School)". Both the School-choice layer's line and Phase 11.2.3's read `CW1123.open`, which this unit now filters for those Schools.
- **Both or neither.** A missing spell is added with its scroll or not at all; a scroll added for a spell that could not be learned is taken away again. Nothing is claimed in the note for it, and the School is not recorded as done, so the next opening tries again.
- **Not while another path is open.** Nothing is done while a School-choice window or the creation wizard is open; the next opening does it.
- **In Play too: the cause of check 9.** The owner's screen recording (Edge, the AE2 preview) showed the path: another saved character was opened, then the Kitsu again, from the Characters list, so the sheet was in Play. Phase 12's gate (Part K) stops every event on the Technique picker in Play, so the spell was never learned after its scroll had been added. Reproduced in the test browser exactly so. The unit now lifts that gate for its own add and puts it back at once (`MODES12.mode`); the mode the player sees does not change. The harness's earlier opening paths went through the toolbar's Load, which switches to Manage, and so missed it.

Five checks added, each pinned before its first run (`qa/expected-checks.json`, 16 + 4 + 1 = **21**): `GS-FIRST-OPEN-DONE-PHONE`, `GS-REMOVED-STAYS-REMOVED-PHONE`, `GS-REMOVED-NOT-LISTED-PHONE`, `GS-WIZARD-OPEN-WAITS-DESKTOP`, and, after the recording, `GS-OPENED-IN-PLAY-ADDS-DESKTOP`.

| Build | SHA-256 | Bytes |
|---|---|---|
| With AE2, revision 2 (this branch) | `8eb7aecc7021d260fe24a2dd9897455cc0d85ff3292c040d52923cd0bccbb2ef` | 17,664,331 |
| Revision 2 before the Play fix | `f9b7f7894e3a1d7f115c47ce389fccc8870ad9736c1d5033d301c73c42816b2f` | 17,663,813 |

| Check, revision 2 | Result |
|---|---|
| Own harness (21) | 20/20 on the first run of the four; then 21/21 with the Play fix |
| Own harness on revision 2 before the Play fix | 20/21: `GS-OPENED-IN-PLAY-ADDS-DESKTOP` fails there, with no Summon scroll left behind and no claim in the note (both or neither already held) |
| The owner's steps (scratch `probe9c`) on this build | Sense stays removed, no scroll comes back, no note |
| Own harness on revision 1 | 17/20: the first-opening record, a removed spell staying removed, and the wizard check fail there (the "not listed" check passes trivially on revision 1, which adds the spell back) |
| Own harness with AE1 removed (`1dc59f06…1f04`) | 20/20 |
| `qa/test-removal.py` | 10/10 |
| `feature-dependencies.py` (with both save fields) | every reference inside this unit's own blocks |
| The touched layers' own harnesses, on revision 2 before the Play fix (the Play fix touches only the add) | 42/42 harnesses, 1,043/1,043 checks; the whole candidate list runs again on the group's tip |

See [ROLLBACK.md](ROLLBACK.md).
