# Wizard Skill Remove

**Status, 28 October 2026:** built for Release 7b.1 on branch `claude/release-7b1-2026-10-28`; not merged. Own checks 5/5 on the candidate; removal 6/6; every pinned variant matched. The release's QA folder is `QA — Release 7b.1 2026-10-28`.

Your ruling R21 (desk review, 23 October 2026). In the creation wizard's Skills step, a Skill bought with experience has a Remove button. School Skills and the School's free choices have none. The row goes through its own remove button, so the experience comes back as the sheet recounts the rows.

## How it is built

A UI-agnostic logic part and a replaceable UI part, behind one switch: `WIZARD_SKILL_REMOVE_ENABLED = true` in the first fragment. No save state; nothing is added to a saved character.

- `src/sheet/209.9999999999995-bugfix-wizard-remove-logic.js`
- `src/sheet/209.9999999999996-bugfix-wizard-remove-ui.js`
- `src/css/59.9999999980-bugfix-wizard-remove.css`
- Test seam: the `remove-seam` block in `src/sheet/210-test-seam-and-init.js`.

## Checks

- `qa/wizard-remove-harness.js`: 5/5 on the candidate. On main every check but the error check fails, as pinned.
- Pinned negative variants (`qa/variants.json`, written before the first run; `qa/verify-variants.py`, results in `qa/negative/`):
- **main (baseline):** fails exactly 4 pinned checks.
- **disabled:** fails exactly 4 pinned checks.
- **school-removable:** fails exactly 3 pinned checks.
- Removal (`qa/test-removal.py`): 6/6. Later layers come off first through the removal-chain registry; this layer's remover then rebuilds its predecessor exactly: `935742fd74a55cf60c3e685d5d9790d135feb7351d2b133c6455069624fd3338`, 17,372,358 bytes.
