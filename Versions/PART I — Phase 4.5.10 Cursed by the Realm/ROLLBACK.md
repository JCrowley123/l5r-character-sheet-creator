# Rollback — Part I, Feature 4.5.10 (Cursed by the Realm)

Marker: **`PART I FEATURE 4.5.10`** — the first **dotted** marker in the project. Block
delimiters: `PART I FEATURE 4.5.10 BEGIN <slug>` … `END REALM4510 <slug>`.

**On the dotted marker.** The compressed scheme would have made this `PART I FEATURE 4.510`,
which is workable today but reads as "4.51.0" and becomes genuinely ambiguous the moment any
`4.51` marker exists. The project owner chose the dotted form. Both regexes already accept it
(`MARKER_RE`'s `[\d.]+`, and `BEGIN_RE`'s escaped dots anchored by a required `BEGIN` token), and
`qa/test-removal.py` carries a fixture that invents a `PART I FEATURE 4.51` block specifically to
prove the two do not collide — because there is no real 4.51 to catch a regression by accident.

## 1. Kill-switch (instant, no rebuild of anything else)

In `src/sheet/209.96-feat-disadv-realm.js`:

```js
const DISADV_REALM_ENABLED = false;
```

Rebuild. The entry registers no schema, adds no `realmPick` type, and installs nothing into
`D45.modules`, so it reverts to a plain catalogue row with an editable points box. Phase 3's four
preview hooks become no-ops, because each is guarded on a function this fragment no longer
defines. **The CSS half keeps working** — it is a separate file and does not read the flag, but
with no badge, flag, button or declaration ever created it has nothing to style.

Measured: **19/50** with the switch off, **57/60** with the stylesheet dropped.

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
| `src/sheet/209.96-feat-disadv-realm.js` | the whole fragment |
| `src/css/59.5-disadv-realm.css` | the whole stylesheet |
| `build/manifest.json` | both entries, and `expect_sha256` repointed |
| `src/sheet/210-test-seam-and-init.js` | the `realm-seam` block |
| `src/sheet/208-feat-roll-preview.js` | `preview-start`, `preview-cancel`, `preview-html`, `preview-toggle` |

**Recorded restore point:**

```
2,585,131 bytes
sha256 a8c63d61a9cd7fed740792ddd38781280b577941dc3947a07f45b2ae009d2abe
```

Byte-identical to the Feature 4.59 build this release was added to. Verified on a fresh copy; the
rolled-back tree also passes `recombine.py --verify` and reads **766/766**.

The live build with this release present is **2,614,082 bytes**,
`4cc3fa7885b7f43b49b55525b99ca783ed16b018ed549d006e2d3348232b87b5`.

**It did not rebuild byte-identical on the first attempt, and the reason is worth keeping.** The
first cut of the `preview-html` hook put a blank separator line *above* its `BEGIN` delimiter, so
the removal left that line behind and the rebuild came out **one byte** larger. Nothing about the
block itself was wrong. Anything inserted into a shared file must keep its own whitespace inside
its delimiters, or the byte-identical claim fails on a space nobody can see.

### By hand

Delete from each `BEGIN` line through its `END` line **inclusive**, in BOTH shared files — five
blocks, not one. Feature 4.59's `doubt-seam` sits directly above this release's seam block, with
4.58's, 4.57's, 4.56's, 4.55's, 4.54's and 4.53's above that, and `PART I FEATURE 4.5` is a prefix
of **all eight** markers — do not take any of them with you. In the preview file this release's
blocks sit within a few lines of Phase 4.5's Kharmic Tie hooks, which carry the marker
`PART I PHASE 4.5`; a fixture in `qa/test-removal.py` exists for swallowing one of those and was
proven able to catch it. Also repoint `expect_sha256`; the script does that for you, a manual
removal does not.

## Dependencies

**This release depends on Phase 4.5, Phase 4.5.2 and Phase 3 (Part G); nothing depends on it.**

- **It is installed through Phase 4.5.2's `D45.install()` seam**, the same hard dependency every
  4.5.x Disadvantage has: with 4.5.2 removed, `D45` does not exist, the guarded block never runs,
  and the entry reverts to a plain unconfigurable catalogue row. Nothing throws.

- **⚠️ NEW DEPENDENCY, not shared by any earlier 4.5.x release: Phase 3 (Part G).** Maigo no
  Musha's per-roll declaration lives in four guarded, delimited blocks inside
  `208-feat-roll-preview.js`, which is **Phase 3's own fragment**. This is the first 4.5.x release
  to edit a fragment outside the seam.
  - **Why it had to go there.** The audit requires a *fresh per-roll* declaration and explicitly
    forbids leaving a blanket penalty armed, so a persistent row toggle was not an option; the
    penalty changes the pool, so it must be decided pre-roll. That means the preview.
  - **Why it is four hardwired hooks rather than a registration.** Phase 3's preview has **no
    generic declaration registry**. Its one existing declaration hook is hardwired to Kharmic Tie
    by name (`advConfigKharmicPreviewHtml` and friends). Mirroring that precedent was the smaller
    change; generalising it would have rewritten another Part's architecture inside a feature
    release.
  - **If Phase 3 is removed**, no preview opens, so no declaration is ever offered and Maigo no
    Musha applies nothing. It does not throw, and the other nine realms are unaffected. Declared
    in Phase 3's own `ROLLBACK.md` under Dependencies as well, per CLAUDE.md's both-ways rule.
  - **⚠️ THERE ARE NOW THREE HARDWIRED CONSUMERS of that preview** — Void, Kharmic Tie, and this
    release. **D04's Ebisu needs exactly this shape and would be the fourth.** A fourth copy is
    the point at which the generalisation conversation should happen instead. Recorded here so it
    is a decision rather than a drift.

- **It takes NO registry seat and re-registers NOTHING.** This is the first 4.5.x roll-affecting
  release that touches the pre-roll registry in no way at all. Feature 4.59 had to re-register
  Phase 4.5's own `adv-config` contributor and delegate to the previous one — its ROLLBACK calls
  that "the most important line in this file". Measured before building: entries added to
  `D45.modules` are consulted generically by `D45.modifiers()` (209.85), which the single existing
  `adv-config` contributor already reaches through `advConfigExtendedRollModifiers`. A probe
  installed that way was seen on SKILL/ATTACK/TRAIT/RING/SPELL, the registry stayed at **seven**
  seats, and deleting the key stopped the contribution cleanly. `REALM4510-SEAT-01` asserts the
  exact seven. **Prefer this route over re-registration for any future entry.**

- **The damage exclusion is INHERITED, not coded here.** `D45.modifiers()` returns `[]` for
  `ROLL_KINDS.DAMAGE` *before* it consults `api.modules`, so a damage context never reaches this
  fragment at all — proven by `REALM4510-DAMAGE-02`, which wraps the module and asserts it is
  never entered for a damage roll. Feature 4.59's ROLLBACK names the damage leak as the single
  easiest way to get the TN convention wrong, because a damage context carries the same
  `skillName` as the attack before it. Routing through `D45.modules` makes that bug structurally
  impossible rather than something this fragment must remember. A redundant kind check is kept in
  `api.modifiers` anyway, because inherited protection nobody checks is protection a later
  refactor removes in silence.

- **It uses D45's `finalize` hook**, exactly as Features 4.5.8 and 4.5.9 do and for the same
  reason: this entry's value is a `realm`, which is not one of `tenet`/`element`/`target`/`tier`/
  `rank`, so without it the legacy display field reads `Rank undefined`. `finalize` additionally
  **strips the toggle a newly-chosen realm does not own**, so switching Tengoku → Chikushudo
  cannot leave a stale `inTemple:true` riding along in the save.

- **It uses D45's `toggle` helper** for Meido's and Tengoku's sustained conditions, which writes
  through the entry's real config and recalculates — so the state round-trips with the rest of the
  entry and this phase persists nothing of its own.

- **It reads `D45.state().shugenja`** to price the award at 5 rather than 4. Read-only, and a
  price difference only — it registers no eligibility rule, so a non-Shugenja may take the entry.

- **It reads the trunk's own `#advList` / `#disadvList` rows** for Yomi's ancestral flag, rather
  than another phase's API, so that branch keeps working with every optional 4.5.x fragment
  removed.

- **It creates its own classes only** — `.realm4510-badge`, `.realm4510-eff-*`, `.realm4510-check`,
  `.realm4510-flag`, `.realm4510-flag-clear`, `.realm4510-declare*`. It does not reuse Phase 4.5's
  `.adv-config-*`, 4.5.2's `.d45-*`, or 4.5.9's `.doubt459-badge`, which its badge visually echoes.
  **The effect modifier is `realm4510-eff-<effect>`, and the `eff-` segment is load-bearing:** the
  unprefixed form collided with this phase's own `.realm4510-check` button rule, because
  Toshigoku's effect key is literally `check`. Keep control classes and effect modifiers in
  separate namespaces.

- **It adds `ADV_LIBRARY` to the test seam.** Only `DISADV_LIBRARY` was exported before, so no
  harness could check the Advantage half of Yomi's ancestral claim. Additive, inside this phase's
  own seam block, and it goes with the block on removal.

- **Nothing depends on this release.** It declares six names — `DISADV_REALM_ENABLED`, `R4510`,
  and the four `realm4510Preview*` hook functions — and every reference to any of them outside its
  own fragment is inside a block it owns. Confirmed by `qa/feature-dependencies.py`: *every
  reference is inside a block PART I FEATURE 4.5.10 owns.*

**No markup.** This phase adds no element to any `src/markup/` file.

## Cross-phase fixture correction — the `configTypes` contract

**This release adds a `configTypes` string, `realmPick`, which Feature 4.5.8's ROLLBACK says no
phase may ever do. That constraint was overstated, and the project owner decided explicitly to
lift it here.**

4.5.8's argument was that 4.5.2's `D45-SCHEMA-TYPES` pins the array exactly and that "no single
expected value passes both with a phase present and removed". That is true of a **constant**
expected value. It is false of a **conditional** one — and the project had already solved this
exact class of problem once: Phase 1.5 (Part G)'s registry-length check was made conditional on
Phase 4.5's presence, on the owner's ruling that an audit check exists to *notice* a change
rather than forbid it. 4.5.8 ruled out fixture *correction* and never considered fixture
*conditionalisation*.

The reason to spend that, rather than reuse an existing type string: `configTypes` is not a set of
generic shapes. Three of its twelve entries — `insightDifferencePick` (Nemesis), `languagePick`
(Languages) and `clanWeaponAutoPick` (Sacred Weapon) — are already single-entry names. A realm
stored under a schema called `tenetPick` would have been a discriminator that lies, in saved
character data, permanently, and D04's seven Fortunes would have inherited the same lie.

**Three harnesses were corrected, all in the same shape:**

| File | Check |
|---|---|
| `PART I — Phase 4.5.2 Disadvantages/qa/disadv-config-harness.js` | `D45-SCHEMA-TYPES` |
| `PART I — Phase 4.5.8 …/qa/disadv-dependant-wrath-harness.js` | `D458-CONTRACT-03` |
| `PART I — Phase 4.5.9 Doubt/qa/disadv-doubt-harness.js` | `DOUBT459-CONTRACT-03` |

Each now computes its expected array as the twelve **plus `realmPick` if and only if `R4510` is
present**. Every check's intent is preserved exactly — 4.5.8 and 4.5.9 each still assert that
*they* contribute nothing — and each reads identically with this release present and removed.
**Measured both ways: 826/826 with it present, 766/766 with it removed.**

**`remove-phase.py` deliberately does NOT revert these.** They live under `Versions/`, not in the
Phase 0 tree, and they are written to be correct in both worlds; that is the whole reason the
conditional shape was chosen over a constant. Removing this phase needs no edit to them. 4.5.8's
header comment was also updated to record that its own stated constraint is superseded, so the
next person does not re-derive the same wrong conclusion from it.

## Deferred, and stated rather than hidden: Jigoku

**Jigoku ships as a badge and a reminder. Its resistance roll is not built.** The audit leaves
"the applicable resistance roll" unresolved, and the sheet models no Taint rank anywhere — the
only Shadowlands Taint in the source is a catalogue row. Choosing which Trait or Ring resists it
would be inventing rules content (Process Requirement #3). The project owner decided to defer that
branch alone rather than guess or hold the release.

The row says so in the player's own terms rather than implying the sheet has it covered, and
`REALM4510-JIGOKU-04` asserts that wording. The other nine realms are unaffected.
**To finish it later** needs one thing from a sourcebook: which roll resists the Taint. The
machinery is already here — `R4510.toshigokuRoll()` is the worked example of a standalone
player-triggered check on the trunk's own `tnConfig`, and Jigoku's would differ only in its roll
and its −1k1.

## Harness

```bash
NODE_PATH=/opt/node22/lib/node_modules node \
  "Versions/PART I — Phase 4.5.10 Cursed by the Realm/qa/current-suite-runner.js" <built html>
```

**Note the NODE_PATH.** The path recorded in earlier phases' notes (`/home/user/node_modules`)
does not exist in this environment; Playwright is installed globally at
`/opt/node22/lib/node_modules`. With the wrong path every child suite fails to launch and the
4.59 runner printed **`COMBINED 0/0 checks passed`** — a line that reads like success. This
release's runner treats a 0/0 run as a failure for that reason.
