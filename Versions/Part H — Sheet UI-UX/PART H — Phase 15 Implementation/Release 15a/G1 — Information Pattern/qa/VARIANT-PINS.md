# G1 negative-variant pins: predicted, observed, corrected

**What a variant is:** the frozen group build (`2dcf6f20…6af6`) with one change, run through that unit's own harness. Each unit's baseline is Release 15a A03 as live (`e73b7c0c…de06`), which has no G1 unit at all. In `variants.json`, every variant was pinned before it first ran, from what the mutation should break. The pins were committed before the first run, in `3260632c`.

**First pins:** 21 mutations and 4 baselines:

| Unit | Mutations | Baseline |
|---|---|---|
| A04 | 6 | 1 |
| A15 | 7 | 1 |
| A16 | 3 | 1 |
| A03.1 | 5 | 1 |

## Discovery 1

Every case ran once, with no assertion. Output is in `variants-discover.log`, with logs in `variants-discover-2dcf6f20/`.

**18 of the 25 cases matched their pins exactly.** All seven A15 cases matched. Four differences were investigated:

1. **`IP-MODAL-NOT-NESTED` passed on A04's baseline, on `disabled` and on `no-unnest`.**
   - **Cause:** the configuration window the harness opens (Wealthy) has no button carrying an i on any build, so nothing is nested there to begin with.
   - **What this means:** the check guards against nesting in the window but cannot tell A04 apart from no A04 today.
   - **Action:** the pin was corrected from this observation. The check is unchanged.
2. **`IP-CLASS-GATES` passed on A04's `disabled`.**
   - **Cause:** a harness side effect. `IP-COMBAT-UNCHANGED` removes A04's body class and then adds it back, so on a build that never set the class it **added** one. The A04 stylesheet is still present on that build, so every later check saw A04 switched on.
   - **Fix:** both checks that touch the class now put it back only if it was there.
3. **`row-i-removed-too` (A16) broke nothing at the moment the harness looks.**
   - **Cause:** widening the sweep to every Blessing i removes the row's i only when the window's grid next changes, which is after the check has already read it. A weak mutation.
   - **Action:** replaced, before discovery 2, by `note-hidden-too`. It also hides the window's note, so it breaks exactly the "nothing else in the window changes" property, pinned as the 14 `NOTE-SHOWN` checks.
4. **`SM-DEBUG-UNCHANGED` failed on A03.1's baseline and `disabled`.**
   - **Cause:** a cascade. On those builds the earlier A03.1 checks throw before closing the Skill window, and the open window then blocked the Debug check's tap.
   - **Fix:** the harness now closes any Skill window left open before opening the next one.

**About the harness changes:** neither changes a check, an expected value or a timeout. The candidate still passes 35/35 (A04) and 19/19 (A03.1). The fixes and corrected pins were committed before discovery 2, in `b5203628`.

## Discovery 2

This run covered only the changed cases: all A04 and A03.1 cases (their harnesses changed) and A16's new variant. Output is in `variants-discover-2.log`, with logs in `variants-discover-2dcf6f20-2/`.

**All 14 cases matched their pins exactly.** With discovery 1's 11 untouched matches, that makes all 25 cases.

- A04's baseline and `disabled` now fail the same 27 checks.
- A03.1's baseline and `disabled` fail the same 15.
- `note-hidden-too` fails exactly the 14 `NOTE-SHOWN` checks.
- Every variant fails at least one check.

The qualification chain's `variants-final` run then asserts every pin exactly.
