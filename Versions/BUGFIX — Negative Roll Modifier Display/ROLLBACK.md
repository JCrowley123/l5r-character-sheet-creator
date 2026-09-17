# ROLLBACK — Negative Roll Modifier Display

**Removing this fix restores the defect.** That is what a faithful rollback of a bugfix means and
it is stated plainly rather than buried: the roll modal goes back to printing
`Keeping 3 of 5 (suggested 3) + -40 bonus` in the keep-note and `12k4 → 10k5 +-40 (Ten Dice Rule)`
in the notation. **No number moves either way** — the arithmetic was never wrong.

## Restore point

| | |
|---|---|
| Pre-fix build | `6722adcb613d50853b538a8d24533a7a57866a9d926dfa2c026d5894d9fed0e8`, 2,682,769 bytes |
| Post-fix build | `c7063f52269c306fcd6596e2103518ff27d4a57b01b0db031115dbb59c58ca15` |
| Removal rebuild | **byte-identical to the pre-fix build**, verified |

## Primary method — surgical removal

```bash
cp -r "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 …/"{build,src} /tmp/copy/
python3 "Versions/BUGFIX — Negative Roll Modifier Display/qa/remove-phase.py" /tmp/copy
```

| File | What happens |
|---|---|
| `src/sheet/209.991-bugfix-negative-roll-modifier.js` | deleted |
| `src/sheet/100-dice-engine.js` | blocks `notation` and `keep-note` **cut and the trunk's original line put back** |
| `src/sheet/210-test-seam-and-init.js` | block `negmod-seam` cut |
| `build/manifest.json` | 1 fragment entry, and `expect_sha256` back to the pre-fix build |

### ⚠ This remover RESTORES, it does not only cut — unlike the previous bugfix's

The Mastery Rank Labelling fix was purely **additive**: every block it added could simply be
deleted. This one **rewrites two existing trunk expressions**, because a hardcoded `+` cannot be
corrected by inserting something beside it. So the remover carries the trunk's own text verbatim in
a `RESTORE` table and puts it back where each block was.

**What makes that text verifiable rather than a copy that can rot:** both blocks keep the trunk's
original expression as their *guarded fallback* (`typeof helper === 'function' ? new : original`),
so the exact text the remover will restore is sitting in the live file right now.
`test_the_live_blocks_carry_the_trunks_own_expression` reads the live tree and asserts it, and
`test_every_restore_key_must_be_reached` fails if the blocks and the `RESTORE` table ever disagree.

### ⚠ The live-tree guard — read this before running ANY Part I remover

This remover inherits D04a's **fixed** guard: it resolves the live tree from `Versions/`
(`parents[2]`), compares resolved `build/manifest.json` paths, and refuses to run at all if it
cannot locate the live tree.

**Eight earlier Part I removers still cannot fire** — 4.5.3 through 4.5.10 resolve the live tree as
`parents[3]`, which is the repository root, a path that has never existed. (4.5.2's was already
correct and the base 4.5 one uses a substring match that does fire; audited across all thirteen
folders on 17 September, correcting the "ten" that 4.5.11's ROLLBACK records.) Always pass an
explicit `/tmp` copy, and never pass the live tree "to watch it refuse".

## Dependencies

### This fix depends on

- **The trunk only** — the two expressions it rewrites live in `100-dice-engine.js`
  (`showRollResult` and `updateRollKeepState`). No registry seat, no other feature phase, no `D45`
  surface.

### What depends on this fix

**Nothing.** No other phase references `signedRollMod`, `rollTotalModNote` or
`NEGATIVE_ROLL_MOD_DISPLAY_FIX_ENABLED`. Verified with `qa/feature-dependencies.py` — exit 0.

### Cross-phase fixture corrections

**None.** No harness asserted either string before this fix. One harness reads
`#rollModalNotation` — Phase 4.5's `adv-config-expansion-harness.js`, which asserts `'3k2'`: no Ten
Dice Rule, no modifier, unaffected. Checked before building, and confirmed by the combined suite
reading 992/992 with this fix present and 980/980 with it removed.

## Declared, not fixed

- **`Ten Dice Rule bonus: +-40` is still malformed, deliberately.** It can only be malformed when
  `totalDelta` is non-zero, which is exactly when `attachRollModifierBreakdown()` hides it — both
  halves measured. Correcting only its sign would leave it calling a wound penalty a *Ten Dice Rule
  bonus*: correctly punctuated and still false. Fixing it properly means changing what it claims,
  which belongs with whoever owns that note. `NEGMOD-HIDDEN-01` pins that it stays hidden, so the
  suite reports it if a later phase unhides it.
- **`result.bonus` still conflates two unlike quantities.** This fix labels the net honestly; it
  does not separate the Ten Dice conversion from the pipeline's `totalDelta`. Separating them would
  change the pipeline's contract, which every 4.5.x entry and the Ten Dice Rule both depend on. The
  itemised breakdown bar (Phase 3 / Phase 4, Part G) already shows the parts to a player who wants
  them.
- **`formatRollNotation()` keeps its hardcoded `+`.** Measured safe: it reads `applyTenDiceRule()`
  directly and that function's bonus is built from non-negative counts. Recorded because a grep for
  the defect finds it.
- **`NEGMOD-PURE-03` cannot go red alone** — any wrong character also fails `PURE-01` or `PURE-02`.
  Kept for its failure message, and declared rather than counted as an independent check.
- **Not real-device confirmed.** Two strings in the roll modal. Nothing moves and no geometry is
  involved, but the wording has not been read on the reporting device — and note that the *negative*
  case is the one nobody has seen rendered correctly yet, since it has been malformed since Part C.

## The whole-file `originals/` model does not apply

This fix has **no `originals/`**. It rewrites two lines, but the remover puts those two lines back
surgically rather than restoring a whole-file snapshot — which matters, because
`100-dice-engine.js` also carries Feature 4.5.12's two Bishamon blocks and the Mastery Rank
Labelling fix's two blocks, and a snapshot restore would silently delete them. That is the failure
CLAUDE.md warns about, avoided by construction.

> **A mistake worth recording.** The remover was first written carrying the *previous* bugfix's
> `END` marker in its regex, so every `END NEGMOD` line in this fix's own blocks read as an orphan.
> It **refused to run** rather than mis-cutting — the guard doing its job — and
> `test_a_stale_marker_name_is_caught` now pins that. For the next bugfix folder derived from this
> one: rename every marker reference, not just `MARKER`.
