# Release 15a · A19 — Undo the Last Void Spend

Group G6 (new functions), unit 1 of 2. FT-24 as the owner ruled it on 9 October 2026, included by Q7 on 1 November 2026; approved as mocked up on 19 November 2026 ([the group's mock-ups](<../G6 — New Functions/MOCKUP.md>): "Approve as shown (Recommended)"). Built on 19 November 2026 (Claude), on branch `claude/release-15a-a19`, stacked on the group's records branch `claude/release-15a-g6` (from `main` at `1ebf26b4`, A08 live). The owner said: "start the G6 build, A19 first".

## What changes

- **An Undo line on the Void card after a card spend.** Under the card's buttons (after the reasons line, when there is one), an Undo button and what was spent, for example "Spent: +1k1 on your next roll. Touch of the Void's Willpower roll comes after that roll; Undo drops it." It covers the card's six spends (+1k1; an Unskilled roll made Skilled; +10 TN; +10 Initiative; damage reduction, from its row's Apply; Kiho) and Hotei's Curse's two-point button.
- **Undo puts back exactly what that spend changed, once:** the Void Points; the armed one-roll effect, including one it replaced; the current Round's Void spend and +10 TN; the skirmish Initiative flag; the Wounds a damage reduction added. A Touch of the Void Willpower roll still waiting for that spend is dropped. The line then reads "Undone: the Void Point is back; +1k1 cleared; no Touch of the Void roll." (or the like) with no button, and the status line says the same.
- **Undo goes away** at any roll the sheet makes (the result window opening; a preview cancelled is not a roll), at Next Round and Reset, at another card spend (which takes its place), when a character is opened or the sheet reset, and on any other change to those values (a pip tap, a Void Point spent in a roll preview). A roll preview briefly arms and clears the one-roll effects while it works out its offers; nothing is judged while one is open.
- **Not covered:** Void Points spent outside the card (the roll preview's own Void option, Lost Love, Dark Paragon's Determination, an Ancestor's gift, pip taps). The roll preview's refund (RF7) and History (AL71) are untouched; History records the spend and the Undo as ordinary changes. Nothing new is saved.

## Revision 1 (19 November 2026, after the owner's device round)

The owner's device round passed every check but one, on both devices: check 8, damage reduction with Touch of the Void. Its Willpower roll opens straight after the spend; the owner rolled it, and A19 then ended Undo, as approved ("any roll the sheet makes"). The owner chose "Keep Undo (Recommended)": Touch of the Void's own Willpower roll is part of the spend, not the next roll the spend is used on, so it no longer ends Undo.

- While Touch of the Void's roll is under way (`VI4533.check`, wrapped by property), its result window does not end Undo. The line then reads, for example, "Spent: damage reduced by 10; 15 Wounds taken. Touch of the Void's Willpower roll was made; after Undo it no longer counts."
- After Undo: "Undone: the Void Point is back; the 15 Wounds taken back. The Touch of the Void roll made for it no longer counts: tell the GM if it left you Dazed." The sheet does not track Dazed.
- Every other roll still ends Undo, including one made after Touch of the Void's roll.
- Build `bd035d20fc2d26c887e69faf0dae420aa670cf633000103e06a16e55840a8f8d`, 17,702,871 bytes. The record of the first build stays below.
- Records: the owner's results and choices in [G6 DEVICE-CHECKS.md](<../G6 — New Functions/DEVICE-CHECKS.md>).

| Check (revision 1) | Result |
|---|---|
| Own harness, 25 checks (22 + 3 pinned for the revision before its first run: the save rolled keeps Undo on the phone, after damage reduction, and on the laptop, after +10 TN; another roll after it still ends Undo) | 25/25 on the first run (`qa/rev1-run-1.log`) |
| `qa/test-removal.py` | 10/10 (`qa/rev1-removal.log`) |
| `feature-dependencies.py` | every reference inside this unit's own block (`qa/rev1-dependencies.log`) |
| The same 26 touched harnesses | 26/26, 1,226/1,226 (`G6 — New Functions/qa/light/a19-rev1-touched-run.log`) |

## How it is built

- `src/sheet/209.999999999999999999-feat-void-spend-undo.js` — `VU15` and the switch `VOID_SPEND_UNDO_ENABLED`. Click listeners on the card's button holder and the damage row, capture before a button's own handler and bubble after it, record the values just before and after a spend; a spend is recorded only when the Void Points went down. Undo writes the earlier values back and redraws through the sheet's own functions. `renderVoidPanel` and `renderVoidPips` are wrapped so the line follows every redraw of the card and the pips (every recalc and every pip tap); `applyData` and `resetToBaseline` are wrapped to end it. Observers on the roll preview (judge again when it closes) and on the result window (a roll ends it).
- `src/css/1147-void-spend-undo.css` — the line's look: the card's own ghost button and a gold-edged box, as mocked up.
- One guarded seam block, `void-spend-undo-seam`.

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With A19, revision 1 (this branch) | `bd035d20fc2d26c887e69faf0dae420aa670cf633000103e06a16e55840a8f8d` | 17,702,871 |
| With A19, first build (19 November, before the device round) | `0ee228674c0110313e83d0a19e2b8800abd4fd2c376ca07f3e3d13d37ef25dc9` | 17,701,397 |
| A19 removed (A08, G5 as live) | `6d47849b1dcb5aa8ac4140b1895d1f0d713426092530e183ff87c3fc4d7c44b1` | 17,685,928 |

## Light checks (19 November)

| Check | Result |
|---|---|
| Own harness `qa/void-spend-undo-harness.js` (22 checks pinned before the first run) | 22/22 on the final build (`qa/run-5-final-build.log`). Earlier runs, kept: run 1 stopped on a script error before any check (re-opening the character left Play, so the Combat page's Reset was not on screen; `qa/run-1-script-error.log`); run 2 13/22, all nine failures one oracle fault (the line's words were read by stripping a leading "Undo", which also cut "Undone" to "ne"; every value in those checks was as specified; `qa/run-2-oracle-fault.log`); run 3 22/22 on `e8c91afc…b249`; run 4 22/22 on this build before the harness's Undo tap was made tolerant of a missing button (`qa/run-4-final-build-before-tolerant-undo.log`). Same ids and expected values throughout. |
| Own harness on A08 as live (the unit absent) | 4/22: the four that hold either way (no line before a spend; no line for a roll preview's own Void spend; no page errors at either size). `qa/run-on-a08.log`; the first attempt stopped at the first Undo tap (`qa/run-on-a08-stopped.log`), which is why that tap became tolerant. |
| `qa/test-removal.py` | 10/10 (`qa/removal.log`) |
| `feature-dependencies.py` (G6 `qa/dependencies.py`) | every reference inside this unit's own block (`G6 — New Functions/qa/dependencies-a19.log`) |
| The harnesses of the layers it touches, from G5's candidate list (the Void card's neighbours: Touch of the Void and the other Void and Initiative entries, Hotei's Curse and its auto-spend fix, the Void card's reasons, Void Versatility, the Void Raise fix, the moon curse and the Moon Row, Dark Paragon, the Ancestors and their two fixes, Checks and Conditions, the wound entries and wound bar, the roll pipeline, roll preview, its refund and its top, Explain This Roll, Quick Access, Play Mode Combat, Play and Manage, the Characters list, the save format, and A08) | 26/26 harnesses, 1,226/1,226 checks. Log: `G6 — New Functions/qa/light/a19-touched-run.log` |

**Found while building, before the harness's first run:** a probe of the first build showed Undo vanishing as soon as Touch of the Void's Willpower roll opened after a +10 TN spend. The roll preview arms +1k1 for a moment while it works out its Void offers, which the unit took for a real change. Fix: nothing is judged while a roll preview is open, and the line is judged again when it closes. Builds before the fix: `6f44a426…a4a4` and `a0fa53ca…4e0c` (never committed); also a wording fix to Hotei's label (`e8c91afc…b249`) and a comment reworded so the remover does not take "Part C Feature 4" for a foreign marker.

## Not covered by the harness

- A native iPhone and Safari: the harness taps on Chromium's touch emulation. The device round should spend by mistake on a real phone, press Undo, and check the line is easy to find under the buttons.
- Lost Love, Dark Paragon and the Ancestor's gifts spend Void outside the card; the harness checks only the roll preview's own spend among them (no line).
