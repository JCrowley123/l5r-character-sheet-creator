# Release 15b · B01 — Check Buttons Named for What They Do

Group 2 (action labels and wording), unit 1.

- **Where it came from:** FT-11 in the Phase 15 audit. The words are Q8's, accepted by the owner on 1 November 2026.
- **Approved:** 24 November 2026, round 1: "Approve as recommended" (B01 as shown).
- **Records:** see [MOCKUP.md](<../G2 — Action Labels and Wording/MOCKUP.md>) and the board, https://claude.ai/artifact/REUwrJoboaHe6xQBuGDDy2.
- **Built:** 24 November 2026 (Claude), on branch `claude/release-15b-b01`, stacked on `claude/release-15b-g2` (`main` at `acdb6f75`, group 1 live, plus group 2's records).

## What changes

Seven Disadvantage rows of Feature 4.5.31 (Part I) name their button for what it does. The TN stays in the label, as Epilepsy's "Avoid (TN 15)" already shows it.

| Entry | Today | With B01 |
|---|---|---|
| Brash (Core p.157) | Check (TN 25) | Resist insult (TN 25) |
| Overconfident (Core p.161) | Check (TN 20) | Measure the enemy (TN 20) |
| Can't Lie (Core p.157) | Check (TN 20) | Discretion check (TN 20) |
| Contrary (Core p.158) | Check | Cooperate (after its TN box) |
| Rumormonger (Core p.161) | Check (TN 5 × Glory) | Resist gossip (TN 5 × Glory) (after its Glory Rank box) |
| Soft-Hearted (Core p.162) | Check (TN 20) | Resolve check (TN 20) |
| Lost Love (Core p.160) | Spend a Void Point | Steady yourself — Spend Void |

**Spoken names** start with the button's words, then the entry, the Trait and when it is rolled. For example, "Resist insult (TN 25): Brash, Willpower roll when threatened or insulted", and "Steady yourself — Spend Void: Lost Love, a Void Point sets the memory aside". Before B01, none of the six check buttons' spoken names contained the button's word.

**On a phone,** Soft-Hearted's "Wracked with guilt" switch moves under its button (the row grows from 30 to 58 px). Every other row keeps its height.

**Lost Love's "Spend Void"** is B18's suggestion for its job group G07 (spending a Void Point). B18's answers were still open on 24 November. If B18 rules another word, B18's own build changes it.

**Unchanged:**
- the rolls, their titles, TNs and result lines;
- the Void Point spent and the "Reminded of your loss" switch it clears;
- the TN and Glory Rank boxes, and the switches;
- Epilepsy's "Avoid (TN 15)" and "End seizure (TN 10)", and Lord Moon's Curse's "Resist Lord Moon (TN 20)";
- the save file.

## How it is built

- `src/sheet/209.9999999999999999997-feat-check-button-names.js` holds `CN15` and the switch `CHECK_BUTTON_NAMES_ENABLED`. It wraps two of Feature 4.5.31's functions:
  - `CHK4531.checkButton`: for the six keys it names, it sets the button's words and spoken name after the button is made.
  - `CHK4531.button`: only for Lost Love's exact text and spoken name, it passes B01's words instead.
- Both wrappers are installed when the page loads, before any row is drawn, so every row is built with B01's words. A row is never redrawn by B01 itself.
- **One guarded seam block:** `check-button-names-seam`.
- No stylesheet, no class, no save field.

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With B01 (this branch, on group 1 as live) | `c97e39f1e500b712a31dc4fc6b33b09b9e4a7996cf04dd7edfc38b2d065f1d22` | 17,755,128 |
| B01 removed (group 1 as live, B17 on B14) | `5ac767c6c3680126cfe664aef41e7312d98f24eee842ec679e38ed664dde574d` | 17,750,809 |

## Light checks (24 November)

| Check | Result |
|---|---|
| Own harness `qa/check-names-harness.js` (15 checks, pinned before the first run) | Run 1: 11/15 (`qa/run-1.log`). The harness closed the first roll window with Escape, which left the window over the next button, so four taps timed out. The unit was right: the labels, spoken names and Brash's roll had passed. The harness now closes each roll window with its own button; no expectation changed. Run 2: 15/15 (`qa/run-2-close-button.log`). |
| `qa/test-removal.py` | 10/10 (`qa/removal.log`) |
| The dependency check (`G2 — Action Labels and Wording/qa/dependencies.py B01`) | 1/1: every reference inside B01's own blocks (`G2 — Action Labels and Wording/qa/dependencies-b01.log`) |
| The harnesses of the layers it touches, first run (before 4.5.31's harness followed B01) | 13/14 harnesses, 962/971. Only Feature 4.5.31's own harness failed, on the seven words B01 changes (`G2 — Action Labels and Wording/qa/light/b01-touched-first-run.log`). |
| The same, with 4.5.31's harness following B01 (Feature 4.5.31, 4.5.32, 4.5.10, 4.5.15, Phase 4.5, 4.5.2, 4.5.4, Phase 14 Search, Phase 14.1 and its dependency harness, Phase 12.5's Play Advantages, Quick Access, A04, A16) | 14/14 harnesses, 992/992 (`G2 — Action Labels and Wording/qa/light/b01-touched-run.log`) |
| Feature 4.5.31's harness on the build with B01 removed (`5ac767c6…574d`, made by `G2 — Action Labels and Wording/qa/removed-build.py`) | 1/1 harness, 101/101, the same count as with B01 (`G2 — Action Labels and Wording/qa/light/b01-removed-4531-run.log`) |

## Not covered by the harness

- A native iPhone and Safari, and VoiceOver reading the spoken names. In the device round, open the seven entries on a real phone, read the buttons, and tap two of them.
- Feature 4.5.32's and Phase 14's device-walk scripts (not in the suite) still press the old words; see ROLLBACK.md.
