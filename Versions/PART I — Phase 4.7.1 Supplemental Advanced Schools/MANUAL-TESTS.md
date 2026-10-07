# Phase 4.7 follow-up — worked manual tests

Run these on **Windows or iPhone**; you do not need to repeat every rules check on both. Use disposable characters. Save/export any real character before testing. Record the device/browser, test number, pass/fail and what happened.

**Merged to main on 5 October; live deployment verified on 6 October.** Use the [live character sheet](https://l5r-character-sheet-creator.pages.dev/) on Windows or iPhone. Save your character, then refresh/reopen the page to load the update. The Windows file is:

`C:\Users\jcrow\l5r-character-sheet-creator\Versions\Part F — Cross-Platform Delivery\PART F — Phase 0 Source Reorganization for Maintainability\l5r-character-sheet.html`

Do not test an old downloaded copy by accident. The live release includes the supplemental Advanced Schools and both new Basic Schools. The Paragon configuration correction described in test 1 is a separate follow-up and is not yet live.

Use **Manage**. Basic Schools are chosen on **Clan & School** (or added under Identity). **Advanced Schools are in Techniques** and appear only when prerequisites are met. Add **Multiple Schools** in Advantages before trying to enrol. A Technique's printed effect is reference text in this release; it does not automatically change dice, Kiho, Servants or spell slots.

## 1. Normal case — Minor Clan Defender

Create a Badger character with a Bushi School. Set Agility 5, Strength 4 and Kenjutsu 5; add Paragon and Multiple Schools. Beside Paragon, choose **Choose…**, select **Compassion**, and confirm. Any valid Paragon virtue may qualify; Compassion is a concrete example. On Techniques, Minor Clan Defender should be offered. Choose it and enrol.

**Reported defect, 6 October:** the live release also accepts a blank Paragon. The separate correction passed automated verification on 7 October and is awaiting merge/deployment. For its retest, a blank or cancelled Paragon choice must not qualify; confirming Compassion must qualify. Do not record the blank case as passed against the current live build.

- Your existing School keeps its current rank. Advanced Rank starts at **0**; no free first Technique appears.
- Note Identity's Insight Points. For a test only, increase **Other Insight Bonus** by the displayed amount needed for the next Insight Rank. Advanced Rank becomes **1**, granting **Know No Boundaries** once.
- Repeat for the next two Insight Ranks. You should gain **The Speed of Certainty**, then **The Strength of Humility**, and stop at Advanced Rank 3.
- Save, close/reopen and check the Advanced School, rank and three Techniques remain, without duplicates.

Fringe: on a fresh copy before enrolling, lower Kenjutsu to 4. The School must disappear unless another Weapon Skill is 5. Restore it; remove Paragon and check again. Merely selecting a Minor Clan in the unused picker must not qualify a character whose applied Identity Clan is Crab.

## 2. Normal case — Imperial Scion; fractional threshold

Use an Imperial character with Awareness 5, Perception 4, Courtier 6, Etiquette 4, Status **4.0**, and Multiple Schools. Imperial Scion should appear.

- Status **3.9** must fail; **4.0** must pass.
- A non-Imperial character with the same numbers must fail.
- Owner reports this test works. Its Rank/Points treatment remains part of the final Glory/Honor/Status review (FT-09).
- Its Technique references should distinguish **Status points** from Status ranks: Rank 2 removes points; Rank 3's ronin option costs 5 points each of Glory, Honor and Status.

## 3. Narrative requirement — Kobune Captain

Use a Bushi with Water 3 (both Strength and Perception at least 3), Commerce 4, Knives 3, Sailing 4, Leadership and Multiple Schools. Kobune Captain should appear.

Select it but leave the command-appointment confirmation unticked: entry must stay disabled. Tick the confirmation only for this test character, then enrol. On a fresh copy, remove Leadership: the tick box must not substitute for the missing Advantage.

Owner reports test 3 works. Leave eligibility unchanged for now; review the setting implications of non-Mantis captains at the end of the project (FT-10).

## 4. Fringe — different Rings really are different

Use a Shugenja with Spellcraft 5 and Multiple Schools. Set **Fire 4, Water 3, Air 2, Earth 2, Void 2**. Set both Traits of each ordinary Ring to the stated number.

- Tamori Master of the Mountain must **not** appear: there are only two qualifying Rings.
- Raise **Void to 3**. It must appear: Fire is 4, and Water and Void are the two other Rings at 3.
- Its Rank 2 reference should list the casting-rank increase separately from the temporary defensive effect. Do not expect the sheet to automate either effect yet.

## 5. Normal and fringe — Akodo Tactical Master

Use a Bushi with Water 4, Intelligence 5, Battle 5 with **Mass Combat** Emphasis, Games: Shogi 4, and Multiple Schools.

- The School should appear with Shogi alone; Go is not also required.
- Remove the Emphasis while keeping Battle 5: it must disappear.
- Restore the Emphasis, lower Shogi to 3, and add Games: Go 4: it should appear again.
- Lower both games to 3: it must disappear.

For Disciples of Sun Tao, use Fire 4, Water 3, Battle 4 with that Emphasis, and **two different** Weapon Skills at 4. Two Kenjutsu rows do not count as two different Skills. Its band-membership confirmation is also required.

## 6. Configured Advantages — Children of Doji

Use Awareness 5, Void 4, Courtier 6, Etiquette 6, Sincerity 5, Honor 5.0, Artisan: Painting 4 (or Perform: Song 4), and Multiple Schools.

Add **four Allies entries**. Configure each with Influence 1; choose Devotion 4 for one and Devotion 2 for the other three. The School should appear. Confirm that these represent four different people before entry.

- Remove one Ally: it should disappear.
- Restore the fourth, but make all four Devotion 2: it should disappear.
- An unconfigured Allies entry does not count as a configured fourth Ally.

This is a separate rule from Scorpion Instigator. The Blackmail purchase-count review remains deferred to Phase 15 or later.

## 7. Either route — Kakita Master Artisan

Use a Crane character with Awareness 5, Void 5, Artisan: Painting 8, Prodigy, Multiple Schools, and **Great Potential configured for Artisan: Painting**. Confirm that Painting is the chosen art. The School should appear.

- Change Great Potential to Kenjutsu: it must disappear even though Painting is still 8.
- Restore Painting but remove Prodigy: this non-Kakita-Artisan route must fail.
- Merely adding Kakita Artisan as a new Rank 0 School must not bypass Prodigy. Earn at least Rank 1 before treating it as trained.
- A character actually trained in Kakita Artisan can instead use that training, an art at 8 and Great Potential in one of their chosen arts; that route does not require Prodigy.

## 8. Either route — Asako Inquisitors

Use Void 4, **Air 3 and Water 3**, Lore: Law 4, Lore: Shugenja 3, no Taint, and Multiple Schools.

- **Weapon route:** use a Phoenix Bushi, add Sacred Weapon, and confirm that **Inquisitor's Strike** is present in Weapons. Select Asako Inquisitors and confirm the character can already make melee attacks as Simple Actions. A different Clan's Sacred Weapon is insufficient.
- **Caster route:** use an Isawa Shugenja with a Water affinity. If needed, adjust Other Insight Bonus until total Insight Points are **175**, giving Basic School Rank **3**; the affinity permits Mastery Level 4 Water spells. The Sacred Weapon is not required. Merely adding a Level 4 spell to a lower-rank character must not qualify it.
- Void-affinity Isawa Rank 3 qualifies through Void only with Ishiken-Do. Removing Ishiken-Do must block that route if no ordinary element can reach Mastery Level 4.
- A qualified Isawa who later adds Asako Loremaster keeps their earlier casting qualification; the new active School must not erase learned Shugenja ranks.
- On a fresh copy, set Taint to **0.1**: neither route should qualify.
- Keep Void 4, but lower Air to 2 and leave all other non-Water Rings at 2: entry fails because Void cannot count as one of the two **other** Rings.

## 9. Remaining catalogue and exclusion checks

Each row is a fresh character with Multiple Schools and compatible Basic training. Complete the listed entry requirements, then confirm the School appears. Lower one listed Skill or Trait by 1 to check it disappears.

| School | Example requirements and fringe check |
|---|---|
| The Dark Paragons | Any Trait 5, Lore: Theology 4, Honor 4, Dark Paragon; confirm Simple Action melee ability. Honor 3.9 must fail. |
| Kolat Assassin | Follow the complete worked example in **9a** below. |
| Legion of Two Thousand | Follow the complete worked example in **9b** below. |
| Mirumoto Master Sensei | Air 5, Earth 4, Void 5, Kenjutsu 5, Meditation 6; confirm selection and teaching by a Master Sensei. Add Brash or Proud: entry must fail. |

Berserkers (Chitatachikkan) is a **Nezumi-only reference** and must not be offered to these human characters. The app does not yet support Nezumi creation/progression.

### 9a. Kolat Assassin — complete worked example

Use a **new disposable character**, with no Advanced School already joined. This
example checks the picker, entry, progression and saving separately. It is a test
setup, so do not spend a real character's XP or invent membership for live play.

1. Create **Scorpion → Bayushi family → Shosuro Infiltrator [Ninja]**. Finish the
   wizard, or use **Apply Family** and **Apply School** on Clan & School. Do this
   before setting the values below, because applying a School may change them.
2. Enter **Manage → Rings & Traits**. Set **Agility to 4** and **Reflexes to 4**.
   These are individual Traits; you do not need every Trait or Ring at 4.
3. In **Skills**, set **Acting 5**, **Stealth 5** and **Knives 5**. Edit an existing
   Skill row if present; add a missing Skill using Add from Skill List. Use the
   numeric Rank box, not an Emphasis or the School Skill checkbox.
4. In **Identity**, set **Taint Rank to 0**. In **Adv & Disadv**, add the
   **Multiple Schools** Advantage. Leave the original Basic School in place.
5. Open **Techniques → Advanced School** and choose **Kolat Assassin [Ninja]**.
   It should now be in the list. You do **not** need a Clan named Kolat: the
   membership requirement is the declaration below.
6. Leave the declaration unticked. **Begin training** must remain unavailable.
   Then tick **“My character is a Kolat member recruited into the Lotus Sect and
   is not corrupted by the Nothing.”** For normal play this requires the
   character's actual story/GM agreement; here it is a disposable test fixture.
7. Press **Begin training**. Advanced Rank should be **0**, with no first Advanced
   Technique yet. The existing Basic School keeps its current rank.
8. Go to **Identity**. Note **Insight to Next Rank** and the current **Other
   Insight Bonus**. Add the first number to the second and enter the new total
   in Other Insight Bonus. For example, if 12 more Insight is needed and the
   bonus is 0, enter 12; if the bonus is already 20, enter 32.
9. Return to Techniques. Advanced Rank should be **1**, with **Kiss of the Lotus**.
   Repeat step 8 for each next Insight Rank: gain **Tiger's Claw** at Advanced 2,
   then **Steal the Light** at Advanced 3. Another Insight Rank must not give
   Advanced Rank 4 or duplicate these Techniques.
10. Save, close/reopen and check that the Advanced School, rank and references
    remain. Technique effects are reference text; do not expect automated attacks.

**Fringe checks — use a fresh copy before pressing Begin training.** Change only
one value at a time and restore it before the next check:

| Change from the qualifying setup | Expected result |
|---|---|
| Taint Rank **0.1**, instead of 0 | Kolat Assassin is unavailable. Restore 0. |
| Agility **3**, keeping Reflexes 4 | Unavailable. Restore Agility 4. |
| Reflexes **3**, keeping Agility 4 | Unavailable. Restore Reflexes 4. |
| Acting **4**, or Knives **4**, or Stealth **4** (separate checks) | Unavailable each time; restore each Skill to 5. |
| All numbers correct, declaration unticked | The School appears, but Begin training is unavailable. |

Do these on the unjoined copy: lowering a value on an already enrolled character
does not test initial entry. Source: *Enemies of the Empire*, printed p.50.

### 9b. Legion of Two Thousand — complete worked example

Use **another new disposable character**. In particular, do not reuse a Shugenja
from tests 4 or 8: Legion is a Bushi School and the incompatible-training rule
would prevent entry even with the correct numbers.

1. Create **Crab → Hida family → Hida Bushi**. Finish creation/apply Family
   and School before changing values. This gives the test character a concrete
   earlier Basic School.
2. In **Manage → Identity**, change the editable **Clan** text to **Ronin**, while
   retaining **Hida Bushi** as the existing School. This represents a former Crab
   recruited into the band; do not apply another School. The app has no separate
   Ronin Basic School to select for this setup. Changing Clan alone does not grant
   entry: the recruitment declaration below is still required.
3. In **Rings & Traits**, set **all four** values below. A Ring uses the lower of
   its two Traits, so increasing only one Trait is insufficient:

   | Ring needed | Set these two Traits |
   |---|---|
   | Fire **3** | Agility **3**, Intelligence **3** |
   | Water **3** | Strength **3**, Perception **3** |

4. In **Skills**, set **Battle 3**, **Defense 4** and **Kenjutsu 3**. Edit existing
   rows or add missing ones; no Emphasis is required for this School.
5. In **Identity → Honor**, set **Rank to 5.0** and **Points to 5.0**. The current
   eligibility check uses the Rank field when filled; changing Points alone will
   not repair a low Rank. This broader Rank/Points behavior remains under final
   project review. Add **Multiple Schools** in Adv & Disadv.
6. In **Techniques → Advanced School**, select **Legion of Two Thousand [Bushi]**.
   Leave **“My character has been recruited into the Legion of Two Thousand ronin
   band.”** unticked: Begin training must remain unavailable. Tick it for this
   test character and press **Begin training**.
7. Advanced Rank starts at **0**, freezing the earlier Basic School's rank. Use
   **Other Insight Bonus** as in Kolat step 8 to reach the next Insight Rank.
   Advanced Rank 1 grants **Stand as Two Thousand**.
8. Reach two further Insight Ranks: Advanced Rank 2 grants **Kuronada's Honor**;
   Advanced Rank 3 grants **Tamago's Expertise**. Save/reopen and check that all
   three references remain once each, with the earlier Basic rank still frozen.

**Fringe checks — before enrolment, changing one thing at a time:**

| Change from the qualifying setup | Expected result |
|---|---|
| Honor **Rank 4.9**, with Points still 5.0 | Legion is unavailable. Restore Rank 5.0. |
| Intelligence **2**, with Agility 3 | Fire becomes 2; Legion is unavailable. Restore Intelligence 3. |
| Perception **2**, with Strength 3 | Water becomes 2; Legion is unavailable. Restore Perception 3. |
| Battle **2**, Defense **3**, or Kenjutsu **2** (separate checks) | Unavailable each time; restore the original value before continuing. |
| All numbers correct, recruitment declaration unticked | The School appears, but Begin training is unavailable. |

If it does not appear, first check **Manage**, the held **Hida Bushi** School,
**Multiple Schools**, both Traits of each Ring, and **Honor Rank**. If it appears
but cannot be joined, check the recruitment declaration and that this fresh
character has not already joined an Advanced School. Source: *Secrets of the
Empire*, printed p.233. Conditional Technique effects remain manual.

## 10. Layout and everyday use

On either device, open a long entry such as Kakita Master Artisan or Asako Inquisitors. Check that the School selector, explanations, confirmation and entry button are readable and reachable. In Play mode, enrolment controls must not allow changes. In Manage, switch tabs, save and reopen, and make an ordinary Skill roll.

For iPhone, also check portrait and landscape: no clipped button, horizontal page overflow or text hidden behind the navigation bar. This is a visual check; no iPhone pass has yet been recorded for this release.

Continue with the two Basic Schools in `PART I — Phase 4.7.2 Missing Basic Schools/MANUAL-TESTS.md`.

## Owner results — 6 October 2026

Other tests reported working, except the Minor Clan Defender configuration gap.
Imperial Scion and Kobune Captain work with the deferred reviews recorded above.
Kolat Assassin and Legion await a rerun using the expanded steps. Device/browser
was not specified for this report; iPhone layout is not marked passed.
