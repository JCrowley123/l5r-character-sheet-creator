# Character Finder: design

**Status, 25 November 2026:** design approved by the owner (24–25 November), with every ruling in section 1 applied.
The scoring is at version 2 and passes 21 automated tests with pass marks (section 9). The rating audit (section 10)
is **approved and under way**: steps 1 and 2 are done; step 3, reading the books, is ready for a Claude session on
the owner's laptop, where the PDFs are (`audit/KICKOFF-BOOK-READING.md`). **Nothing is built and no application file
is changed.**

**Place:** a new Part, as the owner ruled and named: **Part L — New Player Help**, **Phase 16** (the next unused phase
number; 11.4 was the first draft's number). Part L can later hold tutorials and a glossary. Code marker `PART L PHASE 16`
(the dependency checker's `MARKER_RE` accepts it). Players see the buttons **"Help me choose"** and **"Not sure what
to play?"**; "Character Finder" is the internal name.

**Review page:** <https://claude.ai/artifact/PoyremW11mLkwik15pEvW1>, with a working "Try it" version of the
questionnaire that uses this design's data and version 2 scoring. Its source is `review-page/`.

**In one paragraph.** An optional questionnaire for players who do not know what to play. Up to twelve
multiple-choice questions, each with a "No preference" answer, narrow the 105 Basic Schools the app offers down
to 1–2 **best matches**, four more **worth a look**, and sometimes a **something different** pick. Every
recommendation opens a **guide**: what the character is, how they play, how to roleplay them (with optional
questions to think about), a suggested starting build, where they can go later, and any reason to talk to the
GM first. A **Build** button hands the choice to the creation wizard, which applies Clan, Family and School
through its own steps and carries on from Rings & Traits. It is a guide, not a builder: the player still makes
every purchase.

---

## 1. The owner's decisions

**24 November 2026**

1. **Full scope.** Every Basic School is a candidate, not only the Great Clans and the Core Rulebook. A new
   player "will not know what they don't know", and a niche character may be the one they enjoy most.
2. **Two questions set the player's comfort level** (complexity, and how unusual). They **rank** results and
   never hide them.
3. **A guide, not a build.** The player decides what to build.
4. **GM warnings** on complex or niche characters.
5. **A Build button** that feeds the creation wizard, so the player carries on with Skills and the rest.
6. **A suggested starting build** in each guide.

**25 November 2026** (the owner's answers to the nine questions, and to the reliability review)

| # | Question | Ruling |
|---|---|---|
| — | Reliability | Apply the scoring fixes; show a sample, not a "match", when every answer is "No preference"; give near-twins a distinguishing label wherever the books separate them; keep it all as automated tests with pass marks. Target: a player who roughly knows what they want finds it in the top six **9 times in 10**. |
| 1 | Name and place | **A new Part** for new-player help (tutorials and a glossary may follow); buttons say "Help me choose" and "Not sure what to play?" |
| 2 | The magic filter | **"Yes" filters; "No" pushes Shugenja down but keeps them.** "If all of their other answers give 90% to a Shugenja school, including it as an option may entice them to play something they had not thought of." |
| 3 | Where it starts | The wizard's Clan step and the Characters screen now; guides searchable in Search and the Library after the first batch of guides |
| 4 | Reviewing the ratings | The owner is not a subject-matter expert, so "a system or tool needs to be designed" (section 10) |
| 5 | Quick version | No separate quick version; "See my results now" after question 8 |
| 6 | Suggested builds | Hints only. No "Use this build" button |
| 7 | Roleplay prompts | **Removed from character creation.** Prompts stay in the guides only, so players never see them on their character as something they must follow |
| 8 | Ronin | Left out until the planned ronin work adds ronin Schools |
| 9 | Guide order | Clan by clan. It is a personal project until it is ready, so the order is the owner's convenience |

**25 November 2026, later** (the owner's answers to section 13's open items)

| Item | Ruling |
|---|---|
| Rating audit | **Approved** (section 10). The books are on the owner's laptop, in `C:\Users\jcrow\OneDrive\Documents\L5R 4th edition books`, the folder the Sourcebook Index already reads |
| Early exit | **After question 9** (supersedes ruling 5's "after 8", on version 2's measurements) |
| Tattooed monks | **Kept in**, with the "tattoos not modelled yet" note |
| The Part's name | **Part L — New Player Help** |

## 2. What it is built from

All of the following already exists in the app:

| Need | Already in the app |
|---|---|
| Every Basic School with Clan, Honor, Trait benefit, Skills, Outfit, Techniques, Affinity | `SCHOOL_LIBRARY`, `MINOR_CLAN_SCHOOL_LIBRARY`, `BROTHERHOOD_SCHOOL_LIBRARY`, `MISSING_BASIC_SCHOOL_DATA` (106 entries, 105 names: Toritaka Bushi is offered by both the Crab and the Falcon) |
| One or two sentences per School in our own words, with page | `SCHOOLLORE9` (Part H Phase 9.1) |
| Printed page for every School, Clan and Family | `SCHOOLREF1432` (Part K Phase 14.3b) |
| Every Family and its +1 Trait | `FAMILY_LIBRARY`, `MINOR_CLAN_LIBRARY` |
| Technique text in our own words, all five Ranks | `TECH_DESCRIPTIONS` |
| Where a School can go later | `ALTERNATE_PATH_LIBRARY` (214 Paths, each naming the Schools it replaces), `ADVANCED_SCHOOL_LIBRARY` |
| XP costs, the creation cap of 4, the character check | `traitCost`/`voidCost`/`skillCost`, BUGFIX — Creation Cap of Four, `validateCharacter()` |
| Applying Clan, Family and School without new rules | the creation wizard (`CW112`, `CW1121`) |

**Not included: ronin** (owner's ruling 8). `FAMILY_LIBRARY` lists four ronin families, but no ronin School exists
yet. When the planned ronin work adds them, each is one new row in the rating table; answers such as "On the road"
and "No one: they walk alone" will lead to them without changing any question.

**Included, with a note: the tattooed monks.** Ruling 8 covers ronin because the app has no ronin Schools. The
three tattooed orders (Togashi Tattooed Order, Hoshi Tsurui Zumi, Hitomi Kikage Zumi) are different: their Schools
exist and can be built today; only the tattoos' own powers are not tracked yet. They stay in the finder with the
"Good to know: the app does not model tattoos yet" note, which disappears when the planned tattoo work lands (the
owner's ruling, 25 November).

**Not included: Advanced Schools and Alternate Paths.** A new character cannot take them. They appear in each
guide as "Where they can go later".

## 3. The player's journey

### Where it starts (ruling 3)

- **The wizard's Clan step** gains "Not sure? **Help me choose**" above the Clan cards.
- **The Characters screen** gains "**Not sure what to play?**" beside Create New Character. A player can browse
  without making a character; one is only made when they press Build.
- **Later**, after the first batch of guides: guides become searchable in Search and the Library.

### Question screens

Full screen, one question at a time: the question, its answers as large buttons, Back, a progress line
("Question 4 of 12"), and **"See my results now" once 9 questions are answered** (the owner, 25 November). Every question has
"No preference".

### Results screen

```
Your best matches
  [mon] Hida Bushi                 Crab · Bushi           Straightforward · Common
        Endure the enemy's blows, then crush them with heavy weapons.
        [Read the guide]  [Build]

Also worth a look
  [mon] Daidoji Iron Warrior       Crane · Bushi          Straightforward · Common
  [mon] Kuni Shugenja              Crab · Shugenja        Involved · Common
        You said no magic, but the rest of your answers suit this School.
  ...

Something different                                   (only when the player is open to it)

[See all matches (105)]   [Change my answers]
```

- **A Shugenja offered to a player who said "No" to magic** carries the line "You said no magic, but the rest of
  your answers suit this School" (ruling 2). It can appear under "Also worth a look" and "See all matches", never
  as a best match.
- **Too little to go on.** If fewer than two answers say anything about the character (the comfort questions and
  "No preference" do not count), there are no "best matches". The screen shows **"A sample to start from"**: six
  Schools from six different Clans covering at least three types, the most common and simplest first, with "Answer
  a few more questions for real matches".
- **See all matches** lists every School in score order, filterable by Clan, type, complexity and how unusual.
  Nothing is hidden, only ordered.

### Guide screen

1. **At a glance:** Clan mon, Clan and Family (with the Family's +1 Trait), type, starting Honor, the School's
   +1 Trait, complexity, how unusual, source and page.
2. **Ask your GM / Good to know** notes (section 5).
3. **Who they are.**
4. **How they play:** what they are good at, School Skills, the Rank 1 Technique in our own words.
5. **Roleplaying them:** attitudes, relationships, story hooks, one way to play against type, and **"Questions to
   think about"**: a few of the book's Twenty Questions (Core Rulebook pp.100–102) in our own words, chosen for this
   School. These are ideas, not instructions, and nothing is written to the character (ruling 7).
6. **Suggested starting build** (section 8).
7. **Where they can go later.**
8. **Build this character.**

### Build

Build asks for a name if there is no character yet, then drives the creation wizard exactly as a player would: it
chooses the Clan, Family and School cards in turn, so Apply School asks its own Affinity, Deficiency, Honor and
specialisation questions. The player lands on **Rings & Traits** with Name, Clan, Family and School done, and can
go Back and change any of them. If a Clan is already applied, the wizard's existing "start over?" confirmation
appears first. On Rings & Traits, Skills and Advantages & Disadvantages, a folded panel reads "Suggested for a Hida
Bushi" and shows that step's part of the suggested build. It only informs: nothing is bought (ruling 6).

**Removed (ruling 7):** the "Bring them to life" prompts at the wizard's Review step, and writing answers into the
Identity boxes. The character sheet never shows roleplay prompts.

## 4. The questions

**Adaptive order.** Every player answers 11 or 12 questions:

| | Non-caster path | Caster path |
|---|---|---|
| 1–3 | Magic · Complexity · How unusual | the same |
| 4 | Approach (what they reach for first) | What their magic does best |
| 5 | Fight style, or Court style after "Words" or "Craft" | Which Element calls to them |
| 6–9 | Remembered for · Home · Breaking rules · Bushido | the same |
| 10 | How religious | (skipped: a Shugenja is religious by definition) |
| 11–12 | Companion · How they will die | the same |

**Magic (ruling 2).** "Yes" leaves only Shugenja Schools. "No" and "A touch of the mystical" take 3 points off every
Shugenja School and stop them being best matches. They still appear under "Also worth a look" when the other
answers suit them strongly (measured in section 9: 15.7% of players whose answers fit a Shugenja School, but who
said "No", are still offered it).

The Bushido question uses the seven tenets as the app's Paragon Advantage names them (Core p.152). The last
question is the book's own question 20. "What it scores" is what each answer adds to a School before the
arithmetic in section 6 (evening out labels, and the 1.5× weight of the four direct questions).

<!-- generated:QUESTIONS (prototype/tables.py) -->
**Do you want your character to cast spells?** (`magic`)

| Answer | What it scores |
|---|---|
| Yes: magic is the heart of who they are | only Shugenja Schools remain |
| A touch of the mystical, but no spells | a Shugenja School is never a best match, mystic +2, spirits and the dead +1, monster hunter +1, Monk +2, Shugenja -3 |
| No: they rely on their own skill | a Shugenja School is never a best match, mystic -1, Shugenja -3 |
| No preference | no effect |

**How much rules detail do you want to keep track of?** (`complexity`)

| Answer | What it scores |
|---|---|
| Keep it simple: I am still learning the game | Straightforward +3, Some extra +0, Involved -6 |
| Some extra options are fine | Straightforward +1, Some extra +2, Involved +0 |
| Lots of moving parts: I like mastering a system | Straightforward -1, Some extra +1, Involved +3 |
| No preference | no effect |

**How do you feel about unusual characters?** (`niche`)

| Answer | What it scores |
|---|---|
| A classic samurai most players will recognise | Common +3, Uncommon +0, Unusual -6 |
| Open to something a bit different | Common +1, Uncommon +2, Unusual +0, adds a "something different" pick |
| The stranger the better | Common -1, Uncommon +1, Unusual +3, adds a "something different" pick |
| No preference | adds a "something different" pick |

**When trouble starts, what does your character reach for first?** (`approach`)

| Answer | What it scores |
|---|---|
| A sword or another weapon | Bushi +4 |
| Words: persuasion, wit or a well-placed secret | Courtier +4 |
| Inner discipline and their own two hands | unarmed +1, Monk +4 |
| The shadows: they would rather not be seen | stealth +2, Ninja +4 |
| Their craft or their art | artist +1, craftsman +1, Artisan +4 |
| No preference | no effect |

**In a fight, where do you want to be?** (`fight`)

| Answer | What it scores |
|---|---|
| In the front line, taking hits and hitting back harder | front line +3 |
| Facing one opponent: a single perfect strike | duelist +3 |
| At a distance, with a bow | archer +3 |
| On horseback | cavalry +3 |
| Fists, feet and grappling | unarmed +3 |
| Fast and mobile: strike and get away | fast skirmisher +3, stealth +1 |
| Guarding someone who matters | bodyguard +3 |
| Directing the battle | commander +3 |
| All-out attack: no holding back | all-out attacker +3 |
| No preference | no effect |

**Away from a fight, how do they get their way?** (`court`)

| Answer | What it scores |
|---|---|
| Charm, courtesy and making friends | diplomat +3 |
| Secrets, leverage and a little fear | schemer +3 |
| Evidence: they find out the truth | investigator +3 |
| Stories, art and performance | artist +3 |
| Knowledge: they have read everything | scholar +3 |
| Trade: everyone has a price | merchant +3 |
| Making things that last | craftsman +3 |
| No preference | no effect |

**What should their magic be best at?** (`magickind`)

| Answer | What it scores |
|---|---|
| Destroying enemies | battle magic +3 |
| Healing and protecting | healer +3, protective magic +3 |
| Speaking with spirits, ancestors and the dead | spirits and the dead +3 |
| Nature, animals and the weather | nature and weather +3, animal companion +1 |
| Strange or experimental magic | unusual magic +3 |
| Hunting monsters and the Taint | monster hunter +3 |
| Subtle tricks no one notices | stealth +3, schemer +1 |
| Forbidden power, whatever the cost | forbidden power +3 |
| No preference | no effect |

**Which Element calls to them?** (`element`)

| Answer | What it scores |
|---|---|
| Air: subtle, quick and perceptive | Affinity Air +3, Deficiency Air -2 |
| Earth: steady, protective and enduring | Affinity Earth +3, Deficiency Earth -2 |
| Fire: passionate, clever and destructive | Affinity Fire +3, Deficiency Fire -2 |
| Water: adaptable, healing and always moving | Affinity Water +3, Deficiency Water -2 |
| Void: the rare, mystical space between | Affinity Void +3, Deficiency Void -2 |
| No preference | no effect |

**What would they most like to be remembered for?** (`ambition`)

| Answer | What it scores |
|---|---|
| Standing between the Empire and the darkness | monster hunter +2, bodyguard +1 |
| Perfect mastery of an art: the sword, the brush or the stage | duelist +2, artist +2 |
| Victory: battles won and enemies broken | commander +2, front line +2 |
| Wisdom: understanding the secrets of the world | scholar +2, mystic +2 |
| Loyalty in the shadows: doing what others will not | schemer +2, stealth +2 |
| Freedom: going where no one else has been | traveller +2, cavalry +1, sailor +1 |
| Wealth and influence | merchant +2, schemer +1, diplomat +1 |
| The people they saved | healer +2, protective magic +1, bodyguard +1, diplomat +1 |
| No preference | no effect |

**Where do they feel most at home?** (`home`)

| Answer | What it scores |
|---|---|
| On a great wall, facing a monster-haunted wasteland | home: the Wall +3 |
| Elegant courts and castles | home: court +3 |
| High mountains and quiet monasteries | home: mountains +3 |
| Libraries and temples | home: libraries and temples +3 |
| The open plains, on horseback | home: plains +3 |
| At sea, among islands and ports | home: sea +3 |
| On the battlefield, among soldiers | home: battlefield +3 |
| Forests and wild places | home: wilds +3 |
| City streets and shady corners | home: streets and shadows +3 |
| On the road, never in one place for long | home: the road +3 |
| No preference | no effect |

**Would they break the rules to get the job done?** (`rules`)

| Answer | What it scores |
|---|---|
| Never: their word and their honour are everything | high Honor +3, low Honor -3 |
| Only if there is truly no other way | mid Honor +2 |
| Yes, if the result is worth it | low Honor +3, high Honor -1 |
| No preference | no effect |

**Which virtue of Bushido matters most to them?** (`bushido`)

| Answer | What it scores |
|---|---|
| Compassion | healer +2, bodyguard +1, protective magic +1 |
| Courage | front line +2, monster hunter +2, all-out attacker +1 |
| Courtesy | diplomat +2, artist +1 |
| Duty | bodyguard +2, commander +1 |
| Honesty | investigator +2 |
| Honor | high Honor +2 |
| Sincerity | diplomat +1, mystic +1 |
| None of them: results matter more | low Honor +3 |
| No preference | no effect |

**How religious are they?** (`faith`)

| Answer | What it scores |
|---|---|
| Deeply: prayer and meditation shape their life | mystic +3, spirits and the dead +2, Monk +1 |
| Respectful, like most samurai | no effect |
| Not very: steel and results matter more | mystic -2, spirits and the dead -1 |
| No preference | no effect |

**Who or what would you like at their side?** (`companion`)

| Answer | What it scores |
|---|---|
| A loyal horse | cavalry +2, home: plains +1 |
| A hunting falcon or a war-cat | animal companion +3 |
| A ship and its crew | sailor +3 |
| A fine blade, their family's pride | duelist +2 |
| A book or a brush | scholar +2, artist +2 |
| A network of informants | schemer +2, investigator +1 |
| No one: they walk alone | traveller +2, stealth +1, mystic +1 |
| No preference | no effect |

**Every samurai thinks about how they will die. How will yours?** (`death`)

| Answer | What it scores |
|---|---|
| In a last stand, holding the line | front line +2, bodyguard +2 |
| In a duel | duelist +3 |
| Fighting the darkness, far from home | monster hunter +3 |
| Of old age, surrounded by students | scholar +2, mystic +2, healer +1 |
| Quietly, with secrets no one ever learns | stealth +2, schemer +2 |
| At the head of an army | commander +3 |
| Somewhere no one from home has ever been | traveller +2, sailor +1, cavalry +1 |
| No preference | no effect |
<!-- end generated:QUESTIONS -->

## 5. Ask your GM, and Good to know

Two levels of note, worked out from data rather than written per School, so they stay correct as Schools are
added:

| Level | Shown when | Wording |
|---|---|---|
| ⚠ **Ask your GM** | The School is not in the Core Rulebook | "From *book p.N*: check your GM uses this book." |
| | It belongs to one historical era (Imperial Histories, the destroyed Snake Clan) | "Belongs to one period of Rokugan's history: check it fits your campaign's era." |
| | It comes from an alternate timeline | "Comes from an alternate timeline: check it fits your campaign." |
| | Spider Clan | "Tied to the Shadowlands and often Tainted. Usually changes the whole campaign, so agree it with your GM and the other players first." |
| | Ninja | "A secret even within their own Clan, and exposure means disgrace or death. Your GM will need to plan around it." |
| | A heretical or controversial order | "Other monks may treat your character as an enemy." |
| ⓘ **Good to know** | Shugenja | "Casts spells: you will choose starting spells and track spell slots." |
| | Brotherhood monk | "Uses the kiho rules." |
| | Tattooed monk | "The app does not model tattoos yet." |
| | Minor Clan | "Your character may be the only one of their Clan in the story." |
| | Starting Honor 2.5 or lower | "Other samurai may distrust them." |
| | Imperial families | "Serves the Imperial families rather than a Great Clan." |

A guide can add its own note where the data cannot know (the Kuni Witch-Hunter needs a campaign with the Taint and
maho in it). Result: 52 Schools carry at least one "Ask your GM" note, 35 only "Good to know", 18 neither.

<!-- generated:WARNINGS (prototype/tables.py) -->
| School | Ask your GM | Good to know |
|---|---|---|
| Hida Pragmatist [Bushi] | From Emerald Empire p.247: check your GM uses this book. | Starts with low Honor (2.5): other samurai may distrust them. |
| Hiruma Scout [Bushi] | From Imperial Histories 1 p.147: check your GM uses this book.<br>Belongs to one period of Rokugan's history: check it fits your campaign's era. | – |
| Kaiu Engineer [Artisan/Bushi] | From The Great Clans p.39: check your GM uses this book. | – |
| Kuni Shugenja | – | Casts spells: you will choose starting spells and track spell slots.<br>Starts with low Honor (2.5): other samurai may distrust them. |
| Kuni Witch-Hunter [Monk] | From The Great Clans p.40: check your GM uses this book. | – |
| Yasuki Courtier | – | Starts with low Honor (2.5): other samurai may distrust them. |
| Asahina Shugenja | – | Casts spells: you will choose starting spells and track spell slots. |
| Daidoji Scout [Bushi] | From The Great Clans p.70: check your GM uses this book. | – |
| Doji Magistrate [Bushi] | From Emerald Empire p.170: check your GM uses this book. | – |
| Kakita Artisan | From The Great Clans p.71: check your GM uses this book. | – |
| Mirumoto Taoist Swordsman [Bushi] | From Emerald Empire p.221: check your GM uses this book. | – |
| Tamori Shugenja | – | Casts spells: you will choose starting spells and track spell slots. |
| The Hitomi Kikage Zumi Order [Monk] | From Imperial Histories 1 p.215: check your GM uses this book.<br>Belongs to one period of Rokugan's history: check it fits your campaign's era. | Tattooed monk: the app does not model tattoos yet. |
| The Hoshi Tsurui Zumi Order [Monk] | From Imperial Histories 1 p.214: check your GM uses this book.<br>Belongs to one period of Rokugan's history: check it fits your campaign's era. | Uses the kiho rules.<br>Tattooed monk: the app does not model tattoos yet. |
| The Togashi Tattooed Order [Monk] | – | Tattooed monk: the app does not model tattoos yet. |
| Ikoma Lion’s Shadow [Bushi] | From Emerald Empire p.109: check your GM uses this book. | – |
| Kitsu Shugenja | – | Casts spells: you will choose starting spells and track spell slots. |
| Lion Elite Spearmen [Bushi] | From Naishou Province p.7: check your GM uses this book. | – |
| Matsu Beastmaster [Bushi] | From The Great Clans p.136: check your GM uses this book. | – |
| Agasha Shugenja | – | Casts spells: you will choose starting spells and track spell slots. |
| Asako Henshin [Monk] | From The Great Clans p.199: check your GM uses this book. | – |
| Isawa Shugenja | – | Casts spells: you will choose starting spells and track spell slots. |
| Shiba Artisan [Courtier] | From Emerald Empire p.122: check your GM uses this book. | – |
| Bayushi Bushi | – | Starts with low Honor (2.5): other samurai may distrust them. |
| Bayushi Courtier | – | Starts with low Honor (2.5): other samurai may distrust them. |
| Shosuro Actor [Ninja] | From The Great Clans p.227: check your GM uses this book.<br>Ninja: a secret even within their own Clan, and exposure means disgrace or death. Your GM will need to plan around it. | Starts with low Honor (1.5): other samurai may distrust them. |
| Shosuro Infiltrator [Ninja] | Ninja: a secret even within their own Clan, and exposure means disgrace or death. Your GM will need to plan around it. | Starts with low Honor (1.5): other samurai may distrust them. |
| Soshi Magistrate [Bushi] | From Emerald Empire p.171: check your GM uses this book. | Starts with low Honor (2.5): other samurai may distrust them. |
| Soshi Shugenja | – | Casts spells: you will choose starting spells and track spell slots.<br>Starts with low Honor (2.5): other samurai may distrust them. |
| Yogo Wardmaster [Shugenja] | From The Great Clans p.229: check your GM uses this book. | Casts spells: you will choose starting spells and track spell slots.<br>Starts with low Honor (1.5): other samurai may distrust them. |
| Horiuchi Shugenja | From The Great Clans p.257: check your GM uses this book. | Casts spells: you will choose starting spells and track spell slots. |
| Iuchi Shugenja | – | Casts spells: you will choose starting spells and track spell slots. |
| Moto Death Priest [Shugenja] | From Imperial Histories 1 p.240: check your GM uses this book.<br>Belongs to one period of Rokugan's history: check it fits your campaign's era. | Casts spells: you will choose starting spells and track spell slots. |
| Moto Vindicator [Bushi] | From The Great Clans p.258: check your GM uses this book. | – |
| Shinjo Bushi | From Emerald Empire p.31: check your GM uses this book. | – |
| Utaku Mounted Infantry [Bushi] | From Imperial Histories 2 p.168: check your GM uses this book.<br>Belongs to one period of Rokugan's history: check it fits your campaign's era. | – |
| Mantis Brawler [Bushi] | From The Great Clans p.165: check your GM uses this book. | – |
| Moshi Shugenja | – | Casts spells: you will choose starting spells and track spell slots. |
| Tsuruchi Bounty Hunter [Bushi] | From The Great Clans p.167: check your GM uses this book. | – |
| Yoritomo Courtier | – | Starts with low Honor (2.5): other samurai may distrust them. |
| Yoritomo Shugenja | From The Great Clans p.168: check your GM uses this book. | Casts spells: you will choose starting spells and track spell slots. |
| Chuda Shugenja | Spider Clan: tied to the Shadowlands and often Tainted. Usually changes the whole campaign, so agree it with your GM and the other players first. | Casts spells: you will choose starting spells and track spell slots.<br>Starts with low Honor (0.5): other samurai may distrust them. |
| Daigotsu Bushi | Spider Clan: tied to the Shadowlands and often Tainted. Usually changes the whole campaign, so agree it with your GM and the other players first. | Starts with low Honor (1.5): other samurai may distrust them. |
| Daigotsu Courtier | Spider Clan: tied to the Shadowlands and often Tainted. Usually changes the whole campaign, so agree it with your GM and the other players first. | Starts with low Honor (1): other samurai may distrust them. |
| Goju Ninja | From The Great Clans p.280: check your GM uses this book.<br>Spider Clan: tied to the Shadowlands and often Tainted. Usually changes the whole campaign, so agree it with your GM and the other players first.<br>Ninja: a secret even within their own Clan, and exposure means disgrace or death. Your GM will need to plan around it. | Starts with low Honor (0): other samurai may distrust them. |
| Ninube Shugenja | From The Great Clans p.281: check your GM uses this book.<br>Spider Clan: tied to the Shadowlands and often Tainted. Usually changes the whole campaign, so agree it with your GM and the other players first. | Casts spells: you will choose starting spells and track spell slots.<br>Starts with low Honor (0): other samurai may distrust them. |
| The Order of the Spider Monks [Monk] | Spider Clan: tied to the Shadowlands and often Tainted. Usually changes the whole campaign, so agree it with your GM and the other players first. | Starts with low Honor (1.5): other samurai may distrust them. |
| Miya Herald [Courtier] | – | Serves the Imperial families rather than a Great Clan. |
| Otomo Courtier | – | Serves the Imperial families rather than a Great Clan. |
| Seppun Guardsman [Bushi] | – | Serves the Imperial families rather than a Great Clan. |
| Seppun Shugenja | – | Casts spells: you will choose starting spells and track spell slots.<br>Serves the Imperial families rather than a Great Clan. |
| Ichiro Bushi | – | A Minor Clan: your character may be the only one of their Clan in the story. |
| Komori Shugenja | – | Casts spells: you will choose starting spells and track spell slots.<br>A Minor Clan: your character may be the only one of their Clan in the story. |
| Heichi Bushi | – | A Minor Clan: your character may be the only one of their Clan in the story. |
| Tonbo Shugenja | – | Casts spells: you will choose starting spells and track spell slots.<br>A Minor Clan: your character may be the only one of their Clan in the story. |
| Kitsune Shugenja | – | Casts spells: you will choose starting spells and track spell slots.<br>A Minor Clan: your character may be the only one of their Clan in the story. |
| Usagi Bushi | – | A Minor Clan: your character may be the only one of their Clan in the story. |
| Fuzake Shugenja | From Secrets of the Empire p.238: check your GM uses this book. | Casts spells: you will choose starting spells and track spell slots.<br>A Minor Clan: your character may be the only one of their Clan in the story. |
| Toku Bushi | – | A Minor Clan: your character may be the only one of their Clan in the story. |
| Tsi Smith [Artisan] | – | A Minor Clan: your character may be the only one of their Clan in the story. |
| Morito Bushi | – | A Minor Clan: your character may be the only one of their Clan in the story. |
| Chuda Shugenja [Snake] | Belongs to one period of Rokugan's history: check it fits your campaign's era. | Casts spells: you will choose starting spells and track spell slots.<br>A Minor Clan: your character may be the only one of their Clan in the story. |
| Suzume Bushi | – | A Minor Clan: your character may be the only one of their Clan in the story. |
| Kasuga Smuggler [Courtier] | – | A Minor Clan: your character may be the only one of their Clan in the story.<br>Starts with low Honor (2): other samurai may distrust them. |
| Yotsu Bushi School (Heroes of Rokugan) [Bushi] | From Imperial Histories 1 p.276: check your GM uses this book.<br>Comes from an alternate timeline: check it fits your campaign. | A Minor Clan: your character may be the only one of their Clan in the story. |
| First Dawn Scholars [Monk] | From Imperial Histories 2 p.29: check your GM uses this book.<br>Comes from an alternate timeline: check it fits your campaign. | Uses the kiho rules. |
| Fudoist Order [Monk] | From Imperial Histories 2 p.287: check your GM uses this book.<br>Belongs to one period of Rokugan's history: check it fits your campaign's era.<br>A heretical or controversial order: other monks may treat your character as an enemy. | Uses the kiho rules. |
| Fukurokujin’s Eyes [Monk] | From Book of Air p.194: check your GM uses this book. | Uses the kiho rules. |
| Order of Peaceful Repose [Monk] | From Secrets of the Empire p.242: check your GM uses this book. | Uses the kiho rules. |
| Order of the Five Rings [Monk] | From Imperial Histories 2 p.102: check your GM uses this book.<br>Belongs to one period of Rokugan's history: check it fits your campaign's era.<br>A heretical or controversial order: other monks may treat your character as an enemy. | Uses the kiho rules. |
| Order of the Wind [Monk] | From Book of Air p.193: check your GM uses this book. | Uses the kiho rules. |
| Shinmaki Order [Monk] | From Emerald Empire p.206: check your GM uses this book.<br>A heretical or controversial order: other monks may treat your character as an enemy. | Uses the kiho rules. |
| Temple of Persistence [Monk] | From Book of Earth p.205: check your GM uses this book. | Uses the kiho rules. |
| Tengoku’s Fist [Monk] | From Book of Fire p.191: check your GM uses this book. | Uses the kiho rules. |
| The Four Temples [Monk] | – | Uses the kiho rules. |
| The Order of Eternity [Monk] | From Book of Void p.193: check your GM uses this book. | Uses the kiho rules. |
| The Order of Heroes [Monk] | – | Uses the kiho rules. |
| The Order of Jurojin’s Blessing [Monk] | From Book of Water p.187: check your GM uses this book. | Uses the kiho rules. |
| The Order of Rebirth [Monk] | From Book of Fire p.190: check your GM uses this book. | Uses the kiho rules. |
| The Order of the Nameless Gift [Monk] | From Book of Earth p.205: check your GM uses this book. | Uses the kiho rules. |
| The Shrine of Heaven’s Mirror [Monk] | From Book of Water p.187: check your GM uses this book. | Uses the kiho rules. |
| The Shrine of the Seven Thunders [Monk] | – | Uses the kiho rules. |
| The Temple of Heavenly Wisdom [Monk] | From Book of Fire p.191: check your GM uses this book. | Uses the kiho rules. |
| The Temple of Kaimetsu-uo [Monk] | – | Uses the kiho rules. |
| The Temple of Osano-Wo [Monk] | – | Uses the kiho rules. |
| The Temples of the Thousand Fortunes [Monk] | – | Uses the kiho rules. |
| Wind’s Grace Order [Monk] | From Book of Air p.194: check your GM uses this book. | Uses the kiho rules. |
<!-- end generated:WARNINGS -->

## 6. Scoring (version 2), and the rating of every School

### Each School's rating

- **Plays like:** one to three *main* labels (worth double) and up to three *also* labels, from 29 plain-words
  labels (front line, duelist, archer, cavalry, bodyguard, monster hunter, stealth, diplomat, schemer,
  investigator, healer, battle magic, mystic and so on).
- **Home:** one or two of ten settings (the Wall, court, mountains, libraries and temples, plains, sea,
  battlefield, wilds, streets and shadows, the road). This is how Clans come in without a "pick a Clan" question.
- **Complexity:** Straightforward, Some extra or Involved. **How unusual:** Common, Uncommon or Unusual.
- **Type, Honor and Affinity** come from the app's own data.

These ratings are a first draft by Claude. Section 10 is how they get checked.

### The arithmetic (version 2)

1. Each answer lists weights, for example "front line +3". A School gains the weight ×2 for a *main* label and ×1
   for an *also* label, plus the weight once for a matching Home.
2. **Evening out (new):** those label and Home points are multiplied by √(6 ÷ the School's label weight), where
   label weight = 2 × main labels + also labels + Homes. A School rated with many labels therefore gains no more in
   total than one rated with few. Without this, the number of labels I happened to give a School decided how often
   it was recommended (rank correlation 0.60; now 0.11).
3. Type, Honor band (6 or more high, 3.5 or less low), complexity and how unusual add their weight once if they
   match. For a caster, the chosen Element adds +3 when it is the School's Affinity (Isawa always matches) and −2
   when it is the Deficiency.
4. **Direct answers count 1.5× (new):** the four questions where a player states their style outright (approach,
   fight, court, magic type).
5. **Firmer comfort answers (new):** "Keep it simple" −6 for Involved (was −3); "A classic samurai" −6 for Unusual
   (was −4); "Never break the rules" −3 for low Honor (was −2).
6. **Ties (new):** first to the School whose *main* labels match more of the answers, then the less complex, then
   the more common, then a shuffle that differs from player to player. Never alphabetical: in version 1, 21% of
   players had a tie at the top, and the alphabet quietly favoured Akodo and Asahina.
7. **Best matches:** the top School that the magic answer allows as a best match, plus the second if it scores at
   least 80% of the first. **Also worth a look:** the next four, at most two from any one Clan across both lists.
   **Something different:** the best Unusual School not already shown, if the player did not ask for a classic
   samurai and it scores at least half of the top score. **A sample** replaces all three when fewer than two answers
   describe the character.

### The rating table

<!-- generated:SCHOOLS (prototype/tables.py) -->
| School | Clan | Type | Honor | Plays like (main · also) | Home | Complexity | How unusual | Source |
|---|---|---|---|---|---|---|---|---|
| Hida Bushi | Crab | Bushi | 3.5 | front line, monster hunter | battlefield, the Wall | Straightforward | Common | Core Rulebook p.106 |
| Hida Pragmatist [Bushi] | Crab | Bushi | 2.5 | unarmed · bodyguard, monster hunter | the Wall | Some extra | Uncommon | Emerald Empire p.247 |
| Hiruma Bushi | Crab | Bushi | 4.5 | monster hunter, fast skirmisher · archer, stealth | the Wall, wilds | Straightforward | Common | Core Rulebook p.108 |
| Hiruma Scout [Bushi] | Crab | Bushi | 4.5 | fast skirmisher, stealth · monster hunter | the Wall, wilds | Some extra | Unusual | Imperial Histories 1 p.147 |
| Kaiu Engineer [Artisan/Bushi] | Crab | Artisan/Bushi | 4.5 | craftsman · commander, front line | battlefield, the Wall | Some extra | Uncommon | The Great Clans p.39 |
| Kuni Shugenja | Crab | Shugenja (Earth) | 2.5 | battle magic, monster hunter · scholar | libraries and temples, the Wall | Involved | Common | Core Rulebook p.107 |
| Kuni Witch-Hunter [Monk] | Crab | Monk | 5.5 | investigator, monster hunter · mystic, traveller | the road, the Wall | Some extra | Uncommon | The Great Clans p.40 |
| Toritaka Bushi | Crab or Falcon | Bushi | 5.5 | monster hunter, spirits and the dead · animal companion | the Wall, wilds | Some extra | Uncommon | Core Rulebook p.219 |
| Yasuki Courtier | Crab | Courtier | 2.5 | merchant · diplomat, schemer | court | Some extra | Common | Core Rulebook p.107 |
| Asahina Shugenja | Crane | Shugenja (Air) | 6.5 | healer, protective magic · artist, mystic | court, libraries and temples | Involved | Common | Core Rulebook p.110 |
| Daidoji Iron Warrior [Bushi] | Crane | Bushi | 6.5 | bodyguard, front line · commander | battlefield, court | Straightforward | Common | Core Rulebook p.111 |
| Daidoji Scout [Bushi] | Crane | Bushi | 3.5 | fast skirmisher, stealth · archer | battlefield, wilds | Some extra | Uncommon | The Great Clans p.70 |
| Doji Courtier | Crane | Courtier | 6.5 | diplomat · artist | court | Some extra | Common | Core Rulebook p.110 |
| Doji Magistrate [Bushi] | Crane | Bushi | 5.5 | bodyguard, investigator · unarmed | court, the road | Some extra | Uncommon | Emerald Empire p.170 |
| Kakita Artisan | Crane | Artisan | 5.5 | artist · diplomat | court | Some extra | Uncommon | The Great Clans p.71 |
| Kakita Bushi | Crane | Bushi | 6.5 | duelist · artist | court | Some extra | Common | Core Rulebook p.109 |
| Kitsuki Investigator [Courtier] | Dragon | Courtier | 5.5 | investigator · diplomat, scholar | court, mountains | Some extra | Common | Core Rulebook p.114 |
| Mirumoto Bushi | Dragon | Bushi | 4.5 | duelist · mystic | mountains | Some extra | Common | Core Rulebook p.112 |
| Mirumoto Taoist Swordsman [Bushi] | Dragon | Bushi | 5.5 | mystic | mountains | Some extra | Uncommon | Emerald Empire p.221 |
| Tamori Shugenja | Dragon | Shugenja (Earth) | 4.5 | battle magic, unusual magic · healer | mountains | Involved | Common | Core Rulebook p.113 |
| The Hitomi Kikage Zumi Order [Monk] | Dragon | Monk | 4.5 | all-out attacker, unarmed · mystic | mountains | Involved | Unusual | Imperial Histories 1 p.215 |
| The Hoshi Tsurui Zumi Order [Monk] | Dragon | Monk | 4.5 | mystic · unarmed | mountains | Involved | Unusual | Imperial Histories 1 p.214 |
| The Togashi Tattooed Order [Monk] | Dragon | Monk | 4.5 | mystic, unarmed · traveller | mountains, the road | Involved | Common | Core Rulebook p.114 |
| Akodo Bushi | Lion | Bushi | 6.5 | commander · duelist, front line | battlefield | Straightforward | Common | Core Rulebook p.116 |
| Ikoma Bard [Courtier] | Lion | Courtier | 6.5 | artist, diplomat · scholar | battlefield, court | Some extra | Common | Core Rulebook p.118 |
| Ikoma Lion’s Shadow [Bushi] | Lion | Bushi | 3.5 | schemer, stealth | battlefield, streets and shadows | Some extra | Uncommon | Emerald Empire p.109 |
| Kitsu Shugenja | Lion | Shugenja (Water) | 6.5 | battle magic, spirits and the dead · scholar | battlefield, libraries and temples | Involved | Common | Core Rulebook p.117 |
| Lion Elite Spearmen [Bushi] | Lion | Bushi | 5.5 | bodyguard, front line · commander | battlefield, court | Straightforward | Uncommon | Naishou Province p.7 |
| Matsu Beastmaster [Bushi] | Lion | Bushi | 5.5 | animal companion, front line | battlefield, wilds | Some extra | Uncommon | The Great Clans p.136 |
| Matsu Berserker [Bushi] | Lion | Bushi | 6.5 | all-out attacker, front line | battlefield | Straightforward | Common | Core Rulebook p.119 |
| Agasha Shugenja | Phoenix | Shugenja (Fire) | 4.5 | unusual magic · battle magic, scholar | libraries and temples | Involved | Common | Core Rulebook p.125 |
| Asako Henshin [Monk] | Phoenix | Monk | 5.5 | mystic · scholar | libraries and temples | Involved | Uncommon | The Great Clans p.199 |
| Asako Loremaster [Courtier] | Phoenix | Courtier | 6.5 | scholar · diplomat | court, libraries and temples | Some extra | Common | Core Rulebook p.124 |
| Isawa Shugenja | Phoenix | Shugenja (chosen) | 4.5 | battle magic, scholar · mystic | libraries and temples | Involved | Common | Core Rulebook p.124 |
| Shiba Artisan [Courtier] | Phoenix | Courtier | 4.5 | artist · mystic | libraries and temples | Some extra | Uncommon | Emerald Empire p.122 |
| Shiba Bushi | Phoenix | Bushi | 5.5 | bodyguard · diplomat, mystic | court, libraries and temples | Some extra | Common | Core Rulebook p.123 |
| Bayushi Bushi | Scorpion | Bushi | 2.5 | schemer · duelist, stealth | court, streets and shadows | Some extra | Common | Core Rulebook p.126 |
| Bayushi Courtier | Scorpion | Courtier | 2.5 | schemer · investigator | court | Some extra | Common | Core Rulebook p.127 |
| Shosuro Actor [Ninja] | Scorpion | Ninja | 1.5 | schemer, stealth · artist | court, streets and shadows | Some extra | Unusual | The Great Clans p.227 |
| Shosuro Infiltrator [Ninja] | Scorpion | Ninja | 1.5 | stealth · fast skirmisher | streets and shadows | Some extra | Unusual | Core Rulebook p.128 |
| Soshi Magistrate [Bushi] | Scorpion | Bushi | 2.5 | investigator · schemer, unarmed | court, streets and shadows | Some extra | Uncommon | Emerald Empire p.171 |
| Soshi Shugenja | Scorpion | Shugenja (Air) | 2.5 | schemer, stealth · unusual magic | court | Involved | Common | Core Rulebook p.127 |
| Yogo Wardmaster [Shugenja] | Scorpion | Shugenja | 1.5 | protective magic · monster hunter | court | Involved | Uncommon | The Great Clans p.229 |
| Horiuchi Shugenja | Unicorn | Shugenja (Earth) | 4.5 | unusual magic · traveller | plains | Involved | Uncommon | The Great Clans p.257 |
| Ide Emissary [Courtier] | Unicorn | Courtier | 5.5 | diplomat · traveller | court, plains | Some extra | Common | Core Rulebook p.131 |
| Iuchi Shugenja | Unicorn | Shugenja (Water) | 5.5 | unusual magic, traveller · nature and weather | plains | Involved | Common | Core Rulebook p.130 |
| Moto Bushi | Unicorn | Bushi | 3.5 | cavalry, front line · all-out attacker | battlefield, plains | Some extra | Common | Core Rulebook p.130 |
| Moto Death Priest [Shugenja] | Unicorn | Shugenja (Earth) | 3.5 | spirits and the dead, unusual magic · battle magic | plains | Involved | Unusual | Imperial Histories 1 p.240 |
| Moto Vindicator [Bushi] | Unicorn | Bushi | 3.5 | cavalry, monster hunter | plains, the road | Some extra | Uncommon | The Great Clans p.258 |
| Shinjo Bushi | Unicorn | Bushi | 4.5 | cavalry, duelist · traveller | plains | Some extra | Uncommon | Emerald Empire p.31 |
| Utaku Battle Maiden [Bushi] | Unicorn | Bushi | 6.5 | cavalry · bodyguard | battlefield, plains | Some extra | Common | Core Rulebook p.132 |
| Utaku Mounted Infantry [Bushi] | Unicorn | Bushi | 5.5 | front line, traveller · cavalry | battlefield, plains | Straightforward | Unusual | Imperial Histories 2 p.168 |
| Mantis Brawler [Bushi] | Mantis | Bushi | 3.5 | unarmed · sailor | sea, streets and shadows | Some extra | Uncommon | The Great Clans p.165 |
| Moshi Shugenja | Mantis | Shugenja (Air) | 4.5 | nature and weather · sailor | sea | Involved | Common | Core Rulebook p.120 |
| Tsuruchi Archer [Bushi] | Mantis | Bushi | 3.5 | archer | battlefield, sea | Straightforward | Common | Core Rulebook p.122 |
| Tsuruchi Bounty Hunter [Bushi] | Mantis | Bushi | 4.5 | investigator · archer, traveller | the road | Some extra | Uncommon | The Great Clans p.167 |
| Yoritomo Bushi | Mantis | Bushi | 3.5 | sailor, fast skirmisher · front line | sea | Straightforward | Common | Core Rulebook p.120 |
| Yoritomo Courtier | Mantis | Courtier | 2.5 | merchant, schemer | court, sea | Some extra | Common | Core Rulebook p.121 |
| Yoritomo Shugenja | Mantis | Shugenja (Water) | 4.5 | nature and weather, sailor | sea | Involved | Uncommon | The Great Clans p.168 |
| Chuda Shugenja | Spider | Shugenja | 0.5 | forbidden power · scholar | streets and shadows | Involved | Unusual | Core Rulebook p.213 |
| Daigotsu Bushi | Spider | Bushi | 1.5 | front line · forbidden power | battlefield, streets and shadows | Some extra | Unusual | Core Rulebook p.212 |
| Daigotsu Courtier | Spider | Courtier | 1 | schemer · forbidden power | court, streets and shadows | Some extra | Unusual | Core Rulebook p.213 |
| Goju Ninja | Spider | Bushi | 0 | forbidden power, stealth | streets and shadows | Involved | Unusual | The Great Clans p.280 |
| Ninube Shugenja | Spider | Shugenja (Air) | 0 | forbidden power, stealth | streets and shadows | Involved | Unusual | The Great Clans p.281 |
| The Order of the Spider Monks [Monk] | Spider | Monk | 1.5 | mystic, unarmed · forbidden power | the road, streets and shadows | Involved | Unusual | Core Rulebook p.215 |
| Miya Herald [Courtier] | Imperial | Courtier | 6.5 | diplomat, traveller | court, the road | Some extra | Uncommon | Core Rulebook p.230 |
| Otomo Courtier | Imperial | Courtier | 5.5 | schemer · diplomat | court | Some extra | Uncommon | Core Rulebook p.229 |
| Seppun Guardsman [Bushi] | Imperial | Bushi | 6.5 | bodyguard · front line | court | Straightforward | Uncommon | Core Rulebook p.228 |
| Seppun Shugenja | Imperial | Shugenja (Fire) | 6.5 | protective magic · battle magic | court | Involved | Uncommon | Core Rulebook p.228 |
| Ichiro Bushi | Badger | Bushi | 3.5 | front line, unarmed | mountains, the Wall | Some extra | Uncommon | Core Rulebook p.215 |
| Komori Shugenja | Bat | Shugenja (Air) | 4.5 | nature and weather, spirits and the dead · traveller | the road | Involved | Uncommon | Core Rulebook p.216 |
| Heichi Bushi | Boar | Bushi | 3 | front line · bodyguard | the Wall, wilds | Straightforward | Uncommon | Core Rulebook p.217 |
| Tonbo Shugenja | Dragonfly | Shugenja (Water) | 4.5 | diplomat, spirits and the dead · mystic | court, mountains | Involved | Uncommon | Core Rulebook p.218 |
| Kitsune Shugenja | Fox | Shugenja (Earth) | 4.5 | animal companion, nature and weather · spirits and the dead | wilds | Involved | Uncommon | Core Rulebook p.219 |
| Usagi Bushi | Hare | Bushi | 4 | fast skirmisher | battlefield, wilds | Straightforward | Uncommon | Core Rulebook p.220 |
| Fuzake Shugenja | Monkey | Shugenja (Earth) | 5.5 | healer · spirits and the dead | the road | Involved | Uncommon | Secrets of the Empire p.238 |
| Toku Bushi | Monkey | Bushi | 5.5 | front line · bodyguard | the road | Straightforward | Uncommon | Core Rulebook p.221 |
| Tsi Smith [Artisan] | Oriole | Artisan | 4.5 | craftsman · duelist | the road | Some extra | Uncommon | Core Rulebook p.222 |
| Morito Bushi | Ox | Bushi | 3.5 | cavalry, front line | plains | Some extra | Uncommon | Core Rulebook p.223 |
| Chuda Shugenja [Snake] | Snake | Shugenja (Earth) | 4.5 | monster hunter · protective magic | the road | Involved | Unusual | Core Rulebook p.224 |
| Suzume Bushi | Sparrow | Bushi | 6.5 | duelist · artist | the road | Straightforward | Uncommon | Core Rulebook p.225 |
| Kasuga Smuggler [Courtier] | Tortoise | Courtier | 2 | merchant, schemer · stealth | sea, streets and shadows | Some extra | Uncommon | Core Rulebook p.225 |
| Yotsu Bushi School (Heroes of Rokugan) [Bushi] | Tiger | Bushi | 5.5 | bodyguard, stealth | streets and shadows | Some extra | Unusual | Imperial Histories 1 p.276 |
| First Dawn Scholars [Monk] | Brotherhood of Shinsei | Monk | 5.5 | mystic, scholar | libraries and temples | Involved | Unusual | Imperial Histories 2 p.29 |
| Fudoist Order [Monk] | Brotherhood of Shinsei | Monk | – | mystic · unarmed | the road | Involved | Unusual | Imperial Histories 2 p.287 |
| Fukurokujin’s Eyes [Monk] | Brotherhood of Shinsei | Monk | 4.5 | investigator, mystic · scholar | the Wall | Involved | Unusual | Book of Air p.194 |
| Order of Peaceful Repose [Monk] | Brotherhood of Shinsei | Monk | 4.5 | spirits and the dead · healer | the road | Involved | Uncommon | Secrets of the Empire p.242 |
| Order of the Five Rings [Monk] | Brotherhood of Shinsei | Monk | 4 | mystic, schemer | the road | Involved | Unusual | Imperial Histories 2 p.102 |
| Order of the Wind [Monk] | Brotherhood of Shinsei | Monk | 4.5 | mystic · fast skirmisher | the road | Involved | Uncommon | Book of Air p.193 |
| Shinmaki Order [Monk] | Brotherhood of Shinsei | Monk | 6.5 | mystic | mountains | Involved | Unusual | Emerald Empire p.206 |
| Temple of Persistence [Monk] | Brotherhood of Shinsei | Monk | 3.5 | front line, unarmed · mystic | the road | Involved | Uncommon | Book of Earth p.205 |
| Tengoku’s Fist [Monk] | Brotherhood of Shinsei | Monk | 4.5 | unarmed · mystic | the road | Involved | Uncommon | Book of Fire p.191 |
| The Four Temples [Monk] | Brotherhood of Shinsei | Monk | 6.5 | diplomat, mystic · healer | court, the road | Involved | Uncommon | Core Rulebook p.231 |
| The Order of Eternity [Monk] | Brotherhood of Shinsei | Monk | – | mystic · scholar | mountains | Involved | Unusual | Book of Void p.193 |
| The Order of Heroes [Monk] | Brotherhood of Shinsei | Monk | 4.5 | mystic · monster hunter | the road | Involved | Uncommon | Core Rulebook p.232 |
| The Order of Jurojin’s Blessing [Monk] | Brotherhood of Shinsei | Monk | 5.5 | healer · mystic | the road | Involved | Uncommon | Book of Water p.187 |
| The Order of Rebirth [Monk] | Brotherhood of Shinsei | Monk | 6.5 | mystic, scholar | the road | Involved | Uncommon | Book of Fire p.190 |
| The Order of the Nameless Gift [Monk] | Brotherhood of Shinsei | Monk | 4.5 | mystic · front line | the road | Involved | Uncommon | Book of Earth p.205 |
| The Shrine of Heaven’s Mirror [Monk] | Brotherhood of Shinsei | Monk | 3.5 | mystic, spirits and the dead | wilds | Involved | Unusual | Book of Water p.187 |
| The Shrine of the Seven Thunders [Monk] | Brotherhood of Shinsei | Monk | 4.5 | mystic · scholar | mountains | Involved | Uncommon | Core Rulebook p.232 |
| The Temple of Heavenly Wisdom [Monk] | Brotherhood of Shinsei | Monk | 6.5 | artist, scholar · mystic | court | Involved | Uncommon | Book of Fire p.191 |
| The Temple of Kaimetsu-uo [Monk] | Brotherhood of Shinsei | Monk | 4.5 | diplomat, mystic · sailor | sea | Involved | Uncommon | Core Rulebook p.232 |
| The Temple of Osano-Wo [Monk] | Brotherhood of Shinsei | Monk | 4.5 | front line, unarmed · mystic | the road | Involved | Uncommon | Core Rulebook p.233 |
| The Temples of the Thousand Fortunes [Monk] | Brotherhood of Shinsei | Monk | 4.5 | mystic, spirits and the dead | the road | Involved | Uncommon | Core Rulebook p.233 |
| Wind’s Grace Order [Monk] | Brotherhood of Shinsei | Monk | 6.5 | archer, mystic | the road | Involved | Uncommon | Book of Air p.194 |
<!-- end generated:SCHOOLS -->

## 7. Two worked guides

These show the depth intended for every School. The facts come from the app's data (pages cited). The roleplay
advice is our own.

### Hida Bushi

**At a glance.** Crab Clan · Hida family (+1 Strength) · Bushi · School +1 Stamina · starting Honor 3.5 ·
Straightforward · Common · Core Rulebook p.106. No GM notes.

**Who they are.** The Crab hold the great Wall on the Empire's southern border against the Shadowlands, and
the Hida are their ruling family and the heart of their army. Their School is one of the oldest in Rokugan:
wear heavy armour, take the blow, then answer with a heavy weapon such as the tetsubo. Other Clans, the Crane
above all, think the Crab crude. The Crab think the other Clans have no idea what is out there.

**How they play.** The party's front line. **Rank 1, The Way of the Crab:** no Armor TN penalty for heavy armour
(except for Stealth) and +1k0 damage with Heavy Weapons, so wear the heaviest armour you can. Rank 2 adds Reduction
equal to your Earth Ring, which is why the build below raises Earth. School Skills: Athletics, Defense, Heavy
Weapons (Tetsubo), Intimidation, Kenjutsu, Lore: Shadowlands and one Bugei Skill of your choice. Outfit: Light or
Heavy Armor, Sturdy Clothing, Daisho, Heavy Weapon or Polearm, Traveling Pack, 3 koku.

**Roleplaying them.**
- You have seen what the rest of the Empire only fears. Patience with ceremony is short; patience with people
  who pull their weight is long.
- Honor 3.5 is not dishonour. A Hida bends etiquette, not duty.
- Intimidation is a social tool as well as a battle cry.
- Good hooks: a sibling lost on the Wall; a grudge against the Crane; a debt to a Kuni shugenja.
- Playing against type: a Hida who writes poetry about the Wall and is quietly good at it.

**Questions to think about** (optional, from the book's Twenty Questions): How long did you serve on the Wall,
and what did you see there? Who do you trust most, and did they stand beside you there? What do you really think
of the Crane? How do you expect to die, and does it frighten you?

**Suggested starting build** (verified in the app, section 8):

| | Choice | XP | Why |
|---|---|---|---|
| Traits | Willpower 2→3 | 12 | With the School's Stamina 3 this makes **Earth 3**: more Wounds now, more Reduction at Rank 2 |
| | Agility 2→3 | 12 | Heavy Weapons attacks roll Agility |
| Skills | Heavy Weapons 1→3 | 5 | Your main attack |
| | Defense 1→2, Kenjutsu 1→2, Athletics 1→2 | 6 | Defending, a backup weapon, and getting about |
| | Free Bugei choice: **Jiujutsu** | 0 | For when you lose your weapon (Kyujutsu is the ranged alternative) |
| Advantages | Strength of the Earth | 2 | Wound penalties reduced by 3. Bushi pay 2 |
| | Large | 3 | +1k0 damage with large weapons. Crab pay 3 |
| | **Total** | **40** | |

**With Disadvantages** (optional, 9 XP): Brash (3), Overconfident (3) and Antisocial (3, the Crab price). Spend the
9 XP on Kenjutsu 3, Lore: Shadowlands 2, Jiujutsu 2 and Intimidation 2. **Usually not worth it at Rank 1:** Void 3
costs 18 XP, nearly half the budget.

**Where they can go later** (from the app's data): Alternate Paths at Technique Rank 2: Crab Defender (Book of
Air p.172), Crab Sumai Wrestler (Book of Earth p.191), Tsuru's Legion (Sword and Fan p.202). At Rank 4: Crab
Knife-fighters (Book of Fire p.177), Yasuki Taskmaster (Sword and Fan p.203). Advanced School: Defender of the
Wall (Core p.247; needs Earth 4, Strength 5, Defense 4, Heavy Weapons 4, Lore: Shadowlands 5).

### Kuni Witch-Hunter

**At a glance.** Crab Clan · Kuni family (+1 Intelligence) · Monk-type School · School +1 Willpower · starting
Honor 5.5 · Some extra · Uncommon · The Great Clans p.40.
⚠ **Ask your GM:** from The Great Clans p.40, so check your GM uses this book. The character shines only if the
Taint and maho are part of the campaign, so ask about that too.

**Who they are.** The Kuni are the Crab's shugenja family, known for obsessive study of the Shadowlands. The
Witch-Hunters are a small band of Kuni mystic warriors who roam the whole Empire, ignoring Clan borders, to hunt
maho-tsukai (blood sorcerers) and Shadowlands infiltrators. Commoners welcome them. Other samurai often do not.

**How they play.** An investigator who can fight. **Rank 1, To See the Darkness:** a Contested Roll (your
Investigation/Awareness against their Sincerity/Willpower) senses the Taint in someone, with +1k0 for each full
Rank of their Taint. You also gain +1k1 to resist the Taint and to attack Shadowlands creatures or known Tainted
foes. Rank 2 lets you recall a Shadowlands creature's weaknesses. School Skills: Investigation, Jiujutsu,
Kenjutsu, Lore: Shadowlands, Lore: Maho, Meditation and one Skill of your choice. Outfit: Rugged Clothing, Daisho,
Knife, Jade Pendant, Traveling Pack, 3 koku.

**Roleplaying them.**
- Most of the job is asking questions, watching faces and being unwelcome. The sword comes out last.
- The great dilemma: a maho-tsukai may be a desperate, sympathetic person who made one terrible choice. What do
  you do with them?
- You answer to no local lord's comfort. That makes enemies and occasionally saves a province.
- Good hooks: the sorcerer who got away; a fellow hunter who fell to the Taint; a village that hid you.
- Playing against type: a hunter who believes most of the Tainted can be saved.

**Questions to think about** (optional): Who was the first maho-tsukai you hunted, and what became of them? What
would you do if someone you trust showed signs of the Taint? Which local lord would be glad to see you leave, and
why?

**Suggested starting build** (verified in the app, section 8):

| | Choice | XP | Why |
|---|---|---|---|
| Traits | Stamina 2→3 | 12 | With the School's Willpower 3 this makes **Earth 3**, which resists the Taint |
| | Agility 2→3 | 12 | With the Family's Intelligence 3 this makes **Fire 3**; attacks roll Agility |
| | Awareness 2→3 | 12 | Your Rank 1 Technique rolls Investigation/Awareness |
| Skills | Investigation 1→2, Kenjutsu 1→2 | 4 | Finding them, then fighting them |
| | Free choice: **Etiquette** | 0 | You will spend a lot of time in courts that do not want you there |
| | **Total** | **40** | |

**With Disadvantages** (optional, 10 XP): Driven (2), Sworn Enemy (3: the one who got away), Obligation (3) and
Can't Lie (2). Spend the 10 XP on Irreproachable (2), Wary (3), Clear Thinker (3) and Lore: Shadowlands 2.
**Usually not worth it at Rank 1:** Void 3 (18 XP). The Witch-Hunter is a [Monk] School but not a Brotherhood one,
so it does not get Brotherhood kiho rates.

**Where they can go later:** Alternate Path at Technique Rank 2: Student of Hitsu-do (Book of Fire p.179).

## 8. Suggested starting builds: rules and checks

- **Hints only** (ruling 6): shown in the guide and as folded panels on the wizard's later steps. Nothing is
  bought for the player.
- **Budget:** 40 XP, plus up to 10 XP from Disadvantages (a separate, optional layer, so a player who takes none
  still has a complete build).
- **Within the app's rules:** Traits ×4, Void ×6, Skills by new Rank, Emphases 2 XP, Clan and School prices as the
  app applies them, nothing above 4 at creation.
- **Prefer raising the partner Trait:** when the Family or School has raised one Trait of a Ring, raising its
  partner lifts the whole Ring. The guides say so where it applies.
- **Every suggested build is checked by entering it in the real wizard** (`prototype/verify-builds.js`):

| Build | XP spent / total | Character check | Review allows Finish |
|---|---|---|---|
| Hida Bushi | 40 / 40 | no findings | yes |
| Hida Bushi with Disadvantages | 40 / 40 (Disadvantages give 9) | no findings | yes |
| Kuni Witch-Hunter | 40 / 40 | no findings | yes |
| Kuni Witch-Hunter with Disadvantages | 40 / 40 (Disadvantages give 10) | no findings | yes |

## 9. Reliability

### What "reliable" means here

The finder is a guide that gives a shortlist. The agreed target (25 November) is: **a player who roughly knows what
they want finds it in the top six about 9 times in 10, and no School is hidden from the players it suits.**

Reliability is three separate questions, and the tests below answer only the first:

1. **Does the scoring do what the ratings say?** Measured by `prototype/reliability.py`.
2. **Are the ratings right?** Simulation cannot answer this: the simulated players are built from the same
   ratings, so a wrong rating is invisible to them. Section 10 is the method.
3. **Do real players like what they get?** Needs real people (section 10, step 5).

### The tests and their pass marks

`python3 -I prototype/reliability.py` runs all of them in about a minute and exits with a failure if any test
fails. **Rules** must always hold. **Floors** are set at the values measured for version 2, so a rating or question
change that makes things worse fails instead of passing quietly. The "player who wants School X" tests simulate,
for every School, 20 players who pick the answer that suits it best 60% of the time, "No preference" 20% and any
answer 20%.

| Test | Version 1 | Version 2 | Pass mark |
|---|---|---|---|
| Every School can be a best match on some answers | 105 | **105** | rule: 105 |
| Shortest result list over 20,000 random players | 6+ | **21** | rule: at least 6 |
| All "No preference" gives a sample from 6 Clans, not a match | no (Akodo, alphabetically) | **yes** | rule |
| Magic "No" or "a touch": best matches that are not Shugenja | 100% (filtered out) | **100%** | rule: 100% |
| Magic "Yes": every listed School is a Shugenja School | 100% | **100%** | rule: 100% |
| Player who wants School X finds it in the top six | 82% | **81.3%** | floor 81%, **target 90%** |
| … gets it as a best match | 63% | **62.3%** | floor 62% |
| … stopping after question 9 | – | **78.0%** | floor 77.9% |
| Schools such a player finds less than a quarter of the time | 13 | **5** | floor 5, target 0 |
| "Classic samurai": best matches that are not Unusual | 98.5% | **98.1%** | floor 98% |
| "Keep it simple" (no magic asked): best matches that are not Involved | 84% | **89.2%** | floor 89% |
| "A sword": best matches that are Bushi | 80.5% | **87.6%** | floor 87% |
| "Words": best matches that are Courtiers | 48.1% | **67.4%** | floor 67% |
| "Healing" magic: best matches that heal or protect | 91.1% | **98.6%** | floor 98% |
| "Never break the rules": best matches without low Honor | 87.3% | **87.4%** | floor 87% |
| Label-count bias (rank correlation; 0 is none) | 0.60 | **0.11** | floor 0.15 |
| Alphabetical bias (rank correlation) | ties went alphabetically | **0.09** | floor 0.15 |
| Most frequent best match, share of random players | 6.8% | **5.3%** | floor 5.5% |
| One answer changed: Schools kept in the top six | 4.2 of 6 | **4.25 of 6** | floor 4.2 |
| Fits a Shugenja School but said "No": still offered it | 0% (filtered out) | **15.7%** | floor 15% |
| The owner's group: each player's real School is in their top six | – | *none recorded yet* | rule: 100% |

Still hard to find in version 2: Goju Ninja, Order of Peaceful Repose, The Order of Heroes, Tengoku's Fist and
Yasuki Courtier. For information: one changed answer changes the first best match 40% of the time, which is why
results are presented as a shortlist, not a single answer.

### What the measurements say about getting to 90%

- **The arithmetic is not the limit.** A sweep of the settings (how strongly labels are evened out, the magic
  penalty, the weight of direct answers) moved "finds it in the top six" only between 77% and 81%. Each setting
  trades one measure against another.
- **The ratings are the limit.** What is left is mostly near-twins (Goju Ninja and Shosuro Infiltrator, Agasha and
  Tamori, Tengoku's Fist and Osano-Wo, many monk orders sharing "mystic") and labels that look wrong. Example: a
  player who answers only "a sword, the front line, the Wall" gets Heichi and Ichiro (Boar and Badger) ahead of Hida
  Bushi, because the draft gave those Minor Clan Schools a "Wall" home. That is a rating error, and no setting can
  fix it. Section 10 is the way to 90%.

### Early exit after question 9 (the owner, 25 November)

Ruling 5 first put "See my results now" after question 8, on version 1's numbers. Version 2 measured (10 players per
School):

| Stop after | Best match | Top six |
|---|---|---|
| 6 questions | 38% | 56% |
| 8 questions | 57% | 76% |
| **9 questions** | **63%** | **80%** |
| 10 questions | 62% | 80% |
| All | 65% | 83% |

Question 9 (Bushido) closes most of the remaining gap, so the owner moved the early exit to after question 9
(`EARLY_EXIT_AFTER = 9`). With 20 players per School, as in the tests, it finds the wanted School in the top six 78%
of the time (73.3% after question 8).

## 10. Checking the ratings without an expert (approved 25 November; under way)

The owner is not a GM or a subject-matter expert, and this is a self-funded project. So the method does not rely on
anyone's expertise. It turns each rating from an opinion into a **checkable claim with evidence**, gets the evidence
from several independent sources, and leaves only a short list of genuine disagreements.

**Step 1. A rubric.** One-line, checkable definitions for every label, Home, complexity and "how unusual" level.
For example: *archer: the School teaches Kyujutsu and a Technique or its description centres on the bow*;
*Involved: casts spells, uses kiho, or uses tattoos*. With a rubric, checking a rating means checking a fact
("does this School teach Kyujutsu?"), which anyone can do.

**Step 2. The app's own evidence, automatically.** Each School's Skills, all five Techniques (`TECH_DESCRIPTIONS`)
and its description (`SCHOOLLORE9`) are already in the app, in our own words, and earlier phases checked them
against the books. A script applies the rubric to them. A first try with Skills alone, 25 November:

| Of the draft's 255 labels | Count |
|---|---|
| Backed by the School's own Skill list | 135 |
| Testable against Skills but not backed (some are fine: the Asahina heal through spells, not the Medicine Skill) | 46 |
| Not testable from Skills at all (battle magic, bodyguard, skirmisher and so on); need the Technique text or the book | 74 |
| Distinctive Skills taught but not labelled (Akodo teach Kyujutsu, for example; not every one should be a label) | 43 |

Adding the Technique text and descriptions will settle many more.

**Step 3. The books, for what the app's data cannot settle.** A reading pass of each School's printed entry,
recording the evidence for each label in our own words with the page, under the project's rules (book text only in
a scratch folder, never committed). The Sourcebook Index already gives every School's page. This needs a session
with the owner's PDFs: a laptop session, or the laptop's folder attached to a cloud session.

**Step 4. A third opinion.** The two community wikis the Sourcebook Index already links for every School (Magical
Samurai, Last Haiku), used as a cross-check, never copied. Optionally, a separate blind rating by a fresh session
that sees only the evidence and the rubric, not the draft. That is cheap and catches careless labels, but it shares
Claude's blind spots, so it is not proof.

**Step 5. Settle disagreements by evidence, then by people.**
- Where the sources agree, the rating is marked **evidence-backed**.
- Where they disagree, the audit lists the evidence side by side. Most become fact checks.
- The few genuine judgement calls go to the owner's group: whoever runs the game, or an experienced player, reads
  only that short list, not 105 rows.
- **A free real-world test:** the owner's group already have characters. Each player takes the questionnaire
  answering as their character. Their real School should be in the top six. Before any public release, a couple of
  new players try the review page.

**Step 6. Make it permanent.** Each rating records its evidence and its confidence (evidence-backed or judgement).
`reliability.py` gains three tests: every label meets the rubric; the share of scoring that rests on judgement-only
labels must not grow; the group's known characters stay in their top six.

**The owner's part, as a non-expert:** approve the rubric (plain words), spot-check about ten Schools by opening the
cited page and confirming the evidence says what the audit claims, and pass the short disagreement list to the
group. If more than one of the ten spot checks is wrong, the audit is redone before its ratings are used.

**Near-twins** (the reliability ruling) are handled inside the audit: wherever the evidence separates two Schools,
the difference becomes a label, and a test checks that each twin can be found on its own.

### Progress (25 November)

**Steps 1 and 2: done** (`audit/`). `rubric.py` holds the plain-words definitions. `extract-evidence.js` read every
School's Skills, Outfit, all 354 Techniques and description from the app into `app-evidence.json`, and `rater.py`
weighed them by the rubric (`WORKSHEET.md`). No rating has been changed yet.

| Of the draft ratings | Result |
|---|---|
| Labels backed by the app's evidence | 183 of 255 (main labels: 135 of 161) |
| Labels with weak evidence / no evidence | 30 / 42 |
| Labels the evidence suggests adding | 28 (some false alarms: the Kuni Witch-Hunter's Techniques mention maho because they hunt it) |
| Homes backed | 106 of 148 (no evidence for the Badger's and the Boar's "Wall") |
| Complexity / how unusual agree with the rubric | 89 / 100 of 105 |
| Near-twin pairs (rated at least 75% alike) | 20 |
| Questions left for the books | **183, across 88 Schools** (`book-worklist.json`) |

**Step 3: ready for the laptop.** The owner's laptop does not currently offer its folders to cloud sessions, so a
Claude session on the laptop does this, following `audit/KICKOFF-BOOK-READING.md`. `extract_pages.py` extracts each
School's pages to a scratch folder outside the repository (it refuses a path inside it); the answers go in
`book-evidence.json`; `check_evidence.py` checks them (every question answered, a printed page, nothing sharing a run
of 8 or more words with the book), writes `SHORT-LIST.md` for the group and, at the end, `SPOT-CHECK.md` for the owner.
Both tools were tested here on a scratch copy: a copied sentence and unanswered questions are caught. The wikis are
used from the laptop too: this cloud environment blocks both sites.

**Step 5: the group's answer codes.** The review page now shows an answer code after the results. Each player answers
as their own character and sends the code with their character's School; they go in `audit/known-characters.json`,
and `reliability.py`'s test "each player's real School is in their top six" (a rule) runs on them. A code read back
gives exactly the results the page showed (checked).

## 11. How it would be built

- **Own fragments, own marker.** `src/sheet/…-feat-character-finder.js` (logic and screens) and
  `…-feat-character-finder-content.js` (questions, ratings, guides) behind `CHARACTER_FINDER_ENABLED`, marker
  `PART L PHASE 16`. Content batches change only the content file.
- **No edits inside the wizard's fragments.** The Clan-step button and the "Suggested for…" panels are added by
  wrapping `CW112.render`, as BUGFIX — Creation Cap of Four already does. Build chooses the wizard's own cards.
- **Declared dependency** on Phase 11.2 (the wizard) for Build and the panels. If 11.2 were removed, the finder
  still works as a browser and Build is hidden. Soft, guarded use of Phase 9.1's flavour text, 14.3b's page
  references and Phase 4.6/4.7's Path data.
- **No save-format change.** Finder answers live only while the finder is open (and in this browser's storage for
  "Change my answers"). Nothing is written to the character but what Build applies through the wizard.
- **Tests:** `reliability.py`'s rules and floors, as a harness; the app's rankings equal the prototype's on 500
  fixed answer sets (the prototype is the oracle; the review page already passes this on 400); the adaptive order;
  GM notes match their rules; Build gives the same character as doing it by hand and lands on Rings & Traits; every
  guide's suggested build passes in the wizard; 390×844 layout, 44 px touch targets and no page errors; removal
  proof and the dependency checker.

## 12. Content plan (ruling 9: Clan by Clan)

**First release:** the finder, every question, every School's rating and generated card, the two guides above, and
a short own-words introduction for each of the 25 Clans. The generated card uses the app's description, Family and
School Traits, Skills, Outfit, Rank 1 Technique, notes and Paths, so every School is useful from day one. Schools
without a full guide say "Full guide coming". Guides then follow in batches:

| Batch | Schools |
|---|---|
| 1 | Crab, Crane, Dragon, Lion (28 remaining) |
| 2 | Phoenix, Scorpion, Unicorn, Mantis (28) |
| 3 | Imperial and the Minor Clans (19) |
| 4 | Brotherhood of Shinsei (22) |
| 5 | Spider (6) |

After batch 1, guides become searchable in Search and the Library (ruling 3).

## 13. Next

1. **The book step**, in a Claude session on the owner's laptop: "Read `Versions/PART L — Phase 16 Character
   Finder/audit/KICKOFF-BOOK-READING.md` and carry out the book-reading step of the rating audit, one Clan at a time."
2. **The group's answer codes**, one per player with their character's School.
3. **After the book step:** the owner's spot check (`SPOT-CHECK.md`) and the group's short list (`SHORT-LIST.md`);
   then the review page is rebuilt and republished, and the guides start, Clan by Clan.

## Files in this folder

| File | What it is |
|---|---|
| `DESIGN.md` | This document |
| `ROLLBACK.md` | Design only: deleting the folder removes it |
| `prototype/ratings.py` | The draft rating of every School (section 6) |
| `prototype/finder.py` | Questions and version 2 scoring |
| `prototype/reliability.py` | The tests and pass marks in section 9: `python3 -I reliability.py` |
| `prototype/examples.py` | Example players |
| `prototype/tables.py` | Regenerates the three marked tables in this document (and `design-data.json`) |
| `prototype/extract-schools.js`, `schools.json` | Reads the School list, flavour text, pages and Families from the built app (run `python3 build.py` first) |
| `prototype/verify-builds.js`, `builds.json` | Enters the suggested builds in the real wizard and prints the app's own XP and findings |
| `prototype/design-data.json`, `examples.json` | Generated: the tables and example players as data |
| `review-page/character-finder.html`, `finder-data.json` | The published review page and its data |
| `review-page/extract-tech.js`, `build-data.py`, `check-parity.js` | Rebuild `finder-data.json`; check the page's scoring against the prototype |
| `audit/KICKOFF-BOOK-READING.md` | Instructions for the book-reading step, for a session on the owner's laptop |
| `audit/rubric.py` | The definitions every rating is checked against |
| `audit/extract-evidence.js`, `app-evidence.json`, `rater.py`, `WORKSHEET.md`, `worksheet.json` | Step 2: the app's evidence and what it backs |
| `audit/book-worklist.json`, `book-evidence.json`, `extract_pages.py`, `check_evidence.py` | Step 3: the questions, the answers, and the tools |
| `audit/known-characters.json` | Step 5: the group's answer codes (empty until collected) |

To re-run everything after changing a rating or a question:

```bash
python3 build.py                                    # at the repository root
cd "Versions/PART L — Phase 16 Character Finder/prototype"
node extract-schools.js && node verify-builds.js
python3 -I reliability.py && python3 -I examples.py && python3 -I tables.py
cd ../review-page && node extract-tech.js && python3 -I build-data.py && node check-parity.js
```
