# Part I, Phase 4.5 — Modal-Configured Advantages/Disadvantages

Some Advantages are not one thing. *Elemental Blessing* is "choose a non-Void Ring"; *Lord Moon's
Curse* is 3, 5 or 7 points with a different severity at each price. Until this phase the sheet had
nowhere to record which one you took, and no way to act on it — an entry was a name, a number the
player typed, and free text.

Now those entries carry a **pick**, stored with the character, and the pick changes the arithmetic
the sheet already did: a blessed Ring's two Traits each cost 1 XP less per Rank bought, and a
severity tier sets the entry's own cost.

**Status: built and verified. 34/34 automated checks pass — dropping to 17/34 with the phase's own
kill-switch off, and to 0/1 with its fragment surgically removed.** The removal rebuilds
**byte-identical** to the pre-phase build, and all ten other harnesses read identically with this
phase present and removed.

---

## The half that is deliberately not built

This is the most important thing in this README, because it is a scope decision rather than an
omission, and it needs the project owner's ruling before it can be closed.

The roadmap specifies the resolver as returning *"a cost delta **and/or a roll-modifier hook**"*.
Several configurable entries are roll effects, not cost effects — *Chosen by the Oracles* ("choose
a Ring; +1k1 on all Ring Rolls using it") is the clean example. **None of them is wired into the
roll pipeline, and none of them could be without breaking a previous phase's recorded baseline.**

A roll effect belongs in `PREROLL_MODIFIER_REGISTRY` (`130-round-and-pipeline.js`), the sheet's one
documented way to adjust a pool — "each later feature registers its own contributor and never edits
this pipeline". But Phase 1.5 (Part G) baselined that registry and asserts its exact contents:

```js
check('registry holds exactly the six documented contributors, in priority order',
  … registry.length === 6 …
```

and its own source comment names this phase, by number, as one that must not disturb it:

> `//    phases (3, 4, 4.5, 6) must not change how these combine.`

Registering a seventh contributor takes Phase 1.5 from **34/34 to 33/34**. The only repair is
editing a previous phase's recorded baseline, which `CLAUDE.md`'s working style forbids ("Do not
modify previous phases or layers").

So this phase ships the **cost** half, which needs no such permission, and stops there. Three
things are worth saying plainly about that:

- **It is not a small remainder.** By entry count the roll-effect entries are roughly as numerous
  as the cost ones. What is built is the whole mechanism — schema, resolver, picker, persistence,
  flagging — exercised by two effect types; adding a third is data plus one registration.
- **Unblocking it is a decision, not a task.** Someone has to agree that Phase 1.5's baseline may
  be updated from 6 contributors to 7, and that its README's recorded number changes with it. That
  is cheap to do and completely reasonable — Phase 1.5 is an audit phase whose job is to *notice*
  pipeline changes, not to forbid them — but it is the project owner's call, not something to take
  silently while building something else.
- **`skillPick` and `traitPick` are parked for a different reason.** The roadmap names all four
  configTypes; the entries that would use those two (*Great Potential*, *Doubt*) have no cost
  consequence, so building them now would add a picker that records a value nothing reads. The
  entry's own description field already serves that purpose. The two types built here are the two
  that do something.

---

## What is configurable, and why only seven entries

The schema is a name-keyed table **inside this phase's own fragment**, not new fields on
`ADV_LIBRARY`'s rows. The roadmap's Engineering Scope reads as the latter; it was built the other
way for removability. Adding `config:{…}` to seven library rows means seven edited lines inside the
trunk's data, each of which a removal has to find and revert exactly. Keeping the table here means
`ADV_LIBRARY` is not touched at all — **this phase deletes to nothing**.

**Every number in it is quoted from the library entry's own description string.** That is the whole
inclusion test, and it is why the table is seven entries rather than thirty:

| Entry | Type | The library's own words | Options |
|---|---|---|---|
| Elemental Blessing | `ringPick` | "Choose a non-Void Ring; increasing either of its Traits costs 1 XP less" | Air / Earth / Fire / Water |
| Lord Moon's Curse | `severityTier` | "3/5/7 points" | Low 3 · Medium 5 · High 7 |
| Luck | `severityTier` | "3/6/9 points per rank" | Rank 1/2/3 → 3 · 6 · 9 |
| Magic Resistance | `severityTier` | "2/4/6 points per rank" | Rank 1/2/3 → 2 · 4 · 6 |
| Antisocial | `severityTier` | "2 points for -1k0, 4 points for -1k1" | −1k0 2 · −1k1 4 |
| Enlightened Madness | `severityTier` | "4 or 6 points … (TN 20 or 30)" | TN 20 4 · TN 30 6 |
| Cast Out | `severityTier` | "1 point for a single temple's disapproval, 3 for a major Brotherhood sect" | One temple 1 · Major sect 3 |

Entries whose own text gives a **range** rather than named prices — *Compulsion* "2-4 points",
*Consumed* "4-6", *Dependant* "roughly 2-6", *Gentry* "8-30" — are **not** included. Turning those
into tiers means inventing the steps in between, which Process Requirement #3 forbids. They keep
the free-text cost field they have always had.

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

**Every one of those is an addition.** This phase rewrote no existing line in any shared file —
`git diff` shows **zero deleted lines** across all seven. That is what makes the removal
byte-identical rather than merely equivalent.

---

## Verification

Run from the Phase 0 folder:

```bash
NODE_PATH=$(npm root -g) node \
  "../../PART I — Phase 4.5 Modal-Configured Advantages-Disadvantages/qa/adv-config-harness.js" \
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
| This phase as shipped | **34/34** |
| `ADV_CONFIG_ENABLED = false` | **17/34** — no picker, no flag, no discount; no page errors, the sheet is simply as it was |
| **Bug:** the discount ignores which Ring was blessed | **32/34** — caught by the both-Traits-and-no-other check and by the stale-discount check |
| **Bug:** the discount counts every Rank, not only bought ones | **29/34** — caught by 5 checks, including the independent-cost-rule one |
| This phase's fragment surgically removed | the harness stops at **0/1** (it needs the function it tests) — the real evidence is the table below |

The first run against the kill-switch build **crashed** rather than reporting a number, because the
helpers reached for a button that no longer existed. That is a harness defect by this project's own
standard — a harness that dies proves nothing about what it was measuring — so the DOM reaches now
return a reason instead of throwing, and that build reports 17/34.

### Nothing else moved

| Suite | Live build | With this phase removed |
|---|---|---|
| Phase 1.5 roll-pipeline baseline | 34/34 | 34/34 |
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
