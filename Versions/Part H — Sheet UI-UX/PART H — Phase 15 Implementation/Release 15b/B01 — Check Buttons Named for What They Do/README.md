# Release 15b · B01 — Check Buttons Named for What They Do

Group 2 (action labels and wording), unit 1.

- **Where it came from:** FT-11 in the Phase 15 audit. The words are Q8's, accepted by the owner on 1 November 2026.
- **Approved:** 24 November 2026, round 1: "Approve as recommended" (B01 as shown).
- **Records:** see [MOCKUP.md](<../G2 — Action Labels and Wording/MOCKUP.md>) and the board, https://claude.ai/artifact/REUwrJoboaHe6xQBuGDDy2.
- **Built:** 24 November 2026 (Claude), on branch `claude/release-15b-b01`, stacked on `claude/release-15b-g2` (`main` at `acdb6f75`, group 1 live, plus group 2's records).
- **Round 2:** after the device round (the owner's comments 2, 5 and 8), approved 24 November 2026: "Approve as shown". Rebuilt the same day on the tip branch `claude/release-15b-b09` only; `claude/release-15b-b01` keeps round 1.

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
- the rolls, their titles, TNs and pass lines;
- the Void Point spent and the "Reminded of your loss" switch it clears;
- the TN and Glory Rank boxes, and the switches;
- Epilepsy's "Avoid (TN 15)" and "End seizure (TN 10)", and Lord Moon's Curse's "Resist Lord Moon (TN 20)" (its words);
- the save file.

### Round 2 (approved as shown, 24 November 2026)

- **Lord Moon's "Resist Lord Moon (TN 20)"** takes the check buttons' size: 20 px tall, type at 0.78 rem, padding 3 × 8 px. Release 15a A07 had made it 44 px.
- **Touch of the Void's button** (Feature 4.5.33, Part I) loses its black fill, taking the check buttons' outlined look, and is renamed:

  | Today | With round 2 |
  |---|---|
  | Willpower (TN 30) | Keep control (TN 30) |

  Its spoken name is "Keep control (TN 30): Touch of the Void, Willpower roll after you spend a Void Point". This answers B18's G11 question for this button.
- **Ten failure lines lose their "Tell the GM …" sentence** (the owner's comment 8):

  | Line | Today | With round 2 |
  |---|---|---|
  | Brash | You attack (or challenge) the one who provoked you, at once. Tell the GM: the sheet does not act for you. | You attack (or challenge) the one who provoked you, at once. |
  | Can't Lie | You must correct the lie. Tell the GM: the sheet does not act for you. | You must correct the lie. |
  | Contrary | You must argue your side of the dispute. Tell the GM: the sheet does not act for you. | You must argue your side of the dispute. |
  | Epilepsy | You have a seizure. Tell the GM: the sheet does not act for you. Each round, the End seizure button rolls to end it. | You have a seizure. Each round, the End seizure button rolls to end it. |
  | Overconfident | You do not see it, and press on. Tell the GM: the sheet does not act for you. | You do not see it, and press on. |
  | Rumormonger | You pass the rumor on. Tell the GM: the sheet does not act for you. | You pass the rumor on. |
  | Soft-Hearted | You cannot bring yourself to kill. Tell the GM: the sheet does not act for you. | You cannot bring yourself to kill. |
  | Touch of the Void | You are Dazed for one Round. Tell the GM: the sheet does not track Dazed. | You are Dazed for one Round. |
  | Cursed by the Realm (Toshigoku) | You are overcome by the urge to fight. Tell the GM — this sheet does not act for you. | You are overcome by the urge to fight. |
  | Elemental Imbalance (the message after a failed check) | You failed the Elemental Imbalance Willpower check. Tell the GM; the consequences are determined by the GM. Your Spell Casting Roll still proceeds. | You failed the Elemental Imbalance Willpower check: the GM decides what happens. Your Spell Casting Roll still proceeds. |

  Elemental Imbalance keeps "the GM decides what happens", because the rule leaves the outcome to the GM.

## How it is built

- `src/sheet/209.9999999999999999997-feat-check-button-names.js` holds `CN15` and the switch `CHECK_BUTTON_NAMES_ENABLED`. It wraps two of Feature 4.5.31's functions:
  - `CHK4531.checkButton`: for the six keys it names, it sets the button's words and spoken name after the button is made.
  - `CHK4531.button`: only for Lost Love's exact text and spoken name, it passes B01's words instead.
- Both wrappers are installed when the page loads, before any row is drawn, so every row is built with B01's words. A row is never redrawn by B01 itself.
- **Round 2,** installed at the same moment. Each line is replaced only where its exact old words are found; anything else goes through unchanged.
  - **Feature 4.5.31's seven failure lines** are changed in its list (`CHK4531.CHECKS[…].fail`), before any check is rolled.
  - **`VI4533.lines`** (Feature 4.5.33) is wrapped: Touch of the Void's button gets the class `ghost`, its words and its spoken name. This part installs only when Feature 4.5.33 is there.
  - **The trunk's `rollWithModifiers`** is wrapped, as B05 does: Touch of the Void's and Toshigoku's failure lines are changed where the roll is asked for, so a reroll that copies a roll's words (Dark Paragon, Luck, Unlucky, the Ancestors' gifts) gets the new line.
  - **The trunk's `appAlert`** is wrapped: only Elemental Imbalance's failure message, from Feature 4.5.2's Willpower gates (Part I), is reworded.
  - **The stylesheet `src/css/1154-check-button-names.css`** sizes Lord Moon's button under `body.cn15-on`, which the switch sets. Its selector outranks A07's 44 px rule for that button only.
- **One guarded seam block:** `check-button-names-seam`.
- No save field. One class of its own, `cn15-on`.

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With B01 (this branch, on group 1 as live) | `c97e39f1e500b712a31dc4fc6b33b09b9e4a7996cf04dd7edfc38b2d065f1d22` | 17,755,128 |
| B01 removed (group 1 as live, B17 on B14) | `5ac767c6c3680126cfe664aef41e7312d98f24eee842ec679e38ed664dde574d` | 17,750,809 |
| **Round 2:** with B01 on group 1 (made from the tip by removing B09, B05 and B03) | `9e245e2c5bf4b81d388e79be6aca13e2cc0b4a4f8c900852cbd5f66e76797a64` | 17,762,561 |
| **Round 2:** the group build (the tip) | `1f002be964b12ee91b7ed484b949946a859d84b84a7a7756bf7d9ed1841b5819` | 17,773,727 |
| **Round 2:** B01 removed, as before | `5ac767c6…574d` (unchanged) | 17,750,809 |

## Light checks (24 November)

| Check | Result |
|---|---|
| Own harness `qa/check-names-harness.js` (15 checks, pinned before the first run) | Run 1: 11/15 (`qa/run-1.log`). The harness closed the first roll window with Escape, which left the window over the next button, so four taps timed out. The unit was right: the labels, spoken names and Brash's roll had passed. The harness now closes each roll window with its own button; no expectation changed. Run 2: 15/15 (`qa/run-2-close-button.log`). |
| `qa/test-removal.py` | 10/10 (`qa/removal.log`) |
| The dependency check (`G2 — Action Labels and Wording/qa/dependencies.py B01`) | 1/1: every reference inside B01's own blocks (`G2 — Action Labels and Wording/qa/dependencies-b01.log`) |
| The harnesses of the layers it touches, first run (before 4.5.31's harness followed B01) | 13/14 harnesses, 962/971. Only Feature 4.5.31's own harness failed, on the seven words B01 changes (`G2 — Action Labels and Wording/qa/light/b01-touched-first-run.log`). |
| The same, with 4.5.31's harness following B01 (Feature 4.5.31, 4.5.32, 4.5.10, 4.5.15, Phase 4.5, 4.5.2, 4.5.4, Phase 14 Search, Phase 14.1 and its dependency harness, Phase 12.5's Play Advantages, Quick Access, A04, A16) | 14/14 harnesses, 992/992 (`G2 — Action Labels and Wording/qa/light/b01-touched-run.log`) |
| Feature 4.5.31's harness on the build with B01 removed (`5ac767c6…574d`, made by `G2 — Action Labels and Wording/qa/removed-build.py`) | 1/1 harness, 101/101, the same count as with B01 (`G2 — Action Labels and Wording/qa/light/b01-removed-4531-run.log`) |

## Light checks, round 2 (24 November)

| Check | Result |
|---|---|
| Own harness `qa/check-names-harness.js`, revised: eight round-2 checks (`CN-R2-*`) pinned in `qa/expected-checks.json` before their first run, 23 in all. They check Lord Moon's and Touch of the Void's look against Epilepsy's untouched "Avoid (TN 15)" in Manage and Play, Touch of the Void's words and spoken name, the ten failure lines rolled to a failure (every die a 1) against the board's round-2 table, and Elemental Imbalance's message reached through a Shugenja's Fire spell roll. | 23/23, first time (on the group build: `G2 — Action Labels and Wording/qa/light/r2-own-on-group-1f002be9/check-names-harness.log`) |
| `qa/test-removal.py` (the remover now owns the stylesheet too) | 10/10; B01 removed still rebuilds `5ac767c6…574d` exactly (`qa/removal-round2.log`) |
| The group's four harnesses on the group build (`1f002be9…5819`) | B01 23/23, B03 15/15, B05 10/10, B09 9/9, first time (`G2 — Action Labels and Wording/qa/light/r2-own-on-group-1f002be9/`) |
| The dependency check, all four units (`G2 — Action Labels and Wording/qa/dependencies.py`; B01 searched with the class `cn15-on` too) | 4/4 (`G2 — Action Labels and Wording/qa/dependencies-round2.log`) |
| The harnesses of every layer the group touches, one run on the group build: round 1's four sets (B01's, B03's, B05's and B09's), plus Feature 4.5.5's gates harness | 85/85 harnesses, 3,806/3,806, first time (`G2 — Action Labels and Wording/qa/light/r2-touched-run.log`, `G2 — Action Labels and Wording/qa/light/r2-touched/`) |
| The "15a removed, group kept" stage: all 26 Release 15a units removed, rebuild verifies (`fd8fb7d0…8469`, 17,580,504 bytes) | B01 23/23, B03 15/15, B05 10/10, B09 9/9 (`G2 — Action Labels and Wording/qa/remove-15a-keep-group-round2.log`, `G2 — Action Labels and Wording/qa/light/r2-own-on-15a-removed-fd8fb7d0/`) |
| The three harnesses that follow B01 (Feature 4.5.31's, Feature 4.5.33's and A07's), on the build with B01 removed (`5ac767c6…574d`) | 3/3, 171/171: the same ids and counts as with B01 (`G2 — Action Labels and Wording/qa/light/r2-b01-removed-following-run.log`) |

The older harnesses that follow B01 since round 2 (Feature 4.5.33's, A07's) and those that needed no change are listed in ROLLBACK.md.

## Not covered by the harness

- A native iPhone and Safari, and VoiceOver reading the spoken names. In the device round, open the seven entries on a real phone, read the buttons, and tap two of them.
- Round 2 on a real phone: Lord Moon's and Touch of the Void's buttons beside the others, the failure lines, and Elemental Imbalance's message (DEVICE-CHECKS.md, "Round 2").
- Feature 4.5.32's and Phase 14's device-walk scripts (not in the suite) still press the old words; see ROLLBACK.md.
