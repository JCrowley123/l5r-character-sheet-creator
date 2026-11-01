# Release 8b — implementation and qualification in progress

Owner approved building step 3a on 1 November 2026. Branch: `codex/release-8b-school-choices-2026-11-01`, based on `b2d8e26b` (approved Phase 15 rulings). No merge or deployment is authorized.

Layer: `PART K — Phase 11.2.5 School Choices from the Character Check` (`SC8`). Manage decorates the two existing notes with buttons. The dialog reuses wizard Skill and spell pickers; fixed Element choices are shown one at a time with Later, and complex allotments keep their existing matching rules. The validator itself makes no choices. Explicit School annotations survive save/load and distinguish rewards from School grants. Older items can be explicitly adopted without duplication. One shared spell can be explicitly assigned to more than one held School, without automatic cross-credit. Paid Skills, memorised spells and adopted items are preserved on Manage undo.

The owner supplied the original Claude discussion again and confirmed the saved work-order direction: older Kitsu characters are repaired through the note; Equipment gets no extra tick. Level-up choices remain Release 8c. Phase 15 UI changes remain outside 8b.

Current candidate: SHA-256 `1eb9e017636829a941a8d9b0916fc2b0d0c81eefc97e2b8fd7d222f4ea02f322`, 17,484,443 bytes. Predecessor: `a25ace916f29d5c1647731db0ab2d7e97bd23bbdd6312c9631bd9d4ba416c7f2`, 17,459,752 bytes.

Completed targeted evidence:

- Initial 30/30 behavioural checks passed at 4× CPU; six negative variants matched exact pinned failures; scratch removal passed 6/6 and restored the predecessor exactly.
- The one permitted read-only code review found four adoption/source defects. Six regression checks reproduced these and related undo defects before fixes. See the phase's `qa/review-before-fix-2.log` and `qa/review-pins.json`.
- The corrected candidate passed 30/30 original checks and 6/6 review regressions at 4× CPU (`qa/own-cpu4-4/`). Two earlier launch attempts failed before a browser ran because of preload path quoting; their logs are retained.
- The first historical preflight passed eight of nine harnesses. `CW1-SCHOOL-CHANGE-CLEARS-SLOTS` exposed an unintended change to wizard School replacement. Fixed by limiting the new preservation behaviour to the Manage dialog; the original wizard removal behaviour is retained. This was a targeted preflight, not a full-suite run.
- Historical save comparisons now add the exact expected optional source records while SC8 is enabled. All existing non-source fields remain compared byte for byte; old expectations remain when SC8 is absent. Their assertion counts are unchanged.

Qualification is running through `qa/qualify-before-full.py`, with status in `qa/qualification.json`. It is fail-closed and single-use: build verification, negative variants, review variants, removal, dependency scan, changed historical checks at 4×, then one discovery pass. Do not rerun it blindly. Do not rebuild the live candidate while any harness reads it.

Full qualification has **not started** at this checkpoint. Pinned totals: **6,709 candidate and 6,600 retained**. `qa/run-final-twice.py` must run two fresh passes on mains with keep-awake, only after discovery succeeds and a pre-full usage reading is saved. Never retry a full run to obtain a pass. No QA cache reuse. The retained tree removes SC8 through the registry and must reproduce the predecessor byte for byte.

Remaining work: inspect qualification results; resolve any failures with targeted checks; inspect phone/desktop UI; update owner checklist and release records; run full twice; record results and final current-tree removal proof; preserve CLAUDE.md's eight CR bytes; commit and push this branch. Await owner word before merging main.

Remote Control was requested earlier but remains unverified: the app-control approval timed out, and the owner has not confirmed enabling it. Do not claim it is on.

Usage: start 02:09 UTC, 77% five-hour / 44% weekly used. Intermediate reading around 16:20 UTC: 86% five-hour / 62% weekly used; the five-hour window has rolled, so those readings are not a same-window usage delta. Exact model/effort selection is not exposed. No reset credit used by this agent.
