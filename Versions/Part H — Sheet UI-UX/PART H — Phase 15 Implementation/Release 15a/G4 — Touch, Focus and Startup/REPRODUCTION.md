# G4 reproduction on G3 as live

12 November 2026 (Claude). Source SHA-256 `6c555d29b35ca5f550274163cc73f9b6b47a11f3065cfbc4d2ac9bdaab38c029`, 17,631,957 bytes, `main` at `5d14ebe3` (the same bytes as production, verified on 12 November by G3's live checks). Chromium 153 from the project's QA tools, 390 × 844 touch (device scale 2) and 1440 × 1000, one browser job at a time. Test characters: `QA — Release 7b.1 2026-10-28/qa/walk/7b1-checks-matsu.l5r.json` (shows Go to Advanced Schools), `BUGFIX — Older School Choices/qa/older-kitsu.l5r.json` (the School-choice dialog), and the audit's dense character. Scratch evidence, not qualification. Native Safari was not available.

## A09 — phone text entry and repeated taps

- Viewport meta: `width=device-width, initial-scale=1.0` (no `maximum-scale`, no `user-scalable`).
- Phone, Manage, every editable control in the app (rendered or not, pickers opened; `qa/scan-inputs.cjs`): 34 kinds under 16 px. Rendered on the pages: Identity's Honour, Glory, Status and Taint Rank and Points (`.ce7-edit`, 14 px); the Water mastery picker (`#wm7-picker`, 13.33 px); Skills name, Trait, Rank (14.72 px) and Emphasis picker (14.08 px); Equipment rows (14.72 px); Weapons rows (14.72 px); Advantage, Disadvantage and Technique descriptions (`.en-desc`, 14.4 px); the Advanced School picker (14.68 px); Background text boxes (15.68 px); the Void damage box (14.72 px). Only the five Ring boxes (`#ring_*`, 20.8 px) are larger than 16 px.
- Every button: `touch-action: auto` (127 on one page).
- Not reproducible in Chromium: the iPhone's focus zoom and double-tap zoom. These are the owner's reports (FT-49).

## A10 — Go to Advanced Schools

- The only cross-page button: AP7 (`src/sheet/209.9999999999999994-bugfix-school-pointer-ui.js`); the other `goToTab` caller is Combat's automatic move when the mode changes.
- Laptop: the button's centre is 4 px below the hint's line (FT-50). Phone: the hint fills the line; the button wraps below at 44 px.
- After Go (both sizes): focus stays on `#ap7Go`; the Identity page is not inert (the carousel keeps a page that holds focus); the next Tab goes to `#ce7-honor-rank` on the hidden Identity page (FT-52). The destination heading is `#advancedSchoolPanel h3`, "Advanced School".

## A10.1 — the gold ring

Reproduced: with the page focused (as iPhone Safari leaves it after a tap), opening the School-choice dialog and pressing Later returns focus to `section.car-page`, which matches `:focus-visible` and draws `.car-page:focus-visible { outline: 2px solid var(--gold); outline-offset: -3px }` (`qa/reproduction/ring-phone-after-later.png`).

## A17 — splash

Three artworks in `src/markup/10-swipe-tab-shell.html`: portrait 853 × 1843 (up to 2 : 3), landscape 2000 × 1125 (from 4 : 3), square 2000 × 2000, shown with `object-fit: contain` on `#fde8d0`. Paper bands today: 21.2 % at 390 × 664, 17.9 % at 844 × 390, 28.4 % at 844 × 340, 25 % at 768 × 1024 and 1024 × 768, 19 % at 1440 × 1000, 15.4 % at 1366 × 650; none at 390 × 844, 667 × 375 or 1536 × 864. The proposal was rendered from the splash's own markup and CSS with the extracted pictures (`qa/splash.cjs`, `qa/splash/`).

## A18 — the first Manage tap

From the input event to the second animation frame after the click, phone emulation, the Matsu character in Play, three fresh starts each:

| CPU | First tap | Second tap |
|---|---|---|
| 1× | 61.6, 44.8, 45.2 ms | 49.7, 37.0, 42.4 ms |
| 4× | 178.5, 146.8, 140.0 ms | 222.6, 184.5, 223.7 ms |

Not reproduced: the first tap is not slower. Raw values: `qa/reproduction/reproduction.json`.

## Commands

With `NODE_PATH` and `PLAYWRIGHT_BROWSERS_PATH` set to the QA tools, `NODE_OPTIONS` unset, and the navigation-budget and splash-fast preloads: `node qa/reproduce.cjs <out>`, `node qa/proto.cjs <out>`, `node qa/scan-inputs.cjs <sheet> <fixture> <name>`. `node qa/splash.cjs <folder with the three pictures> <out>` needs no preloads. The three pictures are extracted from the splash markup's data URIs.
