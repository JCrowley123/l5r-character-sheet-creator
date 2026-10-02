# PART I — Phase 4.5.25 Clan and School Prices — device checks

On the live site after the merge (https://l5r-character-sheet-creator.pages.dev/), about 12 minutes.
Work on new characters or copies (Characters → ⋯ → Save As a copy), never on a character you play.

## Test A — the wizard prices from your Clan
1. Characters → Create New Character. Choose the **Dragon** Clan and any Dragon School.
2. On the Advantages step, add **Clear Thinker**.
   - Check A1: the row shows **2 XP**, with the note "Dragon price: 2 XP (catalogue 3) — fixed when
     you leave Management", and the budget falls by 2, not 3.
3. Finish the wizard.
   - Check A2: on the sheet, the note reads "Dragon price: 2 XP (catalogue 3)." (no "fixed when you
     leave Management").

## Test B — a Disadvantage is worth more
1. On a **Lion** character in Manage, add **Brash**.
   - Check B1: the row shows **4 XP**, and XP remaining rises by 4.

## Test C — a cost you type is kept
1. On the Test A character in Manage, type **7** in Clear Thinker's cost.
   - Check C1: it stays 7 and the note reads "Cost set by hand. Book price: 2 XP (Dragon)."
2. Press Play, then Manage again.
   - Check C2: still 7, still marked.

## Test D — one Management visit is one purchase
1. A **Crane** character in the **Doji Courtier** School, in Manage. Add **Strength of the Earth**.
   - Check D1: 3 XP (a courtier pays the catalogue price).
2. In the same visit, add **Multiple Schools**, then + Add School → **Hida Bushi**.
   - Check D2: Strength of the Earth is now **2 XP** ("Bushi price").
3. Press Play.
   - Check D3: it stays 2.

## Test E — no price changes after the fact
1. A new **Crane / Doji Courtier** character in Manage: add **Strength of the Earth** (3 XP), then
   press **Play**.
2. Manage again: add **Multiple Schools** and + Add School → **Hida Bushi**.
   - Check E1: Strength of the Earth stays **3 XP**, with "Fixed when bought: 3 XP. Book price now:
     2 XP (Bushi)."
3. Add **Crab Hands**.
   - Check E2: **2 XP** (bought as a trained bushi).

## Test F (optional) — a character saved before this release
1. Open a character saved before 2 October that holds one of the 39 entries at its catalogue price
   and qualifies by Clan or starting School.
   - Check F1: the row now shows the Clan price with its note, and going back to Characters asks
     nothing about unsaved changes.

## Optional — Phase 0.7's seven Android checks, if you have an Android phone.
