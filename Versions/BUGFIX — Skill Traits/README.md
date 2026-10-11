# Skill Traits

Corrects Intimidation to Awareness and the named Perform and Games defaults using the approved Core Rulebook table (pp.136–137, 144). Craft keeps its existing default and gains a reminder that the GM sets the Trait for the particular craft (p.143), on its row, in Skill information and in Search details.

| Skill | Default Trait |
|---|---|
| Intimidation | Awareness |
| Perform: Biwa, Dance, Drums, Flute, Puppeteer, Samisen | Agility |
| Perform: Oratory, Song, Storytelling | Awareness |
| Games: Fortunes & Winds, Letters, Sadane | Awareness |
| Games: Go, Shogi | Intelligence |
| Games: Kemari | Agility |

New rows, rows supplied by schools and loaded/imported rows receive the correction. A blank Trait or the former default is corrected on loading; other saved choices survive. Automatically filled Traits follow supported Skill renames. A Trait explicitly edited during the current session stays chosen during a later rename, even when that choice matches a former default. Saved rows do not record the origin of a Trait choice, so reopening a row whose value equals a former default applies the same correction as an old saved row.

This layer does not reprice Skills, change ranks or the save format, or implement FT-28's roll-time Trait selection. Unlisted subjects retain their existing defaults.

Focused QA passes 38/38 and dependency QA 8/8; the latter covers the intact feature and the fix, School Skill Rows and Search switched off. The baseline negative is 15/38 and all 13 pinned negative variants pass their expected assertions. The complete candidate passes 5,057/5,057; removing Skill Traits retains Print and PDF and passes 5,011/5,011. Historical removal matches the restore hash exactly. Evidence is under `qa/` and `../QA — Small Fix Cycle 2026-10-10/qa/final/summary.json`. Owner acceptance is separate from these automated results.

Restore point: 3,786,934 bytes, SHA-256 `e3b65cb09297eb19a6e5aa7b53fdffffe01f8f9ec72f374b5e7a1bf573842173`. Integrated build: 3,793,709 bytes, SHA-256 `da9c83cb5bff0275ea1d3199f5e3e6ee97ca017cac66246c123bf8e4783c1e91`.

The retained Apply School Skill Rows harness has a conditional, independent oracle for these named subjects. Its original expectations still apply when this fix is off or removed; no checks were removed. The original harness is preserved under `originals/`.

Main merge, live verification and owner acceptance remain pending; the owner checks are in the shared cycle checklist.
