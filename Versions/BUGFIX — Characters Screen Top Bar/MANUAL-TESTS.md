# BUGFIX — Characters Screen Top Bar — manual tests

On the live site, on the iPhone (Safari and the installed app). A headless browser cannot show this bug: Chromium
keeps the old sticky bar pinned. Record each as Pass, Fail or Not run.

| # | Steps | Expected |
|---|---|---|
| T1 | Open the Characters screen; tap Search; scroll the Search home to the bottom and back | The bar (‹ Sheet · Characters · Library · Search) never moves or gets cut off |
| T2 | Open Skills, then Alternate Paths; scroll each to the bottom | The bar stays at the top the whole time |
| T3 | Search an Ancestor, open it, scroll it; tap the search box first, then a result | The bar stays; the keyboard closes when the entry opens |
| T4 | Open a short entry (a kiho, a spell, a weapon) | Unchanged from before: the bar is there |
| T5 | Characters tab with several characters; Library tab | The list scrolls under the bar; the Library placeholder shows; a row's ⋯ menu still opens |
