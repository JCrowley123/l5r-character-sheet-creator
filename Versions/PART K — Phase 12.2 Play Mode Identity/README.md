# PART K — Phase 12.2: Identity in Play (part 3)

Built 25 September 2026 on the Windows desktop. Part 3 of Phase 12, one part per tab. **Depends on
part 1**, whose gate and registry do the work.

## What the player gets

In **Play**, the Identity tab is read-only, **except** what the owner ruled stays editable because it
changes during play:
- **Still editable in Play:** Honor points, Glory points, Status points, Taint.
- **Locked in Play (plain text):** Name, Clan, Family, School, Gender, Age, Insight Bonus, Honor /
  Glory / Status **ranks**, XP total and XP adjustment; the computed displays (Rank, Insight, XP
  spent and left) read the same way. **+ Add School** is hidden and inert.

In **Management** everything works as before.

## How it is built

| Piece | What |
|---|---|
| `src/sheet/209.9998-feat-modes-identity.js` | Registers the tab's Management-only fields with part 1's `MODES12.register`. Kill switch `MODES122_ENABLED` |
| `src/css/59.999-feat-modes-identity.css` | Hides the + Add School dropdown in Play; locked number fields lose their spinners |
| One delimited block in `210-test-seam-and-init.js` | Guarded seam export |

**+ Add School:** the sheet re-sets that button's disabled state on every recalc, so in Play it is
kept inert by part 1's gate and hidden by part 1's style, not by `disabled`. The check enables the
button the way a recalc would and shows a click still opens nothing. Back in Management the next
recalc restores its correct state.

## QA

Measured on the Windows desktop, 25 September 2026.

| Check | Result |
|---|---|
| Own harness | **17/17**; on part 2's build **7/17** |
| Combined suite | **2,528/2,528** (2,511 retained + 17 new); no earlier check needed changing |
| Removal | **Byte-identical** to `d6c0c79b…` (part 2's build, 3,085,178 bytes, commit `a3aa5f4`) |
| Removal fixtures | 15 run, 14 pass, 1 skipped (symlink test; Windows) |
| `feature-dependencies.py` | Exit 0 |
| Variants | **6 of 6 as pinned**, including **points locked too** (proves the ruling holds) and **+ Add School left out** |

## Not verified

- **Not tried on a real device.**
- Whether any Identity field is written by a *dispatched event* from the sheet's own code during
  Play: none was found (derived displays are written directly, and a recalc in Play still updates
  them, checked), but only the combined suite covers the wider sheet.
