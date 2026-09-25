# ROLLBACK — BUGFIX — Apply School Skill Rows

## Surgical removal (the method)

Run the remover against a **scratch copy** of the Phase 0 tree, never the live one (it refuses the
live tree, its parent and any descendant):

```bash
cp -r "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability" /tmp/phase0
python3 "Versions/BUGFIX — Apply School Skill Rows/qa/remove-phase.py" /tmp/phase0
python3 /tmp/phase0/build/recombine.py
```

It removes exactly:

| What | Where |
|---|---|
| The fragment | `src/sheet/209.9995-bugfix-school-skill-rows.js` |
| Its manifest entry | `build/manifest.json` (and `expect_sha256` is recomputed from what remains) |
| Block `school-skill-choice-state` | `src/sheet/080-identity-build-ui.js`, before Apply School's Skill loop |
| Block `school-skill-choice-token` | `src/sheet/080-identity-build-ui.js`, inside that loop |
| Block `school-skill-rows-seam` | `src/sheet/210-test-seam-and-init.js`, after the Import fix's seam block |

Both blocks in `080` are purely additive, so nothing needs restoring. **Measured on 25 September
2026:** the removal rebuilds **byte-identical** to `738c7ccfa3bdf67a6ca160371508fe22521cac845b883119b95a5a4e9490958a`
(3,062,010 bytes, commit `322d9e6`), and the three touched sources match that commit exactly.

A later release built on top is removed first. The live-tree fixture does this through the shared
removal chain (`QA — Removal Chain Registry`), newest first, each by its own remover.

After removal Apply School writes its old rows again (no Trait for "Family: Subject" Skills, the
three misnamed Skills, the placeholder rows), and rows already written stay as they are.

## Dependencies

- **On the removal chain:** this fix's live removal fixture reads `QA — Removal Chain Registry`,
  and the fix is its newest entry. Removing this fix means removing its `CHAIN` entry too.
- **On Phase 5 (Part J), soft:** when present, three of its validator helpers are rebound by name
  (`validatorConcreteSkills`, `validatorChoiceSlots`, `validatorSkillRanks`). Each rebinding is
  guarded by `typeof`, so Phase 5 can be removed first and this fix simply skips them. Phase 5's own
  25/25 is among the retained suites that pass with this fix present. Phase 5's own folder is not
  edited.
- **On the trunk:** `makeSkillRow` (090), `schoolConcreteSkillNames` and `hasSchoolSkillOverlap`
  (070), `findSkill` (020), `findAnySchoolLibraryEntry` (050) and the School library (060). Normal
  trunk dependencies; nothing to declare.
- **Who depends on this:** nothing yet.

## No cross-phase fixture corrections

No earlier release's harness or fixture was changed. Every retained suite passed unchanged
(2,435 of 2,435 within the combined 2,472).
