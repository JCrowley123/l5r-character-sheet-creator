# ROLLBACK — Mastery Rank Labelling

**Removing this fix restores the defect.** That is what a faithful rollback means and it is stated
plainly rather than buried: the sheet goes back to printing `Kenjutsu Rank 8 mastery +1k0` for a
Rank 8 character whose mastery came from Rank 3. Nothing else changes — **no number moves**, and
nothing depends on this fix.

## Restore point

| | |
|---|---|
| Pre-fix build | `6a08d86aa733f243acfa5daa2099bb75fc3fd32dd48490404f05edda3dbb4c7e`, 2,671,095 bytes |
| Post-fix build | `7951c35f4d702a09bc038e4288119a7daad55a92c2ce3d9ee314b4478f3a3410`, 2,681,748 bytes |
| Removal rebuild | **byte-identical to the pre-fix build**, verified |

## Primary method — surgical removal

```bash
cp -r "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 …/"{build,src} /tmp/copy/
python3 "Versions/BUGFIX — Mastery Rank Labelling/qa/remove-phase.py" /tmp/copy
```

It deletes, and asserts it deleted, exactly:

| File | What comes out |
|---|---|
| `src/sheet/209.99-bugfix-mastery-rank-label.js` | the whole file |
| `src/sheet/100-dice-engine.js` | blocks `mastery-label-start`, `mastery-label-rewrite` |
| `src/sheet/210-test-seam-and-init.js` | block `mastery-label-seam` |
| `build/manifest.json` | 1 fragment entry, and `expect_sha256` back to the pre-fix build |

Then it rebuilds and **refuses unless the result hashes to the pre-fix build exactly**.

### ⚠ The live-tree guard — read this before running ANY Part I remover

This remover inherits D04a's **fixed** guard: it resolves the live tree from `Versions/`
(`parents[2]`), compares the resolved `build/manifest.json` of the target against the live one, and
refuses to run at all if it cannot locate the live tree. Demonstrated refusing, under `--dry-run`
so nothing could have been written even if it had not.

**Eight earlier Part I removers still cannot fire.** 4.5.3, 4.5.4, 4.5.5, 4.5.6, 4.5.7, 4.5.8,
4.5.9 and 4.5.10 all resolve the live tree as `parents[3] / "Part F — …"`, which is the *repository
root* — a path that has never existed, so `root != live` has always been true and the refusal has
always been decorative.

> **Correction to what D04a's ROLLBACK records.** It says "every Part I remover before this one"
> has the dead guard. That is wrong about **4.5.2's**, which already resolves from `parents[2]`,
> already refuses parents and descendants, and already rejects a symlinked root
> (`remove-phase.py:166–175`). The base 4.5 remover is a third case again: a substring match on the
> path, which *does* fire against the live tree but carries no symlink or manifest check behind it.
> Audited across all thirteen Part I folders on 17 September. The operational rule is unchanged —
> **always pass an explicit `/tmp` copy, and never pass the live tree "to watch it refuse"**.

## Dependencies

### This fix depends on

- **The trunk** — `getStructuredMastery` (`020-lib-skills-advantages.js`) and
  `getWeaponDamageDice` (`100-dice-engine.js`). Normal, needs no declaration: core sheet code.
- **Nothing else.** No registry seat, no other feature phase, no `D45` surface.

### What depends on this fix

**Nothing.** No other phase references `masteryRankLabelRewrite`, `masteryContributingRanks`,
`masteryExplosionRanks`, `masteryRankPhrase` or `MASTERY_RANK_LABEL_FIX_ENABLED`. Verified with
`qa/feature-dependencies.py` — every reference sits inside a block this fix owns.

### Cross-phase fixture corrections

**None.** No other phase's harness asserts any mastery breakdown string or the breakdown array's
length — checked across every retained suite before building, and confirmed by the combined suite
reading 979/979 with this fix present and 953/953 with it removed. Feature 4.5.12's Bishamon
harness filters on `/^Bishamon:/`, which this fix never touches; `MR-BISHAMON-01` pins that across
the whole 528-row corpus.

## A note for whoever adds a block to one of these files next

**`MARKER_RE` captures the bare word `BUGFIX`, not `BUGFIX MASTERYRANK`.** Its alternation is
`(PART\s+[A-Z]+\s+(?:PHASE|FEATURE)\s+[\d.]+|BUGFIX)`, so a bugfix folder's marker can only ever be
attributed as `BUGFIX`. Three consequences, all live:

1. **`feature-dependencies.py` exits 1 if you pass it `"BUGFIX MASTERYRANK"`** and 0 if you pass it
   `"BUGFIX"`. Both runs are recorded in the README; the five references it reports under the
   long spelling all sit strictly inside this fix's own `BEGIN`/`END` pairs (verified line by
   line), so the exit 1 is an artefact of the spelling, not an unowned reference.
2. **The remover accepts both spellings inside its own blocks** (`OWN_MARKERS`), or it would refuse
   its own code.
3. **Therefore no line inside one of these blocks may mention another bugfix** — it would be
   swallowed as ours rather than refused as foreign. Every in-block reference here is written as
   prose ("the Mastery Rank Labelling folder"), never in marker order, per CLAUDE.md's standing
   lesson. `test_no_block_contains_marker_shaped_prose` reads the **live tree** and enforces it —
   and it fired during this build, on a comment of this fix's own that said the word "bugfix".

## Declared, not fixed

- **No stylesheet, deliberately.** CLAUDE.md's per-phase list names one. This fix adds no element,
  class, custom property or colour — it corrects three sentences the trunk already prints into an
  alert the trunk already styles — so an empty file was not created. A deviation, recorded rather
  than taken silently.
- **`getDamageBonus()` still returns no attribution.** The granting ranks are derived at the point
  of display instead, because seven call sites read that function and only one wants attribution.
  If a second consumer ever needs it, the derivation is three small pure functions already on the
  seam.
- **The damage modal still has no general explanation channel.** Unchanged from Feature 4.5.12's
  declaration. This fix corrects the label wherever it is printed and does not widen where that is.
- **The plural form loses which threshold gave which part.** `Ninjutsu Ranks 3, 7 mastery +1k1`
  names both granting ranks but not that Rank 3 supplied the `+1k0` and Rank 7 the `+0k1`. An
  itemised form was considered and rejected as answering a question nobody asked; if a real-device
  reader asks it, the split is a one-line change in `masteryRankPhrase`'s caller.
- **The `>= 0` prefix test is not observable on its own.** Recorded because it cost a revert cycle
  to establish: the fixed-offset slice re-anchors the match, so relaxing the anchor alone changes
  nothing. The dangerous shape is match-anywhere *plus* slice-from-the-match, which `MR-GUARD-03`
  now catches. Do not "simplify" the two statements into one search.
- **Not real-device confirmed.** Three lines of text in the weapon-info modal. Nothing moves and no
  geometry is involved, but the wording has not been read on the reporting device.

## The whole-file `originals/` model does not apply

This fix has **no `originals/`**, unlike the three earlier bugfix folders. It rewrote no existing
line anywhere — both shared files receive purely additive delimited blocks — which is why removal
rebuilds byte-identical. Use the surgical method.

> **Two self-inflicted whitespace bugs, caught by the removal proof rather than by review.** The
> first removal attempt rebuilt to 2,671,09**6** bytes — one byte heavy — because the inserted
> manifest entry ended `},` followed by a blank line, and the block inserted in `100-dice-engine.js`
> carried a leading blank line of its own on top of the one already there. A cut that stops at its
> own delimiters cannot take either with it. Both are now pinned:
> `test_the_live_manifest_entry_leaves_no_blank_line` reads the live manifest, and the byte-exact
> rebuild assertion catches the other. Same lesson Feature 4.5.12 recorded about `json.dumps()` —
> the removal proof is what finds this class of thing, and neither review nor the harness did.
