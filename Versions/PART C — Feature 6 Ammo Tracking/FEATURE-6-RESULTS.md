# Part C — Feature 6: Ammo Tracking

**Build:** `l5r-character-sheet part C feature 6 ammo.html` (1,145,365 chars, sha256 `426255d02bb8e316…`)
**Trunk:** `PART C — Feature 4 Void Automation/l5r-character-sheet part C feature 4 void.html`
**Harness:** `l5r-P1-P2-F6-test-harness.js`

Feature 5 was rolled back before this work began. Nothing in this build references a Feature 5
anchor, symbol, library or UI element.

| Suite | Result |
|---|---:|
| **Feature 6** | **154/154** |
| Feature 4 | 96/96 |
| Feature 3 | 59/59 |
| Feature 2 | 84/84 |
| Feature 1 | 80/80 |
| P1 + P2 | 46/46 |
| Feature 0 | 72/72 |
| Part B | 127/127 |
| Schoolfree bugfix | 30/30 |
| **Total** | **748** |

Diff vs trunk: **642 added, 17 removed.** Every removed line is in `ARROW_LIBRARY` (rewritten with
identical DR values), the P2 pipeline, or a call site gaining one argument. `rollDicePool`,
`rollWeaponDicePool`, `rollExplodingD10`, `showRollResult`, `applyTenDiceRule` and Part B's damage
arithmetic are untouched. The save still has exactly 42 `f_` fields.

---

## Part B had already built the damage half

`getWeaponDamageDice()` shipped in Part B with the bow rule complete: the arrow supplies the DR,
the bow adds its own Strength rating capped by the wielder's, and an `opts.arrow` hook with a
`DEFAULT_ARROW` fallback was left explicitly for this feature. So Feature 6 adds **no new damage
arithmetic at all**. §5.4 is satisfied by passing a name into a function that already existed:

| Requirement | Where it lives | Asserted |
|---|---|---|
| Damage = Bow Strength + Arrow DR | Part B, step 2 + step 3 | F6-E1–E7 |
| Weak-user rule (Strength < bow rating) | Part B, `Math.min(bowStrength, wielderStrength)` | F6-E8, E9, E10 |
| `getWeaponDamageDice(entry, rank, {arrow})` | Part B signature, now actually called with an arrow | F6-E4–E7, E11–E13 |

Worked example from the brief — Yumi (bow Strength 3) + Willow Leaf 2k2 = **5k2** — is F6-E1, and
was already Part B's B26/B27.

---

## Three decisions worth explaining

### 1. Ammo tracking is opt-in, and that is what makes the zero-change guarantee true

The ammunition popup appears only once ammo tracking is **active** for a row: the character owns
at least one arrow item, or that bow has already fired one (`ammoTrackingActive()`).

A character who has never put arrows in Equipment fires a bow exactly as they did in Feature 4 —
no prompt, no spend, Willow Leaf's DR by default, no modifier bar. That is §3's "zero-change
guarantee when no ammo is selected" read literally, and it is the difference between a feature and
a breaking change: every existing save, and every existing bow test in Features 1–4, stays valid.

The second half of the condition matters as much as the first. An archer who looses their **last**
arrow keeps getting the popup — with every option disabled and an explicit "You have no arrows"
note — rather than silently reverting to free ammunition. Running out blocks the shot; never
having started doesn't.

Asserted at **C4/C5** (dormant with an empty quiver), **C6** (active the moment an arrow is
owned), **C20–C23** (an emptied quiver still gates the shot), and **G1–G10** (the whole
zero-change guarantee, including that melee is untouched).

### 2. Arrows are ordinary Equipment rows, named by convention

An arrow row is `Arrow — Willow Leaf`, parsed back by `arrowFromEquipLabel()` — deliberately the
same shape as the existing `Spell Scroll — {spell}` convention and its `spellNameFromScrollLabel()`
inverse. Three things fall out for free:

* **The save shape does not change.** `{name, qty, notes}` is exactly what an arrow row needs, so
  arrows are saved, loaded, merged and removed by machinery that already existed. §5.6.A needed no
  new code at all.
* **A player can hand-edit them** like any other item — and a hand-typed row counts. The parser
  accepts "Arrow"/"Arrows" and all three dashes (F6-B12).
* **Forward and backward compatible.** A character saved by this build still loads on a build that
  has never heard of Feature 6; the arrows are just items.

Rows merge on add (F6-B5/B6), split by type (F6-B7/B8), and an arrow row committed at 0 removes
itself (F6-B23). That removal is bound to `change`, not `input` — otherwise typing the "1" of "10"
over a "0" would delete the row mid-keystroke — and it is scoped to arrow rows, because "Spare
bowstring: 0" is a perfectly reasonable thing to write down (F6-B25).

### 3. The modifier-bar entry is informational, because the DR is already in the pool

§5.5 asks for `Arrow: Willow Leaf (+2k2)` in the modifier bar. But the arrow's DR was added by
`getWeaponDamageDice()` before the bar exists — a contributor returning `+2k2` as real deltas would
**double** it.

So P2 gained one small channel: `informational: true`. Such a modifier carries text but no
arithmetic, and the normaliser **forces its three deltas to zero** at the point of normalisation.
That is the strong form of the guarantee: no informational contributor can move a die whatever it
returns, and `applyPreRollModifiers()` needed no new case (F6-E18, E19).

Two related notes:

* **Damage rolls still do not go through `rollWithModifiers()`.** Part B rolls them directly, and
  Features 3 and 4 both encode "damage rolls are never enhanced" by returning `null` for
  `ROLL_KINDS.DAMAGE`. Rather than change that, `rollWeaponDamage()` asks the same *pure* half of
  the pipeline (`getPreRollModifiers` / `applyPreRollModifiers`) for its list and decorates the
  already-rendered modal. Every other contributor still returns null for damage, so the list is
  either empty or exactly one arrow line (F6-G7).
* **The entry is on the damage roll only.** "+2k2" on an attack roll would be actively misleading —
  it does not affect the attack. The attack instead reports the spend on the status line
  ("Flesh Cutter loosed — 2 left in your quiver") and in the weapon row's note.

---

## The missed-shot rule needs no rule

§5.3.B: attack, select an arrow, skip the damage roll, roll again → the first arrow is still spent.

That is not implemented as a special case. Ammunition is spent by the **attack** roll, and
**nothing anywhere refunds it** — there is no code path that gives an arrow back. A miss is simply
what it looks like when you never roll the damage. Asserted at **D5/D6/D7** (the missed shot is not
refunded and the next shot pays its own), and **D10** (the damage roll refunds nothing either).

The two pieces of state that spec §5.6 separates:

| State | Lives in | Saved? | Cleared by |
|---|---|---|---|
| `lastArrowUsed` — the arrow in flight | a module variable | **No** (§5.6.C) | the damage roll, and `clearAllRows()` |
| `wp_arrowType` — what this bow is loaded with | `.wp-arrow-type` on the row | **Yes** (§5.6.B) | never automatically |

`lastArrowUsed` is a module variable rather than a hidden input specifically so it *cannot* reach
the save file — `collectData()` serialises the DOM, so state that is not in the DOM cannot leak
(F6-F4, F6-F5).

### A bug the harness caught

The first build let `lastArrowUsed` survive `applyData()`: loading a character while an arrow was
nocked carried that arrow onto the newly-loaded sheet (**F6-F10**). The teardown went into
`clearAllRows()` — the one place both `applyData()` and `resetToBaseline()` already pass through —
for the same reason `applyData()` resets `prevVoidRank`.

A second bug the visual pass caught: `refreshEquipRow()` set `iconEl.style.display = ''`, which
hands the element straight back to the stylesheet's resting `display:none`, so the arrow icon was
in the DOM but invisible. Fixed to `'block'`, and **F6-B17/B19b/B20/B28/C14/F12** now assert
`offsetWidth > 0` rather than just checking that the markup was written — the original assertions
passed against the broken build.

---

## Ordering: range first, then ammunition

Both prompts can cancel a bow attack, but only the ammunition prompt has a side effect. It is
therefore asked **last**, so that backing out of the range prompt cannot already have cost an
arrow. `spendArrow()` also checks the quantity before touching a single row, so a refused spend
consumes nothing (F6-D17).

Full order for a bow attack: Full Attack check → range prompt → range legality → **ammunition
prompt** → spend → roll. Cancelling at any point rolls no dice and spends nothing (C16–C18, D12,
D13).

---

## What is deliberately NOT automated

§3 puts "automation of special arrow rules beyond DR and gating" out of scope, so the arrow special
rules are **printed everywhere and applied nowhere**:

| Arrow | DR | Cost | Special rule | Status |
|---|---|---|---|---|
| Willow Leaf | 2k2 | 1 bu | None | — |
| Armor Piercing | 1k1 | 2 bu | Ignores armor TN bonus | printed, manual |
| Flesh Cutter | 2k3 | 5 bu | Doubles armor TN bonus, 1/2 range | printed, manual |
| Humming Bulb | 0k1 | 5 bu | Loud whistling sound | flavour |
| Rope Cutter | 1k1 | 3 bu | 2 Free Raises vs objects, 1/2 range | printed, manual |

This is consistent with the rest of the sheet: Armor TN and Reduction are manual columns, and Part
B already prints (rather than applies) the Staves and Kyoketsu-shoge armour-doubling rules for the
same reason.

**The halved range of Flesh Cutter and Rope Cutter is the one place this is worth flagging.**
Because the range prompt is answered before the arrow is chosen, Feature 1's range penalty is
computed against the bow's full listed range even when a half-range arrow is then selected. Doing
otherwise would mean either automating a special arrow rule (out of scope) or asking for ammunition
before the range prompt, which would spend an arrow that a cancelled range prompt then wasted. The
1/2 range is shown in the tooltip, in the popup, in the Equipment row's Notes, and in the weapon
info panel; it is the GM's call to apply. If you want it automated, that is a small, well-isolated
follow-up: pass the chosen arrow into `weaponListedRange()`.

---

## UI added

| Where | What |
|---|---|
| Equipment | **+ Add Arrows** button, beside + Add Item and + Add Spell Scroll |
| Arrows picker | All five types with icon, DR, cost, special rules, a −/+ quantity ticker, a live "have N" readout, and Add (which merges into an existing row) |
| Equipment rows | Arrow rows show their icon and a DR / cost / special tooltip, kept live as the Item name is edited |
| Attack time | Ammunition popup: every type listed, owned types clickable, unowned shown disabled with a zero badge, each with icon and tooltip |
| Weapon row | Note line reads `Arrow: Flesh Cutter · 2 in quiver` (or `none nocked · N in quiver`), and the Damage box previews the loaded arrow's DR |
| Weapon info (👁) | "Loaded with", the arrow's special rules, and the quiver count |
| Damage roll | Modifier bar entry `Arrow: Flesh Cutter (+2k3)` |
| Status line | `Flesh Cutter loosed — 2 left in your quiver.` |

Five inline-SVG icons, one per arrow type, in the same idiom as `STANCE_ICONS`: `currentColor`, no
external assets, no font glyphs, no escape sequences (F6-A8, A9, A10).

---

## Test sections

| Section | Tests | Covers |
|---|---:|---|
| F6-A | 16 | Library integrity: names, DR, cost, special rules, keys, icons, no unicode escapes, no external assets, registry placement, tooltip text |
| F6-B | 37 | Equipment: add with quantity, merge, separate types, label parsing both ways, tooltips, icons (rendered, not just written), live re-decoration, zero-quantity removal scoped to arrows, the picker and its ticker |
| F6-C | 23 | Popup: melee never asks, dormant without ammunition, appears when active, all five listed, gating, quantity badges, icons, tooltips, cancel behaviour, empty-quiver gating |
| F6-D | 18 | Spending: one per attack, of the chosen type, stored, stamped on the row, missed shots not refunded, unrelated rolls harmless, released by damage, last arrow removes its row, partial spends refused |
| F6-E | 26 | Damage: every arrow on every bow, weak-user cap, unknown-arrow fallback, contributor scope on all eight roll kinds, informational deltas zeroed, end-to-end bar text, row preview |
| F6-F | 15 | Save/load: arrows saved, quantities restored, arrowType round-trips, no `lastArrowUsed` in the save, 42 fields, save→load→save stable, icons survive, pre-Feature-6 saves load |
| F6-G | 11 | Zero-change guarantee, registry hygiene, equipment cleared before regression |
| REG | 8 | The eight prior suites |

The harness clears every arrow row before running the regression suites. Features 1–4 all fire a
Yumi through the range prompt and know nothing about the ammunition popup, so one leaked arrow row
would hang three suites — the same class of cross-section state leak Feature 4 hit with
`clearVoidSkirmishEffects()`.

---

## Known consequence

`l5r-crossversion-signature.js` includes `JSON.stringify(collectData())`, so its fingerprint
changes on this build: weapon rows now carry an `arrowType` key. That is expected and correct — the
save shape genuinely gained a field. The signature script is a cross-build comparison tool, not one
of the eight regression gates, and it is shipped unmodified.

---

## Deliverables

| File | What |
|---|---|
| `l5r-character-sheet part C feature 6 ammo.html` | The build |
| `feature6-code-block.js.txt` | The Feature 6 code block as spliced |
| `splice_feature6.py` | Splice script that produced this build |
| `l5r-P1-P2-F6-test-harness.js` | Combined harness — F6 + F4 + F3 + F2 + F1 + P1/P2 + F0 + Part B + schoolfix |
| `l5r-P1-P2-F4-test-harness.js` | Feature 4 suite (A3 registry snapshot updated — see the diff summary) |
| `l5r-P1-P2-F3-test-harness.js` | Feature 3 suite (unmodified) |
| `l5r-P1-P2-F2-test-harness.js` | Feature 2 suite (unmodified) |
| `l5r-P1-P2-F1-test-harness.js` | Feature 1 suite (unmodified) |
| `l5r-P1-P2-test-harness.js` | P1/P2 suite (unmodified) |
| `l5r-feature0-test-harness.js` | Feature 0 suite (unmodified) |
| `l5r-partB-test-harness.js` | Part B suite (unmodified) |
| `l5r-schoolfree-bugfix-harness.js` | Schoolfree bugfix suite (unmodified) |
| `p12-harness.js`, `f0-harness.js`, `partB-harness.js`, `schoolfree-harness.js` | Byte-identical copies under the short names the Feature 4 harness fetches, so that suite runs standalone from this folder without editing it |
| `l5r-crossversion-signature.js` | Cross-build fingerprint (unmodified) |
| `DIFF-SUMMARY-vs-Feature4.md` | Line counts, every removed line, change hunks |
| `FEATURE-6-RESULTS.md` | This document |

Rebuild the HTML from the trunk (the splice script reads the code block from beside itself):

```bash
python splice_feature6.py
```

Run the tests:

```bash
python -m http.server 8811 --directory "."
```

```js
fetch('/l5r-P1-P2-F6-test-harness.js').then(r=>r.text()).then(s=>(0,eval)(s)).then(o=>console.log(o.failed))
```

Exit condition: `failed === 0` with all eight sub-suites reporting `failed: 0`. Verified in-browser
against this build — 154 Feature 6 assertions and 594 regression assertions, 748 total, zero
failures.
