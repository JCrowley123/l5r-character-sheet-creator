# ROLLBACK — PART I Phase 4.5.11 (Seven Fortunes' Curse, D04a)

## The kill-switch first

`DISADV_FORTUNE_ENABLED = false` in `src/sheet/209.97-feat-disadv-fortune.js`, rebuild. The entry
stops installing, contributes no modifiers, and decorates no row. Nothing else changes. Measured:
the own suite drops to **33/71** with it off.

That is the reversible option. Everything below removes the code.

---

## Surgical removal

```bash
cp -r "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability" /tmp/copy
cd "Versions/PART I — Phase 4.5.11 Seven Fortunes Curse"
python3 qa/remove-phase.py /tmp/copy
```

It deletes this release's own two files, their two manifest entries, and only the blocks its own
`PART I FEATURE 4.5.11 BEGIN <slug>` / `END FORTUNE4511 <slug>` delimiters enclose, then rebuilds
and refuses unless the result hashes to the pre-release build exactly.

**Measured on a real run:** `2,617,077 bytes, sha256 812ac85e88be88e261a834330fd976612a467448f5ad63da16c096ee052db13a` — byte-identical to the Feature 4.5.10 build this
release was added to, including that phase's two same-day real-device corrections. Every other
phase's suite then passes in full: **828/828**.

### What comes out

| File | What |
|---|---|
| `src/sheet/209.97-feat-disadv-fortune.js` | whole file |
| `src/css/59.6-disadv-fortune.css` | whole file |
| `src/sheet/210-test-seam-and-init.js` | block `fortune-seam` |
| `src/sheet/208-feat-roll-preview.js` | blocks `preview-start`, `preview-cancel`, `preview-html`, `preview-toggle` |
| `build/manifest.json` | 2 fragment entries + `expect_sha256` repointed |

---

## ⚠ The live-tree guard — read this before running ANY Part I remover

**Every Part I remover before this one has a guard that cannot fire.** They compute the live tree
as `Path(__file__).resolve().parents[3] / "Part F — …"`. A remover sits at
`Versions/PART I — <phase>/qa/remove-phase.py`, so `parents[2]` is `Versions/` and `parents[3]` is
the **repository root** — while `Part F — …` lives *under* `Versions/`. The path they build has
never existed, `root != live` has always been true, and the refusal has always been decorative.

This was found the hard way while building this release: a run intended as a *demonstration* of the
refusal instead executed against the live Phase 0 tree, deleting this release's own two fragments
and its five blocks. Everything was recoverable and nothing was lost, but the safety net that was
supposed to make that impossible did nothing at all.

**This release's remover fixes it two ways:** it resolves the live tree from `Versions/`
(`parents[2]`), *and* it compares the resolved `build/manifest.json` of the target against the live
one, so a copy reached by a symlink or a different spelling is refused too. It also refuses to run
at all if it cannot locate the live tree, rather than assuming absence means safety.
`qa/test-removal.py` pins all three properties.

**The other ten removers have NOT been touched** — fixing them means editing ten previous phases,
which is its own piece of work. Until then: pass an explicit `/tmp` copy path to any of them, and
never pass the live tree "to see it refuse", because it will not.

---

## Dependencies

### This phase depends on

- **Feature 4.5.2 (`209.85-feat-disadv-config.js`)** — hard. Installs through `D45.install()`,
  resolves through `D45.resolve()`, reaches the pipeline through `D45.modules`, and **reads
  `D45.socialSkills`**, that phase's own authoritative Social Skill list, to scope Ebisu. Removing
  4.5.2 removes this entry's whole surface. The `socialSkills` read fails *safe*: if the list is
  absent, `isSocialSkill()` returns false and Ebisu offers nothing rather than guessing.
- **Phase 3 (Part G) (`208-feat-roll-preview.js`)** — soft. Ebisu's and Jurojin's declarations are
  offered inside its preview through four guarded hooks. Remove Phase 3 and the declarations are
  never offered, so those two Fortunes silently stop applying; the other three are unaffected. Same
  relationship Feature 4.5.10 declares for Maigo no Musha.
- **The trunk** — `makeRollContext`, `ROLL_KINDS`, `getPreRollModifiers`, `recalcAll`,
  `DISADV_LIBRARY`. Normal, needs no declaration.

### What depends on this phase

Nothing. No other phase references `F4511`, `fortune4511*`, `fortunePick` or any
`.fortune4511-*` class, except the fixture corrections listed below, all of which are written to
read correctly with this phase absent.

---

## Cross-phase fixture corrections

Five checks in four other phases' harnesses were corrected. **None of them needs undoing when this
phase is removed** — every one reads correctly in both builds, which is why these shapes were
chosen. They live under `Versions/`, outside the Phase 0 tree, so `remove-phase.py` does not touch
them.

| Harness | Check | Correction |
|---|---|---|
| 4.5.2's | `D45-SCHEMA-TYPES` | The conditional 4.5.10 introduced is now a **table** of `[seamKey, typeString]` pairs in manifest order, since two phases now add a string. A third appends one row. |
| 4.5.8's | `D458-CONTRACT-03` | Same table. Intent unchanged: 4.5.8 contributes nothing of its own. |
| 4.5.9's | `DOUBT459-CONTRACT-03` | Same table. |
| 4.5.10's | `REALM4510-WIRE-03` | Its own `realmPick` addition is still asserted directly; the *tail* after it is now conditional on `F4511`. |
| 4.5.3's | `R453-UNKNOWN-01` | **A fixture whose premise this release destroyed.** It needed a config type D45 does not know, and used `'fortunePick'` on an invented `'Fortune of Some Later Build'` — a fair guess at a type no build would ever ship, right up until D04a shipped exactly it. Replaced with the sentinel `'__unknownTypeFixture'`, which names its own job so no future release reaches for it. What is under test is unchanged: an unrenderable payload must be kept, not silently deleted. |

**Worth carrying forward:** a harness that needs a deliberately-invalid value should use an obvious
sentinel, not a plausible-sounding real name. Two releases have now had to correct one.

---

## Declared, not fixed

- **`D45`'s `norm()` does not fold apostrophes.** `D45.schema()` matches on
  `String(s).trim().toLowerCase()`, so an entry name typed with a straight quote does not find a
  schema installed under a curly one. This release is the first `D45.install()` entry whose
  catalogue name contains a curly apostrophe, so the gap had never been reachable before. Phase
  4.5's own separate lookup (`normalizeAdvName`, in `209.8`) has folded them since it was built.
  Worked around **inside this fragment** — the entry installs under both spellings and `active()`
  filters on a flag rather than a name — because widening `D45`'s `norm()` edits a previous phase
  and changes name matching for eleven live entries. That widening is the better long-term fix and
  wants its own one-line bugfix folder; it would also make every future entry immune without the
  double install. `F4511-CAT-07` and `-08` cover the behaviour either way.
- **Phase 3's roll preview still has no generic declaration registry.** Five hardwired consumers
  now (Void, Kharmic Tie, Maigo no Musha, Ebisu, Jurojin), though only four sets of blocks, because
  this phase's four handle a list. Generalising it means editing Phase 3's own fragment and would
  invert the dependency between 4.5.10 and this phase. It wants its own refactor phase.
- **Bishamon and Hotei are recorded but not automated.** Deferred to D04b by explicit scoping
  decision, not blocked. Both are pickable, both priced correctly (Hotei at 6), both carry a row
  note. D04b adds automation without restructuring anything here.
- **`F4511-DAMAGE-01` and `-02` are triple-protected** and cannot fail from the damage exclusion
  alone — they also depend on the `skillish` gate. See README, "Every check that encodes a decision
  was proven able to fail". `-03` is the one that rests on the exclusion by itself.
- **Not real-device confirmed.** Three new pieces of geometry, including two declaration blocks
  that can stack in one preview — a layout no previous release produced.

---

## The whole-file `originals/` model does not apply

This phase has no `originals/`. It rewrote no existing line anywhere: both shared files receive
purely additive delimited blocks, which is why removal rebuilds byte-identical. Use the surgical
method.
