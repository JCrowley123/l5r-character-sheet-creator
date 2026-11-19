# G6 · read-only code review of the group's diff

19 November 2026 (Claude), in-session, before the owner's device round, as the 6 November amendment asks. Scope: the diff from `main` (`1ebf26b4`) to `claude/release-15a-a20` in the Phase 0 sources and manifest: A19's script and stylesheet, A20's script and stylesheet, A20's three hook blocks (`208-feat-roll-preview.js`, `130-round-and-pipeline.js`), and the two seam blocks. Each finding below was checked against the code and, where it says so, in the browser.

## Changed during the review

| # | Unit | Finding | Outcome |
|---|---|---|---|
| 0 | A20 | Found by the light checks rather than the reading, recorded here with the review's changes: Phase 3's Smart Roll Preview harness (48/50 on `340d8f60…3a77`) reads the Trait row's label text, and A20 had put the drop-down inside that label, so the label read as every option at once. Anything else that reads the preview's rows would have seen the same. | Fixed: the label stays exactly as Phase 4 writes it (the Trait and its value), hidden from view and from screen readers, with the drop-down beside it. Build `8d6a0a0a…a4eb`, 17,714,794 bytes: Phase 3's harness 50/50, A20's 18/18, removal 10/10, dependencies clean; the touched layers re-run on it. The run that found it is kept (`light/a20-touched-run-1-label-fault.log`). |
| 1 | A20 | Ninjutsu and Sailing hold two Traits in the catalogue ("Agility or Reflexes", "Agility or Intelligence"); the sheet rolls the first. As built, A20 offered no drop-down for them, though they are where a choice matters most (Core p.142 and p.144 name both Traits). | Fixed before the device round: the usual Trait is the one the sheet rolls, and the other is listed as book-named with its page. One pinned check added (`TC-TWO-TRAIT-SKILL-DESKTOP`, after run 3; the 17 earlier ids unchanged), with a Sailing row in A20's character. Build `549472b5…d7e0` → `340d8f60…3a77`; removal 10/10 and dependencies re-run on it. |

## Low, left as they are (for the record)

| # | Unit | Finding | Why it stays |
|---|---|---|---|
| 2 | A19 | With Hotei's Curse and Touch of the Void together, the two-point spend owes two Willpower rolls; the first opens at once, the second when that window closes. Until the second has opened, the line says it "comes after your next roll", when it comes after the open window closes. Undo still drops it correctly. | A rare pair; the action is right and the wording close. Revisit if the owner sees it. |
| 3 | A19 | Nothing is judged while a roll preview is open, so a change made inside a preview (its own Void option) ends Undo only when the preview closes. A roll follows at once in that case, which ends it anyway. | Needed: the preview arms and clears the one-roll effects while it works out its offers (found by the first probe; see A19's README). |
| 4 | A19 | A wound change made after a +10 TN or +10 Initiative spend ends Undo, although the Wounds were not part of that spend. | As approved: "any other change to the Void Points, the armed effect, the Round or the Wounds". |
| 5 | A20 | The drop-down sits in the label of Explain This Roll's first base row (Part G Phase 4). Without that phase there is no drop-down. | Fails safe: the preview and the roll are as before. Phase 4 is live and not removable separately in practice. |
| 6 | A20 | The pool for another Trait is (Trait + Skill Rank) keep Trait, the sheet's own Skill-roll shape, read through `getTraitValueByName` (which Weakness adjusts). A layer that changes a Skill roll's pool before it reaches the pipeline would have its change replaced by the chosen Trait's pool. None does today: `rollSkill` and the untrained list pass the plain pool, and every modifier is applied after the gate. | Recorded for later layers. |
| 7 | Both | The seam blocks expose `VU15` and `TC15` to tests only, as every unit's do. | As the pattern. |

## Checked and fine

- Removal: each unit's remover strips its fragments, manifest entries and blocks, and the rebuild is byte-identical to its predecessor (10/10 each; A20's hook blocks included). Each removed alone with the other kept verifies.
- Dependencies: every reference to each unit's surface is inside its own blocks (2/2).
- No saved field, storage key or History entry is added by either unit. A19 writes back only values a card spend itself changed; A20 changes only the roll's own request and context.
- Switches: with either off, nothing is wrapped, drawn or changed (A20's hooks find nothing to do).
- Accessibility: A19's line is a polite live region and keeps focus on it after Undo by keyboard (checked); A20's drop-down is a native select with a label, keeps focus across its redraw (checked), and opens the phone's own picker.
