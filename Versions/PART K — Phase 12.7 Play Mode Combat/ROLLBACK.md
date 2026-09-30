# ROLLBACK — PART K — Phase 12.7 Combat in Play only

## Switch it off

In `src/sheet/209.99995-feat-modes-combat.js` (Phase 0 tree):

```js
const MODES127_ENABLED = true;   // set to false
```

Rebuild with `build/recombine.py`. Nothing is installed: Combat shows in both modes, the Combat page
gets no `data-visible-with`, no gate element is created, and the `pm127-enabled` class that
activates this part's print rule is never set, so the stylesheet matches nothing. Boundary-tested.

## Remove it

Use the remover on an external scratch copy only:

```text
python qa/remove-phase.py <scratch-copy>
python <scratch-copy>/build/recombine.py --verify
```

It removes only `src/sheet/209.99995-feat-modes-combat.js`, `src/css/59.9995-feat-modes-combat.css`,
their manifest entries, and the `modes-combat-seam` block in `src/sheet/210-test-seam-and-init.js`
(`// PART K PHASE 12.7 BEGIN modes-combat-seam` … `// END MODES127 modes-combat-seam`). Later
releases are removed first through the shared removal-chain registry. It never edits the live tree.

Measured against `main` before this part:

| Item | Value |
|---|---|
| Previous build | `ca152c3`, 3,104,431 bytes |
| Previous SHA-256 | `2c8a426f85d00d1637a9ec48453ac01b3600b5193494aae342f3b5113e3c4fc6` |
| Current build | 3,109,466 bytes |
| Current SHA-256 | `47fdb778d72b6febe3a4767a80a94cf1e308eaa25f9316d1cabdd195fc6c6d83` |

`qa/test-removal.py` performs that removal on a copy of the live tree and proves the rebuild returns
exactly the previous SHA and size. It also refuses foreign, partial, duplicate, hard-linked,
symlinked and unregistered surfaces before writing anything.

## Outside the build

These are not undone by the remover. None is part of the built sheet, and each works with this part
present or removed.

- `QA — Removal Chain Registry/removal_chain.py`: this part's one `Release(...)` line at the end of
  `CHAIN`. Delete it together with this folder.
- `PART K — Phase 12 Play and Management Modes/ROLLBACK.md`: one paragraph naming this consumer.
- **Three retained test harnesses, corrected test-only** because they assumed Combat is always
  reachable from a fresh page, which opens in Management. Each still passes in full with this part
  removed (measured against the `main` build above). Verbatim copies of the originals are in
  `originals/`:
  - `Part H — Sheet UI-UX/PART H — Phase 1.6 Combat Tab Streamlining/qa/wound-bar-harness.js`:
    enters Play to open Combat, and Management only for its Stamina/Willpower fixture writes, which
    Play locks. Same 23 checks, same named results as the original on `main`.
  - `BUGFIX — Spell Slots Tab Visibility Race/qa/spell-slots-visibility-harness.js`: enters Play
    after its Management-only Apply School and before tapping through four tabs including Combat.
  - `BUGFIX — Spell Slots Tab on Safari/qa/safari-tab-harness.js`: its hidden-page count discounts
    Combat only when this part has hidden it, so the count still means "hidden other than by the
    mode". Unchanged when this part is absent.

  Restoring the originals is only right once this part is removed; with it present they fail.

## Dependencies

**Hard dependency: Phase 12 part 1 (`MODES12`).** This part wraps `MODES12.refresh` by property and
reads `MODES12.isPlay()` and `MODES12_ENABLED`; with the parent's switch off it installs nothing
(boundary-tested). Remove this part before Phase 12 part 1; that part's `ROLLBACK.md` names it.

**On the trunk (no declaration needed):** the carousel's conditional-page path
(`data-visible-with`, `refreshVisibility()`, `getActiveTab()`, `goToTab()`) and its `.car-track`
element, from the Part D carousel layer, and the print unwind in `20-carousel.css`. The carousel
itself is not edited.

**No dependency on Phase 12.5, the Dependant bugfix or Spell Slots.** Spell Slots keeps its own
`data-visible-with`; the two conditional pages are independent (tested together, with and without
the Safari emulation rule).

Phase-owned names: `MODES127`, `MODES127_ENABLED`, the element id `pm127CombatShown` and the class
`pm127-enabled`. `qa/feature-dependencies.py` reports every reference inside blocks this part owns.
