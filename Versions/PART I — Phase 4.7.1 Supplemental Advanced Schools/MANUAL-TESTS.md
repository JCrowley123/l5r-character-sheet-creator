# Phase 4.7 follow-up — worked manual tests

Run these on **Windows or iPhone**; you do not need to repeat every rules check on both. Use disposable characters. Save/export any real character before testing. Record the device/browser, test number, pass/fail and what happened.

This is a branch build until merged. The Windows file is:

`C:\Users\jcrow\l5r-character-sheet-creator\Versions\Part F — Cross-Platform Delivery\PART F — Phase 0 Source Reorganization for Maintainability\l5r-character-sheet.html`

The hosted app receives the changes only after a merge to main and deployment. For iPhone testing, use that updated hosted build. Do not test an old downloaded copy by accident.

Use **Manage**. Basic Schools are chosen on **Clan & School** (or added under Identity). **Advanced Schools are in Techniques** and appear only when prerequisites are met. Add **Multiple Schools** in Advantages before trying to enrol. A Technique's printed effect is reference text in this release; it does not automatically change dice, Kiho, Servants or spell slots.

## 1. Normal case — Minor Clan Defender

Create a Badger character with a Bushi School. Set Agility 5, Strength 4 and Kenjutsu 5; add Paragon and Multiple Schools. On Techniques, Minor Clan Defender should be offered. Choose it and enrol.

- Your existing School keeps its current rank. Advanced Rank starts at **0**; no free first Technique appears.
- Note Identity's Insight Points. For a test only, increase **Other Insight Bonus** by the displayed amount needed for the next Insight Rank. Advanced Rank becomes **1**, granting **Know No Boundaries** once.
- Repeat for the next two Insight Ranks. You should gain **The Speed of Certainty**, then **The Strength of Humility**, and stop at Advanced Rank 3.
- Save, close/reopen and check the Advanced School, rank and three Techniques remain, without duplicates.

Fringe: on a fresh copy before enrolling, lower Kenjutsu to 4. The School must disappear unless another Weapon Skill is 5. Restore it; remove Paragon and check again. Merely selecting a Minor Clan in the unused picker must not qualify a character whose applied Identity Clan is Crab.

## 2. Normal case — Imperial Scion; fractional threshold

Use an Imperial character with Awareness 5, Perception 4, Courtier 6, Etiquette 4, Status **4.0**, and Multiple Schools. Imperial Scion should appear.

- Status **3.9** must fail; **4.0** must pass.
- A non-Imperial character with the same numbers must fail.
- Its Technique references should distinguish **Status points** from Status ranks: Rank 2 removes points; Rank 3's ronin option costs 5 points each of Glory, Honor and Status.

## 3. Narrative requirement — Kobune Captain

Use a Bushi with Water 3 (both Strength and Perception at least 3), Commerce 4, Knives 3, Sailing 4, Leadership and Multiple Schools. Kobune Captain should appear.

Select it but leave the command-appointment confirmation unticked: entry must stay disabled. Tick the confirmation only for this test character, then enrol. On a fresh copy, remove Leadership: the tick box must not substitute for the missing Advantage.

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
| Kolat Assassin | Agility 4, Reflexes 4, Acting 5, Knives 5, Stealth 5; confirm Kolat/Lotus membership and no corruption by the Nothing. Taint 0.1 must fail. |
| Legion of Two Thousand | Fire 3, Water 3, Battle 3, Defense 4, Kenjutsu 3, Honor 5; confirm band recruitment. Honor 4.9 must fail. |
| Mirumoto Master Sensei | Air 5, Earth 4, Void 5, Kenjutsu 5, Meditation 6; confirm selection and teaching by a Master Sensei. Add Brash or Proud: entry must fail. |

Berserkers (Chitatachikkan) is a **Nezumi-only reference** and must not be offered to these human characters. The app does not yet support Nezumi creation/progression.

## 10. Layout and everyday use

On either device, open a long entry such as Kakita Master Artisan or Asako Inquisitors. Check that the School selector, explanations, confirmation and entry button are readable and reachable. In Play mode, enrolment controls must not allow changes. In Manage, switch tabs, save and reopen, and make an ordinary Skill roll.

For iPhone, also check portrait and landscape: no clipped button, horizontal page overflow or text hidden behind the navigation bar. This is a visual check; no iPhone pass has yet been recorded for this release.

Continue with the two Basic Schools in `PART I — Phase 4.7.2 Missing Basic Schools/MANUAL-TESTS.md`.
