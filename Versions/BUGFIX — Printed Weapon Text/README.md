# BUGFIX — Printed Weapon Text (FT-30, clipping only)

Built 14 October 2026 (Cycle 1, Layer 2). On paper, each weapon's name and notes now wrap in full instead of being
cut off at the edge of their field. Page count and whitespace are left for Phase 15 (owner, 14 October).

## The defect

A weapon's name and notes are single-line `<input>` fields (`090-table-rows-weapons.js`). A single-line field
cannot wrap, so on paper anything longer than its box was cut off: page 6 of the owner's saved PDF (12 October)
shows the Katana name clipped and its note stopping mid-sentence. Measured on `main` under print media at A4 width:
a 71-character name needs 445 px in a 290 px box, and **the library's own Katana note is clipped too**, so every
character carrying a Katana printed a cut-off note.

## The fix

`src/sheet/209.999999997-bugfix-printed-weapon-text.js` (`PRINTWEAPONS`) uses Export to PDF's own pattern: on
`beforeprint` it places a wrapping text copy after each weapon name and notes field; on `afterprint` it removes them.
`src/css/59.999987-bugfix-printed-weapon-text.css` hides the fields and shows the copies **under print only**. No
`position` changes are made, so no absolutely positioned layer is freed (the printed ring-layer lesson).
Export to PDF prints through `window.print()`, which fires the same events. The restore also sweeps stray copies:
the carousel can re-copy an edge page with `cloneNode(true)` while printing, and Export to PDF's own copies leak that
way (see the cycle's QA notes). Screen layout and saved data are unchanged.

## Structure

| File | Owned item |
|---|---|
| `src/sheet/209.999999997-bugfix-printed-weapon-text.js` | `PRINTWEAPONS`, switch `PRINTED_WEAPON_TEXT_ENABLED` |
| `src/css/59.999987-bugfix-printed-weapon-text.css` | print-only rules; classes `pw-enabled`, `pw-print-text`, `pw-text-source` |
| `src/sheet/210-test-seam-and-init.js` | `printed-weapon-text-seam` block |
| `build/manifest.json` | two entries (after Export to PDF's stylesheet; after Search Focus on Close) |

## Verification (14 October 2026)

| Check | Result |
|---|---|
| Focused harness `qa/printed-weapons-harness.js` | **15/15** on the candidate; **6/15 on `main`**: the 9 fix checks fail, the 6 guards pass |
| Negative variants `qa/verify-variants.py` | **6/6 pinned**: baseline (9), disabled (9), print CSS missing (5, including the short row printing twice), no wrapping (4: the table grows past the paper), no stray sweep (1), name not copied (4) |
| Dependency harness | **12/12**: control, switch off, fragment absent, Export to PDF off |
| Neighbours on the candidate | Export to PDF **33/33**; Printed Ring Layers **8/8**; Search Focus on Close **12/12** |
| Removal proof `qa/test-removal.py` | **6/6**: rebuilds Layer 1's build exactly (3,802,681 bytes, `07c8a257…`) |
| Removal-chain registry | **11/11** |
| Ownership scan | Exit 1, explained in ROLLBACK (bare "BUGFIX" attribution) |

Candidate: **3,805,444 bytes**, SHA-256 `98c8af4c071d8d1210e6d60b2f5626e6900edf6c2c3a86d5ee5135e22411083c`.

How the checks see paper:
- **Geometry**, under print media at 703 px (A4 at 12 mm margins): every element that shows the name or notes must
  hold the full text with nothing overflowing, and its box must lie within the paper's width. The second condition
  was added after the no-wrap variant showed the table simply growing past the page.
- **PDF text**: Chromium prints a real PDF (`page.pdf()` fires both print events), and xpdf's `pdftotext -raw`
  extracts it. xpdf drops clipped text by default, so on `main` it returns only "Katana of the Unbroken" and
  "Rerolls one damage die per". The candidate's extract holds both full strings. The owner noted that another
  extractor kept the hidden text; this check depends on xpdf's behaviour, recorded here.

**Not verified here:** iPhone Safari's print and Share → Save to Files. See `MANUAL-TESTS.md`.

`qa/current-suite-runner.js` chains Layer 1's suite (5,134) and adds 15 + 12: **5,161**.
