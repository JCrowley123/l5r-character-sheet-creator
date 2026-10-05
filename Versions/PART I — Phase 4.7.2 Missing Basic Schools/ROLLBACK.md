# Removing the two Basic Schools

Owns `src/sheet/209.9999992-feat-missing-basic-schools.js`, its manifest entry and the `PART I PHASE 4.7.2 BEGIN missing-basic-schools-seam` through `END BASIC47 missing-basic-schools-seam` block in `210-test-seam-and-init.js`.

Use `qa/remove-phase.py SCRATCH_COPY --dry-run`, inspect, run without `--dry-run`, and rebuild with `build/recombine.py --verify`. The remover preflights every edit and refuses the live tree. It preserves unrelated source and manifest formatting.

The preceding supplemental build is **3,554,472 bytes**, SHA-256 `a67ae916e00e82dcfd6ed555e2dc07a04eeaecb3604b9256ca8c812632445092`. `qa/test-removal.py` proves that boundary against the current source.

This layer uses the trunk School catalogue and Technique grant engine. It does not require Advanced Schools. Its optional Alternate Paths integration makes the existing Hiruma Scout clauses usable when Paths are enabled. Its optional wizard integration limits Yotsu's Lore choice to the two printed subjects and adds the selected subject through the normal free-Skill flow. Deleting this layer removes those wrappers on the next page load; the earlier Path and wizard fragments are untouched. Disabling/removing those features leaves by-hand School application working.

The existing Sword of Yotsu Ronin Path retains its original Technique name and text. The new School qualifies its identically named Rank 4 Technique with `(Yotsu Bushi)` to prevent a name-only lookup collision.

Back up characters before deliberately removing a School they have learned. The remover changes source only and never rewrites saved characters.
