# School Technique Text and Technique Name Clashes — iPhone check

This covers both layers of the release: Phase 6's first release (Part G) and BUGFIX — Technique Name
Clashes. It takes about fifteen minutes, on the live site after the merge.

Tests C to F change a School. For those, use a throwaway copy: on the Characters list, tap ⋯ on any
character, then **Save As a copy**. Delete the copies at the end.

To raise a Rank: in **Manage**, on **Identity**, raise **Other Insight Bonus** until **Insight
Rank** reads the number given.

Each Technique's description begins with its School and Rank, for example
`[School Technique — Rank 1, Usagi Bushi]`. The text after that is what these tests read.

## Test A — your existing Usagi Bushi (made before this release)

1. Open it from the Characters list.
2. On **Techniques**, read each of its School's Techniques.

**Check:** none reads "Full description not yet available". Each describes the Technique and ends
"(Core Rulebook p.221)". Speed of the Hare, for example, adds your Athletics to your Armor TN.

**Check:** if you had typed your own words into one of those descriptions, they are unchanged.

## Test B — your existing Yoritomo Courtier

1. Open it.
2. On **Techniques**, read each of its School's Techniques.

**Check:** each ends "(Core Rulebook p.121)". Storm Heart, for example, makes your Willpower count
one Rank higher for Intimidation (Control).

## Test C — a Toku Bushi's Rank 4 (the defect found on 2 October)

1. In a copy, tap **Manage**. On **Clan & School**, choose Clan **Minor Clan**, Minor Clan
   **Monkey**, School **Toku Bushi**, then tap **Apply School**.
2. Raise Insight Rank to **4**.

**Check:** Forge Your Own Fate says that, for a Void Point, the attacker drops the two highest dice
of their damage roll (Core Rulebook p.222). It says nothing about Social rolls or Status.

## Test D — a Doji Courtier's Rank 5 (the second clash)

1. In a copy, apply **Crane → Doji Courtier**.
2. Raise Insight Rank to **5**.

**Check:** The Gift of the Lady describes a Courtier (Manipulation) / Awareness roll that turns
someone's feelings your way (Core Rulebook p.111). It says nothing about Tattoos.

## Test E — the Kikage Zumi keeps its own Gift of the Lady

1. In a copy, apply **Dragon → The Hitomi Kikage Zumi Order [Monk]**. It is listed under the
   Dragon, not the Brotherhood.

**Check:** its Rank 1, The Gift of the Lady, gives a Tattoo and adds Reflexes to Armor TN, as it
did before.

## Test F — two Schools from the other books

1. In a copy, apply **Minor Clan → Mantis → Mantis Brawler [Bushi]**. Raise Insight Rank to **2**.
2. **Check:** Way of Drunken Fists and Drunk Loses His Sandal each end "(The Great Clans p.166)".
3. Apply **Minor Clan → Fox → Kitsune Shugenja**.
4. **Check:** Essence of Chikushudo lets your Sense, Commune and Summon reach animal spirits, and
   ends "(Core Rulebook p.220)".

## Test G — Play mode

1. Open the Usagi Bushi from Test A and tap **Done**.

**Check:** the Techniques tab shows the same texts as in Manage.

When you have finished, delete the copies.

**Report:** any Technique of a Minor Clan or Mantis School still showing "not yet available", a
text that seems to describe a different Technique, or a page number that looks wrong.

The seven Android checks of Phase 0.7 are still optional and not part of this list.
