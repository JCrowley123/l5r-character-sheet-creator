# Phase 4.7 Core Advanced Schools: source audit

Verified 3-4 October 2026 against the owner's local *Legend of the Five Rings RPG Core Rulebook, Fourth Edition*. Printed pages 245-250 are PDF pages 248-253. Progression was cross-checked against printed pages 104-105 (PDF 107-108), and the general Bushi/Shugenja exclusion against p.151 (PDF 154). Extraction went to tool output only; no extracted book pages are committed.

`data/core-schools.json` records the nine school names, prerequisites, 27 exact Technique titles, and mechanics paraphrased in our own words. Each school and Technique has a printed-page citation. The source book, not the JSON or any wiki, remains the rules authority. School names, Technique names, numeric prerequisites, and rules terms are retained for identification.

## Scope and source boundaries

This is the Core Rulebook release of Phase 4.7. It covers the Advanced School catalogue, requirements, deliberate enrolment, separate progression, save/load, and reference-only display of learned Techniques, following the existing Phase 6 precedent. All Technique effects remain reference text in this release, including casting-rank and spell-slot bonuses. Automatic effects belong to the later Synergy Engine work and require their own implementation and tests. The formulas below document the book for that later work; they do not describe automation delivered here.

The owner ruled on 2 October 2026 that the Multiple Schools Advantage is required for Advanced School entry. This is an owner-approved house rule. Core p.245 does not require that Advantage. Retain the distinction in user-facing rules notes rather than attributing the gate to the book.

Core has **nine**, not eight, Advanced Schools. Elemental Guard's heading wraps across lines on p.249, which caused the earlier source-index extraction to omit it. The count includes one Elemental Guard entry with a chosen-element configuration, not four separately selectable Advanced Schools.

## Entry and progression

Core pp.104-105 link each earned Insight Rank to one advancement in the character's current School. A new School replaces the destination of the next advancement; it does not award an additional School Rank for the same Insight Rank.

Core p.245 applies that model to Advanced Schools. Its example reaches the ability to cast Mastery Level 4 spells at basic Isawa Rank 3 through an elemental affinity, but waits until Insight Rank 4 to enter Elemental Guard. The resulting character has Isawa Rank 3 and Elemental Guard Rank 1. Advanced Rank 1 therefore occupies the next earned advancement. Merely satisfying the prerequisites does not award a free rank.

A sheet may record a prospective enrolment at Advanced Rank 0 and award Rank 1 at the next Insight Rank, provided this is clear to the player and allocated basic ranks remain unchanged. If supporting retrospective allocation of an already earned but unassigned rank, the same one-advancement-per-Insight-Rank rule must hold. Never keep a basic rank already allocated at an Insight Rank and also grant Advanced Rank 1 for that same rank.

Additional restrictions from p.245:

- An Advanced School has three ranks, each with its own Technique.
- The previous basic School stops advancing on entry. Its already earned ranks and Techniques remain available.
- A character may take ranks in only one Advanced School over their career. Choosing a different element does not grant a second Elemental Guard track.
- Completion of Advanced Rank 3 does not automatically restart basic progression. The GM may permit a petition to return to the original School. The example also allows seeking another basic School after completing the Advanced School, analogous to completing a five-rank basic School.
- There is no universal minimum Insight Rank 4. The book explains that most characters cannot meet the prerequisites earlier; its example is not a general minimum-rank requirement.
- Entry checks concern prerequisites at the time of entry. The text does not revoke learned Techniques when a later sheet edit lowers an entry prerequisite.
- These Advanced School entries list no starting Skill package, Trait increase, starting Honor, or outfit. Do not reapply the grants used when creating a character's basic School.

The clan and profession labels identify the entries. Their listed prerequisites do not specify a universal originating basic School or an explicit clan gate. Do not invent a mandatory named basic School from the narrative description. Lion's Pride does explicitly require the Matsu family. The general rule on p.151 still prohibits any character from holding both Bushi and Shugenja School ranks; check the existing basic training when entering an Advanced School, and include Advanced training when checking later basic Schools.

## Requirements requiring careful interpretation

| School | Check beyond simple numeric thresholds | Source |
|---|---|---|
| Kenshinzen | Confirm a fair victory over a current member in a legal iaijutsu duel. A duel to the death is not required. | p.247 |
| The Lion's Pride | Count four distinct Weapon Skills, each at Rank 3 or higher. Duplicate rows or specializations of one Skill must not multiply the count. Require Honor 6, Matsu family, and a female character. | p.248 |
| Storm Riders | Elemental Blessing must specifically select Water; a blessing for another element is insufficient. | p.248 |
| Elemental Guard | Select Air, Earth, Fire, or Water; the selected Ring must be at least 6, and the character must be able to cast spells of that element at Mastery Level 4. Void is excluded. Use casting eligibility, including affinity and deficiency, rather than merely checking whether a Level 4 spell name appears on the sheet. | pp.245,249 |
| Scorpion Instigator | Blackmail must concern at least four different people. A Blackmail row alone does not establish that count. Require at least one Dark Secret and confirmation that a secret was disclosed to the sensei on joining. | p.249 |
| Obsidian Warrior | Confirm surviving a skirmish with an Obsidian Warrior sensei. Taint is not an entry requirement. | p.250 |
| The White Guard | Confirm devotion to the Lords of Death or a campaign set before 1160. The exemption is strictly before 1160, not before or during that year. | p.250 |

Narrative confirmations in the JSON are deliberate player/GM attestations, not inferred proof. They preserve facts the sheet cannot otherwise establish. The four-person Blackmail confirmation supplements the existence of the Advantage; it must not make missing Blackmail acceptable. The Dark Secret disclosure confirmation likewise supplements the actual Disadvantage.

The p.249 sidebar offers a possible male counterpart called the Sons of the Pride. That optional group does not erase the printed Lion's Pride requirement. It is outside this nine-school catalogue unless the owner elects to add the variant.

The Instigator Rank 1 formula calls for the difference between the two Honor Ranks but does not specify subtraction direction. Its narrative assumes exploiting the opponent's Honor. This release records the rule in words; any later automatic calculation needs a documented interpretation, not an accidental negative dice pool.

White Guard Rank 3, Fury of Heaven, adds its Theology-based bonus to the attack roll total. The p.250 trigger is making an attack, and its stated destination is that roll's total; the entry does not identify damage as the beneficiary. The JSON makes the attack-roll destination explicit to prevent an earlier audit's damage interpretation from being propagated.

## Shugenja rank and slot adjustments

The Storm Riders and Elemental Guard entries on p.249 give distinct bonuses at their three ranks. They do **not** say that every Advanced rank increases shugenja rank for every element.

Let `A` be the earned Advanced School rank, from 0 to 3. Let `B` be the character's otherwise valid shugenja rank, including applicable basic-School/Alternate-Path rules but excluding this Advanced School. Let `E` be Water for Storm Riders or the chosen element for Elemental Guard.

```text
generalRankBonus(A) = 1 if A >= 2, otherwise 0
elementCastingBonus(A) = (1 if A >= 1 else 0) + (1 if A >= 3 else 0)

generalShugenjaRank = B + generalRankBonus(A)
castingRank(E) = generalShugenjaRank + elementCastingBonus(A)
castingRank(other elements) = generalShugenjaRank

dailySlots(E) = otherwise valid slots(E) + (2 if A >= 2 else 0)
dailySlots(other elements, including Void) = otherwise valid slots
```

| Advanced rank | General shugenja rank bonus | Further casting bonus for E | Total casting bonus for E | Extra daily slots for E |
|---|---:|---:|---:|---:|
| 0 | 0 | 0 | 0 | 0 |
| 1 | 0 | 1 | 1 | 0 |
| 2 | 1 | 1 | 2 | 2 |
| 3 | 1 | 2 | 3 | 2 |

Retain existing affinity, deficiency, and other casting modifiers around these bonuses. Do not use a chosen-element casting-only bonus to increase all School-Rank-based durations or unrelated abilities. Elemental Guard's Rank 1 protection lasts for the general Shugenja School Rank in minutes; its element-only casting bonuses do not separately lengthen that protection. Storm Riders' lightning slot-spending cap uses its own Advanced School Rank, not its general shugenja rank.

The daily-slot increase changes the selected element's capacity; it does not refill slots each time the sheet redraws or loads. It does not raise the actual Ring, derived Traits, Insight, or available Void Points.

Core p.105 describes three newly learned spells on ordinary shugenja School-Rank advancement in lieu of learning a new Technique. The Advanced School entries instead provide Techniques and specify their casting adjustments. This source audit does not infer an automatic three-spell grant at every Advanced rank, nor a fresh starting-school spell package. Any separate spell-learning policy should be stated and sourced before automatic grants are added.

## Catalogue inventory

| School | Requirement page | Technique titles in rank order |
|---|---:|---|
| Defender of the Wall | 247 | The Flames of Purity; Hida's Strength; The Crab Are the Wall |
| Kenshinzen | 247 | Drawing the Void; Kakita's Strength; A Single Moment |
| Swordmasters | 247 | The Silence of Two Strikes; Mirumoto's Strength; Harmony and Precision |
| The Lion's Pride | 248 | The Fury of Matsu; Paragon of Honor; Matsu's Technique |
| Storm Riders | 248 | Strength of Suitengu; The Raging Ocean; Child of Osano-Wo |
| Elemental Guard | 249 | Name of the Elements; Touch of the Elements; Shape of the Elements |
| Scorpion Instigator | 249 | The Depths of Dishonor; Sheath Your Lies in Truth; Pull the String |
| Obsidian Warrior | 250 | Darkness Is My Light; The Power of Impurity; My Strength Has No Limits |
| The White Guard | 250 | Pale Face of Death; Moto's Strength; Fury of Heaven |

All Storm Rider Techniques are on p.249. All Instigator Techniques are on p.250. The other Techniques are on their school's requirement page.
