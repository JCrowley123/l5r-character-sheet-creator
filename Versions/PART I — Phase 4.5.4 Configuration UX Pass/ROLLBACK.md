# Rollback — Part I, Feature 4.54 (Configuration UX Pass)

Marker: **`PART I FEATURE 4.54`**. Block delimiters: `PART I FEATURE 4.54 BEGIN <slug>` …
`END UX454 <slug>`.

## 1. Kill-switch (instant, no rebuild of anything else)

In `src/sheet/209.9-feat-adv-config-ux.js`:

```js
const ADV_CONFIG_UX_ENABLED = false;
```

Rebuild. No info button is added, no wording is changed. **The CSS half keeps working** — it is
a separate file and does not read the flag, so Consumed's label and the roll preview row stay
fixed. That split is deliberate: the two halves fail independently, which is how each was proven
load-bearing (10/19 with the switch off, 18/21 with the CSS dropped).

To disable the CSS half too, also remove its manifest entry, or go to a full removal below.

## 2. Surgical removal (permanent)

```bash
cp -r "<Phase 0 tree>/src" "<Phase 0 tree>/build" /tmp/scratch/
python3 "qa/remove-phase.py" /tmp/scratch
```

Refuses the live Phase 0 tree — pass a copy. Validates everything before writing, then rebuilds
and **requires** the result to match the recorded pre-release build. `--dry-run` shows the plan.

| Target | What goes |
|---|---|
| `src/sheet/209.9-feat-adv-config-ux.js` | the whole fragment |
| `src/css/58-adv-config-ux.css` | the whole stylesheet |
| `build/manifest.json` | both entries, and `expect_sha256` repointed |
| `src/sheet/210-test-seam-and-init.js` | the `ux-seam` block |

**Recorded restore point:**

```
2,495,934 bytes
sha256 18a740e8aeb334dac6a0405ec98c79edc6a450d5a09c8b7cfd715273f7b7b8c0
```

Byte-identical to the pre-release build. Verified on a fresh copy; the rolled-back tree also
passes `recombine.py --verify`.

The live build with this release present is **2,510,683 bytes**,
`b18d164dc82a262b54f3ac33c0e206e11c85ee4663dd7adfd27fd4db0325cc14`.

### By hand

Delete from the `BEGIN` line through the `END` line **inclusive** in the seam file. Feature
4.53's `repairs-seam` block sits directly above this one — do not take it with you. A fixture in
`qa/test-removal.py` exists specifically for that mistake. Also repoint `expect_sha256`; the
script does that for you, a manual removal does not.

## Dependencies

**This release depends on Phase 4.5, 4.5.2 and 4.5.3; none of them depends on it.**

- It wraps `refreshAdvConfigControl` and `initAdvConfig`, each time keeping the previous binding
  and delegating — so it composes with Feature 4.53's wrappers rather than replacing them, and
  is ordered after 209.89 in the manifest for exactly that reason. Its own guard
  (`typeof advConfigRowFor === 'function'`) makes the whole release a no-op if Phase 4.5 is
  removed, rather than a `ReferenceError`.
- It wraps **Phase 4.5.2's `D45.steps()`** for the wording change, guarded by
  `typeof D45 === 'object' && typeof D45.steps === 'function'`. With 4.5.2 removed, the wording
  change simply does not apply.
- It calls `populateInfoOverlay()` (Part C Feature 2's info overlay) through a guard, falling
  back to `appAlert()`. Both are trunk surface.
- **It styles two classes other phases own**, and this is the one thing to know before removing
  either of those phases:
  - `.d45-option` and its descendants — **Phase 4.5.2's**. Removing 4.5.2 leaves those rules
    matching nothing. Inert, not broken.
  - `.rp-mod`, `.rp-mod-label`, `.rp-mod-txt` — **Phase 3's (Part G)**. Removing Phase 3 leaves
    the phone-width media block matching nothing. Also inert.
  Neither rule is shared with the owning phase's own selectors; they are separate overrides in
  this phase's own file, so both phases stay independently removable.
- **It reads and hides `.d45-tooltip`** — **Phase 4.5.2's** own `<details>` disclosure
  (`209.85-feat-disadv-config.js:277`), added on 16 September 2026 in response to real-device
  feedback: 4.5.2 already gave every tenet-style option its own tap-to-expand "▶ Rule" element,
  and adding a second, competing way to reach the same text (this phase's ⓘ button) was reported
  as confusing. `api.hideSupersededDisclosure()` sets `.hidden = true` on it wherever this
  phase's own button is added to the same card — never removes it, and never touches it where no
  button was added. Removing 4.5.2 leaves nothing for this call to find
  (`element.querySelector('.d45-tooltip')` returns `null`) — inert, not broken. Removing THIS
  phase restores 4.5.2's original doubled-but-functional behaviour: the disclosure reappears
  exactly as 4.5.2 built it, since nothing here ever deleted or altered it.
- **Nothing depends on this release.** It declares two names, `ADV_CONFIG_UX_ENABLED` and
  `R454`, and the only references to either outside its own fragment are in its own seam block.
  Confirmed by `qa/feature-dependencies.py`: *every reference is inside a block
  PART I FEATURE 4.54 owns*.

**No registry seat.** The pre-roll modifier registry is untouched and asserted so
(`UX454-REGISTRY-01`). Phase 1.5 still reads 35/35.

**No markup.** This phase adds no element to any `src/markup/` file; every node it creates is
made at runtime and disappears with the fragment.

## A note for whoever edits Phase 4.5.2's row renderer

Two strings in this phase's `R454.SUMMARY_TEXT` are matched against the **painted** summary node,
because that renderer assembles its line inline and exposes no seam to wrap. If those strings
change in 4.5.2, the substitution here silently stops applying — it will not error, the old
wording will simply come back. `UX454-WORD-03` is the check that would catch it.
