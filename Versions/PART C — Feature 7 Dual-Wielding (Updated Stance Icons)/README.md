# Part C — Feature 7: Dual-Wielding, with updated stance icons

This is **Feature 7 unchanged**, plus the stance-tile artwork swap. No game logic differs from
`PART C — Feature 7 Dual-Wielding`: the dual-wielding build is spliced from the Feature 6 trunk
exactly as before and is byte-for-byte identical at that stage (sha `32df9f2fec6c2427`). Everything
this folder adds happens afterwards, in CSS and in three icon strings.

**Build:** `l5r-character-sheet part C feature 7 dualwield.html` (1,255,233 chars)

| | Feature 7 | This folder |
|---|---|---|
| Dual-wielding logic | identical | identical |
| Stance icons | 5 inline line-art SVGs | 3 replaced with samurai artwork, 2 still SVG |
| Stance icon box | 30×30 | 88×99, portrait |
| Tile heights | disagreed when a name wrapped | all five identical |
| Sheet size | 1,178,717 chars | 1,255,233 chars |

---

## Rebuilding

Two steps, in this order. The splice regenerates the HTML from the Feature 6 trunk, which restores
the original SVG icons; the patch then puts the artwork back.

```bash
python splice_feature7.py
python patch_stance_icons.py
```

Verified: running both in a fresh copy of this folder reproduces the shipped HTML byte for byte.

`splice_feature7.py` here differs from the copy in the base Feature 7 folder by **one line** — its
`OUTDIR` is derived from the script's own location rather than hardcoded to
`PART C — Feature 7 Dual-Wielding`. Without that change a copied folder rebuilds the folder it was
copied *from*, which is a quiet way to lose work.

`patch_stance_icons.py` needs Pillow (`python -m pip install Pillow`) and reads the source artwork
from `..\..\Art\Stances\`, so it depends on that folder staying where it is.

## Testing

```bash
python -m http.server 8815 --directory "."
```

```js
fetch('/l5r-P1-P2-F7-test-harness.js').then(r=>r.text()).then(s=>(0,eval)(s)).then(o=>console.log(o.failed))
```

Expect `0` with all nine sub-suites reporting `failed: 0`. See the verification note in
`STANCE-ICONS.md` for what has and has not been re-run since the icon change.

---

## Documentation in this folder

| File | What |
|---|---|
| `README.md` | This file — what this folder is and how it differs from base Feature 7 |
| `STANCE-ICONS.md` | The icon swap: which artwork, how the figures are sized and matched, the CSS, the one updated assertion |
| `FEATURE-7-RESULTS.md` | Feature 7 itself — RAW findings, design decisions, test sections |
| `DIFF-SUMMARY-vs-Feature6.md` | Feature 7's line-level diff against the Feature 6 trunk |
| `FEATURE-7-HANDOFF.md` | Self-contained Feature 7 summary written to be read without the chat session |

## Everything else

| File | What |
|---|---|
| `l5r-character-sheet part C feature 7 dualwield.html` | The build |
| `splice_feature7.py` + `feature7-code-block.js.txt` | Rebuild Feature 7 from the Feature 6 trunk |
| `patch_stance_icons.py` | Apply the stance artwork |
| `l5r-P1-P2-F7-test-harness.js` | Feature 7 suite, which nests the eight earlier ones |
| `l5r-P1-P2-F6/F4/F3/F2/F1-test-harness.js`, `l5r-P1-P2-test-harness.js`, `l5r-feature0-test-harness.js`, `l5r-partB-test-harness.js`, `l5r-schoolfree-bugfix-harness.js` | The earlier suites |
| `p12-harness.js`, `f0-harness.js`, `partB-harness.js`, `schoolfree-harness.js` | Byte-identical copies under the short names the Feature 4 harness fetches |
| `l5r-crossversion-signature.js` | Cross-build fingerprint |

Three harnesses carry small assertion updates, each documented where it was made: Feature 4 `A3`
and Feature 6 `A15` (whole-registry snapshots, changed by Feature 7 adding its contributor) and
Feature 2 `A5` (counted `<svg>` icons; now accepts `<svg>` or `<img>`).
