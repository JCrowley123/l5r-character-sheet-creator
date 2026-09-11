# Part G, Phase 4 — "Explain This Roll"

Every roll now says where its pool came from, not just what was added to it — `7k3` becomes
*Water Ring 3, rolled and kept* plus *School Rank 4 (base 3, +1 Affinity)*, in the preview
before you roll and in the result after.

**Status: built and verified. 22/22 automated checks pass — dropping to 6/22 with the phase's
own kill-switch disabled and to 20/22 against a build with Phase 3 removed, in both cases
failing exactly the checks that describe what was taken away.** Phase 3's harness reads 35/35
both with this phase present and with it deleted, which is the evidence that neither phase
depends on the other to be correct.

## The audit found the opposite of what Phase 3's did

Phase 3's audit found most of its scope already built. This one found the headline feature
genuinely missing, and mis-scoped in the roadmap as "mostly wiring."

The roadmap lists seven factors to break down: *base dice, Trait contribution, Skill
contribution, School bonuses, Affinity/deficiency, Void spending, conditional modifiers.* The
last two were already visible — the pipeline itemises every registered contributor in
`adj.applied`, and Phase 3 renders them. **The first five were not visible anywhere**, and
could not be, because by the time `rollWithModifiers()` sees a pool it is two bare integers:

```js
// rollSkill(), before this phase
let numDice, keepDice;
if(rank<=0){ numDice = traitVal; keepDice = traitVal; }
else { numDice = traitVal + rank; keepDice = traitVal; }
rollWithModifiers(name, makeRollContext(ROLL_KINDS.SKILL, {…}), numDice, keepDice);
```

`traitVal` and `rank` were right there, one line up, and were discarded after the addition.
Every caller had the same shape. A Casting Roll was the worst of them: `ring + schoolRank`
where `schoolRank` had already been through `effectiveSchoolRankForSpell()`, so a Water
Affinity silently added a die that nothing in the sheet would ever mention again.

So the wiring the roadmap anticipated (point the trunk's post-roll bar at Phase 3's shared
renderer) was real but small. The actual phase is making the base pool self-describing.

## Callers declare; this phase never recomputes

The one design decision that matters here, and it was taken deliberately over the easier
alternative.

A helper could have read the sheet and reconstructed each kind's composition — no caller
changes at all. That is a **second implementation of the base-pool arithmetic**, free to drift
from the real one. A breakdown that disagrees with the roll it describes is worse than no
breakdown, and this project has already chosen the other way once: Phase 3 renders the
pipeline's own numbers rather than computing its own, for exactly this reason.

So each caller declares the parts it already had — **numbers only, no strings** — and
`buildRollBasePoolRows()` shapes them:

| Roll kind | Declared by | What the rows say |
|---|---|---|
| Skill | `rollSkill()` | `Agility 3` → `3k3`, `Kenjutsu Rank 2` → `+2k0` |
| Skill, unskilled | `rollSkill()` / the Unskilled Roll modal | `Agility 3` → `3k3`, then `Unskilled — the Trait rolls and keeps alone` |
| Attack | `performWeaponAttack()` | as Skill; `getWeaponAttackDice()` already returned `traitName`/`traitValue` and they were being dropped |
| Ring / Trait | the Rings & Traits tab | `Earth Ring 2` → `2k2 — rolled and kept` |
| Spell Casting | `performSpellCastRoll()` | `Water Ring 3` → `3k3`, `School Rank 4` → `+4k0 — base 3, +1 Affinity` |
| Maho | the maho flow | as Spell, but the row is labelled `Insight Rank` for a bushi maho-tsukai |
| Initiative | the Initiative button | `Reflexes 3` → `3k3`, `Insight Rank 2` → `+2k0` |
| Manual | `rollNotation()` | `Entered by hand: 5k3` — no composition claimed |

**What is not declared is not claimed.** A context with nothing on it produces **no rows at
all** rather than a guess (check 9). Damage rolls never enter this pipeline and are untouched.

### Affinity does not get a row of its own

It would double-count. A Water Affinity raised the School Rank from 3 to 4; the School Rank row
already counts all four dice. So Affinity annotates that row — `+4k0 — base 3, +1 Affinity` —
rather than adding a fifth die that does not exist. Check 11 asserts the annotation and check 6
asserts the sum still reconciles, so the two cannot quietly disagree.

### And when the parts do not add up, it says so

If a caller's declared numbers do not reconcile with the pool the pipeline was actually handed,
the phase does not print a decomposition that disagrees with the roll. It prints one row —
`Base pool: 2k2 — the parts on record do not reconcile, so they are not shown` — and stops.
That is check 10, and it is the guard that makes the whole feature safe to extend: a future
caller that declares the wrong thing produces an honest non-answer, not a confident wrong one.

## The gap in the post-roll bar

`attachRollModifierBreakdown()` opened with:

```js
if(!adj || !adj.applied || !adj.applied.length) return null;
```

No modifiers, no bar. Which meant the most ordinary roll on the sheet — a plain skill roll with
nothing modifying it — was the one roll that could not be explained at all. It now renders
whenever there is either a base breakdown or a modifier, and the bar carries two labelled
groups: **Pool**, then **Roll modifiers**. Check 13 is that specific case.

## The dependency, taken deliberately

The roadmap flagged this and it went the way it suggested. `attachRollModifierBreakdown()` had
kept a **verbatim copy** of Phase 3's `buildRollModifierRows()` — thirteen identical lines,
maintained in two places. The trunk now calls the shared one when it is present, and falls back
to its own copy when it is not.

That fallback is why this is a **soft** dependency: removing Phase 3 degrades the bar to its
pre-Phase-3 rendering rather than breaking it (measured: the Phase 4 harness reads 20/22 against
that build, failing only the two checks that compare against a preview which no longer exists).
Both directions are declared in both phases' `ROLLBACK.md`, per `CLAUDE.md`.

Phase 3's fragment also gained one guarded block of its own: where the preview printed this
phase's one-line prose summary (`poolBasisText()`), it now prefers these rows when Phase 4 is
present, because they cover more roll kinds and say more. Delete this phase and the prose line
comes back — which is precisely what the Phase-4-removed harness run confirms.

## A bug this phase's own review caught

The base rows were first rendered as `<div class="rp-mods rp-base">` — reusing the modifier
list's class for its layout. Phase 3's harness immediately dropped to 31/35: *"an unmodified
roll lists no modifiers — got=2 want=0"*. It was right, and not merely about a selector. In the
DOM, "Agility 3" had become a member of the modifier list. Anything reading that list — the
harness, a future phase, a screen reader — would have been told the Trait was a modifier.

Fixed by giving the group its own container and its own row class (`.rp-base` / `.rp-baserow`),
sharing only the row *layout* with `.rp-mod` through a grouped CSS selector. Phase 3 returned to
35/35 without its assertion being weakened.

## Fixed after the first real-device pass

Two things came back from testing the shipped phase on a phone. Neither changed what the
breakdown says — both are about how it reads and what it exposed.

**The two groups collided into one line.** The bar is a single wrapping flex row, so the second
group's title landed inline after the first group's last item: `Athletics Rank 1: +1k0 | Roll
modifiers`, with the divider stranded mid-row. Looked fine on a desktop screenshot, which is
exactly why it survived to the phone. `Roll modifiers` now takes `flex-basis:100%` so it claims a
line of its own with a rule above it, and its items wrap beneath. Guarded by `:not(:first-child)`,
so a bar with only one group renders as it always did.

**The group is called "Base pool", not "Pool".** These rows describe the pool *before* any
modifier, and a modifier can leave one of them no longer true of the roll that actually
happens — an `Unskilled` row sitting above a Void spend that lifted the Unskilled penalty is the
visible case. Three fixes were considered; naming the group for the starting state won because
it is one word, it fixes the general case rather than that one instance, and neither group has
to know anything about the other. Marking superseded rows was the alternative and was rejected
on exactly that ground: it would have coupled this phase to Part C Feature 4's Void system and
Phase 3's offer list. It also matches the `base 4k3` already shown beside the final pool, so
"base" means the same thing throughout this UI.

**It exposed a wrong comment about Universal spells.** Printing `School Rank 2: +2k0 — base 1,
+1 Affinity` on a *Commune* — a Universal spell — surfaced a comment in `050-kiho-rules.js`
claiming *"Affinity/Deficiency never applies"* to those spells. The comment was wrong; the code
was right. Casting a Universal spell makes the player pick a real Element and spend that
Element's slot, and from there it is a casting in that Element: the picker gates on the chosen
Element's effective rank (which is how a Deficiency can put an Element out of reach entirely) and
the Casting Roll uses the same rank, Affinity included. Confirmed by the project owner as the
intended reading — *"you still have to pick an element, so why not pick one you have an advantage
in"*. Only the comment changed.

Worth recording how that one went, because it is a caution about this phase's own output: I first
read the three call sites as contradicting each other and called it a bug. They don't — they ask
three different questions (*is this spell available at all* / *which Elements may I pick* / *what
do I roll*) and each answer is defensible. A more visible breakdown makes previously invisible
arithmetic arguable, and the first instinct on seeing something surprising in it should be to work
out which question is being answered before concluding the answer is wrong.

## The shape of the change

| File | What changed |
|---|---|
| `src/sheet/209-feat-roll-breakdown.js` | **New.** The kill-switch, `buildRollBasePoolRows()`, and the reconciliation guard |
| `src/sheet/130-round-and-pipeline.js` | `attachRollModifierBreakdown()` takes the context and base pool, renders two groups, calls Phase 3's shared renderer with a fallback, and no longer bails when there are no modifiers |
| `src/sheet/100-dice-engine.js` | `rollSkill()` and `performWeaponAttack()` declare their Trait value (the attack's was already computed and discarded) |
| `src/sheet/110-modals-trackers.js` | The Unskilled Roll, both Casting Roll flows and Initiative declare their parts; the Casting Roll also reads `f_rank` for the pre-Affinity School Rank |
| `src/sheet/080-identity-build-ui.js` | Ring and Trait rolls declare their Rank |
| `src/sheet/180-feat-stances.js` | The Full Defense declaration declares its Trait and Rank |
| `src/sheet/208-feat-roll-preview.js` | One guarded block: prefer these rows over the prose summary when this phase is present |
| `src/css/10-sheet-base.css` | `.rp-base`/`.rp-baserow`, and a rule separating the two groups in the post-roll bar (given its own line after the real-device pass above) |
| `src/sheet/050-kiho-rules.js` | Comment only — corrected the untrue claim that Affinity never applies to Universal spells. No behaviour change |
| `build/manifest.json` | The new fragment, and the rebuilt hash |

**Nothing about the arithmetic of a roll moved.** The declared keys are inert data on a context
object: no contributor reads them, and the pipeline's own numbers are unchanged — which is what
the pipeline baseline staying at 34/34 asserts.

## Verification

Run from the Phase 0 folder:

```bash
NODE_PATH=$(npm root -g) node \
  "../../Part G — Combat & Roll Engine/PART G — Phase 4 Explain This Roll/qa/roll-breakdown-harness.js" \
  l5r-character-sheet.html
```

**The oracle is the pool the pipeline was given, not the rows.** Every base-pool check parses
the `XkY` out of the rendered rows, sums them independently in the harness, and compares that
against the base pool the roll was actually made with. A row that says the wrong thing fails
even if it says it consistently. Asking `buildRollBasePoolRows()` what it thought and comparing
that against what it painted would pass forever and prove nothing.

| Build | Result |
|---|---|
| This phase as shipped | **22/22** |
| `ROLL_BREAKDOWN_ENABLED = false` | **6/22** — every base-pool row disappears; no page errors, the sheet is simply back to modifiers-only |
| Phase 3 removed, this phase kept | **20/22** — only the two checks comparing against the preview fail; the trunk's fallback still itemises the modifier |
| This phase's fragment deleted | the harness stops at 0/1 (it needs the function it tests) — the real evidence is the row below |

Nothing else moved:

| Suite | Before | After | With this phase's fragment deleted |
|---|---|---|---|
| Phase 1.5 roll-pipeline baseline | 34/34 | **34/34** | 34/34 |
| Phase 3 Smart Roll Preview | 35/35 | **35/35** | **35/35** |
| Phase 1 UI/UX foundations | 9/9 | **9/9** | 9/9 |
| Phase 2 Quick-Access Sidebar | 19/19 | **19/19** | 19/19 |
| Phase 9 Clan-themed look | 17/17 | **17/17** | 17/17 |
| Full behavioural sweep (14 flows) | clean | **0 page errors, no diff vs baseline** | — |
| `qa/inventory.py` | — | 258 IDs, 0 duplicates, 10 sections, 24 overlays — all unchanged | — |
| `feature-dependencies.py` for this phase | — | clean: every reference sits in a block this phase owns | — |
| `build.py --check-drift` | — | identical | — |

**Phase 3 reading 35/35 in the last column is the load-bearing number.** It is the measured
proof that this phase is removable without touching Phase 3 — the thing `CLAUDE.md` requires
and the thing a dependency between two phases most easily breaks.

### What check 19 does and does not prove

*"Both match Phase 3's shared renderer asked directly"* proves the trunk's bar and the shared
renderer **agree**. It does not prove the trunk *calls* it — a verbatim copy would agree too.
The call site itself is established by `feature-dependencies.py` and by the Phase-3-removed run,
where the fallback path is the one exercised. Worth stating plainly rather than letting the
check imply more than it shows.
