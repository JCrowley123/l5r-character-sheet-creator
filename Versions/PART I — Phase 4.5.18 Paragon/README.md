# Phase 4.5.18 — Paragon

A09: one tenet of Bushido saved on the Paragon row, with a badge, an accurate reminder of what that tenet gives, and Lion pricing. **Implemented and verified, 23 September 2026.**

## Behaviour

| Situation | What happens |
|---|---|
| Add Paragon | The shared modal lists the seven tenets **in printed order** (Compassion, Courage, Courtesy, Duty, Honesty, Honor, Sincerity), each with its benefit. **Nothing is preselected**; Confirm without a choice shows an inline error and saves nothing |
| Confirmed | The row shows the tenet as a badge, a **Change** button, a circled-i information button, and one reminder line: the tenet's benefit plus "+1 Honor whenever you gain Honor for showing <tenet> — add it yourself." |
| Price | **7 XP, or 6 for a Lion character** (Core p.152). Changing the Clan reprices the row on the next recalculation. An unconfigured row is priced the same way |
| Change / Cancel | Change opens the picker on the current tenet; Confirm replaces it; ✕ keeps the saved tenet |
| Dice, Void, Honor | **None changed.** The approved scope is reminder only: no roll modifier, no Void option, no Honor award. Measured: the pre-roll modifiers for eight roll kinds (including Etiquette, Sincerity (Honesty), Willpower, Void, an attack, a spell, a manual roll and Initiative) are identical with and without each tenet, and no character field other than XP moves |
| Save, export, import, local reload | Round-trip unchanged |
| Older save with Paragon but no tenet | Row asks "Choose your tenet of Bushido"; nothing is assumed |
| Unreadable saved setting (unknown tenet, wrong case, revision 2, extra field, or the Disadvantage-side `tenetPick` type) | Kept exactly, flagged "Saved setting kept", its saved cost kept, no reminder |
| Paragon on the Disadvantage list | "This entry belongs in Advantages", no picker |
| Renamed away from Paragon, or another entry renamed to Paragon | Stale configuration cleared, as for every other configured entry |
| Dark Paragon | Untouched: a different catalogue row, matched by exact name only |

**The record:** `{type:'paragonTenet', revision:1, tenet:'<Tenet>', value:'<Tenet>'}` in the row's own config. The type is `paragonTenet`, **not** the audit's suggested `tenetPick`, because `tenetPick` is already Failure of Bushido's type on the Disadvantage side (Phase 4.5.2); sharing it would let one handler read the other's saves. `value` is the legacy display field every configured row carries.

Source: Core printed p.152 / PDF p.155, as extracted in `SOURCE-CORE-PREPARATION.md` (A09): cost 7, Lion 6; +1 Honor on top of any Honor gained for showing the chosen virtue; the seven tenet benefits. Approved scope from the same note: "a tenet picker, saved selection, badge and concise accurate reminder. Honor awards stay player controlled."

**Not built, deliberately:** per-tenet automation (each needs its own assessment, per the note above), and Core p.148's set rule that Paragon cannot be held with Dark Paragon or Failure of Bushido. The sheet has no mechanism for those set rules today, and the GM may override them; this release neither adds one nor claims to.

Restore point recorded before any edit: commit `bfd82eef4fa38b516bfea36cd38a031adf4bccbc` (4.5.17), **2,767,985 bytes**, SHA-256 `be9076cfbebc3fac31641a03fab82508b35a7c06caf961e347e546151930115a`, **1,584/1,584**.

## Measured QA — 23 September 2026

Final Phase 0 output: **2,780,550 bytes**, SHA-256 `96dda731ef0cf9670fe2c65763bf28e2a73698972e7d8f49014ac598c728385a` (pinned).

| Check | Measured result |
|---|---|
| New real-browser suite | **80/80**: every tenet's benefit text checked against the source table (not against `P4518`), all seven badges and reminders, Lion/Crab/Crane prices, no dice/Void/field change for any tenet, export/import and local-storage reload, five unreadable-config cases plus an unconfigured (legacy) row and a wrong-side row, geometry at 320/375/768/1440 px |
| Full combined suite | **1,664/1,664** = 1,584 retained + 80; **no retained check changed** |
| Surgical removal | **Byte-identical** to the restore point (2,767,985 bytes, `be9076cf…`); the removed copy verifies; **1,584/1,584** retained on those bytes |
| Removal order with 4.5.17 | 4.5.17 removed while this stays: this suite **80/80**, older suites **1,497/1,497**. Both removed, either order: byte-identical to 4.5.16's `0aefe9c9…` (2,753,162 bytes) |
| Remover fixtures | **45 run, 45 passed, 0 skipped** |
| Ownership scan | 15 surface names, every reference inside `PART I FEATURE 4.5.18` blocks; exit 0 |
| Recombine / drift / inventory / registry | Exit 0 / exit 0 / no differences (270 unique IDs, 10 sections, 26 roll-modal overlays) / seven seats |

### Deliberately broken builds (one run, about 7 minutes including the retained suites)

| Mutation | Result | What failed |
|---|---|---|
| Kill-switch off | **2/11** | Every feature group; only the registry count and "no browser errors" still pass |
| Own stylesheet removed | **76/80** | The four geometry checks |
| Lion price removed | **78/80** | `P-PRICE-LION`, `P-LEGACY-LION` |
| First tenet preselected | **73/76** | `P-NONE-PRESELECTED`, `P-REQUIRES-CHOICE` (the picker section then aborts) |
| Confirm without a choice takes the first tenet | **74/76** | `P-REQUIRES-CHOICE` (section aborts) |
| Tenet matched case-insensitively | **79/80** | `P-INVALID-CASE` |
| Extra config fields accepted | **79/80** | `P-INVALID-EXTRA` |
| Future revision accepted | **79/80** | `P-INVALID-FUTURE` |
| Courtesy given Sincerity's benefit | **78/80** | Courtesy's option and reminder |
| "+1 Honor" line dropped | **73/80** | All seven reminders |
| Row information button dropped | **79/80** | The info section |

Found while writing the harness: selecting a tenet by visible text is unsafe here, because two benefit texts name other tenets (Courtesy's mentions "honor", Honesty's "Sincerity (Honesty)"). The harness selects by the radio's exact value; the picker itself was never affected.

Added before the final run: `P-DARK-PARAGON-NOT-CLAIMED` (Dark Paragon is a separate row) and `P-LEGACY-LION` (an unconfigured Lion row is priced 6, the same repricing rule 4.5.16 applies for Spider).

The picker, row and reminder were inspected at 375px with fallback fonts only (this sandbox cannot load the sheet's webfonts). Physical iPhone testing remains open.

## Run

`NODE_PATH=/opt/node22/lib/node_modules node qa/current-suite-runner.js <built html>`; `qa/verify-variants.py --node <node> --retained`; `qa/test-removal.py`.

## Cost

Exact token counts are not exposed to this session; none is estimated. Production surface: one JS fragment, one stylesheet, one guarded seam block, two manifest entries.
