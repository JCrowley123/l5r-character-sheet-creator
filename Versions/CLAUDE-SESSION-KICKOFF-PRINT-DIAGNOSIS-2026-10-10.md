# Claude — next-session kickoff: why the printed PDF fades (diagnosis only, 10 October 2026)

**This file carries the owner's approval** (10 October: "write a short kickoff for it", choosing the Print diagnosis for
the rest of the week). **Diagnose; build nothing.** Report the cause and a sized plan for Phase 11.1, then stop.

Project: the L5R 4th Edition character sheet. Repository https://github.com/JCrowley123/l5r-character-sheet-creator;
live site https://l5r-character-sheet-creator.pages.dev/.

## Start of session

- Remote Control on; keep-awake checked; read `get_usage` and record it. **Budget: about 1–3 points.** The week read 94%
  on 10 October and resets on 14 October at 01:00 UTC. Stop and report if it reaches 97%.
- Canonical checkout `C:\Users\jcrow\l5r-character-sheet-creator` (never the OneDrive clone). Nothing is committed except
  the records at the end (exact paths only).
- Read only: the roadmap's amendment "Phase 14.1 Search Facets; the Print test — 9 October 2026" and the Phase 11.1
  section; `src/css/60-sheet-print.css` and any `@media print` rules in other stylesheets (grep).

## The finding to explain

On the owner's iPhone (installed app, live site), ⋯ → Print → Share → Save to Files gave a 7-page A4 PDF that holds every
section's text, but almost all of it prints faded to near-invisible on the cream card; only the Rings row on page 2 reads.
Some glyphs are wrong ("0TH EDITION" for 4th; "fi" lost). The owner's PDF was attached in the session of 9–10 October; ask
for it again if you need it.

## What to do

1. Render the live page with print media in headless Chromium (`page.emulateMedia({media:'print'})`, then `page.pdf()`
   for A4) and screenshots at 390px. Compare with the owner's PDF.
2. Find the cause. Likely suspects, to confirm or rule out by measurement, not guesswork: low-contrast ink colours or
   `opacity` on cards in print; a translucent overlay (the clan-mon watermark, Phase 9) printed above the text; text
   colours from the dark-mode or Clan themes; `-webkit-print-color-adjust`; webfont glyph mapping (the wrong digits and
   ligatures).
3. If one rule causes it, prove it in a scratch copy: switch it off there, render again, and show the text reads. Do not
   commit a fix.
4. Report: the cause with evidence (screenshots or render comparison, sent with `SendUserFile`); what a fix would change;
   whether 11.1 can then use the browser's print path on the iPhone (about 3 points) or still needs a client-side PDF
   library (up to 15). Record it in `BUILD-LEDGER.md` and the roadmap (an amendment), commit and push.

## Lessons

One browser job at a time. Write generator scripts to `.py` files (heredocs lose backslashes); pass Windows paths as
arguments. Check the date before writing it (`date -u`). Keep each file's line endings.
