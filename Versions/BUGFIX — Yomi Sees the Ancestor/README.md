# BUGFIX — Yomi Sees the Ancestor

Cycle 6, Release 6a (FT-45). Found on 22 October 2026, in Release 5b: Yomi did not see Phase 4.8's Ancestor.

## What was wrong

Cursed by the Realm with **Yomi** flags the sheet's ancestral entries for you and the GM to resolve (Feature 4.5.10;
Core Rulebook p.158: your ancestors have turned away from you). It read only the Advantage and Disadvantage lists, and
Phase 4.8's **Ancestor** has its own card, so a Yomi character with an Ancestor was not flagged.

## The fix

One fragment, `src/sheet/209.999999999992-bugfix-yomi-ancestor.js` (`YOMIANC`, switch `YOMI_ANCESTOR_ENABLED`), and one
seam block. The Yomi row names the Ancestor too: "Ancestral: Inheritance, Ancestor: Kakita — resolve with your GM". It
flags whatever Ancestor the sheet holds, whether or not its gifts apply now (lost favour, another Clan's Ancestor): the
flag is for you and the GM. As before, nothing is removed or switched off. The row is redrawn on every recalc, and
choosing an Ancestor recalcs.

## QA

| Measure | Result |
|---|---|
| Own harness, `qa/yomi-ancestor-harness.js` | **12/12** |
| The same harness on main (`993389b`, 5c.1, `7c7cdf21…`) | **6/12**: the checks that pass guard what must not change |
| Pinned variants, `qa/verify-variants.py` (pins in `variants.json`, written before the first run) | **all 6 matched** (main plus 5 mutations; see `negative/summary.json`) |
| Removal, `qa/test-removal.py` | **6/6**: rebuilds the build before this layer byte for byte (`eacfacb4…`, 7,969,638 bytes); refuses the live tree, a foreign marker and a missing block |
| All five 6a layers removed through the registry | rebuilds main (`7c7cdf21…`) byte for byte, manifest and seam file identical |
| Removal chain registry, `qa/test-chain.py` | **11/11** with the five 6a layers registered |
| `qa/feature-dependencies.py` | every hit is in this layer's own seam block (the checker reports the bare "BUGFIX" marker) |
| Older harnesses touching the same surfaces (pre-run on the 6a build) | **all 29 leaves pass** (`QA — Cycle 6 Release 6a 2026-10-24/qa/prerun.log`; folders in `prerun-folders.txt`) |

Covered: No Ancestor; an Ancestor; one whose favour is lost; with Inheritance; the Ancestor taken off; a saved Ancestor the sheet cannot read; after a load; another realm (no flag).

The full suite, the code review and the live check are recorded with the release, in
`QA — Cycle 6 Release 6a 2026-10-24`.

## Still to note

- **One pin was wrong at first.** The "active Ancestor only" variant was pinned to fail 5 checks; it failed 2. With no Clan
  applied, the Ancestors card reads the Clan picker (Crab after a reset), so Hida counts as the character's own. Re-pinned
  to the 2 measured checks (`variants-first-pin.log` keeps the first run); the fix and the harness are unchanged.

Device checks (the owner's iPhone): in the Cycle 6 Device Checks checklist.
