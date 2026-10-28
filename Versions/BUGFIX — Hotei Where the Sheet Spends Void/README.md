# Hotei Where the Sheet Spends Void

**Status, 28 October 2026:** built for Release 7b.1 on branch `claude/release-7b1-2026-10-28`; not merged. Own checks 16/16 on the candidate; removal 6/6; every pinned variant matched. The release's QA folder is `QA — Release 7b.1 2026-10-28`.

Your ruling R10 (desk review, 23 October 2026). With Hotei's Curse on the sheet, the places where the sheet itself spends a Void Point for an Advantage or an Ancestor's gift take two: Dark Paragon's Void payment, and every Ancestor gift paid with a Void Point (Kuni, Hida Atarasi, Ichiro Fureheshu, Kakita's re-roll, Sun Tao). With fewer than two points the payment is refused with the reason. The Curse's row says so, and the Void card's declared button stays for Techniques. Every Technique automatically is after the project (your ruling).

## How it is built

A UI-agnostic logic part and a replaceable UI part, behind one switch: `HOTEI_AUTOMATIC_ENABLED = true` in the first fragment. No save state; nothing is added to a saved character.

- `src/sheet/209.9999999999987-bugfix-hotei-auto-logic.js`
- `src/sheet/209.9999999999988-bugfix-hotei-auto-ui.js`
- `src/css/59.9999999977-bugfix-hotei-auto.css`
- Test seam: the `hotei-seam` block in `src/sheet/210-test-seam-and-init.js`.

## Checks

- `qa/hotei-auto-harness.js`: 16/16 on the candidate. On main every check but the error check fails, as pinned.
- Pinned negative variants (`qa/variants.json`, written before the first run; `qa/verify-variants.py`, results in `qa/negative/`):
- **main (baseline):** fails exactly 15 pinned checks.
- **disabled:** fails exactly 15 pinned checks.
- **paragon-single:** fails exactly 1 pinned check.
- **ancestor-single:** fails exactly 2 pinned checks.
- **status-single:** fails exactly 1 pinned check.
- Removal (`qa/test-removal.py`): 6/6. Later layers come off first through the removal-chain registry; this layer's remover then rebuilds its predecessor exactly: `7a4d598996dbae3a5a164263e261bd93e9516795214c17bf87a44458b681ef46`, 17,351,774 bytes.
