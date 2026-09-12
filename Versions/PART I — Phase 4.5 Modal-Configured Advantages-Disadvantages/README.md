# Part I, Phase 4.5 — Modal-Configured Advantages/Disadvantages

Some Advantages are not one thing. *Elemental Blessing* is "choose a non-Void Ring"; *Lord Moon's
Curse* is 3, 5 or 7 points with a different severity at each price. Until this phase the sheet had
nowhere to record which one you took, and no way to act on it — an entry was a name, a number the
player typed, and free text.

Now those entries carry a **pick**, stored with the character, and the pick changes what the sheet
does: a blessed Ring's two Traits each cost 1 XP less per Rank bought, a severity tier sets the
entry's own cost, and three roll-effect Advantages reach the dice through the roll pipeline's own
registry. The completion pass extends the same contract to eight more requested Advantages,
including session resources and Clan-owned equipment.

**Status: built and verified.** The original regression harness is **51/51** and the completion
harness is **48/48**. The ten unaffected phase harnesses retain their passing totals with this
phase present and removed; Phase 1.5 remains **35/35** in both builds. Surgical removal restores
the pre-phase source and rebuilds **byte-identically** to `9dbaf6c6…`, 2,322,320 bytes. The
canonical expanded build is 2,428,891 bytes, SHA-256
`4355dec4b219883bb041e48a02773af3006d762fa6b48f35b9c273d429553481`.

---

## 4.5.2 — completion pass: the eight requested Advantages

The completion pass stays inside five new Phase-4.5-owned fragments and the existing guarded
hooks. It reuses the universal-spell modal host; it does not add a second picker framework or
edit the Advantage library rows. Every variable entry is visibly marked **Needs a choice** and
resolves to no effect until its configuration is complete.

| Advantage | Configuration and behaviour | Boundary deliberately kept |
|---|---|---|
| Allies | Influence 1/2/4 plus Devotion 1/2/4; total cost is both tiers, with Crane −1 XP (minimum 1) | No roll modifier |
| Gentry | Village 8, Large Village 15, Unique Holding 18, Town 20, City 25, Province 30 | Uses the approved intermediate ladder |
| Kharmic Tie | Free-text target first, Rank 1–5 second; one +1k1 attack declaration per Rank and per-entry/session reset | Attack preview only when protecting the named target; target and remaining pips persist |
| Languages | Human (1 XP) or Non-human (3 XP), then free-text language | Badge only; no roll modifier |
| Luck | Rank 1/2/3 costs 3/6/9 and supplies the matching pip pool | Post-roll **whole-roll** RAW reroll, keep higher result; disabled at zero |
| Magic Resistance | Rank 1/2/3 costs 2/4/6 | Incoming elemental-spell TN reminder for the player; no change to the player's own casting rolls, and no Maho/gaijin/non-human claim |
| Sacred Weapon | No modal; Clan selects the approved weapon profile and cost, auto-adding tagged equipment | Conditional jade/TN/reroll/mounted/taint rules remain explicit table notes where a companion cannot know the situation |
| Great Potential | Free-text/datalist Skill pick; preview reports Skill Rank and Void Rank raise limits | Informational only because the sheet has no separate Raise-spending engine |

The Kharmic Tie module is intentionally ring-fenced: its preview declaration, counter, reset, and
modifier path live in their own fragment and can be changed or removed without touching Luck,
Sacred Weapon, or the general resolver. Sacred Weapon rows carry a Phase-4.5 source identity, so
Clan changes and Advantage removal delete only generated rows, never a manually added weapon.

The Magic Resistance and Sacred Weapon choices are player-companion boundaries, not omissions.
Magic Resistance reminds the player to communicate an incoming elemental TN increase at the
table. Sacred Weapon applies the known Clan base profile and prints the exact conditional rule;
it does not pretend to know target Taint, mounting, duels, or Disarm state.

### Completion-pass audit findings

The original Phase 4.5 shipped with only the Ring/severity schema and three roll effects. The
audit found these gaps before extension: Allies, Gentry, Kharmic Tie, Languages, Luck, Magic
Resistance, Sacred Weapon, and Great Potential had no complete schema/effect path; persistence
only carried `{type,value}`; the shared modal's 78×78 `nowrap` assumptions were not scoped for
long labels; session resources and generated-equipment ownership had no persistence or removal
contract; and the generic effect summary could silently show `undefined` fields for extended
entries. The completion pass closes each gap without changing the trunk's single registry seat.

---

## 4.5.1 — the roll-effect half, and the ruling it needed

This phase first shipped **cost effects only**, with the roll half blocked on a decision rather
than on effort. It is now complete; the reasoning is kept because it is the interesting part.

A roll effect belongs in `PREROLL_MODIFIER_REGISTRY` — the sheet's one documented way to adjust a
pool, whose own contract is *"each later feature registers its own contributor and never edits
this pipeline"*. But Phase 1.5 (Part G) baselined that registry and asserted its exact contents,
and its own source comment named this phase by number: *"later phases (3, 4, 4.5, 6) must not
change how these combine."* Registering a seventh contributor took that suite to 33/34, and the
only repair was editing a previous phase's recorded baseline.

**The project owner ruled that the baseline may go from six to seven**, on the grounds that Phase
1.5 is an *audit* phase whose job is to notice pipeline changes rather than forbid them. That
ruling is what unblocked this half.

### How Phase 1.5's assertion was changed, and why not to `length === 7`

The literal instruction was "bump the assertion to 7". Implemented literally, that would have
**broken this phase's own removability proof**: with Phase 4.5 surgically removed the registry
holds six again, so a hard seven would fail — and "all other harnesses read identically with this
phase present and removed" is a property already proven and worth keeping.

So it is split into two checks instead:

- the **six core contributors** are present, in priority order (unchanged in substance);
- the **only** contributor beyond them is this phase's `adv-config`, asserted *conditionally on
  this phase being in the build*.

Phase 1.5 therefore reads **35/35 both with this phase present and with it removed**, and any
*other* unexpected contributor still fails — which is the "no omissions" property that check
exists for. One check was added, not replaced.

### The three entries, and why one of them moves no dice

| Entry | The library's own words | What it does |
|---|---|---|
| Chosen by the Oracles | "Choose a Ring; gain +1k1 on all Ring Rolls using it" | `+1k1` on Ring Rolls of that Ring |
| Friendly Kami | "Choose an Element; +1k1 on Sense/Commune/Summon Spell Casting Rolls for it" | `+1k1` on those three spells cast in that Element |
| Friend of the Elements | "Choose a Ring; Trait Rolls using either of its Traits gain a Free Raise" | **Reports** the Free Raise; moves no dice |

**A Free Raise is not a dice-pool change.** It is a Raise you did not have to declare, and this
sheet has no Raise mechanic to spend one through — every other Free Raise in the codebase (a
dozen Skill Mastery abilities) is likewise descriptive text the player applies by hand. So Friend
of the Elements registers an `informational:true` modifier, whose three deltas the pipeline's own
normaliser forces to zero. It appears in the roll preview and the post-roll breakdown saying the
Free Raise is available, and changes no arithmetic. Inventing a dice equivalent (`+0k1`, or a −5
to TN) would be inventing rules content, which Process Requirement #3 forbids. The precedent for
a contributor that reports rather than adds is Feature 6 (Part C)'s arrow entry.

That is asserted the hard way rather than by trusting the flag: one check folds the modifier
through the trunk's own `applyPreRollModifiers()` and requires the resulting pool to be
**identical** to the pool with no modifier at all, while still confirming the note was reported.

### Chosen by the Oracles offers Void; Elemental Blessing does not

A rules distinction, not a UI one. Elemental Blessing says "a **non-Void** Ring"; Chosen by the
Oracles says "a Ring", with no exclusion — and Void **is** rollable on this sheet (the Void card
carries its own `.ring-name` with `data-ring-name="Void"`, so a Void Ring Roll reaches the
pipeline like any other). The schema therefore carries `ringSet:'all'` for the one and the
default four-Ring set for the other, and a check asserts the two option lists differ in exactly
that way.

### Every context key read is the trunk's, not another phase's

The contributor reads `kind`, `ringName`, `traitName`, `spellName` and `element` — all of which
were on the roll context before Phase 4 (Part G) existed. The keys Phase 4 *added* (`ringValue`,
`traitValue`, `schoolRank`…) are deliberately **not** read. That is what keeps this a trunk
dependency rather than a new cross-phase one, and it is confirmed by Phase 4's harness and this
one both passing against a build with the other removed.

### A second kill-switch

`ADV_CONFIG_ROLL_EFFECTS_ENABLED` disables the roll half alone, leaving the cost half untouched.
The contributor stays **registered** either way — an inert registered contributor is still
registered, and making the registry's contents depend on a flag Phase 1.5 cannot see would make
that phase's report dishonest. Measured: with the flag off this harness reads 41/49 and Phase 1.5
still reads 35/35.

## Original first-pass scope (historical)

The table in this section documents the first cost/roll pass that preceded the completion pass
above. It remains useful as an audit record, but it is no longer the complete Phase 4.5 inventory;
see the 4.5.2 table for the current eight-Advantage extension.

The schema is a name-keyed table **inside this phase's own fragment**, not new fields on
`ADV_LIBRARY`'s rows. The roadmap's Engineering Scope reads as the latter; it was built the other
way for removability. Adding `config:{…}` to seven library rows means seven edited lines inside the
trunk's data, each of which a removal has to find and revert exactly. Keeping the table here means
`ADV_LIBRARY` is not touched at all — **this phase deletes to nothing**.

**Every number in it is quoted from the library entry's own description string.** That is the whole
inclusion test, and it is why the table is ten entries rather than thirty:

| Entry | Type | The library's own words | Options |
|---|---|---|---|
| Elemental Blessing | `ringPick` | "Choose a non-Void Ring; increasing either of its Traits costs 1 XP less" | Air / Earth / Fire / Water |
| Lord Moon's Curse | `severityTier` | "3/5/7 points" | Low 3 · Medium 5 · High 7 |
| Luck | `severityTier` | "3/6/9 points per rank" | Rank 1/2/3 → 3 · 6 · 9 |
| Magic Resistance | `severityTier` | "2/4/6 points per rank" | Rank 1/2/3 → 2 · 4 · 6 |
| Antisocial | `severityTier` | "2 points for -1k0, 4 points for -1k1" | −1k0 2 · −1k1 4 |
| Enlightened Madness | `severityTier` | "4 or 6 points … (TN 20 or 30)" | TN 20 4 · TN 30 6 |
| Cast Out | `severityTier` | "1 point for a single temple's disapproval, 3 for a major Brotherhood sect" | One temple 1 · Major sect 3 |
| Chosen by the Oracles | `ringPick` | "Choose a Ring; gain +1k1 on all Ring Rolls using it" | Air / Earth / Fire / Water / **Void** |
| Friend of the Elements | `ringPick` | "Choose a Ring; Trait Rolls using either of its Traits gain a Free Raise" | Air / Earth / Fire / Water |
| Friendly Kami | `ringPick` | "Choose an Element; +1k1 on Sense/Commune/Summon Spell Casting Rolls for it" | Air / Earth / Fire / Water |

Entries whose own text gives a **range** rather than named prices — *Compulsion* "2-4 points",
*Consumed* "4-6", and *Dependant* "roughly 2-6" — are **not** included in this first-pass table.
Gentry is now the explicit completion-pass exception: its approved Village-through-Province ladder
is recorded in the 4.5.2 table above rather than inferred from the shorthand "8-30".

**That claim is tested, not asserted.** Check 8 adds every tiered entry through the sheet's real
quick-add dropdown, reads the description the library actually painted, and fails if any price this
phase offers is not a number appearing in that text. It audits 15 prices across 6 entries.

### Elemental Blessing discounts only Ranks actually bought

"Increasing either of its Traits costs 1 XP less" applies to Ranks the player buys. Ranks below a
Trait's free floor (a Family or School bonus) cost nothing to begin with, so there is nothing there
to make cheaper — a Blessing on a Ring whose Traits are both still at their floor is worth 0, not
worth 2 XP of nothing. The discount is also clamped so it can never exceed what the Trait itself
costs, asserted rather than assumed safe.

Void is not offerable, because the options are read from `RINGS` — which holds exactly Air, Earth,
Fire and Water. "Non-Void" therefore needs no list of its own that could fall out of step.

---

## Design decisions worth recording

**The discount is subtracted, not substituted.** `recalcAll()`'s Trait loop still calls
`traitCost()` exactly as it did; this phase subtracts on its own line beneath it. The base rule
stays in one place, and the removal is a block deletion rather than a restoration of rewritten
arithmetic. The two `parseInt()` calls are deliberately repeated rather than hoisted into shared
consts — per `CLAUDE.md`, unambiguous ownership is worth more than the duplication costs.

**A severity tier writes the entry's own cost field.** It does not keep a parallel number. The
sheet already totals that field, so the tier has no second place to be counted and cannot disagree
with the row the player is reading — which is also why "changing severity updates totals without
double-counting" needs no unwinding logic: there is only one number.

**Nothing is ever silently defaulted.** An unconfigured variable entry paints a gold "Needs a
choice" flag and contributes **no** effect. The modal opens at pick-time, but cancelling is free:
the entry lands on the list flagged, and the player can choose later. This follows Phases 5 and 8 —
the sheet reports, it does not block.

**Renaming an entry drops its pick.** Type over "Elemental Blessing" and the control, the stored
pick and the discount all go together. An effect that outlived the name justifying it would be
invisible XP arithmetic, which is the exact problem this phase exists to remove.

**The flag's colour is pinned, not themed.** Gold, not a `--shu*` token — every one of those is
overridden per Clan by Phase 9 (Part H), and a "you have not finished this" marker that turns
Crane-blue on a Crane character stops reading as a warning. Same reasoning as Phase 8's caution
colour, and colour is never the only signal: the row says so in words.

---

## The shape of the change

| File | What changed |
|---|---|
| `src/sheet/209.8-feat-adv-config.js` | **New.** Kill-switch, schema, resolver, discount, picker modal, per-entry controls |
| `src/sheet/110-modals-trackers.js` | Trait XP discount inside `recalcAll()`'s `RINGS` loop; control repaint at the end of the pass |
| `src/sheet/090-table-rows-weapons.js` | `makeEntry()` carries `data-adv-config` through, like `spellElement` above it |
| `src/sheet/120-persistence.js` | `collectData()` writes `config:{type, value}` back out |
| `src/sheet/040-lib-kata-kiho-spells.js` | The quick-add opens the picker at pick-time |
| `src/sheet/210-test-seam-and-init.js` | Guarded seam export; `initAdvConfig()` in `init()` |
| `src/markup/20-fixed-layers.html` | The picker modal host, reusing the universal-spell picker's markup |
| `src/css/10-sheet-base.css` | The `adv-config-*` block |
| `build/manifest.json` | The new fragment, and the rebuilt hash |

**Every one of those is an addition.** The original core pass rewrote no existing line in any
shared file; its removal list remains a historical seven-file record. The completion pass adds five
owned fragments and marked hooks in the same surgical style, and its remover restores the full
pre-phase source rather than copying an `originals/` snapshot over later work.

---

## Verification

Run from the Phase 0 folder:

```bash
NODE_PATH=$(npm root -g) node \
  "../../PART I — Phase 4.5 Modal-Configured Advantages-Disadvantages/qa/adv-config-harness.js" \
  l5r-character-sheet.html

NODE_PATH=$(npm root -g) node \
  "../../PART I — Phase 4.5 Modal-Configured Advantages-Disadvantages/qa/adv-config-expansion-harness.js" \
  l5r-character-sheet.html
```

**The oracles are deliberately not this phase's own code.** The harness reimplements L5R's Trait
cost rule independently (each new Rank costs new-rank × 4); it writes out the Air/Earth/Fire/Water
Trait pairings from the *game's* rule rather than reading `RINGS`, so a phase that discounted the
wrong Ring's Traits could not be agreed with by its own data; every "the discount reached the
tracker" check reads `f_xpSpent`, which `recalcAll()` writes; and the flag checks read the painted
DOM, so a phase that resolves correctly and renders nothing still fails.

### Proving the harness can fail

It passed 34/34 on the first run, which in this project means nothing until it has been made to go
red for the right reasons. Four builds, three of them deliberately broken:

| Build | Result |
|---|---|
| This phase as shipped | **51/51** |
| `ADV_CONFIG_ENABLED = false` | **24/49** — no picker, no flag, no discount, no roll effects; no page errors, the sheet is simply as it was |
| `ADV_CONFIG_ROLL_EFFECTS_ENABLED = false` | **41/49** — the roll half goes silent, the cost half untouched |

*(the two kill-switch rows were measured at the 49 checks that existed before the layout pair was
added; both of those pass vacuously with the feature off, since a picker that never opens renders
no tile to overflow)*
| **Bug:** the XP discount ignores which Ring was blessed | **47/49** |
| **Bug:** the XP discount counts every Rank, not only bought ones | **44/49** |
| **Bug:** Friend of the Elements made a real +1k1 instead of informational | **47/49** — caught by the informational assertion AND by the pool-identity check |
| **Bug:** Chosen by the Oracles ignores which Ring was rolled | **48/49** |
| **Bug:** the tile-layout fix reverted (the bug a laptop actually found) | **50/51** — the layout check names all 15 overflowing options |
| This phase's fragment surgically removed | the harness stops at **0/1** (it needs the function it tests) — the real evidence is the table below |

**Phase 1.5 read 35/35 against every one of those builds**, which is the evidence that none of
these mutations reaches the pipeline's own contract — only this phase's behaviour.

**On reading 24/49 rather than something lower with the kill-switch off:** roughly a third of the
roll-effect checks are *negative* ("contributes nothing to any other Ring", "nothing on a Maho
casting"), and a negative assertion passes trivially when the feature is absent. That is expected
rather than a weak harness, and it is why the targeted single-behaviour mutations above — each of
which leaves everything else working — are the more informative numbers.

The first run against the kill-switch build **crashed** rather than reporting a number, because the
helpers reached for a button that no longer existed. That is a harness defect by this project's own
standard — a harness that dies proves nothing about what it was measuring — so the DOM reaches now
return a reason instead of throwing, and that build reports 17/34.

### Nothing else moved

| Suite | Live build | With this phase removed |
|---|---|---|
| Phase 1.5 roll-pipeline baseline | **35/35** | **35/35** |
| Phase 3 Smart Roll Preview | 50/50 | 50/50 |
| Phase 4 Explain This Roll | 22/22 | 22/22 |
| Phase 1 UI/UX foundations | 9/9 | 9/9 |
| Phase 1.6 Combat Tab Streamlining | 23/23 | 23/23 |
| Phase 2 Quick-Access Sidebar | 19/19 | 19/19 |
| Phase 9 Clan-themed look | 17/17 | 17/17 |
| Phase 5 Character Creation Linting | 25/25 | 25/25 |
| Phase 8 Casting Diagnostics | 36/36 | 36/36 |
| Spell Slots visibility bugfix | 6/6 | 6/6 |
| Rebuilt output with this phase removed | — | **byte-identical** to the pre-phase build `9dbaf6c6…`, 2,322,320 bytes |
| All 8 touched source files after removal | — | **identical** to `originals/`, file by file |
| `feature-dependencies.py` for this phase | clean — every reference sits in a block this phase owns | — |

### What the mandatory end-of-phase re-verification caught

`CLAUDE.md` requires removability to be re-proven against the tree as it finally stands, and this
phase is another argument for that rule. `feature-dependencies.py` reported **six of this phase's
own CSS rules as owned by `PART J PHASE 5`** — a phase whose remover would have deleted them.

The cause is the trap Phase 8 (Part J) documented and `CLAUDE.md` records: `MARKER_RE` is
**case-insensitive**, so marker-shaped prose in a comment is parsed as a real ownership marker.
This phase's CSS comment explained its own placement with the words *"Part J Phase 5's removal
script cuts from its marker…"* — and that sentence handed everything below it to Phase 5. Reworded
to "Phase 5 (Part J)'s", the checker reports clean.

Review did not catch it. The checker did, on a tree that had already passed every behavioural test.

### What the removal script's assertions caught

Four defects, all in the removal path rather than the feature, all caught by assertions rather than
by reading: an incomplete ownership list, a span cut that would have swallowed the trunk's own
`#disadvList` loop, two end-predicates that matched too early and left live code behind, and a
doubled blank line that made the rebuild one byte heavy. They are written up in `ROLLBACK.md` under
"What the assertions caught". Byte-identity is what surfaced the last one; "looks right" would not
have.

---

## Completion-pass QA report

The dedicated expansion harness runs against the built browser artifact and contains 48 checks:

| Area | Result |
|---|---|
| Schema, modal flows, badges, unconfigured states | **PASS** |
| XP calculation and unrelated-total isolation | **PASS** |
| Kharmic Tie target-gated preview, spend, and reset | **PASS** |
| Luck whole-roll reroll, keep-higher, and zero-pip disable | **PASS** |
| Great Potential preview limits and Magic Resistance boundary | **PASS** |
| Sacred Weapon Clan mapping, auto-add, change, and owned-row cleanup | **PASS** |
| Save/load/import/export config and pip persistence | **PASS** |
| Browser errors and registry shape | **PASS** |

The legacy Phase 4.5 harness remains **51/51**. The unaffected harnesses were run on both builds
and retained their totals: Phase 1.5 **35/35**, Phase 3 **50/50**, Phase 4 **22/22**, Phase 1
**9/9**, Phase 1.6 **23/23**, Phase 2 **19/19**, Phase 5 **25/25**, Phase 8 **36/36**, Phase 9
**17/17**, and the Spell Slots visibility fix **6/6**. The Phase 0 behaviour snapshot also
completed without errors; its raw seam inventory is expected to differ because Phase 4.5 exports
its own guarded test surface.

`feature-dependencies.py` reports every JavaScript, CSS, markup, ID, class, and data-attribute
reference as owned by a Phase 4.5 marker. The removal script was exercised on a line-ending-
controlled copy: all ten touched trunk inputs compare byte-for-byte after normalisation, and the
rebuilt output is exactly the pre-phase hash above. No Phase 1.5 baseline or other phase source was
changed to make the result pass.

## One known behaviour, stated rather than discovered later

A severity tier writes the entry's cost field, and that field stays **editable** afterwards, as it
always has been. So a player who picks "High" (7) and then types 5 into the box ends up with a row
whose summary says *High — 7 points* above a cost of 5, and the XP tracker follows the box, not the
summary.

That is deliberate rather than unhandled: the cost field is the player's, several entries are
clan-discounted in ways no library text enumerates ("Crab pay 1 more"), and taking the field away —
or silently overwriting a hand-typed number on the next recalc — would be worse than the
inconsistency. The summary describes *what you picked*; the field describes *what you paid*. If
this reads as a bug on a real device rather than as a feature, the fix is a reconciliation note on
the row in the spirit of Phase 4's "the parts on record do not reconcile" line, not clamping.

## Fixed after the first real-laptop pass

The picker opened looking like this: **`LOW 3 PTMEDIUM 5 PHIGH 7 PTS`** — three labels overflowing
their tiles and colliding into each other.

**Cause.** This picker reuses the universal-spell Element picker's markup, per the roadmap's "no
new modal system". That picker's tiles are a **fixed 78×78 square** whose label carries
`white-space:nowrap` — exactly right for the labels it was built for, which are all one short word
(Air, Earth, Fire, Water). A severity tier's label is three or four words, so it could neither wrap
nor fit. Reusing markup inherits its *assumptions*, not just its look, and this one was unstated.

**Fix.** An override scoped to `#advConfigGrid` — auto width between 88px and 160px, a wrapping
label, and the points on their own line under the name. Scoped to this phase's own grid
deliberately: `.affinity-pick-item` belongs to the trunk and is shared with the universal-spell and
Affinity pickers, where the uniform square is right and where a phase like this one has no business
changing the look. The ID beats the class on specificity with no `!important`, and the whole
override disappears with this phase's CSS block.

**It was worse than reported.** The laptop showed Lord Moon's Curse; the check written afterwards
found **all 15 options across all six severity-tier entries** overflowed — Cast Out's "A major
Brotherhood sect 3 pts" worst at **292px in a 78px tile**. The Ring pickers were fine throughout,
which is why it went unnoticed: those labels are one short word, the exact case the borrowed markup
was designed for.

**Two checks now cover it**, both reading the browser's own geometry rather than this phase's CSS:
one asserts no label overflows its tile in *any* configurable entry's picker, the other asserts the
trunk's picker still computes to 78×78 `nowrap`. Proven to fail: against a build with the fix
reverted, the first drops the suite to **50/51** and names all fifteen.

*Nothing in the existing suite could have caught this — every other check reads values, and this
was geometry. That is the lesson worth keeping: a harness that only asks "is the number right?"
cannot see a feature that is unusable.*

## Not tested here

- **No real device.** This is a cloud session; it cannot open the sheet in a browser a person is
  holding. Every number above is Playwright/Chromium. This project's own history says that gap is
  where the bugs live — the first real-device test found two in an afternoon, and Phases 3, 4, 8
  and 9 each had real-device findings after their automated suites were green.
- **The picker's look on a phone.** The modal reuses the universal-spell picker's markup and
  classes, so it inherits whatever that already does at 390px, but this phase added a note line
  (`.adv-config-modal-note`) and a per-entry row that nobody has seen on hardware. The per-entry row
  wraps (`flex-wrap`), which is the thing to look at first.
- **Whether "Needs a choice" reads as urgent enough** next to an entry a player has just added, or
  whether it should be louder. That is a judgement call best made looking at it.
- **How the three roll effects read in the preview and the post-roll bar.** They are asserted at
  the pipeline level — the modifier list and the folded pool — but nobody has watched a Fire Ring
  Roll go `3k3 → 4k4` on a phone with the row rendered beside it. The Free Raise line is the one
  to look at hardest: it is the only modifier on the sheet that deliberately shows a **name with
  no number**, and whether that reads as "you have something to use" or as "something is broken"
  is exactly the kind of question an automated check cannot answer.
