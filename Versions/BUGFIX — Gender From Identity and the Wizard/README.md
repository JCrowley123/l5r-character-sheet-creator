# Gender From Identity and the Wizard

**Status, 28 October 2026:** built for Release 7b.1 on branch `claude/release-7b1-2026-10-28`; not merged. Own checks 12/12 on the candidate; removal 6/6; every pinned variant matched. The release's QA folder is `QA — Release 7b.1 2026-10-28`.

Your ruling R15 (desk review, 23 October 2026). A clear Gender in Identity (female, f, woman, girl, lady; male, m, man, boy) meets a gender requirement by itself: the Lion's Pride's confirmation shows ticked, with a line saying your Identity meets it. A different gender shows a line saying to tick only with your GM's agreement; an empty or unclear one leaves the tick to you. A School already joined is never changed by a later edit. The creation wizard's Name step now asks Gender and Age underneath, both optional; a new Clan's start-over keeps them with the name.

## How it is built

A UI-agnostic logic part and a replaceable UI part, behind one switch: `GENDER_IDENTITY_ENABLED = true` in the first fragment. No save state; nothing is added to a saved character.

- `src/sheet/209.9999999999991-bugfix-gender-logic.js`
- `src/sheet/209.9999999999992-bugfix-gender-ui.js`
- `src/css/59.9999999978-bugfix-gender.css`
- Test seam: the `gender-seam` block in `src/sheet/210-test-seam-and-init.js`.

## Checks

- `qa/gender-harness.js`: 12/12 on the candidate. On main every check but the error check fails, as pinned.
- Pinned negative variants (`qa/variants.json`, written before the first run; `qa/verify-variants.py`, results in `qa/negative/`):
- **main (baseline):** fails exactly 11 pinned checks.
- **disabled:** fails exactly 11 pinned checks.
- **no-female-word:** fails exactly 4 pinned checks.
- **no-keep:** fails exactly 1 pinned check.
- **button-stale:** fails exactly 1 pinned check.
- Removal (`qa/test-removal.py`): 6/6. Later layers come off first through the removal-chain registry; this layer's remover then rebuilds its predecessor exactly: `164eff79bd1ba6b640fb16ce45778dc2d7cac9a18104966e9329f99961b1eed5`, 17,361,223 bytes.
