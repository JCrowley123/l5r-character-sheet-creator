# Prompt for Claude Code: Implement Monks on the L5R character sheet

Copy everything below the line into Claude Code, pointed at your sheet file
(`l5r-character-sheet_part_C_feature_8_1_mirumoto_SWIPE-MOBILE.html`). This
is a big feature - **do it in the phases below, in order, and stop for
confirmation after each phase** rather than landing it all in one pass. Each
phase is independently useful and testable; don't let scope creep merge them
into one giant diff.

---

## Context

This is a single-file L5R 4th Edition character sheet (~12,500 lines,
vanilla JS/HTML/CSS, no build step, no dependencies).

**There are two unrelated things that both get called "Monk" on this
sheet, and they need different mechanics. Do not conflate them:**

1. **Clan-affiliated `[Monk]` Schools** - already exist in `SCHOOL_LIBRARY`
   under their Clans: Togashi Tattooed Order, Hoshi Tsurui Zumi Order,
   Hitomi Kikage Zumi Order (Dragon), Kuni Witch-Hunter (Crab), Asako
   Henshin (Phoenix), The Order of the Spider Monks (Spider). These are
   **structurally ordinary Schools** - a normal 5-rank Technique list, same
   shape as any Bushi/Courtier School. `[Monk]` here is flavor plus one
   mechanical fact: they're eligible to purchase Kiho as "non-Brotherhood"
   characters (1.5x cost - see Phase 1). Confirmed against The Great Clans
   sourcebook (p.40 Kuni Witch-Hunter, matches the sheet's existing data
   exactly) - and that same sourcebook shows individual Technique ranks
   sometimes granting a Kiho directly as part of their text (Kuni
   Witch-Hunter Rank 4: "you may learn one Kiho... this Kiho does not count
   against the maximum number of Kiho you can learn"; Asako Inquisitors
   [an Advanced School] Rank 1 does the same for non-shugenja members).
   These are just Technique-text special cases, not a new subsystem.
2. **Brotherhood-of-Shinsei Basic Schools** - NOT currently on the sheet at
   all. Six of them are in the Core Rulebook (pp.231-233): The Four
   Temples, The Order of Heroes, The Shrine of the Seven Thunders, The
   Temple of Kaimetsu-uo, The Temple of Osano-Wo, The Temples of the
   Thousand Fortunes. These are **structurally different**: a Devotion
   instead of a Clan, and only **one flat Technique** (no 5-rank list).
   Only characters in *this* category get the full monk framework: Void 3
   at creation, Glory 1/Status 0 with halved Glory gain, 3 starting Kiho,
   +2 Kiho every School Rank advance. This is the "Playing a Monk" sidebar
   on p.231 - it explicitly describes Brotherhood monks, not every School
   with `[Monk]` in its name.

Getting this split right is the most important part of the whole feature -
applying Void-3/Glory-halving/Kiho-per-Rank to a Togashi Tattooed Order
character, or denying a Kuni Witch-Hunter the 1.5x Kiho-purchase option,
would both be wrong.

`Jiujutsu` and an `Unarmed` weapon row already exist and don't need
touching.

**Primary sources - the two PDFs the player owns:**
- Core Rulebook, pp.231-235 (Monk Schools, "Playing a Monk" sidebar) and
  261-268 (Kiho rules, Air/Earth/Fire/Water/Void lists, Atemi Attacks
  sidebar, Non-Brotherhood Kiho sidebar).
- The Great Clans, p.40 (Kuni Witch-Hunter `[Monk]`, confirms existing
  sheet data and the Technique-grants-Kiho pattern) and its Asako
  Henshin/Asako Inquisitors sections (Phoenix chapter).

Two wiki mirrors of the same Core Rulebook content, useful for copy-pasting
text without re-scanning the PDF repeatedly - cross-check against the PDF,
don't treat as sole source:
- `http://magicalsamurai.wikidot.com/kiho` and `.../schools-monk` - matches
  the Core Rulebook's Kiho list and Brotherhood Basic Schools respectively,
  and the schools-monk page also cites exact sourcebook + page for several
  Schools this pass won't cover (see "Other sourcebooks" at the end).
- `http://lasthaiku.wikidot.com/kiho` - a superset including later-book
  Kiho not in the Core Rulebook pages cited above (Calling the East Wind,
  Bishamon's Grasp, staff Kiho, etc.) - optional future addition, not part
  of this pass.

Existing patterns to mirror, both in the "Techniques, Kata & Spells"
section:
- `KATA_LIBRARY` (search `const KATA_LIBRARY`) - array of `{name, ring,
  mastery, schools, desc}`. Gated by `kataEligibility(k)`: School must match
  `k.schools` (or `k.schools === 'Any'`) AND `getRingValueByName(k.ring) >=
  k.mastery`.
- `SPELL_LIBRARY` - similar shape, gated by `spellEligibility(s)` plus a
  scroll-ownership layer.
- Both render into one `<select id="techQuickAdd">` via
  `techQuickAddOptionsHTML()` / `refreshTechQuickAddOptions()`, wired in
  `buildTechQuickAdd()`'s change handler, which appends to `#techList` via
  `makeEntry(...)`.
- Locked/ineligible options stay visible but `disabled` with a "locked -
  needs X" label - don't hide them outright.
- The synthetic **'Minor Clan'** entry in the Clan dropdown (see
  `allClanNames`, `isMinorClan()`, `MINOR_CLAN_SCHOOL_LIBRARY`) is the
  pattern to copy for Brotherhood Schools in Phase 2 - it's already how this
  file handles "a School grouping that isn't a real Clan."

---

## Phase 1 - `KIHO_LIBRARY` and the Kiho quick-add

The rule (confirmed against the Core Rulebook and the "Kiho and
Non-Brotherhood Kiho" sidebar on p.266):

- Every Kiho has an **Element (Ring)**, a numeric **Mastery Level**, and a
  **Type**: Internal, Kharmic, Martial, or Mystical. Some are tagged
  **(Atemi)** - delivered via a precise nerve-strike, not a normal attack.
- **Eligibility for a Brotherhood/Monk-School character:** School Rank + the
  matching Ring rank >= Mastery Level (same shape as `kataEligibility`, but
  *adds* Ring + School Rank rather than checking Ring alone).
- **Non-Brotherhood Monk Schools** (category 1 above - Togashi, Kuni, Asako
  Henshin, etc.) buy Kiho at **1.5x normal XP cost**, still using Ring +
  School Rank for eligibility.
- **Shugenja** may buy Kiho at **2x normal XP cost**, but eligibility uses
  **Ring alone** (no School Rank added).
- This whole non-Brotherhood allowance (category-1 Monk Schools, Shugenja,
  Ninja) is explicitly an **optional GM rule** in the book, not baseline -
  worth a code comment, and maybe worth gating behind something the player
  can turn off later, but don't block Phase 1 on building that toggle now.
- Usage rules worth keeping as reference text on each entry even if not
  mechanically enforced: only one each of Internal/Kharmic/Mystical active
  at a time (Martial can stack, one delivered per unarmed strike per Turn
  unless multiple attacks); activation is a Void Point (Free Action) or a
  Meditation/Void roll (TN 15 Complex, or TN 30 Simple).

Build:

1. **`KIHO_LIBRARY`** - array, same section as `KATA_LIBRARY`. Each entry:
   `{name, ring, mastery, type, atemi, schools, desc}`. Use `schools: 'Any'`
   for this pass - order-specific Kiho restrictions aren't clearly spelled
   out in the Core Rulebook pages cited and shouldn't be guessed at.
2. **Data entry**: transcribe from the Core Rulebook pages (261-265 cover
   through the Air/Earth Kiho and into Fire; confirm where Water/Void land
   in your copy) rather than the wikis, so Mastery numbers match what the
   player actually owns. Use the wikis only to cross-check you haven't
   mis-transcribed something. Flag anything you can't read clearly instead
   of guessing.
3. **`kihoEligibility(k)`** - mirror `kataEligibility()`'s shape but
   implement the real formula: Monk-School character -> `ring value + School
   Rank >= k.mastery`; Shugenja (or no School yet) -> `ring value >=
   k.mastery` alone. Return enough (`{eligible, costMultiplier, ...}`) for
   the dropdown to show the right locked reason and the right XP cost.
4. **Wire into the existing dropdown** - don't build a parallel UI:
   - Add a Kiho section to `techQuickAddOptionsHTML()`, grouped by Element
     to match Kata's layout, showing Type + (Atemi) in the label the way
     Kata shows `(Ring Mastery)`.
   - Add a `kind==='kiho'` branch to `buildTechQuickAdd()`'s handler,
     appending via `makeEntry({name, cost, desc}, true, 'XP')` where `cost =
     k.mastery * costMultiplier` - new logic, not a copy of Kata's flat
     cost.
   - Update the dropdown's placeholder text to mention Kiho.
   - Shugenja CAN see/buy Kiho (at 2x) - don't reuse Kata's `casterLock !==
     'shugenja'` visibility condition unmodified.
5. **"Friend of the Brotherhood" Advantage** (search Advantages data) reads
   "Buy Kiho at Brotherhood-of-Shinsei rates even though you are not from
   that School" - wire it to force the 1x multiplier instead of 1.5x for a
   category-1 Monk School character, rather than leaving it inert.
6. **Technique-granted Kiho** (Kuni Witch-Hunter Rank 4, Asako Inquisitors
   Rank 1 pattern - and now a third confirmed example, Emerald Empire's
   Dark Paragons [Monk] Advanced School for the Spider Clan, p.207: Rank 1
   grants 2 Kiho, Rank 3 grants 2 more, and Rank 3 *also* lets you spend
   Honor or Taint instead of a Void Point to activate any Kiho at all - a
   new activation-cost override this sheet has no equivalent for yet):
   when adding these existing Techniques' text/effects
   isn't in scope for this phase, but leave a code comment on
   `kihoEligibility`/the cap logic (Phase 4) noting that a Kiho granted this
   way is exempt from any known-Kiho cap - Phase 4 needs to account for it
   even though Phase 1 doesn't implement the grant itself.

**Stop here and confirm before Phase 2.** Test against an existing
category-1 Monk School (e.g. Togashi Tattooed Order) and a Shugenja School
end-to-end.

---

## Phase 2 - the six Brotherhood-of-Shinsei Basic Schools

Pages 231-233 list six Schools that aren't tied to any Clan (category 2
above): **The Four Temples**, **The Order of Heroes**, **The Shrine of the
Seven Thunders**, **The Temple of Kaimetsu-uo**, **The Temple of Osano-Wo**,
**The Temples of the Thousand Fortunes**. Each has a **Devotion** (Shintao
or Fortunist) instead of a Clan affiliation, plus Benefit/Skills/Honor
exactly like a normal School entry, but only **one flat Technique**.

Build:

1. A new library (e.g. `BROTHERHOOD_SCHOOL_LIBRARY`), one entry per School,
   shaped like existing entries but with `devotion` instead of implicit
   Clan, and `tech` as a single description string/object instead of an
   array of 5. Flag every entry `monk:true` / `brotherhood:true` (pick one
   name, but this flag is what Phase 3/4 branch on - it must NOT be set on
   any category-1 School).
2. A synthetic **"Brotherhood of Shinsei"** entry in the Clan dropdown,
   built the exact same way `'Minor Clan'` already is (see `allClanNames`,
   `isMinorClan()`) - when selected, the School dropdown should populate
   from `BROTHERHOOD_SCHOOL_LIBRARY` instead of `SCHOOL_LIBRARY[clan]`.
3. Two of the six have creation-time quirks worth encoding as flags on the
   entry rather than hardcoding: **Shrine of the Seven Thunders** requires
   all 3 starting Kiho from the same Element, with effective Insight Rank
   treated as +1 for meeting that Element's Kiho Mastery; **Temples of the
   Thousand Fortunes** starts with 4 Kiho instead of 3, and those 4 don't
   count against the purchased-Kiho total. Phase 4 is where these actually
   get enforced - for now, just get the flag data modeled correctly.

**Stop here and confirm before Phase 3.**

---

## Phase 3 - monk-specific character creation deltas

From the "Playing a Monk" sidebar (p.231), when the *active* School is
flagged `monk:true`/`brotherhood:true` from Phase 2 - **category 2 only,
never category-1 clan `[Monk]` Schools**:

- **Void starts at 3, not 2.** Traits still start at 2 like any character -
  don't touch those.
- **Glory 1 / Status 0** at creation instead of whatever the School's normal
  Honor-adjacent baseline is (Honor is unaffected - only Glory/Status).
  Status advances normally afterward; **Glory gain is halved** for the rest
  of the character's advancement.
- Baseline monk outfit (Bo or jo pair, coarse/plain Traveling Clothing,
  Scroll Satchel with Tao passages, 2 zeni) comes from each
  `BROTHERHOOD_SCHOOL_LIBRARY` entry's own `outfit` field (Phase 2) - this
  is uncontested for category 2, unlike category-1 Schools which already
  have Clan-specific outfits that should NOT be touched by this phase.

Find wherever "Apply School" currently sets starting Honor/Skills/Outfit
(`cfs_applySchool` handler) and branch on the `monk`/`brotherhood` flag for
the Void/Glory/Status pieces specifically.

**Stop here and confirm before Phase 4** - this phase touches shared
character-creation code paths, so it's worth the most careful review before
building on top of it.

---

## Phase 4 - Kiho grants, starting Kiho, and the known-Kiho cap

The mechanically hardest part, so it's last. Applies to category-2
(`monk`/`brotherhood`-flagged) Schools for the starting/per-Rank grants;
applies to ALL characters (any School) for the overall cap, since
category-1 Schools' purchased Kiho count too.

- A category-2 Monk character starts knowing **3 Kiho** (or the per-School
  override from Phase 2: Seven Thunders' single-Element constraint,
  Thousand Fortunes' 4) at creation, chosen by the player from eligible
  options.
- **Gains 2 more Kiho, player-chosen, every time School Rank advances** -
  this is NOT like the existing Technique auto-grant
  (`applyUnlockedTechniquesToList`/`f_schoolTechGranted`), which grants a
  fixed named Technique per Rank. Here the player picks which 2 Kiho from
  the eligible pool, so this needs a "you have N free Kiho picks available"
  affordance - e.g. a badge/counter near the Kiho quick-add, and free picks
  consume a slot instead of costing XP when added via `techQuickAdd`.
- **Total known Kiho (free + purchased) is capped** at the character's
  cumulative Monk/Shugenja School Rank across every School they've ever
  had - same "once trained, always counts" logic `characterCasterLock()`
  already uses for Bushi/Shugenja exclusivity, just summed instead of
  boolean. A Kiho granted directly by a Technique's text (the Kuni
  Witch-Hunter Rank 4 / Asako Inquisitors Rank 1 pattern flagged in Phase 1
  step 6) is explicitly exempt from this cap per the source text - don't
  let it consume a cap slot if/when that grant gets implemented.
- Bonus (purchased) Kiho cost = Mastery Level XP x the Phase 1 multiplier,
  and these draw from the same eligible pool but don't consume free-pick
  slots.

Given the complexity, propose your specific data-model approach (e.g. what
tracks "free picks remaining" alongside `f_schoolTechGranted`) before
writing it, so it can be reviewed against the rest of the School-rank
tracking system rather than discovered after the fact.

---

## Constraints (apply to every phase)

- Match the existing code style exactly: same comment density/tone
  (explaining non-obvious rules decisions inline, like the rest of the file
  does), same naming conventions, no new libraries/build tooling - this
  stays a single static HTML file.
- Minimize each phase's diff; don't touch Kata/Spell logic except where
  genuinely shared.
- Test each phase manually end-to-end before moving on (see the stop points
  above) and confirm XP/recalculation (`recalcAll()`) still works.
- If any rule detail is genuinely ambiguous, or the PDF and the wikis
  disagree, stop and ask rather than guessing - this sheet's existing data
  is clearly all rules-accurate, and new additions should hold to that bar.
- While in the Dragon Clan section of `SCHOOL_LIBRARY` for other reasons,
  worth flagging: `The Hoshi Tsurui Zumi Order [Monk]` currently has only
  one entry in its `tech` array while every other 5-Rank School (including
  `The Hitomi Kikage Zumi Order [Monk]` right next to it) has five - likely
  a pre-existing data gap, not something this feature should silently
  "fix" without checking the Core Rulebook's Dragon Clan chapter first.
- Also newly confirmed while reading The Great Clans for Phase 5/6 below:
  `Togashi Defender [Monk]` (p.104) is an Alternate Path (Rank 3, Replaces
  Togashi Tattooed Order 3) that the original pass through this sourcebook
  didn't catch - only Kuni Witch-Hunter and the Asako Phoenix entries were
  flagged. It's in scope for Phase 6's `ALTERNATE_PATH_LIBRARY`, not a
  Phase 2 Basic School.

---

## Phase 5 - New Monk Schools and new Kiho from the Elemental series

The player now owns Book of Air, Book of Fire, Book of Water, and Book of
Void (not Book of Earth). All four were checked directly (text-layer
extraction of the PDFs, cross-checked against each book's own Table of
Contents for page numbers - not sourced from wikis). Each book turns out
to add more of exactly the two things Phase 1/2 already model - more
`KIHO_LIBRARY` entries and more `BROTHERHOOD_SCHOOL_LIBRARY` entries - so
this phase is data entry against the existing schema, not new machinery.
(The Alternate Paths these books *also* add are architecturally different
and are Phase 6, not this phase.)

**New Basic Brotherhood Schools to add** (all `monk:true`/`brotherhood:true`
per Phase 2's flag, all Devotion + one flat Technique, same shape as the
Core Rulebook's six):
- Book of Air, pp.193-194: **Order of the Wind** (p.193, Devotion:
  Fortunism); **Wind's Grace Order** (p.194, Devotion: Shintao - special
  case, see below); **Fukurokujin's Eyes** (p.194, Devotion: Fortunism).
- Book of Fire, pp.190-191: **The Order of Rebirth** (p.190, Devotion:
  Fortunist); **Tengoku's Fist** (p.191, Devotion: Shintao - book's text
  describes it as a philosophical offshoot of the Core Rulebook's Shrine
  of the Seven Thunders, worth a `desc` cross-reference but not a
  mechanical link); **The Temple of Heavenly Wisdom** (p.191, Devotion:
  Fortunist).
- Book of Water, pp.186-188: **The Order of Jurojin's Blessing** (pp.186-187,
  Devotion: Fortunist); **The Shrine of Heaven's Mirror** (pp.187-188,
  Devotion: Fortunist - has a Special clause: lose the Technique's benefit
  if you stop following the Order's Ascetic practices, worth modeling as a
  `conditional` note like the existing Servants-of-Mercy-style pacifism
  clauses, not enforced mechanically).
- Book of Void, p.193: **The Order of Eternity** (Devotion: Shintao).

That's 3 + 3 + 2 + 1 = 9 new Basic Schools, on top of the Core Rulebook's 6.

**Special case - Wind's Grace Order (Book of Air, p.194):** its own text
flags that Asahina family members (Crane Clan) may attend this Brotherhood
School while remaining samurai caste (Trait Benefit from their family, not
the School's own Devotion-linked Benefit) - the same pattern the Core
Rulebook already uses for Togashi/Asako/Kuni-style Clan-monk crossover, but
running the other direction (a Clan family with an opening into a
Brotherhood School, not a Brotherhood-eligible Clan Technique). Flag this
on the entry (e.g. `crossoverFamily: 'Asahina'`) rather than hardcoding a
UI special case - Phase 3's Void/Glory/Status delta logic should still
apply normally to a character who takes this route, since they're
attending a `brotherhood:true` School.

**New Kiho to transcribe into `KIHO_LIBRARY`** (same fields as Phase 1:
name, ring, mastery, type, atemi, desc - `schools: 'Any'` per the same
reasoning as Phase 1):
- Book of Air, pp.190-192 (New Internal/Martial/Mystical Air Kiho): Eye of
  the Eagle, The Wind's Vision (Internal); Calling the East Wind, Censure
  of Thunder, Hurricane Palm, Touch of the Storm (Martial); Inari's Wrath,
  Strike through the Wind, Thunder's Word (Mystical). 9 entries.
- Book of Fire, pp.191-192 (New Fire Kiho): The Mind's Fire (Internal, Fire
  4), Sever the Dark Lord's Touch (Mystical, Atemi), Seven Storms' Fist.
  3 entries.
- Book of Water, p.188 (New Water Kiho: **Staff Kiho**): Musubi (Internal,
  Water 5), Dharma Technique (Martial, Water 7), Tasaii-Do (Martial, Atemi,
  Water 6). These three are gated on **wielding a bo staff or three-section
  staff specifically** (not jo, not tonfa) - `KIHO_LIBRARY` doesn't
  currently have a field for a weapon-in-hand requirement. Add one (e.g.
  `requiresWeapon: 'staff'`), and treat it the same way Phase 1 treats
  Atemi and the Internal/Kharmic/Mystical-one-at-a-time rule: reference
  text on the entry, not mechanically enforced this pass.
- Book of Void, pp.192-193 (New Void Kiho): Knowledge from Within
  (Internal, 4), Mind/No-Mind (Mystical, Atemi, 6), Rebuke of the Heavens
  (Kharmic, 5), Sense the Balance (Kharmic, Atemi, 6), Striking Through the
  Void (Martial, 7), The World Disappears (Internal, 6). 6 entries.

18 new Kiho total. Transcribe Mastery numbers and full text from the PDFs
(same "flag anything unclear instead of guessing" rule as Phase 1) - the
ring/mastery/type shorthand above is enough to know what to go looking
for, not enough to enter as final data.

**New Disadvantage - Uncentered [Spiritual] (Book of Void, p.192):** "Monk
only" (2 pts for Clan-monk/category-1 characters, 4 pts for
Brotherhood/category-2 characters); blocks learning **any** Void Kiho and
blocks the Ishiken-do and Void Versatility Advantages. This is a real gate
on `kihoEligibility()` that Phase 1 didn't anticipate (Phase 1 only models
Ring/Mastery/School-Rank math and the Friend-of-the-Brotherhood cost
override) - if Disadvantages are tracked in a way this function can see,
add the check; if not, at minimum leave a code comment, the same way Phase
1 left one for Technique-granted Kiho.

**Also present, correctly out of scope for this feature:** New Advantage
Reincarnated [Spiritual] (Book of Void, p.191) - not monk-specific,
doesn't touch Kiho/School mechanics, skip it. New Tattoos (Book of Air
p.195 Cloud/Whisper, Book of Fire p.192 Volcano, Book of Water p.189 Wave)
- these extend the existing Togashi/Ise Zumi tattoo system (category-1),
not the Brotherhood framework this feature is building; worth a separate,
smaller follow-up prompt rather than folding into this one.

**Stop here and confirm before Phase 6.** Test against at least one new
Basic School end-to-end (Order of the Wind is the simplest, no special
cases) and confirm the new Kiho appear correctly grouped/gated in the
quick-add dropdown alongside the Phase 1 Core Rulebook entries.

---

## Phase 6 - Alternate Paths

This is new machinery, not more data for Phase 1/2/5's shape. An
**Alternate Path** replaces one Rank of an *existing* School (any School,
not just Brotherhood ones) with a different Technique, usually with extra
requirements. The four owned Elemental books plus The Great Clans surfaced
six of them already in scope - this isn't a hypothetical future need:

| Path | Source | Replaces | Rank |
|---|---|---|---|
| Student of Hitsu-do [Monk] | Book of Fire, p.179 | Any Brotherhood Monk 2, Kikage Zumi 2, Kuni Witch-Hunter 2, Asako Henshin 2 (list of 4 named Schools) | 2 |
| The Transcendent Brotherhood [Monk] | Book of Fire, p.181 | Any Tattooed Order 2 (i.e. Togashi Tattooed Order) | 2 |
| The Servants of Mercy [Monk] | Book of Water, p.187 | Order of Jurojin's Blessing 4, **or** any pacifistic Brotherhood School at Rank 4 (named School *or* a qualitative tag) | 4 |
| Order of Ebisu [Monk/Courtier] | Book of Void, p.191 | Thousand Fortunes Monk 3, Jurojin's Blessing Monk 3 (list of 2 named Schools) | 3 |
| Abbot [Monk] | Book of Void, p.193 | Any Brotherhood Rank 4 or higher (broadest case - any category-2 School at all) | 4+ |
| Togashi Defender [Monk] | The Great Clans, p.104 | Togashi Tattooed Order 3 | 3 |
| Brotherhood Spy [Monk] | Imperial Histories, p.69 | **Any** Brotherhood Monk School at Rank 2 (broadest case yet - every category-2 Basic School this feature catalogues, Core Rulebook's 6 plus Phase 5/7's 13 more) | 2 |

The `Replaces` column is the hard part: it's not always "one named School,
one named Rank." Three shapes show up above - a single named School+Rank,
a short list of named School+Rank pairs, and a qualitative match ("any
pacifistic Brotherhood School," "any Brotherhood [School] Rank 4 or
higher"). A qualitative match needs something to match *against* - e.g. a
`tags` array on `BROTHERHOOD_SCHOOL_LIBRARY` entries (Servants of Mercy's
own sibling School, Order of Jurojin's Blessing, would need `tags:
['pacifistic']`; nothing else currently would). Abbot and Brotherhood Spy
are both the no-tag-filter version of a qualitative match - "any
Brotherhood School" at their respective Ranks - so between them they're a
good end-to-end smoke test for the matcher: if a School gets added to
`BROTHERHOOD_SCHOOL_LIBRARY` later (Phase 5, Phase 7, or a future
sourcebook) and it doesn't automatically become eligible for both Paths at
the right Rank, the matcher is checking the wrong flag.

Build:

1. Before writing code, propose the data model for `ALTERNATE_PATH_LIBRARY`
   entries and for how `Replaces` matching works across all three shapes
   above - this is the same "review the design before landing it" ask
   Phase 4 made, for the same reason (it touches shared School-Rank
   tracking, and getting the matcher wrong is easy to do quietly).
2. Each entry needs at least: `name`, `monkTag` (some are `[Monk]` only,
   Order of Ebisu is `[Monk/Courtier]` - don't drop the second tag, but it
   doesn't need to unlock anything in this sheet's Courtier-side code,
   just don't mis-flag it as monk-only if that matters elsewhere),
   `replaces` (in whatever shape Step 1 settles on), `techRank`,
   `requires`, and `tech` (the replacement Technique text).
3. Wherever the sheet currently resolves "what Technique does School Rank N
   grant" (the `f_schoolTechGranted` pattern Phase 4 also touches), an
   Alternate Path needs to be selectable as a substitute at that specific
   Rank once its `requires` are met - this is a UI decision (a toggle next
   to the normally-granted Technique, a separate quick-add entry, etc.)
   worth proposing alongside Step 1's data model rather than guessing.
4. Abbot's Technique explicitly grants Status 4.0 within the Brotherhood -
   flag whether that should touch this sheet's Status field automatically
   or just show as descriptive text; either is defensible, but pick one on
   purpose.
5. Student of Hitsu-do's sidebar text explicitly says the Path is normally
   restricted to Monk Schools, but the GM may open it to any samurai who
   can find a Hitsu-do dojo (an explicit optional-rule callout, same as
   Phase 1's non-Brotherhood Kiho rule) - worth the same kind of code
   comment, not a toggle, for this pass.

**Stop here and confirm before considering this feature complete.** Test
Togashi Defender against an existing Togashi Tattooed Order character (the
simplest case: one named School, one named Rank, no qualitative matching)
before touching the harder cases.

---

## Phase 7 - New Basic Schools from Emerald Empire and Imperial Histories 2

The player also owns Emerald Empire, Imperial Histories, and Imperial
Histories 2 (checked the same way as Phase 5: text-layer extraction,
page numbers cross-checked against each book's own Table of Contents).
Emerald Empire and Imperial Histories 2 each add more Basic Brotherhood
Schools - Phase 5's exact shape, more data entry against the existing
`BROTHERHOOD_SCHOOL_LIBRARY` schema. Imperial Histories itself turned out
to contain something structurally different (era-variant restatements of
two Schools already on the sheet, not new ones) - that's Phase 8, not
here, and matters more than this phase does.

**New Basic Brotherhood Schools to add:**
- Emerald Empire, pp.206-207: **Shinmaki Order** - Devotion: Shintao,
  Benefit +1 Void, Honor 6.5. This is the 7th Basic School the previous
  pass's "Other sourcebooks" note predicted sight-unseen; confirmed now.
- Imperial Histories 2, p.29: **First Dawn Scholars** - Devotion:
  Fortunism, Owl Clan-affiliated. Its Technique grants "one additional
  Mystical kiho" as part of the Technique text - same
  Technique-granted-Kiho, exempt-from-cap pattern as Phase 1 step 6
  (Kuni Witch-Hunter/Asako Inquisitors/Dark Paragons), a fourth confirmed
  example.
- Imperial Histories 2, p.103: **Order of the Five Rings** - Devotion:
  Shintao, Benefit +1 Awareness, Honor 4.0. Ordinary flat Technique, no
  quirks.
- Imperial Histories 2, p.287: **Fudoist Order** - two schema exceptions
  worth handling deliberately rather than shoehorning into Phase 2's
  shape: **`Devotion: None`** (every other Basic Brotherhood School in
  this library has exactly one Devotion; `BROTHERHOOD_SCHOOL_LIBRARY`'s
  schema should allow `devotion: null` rather than assuming the field is
  always populated), and a **character-creation Honor choice** ("Starting
  Honor: 1.5 or 4.5" - the player picks a Rank at creation, and the
  Technique's bonus scales off the gap between the character's Honor Rank
  and an opponent's). Phase 3 currently sets Honor/Glory/Status as fixed
  values per School; this is the first School that needs one of them to be
  a player choice instead. Model it as a `honorChoices: [1.5, 4.5]` array
  Phase 3's apply-School logic can present as a pick rather than a single
  fixed number - don't just pick one value and hardcode it.

**Setting context worth keeping as a `desc`/`setting` note, not a gate:**
three of these four Schools (First Dawn Scholars, Order of the Five Rings,
Fudoist Order) are each tied to a specific alternate-history or optional
campaign setting the source book presents (the "Togashi Dynasty" alternate
timeline, the historical "Heresy of the Five Rings" era, and the Colonies
/ "Age of Exploration" setting, respectively) rather than being generally
available in every campaign. Nothing about that changes how they're built
- they're mechanically ordinary Basic Schools - but it's worth carrying
the source context in the entry's description so a player picking a
School understands why it might not fit their GM's game, the same spirit
as the existing sheet leaving GM-optional rules visible-but-labeled rather
than hidden.

**Not added this phase - flagged as the Phase 1 step 6 pattern instead:**
Dark Paragons [Monk] (Emerald Empire, p.207) is a 3-Rank **Advanced**
School for the Spider Clan (Requirements: a Trait at 5+, Lore: Theology
4+, the Dark Paragon Advantage, Honor Rank 4+, and the ability to make a
melee attack as a Simple Action - i.e. you graduate into it from an
existing School, the same shape as Asako Inquisitors), not a Basic
Brotherhood School - it doesn't belong in `BROTHERHOOD_SCHOOL_LIBRARY`.
Its Kiho-granting Ranks and Void-Point-activation override are already
folded into Phase 1 step 6 above as a third worked example; building
Advanced-School support at all is still out of scope for this pass.

**Stop here and confirm before Phase 8.** Test Shinmaki Order end-to-end
(the simplest of the four - no schema exceptions) before Fudoist Order's
Honor-choice mechanic.

---

## Phase 8 - Flag for review: Imperial Histories' era-variant Dragon Schools

Not a build phase - a decision that needs to happen before anything below
it is written, because it touches data that already exists on the sheet.

Imperial Histories pp.214-216 (Chapter Seven, presented as toolkit content
for running games in different historical eras) restates **two Schools
already in `SCHOOL_LIBRARY`** - Hoshi Tsurui Zumi Order and Hitomi Kikage
Zumi Order, both Dragon Clan, both already flagged category-1 on this
sheet - with different mechanics than whatever the sheet currently has:

- **Hoshi Tsurui Zumi [Monk] (p.214-215):** its own text carries an
  explicit override - *"Though the Tsurui Zumi is a Dragon affiliated
  School, mechanically this School is treated as a Brotherhood of Shinsei
  School (as described on page 231 in the L5R 4th Edition Core
  Rulebook)."* This version has **one flat Technique** (not a 5-Rank
  list), starts with 1 Tattoo plus **2 Kiho** (not the usual Brotherhood
  3), and buys further Kiho "normally as per the rules for a Brotherhood
  of Shinsei monk" - i.e. at the 1x rate, not the 1.5x non-Brotherhood
  rate this sheet's category-1 Schools use. This directly conflicts with
  the sheet's current category-1 classification for this School, and it
  plausibly explains the oddity flagged in this prompt's Constraints
  section (Hoshi Tsurui Zumi Order having only one `tech` array entry
  while its Dragon neighbor has five) - not a data-entry gap after all,
  but a hybrid Basic-School shape this Imperial Histories version makes
  explicit and the sheet's existing data may already be reflecting.
- **Hitomi Kikage Zumi [Monk] (p.215-216):** a full 5-Rank Technique list
  (Rank 1 The Gift of the Lady through Rank 5 Strike the Summit), ordinary
  category-1 shape, no Special override - ordinary in structure, but still
  a second, different statblock for a School the sheet already has one
  version of.

Both are explicitly presented as alternate-era versions, not corrections -
Imperial Histories' whole premise is "the same-named School can look
different depending which point in Rokugan's history you're playing," and
these two are offered "with a name change... in many different eras of
play." That means there may legitimately be two valid, different, correct
statblocks for the same School name, and which one belongs on this sheet
depends on which era the player's game uses - not something to resolve by
picking one silently.

**Before building anything else that touches these two Schools:** ask the
player (a) which era/version of Hoshi Tsurui Zumi Order and Hitomi Kikage
Zumi Order the existing `SCHOOL_LIBRARY` entries currently represent (this
determines whether the "only one tech entry" oddity is in fact already
correct, per the reasoning above), and (b) whether they want the Imperial
Histories versions added as a second era-tagged option, replacing the
existing entries outright, or left out entirely. Whatever the answer,
don't let Phase 5's `BROTHERHOOD_SCHOOL_LIBRARY` or Phase 6's
`ALTERNATE_PATH_LIBRARY` silently absorb Hoshi Tsurui Zumi as a
category-2 School based on this one sourcebook's override text without
that conversation happening first - it would change how an existing
character on this sheet is allowed to buy Kiho.

---

## Other sourcebooks that touch monks (not owned - out of scope for now)

For future expansion, per `magicalsamurai.wikidot.com/schools-monk`'s
sourcing notes:
- **Secrets of the Empire** - Order of Peaceful Repose (8th Basic School)
  plus three more Alternate Paths, same subsystem as Phase 6 (Barefoot
  Brethren, Pure Song Shrine, Silent Ones).
- **Book of Earth** - the one Elemental book not yet owned. Per the same
  wiki's sourcing notes it adds 2 new monastic Orders (more
  `BROTHERHOOD_SCHOOL_LIBRARY` entries, Phase 5's pattern) plus more Earth
  Kiho (Phase 5's `KIHO_LIBRARY` pattern) - structurally nothing new, just
  more of what Phase 5 already builds.

Everything else the wiki's sourcing notes previously flagged as unowned
(Emerald Empire, Imperial Histories, Imperial Histories 2) is now owned
and folded into Phase 7/8 above. Don't source Secrets of the Empire or
Book of Earth from the wiki alone if the player doesn't own the book -
same "don't invent/half-source data" principle as everything else here.


---

## ADDENDUM - written after the build, 2026-09-04

**This file is an EARLIER REVISION of the brief.** The revision the work was actually driven
from is longer: it adds a Phase 9 verification pass, a "Sourcebook coverage status" section, a
"Running totals" table, and Secrets of the Empire to Phase 7's title. If you still have that
newer text, prefer it and treat this file as history. What follows is the part a verification
pass cannot do without: the corrected totals and the decisions that deliberately depart from
the brief.

### Corrected running totals

The newer revision's summary table contains three arithmetic errors. These are the figures the
build was verified against, each counted from the shipped file:

| Thing | Brief says | Actually | Note |
|---|---|---|---|
| Basic Brotherhood Schools | 22 | **22** | correct |
| Monk Alternate Paths | 12 | **12** | correct |
| New Kiho beyond the Core lists | 26 | **29** | the brief's own per-book breakdown (Air 9, Earth 8, Fire 3, Water 3, Void 6) sums to 29 |
| Paths declaring a Devotion | 3 | **5** | it names Barefoot Brethren, Pure Song, The Silent Ones - but Servants of Mercy prints "Devotion: Fortunist (Jizo)" (Book of Water p.187) and Order of Ebisu prints "Devotion: Fortunist" (Book of Void p.191) |
| Core Rulebook Kiho | not stated | **44** | Air 9, Earth 9, Fire 9, Water 8, Void 9 |
| `KIHO_LIBRARY` total | - | **73** | 44 + 29 |

`grantsExemptFromCap` sources: the brief catalogues 5. **Two are modelled** (First Dawn
Scholars, Dark Path Sohei) because they are a School and a Path. The other three - Kuni
Witch-Hunter Rank 4, Asako Inquisitors Rank 1, Dark Paragons Ranks 1 and 3 - live in Advanced
School Technique text, and the brief puts Advanced Schools out of scope. The fields exist on
both libraries, so adding them later is pure data entry.

### Rules decisions that deliberately differ from this brief

Do not "correct" these back. Each was settled against the printed rules.

1. **The known-Kiho cap counts PURCHASED Kiho only.** p.231: bonus Kiho are bought with XP and
   "a character may never know more **of these** than his cumulative School Rank in all Monk
   Schools". Starting and per-Rank granted Kiho sit outside it. A total-known cap would be
   overflowed immediately by the per-Rank grant beside it.
2. **Shrine of the Seven Thunders' +1 applies to the eligibility total** (Ring + School Rank)
   for its chosen Element. The book says "Insight Rank", which appears nowhere in the p.261
   formula and would make the Technique inert.
3. **Hoshi Tsurui Zumi carries `brotherhood: true`.** Its own Special clause (Imperial Histories
   p.214) says it "is treated as a Brotherhood of Shinsei School". Both Dragon monk entries were
   verified field-for-field against Imperial Histories pp.214-216 and both already WERE those
   versions - so its single `tech` entry is correct, not a data gap. Do not invent four more.
   Consequence: its own benefit is +1 Void on top of the monk baseline, so it starts at Void 4.
   Shinmaki Order (Emerald Empire p.206) is the second such School.
4. **p.261 vs p.266 on non-Brotherhood eligibility.** The book contradicts itself; the specific
   p.266 sidebar governs. Other Monk Schools use Ring + School Rank at 1.5x, Shugenja use Ring
   alone at 2x. Ninja are the sidebar's fourth case and are deliberately not modelled.
5. **Order of Jurojin's Blessing and Order of Peaceful Repose are NOT tagged `pacifistic`.**
   Both were checked. Book of Water p.187 says the Servants of Mercy are pacifists "in contrast
   to" Jurojin's Blessing.
6. **Abbot's Status 4.0 is descriptive**, not written to the Status field - it is standing
   within the Brotherhood, and writing it would overwrite the Status 0 a monk starts with.
7. **The Fudoist Order's bonus is not auto-applied.** It scales off the OPPONENT'S Honor Rank,
   and the sheet models one character with no opponent. Both of its creation choices are
   captured and shown.

### Things flagged and deliberately left unbuilt

- **Order of the Nameless Gift** grants restricted bonus Void Points per day. A second,
  restricted pool is new machinery, not data entry; recorded with `enforced: false`.
- **The Order of Eternity has no printed Honor.** Verified against the page, not assumed from a
  bad extraction. `honor: null`, and Apply School leaves the field alone.
- **Active-at-once Kiho limits, atemi delivery and the Staff-Kiho weapon requirement** are
  reference text, per the brief's instruction not to build combat state.

### Phase 9 verification checklist, as given in the final revision

Run as a **separate pass in a fresh context**. Report findings; **fix nothing** until reviewed.

1. **Referential integrity.** Every named School in every `replaces` clause resolves; every
   Kiho's `schools` resolves; every `devotion.type` is Shintao, Fortunist or null. The Dark Path
   Sohei case ("Order of the Spider 2" vs "The Order of the Spider Monks [Monk]") is the known
   instance - note `assertPathSchoolsResolve()` already asserts this class at load.
2. **Counts.** Against the corrected table above, not the brief's.
3. **Rules conformance.** No Brotherhood School has a five-Rank Technique list. No Monk School
   carries affinity, deficiency or spell fields. No Kiho has an unreachable Mastery. Every
   Kiho's `ring` matches the Element section it came from.
4. **Scope fence.** Grep the diff for `slot`, `prepare`, `memoris`, `memoriz`, `affinity`,
   `deficiency`, `scroll` in Kiho/Monk code paths. Report hits with lines; remove nothing.
5. **Regression.** Abbot and Brotherhood Spy resolve against 22 Schools - confirm and spot-check
   three. `characterCasterLock()` still correct for non-monks. Kata unchanged. Saved characters
   still load.
6. **Output.** A findings list tagged data / rules / scope / regression, with file and line and
   the minimal fix. No fixes applied.

### Bugs found by browser testing that automated tests missed

Worth knowing what the 554-assertion suite is structurally blind to:

- a one-Rank lag, because `recalcAll()` ran rank-dependent displays before writing `f_rank`
- a padlock that labelled but never `disabled` the option
- Technique rows stacking when swapping Alternate Paths
- `hasSkillEmphasis` inspecting only the first row of a duplicated Skill

All four were invisible to tests that set state directly and call renderers explicitly. Drive
the real UI.
