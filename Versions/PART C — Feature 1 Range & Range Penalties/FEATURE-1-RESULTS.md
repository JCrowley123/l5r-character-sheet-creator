# Part C — Feature 1: Range & Range Penalties (Real Distances)

**Build:** `l5r-character-sheet part C feature 1 range.html` (1,059,112 chars)
**Trunk:** `PART C — P1 P2 PREREQUISITES/l5r-character-sheet part C P1-P2 prerequisites.html`
**Harness:** `l5r-P1-P2-F1-test-harness.js`

| Suite | Result |
|---|---:|
| Feature 1 (incl. 3 regression wrappers) | **80/80** |
| P1 + P2 (re-run) | **46/46** |
| Feature 0 (re-run) | **72/72** |
| Part B (re-run) | **127/127** |
| **Distinct assertions** | **322** |

Diff vs trunk: **257 added, 3 removed** — the 3 being inside `rollWeaponAttack`, an orchestration
wrapper that was never on the frozen list. `rollDicePool`, `rollWeaponDicePool`,
`rollExplodingD10`, `showRollResult`, `collectData`, `applyData` and the Ten Dice Rule are
untouched. Save still has exactly 42 fields.

---

## How it behaves

Clicking **Attack** on a ranged weapon opens a range prompt before any dice are rolled.

| Option | Effect | Channel |
|---|---|---|
| Target is in melee with me | **−10 to the total** | `totalDelta` |
| Target is within listed range (X ft) | nothing | — |
| Target is beyond listed range | second stage asks for the distance, then **−1k0 per extra 50 ft** | `rolledDelta` |

Melee weapons never prompt and never take a range modifier.

Two illegal cases cancel the attack outright — no roll, no modal, no modifier, no state change:

- **Beyond twice the listed range** → *"The target is beyond all possibility of being hit. A bow cannot fire beyond twice its listed range."*
- **Penalty reduces rolled dice below 1** → *"The target is beyond all possibility of being hit. Range penalties reduce the attack to 0kX, which is not a legal roll."*

### Worked example, verified end to end

Kyujutsu 3 + Reflexes 3 = **6k3** with a Yumi (listed 250 ft):

| Distance | Extra | Penalty | Final pool |
|---|---|---|---|
| 200 ft (within) | — | — | 6k3 |
| in melee | — | −10 to total | 6k3 −10 |
| 251 ft | 1 ft | −1k0 | 5k3 |
| 350 ft | 100 ft | −2k0 | **4k3** |
| 400 ft | 150 ft | −3k0 | 3k3 |
| 600 ft | — | — | **cancelled** (> 500 ft) |

---

## Three judgment calls you should know about

### 1. Rounding is `Math.ceil`, not `floor`

RAW says *"−1k0 for every extra 50 feet."* Read with `floor()`, a target at 299 ft with a 250 ft
bow would suffer **no penalty at all** — making "beyond listed range" indistinguishable from being
inside it for the first 49 feet, and rendering the whole third option meaningless in that band.
`ceil()` charges a die the moment you are past the listed range.

Both readings agree on every exact multiple of 50, including your worked example (100 ft → 2 dice).
Asserted by A12–A14. If you want the `floor` reading instead it is a one-word change in
`calculateRangePenalty`.

### 2. Throwable melee weapons stay melee

Part B stored a `range` on wakizashi, knives, yari and mai chong because they *can* be thrown. If
`range` alone decided "is this ranged", every wakizashi swing would open a range prompt.

So a weapon counts as ranged only if it fires ammunition or its Skill is **Kyujutsu, Firearms,
Cannon or Ninjutsu** — 11 weapons. Throwing a wakizashi is a real RAW option this feature does not
cover; it belongs in its own "throw this instead" toggle rather than hidden inside a predicate.
Asserted by A6.

### 3. The 2× cap is applied to all ranged weapons

RAW states the twice-listed-range limit for **bows** specifically. Applying it only to bows would
leave a pistol with no maximum at all, which is worse. The cap therefore applies to every ranged
weapon, and only the popup wording varies — bows get your exact RAW sentence, everything else gets
*"This weapon cannot be used beyond twice its listed range."* Asserted by A18.

### Weapons with no listed range

The Blowgun has no printed range. The prompt degrades gracefully: it offers *"in melee with me"*
and *"not in melee with me"* only, and hides the beyond-range option entirely. Asserted by A8.

---

## Validation Test Suite (77 Feature 1 assertions)

| § | Area | Count | Covers |
|---|---|---:|---|
| F1-A | Pure calculation | 26 | ranged/melee classification, listed-range lookup, penalty maths incl. the spec example, ceil rounding, 2× cap, garbage input, both illegal-shot messages, contributor purity and negative scope |
| F1-B | Prompt behaviour | 9 | prompt only for ranged weapons; melee opens the roll modal in the same tick; subtitle names weapon + range; all three options present; cancelling opens nothing |
| F1-C | Within range | 4 | no modifier bar, unmodified 6k3 pool, correct dice count |
| F1-D | In melee | 9 | −10 to total, bar text, net line, Ten Dice note hidden, dice pool unchanged, **survives a die click** |
| F1-E | Beyond range (valid) | 10 | correct N, `rolledDelta = −N`, kept unchanged, bar wording, and the Ten Dice Rule applied to the **modified** pool (11k3, not 12k3) |
| F1-F | Illegal shots | 9 | both popups with exact RAW wording, roll cancelled, no modal, no bar |
| F1-G | Negative scope & hygiene | 10 | damage rolls, manual tray and skill rolls take no range modifier; registry clean after cancelled and illegal rolls; no range keys in the save; round trip stable |

---

## Regression Matrix

| # | Check | Result |
|---|---|---|
| 1 | `rollDicePool` / `rollWeaponDicePool` / `showRollResult` frozen | PASS — 0 lines removed outside `rollWeaponAttack` |
| 2 | `collectData` / `applyData` frozen | PASS |
| 3 | Ten Dice Rule logic unchanged | PASS — P1/P2 F1 pinned vector |
| 4 | Ten Dice Rule sees the **modified** pool | PASS — E9/E10 |
| 5 | Melee attacks still synchronous | PASS — B2 (the `async` conversion never reaches an `await` for melee) |
| 6 | Feature 0 emphasis re-roll intact | PASS — 72/72 |
| 7 | P1 round context intact | PASS — 46/46 |
| 8 | Part B weapons system intact | PASS — 127/127 |
| 9 | Range modifiers never touch non-attack rolls | PASS — G4/G6/G7 |
| 10 | No new fields in `collectData()` | PASS — G8 (42 fields), G9 |
| 11 | Save format / load behaviour unchanged | PASS — G10 |
| 12 | Registry clean after cancelled + illegal rolls | PASS — G1/G2/G3 |

### Two harness corrections made this run

Both were **stale test assertions**, not code defects:

- **P1/P2 M1 / N1** asserted *"the registry is empty."* That was only ever true before any feature
  existed. Feature 1 legitimately registers a permanent `range` contributor, so the assertion now
  checks the registry matches its **baseline** and that no *test* modifier leaked. This is a test
  amended to reflect a real design change, called out rather than quietly rewritten.
- **F1-F F4 / F9** read a modifier bar left in the *hidden* modal body by the previous roll.
  Closing the modal only hides it; `showRollResult` rebuilds the body on the next roll. Verified
  directly: with a cleared body, an illegal shot creates no bar and opens no modal. The harness
  now clears the body first so the assertion tests what it claims to.

---

## Rollback

| Level | Action | Effect |
|---|---|---|
| Full | Return to the P1/P2 trunk build | Complete revert. Nothing was persisted, so no save migration |
| Feature off | `unregisterPreRollModifier('range')` | Prompt still appears but contributes no modifier |
| Prompt off | In `rollWeaponAttack`, change `if(isRangedWeapon(ctx.entry))` to `if(false)` | No prompt; ranged attacks behave exactly as in the trunk |
| Rounding | `Math.ceil` → `Math.floor` in `calculateRangePenalty` | Switches to the lenient reading |
| Cap scope | Guard `beyondMax` on `entry.skill === 'Kyujutsu'` | Limits the 2× cap to bows only |

No save migration is possible or needed in either direction — Feature 1 persists nothing.

---

## Folder contents

| File | Purpose |
|---|---|
| `l5r-character-sheet part C feature 1 range.html` | The build |
| `l5r-P1-P2-F1-test-harness.js` | Combined harness — F1 + P1/P2 + F0 + Part B |
| `l5r-P1-P2-test-harness.js` | P1/P2 suite (registry assertions updated) |
| `l5r-feature0-test-harness.js` | Feature 0 suite |
| `l5r-partB-test-harness.js` | Part B suite |
| `l5r-crossversion-signature.js` | Cross-build fingerprint |
| `splice_feature1.py` | Splice script that produced this build from the trunk |
| `feature1-code-block.js.txt` | The Feature 1 code block as spliced |
| `DIFF-SUMMARY-vs-P1P2.md` | Line counts, every removed line, change hunks |
| `FEATURE-1-RESULTS.md` | This document |

### Running the harness

```bash
python -m http.server 8799 --directory "."
```

Then in the console on the Feature 1 build:

```js
fetch('/l5r-P1-P2-F1-test-harness.js').then(r=>r.text()).then(s=>(0,eval)(s)).then(o=>console.log(o.failed))
```

Exit condition: `failed === 0`, and all three sub-suites reporting `failed: 0`.
