# BUGFIX — Screen Focus from the App Bar

Built 14 October 2026 (Cycle 1, Layer 6), on the owner's decision after the cycle's code review. When the app bar opens
Search or the Characters list, keyboard focus now moves into that screen, so Escape works there.

## The defect

Found by the code review as "focus is lost when Search reopens on an open entry"; the root cause is wider. When the
Characters screen opens it focuses its active tab button (Phase 11), but the app bar (Phase 11.3) hides those tabs, so
that call fails silently and focus stays on the app bar button outside the screen. The screen listens for Escape on
its own element, so on a desktop with a keyboard:

- opening **Search** from the app bar, Escape did nothing;
- returning to Search **on an open entry**, Escape did nothing (the reviewer's case);
- opening **Characters** from the app bar, Escape did nothing.

Measured on `main` and before this fix: focus on the app bar item in all three cases. It has existed since the app
bar; this cycle did not cause it. The iPhone is unaffected (no Escape key; taps work).

## The fix

`src/sheet/209.9999999992-bugfix-screen-focus.js` (`SCREENFOCUS`) wraps the public `CL11.open` and `SEARCHPAGE14.open`
(the app bar opens Search through Search's own `open`, which redraws an open entry after the screen opens, so focus
is placed after each completes). It acts only when an **app bar item held focus when the open began**, read through
the bar's own interface `APPBAR113.element()`, and only if focus is not already inside the screen. Focus then goes,
with `preventScroll`, to the open Search entry's heading, else the shown panel's title (Search or Characters, made
focusable with `tabindex="-1"`). It never focuses a field (the iPhone keyboard), never acts at start-up (when saved
characters open the screen) and never acts when a script opens the screen. Without the app bar it does nothing: the
screen's own tab focus already works then. No earlier code changes.

## Verification (14 October 2026)

| Check | Result |
|---|---|
| `qa/screen-focus-harness.js` (desktop width) | **11/11** on the candidate; **5/11 on `main`**: the 6 fix checks fail (focus stays on the app bar; Escape does nothing), the 5 guards pass |
| Negative variants | **5/5 pinned**: baseline (6), disabled (6), act on any open (2: the text-box and start-up guards), no Search-open wrapper (2: the reopened entry), title not focusable (3) |
| Removal proof | **6/6**: rebuilds Layer 5's build exactly (3,828,819 bytes, `35416333…`) |
| Registry | **11/11** |
| Neighbours | Search Focus on Close 12/12 (its "focus elsewhere is left alone" check found the first, broader rule, which acted on any button outside the screen; the rule was narrowed to the app bar), Search 62/62, Characters 70/70, Wizard 43/43, Toolbar 37/37, Top Bar 30/30, Facets 44/44 and 14/14, Export to PDF 33/33, Phase 12 modes 25/25, App Bar dependency 14/14 |
| App Bar harness (Phase 11.3) | **Not settled.** 25/25 in 9 runs on their own, with the fix on and off; **22/25 in two batch runs** (`AB-WIDTH-320/375/390`: a click waited 30 s for the app bar's Search button). Both batches overlapped the failing-test investigator's parallel browsers; a quiet-machine batch replay passed. To be re-run before the full suite. |

Candidate: **3,831,761 bytes**, SHA-256 `d460d6e1ac8d5a2729bc2ea100d41956456a01449bd1df2f9b431f4b45e902b4`.

**Not covered:** a render that rebuilds an open entry by itself (only reachable through `FACETPAGE141.clear()` while an
entry is open, whose button is hidden then) still drops focus to the page; no user path reaches it. Safari on a Mac
does not focus buttons on click, so there the fix applies only when the app bar is reached by keyboard.

`qa/current-suite-runner.js` chains Layer 5's suite (5,229) and adds 11: **5,240**.
