# Removing B03 (Release 15b)

B03 is one independently removable unit of Release 15b, group 2 (action labels and wording).

- **Marker:** `PART H PHASE 15.2.7`. The number is a marker only; the unit keeps its identifier.
- **Tag:** `LA15`.
- **Switch:** `LEAD_AN_ALLY_ENABLED`.
- **Round 2** (24 November 2026, the owner's "Approve as shown"): both buttons take the shared class `ghost`, the outlined look. Round 2 (24 November 2026) is on the tip branch `claude/release-15b-b09` only; the lower branches keep round 1. The builds below are round 2's, made from the tip by removing later units.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.9999999999999999998-feat-lead-an-ally.js`. Holds `LA15` and the switch, and wraps `VI4533.lines`. Since round 2 it also adds the shared class `ghost` to the two buttons it rewords. |
| Stylesheet | `src/css/1153-lead-an-ally.css`: the amount's size, line height and ink (`.la15-amount`). |
| Manifest | The two entries naming those files: the stylesheet right after B17's (`1152`), and the script right after B01's. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `lead-an-ally-seam` (a guarded `Object.assign`), right after B01's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after B01's. |

It adds no save field and no storage key. Its one class of its own is `la15-amount`; `ghost` is the sheet's shared outlined button class.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside its block, and a missing block.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly B01 (round 2) on group 1 as live: 17,762,561 bytes, SHA-256 `9e245e2c5bf4b81d388e79be6aca13e2cc0b4a4f8c900852cbd5f66e76797a64`. (Round 1's was 17,755,128 bytes, `c97e39f1…1d22`.) `qa/test-removal.py` proves three things:
- that rebuild;
- that B01 removed next gives group 1 as live exactly;
- that B01 can be removed with this unit kept.

**Switching it off instead:** set `LEAD_AN_ALLY_ENABLED = false`. Nothing is wrapped, and the two buttons read as before ("Lead an ally (School Rank + 1k1)", "Did not act first: +Reflexes"), filled black, with no amount beside them and no spoken name of their own.

## Harnesses that follow this unit

None. Feature 4.5.33's and 4.5.35's harnesses (Part I) read the buttons' state, titles and notes, not their words or their look, and pass unchanged with B03 present (see the README).

## Dependencies

- **Feature 4.5.33 (Part I), Void and Initiative Entries:** hard, by property and guarded.
  - **What B03 reads:** `VI4533.lines` (the row's parts, the button first), `VI4533.make`, `VI4533.schoolRank` and `VI4533.trait`.
  - **Without them:** B03 installs nothing.
  - **Text it does not recognise** (a button whose words are not the two it replaces) is left as it is.
  - **4.5.33's remover** matches `VI4533` as its surface, so it refuses while B03 is present: **remove B03 first**. The removal chain does this in order. The reciprocal note is in 4.5.33's ROLLBACK.
- **Feature 4.5.35 (Part I), the Initiative Score:** none by name. Its line on Quick's row ("Your Initiative Score is …") is appended after the row is drawn, and stays.
- **B18 (One Name per Button Job):** Quick's "Use" is B18's suggestion for its job group G06. If B18 rules another word, B18's own build changes it. Nothing here depends on B18.
- **B01 and group 1:** none either way. B01 can be removed with B03 kept, and the rebuild verifies.
- **Nothing depends on B03.** No later unit may call `LA15` or read `la15-amount` without declaring it here first.
