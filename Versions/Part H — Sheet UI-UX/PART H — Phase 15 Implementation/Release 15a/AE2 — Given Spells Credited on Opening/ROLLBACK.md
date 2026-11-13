# Removing AE2 (Release 15a)

AE2 is one independently removable unit of the automatic-entries group.

- **Marker:** `PART H PHASE 15.1.29`. The number is a marker only; the unit keeps its identifier.
- **Tag:** `GS15`.
- **Switch:** `GIVEN_SPELLS_ON_OPENING_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.999999999999999996-feat-given-spells-on-opening.js`. Holds `GS15` and the switch. Rebinds, by name, `applyData` (after the older-holdings layer: credit each Shugenja School's given spells), `collectData` (writes the note), `clearAllRows` (forgets it), `saveCharacter` and `exportJSON` (clear it on the player's own save), and puts one rule, `given-spells-credited`, first in the character check's rules. |
| Manifest | The entry naming that file, right after AE1's. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `given-spells-on-opening-seam` (a guarded `Object.assign`), right after AE1's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after AE1's. |

## Character data

- **What it writes on rows** is the School-choice layer's own record (`schoolChoice`, Phase 11.2.5, Part K), exactly as ticking a spell in the older-holdings review writes it, and, for a spell it added, a spell row and a Spell Scroll row the wizard's own path creates. Removing the unit leaves those on every character that was opened with it: they are ordinary School spells.
- **One save field: `givenSpellsNote`**, a top-level list `[{school, marked:[…], added:[…]}]`, present only while a note is waiting for the player's save. Without the unit nothing reads it; the next save of that character leaves it out, because `collectData` no longer writes it. It is never needed for anything else, so no migration is required either way.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside its block, and a missing block.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly AE1: 17,651,074 bytes, SHA-256 `2c21296bf13c44283a4a43393f0512b187752cd7dad62804e2e0c2627139f17a`. `qa/test-removal.py` proves that, then that AE1 removed next gives A17 (G4 as live) exactly, and that AE1 can be removed with this unit kept.

**Switching it off instead:** set `GIVEN_SPELLS_ON_OPENING_ENABLED = false`. Opening, saving and exporting are exactly as before.

## Dependencies

- **Phase 11.2.5 (Part K), School choices from the character check — hard.** The records, `SC8.spellRow` / `scrollRow` / `read` / `write` and `SC8Logic`. Without them `install()` returns false and nothing changes.
- **Phases 11.2.2 to 11.2.4 (Part K), the wizard's spells — hard.** `CW1122.addSpell` adds a missing spell with its scroll; `CW1123.forSchool` gives each School's given list.
- **Older School Choices — soft, by order.** Its `applyData` wrapper runs first, so its review sees the given spells already credited and asks only about the real choices. Without it AE2 still credits them.
- **Phase 5 (Part J), the character validator — soft.** Without its rules list there is no note, and the change is still made.
- **Phase 11 (Part K), the Characters list — soft.** Its `saveCharacter` and `exportJSON` wrappers run inside this unit's. While a character is being opened this unit writes nothing to storage.
- **AE1 — none.** AE2 reads whatever each School's list says; with AE1 a Yogo Wardmaster's list includes Sense.
- **Nothing depends on this unit.** AE3 reads the same School records whoever wrote them.
