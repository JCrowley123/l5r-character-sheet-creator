# BUGFIX — Roll Preview Opens at the Top

Cycle 6, Release 6a (FT-21, moved forward from Phase 15 on the owner's yes of 23 October 2026).

## What was wrong

The roll preview ("Before you roll", Phase 3 of Part G) is one card, shown and hidden for every roll, and the card
kept its scroll. After scrolling down in one roll's preview, every later preview opened part-way down.

## The fix

One fragment, `src/sheet/209.999999999993-bugfix-roll-preview-top.js` (`RPTOP`, switch `ROLL_PREVIEW_TOP_ENABLED`), and one
seam block. Each time the preview opens, its card (`#rollPreviewOverlay .roll-modal`) is scrolled to the top, after it is
shown. A scroll made inside an open preview stays.

## QA

| Measure | Result |
|---|---|
| Own harness, `qa/roll-preview-top-harness.js` | **10/10** |
| The same harness on main (`993389b`, 5c.1, `7c7cdf21…`) | **4/10**: the checks that pass guard what must not change |
| Pinned variants, `qa/verify-variants.py` (pins in `variants.json`, written before the first run) | **all 5 matched** (main plus 4 mutations; see `negative/summary.json`) |
| Removal, `qa/test-removal.py` | **6/6**: rebuilds the build before this layer byte for byte (`a02e64a1…`, 7,971,417 bytes); refuses the live tree, a foreign marker and a missing block |
| All five 6a layers removed through the registry | rebuilds main (`7c7cdf21…`) byte for byte, manifest and seam file identical |
| Removal chain registry, `qa/test-chain.py` | **11/11** with the five 6a layers registered |
| `qa/feature-dependencies.py` | every hit is in this layer's own seam block (the checker reports the bare "BUGFIX" marker) |
| Older harnesses touching the same surfaces (pre-run on the 6a build) | **all 29 leaves pass** (`QA — Cycle 6 Release 6a 2026-10-24/qa/prerun.log`; folders in `prerun-folders.txt`) |

Covered: After Cancel, after ✕, after a finished roll, a Trait roll after a scrolled Skill roll, and a scroll inside an open preview (it stays). A short phone screen (390 × 420) so the card scrolls.

The full suite, the code review and the live check are recorded with the release, in
`QA — Cycle 6 Release 6a 2026-10-24`.

## Still to note

- The harness sets the card's scroll directly; a finger's scroll on a real phone is the owner's device check.

Device checks (the owner's iPhone): in the Cycle 6 Device Checks checklist.
