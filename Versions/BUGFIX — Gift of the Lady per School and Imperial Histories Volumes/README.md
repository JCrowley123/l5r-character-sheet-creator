# BUGFIX — Gift of the Lady per School and Imperial Histories Volumes

Built 16 October 2026 from the owner's rulings of that day on Phase 14.3b's possible updates (14.3b `SOURCES.md`).

## What changed

**1. The Gift of the Lady, once per School.** The name belongs to two Techniques: Doji Courtier Rank 5 (Core Rulebook
p.111) and The Hitomi Kikage Zumi Order [Monk] Rank 1 (Imperial Histories 1 p.215). Search keyed School Techniques by
name, so it showed one record, "Doji Courtier, Rank 5 and 1 more", cited to p.111 but carrying the monk's tattoo text,
and the School filter listed that record under both Schools. Doji Courtier's own Search entry also showed the monk's
text at Rank 5. BUGFIX — Technique Name Clashes fixed this on the sheet (2 October) but Search read the shared text.

| Search, School Techniques | Before | Now |
|---|---|---|
| Records named The Gift of the Lady | 1 | **2**: "Doji Courtier, Rank 5" (Core Rulebook p.111) and "The Hitomi Kikage Zumi Order [Monk], Rank 1" (Imperial Histories 1 p.215) |
| Text | the monk's, on both | each School's own (Technique Name Clashes' table) |
| School filter | one record under both Schools | each School lists its own record |
| School Technique records | 348 | 349 |

**2. Imperial Histories volumes.** The owner checked both pages in the book.

| School | Was | Now |
|---|---|---|
| Hiruma Scout [Bushi] | Imperial Histories p.147 (no outfit specified) | **Imperial Histories 1 p.147** (no outfit specified) |
| Yotsu Bushi School (Heroes of Rokugan) [Bushi] | Imperial Histories pp.276–277; Tiger Clan … | **Imperial Histories 1 p.276**; Tiger Clan … (rest kept) |
| Utaku Mounted Infantry [Bushi] | Imperial Histories 2 p.168 | unchanged (already right) |

The source also ends each of the two Schools' Technique texts (4.7.2's `install()` appends it), so their 10 Techniques
now end "(Imperial Histories 1 p.147 …)" and "(Imperial Histories 1 p.276; …)".

## What still works

- **Saved characters.** Nothing in a save is rewritten. A Hiruma Scout or Yotsu Bushi Technique row saved before this fix
  keeps the text it was given; a row added after it gets the new citation.
- **Search ids.** The Doji record keeps `techniques:the-gift-of-the-lady`; the monk's is `techniques:the-gift-of-the-lady-2`.
- **Every other record.** Only a name whose Schools differ in text or page is split; no other School Technique has two
  Schools today (`GIH-ONE-MORE-RECORD`), and the dependency harness compares every other record and Technique text.

## Structure

| Location | Block or file | Role |
|---|---|---|
| `src/sheet/209.9999992-feat-missing-basic-schools.js` | `imperial-histories-volumes`, after `MISSING_BASIC_SCHOOL_DATA` | Switch `GIFT_IH_FIX_ENABLED` and the two sources, set before `install()` |
| `src/sheet/209.9999999998-bugfix-gift-of-the-lady.js` | the fragment | `GIFTIH.ownText(name, school)` (a School's own text from `TECHNAMES.BY_SCHOOL`, while Technique Name Clashes is on) and `GIFTIH.split(records, rows)` (one record per text and page); data only |
| `src/sheet/209.99999991-feat-search-index.js` | `search-technique-own-text`, in `schoolTechniques()` | A School's own text and its page tail for its entries |
| `src/sheet/209.99999991-feat-search-index.js` | `search-technique-per-school`, in the School Techniques reader | Splits the merged records |
| `src/sheet/210-test-seam-and-init.js` | `gift-ih-seam` | Exposes `GIFTIH` and the switch |

The switch sits in 4.7.2's block because that fragment loads first (the fragment reads it guarded). The Search part is
a fragment so the registry removes it before 14.3b in every mode, as Spell Names' is.

## Verification (16 October 2026)

| Check | Result |
|---|---|
| Focused harness `qa/gift-ih-harness.js` | **20/20** on the candidate; **6/20 on `main`**: the 14 fix checks fail, the 6 guards pass |
| Negative variants `qa/verify-variants.py` | **8/8 pinned**: baseline (14), disabled (14), missing own-text hook (3), missing split hook (7), volumes not applied (3), never split (8), split ignoring pages (1), inherited names (1) |
| Dependency harness | **16/16**: control, switch off, fragment absent, Search off, 14.3b off, Technique Name Clashes off, 4.7.2 off; every other record and Technique text unchanged |
| Retained test changes (below) | Search **62/62**, 14.3b **40/40** and **26/26** on the candidate, on `main` and with this fix off |
| Neighbours on the candidate | Search dependency 94/94; Facets 44/44 and 14/14; 14.2 30/30 and 20/20; 14.3a 32/32 and 23/23; 9.1 19/19 and 23/23; Spell Names 16/16 and 12/12; Search Keystroke Speed 7/7; Search Focus 12/12 and 15/15; Technique Name Clashes 26/26; 4.7.2 38/38 and 189/189 |
| Removal proof `qa/test-removal.py` | **6/6**: rebuilds `main` exactly (3,907,003 bytes, `4b69c763…`) |
| Removal-chain registry | **11/11** |
| Ownership scan | Exit 1 for the two END lines that hand ownership back to Search (comment-only, as in 14.3a, 14.3b and Spell Names) |

Candidate: **3,912,042 bytes**, SHA-256 `820443923217991eeafa8907ff6ac82bdcaa522b6b04b2f9134096820ff09777`.

## Retained test changes

While `GIFT_IH_FIX_ENABLED` is on: Phase 14's `qa/search-harness.js` counts a name with its own text for each School
(Technique Name Clashes' table) once per School, and reads each School's entries against that School's own text;
Phase 14.3b's `qa/references-harness.js` cites each School Technique record by its own School's page and reads the
School's own text, and `REF1432-SHARED-TECHNIQUE` expects the two pages as two records; 14.3b's
`qa/dependency-harness.js` expects one more cited record (the second Gift of the Lady) and, with 14.3b off, one more
record and note (Doji's own text carries its page). Off or removed, the original expectations apply. No check is
dropped. Pre-change copies are in `originals/` (`dependency-harness.js` is 14.3b's).

## Possible update for the owner

About 30 other lines in the source cite "Imperial Histories p.N" with no volume: about ten Alternate Paths (Brotherhood
Spy, Gozoku Agent, Tortoise Guard and others), Search's pages for Imperial Scribe and Anachronism, some roll entries and
a few comments. They were outside this ruling and are unchanged.

**Not verified here:** iPhone Safari. See `MANUAL-TESTS.md`.

`qa/current-suite-runner.js` chains Spell Names' suite (5,430) and adds 20 + 16: **5,466**.
