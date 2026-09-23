# Rollback — Part I, Feature 4.56 (Rank Entries)

Marker: **`PART I FEATURE 4.56`**. Block delimiters: `PART I FEATURE 4.56 BEGIN <slug>` …
`END RANKS456 <slug>`.

## 1. Kill-switch (instant, no rebuild of anything else)

In `src/sheet/209.92-feat-adv-rank-entries.js`:

```js
const ADV_RANK_ENTRIES_ENABLED = false;
```

Rebuild. Neither entry registers a schema, so Perceived Honor and Wealthy go back to being plain
catalogue rows with an editable points box and no picker — exactly as they were before this
release. **The CSS half keeps working** — it is a separate file and does not read the flag, but
with the rank input never created it has nothing to style, so the effect is the same. Measured:
3/12 with the switch off, 28/29 with the stylesheet dropped.

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
| `src/sheet/209.92-feat-adv-rank-entries.js` | the whole fragment |
| `src/css/59.1-adv-rank-entries.css` | the whole stylesheet |
| `build/manifest.json` | both entries, and `expect_sha256` repointed |
| `src/sheet/210-test-seam-and-init.js` | the `rank-entries-seam` block |

**Recorded restore point:**

```
2,533,897 bytes
sha256 0538c4662e19ba633a3faefb8d1111f1b502f557e7f7b935c7fb53ae6570ab7f
```

Byte-identical to the Feature 4.55 build this release was added to, first attempt. Verified on a
fresh copy; the rolled-back tree also passes `recombine.py --verify` and reads 612/612.

The live build with this release present is **2,546,662 bytes**,
`5a47ab73eb955fa03edddf9d16c90a4d9a0c6d90c1e679d0665320f963225ca6`.

### By hand

Delete from the `BEGIN` line through the `END` line **inclusive** in the seam file. Feature 4.55's
`eligibility-seam` sits directly above this one, with 4.54's and 4.53's above that, and
`PART I FEATURE 4.5` is a prefix of all four markers — do not take any of them with you. A fixture
in `qa/test-removal.py` exists for that mistake and was proven able to catch it. Also repoint
`expect_sha256`; the script does that for you, a manual removal does not.

## Dependencies

**This release depends on Phase 4.5 and its extended module; nothing depends on it.**

- **It wraps five functions**, each time keeping the previous binding and delegating:
  `isExtendedAdvConfigComplete`, `openExtendedAdvConfigModal`, `confirmExtendedAdvConfigModal`,
  `resolveAdvDisadvEffect` and `advConfigSummaryForEffect`. It is ordered after 209.91 in the
  manifest so it composes with Features 4.53, 4.54 and 4.55's wrappers rather than replacing them.
- **It calls 209.81's `commitExtendedAdvConfig()`** and sets 209.81's own `advConfigExtendedModal`
  state, so the write/close/recalc/status path is the shared one. With 209.81 removed this phase's
  confirm would have nothing to call — the whole Phase 4.5 configuration surface goes with it, so
  the two entries revert to plain rows, which is the correct outcome rather than a broken one.
- **Its resolve wrapper is OUTERMOST and answers only for its own two entries**, delegating
  everything else. That is deliberate: Feature 4.53's wrapper below it re-prices certain entries
  and gates Friendly Kami, and letting it re-price a cost this phase has already computed is the
  failure worth avoiding. Neither of 4.53's repairs applies to these two entries.
- **It does NOT depend on Phase 4.5.2 (`D45`).** That was the first approach tried —
  `D45.install()` plus its cap-free `rankPick` — and it was abandoned because `D45.refresh()`
  requires a d45 entry to sit in `#disadvList`. See this phase's `README.md`. No reference to
  `D45` survives in the fragment.
- **It reads two element ids it does not own** — `f_honorRank` and `f_clan`, both read-only. It
  never writes to either. Perceived Honor's readout is derived from `f_honorRank` on every refresh
  and stored nowhere, which is exactly why changing Honor moves the readout.
- **It creates its own element and classes only** — `#advConfigRankInput`, with
  `.adv-rank-label` and `.adv-rank-input`. It deliberately does not reuse 209.81's
  `.adv-config-text-input`, which it resembles: borrowing that class would make this phase's only
  control depend on another phase's stylesheet.
- **Nothing depends on this release.** It declares two names, `ADV_RANK_ENTRIES_ENABLED` and
  `R456`, and the only references to either outside its own fragment are in its own seam block.
  Confirmed by `qa/feature-dependencies.py`: *every reference is inside a block
  PART I FEATURE 4.56 owns*.
- **Superseded, 23 September 2026 — Feature 4.5.17 (Wealthy Koku Grant) now depends on this
  release.** It reads `R456` (`TYPE`, `rankOf`, `enabled`) and retunes this release's own mutable
  `R456.ENTRIES.Wealthy` (`price` to Core p.149's 1-XP minimum, `summary`, `note`). Remove
  4.5.17 before this release; its retunes vanish with it and this release's pricing returns
  exactly. `feature-dependencies.py` for this release now exits 1 with eight references, all in
  4.5.17's fragment. 4.5.17 also made three of this release's checks conditional
  (`RANKS456-W-06`, `RANKS456-KOKU-01`, `RANKS456-KOKU-02`): each asserts this release's original
  value when 4.5.17 is absent and the owner-approved value when present; measured 29/29 both ways.

**No registry seat.** The pre-roll modifier registry is untouched and asserted so
(`RANKS456-REGISTRY-01`). Neither entry produces a roll modifier at all.

**No markup.** This phase adds no element to any `src/markup/` file. Structural inventory is
identical with it present and removed: 270 element ids, 0 duplicated, 10 sections, both seams.

## A note on the stylesheet

`59.1-adv-rank-entries.css` is numbered 59.1 rather than 60 because `60-sheet-print.css` must stay
last on the cascade. It carries **only** the rules the sheet's own base stylesheet does not already
supply — measured, not assumed: the base already gives the input its border, radius, padding,
background and 16px font, and the only genuinely missing piece is the label, which inherits 10.56px
at 144px wide without this file.

## A note for whoever adds the third missing handler

D05 (Unlucky) is the remaining entry with no configuration handler, and it is **not** the same
shape as these two. It needs a rank picker *and* a session-tracked reroll resource that replaces a
saved roll's result without re-paying spell slots, Void, or any other consumed cost. The
`rankFreePick` type here supplies the rank half and is reusable; the resource half is new work
against the dice engine.
