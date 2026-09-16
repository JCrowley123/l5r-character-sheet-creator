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
| "Great Potential's Skill field … renders a plain text input with no connection to the character's Skill list" | **Half right.** 209.81 already backs it with a `<datalist>` of all 44 `SKILL_LIBRARY` names. The real defects are that the list is the master catalogue rather than *this* character's Skills, and that the field accepts **anything**: `Underwater Basket Weaving` was typed, confirmed, and saved as a configured Skill without complaint. | Fixed |
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

**The constraint that shaped this half:** applying a School does **not** populate `#skillsBody`.
Measured — an Isawa Shugenja character reports `shugenja: true` and five `schoolSkills`, and its
Skills table is still empty. So a strict "your Skills only" dropdown would be **empty** for most
characters mid-build, which is why the field keeps its text input and re-orders the list behind it
instead of becoming a `<select>`.

- **Order is the mechanism.** Own Skill rows first, then the School's Skills, then the rest of the
  catalogue. A `<datalist>` has no grouping a phone will render, so position is the only signal
  available.
- **Unknown names are refused**, using the same `setStatus` + `return true` contract 209.81 already
  uses for its own validation steps. `Underwater Basket Weaving` no longer commits.
- **Homebrew still works.** A Skill the player typed into their own Skills table counts as known —
  `api.skills()` has always included custom rows, and `GATES455-HOMEBREW-02/03` prove such a row
  both leads the list and is accepted.
- **A one-line hint** explains the thing that actually costs a player points: Great Potential raises
  the cap using the Skill's *Rank*, so choosing a Skill you have not taken does nothing.

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
| Feature 4.55 eligibility gates | **29/29** |
| Every retained suite plus Feature 4.54 | **571/571** |
| **Combined** | **600/600** |

### The harness was made to fail — twice, because this phase has two halves

| Build | Result | What failed |
|---|---:|---|
| Kill-switch `false` (JS half off) | **15/29** | Every gate, label, verdict, skill-priority, hint and validation check. It reproduces the original defects exactly, including `Underwater Basket Weaving` committing as a configured Skill and the skill list reverting to alphabetical. |
| `59-adv-eligibility.css` dropped from the manifest | **28/29** | Exactly `GATES455-SKILL-06`, measuring the hint at 16px against the input's 16px instead of 12px — the check that makes this phase's stylesheet load-bearing rather than decorative. |

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
| Live build (this release present) | **2,527,259 bytes**, `ea47d75b8eead07aaaa13766b75c631490e1ec690dd23dbf6d45a126c2f6c893` |
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
