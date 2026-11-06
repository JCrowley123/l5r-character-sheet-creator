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
