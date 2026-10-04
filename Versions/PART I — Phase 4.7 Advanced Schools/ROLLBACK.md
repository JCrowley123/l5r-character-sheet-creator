# Remove Phase 4.7 — Advanced Schools

**Verified, 4 October 2026.** Final integrated removal restored the exact
pre-release build and all 3,840 retained checks passed on that removed build.
Evidence: `qa/final-verification.json` and its linked logs.

Phase 4.7 requires Alternate Paths (Phase 4.6, Part I) and Save Format and
Migration (Phase 7, Part J). Remove this consumer before either parent. Those
parents' ROLLBACK files name this dependency. Play/Management is optional.
The guarded Advantages configuration reader is needed only to establish the
Storm Riders' Water Elemental Blessing; its absence does not disable the other
Schools. The earlier `MSTECH` fix provides its existing preservation of prior
School Techniques and is not called directly by AS47.

## Surgical removal

Use an external scratch copy of the Phase 0 tree. Never pass the live tree or a
parent/child of it to the remover. From the repository root in PowerShell:

```powershell
$env:PYTHONUTF8 = '1'
$phase47Source = 'Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
$phase47Copy = Join-Path $env:TEMP ('l5r-as47-removal-' + [guid]::NewGuid().ToString('N'))
Copy-Item -LiteralPath $phase47Source -Destination $phase47Copy -Recurse
& 'C:/Users/jcrow/AppData/Local/Python/pythoncore-3.14-64/python.exe' -B 'Versions/PART I — Phase 4.7 Advanced Schools/qa/remove-phase.py' $phase47Copy --dry-run
```

Inspect the plan, then run the same remover without `--dry-run`. With no later
layers, require the known preceding build before any write:

```powershell
& 'C:/Users/jcrow/AppData/Local/Python/pythoncore-3.14-64/python.exe' -B 'Versions/PART I — Phase 4.7 Advanced Schools/qa/remove-phase.py' $phase47Copy --expect-sha '7f57135bddb8c4c1bc306c8841f52ed0eb9c03292f873e7302a8b13ccda8bd49'
& 'C:/Users/jcrow/AppData/Local/Python/pythoncore-3.14-64/python.exe' -B (Join-Path $phase47Copy 'build/recombine.py') --verify
```

Run retained harnesses on the resulting scratch HTML, then review and apply only
that removal to the working branch. Remove this feature folder and its entry in
`Versions/QA — Removal Chain Registry/removal_chain.py`. Select the preceding
Dice Rolling Entries suite runner if no later phase remains.

| Owned surface | Removal |
|---|---|
| `src/sheet/209.999999-feat-advanced-schools.js` | Delete the fragment |
| `build/manifest.json` | Remove its single fragment entry; recompute `expect_sha256` from retained fragments |
| `src/sheet/210-test-seam-and-init.js` | Remove only `// PART I PHASE 4.7 BEGIN advanced-schools-seam` through `// END AS47 advanced-schools-seam` |

There is no shared markup, stylesheet or pipeline block to restore. Runtime
wrappers, the catalogue, generated panel/styles and hidden field all leave with
the fragment. The remover preserves surrounding bytes and line endings. It
preflights all operations, rejects malformed/foreign markers, duplicate manifest
entries or keys, leftover owned identifiers, unsafe paths, links and aliases to
live files, and checks an optional expected hash before writing anything.

The preceding build is **3,489,469 bytes**, SHA-256
`7f57135bddb8c4c1bc306c8841f52ed0eb9c03292f873e7302a8b13ccda8bd49`
(recorded in `qa/baseline.json`, main `9c332ae`). When later independent features
remain, their bytes remain too: use the appropriate retained-layer hash or omit
`--expect-sha`. Never force the old hash onto a newer retained build.

## Save behavior and switch

`ADVANCED_SCHOOLS_ENABLED = false` installs none of this phase's wrappers,
controls or format step. Missing/disabled hard parents also leave AS47 disabled.
The earlier sheet continues to operate.

Saves written by this release use one more format step (format 5 with the current
layers). A build with Phase 4.7 removed refuses those saves through Phase 7's
normal newer-format check. **Do not lower the format number to force a load**:
the remaining reader does not manage Advanced progression or the frozen basic
School it owns. Use an export from before entry for a rollback test, or keep a
build that understands the newer save. Removal never rewrites stored characters
in bulk. Technique descriptions already present in a saved character are data,
not a substitute for the removed progression engine.

## Verification record

- Final remover fixtures: 24 tests, 23 passed; one Windows symlink test skipped
  because symlink creation was unavailable. Includes the real build copied to scratch.
- Release build: 3,525,220 bytes, SHA-256
  `b02aa5584cc90cbb948ece23980bcf5ae766d943eada6430c52353dead2e8950`.
- Exact restoration: 3,489,469 bytes, SHA-256
  `7f57135bddb8c4c1bc306c8841f52ed0eb9c03292f873e7302a8b13ccda8bd49`.
- Retained behavior on removed build: **3,840/3,840**. Release full-suite result
  **4,036/4,036** was reused against the unchanged release hash, as recorded.
- Final ownership scan: all references to the 14 owned names are inside this
  phase's marked blocks; exit 0. Live build unchanged after scratch verification.

`qa/test-removal.py` includes no-write refusal checks, future-marker preservation,
line-ending preservation, duplicate manifests, escaping fragment/output paths,
hard-linked sources/output, and live-tree guards. No whole-file fallback exists;
the marker/manifest/fragment surgery is the removal method.
