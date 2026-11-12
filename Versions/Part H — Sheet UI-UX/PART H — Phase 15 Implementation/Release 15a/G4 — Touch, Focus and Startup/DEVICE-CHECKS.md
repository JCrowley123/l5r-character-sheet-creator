# G4 device checks — mirror

**The owner's checklist** is the Claude Doc [G4 device checks — touch, focus and startup](https://claude.ai/artifact/4Wv4DVtZfmKfX9VQGbuFgW), created on 12 November 2026. Each check has a Pass/Fail choice for iPhone Safari, the iPhone app (the preview added to the Home Screen) and Laptop Edge where it applies; each unit has an Accept / Revise / Remove choice.

**Results, read from the doc on 12 November 2026 (rev 124; the owner filled it in the same day):**

| Unit | Preview | Checks | Result | Decision |
|---|---|---|---|---|
| A09 · Phone text entry and repeated taps | claude-release-15a-a09 | 1–6 | All Pass except **check 4 Fail** on iPhone Safari and the iPhone app | **Revise** |
| A10 · Cross-page actions move focus | claude-release-15a-a10 | 7–10 | All Pass | Accept |
| A10.1 · The page ring only for the keyboard (revision 1) | claude-release-15a-a10-1 | 11–14 | All Pass | Accept |
| A17 · The splash fills the screen | claude-release-15a-a17 | 15–18 | All Pass | Accept |
| A18 · The first Manage tap (live app) | live | 19 | **Quick** | Closes as not reproduced |

**Check 4** ("Double-tap a heading or empty space: the page zooms in; double-tap again: it zooms back out. Pinch in and out anywhere."). The owner's note: "When I tried to double tap on areas of the sheet on safari and the app I could not zoom in at all. I tried double tapping in several locations on different tabs." Pinch was not reported as failing.

What the code shows: nothing in the app stops zoom for the whole page. The viewport is as shipped (`width=device-width, initial-scale=1.0`, no `maximum-scale`, no `user-scalable`); the only `touch-action` rules are A09's (buttons only), the splash (`none`, while it shows) and the Library's crop area. iPhone Safari's double-tap zooms to fit the block tapped; on a page laid out for a phone, the cards and text already fill the width, so there may be nothing for it to zoom to, and the zoom the owner used to get may have come only from small controls (buttons, steppers, small boxes), which is the zoom A09 removes. **Not yet known whether double-tap zooms on text on the live app (G3);** the owner's comparison there decides whether A09 changed it. Pending.

**Which builds the round ran on.** A09, A10 and A10.1 previews were verified current before the round (`qa/hosted-preview/`: 229/229, 252/252, 268/268 on the deployed files). The A17 preview was still serving the build from before the restack onto A10.1 revision 1 (`a4240be9…`, 17,654,261 bytes: the old A17 page): Cloudflare's build of the restacked commit `11558cf3` failed at 14:18 UTC while A10.1's, pushed at the same moment, deployed. A17's own code is the same in both builds, so checks 15–18 stand; the A10.1 behaviour on that preview was revision 0, which the A10.1 checks did not use.

**A18.** The owner's step 1 on the live app: the first Manage tap is quick. A18 closes as not reproduced, with the test-browser measurements in [REPRODUCTION.md](REPRODUCTION.md) (first tap 45–62 ms at normal speed, no slower than the second). Nothing was built.
