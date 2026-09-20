# Rolling back Part I, Phase 4.5 — Modal-Configured Advantages/Disadvantages

## Completion-pass inventory (current)

Phase 4.5 now consists of the original resolver plus five additional, independently removable
fragments:

| Fragment | Owns |
|---|---|
| `209.8-feat-adv-config.js` | Core schema, resolver, XP discount, controls, and guarded delegates |
| `209.81-feat-adv-config-extended.js` | Allies, Gentry, Languages, Luck, Magic Resistance, Sacred Weapon, and Great Potential schemas/UI/effects |
| `209.82-feat-adv-config-kharmic-tie.js` | Ring-fenced Kharmic Tie target/rank counter, reset, preview declaration, and +1k1 modifier |
| `209.83-feat-adv-config-resources.js` | Luck whole-roll reroll action and session-resource sidebar/persistence repaint |
| `209.84-feat-adv-config-sacred-weapon.js` | Clan profile mapping, tagged generated equipment, and owned-row cleanup |

The eight requested Advantages are all covered. Magic Resistance is intentionally a player-facing
incoming elemental-spell reminder, not a modifier to the player's own casting rolls. Sacred Weapon
auto-adds the approved Clan base profile and leaves target/mount/duel/taint conditions as explicit
table notes. Great Potential reports Skill and Void raise limits because the sheet has no separate
Raise-spending engine. These are boundaries, not silent defaults.

The completion harness is **48/48**; the original Phase 4.5 harness remains **51/51**. The
canonical expanded build is 2,428,891 bytes with SHA-256
`4355dec4b219883bb041e48a02773af3006d762fa6b48f35b9c273d429553481`.

## Dependencies

### Later dependent — Named Advantages (20 September 2026)

Phase 4.5.13 depends on this base's schema/resolver, extended modal and serialization helpers.
Remove that release using its own scratch-only remover **before removing this base**. Its
ROLLBACK records the reciprocal dependency. Removing only 4.5.13 leaves the base untouched:
all 992 pre-release checks pass and the output is byte-identical to its own restore point.
The original "no removable feature depends on this phase" statement below describes the
initial release, not the present tree; it must not be used as permission to remove the base
under later configuration releases.

Per `CLAUDE.md`'s "Every feature must be surgically removable", declared here before shipping so
a removal is never a surprise. Verified with:

```bash
cd "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability"
python3 qa/feature-dependencies.py src/sheet/209.8-feat-adv-config.js "PART I PHASE 4.5" \
  --also advConfigModalOverlay advConfigTitle advConfigSubtitle advConfigGrid advConfigNote \
         advConfigConfirm advConfigX advConfigSessionResources adv-config-row adv-config-summary \
         adv-config-warn adv-config-btn adv-config-cost adv-config-modal-note adv-config-badge \
         adv-config-magic-reminder adv-config-text-input adv-config-text-label adv-config-pips \
         adv-config-reset-session adv-config-resource-controls adv-config-kharmic-controls \
         adv-config-kharmic-use adv-config-session-resources adv-config-session-resource \
         adv-config-luck-actions adv-config-luck-controls adv-config-luck-head \
         adv-config-luck-outcome adv-config-spend-luck adv-config-sacred-source
```

- **This phase depends on the trunk:** `RINGS`, `traitCost()`, `recalcAll()`, `setStatus()`,
  `escHtml`/`escAttr`, the `#advList`/`#disadvList` entry lists, `makeEntry()`'s `.entry` shape,
  and the `.affinity-pick-grid`/`.affinity-pick-item` modal classes the universal-spell Element
  picker already uses. All normal — core sheet code is not going anywhere, and removing this
  phase simply stops calling it. No declaration needed.
- **This phase depends on NO other removable feature's CODE.** Nothing it calls belongs to Phase 1,
  1.6, 2, 3, 4, 5, 8 or 9. In particular the roll contributor (4.5.1) reads only context keys the
  TRUNK puts on a roll — `kind`, `ringName`, `traitName`, `spellName`, `element` — and deliberately
  not the keys Phase 4 (Part G) added (`ringValue`, `traitValue`, `schoolRank`…), so it is a trunk
  dependency rather than a cross-phase one.
- **This phase depends on Phase 1.5 (Part G) — SOFT, and through its HARNESS only.** 4.5.1
  registers a seventh contributor (`adv-config`, priority 60) into `PREROLL_MODIFIER_REGISTRY`,
  which is the registry Phase 1.5 audits. Registration itself goes through the trunk's own
  `registerPreRollModifier()`, so **deleting Phase 1.5's folder does not affect this phase at
  all** — it only removes the suite that documents the registry. Declared in Phase 1.5's
  `ROLLBACK.md` as well. Phase 1.5's check is written conditionally on this phase being present,
  so it reads **35/35 with this phase in the build and 35/35 with it surgically removed**.
- **No removable feature depends on this phase.** Nothing outside this phase's own fragment reads
  `resolveAdvDisadvEffect()`, `advConfigTraitXpDiscount()`, `data-adv-config`, or any
  `adv-config-*` class. The only readers are the six guarded hook lines listed below, each of
  which goes silently inert when the fragment is deleted.

That makes this phase's removal a **standalone** operation in both directions — the property the
cross-phase table at the bottom of this file measures rather than asserts.

### The registry seat, and the ruling behind it

4.5.1 adds the seventh entry to `PREROLL_MODIFIER_REGISTRY`. That registry was baselined by Phase
1.5 (Part G), whose harness originally asserted `registry.length === 6` and whose own source
comment named this phase: *"later phases (3, 4, 4.5, 6) must not change how these combine."*
Registering a seventh took that suite to 33/34.

**The project owner ruled explicitly that the baseline may go from six to seven**, on the grounds
that Phase 1.5 is an audit phase whose job is to notice pipeline changes rather than forbid them.
Phase 1.5's harness now asserts the six core contributors in priority order and, separately, that
the only contributor beyond them is this phase's — conditional on this phase being present, so it
reads 35/35 either way. That is recorded here, in Phase 1.5's own README and `ROLLBACK.md`, and in
the roadmap, so a later reader finds a decision rather than unexplained drift.

## The fast way first: one flag (or two)

In `src/sheet/209.8-feat-adv-config.js`:

```js
const ADV_CONFIG_ENABLED = false;
```

then rebuild (`python3 build/recombine.py` from the Phase 0 folder). `advConfigSchemaFor()`
returns `null` for everything, which is the single choke point every other path goes through: no
entry is offered a pick, no stored pick is read, no Trait discount is applied, and the per-entry
controls are removed from the DOM on the next `recalcAll()`. A character file that already carries
a `config` key keeps it untouched — persistence does not read this flag — so flipping it back on
restores every existing pick.

The flag is the single choke point for the core schema. With it flipped, the two Phase 4.5
harnesses should report the expected missing-feature failures while the page itself remains usable;
the removal proof below is the stronger contract.

**To remove only the roll-effect half (4.5.1), leaving the cost half running**, flip the second
flag instead:

```js
const ADV_CONFIG_ROLL_EFFECTS_ENABLED = false;
```

The three original roll-effect entries still take and show their pick, but contribute nothing to any
roll; Kharmic Tie follows the same gate and hides its attack declaration while roll effects are off.
The contributor stays REGISTERED either way — an inert registered contributor is still registered,
and making the registry's contents depend on a flag Phase 1.5 cannot see would make that phase's
report dishonest. Phase 1.5 still reads 35/35 because its registry check is conditional on the
Phase 4.5 contributor being present.

## Surgical removal (verified, byte-identical)

A script does it, and asserts as it goes rather than trusting the block boundaries:

```bash
cd "Versions/PART I — Phase 4.5 Modal-Configured Advantages-Disadvantages"
cp -r "../Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability" /tmp/scratch-p0
python3 qa/remove-phase.py /tmp/scratch-p0
cd /tmp/scratch-p0 && python3 build/recombine.py
```

It refuses to run against the live tree, and refuses to delete any line that carries another
phase's marker or that names nothing this phase introduced. Both assertions fired for real while
this phase was being built — see "What the assertions caught" below.

### What it removes

| File | Block |
|---|---|
| `src/sheet/209.8-feat-adv-config.js` | the whole fragment — including the `registerPreRollModifier('adv-config', 60, …)` call, so the registry returns to six by itself |
| `src/sheet/209.81-feat-adv-config-extended.js` | Allies, Gentry, Languages, Luck, Magic Resistance, Sacred Weapon, and Great Potential schemas and delegates |
| `src/sheet/209.82-feat-adv-config-kharmic-tie.js` | the ring-fenced Kharmic Tie counter, reset, preview, and modifier module |
| `src/sheet/209.83-feat-adv-config-resources.js` | Luck's whole-roll result action and session-resource sidebar module |
| `src/sheet/209.84-feat-adv-config-sacred-weapon.js` | Clan weapon profiles, tagged generated rows, and cleanup helpers |
| `build/manifest.json` | its 2-line entry |
| `src/sheet/040-lib-kata-kiho-spells.js` | 9 lines — the pick-time modal open in `buildAdvDisadvQuickAdd()` |
| `src/sheet/090-table-rows-weapons.js` | 8 lines — the `data-adv-config` carry in `makeEntry()` |
| `src/sheet/110-modals-trackers.js` | 12 lines — the Trait XP discount in `recalcAll()`'s `RINGS` loop |
| `src/sheet/110-modals-trackers.js` | 6 lines — the control repaint at the end of `recalcAll()` |
| `src/sheet/120-persistence.js` | 15 lines — `attachAdvConfigToSave()`, plus its 2 call lines |
| `src/sheet/210-test-seam-and-init.js` | 17 lines — the seam export block |
| `src/sheet/210-test-seam-and-init.js` | 4 lines — the `initAdvConfig()` wiring in `init()` |
| `src/markup/20-fixed-layers.html` | 21 lines — the picker modal host |
| `src/css/10-sheet-base.css` | 27 lines — the `adv-config-*` block |

**Nothing needs restoring afterwards.** The remover cuts only marked Phase-4.5 spans (plus three
asserted trunk substitutions that restore the original weapon lookup line). It does not replace a
shared file wholesale, so later-phase additions remain intact. That is what makes the result
byte-identical rather than merely equivalent:

| After removal | Result |
|---|---|
| Rebuilt `l5r-character-sheet.html` | **byte-identical** to the pre-phase build — `9dbaf6c6…b116e4`, 2,322,320 bytes both times |
| All ten touched trunk inputs | **identical** to the pre-phase Git blobs after line-ending normalisation |

`originals/` holds a git-committed, verbatim pre-edit copy of every file this phase touched. It is
the fallback, not the method: restoring it wholesale would also delete anything a LATER phase has
since added to those same files.

### The CSS block's placement is load-bearing

This phase's CSS sits **above** Part J Phase 8's marker, and its removal is terminated by that
marker rather than by EOF or by the trunk's Print banner. That is the same positioning discipline
Phase 8's own END comment explains: Part J Phase 5's remover cuts from its marker to the Print
banner, so a block placed between those two would be swallowed by Phase 5's removal. Do not move
this block below Phase 8's without re-reading both of those comments first.

## What the assertions caught, while this phase was being built

Recorded because the point of the assertions is that review does not catch these.

1. **The removal script's own ownership list was incomplete.** `data.config` — this phase's key on
   the save object — was not in `OURS`, so the script refused to delete the `makeEntry()` block
   that uses it. Correct refusal: a line naming something unclaimed is exactly what the check is
   for.
2. **A span cut swallowed trunk code.** The two `attachAdvConfigToSave(...)` call lines were first
   cut as a *span* whose start and end predicate were both "carries our marker" — so the second
   call was found as the first one's end, and the trunk's own `#disadvList` loop between them went
   into the doomed range. The `OURS` assertion refused it. They are now cut as individual lines
   with an asserted count.
3. **Two end-predicates matched too early**, truncating their blocks and leaving live code behind:
   the persistence helper ended at an inner statement that happened to end in `};`, and the markup
   host ended at the first nested `</div>` rather than the overlay's own. Both were caught by
   diffing the removed tree against `originals/`, not by reading the script.
4. **A doubled blank line.** The markup block was inserted as `<block><blank>` above Phase 8's
   comment, so removing the block alone left the blank behind and the rebuild came out **one byte
   heavy**. Byte-identity is what surfaced it; "looks right" would not have.

## Confirming the rollback

```bash
NODE_PATH=$(npm root -g) node \
  "../PART I — Phase 4.5 Modal-Configured Advantages-Disadvantages/qa/adv-config-harness.js" \
  l5r-character-sheet.html
```

Expect it to stop immediately with **0/1** — *"the phase exports resolveAdvDisadvEffect on the test
seam — got undefined"*. That is the correct result for a completed removal, not a failure to
investigate. The rollback is confirmed by the OTHER harnesses still passing in full, which the
README's cross-phase table records.

## What that leaves

- **Every Advantage and Disadvantage behaves exactly as it did before this phase.** An entry is a
  name, an editable points field, and free text.
- **A character file that already carries `config` keys still loads.** `makeEntry()` ignores an
  unrecognised key, so the pick becomes inert data that simply stops being read. It is not
  stripped on save either — the save path is removed along with the phase, so the key is dropped
  the next time that character is written. Worth knowing before removing this phase from a build
  whose characters have configured entries: **the picks are lost on the next save**, silently.
  Export the characters first if they matter.
- **Trait XP returns to `traitCost()` alone**, with no discount path at all.
- **`PREROLL_MODIFIER_REGISTRY` returns to its six original contributors**, because the
  registration lives inside the deleted fragment. Phase 1.5's suite still reads 35/35 — its check
  is conditional on this phase being present, so no edit is needed there either. Rolls lose the
  three original roll effects and Kharmic Tie's guarded contributor; all other rolls are otherwise
  untouched. Luck's result action and Sacred Weapon's generated rows disappear with their own
  fragments.

## Restore points

| Artefact | Value |
|---|---|
| Phase 0 build `sha256`, before this phase | `9dbaf6c626f2baba33df8547078bc158ef32926c8fc7ea1b0b1501f4c8b116e4` |
| Phase 0 build `sha256`, after this phase (canonical LF build) | `4355dec4b219883bb041e48a02773af3006d762fa6b48f35b9c273d429553481` |
| Phase 0 build bytes, before / after | 2,322,320 / 2,428,891 |
| `window.__L5R_TEST__` seam | Guarded Phase-4.5 exports are present only while the fragments exist |
| `PREROLL_MODIFIER_REGISTRY` size, before / after | 6 / **7** (`adv-config`, priority 60) |
