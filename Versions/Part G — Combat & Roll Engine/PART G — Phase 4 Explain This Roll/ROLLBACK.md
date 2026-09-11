# Rolling back Part G, Phase 4 — "Explain This Roll"

## Dependencies

Per `CLAUDE.md`'s "Every feature must be surgically removable", declared here before shipping so
a removal is never a surprise. Verified with:

```bash
python3 qa/feature-dependencies.py src/sheet/209-feat-roll-breakdown.js "PART G PHASE 4" \
  --also rp-base rp-baserow
```

— clean: every reference sits inside a block this phase's own marker owns.

- **This phase depends on the trunk:** `ROLL_KINDS`, and the roll contexts themselves. Normal,
  no declaration needed.
- **This phase depends on Part G Phase 3 (Smart Roll Preview) — SOFT.** The trunk's post-roll
  bar now calls Phase 3's `buildRollModifierRows()` instead of keeping a verbatim copy of it.
  The call is guarded and the old copy is still there as a fallback, so **removing Phase 3 does
  not break this phase** — the bar degrades to its own rendering. Measured: this phase's harness
  reads 20/22 against a Phase-3-removed build, failing only the two checks that compare against
  a preview which no longer exists. Declared in Phase 3's `ROLLBACK.md` as well.
- **Phase 3 optionally depends on this phase — SOFT, and also declared there.** Phase 3's
  fragment carries one guarded `PART G PHASE 4` block: the preview prefers this phase's rows
  over its own one-line prose summary when this phase is present. Delete this phase and the
  prose line returns. Measured: Phase 3's harness reads **35/35 both with this phase present and
  with its fragment deleted**.
- **Removable features that depend on this phase:** none beyond that optional Phase 3 block.

Neither direction is a hard dependency. Either phase can be removed alone, in either order,
without the other failing — which is the property the two harnesses above actually measure
rather than assert.

## The fast way first: one flag

In `src/sheet/209-feat-roll-breakdown.js`:

```js
const ROLL_BREAKDOWN_ENABLED = false;
```

then rebuild (`python3 build/recombine.py` from the Phase 0 folder). `buildRollBasePoolRows()`
returns `[]` for everything, so every base-pool row disappears from both the preview and the
result, the preview falls back to Phase 3's prose summary, and the post-roll bar is back to
modifiers-only. Nothing else in the codebase changes and the fragment stays in the build, ready
to flip back on.

Verified: a scratch build with the flag flipped drops this phase's harness from 22/22 to
**6/22**, with no page errors — and Phase 3's harness still reads 35/35.

## Surgical removal (verified, order-independent)

```bash
cd "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability"
```

### 1. Delete the fragment and its manifest entry

```bash
rm src/sheet/209-feat-roll-breakdown.js
```

and remove the `"src/sheet/209-feat-roll-breakdown.js"` object from `build/manifest.json`.

### 2. `src/sheet/130-round-and-pipeline.js`

Restore the call site:

```js
attachRollModifierBreakdown(adj, result.bonus);
```

(dropping the `context, baseRolled, baseKept` arguments and the `PART G PHASE 4` comment above
it), and in `attachRollModifierBreakdown()`:

- restore the signature to `function attachRollModifierBreakdown(adj, tenDiceBonus){`
- restore the opening guard to `if(!adj || !adj.applied || !adj.applied.length) return null;`
  and delete the `hasMods` / `baseRows` lines above it
- restore `if(adj.totalDelta !== 0){` (drop the `hasMods &&`)
- delete the `if(hasMods && typeof buildRollModifierRows === 'function')` branch and its `else`
  wrapper, leaving the inline `rows` loop that is already there as the fallback — it is a
  verbatim copy of the pre-Phase-4 code
- restore `const net = (tenDiceBonus || 0) + adj.totalDelta;`
- restore the single-group `bar.innerHTML`, dropping `renderRows()` and the `Pool` group

`originals/src/sheet/130-round-and-pipeline.js` holds that file exactly as it was, and is safe
to restore wholesale **only if** no later phase has since edited it — check first.

### 3. The declaring callers

Each carries a `PART G PHASE 4` comment above the keys it added. Delete the comment and the
added keys; leave everything else on the context untouched.

| File | Remove from the context |
|---|---|
| `src/sheet/080-identity-build-ui.js` | `ringValue:rank` (Ring roll), `traitValue:rank` (Trait roll) |
| `src/sheet/100-dice-engine.js` | `traitValue:traitVal` (`rollSkill`), `traitName:atk.traitName, traitValue:atk.traitValue` (attack) |
| `src/sheet/110-modals-trackers.js` | `traitValue:rank` (Unskilled); `ringValue:ring, schoolRank, schoolRankBase` and the `const schoolRankBase = …` line (Casting Roll); `ringValue:ring, schoolRank:rankBonus, schoolRankLabel:…` (Maho); `traitValue:reflexes, insightRank` (Initiative) |
| `src/sheet/180-feat-stances.js` | `traitName:'Reflexes', traitValue:trait, skillRank:rank` (Full Defense) |

**These are safe to leave in place.** They are inert data — no contributor reads them and no
arithmetic depends on them — so a partial rollback that removes only the fragment is still
correct. Remove them for tidiness, not for correctness.

### 4. `src/sheet/208-feat-roll-preview.js` (Phase 3's fragment)

Delete the guarded `PART G PHASE 4` block and restore Phase 3's own two lines:

```js
        const basisText = poolBasisText(context);
        if(basisText){
          html += '<div class="rp-basis">' + escHtml(basisText) + '</div>';
        }
```

### 5. `src/sheet/210-test-seam-and-init.js`

Delete the guarded `PART G PHASE 4` seam-export block (four lines plus its marker).

### 6. `src/css/10-sheet-base.css`

Two blocks, both delimited by their own `PART G PHASE 4` marker, both safe to delete outright:

- the rule after `.roll-mod-net` (the `:not(:first-child)` group separator), which is terminated
  by the next phase's marker;
- the base-pool block, which runs from its marker to the
  `/* ---------- PART G PHASE 3 (continued) ---------- */` line and contains exactly two rules
  (`.rp-base` and `.rp-baserow`). Delete up to, but not including, that continuation marker.

**That continuation marker is load-bearing — do not remove it.** It hands ownership of the rules
below back to Phase 3. An earlier version of this phase had no such marker, so this block's own
marker silently owned the four Phase 3 rules that followed it and a surgical removal would have
deleted them too. `qa/feature-dependencies.py` caught it; review had not. `.rp-baserow`
duplicating the modifier row's declarations instead of joining its selector is the other half of
that fix — it keeps every line this phase owns deletable without touching a Phase 3 rule.

### 7. Rebuild

```bash
python3 build/recombine.py            # note the printed sha256
# paste that hash into manifest.json's "expect_sha256"
python3 build/recombine.py --verify   # now reports BYTE-IDENTICAL
python3 build.py --check-drift        # from the repo root
```

## What that leaves

- **Every roll behaves exactly as it does now.** This phase renders; it does not calculate. The
  pipeline baseline reading 34/34 before, during and after is the assertion of that.
- **The post-roll bar returns to modifiers-only**, and disappears entirely on a roll with no
  modifiers — the pre-Phase-4 behaviour, including its blind spot.
- **Phase 3 is untouched and still passes in full.** Measured at 35/35 against a build with this
  phase's fragment deleted, not asserted.
- **Phases 1, 2, 9 and 1.5 need no changes**: 9/9, 19/19, 17/17 and 34/34 respectively against
  that same build.

## Confirming the rollback

```bash
NODE_PATH=$(npm root -g) node \
  "../../Part G — Combat & Roll Engine/PART G — Phase 4 Explain This Roll/qa/roll-breakdown-harness.js" \
  l5r-character-sheet.html
```

Expect it to stop immediately with **0/1** — *"the phase exports buildRollBasePoolRows on the
test seam — got undefined"*. That is the correct result for a completed removal, not a failure
to investigate. The rollback is confirmed by the OTHER harnesses still passing in full, which is
what the table above records.

## Restore points

| Artefact | Value |
|---|---|
| Phase 0 build `sha256`, before this phase | `6bf620fd4c788e5cfcd993f13ed55029f359e4ae427d36744f3f88fa50cecd51` |
| Phase 0 build `sha256`, after this phase (current) | `172b393ef6f5d0a7fcdba6fbdee27f36ea6eadc14fefeda8ba6390ffa8fd068f` |
| `element_id_count` | unchanged: 258 |
| `section_count` / `roll_modal_overlay_count` | unchanged: 10 / 24 |
| `window.__L5R_TEST__` key count, before / after | 304 / **306** (+`buildRollBasePoolRows`, +`ROLL_BREAKDOWN_ENABLED`) |
| `window.__L5R_CAROUSEL__` method count | unchanged: 11 |
