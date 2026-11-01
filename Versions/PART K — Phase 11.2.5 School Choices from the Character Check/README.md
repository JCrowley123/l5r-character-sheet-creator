# Release 8b — School choices from the character check

Approved 1 November 2026: step 3a of the 30 October work order. Starting School scrolls and free Skill choices can be completed from Manage using the creation wizard's pickers. The character check remains read-only. Each choice has an explicit School source, saved with its row; ordinary additions never acquire that source automatically.

One removable layer, `SC8`, with UI-independent record validation and a replaceable UI adapter. Production code belongs to its own fragments; shared changes are marked. Phase 15 and Release 8c are outside this release.

Older saves have no trustworthy source for these choices. Owner clarification, 1 November: fix older characters such as Kitsu from the note, following the saved work order. Explicitly selecting an existing item in the School picker assigns it without duplication. No origin is inferred from a matching name or a School tick. Saved optional row metadata is backward compatible: removing this layer leaves all Skills, scrolls and spells intact, with the predecessor's historical reporting.

Dependencies: the creation wizard and its Skills/free-choice/starting-spell extensions (Phases 11.2–11.2.4), the character validator, save collection and row constructors. The adapter reuses their current rules and pickers, including complex allotments. No new sourcebook rule is introduced. Removing an earlier wizard prerequisite requires removing this layer too.

## Acceptance checks pinned before first run

The layer harness has 30 checks. Behaviour covered: Manage-only buttons; a read-only report and opening/closing without grants; reuse of existing picker controls; a free rank and School tick; tagging in the wizard as well as Manage; explicit adoption without duplicate rows; per-School isolation; serialization and reload; deleted or renamed choices reopen; unsupported/malformed metadata never counts; old unmarked scrolls never count; fixed and complex spell allotments retain their rules; Later leaves choices outstanding; switching characters closes the picker; no script errors; phone layout and keyboard dismissal.

Negative mutations and exact check IDs will be written to `qa/variants.json` before the first harness execution. Counts will not be adjusted to match a test run. Historical changed expectations will be conditional on `SC8.enabled()` with their counts preserved.

Validation and measured removal results: pending implementation.
