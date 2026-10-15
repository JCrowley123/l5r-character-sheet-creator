# BUGFIX — Search Keystroke Speed

Built 14 October 2026 (Cycle 1, Layer 4). **A fix found by the cycle's failing-test investigation, outside the
approved scope; brought to the owner as a small removable fix (owner's rule).** Search's filtered keystrokes are about
twice as fast; no result changes.

## The defect

The facets check `F141-UI-KEYSTROKE-UNDER-50MS` (Phase 14.1) failed in every recorded full-suite run and on the live
site. Measured on this desktop at rest, before any cycle change: the worst filtered keystroke under 4× CPU throttling
was **32–56 ms** against its 50 ms limit, so it failed about one run in six even on a quiet machine. A CPU profile
showed `SEARCH14.normalise` called **1,467 times per facets query**: the facets' option sort normalises both values on
every comparison, on every keystroke.

## The fix

`src/sheet/209.999999999-bugfix-search-keystroke-speed.js` (`SEARCHSPEED`) wraps the public `SEARCH14.normalise`,
which Search and the facets both call through that property, with a memory of results for texts up to 64 characters
(at most 5,000, then it starts again). The normaliser is a pure function, so a remembered result is the same result.
Long texts such as record bodies are not kept. No earlier code changes.

| Measured here, 4× throttling, five repeats | Before | After |
|---|---|---|
| Facets: worst keystroke (`F141` sequence) | 30–41 ms (32–56 ms before 14.3a) | **18–20 ms**; one repeat 34 ms |
| Search: worst keystroke (`S14` sequence) | 18–28 ms | **12–18 ms**; the same repeat 34 ms |

No timing threshold changed. The investigation also proposed restructuring Phase 14's own query (pre-sorted records,
rank buckets) for Search's broadest one-letter query; with this margin that change to Phase 14's code was not made.

## Verification (14 October 2026)

| Check | Result |
|---|---|
| `qa/speed-harness.js` | **7/7** on the candidate; **3/7 on `main`** (switch, remembering, long texts, bound) |
| Same results | Every category × 13 texts, plus a filtered facets query per faceted category: SHA-256 of all outputs identical with the fix on and off (also checked by the 14.3a and Search suites) |
| Negative variants | **5/5 pinned**: baseline (4), disabled (2), no bound (1), long texts kept (1), colliding cache key (3: both result checks and long texts) |
| Removal proof | **6/6**: rebuilds 14.3a's build exactly (3,825,690 bytes, `79d6dc83…`) |
| Registry | **11/11** |

Candidate: **3,827,453 bytes**, SHA-256 `c28339fcf0d8f32f5f79655cae21d8273909704614815b2d652d9f5ae511ee39`.

`qa/current-suite-runner.js` chains 14.3a's suite (5,216) and adds 7: **5,223**.
