# Advantage Set Rules

**Status, 29 October 2026:** built for Release 7b.2 on branch `claude/release-7b2-2026-10-29`; not merged. The release's QA folder is `QA — Release 7b.2 2026-10-29`.

Your ruling R23 (desk review, 23 October 2026), with your answers of 29 October (Q1: one Fortune may not both bless and curse a character; Q2: only Core's four families). Core p.148, in our own words in `READING — Cycle 7b.2 and 7c 2026-10-29/NOTES.md`.

- **One of each set.** Paragon, Failure of Bushido, Dark Paragon, Consumed, Seven Fortunes’ Blessing, Seven Fortunes’ Curse, Touch of the Spirit Realms and Cursed by the Realm: a second row of any is greyed, "one only (Core p.148)".
- **What rules out what.** Paragon rules out Dark Paragon and Failure of Bushido; Consumed rules out Failure of Bushido and Dark Paragon; Touch of the Spirit Realms rules out Cursed by the Realm. Each way round, greyed "ruled out by Paragon (Core p.148)".
- **The Fortunes.** A Blessing and a Curse may be held together. The same Fortune may not: that Fortune is greyed in the other's choice, "ruled out by Benten’s Blessing (Core p.148)", and refused at Confirm if forced.
- **Where it shows.** Greyed in the Advantage and Disadvantage lists; the wizard's lists copy them. A held pair (an old save, or a name typed by hand) is flagged on both rows and never changed or removed. The validator gives one warning.
- **GM overrides.** Under the lists, closed, in Management only: one tick per rule, for this character. A ticked rule greys nothing, and its rows show a quiet "GM override" note instead of the flag. Saved with the character; an older save loads with none.

## How it is built

A UI-agnostic logic part and a replaceable UI part, behind one switch: `SET_RULES_ENABLED = true` in the first fragment.

- `src/sheet/209.99999999999993-bugfix-set-rules-logic.js`: `SR7Logic`, the sets and rules as data, rows in as `{name, choice}`.
- `src/sheet/209.99999999999994-bugfix-set-rules-ui.js`: `SR7`, the pickers, the choice dialog, the row flags, the overrides, the validator rule.
- `src/css/59.9999999983-bugfix-set-rules.css`.
- The saved overrides: the hidden field `f_setRuleOverrides` (rule ids as JSON; empty for none). No save-format step: a sheet without this layer ignores the field.
- Test seam: the `set-rules-seam` block in `src/sheet/210-test-seam-and-init.js`. The Fortune Blessing module's deferred note gains the `fortune-note` block pointing here.

## Checks

- `qa/set-rules-harness.js`: 50/50 on the candidate, again at 4× CPU. Every exclusion both ways, a second row of each set, the Fortunes' exemption and the same-Fortune choice both ways, an old save holding a pair (flagged, unchanged), the override on and off, saved, not carried to the next character, and locked in Play, the wizard, and the real controls.
- Pinned negative variants (`qa/variants.json`, written before the first run; `qa/verify-variants.py`, results in `qa/negative/`): main (baseline) and disabled fail exactly 38 pinned checks; one-way 9; no-exemption 9; overrides-ignored 6; leak 1; no-guard 1; no-modal 2; no-typed 1.
- First-run corrections, recorded: SR-OVERRIDE-ON expected the override to free a second Dark Paragon; it rightly frees only its own pair, so the check now pins "one only". SR-TYPED-PAIR found a real gap: a name typed by hand was not flagged until the next recalculation; the UI now recalculates when a set name is committed (variant no-typed). The baseline variant's first attempt found a harness leak (the Play check left Play on when it threw on main); it now restores Management (`qa/negative-first-run/`).
- The code review (`QA — Release 7b.2 2026-10-29/REVIEW-FINDINGS.md`), each finding reproduced first with a check pinned before its run: SR-NORM-COST reproduced the cost (names normalised for every pair of rows and every rule on each recalculation); only rows of a set are now paired and each name is looked up once. SR-RENAMED-AWAY did not reproduce the stale lists (the trunk's recalculation already refreshes them, through 4.5.28's hook) and stays as a guard. SR-REOPEN-SAVED covers the saved choice's exemption (variant no-saved-exemption). The new variant then found that a Disadvantage row's Change button opens its dialog without the greying; SR-CHANGE-GREYS reproduced it and both openers now share one wrapper. Now 50/50; main fails exactly 41 pinned checks, disabled 40, one-way 11, no-exemption 10, no-modal 3, no-saved-exemption 1 (the disabled pin for SR-NORM-COST corrected: its logic runs with the switch off).
- Removal (`qa/test-removal.py`): 6/6. Later layers come off first through the removal-chain registry; this layer's remover then rebuilds main exactly: `649a0008b84eda58ee0b0c84a12d942b4e1d7add2c35789c53879bd505b8f294`, 17,385,712 bytes.
