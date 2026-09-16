# Phase 4.5.3 — Configuration Repairs

Eleven confirmed defects in already-shipped Phase 4.5 code, found by the 13 September 2026
configuration audit and fixed here. This release adds **no new catalogue entry and no new
configuration type**. Every line in it exists to make something that already shipped behave the
way its own description already claimed.

It is deliberately the safe half of the remaining Phase 4.5 work: each item had a known-correct
answer before any code was written, none of it needed sourcebook material this environment
cannot reach, and none of it needed a design decision from the project owner.

## The twelfth finding is parked, not fixed

**Lord Moon's Curse** is the audit's other confirmed gap and it is **not** repaired here. Its
severity tier is configured and correct; what is missing is the full-moon bonus Void Point and
the rank-scaled Willpower TN. The sheet does not state that TN map anywhere, and inventing it
would be inventing rules content — Process Requirement #3. It stays on the backlog with its
status changed from *confirmed defect* to *parked, pending source material*.

## What was repaired

Each was re-verified against this tree before it was written; none was taken on the audit's word.

### Wrong prices being charged

| # | Defect | Evidence | Repair |
|---|---|---|---|
| 1 | **Elemental Blessing** never applied its Phoenix price. `cost:4`, description says "Phoenix pay 3", and the schema returned no cost at all — only `severityTier` entries ever returned one. | `020-lib-skills-advantages.js:152`, `209.8-feat-adv-config.js:109` | The resolver now returns the entry's authoritative cost: 3 for Phoenix, 4 otherwise. |
| 2 | **Friend of the Elements** never applied its Shugenja price. Identical shape. | `020:158`, `209.8:133` | 3 for a Shugenja, 4 otherwise. Shugenja-ness comes from the sheet's own `characterCasterLock()`, not a second copy of that rule. |

Both prices follow the character rather than freezing at purchase: changing Clan reprices an
already-added Elemental Blessing, which is asserted directly (`R453-PRICE-LIVE`).

### Wrong catalogue data

All three were source-verified during the audit against the project owner's own books; the
page references are carried in the fragment's correction table so the provenance travels with
the code.

| # | Defect | Source | Repair |
|---|---|---|---|
| 5 | **Perceived Honor** cost 3 XP per rank | Core Rulebook printed p.152 lists 2 points/rank | Priced at 2. Ten ranks is 20 XP, not 30. |
| 6 | **Wealthy** described its discount as "1 less **per rank**" | Core Rulebook printed p.155: one reduction off the **total** | Description corrected. Five ranks cost 4 XP for an eligible character, not 0. |
| 7 | **Unlucky** said the GM's forced reroll keeps "the worse result" | Core Rulebook printed p.162: the second roll is kept in all cases | Description corrected. This is the only one of the three that changes what happens at the table rather than what something costs. |

**These correct the LIBRARY, not saved characters.** A row a player already added carries the
cost they agreed at the table, and silently repricing a saved character is a data mutation this
release has no business making. An old saved row will disagree with the Advantage list until the
player re-adds it. That is intended, and it is the difference the audit draws between
byte-identical *code* removal and safe *character-data* effects.

### Effects that did not fire where they should

| # | Defect | Evidence | Repair |
|---|---|---|---|
| 3 | **Friendly Kami**'s "Shugenja only" was documented in its own description and in 209.8's comment, and enforced by nothing. It resolved with no School selected at all. | `209.8:140` | The effect resolves to nothing for a non-Shugenja, and the row **says why** rather than going silently inert. |
| 4 | **Great Potential** was gated on `ROLL_KINDS.SKILL`, so Kenjutsu rolled as a Skill got the raise-limit reminder and the same Kenjutsu rolled as an **attack** did not — though an attack is exactly where a Raise limit gets spent. | `209.81:518` | Attack contexts now get the same reminder, asserted to report the **same cap** as the Skill path so two reminders can never disagree. |

### Structural weaknesses the next release would have inherited

| # | Defect | Repair |
|---|---|---|
| 9 | `advConfigIsComplete` accepted any truthy value. Luck read `'1x'` as rank 1; Allies read `'1x'`/`'2x'` as 1 and 2. | Strict whole-integer parsing and enum membership, scoped to the **original Advantage types only** — Phase 4.5.2 already validates its own shapes, and two validators disagreeing about the same data would be worse than the gap. |
| 10 | An unrecognised config was deleted with no warning, including one belonging to a module this build merely lacks. | A config whose **type** no schema in this build declares is now kept and visibly flagged. The rename case 209.8 deliberately designed still drops its pick, and that is asserted separately (`R453-UNKNOWN-03`). |
| 11 | `activeAdvConfigEffects` scanned both lists and resolved every entry by name, so a Disadvantage sitting in the Advantage list had its effect applied while its cost counted the other way. | The catalogue itself is the oracle for which side a name belongs to. A name in **neither** library is a custom entry and is left entirely alone. |
| 12 | 209.8's header still claimed `skillPick` was unbuilt and that Great Potential and Doubt had no roll consequence. | Corrected by an added, delimited block rather than a rewrite — see below. |

## Why it is a wrapper and not a set of edits

Three of these defects are wrong values in the libraries and the rest are wrong behaviour in
209.8/209.81. Correcting either **in place** would rewrite existing lines, and a rewritten line
cannot be taken back out by deleting a marked block — the removal would delete the original
along with the fix.

So this release is purely **additive**, exactly as Phase 4.5 itself was. It corrects the library
rows at load time from a table it owns, and it rebinds the handful of functions it repairs,
keeping each previous binding and delegating to it. That is also why the stale header comment is
*annotated* rather than edited: the correction sits in its own `BEGIN`/`END` block directly
beneath the stale sentences, so the file returns to its exact original bytes when the block goes.

The fragment is ordered **last** among the 4.5 fragments in the manifest, so "the previous
binding" means Phase 4.5.2's — this composes with that release rather than replacing it.

## Validation

Run from this folder:

```bash
node qa/current-suite-runner.js <path-to-l5r-character-sheet.html>
```

That delegates to Phase 4.5.2's runner **unchanged** and adds this release's suite, reporting one
combined total.

| Suite | Result |
|---|---:|
| Feature 4.53 repairs | **39/39** |
| Every retained suite (13 of them, via 4.5.2's runner) | **504/504** |
| **Combined** | **543/543** |

### The harness was made to fail before it was trusted

Per CLAUDE.md's standing rule. Against a scratch build with this release's kill-switch set to
`false`, the suite reads **18/39**, and every one of the 21 failures is one of the eleven defects
reappearing — Friendly Kami handing the bonus to a non-Shugenja, Luck reading `'1x'` as rank 1,
Allies reading `'1x'`/`'2x'` as 1 and 2, the wrong-list effect counted, the unknown config
deleted, both prices stuck at 4. That run is itself a direct demonstration of each original
defect.

**Two checks pass in both builds and are honest about it.** `R453-VALID-01` and `R453-VALID-03`
(a nonexistent Ring, an unoffered severity label) hold with the kill-switch off too, because the
resolver already had a second guard of its own for those two original types via `RINGS.find` and
`options.find`. They are regression guards, not proofs. The load-bearing validation cases are
`R453-VALID-05` and `-07`, which do fail without this release.

### Structural invariants

Measured on the live build and on the removed build, and identical on both: **270 element ids,
0 duplicated**, 10 sections, 26 `.roll-modal-overlay` blocks, both test seams present, tag
balance clean. This release adds no markup and no CSS at all — the two row notices reuse the
classes 209.8 already ships for its own "Needs a choice" state.

## Removal proof

`qa/remove-phase.py` deletes the fragment, its manifest entry, and only the blocks its own
`BEGIN`/`END` delimiters enclose. It refuses the live Phase 0 tree, a foreign phase's marker
found inside one of its blocks, an unclosed block, a mismatched delimiter, an orphan `END`, and a
manifest that does not carry exactly one matching entry — all before writing a single byte. It
reads and writes with newline translation off in both directions, because this repository is
configured `core.autocrlf false` precisely so line endings round-trip.

`qa/test-removal.py` passes **14/14** fixture checks, including four refusal cases and a
CRLF round-trip.

On a fresh disposable copy, removing this release and rebuilding produced the recorded
pre-release artifact exactly:

| | |
|---|---|
| Live build (this release present) | **2,495,934 bytes**, `18a740e8aeb334dac6a0405ec98c79edc6a450d5a09c8b7cfd715273f7b7b8c0` |
| Removed build | **2,476,062 bytes**, `27b57eff316ee6f34f528e055a8d8adda6bb0d60ed7a951519ec12af35122ff2` |

That second hash is **byte-identical** to the pre-release build recorded in the audit and the
ledger. Every retained harness then reads **identically** against the removed build: 51/51,
48/48, 163/163, 35/35, 50/50, 22/22, 9/9, 23/23, 19/19, 25/25, 36/36, 17/17, 6/6.

### It took two attempts, and the first one is worth recording

The first removal rebuilt **one byte heavy** — 2,476,063 against 2,476,062. The cause was a
blank line: the seam block had been inserted with a blank line on *both* sides of it, so deleting
the block left the original blank line and the added one adjacent, and the rebuild carried a
double blank where the original had one. Nothing about the insertion looked wrong, the harness
was green, and the ownership scan was clean. Only the byte comparison caught it. This is the
same failure mode as Phase 8's two-byte discrepancy, and it is the argument for requiring a
byte-identical rebuild rather than a "looks right" diff.

### Ownership scan

```bash
python3 qa/feature-dependencies.py src/sheet/209.89-feat-adv-config-repairs.js \
  "PART I FEATURE 4.53" --also adv-config-unknown adv-config-ineligible
```

Exit 0: *every reference is inside a block PART I FEATURE 4.53 owns*. The only references
outside the fragment are the two in its own seam block in `210-test-seam-and-init.js`, both
attributed correctly.

## One fixture correction in a previous phase's harness

Phase 4.5's own harness configured Friendly Kami on a character with **no School at all** and
asserted the bonus applied. Since the entry is Shugenja-only, that character was never entitled
to it — the fixture was testing the bonus arithmetic on an ineligible sheet, which is part of why
nothing ever caught that the requirement was unenforced.

The fixture now applies a Shugenja School. The assertions themselves are unchanged, and the
suite reads **51/51 both with this release present and with it removed** — verified in both
directions, which is the property that matters. The exact edit is listed in `ROLLBACK.md` so it
can be reverted independently.

This is the same precedent Phase 1.5 set when Phase 4.5 took the registry's seventh seat: a
previous phase's check is adjusted so that it reads correctly in both builds, rather than the new
work being bent around a fixture that was wrong to begin with.

## What this release does NOT claim

- **No real-device testing.** Headless Chromium only. This project's own history says that gap
  is where the bugs live.
- **No sourcebook conformance audit.** The three catalogue corrections are the three passages the
  audit checked. Nothing else in the catalogue was re-verified against the books.
- **No saved-character migration.** As above: the libraries are corrected, existing rows are not.
- **No UX work.** The narrow-screen card overflow, the circled-i tooltip affordance, the "XP
  refund" wording and the added-entry ordering are all still outstanding. Two new row notices
  ship here and both reuse existing classes, but they have not been checked at phone width.
