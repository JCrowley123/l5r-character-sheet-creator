# Removing B01 (Release 15b)

B01 is one independently removable unit of Release 15b, group 2 (action labels and wording).

- **Marker:** `PART H PHASE 15.2.6`. The number is a marker only; the unit keeps its identifier.
- **Tag:** `CN15`.
- **Switch:** `CHECK_BUTTON_NAMES_ENABLED`.
- **Round 2** (24 November 2026, the owner's "Approve as shown"; on the tip branch `claude/release-15b-b09` only) added the stylesheet, the class `cn15-on`, and the wrappers for Touch of the Void's button, two failure lines and Elemental Imbalance's message.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.9999999999999999997-feat-check-button-names.js`. Holds `CN15` and the switch. It wraps `CHK4531.checkButton`, `CHK4531.button`, `VI4533.lines`, the trunk's `rollWithModifiers` and `appAlert`, and changes seven failure lines in `CHK4531.CHECKS` when it installs. |
| Stylesheet | `src/css/1154-check-button-names.css`: Lord Moon's Curse's resist button at the check buttons' size, under `body.cn15-on`. |
| Manifest | The two entries naming those files: the stylesheet after B03's (`1153`), the last stylesheet before the head closes, and the script right after B17's script. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `check-button-names-seam` (a guarded `Object.assign`), right after B17's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after B17's. |

It adds no save field and no storage key. Its one class is `cn15-on`, on the page's body.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside its block or its two fragments, and a missing block.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly group 1 as live (B17 on B14): 17,750,809 bytes, SHA-256 `5ac767c6c3680126cfe664aef41e7312d98f24eee842ec679e38ed664dde574d`. `qa/test-removal.py` proves three things:
- that rebuild;
- that B17 removed next gives B14 exactly;
- that B17 can be removed with this unit kept.

**Switching it off instead:** set `CHECK_BUTTON_NAMES_ENABLED = false`. Nothing is wrapped and the body class is not set:
- the seven buttons read as before ("Check (TN 25)", "Spend a Void Point" and so on), with their old spoken names;
- Touch of the Void's button reads "Willpower (TN 30)", filled black;
- Lord Moon's Curse's resist button is 44 px tall again (Release 15a A07);
- the ten failure lines keep their "Tell the GM …" sentence.

## Harnesses that follow this unit (declared)

Each reads `CN15` from the seam. With B01 removed, every line runs as before. Each keeps its ids and its count.

**Feature 4.5.31 (Part I), `qa/checks-conditions-harness.js`.** Only while B01 is present:
- `CK-ROW-BRASH`, `CK-ROW-CANT-LIE`, `CK-ROW-CONTRARY`, `CK-ROW-OVERCONFIDENT`, `CK-ROW-RUMORMONGER`, `CK-ROW-SOFT-HEARTED` and `CK-ROW-LOST-LOVE` expect B01's words;
- its presses look for B01's words.

Its failure checks read the lines by a word in them ("attack", "argue"), so round 2's shorter lines needed no change. Everything else is unchanged: the rolls, TNs, notes and every other check.

**Feature 4.5.31's `qa/dependency-harness.js`** (not in the suite) reads `CN15` the same way for its one check of Brash's button.

**Feature 4.5.33 (Part I), `qa/void-initiative-harness.js`** (round 2). Only while B01 is present, `VI-TOUCH-ROW` and `VI-TOUCH-ONLY-ITS-OWN-LIST` expect Touch of the Void's button to read "Keep control (TN 30)". Its failure check reads the line by the word "Dazed", so it needed no change.

**Release 15a A07, `qa/moon-row-harness.js`** (round 2). Only while B01 is present, `MR-RESIST-AND-ORDER-*` and `MR-PLAY-RESIST-AND-ORDER-*` expect the resist button under 44 px, with type at 0.78 of the page's root size, instead of at 44 px. Its words, place and edge checks are unchanged.

**Not changed, and why:**
- B05's harness no longer reads Touch of the Void's words or its whole failure line, so it does not depend on B01 (a harness fix recorded in B05's README).
- The Moon Resist Label fix's harness reads the button's words, which B01 does not change, and not its size.
- Feature 4.5.10's harness (Part I) checks Toshigoku's roll by its TN, not its failure line.
- Feature 4.5.2's harness (Part I) checks Elemental Imbalance's message by a pattern ("Elemental Imbalance … Willpower") that the new words still match.
- Feature 4.5.32's harness reads no line B01 changes.

**Not changed, not in the suite:** Feature 4.5.32's and Phase 14's `qa/checklist-walk.js` (Part I and Part K) are older device-walk scripts that press "Check (TN 25)" and "Spend a Void Point" by their words. Run them with B01 switched off, or read B01's words for those presses.

## Dependencies

- **Feature 4.5.31 (Part I), Checks and Conditions:** hard, by property and guarded.
  - **What B01 reads:** `CHK4531.checkButton`, `CHK4531.button` and `CHK4531.CHECKS` (each check's `name`, `trait` and `why`, for the spoken name; seven checks' `fail`, changed only where it is exactly the old line).
  - **Without them:** B01 installs nothing.
  - **4.5.31's remover** matches `CHK4531` as its surface, so it refuses while B01 is present: **remove B01 first**. The removal chain does this in order. The reciprocal note is in 4.5.31's ROLLBACK.
- **Feature 4.5.33 (Part I), Void and Initiative Entries** (round 2): soft, by property and guarded.
  - **What B01 reads:** `VI4533.lines`. Touch of the Void's button is reworded and given the class `ghost` only when its words are exactly "Willpower (TN 30)".
  - **Without it:** that part is not installed; the rest of B01 is.
  - **4.5.33's remover** matches `VI4533` as its surface, so it refuses while B01 is present (as it does for B03): **remove B01 first**. The reciprocal note is in 4.5.33's ROLLBACK.
- **The trunk's `rollWithModifiers`** (round 2): B01 wraps it, as B05 and many earlier layers do. It changes only the failure line of the options, and only for two rolls: a roll titled "Touch of the Void — Willpower vs TN …" or "Cursed by the Realm (Toshigoku) — Willpower vs TN …" whose failure line is exactly the old one. A reroll that copies the roll's words gets the new line.
- **The trunk's `appAlert`** (round 2): B01 wraps it. It changes only one message, Elemental Imbalance's failure notice from Feature 4.5.2's Willpower gates (Part I), and only when its words are exactly the old ones.
- **Feature 4.5.10 (Part I), Cursed by the Realm, and Feature 4.5.2's Willpower gates:** none by name. B01 matches their exact words, not their code, so their removers are unaffected.
- **Release 15a A07 (the Moon row) and the Lord Moon fix (LM7):** none by name. B01's stylesheet styles the fix's `lm7-roll` button and outranks A07's 44 px rule for it, without naming A07's class or either surface. With B01 removed, A07's rule applies again. The reciprocal note is in A07's ROLLBACK.
- **Phase 4.5.34 (Part I), Blind's Armor TN note, and Release 15a A05 and A11:** none. B01 changes no field, no layout rule and no Blind line.
- **B18 (One Name per Button Job):** Lost Love's "Spend Void" is B18's suggestion for its job group G07. If B18 rules another word, B18's own build changes it. Touch of the Void's "Keep control (TN 30)" answers B18's G11 question for that button. Nothing here depends on B18.
- **Group 1 (A14, B04, B14, B17):** none either way. B17 can be removed with B01 kept, and the rebuild verifies.
- **Nothing depends on B01.** No later unit may call `CN15` or read `cn15-on` without declaring it here first.
