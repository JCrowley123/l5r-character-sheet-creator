# Manual tests — Phase 7 save format (first release)

For the owner's iPhone (and a laptop if convenient), on the branch preview. About five minutes. If
the installed app shows the old version, close and reopen it once or twice first. You need the
older save `Sairyu_.l5r` (the one you imported on 25 September) in Files.

1. **Import an older save.** On the Characters list tap **Import JSON** and pick `Sairyu_.l5r`.
   A new Sairyū appears in the list. Do **not** open it yet.
2. **Export it without opening it.** On that new Sairyū's own menu choose **Export JSON**. The share
   sheet shows the file as **Sairyū.l5r.json**, with the ū (it used to say `Sairy_.l5r.json`).
   Save it to Files.
3. **Round trip.** Import that exported `Sairyū.l5r.json`, then open the new copy: Sairyū looks
   as before (Clan, School, Rings, Skills, Advantages).
4. **Save As a copy.** On the first imported Sairyū's menu choose **Save As a copy**, then open the
   copy: it opens normally.
5. **A character you already had.** Open any character that was in your list before this test. It
   loads as before; change something small and it saves as usual.
6. **Export from the sheet.** With a character open, ⋯ → **Export JSON**: the share sheet opens
   with the character's file, named after the character.

Nothing to look inside the files for: the format number is checked by the automated tests. What
matters here is the file name with its accent, and that every character opens as before.

Report any step that behaves differently, with the device and browser.
