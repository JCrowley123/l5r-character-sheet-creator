# G3 previews · checks on the deployed files (11 November 2026)

`qa/verify-preview.py --url=<preview> --ref=<branch>` ran once on each branch's preview. It compares the page, the service worker, the manifest and the icons byte for byte with the branch's committed build, then runs, on the downloaded page, each present G3 unit's harness and the retained harnesses of the layers G3 touches. Evidence: `qa/hosted-preview/<host>/`.

This is the light-check scope. It is not G2's 2,500-check preview run, not the group's qualification and not a production check.

| Unit | Branch and commit | Preview | Source build | Result on the deployed files |
|---|---|---|---|---|
| 8b.1-UI-01, revision 1 | `claude/release-15a-ui01` · `6455973d` | [claude-release-15a-ui01](https://claude-release-15a-ui01.l5r-character-sheet-creator.pages.dev/) | `390f3cd1…f19c` | **171/171**, 9 harnesses |
| 8b.1-UI-02, restacked | `claude/release-15a-ui02` · `f8f544b6` | [claude-release-15a-ui02](https://claude-release-15a-ui02.l5r-character-sheet-creator.pages.dev/) | `4f121ab4…69ca` | **199/199**, 10 harnesses |
| 8b.1-UI-03, revision 1 (the whole group) | `claude/release-15a-ui03` · `0e0929b9` | [claude-release-15a-ui03](https://claude-release-15a-ui03.l5r-character-sheet-creator.pages.dev/) | `15268822…0ff8` | **223/223**, 11 harnesses |

These are the builds after the code review (see `qa/code-review.md`). The first builds (`bf01511a`, `c062372b`, `36db038b`) were verified the same way at 17:14 UTC and passed 171/171, 199/199 and 223/223; the owner's device round ran while the revisions were being pushed.

Each preview's application base is the one before it; UI-01's is exact live G2 (`77936023…82f0`). The deployed page is the source build plus the install header, which is why its size differs from the source (for the whole group: 17,637,253 bytes, `1b4251fc…1f98`).

The harnesses run on every preview: each present unit's own (32, 28, 24), the older review (20), legacy grants (4), allocation boundaries (5), School choices (30), review regression (6), Play mode Techniques (16), casting help (36) and A11 (22).

The mock-up branch `codex/release-15a-g3-mockups` carries records only and is not an app preview.
