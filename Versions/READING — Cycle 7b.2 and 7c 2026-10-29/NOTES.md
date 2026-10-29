# Reading notes — Cycle 7b.2 and 7c (29 October 2026)

Step 2 of the [Work Order — 28 October 2026](https://claude.ai/artifact/HiVDa7FasBFXnz3NjmCVxd): the rulings that
needed the books, read and recorded in our own words with book and page (ruling of 30 September). No build. Extracts
went to the session scratchpad only. Page numbers are printed pages (Core = PDF − 3; Emerald Empire and Enemies of the
Empire = PDF − 1). Code references are to `Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source
Reorganization for Maintainability/src/sheet/`.

The owner's questions are in one doc, [Reading Session Questions — 29 October
2026](https://claude.ai/artifact/92kuNDnHBTBRnz7ZR1jecM): Q1–Q7 below are its numbering.

## R23 — the set rules (Release 7b.2)

**The book (Core p.148, "Advantage/Disadvantage Sets", at the head of the Advantages).** Five restrictions:

1. Paragon and Dark Paragon cannot both be held.
2. Consumed and Failure of Bushido cannot both be held.
3. At most one entry from each matched set. Core names the sets as the Seven Fortunes' Blessings and Curses,
   Paragon/Failure, Dark Paragon/Consumed and Touched by the Realm/Cursed by the Realm, with "etc." after them. Its
   example: one Fortune's Blessing rules out a second Fortune's Blessing.
4. An Advantage from one set rules out the Disadvantage from its partner set: Paragon rules out Failure of Bushido,
   Dark Paragon rules out Consumed, Touched by the Realm rules out Cursed by the Realm. The Fortunes are exempt: the
   book's reason is that one Fortune may bless a person while a different one curses them.
5. The GM may override any of these, though the book advises care because the combinations unbalance play.

**The sets the sheet's libraries hold** (all Core; the supplement library `021-lib-supplement-entries.js` holds no
member of any set):

| Set | Members (sheet name) | Core page | One per set | Excludes |
|---|---|---|---|---|
| Paragon | Paragon (a chosen Bushido tenet) | p.152 | one Paragon only | Dark Paragon (rule 1); Failure of Bushido (rule 4) |
| Failure of Bushido | Failure of Bushido (a chosen tenet) | p.159 | one only | Consumed (rule 2); Paragon (rule 4) |
| Dark Paragon | Dark Paragon (a chosen Shourido precept) | p.147 | one only | Paragon (rule 1); Consumed (rule 4) |
| Consumed | Consumed (a chosen Shourido tenet) | p.157 | one only | Failure of Bushido (rule 2); Dark Paragon (rule 4) |
| Fortunes' Blessings | Seven Fortunes' Blessing (one of seven Fortunes) | pp.153–154 | one Blessing only | nothing (Fortunes exempt) |
| Fortunes' Curses | Seven Fortunes' Curse (one of seven Fortunes) | p.161 | one Curse only | nothing (Fortunes exempt) |
| Touched by the Realm | Touch of the Spirit Realms (a chosen realm) | p.154 | one only | Cursed by the Realm (rule 4) |
| Cursed by the Realm | Cursed by the Realm (a chosen realm) | p.158 | one only | Touch of the Spirit Realms (rule 4) |

Core's "Touched by the Realm" is the sheet's **Touch of the Spirit Realms** (Core p.154 prints the heading that way);
the rule names it by its short form. Each set is a single library entry with a configured choice, so "one per set"
means one row of that entry name. Core names no other sets. Pairs in the library that look matched but that Core does
not name (Luck / Unlucky, Great Destiny / Dark Fate, Friendly Kami / Wrath of the Kami, Elemental Blessing / Elemental
Imbalance, Blissful / Bitter Betrothal) are Q2.

**What the sheet does now.** Nothing: no set rule is checked anywhere. The Fortune Blessing module records the
second-Blessing flag as deferred by the owner (`209.9298-feat-adv-fortune-blessing.js:17-19`). The picker's greying
seam is the eligibility module, recomputed on every recalc (`209.91-feat-adv-eligibility-gates.js:1-25`).

**Proposed build (7b.2), to the owner's rulings (R23, C4).**

- One logic module (UI-agnostic, memory `feature-structure-and-comments`) holding the eight sets and the five rules as
  data: `{set, entry, partnerSet, excludes, exempt}`, Core p.148 cited once.
- The picker (Advantages and Disadvantages, the Management quick-add and the wizard): an entry that a held entry rules
  out is greyed with the reason ("Core p.148: Paragon rules out Failure of Bushido"). A second row of a one-per-set
  entry is greyed the same way.
- A held pair (an older save, or one entered before the rule) is flagged on both rows and never changed or removed.
- A per-character GM override, Management only, that lifts the rule for the pair it names; the rows then show a quiet
  "GM override" note instead of the flag.
- The Fortunes: a Blessing and a Curse may be held together. Whether the same Fortune may bless and curse one
  character is Q1.
- The Phase 5 validator gains one rule reporting a held pair (warning, never blocking), reading the same module.

**Questions:** Q1 (the same Fortune's Blessing and Curse), Q2 (sets beyond the four Core names).

## R11 — FT-46, three reference entries (Release 7b.2)

R11 (23 October) supersedes memory `station-shapeshifter-entries-parked` for these entries: reference entries with
cost, page and a note that the Station and shapeshifter rules are not applied.

| Entry | Book, page | Type | Cost | In our own words |
|---|---|---|---|---|
| The World of the Daimyo | Emerald Empire p.279 | Advantage, Social | 5 | Grants 5 Duty Points to spend on any Station's Features. May be bought again; each further level costs 3 more XP than the last. |
| The Daimyo's Path | Emerald Empire p.279 | Advantage, Social | 10 | Grants 8 Duty Points for any Station's Features and opens Level Three Features of the character's primary Station only. Requires The World of the Daimyo. |
| Child of Chikushudo | Enemies of the Empire p.244 | Advantage, Spiritual | 7 | Descended from a spirit of another realm: one Minor Shapeshifter Ability (GM approval) with a special penalty, rolled or agreed with the GM (for example a Social roll penalty, a stutter, or Wounds on each use). |

Duty Points and Stations are Emerald Empire's (chapter from p.278); the shapeshifter abilities are Enemies of the
Empire's (from p.244). The sheet holds neither.

**What the sheet does now.** The three are left out of the supplement library on the owner's 22 October parking
(`021-lib-supplement-entries.js:1-4`). The sheet already has a Search-only reference list for the Naga and Nezumi
entries (`021-lib-supplement-entries.js:60`, registered by `209.99999999994-feat-supplement-entries.js`).

**Proposed build (7b.2).** Add the three to that Search-only reference list, each with its type, cost, book and page,
the own-words line above, and one note: "The sheet does not apply Emerald Empire's Station rules" (or "the
shapeshifter rules" for Child of Chikushudo). The Daimyo's Path's note also names its prerequisite. Whether they should
also be buyable rows is Q3.

## R17 — FT-07, Scorpion Instigator and Blackmail (Release 7b.2)

**The book (Core pp.249–250, Scorpion Instigator).** Among the requirements: the Blackmail Advantage held on at least
four different people; and every Instigator holds at least one Dark Secret and tells it to the sensei on joining.
**Blackmail (Core p.146)** is bought for one person: its cost is that person's Status Rank (Scorpion pay 1 less). So
four people means four Blackmail Advantages, each bought and priced separately.

**What the sheet does now.** The entry requires one Blackmail Advantage and one Dark Secret, plus two confirmations
(four people; the secret disclosed) (`209.999999-feat-advanced-schools.js:290-330`); `special.blackmailDistinctPeople:
4` is stored but nothing reads it. The requirement check is by name only (`070-schools-paths-techniques.js:220-224`,
`:262`). Each Blackmail row already records its target's name and agreed Status (`209.925-feat-adv-named.js:10-20`).

**Proposed build (7b.2).** The gate reads `blackmailDistinctPeople`: it counts configured Blackmail rows with
different target names (trimmed, case-insensitive) and reports "Blackmail on 4 different people (2 recorded)". The
four-people confirmation goes; the Dark Secret disclosure confirmation stays (the sheet cannot know it). Unconfigured
Blackmail rows do not count. Q4 confirms.

## R20 — FT-10, Kobune Captain and Clan membership (Release 7b.2)

**The book (Emerald Empire p.143, Kobune Captain [Bushi]).** Requirements: Water 3; Commerce 4, Knives 3, Sailing 4;
the Leadership Advantage; and an appointment to a command position within the Mantis Clan. The entry prints no Clan
or family requirement of its own; it sits among the Mantis schools, and the appointment is the only link to the Clan.

**What the sheet does now.** The requirements match the book, with the appointment as a GM confirmation
(`209.9999991-feat-advanced-schools-supplemental.js:94-121`). The entry's `clan: "Mantis"` is a label: no Advanced
School is gated by Clan (`209.999999-feat-advanced-schools.js:490-519`).

**Proposed build.** None. This agrees with the owner's view: a rare appointment is a story condition, not a rules
restriction, and a non-Mantis appointed to a Mantis command meets the entry as printed. R20 closes with the wording
checked. No question.

## R22 — starting spells and memorising (Release 7c)

**The book (Core p.164, Spells).** Shugenja normally read their prayers from scrolls and need the scroll in hand to
cast. A spell can be memorised by spending XP equal to its Mastery Level; it can then be cast without the scroll.
Each Shugenja School lists its starting spells (Sense, Commune, Summon and a number by Element, for example Core
p.107), and the starting outfit includes a scroll satchel. Core says nothing that makes starting spells memorised: a
search of the whole book finds "memorise" only on pp.80 and 164, and neither speaks of starting spells. Character
creation (p.103) adds only that nothing starts above 4.

**What the sheet does now.** The wizard adds each starting spell as its Spell Scroll in Equipment and learns it, not
memorised; whether they should be memorised is recorded as an open design question
(`209.997-feat-wizard-starting-spells.js:10-16`; 11.2.4 in `209.998-feat-wizard-starting-spells-all.js`). Each spell
row's Memorised tick spends XP equal to the Mastery and frees the spell from its scroll
(`090-table-rows-weapons.js:716-740`, `110-modals-trackers.js:1016-1055`).

**Proposed build (7c).** Keep the book's rule, which is what the sheet does: starting spells start as scrolls, not
memorised. Close the open question in the module's header, and add one line to the wizard's spell step: "These are
scrolls in your Equipment. Memorising a spell costs XP equal to its Mastery (Core p.164); tick Memorised on its row."
Q5 confirms. Only Core was read; a supplement School that grants memorised spells would be read at build.

## R26 — Lord Moon's Curse, the Ring cap, the empty quiver (Release 7c)

**Lord Moon's Curse (Core p.160; Disadvantage, Spiritual, 3, 5 or 7 points).** On any night of the full moon the
character gains an extra Void Point at sunset, lost at sunrise if unspent. When the full moon rises they roll
Willpower against TN 15, plus 5 for each level after the first: **15, 20 and 25** for levels 1, 2 and 3, matching
the owner's C5. On a failure the player loses control of the character for the night. The owner's design (R26) needs
nothing more from the book. Today: the row holds its level (`209.8-feat-adv-config.js:161-170`); nothing else is
built (`209.89-feat-adv-config-repairs.js:18`).

**The Ring cap (Core pp.76 and 103).** Traits run to an upper limit of 10 (p.76), and a Ring is the lower of its two
Traits, so no Ring passes 10 either. At creation, no starting character may begin play with any Trait or Skill above 4
(p.103). Today: the validator already reports any Trait outside its control's range, 1 to 10
(`209.5-feat-character-validator.js:236-250`); there is no creation cap. The ledger's note that the cap's rule sat in
the sourcebooks (`BUILD-LEDGER.md:591`) is answered: it is Core. **Proposed (7c):** a creation-only validator rule,
and the wizard's XP step refusing a raise past 4, for Traits, the Void Ring and Skills. Q6 and Q7.

**The empty quiver.** No book needed: the recommendation (open the arrow picker saying the quiver is empty and let
the roll go ahead; today `150-feat-ammo.js:279`) stands.

## Not read

7c's after-preview refund (owner's ruling, 29 October) needs no book.

## The questions (as asked in the doc, recommendation first)

1. **R23:** may one Fortune both bless and curse the same character? Recommended: no; the book's reason for the
   exemption is that the two are different Fortunes, so a same-Fortune pair is greyed with the reason (GM override
   available). Alternative: any Blessing with any Curse.
2. **R23:** do the rules cover pairs Core does not name? Recommended: only Core's four (Paragon, Dark Paragon,
   Fortunes, Realms); the look-alike pairs stay the GM's call.
3. **R11:** where do the three entries live? Recommended: Search reference only, like the Naga and Nezumi entries.
   Alternative: buyable rows with the cost charged and the note on the row.
4. **R17:** the Instigator gate counts four Blackmail rows with four different named targets, and the four-people
   confirmation goes? Recommended: yes.
5. **R22:** starting spells stay scrolls, not memorised, with one wizard line on memorising? Recommended: yes.
6. **R26:** does the creation cap of 4 cover the Void Ring? Recommended: yes (Core counts every ability bought at
   creation).
7. **R26:** what does the creation cap do? Recommended: the wizard refuses a raise past 4, and the validator reports
   one (warning) while the character is still in creation; nothing is changed after play starts.

## The owner's answers (29 October)

Q2–Q7: the recommendation, each. Q1: not yet answered; the owner asked for the question and the recommendation in
plain words with reasons, now added to the doc under "Q1 in plain words" (the reasons: the book's exemption is
about two different Fortunes; one Fortune cannot both favour and punish; the Curse's points would come back for a
pair that contradicts itself; the GM override and the never-changed flag keep every table's choice open).
