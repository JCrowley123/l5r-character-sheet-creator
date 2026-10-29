# Release 7c.1 — code review findings (29 October 2026)

One read-only review (Helper 1) of `main..release-7c1`, after the two layers passed their own checks and every pinned variant matched, and before the full suite. No defects.

| # | Checked | Outcome |
|---|---|---|
| 1 | QC7: can Cancel still roll or spend? | No defect: Cancel is a fresh button (EQ7's listener goes with the replaced one) and closes the picker, so EQ7 returns false and the attack ends before any arrow step or roll. |
| 2 | QC7: is EQ7's button there when the wrapper returns? | No defect: everything in `EQ7.before` up to its first await runs before it returns, and the call site reads `EQ7.before` when it calls it. |
| 3 | QC7: could another picker be decorated? | No defect: it acts only when EQ7's empty-quiver button exists; the picker body is emptied on every close; the other `promptArrowSelection` caller does not pass through it. |
| 4 | MR7: could a redraw bring back the old label? | No defect: LM7 calls `decorate` through its own object, and nothing else writes the button. |
| 5 | Switches; removers and registry | No defect: each switch off installs nothing; surfaces clean, including the base64 fragments; the restore points match the order MR7 then QC7. |
| L1 | EQ-ONCE cannot fail while QC7 is on (the pass is never set) | Recorded: the path is unreachable with QC7 on, and `qa/eq7-variants-qc-off.py` covers it with QC7 off (6 of 6). |
| L2 | No variant pinned the likeliest real defect: EQ7's roll-on button or its listener surviving | Two variants pinned before their run: old-kept (the old button left beside Cancel; QC-EMPTY-PICKER) and cancel-rolls-on (Cancel firing the old listener; QC-CANCEL-ENDS). |
| L3 | EQ7's own `verify-variants.py` fails three pins on the 7c.1 candidate with QC7 on | Recorded in the layer's README: no suite runner calls it; with QC7 off all six match. |
| L4 | Four unused helpers copied into `moon-label-harness.js` | Left as they are: they change no check. |

The two older harnesses edited (Empty Quiver Rolls On, 3 checks; Moon Curse Full Moon, 2 checks) only switch their expected values while QC7 or MR7 reports itself on; no check was dropped or loosened. Both pass on the candidate and on 7c's build, and both pass at 4× CPU.
