# Part C — Feature 2: Stance System

**Build:** `l5r-character-sheet part C feature 2 stances.html` (1,083,423 chars)
**Trunk:** `BUGFIX — School Skill Free Rank on Reload/…feature 1 + schoolfree fix.html`
**Harness:** `l5r-P1-P2-F2-test-harness.js`

| Suite | Result |
|---|---:|
| **Feature 2** | **82/82** |
| Feature 1 | 80/80 |
| P1 + P2 | 46/46 |
| Feature 0 | 72/72 |
| Part B | 127/127 |
| Schoolfree bugfix | 30/30 |
| **Total** | **437** |

Diff vs trunk: **378 added, 5 removed.** All five removed lines are in `recalcAll()` or the
round/initiative button handlers — none is a frozen function. `rollDicePool`,
`rollWeaponDicePool`, `showRollResult`, `collectData`, `applyData` and the Ten Dice Rule are
untouched. Save still has exactly 42 fields.

---

## The architectural point

The five Stances do not all live in one place, and pretending they did would have been wrong:

| Effect | Mechanism | Why |
|---|---|---|
| Full Attack **+2k1**, Center **+1k1 + Void** | **P2 pipeline** | dice-pool changes, must precede the Ten Dice Rule |
| Full Attack **−10**, Defense **+Air+Defense**, Full Defense **+½ roll** | **`recalcAll()`** | Armor TN is character state, not a roll |
| Center **+10 Initiative** | **`recalcAll()` + the Initiative roll** | a score, and the roll now routes through P2 |

**Verified (C3):** in Full Attack a 10k3 attack becomes **12k4 before** the Ten Dice Rule sees it —
the exact ordering P2 exists to guarantee.

---

## Tile UI

Five tiles, no dropdown anywhere (A9). Each carries a name, a Ring label, a distinct inline-SVG
icon, and a corner ⓘ that opens the RAW rules text.

- Tiles are real `<button>` elements, so they are keyboard-reachable and Enter/Space works (A8),
  with `aria-pressed` tracking selection (A13) and a visible focus ring.
- Exactly one tile highlights at a time (A12).
- The ⓘ button calls `stopPropagation()`, so reading the rules **never** changes your stance (A16).
- The info modal closes on ✕, on outside click, and on **ESC** (A17).
- Icons are abstract geometry — no L5R artwork is reproduced. To swap in your own images, replace
  the markup in `STANCE_ICONS`; nothing else reads it.

Grid is `auto-fit / minmax(104px, 1fr)`, so the row reflows to 2–3 columns on a phone.

---

## RAW behaviour implemented

| Stance | Effect | Test |
|---|---|---|
| **Attack** | nothing at all | B1–B4 |
| **Full Attack** | +2k1 attack, Armor TN −10, **no ranged attacks** | C1–C11 |
| **Defense** | Armor TN + Air Ring + Defense Rank, no roll modifiers | D1–D4 |
| **Full Defense** | declaration roll, +½ total (round up) to Armor TN until next Turn | D5–D11 |
| **Center** | nothing this round; next round +1k1 + Void on one roll, +10 Initiative | E1–E6, F1–F17 |

### Full Defense uses your *final* dice

Declaring Full Defense rolls Defense / Reflexes. Because you may re-pick kept dice inside the
modal, the bonus is taken from `closeRollModal()`'s `onClose` callback — the one reliable "player
is finished" moment — reading the final displayed total. Rolling 9 and 8 stores **9** (D6).

The bonus is stamped with the round it was rolled in, so "until his following Turn" falls out
naturally: it stops counting when the round advances (D9), with no change to P1.

### Center's bonus applies once, does not stack, does not leak

- Available only when the **previous** round's ledger entry is Center (F1/F2)
- Consumed only after a roll **actually happens** — a cancelled attack does not burn it (**F17**)
- A second attack in the same round gets nothing (F11), pool back to 10k3 (F12)
- Gone entirely a round later (F13/F14)

The +10 Initiative is deliberately **not** gated on that consumption: RAW grants it for the whole
round, not for one roll (F3/F14).

---

## Two interpretations you should know about

### 1. "+1k1 plus his Void Ring" → +1k1 dice **and** +Void to the total

RAW reads *"gains a bonus of 1k1 plus his Void Ring on any one roll"*. That parses two ways:
**(a)** +1k1 to the pool and the Void Ring added to the total, or **(b)** `(1+Void)k1` in dice.

I implemented **(a)**, which is also how your brief writes it ("+1k1 + Void Ring"). Switching to
(b) means moving `voidRing` from `totalDelta` to `rolledDelta` — one line, flagged in the code.

### 2. Center's +10 Initiative reaches the roll via P2

Your section 3 says "only attack rolls may receive stance modifiers"; your section 4 requires
Initiative to gain +10. Those collide once the Initiative *roll* is considered rather than just the
displayed score.

I resolved it by having the `stance` contributor answer for `ATTACK` **and** `INITIATIVE` only, and
refuse every other kind. Damage, skill, spell and manual rolls are still provably stance-free
(G1–G4, G7, G8). If you would rather the Initiative roll stay unmodified and only the *display*
show +10, delete the `INITIATIVE` branch.

---

## Harness evolution this run — none

No stale-invariant corrections were needed. The P1/P2 registry assertion updated during Feature 1
already checks against a baseline, so `stance@30` joining `range@20` required no further change.
G12 now pins the expected permanent registry to `['range','stance']`.

---

## Regression Matrix

| # | Check | Result |
|---|---|---|
| 1 | Frozen dice functions unmodified | PASS — 0 removed lines outside `recalcAll`/handlers |
| 2 | `collectData` / `applyData` unmodified | PASS |
| 3 | Ten Dice Rule logic unchanged | PASS |
| 4 | Ten Dice Rule sees the stance-modified pool | PASS — C3/C4 |
| 5 | Feature 1 range prompt intact | PASS — 80/80 |
| 6 | Range + stance combine additively | PASS — G5/G6 (6k3 → +1k1 → −2k0 → **5k4**) |
| 7 | Feature 0 emphasis re-roll intact | PASS — 72/72 |
| 8 | P1 round context intact | PASS — 46/46 |
| 9 | Part B weapons system intact | PASS — 127/127 |
| 10 | Schoolfree bugfix intact | PASS — 30/30 |
| 11 | Damage / skill / spell / manual unaffected | PASS — G1–G4, G7, G8 |
| 12 | No stance fields in the save | PASS — G9 (42 fields), G10 |
| 13 | Save/load round trip stable | PASS — G11 |
| 14 | Registry clean after cancelled rolls | PASS — G12, F17 |

---

## Rollback

| Level | Action | Effect |
|---|---|---|
| Full | Return to the trunk build | Complete revert; nothing persisted, no migration |
| Feature off | `unregisterPreRollModifier('stance')` | Tiles still select, but no dice modifiers |
| TN only off | Make `getStanceArmorTNBonus()` `return 0` | Armor TN stops responding to stance |
| Initiative off | Delete the `INITIATIVE` branch in `stancePreRollModifiers` | +10 shows in the display but not the roll |
| Center reading | Move `voidRing` from `totalDelta` to `rolledDelta` | Switches to the `(1+Void)k1` interpretation |
| Ranged gate off | Remove the Full Attack check in `rollWeaponAttack` | Full Attack stops refusing ranged attacks |

---

## Folder contents

| File | Purpose |
|---|---|
| `l5r-character-sheet part C feature 2 stances.html` | The build |
| `l5r-P1-P2-F2-test-harness.js` | Combined harness — F2 + F1 + P1/P2 + F0 + Part B |
| `l5r-P1-P2-F1-test-harness.js` | Feature 1 suite |
| `l5r-P1-P2-test-harness.js` | P1/P2 suite |
| `l5r-feature0-test-harness.js` | Feature 0 suite |
| `l5r-partB-test-harness.js` | Part B suite |
| `l5r-schoolfree-bugfix-harness.js` | Schoolfree bugfix suite |
| `l5r-crossversion-signature.js` | Cross-build fingerprint |
| `splice_feature2.py` | Splice script that produced this build |
| `feature2-code-block.js.txt` | The Feature 2 code block as spliced |
| `DIFF-SUMMARY-vs-Feature1.md` | Line counts, removed lines, change hunks |
| `FEATURE-2-RESULTS.md` | This document |

```bash
python -m http.server 8799 --directory "."
```

```js
fetch('/l5r-P1-P2-F2-test-harness.js').then(r=>r.text()).then(s=>(0,eval)(s)).then(o=>console.log(o.failed))
```

Exit condition: `failed === 0` with all four sub-suites reporting `failed: 0`.

---

## Implementation note worth keeping

The first splice attempt threw `Cannot access 'STANCE_LIBRARY' before initialization`. The stance
UI wiring had been placed next to the weapon quick-add init, which executes roughly 2,300 lines
*before* the Feature 2 `const` block — a temporal dead zone. It now lives in the `init()` IIFE at
the bottom of the script. **Any future feature that adds init wiring must do the same**: the
sheet's one-IIFE structure means "where the wiring sits" is a real ordering constraint, not a
stylistic choice.
