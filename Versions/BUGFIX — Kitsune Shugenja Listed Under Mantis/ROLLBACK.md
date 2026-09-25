# ROLLBACK — BUGFIX: Kitsune Shugenja Listed Under Mantis

**Removing this fix puts the School back.** That is what a faithful rollback means: the Mantis Clan
lists Kitsune Shugenja [Mantis] again, first in its list, identical to the Fox Clan's Kitsune
Shugenja.

## Restore point

| | |
|---|---|
| Pre-fix build | `72ea88b789701faa2523b9097b06805d0c5051b0850aaab926e60617a9df8668`, 3,042,795 bytes, commit `bbd7624` |
| Post-fix build | `63b51115800d8788a6d3392ef3af9fca988020ed8ba8cc5954c5d05ec9b6517b`, 3,042,451 bytes |
| Removal rebuild | **byte-identical to the pre-fix build**, measured |

## What it changed

All in `Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for
Maintainability/`:

- `src/sheet/060-lib-schools.js`: **one line deleted**, the School's entry, first in
  `MINOR_CLAN_SCHOOL_LIBRARY`'s `'Mantis'` list. The line is held verbatim in `qa/remove-phase.py`.
- `build/manifest.json`: `expect_sha256` only.

No fragment, no stylesheet, no marked block, no seam key. `qa/feature-dependencies.py` has nothing
to check: there is no fragment and no surface.

## Remove it

On a scratch copy of the Phase 0 tree (the remover refuses the live tree):

```bash
cp -r "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability" /tmp/p0
python3 "Versions/BUGFIX — Kitsune Shugenja Listed Under Mantis/qa/remove-phase.py" /tmp/p0
python3 /tmp/p0/build/recombine.py --verify
```

It puts the line back after `    'Mantis': [`, and refuses, before writing anything, if the School
is already present, if there is not exactly one such list, if it is not inside
`MINOR_CLAN_SCHOOL_LIBRARY`, or if the list no longer starts with Mantis Brawler [Bushi] (it has
changed since, so the old position may be wrong). It then recalculates `expect_sha256`.
`--expect-sha` refuses unless the rebuild hashes to exactly that.

By hand: paste the line from `qa/remove-phase.py` (`LINE`) back as the first entry of the Mantis
list, then rebuild and update `expect_sha256`.

## Dependencies

- **On the trunk:** the School library only.
- **Nothing depends on this fix to work.** Phase 11.2.4 (Wizard Starting Spells for Every School)
  records a spell line for every Shugenja School and has one check,
  `CW5-EVERY-SCHOOL-RECORDED`, that compares its table with the library. With this fix removed
  that check fails naming Kitsune Shugenja [Mantis], which is true: that School would have no line.
  Declared in 11.2.4's ROLLBACK too.

## Later work removed first

`qa/test-removal.py`'s live test and `qa/verify-variants.py` remove Phase 11.2.4 first, with its own
remover, when it is present, so this remover reaches the pre-fix tree. That is only needed to hash
to `72ea88b7…`: this fix's remover works on a tree that still has 11.2.4.

## Fixtures it changed in other phases

**No harness check.** Every retained suite passes unchanged (2,345/2,345).

**The five Part K live removal fixtures.** Each Part K stage's `qa/test-removal.py` proves, on a
copy of the live tree, that removing later stages and then that stage reaches the stage's own
pre-release build exactly. Deleting a library line changes every build under them, so all five
failed after this fix (measured: 11, 11.2, 11.2.1, 11.2.2 and 11.2.3, one error each; the other 29
removal fixtures in `Versions/` pass unchanged). Each now also undoes this fix first, with this
fix's own remover, while it is applied (`LATER_FIXES`), and all five pass 15/15 again. 11.2.3's
gained a `strip_later`, which it did not need before. Declared in each of those ROLLBACKs.
Their "phase removed" variants in `verify-variants.py` needed nothing: they do not pin a hash.

The Import File Picker Filter bugfix (25 September) is listed first in this folder's `LATER_STAGES`, so the
live removal fixture removes it with its own remover before this one. Declared in that fix's ROLLBACK.
