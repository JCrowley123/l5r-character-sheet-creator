# Removing B14 (Release 15b)

B14 is one independently removable unit of Release 15b, group 1 (totals and their breakdowns).

- **Marker:** `PART H PHASE 15.2.4`. The number is a marker only; the unit keeps its identifier.
- **Tag:** `JK15`.
- **Switch:** `JIGOKU_TOTAL_FIRST_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.9999999999999999995-feat-jigoku-total-first.js`. Holds `JK15` and the switch, and wraps `TR4524.modifiers` and `TR4524.refresh`. |
| Manifest | The one entry naming that file, right after B04's script. B14 has no stylesheet. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `jigoku-total-first-seam` (a guarded `Object.assign`), right after B04's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after B04's. |

It adds no save field, no storage key, no class and no id.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside its block, and a missing block.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly B04 on A14: 17,737,482 bytes, SHA-256 `56f51ab38339f13e8f64bc417ec3bef0b6c768bbfd226194943ab64800e5d156`. `qa/test-removal.py` proves three things:
- that rebuild;
- that B04 removed next gives A14 exactly;
- that B04 can be removed with this unit kept.

**Switching it off instead:** set `JIGOKU_TOTAL_FIRST_ENABLED = false`. Nothing is wrapped, and the words are as before.

## Harnesses that follow this unit (declared)

**Feature 4.5.24 (Part I), `qa/spirit-realms-harness.js`,** is conditional on B14. It reads `JK15` from the seam. Only while B14 is present, `TR-JIGOKU-LOST` and `TR-LOST-TICK` expect the card line "Adding +6 — Taint Rank 3 × 2 (Lost)." and "Adding +4 — Taint Rank 2 × 2 (Lost).". Everything else is unchanged:
- the figures;
- the dice;
- every other check;
- the ids and the count.

## Dependencies

- **Feature 4.5.24 (Part I), Touch of the Spirit Realms:** hard, by property and guarded. Without `TR4524.modifiers` and `TR4524.refresh`, B14 installs nothing. 4.5.24's remover matches `TR4524` as its surface, so it refuses while B14 is present: **remove B14 first**. The removal chain does this in order. The reciprocal note is in 4.5.24's ROLLBACK.
- **A14 and B04:** none either way. B04 can be removed with B14 kept, and the rebuild verifies.
- **Nothing depends on B14.** No later unit may call `JK15` without declaring it here first.
