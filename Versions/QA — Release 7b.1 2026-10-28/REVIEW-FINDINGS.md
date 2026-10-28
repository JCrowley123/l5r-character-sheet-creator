# Release 7b.1 — the code review (28 October 2026)

One read-only reviewer, once, after the eight layers passed their own checks and before the full suite. Five findings, all
real. Each was reproduced by a check pinned before the fix (it failed on the unfixed build), then fixed; the checks pass
on the fixed build. No check was loosened.

| # | Layer | Finding | Check pinned first | Fix |
|---|---|---|---|---|
| 1 | R7 Void Raise | Touch of the Void (a Disadvantage here) and Daredevil add their own extra die to the Void Point's +1k1 through another seat, so on Initiative the +1k1 was still offered and the extra still applied | VR-TOUCH-INIT, VR-TOUCH-PREVIEW (VR-TOUCH-SKILL the control) | Their extra leaves Initiative with the +1k1 |
| 2 | R14 Skill List | The wizard rebuilds its Skill lists straight after a row changes, before the picker's redraw, so a Skill just added was still offered (and adding it again silently did nothing), and a removed one did not come back | SL-WIZARD-FRESH, SL-WIZARD-RETURN | The picker redraws before the wizard reads it |
| 3 | R10 Hotei | Status lines and the Kakita and Sun Tao buttons still said "a Void Point" when two were taken | HT-STATUS (HT-STATUS-PLAIN the control), HT-BUTTON | The status line straight after a doubled spend, and those buttons, say two |
| 4 | R15 Gender | After Gender stopped matching, Begin training stayed enabled (worked out before the box was unticked) | GI-BUTTON | The button is worked out again after the boxes are painted |
| 5 | R16 Pointer | The pointer did not update when Honor, Family or Gender changed, which change the Advanced Schools on offer without a recalculation | AP-HONOR-INPUT | The pointer listens to those fields, as the panel does |

Each fix has its own pinned negative variant: touch-kept, stale-wizard, status-single, button-stale, no-honor-listen. Two
earlier Hotei variants were re-pinned to the fixed code (paragon-single; ancestor-single, which now also breaks HT-STATUS).

Two setup slips in my own new checks were corrected before any fix ran, expectations unchanged: the Hotei checks first
used the default Void Ring (Void Points cannot exceed it) and Honor 2.0 (5 points is 0.5 of a Rank); the Touch of the Void
checks first put it on the Advantages list.

## Two older checks follow the rulings

Both adapt to the layer being present, as the Dark Paragon harness does for Social Rank and Points, so main keeps its old
expectation and the retained run is unchanged:

- Part G Phase 3's roll-preview harness: Initiative offers no +1k1 while R7's layer is on (it offered `k1` before).
- Phase 4.8's Ancestors harness: a second roll with Kuni's gift already used shows it as used and cannot tick it while
  R25's layer is on (before, the tick was taken and the payment step refused it).

## What the reviewer confirmed

R25's refusal holds in the real preview; Ancestor favour states all valid; R10 never takes one point of two; every wrapped
method is called through the property that was wrapped; wrappers return the original result when their condition is
false; R24's wording matches the preview's tick.
