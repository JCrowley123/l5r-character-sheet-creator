# Rollback — Sourcebook index

Delete this folder. That is the whole removal.

- Nothing in the sheet's source, build, deploy chain or test suites reads this folder, so removing
  it changes no build output (the Phase 0 build stays `23df67a7…`, 3,117,804 bytes, as it was when
  this folder was added).
- It adds no root-level file and no `.gitignore` entry.
- `build_index.py` only **reads** the sheet's `060-lib-schools.js` and
  `070-schools-paths-techniques.js`, to match the sheet's School and technique names to book pages.
  If a later change renames `SCHOOL_LIBRARY` or `TECH_DESCRIPTIONS`, the script fails loudly; the
  sheet is unaffected either way.
- Later phases may cite page numbers they first found here. Those citations stand on their own
  (each phase reads and checks its pages), so they do not depend on this folder.
- **The wiki links alone** (added 30 September) come out by deleting `wiki_links.json` and running
  `python build_index.py --from-json`. That restores `INDEX.md` and `index.json` byte for byte to
  the index as first built. The `--from-json` option itself can stay.
