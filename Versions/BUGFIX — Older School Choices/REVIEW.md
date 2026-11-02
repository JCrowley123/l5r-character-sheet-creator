# Release 8b.1 review and regression evidence

The original four checks reproduced the extra School grants against live Release 8b, using both the owner's unmodified save and a small Kitsu fixture. Tests use temporary browser storage. Only the purpose-built sample is included in this folder. [Original failures](qa/reproduced-8b.log) · [Fixture failures](qa/reproduced-fixture-8b.log)

## Findings from the read-only code review

| Finding | Correction | Pinned check |
|---|---|---|
| Two eligible ticked Skills could be bypassed by keeping an empty set of recorded choices. | Require a choice between eligible existing rows before another Skill can be granted. | CANNOT-BYPASS-TICKED-ROWS |
| A frozen School could inherit the active School’s casting profile. | Evaluate the held School’s own rank and affinity when reviewing its holdings. | FROZEN-SCHOOL-AFFINITY |
| A fixed grant for one unspecified Lore subject could exclude every Lore subject from the free choices. | Reserve exactly one eligible subject for each such grant. | ONE-FIXED-SUBJECT |
| A competing tick could be silently attributed to another held School. | Report the conflict for confirmation before assigning the row. | OCCUPIED-CROSS-SCHOOL-CONFLICT |
| The wizard’s grant function could be called directly after an Element was full. | Validate available entitlement at the point of grant in the wizard and in Manage. | WIZARD-CAP |

All five checks failed against the earlier build and passed against the corrected build. [Before](qa/reviewer-before-fix.log) · [After](qa/reviewer-fixes-1.log)

## Test fixtures and load preparation

The multiple-School test initially supplied Acting for a Kuni Weapon Skill slot. It now uses Kenjutsu so both Schools really can claim the same row. The cancel test’s synthetic character now includes the Kitsu Rank 1 technique which the existing importer restores. It still compares the whole character before and after cancelling. [Review checks](qa/older-review-harness.js)

The historical spelling-alias check previously used a Kitsu character to grant a Fire spell outside that School’s starting allotment. With this correction enabled it uses Agasha, which has a Fire slot. On removal it still uses Kitsu. It retains the original six assertions, including the checks on both saved rows, duplicates and reload.

Two unrelated checks share the filename `school-choices-harness.js`. The load runner selects the Release 8b check by its release folder and requires the expected number of harnesses. The first preflight stopped during harness selection. All 15 selected harnesses passed on the earlier candidate at 4× CPU slowdown. The frozen candidate adds the five reviewer checks as a sixteenth harness. [Earlier load results](qa/under-load-2/results.json)

Windows intermittently rejected an in-place rebuild while preparing the candidate. The original builder verified an isolated copy, then its output was installed by replacing the file. Each full pass independently rebuilds a scratch tree and compares it with the frozen candidate before running the suite.

At 17:14 UTC the preflight power check reported battery power before any test stage ran. The empty stage list and the candidate hash are preserved. The queued qualification uses the same hash and requires mains power. [Power-check record](qa/qualification-power-gate.json)

The dependency scanner initially read the new named ownership marker as the generic BUGFIX marker. Its exact-name pattern now recognizes OC8. Eight checks cover the name, lookalikes, unrelated fixes and existing phase markers. The source scan found each reference inside the correction’s own style or test block. [Marker and scan results](qa/dependency-marker-proof.log)
