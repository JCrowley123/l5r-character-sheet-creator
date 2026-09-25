# PART K — Phase 12.4: Skills in Play (part 5)

Built 25 September 2026 on the Windows desktop. Part 5 of Phase 12, one part per tab. **Depends on
part 1**, whose gate, registry and new-row observer do the work.

## What the player gets

In **Play**, Skills is read-and-roll (roadmap, Phase 12):
- each row's **name, Trait, Rank, School tick and Emphases** show as plain values and cannot be
  changed; the row's **remove** and **+ Emph** buttons are hidden;
- **Add Skill**, **Load Full Skill List** and the Add Skill picker are hidden;
- each row's **d10 still rolls**, the **Untrained Skills** list still rolls, and **Skill Info** still
  opens.

In **Management** everything works as before.

## How it is built

| Piece | What |
|---|---|
| `src/sheet/209.99991-feat-modes-skills.js` | Registers the row controls and add controls with part 1's `MODES12.register`. Kill switch `MODES124_ENABLED` |
| `src/css/59.9992-feat-modes-skills.css` | Hides the Add Skill picker and the rows' remove and + Emph buttons (the sheet's own table rules outrank part 1's generic button rule, so `!important` and the table's ID); Emphasis dropdowns and Ranks shown as plain values |
| One delimited block in `210-test-seam-and-init.js` | Guarded seam export |

Rows are rebuilt all the time; part 1's observer locks new ones as they appear (checked: a row added
by a load while in Play is locked). The d10 sits in its own cell, outside every locked control.

## QA

Measured on the Windows desktop, 25 September 2026.

| Check | Result |
|---|---|
| Own harness | **17/17**; on part 4's build **8/17** |
| Combined suite | **2,561/2,561** (2,544 retained + 17 new); no earlier check needed changing |
| Removal | **Byte-identical** to `f3174bba…` (part 4's build, 3,089,890 bytes, commit `6184ee5`) |
| Removal fixtures | 15 run, 14 pass, 1 skipped (symlink test; Windows) |
| `feature-dependencies.py` | Exit 0 |
| Variants | **6 of 6 as pinned**, including **d10 locked too** (proves rolling stays live) |

**Found while building:**
- Part 1's hide rule for locked buttons lost to the Skills table's own rules; the remove and + Emph
  buttons stayed visible in Play until this part added its own stronger rule. The harness caught it.
- A harness timing error of my own: it typed into a Rank before Apply School had finished, and Apply
  School's later steps reset the value. The helper now waits for Apply School's completion message.
- With this part's stylesheet removed, a Rank still loses its spinner, because part 3's generic rule
  for locked number fields covers it. So the plain-value check cannot tell this part's rule from
  part 3's; declared rather than hidden.

## Not verified

- **Not tried on a real device.**
- The Emphasis dropdown's plain-text look was not checked in a screenshot.
