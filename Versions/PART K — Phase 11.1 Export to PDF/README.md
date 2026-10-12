# Export to PDF

Adds Export to PDF after Export JSON in each saved character's menu. Opens that character through the existing save/load flow and invokes the browser's print dialog only after confirming its identity. The selected character remains open. Pending edits, discard cancellation, failed loads and duplicate requests are covered. Existing sheet Print remains available.

Print-only styles hide unapplied Clan/School choices and provide spaced Identity labels. Before native printing, the layer temporarily opens Combat accordions and mirrors textarea values into plain-text elements that can grow to fit their contents. After printing or cancelling, it restores the original accordion states and removes the mirrors. Both the existing Print command and Export to PDF use this preparation. Browser printing on iPhone was approved with this cycle; native Android printing and a separate PDF engine are outside this release.

Focused QA passes 33/33, including print preparation, restored accordion states and complete textarea values. The baseline negative is 8/18. All ten pinned negative variants and two dependency boundaries pass their expected assertions. The complete candidate passes 5,057/5,057; PDF removal retains Print and Skill Traits and passes 5,024/5,024. Historical removal matches the restore hash exactly. A five-page sample PDF was visually checked: complete Background and Armor/Weapons content are visible, with no Ring images. The retained Characters harness adds one conditional exact menu expectation while this feature is enabled; the original expectation still applies when removed or switched off.

Restore point: 3,780,974 bytes, `42751a5b11b0c62e30dfa44354ad099f0f4c5ca67ff08f043311c9da24952b44`. Build: 3,786,934 bytes, `e3b65cb09297eb19a6e5aa7b53fdffffe01f8f9ec72f374b5e7a1bf573842173`. Final regression evidence is in the shared cycle folder. Main merge, live verification and owner test results are recorded below; FT-30 print-layout follow-up remains open.


## Release verification

Merged to main at `d5e418d` and verified live on 11 October 2026 at 16:23 UTC. The deployed page matches the tested PWA bytes (3,799,358 bytes; SHA-256 `312fa071b72e6bd14b5083cdf3f510e66e1e222e4394b69beefa6142f1972403`), service worker `28e6539adf579766`; all 232/232 live checks pass. Owner results received 12 October: all 15 iPhone checks passed (P1–P7, S1–S8), run 11 October on iPhone 16e / iOS 26.6.2. Optional Windows W1–W2 Not run. FT-29 picker labels are owner-deferred; independent saved-PDF review found FT-30 weapon clipping, still open. See `../QA — Small Fix Cycle 2026-10-10/OWNER-RESULTS-2026-10-12.md`.
