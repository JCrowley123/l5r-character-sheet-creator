# PART I — Phase 4.8 Ancestors

The eighteen Ancestors of the Core Rulebook (pp. 241–244), built on 30 September 2026 in a cloud
session from the owner's phone. The source was the owner's own photographs of those four pages.
Every description is in this project's own words with its page; nothing is quoted (owner's
ruling, 30 September). Branch `claude/phase-4-8-ancestors`; **not merged until the owner's word**,
after the iPhone check in [MANUAL-TESTS.md](MANUAL-TESTS.md).

## The owner's rulings (30 September 2026)

1. **Where it lives: with the Clan and Family.** A card in the Clan & School tab and a section on
   the creation wizard's Family screen, because an Ancestor is part of the character's history
   and identity, and a player should see that it exists. It is **not** in the Advantages list.
   (The roadmap's Engineering Scope put it in the Identity tab; the owner moved it.)
2. **A "Lost ancestor's favour" badge** on the card switches every gift off.
3. **Favour, by the book (p. 241):** it can come back once; a second loss is final; no other
   Ancestor can ever replace one whose favour was lost; the points are never refunded. This
   answers the roadmap's open question about restoring favour.
4. **Who can be chosen:** the character's own Clan; Spider Ancestors to anyone, with the GM's
   permission (the p. 244 sidebar); every other Clan's shown greyed out.
5. **Cost:** the book prices Ancestors like Advantages (5 to 14 points), so the cost is charged
   to Experience spent, from the card.

## What it does

- **The block** sits at the foot of Clan, Family & School: an *optional* heading, a round **i**
  (the shared rules: Loyalty, Piety, Jealousy, Demands, and the Spider rule), and an **Ancestor**
  picker grouped as your Clan, Spider (GM's permission) and other Clans (greyed).
- **The card** shows the Ancestor's Clan, cost and page, who they were, each gift with a tag
  (Automatic / Tick it when you roll / Reminder), the demands, and the favour badge with a line
  saying what it will do. Lost or not applicable, the card fades and says why.
- **Choosing a Spider Ancestor** outside the Spider Clan asks first ("My GM agrees" or Cancel)
  and records the permission.
- **The favour badge** asks before each change: lost (gifts off) → returned (once, gifts on) →
  lost for good (badge disabled). Once lost even once, the picker is replaced by a line saying no
  other Ancestor can take this one's place.
- **Warnings the sheet can measure** (never automatic): Honor below Kakita's and Shiba's 4.0 or
  Akodo's 5.0; Honor at or above Bayushi's 5.0 or Atarasi's 3.0; any Taint for Kuni. A Clan
  change that leaves the Ancestor outside its Clan keeps it, charged and flagged, with nothing
  applied (Loyalty).
- **Play mode:** the picker is fixed; the badge and **i** stay live.
- **The wizard:** on the Family screen, "Ancestor (optional)" with a *No Ancestor* card and the
  Clan's and Spider Ancestors; the choice's details show below. Review adds an Ancestor line after
  School.
- **Saves:** one hidden field, `f_ancestor`, carried by the trunk's own save, load, reset and JSON
  export. A save written before this phase has no field; loading it clears the previous
  character's Ancestor instead of leaving it behind. A refused load changes nothing.

## How each gift reaches the sheet

| Ancestor | Automatic | Tick it when you roll | Reminder only |
|---|---|---|---|
| Hida (Crab, 14) | +1k0 on the damage of every weapon from the sheet's list | — | ignore 4 Reduction; Crab allies' Void Point |
| Kuni (Crab, 8) | — | Spell Casting Roll: +0k(Earth), once a session for a Void Point | resist Taint twice, keep the better |
| Doji (Crane, 8) | +1k0 Courtier, Etiquette, Perform, Sincerity | — | — |
| Kakita (Crane, 12) | — | the re-roll: +1k1 on Iaijutsu or Artisan | Matsu are Sworn Enemies |
| Agasha Kitsuki (Dragon, 11) | Perception in place of Awareness when higher (+Δk Δ) | +1k1 more with a Void Point to detect a lie | — |
| Mirumoto (Dragon, 9) | +1k1 Agility Skill rolls; +3k1 on a Mirumoto Bushi School Skill | — | — |
| Akodo (Lion, 12) | +1k0 Bugei Skill rolls except Iaijutsu | +1k1 on the Mass Battle Table (Battle rolls) | skirmish Void Point |
| Ikoma (Lion, 9) | +1k0 on rolls using Intelligence; +2k0 unarmed damage | — | — |
| Kaimetsu-Uo (Mantis, 9) | +1k1 Willpower Trait and Skill rolls | "Resisting provocation" (drops the +1k1); +3k0 with an improvised weapon | +1k1 improvised-weapon damage |
| Gusai (Mantis, 5) | — | +3k3 hiding a weapon (Stealth, Sleight of Hand) | — |
| Asako (Phoenix, 5) | — | +1k0 on Social Skills against an Ally | +1 Devotion on Allies; Driven if betrayed |
| Shiba (Phoenix, 9) | +1k1 on Intelligence rolls; Intelligence added to Armor TN | — | Isawa skirmish Void Point |
| Bayushi (Scorpion, 12) | +1k0 on School Skills, if trained in a Bayushi School | +1k1 more with a Void Point on a School Skill | Kharmic Tie Void sharing |
| Shosuro (Scorpion, 8) | +3k1 Stealth and Acting | +3k1 lying with Sincerity | — |
| Hida Atarasi (Spider, 7) | — | attack: + the higher of Earth and Taint Rank, k0 | the payment, and the same dice on damage |
| Kuni Yori (Spider, 5) | +1k0 maho Casting Rolls | +1k0 lying with Sincerity | 1 extra Taint per maho spell |
| Moto (Unicorn, 10) | — | +2k2 resisting restraint or influence | restraining spells' TN +5 × Willpower (shown) |
| Shinjo (Unicorn, 8) | +1k1 Etiquette (Awareness) | +1k1 Investigation into the strange; +1k1 honest Sincerity | — |

Automatic bonuses go through Phase 4.5's single `adv-config` registry seat (Part I; the registry
stays at seven seats); declarations through Feature 4.5.15's registry (Part I), fresh every roll.
Damage cannot use either: a damage roll rolls `getWeaponDamageDice()`'s numbers directly
(measured by Feature 4.5.12), so Hida's and Ikoma's dice are added inside that function by a
guarded block, and the damage result names them. Shiba's Armor TN is added after the Current TN
sum by another.

## Readings this phase had to make (each written on the card or here)

- **Kuni**: the book gives the bonus as "your Earth Rank in kept dice", so the sheet adds kept dice
  only (+0kE); the card suggests confirming the reading with the GM.
- **Akodo's "Bugei"**: Bugei and Weapon Skills, not Cannon, Firearms or Ninjutsu, following the
  owner's reading of "Bugei" for School choices (Phase 11.2.2, Part K).
- **Kitsuki**: applied automatically only when Perception is higher, the only case where
  choosing it helps; the bonus is the difference in both rolled and kept dice.
- **Atarasi**: the choice of Earth or Taint Rank is made for you (the higher).
- **Mass Battle Table**: offered on Battle rolls; the sheet has no mass battle system.
- **Spider Ancestors** keep the same favour rules as the others; the sidebar only says they are
  not bound by the usual rules on whom they favour.
- **Hida's damage** is automatic for weapons chosen from the sheet's list; a custom weapon row
  rolls what its owner typed, so the card says to add it there by hand.

## Not in this release

- **Other books' Ancestors.** The index lists "New … Ancestors" in The Great Clans (pp. 42, 104,
  140, 170, 202, 230, 260, 283) and Secrets of the Empire pp. 243–245 (Imperial families and Minor
  Clans). Each needs its pages, from the laptop or photographs.
- **Wiki cross-check.** The owner's supplementary wiki pages were blocked by this session's network
  settings, so this release was built from the book pages alone.
- **Cursed by the Realm (Yomi)** says ancestral entries are flagged; it does not yet know about
  this card. A later link, not built.
- Payments (Void Points, Taint, once per session) and the skirmish and ally effects are reminders.

## QA (30 September 2026, this cloud session)

| | |
|---|---|
| Build with this phase | `bb5207dc5a023ddb97fa3095771463b7cc07b69894b18252c12898cdc3bec355`, 3,188,218 bytes |
| Own harness (`qa/ancestors-harness.js`) | **161/161**; **1/160** on main before the last check was added (the harness can fail), and its `--absent` expectations 6/6 on main |
| Full suite (`qa/current-suite-runner.js`) | **3,160/3,160**: 2,999 retained plus 161 new (run with `LANG=C.UTF-8`; see Phase 7's README) |
| Build without this phase | byte-identical to `main`, whose full suite read 2,999/2,999 earlier the same day; the two retained harnesses changed since (4.5.15, 4.5.16) read 53/53 and 91/91 on it |
| Removal (`qa/remove-phase.py`) | **byte-identical** to `2e65b361…`, 3,128,232 bytes, on the first attempt |
| Remover fixtures (`qa/test-removal.py`) | **20/20**, no skips; every release in the shared removal chain: 21/21 folders pass |
| Dependency checker | exit 0: every reference to this phase's surface is inside its own blocks |
| Variants (`qa/verify-variants.py`) | **20 of 20** deliberately broken builds fail, each exactly as pinned in `qa/expected-failures.json` (457 failing assertions in all); boundaries all green: removed and switched off 6/6 (`--absent`), Phase 4.5 roll effects off, Feature 4.5.15 off, Phase 12 off and Phase 11.2 off 161/161 each |

The first variant run found a blind spot: with Kitsuki's "Awareness only" test removed, no check
turned red. `ANC48-AUTO-34-AgashaKitsuki` (Kitsuki on a Stealth roll: no bonus) closes it.

Headless Chromium only. The web fonts cannot load here, and nothing has been seen on a real
device yet: that is the iPhone check.
