# ROLLBACK — BUGFIX — Spell Slots Tab on Safari

## What it adds

Two delimited blocks in `Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source
Reorganization for Maintainability/src/layer/10-carousel.js`:

- `// BUGFIX SAFARITAB BEGIN probe-switch` … `// END SAFARITAB probe-switch`: the switch
  `SAFARI_TAB_PROBE_ENABLED`, just above `targetHidden()`.
- `// BUGFIX SAFARITAB BEGIN hidden-page-probe` … `// END SAFARITAB hidden-page-probe`: inside
  `targetHidden()`, before its final computed-style read.

Plus `expect_sha256` in `build/manifest.json`. No fragment, stylesheet or seam entry.

## Remove it

On a scratch copy of the Phase 0 tree (the remover refuses the live tree):

```bash
cp -r "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability" /tmp/safaritab
python3 "Versions/BUGFIX — Spell Slots Tab on Safari/qa/remove-phase.py" /tmp/safaritab
python3 /tmp/safaritab/build/recombine.py --verify
```

Measured: the result is byte-identical to `339a9590…` (commit `8cbfa39`), and `10-carousel.js` and
`manifest.json` match that commit exactly. Copy the two files back over the live tree.

Or set `SAFARI_TAB_PROBE_ENABLED = false` to turn it off without removing it.

## Dependencies

None, either way. The probe only reads `data-visible-with` pages, of which Spell Slots is the only
one. It works alongside `BUGFIX — Spell Slots Tab Visibility Race` (the synchronous
`refreshVisibility()` call from the sheet), which still runs as before; removing either leaves the
other working.
