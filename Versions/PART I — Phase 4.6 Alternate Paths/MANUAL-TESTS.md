# Phase 4.6 Alternate Paths, second release — iPhone check

About twenty minutes, on the live site once merged. Use throwaway copies (Characters list, ⋯ on any
character, **Save As a copy**) and tap **Manage** first. The dropdown is on **Techniques**, under the
"choose a Kata, Kiho or Spell" box; it now shows for every character with a School, because the Topaz
Champion is open to every School.

## Test A — Several Paths in one School, about five minutes

1. Apply **Dragon → Mirumoto Bushi**. On **Skills**, set **Athletics** to 3 with the **Climbing**
   Emphasis, and add **Investigation** 3 and **Lore: Law** 3. Raise Insight Rank to **4**.
2. Pick **Mirumoto Mountaineer**, then **Emerald Magistrate**.
   **Check:** Techniques lists **Heart of the Mountain** (Rank 2) and **Honor Is My Shield** (Rank 4);
   Mirumoto's **The Calm in Midst of Thunder** and **Furious Retaliation** are gone. The dropdown's
   first line reads "— add or remove an Alternate Path —", with both under "Remove a Path".
3. Set the Glory block's **Rank** to 2. **Check:** Imperial Legionnaire reads "… Rank 2 is already
   replaced by Mirumoto Mountaineer [Bushi]", greyed.
4. Pick **Remove Mirumoto Mountaineer [Bushi] (Rank 2)**. **Check:** The Calm in Midst of Thunder is
   back; Honor Is My Shield stays.

## Test B — A Champion's Rank is yours to choose, about four minutes

1. On a fresh copy, apply **Crab → Hida Bushi**; Insight Rank **3**.
2. Pick **The Emerald Champion (replaces a Rank you choose)**. **Check:** a window asks for Rank 1, 2
   or 3. Tick **Rank 2**, Confirm: **The Emperor's Hand** is listed at Rank 2 and The Mountain Does Not
   Move is gone.
3. Pick **The Ruby Champion**. **Check:** the window offers only Rank 1 and Rank 3. Close it with the X:
   nothing changes.

## Test C — The Topaz Champion keeps the Technique it replaces, about two minutes

1. On a fresh copy, apply **Crab → Hida Bushi**; Insight Rank **3**. Pick **The Topaz Champion**, tick
   **Rank 3**, Confirm. **Check:** both **Two Pincers One Mind** and **Soul of Promise** are listed.

## Test D — Glory, and the Imperial families' waiver, about four minutes

1. On a fresh copy, apply **Lion → Akodo Bushi**; Insight Rank **2**. **Check:** Imperial Legionnaire
   reads "🔒 needs Glory Rank 2". Set Glory **Rank** to 2: the lock goes at once.
2. On a fresh copy, on **Clan & School** pick **Imperial**, then **Apply Family** with **Seppun** and
   **Apply School** with **Seppun Guardsman** (the waiver goes by your Clan, which Apply Family sets).
   Add **Investigation** 3 (no Lore: Law); Insight Rank **4**. **Check:** Emerald Magistrate is not
   greyed (one Skill requirement waived), and once picked the note says you may ignore one Skill Rank
   requirement.
3. Do the same with **Crane → Kakita** family and **Kakita Bushi**. **Check:** Emerald Magistrate
   reads "🔒 needs Lore: Law 3".

## Test E — A later Path is not a School Rank, about four minutes

1. On a fresh copy, apply **Lion → Kitsu Shugenja**; set **Battle** to 3; Insight Rank **4**. Open the
   "choose a Kata, Kiho or Spell" box and look at the Air, Earth and Void Spells: Mastery 4 spells are
   listed, e.g. "(Air 4)".
2. Pick **Bishamon's Chosen** (Rank 3). **Check:** those Mastery 4 spells are still listed (a first
   Path is a School Rank).
3. Pick **The Jade Champion**, tick **Rank 4**, Confirm. **Check:** the Air, Earth and Void Mastery 4
   spells are gone; Water's stay (Kitsu's Water Affinity); the note says a later Path does not count as
   a Rank of your School. Identity still shows School Rank 4.

**Look for:** the pick window fitting the screen, no Technique listed twice, nothing tagged with the
wrong School or Rank. Delete the copies when you have finished.

---

# Phase 4.6 Alternate Paths, first release — iPhone check (confirmed 19/19, 1 October)

About fifteen minutes, on the branch preview (or the live site once merged). Use a throwaway copy
(Characters list, ⋯ on any character, **Save As a copy**) so nothing you care about changes, and tap
**Manage** before you start. The Alternate Path dropdown sits on the **Techniques** tab, under the
"choose a Kata, Kiho or Spell" box; it is hidden until your School has a Path at a Rank you have
reached.

## Test 1 — A Great Clan Path (Crab Berserker), about four minutes

1. On **Clan & School**, apply **Crab → Hida Bushi**.
2. On **Identity**, raise **Other Insight Bonus** until **Insight Rank** reads **2**.
3. On **Techniques**: the dropdown shows **Crab Berserker [Bushi] (replaces Rank 2) — 🔒 needs
   Earth 4**, greyed out.
4. On **Rings & Traits**, raise **Stamina** and **Willpower** to **4** (Earth 4). Insight may rise to
   Rank 3; that is fine.
5. On **Techniques**, the Crab Berserker option is no longer greyed. Pick it.
   **Check:** the list shows **Berserker's Rage**, its description beginning "[School Technique —
   Rank 2, Hida Bushi]" and ending "(Crab Berserker, Core Rulebook p.251)"; Hida's own Rank 2
   Technique, **The Mountain Does Not Move**, is gone. The note under the dropdown says Crab
   Berserker replaces your Rank 2 Technique (Core Rulebook p.251). The status line says "Alternate
   Path set: Crab Berserker [Bushi] (replaces Rank 2 of Hida Bushi)."
6. Keep this copy for Test 3.

## Test 2 — The Rank a Path replaces depends on the School (Empress Guard), about three minutes

1. On a second copy, on **Clan & School**, apply **Crane → Daidoji Iron Warrior**. On **Rings &
   Traits**, raise **Perception** to **3**. On **Identity**, raise **Other Insight Bonus** until
   **Insight Rank** reads **4**.
2. **Check:** the dropdown on **Techniques** reads **Empress Guard [Bushi] (replaces Rank 4)**. Pick it:
   **To Defend Unto Death** is listed at Rank 4 and Daidoji's **Vigilance of Mind** is gone.
3. On **Clan & School**, apply **Crane → Kakita Bushi** instead (Insight Rank 4 still).
   **Check:** the dropdown now reads **Empress Guard [Bushi] (replaces Rank 3)**.

## Test 3 — A Path stays with the School it was taken in, about four minutes

Before this release, a Path taken in your first School also replaced your second School's Technique
at the same Rank.

1. Back on the Test 1 copy. On **Advantages**, add **Multiple Schools**. On **Skills**, add
   **Hunting**, **Kyujutsu** and **Stealth** at Rank 1.
2. On **Identity**, tap **+ Add School** and pick **Hiruma Bushi**.
3. Raise **Other Insight Bonus** until the Schools panel shows **Hiruma Bushi at Rank 2**.
   **Check:** Techniques lists Hiruma's **Torch's Flame Flickers** and **Wolf's Little Lesson**
   (Rank 2), **and** still lists **Berserker's Rage** tagged Hida Bushi. The note under the dropdown
   says "Kept from Hida Bushi: Crab Berserker [Bushi] (Rank 2)".
4. Tap **Save**, go back to **Characters**, open the copy again: all of the above is unchanged.

## Test 4 — A monk's first Path gives one Kiho (Core Rulebook p.246), about three minutes

1. On a third copy, on **Clan & School**, apply **Brotherhood of Shinsei → The Four Temples [Monk]**.
   On **Skills**, raise **Lore: Theology** to **3**. On **Identity**, raise **Other Insight Bonus**
   until **Insight Rank** reads **2**.
2. On **Techniques**, pick **Brotherhood Spy [Monk] (replaces Rank 2)**.
   **Check:** the Kiho counter under the dropdown reads "Free Kiho picks: … of **4** left" (three to
   start, one for the first Path). Before this release it read 5. The note says "as your first Path
   it grants 1 Kiho at that Rank instead of the usual 2 (Core Rulebook p.246)".
3. Raise Insight to Rank 3: the counter reads "… of **6** left" (two more for Rank 3).

## Test 5 — Requirements the sheet now checks, about one minute

1. On any copy, apply **Phoenix → Shiba Bushi** (it starts at Honor Rank 5.5), raise **Insight Rank**
   to **3**, then set the Honor block's **Rank** to **4**.
   **Check:** the dropdown reads **Shiba Yojimbo [Bushi] (replaces Rank 3) — 🔒 needs Honor Rank 5**.
   Set Honor Rank back to **5**: the lock goes.

**Look for:** long dropdown labels fitting the screen (no sideways scrolling), no Technique listed
twice, and anything tagged with the wrong School or Rank. Delete the copies when you have finished.
