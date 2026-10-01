# Phase 4.6 audit: is every Alternate Path in the owner's books in the sheet?

1 October 2026, after the third release. **Answer: yes.** Every Alternate Path and Ronin Path printed in
the owner's 16 sourcebooks is now in the sheet's Path library, found three independent ways. The only
names the audit could not place come from a book the owner does not have.

The library now holds **214 Paths**: the 12 Monk Paths it already had, the Core Rulebook's 27 (first and
second releases) and the third release's 175. Of those 175, **136 can be taken** in the sheet and **39 are
recorded only**, because no School in the sheet can take them (ronin, Naga, peasant and geisha Paths;
see the end).

## The three checks

### 1. The books themselves (all 16 PDFs, text kept out of the repository)

- **Every page carrying a Path's mechanics.** 110 pages across the 16 books say "Replaces:" or
  "Technique Rank:". Each was compared with the pages the library cites (within one page). **None is
  uncovered.** Before the ronin Paths were added, the only uncovered pages were Enemies of the Empire
  pp. 200–205 and the Core Rulebook pp. 234–235, which is how they were found.
- **Every Path heading**, in all the books' spellings ("NEW ALTERNATE PATH", "New Ronin Path", "neW
  alTernaTe paTh"): 262 hits; 190 name a Path in the library by name. The other 72 were each read by
  hand: the two Imperial Histories' "Alternate Paths:" sidebars (alternate-history notes, not character
  Paths), NPC stat lines in Enemies of the Empire's ronin chapter naming the Ronin Path an NPC uses,
  headings split across two columns whose Path is in the library under its real name, and pages that
  mention Technique Rank without defining a Path (rules text, a spell, the printed character sheet, an
  index).
- **Emerald Empire, Naishou Province and Unexpected Allies 2 have no Paths.** Emerald Empire mentions
  Alternate Paths only in its temple rules, as something a sensei might devise (p. 286); Naishou
  Province's one new mechanic of this kind is a Basic School, the Lion Elite Spearmen, which the sheet
  already has; Unexpected Allies 2 has NPC write-ups only.

### 2. Secrets of the Empire's own School Index (pp. 248–251)

The book lists "every human 4th Edition School printed so far" with its book and page, including 192
Path entries. **169 match a library Path by name; the other 23 are all accounted for:**

| Entry in the index | Why it is not a separate Path in the sheet |
|---|---|
| Aerie Falconer, Colonial Conqueror, De Bellis Legionnaire, Dragon Overseer, Imperial Explorers, Isawa Archaeologist, Kitsune Summoner, Rajya ke Varisa, Second City Guardsman, Sons of Shadow, Unicorn Doomseeker | **The Second City**, a book not among the owner's 16 (the index gives no page) |
| Kituski Debater; Children of Chikushudo (twice); Mantis Master Bowmen; Shuba Armoursmiths; People's Legonnaire | Misspellings of Kitsuki Debater, Child of Chikushudo, Tsuruchi Master Bowman, Shiba Armorsmith and People's Legionnaire, all in the library |
| Three Man Alliance Dojo; Soldiers of the Three Man Alliance | The library's Three Man Alliance Soldier (Imperial Histories p. 149) |
| Agents of the Hantei | The section heading over Brotherhood Spy (Imperial Histories p. 69), in the library |
| Dutiful Disciple, Ronin Order, Self-Taught Shugenja | Ronin shugenja **Basic Schools** (Enemies of the Empire p. 205), listed beside the ronin Paths |

### 3. The 24 fan-wiki pages in the sourcebook index

`SOURCEBOOK INDEX — Page Map/wiki_links.json`: the Magical Samurai and Last Haiku pages for the twelve
Clans (Crab, Crane, Dragon, Lion, Phoenix, Scorpion, Spider, Unicorn, Imperial, Monk, Mantis, Minor
Clans), all fetched. Their Path sections hold 290 entries. **268 match a library Path; the other 22:**

| Entry on the wiki | Why |
|---|---|
| Rajya ke Varisa (three pages), Aerie Falconer, Dragon Clan Overseer, De Bellis Legionnaire, Isawa Archeologist, Sons of Shadow, Colonial Conqueror (two pages), Unicorn Doomseeker | The Second City (as above) |
| Scorpion Maskmaker; Susumu Courtier | Last Haiku only, with no book named; neither appears in any of the 16 books (Susumu Courtier is an Age of Exploration Path, The Second City's era) |
| Soldier of the Three Man Alliance (four pages); Student of the Cliff's Edge (two); Children of Chikushudo (two); Barefoot Breathren | The library's Three Man Alliance Soldier, Cliff's Edge Student, Child of Chikushudo and Barefoot Brethren |

## Not in the owner's books

Thirteen Paths: the eleven from **The Second City**, and Scorpion Maskmaker and Susumu Courtier. They
can be added the same way if the owner obtains the book; nothing in the sheet needs to change first.

## Schools the Paths name that the sheet does not have

Seven Paths can also replace a Rank of a School the sheet lacks. Each is still offered in the Schools
the sheet has; the missing School is recorded on the clause (`notInSheet`) and listed by
`AP46.notInSheet()`. These are candidates for Phase 4.7 (Schools):

| School | What it is | Paths that name it |
|---|---|---|
| Hiruma Scout | A Basic School, Imperial Histories p. 147 | Hiruma Snipers, The Falcon's Strike, Hiruma Slayers, Crab Knife-fighters, Hiruma Yojimbo |
| Akodo Tactical Master | An Advanced School, The Great Clans p. 139 | Akodo Siege Strategist |
| Kaiu Siege Master | Imperial Histories 2 p. 197 prints "Kaiu Siege Master 1". No School of that name is printed in the owner's books; the nearest is the Book of Earth's Kaiu Siegemaster (p. 192), a Rank 5 Path, which the sheet has | Kaiu Shipmasters |

## Recorded only: 39 Paths no School in the sheet can take

They are in the library with their Techniques, for completeness and for a later ronin or Naga phase,
but never appear in the picker (the harness checks every School at every Rank, 1 to 6).

- **Ronin Paths (33):** the Core Rulebook's five Rank 1 Ronin Paths (Disciples of Sun Tao, Forest
  Killers, Tawagoto's Army, Tengoku's Justice, The Tessen, pp. 234–235; the book calls Ronin Paths "a
  specialized form of an Alternate Path"); Enemies of the Empire's sixteen (Ranks 2 to 5, pp.
  200–205) and its Guardian of the Hidden Temple, a Kolat Path (p. 49); the Book of Air's Master of
  Games (p. 180); the Book of Water's Scales of the Carp (p. 186); the Book of Void's Hateru Ninja
  (p. 182) and Ghost of the Forest (p. 195); Imperial Histories 2's Hawk Purist (p. 103) and The
  Unbroken (p. 220); Secrets of the Empire's The Thousand, Order of Isashi and Order of the Five
  Weapons (pp. 234–235); Strongholds of the Empire's The Guards' Wrath (p. 168) and Fireman Gang Lord
  (p. 169).
- **Peasant (2):** Koga Ninja (Book of Void p. 182) and People's Legionnaire (Imperial Histories
  p. 123), each with its own Skills and Outfit.
- **Geisha (1):** The Silken Promises (Book of Air p. 179).
- **Naga (3):** Master Bowman, Disciples of the Dashmar and Pearl Shapers (Enemies of the Empire p. 85).

The exact list is pinned in the harness (`BOOK3`, the fourth column) and checked by
`AP46-R3LOAD-RECORDED-ONLY`.

## Not Paths, found along the way

Schools rather than Paths: the Fudoist Order (Imperial Histories 2 p. 287, a Basic School), the three
ronin shugenja Schools (Enemies of the Empire p. 205), the Disciples of Sun Tao Ronin Advanced School
(Secrets of the Empire), Void Mystic, Tsudao's Legion and the Naga Warrior School. The Book of
Water's "Disciple of Sun Tao" (p. 163) is an NPC's School line. These belong to Phase 4.7 (Schools)
if anywhere.
