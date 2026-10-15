# Carousel keeps its page on rotation — manual checks (iPhone)

| # | Steps | Expected |
|---|---|---|
| R1 | Turn the phone to landscape, open **Techniques**, then turn it back to portrait. | The sheet stays on Techniques, and the tab bar never shows Clan & School. |
| R2 | Repeat R1 on **Combat** (if shown), **Equipment** and **Background**. | Each stays on its own page. |
| R3 | Repeat R1 on **Clan & School** and **Adv & Disadv**. | Unchanged: each stays on its own page. |
| R4 | In portrait, open **Background**; turn to landscape, then back to portrait. | Background both times. |
| R5 | After turning, swipe left and right, use the arrows if shown, and tap a tab. | Each swipe or arrow moves one page and the tab bar follows; a tab tap goes to its page. |
| R6 | Tap **Background** and turn the phone while the sheet is sliding. | The sheet ends on Background (the last fix's C2, still holding). |

## Results (owner, iPhone, live site, 15 October 2026)

| # | Result |
|---|---|
| R1–R5 | **Pass** |
| R6 | **Not run.** The phone turns too slowly to finish a rotation while the sheet is still sliding (about 0.9 s). Assumed to pass by the owner's decision, on the strength of the automated checks: Layer 7's resize-during-a-glide checks (`CDS-RESIZE-150MS`, `CDS-RESIZE-400MS`) pass with this fix. **If the sheet ever ends on the wrong page after turning the phone during a tab tap, suspect this untested case first.** |

Marked complete by the owner on 15 October 2026.
