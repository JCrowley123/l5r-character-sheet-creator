# BUGFIX — Printed Emphases Without the Web Fonts

Cycle 5, Release 5a, 21 October 2026. Found when the full suite's second run failed one check,
`PSE-MANAGEMENT-MODE` in `BUGFIX — Printed Skills and Equipment Tables` (1 run in 4 on 5a and on `main` alike).
The owner chose to fix the cause, both parts, in this release.

## What was wrong

The cause is the web font, not a timing race (the failing-test investigation, 21 October). The sheet loads Noto Sans JP
from Google Fonts with `display=swap`. Each harness run starts in a fresh browser, so the fonts come over the network
each time, and the harness never waited for them. When they arrive late or not at all, Chrome lays out in its wider
fallback font. In **Management** mode the Emphases dropdowns keep their native look (Play strips it,
`59.9992-feat-modes-skills.css`), so at 560 px the narrowest the printed Skills table can get is 535.7 px in a 530 px
box. The check `|table width - box| <= 1` then fails.

- **On paper:** printing in Management mode before the web fonts have loaded (a first visit offline, a slow signal)
  ran the Skills table about 6 px into the right margin. Nothing was cut off. Play printed correctly.
- **Not the cause:** the fixed 150 ms wait. The layout measured the same at 0 ms, 150 ms, two frames and 1 s after each
  resize, and 15 normal runs (3 of them at 6x CPU throttling) gave 0 failures. With the fonts blocked: 4/4 failures, the
  same measurement every time.

## The fix

| Part | Where | What |
|---|---|---|
| The sheet | `src/css/59.9999894-bugfix-printed-emphases-fonts.css` (its own fragment) | In print, the Emphases dropdowns lose their native look in every mode, as Play's already do on screen. Both modes print the same columns, whatever the font. It does not lean on the printed-tables fix's switch (`pse-enabled` is that fix's own surface), so either layer comes off on its own. **On paper:** no dropdown arrow beside a Management Emphasis (the owner's yes, 21 October) |
| The test | Blocks `fonts-ready-open` and `fonts-ready-paper` in `BUGFIX — Printed Skills and Equipment Tables/qa/printed-skills-equipment-harness.js` | Waits for `document.fonts.ready` after opening and after each print resize, so a font arriving mid-run cannot change a measurement. Not weaker: with the fonts blocked, the harness still fails without the print rule |

## QA

| Measure | Result |
|---|---|
| Own check, `qa/fonts-harness.js`: the printed-tables harness, unchanged, with the web fonts blocked (`qa/no-web-fonts.cjs`) | **18/18** on 5a; **17/18** on `main` (`PSE-MANAGEMENT-MODE`) |
| The printed-tables harness as the suite runs it (fonts allowed) | **18/18** |
| Pinned variants, `qa/verify-variants.py` | see the cycle's record |
| Removal, `qa/test-removal.py` | rebuilds `e8d2420e…` (5a without this fix, 6,732,527 bytes) byte for byte; with `--fixture` the printed-tables harness returns to main's bytes |
| Removal chain registry | registered by `present_text` (its CSS sits early in the manifest), last in `CHAIN` |
| Sheet build with all of 5a | 6,733,003 bytes, `70bbf994…` |
