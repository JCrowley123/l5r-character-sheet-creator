# PART I — Phase 4.8 Ancestors

Every Ancestor in the three books the owner has supplied: the Core Rulebook (pp. 241–244, 18
Ancestors), The Great Clans (16 Ancestors on eight pages) and Secrets of the Empire (pp. 243–247, 20
Ancestors). 54 Ancestors in all, as 55 entries in the sheet's list, because Agasha has two (the
ordinary gift at 6 points and the most favoured one at 10). Built on 30 September 2026 in a cloud
session from the owner's phone, from the owner's own photographs of the pages. Every description is
in this project's own words with its page; nothing is quoted (owner's ruling, 30 September).

Built on branch `claude/phase-4-8-ancestors`; **merged to `main` on the owner's word on 1 October,
before the iPhone check** in [MANUAL-TESTS.md](MANUAL-TESTS.md), which is still owed.

Two releases on the same branch, the same day:

1. **First release**: the Core Rulebook's eighteen, the card, the favour badge, the cost, the wizard.
2. **Second release** (this one): the owner's iPhone check of Kakita, applied (below), and the other
   two books' Ancestors, added under the same rules. The full gift-by-gift audit is
   [AUDIT.md](AUDIT.md).

## The owner's rulings (30 September 2026)

1. **Where it lives: with the Clan and Family.** A card in the Clan & School tab and a section on
   the creation wizard's Family screen, because an Ancestor is part of the character's history
   and identity, and a player should see that it exists. It is **not** in the Advantages list.
   (The roadmap's Engineering Scope put it in the Identity tab; the owner moved it.)
2. **A "Lost ancestor's favour" badge** on the card switches every gift off.
3. **Favour, by the book (p. 241):** it can come back once; a second loss is final; no other
   Ancestor can ever replace one whose favour was lost; the points are never refunded. This
   answers the roadmap's open question about restoring favour.
4. **Who can be chosen:** the character's own Clan or faction; Spider Ancestors to anyone, with the
   GM's permission (the Core p. 244 sidebar); every other shown greyed out.
5. **Cost:** the books price Ancestors like Advantages (3 to 14 points), so the cost is charged to
   Experience spent, from the card.
6. **When a gift reaches a roll** (the owner's feedback on Kakita, points 6 and 7):
   - a gift that **changes the dice after the roll** (a re-roll, an extra die) is offered **after the
     roll**, in the result, like Luck: nobody knows before rolling whether they will want it;
   - a gift that **adds dice but costs something** (a Void Point, a once-a-session use) is **offered
     in the roll preview**, and the player chooses;
   - a gift that is a **free, straight modifier** is **applied automatically and shown in the roll
     preview**.
7. **An audit of every Ancestor against rule 6** (point 8), including a check for Ancestors missing
   from the books supplied and from the owner's wiki index. Done: [AUDIT.md](AUDIT.md).
8. **The round i** follows the Advantages' circled i, which is the standard (point 1).

**Deferred by the owner** (not done here): point 2, the page feeling cluttered (Phase 15); point 9,
letting a lost-favour Ancestor be edited in Management mode (the end of the project). Point 5, the
Manage button clipping on the first press, is its own small fix in
`Versions/BUGFIX — Manage Button Clipping/`, on the same branch. Points 3 and 4 (the wizard; favour
lost and regained) needed nothing: the owner found them working.

## What it does

- **The block** sits at the foot of Clan, Family & School: an *optional* heading, a round **i**
  (the shared rules, Loyalty, Piety, Jealousy and Demands, then the Spider, ronin and Brotherhood
  rules), and an **Ancestor** picker. The picker lists your own Clan's or faction's Ancestors first
  (a Minor Clan, the Imperial families, ronin, and the Brotherhood for a monk, who may also see
  their Clan's), then the Spider Ancestors (with the GM's permission), then every other, greyed.
- **The card** shows the Ancestor's faction, cost and page, who they were, each gift with a tag
  saying how it reaches the sheet (below), the demands, and the favour badge with a line saying
  what it will do. Lost or not applicable, the card fades and says why.
- **Tags on the gifts:** *Automatic*; *With a Void Point* (the gift improves a Void Point you spend);
  *Choose it when you roll* (it costs something; the price is on the tag); *After the roll*;
  *Tick it when you roll* (free, but only the player knows it applies); *Shown when you roll* (a
  Free Raise or Raises without limit, printed, since the sheet has no Raise mechanic); *Reminder*.
- **Paying for a gift.** A ticked gift that costs a Void Point is paid when you press **Roll**, by
  the Void card's own rules: none left, or one already spent this combat Round, and the sheet says
  so and offers to roll without the gift, or to cancel the roll with nothing spent. A
  once-a-session use is marked the same way, and the card shows it (**used this session (0/1)**)
  with a **Reset session** button; Seppun's and Komori Iongi's free Void Point also has **Use it
  now**, for a use that is not a roll. Two costs are the player's to record because the sheet
  cannot take them honestly, and it asks rather than guesses: Hida Atarasi's point of Taint (the
  sheet keeps Taint as a Rank) and Chuda Bikimi's spell slot (the sheet would have to choose the
  Element).
- **After the roll.** Kakita's re-roll (+1k1, a Void Point, keep the better), Sun Tao's extra die
  (a Void Point, on a failed Bugei roll) and Toku's Luck (once a session, keep the higher) appear
  under the result, as Luck does, with a button and the price.
- **Choosing a Spider Ancestor** outside the Spider Clan asks first ("My GM agrees" or Cancel)
  and records the permission.
- **The favour badge** asks before each change: lost (gifts off) → returned (once, gifts on) →
  lost for good (badge disabled). Chuda Bikimi never returns (The Great Clans p. 283): his first
  loss is final. Once lost even once, the picker is replaced by a line saying no other Ancestor can
  take this one's place.
- **Warnings the sheet can measure** (never automatic, never a block): the Honor and Taint demands;
  a family, bloodline, School, tattoo or devotion an Ancestor asks for (Kitsu blood, a tattooed
  order, a Shugenja School, a true ronin, and so on); Yogo's Bad Fortune (Yogo Curse) when it is
  missing. A Clan change that leaves the Ancestor outside its faction keeps it, charged and flagged,
  with nothing applied (Loyalty).
- **Play mode:** the picker is fixed; the badge, the **i**, and the session buttons stay live.
- **The wizard:** on the Family screen, "Ancestor (optional)" with a *No Ancestor* card, then your
  Clan's Ancestors and the Spider ones, in the picker's order; the choice's details show below.
  Review adds an Ancestor line after School.
- **Saves:** one hidden field, `f_ancestor`, carried by the trunk's own save, load, reset and JSON
  export. It records whether this session's once-a-session use is spent. A save written before this
  phase has no field; loading it clears the previous character's Ancestor instead of leaving it
  behind. A refused load changes nothing.

## How the gifts reach the sheet

[AUDIT.md](AUDIT.md) lists every Ancestor's gifts and how each one reaches a roll. Five of the Core
Rulebook's eighteen changed in this release to follow rule 6: Kakita (after the roll), Kuni and Hida
Atarasi (chosen when you roll, and paid by the sheet), and Agasha Kitsuki and Bayushi (with a Void
Point: the Void Point you tick in the preview pays for the gift, with no second tick).

Automatic bonuses go through Phase 4.5's single `adv-config` registry seat (Part I; the registry
stays at seven seats); ticks through Feature 4.5.15's registry (Part I), fresh every roll; payment
through a wrapper on the roll preview's gate (Phase 3, Part G), after the player presses Roll; the
after-the-roll offers through Phase 4.5's roll-result hook, as Luck's are. Damage cannot use the
pipeline: a damage roll rolls `getWeaponDamageDice()`'s numbers directly (measured by Feature
4.5.12), so Hida's and Ikoma's dice, and Hida Atarasi's Round dice, are added inside that function by
a guarded block, and the damage result names them. Shiba's Armor TN is added after the Current TN sum
by another.

## Readings this phase had to make

Each is written on the card or in [AUDIT.md](AUDIT.md) ("Readings the audit had to make").
The first release's, still standing:

- **Kuni**: the book gives the bonus as "your Earth Rank in kept dice", so the sheet adds kept dice
  only (+0kE); the card suggests confirming the reading with the GM.
- **Akodo's "Bugei"**: Bugei and Weapon Skills, not Cannon, Firearms or Ninjutsu, following the
  owner's reading of "Bugei" for School choices (Phase 11.2.2, Part K). Sun Tao's uses the same.
- **Kitsuki**: applied automatically only when Perception is higher, the only case where
  choosing it helps; the bonus is the difference in both rolled and kept dice.
- **Atarasi**: the choice of Earth or Taint Rank is made for you (the higher).
- **Mass Battle Table**: offered on Battle rolls; the sheet has no mass battle system.
- **Spider Ancestors** keep the same favour rules as the others; the sidebar only says they are
  not bound by the usual rules on whom they favour.
- **Hida's damage** is automatic for weapons chosen from the sheet's list; a custom weapon row
  rolls what its owner typed, so the card says to add it there by hand.

## Not in this release

- **Other books' Ancestors.** None of the other books the index searched has a section of Ancestor
  Advantages among its headings; Enemies of the Empire p. 243 ("Yomi, the Realm of Blessed
  Ancestors") is the one page worth a look. See AUDIT.md, "Missing Ancestors: the check".
- **The wiki cross-check.** This session's network settings refused both of the owner's wiki hosts
  (magicalsamurai.wikidot.com and lasthaiku.wikidot.com), as they did for the first release.
- **Cursed by the Realm (Yomi)** says ancestral entries are flagged; it does not yet know about
  this card. A later link, not built.
- The skirmish, ally and narrative gifts, and effects on systems the sheet does not model
  (Reduction against fire, Magic Resistance, spells learned per Rank), are reminders on the card.
- The owner's points 2 and 9 (above).

## QA (30 September to 1 October 2026, this cloud session)

| | |
|---|---|
| Build with this phase | `ceb2d4b2cd1f281c1878ffb3368a216da930df490e358f1d7c2cc55ef424cfef`, 3,255,067 bytes (the first release was `bb5207dc…`, 3,188,218 bytes) |
| Own harness (`qa/ancestors-harness.js`) | **349/349**; **180/349** on the first release's build and **1/349** on `main` (the harness can fail); its `--absent` expectations **7/7** on `main` |
| Full suite (`qa/current-suite-runner.js`) | **3,347/3,347**: 2,999 retained plus the harness's 348 checks at the time (run with `LANG=C.UTF-8`; see Phase 7's README). The harness then gained its 349th check (below) and read 349/349 on the same build |
| Build without this phase | **byte-identical** to `main` (`2e65b361…`, 3,128,232 bytes), measured again for this release, on the first attempt |
| Remover fixtures (`qa/test-removal.py`) | **20/20**, no skips; every release in the shared removal chain: 21/21 folders' fixtures pass, and the chain's own checks 11/11 |
| Dependency checker | exit 0, with the 69 ids, classes and names the fragment and stylesheet introduce given as `--also`: every reference is inside this phase's own blocks |
| Variants (`qa/verify-variants.py`) | **40 of 40** deliberately broken builds fail, each exactly as pinned in `qa/expected-failures.json` (1,077 failing assertions in all); boundaries all green: removed and switched off 7/7 (`--absent`), Phase 4.5 roll effects off, Feature 4.5.15 off, Phase 12 off and Phase 11.2 off 349/349 each |

The first variant run of this release found a blind spot: with Sun Tao's extra die re-sorted into
the best dice, no check turned red, because every roll testing it had dice of one value, where the
two readings agree. `ANC48-AFTER-SUNTAO-NOT-RESORTED` closes it with mixed dice (9, 5 and 3, keeping
the 9 and the 5; Sun Tao's die a 2): the rule keeps 9, 5 and 2 for 16, and that variant keeps 9, 5
and 3 for 17 (measured).

Headless Chromium only. The web fonts cannot load here, so every width measured here is the fallback
font's; nothing in this release depends on a measured width. Nothing of this release has been seen
on a real device yet: that is the iPhone check.
