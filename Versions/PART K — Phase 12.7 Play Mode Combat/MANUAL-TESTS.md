# Manual tests — Phase 12.7 Combat in Play only

For the owner's iPhone (and a laptop if convenient), on the branch preview. About five minutes. The
automated harness drives Chromium only; the carousel has had a Safari-only bug before, so these
steps are what the device test is for. If the installed app shows the old version, close and reopen
it once or twice first.

1. **Play shows Combat.** Open a character from the Characters list. It opens in Play: the tab bar
   has **Combat**, between Techniques (or Spell Slots) and Equipment. Its controls work as before:
   change stance, tick *Combat active*, add a wound.
2. **Management hides it.** Tap **Manage**. Combat disappears from the tab bar. Swipe through every
   tab: Combat never appears, and swiping past Background wraps round to Clan & School.
3. **Leaving from Combat.** Tap **Done**, go to **Combat**, then tap **Manage**. You land on
   **Equipment**, straight away: the page should not slide past Equipment and come back.
4. **Coming back.** Tap **Done**. Combat is back in the tab bar and you stay on Equipment. Go to
   Combat: the stance, *Combat active* and wounds you set in step 1 are unchanged.
5. **Several times quickly.** On Combat, tap Manage and Done four or five times. Each Manage lands
   on Equipment; the tab bar never shows Combat twice or a blank page.
6. **A caster.** For a shugenja, Spell Slots shows in both modes and Combat only in Play. On Spell
   Slots, tapping Manage keeps you on Spell Slots.
7. **Printing.** In Management, print (the toolbar's Print, or Share → Print in Safari). The print
   preview still includes the **Combat** section. Nothing else about printing should change.
8. **New blank sheet.** The old toolbar's **New** leaves the sheet in Management, without Combat.

Report any step that behaves differently, with the device and browser.
