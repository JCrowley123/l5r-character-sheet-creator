# Phase 4.5.10 — Cursed by the Realm

D01. Ten Spirit Realms behind one catalogue row — and the first release of the staged plan where
the entry count and the cost genuinely came apart. Four of the ten branches needed machinery that
did not exist; the other six were nearly free.

> **⚠️ This folder is the ELEVENTH Part I folder sitting flat at `Versions/` top level.** The
> `Part I — Character Progression Content` wrapper was already overdue at ten and was deliberately
> deferred again, by the project owner's decision, to keep this week's budget on feature content.
> The reason it is not a five-minute job is unchanged and is recorded in `CLAUDE.md`: every Part I
> folder's `remove-phase.py` resolves the repository root by counting parents (`parents[3]`) and
> the suite runners resolve `../../..`, so adding a directory level silently breaks the live-tree
> refusal check and every runner path at once. Eleven of each now.

## What shipped

| Realm | Behaviour | New machinery |
|---|---|---|
| Chikushudo | −1k1 on Animal Handling, always on | no — the scoped-skill shape Doubt established |
| Gaki-do | badge + reminder | no |
| **Jigoku** | **badge + reminder; its roll is DEFERRED** | no — see below |
| Maigo no Musha | −1k1 when declared against a spirit, per roll | **yes** — four hooks in Phase 3's preview |
| Meido | −1k0 on Perception-based rolls while in a trance | **yes** — sustained toggle + Trait scoping |
| Sakkaku | badge + reminder | no |
| Tengoku | TN +10 as −10 to the reported total, inside a temple | reuses 4.5.9's convention + a toggle |
| Toshigoku | player-triggered Willpower check, TN 15 | **yes** — standalone roll on the trunk's `tnConfig` |
| Yomi | flags ancestral entries, deletes nothing | **yes** — cross-entry compatibility read |
| Yume-do | badge + reminder | no |

Award: **4 XP, or 5 for a Shugenja**, read from `D45.state().shugenja`.

## Six things were measured first. Four changed the design.

**1. `D45.modules` is the route in, and it takes no registry seat at all.** Feature 4.5.9 had to
re-register Phase 4.5's own `adv-config` contributor and delegate to the previous one — its own
ROLLBACK calls that "the most important line in this file". Driven live before any code was
written: entries added to `D45.modules` are consulted generically by `D45.modifiers()` (209.85),
which the single existing `adv-config` contributor already reaches. A probe registered that way
was seen on SKILL/ATTACK/TRAIT/RING/SPELL, the registry stayed at **seven** seats, and deleting
the key stopped the contribution cleanly. **This phase therefore re-registers nothing and wraps
nothing** — a strictly safer route than the one the previous phase had to take, and the one any
future entry should prefer.

**2. The damage exclusion is inherited, not coded.** `D45.modifiers()` returns `[]` for
`ROLL_KINDS.DAMAGE` *before* it consults `api.modules`. Measured on the same probe: damage saw
0 contributions where every other kind saw 1. Feature 4.5.9's ROLLBACK names the damage leak as
the single easiest way to get the TN convention wrong, because a damage context carries the same
`skillName` as the attack before it. Routing through `D45.modules` makes that bug structurally
impossible here. It is still asserted twice — `REALM4510-DAMAGE-01` drives the exact trap, and
`REALM4510-DAMAGE-02` wraps the module and proves it is never even entered for a damage roll —
because inherited protection that nobody checks is protection a later refactor removes in silence.

**3. Meido scopes on `traitName`, not on a skill list.** A SKILL context carries the skill's own
Trait, an ATTACK context carries one too, and a TRAIT context obviously does. Exactly **three**
skills in `SKILL_LIBRARY` roll on Perception — Battle, Hunting and Investigation — so a
hand-written list would have been three names that rot the moment the library changes. One
`traitName` test covers all three plus the Perception Trait Roll itself. `REALM4510-MEIDO-04`
takes its oracle from `SKILL_LIBRARY` rather than from a list retyped in the harness, so it keeps
agreeing with the sheet rather than with me.

**4. Chikushudo and Meido cannot collide.** Animal Handling rolls on **Awareness**, not
Perception — measured, and worth stating because "animals, so Perception" is the intuitive wrong
answer. The two branches are disjoint by construction. `REALM4510-CHIKUSHUDO-03` pins that fact
against the library, so if it ever changes the overlap is reported rather than discovered.

**5. Yomi's ancestral surface is exactly two entries.** The audit names Inheritance and asks for
other matches to be *verified rather than assumed*. Measured across both libraries: only
**Inheritance** (Advantage) and **Haunted** (Disadvantage) reference an ancestor, heirloom or
lineage at all. Phase 4.8 (Ancestors) is not built, so there is no third thing to find. The branch
flags both and deletes nothing, per the audit's explicit instruction that player entries must not
be silently removed. `REALM4510-YOMI-05` re-derives the list from the libraries at runtime, so it
cannot drift from them.

**This measurement was initially wrong, and the harness is why it got fixed.** The first probe
found only Haunted, and the reason was that **`ADV_LIBRARY` was not on the test seam** — only
`DISADV_LIBRARY` was. The Advantage half of the claim had been unverifiable all along. This
release exports it.

**6. Jigoku's roll cannot be built from what the sheet knows.** See below.

## Jigoku is deferred, and says so

The audit leaves "the applicable resistance roll" unresolved, and the sheet models no Taint rank
anywhere — the only Shadowlands Taint in the source is a catalogue row. Choosing which Trait or
Ring resists it would be inventing rules content (Process Requirement #3). The project owner chose
to defer that one branch rather than guess or hold the release.

It ships as a badge and a reminder that says the roll is **not** automated, in the player's own
terms, rather than implying the sheet has it covered. `REALM4510-JIGOKU-04` asserts that wording,
and `REALM4510-JIGOKU-03` asserts it applies no modifier to any roll kind at all.

Finishing it later needs exactly one fact from a sourcebook: which roll resists the Taint. The
machinery already exists here — `R4510.toshigokuRoll()` is the worked example of a standalone
player-triggered check on the trunk's own `tnConfig`.

## `realmPick`, and a constraint that turned out to be overstated

Feature 4.5.8's ROLLBACK states that no phase may ever add a `configTypes` string. **That
conclusion was stronger than its own argument**, and the project owner decided explicitly to lift
it here. The full reasoning is in this phase's `ROLLBACK.md`; in short, 4.5.8 ruled out fixture
*correction* and never considered fixture *conditionalisation* — the shape Phase 1.5 (Part G)
already uses for the modifier-registry baseline, on the owner's own earlier ruling.

Three harnesses were corrected in the same shape (4.5.2's `D45-SCHEMA-TYPES`, 4.5.8's
`D458-CONTRACT-03`, 4.5.9's `DOUBT459-CONTRACT-03`), each now expecting the twelve **plus
`realmPick` iff `R4510` is present**. Every check's intent is preserved — 4.5.8 and 4.5.9 each
still assert that *they* add nothing — and each reads identically in both builds. 4.5.8's header
comment was updated to record that its stated constraint is superseded, so nobody re-derives the
same wrong conclusion from it.

## Two bugs of my own, both caught by measuring rather than reading

**A CSS class collision that would have shipped.** The badge's modifier class was
`realm4510-<effect>`, and Toshigoku's effect key is literally `check` — so the badge carried
`.realm4510-check`, the same class as this phase's own button rule, and the button's margin and
white-space landed on the badge. It was found only because the geometry measurement printed each
element's tag and class alongside its box, and the button's numbers looked suspiciously like the
badge's. Fixed by namespacing the modifier as `realm4510-eff-<effect>`, which closes the whole
class of collision rather than this one instance.

**A harness that hung instead of failing.** `openPreview()` was an `async` function that
*returned* the pending roll promise — so `await openPreview(...)` unwrapped it and waited for a
roll nobody had confirmed yet. The outer timeout eventually killed the run and reported six
unrelated sections as failures. The promise is now returned wrapped in an object, and
`cancelPreview` races a timeout so a hang can never again masquerade as a broad failure.

## Real-device correction, 17 September 2026

Reported on the reporting iPhone: the Toshigoku Willpower-check button was "not in line." Measured
before touching anything: at 375px the row is 303px wide. "Change" and the "Toshigoku" badge
already use 160px of it between them, leaving 143px — and the button's own label makes it 207px
wide, so it can never share that line. It wraps every time, on every device, regardless of screen
width, because the arithmetic doesn't work at any width this sheet targets.

The bug wasn't the wrap — flex-wrap on this row is shared, deliberate trunk behaviour every
configured entry relies on. The bug was a `margin-left: 6px` on the button, written on the
assumption it would usually sit *beside* the badge. It never does. Alone at the start of an
orphaned line, that margin reads as an unexplained 6px indent, which is what got reported.

Fixed by making the wrap deliberate instead of patching the margin in isolation: a zero-size flex
item with `flex-basis: 100%` now forces the line break itself, so the button always starts flush
left on its own clean line at its natural width — never stretched to fill the row, never offset.
`REALM4510-GEOM-05` asserts exactly that guarantee, proven able to fail first (60/61 against a
scratch copy with the old margin restored, failing on that one check alone) before being trusted.

Confined entirely to this phase's own fragment and stylesheet — no shared file touched, no other
phase's harness re-run needed. Own suite 60/60 → **61/61**, combined 826/826 → **827/827**.
Surgical removal still rebuilds byte-identical to the same `a8c63d61` restore point; nothing about
what this phase depends on or is depended on by changed.

## Results

| Build | This phase | Retained suites | Combined |
|---|---|---|---|
| **Live** | **61/61** | 766/766 | **827/827** |
| Kill-switch off | **19/50** | — | — |
| Stylesheet dropped | **58/61** | — | — |
| Surgically removed | n/a | **766/766** | — |

Live build: **2,616,015 bytes**, `42df8c9398fd65fc29bf9ed2202a54a032e67deea9264c0a990a2e3f6f3c22a1`.
Removed build: **2,585,131 bytes**, `a8c63d61a9cd7fed740792ddd38781280b577941dc3947a07f45b2ae009d2abe`
— byte-identical to the Feature 4.59 build this was added to. Removal fixtures: **19/19**.
`qa/feature-dependencies.py`: clean, every reference inside a block this phase owns.

**The stylesheet-dropped number is 58/61 and not lower on purpose.** Exactly the three original
geometry checks fail (GEOM-01/02/03), and only those. `.d45-toggle-label` is identical in both
builds because Feature 4.5.2 owns it — deliberately not asserted here. The Toshigoku button's own
box is identical in both (207×32, 1px solid, 6px radius) — the base sheet's `.ghost` supplies all
of that — so no size check was ever written against it. GEOM-04 (no overflow) and GEOM-05 (the
17 September flush-left correction, below) both hold *without* CSS too, and correctly so: they are
structural JS guarantees, not things the stylesheet supplies, and GEOM-05 was proven able to fail
by a different route — a scratch copy with the pre-fix `margin-left` restored, which drops it
alone to 60/61. For the same "must be demonstrable" reason a `white-space: nowrap` rule was written
for the button, measured to change nothing at any width, and deleted rather than shipped as CSS no
one could later tell was dead.

## What was NOT verified

**Nothing here has been seen on a screen.** A cloud session cannot preview the sheet. Every claim
above is a measurement — pixel boxes, computed styles, modifier lists, real dice through the real
pipeline — not an appearance. The things most likely to need a real-device correction, on this
project's own track record:

- **The ten-realm picker.** Each realm gets a `<details>` "Rule" disclosure from D45's own
  `opt.note` rendering, which is the same mechanism Feature 4.5.4 had to fix twice for Consumed
  and Failure of Bushido. Ten cards is the largest option list any entry has yet put in that
  modal, and no pixel width measured in this sandbox is trustworthy — the sheet's Google Fonts
  never load here.
- **Row density on Tengoku and Meido**, which carry a badge *and* a toggle. **Toshigoku's own
  badge-and-button density was flagged here as a risk and confirmed real on-device** — see
  "Real-device correction, 17 September 2026" above; fixed and re-verified.
- **The declaration block inside the roll preview**, which is new furniture in a modal that has
  been reported as dense before.
- **Whether `Cursed by the Realm` as a badge label is the right length** — it is the longest entry
  name to get one so far.

The pre-existing `+ -10 bonus` keep-note quirk appears here too, exactly as Feature 4.5.9
recorded it for Doubt: it is trunk code outside this phase's marker, it predates both phases, and
it still wants its own one-line bugfix folder rather than being widened into a release whose
removal must rebuild byte-identical.

## Files

```
src/sheet/209.96-feat-disadv-realm.js     the whole feature
src/css/59.5-disadv-realm.css             its own classes only
src/sheet/210-test-seam-and-init.js       one delimited seam block (+ ADV_LIBRARY)
src/sheet/208-feat-roll-preview.js        four delimited hook blocks — Phase 3's fragment
build/manifest.json                       two entries + expect_sha256
```

## Harness

```bash
NODE_PATH=/opt/node22/lib/node_modules node \
  "Versions/PART I — Phase 4.5.10 Cursed by the Realm/qa/current-suite-runner.js" <built html>
```

**The NODE_PATH in earlier phases' notes is wrong for this environment.** `/home/user/node_modules`
does not exist; Playwright is global at `/opt/node22/lib/node_modules`. With the wrong path every
child suite fails to launch and the 4.59 runner printed `COMBINED 0/0 checks passed` — a line that
reads like success. This release's runner treats a 0/0 run as a failure.
