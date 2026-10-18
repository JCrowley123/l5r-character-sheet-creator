# Manual checks — the Library, Release 1 (iPhone Safari): the feasibility test

Open the deployed sheet twice first (the first open after a deploy shows the previous build). Have the Core Rulebook
PDF in the Files app. Rows S1–S3 are measurements: write down what the screen says.

| # | Do this | Expect |
|---|---|---|
| L1 | Characters → Library | Empty shelf: + Book, three dotted outlines, "Add the books you own as PDF files." and "Tap + Book to add one." |
| L2 | + Book → Choose PDF → the Core Rulebook PDF | The file name and Choose another; "Recognised as Core Rulebook"; "Matching page numbers…" then "Page numbers matched automatically"; Name on your shelf filled in; a cover; "Kept on this device only. Nothing is uploaded." |
| L3 | Add book | The book on the shelf; the foot reads "Books use [size] on this device" |
| L4 | Tap the book; scroll; type 139, Go | Pages scroll smoothly; the page printed 139 opens (not PDF page 139) |
| L5 | Search → Athletics → tap "Core Rulebook p.139" | "Open Core Rulebook at p.139?"; Open shows printed page 139; "‹ Search" returns to Search |
| L6 | Close Safari fully; open the app twice; Library | The book is still there and opens |
| L7 | Aeroplane mode; open the book | It opens and pages draw (offline) |
| L8 | Add The Book of Fire; open any page with art | The art draws (JPEG 2000 pictures) |
| L9 | ⋯ → Delete → Delete | Asked first; the book is gone; Search's citation is plain text again |
| S1 | Under the storage line after L3 | Is "This browser may clear books if the device runs low on space. They can be added again." shown? (yes = Safari refused persistent storage) |
| S2 | Add the books one at a time, largest last | The storage line after each; whether all 16 (about 1.45 GB) fit, or where the no-room message appears and what it says |
| S3 | After S2, open the largest book and jump far ahead | Pages draw without Safari reloading the tab |

## Release 1.1 (iPhone Safari): pictures, sharpness, Check now

Open the deployed sheet twice first. A cover is made when a book is added, so a book added under Release 1 keeps its
old cover: delete Secrets of the Empire and add it again for M1.

| # | Do this | Expect |
|---|---|---|
| M1 | ⋯ → Delete Secrets of the Empire; + Book → the same PDF → Add book | The cover in Add a book and on the shelf is page 1's picture, not a page of text |
| M2 | Open Secrets of the Empire; scroll to the 8th page (or type 7, Go) | The page's art draws (it can take a few seconds); pages 1 and 8 are not blank where pictures should be |
| M3 | Open The Book of Fire at a page with art far into the book | The art draws (JPEG 2000 pictures throughout) |
| M4 | Open the Core Rulebook at p.139 | The text is crisp at normal size, sharper than Release 1 |
| M5 | Pinch-zoom in on a paragraph; wait a moment | The text sharpens a moment after the zoom stops; zooming back out keeps it readable |
| M6 | Zoom far in and out several times, scrolling between | Pages keep drawing; Safari does not reload the tab |
| M7 | + Book → a PDF that needs a check (the phone's "Core Book(1).pdf") → Check now | The page fills the width; "The side margins, enlarged" shows the printed number readably; Previous and Next change the page and the "PDF page" line |
| M8 | Type the number printed on the page shown → Done → Add book; open the book, type 139, Go | "Page numbers matched automatically" after Done; the page printed 139 opens |

## Release 2a (iPhone Safari, then a desktop browser): the shelf

Open the app, close it, and open it again first (the first open after a deploy shows the previous build).

| # | Steps | Expected |
|---|---|---|
| N1 | Library → Grid | Covers stand on lacquer shelf lines, three a shelf, ⋯ at each cover's top left; tapping a cover opens the book |
| N2 | Close the app fully; open it twice; Library | Still Grid. Then List: cover, title, ⋯ at the far right |
| N3 | ⋯ on any book | "PDF, kept on this device" under the name; exactly Rename, Change cover, Fix page numbers, Delete |
| N4 | Rename → type a new name → Save | The shelf shows the new name; Search's links to that book still open it |
| N5 | ⋯ → Change cover → tap the second page → Done | The shelf cover is now that page |
| N6 | ⋯ → Change cover → Choose a picture… → a photo → drag and pinch inside the frame → Done → Done | The cover is that part of the photo, in the book's shape; still there after closing and reopening the app |
| N7 | + Book → a PDF → Change beside Cover → another page → Done → Add book | The book's cover is the page chosen |
| N8 | ⋯ → Fix page numbers → Next → type the number printed on the page shown → Save; open the book, type that number, Go | That page opens. (Afterwards Fix page numbers again with the correct number, so links stay right) |
| N9 | Search → an entry citing a book not on your shelf | The citation is marked "not in Library"; tapping it explains and offers Add book |
| N10 | Add book from N9 → choose that book's PDF → Add book | "From Search: once added, … opens at p.N." while adding; the book opens at that printed page; ‹ Search returns and the citation is now a link |
| N11 | ⋯ → Delete on a book Search cites | The question adds "Search's links to it show “not in Library” until you add it again."; afterwards its citations are marked |
| N12 | Search → Anachronism (or Imperial Scribe) | "Imperial Histories p.240" (p.67) links to Imperial Histories 1 if it is on the shelf, else is marked "not in Library" |
| N13 | + Book → a scanned PDF that needs a quick check → Check now | The way out reads "Skip: use Fix page numbers later" |
| D1 | Desktop browser (wide window): Library → Grid | Six covers a shelf in the centred column; ⋯ opens a menu beside its button; Rename, Fix page numbers, Change cover open as windows; the crop zooms with the wheel and the slider |
| D2 | Desktop Chrome, optional: DevTools → Application → IndexedDB → l5r-library → files → delete one book's entry; reload; Library | That book shows "File missing" with Add the file again; tapping it explains; the same PDF brings it back with its name, cover and page fix; a different book's PDF is named first ("This PDF is a different book") |
