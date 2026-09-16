# Rollback — Part I, Feature 4.55 (Eligibility Gates)

Marker: **`PART I FEATURE 4.55`**. Block delimiters: `PART I FEATURE 4.55 BEGIN <slug>` …
`END GATES455 <slug>`.

## 1. Kill-switch (instant, no rebuild of anything else)

In `src/sheet/209.91-feat-adv-eligibility-gates.js`:

```js
const ADV_ELIGIBILITY_GATES_ENABLED = false;
```

Rebuild. No option is disabled, no label is annotated, the Skill list returns to alphabetical and
any string is accepted again. **The CSS half keeps working** — it is a separate file and does not
read the flag, but with the hint element never created it has nothing to style, so the effect is
the same. Measured: 15/29 with the switch off, 28/29 with the stylesheet dropped.

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
| `src/sheet/209.91-feat-adv-eligibility-gates.js` | the whole fragment |
| `src/css/59-adv-eligibility.css` | the whole stylesheet |
| `build/manifest.json` | both entries, and `expect_sha256` repointed |
| `src/sheet/210-test-seam-and-init.js` | the `eligibility-seam` block |

**Recorded restore point:**

```
2,515,953 bytes
sha256 da0db0946afa356df26e9ea79cfb82f87a669d479247ec1ca230e9bb17be7b13
```

Byte-identical to the Feature 4.54 build this release was added to — that phase's post-correction
build, not its own pre-release target. Verified on a fresh copy; the rolled-back tree also passes
`recombine.py --verify` and reads 571/571.

The live build with this release present is **2,527,259 bytes**,
`ea47d75b8eead07aaaa13766b75c631490e1ec690dd23dbf6d45a126c2f6c893`.

### By hand

Delete from the `BEGIN` line through the `END` line **inclusive** in the seam file. Feature 4.54's
`ux-seam` block sits directly above this one and `PART I FEATURE 4.5` is a prefix of both markers —
do not take it with you. A fixture in `qa/test-removal.py` exists specifically for that mistake and
was proven able to catch it. Also repoint `expect_sha256`; the script does that for you, a manual
removal does not.

## Dependencies

**This release depends on Phase 4.5, 4.5.2 and 4.5.3; none of them depends on it.**

- **It takes its eligibility VERDICT from Feature 4.53** — `R453.ineligibilityReason()` and
  `R453.ELIGIBILITY`, guarded by `typeof R453 === 'object'`. This is the one dependency worth
  understanding before removing 4.53: with it gone, `R455.ineligible()` falls back to its own
  `needs:'shugenja'` check and the gate keeps working unchanged. Nothing breaks; the two simply
  stop sharing a verdict, which only matters if 4.53's rule and this one ever diverge.
- **It reads Phase 4.5.2's `D45.state()` and `D45.skills()`**, both guarded. With 4.5.2 removed,
  `shugenja()` reports false — so gated entries stay gated — and the Skill list falls back to
  `SKILL_LIBRARY` directly. Degraded, not broken.
- **It wraps `recalcAll`, `renderExtendedAdvConfigModal`, `confirmExtendedAdvConfigModal` and
  `initAdvConfig`**, each time keeping the previous binding and delegating. It is ordered after
  209.9 in the manifest so it composes with Feature 4.54's wrappers rather than replacing them,
  and sits outside Phase 4.5.2's confirm wrapper so it sees the final value.
- **It reads two element ids it does not own** — `#advQuickAdd` and `#disadvQuickAdd`
  (040-lib-kata-kiho-spells.js), and `#advConfigFreeText` / `#advConfigSkillOptions` (209.81). It
  mutates the `disabled` property and `textContent` of existing `<option>` elements and rewrites
  the datalist's contents. **Nothing is destroyed:** every option's untouched label is cached on
  `dataset.baseLabel` before the first suffix is applied, and removing this phase leaves the DOM
  as the owning fragments built it on the next load.
- **It creates one element**, `#advConfigSkillHint`, and one class, `.adv-config-skill-hint`, both
  its own. No other phase scopes either.
- **Nothing depends on this release.** It declares two names, `ADV_ELIGIBILITY_GATES_ENABLED` and
  `R455`, and the only references to either outside its own fragment are in its own seam block.
  Confirmed by `qa/feature-dependencies.py`: *every reference is inside a block
  PART I FEATURE 4.55 owns*.

**No registry seat.** The pre-roll modifier registry is untouched and asserted so
(`GATES455-REGISTRY-01`).

**No markup.** This phase adds no element to any `src/markup/` file. Structural inventory is
identical with it present and removed: 270 element ids, 0 duplicated, 10 sections, both seams.

## A note for whoever adds the next eligibility-gated entry

Add it to `R455.RULES` with a short picker label. If Feature 4.53 also knows the entry, this phase
will defer to 4.53's verdict automatically and use only your wording. `GATES455-CONTRACT-02`
asserts the rule list is exactly `['elemental imbalance', 'friendly kami']`, so adding a third
entry is a deliberate act that updates a check, not something that slips in unnoticed.

## Known residual

Feature 4.5.2's own entry gate for Elemental Imbalance (`209.85-feat-disadv-config.js:234`) is
**untouched** by this phase: it still `appAlert()`s and refuses to open the modal for an existing
row on a non-Shugenja character. The picker gate above prevents the bad *add*, which is the path
the feedback concerned, but an imported character carrying that combination still meets the older
behaviour. Removing this phase does not change that either way.
