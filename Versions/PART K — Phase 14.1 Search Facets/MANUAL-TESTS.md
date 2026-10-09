# Phase 14.1 Search Facets — manual tests

On the live site, on the iPhone (Safari and the installed app) and on Windows. Record each as Pass, Fail or Not run.

| # | Steps | Expected |
|---|---|---|
| F1 | Search → Spells | Under "‹ All categories · Spells": three dropdowns (Element, Mastery, Maho). The list is headed Air, then Mastery 1, its spells A to Z, then Mastery 2 … then Earth, Fire, Water, Void, Universal |
| F2 | Element → Fire | "46 entries"; only Fire spells, headed Fire, then Mastery 1 to 6; each Mastery option now shows its Fire count; Clear filters appears |
| F3 | With Fire on, type "the" in the search box | The list narrows as you type, Fire spells only, best match first (no headings while typing); the keyboard stays open |
| F4 | Clear the box; Mastery → 3 | Fire spells of Mastery 3 only (8); the Element options show each Element's Mastery 3 count |
| F5 | Open one of them, then ‹ Back | The same filtered list; the dropdowns still say Fire and Mastery 3 |
| F6 | Scroll the filtered list; tap Sheet; tap Search | The same category, filters, list and place (S11) |
| F7 | Clear filters; then ‹ All categories and open Spells again | Clear filters shows all 260; leaving the category clears its filters |
| F8 | Open each category in turn | Each shows only its own filters: Skills (Trait, Type), Advantages (Type, Cost), Disadvantages (Type, Value), Schools (Clan), Advanced Schools (Clan, Type), Alternate Paths (Technique Rank), School Techniques (School, Rank), Kata (Ring, Mastery), Kiho (Ring, Mastery, Type), Weapons (Skill, Type), Clans & Families (Clan), Ancestors (Clan, Cost) |
| F9 | School Techniques → School: a long name (a monk order) | The dropdown fits the screen; no sideways scroll; the list shows that School's Techniques |
| F10 | On the iPhone, tap any dropdown | The iPhone picker opens; the page does not zoom; the app bar stays at the top, never covered |
| F11 | The home page, and typing across all categories | No filters there (they belong to a category page) |
