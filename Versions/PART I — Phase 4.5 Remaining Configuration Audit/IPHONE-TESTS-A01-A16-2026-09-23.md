# iPhone tests — A01–A16 Advantages

Written 23 September 2026, after Phase 4.5.24. Build: **2,914,055 bytes**, SHA-256 `3e262b18…`.
Every check below passed headlessly (2,052/2,052). None has yet been confirmed on a real device
with the real fonts. That is what these tests are for.

## Before you start

1. **Get the new build.** Open https://l5r-character-sheet-creator.pages.dev/. If you use the
   installed app, close it fully and reopen it twice so the service worker swaps in the new
   version. Check that Advantages → "Touch of the Spirit Realms" opens a **realm** picker. If it
   opens nothing, you are still on an old build.
2. **Use a throwaway character.** Some tests spend Honor, Void or koku. Start from New, and save it
   under a test name so you can reload it.
3. **For every entry, glance at the row itself.** The badge, the buttons and the circled **i**
   should sit on the row without running off the right edge. Reminder text should wrap onto its
   own line and be comfortably readable, not tiny. Tap **i** and check the reference panel opens
   and closes.
4. **Note what you see, not just pass/fail.** Screenshots of anything odd help most. Wording that
   reads wrong counts as a finding: two earlier real-device passes found exactly that.

Tick-box tests say "roll preview": that is the screen after tapping a roll button and before
**Roll**. "Result" is the dice screen after rolling.

---

## A01 Seven Fortunes' Blessing (4.5.21)

1. Add it. The picker lists the seven Fortunes in order (Benten … Jurojin), each with a price and
   a **Rule** you can expand. Nothing is preselected; Confirm with nothing chosen shows an error.
2. **Prices:** set Clan to Crane and pick Benten → **3 XP**. Pick Bishamon with no Clan → **5**;
   with Clan Lion or Crab → **4**.
3. **Fukurokujin:** choosing it reveals a Lore field. "Theology" alone is refused; "Lore:
   Theology" is accepted. Roll that Lore Skill → the preview shows **+1k1**. Another Lore Skill
   gets nothing.
4. **Daikoku:** roll Commerce → **+1k1** automatically.
5. **Bishamon:** a Strength **Trait** roll → **+1k0**. A Skill roll that uses Strength, and weapon
   damage, get nothing.
6. **Benten / Ebisu:** roll Courtier or Etiquette. The preview has an unticked box ("Persuading"
   → +0k1; "non-samurai citizen" → +1k1). Tick it and roll: one more kept die (Benten), or one
   more rolled and kept (Ebisu). Roll again: the box is unticked again.
7. **Jurojin:** any Skill, Trait or Ring roll offers "Resisting poison or disease" → **+2k0**.
8. **Hotei:** the row has a **Contested Void Roll** button that rolls your Void Ring. Rolls offer
   the "+10" tick.

## A02 Blackmail (4.5.13)

1. Add it, enter a target name and their Status (e.g. 3). The price is calculated from that
   Status; set Clan to Scorpion → 1 less (never below 1). The badge names the target.
2. Enter 0 or 2.5 for Status → refused with a message.

## A03 Dark Paragon (4.5.23)

Set Honor Points to 5.0 first (Identity tab).
1. Add it; seven precepts in order, nothing preselected. Price **5**, Clan Spider → **4**.
2. **Control:** roll Courtier. The **result** has "Reroll with Dark Paragon (1/1)". Tap it:
   - The confirm names the price: Honor Points **5.0 → 4.5**.
   - **Cancel** → nothing changes.
   - Tap again and **Pay and use** → the dice reroll, the total is the new dice **+5**, and a line
     says "original X, reroll Y + 5 = Z. The reroll stands" (even if it is lower).
   - Honor Points now read 4.5. The Honor **Rank** field is unchanged.
   - The row says "Used this session (0/1)".
3. Roll Courtier again → the button is there but greyed. **Reset session** on the row makes it
   1/1 again.
4. **Not offered where it shouldn't be:** with Control, roll Kenjutsu → no button. With Insight →
   only rolls using Awareness. With Knowledge → only rolls using Intelligence. With Strength →
   only weapon damage.
5. **Void fallback:** set Honor Points to 0.4 and Void Points to 2, then use it. The confirm says
   you have fewer than 5 Honor points, so it spends a Void Point (2 → 1). Honor stays at 0.4.
6. **Determination:** take some Wounds so you have a Wound penalty. Roll a Skill; the preview has
   an unticked Determination box. Tick it and Roll, and a dialog offers three choices:
   - **Pay and roll** → the Wound penalty is gone from this roll only.
   - **Roll without it** → the roll keeps the penalty and nothing is paid.
   - **✕** → the roll is cancelled and nothing is paid.
7. **Perfection / Will:** the row has a **Use** button. It pays (with a confirm) and marks the
   use; you adjust the die or the Wounds yourself.
8. The **Session Resources** panel (the quick-access button) lists Dark Paragon.

## A04 Darling of the Court (4.5.14)

1. Add it and add three courts in its editor → **6 XP** (a Courtier School → **3**). A duplicate
   court name is refused.
2. Select a court and turn "Court in session" on. The row reads "Status N — counts as N+1 at
   <court> (in session). Actual Status unchanged". Your Status field does not change.
3. Select a different court → "in session" switches off.

## A05 Forbidden Knowledge (4.5.13)

Add it with a subject and an optional note. The badge shows the subject, and the **i** shows the
examples. No dice change.

## A06 Heart of Vengeance (4.5.16)

1. Add it and pick a rival (suggestions, or type your own). Price 5, Spider **4**.
2. Roll a Skill, Trait or Ring: the preview has "Contested against <rival> — apply +1k1",
   unticked. Tick → +1k1. It is **not** offered on attacks, damage or spells.

## A07 Inheritance (4.5.13)

Add it with an heirloom name. The badge and reminder show; nothing else changes.

## A08 Naishou Citizen (4.5.22)

1. Crane character with Benten's Blessing (3 XP). Add Naishou Citizen → the Blessing drops to
   **2 XP**, with "Naishou Citizen: −1 XP (included in the cost)" on its row.
2. The Naishou row says "Aligned with Benten" plus the monk Free Raise reminder. Change the
   Blessing's Fortune → the Naishou row follows.
3. Remove Naishou Citizen → the Blessing goes back to 3.
4. *Known wording nit:* the Blessing row still says "2 XP: Crane price". Tell me if it reads badly
   on the phone.

## A09 Paragon (4.5.18)

Add it: seven tenets, nothing preselected. Price 7, Lion **6**. The row shows the tenet's benefit
plus "+1 Honor … add it yourself". No dice change.

## A10 Perceived Honor (4.5.6, retained)

Add it at Rank 2 → **4 XP**. The row reads "Rank 2 — read as Honor X (actual Y, unchanged)".
Change your Honor Rank and the reading follows.

## A11 Servant (4.5.14)

Add it. It opens no picker. The **i** shows the rules and nine sample servants. The cost stays
whatever you type.

## A12 Soul of Artistry (4.5.19)

1. Pick Artisan. Price 4, Crane (or a Courtier School) **3**.
2. Roll an Artisan Skill you have **no Rank** in, e.g. from Untrained Skills:
   - the preview says Rank 1 and "Soul of Artistry — treated as Rank 1";
   - the dice are Trait+1 k Trait;
   - the title ends "(Soul of Artistry — Rank 1)".
3. Your Skill Rank and XP do not change. A Skill you already have Rank in is unchanged.

## A13 Touch of the Spirit Realms (4.5.24)

1. Add it: ten realms in order, nothing preselected.
2. **Prices:** Bushi → 5 (Toshigoku 8, Yomi 7). Shugenja (e.g. Isawa Shugenja) → 4, with
   Toshigoku **7** and Yomi **6** marked "(confirm with your GM)". Picking either as a Shugenja
   shows the GM note on the row.
3. **Yomi:** choosing it reveals a School Skill list of your School's Skills. Pick Kenjutsu →
   Kenjutsu rolls and attacks get **+1k0**. Change your School to one without Kenjutsu → the row
   flags it and the bonus stops.
4. **Chikushudo:** Animal Handling → **+1k1** automatically.
5. **Jigoku:**
   - With Taint Rank 0, the row warns "Requires Shadowlands Taint" and nothing is added.
   - Set Taint Rank 2 → attacks and Strength/Agility/Reflexes/Stamina rolls get **+2** on the
     total; Willpower, Awareness, Intelligence and Perception rolls do not.
   - Tick **Lost** → **+4**.
   - Check the Lost label is normal-size text. It was tiny before a fix; confirm it on the phone.
6. **Sakkaku / Meido / Tengoku:** these are unticked preview boxes:
   - Sakkaku: Sincerity "Lying" → +1k1.
   - Meido: "social manipulation" → +2k0.
   - Tengoku: Earth Ring "Resisting Taint" → +2k0.

## A14 Void Versatility (4.5.20)

1. With a non-Shugenja, the quick-add list shows it greyed "Shugenja with Void Affinity only".
2. With Isawa Shugenja and Void Affinity, pick Air (4 XP). Cast a **Void** spell: before anything
   is spent, a dialog offers "Use Air slot" or "Use Void slot". ✕ spends nothing.
3. Pay with Air → exactly one Air slot is used, and Void slots and the Bonus pool are untouched.
   The roll is the normal Void roll.

## A15 Way of the Land (4.5.13)

Add it with or without a region. 2 XP, Unicorn **1**. Reminder only.

## A16 Wealthy (4.5.17)

1. Add Rank 5 with "Add it to my Koku now" → Koku goes up by **10**, once. Save and reload: no
   more is added.
2. Raise it to Rank 7 → +4 only. Lower it to Rank 6 → Koku is unchanged; the row offers
   **Return 2 koku** or **Keep**.
3. Price: Rank 5 = 5 XP; Crane/Unicorn/Imperial = 4; Rank 1 with a discount = **1** (never 0).

---

## Across all of them

- **Save and reload** a character with several of these configured. Everything comes back, and
  no money, Honor or Void moves.
- **Export and import** the same character as JSON; same result.
- **Rename** a configured row to something else → its settings clear.
- **Put one on the Disadvantage list** → "This entry belongs in Advantages".
- **Portrait and landscape**: rows and pickers fit without sideways scrolling.

## Known and expected (not bugs to report)

- Rank 0 rows in the Skill table explode 10s (open bug, next session).
- Hand-tapping bonus spell pips can exceed the shared pool (open bug, next session).
- A second Seven Fortunes' Blessing is not flagged, and changing its Fortune simply re-prices it
  (both deferred for your review).
- Set rules (Paragon with Dark Paragon, Touch with Cursed by the Realm) are not enforced.
