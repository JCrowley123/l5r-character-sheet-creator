# Rolling back the Void One-Roll Effects Not Mutually Exclusive bugfix

**Two independent fixes live in this folder** and each can be reverted without the other:
the original **exclusivity** fix (arming one one-roll effect clears the others), and the
later **Skill-Rank gate** (`+1 Skill Rank (0 → 1)` applies only to a skill-based roll made
unskilled). They touch the same file but no shared code — see *Reverting the Skill-Rank gate
on its own* at the end.

## Why this isn't a whole-file `originals/` restore

`210-test-seam-and-init.js` carries guarded blocks from four other still-live features (Part H
Phases 1, 2 and 9, and Part G Phase 3) added at various points before this fix. Restoring that
file's pre-fix snapshot from `originals/` would silently strip whichever of those blocks happen
to sit near this fix's own two-line addition, exactly the hazard `CLAUDE.md`'s "Every feature
must be surgically removable" was written to prevent. Use the surgical procedure below instead.
`160-feat-void.js` and `208-feat-roll-preview.js` are *not* shared with any other still-live
feature today, so restoring either wholesale from `originals/` would also work — but the
surgical procedure below is correct either way and doesn't need re-checking if that ever
changes, so it's given as the one procedure for all three files.

## Surgical removal

```bash
cd "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability"
```

### `src/sheet/160-feat-void.js`

Revert `VOID_SPEND_LIBRARY` to list `k1` and `trait` as separate entries again (restore from
`originals/src/sheet/160-feat-void.js` for the exact original wording and comment), or simply
accept the corrected RAW-accurate label — merging them back apart is optional; the exclusivity
helpers below are not.

Delete the `armOneRollVoidPending`/`clearOneRollVoidPending` block (immediately after
`clearVoidPending()`) and its "BUGFIX (Void One-Roll Effects Not Mutually Exclusive)" comment.

Revert `spendVoid()`'s one-roll branch:
```js
} else if(opt.oneRoll){
  setVoidPending(armOneRollVoidPending(getVoidPending(), opt.key));
  setStatus('Void spent: ' + opt.label + ' — applies to your next roll.');
```
back to:
```js
} else if(opt.oneRoll){
  const pending = getVoidPending();
  pending[opt.key] = true;
  setVoidPending(pending);
  setStatus('Void spent: ' + opt.label + ' — applies to your next roll.');
```

Revert `consumeVoidOneRollEffects()`'s body:
```js
const usedOneRoll = adj.applied.some(m =>
  m.source === 'void' && /Void: \+1(k1| Skill)/.test(m.label));
if(!usedOneRoll) return false;
setVoidPending(clearOneRollVoidPending(getVoidPending()));
return true;
```
back to:
```js
const usedOneRoll = adj.applied.some(m =>
  m.source === 'void' && /Void: \+1(k1| Trait| Skill)/.test(m.label));
if(!usedOneRoll) return false;
const pending = getVoidPending();
delete pending.k1; delete pending.trait; delete pending.skill;
setVoidPending(pending);
return true;
```
(only if `trait` was also restored as a separate key above — otherwise leave the regex as `+1
(k1|Skill)` and drop the `delete pending.trait;` line, since there is nothing to delete).

Restore the `if(pending.trait) active.push('+1 Trait');` line inside `renderVoidPanel()`, between
the `k1` and `skill` lines, if `trait` was restored as a key.

### `src/sheet/208-feat-roll-preview.js`

Restore `const ROLL_PREVIEW_VOID_KEYS = ['k1', 'trait', 'skill'];` if `trait` was restored, or
leave as `['k1', 'skill']` otherwise.

Revert `voidKeyWouldMatter()`'s trial construction:
```js
try {
  setVoidPending(armOneRollVoidPending(saved, key));
```
back to:
```js
try {
  const trial = Object.assign({}, saved);
  trial[key] = true;
  setVoidPending(trial);
```

Revert the checkbox change handler:
```js
Object.keys(chosen).forEach(k=>{ chosen[k] = false; });
if(cb.checked) chosen[key] = true;
setVoidPending(chosen[key]
  ? armOneRollVoidPending(pendingAtOpen, key)
  : clearOneRollVoidPending(pendingAtOpen));
render();
```
back to:
```js
chosen[key] = cb.checked;
const p = Object.assign({}, pendingAtOpen);
Object.keys(chosen).forEach(k=>{ if(chosen[k]) p[k] = true; });
setVoidPending(p);
render();
```
**This is the one edit that actually reintroduces the bug** — the rest of this file's revert is
cosmetic once this line is back.

### `src/sheet/210-test-seam-and-init.js`

Delete the one added line:
```js
armOneRollVoidPending, clearOneRollVoidPending,
```
from the Void export group.

### `Part G — Combat & Roll Engine/PART G — Phase 1.5 Roll Pipeline Consolidation/qa/roll-pipeline-baseline.js`

Only meaningful to revert if `trait` is restored as a real key above. If so, restore
`originals/Part G — Combat & Roll Engine/PART G — Phase 1.5 Roll Pipeline Consolidation/qa/roll-pipeline-baseline.js`
verbatim — it re-asserts the (then-correct-again) claim that `trait` contributes its own,
separately-labelled `+1k1`-equivalent modifier.

### `src/sheet/160-feat-void.js` — the Skill-Rank gate (second fix, revert independently)

Delete the `voidSkillRankApplies()` function and its RAW comment block (immediately above
`voidPreRollModifiers()`), and change

```js
if(pending.skill && voidSkillRankApplies(ctx)){
```

back to

```js
if(pending.skill){
```

Then revert the `skill` entry's label in `VOID_SPEND_LIBRARY` to `'+1 Skill Rank (0 → 1)'` on a
single line and delete the four-line comment above it explaining why the restriction is stated
there.

Optionally also restore the `k` separator in `src/sheet/208-feat-roll-preview.js`'s
`previewDiceHtml()` (`+ '<span class="rp-dice-k">k</span>' +` between the two columns) and its
`.rp-dice-k` rule in `src/css/10-sheet-base.css`, resetting `.rp-dice`'s `gap` from `34px` back
to `14px`. Purely cosmetic and independent of everything else here.

### Rebuild

```bash
python3 build/recombine.py            # note the printed sha256
# paste that hash into manifest.json's "expect_sha256"
python3 build/recombine.py --verify   # now reports BYTE-IDENTICAL
python3 build.py --check-drift        # from the repo root
```

## What that leaves

- **The double-stack bug returns** if the checkbox-handler revert above is applied — this is
  a genuine regression, not a neutral rollback, since the bug this fix closes was real and
  reported live. Only revert this fix if something about the merged `k1` wording or the
  single-select behaviour itself needs to change; do not revert it to "go back to how it was"
  without a reason, since how it was is the defect.
- **Phase 3's own preview, Phase 1/2/9, and the pipeline itself are otherwise untouched** —
  this fix added no markup, no CSS, and no new registered contributor.

## Confirming the rollback

```bash
NODE_PATH=$(npm root -g) node \
  "../../Part G — Combat & Roll Engine/PART G — Phase 3 Smart Roll Preview/qa/roll-preview-harness.js" \
  l5r-character-sheet.html
```

The harness now carries 35 checks. Expect:

- **22/25 of the first 25** if the checkbox-handler revert was applied — the three exclusivity
  checks fail, matching this fix's own README.
- **32/35** if the Skill-Rank gate was reverted — the three gate checks fail. The
  unskilled-attack check still passes, because an ungated build does apply the effect there
  too; that is the check distinguishing "applies where it should" from "applies everywhere".

Either number confirms the rollback actually restored the pre-fix *behaviour*, not just
old-looking code that happens to behave the same.

## Reverting the Skill-Rank gate on its own

The gate is three lines in `voidPreRollModifiers()` plus one self-contained function, and it
shares no code with the exclusivity helpers. Applying only the `### src/sheet/160-feat-void.js —
the Skill-Rank gate` section above, rebuilding, and leaving everything else alone is a complete,
correct revert of that fix by itself: the harness reads 32/35 and every exclusivity check still
passes.

Note what reverting it actually does, though: `+1 Skill Rank (0 → 1)` goes back to being offered
on Ring, Trait, Spell Casting, Initiative and manual rolls, where RAW gives it nothing to do —
the point is spent and buys no die. Like the exclusivity revert above, this is a regression
rather than a neutral rollback.

## Restore points

| Artefact | Value |
|---|---|
| Phase 0 build `sha256`, before either fix | `5281e4720f63501cb515f1971f35ffcd32f677808894f2d758df0dbe7279b22f` |
| Phase 0 build `sha256`, after the exclusivity fix | `ffd66865b26c0360f5059ebfe3188b8bc9d1b09748bbaacb8827dbe4016eac32` |
| Phase 0 build `sha256`, after the Skill-Rank gate (current) | `35ab6a365b9852333dbe19f6fa51824c1ffcb9fffc894e474cb7d75118244a92` |
| `window.__L5R_TEST__` key count, before / after | 302 / 304 |
| `element_id_count` | unchanged: 258 |
