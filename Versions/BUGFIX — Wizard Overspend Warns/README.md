# Wizard Overspend Warns

**Status, 30 October 2026:** built for Release 8a on branch `claude/release-8a-xp-gate-load`; not merged. The release's QA
folder is `QA — Release 8a 2026-10-30`.

Your ruling of 29 October (from the Release 7c device checks, B1/B2): the creation wizard should not stop the player
while more experience is spent than the character has, because Disadvantages bought later can bring the total back. It
should warn at the end instead.

With the switch on:

- **No step blocks Next for the overspend.** Since Phase 11.2 (Part K) it was blocked on Rings & Traits, Skills,
  Advantages & Disadvantages, Kiho, and at Review ("Fix the errors above to finish").
- **The warning, in plain words with the amount over.** A step that showed the red "Overspent by N XP" line shows instead
  "You have spent N XP more than you have. You can go on: a Disadvantage gives experience back." Review opens with "You
  have spent N XP more than you have (spent of total). You can still finish, and bring it back on the sheet with a
  Disadvantage or by lowering a purchase." Review's list of the sheet's own findings still lists the overspend, marked
  as a warning.
- **Finish warns once and goes on.** "You have spent N XP more than you have. Finish anyway? …" with Finish and Stay.
  Finish closes the wizard as before; Stay keeps it open on Review.
- **Every other reason still blocks**, as before: an empty name, a School still asking its own question, an Advantage
  waiting for its own question ("Waiting for its own question…"), any other error at Review.

With the switch off, the old gate comes back exactly.

## How it is built

One fragment behind one switch, `WIZARD_OVERSPEND_WARNS_ENABLED = true`:
`src/sheet/209.999999999999996-bugfix-wizard-overspend-warns.js`, with `XW8Logic` (the words and the amount) and `XW8`.
Every overspend gate reads the validator's `xp-overspend` finding through `CW112.findings()`, so the layer wraps each
step's `check` (the first time the wizard reads it, since the Kiho and Spells steps come and go with the School) to run
with that one finding left out. The step pages themselves (`render`) still see every finding, so nothing is hidden: the
red line is replaced by the warning after the page is drawn. The Finish question wraps `CW112.finish`. Test seam: the
`overspend-warns-seam` block in `src/sheet/210-test-seam-and-init.js`. Its style is injected by the fragment (no
stylesheet), as the audit log's is.

## Checks

- `qa/overspend-warns-harness.js`: 15 checks (the Isawa Shugenja walk overspent to 70 of 40 XP on Rings & Traits, then on
  through every step to Finish, Stay and Finish again; and a walk within budget, with no warning and no question).
- Pinned variants (`qa/variants.json`, committed before the first run): main (7c.1, the baseline) and the switch off fail
  the same 4 pinned checks; no-quiet 2; not-guarded 2; no-decorate 3; no-finish-warning 1; stay-finishes 2. All matched
  (`qa/negative/`).
- With the switch off, Phase 11.2's and 11.2.1's own pinned variants (`qa/xw8-variants-off.py`, logs in `qa/xw8-off/`).
- Removal (`qa/test-removal.py`).

## Older checks changed

See ROLLBACK, "Older checks changed": CW-OVERSPEND-BLOCKS and CW-FINISH-BLOCKED-BY-ERROR (Phase 11.2) and
CW1-OVERSPEND-BLOCKS (Phase 11.2.1) expect the new behaviour only while this switch is on.
