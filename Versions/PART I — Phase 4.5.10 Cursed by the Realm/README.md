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

### Second pass, same day: asked whether it could sit inline after all

After seeing the flush-left fix, the project owner asked whether the button could instead be
resized to share the badge's line, and separately noticed Yomi's badge (solid, tinted) looked
inconsistent with Gaki-do's (dashed, transparent) — two different rows, both worth answering with
a measurement rather than a guess.

**The button.** Measured three shortened labels against the 143px available: "Willpower (TN 15)"
(158px, still too wide), "Check (TN 15)" (124px, fits), "TN 15 check" (115px, fits with more
margin). Chose "Check (TN 15)" — the row's own description text and the button's `aria-label`
already say "Willpower Trait Roll," so the visible label losing that word costs nothing a player
or screen reader actually needs. Paired with the same compact sizing `.adv-config-btn` uses
(duplicated, not shared — the class-sharing rule this phase has followed throughout), it measures
**117px**, comfortably under budget.

The break span and its margin are gone entirely, not just adjusted. Rather than force one outcome,
the fix removes every assumption about which line the button lands on: with no custom margin left
on it, the row's own `gap:8px` (10-sheet-base.css's `.adv-config-row`) supplies correct spacing
either way, automatically — 8px after the badge if it fits inline, 8px above it if it doesn't.
Measured on this build: it lands inline, 8px after the badge, ending at 285 of the row's 303px.

**Said plainly, because it matters here specifically: this sandbox's measurement is not proof for
the real device.** Button text passes through the same uppercase-plus-letter-spacing transform
that split "Determination" on Feature 4.5.4's first attempt, at a comparable margin (137px against
106px available) to this one. If the real webfont renders "Check (TN 15)" wider than the fallback
serif measured here, it wraps — and because nothing depends on which outcome happens, that is a
size difference, not a bug. The flush-left fix from the first pass needed no such caveat, because
it held at *any* width by construction; this one is font-dependent and needs on-device
confirmation regardless of what heads-less measurement says.

`REALM4510-GEOM-05` was rewritten to match: it now accepts either outcome (same line or wrapped)
and asserts only the invariant that must hold in both — no stray offset. Proven able to fail by
reverting just the custom sizing in a scratch copy (a stray `margin-left:20px` added back): drops
to 61/62 on that one check alone, everything else unaffected.

**Yomi's badge.** The inconsistency was real, not a deliberate distinction — `.realm4510-eff-
reminder` only ever covered the `reminder` effect, and Yomi's effect key is `conflict`, which had
no override and fell through to the base "active" badge look by omission. Yomi never touches a
roll; it only flags entries for the player and GM to resolve, which is exactly the "note to read
for yourself" case the quiet styling exists for. Widened the selector to
`.realm4510-eff-reminder, .realm4510-eff-conflict` — deliberately **not** widened to `check`
(Toshigoku) or `declare` (Maigo no Musha), both of which can produce a real roll or a real
dice-pool change when invoked, unlike Yomi. `REALM4510-GEOM-06` asserts it, proven able to fail by
reverting the selector in a scratch copy: drops to 61/62 on that one check alone.

**Combined: 62/62 own checks, 828/828 combined**, both proven able to fail via isolated scratch
reverts (61/62 in each case, the correct single check going red). Surgical removal re-confirmed
byte-identical to the same `a8c63d61` restore point on a fresh copy; retained suites still read
766/766 with the phase removed.

## Results

| Build | This phase | Retained suites | Combined |
|---|---|---|---|
| **Live** | **62/62** | 766/766 | **828/828** |
| Kill-switch off | **19/50** | — | — |
| Stylesheet dropped | **57/62** | — | — |
| Surgically removed | n/a | **766/766** | — |

Live build: **2,617,077 bytes**, `812ac85e88be88e261a834330fd976612a467448f5ad63da16c096ee052db13a`.
Removed build: **2,585,131 bytes**, `a8c63d61a9cd7fed740792ddd38781280b577941dc3947a07f45b2ae009d2abe`
— byte-identical to the Feature 4.59 build this was added to. Removal fixtures: **19/19**.
`qa/feature-dependencies.py`: clean, every reference inside a block this phase owns.

**The stylesheet-dropped number is 57/62, and it grew by two failures after the second pass, for a
real reason.** After the first pass, GEOM-05 (the flush-left guarantee) and GEOM-06 didn't exist
yet or held without CSS by construction. After the second pass, the button's compact sizing is
genuinely CSS-supplied — without it, "Check (TN 15)" renders at the base `.ghost` default size,
wide enough that it no longer reliably shares the badge's line, so GEOM-05 now correctly fails
too. GEOM-06 fails for the plainest possible reason: without this stylesheet, Yomi's badge has no
dashed rule to apply at all. Both are the checks discriminating exactly where the design now
genuinely depends on CSS, which after the second pass it does more than it did after the first —
proven by the isolated scratch reverts described above, not by this number alone. `.d45-toggle-
label` stays deliberately unasserted, unchanged: it is Feature 4.5.2's, not this phase's.

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
- **Row density on Tengoku and Meido**, which carry a badge *and* a toggle. Toshigoku's own
  badge-and-button density was flagged here as a risk and confirmed real on-device — see
  "Real-device correction, 17 September 2026" above.
- **Whether "Check (TN 15)" actually renders at 117px on the reporting device, not just in this
  sandbox.** This is the specific, named risk from the second-pass correction above, not a generic
  caveat: the measured margin is real but the webfont is not the one this was measured against.
  If it wraps on-device instead of sharing the line, that is expected behaviour working as
  designed, not a defect — but it is the one part of this phase most likely to still change.
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
