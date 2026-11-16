# Resistance rules read — IN PROGRESS

**Read so far: 28 of 823 passages** (16 November 2026, Claude). Stopped at the owner's line of 95% weekly usage. To be finished by ChatGPT (Codex): see [HANDOFF-CHATGPT-RESISTANCE-RULES-READ.md](HANDOFF-CHATGPT-RESISTANCE-RULES-READ.md).

- **What was read:** in the Core Rulebook only, the passages that contain the word "resist", numbers #487 to #574 (28 passages: 487, 488, 490, 491, 492, 500, 501, 502, 510, 516, 517, 524, 534, 538, 542, 546, 547, 548, 549, 553, 554, 555, 558, 560, 564, 566, 573, 574). The next one is #575.
- **Not read:** every other passage (#1–#485, the Core passages without the word "resist" in #486–#574, and #575–#823).
- **How:** `qa/resistance-rules-read/resistance_passages.py` builds a stable numbered list of 823 passages from the owner's PDFs and prints them to the screen only. Nothing from the books is saved; everything below is in our own words with the printed page.
- **Caution:** each passage was read as a few lines of extracted text, some cut short. Rows marked "confirm" need the page itself.
- **Confirmed on the page by the owner (16 November 2026):** Failure of Bushido (Honor), Paragon's Courage and Honor entries, and the Yoritomo Courtier's Rank 5 Technique. Those rows are settled.

## What the books say so far

### The general rule for each effect

| Effect | Roll the book names | Bonus everyone has | Book, page | Passage |
|---|---|---|---|---|
| Fear | **Willpower Trait Roll** (raw Willpower) against TN 5 + 5 × the Fear Rank. Failing gives a penalty of −Xk0 (X = Fear Rank) on all rolls until the encounter ends or the source goes; failing by 15 or more means fleeing or cowering | Honour Rank added to the total | Core p.90 | #500 |
| Intimidation | Usually a Contested Roll, resisted with **Etiquette (Courtesy) / Willpower**. The GM may call for another Skill or Trait | Honour Rank added to the total | Core p.145 | #534 |
| Temptation | Not yet read (the Skill's own entry is in an unread passage) | Honour Rank added to the total | Core p.91 | #502 |
| Shadowlands Taint | **Earth Ring Roll** (given as the example of a Ring Roll) | none found yet | Core p.80 | #492 |
| Spells | The Ring Roll the spell names | none | Core p.80 | #492 |
| Poison, disease | General rule not yet read. Bad Health lowers the Earth Ring for resisting disease, which points to Earth | none found yet | Core p.156 | #555 |

Honour's rule (Core p.91, #502): add the Honour Rank to any roll made to resist the Intimidation and Temptation Skills and to every roll to resist a Fear effect. Etiquette is described as the main "social defence" Skill (Core p.134, #524); Willpower as the Trait for resisting manipulation or intimidation (Core p.77, #491).

### Abilities that change a resistance roll

| Ability (type) | Effect | Bonus and conditions, in our words | Roll named | Book, page | Passage | In the sheet today |
|---|---|---|---|---|---|---|
| Balance (Advantage) | Intimidation, Temptation | +1k0, when the Honour Rank is being added to the roll | none of its own | Core p.146 | #538 | Yes, matches |
| Irreproachable (Advantage) | Temptation | +1k0 on a Contested Roll where the other side uses Temptation | none of its own | Core p.151 | #546 | Yes, matches |
| Seven Fortunes' Blessing, Jurojin (Advantage) | Poison, disease | A bonus when resisting the effects of a disease or poison (figure cut off in the passage; the sheet uses +2k0) | none named | Core p.154 | #553 | Yes; confirm the figure |
| Touch of the Spirit Realms, Tengoku (Advantage) | Taint | A bonus on rolls to resist the Taint (the sheet uses +2k0 on Earth Ring Rolls) | Earth Ring | Core p.154 | #553 | Yes; confirm the wording |
| Paragon, Courage (Advantage) | Intimidation, Fear | +1k1 on any roll to resist Intimidation or to overcome a Fear effect. Confirmed by the owner | none of its own | Core p.152 | #547 | **Reminder only:** the sheet's Paragon entry has this wording, but it is not offered in the roll preview |
| Paragon, Honor (Advantage) | Temptation, Intimidation | May add twice the Honour Rank, instead of the normal bonus, to rolls to resist Temptation or Intimidation. Confirmed by the owner | none of its own | Core p.152 | #548 | **Reminder only:** the sheet's Paragon entry has this wording, but it is not offered in the roll preview |
| Magic Resistance (Advantage, three ranks) | Elemental spells aimed at you | Each rank raises the caster's Spell Casting TN by 3; not maho, gaijin or non-human magic | not a roll by the character | Core p.151 | #546 | To check; not a roll-preview matter |
| Failure of Bushido, Honor (Disadvantage, 3 points) | Intimidation, Temptation | Cannot add the Honour Rank to any roll to resist Intimidation or Temptation. **Fear is not mentioned.** Confirmed by the owner | — | Core p.159 | #560 | **Differs:** the sheet removes Honour's whole choice, Fear included. See question 1 |
| Bad Health (Disadvantage) | Disease | Earth Ring counts one rank lower for resisting diseases (and for Wound Ranks) | Earth | Core p.156 | #555 | To check |
| A Disadvantage on p.156 (name not in the passage; confirm) | Taint | −1k0 on any roll to resist acquiring the Taint; limited to members of a named group | none named | Core p.156 | #554 | To check |
| A Disadvantage with one entry per Spirit Realm (name to confirm), Jigoku | Taint | −1k1 on any roll to resist the Taint | none named | Core p.158 | #558 | To check |
| Seven Fortunes' Curse, Jurojin (Disadvantage) | Poison, disease | −2k0 to resist all poisons and diseases | none named | Core p.162 | #566 | To check |
| Rumormonger (Disadvantage) | The urge to spread a rumour | Must pass a **Willpower Trait Roll**, TN 5 × the Glory Rank of the highest-Glory person in the rumour | Willpower Trait Roll | Core p.161 | #564 | To check |
| Yoritomo Courtier School, Rank 5, Strength in All Things (School Technique) | Intimidation, Temptation, Fear | +5k0 on any roll to resist an Intimidation or Temptation Skill Roll or a Fear effect (and when using Intimidation on someone else). Confirmed by the owner | none of its own | Core p.121 | #516 | **Text only:** the sheet's Technique text matches the book (+5k0, p.121), but it is not offered in the roll preview |
| Asako Loremaster, Rank 4 (School Technique) | Being influenced (Courtier, Temptation, Intimidation) | After failing a Contested Social Skill Roll to resist influence, may roll again using Intelligence, and must keep it. Not against Fear | re-roll of the same roll | Core p.125 | #517 | To check |
| Courage of the Seven Thunders (Earth spell, Mastery 1) | Fear | Targets get +5k0 to resist any Fear effect; +3k0 if not of the seven original Great Clans; nothing with a full Rank of Taint | none of its own | Core p.173 | #574 | To check |

Noted and set aside: a weapon entry that raises the TN to resist poison on its blade (Core p.153, #549); an Air spell that forces a contested Air against Earth roll (Core p.172, #573); the Ikoma Bard School's introduction says its Techniques help resist manipulation (Core p.118, #510; the Techniques themselves are unread). Passages #487, #488, #490, #501 and #542 hold no resistance rule.

## What this already means for the design

- **The book does name rolls.** Fear is a Willpower Trait Roll; Intimidation is Etiquette (Courtesy) / Willpower unless the GM says otherwise; Taint is an Earth Ring Roll. So the list can follow the roll, and a "Resist Fear" button has a roll to open.
- **The GM may change the roll** (said outright for Intimidation), which supports keeping "Something else…".
- **Balance is tied to Honour** in the book's wording, which matches the sheet counting Honour once.

## Open questions for the owner (so far)

1. **Failure of Bushido (Honor) and Fear.** Confirmed on the page: the book bars the Honour Rank against Intimidation and Temptation only. The sheet removes Honour's whole choice when this Disadvantage is set, which also removes it against Fear. Should the sheet keep Honour's bonus against Fear? That would be a change to the sheet; nothing is changed yet.
2. **Paragon.** Confirmed on the page: Courage gives +1k1 to resist Intimidation or overcome Fear, and Honor lets the character add twice the Honour Rank against Temptation or Intimidation instead of the normal bonus. Neither is among the sheet's fifteen resistance choices: the sheet shows both as reminder text on the Advantage and does not offer them in the roll preview (found by searching the Paragon file, not by running the app). Should the new design add them?
3. **Yoritomo Courtier, Rank 5.** Confirmed on the page: +5k0. The sheet has the Technique's text, matching the book, but does not offer it in the roll preview (found by search, not by running the app). Should the new design add it?
4. Penalties (Jurojin's Curse, the two Taint Disadvantages, Bad Health): should the sheet apply or ask about penalties to resistance rolls as it does bonuses?
