# PART K — Phase 13 Library, Releases 1, 1.1, 2a, 2b and 2c: the iPhone feasibility test, its fixes, the shelf, the reader, the contents page

Built from the approved [Library Mock-ups v2](https://claude.ai/artifact/BkdJwpc9xFia9tRvBBBJrU) and the owner's word of
17 October 2026: Release 1 as proposed (14–20 points, stop line 20, cap 22) with the two storage messages. One
removable layer. The app carries no book text: only the owner's own PDFs, copied into the device's own storage.

Release 1 holds: Add a book for one PDF (recognition, page matching, cover), stored on the device; a minimal shelf
(list rows, ⋯ with Delete only, the storage line); the reader (scrolling pages, the printed-page jump); the link from
a Search citation to the printed page (Athletics, Core Rulebook p.139) and back. Release 2 holds the rest (grid,
the full ⋯ menu, Change cover, Chapters, Search in book, not in Library, File missing, desktop layouts).

## Release 2c (18 October 2026): chapters from the printed contents page; the match count

The owner's word (18 October, after 2b's checks R6–R8): **2c as proposed**, 9–13 points, stop line 13, cap 15. The
same layer, fragments and stylesheet; no new file, store or seam.

| Part | What it does |
|---|---|
| Which chapters | `LIB13.chapters(handle, record)`: the PDF's bookmarks, unless they are one level or none or lead nowhere; then the contents page printed near the front (`LIB13.contents`), when it has more levels than the bookmarks (or they are none). The same tree as `LIB13.outline` (three levels at most); `from` says which. Read at run time from the page's text positions; nothing of the book is kept |
| Reading a contents page | The first run of pages among the first 16 with five numbered lines or more. Columns: where three or more right-aligned page numbers end; text left of a column (the margin's page number, running heads) is left out. An entry ends at its column's edge in a page number after dot leaders or a space; pieces split for kerning are joined. A line without a number runs on into the next line of the same size (titles printed over two or three lines); a chapter title whose first two lines start together reads "Book of Earth: General Mechanics"; a chapter title printed with no number ("Book of Void" over its subtitle) takes the next entry's page; other unnumbered lines (the page's own title) are left out. Levels: the chapters' larger type, then each indent step, measured from the column's edge (a column that starts mid-chapter keeps its levels). Numbers running backwards more than one time in five: not a contents page |
| The panel | "From the book’s printed contents page." under the chapters; otherwise as in 2b (the spot followed, each result's part in Search in book) |
| The match count | Search in book ends "212 matches on 66 pages" or "1 match on 1 page" (`searchBook` counts each page's matches) |

**On the owner's own PDFs** (Chrome on the PC, local, nothing kept; `qa/contents-books-check.js`): the five whose
bookmarks are flat, missing or lead nowhere get three levels from their contents pages, entries by level: Core
Rulebook 6 / 61 / 155, Emerald Empire 15 / 56 / 151, The Great Clans 13 / 82 / 138, Strongholds of the Empire 10 /
42 / 101, Naishou Province 7 / 29 / 6; read with the bookmarks in 16–103 ms. The other eleven keep their bookmarks.
The Core's "dice": 212 matches on 66 pages (Acrobat counts 204). Two titles keep their PDF's own text faults: "New
GameMechanics" (The Great Clans: no space in the PDF) and "Writing Your O wn Adventure" (the Core).

**Decisions.** The Core reads "Book of Air: The Emerald Empire" (the part and its chapter, printed in the chapter
type over two lines), then its sections, then theirs: the owner's Book of Air > Rituals of Life > Day-to-Day
Etiquette; the Core's fourth level (under Honor, Glory, & Status, Skill List, …) is not shown, as for bookmarks.
Release 2b's three search checks now read the page count from either wording; 2c's checks pin the new one. A book
whose page numbers are not yet matched keeps its bookmarks (the contents page's printed numbers would lead to the
wrong pages). The chapters are kept in memory per book and page numbering while the app is open, never stored.

**Build:** 6,717,550 bytes, SHA-256 `c9fb1498b0ba4d505a42e8ec7c3de1cf1f93e8f0c1b6b1686e2af5d2260492f1`; growth over
Release 2b 10,596 bytes.

| Check (Release 2c) | Result |
|---|---|
| Focused harness `qa/library-harness.js`, 18 new checks (175 in all), guarded; fixtures `make-test-pdf.py --contents` (new: contents pages in Courier, titles in kerned pieces, margin text, pages of other column widths) | **175/175**; **main (Release 2b) 163/175**: the 12 feature checks fail; the six guards (bookmarks in levels kept, flat bookmarks with no contents page kept, numbers not yet matched, character saves untouched, nothing stored, no page errors or requests) pass, and so do Release 2b's three search checks, now reading the page count from either wording |
| Negative variants `qa/verify-variants.py --jobs=3` | **87/87 pinned** (`qa/pinned-variants.log`): the baseline is `main` at Release 2b (the 12 feature checks); Releases 1–2b's 61 re-pinned against 175 checks; 25 new: the contents page never read (10), flat bookmarks kept (1), bookmarks in levels replaced (1), no run-on lines (8), no colon (5), a colon on every line (4), chapter titles without a number left out (7), any larger type kept (7), columns read across (8), gutter text kept (6), margin numbers kept (6), kerned pieces spaced (1), leaders required (4), numbers out of order accepted (1), levels from the page's edge (1), a fourth level (1), the hint naming bookmarks (4), pages counted as matches (1), "1 matches" (1); 6 undo review fixes (1 each) |
| Dependency harness `qa/library-dependency.js` | **7/7** |
| Removal proof `qa/test-removal.py` | **7/7** on the final build: removed, the layer rebuilds `f39a31cb…` exactly |
| Registry `qa/test-chain.py` | **11/11** |
| Full suite `qa/final-qa.py`, run 1 (18 October 22:22–22:57 UTC, mains power, screen held awake) | **5,693/5,693**; removing this layer through the registry rebuilt `f39a31cb…` (3,935,889 bytes) exactly; retained **5,511/5,511**. Logs `qa/final-2c-run-1/`, `qa/final-2c-run-1.log` |
| Full suite, run 2 (22:57–23:33 UTC) | **5,693/5,693**; removal exact; retained **5,511/5,511**. Logs `qa/final-2c/`, `qa/final-2c-run-2.log` |
| The owner's 16 PDFs, `qa/contents-books-check.js` (local) | The five above from their contents pages, three levels each; the other eleven's bookmarks unchanged (the same counts at every level as `LIB13.outline`) |
| Live, after the merge (`4939a78`, 19 October 02:22 UTC; live 02:25) `qa/verify-live.py` | deployed page (6,723,199 bytes with the installable-app head) and service worker match the build byte for byte; on the downloaded page Search **62/62**, this layer **175/175**, page off **7/7** (`qa/live-2c.log`); Release 1's walk on the live site `qa/live-walk.js` **8/8** (`qa/live/live-walk-2c.log`) |

**Found by the variants.** The first discovery pass caught two variants that failed nothing. Indent steps pooled
across pages went unseen because the fixture's wider page came after the narrower one, which hides the fault; page 4
is now the narrower. A read from a book closed mid-read cannot be made to fail in Chrome (its pages still read), so
that guard has no variant. The second pass: 87/87, then both full runs clean.

**Found while building.** PDF.js joins separately drawn pieces of text on one line into one item and splits Courier
text at its spaces, so a fixture's title "in pieces" was read whole; drawn as one TJ with kerning (as the books set
"W" against its next letter) the pieces stay apart, as on the owner's pages. Titles kept from the books' own text
faults (above) are the PDFs', not the reading's.

## Code review (Release 2c, 18 October 2026)

One helper, read-only, the diff and the approved behaviour. Nothing high; 11 findings (2 medium), 9 fixed and 2 in
part. Six have a check that fails when its fix is undone (a pinned variant each).

| # | Finding | Fix |
|---|---|---|
| 1 | Medium: a title ending in a number set apart from its leaders ("Part 2", then ". . . 33") made a false column edge, and that column's titles lost their numbers | A page number is digits alone or after leaders, with no leaders after it on its line (`digit-title-edges`) |
| 2 | Medium: indent steps were pooled across pages, so a page of wider columns put the other pages' entries a level too deep | Steps are counted among pages whose columns are within 15% of one width (`widths-pooled`) |
| 3 | Low: only the first run of numbered pages was tried (a table of numbers before the contents hid it); an unreadable page ended the scan | Each run is tried until one reads as a contents page; an unreadable page ends only its run (`first-run-only`). Not fixed: a list of tables printed straight after the contents joins its run |
| 4 | Low: an entry past the book's last page was left out but its sections were filed under the entry before | It is left out with everything under it (`dropped-branch-kept`) |
| 5 | Low: slanted (fake italic) text was ignored | Slant up to 0.35 allowed; only rotated text is ignored (no fixture) |
| 6 | Low: text drawn twice (fake bold, shadows) read twice | The same piece within 1.5 pt of the one before is read once (no fixture) |
| 7 | Low: the contents page read again at every open, competing with the first pages' drawing | Kept in memory per book and page numbering (`L13-2C-KEPT-WHILE-OPEN`, `not-kept`), never from a book closed mid-read (no check: a closed book's pages still read in Chrome). Not done: starting the read after the first page is drawn (the Core's takes 0.1 s on the PC; the iPhone check C1 notes it) |
| 8 | Low: a book opened before its page numbers were matched got chapters on the wrong pages | The contents page only once they are matched (`L13-2C-UNMATCHED-NO-CONTENTS`, `unmatched-contents`) |
| 9 | Low: "Reading the bookmarks…" while the contents page is read | "Reading the chapters…" |
| 10 | Low: comments quoting the books' own titles, which ship in the page | Invented examples |
| 11 | Low: the harness did not show that no title is stored, nor that flat bookmarks with no contents page stay | `L13-2C-NOTHING-STORED` (the Library's records and preferences, the page's storage) and `L13-2C-FLAT-NO-CONTENTS` |

## Release 2b (18 October 2026): the reader and desktop

The owner's word (the split of 18 October): **2b, the reader and desktop**, 10–14 points, stop line 14, cap 16, in a
fresh session after 2a's iPhone check. The same layer, fragments and stylesheet; no new file, store or seam.

| Part | What it does |
|---|---|
| The reader's bar (phones) | Chapters, the page jump, Search (the canvas's 5.1). Chapters and Search open one sheet over the page (top at 110 px, a scrim behind): the tabs Chapters / Search in book and ×. Tapping the scrim, ×, or Escape closes the sheet; Escape again closes the book |
| Chapters | The PDF's own bookmarks (`LIB13.outline`), three levels at most, each level opening and closing with its arrow; a title goes to its page (on phones the sheet closes). Printed page numbers. The part being read is highlighted (`aria-current`) with its levels open, and follows the page as you scroll (`LIB13.spot`) |
| Bookmarks in the owner's books | Measured on the 16 PDFs (pypdf, then PDF.js, 18 October): the Core Rulebook's 391 bookmarks are one flat list (so is The Great Clans' 17); Air and Void go four levels deep; Water, Emerald Empire, Naishou, Secrets of the Empire and Sword and Fan put everything under one title bookmark (Water, Secrets and Sword and Fan then go three levels below it); Strongholds has none; Naishou's 48 lead nowhere. So a lone top bookmark holding all the others is skipped (its children are the first level), a fourth level is not shown, and a bookmark with no readable target takes its first child's page or is left out. No bookmarks: "This PDF has no bookmarks, so there are no chapters to show." with a Search in book button; bookmarks that all lead nowhere: "This PDF’s bookmarks do not lead to its pages, …" |
| Search in book | "Find in [book]"; any case, any run of spaces, two letters or more (`LIB13.matcher`); every page holding it, in page order, as "p.N · [the deepest bookmark there]" with the line and the word marked (`LIB13.searchBook`, `snippet`). Results appear as pages are read ("Searching… page N of T"), then "Found on N pages" or "Not found in this book". Each page's text is read once per open book, four pages at a time, and kept (text only) until the book closes; a new query or closing the book stops an older search |
| The word marked | A result opens its printed page with the word marked where it is printed (`LIB13.findOnPage`: the text items' positions, each letter measured in the item's own font family, clipped to the page), brought a third of the way down the screen; on phones the sheet closes, on desktop the panel stays |
| Desktop | The page jump at the top right; no bottom bar; Chapters and Search in book in a 340-px panel on the left that stays open while reading; × ("Hide the panel") hides it and Chapters at the top brings it back. Opened from the Library the panel starts open (the canvas's 5.1 and 5.3); from Search, the page alone with ‹ Search (6.2). Pages are centred and fitted to the window's height: 560 px wide at 1280 × 800 as drawn, up to 820 |

**Decisions.** The canvas draws the Core Rulebook's chapters in three levels; the PDF's own bookmarks are one level,
so the Core shows one long list, scrolled to the spot being read. Search in book matches inside words ("lantern"
finds "lanterns"), as PDF readers do. Android's back gesture (the canvas's Android notes) is not handled: the
Library has no browser-history handling yet, and the owner checks on an iPhone and a laptop.

**On the owner's own PDFs** (Chrome on the PC, local, nothing kept): the Core's bookmarks read in 0.07 s; the first
search of the Core ("dice", 66 pages) took 2.7 s and a second search 1 ms; Secrets of the Empire 1.3 s, Strongholds
1.1 s. An iPhone will be slower (R8 asks the owner to note it).

**Build:** 6,706,954 bytes, SHA-256 `4280930b9f75b2805dc652e1153131f0bccc0e3ba31414997fe9f5cdac7a39eb`; growth over
Release 2a 30,858 bytes.

| Check (Release 2b) | Result |
|---|---|
| Focused harness `qa/library-harness.js`, 35 new checks (157 in all), guarded; fixtures `make-test-pdf.py --outline` (four levels; a lone top bookmark) and `--dead-outline` (new: bookmarks leading nowhere) | **157/157**; **main (Release 2a) 124/157**: the 33 feature checks fail, the two guards (character saves untouched; no page errors or network requests) pass. Phones at 390 px (2× screen) and 320 px; desktop at 1280 × 800 and 1280 × 1000. The marked word is checked against the page's own ink: the mark covers the second of the line's three printed words and neither of the others |
| Negative variants `qa/verify-variants.py --jobs=3` | **62/62 pinned** (`qa/pinned-variants.log`): the baseline is `main` at Release 2a (33, the 2b feature checks); Releases 1–2a's 36 re-pinned against 157 checks; 25 new: three levels shown as two (8), the lone top bookmark kept (1), bookmarks leading nowhere called none (1), the spot never followed (6) or its levels left closed (6), no Chapters in the bar (17), the sheet left open after a chapter (2), the desktop panel closed by one (4), Escape closing the book (15), no Search in book offered (1), case-sensitive search (7), PDF page numbers shown (3), the last page never searched (1), results without their part (2), the word unmarked in the line (2), every letter as wide (2), desktop laid out as a phone (6), desktop pages always 820 px (1), the panel open when opened from Search (1); 6 undo review fixes (1–3 each) |
| Dependency harness `qa/library-dependency.js` | **7/7** |
| Removal proof `qa/test-removal.py` | **7/7** on the final build: removed, the layer rebuilds `f39a31cb…` exactly |
| Registry `qa/test-chain.py` | **11/11** |
| Full suite `qa/final-qa.py`, run 1 (18 October 13:06–13:41 UTC, mains power, screen held awake) | **5,675/5,675**, all 118 leaves run; removing this layer through the registry rebuilt `f39a31cb…` (3,935,889 bytes) exactly; retained **5,511/5,511**. Logs `qa/final-2b-run-1/`, `qa/final-2b-run-1.log` |
| Full suite, run 2 (13:41–14:16 UTC) | **5,675/5,675**, all 118 leaves run; removal exact; retained **5,511/5,511**. Logs `qa/final-2b/`, `qa/final-2b-run-2.log` |
| Live, after the merge (`dba5594`, 18 October 17:06 UTC) `qa/verify-live.py` | deployed page (6,712,603 bytes with the installable-app head) and service worker match the build byte for byte; on the downloaded page Search **62/62**, this layer **157/157**, page off **7/7** (`qa/live-2b.log`); Release 1's walk on the live site `qa/live-walk.js` **8/8** (`qa/live/live-walk-2b.log`) |
| The owner's checks (18 October; iPhone Safari, Edge on the laptop), R1–R11 and W1–W4 in MANUAL-TESTS | **14/15 Pass**, and Release 2a's D1 Pass. R5 and D2 not run (their steps were unclear; rewritten). Notes: the Core's flat bookmarks lack the printed contents page's levels; Strongholds has a printed contents page but no bookmarks; Acrobat counts 204 "dice" where the list shows 66 pages (on the owner's PDF those pages hold 212 matches) |

**Found while building.** PDF.js 6 has no `convertToViewportRectangle`, so the mark converts its two corners.
The first pinned run failed one variant with seven of Release 2a's shelf checks besides its own two: 2a's harness
adds books A–D in a tight loop, and two books added in the same millisecond take their shelf order at random (B
before A), so the checks acted on the wrong book. Not this release's code; it can happen on `main`. **Fix in the
harness:** 5 ms between those adds; no check or expectation changed. Then 62/62 and both full runs clean.

## Code review (Release 2b, 18 October 2026)

One helper, read-only, the diff and the approved behaviour. Nothing high; 8 findings, 7 fixed and 1 in part. Six
have a check that fails when its fix is undone (a pinned variant each).

| # | Finding | Fix |
|---|---|---|
| 1 | Medium: on desktop, focus fell to the page behind the reader: the header's Chapters hid itself while focused, and Chapters redrawn removed the row just clicked; Escape then did nothing | Opening the panel focuses the search box or the Chapters tab; a redrawn row gets its focus back (`L13-2B-DESKTOP-FOCUS`) |
| 2 | Low-medium: the phone sheet (a modal dialog) opened with focus left under the scrim | Focus moves into the sheet and Tab stays inside it (`L13-2B-SHEET-FOCUS`) |
| 3 | Low: Escape anywhere in the desktop panel kept the book open; on a phone it closed the sheet but the browser still cleared the search | Only a search box with text keeps the book open on desktop; the sheet's Escape keeps the search (`L13-2B-DESKTOP-ESCAPE-IN-PANEL`, `L13-2B-ESCAPE-KEEPS-SEARCH`) |
| 4 | Low: a book closed or failing while its first page was measured could leave listeners, or show "Searching…" for ever | Checked after the measure; a book that cannot be opened says so in Chapters and Search (no browser check can stage it) |
| 5 | Low: on iPhones the keyboard can cover the sheet's lower results; Chapters left the hidden search box focused | The search box is blurred on leaving its tab and by the search key. Sizing the sheet to the keyboard is left to the owner's iPhone check (R8): not testable here |
| 6 | Low: "Hida's" did not find "Hida’s" | Curly quotes and long dashes match their plain forms (`LIB13.fold`, `L13-2B-SEARCH-QUOTES`) |
| 7 | Low: one bookmark listed out of order held every later page; a third-level bookmark without a target was dropped despite having children | The spot is the highest page at or before the page read (`L13-2B-SPOT-ORDER`); the children's pages are read at every level |
| 8 | Low: tabs without `aria-controls` or arrow keys; "Searching… page N" announced every few pages; the arrow's label repeated its state | Added; the page count is for the eye only; the arrow reads "Sections of …" |

## Release 2a (18 October 2026): the shelf

The owner's word: Release 2 in two, each merged and checked on the iPhone on its own. **2a, the shelf** (this; 11–15
points, stop line 15, cap 17) and **2b, the reader and desktop** (Chapters, Search in book, the side panel; 10–14,
in a fresh session). The same layer, the same two fragments and stylesheet.

| Part | What it does |
|---|---|
| List and grid | The bar's List / Grid switch (hidden while the shelf is empty). List is the default. Grid: covers on lacquer shelf lines, ⋯ at each cover's top left, a cover tapped opens the book; as many a shelf as fit, 3 on phones (320–412 px) and 6 on desktop. The choice is kept in the Library's own database (version 2 adds a `prefs` store), never in localStorage |
| The ⋯ menu | Rename, Change cover, Fix page numbers ("Only if a link opens the wrong page"), Delete ("Removes the book from this device"), under the cover, the name and "PDF, kept on this device". A sheet from the bottom on phones; on desktop a menu beside its button |
| Rename | "Name on your shelf"; "Only the name on your shelf changes. Search's links still open this book." Links go by the recognised book, so they still open it |
| Fix page numbers | Corrections only: the page, both side margins enlarged, Previous / Next ("PDF page N of T"), "What page number is printed here?", "The other pages follow from this one."; the answer counts from the page shown. A full-screen panel on phones, a window on desktop. Check now and Fix page numbers share one page picker |
| Change cover | One panel from Add a book (Change beside the cover) and from the menu: the first 8 pages (12 on desktop), drawn one after another, the current one marked; or **Choose a picture…** (the device's own picker), then a crop in a frame of the book's shape (its first page; 98:134 if the file is missing): drag; pinch on phones; the wheel and a Zoom slider on desktop. The picture is kept as a 300-pixel-wide JPEG in the `covers` store; the record says `coverKind` page or picture |
| Check now | Its way out reads "Skip: use Fix page numbers later" (Release 1's "Skip for now" was a stand-in) |
| Delete | Adds "Search's links to it show “not in Library” until you add it again." for a recognised book with no other copy on the shelf (Release 1 held this back) |
| Not in Library | Citations of known books not on the shelf are buttons marked "not in Library" (`.l13-nil-cite`; `.l13-cite` stays the openable link). Tapping: "[Book] is not in your Library" / "Add the PDF of your copy, and this link opens it at p.N." / Not now, Add book. Add a book then opens with "From Search: once added, [Book] opens at p.N."; once the PDF is read, if it is another book (or not recognised) the line says the link will not open it. Added as that book, it opens at the printed page, after the page numbers are matched ("[Book] added to your Library"). Citations already on screen follow every shelf change |
| File missing | A book whose stored PDF is gone (no `files` record), or could not be read when opened (flagged `fileMissing`), stays on the shelf: grey cover, "File missing", **Add the file again** (one picker, opened from the tap itself). Tapping it explains (the canvas's 7.2 words). The same PDF (same size) is used at once, keeping name, cover, recognised book and page fix ("[Book] is back on your shelf"); another PDF recognised as a different book, or with another page count, is named first ("This PDF is a different book"); used anyway, the shelf entry stays the book it was and only a different page count is matched again. A flagged book whose copy reads again is no longer missing. A Search link to a missing book explains instead of opening. When a browser clears all of the site's data the shelf goes too, as the character saves would: nothing is left to mark |
| Imperial Histories | 14 entries cite "Imperial Histories p.N" with no volume, on 10 pages (67, 69, 97, 123, 147, 148, 149, 214, 240, 306). On the owner's own two PDFs (pypdf, 18 October; both print page = PDF page − 1) every one of those names is printed on that page of **volume 1** (Moto Death Priest as "Moto … Death Priest" on p.240) and none in volume 2. Those pages link to Imperial Histories 1; any other page with no volume stays plain. Search's own text is unchanged |

**Decisions.** The desktop's Library column is 728 px (the Characters screen's), so the canvas's 124-px desktop covers
fit four a shelf; desktop keeps the phones' 98-px covers with 16-px gaps, which gives six. Fix page numbers shows the
enlarged margins as Check now does (the canvas draws the page alone; Release 1.1's iPhone check found the bare page
unreadable). The database's version bump closes any older tab's connection; that tab shows the storage message
until reloaded.

**Build:** 6,676,096 bytes, SHA-256 `3a7d005cf6626d7e089a1780f2240fe0b5a2b247ad89457ddb06c27bd2b6bd5f`; growth over
Release 1.1 43,628 bytes.

| Check (Release 2a) | Result |
|---|---|
| Focused harness `qa/library-harness.js`, 47 new checks (122 in all), guarded | **122/122**; **main (Release 1.1) 77/122**: all 45 feature checks fail, the two guards (character saves untouched; no page errors or network requests) pass. Phone checks at 390 and 320 px; desktop checks at 1280 px |
| Negative variants `qa/verify-variants.py` (`--jobs=3` runs three at once, new; `--only=`) | **37/37 pinned** (`qa/pinned-variants.log`, 21 minutes): the baseline is now `main` at Release 1.1 (45, the 2a feature checks); Releases 1 and 1.1's 16 re-pinned against 122 checks (deleted-book-linked and add-waits-matching now also fail 2a checks); 14 new: the view not kept (1) or kept in the saves' storage (2), six covers on phones (1), the menu a sheet on desktop (1), Fix counted from the first page (3), the picture squeezed (2), the crop square (3), citations left plain (11), the From line blind to another book (1), no relink (1), Delete without the sentence (1), a missing copy never found (5), any PDF taken back (2), Imperial Histories unlinked (2); 6 undo each review fix (1–2 each) |
| Dependency harness `qa/library-dependency.js` | **7/7** |
| Removal proof `qa/test-removal.py` | **7/7** on the final build: removed, the layer rebuilds `f39a31cb…` exactly |
| Registry `qa/test-chain.py` | **11/11** |
| Older harnesses that read Search or the Characters screen (`qa/run-leaves.py` 40 80 83 85–88 93–96 99 100 103 108–110 112 114 115) | 16 passed at once. The three references harnesses (14.2, 14.3a, 14.3b) and Imperial Histories volumes failed: "not in Library" was text inside Search's citation, and the marked citation could not wrap at 320 and 390 px. Fixed in this layer, no harness changed: the mark is drawn by the stylesheet on an empty, aria-hidden element (the button's label says it), and the citation wraps. Then 30/30, 32/32, 40/40, 20/20 |
| Full suite `qa/final-qa.py`, run 2 (18 October 03:29–04:05 UTC, mains power, screen held awake) | **5,640/5,640**, all 118 leaves fresh; removing this layer through the registry rebuilt `f39a31cb…` (3,935,889 bytes) exactly; retained **5,511/5,511**. Logs `qa/final-2a/`, `qa/final-2a-run-2.log` |
| Live, after the merge (`6f55cd4`, 18 October 09:31 UTC) `qa/verify-live.py` | deployed page (6,681,745 bytes with the installable-app head) and service worker match the build byte for byte; on the downloaded page Search **62/62**, this layer **122/122**, page off **7/7**; Release 1's walk on the live site `qa/live-walk.js` **8/8** (`qa/live/live-walk-2a.log`; it does not reach the shelf's new parts) |
| Full suite, run 1 (02:50–03:09 UTC) | **5,639/5,640**: Printed Weapon Columns' `PWC-SCREEN-UNCHANGED` (below). Logs `qa/final-2a-run-1/`, `qa/final-2a-run-1.log` |

**Why run 1 failed, and the fix.** Release 2a does not touch the weapons table or printing. The check reads the
table's geometry at 390 and 1280 px before, during and after printing; its first 390-px reading caught the table
mid-layout (the table 0 × 0, its cells about 1,600 px aside), so it differed from the other two. Alone, the harness
failed 2 runs in 10 on `main` (Release 1.1) and 3 in 9 on the candidate; waiting for its own `settle()` helper still
failed 1 in 10. **Fix in that harness:** each width is measured once its geometry stops changing (two readings
250 ms apart agree, within 3 s); the check and its expectation are unchanged. Then 12/12 on the candidate and on
`main`, and a probe sheet that changes the cells' padding on screen while printing still fails it at both widths.
The pre-change copy is `originals/printed-weapon-columns-harness.before-2a.js`.

## Code review (Release 2a, 18 October 2026)

One helper, read-only, the diff and the approved behaviour. 7 findings, all verified and fixed; six have a check that
fails when its fix is undone (a pinned variant each).

| # | Finding | Fix |
|---|---|---|
| 1 | High: a book added from Search opened the reader before the page numbers were matched (Add book does not wait), so the link opened the PDF page | The link waits for the late numbers, then opens the printed page (`L13-2A-NIL-ADD-EARLY`) |
| 2 | Medium: the late page match replaced numbers set meanwhile with Fix page numbers | The late write applies only while the book is still "matching" (`L13-2A-LATE-MATCH-KEEPS-FIX`) |
| 3 | Medium-low: Add the file again with the same PDF, where recognition differs from the book chosen when adding, asked "a different book", and Use it changed the book and dropped the page fix | The same size is the same file; Use it keeps the shelf entry's book and re-matches only another page count (`L13-2A-REFILE-SAME-FILE`) |
| 4 | Low-medium: zooming the crop before the picture loaded made its position NaN and the cover blank | Drag and zoom wait for the picture (`L13-2A-CROP-EARLY-ZOOM`) |
| 5 | Low: Change beside the cover stayed open while the book was being saved | Locked with Add and Cancel (`L13-2A-COVER-LOCKED-WHILE-SAVING`) |
| 6 | Low: one failed read left "File missing" for good | A flagged book is read again on each shelf render (`L13-2A-MISSING-RECHECKED`) |
| 7 | Low: an open refused while blocked could later succeed and leave an unused connection | That connection is closed at once (defensive; no browser check can stage a blocked open) |

## Release 1.1 (17 October 2026): the fixes from the owner's iPhone check

The owner's word: Release 1.1, stop line 9 points, cap 11. The same layer, four fixes:

| Fix | What changed |
|---|---|
| JPEG 2000 pictures in Safari | Safari cannot compile `openjpeg.wasm`: it uses relaxed SIMD (8 `i32x4.relaxed_trunc_f32x4_s`, 6 `f32x4.relaxed_madd`). PDF.js then imports `openjpeg_nowasm_fallback.js`, which Release 1 did not carry, so pictures stayed blank. That file is now carried verbatim (pdfjs-dist 6.4.299, 445,781 bytes, SHA-256 `9047b34b…d23e`, from the same package as the other PDF.js files, same licences) as a fourth text block. `classicWorker()` wraps it and turns PDF.js's one `import(…_noWasmFilename…)` into a lookup of that copy, for JPEG 2000 only (JBIG2 still fails as before); it throws if either file's shape changes. `LIB13.wasmUsable()` asks the browser with `WebAssembly.validate` of the carried module itself (not a sample module, so any feature the browser lacks counts); where the answer is no, PDF.js is told `useWasm: false`. If that answer were ever wrong, PDF.js's own failure path still reaches the carried copy |
| Sharpness | The reader draws at the screen's pixel ratio up to 3 (was 2), eight pages within 36 million pixels. When a pinch zoom settles (the visual viewport, 250 ms), the pages in view are redrawn at ratio × zoom into fresh canvases, swapped in when drawn: each canvas under 16 million pixels (iOS refuses 16.7 million) and the zoomed pages within 32 million. Zooming out, or a zoomed page leaving the view, returns to the normal ratio |
| Check now | The page fills the sheet's width at the screen's ratio. Under it, both side margins are shown enlarged (about 2.4×) halfway down, where all 16 books print their numbers (measured with pypdf on 12 pages of each: 10–13% in from the outer edge, exactly halfway down). Previous and Next show another page; the answer counts from the page shown. The sheet scrolls on a short screen |
| Review finding 12 | A shelf render checks again that it is still the latest after reading its covers, so an overlapping render no longer adds a second list |

Build **6,632,468 bytes**, SHA-256 `25ea5d3b829c5d4e127f77225d64408b2c6ead3e27ac7804d8877e30e6be4989`: growth over
Release 1 453,836 bytes (the fallback is 445,781 of them).

**On the owner's own Secrets of the Empire** (Chrome on the PC, local, nothing kept; `useWasm` true, then the wasm made
uncompilable as in Safari): pages 1 and 8 draw the same with the fallback as with the wasm, and page 1 becomes the
cover. The fallback is slower: page 1 in 2.8 s (wasm 0.4 s), page 8 in 5.5 s (wasm 1.4 s). On the iPhone, pages with
JPEG 2000 pictures can take a few seconds to draw; a zoom redraw decodes them again.

| Check (Release 1.1) | Result |
|---|---|
| Focused harness `qa/library-harness.js`, 16 new checks (75 in all; fixtures from `make-test-pdf.py --jpx` and `--mid-numbers`) | **75/75**; **main (Release 1) 60/75**: all 15 feature checks fail, the clean-run guard passes (`qa/negative/baseline.log`). The new checks run in a second browser at iPhone size and 3×, where the carried wasm is made into a module the browser rejects (as Safari rejects relaxed SIMD), and in a third that tells PDF.js to try the wasm anyway. Pinch zoom is Chrome's page scale, which the visual viewport reports |
| Negative variants `qa/verify-variants.py` | **17/17 pinned**: Release 1's eight (the baseline now `main` at Release 1) and nine new: the fallback not found (3), the wasm always tried (1), ratio 2 (5), no zoom redraw (2), no canvas limit (1), Check now drawn 150 px wide (1), the margins not cropped (2), the answer counted from the first page (1), the shelf race (1) |
| Removal proof `qa/test-removal.py` | **7/7**: the layer, its new fragment and file included, removed rebuilds `f39a31cb…` exactly |
| Registry `qa/test-chain.py` | **11/11** |
| Older harnesses that read the changed surfaces (`qa/touching-run-1.1.log`) | page off 7/7, Characters 70/70, App Bar 25/25, Search dependency 14/14, Search facets 44/44 |
| Full suite `qa/final-qa.py`, run 2 (17 October 23:23–23:56 UTC, mains power, screen held awake), after the App Bar fix below | **5,593/5,593**, all 118 leaves fresh (16.8 min); removing this layer through the registry rebuilt `f39a31cb…` (3,935,889 bytes) exactly; retained **5,511/5,511** (15.7 min). Logs `qa/final-1.1/`, `qa/final-1.1-run-2.log` |
| Live, after the merge (`ef00634`, 17 October 23:59 UTC) `qa/verify-live.py` | deployed page (6,638,117 bytes with the installable-app head) and service worker match the build byte for byte; on the downloaded page Search **62/62**, this layer **75/75**, page off **7/7**; the walk on the live site `qa/live-walk.js` **8/8** (`qa/live/live-walk-1.1.log`) |
| The owner's iPhone checks (iPhone 16e, Safari, 18 October), M1–M8 in MANUAL-TESTS | **8/8 Pass**: Secrets of the Empire's cover is page 1's picture and its page 8 art draws; the Book of Fire's art draws; pages sharper, and sharper again after a pinch zoom; Check now readable, with Previous/Next; the page jump right after Check now. Screenshots in the checklist doc |
| Full suite, run 1 (17 October 22:03–22:20 UTC, mains power, screen held awake) | **5,590/5,593**: Phase 11.3's App Bar harness failed `AB-WIDTH-320`, `-375` and `-390` (its click on the bar's Search timed out); every other leaf passed, this layer's 75 and 7 included. Logs `qa/final-1.1-run-1.log` and `qa/final-1.1-run-1/` |

**Why run 1 failed, and the fix.** Release 1.1 does not touch the App Bar. The harness passed alone (4 of 4), so an
instrumented copy (full error, the page's state, every zoom change with the input events before it) was run under CPU
load until it failed: 1 run in about 30, **on `main` (Release 1) as well as the candidate**. Each time the emulated
phone page had been left **zoomed 1.936×**, so Playwright's tap on Search landed on Characters ("intercepts pointer
events"). The zoom came with no input event, at the moment the harness resized the page to 320 px straight after
`AB-PRINT-HIDDEN`'s switch to print and back; its size is the print layout's width over the screen's (755 ÷ 390). The
app has no zoom code (only the viewport tag). A probe doing just print → screen → resize leaves Chrome's phone
emulation zoomed exactly 1.9359 on both builds; a 300 ms wait before the resize avoids it, which is why the harness
usually passed. **Fix in Phase 11.3's harness:** the print check now runs last, after the width checks and the return
to 390 px, so no resize follows print emulation. All 25 checks and their assertions are unchanged; only the order
moved. The pre-change copy is `originals/appbar-harness.before-1.1.js`. The patched harness passes 25/25 on the
candidate and on `main`, and 20 runs under the same CPU load showed no zoom after the page loaded
(`qa/appbar-zoom-evidence.log`; probes `qa/probe-print-resize.js`, `qa/probe-print-zoom.js`).

**Found while building:** the harness's first ink counter read a canvas just sized (transparent until drawn) as dark,
so one wait passed before the page was drawn and a correct Check now failed twice; the counter now counts painted
pixels only and also reports whether the canvas is painted. No code review this release.

## Measurement (17 October 2026, before building)

- **The owner's 16 PDFs.** The PDF title metadata names no book in any of them (empty, "untitled" or a publisher's
  file name such as "L5R_00_Introduction.indd"), so recognition never reads it: page count plus the most specific
  title phrase on the first six pages (13 books name themselves on PDF page 2; Core on page 4; Emerald Empire on page
  5). Page counts are unique for 10 books; the phrase decides the shared counts (202, 218, 312). Shop buyer lines on
  early pages are ignored and never stored.
- **Page numbers.** 9 books have PDF page labels; 8 agree with the print, Unexpected Allies 2's are one off. Rule:
  labels only when printed numbers read from sampled pages confirm them (any page edge, within 15%: the books print
  numbers in the outer margin); otherwise the offset the printed numbers agree on; "Check now" only when neither is
  confident. `qa/real-books-check.js` (local, the owner's files): **16/16 recognised and matched**, none needs Check now.
- **Renderer: PDF.js 6.4.299**, legacy build, verbatim, with `openjpeg.wasm` for the JPEG 2000 pictures
  in 7 of the books. It sits in the one HTML as three `text/plain` blocks, so the service worker's cached page already
  holds it offline; it starts only when a PDF is opened. The worker runs as a classic worker from a Blob URL (Chrome
  refuses module workers from Blob URLs on `file://`; `classicWorker()` swaps the two `import.meta.url` uses and drops
  the one export, and throws if that shape ever changes). PDFs are read in ranges from the stored Blob
  (`PDFDataRangeTransport` over `Blob.slice`), never whole. **Growth: 2,242,743 bytes** (3,935,889 → 6,178,632).
- **Storage.** No IndexedDB was in use; character saves are localStorage. The Library is its own IndexedDB database
  `l5r-library` (stores `books`, `files`, `covers`); a book, its PDF and its cover are written in one transaction.
  `navigator.storage.persist()` is asked; when it is refused, the shelf says so. Safari's real quota and eviction for
  about 1.45 GB is measured on the owner's iPhone (MANUAL-TESTS, S1–S3).

## Structure

| Location | Role |
|---|---|
| `src/sheet/209.99999999991-feat-library.js` | `LIB13`, no UI: the known books, `recognise`, `citations`, `pdfPageFor`/`printedFor`, storage (`add`, `update`, `remove`, `list`, `usage`, `bookFor`, `persist`), the engine (`engine`, `load`, `inspect`, `matchPages`, `checkPage`, `draw`, `makeCover`); since 2b `outline`, `spot`, `fold`, `matcher`, `snippet`, `searchBook`, `findOnPage`. Switch `LIBRARY_ENABLED` |
| `src/sheet/209.99999999992-feat-library-page.js` | `LIBPAGE13`, the replaceable UI: shelf, ⋯ Delete, Add a book with Check now, the reader, the Search link. `// UI hook:` wraps of `CL11.build` and `SEARCHPAGE14.render`. Switch `LIBRARY_PAGE_ENABLED` |
| `src/css/59.9999892-feat-library.css` | `l13-` classes only |
| `src/vendor/` | PDF.js (verbatim), `openjpeg.wasm` as base64, `openjpeg_nowasm_fallback.js` (Release 1.1), five boundary fragments, `licenses/` |
| `src/sheet/210-test-seam-and-init.js` | `library-seam`: `LIB13`, `LIBPAGE13` and both switches |

## For the owner's review (Release 1 wording)

- Check now's way out reads **"Skip for now"** (the canvas: skip and use Fix page numbers later; Fix page numbers
  arrives in Release 2).
- Delete asks "Delete [book]?" with "This removes the book and its cover from this device." The canvas's sentence
  about citations becoming "not in Library" waits for Release 2, which brings that marking.

## Verification (17 October 2026)

| Check | Result |
|---|---|
| Focused harness `qa/library-harness.js` (synthetic PDFs from `qa/make-test-pdf.py`) | **59/59** on the candidate; **0/59 on `main`** (stops at the seam: no Library). On the pre-review build (`96998d51…`) it stops after 52 checks with 5 failures, the review's checks: Add a book not locked while saving, two quick opens leaving a reader that cannot be closed (which also blocks the rest of the run), duplicate shelf rows, "Great Clans p.N", drawn pages not freed. Four of the nine review checks pass there: the worker and stale-read races the review traced by reading PDF.js do not happen in Chrome on this machine; they stay as guards |
| Dependency harness `qa/library-dependency.js` | **7/7** (two premise checks on the build as shipped; five with the page switched off: the logic answers, the placeholder stays, Search is plain, no page errors); **0/7 on `main`** |
| Negative variants `qa/verify-variants.py` | **8/8 pinned**: baseline (stops at the seam), logic off and page off (stop at the seam), Library records in the character saves' storage (2), a citation opening the PDF page instead of the printed page (3), recognition from the title alone (2, then stops), Add book waiting for the page matching (2), a deleted book's citation still linked (1) |
| Removal proof `qa/test-removal.py` | **7/7**: rebuilds `main` exactly (3,935,889 bytes, `f39a31cb…`); refuses a changed vendor file |
| Removal-chain registry `qa/test-chain.py` | **11/11** (the page fragment added to its `companions`) |
| Code review (one helper, read-only, the layer and the approved behaviour) | 12 findings: 9 fixed, 1 partly fixed, 2 recorded (below) |
| Full suite `qa/final-qa.py`, run 2 (17 October 17:49–18:23 UTC, mains power, screen held awake) | **5,577/5,577**, all 118 leaves fresh (17.0 min); removing this layer through the registry rebuilt `main` exactly; retained **5,511/5,511** (16.1 min). Logs in `qa/final/` |
| Live, after the merge (`79890fe`, 17 October 18:27 UTC) `qa/verify-live.py` | deployed page (6,184,281 bytes with the installable-app head) and service worker match the build byte for byte; on the downloaded page Search **62/62**, this layer **59/59**, page off **7/7**. Evidence in `qa/live/` |
| The checklist walked headlessly on the live site, `qa/live-walk.js` (18:31 UTC) | **8/8**: L1–L5, L7 (offline, through the service worker) and L9 with a test PDF; persistent storage refused there, so the S1 note showed. `qa/live/live-walk.log` |
| Full suite, run 1 (17:28–17:45 UTC) | 5,573/5,577: three older harnesses still expected the Library tab's placeholder or Search's unwrapped render (see "Retained test changes"); stopped before the retained stage. Logs in `qa/final-run-1/` |

Candidate: **6,178,632 bytes**, SHA-256 `f2b388cf888721b03a5d034c8726dbc1fe09cf3647bfd843959a9977e2366592` (growth over
`main` 2,242,743 bytes).

`qa/current-suite-runner.js` chains Phase 4.5.36's suite (5,511) and adds 122 + 7: **5,640** (Release 1: 59 + 7).

## Code review (17 October 2026)

| # | Finding | Outcome |
|---|---|---|
| 1 | High: one PDF.js worker shared by every document, but each load let PDF.js own it, so closing one book could tear it down under the next load | Fixed: one `PDFWorker` made on the port and passed to every load; PDF.js leaves a passed worker alone (checked in its source) |
| 2 | High: two quick taps on a book left a second, unclosable reader | Fixed: only the latest open builds a reader; closing cancels a pending open |
| 3 | Medium-high: decoded images kept after a page was drawn, so memory grew while scrolling | Fixed: `page.cleanup()` after each draw |
| 4 | Medium: a superseded or cancelled read could write into the next dialog or throw, and kept its document | Fixed: each step checks its read is still current and lets the document go |
| 5 | Medium: Add a book could be cancelled, renamed or tapped again while saving (late page match lost, duplicate book) | Fixed: Cancel, Escape, Choose another and Add are locked while saving |
| 6 | Medium: Search citations written "Great Clans p.N" and "Imperial Histories p.N" never linked | "Great Clans" fixed (alias). "Imperial Histories p.N" names no volume, so which book it means needs the books: recorded for Release 2 |
| 7 | Medium-low: JBIG2 and CCITT images (black-and-white scans) cannot be drawn: only the JPEG 2000 decoder is carried | Recorded: none of the owner's 16 books uses JBIG2 (desk check; CCITT not measured); carrying its decoder would grow the build. Revisit if a page draws blank |
| 8 | Low-medium: the storage connection was kept for ever | Fixed: closed on a version change, reopened after the browser drops it |
| 9 | Low: an unreadable file or a stalled worker left a spinner for ever | Fixed: a failed read or a 60-second stall ends the load with the error message; a failed worker is replaced |
| 10 | Low: every page took page 1's shape | Fixed: each page takes its own shape once drawn |
| 11 | Low: page labels used without printed-number confirmation when sampled pages have no text (scans) | Recorded, unchanged: the kickoff's rule is "labels first; ask only if neither is confident (scans)"; with no text, the labels are the only evidence |
| 12 | Low: a failed delete was silent; two renders at once could duplicate rows | Partly fixed: a message; two renders started together give one list. A render started while another is still reading covers could still add a second list (found after the merge): fixed in Release 1.1 |

## Retained test changes

Release 2a: `BUGFIX — Printed Weapon Columns/qa/printed-weapon-columns-harness.js` measures `PWC-SCREEN-UNCHANGED`'s
geometry once it stops changing (see "Why run 1 failed" in Release 2a); every check and total (17) is unchanged.
Releases 1 and 1.1:

While the Library page is present and enabled, three checks in three earlier harnesses observe it, in the patterns
those harnesses already use for later releases; removed or switched off, the original expectations apply verbatim.
No check is dropped and every total is unchanged (70, 25 and 14).

| Harness | Check | While the Library page is present |
|---|---|---|
| Phase 11 `qa/characters-harness.js` | `CL-TABS` | the Library tab holds the shelf instead of the "Phase 13" placeholder (the term Phase 14 added for the Search tab) |
| Phase 11.3 `qa/appbar-harness.js` | `AB-TO-LIBRARY` | the same, reached from the app bar |
| Phase 14.1 `qa/dependency-harness.js` | `F141-DEP-FACET-PAGE-OFF`, `F141-DEP-FACETS-OFF` | `LIBRARY_PAGE_ENABLED` joins `LATER_RENDER_WRAPPERS` (the Search Focus fix's term): the Library also wraps Search's render, so the facets-off variants switch it off to observe Phase 14's own function |

Pre-change copies are in `originals/`. **How they were found:** full run 1 (17 October, 17:28–17:45 UTC, logs
`qa/final-run-1/`) failed these three leaves (69/70, 24/25, 12/14; 5,573/5,577) and stopped before the retained stage.
The cause was this layer's intended change, not a fault in the sheet: the three harnesses had not been run with the
layer before the suite, the lesson already in `CLAUDE.md`. With the corrections the three leaves pass on the
candidate (70/70, 25/25, 14/14) and on `main` (the same), `qa/touching-run.log`; the other leaves that read the
Characters screen, the app bar or Search had all passed in run 1.

- `QA — Removal Chain Registry/removal_chain.py`: this release's entry at the end of `CHAIN`.
- `QA — Removal Chain Registry/qa/test-chain.py`: `'PART K — Phase 13 Library'` in `companions` (its second
  script fragment, as Search, App Bar and Facets have).
