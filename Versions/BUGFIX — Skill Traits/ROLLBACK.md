# Surgical removal

Turn `SKILL_TRAITS_FIX_ENABLED` off and reload to restore the previous behaviour. To remove the layer, delete only `src/sheet/209.999999994-bugfix-skill-traits.js`, its manifest entry and the guarded `BUGFIX SKILLTRAITS BEGIN skill-traits-seam` block through `END SKILLTRAITS skill-traits-seam` in `src/sheet/210-test-seam-and-init.js`. Rebuild the Phase 0 source. Do not restore whole shared files.

Use `qa/remove-phase.py` on an external scratch copy first. It preflights paths, ownership, retained references and any requested output hash before writing. This release has one entry in the shared removal chain. Its historical restore point is 3,786,934 bytes, SHA-256 `e3b65cb09297eb19a6e5aa7b53fdffffe01f8f9ec72f374b5e7a1bf573842173`; the cycle's final QA records historical restoration and removal while retaining independent layers.

Removing the code does not rewrite saved characters. Traits already corrected and saved remain saved values, and manual changes made by the owner are not reversed.

Dependencies:

- Apply School Skill Rows supplies `libraryEntry` and `fillTrait` for named Perform/Games rows. Both wrappers are guarded. With that fix disabled, named-subject corrections are unavailable; Intimidation and Craft still work. Remove Skill Traits first for a clean surgical removal of School Skill Rows.
- Search is optional. A guarded `SEARCH14.get` wrapper adds the Craft reminder to a returned detail record and invalidates the Search cache. Removing or disabling Search leaves the row and Skill-information corrections available.
- The trunk supplies `SKILL_LIBRARY`, `SKILL_DESCRIPTIONS`, `makeSkillRow`, `showSkillInfoModal` and `recalcAll`.
- Printed Sheet Ring Layers and Export to PDF are independent and must remain intact when this layer is removed.

The test-only conditional oracle in Apply School Skill Rows may remain: it selects the original exact expectations when this layer is absent. A verbatim original is in this folder's `originals/`. The guarded seam also exports the rebound `makeSkillRow` and `showSkillInfoModal`; those exports belong to this layer's removable seam block.
