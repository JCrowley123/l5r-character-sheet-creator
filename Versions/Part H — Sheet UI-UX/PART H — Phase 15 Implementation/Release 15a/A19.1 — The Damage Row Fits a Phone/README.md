# Release 15a · A19.1 — The Damage Row Fits a Phone

Group G6 (new functions), unit 3. Found at G6's device round (19 November 2026): on the Combat page's Void card, the row "Reduce damage by 10" opens wrapped its Apply button onto four lines on a phone and ran Cancel past the card's edge. The live app does the same; A19 did not cause it. The owner chose "New unit A19.1 in G6 (Recommended)" and approved the mock-up: "Approve as shown (Recommended)" ([MOCKUP-A19.1.md](<../G6 — New Functions/MOCKUP-A19.1.md>)). Built on 19 November 2026 (Claude), on branch `claude/release-15a-a19-1`, stacked on `claude/release-15a-a20`.

## What changes

- The damage row may wrap onto more lines; each of its two buttons keeps its words on one line.
- At 640 px wide or less (a phone), "Damage announced" and its box stay on the first line, and "Reduce by 10 & take Wounds" and "Cancel" each take the row's full width beneath, inside the card.
- On a laptop the row stays one line, exactly as before.
- Unchanged: the words, the buttons, what they do, A19's Undo line, and print (the row is in the card's print-hidden panel). Screen only; nothing is saved.

## How it is built

- `src/sheet/209.9999999999999999992-feat-damage-row-fit.js` — `DR15` and the switch `DAMAGE_ROW_FIT_ENABLED`; marks the page with `body.dr15-on`.
- `src/css/1149-damage-row-fit.css` — the layout, under `body.dr15-on`.
- One guarded seam block, `damage-row-fit-seam`.

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With A19.1 (this branch, on A20) | `921f3ac9e5c61bde84068a20dd5cc4ab014367e8b1b7930438cf24b4a7686150` | 17,718,601 |
| A19.1 removed (A20 on A19 revision 1) | `fe8422cd2d6c82d5a2919955979dfacde7bc7cccd27add857485995c8946b75f` | 17,716,268 |

## Light checks (19 November)

| Check | Result |
|---|---|
| Own harness `qa/damage-row-harness.js` (9 checks pinned before the first run) | 9/9 on the first run (`qa/run-1.log`) |
| Own harness on the live app (the unit absent) | 4/9: the laptop's one-line row, Cancel, and no page errors at either size (`qa/run-on-a08-live.log`) |
| `qa/test-removal.py` | 10/10 (`qa/removal.log`) |
| `feature-dependencies.py` (G6 `qa/dependencies.py`) | every reference inside this unit's own block (`G6 — New Functions/qa/dependencies-a19.1.log`) |
| The harnesses of the layers it touches (Play Mode Combat, the wound bar, Play and Manage, Quick Access, the Void and Initiative entries, Weakness and Hotei's Curse and its fix, the Void card's reasons, the moon curse and the Moon Row) | 10/10 harnesses, 284/284 (`G6 — New Functions/qa/light/a19.1-touched-run.log`) |
| A19's and A20's harnesses on this build | 25/25 and 18/18 |

## Not covered by the harness

- A native iPhone and Safari: the device round should open the row on a real phone and on the laptop.
