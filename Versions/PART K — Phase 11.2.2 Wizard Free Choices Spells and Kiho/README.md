# PART K — Phase 11.2.2: Wizard Free Choices, Spells and Kiho

The creation wizard's third stage, built 25 September 2026 at the owner's request: "if there are
any free choice of skills then you are prompted to choose an appropriate skill … Same with
shugenja/monks they may get the choice of free skills, or spell scrolls or Kiho where
appropriate."

The wizard now **walks the player through every choice their School leaves to them**, so none is
forgotten. It is its own point release, per the folder convention, and extends Phases 11.2 and
11.2.1 from outside, by property, without editing either file.

**Still no new rules.** Every choice goes through the sheet's own controls, and two harness
checks (`CW2-SAME-AS-BY-HAND-SPELLS`, `CW2-SAME-AS-BY-HAND-MONK`) make the same choices by
hand and require identical saved data.

## What the player sees

| Part | What the player sees | What actually does it |
|---|---|---|
| **Free Skill choices, every form** | One box per Skill the School grants. Kakita Bushi: "Any one Bugei or High Skill", offering High, Bugei and Weapon Skills. "Any two Skills" is two boxes. "Any 1 Skill (not Low)" leaves out Low Skills | The School's own text, read by this phase. Each pick still goes through 11.2.1's by-hand path: the sheet's Skill picker, Rank 1, ticked as School |
| **The School's Lore** | Schools listing "Lore (pick one)" get a box asking for the Lore's subject | Apply School's own "Lore" row, renamed through its name box, and its placeholder "pick one" Emphasis removed with its own ✕ |
| **Spells** (Shugenja Schools) | A step to pick spells, grouped by Element. Each one appears as "scroll in Equipment". Remove takes both away | The Spell Scrolls list's own + Add, then the Technique picker's own spell option |
| **Kiho** (Brotherhood monk Schools) | A step with the sheet's own "Free Kiho picks: N of M left" line and its Kiho options, each marked "free pick" or with its XP price | The Technique picker's own Kiho option, so the sheet decides what is free |
| **A reminder, never a block** | Next on a step with a choice still open first points at it: a "Still to choose" box at the top, the open boxes outlined, and the button reads "Leave for later ›". Pressing it again moves on | Wizard only; nothing is written |
| **Review** | "Still to choose (you can finish these on the sheet)", listing every open choice by step, or "Every choice your School leaves to you is made." | Wizard only |

The Spells and Kiho steps appear only for a School that has them. They come and go if the School
is changed.

### Which Skills a free choice offers

This is a **presentation choice**, not a rule: the sheet itself never checks a free choice. It
maps each category word to the sheet's own Skill picker groups:

| The School says | Offered |
|---|---|
| High | High |
| Bugei | Bugei, Weapon and Weapon (Low): Weapon Skills are Bugei Skills |
| Weapon | Weapon and Weapon (Low) |
| Low | Low and Weapon (Low) |
| Merchant | Merchant |
| non-Low, (not Low), non-Bugei | every group except those |
| A Skill's name (Lore, Craft, Artisan, Perform, Acting) | that Skill |
| Only "Skill" | every Skill |

A library sweep reads **all 112 free choices across the 104 Schools** the wizard offers. It
requires every choice that names a category to narrow the list, and no choice to be left split
by a comma.

### Spells: what the sheet does not know

**The sheet does not record how many spells a School starts with, or of which Elements.** No
School entry in the library carries that data, and the sourcebooks are not available in a cloud
session. So the Spells step says so and points to the School's entry in the rulebook, rather
than guessing. It counts as open until at least one spell is chosen. Adding each School's
starting spells to the library is its own data task, needing the books.

## QA

Measured 25 September 2026, headless Chromium at 390 × 844, `NODE_PATH=/opt/node22/lib/node_modules`.

| Measure | Result |
|---|---|
| Own suite | **51/51** (`qa/wizard3-harness.js`): Kakita Bushi end to end (the owner's example), the library sweep and each free-choice form, Isawa Shugenja's Spells step, the Order of the Nameless Gift's Lore and Kiho, touch targets, and both by-hand comparisons |
| 11.2.1's suite | **32/32** with this phase present and with it removed, after the navigation change below |
| 11.2's suite | **43/43** with this phase present, unchanged |
| Combined | **2,319/2,319**: 2,268 retained + 51 new |
| Build | **3,030,333 bytes**, SHA-256 `d43fa8b029d13facaf9f2693e5d85ade42291aa5d95389545954b585cd5ca990` |
| Surgical removal | **Byte-identical** to `ee049396…` (commit `7f25263`); then removing 11.2.1 reaches `9244163e…` exactly |
| Removal order | 11.2.1's and 11.2's removers both **refuse** while this phase is present |
| Remover fixtures | **15/15**, no skips |
| Ownership | `qa/feature-dependencies.py` exits 0 |

**Each part is load-bearing** (`qa/verify-variants.py`, all eleven fail where expected):

| Variant | Own suite | Fails |
|---|---:|---|
| Previous build (phase removed) | 0 of 6 scenarios | every scenario |
| Switch off | 10/21 | step lists, slots, reminders, both by-hand comparisons |
| Split choices not joined | 49/51 | `CW2-LIBRARY-NO-SPLIT-CHOICE`, `CW2-FORM-JOINED` |
| Categories not read | 48/51 | `CW2-KAKITA-OPTIONS`, the library sweep, `CW2-FORM-FROM-LIST` |
| One box per choice, not per Skill | 48/51 | the monk's two boxes, its reminder and its Review list |
| No reminder on Next | 20/25 | the reminders; three walks stop on the wrong step |
| Spell learned without its scroll | 42/47 | the sheet's own picker refuses it: nothing is learned |
| Remove leaves the scroll behind | 50/51 | `CW2-SPELL-REMOVED-WITH-SCROLL` only |
| Named Lore kept through a School change | 50/51 | `CW2-LORE-GOES-WITH-SCHOOL` only |
| Kiho step for everyone | 47/51 | the Bushi and Shugenja step lists, and the Kakita walk after Skills |
| No stylesheet | 50/51 | `CW2-TOUCH-TARGETS-LORE` only |

**Found by looking, not by a check:** a screenshot showed the Lore subject box at about 34px
tall, under the 44px touch minimum, and no check covered it. The box was raised to 44px and
`CW2-TOUCH-TARGETS-LORE` added; the no-stylesheet variant now fails on it.

## Found while building (not fixed here)

- **Apply School adds placeholder rows for two Schools** whose free choice the library writes
  across commas. Tsi Smith [Artisan] gets rows named "Bugei", "or Merchant Skill" and "two ranks
  in any one Craft Skill". Kasuga Smuggler [Courtier] gets "Merchant" and "or Low Skill". The
  wizard reads the choice correctly, but the rows are trunk behaviour (`080-identity-build-ui.js`)
  and stay. They want their own BUGFIX folder.
- **Two School Skill names the sheet does not know:** Mirumoto Bushi and Shiba Bushi list
  "Theology" (the sheet's name is "Lore: Theology"), and Kaiu Engineer lists "War Fans" (the
  sheet's is "War Fan"). Apply School then adds a row with no Trait. Library data; same BUGFIX.
- **Tsi Smith's "two ranks in any one Craft Skill"** is offered as one box at Rank 1, the same
  as choosing it by hand. The sheet has no way to make a second Rank of a free choice free.
- **Phase 5's validator (Part J)** counts "any two Skills" as one free choice and repeats the
  split text for the two Schools above. Its finding is a note, not an error, and was left alone.

## Not verified

- **Not tried on a real device.** Headless Chromium only, with fallback fonts.
- Spells: Isawa Shugenja only. Kiho: the Order of the Nameless Gift only; the Seven Thunders'
  one-Element rule for starting Kiho is the sheet's own and was not driven here.
- The Togashi Tattooed Order's tattoos are not a Kiho free pick and have no step.

## Device checks (for the iPhone)

1. **Kakita Bushi** (Crane, Kakita). On Skills: one box, "Any one Bugei or High Skill", listing
   High, Bugei and Weapon Skills only. Next without choosing stays put, shows "Still to choose"
   and reads "Leave for later ›"; pressing it again moves on, and Review lists the open choice.
   Go back, choose one (e.g. Spears): it is added at Rank 1, ticked School, experience unchanged,
   and Review then says every choice is made.
2. **Isawa Shugenja** (Phoenix, Isawa). A Spells step appears after Skills. Add Sense and a few
   of your School's spells; each shows "scroll in Equipment"; Remove takes one away. After
   Finish, Equipment has the scrolls and the Techniques tab has the spells with Cast buttons.
3. **Order of the Nameless Gift** (Brotherhood of Shinsei). Skills shows two "Any two Skills"
   boxes and a Lore box; set a subject. A Kiho step shows the free-pick count; a pick marked
   "free pick" lowers it. Changing to another monk School removes the named Lore row.
4. **Any Bushi**: no Spells or Kiho step.
5. **Fit**: the reminder box, the outlined box and every button on a real screen and font.
