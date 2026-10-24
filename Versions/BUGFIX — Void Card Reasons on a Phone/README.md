# BUGFIX — Void Card Reasons on a Phone

Cycle 6, Release 6a (FT-38, the owner's check H4; moved forward from Phase 15 on the owner's yes of 23 October 2026).

## What was wrong

A greyed-out Void card button gave its reason only as a hover title, which a phone cannot show. In the owner's check,
Hotei's Curse's two-point button at 1 Void Point was rightly greyed out, with no way to read why. Every disabled Void
card button was the same.

## The fix

A script fragment, `src/sheet/209.999999999995-bugfix-void-reasons.js` (`VOIDWHY`, switch `VOID_REASONS_ENABLED`), a
stylesheet fragment, `src/css/59.9999895-bugfix-void-reasons.css`, and one seam block. Under the Void card's buttons,
one line per reason, naming the buttons it covers ("For a Technique or Advantage (Hotei's Curse: 2 points): Hotei's
Curse: this needs 2 Void Points; you have 1."), or just the reason when every button shares it ("No Void Points
remaining."). Reasons the card's own line above the buttons already gives (out of combat; Void already spent this
Round; Momoku) are not repeated. The lines follow the card and the Void pips, as Hotei's button does. The buttons and
their titles are unchanged. The lines use the card's own type, at 12 px.

**The code review found two bugs here, both fixed before the suite:** a tap on a Void pip redraws Hotei's button but
not the card, so the lines went stale (now redrawn with the pips too); and Momoku's reason showed both above and below
the buttons (a reason equal to the card's own line is now skipped). Two checks and two variants were added for them.

## QA

| Measure | Result |
|---|---|
| Own harness, `qa/void-reasons-harness.js` | **14/14** |
| The same harness on main (`993389b`, 5c.1, `7c7cdf21…`) | **5/14**: the checks that pass guard what must not change |
| Pinned variants, `qa/verify-variants.py` (pins in `variants.json`, written before the first run) | **all 8 matched** (main plus 7 mutations; see `negative/summary.json`) |
| Removal, `qa/test-removal.py` | **6/6**: rebuilds the build before this layer byte for byte (`aa2d710e…`, 7,974,888 bytes); refuses the live tree, a foreign marker and a missing block |
| All five 6a layers removed through the registry | rebuilds main (`7c7cdf21…`) byte for byte, manifest and seam file identical |
| Removal chain registry, `qa/test-chain.py` | **11/11** with the five 6a layers registered |
| `qa/feature-dependencies.py` | every hit is in this layer's own seam block or stylesheet fragment (the checker reports the bare "BUGFIX" marker) |
| Older harnesses touching the same surfaces (pre-run on the 6a build) | **all 29 leaves pass** (`QA — Cycle 6 Release 6a 2026-10-24/qa/prerun.log`; folders in `prerun-folders.txt`) |

Covered: Hotei's Curse at 1 Void Point in combat; no Void Points; out of combat; a Void Point spent this Round; Kiho for a character who cannot use it; a tap on a Void pip; Momoku; one box however often the card is redrawn.

The full suite, the code review and the live check are recorded with the release, in
`QA — Cycle 6 Release 6a 2026-10-24`.

## Still to note

- A character who is not a monk or shugenja always sees "Activate a Kiho: Only a Monk or Shugenja character can activate
  Kiho." under the buttons in combat. That was always the button's title; it is now visible. If it reads as clutter, it
  is a one-line change for the owner to rule on.

Device checks (the owner's iPhone): in the Cycle 6 Device Checks checklist.
