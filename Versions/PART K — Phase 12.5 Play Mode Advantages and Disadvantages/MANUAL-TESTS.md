# Phase 12.5 — owner preview checklist

Owner reported successful testing and approved merging on 28 September 2026. This checklist is
retained for future regression testing.

Use the branch preview on both your laptop and iPhone. Main is not changed by this preview.
Use a disposable character or an exported copy; preview-site storage is separate from main.

1. In Management, add an Advantage and a Disadvantage, change a configuration, edit a note and
   remove a test row. These should work as before.
2. Switch to Play. Names, points and descriptions should read as text; Add, Remove, Choose and
   Change controls should disappear. Typing or tapping should not alter purchase details.
3. Return to Management, open a configuration and change a choice without confirming. Cancel
   the modal, switch to Play, then back to Management and reopen it. The unconfirmed draft
   should not become saved character data. The automated tests separately force a mode change
   while a modal is open; the normal overlay may prevent doing that directly on your device.
4. In Play, try available contextual actions: Darling court selection/in-session toggle,
   Phobia/Nemesis toggles, and an information button. They should remain usable. No unowned
   Advantage or Disadvantage should be added merely to test its mechanics.
5. On a character that owns the relevant entry, try a session reset/resource use and Hotei's
   Contested Void Roll or a Willpower check. Exhausted resources must remain unavailable until
   legitimately restored. Existing effects and previews should work as before.
6. Open a saved character from the Characters list and check the Advantages tab in Play.
   Finish a disposable wizard character and check the same. Switch modes a few times; XP and
   purchased configuration must not change just because the mode changed.
7. Check Techniques still has its own Play behaviour, then inspect the Advantages tab in portrait
   and landscape. Report any clipped text, hidden live action or purchase control still editable.

Record device/browser, entry name, mode and steps for any failure. Real-device review is not
replaced by the automated Chromium checks. Stop after this part: Combat (12.7) and toolbar
replacement (12.8) require separate approval. In particular, the old toolbar remaining visible
and legacy import/load opening in Management are not changes delivered by 12.5.
