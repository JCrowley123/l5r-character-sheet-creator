# Release 15a · AE1 — Sense for the Yogo Wardmaster

The automatic-entries group, unit 1 of 3. From the owner's rule of 11 November 2026 and the book check of all 21 Shugenja Schools the same day ([G3's owner comments](<../G3 — Spell Rows/OWNER-COMMENTS-2026-11-11.md>)). Approved as mocked up by the owner on 13 November 2026 ([the group's mock-ups](<../AE — Automatic Entries/MOCKUP.md>)). Built on 13 November 2026 (Claude), on branch `claude/release-15a-ae1`, stacked on the group's records branch `claude/release-15a-ae` (from `main` at G4 as live).

Not yet device-checked, qualified or live.

## What changes

- **A Yogo Wardmaster is given Sense, Commune and Summon**, as The Great Clans p.229 reads. The creation wizard now adds Sense with its scroll, and the Spells step reads "starts with Sense, Commune, Summon, 3 Ward spells, 3 other spells that are not Void spells (The Great Clans p.229)". The Ward and other-spell boxes are unchanged.
- **A Yogo Wardmaster made before this unit** has no Sense; the character check's starting-spell line now lists "Sense (given by your School)". (With AE2 as well, Sense is added when the character is opened.)
- **Five Schools show their book page** instead of "page not yet recorded": Fuzake Shugenja, Secrets of the Empire p.238; Horiuchi Shugenja, The Great Clans p.257–258; Ninube Shugenja, The Great Clans p.281; Yogo Wardmaster, The Great Clans p.229; Yoritomo Shugenja, The Great Clans p.169. Printed pages, read from the owner's PDFs on 13 November 2026.

## How it is built

- `src/sheet/209.999999999999999995-feat-yogo-given-spells.js` — `YG15` and the switch `YOGO_GIVEN_SPELLS_ENABLED`. As the sheet loads it sets, by property, Yogo's `given` and `text` and the five `source` strings in Phase 11.2.4's table (`CW1124.table`). The wizard's own file is not changed, and nothing else in any School's entry is touched.
- One guarded seam block, `yogo-given-spells-seam`.
- A declared conditional in Phase 11.2.4's harness (see ROLLBACK).

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With AE1 (this branch) | `2c21296bf13c44283a4a43393f0512b187752cd7dad62804e2e0c2627139f17a` | 17,651,074 |
| AE1 removed (A17, G4 as live) | `fa634abbf96a0f47b8668245c13f0d33142c931438bc1c9d8c22c624ce4e00cb` | 17,648,272 |

## Light checks (13 November)

| Check | Result |
|---|---|
| Own harness `qa/yogo-given-spells-harness.js` (13 checks pinned before the first run) | 13/13, first run |
| Own harness on G4 as live (the unit absent) | 5/13: the eight that fail are the unit's changes (the seam, Yogo's line, the five pages, the wizard adding and showing Sense, the check asking for it) |
| `qa/test-removal.py` | 10/10 |
| `feature-dependencies.py` | every reference inside this unit's own blocks |
| Phase 11.2.4's harness, with its declared conditional | 71/71 on this build and 71/71 on G4 as live. Before the conditional it gave 66/71 here: the five Schools' walks through the wizard read the new pages, which was expected |
| The touched layers' own harnesses: the creation wizard and its five later phases (11.2 to 11.2.6, Part K), School choices from the character check, Older School Choices (three), Starting Spells Are Scrolls, Kitsune Shugenja, Spell Names Match the Books (two), Gift of the Lady (two), 8b.1-UI-01 to UI-03 (log: `AE — Automatic Entries/qa/light/ae1-run.log`) | 20/20 harnesses, 496/496 checks |

See [ROLLBACK.md](ROLLBACK.md).
