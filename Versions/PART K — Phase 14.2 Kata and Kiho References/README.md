# Phase 14.2 Kata and Kiho References (Part K)

Adds verified book and printed page references to all **17 Kata and 73 Kiho** currently in Search. The citation appears in the result list and entry detail and can be found by searching for its book or page. Existing filters and the detail/Back flow continue to use Search's page.

The 90 references were checked against the owner's Core Rulebook and five elemental sourcebooks. [SOURCES.md](SOURCES.md) records every entry, printed page and PDF page; [qa/expected-pages.json](qa/expected-pages.json) is the book-derived test oracle. Citations use the **printed entry-start page**, including entries whose text continues on another page. Unknown entries return an empty citation.

This release adds citation metadata only. Catalogue names, descriptions, mechanics, character data and storage are unchanged. Skills, weapons, spells and other categories keep their existing references. Further reference batches, fuller descriptions and the Library reader link remain separate work.

## Structure

| File or interface | Role |
|---|---|
| `src/sheet/209.999999995-feat-search-references.js` | Standalone lookup table and `SEARCHREF142` interface; no DOM or character writes. |
| `SEARCHREF142.source(category, name)` | Returns the verified citation for `kata` or `kiho`, or an empty string. Names tolerate case, whitespace and straight/curly apostrophes. |
| `SEARCHREF142.enabled()` | Reports `SEARCH_REFERENCES_ENABLED`; switching it off and reloading removes these citations. |
| `src/sheet/209.99999991-feat-search-index.js` | Two guarded source fields, owned by `search-kata-source` and `search-kiho-source`. |
| `src/sheet/210-test-seam-and-init.js` | One guarded export block, `search-references-seam`. |

The fragment is the last feature script before the test seam and initialization, preserving the removal registry's chronological order. `var SEARCHREF142` allows earlier Search reads to take the empty fallback before the lookup initializes. A guarded `SEARCH14.invalidate()` at the end drops any earlier cached records, including the facet cache through its existing wrapper. No Search or Skill Traits function is replaced by this release. There is no new stylesheet or page layout.

## Verification status

Status updated **14 October 2026**. Full candidate verification and final removal proof **passed at 01:24 UTC**. The candidate passed **5,107/5,107** checks; removal restored the exact predecessor and passed **5,057/5,057** retained checks. Merge and deployment verification are pending. Earlier incomplete and failed attempts are preserved below and do not count as full passes.

| Check | Expected coverage | Final result |
|---|---|---|
| Focused reference harness | All 90 citations, list/detail agreement, original text, lookup boundaries, book/page search, filters, Back state, narrow screens and unchanged character/storage | **30/30 passed** |
| Dependency harness | Control, references disabled, fragment absent, Search disabled, Search page disabled and facets disabled | **20/20 passed** |
| Negative variants | Baseline plus five pinned mutations: disabled, PDF page substituted, missing Kiho, wrong book and missing Kata integration | **6/6 matched their exact expected failures** |
| Removal-chain registry | Registered releases, chronological manifest order, consumers and newest-first removal | **11/11 passed** |
| Full candidate suite | **5,107** checks: retained 5,057 plus this release's 30 and 20 | **5,107/5,107 passed**; 90 verified groups reused, four rerun unchanged |
| Removal fixtures | 30 tests | **27 passed; 3 platform skips** (two symlink, one hard-link) |
| Flat-runner synthetic checks | Original wrapper and leaf failure/count handling | **12/12 passed** |
| Build drift and inventory | Generated build checks and structural invariants | **Passed**; inventory differences are file/byte/line/hash metadata only |
| Exact removal and retained suite | Predecessor bytes below; **5,057** retained checks | **Exact restoration; 5,057/5,057 passed** in 92 freshly executed groups |
| Ownership scan | Exit 1: two comment-only ownership hand-back hits, explained below; no external executable use | Reviewed |
| Owner iPhone checks | [MANUAL-TESTS.md](MANUAL-TESTS.md) | Not run |

The candidate is **3,800,283 bytes**, SHA-256 `7b68f34d746d8674cdd33e6815197f9c1ea8e6e131ab42c2e523a4f477d4929a`. The frozen predecessor at `540c90b` is **3,793,709 bytes**, SHA-256 `da9c83cb5bff0275ea1d3199f5e3e6ee97ca017cac66246c123bf8e4783c1e91`.

Evidence: [build verification](qa/final/00-build.log), [completed focused checks within the incomplete run](qa/final/interrupted-full.log), [negative variants](qa/negative/summary.json), [registry checks](qa/registry.log), [removal fixtures](qa/removal.log), [build drift](qa/build-drift.log), [inventory before](qa/inventory-before.json), [inventory after](qa/inventory-after.json) and [ownership scan](qa/ownership.log). The ownership scanner reports Search index lines **329 and 339** because each end comment contains `SEARCHREF142` followed by the marker returning ownership to Search. Both are comment-only end lines removed with this release's source blocks. Neither is an external executable dependency. The guarded outgoing `SEARCH14.invalidate()` dependency is declared in both rollback documents.

Final evidence: [summary](qa/final/summary.json), [candidate](qa/final/01-full.log), [surgical removal](qa/final/02-remove.log), [retained rebuild](qa/final/03-rebuild.log) and [retained regression](qa/final/04-without-references.log). The source stayed unchanged throughout. The removed build matches the app source at both `540c90b` and the later documentation-only `8b75d3c`.

`qa/verify-live.py` is prepared to verify the committed PWA page bytes and service-worker build, then run Search (62), facets (44), references (30) and reference dependencies (20): **156 expected checks**. It has not been run. Local results do not establish deployment or owner acceptance.

## QA history and deferred follow-up — 13 October 2026

The previous flat run invoked all **94 leaf harnesses** but failed: **3,847/3,942** executed checks, **16 failed groups**, against 5,107 required. Fourteen groups encountered existing navigation timeouts of **2–6 seconds**; the other failures were the facets performance check under **4× CPU throttling** and Search's second Escape after closing detail. The [slow-host run](qa/final/slow-host-full.log) and [summary](qa/final/slow-host-summary.json) are retained alongside the earlier 96-check interrupted attempt. Neither is counted as a full pass.

Targeted reruns on 13 October passed without changing production or assertions: Named Advantages **136/136 on the baseline and 136/136 on the candidate**; Search **62/62 on both**; facets **44/44**; PDF **33/33**. Evidence: [Named Advantages baseline](qa/timing-baseline.log), [candidate](qa/timing-candidate.log), [Search baseline](qa/timing-search-baseline-repeat.log), [candidate](qa/timing-search-candidate-repeat.log), [facets](qa/timing-facets.log) and [PDF](qa/timing-pdf.log). At that point full verification was pending; the 14 October final evidence above supersedes that status.

**FT-34 — Search keyboard focus after detail closes, deferred.** The existing private `closeDetail()` hides the focused detail `h3` without explicitly restoring focus. That code predates this release and is unchanged. A later bounded correction should return focus to the original result button while preserving query, filters and list scroll, and allow a second Escape to close Search. No focus fix or weaker test is included in this reference batch. This was initially numbered FT-32 on the working branch; it was renumbered to preserve main's FT-32 loading/update proposal and FT-33 points stepper.

**Usage boundary:** at **08:36 UTC on 13 October**, the shared account reported **weekly 0%, five-hour 2%**, with a different weekly reset value (`1792485376`). The earlier observed 21-point weekly difference belongs to the previous window and cannot be extended across this reset. These snapshots still do not isolate task cost or justify a revised forecast.

At completion of QA, **01:25 UTC on 14 October**, the shared account reported **weekly 43%, five-hour 71%**, with weekly reset value `1792485376`. The 43-point weekly movement in this window is shared-account activity, not a measured cost of this batch. It must not be combined with the previous window's 21 points or translated into Claude weekly points.

## Running the full suite

Use `node qa/flat-suite-runner.js <sheet.html>` for the candidate and add `--retained` for the removed build. The original `qa/current-suite-runner.js` remains the declarative entry. The adapter evaluates the historical wrappers in one Node process and launches actual leaf harnesses sequentially: **94 leaf harnesses through 78 wrappers** for the candidate; **92 through 77** for retained regression. Leaf arguments, working directories, environments, assertions and per-harness limits are preserved; each wrapper still checks the real child output and original expected counts. No passing summary is substituted.

The nested launchers previously retained 79 Node controllers using about 3 GB and hit a parent-runner timeout/count failure. The adapter removes whole-chain wrapper deadlines while retaining leaf limits. Its **12/12 synthetic checks** pass; the separate 5,107/5,057 application regression results are recorded above.

A subsequent full attempt still failed under host load: **4,210/4,298 executed checks**, ten failed groups. Its logs are preserved as `qa/final/elevated-startup-failures-*`. The runner now preloads a test-only **60-second default navigation allowance**. This affects page startup only: action and wait timeouts, explicit navigation options, assertions and the facets performance threshold remain unchanged. The navigation helper's mock tests pass.

Use `python qa/final-qa.py --resume` to resume failed or unfinished groups. Passing leaf output is reused only when the sheet bytes, tracked tree diff, QA source files, runtime, relevant environment and invocation all match; original wrappers still validate the actual output and exact totals. Every fresh attempt is retained. **11/11 cache-integrity checks** pass, including rejection of stale, partial, failed and zero-check results. A completed run may therefore contain checks from more than one attempt against identical inputs; the final summary records reused and freshly executed groups.

The first run with that allowance executed all 94 groups and reported **5,102/5,107**, with five failures in four groups: two Manage-button return-layout checks, Search and facet performance thresholds, and PDF mirror cleanup. [That log](qa/final/navigation-budget-first-full.log) and [summary](qa/final/navigation-budget-first-summary.json) are preserved. On 14 October all four groups passed unchanged; the remaining 90 successful outputs were reused only after their input fingerprint matched. This establishes the full candidate pass across two attempts, not a single uninterrupted clean run. The precise cause of every earlier failure is not established. The removal suite then passed all 92 groups freshly in 32 minutes.

## Retained test change

Phase 14's `qa/search-harness.js` now uses the independent citation oracle for Kata and Kiho only while this release's switch is enabled. Its original empty-reference expectations remain in effect when the release is disabled or removed. Other categories keep their exact expectations; no check is dropped. The original harness is preserved under `originals/`.

[ROLLBACK.md](ROLLBACK.md) specifies the owned files and blocks, the Search dependency and the scratch-copy removal procedure.
