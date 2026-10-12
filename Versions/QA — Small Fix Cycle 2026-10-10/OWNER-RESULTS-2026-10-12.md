# Owner results and PDF review — 12 October 2026

## Results received

The owner tested release `d5e418d` on **11 October 2026**, using an **iPhone 16e, iOS 26.6.2** as recorded in the returned checklist. All **15 iPhone checks passed**: P1–P7 and S1–S8. Optional Windows checks W1–W2 were **Not run**, not inferred passes. Values were read from all 17 Word result controls, together with the full paragraph text and notes.

| Test ID | Owner result |
|---|---|
| P1 | Pass |
| P2 | Pass |
| P3 | Pass |
| P4 | Pass |
| P5 | Pass |
| P6 | Pass |
| P7 | Pass |
| S1 | Pass |
| S2 | Pass |
| S3 | Pass |
| S4 | Pass |
| S5 | Pass |
| S6 | Pass |
| S7 | Pass |
| S8 | Pass |
| W1 | Not run |
| W2 | Not run |

The returned Word file and source PDFs remain unchanged. The original blank checklist in this folder remains the reusable test form. `OWNER-RESULTS-2026-10-12.json` preserves the returned result values and SHA-256 identifiers of the three source files; those documents are not copied into the repository.

## P4 — Safari printing prompt

The owner marked P4 **Pass**, with this observation: Safari displayed “This website has been blocked from automatically printing.” **Ignore** cancelled export and returned to the sheet; **Allow** continued the normal print/PDF flow for the selected character. The owner reported this as unexpected, not a failure. Record it as a non-blocking interaction note for future print UX review. This review does not establish whether timing, prior print attempts or another browser condition caused the prompt; no claim that it can or should be bypassed is made.

## Separate review of the attached PDF and screenshots

The saved `L5R 4th Edition — Character Sheet.pdf` contains **seven A4 portrait pages**, produced by Safari on iOS. It contains the James Crowley / Yasuki Courtier test character. The earlier four print-preview screenshots instead show **eight pages** for Sairyū / Kakita Bushi. They are different examples; the eight-page preview is not the page count of the supplied saved PDF.

All seven saved PDF pages were rendered and visually reviewed. Ring symbols and the cream overlay are absent, and the Identity labels are separated. Printed Intimidation uses **Awareness**. The Background in this saved example is short; the owner's P2 pass and eight-page screenshots support the separate long-Background check, rather than this short sample proving it.

**Open layout finding:** on saved PDF page 6 the Katana name is visibly clipped in its narrow weapon field, and the weapon note stops before its full sentence. The underlying PDF text includes more than is visible, so text extraction alone would miss this defect. There are also large empty areas on several pages, particularly pages 1 and 3; screen-oriented instructions and empty Stance/Void panels remain. Log these under **FT-30**. Preserve the owner's P2/P7 Pass reports, but do not describe the independently reviewed PDF as wholly free of clipping. The observed layout defect remains open; no app changes are part of this documentation pass.

## Deferred Skill picker labels — FT-29

The two Skill screenshots show **Intimidation (Willpower)** in the Add from Library picker, followed by an added row with **Awareness**. The owner explicitly permits this display correction to wait until **Phase 15 or later**.

The code explains the mismatch: `020-lib-skills-advantages.js` builds the picker labels once from the initial catalogue. The later Skill Traits layer changes Intimidation's catalogue Trait and row behaviour but does not refresh those existing option labels. Future correction should make displayed labels agree with the corrected defaults, check every affected picker, and preserve the already accepted row, roll, Search and saved-character behaviour. This is separate from FT-28's roll-time Trait choice.

## Future official-sheet export — FT-31, proposal only

The supplied `L5R 4th Edition Character Sheet.pdf` is **five US Letter pages (612 × 792 points)**, with **zero form fields and zero widget annotations**. It is image-based, so it has no existing editable fields to populate. All five pages were visually inspected.

| Template page | Main sections |
|---|---|
| 1 | Identity, rank/XP/Insight, Rings/Traits, Honor/Glory/Status/Taint, Skills, Initiative, Armour, Wounds, two Weapons, arrows |
| 2 | Personal details, Advantages/Disadvantages, Equipment/Money, School Techniques, miscellaneous mechanics, Kata |
| 3 | Expanded Bushi School Techniques and Kata |
| 4 | Shugenja Spells/Kiho and spell-slot tracks |
| 5 | Encountered characters, allies/enemies, locations and campaign notes |

**Feasible approach:** retain the original pages as backgrounds and place the character's existing values, calculated totals, text and marks at mapped positions. This would be a separate optional **Official sheet PDF** export in Part K, while retaining the current browser-print export. It is a new output feature, not merely Phase 15 wording or styling. The owner asked for an assessment and expressly said it need not be built now; this is not implementation approval or an addition to the committed completion estimate.

The fixed boxes cannot hold arbitrary amounts of digital content. A complete export must wrap text at a readable size and use clearly labelled continuation pages for extra Skills, emphases, equipment, detailed effects and long Background/notes. It must not silently omit or shrink away information. Data with no corresponding official box needs a labelled continuation section; missing app data should stay blank rather than be invented.

Before building, settle which supplement pages to include for each character, current versus blank play trackers, how fractions/ranks map to printed circles, A4 scaling of the Letter template, and whether the template's existing decoration matches the earlier no-Ring-art-on-paper ruling. An editable PDF would be a further choice because the supplied document has no form fields. Mapping, overflow and iPhone save/print checks need their own bounded release. No template was bundled into the app and no PDF generator was added.

## Release disposition

- **Printed Sheet Ring Layers:** owner print checks received and passed.
- **Skill Traits:** owner S1–S8 passed; FT-29 label correction deferred by the owner.
- **Phase 11.1 Export to PDF:** owner P1–P7 passed, including selected-character export, edits, cancellation and saved PDF. **FT-30 print clipping/layout remains open**, so the ledger retains a print-layout follow-up rather than declaring the entire output fully finished.
- **FT-31:** future export proposal, not an immediate build.
- This update changes records only. The application and previously recorded regression results are unchanged; no full browser regression was rerun for documentation edits.
