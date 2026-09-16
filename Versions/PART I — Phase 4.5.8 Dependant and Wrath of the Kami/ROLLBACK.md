# Rollback — Part I, Feature 4.58 (Dependant and Wrath of the Kami)

Marker: **`PART I FEATURE 4.58`**. Block delimiters: `PART I FEATURE 4.58 BEGIN <slug>` …
`END AGREED458 <slug>`.

## 1. Kill-switch (instant, no rebuild of anything else)

In `src/sheet/209.94-feat-disadv-dependant-wrath.js`:

```js
const DISADV_DEPENDANT_WRATH_ENABLED = false;
```

Rebuild. Neither entry registers a schema, so both revert to plain catalogue rows with an
editable points box and no picker — exactly as they were before this release. Note that
Dependant's box then shows the catalogue's **2** again; that is the pre-release behaviour this
phase deliberately replaced, not a new defect. **The CSS half keeps working** — it is a separate
file and does not read the flag, but with neither control ever created it has nothing to style.
Measured: 0/1 with the switch off, 53/55 with the stylesheet dropped.

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
| `src/sheet/209.94-feat-disadv-dependant-wrath.js` | the whole fragment |
| `src/css/59.3-disadv-dependant-wrath.css` | the whole stylesheet |
| `build/manifest.json` | both entries, and `expect_sha256` repointed |
| `src/sheet/210-test-seam-and-init.js` | the `dependant-wrath-seam` block |

**Recorded restore point:**

```
2,562,091 bytes
sha256 ad856e506e35121951923e28c907427c273eacf14a490db5d42ad446b2c3f0cf
```

Byte-identical to the Feature 4.57 build this release was added to, first attempt. Verified on a
fresh copy; the rolled-back tree also passes `recombine.py --verify` and reads 673/673.

The live build with this release present is **2,572,964 bytes**,
`e61137adcd8d6b891c17c69a7f498d936dbc36eabf5531e77fa4b36a47496104`.

### By hand

Delete from the `BEGIN` line through the `END` line **inclusive** in the seam file. Feature
4.57's `unlucky-seam` sits directly above this one, with 4.56's, 4.55's, 4.54's and 4.53's above
that, and `PART I FEATURE 4.5` is a prefix of **all six** markers — do not take any of them with
you. A fixture in `qa/test-removal.py` exists for that mistake and was proven able to catch it.
Also repoint `expect_sha256`; the script does that for you, a manual removal does not.

## Dependencies

**This release depends on Phase 4.5 and Phase 4.5.2; nothing depends on it.**

- **Both entries are installed through Phase 4.5.2's `D45.install()` seam.** This is the hard
  dependency: with 4.5.2 removed, `D45` does not exist, the guarded
  `if(typeof D45 === 'object' && ...)` block never runs, and both revert to plain unconfigurable
  catalogue rows. Nothing throws. That is the correct outcome — the whole Disadvantage
  configuration surface goes with 4.5.2, and these entries are part of it.
- **It uses four of D45's per-definition hooks** — `steps`, `validate`, `resolve` and
  `decorate` — plus **`finalize`**, which the other installed entries do not use. `finalize` is
  load-bearing for Dependant specifically: `D45.confirm()` composes the legacy `value` display
  field from `tenet||element||target||tier||('Rank '+rank)`, and Dependant's number is `points`,
  so without `finalize` that field would read `Rank undefined`. **Do not remove `finalize` from
  D45 without checking here.**
- **It adds NOTHING to `D45.configTypes`, and that is deliberate and load-bearing.** Feature
  4.5.2's own harness (`D45-SCHEMA-TYPES`) pins that array to exactly twelve entries. Unlike an
  ordinary fixture, an exact-array assertion cannot be corrected to span both worlds — no single
  expected value passes with this phase present *and* removed. So Dependant reuses `rankPick` and
  Wrath of the Kami reuses `elementPick` rather than introducing a name of their own.
  `D458-CONTRACT-03` repeats 4.5.2's expectation inside this phase's suite so the constraint is
  visible from here.
- **Wrath of the Kami shares `elementPick` with Elemental Imbalance and must not share anything
  else.** Elemental Imbalance carries a pre-casting Willpower gate, a deficiency rule, and
  Feature 4.5.5's Shugenja-only eligibility gate. All three are keyed on the entry **name**, not
  the config type — confirmed by grep, and `elementPick` appears nowhere outside `209.85`. The
  `D458-ISOLATION` section proves the separation by diffing the whole character rather than
  listing what was remembered. **If a future phase ever keys behaviour on `elementPick` rather
  than on the name, this entry inherits it silently.**
- **It reads `D45.state().shugenja`** (which is `characterCasterLock() === 'shugenja'`) to price
  Wrath of the Kami at 4 rather than 3. Read-only, and a price difference only — it registers no
  eligibility rule, so a non-shugenja may take the entry.
- **It creates its own classes only** — `.dep458-fields`, `.dep458-input`, `.wrath458-badge`. It
  deliberately does not reuse Phase 4.5's `.adv-config-*` or 4.5.2's `.d45-*`, including
  `.d45-summary` sitting inches away in the same row: borrowing them would make this phase's
  controls depend on another phase's stylesheet for a row this phase owns outright.
- **Its optional fields commit on `change`, not on `input`.** That is deliberate: `D45.refresh()`
  clears `row.innerHTML` and rebuilds, so writing per keystroke would re-render the row mid-word
  and take the caret with it. Anything added to this row later should follow the same rule.
- **Nothing depends on this release.** It declares two names, `DISADV_DEPENDANT_WRATH_ENABLED`
  and `R458`, and the only references to either outside its own fragment are in its own seam
  block. Confirmed by `qa/feature-dependencies.py`: *every reference is inside a block
  PART I FEATURE 4.58 owns.*

**No registry seat.** The pre-roll modifier registry is untouched and asserted so
(`D458-REGISTRY-01`). Wrath of the Kami's Free Raise belongs to the **other** caster, so there is
nothing to apply to this character's pool; Dependant has no roll effect at all.

**No markup.** This phase adds no element to any `src/markup/` file. Structural inventory is
identical with it present and removed: 270 element ids, 0 duplicated, 10 sections, both seams,
26 roll-modal overlays.

## No cross-phase fixture correction

Unlike Feature 4.57, this release corrects nothing in another phase's harness. Checked before
building rather than discovered afterwards: no existing harness anywhere under `Versions/`
mentions Dependant or Wrath of the Kami, so no fixture encoded their pre-configurable prices the
way `R453-CAT-06` encoded Unlucky's.

## A note for whoever builds D01, D03, D04 or D06

The three constraints above are not specific to these two entries — they apply to every future
`D45.install()`:

1. **You cannot add a `configTypes` string** without breaking 4.5.2's exact-array check, and no
   fixture correction can rescue it. Reuse an existing shape, or take the array's contract to the
   project owner as its own decision.
2. **There is no optional modal field.** Required things go in the modal; optional things go on
   the row via `decorate`, committing on `change`.
3. **`finalize` is how you keep the legacy `value` field honest** when your field is not one of
   `tenet`/`element`/`target`/`tier`/`rank`.

D03 Doubt is the next one planned, and it will need the TN-reporting convention built for the
first time — that machinery is deliberately not started here.
