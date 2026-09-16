# Rollback — Part I, Feature 4.57 (Unlucky)

Marker: **`PART I FEATURE 4.57`**. Block delimiters: `PART I FEATURE 4.57 BEGIN <slug>` …
`END UNLUCKY457 <slug>`.

## 1. Kill-switch (instant, no rebuild of anything else)

In `src/sheet/209.93-feat-disadv-unlucky.js`:

```js
const DISADV_UNLUCKY_ENABLED = false;
```

Rebuild. Unlucky registers no schema, so it reverts to a plain catalogue row with an editable
points box and no picker — exactly as it was before this release. No button appears on any roll
result, and the Session Resources panel lists only what Phase 4.5 put there. **The CSS half keeps
working** — it is a separate file and does not read the flag, but with neither the controls nor the
result block ever created it has nothing to style. Measured: 2/13 with the switch off, 30/31 with
the stylesheet dropped.

To disable the CSS half too, also remove its manifest entry, or go to a full removal below.

## 2. Surgical removal (permanent)

```bash
cp -r "<Phase 0 tree>/src" "<Phase 0 tree>/build" /tmp/scratch/
python3 "qa/remove-phase.py" /tmp/scratch
```

Refuses the live Phase 0 tree — pass a copy. Validates everything before writing, then rebuilds and
**requires** the result to match the recorded pre-release build. `--dry-run` shows the plan.

| Target | What goes |
|---|---|
| `src/sheet/209.93-feat-disadv-unlucky.js` | the whole fragment |
| `src/css/59.2-disadv-unlucky.css` | the whole stylesheet |
| `build/manifest.json` | both entries, and `expect_sha256` repointed |
| `src/sheet/210-test-seam-and-init.js` | the `unlucky-seam` block |

**Recorded restore point:**

```
2,546,662 bytes
sha256 5a47ab73eb955fa03edddf9d16c90a4d9a0c6d90c1e679d0665320f963225ca6
```

Byte-identical to the Feature 4.56 build this release was added to, first attempt. Verified on a
fresh copy; the rolled-back tree also passes `recombine.py --verify` and reads 641/641.

The live build with this release present is **2,561,467 bytes**,
`83262526cad9794f97b99b1a994327ababfa931874c2610242c34e205987e1cd`.

### By hand

Delete from the `BEGIN` line through the `END` line **inclusive** in the seam file. Feature 4.56's
`rank-entries-seam` sits directly above this one, with 4.55's, 4.54's and 4.53's above that, and
`PART I FEATURE 4.5` is a prefix of **all five** markers — do not take any of them with you. A
fixture in `qa/test-removal.py` exists for that mistake and was proven able to catch it. Also
repoint `expect_sha256`; the script does that for you, a manual removal does not.

## Dependencies

**This release depends on Phase 4.5 and Phase 4.5.2; nothing depends on it.**

- **It is installed through Phase 4.5.2's `D45.install()` seam.** This is the dependency to
  understand first, and it is a hard one: with 4.5.2 removed, `D45` does not exist, the guarded
  `if(typeof D45 === 'object' && ...)` block never runs, and Unlucky reverts to a plain
  unconfigurable catalogue row. Nothing throws. That is the correct outcome — the whole
  Disadvantage configuration surface goes with 4.5.2, and this entry is part of it.
- **It reuses Phase 4.5's `advConfigLuckRerollResult()`** (209.83, the session-resources module
  Luck lives in), guarded at the call site. That function re-rolls the SAVED dice pool and
  re-applies the flat modifiers already in the first result; it is reused rather than copied so the
  exploding-dice threshold handling stays in one place. With 209.83 removed, the invoke button
  reports that it cannot reroll and spends nothing, rather than half-performing.
- **It wraps `onAdvConfigRollResult`** (209.83's result-modal hook, already wrapped by 209.88),
  keeping the previous binding and delegating, so Luck's actions are appended first and Unlucky's
  sit below them. It is ordered after 209.92 in the manifest so it composes with Features 4.53
  through 4.56's wrappers rather than replacing them.
- **It wraps `advConfigAllSessionResources`** so Unlucky joins the existing quick-access Session
  Resources panel, rather than rendering a second panel of its own.
- **It calls `showRollResult()`** — the dice engine's own function — to re-display the kept second
  result, carrying the modal's TN, success/fail text and on-close behaviour across, exactly as
  Luck does when its reroll wins.
- **It creates its own classes only** — `.unlucky-controls`, `.unlucky-pips`, `.unlucky-btn`,
  `.unlucky-actions`, `.unlucky-head`, `.unlucky-invoke`, `.unlucky-outcome`. It deliberately does
  not reuse Phase 4.5's `.adv-config-pips` / `.adv-config-resource-controls`, which Luck's row uses
  and which this visually echoes: borrowing them would make Unlucky's controls depend on another
  phase's stylesheet for a row this phase owns outright.
- **Nothing depends on this release.** It declares two names, `DISADV_UNLUCKY_ENABLED` and `R457`,
  and the only references to either outside its own fragment are in its own seam block. Confirmed
  by `qa/feature-dependencies.py`: *every reference is inside a block PART I FEATURE 4.57 owns*.

**No registry seat.** The pre-roll modifier registry is untouched and asserted so
(`UNLUCKY457-REGISTRY-01`). Unlucky produces no pre-roll modifier at all — it acts after a roll.

**No markup.** This phase adds no element to any `src/markup/` file. Structural inventory is
identical with it present and removed: 270 element ids, 0 duplicated, 10 sections, both seams.

## Cross-phase fixture correction — declared

This release corrects **one check in Feature 4.53's harness**,
`PART I — Phase 4.5.3 Configuration Repairs/qa/adv-config-repairs-harness.js`:

`R453-CAT-06` added an **unconfigured** Unlucky row and asserted its cost box read 2. That held
only while Unlucky had no configuration handler. Now that it has one, the row reads 0 and "Needs a
choice" until a rank is picked — the same rule every other configurable Disadvantage already
followed (Antisocial's catalogue 2 and Obligation's 3 both read 0 unconfigured, verified on the
live build), and 209.8's own stated principle that *"a variable price is not a provisional price."*

The check's intent — that 4.5.3's catalogue correction to 2 XP per rank still holds — is unchanged.
It now configures rank 1 and asserts the award is 2, proving the same fact through the live pricing
path. **The corrected fixture passes both with this phase present and with it removed**, which the
original could not have done, so removing this phase does not require reverting the fixture.

## A note for whoever builds the next session resource

`advConfigLuckRerollResult()` is the reusable piece: it re-rolls a saved result's pool without
re-entering the action that produced it, which is what keeps a reroll from re-paying a spell slot,
Void point, Willpower gate or limited-resource activation. Any future "reroll this" resource should
call it rather than reimplementing the pool maths, and should prove the isolation the way
`UNLUCKY457-ISOLATION-01` does — by diffing the whole character before and after, not by listing
the costs it remembered to avoid.
