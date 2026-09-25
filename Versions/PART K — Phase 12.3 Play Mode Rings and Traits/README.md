# PART K — Phase 12.3: Rings & Traits in Play (part 4)

Built 25 September 2026 on the Windows desktop. Part 4 of Phase 12, one part per tab. **Depends on
part 1**, whose gate and registry do the work.

## What the player gets

In **Play**, Rings & Traits is read-and-roll (the owner's ruling):
- the eight **Trait** boxes and five **Ring** boxes show their values as plain text and cannot be
  edited;
- the Void **Ring** − / + steppers are hidden and inert;
- the Void **Point** pips **still spend and restore Void Points**, because that is a play action;
- the Void information button stays.

In **Management** everything works as before. The creation wizard, which sets Traits and the Void
Ring itself, runs in Management.

## How it is built

| Piece | What |
|---|---|
| `src/sheet/209.9999-feat-modes-rings-traits.js` | Registers the Trait and Ring boxes and the Void Ring steppers with part 1's `MODES12.register`. Kill switch `MODES123_ENABLED` |
| `src/css/59.9991-feat-modes-rings-traits.css` | Clears the Ring boxes' inline shading in Play, which part 1's rule cannot outrank without `!important` |
| One delimited block in `210-test-seam-and-init.js` | Guarded seam export |

The tab is drawn once at load, not on every recalc. Its edits run through a delegated click
listener on `#ringsWrap` and input listeners on the Trait boxes, which part 1's capture-phase gate
reaches first.

## QA

Measured on the Windows desktop, 25 September 2026.

| Check | Result |
|---|---|
| Own harness | **16/16**; on part 3's build **8/16** |
| Combined suite | **2,544/2,544** (2,528 retained + 16 new); no earlier check needed changing |
| Removal | **Byte-identical** to `c4ddd6fb…` (part 3's build, 3,088,014 bytes, commit `7ea0b3c`) |
| Removal fixtures | 15 run, 14 pass, 1 skipped (symlink test; Windows) |
| `feature-dependencies.py` | Exit 0 |
| Variants | **6 of 6 as pinned**, including **Void Point pips locked too** (proves the pips stay live) and **Void Ring steppers left out** |

**Found while building:** the part's generator script stopped halfway on a text-pattern mismatch,
after writing the seam block, manifest entries, chain entry and remover but before the fixtures.
Rather than re-run it (which would have inserted the first three twice), the remaining two files
were written by a separate script that first asserted each shared edit was present exactly once.

## Not verified

- ~~Not tried on a real device.~~ **Confirmed on the owner's iPhone, 25 September** (parts 1 to 4 tested together).
- The circular Ring layout (Part D, wide screens only) was not checked in Play at desktop width.
