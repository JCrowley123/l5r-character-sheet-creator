# Phase 4.5.5 — Eligibility Gates + Great Potential Skill Validation

The two items left open on the Phase 4.5 audit after 4.5.4 shipped: finding 4 (Friendly Kami
selectable by a non-Shugenja) and finding 5 (Great Potential's Skill field). Copy shortening stays
parked on the project owner's call.

**Both audit descriptions were overstated, and both were re-measured before anything was built.**
That is now three phases running where the report and the code disagreed, so the check is no
longer optional.

| Reported | Measured | Outcome |
|---|---|---|
| "Friendly Kami can still be selected by a non-Shugenja" | **True, and worse than stated.** The option is not disabled, and its configuration modal opens in full on a character with **no School at all**. 4.5.3 fixed the effect; nothing ever gated the pick. | Fixed |
| "Great Potential's Skill field … renders a plain text input with no connection to the character's Skill list" | **Half right.** 209.81 already backs it with a `<datalist>` of all 44 `SKILL_LIBRARY` names. The real defects are that the list is the master catalogue rather than *this* character's Skills, and that the field accepts **anything**: `Underwater Basket Weaving` was typed, confirmed, and saved as a configured Skill without complaint. | Fixed — see the same-day revision below |
| "Shorten bulky Disadvantage copy" | Measured in 4.5.4: worst entry 197 characters against Magic Resistance's 151, four entries over. | **Parked**, unchanged |

## The design question the audit said to settle first

The audit flagged finding 4 as *"a genuine design question bigger than one entry … flag for a
decision before building either way."* It was right to, because the sheet already had **four**
different answers to "how do I tell you this will not work?":

| Pattern | Where | Behaviour |
|---|---|---|
| Disabled control + hint | `btnAddSchoolToggle` (070) | Button greyed, `title` and a visible hint say why |
| Disabled option card | Elemental Imbalance's `elementPick` (209.85) | The deficient Ring is rendered but `.d45-disabled` |
| Hard refusal | Elemental Imbalance's entry gate (209.85:234) | `appAlert()`, modal never opens |
| Allow, then explain | Friendly Kami (209.89, Feature 4.53) | Pick succeeds, effect resolves to nothing, row says why |

And in the quick-add `<select>` itself — the list the feedback was actually about — **nothing was
ever disabled**. The project owner chose: *disable in the picker, as the standard for every gated
entry*, applied to Friendly Kami and Elemental Imbalance alike rather than making one an
exception.

## What was built

### The gate

An ineligible entry stays in the quick-add list, greyed and unselectable, with the reason appended
to its own label — `Friendly Kami (5 pts) — Shugenja only`. That label is the whole affordance: a
disabled `<option>` on an iOS select wheel gets no hover, no tooltip and no styling hook worth
using, so the reason has to be *in the text* or it does not exist on a phone.

Three things are deliberate:

- **The verdict is not this phase's.** Where Feature 4.53 already knows an entry, `R455.ineligible()`
  asks *it* whether the character qualifies and supplies only the wording. The picker and the row
  are two presentations of one decision, so they cannot drift into saying opposite things.
  `GATES455-VERDICT-01/02` assert exactly that. With 4.53 removed, the local `needs` check is the
  fallback and the gate keeps working.
- **It rides the recalc cycle.** `buildAdvDisadvQuickAdd` runs **once**, at load, but eligibility
  depends on School, which the player enters later. A build-time flag would have been correct on a
  fresh sheet and wrong forever after. `GATES455-SCHOOL-03` is the check for that specifically —
  gated, open, gated again, all on one build of the picker.
- **The original label is cached before the suffix is appended**, so running every recalc cannot
  stack ` — Shugenja only` five deep. `GATES455-IDEMPOTENT-01` runs five recalcs and asserts the
  exact string.

### Great Potential's Skill field

**Revised the same day, on real-device feedback.** The first cut kept the text field and only
re-ordered the `<datalist>` behind it. That was measured, and the measurement was sound as far as
it went — but it answered the wrong question. The project owner tested it and said plainly that
they expected *a list of their Skills with a tick box, one selectable*, which is a different
control, not a better-sorted version of the same one.

Why the first cut reasoned itself into a text field is worth recording, because the fact behind it
is real and still shapes the design: **applying a School does not populate `#skillsBody` for every
School.** An Isawa Shugenja reports `shugenja: true` and five `schoolSkills` with its Skills table
still empty. From that, the first cut concluded a list would be empty for most characters mid-build
and kept the text box. The error was generalising from one School without driving the actual Apply
School flow — a Hida Bushi applied properly appends all six of its granted Skills as rows. So the
list is populated in the normal case, and the empty case is a brand-new character, which the
revision handles by falling back to exactly the old text field.

- **A single-select list of the Skills you actually have**, School-granted ones first and badged
  `School`, then anything you bought or typed yourself. For a fully-applied Hida Bushi that is
  exactly Athletics, Defense, Heavy Weapons, Intimidation, Kenjutsu, Lore: Shadowlands — the six
  the School grants — plus the Bugei Skill from its free-choice slot the moment you add it.
- **An `Another Skill…` card last.** Great Potential names no School restriction in the rules, and
  a Skill can legitimately be chosen before it is bought, so the typed field stays reachable rather
  than being removed. Choosing it reveals the validated input; everything else keeps it hidden.
- **No Skills on the sheet yet → the typed field alone**, exactly as before. A brand-new character
  has nothing to tick, and an empty list would be worse than a text box.
- **The cards drive the same input the commit path already reads.** Ticking one writes
  `#advConfigFreeText`, which 209.81 commits from and this phase's own validator checks. That is
  what keeps the change additive: no second source of truth, and no edit to the commit path.
- **Unknown names are still refused**, using the same `setStatus` + `return true` contract 209.81
  uses for its own validation steps. `Underwater Basket Weaving` no longer commits.
- **Homebrew still works.** A Skill you typed into your own Skills table appears as a card like any
  other — `GATES455-HOMEBREW-02/03` prove it both leads the list and is accepted.
- **A one-line hint** explains the thing that actually costs a player points: Great Potential raises
  the cap using the Skill's *Rank*, so choosing a Skill you have not taken does nothing.

The `<datalist>` behind the typed field is still re-ordered the same way, since that field is what
`Another Skill…` reveals.

### The free-choice slot, and why it is not in the list automatically

Hida Bushi's skills read `Athletics, Defense, Heavy Weapons (Tetsubo), Intimidation, Kenjutsu,
Lore: Shadowlands, any one Bugei Skill`. Apply School **deliberately skips** the `any one` token
(`skippedChoices++` in `080-identity-build-ui.js`) because it is a player choice, not a concrete
grant — measured, a fresh Hida Bushi gets six rows, not seven. So the seventh reaches this list
only once the player adds it themselves, which is the correct behaviour and is what
`GATES455-BONUS-01/02/03` pin down.

Validation is keyed on **209.81's own modal state**, not on the presence of `#advConfigSkillOptions`
in the DOM. That datalist survives in the grid after the modal closes, so a DOM check would have
reported "on the Skill step" long after the step was over. `#advConfigFreeText` is shared with
`languagePick`, where any string is legitimately valid — `GATES455-SCOPE-01/02` guard that.

## Validation

```bash
node qa/current-suite-runner.js <path-to-l5r-character-sheet.html>
```

| Suite | Result |
|---|---:|
| Feature 4.55 eligibility gates | **41/41** |
| Every retained suite plus Feature 4.54 | **571/571** |
| **Combined** | **612/612** |

### The harness was made to fail — twice, because this phase has two halves

| Build | Result | What failed |
|---|---:|---|
| Kill-switch `false` (JS half off) | **16/37** | Every gate, label, verdict, skill-priority, picker, hint and validation check. It reproduces the original defects exactly, including `Underwater Basket Weaving` committing as a configured Skill and the skill list reverting to alphabetical. |
| `59-adv-eligibility.css` dropped from the manifest | **39/41** | Exactly the two measured checks — `GATES455-SKILL-06` (hint at 16px against the input's 16px instead of 12px) and `GATES455-CARDS-09` (the picker collapsing to 205px inside a 291px modal instead of filling it). Those two are what make this phase's stylesheet load-bearing rather than decorative. |

`CARDS-09` earned its place the hard way: its first cut compared each card against the *list*
width, which holds at any size, so it passed against the stylesheet-dropped build. Rewritten to
compare the list against the space available to it, it fails there for the right reason. A check
that cannot go red is not a check — the same rule that caught Part H Phase 1.

`GATES455-SCHOOL-01/02` pass in the kill-switch build, correctly: they assert the *eligible* state,
which an absent gate also produces. The disabled direction is covered by `GATE-01`, `GATE-04`,
`SCHOOL-03`, `IDEMPOTENT-01` and `VERDICT-01`, all of which go red.

### A harness bug worth recording, because it looked like a product bug

The first cut drove eligibility by writing to `#f_school`. The value **snapped back** to the
previous School on the next recalc, and Friendly Kami stayed enabled — which reads exactly like a
latched-state bug in the phase under test. It is not. `#f_school` is a **display field**,
re-rendered from `getSchoolsList()`, which is what `characterCasterLock()` actually reads. The gate
was correct the whole time; the harness was driving a control that does not hold state. Recorded in
the harness itself so the next phase does not spend the same half hour.

### Structural invariants

Unchanged against the removed build: **270 element ids, 0 duplicated**, 10 sections, both test
seams present, 26 roll-modal overlays, 3 scripts, 2 stylesheets. This phase adds no markup — every
node it creates is made at runtime and disappears with the fragment.

### The ownership scan

Clean first time: *every reference is inside a block PART I FEATURE 4.55 owns*. Both comments that
name another release are written as "Feature 4.53" and "Phase 4.5.2", never in marker order — the
rule CLAUDE.md added after that trap was hit three times.

## Removal proof

`qa/remove-phase.py` deletes both files, both manifest entries, and only the block its own
`BEGIN`/`END` delimiters enclose, then repoints `expect_sha256`.

| | |
|---|---|
| Live build (this release present) | **2,533,897 bytes**, `0538c4662e19ba633a3faefb8d1111f1b502f557e7f7b935c7fb53ae6570ab7f` |
| Removed build | **2,515,953 bytes**, `da0db0946afa356df26e9ea79cfb82f87a669d479247ec1ca230e9bb17be7b13` |

Byte-identical to the Feature 4.54 build this release was added to, first attempt. Every retained
suite then reads **571/571** against the removed build.

`qa/test-removal.py` passes **16/16**. Its sibling-survival fixture was rewritten for this release
rather than inherited: `PART I FEATURE 4.5` is a prefix of **three** markers now, and 4.54's
`ux-seam` sits directly above this phase's block in the seam file. The fixture was proven
load-bearing by weakening `BEGIN_RE` to a prefix match and confirming the remover then mangles
4.54's block.

## What this release does NOT claim

- **Not real-device confirmed.** Verified headlessly at 375px only. Given that 4.5.4 needed two
  real-device rounds, the gate and the Skill field are both worth a look on the phone — especially
  the disabled `<option>`, whose rendering on an iOS select wheel this sandbox cannot show.
- **Elemental Imbalance's hard `appAlert` is untouched.** The picker now prevents the bad *add*,
  which is the path the feedback was about, but 209.85's own entry gate still refuses to open the
  modal for an existing row on a non-Shugenja character. The realistic way to reach that state is
  importing a saved character; it is not reachable through the controls this phase tested, since a
  School cannot be un-applied through `#f_school`. **Left as a known residual inconsistency**, not
  silently absorbed: fixing it means changing behaviour inside a function Feature 4.5.2 owns, which
  is a larger change than this phase was scoped for.
- **No copy shortening.** Still parked on the project owner's call.
- **The gate covers two entries.** Any future eligibility-gated entry has to be added to
  `R455.RULES` — nothing derives the rule from an entry's description text, and
  `GATES455-CONTRACT-02` asserts the list is exactly those two so a silent third cannot creep in.
