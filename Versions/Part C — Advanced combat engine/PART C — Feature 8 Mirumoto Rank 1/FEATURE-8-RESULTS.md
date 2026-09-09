# Part C — Feature 8: Mirumoto Bushi, School Rank 1

**Build:** `l5r-character-sheet part C feature 8 mirumoto.html` (1,191,524 chars, sha256 `bfbbd19197c9fd81…`)
**Trunk:** `PART C — Feature 7 Dual-Wielding/l5r-character-sheet part C feature 7 dualwield.html`
**Harness:** `l5r-P1-P2-F8-test-harness.js`

| Suite | Result |
|---|---:|
| **Feature 8** | **112/112** |
| Feature 7 | 147/147 |
| Feature 6 | 146/146 |
| Feature 4 | 89/89 |
| Feature 3 | 53/53 |
| Feature 2 | 80/80 |
| Feature 1 | 77/77 |
| P1 + P2 | 46/46 |
| Feature 0 | 72/72 |
| Part B | 127/127 |
| Schoolfree bugfix | 30/30 |
| **Total** | **979** |

Each regression figure is that suite's **own** assertions; the suites were run side by side rather
than nested, so no assertion is counted twice (Feature 7's 156 is 147 of its own plus 9 rows
reporting on the suites below it).

Diff vs trunk: **217 added, 1 removed** — and the one removed line is the Armor TN sum, reformatted
because it gained a sixth term. `rollDicePool`, `rollWeaponDicePool`, `rollExplodingD10`,
`applyTenDiceRule`, `showRollResult`, Part B's damage arithmetic, Feature 6's ammunition logic and
Feature 4's Void logic are untouched. **`collectData` and `applyData` were not modified at all.**
The save still has exactly 42 `f_` fields.

---

## What was implemented, and what was refused

RAW, Mirumoto Bushi School Rank 1 — *Way of the Dragon*:

> "When wielding a katana in your main hand and a wakizashi in your off hand, you suffer no
> penalties of any kind for dual wielding, and you gain a bonus of your School Rank to your Armor
> TN (this is cumulative with the normal bonus for wielding two weapons). Additionally, when you
> are targeted with a spell, you may raise or lower the TN of that spell's Spellcasting Roll by 5."

| Clause | Status |
|---|---|
| "no penalties of any kind for dual wielding" | **Implemented** — both of Feature 7's penalties go to 0 |
| "a bonus of your School Rank to your Armor TN" | **Implemented**, cumulative with Feature 7's Insight Rank bonus |
| the Spellcasting Roll adjustment | **Not implemented**, per the brief — and it would have been the wrong thing to build anyway |

On that third clause: it is not merely that the sheet lacks a Spellcasting Roll TN. The adjustment
is a **reaction made by the spell's target**, not by the person rolling, so even a full spellcasting
TN system would not have a natural place for it — it belongs to whoever is being targeted, on
someone else's roll. There is nothing here to attach it to, and a control that adjusts nothing
would be worse than its absence.

**Ranks 2–5 are absent**, each for a concrete reason rather than by omission: Rank 2 needs Iaijutsu
duels, Rank 3 needs Simple vs Complex action economy, Rank 4 needs the Reaction Stage and
per-target next-turn bonuses, Rank 5 needs turn-based action sequencing and Free Actions. None of
those systems exist on this sheet. They appear nowhere in the UI, the save, the modifier bar, the
roll pipeline, Armor TN or the dual-wielding logic.

`getMirumotoRank()` does report the true School Rank — because the Armor TN bonus scales with it —
but no Rank above 1 unlocks any additional behaviour.

---

## Four decisions worth explaining

### 1. Nothing is stored, so nothing can go stale

The brief asked for automation derived rather than saved, and the payoff is larger than a smaller
save file. Every question Feature 8 answers is asked fresh: the School and Rank come from the
Schools list (`f_schoolsData`, or the `f_school`/`f_rank` pair `getSchoolsList()` migrates from),
the pairing from the weapon rows' library keys, the hands from Feature 7's selectors.

That is why `collectData` and `applyData` needed no edit at all — a first for this run of features
— and why changing School, buying a Rank, or sheathing the wakizashi makes the automation appear
or vanish on the next recalc with no state to reconcile. **F8-D** asserts the save shape is
unchanged, that no Mirumoto key reaches any field or weapon row, and that a save→load→save cycle
is byte-stable.

### 2. The School Rank is read, not asserted

School Rank on this sheet is *derived*: `recalcAll()` recomputes it from Insight through
`computeCappedActiveRank()`. A test cannot simply write 3 into `f_rank` and expect it to stay —
the first recalc will overwrite it with whatever Insight actually supports. The harness therefore
buys enough Insight to sustain the Rank it wants and lets the sheet settle, which is also what
proves the automation reads the real, cap-respected Rank rather than a number the test invented
(**F8-A A16** asserts `getMirumotoRank()` equals the sheet's own `f_rank`).

This surfaced immediately in development: a fixture asking for Rank 3 came back as Rank 1, because
the character did not have the Insight for it. That is correct behaviour, and worth knowing about
before it looks like a bug.

### 3. A frozen School still knows Way of the Dragon

Taking a second School freezes the first: Mirumoto stops being the active School and `f_school`
starts naming something else. But the character has not forgotten a Rank 1 Technique.

So `getMirumotoRank()` scans the whole Schools list rather than reading `f_school`, and reports a
frozen entry's locked `frozenRank`. **F8-A A33–A36** build a Mirumoto 3 / Hida 1 multi-school
character and assert the waiver still applies at Rank 3 while the active School reads "Hida Bushi".

### 4. The waiver is broader than a Skill mastery, deliberately

Feature 7 was careful to keep the off-hand penalty and the main hand's −5 separate, because RAW
scopes a Skill mastery (Knives 3, War Fan 3) to *off-hand* penalties only. Way of the Dragon says
"no penalties **of any kind**", which is the rule that shows why that separation mattered:

| Waiver | Off-hand penalty | Main-hand −5 |
|---|---|---|
| Knives Rank 3 mastery | waived | **still applies** |
| Way of the Dragon | waived | **waived** |

**F8-B B10/B11** assert the mastery leaves the main hand paying −5; **B12** asserts Way of the
Dragon does not. The School waiver is also checked *ahead* of the free-text Technique waiver
(**B13**), so a Mirumoto who has also written "no penalties for dual wielding" into some other
Technique is credited to their School rather than to the note.

---

## How little new machinery this needed

Feature 8 registers **no new pre-roll contributor** (**F8-E13** asserts the registry is still
exactly `range@20, arrow@25, stance@30, offhand@35, wounds@40, void@50`), adds no modal, no CSS and
no save field. It works by returning a waiver object in the shape Feature 7's penalty functions
already return, so Feature 7's existing plumbing renders it without knowing Feature 8 exists:

* the **modifier bar** prints `Dual-wielding: no penalty (Way of the Dragon)` and
  `Off-hand: no penalty (Way of the Dragon)` through `offHandPreRollModifiers`, unmodified;
* the **row note** prints the waiver through `handednessNoteBits`, which gained one line appending
  Feature 8's two extra bits;
* the **info panel** gains a `SCHOOL AUTOMATION` section.

Both bar entries are `informational`, so they carry text and move no dice (**B16**, **B18**) —
the channel Feature 6 introduced for exactly this.

The Armor TN bonus is one term added to the one line in `recalcAll()` where armour, stance, Void
and Feature 7's Insight Rank bonus already meet. **F8-C** asserts all of it stacks: base + Insight
Rank + School Rank, then stance on top, then Void on top of that.

---

## Dormancy

Nothing happens unless **all four** conditions hold: School is `Mirumoto Bushi` (exactly — the
`Mirumoto Taoist Swordsman [Bushi]` is a different School with different Techniques and is
excluded, **A12**), Rank ≥ 1, katana in the main hand, wakizashi in the off hand.

Asserted at **A4–A9** (blank sheet), **A17–A21** (School but no blades — the info panel still
explains what is missing rather than staying silent), **A22/A25** (both blades but wrong hands, and
the reversed pairing), **A26/A27** (wrong blades), **A28–A30** (right blades, wrong School),
**A37** (Rank 0), and the whole of **F8-E** for the zero-change guarantee — including that a
non-Mirumoto dual-wielder still pays −10 off-hand and −5 main-hand exactly as Feature 7 shipped.

The library link decides what a weapon is, not the name box: a katana renamed "Grandfather's
blade" still counts (**A31**), and a row merely *called* Katana but linked to nothing does not.

---

## One harness fixed, and why it is not an assertion change

`l5r-P1-P2-F7-test-harness.js` answered each modal prompt after a single `await tick()`
(`setTimeout 0`). How many promise links sit between a click and the next prompt being painted
varies with nesting depth and with how fast timers happen to be running, so one turn of the event
loop is not a reliable way to know a modal is up. When it lost that race the check found no modal,
clicked nothing, and the suite sat forever awaiting a click that would never come — observed twice,
at two different prompts.

Its waits now poll for the condition, draining microtasks first (never throttled, and the prompts
resolve through a promise chain) before falling back to timers, and race each wait against the
attack promise settling so the no-prompt path still falls straight through instead of burning a
timeout. **Every assertion in that suite is unchanged and all 147 pass**; before the fix the suite
could not complete at all in this environment.

This was attempted once during Feature 7 and reverted, because it could not be verified end to end
at the time. It can be now: the suite goes from a permanent stall to 147/147 in about two minutes.

---

## Known consequence

`l5r-crossversion-signature.js` is **unaffected** this time. It fingerprints `collectData()`, and
Feature 8 does not touch the save shape — the first feature in this run for which that is true.

---

## Deliverables

| File | What |
|---|---|
| `l5r-character-sheet part C feature 8 mirumoto.html` | The build |
| `feature8-code-block.js.txt` | The Feature 8 code block as spliced |
| `splice_feature8.py` | Splice script that produced this build |
| `l5r-P1-P2-F8-test-harness.js` | Combined harness — F8 + the ten suites below |
| `l5r-P1-P2-F7-test-harness.js` | Feature 7 suite (waits made condition-based — see above) |
| `l5r-P1-P2-F6/F4/F3/F2/F1-test-harness.js`, `l5r-P1-P2-test-harness.js`, `l5r-feature0-test-harness.js`, `l5r-partB-test-harness.js`, `l5r-schoolfree-bugfix-harness.js` | Unmodified |
| `p12-harness.js`, `f0-harness.js`, `partB-harness.js`, `schoolfree-harness.js` | Byte-identical copies under the short names the Feature 4 harness fetches |
| `l5r-crossversion-signature.js` | Cross-build fingerprint (unmodified) |
| `patch_stance_icons.py` | Optional stance artwork, retargeted to this build — see below |
| `DIFF-SUMMARY-vs-Feature7.md` | Line counts, the one removed line, change hunks |
| `FEATURE-8-RESULTS.md` | This document |

Rebuild — verified byte-for-byte, md5 `42c8331f1b95f06c…`:

```bash
python splice_feature8.py
```

The stance artwork is a separate, optional step, deliberately **not** applied to the shipped build
because it would break that reproducibility:

```bash
python patch_stance_icons.py
```

Run the tests:

```bash
python -m http.server 8820 --directory "."
```

```js
fetch('/l5r-P1-P2-F8-test-harness.js').then(r=>r.text()).then(s=>(0,eval)(s)).then(o=>console.log(o.failed))
```

Exit condition: `failed === 0` with all ten sub-suites reporting `failed: 0`.
