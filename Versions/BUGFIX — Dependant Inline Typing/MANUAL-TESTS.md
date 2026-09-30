# Manual tests — Dependant Inline Typing

For the owner's iPhone and laptop, on the branch preview. About five minutes. The automated harness
drives Chromium only; Safari's focus and keyboard behaviour are what these tests are for.

**Set up:** open or create a character, go to **Adv & Disadv**, make sure you are in
**Management** (the Manage/Done button beside the name), and add the Disadvantage **Dependant**.
Choose any amount in its dialog. Two optional boxes appear on its row: *Who depends on you* and
*The arrangement*.

1. **Type a name.** Tap the first box and type `Akiko`. Every letter should stay; the keyboard
   should not close and the cursor should not jump.
2. **Move straight to the next box.** Without tapping anywhere else, tap the second box and type
   `Support at court`. Both boxes keep their text.
3. **Leave the row.** Tap somewhere outside the row (another field, or empty space). The row's
   summary now ends `— Akiko`.
4. **Edit in the middle.** Tap into `Akiko` between the `k` and the `i`, type `-`: it reads
   `Ak-iko`. Delete the hyphen again.
5. **Second Dependant.** Add another Dependant. Type in the first row's name box, then tap directly
   into the second row's arrangement box and type. Both texts stay.
6. **A button right after typing.** Type in a name box, then tap **Change** on that row. The
   dialog opens on the first tap. (Same with **Change** on any other configured row.)
7. **It is saved.** Reload the page (or close and reopen the app) and open the character again.
   Both rows show what you typed.
8. **Play mode still locks it.** Tap **Done** to enter Play. The two boxes are read-only; tapping
   them does not let you type. Tap **Manage** again and you can edit once more.
9. **Laptop only:** type in the name box, press **Tab**, type in the arrangement box. Both stay.

Report any step that behaves differently, with the device and browser.
