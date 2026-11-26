# Removing B18.1 (Release 15b)

B18.1 is one independently removable unit of Release 15b, built on B18 (one name per button job): every Reset, and the buttons on its row, one size.

- **Marker:** `PART H PHASE 15.2.10.1`. The number is a marker only; the unit keeps its identifier.
- **Tag:** `RS15`.
- **Switch:** `RESET_ONE_SIZE_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.99999999999999999993-feat-reset-size.js`. Holds `RS15` and the switch; it only marks the page (`body.rs15-on`). |
| Stylesheet | `src/css/1156-reset-size.css`: the one size, under `body.rs15-on`. |
| Manifest | The two entries naming those files: the stylesheet after B18's (`1155`), the script right after B18's. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `reset-size-seam` (a guarded `Object.assign`), right after B18's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after B18's. |

It adds no save field, no storage key and no element. Its one class is `rs15-on`, on the page's body.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. Remove B18.2 first, if present (the removal chain does this).
3. From this folder, run `python -B qa/remove-phase.py <scratch copy>`.
4. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly B18: on the group's tip (after B18's revision) 17,806,742 bytes, SHA-256 `0a55634f68127cd04150ecc97a31deb9fbd3a1b365489ff907b914555c32754a`; on this unit's own branch `e6755993…c089`. `qa/test-removal.py` proves that rebuild, that B18 removed next gives group 2 as live exactly (`1f002be9…5819`), and that B18 can be removed with this unit kept (`4fde6af4…256c`, 17,776,932 bytes: the Resets keep their words "Reset session" and take this unit's size).

**Switching it off instead:** set `RESET_ONE_SIZE_ENABLED = false`. The body class is not set and every Reset has its own look again.

## Dependencies (declared)

B18.1 is a stylesheet: it calls nothing. Its rules name other releases' classes, so their removers find them in its stylesheet and **refuse while B18.1 is present: remove B18.1 first** (the removal chain does this in order). Found mechanically (`qa/surface-hits.log`); reciprocal notes are in each one's ROLLBACK.

| Release | Classes B18.1 sizes |
|---|---|
| Phase 4.5.23 Dark Paragon (Part I) | `.dp4523-session .dp4523-reset`, `.dp4523-use` |
| Phase 4.5.32 Damage, Sessions and XP (Part I) | `.dsx4532-btn` |
| Phase 4.8 Ancestors (Part I) | `.anc48-session .anc48-session-reset`, `.anc48-session-use` |

It also sizes the trunk's `.combat-round-box button`, Phase 4.5's `.adv-config-reset-session` and Phase 4.5.7's `.unlucky-btn` (Part I); those removers do not name its files.

It does not depend on B18: with B18 removed it still sizes the same buttons (their words are then "Reset session"). It sits on B18's branch because the owner approved it as B18's round 2.

## Harnesses that follow this unit (declared)

**Phase 4.5.23 Dark Paragon (Part I), `qa/dark-paragon-harness.js`.** Only while `RS15` is on the seam, `DP-GEOMETRY-320`, `-375`, `-768` and `-1440` expect Dark Paragon's Use and Reset at this unit's 28 px or more, instead of that release's own 32 px. Same ids and count; with B18.1 removed every line runs as before. Found by the live suite on this unit's build (`README.md`, "Light checks"); every other harness passed.
