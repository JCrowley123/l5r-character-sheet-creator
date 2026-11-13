# Automatic-entries group negative-variant pins — prepared before any run

13 November 2026 (Claude). Frozen candidate `99b76d625c04e6aa22ba8508005975525bbece945b82ead8c443b593e58115b8`, 17,675,311 bytes (AE1, AE2 revision 2, AE3 revision 1: the whole group), on `claude/release-15a-ae3` at `1de70d3b`. Baseline for each unit: G4 as live, commit `60a5262a`, application `fa634abbf96a0f47b8668245c13f0d33142c931438bc1c9d8c22c624ce4e00cb`, 17,648,272 bytes. Every exact failed-check id is in `variants.json`.

**What is known and what is reasoned.** AE1's baseline count is known: its harness gave 5/13 on G4 as live during the light checks (AE1's README); the eight ids are reasoned from the harness and agree with the README's list. AE2's and AE3's harnesses were run during the light checks on the unit before them (AE1, AE2), not on G4 as live, so their baselines are reasoned here. **Every other prediction is reasoned from each harness's oracles and the source, not taken from a variant run.**

10 mutations (switch off, AE3's own stylesheet removed, two focused defects per unit) plus 3 baselines. Each mutation changes exactly one unique string in a scratch copy of the frozen page; the removed stylesheet is read from its own fragment file. The discovery runs once; any correction is explained here before the qualification chain. No full-suite discovery, retries or widened assertions.

## One addition to G4's checker: a pinned stop

AE2's harness waits for its note outside any check, right after it opens the listed character (`waitForFunction(... givenSpellsNote)`). On a build without the unit, or with it switched off, no note is ever written, so the harness stops there after Playwright's 30-second wait. Its catch then prints only `0/21 checks passed`: no PASS or FAIL lines, and the checks that had already failed show only as `detail` lines. G4's checker, which compares FAIL lines, cannot pin that. So `verify-variants.py` accepts one more form of pin, written before any run: the stop's error text (`page.waitForFunction: Timeout`), the count (0 of 21), exit 1, no result lines, and the exact set of checks that failed before the stop. Every other pin is G4's exact list of FAIL lines with a complete count.

| Case | Predicted failures |
|---|---:|
| AE1:baseline (count known) | 8 |
| AE1:disabled | 8 |
| AE1:no-sense | 6 |
| AE1:no-line | 2 |
| AE2:baseline (stops) | 7 before the stop; 0/21 |
| AE2:disabled (stops) | 7 before the stop; 0/21 |
| AE2:play-gate | 1 |
| AE2:not-settled | 3 |
| AE3:baseline | 16, corrected to 14 after the discovery (below) |
| AE3:disabled | 14 |
| AE3:no-css | 11 |
| AE3:fallback-right | 1 |
| AE3:any-xp | 1 |

## Why each case fails where it does

- **AE1 baseline** (G4 as live): no `YG15`, so the seam; Yogo's given list (Commune, Summon) and line; the five pages; the wizard adding Sense on phone and laptop and showing it; and the check asking for Sense (no Sense row to remove). The other Schools, Yogo's two boxes, the wizard's Ward boxes and no errors hold.
- **AE1 disabled** (switch off): `install()` returns before touching the table, and the seam reads `[false, false, []]`: the same eight.
- **AE1 no-sense** (Yogo's `given` not set, the line and pages still set): the seam holds (all five Schools corrected) and so does Yogo's line, which `CW1123.describe` reads from the text. Yogo's given list, the five-pages check (it compares Yogo's given list too), the wizard adding Sense on both devices, the wizard's "Given by your School" line ("Commune, Summon.") and the check asking for Sense fail.
- **AE1 no-line** (Yogo's line left as before, the given list set): Yogo's line and the wizard's note ("starts with Commune, Summon, …") fail. The wizard still adds Sense, its given line reads "Sense, Commune, Summon.", and the check still lists Sense (it reads the given list).
- **AE2 baseline** (G4 as live) and **AE2 disabled** (switch off; `GS15` is present but not installed): on the phone the seam fails (`null`; `[false, false]`), the held spells are not marked, nothing is recorded as done, there is no note, the review still has its "Given by your School" group, Summon is not added, and reopening finds no note. Others untouched holds (no records either way). Then the harness opens the listed character and waits for its note: it stops there. Nothing on the laptop runs.
- **AE2 play-gate** (Play mode's gate not lifted for the add; revision 2 before the Play fix measured 20/21 the same way): only the character opened in Play from the Characters list fails. The spell is not learned, so its scroll is taken away again and the note claims only the marked spells. Every other path opens in Manage.
- **AE2 not-settled** (a School is never recorded as done): the record check on the phone; the removed Sense comes back with its scroll and a note on reopening; and the wizard check, whose School is not recorded after the wizard closes. "Not listed" holds, because Sense is back, as on revision 1; everything else credits and clears as before.
- **AE3 baseline** (G4 as live): no `AX15`. On the phone every check of the unit's own drawing fails: the seam, the plain School Technique, the corner, the fallback and its return, the given spell's ×, Play, the non-zero XP figure (the card keeps its XP box at 0 again), the other School's label (no "Advanced School technique" tag), the Path tag and the taps check (both call `AX15.sweep`, which is not there). The Path check's page code throws **after** it has renamed the School Technique and written a Path at Rank 1, and puts neither back, so the two checks after it that read that card fail too: the save (`Gaze Into Shadow` is no longer in the saved techniques) and the class taken away (the card is not found). The Kiho, the hand-typed Technique and both no-errors checks hold (a page script's exception is not a page error). On the laptop the given spell's ×, the one-line name and print (no tag to hide) fail.
  AE3's README records 6/19 on AE2 with the save and the class-off checks among the passes. Reasoned from the harness as it is now, those two fail on a build without `AX15` for the reason above; the six of the README are this pin's **disabled** case, where `AX15` exists but does nothing.
  **Corrected after the discovery:** the save and class-off checks pass here too, because by then the character holds a second "Gaze Into Shadow" card (see Discovery). The pin is 14, as the README recorded.
- **AE3 disabled** (switch off: `AX15` present, `ax15-on` never set, so `sweep()` returns at once and the Path check puts its card back): the same as the baseline except the save and the class-off checks, which hold. 14.
- **AE3 no-css** (the stylesheet removed): the script marks and tags the cards as built, but nothing is hidden and the tag, a plain span with no rule, is always drawn. Fail: the plain School Technique, the corner (8b.1-UI-03's 42 px stays), the fallback (its XP box is drawn), the given spell's ×, Play, the non-zero figure (the card back at 0 still shows its box), the other School's label (the Advanced card keeps its ×), the class taken away (the tag is still drawn without the class), Kitsu's given spell on the laptop, the one-line name (XP box drawn) and print (the tag is not hidden). The seam, the short name back on one line, the Kiho, the Path tag and the taps check (both read the script, not the drawing), the save, the hand-typed Technique and no errors hold.
- **AE3 fallback-right** (the wrapped tag pushed to the right, the owner's rejected layout): only the fallback check (the tag no longer starts under the name).
- **AE3 any-xp** (the XP figure no longer read): only the non-zero check (a School Technique with 2 XP loses its XP box and ×). The hand-typed Technique on the laptop has no sheet label, so it is not marked either way.

## Counts pinned before full QA

Candidate: G4 7,326 + AE1 13 + AE2 21 + AE3 20 = **7,380**; 201 leaves (`candidate-list.json`: the three units' harnesses, then G4's 198 in G4's order).
Retained, all of the group removed (G4 as live): A09 20 + A10 23 + A10.1 16 + A17 25 + G4's retained 7,169 = **7,253**; 196 leaves (`retained-list.json`: G4's 198 less the two live-site leaves, 5a's `sw-checks.js` and 5b's `notice-checks.js`, as G1 to G4 ran their retained passes).

## Discovery

Discovery ran once on 13 November 2026, after the predictions were committed and pushed (`9edb2747`). Evidence: `variants-discover.log` and `variants-discover-99b76d62/summary.json`. **12 of the 13 cases matched every predicted id exactly**, each with its pinned count: AE1 5/13 (baseline and disabled), 7/13, 11/13; AE2 stopped as pinned at 0/21 after exactly its seven failures (baseline and disabled), 20/21, 18/21; AE3 6/20 (disabled), 9/20, 19/20, 19/20.

**One correction, AE3:baseline (predicted 16, measured 14: 6/20).** The prediction had the save and the class-taken-away checks failing, because the Path check's page code throws on a build without `AX15` after it has renamed the card it reads. Both passed. The reason, confirmed by a probe on G4 as live (`discovery-probe/dup.cjs` and its log; no harness or variant run): when the fallback check renames "Gaze Into Shadow" to "The Mountain Does Not Move", the sheet's own recalculation finds the School's Rank 1 Technique missing by name and adds it again (`applyUnlockedTechniquesToList`, Phase 0's School Techniques), so after the name is put back the character holds **two** "Gaze Into Shadow" cards. The Path check renames the first; the save and class-off checks read the second, which is a plain 0 XP card, and pass. So the baseline fails exactly the disabled case's 14, which is also the 6/19 recorded in AE3's README (plus the taps check added since). The pin is corrected to those 14. The harness is unchanged: on the candidate the second card is marked like the first and every check reads the first, so it changes no result there (20/20). A second discovery runs for this one case only (`--only=AE3:baseline`) before the chain.

The group removal must restore G4 as live exactly. It also runs every kept unit's harness on each singly removed build, and each declared conditional the other way: Phase 11.2.4's `wizard5-harness.js` with AE1 removed, the six harnesses that pause AE2 with AE2 removed, and 8b.1-UI-03's harness with AE3 removed; A17 (the unit before the group) is removed with the group kept. AE1 and AE2 change values and saves, so the group is behaviour tier: the 4× CPU screen and two full passes follow the chain.
