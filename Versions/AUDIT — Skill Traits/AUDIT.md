# Skill Traits — Sourcebook Audit (10 October 2026)

Asked for by the owner after the Phase 14.1 check (F10: "only one Willpower Skill, one Strength, no Stamina: is this
correct?"). No code changed. Published as a doc: [Skill Traits — Sourcebook Audit](https://claude.ai/code/artifact/04fd60a2-c230-4827-8942-4ef186f8061d).

**Result: 40 of the sheet's 44 Skills carry the Trait the books give them.** Intimidation is wrong (Core Rulebook
p.144 gives Awareness; the sheet has Willpower), and Perform, Games and Craft give each sub-skill its own Trait where the
sheet uses Awareness for all. A named sub-skill row ("Perform: Biwa", "Games: Go") takes its family's Trait on the sheet
(`209.9995-bugfix-school-skill-rows.js`), so today every one of them rolls Awareness.

## What to correct

| Skill | Sheet | Books | Page | Proposed |
|---|---|---|---|---|
| Intimidation | Willpower | Awareness | Core p.144 | Awareness |
| Perform | Awareness for every sub-skill | Biwa, Dance, Drums, Flute, Puppeteer, Samisen: Agility. Oratory, Song, Storytelling: Awareness | Core p.137 | Each sub-skill its own Trait |
| Games | Awareness for every sub-skill | Fortunes & Winds, Letters, Sadane: Awareness. Go, Shogi: Intelligence. Kemari: Agility | Core p.136 | Each sub-skill its own Trait |
| Craft | Awareness for every sub-skill | "Varies"; no Trait printed for any craft | Core p.143 | Owner's ruling |

## Willpower, Strength and Stamina

No Skill in any of the 16 books defaults to Willpower or Stamina; Athletics is the only Strength Skill (Core p.139).
Book of Earth pp.8–9 lists optional pairings a GM may call for: Stamina for Athletics, Artisan, Craft, Perform and
Stealth; Willpower for Animal Handling, Etiquette and Intimidation. They are alternatives for situations, not the Skills'
Traits; likely how the sheet came to give Intimidation Willpower.

## Rolls the books make with another Trait

The sheet's Skills table always rolls the Skill's own Trait.

| Roll | Trait | Where |
|---|---|---|
| Athletics (Throwing) | Agility | Core p.139 (in the entry); also Core pp.79, 113, 157 |
| Meditation (Fasting) | Stamina | Core p.137 (in the entry) |
| Etiquette (Courtesy) | Willpower | Resisting Intimidation (Core p.144); 16 rolls in all, among them Core pp.111, 121, 131, Book of Air pp.178–179 |
| Iaijutsu (Focus) | Void | Duels: Core pp.87, 140; Book of Fire p.181 |
| Iaijutsu (Assessment) | Awareness | Duels: Core p.87 |
| Intimidation (Control) | Willpower | Core pp.121, 229; Book of Earth p.202 |
| Investigation (Interrogation) | Intelligence | Core p.114 |
| Jiujutsu | Strength | Core p.88; Book of Earth p.51; Book of Water p.178 |

## All 44 Skills

Matching (sheet = books): Acting, Artisan, Courtier, Etiquette, Sincerity, Animal Handling, Temptation (Awareness);
Calligraphy, Divination, Lore, Medicine, Spellcraft, Commerce, Engineering (Intelligence); Cannon, Firearms
(Intelligence, Imperial Histories 1 pp.96, 95); Investigation, Battle, Hunting (Perception); Meditation, Tea Ceremony
(Void); Athletics (Strength); Defense, Iaijutsu, Kyujutsu (Reflexes); Horsemanship, Jiujutsu, Chain Weapons, Heavy
Weapons, Kenjutsu, Knives, Polearms, Spears, Staves, War Fan, Forgery, Sleight of Hand, Stealth (Agility); Ninjutsu
(Agility or Reflexes); Sailing (Agility or Intelligence). Core pp.135–145. Not matching: Games, Perform, Craft,
Intimidation (above).

## Method

All 16 books' text (extracted to a scratch folder only, as the 30 September ruling requires) was searched for every Skill
heading (a "NAME (TRAIT)" line followed by its sub-types or emphases) and every roll written "Skill / Trait". Only the
Core Rulebook and Imperial Histories 1 define Skills; no other book gives a Skill a different Trait. Pages are printed
pages (the sourcebook index's offsets).

## Proposed (needs the owner's approval)

A small removable correction, about 3–5 points with its tests: Intimidation becomes Awareness; a named Perform or Games
row takes its own sub-skill's Trait. Rulings first: (1) existing characters: correct a row still holding the old Trait
when opened, leave a Trait changed by hand (recommended), or leave saves as they are; (2) Craft: keep Awareness as the
starting Trait with a note that the GM sets it (recommended), or ask for a Trait when a Craft is added; (3) rolls with
another Trait: park as FT-28, a Trait choice on any Skill roll, with Phase 15 (recommended).
