# Rollback

Quickest: set `WIZARD_OVERSPEND_WARNS_ENABLED = false` and rebuild. The creation wizard then blocks Next while more
experience is spent than the character has, exactly as in Release 7c.1, on Rings & Traits, Skills, Advantages &
Disadvantages, Kiho and Review ("Fix the errors above to finish").

Full removal: run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, never the live one (it refuses the live
tree). Remove `BUGFIX — Undone Change Not Unsaved Work` first if it is present (the removal chain does this). It removes
this layer's fragment (`src/sheet/209.999999999999996-bugfix-wizard-overspend-warns.js`), its manifest entry and the
`overspend-warns-seam` block in `src/sheet/210-test-seam-and-init.js`; the rebuild is then exactly main's Release 7c.1
build, `4ee461803feee3661c3a39b83e8987ef3243b3b059fc4981be4db80f4a84701e`, 17,444,744 bytes.

## Dependencies

- **On Phase 11.2 (Part K), the creation wizard (`CW112`):** hard in the sense that without it there is nothing to change;
  the layer switches itself off (`XW8.enabled()` is false) when `CW112` is absent. It wraps `CW112.findings`,
  `CW112.refreshNav`, `CW112.next`, `CW112.render` and `CW112.finish` by property, and each step's `check` the first time
  the wizard reads it. Nothing in the wizard's own files is edited.
- **Reads** Phase 5's (Part J) validator finding `xp-overspend` and the sheet's own `f_xpSpent` / `f_xpTotal`; the
  trunk's `appConfirm`.
- **No other layer depends on this one.**

## Older checks changed (declared)

Three checks in two older harnesses expect the new behaviour only while this switch is on, exactly as before otherwise:

- `PART K — Phase 11.2 Creation Wizard/qa/wizard-harness.js`: **CW-OVERSPEND-BLOCKS** (Next open, no reason, the
  validator still reporting the overspend) and **CW-FINISH-BLOCKED-BY-ERROR** (driven with Willpower 0, outside its
  range, instead of Willpower 9, whose overspend no longer blocks).
- `PART K — Phase 11.2.1 Wizard Skills and Advantages/qa/wizard2-harness.js`: **CW1-OVERSPEND-BLOCKS** (the raises
  stop at the validator's overspend, not at Next blocking; the check also reads the overspend finding, both ways).

With the switch off, both wizards' own pinned variants match exactly as on 7c.1 (`qa/xw8-variants-off.py`).
