# Removing A01 (Release 15a)

A01 is one independently removable unit. Its marker is `PART H PHASE 15.1.1`, its tag `RR15`, its switch `REVIEW_ONE_REMINDER_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.9999999999999995-feat-review-one-reminder.js` (`RR15Logic`, `RR15`, the switch) |
| Fragment | `src/css/1127-review-reminders.css` (`.rr15-reminder`) |
| Manifest | the two entries naming those files |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `review-reminder-seam` (guarded `Object.assign`) |
| Registry | the last `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py` |
| Fixtures | conditional expectations in four older checks (below) |

It adds no save field and changes no character data, so removing it cannot affect a saved character.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. Run `python -B qa/remove-phase.py <scratch copy>` from this folder. It refuses the live tree, a foreign marker inside its block and a missing block. It strips the two fragments, their manifest entries and the seam block, and nothing else.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly Release 8c: 17,525,378 bytes, SHA-256 `139e081092d4899d66563a362073ff594a4b6d00ac452fe0789328c8884a2551`. When later Phase 15 units are present, remove A01 alone: no later unit may depend on it (see below), and its own remover touches nothing outside its marker.

Switching it off instead: set `REVIEW_ONE_REMINDER_ENABLED = false`. Review is then exactly as before, box and all; the negative variant `disabled` proves it.

## Dependencies

- **Reads, does not change:** Phase 11.2's `CW112` (`steps`, `findings()`, `appliedSchool()`, `render()`) and Phase 11.2.2's `CW1122.allOpen()` and its `#cw1122Still` box. These are soft dependencies: A01 installs only when both exist, so removing either wizard layer first leaves A01 as a no-op (it must still come off before those layers' own removers, which strip later releases first through the chain).
- **Matches, does not call:** the wording of the character check's School-choice cards ("<School>: … Still to choose: a; b, c."), today written by Release 8b (`SC8.findings`). If that wording changes, an item simply stops counting as a duplicate and shows as its own card: nothing is lost.
- **Nothing depends on A01.** No later unit may call `RR15`/`RR15Logic` or read `.rr15-reminder` without declaring it here first.

## Cross-phase fixture corrections (declared)

Four older checks read the "Still to choose" box at Review. Each now reads the box lines **plus** A01's remaining reminder cards, and expects A01's result only while `REVIEW_ONE_REMINDER_ENABLED` is true; without A01 the extra term is empty and the original expectation applies unchanged. Counts are unchanged.

| Harness | Check |
|---|---|
| Phase 11.2.2 `wizard3-harness.js` | `CW2-REVIEW-LISTS-OPEN`, `CW2-REVIEW-LISTS-KIHO` |
| Phase 11.2.3 `wizard4-harness.js` | `CW3-REVIEW-LISTS-OPEN` |
| Phase 11.2.4 `wizard5-harness.js` | `CW5-REVIEW-LISTS-OPEN` |

Removing A01 does not require reverting them.
