# School List Gender Tick

**Status, 28 October 2026:** built for Release 7b.1.1 on branch `claude/release-7b1-1-2026-10-28`; not merged. The release's QA folder is `QA — Release 7b.1.1 2026-10-28`.

Device check D1 of Release 7b.1 (found on the checklist walk, 28 October 2026). With Gender `Female` in Identity, choosing the Lion's Pride from Techniques → Advanced School left "My character is female…" unticked, with no line under it, until the Gender was edited again. Now the box is ticked and greyed with "Your Identity says Female, which meets this." as soon as the School is chosen from the list; Male and an empty Gender show their lines as well.

## How it is built

One fragment behind one switch, `SCHOOL_LIST_GENDER_ENABLED = true`. No save state.

- `src/sheet/209.99999999999991-bugfix-school-list-gender.js`
- Test seam: the `list-gender-seam` block in `src/sheet/210-test-seam-and-init.js`.

The Advanced School list's own `change` listener (`209.999999-feat-advanced-schools.js`) holds `AS47.renderChoice` from before R15's layer (GI7) wraps it, so the list never reached GI7's paint. This layer adds its own `change` listener on the list, registered after the original, which paints the boxes through `GI7Ui.paint()`. Begin training was already right on main (it reads GI7's `uiChoices`, which counts what Identity meets); only the box and its line were missing. The layer turns itself off when R15's layer is absent or switched off.

## Checks

- `qa/list-gender-harness.js`: every School is chosen through the real list (Playwright `selectOption`), never by calling `AS47.renderChoice()`. Uses the 7b.1 Matsu test character (`qa/7b1-checks-matsu.l5r.json`).
- Own checks 8/8 on the candidate, and 8/8 at 4× CPU throttling. On main, GP-ENABLED, GP-FEMALE, GP-MALE, GP-EMPTY and GP-ONE-NOTE fail, as pinned; GP-FEMALE fails only on the box and its line, because Begin training was already enabled.
- Pinned negative variants (`qa/variants.json`, written before the first run; `qa/verify-variants.py`, results in `qa/negative/`): **main (baseline)** and **disabled** fail exactly 5 pinned checks; **no-paint** fails exactly 4.
- One variant was retired after its first run. **no-button** (no Begin training rework after the paint) was pinned to fail GP-FEMALE but passed 8/8 (`qa/negative-first-run/`): the rework could never change the button, because GI7's `uiChoices` already counts what Identity meets. The rework was taken out of the layer, so the variant has nothing left to mutate.
- Removal (`qa/test-removal.py`): 6/6. The two later 7b.1.1 layers come off first; this layer's remover then rebuilds main exactly.
