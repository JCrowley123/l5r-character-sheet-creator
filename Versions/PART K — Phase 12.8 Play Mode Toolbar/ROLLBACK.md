# ROLLBACK — PART K — Phase 12.8 the old toolbar replaced

## Switch it off

In `src/sheet/209.99996-feat-modes-toolbar.js` (Phase 0 tree):

```js
const MODES128_ENABLED = true;   // set to false
```

Rebuild with `build/recombine.py`. Nothing is installed: the old toolbar row stays exactly as it
was, no button is moved or relabelled, Save As is not registered with the mode gate, and the
`pm128-enabled` class that activates this part's stylesheet is never set. Boundary-tested.

## Remove it

Use the remover on an external scratch copy only:

```text
python qa/remove-phase.py <scratch-copy>
python <scratch-copy>/build/recombine.py --verify
```

It removes only `src/sheet/209.99996-feat-modes-toolbar.js`, `src/css/59.9996-feat-modes-toolbar.css`,
their manifest entries, and the `modes-toolbar-seam` block in `src/sheet/210-test-seam-and-init.js`
(`// PART K PHASE 12.8 BEGIN modes-toolbar-seam` … `// END MODES128 modes-toolbar-seam`). Later
releases are removed first through the shared removal-chain registry. It never edits the live tree.

Measured against `main` before this part:

| Item | Value |
|---|---|
| Previous build | `6db6ead` (build unchanged since `c4e9464`), 3,109,466 bytes |
| Previous SHA-256 | `47fdb778d72b6febe3a4767a80a94cf1e308eaa25f9316d1cabdd195fc6c6d83` |
| Current build | 3,117,804 bytes |
| Current SHA-256 | `23df67a7cd16b86802cc22967ea5af5fe586fdaccfa504ac79a7b28067734896` |

`qa/test-removal.py` performs that removal on a copy of the live tree and proves the rebuild returns
exactly the previous SHA and size. It also refuses foreign, partial, duplicate, hard-linked,
symlinked and unregistered surfaces before writing anything.

## Outside the build

Not undone by the remover; none is part of the built sheet, and each works with this part present
or removed.

- `QA — Removal Chain Registry/removal_chain.py`: this part's one `Release(...)` line at the end of
  `CHAIN`. Delete it together with this folder.
- `PART K — Phase 11 Characters List and Save Model/ROLLBACK.md` and
  `PART K — Phase 12 Play and Management Modes/ROLLBACK.md`: a paragraph each naming this consumer.
- **Fourteen retained test harnesses, corrected test-only**, because they pressed the old row's
  controls with real clicks (which need them on screen). Every one passes in full with this part
  and against `main` without it (both measured: full suite 2,917/2,917 each way). Verbatim copies
  of the originals are in `originals/`, at the same relative paths:
  - Eleven Phase 4.5.13–4.5.24 harnesses (Named Advantages, Darling of the Court and Servant, Heart
    of Vengeance, Wealthy Koku Grant, Paragon, Soul of Artistry, Void Versatility, Seven Fortunes'
    Blessing, Naishou Citizen, Dark Paragon, Touch of the Spirit Realms): one line each. The saved
    character is now chosen in the old picker by script, as the same harnesses already pressed
    Load. Nothing listens for the picker's change event, so this is exactly what choosing did.
  - Phase 11's `CL-TOOLBAR-BUTTON-FIRST`: the Characters button must still come first, in
    whichever toolbar the page has.
  - BUGFIX — Dependant Inline Typing: Save As and Export JSON are taken from the ⋯ menu when it
    exists; Load is pressed by script.
  - Phase 12.7: Save As from the ⋯ menu when it exists; New Blank (no longer on screen, handler
    kept) pressed by script. Separately, its name is now typed on the Identity page, which found
    that `PM127-OPEN-LIST-OPEN-DATA` had compared two empty names (see the README).

  Restoring the originals is only right once this part is removed.

## Dependencies

**Soft dependency on Phase 11 (Characters list).** This part wraps `CL11.addToolbarButton` by
property and moves `#cl11Toolbar`. Without Phase 11, or with its switch off, there would be no way
to open a character without the old row, so this part installs nothing (boundary-tested with the
list switched off). Remove this part before Phase 11; Phase 11's `ROLLBACK.md` names it.

**Soft dependency on Phase 12 part 1 (`MODES12`).** `#btnSaveAs` is registered with
`MODES12.register` (guarded), which makes Save As a copy inert and hidden in Play. With Phase 12's
switch off the header is still replaced and Save As shows in both modes (boundary-tested,
`--modes-off`). Phase 12's `ROLLBACK.md` names this consumer.

**On the trunk (no declaration needed):** the old toolbar's buttons and their handlers in
`120-persistence.js`, which are moved and relabelled, never changed; the header's `#seal` and
`.titlebar`; `.car-toolbar-rail` from the carousel layer.

Phase-owned names: `MODES128`, `MODES128_ENABLED`, the ids `pm128Actions`, `pm128More`,
`pm128Menu`, and the classes `pm128-enabled`, `pm128-actions`, `pm128-more`, `pm128-more-wrap`,
`pm128-menu`, `pm128-item`. `qa/feature-dependencies.py` reports every reference inside blocks this
part owns.

## Declared dependents (added 9 October 2026)

- Phase 14 Search (Part K) wraps `MODES128.build` to put Search first in the More menu, with its own class (`s14-menu-item`), so this phase's own checks are unchanged (guarded). Removing this phase removes only that menu item.
