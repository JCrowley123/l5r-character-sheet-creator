# Rolling back Part G, Phase 3

## Dependencies

Per `CLAUDE.md`'s "Every feature must be surgically removable", declared here so a removal is
never a surprise. Verified with
`python3 qa/feature-dependencies.py src/sheet/208-feat-roll-preview.js "PART G PHASE 3" --also rollPreviewOverlay rollPreviewBody rollPreviewSubtitle rollPreviewClose rp-pool rp-mod rp-void`
— clean: every reference sits inside a block this phase's own marker owns.

- **This phase depends on:** the trunk only — the pre-roll pipeline
  (`getPreRollModifiers`, `applyPreRollModifiers`, `makeRollContext`, `ROLL_KINDS`), Part C
  Feature 4's Void system (`getVoidPending`, `setVoidPending`, `spendVoid`, `canSpendVoid`,
  `findVoidOption`), and the existing `.roll-modal` shell it renders inside. All of that is core
  sheet code, none of it removable. **It does not depend on Part H Phase 2**, despite the
  roadmap listing "Sidebar (Void pips)" under Dependencies: what it actually needs is the Void
  *system*, which is Part C, not Phase 2's Quick Access panel. Removing Phase 2 does not affect
  this phase, and that was verified rather than assumed.
- **Removable features that depend on this phase: Part G Phase 4 ("Explain This Roll") — SOFT.**
  It took the dependency this section anticipated: `attachRollModifierBreakdown()` in the trunk
  now calls `buildRollModifierRows()` instead of keeping a verbatim copy of it. The call is
  guarded and the old copy remains as a fallback, so **removing this phase does not break Phase
  4** — the post-roll bar degrades to its own rendering. Measured: Phase 4's harness reads 20/22
  against a build with this phase removed, failing only the two checks that compare against a
  preview which no longer exists. Also declared in Phase 4's own `ROLLBACK.md`.
- **This phase optionally depends on Phase 4 — SOFT, and in the other direction.** This phase's
  fragment carries one guarded `PART G PHASE 4` block: where the preview printed this phase's
  one-line prose summary (`poolBasisText()`), it now prefers Phase 4's itemised rows when that
  phase is present, because they cover more roll kinds. Delete Phase 4 and the prose line
  returns. Measured: **this phase's harness reads 35/35 both with Phase 4 present and with its
  fragment deleted**, so neither phase needs the other to be correct — either can be removed
  alone, in either order.

## The fast way first: one flag

Open `src/sheet/208-feat-roll-preview.js` and change:

```js
const ROLL_PREVIEW_ENABLED = true;
```

to `false`, then rebuild. Every roll fires immediately again, exactly as before this phase; the
fragment, the modal markup and the CSS all stay in the build, so flipping it back is equally
cheap. Verified: a scratch build with the flag flipped drops this phase's harness from 21/21 to
**7/21**, failing exactly the checks that require a preview to exist.

This is a runtime off-switch, not a removal. For an actual removal, continue below.

## Surgical removal (verified, order-independent)

```bash
cd "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability"

rm src/sheet/208-feat-roll-preview.js
```

Then, in `build/manifest.json`, delete the one `fragments` entry whose `"file"` is
`"src/sheet/208-feat-roll-preview.js"`.

In `src/css/10-sheet-base.css`, delete everything from the
`/* ---------- PART G PHASE 3: Smart Roll Preview ---------- */` header down to (but not
including) the next header, `/* ---------- Print / PDF export (physical play) ---------- */`.

In `src/markup/20-fixed-layers.html`, delete the `<!-- PART G PHASE 3: SMART ROLL PREVIEW -->`
comment block and the `#rollPreviewOverlay` overlay that follows it, down to (but not including)
`<div class="roll-modal-overlay" id="rangePickModalOverlay" ...>`.

In `src/sheet/210-test-seam-and-init.js`, delete the guarded seam-export block:

```js
// ---- PART G PHASE 3: Smart Roll Preview ----
if (typeof showRollPreview === 'function') {
  Object.assign(window.__L5R_TEST__, {
    showRollPreview, rollPreviewGate, buildRollModifierRows, ROLL_PREVIEW_ENABLED,
    ROLL_PREVIEW_VOID_KEYS,
  });
}
```

In `src/sheet/130-round-and-pipeline.js`, delete the gate — the `PART G PHASE 3` comment block
and the four lines from `if(typeof rollPreviewGate === 'function'){` through its closing brace —
and the two-line comment above `const mods = ...` that explains why resolution happens after the
gate.

In `src/sheet/100-dice-engine.js`, delete the two `PART G PHASE 3` comment blocks and their
guards: `if(!rolled) return;` in `rollSkill()`, and `if(!rolled) return false;` in
`performWeaponAttack()`.

**The `async`/`await` plumbing can stay exactly where it is.** `await` on a plain object is a
no-op, so `rollSkill()` and `performWeaponAttack()` remain correct against a synchronous
`rollWithModifiers()`, and nothing calls either of them for a return value. Reverting
`async function rollWithModifiers` to `function rollWithModifiers`, `async function rollSkill` to
`function rollSkill`, and dropping the two `await` keywords is therefore **tidying, not a
correctness step** — do it if you want the diff clean, skip it safely if you are in a hurry. This
is the one part of the removal with no failure mode either way.

Rebuild, capture the new hash, write it back into the manifest:

```bash
python3 build/recombine.py            # note the printed sha256
# paste that hash into manifest.json's "expect_sha256"
python3 build/recombine.py --verify   # now reports BYTE-IDENTICAL
python3 build.py --check-drift        # from the repo root
```

## What that leaves

- **Every roll fires immediately again**, as it did before this phase.
- **The Void card is once more the only place to arm a one-roll effect.** Nothing about Void
  arithmetic, the once-per-Round ledger, or the pending mechanism changes: this phase only ever
  drove the existing `spendVoid()` and never reimplemented any of it.
- **The post-roll breakdown bar is untouched.** `attachRollModifierBreakdown()` never called into
  this phase, which is exactly why it survives the removal (see *Dependencies* above).
- **Phase 1.5's registry, contributors and baseline are untouched** — this phase added no
  contributor and changed no arithmetic. Its harness should still read 34/34 after the removal.

## Confirming the rollback

This phase's own harness (`qa/roll-preview-harness.js`) is written against the built sheet and
will report a low score against a rolled-back build (the preview elements return `null`) —
expected, not something to chase. What should still pass is everything else:

```bash
python3 build.py --check-drift
python3 "…/PART F — Phase 0 …/qa/inventory.py" "…/PART F — Phase 0 …/l5r-character-sheet.html"
```

`element_id_count` should read back to **254**, and `roll_modal_overlay_count` to **23**.

## Restore points

| Artefact | Value |
|---|---|
| Phase 0 build `sha256`, before this phase | `431bdefb99e4b619ff0b1409533bdaf05b491c81cdeb7c874144faeefa8b7ea2` |
| Phase 0 build `sha256`, after this phase (current) | `5281e4720f63501cb515f1971f35ffcd32f677808894f2d758df0dbe7279b22f` |
| `element_id_count`, before / after | 254 / **258** (the overlay, its subtitle, its close button, its body) |
| `roll_modal_overlay_count`, before / after | 23 / **24** — this phase adds one modal, so this invariant legitimately moves. `CLAUDE.md` lists it among the counts a build must not change *accidentally*; recorded here so the change is traceable rather than surprising |
| `section_count` | unchanged: 10 |
| `window.__L5R_TEST__` key count, before / after | 297 / **302** (+`showRollPreview`, `rollPreviewGate`, `buildRollModifierRows`, `ROLL_PREVIEW_ENABLED`, `ROLL_PREVIEW_VOID_KEYS`) |
| `window.__L5R_CAROUSEL__` method count | unchanged: 11 |

## One more thing this phase moved

Creating this folder made Part G's **second** build folder, which under `CLAUDE.md`'s convention
triggers the theme wrapper. `Versions/PART G — Phase 1.5 Roll Pipeline Consolidation/` was moved
to `Versions/Part G — Combat & Roll Engine/PART G — Phase 1.5 Roll Pipeline Consolidation/`
(a `git mv`, recorded as a rename). Rolling back *this* phase does not undo that move — the
wrapper is a filing decision, not part of this phase's diff. If Phase 1.5 ever ends up the only
Part G folder again, the convention would put it back flat at `Versions/` top level.
