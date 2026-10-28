# Jurojin Reminder Steps

**Status, 28 October 2026:** built for Release 7b.1 on branch `claude/release-7b1-2026-10-28`; not merged. Own checks 6/6 on the candidate; removal 6/6; every pinned variant matched. The release's QA folder is `QA — Release 7b.1 2026-10-28`.

Your ruling R24 (desk review, 23 October 2026). Jurojin's Blessing reminder gives the steps instead of a Resist poison button: roll the Ring or Trait the GM names for the poison or disease, then tick "Resisting poison or disease" (+2k0) in that roll's preview. A03, A09 and A14 are not in this layer.

## How it is built

One UI-agnostic part, with nothing on screen of its own to replace, behind one switch: `JUROJIN_REMINDER_ENABLED = true` in the first fragment. No save state; nothing is added to a saved character.

- `src/sheet/209.9999999999997-bugfix-jurojin-reminder.js`
- Test seam: the `jurojin-seam` block in `src/sheet/210-test-seam-and-init.js`.

## Checks

- `qa/jurojin-harness.js`: 6/6 on the candidate. On main every check but the error check fails, as pinned.
- Pinned negative variants (`qa/variants.json`, written before the first run; `qa/verify-variants.py`, results in `qa/negative/`):
- **main (baseline):** fails exactly 5 pinned checks.
- **disabled:** fails exactly 5 pinned checks.
- **old-text:** fails exactly 2 pinned checks.
- Removal (`qa/test-removal.py`): 6/6. Later layers come off first through the removal-chain registry; this layer's remover then rebuilds its predecessor exactly: `3c4b290a2acb6daabf89389e44b1437438aa1d5b77107baf44fe5fd32d453fd3`, 17,375,567 bytes.
