# ROLLBACK — PART I Phase 4.5.12 (Seven Fortunes' Curse: Bishamon, D04b)

## The kill-switch first

`DISADV_BISHAMON_ENABLED = false` in `src/sheet/209.98-feat-disadv-fortune-bishamon.js`, rebuild.
The install never runs, so Bishamon stays exactly as D04a shipped it — `effect: 'deferred'`, that
phase's own honest row note, its quiet dashed badge — and both hooks in the damage maths become
no-ops. Nothing else changes. Measured: the own suite drops to **24/45** with it off.

That is the reversible option. Everything below removes the code.

---

## Surgical removal

```bash
cp -r "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability" /tmp/copy
cd "Versions/PART I — Phase 4.5.12 Seven Fortunes Curse Bishamon"
python3 qa/remove-phase.py /tmp/copy
```

It deletes this release's own two files, their two manifest entries, and only the blocks its own
`PART I FEATURE 4.5.12 BEGIN <slug>` / `END BISHAMON4512 <slug>` delimiters enclose, then rebuilds
and refuses unless the result hashes to the pre-release build exactly.

**Measured on a real run, first attempt:** `2,649,854 bytes, sha256
28e017553102e860e0212869c80ef4bf90c8abe2127a35ef7b78c3e34dea76d2` — byte-identical to the D04a
build this release was added to. Every other phase's suite then passes in full: **902/902**.

### What comes out

| File | What |
|---|---|
| `src/sheet/209.98-feat-disadv-fortune-bishamon.js` | whole file |
| `src/css/59.7-disadv-fortune-bishamon.css` | whole file |
| `src/sheet/210-test-seam-and-init.js` | block `bishamon-seam` |
| `src/sheet/100-dice-engine.js` | blocks `damage-strength`, `damage-roll-note` |
| `build/manifest.json` | 2 fragment entries + `expect_sha256` repointed |

### ⚠ This is the first 4.5.x release to put blocks in TRUNK code

`100-dice-engine.js` is Part B's damage maths, not another feature phase's fragment. That is
**forced, not chosen**: `rollWeaponDamage()` does not go through the pre-roll modifier pipeline, so
the Strength contribution can only be reduced where it is computed. See README, "The measurement
that changed the design".

Both blocks are **purely additive** — no existing line is rewritten anywhere — which is what lets
the removal rebuild byte-identical. If a future phase needs to touch section 3 of
`getWeaponDamageDice()`, note that the `damage-strength` block sits *between* section 3 and section
4 and reads `entry`, `traitName`, `traitValue`, `numDice` and `keepDice`, all of which are that
function's own locals.

---

## The live-tree guard

This remover inherits **D04a's fixed guard**: it resolves the live tree from `Versions/`
(`parents[2]`, not `parents[3]`) *and* compares the resolved `build/manifest.json` of the target
against the live one, so a copy reached by a symlink or a different spelling is refused too. It
also refuses to run at all if it cannot locate the live tree.

**The ten removers before D04a's are still unfixed.** They compute the live tree as
`parents[3] / "Part F — …"`, which is the repository root — a path that has never existed — so
`root != live` has always been true and the refusal has always been decorative. D04a found that the
hard way, by a run intended as a *demonstration* of the refusal that instead executed against the
live tree. Until they are fixed: pass an explicit `/tmp` copy path to any of them, and **never pass
the live tree "to see it refuse", because it will not.**

---

## Dependencies

### This phase depends on

- **Feature 4.5.11 / D04a (`209.97-feat-disadv-fortune.js`)** — hard, and unusually intimate. This
  phase does not install a catalogue entry of its own; it **retunes D04a's Bishamon spec in place**
  (`F4511.FORTUNES.Bishamon.effect` and `.note`) and **wraps `F4511.decorateRow`**, keeping the
  previous binding. It also reads `F4511.active()` to count configured rows. Remove D04a and this
  phase has nothing to attach to — but it fails **safe**: every read goes through `api.host()`,
  which returns null when `F4511` is absent, so `install()` returns false, `count()` returns 0 and
  the damage hook returns null. The sheet behaves as if this phase were not there.
- **Phase 4.5.2 (`209.85-feat-disadv-config.js`)** — indirect, through D04a. Not read directly.
- **The trunk** — `getWeaponDamageDice`, `getTraitValueByName`, `rollWeaponDamage`, `recalcAll`.
  Normal, needs no declaration, except that the *first two are read from inside Part B's own file*
  via the two additive blocks rather than called from this fragment.

### What depends on this phase

Nothing. No other phase references `F4512`, `fortuneBishamon*`, `DISADV_BISHAMON_ENABLED` or
`.fortune4512-*`, except the one fixture correction below, which is written to read correctly with
this phase absent.

---

## Cross-phase fixture correction

**One check, in D04a's own harness. It does not need undoing when this phase is removed** — it
reads correctly in both builds, which is why this shape was chosen. It lives under `Versions/`,
outside the Phase 0 tree, so `remove-phase.py` does not touch it.

| Harness | Check | Correction |
|---|---|---|
| D04a's | `F4511-DEFER-Bishamon-NOTE` | Asserted that **both** deferred Fortunes say "not yet" on the row — true only while both really are deferred. It now asks the live seam whether a later phase has automated *that* Fortune, and asserts the deferral claim exactly when the Fortune is deferred. Hotei is unaffected and still asserted verbatim. Verified **74/74 with this phase present and 74/74 with it removed**. |

The companion check `F4511-DEFER-Bishamon-MODS` was **left alone deliberately** and still passes:
Bishamon contributes no pre-roll modifiers even now, because it works outside the pipeline
entirely. That check's intent is unchanged and its value went up, not down.

**Worth carrying forward:** when a later phase completes something an earlier one shipped as
deferred, the earlier phase's "this is deferred" check should ask the *seam* whether it still is,
not be deleted. D04b will need the same correction for Hotei.

---

## Declared, not fixed

- **The floor at Strength 1 is a measured decision, not a rule.** Effective Strength floors at
  `MIN_EFFECTIVE_STRENGTH = 1`, so at Strength 1 Bishamon costs nothing on damage. The reasoning is
  the sheet's own `min="1"` on the Strength input, plus the fact that an effective 0 makes unarmed
  roll `0k1` which `rollWeaponDamage()` refuses outright. **This is the one thing in this release a
  sourcebook could overturn**, and it is a one-line change if it does — the constant is named and
  isolated for exactly that reason. `F4512-FLOOR-01` pins the current behaviour.
- **The damage modal has no general explanation channel, and this phase did not build one.**
  `getWeaponDamageDice()` returns a full `breakdown` array that nothing renders unless a pipeline
  modifier happens to exist, because the only consumer is the ammo phase's decorator. This release
  appends one plain `.roll-note` rather than generalising it. A proper "explain this damage roll"
  pass — the damage-side counterpart of Phase 4 (Part G) — wants its own phase.
- **`rollWeaponDamage()` bypasses the pre-roll modifier pipeline entirely.** Not a defect of this
  phase, and not fixed here: routing damage through `rollWithModifiers()` would change behaviour
  for Wound Penalties, Void and every D45 entry at once, all of which currently return null for
  DAMAGE *and rely on never being applied anyway*. Recorded because the next person to assume "a
  modifier will reach a damage roll" will be wrong, and the measurement is in this phase's own
  fragment comment.
- **Hotei is still deferred.** D04b's second half. It is **source-blocked rather than expensive**,
  per the audit: "covered Technique/Advantage activations requiring one Void" cannot be identified
  from this sheet, because technique descriptions are labelled in-code as paraphrases, 98 of 338
  technique names carry no description at all, and no structured Void-cost field exists anywhere.
- **Duplicate entries stack.** Two configured Bishamon rows reduce Strength by two, floored.
  Inherited from D04a's own per-row `modifiers()` shape rather than decided here; the rules say
  nothing about carrying the same Fortune's curse twice. `F4512-STACK-01` pins it.
- **Not real-device confirmed.** One new full-width row note and one new line in the damage modal.

---

## The whole-file `originals/` model does not apply

This phase has no `originals/`. It rewrote no existing line anywhere — both shared files receive
purely additive delimited blocks, which is why removal rebuilds byte-identical. Use the surgical
method.
