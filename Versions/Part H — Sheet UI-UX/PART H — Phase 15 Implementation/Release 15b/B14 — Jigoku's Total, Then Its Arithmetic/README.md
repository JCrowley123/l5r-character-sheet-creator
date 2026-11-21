# Release 15b · B14 — Jigoku's Total, Then Its Arithmetic

Group 1 (totals and their breakdowns), unit 3.

- **The finding:** the audit's B14, "Separate Jigoku's total from its calculation" (the A01–A16 device round's Lost wording; Q8).
- **The owner's approval:** approved as shown on 20 November 2026 ("Other than the points raised above I am happy with the mock ups"). Its short sum stays even though A14's preview row lost its own, because Jigoku has no level name to stand for the figure (round 2). See [MOCKUP.md](<../G1 — Totals and Their Breakdowns/MOCKUP.md>).
- **Built:** 21 November 2026 (Claude), on branch `claude/release-15b-b14`, stacked on `claude/release-15b-b04`.

## What changes

Touch of the Spirit Realms (Jigoku), Feature 4.5.24 (Part I), says its total first, then how it is made:

| Where | Today | Now |
|---|---|---|
| Roll preview, Lost | +8 to total — Lost: twice Taint Rank 4 | +8 to total — Taint Rank 4 × 2 (Lost) |
| Roll preview, not Lost | +4 to total — Taint Rank 4 | unchanged |
| The card, Lost | Adding 8 (Taint Rank 4, doubled: Lost). | Adding +8 — Taint Rank 4 × 2 (Lost). |
| The card, not Lost | Adding 4 (Taint Rank 4). | Adding +4 — Taint Rank 4. |

**Unchanged:**
- the figures;
- which rolls get it (attack rolls, and Skill and Trait rolls with a Physical Trait);
- the Lost tick and its label;
- the no-Taint flag;
- Cursed by the Realm (Jigoku);
- print;
- the save file.

Words only.

## How it is built

`src/sheet/209.9999999999999999995-feat-jigoku-total-first.js` holds `JK15` and the switch `JIGOKU_TOTAL_FIRST_ENABLED`. It wraps two of Feature 4.5.24's own methods, each calling the one it replaced first:

- **`TR4524.modifiers`** rewords the Jigoku modifier's note. That note is what the preview shows after the dash.
- **`TR4524.refresh`** rewords the card's line.

Both read Feature 4.5.24's own text, and leave any text they do not recognise as it is. There is no stylesheet. There is one guarded seam block, `jigoku-total-first-seam`.

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With B14 (this branch, on B04) | `65b81f74b2dd82cea0ea334fb92c0da7936ae33b01e9008a01d5533df4ef5939` | 17,741,065 |
| B14 removed (B04) | `56f51ab38339f13e8f64bc417ec3bef0b6c768bbfd226194943ab64800e5d156` | 17,737,482 |

## Light checks (21 November)

| Check | Result |
|---|---|
| Own harness `qa/jigoku-total-harness.js` (10 checks, pinned before the first run) | 10/10 on the first run (`qa/run-1.log`) |
| `qa/test-removal.py` | 10/10 (`qa/removal.log`) |
| The harnesses of the layers it touches (Feature 4.5.24 and the other reference and roll entries of Phase 4.5, Cursed by the Realm, the roll declarations, Smart Roll Preview, Explain This Roll, Phase 12.5's Play controls, A16, A19, A20, and the fixes that read the preview) | 28/28 harnesses, 2,174/2,174 (`G1 — Totals and Their Breakdowns/qa/light/b14-touched-run.log`) |
| Feature 4.5.24's harness, conditional on B14, on the build with B14 removed (B04) | 50/50 (`G1 — Totals and Their Breakdowns/qa/light/b14-removed-4524-run.log`) |
| The dependency check (`G1 — Totals and Their Breakdowns/qa/dependencies.py`) | every reference inside B14's own blocks (`G1 — Totals and Their Breakdowns/qa/dependencies-a14-b04-b14.log`) |

## Not covered by the harness

- A native iPhone and Safari. In the device round, open a Defense roll with a Lost Jigoku character on a real phone.
