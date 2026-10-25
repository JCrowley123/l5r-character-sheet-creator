# Template PDF export — Cycle 7a

**25 October final status:** one review complete; both fresh full QA passes succeeded (6,175 candidate / 5,973 retained each), with exact five-layer removal. Earlier stage-specific pending statements below are historical. Merge, live and device checks remain pending. See the Cycle 7a QA README.

The Characters menu exports a static character sheet using the original L5RCM blank PDF pages. Ordinary Print keeps its existing webpage printing behavior. The new layer maps an immutable snapshot to named original field rectangles, paints searchable text, removes form widgets and merges pages. It does not copy the L5RCM rules engine.

Long fields point to numbered continuation entries; full descriptions and notes continue across pages. Extra skills and weapons repeat their original sheets. Known school, spell, kata and kiho rows use corresponding supplemental pages; unclassified custom abilities are retained in the continuation. Social Ranks remain approved Ranks; pending points are explicit. Skill pools are labelled base pools, with per-roll declarations left for the roll preview.

Offline dependencies: pdf-lib 1.17.1, @pdf-lib/fontkit 1.1.1 (MIT, package metadata and upstream README retained), DejaVu Sans (Bitstream/Arev notices retained). Unicode glyphs covered by DejaVu, including macrons, are embedded. Unsupported glyphs refuse export with a code-point message; no silent replacement. No external service receives character data.

Original templates are from the inspected upstream v4.0.0 tree. On 25 October the owner reported private confirmation that GPLv3 covers all eight templates, no separate source/permission statement is needed, and no template/output credits or notices are requested. The separate template-permission question is closed on owner-supplied evidence; see the release QA template-owner-confirmation.md. Existing metadata and licence information are preserved; this record does not amend GPLv3 or the libraries' separate terms.

All template bytes, field positions and dependency hashes are in asset-manifest.json and the assets fragment. Only the writer initializes the bundled libraries. Five owned fragments, one guarded export hook, one guarded test seam; TEMPLATE_PDF_ENABLED disables the new path. Layers used for snapshot reads are guarded; core character persistence and PDF111 are prerequisites.

Verification checkpoint (25 October): candidate 22/22, actual main 1/22, disabled 1/22, wrong XP 21/22, missing overflow 20/22, removal 6/6. Negative expectations were pinned before the first run; the overflow pin omitted its independently caught total-page failure and was corrected with the original retained (qa/variant-correction.md). No assertion was relaxed. The first implementation incorrectly used 37 main-sheet skill rows; widget inspection establishes 23 main and 37 supplemental rows, now corrected. Empty annotation containers created while copying pages are explicitly removed. The rendered sample's original alignment/font sizes are respected.

Older export workflow: 33/33. The geometry assertion now measures the visible Taint score instead of its hidden legacy input, and waits for fonts. Its no-overlap limit is unchanged. The PDF output sink adapter preserves all selected-character, cancellation, concurrency and normal-print assertions.

The additional coverage harness passes 15/15; actual main and disabled variants both give 1/15 as pinned. It covers all school templates, equipment/merit overflow, Unicode, immutable snapshots, failures, edits during export and character-change cancellation. After the final pagination change, own 22/22, coverage 15/15 and exact removal 6/6 pass. Earlier implementation/check failures remain in evidence. All four prior layers passed again on the PDF build (30/26/12/20).

Independent pypdf reopening verifies no AcroForm/widgets, Unicode and final-note text. Template and continuation previews were inspected. Short continuation entries now stay with their heading. Original main-sheet blank areas without a verified app value remain blank: base/current Reduction and wound healing. No replacement game formula was invented. Spell descriptions are retained, including details not stored as structured fields. The template's fixed wound-formula caption may differ from app settings; the export explicitly notes this.

Current notice-packaged build: 17,296,865 bytes, SHA256 7781e1a2ff0c6f58dbfa742843a27dac8b53ca84d8f2ecfb24bb15c6fc166f0b. Its sole runtime-file difference from the full-suite build is a comment; see [packaging evidence](qa/dependency-packaging.md). The single read-only review is complete; both verified findings were fixed; both fresh full QA passes succeeded. Release approval, live verification and owner device checks remain pending.

Build size rose from 8.0 MB to 17.2 MB due to original templates, font and offline writer; load/performance impact remains unmeasured. Dependency notices now accompany both standalone and deployed HTML as background comments, with source records and exact byte-equivalence verification. No visible credits were added to generated PDFs. The template-specific question remains closed by the owner confirmation.

Twenty-two checks and four negative cases were pinned before first run. Predecessor SHA256 a7855ac1c9884b1db03415af59582f7debb1ccc59f3f6ef7d2ebeeb21c2159fa.

Review regression: active-school player choices now reach PDF affinity/deficiency fields, including Chuda's exception. Four new checks pass (before fix, main and disabled:0/4 each). Final PDF checks41/41 and removal6/6. QA rejects resume to ensure two fresh full runs. See the release QA code-review.md.
