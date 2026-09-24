# PART K — Phase 11.2.1: Wizard Skills and Advantages

The creation wizard's second stage, built 24 September 2026. It adds two steps before Review:
**Skills** and **Advantages & Disadvantages**. With it the wizard covers a whole starting
character: Name, Clan, Family, School, Rings & Traits, Skills, Advantages & Disadvantages, Review.

It is its own point release, per the folder convention for an increment, and extends Phase 11.2
from outside without editing 11.2's file.

**The same rule as 11.2: new screens, no new rules.** A harness again makes the same choices
through the wizard and by hand on the sheet, and requires identical saved data.

## The two steps

**Skills**

| Part | What the player sees | What actually does it |
|---|---|---|
| **Your School's free choices** | One box per "any one … Skill" the School grants (Isawa Shugenja: a Lore Skill and a High Skill). Pick a Skill, type its subject where it needs one ("Lore: History"), press Add. "Choose again" undoes it | The sheet's own `#skillQuickAdd`, then the new row's own name, Rank and School inputs and their events: Rank 1, ticked as School, so the first Rank is free |
| **Your Skills** | Every Skill with − Rank +. − stops at the free points Apply School gave | Each row's own Rank input and its events |
| **Add a Skill** | Any Skill from the sheet's own list, at Rank 1 | The same picker and row inputs, not ticked as School |

The free choices are found by the same test Apply School uses to skip them: a School Skill entry
that starts "any". **The picker for a free choice is narrowed** to the Skill or category it names
when that name is one of the sheet's own Skills or categories: "any one Lore Skill" offers only
Lore, and "any one High Skill" offers the sheet's High group. Otherwise it offers every Skill.
This narrowing is a presentation choice, not a rule; the sheet itself never checks a free choice.

**Changing School afterwards** removes the Skills added for the old School's free choices, since
they were that School's entitlement.

**Advantages & Disadvantages**

The sheet's own two pickers, copied as they are, including any option Phase 4.5.5 greys out.
Picking one adds it through the sheet, so a configurable entry (Elemental Blessing and the rest)
still opens its own question above the wizard, and Next waits for it. Each chosen entry is listed
with "costs N XP" or "gives N XP" and a Remove button.

**Both steps** show the experience left and lock Next only on an **overspend** error from Phase 5's
check. Unfilled free choices are noted, never blocking, because the sheet allows choosing later.

**Review** now also lists Skills, Advantages and Disadvantages, and no longer says to finish them
on the sheet. Finish reports that the character is ready.

## QA

Measured 24 September 2026, headless Chromium at 390 × 844, `NODE_PATH=/opt/node22/lib/node_modules`.

| Measure | Result |
|---|---|
| Own suite | **32/32** (`qa/wizard2-harness.js`): step order, free choices against Phase 5's validator (which recovers them by its own code), narrowing, subject, Choose again, Skill floor and raise, adding, overspend, School change, mirrored pickers, a configurable Advantage's question, Remove, touch targets, Review, Finish, and **CW1-SAME-AS-BY-HAND** |
| 11.2's suite | **43/43** with this phase present and with it removed, after the navigation change in ROLLBACK |
| Combined | **2,268/2,268**: 2,236 retained + 32 new |
| Build | **3,003,661 bytes**, SHA-256 `ee04939670db1817823f709974ef13207282d2a0f7df87c26e3c760883eb2939` |
| Surgical removal | **Byte-identical** to `9244163e…` (commit `5c50e87`) |
| Removal order | 11.2's remover **refuses** while this phase is present |
| Remover fixtures | **15/15**, no skips |
| Ownership | `qa/feature-dependencies.py` exits 0 |

**Each part is load-bearing** (`qa/verify-variants.py`):

| Variant | Own suite | Fails |
|---|---:|---|
| Previous build (phase removed) | 0 of 3 scenarios | every scenario |
| Switch off | 0 of 13 run | every check on the two steps |
| Free choices not narrowed | 29/31 | the two narrowing checks |
| Free choice not ticked as School | 29/32 | the slot-row checks and `CW1-SAME-AS-BY-HAND`: the Skill then costs XP |
| No overspend gate on Skills | 30/31 | `CW1-OVERSPEND-BLOCKS` only |
| Advantage step does not wait for its question | 31/32 | `CW1-CONFIG-ASKS-ABOVE` only |
| New School keeps the old free choices | 30/31 | `CW1-SCHOOL-CHANGE-CLEARS-SLOTS` only |
| Review keeps the "not yet" note | 30/31 | `CW1-REVIEW` only |
| No stylesheet | 31/32 | `CW1-TOUCH-TARGETS` only |

Counts out of 31 were measured before the touch-target check was added and are quoted as
measured. **The first variant run found the blind spot:** with no stylesheet, all 31 checks
passed. `CW1-TOUCH-TARGETS` (every new control at least 44px tall) was added and the variant now
fails on it alone.

## Found while building

- **A Skill the player ticks as School by hand has no free-point floor**; only Apply School's own
  grants carry one. The sheet then counts the first Rank free from the tick. So − stays enabled on
  a free-choice Skill, exactly as on the sheet. The first cut of the harness assumed otherwise and
  was corrected, not the wizard.
- **"Experience left: 42 of 40"** read wrong once a Disadvantage gave experience back. These steps
  say "Experience left: 42 · started with 40". **Phase 11.2's Rings & Traits step still uses the
  "of" wording**; it is 11.2's own text and is left for the device check rather than changed here.

## Not verified

- **Not tried on a real device.** Headless Chromium only, with fallback fonts.
- Only Elemental Blessing's question was driven; other configurable entries use the same waiting
  code. Emphases are not in the wizard; they stay on the sheet.
