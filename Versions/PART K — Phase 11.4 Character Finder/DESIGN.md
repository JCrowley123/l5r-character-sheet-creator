# Character Finder: design draft

**Status, 24 November 2026:** draft for the owner's review. Nothing is built and no application file is changed.
The phase number 11.4 is a proposal (11.3 is the App Bar). It sits in Part K beside the creation wizard
(Phase 11.2), which it feeds. The roadmap has no entry yet; one follows the owner's approval.

**In one paragraph.** An optional questionnaire for players who do not know what to play. About a dozen
multiple-choice questions, each with a "No preference" answer, narrow the 105 Basic Schools the app offers down
to 1–2 **hard** recommendations, 3–4 **soft** ones, and sometimes a **something different** pick. Every
recommendation opens a **guide**: what the character is, how they play, how to roleplay them, a suggested
starting build, where they can go later, and any reason to talk to the GM first. A **Build** button hands the
choice to the creation wizard, which applies Clan, Family and School through its own steps and carries on from
Rings & Traits. It is a guide, not a builder: the player still makes every purchase.

---

## 1. What the owner has already decided

From the conversation of 24 November 2026:

1. **Full scope.** Every Basic School is a candidate, not only the Great Clans and the Core Rulebook. A new
   player "will not know what they don't know", and a niche character may be the one they enjoy most.
2. **Two questions set the player's comfort level:** how complex a character they want, and how comfortable
   they are with niche characters. These **rank** results; they never hide them.
3. **A guide, not a build.** The results are suggestions; the player decides what to build.
4. **GM warnings** on complex or niche characters, advising the player to consult their GM.
5. **A Build button** on each recommendation that feeds the creation wizard and lets the player carry on with
   Skills and the rest.
6. **A suggested starting build** in each guide: Skills, Advantages and Disadvantages, and Ring and Trait
   ranks suited to a new (Rank 1) character of that School.

## 2. What it is built from

All of the following already exists in the app:

| Need | Already in the app |
|---|---|
| Every Basic School with Clan, Honor, Trait benefit, Skills, Outfit, Techniques, Affinity | `SCHOOL_LIBRARY`, `MINOR_CLAN_SCHOOL_LIBRARY`, `BROTHERHOOD_SCHOOL_LIBRARY`, `MISSING_BASIC_SCHOOL_DATA` (106 entries, 105 names: Toritaka Bushi is offered by both the Crab and the Falcon) |
| One or two sentences per School in our own words, with page | `SCHOOLLORE9` (Part H Phase 9.1) |
| Printed page for every School, Clan and Family | `SCHOOLREF1432` (Part K Phase 14.3b) |
| Every Family and its +1 Trait | `FAMILY_LIBRARY`, `MINOR_CLAN_LIBRARY` |
| Technique text in our own words | `TECH_DESCRIPTIONS` |
| Where a School can go later | `ALTERNATE_PATH_LIBRARY` (214 Paths, each naming the Schools it replaces), `ADVANCED_SCHOOL_LIBRARY` |
| XP costs, the creation cap of 4, the character check | `traitCost`/`voidCost`/`skillCost`, BUGFIX — Creation Cap of Four, `validateCharacter()` |
| Applying Clan, Family and School without new rules | the creation wizard (`CW112`, `CW1121`) |
| Identity text boxes for the roleplay prompts | `f_appearance`, `f_personality`, `f_history`, `f_notes` |

**Not included: ronin.** `FAMILY_LIBRARY` lists four ronin families, but no ronin School exists yet. Ronin
become candidates when the planned ronin work (roadmap: "PLANNED — ronin, tattoos and a new Combat tab") adds
them. Their ratings are then one row each in the table in section 6.

**Not included: Advanced Schools and Alternate Paths.** A new character cannot take them (each needs a
Technique Rank or Insight Rank above 1). They appear in each guide as "Where they can go later".

## 3. The player's journey

### Where it starts

- **The wizard's Clan step** gains a "Not sure? Help me choose" button above the Clan cards.
- **The Characters screen** gains "Not sure what to play?" beside Create New Character. A player can browse
  without making a character; one is only made when they press Build.

### Question screens

Full screen, one question at a time, like the wizard: the question, its answers as large buttons, Back,
a progress line ("Question 4 of 12") and "See my results now" from question 6 onwards. Every question has
"No preference", so a player who skips everything still gets results (the whole list, ordered by how common
each School is).

### Results screen

```
Your best matches
  [mon] Hida Bushi                 Crab · Bushi           Straightforward · Common
        Endure the enemy's blows, then crush them with heavy weapons.
        [Read the guide]  [Build]

Also worth a look
  [mon] Daidoji Iron Warrior       Crane · Bushi          Straightforward · Common
  [mon] Lion Elite Spearmen        Lion · Bushi           Straightforward · Uncommon  ⚠ Ask your GM
  ...

Something different                                   (only when the player is open to it)
  [mon] Fukurokujin's Eyes         Brotherhood · Monk     Involved · Unusual          ⚠ Ask your GM

[See all matches (105)]   [Change my answers]
```

**See all matches** lists every School in score order with the same badges, filterable by Clan, type,
complexity and how unusual. Nothing is ever hidden, only ordered.

### Guide screen

One School, in these sections (section 7 has two complete examples):

1. **At a glance:** Clan mon, Clan and Family (with the Family's +1 Trait), type, starting Honor, the School's
   +1 Trait, complexity, how unusual, source and page.
2. **Ask your GM / Good to know** notes (section 5), when there are any.
3. **Who they are:** the Clan, the Family and the School in plain words.
4. **How they play:** what they are good at, their School Skills, and the Rank 1 Technique in our own words.
5. **Roleplaying them:** attitudes, relationships, good story hooks, and one way to play against type.
6. **A suggested starting build** (section 8), with the reason for each choice.
7. **Where they can go later:** Alternate Paths and Advanced Schools open to this School, from the app's data.
8. **Build this character** button.

### Build

Build asks for a name if there is no character yet, then drives the creation wizard exactly as a player would:
it chooses the Clan card, the Family card and the School card in turn, so Apply School asks its own Affinity,
Deficiency, Honor and specialisation questions as normal. The player lands on **Rings & Traits** with Name,
Clan, Family and School done, and can still go Back and change any of them. If a Clan is already applied, the
wizard's existing "start over?" confirmation appears first.

On Rings & Traits, Skills and Advantages & Disadvantages, a folded panel reads "Suggested for a Hida Bushi"
and shows that step's part of the suggested build. It only informs: nothing is bought for the player.

### "Bring them to life" (optional, at Review)

Our own-words versions of the book's Twenty Questions (Core Rulebook pp.100–102), offered as optional prompts
after the finder or at the wizard's Review step. Each answer is added to an existing Identity box, headed by its
question, so the save format does not change:

| Box | Prompts (paraphrased, never quoted) |
|---|---|
| Appearance | How would others describe them? What is the first thing people notice? |
| Personality | Their greatest strength and weakness; which part of Bushido they hold dearest and which they neglect; habits and mannerisms; the emotion they find hardest to hide; how they treat a subordinate who errs; how religious they are |
| History / Background | What drives them; who they trust most and why; what they think of their own Clan; whether they are married or betrothed; any prejudices; whom they truly serve; how their parents would describe them; their highest ambition; how they will die |
| Notes | Favourite and least favourite things; and the twenty "other questions" as optional extras |

Where the finder already asked something (how they will die, their ambition), the prompt starts from that
answer: "You said they will die in a duel. Against whom, and why?"

## 4. The questions

**Adaptive order.** Every player answers 11 or 12 questions:

| | Non-caster path | Caster path |
|---|---|---|
| 1–3 | Magic · Complexity · How unusual | the same |
| 4 | Approach (what they reach for first) | What their magic does best |
| 5 | Fight style, or Court style after "Words" or "Craft" | Which Element calls to them |
| 6–9 | Remembered for · Home · Breaking rules · Bushido | the same |
| 10 | How religious | (skipped: a shugenja is religious by definition) |
| 11–12 | Companion · How they will die | the same |

**Only one question filters.** Answering "Yes" to magic leaves only Shugenja Schools, which is the owner's own
example. "No" and "A touch of the mystical" remove Shugenja. Everything else adds or subtracts points. The
Bushido question uses the seven tenets as the app's Paragon Advantage names them (Core p.152). The last
question is the book's own question 20.

The wording below is a draft for the owner to edit. "What it scores" is what each answer adds to a School's
score (section 6 explains the arithmetic).

<!-- generated:QUESTIONS (prototype/tables.py) -->
**Do you want your character to cast spells?** (`magic`)

| Answer | What it scores |
|---|---|
| Yes: magic is the heart of who they are | only Shugenja Schools remain |
| A touch of the mystical, but no spells | Shugenja Schools removed, mystic +2, spirits and the dead +1, monster hunter +1, Monk +2 |
| No: they rely on their own skill | Shugenja Schools removed, mystic -1 |
| No preference | no effect |

**How much rules detail do you want to keep track of?** (`complexity`)

| Answer | What it scores |
|---|---|
| Keep it simple: I am still learning the game | Straightforward +3, Some extra +0, Involved -3 |
| Some extra options are fine | Straightforward +1, Some extra +2, Involved +0 |
| Lots of moving parts: I like mastering a system | Straightforward -1, Some extra +1, Involved +3 |
| No preference | no effect |

**How do you feel about unusual characters?** (`niche`)

| Answer | What it scores |
|---|---|
| A classic samurai most players will recognise | Common +3, Uncommon +0, Unusual -4 |
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
| Never: their word and their honour are everything | high Honor +3, low Honor -2 |
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

A guide can add its own note where the data cannot know. For example, the Kuni Witch-Hunter needs a campaign
with the Taint and maho in it.

Result: 52 Schools carry at least one "Ask your GM" note, 35 carry only "Good to know", and 18 carry neither.

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

## 6. Scoring, and the rating of every School

### Each School's rating

Five things per School, drafted here for the owner to correct:

- **Plays like:** one to three *main* labels (worth double) and up to three *also* labels, from 29 plain-words
  labels such as front line, duelist, archer, cavalry, bodyguard, monster hunter, stealth, diplomat, schemer,
  investigator, healer, battle magic or mystic.
- **Home:** one or two of ten settings (the Wall, court, mountains, libraries and temples, plains, sea,
  battlefield, wilds, streets and shadows, the road). This is how Clans come in without a "pick a Clan"
  question.
- **Complexity:** Straightforward, Some extra or Involved. Every Shugenja and monk is Involved; most courtiers,
  ninja, artisans, duelists and riders have Some extra.
- **How unusual:** Common, Uncommon or Unusual. Core Rulebook Great Clan Schools are mostly Common;
  supplements, Minor Clans and the Brotherhood are mostly Uncommon; Spider, ninja, heresies, single-era and
  alternate-timeline Schools are Unusual.
- **Type, Honor and Affinity** come from the app's own data, not from this rating.

### The arithmetic

1. Each answer lists label weights (for example "front line +3"). A School gains the weight **×2** for a
   *main* label and **×1** for an *also* label.
2. Type, Home, Honor band (6 or more high, 3.5 or less low), complexity and how unusual add their weight once
   if they match. For a caster, the chosen Element adds +3 when it is the School's Affinity (Isawa, who chooses
   an Affinity, always matches) and −2 when it is the Deficiency.
3. Ties go to the less complex, then the more common, then alphabetical.
4. **Hard picks:** the top School, plus the second if it scores at least 80% of the first.
   **Soft picks:** the next four, with at most two from any one Clan across hard and soft, so the list has
   variety. **Something different:** the best Unusual School not already shown, if the player did not ask for
   a classic samurai and it scores at least half of the top score.

### The rating table

<!-- generated:SCHOOLS (prototype/tables.py) -->
| School | Clan | Type | Honor | Plays like (main · also) | Home | Complexity | How unusual | Source |
|---|---|---|---|---|---|---|---|---|
| Hida Bushi | Crab | Bushi | 3.5 | front line, monster hunter · bodyguard | battlefield, the Wall | Straightforward | Common | Core Rulebook p.106 |
| Hida Pragmatist [Bushi] | Crab | Bushi | 2.5 | unarmed · bodyguard, monster hunter | the road, the Wall | Some extra | Uncommon | Emerald Empire p.247 |
| Hiruma Bushi | Crab | Bushi | 4.5 | monster hunter, fast skirmisher · archer, stealth | the Wall, wilds | Straightforward | Common | Core Rulebook p.108 |
| Hiruma Scout [Bushi] | Crab | Bushi | 4.5 | fast skirmisher, stealth · monster hunter | the Wall, wilds | Some extra | Unusual | Imperial Histories 1 p.147 |
| Kaiu Engineer [Artisan/Bushi] | Crab | Artisan/Bushi | 4.5 | craftsman · commander, front line | battlefield, the Wall | Some extra | Uncommon | The Great Clans p.39 |
| Kuni Shugenja | Crab | Shugenja (Earth) | 2.5 | battle magic, monster hunter · scholar | libraries and temples, the Wall | Involved | Common | Core Rulebook p.107 |
| Kuni Witch-Hunter [Monk] | Crab | Monk | 5.5 | investigator, monster hunter · mystic, traveller | the road, the Wall | Some extra | Uncommon | The Great Clans p.40 |
| Toritaka Bushi | Crab or Falcon | Bushi | 5.5 | monster hunter, spirits and the dead · animal companion | the Wall, wilds | Some extra | Uncommon | Core Rulebook p.219 |
| Yasuki Courtier | Crab | Courtier | 2.5 | merchant · diplomat, schemer | court, sea | Some extra | Common | Core Rulebook p.107 |
| Asahina Shugenja | Crane | Shugenja (Air) | 6.5 | healer, protective magic · artist, mystic | court, libraries and temples | Involved | Common | Core Rulebook p.110 |
| Daidoji Iron Warrior [Bushi] | Crane | Bushi | 6.5 | bodyguard, front line · commander | battlefield, court | Straightforward | Common | Core Rulebook p.111 |
| Daidoji Scout [Bushi] | Crane | Bushi | 3.5 | fast skirmisher, stealth · archer | battlefield, wilds | Some extra | Uncommon | The Great Clans p.70 |
| Doji Courtier | Crane | Courtier | 6.5 | diplomat · artist | court | Some extra | Common | Core Rulebook p.110 |
| Doji Magistrate [Bushi] | Crane | Bushi | 5.5 | bodyguard, investigator | court, the road | Some extra | Uncommon | Emerald Empire p.170 |
| Kakita Artisan | Crane | Artisan | 5.5 | artist · diplomat | court | Some extra | Uncommon | The Great Clans p.71 |
| Kakita Bushi | Crane | Bushi | 6.5 | duelist · artist | court | Some extra | Common | Core Rulebook p.109 |
| Kitsuki Investigator [Courtier] | Dragon | Courtier | 5.5 | investigator · diplomat, scholar | court, mountains | Some extra | Common | Core Rulebook p.114 |
| Mirumoto Bushi | Dragon | Bushi | 4.5 | duelist · mystic | mountains | Some extra | Common | Core Rulebook p.112 |
| Mirumoto Taoist Swordsman [Bushi] | Dragon | Bushi | 5.5 | duelist, mystic | mountains | Some extra | Uncommon | Emerald Empire p.221 |
| Tamori Shugenja | Dragon | Shugenja (Earth) | 4.5 | battle magic, unusual magic · healer | mountains | Involved | Common | Core Rulebook p.113 |
| The Hitomi Kikage Zumi Order [Monk] | Dragon | Monk | 4.5 | mystic, unarmed · all-out attacker | mountains | Involved | Unusual | Imperial Histories 1 p.215 |
| The Hoshi Tsurui Zumi Order [Monk] | Dragon | Monk | 4.5 | mystic, unarmed | mountains | Involved | Unusual | Imperial Histories 1 p.214 |
| The Togashi Tattooed Order [Monk] | Dragon | Monk | 4.5 | mystic, unarmed · traveller | mountains, the road | Involved | Uncommon | Core Rulebook p.114 |
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

These show the depth intended for every School. The facts come from the app's data (pages cited). The
roleplay advice is our own and is the part the owner should check hardest.

### Hida Bushi

**At a glance.** Crab Clan · Hida family (+1 Strength) · Bushi · School +1 Stamina · starting Honor 3.5 ·
Straightforward · Common · Core Rulebook p.106. No GM notes.

**Who they are.** The Crab hold the great Wall on the Empire's southern border against the Shadowlands, and
the Hida are their ruling family and the heart of their army. Their School is one of the oldest in Rokugan:
wear heavy armour, take the blow, then answer with a heavy weapon such as the tetsubo. Other Clans,
the Crane above all, think the Crab crude. The Crab think the other Clans have no idea what is out there.

**How they play.** The party's front line. **Rank 1, The Way of the Crab:** no Armor TN penalty for heavy
armour (except for Stealth) and +1k0 damage with Heavy Weapons. So wear the heaviest armour you can and use
your tetsubo. Rank 2 adds Reduction equal to your Earth Ring, which is why the build below raises Earth.
School Skills: Athletics, Defense, Heavy Weapons (Tetsubo), Intimidation, Kenjutsu, Lore: Shadowlands and one
Bugei Skill of your choice. Outfit: Light or Heavy Armor, Sturdy Clothing, Daisho, Heavy Weapon or Polearm,
Traveling Pack, 3 koku.

**Roleplaying them.**
- You have seen what the rest of the Empire only fears. Patience with ceremony is short; patience with people
  who pull their weight is long.
- Honor 3.5 is not dishonour. A Hida bends etiquette, not duty.
- Intimidation is a social tool as well as a battle cry. Courts expect you to be blunt, so use it.
- Good hooks: a sibling lost on the Wall; a grudge against the Crane; a debt to a Kuni shugenja.
- Playing against type: a Hida who writes poetry about the Wall and is quietly good at it.

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

**With Disadvantages** (optional, 9 XP): Brash (3), Overconfident (3) and Antisocial (3, the Crab price). These
are true to type and make good stories. Spend the 9 XP on Kenjutsu 3, Lore: Shadowlands 2, Jiujutsu 2 and
Intimidation 2.

**Usually not worth it at Rank 1:** Void 3 costs 18 XP, nearly half the budget.

**Where they can go later** (from the app's data): Alternate Paths at Technique Rank 2: Crab Defender (Book of
Air p.172), Crab Sumai Wrestler (Book of Earth p.191), Tsuru's Legion (Sword and Fan p.202). At Rank 4: Crab
Knife-fighters (Book of Fire p.177), Yasuki Taskmaster (Sword and Fan p.203). Advanced School: Defender of the
Wall (Core p.247; needs Earth 4, Strength 5, Defense 4, Heavy Weapons 4, Lore: Shadowlands 5).

### Kuni Witch-Hunter

**At a glance.** Crab Clan · Kuni family (+1 Intelligence) · Monk-type School · School +1 Willpower · starting
Honor 5.5 · Some extra · Uncommon · The Great Clans p.40.
⚠ **Ask your GM:** from The Great Clans p.40, so check your GM uses this book. The character shines only if the
Taint and maho are part of the campaign, so ask about that too.

**Who they are.** The Kuni are the Crab's shugenja family, known for obsessive study of the Shadowlands.
The Witch-Hunters are a small band of Kuni mystic warriors who roam the whole Empire, ignoring Clan borders,
to hunt maho-tsukai (blood sorcerers) and Shadowlands infiltrators. Commoners welcome them. Other samurai
often do not.

**How they play.** An investigator who can fight. **Rank 1, To See the Darkness:** a Contested Roll
(your Investigation/Awareness against their Sincerity/Willpower) senses the Taint in someone, with +1k0 for
each full Rank of their Taint. You also gain +1k1 to resist the Taint and to attack Shadowlands creatures or
known Tainted foes. Rank 2 lets you recall a Shadowlands creature's weaknesses. School Skills: Investigation,
Jiujutsu, Kenjutsu, Lore: Shadowlands, Lore: Maho, Meditation and one Skill of your choice. Outfit: Rugged
Clothing, Daisho, Knife, Jade Pendant, Traveling Pack, 3 koku.

**Roleplaying them.**
- Most of the job is asking questions, watching faces and being unwelcome. The sword comes out last.
- The great dilemma: a maho-tsukai may be a desperate, sympathetic person who made one terrible choice. What
  do you do with them?
- You answer to no local lord's comfort. That makes enemies and occasionally saves a province.
- Good hooks: the sorcerer who got away; a fellow hunter who fell to the Taint; a village that hid you.
- Playing against type: a hunter who believes most of the Tainted can be saved.

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

**Usually not worth it at Rank 1:** Void 3 (18 XP). The Witch-Hunter is a [Monk] School but not a Brotherhood
one, so it does not get Brotherhood kiho rates.

**Where they can go later:** Alternate Path at Technique Rank 2: Student of Hitsu-do (Book of Fire p.179).

## 8. Suggested starting builds: rules and checks

- **Budget:** 40 XP, plus up to 10 XP from Disadvantages (shown as a separate, optional layer so a player who
  takes none still has a complete build).
- **Within the app's rules:** Traits ×4, Void ×6, Skills by new Rank, Emphases 2 XP, Clan and School prices
  as the app applies them, and nothing above 4 at creation.
- **Prefer raising the partner Trait.** When the Family or School has already raised one Trait of a Ring,
  raising its partner lifts the whole Ring. That is the single most useful tip for a new player, and the
  guides say so where it applies.
- **Every suggested build is checked by entering it in the real wizard.** For this draft, a scratch script did
  that for both examples, four builds in all:

| Build | XP spent / total | Character check | Review allows Finish |
|---|---|---|---|
| Hida Bushi | 40 / 40 | no findings | yes |
| Hida Bushi with Disadvantages | 40 / 40 (Disadvantages give 9) | no findings | yes |
| Kuni Witch-Hunter | 40 / 40 | no findings | yes |
| Kuni Witch-Hunter with Disadvantages | 40 / 40 (Disadvantages give 10) | no findings | yes |

  No page errors in any run. The script is `prototype/verify-builds.js`. In the build phase it becomes a
  harness that checks every guide's build, so a guide can never teach a build the app rejects.

## 9. Checks already run on this draft

`prototype/finder.py` implements sections 4 and 6 exactly and runs them against the app's real School list:

| Check | Result |
|---|---|
| Every School can be a **hard pick** on some set of answers | **105 of 105** |
| Every School can be the **top** pick | 104 of 105. Hoshi Tsurui Zumi reaches second place behind its near twin, the Togashi Tattooed Order |
| 20,000 random players: any result list shorter than 6 Schools | **0** |
| No School dominates: the most frequent hard pick | 6.6% of players (Asahina Shugenja) |
| Every School appears somewhere in hard, soft or "something different" | **105 of 105** |

The first run found a real problem: **Matsu Berserker could never be a hard pick**, because Akodo Bushi had the
same labels and always outscored it. The fix gave the Matsu their own "all-out attack" label and fight answer,
which the School's own description supports ("total, fearless commitment to the attack"). That is exactly what
this check is for. It will run again every time a rating or question changes.

**Three example players** (from `prototype/examples.py`):

| Player | Hard pick | Soft picks | Something different |
|---|---|---|---|
| New, wants a classic warrior (simple, classic, sword, front line, the Wall, Courage, last stand) | Hida Bushi | Daidoji Iron Warrior, Lion Elite Spearmen, Heichi Bushi, Matsu Berserker | none (asked for classic) |
| Curious (a touch of the mystical, open to different, the road, Honesty, deeply religious, walks alone, fighting the darkness) | Kuni Witch-Hunter | Toritaka Bushi, Order of Heroes, Temples of the Thousand Fortunes, Togashi Tattooed Order | Fukurokujin's Eyes |
| Wants a healer (magic, healing, Air, court, never breaks rules, Compassion, old age) | Asahina Shugenja | Fuzake, Seppun, Isawa and Yogo Wardmaster shugenja | none good enough |

## 10. How it would be built

The project's rules for every phase apply. Specifically:

- **Own fragments, own marker.** `src/sheet/…-feat-character-finder.js` (logic and screens) and
  `…-feat-character-finder-content.js` (questions, ratings, guides) behind `CHARACTER_FINDER_ENABLED`, marker
  `PART K PHASE 11.4`. Content batches then change only the content file.
- **No edits inside the wizard's fragments.** The Clan-step button and the "Suggested for…" panels are added by
  wrapping `CW112.render`, as BUGFIX — Creation Cap of Four already does. Build chooses the wizard's own cards.
- **Declared dependency** on Phase 11.2 (the wizard) for Build and the panels. If 11.2 were removed, the finder
  still works as a browser and Build is hidden. Soft use of Phase 9.1's flavour text, 14.3b's page references
  and Phase 4.6/4.7's Path data is guarded: each section is left out when its source is absent.
- **No save-format change.** Finder answers live only while the finder is open (and in this browser's storage
  for "Change my answers"). The roleplay prompts write into existing Identity boxes.
- **Tests** (one harness plus pinned negative variants, as usual): the adaptive question order; the app's
  rankings equal the prototype's for a fixed sample of 500 answer sets (the prototype is the oracle);
  reachability (105/105) and no short list; warnings match their rules; Build gives the same character as doing
  it by hand and lands on Rings & Traits; every guide's suggested build passes in the wizard; 390×844 layout,
  44 px touch targets and no page errors; removal proof and the dependency checker.

## 11. Content plan

**First release:** the finder, every question, every School's rating and generated card, the two guides above,
and a short own-words introduction for each of the 25 Clans. The generated card uses the app's description,
Family and School Traits, Skills, Outfit, Rank 1 Technique, notes and Paths. So every School is recommendable
and useful from day one. Schools without a full guide yet say "Full guide coming".

**Then guides in batches, Clan by Clan.** Each batch adds the roleplay sections and a verified suggested build:

| Batch | Schools |
|---|---|
| 1 | Crab, Crane, Dragon, Lion (28 remaining) |
| 2 | Phoenix, Scorpion, Unicorn, Mantis (28) |
| 3 | Imperial and the Minor Clans (19) |
| 4 | Brotherhood of Shinsei (22) |
| 5 | Spider (6) |

Starting templates by play style (front line, duelist, archer, scout, court, shugenja by Element, monk) keep the
builds consistent. Each is then adjusted to its School and checked in the wizard.

## 12. Questions for the owner

1. **Phase number and place:** Part K, Phase 11.4, "Character Finder"? Another name ("Help me choose")?
2. **The one hard filter:** should "No" to magic remove every Shugenja, or only push them down?
3. **Entry points:** the wizard's Clan step and the Characters screen. Anywhere else, such as the Library?
4. **Ratings:** please check the table in section 6, especially *How unusual* and *Complexity*. They are
   judgement calls, and the checks in section 9 re-run after any change.
5. **Question wording:** edit freely. A shorter "quick" version (questions 1–6 only) could be offered too.
6. **Suggested builds:** hints only, as drafted? Or also a "Use this build" button, which would make it a
   builder rather than a guide?
7. **Roleplay prompts:** into the existing Identity boxes as drafted (no save change), or their own section
   (a save-format change)?
8. **Ronin:** fine to leave out until the planned ronin work adds ronin Schools?
9. **First guides to write after the two examples:** batch order as in section 11?

## Files in this folder

| File | What it is |
|---|---|
| `DESIGN.md` | This document |
| `ROLLBACK.md` | Design only: deleting the folder removes it |
| `prototype/ratings.py` | The draft rating of every School (section 6) |
| `prototype/finder.py` | Questions, scoring and the checks in section 9: `python3 -I finder.py` |
| `prototype/examples.py` | The three example players |
| `prototype/tables.py` | Regenerates the three marked tables in this document (and `design-data.json`) from the two files above |
| `prototype/extract-schools.js`, `schools.json` | Reads the School list, flavour text, pages and Families from the built app (run `python3 build.py` first) |
| `prototype/verify-builds.js`, `builds.json` | Enters the suggested builds in the real wizard and prints the app's own XP and findings |
| `prototype/design-data.json`, `examples.json` | Generated: the tables and example players as data |

To re-run everything after changing a rating or a question:

```bash
python3 build.py                                    # at the repository root
cd "Versions/PART K — Phase 11.4 Character Finder/prototype"
node extract-schools.js && node verify-builds.js
python3 -I finder.py && python3 -I examples.py && python3 -I tables.py
```
