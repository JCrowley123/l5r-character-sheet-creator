# Creation Cap of Four

**Status, 29 October 2026:** built for Release 7c on branch `release-7c`; not merged. The release's QA folder is `QA — Release 7c 2026-10-29`.

Your answers Q6 and Q7 (Core p.103). A character is in creation while the creation wizard is open, which is how the sheet already knows it (`CW112.isOpen()`); no flag is added. While it is open, the wizard's + buttons for Traits, the Void Ring and Skills stop at 4 (disabled, with the reason as their title), a raise past 4 by any route through the wizard is refused with "At creation nothing goes above 4 (Core p.103).", and the validator reports each Trait, the Void Ring or a Skill above 4 as a warning (`creation-cap`). Nothing is changed or reported once the wizard closes. The validator's 1-10 range check stays.

## How it is built

One fragment behind one switch, `CREATION_CAP_ENABLED = true`: `src/sheet/209.99999999999998-bugfix-creation-cap.js`, with `RC7Logic` (UI-agnostic: the cap, whether a step may go ahead, the finding's words) and `RC7` (adds the validator rule; wraps `CW112.stepTrait`, `CW1121.stepRank` and `CW112.render`). Test seam: the `cap-seam` block.

Known limits: A value typed on the sheet itself while the wizard is open is not refused; the validator warns of it.

## Checks

- `qa/cap-harness.js`: 11/11 on the candidate.
- Pinned negative variants (`qa/variants.json`, committed before the first run): main (baseline) fails exactly 8 pinned checks; disabled 7; buttons-open 3; step-unguarded 2; skill-unguarded 1; no-warning 1; always-warn 1; cap-five 6. All matched.
- Removal (`qa/test-removal.py`): 6/6. This remover rebuilds `fb265ae38efea844a5d0fa99117c3425b7fb0d86f545d93ca1abf3a25109db65`, 17,415,354 bytes.
