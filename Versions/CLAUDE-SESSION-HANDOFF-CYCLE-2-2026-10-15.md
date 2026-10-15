# Claude — Cycle 2 handoff (15 October 2026, 14:25 UTC)

Continue Cycle 2 from `CLAUDE-SESSION-KICKOFF-CYCLE-2-2026-10-15.md` (approved scope; read it first, by section). This
session did the book reading and saved its results; the build, tests and records are still to do. It stopped because
the 5-hour window reached 93% at 14:18 UTC (resets 17:00 UTC) with the context at 43%.

**Owner's instruction for this cycle (15 October):** make the full suite pass **first time** rather than re-running it:
look at why it fails under load, without weakening any check.

## State

- Branch `claude/cycle-2-2026-10-15` from `main` `a40ab39`; build unchanged: 3,843,210 bytes, `14711d4f…`,
  `recombine.py --verify` byte-identical. No sheet source changed yet.
- Meter: week 54% at 13:52 UTC (start), 57% at 14:18 UTC; 5-hour 69% → 93%. Cycle cost so far about **3 weekly points**.
- Saved data (page numbers and own-words text only; no book text):
  - `PART K — Phase 14.3b School, Technique, Clan and Family References/qa/expected-pages.json`: **103 Schools, 277
    technique rows (276 Search records), 25 Clans, 68 Families**, each with book, printed page and PDF page. Technique
    rows carry `school` and `rank`; Family rows carry `clan`; `printed` where the book's title differs.
  - `Part H — Sheet UI-UX/PART H — Phase 9.1 School Flavour Text/qa/school-flavour.json`: **all 105 Schools**, one or two
    sentences each in Claude's own words, with book and page. Read it for tone before building; edit freely.
- Scratch tools are gone with the old session. To re-read a page: `pdftotext -enc UTF-8` (xpdf 4.06 at
  `C:/Program Files/Git/mingw64/bin/pdftotext.exe`; it has no crop options, so split `-layout` output at the column
  gutter) into a scratch folder; printed page = PDF − 3 (Core), same (Unexpected Allies 2), else PDF − 1.

## Reading results to put in SOURCES.md (Layer A) and the end-of-cycle report

- **Entry-start page** = the School's own first heading (in Core, the descriptive heading, which can sit a page before
  the stat block: Akodo p.116, Asako Loremaster p.124, Kitsu p.117, Mirumoto p.112, Iuchi p.130, Heichi p.217 and
  others). Clans: the Clan's character-creation section (Core pp.105–131 and 211–227), not the Empire chapter
  (pp.56–70). Families: their `THE X FAMILY: +1 TRAIT` heading.
- **Second oracle: Secrets of the Empire pp.248–249, "School Index"** (every human School to its date, with book and
  page). It agrees with the entry pages except: Akodo 117 and Mirumoto 113 (it cites the stat block); Lion Elite
  Spearmen "Naishou Province 8" (the page prints 7); Utaku Mounted Infantry "Imperial Histories 2 310" (the School is
  on p.168); Moto Death Priest 240 and Shiba Artisan EE 122 match the start pages used. Compare all of them in a
  script before SOURCES.md; the Spider and Imperial lists were not read.
- **Multi-book entries:** none found for the 103 Schools: every other-book heading hit was an NPC stat line ("SORU:
  BAYUSHI BUSHI 2") or a mention. Unchecked: a full-text hit for Bayushi Bushi's "The Way of the Scorpion" on IH1
  p.152. Same-name entries that are different things: Chuda Shugenja (Spider, Core p.213) vs Chuda Shugenja [Snake]
  (the original School, Core p.224); Families Toritaka (Crab p.106 / Falcon p.218), Kitsune (Mantis p.120 / Fox
  p.219), Chuda (Spider p.211 / Snake p.224), Tsi (Oriole Core p.222 / Ronin IH1 p.275); so family lookups need the
  Clan as well as the name.
- **Printed titles that differ** (kept as the sheet has them): Lion Elite Spearmen R1 "The Way of Magari-Yaritjutsu"
  (book's spelling); Mirumoto Taoist Swordsman R5 "Balance in Nothingness"; Miya Herald R4 "Blessings of the Emperor";
  Togashi Family printed as "The Togashi Order". Shiba Artisan R2 is hyphenated across lines ("SINCER-ITY").
- **Possible updates / data findings for the owner:** "The Gift of the Lady" is both Doji Courtier R5 (Core p.111) and
  Hitomi Kikage Zumi R1 (IH1 p.215; the book does use that name); Search merges them into one Technique record, cited
  to its first School (Core p.111), while each School's own detail shows its own page. Hiruma Scout and Yotsu Bushi
  already carry sources reading "Imperial Histories …" without the volume: both are Imperial Histories 1 (pp.147 and
  276–277). Their 10 Techniques had no page and are in the oracle.
- **Layer B page note:** Fudoist Order's text comes from the Fudoism Heresy section (IH2 p.286); its School heading is
  p.287 (Layer A's citation).
- **Phase 9's earlier desk notes:** `Part H — Sheet UI-UX/PART H — Phase 9 Clan-Themed Look/DESKTOP-HANDOFF — School
  Flavour Text.md` lists open decisions from an earlier session. Read it before building Layer B and say how each is
  settled (the owner has since ruled: all 105 Schools, own words, Search detail and School info panel).

## Design decided (build to this)

**Layer A** — marker `PART K PHASE 14.3.2` (a letter after the number reads as Phase 14), interface `SCHOOLREF1432`
(not `SEARCHREF143…`: 14.3a's remover matches that text), switch `SEARCH_REFERENCES_1432_ENABLED`, fragment
`src/sheet/209.9999999995-feat-school-clan-references.js` generated from the oracle like 14.3a's `gen-lookup.py`.
- `source(category, name, context)`: `schools` (name), `techniques` (name, School), `clans` ("Crab Clan"),
  `families` (name, Clan). `recordSource(rec)` for Search records. Normalise like 14.3a.
- Hook 1, `209.99999991-feat-search-index.js` `build()`, after `const rec = {…};`:
  `if(!rec.source && typeof SCHOOLREF1432 !== 'undefined') rec.source = SCHOOLREF1432.recordSource(rec);` (Schools,
  Clans, Families; Schools that already have a source keep it).
- Hook 2, same file, `schoolTechniques(s)`, after `const t = …;`: fill `t.source` from `source('techniques', name,
  s.name)` when empty (`t` is a fresh object). This gives the Techniques category and each School detail its pages.
- Seam block in `210-test-seam-and-init.js`; `SEARCH14.invalidate()` at fragment load, as 14.3a.
- The remover deletes whole marked blocks only, so every hook must be added lines; END lines in the index hand back
  with ` // PART K PHASE 14 (continued)`.

**Layer B** — marker `PART H PHASE 9.1`, interface `SCHOOLLORE9` (declare with `var`: Hook 2 runs at 080's load,
before the fragment, and `typeof` on a `const` in its dead zone throws), switch `SCHOOL_FLAVOUR_ENABLED`, fragment
`src/sheet/209.9999999996-feat-school-flavour.js` generated from `school-flavour.json`; `entry(name)` →
`{text, book, page, source}` or null.
- Hook 1, index schools record (multi-line literal): a `text:` line between the first line and `fields:`.
- Hook 2, `080-identity-build-ui.js` `renderSchoolInfo()`, at the end: append the text and its page to `#cfs_schoolInfo`
  (escape it; `// UI hook:` marker). `renderSchoolInfo` is a top-level function in the sheet's single IIFE, so the
  fragment calls it once at load (guarded) to repaint the panel shown before the data loaded.

**Layer C** — `BUGFIX — Spell Names Match the Books`, marker `BUGFIX SPELLNAMES`, no fragment: registry entry with
`present_text` (precedent: the two carousel fixes).
- Block in `040-lib-kata-kiho-spells.js` right after `SPELL_LIBRARY`: a former-names table and a loop renaming the two
  entries before anything reads them ("Enticing Dance of the Flame", Core p.182; "Fill with Emptiness", Core p.196).
  Removal is block deletion, so the original lines stay untouched.
- Saved characters: Spells are Technique rows that store the name as text plus element and Mastery captured when added
  (`090-table-rows-weapons.js` `makeEntry`), so old saves load and still cast; keep their saved text unchanged.
- Block in `hasSpellScroll()` (`090`): a scroll under the former name still unlocks the renamed Spell.
- Block in the Search spells record, after 14.3a's source block: object spread adding a "Formerly …" tag (searchable)
  and the 14.3a page looked up by the former name when the new name has none.

## Retained test changes needed (same pattern as 14.3a: only while the new layer's switch is on)

- `PART K — Phase 14 Search/qa/search-harness.js` S14-RECORDS: Schools expect `s.source || A's page`; technique notes
  expect `src || A's page`; `noPage` includes `clans`, so Clans and Families need A's oracle (key Families by Clan, not
  name); Spells need C's rename table for the 14.3a lookup. Keep the original expectations when the layers are off.
- `PART K — Phase 14.3a …/qa/references-harness.js`: COVERAGE, LIST-PAGES, DETAIL-PAGES and RETITLED-ENTRIES assume
  the old Spell names; translate through C's table while C is on.
- Grep every harness for `cfs_schoolInfo`, `.text[0]` on Schools and `Fill the Emptiness` before committing a layer.

## Under-load risk to check before the full suite (the owner's instruction)

Layer B adds about 105 sentences and Layer A adds ~470 citations to Search's haystack. Re-measure the keystroke
checks (`S14-KEYSTROKE-UNDER-50MS`, `F141-UI-KEYSTROKE-UNDER-50MS`, 4× CPU) on a quiet machine before the full suite;
Cycle 1's speed fix left 18–28 ms and 30–41 ms. Check `tasklist | grep -ci chrome` against a baseline first. Then run
the suite once, in the background, as the kickoff says.

## Not started

D06 Weakness / Hotei reading (INDEX: Weakness Core p.162, Book of Void p.164, UA2 pp.15, 17; Hotei: Core p.148, 154,
162, 352; Naishou pp.23, 88; Emerald Empire p.179; Secrets p.170); the Library mock-ups (optional); records.
