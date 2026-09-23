# Phase 4.5.20 — Void Versatility

A14 (The Great Clans p.199): a Shugenja with a Void Affinity picks one non-Void Ring; that Ring's spell slots may then pay for Void spells. **Implemented and verified, 23 September 2026.**

## Behaviour

| Situation | What happens |
|---|---|
| Add Void Versatility | The shared modal offers Air, Earth, Fire, Water (never Void); nothing preselected; a choice is required |
| Price | Fixed **4 XP** |
| Eligibility | **Shugenja with a Void Affinity**, read live from the sheet's own School data (`characterCasterLock()` and the active School's Affinity). In the School library that is only **Isawa Shugenja with Void chosen** (measured: no School has a fixed Void Affinity). **Uncentered** forbids it. An ineligible character sees the entry greyed out in the quick-add picker ("— Shugenja with Void Affinity only" / "— not with Uncentered"), the owner's standard for gated entries |
| Configured but no longer eligible (School or Affinity changed, Uncentered added) | Row keeps its Ring and its 4 XP, the badge is struck through, and the reminder says why it is not in effect; Void spells are paid with Void slots only |
| Casting a Void spell | **Before any slot is spent**, the trunk's own three-way dialog asks: **Use Air slot (n of m left)**, **Use Void slot (…)** — or, when the Void slots are gone, **Use Bonus slot (…)**, which runs the trunk's unchanged bonus-slot flow — or ✕, which cancels with nothing spent |
| Paid with the Ring | Exactly **one** slot of that Ring is marked used. Void slots, the shared Bonus pool, every per-element bonus fill counter, Void Points and the other Rings are untouched. The Casting Roll is the ordinary **Void** Casting Roll — identical dice, same title, Void Ring and School Rank — with one line in the preview ("Void Versatility — paid with an Air slot") and the result title saying which slot paid |
| The Ring has no slot left (including pips filled by hand) | No question; the ordinary Void flow runs exactly as before |
| No Void or Bonus slot left | A two-button prompt offers only the Ring (or Cancel) |
| Why Can't I Cast This? (Phase 8, Part J) | When Void and Bonus slots are gone but the Ring still has some, its "No spell slots left" blocker is shown as lifted, naming the Ring |
| Non-Void spells, Universal spells, Maho | Unchanged — no question is asked |
| Save, export, import, local reload | Round-trip unchanged. Only the Ring choice is stored; slot usage stays in the sheet's existing counters (no new pool) |
| Unreadable saved setting (Void as the Ring, wrong case, revision 2, extra field, the base `ringPick` type), wrong list, renamed row | Kept and flagged, or cleared, exactly as for every other configured entry; no payment choice is offered |

**The record:** `{type:'voidVersatilityRing', revision:1, ring, value}`. Not the audit's suggested `ringPick`: the base release validates any `ringPick` itself (any non-empty value passes), so this release's own validation would never run — the same reason Paragon took its own type.

**Where the question is asked — a deliberate deviation from "in the casting preview".** `castSpell()` spends the slot *before* the roll preview (Phase 3, Part G) opens, and the trunk has no refund path, so asking inside the preview would mean spending first and un-spending on a change of mind. The question is asked at the moment `castSpell()` already asks its own bonus-slot question, with the trunk's own dialog, and the preview then states which slot paid.

**The "mixed manual/overflow slot-accounting" report** the audit asks to be covered first is not described anywhere in the repository, so it was not reproduced. What this release guarantees and checks instead: it writes **only** the chosen Ring's `spell_used_<ring>` counter, never the shared bonus pool or any per-element bonus fill counter, and it counts pips filled by hand (`VV-MANUAL-PIP-COUNTED`, `VV-RING-EMPTY-ORDINARY`).

Restore point recorded before any edit: commit `46b15b41a199f2f227f39dd83b1a5ab49155bc67` (4.5.19), **2,798,717 bytes**, SHA-256 `2b69794dcd3bf9d70b8a1676a4f9cb734cf1f4b0ecf7d40b0396d0bae8ef0c3e`, **1,756/1,756**.

## Measured QA — 23 September 2026

Final Phase 0 output: **2,820,250 bytes**, SHA-256 `106833069f5bf72a69b185b9d29c85c7f0d1cbf6748bff2195a2581b5d1e8e79` (pinned).

| Check | Measured result |
|---|---|
| New real-browser suite | **66/66**. Slot state read from the trunk's hidden counters. The Ring-paid roll is compared with an **ordinary Void cast by the same character without the Advantage** (same dice, same kept), so the roll oracle does not come from this release. All four Rings; every payment route; ✕; manual pips; exhausted pools; eligibility for five School/Affinity cases plus Uncentered; Phase 8 lift; persistence; geometry at four widths including the dialog |
| Full combined suite | **1,822/1,822** = 1,756 retained + 66 |
| Retained checks corrected (declared) | Two, both conditional on this release and passing both ways (1,756/1,756 with it present; the same suites on the removed build): Phase 8's (Part J) registry list now expects `void-versatility` after the seven built-ins when this release is present; 4.5.5's `GATES455-GATE-04` now expects **two** gated Advantages for a character with no School when it is present (Friendly Kami and this), one otherwise |
| Surgical removal | **Byte-identical** to the restore point; the removed copy verifies; **1,756/1,756** retained on those bytes |
| Removal order with 4.5.19 | 4.5.19 removed while this stays: this suite **66/66**, older suites **1,664/1,664**. Both removed, either order: byte-identical to 4.5.18's `96dda731…` |
| Remover fixtures | **45 run, 45 passed, 0 skipped** |
| Ownership scan | 17 surface names, every reference inside `PART I FEATURE 4.5.20` blocks; exit 0 |
| Recombine / drift / inventory / registry | Exit 0 / exit 0 / no differences / seven seats |

### Deliberately broken builds (one run)

| Mutation | Result | What failed |
|---|---|---|
| Kill-switch off | **15/35** | Every feature group |
| Own stylesheet removed | **62/66** | The four geometry checks |
| Ring slot not debited | **61/66** | Every Ring-paid debit check |
| Void slot debited as well | **61/66** | Every Ring-paid debit check |
| Cast as the Ring's element | **58/66** | Every "same Void roll" check |
| ✕ pays with the Ring | **65/66** | `VV-X-SPENDS-NOTHING` |
| Affinity not checked | **59/64** | Picker, row, cast and diagnostic eligibility checks |
| Uncentered ignored | **64/66** | Both Uncentered checks |
| Void accepted as the Ring | **64/66** | The two invalid-Ring checks |
| Non-Void spells also ask | **59/60** | The non-Void section |
| Asks when the Ring is empty | **57/61** | The empty-Ring and unaffected-spell checks |
| Phase 8 lift missing | **65/66** | `VV-DIAG-LIFTED` |
| Picker gate missing | **61/66** | Every picker check |
| Future revision accepted | **60/63** | `VV-INVALID-FUTURE` and the sections after it |

Inspected at 375px with fallback fonts only. Physical iPhone testing remains open.

## Open reminder — not this release

A Rank 0 skill rolled from the Skill table is labelled "Unskilled" but its 10s explode (trunk `rollSkill()` passes no `explode:false`). Found during 4.5.19, deferred at the owner's request, and recorded in the ledger's open reminders. It wants its own BUGFIX folder.

## Run

`NODE_PATH=/opt/node22/lib/node_modules node qa/current-suite-runner.js <built html>`; `qa/verify-variants.py --node <node> --retained`; `qa/test-removal.py`.

## Cost

Exact token counts are not exposed to this session; none is estimated. Production surface: one JS fragment, one stylesheet, one guarded seam block, two manifest entries.
