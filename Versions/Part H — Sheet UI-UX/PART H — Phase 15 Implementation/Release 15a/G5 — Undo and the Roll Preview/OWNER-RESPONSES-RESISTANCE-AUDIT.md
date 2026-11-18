# Resistance audit: the owner's answers so far

18 November 2026. Claude. The owner first gave these on 16 November, before the full read, and sent them again on 18 November with ChatGPT's completed audit ([RESISTANCE-RULES-READ.md](RESISTANCE-RULES-READ.md), [resistance-rules.json](resistance-rules.json), [HANDOFF-CLAUDE-RESISTANCE-AUDIT-COMPLETE.md](HANDOFF-CLAUDE-RESISTANCE-AUDIT-COMPLETE.md)). They are the owner's **first impressions, not final rulings**. Nothing in the app is changed.

The audit's report and data are left exactly as ChatGPT delivered them; this file records the owner's answers beside them and what the completed read adds to each.

## 1 · Failure of Bushido (Honor) and Fear

**The owner:** the sheet should not keep the Honour bonus when Failure of Bushido (Honor) is set, "as per the RAW". With a different Failure of Bushido, Honour is still added to the resistance roll.

**What the read adds**

- The rules as written (Core p.159, confirmed by the owner) bar the Honour Rank against Intimidation and Temptation only. They do not mention Fear.
- The read found a second case: **Brash** (Core p.157). Its provocation check is a Willpower Trait Roll at TN 25 with the Honour Rank added. The sheet's Honor-tenet gate removes that Honour bonus too, which the book does not say.
- So "as per the RAW" and "do not keep the bonus" point opposite ways for Fear and Brash.
- "A different Failure of Bushido leaves Honour alone" is already how the sheet works: its gate looks only for the Honor tenet.

**The owner's ruling (18 November 2026): rules as written.** With Failure of Bushido (Honor), the Honour Rank is barred only from rolls to resist Intimidation or Temptation. It is still added against Fear and in Brash's provocation check. Any other Failure of Bushido leaves Honour alone, as now.

**What this means for the sheet (not yet built):** today the gate removes Honour from the whole Honour resistance entry, which covers Intimidation, Temptation and Fear together, and from Brash's check. The Fear part belongs to the resistance redesign, where each effect is chosen on its own: the gate then applies to Intimidation and Temptation only. Brash's part does not depend on the redesign (its check is a separate button, `209.9999998-feat-checks-conditions.js`) and could be fixed on its own. This is audit discrepancy 1.

**Status:** decided. Nothing in the app is changed yet.

## 2 · Paragon

**The owner:** Paragon's entries are not separate resistance options. They are part of the roll: when a Willpower roll is marked as resisting Intimidation or Fear, the sheet checks for Paragon and adds the +1k1, as Balance is handled. Paragon, and abilities like it, could also have a button beside them, widening what the combined design covers.

**Notes**

- The +1k1 against Intimidation and Fear is **Paragon (Courage)**. The owner wrote "Paragon of Compassion"; Compassion is a different entry.
- **Paragon (Honor)** works differently: twice the Honour Rank **instead of** the normal Honour bonus against Intimidation or Temptation. It replaces Honour; it is not added on top. The audit also found Tetsuken, which replaces the Honour bonus with twice Glory; how the two replacements interact is the audit's question 10.
- The audit marks both Paragon rows "add": once the effect is chosen, nothing more needs judging. That fits the owner's answer.

**The owner's question: is "overcoming" a Fear effect different from "resisting" one?** The books treat them as the same roll.

- Core p.90 has one roll against Fear, made when the effect is met. A failure lasts until the encounter ends or the source leaves. There is no standard later roll to break Fear.
- The Fear rule itself uses "overcome" for that same roll: high Honour helps a character overcome the test, so every character adds the Honour Rank.
- The audit reads Paragon (Courage) the same way: any resistance to Intimidation, or overcoming a Fear effect.
- The one exception found is optional: the spell **Never Alone** (Book of Fire p.57) lets the GM allow a fresh attempt after Fear has taken hold.

**On buttons beside abilities:** the agreed rule is a button only where the book names one roll. Paragon names no roll of its own, but both of its effects have one: Fear is a Willpower Trait Roll, and Intimidation is usually Etiquette (Courtesy) / Willpower. If the rule becomes "a button for each effect whose roll the book names", Paragon, Balance, the Yoritomo Technique and others would all qualify. That widens the buttons a good deal, so it belongs to the design discussion when it resumes.

**Status:** direction recorded; Paragon (Courage) named correctly; the Fear question answered from the books; the button idea carried to the design.

## 3 · Yoritomo Courtier, Rank 5

**The owner:** the sheet should give the +5k0 as the rules state, but later. School Techniques, Kata, Kiho and the like should apply their modifiers the way Advantages do. That needs its own rules read and design discussion, and is its own phase after this one.

**What the read adds:** 48 of the audit's 245 rows are School Techniques, Alternate Path or Advanced School Techniques, or Kiho. None is applied by the sheet as a roll modifier today. They give the later phase a ready list to start from.

**Status:** deferred to a later phase of its own; not part of the resistance redesign.

## 4 · Penalties

**The owner:** the sheet should handle penalties to resistance rolls the same way as bonuses.

**What the read adds:** 11 rows are dice penalties to resistance rolls. Two are already applied: Seven Fortunes' Curse (Jurojin) and Cursed by the Realm (Maigo no Musha). Among the Core Rulebook's, Bad Fortune (Moto Curse) and Cursed by the Realm (Jigoku) are not. Bad Health is a different kind of penalty: it lowers the Earth Ring for resisting disease.

**Status:** direction recorded.

## The audit's other thirteen questions

ChatGPT's report holds seventeen questions; the four above are the first four. Question 5 (which optional and exceptional rules belong in the menu) was put to the owner on 18 November with Claude's recommendation; the answer is not yet in. The other thirteen (scope of optional rules, recovery from Dazed and Stunned, external spells, stacking, and several single rulings) and the five other corrections it found (Shosuro Blade, Dharma, Apotheosis of Fire, Wholeness in All, Epilepsy) have not yet been put to the owner. They are to be taken one at a time, not all at once.
