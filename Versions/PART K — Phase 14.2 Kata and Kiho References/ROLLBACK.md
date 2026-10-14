# Remove Phase 14.2 Kata and Kiho References

Set `SEARCH_REFERENCES_ENABLED` to `false` and reload to disable this release's citations. Search, its filters and its existing descriptions remain available. This release never writes character data, so disabling or removing it requires no saved-data migration.

## Surgical removal

Remove only the following owned items, then rebuild the Phase 0 source:

| Location | Owned item |
|---|---|
| `src/sheet/209.999999995-feat-search-references.js` | Whole fragment and its one `build/manifest.json` entry |
| `src/sheet/209.99999991-feat-search-index.js` | `search-kata-source` and `search-kiho-source` blocks |
| `src/sheet/210-test-seam-and-init.js` | `search-references-seam` block |

Every shared block begins with `// PART K PHASE 14.2 BEGIN <slug>` and ends with `// END SEARCHREF142 <slug>`. The two Search index end lines additionally contain the exact suffix ` // PART K PHASE 14 (continued)`, returning ownership to Search for the following code. That suffix is part of the end line and is removed with it. The seam end line has no suffix.

1. Copy the Phase 0 source folder to a separate scratch directory. The remover refuses the live tree, its parents and its descendants.
2. From this release folder, run `python -B qa/remove-phase.py <absolute-scratch-folder> --dry-run` and inspect the plan.
3. Run the same command without `--dry-run`. Rebuild the scratch copy using its `build/recombine.py --verify` and run `node qa/flat-suite-runner.js <rebuilt-sheet.html> --retained` against the resulting HTML. The adapter uses `BUGFIX — Skill Traits/qa/current-suite-runner.js` as its declarative retained entry. The expected retained count is **5,057**; the final 14 October proof passed **5,057/5,057**.
4. After that proof succeeds, apply the same narrow removal to the working branch, rebuild, remove this release's entry from `QA — Removal Chain Registry/removal_chain.py`, and delete this release folder. Preserve any later independent blocks and files.

The remover preserves surrounding bytes and line endings and calculates the retained manifest's new `expect_sha256`. It refuses before writing on missing or duplicate items, malformed or foreign ownership markers, unsafe/linked paths, or remaining `SEARCHREF142` / `SEARCH_REFERENCES_ENABLED` references in retained source. A later feature that uses this interface needs its dependency resolved before removal.

With no later releases present, add `--expect-sha da9c83cb5bff0275ea1d3199f5e3e6ee97ca017cac66246c123bf8e4783c1e91` to require the frozen predecessor at `540c90b`: **3,793,709 bytes**. Final integrated removal matched this target exactly; the later documentation-only `8b75d3c` has the same app source. With later independent releases present, the retained build has its own measured hash; do not require the historical hash.

Do not restore entire shared files from `originals/`: those snapshots can overwrite later features. The surgical remover is the supported method.

## Dependencies

- **Search, Phase 14 (Part K):** required to display and search the references. This release adds two marked, guarded source fields to Search's index. Its own fragment calls `SEARCH14.invalidate()` through a guard after initialization so any earlier Search and facet caches rebuild with citations. The standalone lookup can answer without Search. For surgical Search removal, remove this release first, or explicitly sever that invalidation and remove its index integrations. Search's remover otherwise encounters this release's foreign blocks and retained Search reference. This dependency is also recorded in Search's `ROLLBACK.md`.
- **Search Facets, Phase 14.1:** no direct dependency. Existing filters consume the enriched Search records; disabling facets leaves the references available. The existing invalidation wrapper handles its cache without being replaced.
- **Skill Traits:** independent. Its Search detail wrapper and corrected Skill records remain in place. This release adds no Skill references or Skill behaviour.
- **Trunk catalogues:** Search supplies Kata/Kiho names to the lookup; their original records are not edited. The lookup has no dependency on character state, the app bar, Print or Export to PDF.

The test-only conditional oracle in Phase 14's Search harness can remain after removal: it selects the original expectations when this release is absent or disabled, and tolerates this folder being absent. The saved original is for comparison, not a whole-file restore over future test changes.

## Verification status — 14 October 2026

The candidate is **3,800,283 bytes**, SHA-256 `7b68f34d746d8674cdd33e6815197f9c1ea8e6e131ab42c2e523a4f477d4929a`. Focused checks pass **30/30**, dependency checks **20/20**, all **6 negative variants** match their pinned failures, and the removal-chain registry passes **11/11**. Removal fixtures completed **30 tests: 27 passed, three platform skips** (two symlink and one hard-link). The flat runner's **12/12 synthetic checks** and build-drift checks pass; inventory differences are only file/byte/line/hash metadata, with structural invariants unchanged. These checks do not replace the final removal proof.

The ownership scan exits 1 solely for Search index lines **329 and 339**, where `SEARCHREF142` appears in the end comments that return ownership to Search. The remover validates the exact suffix and deletes the complete end lines. They contain no executable use outside this release. See `qa/ownership.log`; the outgoing guarded Search invalidation is separately declared above and in Search's rollback document.

Full regression passed **5,107/5,107**, and exact predecessor reconstruction passed the **5,057/5,057 retained suite** at **01:24 UTC on 14 October**. The candidate result combines 90 verified groups reused with matching inputs and four freshly passing reruns; all 92 retained groups were freshly executed. The source stayed unchanged throughout scratch-copy verification. Earlier failures and incomplete attempts are preserved and explained in the README. See `qa/final/summary.json`, `01-full.log`, `02-remove.log`, `03-rebuild.log` and `04-without-references.log`. Merge/live verification remains pending; owner iPhone checks are Not run.
