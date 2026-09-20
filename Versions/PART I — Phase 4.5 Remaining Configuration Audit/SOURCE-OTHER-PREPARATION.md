# Remaining Advantages: preparation source record

Recorded 19 September 2026 against the supplied PDFs. This is a targeted source record for
the approved A01–A16 work, not an audit for missing catalogue entries. It adds no production
code and makes no implementation or QA completion claim. The existing AUDIT.md user-review
addendum controls implementation scope; source facts below must not silently broaden it.

PDF page numbers below are one-based viewer pages. Printed page numbers are those printed
on the book page. The relevant passages were extracted directly from the supplied files;
the discarded implementation draft was not used as a source.

## Sources and page mapping

| Source | Local supplied file | Relevant printed / PDF pages |
|---|---|---|
| Core Rulebook, Fourth Edition | `C:/Users/jcrow/OneDrive/Documents/L5R 4th edition books/Legend of the Five Rings Rpg Core Rulebook 4th Ed..pdf` | 134/137, 135/138, 143/146, 144/147, 146/149, 148/151, 149/152, 150/153, 151/154, 152/155, 153/156, 154/157, 155/158 |
| The Great Clans | `C:/Users/jcrow/OneDrive/Documents/L5R 4th edition books/Legend of the Five Rings The Great Clans L5R-4e.pdf` | 199/200 |
| Naishou Province | `C:/Users/jcrow/OneDrive/Documents/L5R 4th edition books/Legend of the Five Rings Naishou Province L5R-4e.pdf` | 7/8 |

## Cross-entry pricing correction: general Advantage minimum

**Core printed p.149 / PDF p.152, “Advantage/Disadvantage Discounts,” explicitly establishes
the minimum that the earlier audit did not find.** Unless otherwise specified, discounts
are cumulative; they cannot reduce an Advantage's cost below 1.

This is a general Advantage rule, not a minimum borrowed from Allies or another individual
entry. It invalidates the current audit claim that the cited introductory text established
no applicable minimum, and it contradicts the shipped Wealthy rank-1 discount result of 0 XP.

- A rank-1 Wealthy purchase normally costs 1 XP. An eligible identity's discount cannot
  reduce that cost to 0 under this rule.
- Independent discounts can accumulate when their rules allow them. In particular,
  Naishou Citizen's separate −1 discount and the selected Fortune's qualifying Clan
  discount have no exception here that prevents combining them.
- Do not treat every mention of several eligible identities as several independent
  discounts. Wealthy lists Crane, Unicorn, and Imperial characters together for one total
  reduction. Soul of Artistry explicitly offers a price of 3 to eligible characters;
  the approved design treats Crane OR Courtier as that one eligibility test.
- This passage does not itself resolve the price of **an undiscounted Blackmail target
  whose Status Rank is zero**: its minimum sentence concerns costs reduced by discounts.
  Blackmail's own entry does not address that edge. Do not invent a claim that its own
  paragraph imposes a minimum or gives rounding instructions.
- Any source correction to pricing must retain the agreed surgical-removal baseline;
  recording this rule does not authorize rewriting the entire existing Advantage resolver.

## A02 — Blackmail

**Source:** Core printed p.146 / PDF p.149. Social; variable cost.

- Purchase cost equals the Status Rank of the individual being blackmailed.
- Scorpion characters receive a 1-point reduction from the normal cost, subject to the
  general discount minimum above.
- The benefit concerns knowledge and evidence of another person's secret. The passage
  gives narrative consequences for excessive demands; it provides no dice modifier.
- No target-Status update mechanism, NPC record, refund-on-NPC-change rule, or rounding
  rule is stated.

The approved name and agreed-purchase-Status fields therefore remain a companion-app
representation of the purchase. Actual player Status must not drive this price. Positive
whole-rank purchases are directly representable; zero/fractional target-Status handling
needs an explicit policy if offered, rather than an invented source claim.

## A04 — Darling of the Court

**Source:** Core printed p.148 / PDF p.151. Social; 2 points normally, 1 for a Courtier.

- Select one court. The source examples are Kyuden Bayushi's court and the court of
  Toshi Ranbo's Okura district; they are examples, not a closed list.
- Effective Status is one rank higher while attending that court and only while court
  is in session.
- Repeated purchases are permitted for different courts, but only one purchase for any
  particular court.

The approved consolidated courts record and one selected court/session toggle preserve
that context. Each distinct court has its own purchase cost. The source does not require
overwriting actual Status or let repeated records of the same court stack the benefit.

## A05 — Forbidden Knowledge

**Source:** Core printed pp.148–149 / PDF pp.151–152. Mental; 5 points.

The benefit varies with the knowledge and is explicitly something the player and GM
discuss. The five listed examples, paraphrased for reference help, are:

| Subject | Listed example benefit, managed manually in the approved scope |
|---|---|
| Gaijin Pepper | Knowledge of making/using gunpowder; one rank of Craft: Explosives and a small pouch of gaijin pepper. |
| Gozoku | One rank of Lore: Gozoku; +1k1 on Social Skill rolls with known Gozoku members. Membership is possible, not mandatory. |
| Kolat | One rank of Lore: Kolat; +1k1 on Social Skill rolls with known Kolat members. Membership is possible, not mandatory. |
| Lying Darkness | One rank of Lore: Lying Darkness; observing someone permits a Lore: Lying Darkness / Perception roll against TN 30 to identify corruption by it. |
| Maho | One rank of Lore: Maho; the GM may allow a starting maho spell. It is not an automatic spell entitlement. |

No Clan/profession discount is stated in this entry. Free subject and optional agreed-effects
notes fit the approved scope. Reference examples must remain labelled as manual: this
preparation does not approve automatic ranks, equipment, spells, or situational bonuses.

## A06 — Heart of Vengeance

**Source:** Core printed p.150 / PDF p.153. Social; 5 points, or 4 for a Spider character.

- Select one Clan or other faction. The Brotherhood of Shinsei and one of the Imperial
  families are explicitly given as examples of eligible factions.
- Gain +1k1 on a Contested Roll against a member of the chosen Clan/faction.
- The entry does not enumerate a closed faction list; a restricted dropdown must not be
  described as the complete RAW list. An explicit other-faction name is compatible with
  the open wording and the approved choice-based design if needed.
- Imperial-family eligibility is now source-confirmed. Which named families appear in
  the app can follow its existing family catalogue; the source passage does not list them.

The approved initial automation covers Skill, Trait, Ring, and declared manual rolls,
excluding attack, damage, and spell casting. That is the user's chosen companion-app
automation boundary; the source itself says any Contested Roll. A new unchecked per-roll
declaration supplies context without tracking other characters.

## A07 — Inheritance

**Source:** Core printed pp.150–151 / PDF pp.153–154. Material; 5 points.

- One heirloom is possessed in addition to normal School starting equipment.
- Skill Rolls using it receive +1k1 only for non-combat purposes, described as outside a
  skirmish. Attack and damage rolls are explicitly excluded.
- Examples are a biwa with Perform: Biwa, a go set with Games: Go, or a katana with Kenjutsu.
- A more powerful/unique inheritance and higher XP price may be agreed by player and GM;
  the entry supplies no automated pricing table for those cases.

Approved first-stage implementation remains the named badge/reminder. Automatic equipment,
custom-item valuation, and the optional non-combat +1k1 declaration remain deferred.

## A08 — Naishou Citizen

**Source:** Naishou Province printed p.7 / PDF p.8. 3 points; the heading supplies no subtype.

- A Seven Fortunes' Blessing purchase costs one less XP.
- With GM agreement, a later purchase may choose a different Fortune, losing the original
  Blessing when the new one is bought.
- Social Skill rolls dealing with monks aligned to the character's current blessed Fortune
  receive one Free Raise.

The source establishes replacement of the active Blessing, not an automatic reimbursement
of its historic price. The approved purchase-history separation records each intentional
purchase once while edits/cancellation/reload cost nothing. The normal Fortune-specific
Clan discount and this independent discount can both apply under Core p.149, with the
minimum respected. The monk context remains a reminder in the approved scope and requires
both Naishou Citizen and a current configured Seven Fortunes' Blessing.

## A10 — Perceived Honor

**Source:** Core printed p.152 / PDF p.155. Social; **2 points per rank**.

- For each Advantage rank, apparent Honor is one full rank higher when someone attempts
  to discern it, including Lore: Bushido / Awareness.
- Actual Honor does not increase. The entry states no maximum Advantage rank.
- No Clan/profession discount is stated.

Ten ranks cost 20 XP. The prior 3-point claim has no support in this supplied passage.
This record verifies the shipped rank-price/readout concept; it does not authorize a rebuild.

## A11 — Servant

**Source:** Core printed p.153 / PDF p.156. Material; 5 points before listed adjustments.

- Maximum servant count is twice Status Rank.
- A typical servant has Traits of 2 and one Skill of 3.
- At purchase, each additional Skill Rank or Emphasis costs 3 further points.
- The source table provides samples, not an exhaustive catalogue:

| Servant sample | Notable ability | Listed discount |
|---|---|---|
| Artisan | One Artisan Skill at 3 | Crane −2 |
| Attendant | Etiquette (Conversation) 3 | Scorpion −2 |
| Budoka | One Weapon Skill at 3 | Lion −2 |
| Craftsman | One Craft Skill at 3 | Dragon −2 |
| Eta Attendant | Lore: Anatomy 3 | Crab −2 |
| Groom | Animal Handling (Horses) 3 | Unicorn −2 |
| Merchant | Commerce (Appraisal) 3 | Mantis −2 |
| Scribe | One Lore Skill at 3 | Phoenix −2 |
| Sohei | Jiujutsu 3 | Spider −2 |

The approved reference-first scope may display these examples and costs. It does not
implement the compact servant record, upgrades, NPC rolls, or an independent character sheet.
Do not auto-apply a type-specific discount without having recorded a servant type.

## A12 — Soul of Artistry and skill families

**Advantage source:** Core printed p.154 / PDF p.157. Mental; 4 points, with a stated price
of 3 for Crane and Courtier characters. The approved design uses one eligibility reduction
for Crane OR Courtier; meeting both does not reduce it again.

- Select either Artisan Skills or Craft Skills on purchase.
- When a matching Skill would otherwise be rolled unskilled, treat it as Rank 1.
- This is an effective roll rank, not a purchased rank. The source provides no activation
  resource or player toggle and no additional benefit for an already-trained Skill.

**Family definition sources:** Core printed pp.134–135 and 143–144 / PDF pp.137–138 and 146–147.

| Family | Confirmed matching forms |
|---|---|
| Artisan | Artisan macro-skills and their specializations; **Calligraphy** explicitly counts as an Artisan Skill for effects targeting Artisan Skills. |
| Craft | Craft macro-skills and their specializations; **Engineering**, **Sailing**, and **Forgery** explicitly count as Craft Skills for effects targeting Craft Skills. |

- Printed p.134 / PDF p.137 describes each macro-skill specialization as a separate Skill,
  written with a colon after its family name. Parentheses ordinarily denote an Emphasis,
  not a separately purchased macro-skill specialization.
- Printed p.135 / PDF p.138 lists Artisan examples: Bonsai, Gardening, Ikebana, Origami,
  Painting, Poetry, Sculpture, Tattooing, and others. Calligraphy's qualifying subtype is
  explicitly printed on the same page.
- Printed p.143 / PDF p.146 lists Craft examples: Armorsmithing, Blacksmithing, Bowyer,
  Brewing, Carpentry, Cartography, Cobbling, Cooking, Farming, Fishing, Masonry, Mining,
  Poison, Pottery, Shipbuilding, Tailoring, Weaponsmithing, Weaving, and others.
- Armorsmithing, Bowyer, and Weaponsmithing are High Skills; Poison is a Low Skill. Those
  classification exceptions do not remove them from the Craft family.
- Engineering's subtype exception is printed p.143 / PDF p.146. Sailing's and Forgery's
  exceptions are printed p.144 / PDF p.147.
- The lists are expressly non-exhaustive. A matcher should support the family identity
  plus specializations and the four explicit standalone aliases, rather than treating
  the printed sample list as a whitelist or applying the effect to every High/Merchant Skill.
- The current sheet's skill library has Artisan, Calligraphy, Craft, Engineering, Sailing,
  and Forgery rows. Its broad `cat` values do not encode these family exceptions. This is a
  source-to-current-data mapping observation, not an added rule.

Unverified custom names without family metadata must not be inferred from vague words such
as “art.” Normalizing a recorded Artisan/Craft family name and retaining its specialization
is distinct from inventing a family classification.

## A14 — Void Versatility

**Source:** The Great Clans printed p.199 / PDF p.200. Spiritual; 4 points.

- Select one non-Void Ring at purchase.
- Its spell slots may be expended to use Void spells in addition to their ordinary use.
- Only a shugenja with an Affinity for Void spells can purchase the Advantage.
- It changes the permitted payment source; the passage gives no instruction to change
  a spell's element, casting dice, Affinity, or other casting effects.
- No Clan discount or a choice of a fresh Ring on each cast is stated.

The approved casting preview therefore offers ordinary Void payment or the saved Ring.
Slot exhaustion, bonus-pool warnings, single debit, and consumption/failure behavior are
application integration requirements. The source does not create bonus slots or refill any.

## A15 — Way of the Land

**Source:** Core printed p.155 / PDF p.158. Mental; 2 points, or 1 for a Unicorn character.

- Select one family's lands, a major city, or another reasonably sized region.
- Within that region, the character cannot become lost and knows available resources.
- No dice bonus, map tracking, or regional tier pricing is stated.

The approved optional region-name badge records the reminder without inventing location
detection. Optional entry in the app is a convenience decision; the rule still describes
the benefit as applying to a selected region.

## A16 — Wealthy and the confirmed grant decision

**Source:** Core printed p.155 / PDF p.158. Material; **1 point per rank**.

- The text gives two additional koku per point spent, added to the School outfit.
- Crane, Unicorn, and Imperial characters receive one point off the **total** XP cost.
- Core p.149's general minimum limits discounted XP to at least 1.
- The source states no maximum rank and does not describe resource receipts, refunds,
  post-purchase edits, or save/import behavior.

The project owner expressly confirmed on 19 September 2026 that **Wealthy grants the
2-koku-per-rank entitlement**. Treat that as the governing grant design, including for
discounted purchases; do not accidentally use the discounted XP amount to reduce the
agreed entitlement. Five ranks grant 10 koku and cost 5 XP normally or 4 XP for an eligible
identity. With the source-confirmed minimum, one rank grants the agreed 2 koku and costs
1 XP for either eligible or ineligible identity.

The already-approved ownership record must prevent repeat grants on render/recalculation,
load/import, or ordinary edits and must not claw back spent funds. How that receipt is
represented is an implementation decision; no source rule for duplicate grants exists.
The shipped reminder-only behavior is explicitly superseded by the user's latest direction.

## Remaining boundaries before implementation

1. Blackmail's zero/fractional Status edge is not explicitly resolved by its own passage.
2. Macro-skill lists and faction examples are not closed catalogues. Preserve confirmed
   classification without inventing classifications for arbitrary free text.
3. Seven Fortunes' Blessing, Dark Paragon, Paragon, and Touch of the Spirit Realms branch
   tables are recorded in the companion preparation source record, not duplicated here.
4. The general minimum correction must be documented as a correction to the earlier audit
   and Wealthy behavior. It must not be described as already shipped or already tested.
5. All behavior must stay within the existing approved scope and Phase 4.5 removal contract.
