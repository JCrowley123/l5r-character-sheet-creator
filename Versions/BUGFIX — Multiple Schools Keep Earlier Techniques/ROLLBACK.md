# ROLLBACK — BUGFIX — Multiple Schools Keep Earlier Techniques

## Surgical removal (the method)

On a **scratch copy** of the Phase 0 tree, never the live one:

```bash
python "Versions/BUGFIX — Multiple Schools Keep Earlier Techniques/qa/remove-phase.py" <copy> [--dry-run] [--expect-sha SHA]
python <copy>/build/recombine.py
```

It removes exactly:

| What | Where |
|---|---|
| `src/sheet/209.999991-bugfix-multiple-schools-techniques.js` | the whole fragment, and its manifest entry |

Nothing else: the fix adds no block to any shared file, no CSS, no markup and no seam key. The
fragment is delimited `BUGFIX MSTECH` … `END BUGFIX MSTECH`. It rebinds one trunk function,
`applyUnlockedTechniquesToList()` (`070-schools-paths-techniques.js`); deleting the fragment leaves
the trunk's own function in force. The remover preflights everything before writing, refuses the
fragment holding any other marker, refuses any retained source that still names the fix's marker or
its surface (`MSTECH_ENABLED`, `MSTECH_ROW_PREFIX`, `msTechTrunkApply`, `msTechSchoolNames`,
`msTechTaggedSchool`, `msTechClearDroppedSchools`), and refuses the live tree, its parents, a
symbolic link, and any file that is the live tree's own file under another name.

**Measured on 1 October 2026:** removal rebuilds **byte-identical** to the build before the fix,
`f4345b4aa63dc9a1e0e61e01fd83fdbb95a296701ecaa84650e1909c44119760`, 3,256,563 bytes, on the first
attempt. The remover's own fixtures: 12 tests, 11 passed, 1 skipped (the symlink test; Windows
refuses symlinks without Developer Mode).

**Kill switch:** `const MSTECH_ENABLED = true;` in the fragment. Off, the trunk's function runs
untouched (measured: that variant fails exactly the eleven checks the removed build fails).

## What removing it does

Adding a School through Multiple Schools strips the earlier School's granted Techniques (and a
monk's free Kiho picks) again, the moment the new School unlocks. A save made with the fix keeps the
rows it already holds: removing the fix deletes nothing from a stored character until that character
next adds or changes a School.

## Saved data

None changed. The fix writes no new field and changes no field's shape. On the one call where an
earlier School is kept, it writes `null` to `f_schoolTechGranted` before the trunk runs; the trunk
then records the new School's grant in its usual `{school, techs}` shape, so the saved value is
always one the trunk itself would write.

## Dependencies

| On | What it uses | Without it |
|---|---|---|
| The trunk (`070-schools-paths-techniques.js`, `050-kiho-rules.js`) | `applyUnlockedTechniquesToList`, `getSchoolTechGranted`, `saveSchoolTechGranted`, `getSchoolsList`, `allSchoolEntries`, `kihoRows`, `kihoRowIsFree` | Core sheet code; not removable on its own |
| Phase 12 (Part K) | nothing | measured: Phase 12's modes switched off, the harness reads 32/32 |

**Who depends on this fix:** nothing yet. Phase 4.6's first release (planned next) will key a taken
Alternate Path to the School it was taken in; it is designed to work with or without this fix, and
its own ROLLBACK will say so.

**Removal order.** Registered in `QA — Removal Chain Registry` after BUGFIX — Manage Button Clipping,
so every earlier release's live-tree fixture removes this fix first. Measured with it in the tree:
the Manage fix's removal tests 11 (10 passed, 1 skipped), Phase 4.8's 20 (19 passed, 1 skipped),
Phase 11's 15 (14 passed, 1 skipped); the registry's own checks 11/11. The copy of `removal_chain.py`
from before this fix is in `originals/`.

## Restore points

| | |
|---|---|
| Phase 0 build before this fix | `f4345b4aa63dc9a1e0e61e01fd83fdbb95a296701ecaa84650e1909c44119760`, 3,256,563 bytes (`main` at `a3e85df`) |
| Phase 0 build with this fix | `7daf6aec5558807f81aa4f0b436df4c2332ddd4624eea4e52e85aa044ee68677`, 3,260,361 bytes |
| `window.__L5R_TEST__` | unchanged: the fix adds no key |
