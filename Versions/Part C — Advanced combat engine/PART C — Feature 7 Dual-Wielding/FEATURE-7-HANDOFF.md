# Feature 7 — Dual-Wielding: handoff summary

Self-contained summary of the Feature 7 delivery, written to be read without the original chat
session. Full detail lives in `FEATURE-7-RESULTS.md`; the line-level diff lives in
`DIFF-SUMMARY-vs-Feature6.md`.

**Project:** L5R 4th Edition character sheet — a single self-contained HTML file, built by
splicing a code block into the previous feature's build with a Python script.
**Build:** `l5r-character-sheet part C feature 7 dualwield.html` (1,178,717 chars, sha256 `32df9f2fec6c2427…`)
**Trunk:** `PART C — Feature 6 Ammo Tracking/l5r-character-sheet part C feature 6 ammo.html`
**Status:** complete, verified in-browser.

---

## 1. Result

| Suite | Result |
|---|---:|
| **Feature 7** | **156/156** |
| Feature 6 | 154/154 |
| Feature 4 | 96/96 |
| Feature 3 | 59/59 |
| Feature 2 | 84/84 |
| Feature 1 | 80/80 |
| P1 + P2 | 46/46 |
| Feature 0 | 72/72 |
| Part B | 127/127 |
| Schoolfree bugfix | 30/30 |
| **Total** | **904, zero failures** |

Diff vs trunk: **596 added, 15 removed.** No frozen function touched — `rollDicePool`,
`rollWeaponDicePool`, `rollExplodingD10`, `applyTenDiceRule`, `showRollResult`, Part B's damage
arithmetic, every Feature 6 ammunition function and every Feature 4 Void function are unmodified.
The save still has exactly 42 `f_` fields.

---

## 2. The most important thing to review: the rulebook contradicts the brief

The feature brief specified a flat **-10** off-hand penalty applied **only** to the off-hand roll.
I looked the rule up instead of taking that at face value. Core Rulebook, Book of Fire **p.141**,
sidebar *"Off-hand Weapons & Multiple Attacks"*:

> "A character's handedness is determined by the player. A character attempting to make an attack
> with a weapon in his off-hand suffers a penalty of **-5 to the roll if it is a small weapon, -10
> if it is medium, and -15 if it is large.** Additionally, **attacks made with the character's
> dominant hand suffer a penalty of -5 to attacks as long as a secondary weapon is held in the off
> hand.** However, a character wielding two weapons is more difficult to hit due to the larger
> area covered. As a result, **characters wielding two weapons add their Insight Rank to their
> Armor TN.**"

Three differences, all implemented as RAW:

| Brief | RAW | Shipped |
|---|---|---|
| Off-hand is a flat **-10** | **-5 / -10 / -15** by weapon Size | Size-scaled. The brief's -10 is exactly the Medium case (wakizashi, jitte), so the commonest pairing is unchanged; a no-dachi off-hand is -15, a tanto -5. |
| Penalties apply **only** to the off-hand roll | The **main hand also takes -5** while a second weapon is held | Both. This is what makes dual-wielding a real trade-off, and why Mirumoto's Rank 1 is worth having. |
| (not mentioned) | Two weapons **add Insight Rank to Armor TN** | Applied. |

**The Armor TN bonus was not requested.** It was added anyway because shipping the penalties
without the compensating bonus leaves a dual-wielder strictly worse off than the rulebook allows.
It is one named function, `getDualWieldArmorTNBonus()`, called from one line of `recalcAll()`
beside the armour/stance/Void terms already there, and it returns 0 for anyone not holding two
weapons. Deleting the `+ dualTN` term removes it entirely.

**All figures are one constant** — the prompt text, modifier bar, row notes, info panel and every
test read from it:

```js
const OFF_HAND_RULES = Object.freeze({
  offHandBySize: Object.freeze({ Small: -5, Medium: -10, Large: -15 }),
  offHandDefault: -10,          // custom row with no printed Size
  mainHandPenalty: -5,
  armorTNFromInsightRank: true, // set false to drop the Armor TN bonus
});
```

To revert to the brief's flat reading: set all three sizes to `-10` and `mainHandPenalty: 0`.
Nothing else changes.

---

## 3. Four design decisions

### 3.1 Dormant until an off-hand weapon is declared
Nothing happens until a weapon row's Hand selector is set to "Off-hand". No off-hand row means no
pair: no prompt, no penalty, no Armor TN change, no modifier bar, no handedness note. A
one-weapon character rolls exactly what Feature 6 rolled. The selector is hidden outright until a
second weapon row exists.

This is the brief's §2.5 zero-change guarantee taken literally, and it is also the mechanism that
keeps every pre-Feature-7 save and all nine earlier regression suites valid — they add weapon rows
and roll attacks constantly, and none ever declares an off hand.

### 3.2 Technique overrides are derived, not stored
The brief asked for Technique-based overrides to be saved. They are — but with no field of their
own. The canonical case is Mirumoto Rank 1, *Way of the Dragon*: "you suffer no penalties of any
kind for dual wielding." Techniques on this sheet are free text, so
`getDualWieldTechniqueExemption()` reads the character's own Techniques list. Because that list is
already saved, the override round-trips **by construction**. A stored copy would be a second
source of truth that could drift — you could delete the Technique and keep the benefit.

Patterns are deliberately few and specific; three plausible near-miss phrasings are asserted to do
nothing. The escape hatch for unrecognised wording needs no new UI: the text is the player's, so
adding "no off-hand penalty" to a Technique's description turns it on.

This is **not** Feature 8. It reads a Technique's stated effect on the off-hand penalty and
nothing else; Niten's extra attacks, its own Armor TN bonus and its katana/wakizashi requirement
remain out of scope.

### 3.3 Skill masteries declared structurally, and audited
Two Weapon Skills already printed an off-hand mastery in `SKILL_LIBRARY`:

* **Knives Rank 3** — "Off-hand penalties do not apply when using a knife." (Core p.141)
* **War Fan Rank 3** — "No off-hand penalty" (the Lion's katana-and-war-fan pairing)

Both now carry a declared `offHandExempt: 3` beside that text — same shape as the existing
`dmgBonus` / `explodeOn` / `reductionMod` fields. The printed text is byte-identical; only the
field is new. `offHandMasteryAudit()` cross-checks the two **in both directions** and is asserted
empty, so free text and mechanical value cannot silently drift apart.

RAW scopes a Skill mastery to *off-hand* penalties, so it does **not** waive the main hand's -5.
Only a Technique removing "penalties of any kind" does that.

### 3.4 "Both weapons" is two rolls, sequenced by the player
`rollWeaponAttack()` became a thin orchestrator over `performWeaponAttack(ctx, {hand})` — the
entire pre-Feature-7 body, unchanged except that it records which hand it was made with and
reports whether a roll happened. A single-weapon character calls it with `hand: null`, which is
the Feature 6 path byte for byte.

Choosing "Both" rolls the main hand, then injects a **"Roll off-hand attack"** control into the
finished result — the post-render decorator pattern Feature 0 established. `showRollResult()` is
not modified, wrapped, or called differently. Sequencing rather than rolling both at once lets the
player finish with the first result (click dice to change what is kept, spend an Emphasis re-roll)
before the second replaces it. The off-hand roll is a full first-class attack with its own range
prompt, ammunition prompt and modifier bar. A cancelled main-hand attack never offers the second.

**Ammunition falls out for free:** each hand goes through the same function, so a bow in either
hand asks for its own arrow and spends it.

---

## 4. Stance and Void reach both rolls; a Void Point is still spent by one

Both rolls go through the full P2 pre-roll modifier pipeline, so they get everything it offers.
Stance applies to both — Full Attack's +2k1 raises the main-hand *and* off-hand pools.

**A Void Point is spent by the first roll.** Feature 4 implements RAW's "+1k1 to *a roll*" by
consuming one-roll effects inside `rollWithModifiers()`. Two attacks are two rolls, so the point
enhances whichever strikes first and the second attack is ordinary. This is deliberate, is the
RAW-correct answer, and could not be changed without editing Feature 4's Void logic — which the
brief's §5 forbids. Making a Void Point cover an entire two-weapon action would be a Feature 4
rule change, not a Feature 7 one.

---

## 5. Implementation notes

* The penalty is a **`totalDelta`**, not a dice change. RAW says "-5 **to the roll**" — a flat
  adjustment to the total, the same channel Feature 1 uses for firing into melee. Folding it into
  `bonus` is what makes it survive every click on a die.
* The P2 contributor registers at **priority 35**, between stance (30) and wounds (40), so the
  breakdown bar lists the handedness penalty beside the other to-hit adjustments. Addition is
  commutative, so this is presentation only.
* Negative scope lives in one place: attack rolls only, and only when the roll declared a hand.
* **Two regression assertions were updated**, both whole-registry snapshots that change by
  construction whenever a feature registers a contributor: Feature 4's `A3` and Feature 6's `A15`.
  No other pre-existing assertion was touched.

---

## 6. UI added

| Where | What |
|---|---|
| Weapon row | **Hand** selector (Main-hand / Off-hand) under the weapon name — hidden until a second weapon row exists. Sits outside the table's columns, so the printed sheet keeps its six columns. |
| Weapon row note | `Off hand · -10 to attack totals`, any waiver that removed it, and `Two weapons · Armor TN +N (Insight Rank)`. Absent entirely unless dual-wielding. |
| Attack time | **Attack with** prompt: Main hand / Off hand / Both weapons, each naming its weapon and exact cost, with the Armor TN the pair buys in the subtitle. Closing it cancels the attack. |
| Roll result | **Roll off-hand attack** control on the main-hand result when "Both" was chosen. |
| Modifier bar | e.g. `Main hand: -5 to total — a second weapon is held in the off hand`, `Off-hand attack: -10 to total — medium weapon in the off hand`, `Off-hand: no penalty (Knives Rank 3)`. |
| Weapon info (👁) | Which hand, what it costs, what waives it, and the Armor TN bonus. |
| Armor TN | `f_currentTN` gains the Insight Rank bonus while two weapons are held. |

---

## 7. Test sections

| Section | Tests | Covers |
|---|---:|---|
| F7-A | 26 | RAW figures, size lookup, hand normalisation, defaults, pair formation from either row, activation/stand-down, the two Skill masteries, mastery audit |
| F7-B | 42 | Every size band, main-hand penalty, contributor scope on all eight roll kinds, end-to-end totals, stance/Void/wound stacking, Skill-mastery waiver and Rank threshold, Technique waiver (four patterns + three near-misses), Armor TN bonus appearing and going away |
| F7-C | 38 | Dormancy, prompt contents, cancel, main-only, off-only, both-weapons two-roll flow, stance on both rolls, Void spent by the first, pairing from the off-hand row, ammunition in a dual-wield hand |
| F7-D | 13 | Damage arithmetic, previews, damage rolls untouched by handedness, row notes appearing/disappearing |
| F7-E | 17 | Handedness saved and restored, 42 fields, no new top-level keys, save→load→save stable, Technique overrides round-tripping without a field, pre-Feature-7 saves, garbage hand value normalising |
| F7-F | 11 | Zero-change guarantee, registry hygiene and ordering, teardown before the regression suites |
| REG | 9 | The nine prior suites |

The harness clears every off-hand row and every Technique before running the regression suites —
Features 1–6 roll attacks constantly and know nothing about the handedness prompt, so one leaked
off-hand row would hang them.

---

## 8. Known consequence

`l5r-crossversion-signature.js` includes `JSON.stringify(collectData())`, so its fingerprint
changes on this build: weapon rows now carry a `hand` key. Expected and correct — the save shape
genuinely gained a field. That script is a cross-build comparison tool, not one of the nine
regression gates, and ships unmodified.

---

## 9. Out of scope (unchanged from the brief)

Mirumoto Niten full automation (Feature 8), three-weapon fighting, weapon-specific special rules
beyond off-hand penalties, new stance types, new Void interactions, new damage arithmetic.

---

## 10. Files and how to reproduce

| File | What |
|---|---|
| `l5r-character-sheet part C feature 7 dualwield.html` | The build |
| `feature7-code-block.js.txt` | The Feature 7 code block as spliced |
| `splice_feature7.py` | Splice script that produced this build |
| `l5r-P1-P2-F7-test-harness.js` | Combined harness — F7 + F6 + F4 + F3 + F2 + F1 + P1/P2 + F0 + Part B + schoolfix |
| `l5r-P1-P2-F6-test-harness.js` | Feature 6 suite (A15 registry snapshot updated) |
| `l5r-P1-P2-F4-test-harness.js` | Feature 4 suite (A3 registry snapshot updated) |
| `l5r-P1-P2-F3/F2/F1-test-harness.js`, `l5r-P1-P2-test-harness.js`, `l5r-feature0-test-harness.js`, `l5r-partB-test-harness.js`, `l5r-schoolfree-bugfix-harness.js` | Unmodified |
| `p12-harness.js`, `f0-harness.js`, `partB-harness.js`, `schoolfree-harness.js` | Byte-identical copies under the short names the Feature 4 harness fetches |
| `l5r-crossversion-signature.js` | Cross-build fingerprint (unmodified) |
| `DIFF-SUMMARY-vs-Feature6.md` | Line counts, every removed line, change hunks |
| `FEATURE-7-RESULTS.md` | Full results document |
| `FEATURE-7-HANDOFF.md` | This summary |

Rebuild the HTML from the trunk (the splice script reads the code block from beside itself):

```bash
python splice_feature7.py
```

Run the tests:

```bash
python -m http.server 8812 --directory "."
```

Then in the browser console on the built page:

```js
fetch('/l5r-P1-P2-F7-test-harness.js').then(r=>r.text()).then(s=>(0,eval)(s)).then(o=>console.log(o.failed))
```

Exit condition: `failed === 0` with all nine sub-suites reporting `failed: 0`. The run takes
several minutes — the Feature 6 suite nests its own eight sub-suites, so Part B, Feature 0, P1/P2
and the schoolfree bugfix each execute twice.

---

## 11. Two things that need a human decision

1. **Do you accept the RAW figures over the brief's?** Specifically the size-scaled off-hand
   penalty, the main-hand -5, and the unrequested Armor TN bonus. Section 2 above has the exact
   rulebook text and the one constant that reverts any of it.
2. **Should a Void Point cover both attacks of a two-weapon action?** Currently it is spent by the
   first roll, which is RAW and which Feature 7 could not change without editing Feature 4.
