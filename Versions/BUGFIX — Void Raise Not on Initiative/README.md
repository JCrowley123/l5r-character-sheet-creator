# Void Raise Not on Initiative

**Status, 28 October 2026:** built for Release 7b.1 on branch `claude/release-7b1-2026-10-28`; not merged. Own checks 12/12 on the candidate; removal 6/6; every pinned variant matched. The release's QA folder is `QA — Release 7b.1 2026-10-28`.

Your ruling R7 (desk review, 23 October 2026). The Void Point's +1k1 is not spent on an Initiative roll. A +1k1 armed on the Void card is left out of an Initiative roll and stays armed for the next Skill, Trait, Ring or Spell Casting roll; the roll preview no longer offers it on Initiative. Initiative's own Void spend (+10 for the skirmish) is unchanged.

## How it is built

One UI-agnostic part, with nothing on screen of its own to replace, behind one switch: `VOID_RAISE_INITIATIVE_ENABLED = true` in the first fragment. No save state; nothing is added to a saved character.

- `src/sheet/209.9999999999986-bugfix-void-raise-logic.js`
- Test seam: the `void-raise-seam` block in `src/sheet/210-test-seam-and-init.js`.

## Checks

- `qa/void-raise-harness.js`: 12/12 on the candidate. On main every check but the error check fails, as pinned.
- Pinned negative variants (`qa/variants.json`, written before the first run; `qa/verify-variants.py`, results in `qa/negative/`):
- **main (baseline):** fails exactly 11 pinned checks.
- **disabled:** fails exactly 11 pinned checks.
- **all-kinds:** fails exactly 4 pinned checks.
- **drops-ten:** fails exactly 1 pinned check.
- **touch-kept:** fails exactly 2 pinned checks.
- Removal (`qa/test-removal.py`): 6/6. Later layers come off first through the removal-chain registry; this layer's remover then rebuilds its predecessor exactly: `55f9e9ed601e052f3be617c06da51d795ab8f5932e5213d339ef27d6bd21f389`, 17,349,941 bytes.
