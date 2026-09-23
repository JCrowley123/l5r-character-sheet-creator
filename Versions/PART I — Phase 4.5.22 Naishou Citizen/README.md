# Phase 4.5.22 — Naishou Citizen

A08 (Naishou Province p.7), 3 XP. **Implemented and verified, 23 September 2026.** A hard dependency on Phase 4.5.21 (Seven Fortunes' Blessing).

## Behaviour

- **Discount:** while Naishou Citizen is on the **Advantage** list, a configured Seven Fortunes' Blessing costs **1 XP less**. It stacks with the Blessing's own Clan price (Crane Benten: 4 → 3 → **2**) and never goes below Core p.149's 1-XP minimum. It is applied once, however many Naishou rows there are, and in either row order. Removing Naishou Citizen restores the Blessing's own price on the next recalculation. An unconfigured Blessing keeps whatever cost it carries, as in 4.5.21.
- **Naishou row:** "Aligned with <Fortune>" badge, a circled-i reference, and a reminder: "<Fortune>'s Blessing costs 1 XP less (N XP). One Free Raise on Social Skill rolls with monks aligned to <Fortune> — apply it yourself." Without a configured Blessing it warns "No Seven Fortunes' Blessing yet". On the Disadvantage list it discounts nothing and says the entry belongs in Advantages.
- **Blessing row and picker:** the Blessing row adds "Naishou Citizen: −1 XP (included in the cost)". The Fortune picker's prices already include the −1, and its note says so.
- **The Free Raise is a reminder**, as approved: the sheet has no Raise mechanic to spend it through, and "aligned monks" is a GM judgement.
- **Nothing is saved:** Naishou Citizen has no config. A configured row renamed to Naishou Citizen drops its old setting.

**Not built, deliberately:** "With the GM's agreement a later purchase may choose a different Fortune, losing the original Blessing without a refund." This is the purchase-history question the owner deferred for review on 23 September (see the ledger's open reminders). **Interim:** the Blessing row is priced by its current Fortune, and the info text says this is recorded for review.

Restore point recorded before any edit: commit `436372ad4e0782417c4efcb7dd20f3a342b3c7ee`, **2,846,031 bytes**, SHA-256 `9c749b7dc9c45fc5829f8db3172067d91ced54833e734da4f245d3ddb08528d0`, **1,899/1,899**.

## Measured QA — 23 September 2026

Final Phase 0 output: **2,854,260 bytes**, SHA-256 `985fdeeeb4888e2d62195b5182481c5f6da053418f0737b00bbacd9c9d8b9a3f` (pinned).

| Check | Measured result |
|---|---|
| New real-browser suite | **36/36**. Oracles come from the Core pp.153–154 price table, not from `FB4521`. Covers: every Fortune priced with and without Naishou, for no Clan and each discounted Clan; the XP total; row order; once-only; removal restoring the price; the Disadvantage side; an unconfigured Blessing; rows naming the current Fortune (Benten and Jurojin); the no-Blessing warning; the info text; renaming away and renaming into; the picker note and prices `[2,4,3,3,3,3,3]` for Crane; no pre-roll modifier added on Skill, Trait, Ring or attack contexts; other entries unchanged; no config saved; local save and reload; geometry at four widths (the row fits, text readable, the circled i a 28px round target, the reminder on its own line); no page errors |
| Full combined suite | **1,935/1,935** = 1,899 retained + 36. No retained check changed |
| Surgical removal | **Byte-identical** to the restore point; the removed copy verifies; **1,899/1,899** retained on those bytes |
| Hard dependency on 4.5.21 | 4.5.21's remover **refuses** while this is present (exit 2, "retained source contains owned marker/surface"; scratch tree unchanged). 4.5.22 then 4.5.21: **byte-identical** to 4.5.20's restore point, 2,820,250 bytes, `10683306…` |
| Remover fixtures | **45 run, 45 passed, 0 skipped** |
| Ownership scan | Every reference is inside `PART I FEATURE 4.5.22` blocks; exit 0 |
| Recombine / drift / inventory / registry | Exit 0 / exit 0 / no differences (270 ids, 10 sections, 26 overlays) / seven seats |

### Deliberately broken builds (one run)

| Mutation | Result | What failed |
|---|---|---|
| Kill switch off | **10/32** | Every feature check (two sections then abort) |
| Own stylesheet removed | **32/36** | The four geometry checks |
| No discount | **22/36** | All seven Fortune price checks, XP total, order, once-only, both row reminders, picker prices, reload |
| Discount of 2 | **22/36** | The same fourteen |
| Naishou counted from the Disadvantage list | **35/36** | `NC-WRONG-SIDE` |
| Blessing-row note missing | **35/36** | `NC-BLESSING-NOTE` |
| Picker note missing | **35/36** | `NC-MODAL-NOTE` |
| Badge always says Benten | **35/36** | `NC-ROW-FOLLOWS-FORTUNE` |
| Reminder always says Benten | **35/36** | `NC-ROW-FOLLOWS-FORTUNE` |
| No-Blessing warning blank | **34/36** | `NC-NO-BLESSING-YET`, `NC-RENAMED-INTO` |
| Disadvantage-side warning missing | **35/36** | `NC-WRONG-SIDE` |
| Earlier configured row kept on rename | **35/36** | `NC-RENAMED-INTO` |
| Info button missing | **30/32** | The rows and geometry sections |

Two gaps found and closed during QA:
- The first stylesheet-removed run passed **36/36**, because the geometry checks could not tell whether the stylesheet had loaded. The tap-target and own-line checks were added, and the rerun above fails four.
- The first harness never named a Fortune other than Benten, and never renamed a configured row into Naishou Citizen. `NC-ROW-FOLLOWS-FORTUNE` and `NC-RENAMED-INTO` were added.

The 1-XP floor is not mutated: no Blessing price is below 3 before Naishou's discount, so the floor cannot be reached with today's table. It is kept for Core p.149.

Inspected at 375px with fallback fonts only (Crane, Benten + Naishou Citizen): both rows fit, and the reminder wraps on its own line. One wording nit is left as is: 4.5.21's own line on the Blessing row reads "2 XP: Crane price." although the 2 already includes Naishou's −1. This release's note on the next line says so, and 4.5.21's text is not edited from here. Physical iPhone testing remains open.

## Run

`NODE_PATH=/opt/node22/lib/node_modules node qa/current-suite-runner.js <built html>`; `qa/verify-variants.py --node <node> --retained`; `qa/test-removal.py`.

## Cost

Exact token counts are not exposed to this session; none is estimated. Production surface: one JS fragment, one stylesheet, one guarded seam block, two manifest entries.
