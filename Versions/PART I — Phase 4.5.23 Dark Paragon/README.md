# Phase 4.5.23 — Dark Paragon

A03 (Core p.147), built to the owner's rulings of 23 September 2026 (the audit's "A03 decisions"). **Implemented and verified, 23 September 2026.**

## Behaviour

| Precept | Core p.147 | What the sheet does |
|---|---|---|
| Control | Reroll any Social Skill Roll | **Reroll button** in the result of a Social Skill roll (Emphases included) |
| Determination | Negate every TN and Wound penalty on one Skill or Spell Casting Roll; no +5 | **Per-roll tick** in the preview (4.5.15), on Skill, attack and Spell Casting rolls. It removes your Wound penalty; any other TN penalty the GM sets is yours to drop |
| Insight | Reroll a roll that used Awareness | **Reroll button** after a roll whose Trait is Awareness (a Ring roll of Air does not count) |
| Knowledge | Reroll a roll that used Intelligence | **Reroll button** after a roll whose Trait is Intelligence |
| Perfection | Make one chosen die on a Skill Roll explode; no +5 | **Use button** on the row: pays and marks the use; you roll the die |
| Strength | Reroll any damage roll | **Reroll button** after a weapon damage roll. Tested with a library weapon; a manual-notation weapon's damage is marked the same way but was not tested |
| Will | Negate 10 Wounds at the moment you suffer them | **Use button** on the row: pays and marks the use; you take the Wounds off |

- **The reroll stands**, even when it is lower, with **+5** added. The source never says "keep the higher", and these four branches do not exclude the introductory +5. The reroll uses the same pool and flat modifiers as the original, through base 4.5's `advConfigLuckRerollResult()`, so no action cost is paid twice. An outcome line gives both totals, and the result says "Includes Dark Paragon +5" instead of calling the +5 a Ten Dice Rule bonus. A Willpower check that 4.5.2's gates run first never offers the reroll.
- **Payment:** once per session. A confirm dialog names the price, then the sheet takes **0.5 from Honor Points** (5 Honor points). **One Void Point** is taken only when Points are below 0.5, and in combat that respects the one-Void-Point-per-Round rule. With neither available, it refuses and changes nothing. Cancelling pays nothing and uses nothing. The Honor Rank field is never changed; the sheet does not link Rank to Points.
- **Determination's dialog** has three answers:
  - *Pay and roll*;
  - *Roll without it*, which drops the tick and pays nothing;
  - ✕, which cancels the roll.

  Cancelling the preview costs nothing.
- **Session:** the row shows "Available this session (1/1)" or "Used this session (0/1)" and has a **Reset session** button. It is also listed in the Session Resources panel. Changing the precept keeps the session's use.
- **Price:** 5 XP, 4 for a Spider character.
- **The record:** `{type:'darkParagon', revision:1, precept, value, remaining}`, where `remaining` is 0 or 1. It is not Failure of Bushido's `tenetPick`. Unreadable settings are kept exactly and flagged, with their saved cost.

**Not built:**
- Perfection's die picker and Will's wound negation, as approved.
- Core p.148's Paragon/Dark Paragon and Dark Paragon/Consumed set rules. The sheet has no set-rule mechanism, the same as 4.5.18.

Restore point recorded before any edit: commit `862dfbf316d8d05532e9b59d26dac9ddb844fb66`, **2,854,260 bytes**, SHA-256 `985fdeeeb4888e2d62195b5182481c5f6da053418f0737b00bbacd9c9d8b9a3f`, **1,935/1,935**.

## Measured QA — 23 September 2026

Final Phase 0 output: **2,888,142 bytes**, SHA-256 `4d112320eb4c1e9937a280b1e7d3f25ef1d5aff49a5a938e80b351fa329ccac7` (pinned).

| Check | Measured result |
|---|---|
| New real-browser suite | **67/67**. Oracles come from the Core p.147 table and the owner's rulings, never from `DP4523`; dice are counted on real rolls. Covers:<ul><li>price for four Clan values; the picker (printed order, nothing preselected, required, saved, changing keeps the use); every precept's row; used, reset and wrong side; the info text; the Session Resources panel; six unreadable configs</li><li>which reroll is offered after which of nine roll kinds, per precept, including the gated Willpower check</li><li>the reroll: cancel is free; price shown; paid; same pool; total = reroll dice + 5; fixed dice where a lower reroll still stands (27 → 8); the Wound penalty carried; Strength on damage</li><li>payment: the Void fallback, exactly 5 points, neither available, the Round's Void limit, and the Void spend recorded</li><li>Determination: its roll kinds; unticked; *without it*; ✕; paid (the total equals the kept dice, with the penalty gone); the breakdown; spent; preview cancel</li><li>Perfection and Will; no standing modifier from any precept; a roll alone changes nothing; local save and reload; geometry at four widths, including the result modal</li></ul> |
| Full combined suite | **2,002/2,002** = 1,935 retained + 67 |
| Retained checks corrected (declared) | Two, both conditional on this release: 4.5.15's `RD-NO-PRODUCTION-PROVIDER` and 4.5.16's `HV-PROVIDER-REGISTERED` now also set aside this release's own `dark-paragon` provider. Measured failing on this build before the correction (52/53, 90/91); both pass with it present and removed |
| Surgical removal | **Byte-identical** to the restore point; the removed copy verifies; **1,935/1,935** retained on those bytes |
| With 4.5.22 | 4.5.22 removed while this stays: this suite **67/67**, older suites **1,899/1,899**. Both removed, either order: **byte-identical** to 4.5.21's `9c749b7d…` (2,846,031 bytes) |
| Dependency on 4.5.15 | With 4.5.22, 4.5.21 and 4.5.16 stripped, 4.5.15's remover **refuses** (exit 2), names this fragment and leaves the tree unchanged. Removing this release, then 4.5.15, builds and verifies |
| Remover fixtures | **45 run, 45 passed, 0 skipped** |
| Ownership scan | Every reference is inside `PART I FEATURE 4.5.23` blocks; exit 0 |
| Recombine / drift / inventory / registry | Exit 0 / exit 0 / no differences / seven seats |

### Deliberately broken builds (one run)

| Mutation | Result | What failed |
|---|---|---|
| Kill switch off | **10/33** | Every feature group |
| Own stylesheet removed | **63/67** | The four geometry checks |
| Spider pays 5 | **66/67** | `DP-PRICE-CLANS` |
| No +5 on the reroll | **63/67** | Reroll total, lower-reroll, wounded reroll, Strength |
| Keep the higher result | **66/67** | `DP-REROLL-LOWER-STANDS` |
| Control on any roll | **66/67** | `DP-MATCH-Control` |
| Insight on an Air Ring roll | **66/67** | `DP-MATCH-Insight` |
| Strength on any roll | **66/67** | `DP-MATCH-Strength` |
| Offered on the Willpower check | **66/67** | `DP-NOT-ON-WILLPOWER-CHECK` |
| Void before Honor | **60/67** | Every Honor-payment check |
| 10 Honor points instead of 5 | **60/67** | The same seven |
| No Round limit on Void | **66/67** | `DP-VOID-ROUND-LIMIT` |
| Use never spent | **58/66** | Paid, spent and manual checks |
| Cancel still charges | **56/61** | Cancel-free and the reroll section |
| Determination +5 | **66/67** | `DP-DET-PAID` |
| Determination on Trait rolls | **66/67** | `DP-DET-KINDS` |
| "Roll without it" keeps the tick | **66/67** | `DP-DET-WITHOUT` |
| Determination unpaid | **65/67** | `DP-DET-PAID`, `DP-DET-SPENT` |
| Paid roll loses its tick | **65/67** | `DP-DET-PAID`, `DP-DET-BREAKDOWN` |
| Precept change resets the use | **66/67** | `DP-CHANGE-KEEPS-USE` |
| Any `remaining` accepted | **65/66** | The unreadable-config section |
| "Ten Dice Rule bonus" label left | **66/67** | `DP-REROLL-LABELLED` |

Found while building and QA-ing:
- **A real bug, found before the first build.** Paying for Determination spends the session use before the dice are read. 4.5.15 keeps armed only the ticks it still offers, so the modifier would have vanished from the very roll that was paid for. The paid roll is now remembered; the "paid roll loses its tick" mutation proves the check catches it.
- **A test gap.** A keep-the-higher implementation passed every reroll check whenever the random reroll happened to be higher. `DP-REROLL-LOWER-STANDS` fixes the dice (original 9s, reroll 1s), and the keep-higher build now fails every time.
- **Intermittent geometry measurement.** `DP-GEOMETRY-1440` failed once with the info button mismeasured, then passed on every later run. It was measured straight after a viewport resize while another suite was running. The check now waits two frames, and it logs the size if it ever fails again.

Inspected at 375px with fallback fonts only: the Perfection row, the result with its reroll button, the confirm dialog, and the reroll result. Physical iPhone testing remains open.

## Run

`NODE_PATH=/opt/node22/lib/node_modules node qa/current-suite-runner.js <built html>`; `qa/verify-variants.py --node <node> --retained`; `qa/test-removal.py`.

## Cost

Exact token counts are not exposed to this session; none is estimated. Production surface: one JS fragment, one stylesheet, one guarded seam block, two manifest entries; two conditional harness corrections in 4.5.15 and 4.5.16.
