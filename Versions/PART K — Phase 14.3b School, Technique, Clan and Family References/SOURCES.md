# Verified entry pages — Schools, School Techniques, Clans and Families (Phase 14.3b)

Located on 15 October 2026 in the owner's 16 sourcebook PDFs. Text was extracted to a scratch folder outside the
repository (xpdf `pdftotext`); nothing extracted is stored here. Printed page = PDF page − 3 in the Core Rulebook,
the same in Unexpected Allies 2, − 1 in every other book (`SOURCEBOOK INDEX — Page Map/index.json`). The oracle is
`qa/expected-pages.json`: **103 Schools, 277 Technique rows (276 Search records), 25 Clans and 68 Families**, each
with book, printed page and PDF page; Technique rows carry their School and Rank, Family rows their Clan.

## How each entry start was found

- **Schools:** the School's own first heading. In Core that is the descriptive heading, which can sit a page before
  the stat block (Akodo p.116, Asako Loremaster p.124, Kitsu p.117, Mirumoto p.112, Iuchi p.130, Heichi p.217 and
  others).
- **School Techniques:** the Technique's heading inside its School's entry, Rank by Rank.
- **Clans:** the Clan's character-creation section (Core pp.105–131 and 211–227), not the Empire chapter (pp.56–70).
- **Families:** their `THE X FAMILY: +1 TRAIT` heading.

## Second oracle: Secrets of the Empire pp.248–249, "School Index"

The index lists every human School printed up to that book, with book and page. `qa/compare-school-index.py` reads it
from the PDF by word position (three columns a page; nothing saved) and compares it with the oracle by name.
**57 of the 103 Schools are matched: 53 agree, 4 differ, each explained:**

| School | This release | Index | Why |
|---|---|---|---|
| Akodo Bushi | Core p.116 | Core 117 | the index cites the stat block |
| Mirumoto Bushi | Core p.112 | Core 113 | the index cites the stat block |
| Lion Elite Spearmen | Naishou Province p.7 | Naishou Province 8 | the page prints 7 |
| Chuda Shugenja [Snake] | Core p.224 | Core 213 | the index's entry is the Spider School of the same name (Core p.213, also cited here) |

The other 46 are not matched by the script: 23 Brotherhood orders, 12 Minor Clan Schools, 4 Imperial Schools and
Fuzake Shugenja (Spider), for which it found no index line under those names, and 6 Great Clan Schools whose index
lines it could not pair (Kaiu Engineer, Kuni Shugenja, Soshi Shugenja — printed "Soshi Shugena" — Utaku Battle
Maiden, Utaku Mounted Infantry, Yasuki Courtier). Those rest on the entry-page reading alone. The previous session's
reading of the same index also found Utaku Mounted Infantry listed as Imperial Histories 2 p.310, where the School is
printed on p.168 (cited here), and Moto Death Priest (p.240) and Shiba Artisan (Emerald Empire p.122) agreeing.

## Entries printed in more than one book

**None among the 103 Schools.** Every other-book heading hit was an NPC stat line ("SORU: BAYUSHI BUSHI 2") or a
mention, so no "version this sheet uses" choice arises. Not checked: a full-text hit for Bayushi Bushi's Technique
"The Way of the Scorpion" on Imperial Histories 1 p.152.

**Same names, different things:** Chuda Shugenja (the Spider School, Core p.213) and Chuda Shugenja [Snake] (the
original School, Core p.224); the Families Toritaka (Crab p.106 / Falcon p.218), Kitsune (Mantis p.120 / Fox p.219),
Chuda (Spider p.211 / Snake p.224), Tsi (Oriole Core p.222 / Ronin Imperial Histories 1 p.275) and Yotsu (Ronin
Imperial Histories 1 p.275 / Tiger p.276). Family lookups therefore need the Clan as well as the name, and School
Technique lookups the School.

## Printed titles that differ from the catalogue

Kept as the sheet has them: Lion Elite Spearmen Rank 1 **The Way of Magari-Yarijutsu** is printed "The Way of
Magari-Yaritjutsu" (the book's spelling); Mirumoto Taoist Swordsman Rank 5 **Balance of Nothingness** is "Balance in
Nothingness"; Miya Herald Rank 4 **Blessing of the Emperor** is "Blessings of the Emperor"; the **Togashi** Family is
printed as "The Togashi Order". Shiba Artisan Rank 2 is hyphenated across lines ("SINCER-ITY").

## Possible updates for the owner

- **The Gift of the Lady** is both Doji Courtier Rank 5 (Core p.111) and The Hitomi Kikage Zumi Order Rank 1
  (Imperial Histories 1 p.215; the book does use that name). Search merges them into one Technique record, cited to its
  first School (Core p.111); each School's own detail shows its own page.
- **Hiruma Scout and Yotsu Bushi** already carry sources reading "Imperial Histories …" without the volume: both are
  Imperial Histories 1 (pp.147 and 276–277). They keep the catalogue's citation; their 10 Techniques had no page and
  are cited here.
- **Utaku Mounted Infantry:** the Secrets of the Empire index gives Imperial Histories 2 p.310; the School is on p.168.

## All 473 entries

### Schools (103)

| Name | Printed page (PDF page) |
|---|---|
| Agasha Shugenja | Core Rulebook p.125 (128) |
| Akodo Bushi | Core Rulebook p.116 (119) |
| Asahina Shugenja | Core Rulebook p.110 (113) |
| Asako Henshin [Monk] | The Great Clans p.199 (200) |
| Asako Loremaster [Courtier] | Core Rulebook p.124 (127) |
| Bayushi Bushi | Core Rulebook p.126 (129) |
| Bayushi Courtier | Core Rulebook p.127 (130) |
| Chuda Shugenja | Core Rulebook p.213 (216) |
| Chuda Shugenja [Snake] | Core Rulebook p.224 (227) |
| Daidoji Iron Warrior [Bushi] | Core Rulebook p.111 (114) |
| Daidoji Scout [Bushi] | The Great Clans p.70 (71) |
| Daigotsu Bushi | Core Rulebook p.212 (215) |
| Daigotsu Courtier | Core Rulebook p.213 (216) |
| Doji Courtier | Core Rulebook p.110 (113) |
| Doji Magistrate [Bushi] | Emerald Empire p.170 (171) |
| First Dawn Scholars [Monk] | Imperial Histories 2 p.29 (30) |
| Fudoist Order [Monk] | Imperial Histories 2 p.287 (288) |
| Fukurokujin’s Eyes [Monk] | Book of Air p.194 (195) |
| Fuzake Shugenja | Secrets of the Empire p.238 (239) |
| Goju Ninja | The Great Clans p.280 (281) |
| Heichi Bushi | Core Rulebook p.217 (220) |
| Hida Bushi | Core Rulebook p.106 (109) |
| Hida Pragmatist [Bushi] | Emerald Empire p.247 (248) |
| Hiruma Bushi | Core Rulebook p.108 (111) |
| Horiuchi Shugenja | The Great Clans p.257 (258) |
| Ichiro Bushi | Core Rulebook p.215 (218) |
| Ide Emissary [Courtier] | Core Rulebook p.131 (134) |
| Ikoma Bard [Courtier] | Core Rulebook p.118 (121) |
| Ikoma Lion’s Shadow [Bushi] | Emerald Empire p.109 (110) |
| Isawa Shugenja | Core Rulebook p.124 (127) |
| Iuchi Shugenja | Core Rulebook p.130 (133) |
| Kaiu Engineer [Artisan/Bushi] | The Great Clans p.39 (40) |
| Kakita Artisan | The Great Clans p.71 (72) |
| Kakita Bushi | Core Rulebook p.109 (112) |
| Kasuga Smuggler [Courtier] | Core Rulebook p.225 (228) |
| Kitsu Shugenja | Core Rulebook p.117 (120) |
| Kitsuki Investigator [Courtier] | Core Rulebook p.114 (117) |
| Kitsune Shugenja | Core Rulebook p.219 (222) |
| Komori Shugenja | Core Rulebook p.216 (219) |
| Kuni Shugenja | Core Rulebook p.107 (110) |
| Kuni Witch-Hunter [Monk] | The Great Clans p.40 (41) |
| Lion Elite Spearmen [Bushi] | Naishou Province p.7 (8) |
| Mantis Brawler [Bushi] | The Great Clans p.165 (166) |
| Matsu Beastmaster [Bushi] | The Great Clans p.136 (137) |
| Matsu Berserker [Bushi] | Core Rulebook p.119 (122) |
| Mirumoto Bushi | Core Rulebook p.112 (115) |
| Mirumoto Taoist Swordsman [Bushi] | Emerald Empire p.221 (222) |
| Miya Herald [Courtier] | Core Rulebook p.230 (233) |
| Morito Bushi | Core Rulebook p.223 (226) |
| Moshi Shugenja | Core Rulebook p.120 (123) |
| Moto Bushi | Core Rulebook p.130 (133) |
| Moto Death Priest [Shugenja] | Imperial Histories 1 p.240 (241) |
| Moto Vindicator [Bushi] | The Great Clans p.258 (259) |
| Ninube Shugenja | The Great Clans p.281 (282) |
| Order of Peaceful Repose [Monk] | Secrets of the Empire p.242 (243) |
| Order of the Five Rings [Monk] | Imperial Histories 2 p.102 (103) |
| Order of the Wind [Monk] | Book of Air p.193 (194) |
| Otomo Courtier | Core Rulebook p.229 (232) |
| Seppun Guardsman [Bushi] | Core Rulebook p.228 (231) |
| Seppun Shugenja | Core Rulebook p.228 (231) |
| Shiba Artisan [Courtier] | Emerald Empire p.122 (123) |
| Shiba Bushi | Core Rulebook p.123 (126) |
| Shinjo Bushi | Emerald Empire p.31 (32) |
| Shinmaki Order [Monk] | Emerald Empire p.206 (207) |
| Shosuro Actor [Ninja] | The Great Clans p.227 (228) |
| Shosuro Infiltrator [Ninja] | Core Rulebook p.128 (131) |
| Soshi Magistrate [Bushi] | Emerald Empire p.171 (172) |
| Soshi Shugenja | Core Rulebook p.127 (130) |
| Suzume Bushi | Core Rulebook p.225 (228) |
| Tamori Shugenja | Core Rulebook p.113 (116) |
| Temple of Persistence [Monk] | Book of Earth p.205 (206) |
| Tengoku’s Fist [Monk] | Book of Fire p.191 (192) |
| The Four Temples [Monk] | Core Rulebook p.231 (234) |
| The Hitomi Kikage Zumi Order [Monk] | Imperial Histories 1 p.215 (216) |
| The Hoshi Tsurui Zumi Order [Monk] | Imperial Histories 1 p.214 (215) |
| The Order of Eternity [Monk] | Book of Void p.193 (194) |
| The Order of Heroes [Monk] | Core Rulebook p.232 (235) |
| The Order of Jurojin’s Blessing [Monk] | Book of Water p.187 (188) |
| The Order of Rebirth [Monk] | Book of Fire p.190 (191) |
| The Order of the Nameless Gift [Monk] | Book of Earth p.205 (206) |
| The Order of the Spider Monks [Monk] | Core Rulebook p.215 (218) |
| The Shrine of Heaven’s Mirror [Monk] | Book of Water p.187 (188) |
| The Shrine of the Seven Thunders [Monk] | Core Rulebook p.232 (235) |
| The Temple of Heavenly Wisdom [Monk] | Book of Fire p.191 (192) |
| The Temple of Kaimetsu-uo [Monk] | Core Rulebook p.232 (235) |
| The Temple of Osano-Wo [Monk] | Core Rulebook p.233 (236) |
| The Temples of the Thousand Fortunes [Monk] | Core Rulebook p.233 (236) |
| The Togashi Tattooed Order [Monk] | Core Rulebook p.114 (117) |
| Toku Bushi | Core Rulebook p.221 (224) |
| Tonbo Shugenja | Core Rulebook p.218 (221) |
| Toritaka Bushi | Core Rulebook p.219 (222) |
| Tsi Smith [Artisan] | Core Rulebook p.222 (225) |
| Tsuruchi Archer [Bushi] | Core Rulebook p.122 (125) |
| Tsuruchi Bounty Hunter [Bushi] | The Great Clans p.167 (168) |
| Usagi Bushi | Core Rulebook p.220 (223) |
| Utaku Battle Maiden [Bushi] | Core Rulebook p.132 (135) |
| Utaku Mounted Infantry [Bushi] | Imperial Histories 2 p.168 (169) |
| Wind’s Grace Order [Monk] | Book of Air p.194 (195) |
| Yasuki Courtier | Core Rulebook p.107 (110) |
| Yogo Wardmaster [Shugenja] | The Great Clans p.229 (230) |
| Yoritomo Bushi | Core Rulebook p.120 (123) |
| Yoritomo Courtier | Core Rulebook p.121 (124) |
| Yoritomo Shugenja | The Great Clans p.168 (169) |

### School Techniques (277 rows)

| School | Rank | Technique | Printed page (PDF page) |
|---|---|---|---|
| Agasha Shugenja | 1 | Elements of All Things | Core Rulebook p.125 (128) |
| Akodo Bushi | 1 | The Way of the Lion | Core Rulebook p.117 (120) |
| Akodo Bushi | 2 | Strength of Purity | Core Rulebook p.117 (120) |
| Akodo Bushi | 3 | Strength of My Ancestors | Core Rulebook p.117 (120) |
| Akodo Bushi | 4 | Triumph Before Battle | Core Rulebook p.117 (120) |
| Akodo Bushi | 5 | Akodo’s Final Lesson | Core Rulebook p.117 (120) |
| Asahina Shugenja | 1 | The Soul’s Grace | Core Rulebook p.110 (113) |
| Asako Henshin [Monk] | 1 | The Four Mysteries | The Great Clans p.199 (200) |
| Asako Henshin [Monk] | 2 | The Riddle of Earth | The Great Clans p.199 (200) |
| Asako Henshin [Monk] | 3 | The Riddle of Air | The Great Clans p.199 (200) |
| Asako Henshin [Monk] | 4 | The Riddle of Fire | The Great Clans p.200 (201) |
| Asako Henshin [Monk] | 5 | The Riddle of Water | The Great Clans p.200 (201) |
| Asako Loremaster [Courtier] | 1 | Temple of the Soul | Core Rulebook p.125 (128) |
| Asako Loremaster [Courtier] | 2 | From the Ashes | Core Rulebook p.125 (128) |
| Asako Loremaster [Courtier] | 3 | Voice of the Universe | Core Rulebook p.125 (128) |
| Asako Loremaster [Courtier] | 4 | Invincible Mind | Core Rulebook p.125 (128) |
| Asako Loremaster [Courtier] | 5 | Wisdom of the Ages | Core Rulebook p.125 (128) |
| Bayushi Bushi | 1 | The Way of the Scorpion | Core Rulebook p.126 (129) |
| Bayushi Bushi | 2 | Pincers and Tail | Core Rulebook p.126 (129) |
| Bayushi Bushi | 3 | Strike at the Tail | Core Rulebook p.126 (129) |
| Bayushi Bushi | 4 | Strike From Above Strike From Below | Core Rulebook p.126 (129) |
| Bayushi Bushi | 5 | The Pincers Hold, The Tail Strikes | Core Rulebook p.126 (129) |
| Bayushi Courtier | 1 | Weakness is My Strength | Core Rulebook p.127 (130) |
| Bayushi Courtier | 2 | Shallow Waters | Core Rulebook p.127 (130) |
| Bayushi Courtier | 3 | Secrets are Birthmarks | Core Rulebook p.128 (131) |
| Bayushi Courtier | 4 | Scrutiny’s Sweet Sting | Core Rulebook p.128 (131) |
| Bayushi Courtier | 5 | No More Masks | Core Rulebook p.128 (131) |
| Chuda Shugenja | 1 | Blood Like Water | Core Rulebook p.213 (216) |
| Daidoji Iron Warrior [Bushi] | 1 | The Force of Honor | Core Rulebook p.111 (114) |
| Daidoji Iron Warrior [Bushi] | 2 | The Shield of Faith | Core Rulebook p.111 (114) |
| Daidoji Iron Warrior [Bushi] | 3 | Strike Beneath the Veil | Core Rulebook p.111 (114) |
| Daidoji Iron Warrior [Bushi] | 4 | Vigilance of Mind | Core Rulebook p.111 (114) |
| Daidoji Iron Warrior [Bushi] | 5 | To Tread on the Sword | Core Rulebook p.111 (114) |
| Daidoji Scout [Bushi] | 1 | Surveying the Land | The Great Clans p.70 (71) |
| Daidoji Scout [Bushi] | 2 | Scouring the Shadows | The Great Clans p.70 (71) |
| Daidoji Scout [Bushi] | 3 | Weaken the Resistance | The Great Clans p.70 (71) |
| Daidoji Scout [Bushi] | 4 | Strike and Move | The Great Clans p.70 (71) |
| Daidoji Scout [Bushi] | 5 | Cunning of Daidoji | The Great Clans p.70 (71) |
| Daigotsu Bushi | 1 | The Way of the Spider | Core Rulebook p.212 (215) |
| Daigotsu Bushi | 2 | Aura of Blood | Core Rulebook p.212 (215) |
| Daigotsu Bushi | 3 | Ashura’s Wing | Core Rulebook p.212 (215) |
| Daigotsu Bushi | 4 | Devouring Wrath | Core Rulebook p.212 (215) |
| Daigotsu Bushi | 5 | Inhuman Assault | Core Rulebook p.213 (216) |
| Daigotsu Courtier | 1 | Insidious Whispers | Core Rulebook p.213 (216) |
| Daigotsu Courtier | 2 | Cracks in the Wall | Core Rulebook p.213 (216) |
| Daigotsu Courtier | 3 | Darkness Cannot be Trapped | Core Rulebook p.213 (216) |
| Daigotsu Courtier | 4 | The Touch of Sin | Core Rulebook p.214 (217) |
| Daigotsu Courtier | 5 | The Embrace of Darkness | Core Rulebook p.214 (217) |
| Doji Courtier | 1 | The Soul of Honor | Core Rulebook p.110 (113) |
| Doji Courtier | 2 | Speaking in Silence | Core Rulebook p.110 (113) |
| Doji Courtier | 3 | The Perfect Gift | Core Rulebook p.110 (113) |
| Doji Courtier | 4 | Voice of Honor | Core Rulebook p.111 (114) |
| Doji Courtier | 5 | The Gift of the Lady | Core Rulebook p.111 (114) |
| Doji Magistrate [Bushi] | 1 | Temper Steel With Honor | Emerald Empire p.170 (171) |
| Doji Magistrate [Bushi] | 2 | Flowing Like Water | Emerald Empire p.170 (171) |
| Doji Magistrate [Bushi] | 3 | Breath of the Law | Emerald Empire p.170 (171) |
| Doji Magistrate [Bushi] | 4 | Flowing Like Air | Emerald Empire p.170 (171) |
| Doji Magistrate [Bushi] | 5 | The Willow in the Storm | Emerald Empire p.170 (171) |
| First Dawn Scholars [Monk] | 1 | Way of the Ancient World | Imperial Histories 2 p.29 (30) |
| Fudoist Order [Monk] | 1 | For Each, One Path | Imperial Histories 2 p.287 (288) |
| Fukurokujin’s Eyes [Monk] | 1 | Way of the Closed Eye | Book of Air p.194 (195) |
| Goju Ninja | 1 | The Cloak of Night | The Great Clans p.280 (281) |
| Goju Ninja | 2 | Melting into Shadow | The Great Clans p.281 (282) |
| Goju Ninja | 3 | The Shadowed Blade | The Great Clans p.281 (282) |
| Goju Ninja | 4 | Step Within Shadow | The Great Clans p.281 (282) |
| Goju Ninja | 5 | Shadow upon the Moon | The Great Clans p.281 (282) |
| Hida Bushi | 1 | The Way of the Crab | Core Rulebook p.106 (109) |
| Hida Bushi | 2 | The Mountain Does Not Move | Core Rulebook p.106 (109) |
| Hida Bushi | 3 | Two Pincers One Mind | Core Rulebook p.106 (109) |
| Hida Bushi | 4 | Devastating Blow | Core Rulebook p.106 (109) |
| Hida Bushi | 5 | The Mountain Does Not Fall | Core Rulebook p.107 (110) |
| Hida Pragmatist [Bushi] | 1 | The Eternal Stone Unleashed | Emerald Empire p.247 (248) |
| Hida Pragmatist [Bushi] | 2 | Wearing Down the Mountain | Emerald Empire p.247 (248) |
| Hida Pragmatist [Bushi] | 3 | Fury of the Avalanche | Emerald Empire p.247 (248) |
| Hida Pragmatist [Bushi] | 4 | Stone Turns Steel Aside | Emerald Empire p.247 (248) |
| Hida Pragmatist [Bushi] | 5 | Fight to the End | Emerald Empire p.247 (248) |
| Hiruma Bushi | 1 | Torch’s Flame Flickers | Core Rulebook p.108 (111) |
| Hiruma Bushi | 2 | Wolf’s Little Lesson | Core Rulebook p.108 (111) |
| Hiruma Bushi | 3 | Hummingbird Wings | Core Rulebook p.108 (111) |
| Hiruma Bushi | 4 | Shark Smells Blood | Core Rulebook p.108 (111) |
| Hiruma Bushi | 5 | Daylight Wastes No Movement | Core Rulebook p.108 (111) |
| Horiuchi Shugenja | 1 | Mysteries of Meishodo | The Great Clans p.258 (259) |
| Ide Emissary [Courtier] | 1 | The Heart Speaks | Core Rulebook p.131 (134) |
| Ide Emissary [Courtier] | 2 | Piercing the Veils | Core Rulebook p.131 (134) |
| Ide Emissary [Courtier] | 3 | The Heart Listens | Core Rulebook p.131 (134) |
| Ide Emissary [Courtier] | 4 | Answering the Heart | Core Rulebook p.131 (134) |
| Ide Emissary [Courtier] | 5 | The Immovable Hand of Peace | Core Rulebook p.131 (134) |
| Ikoma Bard [Courtier] | 1 | The Herald of Glory | Core Rulebook p.118 (121) |
| Ikoma Bard [Courtier] | 2 | The Heart of the Lion | Core Rulebook p.119 (122) |
| Ikoma Bard [Courtier] | 3 | The Voice of the Ancestors | Core Rulebook p.119 (122) |
| Ikoma Bard [Courtier] | 4 | The Strength of Tradition | Core Rulebook p.119 (122) |
| Ikoma Bard [Courtier] | 5 | Every Lion is Your Brother | Core Rulebook p.119 (122) |
| Ikoma Lion’s Shadow [Bushi] | 1 | No Boundaries | Emerald Empire p.109 (110) |
| Ikoma Lion’s Shadow [Bushi] | 2 | The Lion Cannot Fail | Emerald Empire p.109 (110) |
| Ikoma Lion’s Shadow [Bushi] | 3 | The Spirit of Ikoma | Emerald Empire p.109 (110) |
| Ikoma Lion’s Shadow [Bushi] | 4 | The Quiet Lion’s Claws | Emerald Empire p.109 (110) |
| Ikoma Lion’s Shadow [Bushi] | 5 | Ferocious Determination | Emerald Empire p.109 (110) |
| Isawa Shugenja | 1 | Isawa’s Gift | Core Rulebook p.124 (127) |
| Iuchi Shugenja | 1 | Spirit of the Wind | Core Rulebook p.131 (134) |
| Kaiu Engineer [Artisan/Bushi] | 1 | The Kaiu Method | The Great Clans p.39 (40) |
| Kaiu Engineer [Artisan/Bushi] | 2 | The Path of Stone | The Great Clans p.39 (40) |
| Kaiu Engineer [Artisan/Bushi] | 3 | The Path of the Shell | The Great Clans p.39 (40) |
| Kaiu Engineer [Artisan/Bushi] | 4 | The Path of War | The Great Clans p.40 (41) |
| Kaiu Engineer [Artisan/Bushi] | 5 | The Path of Steel | The Great Clans p.40 (41) |
| Kakita Artisan | 1 | Soul of the Artisan | The Great Clans p.72 (73) |
| Kakita Artisan | 2 | The Soul’s Dream | The Great Clans p.72 (73) |
| Kakita Artisan | 3 | Free the Spirit | The Great Clans p.72 (73) |
| Kakita Artisan | 4 | Undying Name | The Great Clans p.72 (73) |
| Kakita Artisan | 5 | A Gift Beyond Price | The Great Clans p.72 (73) |
| Kakita Bushi | 1 | The Way of the Crane | Core Rulebook p.109 (112) |
| Kakita Bushi | 2 | Speed of Lightning | Core Rulebook p.109 (112) |
| Kakita Bushi | 3 | First and Last Strike | Core Rulebook p.109 (112) |
| Kakita Bushi | 4 | One Strike Two Cuts | Core Rulebook p.109 (112) |
| Kakita Bushi | 5 | Strike With No Thought | Core Rulebook p.110 (113) |
| Kitsu Shugenja | 1 | Eyes of the Ancestors | Core Rulebook p.118 (121) |
| Kitsuki Investigator [Courtier] | 1 | Kitsuki’s Method | Core Rulebook p.114 (117) |
| Kitsuki Investigator [Courtier] | 2 | Wisdom the Wind Brings | Core Rulebook p.114 (117) |
| Kitsuki Investigator [Courtier] | 3 | Know the Rhythm of the Heart | Core Rulebook p.114 (117) |
| Kitsuki Investigator [Courtier] | 4 | Finding the Path | Core Rulebook p.114 (117) |
| Kitsuki Investigator [Courtier] | 5 | The Eyes Betray the Heart | Core Rulebook p.114 (117) |
| Kuni Shugenja | 1 | Gaze Into Shadow | Core Rulebook p.107 (110) |
| Kuni Witch-Hunter [Monk] | 1 | To See the Darkness | The Great Clans p.40 (41) |
| Kuni Witch-Hunter [Monk] | 2 | To Ride the Darkness | The Great Clans p.40 (41) |
| Kuni Witch-Hunter [Monk] | 3 | To Strike the Darkness | The Great Clans p.40 (41) |
| Kuni Witch-Hunter [Monk] | 4 | To Repel the Darkness | The Great Clans p.41 (42) |
| Kuni Witch-Hunter [Monk] | 5 | To Shatter the Darkness | The Great Clans p.41 (42) |
| Lion Elite Spearmen [Bushi] | 1 | The Way of Magari-Yarijutsu | Naishou Province p.7 (8) |
| Lion Elite Spearmen [Bushi] | 2 | Strike Like The Lion | Naishou Province p.7 (8) |
| Lion Elite Spearmen [Bushi] | 3 | Strike Through the Eagle | Naishou Province p.7 (8) |
| Lion Elite Spearmen [Bushi] | 4 | Strike Like the Wind | Naishou Province p.7 (8) |
| Lion Elite Spearmen [Bushi] | 5 | Strike With the Soul | Naishou Province p.7 (8) |
| Matsu Beastmaster [Bushi] | 1 | One with the Pride | The Great Clans p.137 (138) |
| Matsu Beastmaster [Bushi] | 2 | Heart of the Beast | The Great Clans p.137 (138) |
| Matsu Beastmaster [Bushi] | 3 | The Ferocity Within | The Great Clans p.137 (138) |
| Matsu Beastmaster [Bushi] | 4 | All as One | The Great Clans p.138 (139) |
| Matsu Beastmaster [Bushi] | 5 | With the Soul of a Lion | The Great Clans p.138 (139) |
| Matsu Berserker [Bushi] | 1 | The Lion’s Roar | Core Rulebook p.119 (122) |
| Matsu Berserker [Bushi] | 2 | Matsu’s Fury | Core Rulebook p.119 (122) |
| Matsu Berserker [Bushi] | 3 | The Lion’s Charge | Core Rulebook p.119 (122) |
| Matsu Berserker [Bushi] | 4 | Matsu’s Courage | Core Rulebook p.119 (122) |
| Matsu Berserker [Bushi] | 5 | The Lion’s Victory | Core Rulebook p.119 (122) |
| Mirumoto Bushi | 1 | Way of the Dragon | Core Rulebook p.113 (116) |
| Mirumoto Bushi | 2 | The Calm in Midst of Thunder | Core Rulebook p.113 (116) |
| Mirumoto Bushi | 3 | Strong and Swift | Core Rulebook p.113 (116) |
| Mirumoto Bushi | 4 | Furious Retaliation | Core Rulebook p.113 (116) |
| Mirumoto Bushi | 5 | Heart of the Dragon | Core Rulebook p.113 (116) |
| Mirumoto Taoist Swordsman [Bushi] | 1 | Aligned With the Elements | Emerald Empire p.221 (222) |
| Mirumoto Taoist Swordsman [Bushi] | 2 | Fist and Blade | Emerald Empire p.221 (222) |
| Mirumoto Taoist Swordsman [Bushi] | 3 | Strike of Harmony | Emerald Empire p.221 (222) |
| Mirumoto Taoist Swordsman [Bushi] | 4 | Master of Steel | Emerald Empire p.221 (222) |
| Mirumoto Taoist Swordsman [Bushi] | 5 | Balance of Nothingness | Emerald Empire p.221 (222) |
| Miya Herald [Courtier] | 1 | Voice of the Emperor | Core Rulebook p.230 (233) |
| Miya Herald [Courtier] | 2 | Eyes of the Emperor | Core Rulebook p.230 (233) |
| Miya Herald [Courtier] | 3 | Hand of the Emperor | Core Rulebook p.230 (233) |
| Miya Herald [Courtier] | 4 | Blessing of the Emperor | Core Rulebook p.230 (233) |
| Miya Herald [Courtier] | 5 | Glory of the Emperor | Core Rulebook p.230 (233) |
| Moto Bushi | 1 | The Way of the Unicorn | Core Rulebook p.130 (133) |
| Moto Bushi | 2 | Shinsei’s Smile | Core Rulebook p.130 (133) |
| Moto Bushi | 3 | Desert Wind Strike | Core Rulebook p.130 (133) |
| Moto Bushi | 4 | The Charge of Madness | Core Rulebook p.130 (133) |
| Moto Bushi | 5 | Moto Cannot Yield | Core Rulebook p.130 (133) |
| Moto Death Priest [Shugenja] | 1 | Blessings of the Shi-Tien Yen-Wang | Imperial Histories 1 p.241 (242) |
| Moto Vindicator [Bushi] | 1 | Purity of the Breath | The Great Clans p.258 (259) |
| Moto Vindicator [Bushi] | 2 | Facing the Dark Within | The Great Clans p.259 (260) |
| Moto Vindicator [Bushi] | 3 | Justice of Our Ancestors | The Great Clans p.259 (260) |
| Moto Vindicator [Bushi] | 4 | Avenging Our Own | The Great Clans p.259 (260) |
| Moto Vindicator [Bushi] | 5 | Bloodied but Unbowed | The Great Clans p.259 (260) |
| Ninube Shugenja | 1 | Mask of the Nothing | The Great Clans p.281 (282) |
| Order of Peaceful Repose [Monk] | 1 | Emma-O’s Insight | Secrets of the Empire p.242 (243) |
| Order of the Five Rings [Monk] | 1 | Cracks within the Elements | Imperial Histories 2 p.103 (104) |
| Order of the Wind [Monk] | 1 | Essence of the Wind | Book of Air p.193 (194) |
| Otomo Courtier | 1 | The Voice of Heaven | Core Rulebook p.229 (232) |
| Otomo Courtier | 2 | Destiny Has No Secrets | Core Rulebook p.229 (232) |
| Otomo Courtier | 3 | My Master’s Voice | Core Rulebook p.229 (232) |
| Otomo Courtier | 4 | The Emperor’s Protection | Core Rulebook p.229 (232) |
| Otomo Courtier | 5 | The Virtues of Command | Core Rulebook p.229 (232) |
| Seppun Guardsman [Bushi] | 1 | Never in Darkness | Core Rulebook p.228 (231) |
| Seppun Guardsman [Bushi] | 2 | The Clouds Part | Core Rulebook p.228 (231) |
| Seppun Guardsman [Bushi] | 3 | Sun’s Light Reveals | Core Rulebook p.228 (231) |
| Seppun Guardsman [Bushi] | 4 | Speed of Heaven | Core Rulebook p.228 (231) |
| Seppun Guardsman [Bushi] | 5 | Heaven Never Falls | Core Rulebook p.228 (231) |
| Seppun Shugenja | 1 | In Defense of the Throne | Core Rulebook p.229 (232) |
| Shiba Artisan [Courtier] | 1 | Soul of Brilliance | Emerald Empire p.123 (124) |
| Shiba Artisan [Courtier] | 2 | The Way of Sincerity | Emerald Empire p.123 (124) |
| Shiba Artisan [Courtier] | 3 | The Art Speaks | Emerald Empire p.123 (124) |
| Shiba Artisan [Courtier] | 4 | Bounty of the Craft | Emerald Empire p.123 (124) |
| Shiba Artisan [Courtier] | 5 | The Touch of Destiny | Emerald Empire p.123 (124) |
| Shiba Bushi | 1 | The Way of the Phoenix | Core Rulebook p.123 (126) |
| Shiba Bushi | 2 | Dancing With the Elements | Core Rulebook p.123 (126) |
| Shiba Bushi | 3 | One With the Void | Core Rulebook p.123 (126) |
| Shiba Bushi | 4 | Move With the World | Core Rulebook p.123 (126) |
| Shiba Bushi | 5 | Touch of the Void | Core Rulebook p.123 (126) |
| Shinjo Bushi | 1 | The Way of the Ki-Rin | Emerald Empire p.31 (32) |
| Shinjo Bushi | 2 | Dance of the Blade | Emerald Empire p.31 (32) |
| Shinjo Bushi | 3 | The Four Winds Strike | Emerald Empire p.31 (32) |
| Shinjo Bushi | 4 | Spirit of the Blade Unleashed | Emerald Empire p.31 (32) |
| Shinjo Bushi | 5 | Dancing With the Fortunes | Emerald Empire p.31 (32) |
| Shinmaki Order [Monk] | 1 | The Diamond Sutra | Emerald Empire p.207 (208) |
| Shosuro Actor [Ninja] | 1 | The First Face | The Great Clans p.229 (230) |
| Shosuro Actor [Ninja] | 2 | The Subtle Sting | The Great Clans p.229 (230) |
| Shosuro Actor [Ninja] | 3 | The Second Face | The Great Clans p.229 (230) |
| Shosuro Actor [Ninja] | 4 | The Viper’s Kiss | The Great Clans p.229 (230) |
| Shosuro Actor [Ninja] | 5 | The Third Face | The Great Clans p.229 (230) |
| Shosuro Infiltrator [Ninja] | 1 | The Path of Shadows | Core Rulebook p.129 (132) |
| Shosuro Infiltrator [Ninja] | 2 | Strike From Darkness | Core Rulebook p.129 (132) |
| Shosuro Infiltrator [Ninja] | 3 | Steel Within Silk | Core Rulebook p.129 (132) |
| Shosuro Infiltrator [Ninja] | 4 | Whisper of Steel | Core Rulebook p.129 (132) |
| Shosuro Infiltrator [Ninja] | 5 | The Final Silence | Core Rulebook p.129 (132) |
| Soshi Magistrate [Bushi] | 1 | The Face of Justice | Emerald Empire p.171 (172) |
| Soshi Magistrate [Bushi] | 2 | Rise to Meet the Challenge | Emerald Empire p.171 (172) |
| Soshi Magistrate [Bushi] | 3 | The Magistrate’s Cut | Emerald Empire p.171 (172) |
| Soshi Magistrate [Bushi] | 4 | Certainty of Purpose | Emerald Empire p.171 (172) |
| Soshi Magistrate [Bushi] | 5 | Relentless Resolve | Emerald Empire p.171 (172) |
| Soshi Shugenja | 1 | The Kami’s Whisper | Core Rulebook p.127 (130) |
| Tamori Shugenja | 1 | Flesh of the Elements | Core Rulebook p.113 (116) |
| Temple of Persistence [Monk] | 1 | Unyielding Spirit | Book of Earth p.205 (206) |
| Tengoku’s Fist [Monk] | 1 | The Hand of the Heavens | Book of Fire p.191 (192) |
| The Four Temples [Monk] | 1 | Soul of Civility | Core Rulebook p.231 (234) |
| The Hitomi Kikage Zumi Order [Monk] | 1 | The Gift of the Lady | Imperial Histories 1 p.215 (216) |
| The Hitomi Kikage Zumi Order [Monk] | 2 | Strike the Base | Imperial Histories 1 p.215 (216) |
| The Hitomi Kikage Zumi Order [Monk] | 3 | Moving the Wind | Imperial Histories 1 p.215 (216) |
| The Hitomi Kikage Zumi Order [Monk] | 4 | Strike the Center | Imperial Histories 1 p.215 (216) |
| The Hitomi Kikage Zumi Order [Monk] | 5 | Strike the Summit | Imperial Histories 1 p.215 (216) |
| The Hoshi Tsurui Zumi Order [Monk] | 1 | Swift Fist, Subtle Heart | Imperial Histories 1 p.215 (216) |
| The Order of Eternity [Monk] | 1 | The Touch of Eternity | Book of Void p.193 (194) |
| The Order of Heroes [Monk] | 1 | Destiny’s Hand | Core Rulebook p.232 (235) |
| The Order of Jurojin’s Blessing [Monk] | 1 | Blessings of Longevity | Book of Water p.187 (188) |
| The Order of Rebirth [Monk] | 1 | Changing the Way | Book of Fire p.191 (192) |
| The Order of the Nameless Gift [Monk] | 1 | Shinsei’s Gift | Book of Earth p.205 (206) |
| The Order of the Spider Monks [Monk] | 1 | The Dark Path | Core Rulebook p.215 (218) |
| The Order of the Spider Monks [Monk] | 2 | Drawing in the Strike | Core Rulebook p.215 (218) |
| The Order of the Spider Monks [Monk] | 3 | Speed of Darkness | Core Rulebook p.215 (218) |
| The Order of the Spider Monks [Monk] | 4 | Guarded by Chi | Core Rulebook p.215 (218) |
| The Order of the Spider Monks [Monk] | 5 | Darkness Unleashed | Core Rulebook p.215 (218) |
| The Shrine of Heaven’s Mirror [Monk] | 1 | Gaze into the Mirror | Book of Water p.188 (189) |
| The Shrine of the Seven Thunders [Monk] | 1 | Walk with the Prophet | Core Rulebook p.232 (235) |
| The Temple of Heavenly Wisdom [Monk] | 1 | The Largesse of Fukurokujin | Book of Fire p.191 (192) |
| The Temple of Kaimetsu-uo [Monk] | 1 | The Path of Purity | Core Rulebook p.233 (236) |
| The Temple of Osano-Wo [Monk] | 1 | The Hand of Thunder | Core Rulebook p.233 (236) |
| The Temples of the Thousand Fortunes [Monk] | 1 | The Thousand Forms | Core Rulebook p.233 (236) |
| The Togashi Tattooed Order [Monk] | 1 | Blood of the Kami | Core Rulebook p.114 (117) |
| The Togashi Tattooed Order [Monk] | 2 | Body of Stone | Core Rulebook p.115 (118) |
| The Togashi Tattooed Order [Monk] | 3 | Blessing of the Kami | Core Rulebook p.115 (118) |
| The Togashi Tattooed Order [Monk] | 4 | Will of Stone | Core Rulebook p.115 (118) |
| The Togashi Tattooed Order [Monk] | 5 | Touch of the Kami | Core Rulebook p.115 (118) |
| Toritaka Bushi | 1 | The Falcon’s Eyes | Core Rulebook p.219 (222) |
| Toritaka Bushi | 2 | The Falcon Takes Flight | Core Rulebook p.219 (222) |
| Toritaka Bushi | 3 | The Falcon’s Wings | Core Rulebook p.219 (222) |
| Toritaka Bushi | 4 | Vigilant and Strong | Core Rulebook p.219 (222) |
| Toritaka Bushi | 5 | Claws of the Falcon | Core Rulebook p.219 (222) |
| Utaku Battle Maiden [Bushi] | 1 | Riding in Harmony | Core Rulebook p.132 (135) |
| Utaku Battle Maiden [Bushi] | 2 | The Void of War | Core Rulebook p.132 (135) |
| Utaku Battle Maiden [Bushi] | 3 | Sensing the Breeze | Core Rulebook p.132 (135) |
| Utaku Battle Maiden [Bushi] | 4 | Wind Never Stops | Core Rulebook p.132 (135) |
| Utaku Battle Maiden [Bushi] | 5 | Otaku’s Blessing | Core Rulebook p.132 (135) |
| Utaku Mounted Infantry [Bushi] | 1 | Choose Your Weapon | Imperial Histories 2 p.169 (170) |
| Utaku Mounted Infantry [Bushi] | 2 | Speed of My Sisters | Imperial Histories 2 p.169 (170) |
| Utaku Mounted Infantry [Bushi] | 3 | All-Fronts Attack | Imperial Histories 2 p.169 (170) |
| Utaku Mounted Infantry [Bushi] | 4 | Utaku’s Thunder | Imperial Histories 2 p.169 (170) |
| Utaku Mounted Infantry [Bushi] | 5 | Epic of My Name | Imperial Histories 2 p.169 (170) |
| Wind’s Grace Order [Monk] | 1 | Pillars of the Mind’s Eye | Book of Air p.194 (195) |
| Yasuki Courtier | 1 | The Way of the Carp | Core Rulebook p.107 (110) |
| Yasuki Courtier | 2 | Do As We Say | Core Rulebook p.108 (111) |
| Yasuki Courtier | 3 | Treasures of the Carp | Core Rulebook p.108 (111) |
| Yasuki Courtier | 4 | Wiles of the Carp | Core Rulebook p.108 (111) |
| Yasuki Courtier | 5 | What is Yours is Mine | Core Rulebook p.108 (111) |
| Yogo Wardmaster [Shugenja] | 1 | Way of the Wardmaster | The Great Clans p.229 (230) |
| Hiruma Scout [Bushi] | 1 | Dance the Razor's Edge | Imperial Histories 1 p.147 (148) |
| Hiruma Scout [Bushi] | 2 | Run Like the Wind | Imperial Histories 1 p.147 (148) |
| Hiruma Scout [Bushi] | 3 | Veil of the Spirits | Imperial Histories 1 p.147 (148) |
| Hiruma Scout [Bushi] | 4 | Harness the Wind | Imperial Histories 1 p.147 (148) |
| Hiruma Scout [Bushi] | 5 | Strike of the Stalker | Imperial Histories 1 p.147 (148) |
| Yotsu Bushi School (Heroes of Rokugan) [Bushi] | 1 | The Tiger's Tread | Imperial Histories 1 p.276 (277) |
| Yotsu Bushi School (Heroes of Rokugan) [Bushi] | 2 | The Tiger's Pounce | Imperial Histories 1 p.277 (278) |
| Yotsu Bushi School (Heroes of Rokugan) [Bushi] | 3 | Rending Claws | Imperial Histories 1 p.277 (278) |
| Yotsu Bushi School (Heroes of Rokugan) [Bushi] | 4 | Shelter the Blameless (Yotsu Bushi) | Imperial Histories 1 p.277 (278) |
| Yotsu Bushi School (Heroes of Rokugan) [Bushi] | 5 | The Tiger's Fangs | Imperial Histories 1 p.277 (278) |

### Clans (25)

| Name | Printed page (PDF page) |
|---|---|
| Badger Clan | Core Rulebook p.215 (218) |
| Bat Clan | Core Rulebook p.216 (219) |
| Boar Clan | Core Rulebook p.217 (220) |
| Crab Clan | Core Rulebook p.105 (108) |
| Crane Clan | Core Rulebook p.109 (112) |
| Dragon Clan | Core Rulebook p.112 (115) |
| Dragonfly Clan | Core Rulebook p.218 (221) |
| Falcon Clan | Core Rulebook p.218 (221) |
| Fox Clan | Core Rulebook p.219 (222) |
| Hare Clan | Core Rulebook p.220 (223) |
| Imperial Clan | Core Rulebook p.227 (230) |
| Lion Clan | Core Rulebook p.116 (119) |
| Mantis Clan | Core Rulebook p.120 (123) |
| Monkey Clan | Core Rulebook p.221 (224) |
| Oriole Clan | Core Rulebook p.222 (225) |
| Ox Clan | Core Rulebook p.223 (226) |
| Phoenix Clan | Core Rulebook p.123 (126) |
| Ronin Clan | Imperial Histories 1 p.275 (276) |
| Scorpion Clan | Core Rulebook p.126 (129) |
| Snake Clan | Core Rulebook p.224 (227) |
| Sparrow Clan | Core Rulebook p.224 (227) |
| Spider Clan | Core Rulebook p.211 (214) |
| Tiger Clan | Imperial Histories 1 p.276 (277) |
| Tortoise Clan | Core Rulebook p.225 (228) |
| Unicorn Clan | Core Rulebook p.129 (132) |

### Families (68)

| Clan | Name | Printed page (PDF page) |
|---|---|---|
| Phoenix | Agasha | Core Rulebook p.123 (126) |
| Lion | Akodo | Core Rulebook p.116 (119) |
| Crane | Asahina | Core Rulebook p.109 (112) |
| Phoenix | Asako | Core Rulebook p.123 (126) |
| Scorpion | Bayushi | Core Rulebook p.126 (129) |
| Spider | Chuda | Core Rulebook p.211 (214) |
| Snake | Chuda | Core Rulebook p.224 (227) |
| Crane | Daidoji | Core Rulebook p.109 (112) |
| Spider | Daigotsu | Core Rulebook p.211 (214) |
| Crane | Doji | Core Rulebook p.109 (112) |
| Monkey | Fuzake | Core Rulebook p.221 (224) |
| Spider | Goju | Core Rulebook p.211 (214) |
| Imperial | Hantei | Core Rulebook p.228 (231) |
| Boar | Heichi | Core Rulebook p.217 (220) |
| Crab | Hida | Core Rulebook p.105 (108) |
| Crab | Hiruma | Core Rulebook p.105 (108) |
| Dragon | Hitomi | Imperial Histories 1 p.214 (215) |
| Unicorn | Horiuchi | Core Rulebook p.129 (132) |
| Dragon | Hoshi | Imperial Histories 1 p.214 (215) |
| Badger | Ichiro | Core Rulebook p.215 (218) |
| Unicorn | Ide | Core Rulebook p.129 (132) |
| Lion | Ikoma | Core Rulebook p.116 (119) |
| Phoenix | Isawa | Core Rulebook p.123 (126) |
| Unicorn | Iuchi | Core Rulebook p.129 (132) |
| Ronin | Kaeru | Imperial Histories 1 p.275 (276) |
| Crab | Kaiu | Core Rulebook p.105 (108) |
| Crane | Kakita | Core Rulebook p.109 (112) |
| Tortoise | Kasuga | Core Rulebook p.225 (228) |
| Lion | Kitsu | Core Rulebook p.116 (119) |
| Dragon | Kitsuki | Core Rulebook p.112 (115) |
| Fox | Kitsune | Core Rulebook p.219 (222) |
| Mantis | Kitsune | Core Rulebook p.120 (123) |
| Bat | Komori | Core Rulebook p.216 (219) |
| Crab | Kuni | Core Rulebook p.105 (108) |
| Lion | Matsu | Core Rulebook p.116 (119) |
| Dragon | Mirumoto | Core Rulebook p.112 (115) |
| Imperial | Miya | Core Rulebook p.227 (230) |
| Ox | Morito | Core Rulebook p.223 (226) |
| Mantis | Moshi | Core Rulebook p.120 (123) |
| Unicorn | Moto | Core Rulebook p.130 (133) |
| Imperial | Nasu | Imperial Histories 1 p.67 (68) |
| Imperial | Otomo | Core Rulebook p.227 (230) |
| Imperial | Seppun | Core Rulebook p.227 (230) |
| Phoenix | Shiba | Core Rulebook p.123 (126) |
| Unicorn | Shinjo | Core Rulebook p.130 (133) |
| Scorpion | Shosuro | Core Rulebook p.126 (129) |
| Scorpion | Soshi | Core Rulebook p.126 (129) |
| Spider | Spider Monks | Core Rulebook p.212 (215) |
| Sparrow | Suzume | Core Rulebook p.224 (227) |
| Dragon | Tamori | Core Rulebook p.112 (115) |
| Dragon | Togashi | Core Rulebook p.112 (115) |
| Monkey | Toku | Core Rulebook p.221 (224) |
| Dragonfly | Tonbo | Core Rulebook p.218 (221) |
| Crab | Toritaka | Core Rulebook p.106 (109) |
| Falcon | Toritaka | Core Rulebook p.218 (221) |
| Imperial | Toturi | Core Rulebook p.228 (231) |
| Ronin | Tsi | Imperial Histories 1 p.275 (276) |
| Oriole | Tsi | Core Rulebook p.222 (225) |
| Ronin | Tsume | Imperial Histories 1 p.275 (276) |
| Mantis | Tsuruchi | Core Rulebook p.120 (123) |
| Hare | Ujina | Core Rulebook p.220 (223) |
| Hare | Usagi | Core Rulebook p.220 (223) |
| Unicorn | Utaku | Core Rulebook p.130 (133) |
| Crab | Yasuki | Core Rulebook p.106 (109) |
| Scorpion | Yogo | Core Rulebook p.126 (129) |
| Mantis | Yoritomo | Core Rulebook p.120 (123) |
| Ronin | Yotsu | Imperial Histories 1 p.275 (276) |
| Tiger | Yotsu | Imperial Histories 1 p.276 (277) |
