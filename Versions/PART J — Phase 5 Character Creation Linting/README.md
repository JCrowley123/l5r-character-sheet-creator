# Part J, Phase 5 — Character Creation Linting

The sheet has always *known* when a character was illegal. It just never said so. This phase adds
a `CharacterValidator` — nine discrete rule functions over the sheet's own deciding code — and a
`ValidationReport` panel under the XP breakdown on the Identity tab that prints what they find.

**Status: built and verified. 25/25 automated checks pass — dropping to 11/25 with the phase's
own kill-switch disabled and to 0/1 with its fragment deleted, in both cases failing exactly the
checks that describe what was taken away.** The eight other phase harnesses read identically with
this phase present and with it surgically removed, and the removed build hashes **byte-identically
to the build from before this phase existed**.

## The audit found consolidation, exactly as the roadmap predicted

The roadmap's note on this phase — *"the real work here is consolidation into one module, not
writing rules from nothing"* — held up, and more strongly than Phase 4's equivalent note did.
Every one of the five named rule families already had working machinery behind it:

| Roadmap rule family | What already existed | What was missing |
|---|---|---|
| Illegal trait combinations | `characterCasterLock()` / `schoolCasterCategory()` — a character can never hold both a Bushi and a Shugenja School | It only fires on the Add School path. A JSON import or a hand-edited save is never re-examined |
| Missing school skills | `schoolConcreteSkillNames()` parses a School's skill string correctly; `hasSchoolSkillOverlap()` computes "Rank 1+ in every one" | Consumed only as a silent technique-unlock gate. Nothing ever said *which* skills were short |
| Incorrect XP totals | `traitCost` (×4/step), `voidCost` (×6/step), `skillCost` (triangular + 2/Emphasis), free floors, adv/disadv, kata, memorisation — all exact, all in `recalcAll()` | No validation at all. Overspending just shows a negative number in `f_xpRemain` |
| Bushi spell violations | `casterLock === 'bushi'` already filters the spell picker to Maho-with-scroll | Preventive at the picker only. A character who gains a Bushi School *after* acquiring spells is never rechecked |
| Over-capped rings | Rings are **derived** — `recalcAll()` writes `ring_<key> = Math.min(trait1, trait2)` every pass | See "What needs the sourcebooks" below. This one could not be built honestly |

So this phase writes no rules content of its own. Each rule reads the sheet and reuses the
sheet's own functions — the same line Phase 3 and Phase 4 took for the roll pipeline, for the
same reason: a second implementation is free to drift, and a validator that disagrees with the
sheet it validates is worse than no validator.

## The nine rules

| Rule | Severity | What it catches |
|---|---|---|
| `caster-lock-conflict` | error | Both a Bushi and a Shugenja School held at once |
| `bushi-spell` | error | Ordinary (non-Maho) spells on a Bushi character |
| `trait-range` | error | A Trait or Void outside the range its own `<input>` declares |
| `school-rank-over-insight` | error | Combined School Rank above Insight Rank — a **tripwire**, see below |
| `xp-overspend` | error | `f_xpSpent` above `f_xpTotal` |
| `school-skills-missing` | warning | Concrete School Skills sitting at Rank 0 |
| `trait-below-free-floor` | warning | A Trait below the floor Apply Family / Apply School granted free |
| `school-choice-slots` | info | "Any one X Skill" slots the School grants and Apply School cannot pick |
| `xp-unspent` | info | XP remaining, in case the character was meant to be finished |

**Severity is advice, never enforcement.** Nothing here blocks an edit, clamps a value or refuses
a save. A findings list that is wrong about an edge case costs the player an ignorable line of
text — which is also what makes the phase safe to remove.

**`school-rank-over-insight` should never fire.** `computeCappedActiveRank()` already clamps the
active School to enforce it. The rule exists because that clamp is the only thing holding the
invariant, and from outside a silent clamp and a silent violation look identical.

## Three things the audit turned up that are not this phase's to fix

Recorded rather than actioned, because each is a behaviour change in code another Part owns, and
`CLAUDE.md` says not to modify previous phases.

**1. The Rings hint promises something the code takes back.** The Rings & Traits tab reads
*"Ring rank normally equals the lower of its two traits — adjust freely if kata, advantages, or
void points change this."* But `recalcAll()` overwrites all four elemental Rings from
`Math.min(...)` on **every pass**, unconditionally. Adjusting one does not survive the next
recalc. The hint is true only of Void, which is a free input and not in `RINGS`. Either the hint
or the overwrite is wrong; deciding which is a rules question, not a linting one.

**2. `schoolConcreteSkillNames()` searches only `SCHOOL_LIBRARY`.** Minor Clan and Brotherhood
Schools resolve to `[]`, so `hasSchoolSkillOverlap()` returns `false` for them — meaning a Minor
Clan or Brotherhood School taken as a *second* School has its Techniques permanently locked.
Narrow (it needs Multiple Schools), but real. This phase's own `validatorConcreteSkills()` takes
a resolved library entry instead and covers all three libraries, so its findings are correct for
those Schools even while the unlock gate is not.

**3. `characterCasterLock()` resolves through `findSchoolLibraryEntry()` (major Clans only).** A
Minor Clan Shugenja School therefore sets no caster lock. This phase uses
`findAnySchoolLibraryEntry()` and so can report a conflict the Add School guard would let
through — which is the point of a validator, but worth knowing they can disagree.

## What needs the sourcebooks

The roadmap names **"over-capped rings"**. The sheet caps nothing about a Ring today, and the RAW
that would say where a cap sits — the character-creation Trait ceiling — is in sourcebooks this
environment does not have (`L5R 4th edition books/` is gitignored and desktop-only). Per Process
Requirement #3, it is **not invented here**.

What *is* checkable about Traits without any sourcebook is built: the range each input declares,
and the free floors Apply Family / Apply School recorded. The creation ceiling itself is parked
for a desktop session, alongside Phase 9's school flavour text.

Related, and also parked: **there is no "at creation" vs "in play" distinction anywhere in the
sheet** — Phase 12 (Play/Management Mode Split) is the phase that introduces one, and it is not
built. Rules that are true only during character creation cannot be expressed honestly until it
is. Every rule shipped here holds at all times, which is why none of them needed that flag.

## Verification

Run from the Phase 0 folder:

```bash
NODE_PATH=$(npm root -g) node \
  "../../PART J — Phase 5 Character Creation Linting/qa/character-validator-harness.js" \
  l5r-character-sheet.html
```

**The oracle is the sheet's own state, never the validator's view of it.** `f_xpSpent` is written
by `recalcAll()` and compared against `f_xpTotal` *in the harness*; the expected caster category
is read off `SCHOOL_LIBRARY`'s own `shugenja` flag rather than from `schoolCasterCategory()`; the
expected missing-School-Skills set is computed by a parser written independently of the one in
the fragment, so the two disagreeing fails the check. Two checks read the **painted DOM** rather
than the returned findings, so a validator that computes perfectly and renders nothing still
fails.

### Proving the harness can fail

| Build | Result |
|---|---|
| This phase as shipped | **25/25** |
| `CHARACTER_VALIDATOR_ENABLED = false` | **11/25** — no page errors; the eleven survivors are the checks asserting an *absence*, plus the pure string-parse check the flag does not gate |
| This phase's fragment deleted | **0/1** — stops at "the phase exports validateCharacter on the test seam". The correct result for a completed removal |

One check went red during development for a real reason and the **assertion** was what was wrong,
not the code: *"a rule that throws is contained, and the other rules still run"* failed because on
a baseline character the rule being made to throw was the only rule producing a finding at all, so
"the others still ran" was honestly false. Fixed by giving the character an unrelated failing rule
first. Worth recording as the counter-example to the temptation to weaken an assertion that goes
red.

### Nothing else moved

Every suite below was run against **both** the live build and a build with this phase surgically
removed. Identical in every case.

| Suite | With Phase 5 | With Phase 5 removed |
|---|---|---|
| Phase 1.5 roll-pipeline baseline | 34/34 | 34/34 |
| Phase 1 UI/UX foundations | 9/9 | 9/9 |
| Phase 1.6 Combat tab / wound bar | 23/23 | 23/23 |
| Phase 2 Quick-Access Sidebar | 19/19 | 19/19 |
| Phase 9 Clan-themed look | 17/17 | 17/17 |
| Phase 3 Smart Roll Preview | 43/43 | 43/43 |
| Phase 4 "Explain This Roll" | 22/22 | 22/22 |
| BUGFIX Spell Slots visibility | 6/6 | 6/6 |

| Structural check | Result |
|---|---|
| `qa/inventory.py` | 259 element IDs (**+1**, `validationReport`), 0 duplicated; 10 sections, 24 overlays, tag balance clean — all unchanged |
| `window.__L5R_TEST__` | 306 → **322** keys; **nothing lost**, measured by set difference |
| `window.__L5R_CAROUSEL__` | 11 methods, unchanged |
| `feature-dependencies.py` | exit 0 — every reference sits in a block this phase owns |
| `build/recombine.py --verify` | BYTE-IDENTICAL |
| `build.py --check-drift` | identical to the Phase 0 build |
| Behavioural sweep (14 flows), removed vs live | 0 page errors in either. **Only five element keys differ anywhere**: `validationReport` and its four DOM ancestors (`car-panel-1`, `carTrack`, `carViewport`, `carShell`), whose text grows by a constant amount in every flow. Four flows show no difference at all |

That last row is the behavioural claim stated precisely. The comparison is deliberately
**removed-build vs live-build, both current**, not against `qa/rebuilt-behaviour.json` — that
baseline was recorded at Phase 0 and predates six phases, so diffing against it would have
reported their changes as this phase's.

## Removability

Proven, not asserted. `qa/remove-phase.py` performs the removal and **asserts before every
deletion** that the lines it cuts contain no other phase's marker and name only things this phase
introduced. It earned those assertions: it refused three times over lines it could not attribute,
and each refusal was fixed by making the attribution rule precise rather than by loosening it.

The result: a build with this phase surgically removed is **byte-identical to the build from
before it was added** — `50ab1c71…`, 2,265,218 bytes, both times. Not "equivalent", not "the
tests still pass": the same file.

The one trap worth naming is in `ROLLBACK.md` in full — this phase's CSS block is terminated by
the trunk's own `/* Print / PDF export */` banner rather than by another phase's marker, so a
removal that deleted "to the end of the file" would take that banner with it. The block ends with
an explicit `/* END PART J PHASE 5 … */` comment marking the boundary, and the removal script
stops at the banner rather than at EOF. This is the same class of bug Part G Phase 4 shipped in
the opposite direction.

## The shape of the change

| File | What changed |
|---|---|
| `src/sheet/209.5-feat-character-validator.js` | **New.** The kill-switch, nine rule functions, `validateCharacter()`, `renderValidationReport()` |
| `src/sheet/110-modals-trackers.js` | 7 lines: a guarded `renderValidationReport()` at the very end of `recalcAll()`, so rules read the numbers that pass has finished writing |
| `src/sheet/210-test-seam-and-init.js` | 15 lines: guarded seam export. Every rule is exported individually so the harness can assert one rule at a time |
| `src/markup/10-swipe-tab-shell.html` | 6 lines: the `#validationReport` host under `#xpBreakdown`, carrying `print-hide` |
| `src/css/10-sheet-base.css` | 45 lines: the `.vr-*` panel styles. Severity colours are **pinned literals**, not `var(--shu)` — Phase 9's Clan themes override that token, and an error badge that turns Crane blue has stopped saying "error" |
| `build/manifest.json` | 2 lines: the new fragment, plus the rebuilt hash |

**Why the fragment is numbered `209.5` and not `211`.** Build order is what matters, and
`210-test-seam-and-init.js` **closes the sheet's IIFE** — every `src/sheet` fragment must build
before it. A higher number would sort after the file it has to precede, which is a trap for
whoever adds the next phase. The manifest entry says the same thing.
