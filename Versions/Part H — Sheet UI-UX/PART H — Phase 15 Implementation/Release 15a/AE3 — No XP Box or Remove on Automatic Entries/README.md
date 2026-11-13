# Release 15a · AE3 — No XP Box or Remove on Automatic Entries

The automatic-entries group, unit 3 of 3. The owner's rule of 11 November 2026 ([G3's owner comments](<../G3 — Spell Rows/OWNER-COMMENTS-2026-11-11.md>), point 4), approved on 13 November 2026 as layout A with a fallback on the left ([the group's mock-ups](<../AE — Automatic Entries/MOCKUP.md>)). Built on 13 November 2026 (Claude), on branch `claude/release-15a-ae3` (the group's tip), stacked on AE2.

Not yet device-checked, qualified or live.

## What changes

- **School, Path and Advanced School Techniques have no XP box and no ×.** The sheet adds them at 0 XP and takes them back itself when their School, Path or Rank goes, so neither control meant anything; the × misled, because the Technique came back the next time the School's Techniques were applied. A quiet tag, "School technique", "Path technique" or "Advanced School technique", in the look of the spells' "School spell" tag, says why.
- **Layout A: the tag sits on the name's line**, where the XP box and × were, in Manage and in Play.
- **The fallback, on the left.** On a card whose name would be cut beside the tag (31 of the sheet's 631 such names on a 390 px phone, 16 on a 430 px phone, none on a laptop), the name takes the whole line and the tag starts the next line on the left, under the start of the name. Checked when the cards change, when a name is edited, when the window is resized and when the mode changes.
- **A School's given spells have no ×** while that School is on the character, and their name box takes back the corner the × kept clear, as it already did in Play.
- **Everything the player chose keeps both:** Kata and Kiho (bought or free), chosen School spells, reward spells, a Technique typed in by hand, and any School Technique with an XP figure other than 0.
- **Nothing is written.** The XP box is hidden, not removed; every save is exactly as before. Print is unchanged.

## How it is built

- `src/sheet/209.999999999999999997-feat-automatic-entry-controls.js` — `AX15` and the switch `AUTOMATIC_ENTRY_CONTROLS_ENABLED`. Sets `ax15-on`; marks each automatic card `ax15-auto` with `data-ax15` (`school`, `path`, `advanced` or `given`), adds a `span.ax15-tag` to a Technique card's top line, and `ax15-wrap` where its name would not fit. A card counts only when the sheet labelled it ("[School Technique — Rank N, School]" or "[Advanced School Technique — …]") and that School is on the character (the Schools list, the current School, a held Advanced School); "Path technique" when the Path taken at that Rank gives it (`pathAtRank`). A spell counts when its School record names a School on the character whose given list includes it.
- `src/css/1146-automatic-entry-controls.css` — the hidden controls, the corner given back, the tag and the fallback. Screen only; each rule outranks 8b.1-UI-03's corner rules.
- One guarded seam block, `automatic-entry-controls-seam`.

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With AE3 (this branch, the group's tip) | `1ca9277d82ffd7c39d0d6561b4d20e75c04929603e936e5c80b8cf9b86096762` | 17,671,502 |
| AE3 removed (AE2) | `ab562fd16ef71d3e3a059771957788b18d6e677acb1c44dbd7ea2034e29e5715` | 17,660,953 |

## Light checks (13 November)

| Check | Result |
|---|---|
| Own harness `qa/automatic-entry-controls-harness.js` (19 checks pinned before the first run) | First run stopped in its own setup: on the dense character AE2 had already credited every spell, so the only School-choice button was "Choose starting spells" and the harness looked for a review's Confirm. It now opens only a "Review starting spells" button. Same ids and count. Then 19/19 |
| Own harness on AE2 (the unit absent) | 6/19: the six that pass hold either way (a Kiho keeps both controls, a hand-typed Technique keeps both, the save is unchanged, the class taken away, no page errors) |
| Own harness with AE2 removed (AE3 kept; `293237ed…8bb4`), the given spells then credited through the review | 19/19 |
| `qa/test-removal.py` | 10/10 |
| `feature-dependencies.py` (with its classes) | every reference inside this unit's own blocks |
| Every harness in G4's candidate list (198), on this build | 196/198 harnesses, 7,315/7,326 checks. The two that failed were the approved changes: 8b.1-UI-03's harness drives the × on Sense, a given spell (24/34), and the Clan and School picker harness reopens a saved Kitsu Shugenja that AE2 completes (71/72). With their declared conditionals both pass on this build, on AE2 and on G4 as live (34/34, 72/72), so the whole list passes here. Log: `AE — Automatic Entries/qa/light/ae3-all-run.log` |

## A declared conditional in another layer's test

8b.1-UI-03's `spell-remove-harness.js` checks the × in its clear corner on spell rows, Sense among them. When AE3 is in the build, the harness takes AE3's body class (`ax15-on`) away for its page, so it keeps checking its own corner as it works without AE3; AE3's own harness checks the combined behaviour. Same ids and count; without AE3 the line does nothing.

Not covered by the harness: a real Advanced School and a real Alternate Path. No test character holds either; the harness checks the label with the sheet's own Advanced School label written on a card, and the Path tag by recording a Path at Rank 1 on the test character. The device round should look at one character with each if the owner has one.

See [ROLLBACK.md](ROLLBACK.md).
