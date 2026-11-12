# G3 negative-variant pins — prepared before any run

12 November 2026 (Claude). Frozen candidate `6c555d29b35ca5f550274163cc73f9b6b47a11f3065cfbc4d2ac9bdaab38c029`, 17,631,957 bytes (8b.1-UI-03 revision 2, the whole group). Baseline for each unit: G2 as live, commit `20fd1b3e`, application `7793602382c68895b25dc572b71bd05af33667a9c1b1d1bd76032efd744182f0`, 17,609,230 bytes. Every exact failed-check id is in `variants.json`. **Predictions are reasoned from each harness's oracles and the source, not taken from a variant run.** Two counts were already known from the light checks and agree with the reasoning: UI-01 passes 5/32 and UI-02 7/28 on a build without them.

12 mutations (switch off, own stylesheet removed, two focused defects per unit) plus 3 baselines. Each mutation changes exactly one unique string in a scratch copy of the frozen page. The discovery runs once; any correction is explained here before the qualification chain. No full-suite discovery, retries or widened assertions.

| Case | Predicted failures |
|---|---:|
| UI01:baseline | 27 |
| UI01:disabled | 27 |
| UI01:no-css | 17 |
| UI01:no-tick | 4 |
| UI01:unfilled-confirm | 2 |
| UI02:baseline | 21 |
| UI02:disabled | 18 |
| UI02:no-css | 10 |
| UI02:wrong-tag | 8 |
| UI02:short-controls | 1 |
| UI03:baseline | 20 |
| UI03:disabled | 16 |
| UI03:no-css | 14 |
| UI03:narrow-spell-target | 2 |
| UI03:wide-number-box | 4 |

## Why each case fails where it does

- **UI01 baseline / disabled:** the review is undressed. Only one column on a phone, the ordinary chooser being plain, and no page errors still hold.
- **UI01 no-css:** the script still wraps the groups and writes the headings and counts, so the counts, Later, Confirm, the chooser and the class-off check pass. The grid, the cards, the bar, the scroll box and the count's fill are styling and fail, and a laptop gets one column.
- **UI01 no-tick:** the complete count loses its tick: the live-count and confirm checks read it.
- **UI01 unfilled-confirm:** Confirm is no longer the filled primary.
- **UI02 baseline (live G2):** on a laptop the name already has room, sits on one line with Cast, and the controls compare equal to themselves; rewards have no tag. Everything about the tag, the phone line, Memorised (the old cross covers it) and Play fails.
- **UI02 disabled (UI-03 present):** UI-03 already gives a phone name its own line, with room and a clear Memorised. The phone line fails (the School label comes before Cast), and every tag check fails.
- **UI02 no-css:** the tag exists and is drawn as plain text after the controls; the label is still drawn and the laptop row does not wrap. Data, grants, editing and Memorised pass; the drawn label fails the tag, multi-School and class-off checks, the laptop name loses room, and the phone controls are short.
- **UI02 wrong-tag / short-controls:** the tag's own words; the phone controls' 44 px height.
- **UI03 baseline (live G2):** the old 40 / 27 px cross covers the number box, Memorised and the School name. Heights, the old common corner, Play, the laptop name and the card checks that only compare with themselves pass.
- **UI03 disabled (UI-02 present):** the phone name is on its own line, so Memorised and the edge taps are clear, but the cross still covers the name or the tag and every card's number box.
- **UI03 no-css:** as disabled, but the seam is present.
- **UI03 narrow-spell-target:** a 30 px spell cross; it still clears everything and keeps the corner within 10 px.
- **UI03 wide-number-box:** the number box back at 70 px; the name gives up the whole corner.

## Counts pinned before full QA

Candidate: G2 7,148 + 8b.1-UI-01 32 + 8b.1-UI-02 28 + 8b.1-UI-03 34 = **7,242**; 194 leaves (`candidate-list.json`).
Retained, all of G3 removed (G2 as live): A05 22 + A06 20 + A07 26 + A11 22 + A04.1 56 + G2's retained 6,929 = **7,075**; 189 leaves (`retained-list.json`). Excludes the same 73 live-site checks as G1's and G2's retained runs.

The group removal must restore G2 exactly. It runs every kept G3 harness on each singly removed build (8b.1-UI-02's declared conditional fixture both ways), the older-holdings review on the UI-01-removed build, and A04.1 removed with G3 kept. No 4x CPU screen: G3 adds no timing or animation (UI-02's one observer is the kind A04.1 qualified with).

## Discovery

*(not yet run)*
