# ROLLBACK — PART K — Phase 12 Play and Management Modes (part 1)

## Surgical removal (the method)

Against a **scratch copy** of the Phase 0 tree (the remover refuses the live tree):

```bash
cp -r "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability" /tmp/phase0
python3 "Versions/PART K — Phase 12 Play and Management Modes/qa/remove-phase.py" /tmp/phase0
python3 /tmp/phase0/build/recombine.py
```

It removes exactly:

| What | Where |
|---|---|
| The fragment | `src/sheet/209.9996-feat-play-management-modes.js` |
| The stylesheet | `src/css/59.997-feat-play-management-modes.css` |
| Their manifest entries | `build/manifest.json` (`expect_sha256` recomputed from what remains) |
| Block `modes-seam` | `src/sheet/210-test-seam-and-init.js`, after the Apply School fix's seam block |

**Measured 25 September 2026:** removal rebuilds **byte-identical** to
`0dcb56e8c02efbb1c7dba6e9d61da29b7e355009f47b2777c7d481bbdb1ed5d1` (3,072,896 bytes, commit
`e66c4dd`). Later releases are removed first through the shared removal chain.

**Every later Phase 12 part depends on this one** (it registers its tab through `MODES12.register`),
so remove those first; each will declare it.

## Dependencies

- **On Phase 11 and Phase 11.2 (Part K), soft:** `CL11.openCharacter`, `CL11.createNew` and
  `CW112.finish` are wrapped by property, each guarded. Without them this part only loses those
  entry points.
- **On the removal chain:** this part is registered in `QA — Removal Chain Registry`.
- **Who depends on this:** every later Phase 12 part, once built.

## Cross-phase fixture correction

`PART K — Phase 11 Characters List and Save Model/qa/characters-harness.js`, check
`CL-COPY-INDEPENDENT`: one conditional line switches to Management before editing Notes, only when
`MODES12` exists. Reads 70/70 with this part present and removed. Removing this part does not require
undoing it; if it is undone, do it with this part removed.

## Dependants

- **PART K — Phase 12.1 Play Mode Clan and School** (part 2, 25 September 2026) registers the Clan &
  School tab through `MODES12.register`. Remove it before this part.
- **PART K — Phase 12.2 Play Mode Identity** (part 3, 25 September 2026) registers the Identity
  tab through `MODES12.register`. Remove it before this part.
- **PART K — Phase 12.3 Play Mode Rings and Traits** (part 4, 25 September 2026) registers the
  Rings & Traits tab through `MODES12.register`. Remove it before this part.
