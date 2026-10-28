# Single read-only review — open findings

Reviewer: /root/device_followup_review. One permitted reviewer has completed; do not spawn another reviewer for this follow-up. Review was source-only, after both feature layers passed their own checks and before full QA. No findings have yet been independently reproduced or fixed. No failure-investigator helper was used.

1. P2: Undo can leave an invalid draft displayed. Set Honour Points 5 to 2, enter -1, then Undo: CP7 state returns to 5 but CE7 render skips the invalid input. Also applyData/reset removes aria-invalid but render skips a focused input, potentially retaining the previous character's display. Force synchronization after successful Undo and character replacement; preserve drafts during ordinary background renders. Add meaningful regressions for both paths.
2. P2: Correcting an invalid edit to the original valid value leaves the global alert. Points 5 -> -1 -> 5 takes CP7Logic.same without commit, removes aria-invalid but leaves the notice role/text. Escape has the same issue. Clear the resolved validation feedback without erasing unrelated errors; test unchanged-value recovery and cancellation.
3. P2: Slow first Save/Save As can invalidate a newer Undo. Save starts with old currentId, a newer characteristic edit occurs during pending storage, save finishes and assigns a new currentId. CE7's generation token preserves the new transaction, but CP7.validUndo rejects its old character ID. Preserve identity for the same open character across this save, never across an actual character switch. Test a delayed window.storage.set through the actual Save button, including a switch/reset control case. Current save-token test only invokes CE7.saved directly and misses the ID transition.

Relevant files: src/sheet/209.9999999999983-bugfix-card-editing-ui.js; 209.9999999999975-bugfix-compact-points-ui.js (validUndo and CE7-owned hook); 120-persistence.js (CE7 manual-save token/success hooks). storageGet/Set uses window.storage when provided, otherwise localStorage. saveCharacter is not currently exported through the test seam; actual btnSave is available.

## 28 October 2026 (Claude): all three fixed

All three reproduced on the handed-over build (be0df293…) before any change, then fixed inside the card-editing layer (commit 995fe05):

1. **Fixed.** A successful Undo, a load and a reset rewrite every field, rejected or focused drafts included. Checks CE-UNDO-INVALID-DRAFT, CE-LOAD-FOCUSED; variants no-undo-sync, focused-sync.
2. **Fixed.** A field corrected to its unchanged value, or cancelled with Escape, withdraws only its own alert; another field's outstanding error is shown again; a stepper alert stays. Checks CE-UNCHANGED-RECOVERY, CE-ESCAPE-RECOVERY, CE-OTHER-FIELD-ALERT, CE-UNRELATED-ALERT; variants no-resolve, erase-unrelated.
3. **Fixed.** The save token carries the open character's id and a load/reset count; when the save names the same character, a newer Undo follows the new id; after a load or reset it is withdrawn. Tested through the real Save and Save As buttons with the character write held in storage. Checks CE-SLOW-SAVE, CE-SLOW-SAVE-AS, CE-SLOW-SAVE-SWITCH; variants no-rebind, cross-switch.

Card editing 40/40 first run; 11/11 pinned variants; removal 6/6 exact. The owner allowed one reviewer for this new code in the 28 October session; its result follows.

## 28 October 2026: second review (one read-only helper, on the fixes above)

No high-severity defect in the fixes. Four findings; each was checked against the code before acting (commit da752c5):

1. **An older save race, outside this layer: reported to the owner, not built.** `saveCharacter` sets `currentId` after its storage awaits even if another character was opened meanwhile, so the picker and autosave could then point at the wrong character. On the live site and the Android app storage is localStorage: every await resolves before any tap can be handled, so it cannot happen there. Only the asynchronous `window.storage` bridge (a Claude artifact) can reach it. The reset-during-save check no longer depends on it.
2. **Fixed: overlapping saves lost a newer Undo.** With no load or reset during a save, the pending Undo now follows whatever id the save gives the open sheet. Check CE-OVERLAP-SAVE (Save tapped twice).
3. **Fixed: a stale visible Undo after that race.** The Undo button is redrawn after every save. Check CE-SLOW-SAVE-OPEN (another character opened during a save); variant stale-button.
4. **Fixed, differently from the suggestion: Undo could replace typed text not yet applied.** Skipping every focused field would leave an old number showing after Enter then Undo. The layer now records text typed and not yet applied; Undo and redraws keep only that. Checks CE-UNDO-KEEPS-DRAFT, CE-RENDER-KEEPS-DRAFT, CE-ENTER-THEN-UNDO, CE-STEPPER-WHILE-FOCUSED; variants undo-overwrites-draft, focus-blocks-render, no-draft-tracking.
