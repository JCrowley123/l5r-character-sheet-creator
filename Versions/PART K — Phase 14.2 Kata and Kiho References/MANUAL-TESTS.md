# Kata and Kiho references — iPhone checks

Use Safari or the installed app. Open the [live app](https://l5r-character-sheet-creator.pages.dev/) and refresh before testing. If it still shows the previous version, close and reopen it once after the refresh. Record the tested date, device and iOS version. All results below are **Not run** until reported by you; automated browser checks do not fill them in.

Release to test: **14 October 2026 — Kata and Kiho references**, main commit **`be0a741`**. The deployed page was verified at 07:43 UTC; service-worker build `5b871fbb3eb22d2d`.

The new automated reference checks passed 50/50. Separate existing checks flagged a desktop Search Escape-key issue (FT-34, also reproduced on the previous version) and a filter timing threshold. The six checks below verify the new citations and phone navigation.

Tested URL/build: Not run

Date / device / iOS / Safari or installed app: Not run

| # | Steps | Expected | Result |
|---|---|---|---|
| R1 | Search → Kata. Search for **Striking as Air**; open it, then tap Back. | List and detail both show **Core Rulebook p.259**. Back keeps the search text and matching result. | Not run |
| R2 | In Kata, clear the text and search for **Indomitable Warrior Style**; open it. | List and detail both show **Core Rulebook p.260**. The long name and citation fit without sideways scrolling. | Not run |
| R3 | Search → Kiho. Search for **Air Fist** and open it. | List and detail both show **Core Rulebook p.262**. Description and Ring/Mastery details remain readable. | Not run |
| R4 | In Kiho, clear the text, choose Ring **Water**, and type **Dharma**. Open **Dharma Technique**, then tap Back. | List and detail show **Book of Water p.189**. Back keeps Ring **Water**, the text **Dharma** and the same result. | Not run |
| R5 | Clear the text and filters. Choose Ring **Void**, type **Knowledge from Within**, open it, then tap Back. | List and detail show **Book of Void p.192**. Back keeps Ring **Void**, the search text and the same result. | Not run |
| R6 | From that filtered list, tap Sheet and then Search. | The same Kiho category, Ring filter and search text return. Citations remain readable in portrait, and browsing has not changed the character. | Not run |

For a failure, record the row number, what appeared and whether it happened in Safari or the installed app. Page numbers above are the books' printed pages, not the PDF viewer's page numbers.
