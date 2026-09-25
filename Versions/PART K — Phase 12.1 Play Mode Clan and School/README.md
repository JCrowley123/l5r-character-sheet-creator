# PART K — Phase 12.1: Clan & School in Play (part 2)

Built 25 September 2026 on the Windows desktop. Part 2 of Phase 12, one part per tab (the owner's
request). **Depends on part 1** (`PART K — Phase 12 Play and Management Modes`), whose gate and
registry do all the work.

## What the player gets

In **Play**, the Clan & School tab is read-only (the owner's ruling):
- the **Clan, Minor Clan, Family and School** pickers show their choice as **plain text**;
- **Apply Family** and **Apply School** are hidden and cannot be triggered, even by a script;
- the Affinity **details** button (Shugenja) stays, because it is information.

In **Management** everything works as before. The creation wizard, the only code that clicks these
controls itself, runs in Management.

## How it is built

| Piece | What |
|---|---|
| `src/sheet/209.9997-feat-modes-clan-school.js` | Registers the six controls with part 1's `MODES12.register`. Kill switch `MODES121_ENABLED` |
| `src/css/59.998-feat-modes-clan-school.css` | The four pickers shown as plain text in Play (no arrow or box, no iOS greying) |
| One delimited block in `210-test-seam-and-init.js` | Guarded seam export (`MODES121_ENABLED`, `MODES121`) |

Marker `PART K PHASE 12.1` / `END MODES121`. No trunk file and no part 1 file is edited.

## QA

Measured on the Windows desktop, 25 September 2026.

| Check | Result |
|---|---|
| Own harness | **14/14**; on the part 1 build **8/14**, failing exactly the six lock checks |
| Combined suite | **2,511/2,511** (2,497 retained + 14 new) |
| Removal | **Byte-identical** to `6c860a52…` (part 1's build, 3,083,017 bytes, commit `2c287da`) |
| Removal fixtures | 15 run, 14 pass, 1 skipped (symlink test; Windows) |
| `feature-dependencies.py` | Exit 0 |
| Variants | **5 of 5 as pinned**: part removed, switch off, Apply School left out, no stylesheet, and the Affinity button wrongly locked |

**Found while building:** two harness errors of my own, both fixed before any number was recorded: a
School name that is not in the library ("Kakita Bushi"), and an event check that re-fired the Clan
picker's change and so reset the School list. The removal fixture's orphan-END test was also
generated with part 1's tag; corrected, 14 of 15 then pass with the usual symlink skip.

## Not verified

- ~~Not tried on a real device.~~ **Confirmed on the owner's iPhone, 25 September** (parts 1 to 4 tested together). Checked in headless Chromium and a 375px screenshot.
- The tab's introduction ("Pick your Clan, Family, and School, then apply each…") still shows in
  Play. Harmless; noted for the later consistency pass rather than changed here.
