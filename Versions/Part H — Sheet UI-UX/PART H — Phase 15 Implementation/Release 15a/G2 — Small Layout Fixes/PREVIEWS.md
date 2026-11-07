# G2 previews · checks on the deployed files (7 November 2026)

`qa/verify-live.py --url=<preview> --ref=<branch>` ran on each branch's preview. It checks the page and the service worker byte for byte against the branch's committed build, then runs A03's 23 harnesses and every present unit's harness on the downloaded files. Logs: `qa/hosted-preview/<host>/`, summary `qa/previews.log`.

| Unit | Preview | Result |
|---|---|---|
| A05 | [claude-release-15a-a05](https://claude-release-15a-a05.l5r-character-sheet-creator.pages.dev/) | **1,922/1,922** |
| A06 | [claude-release-15a-a06](https://claude-release-15a-a06.l5r-character-sheet-creator.pages.dev/) | **2,050/2,050** |
| A07 | [claude-release-15a-a07](https://claude-release-15a-a07.l5r-character-sheet-creator.pages.dev/) | **2,098/2,098** |
| A11 | [claude-release-15a-a11](https://claude-release-15a-a11.l5r-character-sheet-creator.pages.dev/) | page and service worker match; every G2 harness passes; **two A03 checks failed once** (below) |
| A04.1 (the whole group) | [claude-release-15a-a04-1](https://claude-release-15a-a04-1.l5r-character-sheet-creator.pages.dev/) | **2,513/2,513**. Revision 1 (one box per option, build `77936023…82f0`): **2,523/2,523**, the ten ONE-BOX checks added (`qa/preview-a041-r1.log`) |

## The A11 preview: a timing race in A03's harness, not caused by A11

- **What failed.** A03's `MANAGE-EDITS-WORK`: on a phone it taps Iaijutsu's Rank, confirms the field has focus, presses End and Backspace, and types 7; the field still held 5. `PLAY-MASTERIES-REACHED` then failed because it depends on that Rank.
- **Why it is not A11.** The typed keys reached no field: focus moved between the tap and the keystrokes. A11 changes nothing on the Skills tab. The same check passed on the A05, A06, A07 and A04.1 previews, and A04.1 contains A11.
- **Investigated once, not retried:** A03's harness alone, on the exact page downloaded from the A11 preview, gave 37/37.
- **A risk for qualification.** The one full pass may not be re-run. Before it, what takes the focus there (a redraw or an autosave landing in that window) should be found and the race closed in A03's harness, as a declared harness fix.

## Run environment (found 7 November)

Every harness run needs:

- `NODE_PATH=C:/Users/jcrow/l5r-qa-tools/node_modules`
- `PLAYWRIGHT_BROWSERS_PATH=C:/Users/jcrow/l5r-qa-tools/ms-playwright`
- `PYTHONUTF8=1`

This kickoff named only the first. Without the second, Playwright used the separate copy in `AppData\Local\ms-playwright`:

- That copy crashed this morning. A reinstall fixed it for Node started from Bash.
- Node started from this (packaged) Python still cannot see that copy ("Executable doesn't exist").
- The two copies are the same Chromium, 153.0.8010.12. So the light checks run earlier from Bash stand.
