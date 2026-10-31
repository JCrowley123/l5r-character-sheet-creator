# Spell Names navigation failure investigation

Completed 2026-10-31. This investigation made no production or existing harness edits and did not rerun the full suite. The parent audit may subsequently apply the scoped proposal below; its validation is separate from this record.

## Observed failure and limits

The second candidate run's `../final-run-2/candidate-leaves/140.json` records a 60,000 ms timeout in `page.goto(url)`, waiting for `load`, at `BUGFIX — Spell Names Match the Books/qa/spell-names-harness.js:25`. It produced no assertion output. Thus the candidate had 6,657 reported passing checks instead of 6,673: precisely the missing 16-check leaf. Ancestor count errors cascade from that missing leaf; they are not evidence that count pins need changing.

The original run did not retain network timing or pending-request events. It cannot identify which request or scheduling condition caused the historical timeout. External fonts are a demonstrated startup dependency compatible with the symptom, not a proven attribution of that one failure. A successful targeted run also cannot establish that the entire suite will pass under every load.

The canonical sheet hash for this investigation was `a25ace916f29d5c1647731db0ab2d7e97bd23bbdd6312c9631bd9d4ba416c7f2`. The original harness hash, rechecked after the probes, was `01abbd198e1401bd626ae7eacc197f966f8ddab3584f80a315971f6e4f927fcf`.

## Deterministic evidence

`navigation-probe.cjs` and `navigation-probe.json` contain three fresh browser-context observations against the canonical sheet:

- Ordinary navigation actually requested Google Fonts CSS and font files. Semantic readiness was observable while fonts were still loading; ordinary load subsequently completed. This elevated Chrome process had real font requests, so a separate browser environment with an empty `document.fonts` set must not be assumed equivalent.
- Holding the Google Fonts stylesheet left the document loading with no `__L5R_TEST__` seam and no CL11 readiness after the 5-second observation interval. Releasing the stylesheet allowed initialization and load. Merely changing `waitUntil` to `domcontentloaded` would not eliminate this dependency: the stylesheet can delay scripts and that event too.
- Holding a synthetic font request demonstrated readiness before its release. Because that first snapshot still had the document request pending, a second, stricter diagnostic isolated the font as the sole outstanding request.

`font-barrier-proof.cjs` and `font-barrier-proof.json` provide that stricter evidence. The probe supplied a small font stylesheet without changing the source file, held its font response, awaited both CL11 readiness and DOMContentLoaded, and then observed for another second. DOMContentLoaded fired at 743 ms. Before release, the document was `interactive`, CL11 was ready, and the held font was the only pending request; no `load` event had fired. Releasing the font at 1,753 ms allowed `load` at 1,765 ms. No timeout was enlarged, no production assertion was changed, and this was not a suite rerun.

## Minimum scoped proposal

Install this route on the Spell Names harness context before creating/navigating its page:

```js
// These checks cover spell data, aliases, search text, and storage, not typography.
// Keep external font availability outside this logic harness's startup dependency.
await context.route(
  /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//,
  route => route.abort('blockedbyclient')
);
```

Keep the existing `page.goto(url)` load barrier, the CL11 readiness wait, all 16 checks, all expected counts, and all baseline/mutant pins unchanged. The existing checks have no font, geometry, screenshot, or print assertion; their Search-row check verifies text content. Immediate failure of these two font services makes that external dependency deterministic for this leaf without bypassing a tested feature or removing either startup barrier.

Do not apply this route globally through the shared runner. Other leaves may assess typography, geometry, screenshots, or printing. Those tests need deliberate real-font coverage, potentially with pinned local font fixtures. This scoped proposal does not remove other leaves' external-resource dependencies. Future navigation failures would be easier to diagnose if pending requests and lifecycle events were recorded on failure, without retries or longer timeouts.

## Targeted preservation proof

`isolated-fonts.cjs` installs only the proposed font routing as an investigation preload. `targeted-proof.py` ran the unchanged original harness and the unchanged negative-case logic with installed Chrome, the existing 60-second navigation budget, the existing splash test switch, and the existing 4x CPU throttle. It redirected negative-case output into this investigation directory without changing assertions, mutations, expected failures, or the original file.

`targeted-proof.json` records completion from 17:53:35 to 17:54:49 UTC: canonical leaf 16/16, exit 0; all seven negative cases preserved their exact named failures. Detailed leaf output is in `spell-names-isolated-cpu4.log`; variant output is in `negative-isolated-cpu4/summary.json` and its associated logs.

| Existing case | Checks passed/executed | Exact expected failure set matched |
| --- | ---: | --- |
| predecessor baseline | 5/16 | yes |
| disabled | 5/16 | yes |
| missing-scroll-hook | 14/16 | yes |
| missing-former-name-tag | 13/16 | yes |
| missing-former-page | 14/16 | yes |
| missing-ancestor-hook | 15/16 | yes |
| exact-case-names | 13/16 | yes |

Each variant executed all 16 checks and returned its expected failing exit status. The authoritative existing pins are in `BUGFIX — Spell Names Match the Books/qa/verify-variants.py`; they were not corrected or replaced. The original full-run failure remains part of the audit evidence.
