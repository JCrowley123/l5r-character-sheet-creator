# Small fix cycle 10–11 October 2026

This cycle implements the three changes approved by the owner: remove Ring symbols from paper, add Export to PDF through the phone's normal print flow, and correct Skill Trait defaults. The owner also authorised merging the completed work to main so Cloudflare can update the live app.

## Changes and boundaries

- **Printed Sheet Ring Layers:** print-only rules remove both Ring symbols and the cream overlays. The existing screen artwork stays visible.
- **Phase 11.1 Export to PDF:** each saved character's menu gains Export to PDF after Export JSON. The action uses the existing character save/load flow, verifies that the selected character opened, and invokes the browser's print dialog. Pending edits, failed loads, cancellation and duplicate requests are guarded. The selected character remains open after printing or cancelling. Print-only layout hides unapplied picker controls and spaces Identity labels. Shared native-print preparation temporarily opens Combat accordions and mirrors textarea values into naturally sized plain text; after printing or cancelling, it restores the original accordion states and removes the mirrors.
- **Skill Traits:** Intimidation becomes Awareness; the approved named Perform and Games subjects use their Core Rulebook defaults. Blank Traits and former defaults are corrected when old rows load. Other saved choices remain. Craft keeps its existing default and gains the GM-choice reminder in rows, Skill information and Search.

PDF export uses native browser printing and the phone's normal preview/share controls. This release adds neither a separate PDF engine nor native Android printing. Browser checks cannot certify real iPhone print geometry; the owner's iPhone checks remain pending.

A Trait explicitly edited during the current session stays chosen when the Skill is renamed, including a choice equal to an old default. Saved rows do not record whether that value was chosen manually. Reopening a saved row with an old default therefore applies the approved correction again. No Skill rank, XP cost, save format or FT-28 roll-time Trait selection changes are included.

## Source and restoration points

The values below identify the recombined Phase 0 sheet, before the separate PWA packaging step. Each layer owns its source fragment(s), guarded seam, switch, remover and QA folder. The shared removal registry lists each layer once.

| Stage | Bytes | SHA-256 |
|---|---:|---|
| Before this cycle | 3,780,098 | `b7e1fc2d7c12e077954f1eb539d734679aad96930ae76fb7e61a813df1c94907` |
| Print fix | 3,780,974 | `42751a5b11b0c62e30dfa44354ad099f0f4c5ca67ff08f043311c9da24952b44` |
| Print fix and PDF export | 3,786,934 | `e3b65cb09297eb19a6e5aa7b53fdffffe01f8f9ec72f374b5e7a1bf573842173` |
| All three changes | 3,793,709 | `da9c83cb5bff0275ea1d3199f5e3e6ee97ca017cac66246c123bf8e4783c1e91` |

`qa/stages.json` records these integration points. Historical restoration removes Skill Traits, PDF export and the print fix in that order, requiring each preceding SHA before writes. Independent-removal cases start from the complete current tree, so later independent changes must survive. PDF export depends on the print fix and Characters List; remove PDF export before either of those dependencies.

## Verification status

The final candidate passes all focused checks: 8/8 print, 33/33 PDF export, 38/38 Skill Traits and 8/8 Skill Traits dependency checks. PDF passes ten pinned negative variants and two dependency boundaries; Skill Traits passes all 13 pinned negative variants. Baseline-negative, mutation and removal evidence lives in the individual release folders. Conditional test-only expectations in the retained Characters List and School Skill Rows harnesses keep their original assertions when the corresponding new layer is absent.

The final shared regression and current-tree removal runs passed on 11 October 2026, finishing at 08:53 UTC. `qa/final-qa.py` ran all browser jobs sequentially: all subprocesses exited successfully with the following pinned counts, all three historical restoration hashes matched, and the source candidate stayed unchanged at `da9c83cb5bff0275ea1d3199f5e3e6ee97ca017cac66246c123bf8e4783c1e91`:

| Case | Retained changes | Passed checks |
|---|---|---:|
| Complete candidate | All three | 5,057/5,057 |
| Skill Traits removed | Print and PDF | 5,011/5,011 |
| PDF export removed | Print and Skill Traits | 5,024/5,024 |
| Print and PDF removed | Skill Traits | 5,016/5,016 |

Each count includes the 4,970-check retained suite. The complete candidate adds 8 print, 33 PDF, 38 Skill Traits and 8 dependency checks. `qa/final/summary.json` and the per-case logs record the passes. Registry QA also passes 11/11. A five-page sample PDF was visually checked: full Background and Armor/Weapons contents are present and Ring images are absent. This sample does not replace the owner's iPhone checks.

The existing ownership scanner classifies named bugfix labels only as `BUGFIX`, so findings caused by that loss of identity are false positives rather than evidence that one bugfix owns another's source. Those classifications were reviewed against the actual named markers and owned fragments. The genuine external reference to the print fix is PDF export's declared `PRINTRINGS` dependency; the removable-layer and current-tree restoration checks still apply.

The registry's coverage fixture also had a baseline issue: three existing releases own companion script fragments in addition to their registered presence marker. `QA — Removal Chain Registry/qa/test-chain.py` now checks that the Search page, App Bar navigation and Search Facets page fragments are listed by their registered owner's actual remover. It does not accept arbitrary unregistered fragments or add duplicate removal operations. This test-only correction is separate from the three new registry entries.

Main merge and live Cloudflare verification are pending. The checklist's build label stays **Awaiting deployment verification** until the deployed build is checked. The owner still needs to run the iPhone acceptance checks after deployment; automated browser success does not mark those checks complete.

## Owner checklist

`TEST-CHECKLIST.docx` is the editable Word checklist; `TEST-CHECKLIST.md` contains the same instructions. They contain 17 test IDs covering print quality, selected-character PDF export, cancellation, Skill defaults, manual choices, Craft guidance, Search and the creation wizard, with optional Windows checks. Every result starts as Not run.

`document-source/create-checklist.py` regenerates both files and accepts `--build` for the verified release identifier. It validates the Word package, 17 dropdowns and Notes fields. The bundled Word renderer was unavailable, so rendered page layout has not been visually verified.
