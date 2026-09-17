# PART I — Phase 4.5.11: Seven Fortunes' Curse (D04a)

Point release on Phase 4.5. **D04, first half**: five of the seven Fortune curses behind the one
`Seven Fortunes’ Curse` catalogue row, plus honest records for the two that are deferred.

This is a cheap release on purpose. Feature 4.5.10 paid for the machinery; every one of the five
reuses a shape that already exists, and this phase adds no new mechanism of its own.

| Fortune | What it does | Whose shape it reuses |
|---|---|---|
| **Benten** | Etiquette TN +10, reported as −10 to the total | Tengoku's (the TN-reporting convention, built in 4.5.9) |
| **Fukurokujin** | Lore TN +5, *including specializations*, reported as −5 | the same |
| **Daikoku** | −1k1 on Commerce, plus a starting-koku reminder | Chikushudo's named-Skill dice penalty |
| **Ebisu** | −1k1 when the player declares a non-samurai interaction | Maigo no Musha's per-roll declaration |
| **Jurojin** | −2k0 when the player declares resisting poison or disease | the same |
| Bishamon | recorded at 3 XP, not automated — deferred to D04b | Jigoku's honest-note shape |
| Hotei | recorded at **6 XP**, not automated — deferred to D04b | the same |

Award is **3 XP**, or **6 for Hotei** — the sourcebook's own exception, and the single thing about
D04 the audit flagged as most likely to be got wrong.

---

## What was measured before any of it was written

Seven measurements. Three changed the design, one overturned what this phase was scoped to build,
and one was found by a check written expecting to pass.

**1. The authoritative Social Skill list already existed.** The audit asks Ebisu to "use the
authoritative Social Skill list", and the sourcebook PDFs are desktop-only — so this looked
source-gated exactly the way Jigoku's resistance roll was in 4.5.10, and the phase was scoped
assuming Ebisu would have to be gated on the declaration alone. Measured instead of assumed:
**Feature 4.5.2 already ships one**, supplied by the project owner, frozen at 209.85 and exposed as
`D45.socialSkills` — Acting, Courtier, Etiquette, Perform, Sincerity, Intimidation, Temptation.
Antisocial has scoped its penalty on it since 4.5.2. Ebisu reads *that* list, so the two entries
cannot disagree about what a Social Skill Roll is, and Ebisu ended up **twice** gated rather than
once. Worth the ten minutes it took to check: the thing that looked blocked was already built.

**2. Skill names are free text, so Fukurokujin matches a prefix.** The skill row's name is an
`<input type="text">` and reaches the roll context verbatim — a context built for
`Lore: Shadowlands` carries exactly that string. The School library alone already spells **23**
distinct `Lore: <subject>` specializations. A hand-written list would be wrong the first time a
player invents a 24th, so the rule is the one the audit states: the Lore Skill *including* its
specializations. `LORE_RE` is anchored at both ends of the stem so `Folklore` cannot match —
`F4511-FUKU-03` exists only to hold that line, and an unanchored regex passes every other Lore
check in the suite.

**3. A damage context carries the attack's `skillName`.** Re-measured rather than trusted. It
cannot bite here, because `D45.modifiers()` returns `[]` for `ROLL_KINDS.DAMAGE` *before* consulting
`D45.modules` — the same inherited protection 4.5.10 relies on. Proven anyway; see below.

**4. Daikoku cannot debit money, and the precedent was already set.** The audit asks for the School
starting-outfit koku to drop by one "with ownership/transaction safeguards; no repeated debit on
recalc/load and no unexplained subtraction of money already spent in play." Measured: the sheet's
only money is `#f_koku`, a live player-edited number holding **current** koku, and the School's
starting koku exists solely as free text inside each School row's `outfit:` string
(`"…, Traveling Pack, 3 koku"`). There is no starting-koku state to debit and no way to make a
debit idempotent across load and recalc. Feature 4.5.6 hit the mirror image with Wealthy and
resolved it identically — it grants no koku, so "the repeated-grant lifecycle cannot arise."
Daikoku therefore **reminds and writes nothing**. Its dice half is fully automated; only the money
half is a note. `F4511-DAIKOKU-04/05` assert the property the audit actually asked to be safe:
koku is untouched across repeated recalcs and after the player types a value.

**5. Bishamon and Hotei are deferred, and still pickable.** Both are flagged by the audit as
needing review before implementation — Bishamon must reduce only the applicable Strength
*contribution* to weapon damage (bows, flat damage and unarmed all checked separately), and Hotei
must classify which activations cost two Void, check affordability before committing, and charge
exactly once. Neither is a line of code. Omitting them would make a seven-Fortune entry look broken
and leave a real character unable to record their own curse, so they are offered, priced correctly,
and carry a row note saying the sheet does not act on them yet. That is Jigoku's shape from 4.5.10,
for the same reason: name the gap on the row rather than hide it.

**6. The preview still has no generic declaration registry, and this phase does not build one.**
4.5.10's fragment records that a fourth consumer "should trigger the conversation about
generalising it rather than a third copy", and this phase brings two. Generalising means rewriting
the declaration handling inside Phase 3's (Part G) own fragment — modifying a previous phase from
inside a feature release — and it would make 4.5.10 depend on a registry *this* phase owns, so
removing this phase would break that one. Instead the duplication is **capped**: this phase adds one
set of four blocks that handles a *list* internally, so both Ebisu and Jurojin ride it and D04b
adds none. The generalisation is recorded in ROLLBACK.md as work for its own refactor phase.

**7. This is the first D45 entry whose name carries a curly apostrophe, and it mattered.**
Found by `F4511-CAT-07`, written expecting to pass. `D45.schema()` matches on its own `norm()`,
which only trims and lowercases — so `Seven Fortunes' Curse` typed with a *straight* quote did not
resolve, and `.en-name` is a free-text input, so that is a real thing a player can do. Every earlier
`D45.install()` name (`Phobia`, `Doubt`, `Cursed by the Realm`…) is plain ASCII, which is why the
gap had never been met. Phase 4.5's own separate lookup has folded apostrophes since it was built —
its comment says an entry must not silently fail to be configurable over a quote character — so the
standard already existed; D45 just never needed it. Two consequences, both fixed inside this
fragment: the entry installs under **both** spellings, and `api.active()` filters on this phase's
own `cursedFortune` flag rather than on a name comparison the straight spelling would fail.
Widening D45's own `norm()` is the better long-term answer and is declared in ROLLBACK.md.

---

## Verification

| Run | Result |
|---|---|
| Own suite, this phase present | **74/74** |
| Combined suite (every retained suite + this one) | **902/902** |
| Own suite, kill-switch off | **33/71** — 38 checks go red |
| Own suite, stylesheet dropped | **70/74** — all four geometry checks go red |
| Surgical removal rebuild | **2,617,077 bytes, `812ac85e…`** — byte-identical to the 4.5.10 build |
| Every other phase's suite, this phase removed | **828/828** |
| `qa/test-removal.py` | **14/14** |
| `qa/feature-dependencies.py` | exit 0 — every reference owned by this phase |

### Every check that encodes a decision was proven able to fail

Isolated reverts in scratch copies, one at a time, each dropping the suite to 73/74 on exactly the
intended check:

| Revert | Check that went red |
|---|---|
| Unanchor `LORE_RE` to `/lore/i` | `F4511-FUKU-03` — `Folklore` started matching |
| Drop Ebisu's Social-list gate in the modifier | `F4511-EBISU-05` — declared on a non-Social Skill applied |
| Restore the name-based `active()` filter | `F4511-CAT-08` — straight-apostrophe entry stopped applying |

**The damage checks needed two rounds, and the second round is the interesting one.** Removing
*both* damage guards (4.5.2's inherited early return and this fragment's belt-and-braces line) made
only `F4511-DAMAGE-03` go red. `-01` and `-02` stayed green because Benten and Daikoku are *also*
gated on `skillish`, which excludes damage independently — so those two checks are protected three
ways and could not fail as written. Widening `skillish` to include damage as well finally turned all
three red. Recorded because it is the honest reading: `DAMAGE-01/02` are regression sentinels over
three layers, not single-point failure tests, and only `DAMAGE-03` (Jurojin, deliberately not
`skillish`-gated, because a resistance roll can be any kind) rests on the exclusion alone.

`F4511-GEOM-03` is the same shape and is flagged for the same reason: two of its three assertions
(full width, flush left) hold even with the stylesheet dropped, because the base sheet supplies
them. Only `flex-basis` is load-bearing. The check goes red for the right reason; it just claims
less than it appears to.

### What the headless harness cannot see

Nothing in this release has been confirmed on a real device. The two 4.5.10 corrections that came
back from the iPhone were both geometry, and this phase adds three new pieces of geometry (the
badge, the row note, the stacked declaration blocks). The declaration blocks in particular can now
appear **two at a time** in one preview, which no previous release produced and which no
measurement here can tell you reads well on a 375px screen.

---

## Rolling back

See `ROLLBACK.md`. Primary method is `qa/remove-phase.py` against a copy of the Phase 0 tree.

> **Read ROLLBACK.md's "The live-tree guard" section before running any Part I remover.** The
> guard in every earlier one is decorative — it computes a path that cannot exist and therefore
> never refuses. This release's remover fixes it; the others have not been touched.
