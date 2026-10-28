# Ancestor Gifts Used and Favour

**Status, 28 October 2026:** built for Release 7b.1 on branch `claude/release-7b1-2026-10-28`; not merged. Own checks 12/12 on the candidate; removal 6/6; every pinned variant matched. The release's QA folder is `QA — Release 7b.1 2026-10-28`.

Your ruling R25 (desk review, 23 October 2026). A once-a-session Ancestor gift already used shows in the roll preview as "used this session", and cannot be ticked, until Reset session on the Ancestor card. In Management the Ancestor card has a Set the favour list (kept, lost and may return once, returned once, lost for good) for corrections agreed with your GM; it is hidden and locked in Play.

## How it is built

A UI-agnostic logic part and a replaceable UI part, behind one switch: `ANCESTOR_GIFTS_ENABLED = true` in the first fragment. No save state; nothing is added to a saved character.

- `src/sheet/209.9999999999998-bugfix-ancestor-gifts-logic.js`
- `src/sheet/209.9999999999999-bugfix-ancestor-gifts-ui.js`
- `src/css/59.9999999981-bugfix-ancestor-gifts.css`
- Test seam: the `gifts-seam` block in `src/sheet/210-test-seam-and-init.js`.

## Checks

- `qa/ancestor-gifts-harness.js`: 12/12 on the candidate. On main every check but the error check fails, as pinned.
- Pinned negative variants (`qa/variants.json`, written before the first run; `qa/verify-variants.py`, results in `qa/negative/`):
- **main (baseline):** fails exactly 11 pinned checks.
- **disabled:** fails exactly 11 pinned checks.
- **no-disable:** fails exactly 1 pinned check.
- **play-visible:** fails exactly 1 pinned check.
- Removal (`qa/test-removal.py`): 6/6. Later layers come off first through the removal-chain registry; this layer's remover then rebuilds its predecessor exactly: `a465b6c915c86867bfe76a68546adf1dac56532c2701db4047ad4b9ef0f8da00`, 17,376,589 bytes.
