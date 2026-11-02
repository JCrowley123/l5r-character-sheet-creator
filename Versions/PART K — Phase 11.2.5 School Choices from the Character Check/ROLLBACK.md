# Surgical removal — Release 8b / SC8

Remove only this layer with `qa/remove-phase.py <external scratch Phase 0 tree>`. It refuses the live tree, its ancestors and descendants, links, hardlinks, ambiguous blocks and foreign ownership markers. The shared seam block is `PART K PHASE 11.2.5 BEGIN school-choices-seam` through `END SC8 school-choices-seam` in `src/sheet/210-test-seam-and-init.js`.

Owned fragments are `src/sheet/209.9999999999999991-feat-school-choices.js` and `src/css/1125-school-choices.css`. Remove their manifest entries and the seam block; recompute the manifest hash and rebuild. Do not restore whole shared-file snapshots. Registration is at the end of `QA — Removal Chain Registry/removal_chain.py`.

The predecessor is Release 8a.1: SHA-256 `a25ace916f29d5c1647731db0ab2d7e97bd23bbdd6312c9631bd9d4ba416c7f2`, 17,459,752 bytes. The first current-tree removal test restored it exactly and passed all six safety/restoration checks. Both final retained runs passed 6,600/6,600 checks on the restored predecessor, with fresh execution and exact hash/byte restoration in each run (completed 2 November 2026). The current candidate remained unchanged at SHA-256 `1eb9e017636829a941a8d9b0916fc2b0d0c81eefc97e2b8fd7d222f4ea02f322`.

School source metadata is optional, stored alongside Skill, technique and Equipment rows. The predecessor ignores it and preserves the original rows and ordinary save fields. It resumes its historical character-check behaviour. A rollback does not delete the character's selections. Opening and resaving with the predecessor drops the optional source metadata, so returning to 8b requires explicitly identifying older School choices again.

Declared prerequisites: character validator (Phase 5, Part J), Characters/wizard (Phases 11–11.2.4, Part K), and Play/Management modes (Phase 12, Part K). Remove SC8 before removing those prerequisites. Spell-name alias support is optional and guarded. Save-format migration requires no schema change because all new fields are optional annotations.

Four historical wizard harnesses now require exact School source records in their save comparison only when `SC8.enabled()` is true; with it absent or disabled the original byte-for-byte expectation remains. They remain self-contained if this phase folder is deleted. The character check remains a reporter; picker actions live in the new layer.

Release 8c and Phase 15 do not exist as dependencies of this layer. Any later dependency must be declared here before it ships.
