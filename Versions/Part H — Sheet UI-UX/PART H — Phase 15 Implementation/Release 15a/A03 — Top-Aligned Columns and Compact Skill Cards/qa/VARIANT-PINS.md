# Negative-variant pins: what was predicted and what was corrected

The pins in `variants.json` were written before any variant ran, from what each mutation should break.
- **First pins:** 11 variants and the baseline, when the harness had 31 checks.
- **After the code review:** the harness gained `EMPHASIS-WARNING-SHOWN` (32 checks). Three variants were added and pinned before running: `no-observer`, `no-input-listener` and `no-warning`. The baseline and `disabled` pins gained the new check, and `no-grid` gained `FIRST-CELL-ADDITIONS`.

**Discovery** (`variants-discover.log`, frozen candidate `eb1c29f7…8d18`, every variant run once, no assertion; logs in `variants-discover-eb1c29f7/`):
- 13 of the 15 cases matched their pins exactly.
- The baseline (A02 as live) and the switched-off build fail the same 29 checks.

Two cases failed more than predicted, and none less:
- **`no-grid` also failed `PHONE-END-CLEAR`.** With the card laid out as a block, the open last card at the very end of the page leaves its name and eye where a tap does not reach them. That is a real end-of-page failure of the mutated build.
- **`eye-in-first-row` also failed `NO-SCRIPT-ERRORS` and `PRINT-UNCHANGED`.** The eye then sits under the d10, so the real tap on it in `PLAY-ROLL-AND-INFO` times out and the phone scenario stops. The scenario's later print check never runs, and the stop counts as a script error. A check that never ran is a FAIL, so this is the expected shape of a stopped scenario.

**Corrected after the discovery, from the observed failures:**
- `no-grid`: one pin added.
- `eye-in-first-row`: two pins added.

No check, expected value or timeout in the harness changed for these corrections. Every variant still fails at least one check. The qualification chain's `variants-final` run then asserts every pin exactly.

## Revision 2 (6 November 2026)

**Written before any variant ran:**
- With the harness at 35 checks: 19 mutations and the baseline.
- After the review the harness gained `FIRST-ROW-STEADY` and `SUMMARY-READABLE` (37 checks). Then, still before any run:
  - the variant `school-caption-wide` was added;
  - the baseline and `disabled` pins gained both new checks;
  - `no-grid` gained `FIRST-ROW-STEADY`;
  - `text-in-row` gained `SUMMARY-READABLE`;
  - `no-grid`'s prediction dropped `PHONE-END-CLEAR`. That failure in revision 1 was incidental and depended on how far the open last card ran off the screen.

Since revision 2 the harness wraps each check, so an exception fails only that check and the scenario goes on. A stopped scenario no longer fails every check after it.

**Discovery 1** (`variants-discover-r2-1.log`, logs in `variants-discover-e73b7c0c-1/`; frozen candidate `e73b7c0c…de06`, harness as committed in `064094a3`, every case run once, no assertion): 18 of 21 cases matched their pins exactly. Three failed more than predicted, and none fewer:
- **`no-grid` also failed `PHONE-END-CLEAR`.** With the card laid out as a block, the last Manage card is taller than the room at the end of the page, so its name field cannot be tapped there. That is a real end-of-page failure of the mutated build, as in revision 1. **The pin was put back from this observed failure.**
- **The baseline and `disabled` also failed `MANAGE-EDITS-WORK`.** On those two builds (no A03), the A03-only checks before it stop part-way, because they find no summary line. `EMPHASIS-WARNING-SHOWN` stopped after typing Athletics down to Rank 1, over its Emphasis limit, and never put it back. Two things followed, both investigated with scratch probes:
  1. **The Rank typing was unreliable.** The harness typed Ranks by tapping, pressing Ctrl+A and typing. In Chromium's touch emulation, Ctrl+A straight after a tap did not always select the number field's text, so "7" typed over "5" became "75". Insight then rose to Rank 6, and Release 8's rank-spell offer ("Kuni Shugenja — Rank 4 spells") opened over the page and caught the later taps. A probe reproduced the same Ctrl+A failure on the candidate, although no harness run of the candidate ever hit it.
  2. **On A02's layout, a Trait field stopped taking typing.** While Athletics stayed over its limit, typing into another Skill's Trait did not take there. It did take from a fresh load, and it did take on A03's layout. The field was focused, editable and not covered, and its key presses arrived uncancelled, but the browser raised no edit for them. The exact cause was not found. It is recorded as an observation of Chromium's touch emulation, not verified on a device.

**Harness changes, made before any qualification stage** (no assertion, expected value or timeout changed):
- The typing helper no longer relies on Ctrl+A. It moves to the end of the field, deletes what is there, types, and confirms that the field holds exactly the typed value before leaving it. If it does not, the check fails and names the field.
- `EMPHASIS-WARNING-SHOWN` puts Athletics' Rank back in a `finally`, so no later check starts with a Skill over its limit.

With these, the baseline fails exactly its 28 predicted checks, and the candidate passes 37/37. The baseline and `disabled` pins stay as predicted.

**Discovery 2** (`variants-discover-r2-2.log`, logs in `variants-discover-e73b7c0c/`; same candidate, corrected harness): **all 21 cases matched their pins exactly.** The baseline and `disabled` fail the same 28 checks. Every variant fails at least one check. The qualification chain's `variants-final` run then asserts every pin exactly.
