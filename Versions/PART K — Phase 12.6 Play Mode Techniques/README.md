# PART K — Phase 12.6: Techniques in Play

Built 25 September 2026 on the Windows desktop. Phase 12's Techniques tab, built before Advantages &
Disadvantages at the owner's choice; **12.5 stays reserved for Advantages & Disadvantages**. The
removal chain records build order, so the gap in numbering is harmless. **Depends on part 1.**

## What the player gets

In **Play**, Techniques is read-and-use (roadmap, Phase 12):
- each entry's **name, XP and description** show as plain text and cannot be changed; its **remove**
  button is hidden; a spell's **memorised** tick cannot be changed;
- the **Techniques picker**, the **Alternate Path picker** and **Add** are hidden;
- a spell's **Cast** button still works, and so do **Why can't I cast this?** and the Kiho rules
  button.

**The Advantages tab is not touched**: its rows are built by the same function with the same
classes, so every selector here is scoped to `#techList`, and a check proves no Advantage control
matches it.

## How it is built

| Piece | What |
|---|---|
| `src/sheet/209.99992-feat-modes-techniques.js` | Registers the tab's pickers, Add and entry controls with part 1's `MODES12.register`. Kill switch `MODES126_ENABLED` |
| `src/css/59.9993-feat-modes-techniques.css` | Hides the pickers and remove buttons in Play; XP shown as a value; the memorised tick without the disabled fade |
| One delimited block in `210-test-seam-and-init.js` | Guarded seam export |

## QA

Measured on the Windows desktop, 25 September 2026.

| Check | Result |
|---|---|
| Own harness | **16/16** |
| Combined suite | **2,577/2,577** (2,561 retained + 16 new); no earlier check needed changing |
| Removal | **Byte-identical** to `4ac2b09f…` (part 5's build, 3,093,125 bytes, commit `adb65d6`) |
| Removal fixtures | 15 run, 14 pass, 1 skipped (symlink test; Windows) |
| `feature-dependencies.py` | Exit 0 |
| Variants | **6 of 6 as pinned**, including **rows not scoped to Techniques** and **Cast locked too** |

**Found while building:**
- **Marker-shaped prose.** The fragment's first comment said "The Techniques part of Phase 12", which
  the case-insensitive marker pattern reads as a phase marker ("part of Phase 12"). The remover
  refused the fragment, as designed. Reworded to "Phase 12's Techniques tab"; `CLAUDE.md` already
  warns of this trap, and it has now been hit a fourth time.
- **A harness blind spot.** One check clicked Add and a remove button and compared the entry count:
  with the part removed, the two cancelled out and the check passed. Split into two checks, each
  measured against the count just before its own click; both now fail with the part removed.

## Not verified

- ~~Not tried on a real device.~~ **Confirmed on the owner's iPhone, 25 September.**
- Kiho and Kata entries were checked as plain entries; a monk's Kiho-specific controls, if any, were
  not rendered.
