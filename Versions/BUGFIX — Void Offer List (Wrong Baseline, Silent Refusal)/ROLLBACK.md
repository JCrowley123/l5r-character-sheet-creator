# Rolling back the Void Offer List bugfixes

**Two independent fixes live here** and either can be reverted without the other: the
**baseline** fix (the offer list no longer measures itself against the pool currently on screen)
and the **silent refusal** fix (a Void option withheld for a stateful reason says why). They sit
in the same function's neighbourhood but share no code.

## Dependencies

- **These fixes depend on:** Part G Phase 3, whose fragment they live in, and Part C Feature 4's
  Void system (`canSpendVoid`, `clearOneRollVoidPending`, `armOneRollVoidPending`) — all of it
  already depended on by Phase 3 itself. Nothing new.
- **Removable features that depend on these fixes:** none.
- Remove Phase 3 and both fixes go with it, since they are edits inside its fragment. That is
  already covered by Phase 3's own `ROLLBACK.md`.

## Why this is not a whole-file `originals/` restore

`208-feat-roll-preview.js` also carries Part G Phase 4's guarded block, and `10-sheet-base.css`
carries blocks from Phases 1, 2, 3, 4 and 9. Restoring either snapshot wholesale would strip
those. The `originals/` copies here are frozen at the moment before these fixes and are provided
for diffing, not for restoring over a live tree. Use the surgical steps below.

## Surgical removal

```bash
cd "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability"
```

### Fix 1 — the baseline (revert independently)

In `src/sheet/208-feat-roll-preview.js`, restore `voidKeyWouldMatter()`'s fifth parameter and its
comparison target:

```js
  function voidKeyWouldMatter(key, context, baseRolled, baseKept, basis){
    const saved = getVoidPending();
    let changed = false;
    try {
      setVoidPending(armOneRollVoidPending(saved, key));
      const p = projectRoll(context, baseRolled, baseKept);
      changed = (p.adj.rolled !== basis.adj.rolled) ||
                (p.adj.kept !== basis.adj.kept) ||
                (p.adj.totalDelta !== basis.adj.totalDelta) ||
                (p.adj.explodeOverride !== basis.adj.explodeOverride);
    } finally {
      setVoidPending(saved);
    }
    return changed;
  }
```

and delete the `BUGFIX (Void Offer Measured Against The Wrong Baseline)` comment above it. The
call site in `render()` must pass `basis` again:

```js
          chosen[k] || voidKeyWouldMatter(k, context, baseRolled, baseKept, basis));
```

**This is the edit that reintroduces the bug**, and it is a genuine regression, not a neutral
rollback: `+1 Skill Rank (0 → 1)` reappears on trained rolls the moment `+1k1` is ticked, and
taking it costs a Void Point for no dice. Only revert this if the offer rule itself needs to
change — not to "put it back how it was", because how it was is the defect.

### Fix 2 — the refusal reason (revert independently)

Collapse the two-pass filter back to one, discarding the reasons:

```js
        const offers = ROLL_PREVIEW_VOID_KEYS.filter(k=>{
          if(chosen[k]) return true;
          const check = (typeof canSpendVoid === 'function') ? canSpendVoid(k) : { ok:true };
          if(!check.ok) return false;
          return voidKeyWouldMatter(k, context, baseRolled, baseKept);
        });
```

delete the `if(!offers.length && blocked.length){ … }` block that renders the reason, and delete
the `.rp-void-blocked` rule from `src/css/10-sheet-base.css`.

What that leaves: an empty Void section vanishes with no explanation again — which is what caused
the app's own author to report working behaviour as a broken feature.

### Rebuild

```bash
python3 build/recombine.py            # note the printed sha256
# paste that hash into manifest.json's "expect_sha256"
python3 build/recombine.py --verify   # now reports BYTE-IDENTICAL
python3 build.py --check-drift        # from the repo root
```

## Confirming the rollback

```bash
NODE_PATH=$(npm root -g) node \
  "../../Part G — Combat & Roll Engine/PART G — Phase 3 Smart Roll Preview/qa/roll-preview-harness.js" \
  l5r-character-sheet.html
```

- **40/41**, failing *"and STILL only +1k1 after ticking it"* → fix 1 was reverted.
- **40/41**, failing *"the REASON is shown"* → fix 2 was reverted.
- **39/41** with both failing → both were reverted.

Any other number means the rollback did something it was not meant to.

## Restore points

| Artefact | Value |
|---|---|
| Phase 0 build `sha256`, before these fixes | `172b393ef6f5d0a7fcdba6fbdee27f36ea6eadc14fefeda8ba6390ffa8fd068f` |
| Phase 0 build `sha256`, after these fixes (current) | `0de16f73989a7be10c335911d540f852c3fe5380853f9dd1e58c83d5120e9372` |
| `element_id_count` | unchanged: 258 |
| `window.__L5R_TEST__` key count | unchanged: 306 |
