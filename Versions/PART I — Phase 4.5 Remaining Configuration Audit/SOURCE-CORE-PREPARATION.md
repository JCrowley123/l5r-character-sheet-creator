# Core source preparation: A01, A03, A09 and A13

Verified 19 September 2026 against the user-supplied **Legend of the Five Rings RPG Core Rulebook, Fourth Edition**. This is a source-note draft for incorporation into `AUDIT.md` before implementation. It records source facts and source limits; it makes no implementation or QA-completion claim.

- Source file: `C:/Users/jcrow/OneDrive/Documents/L5R 4th edition books/Legend of the Five Rings Rpg Core Rulebook 4th Ed..pdf`
- SHA-256: `7c9ba325ece4b62f1e9db8888f189622ecbdde8509a224242dc9e79358f7c7c7`
- 404 PDF pages. Page references below distinguish the number printed on the page from its one-based position in this supplied PDF.
- Method: text extraction from the supplied PDF with `pypdf`, including neighboring passages and the printed page numbers. No web summary, remembered rule table, or unfinished local implementation was used as a rules source. No visual page inspection was performed for this preparation note.

## General price and combination rules affecting this work

### Advantage discounts — printed p.149 / PDF p.152

The **Advantage/Disadvantage Discounts** box states:

> "Unless otherwise specified, discounts are cumulative, but can never reduce the cost of an Advantage below 1."

This is an explicit general rule, not an inferred floor copied from another Advantage. It resolves the audit's previous minimum-price source gap. It should inform the newly configured prices (including Blackmail and the Wealthy rank-1 boundary) and the Seven Fortunes/Naishou discount interaction once the Naishou source is separately confirmed. Specific fixed reduced-price wording, such as Soul of Artistry's 3-point Crane/courtier price, must still be respected rather than treated as two discounts.

Current-main Wealthy permits eligible rank 1 to cost 0; this conflicts with the general minimum above. The separate user-approved entitlement remains **2 koku per purchased rank**, with a single grant lifecycle, regardless of purchase discounts. The minimum price and the money entitlement are distinct concerns.

### Advantage/Disadvantage sets — printed p.148 / PDF p.151

The **Advantage/Disadvantage Sets** box supplies these restrictions and an explicit GM override:

- Paragon and Dark Paragon cannot both be held.
- A character cannot have both Consumed and Failure of Bushido.
- More than one member of an Advantage or Disadvantage family is prohibited; the example says Hotei's Blessing and Benten's Blessing cannot both be held.
- Dark Paragon/Consumed, Paragon/Failure of Bushido, and Touch of the Spirit Realms/Cursed by the Realm are opposing matched pairs that cannot be combined.
- Seven Fortunes' Blessings/Curses are explicitly exempt from the opposing-pair restriction: one Fortune can bless while another curses.
- The GM can override these restrictions.

These are source facts to preserve in the audit. They do not authorize silent deletion of imported rows or expansion into a new linting phase. Naishou's later-purchase exception must be recorded from its own source before using it to replace the normal Blessing selection rule.

## A01 — Seven Fortunes' Blessing

**Source:** printed pp.153–154 / PDF pp.156–157. Printed subtype is Spiritual. Normal base cost is 4; Bishamon explicitly costs 5. A listed eligible Clan buys its branch for 1 point less. Hotei lists no Clan discount.

| Fortune | Normal XP | Eligible Clan(s), XP before other verified discounts | Source-confirmed effect | Printed / PDF page |
|---|---:|---|---|---|
| Benten | 4 | Crane: 3 | +0k1 on a Social Skill Roll used to persuade; coercion is expressly excluded. | 153 / 156 |
| Bishamon | 5 | Crab or Lion: 4 | Declaring and successfully making three Raises on an attack for Increased Damage earns one additional Raise. Free Raises do not count toward triggering this. Separately, +1k0 on Strength **Trait Rolls**. | 153 / 156 |
| Daikoku | 4 | Mantis: 3 | +1k1 on all Commerce Skill Rolls. | 154 / 157 |
| Ebisu | 4 | Unicorn: 3 | +1k1 on Social Skill Rolls with citizens of Rokugan outside the samurai caste. | 154 / 157 |
| Fukurokujin | 4 | Dragon or Phoenix: 3 | Select one Lore Skill when purchasing; +1k1 on Skill Rolls using that chosen Lore Skill. | 154 / 157 |
| Hotei | 4 | None listed | An instigator whose effect would make the character lose Void Points must first defeat the character in a Contested Void Roll. If the effect already requires a Contested Roll, increase the character's roll by +10 instead. | 154 / 157 |
| Jurojin | 4 | Scorpion: 3 | +2k0 on rolls to resist disease or poison. | 154 / 157 |

### Configuration and effect boundaries

- Record the chosen Fortune and require the secondary Lore Skill only for Fukurokujin. Its selected Skill is a Lore Skill, not necessarily a School Skill. Changing to another Fortune must clear that secondary field.
- There is no per-session use pool in these Blessing passages.
- Benten requires the player's persuasion declaration; not every Social roll qualifies.
- Ebisu requires the player's declaration about the participants' status; the app does not know an NPC's caste.
- Bishamon's automatic Strength branch is limited to Trait Rolls. Do not apply it to every Skill using Strength or to weapon damage. Its attack branch is an additional **Raise**, conditional on successful declared Increased Damage Raises; it is not automatically +5 to an attack result or +1k0 to all damage. The source does not say that the bonus repeats for every block of three Raises.
- Hotei concerns Void **loss caused by an effect with an instigator**. The passage does not justify intercepting every ordinary voluntary Void expenditure, or granting +10 on every Void roll. The app must receive an explicit qualifying context or display the protection as a reminder. Do not confuse this Advantage with Hotei's Curse, whose activation-cost work is separately deferred.
- Jurojin requires an explicit poison/disease-resistance context. A generic Stamina/Earth roll does not identify that context on its own.
- The Clan table is complete for these seven printed branches. Naishou's separate discount and replacement accounting need their own source note; this table does not establish them.

## A03 — Dark Paragon

**Source:** printed p.147 / PDF p.150. Mental; normal cost 5, Spider cost 4.

Once per session, the character can sacrifice **5 points of Honor** as a Free Action to invoke the chosen precept. Only if the character does not have those 5 Honor points may they spend one Void Point instead. These are Honor points, not five full Honor ranks. The passage is not an unrestricted Honor-or-Void choice.

The opening rule provides +5 to the affected roll's total; two branches explicitly remove this bonus. The branch table is materially different from the catalogue's generic "+5 tied to a precept" summary:

| Precept | Source-confirmed operation | Relationship to the introductory +5 |
|---|---|---|
| Control | Reroll any Social Skill Roll. | No branch exclusion of +5 is printed. |
| Determination | Negate every TN/Wound penalty on one Skill Roll or Spell Casting Roll. | Explicitly no +5 bonus. |
| Insight | Reroll a roll that used Awareness. | No branch exclusion of +5 is printed. |
| Knowledge | Reroll a roll that used Intelligence. | No branch exclusion of +5 is printed. |
| Perfection | Make one chosen die on a Skill Roll explode. | Explicitly no +5 bonus. |
| Strength | Reroll any damage roll. | No branch exclusion of +5 is printed. |
| Will | Negate 10 Wounds at the moment they are suffered. | This branch has no roll to receive the introductory bonus. |

### Source limits and implementation implications

- A saved precept plus one remaining use per session is appropriate. Reset is player controlled. Resource spending should occur once when the action is committed, not when previewing or cancelling.
- The four reroll branches do **not** say "keep the higher". Do not copy Luck's replacement policy into Dark Paragon without an explicitly recorded interpretation or further rule support. The phrase "reroll" is confirmed; this preparation note does not invent an extra choice between original and replacement results.
- Applying the introductory +5 to the four reroll branches is a direct reading of the introductory rule plus their absence of an exception. Preserve that reasoning visibly in the implementation/source record rather than describing every branch as a generic pre-roll +5.
- Perfection specifies a selected die exploding. It does not say to add +5, and it does not describe selecting multiple dice, rerolling all dice, or replaying the entire original action.
- Determination negates **TN/Wound penalties**; it does not say to remove every negative rolled/kept-dice modifier. Its scope is one Skill or Spell Casting roll.
- Will is a wound-negation response and requires user knowledge of incoming wounds. A companion implementation can expose a player-controlled use/reminder without pretending to detect GM damage. It must not arbitrarily heal the character later or modify a damage roll the character makes.
- Damage rerolls require the existing damage-roll path, which bypasses the normal pre-roll registry. The source does not justify broadening unrelated modifier applicability to damage.
- Existing save/schema conventions, payment timing, Honor-point units and nested resource interactions still need code-level review. These are implementation checks, not additional RAW rules established by this page.

## A09 — Paragon

**Source:** printed p.152 / PDF p.155. Mental; normal cost 7, Lion cost 6.

Whenever the character gains Honor for exhibiting the chosen virtue, the Advantage grants an additional +1 Honor. The book separately describes each chosen tenet:

| Tenet | Source-confirmed benefit |
|---|---|
| Compassion | When a Void Point improves a roll made to directly help someone lower in the Celestial Order, use +2k2 instead of +1k1. |
| Courage | +1k1 on rolls resisting Intimidation or overcoming Fear. |
| Courtesy | +2k0 on Etiquette rolls to avoid embarrassment or a breach of honor. |
| Duty | A Void Point can negate every TN penalty, including Wound penalties, on one Skill or Spell Casting roll. |
| Honesty | +1k1 on Sincerity (Honesty) rolls; it can apply without owning that Emphasis when the Emphasis would fit the situation. |
| Honor | Use twice Honor Rank instead of the normal Honor contribution on resistance rolls against Temptation or Intimidation. |
| Sincerity | +2k0 on Contested Rolls using Sincerity. |

**Approved application boundary:** The user's approved first implementation is a tenet picker, saved selection, badge and concise accurate reminder. Honor awards stay player controlled. No automatic branch modifier, Void charge, Honor award, extra resource pool or secondary choice is authorized merely because this table now supplies the RAW. Later automation remains a separate per-tenet assessment.

## A13 — Touch of the Spirit Realms

**Source:** printed pp.154–155 / PDF pp.157–158. Spiritual. The header gives 5 points and the introductory paragraph gives a 4-point Shugenja price. Toshigoku explicitly substitutes a base cost of 8 for 5; Yomi substitutes 7 for 5.

| Realm | Printed base XP | Source-confirmed benefit or condition | Printed / PDF page |
|---|---:|---|---|
| Chikushudo | 5 | +1k1 on all Animal Handling rolls. | 154 / 157 |
| Gaki-do | 5 | Immediately regain 5 Wounds when resolving an attack that kills an opponent. | 154 / 157 |
| Jigoku | 5 | Requires Shadowlands Taint. Add Taint Rank to attack rolls and to Skill/Trait rolls using a Physical Trait; if Lost, use twice Taint Rank instead. | 154 / 157 |
| Maigo no Musha | 5 | When a Glory award is greater than 3 points, receive one more point. | 154 / 157 |
| Meido | 5 | +2k0 on Contested Rolls against social manipulation, such as Courtier. | 154 / 157 |
| Sakkaku | 5 | +1k1 on Sincerity (Deceit) rolls. | 154 / 157 |
| Tengoku | 5 | +2k0 on Earth Ring Rolls to resist Shadowlands Taint. | 154 / 157 |
| Toshigoku | 8 | A Move Action taken to get into attack range moves 5 extra feet. | 154 / 157 |
| Yomi | 7 | Choose one School Skill; +1k0 on Skill Rolls using that Skill. | 155 / 158 |
| Yume-do | 5 | Four hours of rest recover all expended Void Points, instead of the usual eight-hour full night's rest. | 155 / 158 |

### Pricing qualification and approved application boundary

- Ordinary branches: 5 points; Shugenja 4.
- The supplied page does not print the combined Shugenja prices for Toshigoku or Yomi. Interpreting the introductory 5-to-4 price as a one-point discount would yield 7 and 6 respectively. That is a reasonable interpretation, but the exact combined numbers are not directly printed. Record the chosen interpretation before certifying its XP fixtures; do not silently flatten both special branches to the ordinary 4-point price or treat an inferred value as a quotation.
- Yomi's required School Skill is real configuration even when its roll benefit is reminder-only. The school-qualified picker should store that Skill and clear it when the realm changes.
- Jigoku's Taint prerequisite should be visible in the selection help and validation policy. Do not invent a prerequisite Taint rank or silently add Taint to qualify a character.
- The user's approved first implementation is a realm picker, accessible information controls, saved realm (and Yomi's applicable Skill), selected badge and benefit reminder. The user has not approved automatic wound healing, Glory changes, Taint bonuses, movement adjustment, Void recovery, or the other realm roll packages in this batch.

## Verification targets derived from this source pass

These are test-design inputs, not tests run here:

- Seven Fortunes: all seven branch prices/Clan matches; Bishamon 5-point exception; exact Lore choice; persuasion versus coercion; samurai versus non-samurai declaration; Strength Trait versus Strength-based Skill/damage; Increased Damage Raises versus Free Raises; qualifying Void-loss contest versus ordinary spending; poison/disease declaration; cleared secondary fields and unknown branches.
- Dark Paragon: correct seven operations, Honor-first/Void-fallback eligibility, one session use, cancellation without payment, reroll/result policy explicitly documented, no duplicate replay of action payments, Determination's TN/Wound-only scope, Perfection's single die and no +5, Will's timing, and damage through its actual roll path.
- Paragon: all seven accurate reminders, Lion pricing, selection round-trip, no automatic Honor/resource/roll mutation in the approved initial scope.
- Touch: all ten realms, 8/7 special prices, explicit Shugenja-special-price interpretation, required Yomi School Skill, Jigoku prerequisite policy, selection/change round-trip, and no unapproved automatic effects.
- Shared: the now-confirmed minimum-one/cumulative-discount rule, Phase 4.5-only ownership, unchanged other-phase results and surgical removal.
