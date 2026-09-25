# ROLLBACK — QA — Removal Chain Registry

This change touches **no sheet source**, so removing it cannot change the built sheet. It changes
test fixtures in eight other folders, so deleting this folder alone would break them: each would
fail to find `removal_chain.py`.

## To undo it

1. Copy every file under `originals/` back over its counterpart. The paths mirror `Versions/`
   exactly (`originals/<folder>/qa/<file>` goes to `Versions/<folder>/qa/<file>`). These are the 14
   fixture files as they were at commit `ac9d58a`, before this change.
2. **Add back by hand any release registered after this one.** Every entry after
   `BUGFIX — Import File Picker Filter` in `CHAIN` was never in the restored lists. Each earlier
   folder's `test-removal.py` then needs it in `LATER_STAGES` (or `LATER_FIXES` for a text-only fix),
   and its `verify-variants.py` in `LATER_STAGES`, newest first: the old per-folder chore this
   registry replaced.
3. Delete this folder.
4. Run the eight `test-removal.py` suites (the folders listed below). Each must pass.

The whole-file restore in step 1 is safe only while no later release has edited those 14 files
itself. With the registry in place none should need to; check `git log` on them before restoring.

## What it changed elsewhere (declared here and in each folder's ROLLBACK)

| Folder | Files |
|---|---|
| PART K — Phase 11 Characters List and Save Model | `qa/test-removal.py`, `qa/verify-variants.py` |
| PART K — Phase 11.2 Creation Wizard | `qa/test-removal.py`, `qa/verify-variants.py` |
| PART K — Phase 11.2.1 Wizard Skills and Advantages | `qa/test-removal.py`, `qa/verify-variants.py` |
| PART K — Phase 11.2.2 Wizard Free Choices Spells and Kiho | `qa/test-removal.py`, `qa/verify-variants.py` |
| PART K — Phase 11.2.3 Wizard Starting Spells | `qa/test-removal.py`, `qa/verify-variants.py` |
| PART K — Phase 11.2.4 Wizard Starting Spells for Every School | `qa/test-removal.py` |
| BUGFIX — Kitsune Shugenja Listed Under Mantis | `qa/test-removal.py`, `qa/verify-variants.py` |
| BUGFIX — Import File Picker Filter | `qa/test-removal.py` (its lists were empty) |

In each, the `LATER_STAGES` / `LATER_FIXES` tuples and the body of `strip_later` were replaced by
`THIS_RELEASE`, a `_removal_chain()` locator and a one-line call. Nothing else in those files
changed; `git diff ac9d58a -- <file>` shows exactly that.

## Dependencies

- **Every release in `CHAIN` depends on this folder for its live removal fixture** from here on.
  Declared in each of their ROLLBACKs.
- This folder depends on nothing but the releases it lists: their `qa/remove-phase.py` files.
