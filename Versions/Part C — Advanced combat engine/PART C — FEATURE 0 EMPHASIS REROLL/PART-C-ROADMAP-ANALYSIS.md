# Part C Roadmap (Features 1–7) — Pre-Implementation Analysis

Analysis requested before implementation. Findings are grounded in the actual Part C Feature 0
build (`VERSION A`) and in RAW sourced from magicalsamurai.wikidot.com (Stances, Void Points,
Maneuvers, Equipment).

**Verdict:** the roadmap is buildable, but **three global rules cannot all hold simultaneously**
as written, and two features overlap. Five decisions are needed before Feature 1 starts.

---

## A. Blockers — need a decision before coding

### A1. "All features must be isolated decorators" is impossible for Features 2 and 4

RAW, Void Points page, verbatim:

> "…the Void Point expenditure **must be declared prior to the roll being made**."

Full Attack (+2k1), Center (+1k1 plus Void Ring), and Void spending (+1k1) are all **pre-roll dice
pool modifiers**. Feature 0 worked as a post-render decorator because a re-roll operates on dice
that already exist. Adding dice does not have that property, because of the Ten Dice Rule:

| | Correct (pre-roll) | Post-render decorator |
|---|---|---|
| Kenjutsu 7 + Agility 3, Full Attack | 10k3 raw → **+2k1 → 12k4 → Ten Dice Rule → 10k4 +2** | 10k3 rendered, then bolt on 2 dice → **12k4, rule never applied** |

The Ten Dice Rule must see the *raw* pool. Once `rollDicePool()` has run, that information is gone.

**This is not a reason to modify frozen code.** `rollDicePool` and `showRollResult` stay frozen;
the *orchestration wrappers* (`rollSkill`, `rollWeaponAttack`) are not frozen and are the correct
place to consult a pre-roll modifier registry — exactly where Feature 0's hook already sits.

**Proposal:** add a **pre-roll modifier pipeline** as an explicit architectural layer:

```
getPreRollModifiers(context) -> [{source, rolledDelta, keptDelta, totalDelta, note}]
```

Wrappers sum the deltas, adjust the raw pool, then call the untouched `rollDicePool`. Post-render
decorators (Feature 0) continue to work unchanged on top. Two mechanisms, clearly separated.

---

### A2. Wound penalties are TN increases — and attack rolls in this sheet have no TN

`WOUND_LEVELS` in the sheet already states the RAW correctly:

> Nicked: "**Increase the TN of all rolls made by +3** while Nicked."

But the sheet only ever passes a `tnConfig` to `showRollResult()` for **Spell Casting Rolls**.
Attack rolls have no TN — the target's Armor TN is the GM's number and was deliberately left
manual in Part B.

So Feature 3 as written ("auto-apply penalties to Skill Rolls and Attack Rolls") has no correct
target. Three options:

| Option | Behaviour | RAW-faithful |
|---|---|---|
| **3a** Display only | Modal shows "Wounded: Hurt — all TNs +10"; player/GM applies it | Yes — fully |
| **3b** Subtract from roll total | Roll total reduced by the penalty | **No** — common house rule, mathematically not the same |
| **3c** Apply to sheet TNs only | Adjusts the character's own displayed TNs, not rolls | Partial |

**Recommendation: 3a**, with 3b available behind a documented toggle (an A/B build, as with
Feature 0). Applying it silently as 3b would be a rules error dressed up as automation.

---

### A3. Features 6 and 7 overlap completely

Feature 6 (Ammo Tracking) scope includes:
- "Add off-hand penalty interaction (RAW)"
- "Add dual-wield Armor TN bonus (RAW)"

Both are Feature 7's entire scope. **Recommendation:** Feature 6 = ammunition only;
Feature 7 = handedness, off-hand penalties, dual-wield Armor TN. Feature 7 then consumes
Feature 6's ammo state where a thrown/ranged off-hand weapon is involved.

---

### A4. "No save changes" makes ammo, stance and handedness non-persistent

The global rules require no new `f_` fields *and* no change to save/load shape. `collectData()` is
frozen, so **no new top-level key can be added either**. The consequence:

| State | Persists across reload? |
|---|---|
| Feature 0 re-roll flag | Correctly no — transient by design |
| Stance (F2) | **No** |
| Ammo count (F6) | **No** |
| Handedness / dual-wield (F7) | **No** |

Ammo counts especially are something players will expect to survive a save. Options:

| Option | Trade-off |
|---|---|
| **4a** Session-only | Honours every global rule; ammo resets on reload |
| **4b** `localStorage`, keyed by character name | Persists per-browser, does not travel with the exported JSON; zero save-format change |
| **4c** Unfreeze `collectData` for one additive `combat:{}` key | Persists properly and old builds ignore it; **violates the stated freeze** |

**Recommendation: 4b** — it satisfies the letter and intent of "save/load shape preserved" and
"removable without migration", while giving ammo real persistence at the table.

---

### A5. There is no Round tracker, and three features need one

RAW, Void Points page: *"A character may normally only spend **one Void Point per Round**."*
The roadmap's Feature 4 does not mention this limit. Meanwhile:

- **F2** needs "stance persistence per round" and Center's "on the round following"
- **F4** needs once-per-Round Void enforcement
- **F5** needs "once per encounter" / "once per round" technique gating

**Recommendation:** build a shared **Combat Round Context** as a prerequisite (round counter,
new-round reset, per-round spend ledger) *before* Features 2/4/5. Implementing it three times
inside three features guarantees divergence.

---

## B. Corrections to specifics in the roadmap

### B1. "Range Bands" is not RAW L5R 4e

L5R 4e uses explicit distances in feet, not bands. The actual mechanics (Equipment page):

- Bows list a max range; may fire to **2× that range at −1k0 per extra 50 ft** *(a dice penalty)*
- Firing at a target **in melee with you: −10 to the attack total** *(a flat total penalty)*
- Thrown weapons have fixed maxima (knives 20 ft, shuriken 25 ft, nage-yari 50 ft, etc.)
- Dai-kyu: +10 TN on foot. Yumi / Han-kyu: +10 TN mounted

Two different mechanisms — one changes dice, one changes the total. Part B already stores
`range` on every ranged weapon, so the data exists.

**Recommendation:** build "Range & Range Penalties" on real distances, and offer bands purely as a
UI convenience layered on top. A `RANGE_BAND_LIBRARY` of invented distances would be house rules
presented as RAW.

### B2. Full Attack is +2k1, not +2k0

Canonical stance data (verified this session):

| Stance | Attack effect | Armor TN effect | Restrictions |
|---|---|---|---|
| Attack | — | — | none |
| Full Attack | **+2k1** | **−10** | attacks only; no ranged; not mounted; +5 ft move once/round |
| Defense | may not attack | **+Air Ring + Defense Skill Rank** | none otherwise |
| Full Defense | may not attack | **+½ Defense/Reflexes roll (round up)** | Complex Action; Free Actions only |
| Center | next round **+1k1 + Void Ring** on one roll | — | no Actions; **+10 Initiative** that round |

Note Defense/Full Defense modify **Armor TN**, i.e. `f_currentTN` — sheet state computed in
`recalcAll()`, not a roll decorator. Feature 2 therefore spans *both* mechanisms.

### B3. Feature 4 lists 2 of the 6 RAW Void options

RAW allows: **+1k1** to Skill/Trait/Ring/Spell Casting; **Skill Rank 0→1**; **reduce Wounds by 10**;
**+10 Armor TN** for a round; **exchange Initiative**; **+10 Initiative**. Also: Void spent to
activate a School Technique does **not** count against the once-per-Round limit.

Worth noting the sheet's own Katana entry is an explicit exception to "Damage Rolls may not be
enhanced" — `VOID_SPEND_LIBRARY` needs to model that carve-out.

### B4. `ARROW_LIBRARY` already exists

Feature 6 says "Add `ARROW_LIBRARY`". Part B already ships it, and
`getWeaponDamageDice(entry, rank, {arrow})` already accepts an arrow selection — the seam was
built for this. Feature 6 **extends** it (keywords, special rules, counts); it does not add it.
`WEAPON_LIBRARY` is already clean of ammo.

### B5. Feature 5 is the highest-risk item by a wide margin

`TECH_DESCRIPTIONS` holds **245 free-text technique descriptions**. Auto-applying them means
structuring all 245, and most are conditional ("once per encounter", "against a target that…",
"while in Full Attack"). This is exactly the problem Phase 1 solved for mastery abilities — and it
was solved by structuring *only unconditional numeric effects* and leaving the rest as prose.

**Recommendations:**
1. Apply the same discipline: structure only unconditional effects; conditional ones stay prose.
2. **Move Feature 5 last.** It depends on stance, range, wound and round context to know when a
   technique applies. Built fifth, it would be re-worked twice.

---

## C. Recommended sequence

| # | Item | Why here |
|---|---|---|
| **P1** | **Combat Round Context** *(new)* | Prerequisite for F2, F4, F5 |
| **P2** | **Pre-roll Modifier Pipeline** *(new)* | Prerequisite for F2, F4; resolves A1 |
| 1 | Range & Range Penalties | Self-contained; Part B data ready |
| 2 | Stances | Needs P1 + P2 |
| 3 | Wound Penalties | Needs the A2 decision |
| 4 | Void Points | Needs P1 + P2 |
| 5 | Ammo Tracking (narrowed) | Needs the A4 decision; seam ready |
| 6 | Off-hand & Dual-Wielding | Consumes Feature 6 |
| 7 | School Technique Automation | Needs every context above |

P1 and P2 are small — together roughly the size of Feature 0 — and they remove duplicated work
from four downstream features.

---

## D. What carries forward unchanged

These parts of the roadmap need no revision and are already proven by Feature 0:

- Four-phase structure (static data → pure functions → orchestration → testing)
- Validation suite + regression matrix + harness prompt + cross-version signature per feature
- Non-`f_` hidden inputs for new state
- Frozen list: `rollDicePool`, `showRollResult`, `collectData`, `applyData`, Ten Dice Rule
- Harness must run on Part B baseline and degrade gracefully (`signature.js` already returns
  `ABSENT` for missing features)
- The 127-assertion Part B suite re-run unchanged as every feature's isolation gate

---

## E. Five decisions needed

| # | Question | My recommendation |
|---|---|---|
| 1 | Pre-roll pipeline for +Xk Y modifiers? | **Yes** — build P2; frozen functions stay frozen |
| 2 | Wound penalties: display-only, roll-total, or both? | **Display-only (3a)**, with 3b as an A/B toggle |
| 3 | Ammo/stance persistence? | **`localStorage` (4b)** — no save-format change |
| 4 | Feature 6/7 split? | **6 = ammo only, 7 = handedness** |
| 5 | Range: real distances or invented bands? | **Real distances**, bands as UI only |

Answer these and I'll start with P1 + P2, then Feature 1.
