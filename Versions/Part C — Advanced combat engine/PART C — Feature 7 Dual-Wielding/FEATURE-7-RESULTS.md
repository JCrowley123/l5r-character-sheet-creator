# Part C — Feature 7: Dual-Wielding & Off-Hand Penalties

**Build:** `l5r-character-sheet part C feature 7 dualwield.html` (1,178,717 chars, sha256 `32df9f2fec6c2427…`)
**Trunk:** `PART C — Feature 6 Ammo Tracking/l5r-character-sheet part C feature 6 ammo.html`
**Harness:** `l5r-P1-P2-F7-test-harness.js`

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
| **Total** | **904** |

Diff vs trunk: **596 added, 15 removed.** No frozen function was touched: `rollDicePool`,
`rollWeaponDicePool`, `rollExplodingD10`, `applyTenDiceRule`, `showRollResult`, Part B's damage
arithmetic, every Feature 6 ammunition function and every Feature 4 Void function are all
untouched. The save still has exactly 42 `f_` fields.

---

## The rulebook says something different from the brief. Please read this section.

I looked the rule up rather than working from the brief's summary. Core Rulebook, Book of Fire
**p.141**, sidebar *"Off-hand Weapons & Multiple Attacks"*:

> "A character's handedness is determined by the player. A character attempting to make an attack
> with a weapon in his off-hand suffers a penalty of **-5 to the roll if it is a small weapon,
> -10 if it is medium, and -15 if it is large.** Additionally, **attacks made with the character's
> dominant hand suffer a penalty of -5 to attacks as long as a secondary weapon is held in the off
> hand.** However, a character wielding two weapons is more difficult to hit due to the larger area
> covered. As a result, **characters wielding two weapons add their Insight Rank to their Armor
> TN.**"

Three differences from the brief, all of them implemented as RAW:

| Brief §2.1 / §2.2 | RAW | What shipped |
|---|---|---|
| Off-hand is a flat **-10** | **-5 / -10 / -15** by weapon Size | Size-scaled. The brief's -10 is exactly the Medium case — a wakizashi or a jitte — so the commonest pairing is unchanged, but a no-dachi in the off hand is -15 and a tanto is -5. |
| "Apply penalties **only** to the off-hand roll" | The **main hand also takes -5** while a second weapon is held | Both. This is the rule that makes dual-wielding a real trade-off, and it is why Mirumoto's Rank 1 is worth having. |
| (not mentioned) | Two weapons **add Insight Rank to Armor TN** | Applied. |

**On the third one specifically.** The Armor TN bonus is not in the brief's requirements, and I
have added it anyway, so you should know why: shipping the penalties without the compensating
bonus would leave a dual-wielder strictly worse off than the rulebook allows, which is a worse
outcome than either implementing the rule or leaving the whole sidebar alone. It is one named
function, `getDualWieldArmorTNBonus()`, called from one line of `recalcAll()` alongside the
armour, stance and Void terms that were already there, and it returns 0 for anyone not actually
holding two weapons. Deleting the `+ dualTN` term removes it entirely.

**Everything above is one constant.** Nothing hardcodes any of these figures — the prompt text,
the modifier bar, the row notes, the info panel and every test read from `OFF_HAND_RULES`:

```js
const OFF_HAND_RULES = Object.freeze({
  offHandBySize: Object.freeze({ Small: -5, Medium: -10, Large: -15 }),
  offHandDefault: -10,          // a custom row with no printed Size
  mainHandPenalty: -5,
  armorTNFromInsightRank: true, // set false to drop the Armor TN bonus
});
```

If your table prefers the brief's flat reading, set all three sizes to -10 and
`mainHandPenalty: 0`. Nothing else needs to change.

---

## Four decisions worth explaining

### 1. Dormant until an off-hand weapon is declared

Nothing in this feature does anything until the player sets a weapon row's Hand selector to
"Off-hand". No off-hand row means no pair, which means no prompt, no penalty, no Armor TN change,
no modifier bar and no handedness note. A one-weapon character rolls exactly the dice Feature 6
rolled.

That is §2.5's guarantee taken literally, and it is also the mechanism that keeps every
pre-Feature-7 save and all nine earlier regression suites valid — they add weapon rows and roll
attacks constantly, and none of them ever declares an off hand.

The selector itself is hidden outright until there are two weapon rows to choose between (§2.5,
"must not show dual-wield UI"). Because every row's note depends on whether a pair exists at all,
changing one row's handedness refreshes the whole table.

Asserted at **A9–A14** (one weapon, then two main-hands, are both still not dual-wielding),
**C1–C4** (no prompt, no bar, the Feature 6 pool), **D12/D13** (standing down removes the notes)
and **F1–F10** (the full zero-change guarantee).

### 2. Technique overrides are derived, not stored

§2.4 asks for Technique-based overrides to be saved. They are — but not with a field of their own.

The canonical case is the Mirumoto Rank 1, *Way of the Dragon*: "you suffer no penalties of any
kind for dual wielding". Techniques on this sheet are free text, so `getDualWieldTechniqueExemption()`
reads the character's own Techniques list. Because the Techniques list is already saved, the
override round-trips **by construction**. A saved copy would be a second source of truth that
could drift away from the Technique that granted it — you could delete the Technique and keep the
benefit.

The patterns are deliberately few and specific, so an unrelated Technique cannot switch the
penalty off by accident (**B38** asserts three plausible near-misses do nothing). And the escape
hatch for a wording the list does not recognise costs nothing and needs no new UI: the text is the
player's, so adding "no off-hand penalty" to a Technique's description turns it on.

This is **not** Feature 8. It reads a Technique's stated effect on the off-hand penalty and
nothing else — Niten's extra attacks, its own Armor TN bonus and its katana/wakizashi requirement
are Mirumoto automation and stay out of scope.

Asserted at **B30–B38** and **E10–E12**.

### 3. Skill masteries are declared structurally, and audited

Two Weapon Skills already printed an off-hand mastery in `SKILL_LIBRARY`:

* **Knives Rank 3** — "Off-hand penalties do not apply when using a knife." (Core p.141)
* **War Fan Rank 3** — "No off-hand penalty" (the Lion's katana-and-war-fan pairing)

Both now carry a declared `offHandExempt: 3` beside that text — the same shape as Phase 1/2's
`dmgBonus` / `explodeOn` / `reductionMod`. The printed text is byte-identical; only the field is
new.

`offHandMasteryAudit()` cross-checks the two **in both directions**: every skill whose mastery
text mentions an off-hand penalty must declare the field at that Rank, and every skill declaring
the field must print it. **A26** asserts the audit is empty, so the free text and the mechanical
value cannot silently drift apart — the role `emphasisLibraryAudit()` plays for Emphases.

RAW scopes a Skill mastery to *off-hand* penalties, so it does **not** waive the main hand's -5
(**B29**). Only a Technique that removes "penalties of any kind" does that.

### 4. "Both weapons" is two rolls, sequenced by the player

`rollWeaponAttack()` became a thin orchestrator over `performWeaponAttack(ctx, {hand})` — which is
the entire pre-Feature-7 body, unchanged except that it records which hand it was made with and
reports whether a roll actually happened. A single-weapon character calls it with `hand: null`,
which is the Feature 6 path byte for byte.

Choosing "Both" rolls the main hand, then injects a **"Roll off-hand attack"** control into the
finished result — the post-render decorator pattern Feature 0 established. `showRollResult()` is
not modified, wrapped or called differently.

Sequencing them this way rather than rolling both at once is deliberate: the player gets to finish
with the first result (click dice to change what is kept, spend an Emphasis re-roll) before the
second replaces it. The off-hand roll is a full first-class attack — its own range prompt, its own
ammunition prompt, its own modifier bar. A cancelled main-hand attack never offers the second,
which is what `performWeaponAttack`'s return value is for. The button disables itself on click,
because it awaits prompts and a second click during that await would start a second attack (and
spend a second arrow).

**Ammunition falls out for free** (§2.2): each hand goes through the same function, so a bow in
either hand asks for its own arrow and spends it (**C28–C30**).

---

## Stance and Void reach both rolls; a Void Point is still spent by one

§2.2 asks for stance and Void bonuses on both rolls. Both rolls go through the full P2 pipeline,
so they get everything the pipeline offers:

* **Stance applies to both.** Full Attack's +2k1 raises the main-hand pool *and* the off-hand pool
  (**C22a–C22d**).
* **A Void Point is spent by the first roll.** Feature 4 implements RAW's "+1k1 to **a roll**" by
  consuming one-roll effects in `rollWithModifiers()`. Two attacks are two rolls, so the point
  enhances whichever strikes first and the second attack is an ordinary one (**C22e–C22h**).

That second behaviour is deliberate and is not something Feature 7 could change without editing
Feature 4's Void logic, which §5 forbids. It is also the RAW-correct answer. If you want a Void
Point to cover an entire two-weapon action, that is a Feature 4 rule change, not a Feature 7 one.

---

## The off-hand penalty is a `totalDelta`, not dice

RAW says "-5 **to the roll**" and "-5 **to attacks**" — a flat adjustment to the total, the same
channel Feature 1 uses for firing into melee, not a change to the dice pool. Folding it into
`bonus` is what makes it survive every click on a die (**B10**, **B13**, **B16** each assert the
displayed total is the kept sum minus the penalty).

The contributor registers at **priority 35**, between stance (30) and wounds (40), so the
breakdown bar lists the handedness penalty next to the other to-hit adjustments rather than down
among the wound and Void lines. Addition is commutative, so this is presentation only.

Negative scope lives in one place: attack rolls only, and only when the roll declared a hand
(**B5**, **B6**).

---

## UI added

| Where | What |
|---|---|
| Weapon row | A **Hand** selector (Main-hand / Off-hand) under the weapon's name — hidden until a second weapon row exists. Placed outside the table's columns, so the printed sheet keeps its six columns. |
| Weapon row note | `Off hand · -10 to attack totals`, the waiver that removed it if any, and `Two weapons · Armor TN +N (Insight Rank)`. Absent entirely unless the character is dual-wielding. |
| Attack time | **Attack with** prompt: Main hand / Off hand / Both weapons, each naming its weapon and its exact cost, with the Armor TN the pair is buying in the subtitle. Closing it cancels the attack. |
| Roll result | A **Roll off-hand attack** control on the main-hand result when "Both" was chosen. |
| Modifier bar | `Main hand: -5 to total — a second weapon is held in the off hand`, or `Off-hand attack: -10 to total — medium weapon in the off hand`, or `Off-hand: no penalty (Knives Rank 3)`. |
| Weapon info (👁) | Which hand the weapon is in, what that costs, what waives it, and the Armor TN bonus. |
| Armor TN | `f_currentTN` gains the Insight Rank bonus while two weapons are held. |

The Hand selector prints: the sheet's print stylesheet already renders a bare `<select>` as a
filled-in form field, so a printed character sheet records which hand each weapon is in. A
single-weapon character's selector is inline-hidden, so it does not print either.

---

## Test sections

| Section | Tests | Covers |
|---|---:|---|
| F7-A | 26 | RAW figures, size lookup, hand normalisation, defaults, pair formation from either row, activation and stand-down, the two declared Skill masteries, and the mastery audit |
| F7-B | 42 | Every size band, main-hand penalty, contributor scope on all eight roll kinds, end-to-end totals, stance / Void / wound stacking, Skill-mastery waiver and its Rank threshold, Technique waiver with all four patterns plus three near-misses, and the Armor TN bonus appearing and going away |
| F7-C | 38 | Dormancy, prompt contents, cancel, main-only, off-only, both-weapons two-roll flow, stance on both rolls, Void spent by the first, pairing from the off-hand row, and ammunition in a dual-wield hand |
| F7-D | 13 | Damage arithmetic, previews, damage rolls untouched by handedness, and the row notes appearing and disappearing |
| F7-E | 17 | Handedness saved and restored, 42 fields, no new top-level keys, save→load→save stable, Technique overrides round-tripping without a field, pre-Feature-7 saves, and a garbage hand value normalising |
| F7-F | 11 | Zero-change guarantee, registry hygiene and ordering, and the teardown before the regression suites |
| REG | 9 | The nine prior suites |

The harness clears every off-hand row and every Technique before running the regression suites.
Features 1–6 roll weapon attacks constantly and know nothing about the handedness prompt, so a
single leaked off-hand row would hang them — the same class of cross-section state leak Feature 4
hit with `clearVoidSkirmishEffects()` and Feature 6 hit with arrow rows.

The harness also publishes `window.__L5R_HARNESS_PROGRESS` as it goes. It drives modal prompts, so
a mis-sequenced click can leave it awaiting a promise that never resolves; this turns "it is stuck
somewhere" into "it is stuck right after F7-C C17". It earned its place during this build.

---

## Known consequence

`l5r-crossversion-signature.js` includes `JSON.stringify(collectData())`, so its fingerprint
changes again on this build: weapon rows now carry a `hand` key. Expected and correct — the save
shape genuinely gained a field. The signature script is a cross-build comparison tool, not one of
the nine regression gates, and it ships unmodified.

---

## Deliverables

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
| `FEATURE-7-RESULTS.md` | This document |

Rebuild the HTML from the trunk (the splice script reads the code block from beside itself):

```bash
python splice_feature7.py
```

Run the tests:

```bash
python -m http.server 8812 --directory "."
```

```js
fetch('/l5r-P1-P2-F7-test-harness.js').then(r=>r.text()).then(s=>(0,eval)(s)).then(o=>console.log(o.failed))
```

Exit condition: `failed === 0` with all nine sub-suites reporting `failed: 0`. Verified in-browser
against this build — 156 Feature 7 assertions and 748 regression assertions, 904 total, zero
failures. The run takes several minutes: the Feature 6 suite nests its own eight sub-suites, so
Part B, Feature 0, P1/P2 and the schoolfree bugfix each execute twice.
