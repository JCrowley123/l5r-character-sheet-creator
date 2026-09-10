# BUGFIX — Void Offer List: Wrong Baseline, Silent Refusal

Two defects in the Smart Roll Preview's Void offer list, both reported from the live site in one
real-device pass, both fixed here. Neither changes what a Void Point *does* — they change which
options the preview offers, and what it says when it offers none.

**Status: both confirmed, root-caused and fixed. The Phase 3 harness reads 41/41, up from 35/35;
scratch reversions of each defect drop it to 40/41, each failing exactly the one check that
describes it.**

---

## 1. The offer list measured itself against the wrong baseline

### What was reported

On a **trained** Athletics roll (Strength 3, Athletics Rank 1), the Void picker offered only
`+1k1` — correct. Ticking `+1k1` made a second option appear: `+1 Skill Rank (0 → 1) — Unskilled
rolls only`, on a roll that is plainly not unskilled.

The project owner's read: *"as this was a skilled roll I don't think that option should have been
presented. I feel like this is a bug."* Correct on both counts.

### Why it happened

The RAW gate added by the earlier Skill-Rank fix was working perfectly — `voidSkillRankApplies()`
still refused to apply the effect to a trained roll. The bug was one level up, in how the preview
decides what to *offer*.

The preview offers by simulation: for each key it arms that key and asks "does the pool change?"
The problem was **what it compared against**:

```js
function voidKeyWouldMatter(key, context, baseRolled, baseKept, basis){
  …
  setVoidPending(armOneRollVoidPending(saved, key));
  const p = projectRoll(context, baseRolled, baseKept);
  changed = (p.adj.rolled !== basis.adj.rolled) || …
```

`basis` is the pool **currently on screen** — recomputed on every render, including whatever the
player has just ticked. And because arming any one-roll effect clears the others (RAW allows only
one), the comparison decays into nonsense the moment anything is ticked:

| State | `basis` | Trial with `skill` armed | Differ? | Offered? |
|---|---|---|---|---|
| Nothing ticked | `4k3` | `4k3` (gate refuses) | no | correctly hidden |
| `+1k1` ticked | **`5k4`** | `4k3` (gate refuses) | **yes** | **wrongly shown** |

The trial pool never changed. The *baseline* moved out from under it. Every other key would have
done the same thing — `skill` was simply the only other key in the list.

**The consequence was not cosmetic.** Ticking it would swap out `+1k1`, the contributor would
refuse to apply the Skill Rank (correctly), and Confirm would spend a real Void Point for no dice.

### The fix

Ask the question that was actually meant. "Does arming this key change the pool **from its
unmodified state**" has an answer that does not depend on what else is ticked:

```js
setVoidPending(clearOneRollVoidPending(saved));
const none = projectRoll(context, baseRolled, baseKept);
setVoidPending(armOneRollVoidPending(saved, key));
const p = projectRoll(context, baseRolled, baseKept);
changed = (p.adj.rolled !== none.adj.rolled) || …
```

The `basis` parameter is gone entirely — it was the coupling that caused the bug, and nothing else
needed it.

---

## 2. A refused Void option vanished without saying why

### What was reported

Mid-testing, the *"Spend a Void Point on this roll"* section disappeared from spell previews
altogether. Reported as *"the option to use void for a +1k1 is now missing"* — as a suspected
regression in the phase that had just shipped.

### What was actually happening

Nothing was broken. The character had run out of Void Points, and the preview filtered the option
out on `canSpendVoid()`'s refusal — correct behaviour, silently applied:

```js
const check = canSpendVoid(k);
if(!check.ok) return false;     // reason discarded
```

`canSpendVoid()` returns `{ ok:false, reason:'No Void Points remaining.' }`. The reason was right
there and was being thrown away.

**The person who could not tell the difference between "out of points" and "broken feature" wrote
the application.** That is the whole argument for this fix: if the author reads an empty section
as a defect, no player at a table is going to do better.

### The fix

Split the two reasons an option can be absent, because only one of them is worth saying:

- **It would not change this roll** → stay silent. There is nothing useful to say about an effect
  that does not apply here, and saying "you have no Void Points" about it would imply it *would*
  have helped.
- **It would help, but you cannot spend it** (no points left; one already spent this Round) →
  print the reason under the heading it would have appeared beneath.

So the filter now runs in two passes: first the keys that are *relevant* to this roll, then which
of those are *affordable*, collecting refusal reasons from the rest.

---

## What changed, file by file

| File | What changed |
|---|---|
| `src/sheet/208-feat-roll-preview.js` | `voidKeyWouldMatter()` compares against the unarmed pool and loses its `basis` parameter; the offers filter splits into relevant-then-affordable and collects refusal reasons; a reason line renders when every relevant option is refused |
| `src/css/10-sheet-base.css` | `.rp-void-blocked` — the reason line. Quiet by design: it states the character's condition, it is not a warning |
| `build/manifest.json` | Rebuilt hash |

No markup, no change to any contributor, and no change to what a Void Point does when spent.

## Verification

Six checks added to
**`Part G — Combat & Roll Engine/PART G — Phase 3 Smart Roll Preview/qa/roll-preview-harness.js`**
(that phase owns the preview, and duplicating its Playwright setup into a third harness for the
same surface is the copy this project avoids elsewhere).

The four for defect 1 pin down the property that was violated: **the offer list must not change
when a key is ticked.** A trained roll offers `['k1']` before *and after* ticking it; an unskilled
roll offers `['k1','skill']` before *and after* — the second pair guarding against over-correcting
into hiding an option that genuinely applies.

The two for defect 2 check both halves of the split: with `void_current` at 0 a trained skill roll
shows no checkbox but does show `No Void Points remaining.`; a Ring roll with points in hand
offers `k1` only and shows **no** reason line, because `+1 Skill Rank` was never relevant to it.

| Build | Result |
|---|---|
| Both fixes, as shipped | **41/41** |
| Scratch: `voidKeyWouldMatter()` restored to comparing against the on-screen pool | **40/41** — fails only *"and STILL only +1k1 after ticking it"*, reporting `got=["k1","skill"]`: the reported bug, reproduced exactly |
| Scratch: the reason line suppressed | **40/41** — fails only *"the REASON is shown"*, reporting `reason: null` |

Nothing else moved:

| Suite | Result |
|---|---|
| Phase 1.5 roll-pipeline baseline | 34/34 |
| Phase 4 "Explain This Roll" | 22/22 |
| Phase 1 / Phase 2 / Phase 9 | 9/9 · 19/19 · 17/17 |
| `qa/inventory.py` | 258 IDs, 0 duplicates, 10 sections, 24 overlays — unchanged |
| Full behavioural sweep (14 flows) | 0 page errors, no diff vs baseline |
| `build.py --check-drift` | identical |

## Restore points

| Artefact | Value |
|---|---|
| Phase 0 build `sha256`, before these fixes | `172b393ef6f5d0a7fcdba6fbdee27f36ea6eadc14fefeda8ba6390ffa8fd068f` |
| Phase 0 build `sha256`, after (current) | `0de16f73989a7be10c335911d540f852c3fe5380853f9dd1e58c83d5120e9372` |
| `element_id_count` | unchanged: 258 |
| `window.__L5R_TEST__` key count | unchanged: 306 — neither fix adds a seam export |
