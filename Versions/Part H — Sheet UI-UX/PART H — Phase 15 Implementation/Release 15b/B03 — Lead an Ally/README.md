# Release 15b · B03 — Lead an Ally

Group 2 (action labels and wording), unit 2.

- **Where it came from:** FT-19 in the Phase 15 audit. "Lead an ally" is Q8's, accepted by the owner on 1 November 2026.
- **Approved:** 24 November 2026, round 1: "Approve as recommended". That was Leadership and Quick on one pattern, the board's answer to the owner's sheet-wide question: Quick is the one other button of Feature 4.5.33 whose label is a condition and a formula.
- **Records:** see [MOCKUP.md](<../G2 — Action Labels and Wording/MOCKUP.md>) and the board, https://claude.ai/artifact/REUwrJoboaHe6xQBuGDDy2.
- **Built:** 24 November 2026 (Claude), on branch `claude/release-15b-b03`, stacked on `claude/release-15b-b01`.
- **Round 2:** after the device round (the owner's comment 3), approved 24 November 2026: "Approve as shown". Rebuilt the same day on the tip branch `claude/release-15b-b09` only; `claude/release-15b-b03` keeps round 1.

## What changes

Two Advantage buttons of Feature 4.5.33 (Part I) get a short name, with the amount beside it, filled in from the character:

| Entry | Today | With B03 | Beside it |
|---|---|---|---|
| Leadership (Core p.151) | Lead an ally (School Rank + 1k1) | Lead an ally | 1k1 + 2 (School Rank) |
| Quick (Core p.152) | Did not act first: +Reflexes | Use | +3 (Reflexes) |

- **Spoken names** say what each does: "Lead an ally: roll 1k1 + 2 (School Rank) for one ally’s Initiative Score" and "Use Quick: add 3 (Reflexes) to your Initiative Score for the rest of the skirmish". Before B03, neither button had a spoken name of its own.
- **The amounts follow the character.** The row is drawn again on every recalculation, so a new School Rank or Reflexes shows at once. If Reflexes is empty, Quick shows "+Reflexes".
- **Widths (the mock-up's measurements, REPRODUCTION.md):** Leadership's button goes from 252 to 106 px, and Quick's from 220 to 44 px. Every row keeps its height before use. After use, Quick's row is shorter (73 to 48 px on a phone).
- **Quick's "Use"** is B18's suggestion for its job group G06 (using an ability now). B18's answers were still open on 24 November. If B18 rules another word, B18's own build changes it.

**Unchanged:**
- the Leadership roll, its title and its School Rank note;
- once a Round, the round ledger and Next Round;
- the notes under the buttons;
- Feature 4.5.35's Initiative Score line on Quick's row;
- the greyed-out state and its reasons ("Start a combat round first.", "Already used this Round."). These are still tooltips only, which a phone does not show; that is recorded in MOCKUP.md and not part of B03.
- the save file.

### Round 2 (approved as shown, 24 November 2026)

**Both buttons are outlined**, like every other button on the Advantage and Disadvantage cards (the shared class `ghost`), in place of Feature 4.5.33's black fill. Their words, amounts, spoken names, notes and greyed-out state are unchanged.

## How it is built

- `src/sheet/209.9999999999999999998-feat-lead-an-ally.js` holds `LA15` and the switch `LEAD_AN_ALLY_ENABLED`. It wraps `VI4533.lines`, which Feature 4.5.33 calls each time it draws a row:
  - for Leadership and Quick, if the button still has its old words, B03 sets the new words and spoken name;
  - it then puts a `span.la15-amount` right after the button;
  - since round 2, it also adds the class `ghost` to that button.
  - A button whose words it does not recognise is left alone.
- `src/css/1153-lead-an-ally.css` gives `.la15-amount` the size, line height and soft ink of Feature 4.5.33's notes, and keeps it on one line. It is B03's own rule, not shared with 4.5.33's class, so 4.5.33's harness still finds only its own notes.
- **One guarded seam block:** `lead-an-ally-seam`.

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With B03 (this branch, on B01) | `223790bc58b04190bdb2971dac281745a578cda153c396685403657a83e05b8d` | 17,759,590 |
| B03 removed (B01 on group 1 as live) | `c97e39f1e500b712a31dc4fc6b33b09b9e4a7996cf04dd7edfc38b2d065f1d22` | 17,755,128 |
| **Round 2:** with B03 on B01 (made from the tip by removing B09 and B05) | `feac10a6afd30eca2c0556cfcd66817a78d72401f10049a57569195e905bfc04` | 17,767,327 |
| **Round 2:** B03 removed (B01 round 2 on group 1); `qa/remove-phase.py` and `qa/test-removal.py` restacked on it | `9e245e2c5bf4b81d388e79be6aca13e2cc0b4a4f8c900852cbd5f66e76797a64` | 17,762,561 |

## Light checks (24 November)

| Check | Result |
|---|---|
| Own harness `qa/lead-an-ally-harness.js` (13 checks, pinned before the first run) | Run 1: 9/13 (`qa/run-1.log`). The harness typed School Rank 2 into the School Rank box, but the sheet works that box out from Insight, so it showed 1, and the four checks that expected 2 failed. The unit showed the sheet's own School Rank, which is right. Run 2 added a School and raised Insight through the Traits, and reads the School Rank the sheet shows: 11/13 (`qa/run-2-school-rank.log`). Its Isawa Shugenja opened the new-Rank spell window when Insight rose, which covered the two buttons. Run 3 uses Akodo Bushi: 13/13 (`qa/run-3-bushi-school.log`). No expectation about the unit changed. |
| `qa/test-removal.py` | 10/10 (`qa/removal.log`) |
| The dependency check (`G2 — Action Labels and Wording/qa/dependencies.py B03`, with the class `la15-amount`) | 1/1 (`G2 — Action Labels and Wording/qa/dependencies-b03.log`) |
| The harnesses of the layers it touches (Feature 4.5.33, 4.5.35, 4.5.25, 4.7.1, 4.5.27, 4.5.28, 4.5.30, 4.5.15, Phase 4.5 and 4.5.4, Phase 14 Search, Phase 14.1 and its dependency harness, Phase 12.5's Play Advantages, Quick Access, A04, A16) | 17/17 harnesses, 1,091/1,091, first time (`G2 — Action Labels and Wording/qa/light/b03-touched-run.log`) |

## Light checks, round 2 (24 November)

| Check | Result |
|---|---|
| Own harness `qa/lead-an-ally-harness.js`, revised: `LA-OUTLINED-PHONE` and `LA-OUTLINED-DESKTOP` pinned in `qa/expected-checks.json` before their first run, 15 in all. Each compares both buttons' look (fill, border, ink, type, padding, line height, height) with Epilepsy's "Avoid (TN 15)", added only for these two checks. | 15/15, first time (`G2 — Action Labels and Wording/qa/light/r2-own-on-group-1f002be9/lead-an-ally-harness.log`) |
| `qa/test-removal.py`, restacked | 10/10 (`qa/removal-round2.log`) |
| The group's four harnesses on the group build (`1f002be9…5819`) | B01 23/23, B03 15/15, B05 10/10, B09 9/9, first time (`G2 — Action Labels and Wording/qa/light/r2-own-on-group-1f002be9/`) |
| The dependency check, all four units (`G2 — Action Labels and Wording/qa/dependencies.py`; B01 searched with the class `cn15-on` too) | 4/4 (`G2 — Action Labels and Wording/qa/dependencies-round2.log`) |
| The harnesses of every layer the group touches, one run on the group build: round 1's four sets (B01's, B03's, B05's and B09's), plus Feature 4.5.5's gates harness | 85/85 harnesses, 3,806/3,806, first time (`G2 — Action Labels and Wording/qa/light/r2-touched-run.log`, `G2 — Action Labels and Wording/qa/light/r2-touched/`) |
| The "15a removed, group kept" stage: all 26 Release 15a units removed, rebuild verifies (`fd8fb7d0…8469`, 17,580,504 bytes) | B01 23/23, B03 15/15, B05 10/10, B09 9/9 (`G2 — Action Labels and Wording/qa/remove-15a-keep-group-round2.log`, `G2 — Action Labels and Wording/qa/light/r2-own-on-15a-removed-fd8fb7d0/`) |

## Not covered by the harness

- A native iPhone and Safari, and VoiceOver reading the spoken names. In the device round, open Leadership and Quick on a real phone, in and out of a combat round, and tap each once.
