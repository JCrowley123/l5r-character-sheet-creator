# G3 device checks — mirror

**The owner's checklist** is the Claude Doc [G3 device checks — spell rows](https://claude.ai/artifact/T9HYrvm4TJDXwKu3UrN21f), created through the connected document service on 11 November 2026. It has a Pass/Fail choice for iPhone Safari and Laptop Edge on each check, and an Accept / Revise / Remove choice for each finding. This file mirrors it as plain text.

**Results: none yet.** The owner has not run the checks. This file is updated from the doc when they have.

| Finding | Preview | Compared with | Checks | iPhone Safari | Laptop Edge | Decision |
|---|---|---|---|---|---|---|
| 8b.1-UI-01 Starting-spell review | claude-release-15a-ui01 | live app (G2) | 1–6 | pending | pending | pending |
| 8b.1-UI-02 Spell name and School tag | claude-release-15a-ui02 | UI-01 preview | 7–12 | pending | pending | pending |
| 8b.1-UI-03 Remove apart from Memorised | claude-release-15a-ui03 | UI-02 preview | 13–17 | pending | pending | pending |

**The test character.** The review appears only for an older character. Import `Versions/BUGFIX — Older School Choices/qa/older-kitsu.l5r.json` on each preview and each device (each preview keeps its own characters). To repeat a check after Confirm, import it again.

## The checks

**8b.1-UI-01** — import, Manage, Identity, Review starting spells.

1. Four groups as cards; Later and Confirm side by side under a line, with a gap below the last card; two columns on the laptop.
2. A tap anywhere on a card, its far right end included, ticks it, fills it and turns it bold; the group's count goes up; a second tap puts it back.
3. All three Water spells ticked: the Water count turns solid with a tick.
4. Later closes the window; on reopening nothing is ticked and every count is at 0.
5. The eight starting spells ticked (not Jurojin's Balm), Confirm: the usual chooser follows, laid out as before, offering only an Earth spell, with Done at the bottom.
6. iPhone sideways (laptop: a short window): only the cards scroll; the title and Later / Confirm stay in view; the last card can be reached.

**8b.1-UI-02** — confirm the eight spells, Done, Techniques tab. (Remove still sits over the name's end here; that is UI-03.)

7. Every spell's name can be read; on the iPhone it has its own line with Cast, the ? and Memorised below; on the laptop the row is one line.
8. The eight starting spells show "School spell" at the end of the Cast line; Jurojin's Balm shows no tag.
9. Rename Jurojin's Balm, Save, reload, open the character: the name is kept, still no tag, the others keep theirs.
10. A tap on the word Memorised ticks only that spell.
11. Play: names as plain text, the tag still shown, Memorised locked.
12. Nothing else moved: the School Technique card and the two pickers as on the UI-01 preview; the spell scrolls in Equipment still read "School: Kitsu Shugenja".

**8b.1-UI-03** — confirm the eight spells, Done, Techniques tab, Manage.

13. On every spell card the × is in the top-right corner with nothing under it.
14. A tap on the right-hand end of Memorised ticks the box and removes nothing.
15. A tap near the edge of the × on Jurojin's Balm removes only that spell.
16. The × is in the same corner as on the School Technique card.
17. Play: no ×; the name uses the full width; cards no taller than on the UI-02 preview.

Not shown by this character, and covered by the harnesses: the red "deselect 1" count, and the School-name tag for a character with several Schools.

The steps that rely on the app outside G3 (import, the review button, Confirm, the Earth chooser, Save, reload, the Equipment labels) were dry-run on the final build at 390 px before the doc was handed over.
