# Release 15a · A12 — One Resisting Line

**Withdrawn, 18 November 2026 (the owner).** Device round: revise. The owner then chose to replace this unit with an effect-first resistance design and, on 18 November, moved that work out of Release 15a into a phase of its own after Phase 15. This unit never goes live; G5 goes on as A08 alone. The build and records below are kept on this branch for the resistance phase. See the group's [README](<../G5 — Undo and the Roll Preview/README.md>).

Group G5 (undo and the roll preview), unit 2 of 2. R6, the owner's ruling of 7 October 2026 (one closed "Resisting?" line), approved as mocked up on 14 November 2026 with the owner's instruction to ring-fence it with extra care ([the group's mock-ups](<../G5 — Undo and the Roll Preview/MOCKUP.md>)). The mock-up board called it "A12 — One Resisting? Line"; the folder drops the question mark, which a Windows folder name cannot hold. Built on 14 November 2026 (Claude), on branch `claude/release-15a-a12`, stacked on A08.

## What changes

- **One closed line for the resistance choices.** In the roll preview's "Declare for this roll", the resistance choices sit in one native disclosure at the top of the section, closed whenever a preview opens: "Resisting?" with "5 options" (or however many the character has) on the right.
- **Opened, the same choices as before**: the registry's own labelled checkboxes and notes, Honour's first, each under its source. The line stays open while choices are ticked (the preview redraws on every tick).
- **A ticked choice is never hidden**: closed, the line reads "1 chosen" and names each ticked choice with its bonus ("Honour +4", "Balance +1k0").
- **The fifteen choices it gathers** (a character sees only those it has): Honour's resistance (Core Rulebook p.91); Balance, Clear Thinker, Heartless, Irreproachable; Seven Fortunes' Blessing (Jurojin, Hotei); Touch of the Spirit Realms (Meido, Tengoku); the Ancestor gifts of Kaimetsu-Uo, Moto, Togashi Yamatsu, Matsu Hitomi and Usagi Reichin (two). **Every other choice stays where it is.**
- **Unchanged:** every bonus and total, Balance including Honour once, Usagi Reichin's "in place of" pair, the choices cleared for every roll, nothing saved.

## How it is built (ring-fenced)

- `src/sheet/209.999999999999999999-feat-resisting-line.js` — `RS15` and the switch `RESISTING_LINE_ENABLED`. It rebinds one name, the roll preview's optional hook `rd4515PreviewHtml`, and rearranges the markup the registry has already made: the resistance choices' own `label` and note elements move, unchanged, into `details.rs15-line`; source headings left empty go. It reads the registry (`offered`, `armed`) for the count and the names; it never arms, clears or recomputes a choice. The checkboxes are the registry's own, so the preview's own listeners tick them.
- **Fails open.** No resistance choice on a roll, markup it does not recognise (more than one block, a choice not where the registry puts it), or any error: the registry's markup is returned unchanged.
- **One open state, for one preview.** A capture-phase `toggle` listener notes whether the line is open; a new roll (a new roll context) starts closed. Nothing is stored.
- `RS15.paused` is for tests only: while set, the registry's markup is shown unchanged, so a harness can compare the same preview with and without the unit.
- `src/css/1147-resisting-line.css` — the line's look, its own classes only (a bordered row like the Combat sections' disclosures, a turning triangle, the count on the right).
- One guarded seam block, `resisting-line-seam`.

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With A12 (this branch, the group's tip) | `f76786334a9c51da07f8bd6283bc6eb784f479e6cf79286cdc290f72e093bc41` | 17,696,074 |
| A12 removed (A08) | `6d47849b1dcb5aa8ac4140b1895d1f0d713426092530e183ff87c3fc4d7c44b1` | 17,685,928 |
| A08 removed, A12 kept | `c89a4131155819bbcf17c84e3337407cf99a7c90a986f1249675fc1abb842b49` | 17,685,457 |

## Light checks (14 November)

| Check | Result |
|---|---|
| Own harness `qa/resisting-line-harness.js` (18 checks pinned before the first run) | First run 16/18: the harness's own "drawn" test counted the choices inside the closed line as drawn, because Chromium 153 keeps boxes for a closed `<details>`'s content (it skips painting it through `content-visibility`). The test now also asks the browser's `checkVisibility()`, which is stricter; same ids and count. Then 18/18 |
| Own harness on A08 (the unit absent) | 4/18: the four that hold either way (the choices drawn are the registry's, a roll with no resistance choice is the registry's markup, no page errors at either size). The first run on A08 stopped at an unguarded "unpause" between checks; guarded, same ids and count |
| Own harness with A08 removed, A12 kept (`c89a4131…2b49`) | 18/18 |
| `qa/test-removal.py` | 10/10 |
| `feature-dependencies.py` (with its classes and its stylesheet's name) | every reference inside this unit's own blocks |
| Every harness in the automatic-entries group's candidate list (201), on this build | 197/201 harnesses first. The four that failed tick a resistance choice through the page, and it is now inside the closed line: Seven Fortunes' Blessing (Jurojin), Touch of the Spirit Realms (Tengoku), the situational entries (Balance) and Honour's resistance (its harness waited for Honour's box to be drawn). With their declared conditionals (below) all four pass on this build, on A08 and on AE3 as live, with the counts the automatic-entries group recorded (77, 50, 117, 20), so the whole list passes here: 201/201, 7,380/7,380. Logs: `G5 — Undo and the Roll Preview/qa/light/a12-tip-all-run.log`, `a12-conditionals-run.log` |

## Declared conditionals in other layers' tests

Four harnesses tick a resistance choice through the page, which A12 now keeps inside the closed line. When A12 is in the build, each pauses it for its page (`RS15.paused`, a line right after the page loads), so it keeps checking its own layer's markup as it works without A12; A12's own harness checks the two together, including all fifteen choices gathered. Same ids and counts; without A12 the line does nothing.

- `PART I — Phase 4.5.21 Seven Fortunes Blessing/qa/fortune-blessing-harness.js` (77)
- `PART I — Phase 4.5.24 Touch of the Spirit Realms/qa/spirit-realms-harness.js` (50)
- `PART I — Phase 4.5.27 Situational Roll Entries/qa/situational-entries-harness.js` (117)
- `BUGFIX — Honour Resistance Bonus/qa/honour-harness.js` (20)

## Not covered by the harness

- A native iPhone and Safari: the harness uses Chromium's touch emulation. The device round should open a roll for a character with resistance Advantages, open and close the line, tick a choice inside it and see it named when closed, and roll.
- A real character with a Blessing, a Spirit Realm or an Ancestor resistance gift: the harness stands in for those providers on one page. The device round can use one if the owner has one.

**Ring-fence checks in the harness.** With the unit paused on the same open preview, "Declare for this roll" is the registry's own markup (`RS-PAUSED-IS-REGISTRY-MARKUP-PHONE`), and everything outside it, the dice, the modifiers (Honour's +4 among them) and the Roll button, reads exactly as with the unit on (`RS-SAME-ROLL-ON-AND-PAUSED-PHONE`). The choices drawn are the registry's, label for label and note for note (`RS-SAME-CHOICES-AS-REGISTRY-PHONE`). A roll with no resistance choice gets the registry's markup unchanged (`RS-NO-RESIST-NO-LINE-PHONE`). Nothing reaches the save or storage (`RS-NOTHING-SAVED-PHONE`).
