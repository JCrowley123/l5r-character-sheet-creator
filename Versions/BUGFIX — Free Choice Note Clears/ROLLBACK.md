# Rollback

Quickest: set `FREE_CHOICE_OPEN_ONLY_ENABLED = false` and rebuild. The character check's free-choice note is then
always on, as in Release 8a ("Bayushi Bushi: 1 free Skill choice"), whether or not the choice has been made.

Full removal: run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, never the live one (it refuses the live
tree). It removes this layer's fragment (`src/sheet/209.999999999999999-bugfix-free-choice-note.js`), its manifest entry
and the `free-choice-seam` block in `src/sheet/210-test-seam-and-init.js`; the rebuild is then exactly Release 8a.1 with
the Overspend One Line layer only, `6488c37c6bbc967b4f31a8574a09b7050cde7fdc35f92fbf3b17388d361003bf`, 17,455,125 bytes.
Removing both 8a.1 layers rebuilds Release 8a's build exactly (`2a9f66ed…`, 17,452,358 bytes).

## Dependencies

- **On Phase 5 (Part J), the character check:** rebinds `school-choice-slots`' `fn` in `CHARACTER_VALIDATOR_RULES` by
  property and delegates to the previous one; reads `validatorSchoolEntries`, `validatorChoiceSlots` and
  `validatorConcreteSkills` (as Apply School Skill Rows rebinds them). Without the rule it does nothing.
- **On Apply School Skill Rows (soft):** `SCHOOL_SKILL_ROWS.canonical` for old names, when present.
- **Reads** the Skills table's `.sk-name` and `.sk-school` (the School tick).
- **No other layer depends on this one.**

## Older checks changed (declared)

Two checks expect the new behaviour only while this switch is on, exactly as before otherwise (counts unchanged):

- `BUGFIX — Apply School Skill Rows/qa/school-skill-rows-harness.js`: **SSR-TSI-FOUR-CHOICE-SLOTS** ("Tsi Smith
  [Artisan]: 4 free Skill choices still open"; none is made in that check).
- `PART K — Phase 11.2.1 Wizard Skills and Advantages/qa/wizard2-harness.js`: **CW1-BOTH-SLOTS** also reads the note
  once both of Isawa Shugenja's choices are made: none (before: "Isawa Shugenja: 2 free Skill choices").

CW1-SLOTS-MATCH-VALIDATOR (the note's detail) and Phase 11.2's CW-REVIEW-FINDINGS (Review's list against the check)
pass unchanged. Phase 11.2's and 11.2.1's own pinned variants are re-run with Release 8a's XW8 off
(`qa/xw8-variants-off-8a1.py`).
