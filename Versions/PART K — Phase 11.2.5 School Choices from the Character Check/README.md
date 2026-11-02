# Release 8b — School choices from the character check

Approved 1 November 2026: step 3a of the 30 October work order. Starting School scrolls and free Skill choices can be completed from Manage using the creation wizard's pickers. The character check remains read-only. Each choice has an explicit School source, saved with its row; ordinary additions never acquire that source automatically.

One removable layer, `SC8`, with UI-independent record validation and a replaceable UI adapter. Production code belongs to its own fragments; shared changes are marked. Phase 15 and Release 8c are outside this release.

Older saves have no trustworthy source for these choices. Owner clarification, 1 November: fix older characters such as Kitsu from the note, following the saved work order. Explicitly selecting an existing item in the School picker assigns it without duplication. No origin is inferred from a matching name or a School tick. Saved optional row metadata is backward compatible: removing this layer leaves all Skills, scrolls and spells intact, with the predecessor's historical reporting.

Dependencies: the creation wizard and its Skills/free-choice/starting-spell extensions (Phases 11.2–11.2.4), the character validator, save collection and row constructors. The adapter reuses their current rules and pickers, including complex allotments. No new sourcebook rule is introduced. Removing an earlier wizard prerequisite requires removing this layer too.

## Acceptance checks pinned before first run

The layer harness has 30 checks. Behaviour covered: Manage-only buttons; a read-only report and opening/closing without grants; reuse of existing picker controls; a free rank and School tick; tagging in the wizard as well as Manage; explicit adoption without duplicate rows; per-School isolation; serialization and reload; deleted or renamed choices reopen; unsupported/malformed metadata never counts; old unmarked scrolls never count; fixed and complex spell allotments retain their rules; Later leaves choices outstanding; switching characters closes the picker; no script errors; phone layout and keyboard dismissal.

The original six variant cases and their exact failure IDs were pinned in `qa/variants.json` before execution. The single read-only review then identified adoption/source defects: six additional regression checks reproduced them before fixes, with eight variant cases pinned separately in `qa/review-variants.json`. All 36 positive checks pass at 4× CPU; all 14 variant cases (12 mutations and two baseline controls) match their pinned outcomes. See the release QA folder's `REVIEW.md` for the verified findings and fixes.

Four historical wizard harnesses add exact expected School source records only while `SC8.enabled()` is true. Every earlier field and check count remains unchanged. The nine affected historical harnesses pass 279/279 checks at 4× CPU. Their optional font CDN requests are aborted for logic/save comparisons, avoiding a network dependency without weakening the assertions or extending their timeouts.

The frozen candidate is SHA-256 `1eb9e017636829a941a8d9b0916fc2b0d0c81eefc97e2b8fd7d222f4ea02f322`, 17,484,443 bytes. Scratch removal passes 6/6 safety/restoration checks and restores Release 8a.1 exactly. The local committed PWA preview passes 315/315 deployment checks, 20/20 first-open/offline checks and 6/6 changed-control checks; these are local dry runs, not production deployment or owner iPhone acceptance.

Discovery passed 6,709/6,709. Both fresh full passes then passed 6,709/6,709 candidate and 6,600/6,600 retained checks, with exact predecessor restoration each time and no reused leaf result. One initial launch failed before any suite check; its evidence and guarded continuation are recorded in the release QA folder’s `PRE-SUITE-LAUNCH.md`. No failed suite was rerun. Qualification finished 2 November 2026; the branch preview is ready for owner testing, with production merge still awaiting approval. See that QA folder’s `HANDOVER.md` and device checklist.
