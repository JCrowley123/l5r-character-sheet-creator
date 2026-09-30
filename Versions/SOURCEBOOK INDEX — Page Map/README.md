# Sourcebook index — Page Map

A map of **which book and page** covers each topic the remaining phases need, built by a script
from the owner's own sourcebook PDFs. Approved on 30 September 2026 as the first step of that
day's plan, ahead of Phase 7 and the sourcebook phases (4.8, 4.6, 4.7, 6 with Hotei, 9's flavour text).

Not part of the sheet. Nothing in the build, the deploy or any test reads this folder.

## The ruling it follows

**Rules content goes into this project in our own words, with page references; never verbatim**
(owner's ruling, 30 September 2026). So this index holds page numbers, headings and short entry
names only. Every string it stores is capped at 100 characters, and `build_index.py` refuses to
write if one is longer. The text it extracts goes to a temporary folder that is deleted when the
script exits. Re-extracting takes under a minute, so no extract is ever saved.

## Files

| File | What it is |
|---|---|
| `build_index.py` | The generator. Reads the PDFs, writes the three files below |
| `INDEX.md` | The map: the books, then one section per topic, then the sheet's own Schools and techniques matched to book pages |
| `OUTLINES.md` | Every book's own bookmarks, with printed and PDF page numbers |
| `index.json` | Everything above as data, for later phases' scripts |

## Running it

```bash
python build_index.py            # rebuild the three files (about 45 seconds)
python build_index.py --check    # re-check the known page references only; exit 1 on any failure
python build_index.py --books "D:/somewhere/else"
```

Needs **pypdf** (installed on the desktop) and poppler's **pdftotext**, which ships with Git for
Windows (`/mingw64/bin/pdftotext`). The books are read from
`%USERPROFILE%\OneDrive\Documents\L5R 4th edition books` unless `--books` or `L5R_BOOKS` says
otherwise. They are outside the repository and gitignored; a cloud session cannot run this.

## What it found

- **16 sourcebooks, 3,782 pages, all with selectable text.** The seventeenth PDF in the folder is
  the blank character sheet, skipped.
- **Printed page = PDF page − 1** in 14 books, **− 3** in the Core Rulebook, and **the same** in
  Unexpected Allies 2. The page labels a PDF reader shows are wrong for 8 books, so always cite
  the printed page. The index gives both, e.g. "p. 241 (PDF 244)".
- **Bookmarks** (this answers Phase 13's per-book question in advance):
  - 12 books have working bookmarks.
  - Emerald Empire (18) and The Great Clans (17) have only a few.
  - Strongholds of the Empire has none.
  - Naishou Province has 48 bookmarks, none of which points to a page.
- **Ancestors (Phase 4.8):**
  - Core Rulebook pp. 241–244, one section per Clan plus Spider.
  - The Great Clans: "New … Ancestors" sections on pp. 42, 104, 140, 170, 202, 230, 260 and 283.
  - Secrets of the Empire pp. 243–245: Imperial Families and Minor Clan ancestors, each with a
    point cost.
- **Alternate Paths (Phase 4.6):** 136 entries detected across 13 books, against the 12 monk paths
  the sheet has today. The count includes reprints and duplicates and has not been checked.
- **Advanced Schools (Phase 4.7):** 21 entries detected across 10 books. The rules for both kinds
  start at Core p. 245.
- **The sheet's own library, matched to the books:**
  - 98 of the 104 Schools found by heading; the 6 not found are listed in `INDEX.md`.
  - The libraries name **338** School techniques; **72** have no description today, and 65 of
    those 72 were located.
  - The ledger's older figure of 98 undescribed techniques is out of date. The 72 was
    cross-checked by evaluating the libraries in Node.
  - No technique carries a Void-cost field.

## How it was checked

| Check | Result |
|---|---|
| Six page references the sheet already cites (Core p.118, Book of Void p.192, Strongholds p.93, Secrets p.243, Naishou p.7, Great Clans p.199): each named word is on the computed page | **6/6** |
| The same check with the offset forced to 0, i.e. PDF pages cited as printed pages | **0/6**: the check fails when the offset is wrong |
| Two consecutive runs | Byte-identical output (`INDEX.md` `bc5baae4…`, `OUTLINES.md` `ca881f6d…`, `index.json` `cd4f03e3…`) |
| Technique counts against an independent evaluation of the sheet's libraries in Node | 104 Schools, 338 techniques, 72 undescribed: identical |
| Every stored string ≤ 100 characters | Enforced before writing |

The first run failed one known reference because I expected the wrong Advantage's name on Great
Clans p.199: that page is A14 Void Versatility. The reference was corrected; the offset was not.

## Limits: read it as a map, not a checked list

- Everything is found automatically. Headings found in the text rather than in a book's
  bookmarks are marked `*`.
- A short Title Case line of prose can pass for a heading.
- A two-column page can put a heading next to the wrong column's text.
- Entry counts are for sizing, not a catalogue: reprints, duplicates and partial names are
  included.
- The "pages that match" lists for broad words (Ancestors, Kata, Kiho) include every passing
  mention.
- A phase that uses this still reads its pages, and states its own counts after reading them.

## Cost

Built on 30 September 2026 in the same session as the next-phase assessment. Claude Pro readings
were weekly 17% and 5-hour 45% before building; the reading after is recorded in the ledger.
Runtime is local and costs nothing. The allowance is spent only on what enters the conversation.
