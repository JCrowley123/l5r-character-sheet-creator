# Part J, Phase 8 — Casting Diagnostics ("Why can't I cast this?")

A spell entry now says whether you could cast it **right now**, and if not, why — in a modal
behind a `?` button beside Cast, and passively as a badge on that button.

**Status: built and verified. 32/32 automated checks pass — dropping to 15/32 with the phase's
own kill-switch disabled, and the surgical removal rebuilds to a file that is byte-identical to
the pre-phase build (`71ab9e17…`, 2,289,334 bytes, both times).** Every other phase's harness
reads identically with this phase present and with it removed.

## The gap the audit actually found

The roadmap's note said the underlying logic mostly existed and the gap was "a unifying engine
and UI, not the underlying logic from scratch." That held — but the audit turned up something
the note did not anticipate, and it is the reason this phase is worth building at all.

**Every casting restriction in this sheet is enforced at *acquisition* time, and none at *cast*
time.** `techQuickAddOptionsHTML()` padlocks a spell you may not learn — `🔒 needs …` — and
that is the whole of the gating. `castSpell()` itself checks exactly one thing: whether a slot
is free. So once an entry is on the Techniques/Kata/Spells list, its Cast button is
unconditional, and a character who has since taken a Bushi School, lost School Rank, or had a
Deficiency applied keeps a working Cast button for a spell the picker would now refuse to hand
them.

Nothing in the sheet asked "can you cast this *now*" before this phase. That is the question it
answers.

## It reports. It never blocks.

Phase 5 of Part J set the precedent and this follows it exactly: nine rules that report against
the sheet's own deciding code, and nothing that clamps, blocks or refuses. Here the Cast button
behaves **identically** whether this fragment is present or deleted, and no arithmetic anywhere
reads anything this phase computes.

That is a deliberate choice, not caution for its own sake. A diagnostic that is wrong about a
rule should cost the player an explanation, never a spell — and this phase is shipping without
the SynergyEngine that would tell it about techniques which *lift* these restrictions, so being
occasionally over-cautious is a known, accepted state. Over-caution that only ever prints text
is recoverable. Over-caution wired into the Cast button would not be.

## Why a registry, and what Phase 6 has to be able to do

Phase 6 of Part G (Kata/Technique Synergy Detection) is a declared dependency of this phase in
the roadmap, and it is **not built** — it is blocked on technique rules text this repository
does not carry. Measured: of the **338** distinct technique names the School libraries
reference, **98 carry no description at all**, and the other 240 are labelled in-code as *"short,
accurate paraphrases of official technique text"* — paraphrase, not rules text. Building a
mechanical stacking engine on that would mean inventing rules content, which Process
Requirement #3 forbids.

So the six reasons the roadmap names are all enforceable from rules the sheet already encodes,
and they are built now. What Phase 6 adds later is the **exceptions** — a technique or kata that
lifts one of these restrictions.

It has to be able to add them **without this fragment being edited**, or Phase 6's code would
end up living inside this phase's marker blocks and neither would be surgically removable. The
shape is therefore copied from `PREROLL_MODIFIER_REGISTRY` in `130-round-and-pipeline.js`, whose
own comment already states the contract this phase needed:

> *"REGISTRY. Each later feature registers its own contributor and never edits this pipeline.
> With an EMPTY registry the pipeline is a mathematical no-op…"*

Phase 6 will call `registerCastingDiagnostic('synergy-exceptions', 50, fn)` from its own
fragment. A contributor may do either of two things:

| Returns | Meaning |
|---|---|
| findings | add a reason, the way the seven built-in rules do |
| `castingSuppression('rank-too-low', '…')` | **cancel** a reason another rule raised — what "this technique lets you ignore that" means |

The precedent for a contributor kind that does not simply add is Feature 6 of Part C's
`informational` modifier in the roll pipeline, whose three deltas are forced to zero.

**A suppressed blocker does not vanish — it is rewritten as a note saying it was lifted, and by
what.** This project has already learned that lesson once: in the Void offer list, an option
refused for a real reason that disappeared silently was reported by the project owner as a
broken feature. Check 25 asserts the lifted note specifically.

### This inverts the roadmap's declared dependency

The roadmap says Phase 8 needs Phase 6. Built this way, **Phase 6 will softly need Phase 8** —
it registers into this phase's registry. That is the same soft shape as the Phase 3 ↔ Phase 4
pair, it is declared in this phase's `ROLLBACK.md`, and the roadmap's Phase 8 Dependencies line
should be amended to record it. Neither direction is hard: with no contributor registered, the
seven built-in rules are the whole engine.

## The seven rules

Six are the roadmap's. The seventh is a deliberate scope addition, recorded here rather than
slipped in.

| id | Severity | Reports against |
|---|---|---|
| `school-restriction` | blocker | `characterCasterLock()` — mirrors the picker's own bushi branch (`casterLock === 'bushi'` → Maho only, from a scroll) |
| `rank-too-low` | blocker | effective School Rank vs. the spell's Mastery |
| `deficiency-lockout` | blocker | the same gate, attributed to its cause |
| `wrong-element` | blocker / caution | `universalSpellElementBlockReason()`, the picker's own function |
| `missing-scroll` | blocker | the Equipment table, with memorisation overriding it |
| `not-memorised` | note | the scroll dependency, when the scroll is present |
| `no-slots` | blocker / caution | **the scope addition** — see below |

**`rank-too-low` and `deficiency-lockout` are one gate, reported once.** A Deficiency is *why* a
rank is too low, not a second reason it is. The sheet already makes exactly this split inside
`universalSpellElementBlockReason()`, which words its message around a Deficiency when that is
the cause and falls back to a generic rank message otherwise. Both firing would be
double-reporting. Check 11 asserts the plain rank finding stays silent in the Deficiency case —
and they are still two independently suppressible ids, so Phase 6 can lift either.

**`no-slots` is not one of the roadmap's six, and is added on purpose.** It is the *only*
refusal the sheet actually enforces at cast time — `castSpell()` ends in *"All … spell slots
used."* A report that omitted it would have been silent about the one thing that stops a cast
today. It distinguishes "element slots gone, a bonus slot would be spent" (caution) from
"everything spent" (blocker).

**"Wrong element" has no single-Element case, and does not invent one.** A normal spell's
Element is fixed when it is added, and being unable to cast in it is already `rank-too-low` or
`deficiency-lockout`. The rule therefore covers the Universal-spell case only — where the spell
names no Element and casting it means picking one — and delegates every per-Element verdict to
the picker's own function so the report and the picker cannot disagree.

## The bug this phase's own removal proof caught

This phase's CSS block was first written where every previous phase's had gone: at the end of
the file, immediately before the trunk's Print banner. That put it **between Part J Phase 5's
block and the Print banner — which is the terminator Phase 5's own removal script uses.**

Phase 5's remover refused outright:

```
REFUSING: "CSS block" line 1752 belongs to another phase --
  '/* ---------- PART J PHASE 8: Casting Diagnostics ("Why can't I cast this?") ---------- */'
```

Its `FOREIGN` assertion doing precisely the job it was written for — this is the Part G Phase 4
failure (a marker silently owning four of another phase's rules) caught *before* shipping rather
than several rounds later. The fix was to move this phase's block **above** Phase 5's, which
restores Phase 5's span to its own block alone and leaves Phase 5 completely untouched. This
phase's CSS terminator is therefore Phase 5's marker, not the Print banner.

## A second ownership bug, caught by the checker

`qa/feature-dependencies.py` reported this phase's entire seam block as belonging to
**`PART G PHASE 6`** — a phase that does not exist.

The cause is that `MARKER_RE` is case-insensitive, so the prose in this phase's own comments —
*"Part G Phase 6 will register a contributor"* — parses as a real ownership marker and takes
the rest of the block with it. Anyone later removing a `PART G PHASE 6` marker would have been
pointed at this phase's exports.

Every marker-shaped phase reference in this phase's comments is therefore worded
`Phase 6 (Part G)` / `Phase 6 of Part G` instead. The checker now reports every reference as
owned, exit 0.

**That rewording itself introduced a third bug, and the removal proof is what caught it.** The
first pass rewrote marker-shaped prose across whole files rather than only inside this phase's
blocks, and silently edited one line of another phase's comment in `10-sheet-base.css`. Nothing
looked wrong; the harnesses all still passed. The removal rebuilt to **2,289,336 bytes against a
target of 2,289,334** — two bytes, which is exactly the length difference between
`Part H Phase 9` and `Phase 9 (Part H)`. Reverted; `git diff` on `src/` is now pure additions
with no deletions anywhere.

Worth stating plainly: three ownership bugs in one phase, none of which review caught, all three
caught by the mechanical checks. That is the argument for the end-of-phase rule, made again.

## The shape of the change

| File | What changed |
|---|---|
| `src/sheet/209.7-feat-casting-diagnostics.js` | **New.** Kill-switch, registry, context builder, seven rules, collector, modal and badge |
| `src/sheet/090-table-rows-weapons.js` | One guarded line at the end of `makeEntry()`. The button is built and wired **inside the fragment**, not here, so the phase's whole visual surface is in one file |
| `src/sheet/110-modals-trackers.js` | One guarded badge refresh at the end of `recalcAll()`, beside Phase 5's |
| `src/sheet/210-test-seam-and-init.js` | Guarded seam export block, and one guarded `init()` call |
| `src/markup/20-fixed-layers.html` | The modal overlay, host only — body filled by the fragment |
| `src/css/10-sheet-base.css` | The `.cast-why-btn` / `.cwd-*` block, placed above Phase 5's (see above) |
| `build/manifest.json` | The new fragment, and the rebuilt hash |

Numbered `209.7` for the same reason Phase 5 is `209.5`: `210` closes the sheet's IIFE, so every
`src/sheet` fragment has to build before it.

## Verification

Run from the Phase 0 folder:

```bash
NODE_PATH=$(npm root -g) node \
  "../../Part J — Data Integrity & Validation/PART J — Phase 8 Why Cant I Cast This/qa/casting-diagnostics-harness.js" \
  l5r-character-sheet.html
```

**Every oracle comes from outside the code under test**, per CLAUDE.md's rule. Effective School
Rank is recomputed in the harness from the `f_rank` input and the School's raw
`affinity`/`deficiency` fields, with arithmetic written independently of
`effectiveSchoolRankForElement()`. Caster category comes off the library entry's own `shugenja`
flag. Scroll presence is read straight out of `#equipBody`'s inputs, not from `hasSpellScroll()`.
Slot state is read off the same inputs `castSpell()` uses. The UI checks read the painted DOM, so
an engine that computes correctly and renders nothing still fails.

**Checks 22–27 drive the extension point the way Phase 6 will** — register a contributor, add a
finding, suppress a built-in blocker, contain a throwing contributor, unregister. Phase 6 does
not exist yet, so these are the only evidence that the seam it is promised actually works.

| Build | Result |
|---|---|
| This phase as shipped | **32/32** |
| `CASTING_DIAGNOSTICS_ENABLED = false` | **15/32** — every rule and every painted row disappears; no page errors, the sheet is simply as it was |
| This phase surgically removed | rebuilds **byte-identical** to the pre-phase build — see the table below |

### The harness had to be made to fail honestly

The first kill-switch run did not score 15/32 — it **crashed**, on a check that indexed into a
findings array that was empty because the phase was off. A harness that dies against a broken
build proves nothing; the entire point of that run is to read a number. The check is now
null-safe, and says so in a comment.

Its first run against the real build also failed three checks for a reason worth recording: the
harness set up a School with `saveSchoolsList()` but never called `recalcAll()`, and
`recalcAll()` is what writes `f_school` — which is the field
`getActiveSchoolElementalProfile()` reads. So no School's Affinity or Deficiency was in effect
at all. **The rules were right and the setup was wrong**, confirmed by reading the effective
rank back through an independent oracle before changing anything.

### Nothing else moved

| Suite | Live build | This phase removed |
|---|---|---|
| Phase 1.6 Combat Tab | 23/23 | 23/23 |
| Phase 1 UI/UX foundations | 9/9 | 9/9 |
| Phase 2 Quick-Access Sidebar | 19/19 | 19/19 |
| Phase 9 Clan-themed look | 17/17 | 17/17 |
| Phase 3 Smart Roll Preview | 43/43 | 43/43 |
| Phase 4 "Explain This Roll" | 22/22 | 22/22 |
| Phase 5 Character Creation Linting | 25/25 | 25/25 |
| Spell Slots visibility bugfix | 6/6 | 6/6 |
| Phase 8 (this phase) | **32/32** | 0/1 — correct for a completed removal |

**Both Part J phases are independently removable, in either order**, measured rather than
asserted. Against a build with **Phase 5 removed and this phase kept**, this phase's harness
reads **32/32** and Phase 5's reads 0/1. Against a build with **this phase removed and Phase 5
kept**, Phase 5's reads 25/25 and this one reads 0/1. Neither depends on the other, despite
sharing a Part, a `recalcAll()` hook and adjacent CSS blocks.

| Structural | Before | After |
|---|---|---|
| `sha256` | `71ab9e17…` | `6c69f072…` |
| bytes | 2,289,334 | 2,319,259 |
| element IDs (all unique) | 259 | **263** (+4 modal IDs) |
| sections | 10 | 10 |
| `.roll-modal-overlay` | 24 | **25** (+1, this phase's modal) |
| tag balance | clean | clean |
| `window.__L5R_TEST__` keys | 322 | **340** |
| `window.__L5R_CAROUSEL__` | 11 | 11 |
| `build.py --check-drift` | — | identical |
| `feature-dependencies.py` | — | exit 0, every reference owned |

## What is NOT verified

- **No real device.** A cloud session cannot preview the sheet. Everything above is
  Playwright/Chromium. This project's own history is blunt about that gap: the first real-device
  test found two bugs in an afternoon, and Phases 1, 2, 3, 4 and 9 all had real-device findings
  after their harnesses were green.
- **The `?` button's placement at phone width is unchecked by eye.** It adds a third control to
  the spell entry's top row, and Phase 9's real-device feedback already flagged floating-control
  clutter as an open problem. This is the most likely thing to come back.
- **Over-reporting is expected, by design.** Without Phase 6 the engine does not know about
  techniques that lift these restrictions, so a "you cannot cast this" that a technique would
  actually permit is a known state, not a defect. It prints text and blocks nothing.
