# Release 15b · B05 — You Remain in Control

Group 2 (action labels and wording), unit 3.

- **Where it came from:** FT-22 in the Phase 15 audit. "You remain in control" is Q8's, accepted by the owner on 1 November 2026.
- **Approved:** 24 November 2026, round 1: "Approve as recommended". That included Lord Moon's line, the board's answer to the owner's sheet-wide question: Lord Moon's Curse is the one other check whose success means keeping control.
- **Records:** see [MOCKUP.md](<../G2 — Action Labels and Wording/MOCKUP.md>) and the board, https://claude.ai/artifact/REUwrJoboaHe6xQBuGDDy2.
- **Built:** 24 November 2026 (Claude), on branch `claude/release-15b-b05`, stacked on `claude/release-15b-b03`.
- **Accepted** in the device round, 24 November 2026. B05 itself is unchanged by round 2. It was restacked on round 2's B01 and B03 on the tip branch `claude/release-15b-b09`, and its harness was fixed so that it no longer reads B01's words (below).

## What changes

Two Willpower checks whose success means keeping control say so in the same words, in the roll window's result line:

| Check | Today | With B05 |
|---|---|---|
| Touch of the Void (Core p.162), TN 30 | You keep your head. | You remain in control. |
| Lord Moon's Curse (Core p.160), TN 20 | Willpower roll passed. You keep control tonight. | Willpower roll passed. You remain in control tonight. |

**Unchanged:**
- the failure lines ("You are Dazed for one Round. …", "Willpower roll failed." and Lord Moon's message after it). B01's round 2 shortens Touch of the Void's to "You are Dazed for one Round.";
- the titles, TNs, dice and buttons;
- every other roll's lines, such as Epilepsy's "No seizure.";
- the save file.

## How it is built

- `src/sheet/209.9999999999999999999-feat-remain-in-control.js` holds `RC15` and the switch `REMAIN_IN_CONTROL_ENABLED`. It wraps the trunk's `rollWithModifiers`, as many earlier layers do.
  - When a roll's title is Touch of the Void's or Lord Moon's Curse's Willpower check, and its success line is exactly today's words, it passes the new words on in a copy of the options.
  - Everything else goes through untouched.
- **Why at the source.** The words change where the roll is asked for, not in the window afterwards. So the roll window, and any layer that copies a roll's words into a reroll (Dark Paragon, Luck, Unlucky, the Ancestors' gifts), all get the same new line.
- **One guarded seam block:** `remain-in-control-seam`.
- No stylesheet, no class, no save field.

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With B05 (this branch, on B03) | `4d0a42b5ed28d24ce3614b0afe66bde674da07955f724c09dce350fe43313473` | 17,762,714 |
| B05 removed (B03 on B01) | `223790bc58b04190bdb2971dac281745a578cda153c396685403657a83e05b8d` | 17,759,590 |
| **Round 2:** with B05 on B03 (made from the tip by removing B09) | `029595b6412b10183837cf1e6ade8aeb80d78ac94ea68fdee696a280c9528983` | 17,770,451 |
| **Round 2:** B05 removed (B03 on B01, both round 2); `qa/remove-phase.py` and `qa/test-removal.py` restacked on it | `feac10a6afd30eca2c0556cfcd66817a78d72401f10049a57569195e905bfc04` | 17,767,327 |

## Light checks (24 November)

| Check | Result |
|---|---|
| Own harness `qa/remain-in-control-harness.js` (10 checks, pinned before the first run) | 10/10, first time (`qa/run-1.log`) |
| `qa/test-removal.py` | 10/10 (`qa/removal.log`) |
| The dependency check (`G2 — Action Labels and Wording/qa/dependencies.py B05`) | 1/1 (`G2 — Action Labels and Wording/qa/dependencies-b05.log`) |
| The harnesses of the layers it touches: every suite harness of a layer that rolls or changes a roll, 49 in all. They include Feature 4.5.33, the three Lord Moon harnesses (the Full Moon fix, the Resist label and A07's Moon row), Unlucky, Doubt, Paragon and Dark Paragon, the Seven Fortunes, Soul of Artistry, Void Versatility, the Ancestors and their fixes, Phase 1.5's pipeline baseline, Phase 3's Smart Roll Preview, Phase 4's Explain This Roll, the dice and situational entries, Feature 4.5.31, A19 and A20. | 49/49 harnesses, 2,281/2,281, first time (`G2 — Action Labels and Wording/qa/light/b05-touched-run.log`) |

## Light checks, round 2 (24 November)

B05 itself did not change. Its harness was fixed, with the same ids and count: it found Touch of the Void's button by its old words, "Willpower (TN 30)", and expected the whole old failure line, both of which B01's round 2 changes. It now finds the button by its row (Feature 4.5.33's button in Touch of the Void's entry) and checks that the failure line starts with "You are Dazed for one Round.", which B05 never touched, so it no longer depends on B01.

| Check | Result |
|---|---|
| Own harness `qa/remain-in-control-harness.js`, fixed as above | 10/10, first time (`G2 — Action Labels and Wording/qa/light/r2-own-on-group-1f002be9/remain-in-control-harness.log`) |
| `qa/test-removal.py`, restacked | 10/10 (`qa/removal-round2.log`) |
| The group's four harnesses on the group build (`1f002be9…5819`) | B01 23/23, B03 15/15, B05 10/10, B09 9/9, first time (`G2 — Action Labels and Wording/qa/light/r2-own-on-group-1f002be9/`) |
| The dependency check, all four units (`G2 — Action Labels and Wording/qa/dependencies.py`; B01 searched with the class `cn15-on` too) | 4/4 (`G2 — Action Labels and Wording/qa/dependencies-round2.log`) |
| The harnesses of every layer the group touches, one run on the group build: round 1's four sets (B01's, B03's, B05's and B09's), plus Feature 4.5.5's gates harness | 85/85 harnesses, 3,806/3,806, first time (`G2 — Action Labels and Wording/qa/light/r2-touched-run.log`, `G2 — Action Labels and Wording/qa/light/r2-touched/`) |
| The "15a removed, group kept" stage: all 26 Release 15a units removed, rebuild verifies (`fd8fb7d0…8469`, 17,580,504 bytes) | B01 23/23, B03 15/15, B05 10/10, B09 9/9 (`G2 — Action Labels and Wording/qa/remove-15a-keep-group-round2.log`, `G2 — Action Labels and Wording/qa/light/r2-own-on-15a-removed-fd8fb7d0/`) |

## Not covered by the harness

- A native iPhone and Safari. In the device round, roll Touch of the Void's check and Lord Moon's Curse's on a real phone, and read the line when the roll passes.
- A reroll by Dark Paragon, Luck or Unlucky is not driven here. Those layers copy the line B05 has already set, and their own harnesses pass with B05 present (below).
