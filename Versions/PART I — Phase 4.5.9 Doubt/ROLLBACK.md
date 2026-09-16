# Rollback — Part I, Feature 4.59 (Doubt)

Marker: **`PART I FEATURE 4.59`**. Block delimiters: `PART I FEATURE 4.59 BEGIN <slug>` …
`END DOUBT459 <slug>`.

## 1. Kill-switch (instant, no rebuild of anything else)

In `src/sheet/209.95-feat-disadv-doubt.js`:

```js
const DISADV_DOUBT_ENABLED = false;
```

Rebuild. Doubt registers no schema and **the `adv-config` seat is never re-registered**, so
Phase 4.5's own contributor stays in place untouched and no roll is affected. The entry reverts
to a plain catalogue row with an editable points box. **The CSS half keeps working** — it is a
separate file and does not read the flag, but with no badge ever created it has nothing to style.
Measured: 0/1 with the switch off, 36/38 with the stylesheet dropped.

## 2. Surgical removal (permanent)

```bash
cp -r "<Phase 0 tree>/src" "<Phase 0 tree>/build" /tmp/scratch/
python3 "qa/remove-phase.py" /tmp/scratch
```

Refuses the live Phase 0 tree — pass a copy. Validates everything before writing, then rebuilds
and **requires** the result to match the recorded pre-release build. `--dry-run` shows the plan.

| Target | What goes |
|---|---|
| `src/sheet/209.95-feat-disadv-doubt.js` | the whole fragment |
| `src/css/59.4-disadv-doubt.css` | the whole stylesheet |
| `build/manifest.json` | both entries, and `expect_sha256` repointed |
| `src/sheet/210-test-seam-and-init.js` | the `doubt-seam` block |

**Recorded restore point:**

```
2,572,964 bytes
sha256 e61137adcd8d6b891c17c69a7f498d936dbc36eabf5531e77fa4b36a47496104
```

Byte-identical to the Feature 4.58 build this release was added to, first attempt. Verified on a
fresh copy; the rolled-back tree also passes `recombine.py --verify` and reads 728/728.

The live build with this release present is **2,585,131 bytes**,
`a8c63d61a9cd7fed740792ddd38781280b577941dc3947a07f45b2ae009d2abe`.

### By hand

Delete from the `BEGIN` line through the `END` line **inclusive** in the seam file. Feature
4.58's `dependant-wrath-seam` sits directly above this one, with 4.57's, 4.56's, 4.55's, 4.54's
and 4.53's above that, and `PART I FEATURE 4.5` is a prefix of **all seven** markers — do not
take any of them with you. A fixture in `qa/test-removal.py` exists for that mistake. Also
repoint `expect_sha256`; the script does that for you, a manual removal does not.

## Dependencies

**This release depends on Phase 4.5 and Phase 4.5.2; nothing depends on it.**

- **It is installed through Phase 4.5.2's `D45.install()` seam**, the same hard dependency every
  4.5.x Disadvantage has: with 4.5.2 removed, `D45` does not exist, the guarded block never runs,
  and Doubt reverts to a plain unconfigurable catalogue row. Nothing throws.
- **⚠️ It RE-REGISTERS Phase 4.5's own `adv-config` pre-roll contributor.** This is the most
  important line in this file. `registerPreRollModifier('adv-config', …)` **replaces** an entry
  with a matching id rather than appending, so the registry stays at **seven** and Phase 1.5
  (Part G)'s baseline is untouched — `DOUBT459-SEAT-01` asserts the exact seven.
  The previous function is captured and delegated to, so every earlier 4.5 roll effect still
  contributes first. On removal, 209.8's own registration is simply the last word again and the
  original contributor is restored with no dangling state.
  **Two consequences worth knowing before editing anything near this:**
  1. A plain `const prev = advConfigRollModifiers; advConfigRollModifiers = …` wrapper does
     **not** work. The registry captured the function *reference* at registration time, so
     reassigning the identifier afterwards changes nothing that runs. This was driven live.
  2. This fragment must stay **ordered after** 209.8 in the manifest, or it would capture a seat
     that does not exist yet and silently contribute nothing.
- **It reads `D45.state().schoolSkills`**, which D45 builds from `getSchoolsList()` **and** from
  every Skills-table row with `.sk-school` ticked. That second source is why writing to
  `#f_school` does not orphan a Skill — a Skill the School already granted stays granted.
  Read-only.
- **It reads `ROLL_KINDS` and contributes through the pipeline's `totalDelta`**, which is the
  trunk's own mechanism, not another phase's. `showRollResult()` then compares the adjusted total
  against `currentRollTN` — that is what satisfies the convention's "apply it once" requirement
  without this phase knowing any TN.
- **It uses D45's `finalize` hook**, exactly as Feature 4.5.8 does and for the same reason: this
  entry's value is a `skill`, which is not one of `tenet`/`element`/`target`/`tier`/`rank`, so
  without it the legacy display field reads `Rank undefined`.
- **It reuses the `skillPick` type string** rather than adding one, per the constraint Feature
  4.5.8 documented: 4.5.2's harness pins `configTypes` to an exact array and no fixture
  correction can span both the present and removed builds. The stored shape genuinely is Great
  Potential's (`{type:'skillPick', skill:'…'}`), so the discriminator is honest. Great Potential
  is an **Advantage** and resolves through a different path; the two never meet.
- **It creates its own classes only** — `.doubt459-badge` and `.doubt459-stale`. It does not
  reuse Phase 4.5's `.adv-config-*`, 4.5.2's `.d45-*`, or 4.5.8's `.wrath458-badge`, which this
  visually echoes.
- **Nothing depends on this release.** It declares two names, `DISADV_DOUBT_ENABLED` and `R459`,
  and the only references to either outside its own fragment are in its own seam block. Confirmed
  by `qa/feature-dependencies.py`: *every reference is inside a block PART I FEATURE 4.59 owns.*

**No new registry seat.** See above — the seat count is asserted, not assumed.

**No markup.** Structural inventory is identical with this phase present and removed: 270 element
ids, 0 duplicated, 10 sections, both seams, 26 roll-modal overlays.

## No cross-phase fixture correction

Checked before building, as 4.5.8 established: no existing harness under `Versions/` mentions
Doubt, so no fixture encoded its pre-configurable price.

## Declared, not fixed: a pre-existing display quirk

The roll modal's keep-note renders `Keeping 3 of 5 (suggested 3) + -5 bonus` — `+ -5` rather than
`− 5`. **This phase did not introduce it**: verified by rolling with no Doubt present at all, on a
wounded character, which produces `+ -40 bonus`. Every negative `totalDelta` has done this since
Wound Penalties (Part C, Feature 3).

It is deliberately **not** fixed here. The string lives in the trunk, outside this phase's
marker; fixing it would widen the phase and put a trunk edit inside a release whose removal is
supposed to rebuild byte-identical. It deserves its own small bugfix folder, and will read better
for every phase that produces a negative total, not just this one.

## A note for whoever builds D04

D04's Benten (Etiquette TN +10) and Fukurokujin (Lore TN +5) branches are the next consumers of
this convention, and the machinery is already here:

- Contribute a `totalDelta` through the **existing** `adv-config` seat, the way this fragment
  does — do not take an eighth registry seat.
- **Filter on `context.kind` before `context.skillName`.** A damage context carries the same
  skill name as the attack before it; this is the single easiest way to get the convention wrong.
- Put the **rule** in the modifier's `note`, not just the number. The breakdown renders
  `"<label>: <delta> to total — <note>"`, and the convention is explicit that a bare number is
  not enough.
