# Station and Shapeshifter Reference Entries

**Status, 29 October 2026:** built for Release 7b.2 on branch `claude/release-7b2-2026-10-29`; not merged. The release's QA folder is `QA — Release 7b.2 2026-10-29`.

Your ruling R11 (FT-46, 23 October 2026), with your answer of 29 October (Q3: Search only). The World of the Daimyo (Emerald Empire p.279), The Daimyo’s Path (p.279) and Child of Chikushudo (Enemies of the Empire p.244), in our own words from the reading notes, as Search reference entries in their own category, Stations and Shapeshifters, next to Naga and Nezumi. Each gives its type, cost, book and page, and says the sheet does not apply Emerald Empire's Station rules (or the shapeshifter rules); The Daimyo’s Path names its prerequisite. None is in the Advantage list.

## How it is built

One fragment behind one switch, `STATION_REFERENCE_ENABLED = true`: `src/sheet/209.99999999999995-bugfix-station-reference.js` (`SH7`, the three entries as data and one Search source). Test seam: the `station-seam` block in `src/sheet/210-test-seam-and-init.js`.

Three older Search checks list the categories exactly. Each now also expects this category while this switch is on, as they did for 4.5.37's Naga and Nezumi: Phase 14's `S14-CATEGORY-ORDER` and its dependency harness's category count (that harness is no longer in the suite; kept correct), and 14.1's `F141-FACET-SETS` (no filters). 4.5.37's `S437-PARKED-NOT-ADDED`, found by the discovery run, pinned the three as nowhere; while this switch is on it allows them in this category only, and still requires them, and Member of the Chrysanthemum Court, to be in neither list nor any other Search category. Without the switch each expects exactly what it did before.

## Checks

- `qa/station-reference-harness.js`: 10/10 on the candidate, again at 4× CPU.
- Pinned negative variants (`qa/variants.json`, written before the first run): main (baseline) and disabled fail exactly 8 pinned checks; no-note 3. All matched on the first run.
- Removal (`qa/test-removal.py`): 6/6. With the Instigator layer off first, this remover rebuilds `6c0a3f47b5b13c5299090ccc433afa2b951575d458e71e84c4b7ae847a16e21b`, 17,401,083 bytes.
