# Release 15a · A07 — The Moon Row

Group G2, unit 3 of 5. This is audit finding A07 (the Moon row, 29 October), ruled under Q1, and approved as mocked up on 7 November 2026 ([G2 mock-ups](<../G2 — Small Layout Fixes/MOCKUP.md>)). Built on 7 November 2026 (Claude), on branch `claude/release-15a-a07`, stacked on A06.

## What changes

Lord Moon's Curse's row comes from the Lord Moon fix (LM7), with the resist-label fix (MR7). It showed three things on three different edges and baselines:

- the severity ("Medium — 5 points") with no label;
- a 13 px full-moon tick, in the carousel's tiny capitals, set 10 px in;
- the roll button.

It now reads, top to bottom, on one left edge:

1. **A labelled severity row:** "SEVERITY Medium — 5 points", then Change (in Manage). The label is in the sheet's shared label style.
2. **The full-moon toggle on its own line:** a 22 px box in a 44 px row, in body text.
3. **"Resist Lord Moon (TN n)"** at 44 px.

The label is generated text, so the summary's own text is unchanged. The tick's wording, its state and what it does, the roll, the moon's extra Void pip and its order, and every rule are the fixes' own and unchanged. Only this row is touched: every other configured row's summary is as before.

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With A07 (this branch) | `9d1ece8c5339c963784f62a43d8f86f1e84eb084debdd8dab0a8af7eb0e72aae` | 17,598,724 |
| A07 removed (A06) | `9ae08de1df78559b52c4326e5364ea33e872a248aeecd3cbbd9383ca0e9d90d0` | 17,595,505 |

## Light checks (7 November)

| Check | Result |
|---|---|
| Own harness `qa/moon-row-harness.js` (26 checks, pinned before the first run) | 26/26 |
| Own harness with A06 removed and A07 kept | 26/26 |
| `qa/test-removal.py` | 10/10 |
| `feature-dependencies.py` | every reference inside A07's own blocks |
| BUGFIX — Moon Curse Full Moon | 17/17 |
| BUGFIX — Moon Resist Label | 5/5 |
| Phase 12.5 (Part K), Disadvantages in Play | 212/212 |

**Two corrections while building, both before any result was used:**

- The first build's comments named the two fixes in marker form. Every remover reads the word "BUGFIX" as another unit's marker, so A07's own removal proof refused (5/10) until the prose was reworded as "the Lord Moon fix (LM7)". This is the CLAUDE.md lesson about marker-shaped prose. The first build was `f9b034bd…0842`.
- The harness's "only the Moon row" check had no other configured row to compare against, so it read an empty list. A configured Paragon was added to its setup.

Qualification follows the owner's review. See [ROLLBACK.md](ROLLBACK.md).
