# Build History — v01 to v13

Ordered, renamed copies of the early L5R character sheet builds (14 Aug – 21 Aug 2026).
**Originals are untouched** in the project root; these are copies.

Open `VERSION-LEDGER.html` for the full per-version account of what changed.

## Order

Established by three independent signals that all agree: file mtime, monotonic growth
in file size / function count / element IDs, and base64 asset fingerprints.

| Version | Original filename | Bytes | Modified |
|---|---|---|---|
| v01 | `...initiative dice roller.html` | 233,413 | 14 Aug 20:19 |
| v02 | `...initiative dice roller, multiple schools.html` | 244,846 | 15 Aug 07:44 |
| v03 | `l5r-character-sheet (3).html` | 247,541 | 15 Aug 18:18 |
| v04 | `...multiple schools, manual dice picker, unksilled rolls.html` | 349,043 | 19 Aug 15:10 |
| v05 | `l5r-character-sheet_update.html` | 351,336 | 19 Aug 22:47 |
| v06 | `l5r-character-sheet_update (1).html` | 366,343 | 20 Aug 08:12 |
| v07 | *(not on disk — recovered from chat upload)* | 384,746 | — |
| v08 | `l5r-character-sheet_update (3).html` | 384,768 | 20 Aug 10:00 |
| v09 | `l5r-character-sheet_update (4).html` | 474,267 | 20 Aug 10:30 |
| v10 | `l5r-character-sheet_update (5).html` | 534,102 | 20 Aug 20:33 |
| v11 | `l5r-character-sheet_update (6).html` | 539,514 | 21 Aug 01:02 |
| v12 | `l5r-character-sheet_update (7).html` | 545,145 | 21 Aug 02:12 |
| v13 | `l5r-character-sheet_update (8).html` | 546,548 | 21 Aug 13:01 |

## Three things to know

1. **One exact duplicate.** In the chat upload, `l5rcharactersheet.html` and the long
   `...initiative dice roller.html` were byte-for-byte identical (same SHA-256). Only one
   copy is kept here, as v01.

2. **v07 is broken.** It swapped in a larger coin-die icon but dropped the
   `data:image/png;base64,` prefix, so the coin does not render. v08 is the same file with
   those 22 characters restored — the *only* difference between them. v07 is kept purely
   for the record; it is superseded entirely by v08. It was not present in the project
   folder, so it has been restored here from the chat upload.

3. **A regression that never got fixed.** v06 gave every Shugenja school `affinity` /
   `deficiency` data and printed it in the school info line. v07 stripped it out, and it
   has not returned. Still missing as of v13 — worth checking against the current build.

## Note on scope

This covers only the 14 files supplied in chat, which end at v13 (21 Aug). The project
folder continues well past this point — `_update (9)` variants, the `l5r-character-sheet (1)`
through `(6)` series, `phase 5 complete`, and `phase_6_partB` (982 KB, 24 Aug) — none of
which are analysed here.
