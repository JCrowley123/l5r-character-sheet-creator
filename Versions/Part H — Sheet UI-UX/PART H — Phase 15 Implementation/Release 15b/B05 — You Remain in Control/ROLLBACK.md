# Removing B05 (Release 15b)

B05 is one independently removable unit of Release 15b, group 2 (action labels and wording).

- **Marker:** `PART H PHASE 15.2.8`. The number is a marker only; the unit keeps its identifier.
- **Tag:** `RC15`.
- **Switch:** `REMAIN_IN_CONTROL_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.9999999999999999999-feat-remain-in-control.js`. Holds `RC15` and the switch, and wraps the trunk's `rollWithModifiers`. |
| Manifest | The one entry naming that file, right after B03's script. B05 has no stylesheet. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `remain-in-control-seam` (a guarded `Object.assign`), right after B03's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after B03's. |

It adds no save field, no storage key and no class.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside its block, and a missing block.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly B03 on B01, both at round 2: 17,767,327 bytes, SHA-256 `feac10a6afd30eca2c0556cfcd66817a78d72401f10049a57569195e905bfc04`. (Round 1's was 17,759,590 bytes, `223790bc…5b8d`.) Round 2 (24 November 2026) is on the tip branch `claude/release-15b-b09` only; the lower branches keep round 1. The builds below are round 2's, made from the tip by removing later units. `qa/test-removal.py` proves three things:
- that rebuild;
- that B03 removed next gives B01 exactly;
- that B03 can be removed with this unit kept.

**Switching it off instead:** set `REMAIN_IN_CONTROL_ENABLED = false`. Nothing is wrapped, and the two lines read as before ("You keep your head.", "Willpower roll passed. You keep control tonight.").

## Harnesses that follow this unit

None. No older harness reads either success line (see the README for the roll harnesses run with B05 present).

**B05's own harness does not follow B01** (harness fix, 24 November 2026): it finds Touch of the Void's button by its row, not its words, and checks the failure line's first sentence, "You are Dazed for one Round.", which B01's round 2 keeps. It passes with B01 present and would pass without it.

## Dependencies

- **The trunk's `rollWithModifiers`:** B05 wraps it, as many earlier layers already do (Soul of Artistry, Void Versatility, Dark Paragon, the Ancestors, the dice entries and others). It passes every argument through, and changes only the success line of the options, and only for two rolls:
  - a roll titled "Touch of the Void — Willpower vs TN …" whose success line is exactly "You keep your head.";
  - a roll titled "Lord Moon’s Curse — Willpower vs TN …" whose success line is exactly "Willpower roll passed. You keep control tonight."
- **Feature 4.5.33 (Part I), Touch of the Void's check, and the Lord Moon's Curse fix (`BUGFIX — Moon Curse Full Moon`):** soft, by their words only.
  - **If either changes its title or line,** B05 leaves that roll alone.
  - **B05 names neither layer's surface,** so neither remover refuses while B05 is present.
- **Layers that copy a roll's words into a reroll** (Dark Paragon, Luck, Unlucky, the Ancestors' gifts): none by name. They copy the line B05 has already set, so a reroll keeps "You remain in control".
- **B01, B03 and group 1:** none either way. B03 can be removed with B05 kept, and the rebuild verifies.
- **Nothing depends on B05.** No later unit may call `RC15` without declaring it here first.
