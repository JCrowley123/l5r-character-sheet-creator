# G4 mock-ups and the owner's approval

12 November 2026 (Claude). The board, [mockups/G4-MOCKUPS.html](mockups/G4-MOCKUPS.html), was published to the owner as a private artifact (https://claude.ai/artifact/MaBez8CkNWzfpN2qRYSByk). It shows today beside the proposal for each item, at phone and laptop size, with a recommendation. Every picture is the live G3 build (`6c555d29…c029`) in a test browser, with the proposal applied only in that browser. How the pictures were made: [REPRODUCTION.md](REPRODUCTION.md).

## What was proposed

| Item | Proposal | Recommendation |
|---|---|---|
| **A09** (FT-49) | On phones and touch screens, every editable text box at least 16 px (the five Ring boxes are already larger and are left alone); `touch-action: manipulation` on buttons only. Pinch zoom and double-tap zoom elsewhere kept; the viewport is never forced back. Laptop unchanged. | Approve; FT-49 is fixed only after the owner's device check on Safari and the installed app, all three cases |
| **A10** (FT-50, FT-52) | The Advanced Schools hint and its button in one wrapping row, centred on each other, 44 px touch height kept. After the tap, focus moves to the "Advanced School" heading on Techniques once the carousel settles; Identity becomes inert; the phone keyboard does not open. Written once so any later cross-page button can use it. | Approve |
| **A10.1** (the owner's 12 November item) | The page's gold focus ring is drawn only when the page is reached with the keyboard, never after a tap or a dialog giving focus back (option A). Option B, return focus to the opening button, was shown and not recommended. | Option A |
| **A17** (FT-41) | The splash artwork fills the screen (`cover`) with a focal point per picture (portrait 50% 45%, square 50% 35%, landscape 45% 50%); the square picture is used up to 3 : 2 instead of 4 : 3. First paint, the 5-second hold, the tap guard and how the splash leaves are unchanged. | Approve |
| **A18** | No build. Step 1: the owner taps Manage on the live app on the iPhone; if the first tap is not slow, A18 closes as not reproduced with the measurements in REPRODUCTION.md. Step 2, only if it is: a throwaway timing preview, never merged. | The two-step check |

A10.1 is a proposed identifier (an owner addition beside A10, as A03.1 and A04.1 were).

## Owner decision, 12 November 2026 — all five as recommended

Asked to approve the five items, the owner answered in the Claude session on 12 November 2026:

> "I am happy with the recommendations suggested"

| Item | Approved |
|---|---|
| A09 | As proposed |
| A10 | As proposed |
| A10.1 | Option A |
| A17 | As proposed |
| A18 | The two-step check; step 1 is the owner's, any time before the device round |

This is mock-up approval. It permits the build and preview stage: four separately owned units (A09, A10, A10.1, A17), stacked previews, light checks, one code review, then the owner's device round with Accept / Revise / Remove for each. It is not device acceptance, qualification or a go-live instruction. G4 is behaviour tier: the 4× CPU screen and two full passes after acceptance.
