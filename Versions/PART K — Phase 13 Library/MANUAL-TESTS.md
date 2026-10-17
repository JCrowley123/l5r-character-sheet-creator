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
