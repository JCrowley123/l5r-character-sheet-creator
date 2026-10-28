# Skill List Hides Held Skills

**Status, 28 October 2026:** built for Release 7b.1 on branch `claude/release-7b1-2026-10-28`; not merged. Own checks 12/12 on the candidate; removal 6/6; every pinned variant matched. The release's QA folder is `QA — Release 7b.1 2026-10-28`.

Your ruling R14 (desk review, 23 October 2026). Skills already held leave the Skills page's Add from Skill List (removed, not greyed) and come back when their row goes, is renamed or a character without them loads. Skills taken with a subject stay listed: Lore, Craft, Perform and Games, and Artisan, which the sheet also treats as a subject Skill. The wizard reads the same list, so its Skill pickers follow the same rule.

## How it is built

A UI-agnostic logic part and a replaceable UI part, behind one switch: `SKILL_LIST_HIDES_HELD_ENABLED = true` in the first fragment. No save state; nothing is added to a saved character.

- `src/sheet/209.9999999999989-bugfix-skill-list-logic.js`
- `src/sheet/209.9999999999990-bugfix-skill-list-ui.js`
- Test seam: the `skill-list-seam` block in `src/sheet/210-test-seam-and-init.js`.

## Checks

- `qa/skill-list-harness.js`: 12/12 on the candidate. On main every check but the error check fails, as pinned.
- Pinned negative variants (`qa/variants.json`, written before the first run; `qa/verify-variants.py`, results in `qa/negative/`):
- **main (baseline):** fails exactly 11 pinned checks.
- **disabled:** fails exactly 11 pinned checks.
- **no-subject:** fails exactly 1 pinned check.
- **case-sensitive:** fails exactly 1 pinned check.
- **stale-wizard:** fails exactly 2 pinned checks.
- Removal (`qa/test-removal.py`): 6/6. Later layers come off first through the removal-chain registry; this layer's remover then rebuilds its predecessor exactly: `3002e51e60536c162dd482a0301c12d5d6476088cc7b94c085e11acfb24903db`, 17,357,718 bytes.
