# Release 15a · AE3 — No XP Box or Remove on Automatic Entries

The automatic-entries group, unit 3 of 3. The owner's rule of 11 November 2026 ([G3's owner comments](<../G3 — Spell Rows/OWNER-COMMENTS-2026-11-11.md>), point 4), approved on 13 November 2026 as layout A with a fallback on the left ([the group's mock-ups](<../AE — Automatic Entries/MOCKUP.md>)). Built on 13 November 2026 (Claude), on branch `claude/release-15a-ae3` (the group's tip), stacked on AE2.

**Accepted by the owner at the group's device round, 13 November 2026** ([DEVICE-CHECKS.md](<../AE — Automatic Entries/DEVICE-CHECKS.md>)). Qualified with the group on 13 November 2026 ([handover](<../AE — Automatic Entries/HANDOVER.md>)); not live.

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
| With AE3, revision 1, restacked on AE2 revision 2 (this branch, the group's tip) | `99b76d625c04e6aa22ba8508005975525bbece945b82ead8c443b593e58115b8` | 17,675,311 |
| Revision 1 on AE2 revision 1 | `3217c5518edf018783507c52569580d005760d37ea16e99300de65073ae49b12` | 17,671,933 |
| Revision 0 (before the code review) | `1ca9277d82ffd7c39d0d6561b4d20e75c04929603e936e5c80b8cf9b86096762` | 17,671,502 |
| AE3 removed (AE2 revision 2) | `8eb7aecc7021d260fe24a2dd9897455cc0d85ff3292c040d52923cd0bccbb2ef` | 17,664,331 |

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

## Revision 1 (the group's code review, 13 November 2026)

The review found that the unit re-measured the Technique cards whenever the body's classes changed. A10.1 adds its keyboard mark on navigation keys and takes it away on taps, and other layers change the body's classes too, so every such tap or key cost a forced layout per Technique card: harmless at normal speed, wasted under the 4× CPU screen. The observer now acts only when the mode changes (Manage or Play); cards changing, a name edited, the window resized and the list's own size are watched as before. One check added and pinned before its first run (`qa/expected-checks.json`, 19 + 1 = **20**):

- `AX-TAPS-DO-NOT-REMEASURE-PHONE`: four taps and Tab presses cause no sweep; switching to Play still does.

| Check, revision 1 | Result |
|---|---|
| Own harness (20) | 20/20 |
| Own harness on revision 0 | 19/20: `AX-TAPS-DO-NOT-REMEASURE-PHONE` fails there with four sweeps for four taps, which confirms the finding |
| Own harness with AE2 removed (`899315f5…dc05`) | 20/20 |
| `qa/test-removal.py` | 10/10 |
| `feature-dependencies.py` | every reference inside this unit's own blocks |
| The touched layers' harnesses: 8b.1-UI-01 to UI-03, A01, A10.1, Phase 12 and 12.1 to 12.8 (Part K) | 14/14 harnesses, 550/550 checks |

## Restacked on AE2 revision 2 (13 November 2026)

No change to this unit. Its branch was rebased onto AE2 revision 2 and each commit rebuilt; the remover's and removal proof's predecessor is now AE2 revision 2 (constants only). On the new tip: own harness 20/20, 20/20 with AE2 removed (`899315f5…dc05`, unchanged), `qa/test-removal.py` 10/10, AE1 13/13 and AE2 21/21.

See [ROLLBACK.md](ROLLBACK.md).
