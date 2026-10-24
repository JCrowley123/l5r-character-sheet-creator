# BUGFIX — Typed Initiative Is the Dice

Cycle 6, Release 6a (FT-23, the owner's check I5; moved forward from Phase 15 on the owner's yes of 23 October 2026).

## What was wrong

Feature 4.5.35's Initiative box took a typed total as the whole score, holding the bonuses of the moment. Typed after
a Void +10, 23 stayed 23. The owner expected the typed number to be the dice, with the bonuses on top: 33.

## The fix

One fragment, `src/sheet/209.999999999994-bugfix-typed-initiative.js` (`INITDICE`, switch `TYPED_INITIATIVE_DICE_ENABLED`),
and one seam block. A typed total is the dice alone: Center, Void and Quick go on top whether they came before or after
it, as they do for a rolled total. The box says **"Your dice total"** (read aloud: "Your Initiative dice total, before
bonuses"). A rolled total is unchanged. The "not set yet" hint is Feature 4.5.35's, unchanged (its harness pins it).

## QA

| Measure | Result |
|---|---|
| Own harness, `qa/typed-initiative-harness.js` | **11/11** |
| The same harness on main (`993389b`, 5c.1, `7c7cdf21…`) | **3/11**: the checks that pass guard what must not change |
| Pinned variants, `qa/verify-variants.py` (pins in `variants.json`, written before the first run) | **all 5 matched** (main plus 4 mutations; see `negative/summary.json`) |
| Removal, `qa/test-removal.py` | **6/6**: rebuilds the build before this layer byte for byte (`06e169ec…`, 7,972,920 bytes); refuses the live tree, a foreign marker and a missing block |
| All five 6a layers removed through the registry | rebuilds main (`7c7cdf21…`) byte for byte, manifest and seam file identical |
| Removal chain registry, `qa/test-chain.py` | **11/11** with the five 6a layers registered |
| `qa/feature-dependencies.py` | every hit is in this layer's own seam block (the checker reports the bare "BUGFIX" marker) |
| Older harnesses touching the same surfaces (pre-run on the 6a build) | **all 29 leaves pass** (`QA — Cycle 6 Release 6a 2026-10-24/qa/prerun.log`; folders in `prerun-folders.txt`) |

Covered: Typed after a Void +10 (33), typed before it, typed after Quick, typed again, an empty box refused, a rolled total after a Void +10 (no double count).

The full suite, the code review and the live check are recorded with the release, in
`QA — Cycle 6 Release 6a 2026-10-24`.

Device checks (the owner's iPhone): in the Cycle 6 Device Checks checklist.
